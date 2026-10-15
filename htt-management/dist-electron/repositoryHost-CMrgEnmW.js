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
export { p as a, r as c, m as i, i as l, l as n, h as o, d as r, f as s, u as t, t as u };
