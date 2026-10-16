import { S as e, _ as t, a as n, c as r, d as i, f as a, h as o, i as s, l as c, m as l, n as u, o as d, p as f, r as p, s as m, t as h, u as ee, y as te } from "./accountingPeriodValidation-CZo7ZwM-.js";
//#region \0rolldown/runtime.js
var ne = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports);
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
function g(e, t) {
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
function ae(e) {
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
//#region src/features/sales/data/creditNoteStorage.ts
var oe = "htt.mock.sales.credit-notes.v1", se = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, _ = (e) => typeof e == "string" && e.length > 0;
function ce(e) {
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
		].every((e) => _(t[e])) || ![
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
		].every((e) => se(i[e])) || !se(t.amountApplied) || !se(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => _(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !se(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		if (Math.abs(t - e.amountApplied) > .011) return !1;
		let n = e.refundEvents ?? [];
		if (!Array.isArray(n) || n.some((e) => !e || !_(e.id) || !_(e.date) || !se(e.amount) || e.amount <= 0 || e.reversalDate !== void 0 && !_(e.reversalDate)) || new Set(n.map((e) => e.id)).size !== n.length) return !1;
		let r = n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0);
		return !se(e.amountRefunded ?? 0) || Math.abs(r - (e.amountRefunded ?? 0)) > .011 || t + r > e.totals.total + .011 ? !1 : e.status === "VOID" ? t === 0 && r === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t - r)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function le() {
	return ie(oe, ce);
}
function v(e) {
	if (!ce(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = le();
	if (t.status === "invalid" || t.status === "unavailable" || !ae("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!g("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/lib/persistence/financialOperationJournal.ts
var ue = "htt:financial-operations:v1", de = [
	"CUSTOMER_PAYMENT",
	"PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
], fe = [
	"PENDING",
	"COMPLETED",
	"MANUAL_REVIEW"
], pe = (e) => Array.isArray(e) && e.every((e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.operationId == "string" && t.operationId.length > 0 && de.includes(String(t.kind)) && typeof t.fingerprint == "string" && t.fingerprint.length > 0 && fe.includes(String(t.state)) && typeof t.createdAt == "string" && typeof t.updatedAt == "string" && (t.resultId === void 0 || typeof t.resultId == "string") && (t.note === void 0 || typeof t.note == "string") && (t.reviewHistory === void 0 || Array.isArray(t.reviewHistory) && t.reviewHistory.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		return typeof t.reference == "string" && t.reference.length >= 3 && typeof t.operator == "string" && t.operator.length >= 2 && typeof t.recordedAt == "string" && typeof t.summary == "string" && t.summary.length >= 3;
	}));
}) && new Set(e.map((e) => e.operationId)).size === e.length;
function me() {
	let e = ie(ue, pe);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function he(e) {
	if (!ae(ue) || !g(ue, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var y = {
	list() {
		return me().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !de.includes(t)) throw Error("Invalid operation identity.");
		let r = me(), i = r.find((t) => t.operationId === e);
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
		return he([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = me(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return he(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = me(), r = n.find((t) => t.operationId === e);
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
		return he(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = me(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return he(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = me(), a = i.find((t) => t.operationId === e);
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
		return he(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = me(), a = i.find((t) => t.operationId === e);
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
		return he(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	getUnresolved() {
		return me().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
	}
};
o("financialOperations", {
	repository: y,
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
var b = /* @__PURE__ */ new Map(), ge = "htt.purchasePosting.operations.v1";
function _e() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function ve() {
	let e = _e();
	if (e) try {
		e.setItem(ge, JSON.stringify([...b.values()]));
	} catch {}
}
function ye() {
	let e = _e();
	if (e) try {
		let t = JSON.parse(e.getItem(ge) ?? "[]");
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
			b.set(t.key, {
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
ye();
var be = /* @__PURE__ */ new Set(), xe = /* @__PURE__ */ new Map(), Se = /* @__PURE__ */ new Map(), Ce;
function we() {
	ve(), be.forEach((e) => e());
}
var x = {
	injectFailureBeforeStep(e, t, n = 1) {
		Se.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		Se.clear();
	},
	registerRecovery(e, t) {
		if (!b.has(e)) throw Error(`Unknown posting operation: ${e}`);
		xe.set(e, t);
	},
	runStep(e, t, n) {
		let r = b.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = Se.get(i) ?? 0;
		if (a > 0) throw Se.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return xe.has(e);
	},
	recover(e) {
		let t = b.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = xe.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (Ce === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		Ce = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			Ce = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = b.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...b.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return be.add(e), () => {
			be.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if (b.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return b.set(n, r), we(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = b.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		b.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), we();
	},
	completeStep(e, t) {
		let n = b.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (b.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), we());
	}
};
o("purchaseOperations", {
	repository: x,
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
	snapshot: () => x.getAll(),
	restore: (e) => {
		b.clear(), xe.clear();
		for (let t of e) b.set(t.key, t);
	},
	publish: () => be.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var Te = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Ee(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${Te.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function S() {
	Ee(y.list(), x.getAll());
}
//#endregion
//#region node_modules/.pnpm/react@19.3.0/node_modules/react/cjs/react.production.js
var De = /* @__PURE__ */ ne(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.for("react.view_transition"), m = Symbol.iterator;
	function h(e) {
		return typeof e != "object" || !e ? null : (e = m && e[m] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var ee = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, te = Object.assign, ne = {};
	function re(e, t, n) {
		this.props = e, this.context = t, this.refs = ne, this.updater = n || ee;
	}
	re.prototype.isReactComponent = {}, re.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, re.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function ie() {}
	ie.prototype = re.prototype;
	function g(e, t, n) {
		this.props = e, this.context = t, this.refs = ne, this.updater = n || ee;
	}
	var ae = g.prototype = new ie();
	ae.constructor = g, te(ae, re.prototype), ae.isPureReactComponent = !0;
	var oe = Array.isArray;
	function se() {}
	var _ = {
		H: null,
		A: null,
		T: null,
		S: null
	}, ce = Object.prototype.hasOwnProperty;
	function le(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function v(e, t) {
		return le(e.type, t, e.props);
	}
	function ue(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function de(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var fe = /\/+/g;
	function pe(e, t) {
		return typeof e == "object" && e && e.key != null ? de("" + e.key) : t.toString(36);
	}
	function me(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(se, se) : (e.status = "pending", e.then(function(t) {
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
	function he(e, r, i, a, o) {
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
				case d: return c = e._init, he(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + pe(e, 0) : a, oe(o) ? (i = "", c != null && (i = c.replace(fe, "$&/") + "/"), he(o, r, i, "", function(e) {
			return e;
		})) : o != null && (ue(o) && (o = v(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(fe, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (oe(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + pe(a, u), c += he(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + pe(a, u++), c += he(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return he(me(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function y(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return he(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function b(e) {
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
	var ge = typeof reportError == "function" ? reportError : function(e) {
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
	function _e(e) {
		var t = _.T, n = {};
		n.types = t === null ? null : t.types, _.T = n;
		try {
			var r = e(), i = _.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(se, ge);
		} catch (e) {
			ge(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), _.T = t;
		}
	}
	function ve(e) {
		var t = _.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else _e(ve.bind(null, e));
	}
	var ye = {
		map: y,
		forEach: function(e, t, n) {
			y(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return y(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return y(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!ue(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = ye, e.Component = re, e.Fragment = r, e.Profiler = a, e.PureComponent = g, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = _, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return _.H.useMemoCache(e);
		}
	}, e.addTransitionType = ve, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = te({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !ce.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return le(e.type, i, r);
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
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) ce.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return le(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = ue, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: b
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = _e, e.unstable_useCacheRefresh = function() {
		return _.H.useCacheRefresh();
	}, e.use = function(e) {
		return _.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return _.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return _.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return _.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return _.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return _.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return _.H.useEffectEvent(e);
	}, e.useId = function() {
		return _.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return _.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return _.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return _.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return _.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return _.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return _.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return _.H.useRef(e);
	}, e.useState = function(e) {
		return _.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return _.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return _.H.useTransition();
	}, e.version = "19.3.0";
})), Oe = /* @__PURE__ */ ne(((e, t) => {
	process.env.NODE_ENV !== "production" && (function() {
		function n(e, t) {
			Object.defineProperty(a.prototype, e, { get: function() {
				console.warn("%s(...) is deprecated in plain JavaScript React classes. %s", t[0], t[1]);
			} });
		}
		function r(e) {
			return typeof e != "object" || !e ? null : (e = Oe && e[Oe] || e["@@iterator"], typeof e == "function" ? e : null);
		}
		function i(e, t) {
			e = (e = e.constructor) && (e.displayName || e.name) || "ReactClass";
			var n = e + "." + t;
			ke[n] || (console.error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", t, e), ke[n] = !0);
		}
		function a(e, t, n) {
			this.props = e, this.context = t, this.refs = Me, this.updater = n || Ae;
		}
		function o() {}
		function s(e, t, n) {
			this.props = e, this.context = t, this.refs = Me, this.updater = n || Ae;
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
			if (typeof e == "function") return e.$$typeof === Fe ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case ve: return "Fragment";
				case be: return "Profiler";
				case ye: return "StrictMode";
				case we: return "Suspense";
				case x: return "SuspenseList";
				case S: return "Activity";
				case De: return "ViewTransition";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case _e: return "Portal";
				case Se: return e.displayName || "Context";
				case xe: return (e._context.displayName || "Context") + ".Consumer";
				case Ce:
					var t = e.render;
					return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case Te: return t = e.displayName || null, t === null ? d(e.type) || "Memo" : t;
				case Ee:
					t = e._payload, e = e._init;
					try {
						return d(e(t));
					} catch {}
			}
			return null;
		}
		function f(e) {
			if (e === ve) return "<>";
			if (typeof e == "object" && e && e.$$typeof === Ee) return "<...>";
			try {
				var t = d(e);
				return t ? "<" + t + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function p() {
			var e = C.A;
			return e === null ? null : e.getOwner();
		}
		function m() {
			return Error("react-stack-top-frame");
		}
		function h(e) {
			if (Ie.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function ee(e, t) {
			function n() {
				Re || (Re = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function te() {
			var e = d(this.type);
			return Be[e] || (Be[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function ne(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: ge,
				type: e,
				key: t,
				props: n,
				_owner: r
			}, (o === void 0 ? null : o) === null ? Object.defineProperty(e, "ref", {
				enumerable: !1,
				value: null
			}) : Object.defineProperty(e, "ref", {
				enumerable: !1,
				get: te
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
		function re(e, t) {
			return t = ne(e.type, t, e.props, e._owner, e._debugStack, e._debugTask), e._store && (t._store.validated = e._store.validated), t;
		}
		function ie(e) {
			g(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === Ee && (e._payload.status === "fulfilled" ? g(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function g(e) {
			return typeof e == "object" && !!e && e.$$typeof === ge;
		}
		function ae(e) {
			var t = {
				"=": "=0",
				":": "=2"
			};
			return "$" + e.replace(/[=:]/g, function(e) {
				return t[e];
			});
		}
		function oe(e, t) {
			return typeof e == "object" && e && e.key != null ? (u(e.key), ae("" + e.key)) : t.toString(36);
		}
		function se(e) {
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
		function _(e, t, n, i, a) {
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
					case ge:
					case _e:
						s = !0;
						break;
					case Ee: return s = e._init, _(s(e._payload), t, n, i, a);
				}
			}
			if (s) {
				s = e, a = a(s);
				var c = i === "" ? "." + oe(s, 0) : i;
				return Pe(a) ? (n = "", c != null && (n = c.replace(We, "$&/") + "/"), _(a, t, n, "", function(e) {
					return e;
				})) : a != null && (g(a) && (a.key != null && (s && s.key === a.key || u(a.key)), n = re(a, n + (a.key == null || s && s.key === a.key ? "" : ("" + a.key).replace(We, "$&/") + "/") + c), i !== "" && s != null && g(s) && s.key == null && s._store && !s._store.validated && (n._store.validated = 2), a = n), t.push(a)), 1;
			}
			if (s = 0, c = i === "" ? "." : i + ":", Pe(e)) for (var l = 0; l < e.length; l++) i = e[l], o = c + oe(i, l), s += _(i, t, n, o, a);
			else if (l = r(e), typeof l == "function") for (l === e.entries && (Ue || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Ue = !0), e = l.call(e), l = 0; !(i = e.next()).done;) i = i.value, o = c + oe(i, l++), s += _(i, t, n, o, a);
			else if (o === "object") {
				if (typeof e.then == "function") return _(se(e), t, n, i, a);
				throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
			}
			return s;
		}
		function ce(e, t, n) {
			if (e == null) return e;
			var r = [], i = 0;
			return _(e, r, "", "", function(e) {
				return t.call(n, e, i++);
			}), r;
		}
		function le(e) {
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
		function v() {
			var e = C.H;
			return e === null && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."), e;
		}
		function ue() {
			C.asyncTransitions--;
		}
		function de(e) {
			var t = C.T, n = {};
			n.types = t === null ? null : t.types, n._updatedFibers = /* @__PURE__ */ new Set(), C.T = n;
			try {
				var r = e(), i = C.S;
				i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && (C.asyncTransitions++, r.then(ue, ue), r.then(c, Ge));
			} catch (e) {
				Ge(e);
			} finally {
				t === null && n._updatedFibers && (e = n._updatedFibers.size, n._updatedFibers.clear(), 10 < e && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), t !== null && n.types !== null && (t.types !== null && t.types !== n.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), t.types = n.types), C.T = t;
			}
		}
		function fe(e) {
			var t = C.T;
			if (t !== null) {
				var n = t.types;
				n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
			} else C.asyncTransitions === 0 && console.error("addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition."), de(fe.bind(null, e));
		}
		function pe(e) {
			if (qe === null) try {
				var n = ("require" + Math.random()).slice(0, 7);
				qe = (t && t[n]).call(t, "timers").setImmediate;
			} catch {
				qe = function(e) {
					!1 === Ke && (Ke = !0, typeof MessageChannel > "u" && console.error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
					var t = new MessageChannel();
					t.port1.onmessage = e, t.port2.postMessage(void 0);
				};
			}
			return qe(e);
		}
		function me(e) {
			return 1 < e.length && typeof AggregateError == "function" ? AggregateError(e) : e[0];
		}
		function he(e, t) {
			t !== Je - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), Je = t;
		}
		function y(e, t, n) {
			var r = C.actQueue;
			if (r !== null) {
				if (r.length !== 0) try {
					b(r), pe(function() {
						return y(e, t, n);
					});
					return;
				} catch (e) {
					C.thrownErrors.push(e);
				}
				else C.actQueue = null;
			}
			0 < C.thrownErrors.length ? (r = me(C.thrownErrors), C.thrownErrors.length = 0, n(r)) : t(e);
		}
		function b(e) {
			if (!Xe) {
				Xe = !0;
				var t = 0;
				try {
					for (; t < e.length; t++) {
						var n = e[t];
						do {
							C.didUsePromise = !1;
							var r = n(!1);
							if (r !== null) {
								if (C.didUsePromise) {
									e[t] = n, e.splice(0, t);
									return;
								}
								n = r;
							} else break;
						} while (1);
					}
					e.length = 0;
				} catch (n) {
					e.splice(0, t + 1), C.thrownErrors.push(n);
				} finally {
					Xe = !1;
				}
			}
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var ge = Symbol.for("react.transitional.element"), _e = Symbol.for("react.portal"), ve = Symbol.for("react.fragment"), ye = Symbol.for("react.strict_mode"), be = Symbol.for("react.profiler"), xe = Symbol.for("react.consumer"), Se = Symbol.for("react.context"), Ce = Symbol.for("react.forward_ref"), we = Symbol.for("react.suspense"), x = Symbol.for("react.suspense_list"), Te = Symbol.for("react.memo"), Ee = Symbol.for("react.lazy"), S = Symbol.for("react.activity"), De = Symbol.for("react.view_transition"), Oe = Symbol.iterator, ke = {}, Ae = {
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
		}, je = Object.assign, Me = {};
		Object.freeze(Me), a.prototype.isReactComponent = {}, a.prototype.setState = function(e, t) {
			if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
			this.updater.enqueueSetState(this, e, t, "setState");
		}, a.prototype.forceUpdate = function(e) {
			this.updater.enqueueForceUpdate(this, e, "forceUpdate");
		};
		var Ne = {
			isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
			replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
		};
		for (Qe in Ne) Ne.hasOwnProperty(Qe) && n(Qe, Ne[Qe]);
		o.prototype = a.prototype, Ne = s.prototype = new o(), Ne.constructor = s, je(Ne, a.prototype), Ne.isPureReactComponent = !0;
		var Pe = Array.isArray, Fe = Symbol.for("react.client.reference"), C = {
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
		}, Ie = Object.prototype.hasOwnProperty, Le = console.createTask ? console.createTask : function() {
			return null;
		};
		Ne = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var Re, ze, Be = {}, Ve = Ne.react_stack_bottom_frame.bind(Ne, m)(), He = Le(f(m)), Ue = !1, We = /\/+/g, Ge = typeof reportError == "function" ? reportError : function(e) {
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
		}, Ke = !1, qe = null, Je = 0, Ye = !1, Xe = !1, Ze = typeof queueMicrotask == "function" ? function(e) {
			queueMicrotask(function() {
				return queueMicrotask(e);
			});
		} : pe;
		Ne = Object.freeze({
			__proto__: null,
			c: function(e) {
				return v().useMemoCache(e);
			}
		});
		var Qe = {
			map: ce,
			forEach: function(e, t, n) {
				ce(e, function() {
					t.apply(this, arguments);
				}, n);
			},
			count: function(e) {
				var t = 0;
				return ce(e, function() {
					t++;
				}), t;
			},
			toArray: function(e) {
				return ce(e, function(e) {
					return e;
				}) || [];
			},
			only: function(e) {
				if (!g(e)) throw Error("React.Children.only expected to receive a single React element child.");
				return e;
			}
		};
		e.Activity = S, e.Children = Qe, e.Component = a, e.Fragment = ve, e.Profiler = be, e.PureComponent = s, e.StrictMode = ye, e.Suspense = we, e.ViewTransition = De, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = C, e.__COMPILER_RUNTIME = Ne, e.act = function(e) {
			var t = C.actQueue, n = Je;
			Je++;
			var r = C.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				C.thrownErrors.push(e);
			}
			if (0 < C.thrownErrors.length) throw he(t, n), e = me(C.thrownErrors), C.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return Ze(function() {
					i || Ye || (Ye = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				}), { then: function(e, a) {
					i = !0, o.then(function(i) {
						if (he(t, n), n === 0) {
							try {
								b(r), pe(function() {
									return y(i, e, a);
								});
							} catch (e) {
								C.thrownErrors.push(e);
							}
							if (0 < C.thrownErrors.length) {
								var o = me(C.thrownErrors);
								C.thrownErrors.length = 0, a(o);
							}
						} else e(i);
					}, function(e) {
						he(t, n), 0 < C.thrownErrors.length ? (e = me(C.thrownErrors), C.thrownErrors.length = 0, a(e)) : a(e);
					});
				} };
			}
			var s = a;
			if (he(t, n), n === 0 && (b(r), r.length !== 0 && Ze(function() {
				i || Ye || (Ye = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), C.actQueue = null), 0 < C.thrownErrors.length) throw e = me(C.thrownErrors), C.thrownErrors.length = 0, e;
			return { then: function(e, t) {
				i = !0, n === 0 ? (C.actQueue = r, pe(function() {
					return y(s, e, t);
				})) : e(s);
			} };
		}, e.addTransitionType = fe, e.cache = function(e) {
			return function() {
				return e.apply(null, arguments);
			};
		}, e.cacheSignal = function() {
			return null;
		}, e.captureOwnerStack = function() {
			var e = C.getCurrentStack;
			return e === null ? null : e();
		}, e.cloneElement = function(e, t, n) {
			if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
			var r = je({}, e.props), i = e.key, a = e._owner;
			if (t != null) {
				var o;
				a: {
					if (Ie.call(t, "ref") && (o = Object.getOwnPropertyDescriptor(t, "ref").get) && o.isReactWarning) {
						o = !1;
						break a;
					}
					o = t.ref !== void 0;
				}
				for (s in o && (a = p()), h(t) && (u(t.key), i = "" + t.key), t) !Ie.call(t, s) || s === "key" || s === "__self" || s === "__source" || s === "ref" && t.ref === void 0 || (r[s] = t[s]);
			}
			var s = arguments.length - 2;
			if (s === 1) r.children = n;
			else if (1 < s) {
				o = Array(s);
				for (var c = 0; c < s; c++) o[c] = arguments[c + 2];
				r.children = o;
			}
			for (r = ne(e.type, i, r, a, e._debugStack, e._debugTask), i = 2; i < arguments.length; i++) ie(arguments[i]);
			return r;
		}, e.createContext = function(e) {
			return e = {
				$$typeof: Se,
				_currentValue: e,
				_currentValue2: e,
				_threadCount: 0,
				Provider: null,
				Consumer: null
			}, e.Provider = e, e.Consumer = {
				$$typeof: xe,
				_context: e
			}, e._currentRenderer = null, e._currentRenderer2 = null, e;
		}, e.createElement = function(e, t, n) {
			for (var r = 2; r < arguments.length; r++) ie(arguments[r]);
			var i;
			r = {};
			var a = null;
			if (t != null) for (i in ze || !("__self" in t) || "key" in t || (ze = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), h(t) && (u(t.key), a = "" + t.key), t) Ie.call(t, i) && i !== "key" && i !== "__self" && i !== "__source" && (r[i] = t[i]);
			var o = arguments.length - 2;
			if (o === 1) r.children = n;
			else if (1 < o) {
				for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
				Object.freeze && Object.freeze(s), r.children = s;
			}
			if (e && e.defaultProps) for (i in o = e.defaultProps, o) r[i] === void 0 && (r[i] = o[i]);
			return a && ee(r, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), (i = 1e4 > C.recentlyCreatedOwnerStacks++) ? (s = Error.stackTraceLimit, Error.stackTraceLimit = 10, o = Error("react-stack-top-frame"), Error.stackTraceLimit = s) : o = Ve, ne(e, a, r, p(), o, i ? Le(f(e)) : He);
		}, e.createRef = function() {
			var e = { current: null };
			return Object.seal(e), e;
		}, e.forwardRef = function(e) {
			e != null && e.$$typeof === Te ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e == "function" ? e.length !== 0 && e.length !== 2 && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.") : console.error("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e), e != null && e.defaultProps != null && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
			var t = {
				$$typeof: Ce,
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
		}, e.isValidElement = g, e.lazy = function(e) {
			e = {
				_status: -1,
				_result: e
			};
			var t = {
				$$typeof: Ee,
				_payload: e,
				_init: le
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
				$$typeof: Te,
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
		}, e.startTransition = de, e.unstable_useCacheRefresh = function() {
			return v().useCacheRefresh();
		}, e.use = function(e) {
			return v().use(e);
		}, e.useActionState = function(e, t, n) {
			return v().useActionState(e, t, n);
		}, e.useCallback = function(e, t) {
			return v().useCallback(e, t);
		}, e.useContext = function(e) {
			var t = v();
			return e.$$typeof === xe && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"), t.useContext(e);
		}, e.useDebugValue = function(e, t) {
			return v().useDebugValue(e, t);
		}, e.useDeferredValue = function(e, t) {
			return v().useDeferredValue(e, t);
		}, e.useEffect = function(e, t) {
			return e ?? console.warn("React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"), v().useEffect(e, t);
		}, e.useEffectEvent = function(e) {
			return v().useEffectEvent(e);
		}, e.useId = function() {
			return v().useId();
		}, e.useImperativeHandle = function(e, t, n) {
			return v().useImperativeHandle(e, t, n);
		}, e.useInsertionEffect = function(e, t) {
			return e ?? console.warn("React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"), v().useInsertionEffect(e, t);
		}, e.useLayoutEffect = function(e, t) {
			return e ?? console.warn("React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"), v().useLayoutEffect(e, t);
		}, e.useMemo = function(e, t) {
			return v().useMemo(e, t);
		}, e.useOptimistic = function(e, t) {
			return v().useOptimistic(e, t);
		}, e.useReducer = function(e, t, n) {
			return v().useReducer(e, t, n);
		}, e.useRef = function(e) {
			return v().useRef(e);
		}, e.useState = function(e) {
			return v().useState(e);
		}, e.useSyncExternalStore = function(e, t, n) {
			return v().useSyncExternalStore(e, t, n);
		}, e.useTransition = function() {
			return v().useTransition();
		}, e.version = "19.3.0", typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
})), ke = /* @__PURE__ */ ne(((e, t) => {
	t.exports = process.env.NODE_ENV === "production" ? De() : Oe();
}));
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/util.js
function Ae(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function je(e, t = "|") {
	return e.map((e) => tt(e)).join(t);
}
function Me(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
var Ne = class {
	constructor(e) {
		this._getter = e, this._value = void 0;
	}
	get value() {
		let e = this._getter;
		return e !== void 0 && (this._value = e(), this._getter = void 0), this._value;
	}
};
function Pe(e) {
	return new Ne(e);
}
function Fe(e) {
	return e == null;
}
function C(e) {
	let t = +!!e.startsWith("^"), n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function Ie(e, t) {
	let n = e / t, r = Math.round(n), i = 4 * 2 ** -52 * Math.max(Math.abs(n), 1);
	return Math.abs(n - r) < i ? 0 : n - r;
}
function Le(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function Re(e) {
	let t = Object.getOwnPropertyDescriptor(e, "shape");
	return t?.get ? t.get.raw : t?.value;
}
function ze(e) {
	return Re(e._zod.def) ?? e._zod.def.shape;
}
function Be(e, t, n) {
	Object.defineProperty(e, t, {
		get() {
			let e = n();
			return Le(this, t, e), e;
		},
		enumerable: !0,
		configurable: !0
	});
}
function Ve(e, t, n) {
	t in e ? Le(e, t, n) : e[t] = n;
}
function He(e, t, n, r) {
	let i = ze(t);
	for (let a of n) {
		let n = Object.getOwnPropertyDescriptor(i, a);
		n.enumerable && (n.get ? Be(e, a, () => {
			let e = t._zod.def.shape[a];
			return r ? r(e, a) : e;
		}) : Ve(e, a, r ? r(n.value, a) : n.value));
	}
}
function Ue(e, t) {
	for (let n of Reflect.ownKeys(t)) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.enumerable && (r.get ? Be(e, n, () => t[n]) : Ve(e, n, r.value));
	}
}
function We(...e) {
	let t = {};
	for (let n of e) {
		let e = Object.getOwnPropertyDescriptors(n);
		Object.assign(t, e);
	}
	return Object.defineProperties({}, t);
}
function Ge(e) {
	return JSON.stringify(e);
}
function Ke(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var qe = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function Je(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var Ye = /* @__PURE__*/ Pe(() => {
	if (Ut.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function Xe(e) {
	if (Je(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return Je(n) !== !1 && Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") !== !1;
}
function Ze(e) {
	return Xe(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var Qe = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function $e(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function et(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n?.parent) && (r._zod.parent = e), r;
}
function w(e) {
	let t = e;
	if (!t) return {};
	if (typeof t == "string") return { error: () => t };
	if (t?.message !== void 0) {
		if (t?.error !== void 0) throw Error("Cannot specify both `message` and `error` params");
		t.error = t.message;
	}
	return delete t.message, typeof t.error == "string" ? {
		...t,
		error: () => t.error
	} : t;
}
function tt(e) {
	return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function nt(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
var rt = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, it = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function at(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	let i = {};
	return He(i, e, ot(e, t)), et(e, We(n, {
		shape: i,
		checks: []
	}));
}
function ot(e, t) {
	let n = ze(e), r = [];
	for (let e of Reflect.ownKeys(t)) {
		if (!Object.getOwnPropertyDescriptor(n, e)?.enumerable) throw Error(`Unrecognized key: "${String(e)}"`);
		t[e] && r.push(e);
	}
	return r;
}
function st(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	let i = new Set(ot(e, t)), a = {};
	return He(a, e, Reflect.ownKeys(ze(e)).filter((e) => !i.has(e))), et(e, We(n, {
		shape: a,
		checks: []
	}));
}
function ct(e, t) {
	if (!Xe(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = ze(e);
		for (let e of Reflect.ownKeys(t)) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return et(e, We(e._zod.def, { shape: lt(e, t) }));
}
function lt(e, t) {
	let n = {};
	return He(n, e, Reflect.ownKeys(ze(e))), Ue(n, t), n;
}
function ut(e, t) {
	if (!Xe(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return et(e, We(e._zod.def, { shape: lt(e, t) }));
}
function dt(e, t) {
	if (!t?._zod?.def) throw Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (e._zod.def.checks?.length) throw Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	let n = {};
	return He(n, e, Reflect.ownKeys(ze(e))), He(n, t, Reflect.ownKeys(ze(t))), et(e, We(e._zod.def, {
		shape: n,
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: t._zod.def.checks ?? []
	}));
}
function ft(e, t, n, r = "partial") {
	let i = t._zod.def.checks;
	if (i && i.length > 0) throw Error(`.${r}() cannot be used on object schemas containing refinements`);
	let a = n ? new Set(ot(t, n)) : void 0, o = {};
	return He(o, t, Reflect.ownKeys(ze(t)), e && ((t, n) => a && !a.has(n) ? t : new e({
		type: "optional",
		innerType: t
	}))), et(t, We(t._zod.def, {
		shape: o,
		checks: []
	}));
}
function pt(e, t, n) {
	let r = n ? new Set(ot(t, n)) : void 0, i = {};
	return He(i, t, Reflect.ownKeys(ze(t)), (t, n) => r && !r.has(n) ? t : new e({
		type: "nonoptional",
		innerType: t
	})), et(t, We(t._zod.def, { shape: i }));
}
function mt(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function ht(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
	return !1;
}
function gt(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function _t(e) {
	return typeof e == "string" ? e : e?.message;
}
function vt(e, t, n) {
	var r;
	for (let i = t; i < e.length; i++) (r = e[i]).schema ?? (r.schema = n);
}
function yt(e, t, n) {
	var r;
	let i = e.inst?._zod?.traits;
	i?.has("$ZodType") && (i.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
	let a = e.schema === e.inst ? void 0 : e.schema?._zod.def?.error, o = e.message ? e.message : _t(e.inst?._zod.def?.error?.(e)) ?? _t(a?.(e)) ?? _t(t?.error?.(e)) ?? _t(n.customError?.(e)) ?? _t(n.localeError?.(e)) ?? "Invalid input", s = {};
	for (let t of Object.keys(e)) t !== "inst" && t !== "schema" && t !== "continue" && t !== "input" && t !== "__proto__" && (s[t] = e[t]);
	return s.path ??= [], s.message = o, t?.reportInput && (s.input = e.input), s;
}
var bt = /[\uD800-\uDBFF]/;
function xt(e) {
	let t = e.length;
	if (!bt.test(e)) return t;
	let n = t;
	for (let r = 0; r < t - 1; r++) (e.charCodeAt(r) & 64512) == 55296 && (e.charCodeAt(r + 1) & 64512) == 56320 && (n--, r++);
	return n;
}
function St(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Ct(e) {
	let t = typeof e;
	switch (t) {
		case "number": return Number.isNaN(e) ? "nan" : "number";
		case "object": {
			if (e === null) return "null";
			if (Array.isArray(e)) return "array";
			let t = e;
			if (t && Object.getPrototypeOf(t) !== Object.prototype && "constructor" in t && t.constructor) return t.constructor.name;
		}
	}
	return t;
}
function wt(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
function Tt(e, t) {
	for (let n in t) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.get ? Object.defineProperty(e, n, {
			...r,
			enumerable: !1
		}) : kt(e, n, r.value);
	}
}
function Et(e, t, n, r = !0) {
	return Object.defineProperty(e, t, {
		configurable: !0,
		writable: !0,
		enumerable: r,
		value: n
	}), n;
}
function Dt(e, t, n) {
	return Et(e, t, n, !1);
}
function Ot(e, t) {
	for (let n in e) {
		let r = e[n];
		Object.defineProperty(t, n, {
			configurable: !0,
			enumerable: !0,
			get() {
				return Et(this, n, r(this));
			},
			set(e) {
				Et(this, n, e);
			}
		});
	}
	return t;
}
function kt(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		get() {
			return this == null ? n : Et(this, t, n.bind(this));
		},
		set(e) {
			Et(this, t, e);
		}
	});
}
function At(e, t) {
	let n = Object.getPrototypeOf(e);
	return t in n ? void 0 : n;
}
var jt, Mt = !1, Nt = {
	configurable: !0,
	get() {
		Mt = !0;
	}
};
function T(e, t, n) {
	let r = Object.getPrototypeOf(e._zod);
	if (t in r && jt !== e._zod) {
		jt = void 0;
		return;
	}
	jt = e._zod, Object.defineProperty(r, t, {
		configurable: !0,
		get() {
			Object.defineProperty(this, t, Nt);
			let e = Mt;
			Mt = !1;
			try {
				let r = n(this);
				return Mt ? delete this[t] : Object.defineProperty(this, t, {
					configurable: !0,
					writable: !0,
					value: r
				}), Mt ||= e, r;
			} catch (n) {
				throw delete this[t], Mt ||= e, n;
			}
		},
		set(e) {
			Object.defineProperty(this, t, {
				configurable: !0,
				writable: !0,
				value: e
			});
		}
	});
}
function Pt(e, t, n, r) {
	let i = At(e, t);
	i && Object.defineProperty(i, t, {
		configurable: !0,
		get() {
			let e = {
				configurable: !0,
				writable: !0,
				enumerable: r,
				value: void 0
			};
			return Object.defineProperty(this, t, e), e.value = n(this), Object.defineProperty(this, t, e), e.value;
		},
		set(e) {
			Object.defineProperty(this, t, {
				configurable: !0,
				writable: !0,
				enumerable: r,
				value: e
			});
		}
	});
}
var Ft = "~constantCatch";
function It(e) {
	let t = () => e;
	return t[Ft] = !0, t;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/core.js
var Lt, Rt = {
	value: void 0,
	enumerable: !1
}, zt = "captureStackTrace" in Error ? Error : null;
function Bt(e) {
	let t = zt;
	if (t) {
		let n = t.stackTraceLimit;
		if (typeof n == "number") {
			try {
				t.stackTraceLimit = 0;
			} catch {
				return zt = null, new e();
			}
			try {
				return new e();
			} finally {
				t.stackTraceLimit = n;
			}
		}
	}
	return new e();
}
function E(e, t, n, r) {
	let i = {};
	function a(e) {
		this.def = e, this.constr = d, this.traits = /* @__PURE__ */ new Set();
	}
	a.prototype = i;
	let o = n, s = o && /* @__PURE__ */ new WeakSet();
	function c(n, r) {
		if (!n._zod) {
			Rt.value = new a(r);
			try {
				Object.defineProperty(n, "_zod", Rt);
			} finally {
				Rt.value = void 0;
			}
		} else if (n._zod.traits.has(e)) return;
		if (n._zod.traits.add(e), t(n, r), s) {
			let e = Object.getPrototypeOf(n), t = n._zod.constr.prototype, r = e;
			for (; r && r !== t;) r = Object.getPrototypeOf(r);
			let i = r ?? e;
			s.has(i) || (s.add(i), Tt(i, o));
		}
		let i = d.prototype;
		for (let e in i) Object.prototype.hasOwnProperty.call(i, e) && (e in n || (n[e] = i[e].bind(n)));
	}
	let l = r?.Parent ?? Object;
	class u extends l {}
	Object.defineProperty(u, "name", { value: e });
	function d(e) {
		let t = r?.Parent ? Bt(u) : this;
		c(t, e);
		let n = t._zod.deferred;
		if (n) {
			for (let e of n) e();
			t._zod.deferred = void 0;
		}
		let i = globalThis.__zod_globalConfig?.postProcessor;
		return i && i(t), t;
	}
	return Object.defineProperty(d, "init", { value: c }), Object.defineProperty(d, Symbol.hasInstance, { value: (t) => r?.Parent && t instanceof r.Parent ? !0 : t?._zod?.traits?.has(e) }), Object.defineProperty(d, "name", { value: e }), d;
}
var Vt = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, Ht = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(Lt = globalThis).__zod_globalConfig ?? (Lt.__zod_globalConfig = {});
var Ut = globalThis.__zod_globalConfig;
function Wt(e) {
	return e && Object.assign(Ut, e), Ut;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/errors.js
function Gt() {
	let e = this._zod;
	return e.message ??= JSON.stringify(e.def, Me, 2), e.message;
}
function Kt(e) {
	this._zod.message = e;
}
var qt = {
	get: Gt,
	set: Kt,
	enumerable: !0,
	configurable: !0
}, Jt = {
	value: void 0,
	enumerable: !1
}, Yt = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), Xt = (e, t) => {
	e.name = "$ZodError", Jt.value = t, Object.defineProperty(e, "issues", Jt), Jt.value = void 0, Object.defineProperty(e, "message", qt);
	let n = Object.getPrototypeOf(e);
	Yt.has(n) || (Yt.add(n), Object.defineProperty(n, "toString", {
		configurable: !0,
		enumerable: !1,
		get() {
			let e = () => this.message;
			return Object.defineProperty(this, "toString", {
				value: e,
				configurable: !0,
				writable: !0
			}), e;
		},
		set(e) {
			Object.defineProperty(this, "toString", {
				value: e,
				configurable: !0,
				writable: !0
			});
		}
	}));
}, Zt = E("$ZodError", Xt);
E("$ZodError", Xt, void 0, { Parent: Error });
function Qt(e, t, n) {
	return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, {
		value: n(),
		writable: !0,
		enumerable: !0,
		configurable: !0
	}) : e[t] = n()), e[t];
}
function $t(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? Qt(n, i.path[0], () => []).push(t(i)) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function en(e, t = (e) => e.message) {
	let n = { _errors: [] }, r = (e, i = []) => {
		for (let a of e.issues) if (a.code === "invalid_union" && a.errors.length) a.errors.map((e) => r({ issues: e }, [...i, ...a.path]));
		else if (a.code === "invalid_key") r({ issues: a.issues }, [...i, ...a.path]);
		else if (a.code === "invalid_element") r({ issues: a.issues }, [...i, ...a.path]);
		else {
			let e = [...i, ...a.path];
			if (e.length === 0) n._errors.push(t(a));
			else {
				let r = n, i = 0;
				for (; i < e.length;) {
					let n = e[i], o = i === e.length - 1;
					if (n === "_errors") {
						o && r._errors.push(t(a)), i++;
						continue;
					}
					Object.prototype.hasOwnProperty.call(r, n) || Object.defineProperty(r, n, {
						value: { _errors: [] },
						enumerable: !0,
						writable: !0,
						configurable: !0
					});
					let s = r[n];
					o && s._errors.push(t(a)), r = s, i++;
				}
			}
		}
	};
	return r(e), n;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/parse.js
function tn(e, t) {
	return {
		callee: t?.callee ?? e,
		Err: t?.Err
	};
}
var nn = (e) => {
	let t = (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !1
		} : { async: !1 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise) throw new Vt();
		if (s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => yt(e, o, Wt())));
			throw qe(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, rn = (e) => {
	let t = async (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !0
		} : { async: !0 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise && (s = await s), s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => yt(e, o, Wt())));
			throw qe(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, an = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new Vt();
	return a.issues.length ? on(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
};
function on(e, t, n) {
	let r;
	return {
		success: !1,
		get error() {
			return r || (r = new e(t.map((e) => yt(e, n, Wt()))), t = void 0, n = void 0), r;
		},
		set error(e) {
			r = e, t = void 0, n = void 0;
		}
	};
}
var sn = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		async: !0
	} : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? on(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
}, cn = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), ln = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), un = ((e, t, n) => {
	let r = e._zod.bag.validator;
	if (r !== void 0) {
		if (r(t) !== cn) return !0;
		if (r.definite === !0 && n === void 0) return !1;
	}
	return dn(e, t, n);
});
function dn(e, t, n) {
	let r = n ? {
		...n,
		async: !1,
		abortEarly: !0
	} : {
		async: !1,
		abortEarly: !0
	}, i = e._zod.bag.fallbackRun, a;
	if (i ? (r[ln] = !0, a = i({
		value: t,
		issues: []
	}, r)) : a = e._zod.run({
		value: t,
		issues: []
	}, r), a instanceof Promise) throw new Vt();
	return a.issues.length === 0;
}
var fn = async (e, t, n) => {
	let r = n ? {
		...n,
		async: !0,
		abortEarly: !0
	} : {
		async: !0,
		abortEarly: !0
	}, i = e._zod.run({
		value: t,
		issues: []
	}, r);
	return i instanceof Promise && (i = await i), i.issues.length === 0;
}, pn = (e) => {
	let t = nn(e), n = (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return t(e, r, o, tn(n, a));
	};
	return n;
}, mn = (e) => {
	let t = nn(e), n = (e, r, i, a) => t(e, r, i, tn(n, a));
	return n;
}, hn = (e) => {
	let t = rn(e), n = async (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return await t(e, r, o, tn(n, a));
	};
	return n;
}, gn = (e) => {
	let t = rn(e), n = async (e, r, i, a) => await t(e, r, i, tn(n, a));
	return n;
}, _n = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return an(e)(t, n, i);
}, vn = (e) => (t, n, r) => an(e)(t, n, r), yn = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return sn(e)(t, n, i);
}, bn = (e) => async (t, n, r) => sn(e)(t, n, r), xn = /^[cC][0-9a-z]{6,}$/, Sn = /^[0-9a-z]+$/, Cn = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, wn = /^[0-9a-vA-V]{20}$/, Tn = /^[A-Za-z0-9]{27}$/, En = /^[a-zA-Z0-9_-]{21}$/;
function Dn(e) {
	return RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
var On = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, kn = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, An = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, jn = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Mn = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function Nn() {
	return new RegExp(Mn, "u");
}
var Pn = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Fn = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, In = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, Ln = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Rn = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, zn = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, Bn = /^https?$/, Vn = /^\+[1-9]\d{6,14}$/, Hn = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function Un(e) {
	return RegExp(`^${e}$`);
}
var Wn = /*@__PURE__*/ Un(Hn);
function Gn(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Kn(e) {
	return RegExp(`^${Gn(e)}$`);
}
function qn(e) {
	let t = ["Z"];
	e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let n = `${Gn({
		precision: e.precision,
		seconds: !0
	})}(?:${t.join("|")})`, r = e.local ? `${n}|${Gn({ precision: e.precision })}` : n;
	return RegExp(`^${Hn}T(?:${r})$`);
}
var Jn = /^[\s\S]{0,}$/, Yn = /^-?\d+$/, Xn = /^-?\d+(?:\.\d+)?$/, Zn = /^(?:true|false)$/i, Qn = /^[^A-Z]*$/, $n = /^[^a-z]*$/, er = /*@__PURE__*/ E("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), tr = (e) => {
	let t = e.value;
	return !Fe(t) && t.length !== void 0;
}, nr = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, rr = /*@__PURE__*/ E("$ZodCheckLessThan", (e, t) => {
	er.init(e, t);
	let n = nr[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: nr[typeof r.value] ?? n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), ir = /*@__PURE__*/ E("$ZodCheckGreaterThan", (e, t) => {
	er.init(e, t);
	let n = nr[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: nr[typeof r.value] ?? n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), ar = /*@__PURE__*/ E("$ZodCheckMultipleOf", (e, t) => {
	er.init(e, t), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? t.value !== BigInt(0) && n.value % t.value === BigInt(0) : Ie(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), or = /*@__PURE__*/ E("$ZodCheckNumberFormat", (e, t) => {
	er.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = rt[t.format];
	e._zod.check = (o) => {
		let s = o.value;
		if (n) {
			if (!Number.isInteger(s)) {
				o.issues.push({
					expected: r,
					format: t.format,
					code: "invalid_type",
					continue: !1,
					input: s,
					inst: e
				});
				return;
			}
			if (!Number.isSafeInteger(s)) {
				s > 0 ? o.issues.push({
					input: s,
					code: "too_big",
					maximum: 2 ** 53 - 1,
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: r,
					inclusive: !0,
					continue: !t.abort
				}) : o.issues.push({
					input: s,
					code: "too_small",
					minimum: -(2 ** 53 - 1),
					note: "Integers must be within the safe integer range.",
					inst: e,
					origin: r,
					inclusive: !0,
					continue: !t.abort
				});
				return;
			}
		}
		s < i && o.issues.push({
			origin: "number",
			input: s,
			code: "too_small",
			minimum: i,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		}), s > a && o.issues.push({
			origin: "number",
			input: s,
			code: "too_big",
			maximum: a,
			inclusive: !0,
			inst: e,
			continue: !t.abort
		});
	};
}), sr = /*@__PURE__*/ E("$ZodCheckMaxLength", (e, t) => {
	var n;
	er.init(e, t), (n = e._zod.def).when ?? (n.when = tr), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i > t.maximum ? xt(r) : i) <= t.maximum) return;
		let a = St(r);
		n.issues.push({
			origin: a,
			code: "too_big",
			maximum: t.maximum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), cr = /*@__PURE__*/ E("$ZodCheckMinLength", (e, t) => {
	var n;
	er.init(e, t), (n = e._zod.def).when ?? (n.when = tr), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i >= t.minimum && i < t.minimum * 2 ? xt(r) : i) >= t.minimum) return;
		let a = St(r);
		n.issues.push({
			origin: a,
			code: "too_small",
			minimum: t.minimum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), lr = /*@__PURE__*/ E("$ZodCheckLengthEquals", (e, t) => {
	var n;
	er.init(e, t), (n = e._zod.def).when ?? (n.when = tr), e._zod.check = (n) => {
		let r = n.value, i = r.length, a = typeof r == "string" && i >= t.length && i <= t.length * 2 ? xt(r) : i;
		if (a === t.length) return;
		let o = St(r), s = a > t.length;
		n.issues.push({
			origin: o,
			...s ? {
				code: "too_big",
				maximum: t.length
			} : {
				code: "too_small",
				minimum: t.length
			},
			inclusive: !0,
			exact: !0,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), ur = /*@__PURE__*/ E("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	er.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: t.format,
			input: n.value,
			...t.pattern ? { pattern: t.pattern.toString() } : {},
			inst: e,
			continue: !t.abort
		});
	}) : (r = e._zod).check ?? (r.check = () => {});
}), dr = /*@__PURE__*/ E("$ZodCheckRegex", (e, t) => {
	ur.init(e, t), e._zod.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: n.value,
			pattern: t.pattern.toString(),
			inst: e,
			continue: !t.abort
		});
	};
}), fr = /*@__PURE__*/ E("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= Qn, ur.init(e, t);
}), pr = /*@__PURE__*/ E("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= $n, ur.init(e, t);
}), mr = /*@__PURE__*/ E("$ZodCheckIncludes", (e, t) => {
	er.init(e, t);
	let n = $e(t.includes);
	t.pattern = new RegExp(typeof t.position == "number" ? `^.{${t.position},}${n}` : n), e._zod.check = (n) => {
		n.value.includes(t.includes, t.position) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: t.includes,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), hr = /*@__PURE__*/ E("$ZodCheckStartsWith", (e, t) => {
	er.init(e, t);
	let n = RegExp(`^${$e(t.prefix)}.*`);
	t.pattern ??= n, e._zod.check = (n) => {
		n.value.startsWith(t.prefix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: t.prefix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), gr = /*@__PURE__*/ E("$ZodCheckEndsWith", (e, t) => {
	er.init(e, t);
	let n = RegExp(`.*${$e(t.suffix)}$`);
	t.pattern ??= n, e._zod.check = (n) => {
		n.value.endsWith(t.suffix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: t.suffix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), _r = /*@__PURE__*/ E("$ZodCheckOverwrite", (e, t) => {
	er.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), vr = class {
	constructor(e = [], t = {}) {
		this.content = [], this.indent = 0, this.args = e, this.closed = t;
	}
	indented(e) {
		this.indent += 1;
		try {
			e(this);
		} finally {
			--this.indent;
		}
	}
	write(e) {
		if (typeof e == "function") {
			e(this, { execution: "sync" }), e(this, { execution: "async" });
			return;
		}
		let t = e.split("\n").filter((e) => e), n = Math.min(...t.map((e) => e.length - e.trimStart().length)), r = t.map((e) => e.slice(n)).map((e) => " ".repeat(this.indent * 2) + e);
		for (let e of r) this.content.push(e);
	}
	compile() {
		let e = Function, t = this?.content ?? [""];
		return new e(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {\n${t.join("\n")}\n};`)(...Object.values(this.closed));
	}
}, yr = {
	major: 4,
	minor: 6,
	patch: 5
}, D = /*@__PURE__*/ E("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = yr;
	let r = e._zod.def.checks, i = e._zod.traits.has("$ZodCheck") ? [e, ...r ?? []] : r?.length ? [...r] : [];
	for (let t of i) for (let n of t._zod.onattach) n(e);
	if (i.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (t, n, r) => {
			if (t.memo) return t;
			let i = mt(t), a;
			for (let o of n) {
				if (o._zod.def.when) {
					if (ht(t) || !o._zod.def.when(t)) continue;
				} else if (i) continue;
				let n = t.issues.length, s = o._zod.check(t);
				if (s instanceof Promise && r?.async === !1) throw new Vt();
				if (a || s instanceof Promise) a = (a ?? Promise.resolve()).then(async () => {
					await s, t.issues.length !== n && (vt(t.issues, n, e), i ||= mt(t, n));
				});
				else {
					if (t.issues.length === n) continue;
					vt(t.issues, n, e), i ||= mt(t, n);
				}
			}
			return a ? a.then(() => t) : t;
		}, n = (n, r, a) => {
			if (mt(n)) return n.aborted = !0, n;
			let o = t(r, i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new Vt();
				return o.then((t) => e._zod.parse(t, a));
			}
			return e._zod.parse(o, a);
		};
		e._zod.run = (r, a) => {
			if (a.skipChecks) return e._zod.parse(r, a);
			if (a.direction === "backward") {
				let t = e._zod.parse({
					value: r.value,
					issues: []
				}, {
					...a,
					skipChecks: !0
				});
				return t instanceof Promise ? t.then((e) => n(e, r, a)) : n(t, r, a);
			}
			let o = e._zod.parse(r, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new Vt();
				return o.then((e) => t(e, i, a));
			}
			return t(o, i, a);
		};
	}
}, {
	get "~standard"() {
		return Dt(this, "~standard", Sr(this));
	},
	set "~standard"(e) {
		Et(this, "~standard", e);
	}
}), br = (e, t) => e.issues.length ? { issues: e.issues.map((e) => yt(e, t, Wt())) } : { value: e.value };
async function xr(e, t) {
	let n = { async: !0 };
	return br(await e._zod.run({
		value: t,
		issues: []
	}, n), n);
}
function Sr(e) {
	return {
		validate: (t) => {
			let n = { async: !1 };
			try {
				let r = e._zod.run({
					value: t,
					issues: []
				}, n);
				if (!(r instanceof Promise)) return br(r, n);
			} catch {}
			return xr(e, t);
		},
		vendor: "zod",
		version: 1
	};
}
var Cr = /*@__PURE__*/ E("$ZodString", (e, t) => {
	D.init(e, t), e._zod.pattern = t.pattern ?? Jn, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = String(n.value);
		} catch {}
		return typeof n.value == "string" || n.issues.push({
			expected: "string",
			code: "invalid_type",
			input: n.value,
			inst: e
		}), n;
	};
}), O = /*@__PURE__*/ E("$ZodStringFormat", (e, t) => {
	ur.init(e, t), Cr.init(e, t);
}), wr = /*@__PURE__*/ E("$ZodGUID", (e, t) => {
	t.pattern ??= kn, O.init(e, t);
}), Tr = /*@__PURE__*/ E("$ZodUUID", (e, t) => {
	if (t.version) {
		let e = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[t.version];
		if (e === void 0) throw Error(`Invalid UUID version: "${t.version}"`);
		t.pattern ??= An(e);
	} else t.pattern ??= An();
	O.init(e, t);
}), Er = /*@__PURE__*/ E("$ZodEmail", (e, t) => {
	t.pattern ??= jn, O.init(e, t);
});
function Dr(e) {
	try {
		return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
	} catch {
		return !1;
	}
}
function Or(e, t) {
	return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? Dr(e) || 2 : kr(e, t);
}
function kr(e, t) {
	if (!t.normalize && t.protocol?.source === Bn.source && !/^https?:\/\//i.test(e)) return 1;
	try {
		if (typeof URL < "u") {
			let t = URL;
			if (typeof t.parse == "function") return t.parse(e) ?? 2;
		}
		return new URL(e);
	} catch {
		return 2;
	}
}
var Ar = /[\t\n\r]/g;
function jr(e) {
	return e.replace(Ar, "");
}
function Mr(e, t) {
	return t.lastIndex = 0, t.test(e.hostname);
}
function Nr(e, t) {
	return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
var Pr = /*@__PURE__*/ E("$ZodURL", (e, t) => {
	O.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim(), i = Or(r, t);
			if (i === 1) {
				n.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid URL format",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
				return;
			}
			if (i === 2) {
				n.issues.push({
					code: "invalid_format",
					format: "url",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
				return;
			}
			if (i === !0) {
				n.value = jr(r);
				return;
			}
			t.hostname && !Mr(i, t.hostname) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), t.protocol && !Nr(i, t.protocol) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), n.value = t.normalize ? i.href : jr(r);
			return;
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "url",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
}), Fr = /*@__PURE__*/ E("$ZodEmoji", (e, t) => {
	t.pattern ??= Nn(), O.init(e, t);
}), Ir = /*@__PURE__*/ E("$ZodNanoID", (e, t) => {
	if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1)) throw Error(`Invalid nanoid length: ${t.length}`);
	t.pattern ??= t.length === void 0 ? En : Dn(t.length), O.init(e, t);
}), Lr = /*@__PURE__*/ E("$ZodCUID", (e, t) => {
	t.pattern ??= xn, O.init(e, t);
}), Rr = /*@__PURE__*/ E("$ZodCUID2", (e, t) => {
	t.pattern ??= Sn, O.init(e, t);
}), zr = /*@__PURE__*/ E("$ZodULID", (e, t) => {
	t.pattern ??= Cn, O.init(e, t);
}), Br = /*@__PURE__*/ E("$ZodXID", (e, t) => {
	t.pattern ??= wn, O.init(e, t);
}), Vr = /*@__PURE__*/ E("$ZodKSUID", (e, t) => {
	t.pattern ??= Tn, O.init(e, t);
}), Hr = /*@__PURE__*/ E("$ZodISODateTime", (e, t) => {
	t.pattern ??= qn(t), O.init(e, t);
}), Ur = /*@__PURE__*/ E("$ZodISODate", (e, t) => {
	t.pattern ??= Wn, O.init(e, t);
}), Wr = /*@__PURE__*/ E("$ZodISOTime", (e, t) => {
	t.pattern ??= Kn(t), O.init(e, t);
}), Gr = /*@__PURE__*/ E("$ZodISODuration", (e, t) => {
	t.pattern ??= On, O.init(e, t);
}), Kr = /*@__PURE__*/ E("$ZodIPv4", (e, t) => {
	t.pattern ??= Pn, O.init(e, t);
}), qr = /^[0-9a-fA-F:.]+$/;
function Jr(e) {
	return qr.test(e) ? Dr(`http://[${e}]`) : !1;
}
var Yr = /*@__PURE__*/ E("$ZodIPv6", (e, t) => {
	t.pattern ??= Fn, O.init(e, t), e._zod.check = (n) => {
		Jr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Xr = /*@__PURE__*/ E("$ZodCIDRv4", (e, t) => {
	t.pattern ??= In, O.init(e, t);
});
function Zr(e) {
	let t = e.split("/");
	if (t.length !== 2) return !1;
	let [n, r] = t;
	if (!r) return !1;
	let i = Number(r);
	return `${i}` !== r || i < 0 || i > 128 ? !1 : Jr(n);
}
var Qr = /*@__PURE__*/ E("$ZodCIDRv6", (e, t) => {
	t.pattern ??= Ln, O.init(e, t), e._zod.check = (n) => {
		Zr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function $r(e) {
	if (e === "") return !0;
	if (/\s/.test(e) || e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var ei = /^[0-9a-zA-Z+/]*={0,2}$/, ti = /*@__PURE__*/ E("$ZodBase64", (e, t) => {
	t.pattern ??= ei, O.init(e, t), e._zod.check = (n) => {
		$r(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), ni = /^[A-Za-z0-9_-]*$/;
function ri(e) {
	if (!ni.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return $r(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var ii = /*@__PURE__*/ E("$ZodBase64URL", (e, t) => {
	t.pattern ??= ni, O.init(e, t), e._zod.check = (n) => {
		ri(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), ai = /*@__PURE__*/ E("$ZodE164", (e, t) => {
	t.pattern ??= Vn, O.init(e, t);
});
function oi(e, t = null) {
	try {
		let n = e.split(".");
		if (n.length !== 3) return !1;
		let [r] = n;
		if (!r) return !1;
		let i = JSON.parse(atob(r));
		return !("typ" in i && i?.typ !== "JWT" || !i.alg || t && (!("alg" in i) || i.alg !== t));
	} catch {
		return !1;
	}
}
var si = /*@__PURE__*/ E("$ZodJWT", (e, t) => {
	O.init(e, t), e._zod.check = (n) => {
		oi(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), ci = /*@__PURE__*/ E("$ZodNumber", (e, t) => {
	D.init(e, t), e._zod.pattern = Xn, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = Number(n.value);
		} catch {}
		let i = n.value;
		if (typeof i == "number" && !Number.isNaN(i) && Number.isFinite(i)) return n;
		let a = typeof i == "number" ? Number.isNaN(i) ? "NaN" : Number.isFinite(i) ? void 0 : String(i) : void 0;
		return n.issues.push({
			expected: "number",
			code: "invalid_type",
			input: i,
			inst: e,
			...a ? { received: a } : {}
		}), n;
	};
}), li = /*@__PURE__*/ E("$ZodNumberFormat", (e, t) => {
	or.init(e, t), ci.init(e, t);
}), ui = /*@__PURE__*/ E("$ZodBoolean", (e, t) => {
	D.init(e, t), e._zod.pattern = Zn, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = !!n.value;
		} catch {}
		let i = n.value;
		return typeof i == "boolean" || n.issues.push({
			expected: "boolean",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
	};
}), di = /*@__PURE__*/ E("$ZodUnknown", (e, t) => {
	D.init(e, t), e._zod.parse = (e) => e;
}), fi = /*@__PURE__*/ E("$ZodNever", (e, t) => {
	D.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function pi(e, t, n) {
	e.issues.length && t.issues.push(...gt(n, e.issues)), t.value[n] = e.value;
}
var mi = /*@__PURE__*/ E("$ZodArray", (e, t) => {
	D.init(e, t);
	let n = Ut.memoizer;
	n?.attach(e), e._zod.parse = (r, i) => {
		let a = r.value;
		if (!Array.isArray(a)) return r.issues.push({
			expected: "array",
			code: "invalid_type",
			input: a,
			inst: e
		}), r;
		r.value = n ? n.alloc(e, r, Array(a.length), i) : Array(a.length);
		let o = [], s = i?.abortEarly;
		for (let e = 0; e < a.length; e++) {
			let n = a[e], c = t.element._zod.run({
				value: n,
				issues: []
			}, i);
			if (c instanceof Promise) o.push(c.then((t) => pi(t, r, e)));
			else if (pi(c, r, e), s && c.issues.length !== 0 && mt(c)) break;
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	};
});
function hi(e, t, n, r, i, a) {
	let o = n in r, s = a === "optional";
	if (o || !s || i !== "optional") {
		if (e.issues.length) {
			if (i !== void 0 && s && !o) return;
			t.issues.push(...gt(n, e.issues));
		}
		if (!o && i === void 0) {
			e.issues.length || t.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: void 0,
				path: [n]
			});
			return;
		}
		e.value === void 0 ? (o || i === "defaulted" && !s) && (t.value[n] = void 0) : t.value[n] = e.value;
	}
}
var gi = [];
function _i(e) {
	let t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : gi, i = r.length ? [...t, ...r] : t;
	for (let t of i) if (!e.shape?.[t]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${String(t)}": expected a Zod schema`);
	let a = nt(e.shape);
	return {
		...e,
		allKeys: i,
		symbolKeys: r,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(a)
	};
}
function vi(e, t, n, r, i, a, o) {
	let s = [], c = i.keySet, l = i.catchall._zod, u = l.def.type, d = l.optin, f = l.optout, p = 0;
	for (let i in t) {
		if (o && n.issues.length !== p) {
			if (mt(n, p)) break;
			p = n.issues.length;
		}
		if (c.has(i)) continue;
		if (i === "__proto__") {
			u === "never" && s.push(i);
			continue;
		}
		if (u === "never") {
			s.push(i);
			continue;
		}
		let a = l.run({
			value: t[i],
			issues: []
		}, r);
		a instanceof Promise ? e.push(a.then((e) => hi(e, n, i, t, d, f))) : hi(a, n, i, t, d, f);
	}
	return s.length && n.issues.push({
		code: "unrecognized_keys",
		keys: s,
		input: t,
		inst: a,
		continue: !0
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var yi = /*@__PURE__*/ E("$ZodObject", (e, t) => {
	D.init(e, t);
	let n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
	if (r) {
		let e = () => {
			let n = { ...r };
			return Object.defineProperty(t, "shape", { value: n }), e.raw = n, n;
		};
		e.raw = r, Object.defineProperty(t, "shape", { get: e });
	}
	let i = Pe(() => _i(t));
	T(e, "propValues", (e) => {
		let t = e.def.shape, n = {};
		for (let e in t) {
			let r = t[e]._zod;
			if (r.values) {
				Object.prototype.hasOwnProperty.call(n, e) || Le(n, e, /* @__PURE__ */ new Set());
				for (let t of r.values) n[e].add(t);
				r.optin !== void 0 && n[e].add(void 0);
			}
		}
		return n;
	});
	let a = Je, o = t.catchall, s, c = Ut.memoizer;
	c?.attach(e), e._zod.parse = (t, n) => {
		s ??= i.value;
		let r = t.value;
		if (!a(r)) return t.issues.push({
			expected: "object",
			code: "invalid_type",
			input: r,
			inst: e
		}), t;
		t.value = c ? c.alloc(e, t, {}, n) : {};
		let l = [], u = s.shape, d = n?.abortEarly, f = t.issues.length;
		for (let e of s.allKeys) {
			if (d && t.issues.length !== f) {
				if (mt(t, f)) break;
				f = t.issues.length;
			}
			if (e === "__proto__") continue;
			let i = u[e], a = i._zod.optin, o = i._zod.optout, s = i._zod.run({
				value: r[e],
				issues: []
			}, n);
			s instanceof Promise ? l.push(s.then((n) => hi(n, t, e, r, a, o))) : hi(s, t, e, r, a, o);
		}
		return o ? vi(l, r, t, n, i.value, e, d === !0) : l.length ? Promise.all(l).then(() => t) : t;
	};
}), bi = /*@__PURE__*/ E("$ZodObjectJIT", (e, t) => {
	yi.init(e, t);
	let n = e._zod.parse, r = Pe(() => _i(t)), i = Ut.memoizer, a = (t) => {
		let n = r.value, a = n.symbolKeys, o = new vr(["payload", "ctx"], {
			shape: t,
			inst: e,
			memo: i,
			syms: a
		}), s = (e) => `shape[${e}]._zod.run({ value: input[${e}], issues: [] }, ctx)`, c = (e, t) => `
          let ${e}_ab = false;
          for (let i = 0; i < ${e}.issues.length; i++) {
            const iss = ${e}.issues[i];
            iss.path = iss.path ? [${t}, ...iss.path] : [${t}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${e}_ab = true;
          }
          if (${e}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
		o.write("const input = payload.value;");
		let l = Object.create(null), u = 0;
		for (let e of n.allKeys) l[e] = `key_${u++}`;
		o.write(i ? "const newResult = memo.alloc(inst, payload, {}, ctx);" : "const newResult = {};");
		for (let e of n.allKeys) {
			if (e === "__proto__") continue;
			let n = l[e], r = typeof e == "symbol" ? `syms[${a.indexOf(e)}]` : Ge(e), i = `${r} in input`, u = t[e], d = u?._zod?.optin, f = d !== void 0, p = u?._zod?.optout === "optional";
			if (o.write(`const ${n} = ${s(r)};`), f && p) {
				let e = d === "optional" ? `${n}_present` : `${n}.value !== undefined || ${n}_present`;
				o.write(`
        const ${n}_present = ${i};
        if (!${n}.issues.length || ${n}_present) {
          if (${n}.issues.length) {${c(n, r)}
          }

          if (${e}) {
            newResult[${r}] = ${n}.value;
          }
        }

      `);
			} else f ? (o.write(`
        if (${n}.issues.length) {${c(n, r)}
        }
      `), d === "defaulted" ? o.write(`newResult[${r}] = ${n}.value;`) : o.write(`
        if (${n}.value !== undefined || ${i}) {
          newResult[${r}] = ${n}.value;
        }
      `)) : o.write(`
        const ${n}_present = ${i};
        if (${n}.issues.length) {${c(n, r)}
        }
        if (!${n}_present && !${n}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${r}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${n}_present) {
          newResult[${r}] = ${n}.value;
        }

      `);
		}
		return o.write("payload.value = newResult;"), o.write("return payload;"), o.compile();
	}, o, s = Je, c = !Ut.jitless, l = c && Ye.value, u = t.catchall, d;
	e._zod.parse = (i, f) => {
		d ??= r.value;
		let p = i.value;
		return s(p) ? c && l && f?.async === !1 && f.jitless !== !0 ? (o ||= a(t.shape), i = o(i, f), u ? vi([], p, i, f, d, e, f?.abortEarly === !0) : i) : n(i, f) : (i.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), i);
	};
});
function xi(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !mt(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => yt(e, r, Wt())))
	}), t);
}
var Si = /*@__PURE__*/ E("$ZodUnion", (e, t) => {
	D.init(e, t), T(e, "optin", (e) => e.def.options.some((e) => e._zod.optin === "defaulted") ? "defaulted" : e.def.options.some((e) => e._zod.optin !== void 0) ? "optional" : void 0), T(e, "optout", (e) => e.def.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), T(e, "values", (e) => {
		if (e.def.options.every((e) => e._zod.values)) return new Set(e.def.options.flatMap((e) => Array.from(e._zod.values)));
	}), T(e, "pattern", (e) => {
		if (e.def.options.every((e) => e._zod.pattern)) {
			let t = e.def.options.map((e) => e._zod.pattern);
			return RegExp(`^(${t.map((e) => C(e.source)).join("|")})$`);
		}
	});
	let n = t.options.length === 1 ? t.options[0]._zod.run : null;
	e._zod.parse = (r, i) => {
		if (n) return n(r, i);
		let a = !1, o = [];
		for (let e of t.options) {
			let t = e._zod.run({
				value: r.value,
				issues: []
			}, i);
			if (t instanceof Promise) o.push(t), a = !0;
			else {
				if (t.issues.length === 0) return t;
				o.push(t);
			}
		}
		return a ? Promise.all(o).then((t) => xi(t, r, e, i)) : xi(o, r, e, i);
	};
}), Ci = /*@__PURE__*/ E("$ZodIntersection", (e, t) => {
	D.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => Ti(e, t, n)) : Ti(e, i, a);
	};
});
function wi(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (Xe(e) && Xe(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		Object.prototype.hasOwnProperty.call(i, "__proto__") && delete i.__proto__;
		for (let n of r) {
			if (n === "__proto__") continue;
			let r = wi(e[n], t[n]);
			if (!r.valid) return {
				valid: !1,
				mergeErrorPath: [n, ...r.mergeErrorPath]
			};
			i[n] = r.data;
		}
		return {
			valid: !0,
			data: i
		};
	}
	if (Array.isArray(e) && Array.isArray(t)) {
		if (e.length !== t.length) return {
			valid: !1,
			mergeErrorPath: []
		};
		let n = [];
		for (let r = 0; r < e.length; r++) {
			let i = e[r], a = t[r], o = wi(i, a);
			if (!o.valid) return {
				valid: !1,
				mergeErrorPath: [r, ...o.mergeErrorPath]
			};
			n.push(o.data);
		}
		return {
			valid: !0,
			data: n
		};
	}
	return {
		valid: !1,
		mergeErrorPath: []
	};
}
function Ti(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i, a = /* @__PURE__ */ new Map(), o = (e, t) => {
		let n;
		if (e.code === "unrecognized_keys" && !e.path?.length) i ??= e, n = e.keys;
		else if (e.code === "invalid_key" && e.origin === "record" && e.path?.length === 1) {
			let t = String(e.path[0]);
			a.has(t) || a.set(t, e), n = [t];
		} else return !1;
		for (let e of n) r.has(e) || r.set(e, {}), r.get(e)[t] = !0;
		return !0;
	};
	for (let n of t.issues) o(n, "l") || e.issues.push(n);
	for (let t of n.issues) o(t, "r") || e.issues.push(t);
	let s = [...r].filter(([, e]) => e.l && e.r).map(([e]) => e);
	if (s.length) {
		let t = i ? s.filter((e) => i.keys.includes(e)) : [];
		t.length && e.issues.push({
			...i,
			keys: t
		});
		for (let n of s) !t.includes(n) && a.has(n) && e.issues.push(a.get(n));
	}
	let c = wi(t.value, n.value);
	if (!c.valid) {
		if (mt(e)) return e;
		throw Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
	}
	return e.value = c.data, e;
}
var Ei = /*@__PURE__*/ E("$ZodRecord", (e, t) => {
	D.init(e, t);
	let n = Ut.memoizer;
	n?.attach(e), e._zod.parse = (r, i) => {
		let a = r.value;
		if (!Xe(a)) return r.issues.push({
			expected: "record",
			code: "invalid_type",
			input: a,
			inst: e
		}), r;
		let o = [], s = t.keyType._zod.values;
		if (s && !t.partial) {
			r.value = n ? n.alloc(e, r, {}, i) : {};
			let c = /* @__PURE__ */ new Set();
			for (let n of s) if (typeof n == "string" || typeof n == "number" || typeof n == "symbol") {
				if (c.add(typeof n == "number" ? n.toString() : n), n === "__proto__") continue;
				let s = t.keyType._zod.run({
					value: n,
					issues: []
				}, i);
				if (s instanceof Promise) throw Error("Async schemas not supported in object keys currently");
				if (s.issues.length) {
					r.issues.push({
						code: "invalid_key",
						origin: "record",
						issues: s.issues.map((e) => yt(e, i, Wt())),
						input: n,
						path: [n],
						inst: e
					});
					continue;
				}
				let l = s.value;
				if (l === "__proto__") continue;
				let u = t.valueType._zod.run({
					value: a[n],
					issues: []
				}, i);
				u instanceof Promise ? o.push(u.then((e) => {
					e.issues.length && r.issues.push(...gt(n, e.issues)), r.value[l] = e.value;
				})) : (u.issues.length && r.issues.push(...gt(n, u.issues)), r.value[l] = u.value);
			}
			let l;
			for (let e in a) if (!c.has(e)) {
				if (t.mode === "loose") {
					if (e === "__proto__") continue;
					r.value[e] = a[e];
				} else l ??= [], l.push(e);
			}
			l && l.length > 0 && r.issues.push({
				code: "unrecognized_keys",
				input: a,
				inst: e,
				keys: l,
				continue: !0
			});
		} else {
			r.value = n ? n.alloc(e, r, {}, i) : {};
			let c;
			for (let n of Reflect.ownKeys(a)) {
				if (n === "__proto__" || !Object.prototype.propertyIsEnumerable.call(a, n)) continue;
				let l = t.keyType._zod.run({
					value: n,
					issues: []
				}, i);
				if (l instanceof Promise) throw Error("Async schemas not supported in object keys currently");
				if (typeof n == "string" && Xn.test(n) && l.issues.length) {
					let e = t.keyType._zod.run({
						value: Number(n),
						issues: []
					}, i);
					if (e instanceof Promise) throw Error("Async schemas not supported in object keys currently");
					e.issues.length === 0 && (l = e);
				}
				if (l.issues.length) {
					t.mode === "loose" ? r.value[n] = a[n] : s ? (c ??= [], c.push(n)) : r.issues.push({
						code: "invalid_key",
						origin: "record",
						issues: l.issues.map((e) => yt(e, i, Wt())),
						input: n,
						path: [n],
						inst: e
					});
					continue;
				}
				let u = l.value;
				if (u === "__proto__") continue;
				let d = t.valueType._zod.run({
					value: a[n],
					issues: []
				}, i);
				d instanceof Promise ? o.push(d.then((e) => {
					e.issues.length && r.issues.push(...gt(n, e.issues)), r.value[u] = e.value;
				})) : (d.issues.length && r.issues.push(...gt(n, d.issues)), r.value[u] = d.value);
			}
			c && c.length > 0 && r.issues.push({
				code: "unrecognized_keys",
				input: a,
				inst: e,
				keys: c,
				continue: !0
			});
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	};
}), Di = /*@__PURE__*/ E("$ZodEnum", (e, t) => {
	D.init(e, t);
	let n = Ae(t.entries), r = new Set(n);
	e._zod.values = r, T(e, "pattern", (e) => {
		let t = Ae(e.def.entries).filter((e) => Qe.has(typeof e));
		return RegExp(t.length ? `^(${t.map((e) => $e(e.toString())).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), Oi = /*@__PURE__*/ E("$ZodLiteral", (e, t) => {
	D.init(e, t);
	let n = new Set(t.values);
	e._zod.values = n, T(e, "pattern", (e) => {
		let t = e.def.values;
		return RegExp(t.length ? `^(${t.map((e) => typeof e == "string" ? $e(e) : e ? $e(e.toString()) : String(e)).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (r, i) => {
		let a = r.value;
		return n.has(a) || r.issues.push({
			code: "invalid_value",
			values: t.values,
			input: a,
			inst: e
		}), r;
	};
}), ki = /*@__PURE__*/ E("$ZodTransform", (e, t) => {
	D.init(e, t), e._zod.optin = "optional", Ut.memoizer?.guard(e), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new Ht(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new Vt();
		return n.value = i, n;
	};
});
function Ai(e, t) {
	return e.value = t.issues.length ? void 0 : t.value, e;
}
var ji = /*@__PURE__*/ E("$ZodOptional", (e, t) => {
	D.init(e, t), T(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", T(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? /* @__PURE__ */ new Set([...t, void 0]) : void 0;
	}), T(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${C(t.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (e.value === void 0) {
			if (t.innerType._zod.optin !== "defaulted") return e;
			let r = t.innerType._zod.run({
				value: e.value,
				issues: []
			}, n);
			return r instanceof Promise ? r.then((t) => Ai(e, t)) : Ai(e, r);
		}
		return t.innerType._zod.run(e, n);
	};
}), Mi = /*@__PURE__*/ E("$ZodExactOptional", (e, t) => {
	ji.init(e, t), T(e, "values", (e) => e.def.innerType._zod.values), T(e, "pattern", (e) => e.def.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), Ni = /*@__PURE__*/ E("$ZodNullable", (e, t) => {
	D.init(e, t), T(e, "optin", (e) => e.def.innerType._zod.optin), T(e, "optout", (e) => e.def.innerType._zod.optout), T(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${C(t.source)}|null)$`) : void 0;
	}), T(e, "values", (e) => e.def.innerType._zod.values ? /* @__PURE__ */ new Set([...e.def.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), Pi = /*@__PURE__*/ E("$ZodDefault", (e, t) => {
	D.init(e, t), e._zod.optin = "defaulted", T(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => Fi(e, t)) : Fi(r, t);
	};
});
function Fi(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var Ii = /*@__PURE__*/ E("$ZodPrefault", (e, t) => {
	D.init(e, t), e._zod.optin = "defaulted", T(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), Li = /*@__PURE__*/ E("$ZodNonOptional", (e, t) => {
	D.init(e, t), T(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? new Set([...t].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => Ri(t, e)) : Ri(i, e);
	};
});
function Ri(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
function zi(e, t, n, r) {
	return t.issues.length ? (e.value = n.catchValue({
		...t,
		value: e.value,
		error: { issues: t.issues.map((e) => yt(e, r, Wt())) },
		input: e.value
	}), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
var Bi = /*@__PURE__*/ E("$ZodCatch", (e, t) => {
	D.init(e, t), T(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), T(e, "optout", (e) => e.def.innerType._zod.optout), T(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run({
			value: e.value,
			issues: []
		}, n);
		return r instanceof Promise ? r.then((r) => zi(e, r, t, n)) : zi(e, r, t, n);
	};
}), Vi = /*@__PURE__*/ E("$ZodPipe", (e, t) => {
	D.init(e, t), T(e, "values", (e) => e.def.in._zod.values), T(e, "optin", (e) => e.def.in._zod.optin), T(e, "optout", (e) => e.def.out._zod.optout), T(e, "propValues", (e) => e.def.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => Hi(e, t.in, n)) : Hi(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => Hi(e, t.out, n)) : Hi(r, t.out, n);
	};
});
function Hi(e, t, n) {
	return e.issues.some((e) => e.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues
	}, n);
}
var Ui = /*@__PURE__*/ E("$ZodReadonly", (e, t) => {
	D.init(e, t), T(e, "propValues", (e) => e.def.innerType._zod.propValues), T(e, "values", (e) => e.def.innerType._zod.values), T(e, "optin", (e) => e.def.innerType?._zod?.optin), T(e, "optout", (e) => e.def.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(Wi) : Wi(r);
	};
});
function Wi(e) {
	return e.memo || (e.value = Object.freeze(e.value)), e;
}
var Gi = /*@__PURE__*/ E("$ZodCustom", (e, t) => {
	er.init(e, t), D.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => Ki(t, n, r, e));
		Ki(i, n, r, e);
	};
});
function Ki(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(wt(e));
	}
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/memoizer.js
var qi = class extends Error {
	constructor() {
		super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
	}
}, Ji = "~memo", Yi = [];
function Xi(e) {
	return typeof e == "object" && !!e;
}
function Zi(e) {
	return e.map((e) => e.path ? {
		...e,
		path: e.path.slice()
	} : { ...e });
}
var Qi = /*@__PURE__*/ new WeakMap(), $i = 0, ea = 1, ta = 2;
function na(e, t, n) {
	let r = Qi.get(e);
	if (r !== void 0) return r ? ta : $i;
	if (t.has(e)) return ta;
	t.add(e);
	let i = $i, a = (e) => {
		if (i !== ta && e?._zod) {
			let r = na(e, t, n);
			r > i && (i = r);
		}
	}, o = (e, r) => {
		let i = $i;
		for (let a of Reflect.ownKeys(e)) {
			let o = Object.getOwnPropertyDescriptor(e, a);
			if (r && !o.enumerable) continue;
			let s = o.get ? ea : o.value?._zod ? na(o.value, t, n) : $i;
			s > i && (i = s);
		}
		return i;
	}, s = (e) => {
		e > i && (i = e);
	}, c = e._zod.def;
	switch (c.type) {
		case "object": {
			let e = Re(c);
			s(e ? o(e, !0) : ea), a(c.catchall);
			break;
		}
		case "array":
			a(c.element);
			break;
		case "tuple":
			for (let e of c.items) a(e);
			a(c.rest);
			break;
		case "record":
		case "map":
			a(c.keyType), a(c.valueType);
			break;
		case "set":
			a(c.valueType);
			break;
		case "union":
			for (let e of c.options) a(e);
			break;
		case "intersection":
			a(c.left), a(c.right);
			break;
		case "optional":
		case "nullable":
		case "default":
		case "prefault":
		case "catch":
		case "readonly":
		case "nonoptional":
		case "promise":
		case "success":
			a(c.innerType);
			break;
		case "pipe":
			a(c.in), a(c.out);
			break;
		case "function":
			a(c.input), a(c.output);
			break;
		case "lazy": {
			let r = c._cachedInner ?? (n ? e._zod.innerType : void 0);
			s(r ? na(r, t, !1) : ea);
			break;
		}
		case "template_literal":
		case "string":
		case "number":
		case "int":
		case "boolean":
		case "bigint":
		case "symbol":
		case "undefined":
		case "null":
		case "void":
		case "never":
		case "any":
		case "unknown":
		case "date":
		case "nan":
		case "enum":
		case "literal":
		case "file":
		case "transform":
		case "custom": break;
		default: for (let e in c) {
			let t = Object.getOwnPropertyDescriptor(c, e);
			if (!t || t.get) continue;
			let n = t.value;
			if (n && typeof n == "object") {
				if (n._zod) a(n);
				else if (Array.isArray(n)) for (let e of n) a(e);
			}
		}
	}
	return t.delete(e), ra(e, i);
}
function ra(e, t) {
	return t !== ea && Qi.set(e, t === ta), t;
}
function ia(e, t) {
	let n = e.buckets.get(t);
	return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
var aa, oa = [], sa = {
	alloc(e, t, n) {
		let r = aa;
		if (!r) return n;
		aa = void 0;
		let i = {
			value: n,
			issues: null
		};
		return r.set(t.value, i), oa.push(i), n;
	},
	guard(e) {
		var t;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, n = (e, n) => {
				if (n.direction !== "backward" && la(n, e.value)) throw new qi();
				return t(e, n);
			};
			e._zod.parse = n, e._zod.run === t && (e._zod.run = n);
		});
	},
	attach(e) {
		var t;
		let n, r = !1, i, a;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, o = (s, c) => {
				if (n === void 0) {
					let i = na(e, /* @__PURE__ */ new Set(), !1);
					if (i === $i) return e._zod.parse = t, e._zod.run === o && (e._zod.run = t), t(s, c);
					i === ta || r ? n = !0 : r = !0;
				}
				let l = s.value;
				if (!Xi(l)) return t(s, c);
				let u = c[Ji];
				u || (u = {
					buckets: /* @__PURE__ */ new WeakMap(),
					backEdges: void 0
				}, c[Ji] = u);
				let d;
				i === c ? d = a : (d = ia(u, e), i = c, a = d);
				let f = d.get(l);
				if (f) return s.value = f.value, f.issues ? f.issues.length && s.issues.push(...Zi(f.issues)) : (s.memo = !0, u.backEdges ?? (u.backEdges = /* @__PURE__ */ new WeakSet()), u.backEdges.add(f.value)), s;
				aa = d;
				let p = oa.length, m = t(s, c);
				aa = void 0;
				let h = oa.length > p ? oa.pop() : void 0;
				return m instanceof Promise ? m.then((e) => (h && (h.issues = e.issues.length ? Zi(e.issues) : Yi), e)) : (h && (h.issues = m.issues.length ? Zi(m.issues) : Yi), m);
			};
			e._zod.parse = o, e._zod.run === t && (e._zod.run = o);
		});
	}
};
function ca() {
	return sa;
}
function la(e, t) {
	let n = e[Ji]?.backEdges;
	return n !== void 0 && Xi(t) && n.has(t);
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/locales/en.js
var ua = () => {
	let e = {
		string: {
			unit: "characters",
			verb: "to have"
		},
		file: {
			unit: "bytes",
			verb: "to have"
		},
		array: {
			unit: "items",
			verb: "to have"
		},
		set: {
			unit: "items",
			verb: "to have"
		},
		map: {
			unit: "entries",
			verb: "to have"
		}
	};
	function t(t) {
		return e[t] ?? null;
	}
	let n = {
		regex: "input",
		email: "email address",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO datetime",
		date: "ISO date",
		time: "ISO time",
		duration: "ISO duration",
		ipv4: "IPv4 address",
		ipv6: "IPv6 address",
		mac: "MAC address",
		cidrv4: "IPv4 range",
		cidrv6: "IPv6 range",
		base64: "base64-encoded string",
		base64url: "base64url-encoded string",
		json_string: "JSON string",
		e164: "E.164 number",
		currency_code: "currency code",
		credit_card: "credit card number",
		iban: "IBAN",
		jwt: "JWT",
		template_literal: "input"
	}, r = { nan: "NaN" };
	function i(e, t) {
		return e === "number" && typeof t == "number" && !Number.isFinite(t) ? String(t) : r[e] ?? e;
	}
	return (e) => {
		switch (e.code) {
			case "invalid_type": return `Invalid input: expected ${i(e.expected)}, received ${i(Ct(e.input), e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Invalid input: expected ${tt(e.values[0])}` : `Invalid option: expected one of ${je(e.values, "|")}`;
			case "too_big": {
				let n = e.exact ? "exactly " : e.inclusive ? "<=" : "<", r = t(e.origin);
				return r ? `Too big: expected ${e.origin ?? "value"} to have ${n}${e.maximum.toString()} ${r.unit ?? "elements"}` : `Too big: expected ${e.origin ?? "value"} to be ${n}${e.maximum.toString()}`;
			}
			case "too_small": {
				let n = e.exact ? "exactly " : e.inclusive ? ">=" : ">", r = t(e.origin);
				return r ? `Too small: expected ${e.origin} to have ${n}${e.minimum.toString()} ${r.unit}` : `Too small: expected ${e.origin} to be ${n}${e.minimum.toString()}`;
			}
			case "invalid_format": {
				let t = e;
				return t.format === "starts_with" ? `Invalid string: must start with "${t.prefix}"` : t.format === "ends_with" ? `Invalid string: must end with "${t.suffix}"` : t.format === "includes" ? `Invalid string: must include "${t.includes}"` : t.format === "regex" ? `Invalid string: must match pattern ${t.pattern}` : `Invalid ${n[t.format] ?? e.format}`;
			}
			case "not_multiple_of": return `Invalid number: must be a multiple of ${e.divisor}`;
			case "unrecognized_keys": return `Unrecognized key${e.keys.length > 1 ? "s" : ""}: ${je(e.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${e.origin}`;
			case "invalid_union": return e.options && Array.isArray(e.options) && e.options.length > 0 ? `Invalid discriminator value. Expected ${e.options.map((e) => `'${e}'`).join(" | ")}` : e.inclusive === !1 ? "Invalid input: more than one option matched" : "Invalid input";
			case "invalid_element": return `Invalid value in ${e.origin}`;
			default: return "Invalid input";
		}
	};
};
function da() {
	return { localeError: ua() };
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/registries.js
var fa, pa = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
	}
	add(e, ...t) {
		let n = t[0];
		return this._map.set(e, n), n && typeof n == "object" && "id" in n && this._idmap.set(n.id, e), this;
	}
	clear() {
		return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
	}
	remove(e) {
		let t = this._map.get(e);
		return t && typeof t == "object" && "id" in t && this._idmap.delete(t.id), this._map.delete(e), this;
	}
	get(e) {
		let t = e._zod.parent;
		if (t) {
			let n = { ...this.get(t) ?? {} };
			delete n.id;
			let r = {
				...n,
				...this._map.get(e)
			};
			return Object.keys(r).length ? r : void 0;
		}
		return this._map.get(e);
	}
	has(e) {
		return this._map.has(e);
	}
};
function ma() {
	return new pa();
}
(fa = globalThis).__zod_globalRegistry ?? (fa.__zod_globalRegistry = ma());
var ha = globalThis.__zod_globalRegistry;
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/api.js
function ga(e) {
	return e.checks &&= [...e.checks], e;
}
// @__NO_SIDE_EFFECTS__
function _a(e, t) {
	return new e(ga({
		type: "string",
		...w(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function va(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ya(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ba(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function xa(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Sa(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ca(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function wa(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ta(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ea(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Da(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Oa(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ka(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Aa(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ja(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ma(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Na(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Pa(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Fa(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ia(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function La(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ra(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function za(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ba(e, t) {
	return new e({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Va(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ha(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ua(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Wa(e, t) {
	return new e(ga({
		type: "number",
		checks: [],
		...w(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function Ga(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ka(e, t) {
	return new e({
		type: "boolean",
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function qa(e) {
	return new e({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function Ja(e, t) {
	return new e({
		type: "never",
		...w(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ya(e, t) {
	return new rr({
		check: "less_than",
		...w(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function Xa(e, t) {
	return new rr({
		check: "less_than",
		...w(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Za(e, t) {
	return new ir({
		check: "greater_than",
		...w(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function Qa(e, t) {
	return new ir({
		check: "greater_than",
		...w(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function $a(e, t) {
	return new ar({
		check: "multiple_of",
		...w(t),
		value: e
	});
}
// @__NO_SIDE_EFFECTS__
function eo(e, t) {
	return new sr({
		check: "max_length",
		...w(t),
		maximum: e
	});
}
// @__NO_SIDE_EFFECTS__
function to(e, t) {
	return new cr({
		check: "min_length",
		...w(t),
		minimum: e
	});
}
// @__NO_SIDE_EFFECTS__
function no(e, t) {
	return new lr({
		check: "length_equals",
		...w(t),
		length: e
	});
}
// @__NO_SIDE_EFFECTS__
function ro(e, t) {
	return new dr({
		check: "string_format",
		format: "regex",
		...w(t),
		pattern: e
	});
}
// @__NO_SIDE_EFFECTS__
function io(e) {
	return new fr({
		check: "string_format",
		format: "lowercase",
		...w(e)
	});
}
// @__NO_SIDE_EFFECTS__
function ao(e) {
	return new pr({
		check: "string_format",
		format: "uppercase",
		...w(e)
	});
}
// @__NO_SIDE_EFFECTS__
function oo(e, t) {
	return new mr({
		check: "string_format",
		format: "includes",
		...w(t),
		includes: e
	});
}
// @__NO_SIDE_EFFECTS__
function so(e, t) {
	return new hr({
		check: "string_format",
		format: "starts_with",
		...w(t),
		prefix: e
	});
}
// @__NO_SIDE_EFFECTS__
function co(e, t) {
	return new gr({
		check: "string_format",
		format: "ends_with",
		...w(t),
		suffix: e
	});
}
// @__NO_SIDE_EFFECTS__
function lo(e) {
	return new _r({
		check: "overwrite",
		tx: e
	});
}
// @__NO_SIDE_EFFECTS__
function uo(e) {
	return /* @__PURE__ */ lo((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function fo() {
	return /* @__PURE__ */ lo((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function po() {
	return /* @__PURE__ */ lo((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function mo() {
	return /* @__PURE__ */ lo((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function ho() {
	return /* @__PURE__ */ lo((e) => Ke(e));
}
// @__NO_SIDE_EFFECTS__
function go(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...w(n)
	});
}
// @__NO_SIDE_EFFECTS__
function _o(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...w(n)
	});
}
// @__NO_SIDE_EFFECTS__
function vo(e, t) {
	let n = /* @__PURE__ */ yo((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(wt(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", "input" in r || (r.input = t.value), r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(wt(r));
		}
	}, e(t.value, t)), t);
	return n;
}
// @__NO_SIDE_EFFECTS__
function yo(e, t) {
	let n = new er({
		check: "custom",
		...w(t)
	});
	return n._zod.check = e, n;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/to-json-schema.js
function bo(e, ...t) {
	for (let n of t) for (let t of Reflect.ownKeys(n)) Object.prototype.propertyIsEnumerable.call(n, t) && Le(e, t, n[t]);
	return e;
}
function xo(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? ha,
		target: t,
		unrepresentable: e?.unrepresentable ?? "throw",
		override: e?.override ?? (() => {}),
		io: e?.io ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		sharedDefsExtractedFor: void 0,
		sharedEmitDoneFor: void 0,
		cycles: e?.cycles ?? "ref",
		reused: e?.reused ?? "inline",
		intersections: [],
		deferred: [],
		external: e?.external ?? void 0
	};
}
function So(e, t, n, r, i) {
	let a = typeof t.unrepresentable == "function" ? t.unrepresentable({
		zodSchema: e,
		path: r.path,
		message: i
	}) : t.unrepresentable;
	if (a === "any") return !1;
	if (a === void 0 || a === "throw") throw Error(i);
	return Object.assign(n, a), !0;
}
function k(e, t, n = {
	path: [],
	schemaPath: []
}) {
	var r;
	let i = e._zod.def, a = t.seen.get(e);
	if (a) return a.count++, n.schemaPath.includes(e) && (a.cycle = n.path), a.schema;
	let o = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: n.path
	};
	t.seen.set(e, o), t.sharedDefsExtractedFor = void 0, t.sharedEmitDoneFor = void 0;
	let s = e._zod.toJSONSchema?.();
	if (s) o.schema = s;
	else {
		let r = {
			...n,
			schemaPath: [...n.schemaPath, e],
			path: n.path
		};
		if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, o.schema, r);
		else {
			let n = o.schema, a = t.processors[i.type];
			if (!a) throw Error(`[toJSONSchema]: Non-representable type encountered: ${i.type}`);
			a(e, t, n, r);
		}
		let a = e._zod.parent;
		a && (o.ref ||= a, k(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && bo(o.schema, c), t.io === "input" && Mo(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function Co(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function wo(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	if (e.external && e.sharedDefsExtractedFor === e.external) return;
	let r = /* @__PURE__ */ new Map();
	for (let t of e.seen.entries()) {
		let n = e.metadataRegistry.get(t[0])?.id;
		if (n) {
			let e = r.get(n);
			if (e && e !== t[0]) throw Error(`Duplicate schema id "${n}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
			r.set(n, t[0]);
		}
	}
	let i = (t) => {
		let r = e.target === "draft-2020-12" ? "$defs" : "definitions";
		if (e.external) {
			let n = e.external.registry.get(t[0])?.id, i = e.external.uri ?? ((e) => e);
			if (n) return { ref: i(n) };
			let a = t[1].defId ?? t[1].schema.id ?? `schema${e.counter++}`;
			return t[1].defId = a, {
				defId: a,
				ref: `${i("__shared")}#/${r}/${Co(a)}`
			};
		}
		let i = `#/${r}/`;
		if (t[1] === n && !t[1].schema.id) return { ref: "#" };
		let a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + Co(a)
		};
	}, a = (e) => {
		if (e[1].schema.$ref) return;
		let t = e[1], { ref: n, defId: r } = i(e);
		t.def = { ...t.schema }, r && (t.defId = r);
		let a = t.schema;
		for (let e in a) delete a[e];
		a.$ref = n;
	};
	if (e.cycles === "throw") for (let t of e.seen.entries()) {
		let e = t[1];
		if (e.cycle) throw Error(`Cycle detected: #/${e.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
	}
	for (let n of e.seen.entries()) {
		let r = n[1];
		if (t === n[0]) {
			a(n);
			continue;
		}
		if (e.external) {
			let r = e.external.registry.get(n[0])?.id;
			if (t !== n[0] && r) {
				a(n);
				continue;
			}
		}
		if (e.metadataRegistry.get(n[0])?.id) {
			a(n);
			continue;
		}
		if (r.cycle) {
			a(n);
			continue;
		}
		r.count > 1 && e.reused === "ref" && a(n);
	}
	e.external && (e.sharedDefsExtractedFor = e.external);
}
function To(e) {
	let t = e.anyOf;
	if (!Array.isArray(t) || t.length === 0 || e.type !== void 0) return;
	let n = [];
	for (let e of t) {
		if (!e || typeof e != "object") return;
		To(e);
		let t = Object.keys(e);
		if (t.length !== 1 || t[0] !== "type") return;
		let r = e.type;
		for (let e of Array.isArray(r) ? r : [r]) {
			if (typeof e != "string") return;
			n.includes(e) || n.push(e);
		}
	}
	delete e.anyOf, e.type = n.length === 1 ? n[0] : n;
}
var Eo = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]), Do = ["oneOf", "anyOf"];
function Oo(e) {
	let t = e.additionalProperties;
	return t === void 0 || t === !1 || typeof t != "object" || !t ? null : Object.keys(t).length ? t : null;
}
function ko(e) {
	let t = [];
	for (let n of e) {
		if (typeof n != "object" || n.type !== "object") return null;
		for (let e in n) if (!Eo.has(e)) return null;
		t.push(n);
	}
	let n = {}, r = /* @__PURE__ */ new Set();
	for (let e of t) {
		for (let r in e.properties) {
			if (Object.prototype.hasOwnProperty.call(n, r)) continue;
			let e = [];
			for (let n of t) {
				let t = n.properties?.[r] ?? Oo(n);
				t != null && (e.some((e) => JSON.stringify(e) === JSON.stringify(t)) || e.push(t));
			}
			Le(n, r, e.length === 1 ? e[0] : ko(e) ?? { allOf: e });
		}
		for (let t of e.required ?? []) r.add(t);
	}
	let i = {
		type: "object",
		properties: n
	};
	if (r.size && (i.required = [...r]), t.every((e) => e.additionalProperties === !1)) i.additionalProperties = !1;
	else {
		let e = [];
		for (let n of t) {
			let t = Oo(n);
			t && !e.some((e) => JSON.stringify(e) === JSON.stringify(t)) && e.push(t);
		}
		e.length === 1 ? i.additionalProperties = e[0] : e.length > 1 && (i.additionalProperties = { allOf: e });
	}
	return i;
}
function Ao(e) {
	let t = e.allOf;
	if (!Array.isArray(t) || t.length < 2) return;
	for (let t of Eo) if (t in e) return;
	let n = t.filter((e) => Do.some((t) => Array.isArray(e[t]))), r = null;
	if (!n.length) r = ko(t);
	else {
		let e = n[0], i = Do.find((t) => Array.isArray(e[t]));
		if (Object.keys(e).length !== 1) return;
		let a = t.filter((t) => t !== e), o = e[i].map((e) => ko([...a, e]));
		if (o.some((e) => !e)) return;
		r = { [i]: o };
	}
	r && (delete e.allOf, bo(e, r));
}
function jo(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : bo(i, s), bo(i, a), t._zod.parent === o) for (let e in i) e !== "$ref" && e !== "allOf" && (e in a || delete i[e]);
			if (s.$ref && n.def) for (let e in i) e !== "$ref" && e !== "allOf" && e in n.def && JSON.stringify(i[e]) === JSON.stringify(n.def[e]) && delete i[e];
		}
		let s = t._zod.parent;
		if (s && s !== o) {
			r(s);
			let t = e.seen.get(s);
			if (t?.schema.$ref && (i.$ref = t.schema.$ref, t.def)) for (let e in i) e !== "$ref" && e !== "allOf" && e in t.def && JSON.stringify(i[e]) === JSON.stringify(t.def[e]) && delete i[e];
		}
		e.override({
			zodSchema: t,
			jsonSchema: i,
			path: n.path ?? []
		});
	};
	if (!e.external || e.sharedEmitDoneFor !== e.external) {
		for (let t of [...e.seen.entries()].reverse()) r(t[0]);
		if (e.target !== "openapi-3.0") for (let t of e.seen.entries()) To(t[1].def ?? t[1].schema);
		for (let t of e.deferred) t();
		if (e.intersections.length) {
			let t = /* @__PURE__ */ new Map();
			for (let n of e.seen.values()) for (let e of [n.schema, n.def]) {
				let n = e?.allOf;
				if (!Array.isArray(n)) continue;
				let r = t.get(n);
				r ? r.push(e) : t.set(n, [e]);
			}
			for (let n of e.intersections) for (let e of t.get(n) ?? []) Ao(e);
		}
	}
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	bo(i, n.defId ? n.schema : n.def ?? n.schema);
	let a = e.metadataRegistry.get(t)?.id;
	a !== void 0 && i.id === a && delete i.id;
	let o = e.external?.defs ?? {};
	if (!e.external || e.sharedEmitDoneFor !== e.external) for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (e.def.id === e.defId && delete e.def.id, Le(o, e.defId, e.def));
	}
	e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(o).length > 0 && (e.target === "draft-2020-12" ? i.$defs = o : i.definitions = o);
	try {
		let n = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: Po(t, "input", e.processors),
					output: Po(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function Mo(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return Mo(r.element, n);
	if (r.type === "set") return Mo(r.valueType, n);
	if (r.type === "lazy") return Mo(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch") return Mo(r.innerType, n);
	if (r.type === "intersection") return Mo(r.left, n) || Mo(r.right, n);
	if (r.type === "record" || r.type === "map") return Mo(r.keyType, n) || Mo(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : Mo(r.in, n) || Mo(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (Mo(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (Mo(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (Mo(e, n)) return !0;
		return !!(r.rest && Mo(r.rest, n));
	}
	return !1;
}
var No = (e, t = {}) => (n) => {
	let r = xo({
		...n,
		processors: t
	});
	return k(e, r), wo(r, e), jo(r, e);
}, Po = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = xo({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return k(e, o), wo(o, e), jo(o, e);
}, Fo = (e, t, n) => {
	(e[t] === void 0 || n > e[t]) && (e[t] = n);
}, Io = (e, t, n) => {
	(e[t] === void 0 || n < e[t]) && (e[t] = n);
}, Lo = (e, t) => {
	Fo(e, "minimum", t), Io(e, "maximum", t);
}, Ro = (e, t) => {
	e.multipleOf ??= [], e.multipleOf.includes(t) || e.multipleOf.push(t);
}, zo = (e, t) => {
	e.patterns ??= /* @__PURE__ */ new Set(), e.patterns.add(t);
}, Bo = (e, t) => {
	e.mime = e.mime ? e.mime.filter((e) => t.includes(e)) : [...t];
}, Vo = (e, t) => {
	e.format = t, t.includes("int") && (e.isInt = !0);
}, Ho = (e, t) => Fo(e, "minimum", t.minimum), Uo = (e, t) => Io(e, "maximum", t.maximum), Wo = (e) => (t, n) => {
	Vo(t, n.format);
	let [r, i] = e[n.format];
	Fo(t, "minimum", r), Io(t, "maximum", i);
}, Go = {
	greater_than: (e, t) => Fo(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
	less_than: (e, t) => Io(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
	multiple_of: (e, t) => Ro(e, t.value),
	number_format: Wo(rt),
	bigint_format: Wo(it),
	min_length: Ho,
	max_length: Uo,
	length_equals: (e, t) => Lo(e, t.length),
	min_size: Ho,
	max_size: Uo,
	size_equals: (e, t) => Lo(e, t.size),
	string_format: (e, t) => {
		Vo(e, t.format), t.pattern && zo(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
	},
	mime_type: (e, t) => Bo(e, t.mime)
};
function Ko(e) {
	let t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
	for (let e of r) Go[e._zod.def.check]?.(t, e._zod.def);
	let i = e._zod.bag;
	i.minimum !== void 0 && Fo(t, "minimum", i.minimum), i.exclusiveMinimum !== void 0 && Fo(t, "exclusiveMinimum", i.exclusiveMinimum), i.maximum !== void 0 && Io(t, "maximum", i.maximum), i.exclusiveMaximum !== void 0 && Io(t, "exclusiveMaximum", i.exclusiveMaximum), i.multipleOf !== void 0 && Ro(t, i.multipleOf), i.format !== void 0 && (t.format ??= i.format, i.format.includes("int") && (t.isInt = !0)), i.mime && Bo(t, i.mime);
	for (let e of i.patterns ?? []) zo(t, e);
	return t;
}
var qo = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, Jo = /* @__PURE__ */ new Map([[ei, Rn], [ni, zn]]), Yo = (e) => Jo.get(e) ?? e, Xo = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l, laxFormat: u } = Ko(e);
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = qo[s] ?? s, i.format === "" && delete i.format, (s === "time" || u) && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c].map(Yo);
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, Zo = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, multipleOf: s, exclusiveMaximum: c, exclusiveMinimum: l, isInt: u } = Ko(e);
	i.type = u ? "integer" : "number";
	let d = typeof l == "number" && l >= (a ?? -Infinity), f = typeof c == "number" && c <= (o ?? Infinity), p = t.target === "draft-04" || t.target === "openapi-3.0";
	if (d ? p ? (i.minimum = l, i.exclusiveMinimum = !0) : i.exclusiveMinimum = l : typeof a == "number" && (i.minimum = a), f ? p ? (i.maximum = c, i.exclusiveMaximum = !0) : i.exclusiveMaximum = c : typeof o == "number" && (i.maximum = o), s) {
		let n = /* @__PURE__ */ new Set();
		for (let a of s) Number.isFinite(a) && a !== 0 ? n.add(Math.abs(a)) : So(e, t, i, r, `A multipleOf divisor of ${a} cannot be represented in JSON Schema`);
		let [a, ...o] = n;
		a !== void 0 && (i.multipleOf = a), o.length && (i.allOf = [...i.allOf ?? [], ...o.map((e) => ({ multipleOf: e }))]);
	}
}, Qo = (e, t, n, r) => {
	n.type = "boolean";
}, $o = (e, t, n, r) => {
	n.not = {};
}, es = (e, t, n, r) => {
	let i = e._zod.def, a = Ae(i.entries);
	if (a.length === 0) {
		n.not = {};
		return;
	}
	a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a;
}, ts = (e, t, n, r) => {
	let i = e._zod.def;
	if (i.values.length === 0) {
		n.not = {};
		return;
	}
	let a = [];
	for (let o of i.values) if (o === void 0) {
		if (So(e, t, n, r, "Literal `undefined` cannot be represented in JSON Schema")) return;
	} else if (typeof o == "bigint") {
		if (So(e, t, n, r, "BigInt literals cannot be represented in JSON Schema")) return;
		a.push(Number(o));
	} else a.push(o);
	if (a.length !== 0) {
		if (a.length === 1) {
			let e = a[0];
			n.type = e === null ? "null" : typeof e, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [e] : n.const = e;
		} else a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), a.every((e) => typeof e == "boolean") && (n.type = "boolean"), a.every((e) => e === null) && (n.type = "null"), n.enum = a;
	}
}, ns = (e, t, n, r) => {
	So(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, rs = (e, t, n, r) => {
	So(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, is = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = Ko(e);
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = k(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
};
function as(e) {
	let t = e._zod.def;
	return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? as(t.out) : t.type === "catch" ? as(t.innerType) : e._zod.optin;
}
var os = (e, t, n, r) => {
	let i = n, a = e._zod.def, o = a.shape;
	if (Object.getOwnPropertySymbols(o).length && So(e, t, i, r, "Symbol keys cannot be represented in JSON Schema")) return;
	i.type = "object", i.properties = {};
	for (let e in o) Le(i.properties, e, k(o[e], t, {
		...r,
		path: [
			...r.path,
			"properties",
			e
		]
	}));
	let s = [];
	for (let e of Object.keys(o)) {
		let n = a.shape[e];
		(t.io === "input" ? as(n) === void 0 : n._zod.optout === void 0) && s.push(e);
	}
	s.length > 0 && (i.required = s), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = k(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, ss = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => k(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, cs = (e, t, n, r) => {
	let i = e._zod.def, a = k(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = k(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1, c = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
	n.allOf = c, t.intersections.push(c);
};
function ls(e, t, n) {
	if (t.$ref) {
		if (n.has(t)) return t;
		n.add(t);
		let r = e.get(t)?.def;
		if (!r) return t;
		let i = ls(e, r, n);
		return i === r ? t : i;
	}
	for (let r of ["anyOf", "oneOf"]) {
		let i = t[r];
		if (!Array.isArray(i)) continue;
		let a = i.map((t) => ls(e, t, n));
		a.some((e, t) => e !== i[t]) && (t = {
			...t,
			[r]: a
		});
	}
	let r = Array.isArray(t.type) ? t.type : [t.type], i = !r.includes("string") && r.some((e) => e === "number" || e === "integer"), a = t.enum ?? (t.const === void 0 ? void 0 : [t.const]);
	if (!i && !a?.some((e) => typeof e == "number")) return t;
	let { minimum: o, maximum: s, exclusiveMinimum: c, exclusiveMaximum: l, multipleOf: u, format: d, id: f, ...p } = t;
	return p.enum ? p.enum = p.enum.map((e) => typeof e == "number" ? String(e) : e) : typeof p.const == "number" && (p.const = String(p.const)), i ? (p.type = "string", a || (p.pattern = (r.includes("number") ? Xn : Yn).source), p) : p;
}
var us = /* @__PURE__ */ new WeakMap();
function ds(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.seen.values()) n.def && !t.has(n.schema) && t.set(n.schema, n);
	let n = /* @__PURE__ */ new Map();
	for (let r of us.get(e) ?? []) {
		let i = e.seen.get(r), a = (i?.def ?? i?.schema)?.propertyNames;
		if (!a || a === !0 || n.has(a)) continue;
		let o = ls(t, a, /* @__PURE__ */ new Set());
		o !== a && n.set(a, o);
	}
	if (n.size) for (let t of e.seen.values()) for (let e of [t.schema, t.def]) {
		let t = e && n.get(e.propertyNames);
		t && (e.propertyNames = t);
	}
}
var fs = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object";
	let o = a.keyType, s = Ko(o).patterns;
	if (a.mode === "loose" && s && s.size > 0) {
		let e = k(a.valueType, t, {
			...r,
			path: [
				...r.path,
				"patternProperties",
				"*"
			]
		});
		i.patternProperties = {};
		for (let t of s) Le(i.patternProperties, Yo(t).source, e);
	} else {
		if (t.target === "draft-07" || t.target === "draft-2020-12") {
			i.propertyNames = k(a.keyType, t, {
				...r,
				path: [...r.path, "propertyNames"]
			});
			let n = us.get(t);
			n || (n = [], us.set(t, n), t.deferred.push(() => ds(t))), n.push(e);
		}
		i.additionalProperties = k(a.valueType, t, {
			...r,
			path: [...r.path, "additionalProperties"]
		});
	}
	let c = o._zod.values, l = t.io === "input" && as(a.valueType) !== void 0;
	if (c && !a.partial && !l) {
		let e = [...c].filter((e) => typeof e == "string" || typeof e == "number");
		e.length > 0 && (i.required = e.map(String));
	}
}, ps = (e, t, n, r) => {
	let i = e._zod.def, a = k(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, ms = (e, t, n, r) => {
	let i = e._zod.def;
	k(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, hs = Symbol();
function gs(e, t, n, r, i) {
	let a = !1, o = JSON.stringify(e, (e, t) => typeof t == "bigint" ? (a = !0, null) : t);
	return a ? (So(t, n, r, i, "BigInt defaults cannot be represented in JSON Schema"), hs) : JSON.parse(o);
}
var _s = (e, t, n, r) => {
	let i = e._zod.def;
	k(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o = gs(i.defaultValue, e, t, n, r);
	o !== hs && (n.default = o);
}, vs = (e, t, n, r) => {
	let i = e._zod.def;
	k(i.innerType, t, r);
	let a = t.seen.get(e);
	if (a.ref = i.innerType, t.io !== "input") return;
	let o = gs(i.defaultValue, e, t, n, r);
	o !== hs && (n._prefault = o);
}, ys = (e, t, n, r) => {
	let i = e._zod.def;
	k(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		So(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	n.default = o;
}, bs = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	k(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, xs = (e, t, n, r) => {
	let i = e._zod.def;
	k(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, Ss = (e, t, n, r) => {
	let i = e._zod.def;
	k(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Cs = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function ws(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		get() {
			let e = n(this);
			return Object.defineProperty(this, t, {
				value: e,
				configurable: !0,
				writable: !0
			}), e;
		},
		set(e) {
			Object.defineProperty(this, t, {
				value: e,
				configurable: !0,
				writable: !0
			});
		}
	});
}
var Ts = /*@__PURE__*/ E("ZodError", (e, t) => {
	Zt.init(e, t), e.name = "ZodError";
	let n = Object.getPrototypeOf(e);
	Cs.has(n) || (Cs.add(n), ws(n, "format", (e) => (t) => en(e, t)), ws(n, "flatten", (e) => (t) => $t(e, t)), ws(n, "addIssue", (e) => (t) => {
		e.issues.push(t), e.message = JSON.stringify(e.issues, Me, 2);
	}), ws(n, "addIssues", (e) => (t) => {
		e.issues.push(...t), e.message = JSON.stringify(e.issues, Me, 2);
	}), Object.defineProperty(n, "isEmpty", {
		configurable: !0,
		enumerable: !1,
		get() {
			return this.issues.length === 0;
		}
	}));
}, void 0, { Parent: Error }), Es = /* @__PURE__ */ nn(Ts), Ds = /* @__PURE__ */ rn(Ts), Os = /* @__PURE__ */ an(Ts), ks = /* @__PURE__ */ sn(Ts), As = /* @__PURE__ */ pn(Ts), js = /* @__PURE__ */ mn(Ts), Ms = /* @__PURE__ */ hn(Ts), Ns = /* @__PURE__ */ gn(Ts), Ps = /* @__PURE__ */ _n(Ts), Fs = /* @__PURE__ */ vn(Ts), Is = /* @__PURE__ */ yn(Ts), Ls = /* @__PURE__ */ bn(Ts);
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/schemas.js
function Rs() {
	Ut.localeError || Wt(da());
}
function zs() {
	Ut.memoizer || Wt({ memoizer: ca() });
}
var A = /*@__PURE__*/ E("ZodType", (e, t) => (Rs(), D.init(e, t), e.def = t, e.type = t.type, e), {
	check(...e) {
		let t = this.def;
		return this.clone(We(t, { checks: [...t.checks ?? [], ...e.map((e) => typeof e == "function" ? { _zod: {
			check: e,
			def: { check: "custom" },
			onattach: []
		} } : e)] }), { parent: !0 });
	},
	with(...e) {
		return this.check(...e);
	},
	clone(e, t) {
		return et(this, e, t);
	},
	brand() {
		return this;
	},
	register(e, t) {
		return e.add(this, t), this;
	},
	refine(e, t) {
		return this.check(el(e, t));
	},
	superRefine(e, t) {
		return this.check(tl(e, t));
	},
	overwrite(e) {
		return this.check(/* @__PURE__ */ lo(e));
	},
	optional() {
		return Ic(this);
	},
	exactOptional() {
		return Rc(this);
	},
	nullable() {
		return Bc(this);
	},
	nullish() {
		return Ic(Bc(this));
	},
	nonoptional(e) {
		return Kc(this, e);
	},
	array() {
		return N(this);
	},
	or(e) {
		return wc([this, e]);
	},
	and(e) {
		return Ec(this, e);
	},
	transform(e) {
		return Xc(this, Pc(e));
	},
	default(e) {
		return Hc(this, e);
	},
	prefault(e) {
		return Wc(this, e);
	},
	catch(e) {
		return Jc(this, e);
	},
	pipe(e) {
		return Xc(this, e);
	},
	readonly() {
		return Qc(this);
	},
	describe(e) {
		let t = this.clone();
		return ha.add(t, { description: e }), t;
	},
	meta(...e) {
		if (e.length === 0) return ha.get(this);
		let t = this.clone();
		return ha.add(t, e[0]), t;
	},
	isOptional() {
		return this.safeParse(void 0).success;
	},
	isNullable() {
		return this.safeParse(null).success;
	},
	apply(e, ...t) {
		return t.length === 0 ? e(this) : e(this, ...t);
	},
	get "~standard"() {
		return Dt(this, "~standard", {
			...Sr(this),
			jsonSchema: {
				input: Po(this, "input"),
				output: Po(this, "output")
			}
		});
	},
	set "~standard"(e) {
		Et(this, "~standard", e);
	},
	parse: function e(t, n) {
		return Es(this, t, n, { callee: e });
	},
	parseAsync: async function e(t, n) {
		return await Ds(this, t, n, { callee: e });
	},
	safeParse(e, t) {
		return Os(this, e, t);
	},
	async safeParseAsync(e, t) {
		return ks(this, e, t);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(e) {
		Et(this, "spa", e);
	},
	validate(e, t) {
		return un(this, e, t);
	},
	validateAsync(e, t) {
		return fn(this, e, t);
	},
	encode: function e(t, n) {
		return As(this, t, n, { callee: e });
	},
	decode: function e(t, n) {
		return js(this, t, n, { callee: e });
	},
	encodeAsync: async function e(t, n) {
		return await Ms(this, t, n, { callee: e });
	},
	decodeAsync: async function e(t, n) {
		return await Ns(this, t, n, { callee: e });
	},
	safeEncode(e, t) {
		return Ps(this, e, t);
	},
	safeDecode(e, t) {
		return Fs(this, e, t);
	},
	async safeEncodeAsync(e, t) {
		return Is(this, e, t);
	},
	async safeDecodeAsync(e, t) {
		return Ls(this, e, t);
	},
	toJSONSchema(e) {
		return No(this, {})(e);
	},
	get description() {
		return ha.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
}), Bs = /*@__PURE__*/ E("_ZodString", (e, t) => {
	Cr.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => Xo(e, t, n, r);
}, /*@__PURE__*/ Ot({
	format: (e) => Ko(e).format ?? null,
	minLength: (e) => Ko(e).minimum ?? null,
	maxLength: (e) => Ko(e).maximum ?? null
}, {
	regex(...e) {
		return this.check(/* @__PURE__ */ ro(...e));
	},
	includes(...e) {
		return this.check(/* @__PURE__ */ oo(...e));
	},
	startsWith(...e) {
		return this.check(/* @__PURE__ */ so(...e));
	},
	endsWith(...e) {
		return this.check(/* @__PURE__ */ co(...e));
	},
	min(...e) {
		return this.check(/* @__PURE__ */ to(...e));
	},
	max(...e) {
		return this.check(/* @__PURE__ */ eo(...e));
	},
	length(...e) {
		return this.check(/* @__PURE__ */ no(...e));
	},
	nonempty(...e) {
		return this.check(/* @__PURE__ */ to(1, ...e));
	},
	lowercase(e) {
		return this.check(/* @__PURE__ */ io(e));
	},
	uppercase(e) {
		return this.check(/* @__PURE__ */ ao(e));
	},
	trim() {
		return this.check(/* @__PURE__ */ fo());
	},
	normalize(...e) {
		return this.check(/* @__PURE__ */ uo(...e));
	},
	toLowerCase() {
		return this.check(/* @__PURE__ */ po());
	},
	toUpperCase() {
		return this.check(/* @__PURE__ */ mo());
	},
	slugify() {
		return this.check(/* @__PURE__ */ ho());
	}
})), Vs = /*@__PURE__*/ E("ZodString", (e, t) => {
	Cr.init(e, t), Bs.init(e, t);
}, {
	email(e) {
		return this.check(/* @__PURE__ */ va(Ks, e));
	},
	url(e) {
		return this.check(/* @__PURE__ */ wa(Ys, e));
	},
	jwt(e) {
		return this.check(/* @__PURE__ */ za(uc, e));
	},
	emoji(e) {
		return this.check(/* @__PURE__ */ Ta(Xs, e));
	},
	guid(e) {
		return this.check(/* @__PURE__ */ ya(qs, e));
	},
	uuid(e) {
		return this.check(/* @__PURE__ */ ba(Js, e));
	},
	uuidv4(e) {
		return this.check(/* @__PURE__ */ xa(Js, e));
	},
	uuidv6(e) {
		return this.check(/* @__PURE__ */ Sa(Js, e));
	},
	uuidv7(e) {
		return this.check(/* @__PURE__ */ Ca(Js, e));
	},
	nanoid(e) {
		return this.check(/* @__PURE__ */ Ea(Zs, e));
	},
	cuid(e) {
		return this.check(/* @__PURE__ */ Da(Qs, e));
	},
	cuid2(e) {
		return this.check(/* @__PURE__ */ Oa($s, e));
	},
	ulid(e) {
		return this.check(/* @__PURE__ */ ka(ec, e));
	},
	base64(e) {
		return this.check(/* @__PURE__ */ Ia(sc, e));
	},
	base64url(e) {
		return this.check(/* @__PURE__ */ La(cc, e));
	},
	xid(e) {
		return this.check(/* @__PURE__ */ Aa(tc, e));
	},
	ksuid(e) {
		return this.check(/* @__PURE__ */ ja(nc, e));
	},
	ipv4(e) {
		return this.check(/* @__PURE__ */ Ma(rc, e));
	},
	ipv6(e) {
		return this.check(/* @__PURE__ */ Na(ic, e));
	},
	cidrv4(e) {
		return this.check(/* @__PURE__ */ Pa(ac, e));
	},
	cidrv6(e) {
		return this.check(/* @__PURE__ */ Fa(oc, e));
	},
	e164(e) {
		return this.check(/* @__PURE__ */ Ra(lc, e));
	},
	datetime(e) {
		return this.check(/* @__PURE__ */ Ba(Hs, e));
	},
	date(e) {
		return this.check(/* @__PURE__ */ Va(Us, e));
	},
	time(e) {
		return this.check(/* @__PURE__ */ Ha(Ws, e));
	},
	duration(e) {
		return this.check(/* @__PURE__ */ Ua(Gs, e));
	}
});
function j(e) {
	return /* @__PURE__ */ _a(Vs, e);
}
var M = /*@__PURE__*/ E("ZodStringFormat", (e, t) => {
	O.init(e, t), Bs.init(e, t);
}), Hs = /*@__PURE__*/ E("ZodISODateTime", (e, t) => {
	Hr.init(e, t), M.init(e, t);
}), Us = /*@__PURE__*/ E("ZodISODate", (e, t) => {
	Ur.init(e, t), M.init(e, t);
}), Ws = /*@__PURE__*/ E("ZodISOTime", (e, t) => {
	Wr.init(e, t), M.init(e, t);
}), Gs = /*@__PURE__*/ E("ZodISODuration", (e, t) => {
	Gr.init(e, t), M.init(e, t);
}), Ks = /*@__PURE__*/ E("ZodEmail", (e, t) => {
	Er.init(e, t), M.init(e, t);
}), qs = /*@__PURE__*/ E("ZodGUID", (e, t) => {
	wr.init(e, t), M.init(e, t);
}), Js = /*@__PURE__*/ E("ZodUUID", (e, t) => {
	Tr.init(e, t), M.init(e, t);
}), Ys = /*@__PURE__*/ E("ZodURL", (e, t) => {
	Pr.init(e, t), M.init(e, t);
}), Xs = /*@__PURE__*/ E("ZodEmoji", (e, t) => {
	Fr.init(e, t), M.init(e, t);
}), Zs = /*@__PURE__*/ E("ZodNanoID", (e, t) => {
	Ir.init(e, t), M.init(e, t);
}), Qs = /*@__PURE__*/ E("ZodCUID", (e, t) => {
	Lr.init(e, t), M.init(e, t);
}), $s = /*@__PURE__*/ E("ZodCUID2", (e, t) => {
	Rr.init(e, t), M.init(e, t);
}), ec = /*@__PURE__*/ E("ZodULID", (e, t) => {
	zr.init(e, t), M.init(e, t);
}), tc = /*@__PURE__*/ E("ZodXID", (e, t) => {
	Br.init(e, t), M.init(e, t);
}), nc = /*@__PURE__*/ E("ZodKSUID", (e, t) => {
	Vr.init(e, t), M.init(e, t);
}), rc = /*@__PURE__*/ E("ZodIPv4", (e, t) => {
	Kr.init(e, t), M.init(e, t);
}), ic = /*@__PURE__*/ E("ZodIPv6", (e, t) => {
	Yr.init(e, t), M.init(e, t);
}), ac = /*@__PURE__*/ E("ZodCIDRv4", (e, t) => {
	Xr.init(e, t), M.init(e, t);
}), oc = /*@__PURE__*/ E("ZodCIDRv6", (e, t) => {
	Qr.init(e, t), M.init(e, t);
}), sc = /*@__PURE__*/ E("ZodBase64", (e, t) => {
	ti.init(e, t), M.init(e, t);
}), cc = /*@__PURE__*/ E("ZodBase64URL", (e, t) => {
	ii.init(e, t), M.init(e, t);
}), lc = /*@__PURE__*/ E("ZodE164", (e, t) => {
	ai.init(e, t), M.init(e, t);
}), uc = /*@__PURE__*/ E("ZodJWT", (e, t) => {
	si.init(e, t), M.init(e, t);
}), dc = /*@__PURE__*/ E("ZodNumber", (e, t) => {
	ci.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => Zo(e, t, n, r), e.isFinite = !0;
}, /*@__PURE__*/ Ot({
	minValue: (e) => {
		let { minimum: t, exclusiveMinimum: n } = Ko(e);
		return Math.max(t ?? -Infinity, n ?? -Infinity);
	},
	maxValue: (e) => {
		let { maximum: t, exclusiveMaximum: n } = Ko(e);
		return Math.min(t ?? Infinity, n ?? Infinity);
	},
	isInt: (e) => {
		let { isInt: t, multipleOf: n } = Ko(e);
		return !!t || !!n?.some(Number.isSafeInteger);
	},
	format: (e) => Ko(e).format ?? null
}, {
	gt(e, t) {
		return this.check(/* @__PURE__ */ Za(e, t));
	},
	gte(e, t) {
		return this.check(/* @__PURE__ */ Qa(e, t));
	},
	min(e, t) {
		return this.check(/* @__PURE__ */ Qa(e, t));
	},
	lt(e, t) {
		return this.check(/* @__PURE__ */ Ya(e, t));
	},
	lte(e, t) {
		return this.check(/* @__PURE__ */ Xa(e, t));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ Xa(e, t));
	},
	int(e) {
		return this.check(mc(e));
	},
	safe(e) {
		return this.check(mc(e));
	},
	positive(e) {
		return this.check(/* @__PURE__ */ Za(0, e));
	},
	nonnegative(e) {
		return this.check(/* @__PURE__ */ Qa(0, e));
	},
	negative(e) {
		return this.check(/* @__PURE__ */ Ya(0, e));
	},
	nonpositive(e) {
		return this.check(/* @__PURE__ */ Xa(0, e));
	},
	multipleOf(e, t) {
		return this.check(/* @__PURE__ */ $a(e, t));
	},
	step(e, t) {
		return this.check(/* @__PURE__ */ $a(e, t));
	},
	finite() {
		return this;
	}
}));
function fc(e) {
	return /* @__PURE__ */ Wa(dc, e);
}
var pc = /*@__PURE__*/ E("ZodNumberFormat", (e, t) => {
	li.init(e, t), dc.init(e, t);
});
function mc(e) {
	return /* @__PURE__ */ Ga(pc, e);
}
var hc = /*@__PURE__*/ E("ZodBoolean", (e, t) => {
	ui.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => Qo(e, t, n, r);
});
function gc(e) {
	return /* @__PURE__ */ Ka(hc, e);
}
var _c = /*@__PURE__*/ E("ZodUnknown", (e, t) => {
	di.init(e, t), A.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function vc() {
	return /* @__PURE__ */ qa(_c);
}
var yc = /*@__PURE__*/ E("ZodNever", (e, t) => {
	fi.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => $o(e, t, n, r);
});
function bc(e) {
	return /* @__PURE__ */ Ja(yc, e);
}
var xc = /*@__PURE__*/ E("ZodArray", (e, t) => {
	zs(), mi.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => is(e, t, n, r), e.element = t.element;
}, {
	min(e, t) {
		return this.check(/* @__PURE__ */ to(e, t));
	},
	nonempty(e) {
		return this.check(/* @__PURE__ */ to(1, e));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ eo(e, t));
	},
	length(e, t) {
		return this.check(/* @__PURE__ */ no(e, t));
	},
	unwrap() {
		return this.element;
	}
});
function N(e, t) {
	return /* @__PURE__ */ go(xc, e, t);
}
var Sc = /*@__PURE__*/ E("ZodObject", (e, t) => {
	zs(), bi.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => os(e, t, n, r), Pt(e, "shape", (e) => e._zod.def.shape, !1);
}, {
	keyof() {
		return Ac(Object.keys(this._zod.def.shape));
	},
	catchall(e) {
		return this.clone(We(this._zod.def, { catchall: e }));
	},
	passthrough() {
		return this.clone(We(this._zod.def, { catchall: vc() }));
	},
	loose() {
		return this.clone(We(this._zod.def, { catchall: vc() }));
	},
	strict() {
		return this.clone(We(this._zod.def, { catchall: bc() }));
	},
	strip() {
		return this.clone(We(this._zod.def, { catchall: void 0 }));
	},
	extend(e) {
		return ct(this, e);
	},
	safeExtend(e) {
		return ut(this, e);
	},
	merge(e) {
		return dt(this, e);
	},
	pick(e) {
		return at(this, e);
	},
	omit(e) {
		return st(this, e);
	},
	partial(...e) {
		return ft(Fc, this, e[0]);
	},
	exactPartial(...e) {
		return ft(Lc, this, e[0], "exactPartial");
	},
	required(...e) {
		return pt(Gc, this, e[0]);
	}
});
function P(e, t) {
	return new Sc({
		type: "object",
		shape: e ?? {},
		...w(t)
	});
}
var Cc = /*@__PURE__*/ E("ZodUnion", (e, t) => {
	Si.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => ss(e, t, n, r), e.options = t.options;
});
function wc(e, t) {
	return new Cc({
		type: "union",
		options: e,
		...w(t)
	});
}
var Tc = /*@__PURE__*/ E("ZodIntersection", (e, t) => {
	Ci.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => cs(e, t, n, r);
});
function Ec(e, t) {
	return new Tc({
		type: "intersection",
		left: e,
		right: t
	});
}
var Dc = /*@__PURE__*/ E("ZodRecord", (e, t) => {
	zs(), Ei.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => fs(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function Oc(e, t, n) {
	return !t || !t._zod ? new Dc({
		type: "record",
		keyType: j(),
		valueType: e,
		...w(t)
	}) : new Dc({
		type: "record",
		keyType: e,
		valueType: t,
		...w(n)
	});
}
var kc = /*@__PURE__*/ E("ZodEnum", (e, t) => {
	Di.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => es(e, t, n, r), e.enum = t.entries, e.options = [...e._zod.values];
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new kc({
			...t,
			checks: [],
			...w(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new kc({
			...t,
			checks: [],
			...w(r),
			entries: i
		});
	};
});
function Ac(e, t) {
	return new kc({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...w(t)
	});
}
var jc = /*@__PURE__*/ E("ZodLiteral", (e, t) => {
	Oi.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => ts(e, t, n, r), e.values = new Set(t.values), Object.defineProperty(e, "value", { get() {
		if (t.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return t.values[0];
	} });
});
function Mc(e, t) {
	return new jc({
		type: "literal",
		values: Array.isArray(e) ? e : [e],
		...w(t)
	});
}
var Nc = /*@__PURE__*/ E("ZodTransform", (e, t) => {
	zs(), ki.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => rs(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new Ht(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(wt(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", "input" in t || (t.input = n.value), t.inst ??= e, n.issues.push(wt(t));
			}
		};
		let i = t.transform(n.value, n);
		return i instanceof Promise ? i.then((e) => (n.value = e, n)) : (n.value = i, n);
	};
});
function Pc(e) {
	return new Nc({
		type: "transform",
		transform: e
	});
}
var Fc = /*@__PURE__*/ E("ZodOptional", (e, t) => {
	ji.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ss(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Ic(e) {
	return new Fc({
		type: "optional",
		innerType: e
	});
}
var Lc = /*@__PURE__*/ E("ZodExactOptional", (e, t) => {
	Mi.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ss(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Rc(e) {
	return new Lc({
		type: "optional",
		innerType: e
	});
}
var zc = /*@__PURE__*/ E("ZodNullable", (e, t) => {
	Ni.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => ps(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Bc(e) {
	return new zc({
		type: "nullable",
		innerType: e
	});
}
var Vc = /*@__PURE__*/ E("ZodDefault", (e, t) => {
	Pi.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => _s(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function Hc(e, t) {
	return new Vc({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : Ze(t);
		}
	});
}
var Uc = /*@__PURE__*/ E("ZodPrefault", (e, t) => {
	Ii.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => vs(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Wc(e, t) {
	return new Uc({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : Ze(t);
		}
	});
}
var Gc = /*@__PURE__*/ E("ZodNonOptional", (e, t) => {
	Li.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => ms(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Kc(e, t) {
	return new Gc({
		type: "nonoptional",
		innerType: e,
		...w(t)
	});
}
var qc = /*@__PURE__*/ E("ZodCatch", (e, t) => {
	Bi.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => ys(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Jc(e, t) {
	return new qc({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : It(t)
	});
}
var Yc = /*@__PURE__*/ E("ZodPipe", (e, t) => {
	Vi.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => bs(e, t, n, r), e.in = t.in, e.out = t.out;
});
function Xc(e, t) {
	return new Yc({
		type: "pipe",
		in: e,
		out: t
	});
}
var Zc = /*@__PURE__*/ E("ZodReadonly", (e, t) => {
	Ui.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => xs(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Qc(e) {
	return new Zc({
		type: "readonly",
		innerType: e
	});
}
var $c = /*@__PURE__*/ E("ZodCustom", (e, t) => {
	Gi.init(e, t), A.init(e, t), e._zod.processJSONSchema = (t, n, r) => ns(e, t, n, r);
});
function el(e, t = {}) {
	return /* @__PURE__ */ _o($c, e, t);
}
function tl(e, t) {
	return /* @__PURE__ */ vo(e, t);
}
ke();
function nl(e, t) {
	let n = te(), r = n.journals?.journalEntries ?? [], i = n.bankReconciliations?.reconciliations ?? [], a = r.filter((n) => n.sourceType === e && n.sourceId === t).map((e) => e.id);
	if (i.some((e) => e.clearedTransactionIds.some((e) => a.some((t) => e.startsWith(t + ":"))))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function rl(e, t) {
	let n = te(), r = n.bankAccounts?.bankAccounts ?? [], i = n.bankReconciliations?.reconciliations ?? [];
	for (let n of r.filter((e) => t.includes(e.glAccountId))) {
		let t = i.filter((e) => e.bankAccountId === n.id).map((e) => e.statementDate).sort().at(-1);
		if (t && e <= t) throw Error(`Bank account is reconciled through ${t}. Use a posting date after that statement.`);
	}
}
//#endregion
//#region src/features/inventory/data/mockProducts.ts
var il = [
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
function al(e) {
	return il.find((t) => t.id === e);
}
function ol(e, t) {
	return al(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/business-workspace/productRules.ts
function sl(e, t, n, r) {
	let i = al(e), a = ol(e, t);
	if (!i || i.status !== "ACTIVE" || !a?.active) throw Error("Select an active product and unit.");
	if (r === "buy" && i.buyEnabled === !1 || r === "sell" && i.sellEnabled === !1) throw Error(`Product is not available to ${r}.`);
	if (!Number.isFinite(n) || n <= 0) throw Error("Quantity must be finite and greater than zero.");
	if (i.wholePacks && [
		"BOX",
		"ROLL",
		"BUCKET"
	].includes(a.code) && !Number.isInteger(n)) throw Error("This product must be ordered in whole packs.");
}
//#endregion
//#region src/features/sales/data/quoteStorage.ts
var cl = "htt.mock.sales.quotes.v1", ll = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function ul(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !ll.has(String(t.status)) || ![
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
function dl() {
	return ie(cl, ul);
}
function fl(e) {
	if (dl().status === "invalid" || !ae("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!g("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var pl = "htt.mock.sales.quote-orders.v1";
function ml(e) {
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
function hl(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!ul(t.quotes) || !ml(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function gl() {
	return ie(pl, hl);
}
function _l(e) {
	if (!hl(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = gl(), n = dl();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !ae("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!g("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var vl = "htt.mock.sales.documents.v1";
function yl(e) {
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
function bl(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!hl(t) || !yl(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function xl() {
	return ie(vl, bl);
}
function Sl(e) {
	if (!bl(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = xl();
	if (t.status === "invalid" || t.status === "unavailable" || !ae("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!g("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/accounting/data/accountingPeriodRepository.ts
var Cl = [], wl, Tl, El = /* @__PURE__ */ new Set();
function Dl(e, t) {
	wl = e, Tl = t;
}
function Ol() {
	let e = Tl?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function kl(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function Al(e) {
	let t = Cl.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function jl() {
	El.forEach((e) => e());
}
function Ml(e) {
	if (p(e, "Posting date"), !Cl.length) return;
	let t = Cl.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!Cl.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
o("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => Cl,
		subscribe(e) {
			return El.add(e), () => {
				El.delete(e);
			};
		},
		create(e) {
			let t = Ol(), n = kl(e.reason);
			if (p(e.startDate), p(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (Cl.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (Cl.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
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
			return Cl = [...Cl, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), jl(), r;
		},
		preflight(e) {
			let t = Al(e);
			if (!wl) throw Error("Trusted close checks unavailable.");
			return wl(t);
		},
		close(e) {
			let t = Ol(), n = kl(e.reason), r = Al(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (Cl.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return Cl = Cl.map((e) => e.id === r.id ? {
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
			} : e), jl(), Al(e.id);
		},
		reopen(e) {
			let t = Ol(), n = kl(e.reason), r = Al(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (Cl.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return Cl = Cl.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), jl(), Al(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: Cl }),
	restore: (e) => {
		h(e.periods), Cl = e.periods;
	},
	publish: jl
});
//#endregion
//#region src/features/purchases/data/mockPurchaseOrders.ts
var Nl = [{
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
}], Pl = [{
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
}], Fl = "htt:financial-snapshot:v1", Il = (e) => !!e && typeof e == "object" && !Array.isArray(e), Ll = (e) => new Set(e.map((e) => e.id)).size === e.length, Rl = (e) => {
	if (!Il(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => Il(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => Il(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => Il(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => Il(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
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
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => Il(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && Il(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && Il(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && Il(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && Ll(t) && Ll(n) && Ll(r) && Ll(i);
}, zl = () => ({
	purchaseOrders: structuredClone(Nl),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone(Pl),
	transactions: [],
	transfers: [],
	journals: []
}), Bl, Vl = !1;
function Hl() {
	return typeof window < "u" && !!window.localStorage;
}
function Ul() {
	if (Bl) return Bl;
	if (!Hl()) return zl();
	let e = ie(Fl, Rl);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return Vl = e.status === "ok", Bl = e.status === "ok" ? {
		...zl(),
		...e.data
	} : zl(), Bl;
}
var Wl = /* @__PURE__ */ new Set(), Gl = 0, Kl = /* @__PURE__ */ new Set();
function ql(e) {
	if (Hl() && !g(Fl, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var F = {
	wasRestoredOnLoad() {
		return Ul(), Vl;
	},
	onRollback(e) {
		Wl.add(e);
	},
	notify(e) {
		Gl ? Kl.add(e) : e();
	},
	transaction(e) {
		if (Gl) return e();
		let t = structuredClone(Ul());
		Bl = structuredClone(t), Gl++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			ql(Ul());
		} catch (e) {
			throw Bl = t, Wl.forEach((e) => e()), Kl.clear(), e;
		} finally {
			Gl--;
		}
		let r = [...Kl];
		return Kl.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(Ul());
	},
	update(e, t) {
		let n = {
			...Ul(),
			[e]: structuredClone(t)
		};
		if (!Rl(n)) throw Error("Invalid financial snapshot; write blocked.");
		Gl || ql(n), Bl = n;
	},
	resetCacheForTests() {
		Bl = void 0, Vl = !1;
	}
};
o("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => F.read(),
	restore: (e) => {
		Bl = e;
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/accountRepository.ts
var Jl = /* @__PURE__ */ new Set(), I = "2026-10-08T00:00:00.000Z", L = [
	{
		id: "acc_1000",
		code: "1000",
		name: "Operating Bank",
		type: "ASSET",
		systemRole: "BANK",
		active: !0,
		allowManualPosting: !0,
		createdAt: I,
		updatedAt: I
	},
	{
		id: "acc_1010",
		code: "1010",
		name: "Savings Bank",
		type: "ASSET",
		active: !0,
		allowManualPosting: !0,
		createdAt: I,
		updatedAt: I
	},
	{
		id: "acc_1100",
		code: "1100",
		name: "Accounts Receivable",
		type: "ASSET",
		systemRole: "ACCOUNTS_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: I,
		updatedAt: I
	},
	{
		id: "acc_1200",
		code: "1200",
		name: "Inventory",
		type: "ASSET",
		systemRole: "INVENTORY",
		active: !0,
		allowManualPosting: !1,
		createdAt: I,
		updatedAt: I
	},
	{
		id: "acc_1300",
		code: "1300",
		name: "GST Receivable",
		type: "ASSET",
		systemRole: "GST_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: I,
		updatedAt: I
	},
	{
		id: "acc_2000",
		code: "2000",
		name: "Accounts Payable",
		type: "LIABILITY",
		systemRole: "ACCOUNTS_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: I,
		updatedAt: I
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
		createdAt: I,
		updatedAt: I
	},
	{
		id: "acc_2100",
		code: "2100",
		name: "GST Payable",
		type: "LIABILITY",
		systemRole: "GST_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: I,
		updatedAt: I
	},
	{
		id: "acc_3000",
		code: "3000",
		name: "Owner's Equity",
		type: "EQUITY",
		systemRole: "OWNERS_EQUITY",
		active: !0,
		allowManualPosting: !0,
		createdAt: I,
		updatedAt: I
	},
	{
		id: "acc_3100",
		code: "3100",
		name: "Retained Earnings",
		type: "EQUITY",
		systemRole: "RETAINED_EARNINGS",
		active: !0,
		allowManualPosting: !1,
		createdAt: I,
		updatedAt: I
	},
	{
		id: "acc_4000",
		code: "4000",
		name: "Sales Revenue",
		type: "REVENUE",
		systemRole: "SALES_REVENUE",
		active: !0,
		allowManualPosting: !1,
		createdAt: I,
		updatedAt: I
	},
	{
		id: "acc_5000",
		code: "5000",
		name: "Cost of Goods Sold",
		type: "EXPENSE",
		systemRole: "COST_OF_GOODS_SOLD",
		active: !0,
		allowManualPosting: !1,
		createdAt: I,
		updatedAt: I
	},
	{
		id: "acc_5100",
		code: "5100",
		name: "Purchases / Materials",
		type: "EXPENSE",
		systemRole: "PURCHASES",
		active: !0,
		allowManualPosting: !0,
		createdAt: I,
		updatedAt: I
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
		createdAt: I,
		updatedAt: I
	},
	{
		id: "acc_5200",
		code: "5200",
		name: "Freight",
		type: "EXPENSE",
		systemRole: "FREIGHT",
		active: !0,
		allowManualPosting: !0,
		createdAt: I,
		updatedAt: I
	},
	{
		id: "acc_5300",
		code: "5300",
		name: "Operating Expenses",
		type: "EXPENSE",
		systemRole: "OPERATING_EXPENSE",
		active: !0,
		allowManualPosting: !0,
		createdAt: I,
		updatedAt: I
	}
];
function Yl() {
	Jl.forEach((e) => e());
}
function Xl(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function Zl(e) {
	return e?.trim() || void 0;
}
function Ql(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function $l(e, t) {
	if (L.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function eu(e, t) {
	if (!e) return;
	let n = L.find((n) => n.id !== t && (ee(e) ? n.id === ee(e) : n.systemRole === e));
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function tu() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var R = {
	subscribe(e) {
		return Jl.add(e), () => {
			Jl.delete(e);
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
	getByCode(e) {
		return L.find((t) => t.code.toLowerCase() === e.trim().toLowerCase());
	},
	getBySystemRole(e) {
		return L.find((t) => ee(e) ? t.id === ee(e) : t.systemRole === e);
	},
	requireById(e) {
		let t = L.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = L.find((t) => ee(e) ? t.id === ee(e) : t.systemRole === e);
		if (!t) throw Error(`Accounting account for system role ${e} was not found.`);
		return t;
	},
	create(e) {
		let t = Xl(e.code, "Account code"), n = Xl(e.name, "Account name");
		Ql(t), $l(t), eu(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: tu(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: Zl(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return L = [...L, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), Yl(), i;
	},
	update(e, t) {
		let n = L.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = Xl(t.code, "Account code"), i = Xl(t.name, "Account name");
		if (Ql(r), $l(r, e), (n.systemRole || c(n.id)) && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: Zl(t.description),
			active: n.systemRole || c(n.id) ? !0 : t.active,
			allowManualPosting: n.systemRole || c(n.id) ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return L = L.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), Yl(), a;
	},
	setActive(e, t) {
		let n = L.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		if ((n.systemRole || c(n.id)) && !t) throw Error("System control accounts cannot be deactivated.");
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return L = L.map((t) => t.id === e ? r : t), Yl(), r;
	}
};
o("accounts", {
	repository: R,
	read: "accounting.read",
	commands: {
		if: null,
		create: "accounting.post",
		update: "accounting.post",
		setActive: "accounting.post"
	},
	snapshot: () => ({ accounts: L }),
	restore: (e) => {
		L = e.accounts;
	},
	publish: () => Jl.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var nu = /* @__PURE__ */ new Set(), ru = F.read().journals;
F.onRollback(() => {
	ru = F.read().journals;
});
function iu() {
	nu.forEach((e) => F.notify(e));
}
function au(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ou(e) {
	return e?.trim() || void 0;
}
function su(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function cu(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = ru.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function lu(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function uu(e) {
	if (su(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = R.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = au(r.debit), o = au(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = au(t + a), n = au(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function du(e) {
	return e.lines.map((e, t) => {
		let n = R.requireById(e.accountId);
		return {
			id: lu(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: ou(e.description),
			debit: au(e.debit),
			credit: au(e.credit)
		};
	});
}
function fu(e, t) {
	return ru.find((n) => n.sourceType === e && n.sourceId === t && !n.reversedJournalEntryId);
}
var z = {
	subscribe(e) {
		return nu.add(e), () => {
			nu.delete(e);
		};
	},
	getSnapshot() {
		return ru;
	},
	getAll() {
		return ru;
	},
	getById(e) {
		return ru.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return ru.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: fu,
	post(e) {
		Ml(e.journalDate), rl(e.journalDate, e.lines.map((e) => e.accountId));
		let t = uu(e), n = ou(e.sourceId);
		if (n) {
			let t = fu(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: lu("je"),
			journalNumber: cu(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: ou(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: du(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...ru];
		return F.update("journals", a), ru = a, iu(), i;
	},
	reverse(e) {
		Ml(e.reversalDate);
		let t = ru.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (su(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Reversal reason must contain at least 3 characters.");
		rl(e.reversalDate, t.lines.map((e) => e.accountId));
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
		}, i = uu(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: lu("je"),
			journalNumber: cu(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: du(r),
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
		}, c = [o, ...ru.map((e) => e.id === t.id ? s : e)];
		return F.update("journals", c), ru = c, iu(), o;
	}
};
o("journals", {
	repository: z,
	read: "accounting.read",
	commands: {
		if: null,
		validateDate: null,
		for: null,
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ journalEntries: ru }),
	restore: (e) => {
		ru = e.journalEntries;
	},
	publish: () => nu.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var pu = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function mu(e) {
	let t = e.filter((e) => pu.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function hu() {
	mu(y.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var gu = [{
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
}], _u = [{
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
}], vu = [{
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
}], yu = /* @__PURE__ */ new Set(), bu = le(), xu = bu.status === "ok" ? structuredClone(bu.data.creditNotes) : [], Su = bu.status === "ok" ? structuredClone(bu.data.allocations) : [], Cu = [...xu], wu = [...Su];
function Tu() {
	Cu = [...xu], wu = [...Su], yu.forEach((e) => e());
}
function Eu(e, t) {
	v({
		creditNotes: e,
		allocations: t
	}), xu = e, Su = t, Tu();
}
var B = {
	subscribe(e) {
		return yu.add(e), () => {
			yu.delete(e);
		};
	},
	getSnapshot() {
		return Cu;
	},
	getAllocationSnapshot() {
		return wu;
	},
	getAll() {
		return Cu;
	},
	getAllAllocations() {
		return wu;
	},
	getById(e) {
		return xu.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return xu.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return xu.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return Su.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return Su.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if (xu.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return Eu([e, ...xu], Su), e;
	},
	update(e) {
		if (!xu.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return Eu(xu.map((t) => t.id === e.id ? e : t), Su), e;
	},
	createAllocation(e) {
		if (Su.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return Eu(xu, [e, ...Su]), e;
	},
	updateAllocation(e) {
		if (!Su.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return Eu(xu, Su.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!xu.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = Su.some((t) => t.id === e.id) ? Su.map((t) => t.id === e.id ? e : t) : [e, ...Su];
		Eu(xu.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return Su.find((t) => t.id === e);
	}
};
o("customerCredits", {
	repository: B,
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
		creditNotes: xu,
		allocations: Su
	}),
	restore: (e) => {
		xu = e.creditNotes, Su = e.allocations, Cu = [...xu], wu = [...Su];
	},
	publish: () => yu.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/customerPricingStorage.ts
var Du = "htt.mock.contacts.customerPricing.v1";
function Ou(e) {
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
function ku() {
	return ie(Du, Ou);
}
function Au(e) {
	if (ku().status === "invalid" || !ae("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!g("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var ju = [
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
], Mu = /* @__PURE__ */ new Set(), Nu = ku(), Pu = Nu.status === "ok" ? Nu.data : structuredClone(ju);
function Fu() {
	Mu.forEach((e) => {
		e();
	});
}
function Iu(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Lu(e) {
	return e.trim() || void 0;
}
function Ru(e, t) {
	let n = al(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = n.units.find((e) => e.id === t);
	if (!r) throw Error(`Unit ${t} does not belong to product ${e}`);
	if (!r.active) throw Error("The selected product unit is inactive");
	return {
		product: n,
		unit: r
	};
}
function zu(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function Bu({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = Pu.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : zu(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = Gu(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function Vu(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function Hu(e) {
	let t = ol(e.productId, e.unitId);
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
var Uu = {
	subscribe(e) {
		return Mu.add(e), () => {
			Mu.delete(e);
		};
	},
	getSnapshot() {
		return Pu;
	},
	getAll() {
		return Pu;
	},
	getById(e) {
		return Pu.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Pu.filter((t) => t.customerId === e);
	},
	create(e, t) {
		Ru(t.productId, t.unitId);
		let n = Lu(t.effectiveTo);
		t.active && Bu({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = Vu(t), a = {
			id: Iu("cprice"),
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
		}, o = [a, ...Pu];
		return Au(o), Pu = o, Fu(), a;
	},
	update(e, t) {
		let n = Uu.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		Ru(t.productId, t.unitId);
		let r = Lu(t.effectiveTo);
		t.active && Bu({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = Vu(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = Pu.map((t) => t.id === e ? a : t);
		return Au(o), Pu = o, Fu(), a;
	},
	resolve(e) {
		return Hu(e);
	},
	resolvePrice(e, t, n, r) {
		let a = Uu.resolveBasePrice(e, t, n, r.slice(0, 10)), o = i({
			customerId: e,
			productId: t,
			unitId: n,
			at: r,
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
		let { unit: i } = Ru(t, n), a = Pu.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && Wu(r, i.effectiveFrom, i.effectiveTo));
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
		let o = Hu(a);
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
function Wu(e, t, n) {
	return !(e < t || n && e > n);
}
function Gu(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
o("customerPrices", {
	repository: Uu,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: Pu }),
	restore: (e) => {
		Pu = e.customerPrices;
	},
	publish: () => Mu.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
function Ku(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function qu({ quantity: e, standardUnitPrice: t, unitPrice: n, taxRate: r = s(), inclusiveLineTotal: i }) {
	let a = Ku(e * n), o = Ku(i === void 0 ? a * r : i - a), c = Ku(a + o), l = Ku(t - n);
	return {
		discountAmount: l,
		discountPercent: t > 0 ? Ku(l / t * 100) : 0,
		lineSubtotal: a,
		taxAmount: o,
		lineTotal: c
	};
}
function Ju(e) {
	let t = Ku(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Ku(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: Ku(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function Yu({ customerId: e, documentDate: t, draft: i }) {
	if (i.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let o = al(i.productId);
	if (!o) throw Error(`Product ${i.productId} was not found`);
	if (o.status !== "ACTIVE") throw Error(`${o.name} is inactive`);
	let c = ol(i.productId, i.unitId);
	if (!c) throw Error(`Unit ${i.unitId} was not found for ${o.name}`);
	let l = Uu.resolvePrice(e, i.productId, i.unitId, t), u = i.unitPrice !== void 0, d = u ? i.unitPrice : l.effectivePrice;
	if (!Number.isFinite(d) || d < 0) throw Error("Unit price cannot be negative");
	if (sl(i.productId, i.unitId, i.quantity, "sell"), o.sellEnabled === !1) throw Error("Product is not available for selling.");
	let f = o.taxCode ?? n().gstCode, p = s(f), m = u ? r(d, p, i.priceBasis) : d, h = qu({
		taxRate: p,
		inclusiveLineTotal: u && (i.priceBasis ?? n().basis) === "Inclusive" ? Math.round(i.quantity * d * 100) / 100 : void 0,
		quantity: i.quantity,
		standardUnitPrice: l.basePrice,
		unitPrice: m
	});
	return {
		id: Xu("line"),
		...a(f),
		priceBasis: u ? i.priceBasis ?? n().basis : "Exclusive",
		grossUnitPrice: u && (i.priceBasis ?? n().basis) === "Inclusive" ? d : void 0,
		promotionId: u ? void 0 : l.promotionId,
		productId: o.id,
		unitId: c.id,
		sku: o.sku,
		description: o.name,
		unitSymbol: c.symbol,
		quantity: i.quantity,
		standardUnitPrice: l.basePrice,
		unitPrice: m,
		priceSource: u ? "MANUAL" : l.source,
		customerPriceId: u ? void 0 : l.customerPrice?.id,
		...h
	};
}
function Xu(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var Zu = "htt.mock.banking.accounts.v1";
function Qu(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var $u = /* @__PURE__ */ new Set(), ed = "2026-10-08T00:00:00.000Z", td = [{
	id: "bank_001",
	name: "Operating Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1000",
	accountType: "TRANSACTION",
	currency: n().currency,
	glAccountId: "acc_1000",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: ed,
	updatedAt: ed
}, {
	id: "bank_002",
	name: "Savings Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1010",
	accountType: "SAVINGS",
	currency: n().currency,
	glAccountId: "acc_1010",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: ed,
	updatedAt: ed
}], nd = ie(Zu, Qu);
nd.status === "ok" && nd.data.every((e) => {
	let t = R.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (td = nd.data);
function rd() {
	$u.forEach((e) => e());
}
function id(e) {
	let t = R.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of td) id(e);
var ad = {
	subscribe(e) {
		return $u.add(e), () => {
			$u.delete(e);
		};
	},
	getSnapshot() {
		return td;
	},
	getAll() {
		return td;
	},
	getById(e) {
		return td.find((t) => t.id === e);
	},
	getByGlAccountId(e) {
		return td.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = td.find((t) => t.id === e);
		if (!t) throw Error("Bank account was not found.");
		return t;
	},
	save(e, t) {
		let n = P({
			id: j().optional(),
			name: j().trim().min(1).max(180),
			bankName: j().trim().min(1).max(180),
			accountNumber: j().trim().min(1).max(100),
			accountType: Ac([
				"TRANSACTION",
				"SAVINGS",
				"CREDIT_CARD",
				"OTHER"
			]),
			currency: Ac(["AUD", "NZD"]),
			glAccountId: j().min(1),
			openingBalanceDate: j(),
			active: gc()
		}).strict().parse(e);
		if (p(n.openingBalanceDate, "Opening date"), td[0] && n.currency !== td[0].currency) throw Error("This profile uses one base currency; foreign-currency bank accounts are not supported.");
		let r = td.find((e) => e.id === n.id);
		if (r && r.updatedAt !== t) throw Error("Bank account changed; reload before editing.");
		if (!r && n.id) throw Error("Bank account was not found.");
		if (td.some((e) => e.id !== r?.id && e.glAccountId === n.glAccountId)) throw Error("Each bank account needs its own GL account.");
		let i = R.requireById(n.glAccountId);
		if (!i.active || i.type !== "ASSET" || i.systemRole && i.systemRole !== "BANK") throw Error("Choose an active bank Asset account.");
		if (r && z.getAll().some((e) => e.lines.some((e) => e.accountId === r.glAccountId)) && (r.glAccountId !== n.glAccountId || r.openingBalanceDate !== n.openingBalanceDate || r.currency !== n.currency)) throw Error("A used bank account cannot change its ledger, currency or opening date.");
		let a = new Date(Math.max(Date.now(), r ? Date.parse(r.updatedAt) + 1 : 0)).toISOString(), o = {
			...n,
			id: r?.id ?? crypto.randomUUID(),
			openingBalance: r?.openingBalance ?? 0,
			createdAt: r?.createdAt ?? a,
			updatedAt: a
		};
		return id(o), td = [...td.filter((e) => e.id !== o.id), o], rd(), o;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return td = td.map((t) => t.id === e ? r : t), ae(Zu) && g(Zu, td), rd(), r;
	}
};
o("bankAccounts", {
	repository: ad,
	read: "banking.read",
	commands: {
		if: null,
		validateBankAccount: null,
		setActive: "banking.write",
		save: "banking.write"
	},
	snapshot: () => ({ bankAccounts: td }),
	restore: (e) => {
		td = e.bankAccounts;
	},
	publish: () => $u.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var od = /* @__PURE__ */ new Set(), sd = F.read().payments;
function cd() {
	od.forEach((e) => e());
}
function ld() {
	return `payment_${crypto.randomUUID()}`;
}
function ud() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = sd.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var dd = {
	subscribe(e) {
		return od.add(e), () => {
			od.delete(e);
		};
	},
	getSnapshot() {
		return sd;
	},
	getAll() {
		return sd;
	},
	getById(e) {
		return sd.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return sd.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return sd.filter((t) => t.invoiceId === e);
	},
	create(e) {
		if (!e.customerId) throw Error("Customer is required");
		if (!e.invoiceId) throw Error("Invoice is required");
		if (!e.paymentDate) throw Error("Payment date is required");
		if (!e.bankAccountId) throw Error("Bank account is required");
		let t = ad.getById(e.bankAccountId);
		if (!t) throw Error("Bank account was not found");
		if (!t.active) throw Error("The selected bank account is inactive");
		if (!Number.isFinite(e.amount) || e.amount <= 0) throw Error("Payment amount must be greater than zero");
		if (p(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (pd(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = y.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: pd(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: fd(e.reference),
				notes: fd(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = sd.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: ld(),
			paymentNumber: ud(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: pd(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: fd(e.reference),
			notes: fd(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && y.bindResult(n, i.id);
		let a = [i, ...sd];
		if (F.update("payments", a), sd = a, n && !e.deferOperationCompletion) try {
			y.complete(n, i.id);
		} catch (e) {
			try {
				y.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return cd(), i;
	},
	reverse(e, t) {
		let n = sd.find((t) => t.id === e);
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
		}, o = sd.map((t) => t.id === e ? a : t);
		return F.update("payments", o), sd = o, cd(), a;
	},
	getReceivedByInvoice(e) {
		return sd.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function fd(e) {
	return e?.trim() || void 0;
}
function pd(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
o("customerPayments", {
	repository: dd,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null
	},
	snapshot: () => ({ payments: sd }),
	restore: (e) => {
		sd = e.payments;
	},
	publish: () => od.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/taxPosting.ts
function md(e, t, n, r) {
	let i = t === "paid" ? "GST_RECEIVABLE" : "GST_PAYABLE", a = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = (t === "paid" ? n.taxPaidAccountId : n.taxCollectedAccountId) || R.requireBySystemRole(i).id;
		a.set(e, (a.get(e) ?? 0) + n.taxAmount);
	}
	return e.length || a.set(R.requireBySystemRole(i).id, r), [...a].filter(([, e]) => Math.round((e + 2 ** -52) * 100) !== 0).map(([e, t]) => {
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
function hd(e) {
	return R.requireBySystemRole(e).id;
}
function gd(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: n().timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), r = e.find((e) => e.type === "year")?.value, i = e.find((e) => e.type === "month")?.value, a = e.find((e) => e.type === "day")?.value;
		if (r && i && a) return `${r}-${i}-${a}`;
	} catch {}
	return e.slice(0, 10);
}
function _d(e, t) {
	return z.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function vd(e, t) {
	let n = _d(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var yd = {
	postInvoice(e) {
		return _d("CUSTOMER_INVOICE", e.id) || z.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: hd("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: hd("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				...md(e.lines, "collected", !1, e.totals.taxAmount)
			]
		});
	},
	reverseInvoice(e) {
		let t = vd("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? z.getById(t.reversalJournalEntryId) : void 0 : z.reverse({
			journalEntryId: t.id,
			reversalDate: gd(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = _d("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = ad.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this customer payment is inactive.");
		return z.post({
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
				accountId: hd("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = vd("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? z.getById(t.reversalJournalEntryId) : void 0 : z.reverse({
			journalEntryId: t.id,
			reversalDate: gd(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return _d("CREDIT_NOTE", e.id) || z.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: hd("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				...md(e.lines, "collected", !0, e.totals.taxAmount),
				{
					accountId: hd("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = vd("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? z.getById(t.reversalJournalEntryId) : void 0 : z.reverse({
			journalEntryId: t.id,
			reversalDate: gd(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, bd = /* @__PURE__ */ new Set(), xd = xl(), Sd = gl(), Cd = dl(), V = xd.status === "ok" ? structuredClone(xd.data.quotes) : Sd.status === "ok" ? structuredClone(Sd.data.quotes) : Cd.status === "ok" ? structuredClone(Cd.data) : structuredClone(gu);
function wd(e) {
	xd.status === "ok" || xl().status !== "empty" ? Sl({
		quotes: e,
		salesOrders: Td,
		invoices: H
	}) : Sd.status === "ok" || gl().status !== "empty" ? _l({
		quotes: e,
		salesOrders: Td
	}) : fl(e), V = e, kd();
}
var Td = xd.status === "ok" ? structuredClone(xd.data.salesOrders) : Sd.status === "ok" ? structuredClone(Sd.data.salesOrders) : structuredClone(_u), H = xd.status === "ok" ? structuredClone(xd.data.invoices) : structuredClone(vu);
function Ed(e) {
	Sl({
		quotes: V,
		salesOrders: Td,
		invoices: e
	}), H = e, kd();
}
function Dd(e, t = V) {
	xd.status === "ok" || xl().status !== "empty" ? Sl({
		quotes: t,
		salesOrders: e,
		invoices: H
	}) : _l({
		quotes: t,
		salesOrders: e
	}), Td = e, V = t, kd();
}
var Od = Ad();
function kd() {
	Od = Ad(), bd.forEach((e) => e());
}
function Ad() {
	return [
		...V,
		...Td,
		...H
	];
}
var jd = {
	subscribe(e) {
		return bd.add(e), () => {
			bd.delete(e);
		};
	},
	getSnapshot() {
		return Od;
	},
	getAll() {
		return Od;
	},
	getById(e) {
		return Od.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Od.filter((t) => t.customerId === e);
	},
	getQuotesByCustomer(e) {
		return V.filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return Td.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return H.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (Md(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = e.lines.map((t) => Yu({
			customerId: e.customerId,
			documentDate: e.documentDate,
			draft: t
		})), n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Pd("quote"),
			type: "QUOTE",
			documentNumber: Fd("QU", V.map((e) => e.documentNumber)),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: Nd(e.customerReference),
			notes: Nd(e.notes),
			lines: t,
			totals: Ju(t),
			createdAt: n,
			updatedAt: n
		};
		return wd([r, ...V]), r;
	},
	updateDraftQuote(e, t) {
		let r = V.find((t) => t.id === e);
		if (!r) throw Error(`Quote ${e} was not found`);
		if (r.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let i = t.lines.map((e) => {
			if (e.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
			if (!Number.isFinite(e.standardUnitPrice) || !Number.isFinite(e.unitPrice) || e.standardUnitPrice < 0 || e.unitPrice < 0) throw Error("Sales prices cannot be negative");
			sl(e.productId, e.unitId, e.quantity, "sell");
			let t = al(e.productId)?.taxCode ?? n().gstCode, i = qu({
				taxRate: s(t),
				quantity: e.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice
			});
			return {
				id: r.lines.find((t) => t.id === e.lineId)?.id ?? Pd("line"),
				productId: e.productId,
				unitId: e.unitId,
				sku: Rd(e.productId, e.unitId).sku,
				description: Rd(e.productId, e.unitId).description,
				unitSymbol: Rd(e.productId, e.unitId).unitSymbol,
				quantity: e.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice,
				priceSource: e.priceSource,
				customerPriceId: e.customerPriceId,
				...a(t),
				...i
			};
		}), o = {
			...r,
			documentDate: t.documentDate,
			expiryDate: t.expiryDate,
			customerReference: Nd(t.customerReference),
			notes: Nd(t.notes),
			lines: i,
			totals: Ju(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return wd(V.map((t) => t.id === e ? o : t)), o;
	},
	sendQuote(e) {
		let t = V.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return wd(V.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = V.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return wd(V.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = V.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return wd(V.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = V.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Pd("order"),
			type: "SALES_ORDER",
			documentNumber: Fd("SO", Td.map((e) => e.documentNumber)),
			customerId: t.customerId,
			documentDate: Id(),
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
		return Dd([r, ...Td], V.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = Td.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Dd(Td.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = Td.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = Id(), a = {
			id: Pd("invoice"),
			type: "INVOICE",
			documentNumber: Fd("INV", H.map((e) => e.documentNumber)),
			customerId: t.customerId,
			documentDate: i,
			dueDate: Ld(i, Number(n().terms)),
			status: "ISSUED",
			sourceSalesOrderId: t.id,
			customerReference: t.customerReference,
			notes: t.notes,
			lines: structuredClone(t.lines),
			totals: structuredClone(t.totals),
			amountPaid: 0,
			amountDue: t.totals.total,
			createdAt: r,
			updatedAt: r
		}, o = [a, ...H], s = Td.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, a.id],
			updatedAt: r
		} : e);
		return Sl({
			quotes: V,
			salesOrders: s,
			invoices: o
		}), H = o, Td = s, kd(), yd.postInvoice(a), a;
	},
	createCreditNoteFromInvoice(e) {
		let t = H.find((t) => t.id === e.invoiceId);
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
			let i = B.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id).reduce((e, t) => e + t.quantity, 0);
			if (e.quantity + i > n.quantity + 1e-8) throw Error("Credit quantity cannot exceed the original invoice quantity.");
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = B.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id), s = e.quantity + i >= n.quantity - 1e-8, c = zd(s ? n.lineSubtotal - o.reduce((e, t) => e + t.lineSubtotal, 0) : n.lineSubtotal * e.quantity / n.quantity), l = zd(s ? n.taxAmount - o.reduce((e, t) => e + t.taxAmount, 0) : n.taxAmount * e.quantity / n.quantity);
			return {
				...n,
				quantity: e.quantity,
				taxRate: a,
				lineSubtotal: c,
				taxAmount: l,
				lineTotal: zd(c + l)
			};
		}), a = Ju(i);
		if (a.total <= 0) throw Error("Credit note total must be greater than zero");
		if (zd(zd(B.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + a.total) > zd(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: Pd("credit-note"),
			creditNoteNumber: Fd("CN", B.getAll().map((e) => e.creditNoteNumber)),
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
		return B.create(s), yd.postCreditNote(s), s;
	},
	applyCreditToInvoice(e) {
		S(), hu();
		let t = B.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		let n = H.find((t) => t.id === e.invoiceId);
		if (!n) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void credit note cannot be applied");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be applied");
		if (n.status === "VOID") throw Error("Credit cannot be applied to a void invoice");
		if (n.status === "DRAFT") throw Error("Credit cannot be applied to a draft invoice");
		if (t.customerId !== n.customerId) throw Error("Credit note and invoice must belong to the same customer");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the credit note date");
		let r = zd(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = B.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: Pd("credit-allocation"),
			allocationNumber: Fd("CA", B.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = zd(i.amountApplied + r), c = zd(Math.max(0, i.totals.total - (i.amountRefunded ?? 0) - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
		if (y.begin(l, "SALES_CREDIT_APPLY", JSON.stringify({
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: r
		})).status !== "started") throw Error("Credit allocation was previously attempted; manual review required.");
		try {
			y.bindResult(l, o.id), B.commitAllocationAndCredit(o, {
				...i,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(n.id), y.complete(l, o.id);
		} catch (e) {
			try {
				y.flagForReview(l, "Credit allocation/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	reverseCreditAllocation(e) {
		S(), hu();
		let t = B.getAllocationById(e.allocationId);
		if (!t) throw Error(`Credit allocation ${e.allocationId} was not found`);
		if (t.status === "REVERSED") throw Error("This credit allocation has already been reversed");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A reversal reason is required");
		let r = B.getById(t.creditNoteId);
		if (!r) throw Error("Credit note was not found");
		if (r.status === "VOID") throw Error("Allocations on a void credit note cannot be reversed here");
		let i = H.find((e) => e.id === t.invoiceId);
		if (!i) throw Error("Allocated invoice was not found");
		if (i.status === "VOID") throw Error("Credit allocation cannot be reversed after the invoice has been voided");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			updatedAt: a
		}, s = zd(B.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = zd(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - s)), l = `sales-credit-reversal:${t.id}`;
		if (y.begin(l, "SALES_CREDIT_REVERSAL", t.id).status !== "started") throw Error("Credit allocation reversal previously attempted; manual review required.");
		try {
			y.bindResult(l, t.id), B.commitAllocationAndCredit(o, {
				...r,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(i.id), y.complete(l, t.id);
		} catch (e) {
			try {
				y.flagForReview(l, "Credit reversal/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	voidCreditNote(e) {
		let t = B.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		if (t.status === "VOID") throw Error("This credit note has already been voided");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be voided here");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse customer refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required");
		if (B.getAllocationsByCreditNote(t.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this credit note");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: r,
			voidReason: n,
			updatedAt: r
		};
		return B.update(i), yd.reverseCreditNote(i), i;
	},
	recordInvoicePayment(e) {
		if (S(), hu(), e.operationId) {
			let t = y.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = H.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = zd(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (p(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, a = dd.create({
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
			yd.postPayment(a);
			let e = z.getBySource("CUSTOMER_PAYMENT", a.id).filter((e) => !e.reversedJournalEntryId);
			if (e.length !== 1 || e[0].status !== "POSTED") throw Error("Payment GL posting could not be verified uniquely.");
			y.complete(i, a.id);
		} catch (e) {
			try {
				y.flagForReview(i, "Payment or GL posting uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	voidInvoice(e, t) {
		S(), hu();
		let n = H.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (dd.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
		if (B.getAllocationsByInvoice(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("This invoice has applied credits. Reverse all active credit allocations before voiding the invoice.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			amountPaid: 0,
			amountDue: 0,
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		}, o = `sales-invoice-void:${e}`;
		if (y.begin(o, "SALES_INVOICE_VOID", e).status !== "started") throw Error("Invoice void was previously attempted; inspect GL and operation journal before retrying.");
		try {
			let t = z.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (t.length !== 1 || t[0].status !== "POSTED") throw Error("Invoice original GL must be uniquely posted before voiding.");
			y.bindResult(o, e), yd.reverseInvoice(a);
			let n = z.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			Ed(H.map((t) => t.id === e ? a : t)), y.complete(o, e);
		} catch (e) {
			try {
				y.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		nl("CUSTOMER_PAYMENT", e), S(), hu();
		let n = dd.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = H.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (y.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			y.bindResult(i, e);
			let n = dd.reverse(e, t);
			yd.reversePayment(n);
			let a = z.getBySource("CUSTOMER_PAYMENT", e).filter((e) => !e.reversedJournalEntryId);
			if (a.length !== 1 || a[0].status !== "REVERSED") throw Error("Payment GL reversal could not be verified.");
			return this.recalculateInvoiceBalance(r.id), y.complete(i, e), n;
		} catch (e) {
			try {
				y.flagForReview(i, "Payment reversal/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
	},
	recalculateInvoiceBalance(e) {
		let t = H.find((t) => t.id === e);
		if (!t) throw Error(`Invoice ${e} was not found`);
		if (t.status === "VOID") return t;
		let n = dd.getReceivedByInvoice(e), r = B.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = zd(n.reduce((e, t) => e + t.amount, 0)), a = zd(r.reduce((e, t) => e + t.amount, 0)), o = zd(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : Bd(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ed(H.map((t) => t.id === e ? c : t)), c;
	}
};
function Md(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function Nd(e) {
	return e?.trim() || void 0;
}
function Pd(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Fd(e, t) {
	return m(e, t, u((/* @__PURE__ */ new Date()).toISOString()).slice(0, 4));
}
function Id() {
	return u((/* @__PURE__ */ new Date()).toISOString());
}
function Ld(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function Rd(e, t) {
	let n = al(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = ol(e, t);
	if (!r) throw Error(`Unit ${t} was not found for ${n.name}`);
	return {
		sku: n.sku,
		description: n.name,
		unitSymbol: r.symbol
	};
}
function zd(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Bd(e) {
	return e < Vd(/* @__PURE__ */ new Date());
}
function Vd(e) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
o("sales", {
	repository: jd,
	read: "sales.read",
	commands: {
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
	snapshot: () => ({
		quotes: V,
		salesOrders: Td,
		invoices: H
	}),
	restore: (e) => {
		V = e.quotes, Td = e.salesOrders, H = e.invoices, Od = Ad();
	},
	publish: () => bd.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var Hd = [
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
		currency: n().currency,
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
		currency: n().currency,
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
		currency: n().currency,
		taxRegistered: !0,
		createdAt: "2026-03-05T01:00:00.000Z",
		updatedAt: "2026-03-05T01:00:00.000Z"
	}
], Ud = "htt.mock.contacts.suppliers.v1";
function Wd(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var Gd = ie(Ud, Wd), Kd = Gd.status !== "invalid" && ae(Ud), qd = /* @__PURE__ */ new Set(), Jd = Gd.status === "ok" ? Gd.data : structuredClone(Hd);
function Yd() {
	Kd && g(Ud, Jd), qd.forEach((e) => {
		e();
	});
}
function Xd(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Zd() {
	let e = Jd.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function Qd(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function $d(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function ef(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: Qd(e.tradingName),
		abn: $d(e.abn),
		status: e.status,
		email: Qd(e.email),
		phone: Qd(e.phone),
		website: Qd(e.website),
		contactName: Qd(e.contactName),
		addressLine1: Qd(e.addressLine1),
		addressLine2: Qd(e.addressLine2),
		suburb: Qd(e.suburb),
		state: Qd(e.state),
		postcode: Qd(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: Qd(e.notes)
	};
}
var tf = {
	subscribe(e) {
		return qd.add(e), () => {
			qd.delete(e);
		};
	},
	getSnapshot() {
		return Jd;
	},
	getAll() {
		return Jd;
	},
	getById(e) {
		return Jd.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Xd("sup"),
			code: Zd(),
			...ef(e),
			currency: n().currency,
			createdAt: t,
			updatedAt: t
		};
		return Jd = [r, ...Jd], Yd(), r;
	},
	update(e, t) {
		let n = tf.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...ef(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Jd = Jd.map((t) => t.id === e ? r : t), Yd(), r;
	}
};
o("suppliers", {
	repository: tf,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: Jd }),
	restore: (e) => {
		Jd = e.suppliers;
	},
	publish: () => qd.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
function nf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function rf({ orderedQuantity: e, unitCost: t, taxRate: n = s(), inclusiveLineTotal: r }) {
	let i = nf(e * t), a = nf(r === void 0 ? i * n : r - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: nf(i + a)
	};
}
function af(e) {
	let t = nf(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = nf(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: nf(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var of = /* @__PURE__ */ new Set(), U = F.read().purchaseOrders;
F.onRollback(() => {
	U = F.read().purchaseOrders;
});
function sf() {
	try {
		F.update("purchaseOrders", U);
	} catch (e) {
		throw U = F.read().purchaseOrders, e;
	}
	of.forEach((e) => F.notify(e));
}
function cf(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function lf(e) {
	return m("PO", U.map((e) => e.purchaseOrderNumber), e.slice(0, 4));
}
function uf(e) {
	return e?.trim() || void 0;
}
function df(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = il.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let i = t.units.find((t) => t.id === e.unitId);
		if (!i) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!i.active) throw Error(`${i.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		if (sl(e.productId, e.unitId, e.orderedQuantity, "buy"), t.buyEnabled === !1) throw Error("Product is not available for purchasing.");
		let o = t.taxCode ?? n().gstCode, c = s(o), l = rf({
			taxRate: c,
			inclusiveLineTotal: (e.priceBasis ?? n().basis) === "Inclusive" ? Math.round(e.orderedQuantity * e.unitCost * 100) / 100 : void 0,
			orderedQuantity: e.orderedQuantity,
			unitCost: r(e.unitCost, c, e.priceBasis)
		});
		return {
			id: cf("pol"),
			...a(o),
			grossUnitCost: (e.priceBasis ?? n().basis) === "Inclusive" ? e.unitCost : void 0,
			productId: t.id,
			unitId: i.id,
			sku: t.sku,
			description: t.name,
			unitSymbol: i.symbol,
			orderedQuantity: e.orderedQuantity,
			receivedQuantity: 0,
			billedQuantity: 0,
			unitCost: r(e.unitCost, c, e.priceBasis),
			...l
		};
	});
}
function ff(e) {
	let t = tf.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function pf(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var mf = {
	subscribe(e) {
		return of.add(e), () => {
			of.delete(e);
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
	getBySupplier(e) {
		return U.filter((t) => t.supplierId === e);
	},
	create(e) {
		pf(e);
		let t = ff(e.supplierId), n = df(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: cf("po"),
			purchaseOrderNumber: lf(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: uf(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: uf(e.supplierReference),
			notes: uf(e.notes),
			lines: n,
			totals: af(n),
			createdAt: r,
			updatedAt: r
		};
		return U = [i, ...U], sf(), i;
	},
	updateDraft(e, t) {
		let n = mf.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		pf(t);
		let r = ff(t.supplierId), i = df(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: uf(t.expectedDeliveryDate),
			supplierReference: uf(t.supplierReference),
			notes: uf(t.notes),
			lines: i,
			totals: af(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return U = U.map((e) => e.id === n.id ? a : e), sf(), a;
	},
	approve(e) {
		let t = mf.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return hf(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = mf.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return hf(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = mf.getById(e);
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
		return U = U.map((e) => e.id === n.id ? o : e), sf(), o;
	},
	recordSupplierBill(e, t) {
		let n = mf.getById(e);
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
			let n = gf(e.billedQuantity + t);
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
		return U = U.map((e) => e.id === n.id ? c : e), sf(), c;
	},
	reverseSupplierBill(e, t) {
		let n = mf.getById(e);
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
				billedQuantity: gf(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return U = U.map((e) => e.id === n.id ? c : e), sf(), c;
	},
	cancel(e, t) {
		let n = mf.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return hf(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function hf(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return U = U.map((t) => t.id === e.id ? n : t), sf(), n;
}
function gf(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
o("purchaseOrders", {
	repository: mf,
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
	snapshot: () => ({ purchaseOrders: U }),
	restore: (e) => {
		U = e.purchaseOrders;
	},
	publish: () => of.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function W(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function _f(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function vf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function yf({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return _f(e / t);
}
function bf({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return vf(e * t);
}
function xf({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = W(e + n), a = vf(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : _f(a / i)
	};
}
function Sf({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return vf(e * t);
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function Cf(e) {
	return vf(e.lines.reduce((e, t) => {
		let n = yf({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + bf({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function wf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Tf(e) {
	return R.requireBySystemRole(e).id;
}
function Ef(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: n().timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), r = e.find((e) => e.type === "year")?.value, i = e.find((e) => e.type === "month")?.value, a = e.find((e) => e.type === "day")?.value;
		if (r && i && a) return `${r}-${i}-${a}`;
	} catch {}
	return e.slice(0, 10);
}
function Df(e, t) {
	return z.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Of(e, t) {
	let n = Df(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var kf = {
	validateGoodsReceiptPosting(e) {
		let t = R.requireBySystemRole("INVENTORY"), n = R.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = Cf(e);
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
		let t = z.getBySource("GOODS_RECEIPT", e.id).find((e) => !e.reversedJournalEntryId);
		if (t) return t;
		let { inventoryAccountId: n, grniAccountId: r, receiptValue: i } = this.validateGoodsReceiptPosting(e);
		return z.post({
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
		let n = R.requireBySystemRole("GRNI"), r = R.requireBySystemRole("GST_RECEIVABLE"), i = R.requireBySystemRole("ACCOUNTS_PAYABLE");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI account must be an active liability account.");
		if (!r.active || r.type !== "ASSET") throw Error("GST Receivable must be an active asset account.");
		if (!i.active || i.type !== "LIABILITY") throw Error("Accounts Payable must be an active liability account.");
		if (!Number.isFinite(t) || t < 0) throw Error("Matched receipt value must be a non-negative finite number.");
		let a = wf(e.totals.subtotal - t);
		if (a !== 0) {
			let e = R.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = wf(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = Df("SUPPLIER_BILL", e.id);
		if (n) return n;
		let r = t ?? e.totals.subtotal, { variance: i } = this.validateSupplierBillPosting(e, r);
		return z.post({
			journalDate: e.billDate,
			description: `Supplier bill ${e.billNumber}`,
			reference: e.supplierInvoiceNumber,
			sourceType: "SUPPLIER_BILL",
			sourceId: e.id,
			lines: [
				{
					accountId: Tf("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				...md(e.lines, "paid", !0, e.totals.taxAmount),
				...i === 0 ? [] : [{
					accountId: Tf("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: Tf("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = Of("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? z.getById(t.reversalJournalEntryId) : void 0 : z.reverse({
			journalEntryId: t.id,
			reversalDate: Ef(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = Df("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = ad.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return z.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: Tf("ACCOUNTS_PAYABLE"),
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
		let t = Of("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? z.getById(t.reversalJournalEntryId) : void 0 : z.reverse({
			journalEntryId: t.id,
			reversalDate: Ef(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return Df("SUPPLIER_CREDIT", e.id) || z.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: Tf("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: Tf("PURCHASE_PRICE_VARIANCE"),
					description: e.creditNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				...md(e.lines, "paid", !1, e.totals.taxAmount)
			]
		});
	},
	reverseSupplierCredit(e) {
		for (let t of z.getBySource("SUPPLIER_CREDIT_RECLASS", e.id).filter((e) => e.status === "POSTED")) z.reverse({
			journalEntryId: t.id,
			reversalDate: Ef(e.voidedAt),
			reason: e.voidReason ?? "Credit void"
		});
		let t = Of("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? z.getById(t.reversalJournalEntryId) : void 0 : z.reverse({
			journalEntryId: t.id,
			reversalDate: Ef(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, Af = structuredClone([{
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
}]), jf = {
	getAll() {
		return Af;
	},
	getById(e) {
		return Af.find((t) => t.id === e);
	},
	getActive() {
		return Af.filter((e) => e.status === "ACTIVE");
	}
}, Mf = /* @__PURE__ */ new Set(), Nf = [];
function Pf() {
	Mf.forEach((e) => e());
}
function Ff() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Nf.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var If = {
	subscribe(e) {
		return Mf.add(e), () => {
			Mf.delete(e);
		};
	},
	getSnapshot() {
		return Nf;
	},
	getAll() {
		return Nf;
	},
	getByReference(e, t) {
		return Nf.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return Nf.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return Nf.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: Ff(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Nf = [t, ...Nf], Pf(), t;
	}
};
o("inventoryMovements", {
	repository: If,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: Nf }),
	restore: (e) => {
		Nf = e.movements;
	},
	publish: () => Mf.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var Lf = /* @__PURE__ */ new Set(), Rf = [];
function zf() {
	Lf.forEach((e) => e());
}
var Bf = {
	subscribe(e) {
		return Lf.add(e), () => {
			Lf.delete(e);
		};
	},
	getSnapshot() {
		return Rf;
	},
	getAll() {
		return Rf;
	},
	getBalance(e, t) {
		return Rf.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = Bf.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return Rf = Rf.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? Rf.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...Rf], zf(), e;
	},
	replaceAll(e) {
		Rf = e, zf();
	},
	clear() {
		Rf = [], zf();
	}
};
o("costBalances", {
	repository: Bf,
	read: "inventory.cost.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: Rf }),
	restore: (e) => {
		Rf = e.balances;
	},
	publish: () => Lf.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var Vf = /* @__PURE__ */ new Set(), Hf = [];
function Uf() {
	Vf.forEach((e) => e());
}
function Wf() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Hf.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function Gf(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var Kf = {
	subscribe(e) {
		return Vf.add(e), () => {
			Vf.delete(e);
		};
	},
	getSnapshot() {
		return Hf;
	},
	getAll() {
		return Hf;
	},
	getByReference(e, t) {
		return Hf.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return Hf.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return Hf.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return Hf.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return Gf(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: Wf(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = Kf.build(e);
		return Hf = [t, ...Hf], Uf(), t;
	},
	replaceAll(e) {
		Hf = e, Uf();
	},
	clear() {
		Hf = [], Uf();
	}
};
o("costMovements", {
	repository: Kf,
	read: "inventory.cost.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: Hf }),
	restore: (e) => {
		Hf = e.movements;
	},
	publish: () => Vf.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var qf = /* @__PURE__ */ new Set(), Jf = "2026-01-01T00:00:00.000Z", Yf = il.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: Jf,
	updatedAt: Jf
}));
function Xf() {
	qf.forEach((e) => e());
}
var Zf = {
	ensureProductPolicy(e, t, n) {
		let r = Yf.find((t) => t.productId === e), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			productId: e,
			baseUnitId: t,
			active: r?.active ?? n,
			costingMethod: "MOVING_WEIGHTED_AVERAGE",
			createdAt: r?.createdAt ?? i,
			updatedAt: i
		};
		return Yf = [...Yf.filter((t) => t.productId !== e), a], Xf(), a;
	},
	subscribe(e) {
		return qf.add(e), () => {
			qf.delete(e);
		};
	},
	getSnapshot() {
		return Yf;
	},
	getAll() {
		return Yf;
	},
	getByProductId(e) {
		return Yf.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = Zf.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		let n = {
			...Zf.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Yf = Yf.map((t) => t.productId === e ? n : t), Xf(), n;
	}
};
o("costingPolicies", {
	repository: Zf,
	read: "inventory.cost.read",
	commands: {
		ensureProductPolicy: null,
		setActive: "accounting.post"
	},
	snapshot: () => ({ policies: Yf }),
	restore: (e) => {
		Yf = e.policies;
	},
	publish: () => qf.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function Qf(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function $f(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function ep(e, t) {
	let n = al(e);
	if (!n) throw Error("Product was not found.");
	let r = Zf.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = ol(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function tp(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = vf(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(vf(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function np(e) {
	if (e && Kf.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function rp({ movement: e, balance: t }) {
	let n = Kf.getAll(), r = Bf.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	Kf.replaceAll(i), Bf.replaceAll(a);
}
function ip(e) {
	if (Qf(e.quantity), $f(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	np(e.inventoryMovementId);
	let { policy: t, unit: n } = ep(e.productId, e.unitId), r = W(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = yf({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = bf({
		quantityBase: r,
		unitCostBase: i
	}), o = Bf.getBalance(e.siteId, e.productId);
	o && tp(o, t.baseUnitId);
	let s = xf({
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
	tp(l, t.baseUnitId);
	let u = Kf.build({
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
	return rp({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function ap(e) {
	Qf(e.quantity), $f(e.occurredAt), np(e.inventoryMovementId);
	let { policy: t, unit: n } = ep(e.productId, e.unitId), r = W(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = Bf.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (tp(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = _f(i.averageCostPerBaseUnit), o = Sf({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = W(i.quantityOnHand - r), c = s === 0, l = vf(c ? -i.inventoryValue : -o), u = c ? 0 : vf(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : _f(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	tp(p, t.baseUnitId);
	let m = Kf.build({
		movementType: e.movementType ?? "ISSUE",
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: t.baseUnitId,
		quantityBase: W(-r),
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
	return rp({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function op(e) {
	if (Qf(e.quantityBase), $f(e.occurredAt), np(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = al(e.productId);
	if (!t) throw Error("Product was not found.");
	let n = Zf.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = W(e.quantityBase), i = _f(e.unitCostBase), a = vf(e.inventoryValue), o = Bf.getBalance(e.siteId, e.productId);
	o && tp(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = W(s + r), u = vf(c + a), d = l === 0 ? 0 : _f(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	tp(p, n.baseUnitId);
	let m = Kf.build({
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
	return rp({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var sp = /* @__PURE__ */ new Set(), cp = [];
function lp() {
	sp.forEach((e) => e());
}
function up(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var dp = {
	subscribe(e) {
		return sp.add(e), () => {
			sp.delete(e);
		};
	},
	getSnapshot() {
		return cp;
	},
	getAll() {
		return cp;
	},
	getBalance(e, t) {
		return cp.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = dp.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: up(i.quantityOnHand + r),
				updatedAt: a
			};
			return cp = cp.map((r) => r.siteId === e && r.productId === t ? n : r), lp(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: up(r),
			updatedAt: a
		};
		return cp = [o, ...cp], lp(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = dp.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = up(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return cp = cp.map((n) => n.siteId === e && n.productId === t ? o : n), lp(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of If.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: up((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		cp = Array.from(e.values()), lp();
	}
};
o("stock", {
	repository: dp,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: cp }),
	restore: (e) => {
		cp = e.balances;
	},
	publish: () => sp.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/goodsReceiptRepository.ts
var fp = /* @__PURE__ */ new Set(), pp = F.read().goodsReceipts;
F.onRollback(() => {
	pp = F.read().goodsReceipts;
});
function mp() {
	try {
		F.update("goodsReceipts", pp);
	} catch (e) {
		throw pp = F.read().goodsReceipts, e;
	}
	fp.forEach((e) => F.notify(e));
}
function hp(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function gp(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = pp.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function _p(e) {
	return e?.trim() || void 0;
}
var vp = {
	subscribe(e) {
		return fp.add(e), () => {
			fp.delete(e);
		};
	},
	getSnapshot() {
		return pp;
	},
	getAll() {
		return pp;
	},
	getById(e) {
		return pp.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return pp.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = mf.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = jf.getById(e.siteId);
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
			let r = hp(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!al(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = ol(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = hp(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: gp(e.receiptDate),
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
			supplierDeliveryReference: _p(e.supplierDeliveryReference),
			notes: _p(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		kf.validateGoodsReceiptPosting(s), S();
		let c = x.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return x.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = al(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				x.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = If.create({
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
				}), x.runStep(c, `COST:${r.id}`, () => {
					let t = l.get(r.id);
					if (!t) throw Error(`Missing inventory movement for ${r.id}`);
					ip({
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
				}), x.runStep(c, `STOCK:${r.id}`, () => {
					dp.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			x.runStep(c, "JOURNAL", () => {
				kf.postGoodsReceipt(s);
			}), x.runStep(c, "PURCHASE_ORDER", () => {
				mf.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), x.runStep(c, "RECEIPT", () => {
				pp = [s, ...pp], mp();
			});
		}), x.recover(c), s;
	}
};
o("goodsReceipts", {
	repository: vp,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: pp }),
	restore: (e) => {
		pp = e.goodsReceipts;
	},
	publish: () => fp.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var yp = 1e-4;
function bp(e) {
	return vf(e);
}
function xp(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - W(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function Sp(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function Cp(e, t, n) {
	let r = yf({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return bf({
		quantityBase: W(e * n),
		unitCostBase: r
	});
}
function wp(e, t, n) {
	let r = [], i = n.filter((e) => e.status === "ACTIVE");
	for (let n of t) if (n.purchaseOrderId === e && n.status === "POSTED") for (let e of n.lines) {
		let t = W(i.filter((t) => t.goodsReceiptId === n.id && t.goodsReceiptLineId === e.id).reduce((e, t) => e + t.matchedQuantity, 0)), a = W(e.receivedQuantity - t);
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
function Tp(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = wp(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), xp(e.quantity), Sp(e.billUnitCost);
		let r = W(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > yp);
		if (W(d.reduce((e, t) => e + t.availableQuantity, 0)) + yp < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= yp) break;
			let s = W(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = W(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = bf({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: yf({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = bp(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), h = Math.abs(o.availableQuantity - s) <= yp ? bp(p - m) : Cp(s, o.receiptUnitCost, o.conversionToBase);
			if (h < 0) throw Error("Receipt cost has been overallocated.");
			let ee = bp(s * e.billUnitCost), te = bp(ee - h);
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
				matchedBillValue: ee,
				priceVariance: te,
				status: "ACTIVE",
				createdAt: l
			}), o.availableQuantity = W(o.availableQuantity - s), r = W(r - s);
		}
		if (r > yp) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = bp(bp(e.quantity * e.billUnitCost) - bp(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = bp(p.matchedBillValue + f), p.priceVariance = bp(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = W(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = W(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = bp(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = bp(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: bp(p - f)
	};
}
var Ep = {
	calculate: Tp,
	getAvailableReceiptLines(e, t, n) {
		return wp(e, t, n);
	}
}, Dp = F.read().receiptMatches;
F.onRollback(() => {
	Dp = F.read().receiptMatches;
});
var Op = /* @__PURE__ */ new Set(), kp = () => {
	try {
		F.update("receiptMatches", Dp);
	} catch (e) {
		throw Dp = F.read().receiptMatches, e;
	}
	Op.forEach((e) => F.notify(e));
}, Ap = {
	getAll() {
		return [...Dp];
	},
	subscribe(e) {
		return Op.add(e), () => {
			Op.delete(e);
		};
	},
	getSnapshot() {
		return Dp;
	},
	getByBill(e) {
		return Dp.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (Dp.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		Dp = [...Dp, ...t], kp();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		Dp = Dp.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), kp();
	}
};
o("receiptMatches", {
	repository: Ap,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: Dp }),
	restore: (e) => {
		Dp = e.matches;
	},
	publish: () => Op.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
function jp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Mp({ quantity: e, unitCost: t, inclusiveLineTotal: n, taxRate: r = .1 }) {
	let i = jp(e * t), a = jp(n === void 0 ? i * r : n - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: jp(i + a)
	};
}
function Np(e) {
	let t = jp(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = jp(e.reduce((e, t) => e + t.taxAmount, 0)), r = jp(t + n);
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
var Pp = /* @__PURE__ */ new Set(), G = F.read().supplierBills;
F.onRollback(() => {
	G = F.read().supplierBills;
});
function Fp() {
	try {
		F.update("supplierBills", G);
	} catch (e) {
		throw G = F.read().supplierBills, e;
	}
	Pp.forEach((e) => F.notify(e));
}
function Ip(e) {
	return e?.trim() || void 0;
}
function Lp(e) {
	return m("BILL", G.map((e) => e.billNumber), e.slice(0, 4));
}
var Rp = {
	subscribe(e) {
		return Pp.add(e), () => {
			Pp.delete(e);
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
		let r = Bp(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = Bp(n.totals.amountPaid + r), a = Bp(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return G = G.map((t) => t.id === e ? o : t), Fp(), o;
	},
	reversePayment(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = Bp(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = Bp(Math.max(0, n.totals.amountPaid - r)), a = Bp(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return G = G.map((t) => t.id === e ? o : t), Fp(), o;
	},
	applyCredit(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = Bp(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = Bp(n.totals.amountCredited + r), a = Bp(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return G = G.map((t) => t.id === e ? o : t), Fp(), o;
	},
	reverseCredit(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = Bp(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = Bp(Math.max(0, n.totals.amountCredited - r)), a = Bp(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return G = G.map((t) => t.id === e ? o : t), Fp(), o;
	},
	markVoid(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("This supplier bill has already been voided.");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required.");
		if (n.status !== "OPEN" || n.totals.amountPaid > 0 || n.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if (Ap.getByBill(n.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		};
		S();
		let o = x.begin("SUPPLIER_BILL_VOID", n.id).key;
		return x.registerRecovery(o, () => {
			x.runStep(o, "REVERSAL_JOURNAL", () => {
				kf.reverseSupplierBill(a);
			}), x.runStep(o, "PURCHASE_ORDER", () => {
				mf.reverseSupplierBill(n.purchaseOrderId, n.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), x.runStep(o, "MATCHES", () => {
				Ap.reverseForBill(n.id, r, u(i));
			}), x.runStep(o, "BILL", () => {
				G = G.map((e) => e.id === n.id ? a : e), Fp();
			});
		}), x.recover(o), a;
	},
	getByPurchaseOrder(e) {
		return G.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = mf.getById(e.purchaseOrderId);
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
			let r = zp(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = Mp({
				taxRate: a,
				quantity: e.quantity,
				unitCost: e.unitCost
			});
			return n.grossUnitCost !== void 0 && e.unitCost === n.unitCost && (o.taxAmount = Bp(e.quantity * n.grossUnitCost - o.lineSubtotal), o.lineTotal = Bp(o.lineSubtotal + o.taxAmount)), {
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
		}), o = Np(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: Lp(e.billDate),
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
			notes: Ip(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = Ep.calculate({
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
			receipts: vp.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: Ap.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		kf.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), S();
		let u = x.begin("SUPPLIER_BILL", c.id).key;
		return x.registerRecovery(u, () => {
			x.runStep(u, "JOURNAL", () => {
				kf.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), x.runStep(u, "PURCHASE_ORDER", () => {
				mf.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), x.runStep(u, "MATCHES", () => {
				Ap.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), x.runStep(u, "BILL", () => {
				G = [c, ...G], Fp();
			});
		}), x.recover(u), c;
	}
};
function zp(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Bp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
o("supplierBills", {
	repository: Rp,
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
	publish: () => Pp.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var Vp = /* @__PURE__ */ new Set(), K = F.read().supplierCredits, q = F.read().supplierCreditAllocations, Hp = F.read().supplierCredits, Up = F.read().supplierCreditAllocations;
F.onRollback(() => {
	K = F.read().supplierCredits, q = F.read().supplierCreditAllocations, Hp = K, Up = q;
});
function Wp() {
	F.update("supplierCredits", K), F.update("supplierCreditAllocations", q), Hp = [...K], Up = [...q], Vp.forEach((e) => F.notify(e));
}
var J = {
	subscribe(e) {
		return Vp.add(e), () => {
			Vp.delete(e);
		};
	},
	getSnapshot() {
		return Hp;
	},
	getAllocationSnapshot() {
		return Up;
	},
	getAll() {
		return Hp;
	},
	getAllAllocations() {
		return Up;
	},
	getById(e) {
		return K.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return K.filter((t) => t.supplierId === e);
	},
	getBySourceBill(e) {
		return K.filter((t) => t.sourceSupplierBillId === e);
	},
	getAllocationById(e) {
		return q.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return q.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return q.filter((t) => t.supplierBillId === e);
	},
	create(e) {
		let t = Rp.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (K.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!Jp(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, t) => {
			let n = i.get(e.supplierBillLineId);
			if (!n) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(n.id)) throw Error(`${n.description} appears more than once in the supplier credit.`);
			a.add(n.id);
			let r = Xp(e.quantity);
			if (!Number.isFinite(r) || r <= 0) throw Error(`${n.description} credit quantity must be greater than zero.`);
			if (r > n.quantity) throw Error(`${n.description} credit quantity cannot exceed the source bill quantity.`);
			let o = e.unitCost;
			if (!Number.isFinite(o) || o < 0) throw Error(`${n.description} unit cost cannot be negative.`);
			if (o > n.unitCost + 1e-8) throw Error(`${n.description} credit unit cost cannot exceed the source bill unit cost.`);
			let s = Yp(r * o), c = Yp(n.unitCost ? n.taxAmount * r / n.quantity * o / n.unitCost : 0), l = Yp(s + c);
			return {
				id: qp(`supplier-credit-line-${t + 1}`),
				taxCode: n.taxCode,
				taxRate: n.taxRate,
				taxCollectedAccountId: n.taxCollectedAccountId,
				taxPaidAccountId: n.taxPaidAccountId,
				taxReport: n.taxReport,
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
		}), s = Yp(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = Yp(o.reduce((e, t) => e + t.taxAmount, 0)), l = Yp(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (Yp(Yp(K.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > Yp(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: qp("supplier-credit"),
			creditNumber: Kp(e.creditDate),
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
		return K = [d, ...K], Wp(), kf.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = K.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = Rp.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!Jp(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = Yp(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: qp("supplier-credit-allocation"),
			allocationNumber: Gp(e.allocationDate),
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
		Rp.applyCredit(n.id, r);
		let o = Yp(t.amountApplied + r), s = Yp(Math.max(0, t.totals.total - (t.amountRefunded ?? 0) - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return q = [a, ...q], K = K.map((e) => e.id === t.id ? c : e), Wp(), a;
	},
	reverseAllocation(e) {
		let t = q.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = K.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = Rp.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		Rp.reverseCredit(i.id, t.amount);
		let o = Yp(Math.max(0, r.amountApplied - t.amount)), s = Yp(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - o)), c = {
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
		return K = K.map((e) => e.id === r.id ? c : e), q = q.map((e) => e.id === t.id ? l : e), Wp(), l;
	},
	voidCredit(e) {
		let t = K.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse supplier refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (q.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: r,
			voidReason: n,
			updatedAt: r
		};
		return K = K.map((e) => e.id === t.id ? i : e), Wp(), kf.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!q.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return q = q.map((t) => t.id === e.id ? e : t), Wp(), e;
	},
	update(e) {
		if (!K.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return K = K.map((t) => t.id === e.id ? e : t), Wp(), e;
	}
};
function Gp(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = q.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Kp(e) {
	return m("SC", K.map((e) => e.creditNumber), e.slice(0, 4));
}
function qp(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function Jp(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function Yp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Xp(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var Zp = J.create;
J.create = function(...e) {
	return S(), F.transaction(() => Zp.apply(J, e));
};
var Qp = J.applyToBill;
J.applyToBill = function(...e) {
	return S(), F.transaction(() => Qp.apply(J, e));
};
var $p = J.reverseAllocation;
J.reverseAllocation = function(...e) {
	return S(), F.transaction(() => $p.apply(J, e));
};
var em = J.voidCredit;
J.voidCredit = function(...e) {
	return S(), F.transaction(() => em.apply(J, e));
};
var tm = J.update;
J.update = function(...e) {
	return S(), F.transaction(() => tm.apply(J, e));
};
var nm = J.updateAllocation;
J.updateAllocation = function(...e) {
	return S(), F.transaction(() => nm.apply(J, e));
}, o("supplierCredits", {
	repository: J,
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
		supplierCredits: K,
		allocations: q
	}),
	restore: (e) => {
		K = e.supplierCredits, q = e.allocations, Hp = [...K], Up = [...q];
	},
	publish: () => Vp.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/bankRegisterService.ts
function rm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function im(e, t) {
	p(e, t);
}
function am(e, t, n) {
	im(e.openingBalanceDate, "Opening balance date"), im(n, "As-at date");
	let r = t.filter((t) => t.journalDate >= e.openingBalanceDate && t.journalDate <= n).flatMap((t) => t.lines.filter((t) => t.accountId === e.glAccountId).map((e) => ({
		entry: t,
		line: e
	}))).sort((e, t) => {
		let n = e.entry.journalDate.localeCompare(t.entry.journalDate);
		if (n !== 0) return n;
		let r = e.entry.createdAt.localeCompare(t.entry.createdAt);
		return r === 0 ? e.line.id.localeCompare(t.line.id) : r;
	}), i = rm(e.openingBalance), a = 0, o = 0, s = r.map(({ entry: t, line: n }) => {
		let r = rm(n.debit), s = rm(n.credit);
		return a = rm(a + r), o = rm(o + s), i = rm(i + r - s), {
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
		openingBalance: rm(e.openingBalance),
		moneyIn: a,
		moneyOut: o,
		closingBalance: i,
		transactionCount: s.length,
		transactions: s
	};
}
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function om(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function sm(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) {
		if (r.has(t.id)) {
			i = om(i + t.moneyIn), a = om(a + t.moneyOut);
			continue;
		}
		o = om(o + t.moneyIn), s = om(s + t.moneyOut);
	}
	let c = om(om(t) + o - s), l = om(e.closingBalance), u = om(c - l);
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
var cm = /* @__PURE__ */ new Set(), lm = F.read().reconciliations;
F.onRollback(() => {
	lm = F.read().reconciliations;
});
function um() {
	F.update("reconciliations", lm), cm.forEach((e) => F.notify(e));
}
function dm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function fm(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function pm() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function mm(e) {
	return `BREC-${e.slice(0, 4)}-${String(lm.length + 1).padStart(4, "0")}`;
}
function hm(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of lm) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var gm = {
	subscribe(e) {
		return cm.add(e), () => {
			cm.delete(e);
		};
	},
	getSnapshot() {
		return lm;
	},
	getAll() {
		return lm;
	},
	getByBankAccount(e) {
		return lm.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return hm(e);
	},
	complete(e) {
		if (fm(e.statementDate), p(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let t = ad.requireById(e.bankAccountId);
		if (!t.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < t.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let n = this.getLatestByBankAccount(t.id);
		if (n && e.statementDate <= n.statementDate) throw Error(`Statement date must be after the last reconciled date ${n.statementDate}.`);
		let r = am(t, z.getAll(), e.statementDate), i = new Set(r.transactions.map((e) => e.id)), a = hm(t.id), o = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !a.has(e));
		for (let e of o) if (!i.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let s = /* @__PURE__ */ new Set([...a, ...o]), c = sm(r, dm(e.statementBalance), Array.from(s));
		if (!c.reconciled) throw Error(`Bank reconciliation is out by ${c.difference.toFixed(2)}.`);
		let l = {
			id: pm(),
			reconciliationNumber: mm(e.statementDate),
			bankAccountId: t.id,
			statementDate: e.statementDate,
			statementBalance: dm(e.statementBalance),
			bookBalance: c.bookBalance,
			outstandingDeposits: c.outstandingDeposits,
			outstandingPayments: c.outstandingPayments,
			adjustedStatementBalance: c.adjustedStatementBalance,
			difference: c.difference,
			clearedTransactionIds: o,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return lm = [l, ...lm], um(), l;
	}
}, _m = gm.complete;
gm.complete = function(e) {
	return S(), F.transaction(() => _m.call(gm, e));
}, o("bankReconciliations", {
	repository: gm,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: lm }),
	restore: (e) => {
		lm = e.reconciliations;
	},
	publish: () => cm.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/settlementRepository.ts
var vm = (e) => Math.round((e + 2 ** -52) * 100) / 100, Y = j().trim().min(1).max(200), ym = fc().finite().positive().refine((e) => vm(e) === e, "Use cents precision"), bm = P({
	operationId: Y,
	customerId: Y,
	paymentDate: Y,
	bankAccountId: Y,
	reference: j().max(500).optional(),
	allocations: N(P({
		invoiceId: Y,
		amount: ym
	}).strict()).min(1).max(500)
}).strict(), xm = P({
	operationId: Y,
	creditId: Y,
	paymentDate: Y,
	bankAccountId: Y,
	amount: ym,
	reference: j().max(500).optional()
}).strict(), Sm = [], Cm = [], wm = [], Tm = 0, Em = /* @__PURE__ */ new Set(), Dm = () => {
	Tm++, Em.forEach((e) => e());
};
function Om(e, t, n) {
	let r = JSON.stringify(n), i = e.find((e) => e.operationId === t);
	if (i && i.fingerprint !== r) throw Error("Operation ID was already used with different data.");
	return {
		old: i,
		fingerprint: r
	};
}
function km(e, t) {
	p(t, "Payment date");
	let n = ad.requireById(e);
	if (!n.active || t < n.openingBalanceDate) throw Error("Bank is inactive or payment precedes its opening date.");
	let r = R.requireById(n.glAccountId);
	if (!r.active || r.type !== "ASSET") throw Error("Invalid bank ledger account.");
	return n;
}
function Am(e) {
	if (gm.getAll().some((t) => t.clearedTransactionIds.some((t) => t.startsWith(e + ":")))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function jm(e, t) {
	let n = e === "customer" ? B.getById(t) : J.getById(t);
	if (!n || n.status === "VOID" || n.status === "DRAFT") throw Error("An issued credit is required.");
	return n;
}
function Mm(e, t, n) {
	let r = jm(e, t), i = vm(n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0)), a = vm(r.totals.total - r.amountApplied - i);
	if (a < 0) throw Error("Refund exceeds the unused credit.");
	let o = {
		...r,
		refundEvents: n,
		amountRefunded: i,
		amountAvailable: a,
		status: a === 0 ? "FULLY_APPLIED" : "ISSUED",
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	e === "customer" ? B.update(o) : J.update(o);
}
function Nm(e, t) {
	S();
	let n = xm.parse(t), { old: r, fingerprint: i } = Om(e === "customer" ? Cm : wm, n.operationId, n);
	if (r) return r;
	let a = jm(e, n.creditId), o = km(n.bankAccountId, n.paymentDate);
	if (n.paymentDate < a.creditDate || n.amount > a.amountAvailable) throw Error("Refund date/amount exceeds the available credit.");
	let s = R.requireBySystemRole(e === "customer" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"), c = crypto.randomUUID(), l = z.post({
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
	return Mm(e, a.id, [...a.refundEvents ?? [], {
		id: u.id,
		date: u.paymentDate,
		amount: u.amount
	}]), e === "customer" ? Cm = [...Cm, u] : wm = [...wm, u], Dm(), u;
}
function Pm(e, t) {
	if (S(), p(t.reversalDate, "Reversal date"), !t.reason?.trim() || t.reason.trim().length < 3) throw Error("Enter a reversal reason.");
	let n = e === "customer" ? Cm : wm, r = n.find((e) => e.id === t.id);
	if (!r) throw Error("Refund was not found.");
	if (r.status === "REVERSED") return r;
	if (t.reversalDate < r.paymentDate) throw Error("Reversal cannot precede the refund.");
	Am(r.journalEntryId), z.reverse({
		journalEntryId: r.journalEntryId,
		reversalDate: t.reversalDate,
		reason: t.reason
	});
	let i = jm(e, r.creditId);
	Mm(e, i.id, (i.refundEvents ?? []).map((e) => e.id === r.id ? {
		...e,
		reversalDate: t.reversalDate
	} : e));
	let a = {
		...r,
		status: "REVERSED",
		reversalDate: t.reversalDate
	};
	return e === "customer" ? Cm = n.map((e) => e.id === r.id ? a : e) : wm = n.map((e) => e.id === r.id ? a : e), Dm(), a;
}
var Fm = {
	recordReceipt(e) {
		let t = bm.parse(e), { old: n, fingerprint: r } = Om(Sm, t.operationId, t);
		if (n) return n;
		if (km(t.bankAccountId, t.paymentDate), new Set(t.allocations.map((e) => e.invoiceId)).size !== t.allocations.length) throw Error("Each invoice may only be allocated once.");
		for (let e of t.allocations) {
			let n = jd.getAll().find((t) => t.id === e.invoiceId && t.type === "INVOICE");
			if (!n || n.type !== "INVOICE" || n.customerId !== t.customerId || t.paymentDate < n.documentDate || ["VOID", "DRAFT"].includes(n.status) || e.amount > n.amountDue) throw Error("Invalid invoice customer, date or outstanding amount.");
		}
		let i = t.allocations.map((e, n) => jd.recordInvoicePayment({
			...t,
			invoiceId: e.invoiceId,
			amount: e.amount,
			method: "BANK_TRANSFER",
			operationId: t.operationId + ":" + n
		})), a = {
			...t,
			id: crypto.randomUUID(),
			fingerprint: r,
			amount: vm(i.reduce((e, t) => e + t.amount, 0)),
			paymentIds: i.map((e) => e.id),
			status: "POSTED"
		};
		return Sm = [...Sm, a], Dm(), a;
	},
	reverseReceipt(e) {
		let t = Sm.find((t) => t.id === e.id);
		if (!t) throw Error("Receipt not found.");
		if (t.status === "REVERSED") return t;
		for (let e of t.paymentIds) {
			let t = dd.getById(e);
			if (!t || t.status !== "RECEIVED") throw Error("Receipt allocations changed; inspect individual payments first.");
			for (let t of z.getBySource("CUSTOMER_PAYMENT", e)) Am(t.id);
		}
		for (let n of t.paymentIds) jd.reverseInvoicePayment(n, e.reason);
		let n = {
			...t,
			status: "REVERSED",
			reversalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		};
		return Sm = Sm.map((e) => e.id === t.id ? n : e), Dm(), n;
	},
	createRefund: (e) => Nm("customer", e),
	reverseRefund: (e) => Pm("customer", e)
}, Im = {
	create: (e) => Nm("supplier", e),
	reverse: (e) => Pm("supplier", e),
	repairLegacyCredits(e) {
		if (S(), p(e.date, "Repair date"), e.reason?.trim().length < 3) throw Error("Enter a repair reason.");
		let t = [];
		for (let n of J.getAll().filter((e) => e.status !== "VOID")) {
			if (e.date < n.creditDate || z.getBySource("SUPPLIER_CREDIT_RECLASS", n.id).length) continue;
			let r = z.getBySource("SUPPLIER_CREDIT", n.id).find((e) => e.status === "POSTED");
			if (!r) continue;
			let i = R.requireBySystemRole("INVENTORY"), a = R.requireBySystemRole("PURCHASE_PRICE_VARIANCE"), o = vm(r.lines.filter((e) => e.accountId === i.id).reduce((e, t) => e + t.credit - t.debit, 0));
			o <= 0 || t.push(z.post({
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
}, Lm = P({
	id: Y,
	operationId: Y,
	fingerprint: Y,
	creditId: Y,
	contactId: Y,
	paymentDate: Y,
	bankAccountId: Y,
	amount: ym,
	journalEntryId: Y,
	status: Ac(["POSTED", "REVERSED"]),
	reference: j().optional(),
	reversalDate: j().optional()
}).strict();
o("customerSettlements", {
	repository: Fm,
	read: "sales.read",
	commands: {
		recordReceipt: "sales.payment",
		reverseReceipt: "sales.payment",
		createRefund: "sales.payment",
		reverseRefund: "sales.payment"
	},
	snapshot: () => ({
		receipts: Sm,
		refunds: Cm
	}),
	restore: (e) => {
		Sm = e.receipts, Cm = e.refunds;
	},
	validate: (e, t) => {
		Rm(e, t, !1);
		let n = e;
		N(Lm.extend({ fingerprint: j() })).parse(n.refunds), N(P({
			id: Y,
			operationId: Y,
			paymentIds: N(Y),
			amount: ym,
			status: Ac(["POSTED", "REVERSED"])
		}).passthrough()).parse(n.receipts);
	},
	publish: Dm
}), o("supplierRefunds", {
	repository: Im,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		repairLegacyCredits: "accounting.recover"
	},
	snapshot: () => ({ refunds: wm }),
	restore: (e) => {
		wm = e.refunds;
	},
	validate: (e, t) => {
		Rm(e, t, !0), N(Lm.extend({ fingerprint: j() })).parse(e.refunds);
	},
	publish: Dm
});
function Rm(e, t, n) {
	let r = e, i = t.journals.journalEntries, a = n ? t.supplierCredits.supplierCredits : t.customerCredits.creditNotes, o = t.bankAccounts.bankAccounts;
	for (let e of r.refunds) {
		let t = a.find((t) => t.id === e.creditId), r = i.find((t) => t.id === e.journalEntryId), s = t?.refundEvents?.find((t) => t.id === e.id);
		if (!t || e.contactId !== ("customerId" in t ? t.customerId : t.supplierId) || !s || s.amount !== e.amount || s.date !== e.paymentDate || s.reversalDate !== e.reversalDate || !o.some((t) => t.id === e.bankAccountId) || !r || r.sourceId !== e.id || r.sourceType !== (n ? "SUPPLIER_REFUND" : "CUSTOMER_REFUND") || r.totalDebit !== e.amount || r.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) throw Error("Refund snapshot relationships are invalid.");
	}
	for (let e of a) {
		let t = vm(r.refunds.filter((t) => t.creditId === e.id && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
		if ((e.amountRefunded ?? 0) !== t) throw Error("Credit refunded balance is invalid.");
	}
	for (let e of a) for (let t of e.refundEvents ?? []) if (!r.refunds.some((n) => n.id === t.id && n.creditId === e.id)) throw Error("Credit refund history has no settlement record.");
	if (!n) {
		let e = t.customerPayments.payments;
		for (let t of r.receipts ?? []) {
			let n = t.paymentIds.map((t) => e.find((e) => e.id === t));
			if (new Set(t.paymentIds).size !== t.paymentIds.length || !n.length || n.some((e) => !e || e.customerId !== t.customerId || e.bankAccountId !== t.bankAccountId || e.status !== (t.status === "REVERSED" ? "REVERSED" : "RECEIVED")) || vm(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== t.amount) throw Error("Receipt allocation snapshot relationships are invalid.");
		}
	}
}
//#endregion
//#region src/features/sales/data/invoiceBalanceAsAtService.ts
function zm(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= Hm(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: Um(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => Bm(e, r)), a = Um(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && Vm(t, r)), s = Um(o.reduce((e, t) => e + t.amount, 0)), c = Um(e.totals.total), l = Um(Math.max(0, c - a - s));
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
function Bm(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Hm(e.reversedAt) : !1;
}
function Vm(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Hm(e.reversedAt) : !1;
}
function Hm(e) {
	return u(e);
}
function Um(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function Wm(e, t, n) {
	let r = qm(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= Km(e.voidedAt)) return Gm(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && Vm(t, n)), a = qm(i.reduce((e, t) => e + t.amount, 0)), o = qm(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - a));
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
function Gm(e, t, n) {
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
function Km(e) {
	return u(e);
}
function qm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function Jm(e, t, n = [], r = [], i = [], a = Zm()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = zm(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = Ym(e.dueDate, a);
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
		current: Qm(s.current),
		days1To30: Qm(s.days1To30),
		days31To60: Qm(s.days31To60),
		days61To90: Qm(s.days61To90),
		days90Plus: Qm(s.days90Plus)
	}, p = Qm(c), m = Qm(l), h = Qm(i.reduce((t, n) => n.customerId === e.id ? t + Wm(n, r, a).amountAvailable : t, 0)), ee = Qm(p - h);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: h,
		netAccountBalance: ee,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: Qm(Math.max(0, e.creditLimit - Math.max(0, ee))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function Ym(e, t = Zm()) {
	let n = Xm(e), r = Xm(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Xm(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function Zm() {
	return u((/* @__PURE__ */ new Date()).toISOString());
}
function Qm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function $m(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function eh(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function th(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? $m(t - n) : $m(n - t);
}
function nh(e, t, n) {
	eh(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = $m(t + r.debit), n = $m(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: th(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = $m(r.reduce((e, t) => e + t.totalDebit, 0)), o = $m(r.reduce((e, t) => e + t.totalCredit, 0));
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
function rh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ih({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = Jm(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: rh(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = rh(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = rh(nh(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = rh(l - d);
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
function ah(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && oh(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = sh(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && oh(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = sh(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && oh(n.reversedAt) <= r ? t : t + n.amount, 0)), o = sh(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: sh(Math.max(0, o - i - a))
	};
}
function oh(e) {
	return u(e);
}
function sh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function ch(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && lh(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = uh(e.totals.total), i = uh(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && lh(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: uh(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - i))
	};
}
function lh(e) {
	return u(e);
}
function uh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function dh(e, t, n = [], r = [], i = [], a = vh()) {
	let o = mh(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = ah(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = ph(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = _h(r.reduce((t, n) => n.supplierId === e.id ? t + ch(n, i, a).amountAvailable : t, 0)), p = _h(s), m = _h(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: _h(c),
		aging: hh(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function fh(e, t, n = [], r = [], i = [], a = vh()) {
	let o = mh(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let h of e) {
		let e = dh(h, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: _h(s),
		unallocatedCredit: _h(c),
		totalOutstanding: _h(l),
		overdueAmount: _h(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: hh(o)
	};
}
function ph(e, t = vh()) {
	let n = gh(e), r = gh(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function mh() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function hh(e) {
	return {
		current: _h(e.current),
		days1To30: _h(e.days1To30),
		days31To60: _h(e.days31To60),
		days61To90: _h(e.days61To90),
		days90Plus: _h(e.days90Plus)
	};
}
function gh(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function _h(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function vh() {
	return u((/* @__PURE__ */ new Date()).toISOString());
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function yh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function bh({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = fh(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = yh(nh(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = yh(c.totalOutstanding), f = yh(d - u);
	return {
		asOfDate: s,
		grossOutstanding: yh(c.grossOutstanding),
		unallocatedCredit: yh(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function xh(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function Sh(e) {
	return e.slice(0, 10);
}
function Ch(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function wh(e, t) {
	xh(t);
	let n = e.filter((e) => Sh(e.occurredAt) <= t).slice().sort(Ch), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = W(n.quantityOnHand + e.quantityBase), a = vf(n.inventoryValue + e.valueChange);
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
		let t = jf.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = al(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : _f(e.inventoryValue / e.quantityOnHand);
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
		totalQuantity: W(i.reduce((e, t) => e + t.quantityOnHand, 0)),
		totalInventoryValue: vf(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function Th(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Eh(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function Dh({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	Eh(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = wh(n, r), o = Th(nh(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = Th(a.totalInventoryValue), c = Th(s - o);
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
//#region src/features/security/trustedAuthorization.ts
var Oh = null, kh = {
	connect(e) {
		return Oh = e, () => {
			Oh === e && (Oh = null);
		};
	},
	disconnect() {
		Oh = null;
	},
	current() {
		return Oh?.() ?? null;
	},
	require(t) {
		return e(this.current(), t);
	}
}, Ah = (e) => Math.round((e + 2 ** -52) * 100) / 100, X = j().trim().min(1).max(200), jh = fc().finite().refine((e) => Ah(e) === e, "Amounts must use cents precision"), Mh = P({
	accountId: X,
	debit: jh.nonnegative(),
	credit: jh.nonnegative()
}).strict(), Nh = P({
	contactId: X,
	reference: X,
	date: X,
	dueDate: X,
	amount: jh
}).strict(), Ph = P({
	operationId: X,
	date: X,
	reason: j().trim().min(3).max(1e3),
	gl: N(Mh).min(2).max(5e3),
	ar: N(Nh).max(1e4),
	ap: N(Nh).max(1e4),
	banks: N(P({
		bankAccountId: X,
		amount: jh
	}).strict()).max(500),
	stock: N(P({
		siteId: X,
		productId: X,
		quantity: fc().positive().finite(),
		unitCost: fc().nonnegative().finite()
	}).strict()).max(1e4)
}).strict(), Fh = [], Ih = 0, Lh = /* @__PURE__ */ new Set(), Rh = () => {
	Ih++, Lh.forEach((e) => e());
};
function zh() {
	return te();
}
function Bh(e) {
	t(e), Sl(e.sales), v(e.customerCredits), F.update("supplierBills", e.supplierBills.supplierBills), F.update("supplierCredits", e.supplierCredits.supplierCredits);
}
function Vh(e, t) {
	if (new Set(e).size !== e.length) throw Error("Duplicate " + t + ".");
}
function Hh(e) {
	let t = Ph.parse(e);
	if (p(t.date, "Cutover date"), Ml(t.date), S(), Fh.some((e) => e.status === "POSTED")) throw Error("An opening batch is already active. Reverse the unused batch before replacing it.");
	let n = zh();
	if (n.journals.journalEntries.some((e) => e.journalDate >= t.date)) throw Error("Cutover must be after all existing ledger activity. This import adds historical balances, never replaces existing transactions.");
	if (n.inventoryMovements.movements.some((e) => e.occurredAt.slice(0, 10) >= t.date)) throw Error("Cutover must be after existing inventory activity.");
	Vh(t.gl.map((e) => e.accountId), "GL account"), Vh(t.banks.map((e) => e.bankAccountId), "bank"), Vh(t.stock.map((e) => e.siteId + ":" + e.productId), "site/product");
	let r = ih({
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
	}), i = bh({
		suppliers: n.suppliers.suppliers,
		bills: n.supplierBills.supplierBills,
		payments: n.supplierPayments.supplierPayments,
		credits: n.supplierCredits.supplierCredits,
		creditAllocations: n.supplierCredits.allocations,
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: t.date
	}), a = Dh({
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
	let o = R.getAll(), s = (e) => R.requireBySystemRole(e).id, c = (e) => Ah(t.gl.filter((t) => t.accountId === e).reduce((e, t) => e + t.debit - t.credit, 0));
	for (let e of t.gl) {
		let t = R.requireById(e.accountId);
		if (!t.active || ![
			"ASSET",
			"LIABILITY",
			"EQUITY"
		].includes(t.type) || e.debit > 0 && e.credit > 0 || e.debit + e.credit <= 0) throw Error("Opening GL requires active balance-sheet accounts and one positive debit or credit per row.");
	}
	let l = Ah(t.gl.reduce((e, t) => e + t.debit, 0)), u = Ah(t.gl.reduce((e, t) => e + t.credit, 0));
	if (l !== u || !l) throw Error("Opening trial balance does not balance.");
	let d = Ah(t.ar.reduce((e, t) => e + t.amount, 0)), f = Ah(t.ap.reduce((e, t) => e + t.amount, 0));
	if (c(s("ACCOUNTS_RECEIVABLE")) !== d || c(s("ACCOUNTS_PAYABLE")) !== -f) throw Error("AR/AP detail must equal imported GL control balances. Negative detail creates an unused historical credit.");
	for (let [e, r] of [["ar", t.ar], ["ap", t.ap]]) {
		Vh(r.map((e) => e.contactId + ":" + e.reference.toLowerCase()), e + " reference");
		for (let i of r) {
			if (p(i.date), p(i.dueDate), !i.amount || i.date > t.date || i.dueDate < i.date) throw Error("Invalid outstanding document amount/date.");
			if (!(e === "ar" ? n.customers.customers : n.suppliers.suppliers).some((e) => e.id === i.contactId)) throw Error("Opening contact not found.");
			if ((e === "ar" ? [...n.sales.invoices.map((e) => [e.customerId, e.documentNumber]), ...n.customerCredits.creditNotes.map((e) => [e.customerId, e.creditNoteNumber])] : [...n.supplierBills.supplierBills.map((e) => [e.supplierId, e.supplierInvoiceNumber]), ...n.supplierCredits.supplierCredits.map((e) => [e.supplierId, e.supplierCreditNumber])]).some(([e, t]) => e === i.contactId && t.toLowerCase() === i.reference.toLowerCase())) throw Error("Historical document reference already exists.");
		}
	}
	let m = 0;
	for (let e of t.stock) {
		let t = al(e.productId), n = jf.getById(e.siteId);
		if (!t || t.status !== "ACTIVE" || t.itemType === "SERVICE" || n?.status !== "ACTIVE") throw Error("Opening stock requires active stocked products/sites.");
		if (Math.round(e.quantity * 1e4) / 1e4 !== e.quantity) throw Error("Stock quantities use at most four decimal places.");
		m = Ah(m + Ah(e.quantity * e.unitCost));
	}
	if (c(s("INVENTORY")) !== m) throw Error("Stock valuation must equal imported inventory GL.");
	for (let e of n.bankAccounts.bankAccounts) {
		let n = t.banks.find((t) => t.bankAccountId === e.id);
		if (c(e.glAccountId) !== (n?.amount ?? 0)) throw Error("Bank detail must equal imported bank GL.");
		if (n && (!e.active || t.date < e.openingBalanceDate || e.openingBalance !== 0)) throw Error("Opening bank must be active with zero metadata balance and an opening date on/before cutover.");
	}
	for (let e of t.banks) if (!n.bankAccounts.bankAccounts.some((t) => t.id === e.bankAccountId)) throw Error("Unknown opening bank account.");
	let h = new Set(n.bankAccounts.bankAccounts.map((e) => e.glAccountId));
	if (o.some((e) => e.systemRole === "BANK" && !h.has(e.id) && c(e.id) !== 0)) throw Error("Bank GL requires a linked bank account.");
	return {
		input: t,
		s: n,
		debit: l,
		credit: u,
		ar: d,
		ap: f,
		inventory: m
	};
}
o("openingBalances", {
	repository: {
		preview(e) {
			let { input: t, debit: n, credit: r, ar: i, ap: a, inventory: o } = Hh(e);
			return {
				date: t.date,
				debit: n,
				credit: r,
				ar: i,
				ap: a,
				inventory: o,
				bank: Ah(t.banks.reduce((e, t) => e + t.amount, 0)),
				documents: t.ar.length + t.ap.length
			};
		},
		post(e) {
			let t = Ph.parse(e), n = JSON.stringify(t), r = Fh.find((e) => e.operationId === t.operationId);
			if (n.length > 5e7) throw Error("Opening import exceeds 50 MB.");
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID already used for different opening data.");
				return r;
			}
			let { input: i, s: a } = Hh(t), o = crypto.randomUUID(), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
				id: o,
				operationId: i.operationId,
				fingerprint: n,
				date: i.date,
				reason: i.reason,
				status: "POSTED",
				actor: kh.current()?.userId ?? "",
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
			}, l = (e) => R.requireBySystemRole(e).id, u = l("OWNERS_EQUITY"), d = 0, f = 0;
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
				let ee = e === "ar" == t.amount > 0, te = z.post({
					journalDate: i.date,
					description: "Opening outstanding " + t.reference,
					reference: t.reference,
					sourceType: h,
					sourceId: n,
					lines: [{
						accountId: l(e === "ar" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"),
						debit: ee ? r : 0,
						credit: ee ? 0 : r
					}, {
						accountId: u,
						debit: ee ? 0 : r,
						credit: ee ? r : 0
					}]
				});
				c.journalIds.push(te.id), ee ? d += r : f += r;
			}
			a.journals = zh().journals, Bh(a);
			let p = i.gl.filter((e) => ![l("ACCOUNTS_RECEIVABLE"), l("ACCOUNTS_PAYABLE")].includes(e.accountId));
			(d || f) && p.push({
				accountId: u,
				debit: Ah(d),
				credit: Ah(f)
			});
			let m = /* @__PURE__ */ new Map();
			for (let e of p) m.set(e.accountId, Ah((m.get(e.accountId) ?? 0) + e.debit - e.credit));
			let h = [...m].filter(([, e]) => e !== 0).map(([e, t]) => ({
				accountId: e,
				debit: Math.max(0, t),
				credit: Math.max(0, -t)
			}));
			if (h.length) {
				let e = z.post({
					journalDate: i.date,
					description: "Opening trial balance " + i.reason,
					sourceType: "OPENING_BALANCE",
					sourceId: o,
					lines: h
				});
				c.journalIds.push(e.id);
			}
			for (let e of i.stock) {
				let t = al(e.productId), n = t.units.find((e) => e.id === t.baseUnitId), r = If.create({
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
				dp.receive({
					siteId: e.siteId,
					productId: t.id,
					baseUnitId: t.baseUnitId,
					quantityBase: e.quantity
				});
				let a = ip({
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
			return Fh = [...Fh, c], Rh(), c;
		},
		reverse(e) {
			if (p(e.date), Ml(e.date), S(), !e.reason?.trim() || e.reason.trim().length < 3) throw Error("Reversal reason is required.");
			let t = Fh.find((t) => t.id === e.id);
			if (!t) throw Error("Opening batch not found.");
			if (t.status === "REVERSED") return t;
			if (e.date < t.date) throw Error("Reversal date precedes cutover.");
			let n = zh();
			if (n.journals.journalEntries.some((e) => !t.priorJournalIds.includes(e.id) && !t.journalIds.includes(e.id)) || n.inventoryMovements.movements.some((e) => !t.priorMovementIds.includes(e.id) && !t.movementIds.includes(e.id))) throw Error("Subsequent accounting or inventory activity exists. Reverse downstream activity before correcting opening balances.");
			let r = n.sales.invoices.filter((e) => t.invoiceIds.includes(e.id)), i = n.supplierBills.supplierBills.filter((e) => t.billIds.includes(e.id)), a = [...n.customerCredits.creditNotes.filter((e) => t.customerCreditIds.includes(e.id)), ...n.supplierCredits.supplierCredits.filter((e) => t.supplierCreditIds.includes(e.id))];
			if (r.some((e) => e.amountPaid !== 0 || e.amountDue !== e.totals.total) || i.some((e) => e.totals.amountPaid !== 0 || e.totals.amountCredited !== 0) || a.some((e) => e.amountApplied !== 0 || (e.amountRefunded ?? 0) !== 0)) throw Error("Opening balances have allocations or settlements. Reverse downstream allocations before correcting them.");
			for (let e of ["customerSettlements", "supplierRefunds"]) if (JSON.stringify(n[e]).includes(t.id)) throw Error("Opening balances have downstream settlements.");
			for (let e of t.journalIds) Am(e);
			for (let n of t.journalIds) z.reverse({
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
			return n.stock.balances = t.priorStock, n.costBalances.balances = t.priorCost, n.journals = zh().journals, Bh(n), Fh = Fh.map((n) => n.id === t.id ? {
				...n,
				status: "REVERSED",
				reversalDate: e.date,
				reversalReason: e.reason
			} : n), Rh(), Fh.find((e) => e.id === t.id);
		}
	},
	read: "accounting.read",
	commands: {
		preview: "accounting.post",
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ batches: Fh }),
	restore: (e) => {
		Fh = e.batches;
	},
	publish: Rh,
	validate: (e, t) => {
		let n = P({ batches: N(P({
			id: X,
			operationId: X,
			date: X,
			status: Ac(["POSTED", "REVERSED"]),
			journalIds: N(X),
			invoiceIds: N(X),
			billIds: N(X),
			customerCreditIds: N(X),
			supplierCreditIds: N(X),
			fingerprint: j().min(1).max(5e7),
			reason: j().min(3),
			actor: X,
			createdAt: X,
			movementIds: N(X),
			costMovementIds: N(X),
			priorJournalIds: N(X),
			priorMovementIds: N(X),
			priorStock: N(P({
				siteId: X,
				productId: X,
				baseUnitId: X,
				quantityOnHand: fc().finite().nonnegative(),
				updatedAt: X
			}).strict()),
			priorCost: N(P({
				siteId: X,
				productId: X,
				baseUnitId: X,
				quantityOnHand: fc().finite().nonnegative(),
				averageCostPerBaseUnit: fc().finite().nonnegative(),
				inventoryValue: fc().finite().nonnegative(),
				costingMethod: Mc("MOVING_WEIGHTED_AVERAGE"),
				updatedAt: X
			}).strict()),
			reversalDate: X.optional(),
			reversalReason: j().optional()
		}).strict()) }).strict().parse(e);
		for (let e of n.batches) {
			let n = Ph.parse(JSON.parse(e.fingerprint));
			if (n.operationId !== e.operationId || n.date !== e.date) throw Error("Opening import identity is invalid.");
			if (e.status === "REVERSED" && !e.reversalDate) throw Error("Opening reversal date is missing.");
			e.reversalDate && p(e.reversalDate), p(e.date);
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
//#region src/features/purchases/data/supplierPaymentRepository.ts
var Uh = /* @__PURE__ */ new Set(), Wh = F.read().supplierPayments;
F.onRollback(() => {
	Wh = F.read().supplierPayments;
});
function Gh() {
	F.update("supplierPayments", Wh), Uh.forEach((e) => F.notify(e));
}
var Kh = {
	subscribe(e) {
		return Uh.add(e), () => {
			Uh.delete(e);
		};
	},
	getSnapshot() {
		return Wh;
	},
	getAll() {
		return Wh;
	},
	getById(e) {
		return Wh.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return Wh.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return Wh.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: Jh(e.reference),
			notes: Jh(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: Yh(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = Wh.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (p(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = tf.getById(e.supplierId);
		if (!r) throw Error("Supplier was not found.");
		if (!e.paymentDate) throw Error("Payment date is required.");
		if (!e.method) throw Error("Payment method is required.");
		if (!e.bankAccountId) throw Error("Bank account is required.");
		let i = ad.getById(e.bankAccountId);
		if (!i) throw Error("Bank account was not found.");
		if (!i.active) throw Error("The selected bank account is inactive.");
		let a = e.allocations.filter((e) => Number.isFinite(e.amount) && e.amount > 0);
		if (a.length === 0) throw Error("Allocate the payment to at least one supplier bill.");
		let o = /* @__PURE__ */ new Set(), s = a.map((t) => {
			if (o.has(t.supplierBillId)) throw Error("A supplier bill cannot appear more than once in the same payment.");
			o.add(t.supplierBillId);
			let n = Rp.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = Yh(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${Xh(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), c = Yh(s.reduce((e, t) => e + t.amount, 0));
		if (c <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of s) Rp.applyPayment(e.supplierBillId, e.amount);
		let l = (/* @__PURE__ */ new Date()).toISOString(), u = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: qh(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: c,
			method: e.method,
			bankAccountId: i.id,
			reference: Jh(e.reference),
			notes: Jh(e.notes),
			allocations: s,
			status: "POSTED",
			createdAt: l,
			updatedAt: l
		};
		return Wh = [u, ...Wh], Gh(), kf.postSupplierPayment(u), u;
	},
	reverse(e, t) {
		nl("SUPPLIER_PAYMENT", e);
		let n = Wh.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = Rp.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) Rp.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return Wh = Wh.map((t) => t.id === e ? a : t), Gh(), kf.reverseSupplierPayment(a), a;
	}
};
function qh(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = Wh.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Jh(e) {
	return e?.trim() || void 0;
}
function Yh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Xh(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: n().currency
	}).format(e);
}
var Zh = Kh.create;
Kh.create = function(...e) {
	return S(), F.transaction(() => Zh.apply(Kh, e));
};
var Qh = Kh.reverse;
Kh.reverse = function(...e) {
	return S(), F.transaction(() => Qh.apply(Kh, e));
}, o("supplierPayments", {
	repository: Kh,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: Wh }),
	restore: (e) => {
		Wh = e.supplierPayments;
	},
	publish: () => Uh.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/paymentBatchRepository.ts
var $h = (e) => Math.round((e + 2 ** -52) * 100) / 100, eg = j().trim().min(1).max(200), tg = P({
	operationId: eg,
	paymentDate: eg,
	bankAccountId: eg,
	reference: j().max(500),
	allocations: N(P({
		supplierBillId: eg,
		amount: fc().finite().positive().refine((e) => $h(e) === e)
	}).strict()).min(1).max(500)
}).strict(), ng = [], rg = 0, ig = /* @__PURE__ */ new Set(), ag = () => {
	rg++, ig.forEach((e) => e());
}, og = () => {
	let e = kh.current();
	if (!e) throw Error("A verified session is required.");
	return e.userId;
};
function sg(e, t) {
	return {
		action: e,
		reason: t,
		actor: og(),
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function cg(e) {
	let t = ng.find((t) => t.id === e);
	if (!t) throw Error("Payment batch was not found.");
	return t;
}
function lg(e) {
	return ng = ng.map((t) => t.id === e.id ? e : t), ag(), e;
}
function ug(e) {
	p(e.paymentDate, "Payment date");
	let t = ad.requireById(e.bankAccountId);
	if (!t.active || e.paymentDate < t.openingBalanceDate) throw Error("Invalid paying bank account/date.");
	if (new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length) throw Error("Select each bill only once.");
	for (let t of e.allocations) {
		let n = Rp.getById(t.supplierBillId);
		if (!n || n.status === "VOID" || t.amount > n.totals.amountDue || e.paymentDate < n.billDate) throw Error("A bill amount, date or outstanding balance changed. Review the batch.");
	}
}
o("paymentBatches", {
	repository: {
		create(e) {
			let t = tg.parse(e), n = JSON.stringify(t), r = ng.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID was used with different batch data.");
				return r;
			}
			ug(t);
			let i = {
				...t,
				id: crypto.randomUUID(),
				fingerprint: n,
				status: "DRAFT",
				createdBy: og(),
				paymentIds: [],
				history: [sg("Created")]
			};
			return ng = [...ng, i], ag(), i;
		},
		approve(e) {
			let t = cg(e);
			if (t.status === "APPROVED") return t;
			if (t.status !== "DRAFT") throw Error("Only a draft batch can be approved.");
			return ug(t), lg({
				...t,
				status: "APPROVED",
				approvedBy: og(),
				history: [...t.history, sg("Approved")]
			});
		},
		post(e) {
			let t = cg(e);
			if (t.status === "POSTED") return t;
			if (t.status !== "APPROVED") throw Error("Approve the batch before recording payments.");
			S(), ug(t);
			let n = /* @__PURE__ */ new Map();
			for (let e of t.allocations) {
				let t = Rp.getById(e.supplierBillId);
				n.set(t.supplierId, [...n.get(t.supplierId) ?? [], e]);
			}
			let r = [...n].map(([e, n]) => Kh.create({
				operationId: "batch:" + t.id + ":" + e,
				supplierId: e,
				paymentDate: t.paymentDate,
				bankAccountId: t.bankAccountId,
				reference: t.reference,
				method: "BANK_TRANSFER",
				allocations: n
			}));
			return lg({
				...t,
				status: "POSTED",
				paymentIds: r.map((e) => e.id),
				history: [...t.history, sg("Payments recorded")]
			});
		},
		cancel(e) {
			let t = cg(e.id);
			if (!["DRAFT", "APPROVED"].includes(t.status) || e.reason?.trim().length < 3) throw Error("Only an unposted batch can be cancelled, with a reason.");
			return lg({
				...t,
				status: "CANCELLED",
				history: [...t.history, sg("Cancelled", e.reason)]
			});
		},
		reverse(e) {
			let t = cg(e.id);
			if (t.status === "REVERSED") return t;
			if (t.status !== "POSTED" || e.reason?.trim().length < 3) throw Error("A posted batch and reversal reason are required.");
			S();
			for (let e of t.paymentIds) {
				let t = Kh.getById(e);
				if (!t || t.status !== "POSTED") throw Error("Batch payments changed. Inspect before reversing.");
				nl("SUPPLIER_PAYMENT", e);
			}
			for (let n of t.paymentIds) Kh.reverse(n, e.reason);
			return lg({
				...t,
				status: "REVERSED",
				history: [...t.history, sg("Reversed", e.reason)]
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
	snapshot: () => ({ batches: ng }),
	restore: (e) => {
		ng = e.batches;
	},
	validate: (e, t) => {
		let n = P({ batches: N(tg.extend({
			id: eg,
			fingerprint: j(),
			status: Ac([
				"DRAFT",
				"APPROVED",
				"POSTED",
				"REVERSED",
				"CANCELLED"
			]),
			createdBy: eg,
			approvedBy: eg.optional(),
			paymentIds: N(eg),
			history: N(P({
				action: eg,
				actor: eg,
				at: eg,
				reason: j().optional()
			}))
		})) }).strict().parse(e), r = t.supplierPayments.supplierPayments;
		for (let e of n.batches) {
			if (!["POSTED", "REVERSED"].includes(e.status)) continue;
			let n = e.paymentIds.map((e) => r.find((t) => t.id === e));
			if (!n.length || n.some((t) => !t || t.bankAccountId !== e.bankAccountId || t.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) || $h(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== $h(e.allocations.reduce((e, t) => e + t.amount, 0))) throw Error("Batch payment relationships are invalid.");
			if (e.paymentIds.some((e) => !t.journals.journalEntries.some((t) => t.sourceType === "SUPPLIER_PAYMENT" && t.sourceId === e))) throw Error("A batch payment journal is missing.");
		}
	},
	publish: ag
});
//#endregion
//#region src/features/page-previews/catalog.ts
var Z = (e, t, n = "text", r, i) => ({
	key: e,
	label: t,
	type: n,
	options: r,
	value: i,
	required: !0
}), Q = (e, t, n) => Z(e, t, "select", n), dg = (e, t, n = "0") => ({
	...Z(e, t, "number", void 0, n),
	min: 0,
	step: "0.01"
}), fg = (e, t) => Z(e, t, "date", void 0, "2026-10-16"), pg = (e, t) => ({
	...Q(e, t, [
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
}), mg = [];
function hg(e, t, n, r, i, a, o, s, c) {
	mg.push({
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
hg("products", "Products & services", "Inventory & pricing", "/inventory/products", "inventory.read", "Maintain purchasing, selling, stock and packaging information.", [
	Z("sku", "SKU"),
	Q("kind", "Product type", [
		"Stock item",
		"Service",
		"Non-stock item"
	]),
	Q("unit", "Selling unit", [
		"Pack",
		"m²",
		"Bucket",
		"Each"
	]),
	dg("price", "Standard selling price", "49.50"),
	dg("cost", "Buying cost (sample)", "25"),
	dg("coverage", "m² per pack", "2.2"),
	Q("rounding", "Pack rounding", ["Whole packs up", "Allow fractional packs"]),
	dg("reorder", "Reorder point", "10"),
	dg("target", "Target stock", "50"),
	Q("buy", "Available for purchasing", ["Yes", "No"]),
	Q("sell", "Available for selling", ["Yes", "No"]),
	Q("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	Z("brand", "Brand"),
	Z("category", "Category"),
	Z("image", "Image URL (preview only)")
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
]), hg("promotions", "Scheduled promotions", "Inventory & pricing", "/inventory/promotions", "inventory.read", "Plan customer and product specials with explicit start and end times.", [
	Z("product", "Product / SKU"),
	Z("customer", "Customer scope"),
	Z("starts", "Starts (local time)", "datetime-local", void 0, "2026-10-16T09:00"),
	Z("ends", "Ends (local time)", "datetime-local", void 0, "2026-10-31T17:00"),
	dg("price", "Promotional unit price", "45"),
	Q("priority", "Priority when rules overlap", [
		"Customer price first",
		"Promotion first",
		"Lowest eligible price"
	]),
	Z("timezone", "Time zone", "text", void 0, "Pacific/Auckland")
], {
	name: "October flooring special",
	product: "SAMPLE-OAK",
	customer: "All trade customers"
}, [
	"Overview",
	"Price comparison",
	"History"
]), hg("tax-codes", "Tax codes", "Accounting", "/accounting/tax-codes", "accounting.read", "Review GST codes, inclusive/exclusive calculation and reporting mappings.", [
	Z("code", "Tax code"),
	dg("rate", "Tax rate (%)", "15"),
	Q("basis", "Entry basis", ["Exclusive", "Inclusive"]),
	pg("collected", "GST collected account"),
	pg("paid", "GST paid account"),
	Z("report", "Return / report mapping")
], {
	name: "Standard GST",
	code: "GST15",
	report: "Output / input GST"
}, [
	"Overview",
	"Calculation preview",
	"Reporting"
]), hg("linked-accounts", "Linked accounts", "Accounting", "/accounting/linked-accounts", "accounting.read", "Preview default general ledger mappings used by each business process.", [
	Q("process", "Business process", [
		"Sales",
		"Purchases",
		"Payroll"
	]),
	pg("receivable", "Receivables / payables control"),
	pg("income", "Income / expense account"),
	pg("inventory", "Inventory account"),
	pg("cogs", "Cost of goods sold"),
	pg("gst", "GST control account"),
	pg("payroll", "Payroll clearing account")
], {
	name: "Sales posting defaults",
	process: "Sales"
}, ["Overview", "Posting example"]), hg("jobs", "Jobs & projects", "Accounting", "/accounting/jobs", "accounting.read", "Track project budgets, assigned contacts and sample profitability.", [
	Z("code", "Job code"),
	Z("customer", "Customer"),
	Z("owner", "Project owner"),
	fg("starts", "Start date"),
	fg("ends", "End date"),
	dg("budget", "Revenue budget", "10000"),
	dg("costBudget", "Cost budget", "6000")
], {
	name: "Sample showroom installation",
	code: "JOB-SAMPLE",
	customer: "Sample Flooring Ltd",
	owner: "Sample team"
}, [
	"Overview",
	"Transactions",
	"Profitability"
]), hg("bank-accounts", "Bank account setup", "Banking", "/banking/setup/accounts", "banking.read", "Preview bank account details, ledger links and feed preferences.", [
	Z("number", "Account number (sample only)"),
	Z("bank", "Bank name"),
	Q("currency", "Currency", ["NZD", "AUD"]),
	pg("ledger", "Linked bank GL account"),
	Q("feed", "Feed provider", ["Manual import", "Provider to be configured"]),
	fg("feedStart", "Feed start date")
], {
	name: "Sample operating account",
	number: "00-0000-0000000-00",
	bank: "Sample Bank"
}, [
	"Overview",
	"Feed settings",
	"Import history"
]), hg("bank-rules", "Bank rules", "Banking", "/banking/rules", "banking.read", "Define matching conditions and resulting categorisation before testing a sample.", [
	Q("match", "Match mode", ["All conditions", "Any condition"]),
	Q("field", "Transaction field", [
		"Description",
		"Payee",
		"Reference"
	]),
	Q("operator", "Operator", [
		"Contains",
		"Equals",
		"Starts with"
	]),
	Z("value", "Match text"),
	pg("account", "Categorise to account"),
	Q("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	Q("enabled", "Enabled", ["Yes", "No"])
], {
	name: "Sample office supplies",
	value: "OFFICE",
	field: "Description"
}, [
	"Overview",
	"Test rule",
	"History"
]), hg("payment-batches", "Electronic payment batches", "Banking", "/banking/payment-batches", "banking.read", "Select sample supplier or wage payments, review approval and bank export layout.", [
	Q("kind", "Batch type", ["Supplier payments", "Wages"]),
	fg("payDate", "Payment date"),
	Z("bank", "Paying account"),
	Z("reference", "Bank reference"),
	Q("format", "Export format", ["NZ bank CSV preview", "ABA layout preview"]),
	dg("total", "Batch total", "1100")
], {
	name: "Sample supplier batch",
	bank: "Sample operating account",
	reference: "OCT-SAMPLE"
}, [
	"Overview",
	"Payments",
	"Approval & export"
]), hg("pay-items", "Pay items", "Payroll", "/payroll/pay-items", "accounting.read", "Configure sample earnings, allowances, deductions, leave, tax and employer contributions.", [
	Z("code", "Pay item code"),
	Q("category", "Category", [
		"Earnings",
		"Allowance",
		"Deduction",
		"Leave",
		"Tax",
		"Employer contribution"
	]),
	Q("method", "Calculation method", [
		"Hourly rate",
		"Fixed amount",
		"Percentage"
	]),
	dg("rate", "Rate / amount", "30"),
	Q("taxable", "Tax treatment", [
		"Taxable",
		"Non-taxable",
		"Before tax deduction",
		"After tax deduction"
	]),
	pg("expense", "Expense account"),
	pg("liability", "Liability / clearing account")
], {
	name: "Ordinary hours",
	code: "ORD",
	category: "Earnings"
}, [
	"Overview",
	"Employee assignments",
	"Posting preview"
]), hg("filing", "Payroll filing", "Payroll", "/payroll/filing", "accounting.read", "Review a sample NZ Payday Filing submission and its response / correction workflow.", [
	Z("payrun", "Pay run reference"),
	fg("payDate", "Pay date"),
	Z("employer", "Employer IRD identifier (sample)"),
	Q("type", "Submission type", ["Employment information", "Amendment"]),
	Z("contact", "Payroll contact email", "email")
], {
	name: "October employment information",
	payrun: "SAMPLE-RUN-01",
	employer: "000-000-000",
	contact: "payroll@example.invalid"
}, [
	"Overview",
	"Employees & validation",
	"Submission & response"
]), hg("recurring", "Recurring transactions", "Automation & tasks", "/automation/recurring", "accounting.read", "Prepare templates, schedules, generated-item previews and failure recovery.", [
	Q("kind", "Transaction type", [
		"Invoice",
		"Bill",
		"Bank transaction"
	]),
	Z("contact", "Customer / supplier"),
	Q("frequency", "Frequency", [
		"Weekly",
		"Fortnightly",
		"Monthly",
		"Quarterly"
	]),
	fg("next", "Next generation date"),
	fg("ends", "Schedule end date"),
	dg("total", "Template amount", "220"),
	Q("mode", "Generation mode", ["Draft for review", "Require approval"])
], {
	name: "Monthly sample maintenance",
	contact: "Sample Flooring Ltd"
}, [
	"Overview",
	"Template lines",
	"Run history"
]), hg("tasks", "Tasks & action centre", "Automation & tasks", "/tasks", "sales.read", "Review due and overdue work, assign owners and retain preview status history.", [
	Z("customer", "Customer / branch"),
	Z("owner", "Assigned to"),
	fg("due", "Due date"),
	Q("priority", "Priority", [
		"Normal",
		"High",
		"Low"
	]),
	Z("notes", "Task instructions", "textarea")
], {
	name: "Follow up showroom quote",
	customer: "Sample Flooring / North branch",
	owner: "Sample sales",
	notes: "Confirm quantities and planned installation date."
}, [
	"Overview",
	"Notes & attachments",
	"Status history"
]), hg("visits", "Sales visits & activity", "Automation & tasks", "/sales/activity", "sales.read", "Inspect sales visits, check-in/out times, outcomes and follow-up tasks.", [
	Z("salesperson", "Salesperson"),
	Z("customer", "Customer / branch"),
	Z("checkin", "Check-in", "datetime-local", void 0, "2026-10-16T09:00"),
	Z("checkout", "Check-out", "datetime-local", void 0, "2026-10-16T09:30"),
	Z("outcome", "Visit outcome", "textarea"),
	Z("location", "Recorded location")
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
]), hg("draft-review", "Customer & contact review", "Automation & tasks", "/contacts/review", "contacts.write", "Review incoming customer/contact drafts, field mapping, duplicates and sync exceptions.", [
	Q("kind", "Draft type", [
		"Customer",
		"Branch",
		"Contact"
	]),
	Z("company", "Customer / company"),
	Z("branch", "Branch"),
	Z("email", "Email", "email"),
	Z("phone", "Phone"),
	Q("source", "Source", [
		"Sales draft",
		"Selected phone contact",
		"Business card OCR"
	]),
	Q("decision", "Review decision", [
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
]), hg("templates", "PDF & email templates", "Documents & imports", "/documents/templates", "accounting.read", "Design sample invoice, quote, PO, statement and remittance layouts and email copy.", [
	Q("kind", "Document type", [
		"Invoice",
		"Quotation",
		"Purchase order",
		"Customer statement",
		"Remittance"
	]),
	Z("subject", "Email subject"),
	Z("body", "Email body", "textarea"),
	Z("footer", "PDF footer", "textarea"),
	Q("logo", "Logo position", [
		"Left",
		"Centre",
		"Right"
	]),
	Q("paper", "Paper size", ["A4", "Letter"])
], {
	name: "Standard invoice template",
	subject: "Your document {{number}}",
	body: "Hello {{contact}}, please review the attached {{type}}.",
	footer: "Thank you for your business."
}, [
	"Overview",
	"PDF preview",
	"Email preview"
]), hg("custom-reports", "Saved & favourite reports", "Reports", "/reports/saved", "accounting.read", "Choose datasets, columns and filters, then save a sample report or mark it as a favourite.", [
	Q("dataset", "Dataset", [
		"Sales",
		"Purchases",
		"Payroll",
		"Banking",
		"General ledger"
	]),
	Z("columns", "Columns (comma separated)"),
	Z("filter", "Filter expression (preview)"),
	Q("basis", "Basis", ["Accrual", "Cash"]),
	Q("favourite", "Favourite", ["Yes", "No"])
], {
	name: "Monthly sales by customer",
	columns: "Customer, Date, Net, GST, Total",
	filter: "Date: current month"
}, ["Overview", "Report preview"]), hg("report-packs", "Report packs", "Reports", "/reports/packs", "accounting.read", "Compose financial reports, order sections and preview a cover and table of contents.", [
	Z("company", "Company"),
	Z("period", "Reporting period"),
	Z("reports", "Included reports (comma separated)"),
	Z("cover", "Cover heading"),
	Z("introduction", "Cover note", "textarea")
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
var gg = mg;
[...new Set(mg.map((e) => e.group))], Q("gst", "GST registration", ["Registered", "Not registered"]), Q("filing", "GST filing cycle", [
	"Two monthly",
	"Monthly",
	"Six monthly"
]), dg("quoteNext", "Next quote number", "1001"), dg("orderNext", "Next order number", "1001"), dg("invoiceNext", "Next invoice number", "1001"), dg("creditNext", "Next credit number", "1001"), Q("terms", "Default terms", [
	"20th of following month",
	"Due on receipt",
	"30 days"
]), Q("template", "Default template", ["Standard invoice", "Trade invoice"]), Q("reminders", "Overdue reminders", ["Manual only", "7 and 14 days overdue"]), Q("onlinePayment", "Online payment option", ["Disabled", "Configuration preview"]), dg("next", "Next PO number", "1001"), Q("terms", "Default payment terms", [
	"20th of following month",
	"30 days",
	"Due on receipt"
]), pg("expense", "Default expense account"), Q("receipt", "Bill matching", ["Require receipt match", "Allow expense bills"]), Q("remittance", "Remittance preference", ["Preview before sending", "Manual"]), Q("cycle", "Pay cycle", [
	"Weekly",
	"Fortnightly",
	"Monthly"
]), Q("day", "Pay day", [
	"Wednesday",
	"Thursday",
	"Friday"
]), pg("wages", "Wages expense account"), pg("clearing", "Payroll clearing account"), Q("bank", "Paying bank", ["Sample operating account"]), Q("filing", "Filing region", ["New Zealand · Payday Filing", "Australia · STP preview"]), Q("basis", "Default basis", ["Accrual", "Cash"]), Q("currency", "Display currency", ["NZD", "AUD"]), Q("precision", "Decimal places", ["2", "0"]), Q("negative", "Negative number style", ["(1,234.56)", "-1,234.56"]), Q("comparative", "Comparative period", [
	"Previous period",
	"Previous year",
	"None"
]);
//#endregion
//#region src/features/page-previews/previewModel.ts
function _g(e, t) {
	return Object.fromEntries(e.map((e) => [e.key, t?.[e.key] ?? e.value ?? e.options?.[0] ?? ""]));
}
Object.fromEntries(gg.map((e) => [e.id, [{
	..._g(e.fields),
	...e.example,
	id: "sample-1",
	name: e.example.name,
	status: "Draft"
}]]));
function vg(e) {
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
//#region src/features/finance-closure/bankStatementRepository.ts
var yg = (e) => Math.round((e + 2 ** -52) * 100) / 100, bg = j().min(1).max(200), xg = [], Sg = 0, Cg = /* @__PURE__ */ new Set(), wg = () => {
	Sg++, Cg.forEach((e) => e());
};
function Tg(e) {
	let t = ad.requireById(e);
	if (!t.active) throw Error("Select an active bank account.");
	return t;
}
function Eg(e) {
	let t = xg.find((t) => t.id === e);
	if (!t) throw Error("Statement line was not found.");
	return t;
}
function Dg(e) {
	if (e.status !== "UNMATCHED") throw Error("This line is already processed. Revert it before changing it.");
	let t = gm.getLatestByBankAccount(e.bankAccountId);
	if (t && e.date <= t.statementDate) throw Error("Statement date is already reconciled.");
}
function Og(e) {
	return xg = xg.map((t) => t.id === e.id ? e : t), wg(), e;
}
var kg = (e, t) => am(Tg(e), z.getAll(), t).transactions, Ag = P({
	date: bg,
	description: j().trim().min(1).max(1e3),
	amount: fc().finite().refine((e) => e !== 0 && yg(e) === e, "Enter a non-zero amount in cents"),
	reference: j().max(500).default(""),
	externalId: j().max(200).default("")
}).strict(), jg = {
	importRows(e) {
		let t = P({
			bankAccountId: bg,
			rows: N(Ag).min(1).max(1e4)
		}).strict().parse(e), n = Tg(t.bankAccountId), r = 0, i = [...xg], a = [];
		for (let e of t.rows) {
			if (p(e.date, "Statement date"), e.date < n.openingBalanceDate) throw Error("Statement predates the bank opening date.");
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
			let s = gm.getLatestByBankAccount(n.id);
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
		return xg = i, wg(), {
			created: a.length,
			duplicates: r
		};
	},
	importCsv(e) {
		if (typeof e.csv != "string" || e.csv.length > 1e7) throw Error("CSV exceeds the 10 MB limit.");
		let t = vg(e.csv.replace(/^\uFEFF/, "")), n = t.shift()?.map((e) => e.trim().toLowerCase()) ?? [];
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
		return jg.importRows({
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
					l = yg(t - e);
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
		return p(e.asOfDate, "As-of date"), kg(e.bankAccountId, e.asOfDate).filter((e) => e.journalStatus === "POSTED" && !xg.some((t) => t.ledgerIds.includes(e.id)));
	},
	match(e) {
		let t = Eg(e.id);
		if (Dg(t), !Array.isArray(e.ledgerIds) || !e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Select unique ledger entries.");
		let n = jg.candidates({
			bankAccountId: t.bankAccountId,
			asOfDate: t.date
		}), r = e.ledgerIds.map((e) => n.find((t) => t.id === e));
		if (r.some((e) => !e) || yg(r.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== t.amount) throw Error("Selected bank entries must match this signed statement amount exactly.");
		return Og({
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
		let t = Eg(e.id);
		return (d["bank-rules"] ?? []).filter((e) => e.status === "Active" && e.enabled !== "No").filter((e) => {
			let n = (e.field === "Reference" ? t.reference : e.field === "Description" ? t.description : "").toLowerCase(), r = e.value.toLowerCase();
			return e.operator === "Equals" ? n === r : e.operator === "Starts with" ? n.startsWith(r) : n.includes(r);
		});
	},
	post(e) {
		S();
		let t = Eg(e.id), n = JSON.stringify(e.splits);
		if (t.status === "POSTED") {
			if (t.fingerprint !== n) throw Error("Line was already posted with different categorisation.");
			return t;
		}
		Dg(t);
		let r = N(P({
			accountId: bg,
			amount: fc().finite().positive().refine((e) => yg(e) === e),
			taxCode: bg
		}).strict()).min(1).max(100).parse(e.splits);
		if (yg(r.reduce((e, t) => e + t.amount, 0)) !== Math.abs(t.amount)) throw Error("Split amounts must equal the statement total.");
		let i = Tg(t.bankAccountId), o = t.amount < 0, c = r.flatMap((e) => {
			let t = R.requireById(e.accountId);
			if (!t.active || !t.allowManualPosting || !["EXPENSE", "REVENUE"].includes(t.type)) throw Error("Use an active manual expense/revenue account. Payments against AR/AP must be matched to their source documents.");
			let n = s(e.taxCode), r = yg(e.amount / (1 + n)), i = yg(e.amount - r);
			return [{
				accountId: t.id,
				debit: o ? r : 0,
				credit: o ? 0 : r
			}, ...i ? [{
				accountId: (o ? a(e.taxCode).taxPaidAccountId : a(e.taxCode).taxCollectedAccountId) || R.requireBySystemRole(o ? "GST_RECEIVABLE" : "GST_PAYABLE").id,
				debit: o ? i : 0,
				credit: o ? 0 : i
			}] : []];
		}), l = z.post({
			journalDate: t.date,
			description: t.description,
			reference: t.reference,
			sourceType: "BANK_STATEMENT",
			sourceId: t.id + ":" + t.history.filter((e) => e.action === "Posted").length,
			lines: [{
				accountId: i.glAccountId,
				debit: o ? 0 : t.amount,
				credit: o ? -t.amount : 0
			}, ...c]
		}), u = l.lines.filter((e) => e.accountId === i.glAccountId).map((e) => l.id + ":" + e.id);
		return Og({
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
		let t = Eg(e.id);
		if (Dg(t), e.reason?.trim().length < 3) throw Error("Enter an exclusion reason.");
		return Og({
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
		S();
		let t = Eg(e.id);
		if (p(e.reversalDate, "Reversal date"), e.reason?.trim().length < 3 || e.reversalDate < t.date) throw Error("Enter a reason and a reversal date on or after the statement line.");
		if (t.status === "UNMATCHED") throw Error("Line is already unmatched.");
		for (let e of t.ledgerIds) Am(e.split(":")[0]);
		let n = gm.getLatestByBankAccount(t.bankAccountId);
		if (n && t.date <= n.statementDate) throw Error("Reconciled statement lines cannot be reverted.");
		return t.status === "POSTED" && t.journalEntryId && z.reverse({
			journalEntryId: t.journalEntryId,
			reversalDate: e.reversalDate,
			reason: e.reason
		}), Og({
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
		if (Ml(e.statementDate), S(), p(e.statementDate, "Statement date"), !xg.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate)) throw Error("Import the statement first.");
		if (xg.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate && t.status === "UNMATCHED")) throw Error("Process every statement line before completing reconciliation.");
		let t = xg.filter((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate).flatMap((e) => e.ledgerIds);
		return gm.complete({
			...e,
			clearedTransactionIds: [.../* @__PURE__ */ new Set([...gm.getClearedTransactionIds(e.bankAccountId), ...t])]
		});
	}
}, Mg = P({
	id: bg,
	key: j(),
	bankAccountId: bg,
	date: bg,
	description: j(),
	reference: j(),
	amount: fc().finite(),
	externalId: j(),
	status: Ac([
		"UNMATCHED",
		"MATCHED",
		"POSTED",
		"IGNORED"
	]),
	ledgerIds: N(bg),
	journalEntryId: j().optional(),
	fingerprint: j().optional(),
	history: N(P({
		action: j(),
		date: j(),
		reason: j().optional()
	}))
}).strict();
o("bankStatements", {
	repository: jg,
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
	snapshot: () => ({ lines: xg }),
	restore: (e) => {
		xg = e.lines;
	},
	validate: (e) => {
		N(Mg).parse(e.lines);
	},
	publish: wg
});
//#endregion
//#region src/features/business-workspace/productRepository.ts
var Ng = P({
	id: j().min(1),
	code: Ac([
		"M2",
		"LM",
		"BOX",
		"PIECE",
		"ROLL",
		"BUCKET"
	]),
	name: j().trim().min(1),
	symbol: j().min(1),
	conversionToBase: fc().finite().positive(),
	basePrice: fc().finite().nonnegative(),
	isBaseUnit: gc(),
	active: gc()
}).strict(), Pg = P({
	id: j().min(1),
	sku: j().trim().min(1).max(80),
	name: j().trim().min(1).max(180),
	category: Ac([
		"Timber",
		"Hybrid",
		"Laminate",
		"Vinyl",
		"Carpet",
		"Accessories",
		"Other"
	]),
	brand: j().optional(),
	collection: j().optional(),
	description: j().optional(),
	status: Ac(["ACTIVE", "INACTIVE"]),
	baseUnitId: j().min(1),
	units: N(Ng).min(1),
	createdAt: j(),
	updatedAt: j(),
	revision: fc().int().nonnegative().optional(),
	itemType: Ac([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	buyEnabled: gc().optional(),
	sellEnabled: gc().optional(),
	reorderPoint: fc().finite().nonnegative().optional(),
	targetStock: fc().finite().nonnegative().optional(),
	wholePacks: gc().optional(),
	taxCode: j().min(1).optional()
}).strict(), Fg = /* @__PURE__ */ new Set(), Ig = [...il];
function Lg() {
	Ig = [...il], Fg.forEach((e) => e());
}
function Rg(e, t, n) {
	if (Array.isArray(e)) return e.some((e) => Rg(e, t, n));
	if (!e || typeof e != "object") return !1;
	let r = e;
	return r.productId === t && (!n || r.unitId === n) || Object.values(r).some((e) => Rg(e, t, n));
}
function zg(e) {
	let t = N(Pg).parse(e), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.id) || r.has(e.sku.toLowerCase())) throw Error("Duplicate product ID or SKU.");
		if (n.add(e.id), r.add(e.sku.toLowerCase()), new Set(e.units.map((e) => e.id)).size !== e.units.length || e.units.filter((e) => e.isBaseUnit).length !== 1 || !e.units.some((t) => t.id === e.baseUnitId && t.isBaseUnit && t.conversionToBase === 1)) throw Error("A product needs exactly one valid base unit.");
		if ((e.targetStock ?? 0) < (e.reorderPoint ?? 0)) throw Error("Target stock must be at least the reorder point.");
	}
	return t;
}
o("products", {
	validate: (e, t) => {
		let n = zg(e.products), r = t.workspace_tax_codes.records;
		if (n.some((e) => !r.some((t) => t.code === (e.taxCode ?? "GST")))) throw Error("Backup product tax-code reference is invalid.");
	},
	repository: {
		subscribe(e) {
			return Fg.add(e), () => {
				Fg.delete(e);
			};
		},
		getSnapshot: () => Ig,
		getAll: () => il,
		getById: (e) => il.find((t) => t.id === e),
		save(e, t) {
			let n = Pg.parse(e), r = il.find((e) => e.id === n.id);
			if (r && t !== (r.revision ?? 0)) throw Error("Product changed since it was opened. Reload before saving.");
			if (!r && t !== void 0) throw Error("Product no longer exists.");
			if (s(n.taxCode ?? "GST"), n.itemType && n.itemType !== "STOCK") throw Error("Only stocked products are supported by the current fulfilment workflow.");
			let i = te();
			if (delete i.products, r) {
				if (r.baseUnitId !== n.baseUnitId && Rg(i, n.id)) throw Error("A referenced product cannot change base unit.");
				for (let e of r.units) {
					let t = n.units.find((t) => t.id === e.id);
					if ((!t || t.conversionToBase !== e.conversionToBase || t.code !== e.code) && Rg(i, n.id, e.id)) throw Error("A referenced unit conversion cannot be changed or removed. Add a new unit instead.");
				}
			}
			let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
				...n,
				createdAt: r?.createdAt ?? a,
				updatedAt: a,
				revision: (r?.revision ?? 0) + 1
			};
			return zg([...il.filter((e) => e.id !== n.id), o]), r ? il.splice(il.indexOf(r), 1, o) : il.push(o), Zf.ensureProductPolicy(o.id, o.baseUnitId, o.itemType !== "SERVICE" && o.itemType !== "NON_STOCK"), Lg(), o;
		}
	},
	read: "inventory.read",
	commands: { save: "inventory.adjust" },
	snapshot: () => ({ products: structuredClone(il) }),
	restore: (e) => {
		let t = zg(e.products);
		il.splice(0, il.length, ...t), Ig = [...il];
	},
	publish: Lg
});
//#endregion
//#region src/features/contacts/data/mockCustomers.ts
var Bg = [
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
], Vg = "htt.mock.contacts.customers.v1";
function Hg(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var Ug = ie(Vg, Hg), Wg = Ug.status !== "invalid" && ae(Vg), Gg = /* @__PURE__ */ new Set(), Kg = Ug.status === "ok" ? Ug.data : structuredClone(Bg);
function qg() {
	Wg && g(Vg, Kg), Gg.forEach((e) => {
		e();
	});
}
function Jg(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Yg() {
	let e = Kg.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function $(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function Xg(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function Zg(e, t) {
	let n = !1;
	if (Kg = Kg.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	qg();
}
var Qg = {
	subscribe(e) {
		return Gg.add(e), () => {
			Gg.delete(e);
		};
	},
	getSnapshot() {
		return Kg;
	},
	getAll() {
		return Kg;
	},
	getById(e) {
		return Kg.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: Jg("cus"),
			code: Yg(),
			businessName: e.businessName.trim(),
			tradingName: $(e.tradingName),
			abn: Xg(e.abn),
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
		return Kg = [n, ...Kg], qg(), n;
	},
	update(e, t) {
		let n;
		if (Zg(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: $(t.tradingName),
			abn: Xg(t.abn),
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
		let n = Qg.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: Jg("loc"),
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
		return Zg(e, (e) => ({
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
		let r = Qg.getById(e);
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
		return Zg(e, (e) => ({
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
		let n = Qg.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: Jg("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: $(t.jobTitle),
			email: t.email.trim(),
			phone: $(t.phone),
			mobile: $(t.mobile),
			locationId: $(t.locationId),
			isPrimary: r
		};
		return Zg(e, (e) => ({
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
		let r = Qg.getById(e);
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
		return Zg(e, (e) => ({
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
o("customers", {
	repository: Qg,
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
	snapshot: () => ({ customers: Kg }),
	restore: (e) => {
		Kg = e.customers;
	},
	publish: () => Gg.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/workspaceRepository.ts
var $g = Oc(j(), j().max(2e4)), e_ = [
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
], t_ = () => (/* @__PURE__ */ new Date()).toISOString(), n_ = {
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
}, r_ = /* @__PURE__ */ new Set(), i_ = 0, a_ = () => {
	i_++, r_.forEach((e) => e());
}, o_ = Object.fromEntries(Object.keys(n_).map((e) => [e, []]));
for (let e of Object.keys(n_)) d[e] = [];
var s_ = () => ({
	collected: R.getAll().find((e) => e.systemRole === "GST_PAYABLE")?.id ?? "",
	paid: R.getAll().find((e) => e.systemRole === "GST_RECEIVABLE")?.id ?? ""
});
d["tax-codes"] = [{
	id: "tax-gst",
	name: "GST",
	status: "Active",
	revision: "1",
	createdAt: t_(),
	updatedAt: t_(),
	code: "GST",
	rate: "10",
	basis: "Exclusive",
	report: "GST",
	...s_()
}, {
	id: "tax-zero",
	name: "Zero rated",
	status: "Active",
	revision: "1",
	createdAt: t_(),
	updatedAt: t_(),
	code: "ZERO",
	rate: "0",
	basis: "Exclusive",
	report: "Zero rated",
	...s_()
}];
function c_(e, t) {
	if (!e?.trim()) throw Error(`${t} is required.`);
}
function l_(e, t) {
	if (!e?.trim() || !Number.isFinite(Number(e)) || Number(e) < 0) throw Error(`${t} must be a non-negative number.`);
}
function u_(e, t) {
	let n = R.getAll().find((t) => t.id === e);
	if (!n?.active || t && n.type !== t) throw Error("Select an active account of the correct type.");
	return n;
}
function d_(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && (/* @__PURE__ */ new Date(e + "T00:00:00Z")).toISOString().slice(0, 10) === e;
}
function f_(e, t, n, r = !0) {
	let i = n_[e];
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
	c_(t.name, "Name");
	for (let e of i.required) c_(t[e], e);
	if (![
		"Active",
		"Inactive",
		"Open",
		"In progress",
		"Completed"
	].includes(t.status ?? "Active")) throw Error("Invalid business status.");
	if (e === "tax-codes") {
		if (l_(t.rate, "Tax rate"), t.basis && !["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid entry basis.");
		if (r) {
			let e = n.find((e) => e.id === t.id), r = te(), i = d.settings?.find((e) => e.section === "business" && e.status === "Active")?.gstCode ?? "GST";
			if (t.status === "Inactive" && t.code === i) throw Error("The default tax code must remain active. Change the business default first.");
			if (e && e.code !== t.code && (e.code === i || r.products.products.some((t) => (t.taxCode ?? "GST") === e.code) || (d["bank-rules"] ?? []).some((t) => t.taxCode === e.code))) throw Error("A referenced tax code cannot be renamed. Create a new code and update future-use references.");
		}
		if (Number(t.rate) > 100) throw Error("Tax rate cannot exceed 100%.");
		if (r) {
			let e = u_(t.collected, "LIABILITY"), n = u_(t.paid, "ASSET"), r = (te().bankAccounts?.bankAccounts ?? []).map((e) => e.glAccountId);
			if (e.systemRole && e.systemRole !== "GST_PAYABLE" || n.systemRole && n.systemRole !== "GST_RECEIVABLE" || r.includes(n.id)) throw Error("Tax mappings cannot use AR/AP, inventory, GRNI or bank control accounts.");
		}
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Tax code must be unique.");
		if (!/^[A-Z0-9_-]{1,24}$/.test(t.code)) throw Error("Use uppercase letters/numbers for a tax code.");
	}
	if (e === "linked-accounts" && r) {
		let e = R.requireBySystemRole(t.role), n = t.status === "Inactive" ? R.getAll().find((e) => e.systemRole === t.role)?.id : t.accountId, r = te().journals?.journalEntries ?? [];
		if (n !== e.id && r.some((t) => t.lines.some((t) => t.accountId === e.id || t.accountId === n))) throw Error("A used posting account cannot be remapped without a ledger migration.");
	}
	if (e === "linked-accounts") {
		if (!e_.includes(t.role)) throw Error("Unknown account role.");
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
		if (r && u_(t.accountId, e), n.some((e) => e.id !== t.id && e.role === t.role)) throw Error("A linked account role may only have one mapping.");
	}
	if (e === "promotions") {
		let e = al(t.productId);
		if (r && (!e || !ol(e.id, t.unitId))) throw Error("Product/unit not found.");
		if (l_(t.price, "Price"), !Number.isInteger(Number(t.priority))) throw Error("Priority must be an integer.");
		if (![
			"Customer price first",
			"Promotion first",
			"Lowest eligible price"
		].includes(t.policy)) throw Error("Invalid price conflict policy.");
		if (!/([+-]\d\d:\d\d|Z)$/.test(t.starts) || !Number.isFinite(Date.parse(t.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(t.ends) || !Number.isFinite(Date.parse(t.ends)) || Date.parse(t.ends) <= Date.parse(t.starts)) throw Error("Promotion requires explicit time offsets and an end after start.");
	}
	if (r && t.customerId && !Qg.getById(t.customerId)) throw Error("Customer was not found.");
	if (e === "jobs") {
		if (l_(t.budget, "Revenue budget"), l_(t.costBudget, "Cost budget"), !d_(t.starts) || !d_(t.ends) || t.ends < t.starts) throw Error("Invalid project dates.");
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Job code must be unique.");
	}
	if (e === "tasks" && (!d_(t.due) || ![
		"Low",
		"Normal",
		"High"
	].includes(t.priority))) throw Error("Invalid due date or priority.");
	if (e === "bank-rules") {
		if (r && u_(t.accountId), ![
			"Description",
			"Payee",
			"Reference"
		].includes(t.field) || ![
			"Contains",
			"Equals",
			"Starts with"
		].includes(t.operator)) throw Error("Invalid bank condition.");
		if (r && !d["tax-codes"].some((e) => e.status === "Active" && e.code === t.taxCode)) throw Error("Active tax code not found.");
	}
	if (e === "report-packs" && (!d_(t.periodStart) || !d_(t.periodEnd) || t.periodEnd < t.periodStart)) throw Error("Invalid report period.");
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
			]) c_(t[e], e);
			if (t.status !== "Active") throw Error("Business settings must remain active.");
			if (!["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid price basis.");
			if (!/^\d+$/.test(t.terms) || Number(t.terms) > 365) throw Error("Payment terms must be 0–365 days.");
			if (!/^\d{2}-\d{2}$/.test(t.yearEnd) || !d_("2001-" + t.yearEnd)) throw Error("Year end must be MM-DD.");
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
				if (!d["tax-codes"].some((e) => e.code === t.gstCode && e.status === "Active")) throw Error("Default tax code must be active.");
				let e = te().journals.journalEntries, r = n.find((e) => e.id === t.id), i = te().bankAccounts.bankAccounts, a = r?.currency ?? i[0]?.currency ?? "AUD";
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
function p_(e, t, n) {
	o_[e].push({
		id: crypto.randomUUID(),
		name: n,
		status: "Active",
		revision: "1",
		createdAt: t_(),
		updatedAt: t_(),
		recordId: t.id,
		actorId: kh.current()?.userId ?? "local-test",
		after: JSON.stringify(t)
	});
}
Object.fromEntries(Object.keys(n_).map((e) => {
	let t = {
		getAll: () => d[e],
		getById: (t) => d[e].find((e) => e.id === t),
		save(t, n) {
			let r = $g.parse(t), i = d[e].find((e) => e.id === r.id);
			if (i && i.revision !== n) throw Error("Record changed. Reload before saving.");
			if (!i && n !== void 0) throw Error("Record no longer exists.");
			let a = t_(), o = {
				...r,
				id: i?.id ?? crypto.randomUUID(),
				name: r.name.trim(),
				status: r.status ?? "Active",
				revision: String(Number(i?.revision ?? "0") + 1),
				createdAt: i?.createdAt ?? a,
				updatedAt: a
			};
			return e === "tasks" && o.status === "Completed" && (o.completedAt = i?.completedAt ?? a, o.completedBy = i?.completedBy ?? kh.current()?.userId ?? "local-test"), f_(e, o, d[e]), d[e] = [...d[e].filter((e) => e.id !== o.id), o], p_(e, o, i ? "Updated" : "Created"), a_(), o;
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
			p_(e, {
				...i,
				note: r.trim()
			}, "Note added"), a_();
		}
	};
	return o("workspace_" + e.replaceAll("-", "_"), {
		validate: (t, n) => {
			m_(e, t), h_(e, t, n);
		},
		repository: t,
		read: n_[e].read,
		commands: {
			save: n_[e].write,
			setStatus: n_[e].write,
			addNote: e === "tasks" ? "sales.write" : null
		},
		snapshot: () => ({
			records: d[e],
			history: o_[e]
		}),
		restore: (t) => {
			m_(e, t), d[e] = t.records, o_[e] = t.history;
		},
		publish: a_
	}), [e, t];
}));
function m_(e, t) {
	let n = P({
		records: N($g),
		history: N($g)
	}).strict().parse(t), r = /* @__PURE__ */ new Set();
	for (let t of n.records) {
		if (!t.id || r.has(t.id) || !/^\d+$/.test(t.revision)) throw Error("Invalid workspace record identity.");
		r.add(t.id), f_(e, t, n.records, !1);
	}
	return n;
}
function h_(e, t, n) {
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
//#region src/lib/persistence/financialConsistencyAudit.ts
function g_(e) {
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
var __ = /* @__PURE__ */ new Set(), v_ = F.read().transactions, y_ = F.read().transfers;
F.onRollback(() => {
	let e = F.read();
	v_ = e.transactions, y_ = e.transfers;
});
function b_() {
	__.forEach((e) => F.notify(e));
}
function x_(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function S_(e) {
	return e?.trim() || void 0;
}
function C_(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function w_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function T_(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function E_(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var D_ = {
	subscribe(e) {
		return __.add(e), () => {
			__.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return v_;
	},
	getTransfersSnapshot() {
		return y_;
	},
	getTransactions() {
		return v_;
	},
	getTransfers() {
		return y_;
	},
	createTransaction(e, t) {
		if (C_(e.transactionDate), p(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = w_(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = x_(e.description, "Description"), i = ad.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let a = R.requireById(i.glAccountId);
		if (!a.active) throw Error("The selected bank GL account is inactive.");
		let o = R.requireById(e.offsetAccountId);
		if (!o.active) throw Error("The offset account is inactive.");
		if (!o.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (o.id === a.id) throw Error("Bank and offset accounts must be different.");
		if (ad.getByGlAccountId(o.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let s = T_("banktxn"), c = E_("BTXN", e.transactionDate, v_.length + 1), l = t?.trim();
		if (t !== void 0 && !l) throw Error("Operation ID cannot be empty");
		if (l) {
			let t = y.begin(l, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = v_.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			l && y.bindResult(l, s);
			let t = z.post({
				journalDate: e.transactionDate,
				description: r,
				reference: S_(e.reference),
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
				reference: S_(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [u, ...v_];
			if (F.update("transactions", d), v_ = d, b_(), l) {
				let e = z.getBySource("BANK_TRANSACTION", s);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Bank GL posting could not be verified uniquely.");
			}
			return u;
		} catch (e) {
			if (l) try {
				y.flagForReview(l, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	},
	createTransfer(e, t) {
		C_(e.transferDate), p(e.transferDate, "Transfer date");
		let n = w_(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = x_(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = ad.requireById(e.fromBankAccountId), a = ad.requireById(e.toBankAccountId);
		if (!i.active || !a.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== a.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < a.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let o = R.requireById(i.glAccountId), s = R.requireById(a.glAccountId);
		if (!o.active || !s.active) throw Error("Both bank GL accounts must be active.");
		if (o.id === s.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let c = T_("banktrf"), l = E_("BTRF", e.transferDate, y_.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = y.begin(u, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = y_.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			u && y.bindResult(u, c);
			let t = z.post({
				journalDate: e.transferDate,
				description: r,
				reference: S_(e.reference),
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
				reference: S_(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [d, ...y_];
			if (F.update("transfers", f), y_ = f, b_(), u) {
				let e = z.getBySource("BANK_TRANSFER", c);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Transfer GL posting could not be verified uniquely.");
			}
			return d;
		} catch (e) {
			if (u) try {
				y.flagForReview(u, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	}
}, O_ = D_.createTransaction;
D_.createTransaction = function(e, t) {
	S();
	let n;
	try {
		return n = F.transaction(() => O_.call(D_, e, t)), t && y.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = y.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				y.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
};
var k_ = D_.createTransfer;
D_.createTransfer = function(e, t) {
	S();
	let n;
	try {
		return n = F.transaction(() => k_.call(D_, e, t)), t && y.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = y.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				y.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
}, o("bankTransactions", {
	repository: D_,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: v_,
		bankTransfers: y_
	}),
	restore: (e) => {
		v_ = e.bankTransactions, y_ = e.bankTransfers;
	},
	publish: () => __.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function A_() {
	return g_({
		transactions: D_.getTransactions(),
		transfers: D_.getTransfers(),
		payments: dd.getAll(),
		journals: z.getAll(),
		invoices: jd.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: B.getAll(),
		supplierBills: Rp.getAll(),
		supplierPayments: Kh.getAll(),
		supplierCredits: J.getAll()
	});
}
//#endregion
//#region electron/security/periodCloseChecks.ts
function j_(e) {
	let t = te(), n = [], r = (e, t) => n.push({
		code: e,
		message: t
	});
	e.endDate >= u((/* @__PURE__ */ new Date()).toISOString()) && r("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of y.getUnresolved()) r("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of t.purchaseOperations) e.status !== "POSTED" && r("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of A_()) r(e.code, `${e.entityId}: ${e.message}`);
	let i = {
		accounts: t.accounts.accounts,
		journalEntries: t.journals.journalEntries,
		asOfDate: e.endDate
	}, a = [
		["AR", () => ih({
			...i,
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
		["AP", () => bh({
			...i,
			suppliers: t.suppliers.suppliers,
			bills: t.supplierBills.supplierBills,
			payments: t.supplierPayments.supplierPayments,
			credits: t.supplierCredits.supplierCredits,
			creditAllocations: t.supplierCredits.allocations
		})],
		["INVENTORY", () => Dh({
			...i,
			costMovements: t.costMovements.movements
		})]
	];
	for (let [t, n] of a) try {
		let i = n();
		(!i.reconciled || !Number.isFinite(i.difference)) && r(`${t}_DIFFERENCE`, `${t} to GL difference at ${e.endDate}: ${i.difference}.`);
	} catch (e) {
		r(`${t}_CHECK_FAILED`, e instanceof Error ? e.message : String(e));
	}
	for (let n of t.bankAccounts.bankAccounts) (t.journals.journalEntries.some((t) => t.journalDate <= e.endDate && t.lines.some((e) => e.accountId === n.glAccountId)) || n.openingBalance !== 0 && n.openingBalanceDate <= e.endDate) && !t.bankReconciliations.reconciliations.some((t) => t.bankAccountId === n.id && t.statementDate >= e.endDate && t.status === "COMPLETED" && t.difference === 0) && r("BANK_NOT_RECONCILED", `Reconcile ${n.name ?? n.id} through ${e.endDate}.`);
	let o = t.journals.journalEntries.filter((t) => t.journalDate >= e.startDate && t.journalDate <= e.endDate), s = (e) => Math.round((e + 2 ** -52) * 100) / 100, c = s(o.reduce((e, t) => e + t.totalDebit, 0)), l = s(o.reduce((e, t) => e + t.totalCredit, 0));
	return (!Number.isFinite(c) || !Number.isFinite(l) || c !== l) && r("TRIAL_BALANCE", "Period journal debits and credits do not balance."), {
		blockers: n,
		journalCount: o.length,
		debit: c,
		credit: l
	};
}
//#endregion
//#region src/features/accounting/data/inventoryAccountingPostingService.ts
function M_(e) {
	return R.requireBySystemRole(e).id;
}
function N_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function P_(e) {
	return z.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function F_(e) {
	let t = Kf.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var I_ = {
	postSalesFulfilment(e) {
		let t = P_(e.id);
		if (t) return t;
		let n = N_(F_(e).reduce((e, t) => {
			if (t.valueChange > 0) throw Error(`Sales fulfilment cost movement ${t.costMovementNumber} has an invalid positive inventory value change.`);
			return e - t.valueChange;
		}, 0));
		if (!Number.isFinite(n) || n < 0) throw Error("Sales fulfilment COGS amount is invalid.");
		if (n !== 0) return z.post({
			journalDate: e.fulfilmentDate,
			description: `COGS for sales fulfilment ${e.fulfilmentNumber}`,
			reference: e.fulfilmentNumber,
			sourceType: "SALES_FULFILMENT",
			sourceId: e.id,
			lines: [{
				accountId: M_("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: M_("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = P_(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? z.getById(r.reversalJournalEntryId) : void 0 : z.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, L_ = /* @__PURE__ */ new Set(), R_ = [], z_ = R_;
function B_() {
	z_ = R_, L_.forEach((e) => e());
}
function V_() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = R_.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function H_(e, t) {
	return W(R_.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function U_(e) {
	let t = jd.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.map((e) => H_(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.every((e, t) => n[t] >= W(e.quantity));
	jd.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function W_(e) {
	let t = Kf.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
o("fulfilments", {
	repository: {
		subscribe(e) {
			return L_.add(e), () => {
				L_.delete(e);
			};
		},
		getSnapshot() {
			return z_;
		},
		getAll() {
			return z_;
		},
		getById(e) {
			return R_.find((t) => t.id === e);
		},
		getBySalesOrder(e) {
			return R_.filter((t) => t.salesOrderId === e);
		},
		getFulfilledQuantity: H_,
		getRemainingQuantity(e, t) {
			let n = jd.getById(e);
			if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
			let r = n.lines.find((e) => e.id === t);
			if (!r) throw Error("Sales order line was not found.");
			return W(r.quantity - H_(e, t));
		},
		create(e) {
			let t = jd.getById(e.salesOrderId);
			if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
			let n = t;
			if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED") throw Error("Only a confirmed or partially fulfilled sales order can be fulfilled.");
			let r = jf.getById(e.siteId);
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
				let i = al(t.productId);
				if (!i) throw Error(`Product ${t.sku} was not found.`);
				let o = ol(t.productId, t.unitId);
				if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
				if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
				let s = W(e.fulfilledQuantity), c = H_(n.id, t.id);
				if (s > W(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
				let l = W(s * o.conversionToBase), u = dp.getBalance(r.id, t.productId);
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
				s.set(e.orderLine.productId, W(t + e.fulfilledBaseQuantity));
			}
			for (let [e, t] of s) {
				let n = dp.getBalance(r.id, e);
				if (!n || n.quantityOnHand < t) {
					let t = al(e);
					throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
				}
			}
			let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = V_(), d = o.map((e) => ({
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
				let i = al(t.productId);
				if (!i) throw Error(`Product ${t.sku} was not found.`);
				let a = If.create({
					movementType: "SALE",
					siteId: r.id,
					productId: t.productId,
					baseUnitId: i.baseUnitId,
					quantityBase: W(-t.fulfilledBaseQuantity),
					transactionUnitId: t.unitId,
					transactionUnitSymbol: t.unitSymbol,
					transactionQuantity: W(-t.fulfilledQuantity),
					conversionToBase: t.conversionToBase,
					referenceType: "SALES_FULFILMENT",
					referenceId: f.id,
					referenceNumber: f.fulfilmentNumber,
					salesOrderId: n.id,
					salesOrderNumber: n.documentNumber,
					occurredAt: e.fulfilmentDate,
					notes: `Sales fulfilment ${f.fulfilmentNumber}`
				});
				ap({
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
				}), dp.issue({
					siteId: r.id,
					productId: t.productId,
					baseUnitId: i.baseUnitId,
					quantityBase: t.fulfilledBaseQuantity
				});
			}
			return I_.postSalesFulfilment(f), R_ = [f, ...R_], B_(), U_(n.id), f;
		},
		void(e) {
			let t = R_.find((t) => t.id === e.fulfilmentId);
			if (!t) throw Error("Sales fulfilment was not found.");
			if (t.status === "VOIDED") throw Error("Sales fulfilment has already been voided.");
			if (Number.isNaN(Date.parse(e.voidDate))) throw Error("Fulfilment void date is invalid.");
			if (e.voidDate < t.fulfilmentDate) throw Error("Fulfilment void date cannot be earlier than the fulfilment date.");
			let n = e.reason.trim();
			if (n.length < 3) throw Error("Fulfilment void reason must contain at least 3 characters.");
			let r = jd.getById(t.salesOrderId);
			if (!r || r.type !== "SALES_ORDER") throw Error("Sales order was not found.");
			if (r.status === "INVOICED") throw Error("Cannot void a sales fulfilment for an invoiced sales order.");
			if (r.status !== "CONFIRMED" && r.status !== "PARTIALLY_FULFILLED" && r.status !== "FULFILLED") throw Error(`Cannot void a sales fulfilment when the sales order status is ${r.status}.`);
			let i = W_(t), a = /* @__PURE__ */ new Set(), o = t.lines.map((e) => {
				let n = al(e.productId);
				if (!n) throw Error(`Product ${e.sku} was not found.`);
				let r = i.find((n) => !a.has(n.id) && n.siteId === t.siteId && n.productId === e.productId && Math.abs(n.quantityBase) === e.fulfilledBaseQuantity);
				if (!r) throw Error(`Unique original inventory cost issue for ${e.sku} was not found.`);
				return a.add(r.id), {
					line: e,
					product: n,
					originalIssue: r
				};
			});
			I_.reverseSalesFulfilment({
				fulfilment: t,
				reversalDate: e.voidDate,
				reason: n
			});
			for (let r of o) {
				let { line: i, product: a, originalIssue: o } = r, s = If.create({
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
				op({
					siteId: t.siteId,
					productId: i.productId,
					quantityBase: i.fulfilledBaseQuantity,
					unitCostBase: o.unitCostBase,
					inventoryValue: vf(Math.abs(o.valueChange)),
					referenceType: "SALE",
					referenceId: t.id,
					referenceNumber: t.fulfilmentNumber,
					inventoryMovementId: s.id,
					occurredAt: e.voidDate,
					notes: `Void sales fulfilment ${t.fulfilmentNumber}: ${n}`
				}), dp.receive({
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
			return R_ = R_.map((e) => e.id === s.id ? s : e), B_(), U_(t.salesOrderId), s;
		}
	},
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: R_ }),
	restore: (e) => {
		R_ = e.fulfilments, z_ = R_;
	},
	publish: () => L_.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchasePostingRecoveryAuthorization.ts
var G_ = null, K_ = {
	configureTrustedSession(e) {
		G_ = e;
	},
	clear() {
		G_ = null;
	},
	current() {
		return G_?.() ?? null;
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
}, q_ = "htt.purchasePosting.manualRecoveryAudit.v1";
function J_() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(q_) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var Y_ = J_();
function X_(e) {
	Y_.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(q_, JSON.stringify(Y_));
	} catch {}
}
o("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return Y_.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = x.get(e);
			return K_.canRecover() && t?.status === "RECOVERY_REQUIRED" && x.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = K_.requireRecoveryPermission(), n = x.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!x.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				x.recover(e), X_({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw X_({
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
	snapshot: () => Y_,
	restore: (e) => {
		Y_.splice(0, Y_.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var Z_ = !1;
function Q_() {
	if (Z_ || (Z_ = !0, F.wasRestoredOnLoad())) return;
	let e = jd.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) yd.postInvoice(t), t.status === "VOID" && yd.reverseInvoice(t);
	let t = dd.getAll();
	for (let e of t) yd.postPayment(e), e.status === "REVERSED" && yd.reversePayment(e);
	let n = B.getAll();
	for (let e of n) e.status !== "DRAFT" && (yd.postCreditNote(e), e.status === "VOID" && yd.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function $_() {
	let e = A_().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/sales/data/salesManualReviewService.ts
var ev = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function tv(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = l("business.command", {
			repository: "salesRecovery",
			method: "recordSalesManualReview",
			args: [e]
		});
		return f(t.view), t.result;
	}
	if (!e.businessRecordChecked || !e.originalGlChecked || !e.reversalGlChecked || !e.balancesChecked) throw Error("Business, original/reversal GL and balances must all be inspected.");
	let t = y.list().find((t) => t.operationId === e.operationId);
	if (!t || !ev.has(t.kind)) throw Error("Sales operation not found.");
	if (t.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return y.recordManualReview(e.operationId, e.reference, e.operator, e.summary);
}
//#endregion
//#region src/features/sales/data/salesConsistencyAudit.ts
var nv = (e) => Math.round(e * 100);
function rv(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + nv(t.amount), 0), s = a.reduce((e, t) => e + nv(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (nv(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), nv(t.amountDue) !== Math.max(0, nv(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > nv(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + nv(t.amount), 0);
		nv(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || nv(t.amountAvailable) !== 0 : nv(t.amountAvailable) !== nv(t.totals.total) - a - nv(t.amountRefunded ?? 0)) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
var iv = {
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
function av(e) {
	return rv(e).map((e) => ({
		...e,
		action: iv[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var ov = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function sv(e, t) {
	let n = av(e).map((e) => ({ ...e })), r = t.filter((e) => ov.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => ov.has(e.kind))) s.has(e.operationId) && n.push({
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
function cv() {
	let e = jd.getAll();
	return sv({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: dd.getAll(),
		creditNotes: B.getAll(),
		allocations: B.getAllAllocations(),
		journals: z.getAll()
	}, y.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
var lv = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function uv(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!lv.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = sv(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function dv() {
	let e = jd.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: dd.getAll(),
		creditNotes: B.getAll(),
		allocations: B.getAllAllocations(),
		journals: z.getAll()
	};
}
function fv(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = l("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [e]
		});
		return f(t.view), t.result;
	}
	let t = y.list(), n = uv(dv(), t, e.operationId);
	if (n.length) throw Error(`Sales recovery remains blocked: ${n.join(" ")}`);
	let r = t.find((t) => t.operationId === e.operationId);
	return {
		closed: y.closeReviewed(e.operationId, r.resultId, e.approvalReference, e.approver),
		remaining: cv()
	};
}
//#endregion
//#region electron/security/businessEngine.ts
o("salesRecovery", {
	repository: {
		recordSalesManualReview: tv,
		closeVerifiedSalesReview: fv
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
var pv = te();
function mv(e) {
	Dl(j_, () => e()?.userId ?? ""), kh.connect(e), K_.configureTrustedSession(e), Q_(), $_();
}
//#endregion
export { Ml as assertPostingPeriod, mv as initialize, pv as workspaceDefaults };
