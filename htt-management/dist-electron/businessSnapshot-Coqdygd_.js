import { closeSync as e, constants as t, fstatSync as n, fsyncSync as r, openSync as i, readSync as a, renameSync as o, unlinkSync as s, writeFileSync as c } from "node:fs";
import { createHash as l, randomUUID as u } from "node:crypto";
import { basename as d, dirname as f, extname as p, join as m } from "node:path";
//#region src/features/document-recycle/recycleState.ts
var ee = [
	"Quote",
	"Purchase order",
	"Sales order draft",
	"Invoice draft",
	"Expense bill draft"
], te = {
	Quote: ["sales", "quotes"],
	"Purchase order": ["purchaseOrders", "purchaseOrders"],
	"Sales order draft": ["managedSalesDocuments", "drafts"],
	"Invoice draft": ["managedSalesDocuments", "drafts"],
	"Expense bill draft": ["expenseBillDrafts", "drafts"]
}, h = [], ne = () => h, re = (e) => {
	h = e;
}, ie = (e) => ["Trashed", "Purged"].includes(h.findLast((t) => t.recordId === e)?.action ?? ""), ae = () => h.flatMap((e) => e.purge?.reservedNumber ? [e.purge.reservedNumber] : []), oe = (e) => h.some((t) => t.purge?.creationOperationId === e);
function se(e, t) {
	if (![
		"sales",
		"purchaseOrders",
		"managedSalesDocuments",
		"expenseBillDrafts"
	].includes(e)) return;
	let n = (e) => typeof e == "string" ? ie(e) : Array.isArray(e) ? e.some(n) : !!e && typeof e == "object" && Object.values(e).some(n);
	if (n(t)) throw Error("This document is in the recycle bin. Recover it before using it.");
}
var ce = /* @__PURE__ */ new WeakMap();
function le(e) {
	let t = ce.get(e);
	if (t?.history === h) return t.rows;
	let n = e.filter((e) => !ie(e.id));
	return ce.set(e, {
		history: h,
		rows: n
	}), n;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/util.js
function ue(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function de(e, t = "|") {
	return e.map((e) => ke(e)).join(t);
}
function fe(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
var pe = class {
	constructor(e) {
		this._getter = e, this._value = void 0;
	}
	get value() {
		let e = this._getter;
		return e !== void 0 && (this._value = e(), this._getter = void 0), this._value;
	}
};
function me(e) {
	return new pe(e);
}
function he(e) {
	return e == null;
}
function ge(e) {
	let t = +!!e.startsWith("^"), n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function _e(e, t) {
	let n = e / t, r = Math.round(n), i = 4 * 2 ** -52 * Math.max(Math.abs(n), 1);
	return Math.abs(n - r) < i ? 0 : n - r;
}
function g(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function ve(e) {
	let t = Object.getOwnPropertyDescriptor(e, "shape");
	return t?.get ? t.get.raw : t?.value;
}
function _(e) {
	return ve(e._zod.def) ?? e._zod.def.shape;
}
function ye(e, t, n) {
	Object.defineProperty(e, t, {
		get() {
			let e = n();
			return g(this, t, e), e;
		},
		enumerable: !0,
		configurable: !0
	});
}
function be(e, t, n) {
	t in e ? g(e, t, n) : e[t] = n;
}
function v(e, t, n, r) {
	let i = _(t);
	for (let a of n) {
		let n = Object.getOwnPropertyDescriptor(i, a);
		n.enumerable && (n.get ? ye(e, a, () => {
			let e = t._zod.def.shape[a];
			return r ? r(e, a) : e;
		}) : be(e, a, r ? r(n.value, a) : n.value));
	}
}
function xe(e, t) {
	for (let n of Reflect.ownKeys(t)) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.enumerable && (r.get ? ye(e, n, () => t[n]) : be(e, n, r.value));
	}
}
function y(...e) {
	let t = {};
	for (let n of e) {
		let e = Object.getOwnPropertyDescriptors(n);
		Object.assign(t, e);
	}
	return Object.defineProperties({}, t);
}
function Se(e) {
	return JSON.stringify(e);
}
function Ce(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var we = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function Te(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var Ee = /* @__PURE__*/ me(() => {
	if (M.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function b(e) {
	if (Te(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return Te(n) !== !1 && Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") !== !1;
}
function De(e) {
	return b(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var Oe = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function x(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function S(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n?.parent) && (r._zod.parent = e), r;
}
function C(e) {
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
function ke(e) {
	return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function Ae(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
var je = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, Me = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function Ne(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	let i = {};
	return v(i, e, Pe(e, t)), S(e, y(n, {
		shape: i,
		checks: []
	}));
}
function Pe(e, t) {
	let n = _(e), r = [];
	for (let e of Reflect.ownKeys(t)) {
		if (!Object.getOwnPropertyDescriptor(n, e)?.enumerable) throw Error(`Unrecognized key: "${String(e)}"`);
		t[e] && r.push(e);
	}
	return r;
}
function Fe(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	let i = new Set(Pe(e, t)), a = {};
	return v(a, e, Reflect.ownKeys(_(e)).filter((e) => !i.has(e))), S(e, y(n, {
		shape: a,
		checks: []
	}));
}
function Ie(e, t) {
	if (!b(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = _(e);
		for (let e of Reflect.ownKeys(t)) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return S(e, y(e._zod.def, { shape: Le(e, t) }));
}
function Le(e, t) {
	let n = {};
	return v(n, e, Reflect.ownKeys(_(e))), xe(n, t), n;
}
function Re(e, t) {
	if (!b(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return S(e, y(e._zod.def, { shape: Le(e, t) }));
}
function ze(e, t) {
	if (!t?._zod?.def) throw Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (e._zod.def.checks?.length) throw Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	let n = {};
	return v(n, e, Reflect.ownKeys(_(e))), v(n, t, Reflect.ownKeys(_(t))), S(e, y(e._zod.def, {
		shape: n,
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: t._zod.def.checks ?? []
	}));
}
function Be(e, t, n, r = "partial") {
	let i = t._zod.def.checks;
	if (i && i.length > 0) throw Error(`.${r}() cannot be used on object schemas containing refinements`);
	let a = n ? new Set(Pe(t, n)) : void 0, o = {};
	return v(o, t, Reflect.ownKeys(_(t)), e && ((t, n) => a && !a.has(n) ? t : new e({
		type: "optional",
		innerType: t
	}))), S(t, y(t._zod.def, {
		shape: o,
		checks: []
	}));
}
function Ve(e, t, n) {
	let r = n ? new Set(Pe(t, n)) : void 0, i = {};
	return v(i, t, Reflect.ownKeys(_(t)), (t, n) => r && !r.has(n) ? t : new e({
		type: "nonoptional",
		innerType: t
	})), S(t, y(t._zod.def, { shape: i }));
}
function w(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function He(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
	return !1;
}
function T(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function Ue(e) {
	return typeof e == "string" ? e : e?.message;
}
function We(e, t, n) {
	var r;
	for (let i = t; i < e.length; i++) (r = e[i]).schema ?? (r.schema = n);
}
function E(e, t, n) {
	var r;
	let i = e.inst?._zod?.traits;
	i?.has("$ZodType") && (i.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
	let a = e.schema === e.inst ? void 0 : e.schema?._zod.def?.error, o = e.message ? e.message : Ue(e.inst?._zod.def?.error?.(e)) ?? Ue(a?.(e)) ?? Ue(t?.error?.(e)) ?? Ue(n.customError?.(e)) ?? Ue(n.localeError?.(e)) ?? "Invalid input", s = {};
	for (let t of Object.keys(e)) t !== "inst" && t !== "schema" && t !== "continue" && t !== "input" && t !== "__proto__" && (s[t] = e[t]);
	return s.path ??= [], s.message = o, t?.reportInput && (s.input = e.input), s;
}
var Ge = /[\uD800-\uDBFF]/;
function Ke(e) {
	let t = e.length;
	if (!Ge.test(e)) return t;
	let n = t;
	for (let r = 0; r < t - 1; r++) (e.charCodeAt(r) & 64512) == 55296 && (e.charCodeAt(r + 1) & 64512) == 56320 && (n--, r++);
	return n;
}
function qe(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Je(e) {
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
function Ye(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
function Xe(e, t) {
	for (let n in t) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.get ? Object.defineProperty(e, n, {
			...r,
			enumerable: !1
		}) : $e(e, n, r.value);
	}
}
function D(e, t, n, r = !0) {
	return Object.defineProperty(e, t, {
		configurable: !0,
		writable: !0,
		enumerable: r,
		value: n
	}), n;
}
function Ze(e, t, n) {
	return D(e, t, n, !1);
}
function Qe(e, t) {
	for (let n in e) {
		let r = e[n];
		Object.defineProperty(t, n, {
			configurable: !0,
			enumerable: !0,
			get() {
				return D(this, n, r(this));
			},
			set(e) {
				D(this, n, e);
			}
		});
	}
	return t;
}
function $e(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		get() {
			return this == null ? n : D(this, t, n.bind(this));
		},
		set(e) {
			D(this, t, e);
		}
	});
}
function et(e, t) {
	let n = Object.getPrototypeOf(e);
	return t in n ? void 0 : n;
}
var tt, O = !1, nt = {
	configurable: !0,
	get() {
		O = !0;
	}
};
function k(e, t, n) {
	let r = Object.getPrototypeOf(e._zod);
	if (t in r && tt !== e._zod) {
		tt = void 0;
		return;
	}
	tt = e._zod, Object.defineProperty(r, t, {
		configurable: !0,
		get() {
			Object.defineProperty(this, t, nt);
			let e = O;
			O = !1;
			try {
				let r = n(this);
				return O ? delete this[t] : Object.defineProperty(this, t, {
					configurable: !0,
					writable: !0,
					value: r
				}), O ||= e, r;
			} catch (n) {
				throw delete this[t], O ||= e, n;
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
function rt(e, t, n, r) {
	let i = et(e, t);
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
var it = "~constantCatch";
function at(e) {
	let t = () => e;
	return t[it] = !0, t;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/core.js
var ot, st = {
	value: void 0,
	enumerable: !1
}, ct = "captureStackTrace" in Error ? Error : null;
function lt(e) {
	let t = ct;
	if (t) {
		let n = t.stackTraceLimit;
		if (typeof n == "number") {
			try {
				t.stackTraceLimit = 0;
			} catch {
				return ct = null, new e();
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
function A(e, t, n, r) {
	let i = {};
	function a(e) {
		this.def = e, this.constr = d, this.traits = /* @__PURE__ */ new Set();
	}
	a.prototype = i;
	let o = n, s = o && /* @__PURE__ */ new WeakSet();
	function c(n, r) {
		if (!n._zod) {
			st.value = new a(r);
			try {
				Object.defineProperty(n, "_zod", st);
			} finally {
				st.value = void 0;
			}
		} else if (n._zod.traits.has(e)) return;
		if (n._zod.traits.add(e), t(n, r), s) {
			let e = Object.getPrototypeOf(n), t = n._zod.constr.prototype, r = e;
			for (; r && r !== t;) r = Object.getPrototypeOf(r);
			let i = r ?? e;
			s.has(i) || (s.add(i), Xe(i, o));
		}
		let i = d.prototype;
		for (let e in i) Object.prototype.hasOwnProperty.call(i, e) && (e in n || (n[e] = i[e].bind(n)));
	}
	let l = r?.Parent ?? Object;
	class u extends l {}
	Object.defineProperty(u, "name", { value: e });
	function d(e) {
		let t = r?.Parent ? lt(u) : this;
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
var j = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, ut = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(ot = globalThis).__zod_globalConfig ?? (ot.__zod_globalConfig = {});
var M = globalThis.__zod_globalConfig;
function N(e) {
	return e && Object.assign(M, e), M;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/errors.js
function dt() {
	let e = this._zod;
	return e.message ??= JSON.stringify(e.def, fe, 2), e.message;
}
function ft(e) {
	this._zod.message = e;
}
var pt = {
	get: dt,
	set: ft,
	enumerable: !0,
	configurable: !0
}, mt = {
	value: void 0,
	enumerable: !1
}, ht = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), gt = (e, t) => {
	e.name = "$ZodError", mt.value = t, Object.defineProperty(e, "issues", mt), mt.value = void 0, Object.defineProperty(e, "message", pt);
	let n = Object.getPrototypeOf(e);
	ht.has(n) || (ht.add(n), Object.defineProperty(n, "toString", {
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
}, _t = A("$ZodError", gt);
A("$ZodError", gt, void 0, { Parent: Error });
function vt(e, t, n) {
	return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, {
		value: n(),
		writable: !0,
		enumerable: !0,
		configurable: !0
	}) : e[t] = n()), e[t];
}
function yt(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? vt(n, i.path[0], () => []).push(t(i)) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function bt(e, t = (e) => e.message) {
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
function xt(e, t) {
	return {
		callee: t?.callee ?? e,
		Err: t?.Err
	};
}
var St = (e) => {
	let t = (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !1
		} : { async: !1 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise) throw new j();
		if (s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => E(e, o, N())));
			throw we(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, Ct = (e) => {
	let t = async (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !0
		} : { async: !0 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise && (s = await s), s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => E(e, o, N())));
			throw we(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, wt = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new j();
	return a.issues.length ? Tt(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
};
function Tt(e, t, n) {
	let r;
	return {
		success: !1,
		get error() {
			return r || (r = new e(t.map((e) => E(e, n, N()))), t = void 0, n = void 0), r;
		},
		set error(e) {
			r = e, t = void 0, n = void 0;
		}
	};
}
var Et = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		async: !0
	} : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? Tt(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
}, Dt = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), Ot = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), kt = ((e, t, n) => {
	let r = e._zod.bag.validator;
	if (r !== void 0) {
		if (r(t) !== Dt) return !0;
		if (r.definite === !0 && n === void 0) return !1;
	}
	return At(e, t, n);
});
function At(e, t, n) {
	let r = n ? {
		...n,
		async: !1,
		abortEarly: !0
	} : {
		async: !1,
		abortEarly: !0
	}, i = e._zod.bag.fallbackRun, a;
	if (i ? (r[Ot] = !0, a = i({
		value: t,
		issues: []
	}, r)) : a = e._zod.run({
		value: t,
		issues: []
	}, r), a instanceof Promise) throw new j();
	return a.issues.length === 0;
}
var jt = async (e, t, n) => {
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
}, Mt = (e) => {
	let t = St(e), n = (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return t(e, r, o, xt(n, a));
	};
	return n;
}, Nt = (e) => {
	let t = St(e), n = (e, r, i, a) => t(e, r, i, xt(n, a));
	return n;
}, Pt = (e) => {
	let t = Ct(e), n = async (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return await t(e, r, o, xt(n, a));
	};
	return n;
}, Ft = (e) => {
	let t = Ct(e), n = async (e, r, i, a) => await t(e, r, i, xt(n, a));
	return n;
}, It = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return wt(e)(t, n, i);
}, Lt = (e) => (t, n, r) => wt(e)(t, n, r), Rt = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Et(e)(t, n, i);
}, zt = (e) => async (t, n, r) => Et(e)(t, n, r), Bt = /^[cC][0-9a-z]{6,}$/, Vt = /^[0-9a-z]+$/, Ht = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, Ut = /^[0-9a-vA-V]{20}$/, Wt = /^[A-Za-z0-9]{27}$/, Gt = /^[a-zA-Z0-9_-]{21}$/;
function Kt(e) {
	return RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
var qt = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Jt = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Yt = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, Xt = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Zt = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function Qt() {
	return new RegExp(Zt, "u");
}
var $t = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, en = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, tn = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, nn = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, rn = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, an = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, on = /^https?$/, sn = /^\+[1-9]\d{6,14}$/, cn = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function ln(e) {
	return RegExp(`^${e}$`);
}
var un = /*@__PURE__*/ ln(cn);
function dn(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function fn(e) {
	return RegExp(`^${dn(e)}$`);
}
function pn(e) {
	let t = ["Z"];
	e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let n = `${dn({
		precision: e.precision,
		seconds: !0
	})}(?:${t.join("|")})`, r = e.local ? `${n}|${dn({ precision: e.precision })}` : n;
	return RegExp(`^${cn}T(?:${r})$`);
}
var mn = /^[\s\S]{0,}$/, hn = /^-?\d+$/, gn = /^-?\d+(?:\.\d+)?$/, _n = /^(?:true|false)$/i, vn = /^[^A-Z]*$/, yn = /^[^a-z]*$/, P = /*@__PURE__*/ A("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), bn = (e) => {
	let t = e.value;
	return !he(t) && t.length !== void 0;
}, xn = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, Sn = /*@__PURE__*/ A("$ZodCheckLessThan", (e, t) => {
	P.init(e, t);
	let n = xn[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: xn[typeof r.value] ?? n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Cn = /*@__PURE__*/ A("$ZodCheckGreaterThan", (e, t) => {
	P.init(e, t);
	let n = xn[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: xn[typeof r.value] ?? n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), wn = /*@__PURE__*/ A("$ZodCheckMultipleOf", (e, t) => {
	P.init(e, t), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? t.value !== BigInt(0) && n.value % t.value === BigInt(0) : _e(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Tn = /*@__PURE__*/ A("$ZodCheckNumberFormat", (e, t) => {
	P.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = je[t.format];
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
}), En = /*@__PURE__*/ A("$ZodCheckMaxLength", (e, t) => {
	var n;
	P.init(e, t), (n = e._zod.def).when ?? (n.when = bn), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i > t.maximum ? Ke(r) : i) <= t.maximum) return;
		let a = qe(r);
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
}), Dn = /*@__PURE__*/ A("$ZodCheckMinLength", (e, t) => {
	var n;
	P.init(e, t), (n = e._zod.def).when ?? (n.when = bn), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i >= t.minimum && i < t.minimum * 2 ? Ke(r) : i) >= t.minimum) return;
		let a = qe(r);
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
}), On = /*@__PURE__*/ A("$ZodCheckLengthEquals", (e, t) => {
	var n;
	P.init(e, t), (n = e._zod.def).when ?? (n.when = bn), e._zod.check = (n) => {
		let r = n.value, i = r.length, a = typeof r == "string" && i >= t.length && i <= t.length * 2 ? Ke(r) : i;
		if (a === t.length) return;
		let o = qe(r), s = a > t.length;
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
}), kn = /*@__PURE__*/ A("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	P.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
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
}), An = /*@__PURE__*/ A("$ZodCheckRegex", (e, t) => {
	kn.init(e, t), e._zod.check = (n) => {
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
}), jn = /*@__PURE__*/ A("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= vn, kn.init(e, t);
}), Mn = /*@__PURE__*/ A("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= yn, kn.init(e, t);
}), Nn = /*@__PURE__*/ A("$ZodCheckIncludes", (e, t) => {
	P.init(e, t);
	let n = x(t.includes);
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
}), Pn = /*@__PURE__*/ A("$ZodCheckStartsWith", (e, t) => {
	P.init(e, t);
	let n = RegExp(`^${x(t.prefix)}.*`);
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
}), Fn = /*@__PURE__*/ A("$ZodCheckEndsWith", (e, t) => {
	P.init(e, t);
	let n = RegExp(`.*${x(t.suffix)}$`);
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
}), In = /*@__PURE__*/ A("$ZodCheckOverwrite", (e, t) => {
	P.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), Ln = class {
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
}, Rn = {
	major: 4,
	minor: 6,
	patch: 5
}, F = /*@__PURE__*/ A("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Rn;
	let r = e._zod.def.checks, i = e._zod.traits.has("$ZodCheck") ? [e, ...r ?? []] : r?.length ? [...r] : [];
	for (let t of i) for (let n of t._zod.onattach) n(e);
	if (i.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (t, n, r) => {
			if (t.memo) return t;
			let i = w(t), a;
			for (let o of n) {
				if (o._zod.def.when) {
					if (He(t) || !o._zod.def.when(t)) continue;
				} else if (i) continue;
				let n = t.issues.length, s = o._zod.check(t);
				if (s instanceof Promise && r?.async === !1) throw new j();
				if (a || s instanceof Promise) a = (a ?? Promise.resolve()).then(async () => {
					await s, t.issues.length !== n && (We(t.issues, n, e), i ||= w(t, n));
				});
				else {
					if (t.issues.length === n) continue;
					We(t.issues, n, e), i ||= w(t, n);
				}
			}
			return a ? a.then(() => t) : t;
		}, n = (n, r, a) => {
			if (w(n)) return n.aborted = !0, n;
			let o = t(r, i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new j();
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
				if (a.async === !1) throw new j();
				return o.then((e) => t(e, i, a));
			}
			return t(o, i, a);
		};
	}
}, {
	get "~standard"() {
		return Ze(this, "~standard", Vn(this));
	},
	set "~standard"(e) {
		D(this, "~standard", e);
	}
}), zn = (e, t) => e.issues.length ? { issues: e.issues.map((e) => E(e, t, N())) } : { value: e.value };
async function Bn(e, t) {
	let n = { async: !0 };
	return zn(await e._zod.run({
		value: t,
		issues: []
	}, n), n);
}
function Vn(e) {
	return {
		validate: (t) => {
			let n = { async: !1 };
			try {
				let r = e._zod.run({
					value: t,
					issues: []
				}, n);
				if (!(r instanceof Promise)) return zn(r, n);
			} catch {}
			return Bn(e, t);
		},
		vendor: "zod",
		version: 1
	};
}
var Hn = /*@__PURE__*/ A("$ZodString", (e, t) => {
	F.init(e, t), e._zod.pattern = t.pattern ?? mn, e._zod.parse = (n, r) => {
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
}), I = /*@__PURE__*/ A("$ZodStringFormat", (e, t) => {
	kn.init(e, t), Hn.init(e, t);
}), Un = /*@__PURE__*/ A("$ZodGUID", (e, t) => {
	t.pattern ??= Jt, I.init(e, t);
}), Wn = /*@__PURE__*/ A("$ZodUUID", (e, t) => {
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
		t.pattern ??= Yt(e);
	} else t.pattern ??= Yt();
	I.init(e, t);
}), Gn = /*@__PURE__*/ A("$ZodEmail", (e, t) => {
	t.pattern ??= Xt, I.init(e, t);
});
function Kn(e) {
	try {
		return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
	} catch {
		return !1;
	}
}
function qn(e, t) {
	return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? Kn(e) || 2 : Jn(e, t);
}
function Jn(e, t) {
	if (!t.normalize && t.protocol?.source === on.source && !/^https?:\/\//i.test(e)) return 1;
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
var Yn = /[\t\n\r]/g;
function Xn(e) {
	return e.replace(Yn, "");
}
function Zn(e, t) {
	return t.lastIndex = 0, t.test(e.hostname);
}
function Qn(e, t) {
	return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
var $n = /*@__PURE__*/ A("$ZodURL", (e, t) => {
	I.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim(), i = qn(r, t);
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
				n.value = Xn(r);
				return;
			}
			t.hostname && !Zn(i, t.hostname) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), t.protocol && !Qn(i, t.protocol) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), n.value = t.normalize ? i.href : Xn(r);
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
}), er = /*@__PURE__*/ A("$ZodEmoji", (e, t) => {
	t.pattern ??= Qt(), I.init(e, t);
}), tr = /*@__PURE__*/ A("$ZodNanoID", (e, t) => {
	if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1)) throw Error(`Invalid nanoid length: ${t.length}`);
	t.pattern ??= t.length === void 0 ? Gt : Kt(t.length), I.init(e, t);
}), nr = /*@__PURE__*/ A("$ZodCUID", (e, t) => {
	t.pattern ??= Bt, I.init(e, t);
}), rr = /*@__PURE__*/ A("$ZodCUID2", (e, t) => {
	t.pattern ??= Vt, I.init(e, t);
}), ir = /*@__PURE__*/ A("$ZodULID", (e, t) => {
	t.pattern ??= Ht, I.init(e, t);
}), ar = /*@__PURE__*/ A("$ZodXID", (e, t) => {
	t.pattern ??= Ut, I.init(e, t);
}), or = /*@__PURE__*/ A("$ZodKSUID", (e, t) => {
	t.pattern ??= Wt, I.init(e, t);
}), sr = /*@__PURE__*/ A("$ZodISODateTime", (e, t) => {
	t.pattern ??= pn(t), I.init(e, t);
}), cr = /*@__PURE__*/ A("$ZodISODate", (e, t) => {
	t.pattern ??= un, I.init(e, t);
}), lr = /*@__PURE__*/ A("$ZodISOTime", (e, t) => {
	t.pattern ??= fn(t), I.init(e, t);
}), ur = /*@__PURE__*/ A("$ZodISODuration", (e, t) => {
	t.pattern ??= qt, I.init(e, t);
}), dr = /*@__PURE__*/ A("$ZodIPv4", (e, t) => {
	t.pattern ??= $t, I.init(e, t);
}), fr = /^[0-9a-fA-F:.]+$/;
function pr(e) {
	return fr.test(e) ? Kn(`http://[${e}]`) : !1;
}
var mr = /*@__PURE__*/ A("$ZodIPv6", (e, t) => {
	t.pattern ??= en, I.init(e, t), e._zod.check = (n) => {
		pr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), hr = /*@__PURE__*/ A("$ZodCIDRv4", (e, t) => {
	t.pattern ??= tn, I.init(e, t);
});
function gr(e) {
	let t = e.split("/");
	if (t.length !== 2) return !1;
	let [n, r] = t;
	if (!r) return !1;
	let i = Number(r);
	return `${i}` !== r || i < 0 || i > 128 ? !1 : pr(n);
}
var _r = /*@__PURE__*/ A("$ZodCIDRv6", (e, t) => {
	t.pattern ??= nn, I.init(e, t), e._zod.check = (n) => {
		gr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function vr(e) {
	if (e === "") return !0;
	if (/\s/.test(e) || e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var yr = /^[0-9a-zA-Z+/]*={0,2}$/, br = /*@__PURE__*/ A("$ZodBase64", (e, t) => {
	t.pattern ??= yr, I.init(e, t), e._zod.check = (n) => {
		vr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), xr = /^[A-Za-z0-9_-]*$/;
function Sr(e) {
	if (!xr.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return vr(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var Cr = /*@__PURE__*/ A("$ZodBase64URL", (e, t) => {
	t.pattern ??= xr, I.init(e, t), e._zod.check = (n) => {
		Sr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), wr = /*@__PURE__*/ A("$ZodE164", (e, t) => {
	t.pattern ??= sn, I.init(e, t);
});
function Tr(e, t = null) {
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
var Er = /*@__PURE__*/ A("$ZodJWT", (e, t) => {
	I.init(e, t), e._zod.check = (n) => {
		Tr(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Dr = /*@__PURE__*/ A("$ZodNumber", (e, t) => {
	F.init(e, t), e._zod.pattern = gn, e._zod.parse = (n, r) => {
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
}), Or = /*@__PURE__*/ A("$ZodNumberFormat", (e, t) => {
	Tn.init(e, t), Dr.init(e, t);
}), kr = /*@__PURE__*/ A("$ZodBoolean", (e, t) => {
	F.init(e, t), e._zod.pattern = _n, e._zod.parse = (n, r) => {
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
}), Ar = /*@__PURE__*/ A("$ZodUnknown", (e, t) => {
	F.init(e, t), e._zod.parse = (e) => e;
}), jr = /*@__PURE__*/ A("$ZodNever", (e, t) => {
	F.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function Mr(e, t, n) {
	e.issues.length && t.issues.push(...T(n, e.issues)), t.value[n] = e.value;
}
var Nr = /*@__PURE__*/ A("$ZodArray", (e, t) => {
	F.init(e, t);
	let n = M.memoizer;
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
			if (c instanceof Promise) o.push(c.then((t) => Mr(t, r, e)));
			else if (Mr(c, r, e), s && c.issues.length !== 0 && w(c)) break;
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	};
});
function Pr(e, t, n, r, i, a) {
	let o = n in r, s = a === "optional";
	if (o || !s || i !== "optional") {
		if (e.issues.length) {
			if (i !== void 0 && s && !o) return;
			t.issues.push(...T(n, e.issues));
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
var Fr = [];
function Ir(e) {
	let t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : Fr, i = r.length ? [...t, ...r] : t;
	for (let t of i) if (!e.shape?.[t]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${String(t)}": expected a Zod schema`);
	let a = Ae(e.shape);
	return {
		...e,
		allKeys: i,
		symbolKeys: r,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(a)
	};
}
function Lr(e, t, n, r, i, a, o) {
	let s = [], c = i.keySet, l = i.catchall._zod, u = l.def.type, d = l.optin, f = l.optout, p = 0;
	for (let i in t) {
		if (o && n.issues.length !== p) {
			if (w(n, p)) break;
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
		a instanceof Promise ? e.push(a.then((e) => Pr(e, n, i, t, d, f))) : Pr(a, n, i, t, d, f);
	}
	return s.length && n.issues.push({
		code: "unrecognized_keys",
		keys: s,
		input: t,
		inst: a,
		continue: !0
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var Rr = /*@__PURE__*/ A("$ZodObject", (e, t) => {
	F.init(e, t);
	let n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
	if (r) {
		let e = () => {
			let n = { ...r };
			return Object.defineProperty(t, "shape", { value: n }), e.raw = n, n;
		};
		e.raw = r, Object.defineProperty(t, "shape", { get: e });
	}
	let i = me(() => Ir(t));
	k(e, "propValues", (e) => {
		let t = e.def.shape, n = {};
		for (let e in t) {
			let r = t[e]._zod;
			if (r.values) {
				Object.prototype.hasOwnProperty.call(n, e) || g(n, e, /* @__PURE__ */ new Set());
				for (let t of r.values) n[e].add(t);
				r.optin !== void 0 && n[e].add(void 0);
			}
		}
		return n;
	});
	let a = Te, o = t.catchall, s, c = M.memoizer;
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
				if (w(t, f)) break;
				f = t.issues.length;
			}
			if (e === "__proto__") continue;
			let i = u[e], a = i._zod.optin, o = i._zod.optout, s = i._zod.run({
				value: r[e],
				issues: []
			}, n);
			s instanceof Promise ? l.push(s.then((n) => Pr(n, t, e, r, a, o))) : Pr(s, t, e, r, a, o);
		}
		return o ? Lr(l, r, t, n, i.value, e, d === !0) : l.length ? Promise.all(l).then(() => t) : t;
	};
}), zr = /*@__PURE__*/ A("$ZodObjectJIT", (e, t) => {
	Rr.init(e, t);
	let n = e._zod.parse, r = me(() => Ir(t)), i = M.memoizer, a = (t) => {
		let n = r.value, a = n.symbolKeys, o = new Ln(["payload", "ctx"], {
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
			let n = l[e], r = typeof e == "symbol" ? `syms[${a.indexOf(e)}]` : Se(e), i = `${r} in input`, u = t[e], d = u?._zod?.optin, f = d !== void 0, p = u?._zod?.optout === "optional";
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
	}, o, s = Te, c = !M.jitless, l = c && Ee.value, u = t.catchall, d;
	e._zod.parse = (i, f) => {
		d ??= r.value;
		let p = i.value;
		return s(p) ? c && l && f?.async === !1 && f.jitless !== !0 ? (o ||= a(t.shape), i = o(i, f), u ? Lr([], p, i, f, d, e, f?.abortEarly === !0) : i) : n(i, f) : (i.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), i);
	};
});
function Br(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !w(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => E(e, r, N())))
	}), t);
}
var Vr = /*@__PURE__*/ A("$ZodUnion", (e, t) => {
	F.init(e, t), k(e, "optin", (e) => e.def.options.some((e) => e._zod.optin === "defaulted") ? "defaulted" : e.def.options.some((e) => e._zod.optin !== void 0) ? "optional" : void 0), k(e, "optout", (e) => e.def.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), k(e, "values", (e) => {
		if (e.def.options.every((e) => e._zod.values)) return new Set(e.def.options.flatMap((e) => Array.from(e._zod.values)));
	}), k(e, "pattern", (e) => {
		if (e.def.options.every((e) => e._zod.pattern)) {
			let t = e.def.options.map((e) => e._zod.pattern);
			return RegExp(`^(${t.map((e) => ge(e.source)).join("|")})$`);
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
		return a ? Promise.all(o).then((t) => Br(t, r, e, i)) : Br(o, r, e, i);
	};
}), Hr = /*@__PURE__*/ A("$ZodIntersection", (e, t) => {
	F.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => Wr(e, t, n)) : Wr(e, i, a);
	};
});
function Ur(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (b(e) && b(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		Object.prototype.hasOwnProperty.call(i, "__proto__") && delete i.__proto__;
		for (let n of r) {
			if (n === "__proto__") continue;
			let r = Ur(e[n], t[n]);
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
			let i = e[r], a = t[r], o = Ur(i, a);
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
function Wr(e, t, n) {
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
	let c = Ur(t.value, n.value);
	if (!c.valid) {
		if (w(e)) return e;
		throw Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
	}
	return e.value = c.data, e;
}
var Gr = /*@__PURE__*/ A("$ZodRecord", (e, t) => {
	F.init(e, t);
	let n = M.memoizer;
	n?.attach(e), e._zod.parse = (r, i) => {
		let a = r.value;
		if (!b(a)) return r.issues.push({
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
						issues: s.issues.map((e) => E(e, i, N())),
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
					e.issues.length && r.issues.push(...T(n, e.issues)), r.value[l] = e.value;
				})) : (u.issues.length && r.issues.push(...T(n, u.issues)), r.value[l] = u.value);
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
				if (typeof n == "string" && gn.test(n) && l.issues.length) {
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
						issues: l.issues.map((e) => E(e, i, N())),
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
					e.issues.length && r.issues.push(...T(n, e.issues)), r.value[u] = e.value;
				})) : (d.issues.length && r.issues.push(...T(n, d.issues)), r.value[u] = d.value);
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
}), Kr = /*@__PURE__*/ A("$ZodEnum", (e, t) => {
	F.init(e, t);
	let n = ue(t.entries), r = new Set(n);
	e._zod.values = r, k(e, "pattern", (e) => {
		let t = ue(e.def.entries).filter((e) => Oe.has(typeof e));
		return RegExp(t.length ? `^(${t.map((e) => x(e.toString())).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), qr = /*@__PURE__*/ A("$ZodLiteral", (e, t) => {
	F.init(e, t);
	let n = new Set(t.values);
	e._zod.values = n, k(e, "pattern", (e) => {
		let t = e.def.values;
		return RegExp(t.length ? `^(${t.map((e) => typeof e == "string" ? x(e) : e ? x(e.toString()) : String(e)).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (r, i) => {
		let a = r.value;
		return n.has(a) || r.issues.push({
			code: "invalid_value",
			values: t.values,
			input: a,
			inst: e
		}), r;
	};
}), Jr = /*@__PURE__*/ A("$ZodTransform", (e, t) => {
	F.init(e, t), e._zod.optin = "optional", M.memoizer?.guard(e), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new ut(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new j();
		return n.value = i, n;
	};
});
function Yr(e, t) {
	return e.value = t.issues.length ? void 0 : t.value, e;
}
var Xr = /*@__PURE__*/ A("$ZodOptional", (e, t) => {
	F.init(e, t), k(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", k(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? /* @__PURE__ */ new Set([...t, void 0]) : void 0;
	}), k(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${ge(t.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (e.value === void 0) {
			if (t.innerType._zod.optin !== "defaulted") return e;
			let r = t.innerType._zod.run({
				value: e.value,
				issues: []
			}, n);
			return r instanceof Promise ? r.then((t) => Yr(e, t)) : Yr(e, r);
		}
		return t.innerType._zod.run(e, n);
	};
}), Zr = /*@__PURE__*/ A("$ZodExactOptional", (e, t) => {
	Xr.init(e, t), k(e, "values", (e) => e.def.innerType._zod.values), k(e, "pattern", (e) => e.def.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), Qr = /*@__PURE__*/ A("$ZodNullable", (e, t) => {
	F.init(e, t), k(e, "optin", (e) => e.def.innerType._zod.optin), k(e, "optout", (e) => e.def.innerType._zod.optout), k(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${ge(t.source)}|null)$`) : void 0;
	}), k(e, "values", (e) => e.def.innerType._zod.values ? /* @__PURE__ */ new Set([...e.def.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), $r = /*@__PURE__*/ A("$ZodDefault", (e, t) => {
	F.init(e, t), e._zod.optin = "defaulted", k(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => ei(e, t)) : ei(r, t);
	};
});
function ei(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var ti = /*@__PURE__*/ A("$ZodPrefault", (e, t) => {
	F.init(e, t), e._zod.optin = "defaulted", k(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), ni = /*@__PURE__*/ A("$ZodNonOptional", (e, t) => {
	F.init(e, t), k(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? new Set([...t].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => ri(t, e)) : ri(i, e);
	};
});
function ri(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
function ii(e, t, n, r) {
	return t.issues.length ? (e.value = n.catchValue({
		...t,
		value: e.value,
		error: { issues: t.issues.map((e) => E(e, r, N())) },
		input: e.value
	}), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
var ai = /*@__PURE__*/ A("$ZodCatch", (e, t) => {
	F.init(e, t), k(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), k(e, "optout", (e) => e.def.innerType._zod.optout), k(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run({
			value: e.value,
			issues: []
		}, n);
		return r instanceof Promise ? r.then((r) => ii(e, r, t, n)) : ii(e, r, t, n);
	};
}), oi = /*@__PURE__*/ A("$ZodPipe", (e, t) => {
	F.init(e, t), k(e, "values", (e) => e.def.in._zod.values), k(e, "optin", (e) => e.def.in._zod.optin), k(e, "optout", (e) => e.def.out._zod.optout), k(e, "propValues", (e) => e.def.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => si(e, t.in, n)) : si(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => si(e, t.out, n)) : si(r, t.out, n);
	};
});
function si(e, t, n) {
	return e.issues.some((e) => e.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues
	}, n);
}
var ci = /*@__PURE__*/ A("$ZodReadonly", (e, t) => {
	F.init(e, t), k(e, "propValues", (e) => e.def.innerType._zod.propValues), k(e, "values", (e) => e.def.innerType._zod.values), k(e, "optin", (e) => e.def.innerType?._zod?.optin), k(e, "optout", (e) => e.def.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(li) : li(r);
	};
});
function li(e) {
	return e.memo || (e.value = Object.freeze(e.value)), e;
}
var ui = /*@__PURE__*/ A("$ZodCustom", (e, t) => {
	P.init(e, t), F.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => di(t, n, r, e));
		di(i, n, r, e);
	};
});
function di(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(Ye(e));
	}
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/memoizer.js
var fi = class extends Error {
	constructor() {
		super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
	}
}, pi = "~memo", mi = [];
function hi(e) {
	return typeof e == "object" && !!e;
}
function gi(e) {
	return e.map((e) => e.path ? {
		...e,
		path: e.path.slice()
	} : { ...e });
}
var _i = /*@__PURE__*/ new WeakMap(), vi = 0, yi = 1, L = 2;
function bi(e, t, n) {
	let r = _i.get(e);
	if (r !== void 0) return r ? L : vi;
	if (t.has(e)) return L;
	t.add(e);
	let i = vi, a = (e) => {
		if (i !== L && e?._zod) {
			let r = bi(e, t, n);
			r > i && (i = r);
		}
	}, o = (e, r) => {
		let i = vi;
		for (let a of Reflect.ownKeys(e)) {
			let o = Object.getOwnPropertyDescriptor(e, a);
			if (r && !o.enumerable) continue;
			let s = o.get ? yi : o.value?._zod ? bi(o.value, t, n) : vi;
			s > i && (i = s);
		}
		return i;
	}, s = (e) => {
		e > i && (i = e);
	}, c = e._zod.def;
	switch (c.type) {
		case "object": {
			let e = ve(c);
			s(e ? o(e, !0) : yi), a(c.catchall);
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
			s(r ? bi(r, t, !1) : yi);
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
	return t.delete(e), xi(e, i);
}
function xi(e, t) {
	return t !== yi && _i.set(e, t === L), t;
}
function Si(e, t) {
	let n = e.buckets.get(t);
	return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
var Ci, wi = [], Ti = {
	alloc(e, t, n) {
		let r = Ci;
		if (!r) return n;
		Ci = void 0;
		let i = {
			value: n,
			issues: null
		};
		return r.set(t.value, i), wi.push(i), n;
	},
	guard(e) {
		var t;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, n = (e, n) => {
				if (n.direction !== "backward" && Di(n, e.value)) throw new fi();
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
					let i = bi(e, /* @__PURE__ */ new Set(), !1);
					if (i === vi) return e._zod.parse = t, e._zod.run === o && (e._zod.run = t), t(s, c);
					i === L || r ? n = !0 : r = !0;
				}
				let l = s.value;
				if (!hi(l)) return t(s, c);
				let u = c[pi];
				u || (u = {
					buckets: /* @__PURE__ */ new WeakMap(),
					backEdges: void 0
				}, c[pi] = u);
				let d;
				i === c ? d = a : (d = Si(u, e), i = c, a = d);
				let f = d.get(l);
				if (f) return s.value = f.value, f.issues ? f.issues.length && s.issues.push(...gi(f.issues)) : (s.memo = !0, u.backEdges ?? (u.backEdges = /* @__PURE__ */ new WeakSet()), u.backEdges.add(f.value)), s;
				Ci = d;
				let p = wi.length, m = t(s, c);
				Ci = void 0;
				let ee = wi.length > p ? wi.pop() : void 0;
				return m instanceof Promise ? m.then((e) => (ee && (ee.issues = e.issues.length ? gi(e.issues) : mi), e)) : (ee && (ee.issues = m.issues.length ? gi(m.issues) : mi), m);
			};
			e._zod.parse = o, e._zod.run === t && (e._zod.run = o);
		});
	}
};
function Ei() {
	return Ti;
}
function Di(e, t) {
	let n = e[pi]?.backEdges;
	return n !== void 0 && hi(t) && n.has(t);
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/locales/en.js
var Oi = () => {
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
			case "invalid_type": return `Invalid input: expected ${i(e.expected)}, received ${i(Je(e.input), e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Invalid input: expected ${ke(e.values[0])}` : `Invalid option: expected one of ${de(e.values, "|")}`;
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
			case "unrecognized_keys": return `Unrecognized key${e.keys.length > 1 ? "s" : ""}: ${de(e.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${e.origin}`;
			case "invalid_union": return e.options && Array.isArray(e.options) && e.options.length > 0 ? `Invalid discriminator value. Expected ${e.options.map((e) => `'${e}'`).join(" | ")}` : e.inclusive === !1 ? "Invalid input: more than one option matched" : "Invalid input";
			case "invalid_element": return `Invalid value in ${e.origin}`;
			default: return "Invalid input";
		}
	};
};
function ki() {
	return { localeError: Oi() };
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/registries.js
var Ai, ji = class {
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
function Mi() {
	return new ji();
}
(Ai = globalThis).__zod_globalRegistry ?? (Ai.__zod_globalRegistry = Mi());
var Ni = globalThis.__zod_globalRegistry;
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/api.js
function Pi(e) {
	return e.checks &&= [...e.checks], e;
}
// @__NO_SIDE_EFFECTS__
function Fi(e, t) {
	return new e(Pi({
		type: "string",
		...C(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function Ii(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Li(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ri(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function zi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Bi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Vi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Hi(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ui(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Wi(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Gi(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ki(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function qi(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ji(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Yi(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Xi(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Zi(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Qi(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function $i(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ea(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ta(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function na(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ra(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ia(e, t) {
	return new e({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function aa(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function oa(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function sa(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ca(e, t) {
	return new e(Pi({
		type: "number",
		checks: [],
		...C(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function la(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ua(e, t) {
	return new e({
		type: "boolean",
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function da(e) {
	return new e({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function fa(e, t) {
	return new e({
		type: "never",
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function pa(e, t) {
	return new Sn({
		check: "less_than",
		...C(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function ma(e, t) {
	return new Sn({
		check: "less_than",
		...C(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function ha(e, t) {
	return new Cn({
		check: "greater_than",
		...C(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function ga(e, t) {
	return new Cn({
		check: "greater_than",
		...C(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function _a(e, t) {
	return new wn({
		check: "multiple_of",
		...C(t),
		value: e
	});
}
// @__NO_SIDE_EFFECTS__
function va(e, t) {
	return new En({
		check: "max_length",
		...C(t),
		maximum: e
	});
}
// @__NO_SIDE_EFFECTS__
function ya(e, t) {
	return new Dn({
		check: "min_length",
		...C(t),
		minimum: e
	});
}
// @__NO_SIDE_EFFECTS__
function ba(e, t) {
	return new On({
		check: "length_equals",
		...C(t),
		length: e
	});
}
// @__NO_SIDE_EFFECTS__
function xa(e, t) {
	return new An({
		check: "string_format",
		format: "regex",
		...C(t),
		pattern: e
	});
}
// @__NO_SIDE_EFFECTS__
function Sa(e) {
	return new jn({
		check: "string_format",
		format: "lowercase",
		...C(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Ca(e) {
	return new Mn({
		check: "string_format",
		format: "uppercase",
		...C(e)
	});
}
// @__NO_SIDE_EFFECTS__
function wa(e, t) {
	return new Nn({
		check: "string_format",
		format: "includes",
		...C(t),
		includes: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ta(e, t) {
	return new Pn({
		check: "string_format",
		format: "starts_with",
		...C(t),
		prefix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ea(e, t) {
	return new Fn({
		check: "string_format",
		format: "ends_with",
		...C(t),
		suffix: e
	});
}
// @__NO_SIDE_EFFECTS__
function R(e) {
	return new In({
		check: "overwrite",
		tx: e
	});
}
// @__NO_SIDE_EFFECTS__
function Da(e) {
	return /* @__PURE__ */ R((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Oa() {
	return /* @__PURE__ */ R((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function ka() {
	return /* @__PURE__ */ R((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Aa() {
	return /* @__PURE__ */ R((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function ja() {
	return /* @__PURE__ */ R((e) => Ce(e));
}
// @__NO_SIDE_EFFECTS__
function Ma(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...C(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Na(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...C(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Pa(e, t) {
	let n = /* @__PURE__ */ Fa((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(Ye(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", "input" in r || (r.input = t.value), r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(Ye(r));
		}
	}, e(t.value, t)), t);
	return n;
}
// @__NO_SIDE_EFFECTS__
function Fa(e, t) {
	let n = new P({
		check: "custom",
		...C(t)
	});
	return n._zod.check = e, n;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/to-json-schema.js
function z(e, ...t) {
	for (let n of t) for (let t of Reflect.ownKeys(n)) Object.prototype.propertyIsEnumerable.call(n, t) && g(e, t, n[t]);
	return e;
}
function Ia(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? Ni,
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
function B(e, t, n, r, i) {
	let a = typeof t.unrepresentable == "function" ? t.unrepresentable({
		zodSchema: e,
		path: r.path,
		message: i
	}) : t.unrepresentable;
	if (a === "any") return !1;
	if (a === void 0 || a === "throw") throw Error(i);
	return Object.assign(n, a), !0;
}
function V(e, t, n = {
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
		a && (o.ref ||= a, V(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && z(o.schema, c), t.io === "input" && H(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function La(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function Ra(e, t) {
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
				ref: `${i("__shared")}#/${r}/${La(a)}`
			};
		}
		let i = `#/${r}/`;
		if (t[1] === n && !t[1].schema.id) return { ref: "#" };
		let a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + La(a)
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
function za(e) {
	let t = e.anyOf;
	if (!Array.isArray(t) || t.length === 0 || e.type !== void 0) return;
	let n = [];
	for (let e of t) {
		if (!e || typeof e != "object") return;
		za(e);
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
var Ba = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]), Va = ["oneOf", "anyOf"];
function Ha(e) {
	let t = e.additionalProperties;
	return t === void 0 || t === !1 || typeof t != "object" || !t ? null : Object.keys(t).length ? t : null;
}
function Ua(e) {
	let t = [];
	for (let n of e) {
		if (typeof n != "object" || n.type !== "object") return null;
		for (let e in n) if (!Ba.has(e)) return null;
		t.push(n);
	}
	let n = {}, r = /* @__PURE__ */ new Set();
	for (let e of t) {
		for (let r in e.properties) {
			if (Object.prototype.hasOwnProperty.call(n, r)) continue;
			let e = [];
			for (let n of t) {
				let t = n.properties?.[r] ?? Ha(n);
				t != null && (e.some((e) => JSON.stringify(e) === JSON.stringify(t)) || e.push(t));
			}
			g(n, r, e.length === 1 ? e[0] : Ua(e) ?? { allOf: e });
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
			let t = Ha(n);
			t && !e.some((e) => JSON.stringify(e) === JSON.stringify(t)) && e.push(t);
		}
		e.length === 1 ? i.additionalProperties = e[0] : e.length > 1 && (i.additionalProperties = { allOf: e });
	}
	return i;
}
function Wa(e) {
	let t = e.allOf;
	if (!Array.isArray(t) || t.length < 2) return;
	for (let t of Ba) if (t in e) return;
	let n = t.filter((e) => Va.some((t) => Array.isArray(e[t]))), r = null;
	if (!n.length) r = Ua(t);
	else {
		let e = n[0], i = Va.find((t) => Array.isArray(e[t]));
		if (Object.keys(e).length !== 1) return;
		let a = t.filter((t) => t !== e), o = e[i].map((e) => Ua([...a, e]));
		if (o.some((e) => !e)) return;
		r = { [i]: o };
	}
	r && (delete e.allOf, z(e, r));
}
function Ga(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : z(i, s), z(i, a), t._zod.parent === o) for (let e in i) e !== "$ref" && e !== "allOf" && (e in a || delete i[e]);
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
		if (e.target !== "openapi-3.0") for (let t of e.seen.entries()) za(t[1].def ?? t[1].schema);
		for (let t of e.deferred) t();
		if (e.intersections.length) {
			let t = /* @__PURE__ */ new Map();
			for (let n of e.seen.values()) for (let e of [n.schema, n.def]) {
				let n = e?.allOf;
				if (!Array.isArray(n)) continue;
				let r = t.get(n);
				r ? r.push(e) : t.set(n, [e]);
			}
			for (let n of e.intersections) for (let e of t.get(n) ?? []) Wa(e);
		}
	}
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	z(i, n.defId ? n.schema : n.def ?? n.schema);
	let a = e.metadataRegistry.get(t)?.id;
	a !== void 0 && i.id === a && delete i.id;
	let o = e.external?.defs ?? {};
	if (!e.external || e.sharedEmitDoneFor !== e.external) for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (e.def.id === e.defId && delete e.def.id, g(o, e.defId, e.def));
	}
	e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(o).length > 0 && (e.target === "draft-2020-12" ? i.$defs = o : i.definitions = o);
	try {
		let n = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: qa(t, "input", e.processors),
					output: qa(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function H(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return H(r.element, n);
	if (r.type === "set") return H(r.valueType, n);
	if (r.type === "lazy") return H(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch") return H(r.innerType, n);
	if (r.type === "intersection") return H(r.left, n) || H(r.right, n);
	if (r.type === "record" || r.type === "map") return H(r.keyType, n) || H(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : H(r.in, n) || H(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (H(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (H(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (H(e, n)) return !0;
		return !!(r.rest && H(r.rest, n));
	}
	return !1;
}
var Ka = (e, t = {}) => (n) => {
	let r = Ia({
		...n,
		processors: t
	});
	return V(e, r), Ra(r, e), Ga(r, e);
}, qa = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = Ia({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return V(e, o), Ra(o, e), Ga(o, e);
}, U = (e, t, n) => {
	(e[t] === void 0 || n > e[t]) && (e[t] = n);
}, W = (e, t, n) => {
	(e[t] === void 0 || n < e[t]) && (e[t] = n);
}, Ja = (e, t) => {
	U(e, "minimum", t), W(e, "maximum", t);
}, Ya = (e, t) => {
	e.multipleOf ??= [], e.multipleOf.includes(t) || e.multipleOf.push(t);
}, Xa = (e, t) => {
	e.patterns ??= /* @__PURE__ */ new Set(), e.patterns.add(t);
}, Za = (e, t) => {
	e.mime = e.mime ? e.mime.filter((e) => t.includes(e)) : [...t];
}, Qa = (e, t) => {
	e.format = t, t.includes("int") && (e.isInt = !0);
}, $a = (e, t) => U(e, "minimum", t.minimum), eo = (e, t) => W(e, "maximum", t.maximum), to = (e) => (t, n) => {
	Qa(t, n.format);
	let [r, i] = e[n.format];
	U(t, "minimum", r), W(t, "maximum", i);
}, no = {
	greater_than: (e, t) => U(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
	less_than: (e, t) => W(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
	multiple_of: (e, t) => Ya(e, t.value),
	number_format: to(je),
	bigint_format: to(Me),
	min_length: $a,
	max_length: eo,
	length_equals: (e, t) => Ja(e, t.length),
	min_size: $a,
	max_size: eo,
	size_equals: (e, t) => Ja(e, t.size),
	string_format: (e, t) => {
		Qa(e, t.format), t.pattern && Xa(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
	},
	mime_type: (e, t) => Za(e, t.mime)
};
function G(e) {
	let t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
	for (let e of r) no[e._zod.def.check]?.(t, e._zod.def);
	let i = e._zod.bag;
	i.minimum !== void 0 && U(t, "minimum", i.minimum), i.exclusiveMinimum !== void 0 && U(t, "exclusiveMinimum", i.exclusiveMinimum), i.maximum !== void 0 && W(t, "maximum", i.maximum), i.exclusiveMaximum !== void 0 && W(t, "exclusiveMaximum", i.exclusiveMaximum), i.multipleOf !== void 0 && Ya(t, i.multipleOf), i.format !== void 0 && (t.format ??= i.format, i.format.includes("int") && (t.isInt = !0)), i.mime && Za(t, i.mime);
	for (let e of i.patterns ?? []) Xa(t, e);
	return t;
}
var ro = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, io = /* @__PURE__ */ new Map([[yr, rn], [xr, an]]), ao = (e) => io.get(e) ?? e, oo = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l, laxFormat: u } = G(e);
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = ro[s] ?? s, i.format === "" && delete i.format, (s === "time" || u) && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c].map(ao);
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, so = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, multipleOf: s, exclusiveMaximum: c, exclusiveMinimum: l, isInt: u } = G(e);
	i.type = u ? "integer" : "number";
	let d = typeof l == "number" && l >= (a ?? -Infinity), f = typeof c == "number" && c <= (o ?? Infinity), p = t.target === "draft-04" || t.target === "openapi-3.0";
	if (d ? p ? (i.minimum = l, i.exclusiveMinimum = !0) : i.exclusiveMinimum = l : typeof a == "number" && (i.minimum = a), f ? p ? (i.maximum = c, i.exclusiveMaximum = !0) : i.exclusiveMaximum = c : typeof o == "number" && (i.maximum = o), s) {
		let n = /* @__PURE__ */ new Set();
		for (let a of s) Number.isFinite(a) && a !== 0 ? n.add(Math.abs(a)) : B(e, t, i, r, `A multipleOf divisor of ${a} cannot be represented in JSON Schema`);
		let [a, ...o] = n;
		a !== void 0 && (i.multipleOf = a), o.length && (i.allOf = [...i.allOf ?? [], ...o.map((e) => ({ multipleOf: e }))]);
	}
}, co = (e, t, n, r) => {
	n.type = "boolean";
}, lo = (e, t, n, r) => {
	n.not = {};
}, uo = (e, t, n, r) => {
	let i = e._zod.def, a = ue(i.entries);
	if (a.length === 0) {
		n.not = {};
		return;
	}
	a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a;
}, fo = (e, t, n, r) => {
	let i = e._zod.def;
	if (i.values.length === 0) {
		n.not = {};
		return;
	}
	let a = [];
	for (let o of i.values) if (o === void 0) {
		if (B(e, t, n, r, "Literal `undefined` cannot be represented in JSON Schema")) return;
	} else if (typeof o == "bigint") {
		if (B(e, t, n, r, "BigInt literals cannot be represented in JSON Schema")) return;
		a.push(Number(o));
	} else a.push(o);
	if (a.length !== 0) {
		if (a.length === 1) {
			let e = a[0];
			n.type = e === null ? "null" : typeof e, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [e] : n.const = e;
		} else a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), a.every((e) => typeof e == "boolean") && (n.type = "boolean"), a.every((e) => e === null) && (n.type = "null"), n.enum = a;
	}
}, po = (e, t, n, r) => {
	B(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, mo = (e, t, n, r) => {
	B(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, ho = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = G(e);
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = V(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
};
function go(e) {
	let t = e._zod.def;
	return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? go(t.out) : t.type === "catch" ? go(t.innerType) : e._zod.optin;
}
var _o = (e, t, n, r) => {
	let i = n, a = e._zod.def, o = a.shape;
	if (Object.getOwnPropertySymbols(o).length && B(e, t, i, r, "Symbol keys cannot be represented in JSON Schema")) return;
	i.type = "object", i.properties = {};
	for (let e in o) g(i.properties, e, V(o[e], t, {
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
		(t.io === "input" ? go(n) === void 0 : n._zod.optout === void 0) && s.push(e);
	}
	s.length > 0 && (i.required = s), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = V(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, vo = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => V(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, yo = (e, t, n, r) => {
	let i = e._zod.def, a = V(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = V(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1, c = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
	n.allOf = c, t.intersections.push(c);
};
function bo(e, t, n) {
	if (t.$ref) {
		if (n.has(t)) return t;
		n.add(t);
		let r = e.get(t)?.def;
		if (!r) return t;
		let i = bo(e, r, n);
		return i === r ? t : i;
	}
	for (let r of ["anyOf", "oneOf"]) {
		let i = t[r];
		if (!Array.isArray(i)) continue;
		let a = i.map((t) => bo(e, t, n));
		a.some((e, t) => e !== i[t]) && (t = {
			...t,
			[r]: a
		});
	}
	let r = Array.isArray(t.type) ? t.type : [t.type], i = !r.includes("string") && r.some((e) => e === "number" || e === "integer"), a = t.enum ?? (t.const === void 0 ? void 0 : [t.const]);
	if (!i && !a?.some((e) => typeof e == "number")) return t;
	let { minimum: o, maximum: s, exclusiveMinimum: c, exclusiveMaximum: l, multipleOf: u, format: d, id: f, ...p } = t;
	return p.enum ? p.enum = p.enum.map((e) => typeof e == "number" ? String(e) : e) : typeof p.const == "number" && (p.const = String(p.const)), i ? (p.type = "string", a || (p.pattern = (r.includes("number") ? gn : hn).source), p) : p;
}
var xo = /* @__PURE__ */ new WeakMap();
function So(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.seen.values()) n.def && !t.has(n.schema) && t.set(n.schema, n);
	let n = /* @__PURE__ */ new Map();
	for (let r of xo.get(e) ?? []) {
		let i = e.seen.get(r), a = (i?.def ?? i?.schema)?.propertyNames;
		if (!a || a === !0 || n.has(a)) continue;
		let o = bo(t, a, /* @__PURE__ */ new Set());
		o !== a && n.set(a, o);
	}
	if (n.size) for (let t of e.seen.values()) for (let e of [t.schema, t.def]) {
		let t = e && n.get(e.propertyNames);
		t && (e.propertyNames = t);
	}
}
var Co = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object";
	let o = a.keyType, s = G(o).patterns;
	if (a.mode === "loose" && s && s.size > 0) {
		let e = V(a.valueType, t, {
			...r,
			path: [
				...r.path,
				"patternProperties",
				"*"
			]
		});
		i.patternProperties = {};
		for (let t of s) g(i.patternProperties, ao(t).source, e);
	} else {
		if (t.target === "draft-07" || t.target === "draft-2020-12") {
			i.propertyNames = V(a.keyType, t, {
				...r,
				path: [...r.path, "propertyNames"]
			});
			let n = xo.get(t);
			n || (n = [], xo.set(t, n), t.deferred.push(() => So(t))), n.push(e);
		}
		i.additionalProperties = V(a.valueType, t, {
			...r,
			path: [...r.path, "additionalProperties"]
		});
	}
	let c = o._zod.values, l = t.io === "input" && go(a.valueType) !== void 0;
	if (c && !a.partial && !l) {
		let e = [...c].filter((e) => typeof e == "string" || typeof e == "number");
		e.length > 0 && (i.required = e.map(String));
	}
}, wo = (e, t, n, r) => {
	let i = e._zod.def, a = V(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, To = (e, t, n, r) => {
	let i = e._zod.def;
	V(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Eo = Symbol();
function Do(e, t, n, r, i) {
	let a = !1, o = JSON.stringify(e, (e, t) => typeof t == "bigint" ? (a = !0, null) : t);
	return a ? (B(t, n, r, i, "BigInt defaults cannot be represented in JSON Schema"), Eo) : JSON.parse(o);
}
var Oo = (e, t, n, r) => {
	let i = e._zod.def;
	V(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o = Do(i.defaultValue, e, t, n, r);
	o !== Eo && (n.default = o);
}, ko = (e, t, n, r) => {
	let i = e._zod.def;
	V(i.innerType, t, r);
	let a = t.seen.get(e);
	if (a.ref = i.innerType, t.io !== "input") return;
	let o = Do(i.defaultValue, e, t, n, r);
	o !== Eo && (n._prefault = o);
}, Ao = (e, t, n, r) => {
	let i = e._zod.def;
	V(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		B(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	n.default = o;
}, jo = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	V(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, Mo = (e, t, n, r) => {
	let i = e._zod.def;
	V(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, No = (e, t, n, r) => {
	let i = e._zod.def;
	V(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Po = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function Fo(e, t, n) {
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
var K = /*@__PURE__*/ A("ZodError", (e, t) => {
	_t.init(e, t), e.name = "ZodError";
	let n = Object.getPrototypeOf(e);
	Po.has(n) || (Po.add(n), Fo(n, "format", (e) => (t) => bt(e, t)), Fo(n, "flatten", (e) => (t) => yt(e, t)), Fo(n, "addIssue", (e) => (t) => {
		e.issues.push(t), e.message = JSON.stringify(e.issues, fe, 2);
	}), Fo(n, "addIssues", (e) => (t) => {
		e.issues.push(...t), e.message = JSON.stringify(e.issues, fe, 2);
	}), Object.defineProperty(n, "isEmpty", {
		configurable: !0,
		enumerable: !1,
		get() {
			return this.issues.length === 0;
		}
	}));
}, void 0, { Parent: Error }), Io = /* @__PURE__ */ St(K), Lo = /* @__PURE__ */ Ct(K), Ro = /* @__PURE__ */ wt(K), zo = /* @__PURE__ */ Et(K), Bo = /* @__PURE__ */ Mt(K), Vo = /* @__PURE__ */ Nt(K), Ho = /* @__PURE__ */ Pt(K), Uo = /* @__PURE__ */ Ft(K), Wo = /* @__PURE__ */ It(K), Go = /* @__PURE__ */ Lt(K), Ko = /* @__PURE__ */ Rt(K), qo = /* @__PURE__ */ zt(K);
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/schemas.js
function Jo() {
	M.localeError || N(ki());
}
function Yo() {
	M.memoizer || N({ memoizer: Ei() });
}
var q = /*@__PURE__*/ A("ZodType", (e, t) => (Jo(), F.init(e, t), e.def = t, e.type = t.type, e), {
	check(...e) {
		let t = this.def;
		return this.clone(y(t, { checks: [...t.checks ?? [], ...e.map((e) => typeof e == "function" ? { _zod: {
			check: e,
			def: { check: "custom" },
			onattach: []
		} } : e)] }), { parent: !0 });
	},
	with(...e) {
		return this.check(...e);
	},
	clone(e, t) {
		return S(this, e, t);
	},
	brand() {
		return this;
	},
	register(e, t) {
		return e.add(this, t), this;
	},
	refine(e, t) {
		return this.check(hc(e, t));
	},
	superRefine(e, t) {
		return this.check(gc(e, t));
	},
	overwrite(e) {
		return this.check(/* @__PURE__ */ R(e));
	},
	optional() {
		return Zs(this);
	},
	exactOptional() {
		return $s(this);
	},
	nullable() {
		return tc(this);
	},
	nullish() {
		return Zs(tc(this));
	},
	nonoptional(e) {
		return sc(this, e);
	},
	array() {
		return Fs(this);
	},
	or(e) {
		return zs([this, e]);
	},
	and(e) {
		return Vs(this, e);
	},
	transform(e) {
		return dc(this, Ys(e));
	},
	default(e) {
		return rc(this, e);
	},
	prefault(e) {
		return ac(this, e);
	},
	catch(e) {
		return lc(this, e);
	},
	pipe(e) {
		return dc(this, e);
	},
	readonly() {
		return pc(this);
	},
	describe(e) {
		let t = this.clone();
		return Ni.add(t, { description: e }), t;
	},
	meta(...e) {
		if (e.length === 0) return Ni.get(this);
		let t = this.clone();
		return Ni.add(t, e[0]), t;
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
		return Ze(this, "~standard", {
			...Vn(this),
			jsonSchema: {
				input: qa(this, "input"),
				output: qa(this, "output")
			}
		});
	},
	set "~standard"(e) {
		D(this, "~standard", e);
	},
	parse: function e(t, n) {
		return Io(this, t, n, { callee: e });
	},
	parseAsync: async function e(t, n) {
		return await Lo(this, t, n, { callee: e });
	},
	safeParse(e, t) {
		return Ro(this, e, t);
	},
	async safeParseAsync(e, t) {
		return zo(this, e, t);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(e) {
		D(this, "spa", e);
	},
	validate(e, t) {
		return kt(this, e, t);
	},
	validateAsync(e, t) {
		return jt(this, e, t);
	},
	encode: function e(t, n) {
		return Bo(this, t, n, { callee: e });
	},
	decode: function e(t, n) {
		return Vo(this, t, n, { callee: e });
	},
	encodeAsync: async function e(t, n) {
		return await Ho(this, t, n, { callee: e });
	},
	decodeAsync: async function e(t, n) {
		return await Uo(this, t, n, { callee: e });
	},
	safeEncode(e, t) {
		return Wo(this, e, t);
	},
	safeDecode(e, t) {
		return Go(this, e, t);
	},
	async safeEncodeAsync(e, t) {
		return Ko(this, e, t);
	},
	async safeDecodeAsync(e, t) {
		return qo(this, e, t);
	},
	toJSONSchema(e) {
		return Ka(this, {})(e);
	},
	get description() {
		return Ni.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
}), Xo = /*@__PURE__*/ A("_ZodString", (e, t) => {
	Hn.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => oo(e, t, n, r);
}, /*@__PURE__*/ Qe({
	format: (e) => G(e).format ?? null,
	minLength: (e) => G(e).minimum ?? null,
	maxLength: (e) => G(e).maximum ?? null
}, {
	regex(...e) {
		return this.check(/* @__PURE__ */ xa(...e));
	},
	includes(...e) {
		return this.check(/* @__PURE__ */ wa(...e));
	},
	startsWith(...e) {
		return this.check(/* @__PURE__ */ Ta(...e));
	},
	endsWith(...e) {
		return this.check(/* @__PURE__ */ Ea(...e));
	},
	min(...e) {
		return this.check(/* @__PURE__ */ ya(...e));
	},
	max(...e) {
		return this.check(/* @__PURE__ */ va(...e));
	},
	length(...e) {
		return this.check(/* @__PURE__ */ ba(...e));
	},
	nonempty(...e) {
		return this.check(/* @__PURE__ */ ya(1, ...e));
	},
	lowercase(e) {
		return this.check(/* @__PURE__ */ Sa(e));
	},
	uppercase(e) {
		return this.check(/* @__PURE__ */ Ca(e));
	},
	trim() {
		return this.check(/* @__PURE__ */ Oa());
	},
	normalize(...e) {
		return this.check(/* @__PURE__ */ Da(...e));
	},
	toLowerCase() {
		return this.check(/* @__PURE__ */ ka());
	},
	toUpperCase() {
		return this.check(/* @__PURE__ */ Aa());
	},
	slugify() {
		return this.check(/* @__PURE__ */ ja());
	}
})), Zo = /*@__PURE__*/ A("ZodString", (e, t) => {
	Hn.init(e, t), Xo.init(e, t);
}, {
	email(e) {
		return this.check(/* @__PURE__ */ Ii(rs, e));
	},
	url(e) {
		return this.check(/* @__PURE__ */ Hi(cs, e));
	},
	jwt(e) {
		return this.check(/* @__PURE__ */ ra(Cs, e));
	},
	emoji(e) {
		return this.check(/* @__PURE__ */ Ui(ls, e));
	},
	guid(e) {
		return this.check(/* @__PURE__ */ Li(as, e));
	},
	uuid(e) {
		return this.check(/* @__PURE__ */ Ri(os, e));
	},
	uuidv4(e) {
		return this.check(/* @__PURE__ */ zi(os, e));
	},
	uuidv6(e) {
		return this.check(/* @__PURE__ */ Bi(os, e));
	},
	uuidv7(e) {
		return this.check(/* @__PURE__ */ Vi(os, e));
	},
	nanoid(e) {
		return this.check(/* @__PURE__ */ Wi(us, e));
	},
	cuid(e) {
		return this.check(/* @__PURE__ */ Gi(ds, e));
	},
	cuid2(e) {
		return this.check(/* @__PURE__ */ Ki(fs, e));
	},
	ulid(e) {
		return this.check(/* @__PURE__ */ qi(ps, e));
	},
	base64(e) {
		return this.check(/* @__PURE__ */ ea(bs, e));
	},
	base64url(e) {
		return this.check(/* @__PURE__ */ ta(xs, e));
	},
	xid(e) {
		return this.check(/* @__PURE__ */ Ji(ms, e));
	},
	ksuid(e) {
		return this.check(/* @__PURE__ */ Yi(hs, e));
	},
	ipv4(e) {
		return this.check(/* @__PURE__ */ Xi(gs, e));
	},
	ipv6(e) {
		return this.check(/* @__PURE__ */ Zi(_s, e));
	},
	cidrv4(e) {
		return this.check(/* @__PURE__ */ Qi(vs, e));
	},
	cidrv6(e) {
		return this.check(/* @__PURE__ */ $i(ys, e));
	},
	e164(e) {
		return this.check(/* @__PURE__ */ na(Ss, e));
	},
	datetime(e) {
		return this.check(/* @__PURE__ */ ia($o, e));
	},
	date(e) {
		return this.check(/* @__PURE__ */ aa(es, e));
	},
	time(e) {
		return this.check(/* @__PURE__ */ oa(ts, e));
	},
	duration(e) {
		return this.check(/* @__PURE__ */ sa(ns, e));
	}
});
function Qo(e) {
	return /* @__PURE__ */ Fi(Zo, e);
}
var J = /*@__PURE__*/ A("ZodStringFormat", (e, t) => {
	I.init(e, t), Xo.init(e, t);
}), $o = /*@__PURE__*/ A("ZodISODateTime", (e, t) => {
	sr.init(e, t), J.init(e, t);
}), es = /*@__PURE__*/ A("ZodISODate", (e, t) => {
	cr.init(e, t), J.init(e, t);
}), ts = /*@__PURE__*/ A("ZodISOTime", (e, t) => {
	lr.init(e, t), J.init(e, t);
}), ns = /*@__PURE__*/ A("ZodISODuration", (e, t) => {
	ur.init(e, t), J.init(e, t);
}), rs = /*@__PURE__*/ A("ZodEmail", (e, t) => {
	Gn.init(e, t), J.init(e, t);
});
function is(e) {
	return /* @__PURE__ */ Ii(rs, e);
}
var as = /*@__PURE__*/ A("ZodGUID", (e, t) => {
	Un.init(e, t), J.init(e, t);
}), os = /*@__PURE__*/ A("ZodUUID", (e, t) => {
	Wn.init(e, t), J.init(e, t);
});
function ss(e) {
	return /* @__PURE__ */ Ri(os, e);
}
var cs = /*@__PURE__*/ A("ZodURL", (e, t) => {
	$n.init(e, t), J.init(e, t);
}), ls = /*@__PURE__*/ A("ZodEmoji", (e, t) => {
	er.init(e, t), J.init(e, t);
}), us = /*@__PURE__*/ A("ZodNanoID", (e, t) => {
	tr.init(e, t), J.init(e, t);
}), ds = /*@__PURE__*/ A("ZodCUID", (e, t) => {
	nr.init(e, t), J.init(e, t);
}), fs = /*@__PURE__*/ A("ZodCUID2", (e, t) => {
	rr.init(e, t), J.init(e, t);
}), ps = /*@__PURE__*/ A("ZodULID", (e, t) => {
	ir.init(e, t), J.init(e, t);
}), ms = /*@__PURE__*/ A("ZodXID", (e, t) => {
	ar.init(e, t), J.init(e, t);
}), hs = /*@__PURE__*/ A("ZodKSUID", (e, t) => {
	or.init(e, t), J.init(e, t);
}), gs = /*@__PURE__*/ A("ZodIPv4", (e, t) => {
	dr.init(e, t), J.init(e, t);
}), _s = /*@__PURE__*/ A("ZodIPv6", (e, t) => {
	mr.init(e, t), J.init(e, t);
}), vs = /*@__PURE__*/ A("ZodCIDRv4", (e, t) => {
	hr.init(e, t), J.init(e, t);
}), ys = /*@__PURE__*/ A("ZodCIDRv6", (e, t) => {
	_r.init(e, t), J.init(e, t);
}), bs = /*@__PURE__*/ A("ZodBase64", (e, t) => {
	br.init(e, t), J.init(e, t);
}), xs = /*@__PURE__*/ A("ZodBase64URL", (e, t) => {
	Cr.init(e, t), J.init(e, t);
}), Ss = /*@__PURE__*/ A("ZodE164", (e, t) => {
	wr.init(e, t), J.init(e, t);
}), Cs = /*@__PURE__*/ A("ZodJWT", (e, t) => {
	Er.init(e, t), J.init(e, t);
}), ws = /*@__PURE__*/ A("ZodNumber", (e, t) => {
	Dr.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => so(e, t, n, r), e.isFinite = !0;
}, /*@__PURE__*/ Qe({
	minValue: (e) => {
		let { minimum: t, exclusiveMinimum: n } = G(e);
		return Math.max(t ?? -Infinity, n ?? -Infinity);
	},
	maxValue: (e) => {
		let { maximum: t, exclusiveMaximum: n } = G(e);
		return Math.min(t ?? Infinity, n ?? Infinity);
	},
	isInt: (e) => {
		let { isInt: t, multipleOf: n } = G(e);
		return !!t || !!n?.some(Number.isSafeInteger);
	},
	format: (e) => G(e).format ?? null
}, {
	gt(e, t) {
		return this.check(/* @__PURE__ */ ha(e, t));
	},
	gte(e, t) {
		return this.check(/* @__PURE__ */ ga(e, t));
	},
	min(e, t) {
		return this.check(/* @__PURE__ */ ga(e, t));
	},
	lt(e, t) {
		return this.check(/* @__PURE__ */ pa(e, t));
	},
	lte(e, t) {
		return this.check(/* @__PURE__ */ ma(e, t));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ ma(e, t));
	},
	int(e) {
		return this.check(Ds(e));
	},
	safe(e) {
		return this.check(Ds(e));
	},
	positive(e) {
		return this.check(/* @__PURE__ */ ha(0, e));
	},
	nonnegative(e) {
		return this.check(/* @__PURE__ */ ga(0, e));
	},
	negative(e) {
		return this.check(/* @__PURE__ */ pa(0, e));
	},
	nonpositive(e) {
		return this.check(/* @__PURE__ */ ma(0, e));
	},
	multipleOf(e, t) {
		return this.check(/* @__PURE__ */ _a(e, t));
	},
	step(e, t) {
		return this.check(/* @__PURE__ */ _a(e, t));
	},
	finite() {
		return this;
	}
}));
function Ts(e) {
	return /* @__PURE__ */ ca(ws, e);
}
var Es = /*@__PURE__*/ A("ZodNumberFormat", (e, t) => {
	Or.init(e, t), ws.init(e, t);
});
function Ds(e) {
	return /* @__PURE__ */ la(Es, e);
}
var Os = /*@__PURE__*/ A("ZodBoolean", (e, t) => {
	kr.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => co(e, t, n, r);
});
function ks(e) {
	return /* @__PURE__ */ ua(Os, e);
}
var As = /*@__PURE__*/ A("ZodUnknown", (e, t) => {
	Ar.init(e, t), q.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function js() {
	return /* @__PURE__ */ da(As);
}
var Ms = /*@__PURE__*/ A("ZodNever", (e, t) => {
	jr.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => lo(e, t, n, r);
});
function Ns(e) {
	return /* @__PURE__ */ fa(Ms, e);
}
var Ps = /*@__PURE__*/ A("ZodArray", (e, t) => {
	Yo(), Nr.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => ho(e, t, n, r), e.element = t.element;
}, {
	min(e, t) {
		return this.check(/* @__PURE__ */ ya(e, t));
	},
	nonempty(e) {
		return this.check(/* @__PURE__ */ ya(1, e));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ va(e, t));
	},
	length(e, t) {
		return this.check(/* @__PURE__ */ ba(e, t));
	},
	unwrap() {
		return this.element;
	}
});
function Fs(e, t) {
	return /* @__PURE__ */ Ma(Ps, e, t);
}
var Is = /*@__PURE__*/ A("ZodObject", (e, t) => {
	Yo(), zr.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => _o(e, t, n, r), rt(e, "shape", (e) => e._zod.def.shape, !1);
}, {
	keyof() {
		return Gs(Object.keys(this._zod.def.shape));
	},
	catchall(e) {
		return this.clone(y(this._zod.def, { catchall: e }));
	},
	passthrough() {
		return this.clone(y(this._zod.def, { catchall: js() }));
	},
	loose() {
		return this.clone(y(this._zod.def, { catchall: js() }));
	},
	strict() {
		return this.clone(y(this._zod.def, { catchall: Ns() }));
	},
	strip() {
		return this.clone(y(this._zod.def, { catchall: void 0 }));
	},
	extend(e) {
		return Ie(this, e);
	},
	safeExtend(e) {
		return Re(this, e);
	},
	merge(e) {
		return ze(this, e);
	},
	pick(e) {
		return Ne(this, e);
	},
	omit(e) {
		return Fe(this, e);
	},
	partial(...e) {
		return Be(Xs, this, e[0]);
	},
	exactPartial(...e) {
		return Be(Qs, this, e[0], "exactPartial");
	},
	required(...e) {
		return Ve(oc, this, e[0]);
	}
});
function Ls(e, t) {
	return new Is({
		type: "object",
		shape: e ?? {},
		...C(t)
	});
}
var Rs = /*@__PURE__*/ A("ZodUnion", (e, t) => {
	Vr.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => vo(e, t, n, r), e.options = t.options;
});
function zs(e, t) {
	return new Rs({
		type: "union",
		options: e,
		...C(t)
	});
}
var Bs = /*@__PURE__*/ A("ZodIntersection", (e, t) => {
	Hr.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => yo(e, t, n, r);
});
function Vs(e, t) {
	return new Bs({
		type: "intersection",
		left: e,
		right: t
	});
}
var Hs = /*@__PURE__*/ A("ZodRecord", (e, t) => {
	Yo(), Gr.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => Co(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function Us(e, t, n) {
	return !t || !t._zod ? new Hs({
		type: "record",
		keyType: Qo(),
		valueType: e,
		...C(t)
	}) : new Hs({
		type: "record",
		keyType: e,
		valueType: t,
		...C(n)
	});
}
var Ws = /*@__PURE__*/ A("ZodEnum", (e, t) => {
	Kr.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => uo(e, t, n, r), e.enum = t.entries, e.options = [...e._zod.values];
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new Ws({
			...t,
			checks: [],
			...C(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new Ws({
			...t,
			checks: [],
			...C(r),
			entries: i
		});
	};
});
function Gs(e, t) {
	return new Ws({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...C(t)
	});
}
var Ks = /*@__PURE__*/ A("ZodLiteral", (e, t) => {
	qr.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => fo(e, t, n, r), e.values = new Set(t.values), Object.defineProperty(e, "value", { get() {
		if (t.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return t.values[0];
	} });
});
function qs(e, t) {
	return new Ks({
		type: "literal",
		values: Array.isArray(e) ? e : [e],
		...C(t)
	});
}
var Js = /*@__PURE__*/ A("ZodTransform", (e, t) => {
	Yo(), Jr.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => mo(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new ut(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(Ye(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", "input" in t || (t.input = n.value), t.inst ??= e, n.issues.push(Ye(t));
			}
		};
		let i = t.transform(n.value, n);
		return i instanceof Promise ? i.then((e) => (n.value = e, n)) : (n.value = i, n);
	};
});
function Ys(e) {
	return new Js({
		type: "transform",
		transform: e
	});
}
var Xs = /*@__PURE__*/ A("ZodOptional", (e, t) => {
	Xr.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => No(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Zs(e) {
	return new Xs({
		type: "optional",
		innerType: e
	});
}
var Qs = /*@__PURE__*/ A("ZodExactOptional", (e, t) => {
	Zr.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => No(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function $s(e) {
	return new Qs({
		type: "optional",
		innerType: e
	});
}
var ec = /*@__PURE__*/ A("ZodNullable", (e, t) => {
	Qr.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => wo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function tc(e) {
	return new ec({
		type: "nullable",
		innerType: e
	});
}
var nc = /*@__PURE__*/ A("ZodDefault", (e, t) => {
	$r.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => Oo(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function rc(e, t) {
	return new nc({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : De(t);
		}
	});
}
var ic = /*@__PURE__*/ A("ZodPrefault", (e, t) => {
	ti.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => ko(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function ac(e, t) {
	return new ic({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : De(t);
		}
	});
}
var oc = /*@__PURE__*/ A("ZodNonOptional", (e, t) => {
	ni.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => To(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function sc(e, t) {
	return new oc({
		type: "nonoptional",
		innerType: e,
		...C(t)
	});
}
var cc = /*@__PURE__*/ A("ZodCatch", (e, t) => {
	ai.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ao(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function lc(e, t) {
	return new cc({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : at(t)
	});
}
var uc = /*@__PURE__*/ A("ZodPipe", (e, t) => {
	oi.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => jo(e, t, n, r), e.in = t.in, e.out = t.out;
});
function dc(e, t) {
	return new uc({
		type: "pipe",
		in: e,
		out: t
	});
}
var fc = /*@__PURE__*/ A("ZodReadonly", (e, t) => {
	ci.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => Mo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function pc(e) {
	return new fc({
		type: "readonly",
		innerType: e
	});
}
var mc = /*@__PURE__*/ A("ZodCustom", (e, t) => {
	ui.init(e, t), q.init(e, t), e._zod.processJSONSchema = (t, n, r) => po(e, t, n, r);
});
function hc(e, t = {}) {
	return /* @__PURE__ */ Na(mc, e, t);
}
function gc(e, t) {
	return /* @__PURE__ */ Pa(e, t);
}
//#endregion
//#region src/features/security/rbac.ts
var _c = /* @__PURE__ */ "payroll.read,payroll.manage,payroll.approve,payroll.post,purchases.return.read,purchases.return,documents.prepare,sales.read,sales.write,sales.manage,sales.payment,purchases.read,purchases.receive,purchases.bill,purchases.void,inventory.read,inventory.cost.read,inventory.adjust,accounting.read,accounting.post,accounting.periods,accounting.reopen,accounting.recover,audit.read,users.manage,contacts.write,purchases.write,purchases.payment,banking.read,banking.write,banking.reconcile".split(","), vc = [
	"ADMIN",
	"FINANCE_ADMIN",
	"ACCOUNTANT",
	"SALES",
	"WAREHOUSE",
	"PURCHASING",
	"AUDITOR"
], yc = {
	ADMIN: _c,
	FINANCE_ADMIN: /* @__PURE__ */ "payroll.read,payroll.manage,payroll.approve,payroll.post,purchases.return.read,purchases.return,documents.prepare,accounting.periods,accounting.reopen,sales.read,sales.manage,sales.payment,purchases.read,purchases.bill,purchases.void,inventory.read,inventory.cost.read,accounting.read,accounting.post,accounting.recover,audit.read,banking.read,banking.write,banking.reconcile,purchases.payment,purchases.write,contacts.write".split(","),
	ACCOUNTANT: [
		"payroll.read",
		"payroll.manage",
		"payroll.approve",
		"payroll.post",
		"purchases.return.read",
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
		"purchases.return.read",
		"purchases.return",
		"contacts.write",
		"purchases.write",
		"purchases.read",
		"purchases.receive",
		"purchases.bill",
		"inventory.read"
	],
	AUDITOR: [
		"purchases.return.read",
		"banking.read",
		"sales.read",
		"purchases.read",
		"inventory.read",
		"inventory.cost.read",
		"accounting.read",
		"audit.read"
	]
};
function Y(e, t) {
	return !!(e?.authenticated && e.userId.trim() && e.roles.some((e) => Object.prototype.hasOwnProperty.call(yc, e) && yc[e].includes(t)));
}
function bc(e, t) {
	if (!Y(e, t)) throw Error(`Permission denied: ${t}. Verified session required.`);
	return e;
}
//#endregion
//#region src/features/attachments/attachmentModel.ts
var xc = [
	"Customer",
	"Supplier",
	"Quote",
	"Order",
	"Invoice",
	"Customer credit",
	"Purchase order",
	"Bill",
	"Supplier credit",
	"Task",
	"Visit",
	"Job",
	"Journal",
	"Product"
], Sc = Ls({
	kind: Gs(xc),
	id: Qo().min(1).max(200)
}).strict(), Cc = {
	Customer: {
		repository: "customers",
		collection: "customers",
		read: "sales.read",
		write: "contacts.write",
		path: "/contacts/customers/",
		label: ["code", "businessName"]
	},
	Supplier: {
		repository: "suppliers",
		collection: "suppliers",
		read: "purchases.read",
		write: "contacts.write",
		path: "/contacts/suppliers/",
		label: ["code", "businessName"]
	},
	Quote: {
		repository: "sales",
		collection: "quotes",
		read: "sales.read",
		write: "sales.write",
		path: "/sales/quotes/",
		label: ["documentNumber"]
	},
	Order: {
		repository: "sales",
		collection: "salesOrders",
		read: "sales.read",
		write: "sales.manage",
		path: "/sales/orders/",
		label: ["documentNumber"]
	},
	Invoice: {
		repository: "sales",
		collection: "invoices",
		read: "sales.read",
		write: "sales.manage",
		path: "/sales/invoices/",
		label: ["documentNumber"]
	},
	"Customer credit": {
		repository: "customerCredits",
		collection: "creditNotes",
		read: "sales.read",
		write: "sales.manage",
		path: "/sales/credits/",
		label: ["creditNoteNumber"]
	},
	"Purchase order": {
		repository: "purchaseOrders",
		collection: "purchaseOrders",
		read: "purchases.read",
		write: "purchases.write",
		path: "/purchases/",
		label: ["purchaseOrderNumber"]
	},
	Bill: {
		repository: "supplierBills",
		collection: "supplierBills",
		read: "purchases.read",
		write: "purchases.bill",
		path: "/purchases/bills/",
		label: ["billNumber"]
	},
	"Supplier credit": {
		repository: "supplierCredits",
		collection: "supplierCredits",
		read: "purchases.read",
		write: "purchases.bill",
		path: "/purchases/credits/",
		label: ["creditNumber"]
	},
	Task: {
		repository: "workspace_tasks",
		collection: "records",
		read: "sales.read",
		write: "sales.write",
		path: "/tasks/",
		label: ["name"]
	},
	Visit: {
		repository: "salesVisits",
		collection: "visits",
		read: "sales.read",
		write: "sales.write",
		path: "/sales/activity/",
		label: ["subject", "name"]
	},
	Job: {
		repository: "workspace_jobs",
		collection: "records",
		read: "accounting.read",
		write: "accounting.post",
		path: "/accounting/jobs/",
		label: ["code", "name"]
	},
	Journal: {
		repository: "journals",
		collection: "journalEntries",
		read: "accounting.read",
		write: "accounting.post",
		path: "/accounting/journals/",
		label: ["journalNumber"]
	},
	Product: {
		repository: "products",
		collection: "products",
		read: "inventory.read",
		write: "inventory.adjust",
		path: "/inventory/products/",
		label: ["sku", "name"]
	}
};
function wc(e, t) {
	return xc.flatMap((n) => {
		let r = Cc[n];
		return Y(t, r.read) ? (e[r.repository]?.[r.collection] ?? []).map((e) => ({
			kind: n,
			id: String(e.id),
			label: r.label.map((t) => e[t]).filter(Boolean).join(" · ") || String(e.id),
			canWrite: Y(t, r.write),
			path: ie(String(e.id)) ? "/sales/recycle-bin" : (n === "Customer" || n === "Supplier") && !Y(t, "contacts.write") ? "" : r.path + encodeURIComponent(String(e.id))
		})) : [];
	});
}
var Tc = 1e7, Ec = 5e7, Dc = {
	".pdf": "application/pdf",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".csv": "text/csv",
	".txt": "text/plain",
	".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
};
function Oc(e, t) {
	if (typeof e != "string" || e.length > 200 || e !== d(e) || /[\\/\x00-\x1f\x7f]/.test(e) || e === "." || e === "..") throw Error("Choose a plain file name of at most 200 characters.");
	let n = p(e).toLowerCase(), r = Dc[n];
	if (!r) throw Error("Supported files: PDF, PNG, JPEG, CSV, TXT, DOCX and XLSX.");
	if (typeof t != "string" || t.length > 13333336 || /[^A-Za-z0-9+/=]/.test(t)) throw Error("Invalid or oversized file content.");
	let i = Buffer.from(t, "base64");
	if (!i.length || i.length > 1e7 || i.toString("base64") !== t) throw Error("Choose a nonempty file no larger than 10 MB.");
	let a = (e) => i.subarray(0, e.length / 2).toString("hex") === e;
	if (n === ".pdf" && i.subarray(0, 5).toString() !== "%PDF-" || n === ".png" && !a("89504e470d0a1a0a") || [".jpg", ".jpeg"].includes(n) && !a("ffd8ff") || [".docx", ".xlsx"].includes(n) && !a("504b0304")) throw Error("File content does not match its extension.");
	if ([".csv", ".txt"].includes(n) && new TextDecoder("utf-8", { fatal: !0 }).decode(i).includes("\0")) throw Error("Text files must contain UTF-8 text without NUL characters.");
	return {
		name: e,
		mime: r,
		size: i.length,
		sha256: l("sha256").update(i).digest("hex"),
		content: t
	};
}
function kc(e) {
	let t = Oc(e.name, e.content);
	if (t.size !== e.size || t.sha256 !== e.sha256 || t.mime !== e.mime) throw Error("Attachment content integrity check failed.");
	return Buffer.from(e.content, "base64");
}
function Ac(t, n) {
	let a = m(f(t), ".htt-attachment-" + u() + ".tmp"), l;
	try {
		l = i(a, "wx", 384), c(l, n), r(l), e(l), l = void 0, o(a, t);
	} catch (t) {
		l !== void 0 && e(l);
		try {
			s(a);
		} catch {}
		throw t;
	}
}
function jc(r) {
	let o = i(r, t.O_RDONLY | t.O_NOFOLLOW | t.O_NONBLOCK);
	try {
		let e = n(o);
		if (!e.isFile() || e.size > 1e7) throw Error("Choose a regular file no larger than 10 MB.");
		let t = Buffer.alloc(Tc + 1), r = 0;
		for (; r < t.length;) {
			let e = a(o, t, r, t.length - r, null);
			if (!e) break;
			r += e;
		}
		if (r > 1e7) throw Error("File grew beyond 10 MB.");
		return t.subarray(0, r);
	} finally {
		e(o);
	}
}
//#endregion
//#region electron/security/documentPurgeBackup.ts
var Mc;
function Nc(e) {
	Mc = e;
}
function Pc() {
	if (!Mc) throw Error("A verified desktop backup is required before permanent purge.");
	return Mc();
}
//#endregion
//#region src/features/security/repositoryHost.ts
var X = /* @__PURE__ */ new Map(), Fc, Ic = () => globalThis.__HTT_MAIN_HOST__ === !0;
function Lc() {
	return typeof window > "u" ? void 0 : window.securityBridge;
}
function Rc(e, t) {
	let n = Lc();
	if (!n) throw Error("This operation requires the secure Electron desktop application.");
	let r = n.request(e, t);
	if (!r.ok) throw Error("error" in r ? r.error : "Desktop request failed.");
	return r.value;
}
function zc(e) {
	if (typeof window < "u") try {
		for (let e of Object.keys(window.localStorage)) e.startsWith("htt") && window.localStorage.removeItem(e);
		for (let [t, n] of Object.entries(e.storage)) window.localStorage.setItem(t, n);
	} catch {}
	Fc = e, Uc(e.repositories, !1), X.forEach((e) => e.publish());
}
function Bc(e, t) {
	if (X.has(e)) throw Error(`Duplicate repository registration: ${e}`);
	if (X.set(e, t), !Ic()) {
		Fc && Object.hasOwn(Fc.repositories, e) && t.restore(structuredClone(Fc.repositories[e]));
		for (let [n, r] of Object.entries(t.commands)) Object.hasOwn(t.repository, n) && (t.repository[n] = (...t) => {
			if (!r) throw Error(`Internal repository method is not a desktop command: ${e}.${n}`);
			let i = Rc("business.command", {
				repository: e,
				method: n,
				args: t
			});
			return zc(i.view), i.result;
		});
	}
}
function Vc(e) {
	return Object.fromEntries([...X].filter(([t]) => !e || e.includes(t)).map(([e, t]) => [e, structuredClone(t.snapshot())]));
}
function Hc(e) {
	for (let [t, n] of Object.entries(e)) X.get(t)?.validate?.(structuredClone(n), e);
}
function Uc(e, t = !0) {
	for (let [n, r] of Object.entries(e)) {
		let e = X.get(n);
		if (!e) {
			if (t) throw Error(`Unknown repository in desktop snapshot: ${n}`);
			continue;
		}
		e.restore(structuredClone(r));
	}
}
function Wc(e, t) {
	let n = X.get(e), r = n && Object.hasOwn(n.commands, t) ? n.commands[t] : null;
	if (!r || typeof n?.repository[t] != "function") throw Error("Unknown or internal desktop business command.");
	return {
		permission: r,
		execute: (r) => (se(e, r), n.repository[t].apply(n.repository, r))
	};
}
function Gc(e) {
	return Object.fromEntries([...X].map(([t, n]) => {
		let r = structuredClone(n.snapshot()), i = Y(e, n.read), a = Array.isArray(r) ? [] : Object.fromEntries(Object.keys(r).map((e) => [e, []]));
		return [t, i ? n.view?.(e) ?? r : a];
	}));
}
//#endregion
//#region src/features/business-workspace/configurationState.ts
var Z = {}, Kc = (e) => Z["linked-accounts"]?.find((t) => t.status === "Active" && t.role === e)?.accountId;
function qc(e) {
	e ??= Xc().gstCode;
	let t = Z["tax-codes"]?.find((t) => t.status === "Active" && t.code === e);
	if (!t) {
		if (!Z["tax-codes"] && e === "GST") return .1;
		throw Error(`Active tax code ${e} was not found.`);
	}
	return Number(t.rate) / 100;
}
function Jc(e) {
	let t = Date.parse(e.at.length === 10 ? e.at + "T00:00:00Z" : e.at), n = (Z.promotions ?? []).filter((n) => n.status === "Active" && n.productId === e.productId && n.unitId === e.unitId && (!n.customerId || n.customerId === e.customerId) && Date.parse(n.starts) <= t && t < Date.parse(n.ends));
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
function Yc(e) {
	return (Z["linked-accounts"] ?? []).some((t) => t.status === "Active" && t.accountId === e) || (Z["tax-codes"] ?? []).some((t) => t.status === "Active" && (t.collected === e || t.paid === e));
}
function Xc() {
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
		...Z.settings?.find((e) => e.section === "business" && e.status === "Active")
	};
}
function Zc(e, t, n) {
	t = [...t, ...ae()];
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
	let i = Xc(), a = `${i[r[0]]}-${n}-`, o = Math.max(Number(i[r[1]]), 1, ...t.filter((e) => e.startsWith(a)).map((e) => Number(e.slice(a.length)) + 1).filter(Number.isFinite));
	if (!Number.isSafeInteger(o) || o > 999999999) throw Error("Document number sequence exhausted.");
	return `${a}${String(o).padStart(4, "0")}`;
}
function Qc(e) {
	let t = Z["tax-codes"]?.find((t) => t.code === e && t.status === "Active");
	return {
		taxCode: e,
		taxRate: qc(e),
		taxCollectedAccountId: t?.collected,
		taxPaidAccountId: t?.paid,
		taxReport: t?.report ?? e
	};
}
function $c(e, t, n = Xc().basis) {
	return n === "Inclusive" ? Math.round(e / (1 + t) * 1e8) / 1e8 : e;
}
//#endregion
//#region src/lib/businessDate.ts
function el(e) {
	if (/^\d{4}-\d{2}-\d{2}$/.test(e)) return e;
	let t = new Date(e);
	if (!Number.isFinite(t.getTime())) throw Error("Invalid accounting timestamp.");
	let n = new Intl.DateTimeFormat("en-NZ", {
		timeZone: Xc().timezone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(t), r = (e) => n.find((t) => t.type === e)?.value;
	return `${r("year")}-${r("month")}-${r("day")}`;
}
function Q(e, t = "Date") {
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e) || !Number.isFinite(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} must be a valid YYYY-MM-DD date.`);
}
//#endregion
//#region src/features/banking/data/bankJournalEvidence.ts
var tl = (e) => Math.round((e + 2 ** -52) * 100) / 100, nl = (e) => e.lines.length >= 2 && new Set(e.lines.map((e) => e.id)).size === e.lines.length && Number.isFinite(e.totalDebit) && e.totalDebit > 0 && e.totalDebit === e.totalCredit && tl(e.totalDebit) === e.totalDebit && e.lines.every((e) => Number.isFinite(e.debit) && Number.isFinite(e.credit) && e.debit >= 0 && e.credit >= 0 && tl(e.debit) === e.debit && tl(e.credit) === e.credit && !(e.debit && e.credit)) && tl(e.lines.reduce((e, t) => e + t.debit, 0)) === e.totalDebit && tl(e.lines.reduce((e, t) => e + t.credit, 0)) === e.totalCredit, rl = (e, t = !1) => JSON.stringify(e.lines.map((e) => [
	e.accountId,
	e.description ?? null,
	t ? e.credit : e.debit,
	t ? e.debit : e.credit
]).sort((e, t) => JSON.stringify(e).localeCompare(JSON.stringify(t))));
function il(e, t, n) {
	if (!e || !t || e.id === t.id || n.filter((t) => t.id === e.id).length !== 1 || n.filter((e) => e.id === t.id).length !== 1 || e.status !== "REVERSED" || e.reversedJournalEntryId || !e.reversalReason?.trim() || !Number.isFinite(Date.parse(e.reversedAt ?? "")) || e.reversedAt !== t.postedAt || e.reversalJournalEntryId !== t.id || t.status !== "POSTED" || t.reversedJournalEntryId !== e.id || t.reversalJournalEntryId || t.reversedAt || t.sourceType !== e.sourceType || t.sourceId !== void 0 || t.reference !== e.reference || n.filter((t) => t.reversedJournalEntryId === e.id).length !== 1 || n.filter((e) => e.reversalJournalEntryId === t.id).length !== 1) return !1;
	try {
		Q(e.journalDate), Q(t.journalDate);
	} catch {
		return !1;
	}
	return t.journalDate >= e.journalDate && nl(e) && nl(t) && e.totalDebit === t.totalCredit && e.totalCredit === t.totalDebit && rl(e, !0) === rl(t);
}
function al(e, t) {
	return t.filter((t) => t.id === e.id).length === 1 ? e.reversedJournalEntryId ? il(t.find((t) => t.id === e.reversedJournalEntryId), e, t) : e.status === "REVERSED" || e.reversalJournalEntryId || e.reversedAt ? il(e, t.find((t) => t.id === e.reversalJournalEntryId), t) : e.status === "POSTED" && !t.some((t) => t.reversedJournalEntryId === e.id || t.reversalJournalEntryId === e.id) : !1;
}
function ol(e) {
	return new Set(e.filter((t) => !al(t, e)).map((e) => e.id));
}
function sl(e, t, n) {
	try {
		Q(e.journalDate), Q(n);
	} catch {
		return !1;
	}
	return e.journalDate > n || !al(e, t) ? !1 : e.status === "POSTED" || t.find((t) => t.id === e.reversalJournalEntryId).journalDate > n;
}
//#endregion
//#region src/features/accounting/data/bankDuplicateCorrection.ts
var cl = (e) => e.lines.length === 2 && new Set(e.lines.map((e) => e.id)).size === 2 && Number.isFinite(e.totalDebit) && e.totalDebit > 0 && e.totalDebit === e.totalCredit && Math.abs(e.totalDebit * 100 - Math.round(e.totalDebit * 100)) < 1e-6 && e.lines.every((t) => Number.isFinite(t.debit) && Number.isFinite(t.credit) && (t.debit === e.totalDebit && t.credit === 0 || t.credit === e.totalCredit && t.debit === 0)) && e.lines[0].accountId !== e.lines[1].accountId && e.lines.reduce((e, t) => e + t.debit, 0) === e.totalDebit && e.lines.reduce((e, t) => e + t.credit, 0) === e.totalCredit, ll = (e, t = !1) => JSON.stringify(e.lines.map((e) => [
	e.accountId,
	e.description ?? null,
	t ? e.credit : e.debit,
	t ? e.debit : e.credit
]).sort((e, t) => JSON.stringify(e).localeCompare(JSON.stringify(t))));
function ul(e, t) {
	return cl(e) && cl(t) && ["BANK_TRANSACTION", "BANK_TRANSFER"].includes(e.sourceType) && e.sourceType === t.sourceType && !!e.sourceId && e.sourceId === t.sourceId && e.journalDate === t.journalDate && e.description === t.description && e.reference === t.reference && e.totalDebit === t.totalDebit && e.totalCredit === t.totalCredit && ll(e) === ll(t);
}
function dl(e) {
	let t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), r = [], i = e.filter((e) => e.bankDuplicateCorrection !== void 0);
	if (!i.length) return {
		originals: t,
		offsets: n,
		invalid: r
	};
	let a = ol(e), o = (t) => e.filter((e) => e.id === t);
	for (let s of i) {
		let i = s.bankDuplicateCorrection, c = i && o(i.canonicalJournalId), l = s.reversalJournalEntryId && o(s.reversalJournalEntryId);
		if (!i || typeof i.operationId != "string" || !i.operationId.trim() || !c || c.length !== 1 || !l || l.length !== 1 || o(s.id).length !== 1) {
			r.push(s.id);
			continue;
		}
		let u = c[0], d = l[0];
		[
			u.id,
			s.id,
			d.id
		].some((e) => a.has(e)) || u.id === s.id || u.bankDuplicateCorrection || u.status !== "POSTED" || u.reversedJournalEntryId || u.reversalJournalEntryId || u.reversedAt || s.status !== "REVERSED" || s.reversedJournalEntryId || !s.reversalReason?.trim() || !s.reversedAt || s.reversedAt !== d.postedAt || !ul(s, u) || d.status !== "POSTED" || d.bankDuplicateCorrection || d.sourceType !== s.sourceType || d.sourceId !== void 0 || d.journalDate !== s.journalDate || d.reference !== s.reference || d.reversedJournalEntryId !== s.id || d.reversalJournalEntryId || d.reversedAt || d.totalDebit !== s.totalCredit || d.totalCredit !== s.totalDebit || ll(d) !== ll(s, !0) || e.filter((e) => e.reversedJournalEntryId === s.id).length !== 1 || e.some((e) => e.reversedJournalEntryId === u.id) ? r.push(s.id) : (t.add(s.id), n.add(d.id));
	}
	return {
		originals: t,
		offsets: n,
		invalid: r
	};
}
//#endregion
//#region src/lib/persistence/financialOperationValidation.ts
var fl = [
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
], pl = [
	"PENDING",
	"COMPLETED",
	"MANUAL_REVIEW"
], ml = (e) => Array.isArray(e) && e.every((e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.operationId == "string" && t.operationId.length > 0 && fl.includes(String(t.kind)) && typeof t.fingerprint == "string" && t.fingerprint.length > 0 && pl.includes(String(t.state)) && typeof t.createdAt == "string" && typeof t.updatedAt == "string" && (t.resolution === void 0 || [
		"SOURCE_METADATA_REPAIRED",
		"CANCELLED_NO_EFFECT",
		"BANK_RECORD_RESTORED",
		"BANK_JOURNAL_RESTORED",
		"BANK_JOURNAL_LINK_RESTORED",
		"BANK_DUPLICATE_REVERSED"
	].includes(String(t.resolution)) && t.state === "COMPLETED" && typeof t.resultId == "string" && !!t.resultId && !!t.repairProposal && t.repairProposal.status === "EXECUTED") && (t.repairProposal === void 0 || hl(t.repairProposal) && gl(t)) && (t.repairProposalHistory === void 0 || Array.isArray(t.repairProposalHistory) && t.repairProposalHistory.every((e) => hl(e) && e.status === "PROPOSED" && gl({
		...t,
		repairProposal: e,
		resolution: void 0,
		state: "MANUAL_REVIEW"
	}) && t.reviewHistory?.some((t) => t.reference === e.reference && t.operator === e.reviewer))) && (t.resultId === void 0 || typeof t.resultId == "string") && (t.note === void 0 || typeof t.note == "string") && (t.reviewHistory === void 0 || Array.isArray(t.reviewHistory) && t.reviewHistory.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		return typeof t.reference == "string" && t.reference.length >= 3 && typeof t.operator == "string" && t.operator.length >= 2 && typeof t.recordedAt == "string" && typeof t.summary == "string" && t.summary.length >= 3;
	}));
}) && new Set(e.map((e) => e.operationId)).size === e.length && new Set(e.filter((e) => e.repairProposal).map((e) => e.repairProposal.id)).size === e.filter((e) => e.repairProposal).length && (() => {
	let t = e.flatMap((e) => [...e.repairProposal ? [e.repairProposal.id] : [], ...(e.repairProposalHistory ?? []).map((e) => e.id)]);
	return new Set(t).size === t.length;
})();
function hl(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.reference != "string" || t.reference.trim().length < 3 || typeof t.summary != "string" || t.summary.trim().length < 10 || !Number.isFinite(Date.parse(String(t.proposedAt))) ? !1 : [
		"id",
		"planJson",
		"reviewer",
		"reference",
		"summary",
		"proposedAt"
	].every((e) => typeof t[e] == "string" && t[e].length > 0) && typeof t.evidenceDigest == "string" && /^[a-f0-9]{64}$/.test(t.evidenceDigest) && [
		"REPAIR_SOURCE_METADATA",
		"CANCEL_NO_EFFECT",
		"RESTORE_BANK_RECORD",
		"RESTORE_BANK_JOURNAL",
		"RESTORE_BANK_JOURNAL_LINK",
		"REVERSE_BANK_DUPLICATE"
	].includes(String(t.action)) && ["PROPOSED", "EXECUTED"].includes(String(t.status)) && (t.status !== "EXECUTED" || [
		"approver",
		"approvalReference",
		"executedAt",
		"afterDigest"
	].every((e) => typeof t[e] == "string" && t[e].length > 0) && String(t.approver).toLowerCase() !== String(t.reviewer).toLowerCase() && /^[a-f0-9]{64}$/.test(String(t.afterDigest)));
}
function gl(e) {
	try {
		if (![
			"SOURCE_METADATA_REPAIR",
			"BANK_TRANSACTION",
			"BANK_TRANSFER"
		].includes(String(e.kind))) return !1;
		let t = e.repairProposal, n = JSON.parse(t.planJson), r = e.reviewHistory;
		if (!r?.some((e) => e.reference === t.reference && e.operator === t.reviewer) || !e.resultId || n.operationId !== e.operationId || n.resultId !== e.resultId || n.action !== t.action || n.evidenceDigest !== t.evidenceDigest || n.eligible !== !0 || e.kind === "SOURCE_METADATA_REPAIR" != (t.action === "REPAIR_SOURCE_METADATA") || t.action === "REPAIR_SOURCE_METADATA" && !vl(n.changes) || t.action === "RESTORE_BANK_JOURNAL_LINK" && (typeof n.previousJournalId != "string" || !n.previousJournalId.trim() || typeof n.existingJournalId != "string" || !n.existingJournalId.trim() || n.previousJournalId === n.existingJournalId || t.status === "EXECUTED" && t.resultJournalId !== n.existingJournalId) || t.action === "REVERSE_BANK_DUPLICATE" && (typeof n.duplicateJournalId != "string" || !n.duplicateJournalId.trim() || typeof n.existingJournalId != "string" || !n.existingJournalId.trim() || n.duplicateJournalId === n.existingJournalId || t.status === "EXECUTED" && (!t.resultJournalId || t.resultJournalId === n.duplicateJournalId || t.resultJournalId === n.existingJournalId))) return !1;
		if (t.status === "EXECUTED") {
			let n = t.action === "REPAIR_SOURCE_METADATA" ? "SOURCE_METADATA_REPAIRED" : t.action === "CANCEL_NO_EFFECT" ? "CANCELLED_NO_EFFECT" : t.action === "RESTORE_BANK_RECORD" ? "BANK_RECORD_RESTORED" : t.action === "REVERSE_BANK_DUPLICATE" ? "BANK_DUPLICATE_REVERSED" : t.action === "RESTORE_BANK_JOURNAL_LINK" ? "BANK_JOURNAL_LINK_RESTORED" : "BANK_JOURNAL_RESTORED";
			return e.state === "COMPLETED" && e.resolution === n && r.some((e) => e.reference === t.approvalReference && e.operator === t.approver) && Number.isFinite(Date.parse(t.executedAt));
		}
		return e.resolution === void 0;
	} catch {
		return !1;
	}
}
function _l(e) {
	let t = e["htt:financial-operations:v1"];
	if (t !== void 0) try {
		let e = JSON.parse(t);
		if (e.schemaVersion !== 1 || typeof e.savedAt != "string" || !ml(e.data)) throw Error("Invalid operation registry.");
	} catch {
		throw Error("Financial operation journal or repair evidence is invalid; recovery is blocked.");
	}
}
function vl(e) {
	if (!Array.isArray(e) || !e.length || e.length > 1e4) return !1;
	let t = (e, t) => !!e && typeof e == "object" && !Array.isArray(e) && Object.keys(e).sort().join("|") === [...t].sort().join("|"), n = (e) => typeof e == "number" && Number.isFinite(e);
	return e.every((e) => {
		if (!e || typeof e.id != "string" || !e.id.trim() || e.id.length > 200 || typeof e.path != "string" || !Array.isArray(e.evidence) || !e.evidence.every((e) => typeof e == "string") || !t(e, [
			"kind",
			"id",
			"path",
			"before",
			"after",
			"evidence"
		])) return !1;
		if (e.kind === "OPERATION") return t(e.before, ["state", "resultId"]) && t(e.after, ["state", "resultId"]) && ["PENDING", "MANUAL_REVIEW"].includes(e.before.state) && (e.before.resultId === null || typeof e.before.resultId == "string") && e.after.state === "COMPLETED" && typeof e.after.resultId == "string" && !!e.after.resultId.trim();
		if (e.kind === "PURCHASE_OPERATION") return t(e.before, ["status", "error"]) && t(e.after, ["status", "error"]) && [
			"PENDING",
			"POSTING",
			"FAILED",
			"RECOVERY_REQUIRED",
			"POSTED"
		].includes(e.before.status) && (e.before.error === null || typeof e.before.error == "string") && e.after.status === "POSTED" && e.after.error === null;
		let r = e.kind === "INVOICE" ? [
			"amountPaid",
			"amountDue",
			"status"
		] : e.kind === "BILL" ? [
			"amountPaid",
			"amountCredited",
			"amountDue",
			"status"
		] : ["CUSTOMER_CREDIT", "SUPPLIER_CREDIT"].includes(e.kind) ? [
			"amountApplied",
			"amountAvailable",
			"status"
		] : void 0;
		if (!r || !t(e.before, r) || !t(e.after, r)) return !1;
		let i = e.kind === "INVOICE" ? [
			"ISSUED",
			"OVERDUE",
			"PARTIALLY_PAID",
			"PAID"
		] : e.kind === "BILL" ? [
			"OPEN",
			"PARTIALLY_PAID",
			"PAID"
		] : ["ISSUED", "FULLY_APPLIED"];
		return i.includes(e.before.status) && i.includes(e.after.status) && r.filter((e) => e !== "status").every((t) => n(e.before[t]) && n(e.after[t]) && e.after[t] >= 0 && Number.isSafeInteger(Math.round(e.after[t] * 100)) && e.after[t] === Math.round(e.after[t] * 100) / 100);
	});
}
//#endregion
//#region src/features/accounting/data/accountingPeriodValidation.ts
function yl(e) {
	if (!Array.isArray(e)) throw Error("Invalid accounting periods.");
	let t = [...e].sort((e, t) => String(e?.startDate).localeCompare(String(t?.startDate)));
	for (let e = 0; e < t.length; e++) {
		let n = t[e];
		if (!n || typeof n.id != "string" || !n.id || typeof n.name != "string" || !n.name.trim() || !["OPEN", "CLOSED"].includes(n.status) || !Array.isArray(n.history) || !n.history.length) throw Error("Invalid accounting period record.");
		if (Q(n.startDate), Q(n.endDate), n.startDate > n.endDate || e && t[e - 1].endDate >= n.startDate) throw Error("Overlapping or invalid accounting periods.");
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
//#region electron/security/businessSnapshot.ts
var $ = (e) => !!e && typeof e == "object" && !Array.isArray(e);
function bl(e) {
	let t = {
		schemaVersion: 26,
		savedAt: (/* @__PURE__ */ new Date()).toISOString(),
		storage: e.storage,
		repositories: e.repositories,
		...e.lastCommandId === void 0 ? {} : { lastCommandId: e.lastCommandId }
	};
	return {
		...t,
		checksum: l("sha256").update(JSON.stringify(t)).digest("hex")
	};
}
function xl(e) {
	if (Buffer.byteLength(e) > 25e7) throw Error("Business snapshot exceeds 250 MB.");
	let t = JSON.parse(e);
	if (!$(t) || ![
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		11,
		12,
		13,
		14,
		15,
		16,
		17,
		18,
		19,
		20,
		21,
		22,
		23,
		24,
		25,
		26
	].includes(t.schemaVersion)) throw Error("Unsupported business snapshot version.");
	if (!$(t.storage) || !Object.entries(t.storage).every(([e, t]) => e.startsWith("htt") && typeof t == "string") || !$(t.repositories) || t.lastCommandId !== void 0 && typeof t.lastCommandId != "string") throw Error("Invalid business snapshot structure.");
	if (t.schemaVersion === 2 || t.schemaVersion === 3 || t.schemaVersion === 4 || t.schemaVersion === 5 || t.schemaVersion === 6 || t.schemaVersion === 7 || t.schemaVersion === 8 || t.schemaVersion === 9 || t.schemaVersion === 10 || t.schemaVersion === 11 || t.schemaVersion === 12 || t.schemaVersion === 13 || t.schemaVersion === 14 || t.schemaVersion === 15 || t.schemaVersion === 16 || t.schemaVersion === 17 || t.schemaVersion === 18 || t.schemaVersion === 19 || t.schemaVersion === 20 || t.schemaVersion === 21 || t.schemaVersion === 22 || t.schemaVersion === 23 || t.schemaVersion === 24 || t.schemaVersion === 25 || t.schemaVersion === 26) {
		let { checksum: e, ...n } = t;
		if (typeof t.savedAt != "string" || !Number.isFinite(Date.parse(t.savedAt)) || e !== l("sha256").update(JSON.stringify(n)).digest("hex")) throw Error("Business snapshot checksum failed.");
	}
	if (_l(t.storage), Number(t.schemaVersion) < 24) {
		let e = t.storage["htt:financial-operations:v1"];
		if (e && JSON.parse(e).data.some((e) => e.kind === "SOURCE_METADATA_REPAIR" || e.repairProposalHistory?.length)) throw Error("Source repair evidence requires snapshot schema 24.");
	}
	if (Number(t.schemaVersion) < 26 && ["recurringBank", "recurringAutomation"].some((e) => {
		let n = t.repositories[e];
		return $(n) && Object.values(n).some((e) => Array.isArray(e) && e.length > 0);
	})) throw Error("Recurring automation evidence requires snapshot schema 26.");
	let n = t.repositories.documentRecycle?.history;
	if (Array.isArray(n) && n.some((e) => e.action === "Purged")) {
		if (Number(t.schemaVersion) < 25) throw Error("Permanent purge evidence requires snapshot schema 25.");
		let e = t.storage["htt:financial-operations:v1"], r = (e, t) => typeof e == "string" ? e === t || e.startsWith(t + ":") || (e.startsWith("{") || e.startsWith("[")) && (() => {
			try {
				return r(JSON.parse(e), t);
			} catch {
				return !1;
			}
		})() : Array.isArray(e) ? e.some((e) => r(e, t)) : !!e && typeof e == "object" && Object.values(e).some((e) => r(e, t));
		if (e && n.some((t) => t.action === "Purged" && r(JSON.parse(e), t.recordId))) throw Error("Purged document is referenced by saved financial operation evidence.");
	}
	let r = t.repositories.journals?.journalEntries;
	if (Array.isArray(r) && r.some((e) => e.bankDuplicateCorrection !== void 0)) {
		let e = t.repositories.financialCache?.journals;
		if (JSON.stringify(e) !== JSON.stringify(r)) throw Error("Bank duplicate correction cache differs from source journals.");
		if (dl(r).invalid.length) throw Error("Invalid saved bank duplicate correction pair.");
		let n = t.storage["htt:financial-operations:v1"], i = n ? JSON.parse(n).data : [];
		for (let e of r.filter((e) => e.bankDuplicateCorrection)) {
			let t = e.bankDuplicateCorrection, n = i.find((e) => e.operationId === t.operationId), r = n?.repairProposal, a = r && JSON.parse(r.planJson);
			if (n?.resolution !== "BANK_DUPLICATE_REVERSED" || r?.status !== "EXECUTED" || r.action !== "REVERSE_BANK_DUPLICATE" || r.resultJournalId !== e.reversalJournalEntryId || a.duplicateJournalId !== e.id || a.existingJournalId !== t.canonicalJournalId || n.resultId !== e.sourceId) throw Error("Bank duplicate correction approval evidence is invalid.");
		}
	}
	return t;
}
function Sl(e, t) {
	if (JSON.stringify(Object.keys(e).sort()) !== JSON.stringify(Object.keys(t).sort())) throw Error("Business repository schema mismatch; migration required.");
	for (let [n, r] of Object.entries(t)) {
		let t = e[n];
		if (Array.isArray(r)) {
			if (!Array.isArray(t)) throw Error(`Invalid ${n} snapshot.`);
		} else if (!$(t) || JSON.stringify(Object.keys(t).sort()) !== JSON.stringify(Object.keys(r).sort()) || !Object.values(t).every(Array.isArray)) throw Error(`Invalid ${n} snapshot.`);
	}
	e.accountingPeriods && yl(e.accountingPeriods.periods);
	for (let t of Object.values(e)) {
		let e = Array.isArray(t) ? [t] : Object.values(t);
		for (let t of e) {
			let e = /* @__PURE__ */ new Set();
			for (let n of t) {
				if (!$(n)) throw Error("Invalid business record.");
				if ("id" in n) {
					if (typeof n.id != "string" || !n.id || e.has(n.id)) throw Error("Invalid or duplicate business record ID.");
					e.add(n.id);
				}
			}
		}
	}
}
function Cl(e) {
	return e.schemaVersion === 3 || e.schemaVersion === 4 || e.schemaVersion === 5 || e.schemaVersion === 6 || e.schemaVersion === 7 || e.schemaVersion === 8 || e.schemaVersion === 9 || e.schemaVersion === 10 || e.schemaVersion === 11 || e.schemaVersion === 12 || e.schemaVersion === 13 || e.schemaVersion === 14 || e.schemaVersion === 15 || e.schemaVersion === 16 || e.schemaVersion === 17 || e.schemaVersion === 18 || e.schemaVersion === 19 || e.schemaVersion === 20 || e.schemaVersion === 21 || e.schemaVersion === 22 || e.schemaVersion === 23 || e.schemaVersion === 24 || e.schemaVersion === 25 || e.schemaVersion === 26 ? !1 : (Object.hasOwn(e.repositories, "accountingPeriods") || (e.repositories.accountingPeriods = { periods: [] }), !0);
}
var wl = /* @__PURE__ */ "products.workspace_tax_codes.workspace_linked_accounts.workspace_promotions.workspace_jobs.workspace_tasks.workspace_bank_rules.workspace_templates.workspace_custom_reports.workspace_report_packs.workspace_settings.customerSettlements.supplierRefunds.bankStatements.paymentBatches.openingBalances.managedSalesDocuments.expenseBillDrafts.salesDispatch.preparedSalesOutputs.physicalSupplierReturns.recurringInvoices.recurringExpenses.salesVisits.contactReviews.jobCosting.attachments.dataTransfers.documentRecycle.payroll.physicalCustomerReturns.customerDeposits.supplierPrepayments.preparedPurchaseOutputs.recurringBank.recurringAutomation".split(".");
function Tl(e, t) {
	if (e.schemaVersion === 26) return !1;
	for (let n of wl) if (!Object.hasOwn(e.repositories, n)) {
		if (!Object.hasOwn(t, n)) throw Error("Workspace contracts are not initialized.");
		e.repositories[n] = structuredClone(t[n]);
	}
	return !0;
}
//#endregion
export { Ls as $, Vc as A, wc as B, Qc as C, Wc as D, Bc as E, kc as F, vc as G, Cc as H, jc as I, Fs as J, $o as K, Oc as L, Nc as M, Pc as N, Uc as O, Ac as P, Ts as Q, Tc as R, Jc as S, Rc as T, Y as U, Sc as V, bc as W, is as X, ks as Y, qs as Z, Z as _, Sl as a, ia as at, Yc as b, hl as c, oe as ct, ol as d, te as dt, Us as et, sl as f, le as ft, Xc as g, qc as h, bl as i, ss as it, Hc as j, Gc as k, dl as l, ne as lt, Q as m, Tl as n, zs as nt, yl as o, ie as ot, el as p, Gs as q, xl as r, js as rt, ml as s, ee as st, Cl as t, Qo as tt, ul as u, re as ut, Zc as v, zc as w, Kc as x, $c as y, Ec as z };
