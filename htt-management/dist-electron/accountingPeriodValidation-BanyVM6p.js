import { closeSync as e, constants as t, fstatSync as n, fsyncSync as r, openSync as i, readSync as a, renameSync as o, unlinkSync as s, writeFileSync as c } from "node:fs";
import { createHash as l, randomUUID as u } from "node:crypto";
import { basename as d, dirname as f, extname as p, join as m } from "node:path";
//#region src/features/document-recycle/recycleState.ts
var h = [
	"Quote",
	"Purchase order",
	"Sales order draft",
	"Invoice draft",
	"Expense bill draft"
], ee = {
	Quote: ["sales", "quotes"],
	"Purchase order": ["purchaseOrders", "purchaseOrders"],
	"Sales order draft": ["managedSalesDocuments", "drafts"],
	"Invoice draft": ["managedSalesDocuments", "drafts"],
	"Expense bill draft": ["expenseBillDrafts", "drafts"]
}, te = [], ne = () => te, re = (e) => {
	te = e;
}, ie = (e) => te.findLast((t) => t.recordId === e)?.action === "Trashed";
function ae(e, t) {
	if (![
		"sales",
		"purchaseOrders",
		"managedSalesDocuments",
		"expenseBillDrafts"
	].includes(e)) return;
	let n = (e) => typeof e == "string" ? ie(e) : Array.isArray(e) ? e.some(n) : !!e && typeof e == "object" && Object.values(e).some(n);
	if (n(t)) throw Error("This document is in the recycle bin. Recover it before using it.");
}
var oe = /* @__PURE__ */ new WeakMap();
function se(e) {
	let t = oe.get(e);
	if (t?.history === te) return t.rows;
	let n = e.filter((e) => !ie(e.id));
	return oe.set(e, {
		history: te,
		rows: n
	}), n;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/util.js
function ce(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function le(e, t = "|") {
	return e.map((e) => De(e)).join(t);
}
function ue(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
var de = class {
	constructor(e) {
		this._getter = e, this._value = void 0;
	}
	get value() {
		let e = this._getter;
		return e !== void 0 && (this._value = e(), this._getter = void 0), this._value;
	}
};
function fe(e) {
	return new de(e);
}
function pe(e) {
	return e == null;
}
function me(e) {
	let t = +!!e.startsWith("^"), n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function he(e, t) {
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
function ge(e) {
	let t = Object.getOwnPropertyDescriptor(e, "shape");
	return t?.get ? t.get.raw : t?.value;
}
function _(e) {
	return ge(e._zod.def) ?? e._zod.def.shape;
}
function _e(e, t, n) {
	Object.defineProperty(e, t, {
		get() {
			let e = n();
			return g(this, t, e), e;
		},
		enumerable: !0,
		configurable: !0
	});
}
function ve(e, t, n) {
	t in e ? g(e, t, n) : e[t] = n;
}
function v(e, t, n, r) {
	let i = _(t);
	for (let a of n) {
		let n = Object.getOwnPropertyDescriptor(i, a);
		n.enumerable && (n.get ? _e(e, a, () => {
			let e = t._zod.def.shape[a];
			return r ? r(e, a) : e;
		}) : ve(e, a, r ? r(n.value, a) : n.value));
	}
}
function ye(e, t) {
	for (let n of Reflect.ownKeys(t)) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.enumerable && (r.get ? _e(e, n, () => t[n]) : ve(e, n, r.value));
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
function be(e) {
	return JSON.stringify(e);
}
function xe(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var Se = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function Ce(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var we = /* @__PURE__*/ fe(() => {
	if (M.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function b(e) {
	if (Ce(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return Ce(n) !== !1 && Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") !== !1;
}
function Te(e) {
	return b(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var Ee = /* @__PURE__*/ new Set([
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
function De(e) {
	return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function Oe(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
var ke = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, Ae = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function je(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	let i = {};
	return v(i, e, Me(e, t)), S(e, y(n, {
		shape: i,
		checks: []
	}));
}
function Me(e, t) {
	let n = _(e), r = [];
	for (let e of Reflect.ownKeys(t)) {
		if (!Object.getOwnPropertyDescriptor(n, e)?.enumerable) throw Error(`Unrecognized key: "${String(e)}"`);
		t[e] && r.push(e);
	}
	return r;
}
function Ne(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	let i = new Set(Me(e, t)), a = {};
	return v(a, e, Reflect.ownKeys(_(e)).filter((e) => !i.has(e))), S(e, y(n, {
		shape: a,
		checks: []
	}));
}
function Pe(e, t) {
	if (!b(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = _(e);
		for (let e of Reflect.ownKeys(t)) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return S(e, y(e._zod.def, { shape: Fe(e, t) }));
}
function Fe(e, t) {
	let n = {};
	return v(n, e, Reflect.ownKeys(_(e))), ye(n, t), n;
}
function Ie(e, t) {
	if (!b(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return S(e, y(e._zod.def, { shape: Fe(e, t) }));
}
function Le(e, t) {
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
function Re(e, t, n, r = "partial") {
	let i = t._zod.def.checks;
	if (i && i.length > 0) throw Error(`.${r}() cannot be used on object schemas containing refinements`);
	let a = n ? new Set(Me(t, n)) : void 0, o = {};
	return v(o, t, Reflect.ownKeys(_(t)), e && ((t, n) => a && !a.has(n) ? t : new e({
		type: "optional",
		innerType: t
	}))), S(t, y(t._zod.def, {
		shape: o,
		checks: []
	}));
}
function ze(e, t, n) {
	let r = n ? new Set(Me(t, n)) : void 0, i = {};
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
function Be(e, t = 0) {
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
function Ve(e) {
	return typeof e == "string" ? e : e?.message;
}
function He(e, t, n) {
	var r;
	for (let i = t; i < e.length; i++) (r = e[i]).schema ?? (r.schema = n);
}
function E(e, t, n) {
	var r;
	let i = e.inst?._zod?.traits;
	i?.has("$ZodType") && (i.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
	let a = e.schema === e.inst ? void 0 : e.schema?._zod.def?.error, o = e.message ? e.message : Ve(e.inst?._zod.def?.error?.(e)) ?? Ve(a?.(e)) ?? Ve(t?.error?.(e)) ?? Ve(n.customError?.(e)) ?? Ve(n.localeError?.(e)) ?? "Invalid input", s = {};
	for (let t of Object.keys(e)) t !== "inst" && t !== "schema" && t !== "continue" && t !== "input" && t !== "__proto__" && (s[t] = e[t]);
	return s.path ??= [], s.message = o, t?.reportInput && (s.input = e.input), s;
}
var Ue = /[\uD800-\uDBFF]/;
function We(e) {
	let t = e.length;
	if (!Ue.test(e)) return t;
	let n = t;
	for (let r = 0; r < t - 1; r++) (e.charCodeAt(r) & 64512) == 55296 && (e.charCodeAt(r + 1) & 64512) == 56320 && (n--, r++);
	return n;
}
function Ge(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Ke(e) {
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
function qe(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
function Je(e, t) {
	for (let n in t) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.get ? Object.defineProperty(e, n, {
			...r,
			enumerable: !1
		}) : Ze(e, n, r.value);
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
function Ye(e, t, n) {
	return D(e, t, n, !1);
}
function Xe(e, t) {
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
function Ze(e, t, n) {
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
function Qe(e, t) {
	let n = Object.getPrototypeOf(e);
	return t in n ? void 0 : n;
}
var $e, O = !1, et = {
	configurable: !0,
	get() {
		O = !0;
	}
};
function k(e, t, n) {
	let r = Object.getPrototypeOf(e._zod);
	if (t in r && $e !== e._zod) {
		$e = void 0;
		return;
	}
	$e = e._zod, Object.defineProperty(r, t, {
		configurable: !0,
		get() {
			Object.defineProperty(this, t, et);
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
function tt(e, t, n, r) {
	let i = Qe(e, t);
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
var nt = "~constantCatch";
function rt(e) {
	let t = () => e;
	return t[nt] = !0, t;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/core.js
var it, at = {
	value: void 0,
	enumerable: !1
}, ot = "captureStackTrace" in Error ? Error : null;
function st(e) {
	let t = ot;
	if (t) {
		let n = t.stackTraceLimit;
		if (typeof n == "number") {
			try {
				t.stackTraceLimit = 0;
			} catch {
				return ot = null, new e();
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
			at.value = new a(r);
			try {
				Object.defineProperty(n, "_zod", at);
			} finally {
				at.value = void 0;
			}
		} else if (n._zod.traits.has(e)) return;
		if (n._zod.traits.add(e), t(n, r), s) {
			let e = Object.getPrototypeOf(n), t = n._zod.constr.prototype, r = e;
			for (; r && r !== t;) r = Object.getPrototypeOf(r);
			let i = r ?? e;
			s.has(i) || (s.add(i), Je(i, o));
		}
		let i = d.prototype;
		for (let e in i) Object.prototype.hasOwnProperty.call(i, e) && (e in n || (n[e] = i[e].bind(n)));
	}
	let l = r?.Parent ?? Object;
	class u extends l {}
	Object.defineProperty(u, "name", { value: e });
	function d(e) {
		let t = r?.Parent ? st(u) : this;
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
}, ct = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(it = globalThis).__zod_globalConfig ?? (it.__zod_globalConfig = {});
var M = globalThis.__zod_globalConfig;
function N(e) {
	return e && Object.assign(M, e), M;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/errors.js
function lt() {
	let e = this._zod;
	return e.message ??= JSON.stringify(e.def, ue, 2), e.message;
}
function ut(e) {
	this._zod.message = e;
}
var dt = {
	get: lt,
	set: ut,
	enumerable: !0,
	configurable: !0
}, ft = {
	value: void 0,
	enumerable: !1
}, pt = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), mt = (e, t) => {
	e.name = "$ZodError", ft.value = t, Object.defineProperty(e, "issues", ft), ft.value = void 0, Object.defineProperty(e, "message", dt);
	let n = Object.getPrototypeOf(e);
	pt.has(n) || (pt.add(n), Object.defineProperty(n, "toString", {
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
}, ht = A("$ZodError", mt);
A("$ZodError", mt, void 0, { Parent: Error });
function gt(e, t, n) {
	return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, {
		value: n(),
		writable: !0,
		enumerable: !0,
		configurable: !0
	}) : e[t] = n()), e[t];
}
function _t(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? gt(n, i.path[0], () => []).push(t(i)) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function vt(e, t = (e) => e.message) {
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
function yt(e, t) {
	return {
		callee: t?.callee ?? e,
		Err: t?.Err
	};
}
var bt = (e) => {
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
			throw Se(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, xt = (e) => {
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
			throw Se(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, St = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new j();
	return a.issues.length ? Ct(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
};
function Ct(e, t, n) {
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
var wt = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		async: !0
	} : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? Ct(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
}, Tt = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), Et = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), Dt = ((e, t, n) => {
	let r = e._zod.bag.validator;
	if (r !== void 0) {
		if (r(t) !== Tt) return !0;
		if (r.definite === !0 && n === void 0) return !1;
	}
	return Ot(e, t, n);
});
function Ot(e, t, n) {
	let r = n ? {
		...n,
		async: !1,
		abortEarly: !0
	} : {
		async: !1,
		abortEarly: !0
	}, i = e._zod.bag.fallbackRun, a;
	if (i ? (r[Et] = !0, a = i({
		value: t,
		issues: []
	}, r)) : a = e._zod.run({
		value: t,
		issues: []
	}, r), a instanceof Promise) throw new j();
	return a.issues.length === 0;
}
var kt = async (e, t, n) => {
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
}, At = (e) => {
	let t = bt(e), n = (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return t(e, r, o, yt(n, a));
	};
	return n;
}, jt = (e) => {
	let t = bt(e), n = (e, r, i, a) => t(e, r, i, yt(n, a));
	return n;
}, Mt = (e) => {
	let t = xt(e), n = async (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return await t(e, r, o, yt(n, a));
	};
	return n;
}, Nt = (e) => {
	let t = xt(e), n = async (e, r, i, a) => await t(e, r, i, yt(n, a));
	return n;
}, Pt = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return St(e)(t, n, i);
}, Ft = (e) => (t, n, r) => St(e)(t, n, r), It = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return wt(e)(t, n, i);
}, Lt = (e) => async (t, n, r) => wt(e)(t, n, r), Rt = /^[cC][0-9a-z]{6,}$/, zt = /^[0-9a-z]+$/, Bt = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, Vt = /^[0-9a-vA-V]{20}$/, Ht = /^[A-Za-z0-9]{27}$/, Ut = /^[a-zA-Z0-9_-]{21}$/;
function Wt(e) {
	return RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
var Gt = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Kt = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, qt = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, Jt = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Yt = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function Xt() {
	return new RegExp(Yt, "u");
}
var Zt = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Qt = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, $t = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, en = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, tn = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, nn = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, rn = /^https?$/, an = /^\+[1-9]\d{6,14}$/, on = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function sn(e) {
	return RegExp(`^${e}$`);
}
var cn = /*@__PURE__*/ sn(on);
function ln(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function un(e) {
	return RegExp(`^${ln(e)}$`);
}
function dn(e) {
	let t = ["Z"];
	e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let n = `${ln({
		precision: e.precision,
		seconds: !0
	})}(?:${t.join("|")})`, r = e.local ? `${n}|${ln({ precision: e.precision })}` : n;
	return RegExp(`^${on}T(?:${r})$`);
}
var fn = /^[\s\S]{0,}$/, pn = /^-?\d+$/, mn = /^-?\d+(?:\.\d+)?$/, hn = /^(?:true|false)$/i, gn = /^[^A-Z]*$/, _n = /^[^a-z]*$/, P = /*@__PURE__*/ A("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), vn = (e) => {
	let t = e.value;
	return !pe(t) && t.length !== void 0;
}, yn = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, bn = /*@__PURE__*/ A("$ZodCheckLessThan", (e, t) => {
	P.init(e, t);
	let n = yn[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: yn[typeof r.value] ?? n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), xn = /*@__PURE__*/ A("$ZodCheckGreaterThan", (e, t) => {
	P.init(e, t);
	let n = yn[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: yn[typeof r.value] ?? n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Sn = /*@__PURE__*/ A("$ZodCheckMultipleOf", (e, t) => {
	P.init(e, t), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? t.value !== BigInt(0) && n.value % t.value === BigInt(0) : he(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Cn = /*@__PURE__*/ A("$ZodCheckNumberFormat", (e, t) => {
	P.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = ke[t.format];
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
}), wn = /*@__PURE__*/ A("$ZodCheckMaxLength", (e, t) => {
	var n;
	P.init(e, t), (n = e._zod.def).when ?? (n.when = vn), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i > t.maximum ? We(r) : i) <= t.maximum) return;
		let a = Ge(r);
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
}), Tn = /*@__PURE__*/ A("$ZodCheckMinLength", (e, t) => {
	var n;
	P.init(e, t), (n = e._zod.def).when ?? (n.when = vn), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i >= t.minimum && i < t.minimum * 2 ? We(r) : i) >= t.minimum) return;
		let a = Ge(r);
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
}), En = /*@__PURE__*/ A("$ZodCheckLengthEquals", (e, t) => {
	var n;
	P.init(e, t), (n = e._zod.def).when ?? (n.when = vn), e._zod.check = (n) => {
		let r = n.value, i = r.length, a = typeof r == "string" && i >= t.length && i <= t.length * 2 ? We(r) : i;
		if (a === t.length) return;
		let o = Ge(r), s = a > t.length;
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
}), Dn = /*@__PURE__*/ A("$ZodCheckStringFormat", (e, t) => {
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
}), On = /*@__PURE__*/ A("$ZodCheckRegex", (e, t) => {
	Dn.init(e, t), e._zod.check = (n) => {
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
}), kn = /*@__PURE__*/ A("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= gn, Dn.init(e, t);
}), An = /*@__PURE__*/ A("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= _n, Dn.init(e, t);
}), jn = /*@__PURE__*/ A("$ZodCheckIncludes", (e, t) => {
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
}), Mn = /*@__PURE__*/ A("$ZodCheckStartsWith", (e, t) => {
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
}), Nn = /*@__PURE__*/ A("$ZodCheckEndsWith", (e, t) => {
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
}), Pn = /*@__PURE__*/ A("$ZodCheckOverwrite", (e, t) => {
	P.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), Fn = class {
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
}, In = {
	major: 4,
	minor: 6,
	patch: 5
}, F = /*@__PURE__*/ A("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = In;
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
					if (Be(t) || !o._zod.def.when(t)) continue;
				} else if (i) continue;
				let n = t.issues.length, s = o._zod.check(t);
				if (s instanceof Promise && r?.async === !1) throw new j();
				if (a || s instanceof Promise) a = (a ?? Promise.resolve()).then(async () => {
					await s, t.issues.length !== n && (He(t.issues, n, e), i ||= w(t, n));
				});
				else {
					if (t.issues.length === n) continue;
					He(t.issues, n, e), i ||= w(t, n);
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
		return Ye(this, "~standard", zn(this));
	},
	set "~standard"(e) {
		D(this, "~standard", e);
	}
}), Ln = (e, t) => e.issues.length ? { issues: e.issues.map((e) => E(e, t, N())) } : { value: e.value };
async function Rn(e, t) {
	let n = { async: !0 };
	return Ln(await e._zod.run({
		value: t,
		issues: []
	}, n), n);
}
function zn(e) {
	return {
		validate: (t) => {
			let n = { async: !1 };
			try {
				let r = e._zod.run({
					value: t,
					issues: []
				}, n);
				if (!(r instanceof Promise)) return Ln(r, n);
			} catch {}
			return Rn(e, t);
		},
		vendor: "zod",
		version: 1
	};
}
var Bn = /*@__PURE__*/ A("$ZodString", (e, t) => {
	F.init(e, t), e._zod.pattern = t.pattern ?? fn, e._zod.parse = (n, r) => {
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
	Dn.init(e, t), Bn.init(e, t);
}), Vn = /*@__PURE__*/ A("$ZodGUID", (e, t) => {
	t.pattern ??= Kt, I.init(e, t);
}), Hn = /*@__PURE__*/ A("$ZodUUID", (e, t) => {
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
		t.pattern ??= qt(e);
	} else t.pattern ??= qt();
	I.init(e, t);
}), Un = /*@__PURE__*/ A("$ZodEmail", (e, t) => {
	t.pattern ??= Jt, I.init(e, t);
});
function Wn(e) {
	try {
		return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
	} catch {
		return !1;
	}
}
function Gn(e, t) {
	return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? Wn(e) || 2 : Kn(e, t);
}
function Kn(e, t) {
	if (!t.normalize && t.protocol?.source === rn.source && !/^https?:\/\//i.test(e)) return 1;
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
var qn = /[\t\n\r]/g;
function Jn(e) {
	return e.replace(qn, "");
}
function Yn(e, t) {
	return t.lastIndex = 0, t.test(e.hostname);
}
function Xn(e, t) {
	return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
var Zn = /*@__PURE__*/ A("$ZodURL", (e, t) => {
	I.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim(), i = Gn(r, t);
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
				n.value = Jn(r);
				return;
			}
			t.hostname && !Yn(i, t.hostname) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), t.protocol && !Xn(i, t.protocol) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), n.value = t.normalize ? i.href : Jn(r);
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
}), Qn = /*@__PURE__*/ A("$ZodEmoji", (e, t) => {
	t.pattern ??= Xt(), I.init(e, t);
}), $n = /*@__PURE__*/ A("$ZodNanoID", (e, t) => {
	if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1)) throw Error(`Invalid nanoid length: ${t.length}`);
	t.pattern ??= t.length === void 0 ? Ut : Wt(t.length), I.init(e, t);
}), er = /*@__PURE__*/ A("$ZodCUID", (e, t) => {
	t.pattern ??= Rt, I.init(e, t);
}), tr = /*@__PURE__*/ A("$ZodCUID2", (e, t) => {
	t.pattern ??= zt, I.init(e, t);
}), nr = /*@__PURE__*/ A("$ZodULID", (e, t) => {
	t.pattern ??= Bt, I.init(e, t);
}), rr = /*@__PURE__*/ A("$ZodXID", (e, t) => {
	t.pattern ??= Vt, I.init(e, t);
}), ir = /*@__PURE__*/ A("$ZodKSUID", (e, t) => {
	t.pattern ??= Ht, I.init(e, t);
}), ar = /*@__PURE__*/ A("$ZodISODateTime", (e, t) => {
	t.pattern ??= dn(t), I.init(e, t);
}), or = /*@__PURE__*/ A("$ZodISODate", (e, t) => {
	t.pattern ??= cn, I.init(e, t);
}), sr = /*@__PURE__*/ A("$ZodISOTime", (e, t) => {
	t.pattern ??= un(t), I.init(e, t);
}), cr = /*@__PURE__*/ A("$ZodISODuration", (e, t) => {
	t.pattern ??= Gt, I.init(e, t);
}), lr = /*@__PURE__*/ A("$ZodIPv4", (e, t) => {
	t.pattern ??= Zt, I.init(e, t);
}), ur = /^[0-9a-fA-F:.]+$/;
function dr(e) {
	return ur.test(e) ? Wn(`http://[${e}]`) : !1;
}
var fr = /*@__PURE__*/ A("$ZodIPv6", (e, t) => {
	t.pattern ??= Qt, I.init(e, t), e._zod.check = (n) => {
		dr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), pr = /*@__PURE__*/ A("$ZodCIDRv4", (e, t) => {
	t.pattern ??= $t, I.init(e, t);
});
function mr(e) {
	let t = e.split("/");
	if (t.length !== 2) return !1;
	let [n, r] = t;
	if (!r) return !1;
	let i = Number(r);
	return `${i}` !== r || i < 0 || i > 128 ? !1 : dr(n);
}
var hr = /*@__PURE__*/ A("$ZodCIDRv6", (e, t) => {
	t.pattern ??= en, I.init(e, t), e._zod.check = (n) => {
		mr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function gr(e) {
	if (e === "") return !0;
	if (/\s/.test(e) || e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var _r = /^[0-9a-zA-Z+/]*={0,2}$/, vr = /*@__PURE__*/ A("$ZodBase64", (e, t) => {
	t.pattern ??= _r, I.init(e, t), e._zod.check = (n) => {
		gr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), yr = /^[A-Za-z0-9_-]*$/;
function br(e) {
	if (!yr.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return gr(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var xr = /*@__PURE__*/ A("$ZodBase64URL", (e, t) => {
	t.pattern ??= yr, I.init(e, t), e._zod.check = (n) => {
		br(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Sr = /*@__PURE__*/ A("$ZodE164", (e, t) => {
	t.pattern ??= an, I.init(e, t);
});
function Cr(e, t = null) {
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
var wr = /*@__PURE__*/ A("$ZodJWT", (e, t) => {
	I.init(e, t), e._zod.check = (n) => {
		Cr(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Tr = /*@__PURE__*/ A("$ZodNumber", (e, t) => {
	F.init(e, t), e._zod.pattern = mn, e._zod.parse = (n, r) => {
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
}), Er = /*@__PURE__*/ A("$ZodNumberFormat", (e, t) => {
	Cn.init(e, t), Tr.init(e, t);
}), Dr = /*@__PURE__*/ A("$ZodBoolean", (e, t) => {
	F.init(e, t), e._zod.pattern = hn, e._zod.parse = (n, r) => {
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
}), Or = /*@__PURE__*/ A("$ZodUnknown", (e, t) => {
	F.init(e, t), e._zod.parse = (e) => e;
}), kr = /*@__PURE__*/ A("$ZodNever", (e, t) => {
	F.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function Ar(e, t, n) {
	e.issues.length && t.issues.push(...T(n, e.issues)), t.value[n] = e.value;
}
var jr = /*@__PURE__*/ A("$ZodArray", (e, t) => {
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
			if (c instanceof Promise) o.push(c.then((t) => Ar(t, r, e)));
			else if (Ar(c, r, e), s && c.issues.length !== 0 && w(c)) break;
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	};
});
function Mr(e, t, n, r, i, a) {
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
var Nr = [];
function Pr(e) {
	let t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : Nr, i = r.length ? [...t, ...r] : t;
	for (let t of i) if (!e.shape?.[t]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${String(t)}": expected a Zod schema`);
	let a = Oe(e.shape);
	return {
		...e,
		allKeys: i,
		symbolKeys: r,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(a)
	};
}
function Fr(e, t, n, r, i, a, o) {
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
		a instanceof Promise ? e.push(a.then((e) => Mr(e, n, i, t, d, f))) : Mr(a, n, i, t, d, f);
	}
	return s.length && n.issues.push({
		code: "unrecognized_keys",
		keys: s,
		input: t,
		inst: a,
		continue: !0
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var Ir = /*@__PURE__*/ A("$ZodObject", (e, t) => {
	F.init(e, t);
	let n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
	if (r) {
		let e = () => {
			let n = { ...r };
			return Object.defineProperty(t, "shape", { value: n }), e.raw = n, n;
		};
		e.raw = r, Object.defineProperty(t, "shape", { get: e });
	}
	let i = fe(() => Pr(t));
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
	let a = Ce, o = t.catchall, s, c = M.memoizer;
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
			s instanceof Promise ? l.push(s.then((n) => Mr(n, t, e, r, a, o))) : Mr(s, t, e, r, a, o);
		}
		return o ? Fr(l, r, t, n, i.value, e, d === !0) : l.length ? Promise.all(l).then(() => t) : t;
	};
}), Lr = /*@__PURE__*/ A("$ZodObjectJIT", (e, t) => {
	Ir.init(e, t);
	let n = e._zod.parse, r = fe(() => Pr(t)), i = M.memoizer, a = (t) => {
		let n = r.value, a = n.symbolKeys, o = new Fn(["payload", "ctx"], {
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
			let n = l[e], r = typeof e == "symbol" ? `syms[${a.indexOf(e)}]` : be(e), i = `${r} in input`, u = t[e], d = u?._zod?.optin, f = d !== void 0, p = u?._zod?.optout === "optional";
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
	}, o, s = Ce, c = !M.jitless, l = c && we.value, u = t.catchall, d;
	e._zod.parse = (i, f) => {
		d ??= r.value;
		let p = i.value;
		return s(p) ? c && l && f?.async === !1 && f.jitless !== !0 ? (o ||= a(t.shape), i = o(i, f), u ? Fr([], p, i, f, d, e, f?.abortEarly === !0) : i) : n(i, f) : (i.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), i);
	};
});
function Rr(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !w(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => E(e, r, N())))
	}), t);
}
var zr = /*@__PURE__*/ A("$ZodUnion", (e, t) => {
	F.init(e, t), k(e, "optin", (e) => e.def.options.some((e) => e._zod.optin === "defaulted") ? "defaulted" : e.def.options.some((e) => e._zod.optin !== void 0) ? "optional" : void 0), k(e, "optout", (e) => e.def.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), k(e, "values", (e) => {
		if (e.def.options.every((e) => e._zod.values)) return new Set(e.def.options.flatMap((e) => Array.from(e._zod.values)));
	}), k(e, "pattern", (e) => {
		if (e.def.options.every((e) => e._zod.pattern)) {
			let t = e.def.options.map((e) => e._zod.pattern);
			return RegExp(`^(${t.map((e) => me(e.source)).join("|")})$`);
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
		return a ? Promise.all(o).then((t) => Rr(t, r, e, i)) : Rr(o, r, e, i);
	};
}), Br = /*@__PURE__*/ A("$ZodIntersection", (e, t) => {
	F.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => Hr(e, t, n)) : Hr(e, i, a);
	};
});
function Vr(e, t) {
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
			let r = Vr(e[n], t[n]);
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
			let i = e[r], a = t[r], o = Vr(i, a);
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
function Hr(e, t, n) {
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
	let c = Vr(t.value, n.value);
	if (!c.valid) {
		if (w(e)) return e;
		throw Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
	}
	return e.value = c.data, e;
}
var Ur = /*@__PURE__*/ A("$ZodRecord", (e, t) => {
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
				if (typeof n == "string" && mn.test(n) && l.issues.length) {
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
}), Wr = /*@__PURE__*/ A("$ZodEnum", (e, t) => {
	F.init(e, t);
	let n = ce(t.entries), r = new Set(n);
	e._zod.values = r, k(e, "pattern", (e) => {
		let t = ce(e.def.entries).filter((e) => Ee.has(typeof e));
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
}), Gr = /*@__PURE__*/ A("$ZodLiteral", (e, t) => {
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
}), Kr = /*@__PURE__*/ A("$ZodTransform", (e, t) => {
	F.init(e, t), e._zod.optin = "optional", M.memoizer?.guard(e), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new ct(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new j();
		return n.value = i, n;
	};
});
function qr(e, t) {
	return e.value = t.issues.length ? void 0 : t.value, e;
}
var Jr = /*@__PURE__*/ A("$ZodOptional", (e, t) => {
	F.init(e, t), k(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", k(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? /* @__PURE__ */ new Set([...t, void 0]) : void 0;
	}), k(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${me(t.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (e.value === void 0) {
			if (t.innerType._zod.optin !== "defaulted") return e;
			let r = t.innerType._zod.run({
				value: e.value,
				issues: []
			}, n);
			return r instanceof Promise ? r.then((t) => qr(e, t)) : qr(e, r);
		}
		return t.innerType._zod.run(e, n);
	};
}), Yr = /*@__PURE__*/ A("$ZodExactOptional", (e, t) => {
	Jr.init(e, t), k(e, "values", (e) => e.def.innerType._zod.values), k(e, "pattern", (e) => e.def.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), Xr = /*@__PURE__*/ A("$ZodNullable", (e, t) => {
	F.init(e, t), k(e, "optin", (e) => e.def.innerType._zod.optin), k(e, "optout", (e) => e.def.innerType._zod.optout), k(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${me(t.source)}|null)$`) : void 0;
	}), k(e, "values", (e) => e.def.innerType._zod.values ? /* @__PURE__ */ new Set([...e.def.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), Zr = /*@__PURE__*/ A("$ZodDefault", (e, t) => {
	F.init(e, t), e._zod.optin = "defaulted", k(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => Qr(e, t)) : Qr(r, t);
	};
});
function Qr(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var $r = /*@__PURE__*/ A("$ZodPrefault", (e, t) => {
	F.init(e, t), e._zod.optin = "defaulted", k(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), ei = /*@__PURE__*/ A("$ZodNonOptional", (e, t) => {
	F.init(e, t), k(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? new Set([...t].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => ti(t, e)) : ti(i, e);
	};
});
function ti(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
function ni(e, t, n, r) {
	return t.issues.length ? (e.value = n.catchValue({
		...t,
		value: e.value,
		error: { issues: t.issues.map((e) => E(e, r, N())) },
		input: e.value
	}), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
var ri = /*@__PURE__*/ A("$ZodCatch", (e, t) => {
	F.init(e, t), k(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), k(e, "optout", (e) => e.def.innerType._zod.optout), k(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run({
			value: e.value,
			issues: []
		}, n);
		return r instanceof Promise ? r.then((r) => ni(e, r, t, n)) : ni(e, r, t, n);
	};
}), ii = /*@__PURE__*/ A("$ZodPipe", (e, t) => {
	F.init(e, t), k(e, "values", (e) => e.def.in._zod.values), k(e, "optin", (e) => e.def.in._zod.optin), k(e, "optout", (e) => e.def.out._zod.optout), k(e, "propValues", (e) => e.def.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => ai(e, t.in, n)) : ai(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => ai(e, t.out, n)) : ai(r, t.out, n);
	};
});
function ai(e, t, n) {
	return e.issues.some((e) => e.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues
	}, n);
}
var oi = /*@__PURE__*/ A("$ZodReadonly", (e, t) => {
	F.init(e, t), k(e, "propValues", (e) => e.def.innerType._zod.propValues), k(e, "values", (e) => e.def.innerType._zod.values), k(e, "optin", (e) => e.def.innerType?._zod?.optin), k(e, "optout", (e) => e.def.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(si) : si(r);
	};
});
function si(e) {
	return e.memo || (e.value = Object.freeze(e.value)), e;
}
var ci = /*@__PURE__*/ A("$ZodCustom", (e, t) => {
	P.init(e, t), F.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => li(t, n, r, e));
		li(i, n, r, e);
	};
});
function li(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(qe(e));
	}
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/memoizer.js
var ui = class extends Error {
	constructor() {
		super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
	}
}, di = "~memo", fi = [];
function pi(e) {
	return typeof e == "object" && !!e;
}
function mi(e) {
	return e.map((e) => e.path ? {
		...e,
		path: e.path.slice()
	} : { ...e });
}
var hi = /*@__PURE__*/ new WeakMap(), L = 0, gi = 1, R = 2;
function _i(e, t, n) {
	let r = hi.get(e);
	if (r !== void 0) return r ? R : L;
	if (t.has(e)) return R;
	t.add(e);
	let i = L, a = (e) => {
		if (i !== R && e?._zod) {
			let r = _i(e, t, n);
			r > i && (i = r);
		}
	}, o = (e, r) => {
		let i = L;
		for (let a of Reflect.ownKeys(e)) {
			let o = Object.getOwnPropertyDescriptor(e, a);
			if (r && !o.enumerable) continue;
			let s = o.get ? gi : o.value?._zod ? _i(o.value, t, n) : L;
			s > i && (i = s);
		}
		return i;
	}, s = (e) => {
		e > i && (i = e);
	}, c = e._zod.def;
	switch (c.type) {
		case "object": {
			let e = ge(c);
			s(e ? o(e, !0) : gi), a(c.catchall);
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
			s(r ? _i(r, t, !1) : gi);
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
	return t.delete(e), vi(e, i);
}
function vi(e, t) {
	return t !== gi && hi.set(e, t === R), t;
}
function yi(e, t) {
	let n = e.buckets.get(t);
	return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
var bi, xi = [], Si = {
	alloc(e, t, n) {
		let r = bi;
		if (!r) return n;
		bi = void 0;
		let i = {
			value: n,
			issues: null
		};
		return r.set(t.value, i), xi.push(i), n;
	},
	guard(e) {
		var t;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, n = (e, n) => {
				if (n.direction !== "backward" && wi(n, e.value)) throw new ui();
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
					let i = _i(e, /* @__PURE__ */ new Set(), !1);
					if (i === L) return e._zod.parse = t, e._zod.run === o && (e._zod.run = t), t(s, c);
					i === R || r ? n = !0 : r = !0;
				}
				let l = s.value;
				if (!pi(l)) return t(s, c);
				let u = c[di];
				u || (u = {
					buckets: /* @__PURE__ */ new WeakMap(),
					backEdges: void 0
				}, c[di] = u);
				let d;
				i === c ? d = a : (d = yi(u, e), i = c, a = d);
				let f = d.get(l);
				if (f) return s.value = f.value, f.issues ? f.issues.length && s.issues.push(...mi(f.issues)) : (s.memo = !0, u.backEdges ?? (u.backEdges = /* @__PURE__ */ new WeakSet()), u.backEdges.add(f.value)), s;
				bi = d;
				let p = xi.length, m = t(s, c);
				bi = void 0;
				let h = xi.length > p ? xi.pop() : void 0;
				return m instanceof Promise ? m.then((e) => (h && (h.issues = e.issues.length ? mi(e.issues) : fi), e)) : (h && (h.issues = m.issues.length ? mi(m.issues) : fi), m);
			};
			e._zod.parse = o, e._zod.run === t && (e._zod.run = o);
		});
	}
};
function Ci() {
	return Si;
}
function wi(e, t) {
	let n = e[di]?.backEdges;
	return n !== void 0 && pi(t) && n.has(t);
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/locales/en.js
var Ti = () => {
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
			case "invalid_type": return `Invalid input: expected ${i(e.expected)}, received ${i(Ke(e.input), e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Invalid input: expected ${De(e.values[0])}` : `Invalid option: expected one of ${le(e.values, "|")}`;
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
			case "unrecognized_keys": return `Unrecognized key${e.keys.length > 1 ? "s" : ""}: ${le(e.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${e.origin}`;
			case "invalid_union": return e.options && Array.isArray(e.options) && e.options.length > 0 ? `Invalid discriminator value. Expected ${e.options.map((e) => `'${e}'`).join(" | ")}` : e.inclusive === !1 ? "Invalid input: more than one option matched" : "Invalid input";
			case "invalid_element": return `Invalid value in ${e.origin}`;
			default: return "Invalid input";
		}
	};
};
function Ei() {
	return { localeError: Ti() };
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/registries.js
var Di, Oi = class {
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
function ki() {
	return new Oi();
}
(Di = globalThis).__zod_globalRegistry ?? (Di.__zod_globalRegistry = ki());
var z = globalThis.__zod_globalRegistry;
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/api.js
function Ai(e) {
	return e.checks &&= [...e.checks], e;
}
// @__NO_SIDE_EFFECTS__
function ji(e, t) {
	return new e(Ai({
		type: "string",
		...C(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function Mi(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ni(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Pi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Fi(e, t) {
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
function Ii(e, t) {
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
function Li(e, t) {
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
function Ri(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function zi(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Bi(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Vi(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Hi(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ui(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Wi(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Gi(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ki(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function qi(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ji(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Yi(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Xi(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Zi(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Qi(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function $i(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ea(e, t) {
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
function ta(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function na(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ra(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ia(e, t) {
	return new e(Ai({
		type: "number",
		checks: [],
		...C(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function aa(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function oa(e, t) {
	return new e({
		type: "boolean",
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function sa(e) {
	return new e({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function ca(e, t) {
	return new e({
		type: "never",
		...C(t)
	});
}
// @__NO_SIDE_EFFECTS__
function la(e, t) {
	return new bn({
		check: "less_than",
		...C(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function ua(e, t) {
	return new bn({
		check: "less_than",
		...C(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function da(e, t) {
	return new xn({
		check: "greater_than",
		...C(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function fa(e, t) {
	return new xn({
		check: "greater_than",
		...C(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function pa(e, t) {
	return new Sn({
		check: "multiple_of",
		...C(t),
		value: e
	});
}
// @__NO_SIDE_EFFECTS__
function ma(e, t) {
	return new wn({
		check: "max_length",
		...C(t),
		maximum: e
	});
}
// @__NO_SIDE_EFFECTS__
function ha(e, t) {
	return new Tn({
		check: "min_length",
		...C(t),
		minimum: e
	});
}
// @__NO_SIDE_EFFECTS__
function ga(e, t) {
	return new En({
		check: "length_equals",
		...C(t),
		length: e
	});
}
// @__NO_SIDE_EFFECTS__
function _a(e, t) {
	return new On({
		check: "string_format",
		format: "regex",
		...C(t),
		pattern: e
	});
}
// @__NO_SIDE_EFFECTS__
function va(e) {
	return new kn({
		check: "string_format",
		format: "lowercase",
		...C(e)
	});
}
// @__NO_SIDE_EFFECTS__
function ya(e) {
	return new An({
		check: "string_format",
		format: "uppercase",
		...C(e)
	});
}
// @__NO_SIDE_EFFECTS__
function ba(e, t) {
	return new jn({
		check: "string_format",
		format: "includes",
		...C(t),
		includes: e
	});
}
// @__NO_SIDE_EFFECTS__
function xa(e, t) {
	return new Mn({
		check: "string_format",
		format: "starts_with",
		...C(t),
		prefix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Sa(e, t) {
	return new Nn({
		check: "string_format",
		format: "ends_with",
		...C(t),
		suffix: e
	});
}
// @__NO_SIDE_EFFECTS__
function B(e) {
	return new Pn({
		check: "overwrite",
		tx: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ca(e) {
	return /* @__PURE__ */ B((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function wa() {
	return /* @__PURE__ */ B((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Ta() {
	return /* @__PURE__ */ B((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Ea() {
	return /* @__PURE__ */ B((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function Da() {
	return /* @__PURE__ */ B((e) => xe(e));
}
// @__NO_SIDE_EFFECTS__
function Oa(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...C(n)
	});
}
// @__NO_SIDE_EFFECTS__
function ka(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...C(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Aa(e, t) {
	let n = /* @__PURE__ */ ja((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(qe(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", "input" in r || (r.input = t.value), r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(qe(r));
		}
	}, e(t.value, t)), t);
	return n;
}
// @__NO_SIDE_EFFECTS__
function ja(e, t) {
	let n = new P({
		check: "custom",
		...C(t)
	});
	return n._zod.check = e, n;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/to-json-schema.js
function Ma(e, ...t) {
	for (let n of t) for (let t of Reflect.ownKeys(n)) Object.prototype.propertyIsEnumerable.call(n, t) && g(e, t, n[t]);
	return e;
}
function Na(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? z,
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
function V(e, t, n, r, i) {
	let a = typeof t.unrepresentable == "function" ? t.unrepresentable({
		zodSchema: e,
		path: r.path,
		message: i
	}) : t.unrepresentable;
	if (a === "any") return !1;
	if (a === void 0 || a === "throw") throw Error(i);
	return Object.assign(n, a), !0;
}
function H(e, t, n = {
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
		a && (o.ref ||= a, H(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && Ma(o.schema, c), t.io === "input" && U(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function Pa(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function Fa(e, t) {
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
				ref: `${i("__shared")}#/${r}/${Pa(a)}`
			};
		}
		let i = `#/${r}/`;
		if (t[1] === n && !t[1].schema.id) return { ref: "#" };
		let a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + Pa(a)
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
function Ia(e) {
	let t = e.anyOf;
	if (!Array.isArray(t) || t.length === 0 || e.type !== void 0) return;
	let n = [];
	for (let e of t) {
		if (!e || typeof e != "object") return;
		Ia(e);
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
var La = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]), Ra = ["oneOf", "anyOf"];
function za(e) {
	let t = e.additionalProperties;
	return t === void 0 || t === !1 || typeof t != "object" || !t ? null : Object.keys(t).length ? t : null;
}
function Ba(e) {
	let t = [];
	for (let n of e) {
		if (typeof n != "object" || n.type !== "object") return null;
		for (let e in n) if (!La.has(e)) return null;
		t.push(n);
	}
	let n = {}, r = /* @__PURE__ */ new Set();
	for (let e of t) {
		for (let r in e.properties) {
			if (Object.prototype.hasOwnProperty.call(n, r)) continue;
			let e = [];
			for (let n of t) {
				let t = n.properties?.[r] ?? za(n);
				t != null && (e.some((e) => JSON.stringify(e) === JSON.stringify(t)) || e.push(t));
			}
			g(n, r, e.length === 1 ? e[0] : Ba(e) ?? { allOf: e });
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
			let t = za(n);
			t && !e.some((e) => JSON.stringify(e) === JSON.stringify(t)) && e.push(t);
		}
		e.length === 1 ? i.additionalProperties = e[0] : e.length > 1 && (i.additionalProperties = { allOf: e });
	}
	return i;
}
function Va(e) {
	let t = e.allOf;
	if (!Array.isArray(t) || t.length < 2) return;
	for (let t of La) if (t in e) return;
	let n = t.filter((e) => Ra.some((t) => Array.isArray(e[t]))), r = null;
	if (!n.length) r = Ba(t);
	else {
		let e = n[0], i = Ra.find((t) => Array.isArray(e[t]));
		if (Object.keys(e).length !== 1) return;
		let a = t.filter((t) => t !== e), o = e[i].map((e) => Ba([...a, e]));
		if (o.some((e) => !e)) return;
		r = { [i]: o };
	}
	r && (delete e.allOf, Ma(e, r));
}
function Ha(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : Ma(i, s), Ma(i, a), t._zod.parent === o) for (let e in i) e !== "$ref" && e !== "allOf" && (e in a || delete i[e]);
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
		if (e.target !== "openapi-3.0") for (let t of e.seen.entries()) Ia(t[1].def ?? t[1].schema);
		for (let t of e.deferred) t();
		if (e.intersections.length) {
			let t = /* @__PURE__ */ new Map();
			for (let n of e.seen.values()) for (let e of [n.schema, n.def]) {
				let n = e?.allOf;
				if (!Array.isArray(n)) continue;
				let r = t.get(n);
				r ? r.push(e) : t.set(n, [e]);
			}
			for (let n of e.intersections) for (let e of t.get(n) ?? []) Va(e);
		}
	}
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	Ma(i, n.defId ? n.schema : n.def ?? n.schema);
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
					input: Wa(t, "input", e.processors),
					output: Wa(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function U(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return U(r.element, n);
	if (r.type === "set") return U(r.valueType, n);
	if (r.type === "lazy") return U(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch") return U(r.innerType, n);
	if (r.type === "intersection") return U(r.left, n) || U(r.right, n);
	if (r.type === "record" || r.type === "map") return U(r.keyType, n) || U(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : U(r.in, n) || U(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (U(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (U(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (U(e, n)) return !0;
		return !!(r.rest && U(r.rest, n));
	}
	return !1;
}
var Ua = (e, t = {}) => (n) => {
	let r = Na({
		...n,
		processors: t
	});
	return H(e, r), Fa(r, e), Ha(r, e);
}, Wa = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = Na({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return H(e, o), Fa(o, e), Ha(o, e);
}, W = (e, t, n) => {
	(e[t] === void 0 || n > e[t]) && (e[t] = n);
}, G = (e, t, n) => {
	(e[t] === void 0 || n < e[t]) && (e[t] = n);
}, Ga = (e, t) => {
	W(e, "minimum", t), G(e, "maximum", t);
}, Ka = (e, t) => {
	e.multipleOf ??= [], e.multipleOf.includes(t) || e.multipleOf.push(t);
}, qa = (e, t) => {
	e.patterns ??= /* @__PURE__ */ new Set(), e.patterns.add(t);
}, Ja = (e, t) => {
	e.mime = e.mime ? e.mime.filter((e) => t.includes(e)) : [...t];
}, Ya = (e, t) => {
	e.format = t, t.includes("int") && (e.isInt = !0);
}, Xa = (e, t) => W(e, "minimum", t.minimum), Za = (e, t) => G(e, "maximum", t.maximum), Qa = (e) => (t, n) => {
	Ya(t, n.format);
	let [r, i] = e[n.format];
	W(t, "minimum", r), G(t, "maximum", i);
}, $a = {
	greater_than: (e, t) => W(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
	less_than: (e, t) => G(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
	multiple_of: (e, t) => Ka(e, t.value),
	number_format: Qa(ke),
	bigint_format: Qa(Ae),
	min_length: Xa,
	max_length: Za,
	length_equals: (e, t) => Ga(e, t.length),
	min_size: Xa,
	max_size: Za,
	size_equals: (e, t) => Ga(e, t.size),
	string_format: (e, t) => {
		Ya(e, t.format), t.pattern && qa(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
	},
	mime_type: (e, t) => Ja(e, t.mime)
};
function K(e) {
	let t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
	for (let e of r) $a[e._zod.def.check]?.(t, e._zod.def);
	let i = e._zod.bag;
	i.minimum !== void 0 && W(t, "minimum", i.minimum), i.exclusiveMinimum !== void 0 && W(t, "exclusiveMinimum", i.exclusiveMinimum), i.maximum !== void 0 && G(t, "maximum", i.maximum), i.exclusiveMaximum !== void 0 && G(t, "exclusiveMaximum", i.exclusiveMaximum), i.multipleOf !== void 0 && Ka(t, i.multipleOf), i.format !== void 0 && (t.format ??= i.format, i.format.includes("int") && (t.isInt = !0)), i.mime && Ja(t, i.mime);
	for (let e of i.patterns ?? []) qa(t, e);
	return t;
}
var eo = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, to = /* @__PURE__ */ new Map([[_r, tn], [yr, nn]]), no = (e) => to.get(e) ?? e, ro = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l, laxFormat: u } = K(e);
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = eo[s] ?? s, i.format === "" && delete i.format, (s === "time" || u) && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c].map(no);
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, io = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, multipleOf: s, exclusiveMaximum: c, exclusiveMinimum: l, isInt: u } = K(e);
	i.type = u ? "integer" : "number";
	let d = typeof l == "number" && l >= (a ?? -Infinity), f = typeof c == "number" && c <= (o ?? Infinity), p = t.target === "draft-04" || t.target === "openapi-3.0";
	if (d ? p ? (i.minimum = l, i.exclusiveMinimum = !0) : i.exclusiveMinimum = l : typeof a == "number" && (i.minimum = a), f ? p ? (i.maximum = c, i.exclusiveMaximum = !0) : i.exclusiveMaximum = c : typeof o == "number" && (i.maximum = o), s) {
		let n = /* @__PURE__ */ new Set();
		for (let a of s) Number.isFinite(a) && a !== 0 ? n.add(Math.abs(a)) : V(e, t, i, r, `A multipleOf divisor of ${a} cannot be represented in JSON Schema`);
		let [a, ...o] = n;
		a !== void 0 && (i.multipleOf = a), o.length && (i.allOf = [...i.allOf ?? [], ...o.map((e) => ({ multipleOf: e }))]);
	}
}, ao = (e, t, n, r) => {
	n.type = "boolean";
}, oo = (e, t, n, r) => {
	n.not = {};
}, so = (e, t, n, r) => {
	let i = e._zod.def, a = ce(i.entries);
	if (a.length === 0) {
		n.not = {};
		return;
	}
	a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a;
}, co = (e, t, n, r) => {
	let i = e._zod.def;
	if (i.values.length === 0) {
		n.not = {};
		return;
	}
	let a = [];
	for (let o of i.values) if (o === void 0) {
		if (V(e, t, n, r, "Literal `undefined` cannot be represented in JSON Schema")) return;
	} else if (typeof o == "bigint") {
		if (V(e, t, n, r, "BigInt literals cannot be represented in JSON Schema")) return;
		a.push(Number(o));
	} else a.push(o);
	if (a.length !== 0) {
		if (a.length === 1) {
			let e = a[0];
			n.type = e === null ? "null" : typeof e, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [e] : n.const = e;
		} else a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), a.every((e) => typeof e == "boolean") && (n.type = "boolean"), a.every((e) => e === null) && (n.type = "null"), n.enum = a;
	}
}, lo = (e, t, n, r) => {
	V(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, uo = (e, t, n, r) => {
	V(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, fo = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = K(e);
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = H(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
};
function po(e) {
	let t = e._zod.def;
	return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? po(t.out) : t.type === "catch" ? po(t.innerType) : e._zod.optin;
}
var mo = (e, t, n, r) => {
	let i = n, a = e._zod.def, o = a.shape;
	if (Object.getOwnPropertySymbols(o).length && V(e, t, i, r, "Symbol keys cannot be represented in JSON Schema")) return;
	i.type = "object", i.properties = {};
	for (let e in o) g(i.properties, e, H(o[e], t, {
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
		(t.io === "input" ? po(n) === void 0 : n._zod.optout === void 0) && s.push(e);
	}
	s.length > 0 && (i.required = s), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = H(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, ho = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => H(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, go = (e, t, n, r) => {
	let i = e._zod.def, a = H(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = H(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1, c = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
	n.allOf = c, t.intersections.push(c);
};
function _o(e, t, n) {
	if (t.$ref) {
		if (n.has(t)) return t;
		n.add(t);
		let r = e.get(t)?.def;
		if (!r) return t;
		let i = _o(e, r, n);
		return i === r ? t : i;
	}
	for (let r of ["anyOf", "oneOf"]) {
		let i = t[r];
		if (!Array.isArray(i)) continue;
		let a = i.map((t) => _o(e, t, n));
		a.some((e, t) => e !== i[t]) && (t = {
			...t,
			[r]: a
		});
	}
	let r = Array.isArray(t.type) ? t.type : [t.type], i = !r.includes("string") && r.some((e) => e === "number" || e === "integer"), a = t.enum ?? (t.const === void 0 ? void 0 : [t.const]);
	if (!i && !a?.some((e) => typeof e == "number")) return t;
	let { minimum: o, maximum: s, exclusiveMinimum: c, exclusiveMaximum: l, multipleOf: u, format: d, id: f, ...p } = t;
	return p.enum ? p.enum = p.enum.map((e) => typeof e == "number" ? String(e) : e) : typeof p.const == "number" && (p.const = String(p.const)), i ? (p.type = "string", a || (p.pattern = (r.includes("number") ? mn : pn).source), p) : p;
}
var vo = /* @__PURE__ */ new WeakMap();
function yo(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.seen.values()) n.def && !t.has(n.schema) && t.set(n.schema, n);
	let n = /* @__PURE__ */ new Map();
	for (let r of vo.get(e) ?? []) {
		let i = e.seen.get(r), a = (i?.def ?? i?.schema)?.propertyNames;
		if (!a || a === !0 || n.has(a)) continue;
		let o = _o(t, a, /* @__PURE__ */ new Set());
		o !== a && n.set(a, o);
	}
	if (n.size) for (let t of e.seen.values()) for (let e of [t.schema, t.def]) {
		let t = e && n.get(e.propertyNames);
		t && (e.propertyNames = t);
	}
}
var bo = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object";
	let o = a.keyType, s = K(o).patterns;
	if (a.mode === "loose" && s && s.size > 0) {
		let e = H(a.valueType, t, {
			...r,
			path: [
				...r.path,
				"patternProperties",
				"*"
			]
		});
		i.patternProperties = {};
		for (let t of s) g(i.patternProperties, no(t).source, e);
	} else {
		if (t.target === "draft-07" || t.target === "draft-2020-12") {
			i.propertyNames = H(a.keyType, t, {
				...r,
				path: [...r.path, "propertyNames"]
			});
			let n = vo.get(t);
			n || (n = [], vo.set(t, n), t.deferred.push(() => yo(t))), n.push(e);
		}
		i.additionalProperties = H(a.valueType, t, {
			...r,
			path: [...r.path, "additionalProperties"]
		});
	}
	let c = o._zod.values, l = t.io === "input" && po(a.valueType) !== void 0;
	if (c && !a.partial && !l) {
		let e = [...c].filter((e) => typeof e == "string" || typeof e == "number");
		e.length > 0 && (i.required = e.map(String));
	}
}, xo = (e, t, n, r) => {
	let i = e._zod.def, a = H(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, So = (e, t, n, r) => {
	let i = e._zod.def;
	H(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Co = Symbol();
function wo(e, t, n, r, i) {
	let a = !1, o = JSON.stringify(e, (e, t) => typeof t == "bigint" ? (a = !0, null) : t);
	return a ? (V(t, n, r, i, "BigInt defaults cannot be represented in JSON Schema"), Co) : JSON.parse(o);
}
var To = (e, t, n, r) => {
	let i = e._zod.def;
	H(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o = wo(i.defaultValue, e, t, n, r);
	o !== Co && (n.default = o);
}, Eo = (e, t, n, r) => {
	let i = e._zod.def;
	H(i.innerType, t, r);
	let a = t.seen.get(e);
	if (a.ref = i.innerType, t.io !== "input") return;
	let o = wo(i.defaultValue, e, t, n, r);
	o !== Co && (n._prefault = o);
}, Do = (e, t, n, r) => {
	let i = e._zod.def;
	H(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		V(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	n.default = o;
}, Oo = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	H(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, ko = (e, t, n, r) => {
	let i = e._zod.def;
	H(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, Ao = (e, t, n, r) => {
	let i = e._zod.def;
	H(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, jo = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function Mo(e, t, n) {
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
var q = /*@__PURE__*/ A("ZodError", (e, t) => {
	ht.init(e, t), e.name = "ZodError";
	let n = Object.getPrototypeOf(e);
	jo.has(n) || (jo.add(n), Mo(n, "format", (e) => (t) => vt(e, t)), Mo(n, "flatten", (e) => (t) => _t(e, t)), Mo(n, "addIssue", (e) => (t) => {
		e.issues.push(t), e.message = JSON.stringify(e.issues, ue, 2);
	}), Mo(n, "addIssues", (e) => (t) => {
		e.issues.push(...t), e.message = JSON.stringify(e.issues, ue, 2);
	}), Object.defineProperty(n, "isEmpty", {
		configurable: !0,
		enumerable: !1,
		get() {
			return this.issues.length === 0;
		}
	}));
}, void 0, { Parent: Error }), No = /* @__PURE__ */ bt(q), Po = /* @__PURE__ */ xt(q), Fo = /* @__PURE__ */ St(q), Io = /* @__PURE__ */ wt(q), Lo = /* @__PURE__ */ At(q), Ro = /* @__PURE__ */ jt(q), zo = /* @__PURE__ */ Mt(q), Bo = /* @__PURE__ */ Nt(q), Vo = /* @__PURE__ */ Pt(q), Ho = /* @__PURE__ */ Ft(q), Uo = /* @__PURE__ */ It(q), Wo = /* @__PURE__ */ Lt(q);
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/schemas.js
function Go() {
	M.localeError || N(Ei());
}
function Ko() {
	M.memoizer || N({ memoizer: Ci() });
}
var J = /*@__PURE__*/ A("ZodType", (e, t) => (Go(), F.init(e, t), e.def = t, e.type = t.type, e), {
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
		return this.check(dc(e, t));
	},
	superRefine(e, t) {
		return this.check(fc(e, t));
	},
	overwrite(e) {
		return this.check(/* @__PURE__ */ B(e));
	},
	optional() {
		return qs(this);
	},
	exactOptional() {
		return Ys(this);
	},
	nullable() {
		return Zs(this);
	},
	nullish() {
		return qs(Zs(this));
	},
	nonoptional(e) {
		return rc(this, e);
	},
	array() {
		return js(this);
	},
	or(e) {
		return Fs([this, e]);
	},
	and(e) {
		return Ls(this, e);
	},
	transform(e) {
		return sc(this, Gs(e));
	},
	default(e) {
		return $s(this, e);
	},
	prefault(e) {
		return tc(this, e);
	},
	catch(e) {
		return ac(this, e);
	},
	pipe(e) {
		return sc(this, e);
	},
	readonly() {
		return lc(this);
	},
	describe(e) {
		let t = this.clone();
		return z.add(t, { description: e }), t;
	},
	meta(...e) {
		if (e.length === 0) return z.get(this);
		let t = this.clone();
		return z.add(t, e[0]), t;
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
		return Ye(this, "~standard", {
			...zn(this),
			jsonSchema: {
				input: Wa(this, "input"),
				output: Wa(this, "output")
			}
		});
	},
	set "~standard"(e) {
		D(this, "~standard", e);
	},
	parse: function e(t, n) {
		return No(this, t, n, { callee: e });
	},
	parseAsync: async function e(t, n) {
		return await Po(this, t, n, { callee: e });
	},
	safeParse(e, t) {
		return Fo(this, e, t);
	},
	async safeParseAsync(e, t) {
		return Io(this, e, t);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(e) {
		D(this, "spa", e);
	},
	validate(e, t) {
		return Dt(this, e, t);
	},
	validateAsync(e, t) {
		return kt(this, e, t);
	},
	encode: function e(t, n) {
		return Lo(this, t, n, { callee: e });
	},
	decode: function e(t, n) {
		return Ro(this, t, n, { callee: e });
	},
	encodeAsync: async function e(t, n) {
		return await zo(this, t, n, { callee: e });
	},
	decodeAsync: async function e(t, n) {
		return await Bo(this, t, n, { callee: e });
	},
	safeEncode(e, t) {
		return Vo(this, e, t);
	},
	safeDecode(e, t) {
		return Ho(this, e, t);
	},
	async safeEncodeAsync(e, t) {
		return Uo(this, e, t);
	},
	async safeDecodeAsync(e, t) {
		return Wo(this, e, t);
	},
	toJSONSchema(e) {
		return Ua(this, {})(e);
	},
	get description() {
		return z.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
}), qo = /*@__PURE__*/ A("_ZodString", (e, t) => {
	Bn.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => ro(e, t, n, r);
}, /*@__PURE__*/ Xe({
	format: (e) => K(e).format ?? null,
	minLength: (e) => K(e).minimum ?? null,
	maxLength: (e) => K(e).maximum ?? null
}, {
	regex(...e) {
		return this.check(/* @__PURE__ */ _a(...e));
	},
	includes(...e) {
		return this.check(/* @__PURE__ */ ba(...e));
	},
	startsWith(...e) {
		return this.check(/* @__PURE__ */ xa(...e));
	},
	endsWith(...e) {
		return this.check(/* @__PURE__ */ Sa(...e));
	},
	min(...e) {
		return this.check(/* @__PURE__ */ ha(...e));
	},
	max(...e) {
		return this.check(/* @__PURE__ */ ma(...e));
	},
	length(...e) {
		return this.check(/* @__PURE__ */ ga(...e));
	},
	nonempty(...e) {
		return this.check(/* @__PURE__ */ ha(1, ...e));
	},
	lowercase(e) {
		return this.check(/* @__PURE__ */ va(e));
	},
	uppercase(e) {
		return this.check(/* @__PURE__ */ ya(e));
	},
	trim() {
		return this.check(/* @__PURE__ */ wa());
	},
	normalize(...e) {
		return this.check(/* @__PURE__ */ Ca(...e));
	},
	toLowerCase() {
		return this.check(/* @__PURE__ */ Ta());
	},
	toUpperCase() {
		return this.check(/* @__PURE__ */ Ea());
	},
	slugify() {
		return this.check(/* @__PURE__ */ Da());
	}
})), Jo = /*@__PURE__*/ A("ZodString", (e, t) => {
	Bn.init(e, t), qo.init(e, t);
}, {
	email(e) {
		return this.check(/* @__PURE__ */ Mi(es, e));
	},
	url(e) {
		return this.check(/* @__PURE__ */ Ri(is, e));
	},
	jwt(e) {
		return this.check(/* @__PURE__ */ $i(ys, e));
	},
	emoji(e) {
		return this.check(/* @__PURE__ */ zi(as, e));
	},
	guid(e) {
		return this.check(/* @__PURE__ */ Ni(ns, e));
	},
	uuid(e) {
		return this.check(/* @__PURE__ */ Pi(rs, e));
	},
	uuidv4(e) {
		return this.check(/* @__PURE__ */ Fi(rs, e));
	},
	uuidv6(e) {
		return this.check(/* @__PURE__ */ Ii(rs, e));
	},
	uuidv7(e) {
		return this.check(/* @__PURE__ */ Li(rs, e));
	},
	nanoid(e) {
		return this.check(/* @__PURE__ */ Bi(os, e));
	},
	cuid(e) {
		return this.check(/* @__PURE__ */ Vi(ss, e));
	},
	cuid2(e) {
		return this.check(/* @__PURE__ */ Hi(cs, e));
	},
	ulid(e) {
		return this.check(/* @__PURE__ */ Ui(ls, e));
	},
	base64(e) {
		return this.check(/* @__PURE__ */ Xi(gs, e));
	},
	base64url(e) {
		return this.check(/* @__PURE__ */ Zi(_s, e));
	},
	xid(e) {
		return this.check(/* @__PURE__ */ Wi(us, e));
	},
	ksuid(e) {
		return this.check(/* @__PURE__ */ Gi(ds, e));
	},
	ipv4(e) {
		return this.check(/* @__PURE__ */ Ki(fs, e));
	},
	ipv6(e) {
		return this.check(/* @__PURE__ */ qi(ps, e));
	},
	cidrv4(e) {
		return this.check(/* @__PURE__ */ Ji(ms, e));
	},
	cidrv6(e) {
		return this.check(/* @__PURE__ */ Yi(hs, e));
	},
	e164(e) {
		return this.check(/* @__PURE__ */ Qi(vs, e));
	},
	datetime(e) {
		return this.check(/* @__PURE__ */ ea(Xo, e));
	},
	date(e) {
		return this.check(/* @__PURE__ */ ta(Zo, e));
	},
	time(e) {
		return this.check(/* @__PURE__ */ na(Qo, e));
	},
	duration(e) {
		return this.check(/* @__PURE__ */ ra($o, e));
	}
});
function Yo(e) {
	return /* @__PURE__ */ ji(Jo, e);
}
var Y = /*@__PURE__*/ A("ZodStringFormat", (e, t) => {
	I.init(e, t), qo.init(e, t);
}), Xo = /*@__PURE__*/ A("ZodISODateTime", (e, t) => {
	ar.init(e, t), Y.init(e, t);
}), Zo = /*@__PURE__*/ A("ZodISODate", (e, t) => {
	or.init(e, t), Y.init(e, t);
}), Qo = /*@__PURE__*/ A("ZodISOTime", (e, t) => {
	sr.init(e, t), Y.init(e, t);
}), $o = /*@__PURE__*/ A("ZodISODuration", (e, t) => {
	cr.init(e, t), Y.init(e, t);
}), es = /*@__PURE__*/ A("ZodEmail", (e, t) => {
	Un.init(e, t), Y.init(e, t);
});
function ts(e) {
	return /* @__PURE__ */ Mi(es, e);
}
var ns = /*@__PURE__*/ A("ZodGUID", (e, t) => {
	Vn.init(e, t), Y.init(e, t);
}), rs = /*@__PURE__*/ A("ZodUUID", (e, t) => {
	Hn.init(e, t), Y.init(e, t);
}), is = /*@__PURE__*/ A("ZodURL", (e, t) => {
	Zn.init(e, t), Y.init(e, t);
}), as = /*@__PURE__*/ A("ZodEmoji", (e, t) => {
	Qn.init(e, t), Y.init(e, t);
}), os = /*@__PURE__*/ A("ZodNanoID", (e, t) => {
	$n.init(e, t), Y.init(e, t);
}), ss = /*@__PURE__*/ A("ZodCUID", (e, t) => {
	er.init(e, t), Y.init(e, t);
}), cs = /*@__PURE__*/ A("ZodCUID2", (e, t) => {
	tr.init(e, t), Y.init(e, t);
}), ls = /*@__PURE__*/ A("ZodULID", (e, t) => {
	nr.init(e, t), Y.init(e, t);
}), us = /*@__PURE__*/ A("ZodXID", (e, t) => {
	rr.init(e, t), Y.init(e, t);
}), ds = /*@__PURE__*/ A("ZodKSUID", (e, t) => {
	ir.init(e, t), Y.init(e, t);
}), fs = /*@__PURE__*/ A("ZodIPv4", (e, t) => {
	lr.init(e, t), Y.init(e, t);
}), ps = /*@__PURE__*/ A("ZodIPv6", (e, t) => {
	fr.init(e, t), Y.init(e, t);
}), ms = /*@__PURE__*/ A("ZodCIDRv4", (e, t) => {
	pr.init(e, t), Y.init(e, t);
}), hs = /*@__PURE__*/ A("ZodCIDRv6", (e, t) => {
	hr.init(e, t), Y.init(e, t);
}), gs = /*@__PURE__*/ A("ZodBase64", (e, t) => {
	vr.init(e, t), Y.init(e, t);
}), _s = /*@__PURE__*/ A("ZodBase64URL", (e, t) => {
	xr.init(e, t), Y.init(e, t);
}), vs = /*@__PURE__*/ A("ZodE164", (e, t) => {
	Sr.init(e, t), Y.init(e, t);
}), ys = /*@__PURE__*/ A("ZodJWT", (e, t) => {
	wr.init(e, t), Y.init(e, t);
}), bs = /*@__PURE__*/ A("ZodNumber", (e, t) => {
	Tr.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => io(e, t, n, r), e.isFinite = !0;
}, /*@__PURE__*/ Xe({
	minValue: (e) => {
		let { minimum: t, exclusiveMinimum: n } = K(e);
		return Math.max(t ?? -Infinity, n ?? -Infinity);
	},
	maxValue: (e) => {
		let { maximum: t, exclusiveMaximum: n } = K(e);
		return Math.min(t ?? Infinity, n ?? Infinity);
	},
	isInt: (e) => {
		let { isInt: t, multipleOf: n } = K(e);
		return !!t || !!n?.some(Number.isSafeInteger);
	},
	format: (e) => K(e).format ?? null
}, {
	gt(e, t) {
		return this.check(/* @__PURE__ */ da(e, t));
	},
	gte(e, t) {
		return this.check(/* @__PURE__ */ fa(e, t));
	},
	min(e, t) {
		return this.check(/* @__PURE__ */ fa(e, t));
	},
	lt(e, t) {
		return this.check(/* @__PURE__ */ la(e, t));
	},
	lte(e, t) {
		return this.check(/* @__PURE__ */ ua(e, t));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ ua(e, t));
	},
	int(e) {
		return this.check(Cs(e));
	},
	safe(e) {
		return this.check(Cs(e));
	},
	positive(e) {
		return this.check(/* @__PURE__ */ da(0, e));
	},
	nonnegative(e) {
		return this.check(/* @__PURE__ */ fa(0, e));
	},
	negative(e) {
		return this.check(/* @__PURE__ */ la(0, e));
	},
	nonpositive(e) {
		return this.check(/* @__PURE__ */ ua(0, e));
	},
	multipleOf(e, t) {
		return this.check(/* @__PURE__ */ pa(e, t));
	},
	step(e, t) {
		return this.check(/* @__PURE__ */ pa(e, t));
	},
	finite() {
		return this;
	}
}));
function xs(e) {
	return /* @__PURE__ */ ia(bs, e);
}
var Ss = /*@__PURE__*/ A("ZodNumberFormat", (e, t) => {
	Er.init(e, t), bs.init(e, t);
});
function Cs(e) {
	return /* @__PURE__ */ aa(Ss, e);
}
var ws = /*@__PURE__*/ A("ZodBoolean", (e, t) => {
	Dr.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => ao(e, t, n, r);
});
function Ts(e) {
	return /* @__PURE__ */ oa(ws, e);
}
var Es = /*@__PURE__*/ A("ZodUnknown", (e, t) => {
	Or.init(e, t), J.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function Ds() {
	return /* @__PURE__ */ sa(Es);
}
var Os = /*@__PURE__*/ A("ZodNever", (e, t) => {
	kr.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => oo(e, t, n, r);
});
function ks(e) {
	return /* @__PURE__ */ ca(Os, e);
}
var As = /*@__PURE__*/ A("ZodArray", (e, t) => {
	Ko(), jr.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => fo(e, t, n, r), e.element = t.element;
}, {
	min(e, t) {
		return this.check(/* @__PURE__ */ ha(e, t));
	},
	nonempty(e) {
		return this.check(/* @__PURE__ */ ha(1, e));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ ma(e, t));
	},
	length(e, t) {
		return this.check(/* @__PURE__ */ ga(e, t));
	},
	unwrap() {
		return this.element;
	}
});
function js(e, t) {
	return /* @__PURE__ */ Oa(As, e, t);
}
var Ms = /*@__PURE__*/ A("ZodObject", (e, t) => {
	Ko(), Lr.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => mo(e, t, n, r), tt(e, "shape", (e) => e._zod.def.shape, !1);
}, {
	keyof() {
		return Vs(Object.keys(this._zod.def.shape));
	},
	catchall(e) {
		return this.clone(y(this._zod.def, { catchall: e }));
	},
	passthrough() {
		return this.clone(y(this._zod.def, { catchall: Ds() }));
	},
	loose() {
		return this.clone(y(this._zod.def, { catchall: Ds() }));
	},
	strict() {
		return this.clone(y(this._zod.def, { catchall: ks() }));
	},
	strip() {
		return this.clone(y(this._zod.def, { catchall: void 0 }));
	},
	extend(e) {
		return Pe(this, e);
	},
	safeExtend(e) {
		return Ie(this, e);
	},
	merge(e) {
		return Le(this, e);
	},
	pick(e) {
		return je(this, e);
	},
	omit(e) {
		return Ne(this, e);
	},
	partial(...e) {
		return Re(Ks, this, e[0]);
	},
	exactPartial(...e) {
		return Re(Js, this, e[0], "exactPartial");
	},
	required(...e) {
		return ze(nc, this, e[0]);
	}
});
function Ns(e, t) {
	return new Ms({
		type: "object",
		shape: e ?? {},
		...C(t)
	});
}
var Ps = /*@__PURE__*/ A("ZodUnion", (e, t) => {
	zr.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => ho(e, t, n, r), e.options = t.options;
});
function Fs(e, t) {
	return new Ps({
		type: "union",
		options: e,
		...C(t)
	});
}
var Is = /*@__PURE__*/ A("ZodIntersection", (e, t) => {
	Br.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => go(e, t, n, r);
});
function Ls(e, t) {
	return new Is({
		type: "intersection",
		left: e,
		right: t
	});
}
var Rs = /*@__PURE__*/ A("ZodRecord", (e, t) => {
	Ko(), Ur.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => bo(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function zs(e, t, n) {
	return !t || !t._zod ? new Rs({
		type: "record",
		keyType: Yo(),
		valueType: e,
		...C(t)
	}) : new Rs({
		type: "record",
		keyType: e,
		valueType: t,
		...C(n)
	});
}
var Bs = /*@__PURE__*/ A("ZodEnum", (e, t) => {
	Wr.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => so(e, t, n, r), e.enum = t.entries, e.options = [...e._zod.values];
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new Bs({
			...t,
			checks: [],
			...C(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new Bs({
			...t,
			checks: [],
			...C(r),
			entries: i
		});
	};
});
function Vs(e, t) {
	return new Bs({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...C(t)
	});
}
var Hs = /*@__PURE__*/ A("ZodLiteral", (e, t) => {
	Gr.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => co(e, t, n, r), e.values = new Set(t.values), Object.defineProperty(e, "value", { get() {
		if (t.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return t.values[0];
	} });
});
function Us(e, t) {
	return new Hs({
		type: "literal",
		values: Array.isArray(e) ? e : [e],
		...C(t)
	});
}
var Ws = /*@__PURE__*/ A("ZodTransform", (e, t) => {
	Ko(), Kr.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => uo(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new ct(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(qe(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", "input" in t || (t.input = n.value), t.inst ??= e, n.issues.push(qe(t));
			}
		};
		let i = t.transform(n.value, n);
		return i instanceof Promise ? i.then((e) => (n.value = e, n)) : (n.value = i, n);
	};
});
function Gs(e) {
	return new Ws({
		type: "transform",
		transform: e
	});
}
var Ks = /*@__PURE__*/ A("ZodOptional", (e, t) => {
	Jr.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ao(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function qs(e) {
	return new Ks({
		type: "optional",
		innerType: e
	});
}
var Js = /*@__PURE__*/ A("ZodExactOptional", (e, t) => {
	Yr.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ao(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Ys(e) {
	return new Js({
		type: "optional",
		innerType: e
	});
}
var Xs = /*@__PURE__*/ A("ZodNullable", (e, t) => {
	Xr.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => xo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Zs(e) {
	return new Xs({
		type: "nullable",
		innerType: e
	});
}
var Qs = /*@__PURE__*/ A("ZodDefault", (e, t) => {
	Zr.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => To(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function $s(e, t) {
	return new Qs({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : Te(t);
		}
	});
}
var ec = /*@__PURE__*/ A("ZodPrefault", (e, t) => {
	$r.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => Eo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function tc(e, t) {
	return new ec({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : Te(t);
		}
	});
}
var nc = /*@__PURE__*/ A("ZodNonOptional", (e, t) => {
	ei.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => So(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function rc(e, t) {
	return new nc({
		type: "nonoptional",
		innerType: e,
		...C(t)
	});
}
var ic = /*@__PURE__*/ A("ZodCatch", (e, t) => {
	ri.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => Do(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function ac(e, t) {
	return new ic({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : rt(t)
	});
}
var oc = /*@__PURE__*/ A("ZodPipe", (e, t) => {
	ii.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => Oo(e, t, n, r), e.in = t.in, e.out = t.out;
});
function sc(e, t) {
	return new oc({
		type: "pipe",
		in: e,
		out: t
	});
}
var cc = /*@__PURE__*/ A("ZodReadonly", (e, t) => {
	oi.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => ko(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function lc(e) {
	return new cc({
		type: "readonly",
		innerType: e
	});
}
var uc = /*@__PURE__*/ A("ZodCustom", (e, t) => {
	ci.init(e, t), J.init(e, t), e._zod.processJSONSchema = (t, n, r) => lo(e, t, n, r);
});
function dc(e, t = {}) {
	return /* @__PURE__ */ ka(uc, e, t);
}
function fc(e, t) {
	return /* @__PURE__ */ Aa(e, t);
}
//#endregion
//#region src/features/security/rbac.ts
var pc = /* @__PURE__ */ "payroll.read,payroll.manage,payroll.approve,payroll.post,purchases.return.read,purchases.return,documents.prepare,sales.read,sales.write,sales.manage,sales.payment,purchases.read,purchases.receive,purchases.bill,purchases.void,inventory.read,inventory.cost.read,inventory.adjust,accounting.read,accounting.post,accounting.periods,accounting.reopen,accounting.recover,audit.read,users.manage,contacts.write,purchases.write,purchases.payment,banking.read,banking.write,banking.reconcile".split(","), mc = [
	"ADMIN",
	"FINANCE_ADMIN",
	"ACCOUNTANT",
	"SALES",
	"WAREHOUSE",
	"PURCHASING",
	"AUDITOR"
], hc = {
	ADMIN: pc,
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
function X(e, t) {
	return !!(e?.authenticated && e.userId.trim() && e.roles.some((e) => Object.prototype.hasOwnProperty.call(hc, e) && hc[e].includes(t)));
}
function gc(e, t) {
	if (!X(e, t)) throw Error(`Permission denied: ${t}. Verified session required.`);
	return e;
}
//#endregion
//#region src/features/attachments/attachmentModel.ts
var _c = [
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
], vc = Ns({
	kind: Vs(_c),
	id: Yo().min(1).max(200)
}).strict(), yc = {
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
function bc(e, t) {
	return _c.flatMap((n) => {
		let r = yc[n];
		return X(t, r.read) ? (e[r.repository]?.[r.collection] ?? []).map((e) => ({
			kind: n,
			id: String(e.id),
			label: r.label.map((t) => e[t]).filter(Boolean).join(" · ") || String(e.id),
			canWrite: X(t, r.write),
			path: ie(String(e.id)) ? "/sales/recycle-bin" : (n === "Customer" || n === "Supplier") && !X(t, "contacts.write") ? "" : r.path + encodeURIComponent(String(e.id))
		})) : [];
	});
}
var xc = 1e7, Sc = 5e7, Cc = {
	".pdf": "application/pdf",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".csv": "text/csv",
	".txt": "text/plain",
	".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
};
function wc(e, t) {
	if (typeof e != "string" || e.length > 200 || e !== d(e) || /[\\/\x00-\x1f\x7f]/.test(e) || e === "." || e === "..") throw Error("Choose a plain file name of at most 200 characters.");
	let n = p(e).toLowerCase(), r = Cc[n];
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
function Tc(e) {
	let t = wc(e.name, e.content);
	if (t.size !== e.size || t.sha256 !== e.sha256 || t.mime !== e.mime) throw Error("Attachment content integrity check failed.");
	return Buffer.from(e.content, "base64");
}
function Ec(t, n) {
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
function Dc(r) {
	let o = i(r, t.O_RDONLY | t.O_NOFOLLOW | t.O_NONBLOCK);
	try {
		let e = n(o);
		if (!e.isFile() || e.size > 1e7) throw Error("Choose a regular file no larger than 10 MB.");
		let t = Buffer.alloc(xc + 1), r = 0;
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
//#region src/features/security/repositoryHost.ts
var Z = /* @__PURE__ */ new Map(), Oc, kc = () => globalThis.__HTT_MAIN_HOST__ === !0;
function Ac() {
	return typeof window > "u" ? void 0 : window.securityBridge;
}
function jc(e, t) {
	let n = Ac();
	if (!n) throw Error("This operation requires the secure Electron desktop application.");
	let r = n.request(e, t);
	if (!r.ok) throw Error("error" in r ? r.error : "Desktop request failed.");
	return r.value;
}
function Mc(e) {
	if (typeof window < "u") try {
		for (let e of Object.keys(window.localStorage)) e.startsWith("htt") && window.localStorage.removeItem(e);
		for (let [t, n] of Object.entries(e.storage)) window.localStorage.setItem(t, n);
	} catch {}
	Oc = e, Ic(e.repositories, !1), Z.forEach((e) => e.publish());
}
function Nc(e, t) {
	if (Z.has(e)) throw Error(`Duplicate repository registration: ${e}`);
	if (Z.set(e, t), !kc()) {
		Oc && Object.hasOwn(Oc.repositories, e) && t.restore(structuredClone(Oc.repositories[e]));
		for (let [n, r] of Object.entries(t.commands)) Object.hasOwn(t.repository, n) && (t.repository[n] = (...t) => {
			if (!r) throw Error(`Internal repository method is not a desktop command: ${e}.${n}`);
			let i = jc("business.command", {
				repository: e,
				method: n,
				args: t
			});
			return Mc(i.view), i.result;
		});
	}
}
function Pc(e) {
	return Object.fromEntries([...Z].filter(([t]) => !e || e.includes(t)).map(([e, t]) => [e, structuredClone(t.snapshot())]));
}
function Fc(e) {
	for (let [t, n] of Object.entries(e)) Z.get(t)?.validate?.(structuredClone(n), e);
}
function Ic(e, t = !0) {
	for (let [n, r] of Object.entries(e)) {
		let e = Z.get(n);
		if (!e) {
			if (t) throw Error(`Unknown repository in desktop snapshot: ${n}`);
			continue;
		}
		e.restore(structuredClone(r));
	}
}
function Lc(e, t) {
	let n = Z.get(e), r = n && Object.hasOwn(n.commands, t) ? n.commands[t] : null;
	if (!r || typeof n?.repository[t] != "function") throw Error("Unknown or internal desktop business command.");
	return {
		permission: r,
		execute: (r) => (ae(e, r), n.repository[t].apply(n.repository, r))
	};
}
function Rc(e) {
	return Object.fromEntries([...Z].map(([t, n]) => {
		let r = structuredClone(n.snapshot()), i = X(e, n.read), a = Array.isArray(r) ? [] : Object.fromEntries(Object.keys(r).map((e) => [e, []]));
		return [t, i ? n.view?.(e) ?? r : a];
	}));
}
//#endregion
//#region src/features/business-workspace/configurationState.ts
var Q = {}, zc = (e) => Q["linked-accounts"]?.find((t) => t.status === "Active" && t.role === e)?.accountId;
function Bc(e) {
	e ??= Uc().gstCode;
	let t = Q["tax-codes"]?.find((t) => t.status === "Active" && t.code === e);
	if (!t) {
		if (!Q["tax-codes"] && e === "GST") return .1;
		throw Error(`Active tax code ${e} was not found.`);
	}
	return Number(t.rate) / 100;
}
function Vc(e) {
	let t = Date.parse(e.at.length === 10 ? e.at + "T00:00:00Z" : e.at), n = (Q.promotions ?? []).filter((n) => n.status === "Active" && n.productId === e.productId && n.unitId === e.unitId && (!n.customerId || n.customerId === e.customerId) && Date.parse(n.starts) <= t && t < Date.parse(n.ends));
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
function Hc(e) {
	return (Q["linked-accounts"] ?? []).some((t) => t.status === "Active" && t.accountId === e) || (Q["tax-codes"] ?? []).some((t) => t.status === "Active" && (t.collected === e || t.paid === e));
}
function Uc() {
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
		...Q.settings?.find((e) => e.section === "business" && e.status === "Active")
	};
}
function Wc(e, t, n) {
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
	let i = Uc(), a = `${i[r[0]]}-${n}-`, o = Math.max(Number(i[r[1]]), 1, ...t.filter((e) => e.startsWith(a)).map((e) => Number(e.slice(a.length)) + 1).filter(Number.isFinite));
	if (!Number.isSafeInteger(o) || o > 999999999) throw Error("Document number sequence exhausted.");
	return `${a}${String(o).padStart(4, "0")}`;
}
function Gc(e) {
	let t = Q["tax-codes"]?.find((t) => t.code === e && t.status === "Active");
	return {
		taxCode: e,
		taxRate: Bc(e),
		taxCollectedAccountId: t?.collected,
		taxPaidAccountId: t?.paid,
		taxReport: t?.report ?? e
	};
}
function Kc(e, t, n = Uc().basis) {
	return n === "Inclusive" ? Math.round(e / (1 + t) * 1e8) / 1e8 : e;
}
//#endregion
//#region src/lib/businessDate.ts
function qc(e) {
	if (/^\d{4}-\d{2}-\d{2}$/.test(e)) return e;
	let t = new Date(e);
	if (!Number.isFinite(t.getTime())) throw Error("Invalid accounting timestamp.");
	let n = new Intl.DateTimeFormat("en-NZ", {
		timeZone: Uc().timezone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(t), r = (e) => n.find((t) => t.type === e)?.value;
	return `${r("year")}-${r("month")}-${r("day")}`;
}
function $(e, t = "Date") {
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e) || !Number.isFinite(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} must be a valid YYYY-MM-DD date.`);
}
//#endregion
//#region src/features/banking/data/bankJournalEvidence.ts
var Jc = (e) => Math.round((e + 2 ** -52) * 100) / 100, Yc = (e) => e.lines.length >= 2 && new Set(e.lines.map((e) => e.id)).size === e.lines.length && Number.isFinite(e.totalDebit) && e.totalDebit > 0 && e.totalDebit === e.totalCredit && Jc(e.totalDebit) === e.totalDebit && e.lines.every((e) => Number.isFinite(e.debit) && Number.isFinite(e.credit) && e.debit >= 0 && e.credit >= 0 && Jc(e.debit) === e.debit && Jc(e.credit) === e.credit && !(e.debit && e.credit)) && Jc(e.lines.reduce((e, t) => e + t.debit, 0)) === e.totalDebit && Jc(e.lines.reduce((e, t) => e + t.credit, 0)) === e.totalCredit, Xc = (e, t = !1) => JSON.stringify(e.lines.map((e) => [
	e.accountId,
	e.description ?? null,
	t ? e.credit : e.debit,
	t ? e.debit : e.credit
]).sort((e, t) => JSON.stringify(e).localeCompare(JSON.stringify(t))));
function Zc(e, t, n) {
	if (!e || !t || e.id === t.id || n.filter((t) => t.id === e.id).length !== 1 || n.filter((e) => e.id === t.id).length !== 1 || e.status !== "REVERSED" || e.reversedJournalEntryId || !e.reversalReason?.trim() || !Number.isFinite(Date.parse(e.reversedAt ?? "")) || e.reversedAt !== t.postedAt || e.reversalJournalEntryId !== t.id || t.status !== "POSTED" || t.reversedJournalEntryId !== e.id || t.reversalJournalEntryId || t.reversedAt || t.sourceType !== e.sourceType || t.sourceId !== void 0 || t.reference !== e.reference || n.filter((t) => t.reversedJournalEntryId === e.id).length !== 1 || n.filter((e) => e.reversalJournalEntryId === t.id).length !== 1) return !1;
	try {
		$(e.journalDate), $(t.journalDate);
	} catch {
		return !1;
	}
	return t.journalDate >= e.journalDate && Yc(e) && Yc(t) && e.totalDebit === t.totalCredit && e.totalCredit === t.totalDebit && Xc(e, !0) === Xc(t);
}
function Qc(e, t) {
	return t.filter((t) => t.id === e.id).length === 1 ? e.reversedJournalEntryId ? Zc(t.find((t) => t.id === e.reversedJournalEntryId), e, t) : e.status === "REVERSED" || e.reversalJournalEntryId || e.reversedAt ? Zc(e, t.find((t) => t.id === e.reversalJournalEntryId), t) : e.status === "POSTED" && !t.some((t) => t.reversedJournalEntryId === e.id || t.reversalJournalEntryId === e.id) : !1;
}
function $c(e) {
	return new Set(e.filter((t) => !Qc(t, e)).map((e) => e.id));
}
function el(e, t, n) {
	try {
		$(e.journalDate), $(n);
	} catch {
		return !1;
	}
	return e.journalDate > n || !Qc(e, t) ? !1 : e.status === "POSTED" || t.find((t) => t.id === e.reversalJournalEntryId).journalDate > n;
}
//#endregion
//#region src/features/accounting/data/bankDuplicateCorrection.ts
var tl = (e) => e.lines.length === 2 && new Set(e.lines.map((e) => e.id)).size === 2 && Number.isFinite(e.totalDebit) && e.totalDebit > 0 && e.totalDebit === e.totalCredit && Math.abs(e.totalDebit * 100 - Math.round(e.totalDebit * 100)) < 1e-6 && e.lines.every((t) => Number.isFinite(t.debit) && Number.isFinite(t.credit) && (t.debit === e.totalDebit && t.credit === 0 || t.credit === e.totalCredit && t.debit === 0)) && e.lines[0].accountId !== e.lines[1].accountId && e.lines.reduce((e, t) => e + t.debit, 0) === e.totalDebit && e.lines.reduce((e, t) => e + t.credit, 0) === e.totalCredit, nl = (e, t = !1) => JSON.stringify(e.lines.map((e) => [
	e.accountId,
	e.description ?? null,
	t ? e.credit : e.debit,
	t ? e.debit : e.credit
]).sort((e, t) => JSON.stringify(e).localeCompare(JSON.stringify(t))));
function rl(e, t) {
	return tl(e) && tl(t) && ["BANK_TRANSACTION", "BANK_TRANSFER"].includes(e.sourceType) && e.sourceType === t.sourceType && !!e.sourceId && e.sourceId === t.sourceId && e.journalDate === t.journalDate && e.description === t.description && e.reference === t.reference && e.totalDebit === t.totalDebit && e.totalCredit === t.totalCredit && nl(e) === nl(t);
}
function il(e) {
	let t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), r = [], i = e.filter((e) => e.bankDuplicateCorrection !== void 0);
	if (!i.length) return {
		originals: t,
		offsets: n,
		invalid: r
	};
	let a = $c(e), o = (t) => e.filter((e) => e.id === t);
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
		].some((e) => a.has(e)) || u.id === s.id || u.bankDuplicateCorrection || u.status !== "POSTED" || u.reversedJournalEntryId || u.reversalJournalEntryId || u.reversedAt || s.status !== "REVERSED" || s.reversedJournalEntryId || !s.reversalReason?.trim() || !s.reversedAt || s.reversedAt !== d.postedAt || !rl(s, u) || d.status !== "POSTED" || d.bankDuplicateCorrection || d.sourceType !== s.sourceType || d.sourceId !== void 0 || d.journalDate !== s.journalDate || d.reference !== s.reference || d.reversedJournalEntryId !== s.id || d.reversalJournalEntryId || d.reversedAt || d.totalDebit !== s.totalCredit || d.totalCredit !== s.totalDebit || nl(d) !== nl(s, !0) || e.filter((e) => e.reversedJournalEntryId === s.id).length !== 1 || e.some((e) => e.reversedJournalEntryId === u.id) ? r.push(s.id) : (t.add(s.id), n.add(d.id));
	}
	return {
		originals: t,
		offsets: n,
		invalid: r
	};
}
//#endregion
//#region src/lib/persistence/financialOperationValidation.ts
var al = [
	"CUSTOMER_PAYMENT",
	"PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
], ol = [
	"PENDING",
	"COMPLETED",
	"MANUAL_REVIEW"
], sl = (e) => Array.isArray(e) && e.every((e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.operationId == "string" && t.operationId.length > 0 && al.includes(String(t.kind)) && typeof t.fingerprint == "string" && t.fingerprint.length > 0 && ol.includes(String(t.state)) && typeof t.createdAt == "string" && typeof t.updatedAt == "string" && (t.resolution === void 0 || [
		"CANCELLED_NO_EFFECT",
		"BANK_RECORD_RESTORED",
		"BANK_JOURNAL_RESTORED",
		"BANK_JOURNAL_LINK_RESTORED",
		"BANK_DUPLICATE_REVERSED"
	].includes(String(t.resolution)) && t.state === "COMPLETED" && typeof t.resultId == "string" && !!t.resultId && !!t.repairProposal && t.repairProposal.status === "EXECUTED") && (t.repairProposal === void 0 || cl(t.repairProposal) && ll(t)) && (t.resultId === void 0 || typeof t.resultId == "string") && (t.note === void 0 || typeof t.note == "string") && (t.reviewHistory === void 0 || Array.isArray(t.reviewHistory) && t.reviewHistory.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		return typeof t.reference == "string" && t.reference.length >= 3 && typeof t.operator == "string" && t.operator.length >= 2 && typeof t.recordedAt == "string" && typeof t.summary == "string" && t.summary.length >= 3;
	}));
}) && new Set(e.map((e) => e.operationId)).size === e.length && new Set(e.filter((e) => e.repairProposal).map((e) => e.repairProposal.id)).size === e.filter((e) => e.repairProposal).length;
function cl(e) {
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
function ll(e) {
	try {
		if (!["BANK_TRANSACTION", "BANK_TRANSFER"].includes(String(e.kind))) return !1;
		let t = e.repairProposal, n = JSON.parse(t.planJson), r = e.reviewHistory;
		if (!r?.some((e) => e.reference === t.reference && e.operator === t.reviewer) || !e.resultId || n.operationId !== e.operationId || n.resultId !== e.resultId || n.action !== t.action || n.evidenceDigest !== t.evidenceDigest || n.eligible !== !0 || t.action === "RESTORE_BANK_JOURNAL_LINK" && (typeof n.previousJournalId != "string" || !n.previousJournalId.trim() || typeof n.existingJournalId != "string" || !n.existingJournalId.trim() || n.previousJournalId === n.existingJournalId || t.status === "EXECUTED" && t.resultJournalId !== n.existingJournalId) || t.action === "REVERSE_BANK_DUPLICATE" && (typeof n.duplicateJournalId != "string" || !n.duplicateJournalId.trim() || typeof n.existingJournalId != "string" || !n.existingJournalId.trim() || n.duplicateJournalId === n.existingJournalId || t.status === "EXECUTED" && (!t.resultJournalId || t.resultJournalId === n.duplicateJournalId || t.resultJournalId === n.existingJournalId))) return !1;
		if (t.status === "EXECUTED") {
			let n = t.action === "CANCEL_NO_EFFECT" ? "CANCELLED_NO_EFFECT" : t.action === "RESTORE_BANK_RECORD" ? "BANK_RECORD_RESTORED" : t.action === "REVERSE_BANK_DUPLICATE" ? "BANK_DUPLICATE_REVERSED" : t.action === "RESTORE_BANK_JOURNAL_LINK" ? "BANK_JOURNAL_LINK_RESTORED" : "BANK_JOURNAL_RESTORED";
			return e.state === "COMPLETED" && e.resolution === n && r.some((e) => e.reference === t.approvalReference && e.operator === t.approver) && Number.isFinite(Date.parse(t.executedAt));
		}
		return e.resolution === void 0;
	} catch {
		return !1;
	}
}
function ul(e) {
	let t = e["htt:financial-operations:v1"];
	if (t !== void 0) try {
		let e = JSON.parse(t);
		if (e.schemaVersion !== 1 || typeof e.savedAt != "string" || !sl(e.data)) throw Error("Invalid operation registry.");
	} catch {
		throw Error("Financial operation journal or repair evidence is invalid; recovery is blocked.");
	}
}
//#endregion
//#region src/features/accounting/data/accountingPeriodValidation.ts
function dl(e) {
	if (!Array.isArray(e)) throw Error("Invalid accounting periods.");
	let t = [...e].sort((e, t) => String(e?.startDate).localeCompare(String(t?.startDate)));
	for (let e = 0; e < t.length; e++) {
		let n = t[e];
		if (!n || typeof n.id != "string" || !n.id || typeof n.name != "string" || !n.name.trim() || !["OPEN", "CLOSED"].includes(n.status) || !Array.isArray(n.history) || !n.history.length) throw Error("Invalid accounting period record.");
		if ($(n.startDate), $(n.endDate), n.startDate > n.endDate || e && t[e - 1].endDate >= n.startDate) throw Error("Overlapping or invalid accounting periods.");
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
export { ie as $, Dc as A, Xo as B, Lc as C, Fc as D, Pc as E, vc as F, Us as G, js as H, yc as I, zs as J, xs as K, X as L, xc as M, Sc as N, Ec as O, bc as P, ea as Q, gc as R, Nc as S, Rc as T, Ts as U, Vs as V, ts as W, Fs as X, Yo as Y, Ds as Z, zc as _, il as a, Mc as b, el as c, Bc as d, h as et, Uc as f, Hc as g, Kc as h, ul as i, se as it, wc as j, Tc as k, qc as l, Wc as m, sl as n, re as nt, rl as o, Q as p, Ns as q, cl as r, ee as rt, $c as s, dl as t, ne as tt, $ as u, Vc as v, Ic as w, jc as x, Gc as y, mc as z };
