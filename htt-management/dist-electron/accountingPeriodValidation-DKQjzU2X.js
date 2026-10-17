//#region src/features/security/rbac.ts
var e = [
	"documents.prepare",
	"sales.read",
	"sales.write",
	"sales.manage",
	"sales.payment",
	"purchases.read",
	"purchases.receive",
	"purchases.bill",
	"purchases.void",
	"inventory.read",
	"inventory.cost.read",
	"inventory.adjust",
	"accounting.read",
	"accounting.post",
	"accounting.periods",
	"accounting.reopen",
	"accounting.recover",
	"audit.read",
	"users.manage",
	"contacts.write",
	"purchases.write",
	"purchases.payment",
	"banking.read",
	"banking.write",
	"banking.reconcile"
], t = [
	"ADMIN",
	"FINANCE_ADMIN",
	"ACCOUNTANT",
	"SALES",
	"WAREHOUSE",
	"PURCHASING",
	"AUDITOR"
], n = {
	ADMIN: e,
	FINANCE_ADMIN: [
		"documents.prepare",
		"accounting.periods",
		"accounting.reopen",
		"sales.read",
		"sales.manage",
		"sales.payment",
		"purchases.read",
		"purchases.bill",
		"purchases.void",
		"inventory.read",
		"inventory.cost.read",
		"accounting.read",
		"accounting.post",
		"accounting.recover",
		"audit.read",
		"banking.read",
		"banking.write",
		"banking.reconcile",
		"purchases.payment",
		"purchases.write",
		"contacts.write"
	],
	ACCOUNTANT: [
		"documents.prepare",
		"banking.read",
		"banking.reconcile",
		"sales.read",
		"sales.manage",
		"purchases.read",
		"inventory.read",
		"inventory.cost.read",
		"accounting.read",
		"accounting.post",
		"audit.read"
	],
	SALES: [
		"documents.prepare",
		"contacts.write",
		"sales.read",
		"sales.write",
		"inventory.read"
	],
	WAREHOUSE: [
		"inventory.read",
		"inventory.adjust",
		"purchases.read",
		"purchases.receive"
	],
	PURCHASING: [
		"contacts.write",
		"purchases.write",
		"purchases.read",
		"purchases.receive",
		"purchases.bill",
		"inventory.read"
	],
	AUDITOR: [
		"banking.read",
		"sales.read",
		"purchases.read",
		"inventory.read",
		"inventory.cost.read",
		"accounting.read",
		"audit.read"
	]
};
function r(e, t) {
	return !!(e?.authenticated && e.userId.trim() && e.roles.some((e) => Object.prototype.hasOwnProperty.call(n, e) && n[e].includes(t)));
}
function i(e, t) {
	if (!r(e, t)) throw Error(`Permission denied: ${t}. Verified session required.`);
	return e;
}
//#endregion
//#region src/features/security/repositoryHost.ts
var a = /* @__PURE__ */ new Map(), o, s = () => globalThis.__HTT_MAIN_HOST__ === !0;
function c() {
	return typeof window > "u" ? void 0 : window.securityBridge;
}
function l(e, t) {
	let n = c();
	if (!n) throw Error("This operation requires the secure Electron desktop application.");
	let r = n.request(e, t);
	if (!r.ok) throw Error("error" in r ? r.error : "Desktop request failed.");
	return r.value;
}
function u(e) {
	if (typeof window < "u") try {
		for (let e of Object.keys(window.localStorage)) e.startsWith("htt") && window.localStorage.removeItem(e);
		for (let [t, n] of Object.entries(e.storage)) window.localStorage.setItem(t, n);
	} catch {}
	o = e, m(e.repositories, !1), a.forEach((e) => e.publish());
}
function d(e, t) {
	if (a.has(e)) throw Error(`Duplicate repository registration: ${e}`);
	if (a.set(e, t), !s()) {
		o && Object.hasOwn(o.repositories, e) && t.restore(structuredClone(o.repositories[e]));
		for (let [n, r] of Object.entries(t.commands)) Object.hasOwn(t.repository, n) && (t.repository[n] = (...t) => {
			if (!r) throw Error(`Internal repository method is not a desktop command: ${e}.${n}`);
			let i = l("business.command", {
				repository: e,
				method: n,
				args: t
			});
			return u(i.view), i.result;
		});
	}
}
function f() {
	return Object.fromEntries([...a].map(([e, t]) => [e, structuredClone(t.snapshot())]));
}
function p(e) {
	for (let [t, n] of Object.entries(e)) a.get(t)?.validate?.(structuredClone(n), e);
}
function m(e, t = !0) {
	for (let [n, r] of Object.entries(e)) {
		let e = a.get(n);
		if (!e) {
			if (t) throw Error(`Unknown repository in desktop snapshot: ${n}`);
			continue;
		}
		e.restore(structuredClone(r));
	}
}
function h(e, t) {
	let n = a.get(e), r = n && Object.hasOwn(n.commands, t) ? n.commands[t] : null;
	if (!r || typeof n?.repository[t] != "function") throw Error("Unknown or internal desktop business command.");
	return {
		permission: r,
		execute: (e) => n.repository[t].apply(n.repository, e)
	};
}
function g(e) {
	return Object.fromEntries([...a].map(([t, n]) => {
		let i = structuredClone(n.snapshot()), a = r(e, n.read), o = Array.isArray(i) ? [] : Object.fromEntries(Object.keys(i).map((e) => [e, []]));
		return [t, a ? i : o];
	}));
}
//#endregion
//#region src/features/business-workspace/configurationState.ts
var _ = {}, v = (e) => _["linked-accounts"]?.find((t) => t.status === "Active" && t.role === e)?.accountId;
function y(e) {
	e ??= S().gstCode;
	let t = _["tax-codes"]?.find((t) => t.status === "Active" && t.code === e);
	if (!t) {
		if (!_["tax-codes"] && e === "GST") return .1;
		throw Error(`Active tax code ${e} was not found.`);
	}
	return Number(t.rate) / 100;
}
function b(e) {
	let t = Date.parse(e.at.length === 10 ? e.at + "T00:00:00Z" : e.at), n = (_.promotions ?? []).filter((n) => n.status === "Active" && n.productId === e.productId && n.unitId === e.unitId && (!n.customerId || n.customerId === e.customerId) && Date.parse(n.starts) <= t && t < Date.parse(n.ends));
	if (!n.length) return {
		price: e.customerPrice,
		promotionId: void 0
	};
	let r = n.sort((e, t) => Number(t.priority) - Number(e.priority) || e.id.localeCompare(t.id))[0], i = r.policy === "Customer price first" && e.hasCustomerPrice ? e.customerPrice : r.policy === "Lowest eligible price" ? Math.min(e.customerPrice, Number(r.price)) : Number(r.price);
	return {
		price: i,
		promotionId: i === Number(r.price) ? r.id : void 0
	};
}
function x(e) {
	return (_["linked-accounts"] ?? []).some((t) => t.status === "Active" && t.accountId === e) || (_["tax-codes"] ?? []).some((t) => t.status === "Active" && (t.collected === e || t.paid === e));
}
function S() {
	return {
		companyName: "ABC Flooring Melbourne",
		currency: "AUD",
		timezone: "Pacific/Auckland",
		yearEnd: "06-30",
		gstCode: "GST",
		basis: "Exclusive",
		terms: "30",
		quotePrefix: "QU",
		orderPrefix: "SO",
		invoicePrefix: "INV",
		creditPrefix: "CN",
		purchasePrefix: "PO",
		billPrefix: "BILL",
		supplierCreditPrefix: "SC",
		nextQuote: "1",
		nextOrder: "1",
		nextInvoice: "1",
		nextCredit: "1",
		nextPurchase: "1",
		nextBill: "1",
		nextSupplierCredit: "1",
		..._.settings?.find((e) => e.section === "business" && e.status === "Active")
	};
}
function C(e, t, n) {
	let r = {
		QU: ["quotePrefix", "nextQuote"],
		SO: ["orderPrefix", "nextOrder"],
		INV: ["invoicePrefix", "nextInvoice"],
		CN: ["creditPrefix", "nextCredit"],
		PO: ["purchasePrefix", "nextPurchase"],
		BILL: ["billPrefix", "nextBill"],
		SC: ["supplierCreditPrefix", "nextSupplierCredit"]
	}[e];
	if (!r) {
		let r = Math.max(0, ...t.map((e) => Number(e.match(/-(\d+)$/)?.[1] ?? 0))) + 1;
		return `${e}-${n}-${String(r).padStart(4, "0")}`;
	}
	let i = S(), a = `${i[r[0]]}-${n}-`, o = Math.max(Number(i[r[1]]), 1, ...t.filter((e) => e.startsWith(a)).map((e) => Number(e.slice(a.length)) + 1).filter(Number.isFinite));
	if (!Number.isSafeInteger(o) || o > 999999999) throw Error("Document number sequence exhausted.");
	return `${a}${String(o).padStart(4, "0")}`;
}
function w(e) {
	let t = _["tax-codes"]?.find((t) => t.code === e && t.status === "Active");
	return {
		taxCode: e,
		taxRate: y(e),
		taxCollectedAccountId: t?.collected,
		taxPaidAccountId: t?.paid,
		taxReport: t?.report ?? e
	};
}
function T(e, t, n = S().basis) {
	return n === "Inclusive" ? Math.round(e / (1 + t) * 1e8) / 1e8 : e;
}
//#endregion
//#region src/lib/businessDate.ts
function E(e) {
	if (/^\d{4}-\d{2}-\d{2}$/.test(e)) return e;
	let t = new Date(e);
	if (!Number.isFinite(t.getTime())) throw Error("Invalid accounting timestamp.");
	let n = new Intl.DateTimeFormat("en-NZ", {
		timeZone: S().timezone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(t), r = (e) => n.find((t) => t.type === e)?.value;
	return `${r("year")}-${r("month")}-${r("day")}`;
}
function D(e, t = "Date") {
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e) || !Number.isFinite(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} must be a valid YYYY-MM-DD date.`);
}
//#endregion
//#region src/features/accounting/data/accountingPeriodValidation.ts
function O(e) {
	if (!Array.isArray(e)) throw Error("Invalid accounting periods.");
	let t = [...e].sort((e, t) => String(e?.startDate).localeCompare(String(t?.startDate)));
	for (let e = 0; e < t.length; e++) {
		let n = t[e];
		if (!n || typeof n.id != "string" || !n.id || typeof n.name != "string" || !n.name.trim() || !["OPEN", "CLOSED"].includes(n.status) || !Array.isArray(n.history) || !n.history.length) throw Error("Invalid accounting period record.");
		if (D(n.startDate), D(n.endDate), n.startDate > n.endDate || e && t[e - 1].endDate >= n.startDate) throw Error("Overlapping or invalid accounting periods.");
		for (let e of n.history) if (![
			"CREATE",
			"CLOSE",
			"REOPEN"
		].includes(e.action) || typeof e.actor != "string" || !e.actor || typeof e.reason != "string" || !Number.isFinite(Date.parse(e.at))) throw Error("Invalid accounting period history.");
		let r = "NEW";
		for (let e of n.history) if (e.action === "CREATE" && r === "NEW") r = "OPEN";
		else if (e.action === "CLOSE" && r === "OPEN") {
			if (!e.checks || !Number.isInteger(e.checks.journalCount) || e.checks.journalCount < 0 || !Number.isFinite(e.checks.debit) || !Number.isFinite(e.checks.credit) || e.checks.debit !== e.checks.credit) throw Error("Invalid close evidence.");
			r = "CLOSED";
		} else if (e.action === "REOPEN" && r === "CLOSED") r = "OPEN";
		else throw Error("Invalid period history sequence.");
		if (r !== n.status) throw Error("Period status does not match history.");
	}
}
//#endregion
export { t as C, i as S, m as _, S as a, p as b, T as c, b as d, w as f, h as g, d as h, y as i, x as l, l as m, E as n, _ as o, u as p, D as r, C as s, O as t, v as u, g as v, r as x, f as y };
