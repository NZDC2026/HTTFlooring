//#region src/features/security/rbac.ts
var e = [
	"sales.read",
	"sales.write",
	"sales.payment",
	"purchases.read",
	"purchases.receive",
	"purchases.bill",
	"purchases.void",
	"inventory.read",
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
		"accounting.periods",
		"accounting.reopen",
		"sales.read",
		"sales.payment",
		"purchases.read",
		"purchases.bill",
		"purchases.void",
		"inventory.read",
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
		"banking.read",
		"banking.reconcile",
		"sales.read",
		"purchases.read",
		"inventory.read",
		"accounting.read",
		"accounting.post",
		"audit.read"
	],
	SALES: [
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
	o = e, p(e.repositories, !1), a.forEach((e) => e.publish());
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
function p(e, t = !0) {
	for (let [n, r] of Object.entries(e)) {
		let e = a.get(n);
		if (!e) {
			if (t) throw Error(`Unknown repository in desktop snapshot: ${n}`);
			continue;
		}
		e.restore(structuredClone(r));
	}
}
function m(e, t) {
	let n = a.get(e), r = n && Object.hasOwn(n.commands, t) ? n.commands[t] : null;
	if (!r || typeof n?.repository[t] != "function") throw Error("Unknown or internal desktop business command.");
	return {
		permission: r,
		execute: (e) => n.repository[t].apply(n.repository, e)
	};
}
function h(e) {
	return Object.fromEntries([...a].map(([t, n]) => {
		let i = structuredClone(n.snapshot()), a = r(e, n.read), o = Array.isArray(i) ? [] : Object.fromEntries(Object.keys(i).map((e) => [e, []]));
		return [t, a ? i : o];
	}));
}
//#endregion
//#region src/lib/businessDate.ts
function g(e) {
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
function _(e, t = "Date") {
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e) || !Number.isFinite(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} must be a valid YYYY-MM-DD date.`);
}
//#endregion
//#region src/features/accounting/data/accountingPeriodValidation.ts
function v(e) {
	if (!Array.isArray(e)) throw Error("Invalid accounting periods.");
	let t = [...e].sort((e, t) => String(e?.startDate).localeCompare(String(t?.startDate)));
	for (let e = 0; e < t.length; e++) {
		let n = t[e];
		if (!n || typeof n.id != "string" || !n.id || typeof n.name != "string" || !n.name.trim() || !["OPEN", "CLOSED"].includes(n.status) || !Array.isArray(n.history) || !n.history.length) throw Error("Invalid accounting period record.");
		if (_(n.startDate), _(n.endDate), n.startDate > n.endDate || e && t[e - 1].endDate >= n.startDate) throw Error("Overlapping or invalid accounting periods.");
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
export { l as a, p as c, r as d, i as f, u as i, h as l, g as n, d as o, t as p, _ as r, m as s, v as t, f as u };
