import { $ as e, A as t, B as n, C as r, E as i, F as a, H as o, J as s, K as c, L as l, N as u, O as d, Q as f, R as p, S as m, T as h, U as g, V as _, W as v, X as ee, Y as y, Z as b, _ as x, a as te, at as ne, b as S, c as re, ct as ie, d as ae, dt as oe, et as se, f as ce, ft as le, g as C, h as ue, it as de, j as fe, l as pe, lt as me, m as w, nt as he, o as ge, ot as _e, p as ve, q as T, rt as ye, s as be, st as xe, tt as E, u as Se, ut as Ce, v as we, w as Te, x as Ee, y as De } from "./businessSnapshot-8LXFUGjz.js";
import { createHash as Oe, randomUUID as ke } from "node:crypto";
//#region \0rolldown/runtime.js
var Ae = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports);
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/iso.js
function je(e) {
	return ne(c, e);
}
var D = e({
	field: T([
		"Description",
		"Reference",
		"Payee",
		"Amount",
		"Direction",
		"Date"
	]),
	operator: T([
		"Contains",
		"Equals",
		"Starts with",
		"Ends with",
		"Not contains",
		"At least",
		"At most",
		"Between"
	]),
	value: E().trim().min(1).max(500),
	to: E().trim().max(500).optional()
}).strict().superRefine((e, t) => {
	let n = (e) => t.addIssue({
		code: "custom",
		message: e
	});
	if ([
		"Description",
		"Reference",
		"Payee"
	].includes(e.field)) [
		"Contains",
		"Equals",
		"Starts with",
		"Ends with",
		"Not contains"
	].includes(e.operator) || n("Use a text operator.");
	else if (e.field === "Direction") (e.operator !== "Equals" || !["MONEY_IN", "MONEY_OUT"].includes(e.value)) && n("Direction must equal MONEY_IN or MONEY_OUT.");
	else if (e.field === "Amount") {
		let t = Number(e.value), r = Number(e.to);
		(![
			"Equals",
			"At least",
			"At most",
			"Between"
		].includes(e.operator) || !Number.isFinite(t) || t < 0 || !Number.isSafeInteger(Math.round(t * 100)) || t !== Math.round(t * 100) / 100 || e.operator === "Between" && (!e.to || !Number.isFinite(r) || r < t || r !== Math.round(r * 100) / 100)) && n("Use nonnegative whole-cent amounts and an ordered range.");
	} else try {
		w(e.value), e.operator === "Between" && (w(e.to ?? ""), e.to < e.value && n("End date precedes start.")), [
			"Equals",
			"At least",
			"At most",
			"Between"
		].includes(e.operator) || n("Use a date comparison.");
	} catch {
		n("Use YYYY-MM-DD dates.");
	}
});
function Me(e) {
	let t = s(D).min(1).max(20).parse(e.conditions ? JSON.parse(e.conditions) : [{
		field: e.field,
		operator: e.operator,
		value: e.value
	}]);
	if (!["All conditions", "Any condition"].includes(e.match ?? "All conditions")) throw Error("Choose all or any conditions.");
	if (e.priority !== void 0 && (!/^\d+$/.test(e.priority) || Number(e.priority) > 999)) throw Error("Rule priority must be an integer from 0 to 999.");
	if (e.enabled !== void 0 && !["Yes", "No"].includes(e.enabled)) throw Error("Choose Yes or No for enabled.");
	if (e.automatic !== void 0 && !["Yes", "No"].includes(e.automatic)) throw Error("Choose Yes or No for automatic classification.");
	return t;
}
function Ne(e, t) {
	let n = Me(e);
	if (e.bankAccountId && e.bankAccountId !== "ALL" && e.bankAccountId !== t.bankAccountId) return !1;
	let r = n.map((e) => {
		if (e.field === "Payee" && !t.payee) return !1;
		let n = e.field === "Amount" ? Math.abs(t.amount) : e.field === "Date" ? t.date : e.field === "Direction" ? t.amount < 0 ? "MONEY_OUT" : "MONEY_IN" : (e.field === "Description" ? t.description : e.field === "Reference" ? t.reference : t.payee ?? "").trim().toLowerCase(), r = e.field === "Amount" ? Number(e.value) : e.field === "Date" || e.field === "Direction" ? e.value : e.value.trim().toLowerCase(), i = e.field === "Amount" ? Number(e.to) : e.to ?? "";
		switch (e.operator) {
			case "Equals": return n === r;
			case "Contains": return String(n).includes(String(r));
			case "Not contains": return !String(n).includes(String(r));
			case "Starts with": return String(n).startsWith(String(r));
			case "Ends with": return String(n).endsWith(String(r));
			case "At least": return n >= r;
			case "At most": return n <= r;
			case "Between": return n >= r && n <= i;
		}
	});
	return e.match === "Any condition" ? r.some(Boolean) : r.every(Boolean);
}
//#endregion
//#region src/features/banking/data/statementCorrectionEvidence.ts
var Pe = (e) => Math.round((e + 2 ** -52) * 100) / 100, Fe = (e) => e.lines.length >= 2 && new Set(e.lines.map((e) => e.id)).size === e.lines.length && e.totalDebit > 0 && e.totalDebit === e.totalCredit && e.lines.every((e) => Number.isFinite(e.debit) && Number.isFinite(e.credit) && e.debit >= 0 && e.credit >= 0 && Pe(e.debit) === e.debit && Pe(e.credit) === e.credit && !(e.debit && e.credit)) && Pe(e.lines.reduce((e, t) => e + t.debit, 0)) === e.totalDebit && Pe(e.lines.reduce((e, t) => e + t.credit, 0)) === e.totalCredit, Ie = (e, t = !1) => JSON.stringify(e.lines.map((e) => [
	e.accountId,
	e.description ?? null,
	t ? e.credit : e.debit,
	t ? e.debit : e.credit
]).sort((e, t) => JSON.stringify(e).localeCompare(JSON.stringify(t))));
function Le(e) {
	let t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), r = [], i = e.filter((e) => e.sourceType === "BANK_STATEMENT" && !e.reversedJournalEntryId && (e.status === "REVERSED" || e.reversalJournalEntryId || e.reversedAt)), a = (e, t, i) => {
		n.add(e.id), t.forEach((e) => n.add(e)), r.push({
			journalId: e.id,
			message: i
		});
	};
	for (let n of i) {
		let r = e.filter((e) => e.id === n.reversalJournalEntryId), i = r[0];
		if (e.filter((e) => e.id === n.id).length !== 1 || r.length !== 1 || n.status !== "REVERSED" || !n.sourceId || !/^.+:\d+$/.test(n.sourceId) || !n.reversalReason?.trim() || !Number.isFinite(Date.parse(n.reversedAt ?? "")) || n.reversedAt !== i.postedAt || i.status !== "POSTED" || i.sourceType !== "BANK_STATEMENT" || i.sourceId !== void 0 || i.reversedJournalEntryId !== n.id || e.filter((e) => e.reversalJournalEntryId === i.id).length !== 1 || i.reversalJournalEntryId || i.reversedAt || n.reference !== i.reference || e.filter((e) => e.reversedJournalEntryId === n.id).length !== 1 || !Fe(n) || !Fe(i) || n.totalDebit !== i.totalCredit || n.totalCredit !== i.totalDebit || Ie(n, !0) !== Ie(i)) {
			a(n, [...n.reversalJournalEntryId ? [n.reversalJournalEntryId] : [], ...e.filter((e) => e.reversedJournalEntryId === n.id).map((e) => e.id)], "Bank categorisation reversal has incomplete or inconsistent owner, lifecycle or amount evidence.");
			continue;
		}
		try {
			w(n.journalDate), w(i.journalDate);
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
function Re(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ze(e, t) {
	w(e, t);
}
function Be(e, t, n) {
	ze(e.openingBalanceDate, "Opening balance date"), ze(n, "As-at date");
	let r = pe(t), i = ae(t), a = Le(t), o = new Set([
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
	}), c = Re(e.openingBalance), l = 0, u = 0, d = s.map(({ entry: t, line: n }) => {
		let r = Re(n.debit), s = Re(n.credit);
		return l = Re(l + r), u = Re(u + s), c = Re(c + r - s), {
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
		openingBalance: Re(e.openingBalance),
		moneyIn: l,
		moneyOut: u,
		closingBalance: c,
		transactionCount: d.length,
		transactions: d
	};
}
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function Ve(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function He(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) if (!t.correctionOnly) {
		if (r.has(t.id)) {
			i = Ve(i + t.moneyIn), a = Ve(a + t.moneyOut);
			continue;
		}
		o = Ve(o + t.moneyIn), s = Ve(s + t.moneyOut);
	}
	let c = Ve(Ve(t) + o - s), l = Ve(e.closingBalance), u = Ve(c - l);
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
var Ue = (e) => new Set(e).size === e.length, We = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Ge(e, t, n, r) {
	return e.some((e) => e.bankAccountId === t && e.status === "COMPLETED" && e.statementDate < r && e.clearedTransactionIds.includes(n));
}
function Ke(e) {
	let { bank: t, journals: n, reconciliations: r, throughDate: i } = e, a = [];
	if (w(i, "Reconciliation proof date"), w(t.openingBalanceDate, "Bank opening date"), !Ue(r.map((e) => e.id)) || !Ue(n.map((e) => e.id)) || !Ue(n.flatMap((e) => e.lines.map((t) => e.id + ":" + t.id)))) return ["Duplicate reconciliation or ledger row identity."];
	for (let e of r.filter((e) => e.bankAccountId === t.id)) try {
		w(e.statementDate);
	} catch {
		return ["Reconciliation statement date is invalid."];
	}
	let o = ae(n);
	n.some((e) => o.has(e.id) && e.journalDate >= t.openingBalanceDate && e.journalDate <= i && e.lines.some((e) => e.accountId === t.glAccountId)) && a.push("Bank journal reversal has incomplete or inconsistent owner, lifecycle or amount evidence.");
	let s = Le(n);
	for (let e of s.issues) {
		let r = n.find((t) => t.id === e.journalId);
		r && r.journalDate >= t.openingBalanceDate && r.journalDate <= i && r.lines.some((e) => e.accountId === t.glAccountId) && a.push(e.message);
	}
	let c = r.filter((e) => e.bankAccountId === t.id && e.statementDate <= i).sort((e, t) => e.statementDate.localeCompare(t.statementDate)), l = /* @__PURE__ */ new Set(), u = new Map(n.map((e) => [e.id, e])), d = "";
	for (let e of c) {
		try {
			w(e.statementDate, "Statement date");
		} catch {
			return ["Reconciliation statement date is invalid."];
		}
		if (e.status !== "COMPLETED" || e.statementDate <= d || e.statementDate < t.openingBalanceDate || !Number.isFinite(e.statementBalance) || We(e.statementBalance) !== e.statementBalance || !Ue(e.clearedTransactionIds)) return ["Reconciliation sequence, status, balance or cleared identities are invalid."];
		let r = Be(t, n, e.statementDate), i = new Map(r.transactions.map((e) => [e.id, e])), o = /* @__PURE__ */ new Set(), c = new Set(e.clearedTransactionIds);
		for (let e of n.filter((e) => s.verifiedIds.has(e.id) && e.reversalJournalEntryId)) {
			let t = r.transactions.filter((t) => t.journalEntryId === e.id || t.journalEntryId === e.reversalJournalEntryId);
			t.length && t.every((e) => c.has(e.id)) && t.forEach((e) => o.add(e.id));
		}
		if (e.clearedTransactionIds.some((t) => {
			let r = i.get(t);
			return l.has(t) || !r || r.correctionIssue || !o.has(t) && (r.correctionOnly || !ce(u.get(r.journalEntryId), n, e.statementDate));
		})) return ["Cleared rows are missing, reversed, internal offsets or duplicated across statements."];
		e.clearedTransactionIds.forEach((e) => l.add(e));
		let f = He(r, e.statementBalance, [...l]), p = (t) => t.reconciled && [
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
		!p(f) && !p(He(m, e.statementBalance, [...l])) && a.push("Saved reconciliation totals do not match the current dated bank ledger: " + e.reconciliationNumber), d = e.statementDate;
	}
	if (!c.length) return a;
	let f = c.at(-1).statementDate, p = Be(t, n, f), m = new Map(p.transactions.map((e) => [e.id, e])), h = /* @__PURE__ */ new Set();
	for (let i of (e.statements ?? []).filter((e) => e.bankAccountId === t.id && e.date <= f)) i.status === "UNMATCHED" && a.push("Imported statement contains an unresolved line."), (i.status === "MATCHED" || i.status === "POSTED") && (i.ledgerIds.some((e) => Ge(r, t.id, e, i.date)) && a.push("Imported statement match reuses a ledger row already cleared in an earlier statement."), (!i.ledgerIds.length || !Ue(i.ledgerIds) || i.ledgerIds.some((e) => {
		let t = m.get(e);
		return !l.has(e) || !t || t.correctionOnly || t.correctionIssue || !ce(u.get(t.journalEntryId), n, i.date) || h.has(e);
	}) || We(i.ledgerIds.reduce((e, t) => e + (m.get(t)?.moneyIn ?? 0) - (m.get(t)?.moneyOut ?? 0), 0)) !== i.amount) && a.push("Imported statement match, amount or clearing is inconsistent."), i.ledgerIds.forEach((e) => h.add(e)));
	return a;
}
//#endregion
//#region src/lib/persistence/mockRepositoryStorage.ts
function qe() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function Je(e, t) {
	let n = qe();
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
function Ye(e, t) {
	let n = qe();
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
function Xe(e) {
	let t = qe();
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
var Ze = "htt:financial-operations:v1", Qe = [
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
function $e() {
	let e = Je(Ze, be);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function et(e) {
	if (!Xe(Ze) || !Ye(Ze, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var O = {
	list() {
		return $e().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !Qe.includes(t)) throw Error("Invalid operation identity.");
		let r = $e(), i = r.find((t) => t.operationId === e);
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
		return et([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = $e(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return et(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = $e(), r = n.find((t) => t.operationId === e);
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
		return et(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = $e(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return et(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = $e(), a = i.find((t) => t.operationId === e);
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
		return et(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = $e(), a = i.find((t) => t.operationId === e);
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
		return et(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	attachRepairProposal(e, t) {
		let n = $e(), r = n.find((t) => t.operationId === e);
		if (!r || r.state !== "MANUAL_REVIEW" || !re(t) || t.status !== "PROPOSED" || !r.reviewHistory?.some((e) => e.reference === t.reference && e.operator === t.reviewer)) throw Error("Repair proposal has no trusted review evidence.");
		let i = {
			...r,
			repairProposalHistory: r.repairProposal ? [...r.repairProposalHistory ?? [], r.repairProposal] : r.repairProposalHistory,
			repairProposal: structuredClone(t)
		};
		return et(n.map((t) => t.operationId === e ? i : t)), structuredClone(i);
	},
	finishRepair(e, t, n, r, i, a) {
		let o = $e(), s = o.find((t) => t.operationId === e), c = s?.repairProposal;
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
		return et(o.map((t) => t.operationId === e ? d : t)), structuredClone(d);
	},
	withdrawSourceRepair(e, t, n, r) {
		let i = $e(), a = i.find((t) => t.operationId === e);
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
		return et(i.map((t) => t.operationId === e ? s : t)), s;
	},
	adoptReviewedResult(e, t) {
		let n = $e(), r = n.find((t) => t.operationId === e);
		if (!r || r.state === "COMPLETED" || !t.trim() || r.resultId && r.resultId !== t) throw Error("Cannot replace a bound or completed result.");
		et(n.map((n) => n.operationId === e ? {
			...n,
			resultId: t
		} : n));
	},
	getUnresolved() {
		return $e().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
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
var tt = /* @__PURE__ */ new Map(), nt = "htt.purchasePosting.operations.v1";
function rt() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function it() {
	let e = rt();
	if (e) try {
		e.setItem(nt, JSON.stringify([...tt.values()]));
	} catch {}
}
function at() {
	let e = rt();
	if (e) try {
		let t = JSON.parse(e.getItem(nt) ?? "[]");
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
			tt.set(t.key, {
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
at();
var ot = /* @__PURE__ */ new Set(), st = /* @__PURE__ */ new Map(), ct = /* @__PURE__ */ new Map(), lt;
function ut() {
	it(), ot.forEach((e) => e());
}
var k = {
	injectFailureBeforeStep(e, t, n = 1) {
		ct.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		ct.clear();
	},
	registerRecovery(e, t) {
		if (!tt.has(e)) throw Error(`Unknown posting operation: ${e}`);
		st.set(e, t);
	},
	runStep(e, t, n) {
		let r = tt.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = ct.get(i) ?? 0;
		if (a > 0) throw ct.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return st.has(e);
	},
	recover(e) {
		let t = tt.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = st.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (lt === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		lt = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			lt = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = tt.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...tt.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return ot.add(e), () => {
			ot.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if (tt.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return tt.set(n, r), ut(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = tt.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		tt.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), ut();
	},
	completeStep(e, t) {
		let n = tt.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (tt.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), ut());
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
		tt.clear(), st.clear();
		for (let t of e) tt.set(t.key, t);
	},
	publish: () => ot.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var dt = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function ft(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${dt.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function A() {
	ft(O.list(), k.getAll());
}
//#endregion
//#region src/features/accounting/data/accountingPeriodRepository.ts
var pt = [], mt, ht, gt = /* @__PURE__ */ new Set();
function _t(e, t) {
	mt = e, ht = t;
}
function vt() {
	let e = ht?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function yt(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function bt(e) {
	let t = pt.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function xt() {
	gt.forEach((e) => e());
}
function St(e) {
	if (w(e, "Posting date"), !pt.length) return;
	let t = pt.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!pt.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
i("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => pt,
		subscribe(e) {
			return gt.add(e), () => {
				gt.delete(e);
			};
		},
		create(e) {
			let t = vt(), n = yt(e.reason);
			if (w(e.startDate), w(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (pt.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (pt.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
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
			return pt = [...pt, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), xt(), r;
		},
		preflight(e) {
			let t = bt(e);
			if (!mt) throw Error("Trusted close checks unavailable.");
			return mt(t);
		},
		close(e) {
			let t = vt(), n = yt(e.reason), r = bt(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (pt.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return pt = pt.map((e) => e.id === r.id ? {
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
			} : e), xt(), bt(e.id);
		},
		reopen(e) {
			let t = vt(), n = yt(e.reason), r = bt(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (pt.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return pt = pt.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), xt(), bt(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: pt }),
	restore: (e) => {
		ge(e.periods), pt = e.periods;
	},
	publish: xt
});
//#endregion
//#region node_modules/.pnpm/react@19.3.0/node_modules/react/cjs/react.production.js
var Ct = /* @__PURE__ */ Ae(((e) => {
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
	function y() {}
	y.prototype = ee.prototype;
	function b(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	var x = b.prototype = new y();
	x.constructor = b, _(x, ee.prototype), x.isPureReactComponent = !0;
	var te = Array.isArray;
	function ne() {}
	var S = {
		H: null,
		A: null,
		T: null,
		S: null
	}, re = Object.prototype.hasOwnProperty;
	function ie(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function ae(e, t) {
		return ie(e.type, t, e.props);
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
	function C(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(ne, ne) : (e.status = "pending", e.then(function(t) {
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
	function ue(e, r, i, a, o) {
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
				case d: return c = e._init, ue(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + le(e, 0) : a, te(o) ? (i = "", c != null && (i = c.replace(ce, "$&/") + "/"), ue(o, r, i, "", function(e) {
			return e;
		})) : o != null && (oe(o) && (o = ae(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(ce, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (te(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + le(a, u), c += ue(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + le(a, u++), c += ue(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return ue(C(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function de(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return ue(e, r, "", "", function(e) {
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
	function me(e) {
		var t = S.T, n = {};
		n.types = t === null ? null : t.types, S.T = n;
		try {
			var r = e(), i = S.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(ne, pe);
		} catch (e) {
			pe(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), S.T = t;
		}
	}
	function w(e) {
		var t = S.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else me(w.bind(null, e));
	}
	var he = {
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
	e.Activity = f, e.Children = he, e.Component = ee, e.Fragment = r, e.Profiler = a, e.PureComponent = b, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = S, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return S.H.useMemoCache(e);
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
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !re.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return ie(e.type, i, r);
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
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) re.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return ie(e, a, i);
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
	}, e.startTransition = me, e.unstable_useCacheRefresh = function() {
		return S.H.useCacheRefresh();
	}, e.use = function(e) {
		return S.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return S.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return S.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return S.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return S.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return S.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return S.H.useEffectEvent(e);
	}, e.useId = function() {
		return S.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return S.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return S.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return S.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return S.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return S.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return S.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return S.H.useRef(e);
	}, e.useState = function(e) {
		return S.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return S.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return S.H.useTransition();
	}, e.version = "19.3.0";
})), wt = /* @__PURE__ */ Ae(((e, t) => {
	process.env.NODE_ENV !== "production" && (function() {
		function n(e, t) {
			Object.defineProperty(a.prototype, e, { get: function() {
				console.warn("%s(...) is deprecated in plain JavaScript React classes. %s", t[0], t[1]);
			} });
		}
		function r(e) {
			return typeof e != "object" || !e ? null : (e = we && e[we] || e["@@iterator"], typeof e == "function" ? e : null);
		}
		function i(e, t) {
			e = (e = e.constructor) && (e.displayName || e.name) || "ReactClass";
			var n = e + "." + t;
			Te[n] || (console.error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", t, e), Te[n] = !0);
		}
		function a(e, t, n) {
			this.props = e, this.context = t, this.refs = Oe, this.updater = n || Ee;
		}
		function o() {}
		function s(e, t, n) {
			this.props = e, this.context = t, this.refs = Oe, this.updater = n || Ee;
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
				case w: return "Fragment";
				case ge: return "Profiler";
				case he: return "StrictMode";
				case ye: return "Suspense";
				case be: return "SuspenseList";
				case Se: return "Activity";
				case Ce: return "ViewTransition";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case me: return "Portal";
				case ve: return e.displayName || "Context";
				case _e: return (e._context.displayName || "Context") + ".Consumer";
				case T:
					var t = e.render;
					return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case xe: return t = e.displayName || null, t === null ? d(e.type) || "Memo" : t;
				case E:
					t = e._payload, e = e._init;
					try {
						return d(e(t));
					} catch {}
			}
			return null;
		}
		function f(e) {
			if (e === w) return "<>";
			if (typeof e == "object" && e && e.$$typeof === E) return "<...>";
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
		function y(e) {
			b(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === E && (e._payload.status === "fulfilled" ? b(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function b(e) {
			return typeof e == "object" && !!e && e.$$typeof === pe;
		}
		function x(e) {
			var t = {
				"=": "=0",
				":": "=2"
			};
			return "$" + e.replace(/[=:]/g, function(e) {
				return t[e];
			});
		}
		function te(e, t) {
			return typeof e == "object" && e && e.key != null ? (u(e.key), x("" + e.key)) : t.toString(36);
		}
		function ne(e) {
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
		function S(e, t, n, i, a) {
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
					case me:
						s = !0;
						break;
					case E: return s = e._init, S(s(e._payload), t, n, i, a);
				}
			}
			if (s) {
				s = e, a = a(s);
				var c = i === "" ? "." + te(s, 0) : i;
				return Ae(a) ? (n = "", c != null && (n = c.replace(Be, "$&/") + "/"), S(a, t, n, "", function(e) {
					return e;
				})) : a != null && (b(a) && (a.key != null && (s && s.key === a.key || u(a.key)), n = ee(a, n + (a.key == null || s && s.key === a.key ? "" : ("" + a.key).replace(Be, "$&/") + "/") + c), i !== "" && s != null && b(s) && s.key == null && s._store && !s._store.validated && (n._store.validated = 2), a = n), t.push(a)), 1;
			}
			if (s = 0, c = i === "" ? "." : i + ":", Ae(e)) for (var l = 0; l < e.length; l++) i = e[l], o = c + te(i, l), s += S(i, t, n, o, a);
			else if (l = r(e), typeof l == "function") for (l === e.entries && (ze || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), ze = !0), e = l.call(e), l = 0; !(i = e.next()).done;) i = i.value, o = c + te(i, l++), s += S(i, t, n, o, a);
			else if (o === "object") {
				if (typeof e.then == "function") return S(ne(e), t, n, i, a);
				throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
			}
			return s;
		}
		function re(e, t, n) {
			if (e == null) return e;
			var r = [], i = 0;
			return S(e, r, "", "", function(e) {
				return t.call(n, e, i++);
			}), r;
		}
		function ie(e) {
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
		function ae() {
			var e = D.H;
			return e === null && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."), e;
		}
		function oe() {
			D.asyncTransitions--;
		}
		function se(e) {
			var t = D.T, n = {};
			n.types = t === null ? null : t.types, n._updatedFibers = /* @__PURE__ */ new Set(), D.T = n;
			try {
				var r = e(), i = D.S;
				i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && (D.asyncTransitions++, r.then(oe, oe), r.then(c, Ve));
			} catch (e) {
				Ve(e);
			} finally {
				t === null && n._updatedFibers && (e = n._updatedFibers.size, n._updatedFibers.clear(), 10 < e && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), t !== null && n.types !== null && (t.types !== null && t.types !== n.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), t.types = n.types), D.T = t;
			}
		}
		function ce(e) {
			var t = D.T;
			if (t !== null) {
				var n = t.types;
				n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
			} else D.asyncTransitions === 0 && console.error("addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition."), se(ce.bind(null, e));
		}
		function le(e) {
			if (Ue === null) try {
				var n = ("require" + Math.random()).slice(0, 7);
				Ue = (t && t[n]).call(t, "timers").setImmediate;
			} catch {
				Ue = function(e) {
					!1 === He && (He = !0, typeof MessageChannel > "u" && console.error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
					var t = new MessageChannel();
					t.port1.onmessage = e, t.port2.postMessage(void 0);
				};
			}
			return Ue(e);
		}
		function C(e) {
			return 1 < e.length && typeof AggregateError == "function" ? AggregateError(e) : e[0];
		}
		function ue(e, t) {
			t !== We - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), We = t;
		}
		function de(e, t, n) {
			var r = D.actQueue;
			if (r !== null) {
				if (r.length !== 0) try {
					fe(r), le(function() {
						return de(e, t, n);
					});
					return;
				} catch (e) {
					D.thrownErrors.push(e);
				}
				else D.actQueue = null;
			}
			0 < D.thrownErrors.length ? (r = C(D.thrownErrors), D.thrownErrors.length = 0, n(r)) : t(e);
		}
		function fe(e) {
			if (!Ke) {
				Ke = !0;
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
					Ke = !1;
				}
			}
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var pe = Symbol.for("react.transitional.element"), me = Symbol.for("react.portal"), w = Symbol.for("react.fragment"), he = Symbol.for("react.strict_mode"), ge = Symbol.for("react.profiler"), _e = Symbol.for("react.consumer"), ve = Symbol.for("react.context"), T = Symbol.for("react.forward_ref"), ye = Symbol.for("react.suspense"), be = Symbol.for("react.suspense_list"), xe = Symbol.for("react.memo"), E = Symbol.for("react.lazy"), Se = Symbol.for("react.activity"), Ce = Symbol.for("react.view_transition"), we = Symbol.iterator, Te = {}, Ee = {
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
		}, De = Object.assign, Oe = {};
		Object.freeze(Oe), a.prototype.isReactComponent = {}, a.prototype.setState = function(e, t) {
			if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
			this.updater.enqueueSetState(this, e, t, "setState");
		}, a.prototype.forceUpdate = function(e) {
			this.updater.enqueueForceUpdate(this, e, "forceUpdate");
		};
		var ke = {
			isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
			replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
		};
		for (Je in ke) ke.hasOwnProperty(Je) && n(Je, ke[Je]);
		o.prototype = a.prototype, ke = s.prototype = new o(), ke.constructor = s, De(ke, a.prototype), ke.isPureReactComponent = !0;
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
		ke = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var Pe, Fe, Ie = {}, Le = ke.react_stack_bottom_frame.bind(ke, m)(), Re = Ne(f(m)), ze = !1, Be = /\/+/g, Ve = typeof reportError == "function" ? reportError : function(e) {
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
		}, He = !1, Ue = null, We = 0, Ge = !1, Ke = !1, qe = typeof queueMicrotask == "function" ? function(e) {
			queueMicrotask(function() {
				return queueMicrotask(e);
			});
		} : le;
		ke = Object.freeze({
			__proto__: null,
			c: function(e) {
				return ae().useMemoCache(e);
			}
		});
		var Je = {
			map: re,
			forEach: function(e, t, n) {
				re(e, function() {
					t.apply(this, arguments);
				}, n);
			},
			count: function(e) {
				var t = 0;
				return re(e, function() {
					t++;
				}), t;
			},
			toArray: function(e) {
				return re(e, function(e) {
					return e;
				}) || [];
			},
			only: function(e) {
				if (!b(e)) throw Error("React.Children.only expected to receive a single React element child.");
				return e;
			}
		};
		e.Activity = Se, e.Children = Je, e.Component = a, e.Fragment = w, e.Profiler = ge, e.PureComponent = s, e.StrictMode = he, e.Suspense = ye, e.ViewTransition = Ce, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = D, e.__COMPILER_RUNTIME = ke, e.act = function(e) {
			var t = D.actQueue, n = We;
			We++;
			var r = D.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				D.thrownErrors.push(e);
			}
			if (0 < D.thrownErrors.length) throw ue(t, n), e = C(D.thrownErrors), D.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return qe(function() {
					i || Ge || (Ge = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				}), { then: function(e, a) {
					i = !0, o.then(function(i) {
						if (ue(t, n), n === 0) {
							try {
								fe(r), le(function() {
									return de(i, e, a);
								});
							} catch (e) {
								D.thrownErrors.push(e);
							}
							if (0 < D.thrownErrors.length) {
								var o = C(D.thrownErrors);
								D.thrownErrors.length = 0, a(o);
							}
						} else e(i);
					}, function(e) {
						ue(t, n), 0 < D.thrownErrors.length ? (e = C(D.thrownErrors), D.thrownErrors.length = 0, a(e)) : a(e);
					});
				} };
			}
			var s = a;
			if (ue(t, n), n === 0 && (fe(r), r.length !== 0 && qe(function() {
				i || Ge || (Ge = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), D.actQueue = null), 0 < D.thrownErrors.length) throw e = C(D.thrownErrors), D.thrownErrors.length = 0, e;
			return { then: function(e, t) {
				i = !0, n === 0 ? (D.actQueue = r, le(function() {
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
			var e = D.getCurrentStack;
			return e === null ? null : e();
		}, e.cloneElement = function(e, t, n) {
			if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
			var r = De({}, e.props), i = e.key, a = e._owner;
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
			for (r = v(e.type, i, r, a, e._debugStack, e._debugTask), i = 2; i < arguments.length; i++) y(arguments[i]);
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
			for (var r = 2; r < arguments.length; r++) y(arguments[r]);
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
			return a && g(r, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), (i = 1e4 > D.recentlyCreatedOwnerStacks++) ? (s = Error.stackTraceLimit, Error.stackTraceLimit = 10, o = Error("react-stack-top-frame"), Error.stackTraceLimit = s) : o = Le, v(e, a, r, p(), o, i ? Ne(f(e)) : Re);
		}, e.createRef = function() {
			var e = { current: null };
			return Object.seal(e), e;
		}, e.forwardRef = function(e) {
			e != null && e.$$typeof === xe ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e == "function" ? e.length !== 0 && e.length !== 2 && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.") : console.error("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e), e != null && e.defaultProps != null && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
			var t = {
				$$typeof: T,
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
		}, e.isValidElement = b, e.lazy = function(e) {
			e = {
				_status: -1,
				_result: e
			};
			var t = {
				$$typeof: E,
				_payload: e,
				_init: ie
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
		}, e.startTransition = se, e.unstable_useCacheRefresh = function() {
			return ae().useCacheRefresh();
		}, e.use = function(e) {
			return ae().use(e);
		}, e.useActionState = function(e, t, n) {
			return ae().useActionState(e, t, n);
		}, e.useCallback = function(e, t) {
			return ae().useCallback(e, t);
		}, e.useContext = function(e) {
			var t = ae();
			return e.$$typeof === _e && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"), t.useContext(e);
		}, e.useDebugValue = function(e, t) {
			return ae().useDebugValue(e, t);
		}, e.useDeferredValue = function(e, t) {
			return ae().useDeferredValue(e, t);
		}, e.useEffect = function(e, t) {
			return e ?? console.warn("React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"), ae().useEffect(e, t);
		}, e.useEffectEvent = function(e) {
			return ae().useEffectEvent(e);
		}, e.useId = function() {
			return ae().useId();
		}, e.useImperativeHandle = function(e, t, n) {
			return ae().useImperativeHandle(e, t, n);
		}, e.useInsertionEffect = function(e, t) {
			return e ?? console.warn("React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"), ae().useInsertionEffect(e, t);
		}, e.useLayoutEffect = function(e, t) {
			return e ?? console.warn("React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"), ae().useLayoutEffect(e, t);
		}, e.useMemo = function(e, t) {
			return ae().useMemo(e, t);
		}, e.useOptimistic = function(e, t) {
			return ae().useOptimistic(e, t);
		}, e.useReducer = function(e, t, n) {
			return ae().useReducer(e, t, n);
		}, e.useRef = function(e) {
			return ae().useRef(e);
		}, e.useState = function(e) {
			return ae().useState(e);
		}, e.useSyncExternalStore = function(e, t, n) {
			return ae().useSyncExternalStore(e, t, n);
		}, e.useTransition = function() {
			return ae().useTransition();
		}, e.version = "19.3.0", typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
}));
(/* @__PURE__ */ Ae(((e, t) => {
	t.exports = process.env.NODE_ENV === "production" ? Ct() : wt();
})))();
var j = (e, t, n = "text", r, i) => ({
	key: e,
	label: t,
	type: n,
	options: r,
	value: i,
	required: !0
}), M = (e, t, n) => j(e, t, "select", n), Tt = (e, t, n = "0") => ({
	...j(e, t, "number", void 0, n),
	min: 0,
	step: "0.01"
}), Et = (e, t) => j(e, t, "date", void 0, "2026-10-16"), Dt = (e, t) => ({
	...M(e, t, [
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
}), Ot = [];
function kt(e, t, n, r, i, a, o, s, c) {
	Ot.push({
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
kt("products", "Products & services", "Inventory & pricing", "/inventory/products", "inventory.read", "Maintain purchasing, selling, stock and packaging information.", [
	j("sku", "SKU"),
	M("kind", "Product type", [
		"Stock item",
		"Service",
		"Non-stock item"
	]),
	M("unit", "Selling unit", [
		"Pack",
		"m²",
		"Bucket",
		"Each"
	]),
	Tt("price", "Standard selling price", "49.50"),
	Tt("cost", "Buying cost (sample)", "25"),
	Tt("coverage", "m² per pack", "2.2"),
	M("rounding", "Pack rounding", ["Whole packs up", "Allow fractional packs"]),
	Tt("reorder", "Reorder point", "10"),
	Tt("target", "Target stock", "50"),
	M("buy", "Available for purchasing", ["Yes", "No"]),
	M("sell", "Available for selling", ["Yes", "No"]),
	M("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	j("brand", "Brand"),
	j("category", "Category"),
	j("image", "Image URL (preview only)")
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
]), kt("promotions", "Scheduled promotions", "Inventory & pricing", "/inventory/promotions", "inventory.read", "Plan customer and product specials with explicit start and end times.", [
	j("product", "Product / SKU"),
	j("customer", "Customer scope"),
	j("starts", "Starts (local time)", "datetime-local", void 0, "2026-10-16T09:00"),
	j("ends", "Ends (local time)", "datetime-local", void 0, "2026-10-31T17:00"),
	Tt("price", "Promotional unit price", "45"),
	M("priority", "Priority when rules overlap", [
		"Customer price first",
		"Promotion first",
		"Lowest eligible price"
	]),
	j("timezone", "Time zone", "text", void 0, "Pacific/Auckland")
], {
	name: "October flooring special",
	product: "SAMPLE-OAK",
	customer: "All trade customers"
}, [
	"Overview",
	"Price comparison",
	"History"
]), kt("tax-codes", "Tax codes", "Accounting", "/accounting/tax-codes", "accounting.read", "Review GST codes, inclusive/exclusive calculation and reporting mappings.", [
	j("code", "Tax code"),
	Tt("rate", "Tax rate (%)", "15"),
	M("basis", "Entry basis", ["Exclusive", "Inclusive"]),
	Dt("collected", "GST collected account"),
	Dt("paid", "GST paid account"),
	j("report", "Return / report mapping")
], {
	name: "Standard GST",
	code: "GST15",
	report: "Output / input GST"
}, [
	"Overview",
	"Calculation preview",
	"Reporting"
]), kt("linked-accounts", "Linked accounts", "Accounting", "/accounting/linked-accounts", "accounting.read", "Preview default general ledger mappings used by each business process.", [
	M("process", "Business process", [
		"Sales",
		"Purchases",
		"Payroll"
	]),
	Dt("receivable", "Receivables / payables control"),
	Dt("income", "Income / expense account"),
	Dt("inventory", "Inventory account"),
	Dt("cogs", "Cost of goods sold"),
	Dt("gst", "GST control account"),
	Dt("payroll", "Payroll clearing account")
], {
	name: "Sales posting defaults",
	process: "Sales"
}, ["Overview", "Posting example"]), kt("jobs", "Jobs & projects", "Accounting", "/accounting/jobs", "accounting.read", "Track project budgets, allocate posted revenue and costs, and compare actual profitability.", [
	j("code", "Job code"),
	j("customer", "Customer"),
	j("owner", "Project owner"),
	Et("starts", "Start date"),
	Et("ends", "End date"),
	Tt("budget", "Revenue budget", "10000"),
	Tt("costBudget", "Cost budget", "6000")
], {
	name: "Sample showroom installation",
	code: "JOB-SAMPLE",
	customer: "Sample Flooring Ltd",
	owner: "Sample team"
}, [
	"Overview",
	"Transactions",
	"Profitability"
]), kt("bank-accounts", "Bank account setup", "Banking", "/banking/setup/accounts", "banking.read", "Preview bank account details, ledger links and feed preferences.", [
	j("number", "Account number (sample only)"),
	j("bank", "Bank name"),
	M("currency", "Currency", ["NZD", "AUD"]),
	Dt("ledger", "Linked bank GL account"),
	M("feed", "Feed provider", ["Manual import", "Provider to be configured"]),
	Et("feedStart", "Feed start date")
], {
	name: "Sample operating account",
	number: "00-0000-0000000-00",
	bank: "Sample Bank"
}, [
	"Overview",
	"Feed settings",
	"Import history"
]), kt("bank-rules", "Bank rules", "Banking", "/banking/rules", "banking.read", "Define matching conditions and resulting categorisation before testing a sample.", [
	M("match", "Match mode", ["All conditions", "Any condition"]),
	M("field", "Transaction field", [
		"Description",
		"Payee",
		"Reference"
	]),
	M("operator", "Operator", [
		"Contains",
		"Equals",
		"Starts with"
	]),
	j("value", "Match text"),
	Dt("account", "Categorise to account"),
	M("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	M("enabled", "Enabled", ["Yes", "No"])
], {
	name: "Sample office supplies",
	value: "OFFICE",
	field: "Description"
}, [
	"Overview",
	"Test rule",
	"History"
]), kt("payment-batches", "Electronic payment batches", "Banking", "/banking/payment-batches", "banking.read", "Select sample supplier or wage payments, review approval and bank export layout.", [
	M("kind", "Batch type", ["Supplier payments", "Wages"]),
	Et("payDate", "Payment date"),
	j("bank", "Paying account"),
	j("reference", "Bank reference"),
	M("format", "Export format", ["NZ bank CSV preview", "ABA layout preview"]),
	Tt("total", "Batch total", "1100")
], {
	name: "Sample supplier batch",
	bank: "Sample operating account",
	reference: "OCT-SAMPLE"
}, [
	"Overview",
	"Payments",
	"Approval & export"
]), kt("pay-items", "Pay items", "Payroll", "/payroll/pay-items", "payroll.read", "Configure sample earnings, allowances, deductions, leave, tax and employer contributions.", [
	j("code", "Pay item code"),
	M("category", "Category", [
		"Earnings",
		"Allowance",
		"Deduction",
		"Leave",
		"Tax",
		"Employer contribution"
	]),
	M("method", "Calculation method", [
		"Hourly rate",
		"Fixed amount",
		"Percentage"
	]),
	Tt("rate", "Rate / amount", "30"),
	M("taxable", "Tax treatment", [
		"Taxable",
		"Non-taxable",
		"Before tax deduction",
		"After tax deduction"
	]),
	Dt("expense", "Expense account"),
	Dt("liability", "Liability / clearing account")
], {
	name: "Ordinary hours",
	code: "ORD",
	category: "Earnings"
}, [
	"Overview",
	"Employee assignments",
	"Posting preview"
]), kt("filing", "Payroll filing", "Payroll", "/payroll/filing", "payroll.read", "Review a sample NZ Payday Filing submission and its response / correction workflow.", [
	j("payrun", "Pay run reference"),
	Et("payDate", "Pay date"),
	j("employer", "Employer IRD identifier (sample)"),
	M("type", "Submission type", ["Employment information", "Amendment"]),
	j("contact", "Payroll contact email", "email")
], {
	name: "October employment information",
	payrun: "SAMPLE-RUN-01",
	employer: "000-000-000",
	contact: "payroll@example.invalid"
}, [
	"Overview",
	"Employees & validation",
	"Submission & response"
]), kt("recurring", "Recurring transactions", "Automation & tasks", "/automation/recurring", "inventory.read", "Generate due invoice and expense drafts from saved local templates with ordered schedules and retry protection.", [
	M("kind", "Transaction type", [
		"Invoice",
		"Bill",
		"Bank transaction"
	]),
	j("contact", "Customer / supplier"),
	M("frequency", "Frequency", [
		"Weekly",
		"Fortnightly",
		"Monthly",
		"Quarterly"
	]),
	Et("next", "Next generation date"),
	Et("ends", "Schedule end date"),
	Tt("total", "Template amount", "220"),
	M("mode", "Generation mode", ["Draft for review", "Require approval"])
], {
	name: "Monthly sample maintenance",
	contact: "Sample Flooring Ltd"
}, [
	"Overview",
	"Template lines",
	"Run history"
]), kt("tasks", "Tasks & action centre", "Automation & tasks", "/tasks", "sales.read", "Maintain local tasks, owners and due dates with audited completion and reopening.", [
	j("customer", "Customer / branch"),
	j("owner", "Assigned to"),
	Et("due", "Due date"),
	M("priority", "Priority", [
		"Normal",
		"High",
		"Low"
	]),
	j("notes", "Task instructions", "textarea")
], {
	name: "Follow up showroom quote",
	customer: "Sample Flooring / North branch",
	owner: "Sample sales",
	notes: "Confirm quantities and planned installation date."
}, [
	"Overview",
	"Notes & attachments",
	"Status history"
]), kt("visits", "Sales visits & activity", "Automation & tasks", "/sales/activity", "sales.read", "Plan local sales visits, record trusted check-in/out, outcomes and linked follow-up tasks.", [
	j("salesperson", "Salesperson"),
	j("customer", "Customer / branch"),
	j("checkin", "Check-in", "datetime-local", void 0, "2026-10-16T09:00"),
	j("checkout", "Check-out", "datetime-local", void 0, "2026-10-16T09:30"),
	j("outcome", "Visit outcome", "textarea"),
	j("location", "Recorded location")
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
]), kt("draft-review", "Customer & contact review", "Automation & tasks", "/contacts/review", "sales.read", "Review local customer, branch and contact drafts, compare duplicates and approve or link real records.", [
	M("kind", "Draft type", [
		"Customer",
		"Branch",
		"Contact"
	]),
	j("company", "Customer / company"),
	j("branch", "Branch"),
	j("email", "Email", "email"),
	j("phone", "Phone"),
	M("source", "Source", [
		"Sales draft",
		"Selected phone contact",
		"Business card OCR"
	]),
	M("decision", "Review decision", [
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
]), kt("templates", "PDF & email templates", "Documents & imports", "/documents/templates", "accounting.read", "Design sample invoice, quote, PO, statement and remittance layouts and email copy.", [
	M("kind", "Document type", [
		"Invoice",
		"Quotation",
		"Purchase order",
		"Customer statement",
		"Remittance"
	]),
	j("subject", "Email subject"),
	j("body", "Email body", "textarea"),
	j("footer", "PDF footer", "textarea"),
	M("logo", "Logo position", [
		"Left",
		"Centre",
		"Right"
	]),
	M("paper", "Paper size", ["A4", "Letter"])
], {
	name: "Standard invoice template",
	subject: "Your document {{number}}",
	body: "Hello {{contact}}, please review the attached {{type}}.",
	footer: "Thank you for your business."
}, [
	"Overview",
	"PDF preview",
	"Email preview"
]), kt("custom-reports", "Saved & favourite reports", "Reports", "/reports/saved", "accounting.read", "Save explicit filters and ordered columns, run local data and export complete results.", [
	M("dataset", "Dataset", [
		"Sales",
		"Purchases",
		"Payroll",
		"Banking",
		"General ledger"
	]),
	j("columns", "Columns (comma separated)"),
	j("filter", "Filter expression (preview)"),
	M("basis", "Basis", ["Accrual", "Cash"]),
	M("favourite", "Favourite", ["Yes", "No"])
], {
	name: "Monthly sales by customer",
	columns: "Customer, Date, Net, GST, Total",
	filter: "Date: current month"
}, ["Overview", "Report preview"]), kt("report-packs", "Report packs", "Reports", "/reports/packs", "accounting.read", "Generate combined financial reports from current local books, with ordered sections and printable exports.", [
	j("company", "Company"),
	j("period", "Reporting period"),
	j("reports", "Included reports (comma separated)"),
	j("cover", "Cover heading"),
	j("introduction", "Cover note", "textarea")
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
var At = Ot;
[...new Set(Ot.map((e) => e.group))], M("gst", "GST registration", ["Registered", "Not registered"]), M("filing", "GST filing cycle", [
	"Two monthly",
	"Monthly",
	"Six monthly"
]), Tt("quoteNext", "Next quote number", "1001"), Tt("orderNext", "Next order number", "1001"), Tt("invoiceNext", "Next invoice number", "1001"), Tt("creditNext", "Next credit number", "1001"), M("terms", "Default terms", [
	"20th of following month",
	"Due on receipt",
	"30 days"
]), M("template", "Default template", ["Standard invoice", "Trade invoice"]), M("reminders", "Overdue reminders", ["Manual only", "7 and 14 days overdue"]), M("onlinePayment", "Online payment option", ["Disabled", "Configuration preview"]), Tt("next", "Next PO number", "1001"), M("terms", "Default payment terms", [
	"20th of following month",
	"30 days",
	"Due on receipt"
]), Dt("expense", "Default expense account"), M("receipt", "Bill matching", ["Require receipt match", "Allow expense bills"]), M("remittance", "Remittance preference", ["Preview before sending", "Manual"]), M("cycle", "Pay cycle", [
	"Weekly",
	"Fortnightly",
	"Monthly"
]), M("day", "Pay day", [
	"Wednesday",
	"Thursday",
	"Friday"
]), Dt("wages", "Wages expense account"), Dt("clearing", "Payroll clearing account"), M("bank", "Paying bank", ["Sample operating account"]), M("filing", "Filing region", ["New Zealand · Payday Filing", "Australia · STP preview"]), M("basis", "Default basis", ["Accrual", "Cash"]), M("currency", "Display currency", ["NZD", "AUD"]), M("precision", "Decimal places", ["2", "0"]), M("negative", "Negative number style", ["(1,234.56)", "-1,234.56"]), M("comparative", "Comparative period", [
	"Previous period",
	"Previous year",
	"None"
]);
//#endregion
//#region src/features/page-previews/previewModel.ts
function jt(e, t) {
	return Object.fromEntries(e.map((e) => [e.key, t?.[e.key] ?? e.value ?? e.options?.[0] ?? ""]));
}
Object.fromEntries(At.map((e) => [e.id, [{
	...jt(e.fields),
	...e.example,
	id: "sample-1",
	name: e.example.name,
	status: "Draft"
}]]));
function Mt(e) {
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
//#region src/features/banking/data/reconciliationLock.ts
function Nt(e, n) {
	let r = t(), i = r.journals?.journalEntries ?? [], a = r.bankReconciliations?.reconciliations ?? [], o = i.filter((t) => t.sourceType === e && t.sourceId === n).map((e) => e.id);
	if (a.some((e) => e.clearedTransactionIds.some((e) => o.some((t) => e.startsWith(t + ":"))))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Pt(e, n) {
	let r = t(), i = r.bankAccounts?.bankAccounts ?? [], a = r.bankReconciliations?.reconciliations ?? [];
	for (let t of i.filter((e) => n.includes(e.glAccountId))) {
		let n = a.filter((e) => e.bankAccountId === t.id).map((e) => e.statementDate).sort().at(-1);
		if (n && e <= n) throw Error(`Bank account is reconciled through ${n}. Use a posting date after that statement.`);
	}
}
function Ft(e) {
	if (t().bankStatements?.lines.some((t) => t.status === "MATCHED" && t.ledgerIds.some((t) => t.startsWith(e + ":")))) throw Error("Unmatch the bank statement line before reversing its ledger source.");
}
//#endregion
//#region src/features/purchases/data/mockPurchaseOrders.ts
var It = [{
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
}], Lt = [{
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
}], Rt = "htt:financial-snapshot:v1", zt = (e) => !!e && typeof e == "object" && !Array.isArray(e), Bt = (e) => new Set(e.map((e) => e.id)).size === e.length, Vt = (e) => {
	if (!zt(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => zt(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => zt(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => zt(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => zt(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
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
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => zt(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && zt(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && zt(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && zt(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && Bt(t) && Bt(n) && Bt(r) && Bt(i);
}, Ht = () => ({
	purchaseOrders: structuredClone(It),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone(Lt),
	transactions: [],
	transfers: [],
	journals: []
}), Ut, Wt = !1;
function Gt() {
	return typeof window < "u" && !!window.localStorage;
}
function Kt() {
	if (Ut) return Ut;
	if (!Gt()) return Ht();
	let e = Je(Rt, Vt);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return Wt = e.status === "ok", Ut = e.status === "ok" ? {
		...Ht(),
		...e.data
	} : Ht(), Ut;
}
var qt = /* @__PURE__ */ new Set(), Jt = 0, Yt = /* @__PURE__ */ new Set();
function Xt(e) {
	if (Gt() && !Ye(Rt, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var N = {
	wasRestoredOnLoad() {
		return Kt(), Wt;
	},
	onRollback(e) {
		qt.add(e);
	},
	notify(e) {
		Jt ? Yt.add(e) : e();
	},
	transaction(e) {
		if (Jt) return e();
		let t = structuredClone(Kt());
		Ut = structuredClone(t), Jt++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			Xt(Kt());
		} catch (e) {
			throw Ut = t, qt.forEach((e) => e()), Yt.clear(), e;
		} finally {
			Jt--;
		}
		let r = [...Yt];
		return Yt.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(Kt());
	},
	update(e, t) {
		let n = {
			...Kt(),
			[e]: structuredClone(t)
		};
		if (!Vt(n)) throw Error("Invalid financial snapshot; write blocked.");
		Jt || Xt(n), Ut = n;
	},
	resetCacheForTests() {
		Ut = void 0, Wt = !1;
	}
};
i("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => N.read(),
	restore: (e) => {
		Ut = e;
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/accountRepository.ts
var Zt = /* @__PURE__ */ new Set(), P = "2026-10-08T00:00:00.000Z", Qt = [
	{
		id: "acc_1000",
		code: "1000",
		name: "Operating Bank",
		type: "ASSET",
		systemRole: "BANK",
		active: !0,
		allowManualPosting: !0,
		createdAt: P,
		updatedAt: P
	},
	{
		id: "acc_1010",
		code: "1010",
		name: "Savings Bank",
		type: "ASSET",
		active: !0,
		allowManualPosting: !0,
		createdAt: P,
		updatedAt: P
	},
	{
		id: "acc_1100",
		code: "1100",
		name: "Accounts Receivable",
		type: "ASSET",
		systemRole: "ACCOUNTS_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: P,
		updatedAt: P
	},
	{
		id: "acc_1200",
		code: "1200",
		name: "Inventory",
		type: "ASSET",
		systemRole: "INVENTORY",
		active: !0,
		allowManualPosting: !1,
		createdAt: P,
		updatedAt: P
	},
	{
		id: "acc_1300",
		code: "1300",
		name: "GST Receivable",
		type: "ASSET",
		systemRole: "GST_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: P,
		updatedAt: P
	},
	{
		id: "acc_2000",
		code: "2000",
		name: "Accounts Payable",
		type: "LIABILITY",
		systemRole: "ACCOUNTS_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: P,
		updatedAt: P
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
		createdAt: P,
		updatedAt: P
	},
	{
		id: "acc_2100",
		code: "2100",
		name: "GST Payable",
		type: "LIABILITY",
		systemRole: "GST_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: P,
		updatedAt: P
	},
	{
		id: "acc_3000",
		code: "3000",
		name: "Owner's Equity",
		type: "EQUITY",
		systemRole: "OWNERS_EQUITY",
		active: !0,
		allowManualPosting: !0,
		createdAt: P,
		updatedAt: P
	},
	{
		id: "acc_3100",
		code: "3100",
		name: "Retained Earnings",
		type: "EQUITY",
		systemRole: "RETAINED_EARNINGS",
		active: !0,
		allowManualPosting: !1,
		createdAt: P,
		updatedAt: P
	},
	{
		id: "acc_4000",
		code: "4000",
		name: "Sales Revenue",
		type: "REVENUE",
		systemRole: "SALES_REVENUE",
		active: !0,
		allowManualPosting: !1,
		createdAt: P,
		updatedAt: P
	},
	{
		id: "acc_5000",
		code: "5000",
		name: "Cost of Goods Sold",
		type: "EXPENSE",
		systemRole: "COST_OF_GOODS_SOLD",
		active: !0,
		allowManualPosting: !1,
		createdAt: P,
		updatedAt: P
	},
	{
		id: "acc_5100",
		code: "5100",
		name: "Purchases / Materials",
		type: "EXPENSE",
		systemRole: "PURCHASES",
		active: !0,
		allowManualPosting: !0,
		createdAt: P,
		updatedAt: P
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
		createdAt: P,
		updatedAt: P
	},
	{
		id: "acc_5200",
		code: "5200",
		name: "Freight",
		type: "EXPENSE",
		systemRole: "FREIGHT",
		active: !0,
		allowManualPosting: !0,
		createdAt: P,
		updatedAt: P
	},
	{
		id: "acc_5300",
		code: "5300",
		name: "Operating Expenses",
		type: "EXPENSE",
		systemRole: "OPERATING_EXPENSE",
		active: !0,
		allowManualPosting: !0,
		createdAt: P,
		updatedAt: P
	}
];
function $t() {
	Zt.forEach((e) => e());
}
function en(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function tn(e) {
	return e?.trim() || void 0;
}
function nn(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function rn(e, t) {
	if (Qt.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function an(e, t) {
	if (!e) return;
	let n = Qt.find((n) => n.id !== t && (Ee(e) ? n.id === Ee(e) : n.systemRole === e));
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function on() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var F = {
	subscribe(e) {
		return Zt.add(e), () => {
			Zt.delete(e);
		};
	},
	getSnapshot() {
		return Qt;
	},
	getAll() {
		return Qt;
	},
	getById(e) {
		return Qt.find((t) => t.id === e);
	},
	getByCode(e) {
		return Qt.find((t) => t.code.toLowerCase() === e.trim().toLowerCase());
	},
	getBySystemRole(e) {
		return Qt.find((t) => Ee(e) ? t.id === Ee(e) : t.systemRole === e);
	},
	requireById(e) {
		let t = Qt.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = Qt.find((t) => Ee(e) ? t.id === Ee(e) : t.systemRole === e);
		if (!t) throw Error(`Accounting account for system role ${e} was not found.`);
		return t;
	},
	create(e) {
		let t = en(e.code, "Account code"), n = en(e.name, "Account name");
		nn(t), rn(t), an(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: on(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: tn(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return Qt = [...Qt, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), $t(), i;
	},
	update(e, t) {
		let n = Qt.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = en(t.code, "Account code"), i = en(t.name, "Account name");
		if (nn(r), rn(r, e), (n.systemRole || S(n.id)) && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: tn(t.description),
			active: n.systemRole || S(n.id) ? !0 : t.active,
			allowManualPosting: n.systemRole || S(n.id) ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Qt = Qt.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), $t(), a;
	},
	setActive(e, t) {
		let n = Qt.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		if ((n.systemRole || S(n.id)) && !t) throw Error("System control accounts cannot be deactivated.");
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Qt = Qt.map((t) => t.id === e ? r : t), $t(), r;
	}
};
i("accounts", {
	repository: F,
	read: "accounting.read",
	commands: {
		if: null,
		create: "accounting.post",
		update: "accounting.post",
		setActive: "accounting.post"
	},
	snapshot: () => ({ accounts: Qt }),
	restore: (e) => {
		Qt = e.accounts;
	},
	publish: () => Zt.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var sn = /* @__PURE__ */ new Set(), cn = N.read().journals;
N.onRollback(() => {
	cn = N.read().journals;
});
function ln() {
	sn.forEach((e) => N.notify(e));
}
function un(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function dn(e) {
	return e?.trim() || void 0;
}
function fn(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function pn(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = cn.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function mn(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function hn(e) {
	if (fn(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = F.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = un(r.debit), o = un(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = un(t + a), n = un(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function gn(e) {
	return e.lines.map((e, t) => {
		let n = F.requireById(e.accountId);
		return {
			id: mn(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: dn(e.description),
			debit: un(e.debit),
			credit: un(e.credit)
		};
	});
}
function _n(e, t) {
	let n = pe(cn).originals;
	return cn.find((r) => r.sourceType === e && r.sourceId === t && !r.reversedJournalEntryId && !n.has(r.id));
}
var I = {
	subscribe(e) {
		return sn.add(e), () => {
			sn.delete(e);
		};
	},
	getSnapshot() {
		return cn;
	},
	getAll() {
		return cn;
	},
	getById(e) {
		return cn.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return cn.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: _n,
	post(e) {
		St(e.journalDate), Pt(e.journalDate, e.lines.map((e) => e.accountId));
		let t = hn(e), n = dn(e.sourceId);
		if (n) {
			let t = _n(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: mn("je"),
			journalNumber: pn(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: dn(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: gn(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...cn];
		return N.update("journals", a), cn = a, ln(), i;
	},
	reverse(e) {
		St(e.reversalDate);
		let t = cn.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (Ft(t.id), t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (fn(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Reversal reason must contain at least 3 characters.");
		Pt(e.reversalDate, t.lines.map((e) => e.accountId));
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
		}, i = hn(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: mn("je"),
			journalNumber: pn(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: gn(r),
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
		}, c = [o, ...cn.map((e) => e.id === t.id ? s : e)];
		return N.update("journals", c), cn = c, ln(), o;
	}
};
function vn(e, t, n, r) {
	let i = cn.find((t) => t.id === e);
	if (!i) throw Error("Duplicate journal no longer exists.");
	let a = I.reverse({
		journalEntryId: e,
		reversalDate: i.journalDate,
		reason: r
	}), o = cn.map((r) => r.id === e ? {
		...r,
		bankDuplicateCorrection: {
			canonicalJournalId: t,
			operationId: n
		}
	} : r), s = pe(o);
	if (s.invalid.length || !s.originals.has(e)) throw Error("Duplicate correction failed exact-pair verification.");
	return N.update("journals", o), cn = o, ln(), a;
}
i("journals", {
	repository: I,
	read: "accounting.read",
	commands: {
		if: null,
		validateDate: null,
		for: null,
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ journalEntries: cn }),
	restore: (e) => {
		cn = e.journalEntries;
	},
	publish: () => sn.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var yn = "htt.mock.banking.accounts.v1";
function bn(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var xn = /* @__PURE__ */ new Set(), Sn = "2026-10-08T00:00:00.000Z", Cn = [{
	id: "bank_001",
	name: "Operating Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1000",
	accountType: "TRANSACTION",
	currency: C().currency,
	glAccountId: "acc_1000",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: Sn,
	updatedAt: Sn
}, {
	id: "bank_002",
	name: "Savings Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1010",
	accountType: "SAVINGS",
	currency: C().currency,
	glAccountId: "acc_1010",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: Sn,
	updatedAt: Sn
}], wn = Je(yn, bn);
wn.status === "ok" && wn.data.every((e) => {
	let t = F.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (Cn = wn.data);
function Tn() {
	xn.forEach((e) => e());
}
function En(e) {
	let t = F.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of Cn) En(e);
var L = {
	subscribe(e) {
		return xn.add(e), () => {
			xn.delete(e);
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
	getByGlAccountId(e) {
		return Cn.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = Cn.find((t) => t.id === e);
		if (!t) throw Error("Bank account was not found.");
		return t;
	},
	save(t, n) {
		let r = e({
			id: E().optional(),
			name: E().trim().min(1).max(180),
			bankName: E().trim().min(1).max(180),
			accountNumber: E().trim().min(1).max(100),
			accountType: T([
				"TRANSACTION",
				"SAVINGS",
				"CREDIT_CARD",
				"OTHER"
			]),
			currency: T(["AUD", "NZD"]),
			glAccountId: E().min(1),
			openingBalanceDate: E(),
			active: y()
		}).strict().parse(t);
		if (w(r.openingBalanceDate, "Opening date"), Cn[0] && r.currency !== Cn[0].currency) throw Error("This profile uses one base currency; foreign-currency bank accounts are not supported.");
		let i = Cn.find((e) => e.id === r.id);
		if (i && i.updatedAt !== n) throw Error("Bank account changed; reload before editing.");
		if (!i && r.id) throw Error("Bank account was not found.");
		if (Cn.some((e) => e.id !== i?.id && e.glAccountId === r.glAccountId)) throw Error("Each bank account needs its own GL account.");
		let a = F.requireById(r.glAccountId);
		if (!a.active || a.type !== "ASSET" || a.systemRole && a.systemRole !== "BANK") throw Error("Choose an active bank Asset account.");
		if (i && I.getAll().some((e) => e.lines.some((e) => e.accountId === i.glAccountId)) && (i.glAccountId !== r.glAccountId || i.openingBalanceDate !== r.openingBalanceDate || i.currency !== r.currency)) throw Error("A used bank account cannot change its ledger, currency or opening date.");
		let o = new Date(Math.max(Date.now(), i ? Date.parse(i.updatedAt) + 1 : 0)).toISOString(), s = {
			...r,
			id: i?.id ?? crypto.randomUUID(),
			openingBalance: i?.openingBalance ?? 0,
			createdAt: i?.createdAt ?? o,
			updatedAt: o
		};
		return En(s), Cn = [...Cn.filter((e) => e.id !== s.id), s], Tn(), s;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Cn = Cn.map((t) => t.id === e ? r : t), Xe(yn) && Ye(yn, Cn), Tn(), r;
	}
};
i("bankAccounts", {
	repository: L,
	read: "banking.read",
	commands: {
		if: null,
		validateBankAccount: null,
		setActive: "banking.write",
		save: "banking.write"
	},
	snapshot: () => ({ bankAccounts: Cn }),
	restore: (e) => {
		Cn = e.bankAccounts;
	},
	publish: () => xn.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/bankReconciliationRepository.ts
var Dn = /* @__PURE__ */ new Set(), On = N.read().reconciliations;
N.onRollback(() => {
	On = N.read().reconciliations;
});
function kn() {
	N.update("reconciliations", On), Dn.forEach((e) => N.notify(e));
}
function An(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function jn(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function Mn() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Nn(e) {
	return `BREC-${e.slice(0, 4)}-${String(On.length + 1).padStart(4, "0")}`;
}
function Pn(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of On) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var Fn = {
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
	getByBankAccount(e) {
		return On.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return Pn(e);
	},
	complete(e, n) {
		if (jn(e.statementDate), w(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let r = L.requireById(e.bankAccountId);
		if (!r.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < r.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let i = I.getAll(), a = new Map(i.map((e) => [e.id, e])), o = Ke({
			bank: r,
			journals: i,
			reconciliations: On,
			throughDate: e.statementDate
		});
		if (o.length) throw Error("Existing bank reconciliation evidence is invalid: " + o.join(" "));
		let s = this.getLatestByBankAccount(r.id);
		if (s && e.statementDate <= s.statementDate) throw Error(`Statement date must be after the last reconciled date ${s.statementDate}.`);
		let c = Be(r, I.getAll(), e.statementDate), l = new Set(c.transactions.filter((t) => !t.correctionOnly && !t.correctionIssue && ce(a.get(t.journalEntryId), i, e.statementDate)).map((e) => e.id)), u = Pn(r.id), d = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !u.has(e));
		for (let e of d) if (!l.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let f = /* @__PURE__ */ new Set([...u, ...d]), p = t().bankStatements?.lines.filter((t) => t.bankAccountId === r.id && t.date <= e.statementDate) ?? [];
		if (p.some((e) => e.status === "UNMATCHED")) throw Error("Process every imported statement line before completing reconciliation.");
		let m = new Map(c.transactions.map((e) => [e.id, e]));
		for (let e of p.filter((e) => e.status === "MATCHED" || e.status === "POSTED")) {
			if (e.ledgerIds.some((t) => Ge(On, r.id, t, e.date))) throw Error("Statement match reuses a ledger row already cleared in an earlier statement. Unmatch this unreconciled line and select its genuine source.");
			if (e.ledgerIds.some((t) => !m.has(t) || m.get(t)?.correctionOnly || m.get(t)?.correctionIssue || !ce(a.get(m.get(t).journalEntryId), i, e.date))) throw Error("Repair stale imported statement matches before completing reconciliation.");
			if (e.ledgerIds.some((e) => !f.has(e))) throw Error("Include every processed imported statement entry in reconciliation.");
		}
		let h = He(c, An(e.statementBalance), Array.from(f));
		if (!h.reconciled) throw Error(`Bank reconciliation is out by ${h.difference.toFixed(2)}.`);
		let g = Mn();
		if (n) {
			if (O.begin(n, "BANK_RECONCILIATION", JSON.stringify(e)).status !== "started") throw Error("Bank reconciliation requires manual review before retry.");
			O.bindResult(n, g);
		}
		let _ = {
			id: g,
			reconciliationNumber: Nn(e.statementDate),
			bankAccountId: r.id,
			statementDate: e.statementDate,
			statementBalance: An(e.statementBalance),
			bookBalance: h.bookBalance,
			outstandingDeposits: h.outstandingDeposits,
			outstandingPayments: h.outstandingPayments,
			adjustedStatementBalance: h.adjustedStatementBalance,
			difference: h.difference,
			clearedTransactionIds: d,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return On = [_, ...On], kn(), _;
	}
}, In = Fn.complete;
Fn.complete = function(e, t) {
	let n = t?.trim() ?? `bankrec-operation-${Mn()}`;
	if (t !== void 0 && !n) throw Error("Operation ID cannot be empty.");
	if (n) {
		let t = O.list().find((e) => e.operationId === n);
		if (t) {
			if (t.kind !== "BANK_RECONCILIATION" || t.fingerprint !== JSON.stringify(e)) throw Error("Operation ID reused with different business data.");
			let n = On.find((e) => e.id === t.resultId);
			if (t.state === "COMPLETED" && n && On.filter((e) => e.id === n.id).length === 1 && n.status === "COMPLETED" && n.bankAccountId === e.bankAccountId && n.statementDate === e.statementDate && n.statementBalance === An(e.statementBalance)) return n;
			throw Error("Bank reconciliation requires manual review before retry.");
		}
	}
	A();
	try {
		let t = N.transaction(() => In.call(Fn, e, n));
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
	repository: Fn,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: On }),
	restore: (e) => {
		On = e.reconciliations;
	},
	publish: () => Dn.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/pricingInstant.ts
function Ln(e, t) {
	let n = new Intl.DateTimeFormat("en-CA", {
		timeZone: t,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(new Date(e)), r = (e) => n.find((t) => t.type === e).value;
	return `${r("year")}-${r("month")}-${r("day")}`;
}
function Rn(e) {
	let t = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/.exec(e);
	if (!t || Number(t[2]) > 23 || Number(t[3]) > 59 || Number(t[4]) > 59 || !Number.isFinite(Date.parse(e))) throw Error("Pricing time must be an ISO timestamp with seconds and an explicit UTC offset.");
	if (w(t[1], "Pricing date"), t[6] !== "Z" && (Number(t[6].slice(1, 3)) > 14 || Number(t[6].slice(4)) > 59 || Number(t[6].slice(1, 3)) === 14 && Number(t[6].slice(4)) !== 0)) throw Error("Invalid pricing UTC offset.");
	return new Date(e).toISOString();
}
function zn(e, t, n = C().timezone, r = (/* @__PURE__ */ new Date()).toISOString()) {
	if (w(e, "Document date"), Ln(r, n), t === void 0) {
		if (Ln(r, n) === e) t = r;
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
	let i = Rn(t);
	if (Ln(i, n) !== e) throw Error("Pricing time must fall on the document date in the pricing timezone.");
	return {
		pricingAt: i,
		pricingTimezone: n
	};
}
function Bn(e, t) {
	if (e.pricingAt === void 0 && e.pricingTimezone === void 0) return;
	if (!e.pricingAt || !e.pricingTimezone) throw Error("Incomplete pricing time snapshot.");
	let n = Ln(Rn(e.pricingAt), e.pricingTimezone);
	if (t && n !== t) throw Error("Pricing snapshot date does not match the document.");
}
//#endregion
//#region src/features/inventory/data/itemTypes.ts
function Vn(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function Hn(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function Un(e, t) {
	if (e.itemType !== void 0 && ![
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	].includes(String(e.itemType))) throw Error("Invalid saved sales item type.");
	if (t && (e.itemType ?? "STOCK") !== (t.itemType ?? "STOCK")) throw Error("Saved sales item type does not match its referenced product.");
}
//#endregion
//#region src/features/inventory/data/mockProducts.ts
var Wn = [
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
function Gn(e) {
	return Wn.find((t) => t.id === e);
}
function Kn(e, t) {
	return Gn(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/sales/data/areaPacks.ts
function qn(e, t) {
	let n = Gn(e), r = n?.units.find((e) => e.id === t), i = n?.units.find((e) => e.id === n.baseUnitId);
	return n?.status === "ACTIVE" && n.itemType !== "SERVICE" && r?.active && i?.code === "M2" && ["BOX", "ROLL"].includes(r.code) && Number.isFinite(r.conversionToBase) && r.conversionToBase > 0 ? r.conversionToBase : void 0;
}
function Jn(e, t, n, r) {
	if (r === void 0) return { quantity: n };
	let i = qn(e, t);
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
function Yn(e) {
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
var Xn = [
	"Flooring Retailer",
	"Builder",
	"Developer",
	"Designer",
	"Architect",
	"Installer",
	"Other"
], Zn = [
	"ACTIVE",
	"ON_HOLD",
	"INACTIVE"
], Qn = E().trim().refine((e) => e === "" || E().email().safeParse(e).success, { message: "Enter a valid email address" }), $n = E().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), er = e({
	businessName: E().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: E().trim().max(120, "Trading name is too long"),
	abn: $n,
	businessType: T(Xn),
	status: T(Zn),
	email: Qn,
	phone: E().trim().max(40, "Phone number is too long"),
	website: E().trim().max(200, "Website is too long"),
	creditLimit: f({ message: "Credit limit is required" }).min(0, "Credit limit cannot be negative"),
	paymentTermsDays: f({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days")
}), tr = e({
	name: E().trim().min(1, "Location name is required").max(100, "Location name is too long"),
	addressLine1: E().trim().min(1, "Address is required").max(160, "Address is too long"),
	addressLine2: E().trim().max(160, "Address is too long"),
	suburb: E().trim().min(1, "Suburb is required").max(100, "Suburb is too long"),
	state: E().trim().min(1, "State is required").max(50, "State is too long"),
	postcode: E().trim().min(1, "Postcode is required").max(20, "Postcode is too long"),
	country: E().trim().min(1, "Country is required").max(100, "Country is too long"),
	phone: E().trim().max(40, "Phone number is too long"),
	isPrimary: y()
}), nr = e({
	isAccounting: y().optional(),
	firstName: E().trim().min(1, "First name is required").max(80, "First name is too long"),
	lastName: E().trim().min(1, "Last name is required").max(80, "Last name is too long"),
	jobTitle: E().trim().max(100, "Job title is too long"),
	email: E().trim().min(1, "Email is required").email("Enter a valid email address"),
	phone: E().trim().max(40, "Phone number is too long"),
	mobile: E().trim().max(40, "Mobile number is too long"),
	locationId: E(),
	isPrimary: y()
}), rr = [
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
], ir = "htt.mock.contacts.customers.v1";
function ar(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var or = Je(ir, ar), sr = or.status !== "invalid" && Xe(ir), cr = /* @__PURE__ */ new Set(), lr = or.status === "ok" ? or.data : structuredClone(rr);
function ur() {
	sr && Ye(ir, lr), cr.forEach((e) => {
		e();
	});
}
function dr(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function fr() {
	let e = lr.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function pr(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function mr(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function hr(e, t) {
	let n = !1;
	if (lr = lr.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	ur();
}
var R = {
	subscribe(e) {
		return cr.add(e), () => {
			cr.delete(e);
		};
	},
	getSnapshot() {
		return lr;
	},
	getAll() {
		return lr;
	},
	getById(e) {
		return lr.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: dr("cus"),
			code: fr(),
			businessName: e.businessName.trim(),
			tradingName: pr(e.tradingName),
			abn: mr(e.abn),
			businessType: e.businessType,
			status: e.status,
			email: pr(e.email),
			phone: pr(e.phone),
			website: pr(e.website),
			creditLimit: e.creditLimit,
			currentBalance: 0,
			overdueBalance: 0,
			paymentTermsDays: e.paymentTermsDays,
			locations: [],
			contacts: [],
			createdAt: t,
			updatedAt: t
		};
		return lr = [n, ...lr], ur(), n;
	},
	update(e, t) {
		let n;
		if (hr(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: pr(t.tradingName),
			abn: mr(t.abn),
			businessType: t.businessType,
			status: t.status,
			email: pr(t.email),
			phone: pr(t.phone),
			website: pr(t.website),
			creditLimit: t.creditLimit,
			paymentTermsDays: t.paymentTermsDays,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, n)), !n) throw Error(`Customer ${e} was not found`);
		return n;
	},
	addLocation(e, t) {
		let n = R.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: dr("loc"),
			name: t.name.trim(),
			addressLine1: t.addressLine1.trim(),
			addressLine2: pr(t.addressLine2),
			suburb: t.suburb.trim(),
			state: t.state.trim(),
			postcode: t.postcode.trim(),
			country: t.country.trim(),
			phone: pr(t.phone),
			isPrimary: r
		};
		return hr(e, (e) => ({
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
		let r = R.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		let i = r.locations.find((e) => e.id === t);
		if (!i) throw Error(`Location ${t} was not found`);
		let a = n.isPrimary || r.locations.length === 1, o = {
			...i,
			name: n.name.trim(),
			addressLine1: n.addressLine1.trim(),
			addressLine2: pr(n.addressLine2),
			suburb: n.suburb.trim(),
			state: n.state.trim(),
			postcode: n.postcode.trim(),
			country: n.country.trim(),
			phone: pr(n.phone),
			isPrimary: a
		};
		return hr(e, (e) => ({
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
		t = nr.parse(t);
		let n = R.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: dr("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: pr(t.jobTitle),
			email: t.email.trim(),
			phone: pr(t.phone),
			mobile: pr(t.mobile),
			locationId: pr(t.locationId),
			isPrimary: r,
			isAccounting: t.isAccounting ?? !1
		};
		return hr(e, (e) => ({
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
		n = nr.parse(n);
		let r = R.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		if (n.locationId && !r.locations.some((e) => e.id === n.locationId)) throw Error("The selected location does not belong to this customer");
		let i = r.contacts.find((e) => e.id === t);
		if (!i) throw Error(`Contact ${t} was not found`);
		let a = n.isPrimary || r.contacts.length === 1, o = {
			...i,
			firstName: n.firstName.trim(),
			lastName: n.lastName.trim(),
			jobTitle: pr(n.jobTitle),
			email: n.email.trim(),
			phone: pr(n.phone),
			mobile: pr(n.mobile),
			locationId: pr(n.locationId),
			isPrimary: a,
			isAccounting: n.isAccounting ?? !1
		};
		return hr(e, (e) => ({
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
	repository: R,
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
	snapshot: () => ({ customers: lr }),
	restore: (e) => {
		lr = e.customers;
	},
	publish: () => cr.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesRecipients.ts
function gr(e, t) {
	let n = R.getById(e);
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
function _r(e) {
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
var vr = "htt.mock.sales.quotes.v1", yr = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function br(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !yr.has(String(t.status)) || ![
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
function xr() {
	return Je(vr, br);
}
function Sr(e) {
	if (xr().status === "invalid" || !Xe("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!Ye("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var Cr = "htt.mock.sales.quote-orders.v1";
function wr(e) {
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
function Tr(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!br(t.quotes) || !wr(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function Er() {
	return Je(Cr, Tr);
}
function Dr(e) {
	if (!Tr(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = Er(), n = xr();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !Xe("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!Ye("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var Or = "htt.mock.sales.documents.v1";
function kr(e) {
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
function Ar(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!Tr(t) || !kr(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function jr() {
	return Je(Or, Ar);
}
function Mr(e) {
	if (!Ar(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = jr();
	if (t.status === "invalid" || t.status === "unavailable" || !Xe("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!Ye("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var Nr = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Pr(e) {
	let t = e.filter((e) => Nr.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function Fr() {
	Pr(O.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var Ir = [{
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
}], Lr = [{
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
}], Rr = [{
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
}], zr = "htt.mock.sales.credit-notes.v1", Br = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, Vr = (e) => typeof e == "string" && e.length > 0;
function Hr(e) {
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
		].every((e) => Vr(t[e])) || ![
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
		].every((e) => Br(i[e])) || !Br(t.amountApplied) || !Br(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => Vr(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !Br(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		if (Math.abs(t - e.amountApplied) > .011) return !1;
		let n = e.refundEvents ?? [];
		if (!Array.isArray(n) || n.some((e) => !e || !Vr(e.id) || !Vr(e.date) || !Br(e.amount) || e.amount <= 0 || e.reversalDate !== void 0 && !Vr(e.reversalDate)) || new Set(n.map((e) => e.id)).size !== n.length) return !1;
		let r = n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0);
		return !Br(e.amountRefunded ?? 0) || Math.abs(r - (e.amountRefunded ?? 0)) > .011 || t + r > e.totals.total + .011 ? !1 : e.status === "VOID" ? t === 0 && r === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t - r)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function Ur() {
	return Je(zr, Hr);
}
function Wr(e) {
	if (!Hr(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = Ur();
	if (t.status === "invalid" || t.status === "unavailable" || !Xe("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!Ye("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var Gr = /* @__PURE__ */ new Set(), Kr = Ur(), qr = Kr.status === "ok" ? structuredClone(Kr.data.creditNotes) : [], Jr = Kr.status === "ok" ? structuredClone(Kr.data.allocations) : [], Yr = [...qr], Xr = [...Jr];
function Zr() {
	Yr = [...qr], Xr = [...Jr], Gr.forEach((e) => e());
}
function Qr(e, t) {
	Wr({
		creditNotes: e,
		allocations: t
	}), qr = e, Jr = t, Zr();
}
var z = {
	subscribe(e) {
		return Gr.add(e), () => {
			Gr.delete(e);
		};
	},
	getSnapshot() {
		return Yr;
	},
	getAllocationSnapshot() {
		return Xr;
	},
	getAll() {
		return Yr;
	},
	getAllAllocations() {
		return Xr;
	},
	getById(e) {
		return qr.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return qr.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return qr.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return Jr.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return Jr.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if (qr.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return Qr([e, ...qr], Jr), e;
	},
	update(e) {
		if (!qr.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return Qr(qr.map((t) => t.id === e.id ? e : t), Jr), e;
	},
	createAllocation(e) {
		if (Jr.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return Qr(qr, [e, ...Jr]), e;
	},
	updateAllocation(e) {
		if (!Jr.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return Qr(qr, Jr.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!qr.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = Jr.some((t) => t.id === e.id) ? Jr.map((t) => t.id === e.id ? e : t) : [e, ...Jr];
		Qr(qr.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return Jr.find((t) => t.id === e);
	}
};
i("customerCredits", {
	repository: z,
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
			_r(n.recipient);
			for (let e of n.lines) Yn(e), Un(e, t.products.products.find((t) => t.id === e.productId));
		}
	},
	snapshot: () => ({
		creditNotes: qr,
		allocations: Jr
	}),
	restore: (e) => {
		qr = e.creditNotes, Jr = e.allocations, Yr = [...qr], Xr = [...Jr];
	},
	publish: () => Gr.forEach((e) => e())
});
function $r(e, t) {
	Qr(qr.map((n) => n.id === e ? {
		...n,
		...t
	} : n), Jr);
}
//#endregion
//#region src/features/business-workspace/productRules.ts
function ei(e, t, n, r) {
	let i = Gn(e), a = Kn(e, t);
	if (!i || i.status !== "ACTIVE" || !a?.active) throw Error("Select an active product and unit.");
	if (r === "buy" && !Vn(i)) throw Error("Non-stock/service items use expense bills, not inventory purchase orders.");
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
var ti = "htt.mock.contacts.customerPricing.v1";
function ni(e) {
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
function ri() {
	return Je(ti, ni);
}
function ii(e) {
	if (ri().status === "invalid" || !Xe("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!Ye("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var ai = [
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
], oi = /* @__PURE__ */ new Set(), si = ri(), ci = si.status === "ok" ? si.data : structuredClone(ai);
function li() {
	oi.forEach((e) => {
		e();
	});
}
function ui(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function di(e) {
	return e.trim() || void 0;
}
function fi(e, t) {
	let n = Gn(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = n.units.find((e) => e.id === t);
	if (!r) throw Error(`Unit ${t} does not belong to product ${e}`);
	if (!r.active) throw Error("The selected product unit is inactive");
	return {
		product: n,
		unit: r
	};
}
function pi(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function mi({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = ci.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : pi(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = yi(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function hi(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function gi(e) {
	let t = Kn(e.productId, e.unitId);
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
var _i = {
	subscribe(e) {
		return oi.add(e), () => {
			oi.delete(e);
		};
	},
	getSnapshot() {
		return ci;
	},
	getAll() {
		return ci;
	},
	getById(e) {
		return ci.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return ci.filter((t) => t.customerId === e);
	},
	create(e, t) {
		fi(t.productId, t.unitId);
		let n = di(t.effectiveTo);
		t.active && mi({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = hi(t), a = {
			id: ui("cprice"),
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
		}, o = [a, ...ci];
		return ii(o), ci = o, li(), a;
	},
	update(e, t) {
		let n = _i.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		fi(t.productId, t.unitId);
		let r = di(t.effectiveTo);
		t.active && mi({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = hi(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = ci.map((t) => t.id === e ? a : t);
		return ii(o), ci = o, li(), a;
	},
	resolve(e) {
		return gi(e);
	},
	resolvePrice(e, t, n, r, i = r) {
		let a = _i.resolveBasePrice(e, t, n, r.slice(0, 10)), o = m({
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
		let { unit: i } = fi(t, n), a = ci.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && vi(r, i.effectiveFrom, i.effectiveTo));
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
		let o = gi(a);
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
function vi(e, t, n) {
	return !(e < t || n && e > n);
}
function yi(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
i("customerPrices", {
	repository: _i,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: ci }),
	restore: (e) => {
		ci = e.customerPrices;
	},
	publish: () => oi.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
function bi(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function xi({ quantity: e, standardUnitPrice: t, unitPrice: n, taxRate: r = ue(), inclusiveLineTotal: i }) {
	let a = bi(e * n), o = bi(i === void 0 ? a * r : i - a), s = bi(a + o), c = bi(t - n);
	return {
		discountAmount: c,
		discountPercent: t > 0 ? bi(c / t * 100) : 0,
		lineSubtotal: a,
		taxAmount: o,
		lineTotal: s
	};
}
function Si(e) {
	let t = bi(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = bi(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: bi(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function Ci({ customerId: e, documentDate: t, draft: n, pricingAt: i, pricingContext: a }) {
	if (n.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let o = Gn(n.productId);
	if (!o) throw Error(`Product ${n.productId} was not found`);
	if (o.status !== "ACTIVE") throw Error(`${o.name} is inactive`);
	let s = Kn(n.productId, n.unitId);
	if (!s) throw Error(`Unit ${n.unitId} was not found for ${o.name}`);
	let c = a ?? zn(t, i), l = _i.resolvePrice(e, n.productId, n.unitId, t, c.pricingAt), u = n.unitPrice !== void 0, d = u ? n.unitPrice : l.effectivePrice;
	if (!Number.isFinite(d) || d < 0) throw Error("Unit price cannot be negative");
	let f = Jn(n.productId, n.unitId, n.quantity, n.requestedArea);
	if (ei(n.productId, n.unitId, f.quantity, "sell"), o.sellEnabled === !1) throw Error("Product is not available for selling.");
	let p = o.taxCode ?? C().gstCode, m = ue(p), h = u ? De(d, m, n.priceBasis) : d, g = xi({
		taxRate: m,
		inclusiveLineTotal: u && (n.priceBasis ?? C().basis) === "Inclusive" ? Math.round(f.quantity * d * 100) / 100 : void 0,
		quantity: f.quantity,
		standardUnitPrice: l.basePrice,
		unitPrice: h
	});
	return {
		id: wi("line"),
		...c,
		itemType: o.itemType ?? "STOCK",
		...f,
		...r(p),
		priceBasis: u ? n.priceBasis ?? C().basis : "Exclusive",
		grossUnitPrice: u && (n.priceBasis ?? C().basis) === "Inclusive" ? d : void 0,
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
function wi(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var Ti = /* @__PURE__ */ new Set(), Ei = N.read().payments;
function Di() {
	Ti.forEach((e) => e());
}
function Oi() {
	return `payment_${crypto.randomUUID()}`;
}
function ki() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Ei.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var Ai = {
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
	getByCustomer(e) {
		return Ei.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Ei.filter((t) => t.invoiceId === e);
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
		if (w(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (Mi(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = O.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: Mi(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: ji(e.reference),
				notes: ji(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = Ei.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Oi(),
			paymentNumber: ki(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: Mi(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: ji(e.reference),
			notes: ji(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && O.bindResult(n, i.id);
		let a = [i, ...Ei];
		if (N.update("payments", a), Ei = a, n && !e.deferOperationCompletion) try {
			O.complete(n, i.id);
		} catch (e) {
			try {
				O.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return Di(), i;
	},
	recordDepositSettlement(e) {
		if (w(e.paymentDate), !e.depositId || !e.applicationId || !Number.isFinite(e.amount) || e.amount <= 0) throw Error("Invalid deposit application payment.");
		if (Ei.some((t) => t.id === e.id || t.depositApplicationId === e.applicationId)) throw Error("Deposit application payment already exists.");
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: e.id,
			paymentNumber: ki(),
			depositId: e.depositId,
			depositApplicationId: e.applicationId,
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			bankAccountId: e.bankAccountId,
			amount: Mi(e.amount),
			reference: e.reference,
			method: "OTHER",
			notes: "Deposit applied to invoice; no new bank receipt.",
			status: "RECEIVED",
			createdAt: t,
			updatedAt: t
		}, r = [n, ...Ei];
		return N.update("payments", r), Ei = r, Di(), n;
	},
	reverseDepositSettlement(e, t, n) {
		w(t);
		let r = Ei.find((t) => t.id === e);
		if (!r?.depositApplicationId || r.status !== "RECEIVED" || t < r.paymentDate || n.trim().length < 3) throw Error("Invalid deposit settlement reversal.");
		let i = {
			...r,
			status: "REVERSED",
			reversedAt: t,
			reversalReason: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, a = Ei.map((t) => t.id === e ? i : t);
		return N.update("payments", a), Ei = a, Di(), i;
	},
	reverse(e, t) {
		let n = Ei.find((t) => t.id === e);
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
		}, o = Ei.map((t) => t.id === e ? a : t);
		return N.update("payments", o), Ei = o, Di(), a;
	},
	getReceivedByInvoice(e) {
		return Ei.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function ji(e) {
	return e?.trim() || void 0;
}
function Mi(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
i("customerPayments", {
	repository: Ai,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null,
		recordDepositSettlement: null,
		reverseDepositSettlement: null
	},
	snapshot: () => ({ payments: Ei }),
	restore: (e) => {
		Ei = e.payments;
	},
	publish: () => Ti.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/taxPosting.ts
function Ni(e, t, n, r) {
	let i = t === "paid" ? "GST_RECEIVABLE" : "GST_PAYABLE", a = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = (t === "paid" ? n.taxPaidAccountId : n.taxCollectedAccountId) || F.requireBySystemRole(i).id;
		a.set(e, (a.get(e) ?? 0) + n.taxAmount);
	}
	return e.length || a.set(F.requireBySystemRole(i).id, r), [...a].filter(([, e]) => Math.round((e + 2 ** -52) * 100) !== 0).map(([e, t]) => {
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
function Pi(e) {
	return F.requireBySystemRole(e).id;
}
function Fi(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: C().timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function Ii(e, t) {
	return I.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Li(e, t) {
	let n = Ii(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Ri = {
	postInvoice(e) {
		return Ii("CUSTOMER_INVOICE", e.id) || I.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: Pi("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: Pi("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				...Ni(e.lines, "collected", !1, e.totals.taxAmount)
			]
		});
	},
	reverseInvoice(e) {
		let t = Li("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? I.getById(t.reversalJournalEntryId) : void 0 : I.reverse({
			journalEntryId: t.id,
			reversalDate: Fi(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = Ii("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = L.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this customer payment is inactive.");
		return I.post({
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
				accountId: Pi("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = Li("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? I.getById(t.reversalJournalEntryId) : void 0 : I.reverse({
			journalEntryId: t.id,
			reversalDate: Fi(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return Ii("CREDIT_NOTE", e.id) || I.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: Pi("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				...Ni(e.lines, "collected", !0, e.totals.taxAmount),
				{
					accountId: Pi("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = Li("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? I.getById(t.reversalJournalEntryId) : void 0 : I.reverse({
			journalEntryId: t.id,
			reversalDate: Fi(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, zi = /* @__PURE__ */ new Set(), Bi = jr(), Vi = Er(), Hi = xr(), Ui = Bi.status === "ok" ? structuredClone(Bi.data.quotes) : Vi.status === "ok" ? structuredClone(Vi.data.quotes) : Hi.status === "ok" ? structuredClone(Hi.data) : structuredClone(Ir);
function Wi(e) {
	Bi.status === "ok" || jr().status !== "empty" ? Mr({
		quotes: e,
		salesOrders: Gi,
		invoices: Ki
	}) : Vi.status === "ok" || Er().status !== "empty" ? Dr({
		quotes: e,
		salesOrders: Gi
	}) : Sr(e), Ui = e, Xi();
}
var Gi = Bi.status === "ok" ? structuredClone(Bi.data.salesOrders) : Vi.status === "ok" ? structuredClone(Vi.data.salesOrders) : structuredClone(Lr), Ki = Bi.status === "ok" ? structuredClone(Bi.data.invoices) : structuredClone(Rr);
function qi(e) {
	Mr({
		quotes: Ui,
		salesOrders: Gi,
		invoices: e
	}), Ki = e, Xi();
}
function Ji(e, t = Ui) {
	Bi.status === "ok" || jr().status !== "empty" ? Mr({
		quotes: t,
		salesOrders: e,
		invoices: Ki
	}) : Dr({
		quotes: t,
		salesOrders: e
	}), Gi = e, Ui = t, Xi();
}
var Yi = Zi();
function Xi() {
	Yi = Zi(), zi.forEach((e) => e());
}
function Zi() {
	return [
		...Ui,
		...Gi,
		...Ki
	];
}
var B = {
	createManagedOrder(e) {
		let t = Gi.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: ea("order"),
			managedDraftId: e.draftId,
			type: "SALES_ORDER",
			status: "CONFIRMED",
			documentNumber: ta("SO", Gi.map((e) => e.documentNumber)),
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
		return Ji([r, ...Gi]), r;
	},
	createManagedInvoice(e) {
		let t = Ki.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = B.createManagedOrder(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: ea("invoice"),
			managedDraftId: e.draftId,
			type: "INVOICE",
			status: "ISSUED",
			documentNumber: ta("INV", Ki.map((e) => e.documentNumber)),
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
		}, a = Gi.map((e) => e.id === n.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: r
		} : e);
		return Mr({
			quotes: Ui,
			salesOrders: a,
			invoices: [i, ...Ki]
		}), Gi = a, Ki = [i, ...Ki], Xi(), Ri.postInvoice(i), i;
	},
	cancelManagedOrder(e, t) {
		let n = Gi.find((t) => t.id === e);
		if (!n?.managedDraftId) throw Error("Managed order not found.");
		if (n.status === "CANCELLED") return n;
		if (n.invoiceIds.some((e) => Ki.some((t) => t.id === e && t.status !== "VOID"))) throw Error("Void active invoices before cancelling the order.");
		if (n.status === "PARTIALLY_FULFILLED" || n.status === "FULFILLED" || n.fulfilmentStatus === "PARTIALLY_FULFILLED" || n.fulfilmentStatus === "FULFILLED") throw Error("Reverse active fulfilments before cancelling the order.");
		if (t.trim().length < 3) throw Error("Cancellation reason is required.");
		let r = {
			...n,
			status: "CANCELLED",
			notes: (n.notes ?? "") + "\nCancelled: " + t.trim(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ji(Gi.map((t) => t.id === e ? r : t)), r;
	},
	subscribe(e) {
		return zi.add(e), () => {
			zi.delete(e);
		};
	},
	getSnapshot() {
		return le(Yi);
	},
	getAll() {
		return le(Yi);
	},
	getById(e) {
		return le(Yi).find((t) => t.id === e);
	},
	getByCustomer(e) {
		return le(Yi).filter((t) => t.customerId === e);
	},
	getQuotesByCustomer(e) {
		return le(Ui).filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return Gi.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return Ki.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (Qi(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = zn(e.documentDate, e.pricingAt), n = e.lines.map((n) => Ci({
			customerId: e.customerId,
			documentDate: e.documentDate,
			pricingContext: t,
			draft: n
		})), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: ea("quote"),
			type: "QUOTE",
			documentNumber: ta("QU", Ui.map((e) => e.documentNumber)),
			recipient: gr(e.customerId, e),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: $i(e.customerReference),
			notes: $i(e.notes),
			lines: n,
			totals: Si(n),
			createdAt: r,
			updatedAt: r
		};
		return Wi([i, ...Ui]), i;
	},
	updateDraftQuote(e, t) {
		let n = Ui.find((t) => t.id === e);
		if (!n) throw Error(`Quote ${e} was not found`);
		if (n.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let r = n.lines.find((e) => e.pricingAt), i = zn(t.documentDate, t.pricingAt ?? (t.documentDate === n.documentDate ? r?.pricingAt : void 0), t.documentDate === n.documentDate && (!t.pricingAt || t.pricingAt === r?.pricingAt) ? r?.pricingTimezone : void 0), a = t.lines.map((e) => {
			let r = Ci({
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
			recipient: t.locationId === void 0 && t.accountingContactId === void 0 ? n.recipient : gr(n.customerId, t),
			documentDate: t.documentDate,
			expiryDate: t.expiryDate,
			customerReference: $i(t.customerReference),
			notes: $i(t.notes),
			lines: a,
			totals: Si(a),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Wi(Ui.map((t) => t.id === e ? o : t)), o;
	},
	sendQuote(e) {
		let t = Ui.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return Wi(Ui.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = Ui.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return Wi(Ui.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = Ui.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return Wi(Ui.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = Ui.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: ea("order"),
			type: "SALES_ORDER",
			documentNumber: ta("SO", Gi.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: na(),
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
		return Ji([r, ...Gi], Ui.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = Gi.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED" && n.status !== "INVOICED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: n.status === "INVOICED" ? "INVOICED" : t,
			fulfilmentStatus: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ji(Gi.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = Gi.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = na(), i = {
			id: ea("invoice"),
			managedDraftId: t.managedDraftId,
			type: "INVOICE",
			documentNumber: ta("INV", Ki.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: r,
			dueDate: ra(r, Number(C().terms)),
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
		}, a = [i, ...Ki], o = Gi.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: n
		} : e);
		return Mr({
			quotes: Ui,
			salesOrders: o,
			invoices: a
		}), Ki = a, Gi = o, Xi(), Ri.postInvoice(i), i;
	},
	createCreditNoteFromInvoice(e) {
		let t = Ki.find((t) => t.id === e.invoiceId);
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
			let i = z.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id).reduce((e, t) => e + t.quantity, 0);
			if (e.quantity + i > n.quantity + 1e-8) throw Error("Credit quantity cannot exceed the original invoice quantity.");
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = z.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id), s = e.quantity + i >= n.quantity - 1e-8, c = ia(s ? n.lineSubtotal - o.reduce((e, t) => e + t.lineSubtotal, 0) : n.lineSubtotal * e.quantity / n.quantity), l = ia(s ? n.taxAmount - o.reduce((e, t) => e + t.taxAmount, 0) : n.taxAmount * e.quantity / n.quantity);
			return {
				...n,
				requestedArea: e.quantity === n.quantity ? n.requestedArea : void 0,
				coveredArea: n.areaPerPack ? Math.round(e.quantity * n.areaPerPack * 1e8) / 1e8 : void 0,
				quantity: e.quantity,
				taxRate: a,
				lineSubtotal: c,
				taxAmount: l,
				lineTotal: ia(c + l)
			};
		}), a = Si(i);
		if (a.total <= 0) throw Error("Credit note total must be greater than zero");
		if (ia(ia(z.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + a.total) > ia(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: ea("credit-note"),
			creditNoteNumber: ta("CN", z.getAll().map((e) => e.creditNoteNumber)),
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
		return z.create(s), Ri.postCreditNote(s), s;
	},
	applyCreditToInvoice(e) {
		A(), Fr();
		let t = z.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		let n = Ki.find((t) => t.id === e.invoiceId);
		if (!n) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void credit note cannot be applied");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be applied");
		if (n.status === "VOID") throw Error("Credit cannot be applied to a void invoice");
		if (n.status === "DRAFT") throw Error("Credit cannot be applied to a draft invoice");
		if (t.customerId !== n.customerId) throw Error("Credit note and invoice must belong to the same customer");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the credit note date");
		let r = ia(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = z.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: ea("credit-allocation"),
			allocationNumber: ta("CA", z.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = ia(i.amountApplied + r), c = ia(Math.max(0, i.totals.total - (i.amountRefunded ?? 0) - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
		if (O.begin(l, "SALES_CREDIT_APPLY", JSON.stringify({
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: r
		})).status !== "started") throw Error("Credit allocation was previously attempted; manual review required.");
		try {
			O.bindResult(l, o.id), z.commitAllocationAndCredit(o, {
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
		A(), Fr();
		let t = z.getAllocationById(e.allocationId);
		if (!t) throw Error(`Credit allocation ${e.allocationId} was not found`);
		if (t.status === "REVERSED") throw Error("This credit allocation has already been reversed");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A reversal reason is required");
		let r = z.getById(t.creditNoteId);
		if (!r) throw Error("Credit note was not found");
		if (r.status === "VOID") throw Error("Allocations on a void credit note cannot be reversed here");
		let i = Ki.find((e) => e.id === t.invoiceId);
		if (!i) throw Error("Allocated invoice was not found");
		if (i.status === "VOID") throw Error("Credit allocation cannot be reversed after the invoice has been voided");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			updatedAt: a
		}, s = ia(z.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = ia(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - s)), l = `sales-credit-reversal:${t.id}`;
		if (O.begin(l, "SALES_CREDIT_REVERSAL", t.id).status !== "started") throw Error("Credit allocation reversal previously attempted; manual review required.");
		try {
			O.bindResult(l, t.id), z.commitAllocationAndCredit(o, {
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
		e.voidDate && w(e.voidDate, "Credit reversal date");
		let n = z.getById(e.creditNoteId);
		if (!n) throw Error(`Credit note ${e.creditNoteId} was not found`);
		if (n.status === "VOID") throw Error("This credit note has already been voided");
		if (n.status === "DRAFT") throw Error("A draft credit note cannot be voided here");
		if (e.voidDate && ((n.refundEvents ?? []).some((t) => (t.reversalDate ?? t.date) > e.voidDate) || z.getAllocationsByCreditNote(n.id).some((t) => (t.reversedAt ? ve(t.reversedAt) : t.allocationDate) > e.voidDate))) throw Error("Credit reversal precedes later settlement activity.");
		if (e.voidDate && e.voidDate < n.creditDate) throw Error("Credit reversal date precedes credit date.");
		if ((n.amountRefunded ?? 0) > 0) throw Error("Reverse customer refunds before voiding the credit.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (z.getAllocationsByCreditNote(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this credit note");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: e.voidDate ?? i,
			voidReason: r,
			updatedAt: i
		};
		return z.update(a), Ri.reverseCreditNote(a), a;
	},
	recordInvoicePayment(e) {
		if (A(), Fr(), e.operationId) {
			let t = O.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = Ki.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = ia(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (w(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, a = Ai.create({
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
			Ri.postPayment(a);
			let e = I.getBySource("CUSTOMER_PAYMENT", a.id).filter((e) => !e.reversedJournalEntryId);
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
		A(), Fr();
		let n = Ki.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (Ai.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
		if (z.getAllocationsByInvoice(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("This invoice has applied credits. Reverse all active credit allocations before voiding the invoice.");
		if (n.managedDraftId && z.getByInvoice(n.id).some((e) => e.status !== "VOID")) throw Error("Void source credits before voiding this direct invoice.");
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
			let t = I.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (t.length !== 1 || t[0].status !== "POSTED") throw Error("Invoice original GL must be uniquely posted before voiding.");
			O.bindResult(o, e), Ri.reverseInvoice(a);
			let n = I.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			qi(Ki.map((t) => t.id === e ? a : t)), O.complete(o, e);
		} catch (e) {
			try {
				O.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		if (Nt("CUSTOMER_PAYMENT", e), A(), Fr(), Ai.getById(e)?.depositApplicationId) throw Error("Reverse this settlement through customer deposits.");
		let n = Ai.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = Ki.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (O.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			O.bindResult(i, e);
			let n = Ai.reverse(e, t);
			Ri.reversePayment(n);
			let a = I.getBySource("CUSTOMER_PAYMENT", e).filter((e) => !e.reversedJournalEntryId);
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
		let t = Ki.find((t) => t.id === e);
		if (!t) throw Error(`Invoice ${e} was not found`);
		if (t.status === "VOID") return t;
		let n = Ai.getReceivedByInvoice(e), r = z.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = ia(n.reduce((e, t) => e + t.amount, 0)), a = ia(r.reduce((e, t) => e + t.amount, 0)), o = ia(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : aa(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return qi(Ki.map((t) => t.id === e ? c : t)), c;
	}
};
function Qi(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function $i(e) {
	return e?.trim() || void 0;
}
function ea(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function ta(e, t) {
	return we(e, t, ve((/* @__PURE__ */ new Date()).toISOString()).slice(0, 4));
}
function na() {
	return ve((/* @__PURE__ */ new Date()).toISOString());
}
function ra(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function ia(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function aa(e) {
	return e < oa(/* @__PURE__ */ new Date());
}
function oa(e) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
i("sales", {
	repository: B,
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
			_r(e.recipient);
			for (let n of e.lines) Yn(n), Bn(n), Un(n, t.products.products.find((e) => e.id === n.productId));
		}
	},
	snapshot: () => ({
		quotes: Ui,
		salesOrders: Gi,
		invoices: Ki
	}),
	restore: (e) => {
		Ui = e.quotes, Gi = e.salesOrders, Ki = e.invoices, Yi = Zi();
	},
	publish: () => zi.forEach((e) => e())
});
function sa(e, t) {
	qi(Ki.map((n) => n.id === e ? {
		...n,
		...t
	} : n));
}
function ca(e) {
	if (Ui.some((t) => e.has(t.id) && t.status !== "DRAFT")) throw Error("Only draft quotes may be purged.");
	Wi(Ui.filter((t) => !e.has(t.id)));
}
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var la = [
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
		currency: C().currency,
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
		currency: C().currency,
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
		currency: C().currency,
		taxRegistered: !0,
		createdAt: "2026-03-05T01:00:00.000Z",
		updatedAt: "2026-03-05T01:00:00.000Z"
	}
], ua = "htt.mock.contacts.suppliers.v1";
function da(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var fa = Je(ua, da), pa = fa.status !== "invalid" && Xe(ua), ma = /* @__PURE__ */ new Set(), ha = fa.status === "ok" ? fa.data : structuredClone(la);
function ga() {
	pa && Ye(ua, ha), ma.forEach((e) => {
		e();
	});
}
function _a(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function va() {
	let e = ha.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function ya(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function ba(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function xa(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: ya(e.tradingName),
		abn: ba(e.abn),
		status: e.status,
		email: ya(e.email),
		phone: ya(e.phone),
		website: ya(e.website),
		contactName: ya(e.contactName),
		addressLine1: ya(e.addressLine1),
		addressLine2: ya(e.addressLine2),
		suburb: ya(e.suburb),
		state: ya(e.state),
		postcode: ya(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: ya(e.notes)
	};
}
var Sa = {
	subscribe(e) {
		return ma.add(e), () => {
			ma.delete(e);
		};
	},
	getSnapshot() {
		return ha;
	},
	getAll() {
		return ha;
	},
	getById(e) {
		return ha.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: _a("sup"),
			code: va(),
			...xa(e),
			currency: C().currency,
			createdAt: t,
			updatedAt: t
		};
		return ha = [n, ...ha], ga(), n;
	},
	update(e, t) {
		let n = Sa.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...xa(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ha = ha.map((t) => t.id === e ? r : t), ga(), r;
	}
};
i("suppliers", {
	repository: Sa,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: ha }),
	restore: (e) => {
		ha = e.suppliers;
	},
	publish: () => ma.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
function Ca(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function wa({ orderedQuantity: e, unitCost: t, taxRate: n = ue(), inclusiveLineTotal: r }) {
	let i = Ca(e * t), a = Ca(r === void 0 ? i * n : r - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: Ca(i + a)
	};
}
function Ta(e) {
	let t = Ca(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Ca(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: Ca(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var Ea = /* @__PURE__ */ new Set(), Da = N.read().purchaseOrders;
N.onRollback(() => {
	Da = N.read().purchaseOrders;
});
function Oa() {
	try {
		N.update("purchaseOrders", Da);
	} catch (e) {
		throw Da = N.read().purchaseOrders, e;
	}
	Ea.forEach((e) => N.notify(e));
}
function ka(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Aa(e) {
	return we("PO", Da.map((e) => e.purchaseOrderNumber), e.slice(0, 4));
}
function ja(e) {
	return e?.trim() || void 0;
}
function Ma(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = Wn.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let n = t.units.find((t) => t.id === e.unitId);
		if (!n) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!n.active) throw Error(`${n.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		if (ei(e.productId, e.unitId, e.orderedQuantity, "buy"), t.buyEnabled === !1) throw Error("Product is not available for purchasing.");
		let i = t.taxCode ?? C().gstCode, a = ue(i), o = wa({
			taxRate: a,
			inclusiveLineTotal: (e.priceBasis ?? C().basis) === "Inclusive" ? Math.round(e.orderedQuantity * e.unitCost * 100) / 100 : void 0,
			orderedQuantity: e.orderedQuantity,
			unitCost: De(e.unitCost, a, e.priceBasis)
		});
		return {
			id: ka("pol"),
			...r(i),
			grossUnitCost: (e.priceBasis ?? C().basis) === "Inclusive" ? e.unitCost : void 0,
			productId: t.id,
			unitId: n.id,
			sku: t.sku,
			description: t.name,
			unitSymbol: n.symbol,
			orderedQuantity: e.orderedQuantity,
			receivedQuantity: 0,
			billedQuantity: 0,
			unitCost: De(e.unitCost, a, e.priceBasis),
			...o
		};
	});
}
function Na(e) {
	let t = Sa.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function Pa(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var Fa = {
	subscribe(e) {
		return Ea.add(e), () => {
			Ea.delete(e);
		};
	},
	getSnapshot() {
		return le(Da);
	},
	getAll() {
		return le(Da);
	},
	getById(e) {
		return le(Da).find((t) => t.id === e);
	},
	getBySupplier(e) {
		return le(Da).filter((t) => t.supplierId === e);
	},
	create(e) {
		Pa(e);
		let t = Na(e.supplierId), n = Ma(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: ka("po"),
			purchaseOrderNumber: Aa(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: ja(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: ja(e.supplierReference),
			notes: ja(e.notes),
			lines: n,
			totals: Ta(n),
			createdAt: r,
			updatedAt: r
		};
		return Da = [i, ...Da], Oa(), i;
	},
	updateDraft(e, t) {
		let n = Fa.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		Pa(t);
		let r = Na(t.supplierId), i = Ma(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: ja(t.expectedDeliveryDate),
			supplierReference: ja(t.supplierReference),
			notes: ja(t.notes),
			lines: i,
			totals: Ta(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Da = Da.map((e) => e.id === n.id ? a : e), Oa(), a;
	},
	approve(e) {
		let t = Fa.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return Ia(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = Fa.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return Ia(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = Fa.getById(e);
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
		return Da = Da.map((e) => e.id === n.id ? o : e), Oa(), o;
	},
	recordSupplierBill(e, t) {
		let n = Fa.getById(e);
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
			let n = La(e.billedQuantity + t);
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
		return Da = Da.map((e) => e.id === n.id ? c : e), Oa(), c;
	},
	reverseSupplierBill(e, t) {
		let n = Fa.getById(e);
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
				billedQuantity: La(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Da = Da.map((e) => e.id === n.id ? c : e), Oa(), c;
	},
	cancel(e, t) {
		let n = Fa.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return Ia(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function Ia(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return Da = Da.map((t) => t.id === e.id ? n : t), Oa(), n;
}
function La(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
i("purchaseOrders", {
	repository: Fa,
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
	snapshot: () => ({ purchaseOrders: Da }),
	restore: (e) => {
		Da = e.purchaseOrders;
	},
	publish: () => Ea.forEach((e) => e())
});
function Ra(e) {
	if (Da.some((t) => e.has(t.id) && t.status !== "DRAFT")) throw Error("Only draft purchase orders may be purged.");
	Da = Da.filter((t) => !e.has(t.id)), Oa();
}
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function V(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function za(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function Ba(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Va({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return za(e / t);
}
function Ha({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return Ba(e * t);
}
function Ua({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = V(e + n), a = Ba(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : za(a / i)
	};
}
function Wa({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return Ba(e * t);
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function Ga(e) {
	return Ba(e.lines.reduce((e, t) => {
		let n = Va({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + Ha({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function Ka(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function qa(e) {
	return F.requireBySystemRole(e).id;
}
function Ja(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	if (/^\d{4}-\d{2}-\d{2}$/.test(e)) return e;
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: C().timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function Ya(e, t) {
	return I.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Xa(e, t) {
	let n = Ya(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Za = {
	validateGoodsReceiptPosting(e) {
		let t = F.requireBySystemRole("INVENTORY"), n = F.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = Ga(e);
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
		let t = I.getBySource("GOODS_RECEIPT", e.id).find((e) => !e.reversedJournalEntryId);
		if (t) return t;
		let { inventoryAccountId: n, grniAccountId: r, receiptValue: i } = this.validateGoodsReceiptPosting(e);
		return I.post({
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
		let n = F.requireBySystemRole("GRNI"), r = F.requireBySystemRole("GST_RECEIVABLE"), i = F.requireBySystemRole("ACCOUNTS_PAYABLE");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI account must be an active liability account.");
		if (!r.active || r.type !== "ASSET") throw Error("GST Receivable must be an active asset account.");
		if (!i.active || i.type !== "LIABILITY") throw Error("Accounts Payable must be an active liability account.");
		if (!Number.isFinite(t) || t < 0) throw Error("Matched receipt value must be a non-negative finite number.");
		let a = Ka(e.totals.subtotal - t);
		if (a !== 0) {
			let e = F.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = Ka(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = Ya("SUPPLIER_BILL", e.id);
		if (n) return n;
		let r = t ?? e.totals.subtotal, { variance: i } = this.validateSupplierBillPosting(e, r);
		return I.post({
			journalDate: e.billDate,
			description: `Supplier bill ${e.billNumber}`,
			reference: e.supplierInvoiceNumber,
			sourceType: "SUPPLIER_BILL",
			sourceId: e.id,
			lines: [
				{
					accountId: qa("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				...Ni(e.lines, "paid", !0, e.totals.taxAmount),
				...i === 0 ? [] : [{
					accountId: qa("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: qa("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = Xa("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? I.getById(t.reversalJournalEntryId) : void 0 : I.reverse({
			journalEntryId: t.id,
			reversalDate: Ja(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = Ya("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = L.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return I.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: qa("ACCOUNTS_PAYABLE"),
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
		let t = Xa("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? I.getById(t.reversalJournalEntryId) : void 0 : I.reverse({
			journalEntryId: t.id,
			reversalDate: Ja(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return Ya("SUPPLIER_CREDIT", e.id) || I.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: qa("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				...e.lines.reduce((e, t) => {
					let n = t.expenseAccountId ?? qa("PURCHASE_PRICE_VARIANCE"), r = e.find((e) => e.accountId === n);
					return r ? r.credit = Math.round((r.credit + t.lineSubtotal) * 100) / 100 : t.lineSubtotal && e.push({
						accountId: n,
						debit: 0,
						credit: t.lineSubtotal
					}), e;
				}, []),
				...Ni(e.lines, "paid", !1, e.totals.taxAmount)
			]
		});
	},
	reverseSupplierCredit(e) {
		for (let t of I.getBySource("SUPPLIER_CREDIT_RECLASS", e.id).filter((e) => e.status === "POSTED")) I.reverse({
			journalEntryId: t.id,
			reversalDate: Ja(e.voidedAt),
			reason: e.voidReason ?? "Credit void"
		});
		let t = Xa("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? I.getById(t.reversalJournalEntryId) : void 0 : I.reverse({
			journalEntryId: t.id,
			reversalDate: Ja(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, Qa = structuredClone([{
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
}]), $a = {
	getAll() {
		return Qa;
	},
	getById(e) {
		return Qa.find((t) => t.id === e);
	},
	getActive() {
		return Qa.filter((e) => e.status === "ACTIVE");
	}
}, eo = /* @__PURE__ */ new Set(), to = [];
function no() {
	eo.forEach((e) => e());
}
function ro() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = to.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var io = {
	subscribe(e) {
		return eo.add(e), () => {
			eo.delete(e);
		};
	},
	getSnapshot() {
		return to;
	},
	getAll() {
		return to;
	},
	getByReference(e, t) {
		return to.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return to.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return to.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: ro(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return to = [t, ...to], no(), t;
	}
};
i("inventoryMovements", {
	repository: io,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: to }),
	restore: (e) => {
		to = e.movements;
	},
	publish: () => eo.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var ao = /* @__PURE__ */ new Set(), oo = [];
function so() {
	ao.forEach((e) => e());
}
var co = {
	subscribe(e) {
		return ao.add(e), () => {
			ao.delete(e);
		};
	},
	getSnapshot() {
		return oo;
	},
	getAll() {
		return oo;
	},
	getBalance(e, t) {
		return oo.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = co.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return oo = oo.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? oo.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...oo], so(), e;
	},
	replaceAll(e) {
		oo = e, so();
	},
	clear() {
		oo = [], so();
	}
};
i("costBalances", {
	repository: co,
	read: "inventory.cost.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: oo }),
	restore: (e) => {
		oo = e.balances;
	},
	publish: () => ao.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var lo = /* @__PURE__ */ new Set(), uo = [];
function fo() {
	lo.forEach((e) => e());
}
function po() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = uo.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function mo(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var ho = {
	subscribe(e) {
		return lo.add(e), () => {
			lo.delete(e);
		};
	},
	getSnapshot() {
		return uo;
	},
	getAll() {
		return uo;
	},
	getByReference(e, t) {
		return uo.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return uo.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return uo.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return uo.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return mo(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: po(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = ho.build(e);
		return uo = [t, ...uo], fo(), t;
	},
	replaceAll(e) {
		uo = e, fo();
	},
	clear() {
		uo = [], fo();
	}
};
i("costMovements", {
	repository: ho,
	read: "inventory.cost.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: uo }),
	restore: (e) => {
		uo = e.movements;
	},
	publish: () => lo.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var go = /* @__PURE__ */ new Set(), _o = "2026-01-01T00:00:00.000Z", vo = Wn.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: _o,
	updatedAt: _o
}));
function yo() {
	go.forEach((e) => e());
}
var bo = {
	ensureProductPolicy(e, t, n) {
		let r = vo.find((t) => t.productId === e), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			productId: e,
			baseUnitId: t,
			active: n ? r?.active ?? !0 : !1,
			costingMethod: "MOVING_WEIGHTED_AVERAGE",
			createdAt: r?.createdAt ?? i,
			updatedAt: i
		};
		return vo = [...vo.filter((t) => t.productId !== e), a], yo(), a;
	},
	subscribe(e) {
		return go.add(e), () => {
			go.delete(e);
		};
	},
	getSnapshot() {
		return vo;
	},
	getAll() {
		return vo;
	},
	getByProductId(e) {
		return vo.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = bo.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		if (t && !Vn(Gn(e) ?? { itemType: "SERVICE" })) throw Error("Inventory costing cannot be enabled for non-stock/service items.");
		let n = {
			...bo.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return vo = vo.map((t) => t.productId === e ? n : t), yo(), n;
	}
};
i("costingPolicies", {
	repository: bo,
	read: "inventory.cost.read",
	commands: {
		ensureProductPolicy: null,
		setActive: "accounting.post"
	},
	snapshot: () => ({ policies: vo }),
	restore: (e) => {
		vo = e.policies;
	},
	publish: () => go.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function xo(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function So(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function Co(e, t) {
	let n = Gn(e);
	if (!n) throw Error("Product was not found.");
	if (!Vn(n)) throw Error("Non-stock/service items cannot move inventory value.");
	let r = bo.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = Kn(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function wo(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = Ba(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(Ba(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function To(e) {
	if (e && ho.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function Eo({ movement: e, balance: t }) {
	let n = ho.getAll(), r = co.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	ho.replaceAll(i), co.replaceAll(a);
}
function Do(e) {
	if (xo(e.quantity), So(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	To(e.inventoryMovementId);
	let { policy: t, unit: n } = Co(e.productId, e.unitId), r = V(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = Va({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = Ha({
		quantityBase: r,
		unitCostBase: i
	}), o = co.getBalance(e.siteId, e.productId);
	o && wo(o, t.baseUnitId);
	let s = Ua({
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
	wo(l, t.baseUnitId);
	let u = ho.build({
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
	return Eo({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function Oo(e) {
	xo(e.quantity), So(e.occurredAt), To(e.inventoryMovementId);
	let { policy: t, unit: n } = Co(e.productId, e.unitId), r = V(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = co.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (wo(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = za(i.averageCostPerBaseUnit), o = Wa({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = V(i.quantityOnHand - r), c = s === 0, l = Ba(c ? -i.inventoryValue : -o), u = c ? 0 : Ba(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : za(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	wo(p, t.baseUnitId);
	let m = ho.build({
		movementType: e.movementType ?? "ISSUE",
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: t.baseUnitId,
		quantityBase: V(-r),
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
	return Eo({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function ko(e) {
	if (xo(e.quantityBase), So(e.occurredAt), To(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = Gn(e.productId);
	if (!t) throw Error("Product was not found.");
	if (!Vn(t)) throw Error("Non-stock/service items cannot restore inventory value.");
	let n = bo.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = V(e.quantityBase), i = za(e.unitCostBase), a = Ba(e.inventoryValue), o = co.getBalance(e.siteId, e.productId);
	o && wo(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = V(s + r), u = Ba(c + a), d = l === 0 ? 0 : za(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	wo(p, n.baseUnitId);
	let m = ho.build({
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
	return Eo({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var Ao = /* @__PURE__ */ new Set(), jo = [];
function Mo() {
	Ao.forEach((e) => e());
}
function No(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var Po = {
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
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = Po.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: No(i.quantityOnHand + r),
				updatedAt: a
			};
			return jo = jo.map((r) => r.siteId === e && r.productId === t ? n : r), Mo(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: No(r),
			updatedAt: a
		};
		return jo = [o, ...jo], Mo(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = Po.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = No(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return jo = jo.map((n) => n.siteId === e && n.productId === t ? o : n), Mo(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of io.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: No((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		jo = Array.from(e.values()), Mo();
	}
};
i("stock", {
	repository: Po,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: jo }),
	restore: (e) => {
		jo = e.balances;
	},
	publish: () => Ao.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/goodsReceiptRepository.ts
var Fo = /* @__PURE__ */ new Set(), Io = N.read().goodsReceipts;
N.onRollback(() => {
	Io = N.read().goodsReceipts;
});
function Lo() {
	try {
		N.update("goodsReceipts", Io);
	} catch (e) {
		throw Io = N.read().goodsReceipts, e;
	}
	Fo.forEach((e) => N.notify(e));
}
function Ro(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function zo(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = Io.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Bo(e) {
	return e?.trim() || void 0;
}
var Vo = {
	subscribe(e) {
		return Fo.add(e), () => {
			Fo.delete(e);
		};
	},
	getSnapshot() {
		return Io;
	},
	getAll() {
		return Io;
	},
	getById(e) {
		return Io.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return Io.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = Fa.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = $a.getById(e.siteId);
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
			let r = Ro(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!Gn(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = Kn(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = Ro(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: zo(e.receiptDate),
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
			supplierDeliveryReference: Bo(e.supplierDeliveryReference),
			notes: Bo(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		Za.validateGoodsReceiptPosting(s), A();
		let c = k.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return k.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = Gn(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				k.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = io.create({
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
					Do({
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
					Po.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			k.runStep(c, "JOURNAL", () => {
				Za.postGoodsReceipt(s);
			}), k.runStep(c, "PURCHASE_ORDER", () => {
				Fa.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), k.runStep(c, "RECEIPT", () => {
				Io = [s, ...Io], Lo();
			});
		}), k.recover(c), s;
	}
};
i("goodsReceipts", {
	repository: Vo,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: Io }),
	restore: (e) => {
		Io = e.goodsReceipts;
	},
	publish: () => Fo.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var Ho = 1e-4;
function Uo(e) {
	return Ba(e);
}
function Wo(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - V(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function Go(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function Ko(e, t, n) {
	let r = Va({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return Ha({
		quantityBase: V(e * n),
		unitCostBase: r
	});
}
function qo(e, t, n) {
	let r = [], i = n.filter((e) => e.status === "ACTIVE");
	for (let n of t) if (n.purchaseOrderId === e && n.status === "POSTED") for (let e of n.lines) {
		let t = V(i.filter((t) => t.goodsReceiptId === n.id && t.goodsReceiptLineId === e.id).reduce((e, t) => e + t.matchedQuantity, 0)), a = V(e.receivedQuantity - t);
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
function Jo(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = qo(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), Wo(e.quantity), Go(e.billUnitCost);
		let r = V(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > Ho);
		if (V(d.reduce((e, t) => e + t.availableQuantity, 0)) + Ho < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= Ho) break;
			let s = V(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = V(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = Ha({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: Va({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = Uo(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), h = Math.abs(o.availableQuantity - s) <= Ho ? Uo(p - m) : Ko(s, o.receiptUnitCost, o.conversionToBase);
			if (h < 0) throw Error("Receipt cost has been overallocated.");
			let g = Uo(s * e.billUnitCost), _ = Uo(g - h);
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
			}), o.availableQuantity = V(o.availableQuantity - s), r = V(r - s);
		}
		if (r > Ho) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = Uo(Uo(e.quantity * e.billUnitCost) - Uo(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = Uo(p.matchedBillValue + f), p.priceVariance = Uo(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = V(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = V(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = Uo(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = Uo(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: Uo(p - f)
	};
}
var Yo = {
	calculate: Jo,
	getAvailableReceiptLines(e, t, n) {
		return qo(e, t, n);
	}
}, Xo = N.read().receiptMatches;
N.onRollback(() => {
	Xo = N.read().receiptMatches;
});
var Zo = /* @__PURE__ */ new Set(), Qo = () => {
	try {
		N.update("receiptMatches", Xo);
	} catch (e) {
		throw Xo = N.read().receiptMatches, e;
	}
	Zo.forEach((e) => N.notify(e));
}, $o = {
	getAll() {
		return [...Xo];
	},
	subscribe(e) {
		return Zo.add(e), () => {
			Zo.delete(e);
		};
	},
	getSnapshot() {
		return Xo;
	},
	getByBill(e) {
		return Xo.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (Xo.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		Xo = [...Xo, ...t], Qo();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		Xo = Xo.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), Qo();
	}
};
i("receiptMatches", {
	repository: $o,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: Xo }),
	restore: (e) => {
		Xo = e.matches;
	},
	publish: () => Zo.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
function es(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ts({ quantity: e, unitCost: t, inclusiveLineTotal: n, taxRate: r = .1 }) {
	let i = es(e * t), a = es(n === void 0 ? i * r : n - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: es(i + a)
	};
}
function ns(e) {
	let t = es(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = es(e.reduce((e, t) => e + t.taxAmount, 0)), r = es(t + n);
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
var rs = /* @__PURE__ */ new Set(), H = N.read().supplierBills;
N.onRollback(() => {
	H = N.read().supplierBills;
});
function is() {
	try {
		N.update("supplierBills", H);
	} catch (e) {
		throw H = N.read().supplierBills, e;
	}
	rs.forEach((e) => N.notify(e));
}
function as(e) {
	return e?.trim() || void 0;
}
function os(e) {
	return we("BILL", H.map((e) => e.billNumber), e.slice(0, 4));
}
var ss = {
	insertExpenseBill(e) {
		let t = H.find((t) => t.managedDraftId === e.managedDraftId);
		if (t) return t;
		if (H.some((t) => t.supplierId === e.supplierId && t.supplierInvoiceNumber.toLowerCase() === e.supplierInvoiceNumber.toLowerCase() && t.status !== "VOID")) throw Error("Supplier invoice reference already exists.");
		return H = [e, ...H], is(), e;
	},
	subscribe(e) {
		return rs.add(e), () => {
			rs.delete(e);
		};
	},
	getSnapshot() {
		return H;
	},
	getAll() {
		return H;
	},
	getById(e) {
		return H.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return H.filter((t) => t.supplierId === e);
	},
	applyPayment(e, t) {
		let n = H.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a payment.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment allocation must be greater than zero.");
		let r = ls(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = ls(n.totals.amountPaid + r), a = ls(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return H = H.map((t) => t.id === e ? o : t), is(), o;
	},
	reversePayment(e, t) {
		let n = H.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = ls(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = ls(Math.max(0, n.totals.amountPaid - r)), a = ls(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return H = H.map((t) => t.id === e ? o : t), is(), o;
	},
	applyCredit(e, t) {
		let n = H.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = ls(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = ls(n.totals.amountCredited + r), a = ls(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return H = H.map((t) => t.id === e ? o : t), is(), o;
	},
	reverseCredit(e, t) {
		let n = H.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = ls(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = ls(Math.max(0, n.totals.amountCredited - r)), a = ls(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return H = H.map((t) => t.id === e ? o : t), is(), o;
	},
	markVoid(e, n) {
		let r = H.find((t) => t.id === e);
		if (!r) throw Error("Supplier bill was not found.");
		if (r.status === "VOID") throw Error("This supplier bill has already been voided.");
		let i = n.trim();
		if (i.length < 3) throw Error("A void reason is required.");
		if (r.status !== "OPEN" || r.totals.amountPaid > 0 || r.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if ((t().supplierCredits?.supplierCredits ?? N.read().supplierCredits).some((e) => e.sourceSupplierBillId === r.id && e.status !== "VOID")) throw Error("Reverse source supplier credits and linked physical returns before voiding the bill.");
		if (r.kind === "EXPENSE") {
			A();
			let e = (/* @__PURE__ */ new Date()).toISOString(), t = {
				...r,
				status: "VOID",
				voidedAt: e,
				voidReason: i,
				updatedAt: e
			};
			return Za.reverseSupplierBill(t), H = H.map((e) => e.id === r.id ? t : e), is(), t;
		}
		if ($o.getByBill(r.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...r,
			status: "VOID",
			voidedAt: a,
			voidReason: i,
			updatedAt: a
		};
		A();
		let s = k.begin("SUPPLIER_BILL_VOID", r.id).key;
		return k.registerRecovery(s, () => {
			k.runStep(s, "REVERSAL_JOURNAL", () => {
				Za.reverseSupplierBill(o);
			}), k.runStep(s, "PURCHASE_ORDER", () => {
				Fa.reverseSupplierBill(r.purchaseOrderId, r.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), k.runStep(s, "MATCHES", () => {
				$o.reverseForBill(r.id, i, ve(a));
			}), k.runStep(s, "BILL", () => {
				H = H.map((e) => e.id === r.id ? o : e), is();
			});
		}), k.recover(s), o;
	},
	getByPurchaseOrder(e) {
		return H.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = Fa.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (![
			"PARTIALLY_RECEIVED",
			"RECEIVED",
			"BILLED"
		].includes(t.status)) throw Error("Supplier bills can only be created for purchase orders with received goods.");
		let n = e.supplierInvoiceNumber.trim();
		if (!n) throw Error("Supplier invoice number is required.");
		if (H.some((e) => e.supplierId === t.supplierId && e.supplierInvoiceNumber.toLowerCase() === n.toLowerCase() && e.status !== "VOID")) throw Error("This supplier invoice number has already been entered.");
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
			let r = cs(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = ts({
				taxRate: a,
				quantity: e.quantity,
				unitCost: e.unitCost
			});
			return n.grossUnitCost !== void 0 && e.unitCost === n.unitCost && (o.taxAmount = ls(e.quantity * n.grossUnitCost - o.lineSubtotal), o.lineTotal = ls(o.lineSubtotal + o.taxAmount)), {
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
		}), o = ns(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: os(e.billDate),
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
			notes: as(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = Yo.calculate({
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
			receipts: Vo.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: $o.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		Za.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), A();
		let u = k.begin("SUPPLIER_BILL", c.id).key;
		return k.registerRecovery(u, () => {
			k.runStep(u, "JOURNAL", () => {
				Za.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), k.runStep(u, "PURCHASE_ORDER", () => {
				Fa.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), k.runStep(u, "MATCHES", () => {
				$o.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), k.runStep(u, "BILL", () => {
				H = [c, ...H], is();
			});
		}), k.recover(u), c;
	}
};
function cs(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function ls(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
i("supplierBills", {
	repository: ss,
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
	snapshot: () => ({ supplierBills: H }),
	restore: (e) => {
		H = e.supplierBills;
	},
	publish: () => rs.forEach((e) => e())
});
function us(e, t) {
	let { status: n, ...r } = t;
	H = H.map((t) => t.id === e ? {
		...t,
		status: n,
		totals: {
			...t.totals,
			...r
		}
	} : t), is();
}
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var ds = /* @__PURE__ */ new Set(), U = N.read().supplierCredits, fs = N.read().supplierCreditAllocations, ps = N.read().supplierCredits, ms = N.read().supplierCreditAllocations;
N.onRollback(() => {
	U = N.read().supplierCredits, fs = N.read().supplierCreditAllocations, ps = U, ms = fs;
});
function hs() {
	N.update("supplierCredits", U), N.update("supplierCreditAllocations", fs), ps = [...U], ms = [...fs], ds.forEach((e) => N.notify(e));
}
var gs = !1, W = {
	subscribe(e) {
		return ds.add(e), () => {
			ds.delete(e);
		};
	},
	getSnapshot() {
		return ps;
	},
	getAllocationSnapshot() {
		return ms;
	},
	getAll() {
		return ps;
	},
	getAllAllocations() {
		return ms;
	},
	getById(e) {
		return U.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return U.filter((t) => t.supplierId === e);
	},
	getBySourceBill(e) {
		return U.filter((t) => t.sourceSupplierBillId === e);
	},
	getAllocationById(e) {
		return fs.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return fs.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return fs.filter((t) => t.supplierBillId === e);
	},
	createReturnCredit(e, t) {
		let n = {
			...W.create(e),
			physicalReturnId: t
		};
		return W.update(n), n;
	},
	voidReturnCredit(e) {
		gs = !0;
		try {
			return W.voidCredit(e);
		} finally {
			gs = !1;
		}
	},
	create(e) {
		let t = ss.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (U.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!bs(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, n) => {
			let r = i.get(e.supplierBillLineId);
			if (!r) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(r.id)) throw Error(`${r.description} appears more than once in the supplier credit.`);
			a.add(r.id);
			let o = Ss(e.quantity);
			if (!Number.isFinite(o) || o <= 0) throw Error(`${r.description} credit quantity must be greater than zero.`);
			if (o > r.quantity) throw Error(`${r.description} credit quantity cannot exceed the source bill quantity.`);
			let s = e.unitCost;
			if (!Number.isFinite(s) || s < 0) throw Error(`${r.description} unit cost cannot be negative.`);
			if (s > r.unitCost + 1e-8) throw Error(`${r.description} credit unit cost cannot exceed the source bill unit cost.`);
			let c = U.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.supplierBillLineId === r.id), l = Math.abs(s - r.unitCost) < 1e-8, u = c.every((e) => Math.abs(e.unitCost - r.unitCost) < 1e-8), d = l && u && Math.abs(o + c.reduce((e, t) => e + t.quantity, 0) - r.quantity) < 1e-8, f = c.reduce((e, t) => e + t.lineSubtotal, 0), p = c.reduce((e, t) => e + t.taxAmount, 0), m = xs(d ? r.lineSubtotal - f : l ? r.lineSubtotal * o / r.quantity : o * s), h = xs(d ? r.taxAmount - p : r.unitCost ? r.taxAmount * o / r.quantity * s / r.unitCost : 0);
			if (m < 0 || h < 0 || xs(m + f) > r.lineSubtotal || xs(h + p) > r.taxAmount) throw Error("Credit line value exceeds the uncredited source bill line.");
			let g = xs(m + h);
			return {
				id: ys(`supplier-credit-line-${n + 1}`),
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
		}), s = xs(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = xs(o.reduce((e, t) => e + t.taxAmount, 0)), l = xs(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (xs(xs(U.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > xs(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: ys("supplier-credit"),
			creditNumber: vs(e.creditDate),
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
		return U = [d, ...U], hs(), Za.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = U.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = ss.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!bs(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = xs(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: ys("supplier-credit-allocation"),
			allocationNumber: _s(e.allocationDate),
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
		ss.applyCredit(n.id, r);
		let o = xs(t.amountApplied + r), s = xs(Math.max(0, t.totals.total - (t.amountRefunded ?? 0) - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return fs = [a, ...fs], U = U.map((e) => e.id === t.id ? c : e), hs(), a;
	},
	reverseAllocation(e) {
		let t = fs.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = U.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = ss.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		ss.reverseCredit(i.id, t.amount);
		let o = xs(Math.max(0, r.amountApplied - t.amount)), s = xs(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - o)), c = {
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
		return U = U.map((e) => e.id === r.id ? c : e), fs = fs.map((e) => e.id === t.id ? l : e), hs(), l;
	},
	voidCredit(e) {
		let t = U.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		if (t.physicalReturnId && !gs) throw Error("Reverse the linked physical supplier return instead of voiding its credit separately.");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse supplier refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (fs.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: gs && e.voidDate ? e.voidDate : r,
			voidReason: n,
			updatedAt: r
		};
		return U = U.map((e) => e.id === t.id ? i : e), hs(), Za.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!fs.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return fs = fs.map((t) => t.id === e.id ? e : t), hs(), e;
	},
	update(e) {
		if (!U.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return U = U.map((t) => t.id === e.id ? e : t), hs(), e;
	}
};
function _s(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = fs.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function vs(e) {
	return we("SC", U.map((e) => e.creditNumber), e.slice(0, 4));
}
function ys(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function bs(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function xs(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ss(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var Cs = W.create;
W.create = function(...e) {
	return A(), N.transaction(() => Cs.apply(W, e));
};
var ws = W.applyToBill;
W.applyToBill = function(...e) {
	return A(), N.transaction(() => ws.apply(W, e));
};
var Ts = W.reverseAllocation;
W.reverseAllocation = function(...e) {
	return A(), N.transaction(() => Ts.apply(W, e));
};
var Es = W.voidCredit;
W.voidCredit = function(...e) {
	return A(), N.transaction(() => Es.apply(W, e));
};
var Ds = W.update;
W.update = function(...e) {
	return A(), N.transaction(() => Ds.apply(W, e));
};
var Os = W.updateAllocation;
W.updateAllocation = function(...e) {
	return A(), N.transaction(() => Os.apply(W, e));
}, i("supplierCredits", {
	repository: W,
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
		supplierCredits: U,
		allocations: fs
	}),
	restore: (e) => {
		U = e.supplierCredits, fs = e.allocations, ps = [...U], ms = [...fs];
	},
	publish: () => ds.forEach((e) => e())
});
function ks(e, t) {
	U = U.map((n) => n.id === e ? {
		...n,
		...t
	} : n), hs();
}
//#endregion
//#region src/features/finance-closure/settlementRepository.ts
var As = (e) => Math.round((e + 2 ** -52) * 100) / 100, js = E().trim().min(1).max(200), Ms = f().finite().positive().refine((e) => As(e) === e, "Use cents precision"), Ns = e({
	operationId: js,
	customerId: js,
	paymentDate: js,
	bankAccountId: js,
	reference: E().max(500).optional(),
	allocations: s(e({
		invoiceId: js,
		amount: Ms
	}).strict()).min(1).max(500)
}).strict(), Ps = e({
	operationId: js,
	creditId: js,
	paymentDate: js,
	bankAccountId: js,
	amount: Ms,
	reference: E().max(500).optional()
}).strict(), Fs = [], Is = [], Ls = [], Rs = 0, zs = /* @__PURE__ */ new Set(), Bs = () => {
	Rs++, zs.forEach((e) => e());
};
function Vs(e, t, n) {
	let r = JSON.stringify(n), i = e.find((e) => e.operationId === t);
	if (i && i.fingerprint !== r) throw Error("Operation ID was already used with different data.");
	return {
		old: i,
		fingerprint: r
	};
}
function Hs(e, t) {
	w(t, "Payment date");
	let n = L.requireById(e);
	if (!n.active || t < n.openingBalanceDate) throw Error("Bank is inactive or payment precedes its opening date.");
	let r = F.requireById(n.glAccountId);
	if (!r.active || r.type !== "ASSET") throw Error("Invalid bank ledger account.");
	return n;
}
function Us(e) {
	if (Fn.getAll().some((t) => t.clearedTransactionIds.some((t) => t.startsWith(e + ":")))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Ws(e, t) {
	let n = e === "customer" ? z.getById(t) : W.getById(t);
	if (!n || n.status === "VOID" || n.status === "DRAFT") throw Error("An issued credit is required.");
	return n;
}
function Gs(e, t, n) {
	let r = Ws(e, t), i = As(n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0)), a = As(r.totals.total - r.amountApplied - i);
	if (a < 0) throw Error("Refund exceeds the unused credit.");
	let o = {
		...r,
		refundEvents: n,
		amountRefunded: i,
		amountAvailable: a,
		status: a === 0 ? "FULLY_APPLIED" : "ISSUED",
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	e === "customer" ? z.update(o) : W.update(o);
}
function Ks(e, t) {
	A();
	let n = Ps.parse(t), { old: r, fingerprint: i } = Vs(e === "customer" ? Is : Ls, n.operationId, n);
	if (r) return r;
	let a = Ws(e, n.creditId), o = Hs(n.bankAccountId, n.paymentDate);
	if (n.paymentDate < a.creditDate || n.amount > a.amountAvailable) throw Error("Refund date/amount exceeds the available credit.");
	let s = F.requireBySystemRole(e === "customer" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"), c = crypto.randomUUID(), l = I.post({
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
	return Gs(e, a.id, [...a.refundEvents ?? [], {
		id: u.id,
		date: u.paymentDate,
		amount: u.amount
	}]), e === "customer" ? Is = [...Is, u] : Ls = [...Ls, u], Bs(), u;
}
function qs(e, t) {
	if (A(), w(t.reversalDate, "Reversal date"), !t.reason?.trim() || t.reason.trim().length < 3) throw Error("Enter a reversal reason.");
	let n = e === "customer" ? Is : Ls, r = n.find((e) => e.id === t.id);
	if (!r) throw Error("Refund was not found.");
	if (r.status === "REVERSED") return r;
	if (t.reversalDate < r.paymentDate) throw Error("Reversal cannot precede the refund.");
	Us(r.journalEntryId), I.reverse({
		journalEntryId: r.journalEntryId,
		reversalDate: t.reversalDate,
		reason: t.reason
	});
	let i = Ws(e, r.creditId);
	Gs(e, i.id, (i.refundEvents ?? []).map((e) => e.id === r.id ? {
		...e,
		reversalDate: t.reversalDate
	} : e));
	let a = {
		...r,
		status: "REVERSED",
		reversalDate: t.reversalDate
	};
	return e === "customer" ? Is = n.map((e) => e.id === r.id ? a : e) : Ls = n.map((e) => e.id === r.id ? a : e), Bs(), a;
}
var Js = {
	recordReceipt(e) {
		let t = Ns.parse(e), { old: n, fingerprint: r } = Vs(Fs, t.operationId, t);
		if (n) return n;
		if (Hs(t.bankAccountId, t.paymentDate), new Set(t.allocations.map((e) => e.invoiceId)).size !== t.allocations.length) throw Error("Each invoice may only be allocated once.");
		for (let e of t.allocations) {
			let n = B.getAll().find((t) => t.id === e.invoiceId && t.type === "INVOICE");
			if (!n || n.type !== "INVOICE" || n.customerId !== t.customerId || t.paymentDate < n.documentDate || ["VOID", "DRAFT"].includes(n.status) || e.amount > n.amountDue) throw Error("Invalid invoice customer, date or outstanding amount.");
		}
		let i = t.allocations.map((e, n) => B.recordInvoicePayment({
			...t,
			invoiceId: e.invoiceId,
			amount: e.amount,
			method: "BANK_TRANSFER",
			operationId: t.operationId + ":" + n
		})), a = {
			...t,
			id: crypto.randomUUID(),
			fingerprint: r,
			amount: As(i.reduce((e, t) => e + t.amount, 0)),
			paymentIds: i.map((e) => e.id),
			status: "POSTED"
		};
		return Fs = [...Fs, a], Bs(), a;
	},
	reverseReceipt(e) {
		let t = Fs.find((t) => t.id === e.id);
		if (!t) throw Error("Receipt not found.");
		if (t.status === "REVERSED") return t;
		for (let e of t.paymentIds) {
			let t = Ai.getById(e);
			if (!t || t.status !== "RECEIVED") throw Error("Receipt allocations changed; inspect individual payments first.");
			for (let t of I.getBySource("CUSTOMER_PAYMENT", e)) Us(t.id);
		}
		for (let n of t.paymentIds) B.reverseInvoicePayment(n, e.reason);
		let n = {
			...t,
			status: "REVERSED",
			reversalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		};
		return Fs = Fs.map((e) => e.id === t.id ? n : e), Bs(), n;
	},
	createRefund: (e) => Ks("customer", e),
	reverseRefund: (e) => qs("customer", e)
}, Ys = {
	create: (e) => Ks("supplier", e),
	reverse: (e) => qs("supplier", e),
	repairLegacyCredits(e) {
		if (A(), w(e.date, "Repair date"), e.reason?.trim().length < 3) throw Error("Enter a repair reason.");
		let t = [];
		for (let n of W.getAll().filter((e) => e.status !== "VOID")) {
			if (e.date < n.creditDate || I.getBySource("SUPPLIER_CREDIT_RECLASS", n.id).length) continue;
			let r = I.getBySource("SUPPLIER_CREDIT", n.id).find((e) => e.status === "POSTED");
			if (!r) continue;
			let i = F.requireBySystemRole("INVENTORY"), a = F.requireBySystemRole("PURCHASE_PRICE_VARIANCE"), o = As(r.lines.filter((e) => e.accountId === i.id).reduce((e, t) => e + t.credit - t.debit, 0));
			o <= 0 || t.push(I.post({
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
}, Xs = e({
	id: js,
	operationId: js,
	fingerprint: js,
	creditId: js,
	contactId: js,
	paymentDate: js,
	bankAccountId: js,
	amount: Ms,
	journalEntryId: js,
	status: T(["POSTED", "REVERSED"]),
	reference: E().optional(),
	reversalDate: E().optional()
}).strict();
i("customerSettlements", {
	repository: Js,
	read: "sales.read",
	commands: {
		recordReceipt: "sales.payment",
		reverseReceipt: "sales.payment",
		createRefund: "sales.payment",
		reverseRefund: "sales.payment"
	},
	snapshot: () => ({
		receipts: Fs,
		refunds: Is
	}),
	restore: (e) => {
		Fs = e.receipts, Is = e.refunds;
	},
	validate: (t, n) => {
		Zs(t, n, !1);
		let r = t;
		s(Xs.extend({ fingerprint: E() })).parse(r.refunds), s(e({
			id: js,
			operationId: js,
			paymentIds: s(js),
			amount: Ms,
			status: T(["POSTED", "REVERSED"])
		}).passthrough()).parse(r.receipts);
	},
	publish: Bs
}), i("supplierRefunds", {
	repository: Ys,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		repairLegacyCredits: "accounting.recover"
	},
	snapshot: () => ({ refunds: Ls }),
	restore: (e) => {
		Ls = e.refunds;
	},
	validate: (e, t) => {
		Zs(e, t, !0), s(Xs.extend({ fingerprint: E() })).parse(e.refunds);
	},
	publish: Bs
});
function Zs(e, t, n) {
	let r = e, i = t.journals.journalEntries, a = n ? t.supplierCredits.supplierCredits : t.customerCredits.creditNotes, o = t.bankAccounts.bankAccounts;
	for (let e of r.refunds) {
		let t = a.find((t) => t.id === e.creditId), r = i.find((t) => t.id === e.journalEntryId), s = t?.refundEvents?.find((t) => t.id === e.id);
		if (!t || e.contactId !== ("customerId" in t ? t.customerId : t.supplierId) || !s || s.amount !== e.amount || s.date !== e.paymentDate || s.reversalDate !== e.reversalDate || !o.some((t) => t.id === e.bankAccountId) || !r || r.sourceId !== e.id || r.sourceType !== (n ? "SUPPLIER_REFUND" : "CUSTOMER_REFUND") || r.totalDebit !== e.amount || r.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) throw Error("Refund snapshot relationships are invalid.");
	}
	for (let e of a) {
		let t = As(r.refunds.filter((t) => t.creditId === e.id && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
		if ((e.amountRefunded ?? 0) !== t) throw Error("Credit refunded balance is invalid.");
	}
	for (let e of a) for (let t of e.refundEvents ?? []) if (!r.refunds.some((n) => n.id === t.id && n.creditId === e.id)) throw Error("Credit refund history has no settlement record.");
	if (!n) {
		let e = t.customerPayments.payments;
		for (let t of r.receipts ?? []) {
			let n = t.paymentIds.map((t) => e.find((e) => e.id === t));
			if (new Set(t.paymentIds).size !== t.paymentIds.length || !n.length || n.some((e) => !e || e.customerId !== t.customerId || e.bankAccountId !== t.bankAccountId || e.status !== (t.status === "REVERSED" ? "REVERSED" : "RECEIVED")) || As(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== t.amount) throw Error("Receipt allocation snapshot relationships are invalid.");
		}
	}
}
//#endregion
//#region src/features/finance-closure/bankStatementRepository.ts
var Qs = (e) => Math.round((e + 2 ** -52) * 100) / 100, $s = E().min(1).max(200), ec = [], tc = 0, nc = /* @__PURE__ */ new Set(), rc = () => {
	tc++, nc.forEach((e) => e());
};
function ic(e) {
	let t = L.requireById(e);
	if (!t.active) throw Error("Select an active bank account.");
	return t;
}
function ac(e) {
	let t = ec.find((t) => t.id === e);
	if (!t) throw Error("Statement line was not found.");
	return t;
}
function oc(e) {
	if (e.status !== "UNMATCHED") throw Error("This line is already processed. Revert it before changing it.");
	let t = Fn.getLatestByBankAccount(e.bankAccountId);
	if (t && e.date <= t.statementDate) throw Error("Statement date is already reconciled.");
}
function sc(e) {
	return ec = ec.map((t) => t.id === e.id ? e : t), rc(), e;
}
var cc = (e, t) => Be(ic(e), I.getAll(), t).transactions;
function lc(e) {
	if (e.date < ic(e.bankAccountId).openingBalanceDate) throw Error("Statement predates the current bank opening date.");
}
function uc(e) {
	let t = I.getAll(), n = Le(t);
	if (t.some((t) => t.sourceType === "BANK_STATEMENT" && t.sourceId?.startsWith(e + ":") && n.reviewIds.has(t.id))) throw Error("Earlier categorisation correction requires reviewed recovery before changing this line again.");
}
var dc = e({
	date: $s,
	description: E().trim().min(1).max(1e3),
	amount: f().finite().refine((e) => e !== 0 && Qs(e) === e, "Enter a non-zero amount in cents"),
	reference: E().max(500).default(""),
	externalId: E().max(200).default(""),
	payee: E().trim().max(500).optional()
}).strict(), fc = {
	importRows(t) {
		let n = e({
			bankAccountId: $s,
			rows: s(dc).min(1).max(1e4)
		}).strict().parse(t), r = ic(n.bankAccountId), i = 0, a = [...ec], o = [];
		for (let e of n.rows) {
			if (w(e.date, "Statement date"), e.date < r.openingBalanceDate) throw Error("Statement predates the bank opening date.");
			let t = JSON.stringify([r.id, e.externalId || [
				e.date,
				e.amount,
				e.description.trim().toLowerCase(),
				e.reference.trim().toLowerCase(),
				...e.payee ? [e.payee.trim().toLowerCase()] : []
			]]), n = a.find((e) => e.key === t);
			if (n) {
				if (e.externalId && (n.amount !== e.amount || n.date !== e.date || n.description !== e.description || n.reference !== e.reference || (n.payee ?? "") !== (e.payee ?? ""))) throw Error("Bank transaction ID conflicts with an existing row.");
				i++;
				continue;
			}
			let s = Fn.getLatestByBankAccount(r.id);
			if (s && e.date <= s.statementDate) throw Error("Cannot import new rows into a reconciled statement period.");
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
			a.push(c), o.push(c);
		}
		return ec = a, rc(), {
			created: o.length,
			duplicates: i
		};
	},
	importCsv(e) {
		if (typeof e.csv != "string" || e.csv.length > 1e7) throw Error("CSV exceeds the 10 MB limit.");
		let t = Mt(e.csv.replace(/^\uFEFF/, "")), n = t.shift()?.map((e) => e.trim().toLowerCase()) ?? [];
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
			payee: "",
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
		return fc.importRows({
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
					l = Qs(t - e);
				}
				return {
					date: c,
					description: s("description"),
					amount: l,
					reference: s("reference"),
					externalId: s("id"),
					...r.payee ? { payee: s("payee") } : {}
				};
			})
		});
	},
	candidates(e) {
		w(e.asOfDate, "As-of date");
		let t = Fn.getClearedTransactionIds(e.bankAccountId), n = I.getAll(), r = new Map(n.map((e) => [e.id, e]));
		return cc(e.bankAccountId, e.asOfDate).filter((i) => ce(r.get(i.journalEntryId), n, e.asOfDate) && !i.correctionOnly && !i.correctionIssue && !t.has(i.id) && !ec.some((e) => e.ledgerIds.includes(i.id)));
	},
	match(e) {
		let t = ac(e.id);
		if (oc(t), lc(t), !Array.isArray(e.ledgerIds) || !e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Select unique ledger entries.");
		let n = Fn.getClearedTransactionIds(t.bankAccountId);
		if (e.ledgerIds.some((e) => n.has(e))) throw Error("Selected bank entries were already cleared by a completed reconciliation. Use the genuine source of this new statement line.");
		let r = fc.candidates({
			bankAccountId: t.bankAccountId,
			asOfDate: t.date
		}), i = e.ledgerIds.map((e) => r.find((t) => t.id === e));
		if (i.some((e) => !e) || Qs(i.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== t.amount) throw Error("Selected bank entries must match this signed statement amount exactly.");
		return sc({
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
		let t = ac(e.id);
		return (x["bank-rules"] ?? []).filter((e) => e.status === "Active" && e.enabled !== "No").filter((e) => Ne(e, t)).sort((e, t) => Number(e.priority ?? 100) - Number(t.priority ?? 100) || e.id.localeCompare(t.id));
	},
	post(t) {
		A();
		let n = ac(t.id), i = JSON.stringify(t.splits);
		if (n.status === "POSTED") {
			if (n.fingerprint !== i) throw Error("Line was already posted with different categorisation.");
			return n;
		}
		oc(n), lc(n), uc(n.id);
		let a = s(e({
			accountId: $s,
			amount: f().finite().positive().refine((e) => Qs(e) === e),
			taxCode: $s
		}).strict()).min(1).max(100).parse(t.splits);
		if (Qs(a.reduce((e, t) => e + t.amount, 0)) !== Math.abs(n.amount)) throw Error("Split amounts must equal the statement total.");
		let o = ic(n.bankAccountId), c = n.amount < 0, l = a.flatMap((e) => {
			let t = F.requireById(e.accountId);
			if (!t.active || !t.allowManualPosting || !["EXPENSE", "REVENUE"].includes(t.type)) throw Error("Use an active manual expense/revenue account. Payments against AR/AP must be matched to their source documents.");
			let n = ue(e.taxCode), i = Qs(e.amount / (1 + n)), a = Qs(e.amount - i);
			return [{
				accountId: t.id,
				debit: c ? i : 0,
				credit: c ? 0 : i
			}, ...a ? [{
				accountId: (c ? r(e.taxCode).taxPaidAccountId : r(e.taxCode).taxCollectedAccountId) || F.requireBySystemRole(c ? "GST_RECEIVABLE" : "GST_PAYABLE").id,
				debit: c ? a : 0,
				credit: c ? 0 : a
			}] : []];
		}), u = I.post({
			journalDate: n.date,
			description: n.description,
			reference: n.reference,
			sourceType: "BANK_STATEMENT",
			sourceId: n.id + ":" + n.history.filter((e) => e.action === "Posted").length,
			lines: [{
				accountId: o.glAccountId,
				debit: c ? 0 : n.amount,
				credit: c ? -n.amount : 0
			}, ...l]
		}), d = u.lines.filter((e) => e.accountId === o.glAccountId).map((e) => u.id + ":" + e.id);
		return sc({
			...n,
			status: "POSTED",
			journalEntryId: u.id,
			ledgerIds: d,
			fingerprint: i,
			history: [...n.history, {
				action: "Posted",
				date: (/* @__PURE__ */ new Date()).toISOString()
			}]
		});
	},
	ignore(e) {
		let t = ac(e.id);
		if (oc(t), e.reason?.trim().length < 3) throw Error("Enter an exclusion reason.");
		return sc({
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
		A();
		let t = ac(e.id);
		if (w(e.reversalDate, "Reversal date"), e.reason?.trim().length < 3 || e.reversalDate < t.date) throw Error("Enter a reason and a reversal date on or after the statement line.");
		if (t.status === "UNMATCHED") throw Error("Line is already unmatched.");
		let n = Fn.getLatestByBankAccount(t.bankAccountId);
		if (n && t.date <= n.statementDate) throw Error("Reconciled statement lines cannot be reverted.");
		if (t.status === "POSTED" && uc(t.id), t.status === "POSTED" && e.reversalDate !== t.date) throw Error("Categorisation correction must reverse on the original statement date in an open period. It does not reverse an external payment.");
		if (t.status === "POSTED") for (let e of t.ledgerIds) Us(e.split(":")[0]);
		return t.status === "POSTED" && t.journalEntryId && I.reverse({
			journalEntryId: t.journalEntryId,
			reversalDate: e.reversalDate,
			reason: e.reason
		}), sc({
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
		if (St(e.statementDate), A(), w(e.statementDate, "Statement date"), !ec.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate)) throw Error("Import the statement first.");
		if (ec.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate && t.status === "UNMATCHED")) throw Error("Process every statement line before completing reconciliation.");
		let t = ec.filter((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate), n = cc(e.bankAccountId, e.statementDate), r = I.getAll(), i = new Map(r.map((e) => [e.id, e]));
		for (let a of t.filter((e) => e.status === "MATCHED" || e.status === "POSTED")) {
			if (a.ledgerIds.some((t) => Ge(Fn.getAll(), e.bankAccountId, t, a.date))) throw Error("Statement match reuses a ledger row already cleared in an earlier statement. Unmatch this unreconciled line and select its genuine source.");
			let t = a.ledgerIds.map((e) => n.find((t) => t.id === e));
			if (!t.length || t.some((e) => !e || !ce(i.get(e.journalEntryId), r, a.date) || e.correctionOnly || e.correctionIssue) || Qs(t.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== a.amount) throw Error("Statement match is stale. Revert the statement line and review its ledger sources before reconciling.");
		}
		let a = t.flatMap((e) => e.ledgerIds);
		return Fn.complete({
			...e,
			clearedTransactionIds: [.../* @__PURE__ */ new Set([...Fn.getClearedTransactionIds(e.bankAccountId), ...a])]
		});
	}
}, pc = e({
	id: $s,
	key: E(),
	bankAccountId: $s,
	date: $s,
	description: E(),
	reference: E(),
	amount: f().finite(),
	externalId: E(),
	payee: E().max(500).optional(),
	status: T([
		"UNMATCHED",
		"MATCHED",
		"POSTED",
		"IGNORED"
	]),
	ledgerIds: s($s),
	journalEntryId: E().optional(),
	fingerprint: E().optional(),
	history: s(e({
		action: E(),
		date: E(),
		reason: E().optional()
	}))
}).strict();
i("bankStatements", {
	repository: fc,
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
	snapshot: () => ({ lines: ec }),
	restore: (e) => {
		ec = e.lines;
	},
	validate: (t, n) => {
		let r = e({ lines: s(pc) }).strict().parse(t), i = n, a = i.bankAccounts.bankAccounts, o = i.journals.journalEntries, c = /* @__PURE__ */ new Set(), l = new Map(o.map((e) => [e.id, e])), u = new Map(o.flatMap((e) => e.lines.map((t) => [e.id + ":" + t.id, {
			journal: e,
			entry: t
		}])));
		if (new Set(r.lines.map((e) => e.key)).size !== r.lines.length) throw Error("Duplicate bank statement import key.");
		for (let t of r.lines) {
			let n = a.find((e) => e.id === t.bankAccountId);
			if (!n) throw Error("Bank statement account is missing.");
			try {
				w(t.date), dc.parse({
					date: t.date,
					description: t.description,
					amount: t.amount,
					reference: t.reference,
					externalId: t.externalId
				});
			} catch {
				throw Error("Invalid bank statement date, amount or metadata.");
			}
			let r = JSON.stringify([t.bankAccountId, t.externalId || [
				t.date,
				t.amount,
				t.description.trim().toLowerCase(),
				t.reference.trim().toLowerCase(),
				...t.payee ? [t.payee.trim().toLowerCase()] : []
			]]);
			if (t.key !== r) throw Error("Bank statement import identity does not match its data.");
			let i;
			for (let e of t.history) {
				if (!Number.isFinite(Date.parse(e.date))) throw Error("Invalid bank statement history date.");
				if (!i && e.action === "Imported") i = "UNMATCHED";
				else if (i === "UNMATCHED" && [
					"Matched",
					"Posted",
					"Excluded"
				].includes(e.action)) {
					if (e.action === "Excluded" && (e.reason?.trim().length ?? 0) < 3) throw Error("Bank statement exclusion has no reason.");
					i = e.action === "Matched" ? "MATCHED" : e.action === "Posted" ? "POSTED" : "IGNORED";
				} else if (i && i !== "UNMATCHED" && e.action === "Reverted" && (e.reason?.trim().length ?? 0) >= 3) i = "UNMATCHED";
				else throw Error("Invalid bank statement lifecycle history.");
			}
			if (i !== t.status) throw Error("Bank statement status does not match its history.");
			if (t.status === "UNMATCHED" || t.status === "IGNORED") {
				if (t.ledgerIds.length || t.journalEntryId || t.fingerprint) throw Error("An unposted bank statement line cannot retain ledger links.");
				continue;
			}
			if (!t.ledgerIds.length || new Set(t.ledgerIds).size !== t.ledgerIds.length) throw Error("Bank statement ledger links are missing or duplicated.");
			let o = 0;
			for (let e of t.ledgerIds) {
				let r = u.get(e), i = r?.journal, a = r?.entry;
				if (c.has(e) || !i || !a || a.accountId !== n.glAccountId || i.journalDate > t.date) throw Error("Bank statement ledger source is invalid or reused.");
				c.add(e), o = Qs(o + a.debit - a.credit);
			}
			if (o !== t.amount) throw Error("Bank statement amount does not match its ledger links.");
			if (t.status === "MATCHED") {
				if (t.journalEntryId || t.fingerprint) throw Error("Matched bank statements cannot claim categorisation journals.");
			} else {
				let r = l.get(t.journalEntryId ?? ""), i = t.history.filter((e) => e.action === "Posted").length - 1, a = r?.lines.filter((e) => e.accountId === n.glAccountId).map((e) => r.id + ":" + e.id).sort();
				if (!r || r.status !== "POSTED" || r.sourceType !== "BANK_STATEMENT" || r.sourceId !== t.id + ":" + i || r.journalDate !== t.date || JSON.stringify(a) !== JSON.stringify([...t.ledgerIds].sort())) throw Error("Bank statement categorisation journal does not match its source.");
				try {
					if (Qs(s(e({
						accountId: $s,
						amount: f().finite().positive().refine((e) => Qs(e) === e),
						taxCode: $s
					}).strict()).min(1).max(100).parse(JSON.parse(t.fingerprint ?? "")).reduce((e, t) => e + t.amount, 0)) !== Math.abs(t.amount)) throw Error("Wrong split total.");
				} catch {
					throw Error("Bank statement categorisation fingerprint is invalid.");
				}
			}
		}
	},
	publish: rc
});
//#endregion
//#region src/features/security/trustedAuthorization.ts
var mc = null, G = {
	connect(e) {
		return mc = e, () => {
			mc === e && (mc = null);
		};
	},
	disconnect() {
		mc = null;
	},
	current() {
		return mc?.() ?? null;
	},
	require(e) {
		return v(this.current(), e);
	}
}, hc = [], gc = () => hc, _c = (e) => {
	hc = e;
}, vc = E().trim().min(1).max(200), yc = E().regex(/^[a-f0-9]{64}$/), bc = E().trim().min(3).max(2e3), xc = (e) => Array.isArray(e) ? e.map(xc) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, xc(e[t])])) : e, Sc = (e) => Oe("sha256").update(JSON.stringify(xc(e))).digest("hex"), Cc = /* @__PURE__ */ new Map();
function wc(e, t) {
	let n = t.bankStatements.lines.find((t) => t.id === e);
	if (!n) throw Error("Statement line not found.");
	let r = {
		lineId: e,
		description: n.description,
		date: n.date,
		amount: n.amount,
		lineToken: Sc(n),
		status: "No match",
		reason: "No enabled rule matches."
	};
	if (n.status !== "UNMATCHED") return {
		...r,
		status: "Blocked",
		reason: "Only unmatched statement lines can be classified."
	};
	let i = t.workspace_bank_rules.records.filter((e) => e.status === "Active" && e.enabled !== "No" && Ne(e, n));
	if (!i.length) return r;
	let a = Math.min(...i.map((e) => Number(e.priority ?? 100))), o = i.filter((e) => Number(e.priority ?? 100) === a);
	if (o.length !== 1) return {
		...r,
		status: "Conflict",
		reason: `Priority ${a} has multiple matches: ${o.map((e) => e.name).join(", ")}. Resolve the rules before classification.`
	};
	let s = o[0], c = {
		...r,
		ruleId: s.id,
		ruleName: s.name,
		accountId: s.accountId,
		taxCode: s.taxCode,
		ruleToken: Sc(s)
	}, l = t.bankAccounts.bankAccounts.find((e) => e.id === n.bankAccountId), u = t.accounts.accounts.find((e) => e.id === s.accountId), d = t.workspace_tax_codes.records.find((e) => e.code === s.taxCode && e.status === "Active"), f = (e) => ({
		...c,
		status: "Blocked",
		reason: e
	});
	if (!l?.active || !t.accounts.accounts.some((e) => e.id === l.glAccountId && e.active) || n.date < l.openingBalanceDate) return f("The bank or bank GL is inactive, or the statement predates its opening.");
	if (!u?.active || !u.allowManualPosting || !["EXPENSE", "REVENUE"].includes(u.type) || t.bankAccounts.bankAccounts.some((e) => e.glAccountId === u.id)) return f("Use an active manual expense or revenue account. AR/AP, transfers and control accounts require their source workflow.");
	if (!d) return f("The tax code is inactive or missing.");
	if (Number(d.rate) > 0 && !t.accounts.accounts.some((e) => e.id === (n.amount < 0 ? d.paid : d.collected) && e.active && e.type === (n.amount < 0 ? "ASSET" : "LIABILITY"))) return f("The tax posting account is inactive or invalid.");
	if (t.bankReconciliations.reconciliations.some((e) => e.bankAccountId === n.bankAccountId && e.statementDate >= n.date)) return f("The statement date is already reconciled.");
	try {
		St(n.date), A();
	} catch (e) {
		return f(e.message);
	}
	return t.journals.journalEntries.filter((e) => e.status === "POSTED" && e.journalDate <= n.date).some((e) => e.lines.some((e) => e.accountId === l.glAccountId && Math.round((e.debit - e.credit) * 100) === Math.round(n.amount * 100))) ? f("An equal signed bank ledger entry exists. Review and match its genuine source before categorising.") : {
		...c,
		status: "Ready",
		reason: "Unique highest-priority rule; review the saved categorisation before posting."
	};
}
var Tc = (e) => ({
	operationId: e.operationId,
	action: e.action,
	actorId: e.actorId,
	at: e.at,
	reason: e.reason,
	previewDigest: e.previewDigest,
	automatic: e.automatic
});
function Ec(e, t, n, r, i) {
	let a = G.require("banking.write"), o = (/* @__PURE__ */ new Date()).toISOString(), s = {
		operationId: e,
		action: "Applied",
		actorId: a.userId,
		at: o,
		reason: r,
		previewDigest: n,
		automatic: i
	}, c = Sc({
		...s,
		decisions: t
	}), l = t.map((e) => ({
		id: ke(),
		...s,
		fingerprint: c,
		decision: e
	}));
	return _c([...gc(), ...l]), structuredClone(l);
}
function Dc(e, t, n, r) {
	let i = G.require("banking.write"), a = gc().filter((t) => t.operationId === e);
	if (a.length && (a[0].actorId !== i.userId || a[0].previewDigest !== t || a[0].reason !== n || a[0].action !== r)) throw Error("Operation ID has different bank-rule data.");
	return a.length ? structuredClone(a) : void 0;
}
function Oc(e, n) {
	G.require("banking.write");
	let r = t(), i = e.map((e) => wc(e, r)).filter((e) => e.status === "Ready" && r.workspace_bank_rules.records.some((t) => t.id === e.ruleId && t.automatic === "Yes"));
	i.length && Ec("auto-rule:" + n, i, Sc(r), "Automatic classification of newly imported statement lines", !0);
}
var kc = {
	preview(n) {
		let r = G.require("banking.read"), i = e({ lineIds: s(vc).min(1).max(100) }).strict().parse(n);
		if (new Set(i.lineIds).size !== i.lineIds.length) throw Error("Select each line once.");
		let a = t(), o = i.lineIds.map((e) => wc(e, a)), c = Sc({
			nonce: ke(),
			actor: r.userId,
			snapshot: a,
			rows: o
		}), l = Date.now() + 3e5;
		for (let [e, t] of Cc) t.expires < Date.now() && Cc.delete(e);
		return Cc.size >= 100 && Cc.delete(Cc.keys().next().value), Cc.set(c, {
			actor: r.userId,
			expires: l,
			snapshot: Sc(a),
			rows: o
		}), {
			digest: c,
			expiresAt: new Date(l).toISOString(),
			rows: o
		};
	},
	apply(n) {
		let r = G.require("banking.write"), i = e({
			operationId: vc,
			expectedDigest: yc,
			reason: bc
		}).strict().parse(n), a = Dc(i.operationId, i.expectedDigest, i.reason, "Applied");
		if (a) return a;
		let o = Cc.get(i.expectedDigest), s = t();
		if (!o || o.actor !== r.userId || o.expires < Date.now() || o.snapshot !== Sc(s)) throw Error("Rule preview expired or business data changed. Preview again.");
		let c = o.rows.map((e) => wc(e.lineId, s));
		if (c.some((e) => e.status !== "Ready")) throw Error("Every selected line must have a unique eligible classification.");
		if (c.some((e) => {
			let t = gc().findLast((t) => t.decision.lineId === e.lineId);
			return t?.action === "Applied" && t.decision.lineToken === e.lineToken;
		})) throw Error("A saved classification already exists. Withdraw it before replacing it.");
		return Ec(i.operationId, c, i.expectedDigest, i.reason, !1);
	},
	current(n) {
		G.require("banking.read");
		let r = e({ lineId: vc }).strict().parse(n), i = gc().findLast((e) => e.decision.lineId === r.lineId);
		if (!i || i.action !== "Applied") return null;
		let a = wc(r.lineId, t());
		return a.status === "Ready" && Sc(a) === Sc(i.decision) ? structuredClone(a) : null;
	},
	post(n) {
		G.require("banking.write");
		let r = e({ receiptId: vc }).strict().parse(n), i = gc().find((e) => e.id === r.receiptId);
		if (!i || i.action !== "Applied" || gc().findLast((e) => e.decision.lineId === i.decision.lineId)?.id !== i.id) throw Error("Saved classification changed. Review again.");
		let a = t().bankStatements.lines.find((e) => e.id === i.decision.lineId);
		if (!a) throw Error("Statement line not found.");
		let o = [{
			accountId: i.decision.accountId,
			amount: Math.abs(i.decision.amount),
			taxCode: i.decision.taxCode
		}];
		if (a.status !== "POSTED" && !kc.current({ lineId: a.id })) throw Error("Saved classification is stale or blocked. Review the source and rule before posting.");
		return fc.post({
			id: a.id,
			splits: o
		});
	},
	withdraw(n) {
		let r = G.require("banking.write"), i = e({
			operationId: vc,
			receiptId: vc,
			reason: bc
		}).strict().parse(n), a = Dc(i.operationId, Sc({ receiptId: i.receiptId }), i.reason, "Withdrawn");
		if (a) return a;
		let o = gc().find((e) => e.id === i.receiptId);
		if (!o || gc().findLast((e) => e.decision.lineId === o.decision.lineId)?.id !== o.id || o.action !== "Applied") throw Error("Classification changed. Refresh first.");
		let s = t().bankStatements.lines.find((e) => e.id === o.decision.lineId);
		if (!s || s.status !== "UNMATCHED") throw Error("Processed lines use their normal unmatch or reversal workflow.");
		let c = {
			operationId: i.operationId,
			action: "Withdrawn",
			actorId: r.userId,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			reason: i.reason,
			previewDigest: Sc({ receiptId: i.receiptId }),
			automatic: !1
		}, l = {
			id: ke(),
			...c,
			decision: o.decision,
			fingerprint: Sc({
				...c,
				decisions: [o.decision]
			})
		};
		return _c([...gc(), l]), [structuredClone(l)];
	}
}, Ac = e({
	lineId: vc,
	description: E().min(1).max(1e3),
	date: vc,
	amount: f().finite(),
	status: b("Ready"),
	ruleId: vc,
	ruleName: vc,
	accountId: vc,
	taxCode: vc,
	reason: E().min(1).max(2e3),
	lineToken: yc,
	ruleToken: yc
}).strict(), jc = e({
	id: de(),
	operationId: vc,
	fingerprint: yc,
	action: T(["Applied", "Withdrawn"]),
	actorId: vc,
	at: je(),
	reason: bc,
	previewDigest: yc,
	automatic: y(),
	decision: Ac
}).strict();
i("bankRuleApplications", {
	repository: kc,
	read: "banking.read",
	commands: {
		preview: "banking.read",
		apply: "banking.write",
		withdraw: "banking.write",
		current: "banking.read",
		post: "banking.write"
	},
	snapshot: () => ({ receipts: gc() }),
	restore: (e) => _c(e.receipts),
	publish: () => {},
	validate: (t, n) => {
		let { receipts: r } = e({ receipts: s(jc) }).strict().parse(t), i = n, a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
		for (let e of r) {
			let t = i.bankStatements.lines.find((t) => t.id === e.decision.lineId), n = o.get(e.decision.lineId);
			if (!t || t.date !== e.decision.date || t.amount !== e.decision.amount || t.description !== e.decision.description || !i.accounts.accounts.some((t) => t.id === e.decision.accountId) || !i.workspace_bank_rules.records.some((t) => t.id === e.decision.ruleId) || !i.workspace_tax_codes.records.some((t) => t.code === e.decision.taxCode)) throw Error("Invalid saved bank-rule source or action references.");
			if (e.action === "Withdrawn" && (!n || n.action !== "Applied" || Sc(n.decision) !== Sc(e.decision) || e.previewDigest !== Sc({ receiptId: n.id }) || e.automatic)) throw Error("Invalid bank-rule withdrawal lifecycle.");
			if (e.action === "Applied" && n?.action === "Applied" && n.decision.lineToken === e.decision.lineToken) throw Error("Duplicate saved bank classification.");
			o.set(e.decision.lineId, e), a.set(e.operationId, [...a.get(e.operationId) ?? [], e]);
		}
		for (let e of a.values()) {
			let t = e[0];
			if (e.some((e) => Sc(Tc(e)) !== Sc(Tc(t)) || e.fingerprint !== t.fingerprint) || new Set(e.map((e) => e.decision.lineId)).size !== e.length || Sc({
				...Tc(t),
				decisions: e.map((e) => e.decision)
			}) !== t.fingerprint) throw Error("Invalid bank-rule batch receipt.");
		}
	}
});
//#endregion
//#region src/features/recurring/recurringDates.ts
var Mc = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
];
function Nc(e, t, n) {
	if (w(e), !Number.isSafeInteger(n) || n < 0 || !Mc.includes(t)) throw Error("Invalid schedule occurrence.");
	let r = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	if (t === "Weekly" || t === "Fortnightly") r.setUTCDate(r.getUTCDate() + n * (t === "Weekly" ? 7 : 14));
	else {
		let e = r.getUTCDate();
		r.setUTCDate(1), r.setUTCMonth(r.getUTCMonth() + n * (t === "Monthly" ? 1 : 3));
		let i = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
		r.setUTCDate(Math.min(e, i));
	}
	let i = r.toISOString().slice(0, 10);
	return w(i), i;
}
function Pc(e, t) {
	w(e);
	let n = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	n.setUTCDate(n.getUTCDate() + t);
	let r = n.toISOString().slice(0, 10);
	return w(r), r;
}
//#endregion
//#region src/features/direct-documents/managedDocumentRepository.ts
var K = E().trim().min(1).max(200), Fc = E().trim().max(2e3).optional(), Ic = e({
	requestedArea: f().finite().positive().max(1e9).optional(),
	productId: K,
	unitId: K,
	quantity: f().positive().finite(),
	unitPrice: f().nonnegative().finite().optional(),
	priceBasis: T(["Inclusive", "Exclusive"]).optional()
}).strict(), Lc = e({
	description: E().trim().min(1).max(500),
	accountId: K,
	quantity: f().positive().finite(),
	unitCost: f().nonnegative().finite(),
	taxCode: K,
	priceBasis: T(["Inclusive", "Exclusive"]).optional()
}).strict(), Rc = e({
	kind: T(["ORDER", "INVOICE"]),
	customerId: K,
	pricingAt: K.optional(),
	pricingTimezone: K.optional(),
	locationId: K.or(b("")).optional(),
	accountingContactId: K.or(b("")).optional(),
	documentDate: K,
	dueDate: K.optional(),
	customerReference: Fc,
	notes: Fc,
	lines: s(Ic).min(1).max(500)
}).strict(), zc = e({
	kind: b("EXPENSE"),
	supplierId: K,
	supplierInvoiceNumber: K,
	documentDate: K,
	dueDate: K,
	notes: Fc,
	lines: s(Lc).min(1).max(500)
}).strict(), Bc = (e) => he([Rc, zc]).parse(e), Vc = f().finite().nonnegative().refine((e) => Number.isSafeInteger(Math.round(e * 100)) && e === Math.round(e * 100) / 100, "Use an amount in whole cents within the supported range."), Hc = e({
	operationId: K,
	sourceName: E().trim().max(200),
	reviewed: y(),
	declared: e({
		subtotal: Vc,
		taxAmount: Vc,
		total: Vc
	}).strict(),
	payload: zc.extend({ notes: E().trim().max(1e3).optional() })
}).strict();
function Uc(e) {
	return {
		...e.payload,
		notes: [
			e.payload.notes,
			`Reviewed source: ${e.sourceName || "Manual entry"}`,
			`Declared net / tax / total: ${e.declared.subtotal.toFixed(2)} / ${e.declared.taxAmount.toFixed(2)} / ${e.declared.total.toFixed(2)}`
		].filter(Boolean).join("\n")
	};
}
function Wc(e) {
	let t = Sa.getById(e.payload.supplierId);
	if (!t || t.status !== "ACTIVE") throw Error("Select an active supplier.");
	let n = nl(e.payload), r = e.payload.supplierInvoiceNumber.trim().toLowerCase(), i = ss.getAll(), a = new Set(i.filter((e) => e.status === "VOID").map((e) => e.id)), o = [...qc.filter((t) => t.operationId !== e.operationId && t.status !== "CANCELLED" && !(t.status === "POSTED" && t.documentId && a.has(t.documentId)) && t.payload.kind === "EXPENSE" && t.payload.supplierId === e.payload.supplierId && t.payload.supplierInvoiceNumber.trim().toLowerCase() === r).map((e) => ({
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
var Gc = () => F.getAll().filter((e) => e.active && e.type === "EXPENSE" && e.allowManualPosting && (!e.systemRole || e.systemRole === "OPERATING_EXPENSE" || e.systemRole === "FREIGHT")).map((e) => ({
	id: e.id,
	code: e.code,
	name: e.name
}));
Gc();
var Kc = [], qc = [], Jc = 0, Yc = /* @__PURE__ */ new Set(), Xc = () => {
	Jc++, Yc.forEach((e) => e());
}, Zc = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Qc(e, t) {
	return {
		action: e,
		actorId: G.current()?.userId ?? "local-test",
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...t ? { reason: t } : {}
	};
}
function $c(e) {
	for (let t of e) if (t.taxAmount) for (let [e, n] of [[t.taxCollectedAccountId, "LIABILITY"], [t.taxPaidAccountId, "ASSET"]]) {
		if (!e) continue;
		let t = F.requireById(e);
		if (!t.active || t.type !== n) throw Error("A snapshotted tax posting account is no longer active or has the wrong type.");
	}
}
function el(e) {
	let t = F.requireById(e);
	if (!t.active || t.type !== "EXPENSE" || !t.allowManualPosting || t.systemRole && t.systemRole !== "OPERATING_EXPENSE" && t.systemRole !== "FREIGHT") throw Error("Use an active manual expense account, not an inventory, GRNI or control account.");
	return t;
}
function tl(e) {
	let t = e.payload;
	if (t.kind === "EXPENSE") {
		let n = Sa.getById(t.supplierId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active supplier.");
		for (let t of e.lines) el(t.expenseAccountId);
	} else {
		let n = R.getById(t.customerId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active customer.");
		for (let t of e.lines) ei(t.productId, t.unitId, t.quantity, "sell");
	}
	$c(e.lines);
}
function nl(e) {
	if (w(e.documentDate, "Document date"), e.dueDate && (w(e.dueDate, "Due date"), e.dueDate < e.documentDate)) throw Error("Due date cannot precede document date.");
	if (e.kind !== "ORDER" && !e.dueDate) throw Error("Due date is required.");
	let t = e.kind === "EXPENSE" ? void 0 : zn(e.documentDate, e.pricingAt, e.pricingTimezone), n = e.kind === "EXPENSE" ? e.lines.map((e) => {
		el(e.accountId);
		let t = r(e.taxCode), n = De(e.unitCost, t.taxRate, e.priceBasis), i = Zc(e.quantity * n), a = (e.priceBasis ?? C().basis) === "Inclusive" ? Zc(e.quantity * e.unitCost - i) : Zc(i * t.taxRate);
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
			lineTotal: Zc(i + a)
		};
	}) : e.lines.map((n) => Ci({
		customerId: e.customerId,
		documentDate: e.documentDate,
		pricingContext: t,
		draft: n
	})), i = Si(n);
	if (i.total <= 0 || !Number.isFinite(i.total)) throw Error("Document total must be finite and greater than zero.");
	return {
		lines: n,
		totals: i
	};
}
function rl(t) {
	let n = () => t === "sales" ? Kc : qc;
	function r(e) {
		return t === "sales" ? Kc = [...Kc.filter((t) => t.id !== e.id), e] : qc = [...qc.filter((t) => t.id !== e.id), e], Xc(), e;
	}
	let i = (e) => {
		let t = n().find((t) => t.id === e);
		if (!t || _e(t.id)) throw Error("Draft not found or is in the recycle bin.");
		return t;
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
			history: [...e.history, Qc(t, i)]
		});
	}
	let s = (e, t) => al.save({
		operationId: e,
		payload: t
	});
	return {
		getAll: () => le(n()),
		reviewCapture(e) {
			if (G.require("purchases.bill"), t !== "expense") throw Error("Capture is only available for expense bills.");
			return Wc(Hc.parse(e));
		},
		capture(e) {
			if (G.require("purchases.bill"), t !== "expense") throw Error("Capture is only available for expense bills.");
			let r = Hc.parse(e);
			if (!r.reviewed) throw Error("Confirm that the supplier document has been reviewed.");
			let i = Uc(r);
			if (n().find((e) => e.operationId === r.operationId)) return s(r.operationId, i);
			let a = Wc(r);
			if (!a.matches) throw Error(a.issues.join(" "));
			return s(r.operationId, i);
		},
		save(o) {
			let s = e({
				operationId: K,
				id: K.optional(),
				expectedRevision: f().int().positive().optional(),
				payload: t === "sales" ? Rc : zc
			}).strict().parse(o), c = JSON.stringify(s.payload);
			if (ie(s.operationId)) throw Error("This creation request belongs to a permanently purged draft. Use a new operation ID.");
			if (!s.id) {
				let e = n().find((e) => e.operationId === s.operationId);
				if (e) {
					if (_e(e.id)) throw Error("Recover the existing draft from the recycle bin.");
					if (e.creationFingerprint !== c) throw Error("Operation ID was used for different draft data.");
					return e;
				}
			}
			let l = s.id ? i(s.id) : void 0;
			if (l && (a(l, s.expectedRevision ?? -1), l.status !== "DRAFT")) throw Error("Only unapproved drafts can be edited. Reopen an approved draft before editing.");
			if (s.payload.kind !== "EXPENSE") {
				let e = l?.payload.kind === "EXPENSE" ? void 0 : l?.payload, t = e && e.documentDate === s.payload.documentDate && (!s.payload.pricingAt || s.payload.pricingAt === e.pricingAt), n = zn(s.payload.documentDate, s.payload.pricingAt ?? (t ? e.pricingAt : void 0), t ? e.pricingTimezone : C().timezone);
				s.payload = {
					...s.payload,
					...n
				};
			}
			let u = nl(s.payload), d = (/* @__PURE__ */ new Date()).toISOString(), p = {
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
				recipient: s.payload.kind === "EXPENSE" ? void 0 : gr(s.payload.customerId, s.payload),
				...u,
				createdAt: l?.createdAt ?? d,
				updatedAt: d,
				history: [...l?.history ?? [], Qc(l ? "Edited" : "Created")]
			};
			if (l && l.kind !== p.kind) throw Error("Document kind cannot change.");
			return tl(p), r(p);
		},
		approve(e, t) {
			let n = i(e);
			if (n.status === "APPROVED" && n.revision === t + 1) return n;
			if (a(n, t), n.status !== "DRAFT") throw Error("Only a draft can be approved.");
			return tl(n), o(n, "Approved", { status: "APPROVED" });
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
			A(), St(n.payload.documentDate), tl(n);
			let r, s = n.payload;
			if (s.kind === "EXPENSE") {
				let e = Sa.getById(s.supplierId), t = (/* @__PURE__ */ new Date()).toISOString(), i = {
					id: crypto.randomUUID(),
					managedDraftId: n.id,
					kind: "EXPENSE",
					billNumber: we("BILL", ss.getAll().map((e) => e.billNumber), s.documentDate.slice(0, 4)),
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
				ss.insertExpenseBill(i);
				let a = i.lines.filter((e) => e.lineSubtotal !== 0).map((e) => ({
					accountId: e.expenseAccountId,
					description: e.description,
					debit: e.lineSubtotal,
					credit: 0
				}));
				I.post({
					journalDate: i.billDate,
					description: "Expense bill " + i.billNumber,
					reference: i.supplierInvoiceNumber,
					sourceType: "SUPPLIER_BILL",
					sourceId: i.id,
					lines: [
						...a,
						...Ni(i.lines, "paid", !0, i.totals.taxAmount),
						{
							accountId: F.requireBySystemRole("ACCOUNTS_PAYABLE").id,
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
				r = s.kind === "ORDER" ? B.createManagedOrder(e).id : B.createManagedInvoice({
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
			return B.cancelManagedOrder(n.documentId, t), o(n, "Order cancelled", {}, t);
		}
	};
}
var il = rl("sales"), al = rl("expense"), ol = e({
	recipient: e({
		locationId: E().optional(),
		locationName: E().optional(),
		deliveryAddress: E().optional(),
		accountingContactId: E().optional(),
		accountingContactName: E().optional(),
		accountingEmail: E().email().optional()
	}).strict().optional(),
	id: K,
	operationId: K,
	creationFingerprint: E().max(1e6),
	revision: f().int().positive(),
	kind: T([
		"ORDER",
		"INVOICE",
		"EXPENSE"
	]),
	status: T([
		"DRAFT",
		"APPROVED",
		"POSTED",
		"CANCELLED"
	]),
	payload: he([Rc, zc]),
	lines: s(e({
		id: K,
		description: E().min(1),
		quantity: f().finite().positive(),
		unitSymbol: E().min(1),
		unitPrice: f().finite().nonnegative().optional(),
		unitCost: f().finite().nonnegative().optional(),
		taxRate: f().finite().min(0).max(1),
		taxCode: K,
		taxPaidAccountId: K.optional(),
		taxCollectedAccountId: K.optional(),
		lineSubtotal: f().finite().nonnegative(),
		taxAmount: f().finite().nonnegative(),
		lineTotal: f().finite().nonnegative()
	}).passthrough()).min(1),
	totals: e({
		subtotal: f().finite(),
		taxAmount: f().finite(),
		total: f().finite()
	}),
	documentId: K.optional(),
	createdAt: K,
	updatedAt: K,
	history: s(e({
		action: K,
		actorId: K,
		at: K,
		reason: E().optional()
	}).strict()).min(1)
}).strict();
for (let t of ["sales", "expense"]) i(t === "sales" ? "managedSalesDocuments" : "expenseBillDrafts", {
	repository: t === "sales" ? il : al,
	read: t === "sales" ? "sales.read" : "purchases.read",
	commands: {
		reviewCapture: t === "expense" ? "purchases.bill" : null,
		capture: t === "expense" ? "purchases.bill" : null,
		save: t === "sales" ? "sales.manage" : "purchases.bill",
		approve: t === "sales" ? "sales.manage" : "accounting.post",
		reopen: t === "sales" ? "sales.manage" : "accounting.post",
		cancel: t === "sales" ? "sales.manage" : "purchases.bill",
		post: t === "sales" ? "sales.manage" : "purchases.bill",
		cancelOrder: t === "sales" ? "sales.manage" : null
	},
	snapshot: () => t === "sales" ? { drafts: Kc } : {
		drafts: qc,
		options: Gc()
	},
	restore: (e) => {
		t === "sales" ? Kc = e.drafts : (qc = e.drafts, e.options);
	},
	publish: Xc,
	validate: (n, r) => {
		let { drafts: i } = e({
			drafts: s(ol),
			...t === "expense" ? { options: s(e({
				id: K,
				code: K,
				name: K
			}).strict()) } : {}
		}).strict().parse(n);
		for (let e of i) {
			if (_r(e.recipient), e.kind !== e.payload.kind || t === "expense" != (e.kind === "EXPENSE")) throw Error("Draft kind mismatch.");
			if (w(e.payload.documentDate), e.payload.dueDate && (w(e.payload.dueDate), e.payload.dueDate < e.payload.documentDate)) throw Error("Draft due date is invalid.");
			let n = r, i = e.payload.kind === "EXPENSE" ? e.payload.supplierId : e.payload.customerId;
			if (!(e.payload.kind === "EXPENSE" ? n.suppliers.suppliers : n.customers.customers).some((e) => e.id === i) || e.lines.length !== e.payload.lines.length) throw Error("Draft party or line references are invalid.");
			for (let [t, r] of e.lines.entries()) {
				let i = e.payload.lines[t], a = r;
				if (e.kind !== "EXPENSE") {
					if (Yn(a), Bn(a, e.payload.documentDate), e.payload.kind !== "EXPENSE" && (e.payload.pricingAt !== a.pricingAt || e.payload.pricingTimezone !== a.pricingTimezone)) throw Error("Draft pricing context mismatch.");
					if (Un(a, n.products.products.find((e) => e.id === a.productId)), a.requestedArea !== i.requestedArea) throw Error("Draft area requirement mismatch.");
				}
				if (typeof a.quantity != "number" || !Number.isFinite(a.quantity) || a.quantity <= 0 || i.requestedArea === void 0 && a.quantity !== i.quantity || Zc(a.lineSubtotal + a.taxAmount) !== a.lineTotal) throw Error("Draft line amounts are invalid.");
				if (e.kind === "EXPENSE") {
					if (typeof a.unitCost != "number") throw Error("Expense line unit cost is invalid.");
					if (a.expenseAccountId !== i.accountId || !n.accounts.accounts.some((e) => e.id === a.expenseAccountId && e.type === "EXPENSE")) throw Error("Draft expense account reference is invalid.");
				} else if (typeof a.unitPrice != "number" || a.productId !== i.productId || a.unitId !== i.unitId || !n.products.products.some((e) => e.id === a.productId && e.units.some((e) => e.id === a.unitId))) throw Error("Draft product/unit reference is invalid.");
				for (let [e, t] of [["taxPaidAccountId", "ASSET"], ["taxCollectedAccountId", "LIABILITY"]]) if (a[e] && !n.accounts.accounts.some((n) => n.id === a[e] && n.type === t)) throw Error("Draft tax account reference is invalid.");
			}
			for (let t of [
				"subtotal",
				"taxAmount",
				"total"
			]) {
				let n = t === "subtotal" ? "lineSubtotal" : t === "total" ? "lineTotal" : "taxAmount";
				if (Zc(e.lines.reduce((e, t) => e + t[n], 0)) !== e.totals[t]) throw Error("Draft totals do not match lines.");
			}
			if (e.status === "POSTED") {
				let t = r;
				if (!(e.kind === "EXPENSE" ? t.supplierBills.supplierBills : e.kind === "ORDER" ? t.sales.salesOrders : t.sales.invoices).some((t) => t.id === e.documentId && t.managedDraftId === e.id && t.totals.total === e.totals.total)) throw Error("Posted draft source reference is invalid.");
			}
		}
	}
});
function sl(e) {
	if ([...Kc, ...qc].some((t) => e.has(t.id) && (t.status !== "DRAFT" || t.documentId))) throw Error("Only unposted drafts may be purged.");
	Kc = Kc.filter((t) => !e.has(t.id)), qc = qc.filter((t) => !e.has(t.id)), Xc();
}
//#endregion
//#region src/features/recurring/recurringRepository.ts
var cl = E().trim().min(1).max(200), ll = E().refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), ul = e({
	operationId: cl,
	name: cl,
	sourceDraftId: cl,
	frequency: T(Mc),
	firstDate: ll,
	endDate: ll
}).strict(), dl = e({
	id: cl,
	expectedRevision: f().int().positive(),
	name: cl,
	endDate: ll
}).strict(), fl = E().refine((e) => Number.isFinite(Date.parse(e)), "Invalid timestamp."), pl = e({
	id: cl,
	name: cl,
	kind: T(["INVOICE", "EXPENSE"]),
	status: T([
		"Active",
		"Paused",
		"Ended"
	]),
	revision: f().int().positive(),
	operationId: cl,
	creationFingerprint: E().min(1).max(2e3),
	sourceDraftId: cl,
	payload: ye(),
	frequency: T(Mc),
	firstDate: ll,
	nextDate: ll,
	endDate: ll,
	occurrence: f().int().nonnegative(),
	termsDays: f().int().nonnegative(),
	createdAt: fl,
	updatedAt: fl
}).strict(), ml = e({
	id: cl,
	scheduleId: cl,
	date: ll,
	draftId: cl,
	actorId: cl,
	createdAt: fl
}).strict(), hl = 0, gl = /* @__PURE__ */ new Set(), _l = () => {
	hl++, gl.forEach((e) => e());
}, vl = {
	INVOICE: {
		schedules: [],
		runs: []
	},
	EXPENSE: {
		schedules: [],
		runs: []
	}
}, yl = (e) => e === "INVOICE" ? "sales.manage" : "purchases.bill", bl = (e) => e === "INVOICE" ? il : al, xl = () => (/* @__PURE__ */ new Date()).toISOString();
function Sl(e) {
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
function Cl(t) {
	let n = () => vl[t], r = (e) => {
		let t = n().schedules.find((t) => t.id === e);
		if (!t) throw Error("Recurring schedule not found.");
		return t;
	}, i = (e, t) => {
		if (e.revision !== t) throw Error("Schedule changed. Reload before continuing.");
	};
	return {
		getAll: () => n().schedules,
		getRuns: () => n().runs,
		create(e) {
			G.require(yl(t));
			let r = ul.parse(e), i = JSON.stringify(r), a = n().schedules.find((e) => e.operationId === r.operationId);
			if (a) {
				if (a.creationFingerprint !== i) throw Error("Operation ID was used for a different recurring template.");
				return a;
			}
			let o = bl(t).getAll().find((e) => e.id === r.sourceDraftId);
			if (!o || o.kind !== t || o.status === "CANCELLED") throw Error("Select an existing invoice or expense entry draft of the correct type.");
			if (r.endDate < r.firstDate) throw Error("End date must not precede first generation date.");
			let s = Sl(o), c = Math.round((Date.parse(s.dueDate + "T00:00:00Z") - Date.parse(s.documentDate + "T00:00:00Z")) / 864e5), l = xl(), u = {
				...r,
				id: crypto.randomUUID(),
				kind: t,
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
			return n().schedules = [...n().schedules, u], _l(), u;
		},
		update(e) {
			G.require(yl(t));
			let a = dl.parse(e), o = r(a.id);
			if (i(o, a.expectedRevision), a.endDate < o.firstDate || o.occurrence && a.endDate < n().runs.filter((e) => e.scheduleId === o.id).map((e) => e.date).sort().at(-1)) throw Error("End date cannot precede the schedule start or its last generated occurrence.");
			let s = {
				...o,
				name: a.name,
				endDate: a.endDate,
				status: o.nextDate > a.endDate ? "Ended" : o.status === "Ended" ? "Paused" : o.status,
				revision: o.revision + 1,
				updatedAt: xl()
			};
			return n().schedules = n().schedules.map((e) => e.id === o.id ? s : e), _l(), s;
		},
		setStatus(a) {
			G.require(yl(t));
			let o = e({
				id: cl,
				expectedRevision: f().int().positive(),
				status: T(["Active", "Paused"])
			}).strict().parse(a), s = r(o.id);
			if (i(s, o.expectedRevision), s.nextDate > s.endDate) throw Error("Extend the end date before resuming this ended schedule.");
			let c = {
				...s,
				status: o.status,
				revision: s.revision + 1,
				updatedAt: xl()
			};
			return n().schedules = n().schedules.map((e) => e.id === s.id ? c : e), _l(), c;
		},
		generate(a) {
			G.require(yl(t));
			let o = e({
				id: cl,
				expectedRevision: f().int().positive(),
				date: ll
			}).strict().parse(a), s = r(o.id), c = n().runs.find((e) => e.scheduleId === s.id && e.date === o.date);
			if (c) return {
				schedule: s,
				run: c,
				draft: bl(t).getAll().find((e) => e.id === c.draftId)
			};
			if (i(s, o.expectedRevision), s.status !== "Active") throw Error("Activate the schedule before generating.");
			if (o.date !== s.nextDate) throw Error("Generate the next occurrence in order.");
			if (o.date > ve(xl())) throw Error("This occurrence is not due yet.");
			if (o.date > s.endDate) throw Error("The schedule has ended.");
			let l = Nc(s.firstDate, s.frequency, s.occurrence + 1), u = structuredClone(s.payload);
			u.documentDate = o.date, u.kind !== "EXPENSE" && (delete u.pricingAt, delete u.pricingTimezone), u.dueDate = Pc(o.date, s.termsDays), u.kind === "EXPENSE" && (u.supplierInvoiceNumber = u.supplierInvoiceNumber.slice(0, 170) + " [" + o.date + "]");
			let d = bl(t).save({
				operationId: "recurring:" + s.id + ":" + o.date,
				payload: u
			}), p = xl(), m = {
				id: crypto.randomUUID(),
				scheduleId: s.id,
				date: o.date,
				draftId: d.id,
				actorId: G.current().userId,
				createdAt: p
			}, h = {
				...s,
				nextDate: l,
				occurrence: s.occurrence + 1,
				status: l > s.endDate ? "Ended" : "Active",
				revision: s.revision + 1,
				updatedAt: p
			};
			return n().schedules = n().schedules.map((e) => e.id === s.id ? h : e), n().runs = [...n().runs, m], _l(), {
				schedule: h,
				run: m,
				draft: d
			};
		}
	};
}
var wl = Cl("INVOICE"), Tl = Cl("EXPENSE");
for (let t of ["INVOICE", "EXPENSE"]) i(t === "INVOICE" ? "recurringInvoices" : "recurringExpenses", {
	repository: t === "INVOICE" ? wl : Tl,
	read: t === "INVOICE" ? "sales.read" : "purchases.read",
	commands: {
		create: yl(t),
		update: yl(t),
		setStatus: yl(t),
		generate: yl(t)
	},
	snapshot: () => structuredClone(vl[t]),
	restore: (e) => {
		vl[t] = e;
	},
	publish: _l,
	validate: (n, r) => {
		e({
			schedules: s(pl),
			runs: s(ml)
		}).strict().parse(n);
		let i = n, a = r;
		for (let e of i.schedules) {
			if (e.kind !== t || ![
				"Active",
				"Paused",
				"Ended"
			].includes(e.status) || !Number.isSafeInteger(e.revision) || e.revision < 1 || !Number.isSafeInteger(e.occurrence) || e.occurrence < 0 || !Number.isInteger(e.termsDays) || e.termsDays < 0 || e.payload.kind !== t) throw Error("Invalid recurring schedule.");
			if (ul.parse({
				operationId: e.operationId,
				name: e.name,
				sourceDraftId: e.sourceDraftId,
				frequency: e.frequency,
				firstDate: e.firstDate,
				endDate: e.endDate
			}), Bc(e.payload), !e.id || !e.creationFingerprint || !Number.isFinite(Date.parse(e.createdAt)) || !Number.isFinite(Date.parse(e.updatedAt))) throw Error("Invalid recurring identity or audit timestamps.");
			if (w(e.payload.documentDate), w(e.payload.dueDate), e.payload.dueDate < e.payload.documentDate || e.termsDays !== Math.round((Date.parse(e.payload.dueDate + "T00:00:00Z") - Date.parse(e.payload.documentDate + "T00:00:00Z")) / 864e5)) throw Error("Invalid recurring payment terms.");
			if (e.payload.kind === "EXPENSE") {
				if (!a.suppliers.suppliers.some((t) => t.id === e.payload.supplierId) || e.payload.lines.some((e) => !a.accounts.accounts.some((t) => t.id === e.accountId && t.type === "EXPENSE"))) throw Error("Recurring expense references are invalid.");
			} else if (!a.customers.customers.some((t) => t.id === e.payload.customerId) || e.payload.lines.some((e) => !a.products.products.some((t) => t.id === e.productId && t.units.some((t) => t.id === e.unitId)))) throw Error("Recurring invoice references are invalid.");
			if (e.status === "Ended" != e.nextDate > e.endDate) throw Error("Recurring end status is inconsistent.");
			if (e.nextDate !== Nc(e.firstDate, e.frequency, e.occurrence) || e.endDate < e.firstDate) throw Error("Invalid recurring dates.");
			let n = (t === "INVOICE" ? a.managedSalesDocuments : a.expenseBillDrafts).drafts.find((t) => t.id === e.sourceDraftId);
			if (!n || n.kind !== t) throw Error("Recurring template source is missing.");
			let r = i.runs.filter((t) => t.scheduleId === e.id);
			if (r.length !== e.occurrence || new Set(r.map((e) => e.date)).size !== r.length) throw Error("Recurring run history does not match schedule.");
			for (let t = 0; t < r.length; t++) if (!r.some((n) => n.date === Nc(e.firstDate, e.frequency, t))) throw Error("Recurring occurrences are incomplete.");
		}
		for (let e of i.runs) {
			let n = i.schedules.find((t) => t.id === e.scheduleId), r = (t === "INVOICE" ? a.managedSalesDocuments : a.expenseBillDrafts).drafts.find((t) => t.id === e.draftId);
			if (!n || !r || r.kind !== t || r.operationId !== "recurring:" + n.id + ":" + e.date || !e.actorId || !Number.isFinite(Date.parse(e.createdAt))) throw Error("Invalid recurring generated-draft reference.");
		}
	}
});
//#endregion
//#region src/features/banking/data/bankTransactionRepository.ts
var El = /* @__PURE__ */ new Set(), Dl = N.read().transactions, Ol = N.read().transfers;
N.onRollback(() => {
	let e = N.read();
	Dl = e.transactions, Ol = e.transfers;
});
function kl() {
	El.forEach((e) => N.notify(e));
}
function Al(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function jl(e) {
	return e?.trim() || void 0;
}
function Ml(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function Nl(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Pl(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Fl(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var Il = {
	subscribe(e) {
		return El.add(e), () => {
			El.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return Dl;
	},
	getTransfersSnapshot() {
		return Ol;
	},
	getTransactions() {
		return Dl;
	},
	getTransfers() {
		return Ol;
	},
	createTransaction(e, t) {
		if (Ml(e.transactionDate), w(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = Nl(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Al(e.description, "Description"), i = L.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let a = F.requireById(i.glAccountId);
		if (!a.active) throw Error("The selected bank GL account is inactive.");
		let o = F.requireById(e.offsetAccountId);
		if (!o.active) throw Error("The offset account is inactive.");
		if (!o.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (o.id === a.id) throw Error("Bank and offset accounts must be different.");
		if (L.getByGlAccountId(o.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let s = Pl("banktxn"), c = Fl("BTXN", e.transactionDate, Dl.length + 1), l = t?.trim();
		if (t !== void 0 && !l) throw Error("Operation ID cannot be empty");
		if (l) {
			let t = O.begin(l, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Dl.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			l && O.bindResult(l, s);
			let t = I.post({
				journalDate: e.transactionDate,
				description: r,
				reference: jl(e.reference),
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
				reference: jl(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [u, ...Dl];
			if (N.update("transactions", d), Dl = d, kl(), l) {
				let e = I.getBySource("BANK_TRANSACTION", s);
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
		Ml(e.transferDate), w(e.transferDate, "Transfer date");
		let n = Nl(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Al(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = L.requireById(e.fromBankAccountId), a = L.requireById(e.toBankAccountId);
		if (!i.active || !a.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== a.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < a.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let o = F.requireById(i.glAccountId), s = F.requireById(a.glAccountId);
		if (!o.active || !s.active) throw Error("Both bank GL accounts must be active.");
		if (o.id === s.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let c = Pl("banktrf"), l = Fl("BTRF", e.transferDate, Ol.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = O.begin(u, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Ol.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			u && O.bindResult(u, c);
			let t = I.post({
				journalDate: e.transferDate,
				description: r,
				reference: jl(e.reference),
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
				reference: jl(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [d, ...Ol];
			if (N.update("transfers", f), Ol = f, kl(), u) {
				let e = I.getBySource("BANK_TRANSFER", c);
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
}, Ll = Il.createTransaction;
Il.createTransaction = function(e, t) {
	A();
	let n;
	try {
		return n = N.transaction(() => Ll.call(Il, e, t)), t && O.complete(t.trim(), n.id), n;
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
var Rl = Il.createTransfer;
Il.createTransfer = function(e, t) {
	A();
	let n;
	try {
		return n = N.transaction(() => Rl.call(Il, e, t)), t && O.complete(t.trim(), n.id), n;
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
function zl(e) {
	if (Dl.some((t) => t.id === e.id) || Ol.some((t) => t.id === e.id)) throw Error("Bank result already exists; restoration cannot duplicate it.");
	"transactionNumber" in e ? (Dl = [structuredClone(e), ...Dl], N.update("transactions", Dl)) : (Ol = [structuredClone(e), ...Ol], N.update("transfers", Ol)), kl();
}
function Bl(e, t, n) {
	if ([...Dl, ...Ol].filter((n) => n.id === e && n.journalEntryId === t).length !== 1) throw Error("Bank result changed before journal repair.");
	Dl = Dl.map((t) => t.id === e ? {
		...t,
		journalEntryId: n
	} : t), Ol = Ol.map((t) => t.id === e ? {
		...t,
		journalEntryId: n
	} : t), N.update("transactions", Dl), N.update("transfers", Ol), kl();
}
i("bankTransactions", {
	repository: Il,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: Dl,
		bankTransfers: Ol
	}),
	restore: (e) => {
		Dl = e.bankTransactions, Ol = e.bankTransfers;
	},
	publish: () => El.forEach((e) => e())
});
//#endregion
//#region src/features/recurring/recurringBankRepository.ts
var Vl = E().trim().min(1).max(200), Hl = E().refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}), Ul = je(), Wl = e({
	bankAccountId: Vl,
	direction: T(["MONEY_IN", "MONEY_OUT"]),
	amount: f().finite().positive().max(0xe8d4a51000).refine((e) => e === Math.round(e * 100) / 100, "Use whole cents."),
	offsetAccountId: Vl,
	description: Vl,
	reference: E().trim().max(200).optional().transform((e) => e || void 0)
}).strict(), Gl = e({
	operationId: Vl,
	name: Vl,
	payload: Wl,
	frequency: T(Mc),
	firstDate: Hl,
	endDate: Hl
}).strict(), Kl = Gl.extend({
	id: Vl,
	kind: b("BANK"),
	creationFingerprint: E(),
	status: T([
		"Active",
		"Paused",
		"Ended"
	]),
	revision: f().int().positive(),
	nextDate: Hl,
	occurrence: f().int().nonnegative(),
	createdAt: Ul,
	updatedAt: Ul
}), ql = e({
	id: Vl,
	action: T([
		"Generated",
		"Approved",
		"Posted",
		"Cancelled"
	]),
	actorId: Vl,
	at: Ul,
	reason: E().trim().min(3).max(2e3).optional()
}).strict(), Jl = e({
	id: Vl,
	scheduleId: Vl,
	date: Hl,
	payload: Wl,
	status: T([
		"DRAFT",
		"APPROVED",
		"POSTED",
		"CANCELLED"
	]),
	revision: f().int().positive(),
	actorId: Vl,
	createdAt: Ul,
	updatedAt: Ul,
	approvedBy: Vl.optional(),
	transactionId: Vl.optional(),
	reason: E().max(2e3).optional(),
	history: s(ql).min(1)
}).strict(), Yl = [], Xl = [], Zl = 0, Ql = /* @__PURE__ */ new Set(), $l = () => {
	Zl++, Ql.forEach((e) => e());
};
function eu(e) {
	let t = L.requireById(e.bankAccountId), n = F.requireById(t.glAccountId), r = F.requireById(e.offsetAccountId);
	if (!t.active || !n.active || !r.active || !r.allowManualPosting || L.getByGlAccountId(r.id) || r.systemRole && !["OPERATING_EXPENSE", "FREIGHT"].includes(r.systemRole)) throw Error("Use an active bank and an eligible manual offset account; control accounts require their source workflow.");
}
function tu(e) {
	let t = Yl.find((t) => t.id === e);
	if (!t) throw Error("Recurring bank schedule not found.");
	return t;
}
function nu(e, t) {
	if (e.revision !== t) throw Error("Recurring bank record changed. Refresh first.");
}
var ru = e({
	id: Vl,
	expectedRevision: f().int().positive()
}).strict(), iu = {
	getAll: () => Yl,
	getDrafts: () => Xl,
	create(e) {
		G.require("banking.write");
		let t = Gl.parse(e), n = JSON.stringify(t), r = Yl.find((e) => e.operationId === t.operationId);
		if (r) {
			if (r.creationFingerprint !== n) throw Error("Operation ID has different bank template data.");
			return r;
		}
		if (eu(t.payload), t.endDate < t.firstDate) throw Error("End date precedes first date.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...t,
			id: crypto.randomUUID(),
			kind: "BANK",
			creationFingerprint: n,
			status: "Active",
			revision: 1,
			nextDate: t.firstDate,
			occurrence: 0,
			createdAt: i,
			updatedAt: i
		};
		return Yl = [...Yl, a], $l(), a;
	},
	update(e) {
		G.require("banking.write");
		let t = ru.extend({
			name: Vl,
			endDate: Hl
		}).parse(e), n = tu(t.id);
		if (nu(n, t.expectedRevision), t.endDate < n.firstDate || Xl.some((e) => e.scheduleId === n.id && e.date > t.endDate)) throw Error("End date cannot precede existing occurrences.");
		let r = {
			...n,
			name: t.name,
			endDate: t.endDate,
			status: n.nextDate > t.endDate ? "Ended" : n.status === "Ended" ? "Paused" : n.status,
			revision: n.revision + 1,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Yl = Yl.map((e) => e.id === n.id ? r : e), $l(), r;
	},
	setStatus(e) {
		G.require("banking.write");
		let t = ru.extend({ status: T(["Active", "Paused"]) }).parse(e), n = tu(t.id);
		if (nu(n, t.expectedRevision), n.nextDate > n.endDate) throw Error("Extend the schedule before resuming.");
		let r = {
			...n,
			status: t.status,
			revision: n.revision + 1,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Yl = Yl.map((e) => e.id === n.id ? r : e), $l(), r;
	},
	generate(e) {
		let t = G.require("banking.write"), n = ru.extend({ date: Hl }).parse(e), r = tu(n.id), i = Xl.find((e) => e.scheduleId === r.id && e.date === n.date);
		if (i) return {
			schedule: r,
			draft: i
		};
		if (nu(r, n.expectedRevision), r.status !== "Active" || n.date !== r.nextDate || n.date > r.endDate || n.date > ve((/* @__PURE__ */ new Date()).toISOString())) throw Error("Generate an active due bank occurrence in order.");
		eu(r.payload);
		let a = L.requireById(r.payload.bankAccountId);
		if (n.date < a.openingBalanceDate) throw Error("Occurrence precedes bank opening balance.");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: crypto.randomUUID(),
			scheduleId: r.id,
			date: n.date,
			payload: structuredClone(r.payload),
			status: "DRAFT",
			revision: 1,
			actorId: t.userId,
			createdAt: o,
			updatedAt: o,
			history: [{
				id: crypto.randomUUID(),
				action: "Generated",
				actorId: t.userId,
				at: o
			}]
		}, c = Nc(r.firstDate, r.frequency, r.occurrence + 1), l = {
			...r,
			nextDate: c,
			occurrence: r.occurrence + 1,
			status: c > r.endDate ? "Ended" : "Active",
			revision: r.revision + 1,
			updatedAt: o
		};
		return Xl = [...Xl, s], Yl = Yl.map((e) => e.id === r.id ? l : e), $l(), {
			schedule: l,
			draft: s
		};
	},
	review(e) {
		let t = G.require("banking.write"), n = ru.extend({
			action: T([
				"Approve",
				"Post",
				"Cancel"
			]),
			reason: E().trim().min(3).max(2e3)
		}).parse(e), r = Xl.find((e) => e.id === n.id);
		if (!r) throw Error("Recurring bank draft not found.");
		if (n.action === "Post" && r.status === "POSTED") return r;
		nu(r, n.expectedRevision);
		let i;
		if (n.action === "Approve") {
			if (r.status !== "DRAFT") throw Error("Only draft bank occurrences can be approved.");
			eu(r.payload), i = {
				...r,
				status: "APPROVED",
				approvedBy: t.userId
			};
		} else if (n.action === "Post") {
			if (G.require("accounting.post"), r.status !== "APPROVED") throw Error("Review and approve the bank draft before posting.");
			eu(r.payload), St(r.date);
			let e = Il.createTransaction({
				...r.payload,
				transactionDate: r.date
			}, "recurring-bank:" + r.scheduleId + ":" + r.date);
			i = {
				...r,
				status: "POSTED",
				transactionId: e.id
			};
		} else {
			if (!["DRAFT", "APPROVED"].includes(r.status)) throw Error("Posted bank records use their normal reversal workflow.");
			i = {
				...r,
				status: "CANCELLED"
			};
		}
		let a = (/* @__PURE__ */ new Date()).toISOString();
		return i = {
			...i,
			revision: r.revision + 1,
			reason: n.reason,
			updatedAt: a,
			history: [...r.history, {
				id: crypto.randomUUID(),
				action: n.action === "Approve" ? "Approved" : n.action === "Post" ? "Posted" : "Cancelled",
				actorId: t.userId,
				at: a,
				reason: n.reason
			}]
		}, Xl = Xl.map((e) => e.id === i.id ? i : e), $l(), i;
	}
};
i("recurringBank", {
	repository: iu,
	read: "banking.read",
	commands: {
		create: "banking.write",
		update: "banking.write",
		setStatus: "banking.write",
		generate: "banking.write",
		review: "banking.write"
	},
	snapshot: () => ({
		schedules: Yl,
		drafts: Xl
	}),
	restore: (e) => {
		Yl = e.schedules, Xl = e.drafts;
	},
	publish: $l,
	validate: (t, n) => {
		let r = e({
			schedules: s(Kl),
			drafts: s(Jl)
		}).strict().parse(t), i = n;
		if (new Set(r.schedules.map((e) => e.operationId)).size !== r.schedules.length) throw Error("Duplicate recurring bank creation request.");
		for (let e of r.schedules) {
			let t = r.drafts.filter((t) => t.scheduleId === e.id);
			if (e.nextDate !== Nc(e.firstDate, e.frequency, e.occurrence) || e.endDate < e.firstDate || e.status === "Ended" != e.nextDate > e.endDate || t.length !== e.occurrence || new Set(t.map((e) => e.date)).size !== t.length || !i.bankAccounts.bankAccounts.some((t) => t.id === e.payload.bankAccountId) || !i.accounts.accounts.some((t) => t.id === e.payload.offsetAccountId)) throw Error("Invalid recurring bank schedule or references.");
			for (let n = 0; n < t.length; n++) if (!t.some((t) => t.date === Nc(e.firstDate, e.frequency, n))) throw Error("Missing recurring bank occurrence.");
		}
		for (let e of r.drafts) {
			let t = e.history.at(-1), n = {
				DRAFT: "Generated",
				APPROVED: "Approved",
				POSTED: "Posted",
				CANCELLED: "Cancelled"
			}[e.status];
			if (e.revision !== e.history.length || new Set(e.history.map((e) => e.id)).size !== e.history.length || e.history[0].action !== "Generated" || e.history[0].actorId !== e.actorId || e.history[0].at !== e.createdAt || t.action !== n || t.at !== e.updatedAt || e.reason !== t.reason || e.approvedBy !== e.history.find((e) => e.action === "Approved")?.actorId) throw Error("Invalid recurring bank review audit.");
			for (let t = 1; t < e.history.length; t++) {
				let n = e.history[t - 1].action, r = e.history[t];
				if (!r.reason || n === "Posted" || n === "Cancelled" || r.action === "Generated" || r.action === "Approved" && n !== "Generated" || r.action === "Posted" && n !== "Approved") throw Error("Invalid recurring bank review sequence.");
			}
			let a = r.schedules.find((t) => t.id === e.scheduleId), o = i.bankTransactions.bankTransactions.find((t) => t.id === e.transactionId);
			if (!a || JSON.stringify(e.payload) !== JSON.stringify(a.payload) || e.status === "POSTED" != !!e.transactionId || ["APPROVED", "POSTED"].includes(e.status) && !e.approvedBy || e.transactionId && (!o || o.transactionDate !== e.date || Object.entries(e.payload).some(([e, t]) => o[e] !== t))) throw Error("Invalid recurring bank draft or posted result.");
		}
	}
});
//#endregion
//#region src/features/recurring/recurringAutomationRepository.ts
var au = [
	"INVOICE",
	"EXPENSE",
	"BANK"
], ou = (e) => e === "INVOICE" ? "sales.manage" : e === "EXPENSE" ? "purchases.bill" : "banking.write", su = (e) => e === "INVOICE" ? "sales.read" : e === "EXPENSE" ? "purchases.read" : "banking.read", cu = E().trim().min(1).max(200), lu = T(au), uu = je(), du = E().refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}), fu = e({
	id: lu,
	enabled: y(),
	revision: f().int().positive(),
	actorId: cu,
	updatedAt: uu
}).strict(), pu = e({
	id: cu,
	status: T([
		"FAILED",
		"RETRY",
		"RESOLVED"
	]),
	actorId: cu,
	at: uu,
	reason: E().min(1).max(2e3)
}).strict(), mu = e({
	id: cu,
	kind: lu,
	scheduleId: cu,
	date: du,
	status: T([
		"FAILED",
		"RETRY",
		"RESOLVED"
	]),
	revision: f().int().positive(),
	attempts: f().int().positive(),
	error: E().min(1).max(2e3),
	actorId: cu,
	updatedAt: uu,
	draftId: cu.optional(),
	history: s(pu).min(1)
}).strict(), hu = [], gu = [], _u = 0, vu = /* @__PURE__ */ new Set(), yu = () => {
	_u++, vu.forEach((e) => e());
}, bu = (e) => e === "INVOICE" ? wl : e === "EXPENSE" ? Tl : iu, xu = () => au.flatMap((e) => bu(e).getAll().map((t) => ({
	...t,
	kind: e
})));
function Su(e) {
	let t = ve((/* @__PURE__ */ new Date()).toISOString());
	return xu().filter((n) => g(e, ou(n.kind)) && hu.some((e) => e.id === n.kind && e.enabled) && n.status === "Active" && n.nextDate <= t && n.nextDate <= n.endDate && !gu.some((e) => e.kind === n.kind && e.scheduleId === n.id && e.date === n.nextDate && e.status === "FAILED")).sort((e, t) => e.nextDate.localeCompare(t.nextDate) || e.kind.localeCompare(t.kind) || e.id.localeCompare(t.id));
}
var Cu = /* @__PURE__ */ new Map();
function wu(e, t, n, r) {
	let i = G.require(ou(e)), a = crypto.randomUUID();
	return Cu.set(a, {
		kind: e,
		scheduleId: t,
		date: n,
		error: r.slice(0, 2e3) || "Generation failed.",
		actor: i.userId
	}), a;
}
function Tu() {
	gu = gu.map((e) => {
		if (e.status === "RESOLVED") return e;
		let t = bu(e.kind), n = e.kind === "BANK" ? iu.getDrafts().find((t) => t.scheduleId === e.scheduleId && t.date === e.date) : "getRuns" in t ? t.getRuns().find((t) => t.scheduleId === e.scheduleId && t.date === e.date) : void 0;
		if (!n) return e;
		let r = G.current().userId, i = (/* @__PURE__ */ new Date()).toISOString();
		return {
			...e,
			status: "RESOLVED",
			draftId: "draftId" in n ? n.draftId : n.id,
			revision: e.revision + 1,
			actorId: r,
			updatedAt: i,
			history: [...e.history, {
				id: crypto.randomUUID(),
				status: "RESOLVED",
				actorId: r,
				at: i,
				reason: "The occurrence was generated through its normal draft workflow."
			}]
		};
	});
}
i("recurringAutomation", {
	repository: {
		status() {
			let e = G.require("inventory.read");
			return {
				today: ve((/* @__PURE__ */ new Date()).toISOString()),
				due: Su(e).length,
				limit: 20
			};
		},
		configure(t) {
			let n = e({
				kind: lu,
				enabled: y(),
				expectedRevision: f().int().nonnegative()
			}).strict().parse(t), r = G.require(ou(n.kind)), i = hu.find((e) => e.id === n.kind);
			if ((i?.revision ?? 0) !== n.expectedRevision) throw Error("Automation policy changed. Refresh first.");
			let a = {
				id: n.kind,
				enabled: n.enabled,
				revision: (i?.revision ?? 0) + 1,
				actorId: r.userId,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			return hu = [...hu.filter((e) => e.id !== n.kind), a], yu(), a;
		},
		execute(t) {
			let n = e({
				kind: lu,
				id: cu,
				expectedRevision: f().int().positive(),
				date: du
			}).strict().parse(t);
			G.require(ou(n.kind));
			let r = bu(n.kind).generate({
				id: n.id,
				expectedRevision: n.expectedRevision,
				date: n.date
			});
			return Tu(), yu(), r;
		},
		recordFailure(t) {
			let n = e({ ticket: cu }).strict().parse(t), r = Cu.get(n.ticket);
			if (Cu.delete(n.ticket), !r) throw Error("Only a trusted failed desktop attempt can enter the error queue.");
			let i = G.require(ou(r.kind));
			if (i.userId !== r.actor) throw Error("Failure actor changed.");
			let a = bu(r.kind).getAll().find((e) => e.id === r.scheduleId);
			if (!a || a.nextDate !== r.date) throw Error("Failed occurrence is no longer current.");
			let o = gu.find((e) => e.kind === r.kind && e.scheduleId === r.scheduleId && e.date === r.date), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
				id: o?.id ?? crypto.randomUUID(),
				kind: r.kind,
				scheduleId: r.scheduleId,
				date: r.date,
				status: "FAILED",
				revision: (o?.revision ?? 0) + 1,
				attempts: (o?.attempts ?? 0) + 1,
				error: r.error,
				actorId: i.userId,
				updatedAt: s,
				history: [...o?.history ?? [], {
					id: crypto.randomUUID(),
					status: "FAILED",
					actorId: i.userId,
					at: s,
					reason: r.error
				}]
			};
			return gu = [...gu.filter((e) => e.id !== c.id), c], yu(), c;
		},
		retry(t) {
			let n = e({
				id: cu,
				expectedRevision: f().int().positive(),
				reason: E().trim().min(3).max(2e3)
			}).strict().parse(t), r = gu.find((e) => e.id === n.id);
			if (!r) throw Error("Recurring error not found.");
			let i = G.require(ou(r.kind));
			if (r.revision !== n.expectedRevision || r.status !== "FAILED") throw Error("Error queue changed. Refresh first.");
			Tu();
			let a = gu.find((e) => e.id === r.id);
			if (a.status === "RESOLVED") return yu(), a;
			let o = bu(r.kind).getAll().find((e) => e.id === r.scheduleId);
			if (!o || o.status !== "Active" || o.nextDate !== r.date) throw Error("Resume the schedule before retrying the current occurrence.");
			let s = (/* @__PURE__ */ new Date()).toISOString(), c = {
				...r,
				status: "RETRY",
				revision: r.revision + 1,
				actorId: i.userId,
				updatedAt: s,
				history: [...r.history, {
					id: crypto.randomUUID(),
					status: "RETRY",
					actorId: i.userId,
					at: s,
					reason: n.reason
				}]
			};
			return gu = gu.map((e) => e.id === c.id ? c : e), yu(), c;
		}
	},
	read: "inventory.read",
	commands: {
		status: "inventory.read",
		configure: "inventory.read",
		execute: "inventory.read",
		recordFailure: "inventory.read",
		retry: "inventory.read"
	},
	snapshot: () => ({
		policies: hu,
		tasks: gu
	}),
	restore: (e) => {
		hu = e.policies, gu = e.tasks;
	},
	publish: yu,
	view: (e) => ({
		policies: hu.filter((t) => g(e, su(t.id))),
		tasks: gu.filter((t) => g(e, su(t.kind)))
	}),
	validate: (t, n) => {
		let r = e({
			policies: s(fu),
			tasks: s(mu)
		}).strict().parse(t), i = n;
		if (new Set(r.policies.map((e) => e.id)).size !== r.policies.length || new Set(r.tasks.map((e) => e.kind + ":" + e.scheduleId + ":" + e.date)).size !== r.tasks.length) throw Error("Duplicate recurring automation identity.");
		for (let e of r.tasks) {
			let t = i[e.kind === "INVOICE" ? "recurringInvoices" : e.kind === "EXPENSE" ? "recurringExpenses" : "recurringBank"], n = t.schedules.find((t) => t.id === e.scheduleId), r = e.history.at(-1), a = n && ["Monthly", "Quarterly"].includes(n.frequency), o = (n ? a ? (Number(e.date.slice(0, 4)) - Number(n.firstDate.slice(0, 4))) * 12 + Number(e.date.slice(5, 7)) - Number(n.firstDate.slice(5, 7)) : (Date.parse(e.date + "T00:00:00Z") - Date.parse(n.firstDate + "T00:00:00Z")) / 864e5 : NaN) / (a ? n.frequency === "Monthly" ? 1 : 3 : n?.frequency === "Weekly" ? 7 : 14);
			if (!n || !Number.isSafeInteger(o) || o < 0 || Nc(n.firstDate, n.frequency, o) !== e.date || e.date < n.firstDate || r.status !== e.status || r.actorId !== e.actorId || r.at !== e.updatedAt || e.revision !== e.history.length || e.attempts !== e.history.filter((e) => e.status === "FAILED").length || e.history[0].status !== "FAILED" || new Set(e.history.map((e) => e.id)).size !== e.history.length) throw Error("Invalid recurring error evidence.");
			for (let t = 1; t < e.history.length; t++) {
				let n = e.history[t - 1].status, r = e.history[t].status;
				if (n === "RESOLVED" || r === "RETRY" && n !== "FAILED" || r === "FAILED" && n !== "RETRY") throw Error("Invalid recurring retry lifecycle.");
			}
			if (e.status === "RESOLVED") {
				if (!(e.kind === "BANK" ? t.drafts.find((t) => t.id === e.draftId && t.scheduleId === n.id && t.date === e.date) : t.runs.find((t) => t.draftId === e.draftId && t.scheduleId === n.id && t.date === e.date))) throw Error("Resolved recurring error has no generated draft.");
			} else if (e.draftId) throw Error("Unresolved recurring error has a result.");
		}
	}
});
//#endregion
//#region src/lib/persistence/financialConsistencyAudit.ts
function Eu(e) {
	let t = [], n = new Map(e.journals.map((e) => [e.id, e])), r = pe(e.journals);
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
var Du = (e) => Math.round(e * 100);
function Ou(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + Du(t.amount), 0), s = a.reduce((e, t) => e + Du(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (Du(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), Du(t.amountDue) !== Math.max(0, Du(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > Du(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + Du(t.amount), 0);
		Du(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || Du(t.amountAvailable) !== 0 : Du(t.amountAvailable) !== Du(t.totals.total) - a - Du(t.amountRefunded ?? 0)) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
//#region src/features/banking/data/reconciliationRecoveryEvidence.ts
function ku(e) {
	let n = O.list(), r = n.find((t) => t.operationId === e), i = [];
	if (!r || r.kind !== "BANK_RECONCILIATION" || r.state !== "MANUAL_REVIEW") return ["Operation is not an unresolved bank reconciliation review."];
	if (!r.resultId) return ["Operation has no durable bound result; cannot infer clearing."];
	r.reviewHistory?.length || i.push("Operator reconciliation evidence is missing.");
	let a = Fn.getAll(), o = a.filter((e) => e.id === r.resultId);
	if (o.length !== 1) return [...i, "Completed reconciliation result is missing or duplicated."];
	let s = o[0], c = L.getById(s.bankAccountId), l = I.getAll();
	if (!c) return [...i, "Reconciliation bank account is missing."];
	let u = (e) => JSON.stringify([...e].sort()), d = (e) => Math.round((e + 2 ** -52) * 100) / 100, f = a.filter((e) => e.bankAccountId === c.id && e.statementDate <= s.statementDate), p = t().bankStatements?.lines ?? [];
	try {
		i.push(...Ke({
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
//#region src/features/banking/data/bankRecoveryEvidence.ts
var Au = (e) => e === "BANK_TRANSACTION" || e === "BANK_TRANSFER";
function ju(e, t, n = !0) {
	let r = O.list(), i = r.filter((t) => t.operationId === e);
	if (i.length !== 1) return ["Bank operation identity is missing or duplicated."];
	let a = i[0], o = [];
	if ((!Au(a.kind) || (n ? a.state !== "MANUAL_REVIEW" : a.state === "COMPLETED")) && o.push("Operation is not an unresolved bank review."), a.resultId || o.push("Operation has no durable bound result; cannot infer effects."), n && !a.reviewHistory?.length && o.push("Operator reconciliation evidence is missing."), o.length) return o;
	let s = t?.transactions ?? Il.getTransactions(), c = t?.transfers ?? Il.getTransfers(), l = t?.journals ?? I.getAll(), u = a.kind === "BANK_TRANSACTION" ? s : c;
	if (u.filter((e) => e.id === a.resultId).length !== 1) return ["Bank business result is missing or duplicated."];
	let d = s.find((e) => e.id === a.resultId), f = c.find((e) => e.id === a.resultId), p = u.find((e) => e.id === a.resultId), m = (e) => new Set(e).size === e.length;
	if (!m(l.map((e) => e.id)) || !m(u.map((e) => e.id))) return ["Duplicate bank or GL identity; evidence is ambiguous."];
	let h = pe(l);
	if (h.invalid.length) return ["Invalid duplicate-correction evidence."];
	let g = l.filter((e) => e.sourceType === a.kind && e.sourceId === a.resultId && !h.originals.has(e.id));
	if (g.length !== 1) return ["Bank result must have exactly one source journal."];
	let _ = g[0];
	(_.id !== p.journalEntryId || _.status !== "POSTED" || _.reversedJournalEntryId || _.reversalJournalEntryId || _.reversedAt || l.some((e) => e.reversedJournalEntryId === _.id)) && o.push("Bank journal link or posted lifecycle is not verified; reversed effects require separate repair.");
	let v = a.kind === "BANK_TRANSACTION" ? d.transactionDate : f.transferDate;
	try {
		w(v, "Bank result date");
	} catch {
		o.push("Bank result date is invalid.");
	}
	let ee = (e) => Math.round((e + 2 ** -52) * 100), y = p.amount;
	(!Number.isFinite(y) || y <= 0 || Math.abs(y - ee(y) / 100) > 1e-8) && o.push("Bank amount must be positive whole cents."), (_.journalDate !== v || _.description !== p.description || _.reference !== p.reference) && o.push("Journal date, description or reference differs from the bank result.");
	let b, x, te = F.getAll();
	if (a.kind === "BANK_TRANSACTION") {
		let e = L.getById(d.bankAccountId), t = te.find((e) => e.id === d.offsetAccountId);
		(!e || !t || !t.allowManualPosting || e.glAccountId === t.id || L.getByGlAccountId(t.id) || v < e.openingBalanceDate) && o.push("Bank or offset account mapping is invalid."), ["MONEY_IN", "MONEY_OUT"].includes(d.direction) || o.push("Bank direction is invalid."), b = d.direction === "MONEY_IN" ? e?.glAccountId : t?.id, x = d.direction === "MONEY_IN" ? t?.id : e?.glAccountId;
	} else {
		let e = L.getById(f.fromBankAccountId), t = L.getById(f.toBankAccountId);
		(!e || !t || e.id === t.id || e.glAccountId === t.glAccountId || e.currency !== t.currency || v < e.openingBalanceDate || v < t.openingBalanceDate) && o.push("Transfer bank mappings, currency or dates are invalid."), b = t?.glAccountId, x = e?.glAccountId;
	}
	(!b || !x || !te.some((e) => e.id === b) || !te.some((e) => e.id === x) || _.lines.length !== 2 || !_.lines.every((e) => Number.isFinite(e.debit) && Number.isFinite(e.credit) && e.debit >= 0 && e.credit >= 0) || !_.lines.some((e) => e.accountId === b && e.debit === y && e.credit === 0) || !_.lines.some((e) => e.accountId === x && e.credit === y && e.debit === 0) || _.totalDebit !== y || _.totalCredit !== y) && o.push("Bank journal accounts, direction or amounts do not exactly match the bound result.");
	try {
		let e = JSON.parse(a.fingerprint);
		(!e || typeof e != "object" || !Number.isFinite(e.amount) || ee(e.amount) !== ee(y) || typeof e.description != "string" || e.description.trim() !== p.description || ((e) => typeof e == "string" && e.trim() || void 0)(e.reference) !== p.reference || (a.kind === "BANK_TRANSACTION" ? e.bankAccountId !== d.bankAccountId || e.transactionDate !== v || e.direction !== d.direction || e.offsetAccountId !== d.offsetAccountId : e.fromBankAccountId !== f.fromBankAccountId || e.toBankAccountId !== f.toBankAccountId || e.transferDate !== v)) && o.push("Saved bank intent does not match the bound business result.");
	} catch {
		o.push("Saved bank intent is unreadable; cannot verify original request.");
	}
	return r.some((e) => e.operationId !== a.operationId && e.kind === a.kind && e.resultId === a.resultId) && o.push("Another operation claims this bank result."), o;
}
//#endregion
//#region src/features/sales/data/invoiceBalanceAsAtService.ts
function Mu(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= Fu(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: Iu(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => Nu(e, r)), a = Iu(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && Pu(t, r)), s = Iu(o.reduce((e, t) => e + t.amount, 0)), c = Iu(e.totals.total), l = Iu(Math.max(0, c - a - s));
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
function Nu(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Fu(e.reversedAt) : !1;
}
function Pu(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Fu(e.reversedAt) : !1;
}
function Fu(e) {
	return ve(e);
}
function Iu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function Lu(e, t, n) {
	let r = Bu(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= zu(e.voidedAt)) return Ru(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && Pu(t, n)), a = Bu(i.reduce((e, t) => e + t.amount, 0)), o = Bu(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - a));
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
function Ru(e, t, n) {
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
function zu(e) {
	return ve(e);
}
function Bu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function Vu(e, t, n = [], r = [], i = [], a = Wu()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = Mu(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = Hu(e.dueDate, a);
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
		current: Gu(s.current),
		days1To30: Gu(s.days1To30),
		days31To60: Gu(s.days31To60),
		days61To90: Gu(s.days61To90),
		days90Plus: Gu(s.days90Plus)
	}, p = Gu(c), m = Gu(l), h = Gu(i.reduce((t, n) => n.customerId === e.id ? t + Lu(n, r, a).amountAvailable : t, 0)), g = Gu(p - h);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: h,
		netAccountBalance: g,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: Gu(Math.max(0, e.creditLimit - Math.max(0, g))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function Hu(e, t = Wu()) {
	let n = Uu(e), r = Uu(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Uu(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function Wu() {
	return ve((/* @__PURE__ */ new Date()).toISOString());
}
function Gu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function Ku(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function qu(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function Ju(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? Ku(t - n) : Ku(n - t);
}
function Yu(e, t, n) {
	qu(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = Ku(t + r.debit), n = Ku(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: Ju(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = Ku(r.reduce((e, t) => e + t.totalDebit, 0)), o = Ku(r.reduce((e, t) => e + t.totalCredit, 0));
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
function Xu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Zu({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = Vu(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: Xu(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = Xu(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = Xu(Yu(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = Xu(l - d);
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
//#region src/features/purchases/data/supplierPaymentRepository.ts
var Qu = /* @__PURE__ */ new Set(), $u = N.read().supplierPayments;
N.onRollback(() => {
	$u = N.read().supplierPayments;
});
function ed() {
	N.update("supplierPayments", $u), Qu.forEach((e) => N.notify(e));
}
var td = {
	subscribe(e) {
		return Qu.add(e), () => {
			Qu.delete(e);
		};
	},
	getSnapshot() {
		return $u;
	},
	getAll() {
		return $u;
	},
	getById(e) {
		return $u.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return $u.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return $u.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: rd(e.reference),
			notes: rd(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: id(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = $u.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (w(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = Sa.getById(e.supplierId);
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
			let n = ss.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = id(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${ad(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), c = id(s.reduce((e, t) => e + t.amount, 0));
		if (c <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of s) ss.applyPayment(e.supplierBillId, e.amount);
		let l = (/* @__PURE__ */ new Date()).toISOString(), u = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: nd(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: c,
			method: e.method,
			bankAccountId: i.id,
			reference: rd(e.reference),
			notes: rd(e.notes),
			allocations: s,
			status: "POSTED",
			createdAt: l,
			updatedAt: l
		};
		return $u = [u, ...$u], ed(), Za.postSupplierPayment(u), u;
	},
	recordPrepaymentSettlement(e) {
		w(e.paymentDate);
		let t = Sa.getById(e.supplierId), n = ss.getById(e.supplierBillId);
		if (!t || !n || n.supplierId !== t.id || e.paymentDate < n.billDate || !e.prepaymentId || !e.applicationId || !Number.isFinite(e.amount) || e.amount <= 0) throw Error("Invalid supplier prepayment application.");
		if ($u.some((t) => t.id === e.id || t.prepaymentApplicationId === e.applicationId)) throw Error("Prepayment application already exists.");
		ss.applyPayment(n.id, e.amount);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: e.id,
			prepaymentId: e.prepaymentId,
			prepaymentApplicationId: e.applicationId,
			paymentNumber: nd(e.paymentDate),
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
		return $u = [i, ...$u], ed(), i;
	},
	reversePrepaymentSettlement(e, t, n) {
		w(t);
		let r = $u.find((t) => t.id === e);
		if (!r?.prepaymentApplicationId || r.status !== "POSTED" || t < r.paymentDate || n.trim().length < 3) throw Error("Invalid supplier prepayment reversal.");
		for (let e of r.allocations) ss.reversePayment(e.supplierBillId, e.amount);
		let i = {
			...r,
			status: "REVERSED",
			reversedAt: t,
			reversalReason: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return $u = $u.map((t) => t.id === e ? i : t), ed(), i;
	},
	reverse(e, t) {
		if (Nt("SUPPLIER_PAYMENT", e), $u.find((t) => t.id === e)?.prepaymentApplicationId) throw Error("Reverse this settlement through supplier prepayments.");
		let n = $u.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = ss.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) ss.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return $u = $u.map((t) => t.id === e ? a : t), ed(), Za.reverseSupplierPayment(a), a;
	}
};
function nd(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = $u.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function rd(e) {
	return e?.trim() || void 0;
}
function id(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ad(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: C().currency
	}).format(e);
}
var od = td.create;
td.create = function(...e) {
	return A(), N.transaction(() => od.apply(td, e));
};
var sd = td.reverse;
td.reverse = function(...e) {
	return A(), N.transaction(() => sd.apply(td, e));
}, i("supplierPayments", {
	repository: td,
	read: "purchases.read",
	commands: {
		recordPrepaymentSettlement: null,
		reversePrepaymentSettlement: null,
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: $u }),
	restore: (e) => {
		$u = e.supplierPayments;
	},
	publish: () => Qu.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function cd(e) {
	return Eu({
		transactions: e?.transactions ?? Il.getTransactions(),
		transfers: e?.transfers ?? Il.getTransfers(),
		payments: Ai.getAll(),
		journals: e?.journals ?? I.getAll(),
		invoices: B.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: z.getAll(),
		supplierBills: ss.getAll(),
		supplierPayments: td.getAll(),
		supplierCredits: W.getAll()
	});
}
//#endregion
//#region src/features/sales/data/salesRecoveryInspection.ts
var ld = {
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
function ud(e) {
	return Ou(e).map((e) => ({
		...e,
		action: ld[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var dd = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function fd(e, t) {
	let n = ud(e).map((e) => ({ ...e })), r = t.filter((e) => dd.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => dd.has(e.kind))) s.has(e.operationId) && n.push({
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
function pd() {
	let e = B.getAll();
	return fd({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Ai.getAll(),
		creditNotes: z.getAll(),
		allocations: z.getAllAllocations(),
		journals: I.getAll()
	}, O.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
function md(e) {
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
var hd = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function gd(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!hd.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = fd(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function _d() {
	let e = B.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Ai.getAll(),
		creditNotes: z.getAll(),
		allocations: z.getAllAllocations(),
		journals: I.getAll()
	};
}
function vd(e) {
	let n = [], r = _d(), i = O.list().find((t) => t.operationId === e), a = r.payments.find((e) => e.id === i?.resultId), o = (e) => Math.round(e * 100), s = (e) => {
		let t = /* @__PURE__ */ new Map();
		for (let n of e) t.set(n.accountId, (t.get(n.accountId) ?? 0) + o(n.debit) - o(n.credit));
		return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
	};
	if (a && ["CUSTOMER_PAYMENT", "SALES_PAYMENT_REVERSAL"].includes(i.kind)) {
		let e = r.journals.find((e) => e.sourceType === "CUSTOMER_PAYMENT" && e.sourceId === a.id && !e.reversedJournalEntryId), i = F.getAll().find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE"), s = L.getById(a.bankAccountId)?.glAccountId;
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
		].sort().at(-1) ?? "1970-01-01", t = Zu({
			accounts: F.getAll(),
			journalEntries: [...r.journals],
			asOfDate: e,
			customers: R.getAll(),
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
function yd(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = h("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [e]
		});
		return Te(t.view), t.result;
	}
	if (typeof e.approvalReference != "string" || e.approvalReference.length > 500) throw Error("Provide an approval reference of 3–500 characters.");
	let t = O.list(), n = t.find((t) => t.operationId === e.operationId);
	if (!n || !e.expectedRevision || md(n) !== e.expectedRevision) throw Error("Recovery evidence changed. Refresh and review before approval.");
	let r = n.kind === "BANK_RECONCILIATION" ? ku(e.operationId) : Au(n.kind) ? ju(e.operationId) : gd(_d(), t, e.operationId);
	n.kind !== "BANK_RECONCILIATION" && !Au(n.kind) && r.push(...vd(e.operationId));
	let i = cd();
	if (i.length && r.push("Financial consistency checks failed: " + i.map((e) => e.code).join(", ")), r.length) throw Error(`Financial recovery remains blocked: ${r.join(" ")}`);
	let a = t.find((t) => t.operationId === e.operationId);
	return {
		closed: O.closeReviewed(e.operationId, a.resultId, e.approvalReference, e.approver),
		remaining: pd()
	};
}
//#endregion
//#region src/features/purchases/data/supplierBillBalanceAsAtService.ts
function bd(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && xd(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = Sd(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && xd(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = Sd(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && xd(n.reversedAt) <= r ? t : t + n.amount, 0)), o = Sd(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: Sd(Math.max(0, o - i - a))
	};
}
function xd(e) {
	return ve(e);
}
function Sd(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function Cd(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && wd(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = Td(e.totals.total), i = Td(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && wd(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: Td(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - i))
	};
}
function wd(e) {
	return ve(e);
}
function Td(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function Ed(e, t, n = [], r = [], i = [], a = Nd()) {
	let o = kd(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = bd(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = Od(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = Md(r.reduce((t, n) => n.supplierId === e.id ? t + Cd(n, i, a).amountAvailable : t, 0)), p = Md(s), m = Md(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: Md(c),
		aging: Ad(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function Dd(e, t, n = [], r = [], i = [], a = Nd()) {
	let o = kd(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let h of e) {
		let e = Ed(h, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: Md(s),
		unallocatedCredit: Md(c),
		totalOutstanding: Md(l),
		overdueAmount: Md(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: Ad(o)
	};
}
function Od(e, t = Nd()) {
	let n = jd(e), r = jd(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function kd() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function Ad(e) {
	return {
		current: Md(e.current),
		days1To30: Md(e.days1To30),
		days31To60: Md(e.days31To60),
		days61To90: Md(e.days61To90),
		days90Plus: Md(e.days90Plus)
	};
}
function jd(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function Md(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Nd() {
	return ve((/* @__PURE__ */ new Date()).toISOString());
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function Pd(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Fd({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = Dd(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = Pd(Yu(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = Pd(c.totalOutstanding), f = Pd(d - u);
	return {
		asOfDate: s,
		grossOutstanding: Pd(c.grossOutstanding),
		unallocatedCredit: Pd(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function Id(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function Ld(e) {
	return e.slice(0, 10);
}
function Rd(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function zd(e, t) {
	Id(t);
	let n = e.filter((e) => Ld(e.occurredAt) <= t).slice().sort(Rd), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = V(n.quantityOnHand + e.quantityBase), a = Ba(n.inventoryValue + e.valueChange);
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
		let t = $a.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = Gn(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : za(e.inventoryValue / e.quantityOnHand);
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
		totalQuantity: V(i.reduce((e, t) => e + t.quantityOnHand, 0)),
		totalInventoryValue: Ba(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function Bd(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Vd(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function Hd({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	Vd(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = zd(n, r), o = Bd(Yu(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = Bd(a.totalInventoryValue), c = Bd(s - o);
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
var Ud = Ba, Wd = (e) => /^\d{4}-\d{2}-\d{2}$/.test(e) && !Number.isNaN(Date.parse(`${e}T00:00:00Z`)) && (/* @__PURE__ */ new Date(`${e}T00:00:00Z`)).toISOString().slice(0, 10) === e, Gd = (e) => Date.parse(`${e}T00:00:00Z`), Kd = (e) => e <= 30 ? "CURRENT" : e <= 60 ? "31_60" : e <= 90 ? "61_90" : "OVER_90";
function qd(e) {
	let { filters: t, receipts: n, matches: r, journals: i, grniAccountId: a } = e;
	if (!Wd(t.asOfDate)) throw Error("Invalid GRNI as-of date.");
	if (t.receiptDateFrom && !Wd(t.receiptDateFrom)) throw Error("Invalid receipt start date.");
	if (t.receiptDateTo && !Wd(t.receiptDateTo)) throw Error("Invalid receipt end date.");
	let o = [];
	for (let e of n) if (!(e.status !== "POSTED" || e.receiptDate > t.asOfDate) && !(t.supplierId && e.supplierId !== t.supplierId) && !(t.purchaseOrderId && e.purchaseOrderId !== t.purchaseOrderId) && !(t.goodsReceiptId && e.id !== t.goodsReceiptId) && !(t.siteId && e.siteId !== t.siteId) && !(t.receiptDateFrom && e.receiptDate < t.receiptDateFrom) && !(t.receiptDateTo && e.receiptDate > t.receiptDateTo)) for (let n of e.lines) {
		let i = r.filter((r) => r.goodsReceiptId === e.id && r.goodsReceiptLineId === n.id && (r.accountingDate ?? r.createdAt.slice(0, 10)) <= t.asOfDate && (!(r.reversalAccountingDate ?? r.reversedAt?.slice(0, 10)) || (r.reversalAccountingDate ?? r.reversedAt.slice(0, 10)) > t.asOfDate) && (r.status === "ACTIVE" || !!r.reversedAt)), a = V(i.reduce((e, t) => e + t.matchedQuantity, 0)), s = Ud(i.reduce((e, t) => e + t.matchedReceiptValue, 0)), c = Ha({
			quantityBase: n.receivedBaseQuantity,
			unitCostBase: Va({
				transactionUnitCost: n.unitCost,
				conversionToBase: n.conversionToBase
			})
		}), l = V(n.receivedQuantity - a), u = Ud(c - s);
		if (l < -1e-4 || u < -.01) throw Error(`Overmatched receipt line: ${e.receiptNumber}/${n.id}`);
		if (t.outstandingOnly && l <= 0 && Math.abs(u) < .005) continue;
		let d = Math.max(0, Math.floor((Gd(t.asOfDate) - Gd(e.receiptDate)) / 864e5));
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
			agingBucket: Kd(d)
		});
	}
	let s = {
		receivedValue: Ud(o.reduce((e, t) => e + t.receivedValue, 0)),
		matchedValue: Ud(o.reduce((e, t) => e + t.matchedValue, 0)),
		outstandingValue: Ud(o.reduce((e, t) => e + t.outstandingValue, 0))
	}, c = {
		CURRENT: 0,
		"31_60": 0,
		"61_90": 0,
		OVER_90: 0
	};
	for (let e of o) c[e.agingBucket] = Ud(c[e.agingBucket] + e.outstandingValue);
	let l = !!(t.supplierId || t.purchaseOrderId || t.goodsReceiptId || t.siteId || t.receiptDateFrom || t.receiptDateTo), u = 0;
	for (let e of i) if (!(e.journalDate > t.asOfDate)) for (let t of e.lines) t.accountId === a && (u += t.credit - t.debit);
	return u = Ud(u), {
		asOfDate: t.asOfDate,
		rows: o,
		totals: s,
		aging: c,
		glCreditBalance: u,
		difference: l ? NaN : Ud(s.outstandingValue - u)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseAccountingReconciliationService.ts
var Jd = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Yd(e) {
	let { asOfDate: t, accounts: n, journalEntries: r, costMovements: i, receipts: a, matches: o } = e, s = (e) => {
		let t = n.find((t) => t.systemRole === e);
		if (!t) throw Error(`Missing accounting control account: ${e}`);
		return t;
	}, c = s("INVENTORY"), l = s("GRNI"), u = s("PURCHASE_PRICE_VARIANCE");
	if (c.type !== "ASSET" || l.type !== "LIABILITY" || u.type !== "EXPENSE") throw Error("Purchase reconciliation control account types are invalid.");
	let d = Hd({
		accounts: n,
		journalEntries: r,
		costMovements: i,
		asOfDate: t
	}), f = qd({
		filters: { asOfDate: t },
		receipts: a,
		matches: o,
		journals: r,
		grniAccountId: l.id
	}), p = Jd(o.filter((e) => (e.accountingDate ?? e.createdAt.slice(0, 10)) <= t && (!(e.reversalAccountingDate ?? e.reversedAt?.slice(0, 10)) || (e.reversalAccountingDate ?? e.reversedAt.slice(0, 10)) > t) && (e.status === "ACTIVE" || !!e.reversedAt)).reduce((e, t) => e + t.priceVariance, 0)), m = Jd(r.filter((e) => e.journalDate <= t).flatMap((e) => e.lines).filter((e) => e.accountId === u.id).reduce((e, t) => e + t.debit - t.credit, 0)), h = (e, t, n) => {
		let r = Jd(t - n);
		return {
			accountId: e.id,
			accountCode: e.code,
			accountName: e.name,
			subledger: Jd(t),
			generalLedger: Jd(n),
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
function Xd(e) {
	let { deposits: t, accounts: n, journals: r, banks: i, customers: a, asOfDate: o } = e;
	w(o);
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
			w(e), e <= o && r.set(e, (r.get(e) ?? 0) + t);
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
//#region src/features/supplier-prepayments/prepaymentReconciliation.ts
function Zd(e) {
	let { prepayments: t, accounts: n, journals: r, banks: i, suppliers: a, asOfDate: o } = e;
	w(o);
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
			w(e), e <= o && r.set(e, (r.get(e) ?? 0) + t);
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
//#region electron/security/sourceMetadataRepair.ts
var Qd = E().trim().min(1).max(200), $d = E().regex(/^[a-f0-9]{64}$/), ef = E().trim().min(3).max(200), tf = e({
	operationId: Qd,
	expectedDigest: $d,
	reference: ef,
	summary: E().trim().min(10).max(4e3),
	businessChecked: b(!0),
	glChecked: b(!0),
	externalEvidenceChecked: b(!0)
}).strict(), nf = e({
	operationId: Qd,
	proposalId: Qd,
	expectedDigest: $d,
	approvalReference: ef,
	confirm: b(!0)
}).strict(), rf = (e) => Math.round(e * 100), af = (e) => e / 100;
function of(e) {
	return Array.isArray(e) ? e.map(of) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).sort(([e], [t]) => e.localeCompare(t)).map(([e, t]) => [e, of(t)])) : e;
}
var sf = (e) => Oe("sha256").update(JSON.stringify(of(e))).digest("hex"), cf = [
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_PAYMENT_REVERSAL",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL"
];
function lf(e) {
	return {
		...e.sales,
		payments: e.customerPayments.payments,
		creditNotes: e.customerCredits.creditNotes,
		allocations: e.customerCredits.allocations,
		journals: e.journals.journalEntries
	};
}
function uf(e, t) {
	return sf(e) === sf(t);
}
function df(t, n) {
	let r = lf(n), i = [];
	if (t.kind === "CUSTOMER_PAYMENT") {
		let n = e({
			customerId: Qd,
			invoiceId: Qd,
			paymentDate: Qd,
			amount: f().finite().positive(),
			method: Qd,
			bankAccountId: Qd,
			reference: E().optional(),
			notes: E().optional()
		}).strict().parse(JSON.parse(t.fingerprint));
		i = r.payments.filter((e) => e.status === "RECEIVED" && !e.depositApplicationId && uf(n, {
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
		let n = e({
			creditNoteId: Qd,
			invoiceId: Qd,
			allocationDate: Qd,
			amount: f().finite().positive()
		}).strict().parse(JSON.parse(t.fingerprint));
		i = r.allocations.filter((e) => e.status === "APPLIED" && uf(n, {
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: e.amount
		}));
	} else t.kind === "SALES_INVOICE_VOID" ? i = r.invoices.filter((e) => e.id === t.fingerprint && e.status === "VOID") : t.kind === "SALES_PAYMENT_REVERSAL" ? i = r.payments.filter((e) => e.id === t.fingerprint && e.status === "REVERSED") : t.kind === "SALES_CREDIT_REVERSAL" && (i = r.allocations.filter((e) => e.id === t.fingerprint && e.status === "REVERSED"));
	if (!(i.length !== 1 || t.resultId && t.resultId !== i[0].id)) return i[0].id;
}
function ff() {
	let e = t(), n = structuredClone(e), r = O.list(), i = [], a = [], o = sf({
		business: e,
		operations: r.filter((e) => e.kind !== "SOURCE_METADATA_REPAIR")
	}), s = (e, t, n, r, i, o) => {
		uf(r, i) || a.push({
			kind: e,
			id: t.id,
			path: n,
			before: r,
			after: i,
			evidence: o
		});
	}, c = (e) => Number.isFinite(e) && e >= 0 && Number.isSafeInteger(rf(e)) && e === af(rf(e));
	for (let [e, t] of [
		["transactions", n.bankTransactions.bankTransactions],
		["transfers", n.bankTransactions.bankTransfers],
		["payments", n.customerPayments.payments],
		["supplierBills", n.supplierBills.supplierBills],
		["supplierPayments", n.supplierPayments.supplierPayments],
		["supplierCredits", n.supplierCredits.supplierCredits],
		["supplierCreditAllocations", n.supplierCredits.allocations],
		["journals", n.journals.journalEntries]
	]) uf(n.financialCache[e], t) || i.push("Financial cache/source copies disagree: " + e + ". Restore a consistent snapshot first.");
	for (let e of n.sales.invoices) {
		if (["VOID", "DRAFT"].includes(e.status)) continue;
		let t = n.customerPayments.payments.filter((t) => t.invoiceId === e.id && t.status === "RECEIVED"), r = n.customerCredits.allocations.filter((t) => t.invoiceId === e.id && t.status === "APPLIED"), a = t.reduce((e, t) => e + rf(t.amount), 0), o = r.reduce((e, t) => e + rf(t.amount), 0), l = rf(e.totals.total);
		if (!c(e.totals.total) || [...t, ...r].some((e) => !c(e.amount) || e.amount <= 0) || a + o > l) {
			i.push("Invalid or excessive invoice settlement: " + e.id);
			continue;
		}
		let u = {
			amountPaid: af(a),
			amountDue: af(l - a - o),
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
		}))), r = n.supplierCredits.allocations.filter((t) => t.supplierBillId === e.id && t.status === "APPLIED"), a = t.reduce((e, t) => e + rf(t.amount), 0), o = r.reduce((e, t) => e + rf(t.amount), 0), l = rf(e.totals.total);
		if (!c(e.totals.total) || [...t, ...r].some((t) => !c(t.amount) || t.amount <= 0 || t.supplierId !== e.supplierId) || a + o > l) {
			i.push("Invalid or excessive bill settlement: " + e.id);
			continue;
		}
		let u = {
			amountPaid: af(a),
			amountCredited: af(o),
			amountDue: af(l - a - o),
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
			let t = r.filter((t) => t[e ? "creditNoteId" : "supplierCreditId"] === n.id && t.status === "APPLIED"), a = t.reduce((e, t) => e + rf(t.amount), 0), o = rf(n.amountRefunded ?? 0), l = rf(n.totals.total);
			if (!c(n.totals.total) || !c(n.amountRefunded ?? 0) || t.some((e) => !c(e.amount) || e.amount <= 0) || a + o > l) {
				i.push("Invalid or excessive credit settlement: " + n.id);
				continue;
			}
			let u = {
				amountApplied: af(a),
				amountAvailable: af(l - a - o),
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
		if (!cf.includes(e.kind)) {
			i.push("Separate recovery required for " + e.kind + ": " + e.operationId);
			continue;
		}
		let t;
		try {
			t = df(e, n);
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
		(!c(t.amount) || t.amount <= 0 || r.length !== 1 || r[0].status !== (t.status === "REVERSED" ? "REVERSED" : "POSTED") || r[0].journalDate !== t.paymentDate || !o || !s || r[0].lines.length !== 2 || !r[0].lines.some((e) => e.accountId === o && rf(e.debit) === rf(t.amount) && e.credit === 0) || !r[0].lines.some((e) => e.accountId === s && rf(e.credit) === rf(t.amount) && e.debit === 0)) && i.push("Payment original date, bank/control accounts or amount do not match: " + t.id), e && t.allocations.some((e) => {
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
			for (let n of e) t.set(n.accountId, (t.get(n.accountId) ?? 0) + rf(n.debit) - rf(n.credit));
			return [...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t));
		};
		(t.length !== 1 || t[0].journalDate < e.journalDate || !uf(r(t[0].lines), r(e.lines.map((e) => ({
			...e,
			debit: e.credit,
			credit: e.debit
		}))))) && i.push("Original/reversal account proof failed: " + e.id);
	}
	let p = lf(n), m = r.map((e) => u.has(e.operationId) ? {
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
		i.push(...gd(p, m.map((t) => t.operationId === e ? a : t), e).map((t) => e + ": " + t));
	}
	i.push(...Eu({
		transactions: n.bankTransactions.bankTransactions,
		transfers: n.bankTransactions.bankTransfers,
		payments: p.payments,
		journals: p.journals,
		invoices: p.invoices,
		creditNotes: p.creditNotes,
		supplierBills: n.supplierBills.supplierBills,
		supplierPayments: n.supplierPayments.supplierPayments,
		supplierCredits: n.supplierCredits.supplierCredits
	}).map((e) => e.code + ": " + e.entityId)), i.push(...Ou(p).map((e) => e.code + ": " + e.entityId)), n.financialCache.supplierBills = structuredClone(n.supplierBills.supplierBills), n.financialCache.supplierCredits = structuredClone(n.supplierCredits.supplierCredits);
	try {
		te(n, e), fe(n);
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
		["AR", () => Zu({
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
		["AP", () => Fd({
			...g,
			suppliers: n.suppliers.suppliers,
			bills: n.supplierBills.supplierBills,
			payments: n.supplierPayments.supplierPayments,
			credits: n.supplierCredits.supplierCredits,
			creditAllocations: n.supplierCredits.allocations
		})],
		["Inventory/GRNI/PPV", () => Yd({
			...g,
			costMovements: n.costMovements.movements,
			receipts: n.goodsReceipts.goodsReceipts,
			matches: n.receiptMatches.matches
		})],
		["Deposits", () => Xd({
			deposits: n.customerDeposits,
			accounts: n.accounts.accounts,
			journals: [...p.journals],
			banks: n.bankAccounts.bankAccounts,
			customers: n.customers.customers,
			asOfDate: h
		})],
		["Prepayments", () => Zd({
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
function pf(t) {
	return G.require("audit.read"), e({}).strict().parse(t), ff();
}
function mf(e) {
	let t = G.require("accounting.recover"), n = tf.parse(e), r = O.list().find((e) => e.operationId === n.operationId), i = JSON.stringify(n);
	if (r) {
		if (r.kind !== "SOURCE_METADATA_REPAIR" || r.state === "COMPLETED" && r.fingerprint !== i) throw Error("Operation ID was used for different recovery data.");
		if (r.fingerprint === i || r.repairProposal?.reference === n.reference && r.repairProposal.evidenceDigest === n.expectedDigest && r.repairProposal.summary === n.summary) return r;
	}
	if (O.getUnresolved().some((e) => e.kind === "SOURCE_METADATA_REPAIR" && e.operationId !== n.operationId)) throw Error("An existing source repair proposal must be reviewed or replaced first.");
	let a = ff();
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
function hf(e) {
	let t = G.require("accounting.recover"), n = nf.parse(e), r = O.list().find((e) => e.operationId === n.operationId), i = r?.repairProposal;
	if (r?.kind !== "SOURCE_METADATA_REPAIR" || !i || i.id !== n.proposalId || i.evidenceDigest !== n.expectedDigest) throw Error("Source repair proposal changed.");
	if (i.status === "EXECUTED") {
		if (i.approver !== t.userId || i.approvalReference !== n.approvalReference) throw Error("Already executed under another approval.");
		return r;
	}
	if (i.reviewer === t.userId || r.reviewHistory?.some((e) => e.operator === t.userId)) throw Error("A different authorized operator must approve.");
	let a = ff(), o = JSON.parse(i.planJson);
	if (!a.eligible || a.evidenceDigest !== i.evidenceDigest || !uf(a.changes, o.changes)) throw Error("Source repair evidence changed. Refresh and replace the proposal.");
	let s = O.list();
	for (let e of a.changes.filter((e) => e.kind === "OPERATION")) if (s.find((t) => t.operationId === e.id)?.reviewHistory?.some((e) => e.operator === t.userId)) throw Error("Approver recorded review evidence on a source operation. Use another authorized operator.");
	return N.transaction(() => {
		for (let e of a.changes) e.kind === "INVOICE" ? sa(e.id, e.after) : e.kind === "BILL" ? us(e.id, e.after) : e.kind === "CUSTOMER_CREDIT" ? $r(e.id, e.after) : e.kind === "SUPPLIER_CREDIT" && ks(e.id, e.after);
		let e = ff();
		if (e.blockers.some((e) => e !== "No supported source metadata defects found.") || e.changes.some((e) => e.kind !== "OPERATION" && e.kind !== "PURCHASE_OPERATION")) throw Error("Post-repair source verification failed: " + e.blockers.join(" "));
		for (let [e, r] of a.changes.filter((e) => e.kind === "OPERATION").entries()) O.adoptReviewedResult(r.id, String(r.after.resultId)), O.recordManualReview(r.id, i.reference + " / " + e, i.reviewer, "Source repair " + i.id + ": exact request, original GL and settlement verified."), O.closeReviewed(r.id, String(r.after.resultId), n.approvalReference + " / " + e, t.userId);
		for (let e of a.changes.filter((e) => e.kind === "PURCHASE_OPERATION")) k.setStatus(e.id, "POSTED");
		let r = ff();
		if (r.changes.length || r.blockers.some((e) => e !== "No supported source metadata defects found.")) throw Error("Final source verification failed.");
		return O.finishRepair(n.operationId, i.id, t.userId, n.approvalReference, r.evidenceDigest);
	});
}
function gf(t) {
	let n = G.require("accounting.recover"), r = e({
		operationId: Qd,
		proposalId: Qd,
		reason: E().trim().min(10).max(500)
	}).strict().parse(t), i = ff();
	if (i.changes.length || i.blockers.some((e) => e !== "No supported source metadata defects found.")) throw Error("Source defects remain. Replace the reviewed proposal or use validated backup recovery; withdrawal cannot release unresolved source blockers.");
	return O.withdrawSourceRepair(r.operationId, r.proposalId, n.userId, r.reason);
}
//#endregion
//#region electron/security/targetedFinancialRepair.ts
var _f = E().trim().min(1).max(200), vf = E().trim().min(3).max(500), yf = E().trim().min(10).max(4e3), bf = E().regex(/^[a-f0-9]{64}$/), xf = e({ operationId: _f }).strict(), Sf = xf.extend({
	expectedDigest: bf,
	reference: vf,
	summary: yf,
	businessChecked: b(!0),
	glChecked: b(!0),
	externalEvidenceChecked: b(!0)
}).strict(), Cf = xf.extend({
	proposalId: _f,
	expectedDigest: bf,
	approvalReference: vf,
	confirm: b(!0)
}).strict(), wf = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Tf(e) {
	return Array.isArray(e) ? e.map(Tf) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).sort(([e], [t]) => e.localeCompare(t)).map(([e, t]) => [e, Tf(t)])) : e;
}
var Ef = (e) => Oe("sha256").update(JSON.stringify(Tf(e))).digest("hex");
function Df() {
	return Ef({
		business: t(),
		operations: O.list().map(({ repairProposal: e, ...t }) => t)
	});
}
function Of(e, t) {
	return typeof e == "string" ? e === t || e.startsWith(t + ":") : Array.isArray(e) ? e.some((e) => Of(e, t)) : !!e && typeof e == "object" && Object.values(e).some((e) => Of(e, t));
}
function kf(t) {
	let n = {
		amount: f().finite().positive(),
		description: E().trim().min(1).max(2e3),
		reference: E().max(2e3).optional()
	}, r = (t.kind === "BANK_TRANSACTION" ? e({
		...n,
		bankAccountId: _f,
		transactionDate: _f,
		direction: T(["MONEY_IN", "MONEY_OUT"]),
		offsetAccountId: _f
	}).strict() : e({
		...n,
		fromBankAccountId: _f,
		toBankAccountId: _f,
		transferDate: _f
	}).strict()).parse(JSON.parse(t.fingerprint));
	return {
		...r,
		amount: wf(r.amount),
		description: r.description.trim(),
		reference: r.reference?.trim() || void 0
	};
}
function Af(e) {
	let n = O.list(), r = n.find((t) => t.operationId === e), i = {
		operationId: e,
		resultId: r?.resultId,
		evidenceDigest: Df(),
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
		o = kf(r);
	} catch {
		return a("Saved bank intent is invalid or unreadable.");
	}
	if (o.amount <= 0) return a("Saved bank amount does not round to positive cents.");
	let s = Il.getTransactions(), c = Il.getTransfers(), l = I.getAll(), u = [...s, ...c].filter((e) => e.id === r.resultId), d = l.filter((e) => e.sourceType === r.kind && e.sourceId === r.resultId), f = t();
	if (l.some((e) => e.sourceId === r.resultId && e.sourceType !== r.kind)) return a("A journal with another source kind claims this bound result.");
	let p = N.read();
	if (JSON.stringify(p.transactions) !== JSON.stringify(s) || JSON.stringify(p.transfers) !== JSON.stringify(c) || JSON.stringify(p.journals) !== JSON.stringify(l)) return a("Financial cache and source repositories disagree; restore a consistent snapshot first.");
	if (new Set(l.map((e) => e.id)).size !== l.length || u.length > 1) return a("Duplicate bank or journal identities are ambiguous.");
	if (u.length === 1 && d.length === 2) {
		let t = u[0], s = d.find((e) => e.id === t.journalEntryId), c = d.find((e) => e.id !== t.journalEntryId);
		if (!s || !c || s.status !== "POSTED" || c.status !== "POSTED" || [s, c].some((e) => e.bankDuplicateCorrection || e.reversedJournalEntryId || e.reversalJournalEntryId || e.reversedAt) || !Se(s, c)) return a("Duplicate journals must be exact original postings with an unambiguous existing bank-record link.");
		let p = { ...f };
		if (delete p.journals, delete p.financialCache, Object.values(p).some((e) => Of(e, c.id)) || n.some((e) => Of(e, c.id)) || l.some((e) => e.id !== c.id && Of(e, c.id))) return a("The duplicate journal is referenced by matching, clearing or another source.");
		let m = s.journalDate;
		try {
			w(m, "Duplicate financial date"), St(m), Pt(m, c.lines.map((e) => e.accountId));
		} catch (e) {
			return a(e.message);
		}
		if (c.lines.some((e) => !F.getAll().find((t) => t.id === e.accountId)?.active) || L.getAll().some((e) => c.lines.some((t) => t.accountId === e.glAccountId) && !e.active)) return a("Duplicate correction requires active bank and GL accounts.");
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
		}, ee = { journals: [_, ...l.map((e) => e.id === c.id ? v : e)] }, y = ju(e, ee, !1), b = cd(ee);
		return pe(ee.journals).invalid.length || y.length || b.length ? a("Exact duplicate correction cannot prove an isolated repair: " + [...y, ...b.map((e) => e.code)].join(" ")) : (i.action = "REVERSE_BANK_DUPLICATE", i.journalDate = m, i.amount = o.amount, i.existingJournalId = s.id, i.duplicateJournalId = c.id, i.eligible = !0, i.changes = [
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
		w(m, "Bank intent date");
	} catch {
		return a("Saved bank intent date is invalid.");
	}
	if (i.journalDate = m, i.amount = o.amount, !u.length && !d.length) {
		if (Object.entries(f).some(([e, t]) => e !== "financialCache" && Of(t, r.resultId))) return a("Other business records still reference the bound result.");
		let e = cd();
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
		if (delete t.journals, delete t.financialCache, Object.values(t).some((e) => Of(e, r.resultId))) return a("Another repository references the missing bank result.");
		if ([...s.map((e) => e.transactionNumber), ...c.map((e) => e.transferNumber)].includes(h)) return a("Recovered business number is already in use.");
		let n = "transactionNumber" in g ? { transactions: [g, ...s] } : { transfers: [g, ...c] }, o = ju(e, n, !1), l = cd(n);
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
			if (delete e.bankTransactions, delete e.financialCache, Object.values(e).some((e) => Of(e, t.journalEntryId))) return a("The stale missing journal is still referenced by another repository.");
		}
		let o = {
			...t,
			journalEntryId: n.id
		}, p = "transactionNumber" in o ? { transactions: s.map((e) => e.id === o.id ? o : e) } : { transfers: c.map((e) => e.id === o.id ? o : e) }, m = ju(e, p, !1), h = cd(p);
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
		if (delete n.bankTransactions, delete n.financialCache, Object.values(n).some((e) => Of(e, t.journalEntryId))) return a("Missing journal is referenced by clearing, matching or another repository.");
		let d = "bankAccountId" in g ? L.getById(g.bankAccountId) : void 0, p = "fromBankAccountId" in g ? L.getById(g.fromBankAccountId) : void 0, h = "toBankAccountId" in g ? L.getById(g.toBankAccountId) : void 0, _ = "direction" in g ? g.direction === "MONEY_IN" ? d?.glAccountId : g.offsetAccountId : h?.glAccountId, v = "direction" in g ? g.direction === "MONEY_IN" ? g.offsetAccountId : d?.glAccountId : p?.glAccountId;
		if (!_ || !v) return a("Bank GL mapping is missing.");
		try {
			St(m), Pt(m, [_, v]);
		} catch (e) {
			return a(e.message);
		}
		if ([
			d,
			p,
			h
		].filter(Boolean).some((e) => !e.active) || [_, v].some((e) => !F.getAll().find((t) => t.id === e)?.active)) return a("Missing-journal repair requires currently active bank and GL accounts.");
		let ee = {
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
		}, y = "repair-preview:" + r.operationId;
		if (l.some((e) => e.id === y)) return a("Preview journal identity collision.");
		let b = {
			id: y,
			journalNumber: "Pending repair approval",
			journalDate: m,
			description: o.description,
			reference: o.reference,
			sourceType: ee.sourceType,
			sourceId: r.resultId,
			status: "POSTED",
			lines: ee.lines.map((e, t) => {
				let n = F.requireById(e.accountId);
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
		}, x = {
			...t,
			journalEntryId: y
		}, te = "transactionNumber" in x ? {
			transactions: s.map((e) => e.id === x.id ? x : e),
			journals: [b, ...l]
		} : {
			transfers: c.map((e) => e.id === x.id ? x : e),
			journals: [b, ...l]
		}, ne = ju(e, te, !1), S = cd(te);
		return ne.length || S.length ? a("Business record and saved intent cannot prove an isolated missing-journal repair: " + [...ne, ...S.map((e) => e.code)].join(" ")) : (i.action = "RESTORE_BANK_JOURNAL", i.previousJournalId = t.journalEntryId, i.debitAccountId = _, i.creditAccountId = v, i.eligible = !0, i.changes = [
			"Post one source-owned GL journal on the original financial date and relink this bank record to the new journal.",
			"Debit " + _ + " " + o.amount.toFixed(2) + "; credit " + v + " " + o.amount.toFixed(2) + ".",
			"No payment is sent and no other journal is altered. The missing previous journal identity stays in the saved repair plan."
		], {
			public: i,
			draft: ee,
			projectedJournal: b
		});
	}
	return a("Existing business and GL effects must use verified closure, or remain blocked if their evidence conflicts.");
}
function jf(e) {
	return G.require("audit.read"), Af(xf.parse(e).operationId).public;
}
function Mf(e) {
	let t = G.require("accounting.recover"), n = Sf.parse(e), r = Af(n.operationId).public;
	if (!r.eligible || !r.action) throw Error("Targeted repair blocked: " + r.blockers.join(" "));
	if (r.evidenceDigest !== n.expectedDigest) throw Error("Repair evidence changed. Refresh the preview.");
	let i = crypto.randomUUID();
	O.recordManualReview(n.operationId, n.reference, t.userId, n.summary + " · Proposed " + r.action + " · " + i);
	let a = Af(n.operationId).public;
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
function Nf(e) {
	let n = G.require("accounting.recover"), r = Cf.parse(e), i = O.list().find((e) => e.operationId === r.operationId), a = i?.repairProposal;
	if (!i || !a || a.id !== r.proposalId || a.evidenceDigest !== r.expectedDigest) throw Error("Repair proposal changed. Refresh the preview.");
	if (a.status === "EXECUTED") {
		if (a.approver !== n.userId || a.approvalReference !== r.approvalReference) throw Error("Repair was already executed with a different approval.");
		return structuredClone(i);
	}
	if (i.state !== "MANUAL_REVIEW" || a.reviewer === n.userId || i.reviewHistory?.some((e) => e.operator === n.userId)) throw Error("Repair approval requires a different authorized operator.");
	if (i.reviewHistory?.some((e) => e.reference === r.approvalReference)) throw Error("Approval reference must differ from review evidence.");
	let o = Af(r.operationId), s = o.public;
	if (!s.eligible || s.action !== a.action || s.evidenceDigest !== a.evidenceDigest) throw Error("Repair evidence changed or is no longer eligible. Refresh and propose again.");
	let c = () => {
		let e = s.existingJournalId;
		if (s.action === "RESTORE_BANK_RECORD") zl(o.record);
		else if (s.action === "RESTORE_BANK_JOURNAL_LINK") Bl(i.resultId, s.previousJournalId, s.existingJournalId);
		else if (s.action === "REVERSE_BANK_DUPLICATE") G.require("banking.write"), G.require("accounting.post"), e = vn(s.duplicateJournalId, s.existingJournalId, i.operationId, "Approved duplicate correction " + a.id + "; " + r.approvalReference).id;
		else if (s.action === "RESTORE_BANK_JOURNAL") {
			G.require("banking.write"), G.require("accounting.post");
			let t = I.post(o.draft);
			e = t.id, Bl(i.resultId, s.previousJournalId, t.id);
		}
		let c = cd();
		if (c.length) throw Error("Post-repair consistency checks failed: " + c.map((e) => e.code).join(", "));
		if (s.action !== "CANCEL_NO_EFFECT") {
			let e = ju(r.operationId);
			if (e.length) throw Error("Post-repair source proof failed: " + e.join(" "));
		} else if (Af(r.operationId).public.action !== "CANCEL_NO_EFFECT") throw Error("No-effect evidence changed before cancellation.");
		return O.finishRepair(r.operationId, a.id, n.userId, r.approvalReference, Ef(t()), e);
	};
	return s.action === "CANCEL_NO_EFFECT" ? c() : N.transaction(c);
}
//#endregion
//#region src/features/document-output/purchaseOutputRepository.ts
var Pf = E().min(1).max(200), Ff = E().max(2e4), If = f().finite().nonnegative(), Lf = ["PURCHASE_ORDER", "REMITTANCE"], Rf = e({
	operationId: Pf,
	kind: T(Lf),
	sourceId: Pf,
	expectedRevision: E().min(1).max(5e5),
	templateId: Pf.optional()
}).strict(), zf = e({
	id: Pf,
	description: Ff,
	reference: Ff,
	quantity: f().finite().positive(),
	unit: Ff,
	unitPrice: If,
	net: If,
	tax: If,
	total: If,
	taxCode: Ff.optional(),
	taxRate: f().finite().min(0).max(1).optional()
}).strict(), Bf = e({
	id: Pf,
	revision: Pf,
	name: Ff,
	subject: Ff,
	body: Ff,
	footer: Ff,
	paper: T(["A4", "Letter"])
}).strict(), Vf = e({
	id: Pf,
	operationId: Pf,
	requestFingerprint: E().max(1e6),
	kind: T(Lf),
	sourceId: Pf,
	sourceRevision: E().min(1).max(5e5),
	preparedAt: Pf,
	preparedBy: Pf,
	documentNumber: Pf,
	status: Pf,
	date: Pf,
	expectedDeliveryDate: Ff.optional(),
	reference: Ff.optional(),
	notes: Ff.optional(),
	supplierId: Pf,
	supplierName: Ff,
	supplierCode: Ff,
	supplierEmail: Ff.optional(),
	supplierContact: Ff.optional(),
	supplierAddress: Ff,
	supplierMetadataAt: Pf,
	issuer: e({
		name: Ff,
		identifier: Ff,
		address: Ff,
		email: Ff,
		currency: Pf
	}).strict(),
	method: Ff.optional(),
	noncash: y(),
	lines: s(zf).min(1),
	subtotal: If,
	tax: If,
	total: If,
	template: Bf,
	subject: Ff,
	body: Ff
}).strict(), Hf = (e) => e === "PURCHASE_ORDER" ? "Purchase order" : "Remittance";
function Uf(e, t) {
	let n = e === "PURCHASE_ORDER" ? Fa.getById(t) : td.getById(t);
	if (!n) throw Error("Purchase output source was not found.");
	return n;
}
function Wf(e, t) {
	let n = Uf(e, t), r = Sa.getById(n.supplierId);
	if (!r) throw Error("Source supplier was not found.");
	return JSON.stringify([n, r]);
}
var Gf = (e, t) => g(e, "accounting.read") || t === "PURCHASE_ORDER" && g(e, "purchases.write"), Kf = [], qf = 0, Jf = /* @__PURE__ */ new Set(), Yf = () => {
	qf++, Jf.forEach((e) => e());
};
function Xf() {
	return (x.templates ?? []).filter((e) => e.status === "Active" && ["Purchase order", "Remittance"].includes(e.kind));
}
function Zf(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!Object.hasOwn(t, n)) throw Error("Unsupported purchase template token: " + n);
		return t[n];
	});
}
function Qf(e) {
	let t = Vf.parse(e), n = Rf.parse(JSON.parse(t.requestFingerprint));
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
	w(t.date), t.expectedDeliveryDate && w(t.expectedDeliveryDate);
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
		let t = Rf.parse(e), n = G.require("purchases.read");
		if (!Gf(n, t.kind) || t.kind === "REMITTANCE" && !g(n, "accounting.post") || t.kind === "PURCHASE_ORDER" && !g(n, "accounting.post") && !g(n, "purchases.write")) throw Error("Permission denied: purchase document preparation.");
		let r = JSON.stringify(t), i = Kf.find((e) => e.operationId === t.operationId);
		if (i) {
			if (i.requestFingerprint !== r) throw Error("Operation ID was used for different output data.");
			return i;
		}
		let a = Uf(t.kind, t.sourceId), o = Sa.getById(a.supplierId);
		if (Wf(t.kind, t.sourceId) !== t.expectedRevision) throw Error("Source or supplier changed. Refresh before preparing output.");
		let s = C(), c = t.templateId ? Xf().find((e) => e.id === t.templateId && e.kind === Hf(t.kind)) : void 0;
		if (t.templateId && !c) throw Error("Select an active matching purchase template.");
		let l = t.kind === "PURCHASE_ORDER" ? Fa.getById(t.sourceId) : void 0, u = t.kind === "REMITTANCE" ? td.getById(t.sourceId) : void 0, d = l ? l.lines.map((e) => ({
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
			name: c?.name ?? "Standard " + Hf(t.kind),
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
				footer: Zf(m.footer, p)
			},
			subject: Zf(m.subject, p),
			body: Zf(m.body, p)
		};
		return Qf(h), Kf = [h, ...Kf], Yf(), h;
	} },
	read: "purchases.read",
	commands: { prepare: "purchases.read" },
	snapshot: () => ({
		artifacts: Kf,
		templates: Xf().map((e) => ({
			id: e.id,
			name: e.name,
			kind: e.kind
		}))
	}),
	restore: (e) => {
		Kf = e.artifacts, e.templates;
	},
	publish: Yf,
	view: (e) => ({
		artifacts: Kf.filter((t) => Gf(e, t.kind)),
		templates: Xf().filter((t) => Gf(e, t.kind === "Purchase order" ? "PURCHASE_ORDER" : "REMITTANCE")).map((e) => ({
			id: e.id,
			name: e.name,
			kind: e.kind
		}))
	}),
	validate: (t, n) => {
		let r = e({
			artifacts: s(Vf),
			templates: s(e({
				id: Pf,
				name: Ff,
				kind: Pf
			}).strict())
		}).strict().parse(t).artifacts, i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set(), o = n;
		for (let e of r) {
			if (Qf(e), a.has(e.id) || i.has(e.operationId)) throw Error("Duplicate purchase output.");
			a.add(e.id), i.add(e.operationId);
			let t = (e.kind === "PURCHASE_ORDER" ? o.purchaseOrders.purchaseOrders : o.supplierPayments.supplierPayments).find((t) => t.id === e.sourceId);
			if (!t || t.supplierId !== e.supplierId) throw Error("Invalid purchase output source reference.");
		}
	}
});
//#endregion
//#region src/features/sales/data/recoveryWorkbench.ts
var $f = [
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
];
function ep() {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let e = h("business.command", {
			repository: "salesRecovery",
			method: "inspectRecovery",
			args: []
		});
		return Te(e.view), e.result;
	}
	let e = G.require("audit.read"), t = O.list(), n = B.getAll(), r = {
		quotes: n.filter((e) => e.type === "QUOTE"),
		salesOrders: n.filter((e) => e.type === "SALES_ORDER"),
		invoices: n.filter((e) => e.type === "INVOICE"),
		payments: Ai.getAll(),
		creditNotes: z.getAll(),
		allocations: z.getAllAllocations(),
		journals: I.getAll()
	}, i = cd(), a = t.filter((e) => e.state !== "COMPLETED" || e.reviewHistory?.length).map((n) => {
		let a = $f.includes(n.kind) || Au(n.kind) || n.kind === "BANK_RECONCILIATION", o = [], s = (e, t) => {
			o.some((e) => e.path === t) || o.push({
				label: e,
				path: t
			});
		};
		if (n.kind === "BANK_RECONCILIATION") {
			let e = Fn.getAll().find((e) => e.id === n.resultId);
			s("Bank reconciliation records", e ? "/banking/accounts/" + encodeURIComponent(e.bankAccountId) : "/banking");
		}
		if (Au(n.kind)) {
			let e = (n.kind === "BANK_TRANSACTION" ? Il.getTransactions() : Il.getTransfers()).find((e) => e.id === n.resultId);
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
		let d = n.state === "COMPLETED" ? [] : a ? n.kind === "BANK_RECONCILIATION" ? ku(n.operationId) : Au(n.kind) ? ju(n.operationId) : gd(r, t, n.operationId) : ["This operation kind has no verified closure procedure. It remains blocked; do not replay it."];
		return n.state !== "COMPLETED" && a && (n.kind !== "BANK_RECONCILIATION" && !Au(n.kind) && d.push(...vd(n.operationId)), i.length && d.push("Financial consistency checks failed: " + i.map((e) => e.code).join(", ")), n.reviewHistory?.some((t) => t.operator.trim().toLowerCase() === e.userId.toLowerCase()) && d.push("A different authorized operator must approve; this account recorded review evidence."), g(e, "accounting.recover") || d.push("Your role can inspect but cannot approve recovery.")), {
			...structuredClone(n),
			supported: a,
			revision: md(n),
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
//#region src/features/supplier-prepayments/supplierPrepaymentRepository.ts
var tp = (e) => Math.round((e + 2 ** -52) * 100) / 100, np = E().trim().min(1).max(200), rp = np.refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}), ip = f().finite().positive().refine((e) => tp(e) === e), ap = E().trim().min(3).max(2e3), op = E().trim().max(500).default(""), sp = e({
	operationId: np,
	supplierId: np,
	date: rp,
	bankAccountId: np,
	amount: ip,
	reference: op,
	reason: ap
}).strict(), cp = e({
	operationId: np,
	prepaymentId: np,
	supplierBillId: np,
	date: rp,
	amount: ip,
	reference: op,
	reason: ap
}).strict(), lp = e({
	operationId: np,
	prepaymentId: np,
	bankAccountId: np,
	date: rp,
	amount: ip,
	reference: op,
	reason: ap
}).strict(), up = {
	id: np,
	fingerprint: E(),
	journalId: np,
	status: T(["POSTED", "REVERSED"]),
	createdBy: np,
	createdAt: np,
	reversalDate: rp.optional(),
	reversalReason: ap.optional(),
	reversedBy: np.optional()
}, dp = sp.extend({
	...up,
	assetAccountId: np
}).strict(), fp = cp.extend({
	...up,
	paymentId: np
}).strict(), pp = lp.extend(up).strict(), mp = e({
	prepayments: s(dp),
	applications: s(fp),
	refunds: s(pp),
	settings: s(e({
		id: np,
		assetAccountId: np
	}).strict()).max(1)
}).strict(), hp = {
	prepayments: [],
	applications: [],
	refunds: [],
	settings: []
}, gp = 0, _p = /* @__PURE__ */ new Set(), vp = () => {
	gp++, _p.forEach((e) => e());
};
function yp(e) {
	let t = hp.prepayments.find((t) => t.id === e);
	if (!t) throw Error("Supplier prepayment not found.");
	return t;
}
function bp(e) {
	let t = yp(e);
	return t.status === "REVERSED" ? 0 : tp(t.amount - hp.applications.filter((t) => t.prepaymentId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0) - hp.refunds.filter((t) => t.prepaymentId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
}
function xp(e, t) {
	let n = e.prepayments.find((e) => e.id === t), r = /* @__PURE__ */ new Map(), i = (e, t) => r.set(e, tp((r.get(e) ?? 0) + t));
	i(n.date, n.amount), n.reversalDate && i(n.reversalDate, -n.amount);
	for (let r of [...e.applications, ...e.refunds].filter((e) => e.prepaymentId === t)) {
		if (r.date < n.date || r.reversalDate && r.reversalDate < r.date) throw Error("Prepayment event dates are invalid.");
		i(r.date, -r.amount), r.reversalDate && i(r.reversalDate, r.amount);
	}
	let a = 0;
	for (let [, e] of [...r].sort(([e], [t]) => e.localeCompare(t))) if (a = tp(a + e), a < 0) throw Error("Prepayment would be overdrawn on a historical date.");
}
function Sp(e) {
	let t = JSON.stringify(e), n = [
		...hp.prepayments,
		...hp.applications,
		...hp.refunds
	].find((t) => t.operationId === e.operationId);
	if (n && n.fingerprint !== t) throw Error("Operation ID already used with different prepayment data.");
	return {
		prior: n,
		fingerprint: t
	};
}
function Cp(e) {
	let t = F.requireById(e);
	if (!t.active || t.type !== "ASSET" || t.systemRole || t.allowManualPosting) throw Error("Use the dedicated active prepayment asset account.");
	return t;
}
function wp(e, t) {
	let n = L.requireById(e), r = F.requireById(n.glAccountId);
	if (!n.active || t < n.openingBalanceDate || !r.active || r.type !== "ASSET") throw Error("Use an active bank account and a date after its opening balance.");
	return n;
}
function Tp(e) {
	w(e), St(e), A();
}
function Ep(e, t, n = crypto.randomUUID()) {
	return {
		id: n,
		fingerprint: e,
		journalId: t,
		status: "POSTED",
		createdBy: G.require("purchases.payment").userId,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
i("supplierPrepayments", {
	repository: {
		setupDefaults() {
			if (G.require("accounting.post"), hp.settings[0]) return hp.settings[0];
			let e = 1390;
			for (; F.getAll().some((t) => t.code === String(e));) e++;
			let t = F.create({
				code: String(e),
				name: "Supplier prepayments paid",
				type: "ASSET",
				active: !0,
				allowManualPosting: !1
			}), n = {
				id: crypto.randomUUID(),
				assetAccountId: t.id
			};
			return hp.settings = [n], vp(), n;
		},
		balance(e) {
			return G.require("purchases.read"), bp(e);
		},
		pay(e) {
			G.require("purchases.payment");
			let t = sp.parse(e), { prior: n, fingerprint: r } = Sp(t);
			if (n) return n;
			Tp(t.date);
			let i = Sa.getById(t.supplierId);
			if (!i || i.status === "INACTIVE") throw Error("Choose an active supplier.");
			let a = hp.settings[0];
			if (!a) throw Error("Configure the prepayment asset account first.");
			Cp(a.assetAccountId);
			let o = wp(t.bankAccountId, t.date), s = crypto.randomUUID(), c = I.post({
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
				...Ep(r, c.id, s),
				assetAccountId: a.assetAccountId
			};
			return hp.prepayments = [...hp.prepayments, l], vp(), l;
		},
		apply(e) {
			G.require("purchases.payment");
			let t = cp.parse(e), { prior: n, fingerprint: r } = Sp(t);
			if (n) return n;
			Tp(t.date);
			let i = yp(t.prepaymentId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > bp(i.id)) throw Error("Prepayment date or available balance is insufficient.");
			Cp(i.assetAccountId);
			let a = ss.getById(t.supplierBillId);
			if (!a || a.supplierId !== i.supplierId || ["VOID", "DRAFT"].includes(a.status) || t.date < a.billDate) throw Error("Choose an issued bill for the same supplier.");
			if (t.amount > a.totals.amountDue) throw Error("Prepayment application exceeds bill amount due.");
			let o = crypto.randomUUID(), s = "prepayment-payment:" + o;
			td.recordPrepaymentSettlement({
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
			let c = I.post({
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
					accountId: F.requireBySystemRole("ACCOUNTS_PAYABLE").id,
					debit: t.amount,
					credit: 0
				}]
			}), l = {
				...t,
				...Ep(r, c.id, o),
				paymentId: s
			};
			return hp.applications = [...hp.applications, l], xp(hp, i.id), vp(), l;
		},
		refund(e) {
			G.require("purchases.payment");
			let t = lp.parse(e), { prior: n, fingerprint: r } = Sp(t);
			if (n) return n;
			Tp(t.date);
			let i = yp(t.prepaymentId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > bp(i.id)) throw Error("Refund exceeds the available prepayment.");
			Cp(i.assetAccountId);
			let a = wp(t.bankAccountId, t.date), o = crypto.randomUUID(), s = I.post({
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
				...Ep(r, s.id, o)
			};
			return hp.refunds = [...hp.refunds, c], xp(hp, i.id), vp(), c;
		},
		reverse(t) {
			let n = G.require("purchases.payment"), r = e({
				entity: T([
					"prepayments",
					"applications",
					"refunds"
				]),
				id: np,
				reversalDate: rp,
				reason: ap
			}).strict().parse(t), i = hp[r.entity].find((e) => e.id === r.id);
			if (!i) throw Error("Prepayment record not found.");
			if (i.status === "REVERSED") return i;
			if (Tp(r.reversalDate), r.reversalDate < i.date) throw Error("Prepayment reversal cannot precede its original date.");
			let a = r.entity === "prepayments" ? i.id : i.prepaymentId;
			if (r.entity === "prepayments" && [...hp.applications, ...hp.refunds].some((e) => e.prepaymentId === i.id && e.status === "POSTED")) throw Error("Reverse prepayment applications and refunds before reversing its receipt.");
			Us(i.journalId), I.reverse({
				journalEntryId: i.journalId,
				reversalDate: r.reversalDate,
				reason: r.reason
			});
			let o = {
				...i,
				status: "REVERSED",
				reversalDate: r.reversalDate,
				reversalReason: r.reason,
				reversedBy: n.userId
			};
			if (hp[r.entity] = hp[r.entity].map((e) => e.id === r.id ? o : e), r.entity === "applications") {
				let e = i;
				td.reversePrepaymentSettlement(e.paymentId, r.reversalDate, r.reason);
			}
			return xp(hp, a), vp(), o;
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
	snapshot: () => hp,
	restore: (e) => {
		hp = e;
	},
	publish: vp,
	validate: (e, t) => {
		let n = mp.parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.settings) {
			let t = r.accounts.accounts.find((t) => t.id === e.assetAccountId);
			if (!t || t.type !== "ASSET" || t.systemRole || t.allowManualPosting) throw Error("Invalid prepayment asset mapping.");
		}
		let a = (e) => {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) t.set(n.accountId, tp((t.get(n.accountId) ?? 0) + n.debit - n.credit));
			return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
		};
		for (let e of [
			"prepayments",
			"applications",
			"refunds"
		]) for (let t of n[e]) {
			let o = (e === "prepayments" ? sp : e === "applications" ? cp : lp).parse(JSON.parse(t.fingerprint));
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
		for (let e of n.prepayments) if (xp(n, e.id), e.status === "REVERSED" && [...n.applications, ...n.refunds].some((t) => t.prepaymentId === e.id && (t.status === "POSTED" || t.reversalDate > e.reversalDate))) throw Error("Reversed prepayment has later consumption.");
		for (let e of r.supplierPayments.supplierPayments) if (e.prepaymentApplicationId && !n.applications.some((t) => t.id === e.prepaymentApplicationId && t.paymentId === e.id && t.prepaymentId === e.prepaymentId)) throw Error("Orphan prepayment settlement payment.");
	}
});
//#endregion
//#region src/features/customer-deposits/customerDepositRepository.ts
var Dp = (e) => Math.round((e + 2 ** -52) * 100) / 100, Op = E().trim().min(1).max(200), kp = Op.refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}), Ap = f().finite().positive().refine((e) => Dp(e) === e), jp = E().trim().min(3).max(2e3), Mp = E().trim().max(500).default(""), Np = e({
	operationId: Op,
	customerId: Op,
	date: kp,
	bankAccountId: Op,
	amount: Ap,
	reference: Mp,
	reason: jp
}).strict(), Pp = e({
	operationId: Op,
	depositId: Op,
	invoiceId: Op,
	date: kp,
	amount: Ap,
	reference: Mp,
	reason: jp
}).strict(), Fp = e({
	operationId: Op,
	depositId: Op,
	bankAccountId: Op,
	date: kp,
	amount: Ap,
	reference: Mp,
	reason: jp
}).strict(), Ip = {
	id: Op,
	fingerprint: E(),
	journalId: Op,
	status: T(["POSTED", "REVERSED"]),
	createdBy: Op,
	createdAt: Op,
	reversalDate: kp.optional(),
	reversalReason: jp.optional(),
	reversedBy: Op.optional()
}, Lp = Np.extend({
	...Ip,
	liabilityAccountId: Op
}).strict(), Rp = Pp.extend({
	...Ip,
	paymentId: Op
}).strict(), zp = Fp.extend(Ip).strict(), Bp = e({
	deposits: s(Lp),
	applications: s(Rp),
	refunds: s(zp),
	settings: s(e({
		id: Op,
		liabilityAccountId: Op
	}).strict()).max(1)
}).strict(), Vp = {
	deposits: [],
	applications: [],
	refunds: [],
	settings: []
}, Hp = 0, Up = /* @__PURE__ */ new Set(), Wp = () => {
	Hp++, Up.forEach((e) => e());
};
function Gp(e) {
	let t = Vp.deposits.find((t) => t.id === e);
	if (!t) throw Error("Customer deposit not found.");
	return t;
}
function Kp(e) {
	let t = Gp(e);
	return t.status === "REVERSED" ? 0 : Dp(t.amount - Vp.applications.filter((t) => t.depositId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0) - Vp.refunds.filter((t) => t.depositId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
}
function qp(e, t) {
	let n = e.deposits.find((e) => e.id === t), r = /* @__PURE__ */ new Map(), i = (e, t) => r.set(e, Dp((r.get(e) ?? 0) + t));
	i(n.date, n.amount), n.reversalDate && i(n.reversalDate, -n.amount);
	for (let r of [...e.applications, ...e.refunds].filter((e) => e.depositId === t)) {
		if (r.date < n.date || r.reversalDate && r.reversalDate < r.date) throw Error("Deposit event dates are invalid.");
		i(r.date, -r.amount), r.reversalDate && i(r.reversalDate, r.amount);
	}
	let a = 0;
	for (let [, e] of [...r].sort(([e], [t]) => e.localeCompare(t))) if (a = Dp(a + e), a < 0) throw Error("Deposit would be overdrawn on a historical date.");
}
function Jp(e) {
	let t = JSON.stringify(e), n = [
		...Vp.deposits,
		...Vp.applications,
		...Vp.refunds
	].find((t) => t.operationId === e.operationId);
	if (n && n.fingerprint !== t) throw Error("Operation ID already used with different deposit data.");
	return {
		prior: n,
		fingerprint: t
	};
}
function Yp(e) {
	let t = F.requireById(e);
	if (!t.active || t.type !== "LIABILITY" || t.systemRole || t.allowManualPosting) throw Error("Use the dedicated active deposit liability account.");
	return t;
}
function Xp(e, t) {
	let n = L.requireById(e), r = F.requireById(n.glAccountId);
	if (!n.active || t < n.openingBalanceDate || !r.active || r.type !== "ASSET") throw Error("Use an active bank account and a date after its opening balance.");
	return n;
}
function Zp(e) {
	w(e), St(e), A();
}
function Qp(e, t, n = crypto.randomUUID()) {
	return {
		id: n,
		fingerprint: e,
		journalId: t,
		status: "POSTED",
		createdBy: G.require("sales.payment").userId,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
i("customerDeposits", {
	repository: {
		setupDefaults() {
			if (G.require("accounting.post"), Vp.settings[0]) return Vp.settings[0];
			let e = 2290;
			for (; F.getAll().some((t) => t.code === String(e));) e++;
			let t = F.create({
				code: String(e),
				name: "Customer deposits held",
				type: "LIABILITY",
				active: !0,
				allowManualPosting: !1
			}), n = {
				id: crypto.randomUUID(),
				liabilityAccountId: t.id
			};
			return Vp.settings = [n], Wp(), n;
		},
		balance(e) {
			return G.require("sales.read"), Kp(e);
		},
		receive(e) {
			G.require("sales.payment");
			let t = Np.parse(e), { prior: n, fingerprint: r } = Jp(t);
			if (n) return n;
			Zp(t.date);
			let i = R.getById(t.customerId);
			if (!i || i.status === "INACTIVE") throw Error("Choose an active customer.");
			let a = Vp.settings[0];
			if (!a) throw Error("Configure the deposit liability account first.");
			Yp(a.liabilityAccountId);
			let o = Xp(t.bankAccountId, t.date), s = crypto.randomUUID(), c = I.post({
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
				...Qp(r, c.id, s),
				liabilityAccountId: a.liabilityAccountId
			};
			return Vp.deposits = [...Vp.deposits, l], Wp(), l;
		},
		apply(e) {
			G.require("sales.payment");
			let t = Pp.parse(e), { prior: n, fingerprint: r } = Jp(t);
			if (n) return n;
			Zp(t.date);
			let i = Gp(t.depositId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > Kp(i.id)) throw Error("Deposit date or available balance is insufficient.");
			Yp(i.liabilityAccountId);
			let a = B.getAll().find((e) => e.id === t.invoiceId && e.type === "INVOICE");
			if (!a || a.type !== "INVOICE" || a.customerId !== i.customerId || ["VOID", "DRAFT"].includes(a.status) || t.date < a.documentDate) throw Error("Choose an issued invoice for the same customer.");
			let o = B.recalculateInvoiceBalance(a.id);
			if (t.amount > o.amountDue) throw Error("Deposit application exceeds invoice amount due.");
			let s = crypto.randomUUID(), c = "deposit-payment:" + s;
			Ai.recordDepositSettlement({
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
			let l = I.post({
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
					accountId: F.requireBySystemRole("ACCOUNTS_RECEIVABLE").id,
					debit: 0,
					credit: t.amount
				}]
			}), u = {
				...t,
				...Qp(r, l.id, s),
				paymentId: c
			};
			return Vp.applications = [...Vp.applications, u], qp(Vp, i.id), B.recalculateInvoiceBalance(a.id), Wp(), u;
		},
		refund(e) {
			G.require("sales.payment");
			let t = Fp.parse(e), { prior: n, fingerprint: r } = Jp(t);
			if (n) return n;
			Zp(t.date);
			let i = Gp(t.depositId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > Kp(i.id)) throw Error("Refund exceeds the available deposit.");
			Yp(i.liabilityAccountId);
			let a = Xp(t.bankAccountId, t.date), o = crypto.randomUUID(), s = I.post({
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
				...Qp(r, s.id, o)
			};
			return Vp.refunds = [...Vp.refunds, c], qp(Vp, i.id), Wp(), c;
		},
		reverse(t) {
			let n = G.require("sales.payment"), r = e({
				entity: T([
					"deposits",
					"applications",
					"refunds"
				]),
				id: Op,
				reversalDate: kp,
				reason: jp
			}).strict().parse(t), i = Vp[r.entity].find((e) => e.id === r.id);
			if (!i) throw Error("Deposit record not found.");
			if (i.status === "REVERSED") return i;
			if (Zp(r.reversalDate), r.reversalDate < i.date) throw Error("Deposit reversal cannot precede its original date.");
			let a = r.entity === "deposits" ? i.id : i.depositId;
			if (r.entity === "deposits" && [...Vp.applications, ...Vp.refunds].some((e) => e.depositId === i.id && e.status === "POSTED")) throw Error("Reverse deposit applications and refunds before reversing its receipt.");
			Us(i.journalId), I.reverse({
				journalEntryId: i.journalId,
				reversalDate: r.reversalDate,
				reason: r.reason
			});
			let o = {
				...i,
				status: "REVERSED",
				reversalDate: r.reversalDate,
				reversalReason: r.reason,
				reversedBy: n.userId
			};
			if (Vp[r.entity] = Vp[r.entity].map((e) => e.id === r.id ? o : e), r.entity === "applications") {
				let e = i;
				Ai.reverseDepositSettlement(e.paymentId, r.reversalDate, r.reason), B.recalculateInvoiceBalance(e.invoiceId);
			}
			return qp(Vp, a), Wp(), o;
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
	snapshot: () => Vp,
	restore: (e) => {
		Vp = e;
	},
	publish: Wp,
	validate: (e, t) => {
		let n = Bp.parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.settings) {
			let t = r.accounts.accounts.find((t) => t.id === e.liabilityAccountId);
			if (!t || t.type !== "LIABILITY" || t.systemRole || t.allowManualPosting) throw Error("Invalid deposit liability mapping.");
		}
		let a = (e) => {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) t.set(n.accountId, Dp((t.get(n.accountId) ?? 0) + n.debit - n.credit));
			return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
		};
		for (let e of [
			"deposits",
			"applications",
			"refunds"
		]) for (let t of n[e]) {
			let o = (e === "deposits" ? Np : e === "applications" ? Pp : Fp).parse(JSON.parse(t.fingerprint));
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
		for (let e of n.deposits) if (qp(n, e.id), e.status === "REVERSED" && [...n.applications, ...n.refunds].some((t) => t.depositId === e.id && (t.status === "POSTED" || t.reversalDate > e.reversalDate))) throw Error("Reversed deposit has later consumption.");
		for (let e of r.customerPayments.payments) if (e.depositApplicationId && !n.applications.some((t) => t.id === e.depositApplicationId && t.paymentId === e.id && t.depositId === e.depositId)) throw Error("Orphan deposit settlement payment.");
	}
});
//#endregion
//#region src/features/accounting/data/inventoryAccountingPostingService.ts
function $p(e) {
	return F.requireBySystemRole(e).id;
}
function em(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function tm(e) {
	return I.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function nm(e) {
	let t = ho.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var rm = {
	postSalesFulfilment(e) {
		let t = tm(e.id);
		if (t) return t;
		let n = em(nm(e).reduce((e, t) => {
			if (t.valueChange > 0) throw Error(`Sales fulfilment cost movement ${t.costMovementNumber} has an invalid positive inventory value change.`);
			return e - t.valueChange;
		}, 0));
		if (!Number.isFinite(n) || n < 0) throw Error("Sales fulfilment COGS amount is invalid.");
		if (n !== 0) return I.post({
			journalDate: e.fulfilmentDate,
			description: `COGS for sales fulfilment ${e.fulfilmentNumber}`,
			reference: e.fulfilmentNumber,
			sourceType: "SALES_FULFILMENT",
			sourceId: e.id,
			lines: [{
				accountId: $p("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: $p("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = tm(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? I.getById(r.reversalJournalEntryId) : void 0 : I.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, im = /* @__PURE__ */ new Set(), am = [], om = am;
function sm() {
	om = am, im.forEach((e) => e());
}
function cm() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = am.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function lm(e, t) {
	return V(am.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function um(e) {
	let t = B.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.filter(Hn).map((e) => lm(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.filter(Hn).every((e, t) => n[t] >= V(e.quantity));
	B.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function dm(e) {
	let t = ho.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var fm = {
	subscribe(e) {
		return im.add(e), () => {
			im.delete(e);
		};
	},
	getSnapshot() {
		return om;
	},
	getAll() {
		return om;
	},
	getById(e) {
		return am.find((t) => t.id === e);
	},
	getBySalesOrder(e) {
		return am.filter((t) => t.salesOrderId === e);
	},
	getFulfilledQuantity: lm,
	getRemainingQuantity(e, t) {
		let n = B.getById(e);
		if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let r = n.lines.find((e) => e.id === t);
		if (!r) throw Error("Sales order line was not found.");
		return Hn(r) ? V(r.quantity - lm(e, t)) : 0;
	},
	create(e) {
		let t = B.getById(e.salesOrderId);
		if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let n = t;
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "INVOICED") throw Error("Only a confirmed or partially fulfilled sales order can be fulfilled.");
		if (n.status === "INVOICED" && !n.invoiceIds.some((e) => {
			let t = B.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("This order has no active invoice; do not fulfil a void invoice.");
		let r = $a.getById(e.siteId);
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
			if (!Hn(t)) throw Error("Non-stock and service lines do not require inventory dispatch.");
			let i = Gn(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let o = Kn(t.productId, t.unitId);
			if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
			if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
			let s = V(e.fulfilledQuantity);
			if (t.areaPerPack && !Number.isInteger(e.fulfilledQuantity)) throw Error("Area-based lines must be dispatched in whole packs.");
			let c = lm(n.id, t.id);
			if (s > V(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
			let l = V(s * o.conversionToBase), u = Po.getBalance(r.id, t.productId);
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
			s.set(e.orderLine.productId, V(t + e.fulfilledBaseQuantity));
		}
		for (let [e, t] of s) {
			let n = Po.getBalance(r.id, e);
			if (!n || n.quantityOnHand < t) {
				let t = Gn(e);
				throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
			}
		}
		let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = cm(), d = o.map((e) => ({
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
			let i = Gn(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let a = io.create({
				movementType: "SALE",
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: V(-t.fulfilledBaseQuantity),
				transactionUnitId: t.unitId,
				transactionUnitSymbol: t.unitSymbol,
				transactionQuantity: V(-t.fulfilledQuantity),
				conversionToBase: t.conversionToBase,
				referenceType: "SALES_FULFILMENT",
				referenceId: f.id,
				referenceNumber: f.fulfilmentNumber,
				salesOrderId: n.id,
				salesOrderNumber: n.documentNumber,
				occurredAt: e.fulfilmentDate,
				notes: `Sales fulfilment ${f.fulfilmentNumber}`
			});
			Oo({
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
			}), Po.issue({
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: t.fulfilledBaseQuantity
			});
		}
		return rm.postSalesFulfilment(f), am = [f, ...am], sm(), um(n.id), f;
	},
	void(e) {
		if (t().physicalCustomerReturns?.returns.some((t) => t.status === "POSTED" && t.lines.some((t) => t.fulfilmentId === e.fulfilmentId))) throw Error("Reverse physical customer returns before voiding this dispatch.");
		let n = am.find((t) => t.id === e.fulfilmentId);
		if (!n) throw Error("Sales fulfilment was not found.");
		if (n.status === "VOIDED") throw Error("Sales fulfilment has already been voided.");
		if (Number.isNaN(Date.parse(e.voidDate))) throw Error("Fulfilment void date is invalid.");
		if (e.voidDate < n.fulfilmentDate) throw Error("Fulfilment void date cannot be earlier than the fulfilment date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("Fulfilment void reason must contain at least 3 characters.");
		let i = B.getById(n.salesOrderId);
		if (!i || i.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		if (i.status === "INVOICED" && i.invoiceIds.some((e) => {
			let t = B.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("Cannot void a sales fulfilment for an invoiced sales order.");
		if (i.status !== "CONFIRMED" && i.status !== "PARTIALLY_FULFILLED" && i.status !== "FULFILLED" && i.status !== "INVOICED") throw Error(`Cannot void a sales fulfilment when the sales order status is ${i.status}.`);
		let a = dm(n), o = /* @__PURE__ */ new Set(), s = n.lines.map((e) => {
			let t = Gn(e.productId);
			if (!t) throw Error(`Product ${e.sku} was not found.`);
			let r = a.find((t) => !o.has(t.id) && t.siteId === n.siteId && t.productId === e.productId && Math.abs(t.quantityBase) === e.fulfilledBaseQuantity);
			if (!r) throw Error(`Unique original inventory cost issue for ${e.sku} was not found.`);
			return o.add(r.id), {
				line: e,
				product: t,
				originalIssue: r
			};
		});
		rm.reverseSalesFulfilment({
			fulfilment: n,
			reversalDate: e.voidDate,
			reason: r
		});
		for (let t of s) {
			let { line: i, product: a, originalIssue: o } = t, s = io.create({
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
			ko({
				siteId: n.siteId,
				productId: i.productId,
				quantityBase: i.fulfilledBaseQuantity,
				unitCostBase: o.unitCostBase,
				inventoryValue: Ba(Math.abs(o.valueChange)),
				referenceType: "SALE",
				referenceId: n.id,
				referenceNumber: n.fulfilmentNumber,
				inventoryMovementId: s.id,
				occurredAt: e.voidDate,
				notes: `Void sales fulfilment ${n.fulfilmentNumber}: ${r}`
			}), Po.receive({
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
		return am = am.map((e) => e.id === c.id ? c : e), sm(), um(n.salesOrderId), c;
	}
};
i("fulfilments", {
	repository: fm,
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: am }),
	restore: (e) => {
		am = e.fulfilments, om = am;
	},
	publish: () => im.forEach((e) => e())
});
//#endregion
//#region src/features/customer-returns/customerReturnRepository.ts
var q = E().trim().min(1).max(200), pm = f().finite().positive().refine((e) => Math.round(e * 1e4) / 1e4 === e), mm = f().finite().nonnegative(), hm = e({
	operationId: q,
	invoiceId: q,
	creditNoteId: q.optional(),
	returnDate: q,
	reason: E().trim().min(3).max(2e3),
	lines: s(e({
		costMovementId: q,
		invoiceLineId: q,
		quantity: pm
	}).strict()).min(1).max(500)
}).strict(), gm = e({
	costMovementId: q,
	invoiceLineId: q,
	fulfilmentId: q,
	productId: q,
	unitId: q,
	baseUnitId: q,
	siteId: q,
	description: E(),
	quantity: pm,
	conversionToBase: pm,
	quantityBase: pm,
	inventoryValue: mm,
	unitCostBase: mm,
	movementId: q,
	restoredCostId: q,
	reversalMovementId: q.optional(),
	reversalCostId: q.optional()
}).strict(), _m = e({
	id: q,
	number: q,
	operationId: q,
	fingerprint: E(),
	invoiceId: q,
	invoiceNumber: q,
	customerId: q,
	creditNoteId: q,
	ownsCredit: y(),
	returnDate: q,
	reason: q.max(2e3),
	status: T(["POSTED", "REVERSED"]),
	lines: s(gm).min(1),
	inventoryValue: mm,
	journalId: q.optional(),
	createdBy: q,
	createdAt: q,
	reversalDate: q.optional(),
	reversalReason: q.optional(),
	reversedBy: q.optional()
}).strict(), vm = [], ym = 0, bm = /* @__PURE__ */ new Set(), xm = () => {
	ym++, bm.forEach((e) => e());
}, Sm = (e) => Math.round(e * 1e4) / 1e4, Cm = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function wm(e, t, n) {
	if (ho.getAll().some((r) => r.siteId === e && r.productId === t && ve(r.occurredAt) > n)) throw Error("Return date precedes later inventory activity at this site.");
}
function Tm(e) {
	let t = B.getAll().find((t) => t.id === e && t.type === "INVOICE");
	if (!t || t.type !== "INVOICE" || ["VOID", "DRAFT"].includes(t.status) || t.openingBalanceImportId) return [];
	let n = [];
	for (let e of fm.getAll().filter((e) => e.salesOrderId === t.sourceSalesOrderId && e.status === "ACTIVE")) {
		let r = /* @__PURE__ */ new Set();
		for (let i of e.lines) {
			let a = t.lines.find((e) => e.id === i.salesOrderLineId && e.productId === i.productId && e.unitId === i.unitId), o = ho.getAll().find((t) => t.referenceType === "SALE" && t.referenceId === e.id && t.movementType === "ISSUE" && t.productId === i.productId && io.getAll().some((e) => e.id === t.inventoryMovementId && e.transactionUnitId === i.unitId) && t.siteId === e.siteId && Sm(-t.quantityBase) === Sm(i.fulfilledBaseQuantity) && !r.has(t.id));
			if (!a || !o) continue;
			r.add(o.id);
			let s = vm.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((e) => e.costMovementId === o.id).reduce((e, t) => e + t.quantityBase, 0);
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
			let t = G.require("sales.payment"), n = hm.parse(e), r = JSON.stringify(n), i = vm.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already used with different customer return data.");
				return i;
			}
			w(n.returnDate), St(n.returnDate), A();
			let a = B.getAll().find((e) => e.id === n.invoiceId && e.type === "INVOICE");
			if (!a || a.type !== "INVOICE" || n.returnDate < a.documentDate) throw Error("Select an issued invoice and a return date on or after it.");
			let o = Tm(a.id), s = /* @__PURE__ */ new Set(), c = n.lines.map((e) => {
				if (s.has(e.costMovementId)) throw Error("Select each original dispatch cost only once.");
				s.add(e.costMovementId);
				let t = o.find((t) => t.costMovementId === e.costMovementId && t.invoiceLineId === e.invoiceLineId);
				if (!t || e.quantity > t.availableQuantity + 1e-8 || n.returnDate < t.dispatchDate) throw Error("Return exceeds dispatched quantities or precedes dispatch.");
				let r = Gn(t.productId), i = $a.getById(t.siteId), c = a.lines.find((t) => t.id === e.invoiceLineId);
				if (!r || !i || i.status !== "ACTIVE") throw Error("An active original receiving site and product are required.");
				if ((c.areaPerPack || r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(r.units.find((e) => e.id === t.unitId)?.code ?? "")) && !Number.isInteger(e.quantity)) throw Error("Return whole packs in whole quantities.");
				wm(t.siteId, t.productId, n.returnDate);
				let l = Sm(e.quantity * t.conversionToBase);
				if (l <= 0) throw Error("Return quantity rounds to zero.");
				let u = vm.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((e) => e.costMovementId === t.costMovementId), d = Cm(l + u.reduce((e, t) => e + t.quantityBase, 0) >= t.originalQuantityBase - 1e-8 ? t.originalValue - u.reduce((e, t) => e + t.inventoryValue, 0) : t.originalValue * l / t.originalQuantityBase);
				return {
					...t,
					quantity: e.quantity,
					quantityBase: l,
					inventoryValue: d
				};
			}), l = /* @__PURE__ */ new Map();
			for (let e of c) l.set(e.invoiceLineId, Sm((l.get(e.invoiceLineId) ?? 0) + e.quantity));
			let u = n.creditNoteId ? z.getById(n.creditNoteId) : void 0;
			if (n.creditNoteId) {
				if (!u || u.sourceInvoiceId !== a.id || ["VOID", "DRAFT"].includes(u.status) || u.creditDate > n.returnDate) throw Error("Select an issued credit for this invoice dated before receipt.");
				for (let [e, t] of l) {
					let n = u.lines.find((t) => t.id === e)?.quantity ?? 0;
					if (t + vm.filter((e) => e.status === "POSTED" && e.creditNoteId === u.id).flatMap((e) => e.lines).filter((t) => t.invoiceLineId === e).reduce((e, t) => e + t.quantity, 0) > n + 1e-8) throw Error("Physical return exceeds the linked credit quantities.");
				}
			} else u = B.createCreditNoteFromInvoice({
				invoiceId: a.id,
				creditDate: n.returnDate,
				reason: n.reason,
				lines: [...l].map(([e, t]) => ({
					...a.lines.find((t) => t.id === e),
					quantity: t
				}))
			});
			let d = crypto.randomUUID(), f = "CRTN-" + String(vm.length + 1).padStart(6, "0"), p = c.map((e) => {
				Po.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = io.create({
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
				}), r = ko({
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
			}), m = Cm(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? I.post({
				journalDate: n.returnDate,
				description: "Customer goods returned " + f,
				sourceType: "CUSTOMER_RETURN",
				sourceId: d,
				lines: [{
					accountId: F.requireBySystemRole("INVENTORY").id,
					debit: m,
					credit: 0
				}, {
					accountId: F.requireBySystemRole("COST_OF_GOODS_SOLD").id,
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
			return vm = [g, ...vm], xm(), g;
		},
		reverse(t) {
			let n = G.require("sales.payment"), r = e({
				id: q,
				reversalDate: q,
				reason: E().trim().min(3).max(2e3)
			}).strict().parse(t), i = vm.find((e) => e.id === r.id);
			if (!i) throw Error("Customer return not found.");
			if (i.status === "REVERSED") return i;
			if (w(r.reversalDate), St(r.reversalDate), A(), r.reversalDate < i.returnDate) throw Error("Reversal precedes the return.");
			let a = /* @__PURE__ */ new Map();
			for (let e of i.lines) {
				wm(e.siteId, e.productId, r.reversalDate);
				let t = e.siteId + "|" + e.productId, n = a.get(t) ?? {
					quantity: 0,
					value: 0
				};
				a.set(t, {
					quantity: Sm(n.quantity + e.quantityBase),
					value: Cm(n.value + e.inventoryValue)
				});
			}
			for (let [e, t] of a) {
				let [n, r] = e.split("|"), i = co.getBalance(n, r);
				if ((Po.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t.quantity || (i?.inventoryValue ?? 0) + .001 < t.value || Math.abs((i?.quantityOnHand ?? 0) - t.quantity) < 1e-8 && Math.abs((i?.inventoryValue ?? 0) - t.value) > .001) throw Error("Returned stock/value has been used; restore stock availability before reversal.");
			}
			let o = z.getById(i.creditNoteId);
			if (i.ownsCredit && ((o.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > r.reversalDate) || z.getAllocationsByCreditNote(o.id).some((e) => (e.reversedAt ? ve(e.reversedAt) : e.allocationDate) > r.reversalDate))) throw Error("Return reversal precedes later credit settlement activity.");
			vm = vm.map((e) => e.id === i.id ? {
				...e,
				status: "REVERSED"
			} : e), i.ownsCredit && B.voidCreditNote({
				creditNoteId: i.creditNoteId,
				reason: r.reason,
				voidDate: r.reversalDate
			});
			let s = i.lines.map((e) => {
				Po.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = io.create({
					movementType: "RETURN_OUT",
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: -e.quantityBase,
					transactionUnitId: e.unitId,
					transactionUnitSymbol: io.getAll().find((t) => t.id === e.movementId)?.transactionUnitSymbol ?? "",
					transactionQuantity: -e.quantity,
					conversionToBase: e.conversionToBase,
					referenceType: "CUSTOMER_RETURN_VOID",
					referenceId: i.id,
					referenceNumber: i.number,
					occurredAt: r.reversalDate,
					notes: r.reason
				}), n = co.requireBalance(e.siteId, e.productId), a = Sm(n.quantityOnHand - e.quantityBase), o = Cm(n.inventoryValue - e.inventoryValue), s = a ? za(o / a) : 0;
				co.save({
					...n,
					quantityOnHand: a,
					inventoryValue: o,
					averageCostPerBaseUnit: s,
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				});
				let c = ho.create({
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
			i.journalId && I.reverse({
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
			return vm = vm.map((e) => e.id === i.id ? c : e), xm(), c;
		}
	},
	read: "inventory.cost.read",
	commands: {
		create: "sales.payment",
		reverse: "sales.payment"
	},
	snapshot: () => ({ returns: vm }),
	restore: (e) => {
		vm = e.returns;
	},
	publish: xm,
	validate: (t, n) => {
		let r = e({ returns: s(_m) }).strict().parse(t), i = n, a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map();
		for (let e of r.returns) {
			let t = hm.parse(JSON.parse(e.fingerprint));
			if (w(e.returnDate), a.has(e.operationId) || t.operationId !== e.operationId || t.invoiceId !== e.invoiceId || t.returnDate !== e.returnDate || t.reason !== e.reason || t.lines.length !== e.lines.length || e.ownsCredit !== !t.creditNoteId || t.creditNoteId && t.creditNoteId !== e.creditNoteId) throw Error("Customer return request mismatch.");
			a.add(e.operationId);
			let n = i.sales.invoices.find((t) => t.id === e.invoiceId && t.customerId === e.customerId), r = i.customerCredits.creditNotes.find((t) => t.id === e.creditNoteId && t.sourceInvoiceId === e.invoiceId);
			if (!n || !r || e.status === "POSTED" && r.status === "VOID" || e.status === "REVERSED" && e.ownsCredit && r.status !== "VOID" || Cm(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue || new Set(e.lines.map((e) => e.costMovementId)).size !== e.lines.length) throw Error("Customer return source or totals mismatch.");
			for (let r of e.lines) {
				let a = t.lines.find((e) => e.costMovementId === r.costMovementId && e.invoiceLineId === r.invoiceLineId), s = i.costMovements.movements.find((e) => e.id === r.costMovementId), c = i.costMovements.movements.find((e) => e.id === r.restoredCostId), l = i.inventoryMovements.movements.find((e) => e.id === r.movementId), u = i.fulfilments.fulfilments.find((e) => e.id === r.fulfilmentId);
				if (!a || a.quantity !== r.quantity || !u || u.salesOrderId !== n.sourceSalesOrderId || !s || s.referenceType !== "SALE" || s.referenceId !== u.id || s.productId !== r.productId || s.siteId !== r.siteId || Sm(r.quantity * r.conversionToBase) !== r.quantityBase || !c || c.referenceType !== "CUSTOMER_RETURN" || c.referenceId !== e.id || c.inventoryMovementId !== r.movementId || c.quantityBase !== r.quantityBase || c.valueChange !== r.inventoryValue || !l || l.referenceId !== e.id || l.quantityBase !== r.quantityBase || ve(c.occurredAt) !== e.returnDate) throw Error("Customer return inventory/cost references mismatch.");
				if (e.status === "POSTED") {
					if (u.status !== "ACTIVE") throw Error("Active customer return has a void dispatch.");
					let e = o.get(s.id) ?? {
						quantity: 0,
						value: 0
					}, t = {
						quantity: Sm(e.quantity + r.quantityBase),
						value: Cm(e.value + r.inventoryValue)
					};
					if (o.set(s.id, t), t.quantity > -s.quantityBase + 1e-8 || t.value > -s.valueChange + .001) throw Error("Customer returns exceed original dispatched stock/cost.");
				}
				if (e.status === "REVERSED") {
					let t = i.costMovements.movements.find((e) => e.id === r.reversalCostId);
					if (!t || t.referenceType !== "CUSTOMER_RETURN_VOID" || t.referenceId !== e.id || t.inventoryMovementId !== r.reversalMovementId || t.quantityBase !== -r.quantityBase || t.valueChange !== -r.inventoryValue || ve(t.occurredAt) !== e.reversalDate) throw Error("Customer return reversal references mismatch.");
				}
			}
			if (e.status === "POSTED") for (let t of e.lines) {
				let n = e.creditNoteId + "|" + t.invoiceLineId, i = Sm((c.get(n) ?? 0) + t.quantity);
				if (c.set(n, i), !r.lines.some((e) => e.id === t.invoiceLineId && e.quantity + 1e-8 >= i)) throw Error("Customer returns exceed linked credit quantity.");
			}
			for (let t of new Set(e.lines.map((e) => e.invoiceLineId))) {
				let n = Sm(e.lines.filter((e) => e.invoiceLineId === t).reduce((e, t) => e + t.quantity, 0));
				if (!r.lines.some((e) => e.id === t && e.quantity + 1e-8 >= n)) throw Error("Customer return credit quantity mismatch.");
			}
			if (e.returnDate < n.documentDate || e.status === "POSTED" && e.reversalDate) throw Error("Customer return date/status mismatch.");
			if (e.reversalDate && w(e.reversalDate), e.status === "REVERSED" && (!e.reversalDate || e.reversalDate < e.returnDate || !e.reversalReason || !e.reversedBy)) throw Error("Customer return reversal metadata mismatch.");
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
var Em = [
	"Manual",
	"1",
	"2",
	"3",
	"4-resident",
	"4-foreign",
	"5",
	"6"
], Dm = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
], Om = {
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
function km(e, t, n, r) {
	if (!Number.isFinite(e) || e < 0 || e > 1e9) throw Error("Invalid taxable earnings.");
	if (r < "2026-07-01" || r > "2027-06-30") throw Error("Automatic PAYG is available only for pay dates in 2026–27. Use a reviewed manual amount for another year.");
	if (t === "Manual") throw Error("Manual withholding must be entered explicitly.");
	if (t.startsWith("4-")) return Math.floor(Math.floor(e) * (t === "4-resident" ? .47 : .45) + 1e-9);
	let i = Math.round(e * 100);
	n === "Monthly" && i % 100 == 33 && i++;
	let a = n === "Weekly" ? i / 100 : n === "Fortnightly" ? i / 200 : n === "Monthly" ? i * 3 / 1300 : i / 1300, o = Math.floor(a + 1e-9) + .99, s = Om[t]?.find(([e]) => o < e);
	if (!s) throw Error("Unsupported PAYG scale.");
	let c = Math.max(0, Math.round(s[1] * o - s[2]));
	return n === "Weekly" ? c : n === "Fortnightly" ? c * 2 : n === "Monthly" ? Math.round(c * 13 / 3) : c * 13;
}
//#endregion
//#region src/features/contact-review/reviewModel.ts
var Am = [
	"Customer",
	"Branch",
	"Contact"
], jm = [
	"Manual",
	"Sales draft",
	"Selected contact",
	"Card transcription"
], Mm = {
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
}, Nm = se(E(), he([
	E().max(2e3),
	f().finite(),
	y()
]));
function Pm(e, t) {
	let n = Nm.parse(t), r = Mm[e];
	if (Object.keys(n).some((e) => !Object.hasOwn(r, e))) throw Error("Unsupported draft field. Use the documented fields for this draft type.");
	for (let [e, t] of Object.entries(n)) if (typeof t != typeof r[e]) throw Error(`Invalid value type for ${e}.`);
	return {
		...r,
		...n
	};
}
var Fm = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), Im = (e) => String(e ?? "").trim().toLowerCase(), Lm = (e) => String(e ?? "").replace(/\D/g, ""), Rm = (e, t, n = Fm) => !!n(e) && n(e) === n(t);
function zm(e, t) {
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
		(Rm(r.businessName, e.businessName) || Rm(r.businessName, e.tradingName) || Rm(r.tradingName, e.businessName) || Rm(r.tradingName, e.tradingName)) && t.push("Business/trading name"), Rm(r.email, e.email, Im) && t.push("Email"), Rm(r.phone, e.phone, Lm) && t.push("Phone"), Rm(r.abn, e.abn) && t.push("Identifier"), i(e.id, e.id, e.businessName, [
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
			Rm(r.name, e.name) && t.push("Branch name"), String(r.addressLine1).trim() && Rm([
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
			].join(" ")) && t.push("Address"), Rm(r.phone, e.phone, Lm) && t.push("Phone"), i(e.id, n.id, e.name, [
				e.addressLine1,
				e.suburb,
				e.postcode
			].filter(Boolean).join(" · "), t);
		}
		else for (let e of n.contacts) {
			let t = [];
			Rm([r.firstName, r.lastName].join(" "), [e.firstName, e.lastName].join(" ")) && t.push("Contact name"), Rm(r.email, e.email, Im) && t.push("Email"), (Rm(r.phone, e.phone, Lm) || Rm(r.phone, e.mobile, Lm) || Rm(r.mobile, e.phone, Lm) || Rm(r.mobile, e.mobile, Lm)) && t.push("Phone/mobile"), i(e.id, n.id, `${e.firstName} ${e.lastName}`, [
				e.email,
				e.phone,
				e.mobile
			].filter(Boolean).join(" · "), t);
		}
	}
	return n.sort((e, t) => t.reasons.length - e.reasons.length || e.name.localeCompare(t.name) || e.id.localeCompare(t.id));
}
function Bm(e) {
	return JSON.stringify(e);
}
//#endregion
//#region src/features/data-transfer/transferModel.ts
var Vm = [
	"Customers",
	"Suppliers",
	"Customer branches",
	"Customer contacts",
	"Products"
], Hm = ["Create", "Update by ID"], Um = "HTT-CSV-1", Wm = {
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
}, Gm = {
	Customers: Mm.Customer,
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
		...Mm.Branch
	},
	"Customer contacts": {
		customerId: "",
		...Mm.Contact
	},
	Products: Wm
}, Km = (e) => [
	"_format",
	"id",
	"recordToken",
	"externalId",
	...Object.keys(Gm[e])
], qm = {
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
}, Jm = e({
	dataset: T(Vm),
	mode: T(Hm),
	fileName: E().trim().min(1).max(200),
	text: E().max(1e6),
	mapping: se(E(), f().int().nonnegative()).optional()
}).strict();
function Ym(e) {
	if (e.text.includes("\0")) throw Error("CSV source must be text without NUL characters.");
	let t = Mt(e.text.replace(/^\uFEFF/, ""));
	if (t.length < 2 || t.length > 501) throw Error("Choose a CSV header and 1–500 data records.");
	let n = t[0].map((e) => e.trim());
	if (n.length > 64 || n.some((e) => !e || e.length > 120) || new Set(n.map((e) => e.toLowerCase())).size !== n.length) throw Error("CSV requires 1–64 distinct, nonempty column names of at most 120 characters.");
	if (t.slice(1).some((e) => e.length !== n.length || e.some((e) => e.length > 1e5))) throw Error("Each CSV record must match the header width; cells may not exceed 100,000 characters.");
	let r = Km(e.dataset), i = e.mapping ?? Object.fromEntries(r.flatMap((e) => {
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
function Xm(e) {
	return e.map((e) => e.map((e) => "\"" + (/^[=+@\-'\t\r]/.test(e) ? "'" + e : e).replaceAll("\"", "\"\"") + "\"").join(",")).join("\r\n");
}
//#endregion
//#region src/features/payroll/data/payrollModel.ts
var J = E().trim().min(1).max(200), Zm = E().refine((e) => /^\d{4}-\d{2}-\d{2}$/.test(e) && !isNaN(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e, "Use a valid date."), Qm = E().trim().min(3).max(2e3), $m = f().finite().min(0).max(1e9).refine((e) => Math.abs(e * 100 - Math.round(e * 100)) < 1e-5, "Use whole cents."), eh = f().finite().min(0).max(1e5).refine((e) => Math.abs(e * 1e4 - Math.round(e * 1e4)) < 1e-6, "Use at most four decimal places."), th = e({
	actorId: J,
	at: je(),
	action: J,
	reason: Qm,
	revision: f().int().positive()
}).strict(), nh = {
	id: J,
	revision: f().int().positive(),
	history: s(th).min(1)
}, rh = e({
	code: E().trim().min(1).max(40),
	name: J,
	position: E().trim().max(200),
	email: ee().or(b("")),
	startDate: Zm,
	endDate: Zm.or(b("")),
	status: T(["Active", "Inactive"]),
	basis: T(["Hourly", "Salary"]),
	rate: $m,
	earningItemId: J,
	taxScale: T(Em).default("Manual"),
	standardTaxConfirmed: y().default(!1),
	superFund: E().trim().max(200).default(""),
	superMemberId: E().trim().max(100).default(""),
	bankAccount: E().trim().max(100),
	taxIdentifier: E().trim().max(100),
	annualOpening: eh,
	personalOpening: eh
}).strict(), ih = rh.extend(nh).strict(), ah = e({
	code: E().trim().min(1).max(40),
	name: J,
	category: T([
		"Earnings",
		"Allowance",
		"Deduction",
		"Tax",
		"Employer contribution"
	]),
	method: T([
		"Hourly",
		"Fixed",
		"Percentage"
	]),
	rate: $m,
	taxable: y(),
	accountId: J,
	liabilityAccountId: E().trim().max(200),
	active: y()
}).strict(), oh = ah.extend(nh).strict(), sh = e({
	netAccountId: J,
	taxItemId: J,
	currency: E().regex(/^[A-Z]{3}$/),
	region: b("Australia"),
	frequency: T(Dm).default("Fortnightly"),
	superItemId: J,
	employerName: J,
	employerIdentifier: E().trim().max(100)
}).strict(), ch = sh.extend(nh).strict(), lh = e({
	employeeId: J,
	itemId: J,
	date: Zm,
	hours: eh.refine((e) => e > 0),
	notes: E().trim().max(1e3)
}).strict(), uh = lh.extend({
	...nh,
	status: T([
		"Draft",
		"Submitted",
		"Approved"
	])
}).strict(), dh = e({
	employeeId: J,
	type: T([
		"Annual",
		"Personal",
		"Unpaid"
	]),
	start: Zm,
	end: Zm,
	hours: eh.refine((e) => e > 0),
	notes: E().trim().max(1e3)
}).strict(), fh = dh.extend({
	...nh,
	status: T([
		"Pending",
		"Approved",
		"Declined",
		"Cancelled"
	])
}).strict(), ph = e({
	employeeId: J,
	itemId: J,
	quantity: eh.refine((e) => e > 0),
	rate: $m
}).strict(), mh = e({
	name: J,
	start: Zm,
	end: Zm,
	payDate: Zm,
	employeeInputs: s(e({
		employeeId: J,
		withholding: $m,
		additionalWithholding: $m.default(0),
		superMethod: T(["Reviewed amount", "12% reviewed QE"]).default("Reviewed amount"),
		superBase: $m.default(0),
		superAmount: $m.default(0),
		salaryOverride: $m.optional(),
		annualAccrual: eh,
		personalAccrual: eh
	}).strict()).min(1).max(500),
	adjustments: s(ph).max(2e3),
	taxReviewed: y(),
	reviewReference: E().trim().max(500)
}).strict(), hh = e({
	item: oh,
	quantity: eh,
	rate: $m,
	amount: $m,
	source: E().max(200)
}).strict(), gh = e({
	gross: $m,
	taxable: $m,
	deductions: $m,
	net: $m,
	employerCost: $m,
	withholding: $m
}).strict(), _h = e({
	employee: ih,
	lines: s(hh).min(1),
	timeIds: s(J),
	leaveIds: s(J),
	annualAccrual: eh,
	personalAccrual: eh,
	totals: gh
}).strict(), vh = mh.extend({
	...nh,
	status: T([
		"Draft",
		"Approved",
		"Posted",
		"Reversed",
		"Cancelled"
	]),
	slips: s(_h).min(1),
	totals: gh,
	settings: ch,
	sourceToken: J,
	journalId: J.optional(),
	reversalJournalId: J.optional(),
	reversalDate: Zm.optional()
}).strict(), yh = e({
	...nh,
	operationId: J,
	runId: J,
	accountId: J,
	bankAccountId: J,
	date: Zm,
	amount: $m.refine((e) => e > 0),
	reference: E().trim().max(200),
	status: T(["Posted", "Reversed"]),
	journalId: J,
	reversalJournalId: J.optional(),
	reversalDate: Zm.optional()
}).strict(), bh = e({
	...nh,
	runId: J,
	status: T([
		"Prepared",
		"External reference recorded",
		"Correction needed"
	]),
	reference: E().trim().max(200),
	notes: E().trim().max(1e3),
	runRevision: f().int().positive()
}).strict(), xh = e({
	employees: s(ih),
	items: s(oh),
	timesheets: s(uh),
	leave: s(fh),
	runs: s(vh),
	payments: s(yh),
	filings: s(bh),
	settings: s(ch).max(1),
	receipts: s(e({
		operationId: J,
		fingerprint: E().regex(/^[a-f0-9]{64}$/),
		input: se(E(), ye()),
		actorId: J,
		entity: T([
			"employees",
			"items",
			"timesheets",
			"leave",
			"runs",
			"payments",
			"filings",
			"settings"
		]),
		recordId: J,
		revision: f().int().positive()
	}).strict())
}).strict(), Sh = () => ({
	employees: [],
	items: [],
	timesheets: [],
	leave: [],
	runs: [],
	payments: [],
	filings: [],
	settings: [],
	receipts: []
}), Ch = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function wh(e) {
	let t = (t) => Ch(e.filter(t).reduce((e, t) => e + t.amount, 0)), n = (e) => ["Earnings", "Allowance"].includes(e.item.category), r = t(n), i = t((e) => ["Deduction", "Tax"].includes(e.item.category));
	return gh.parse({
		gross: r,
		taxable: t((e) => n(e) && e.item.taxable),
		deductions: i,
		net: Ch(r - i),
		employerCost: t((e) => e.item.category === "Employer contribution"),
		withholding: t((e) => e.item.category === "Tax")
	});
}
function Th(e) {
	return gh.parse(Object.fromEntries(Object.keys(gh.shape).map((t) => [t, Ch(e.reduce((e, n) => e + n.totals[t], 0))])));
}
//#endregion
//#region electron/security/payrollRepository.ts
var Y = Sh(), Eh = (e) => Array.isArray(e) ? e.map(Eh) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, Eh(e[t])])) : e, Dh = (e) => Oe("sha256").update(JSON.stringify(Eh(e))).digest("hex"), Oh = {
	operationId: J,
	reason: Qm
}, kh = {
	id: J.optional(),
	expectedRevision: f().int().nonnegative()
};
function Ah(e = "payroll.manage") {
	return G.require(e);
}
function X(e, t) {
	let n = Y[e].find((e) => e.id === t);
	if (!n) throw Error("Payroll record was not found.");
	return n;
}
var jh = (e) => !["Cancelled", "Reversed"].includes(e.status);
function Mh(e, t, n) {
	return Y.runs.some((r) => r.id !== n && jh(r) && r.slips.some((n) => (e === "timesheets" ? n.timeIds : n.leaveIds).includes(t)));
}
function Nh(e, t) {
	return Y[e] = [...Y[e].filter((e) => e.id !== t.id), t], structuredClone(t);
}
function Ph(e, t, n) {
	let r = (e?.revision ?? 0) + 1;
	return {
		id: e?.id ?? crypto.randomUUID(),
		revision: r,
		history: [...e?.history ?? [], {
			actorId: Ah("payroll.read").userId,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			action: t,
			reason: n,
			revision: r
		}]
	};
}
function Fh(e, t) {
	if ((e?.revision ?? 0) !== t) throw Error("Payroll record changed. Reload before editing.");
}
function Ih(e, t, n) {
	let r = Dh({
		input: e,
		actorId: Ah("payroll.read").userId
	}), i = Y.receipts.find((t) => t.operationId === e.operationId);
	if (i) {
		if (i.fingerprint !== r || i.entity !== t) throw Error("Operation ID already has different payroll data.");
		return structuredClone(X(t, i.recordId));
	}
	let a = n();
	return Y.receipts.push({
		operationId: e.operationId,
		fingerprint: r,
		input: structuredClone(e),
		actorId: Ah("payroll.read").userId,
		entity: t,
		recordId: a.id,
		revision: a.revision
	}), xh.parse(Y), a;
}
function Lh(e, t, n = !0) {
	let r = F.requireById(e);
	if (r.type !== t || n && !r.active || r.systemRole && (t !== "EXPENSE" || r.systemRole !== "OPERATING_EXPENSE")) throw Error(`Use a dedicated ${t.toLowerCase()} payroll account, not a bank, tax, AR/AP or stock control account.`);
	return r;
}
function Rh(e, t = !0) {
	if (Lh(e.accountId, [
		"Earnings",
		"Allowance",
		"Employer contribution"
	].includes(e.category) ? "EXPENSE" : "LIABILITY", t), e.category === "Employer contribution") Lh(e.liabilityAccountId, "LIABILITY", t);
	else if (e.liabilityAccountId) throw Error("Only employer contributions use a second liability account.");
	if (["Earnings", "Allowance"].includes(e.category) && e.method === "Percentage" || e.category === "Tax" && e.method !== "Fixed") throw Error("Earnings use hourly/fixed values; withholding tax is an explicitly reviewed fixed amount.");
	if (e.method === "Percentage" && e.rate > 100) throw Error("Percentage rates cannot exceed 100.");
}
function zh(e) {
	let t = X("employees", e);
	if (t.status !== "Active") throw Error("Select an active employee.");
	return t;
}
function Bh(e, t, n = t) {
	if (t < e.startDate || e.endDate && n > e.endDate) throw Error("Dates must be within the employment period.");
}
function Vh(e) {
	let t = zh(e.employeeId);
	Bh(t, e.date);
	let n = X("items", e.itemId);
	if (!n.active || n.category !== "Earnings" || t.basis === "Hourly" && n.method !== "Hourly" || t.basis === "Salary" && n.id !== t.earningItemId) throw Error("Select an appropriate employee earnings item.");
	Rh(n);
}
function Hh(e, t) {
	if (Bh(zh(e.employeeId), e.start, e.end), e.start > e.end || e.hours > ((Date.parse(e.end) - Date.parse(e.start)) / 864e5 + 1) * 24) throw Error("Leave dates or hours are invalid.");
	if (Y.leave.some((n) => n.id !== t && n.employeeId === e.employeeId && ["Pending", "Approved"].includes(n.status) && n.start <= e.end && n.end >= e.start)) throw Error("Leave request dates overlap.");
}
function Uh() {
	let e = Y.settings[0];
	if (!e) throw Error("Configure payroll settings first.");
	Lh(e.netAccountId, "LIABILITY");
	let t = X("items", e.taxItemId);
	if (t.category !== "Tax" || !t.active) throw Error("Select an active fixed withholding item.");
	if (Rh(t), e.netAccountId === t.accountId) throw Error("Net wages and withholding require separate liability accounts.");
	let n = X("items", e.superItemId);
	if (n.category !== "Employer contribution" || n.method !== "Fixed" || !n.active) throw Error("Use an active fixed super contribution item.");
	if (Rh(n), e.currency !== "AUD" || e.currency !== C().currency) throw Error("Payroll currency must match the business currency.");
	return e;
}
function Wh(e, t) {
	let n = X("employees", e), r = n.annualOpening, i = n.personalOpening, a = /* @__PURE__ */ new Set();
	for (let n of Y.runs.filter((e) => e.status === "Posted" && e.id !== t)) for (let t of n.slips.filter((t) => t.employee.id === e)) {
		r += t.annualAccrual, i += t.personalAccrual;
		for (let e of t.leaveIds) {
			let t = X("leave", e);
			a.add(e), t.type === "Annual" && (r -= t.hours), t.type === "Personal" && (i -= t.hours);
		}
	}
	let o = Y.leave.filter((t) => t.employeeId === e && t.status === "Approved" && !a.has(t.id));
	return {
		annual: Math.round(r * 1e4) / 1e4,
		personal: Math.round(i * 1e4) / 1e4,
		reservedAnnual: o.filter((e) => e.type === "Annual").reduce((e, t) => e + t.hours, 0),
		reservedPersonal: o.filter((e) => e.type === "Personal").reduce((e, t) => e + t.hours, 0)
	};
}
function Gh(e, t) {
	let n = Wh(e, t);
	if (n.annual - n.reservedAnnual < -1e-5 || n.personal - n.reservedPersonal < -1e-5) throw Error("Approved leave exceeds the available recorded hours.");
}
var Kh = () => Dh({
	employees: Y.employees,
	items: Y.items,
	timesheets: Y.timesheets,
	leave: Y.leave,
	settings: Y.settings
});
function qh(e, t) {
	if (e.start > e.end || e.payDate < e.end) throw Error("Pay date must follow a valid pay period.");
	let n = Uh(), r = /* @__PURE__ */ new Set(), i = [];
	for (let a of e.employeeInputs) {
		if (r.has(a.employeeId)) throw Error("Include each employee only once.");
		r.add(a.employeeId);
		let o = zh(a.employeeId);
		if (o.startDate > e.end || o.endDate && o.endDate < e.start) throw Error("Employment does not overlap this pay period.");
		if (o.basis === "Salary" && (o.startDate > e.start || o.endDate && o.endDate < e.end) && a.salaryOverride === void 0) throw Error("Partial-period salary requires a reviewed salary override.");
		if (Y.runs.some((n) => n.id !== t && jh(n) && n.start <= e.end && n.end >= e.start && n.slips.some((e) => e.employee.id === o.id))) throw Error("Employee already has an overlapping pay run. Cancel or reverse it before replacing it.");
		let s = X("items", o.earningItemId);
		if (!s.active || s.category !== "Earnings" || s.method !== (o.basis === "Hourly" ? "Hourly" : "Fixed")) throw Error("Employee earning item does not match the pay basis.");
		Rh(s);
		let c = Y.timesheets.filter((t) => t.employeeId === o.id && t.status === "Approved" && t.date >= e.start && t.date <= e.end), l = Y.leave.filter((t) => t.employeeId === o.id && t.status === "Approved" && t.start <= e.end && t.end >= e.start);
		if (l.some((t) => t.start < e.start || t.end > e.end)) throw Error("Split leave spanning pay periods before including it in payroll.");
		for (let e of c) Vh(e);
		for (let e of l) Hh(e, e.id);
		if (c.some((e) => Mh("timesheets", e.id, t)) || l.some((e) => Mh("leave", e.id, t))) throw Error("Hours or leave are already reserved by another pay run.");
		if (c.some((e) => l.some((t) => e.date >= t.start && e.date <= t.end))) throw Error("Approved timesheet and leave dates overlap; correct them before payroll.");
		if (o.basis === "Salary" && l.some((e) => e.type === "Unpaid") && a.salaryOverride === void 0) throw Error("Salary with unpaid leave requires an explicitly reviewed salary override.");
		if (o.basis === "Hourly" && a.salaryOverride !== void 0) throw Error("Hourly employees cannot use a salary override.");
		let u = [], d = (e, t, n, r) => {
			if (Rh(e), !e.active) throw Error("Inactive pay item.");
			let i = Ch(t * n);
			$m.parse(i), u.push({
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
			let t = X("items", e.itemId);
			if (t.category !== "Earnings" || t.method !== "Hourly") throw Error("Timesheet must use hourly earnings.");
			d(t, e.hours, t.id === s.id ? o.rate : t.rate, "Time:" + e.id);
		}
		if (o.basis === "Hourly") for (let e of l.filter((e) => e.type !== "Unpaid")) d(s, e.hours, o.rate, "Leave:" + e.id);
		let f = e.adjustments.filter((e) => e.employeeId === o.id), p = f.filter((e) => X("items", e.itemId).method !== "Percentage");
		for (let e of p) {
			let t = X("items", e.itemId);
			if (t.id === n.superItemId) throw Error("Use the employee super guarantee fields for the standard contribution.");
			if (t.category === "Tax") throw Error("Use the explicit employee withholding field for tax.");
			if (t.method === "Fixed" && e.quantity !== 1) throw Error("Fixed pay items require quantity 1.");
			d(t, e.quantity, e.rate, "Adjustment");
		}
		let m = Ch(u.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + t.amount, 0));
		if (m <= 0) throw Error("Each employee needs positive gross earnings.");
		for (let e of f.filter((e) => X("items", e.itemId).method === "Percentage")) {
			if (e.quantity !== 1 || e.rate > 100) throw Error("Percentage items require quantity 1 and rate 0–100.");
			d(X("items", e.itemId), 1, Ch(m * e.rate / 100), "Adjustment"), u[u.length - 1].quantity = 1, u[u.length - 1].rate = e.rate;
		}
		let h = Ch(u.filter((e) => ["Earnings", "Allowance"].includes(e.item.category) && e.item.taxable).reduce((e, t) => e + t.amount, 0)), g = a.withholding;
		if (o.taxScale !== "Manual") {
			if (!o.standardTaxConfirmed) throw Error("Confirm the standard PAYG case or use reviewed manual withholding.");
			if (!o.taxScale.startsWith("4-") && !/^\d{8,9}$/.test(o.taxIdentifier.replace(/\s/g, ""))) throw Error("Record a provided eight- or nine-digit TFN for the selected scale.");
			if (a.withholding !== 0) throw Error("Clear manual withholding for an automatic PAYG employee.");
			g = km(h, o.taxScale, n.frequency, e.payDate);
		}
		if (g = Ch(g + a.additionalWithholding), d(X("items", n.taxItemId), 1, g, o.taxScale === "Manual" ? "Reviewed PAYG" : "ATO 2026–27 scale " + o.taxScale), a.superMethod === "12% reviewed QE" && (e.payDate < "2026-07-01" || e.payDate > "2027-06-30" || a.superBase > m)) throw Error("Reviewed qualifying earnings must not exceed gross and the 12% helper is limited to 2026–27. Use a reviewed super amount for exceptions.");
		let _ = a.superMethod === "12% reviewed QE" ? Ch(a.superBase * .12) : a.superAmount;
		d(X("items", n.superItemId), 1, _, a.superMethod === "12% reviewed QE" ? "SG 12% reviewed QE" : "Reviewed SG amount");
		let v = wh(u);
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
		totals: Th(i),
		settings: structuredClone(n),
		sourceToken: Kh()
	};
}
function Jh(e) {
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
function Yh(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of Jh(e).filter((e) => e.credit)) t.set(n.accountId, Ch((t.get(n.accountId) ?? 0) + n.credit));
	return [...t].map(([t, n]) => ({
		accountId: t,
		amount: n,
		paid: Ch(Y.payments.filter((n) => n.runId === e.id && n.accountId === t && n.status === "Posted").reduce((e, t) => e + t.amount, 0))
	}));
}
i("payroll", {
	repository: {
		balances(e) {
			return Ah("payroll.read"), Wh(J.parse(e));
		},
		obligations(e) {
			return Ah("payroll.read"), Yh(X("runs", J.parse(e)));
		},
		setupDefaults(t) {
			Ah(), G.require("accounting.post");
			let n = e(Oh).strict().parse(t);
			return Ih(n, "settings", () => {
				if (Y.settings.length) throw Error("Payroll is already configured.");
				let e = (e, t, n) => {
					for (; F.getAll().some((t) => t.code === String(e));) e++;
					return F.create({
						code: String(e),
						name: t,
						type: n,
						active: !0,
						allowManualPosting: n === "EXPENSE"
					}).id;
				}, t = e(6e3, "Payroll wages", "EXPENSE"), r = e(6010, "Payroll employer contributions", "EXPENSE"), i = e(2200, "Net wages payable", "LIABILITY"), a = e(2210, "Payroll withholding payable", "LIABILITY"), o = e(2220, "Payroll deductions payable", "LIABILITY"), s = e(2230, "Employer contributions payable", "LIABILITY"), c = (e, t, r, i, a, o = "") => {
					let s = {
						...Ph(void 0, "Created", n.reason),
						code: e,
						name: t,
						category: r,
						method: i,
						rate: 0,
						taxable: ["Earnings", "Allowance"].includes(r),
						accountId: a,
						liabilityAccountId: o,
						active: !0
					};
					return Y.items.push(s), s;
				};
				c("ORD", "Ordinary hours", "Earnings", "Hourly", t), c("SAL", "Salary per run", "Earnings", "Fixed", t);
				let l = c("TAX", "Reviewed withholding", "Tax", "Fixed", a);
				c("ALLOW", "Allowance", "Allowance", "Fixed", t), c("DEDUCT", "Employee deduction", "Deduction", "Fixed", o);
				let u = c("SG", "Super guarantee", "Employer contribution", "Fixed", r, s);
				return Nh("settings", {
					...Ph(void 0, "Configured", n.reason),
					netAccountId: i,
					taxItemId: l.id,
					currency: C().currency,
					region: "Australia",
					frequency: "Fortnightly",
					superItemId: u.id,
					employerName: C().companyName,
					employerIdentifier: ""
				});
			});
		},
		saveEmployee(t) {
			Ah();
			let n = e({
				...Oh,
				...kh,
				values: rh
			}).strict().parse(t);
			return Ih(n, "employees", () => {
				let e = n.id ? X("employees", n.id) : void 0;
				if (Fh(e, n.expectedRevision), Y.employees.some((t) => t.id !== e?.id && t.code.toLowerCase() === n.values.code.toLowerCase())) throw Error("Employee code already exists.");
				if (n.values.endDate && n.values.endDate < n.values.startDate) throw Error("Employment end date is before the start date.");
				let t = X("items", n.values.earningItemId);
				if (!t.active || t.category !== "Earnings" || t.method !== (n.values.basis === "Hourly" ? "Hourly" : "Fixed")) throw Error("Select an active earning item matching the pay basis.");
				if (e && Y.runs.some((t) => ["Posted", "Reversed"].includes(t.status) && t.slips.some((t) => t.employee.id === e.id)) && (e.annualOpening !== n.values.annualOpening || e.personalOpening !== n.values.personalOpening)) throw Error("Opening leave hours are locked after payroll posting.");
				return Nh("employees", {
					...n.values,
					...Ph(e, e ? "Edited" : "Created", n.reason)
				});
			});
		},
		saveItem(t) {
			Ah();
			let n = e({
				...Oh,
				...kh,
				values: ah
			}).strict().parse(t);
			return Ih(n, "items", () => {
				let e = n.id ? X("items", n.id) : void 0;
				if (Fh(e, n.expectedRevision), Y.items.some((t) => t.id !== e?.id && t.code.toLowerCase() === n.values.code.toLowerCase())) throw Error("Pay item code already exists.");
				let t = {
					...n.values,
					...Ph(e, e ? "Edited" : "Created", n.reason)
				};
				return Rh(t), Nh("items", t);
			});
		},
		saveSettings(t) {
			Ah();
			let n = e({
				...Oh,
				expectedRevision: f().int().nonnegative(),
				values: sh
			}).strict().parse(t);
			return Ih(n, "settings", () => {
				let e = Y.settings[0];
				Fh(e, n.expectedRevision), Lh(n.values.netAccountId, "LIABILITY");
				let t = X("items", n.values.superItemId);
				if (t.category !== "Employer contribution" || t.method !== "Fixed" || !t.active) throw Error("Select an active fixed super guarantee item.");
				let r = X("items", n.values.taxItemId);
				if (r.category !== "Tax" || !r.active || r.accountId === n.values.netAccountId) throw Error("Use a valid withholding item and a separate net wages account.");
				if (n.values.currency !== "AUD" || n.values.currency !== C().currency) throw Error("Payroll currency must match the business.");
				return Nh("settings", {
					...n.values,
					...Ph(e, "Settings changed", n.reason)
				});
			});
		},
		saveTime(t) {
			Ah();
			let n = e({
				...Oh,
				...kh,
				values: lh
			}).strict().parse(t);
			return Ih(n, "timesheets", () => {
				let e = n.id ? X("timesheets", n.id) : void 0;
				if (Fh(e, n.expectedRevision), e && (e.status !== "Draft" || Mh("timesheets", e.id))) throw Error("Only an unreserved draft timesheet can be edited.");
				Vh(n.values);
				let t = zh(n.values.employeeId), r = X("items", n.values.itemId);
				if (Y.timesheets.filter((r) => r.id !== e?.id && r.employeeId === t.id && r.date === n.values.date).reduce((e, t) => e + t.hours, 0) + n.values.hours > 24) throw Error("Total timesheet hours cannot exceed 24 for one employee/day.");
				if (Y.timesheets.some((i) => i.id !== e?.id && i.employeeId === t.id && i.itemId === r.id && i.date === n.values.date)) throw Error("A timesheet already exists for this employee, day and item.");
				return Nh("timesheets", {
					...n.values,
					...Ph(e, e ? "Edited" : "Created", n.reason),
					status: "Draft"
				});
			});
		},
		changeTime(t) {
			let n = e({
				...Oh,
				id: J,
				expectedRevision: f().int().positive(),
				action: T([
					"Submit",
					"Approve",
					"Reopen"
				])
			}).strict().parse(t);
			return Ah(n.action === "Approve" ? "payroll.approve" : "payroll.manage"), Ih(n, "timesheets", () => {
				let e = X("timesheets", n.id);
				if (Fh(e, n.expectedRevision), Mh("timesheets", e.id)) throw Error("Timesheet is reserved by a pay run.");
				if (n.action === "Submit" && e.status !== "Draft" || n.action === "Approve" && e.status !== "Submitted" || n.action === "Reopen" && e.status === "Draft") throw Error("Invalid timesheet transition.");
				return n.action !== "Reopen" && Vh(e), Nh("timesheets", {
					...e,
					...Ph(e, n.action, n.reason),
					status: n.action === "Submit" ? "Submitted" : n.action === "Approve" ? "Approved" : "Draft"
				});
			});
		},
		saveLeave(t) {
			Ah();
			let n = e({
				...Oh,
				...kh,
				values: dh
			}).strict().parse(t);
			return Ih(n, "leave", () => {
				let e = n.id ? X("leave", n.id) : void 0;
				if (Fh(e, n.expectedRevision), e && (e.status !== "Pending" || Mh("leave", e.id))) throw Error("Only an unreserved pending leave request can be edited.");
				return Hh(n.values, e?.id), Nh("leave", {
					...n.values,
					...Ph(e, e ? "Edited" : "Created", n.reason),
					status: "Pending"
				});
			});
		},
		changeLeave(t) {
			let n = e({
				...Oh,
				id: J,
				expectedRevision: f().int().positive(),
				action: T([
					"Approve",
					"Decline",
					"Cancel",
					"Reopen"
				])
			}).strict().parse(t);
			return Ah(n.action === "Approve" || n.action === "Decline" ? "payroll.approve" : "payroll.manage"), Ih(n, "leave", () => {
				let e = X("leave", n.id);
				if (Fh(e, n.expectedRevision), Mh("leave", e.id)) throw Error("Leave is reserved by a pay run.");
				if (["Approve", "Decline"].includes(n.action) && e.status !== "Pending" || n.action === "Cancel" && ["Cancelled", "Declined"].includes(e.status) || n.action === "Reopen" && !["Cancelled", "Declined"].includes(e.status)) throw Error("Invalid leave transition.");
				(n.action === "Approve" || n.action === "Reopen") && Hh(e, e.id);
				let t = Nh("leave", {
					...e,
					...Ph(e, n.action, n.reason),
					status: n.action === "Approve" ? "Approved" : n.action === "Decline" ? "Declined" : n.action === "Cancel" ? "Cancelled" : "Pending"
				});
				return t.status === "Approved" && Gh(e.employeeId), t;
			});
		},
		saveRun(t) {
			Ah();
			let n = e({
				...Oh,
				...kh,
				values: mh
			}).strict().parse(t);
			return Ih(n, "runs", () => {
				let e = n.id ? X("runs", n.id) : void 0;
				if (Fh(e, n.expectedRevision), e && e.status !== "Draft") throw Error("Only a draft pay run can be recalculated.");
				let t = qh(n.values, e?.id);
				return Nh("runs", {
					...n.values,
					...Ph(e, e ? "Recalculated" : "Created", n.reason),
					...t,
					status: "Draft"
				});
			});
		},
		changeRun(t) {
			let n = e({
				...Oh,
				id: J,
				expectedRevision: f().int().positive(),
				action: T([
					"Approve",
					"Reopen",
					"Cancel",
					"Post",
					"Reverse"
				]),
				date: Zm.optional()
			}).strict().parse(t);
			return Ah(n.action === "Approve" ? "payroll.approve" : ["Post", "Reverse"].includes(n.action) ? "payroll.post" : "payroll.manage"), Ih(n, "runs", () => {
				let e = X("runs", n.id);
				if (Fh(e, n.expectedRevision), n.action === "Approve" || n.action === "Post") {
					if (e.status !== (n.action === "Approve" ? "Draft" : "Approved")) throw Error("Invalid pay-run transition.");
					if (!e.taxReviewed || e.reviewReference.trim().length < 3) throw Error("Confirm reviewed withholding and provide its reference.");
					if (e.sourceToken !== Kh()) throw Error("Payroll sources changed. Reopen and recalculate the run.");
					if (Dh(qh(mh.parse(Object.fromEntries(Object.keys(mh.shape).map((t) => [t, e[t]]))), e.id).slips) !== Dh(e.slips)) throw Error("Payroll calculation changed. Recalculate the run.");
				}
				if (n.action === "Approve") return Nh("runs", {
					...e,
					...Ph(e, "Approved", n.reason),
					status: "Approved"
				});
				if (n.action === "Reopen") {
					if (e.status !== "Approved") throw Error("Only an approved run can be reopened.");
					return Nh("runs", {
						...e,
						...Ph(e, "Reopened", n.reason),
						status: "Draft",
						taxReviewed: !1
					});
				}
				if (n.action === "Cancel") {
					if (!["Draft", "Approved"].includes(e.status)) throw Error("Only an unposted run can be cancelled.");
					return Nh("runs", {
						...e,
						...Ph(e, "Cancelled", n.reason),
						status: "Cancelled"
					});
				}
				if (A(), n.action === "Post") {
					let t = I.post({
						journalDate: e.payDate,
						description: "Payroll " + e.name,
						reference: e.id,
						sourceType: "PAYROLL",
						sourceId: e.id,
						lines: Jh(e)
					}), r = Nh("runs", {
						...e,
						...Ph(e, "Posted", n.reason),
						status: "Posted",
						journalId: t.id
					});
					return e.slips.forEach((e) => Gh(e.employee.id)), r;
				}
				if (e.status !== "Posted" || !n.date || n.date < e.payDate) throw Error("Reverse a posted run on or after its pay date.");
				if (Y.payments.some((t) => t.runId === e.id && t.status === "Posted")) throw Error("Reverse recorded payroll payments before reversing the run.");
				let t = I.reverse({
					journalEntryId: e.journalId,
					reversalDate: n.date,
					reason: n.reason
				}), r = Nh("runs", {
					...e,
					...Ph(e, "Reversed", n.reason),
					status: "Reversed",
					reversalJournalId: t.id,
					reversalDate: n.date
				});
				e.slips.forEach((e) => Gh(e.employee.id));
				for (let t of Y.filings.filter((t) => t.runId === e.id)) Nh("filings", {
					...t,
					...Ph(t, "Correction needed", n.reason),
					status: "Correction needed"
				});
				return r;
			});
		},
		recordPayment(t) {
			Ah("payroll.post"), G.require("banking.write");
			let n = e({
				...Oh,
				runId: J,
				accountId: J,
				bankAccountId: J,
				date: Zm,
				amount: $m.refine((e) => e > 0),
				reference: E().trim().max(200)
			}).strict().parse(t);
			return Ih(n, "payments", () => {
				A();
				let e = X("runs", n.runId);
				if (e.status !== "Posted" || n.date < e.payDate) throw Error("Record payment against a posted run on or after pay date.");
				let t = Yh(e).find((e) => e.accountId === n.accountId);
				if (!t || n.amount > Ch(t.amount - t.paid)) throw Error("Payment exceeds the outstanding payroll liability.");
				Lh(n.accountId, "LIABILITY");
				let r = L.requireById(n.bankAccountId), i = F.requireById(r.glAccountId);
				if (!r.active || !i.active || i.type !== "ASSET" || r.currency !== e.settings.currency || n.date < r.openingBalanceDate) throw Error("Use an active bank in the payroll currency with a valid posting date.");
				let a = Ph(void 0, "Payment recorded", n.reason), o = I.post({
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
				return Nh("payments", {
					...c,
					...a,
					status: "Posted",
					journalId: o.id
				});
			});
		},
		reversePayment(t) {
			Ah("payroll.post"), G.require("banking.write");
			let n = e({
				...Oh,
				id: J,
				expectedRevision: f().int().positive(),
				date: Zm
			}).strict().parse(t);
			return Ih(n, "payments", () => {
				A();
				let e = X("payments", n.id);
				if (Fh(e, n.expectedRevision), e.status !== "Posted" || n.date < e.date) throw Error("Reverse a posted payment on or after its date.");
				Nt("PAYROLL_PAYMENT", e.id);
				let t = I.reverse({
					journalEntryId: e.journalId,
					reversalDate: n.date,
					reason: n.reason
				});
				return Nh("payments", {
					...e,
					...Ph(e, "Payment reversed", n.reason),
					status: "Reversed",
					reversalJournalId: t.id,
					reversalDate: n.date
				});
			});
		},
		recordFiling(t) {
			Ah();
			let n = e({
				...Oh,
				runId: J,
				expectedRevision: f().int().nonnegative(),
				reference: E().trim().max(200),
				notes: E().trim().max(1e3)
			}).strict().parse(t);
			return Ih(n, "filings", () => {
				let e = X("runs", n.runId);
				if (e.status !== "Posted") throw Error("Prepare filing review only for a posted run.");
				let t = Y.filings.find((t) => t.runId === e.id);
				return Fh(t, n.expectedRevision), Nh("filings", {
					...Ph(t, "Filing review recorded", n.reason),
					runId: e.id,
					runRevision: e.revision,
					reference: n.reference,
					notes: n.notes,
					status: n.reference ? "External reference recorded" : "Prepared"
				});
			});
		},
		exportSlip(t) {
			Ah("payroll.read");
			let n = e({
				runId: J,
				employeeId: J
			}).strict().parse(t), r = X("runs", n.runId), i = r.slips.find((e) => e.employee.id === n.employeeId);
			if (!i) throw Error("Payslip was not found.");
			return {
				name: "Payslip-" + r.id + "-" + i.employee.code.replace(/[^A-Za-z0-9_-]/g, "_") + ".txt",
				text: [
					r.settings.employerName,
					"Employer ABN: " + (r.settings.employerIdentifier || "Not recorded"),
					"PAYSLIP · " + r.status,
					r.name,
					`${r.start} to ${r.end} · Pay date ${r.payDate} · ${r.settings.currency}`,
					i.employee.code + " · " + i.employee.name,
					"Super fund: " + (i.employee.superFund || "Not recorded") + " · Member: " + (i.employee.superMemberId || "Not recorded"),
					...i.lines.map((e) => `${e.item.name}: ${e.quantity} × ${e.rate} = ${e.amount.toFixed(2)}`),
					`Gross ${i.totals.gross.toFixed(2)} · Withholding ${i.totals.withholding.toFixed(2)} · Deductions ${i.totals.deductions.toFixed(2)} · Net ${i.totals.net.toFixed(2)} · Employer contributions ${i.totals.employerCost.toFixed(2)}`,
					"Withholding review: " + r.reviewReference,
					"Accrued payroll; payment completion is recorded separately."
				].join("\n")
			};
		},
		exportRun(e) {
			Ah("payroll.read");
			let t = X("runs", J.parse(e)), n = [[
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
				String(Ch(e.totals.deductions - e.totals.withholding)),
				String(e.totals.net),
				String(e.totals.employerCost),
				t.reviewReference
			])];
			return {
				name: "Payroll-review-" + t.id + ".csv",
				csv: Xm(n)
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
	snapshot: () => Y,
	restore: (e) => {
		Y = e;
	},
	publish: () => {},
	validate: (e, t) => {
		let n = xh.parse(e), r = t, i = r.accounts.accounts, a = r.journals.journalEntries, o = r.bankAccounts.bankAccounts, s = (e, t) => {
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
				t.set(n.accountId, [Ch(e[0] + n.debit), Ch(e[1] + n.credit)]);
			}
			return [...t].filter(([, e]) => e[0] || e[1]).sort(([e], [t]) => e.localeCompare(t));
		};
		function d(e, t, n, r, i, o, s, c) {
			let l = a.find((t) => t.id === e);
			if (!l || l.sourceType !== t || l.sourceId !== n || l.journalDate !== r || Dh(u(l.lines)) !== Dh(u(i)) || l.status !== (o ? "REVERSED" : "POSTED")) throw Error("Payroll source journal mismatch.");
			if (o) {
				let e = a.find((e) => e.id === s);
				if (!e || e.reversedJournalEntryId !== l.id || l.reversalJournalEntryId !== e.id || e.journalDate !== c || Dh(u(e.lines)) !== Dh(u(i.map((e) => ({
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
				let i = Ch(t.lines.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + t.amount, 0));
				for (let e of t.lines) {
					s("items", e.item.id), c(e.item.accountId, [
						"Earnings",
						"Allowance",
						"Employer contribution"
					].includes(e.item.category) ? "EXPENSE" : "LIABILITY"), e.item.category === "Employer contribution" && c(e.item.liabilityAccountId, "LIABILITY");
					let t = e.item.method === "Percentage" ? Ch(i * e.rate / 100) : Ch(e.quantity * e.rate);
					if (e.amount !== t) throw Error("Payroll line calculation mismatch.");
				}
				if (t.employee.taxScale !== "Manual" && (!t.employee.standardTaxConfirmed || r.withholding !== 0)) throw Error("Automatic PAYG declaration mismatch.");
				let a = t.lines.filter((t) => t.item.id === e.settings.superItemId), o = t.lines.filter((e) => e.item.category === "Tax");
				if (a.length !== 1 || a[0].amount !== (r.superMethod === "12% reviewed QE" ? Ch(r.superBase * .12) : r.superAmount) || o.length !== 1 || o[0].item.id !== e.settings.taxItemId || new Set(t.timeIds).size !== t.timeIds.length || new Set(t.leaveIds).size !== t.leaveIds.length) throw Error("Payroll tax, super or source snapshot mismatch.");
				let l = Ch((t.employee.taxScale === "Manual" ? r.withholding : km(t.totals.taxable, t.employee.taxScale, e.settings.frequency, e.payDate)) + r.additionalWithholding);
				if (Dh(wh(t.lines)) !== Dh(t.totals) || t.totals.withholding !== l) throw Error("Payroll payslip totals mismatch.");
				for (let [n, r] of [["timesheets", t.timeIds], ["leave", t.leaveIds]]) for (let i of r) {
					let r = s(n, i);
					if (r.employeeId !== t.employee.id) throw Error("Payroll hours belong to another employee.");
					if (jh(e)) {
						if (f.has(i) || r.status !== "Approved") throw Error("Payroll source is reused or unapproved.");
						let a = n === "timesheets" ? r.date : r.start, o = n === "timesheets" ? r.date : r.end;
						if (Bh(t.employee, a, o), a < e.start || o > e.end) throw Error("Payroll source dates are outside the pay period.");
						let s = n === "timesheets" ? "Time:" : "Leave:", c = t.employee.basis === "Hourly" && (n === "timesheets" || r.type !== "Unpaid"), l = t.lines.filter((e) => e.source === s + i);
						if (c ? l.length !== 1 || l[0].quantity !== r.hours || l[0].item.id !== (n === "timesheets" ? r.itemId : t.employee.earningItemId) : l.length !== 0) throw Error("Payroll source hours do not match the frozen payslip.");
						f.add(i);
					}
				}
			}
			if (Dh(Th(e.slips)) !== Dh(e.totals)) throw Error("Payroll run totals mismatch.");
			if (["Posted", "Reversed"].includes(e.status)) {
				if (!e.taxReviewed || e.reviewReference.trim().length < 3) throw Error("Posted payroll has no withholding review.");
				d(e.journalId, "PAYROLL", e.id, e.payDate, Jh(e), e.status === "Reversed", e.reversalJournalId, e.reversalDate);
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
			for (let n of Jh(e).filter((e) => e.credit)) t.set(n.accountId, Ch((t.get(n.accountId) ?? 0) + n.credit));
			for (let [r, i] of t) if (Ch(n.payments.filter((t) => t.runId === e.id && t.accountId === r && t.status === "Posted").reduce((e, t) => e + t.amount, 0)) > i) throw Error("Payroll liabilities are overpaid.");
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
			if (p.add(e.operationId), e.input.operationId !== e.operationId || Dh({
				input: e.input,
				actorId: e.actorId
			}) !== e.fingerprint) throw Error("Invalid payroll operation fingerprint.");
			if (s(e.entity, e.recordId).revision < e.revision) throw Error("Invalid payroll operation revision.");
		}
	}
});
//#endregion
//#region electron/security/documentRecycleRepository.ts
var Xh = E().trim().min(1).max(200), Zh = E().regex(/^[a-f0-9]{64}$/), Qh = (e) => Array.isArray(e) ? e.map(Qh) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, Qh(e[t])])) : e, $h = (e) => Oe("sha256").update(JSON.stringify(Qh(e))).digest("hex"), eg = (e) => e === "Purchase order" || e === "Expense bill draft" ? "purchases.read" : "sales.read", tg = (e) => e === "Quote" ? "sales.write" : e === "Purchase order" ? "purchases.write" : e === "Expense bill draft" ? "purchases.bill" : "sales.manage";
function ng(e, t) {
	let [n, r] = oe[e];
	return (t[n]?.[r] ?? []).filter((t) => e === "Sales order draft" ? t.kind === "ORDER" : e !== "Invoice draft" || t.kind === "INVOICE");
}
function rg(e, t, n) {
	let r = ng(e, n).find((e) => e.id === t);
	if (!r) throw Error("Document was not found in the selected dataset.");
	return r;
}
function ig(e, t, n) {
	let r = [];
	(t.status !== "DRAFT" || t.documentId) && r.push("Only unapproved, unposted drafts can be recycled.");
	let i = (e) => e === t.id || (Array.isArray(e) ? e.some(i) : !!e && typeof e == "object" && Object.values(e).some(i)), [a, o] = oe[e];
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
function ag(e, n = t()) {
	return xe.filter((t) => g(e, eg(t))).flatMap((t) => ng(t, n).map((r) => {
		let i = me().findLast((e) => e.recordId === r.id), a = t === "Purchase order" || t === "Expense bill draft", o = a ? r.supplierId ?? r.payload?.supplierId : r.customerId ?? r.payload?.customerId;
		return {
			kind: t,
			party: (a ? n.suppliers?.suppliers : n.customers?.customers)?.find((e) => e.id === o)?.businessName ?? o ?? "",
			reference: r.customerReference ?? r.payload?.customerReference ?? r.payload?.supplierInvoiceNumber ?? r.supplierReference ?? "",
			recordId: r.id,
			label: r.documentNumber ?? r.purchaseOrderNumber ?? `${r.kind} · ${r.id}`,
			date: r.documentDate ?? r.orderDate ?? r.payload?.documentDate ?? "",
			status: r.status,
			total: r.totals.total,
			token: $h({
				record: r,
				lifecycle: i?.id ?? ""
			}),
			deleted: i?.action === "Trashed",
			last: i,
			canWrite: g(e, tg(t)),
			issues: ig(t, r, n)
		};
	}));
}
var og = e({
	operationId: Xh,
	action: T(["Trashed", "Recovered"]),
	reason: E().trim().min(3).max(2e3),
	records: s(e({
		kind: T(xe),
		recordId: Xh,
		token: Zh
	}).strict()).min(1).max(100)
}).strict(), sg = e({
	id: Xh,
	operationId: Xh,
	fingerprint: Zh,
	kind: T(xe),
	recordId: Xh,
	action: T([
		"Trashed",
		"Recovered",
		"Purged"
	]),
	actorId: Xh,
	at: je(),
	reason: E().trim().min(3).max(2e3),
	recordToken: Zh,
	contentToken: Zh
}).strict(), cg = s(e({
	kind: T(xe),
	recordId: Xh,
	token: Zh
}).strict()).min(1).max(100), lg = e({
	operationId: Xh,
	records: cg,
	expectedDigest: Zh,
	reason: E().trim().min(10).max(2e3),
	confirmation: E()
}).strict(), ug = e({
	id: de(),
	fileName: E().regex(/^pre-purge-[a-f0-9-]+\.json$/),
	sha256: Zh,
	createdAt: je()
}).strict().refine((e) => e.fileName === `pre-purge-${e.id}.json`, "Backup filename and identity must match."), dg = e({
	previewDigest: Zh,
	confirmation: E(),
	backup: ug,
	label: Xh,
	reservedNumber: Xh.optional(),
	creationOperationId: Xh.optional()
}).strict(), fg = sg.extend({ purge: dg.optional() }), pg = /* @__PURE__ */ new Map();
function mg() {
	let e = G.require("users.manage");
	if (!e.roles.includes("ADMIN")) throw Error("Only an ADMIN may permanently purge documents.");
	return e;
}
function hg(e, t) {
	if (typeof e == "string") {
		if (e === t || e.startsWith(t + ":")) return !0;
		if ((e.startsWith("{") || e.startsWith("[")) && e.length < 5e7) try {
			return hg(JSON.parse(e), t);
		} catch {}
		return !1;
	}
	return Array.isArray(e) ? e.some((e) => hg(e, t)) : !!e && typeof e == "object" && Object.values(e).some((e) => hg(e, t));
}
function gg(e, t, n) {
	let r = ig(e, t, n), [i, a] = oe[e];
	for (let [o, s] of Object.entries(n)) {
		if (o === "documentRecycle") continue;
		let n = s;
		if (o === i && (n = {
			...s,
			[a]: s[a].filter((e) => e.id !== t.id)
		}), o === "financialCache" && e === "Purchase order") {
			let e = s.purchaseOrders?.find((e) => e.id === t.id);
			(!e || $h(e) !== $h(t)) && r.push("Purchase order cache does not match its source."), n = {
				...s,
				purchaseOrders: s.purchaseOrders.filter((e) => e.id !== t.id)
			};
		}
		hg(n, t.id) && r.push(`Referenced by ${o}; permanent purge is blocked.`);
	}
	return hg(O.list(), t.id) && r.push("Referenced by the financial operation journal."), [...new Set(r)];
}
function _g(e, t) {
	if (new Set(e.map((e) => e.recordId)).size !== e.length) throw Error("Select each document only once.");
	return e.map((e) => {
		let n = rg(e.kind, e.recordId, t), r = me().findLast((t) => t.recordId === e.recordId);
		if ($h({
			record: n,
			lifecycle: r?.id ?? ""
		}) !== e.token) throw Error("Document changed. Refresh the selection.");
		let i = gg(e.kind, n, t);
		return r?.action !== "Trashed" && i.push("Move this draft to the recycle bin before permanent purge."), {
			...e,
			label: n.documentNumber ?? n.purchaseOrderNumber ?? `${n.kind} · ${n.id}`,
			blockers: i
		};
	});
}
function vg(e, t) {
	return $h({
		records: e,
		snapshots: t,
		operations: O.list()
	});
}
i("documentRecycle", {
	repository: {
		preparePurge(n) {
			let r = mg(), i = e({ records: cg }).strict().parse(n), a = t(), o = _g(i.records, a), s = $h({
				nonce: crypto.randomUUID(),
				actor: r.userId,
				evidence: vg(i.records, a)
			}), c = Date.now() + 3e5;
			for (let [e, t] of pg) t.expires < Date.now() && pg.delete(e);
			return pg.size >= 100 && pg.delete(pg.keys().next().value), pg.set(s, {
				actor: r.userId,
				expires: c,
				evidence: vg(i.records, a)
			}), {
				digest: s,
				expiresAt: new Date(c).toISOString(),
				rows: o,
				confirmation: `PURGE ${o.length} DRAFTS`,
				eligible: o.every((e) => !e.blockers.length)
			};
		},
		purge(e) {
			let n = mg(), r = lg.parse(e), i = $h({
				input: r,
				actorId: n.userId
			}), a = me().filter((e) => e.operationId === r.operationId);
			if (a.length) {
				if (a[0].fingerprint !== i) throw Error("Operation ID has different purge data.");
				return structuredClone(a);
			}
			let o = t(), s = pg.get(r.expectedDigest);
			if (!s || s.actor !== n.userId || s.expires < Date.now() || s.evidence !== vg(r.records, o)) throw Error("Purge preview expired or data changed. Prepare a fresh preview.");
			let c = _g(r.records, o);
			if (r.confirmation !== `PURGE ${c.length} DRAFTS`) throw Error("Type the exact permanent purge confirmation.");
			if (c.some((e) => e.blockers.length)) throw Error(c.flatMap((e) => e.blockers).join(" "));
			let l = ug.parse(u()), d = (/* @__PURE__ */ new Date()).toISOString(), f = c.map((e) => {
				let t = rg(e.kind, e.recordId, o);
				return {
					id: crypto.randomUUID(),
					operationId: r.operationId,
					fingerprint: i,
					kind: e.kind,
					recordId: e.recordId,
					action: "Purged",
					actorId: n.userId,
					at: d,
					reason: r.reason,
					recordToken: e.token,
					contentToken: $h(t),
					purge: {
						previewDigest: r.expectedDigest,
						confirmation: r.confirmation,
						backup: l,
						label: e.label,
						...t.documentNumber || t.purchaseOrderNumber ? { reservedNumber: t.documentNumber ?? t.purchaseOrderNumber } : {},
						...t.operationId ? { creationOperationId: t.operationId } : {}
					}
				};
			}), p = (e) => new Set(c.filter((t) => t.kind === e).map((e) => e.recordId));
			return N.transaction(() => {
				p("Quote").size && ca(p("Quote")), p("Purchase order").size && Ra(p("Purchase order"));
				let e = /* @__PURE__ */ new Set([
					...p("Sales order draft"),
					...p("Invoice draft"),
					...p("Expense bill draft")
				]);
				e.size && sl(e), Ce([...me(), ...f]);
			}), structuredClone(f);
		},
		list() {
			return ag(G.require("inventory.read"));
		},
		detail(e, n) {
			return e = T(xe).parse(e), G.require("inventory.read"), G.require(eg(e)), structuredClone(rg(e, Xh.parse(n), t()));
		},
		change(e) {
			let n = og.parse(e), r = G.require("inventory.read");
			n.records.forEach((e) => {
				G.require(eg(e.kind)), G.require(tg(e.kind));
			});
			let i = $h({
				input: n,
				actorId: r.userId
			}), a = me().filter((e) => e.operationId === n.operationId);
			if (a.length) {
				if (a[0].fingerprint !== i) throw Error("Operation ID has different recycle data.");
				return structuredClone(a);
			}
			let o = t(), s = /* @__PURE__ */ new Set();
			for (let e of n.records) {
				if (s.has(e.recordId)) throw Error("Select each document only once.");
				s.add(e.recordId);
				let t = rg(e.kind, e.recordId, o);
				if ($h({
					record: t,
					lifecycle: me().findLast((t) => t.recordId === e.recordId)?.id ?? ""
				}) !== e.token) throw Error("Document changed. Refresh and review the selection again.");
				if (_e(e.recordId) !== (n.action === "Recovered")) throw Error("Document recycle state changed. Refresh the selection.");
				let r = ig(e.kind, t, o);
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
				contentToken: $h(rg(e.kind, e.recordId, o))
			}));
			return Ce([...me(), ...l]), structuredClone(l);
		}
	},
	read: "inventory.read",
	commands: {
		list: "inventory.read",
		detail: "inventory.read",
		change: "inventory.read",
		preparePurge: "users.manage",
		purge: "users.manage"
	},
	snapshot: () => ({ history: me() }),
	restore: (e) => Ce(e.history),
	publish: () => {},
	view: (e) => ({ history: me().filter((t) => g(e, eg(t.kind))) }),
	validate: (t, n) => {
		let { history: r } = e({ history: s(fg) }).strict().parse(t), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
		for (let e of r) {
			if (i.has(e.id)) throw Error("Duplicate recycle event.");
			i.add(e.id);
			let t = r.findLast((t) => t.recordId === e.recordId);
			if (r.some((t) => t.recordId === e.recordId && t.kind !== e.kind)) throw Error("Recycle document kind changed.");
			let s = t.action === "Purged" ? void 0 : rg(e.kind, e.recordId, n);
			if (a.get(e.recordId) === "Purged" || e.action === "Purged" && a.get(e.recordId) !== "Trashed") throw Error("Invalid permanent purge lifecycle.");
			if (e.action === "Purged") {
				if (e.reason.trim().length < 10) throw Error("Permanent purge reason is too short.");
				if (!e.purge || ng(e.kind, n).some((t) => t.id === e.recordId)) throw Error("Purged source must be absent and its backup receipt retained.");
				if (r.slice(0, r.indexOf(e)).findLast((t) => t.recordId === e.recordId)?.contentToken !== e.contentToken) throw Error("Purge content receipt changed.");
				for (let [t, r] of Object.entries(n)) if (t !== "documentRecycle" && hg(r, e.recordId)) throw Error("Purged document still has references.");
				if (xe.flatMap((e) => ng(e, n)).some((t) => e.purge?.creationOperationId && t.operationId === e.purge.creationOperationId || e.purge?.reservedNumber && (t.documentNumber === e.purge.reservedNumber || t.purchaseOrderNumber === e.purge.reservedNumber))) throw Error("Purged document identity was reused.");
			} else if (e.purge) throw Error("Unexpected permanent purge receipt.");
			if ((a.get(e.recordId) ?? "Recovered") === e.action) throw Error("Invalid recycle lifecycle sequence.");
			if (!r.slice(r.indexOf(e) + 1).some((t) => t.recordId === e.recordId) && e.action === "Trashed" && (ig(e.kind, s, n).length || $h(s) !== e.contentToken)) throw Error("Recycled document content or references changed.");
			a.set(e.recordId, e.action), o.set(e.operationId, [...o.get(e.operationId) ?? [], e]);
		}
		for (let e of o.values()) {
			let t = e[0], n = e.map((e) => ({
				kind: e.kind,
				recordId: e.recordId,
				token: e.recordToken
			}));
			if (new Set(n.map((e) => e.recordId)).size !== n.length || e.some((e) => e.fingerprint !== t.fingerprint || e.action !== t.action || e.actorId !== t.actorId || e.at !== t.at || e.reason !== t.reason) || $h({
				input: t.action === "Purged" ? {
					operationId: t.operationId,
					records: n,
					expectedDigest: t.purge?.previewDigest,
					reason: t.reason,
					confirmation: t.purge?.confirmation
				} : {
					operationId: t.operationId,
					action: t.action,
					reason: t.reason,
					records: n
				},
				actorId: t.actorId
			}) !== t.fingerprint || t.action === "Purged" && (t.purge?.confirmation !== `PURGE ${n.length} DRAFTS` || e.some((e) => $h(e.purge?.backup) !== $h(t.purge?.backup) || e.purge?.previewDigest !== t.purge?.previewDigest || e.purge?.confirmation !== t.purge?.confirmation))) throw Error("Invalid recycle operation receipt.");
		}
	}
});
//#endregion
//#region src/features/contacts/schemas/supplierSchemas.ts
var yg = ["ACTIVE", "INACTIVE"], bg = E().trim().refine((e) => e === "" || E().email().safeParse(e).success, { message: "Enter a valid email address" }), xg = E().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), Sg = e({
	businessName: E().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: E().trim().max(120, "Trading name is too long"),
	abn: xg,
	status: T(yg),
	email: bg,
	phone: E().trim().max(40, "Phone number is too long"),
	website: E().trim().max(200, "Website is too long"),
	contactName: E().trim().max(120, "Contact name is too long"),
	addressLine1: E().trim().max(160, "Address is too long"),
	addressLine2: E().trim().max(160, "Address is too long"),
	suburb: E().trim().max(100, "Suburb is too long"),
	state: E().trim().max(50, "State is too long"),
	postcode: E().trim().max(20, "Postcode is too long"),
	country: E().trim().min(1, "Country is required").max(100, "Country is too long"),
	paymentTermsDays: f({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days"),
	taxRegistered: y(),
	notes: E().trim().max(2e3, "Notes are too long")
}), Cg = e({
	id: E().min(1),
	code: T([
		"M2",
		"LM",
		"BOX",
		"PIECE",
		"ROLL",
		"BUCKET",
		"HOUR",
		"JOB"
	]),
	name: E().trim().min(1),
	symbol: E().min(1),
	conversionToBase: f().finite().positive(),
	basePrice: f().finite().nonnegative(),
	isBaseUnit: y(),
	active: y()
}).strict(), wg = e({
	id: E().min(1),
	sku: E().trim().min(1).max(80),
	name: E().trim().min(1).max(180),
	category: T([
		"Timber",
		"Hybrid",
		"Laminate",
		"Vinyl",
		"Carpet",
		"Accessories",
		"Other"
	]),
	brand: E().optional(),
	collection: E().optional(),
	description: E().optional(),
	status: T(["ACTIVE", "INACTIVE"]),
	baseUnitId: E().min(1),
	units: s(Cg).min(1),
	createdAt: E(),
	updatedAt: E(),
	revision: f().int().nonnegative().optional(),
	itemType: T([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	buyEnabled: y().optional(),
	sellEnabled: y().optional(),
	reorderPoint: f().finite().nonnegative().optional(),
	targetStock: f().finite().nonnegative().optional(),
	wholePacks: y().optional(),
	taxCode: E().min(1).optional()
}).strict(), Tg = /* @__PURE__ */ new Set(), Eg = [...Wn];
function Dg() {
	Eg = [...Wn], Tg.forEach((e) => e());
}
function Og(e, t, n) {
	if (Array.isArray(e)) return e.some((e) => Og(e, t, n));
	if (!e || typeof e != "object") return !1;
	let r = e;
	return r.productId === t && (!n || r.unitId === n) || Object.values(r).some((e) => Og(e, t, n));
}
function kg(e) {
	let t = s(wg).parse(e), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.id) || r.has(e.sku.toLowerCase())) throw Error("Duplicate product ID or SKU.");
		if (n.add(e.id), r.add(e.sku.toLowerCase()), !Vn(e) && e.buyEnabled !== !1) throw Error("Non-stock/service catalogue items must use expense bills for purchasing.");
		if (!Vn(e) && ((e.reorderPoint ?? 0) !== 0 || (e.targetStock ?? 0) !== 0)) throw Error("Non-stock/service items cannot have stock reorder thresholds.");
		if (Vn(e) && e.units.some((e) => e.code === "HOUR" || e.code === "JOB")) throw Error("Hour/job units require non-stock or service items.");
		if (new Set(e.units.map((e) => e.id)).size !== e.units.length || e.units.filter((e) => e.isBaseUnit).length !== 1 || !e.units.some((t) => t.id === e.baseUnitId && t.isBaseUnit && t.conversionToBase === 1)) throw Error("A product needs exactly one valid base unit.");
		if ((e.targetStock ?? 0) < (e.reorderPoint ?? 0)) throw Error("Target stock must be at least the reorder point.");
	}
	return t;
}
var Ag = {
	subscribe(e) {
		return Tg.add(e), () => {
			Tg.delete(e);
		};
	},
	getSnapshot: () => Eg,
	getAll: () => Wn,
	getById: (e) => Wn.find((t) => t.id === e),
	save(e, n) {
		let r = wg.parse(e), i = Wn.find((e) => e.id === r.id);
		if (i && n !== (i.revision ?? 0)) throw Error("Product changed since it was opened. Reload before saving.");
		if (!i && n !== void 0) throw Error("Product no longer exists.");
		if (ue(r.taxCode ?? "GST"), !Vn(r) && r.buyEnabled !== !1) throw Error("Non-stock and service catalogue items are sales-only. Use expense/service bills for supplier costs.");
		let a = t();
		if (delete a.products, i) {
			let e = { ...a };
			if (delete e.costingPolicies, (i.itemType ?? "STOCK") !== (r.itemType ?? "STOCK") && Og(e, r.id)) throw Error("A referenced product cannot change item type. Create a new catalogue item.");
			if (i.baseUnitId !== r.baseUnitId && Og(a, r.id)) throw Error("A referenced product cannot change base unit.");
			for (let e of i.units) {
				let t = r.units.find((t) => t.id === e.id);
				if ((!t || t.conversionToBase !== e.conversionToBase || t.code !== e.code) && Og(a, r.id, e.id)) throw Error("A referenced unit conversion cannot be changed or removed. Add a new unit instead.");
			}
		}
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			...r,
			createdAt: i?.createdAt ?? o,
			updatedAt: o,
			revision: (i?.revision ?? 0) + 1
		};
		return kg([...Wn.filter((e) => e.id !== r.id), s]), i ? Wn.splice(Wn.indexOf(i), 1, s) : Wn.push(s), bo.ensureProductPolicy(s.id, s.baseUnitId, Vn(s)), i && Vn(i) !== Vn(s) && bo.setActive(s.id, Vn(s)), Dg(), s;
	}
};
i("products", {
	validate: (e, t) => {
		let n = kg(e.products), r = t.workspace_tax_codes.records, i = t.costingPolicies.policies, a = t.stock.balances;
		for (let e of n.filter((e) => !Vn(e))) if (i.some((t) => t.productId === e.id && t.active) || a.some((t) => t.productId === e.id && t.quantityOnHand !== 0)) throw Error("Non-stock/service product has inventory activity or active costing.");
		if (n.some((e) => !r.some((t) => t.code === (e.taxCode ?? "GST")))) throw Error("Backup product tax-code reference is invalid.");
	},
	repository: Ag,
	read: "inventory.read",
	commands: { save: "inventory.adjust" },
	snapshot: () => ({ products: structuredClone(Wn) }),
	restore: (e) => {
		let t = kg(e.products);
		Wn.splice(0, Wn.length, ...t), Eg = [...Wn];
	},
	publish: Dg
});
//#endregion
//#region electron/security/transferRepository.ts
var jg = E().trim().min(1).max(200), Mg = E().trim().min(1).max(2e3), Ng = (e) => Array.isArray(e) ? e.map(Ng) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).filter(([, e]) => e !== void 0).sort(([e], [t]) => e < t ? -1 : +(e > t)).map(([e, t]) => [e, Ng(t)])) : e, Pg = (e) => Oe("sha256").update(JSON.stringify(Ng(e))).digest("hex"), Fg = [], Ig = (e, t = !1) => {
	G.require("inventory.read");
	let n = G.require(qm[e].read);
	return t && G.require(qm[e].write), n.userId;
};
function Lg(e) {
	return e === "Customers" ? R.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Suppliers" ? Sa.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Products" ? Ag.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : R.getAll().flatMap((t) => (e === "Customer branches" ? t.locations : t.contacts).map((e) => ({
		id: e.id,
		parentId: t.id,
		raw: e
	})));
}
function Rg(e, t) {
	let n = {};
	for (let [r, i] of Object.entries(Gm[e])) n[r] = String(t.raw[r] ?? i);
	if ((e === "Customer branches" || e === "Customer contacts") && (n.customerId = t.parentId), e === "Products") {
		let e = t.raw;
		n.taxCode = e.taxCode ?? "", n.itemType = e.itemType ?? "STOCK", n.buyEnabled = String(e.buyEnabled ?? (e.itemType === void 0 || e.itemType === "STOCK")), n.baseUnitCode = e.units.find((t) => t.id === e.baseUnitId).code, n.unitsJson = JSON.stringify(e.units);
	}
	return n;
}
function zg(e, t) {
	return {
		_format: Um,
		id: t.id,
		recordToken: Pg({
			parentId: t.parentId,
			record: t.raw
		}),
		externalId: Fg.filter((t) => t.dataset === e).flatMap((e) => e.results).find((e) => e.action === "Created" && e.recordId === t.id)?.externalId ?? "",
		...Rg(e, t)
	};
}
function Bg(e, t) {
	if (!/^-?\d+(?:\.\d+)?$/.test(e) || !Number.isFinite(Number(e)) || Math.abs(Number(e)) > 2 ** 53 - 1) throw Error(`${t} must contain a safe plain number.`);
	return Number(e);
}
function Vg(e, t, n) {
	let r = n ? Rg(e, n) : { ...Gm[e] };
	for (let n of Object.keys(Gm[e])) if (Object.hasOwn(t, n)) {
		let i = t[n].trim();
		if (typeof Gm[e][n] == "number") r[n] = Bg(i, n);
		else if (typeof Gm[e][n] == "boolean") {
			if (!["true", "false"].includes(i)) throw Error(`${n} must be true or false.`);
			r[n] = i === "true";
		} else r[n] = i.trim();
	}
	if (n) for (let [n, i] of Object.entries(Gm[e])) Object.hasOwn(t, n) || (typeof i == "number" && (r[n] = Number(r[n])), typeof i == "boolean" && (r[n] = r[n] === "true"));
	return r;
}
var Hg = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), Ug = (e, t) => e.some((e) => e.reasons.some((n) => !t.some((t) => t.id === e.id && t.reasons.includes(n))));
function Wg(e, t) {
	return t.map((t) => ({
		id: t.id,
		reasons: [
			...Hg(t.businessName) === Hg(e.businessName) ? ["Name"] : [],
			...e.email && t.email?.toLowerCase() === e.email.toLowerCase() ? ["Email"] : [],
			...e.abn && Hg(t.abn) === Hg(e.abn) ? ["Identifier"] : []
		]
	})).filter((e) => e.reasons.length);
}
function Gg(t, n, r, i = !1) {
	let a = r.id ? Lg(t).find((e) => e.id === r.id) : void 0;
	if (n === "Update by ID") {
		if (!a) throw Error("Existing record ID was not found.");
		if (!i && (!r.recordToken || r.recordToken !== zg(t, a).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
	} else if (r.id || r.recordToken) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
	if (n === "Update by ID" && r.externalId && r.externalId !== zg(t, a).externalId) throw Error("External source IDs cannot be reassigned by an update. Keep the export value or leave it blank.");
	let o = n === "Update by ID" ? a : void 0, c = o ? zg(t, o) : null, l = Vg(t, r, o), u;
	if (t === "Customers") {
		let e = er.strict().parse(l), t = R.getAll().filter((e) => e.id !== o?.id);
		if (Ug(zm({
			kind: "Customer",
			customerId: "",
			values: e
		}, t), o ? zm({
			kind: "Customer",
			customerId: "",
			values: o.raw
		}, t) : [])) throw Error("Possible existing customer duplicate. Use the customer review workflow or explicit ID update.");
		u = o ? R.update(o.id, e) : R.create(e);
	} else if (t === "Suppliers") {
		let e = Sg.strict().parse(l), t = Sa.getAll().filter((e) => e.id !== o?.id);
		if (Ug(Wg(e, t), o ? Wg(o.raw, t) : [])) throw Error("Possible existing supplier duplicate. Resolve it before import.");
		u = o ? Sa.update(o.id, e) : Sa.create(e);
	} else if (t === "Products") {
		let t = s(e({
			id: E().max(200).optional(),
			code: T([
				"M2",
				"LM",
				"BOX",
				"PIECE",
				"ROLL",
				"BUCKET",
				"HOUR",
				"JOB"
			]),
			name: E().trim().min(1).max(120),
			symbol: E().min(1).max(40),
			conversionToBase: f().finite().positive(),
			basePrice: f().finite().nonnegative(),
			isBaseUnit: y(),
			active: y()
		}).strict()).min(1).max(100).parse(JSON.parse(String(l.unitsJson))), n = o?.raw, i = t.map((e) => {
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
		let { unitsJson: c, baseUnitCode: d, ...p } = l, m = (/* @__PURE__ */ new Date()).toISOString();
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
		let h = wg.parse({
			...p,
			id: o?.id ?? crypto.randomUUID(),
			baseUnitId: a.id,
			units: i,
			createdAt: n?.createdAt ?? m,
			updatedAt: m
		});
		u = Ag.save(h, n?.revision ?? (o ? 0 : void 0));
	} else {
		let e = String(l.customerId), n = R.getById(e);
		if (!n || n.status === "INACTIVE") throw Error("Select an existing, non-inactive parent customer.");
		if (o && o.parentId !== e) throw Error("Existing branch/contact cannot move to a different customer.");
		let { customerId: r, ...i } = l, a = t === "Customer branches" ? "Branch" : "Contact", s = a === "Branch" ? tr.strict().parse(i) : nr.strict().parse(i);
		if (Ug(zm({
			kind: a,
			customerId: e,
			values: s
		}, [n]).filter((e) => e.id !== o?.id), o ? zm({
			kind: a,
			customerId: e,
			values: o.raw
		}, [n]).filter((e) => e.id !== o.id) : [])) throw Error("Possible existing branch/contact duplicate. Use customer review or explicit ID update.");
		u = a === "Branch" ? o ? R.updateLocation(e, o.id, s) : R.addLocation(e, s) : o ? R.updateContact(e, o.id, s) : R.addContact(e, s);
	}
	let d = Lg(t).find((e) => e.id === u.id);
	return {
		recordId: u.id,
		before: c,
		after: zg(t, d)
	};
}
function Kg(e) {
	if (Ig(e.dataset, !0), Buffer.byteLength(e.text, "utf8") > 1e6) throw Error("CSV source exceeds 1 MB of UTF-8 text.");
	let n = Ym(e), r = new Map(Lg(e.dataset).map((t) => [t.id, zg(e.dataset, t)])), i = t(), a = Pg({
		input: e,
		master: i
	}), o = /* @__PURE__ */ new Set(), s = [], c = [];
	try {
		for (let t of n.rows) {
			let n = t.values, i = (n.externalId ?? "").trim(), a = Pg({
				dataset: e.dataset,
				values: Object.fromEntries(Object.keys(Gm[e.dataset]).filter((e) => Object.hasOwn(n, e)).map((e) => [e, n[e]]))
			}), l = e.mode === "Create" ? i : n.id, u = "", d;
			try {
				if (!l) throw Error(e.mode === "Create" ? "externalId is required for safe create retries." : "id is required for explicit updates.");
				if (l.length > 200 || i.length > 200) throw Error("Import identity exceeds 200 characters.");
				if (o.has(l)) throw Error("Repeated identity in this CSV file.");
				if (o.add(l), e.mode === "Create" && (n.id || n.recordToken)) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
				if (e.mode === "Update by ID" && (!r.has(n.id) || n.recordToken !== r.get(n.id).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
				let c = e.mode === "Create" ? Fg.filter((t) => t.dataset === e.dataset).flatMap((e) => e.results).find((e) => e.action === "Created" && e.externalId === i) : void 0;
				if (c) {
					if (c.identityFingerprint !== a) throw Error("Source externalId already contains different creation data. Use an explicit ID update.");
					let n = Lg(e.dataset).find((e) => e.id === c.recordId);
					if (!n) throw Error("Prior imported record is missing.");
					d = {
						row: t.row,
						externalId: i,
						recordId: n.id,
						action: "Skipped",
						identityFingerprint: a,
						before: null,
						after: zg(e.dataset, n)
					};
				} else {
					let o = Gg(e.dataset, e.mode, n, !0);
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
				let r = Lg(e.dataset).find((e) => e.id === n.recordId), a = zg(e.dataset, r);
				if (t.values = Object.fromEntries(Object.keys(Gm[e.dataset]).filter((e) => Object.hasOwn(a, e)).map((e) => [e, a[e]])), e.dataset === "Products") {
					let e = (i.products.products.find((e) => e.id === n.recordId)?.units ?? []).map((e) => e.id);
					t.values.unitsJson = JSON.stringify(JSON.parse(t.values.unitsJson).map((t) => ({
						...t,
						id: e.includes(t.id) ? t.id : "Assigned at commit"
					})));
				}
			}
		}
	} finally {
		d(i);
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
var qg = {
	review(e) {
		return Kg(Jm.parse(e)).preview;
	},
	commit(e) {
		let t = Jm.extend({
			operationId: jg,
			expectedPreview: E().regex(/^[a-f0-9]{64}$/),
			reason: Mg
		}).strict().parse(e), n = Ig(t.dataset, !0), { operationId: r, expectedPreview: i, reason: a, ...o } = t, s = Pg({
			source: o,
			reason: a
		}), c = Fg.find((e) => e.operationId === r);
		if (c) {
			if (c.fingerprint !== s) throw Error("Operation ID already has different import data.");
			return structuredClone(c);
		}
		let l = Kg(o);
		if (l.preview.fingerprint !== i) throw Error("Business records or import fields changed. Validate the file again.");
		if (!l.preview.valid) throw Error("Resolve every validation error before committing the batch.");
		let u = Ym(o), d = new Set(u.rows.map((e) => e.values.customerId || Lg(o.dataset).find((t) => t.id === e.values.id)?.parentId || "")), f = (e) => JSON.stringify({
			primaryLocationId: e.primaryLocationId,
			primaryContactId: e.primaryContactId,
			locations: e.locations,
			contacts: e.contacts
		}), p = ["Customer branches", "Customer contacts"].includes(o.dataset) ? R.getAll().filter((e) => d.has(e.id)).map((e) => ({
			customerId: e.id,
			before: f(e)
		})) : [], m = [];
		for (let [e, t] of u.rows.entries()) {
			let n = l.results[e];
			n.action === "Skipped" ? m.push(n) : m.push({
				...n,
				...Gg(o.dataset, o.mode, t.values, !0),
				before: n.before
			});
		}
		for (let e of m) {
			let t = Lg(o.dataset).find((t) => t.id === e.recordId);
			e.after = zg(o.dataset, t), e.action === "Created" && (e.after.externalId = e.externalId);
		}
		let h = {
			id: crypto.randomUUID(),
			operationId: r,
			fingerprint: s,
			dataset: o.dataset,
			mode: o.mode,
			fileName: o.fileName,
			sourceHash: Oe("sha256").update(o.text).digest("hex"),
			actorId: n,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			reason: a,
			results: m,
			parentChanges: p.map((e) => ({
				...e,
				after: f(R.getById(e.customerId))
			})).filter((e) => e.before !== e.after)
		};
		return Xg.parse(h), Fg = [...Fg, h], structuredClone(h);
	},
	export(e) {
		e = T(Vm).parse(e), Ig(e);
		let t = Km(e), n = Lg(e).map((t) => zg(e, t));
		return {
			dataset: e,
			count: n.length,
			csv: Xm([t, ...n.map((e) => t.map((t) => e[t] ?? ""))])
		};
	},
	template(e) {
		e = T(Vm).parse(e), Ig(e);
		let t = Km(e).filter((e) => !["id", "recordToken"].includes(e)), n = {
			_format: Um,
			externalId: "replace-with-stable-source-id",
			...Object.fromEntries(Object.entries(Gm[e]).map(([e, t]) => [e, String(t)]))
		};
		return (e === "Customers" || e === "Suppliers") && (n.businessName = "Replace company name"), e === "Suppliers" && (n.country = "Replace country"), e === "Customer branches" && (n.name = "Replace branch name", n.addressLine1 = "Replace address", n.suburb = "Replace city", n.state = "Replace region", n.postcode = "Replace postcode", n.country = "Replace country"), e === "Customer contacts" && (n.firstName = "Replace", n.lastName = "Name", n.email = "replace@example.test"), e === "Products" && (n.sku = "REPLACE-SKU", n.name = "Replace product name"), Xm([t, t.map((e) => n[e] ?? "")]);
	}
}, Jg = se(E(), E()), Yg = e({
	row: f().int().min(2).max(501),
	externalId: E().max(200),
	recordId: jg,
	action: T([
		"Created",
		"Updated",
		"Skipped"
	]),
	identityFingerprint: E().regex(/^[a-f0-9]{64}$/),
	before: Jg.nullable(),
	after: Jg
}).strict(), Xg = e({
	id: jg,
	operationId: jg,
	fingerprint: E().regex(/^[a-f0-9]{64}$/),
	dataset: T(Vm),
	mode: T(Hm),
	fileName: jg,
	sourceHash: E().regex(/^[a-f0-9]{64}$/),
	actorId: jg,
	at: E().refine((e) => new Date(e).toISOString() === e),
	reason: Mg,
	results: s(Yg).min(1).max(500),
	parentChanges: s(e({
		customerId: jg,
		before: E().max(5e6),
		after: E().max(5e6)
	}).strict()).max(500)
}).strict();
i("dataTransfers", {
	repository: qg,
	read: "inventory.read",
	commands: {
		review: "inventory.read",
		commit: "inventory.read",
		export: "inventory.read",
		template: "inventory.read"
	},
	snapshot: () => ({ runs: Fg }),
	restore: (e) => {
		Fg = e.runs;
	},
	publish: () => {},
	view: (e) => ({ runs: Fg.filter((t) => g(e, qm[t.dataset].read)) }),
	validate: (t, n) => {
		let r = e({ runs: s(Xg) }).strict().parse(t), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set();
		for (let t of r.runs) {
			if (i.has(t.operationId)) throw Error("Duplicate import operation.");
			i.add(t.operationId);
			let r = t.dataset === "Products" ? n.products.products : t.dataset === "Suppliers" ? n.suppliers.suppliers : n.customers.customers, c = 1;
			for (let e of t.results) {
				if (e.row <= c) throw Error("Import result rows must be ordered.");
				if (c = e.row, !(t.dataset === "Customer branches" ? r.some((t) => t.locations.some((t) => t.id === e.recordId)) : t.dataset === "Customer contacts" ? r.some((t) => t.contacts.some((t) => t.id === e.recordId)) : r.some((t) => t.id === e.recordId)) || e.after.id !== e.recordId || e.before && e.before.id !== e.recordId || e.action === "Updated" && !e.before || e.action !== "Updated" && e.before) throw Error("Invalid imported record reference or before/after audit.");
				if (e.action === "Created") {
					if (t.mode !== "Create" || !e.externalId || a.has(t.dataset + ":" + e.externalId) || o.has(t.dataset + ":" + e.recordId)) throw Error("Invalid import source identity.");
					a.set(t.dataset + ":" + e.externalId, e), o.add(t.dataset + ":" + e.recordId);
				}
				if (e.action === "Skipped") {
					let n = a.get(t.dataset + ":" + e.externalId);
					if (t.mode !== "Create" || !n || n.recordId !== e.recordId || n.identityFingerprint !== e.identityFingerprint) throw Error("Invalid skipped import identity.");
				}
				if (e.action === "Updated" && t.mode !== "Update by ID") throw Error("Invalid import update mode.");
				if (e.before && (Object.keys(e.before).some((e) => !Km(t.dataset).includes(e)) || e.before._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(e.before.recordToken))) throw Error("Invalid import before-state audit.");
				if (Object.keys(e.after).some((e) => !Km(t.dataset).includes(e)) || e.after._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(e.after.recordToken)) throw Error("Invalid import audit fields.");
			}
			if (new Set(t.parentChanges.map((e) => e.customerId)).size !== t.parentChanges.length || t.parentChanges.length && !["Customer branches", "Customer contacts"].includes(t.dataset)) throw Error("Invalid import parent audit.");
			for (let n of t.parentChanges) {
				if (!r.some((e) => e.id === n.customerId)) throw Error("Invalid import parent reference.");
				for (let t of [n.before, n.after]) {
					let n = e({
						primaryLocationId: E().optional(),
						primaryContactId: E().optional(),
						locations: s(e({ id: jg }).passthrough()),
						contacts: s(e({ id: jg }).passthrough())
					}).strict().parse(JSON.parse(t));
					if (n.primaryLocationId && !n.locations.some((e) => e.id === n.primaryLocationId) || n.primaryContactId && !n.contacts.some((e) => e.id === n.primaryContactId)) throw Error("Invalid import primary-record audit.");
				}
			}
		}
	}
});
//#endregion
//#region electron/security/attachmentRepository.ts
var Z = E().trim().min(1).max(200), Zg = E().trim().min(1).max(2e3), Qg = E().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), $g = e({
	id: Z,
	number: f().int().positive(),
	name: Z,
	mime: Z,
	size: f().int().positive().max(p),
	sha256: E().regex(/^[a-f0-9]{64}$/),
	content: E().max(14e6),
	createdAt: Qg,
	createdBy: Z,
	restoredFrom: Z.optional()
}).strict(), e_ = e({
	id: Z,
	title: E().trim().min(1).max(200),
	target: _,
	revision: f().int().positive(),
	currentVersionId: Z,
	versions: s($g).min(1).max(100),
	createdAt: Qg,
	createdBy: Z,
	updatedAt: Qg,
	updatedBy: Z,
	deletedAt: Qg.optional(),
	deletedBy: Z.optional()
}).strict(), t_ = (e) => ({
	title: e.title,
	deleted: !!e.deletedAt,
	currentVersionId: e.currentVersionId,
	versionsCount: e.versions.length
}), n_ = e({
	id: Z,
	documentId: Z,
	operationId: Z,
	action: T([
		"Uploaded",
		"Added version",
		"Restored version",
		"Renamed",
		"Trashed",
		"Recovered"
	]),
	actorId: Z,
	at: Qg,
	revision: f().int().positive(),
	reason: Zg,
	versionId: Z.optional(),
	fingerprint: E().regex(/^[a-f0-9]{64}$/),
	after: e({
		title: Z,
		deleted: y(),
		currentVersionId: Z,
		versionsCount: f().int().positive()
	}).strict()
}).strict(), r_ = [], i_ = [];
function a_() {
	return G.require("inventory.read");
}
var o_ = () => t([...new Set(Object.values(o).map((e) => e.repository))]);
function s_(e, t, r = o_()) {
	return n(r, t).find((t) => t.kind === e.kind && t.id === e.id);
}
function c_(e, t = !1) {
	let n = a_(), r = s_(e, n);
	if (!r) throw Error("Business link was not found or access is denied.");
	if (t && !r.canWrite) throw Error("Permission denied: attachment maintenance requires the linked object write permission.");
	return n.userId;
}
function l_(e, t = !1) {
	let n = r_.find((t) => t.id === Z.parse(e));
	if (!n) throw Error("Attachment not found or access denied.");
	return c_(n.target, t), n;
}
var u_ = (e) => Oe("sha256").update(JSON.stringify(e)).digest("hex"), d_ = (e, t) => {
	let n = s_(e.target, t);
	return {
		...e,
		targetLabel: n.label,
		targetPath: n.path,
		canWrite: n.canWrite,
		versions: e.versions.map(({ content: e, ...t }) => t)
	};
};
function f_(e, t) {
	if (e.revision !== t) throw Error("Attachment changed. Refresh before continuing.");
}
function p_(e, t) {
	if (t < e.updatedAt) throw Error("System clock precedes the last attachment change.");
}
function m_(e) {
	if (r_.flatMap((e) => e.versions).reduce((e, t) => e + t.size, 0) + e > 5e7) throw Error("Local attachment library exceeds 50 MB including versions and trash. Export/archive the business profile before adding more files.");
}
function h_(e, t) {
	let n = i_.find((t) => t.operationId === e);
	if (!n) return;
	let r = l_(n.documentId, !0);
	if (n.fingerprint !== t) throw Error("Operation ID already has different attachment data.");
	return d_(r, G.current());
}
function g_(e, t, n, r, i, a) {
	return r_ = [...r_.filter((t) => t.id !== e.id), e], i_ = [...i_, {
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
		after: t_(e)
	}], d_(e, G.current());
}
i("attachments", {
	repository: {
		targets() {
			return n(o_(), a_());
		},
		checkTarget(e) {
			return c_(_.parse(e), !0), !0;
		},
		upload(t) {
			let n = e({
				operationId: Z,
				id: Z.optional(),
				expectedRevision: f().int().nonnegative(),
				target: _,
				title: Z,
				reason: Zg,
				file: e({
					name: Z,
					content: E().max(14e6)
				}).strict()
			}).strict().parse(t), r = c_(n.target, !0), i = l(n.file.name, n.file.content), a = u_({
				...n,
				file: {
					name: i.name,
					sha256: i.sha256
				}
			}), o = h_(n.operationId, a);
			if (o) return o;
			let s = n.id ? l_(n.id, !0) : void 0;
			if (s) {
				if (f_(s, n.expectedRevision), JSON.stringify(s.target) !== JSON.stringify(n.target)) throw Error("An attachment retains its original business link.");
				if (s.deletedAt) throw Error("Recover the attachment before adding a version.");
				if (s.versions.some((e) => e.sha256 === i.sha256)) throw Error("These file bytes already exist in this attachment. Use version restore instead.");
				if (s.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
			} else if (n.expectedRevision !== 0) throw Error("A new attachment requires revision zero.");
			if (!s && r_.some((e) => !e.deletedAt && e.target.kind === n.target.kind && e.target.id === n.target.id && e.versions.some((e) => e.sha256 === i.sha256))) throw Error("This file already exists on the selected business object. Open its existing attachment.");
			m_(i.size);
			let c = (/* @__PURE__ */ new Date()).toISOString();
			s && p_(s, c);
			let u = {
				...i,
				id: crypto.randomUUID(),
				number: (s?.versions.length ?? 0) + 1,
				createdAt: c,
				createdBy: r
			};
			return g_({
				...s ?? {
					id: crypto.randomUUID(),
					target: n.target,
					createdAt: c,
					createdBy: r
				},
				title: s?.title ?? n.title,
				currentVersionId: u.id,
				versions: [...s?.versions ?? [], u],
				revision: (s?.revision ?? 0) + 1,
				updatedAt: c,
				updatedBy: r
			}, s ? "Added version" : "Uploaded", n.operationId, a, n.reason, u.id);
		},
		change(t) {
			let n = e({
				operationId: Z,
				id: Z,
				expectedRevision: f().int().positive(),
				action: T([
					"Renamed",
					"Trashed",
					"Recovered",
					"Restored version"
				]),
				reason: Zg,
				title: Z.optional(),
				versionId: Z.optional()
			}).strict().parse(t), r = l_(n.id, !0), i = u_(n), o = h_(n.operationId, i);
			if (o) return o;
			f_(r, n.expectedRevision);
			let s = c_(r.target, !0), c = (/* @__PURE__ */ new Date()).toISOString();
			p_(r, c);
			let l = {
				...r,
				versions: [...r.versions],
				revision: r.revision + 1,
				updatedBy: s,
				updatedAt: c
			}, u;
			if (n.action === "Trashed") {
				if (r.deletedAt) throw Error("Attachment is already in the recycle bin.");
				l.deletedAt = c, l.deletedBy = s;
			} else if (n.action === "Recovered") {
				if (!r.deletedAt) throw Error("Attachment is not in the recycle bin.");
				delete l.deletedAt, delete l.deletedBy;
			} else {
				if (r.deletedAt) throw Error("Recover the attachment before editing.");
				if (n.action === "Renamed") {
					if (!n.title) throw Error("Enter a document title.");
					l.title = n.title;
				} else {
					let e = r.versions.find((e) => e.id === n.versionId);
					if (!e) throw Error("Version not found.");
					if (e.id === r.currentVersionId) throw Error("That version is already current.");
					if (r.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
					m_(e.size), a(e);
					let t = {
						...e,
						id: crypto.randomUUID(),
						number: r.versions.length + 1,
						createdAt: c,
						createdBy: s,
						restoredFrom: e.id
					};
					l.versions.push(t), l.currentVersionId = t.id, u = t.id;
				}
			}
			return g_(l, n.action, n.operationId, i, n.reason, u);
		},
		read(t) {
			let n = e({
				id: Z,
				versionId: Z
			}).strict().parse(t), r = l_(n.id).versions.find((e) => e.id === n.versionId);
			if (!r) throw Error("Version not found.");
			return a(r), { ...r };
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
		documents: r_,
		history: i_
	}),
	restore: (e) => {
		r_ = e.documents, i_ = e.history;
	},
	publish: () => {},
	view: (e) => {
		let t = r_.filter((t) => s_(t.target, e));
		return {
			documents: t.map((t) => d_(t, e)),
			history: i_.filter((e) => t.some((t) => t.id === e.documentId)).map(({ fingerprint: e, ...t }) => t)
		};
	},
	validate: (t, n) => {
		let r = e({
			documents: s(e_),
			history: s(n_)
		}).strict().parse(t), i = /* @__PURE__ */ new Set(), c = 0;
		for (let e of r.documents) {
			let t = o[e.target.kind];
			if (!n[t.repository]?.[t.collection]?.some((t) => t.id === e.target.id)) throw Error("Invalid attachment business reference.");
			if (!!e.deletedAt != !!e.deletedBy) throw Error("Invalid attachment recycle metadata.");
			let i = /* @__PURE__ */ new Set();
			for (let [t, n] of e.versions.entries()) {
				if (a(n), c += n.size, i.has(n.id) || n.number !== t + 1 || n.createdAt < e.createdAt || n.createdAt > e.updatedAt) throw Error("Invalid attachment version history.");
				if (n.restoredFrom && (!i.has(n.restoredFrom) || e.versions.find((e) => e.id === n.restoredFrom)?.sha256 !== n.sha256 || e.versions.find((e) => e.id === n.restoredFrom)?.name !== n.name)) throw Error("Invalid restored attachment version.");
				i.add(n.id);
			}
			if (!i.has(e.currentVersionId)) throw Error("Invalid current attachment version.");
			let s = r.history.filter((t) => t.documentId === e.id);
			if (s.length !== e.revision || s[0].action !== "Uploaded" || s[0].actorId !== e.createdBy || s[0].at !== e.createdAt) throw Error("Invalid attachment audit history.");
			let l = e.createdAt, u = 0, d = !1, f = "", p = "";
			for (let [t, n] of s.entries()) {
				if (n.revision !== t + 1 || n.at < l || n.at > e.updatedAt) throw Error("Invalid attachment audit ordering.");
				if (l = n.at, t > 0 && n.action !== "Renamed" && n.after.title !== p) throw Error("Attachment title changed without a rename event.");
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
					if (d || n.action === "Uploaded" && t !== 0) throw Error("Invalid attachment version event.");
					let r = e.versions[u++];
					if (!r || r.id !== n.versionId || r.createdBy !== n.actorId || r.createdAt !== n.at || !!r.restoredFrom != (n.action === "Restored version")) throw Error("Attachment version differs from its audit.");
					f = r.id;
				} else if (n.action === "Trashed") {
					if (d) throw Error("Repeated attachment trash event.");
					d = !0;
				} else if (n.action === "Recovered") {
					if (!d) throw Error("Invalid attachment recovery event.");
					d = !1;
				} else if (d) throw Error("Deleted attachment cannot be renamed.");
				if (n.after.versionsCount !== u || n.after.currentVersionId !== f || n.after.deleted !== d) throw Error("Attachment audit outcome is inconsistent.");
			}
			let m = s.at(-1);
			if (u !== e.versions.length || m.actorId !== e.updatedBy || m.at !== e.updatedAt || JSON.stringify(m.after) !== JSON.stringify(t_(e))) throw Error("Attachment metadata differs from audit.");
			if (e.deletedAt && (e.deletedAt !== m.at || e.deletedBy !== m.actorId)) throw Error("Attachment deletion differs from audit.");
		}
		for (let e of r.history) {
			if (i.has(e.operationId) || !r.documents.some((t) => t.id === e.documentId)) throw Error("Invalid attachment operation identity.");
			i.add(e.operationId);
		}
		if (c > 5e7) throw Error("Attachment library exceeds 50 MB.");
	}
});
//#endregion
//#region src/features/job-costing/jobCostingService.ts
function __(e) {
	let t = Math.round(e * 100);
	if (!Number.isFinite(e) || !Number.isSafeInteger(t) || Math.abs(t / 100 - e) > 1e-7) throw Error("Amounts must be safe currency values with at most two decimals.");
	return t;
}
function v_(e, t) {
	return e.flatMap((n) => n.lines.flatMap((r, i) => {
		let a = t.find((e) => e.id === r.accountId);
		if (!a || !["REVENUE", "EXPENSE"].includes(a.type)) return [];
		let o = n, s = r;
		if (n.reversedJournalEntryId) {
			let t = e.find((e) => e.id === n.reversedJournalEntryId), a = t?.lines[i];
			if (!t || !a || a.accountId !== r.accountId || __(a.debit) !== __(r.credit) || __(a.credit) !== __(r.debit)) throw Error("Reversal line does not match its original source.");
			o = t, s = a;
		}
		let c = __(a.type === "REVENUE" ? r.credit - r.debit : r.debit - r.credit);
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
function y_(e, t, n, r, i, a) {
	if (w(i, "From date"), w(a, "To date"), i > a) throw Error("From date must not follow to date.");
	let o = v_(e, t).filter((e) => e.date >= i && e.date <= a), s = o.flatMap((e) => {
		let t = r.find((t) => t.journalId === e.rootJournalId && t.lineId === e.rootLineId), i = e.amount < 0 ? -1 : 1, a = __(e.capacity), o = (t?.splits ?? []).map((t) => {
			let r = __(t.amount);
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
		for (let r of s.filter((t) => t.jobId === e)) r.kind === "REVENUE" ? t += __(r.allocated) : n += __(r.allocated);
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
			let t = c(e.id), n = __(Math.round(Number(e.budget) * 100) / 100), r = __(Math.round(Number(e.costBudget) * 100) / 100);
			return {
				id: e.id,
				name: e.name,
				code: e.code,
				status: e.status,
				...t,
				budget: n / 100,
				costBudget: r / 100,
				budgetProfit: (n - r) / 100,
				revenueVariance: (__(t.revenue) - n) / 100,
				costVariance: (r - __(t.cost)) / 100,
				profitVariance: (__(t.profit) - n + r) / 100
			};
		}),
		unallocated: c(""),
		ledger: {
			revenue: o.filter((e) => e.kind === "REVENUE").reduce((e, t) => e + __(t.amount), 0) / 100,
			cost: o.filter((e) => e.kind === "EXPENSE").reduce((e, t) => e + __(t.amount), 0) / 100
		}
	};
}
//#endregion
//#region src/features/job-costing/jobCostingRepository.ts
var b_ = E().trim().min(1).max(200), x_ = E().trim().min(1).max(2e3), S_ = E().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), C_ = e({
	jobId: b_,
	amount: f().finite().positive().refine((e) => {
		try {
			return __(e), !0;
		} catch {
			return !1;
		}
	})
}).strict(), w_ = e({
	id: b_,
	journalId: b_,
	lineId: b_,
	revision: f().int().positive(),
	splits: s(C_).max(100),
	updatedAt: S_,
	updatedBy: b_
}).strict(), T_ = e({
	id: b_,
	operationId: b_,
	recordId: b_,
	revision: f().int().positive(),
	at: S_,
	actorId: b_,
	reason: x_,
	fingerprint: E().max(3e6),
	before: s(C_),
	after: s(C_)
}).strict(), E_ = e({
	operationId: b_,
	journalId: b_,
	lineId: b_,
	expectedRevision: f().int().nonnegative(),
	expectedSource: E().max(2e6),
	splits: s(C_).max(100),
	reason: x_
}).strict(), D_ = [], O_ = [], k_ = /* @__PURE__ */ new Set(), A_ = () => k_.forEach((e) => e());
function j_(e, t, n) {
	if (new Set(e.map((e) => e.jobId)).size !== e.length) throw Error("Use one split per project.");
	if (e.some((e) => !n.some((t) => t.id === e.jobId))) throw Error("Project was not found.");
	if (e.reduce((e, t) => e + __(t.amount), 0) > __(t)) throw Error("Project splits exceed the source amount.");
}
i("jobCosting", {
	repository: {
		subscribe(e) {
			return k_.add(e), () => {
				k_.delete(e);
			};
		},
		getSnapshot: () => D_,
		review() {
			return G.require("accounting.read"), {
				lines: v_(I.getAll(), F.getAll()),
				allocations: structuredClone(D_),
				history: structuredClone(O_)
			};
		},
		report(t) {
			G.require("accounting.read");
			let n = e({
				from: E(),
				to: E()
			}).strict().parse(t);
			return y_(I.getAll(), F.getAll(), x.jobs, D_, n.from, n.to);
		},
		save(e) {
			let t = G.require("accounting.post"), n = E_.parse(e), r = JSON.stringify(n), i = O_.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already has different allocation data.");
				return D_.find((e) => e.id === i.recordId);
			}
			let a = v_(I.getAll(), F.getAll()).find((e) => e.journalId === n.journalId && e.lineId === n.lineId);
			if (!a) throw Error("Select a posted revenue or expense line.");
			if (a.reversal) throw Error("Allocate the original line; reversal entries inherit its splits.");
			if (n.expectedSource !== a.signature) throw Error("Source journal changed. Refresh before allocating.");
			let o = D_.find((e) => e.journalId === a.journalId && e.lineId === a.lineId);
			if ((o?.revision ?? 0) !== n.expectedRevision) throw Error("Allocation changed. Refresh before saving.");
			j_(n.splits, a.capacity, x.jobs);
			for (let e of n.splits) if (x.jobs.find((t) => t.id === e.jobId).status !== "Active" && o?.splits.find((t) => t.jobId === e.jobId)?.amount !== e.amount) throw Error("Only active projects can receive new or changed allocations.");
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
			return D_ = [...D_.filter((e) => e.id !== c.id), c], O_ = [...O_, {
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
			}], A_(), c;
		}
	},
	read: "accounting.read",
	commands: {
		review: "accounting.read",
		report: "accounting.read",
		save: "accounting.post"
	},
	snapshot: () => ({
		allocations: D_,
		history: O_
	}),
	restore: (e) => {
		D_ = e.allocations, O_ = e.history;
	},
	publish: A_,
	validate: (t, n) => {
		let r = e({
			allocations: s(w_),
			history: s(T_)
		}).strict().parse(t), i = n.workspace_jobs.records, a = v_(n.journals.journalEntries, n.accounts.accounts), o = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set();
		for (let e of r.allocations) {
			let t = a.find((t) => t.journalId === e.journalId && t.lineId === e.lineId), n = e.journalId + ":" + e.lineId;
			if (!t || t.reversal || o.has(n)) throw Error("Invalid project source reference.");
			o.add(n), j_(e.splits, t.capacity, i);
			let s = r.history.filter((t) => t.recordId === e.id);
			if (s.length !== e.revision) throw Error("Invalid allocation history length.");
			let c = [], l = "";
			for (let [n, r] of s.entries()) {
				let a = E_.parse(JSON.parse(r.fingerprint));
				if (r.revision !== n + 1 || r.at < l || JSON.stringify(r.before) !== JSON.stringify(c) || a.journalId !== e.journalId || a.lineId !== e.lineId || a.operationId !== r.operationId || a.expectedRevision !== n || a.reason !== r.reason || JSON.stringify(a.splits) !== JSON.stringify(r.after)) throw Error("Invalid allocation history chain.");
				j_(r.after, t.capacity, i), c = r.after, l = r.at;
			}
			let u = s.at(-1);
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
var M_ = E().trim().min(1).max(200), N_ = E().trim().max(2e3), P_ = E().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), F_ = e({
	operationId: M_,
	kind: T(Am),
	customerId: E().max(200).default(""),
	values: Nm,
	source: T(jm).default("Manual"),
	externalId: E().trim().max(200).default(""),
	sourceReference: E().trim().max(500).default("")
}).strict(), I_ = e({
	id: M_,
	action: M_,
	actorId: M_,
	at: P_,
	reason: N_,
	data: E().max(2e6)
}).strict(), L_ = e({
	action: T([
		"Approve new",
		"Link existing",
		"Reject"
	]),
	actorId: M_,
	at: P_,
	reason: N_,
	fingerprint: E().max(1e4),
	customerId: E(),
	targetId: E(),
	snapshot: ye()
}).strict(), R_ = F_.extend({
	id: M_,
	state: T([
		"Pending",
		"Approved",
		"Linked",
		"Rejected"
	]),
	revision: f().int().positive(),
	createdBy: M_,
	createdAt: P_,
	updatedAt: P_,
	creationFingerprint: E().max(1e5),
	history: s(I_).min(1),
	decision: L_.optional()
}).strict(), z_ = [], B_ = /* @__PURE__ */ new Set(), V_ = () => B_.forEach((e) => e());
function H_() {
	let e = G.require("contacts.write");
	return G.require("sales.read"), e.userId;
}
var U_ = () => (/* @__PURE__ */ new Date()).toISOString();
function W_(e) {
	let t = U_();
	if (t < e.updatedAt) throw Error("System clock precedes the last review update. Correct it before continuing.");
	return t;
}
var G_ = (e, t, n, r = "", i = {}) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	reason: r,
	data: JSON.stringify(i)
});
function K_(e) {
	let t = z_.find((t) => t.id === e);
	if (!t) throw Error("Review draft not found.");
	return t;
}
function q_(e, t) {
	if (e.revision !== t) throw Error("Review draft changed. Reload before continuing.");
}
function J_(e) {
	return z_ = [...z_.filter((t) => t.id !== e.id), e], V_(), e;
}
function Y_(e) {
	let t = F_.parse(e);
	if (t.values = Pm(t.kind, t.values), t.kind === "Customer" && t.customerId) throw Error("Customer drafts must not have a parent customer.");
	if (t.customerId && !R.getById(t.customerId)) throw Error("Parent customer was not found.");
	return t;
}
function X_(e, t) {
	return e === "Customer" ? er.strict().parse(t) : e === "Branch" ? tr.strict().parse(t) : nr.strict().parse(t);
}
function Z_(e, t, n) {
	let r = R.getById(e === "Customer" ? n : t);
	if (!r) throw Error("Choose an existing customer.");
	let i = e === "Customer" ? r : e === "Branch" ? r.locations.find((e) => e.id === n) : r.contacts.find((e) => e.id === n);
	if (!i) throw Error("The selected record does not belong to this customer or draft type.");
	return {
		customerId: r.id,
		targetId: i.id,
		snapshot: structuredClone(i)
	};
}
var Q_ = {
	subscribe(e) {
		return B_.add(e), () => {
			B_.delete(e);
		};
	},
	getSnapshot: () => z_,
	create(e) {
		let t = H_(), n = Y_(e), { operationId: r, ...i } = n, a = JSON.stringify(i), o = z_.find((e) => e.operationId === r) || n.externalId && z_.find((e) => e.source === n.source && e.externalId === n.externalId);
		if (o) {
			if (o.creationFingerprint !== a) throw Error("Operation or external source ID already contains different draft data.");
			return o;
		}
		let s = U_();
		return J_({
			...n,
			id: crypto.randomUUID(),
			state: "Pending",
			revision: 1,
			createdBy: t,
			createdAt: s,
			updatedAt: s,
			creationFingerprint: a,
			history: [G_("Received", t, s, "", i)]
		});
	},
	importBatch(t) {
		H_();
		let n = e({
			operationId: M_.max(150),
			drafts: s(F_.omit({ operationId: !0 })).min(1).max(100)
		}).strict().parse(t);
		if (n.drafts.some((e) => !e.externalId)) throw Error("Each imported draft requires a source external ID for safe retry.");
		return n.drafts.map((e, t) => Q_.create({
			...e,
			operationId: n.operationId + ":" + t
		}));
	},
	update(t) {
		let n = H_(), r = e({
			id: M_,
			expectedRevision: f().int().positive(),
			customerId: E().max(200),
			values: Nm
		}).strict().parse(t), i = K_(r.id);
		if (q_(i, r.expectedRevision), i.state !== "Pending") throw Error("Only pending drafts can be edited.");
		let a = Y_({
			operationId: i.operationId,
			kind: i.kind,
			customerId: r.customerId,
			values: r.values,
			source: i.source,
			externalId: i.externalId,
			sourceReference: i.sourceReference
		}), o = W_(i);
		return J_({
			...i,
			customerId: a.customerId,
			values: a.values,
			revision: i.revision + 1,
			updatedAt: o,
			history: [...i.history, G_("Updated", n, o, "", {
				customerId: a.customerId,
				values: a.values
			})]
		});
	},
	review(e) {
		G.require("sales.read");
		let t = K_(M_.parse(e)), n = R.getAll(), r = "";
		try {
			if (X_(t.kind, t.values), t.kind !== "Customer" && !n.some((e) => e.id === t.customerId)) throw Error("Select the parent customer.");
		} catch (e) {
			r = e.message;
		}
		return {
			revision: t.revision,
			duplicates: zm(t, n),
			masterSignature: Bm(n),
			validationError: r
		};
	},
	decide(t) {
		let n = H_(), r = e({
			id: M_,
			expectedRevision: f().int().positive(),
			action: T([
				"Approve new",
				"Link existing",
				"Reject"
			]),
			reason: N_,
			allowDuplicate: y().default(!1),
			targetId: E().max(200).default(""),
			expectedMaster: E().max(25e6).optional()
		}).strict().parse(t), i = K_(r.id), a = JSON.stringify({
			action: r.action,
			reason: r.reason,
			allowDuplicate: r.allowDuplicate,
			targetId: r.targetId
		});
		if (i.state !== "Pending") {
			if (i.decision?.fingerprint === a) return i;
			throw Error("This draft already has a different decision.");
		}
		q_(i, r.expectedRevision);
		let o = W_(i), s = {
			customerId: "",
			targetId: "",
			snapshot: null
		};
		if (r.action === "Reject") {
			if (!r.reason) throw Error("Explain why the draft is rejected.");
		} else {
			let e = R.getAll();
			if (r.expectedMaster !== Bm(e)) throw Error("Customer records changed. Refresh duplicate review before deciding.");
			if (r.action === "Link existing") {
				if (!r.reason) throw Error("Explain why this existing record is the correct match.");
				s = Z_(i.kind, i.customerId, r.targetId);
			} else {
				if (zm(i, e).length && (!r.allowDuplicate || !r.reason)) throw Error("Possible duplicates exist. Link an existing record or explicitly confirm a separate new record with a reason.");
				let t = X_(i.kind, i.values);
				if (i.kind === "Customer") {
					let e = R.create(t);
					s = {
						customerId: e.id,
						targetId: e.id,
						snapshot: structuredClone(e)
					};
				} else {
					let e = R.getById(i.customerId);
					if (!e || e.status === "INACTIVE") throw Error("Select an available parent customer.");
					let n = i.kind === "Branch" ? R.addLocation(e.id, t) : R.addContact(e.id, t);
					s = {
						customerId: e.id,
						targetId: n.id,
						snapshot: structuredClone(n)
					};
				}
			}
		}
		let c = {
			action: r.action,
			actorId: n,
			at: o,
			reason: r.reason,
			fingerprint: a,
			...s
		};
		return J_({
			...i,
			state: r.action === "Reject" ? "Rejected" : r.action === "Link existing" ? "Linked" : "Approved",
			revision: i.revision + 1,
			updatedAt: o,
			decision: c,
			history: [...i.history, G_(r.action, n, o, r.reason, c)]
		});
	},
	reopen(t) {
		let n = H_(), r = e({
			id: M_,
			expectedRevision: f().int().positive(),
			reason: N_.refine(Boolean, "Explain why this draft is reopened.")
		}).strict().parse(t), i = K_(r.id);
		if (q_(i, r.expectedRevision), i.state !== "Rejected") throw Error("Only rejected drafts may be reopened.");
		let a = W_(i), o = {
			...i,
			state: "Pending",
			revision: i.revision + 1,
			updatedAt: a,
			history: [...i.history, G_("Reopened", n, a, r.reason)]
		};
		return delete o.decision, J_(o);
	}
};
i("contactReviews", {
	repository: Q_,
	read: "sales.read",
	commands: {
		create: "contacts.write",
		update: "contacts.write",
		importBatch: "contacts.write",
		review: "sales.read",
		decide: "contacts.write",
		reopen: "contacts.write"
	},
	snapshot: () => ({ drafts: z_ }),
	restore: (e) => {
		z_ = e.drafts;
	},
	publish: V_,
	validate: (t, n) => {
		let r = e({ drafts: s(R_) }).strict().parse(t), i = n.customers.customers, a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
		for (let t of r.drafts) {
			let n = Pm(t.kind, t.values);
			if (Object.keys(n).length !== Object.keys(t.values).length) throw Error("Missing review draft fields.");
			if (a.has(t.operationId) || t.externalId && o.has(t.source + ":" + t.externalId)) throw Error("Duplicate review intake identity.");
			a.add(t.operationId), t.externalId && o.add(t.source + ":" + t.externalId);
			let r = JSON.parse(t.creationFingerprint);
			if (t.history[0].data !== t.creationFingerprint) throw Error("Review source history is inconsistent.");
			if (r.kind !== t.kind || r.source !== t.source || r.externalId !== t.externalId || r.sourceReference !== t.sourceReference) throw Error("Review intake provenance is inconsistent.");
			if (t.history.length !== t.revision || new Set(t.history.map((e) => e.id)).size !== t.history.length || t.history[0].action !== "Received" || t.history[0].actorId !== t.createdBy || t.history[0].at !== t.createdAt || t.updatedAt < t.createdAt) throw Error("Invalid review history.");
			let s = "Pending", c = t.createdAt;
			for (let [e, n] of t.history.entries()) {
				if (n.at < c || n.at > t.updatedAt) throw Error("Invalid review event time.");
				c = n.at;
				let r = JSON.parse(n.data);
				if (!r || typeof r != "object" || Array.isArray(r)) throw Error("Invalid review event payload.");
				if (e !== 0) {
					if (n.action === "Updated") {
						if (s !== "Pending") throw Error("Invalid review edit history.");
					} else if (n.action === "Reopened") {
						if (s !== "Rejected" || !n.reason) throw Error("Invalid review reopen history.");
						s = "Pending";
					} else if ([
						"Approve new",
						"Link existing",
						"Reject"
					].includes(n.action)) {
						if (s !== "Pending") throw Error("Invalid repeated review decision.");
						s = n.action === "Reject" ? "Rejected" : n.action === "Link existing" ? "Linked" : "Approved";
					} else throw Error("Unknown review history action.");
				}
			}
			if (s !== t.state || t.history.at(-1).at !== t.updatedAt) throw Error("Review history does not match current state.");
			if (t.kind === "Customer" && t.customerId || t.customerId && !i.some((e) => e.id === t.customerId)) throw Error("Review parent customer is invalid.");
			if (t.state === "Pending" != !t.decision) throw Error("Review state and decision are inconsistent.");
			if (t.decision) {
				let n = t.state === "Rejected" ? "Reject" : t.state === "Linked" ? "Link existing" : "Approve new", r = e({
					action: T([
						"Approve new",
						"Link existing",
						"Reject"
					]),
					reason: N_,
					allowDuplicate: y(),
					targetId: E()
				}).strict().parse(JSON.parse(t.decision.fingerprint)), a = t.history.at(-1);
				if (r.action !== n || r.reason !== t.decision.reason || r.targetId !== (n === "Link existing" ? t.decision.targetId : "") || a.actorId !== t.decision.actorId || a.at !== t.decision.at || a.reason !== t.decision.reason || JSON.stringify(JSON.parse(a.data)) !== JSON.stringify(t.decision)) throw Error("Review decision audit is inconsistent.");
				if (t.decision.action !== n) throw Error("Invalid review decision.");
				if (n !== "Reject") {
					let e = i.find((e) => e.id === t.decision.customerId), r = t.kind === "Customer" ? e : t.kind === "Branch" ? e?.locations.find((e) => e.id === t.decision.targetId) : e?.contacts.find((e) => e.id === t.decision.targetId);
					if (!r || r.id !== t.decision.targetId || t.kind !== "Customer" && e.id !== t.customerId || t.decision.snapshot?.id !== r.id) throw Error("Invalid resolved review reference.");
					n === "Approve new" && X_(t.kind, t.values);
				} else if (!t.decision.reason || t.decision.customerId || t.decision.targetId) throw Error("Invalid rejection.");
			}
		}
	}
});
//#endregion
//#region src/features/accounting/data/profitAndLossService.ts
function $_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ev(e, t) {
	w(e, t);
}
function tv(e, t, n, r) {
	if (ev(n, "From date"), ev(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = t.filter((e) => e.journalDate >= n && e.journalDate <= r), a = nv(e.filter((e) => e.type === "REVENUE"), i, "REVENUE"), o = nv(e.filter((e) => e.type === "EXPENSE"), i, "EXPENSE"), s = $_(a.reduce((e, t) => e + t.amount, 0)), c = $_(o.reduce((e, t) => e + t.amount, 0)), l = e.find((e) => e.systemRole === "SALES_REVENUE");
	if (!l) throw Error("Sales Revenue system account was not found.");
	if (l.type !== "REVENUE") throw Error("Sales Revenue system account must be a revenue account.");
	let u = e.find((e) => e.systemRole === "COST_OF_GOODS_SOLD");
	if (!u) throw Error("Cost of Goods Sold system account was not found.");
	if (u.type !== "EXPENSE") throw Error("Cost of Goods Sold system account must be an expense account.");
	let d = $_(a.find((e) => e.accountId === l.id)?.amount ?? 0), f = $_(o.find((e) => e.accountId === u.id)?.amount ?? 0), p = $_(d - f);
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
		operatingExpenses: $_(c - f),
		totalExpenses: c,
		netProfit: $_(s - c)
	};
}
function nv(e, t, n) {
	return e.map((e) => {
		let r = 0, i = 0;
		for (let n of t) for (let t of n.lines) t.accountId === e.id && (r = $_(r + t.debit), i = $_(i + t.credit));
		let a = $_(n === "REVENUE" ? i - r : r - i);
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
function rv(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function iv(e) {
	w(e);
}
function av(e, t) {
	let n = 0, r = 0;
	for (let i of t) for (let t of i.lines) t.accountId === e.id && (n = rv(n + t.debit), r = rv(r + t.credit));
	return e.type === "ASSET" || e.type === "EXPENSE" ? rv(n - r) : rv(r - n);
}
function ov(e, t, n) {
	return e.filter((e) => e.type === n).map((e) => ({
		accountId: e.id,
		accountCode: e.code,
		accountName: e.name,
		amount: av(e, t)
	})).filter((e) => e.amount !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 }));
}
function sv(e) {
	return rv(e.reduce((e, t) => e + t.amount, 0));
}
function cv(e, t, n) {
	iv(n);
	let r = t.filter((e) => e.journalDate <= n), i = ov(e, r, "ASSET"), a = ov(e, r, "LIABILITY"), o = ov(e, r, "EQUITY"), s = e.filter((e) => e.type === "REVENUE"), c = e.filter((e) => e.type === "EXPENSE"), l = rv(s.reduce((e, t) => e + av(t, r), 0)), u = rv(c.reduce((e, t) => e + av(t, r), 0)), d = sv(i), f = sv(a), p = sv(o), m = rv(l - u), h = rv(p + m), g = rv(f + h), _ = rv(d - g);
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
function lv(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function uv(e, t) {
	w(e, t);
}
function dv(e, t) {
	let n = lv(e - t);
	return n >= 0 ? {
		debit: n,
		credit: 0
	} : {
		debit: 0,
		credit: lv(Math.abs(n))
	};
}
function fv(e, t, n, r) {
	if (uv(n, "From date"), uv(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = e.map((e) => {
		let i = 0, a = 0, o = 0, s = 0;
		for (let c of t) for (let t of c.lines) if (t.accountId === e.id) {
			if (c.journalDate < n) {
				i = lv(i + t.debit), a = lv(a + t.credit);
				continue;
			}
			c.journalDate <= r && (o = lv(o + t.debit), s = lv(s + t.credit));
		}
		let c = dv(i, a), l = dv(lv(i + o), lv(a + s));
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
	}).filter((e) => e.openingDebit !== 0 || e.openingCredit !== 0 || e.periodDebit !== 0 || e.periodCredit !== 0 || e.closingDebit !== 0 || e.closingCredit !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 })), a = lv(i.reduce((e, t) => e + t.openingDebit, 0)), o = lv(i.reduce((e, t) => e + t.openingCredit, 0)), s = lv(i.reduce((e, t) => e + t.periodDebit, 0)), c = lv(i.reduce((e, t) => e + t.periodCredit, 0)), l = lv(i.reduce((e, t) => e + t.closingDebit, 0)), u = lv(i.reduce((e, t) => e + t.closingCredit, 0)), d = lv(l - u);
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
var pv = [
	"Customer receipts & reversals",
	"Customer refunds & reversals",
	"Supplier payments & reversals",
	"Supplier refunds & reversals",
	"Bank opening adjustments",
	"Transfers across selection",
	"Other bank movements / review"
], mv = (e) => Math.round(e * 100), hv = (e) => e / 100;
function gv(e) {
	switch (e.sourceType) {
		case "CUSTOMER_DEPOSIT":
		case "CUSTOMER_PAYMENT":
		case "CUSTOMER_PAYMENT_REVERSAL": return pv[0];
		case "CUSTOMER_DEPOSIT_REFUND":
		case "CUSTOMER_REFUND": return pv[1];
		case "SUPPLIER_PREPAYMENT":
		case "SUPPLIER_PAYMENT":
		case "SUPPLIER_PAYMENT_REVERSAL": return pv[2];
		case "SUPPLIER_PREPAYMENT_REFUND":
		case "SUPPLIER_REFUND": return pv[3];
		case "OPENING_BALANCE": return pv[4];
		case "BANK_TRANSFER": return pv[5];
		default: return pv[6];
	}
}
function _v(e) {
	if (w(e.from, "From date"), w(e.to, "To date"), e.from > e.to) throw Error("From date must not exceed To date.");
	if (!e.currency.trim()) throw Error("Select a currency.");
	let t = new Map(e.bankAccounts.map((e) => [e.id, e]));
	if (t.size !== e.bankAccounts.length) throw Error("Duplicate bank account IDs require review.");
	if (e.bankIds && (new Set(e.bankIds).size !== e.bankIds.length || e.bankIds.some((e) => !t.has(e)))) throw Error("Invalid bank account selection.");
	let n = e.bankAccounts.filter((t) => (!e.bankIds || e.bankIds.includes(t.id)) && t.currency === e.currency);
	if (e.bankIds?.some((n) => t.get(n).currency !== e.currency)) throw Error("Selected banks must use the report currency.");
	for (let t of n) {
		if (e.bankAccounts.filter((e) => e.glAccountId === t.glAccountId).length !== 1) throw Error("Duplicate bank GL mappings require review before reporting.");
		w(t.openingBalanceDate, "Bank opening date");
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
		let n = Be(t, e.journalEntries, e.to), o = t.openingBalanceDate < e.from ? mv(t.openingBalance) : 0, s = 0, c = 0;
		if (t.openingBalanceDate >= e.from && t.openingBalance !== 0) {
			let e = mv(t.openingBalance);
			a.push({
				id: `setup:${t.id}`,
				bankId: t.id,
				bankName: t.name,
				date: t.openingBalanceDate,
				description: "Bank setup opening balance (not a cash receipt)",
				sourceType: "BANK_SETUP",
				category: pv[4],
				moneyIn: hv(Math.max(e, 0)),
				moneyOut: hv(Math.max(-e, 0))
			}), s += Math.max(e, 0), c += Math.max(-e, 0);
		}
		let l = n.transactions.filter((t) => t.correctionOnly && t.transactionDate >= e.from).length;
		l && i.push(`${t.name}: ${l} internal correction lines remain visible in the bank register and are excluded from cash movement totals.`), n.transactions.some((e) => e.correctionIssue) && i.push(`${t.name}: bank journal or categorisation correction evidence requires review. Its ledger movements remain included; no historical amount or date is silently changed.`);
		for (let i of n.transactions) {
			if (i.correctionOnly) continue;
			if (i.transactionDate < e.from) {
				o += mv(i.moneyIn) - mv(i.moneyOut);
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
				category: gv(n),
				moneyIn: i.moneyIn,
				moneyOut: i.moneyOut
			}), s += mv(i.moneyIn), c += mv(i.moneyOut);
		}
		let u = mv(n.closingBalance);
		return {
			bankId: t.id,
			name: t.name,
			active: t.active,
			opening: hv(o),
			moneyIn: hv(s),
			moneyOut: hv(c),
			closing: hv(u),
			difference: hv(o + s - c - u)
		};
	}), s = new Map(pv.map((e) => [e, {
		category: e,
		moneyIn: 0,
		moneyOut: 0,
		net: 0
	}])), c = /* @__PURE__ */ new Map();
	for (let e of a) {
		if (e.category === pv[5]) {
			let t = e.journalId;
			c.set(t, (c.get(t) ?? 0) + mv(e.moneyIn) - mv(e.moneyOut));
			continue;
		}
		let t = s.get(e.category);
		t.moneyIn += mv(e.moneyIn), t.moneyOut += mv(e.moneyOut);
	}
	for (let e of c.values()) {
		let t = s.get(pv[5]);
		t.moneyIn += Math.max(e, 0), t.moneyOut += Math.max(-e, 0);
	}
	let l = [...s.values()].map((e) => ({
		category: e.category,
		moneyIn: hv(e.moneyIn),
		moneyOut: hv(e.moneyOut),
		net: hv(e.moneyIn - e.moneyOut)
	})), u = (e) => hv(o.reduce((t, n) => t + mv(n[e]), 0)), d = u("opening"), f = u("closing"), p = hv(l.reduce((e, t) => e + mv(t.net), 0)), m = a.filter((e) => e.category === pv[6]).length;
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
		difference: hv(mv(d) + mv(p) - mv(f))
	};
}
//#endregion
//#region src/features/net-analysis/netAnalysisService.ts
var vv = (e) => Math.round(e * 100);
function yv(e) {
	for (let t of [
		e.subtotal,
		e.tax,
		e.total
	]) if (!Number.isFinite(t) || t < 0 || Math.abs(t * 100 - vv(t)) > 1e-6) throw Error(`${e.number}: invalid saved monetary totals.`);
	if (vv(e.subtotal) + vv(e.tax) !== vv(e.total)) throw Error(`${e.number}: saved net, tax and gross do not reconcile.`);
}
function bv(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) {
		if (r.status === "DRAFT" || r.openingBalanceImportId) continue;
		let e = `${r.kind}:${r.id}`;
		if (t.has(e)) throw Error(`Duplicate analysis source: ${r.number}.`);
		t.add(e), w(r.date, `Document date (${r.number})`), yv(r);
		let i = r.kind === "CUSTOMER_CREDIT" || r.kind === "SUPPLIER_CREDIT", a = i ? -1 : 1, { voidedAt: o, openingBalanceImportId: s, ...c } = r, l = (t, n, i) => ({
			...c,
			date: t,
			eventId: `${e}:${i}`,
			event: i,
			subtotal: vv(r.subtotal) * n / 100,
			tax: vv(r.tax) * n / 100,
			total: vv(r.total) * n / 100
		});
		if (n.push(l(r.date, a, i ? "CREDIT" : "DOCUMENT")), r.status === "VOID") {
			if (!r.voidedAt) throw Error(`${r.number}: void date is missing. Review the source record before reporting.`);
			let e = ve(r.voidedAt);
			if (w(e, `Void date (${r.number})`), e < r.date) throw Error(`${r.number}: void date precedes the original document.`);
			n.push(l(e, -a, "VOID"));
		}
	}
	return n.sort((e, t) => e.date.localeCompare(t.date) || e.number.localeCompare(t.number) || e.eventId.localeCompare(t.eventId));
}
function xv(e, t) {
	if (w(t.from, "From date"), w(t.to, "To date"), t.from > t.to) throw Error("From date must not exceed To date.");
	let n = t.query?.trim().toLowerCase() ?? "", r = bv(e).filter((e) => e.date >= t.from && e.date <= t.to && (!t.partyId || e.partyId === t.partyId) && (!t.event || t.event === "ALL" || e.event === t.event) && `${e.number} ${e.partyName} ${e.partyId} ${e.kind}`.toLowerCase().includes(n)), i = (e, t) => e.reduce((e, n) => e + vv(n[t]), 0) / 100, a = {
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
function Sv(e, t, n) {
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
function Cv(e, t) {
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
var wv = [
	"Profit & loss",
	"Balance sheet",
	"Trial balance",
	"Cash flow",
	"Net sales",
	"Net purchases"
];
function Tv(e) {
	let t = e.split(",").map((e) => e.trim());
	if (!t.length || t.length > wv.length || t.some((e) => !e)) throw Error("Select one to six supported reports.");
	let n = t.map((e) => wv.find((t) => t.toLowerCase() === e.toLowerCase()));
	if (n.some((e) => !e)) throw Error(`Supported reports: ${wv.join(", ")}.`);
	if (new Set(n).size !== n.length) throw Error("Each report may appear only once in a pack.");
	return n;
}
var Ev = (e) => JSON.stringify(e);
function Dv(e, t, n) {
	if (w(e.periodStart, "From date"), w(e.periodEnd, "To date"), e.periodStart > e.periodEnd) throw Error("From date must not exceed To date.");
	let r = Tv(e.reports), i = e.periodStart, a = e.periodEnd, o = r.map((e) => {
		if (e === "Profit & loss") {
			let n = tv(t.accounts, t.journals, i, a);
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
			let n = cv(t.accounts, t.journals, a);
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
			let n = fv(t.accounts, t.journals, i, a);
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
			let n = _v({
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
		let n = e === "Net purchases", r = xv(n ? Cv(t.bills, t.supplierCredits) : Sv(t.documents, t.customerCredits, t.customers), {
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
		sourceSignature: Ev(t),
		sections: o
	});
}
//#endregion
//#region src/features/report-packs/reportPackCommand.ts
function Ov() {
	let e = C();
	return {
		accounts: F.getAll(),
		journals: I.getAll(),
		banks: L.getAll(),
		documents: B.getAll(),
		customerCredits: z.getAll(),
		customers: R.getAll().map((e) => ({
			id: e.id,
			businessName: e.businessName
		})),
		bills: ss.getAll(),
		supplierCredits: W.getAll(),
		company: {
			name: e.companyName,
			currency: e.currency,
			timezone: e.timezone
		}
	};
}
function kv(t) {
	let n = G.require("accounting.read"), r = e({
		id: E().trim().min(1).max(200),
		expectedRevision: E().regex(/^\d+$/)
	}).strict().parse(t), i = x["report-packs"]?.find((e) => e.id === r.id);
	if (!i) throw Error("Report pack configuration was not found.");
	if (i.revision !== r.expectedRevision) throw Error("Report pack changed. Reload before generating.");
	if (i.status !== "Active") throw Error("Activate this report pack before generating.");
	return Dv({
		id: i.id,
		revision: i.revision,
		name: i.name,
		cover: i.cover,
		introduction: i.introduction,
		periodStart: i.periodStart,
		periodEnd: i.periodEnd,
		reports: i.reports
	}, Ov(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: n.userId
	});
}
//#endregion
//#region src/features/saved-reports/savedReportService.ts
var Av = [
	"Sales",
	"Purchases",
	"Banking",
	"General ledger"
], jv = (e, t, n = !1) => ({
	key: e,
	label: t,
	numeric: n
}), Mv = [
	jv("date", "Date"),
	jv("number", "Document"),
	jv("contact", "Contact"),
	jv("partyId", "Contact ID"),
	jv("activity", "Activity"),
	jv("status", "Current status"),
	jv("net", "Net", !0),
	jv("tax", "Tax", !0),
	jv("gross", "Gross", !0)
], Nv = {
	Sales: Mv,
	Purchases: Mv,
	Banking: [
		jv("date", "Date"),
		jv("bank", "Bank"),
		jv("journal", "Journal"),
		jv("description", "Description"),
		jv("source", "Source"),
		jv("category", "Activity"),
		jv("moneyIn", "Money in", !0),
		jv("moneyOut", "Money out", !0),
		jv("net", "Net", !0)
	],
	"General ledger": [
		jv("date", "Date"),
		jv("journal", "Journal"),
		jv("accountCode", "Account code"),
		jv("account", "Account"),
		jv("description", "Description"),
		jv("source", "Source"),
		jv("status", "Current status"),
		jv("debit", "Debit", !0),
		jv("credit", "Credit", !0)
	]
}, Pv = (e) => e === "Banking" ? "Cash" : "Accrual", Fv = e({
	from: E(),
	to: E(),
	query: E().max(500).default(""),
	partyId: E().max(200).optional(),
	bankId: E().max(200).optional(),
	accountId: E().max(200).optional(),
	currency: E().min(1).max(10).optional()
}).strict();
function Iv(e) {
	let t = T(Av).parse(e.dataset);
	if (e.basis !== Pv(t)) throw Error(`${t} uses ${Pv(t)} basis. Cash-basis sales/purchase recognition is not available.`);
	if (e.favourite !== void 0 && !["Yes", "No"].includes(e.favourite)) throw Error("Favourite must be Yes or No.");
	let n;
	try {
		n = JSON.parse(e.filter ?? "");
	} catch {
		throw Error("Legacy filter text is not executable. Edit and save explicit report dates and filters.");
	}
	let r = Fv.parse(n);
	if (w(r.from, "From date"), w(r.to, "To date"), r.from > r.to) throw Error("From date must not exceed To date.");
	if (t !== "Sales" && t !== "Purchases" && r.partyId) throw Error("Contact filters require Sales or Purchases.");
	if (t !== "Banking" && (r.bankId || r.currency)) throw Error("Bank and currency filters require Banking.");
	if (t !== "General ledger" && r.accountId) throw Error("Account filters require General ledger.");
	let i = e.columns.split(",").map((e) => e.trim()), a = t === "Sales" || t === "Purchases" ? {
		customer: "contact",
		supplier: "contact",
		gst: "tax",
		total: "gross"
	} : {}, o = i.map((e) => Nv[t].find((t) => t.label.toLowerCase() === e.toLowerCase() || t.key.toLowerCase() === (a[e.toLowerCase()] ?? e.toLowerCase())));
	if (!i.length || i.length > Nv[t].length || o.some((e) => !e) || new Set(o.map((e) => e?.key)).size !== o.length) throw Error(`Select distinct supported columns for ${t}: ${Nv[t].map((e) => e.label).join(", ")}.`);
	return {
		dataset: t,
		filters: r,
		columns: o
	};
}
var Lv = (e, t) => e.reduce((e, n) => {
	let r = Number(n.values[t]), i = e + Math.round(r * 100);
	if (!Number.isFinite(r) || !Number.isSafeInteger(i)) throw Error("Report monetary total exceeds supported cents precision.");
	return i;
}, 0) / 100;
function Rv(e, t, n) {
	let { dataset: r, filters: i, columns: a } = Iv(e), o = i.query.trim().toLowerCase(), s = [], c = [], l = [], u = t.company.currency;
	if (r === "Sales" || r === "Purchases") {
		let e = r === "Sales" ? Sv(t.documents, t.customerCredits, t.customers) : Cv(t.bills, t.supplierCredits);
		if (i.partyId && !e.some((e) => e.partyId === i.partyId) && !(r === "Sales" && t.customers.some((e) => e.id === i.partyId))) throw Error("Selected contact is not available in this dataset.");
		let n = {
			DOCUMENT: "Original document",
			CREDIT: "Credit note",
			VOID: "Void reversal"
		};
		s = bv(e).filter((e) => e.date >= i.from && e.date <= i.to && (!i.partyId || e.partyId === i.partyId)).map((e) => ({
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
		let e = _v({
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
		value: Lv(s, t)
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
		sourceSignature: Ev(t),
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
function zv(t) {
	let n = G.require("accounting.read"), r = e({
		id: E().trim().min(1).max(200),
		expectedRevision: E().regex(/^\d+$/)
	}).strict().parse(t), i = x["custom-reports"]?.find((e) => e.id === r.id);
	if (!i) throw Error("Saved report was not found.");
	if (i.revision !== r.expectedRevision) throw Error("Saved report changed. Reload before running.");
	if (i.status !== "Active") throw Error("Activate this saved report before running.");
	return Rv({
		id: i.id,
		revision: i.revision,
		name: i.name,
		dataset: i.dataset,
		columns: i.columns,
		basis: i.basis,
		filter: i.filter,
		favourite: i.favourite
	}, Ov(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: n.userId
	});
}
//#endregion
//#region src/features/business-workspace/workspaceRepository.ts
var Bv = se(E(), E().max(2e4)), Vv = [
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
], Hv = () => (/* @__PURE__ */ new Date()).toISOString(), Uv = {
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
			"enabled",
			"conditions",
			"match",
			"priority",
			"automatic",
			"bankAccountId"
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
}, Wv = /* @__PURE__ */ new Set(), Gv = 0, Kv = () => {
	Gv++, Wv.forEach((e) => e());
}, qv = Object.fromEntries(Object.keys(Uv).map((e) => [e, []]));
for (let e of Object.keys(Uv)) x[e] = [];
var Jv = () => ({
	collected: F.getAll().find((e) => e.systemRole === "GST_PAYABLE")?.id ?? "",
	paid: F.getAll().find((e) => e.systemRole === "GST_RECEIVABLE")?.id ?? ""
});
x["tax-codes"] = [{
	id: "tax-gst",
	name: "GST",
	status: "Active",
	revision: "1",
	createdAt: Hv(),
	updatedAt: Hv(),
	code: "GST",
	rate: "10",
	basis: "Exclusive",
	report: "GST",
	...Jv()
}, {
	id: "tax-zero",
	name: "Zero rated",
	status: "Active",
	revision: "1",
	createdAt: Hv(),
	updatedAt: Hv(),
	code: "ZERO",
	rate: "0",
	basis: "Exclusive",
	report: "Zero rated",
	...Jv()
}];
function Yv(e, t) {
	if (!e?.trim()) throw Error(`${t} is required.`);
}
function Xv(e, t) {
	if (!e?.trim() || !Number.isFinite(Number(e)) || Number(e) < 0) throw Error(`${t} must be a non-negative number.`);
}
function Zv(e, t) {
	let n = F.getAll().find((t) => t.id === e);
	if (!n?.active || t && n.type !== t) throw Error("Select an active account of the correct type.");
	return n;
}
function Qv(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && (/* @__PURE__ */ new Date(e + "T00:00:00Z")).toISOString().slice(0, 10) === e;
}
function $v(e, n, r, i = !0) {
	let a = Uv[e];
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
	Yv(n.name, "Name");
	for (let e of a.required) Yv(n[e], e);
	if (![
		"Active",
		"Inactive",
		"Open",
		"In progress",
		"Completed"
	].includes(n.status ?? "Active")) throw Error("Invalid business status.");
	if (e === "tax-codes") {
		if (Xv(n.rate, "Tax rate"), n.basis && !["Exclusive", "Inclusive"].includes(n.basis)) throw Error("Invalid entry basis.");
		if (i) {
			let e = r.find((e) => e.id === n.id), i = t(), a = x.settings?.find((e) => e.section === "business" && e.status === "Active")?.gstCode ?? "GST";
			if (n.status === "Inactive" && n.code === a) throw Error("The default tax code must remain active. Change the business default first.");
			if (e && e.code !== n.code && (e.code === a || i.products.products.some((t) => (t.taxCode ?? "GST") === e.code) || (x["bank-rules"] ?? []).some((t) => t.taxCode === e.code) || (i.bankRuleApplications?.receipts ?? []).some((t) => t.decision.taxCode === e.code))) throw Error("A referenced tax code cannot be renamed. Create a new code and update future-use references.");
		}
		if (Number(n.rate) > 100) throw Error("Tax rate cannot exceed 100%.");
		if (i) {
			let e = Zv(n.collected, "LIABILITY"), r = Zv(n.paid, "ASSET"), i = (t().bankAccounts?.bankAccounts ?? []).map((e) => e.glAccountId);
			if (e.systemRole && e.systemRole !== "GST_PAYABLE" || r.systemRole && r.systemRole !== "GST_RECEIVABLE" || i.includes(r.id)) throw Error("Tax mappings cannot use AR/AP, inventory, GRNI or bank control accounts.");
		}
		if (r.some((e) => e.id !== n.id && e.code.toLowerCase() === n.code.toLowerCase())) throw Error("Tax code must be unique.");
		if (!/^[A-Z0-9_-]{1,24}$/.test(n.code)) throw Error("Use uppercase letters/numbers for a tax code.");
	}
	if (e === "linked-accounts" && i) {
		let e = F.requireBySystemRole(n.role), r = n.status === "Inactive" ? F.getAll().find((e) => e.systemRole === n.role)?.id : n.accountId, i = t().journals?.journalEntries ?? [];
		if (r !== e.id && i.some((t) => t.lines.some((t) => t.accountId === e.id || t.accountId === r))) throw Error("A used posting account cannot be remapped without a ledger migration.");
	}
	if (e === "linked-accounts") {
		if (!Vv.includes(n.role)) throw Error("Unknown account role.");
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
		if (i && Zv(n.accountId, e), r.some((e) => e.id !== n.id && e.role === n.role)) throw Error("A linked account role may only have one mapping.");
	}
	if (e === "promotions") {
		let e = Gn(n.productId);
		if (i && (!e || !Kn(e.id, n.unitId))) throw Error("Product/unit not found.");
		if (Xv(n.price, "Price"), !Number.isInteger(Number(n.priority))) throw Error("Priority must be an integer.");
		if (![
			"Customer price first",
			"Promotion first",
			"Lowest eligible price"
		].includes(n.policy)) throw Error("Invalid price conflict policy.");
		if (!/([+-]\d\d:\d\d|Z)$/.test(n.starts) || !Number.isFinite(Date.parse(n.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(n.ends) || !Number.isFinite(Date.parse(n.ends)) || Date.parse(n.ends) <= Date.parse(n.starts)) throw Error("Promotion requires explicit time offsets and an end after start.");
	}
	if (i && n.customerId && !R.getById(n.customerId)) throw Error("Customer was not found.");
	if (e === "jobs") {
		if (Xv(n.budget, "Revenue budget"), Xv(n.costBudget, "Cost budget"), i) for (let e of ["budget", "costBudget"]) {
			let t = Number(n[e]);
			if (!Number.isSafeInteger(Math.round(t * 100)) || Math.abs(Math.round(t * 100) / 100 - t) > 1e-7) throw Error("Project budgets require safe currency amounts with at most two decimals.");
		}
		if (!Qv(n.starts) || !Qv(n.ends) || n.ends < n.starts) throw Error("Invalid project dates.");
		if (r.some((e) => e.id !== n.id && e.code.toLowerCase() === n.code.toLowerCase())) throw Error("Job code must be unique.");
	}
	if (e === "tasks") {
		if (i && n.id && (t().salesVisits?.visits ?? []).some((e) => e.followupTaskId === n.id && e.customerId !== n.customerId)) throw Error("A visit follow-up must retain the visit customer.");
		if (i && ![
			"Open",
			"In progress",
			"Completed"
		].includes(n.status ?? "Open")) throw Error("Task status must be Open, In progress or Completed.");
		if (!Qv(n.due) || ![
			"Low",
			"Normal",
			"High"
		].includes(n.priority)) throw Error("Invalid due date or priority.");
	}
	if (e === "bank-rules") {
		if (i && Zv(n.accountId), Me(n), i && n.bankAccountId && n.bankAccountId !== "ALL" && !t().bankAccounts.bankAccounts.some((e) => e.id === n.bankAccountId)) throw Error("Bank rule scope account was not found.");
		if (i && !x["tax-codes"].some((e) => e.status === "Active" && e.code === n.taxCode)) throw Error("Active tax code not found.");
	}
	if (e === "custom-reports" && i && Iv({
		dataset: n.dataset,
		columns: n.columns,
		basis: n.basis,
		filter: n.filter,
		favourite: n.favourite
	}), e === "report-packs" && i && Tv(n.reports), e === "report-packs" && (!Qv(n.periodStart) || !Qv(n.periodEnd) || n.periodEnd < n.periodStart)) throw Error("Invalid report period.");
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
			]) Yv(n[e], e);
			if (n.status !== "Active") throw Error("Business settings must remain active.");
			if (!["Exclusive", "Inclusive"].includes(n.basis)) throw Error("Invalid price basis.");
			if (!/^\d+$/.test(n.terms) || Number(n.terms) > 365) throw Error("Payment terms must be 0–365 days.");
			if (!/^\d{2}-\d{2}$/.test(n.yearEnd) || !Qv("2001-" + n.yearEnd)) throw Error("Year end must be MM-DD.");
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
				if (!x["tax-codes"].some((e) => e.code === n.gstCode && e.status === "Active")) throw Error("Default tax code must be active.");
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
function ey(e, t, n) {
	qv[e].push({
		id: crypto.randomUUID(),
		name: n,
		status: "Active",
		revision: "1",
		createdAt: Hv(),
		updatedAt: Hv(),
		recordId: t.id,
		actorId: G.current()?.userId ?? "local-test",
		after: JSON.stringify(t)
	});
}
var ty = Object.fromEntries(Object.keys(Uv).map((e) => {
	let t = {
		run(t) {
			if (e !== "custom-reports") throw Error("Saved-report execution is not available on this register.");
			return zv(t);
		},
		generate(t) {
			if (e !== "report-packs") throw Error("Report generation is only available for report packs.");
			return kv(t);
		},
		getAll: () => x[e],
		getById: (t) => x[e].find((e) => e.id === t),
		save(t, n) {
			let r = Bv.parse(t), i = x[e].find((e) => e.id === r.id);
			if (i && i.revision !== n) throw Error("Record changed. Reload before saving.");
			if (!i && n !== void 0) throw Error("Record no longer exists.");
			let a = Hv(), o = {
				...r,
				id: i?.id ?? crypto.randomUUID(),
				name: r.name.trim(),
				status: r.status ?? (e === "tasks" ? "Open" : "Active"),
				revision: String(Number(i?.revision ?? "0") + 1),
				createdAt: i?.createdAt ?? a,
				updatedAt: a
			};
			return e === "tasks" && (delete o.completedAt, delete o.completedBy, o.status === "Completed" && (o.completedAt = i?.status === "Completed" && i.completedAt || a, o.completedBy = i?.status === "Completed" ? i.completedBy || G.current()?.userId || "local-test" : G.current()?.userId ?? "local-test")), $v(e, o, x[e]), x[e] = [...x[e].filter((e) => e.id !== o.id), o], ey(e, o, i ? "Updated" : "Created"), Kv(), o;
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
			ey(e, {
				...i,
				note: r.trim()
			}, "Note added"), Kv();
		}
	};
	return i("workspace_" + e.replaceAll("-", "_"), {
		validate: (t, n) => {
			ny(e, t), ry(e, t, n);
		},
		repository: t,
		read: Uv[e].read,
		commands: {
			run: e === "custom-reports" ? "accounting.read" : null,
			generate: e === "report-packs" ? "accounting.read" : null,
			save: Uv[e].write,
			setStatus: Uv[e].write,
			addNote: e === "tasks" ? "sales.write" : null
		},
		snapshot: () => ({
			records: x[e],
			history: qv[e]
		}),
		restore: (t) => {
			ny(e, t), x[e] = t.records, qv[e] = t.history;
		},
		publish: Kv
	}), [e, t];
}));
function ny(t, n) {
	let r = e({
		records: s(Bv),
		history: s(Bv)
	}).strict().parse(n), i = /* @__PURE__ */ new Set();
	for (let e of r.records) {
		if (!e.id || i.has(e.id) || !/^\d+$/.test(e.revision)) throw Error("Invalid workspace record identity.");
		i.add(e.id), $v(t, e, r.records, !1);
	}
	return r;
}
function ry(e, t, n) {
	let r = t.records, i = n.accounts.accounts, a = n.products.products, o = n.customers.customers, s = n.workspace_tax_codes.records;
	for (let t of r) {
		if (t.customerId && !o.some((e) => e.id === t.customerId)) throw Error("Backup workspace customer reference is invalid.");
		if (e === "promotions" && !a.some((e) => e.id === t.productId && e.units.some((e) => e.id === t.unitId))) throw Error("Backup promotion product/unit reference is invalid.");
		if (e === "tax-codes" && (!i.some((e) => e.id === t.collected && e.type === "LIABILITY") || !i.some((e) => e.id === t.paid && e.type === "ASSET"))) throw Error("Backup tax account reference is invalid.");
		if (["bank-rules", "linked-accounts"].includes(e) && !i.some((e) => e.id === t.accountId)) throw Error("Backup linked account reference is invalid.");
		if (e === "bank-rules" && t.bankAccountId && t.bankAccountId !== "ALL" && !n.bankAccounts.bankAccounts.some((e) => e.id === t.bankAccountId)) throw Error("Backup bank-rule scope reference is invalid.");
		if (e === "bank-rules" && !s.some((e) => e.code === t.taxCode)) throw Error("Backup bank-rule tax reference is invalid.");
	}
}
//#endregion
//#region src/features/sales-visits/visitRepository.ts
var iy = E().trim().min(1).max(200), ay = E().trim().min(1).max(4e3), oy = E().refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), sy = E().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}, "Invalid visit timestamp."), cy = e({
	operationId: iy,
	name: iy,
	customerId: iy,
	locationId: iy.optional(),
	plannedDate: oy,
	locationNote: E().trim().max(500).default("")
}).strict(), ly = e({
	name: iy,
	due: oy,
	priority: T([
		"Low",
		"Normal",
		"High"
	]),
	notes: ay
}).strict(), uy = e({
	id: iy,
	expectedRevision: f().int().positive(),
	outcome: ay,
	followup: ly.optional()
}).strict(), dy = e({
	id: iy,
	action: iy,
	actorId: iy,
	at: sy,
	note: E().optional()
}).strict(), fy = e({
	id: iy,
	operationId: iy,
	creationFingerprint: E().min(1).max(3e3),
	name: iy,
	customerId: iy,
	customerName: iy,
	locationId: iy.optional(),
	locationName: E().max(200).optional(),
	locationNote: E().max(500),
	plannedDate: oy,
	status: T([
		"Planned",
		"Checked in",
		"Completed",
		"Cancelled"
	]),
	revision: f().int().positive(),
	ownerId: iy,
	createdAt: sy,
	updatedAt: sy,
	checkInAt: sy.optional(),
	checkInBy: iy.optional(),
	checkOutAt: sy.optional(),
	checkOutBy: iy.optional(),
	outcome: ay.optional(),
	completionFingerprint: E().optional(),
	followupTaskId: iy.optional(),
	history: s(dy).min(1)
}).strict(), py = [], my = 0, hy = /* @__PURE__ */ new Set(), gy = () => {
	my++, hy.forEach((e) => e());
}, _y = () => G.require("sales.write").userId, vy = () => (/* @__PURE__ */ new Date()).toISOString(), yy = (e, t, n, r) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	...r ? { note: r } : {}
});
function by(e) {
	let t = py.find((t) => t.id === e);
	if (!t) throw Error("Visit not found.");
	return t;
}
function xy(e, t) {
	if (e.revision !== t) throw Error("Visit changed. Reload before continuing.");
}
function Sy(e) {
	let t = vy();
	if (t < e.updatedAt) throw Error("System clock precedes the last visit update. Correct the clock before continuing.");
	return t;
}
function Cy(e) {
	return py = [...py.filter((t) => t.id !== e.id), e], gy(), e;
}
function wy(e, t) {
	let n = R.getById(e);
	if (!n || n.status === "INACTIVE") throw Error("Choose an available customer.");
	if (t && !n.locations.some((e) => e.id === t)) throw Error("Choose a location belonging to the selected customer.");
	return n;
}
i("salesVisits", {
	repository: {
		subscribe(e) {
			return hy.add(e), () => {
				hy.delete(e);
			};
		},
		getSnapshot: () => py,
		getAll: () => py,
		create(e) {
			let t = _y(), n = cy.parse(e), r = JSON.stringify(n), i = py.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.creationFingerprint !== r) throw Error("Operation ID was used for different visit data.");
				return i;
			}
			let a = wy(n.customerId, n.locationId), o = vy();
			return Cy({
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
				history: [yy("Planned", t, o)]
			});
		},
		update(e) {
			let t = _y(), n = cy.omit({ operationId: !0 }).extend({
				id: iy,
				expectedRevision: f().int().positive()
			}).strict().parse(e), r = by(n.id);
			if (xy(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be edited.");
			let i = wy(n.customerId, n.locationId), a = Sy(r), o = {
				...r,
				name: n.name,
				customerId: n.customerId,
				customerName: i.businessName,
				plannedDate: n.plannedDate,
				locationNote: n.locationNote,
				revision: r.revision + 1,
				updatedAt: a,
				history: [...r.history, yy("Plan updated", t, a, r.plannedDate + " → " + n.plannedDate)]
			};
			return delete o.locationId, delete o.locationName, n.locationId && (o.locationId = n.locationId, o.locationName = i.locations.find((e) => e.id === n.locationId).name), Cy(o);
		},
		checkIn(t) {
			let n = _y(), r = e({
				id: iy,
				expectedRevision: f().int().positive()
			}).strict().parse(t), i = by(r.id);
			if (i.status === "Checked in" && i.revision === r.expectedRevision + 1) return i;
			if (xy(i, r.expectedRevision), i.status !== "Planned") throw Error("Only a planned visit can be checked in.");
			wy(i.customerId, i.locationId);
			let a = Sy(i);
			return Cy({
				...i,
				status: "Checked in",
				revision: i.revision + 1,
				checkInAt: a,
				checkInBy: n,
				updatedAt: a,
				history: [...i.history, yy("Checked in", n, a)]
			});
		},
		finish(e) {
			let t = _y(), n = uy.parse(e), r = by(n.id), i = JSON.stringify({
				outcome: n.outcome,
				followup: n.followup
			});
			if (r.status === "Completed") {
				if (r.completionFingerprint === i) return r;
				throw Error("Visit is already completed with a different outcome.");
			}
			if (xy(r, n.expectedRevision), r.status !== "Checked in") throw Error("Check in before completing the visit.");
			let a = Sy(r);
			if (a < r.checkInAt) throw Error("System clock precedes check-in. Correct the clock before completing.");
			let o;
			return n.followup && (o = ty.tasks.save({
				...n.followup,
				customerId: r.customerId,
				owner: t,
				status: "Open"
			}).id), Cy({
				...r,
				status: "Completed",
				revision: r.revision + 1,
				checkOutAt: a,
				checkOutBy: t,
				outcome: n.outcome,
				completionFingerprint: i,
				...o ? { followupTaskId: o } : {},
				updatedAt: a,
				history: [...r.history, yy("Completed", t, a, n.outcome)]
			});
		},
		cancel(t) {
			let n = _y(), r = e({
				id: iy,
				expectedRevision: f().int().positive(),
				reason: ay
			}).strict().parse(t), i = by(r.id);
			if (xy(i, r.expectedRevision), !["Planned", "Checked in"].includes(i.status)) throw Error("Only an unfinished visit can be cancelled.");
			let a = Sy(i);
			return Cy({
				...i,
				status: "Cancelled",
				revision: i.revision + 1,
				updatedAt: a,
				history: [...i.history, yy("Cancelled", n, a, r.reason)]
			});
		},
		addNote(t) {
			let n = _y(), r = e({
				id: iy,
				expectedRevision: f().int().positive(),
				note: ay
			}).strict().parse(t), i = by(r.id);
			xy(i, r.expectedRevision);
			let a = Sy(i);
			return Cy({
				...i,
				revision: i.revision + 1,
				updatedAt: a,
				history: [...i.history, yy("Note added", n, a, r.note)]
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
	snapshot: () => ({ visits: py }),
	restore: (e) => {
		py = e.visits;
	},
	publish: gy,
	validate: (t, n) => {
		let r = e({ visits: s(fy) }).strict().parse(t), i = n, a = /* @__PURE__ */ new Set();
		for (let t of r.visits) {
			if (a.has(t.operationId)) throw Error("Duplicate visit operation ID.");
			if (a.add(t.operationId), !i.customers.customers.find((e) => e.id === t.customerId) || t.locationId && !t.locationName) throw Error("Invalid visit customer/location reference.");
			if (t.history.length !== t.revision || new Set(t.history.map((e) => e.id)).size !== t.history.length || t.updatedAt < t.createdAt) throw Error("Invalid visit history.");
			if (cy.parse(JSON.parse(t.creationFingerprint)).operationId !== t.operationId || t.history[0].action !== "Planned" || t.history[0].actorId !== t.ownerId || t.history[0].at !== t.createdAt) throw Error("Visit creation fingerprint is inconsistent.");
			if (!!t.checkInAt != !!t.checkInBy || !!t.checkOutAt != !!t.checkOutBy || t.checkInAt && t.checkInAt < t.createdAt || t.checkOutAt && (!t.checkInAt || t.checkOutAt < t.checkInAt)) throw Error("Invalid visit check-in/out history.");
			if (t.status === "Planned" && (t.checkInAt || t.checkOutAt) || t.status === "Checked in" && (!t.checkInAt || t.checkOutAt) || t.status === "Completed" && (!t.checkInAt || !t.checkOutAt || !t.outcome || !t.completionFingerprint) || t.status !== "Completed" && (t.checkOutAt || t.outcome || t.followupTaskId || t.completionFingerprint)) throw Error("Visit state is inconsistent.");
			if (t.status === "Completed") {
				let n = e({
					outcome: ay,
					followup: ly.optional()
				}).strict().parse(JSON.parse(t.completionFingerprint));
				if (n.outcome !== t.outcome || !!n.followup != !!t.followupTaskId) throw Error("Visit completion fingerprint is inconsistent.");
			}
			if (t.followupTaskId && !i.workspace_tasks.records.some((e) => e.id === t.followupTaskId && e.customerId === t.customerId)) throw Error("Visit follow-up task is missing or belongs to another customer.");
		}
	}
});
//#endregion
//#region src/features/supplier-returns/supplierReturnRepository.ts
var Q = E().trim().min(1).max(200), Ty = f().finite().positive(), Ey = f().finite().nonnegative(), Dy = e({
	operationId: Q,
	supplierBillId: Q,
	supplierCreditNumber: Q,
	returnDate: Q,
	reason: E().trim().min(3).max(2e3),
	lines: s(e({
		matchId: Q,
		quantity: Ty
	}).strict()).min(1).max(500)
}).strict(), Oy = e({
	id: Q,
	matchId: Q,
	supplierBillLineId: Q,
	goodsReceiptId: Q,
	goodsReceiptLineId: Q,
	productId: Q,
	unitId: Q,
	baseUnitId: Q,
	sku: Q,
	description: E(),
	unitSymbol: Q,
	quantity: Ty,
	conversionToBase: Ty,
	quantityBase: Ty,
	siteId: Q,
	siteName: Q,
	inventoryMovementId: Q,
	costMovementId: Q,
	unitCostBase: Ey,
	inventoryValue: Ey,
	voidInventoryMovementId: Q.optional(),
	voidCostMovementId: Q.optional()
}).strict(), ky = e({
	id: Q,
	returnNumber: Q,
	operationId: Q,
	requestFingerprint: E().max(1e6),
	supplierBillId: Q,
	supplierBillNumber: Q,
	supplierId: Q,
	supplierName: Q,
	supplierCreditId: Q,
	returnDate: Q,
	reason: E().min(3).max(2e3),
	status: T(["POSTED", "VOID"]),
	lines: s(Oy).min(1),
	inventoryValue: Ey,
	journalId: Q.optional(),
	createdAt: Q,
	createdBy: Q,
	voidDate: Q.optional(),
	voidReason: E().optional(),
	voidedBy: Q.optional(),
	voidedAt: Q.optional()
}).strict(), Ay = [], jy = 0, My = /* @__PURE__ */ new Set(), Ny = () => {
	jy++, My.forEach((e) => e());
}, Py = (e) => Math.round(e * 1e4) / 1e4, Fy = (e) => Math.round(e * 100) / 100;
function Iy(e, t, n) {
	if (ho.getAll().some((r) => r.siteId === t && r.productId === n && ve(r.occurredAt) > e)) throw Error("Return/reversal date precedes later inventory activity at this site.");
}
function Ly(e) {
	let t = ss.getById(e);
	return !t || t.status === "VOID" || t.kind === "EXPENSE" || t.openingBalanceImportId ? [] : $o.getByBill(e).filter((e) => e.status === "ACTIVE").flatMap((e) => {
		let n = t.lines.find((t) => t.id === e.supplierBillLineId), r = Vo.getById(e.goodsReceiptId), i = r?.lines.find((t) => t.id === e.goodsReceiptLineId), a = n ? Kn(n.productId, n.unitId) : void 0;
		if (!n || !r || !i || !a) return [];
		let o = Ay.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0);
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
			let t = Dy.parse(e), n = JSON.stringify(t), r = Ay.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.requestFingerprint !== n) throw Error("Operation ID already used with different return data.");
				return r;
			}
			A(), w(t.returnDate, "Return date"), St(t.returnDate);
			let i = ss.getById(t.supplierBillId);
			if (!i || i.status === "VOID" || i.kind === "EXPENSE" || i.openingBalanceImportId) throw Error("Select an active stock bill matched to received goods.");
			if (t.returnDate < i.billDate) throw Error("Return date cannot precede bill date.");
			let a = Ly(i.id), o = /* @__PURE__ */ new Set(), s = t.lines.map((e) => {
				if (o.has(e.matchId)) throw Error("Select each receipt match once.");
				o.add(e.matchId);
				let n = a.find((t) => t.matchId === e.matchId);
				if (!n) throw Error("Return line must belong to an active receipt match for this bill.");
				if (Py(e.quantity) !== e.quantity || e.quantity > n.availableQuantity + 1e-8) throw Error("Return quantity exceeds the matched receipt remainder or four decimal places.");
				if (t.returnDate < n.receiptDate) throw Error("Return date cannot precede receipt date.");
				let r = Gn(n.productId), i = Kn(n.productId, n.unitId), s = $a.getById(n.siteId);
				if (!r || !i || !s || s.status !== "ACTIVE") throw Error("Return product, unit or active receiving site was not found.");
				if (r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(i.code) && !Number.isInteger(e.quantity)) throw Error("Whole packs must be returned in whole quantities.");
				Iy(t.returnDate, s.id, r.id);
				let c = Py(e.quantity * n.conversionToBase);
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
				c.set(t, Py((c.get(t) ?? 0) + e.quantityBase));
			}
			for (let [e, t] of c) {
				let [n, r] = e.split("|");
				if ((Po.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t) throw Error("Insufficient stock at the original receiving site.");
			}
			let l = /* @__PURE__ */ new Map();
			for (let e of s) {
				let t = i.lines.find((t) => t.id === e.supplierBillLineId), n = l.get(t.id);
				l.set(t.id, {
					supplierBillLineId: t.id,
					quantity: Py((n?.quantity ?? 0) + e.quantity),
					unitCost: t.unitCost
				});
			}
			let u = crypto.randomUUID(), d = "SR-" + t.returnDate.slice(0, 4) + "-" + String(Ay.length + 1).padStart(5, "0"), f = W.createReturnCredit({
				sourceSupplierBillId: i.id,
				supplierCreditNumber: t.supplierCreditNumber,
				creditDate: t.returnDate,
				reason: t.reason,
				lines: [...l.values()]
			}, u), p = s.map((e) => {
				Po.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let n = io.create({
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
				}), r = Oo({
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
			}), m = Fy(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? I.post({
				journalDate: t.returnDate,
				description: `Physical supplier return ${d}`,
				reference: f.creditNumber,
				sourceType: "SUPPLIER_RETURN",
				sourceId: u,
				lines: [{
					accountId: F.requireBySystemRole("PURCHASE_PRICE_VARIANCE").id,
					debit: m,
					credit: 0
				}, {
					accountId: F.requireBySystemRole("INVENTORY").id,
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
				createdBy: G.current()?.userId ?? "local-test"
			};
			return Ay = [g, ...Ay], Ny(), g;
		},
		reverse(t) {
			let n = e({
				returnId: Q,
				voidDate: Q,
				reason: E().trim().min(3).max(2e3)
			}).strict().parse(t), r = Ay.find((e) => e.id === n.returnId);
			if (!r) throw Error("Supplier return not found.");
			if (r.status === "VOID") return r;
			if (A(), w(n.voidDate, "Reversal date"), St(n.voidDate), n.voidDate < r.returnDate) throw Error("Reversal date cannot precede return date.");
			for (let e of r.lines) Iy(n.voidDate, e.siteId, e.productId);
			let i = W.getById(r.supplierCreditId);
			if ((i.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > n.voidDate) || W.getAllocationsByCredit(i.id).some((e) => e.reversedAt && ve(e.reversedAt) > n.voidDate)) throw Error("Reversal date precedes later credit settlement activity.");
			W.voidReturnCredit({
				supplierCreditId: r.supplierCreditId,
				reason: n.reason,
				voidDate: n.voidDate
			});
			let a = r.lines.map((e) => {
				Po.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = io.create({
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
				}), i = ko({
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
			r.journalId && I.reverse({
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
				voidedBy: G.current()?.userId ?? "local-test"
			};
			return Ay = Ay.map((e) => e.id === r.id ? o : e), Ny(), o;
		}
	},
	read: "purchases.return.read",
	commands: {
		create: "purchases.return",
		reverse: "purchases.return"
	},
	snapshot: () => ({ returns: Ay }),
	restore: (e) => {
		Ay = e.returns;
	},
	publish: Ny,
	validate: (t, n) => {
		let r = e({ returns: s(ky) }).strict().parse(t), i = n, a = /* @__PURE__ */ new Set();
		for (let e of r.returns) {
			w(e.returnDate), e.voidDate && w(e.voidDate);
			let t = Dy.parse(JSON.parse(e.requestFingerprint));
			if (a.has(e.operationId) || t.operationId !== e.operationId || t.supplierBillId !== e.supplierBillId || t.returnDate !== e.returnDate) throw Error("Supplier return operation mismatch.");
			a.add(e.operationId);
			let n = i.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId && t.supplierId === e.supplierId), r = i.supplierCredits.supplierCredits.find((t) => t.id === e.supplierCreditId && t.physicalReturnId === e.id && t.sourceSupplierBillId === e.supplierBillId);
			if (!n || !r || e.status === "VOID" != (r.status === "VOID")) throw Error("Supplier return bill/credit reference is invalid.");
			if (Fy(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue) throw Error("Supplier return cost total is invalid.");
			for (let t of e.lines) {
				let r = i.receiptMatches.matches.find((n) => n.id === t.matchId && n.supplierBillId === e.supplierBillId && n.supplierBillLineId === t.supplierBillLineId && n.goodsReceiptId === t.goodsReceiptId && n.goodsReceiptLineId === t.goodsReceiptLineId), a = i.costMovements.movements.find((e) => e.id === t.costMovementId), o = i.inventoryMovements.movements.find((e) => e.id === t.inventoryMovementId), s = i.goodsReceipts.goodsReceipts.find((e) => e.id === t.goodsReceiptId), c = n.lines.find((e) => e.id === t.supplierBillLineId);
				if (!r || !c || c.productId !== t.productId || c.unitId !== t.unitId || s?.siteId !== t.siteId || r.productId !== t.productId || !a || !o || a.referenceType !== "SUPPLIER_RETURN" || a.referenceId !== e.id || a.inventoryMovementId !== o.id || a.siteId !== t.siteId || a.productId !== t.productId || a.unitCostBase !== t.unitCostBase || a.quantityBase !== -t.quantityBase || Fy(-a.valueChange) !== Fy(t.inventoryValue) || Py(t.quantity * t.conversionToBase) !== t.quantityBase || o.referenceType !== "SUPPLIER_RETURN" || o.referenceId !== e.id || o.siteId !== t.siteId || o.productId !== t.productId || o.quantityBase !== -t.quantityBase || o.transactionQuantity !== -t.quantity || ve(o.occurredAt) !== e.returnDate) throw Error("Supplier return stock/cost reference is invalid.");
				if (e.status === "VOID") {
					let n = i.costMovements.movements.find((e) => e.id === t.voidCostMovementId), r = i.inventoryMovements.movements.find((e) => e.id === t.voidInventoryMovementId);
					if (!n || !r || n.inventoryMovementId !== r.id || n.referenceType !== "SUPPLIER_RETURN_VOID" || n.referenceId !== e.id || n.siteId !== t.siteId || n.productId !== t.productId || n.quantityBase !== t.quantityBase || Fy(n.valueChange) !== Fy(t.inventoryValue) || r.referenceType !== "SUPPLIER_RETURN_VOID" || r.quantityBase !== t.quantityBase || r.referenceId !== e.id || ve(n.occurredAt) !== e.voidDate) throw Error("Supplier return reversal reference is invalid.");
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
				let n = Py(e.lines.filter((e) => e.supplierBillLineId === t).reduce((e, t) => e + t.quantity, 0));
				if (!r.lines.some((e) => e.supplierBillLineId === t && e.quantity === n)) throw Error("Supplier return linked credit quantity mismatch.");
			}
			if (e.status === "VOID" && (!e.voidDate || e.voidDate < e.returnDate || !e.voidReason || !e.voidedBy)) throw Error("Supplier return reversal metadata is invalid.");
			if (e.inventoryValue && !i.journals.journalEntries.some((t) => t.id === e.journalId && t.sourceId === e.id && t.sourceType === "SUPPLIER_RETURN" && t.totalDebit === e.inventoryValue && (e.status === "VOID" ? t.status === "REVERSED" : t.status === "POSTED"))) throw Error("Supplier return journal reference is invalid.");
		}
		for (let e of i.supplierCredits.supplierCredits) if (e.physicalReturnId && !r.returns.some((t) => t.id === e.physicalReturnId && t.supplierCreditId === e.id)) throw Error("Supplier credit physical return reference is invalid.");
		for (let e of i.receiptMatches.matches) if (Py(r.returns.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0)) > e.matchedBaseQuantity + 1e-8) throw Error("Supplier return quantities exceed the receipt match.");
	}
});
//#endregion
//#region src/features/document-output/outputRepository.ts
var Ry = E().min(1).max(200), zy = E().max(2e4), By = zy.optional(), Vy = [
	"QUOTE",
	"SALES_ORDER",
	"INVOICE",
	"CREDIT_NOTE"
], Hy = e({
	operationId: Ry,
	sourceId: Ry,
	kind: T(Vy),
	expectedUpdatedAt: Ry,
	templateId: Ry.optional()
}).strict(), Uy = f().finite().nonnegative(), Wy = e({
	itemType: T([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	id: Ry,
	sku: zy,
	description: zy,
	unitSymbol: zy,
	quantity: f().positive().finite(),
	unitPrice: Uy,
	lineSubtotal: Uy,
	taxAmount: Uy,
	lineTotal: Uy,
	taxCode: By,
	taxRate: f().finite().min(0).max(1).optional(),
	requestedArea: f().positive().finite().optional(),
	areaPerPack: f().positive().finite().optional(),
	coveredArea: f().positive().finite().optional()
}).strict(), Gy = e({
	locationId: By,
	locationName: By,
	deliveryAddress: By,
	accountingContactId: By,
	accountingContactName: By,
	accountingEmail: By
}).strict(), Ky = e({
	id: Ry,
	revision: Ry,
	name: zy,
	subject: zy,
	body: zy,
	footer: zy,
	paper: T(["A4", "Letter"])
}).strict(), qy = e({
	id: Ry,
	operationId: Ry,
	requestFingerprint: zy,
	preparedAt: Ry,
	preparedBy: Ry,
	sourceId: Ry,
	kind: T(Vy),
	sourceUpdatedAt: Ry,
	documentNumber: Ry,
	status: Ry,
	documentDate: Ry,
	dueDate: By,
	expiryDate: By,
	reference: By,
	notes: By,
	customerId: Ry,
	customerName: zy,
	customerCode: zy,
	customerIdentifier: By,
	recipient: Gy.optional(),
	issuer: e({
		name: zy,
		tradingName: By,
		identifier: By,
		address: By,
		email: By,
		phone: By,
		currency: Ry
	}).strict(),
	lines: s(Wy).min(1),
	totals: e({
		subtotal: Uy,
		taxAmount: Uy,
		total: Uy
	}).strict(),
	amountPaid: Uy.optional(),
	amountDue: Uy.optional(),
	template: Ky,
	subject: zy,
	body: zy
}).strict();
function Jy(e, t) {
	if (e === "CREDIT_NOTE") {
		let e = z.getById(t);
		if (!e) throw Error("Credit note was not found.");
		return {
			...e,
			type: "CREDIT_NOTE",
			documentNumber: e.creditNoteNumber,
			documentDate: e.creditDate
		};
	}
	let n = B.getById(t);
	if (!n || n.type !== e) throw Error("Sales document was not found.");
	return n;
}
var Yy = (e) => e === "QUOTE" ? "Quotation" : e === "INVOICE" ? "Invoice" : e === "SALES_ORDER" ? "Sales order" : "Credit note";
function Xy() {
	return (x.templates ?? []).filter((e) => e.status === "Active" && [
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
var Zy = [];
Xy();
var Qy = 0, $y = /* @__PURE__ */ new Set(), eb = () => {
	Qy++, $y.forEach((e) => e());
};
function tb(e, t) {
	let n = t ? x.templates?.find((n) => n.id === t && n.status === "Active" && n.kind === Yy(e)) : void 0;
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
var nb = [
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
function rb(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!nb.includes(n)) throw Error(`Unsupported template token: ${n}.`);
		return t[n] ?? "";
	});
}
function ib(e) {
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
var ab = { prepare(e) {
	let t = Hy.parse(e), n = JSON.stringify(t), r = Zy.find((e) => e.operationId === t.operationId);
	if (r) {
		if (r.requestFingerprint !== n) throw Error("Operation ID was used for different output data.");
		return r;
	}
	let i = Jy(t.kind, t.sourceId);
	if (i.updatedAt !== t.expectedUpdatedAt) throw Error("Source document changed. Reload before preparing output.");
	let a = R.getById(i.customerId);
	if (!a) throw Error("Source customer was not found.");
	let o = C(), s = tb(t.kind, t.templateId), c = structuredClone(i.recipient), l = {
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
		preparedBy: G.current()?.userId ?? "local-test",
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
		lines: i.lines.map(ib),
		totals: structuredClone(i.totals),
		amountPaid: "amountPaid" in i ? i.amountPaid : void 0,
		amountDue: "amountDue" in i ? i.amountDue : void 0,
		template: {
			...s,
			footer: rb(s.footer, l)
		},
		subject: rb(s.subject, l),
		body: rb(s.body, l)
	};
	return ob(u), Zy = [u, ...Zy], eb(), u;
} };
function ob(e) {
	let t = qy.parse(e);
	if (_r(t.recipient), !Number.isFinite(Date.parse(t.preparedAt))) throw Error("Invalid preparation timestamp.");
	let n = Hy.parse(JSON.parse(t.requestFingerprint));
	if (n.operationId !== t.operationId || n.sourceId !== t.sourceId || n.kind !== t.kind || n.expectedUpdatedAt !== t.sourceUpdatedAt) throw Error("Output source metadata mismatch.");
	let r = (e) => Math.round(e * 100) / 100;
	for (let e of t.lines) if (Yn(e), r(e.lineSubtotal + e.taxAmount) !== e.lineTotal) throw Error("Invalid output line total.");
	for (let [e, n] of [
		["subtotal", "lineSubtotal"],
		["taxAmount", "taxAmount"],
		["total", "lineTotal"]
	]) if (r(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Invalid output totals.");
	return t;
}
i("preparedSalesOutputs", {
	repository: ab,
	read: "sales.read",
	commands: { prepare: "documents.prepare" },
	snapshot: () => ({
		artifacts: Zy,
		templates: Xy()
	}),
	restore: (e) => {
		Zy = e.artifacts, e.templates;
	},
	publish: eb,
	validate: (t, n) => {
		let r = e({
			artifacts: s(qy),
			templates: s(e({
				id: Ry,
				name: zy,
				kind: Ry
			}).strict())
		}).strict().parse(t), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set();
		for (let e of r.artifacts) {
			if (ob(e), i.has(e.id) || a.has(e.operationId)) throw Error("Duplicate prepared output.");
			i.add(e.id), a.add(e.operationId);
			let t = n, r = e.kind === "CREDIT_NOTE" ? t.customerCredits.creditNotes.find((t) => t.id === e.sourceId) : [
				...t.sales.quotes,
				...t.sales.salesOrders,
				...t.sales.invoices
			].find((t) => t.id === e.sourceId && t.type === e.kind);
			if (!r || r.customerId !== e.customerId) throw Error("Prepared output source reference is invalid.");
		}
	}
});
//#endregion
//#region src/features/direct-documents/dispatchRepository.ts
var sb = E().trim().min(1).max(200), cb = e({
	operationId: sb,
	salesOrderId: sb,
	siteId: sb,
	fulfilmentDate: sb,
	lines: s(e({
		salesOrderLineId: sb,
		fulfilledQuantity: f().positive().finite()
	}).strict()).min(1).max(500)
}).strict();
function lb() {
	return B.getAll().filter((e) => e.type === "SALES_ORDER" && [
		"CONFIRMED",
		"PARTIALLY_FULFILLED",
		"INVOICED"
	].includes(e.status)).filter((e) => e.type === "SALES_ORDER" && (e.status !== "INVOICED" || e.invoiceIds.some((e) => {
		let t = B.getById(e);
		return t?.type === "INVOICE" && t.status !== "VOID";
	}))).map((e) => ({
		id: e.id,
		number: e.documentNumber,
		date: e.documentDate,
		delivery: e.recipient?.deliveryAddress,
		store: e.recipient?.locationName,
		lines: e.lines.filter(Hn).map((t) => ({
			id: t.id,
			sku: t.sku,
			description: t.description,
			unit: t.unitSymbol,
			quantity: t.quantity,
			fulfilled: fm.getAll().filter((t) => t.salesOrderId === e.id && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t.id).reduce((e, t) => e + t.fulfilledQuantity, 0)
		}))
	})).filter((e) => e.lines.length > 0);
}
lb();
var ub = [], db = 0, fb = /* @__PURE__ */ new Set(), pb = () => {
	db++, fb.forEach((e) => e());
};
i("salesDispatch", {
	repository: {
		record(e) {
			let t = cb.parse(e), n = JSON.stringify(t), r = ub.find((e) => e.id === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Dispatch operation ID was already used with different data.");
				return fm.getAll().find((e) => e.id === r.fulfilmentId);
			}
			if (A(), w(t.fulfilmentDate), St(t.fulfilmentDate), new Set(t.lines.map((e) => e.salesOrderLineId)).size !== t.lines.length) throw Error("Each dispatch line must be selected only once.");
			let i = fm.create(t);
			return ub = [...ub, {
				id: t.operationId,
				fingerprint: n,
				fulfilmentId: i.id
			}], pb(), i;
		},
		reverse(t) {
			let n = e({
				fulfilmentId: sb,
				voidDate: sb,
				reason: E().trim().min(3).max(1e3)
			}).strict().parse(t);
			A(), w(n.voidDate), St(n.voidDate);
			let r = fm.getAll().find((e) => e.id === n.fulfilmentId);
			return r?.status === "VOIDED" ? r : fm.void(n);
		}
	},
	read: "inventory.read",
	commands: {
		record: "inventory.adjust",
		reverse: "inventory.adjust"
	},
	snapshot: () => ({
		orders: lb(),
		requests: ub
	}),
	restore: (e) => {
		e.orders, ub = e.requests;
	},
	publish: pb,
	validate: (t, n) => {
		let r = e({
			orders: s(e({
				id: sb,
				number: sb,
				date: sb,
				delivery: E().optional(),
				store: E().optional(),
				lines: s(e({
					id: sb,
					sku: E(),
					description: E(),
					unit: E(),
					quantity: f().finite().positive(),
					fulfilled: f().finite().nonnegative()
				}).strict())
			}).strict()),
			requests: s(e({
				id: sb,
				fingerprint: E().max(1e6),
				fulfilmentId: sb
			}).strict())
		}).strict().parse(t), i = n.fulfilments.fulfilments;
		if (r.requests.some((e) => !i.some((t) => t.id === e.fulfilmentId))) throw Error("Dispatch result reference is invalid.");
	}
});
//#endregion
//#region src/features/finance-foundation/openingBalanceRepository.ts
var mb = (e) => Math.round((e + 2 ** -52) * 100) / 100, $ = E().trim().min(1).max(200), hb = f().finite().refine((e) => mb(e) === e, "Amounts must use cents precision"), gb = e({
	accountId: $,
	debit: hb.nonnegative(),
	credit: hb.nonnegative()
}).strict(), _b = e({
	contactId: $,
	reference: $,
	date: $,
	dueDate: $,
	amount: hb
}).strict(), vb = e({
	operationId: $,
	date: $,
	reason: E().trim().min(3).max(1e3),
	gl: s(gb).min(2).max(5e3),
	ar: s(_b).max(1e4),
	ap: s(_b).max(1e4),
	banks: s(e({
		bankAccountId: $,
		amount: hb
	}).strict()).max(500),
	stock: s(e({
		siteId: $,
		productId: $,
		quantity: f().positive().finite(),
		unitCost: f().nonnegative().finite()
	}).strict()).max(1e4)
}).strict(), yb = [], bb = 0, xb = /* @__PURE__ */ new Set(), Sb = () => {
	bb++, xb.forEach((e) => e());
};
function Cb() {
	return t();
}
function wb(e) {
	d(e), Mr(e.sales), Wr(e.customerCredits), N.update("supplierBills", e.supplierBills.supplierBills), N.update("supplierCredits", e.supplierCredits.supplierCredits);
}
function Tb(e, t) {
	if (new Set(e).size !== e.length) throw Error("Duplicate " + t + ".");
}
function Eb(e) {
	let t = vb.parse(e);
	if (w(t.date, "Cutover date"), St(t.date), A(), yb.some((e) => e.status === "POSTED")) throw Error("An opening batch is already active. Reverse the unused batch before replacing it.");
	let n = Cb();
	if (n.journals.journalEntries.some((e) => e.journalDate >= t.date)) throw Error("Cutover must be after all existing ledger activity. This import adds historical balances, never replaces existing transactions.");
	if (n.inventoryMovements.movements.some((e) => e.occurredAt.slice(0, 10) >= t.date)) throw Error("Cutover must be after existing inventory activity.");
	Tb(t.gl.map((e) => e.accountId), "GL account"), Tb(t.banks.map((e) => e.bankAccountId), "bank"), Tb(t.stock.map((e) => e.siteId + ":" + e.productId), "site/product");
	let r = Zu({
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
	}), i = Fd({
		suppliers: n.suppliers.suppliers,
		bills: n.supplierBills.supplierBills,
		payments: n.supplierPayments.supplierPayments,
		credits: n.supplierCredits.supplierCredits,
		creditAllocations: n.supplierCredits.allocations,
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: t.date
	}), a = Hd({
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
	let o = F.getAll(), s = (e) => F.requireBySystemRole(e).id, c = (e) => mb(t.gl.filter((t) => t.accountId === e).reduce((e, t) => e + t.debit - t.credit, 0));
	for (let e of t.gl) {
		let t = F.requireById(e.accountId);
		if (!t.active || ![
			"ASSET",
			"LIABILITY",
			"EQUITY"
		].includes(t.type) || e.debit > 0 && e.credit > 0 || e.debit + e.credit <= 0) throw Error("Opening GL requires active balance-sheet accounts and one positive debit or credit per row.");
	}
	let l = mb(t.gl.reduce((e, t) => e + t.debit, 0)), u = mb(t.gl.reduce((e, t) => e + t.credit, 0));
	if (l !== u || !l) throw Error("Opening trial balance does not balance.");
	let d = mb(t.ar.reduce((e, t) => e + t.amount, 0)), f = mb(t.ap.reduce((e, t) => e + t.amount, 0));
	if (c(s("ACCOUNTS_RECEIVABLE")) !== d || c(s("ACCOUNTS_PAYABLE")) !== -f) throw Error("AR/AP detail must equal imported GL control balances. Negative detail creates an unused historical credit.");
	for (let [e, r] of [["ar", t.ar], ["ap", t.ap]]) {
		Tb(r.map((e) => e.contactId + ":" + e.reference.toLowerCase()), e + " reference");
		for (let i of r) {
			if (w(i.date), w(i.dueDate), !i.amount || i.date > t.date || i.dueDate < i.date) throw Error("Invalid outstanding document amount/date.");
			if (!(e === "ar" ? n.customers.customers : n.suppliers.suppliers).some((e) => e.id === i.contactId)) throw Error("Opening contact not found.");
			if ((e === "ar" ? [...n.sales.invoices.map((e) => [e.customerId, e.documentNumber]), ...n.customerCredits.creditNotes.map((e) => [e.customerId, e.creditNoteNumber])] : [...n.supplierBills.supplierBills.map((e) => [e.supplierId, e.supplierInvoiceNumber]), ...n.supplierCredits.supplierCredits.map((e) => [e.supplierId, e.supplierCreditNumber])]).some(([e, t]) => e === i.contactId && t.toLowerCase() === i.reference.toLowerCase())) throw Error("Historical document reference already exists.");
		}
	}
	let p = 0;
	for (let e of t.stock) {
		let t = Gn(e.productId), n = $a.getById(e.siteId);
		if (!t || t.status !== "ACTIVE" || t.itemType === "SERVICE" || n?.status !== "ACTIVE") throw Error("Opening stock requires active stocked products/sites.");
		if (Math.round(e.quantity * 1e4) / 1e4 !== e.quantity) throw Error("Stock quantities use at most four decimal places.");
		p = mb(p + mb(e.quantity * e.unitCost));
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
			let { input: t, debit: n, credit: r, ar: i, ap: a, inventory: o } = Eb(e);
			return {
				date: t.date,
				debit: n,
				credit: r,
				ar: i,
				ap: a,
				inventory: o,
				bank: mb(t.banks.reduce((e, t) => e + t.amount, 0)),
				documents: t.ar.length + t.ap.length
			};
		},
		post(e) {
			let t = vb.parse(e), n = JSON.stringify(t), r = yb.find((e) => e.operationId === t.operationId);
			if (n.length > 5e7) throw Error("Opening import exceeds 50 MB.");
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID already used for different opening data.");
				return r;
			}
			let { input: i, s: a } = Eb(t), o = crypto.randomUUID(), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
				id: o,
				operationId: i.operationId,
				fingerprint: n,
				date: i.date,
				reason: i.reason,
				status: "POSTED",
				actor: G.current()?.userId ?? "",
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
			}, l = (e) => F.requireBySystemRole(e).id, u = l("OWNERS_EQUITY"), d = 0, f = 0;
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
				let g = e === "ar" == t.amount > 0, _ = I.post({
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
			a.journals = Cb().journals, wb(a);
			let p = i.gl.filter((e) => ![l("ACCOUNTS_RECEIVABLE"), l("ACCOUNTS_PAYABLE")].includes(e.accountId));
			(d || f) && p.push({
				accountId: u,
				debit: mb(d),
				credit: mb(f)
			});
			let m = /* @__PURE__ */ new Map();
			for (let e of p) m.set(e.accountId, mb((m.get(e.accountId) ?? 0) + e.debit - e.credit));
			let h = [...m].filter(([, e]) => e !== 0).map(([e, t]) => ({
				accountId: e,
				debit: Math.max(0, t),
				credit: Math.max(0, -t)
			}));
			if (h.length) {
				let e = I.post({
					journalDate: i.date,
					description: "Opening trial balance " + i.reason,
					sourceType: "OPENING_BALANCE",
					sourceId: o,
					lines: h
				});
				c.journalIds.push(e.id);
			}
			for (let e of i.stock) {
				let t = Gn(e.productId), n = t.units.find((e) => e.id === t.baseUnitId), r = io.create({
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
				Po.receive({
					siteId: e.siteId,
					productId: t.id,
					baseUnitId: t.baseUnitId,
					quantityBase: e.quantity
				});
				let a = Do({
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
			return yb = [...yb, c], Sb(), c;
		},
		reverse(e) {
			if (w(e.date), St(e.date), A(), !e.reason?.trim() || e.reason.trim().length < 3) throw Error("Reversal reason is required.");
			let t = yb.find((t) => t.id === e.id);
			if (!t) throw Error("Opening batch not found.");
			if (t.status === "REVERSED") return t;
			if (e.date < t.date) throw Error("Reversal date precedes cutover.");
			let n = Cb();
			if (n.journals.journalEntries.some((e) => !t.priorJournalIds.includes(e.id) && !t.journalIds.includes(e.id)) || n.inventoryMovements.movements.some((e) => !t.priorMovementIds.includes(e.id) && !t.movementIds.includes(e.id))) throw Error("Subsequent accounting or inventory activity exists. Reverse downstream activity before correcting opening balances.");
			let r = n.sales.invoices.filter((e) => t.invoiceIds.includes(e.id)), i = n.supplierBills.supplierBills.filter((e) => t.billIds.includes(e.id)), a = [...n.customerCredits.creditNotes.filter((e) => t.customerCreditIds.includes(e.id)), ...n.supplierCredits.supplierCredits.filter((e) => t.supplierCreditIds.includes(e.id))];
			if (r.some((e) => e.amountPaid !== 0 || e.amountDue !== e.totals.total) || i.some((e) => e.totals.amountPaid !== 0 || e.totals.amountCredited !== 0) || a.some((e) => e.amountApplied !== 0 || (e.amountRefunded ?? 0) !== 0)) throw Error("Opening balances have allocations or settlements. Reverse downstream allocations before correcting them.");
			for (let e of ["customerSettlements", "supplierRefunds"]) if (JSON.stringify(n[e]).includes(t.id)) throw Error("Opening balances have downstream settlements.");
			for (let e of t.journalIds) Us(e);
			for (let n of t.journalIds) I.reverse({
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
			return n.stock.balances = t.priorStock, n.costBalances.balances = t.priorCost, n.journals = Cb().journals, wb(n), yb = yb.map((n) => n.id === t.id ? {
				...n,
				status: "REVERSED",
				reversalDate: e.date,
				reversalReason: e.reason
			} : n), Sb(), yb.find((e) => e.id === t.id);
		}
	},
	read: "accounting.read",
	commands: {
		preview: "accounting.post",
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ batches: yb }),
	restore: (e) => {
		yb = e.batches;
	},
	publish: Sb,
	validate: (t, n) => {
		let r = e({ batches: s(e({
			id: $,
			operationId: $,
			date: $,
			status: T(["POSTED", "REVERSED"]),
			journalIds: s($),
			invoiceIds: s($),
			billIds: s($),
			customerCreditIds: s($),
			supplierCreditIds: s($),
			fingerprint: E().min(1).max(5e7),
			reason: E().min(3),
			actor: $,
			createdAt: $,
			movementIds: s($),
			costMovementIds: s($),
			priorJournalIds: s($),
			priorMovementIds: s($),
			priorStock: s(e({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: f().finite().nonnegative(),
				updatedAt: $
			}).strict()),
			priorCost: s(e({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: f().finite().nonnegative(),
				averageCostPerBaseUnit: f().finite().nonnegative(),
				inventoryValue: f().finite().nonnegative(),
				costingMethod: b("MOVING_WEIGHTED_AVERAGE"),
				updatedAt: $
			}).strict()),
			reversalDate: $.optional(),
			reversalReason: E().optional()
		}).strict()) }).strict().parse(t);
		for (let e of r.batches) {
			let t = vb.parse(JSON.parse(e.fingerprint));
			if (t.operationId !== e.operationId || t.date !== e.date) throw Error("Opening import identity is invalid.");
			if (e.status === "REVERSED" && !e.reversalDate) throw Error("Opening reversal date is missing.");
			e.reversalDate && w(e.reversalDate), w(e.date);
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
var Db = (e) => Math.round((e + 2 ** -52) * 100) / 100, Ob = E().trim().min(1).max(200), kb = e({
	operationId: Ob,
	paymentDate: Ob,
	bankAccountId: Ob,
	reference: E().max(500),
	allocations: s(e({
		supplierBillId: Ob,
		amount: f().finite().positive().refine((e) => Db(e) === e)
	}).strict()).min(1).max(500)
}).strict(), Ab = [], jb = 0, Mb = /* @__PURE__ */ new Set(), Nb = () => {
	jb++, Mb.forEach((e) => e());
}, Pb = () => {
	let e = G.current();
	if (!e) throw Error("A verified session is required.");
	return e.userId;
};
function Fb(e, t) {
	return {
		action: e,
		reason: t,
		actor: Pb(),
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function Ib(e) {
	let t = Ab.find((t) => t.id === e);
	if (!t) throw Error("Payment batch was not found.");
	return t;
}
function Lb(e) {
	return Ab = Ab.map((t) => t.id === e.id ? e : t), Nb(), e;
}
function Rb(e) {
	w(e.paymentDate, "Payment date");
	let t = L.requireById(e.bankAccountId);
	if (!t.active || e.paymentDate < t.openingBalanceDate) throw Error("Invalid paying bank account/date.");
	if (new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length) throw Error("Select each bill only once.");
	for (let t of e.allocations) {
		let n = ss.getById(t.supplierBillId);
		if (!n || n.status === "VOID" || t.amount > n.totals.amountDue || e.paymentDate < n.billDate) throw Error("A bill amount, date or outstanding balance changed. Review the batch.");
	}
}
i("paymentBatches", {
	repository: {
		create(e) {
			let t = kb.parse(e), n = JSON.stringify(t), r = Ab.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID was used with different batch data.");
				return r;
			}
			Rb(t);
			let i = {
				...t,
				id: crypto.randomUUID(),
				fingerprint: n,
				status: "DRAFT",
				createdBy: Pb(),
				paymentIds: [],
				history: [Fb("Created")]
			};
			return Ab = [...Ab, i], Nb(), i;
		},
		approve(e) {
			let t = Ib(e);
			if (t.status === "APPROVED") return t;
			if (t.status !== "DRAFT") throw Error("Only a draft batch can be approved.");
			return Rb(t), Lb({
				...t,
				status: "APPROVED",
				approvedBy: Pb(),
				history: [...t.history, Fb("Approved")]
			});
		},
		post(e) {
			let t = Ib(e);
			if (t.status === "POSTED") return t;
			if (t.status !== "APPROVED") throw Error("Approve the batch before recording payments.");
			A(), Rb(t);
			let n = /* @__PURE__ */ new Map();
			for (let e of t.allocations) {
				let t = ss.getById(e.supplierBillId);
				n.set(t.supplierId, [...n.get(t.supplierId) ?? [], e]);
			}
			let r = [...n].map(([e, n]) => td.create({
				operationId: "batch:" + t.id + ":" + e,
				supplierId: e,
				paymentDate: t.paymentDate,
				bankAccountId: t.bankAccountId,
				reference: t.reference,
				method: "BANK_TRANSFER",
				allocations: n
			}));
			if (r.some((e) => e.status !== "POSTED")) throw Error("Batch payment is not posted. Inspect the prior operation before retrying.");
			return Lb({
				...t,
				status: "POSTED",
				paymentIds: r.map((e) => e.id),
				history: [...t.history, Fb("Payments recorded")]
			});
		},
		cancel(e) {
			let t = Ib(e.id);
			if (!["DRAFT", "APPROVED"].includes(t.status) || e.reason?.trim().length < 3) throw Error("Only an unposted batch can be cancelled, with a reason.");
			return Lb({
				...t,
				status: "CANCELLED",
				history: [...t.history, Fb("Cancelled", e.reason)]
			});
		},
		reverse(e) {
			let t = Ib(e.id);
			if (t.status === "REVERSED") return t;
			if (t.status !== "POSTED" || e.reason?.trim().length < 3) throw Error("A posted batch and reversal reason are required.");
			A();
			for (let e of t.paymentIds) {
				let t = td.getById(e);
				if (!t || t.status !== "POSTED") throw Error("Batch payments changed. Inspect before reversing.");
				Nt("SUPPLIER_PAYMENT", e);
			}
			for (let n of t.paymentIds) td.reverse(n, e.reason);
			return Lb({
				...t,
				status: "REVERSED",
				history: [...t.history, Fb("Reversed", e.reason)]
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
	snapshot: () => ({ batches: Ab }),
	restore: (e) => {
		Ab = e.batches;
	},
	validate: (t, n) => {
		let r = kb.extend({
			id: Ob,
			fingerprint: E(),
			status: T([
				"DRAFT",
				"APPROVED",
				"POSTED",
				"REVERSED",
				"CANCELLED"
			]),
			createdBy: Ob,
			approvedBy: Ob.optional(),
			paymentIds: s(Ob),
			history: s(e({
				action: Ob,
				actor: Ob,
				at: Ob,
				reason: E().optional()
			}).strict())
		}).strict(), i = e({ batches: s(r) }).strict().parse(t), a = n, o = a.supplierPayments.supplierPayments, c = a.bankAccounts.bankAccounts, l = a.supplierBills.supplierBills, u = /* @__PURE__ */ new Set();
		if (new Set(i.batches.map((e) => e.id)).size !== i.batches.length || new Set(i.batches.map((e) => e.operationId)).size !== i.batches.length) throw Error("Duplicate payment batch identity or operation.");
		let d = (e) => JSON.stringify(e.map((e) => ({
			supplierBillId: e.supplierBillId,
			amount: e.amount
		})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId)));
		for (let e of i.batches) {
			try {
				w(e.paymentDate, "Batch payment date");
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
			let s = /* @__PURE__ */ new Set();
			for (let t of e.paymentIds) {
				let n = o.find((e) => e.id === t), r = n && i.get(n.supplierId);
				if (u.has(t) || !n || !r || s.has(n.supplierId) || n.operationId !== "batch:" + e.id + ":" + n.supplierId || n.bankAccountId !== e.bankAccountId || n.paymentDate !== e.paymentDate || n.method !== "BANK_TRANSFER" || (n.reference ?? "") !== e.reference.trim() || n.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED") || d(n.allocations) !== d(r) || n.amount !== Db(r.reduce((e, t) => e + t.amount, 0))) throw Error("Payment batch payment relationships are invalid.");
				if (u.add(t), s.add(n.supplierId), !a.journals.journalEntries.some((e) => e.sourceType === "SUPPLIER_PAYMENT" && e.sourceId === t)) throw Error("A batch payment journal is missing.");
			}
		}
	},
	publish: Nb
});
//#endregion
//#region electron/security/periodCloseChecks.ts
function zb(e) {
	let n = t(), r = [], i = (e, t, n) => r.push({
		code: e,
		message: t,
		...n ? { path: n } : {}
	});
	e.endDate >= ve((/* @__PURE__ */ new Date()).toISOString()) && i("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of O.getUnresolved()) i("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of n.purchaseOperations) e.status !== "POSTED" && i("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of cd()) i(e.code, `${e.entityId}: ${e.message}`);
	let a = g(G.current(), "payroll.read");
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
		for (let a of Ke({
			bank: t,
			journals: n.journals.journalEntries,
			reconciliations: n.bankReconciliations.reconciliations,
			throughDate: r?.statementDate ?? e.endDate,
			statements: n.bankStatements?.lines ?? []
		})) i("BANK_RECONCILIATION_INVALID", `${t.name ?? t.id}: ${a}`, "/banking/workbench");
	} catch {
		i("BANK_RECONCILIATION_INVALID", `${t.name ?? t.id}: saved bank reconciliation evidence could not be verified.`, "/banking/workbench");
	}
	let o = n.bankReconciliations.reconciliations.filter((e) => e.status === "COMPLETED"), s = new Set(o.flatMap((e) => e.clearedTransactionIds)), c = n.journals.journalEntries, l = pe(c), u = /* @__PURE__ */ new Set([...l.originals, ...l.offsets]), d = new Map(c.flatMap((e) => e.lines.map((t) => [e.id + ":" + t.id, e])));
	for (let t of n.bankAccounts.bankAccounts) {
		let r = (n.bankStatements?.lines ?? []).filter((n) => n.bankAccountId === t.id && n.date <= e.endDate), a = r.filter((e) => e.status === "UNMATCHED").length, o = r.filter((e) => e.status === "MATCHED" || e.status === "POSTED"), l = o.filter((e) => e.ledgerIds.some((t) => !d.has(t) || u.has(d.get(t).id) || !ce(d.get(t), c, e.date))).length, f = o.filter((e) => e.ledgerIds.some((e) => !s.has(e))).length;
		a && i("BANK_STATEMENT_UNPROCESSED", `Process or exclude with a reason ${a} imported statement lines for ${t.name ?? t.id} through ${e.endDate}.`, "/banking/workbench"), l && i("BANK_STATEMENT_STALE", `Repair ${l} stale statement matches for ${t.name ?? t.id} before closing.`, "/banking/workbench"), f && i("BANK_STATEMENT_NOT_CLEARED", `Reconcile ${f} processed statement lines for ${t.name ?? t.id} before closing.`, "/banking/workbench");
	}
	let f = {
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: e.endDate
	}, p = [
		["AR", () => Zu({
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
		["AP", () => Fd({
			...f,
			suppliers: n.suppliers.suppliers,
			bills: n.supplierBills.supplierBills,
			payments: n.supplierPayments.supplierPayments,
			credits: n.supplierCredits.supplierCredits,
			creditAllocations: n.supplierCredits.allocations
		})],
		["INVENTORY", () => Hd({
			...f,
			costMovements: n.costMovements.movements
		})]
	];
	try {
		let t = Xd({
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
		let t = Zd({
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
	let m = n.journals.journalEntries.filter((t) => t.journalDate >= e.startDate && t.journalDate <= e.endDate), h = (e) => Math.round((e + 2 ** -52) * 100) / 100, _ = h(m.reduce((e, t) => e + t.totalDebit, 0)), v = h(m.reduce((e, t) => e + t.totalCredit, 0));
	return (!Number.isFinite(_) || !Number.isFinite(v) || _ !== v) && i("TRIAL_BALANCE", "Period journal debits and credits do not balance."), {
		blockers: r,
		journalCount: m.length,
		debit: _,
		credit: v
	};
}
//#endregion
//#region src/features/purchases/data/purchasePostingRecoveryAuthorization.ts
var Bb = null, Vb = {
	configureTrustedSession(e) {
		Bb = e;
	},
	clear() {
		Bb = null;
	},
	current() {
		return Bb?.() ?? null;
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
}, Hb = "htt.purchasePosting.manualRecoveryAudit.v1";
function Ub() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(Hb) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var Wb = Ub();
function Gb(e) {
	Wb.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(Hb, JSON.stringify(Wb));
	} catch {}
}
i("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return Wb.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = k.get(e);
			return Vb.canRecover() && t?.status === "RECOVERY_REQUIRED" && k.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = Vb.requireRecoveryPermission(), n = k.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!k.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				k.recover(e), Gb({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw Gb({
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
	snapshot: () => Wb,
	restore: (e) => {
		Wb.splice(0, Wb.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var Kb = !1;
function qb() {
	if (Kb || (Kb = !0, N.wasRestoredOnLoad())) return;
	let e = B.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) Ri.postInvoice(t), t.status === "VOID" && Ri.reverseInvoice(t);
	let t = Ai.getAll();
	for (let e of t) Ri.postPayment(e), e.status === "REVERSED" && Ri.reversePayment(e);
	let n = z.getAll();
	for (let e of n) e.status !== "DRAFT" && (Ri.postCreditNote(e), e.status === "VOID" && Ri.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function Jb() {
	let e = cd().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/sales/data/salesManualReviewService.ts
var Yb = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION"
]);
function Xb(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = h("business.command", {
			repository: "salesRecovery",
			method: "recordSalesManualReview",
			args: [e]
		});
		return Te(t.view), t.result;
	}
	if (e.businessRecordChecked !== !0 || e.originalGlChecked !== !0 || e.reversalGlChecked !== !0 || e.balancesChecked !== !0) throw Error("Business, original/reversal GL and balances must all be inspected.");
	if (typeof e.reference != "string" || e.reference.length > 500 || typeof e.summary != "string" || e.summary.length > 4e3) throw Error("Recovery evidence reference or summary exceeds the allowed length.");
	let t = O.list().find((t) => t.operationId === e.operationId);
	if (!t || !Yb.has(t.kind)) throw Error("Sales operation not found.");
	if (t.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return O.recordManualReview(e.operationId, e.reference, e.operator, e.summary);
}
//#endregion
//#region electron/security/businessEngine.ts
i("salesRecovery", {
	repository: {
		previewSourceRepair: pf,
		proposeSourceRepair: mf,
		executeSourceRepair: hf,
		withdrawSourceRepair: gf,
		inspectRecovery: ep,
		recordSalesManualReview: Xb,
		closeVerifiedSalesReview: yd,
		previewTargetedRepair: jf,
		proposeTargetedRepair: Mf,
		executeTargetedRepair: Nf
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
var Zb = t();
function Qb(e) {
	_t(zb, () => e()?.userId ?? ""), G.connect(e), Vb.configureTrustedSession(e), qb(), Jb();
}
//#endregion
export { St as assertPostingPeriod, Oc as classifyImportedBankLines, Su as dueRecurringCandidates, Qb as initialize, wu as prepareRecurringFailure, Zb as workspaceDefaults };
