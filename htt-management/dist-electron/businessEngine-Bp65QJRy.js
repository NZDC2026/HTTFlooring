import { S as e, _ as t, a as n, c as r, d as i, f as a, h as o, i as s, l as c, m as l, n as u, o as d, p as f, r as p, s as m, t as h, u as g, y as ee } from "./accountingPeriodValidation-CGTZib78.js";
//#region \0rolldown/runtime.js
var te = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports);
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/util.js
function ne(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function re(e, t = "|") {
	return e.map((e) => Te(e)).join(t);
}
function ie(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
var ae = class {
	constructor(e) {
		this._getter = e, this._value = void 0;
	}
	get value() {
		let e = this._getter;
		return e !== void 0 && (this._value = e(), this._getter = void 0), this._value;
	}
};
function oe(e) {
	return new ae(e);
}
function se(e) {
	return e == null;
}
function _(e) {
	let t = +!!e.startsWith("^"), n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function ce(e, t) {
	let n = e / t, r = Math.round(n), i = 4 * 2 ** -52 * Math.max(Math.abs(n), 1);
	return Math.abs(n - r) < i ? 0 : n - r;
}
function le(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function v(e) {
	let t = Object.getOwnPropertyDescriptor(e, "shape");
	return t?.get ? t.get.raw : t?.value;
}
function ue(e) {
	return v(e._zod.def) ?? e._zod.def.shape;
}
function de(e, t, n) {
	Object.defineProperty(e, t, {
		get() {
			let e = n();
			return le(this, t, e), e;
		},
		enumerable: !0,
		configurable: !0
	});
}
function fe(e, t, n) {
	t in e ? le(e, t, n) : e[t] = n;
}
function pe(e, t, n, r) {
	let i = ue(t);
	for (let a of n) {
		let n = Object.getOwnPropertyDescriptor(i, a);
		n.enumerable && (n.get ? de(e, a, () => {
			let e = t._zod.def.shape[a];
			return r ? r(e, a) : e;
		}) : fe(e, a, r ? r(n.value, a) : n.value));
	}
}
function me(e, t) {
	for (let n of Reflect.ownKeys(t)) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.enumerable && (r.get ? de(e, n, () => t[n]) : fe(e, n, r.value));
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
function he(e) {
	return JSON.stringify(e);
}
function ge(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var _e = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function ve(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var ye = /* @__PURE__*/ oe(() => {
	if (ft.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function be(e) {
	if (ve(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return ve(n) !== !1 && Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") !== !1;
}
function xe(e) {
	return be(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var Se = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function Ce(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function we(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n?.parent) && (r._zod.parent = e), r;
}
function b(e) {
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
function Te(e) {
	return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function Ee(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
var De = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, Oe = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function ke(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	let i = {};
	return pe(i, e, Ae(e, t)), we(e, y(n, {
		shape: i,
		checks: []
	}));
}
function Ae(e, t) {
	let n = ue(e), r = [];
	for (let e of Reflect.ownKeys(t)) {
		if (!Object.getOwnPropertyDescriptor(n, e)?.enumerable) throw Error(`Unrecognized key: "${String(e)}"`);
		t[e] && r.push(e);
	}
	return r;
}
function je(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	let i = new Set(Ae(e, t)), a = {};
	return pe(a, e, Reflect.ownKeys(ue(e)).filter((e) => !i.has(e))), we(e, y(n, {
		shape: a,
		checks: []
	}));
}
function Me(e, t) {
	if (!be(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = ue(e);
		for (let e of Reflect.ownKeys(t)) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return we(e, y(e._zod.def, { shape: Ne(e, t) }));
}
function Ne(e, t) {
	let n = {};
	return pe(n, e, Reflect.ownKeys(ue(e))), me(n, t), n;
}
function Pe(e, t) {
	if (!be(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return we(e, y(e._zod.def, { shape: Ne(e, t) }));
}
function Fe(e, t) {
	if (!t?._zod?.def) throw Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (e._zod.def.checks?.length) throw Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	let n = {};
	return pe(n, e, Reflect.ownKeys(ue(e))), pe(n, t, Reflect.ownKeys(ue(t))), we(e, y(e._zod.def, {
		shape: n,
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: t._zod.def.checks ?? []
	}));
}
function Ie(e, t, n, r = "partial") {
	let i = t._zod.def.checks;
	if (i && i.length > 0) throw Error(`.${r}() cannot be used on object schemas containing refinements`);
	let a = n ? new Set(Ae(t, n)) : void 0, o = {};
	return pe(o, t, Reflect.ownKeys(ue(t)), e && ((t, n) => a && !a.has(n) ? t : new e({
		type: "optional",
		innerType: t
	}))), we(t, y(t._zod.def, {
		shape: o,
		checks: []
	}));
}
function Le(e, t, n) {
	let r = n ? new Set(Ae(t, n)) : void 0, i = {};
	return pe(i, t, Reflect.ownKeys(ue(t)), (t, n) => r && !r.has(n) ? t : new e({
		type: "nonoptional",
		innerType: t
	})), we(t, y(t._zod.def, { shape: i }));
}
function x(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function Re(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
	return !1;
}
function ze(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function Be(e) {
	return typeof e == "string" ? e : e?.message;
}
function Ve(e, t, n) {
	var r;
	for (let i = t; i < e.length; i++) (r = e[i]).schema ?? (r.schema = n);
}
function He(e, t, n) {
	var r;
	let i = e.inst?._zod?.traits;
	i?.has("$ZodType") && (i.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
	let a = e.schema === e.inst ? void 0 : e.schema?._zod.def?.error, o = e.message ? e.message : Be(e.inst?._zod.def?.error?.(e)) ?? Be(a?.(e)) ?? Be(t?.error?.(e)) ?? Be(n.customError?.(e)) ?? Be(n.localeError?.(e)) ?? "Invalid input", s = {};
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
		}) : Qe(e, n, r.value);
	}
}
function Ye(e, t, n, r = !0) {
	return Object.defineProperty(e, t, {
		configurable: !0,
		writable: !0,
		enumerable: r,
		value: n
	}), n;
}
function Xe(e, t, n) {
	return Ye(e, t, n, !1);
}
function Ze(e, t) {
	for (let n in e) {
		let r = e[n];
		Object.defineProperty(t, n, {
			configurable: !0,
			enumerable: !0,
			get() {
				return Ye(this, n, r(this));
			},
			set(e) {
				Ye(this, n, e);
			}
		});
	}
	return t;
}
function Qe(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		get() {
			return this == null ? n : Ye(this, t, n.bind(this));
		},
		set(e) {
			Ye(this, t, e);
		}
	});
}
function $e(e, t) {
	let n = Object.getPrototypeOf(e);
	return t in n ? void 0 : n;
}
var et, tt = !1, nt = {
	configurable: !0,
	get() {
		tt = !0;
	}
};
function S(e, t, n) {
	let r = Object.getPrototypeOf(e._zod);
	if (t in r && et !== e._zod) {
		et = void 0;
		return;
	}
	et = e._zod, Object.defineProperty(r, t, {
		configurable: !0,
		get() {
			Object.defineProperty(this, t, nt);
			let e = tt;
			tt = !1;
			try {
				let r = n(this);
				return tt ? delete this[t] : Object.defineProperty(this, t, {
					configurable: !0,
					writable: !0,
					value: r
				}), tt ||= e, r;
			} catch (n) {
				throw delete this[t], tt ||= e, n;
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
	let i = $e(e, t);
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
function C(e, t, n, r) {
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
			s.has(i) || (s.add(i), Je(i, o));
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
var ut = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, dt = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(ot = globalThis).__zod_globalConfig ?? (ot.__zod_globalConfig = {});
var ft = globalThis.__zod_globalConfig;
function pt(e) {
	return e && Object.assign(ft, e), ft;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/errors.js
function mt() {
	let e = this._zod;
	return e.message ??= JSON.stringify(e.def, ie, 2), e.message;
}
function ht(e) {
	this._zod.message = e;
}
var gt = {
	get: mt,
	set: ht,
	enumerable: !0,
	configurable: !0
}, _t = {
	value: void 0,
	enumerable: !1
}, vt = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), yt = (e, t) => {
	e.name = "$ZodError", _t.value = t, Object.defineProperty(e, "issues", _t), _t.value = void 0, Object.defineProperty(e, "message", gt);
	let n = Object.getPrototypeOf(e);
	vt.has(n) || (vt.add(n), Object.defineProperty(n, "toString", {
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
}, bt = C("$ZodError", yt);
C("$ZodError", yt, void 0, { Parent: Error });
function xt(e, t, n) {
	return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, {
		value: n(),
		writable: !0,
		enumerable: !0,
		configurable: !0
	}) : e[t] = n()), e[t];
}
function St(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? xt(n, i.path[0], () => []).push(t(i)) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function Ct(e, t = (e) => e.message) {
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
function wt(e, t) {
	return {
		callee: t?.callee ?? e,
		Err: t?.Err
	};
}
var Tt = (e) => {
	let t = (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !1
		} : { async: !1 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise) throw new ut();
		if (s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => He(e, o, pt())));
			throw _e(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, Et = (e) => {
	let t = async (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !0
		} : { async: !0 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise && (s = await s), s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => He(e, o, pt())));
			throw _e(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, Dt = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new ut();
	return a.issues.length ? Ot(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
};
function Ot(e, t, n) {
	let r;
	return {
		success: !1,
		get error() {
			return r || (r = new e(t.map((e) => He(e, n, pt()))), t = void 0, n = void 0), r;
		},
		set error(e) {
			r = e, t = void 0, n = void 0;
		}
	};
}
var kt = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		async: !0
	} : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? Ot(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
}, At = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), jt = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), Mt = ((e, t, n) => {
	let r = e._zod.bag.validator;
	if (r !== void 0) {
		if (r(t) !== At) return !0;
		if (r.definite === !0 && n === void 0) return !1;
	}
	return Nt(e, t, n);
});
function Nt(e, t, n) {
	let r = n ? {
		...n,
		async: !1,
		abortEarly: !0
	} : {
		async: !1,
		abortEarly: !0
	}, i = e._zod.bag.fallbackRun, a;
	if (i ? (r[jt] = !0, a = i({
		value: t,
		issues: []
	}, r)) : a = e._zod.run({
		value: t,
		issues: []
	}, r), a instanceof Promise) throw new ut();
	return a.issues.length === 0;
}
var Pt = async (e, t, n) => {
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
}, Ft = (e) => {
	let t = Tt(e), n = (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return t(e, r, o, wt(n, a));
	};
	return n;
}, It = (e) => {
	let t = Tt(e), n = (e, r, i, a) => t(e, r, i, wt(n, a));
	return n;
}, Lt = (e) => {
	let t = Et(e), n = async (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return await t(e, r, o, wt(n, a));
	};
	return n;
}, Rt = (e) => {
	let t = Et(e), n = async (e, r, i, a) => await t(e, r, i, wt(n, a));
	return n;
}, zt = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Dt(e)(t, n, i);
}, Bt = (e) => (t, n, r) => Dt(e)(t, n, r), Vt = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return kt(e)(t, n, i);
}, Ht = (e) => async (t, n, r) => kt(e)(t, n, r), Ut = /^[cC][0-9a-z]{6,}$/, Wt = /^[0-9a-z]+$/, Gt = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, Kt = /^[0-9a-vA-V]{20}$/, qt = /^[A-Za-z0-9]{27}$/, Jt = /^[a-zA-Z0-9_-]{21}$/;
function Yt(e) {
	return RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
var Xt = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Zt = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Qt = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, $t = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, en = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function tn() {
	return new RegExp(en, "u");
}
var nn = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, rn = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, an = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, on = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, sn = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, cn = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, ln = /^https?$/, un = /^\+[1-9]\d{6,14}$/, dn = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function fn(e) {
	return RegExp(`^${e}$`);
}
var pn = /*@__PURE__*/ fn(dn);
function mn(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function hn(e) {
	return RegExp(`^${mn(e)}$`);
}
function gn(e) {
	let t = ["Z"];
	e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let n = `${mn({
		precision: e.precision,
		seconds: !0
	})}(?:${t.join("|")})`, r = e.local ? `${n}|${mn({ precision: e.precision })}` : n;
	return RegExp(`^${dn}T(?:${r})$`);
}
var _n = /^[\s\S]{0,}$/, vn = /^-?\d+$/, yn = /^-?\d+(?:\.\d+)?$/, bn = /^(?:true|false)$/i, xn = /^[^A-Z]*$/, Sn = /^[^a-z]*$/, Cn = /*@__PURE__*/ C("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), wn = (e) => {
	let t = e.value;
	return !se(t) && t.length !== void 0;
}, Tn = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, En = /*@__PURE__*/ C("$ZodCheckLessThan", (e, t) => {
	Cn.init(e, t);
	let n = Tn[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: Tn[typeof r.value] ?? n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Dn = /*@__PURE__*/ C("$ZodCheckGreaterThan", (e, t) => {
	Cn.init(e, t);
	let n = Tn[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: Tn[typeof r.value] ?? n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), On = /*@__PURE__*/ C("$ZodCheckMultipleOf", (e, t) => {
	Cn.init(e, t), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? t.value !== BigInt(0) && n.value % t.value === BigInt(0) : ce(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), kn = /*@__PURE__*/ C("$ZodCheckNumberFormat", (e, t) => {
	Cn.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = De[t.format];
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
}), An = /*@__PURE__*/ C("$ZodCheckMaxLength", (e, t) => {
	var n;
	Cn.init(e, t), (n = e._zod.def).when ?? (n.when = wn), e._zod.check = (n) => {
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
}), jn = /*@__PURE__*/ C("$ZodCheckMinLength", (e, t) => {
	var n;
	Cn.init(e, t), (n = e._zod.def).when ?? (n.when = wn), e._zod.check = (n) => {
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
}), Mn = /*@__PURE__*/ C("$ZodCheckLengthEquals", (e, t) => {
	var n;
	Cn.init(e, t), (n = e._zod.def).when ?? (n.when = wn), e._zod.check = (n) => {
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
}), Nn = /*@__PURE__*/ C("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	Cn.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
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
}), Pn = /*@__PURE__*/ C("$ZodCheckRegex", (e, t) => {
	Nn.init(e, t), e._zod.check = (n) => {
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
}), Fn = /*@__PURE__*/ C("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= xn, Nn.init(e, t);
}), In = /*@__PURE__*/ C("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= Sn, Nn.init(e, t);
}), Ln = /*@__PURE__*/ C("$ZodCheckIncludes", (e, t) => {
	Cn.init(e, t);
	let n = Ce(t.includes);
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
}), Rn = /*@__PURE__*/ C("$ZodCheckStartsWith", (e, t) => {
	Cn.init(e, t);
	let n = RegExp(`^${Ce(t.prefix)}.*`);
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
}), zn = /*@__PURE__*/ C("$ZodCheckEndsWith", (e, t) => {
	Cn.init(e, t);
	let n = RegExp(`.*${Ce(t.suffix)}$`);
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
}), Bn = /*@__PURE__*/ C("$ZodCheckOverwrite", (e, t) => {
	Cn.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), Vn = class {
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
}, Hn = {
	major: 4,
	minor: 6,
	patch: 5
}, w = /*@__PURE__*/ C("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Hn;
	let r = e._zod.def.checks, i = e._zod.traits.has("$ZodCheck") ? [e, ...r ?? []] : r?.length ? [...r] : [];
	for (let t of i) for (let n of t._zod.onattach) n(e);
	if (i.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (t, n, r) => {
			if (t.memo) return t;
			let i = x(t), a;
			for (let o of n) {
				if (o._zod.def.when) {
					if (Re(t) || !o._zod.def.when(t)) continue;
				} else if (i) continue;
				let n = t.issues.length, s = o._zod.check(t);
				if (s instanceof Promise && r?.async === !1) throw new ut();
				if (a || s instanceof Promise) a = (a ?? Promise.resolve()).then(async () => {
					await s, t.issues.length !== n && (Ve(t.issues, n, e), i ||= x(t, n));
				});
				else {
					if (t.issues.length === n) continue;
					Ve(t.issues, n, e), i ||= x(t, n);
				}
			}
			return a ? a.then(() => t) : t;
		}, n = (n, r, a) => {
			if (x(n)) return n.aborted = !0, n;
			let o = t(r, i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new ut();
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
				if (a.async === !1) throw new ut();
				return o.then((e) => t(e, i, a));
			}
			return t(o, i, a);
		};
	}
}, {
	get "~standard"() {
		return Xe(this, "~standard", Gn(this));
	},
	set "~standard"(e) {
		Ye(this, "~standard", e);
	}
}), Un = (e, t) => e.issues.length ? { issues: e.issues.map((e) => He(e, t, pt())) } : { value: e.value };
async function Wn(e, t) {
	let n = { async: !0 };
	return Un(await e._zod.run({
		value: t,
		issues: []
	}, n), n);
}
function Gn(e) {
	return {
		validate: (t) => {
			let n = { async: !1 };
			try {
				let r = e._zod.run({
					value: t,
					issues: []
				}, n);
				if (!(r instanceof Promise)) return Un(r, n);
			} catch {}
			return Wn(e, t);
		},
		vendor: "zod",
		version: 1
	};
}
var Kn = /*@__PURE__*/ C("$ZodString", (e, t) => {
	w.init(e, t), e._zod.pattern = t.pattern ?? _n, e._zod.parse = (n, r) => {
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
}), T = /*@__PURE__*/ C("$ZodStringFormat", (e, t) => {
	Nn.init(e, t), Kn.init(e, t);
}), qn = /*@__PURE__*/ C("$ZodGUID", (e, t) => {
	t.pattern ??= Zt, T.init(e, t);
}), Jn = /*@__PURE__*/ C("$ZodUUID", (e, t) => {
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
		t.pattern ??= Qt(e);
	} else t.pattern ??= Qt();
	T.init(e, t);
}), Yn = /*@__PURE__*/ C("$ZodEmail", (e, t) => {
	t.pattern ??= $t, T.init(e, t);
});
function Xn(e) {
	try {
		return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
	} catch {
		return !1;
	}
}
function Zn(e, t) {
	return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? Xn(e) || 2 : Qn(e, t);
}
function Qn(e, t) {
	if (!t.normalize && t.protocol?.source === ln.source && !/^https?:\/\//i.test(e)) return 1;
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
var $n = /[\t\n\r]/g;
function er(e) {
	return e.replace($n, "");
}
function tr(e, t) {
	return t.lastIndex = 0, t.test(e.hostname);
}
function nr(e, t) {
	return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
var rr = /*@__PURE__*/ C("$ZodURL", (e, t) => {
	T.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim(), i = Zn(r, t);
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
				n.value = er(r);
				return;
			}
			t.hostname && !tr(i, t.hostname) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), t.protocol && !nr(i, t.protocol) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), n.value = t.normalize ? i.href : er(r);
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
}), ir = /*@__PURE__*/ C("$ZodEmoji", (e, t) => {
	t.pattern ??= tn(), T.init(e, t);
}), ar = /*@__PURE__*/ C("$ZodNanoID", (e, t) => {
	if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1)) throw Error(`Invalid nanoid length: ${t.length}`);
	t.pattern ??= t.length === void 0 ? Jt : Yt(t.length), T.init(e, t);
}), or = /*@__PURE__*/ C("$ZodCUID", (e, t) => {
	t.pattern ??= Ut, T.init(e, t);
}), sr = /*@__PURE__*/ C("$ZodCUID2", (e, t) => {
	t.pattern ??= Wt, T.init(e, t);
}), cr = /*@__PURE__*/ C("$ZodULID", (e, t) => {
	t.pattern ??= Gt, T.init(e, t);
}), lr = /*@__PURE__*/ C("$ZodXID", (e, t) => {
	t.pattern ??= Kt, T.init(e, t);
}), ur = /*@__PURE__*/ C("$ZodKSUID", (e, t) => {
	t.pattern ??= qt, T.init(e, t);
}), dr = /*@__PURE__*/ C("$ZodISODateTime", (e, t) => {
	t.pattern ??= gn(t), T.init(e, t);
}), fr = /*@__PURE__*/ C("$ZodISODate", (e, t) => {
	t.pattern ??= pn, T.init(e, t);
}), pr = /*@__PURE__*/ C("$ZodISOTime", (e, t) => {
	t.pattern ??= hn(t), T.init(e, t);
}), mr = /*@__PURE__*/ C("$ZodISODuration", (e, t) => {
	t.pattern ??= Xt, T.init(e, t);
}), hr = /*@__PURE__*/ C("$ZodIPv4", (e, t) => {
	t.pattern ??= nn, T.init(e, t);
}), gr = /^[0-9a-fA-F:.]+$/;
function _r(e) {
	return gr.test(e) ? Xn(`http://[${e}]`) : !1;
}
var vr = /*@__PURE__*/ C("$ZodIPv6", (e, t) => {
	t.pattern ??= rn, T.init(e, t), e._zod.check = (n) => {
		_r(n.value) || n.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), yr = /*@__PURE__*/ C("$ZodCIDRv4", (e, t) => {
	t.pattern ??= an, T.init(e, t);
});
function br(e) {
	let t = e.split("/");
	if (t.length !== 2) return !1;
	let [n, r] = t;
	if (!r) return !1;
	let i = Number(r);
	return `${i}` !== r || i < 0 || i > 128 ? !1 : _r(n);
}
var xr = /*@__PURE__*/ C("$ZodCIDRv6", (e, t) => {
	t.pattern ??= on, T.init(e, t), e._zod.check = (n) => {
		br(n.value) || n.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function Sr(e) {
	if (e === "") return !0;
	if (/\s/.test(e) || e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var Cr = /^[0-9a-zA-Z+/]*={0,2}$/, wr = /*@__PURE__*/ C("$ZodBase64", (e, t) => {
	t.pattern ??= Cr, T.init(e, t), e._zod.check = (n) => {
		Sr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Tr = /^[A-Za-z0-9_-]*$/;
function Er(e) {
	if (!Tr.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return Sr(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var Dr = /*@__PURE__*/ C("$ZodBase64URL", (e, t) => {
	t.pattern ??= Tr, T.init(e, t), e._zod.check = (n) => {
		Er(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Or = /*@__PURE__*/ C("$ZodE164", (e, t) => {
	t.pattern ??= un, T.init(e, t);
});
function kr(e, t = null) {
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
var Ar = /*@__PURE__*/ C("$ZodJWT", (e, t) => {
	T.init(e, t), e._zod.check = (n) => {
		kr(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), jr = /*@__PURE__*/ C("$ZodNumber", (e, t) => {
	w.init(e, t), e._zod.pattern = yn, e._zod.parse = (n, r) => {
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
}), Mr = /*@__PURE__*/ C("$ZodNumberFormat", (e, t) => {
	kn.init(e, t), jr.init(e, t);
}), Nr = /*@__PURE__*/ C("$ZodBoolean", (e, t) => {
	w.init(e, t), e._zod.pattern = bn, e._zod.parse = (n, r) => {
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
}), Pr = /*@__PURE__*/ C("$ZodUnknown", (e, t) => {
	w.init(e, t), e._zod.parse = (e) => e;
}), Fr = /*@__PURE__*/ C("$ZodNever", (e, t) => {
	w.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function Ir(e, t, n) {
	e.issues.length && t.issues.push(...ze(n, e.issues)), t.value[n] = e.value;
}
var Lr = /*@__PURE__*/ C("$ZodArray", (e, t) => {
	w.init(e, t);
	let n = ft.memoizer;
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
			if (c instanceof Promise) o.push(c.then((t) => Ir(t, r, e)));
			else if (Ir(c, r, e), s && c.issues.length !== 0 && x(c)) break;
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	};
});
function Rr(e, t, n, r, i, a) {
	let o = n in r, s = a === "optional";
	if (o || !s || i !== "optional") {
		if (e.issues.length) {
			if (i !== void 0 && s && !o) return;
			t.issues.push(...ze(n, e.issues));
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
var zr = [];
function Br(e) {
	let t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : zr, i = r.length ? [...t, ...r] : t;
	for (let t of i) if (!e.shape?.[t]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${String(t)}": expected a Zod schema`);
	let a = Ee(e.shape);
	return {
		...e,
		allKeys: i,
		symbolKeys: r,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(a)
	};
}
function Vr(e, t, n, r, i, a, o) {
	let s = [], c = i.keySet, l = i.catchall._zod, u = l.def.type, d = l.optin, f = l.optout, p = 0;
	for (let i in t) {
		if (o && n.issues.length !== p) {
			if (x(n, p)) break;
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
		a instanceof Promise ? e.push(a.then((e) => Rr(e, n, i, t, d, f))) : Rr(a, n, i, t, d, f);
	}
	return s.length && n.issues.push({
		code: "unrecognized_keys",
		keys: s,
		input: t,
		inst: a,
		continue: !0
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var Hr = /*@__PURE__*/ C("$ZodObject", (e, t) => {
	w.init(e, t);
	let n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
	if (r) {
		let e = () => {
			let n = { ...r };
			return Object.defineProperty(t, "shape", { value: n }), e.raw = n, n;
		};
		e.raw = r, Object.defineProperty(t, "shape", { get: e });
	}
	let i = oe(() => Br(t));
	S(e, "propValues", (e) => {
		let t = e.def.shape, n = {};
		for (let e in t) {
			let r = t[e]._zod;
			if (r.values) {
				Object.prototype.hasOwnProperty.call(n, e) || le(n, e, /* @__PURE__ */ new Set());
				for (let t of r.values) n[e].add(t);
				r.optin !== void 0 && n[e].add(void 0);
			}
		}
		return n;
	});
	let a = ve, o = t.catchall, s, c = ft.memoizer;
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
				if (x(t, f)) break;
				f = t.issues.length;
			}
			if (e === "__proto__") continue;
			let i = u[e], a = i._zod.optin, o = i._zod.optout, s = i._zod.run({
				value: r[e],
				issues: []
			}, n);
			s instanceof Promise ? l.push(s.then((n) => Rr(n, t, e, r, a, o))) : Rr(s, t, e, r, a, o);
		}
		return o ? Vr(l, r, t, n, i.value, e, d === !0) : l.length ? Promise.all(l).then(() => t) : t;
	};
}), Ur = /*@__PURE__*/ C("$ZodObjectJIT", (e, t) => {
	Hr.init(e, t);
	let n = e._zod.parse, r = oe(() => Br(t)), i = ft.memoizer, a = (t) => {
		let n = r.value, a = n.symbolKeys, o = new Vn(["payload", "ctx"], {
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
			let n = l[e], r = typeof e == "symbol" ? `syms[${a.indexOf(e)}]` : he(e), i = `${r} in input`, u = t[e], d = u?._zod?.optin, f = d !== void 0, p = u?._zod?.optout === "optional";
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
	}, o, s = ve, c = !ft.jitless, l = c && ye.value, u = t.catchall, d;
	e._zod.parse = (i, f) => {
		d ??= r.value;
		let p = i.value;
		return s(p) ? c && l && f?.async === !1 && f.jitless !== !0 ? (o ||= a(t.shape), i = o(i, f), u ? Vr([], p, i, f, d, e, f?.abortEarly === !0) : i) : n(i, f) : (i.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), i);
	};
});
function Wr(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !x(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => He(e, r, pt())))
	}), t);
}
var Gr = /*@__PURE__*/ C("$ZodUnion", (e, t) => {
	w.init(e, t), S(e, "optin", (e) => e.def.options.some((e) => e._zod.optin === "defaulted") ? "defaulted" : e.def.options.some((e) => e._zod.optin !== void 0) ? "optional" : void 0), S(e, "optout", (e) => e.def.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), S(e, "values", (e) => {
		if (e.def.options.every((e) => e._zod.values)) return new Set(e.def.options.flatMap((e) => Array.from(e._zod.values)));
	}), S(e, "pattern", (e) => {
		if (e.def.options.every((e) => e._zod.pattern)) {
			let t = e.def.options.map((e) => e._zod.pattern);
			return RegExp(`^(${t.map((e) => _(e.source)).join("|")})$`);
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
		return a ? Promise.all(o).then((t) => Wr(t, r, e, i)) : Wr(o, r, e, i);
	};
}), Kr = /*@__PURE__*/ C("$ZodIntersection", (e, t) => {
	w.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => Jr(e, t, n)) : Jr(e, i, a);
	};
});
function qr(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (be(e) && be(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		Object.prototype.hasOwnProperty.call(i, "__proto__") && delete i.__proto__;
		for (let n of r) {
			if (n === "__proto__") continue;
			let r = qr(e[n], t[n]);
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
			let i = e[r], a = t[r], o = qr(i, a);
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
function Jr(e, t, n) {
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
	let c = qr(t.value, n.value);
	if (!c.valid) {
		if (x(e)) return e;
		throw Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
	}
	return e.value = c.data, e;
}
var Yr = /*@__PURE__*/ C("$ZodRecord", (e, t) => {
	w.init(e, t);
	let n = ft.memoizer;
	n?.attach(e), e._zod.parse = (r, i) => {
		let a = r.value;
		if (!be(a)) return r.issues.push({
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
						issues: s.issues.map((e) => He(e, i, pt())),
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
					e.issues.length && r.issues.push(...ze(n, e.issues)), r.value[l] = e.value;
				})) : (u.issues.length && r.issues.push(...ze(n, u.issues)), r.value[l] = u.value);
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
				if (typeof n == "string" && yn.test(n) && l.issues.length) {
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
						issues: l.issues.map((e) => He(e, i, pt())),
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
					e.issues.length && r.issues.push(...ze(n, e.issues)), r.value[u] = e.value;
				})) : (d.issues.length && r.issues.push(...ze(n, d.issues)), r.value[u] = d.value);
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
}), Xr = /*@__PURE__*/ C("$ZodEnum", (e, t) => {
	w.init(e, t);
	let n = ne(t.entries), r = new Set(n);
	e._zod.values = r, S(e, "pattern", (e) => {
		let t = ne(e.def.entries).filter((e) => Se.has(typeof e));
		return RegExp(t.length ? `^(${t.map((e) => Ce(e.toString())).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), Zr = /*@__PURE__*/ C("$ZodLiteral", (e, t) => {
	w.init(e, t);
	let n = new Set(t.values);
	e._zod.values = n, S(e, "pattern", (e) => {
		let t = e.def.values;
		return RegExp(t.length ? `^(${t.map((e) => typeof e == "string" ? Ce(e) : e ? Ce(e.toString()) : String(e)).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (r, i) => {
		let a = r.value;
		return n.has(a) || r.issues.push({
			code: "invalid_value",
			values: t.values,
			input: a,
			inst: e
		}), r;
	};
}), Qr = /*@__PURE__*/ C("$ZodTransform", (e, t) => {
	w.init(e, t), e._zod.optin = "optional", ft.memoizer?.guard(e), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new dt(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new ut();
		return n.value = i, n;
	};
});
function $r(e, t) {
	return e.value = t.issues.length ? void 0 : t.value, e;
}
var ei = /*@__PURE__*/ C("$ZodOptional", (e, t) => {
	w.init(e, t), S(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", S(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? /* @__PURE__ */ new Set([...t, void 0]) : void 0;
	}), S(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${_(t.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (e.value === void 0) {
			if (t.innerType._zod.optin !== "defaulted") return e;
			let r = t.innerType._zod.run({
				value: e.value,
				issues: []
			}, n);
			return r instanceof Promise ? r.then((t) => $r(e, t)) : $r(e, r);
		}
		return t.innerType._zod.run(e, n);
	};
}), ti = /*@__PURE__*/ C("$ZodExactOptional", (e, t) => {
	ei.init(e, t), S(e, "values", (e) => e.def.innerType._zod.values), S(e, "pattern", (e) => e.def.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), ni = /*@__PURE__*/ C("$ZodNullable", (e, t) => {
	w.init(e, t), S(e, "optin", (e) => e.def.innerType._zod.optin), S(e, "optout", (e) => e.def.innerType._zod.optout), S(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${_(t.source)}|null)$`) : void 0;
	}), S(e, "values", (e) => e.def.innerType._zod.values ? /* @__PURE__ */ new Set([...e.def.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), ri = /*@__PURE__*/ C("$ZodDefault", (e, t) => {
	w.init(e, t), e._zod.optin = "defaulted", S(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => ii(e, t)) : ii(r, t);
	};
});
function ii(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var ai = /*@__PURE__*/ C("$ZodPrefault", (e, t) => {
	w.init(e, t), e._zod.optin = "defaulted", S(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), oi = /*@__PURE__*/ C("$ZodNonOptional", (e, t) => {
	w.init(e, t), S(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? new Set([...t].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => si(t, e)) : si(i, e);
	};
});
function si(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
function ci(e, t, n, r) {
	return t.issues.length ? (e.value = n.catchValue({
		...t,
		value: e.value,
		error: { issues: t.issues.map((e) => He(e, r, pt())) },
		input: e.value
	}), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
var li = /*@__PURE__*/ C("$ZodCatch", (e, t) => {
	w.init(e, t), S(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), S(e, "optout", (e) => e.def.innerType._zod.optout), S(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run({
			value: e.value,
			issues: []
		}, n);
		return r instanceof Promise ? r.then((r) => ci(e, r, t, n)) : ci(e, r, t, n);
	};
}), ui = /*@__PURE__*/ C("$ZodPipe", (e, t) => {
	w.init(e, t), S(e, "values", (e) => e.def.in._zod.values), S(e, "optin", (e) => e.def.in._zod.optin), S(e, "optout", (e) => e.def.out._zod.optout), S(e, "propValues", (e) => e.def.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => di(e, t.in, n)) : di(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => di(e, t.out, n)) : di(r, t.out, n);
	};
});
function di(e, t, n) {
	return e.issues.some((e) => e.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues
	}, n);
}
var fi = /*@__PURE__*/ C("$ZodReadonly", (e, t) => {
	w.init(e, t), S(e, "propValues", (e) => e.def.innerType._zod.propValues), S(e, "values", (e) => e.def.innerType._zod.values), S(e, "optin", (e) => e.def.innerType?._zod?.optin), S(e, "optout", (e) => e.def.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(pi) : pi(r);
	};
});
function pi(e) {
	return e.memo || (e.value = Object.freeze(e.value)), e;
}
var mi = /*@__PURE__*/ C("$ZodCustom", (e, t) => {
	Cn.init(e, t), w.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => hi(t, n, r, e));
		hi(i, n, r, e);
	};
});
function hi(e, t, n, r) {
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
var gi = class extends Error {
	constructor() {
		super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
	}
}, _i = "~memo", vi = [];
function yi(e) {
	return typeof e == "object" && !!e;
}
function bi(e) {
	return e.map((e) => e.path ? {
		...e,
		path: e.path.slice()
	} : { ...e });
}
var xi = /*@__PURE__*/ new WeakMap(), Si = 0, Ci = 1, wi = 2;
function Ti(e, t, n) {
	let r = xi.get(e);
	if (r !== void 0) return r ? wi : Si;
	if (t.has(e)) return wi;
	t.add(e);
	let i = Si, a = (e) => {
		if (i !== wi && e?._zod) {
			let r = Ti(e, t, n);
			r > i && (i = r);
		}
	}, o = (e, r) => {
		let i = Si;
		for (let a of Reflect.ownKeys(e)) {
			let o = Object.getOwnPropertyDescriptor(e, a);
			if (r && !o.enumerable) continue;
			let s = o.get ? Ci : o.value?._zod ? Ti(o.value, t, n) : Si;
			s > i && (i = s);
		}
		return i;
	}, s = (e) => {
		e > i && (i = e);
	}, c = e._zod.def;
	switch (c.type) {
		case "object": {
			let e = v(c);
			s(e ? o(e, !0) : Ci), a(c.catchall);
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
			s(r ? Ti(r, t, !1) : Ci);
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
	return t.delete(e), Ei(e, i);
}
function Ei(e, t) {
	return t !== Ci && xi.set(e, t === wi), t;
}
function Di(e, t) {
	let n = e.buckets.get(t);
	return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
var Oi, ki = [], Ai = {
	alloc(e, t, n) {
		let r = Oi;
		if (!r) return n;
		Oi = void 0;
		let i = {
			value: n,
			issues: null
		};
		return r.set(t.value, i), ki.push(i), n;
	},
	guard(e) {
		var t;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, n = (e, n) => {
				if (n.direction !== "backward" && Mi(n, e.value)) throw new gi();
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
					let i = Ti(e, /* @__PURE__ */ new Set(), !1);
					if (i === Si) return e._zod.parse = t, e._zod.run === o && (e._zod.run = t), t(s, c);
					i === wi || r ? n = !0 : r = !0;
				}
				let l = s.value;
				if (!yi(l)) return t(s, c);
				let u = c[_i];
				u || (u = {
					buckets: /* @__PURE__ */ new WeakMap(),
					backEdges: void 0
				}, c[_i] = u);
				let d;
				i === c ? d = a : (d = Di(u, e), i = c, a = d);
				let f = d.get(l);
				if (f) return s.value = f.value, f.issues ? f.issues.length && s.issues.push(...bi(f.issues)) : (s.memo = !0, u.backEdges ?? (u.backEdges = /* @__PURE__ */ new WeakSet()), u.backEdges.add(f.value)), s;
				Oi = d;
				let p = ki.length, m = t(s, c);
				Oi = void 0;
				let h = ki.length > p ? ki.pop() : void 0;
				return m instanceof Promise ? m.then((e) => (h && (h.issues = e.issues.length ? bi(e.issues) : vi), e)) : (h && (h.issues = m.issues.length ? bi(m.issues) : vi), m);
			};
			e._zod.parse = o, e._zod.run === t && (e._zod.run = o);
		});
	}
};
function ji() {
	return Ai;
}
function Mi(e, t) {
	let n = e[_i]?.backEdges;
	return n !== void 0 && yi(t) && n.has(t);
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/locales/en.js
var Ni = () => {
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
			case "invalid_value": return e.values.length === 1 ? `Invalid input: expected ${Te(e.values[0])}` : `Invalid option: expected one of ${re(e.values, "|")}`;
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
			case "unrecognized_keys": return `Unrecognized key${e.keys.length > 1 ? "s" : ""}: ${re(e.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${e.origin}`;
			case "invalid_union": return e.options && Array.isArray(e.options) && e.options.length > 0 ? `Invalid discriminator value. Expected ${e.options.map((e) => `'${e}'`).join(" | ")}` : e.inclusive === !1 ? "Invalid input: more than one option matched" : "Invalid input";
			case "invalid_element": return `Invalid value in ${e.origin}`;
			default: return "Invalid input";
		}
	};
};
function Pi() {
	return { localeError: Ni() };
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/registries.js
var Fi, Ii = class {
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
function Li() {
	return new Ii();
}
(Fi = globalThis).__zod_globalRegistry ?? (Fi.__zod_globalRegistry = Li());
var Ri = globalThis.__zod_globalRegistry;
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/api.js
function zi(e) {
	return e.checks &&= [...e.checks], e;
}
// @__NO_SIDE_EFFECTS__
function Bi(e, t) {
	return new e(zi({
		type: "string",
		...b(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function Vi(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Hi(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ui(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Wi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Gi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ki(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function qi(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ji(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Yi(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Xi(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Zi(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Qi(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function $i(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ea(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ta(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function na(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ra(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ia(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function aa(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function oa(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function sa(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ca(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function la(e, t) {
	return new e({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ua(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function da(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function fa(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function pa(e, t) {
	return new e(zi({
		type: "number",
		checks: [],
		...b(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function ma(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ha(e, t) {
	return new e({
		type: "boolean",
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ga(e) {
	return new e({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function _a(e, t) {
	return new e({
		type: "never",
		...b(t)
	});
}
// @__NO_SIDE_EFFECTS__
function va(e, t) {
	return new En({
		check: "less_than",
		...b(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function ya(e, t) {
	return new En({
		check: "less_than",
		...b(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function ba(e, t) {
	return new Dn({
		check: "greater_than",
		...b(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function xa(e, t) {
	return new Dn({
		check: "greater_than",
		...b(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Sa(e, t) {
	return new On({
		check: "multiple_of",
		...b(t),
		value: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ca(e, t) {
	return new An({
		check: "max_length",
		...b(t),
		maximum: e
	});
}
// @__NO_SIDE_EFFECTS__
function wa(e, t) {
	return new jn({
		check: "min_length",
		...b(t),
		minimum: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ta(e, t) {
	return new Mn({
		check: "length_equals",
		...b(t),
		length: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ea(e, t) {
	return new Pn({
		check: "string_format",
		format: "regex",
		...b(t),
		pattern: e
	});
}
// @__NO_SIDE_EFFECTS__
function Da(e) {
	return new Fn({
		check: "string_format",
		format: "lowercase",
		...b(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Oa(e) {
	return new In({
		check: "string_format",
		format: "uppercase",
		...b(e)
	});
}
// @__NO_SIDE_EFFECTS__
function ka(e, t) {
	return new Ln({
		check: "string_format",
		format: "includes",
		...b(t),
		includes: e
	});
}
// @__NO_SIDE_EFFECTS__
function Aa(e, t) {
	return new Rn({
		check: "string_format",
		format: "starts_with",
		...b(t),
		prefix: e
	});
}
// @__NO_SIDE_EFFECTS__
function ja(e, t) {
	return new zn({
		check: "string_format",
		format: "ends_with",
		...b(t),
		suffix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ma(e) {
	return new Bn({
		check: "overwrite",
		tx: e
	});
}
// @__NO_SIDE_EFFECTS__
function Na(e) {
	return /* @__PURE__ */ Ma((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Pa() {
	return /* @__PURE__ */ Ma((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Fa() {
	return /* @__PURE__ */ Ma((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Ia() {
	return /* @__PURE__ */ Ma((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function La() {
	return /* @__PURE__ */ Ma((e) => ge(e));
}
// @__NO_SIDE_EFFECTS__
function Ra(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...b(n)
	});
}
// @__NO_SIDE_EFFECTS__
function za(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...b(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Ba(e, t) {
	let n = /* @__PURE__ */ Va((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(qe(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", "input" in r || (r.input = t.value), r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(qe(r));
		}
	}, e(t.value, t)), t);
	return n;
}
// @__NO_SIDE_EFFECTS__
function Va(e, t) {
	let n = new Cn({
		check: "custom",
		...b(t)
	});
	return n._zod.check = e, n;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/to-json-schema.js
function Ha(e, ...t) {
	for (let n of t) for (let t of Reflect.ownKeys(n)) Object.prototype.propertyIsEnumerable.call(n, t) && le(e, t, n[t]);
	return e;
}
function Ua(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? Ri,
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
function Wa(e, t, n, r, i) {
	let a = typeof t.unrepresentable == "function" ? t.unrepresentable({
		zodSchema: e,
		path: r.path,
		message: i
	}) : t.unrepresentable;
	if (a === "any") return !1;
	if (a === void 0 || a === "throw") throw Error(i);
	return Object.assign(n, a), !0;
}
function Ga(e, t, n = {
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
		a && (o.ref ||= a, Ga(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && Ha(o.schema, c), t.io === "input" && to(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function Ka(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function qa(e, t) {
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
				ref: `${i("__shared")}#/${r}/${Ka(a)}`
			};
		}
		let i = `#/${r}/`;
		if (t[1] === n && !t[1].schema.id) return { ref: "#" };
		let a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + Ka(a)
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
function Ja(e) {
	let t = e.anyOf;
	if (!Array.isArray(t) || t.length === 0 || e.type !== void 0) return;
	let n = [];
	for (let e of t) {
		if (!e || typeof e != "object") return;
		Ja(e);
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
var Ya = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]), Xa = ["oneOf", "anyOf"];
function Za(e) {
	let t = e.additionalProperties;
	return t === void 0 || t === !1 || typeof t != "object" || !t ? null : Object.keys(t).length ? t : null;
}
function Qa(e) {
	let t = [];
	for (let n of e) {
		if (typeof n != "object" || n.type !== "object") return null;
		for (let e in n) if (!Ya.has(e)) return null;
		t.push(n);
	}
	let n = {}, r = /* @__PURE__ */ new Set();
	for (let e of t) {
		for (let r in e.properties) {
			if (Object.prototype.hasOwnProperty.call(n, r)) continue;
			let e = [];
			for (let n of t) {
				let t = n.properties?.[r] ?? Za(n);
				t != null && (e.some((e) => JSON.stringify(e) === JSON.stringify(t)) || e.push(t));
			}
			le(n, r, e.length === 1 ? e[0] : Qa(e) ?? { allOf: e });
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
			let t = Za(n);
			t && !e.some((e) => JSON.stringify(e) === JSON.stringify(t)) && e.push(t);
		}
		e.length === 1 ? i.additionalProperties = e[0] : e.length > 1 && (i.additionalProperties = { allOf: e });
	}
	return i;
}
function $a(e) {
	let t = e.allOf;
	if (!Array.isArray(t) || t.length < 2) return;
	for (let t of Ya) if (t in e) return;
	let n = t.filter((e) => Xa.some((t) => Array.isArray(e[t]))), r = null;
	if (!n.length) r = Qa(t);
	else {
		let e = n[0], i = Xa.find((t) => Array.isArray(e[t]));
		if (Object.keys(e).length !== 1) return;
		let a = t.filter((t) => t !== e), o = e[i].map((e) => Qa([...a, e]));
		if (o.some((e) => !e)) return;
		r = { [i]: o };
	}
	r && (delete e.allOf, Ha(e, r));
}
function eo(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : Ha(i, s), Ha(i, a), t._zod.parent === o) for (let e in i) e !== "$ref" && e !== "allOf" && (e in a || delete i[e]);
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
		if (e.target !== "openapi-3.0") for (let t of e.seen.entries()) Ja(t[1].def ?? t[1].schema);
		for (let t of e.deferred) t();
		if (e.intersections.length) {
			let t = /* @__PURE__ */ new Map();
			for (let n of e.seen.values()) for (let e of [n.schema, n.def]) {
				let n = e?.allOf;
				if (!Array.isArray(n)) continue;
				let r = t.get(n);
				r ? r.push(e) : t.set(n, [e]);
			}
			for (let n of e.intersections) for (let e of t.get(n) ?? []) $a(e);
		}
	}
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	Ha(i, n.defId ? n.schema : n.def ?? n.schema);
	let a = e.metadataRegistry.get(t)?.id;
	a !== void 0 && i.id === a && delete i.id;
	let o = e.external?.defs ?? {};
	if (!e.external || e.sharedEmitDoneFor !== e.external) for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (e.def.id === e.defId && delete e.def.id, le(o, e.defId, e.def));
	}
	e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(o).length > 0 && (e.target === "draft-2020-12" ? i.$defs = o : i.definitions = o);
	try {
		let n = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: ro(t, "input", e.processors),
					output: ro(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function to(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return to(r.element, n);
	if (r.type === "set") return to(r.valueType, n);
	if (r.type === "lazy") return to(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch") return to(r.innerType, n);
	if (r.type === "intersection") return to(r.left, n) || to(r.right, n);
	if (r.type === "record" || r.type === "map") return to(r.keyType, n) || to(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : to(r.in, n) || to(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (to(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (to(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (to(e, n)) return !0;
		return !!(r.rest && to(r.rest, n));
	}
	return !1;
}
var no = (e, t = {}) => (n) => {
	let r = Ua({
		...n,
		processors: t
	});
	return Ga(e, r), qa(r, e), eo(r, e);
}, ro = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = Ua({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return Ga(e, o), qa(o, e), eo(o, e);
}, io = (e, t, n) => {
	(e[t] === void 0 || n > e[t]) && (e[t] = n);
}, ao = (e, t, n) => {
	(e[t] === void 0 || n < e[t]) && (e[t] = n);
}, oo = (e, t) => {
	io(e, "minimum", t), ao(e, "maximum", t);
}, so = (e, t) => {
	e.multipleOf ??= [], e.multipleOf.includes(t) || e.multipleOf.push(t);
}, co = (e, t) => {
	e.patterns ??= /* @__PURE__ */ new Set(), e.patterns.add(t);
}, lo = (e, t) => {
	e.mime = e.mime ? e.mime.filter((e) => t.includes(e)) : [...t];
}, uo = (e, t) => {
	e.format = t, t.includes("int") && (e.isInt = !0);
}, fo = (e, t) => io(e, "minimum", t.minimum), po = (e, t) => ao(e, "maximum", t.maximum), mo = (e) => (t, n) => {
	uo(t, n.format);
	let [r, i] = e[n.format];
	io(t, "minimum", r), ao(t, "maximum", i);
}, ho = {
	greater_than: (e, t) => io(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
	less_than: (e, t) => ao(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
	multiple_of: (e, t) => so(e, t.value),
	number_format: mo(De),
	bigint_format: mo(Oe),
	min_length: fo,
	max_length: po,
	length_equals: (e, t) => oo(e, t.length),
	min_size: fo,
	max_size: po,
	size_equals: (e, t) => oo(e, t.size),
	string_format: (e, t) => {
		uo(e, t.format), t.pattern && co(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
	},
	mime_type: (e, t) => lo(e, t.mime)
};
function go(e) {
	let t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
	for (let e of r) ho[e._zod.def.check]?.(t, e._zod.def);
	let i = e._zod.bag;
	i.minimum !== void 0 && io(t, "minimum", i.minimum), i.exclusiveMinimum !== void 0 && io(t, "exclusiveMinimum", i.exclusiveMinimum), i.maximum !== void 0 && ao(t, "maximum", i.maximum), i.exclusiveMaximum !== void 0 && ao(t, "exclusiveMaximum", i.exclusiveMaximum), i.multipleOf !== void 0 && so(t, i.multipleOf), i.format !== void 0 && (t.format ??= i.format, i.format.includes("int") && (t.isInt = !0)), i.mime && lo(t, i.mime);
	for (let e of i.patterns ?? []) co(t, e);
	return t;
}
var _o = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, vo = /* @__PURE__ */ new Map([[Cr, sn], [Tr, cn]]), yo = (e) => vo.get(e) ?? e, bo = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l, laxFormat: u } = go(e);
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = _o[s] ?? s, i.format === "" && delete i.format, (s === "time" || u) && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c].map(yo);
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, xo = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, multipleOf: s, exclusiveMaximum: c, exclusiveMinimum: l, isInt: u } = go(e);
	i.type = u ? "integer" : "number";
	let d = typeof l == "number" && l >= (a ?? -Infinity), f = typeof c == "number" && c <= (o ?? Infinity), p = t.target === "draft-04" || t.target === "openapi-3.0";
	if (d ? p ? (i.minimum = l, i.exclusiveMinimum = !0) : i.exclusiveMinimum = l : typeof a == "number" && (i.minimum = a), f ? p ? (i.maximum = c, i.exclusiveMaximum = !0) : i.exclusiveMaximum = c : typeof o == "number" && (i.maximum = o), s) {
		let n = /* @__PURE__ */ new Set();
		for (let a of s) Number.isFinite(a) && a !== 0 ? n.add(Math.abs(a)) : Wa(e, t, i, r, `A multipleOf divisor of ${a} cannot be represented in JSON Schema`);
		let [a, ...o] = n;
		a !== void 0 && (i.multipleOf = a), o.length && (i.allOf = [...i.allOf ?? [], ...o.map((e) => ({ multipleOf: e }))]);
	}
}, So = (e, t, n, r) => {
	n.type = "boolean";
}, Co = (e, t, n, r) => {
	n.not = {};
}, wo = (e, t, n, r) => {
	let i = e._zod.def, a = ne(i.entries);
	if (a.length === 0) {
		n.not = {};
		return;
	}
	a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a;
}, To = (e, t, n, r) => {
	let i = e._zod.def;
	if (i.values.length === 0) {
		n.not = {};
		return;
	}
	let a = [];
	for (let o of i.values) if (o === void 0) {
		if (Wa(e, t, n, r, "Literal `undefined` cannot be represented in JSON Schema")) return;
	} else if (typeof o == "bigint") {
		if (Wa(e, t, n, r, "BigInt literals cannot be represented in JSON Schema")) return;
		a.push(Number(o));
	} else a.push(o);
	if (a.length !== 0) {
		if (a.length === 1) {
			let e = a[0];
			n.type = e === null ? "null" : typeof e, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [e] : n.const = e;
		} else a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), a.every((e) => typeof e == "boolean") && (n.type = "boolean"), a.every((e) => e === null) && (n.type = "null"), n.enum = a;
	}
}, Eo = (e, t, n, r) => {
	Wa(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, Do = (e, t, n, r) => {
	Wa(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, Oo = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = go(e);
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = Ga(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
};
function ko(e) {
	let t = e._zod.def;
	return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? ko(t.out) : t.type === "catch" ? ko(t.innerType) : e._zod.optin;
}
var Ao = (e, t, n, r) => {
	let i = n, a = e._zod.def, o = a.shape;
	if (Object.getOwnPropertySymbols(o).length && Wa(e, t, i, r, "Symbol keys cannot be represented in JSON Schema")) return;
	i.type = "object", i.properties = {};
	for (let e in o) le(i.properties, e, Ga(o[e], t, {
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
		(t.io === "input" ? ko(n) === void 0 : n._zod.optout === void 0) && s.push(e);
	}
	s.length > 0 && (i.required = s), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = Ga(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, jo = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => Ga(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, Mo = (e, t, n, r) => {
	let i = e._zod.def, a = Ga(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = Ga(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1, c = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
	n.allOf = c, t.intersections.push(c);
};
function No(e, t, n) {
	if (t.$ref) {
		if (n.has(t)) return t;
		n.add(t);
		let r = e.get(t)?.def;
		if (!r) return t;
		let i = No(e, r, n);
		return i === r ? t : i;
	}
	for (let r of ["anyOf", "oneOf"]) {
		let i = t[r];
		if (!Array.isArray(i)) continue;
		let a = i.map((t) => No(e, t, n));
		a.some((e, t) => e !== i[t]) && (t = {
			...t,
			[r]: a
		});
	}
	let r = Array.isArray(t.type) ? t.type : [t.type], i = !r.includes("string") && r.some((e) => e === "number" || e === "integer"), a = t.enum ?? (t.const === void 0 ? void 0 : [t.const]);
	if (!i && !a?.some((e) => typeof e == "number")) return t;
	let { minimum: o, maximum: s, exclusiveMinimum: c, exclusiveMaximum: l, multipleOf: u, format: d, id: f, ...p } = t;
	return p.enum ? p.enum = p.enum.map((e) => typeof e == "number" ? String(e) : e) : typeof p.const == "number" && (p.const = String(p.const)), i ? (p.type = "string", a || (p.pattern = (r.includes("number") ? yn : vn).source), p) : p;
}
var Po = /* @__PURE__ */ new WeakMap();
function Fo(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.seen.values()) n.def && !t.has(n.schema) && t.set(n.schema, n);
	let n = /* @__PURE__ */ new Map();
	for (let r of Po.get(e) ?? []) {
		let i = e.seen.get(r), a = (i?.def ?? i?.schema)?.propertyNames;
		if (!a || a === !0 || n.has(a)) continue;
		let o = No(t, a, /* @__PURE__ */ new Set());
		o !== a && n.set(a, o);
	}
	if (n.size) for (let t of e.seen.values()) for (let e of [t.schema, t.def]) {
		let t = e && n.get(e.propertyNames);
		t && (e.propertyNames = t);
	}
}
var Io = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object";
	let o = a.keyType, s = go(o).patterns;
	if (a.mode === "loose" && s && s.size > 0) {
		let e = Ga(a.valueType, t, {
			...r,
			path: [
				...r.path,
				"patternProperties",
				"*"
			]
		});
		i.patternProperties = {};
		for (let t of s) le(i.patternProperties, yo(t).source, e);
	} else {
		if (t.target === "draft-07" || t.target === "draft-2020-12") {
			i.propertyNames = Ga(a.keyType, t, {
				...r,
				path: [...r.path, "propertyNames"]
			});
			let n = Po.get(t);
			n || (n = [], Po.set(t, n), t.deferred.push(() => Fo(t))), n.push(e);
		}
		i.additionalProperties = Ga(a.valueType, t, {
			...r,
			path: [...r.path, "additionalProperties"]
		});
	}
	let c = o._zod.values, l = t.io === "input" && ko(a.valueType) !== void 0;
	if (c && !a.partial && !l) {
		let e = [...c].filter((e) => typeof e == "string" || typeof e == "number");
		e.length > 0 && (i.required = e.map(String));
	}
}, Lo = (e, t, n, r) => {
	let i = e._zod.def, a = Ga(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, Ro = (e, t, n, r) => {
	let i = e._zod.def;
	Ga(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, zo = Symbol();
function Bo(e, t, n, r, i) {
	let a = !1, o = JSON.stringify(e, (e, t) => typeof t == "bigint" ? (a = !0, null) : t);
	return a ? (Wa(t, n, r, i, "BigInt defaults cannot be represented in JSON Schema"), zo) : JSON.parse(o);
}
var Vo = (e, t, n, r) => {
	let i = e._zod.def;
	Ga(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o = Bo(i.defaultValue, e, t, n, r);
	o !== zo && (n.default = o);
}, Ho = (e, t, n, r) => {
	let i = e._zod.def;
	Ga(i.innerType, t, r);
	let a = t.seen.get(e);
	if (a.ref = i.innerType, t.io !== "input") return;
	let o = Bo(i.defaultValue, e, t, n, r);
	o !== zo && (n._prefault = o);
}, Uo = (e, t, n, r) => {
	let i = e._zod.def;
	Ga(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		Wa(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	n.default = o;
}, Wo = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	Ga(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, Go = (e, t, n, r) => {
	let i = e._zod.def;
	Ga(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, Ko = (e, t, n, r) => {
	let i = e._zod.def;
	Ga(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, qo = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function Jo(e, t, n) {
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
var Yo = /*@__PURE__*/ C("ZodError", (e, t) => {
	bt.init(e, t), e.name = "ZodError";
	let n = Object.getPrototypeOf(e);
	qo.has(n) || (qo.add(n), Jo(n, "format", (e) => (t) => Ct(e, t)), Jo(n, "flatten", (e) => (t) => St(e, t)), Jo(n, "addIssue", (e) => (t) => {
		e.issues.push(t), e.message = JSON.stringify(e.issues, ie, 2);
	}), Jo(n, "addIssues", (e) => (t) => {
		e.issues.push(...t), e.message = JSON.stringify(e.issues, ie, 2);
	}), Object.defineProperty(n, "isEmpty", {
		configurable: !0,
		enumerable: !1,
		get() {
			return this.issues.length === 0;
		}
	}));
}, void 0, { Parent: Error }), Xo = /* @__PURE__ */ Tt(Yo), Zo = /* @__PURE__ */ Et(Yo), Qo = /* @__PURE__ */ Dt(Yo), $o = /* @__PURE__ */ kt(Yo), es = /* @__PURE__ */ Ft(Yo), ts = /* @__PURE__ */ It(Yo), ns = /* @__PURE__ */ Lt(Yo), rs = /* @__PURE__ */ Rt(Yo), is = /* @__PURE__ */ zt(Yo), as = /* @__PURE__ */ Bt(Yo), os = /* @__PURE__ */ Vt(Yo), ss = /* @__PURE__ */ Ht(Yo);
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/schemas.js
function cs() {
	ft.localeError || pt(Pi());
}
function ls() {
	ft.memoizer || pt({ memoizer: ji() });
}
var E = /*@__PURE__*/ C("ZodType", (e, t) => (cs(), w.init(e, t), e.def = t, e.type = t.type, e), {
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
		return we(this, e, t);
	},
	brand() {
		return this;
	},
	register(e, t) {
		return e.add(this, t), this;
	},
	refine(e, t) {
		return this.check(Sc(e, t));
	},
	superRefine(e, t) {
		return this.check(Cc(e, t));
	},
	overwrite(e) {
		return this.check(/* @__PURE__ */ Ma(e));
	},
	optional() {
		return ic(this);
	},
	exactOptional() {
		return oc(this);
	},
	nullable() {
		return cc(this);
	},
	nullish() {
		return ic(cc(this));
	},
	nonoptional(e) {
		return mc(this, e);
	},
	array() {
		return A(this);
	},
	or(e) {
		return qs([this, e]);
	},
	and(e) {
		return Ys(this, e);
	},
	transform(e) {
		return vc(this, nc(e));
	},
	default(e) {
		return uc(this, e);
	},
	prefault(e) {
		return fc(this, e);
	},
	catch(e) {
		return gc(this, e);
	},
	pipe(e) {
		return vc(this, e);
	},
	readonly() {
		return bc(this);
	},
	describe(e) {
		let t = this.clone();
		return Ri.add(t, { description: e }), t;
	},
	meta(...e) {
		if (e.length === 0) return Ri.get(this);
		let t = this.clone();
		return Ri.add(t, e[0]), t;
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
		return Xe(this, "~standard", {
			...Gn(this),
			jsonSchema: {
				input: ro(this, "input"),
				output: ro(this, "output")
			}
		});
	},
	set "~standard"(e) {
		Ye(this, "~standard", e);
	},
	parse: function e(t, n) {
		return Xo(this, t, n, { callee: e });
	},
	parseAsync: async function e(t, n) {
		return await Zo(this, t, n, { callee: e });
	},
	safeParse(e, t) {
		return Qo(this, e, t);
	},
	async safeParseAsync(e, t) {
		return $o(this, e, t);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(e) {
		Ye(this, "spa", e);
	},
	validate(e, t) {
		return Mt(this, e, t);
	},
	validateAsync(e, t) {
		return Pt(this, e, t);
	},
	encode: function e(t, n) {
		return es(this, t, n, { callee: e });
	},
	decode: function e(t, n) {
		return ts(this, t, n, { callee: e });
	},
	encodeAsync: async function e(t, n) {
		return await ns(this, t, n, { callee: e });
	},
	decodeAsync: async function e(t, n) {
		return await rs(this, t, n, { callee: e });
	},
	safeEncode(e, t) {
		return is(this, e, t);
	},
	safeDecode(e, t) {
		return as(this, e, t);
	},
	async safeEncodeAsync(e, t) {
		return os(this, e, t);
	},
	async safeDecodeAsync(e, t) {
		return ss(this, e, t);
	},
	toJSONSchema(e) {
		return no(this, {})(e);
	},
	get description() {
		return Ri.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
}), us = /*@__PURE__*/ C("_ZodString", (e, t) => {
	Kn.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => bo(e, t, n, r);
}, /*@__PURE__*/ Ze({
	format: (e) => go(e).format ?? null,
	minLength: (e) => go(e).minimum ?? null,
	maxLength: (e) => go(e).maximum ?? null
}, {
	regex(...e) {
		return this.check(/* @__PURE__ */ Ea(...e));
	},
	includes(...e) {
		return this.check(/* @__PURE__ */ ka(...e));
	},
	startsWith(...e) {
		return this.check(/* @__PURE__ */ Aa(...e));
	},
	endsWith(...e) {
		return this.check(/* @__PURE__ */ ja(...e));
	},
	min(...e) {
		return this.check(/* @__PURE__ */ wa(...e));
	},
	max(...e) {
		return this.check(/* @__PURE__ */ Ca(...e));
	},
	length(...e) {
		return this.check(/* @__PURE__ */ Ta(...e));
	},
	nonempty(...e) {
		return this.check(/* @__PURE__ */ wa(1, ...e));
	},
	lowercase(e) {
		return this.check(/* @__PURE__ */ Da(e));
	},
	uppercase(e) {
		return this.check(/* @__PURE__ */ Oa(e));
	},
	trim() {
		return this.check(/* @__PURE__ */ Pa());
	},
	normalize(...e) {
		return this.check(/* @__PURE__ */ Na(...e));
	},
	toLowerCase() {
		return this.check(/* @__PURE__ */ Fa());
	},
	toUpperCase() {
		return this.check(/* @__PURE__ */ Ia());
	},
	slugify() {
		return this.check(/* @__PURE__ */ La());
	}
})), ds = /*@__PURE__*/ C("ZodString", (e, t) => {
	Kn.init(e, t), us.init(e, t);
}, {
	email(e) {
		return this.check(/* @__PURE__ */ Vi(gs, e));
	},
	url(e) {
		return this.check(/* @__PURE__ */ qi(ys, e));
	},
	jwt(e) {
		return this.check(/* @__PURE__ */ ca(Ps, e));
	},
	emoji(e) {
		return this.check(/* @__PURE__ */ Ji(bs, e));
	},
	guid(e) {
		return this.check(/* @__PURE__ */ Hi(_s, e));
	},
	uuid(e) {
		return this.check(/* @__PURE__ */ Ui(vs, e));
	},
	uuidv4(e) {
		return this.check(/* @__PURE__ */ Wi(vs, e));
	},
	uuidv6(e) {
		return this.check(/* @__PURE__ */ Gi(vs, e));
	},
	uuidv7(e) {
		return this.check(/* @__PURE__ */ Ki(vs, e));
	},
	nanoid(e) {
		return this.check(/* @__PURE__ */ Yi(xs, e));
	},
	cuid(e) {
		return this.check(/* @__PURE__ */ Xi(Ss, e));
	},
	cuid2(e) {
		return this.check(/* @__PURE__ */ Zi(Cs, e));
	},
	ulid(e) {
		return this.check(/* @__PURE__ */ Qi(ws, e));
	},
	base64(e) {
		return this.check(/* @__PURE__ */ aa(js, e));
	},
	base64url(e) {
		return this.check(/* @__PURE__ */ oa(Ms, e));
	},
	xid(e) {
		return this.check(/* @__PURE__ */ $i(Ts, e));
	},
	ksuid(e) {
		return this.check(/* @__PURE__ */ ea(Es, e));
	},
	ipv4(e) {
		return this.check(/* @__PURE__ */ ta(Ds, e));
	},
	ipv6(e) {
		return this.check(/* @__PURE__ */ na(Os, e));
	},
	cidrv4(e) {
		return this.check(/* @__PURE__ */ ra(ks, e));
	},
	cidrv6(e) {
		return this.check(/* @__PURE__ */ ia(As, e));
	},
	e164(e) {
		return this.check(/* @__PURE__ */ sa(Ns, e));
	},
	datetime(e) {
		return this.check(/* @__PURE__ */ la(fs, e));
	},
	date(e) {
		return this.check(/* @__PURE__ */ ua(ps, e));
	},
	time(e) {
		return this.check(/* @__PURE__ */ da(ms, e));
	},
	duration(e) {
		return this.check(/* @__PURE__ */ fa(hs, e));
	}
});
function D(e) {
	return /* @__PURE__ */ Bi(ds, e);
}
var O = /*@__PURE__*/ C("ZodStringFormat", (e, t) => {
	T.init(e, t), us.init(e, t);
}), fs = /*@__PURE__*/ C("ZodISODateTime", (e, t) => {
	dr.init(e, t), O.init(e, t);
}), ps = /*@__PURE__*/ C("ZodISODate", (e, t) => {
	fr.init(e, t), O.init(e, t);
}), ms = /*@__PURE__*/ C("ZodISOTime", (e, t) => {
	pr.init(e, t), O.init(e, t);
}), hs = /*@__PURE__*/ C("ZodISODuration", (e, t) => {
	mr.init(e, t), O.init(e, t);
}), gs = /*@__PURE__*/ C("ZodEmail", (e, t) => {
	Yn.init(e, t), O.init(e, t);
}), _s = /*@__PURE__*/ C("ZodGUID", (e, t) => {
	qn.init(e, t), O.init(e, t);
}), vs = /*@__PURE__*/ C("ZodUUID", (e, t) => {
	Jn.init(e, t), O.init(e, t);
}), ys = /*@__PURE__*/ C("ZodURL", (e, t) => {
	rr.init(e, t), O.init(e, t);
}), bs = /*@__PURE__*/ C("ZodEmoji", (e, t) => {
	ir.init(e, t), O.init(e, t);
}), xs = /*@__PURE__*/ C("ZodNanoID", (e, t) => {
	ar.init(e, t), O.init(e, t);
}), Ss = /*@__PURE__*/ C("ZodCUID", (e, t) => {
	or.init(e, t), O.init(e, t);
}), Cs = /*@__PURE__*/ C("ZodCUID2", (e, t) => {
	sr.init(e, t), O.init(e, t);
}), ws = /*@__PURE__*/ C("ZodULID", (e, t) => {
	cr.init(e, t), O.init(e, t);
}), Ts = /*@__PURE__*/ C("ZodXID", (e, t) => {
	lr.init(e, t), O.init(e, t);
}), Es = /*@__PURE__*/ C("ZodKSUID", (e, t) => {
	ur.init(e, t), O.init(e, t);
}), Ds = /*@__PURE__*/ C("ZodIPv4", (e, t) => {
	hr.init(e, t), O.init(e, t);
}), Os = /*@__PURE__*/ C("ZodIPv6", (e, t) => {
	vr.init(e, t), O.init(e, t);
}), ks = /*@__PURE__*/ C("ZodCIDRv4", (e, t) => {
	yr.init(e, t), O.init(e, t);
}), As = /*@__PURE__*/ C("ZodCIDRv6", (e, t) => {
	xr.init(e, t), O.init(e, t);
}), js = /*@__PURE__*/ C("ZodBase64", (e, t) => {
	wr.init(e, t), O.init(e, t);
}), Ms = /*@__PURE__*/ C("ZodBase64URL", (e, t) => {
	Dr.init(e, t), O.init(e, t);
}), Ns = /*@__PURE__*/ C("ZodE164", (e, t) => {
	Or.init(e, t), O.init(e, t);
}), Ps = /*@__PURE__*/ C("ZodJWT", (e, t) => {
	Ar.init(e, t), O.init(e, t);
}), Fs = /*@__PURE__*/ C("ZodNumber", (e, t) => {
	jr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => xo(e, t, n, r), e.isFinite = !0;
}, /*@__PURE__*/ Ze({
	minValue: (e) => {
		let { minimum: t, exclusiveMinimum: n } = go(e);
		return Math.max(t ?? -Infinity, n ?? -Infinity);
	},
	maxValue: (e) => {
		let { maximum: t, exclusiveMaximum: n } = go(e);
		return Math.min(t ?? Infinity, n ?? Infinity);
	},
	isInt: (e) => {
		let { isInt: t, multipleOf: n } = go(e);
		return !!t || !!n?.some(Number.isSafeInteger);
	},
	format: (e) => go(e).format ?? null
}, {
	gt(e, t) {
		return this.check(/* @__PURE__ */ ba(e, t));
	},
	gte(e, t) {
		return this.check(/* @__PURE__ */ xa(e, t));
	},
	min(e, t) {
		return this.check(/* @__PURE__ */ xa(e, t));
	},
	lt(e, t) {
		return this.check(/* @__PURE__ */ va(e, t));
	},
	lte(e, t) {
		return this.check(/* @__PURE__ */ ya(e, t));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ ya(e, t));
	},
	int(e) {
		return this.check(Ls(e));
	},
	safe(e) {
		return this.check(Ls(e));
	},
	positive(e) {
		return this.check(/* @__PURE__ */ ba(0, e));
	},
	nonnegative(e) {
		return this.check(/* @__PURE__ */ xa(0, e));
	},
	negative(e) {
		return this.check(/* @__PURE__ */ va(0, e));
	},
	nonpositive(e) {
		return this.check(/* @__PURE__ */ ya(0, e));
	},
	multipleOf(e, t) {
		return this.check(/* @__PURE__ */ Sa(e, t));
	},
	step(e, t) {
		return this.check(/* @__PURE__ */ Sa(e, t));
	},
	finite() {
		return this;
	}
}));
function k(e) {
	return /* @__PURE__ */ pa(Fs, e);
}
var Is = /*@__PURE__*/ C("ZodNumberFormat", (e, t) => {
	Mr.init(e, t), Fs.init(e, t);
});
function Ls(e) {
	return /* @__PURE__ */ ma(Is, e);
}
var Rs = /*@__PURE__*/ C("ZodBoolean", (e, t) => {
	Nr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => So(e, t, n, r);
});
function zs(e) {
	return /* @__PURE__ */ ha(Rs, e);
}
var Bs = /*@__PURE__*/ C("ZodUnknown", (e, t) => {
	Pr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function Vs() {
	return /* @__PURE__ */ ga(Bs);
}
var Hs = /*@__PURE__*/ C("ZodNever", (e, t) => {
	Fr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Co(e, t, n, r);
});
function Us(e) {
	return /* @__PURE__ */ _a(Hs, e);
}
var Ws = /*@__PURE__*/ C("ZodArray", (e, t) => {
	ls(), Lr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Oo(e, t, n, r), e.element = t.element;
}, {
	min(e, t) {
		return this.check(/* @__PURE__ */ wa(e, t));
	},
	nonempty(e) {
		return this.check(/* @__PURE__ */ wa(1, e));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ Ca(e, t));
	},
	length(e, t) {
		return this.check(/* @__PURE__ */ Ta(e, t));
	},
	unwrap() {
		return this.element;
	}
});
function A(e, t) {
	return /* @__PURE__ */ Ra(Ws, e, t);
}
var Gs = /*@__PURE__*/ C("ZodObject", (e, t) => {
	ls(), Ur.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ao(e, t, n, r), rt(e, "shape", (e) => e._zod.def.shape, !1);
}, {
	keyof() {
		return M(Object.keys(this._zod.def.shape));
	},
	catchall(e) {
		return this.clone(y(this._zod.def, { catchall: e }));
	},
	passthrough() {
		return this.clone(y(this._zod.def, { catchall: Vs() }));
	},
	loose() {
		return this.clone(y(this._zod.def, { catchall: Vs() }));
	},
	strict() {
		return this.clone(y(this._zod.def, { catchall: Us() }));
	},
	strip() {
		return this.clone(y(this._zod.def, { catchall: void 0 }));
	},
	extend(e) {
		return Me(this, e);
	},
	safeExtend(e) {
		return Pe(this, e);
	},
	merge(e) {
		return Fe(this, e);
	},
	pick(e) {
		return ke(this, e);
	},
	omit(e) {
		return je(this, e);
	},
	partial(...e) {
		return Ie(rc, this, e[0]);
	},
	exactPartial(...e) {
		return Ie(ac, this, e[0], "exactPartial");
	},
	required(...e) {
		return Le(pc, this, e[0]);
	}
});
function j(e, t) {
	return new Gs({
		type: "object",
		shape: e ?? {},
		...b(t)
	});
}
var Ks = /*@__PURE__*/ C("ZodUnion", (e, t) => {
	Gr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => jo(e, t, n, r), e.options = t.options;
});
function qs(e, t) {
	return new Ks({
		type: "union",
		options: e,
		...b(t)
	});
}
var Js = /*@__PURE__*/ C("ZodIntersection", (e, t) => {
	Kr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Mo(e, t, n, r);
});
function Ys(e, t) {
	return new Js({
		type: "intersection",
		left: e,
		right: t
	});
}
var Xs = /*@__PURE__*/ C("ZodRecord", (e, t) => {
	ls(), Yr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Io(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function Zs(e, t, n) {
	return !t || !t._zod ? new Xs({
		type: "record",
		keyType: D(),
		valueType: e,
		...b(t)
	}) : new Xs({
		type: "record",
		keyType: e,
		valueType: t,
		...b(n)
	});
}
var Qs = /*@__PURE__*/ C("ZodEnum", (e, t) => {
	Xr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => wo(e, t, n, r), e.enum = t.entries, e.options = [...e._zod.values];
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new Qs({
			...t,
			checks: [],
			...b(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new Qs({
			...t,
			checks: [],
			...b(r),
			entries: i
		});
	};
});
function M(e, t) {
	return new Qs({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...b(t)
	});
}
var $s = /*@__PURE__*/ C("ZodLiteral", (e, t) => {
	Zr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => To(e, t, n, r), e.values = new Set(t.values), Object.defineProperty(e, "value", { get() {
		if (t.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return t.values[0];
	} });
});
function ec(e, t) {
	return new $s({
		type: "literal",
		values: Array.isArray(e) ? e : [e],
		...b(t)
	});
}
var tc = /*@__PURE__*/ C("ZodTransform", (e, t) => {
	ls(), Qr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Do(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new dt(e.constructor.name);
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
function nc(e) {
	return new tc({
		type: "transform",
		transform: e
	});
}
var rc = /*@__PURE__*/ C("ZodOptional", (e, t) => {
	ei.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ko(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function ic(e) {
	return new rc({
		type: "optional",
		innerType: e
	});
}
var ac = /*@__PURE__*/ C("ZodExactOptional", (e, t) => {
	ti.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ko(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function oc(e) {
	return new ac({
		type: "optional",
		innerType: e
	});
}
var sc = /*@__PURE__*/ C("ZodNullable", (e, t) => {
	ni.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Lo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function cc(e) {
	return new sc({
		type: "nullable",
		innerType: e
	});
}
var lc = /*@__PURE__*/ C("ZodDefault", (e, t) => {
	ri.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Vo(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function uc(e, t) {
	return new lc({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : xe(t);
		}
	});
}
var dc = /*@__PURE__*/ C("ZodPrefault", (e, t) => {
	ai.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ho(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function fc(e, t) {
	return new dc({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : xe(t);
		}
	});
}
var pc = /*@__PURE__*/ C("ZodNonOptional", (e, t) => {
	oi.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ro(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function mc(e, t) {
	return new pc({
		type: "nonoptional",
		innerType: e,
		...b(t)
	});
}
var hc = /*@__PURE__*/ C("ZodCatch", (e, t) => {
	li.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Uo(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function gc(e, t) {
	return new hc({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : at(t)
	});
}
var _c = /*@__PURE__*/ C("ZodPipe", (e, t) => {
	ui.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Wo(e, t, n, r), e.in = t.in, e.out = t.out;
});
function vc(e, t) {
	return new _c({
		type: "pipe",
		in: e,
		out: t
	});
}
var yc = /*@__PURE__*/ C("ZodReadonly", (e, t) => {
	fi.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Go(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function bc(e) {
	return new yc({
		type: "readonly",
		innerType: e
	});
}
var xc = /*@__PURE__*/ C("ZodCustom", (e, t) => {
	mi.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Eo(e, t, n, r);
});
function Sc(e, t = {}) {
	return /* @__PURE__ */ za(xc, e, t);
}
function Cc(e, t) {
	return /* @__PURE__ */ Ba(e, t);
}
//#endregion
//#region node_modules/.pnpm/react@19.3.0/node_modules/react/cjs/react.production.js
var wc = /* @__PURE__ */ te(((e) => {
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
	}, ee = Object.assign, te = {};
	function ne(e, t, n) {
		this.props = e, this.context = t, this.refs = te, this.updater = n || g;
	}
	ne.prototype.isReactComponent = {}, ne.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, ne.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function re() {}
	re.prototype = ne.prototype;
	function ie(e, t, n) {
		this.props = e, this.context = t, this.refs = te, this.updater = n || g;
	}
	var ae = ie.prototype = new re();
	ae.constructor = ie, ee(ae, ne.prototype), ae.isPureReactComponent = !0;
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
	function y(e, r, i, a, o) {
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
				case d: return c = e._init, y(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + pe(e, 0) : a, oe(o) ? (i = "", c != null && (i = c.replace(fe, "$&/") + "/"), y(o, r, i, "", function(e) {
			return e;
		})) : o != null && (ue(o) && (o = v(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(fe, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (oe(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + pe(a, u), c += y(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + pe(a, u++), c += y(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return y(me(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function he(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return y(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function ge(e) {
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
	var _e = typeof reportError == "function" ? reportError : function(e) {
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
	function ve(e) {
		var t = _.T, n = {};
		n.types = t === null ? null : t.types, _.T = n;
		try {
			var r = e(), i = _.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(se, _e);
		} catch (e) {
			_e(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), _.T = t;
		}
	}
	function ye(e) {
		var t = _.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else ve(ye.bind(null, e));
	}
	var be = {
		map: he,
		forEach: function(e, t, n) {
			he(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return he(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return he(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!ue(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = be, e.Component = ne, e.Fragment = r, e.Profiler = a, e.PureComponent = ie, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = _, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return _.H.useMemoCache(e);
		}
	}, e.addTransitionType = ye, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = ee({}, e.props), i = e.key;
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
			_init: ge
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = ve, e.unstable_useCacheRefresh = function() {
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
})), Tc = /* @__PURE__ */ te(((e, t) => {
	process.env.NODE_ENV !== "production" && (function() {
		function n(e, t) {
			Object.defineProperty(a.prototype, e, { get: function() {
				console.warn("%s(...) is deprecated in plain JavaScript React classes. %s", t[0], t[1]);
			} });
		}
		function r(e) {
			return typeof e != "object" || !e ? null : (e = Ae && e[Ae] || e["@@iterator"], typeof e == "function" ? e : null);
		}
		function i(e, t) {
			e = (e = e.constructor) && (e.displayName || e.name) || "ReactClass";
			var n = e + "." + t;
			je[n] || (console.error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", t, e), je[n] = !0);
		}
		function a(e, t, n) {
			this.props = e, this.context = t, this.refs = Pe, this.updater = n || Me;
		}
		function o() {}
		function s(e, t, n) {
			this.props = e, this.context = t, this.refs = Pe, this.updater = n || Me;
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
			if (typeof e == "function") return e.$$typeof === Le ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case ye: return "Fragment";
				case xe: return "Profiler";
				case be: return "StrictMode";
				case b: return "Suspense";
				case Te: return "SuspenseList";
				case Oe: return "Activity";
				case ke: return "ViewTransition";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case ve: return "Portal";
				case Ce: return e.displayName || "Context";
				case Se: return (e._context.displayName || "Context") + ".Consumer";
				case we:
					var t = e.render;
					return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case Ee: return t = e.displayName || null, t === null ? d(e.type) || "Memo" : t;
				case De:
					t = e._payload, e = e._init;
					try {
						return d(e(t));
					} catch {}
			}
			return null;
		}
		function f(e) {
			if (e === ye) return "<>";
			if (typeof e == "object" && e && e.$$typeof === De) return "<...>";
			try {
				var t = d(e);
				return t ? "<" + t + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function p() {
			var e = x.A;
			return e === null ? null : e.getOwner();
		}
		function m() {
			return Error("react-stack-top-frame");
		}
		function h(e) {
			if (Re.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function g(e, t) {
			function n() {
				Be || (Be = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function ee() {
			var e = d(this.type);
			return He[e] || (He[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function te(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: _e,
				type: e,
				key: t,
				props: n,
				_owner: r
			}, (o === void 0 ? null : o) === null ? Object.defineProperty(e, "ref", {
				enumerable: !1,
				value: null
			}) : Object.defineProperty(e, "ref", {
				enumerable: !1,
				get: ee
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
		function ne(e, t) {
			return t = te(e.type, t, e.props, e._owner, e._debugStack, e._debugTask), e._store && (t._store.validated = e._store.validated), t;
		}
		function re(e) {
			ie(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === De && (e._payload.status === "fulfilled" ? ie(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function ie(e) {
			return typeof e == "object" && !!e && e.$$typeof === _e;
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
					case _e:
					case ve:
						s = !0;
						break;
					case De: return s = e._init, _(s(e._payload), t, n, i, a);
				}
			}
			if (s) {
				s = e, a = a(s);
				var c = i === "" ? "." + oe(s, 0) : i;
				return Ie(a) ? (n = "", c != null && (n = c.replace(Ke, "$&/") + "/"), _(a, t, n, "", function(e) {
					return e;
				})) : a != null && (ie(a) && (a.key != null && (s && s.key === a.key || u(a.key)), n = ne(a, n + (a.key == null || s && s.key === a.key ? "" : ("" + a.key).replace(Ke, "$&/") + "/") + c), i !== "" && s != null && ie(s) && s.key == null && s._store && !s._store.validated && (n._store.validated = 2), a = n), t.push(a)), 1;
			}
			if (s = 0, c = i === "" ? "." : i + ":", Ie(e)) for (var l = 0; l < e.length; l++) i = e[l], o = c + oe(i, l), s += _(i, t, n, o, a);
			else if (l = r(e), typeof l == "function") for (l === e.entries && (Ge || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Ge = !0), e = l.call(e), l = 0; !(i = e.next()).done;) i = i.value, o = c + oe(i, l++), s += _(i, t, n, o, a);
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
			var e = x.H;
			return e === null && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."), e;
		}
		function ue() {
			x.asyncTransitions--;
		}
		function de(e) {
			var t = x.T, n = {};
			n.types = t === null ? null : t.types, n._updatedFibers = /* @__PURE__ */ new Set(), x.T = n;
			try {
				var r = e(), i = x.S;
				i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && (x.asyncTransitions++, r.then(ue, ue), r.then(c, qe));
			} catch (e) {
				qe(e);
			} finally {
				t === null && n._updatedFibers && (e = n._updatedFibers.size, n._updatedFibers.clear(), 10 < e && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), t !== null && n.types !== null && (t.types !== null && t.types !== n.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), t.types = n.types), x.T = t;
			}
		}
		function fe(e) {
			var t = x.T;
			if (t !== null) {
				var n = t.types;
				n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
			} else x.asyncTransitions === 0 && console.error("addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition."), de(fe.bind(null, e));
		}
		function pe(e) {
			if (Ye === null) try {
				var n = ("require" + Math.random()).slice(0, 7);
				Ye = (t && t[n]).call(t, "timers").setImmediate;
			} catch {
				Ye = function(e) {
					!1 === Je && (Je = !0, typeof MessageChannel > "u" && console.error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
					var t = new MessageChannel();
					t.port1.onmessage = e, t.port2.postMessage(void 0);
				};
			}
			return Ye(e);
		}
		function me(e) {
			return 1 < e.length && typeof AggregateError == "function" ? AggregateError(e) : e[0];
		}
		function y(e, t) {
			t !== Xe - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), Xe = t;
		}
		function he(e, t, n) {
			var r = x.actQueue;
			if (r !== null) {
				if (r.length !== 0) try {
					ge(r), pe(function() {
						return he(e, t, n);
					});
					return;
				} catch (e) {
					x.thrownErrors.push(e);
				}
				else x.actQueue = null;
			}
			0 < x.thrownErrors.length ? (r = me(x.thrownErrors), x.thrownErrors.length = 0, n(r)) : t(e);
		}
		function ge(e) {
			if (!Qe) {
				Qe = !0;
				var t = 0;
				try {
					for (; t < e.length; t++) {
						var n = e[t];
						do {
							x.didUsePromise = !1;
							var r = n(!1);
							if (r !== null) {
								if (x.didUsePromise) {
									e[t] = n, e.splice(0, t);
									return;
								}
								n = r;
							} else break;
						} while (1);
					}
					e.length = 0;
				} catch (n) {
					e.splice(0, t + 1), x.thrownErrors.push(n);
				} finally {
					Qe = !1;
				}
			}
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var _e = Symbol.for("react.transitional.element"), ve = Symbol.for("react.portal"), ye = Symbol.for("react.fragment"), be = Symbol.for("react.strict_mode"), xe = Symbol.for("react.profiler"), Se = Symbol.for("react.consumer"), Ce = Symbol.for("react.context"), we = Symbol.for("react.forward_ref"), b = Symbol.for("react.suspense"), Te = Symbol.for("react.suspense_list"), Ee = Symbol.for("react.memo"), De = Symbol.for("react.lazy"), Oe = Symbol.for("react.activity"), ke = Symbol.for("react.view_transition"), Ae = Symbol.iterator, je = {}, Me = {
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
		}, Ne = Object.assign, Pe = {};
		Object.freeze(Pe), a.prototype.isReactComponent = {}, a.prototype.setState = function(e, t) {
			if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
			this.updater.enqueueSetState(this, e, t, "setState");
		}, a.prototype.forceUpdate = function(e) {
			this.updater.enqueueForceUpdate(this, e, "forceUpdate");
		};
		var Fe = {
			isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
			replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
		};
		for (et in Fe) Fe.hasOwnProperty(et) && n(et, Fe[et]);
		o.prototype = a.prototype, Fe = s.prototype = new o(), Fe.constructor = s, Ne(Fe, a.prototype), Fe.isPureReactComponent = !0;
		var Ie = Array.isArray, Le = Symbol.for("react.client.reference"), x = {
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
		}, Re = Object.prototype.hasOwnProperty, ze = console.createTask ? console.createTask : function() {
			return null;
		};
		Fe = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var Be, Ve, He = {}, Ue = Fe.react_stack_bottom_frame.bind(Fe, m)(), We = ze(f(m)), Ge = !1, Ke = /\/+/g, qe = typeof reportError == "function" ? reportError : function(e) {
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
		}, Je = !1, Ye = null, Xe = 0, Ze = !1, Qe = !1, $e = typeof queueMicrotask == "function" ? function(e) {
			queueMicrotask(function() {
				return queueMicrotask(e);
			});
		} : pe;
		Fe = Object.freeze({
			__proto__: null,
			c: function(e) {
				return v().useMemoCache(e);
			}
		});
		var et = {
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
				if (!ie(e)) throw Error("React.Children.only expected to receive a single React element child.");
				return e;
			}
		};
		e.Activity = Oe, e.Children = et, e.Component = a, e.Fragment = ye, e.Profiler = xe, e.PureComponent = s, e.StrictMode = be, e.Suspense = b, e.ViewTransition = ke, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = x, e.__COMPILER_RUNTIME = Fe, e.act = function(e) {
			var t = x.actQueue, n = Xe;
			Xe++;
			var r = x.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				x.thrownErrors.push(e);
			}
			if (0 < x.thrownErrors.length) throw y(t, n), e = me(x.thrownErrors), x.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return $e(function() {
					i || Ze || (Ze = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				}), { then: function(e, a) {
					i = !0, o.then(function(i) {
						if (y(t, n), n === 0) {
							try {
								ge(r), pe(function() {
									return he(i, e, a);
								});
							} catch (e) {
								x.thrownErrors.push(e);
							}
							if (0 < x.thrownErrors.length) {
								var o = me(x.thrownErrors);
								x.thrownErrors.length = 0, a(o);
							}
						} else e(i);
					}, function(e) {
						y(t, n), 0 < x.thrownErrors.length ? (e = me(x.thrownErrors), x.thrownErrors.length = 0, a(e)) : a(e);
					});
				} };
			}
			var s = a;
			if (y(t, n), n === 0 && (ge(r), r.length !== 0 && $e(function() {
				i || Ze || (Ze = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), x.actQueue = null), 0 < x.thrownErrors.length) throw e = me(x.thrownErrors), x.thrownErrors.length = 0, e;
			return { then: function(e, t) {
				i = !0, n === 0 ? (x.actQueue = r, pe(function() {
					return he(s, e, t);
				})) : e(s);
			} };
		}, e.addTransitionType = fe, e.cache = function(e) {
			return function() {
				return e.apply(null, arguments);
			};
		}, e.cacheSignal = function() {
			return null;
		}, e.captureOwnerStack = function() {
			var e = x.getCurrentStack;
			return e === null ? null : e();
		}, e.cloneElement = function(e, t, n) {
			if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
			var r = Ne({}, e.props), i = e.key, a = e._owner;
			if (t != null) {
				var o;
				a: {
					if (Re.call(t, "ref") && (o = Object.getOwnPropertyDescriptor(t, "ref").get) && o.isReactWarning) {
						o = !1;
						break a;
					}
					o = t.ref !== void 0;
				}
				for (s in o && (a = p()), h(t) && (u(t.key), i = "" + t.key), t) !Re.call(t, s) || s === "key" || s === "__self" || s === "__source" || s === "ref" && t.ref === void 0 || (r[s] = t[s]);
			}
			var s = arguments.length - 2;
			if (s === 1) r.children = n;
			else if (1 < s) {
				o = Array(s);
				for (var c = 0; c < s; c++) o[c] = arguments[c + 2];
				r.children = o;
			}
			for (r = te(e.type, i, r, a, e._debugStack, e._debugTask), i = 2; i < arguments.length; i++) re(arguments[i]);
			return r;
		}, e.createContext = function(e) {
			return e = {
				$$typeof: Ce,
				_currentValue: e,
				_currentValue2: e,
				_threadCount: 0,
				Provider: null,
				Consumer: null
			}, e.Provider = e, e.Consumer = {
				$$typeof: Se,
				_context: e
			}, e._currentRenderer = null, e._currentRenderer2 = null, e;
		}, e.createElement = function(e, t, n) {
			for (var r = 2; r < arguments.length; r++) re(arguments[r]);
			var i;
			r = {};
			var a = null;
			if (t != null) for (i in Ve || !("__self" in t) || "key" in t || (Ve = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), h(t) && (u(t.key), a = "" + t.key), t) Re.call(t, i) && i !== "key" && i !== "__self" && i !== "__source" && (r[i] = t[i]);
			var o = arguments.length - 2;
			if (o === 1) r.children = n;
			else if (1 < o) {
				for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
				Object.freeze && Object.freeze(s), r.children = s;
			}
			if (e && e.defaultProps) for (i in o = e.defaultProps, o) r[i] === void 0 && (r[i] = o[i]);
			return a && g(r, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), (i = 1e4 > x.recentlyCreatedOwnerStacks++) ? (s = Error.stackTraceLimit, Error.stackTraceLimit = 10, o = Error("react-stack-top-frame"), Error.stackTraceLimit = s) : o = Ue, te(e, a, r, p(), o, i ? ze(f(e)) : We);
		}, e.createRef = function() {
			var e = { current: null };
			return Object.seal(e), e;
		}, e.forwardRef = function(e) {
			e != null && e.$$typeof === Ee ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e == "function" ? e.length !== 0 && e.length !== 2 && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.") : console.error("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e), e != null && e.defaultProps != null && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
			var t = {
				$$typeof: we,
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
		}, e.isValidElement = ie, e.lazy = function(e) {
			e = {
				_status: -1,
				_result: e
			};
			var t = {
				$$typeof: De,
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
				$$typeof: Ee,
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
			return e.$$typeof === Se && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"), t.useContext(e);
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
}));
(/* @__PURE__ */ te(((e, t) => {
	t.exports = process.env.NODE_ENV === "production" ? wc() : Tc();
})))();
var Ec = null, N = {
	connect(e) {
		return Ec = e, () => {
			Ec === e && (Ec = null);
		};
	},
	disconnect() {
		Ec = null;
	},
	current() {
		return Ec?.() ?? null;
	},
	require(t) {
		return e(this.current(), t);
	}
};
//#endregion
//#region src/features/banking/data/reconciliationLock.ts
function Dc(e, t) {
	let n = ee(), r = n.journals?.journalEntries ?? [], i = n.bankReconciliations?.reconciliations ?? [], a = r.filter((n) => n.sourceType === e && n.sourceId === t).map((e) => e.id);
	if (i.some((e) => e.clearedTransactionIds.some((e) => a.some((t) => e.startsWith(t + ":"))))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Oc(e, t) {
	let n = ee(), r = n.bankAccounts?.bankAccounts ?? [], i = n.bankReconciliations?.reconciliations ?? [];
	for (let n of r.filter((e) => t.includes(e.glAccountId))) {
		let t = i.filter((e) => e.bankAccountId === n.id).map((e) => e.statementDate).sort().at(-1);
		if (t && e <= t) throw Error(`Bank account is reconciled through ${t}. Use a posting date after that statement.`);
	}
}
//#endregion
//#region src/features/accounting/data/accountingPeriodRepository.ts
var kc = [], Ac, jc, Mc = /* @__PURE__ */ new Set();
function Nc(e, t) {
	Ac = e, jc = t;
}
function Pc() {
	let e = jc?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function Fc(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function Ic(e) {
	let t = kc.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function Lc() {
	Mc.forEach((e) => e());
}
function Rc(e) {
	if (p(e, "Posting date"), !kc.length) return;
	let t = kc.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!kc.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
o("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => kc,
		subscribe(e) {
			return Mc.add(e), () => {
				Mc.delete(e);
			};
		},
		create(e) {
			let t = Pc(), n = Fc(e.reason);
			if (p(e.startDate), p(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (kc.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (kc.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
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
			return kc = [...kc, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), Lc(), r;
		},
		preflight(e) {
			let t = Ic(e);
			if (!Ac) throw Error("Trusted close checks unavailable.");
			return Ac(t);
		},
		close(e) {
			let t = Pc(), n = Fc(e.reason), r = Ic(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (kc.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return kc = kc.map((e) => e.id === r.id ? {
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
			} : e), Lc(), Ic(e.id);
		},
		reopen(e) {
			let t = Pc(), n = Fc(e.reason), r = Ic(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (kc.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return kc = kc.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), Lc(), Ic(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: kc }),
	restore: (e) => {
		h(e.periods), kc = e.periods;
	},
	publish: Lc
});
//#endregion
//#region src/features/purchases/data/mockPurchaseOrders.ts
var zc = [{
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
}], Bc = [{
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
function Vc() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function Hc(e, t) {
	let n = Vc();
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
function Uc(e, t) {
	let n = Vc();
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
function Wc(e) {
	let t = Vc();
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
var Gc = "htt:financial-snapshot:v1", Kc = (e) => !!e && typeof e == "object" && !Array.isArray(e), qc = (e) => new Set(e.map((e) => e.id)).size === e.length, Jc = (e) => {
	if (!Kc(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => Kc(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => Kc(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => Kc(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => Kc(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
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
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => Kc(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && Kc(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && Kc(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && Kc(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && qc(t) && qc(n) && qc(r) && qc(i);
}, Yc = () => ({
	purchaseOrders: structuredClone(zc),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone(Bc),
	transactions: [],
	transfers: [],
	journals: []
}), Xc, Zc = !1;
function Qc() {
	return typeof window < "u" && !!window.localStorage;
}
function $c() {
	if (Xc) return Xc;
	if (!Qc()) return Yc();
	let e = Hc(Gc, Jc);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return Zc = e.status === "ok", Xc = e.status === "ok" ? {
		...Yc(),
		...e.data
	} : Yc(), Xc;
}
var el = /* @__PURE__ */ new Set(), tl = 0, nl = /* @__PURE__ */ new Set();
function rl(e) {
	if (Qc() && !Uc(Gc, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var P = {
	wasRestoredOnLoad() {
		return $c(), Zc;
	},
	onRollback(e) {
		el.add(e);
	},
	notify(e) {
		tl ? nl.add(e) : e();
	},
	transaction(e) {
		if (tl) return e();
		let t = structuredClone($c());
		Xc = structuredClone(t), tl++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			rl($c());
		} catch (e) {
			throw Xc = t, el.forEach((e) => e()), nl.clear(), e;
		} finally {
			tl--;
		}
		let r = [...nl];
		return nl.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone($c());
	},
	update(e, t) {
		let n = {
			...$c(),
			[e]: structuredClone(t)
		};
		if (!Jc(n)) throw Error("Invalid financial snapshot; write blocked.");
		tl || rl(n), Xc = n;
	},
	resetCacheForTests() {
		Xc = void 0, Zc = !1;
	}
};
o("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => P.read(),
	restore: (e) => {
		Xc = e;
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/accountRepository.ts
var il = /* @__PURE__ */ new Set(), F = "2026-10-08T00:00:00.000Z", al = [
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
function ol() {
	il.forEach((e) => e());
}
function sl(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function cl(e) {
	return e?.trim() || void 0;
}
function ll(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function ul(e, t) {
	if (al.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function dl(e, t) {
	if (!e) return;
	let n = al.find((n) => n.id !== t && (g(e) ? n.id === g(e) : n.systemRole === e));
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function fl() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var I = {
	subscribe(e) {
		return il.add(e), () => {
			il.delete(e);
		};
	},
	getSnapshot() {
		return al;
	},
	getAll() {
		return al;
	},
	getById(e) {
		return al.find((t) => t.id === e);
	},
	getByCode(e) {
		return al.find((t) => t.code.toLowerCase() === e.trim().toLowerCase());
	},
	getBySystemRole(e) {
		return al.find((t) => g(e) ? t.id === g(e) : t.systemRole === e);
	},
	requireById(e) {
		let t = al.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = al.find((t) => g(e) ? t.id === g(e) : t.systemRole === e);
		if (!t) throw Error(`Accounting account for system role ${e} was not found.`);
		return t;
	},
	create(e) {
		let t = sl(e.code, "Account code"), n = sl(e.name, "Account name");
		ll(t), ul(t), dl(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: fl(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: cl(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return al = [...al, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), ol(), i;
	},
	update(e, t) {
		let n = al.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = sl(t.code, "Account code"), i = sl(t.name, "Account name");
		if (ll(r), ul(r, e), (n.systemRole || c(n.id)) && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: cl(t.description),
			active: n.systemRole || c(n.id) ? !0 : t.active,
			allowManualPosting: n.systemRole || c(n.id) ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return al = al.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), ol(), a;
	},
	setActive(e, t) {
		let n = al.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		if ((n.systemRole || c(n.id)) && !t) throw Error("System control accounts cannot be deactivated.");
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return al = al.map((t) => t.id === e ? r : t), ol(), r;
	}
};
o("accounts", {
	repository: I,
	read: "accounting.read",
	commands: {
		if: null,
		create: "accounting.post",
		update: "accounting.post",
		setActive: "accounting.post"
	},
	snapshot: () => ({ accounts: al }),
	restore: (e) => {
		al = e.accounts;
	},
	publish: () => il.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var pl = /* @__PURE__ */ new Set(), ml = P.read().journals;
P.onRollback(() => {
	ml = P.read().journals;
});
function hl() {
	pl.forEach((e) => P.notify(e));
}
function gl(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function _l(e) {
	return e?.trim() || void 0;
}
function vl(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function yl(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = ml.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function bl(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function xl(e) {
	if (vl(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = I.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = gl(r.debit), o = gl(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = gl(t + a), n = gl(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function Sl(e) {
	return e.lines.map((e, t) => {
		let n = I.requireById(e.accountId);
		return {
			id: bl(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: _l(e.description),
			debit: gl(e.debit),
			credit: gl(e.credit)
		};
	});
}
function Cl(e, t) {
	return ml.find((n) => n.sourceType === e && n.sourceId === t && !n.reversedJournalEntryId);
}
var L = {
	subscribe(e) {
		return pl.add(e), () => {
			pl.delete(e);
		};
	},
	getSnapshot() {
		return ml;
	},
	getAll() {
		return ml;
	},
	getById(e) {
		return ml.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return ml.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: Cl,
	post(e) {
		Rc(e.journalDate), Oc(e.journalDate, e.lines.map((e) => e.accountId));
		let t = xl(e), n = _l(e.sourceId);
		if (n) {
			let t = Cl(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: bl("je"),
			journalNumber: yl(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: _l(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: Sl(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...ml];
		return P.update("journals", a), ml = a, hl(), i;
	},
	reverse(e) {
		Rc(e.reversalDate);
		let t = ml.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (vl(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Reversal reason must contain at least 3 characters.");
		Oc(e.reversalDate, t.lines.map((e) => e.accountId));
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
		}, i = xl(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: bl("je"),
			journalNumber: yl(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: Sl(r),
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
		}, c = [o, ...ml.map((e) => e.id === t.id ? s : e)];
		return P.update("journals", c), ml = c, hl(), o;
	}
};
o("journals", {
	repository: L,
	read: "accounting.read",
	commands: {
		if: null,
		validateDate: null,
		for: null,
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ journalEntries: ml }),
	restore: (e) => {
		ml = e.journalEntries;
	},
	publish: () => pl.forEach((e) => e())
});
//#endregion
//#region src/features/job-costing/jobCostingService.ts
function wl(e) {
	let t = Math.round(e * 100);
	if (!Number.isFinite(e) || !Number.isSafeInteger(t) || Math.abs(t / 100 - e) > 1e-7) throw Error("Amounts must be safe currency values with at most two decimals.");
	return t;
}
function Tl(e, t) {
	return e.flatMap((n) => n.lines.flatMap((r, i) => {
		let a = t.find((e) => e.id === r.accountId);
		if (!a || !["REVENUE", "EXPENSE"].includes(a.type)) return [];
		let o = n, s = r;
		if (n.reversedJournalEntryId) {
			let t = e.find((e) => e.id === n.reversedJournalEntryId), a = t?.lines[i];
			if (!t || !a || a.accountId !== r.accountId || wl(a.debit) !== wl(r.credit) || wl(a.credit) !== wl(r.debit)) throw Error("Reversal line does not match its original source.");
			o = t, s = a;
		}
		let c = wl(a.type === "REVENUE" ? r.credit - r.debit : r.debit - r.credit);
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
function El(e, t, n, r, i, a) {
	if (p(i, "From date"), p(a, "To date"), i > a) throw Error("From date must not follow to date.");
	let o = Tl(e, t).filter((e) => e.date >= i && e.date <= a), s = o.flatMap((e) => {
		let t = r.find((t) => t.journalId === e.rootJournalId && t.lineId === e.rootLineId), i = e.amount < 0 ? -1 : 1, a = wl(e.capacity), o = (t?.splits ?? []).map((t) => {
			let r = wl(t.amount);
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
		for (let r of s.filter((t) => t.jobId === e)) r.kind === "REVENUE" ? t += wl(r.allocated) : n += wl(r.allocated);
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
			let t = c(e.id), n = wl(Math.round(Number(e.budget) * 100) / 100), r = wl(Math.round(Number(e.costBudget) * 100) / 100);
			return {
				id: e.id,
				name: e.name,
				code: e.code,
				status: e.status,
				...t,
				budget: n / 100,
				costBudget: r / 100,
				budgetProfit: (n - r) / 100,
				revenueVariance: (wl(t.revenue) - n) / 100,
				costVariance: (r - wl(t.cost)) / 100,
				profitVariance: (wl(t.profit) - n + r) / 100
			};
		}),
		unallocated: c(""),
		ledger: {
			revenue: o.filter((e) => e.kind === "REVENUE").reduce((e, t) => e + wl(t.amount), 0) / 100,
			cost: o.filter((e) => e.kind === "EXPENSE").reduce((e, t) => e + wl(t.amount), 0) / 100
		}
	};
}
//#endregion
//#region src/features/job-costing/jobCostingRepository.ts
var Dl = D().trim().min(1).max(200), Ol = D().trim().min(1).max(2e3), kl = D().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), Al = j({
	jobId: Dl,
	amount: k().finite().positive().refine((e) => {
		try {
			return wl(e), !0;
		} catch {
			return !1;
		}
	})
}).strict(), jl = j({
	id: Dl,
	journalId: Dl,
	lineId: Dl,
	revision: k().int().positive(),
	splits: A(Al).max(100),
	updatedAt: kl,
	updatedBy: Dl
}).strict(), Ml = j({
	id: Dl,
	operationId: Dl,
	recordId: Dl,
	revision: k().int().positive(),
	at: kl,
	actorId: Dl,
	reason: Ol,
	fingerprint: D().max(3e6),
	before: A(Al),
	after: A(Al)
}).strict(), Nl = j({
	operationId: Dl,
	journalId: Dl,
	lineId: Dl,
	expectedRevision: k().int().nonnegative(),
	expectedSource: D().max(2e6),
	splits: A(Al).max(100),
	reason: Ol
}).strict(), Pl = [], Fl = [], Il = /* @__PURE__ */ new Set(), Ll = () => Il.forEach((e) => e());
function Rl(e, t, n) {
	if (new Set(e.map((e) => e.jobId)).size !== e.length) throw Error("Use one split per project.");
	if (e.some((e) => !n.some((t) => t.id === e.jobId))) throw Error("Project was not found.");
	if (e.reduce((e, t) => e + wl(t.amount), 0) > wl(t)) throw Error("Project splits exceed the source amount.");
}
o("jobCosting", {
	repository: {
		subscribe(e) {
			return Il.add(e), () => {
				Il.delete(e);
			};
		},
		getSnapshot: () => Pl,
		review() {
			return N.require("accounting.read"), {
				lines: Tl(L.getAll(), I.getAll()),
				allocations: structuredClone(Pl),
				history: structuredClone(Fl)
			};
		},
		report(e) {
			N.require("accounting.read");
			let t = j({
				from: D(),
				to: D()
			}).strict().parse(e);
			return El(L.getAll(), I.getAll(), d.jobs, Pl, t.from, t.to);
		},
		save(e) {
			let t = N.require("accounting.post"), n = Nl.parse(e), r = JSON.stringify(n), i = Fl.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already has different allocation data.");
				return Pl.find((e) => e.id === i.recordId);
			}
			let a = Tl(L.getAll(), I.getAll()).find((e) => e.journalId === n.journalId && e.lineId === n.lineId);
			if (!a) throw Error("Select a posted revenue or expense line.");
			if (a.reversal) throw Error("Allocate the original line; reversal entries inherit its splits.");
			if (n.expectedSource !== a.signature) throw Error("Source journal changed. Refresh before allocating.");
			let o = Pl.find((e) => e.journalId === a.journalId && e.lineId === a.lineId);
			if ((o?.revision ?? 0) !== n.expectedRevision) throw Error("Allocation changed. Refresh before saving.");
			Rl(n.splits, a.capacity, d.jobs);
			for (let e of n.splits) if (d.jobs.find((t) => t.id === e.jobId).status !== "Active" && o?.splits.find((t) => t.jobId === e.jobId)?.amount !== e.amount) throw Error("Only active projects can receive new or changed allocations.");
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
			return Pl = [...Pl.filter((e) => e.id !== c.id), c], Fl = [...Fl, {
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
			}], Ll(), c;
		}
	},
	read: "accounting.read",
	commands: {
		review: "accounting.read",
		report: "accounting.read",
		save: "accounting.post"
	},
	snapshot: () => ({
		allocations: Pl,
		history: Fl
	}),
	restore: (e) => {
		Pl = e.allocations, Fl = e.history;
	},
	publish: Ll,
	validate: (e, t) => {
		let n = j({
			allocations: A(jl),
			history: A(Ml)
		}).strict().parse(e), r = t.workspace_jobs.records, i = Tl(t.journals.journalEntries, t.accounts.accounts), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
		for (let e of n.allocations) {
			let t = i.find((t) => t.journalId === e.journalId && t.lineId === e.lineId), o = e.journalId + ":" + e.lineId;
			if (!t || t.reversal || a.has(o)) throw Error("Invalid project source reference.");
			a.add(o), Rl(e.splits, t.capacity, r);
			let s = n.history.filter((t) => t.recordId === e.id);
			if (s.length !== e.revision) throw Error("Invalid allocation history length.");
			let c = [], l = "";
			for (let [n, i] of s.entries()) {
				let a = Nl.parse(JSON.parse(i.fingerprint));
				if (i.revision !== n + 1 || i.at < l || JSON.stringify(i.before) !== JSON.stringify(c) || a.journalId !== e.journalId || a.lineId !== e.lineId || a.operationId !== i.operationId || a.expectedRevision !== n || a.reason !== i.reason || JSON.stringify(a.splits) !== JSON.stringify(i.after)) throw Error("Invalid allocation history chain.");
				Rl(i.after, t.capacity, r), c = i.after, l = i.at;
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
//#region src/features/contacts/schemas/customerSchemas.ts
var zl = [
	"Flooring Retailer",
	"Builder",
	"Developer",
	"Designer",
	"Architect",
	"Installer",
	"Other"
], Bl = [
	"ACTIVE",
	"ON_HOLD",
	"INACTIVE"
], Vl = D().trim().refine((e) => e === "" || D().email().safeParse(e).success, { message: "Enter a valid email address" }), Hl = D().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), Ul = j({
	businessName: D().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: D().trim().max(120, "Trading name is too long"),
	abn: Hl,
	businessType: M(zl),
	status: M(Bl),
	email: Vl,
	phone: D().trim().max(40, "Phone number is too long"),
	website: D().trim().max(200, "Website is too long"),
	creditLimit: k({ message: "Credit limit is required" }).min(0, "Credit limit cannot be negative"),
	paymentTermsDays: k({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days")
}), Wl = j({
	name: D().trim().min(1, "Location name is required").max(100, "Location name is too long"),
	addressLine1: D().trim().min(1, "Address is required").max(160, "Address is too long"),
	addressLine2: D().trim().max(160, "Address is too long"),
	suburb: D().trim().min(1, "Suburb is required").max(100, "Suburb is too long"),
	state: D().trim().min(1, "State is required").max(50, "State is too long"),
	postcode: D().trim().min(1, "Postcode is required").max(20, "Postcode is too long"),
	country: D().trim().min(1, "Country is required").max(100, "Country is too long"),
	phone: D().trim().max(40, "Phone number is too long"),
	isPrimary: zs()
}), Gl = j({
	isAccounting: zs().optional(),
	firstName: D().trim().min(1, "First name is required").max(80, "First name is too long"),
	lastName: D().trim().min(1, "Last name is required").max(80, "Last name is too long"),
	jobTitle: D().trim().max(100, "Job title is too long"),
	email: D().trim().min(1, "Email is required").email("Enter a valid email address"),
	phone: D().trim().max(40, "Phone number is too long"),
	mobile: D().trim().max(40, "Mobile number is too long"),
	locationId: D(),
	isPrimary: zs()
}), Kl = [
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
], ql = "htt.mock.contacts.customers.v1";
function Jl(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var Yl = Hc(ql, Jl), Xl = Yl.status !== "invalid" && Wc(ql), Zl = /* @__PURE__ */ new Set(), Ql = Yl.status === "ok" ? Yl.data : structuredClone(Kl);
function $l() {
	Xl && Uc(ql, Ql), Zl.forEach((e) => {
		e();
	});
}
function eu(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function tu() {
	let e = Ql.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function nu(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function ru(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function iu(e, t) {
	let n = !1;
	if (Ql = Ql.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	$l();
}
var au = {
	subscribe(e) {
		return Zl.add(e), () => {
			Zl.delete(e);
		};
	},
	getSnapshot() {
		return Ql;
	},
	getAll() {
		return Ql;
	},
	getById(e) {
		return Ql.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: eu("cus"),
			code: tu(),
			businessName: e.businessName.trim(),
			tradingName: nu(e.tradingName),
			abn: ru(e.abn),
			businessType: e.businessType,
			status: e.status,
			email: nu(e.email),
			phone: nu(e.phone),
			website: nu(e.website),
			creditLimit: e.creditLimit,
			currentBalance: 0,
			overdueBalance: 0,
			paymentTermsDays: e.paymentTermsDays,
			locations: [],
			contacts: [],
			createdAt: t,
			updatedAt: t
		};
		return Ql = [n, ...Ql], $l(), n;
	},
	update(e, t) {
		let n;
		if (iu(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: nu(t.tradingName),
			abn: ru(t.abn),
			businessType: t.businessType,
			status: t.status,
			email: nu(t.email),
			phone: nu(t.phone),
			website: nu(t.website),
			creditLimit: t.creditLimit,
			paymentTermsDays: t.paymentTermsDays,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, n)), !n) throw Error(`Customer ${e} was not found`);
		return n;
	},
	addLocation(e, t) {
		let n = au.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: eu("loc"),
			name: t.name.trim(),
			addressLine1: t.addressLine1.trim(),
			addressLine2: nu(t.addressLine2),
			suburb: t.suburb.trim(),
			state: t.state.trim(),
			postcode: t.postcode.trim(),
			country: t.country.trim(),
			phone: nu(t.phone),
			isPrimary: r
		};
		return iu(e, (e) => ({
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
		let r = au.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		let i = r.locations.find((e) => e.id === t);
		if (!i) throw Error(`Location ${t} was not found`);
		let a = n.isPrimary || r.locations.length === 1, o = {
			...i,
			name: n.name.trim(),
			addressLine1: n.addressLine1.trim(),
			addressLine2: nu(n.addressLine2),
			suburb: n.suburb.trim(),
			state: n.state.trim(),
			postcode: n.postcode.trim(),
			country: n.country.trim(),
			phone: nu(n.phone),
			isPrimary: a
		};
		return iu(e, (e) => ({
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
		t = Gl.parse(t);
		let n = au.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: eu("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: nu(t.jobTitle),
			email: t.email.trim(),
			phone: nu(t.phone),
			mobile: nu(t.mobile),
			locationId: nu(t.locationId),
			isPrimary: r,
			isAccounting: t.isAccounting ?? !1
		};
		return iu(e, (e) => ({
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
		n = Gl.parse(n);
		let r = au.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		if (n.locationId && !r.locations.some((e) => e.id === n.locationId)) throw Error("The selected location does not belong to this customer");
		let i = r.contacts.find((e) => e.id === t);
		if (!i) throw Error(`Contact ${t} was not found`);
		let a = n.isPrimary || r.contacts.length === 1, o = {
			...i,
			firstName: n.firstName.trim(),
			lastName: n.lastName.trim(),
			jobTitle: nu(n.jobTitle),
			email: n.email.trim(),
			phone: nu(n.phone),
			mobile: nu(n.mobile),
			locationId: nu(n.locationId),
			isPrimary: a,
			isAccounting: n.isAccounting ?? !1
		};
		return iu(e, (e) => ({
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
	repository: au,
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
	snapshot: () => ({ customers: Ql }),
	restore: (e) => {
		Ql = e.customers;
	},
	publish: () => Zl.forEach((e) => e())
});
//#endregion
//#region src/features/contact-review/reviewModel.ts
var ou = [
	"Customer",
	"Branch",
	"Contact"
], su = [
	"Manual",
	"Sales draft",
	"Selected contact",
	"Card transcription"
], cu = {
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
}, lu = Zs(D(), qs([
	D().max(2e3),
	k().finite(),
	zs()
]));
function uu(e, t) {
	let n = lu.parse(t), r = cu[e];
	if (Object.keys(n).some((e) => !Object.hasOwn(r, e))) throw Error("Unsupported draft field. Use the documented fields for this draft type.");
	for (let [e, t] of Object.entries(n)) if (typeof t != typeof r[e]) throw Error(`Invalid value type for ${e}.`);
	return {
		...r,
		...n
	};
}
var du = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), fu = (e) => String(e ?? "").trim().toLowerCase(), pu = (e) => String(e ?? "").replace(/\D/g, ""), mu = (e, t, n = du) => !!n(e) && n(e) === n(t);
function hu(e, t) {
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
		(mu(r.businessName, e.businessName) || mu(r.businessName, e.tradingName) || mu(r.tradingName, e.businessName) || mu(r.tradingName, e.tradingName)) && t.push("Business/trading name"), mu(r.email, e.email, fu) && t.push("Email"), mu(r.phone, e.phone, pu) && t.push("Phone"), mu(r.abn, e.abn) && t.push("Identifier"), i(e.id, e.id, e.businessName, [
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
			mu(r.name, e.name) && t.push("Branch name"), String(r.addressLine1).trim() && mu([
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
			].join(" ")) && t.push("Address"), mu(r.phone, e.phone, pu) && t.push("Phone"), i(e.id, n.id, e.name, [
				e.addressLine1,
				e.suburb,
				e.postcode
			].filter(Boolean).join(" · "), t);
		}
		else for (let e of n.contacts) {
			let t = [];
			mu([r.firstName, r.lastName].join(" "), [e.firstName, e.lastName].join(" ")) && t.push("Contact name"), mu(r.email, e.email, fu) && t.push("Email"), (mu(r.phone, e.phone, pu) || mu(r.phone, e.mobile, pu) || mu(r.mobile, e.phone, pu) || mu(r.mobile, e.mobile, pu)) && t.push("Phone/mobile"), i(e.id, n.id, `${e.firstName} ${e.lastName}`, [
				e.email,
				e.phone,
				e.mobile
			].filter(Boolean).join(" · "), t);
		}
	}
	return n.sort((e, t) => t.reasons.length - e.reasons.length || e.name.localeCompare(t.name) || e.id.localeCompare(t.id));
}
function gu(e) {
	return JSON.stringify(e);
}
//#endregion
//#region src/features/contact-review/reviewRepository.ts
var _u = D().trim().min(1).max(200), vu = D().trim().max(2e3), yu = D().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), bu = j({
	operationId: _u,
	kind: M(ou),
	customerId: D().max(200).default(""),
	values: lu,
	source: M(su).default("Manual"),
	externalId: D().trim().max(200).default(""),
	sourceReference: D().trim().max(500).default("")
}).strict(), xu = j({
	id: _u,
	action: _u,
	actorId: _u,
	at: yu,
	reason: vu,
	data: D().max(2e6)
}).strict(), Su = j({
	action: M([
		"Approve new",
		"Link existing",
		"Reject"
	]),
	actorId: _u,
	at: yu,
	reason: vu,
	fingerprint: D().max(1e4),
	customerId: D(),
	targetId: D(),
	snapshot: Vs()
}).strict(), Cu = bu.extend({
	id: _u,
	state: M([
		"Pending",
		"Approved",
		"Linked",
		"Rejected"
	]),
	revision: k().int().positive(),
	createdBy: _u,
	createdAt: yu,
	updatedAt: yu,
	creationFingerprint: D().max(1e5),
	history: A(xu).min(1),
	decision: Su.optional()
}).strict(), wu = [], Tu = /* @__PURE__ */ new Set(), Eu = () => Tu.forEach((e) => e());
function Du() {
	let e = N.require("contacts.write");
	return N.require("sales.read"), e.userId;
}
var Ou = () => (/* @__PURE__ */ new Date()).toISOString();
function ku(e) {
	let t = Ou();
	if (t < e.updatedAt) throw Error("System clock precedes the last review update. Correct it before continuing.");
	return t;
}
var Au = (e, t, n, r = "", i = {}) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	reason: r,
	data: JSON.stringify(i)
});
function ju(e) {
	let t = wu.find((t) => t.id === e);
	if (!t) throw Error("Review draft not found.");
	return t;
}
function Mu(e, t) {
	if (e.revision !== t) throw Error("Review draft changed. Reload before continuing.");
}
function Nu(e) {
	return wu = [...wu.filter((t) => t.id !== e.id), e], Eu(), e;
}
function Pu(e) {
	let t = bu.parse(e);
	if (t.values = uu(t.kind, t.values), t.kind === "Customer" && t.customerId) throw Error("Customer drafts must not have a parent customer.");
	if (t.customerId && !au.getById(t.customerId)) throw Error("Parent customer was not found.");
	return t;
}
function Fu(e, t) {
	return e === "Customer" ? Ul.strict().parse(t) : e === "Branch" ? Wl.strict().parse(t) : Gl.strict().parse(t);
}
function Iu(e, t, n) {
	let r = au.getById(e === "Customer" ? n : t);
	if (!r) throw Error("Choose an existing customer.");
	let i = e === "Customer" ? r : e === "Branch" ? r.locations.find((e) => e.id === n) : r.contacts.find((e) => e.id === n);
	if (!i) throw Error("The selected record does not belong to this customer or draft type.");
	return {
		customerId: r.id,
		targetId: i.id,
		snapshot: structuredClone(i)
	};
}
var Lu = {
	subscribe(e) {
		return Tu.add(e), () => {
			Tu.delete(e);
		};
	},
	getSnapshot: () => wu,
	create(e) {
		let t = Du(), n = Pu(e), { operationId: r, ...i } = n, a = JSON.stringify(i), o = wu.find((e) => e.operationId === r) || n.externalId && wu.find((e) => e.source === n.source && e.externalId === n.externalId);
		if (o) {
			if (o.creationFingerprint !== a) throw Error("Operation or external source ID already contains different draft data.");
			return o;
		}
		let s = Ou();
		return Nu({
			...n,
			id: crypto.randomUUID(),
			state: "Pending",
			revision: 1,
			createdBy: t,
			createdAt: s,
			updatedAt: s,
			creationFingerprint: a,
			history: [Au("Received", t, s, "", i)]
		});
	},
	importBatch(e) {
		Du();
		let t = j({
			operationId: _u.max(150),
			drafts: A(bu.omit({ operationId: !0 })).min(1).max(100)
		}).strict().parse(e);
		if (t.drafts.some((e) => !e.externalId)) throw Error("Each imported draft requires a source external ID for safe retry.");
		return t.drafts.map((e, n) => Lu.create({
			...e,
			operationId: t.operationId + ":" + n
		}));
	},
	update(e) {
		let t = Du(), n = j({
			id: _u,
			expectedRevision: k().int().positive(),
			customerId: D().max(200),
			values: lu
		}).strict().parse(e), r = ju(n.id);
		if (Mu(r, n.expectedRevision), r.state !== "Pending") throw Error("Only pending drafts can be edited.");
		let i = Pu({
			operationId: r.operationId,
			kind: r.kind,
			customerId: n.customerId,
			values: n.values,
			source: r.source,
			externalId: r.externalId,
			sourceReference: r.sourceReference
		}), a = ku(r);
		return Nu({
			...r,
			customerId: i.customerId,
			values: i.values,
			revision: r.revision + 1,
			updatedAt: a,
			history: [...r.history, Au("Updated", t, a, "", {
				customerId: i.customerId,
				values: i.values
			})]
		});
	},
	review(e) {
		N.require("sales.read");
		let t = ju(_u.parse(e)), n = au.getAll(), r = "";
		try {
			if (Fu(t.kind, t.values), t.kind !== "Customer" && !n.some((e) => e.id === t.customerId)) throw Error("Select the parent customer.");
		} catch (e) {
			r = e.message;
		}
		return {
			revision: t.revision,
			duplicates: hu(t, n),
			masterSignature: gu(n),
			validationError: r
		};
	},
	decide(e) {
		let t = Du(), n = j({
			id: _u,
			expectedRevision: k().int().positive(),
			action: M([
				"Approve new",
				"Link existing",
				"Reject"
			]),
			reason: vu,
			allowDuplicate: zs().default(!1),
			targetId: D().max(200).default(""),
			expectedMaster: D().max(25e6).optional()
		}).strict().parse(e), r = ju(n.id), i = JSON.stringify({
			action: n.action,
			reason: n.reason,
			allowDuplicate: n.allowDuplicate,
			targetId: n.targetId
		});
		if (r.state !== "Pending") {
			if (r.decision?.fingerprint === i) return r;
			throw Error("This draft already has a different decision.");
		}
		Mu(r, n.expectedRevision);
		let a = ku(r), o = {
			customerId: "",
			targetId: "",
			snapshot: null
		};
		if (n.action === "Reject") {
			if (!n.reason) throw Error("Explain why the draft is rejected.");
		} else {
			let e = au.getAll();
			if (n.expectedMaster !== gu(e)) throw Error("Customer records changed. Refresh duplicate review before deciding.");
			if (n.action === "Link existing") {
				if (!n.reason) throw Error("Explain why this existing record is the correct match.");
				o = Iu(r.kind, r.customerId, n.targetId);
			} else {
				if (hu(r, e).length && (!n.allowDuplicate || !n.reason)) throw Error("Possible duplicates exist. Link an existing record or explicitly confirm a separate new record with a reason.");
				let t = Fu(r.kind, r.values);
				if (r.kind === "Customer") {
					let e = au.create(t);
					o = {
						customerId: e.id,
						targetId: e.id,
						snapshot: structuredClone(e)
					};
				} else {
					let e = au.getById(r.customerId);
					if (!e || e.status === "INACTIVE") throw Error("Select an available parent customer.");
					let n = r.kind === "Branch" ? au.addLocation(e.id, t) : au.addContact(e.id, t);
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
		return Nu({
			...r,
			state: n.action === "Reject" ? "Rejected" : n.action === "Link existing" ? "Linked" : "Approved",
			revision: r.revision + 1,
			updatedAt: a,
			decision: s,
			history: [...r.history, Au(n.action, t, a, n.reason, s)]
		});
	},
	reopen(e) {
		let t = Du(), n = j({
			id: _u,
			expectedRevision: k().int().positive(),
			reason: vu.refine(Boolean, "Explain why this draft is reopened.")
		}).strict().parse(e), r = ju(n.id);
		if (Mu(r, n.expectedRevision), r.state !== "Rejected") throw Error("Only rejected drafts may be reopened.");
		let i = ku(r), a = {
			...r,
			state: "Pending",
			revision: r.revision + 1,
			updatedAt: i,
			history: [...r.history, Au("Reopened", t, i, n.reason)]
		};
		return delete a.decision, Nu(a);
	}
};
o("contactReviews", {
	repository: Lu,
	read: "sales.read",
	commands: {
		create: "contacts.write",
		update: "contacts.write",
		importBatch: "contacts.write",
		review: "sales.read",
		decide: "contacts.write",
		reopen: "contacts.write"
	},
	snapshot: () => ({ drafts: wu }),
	restore: (e) => {
		wu = e.drafts;
	},
	publish: Eu,
	validate: (e, t) => {
		let n = j({ drafts: A(Cu) }).strict().parse(e), r = t.customers.customers, i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set();
		for (let e of n.drafts) {
			let t = uu(e.kind, e.values);
			if (Object.keys(t).length !== Object.keys(e.values).length) throw Error("Missing review draft fields.");
			if (i.has(e.operationId) || e.externalId && a.has(e.source + ":" + e.externalId)) throw Error("Duplicate review intake identity.");
			i.add(e.operationId), e.externalId && a.add(e.source + ":" + e.externalId);
			let n = JSON.parse(e.creationFingerprint);
			if (e.history[0].data !== e.creationFingerprint) throw Error("Review source history is inconsistent.");
			if (n.kind !== e.kind || n.source !== e.source || n.externalId !== e.externalId || n.sourceReference !== e.sourceReference) throw Error("Review intake provenance is inconsistent.");
			if (e.history.length !== e.revision || new Set(e.history.map((e) => e.id)).size !== e.history.length || e.history[0].action !== "Received" || e.history[0].actorId !== e.createdBy || e.history[0].at !== e.createdAt || e.updatedAt < e.createdAt) throw Error("Invalid review history.");
			let o = "Pending", s = e.createdAt;
			for (let [t, n] of e.history.entries()) {
				if (n.at < s || n.at > e.updatedAt) throw Error("Invalid review event time.");
				s = n.at;
				let r = JSON.parse(n.data);
				if (!r || typeof r != "object" || Array.isArray(r)) throw Error("Invalid review event payload.");
				if (t !== 0) {
					if (n.action === "Updated") {
						if (o !== "Pending") throw Error("Invalid review edit history.");
					} else if (n.action === "Reopened") {
						if (o !== "Rejected" || !n.reason) throw Error("Invalid review reopen history.");
						o = "Pending";
					} else if ([
						"Approve new",
						"Link existing",
						"Reject"
					].includes(n.action)) {
						if (o !== "Pending") throw Error("Invalid repeated review decision.");
						o = n.action === "Reject" ? "Rejected" : n.action === "Link existing" ? "Linked" : "Approved";
					} else throw Error("Unknown review history action.");
				}
			}
			if (o !== e.state || e.history.at(-1).at !== e.updatedAt) throw Error("Review history does not match current state.");
			if (e.kind === "Customer" && e.customerId || e.customerId && !r.some((t) => t.id === e.customerId)) throw Error("Review parent customer is invalid.");
			if (e.state === "Pending" != !e.decision) throw Error("Review state and decision are inconsistent.");
			if (e.decision) {
				let t = e.state === "Rejected" ? "Reject" : e.state === "Linked" ? "Link existing" : "Approve new", n = j({
					action: M([
						"Approve new",
						"Link existing",
						"Reject"
					]),
					reason: vu,
					allowDuplicate: zs(),
					targetId: D()
				}).strict().parse(JSON.parse(e.decision.fingerprint)), i = e.history.at(-1);
				if (n.action !== t || n.reason !== e.decision.reason || n.targetId !== (t === "Link existing" ? e.decision.targetId : "") || i.actorId !== e.decision.actorId || i.at !== e.decision.at || i.reason !== e.decision.reason || JSON.stringify(JSON.parse(i.data)) !== JSON.stringify(e.decision)) throw Error("Review decision audit is inconsistent.");
				if (e.decision.action !== t) throw Error("Invalid review decision.");
				if (t !== "Reject") {
					let n = r.find((t) => t.id === e.decision.customerId), i = e.kind === "Customer" ? n : e.kind === "Branch" ? n?.locations.find((t) => t.id === e.decision.targetId) : n?.contacts.find((t) => t.id === e.decision.targetId);
					if (!i || i.id !== e.decision.targetId || e.kind !== "Customer" && n.id !== e.customerId || e.decision.snapshot?.id !== i.id) throw Error("Invalid resolved review reference.");
					t === "Approve new" && Fu(e.kind, e.values);
				} else if (!e.decision.reason || e.decision.customerId || e.decision.targetId) throw Error("Invalid rejection.");
			}
		}
	}
});
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var Ru = "htt.mock.banking.accounts.v1";
function zu(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var Bu = /* @__PURE__ */ new Set(), Vu = "2026-10-08T00:00:00.000Z", Hu = [{
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
	createdAt: Vu,
	updatedAt: Vu
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
	createdAt: Vu,
	updatedAt: Vu
}], Uu = Hc(Ru, zu);
Uu.status === "ok" && Uu.data.every((e) => {
	let t = I.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (Hu = Uu.data);
function Wu() {
	Bu.forEach((e) => e());
}
function Gu(e) {
	let t = I.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of Hu) Gu(e);
var Ku = {
	subscribe(e) {
		return Bu.add(e), () => {
			Bu.delete(e);
		};
	},
	getSnapshot() {
		return Hu;
	},
	getAll() {
		return Hu;
	},
	getById(e) {
		return Hu.find((t) => t.id === e);
	},
	getByGlAccountId(e) {
		return Hu.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = Hu.find((t) => t.id === e);
		if (!t) throw Error("Bank account was not found.");
		return t;
	},
	save(e, t) {
		let n = j({
			id: D().optional(),
			name: D().trim().min(1).max(180),
			bankName: D().trim().min(1).max(180),
			accountNumber: D().trim().min(1).max(100),
			accountType: M([
				"TRANSACTION",
				"SAVINGS",
				"CREDIT_CARD",
				"OTHER"
			]),
			currency: M(["AUD", "NZD"]),
			glAccountId: D().min(1),
			openingBalanceDate: D(),
			active: zs()
		}).strict().parse(e);
		if (p(n.openingBalanceDate, "Opening date"), Hu[0] && n.currency !== Hu[0].currency) throw Error("This profile uses one base currency; foreign-currency bank accounts are not supported.");
		let r = Hu.find((e) => e.id === n.id);
		if (r && r.updatedAt !== t) throw Error("Bank account changed; reload before editing.");
		if (!r && n.id) throw Error("Bank account was not found.");
		if (Hu.some((e) => e.id !== r?.id && e.glAccountId === n.glAccountId)) throw Error("Each bank account needs its own GL account.");
		let i = I.requireById(n.glAccountId);
		if (!i.active || i.type !== "ASSET" || i.systemRole && i.systemRole !== "BANK") throw Error("Choose an active bank Asset account.");
		if (r && L.getAll().some((e) => e.lines.some((e) => e.accountId === r.glAccountId)) && (r.glAccountId !== n.glAccountId || r.openingBalanceDate !== n.openingBalanceDate || r.currency !== n.currency)) throw Error("A used bank account cannot change its ledger, currency or opening date.");
		let a = new Date(Math.max(Date.now(), r ? Date.parse(r.updatedAt) + 1 : 0)).toISOString(), o = {
			...n,
			id: r?.id ?? crypto.randomUUID(),
			openingBalance: r?.openingBalance ?? 0,
			createdAt: r?.createdAt ?? a,
			updatedAt: a
		};
		return Gu(o), Hu = [...Hu.filter((e) => e.id !== o.id), o], Wu(), o;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Hu = Hu.map((t) => t.id === e ? r : t), Wc(Ru) && Uc(Ru, Hu), Wu(), r;
	}
};
o("bankAccounts", {
	repository: Ku,
	read: "banking.read",
	commands: {
		if: null,
		validateBankAccount: null,
		setActive: "banking.write",
		save: "banking.write"
	},
	snapshot: () => ({ bankAccounts: Hu }),
	restore: (e) => {
		Hu = e.bankAccounts;
	},
	publish: () => Bu.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/itemTypes.ts
function qu(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function Ju(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function Yu(e, t) {
	if (e.itemType !== void 0 && ![
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	].includes(String(e.itemType))) throw Error("Invalid saved sales item type.");
	if (t && (e.itemType ?? "STOCK") !== (t.itemType ?? "STOCK")) throw Error("Saved sales item type does not match its referenced product.");
}
//#endregion
//#region src/features/inventory/data/mockProducts.ts
var Xu = [
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
function Zu(e) {
	return Xu.find((t) => t.id === e);
}
function Qu(e, t) {
	return Zu(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/sales/data/areaPacks.ts
function $u(e, t) {
	let n = Zu(e), r = n?.units.find((e) => e.id === t), i = n?.units.find((e) => e.id === n.baseUnitId);
	return n?.status === "ACTIVE" && n.itemType !== "SERVICE" && r?.active && i?.code === "M2" && ["BOX", "ROLL"].includes(r.code) && Number.isFinite(r.conversionToBase) && r.conversionToBase > 0 ? r.conversionToBase : void 0;
}
function ed(e, t, n, r) {
	if (r === void 0) return { quantity: n };
	let i = $u(e, t);
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
function td(e) {
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
function nd(e, t) {
	let n = au.getById(e);
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
function rd(e) {
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
//#region src/features/business-workspace/productRules.ts
function id(e, t, n, r) {
	let i = Zu(e), a = Qu(e, t);
	if (!i || i.status !== "ACTIVE" || !a?.active) throw Error("Select an active product and unit.");
	if (r === "buy" && !qu(i)) throw Error("Non-stock/service items use expense bills, not inventory purchase orders.");
	if (r === "buy" && i.buyEnabled === !1 || r === "sell" && i.sellEnabled === !1) throw Error(`Product is not available to ${r}.`);
	if (!Number.isFinite(n) || n <= 0) throw Error("Quantity must be finite and greater than zero.");
	if (i.wholePacks && [
		"BOX",
		"ROLL",
		"BUCKET"
	].includes(a.code) && !Number.isInteger(n)) throw Error("This product must be ordered in whole packs.");
}
//#endregion
//#region src/lib/persistence/financialOperationJournal.ts
var ad = "htt:financial-operations:v1", od = [
	"CUSTOMER_PAYMENT",
	"PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
], sd = [
	"PENDING",
	"COMPLETED",
	"MANUAL_REVIEW"
], cd = (e) => Array.isArray(e) && e.every((e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.operationId == "string" && t.operationId.length > 0 && od.includes(String(t.kind)) && typeof t.fingerprint == "string" && t.fingerprint.length > 0 && sd.includes(String(t.state)) && typeof t.createdAt == "string" && typeof t.updatedAt == "string" && (t.resultId === void 0 || typeof t.resultId == "string") && (t.note === void 0 || typeof t.note == "string") && (t.reviewHistory === void 0 || Array.isArray(t.reviewHistory) && t.reviewHistory.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		return typeof t.reference == "string" && t.reference.length >= 3 && typeof t.operator == "string" && t.operator.length >= 2 && typeof t.recordedAt == "string" && typeof t.summary == "string" && t.summary.length >= 3;
	}));
}) && new Set(e.map((e) => e.operationId)).size === e.length;
function ld() {
	let e = Hc(ad, cd);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function ud(e) {
	if (!Wc(ad) || !Uc(ad, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var R = {
	list() {
		return ld().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !od.includes(t)) throw Error("Invalid operation identity.");
		let r = ld(), i = r.find((t) => t.operationId === e);
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
		return ud([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = ld(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ud(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = ld(), r = n.find((t) => t.operationId === e);
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
		return ud(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = ld(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ud(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = ld(), a = i.find((t) => t.operationId === e);
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
		return ud(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = ld(), a = i.find((t) => t.operationId === e);
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
		return ud(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	getUnresolved() {
		return ld().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
	}
};
o("financialOperations", {
	repository: R,
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
var dd = /* @__PURE__ */ new Map(), fd = "htt.purchasePosting.operations.v1";
function pd() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function md() {
	let e = pd();
	if (e) try {
		e.setItem(fd, JSON.stringify([...dd.values()]));
	} catch {}
}
function hd() {
	let e = pd();
	if (e) try {
		let t = JSON.parse(e.getItem(fd) ?? "[]");
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
			dd.set(t.key, {
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
hd();
var gd = /* @__PURE__ */ new Set(), _d = /* @__PURE__ */ new Map(), vd = /* @__PURE__ */ new Map(), yd;
function bd() {
	md(), gd.forEach((e) => e());
}
var z = {
	injectFailureBeforeStep(e, t, n = 1) {
		vd.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		vd.clear();
	},
	registerRecovery(e, t) {
		if (!dd.has(e)) throw Error(`Unknown posting operation: ${e}`);
		_d.set(e, t);
	},
	runStep(e, t, n) {
		let r = dd.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = vd.get(i) ?? 0;
		if (a > 0) throw vd.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return _d.has(e);
	},
	recover(e) {
		let t = dd.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = _d.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (yd === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		yd = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			yd = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = dd.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...dd.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return gd.add(e), () => {
			gd.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if (dd.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return dd.set(n, r), bd(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = dd.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		dd.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), bd();
	},
	completeStep(e, t) {
		let n = dd.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (dd.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), bd());
	}
};
o("purchaseOperations", {
	repository: z,
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
	snapshot: () => z.getAll(),
	restore: (e) => {
		dd.clear(), _d.clear();
		for (let t of e) dd.set(t.key, t);
	},
	publish: () => gd.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var xd = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Sd(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${xd.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function B() {
	Sd(R.list(), z.getAll());
}
//#endregion
//#region src/features/sales/data/quoteStorage.ts
var Cd = "htt.mock.sales.quotes.v1", wd = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function Td(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !wd.has(String(t.status)) || ![
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
function Ed() {
	return Hc(Cd, Td);
}
function Dd(e) {
	if (Ed().status === "invalid" || !Wc("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!Uc("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var Od = "htt.mock.sales.quote-orders.v1";
function kd(e) {
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
function Ad(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!Td(t.quotes) || !kd(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function jd() {
	return Hc(Od, Ad);
}
function Md(e) {
	if (!Ad(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = jd(), n = Ed();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !Wc("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!Uc("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var Nd = "htt.mock.sales.documents.v1";
function Pd(e) {
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
function Fd(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!Ad(t) || !Pd(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function Id() {
	return Hc(Nd, Fd);
}
function Ld(e) {
	if (!Fd(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = Id();
	if (t.status === "invalid" || t.status === "unavailable" || !Wc("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!Uc("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var Rd = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function zd(e) {
	let t = e.filter((e) => Rd.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function Bd() {
	zd(R.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var Vd = [{
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
}], Hd = [{
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
}], Ud = [{
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
}], Wd = "htt.mock.sales.credit-notes.v1", Gd = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, Kd = (e) => typeof e == "string" && e.length > 0;
function qd(e) {
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
		].every((e) => Kd(t[e])) || ![
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
		].every((e) => Gd(i[e])) || !Gd(t.amountApplied) || !Gd(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => Kd(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !Gd(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		if (Math.abs(t - e.amountApplied) > .011) return !1;
		let n = e.refundEvents ?? [];
		if (!Array.isArray(n) || n.some((e) => !e || !Kd(e.id) || !Kd(e.date) || !Gd(e.amount) || e.amount <= 0 || e.reversalDate !== void 0 && !Kd(e.reversalDate)) || new Set(n.map((e) => e.id)).size !== n.length) return !1;
		let r = n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0);
		return !Gd(e.amountRefunded ?? 0) || Math.abs(r - (e.amountRefunded ?? 0)) > .011 || t + r > e.totals.total + .011 ? !1 : e.status === "VOID" ? t === 0 && r === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t - r)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function Jd() {
	return Hc(Wd, qd);
}
function Yd(e) {
	if (!qd(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = Jd();
	if (t.status === "invalid" || t.status === "unavailable" || !Wc("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!Uc("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var Xd = /* @__PURE__ */ new Set(), Zd = Jd(), Qd = Zd.status === "ok" ? structuredClone(Zd.data.creditNotes) : [], $d = Zd.status === "ok" ? structuredClone(Zd.data.allocations) : [], ef = [...Qd], tf = [...$d];
function nf() {
	ef = [...Qd], tf = [...$d], Xd.forEach((e) => e());
}
function rf(e, t) {
	Yd({
		creditNotes: e,
		allocations: t
	}), Qd = e, $d = t, nf();
}
var V = {
	subscribe(e) {
		return Xd.add(e), () => {
			Xd.delete(e);
		};
	},
	getSnapshot() {
		return ef;
	},
	getAllocationSnapshot() {
		return tf;
	},
	getAll() {
		return ef;
	},
	getAllAllocations() {
		return tf;
	},
	getById(e) {
		return Qd.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Qd.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Qd.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return $d.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return $d.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if (Qd.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return rf([e, ...Qd], $d), e;
	},
	update(e) {
		if (!Qd.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return rf(Qd.map((t) => t.id === e.id ? e : t), $d), e;
	},
	createAllocation(e) {
		if ($d.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return rf(Qd, [e, ...$d]), e;
	},
	updateAllocation(e) {
		if (!$d.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return rf(Qd, $d.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!Qd.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = $d.some((t) => t.id === e.id) ? $d.map((t) => t.id === e.id ? e : t) : [e, ...$d];
		rf(Qd.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return $d.find((t) => t.id === e);
	}
};
o("customerCredits", {
	repository: V,
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
			rd(n.recipient);
			for (let e of n.lines) td(e), Yu(e, t.products.products.find((t) => t.id === e.productId));
		}
	},
	snapshot: () => ({
		creditNotes: Qd,
		allocations: $d
	}),
	restore: (e) => {
		Qd = e.creditNotes, $d = e.allocations, ef = [...Qd], tf = [...$d];
	},
	publish: () => Xd.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/customerPricingStorage.ts
var af = "htt.mock.contacts.customerPricing.v1";
function of(e) {
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
function sf() {
	return Hc(af, of);
}
function cf(e) {
	if (sf().status === "invalid" || !Wc("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!Uc("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var lf = [
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
], uf = /* @__PURE__ */ new Set(), df = sf(), ff = df.status === "ok" ? df.data : structuredClone(lf);
function pf() {
	uf.forEach((e) => {
		e();
	});
}
function mf(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function hf(e) {
	return e.trim() || void 0;
}
function gf(e, t) {
	let n = Zu(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = n.units.find((e) => e.id === t);
	if (!r) throw Error(`Unit ${t} does not belong to product ${e}`);
	if (!r.active) throw Error("The selected product unit is inactive");
	return {
		product: n,
		unit: r
	};
}
function _f(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function vf({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = ff.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : _f(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = Cf(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function yf(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function bf(e) {
	let t = Qu(e.productId, e.unitId);
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
var xf = {
	subscribe(e) {
		return uf.add(e), () => {
			uf.delete(e);
		};
	},
	getSnapshot() {
		return ff;
	},
	getAll() {
		return ff;
	},
	getById(e) {
		return ff.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return ff.filter((t) => t.customerId === e);
	},
	create(e, t) {
		gf(t.productId, t.unitId);
		let n = hf(t.effectiveTo);
		t.active && vf({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = yf(t), a = {
			id: mf("cprice"),
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
		}, o = [a, ...ff];
		return cf(o), ff = o, pf(), a;
	},
	update(e, t) {
		let n = xf.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		gf(t.productId, t.unitId);
		let r = hf(t.effectiveTo);
		t.active && vf({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = yf(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = ff.map((t) => t.id === e ? a : t);
		return cf(o), ff = o, pf(), a;
	},
	resolve(e) {
		return bf(e);
	},
	resolvePrice(e, t, n, r) {
		let a = xf.resolveBasePrice(e, t, n, r.slice(0, 10)), o = i({
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
		let { unit: i } = gf(t, n), a = ff.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && Sf(r, i.effectiveFrom, i.effectiveTo));
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
		let o = bf(a);
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
function Sf(e, t, n) {
	return !(e < t || n && e > n);
}
function Cf(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
o("customerPrices", {
	repository: xf,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: ff }),
	restore: (e) => {
		ff = e.customerPrices;
	},
	publish: () => uf.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
function wf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Tf({ quantity: e, standardUnitPrice: t, unitPrice: n, taxRate: r = s(), inclusiveLineTotal: i }) {
	let a = wf(e * n), o = wf(i === void 0 ? a * r : i - a), c = wf(a + o), l = wf(t - n);
	return {
		discountAmount: l,
		discountPercent: t > 0 ? wf(l / t * 100) : 0,
		lineSubtotal: a,
		taxAmount: o,
		lineTotal: c
	};
}
function Ef(e) {
	let t = wf(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = wf(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: wf(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function Df({ customerId: e, documentDate: t, draft: i }) {
	if (i.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let o = Zu(i.productId);
	if (!o) throw Error(`Product ${i.productId} was not found`);
	if (o.status !== "ACTIVE") throw Error(`${o.name} is inactive`);
	let c = Qu(i.productId, i.unitId);
	if (!c) throw Error(`Unit ${i.unitId} was not found for ${o.name}`);
	let l = xf.resolvePrice(e, i.productId, i.unitId, t), u = i.unitPrice !== void 0, d = u ? i.unitPrice : l.effectivePrice;
	if (!Number.isFinite(d) || d < 0) throw Error("Unit price cannot be negative");
	let f = ed(i.productId, i.unitId, i.quantity, i.requestedArea);
	if (id(i.productId, i.unitId, f.quantity, "sell"), o.sellEnabled === !1) throw Error("Product is not available for selling.");
	let p = o.taxCode ?? n().gstCode, m = s(p), h = u ? r(d, m, i.priceBasis) : d, g = Tf({
		taxRate: m,
		inclusiveLineTotal: u && (i.priceBasis ?? n().basis) === "Inclusive" ? Math.round(f.quantity * d * 100) / 100 : void 0,
		quantity: f.quantity,
		standardUnitPrice: l.basePrice,
		unitPrice: h
	});
	return {
		id: Of("line"),
		itemType: o.itemType ?? "STOCK",
		...f,
		...a(p),
		priceBasis: u ? i.priceBasis ?? n().basis : "Exclusive",
		grossUnitPrice: u && (i.priceBasis ?? n().basis) === "Inclusive" ? d : void 0,
		promotionId: u ? void 0 : l.promotionId,
		productId: o.id,
		unitId: c.id,
		sku: o.sku,
		description: o.name,
		unitSymbol: c.symbol,
		quantity: f.quantity,
		standardUnitPrice: l.basePrice,
		unitPrice: h,
		priceSource: u ? "MANUAL" : l.source,
		customerPriceId: u ? void 0 : l.customerPrice?.id,
		...g
	};
}
function Of(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var kf = /* @__PURE__ */ new Set(), Af = P.read().payments;
function jf() {
	kf.forEach((e) => e());
}
function Mf() {
	return `payment_${crypto.randomUUID()}`;
}
function Nf() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Af.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var Pf = {
	subscribe(e) {
		return kf.add(e), () => {
			kf.delete(e);
		};
	},
	getSnapshot() {
		return Af;
	},
	getAll() {
		return Af;
	},
	getById(e) {
		return Af.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Af.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Af.filter((t) => t.invoiceId === e);
	},
	create(e) {
		if (!e.customerId) throw Error("Customer is required");
		if (!e.invoiceId) throw Error("Invoice is required");
		if (!e.paymentDate) throw Error("Payment date is required");
		if (!e.bankAccountId) throw Error("Bank account is required");
		let t = Ku.getById(e.bankAccountId);
		if (!t) throw Error("Bank account was not found");
		if (!t.active) throw Error("The selected bank account is inactive");
		if (!Number.isFinite(e.amount) || e.amount <= 0) throw Error("Payment amount must be greater than zero");
		if (p(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (If(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = R.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: If(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: Ff(e.reference),
				notes: Ff(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = Af.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Mf(),
			paymentNumber: Nf(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: If(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: Ff(e.reference),
			notes: Ff(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && R.bindResult(n, i.id);
		let a = [i, ...Af];
		if (P.update("payments", a), Af = a, n && !e.deferOperationCompletion) try {
			R.complete(n, i.id);
		} catch (e) {
			try {
				R.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return jf(), i;
	},
	reverse(e, t) {
		let n = Af.find((t) => t.id === e);
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
		}, o = Af.map((t) => t.id === e ? a : t);
		return P.update("payments", o), Af = o, jf(), a;
	},
	getReceivedByInvoice(e) {
		return Af.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function Ff(e) {
	return e?.trim() || void 0;
}
function If(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
o("customerPayments", {
	repository: Pf,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null
	},
	snapshot: () => ({ payments: Af }),
	restore: (e) => {
		Af = e.payments;
	},
	publish: () => kf.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/taxPosting.ts
function Lf(e, t, n, r) {
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
function Rf(e) {
	return I.requireBySystemRole(e).id;
}
function zf(e) {
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
function Bf(e, t) {
	return L.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Vf(e, t) {
	let n = Bf(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Hf = {
	postInvoice(e) {
		return Bf("CUSTOMER_INVOICE", e.id) || L.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: Rf("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: Rf("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				...Lf(e.lines, "collected", !1, e.totals.taxAmount)
			]
		});
	},
	reverseInvoice(e) {
		let t = Vf("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? L.getById(t.reversalJournalEntryId) : void 0 : L.reverse({
			journalEntryId: t.id,
			reversalDate: zf(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = Bf("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = Ku.requireById(e.bankAccountId);
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
				accountId: Rf("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = Vf("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? L.getById(t.reversalJournalEntryId) : void 0 : L.reverse({
			journalEntryId: t.id,
			reversalDate: zf(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return Bf("CREDIT_NOTE", e.id) || L.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: Rf("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				...Lf(e.lines, "collected", !0, e.totals.taxAmount),
				{
					accountId: Rf("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = Vf("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? L.getById(t.reversalJournalEntryId) : void 0 : L.reverse({
			journalEntryId: t.id,
			reversalDate: zf(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, Uf = /* @__PURE__ */ new Set(), Wf = Id(), Gf = jd(), Kf = Ed(), qf = Wf.status === "ok" ? structuredClone(Wf.data.quotes) : Gf.status === "ok" ? structuredClone(Gf.data.quotes) : Kf.status === "ok" ? structuredClone(Kf.data) : structuredClone(Vd);
function Jf(e) {
	Wf.status === "ok" || Id().status !== "empty" ? Ld({
		quotes: e,
		salesOrders: Yf,
		invoices: H
	}) : Gf.status === "ok" || jd().status !== "empty" ? Md({
		quotes: e,
		salesOrders: Yf
	}) : Dd(e), qf = e, $f();
}
var Yf = Wf.status === "ok" ? structuredClone(Wf.data.salesOrders) : Gf.status === "ok" ? structuredClone(Gf.data.salesOrders) : structuredClone(Hd), H = Wf.status === "ok" ? structuredClone(Wf.data.invoices) : structuredClone(Ud);
function Xf(e) {
	Ld({
		quotes: qf,
		salesOrders: Yf,
		invoices: e
	}), H = e, $f();
}
function Zf(e, t = qf) {
	Wf.status === "ok" || Id().status !== "empty" ? Ld({
		quotes: t,
		salesOrders: e,
		invoices: H
	}) : Md({
		quotes: t,
		salesOrders: e
	}), Yf = e, qf = t, $f();
}
var Qf = ep();
function $f() {
	Qf = ep(), Uf.forEach((e) => e());
}
function ep() {
	return [
		...qf,
		...Yf,
		...H
	];
}
var U = {
	createManagedOrder(e) {
		let t = Yf.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: rp("order"),
			managedDraftId: e.draftId,
			type: "SALES_ORDER",
			status: "CONFIRMED",
			documentNumber: ip("SO", Yf.map((e) => e.documentNumber)),
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
		return Zf([r, ...Yf]), r;
	},
	createManagedInvoice(e) {
		let t = H.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = U.createManagedOrder(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: rp("invoice"),
			managedDraftId: e.draftId,
			type: "INVOICE",
			status: "ISSUED",
			documentNumber: ip("INV", H.map((e) => e.documentNumber)),
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
		}, a = Yf.map((e) => e.id === n.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: r
		} : e);
		return Ld({
			quotes: qf,
			salesOrders: a,
			invoices: [i, ...H]
		}), Yf = a, H = [i, ...H], $f(), Hf.postInvoice(i), i;
	},
	cancelManagedOrder(e, t) {
		let n = Yf.find((t) => t.id === e);
		if (!n?.managedDraftId) throw Error("Managed order not found.");
		if (n.status === "CANCELLED") return n;
		if (n.invoiceIds.some((e) => H.some((t) => t.id === e && t.status !== "VOID"))) throw Error("Void active invoices before cancelling the order.");
		if (n.status === "PARTIALLY_FULFILLED" || n.status === "FULFILLED" || n.fulfilmentStatus === "PARTIALLY_FULFILLED" || n.fulfilmentStatus === "FULFILLED") throw Error("Reverse active fulfilments before cancelling the order.");
		if (t.trim().length < 3) throw Error("Cancellation reason is required.");
		let r = {
			...n,
			status: "CANCELLED",
			notes: (n.notes ?? "") + "\nCancelled: " + t.trim(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Zf(Yf.map((t) => t.id === e ? r : t)), r;
	},
	subscribe(e) {
		return Uf.add(e), () => {
			Uf.delete(e);
		};
	},
	getSnapshot() {
		return Qf;
	},
	getAll() {
		return Qf;
	},
	getById(e) {
		return Qf.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Qf.filter((t) => t.customerId === e);
	},
	getQuotesByCustomer(e) {
		return qf.filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return Yf.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return H.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (tp(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = e.lines.map((t) => Df({
			customerId: e.customerId,
			documentDate: e.documentDate,
			draft: t
		})), n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: rp("quote"),
			type: "QUOTE",
			documentNumber: ip("QU", qf.map((e) => e.documentNumber)),
			recipient: nd(e.customerId, e),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: np(e.customerReference),
			notes: np(e.notes),
			lines: t,
			totals: Ef(t),
			createdAt: n,
			updatedAt: n
		};
		return Jf([r, ...qf]), r;
	},
	updateDraftQuote(e, t) {
		let r = qf.find((t) => t.id === e);
		if (!r) throw Error(`Quote ${e} was not found`);
		if (r.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let i = t.lines.map((e) => {
			if (e.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
			if (!Number.isFinite(e.standardUnitPrice) || !Number.isFinite(e.unitPrice) || e.standardUnitPrice < 0 || e.unitPrice < 0) throw Error("Sales prices cannot be negative");
			let t = ed(e.productId, e.unitId, e.quantity, e.requestedArea);
			id(e.productId, e.unitId, t.quantity, "sell");
			let i = Zu(e.productId)?.taxCode ?? n().gstCode, o = Tf({
				taxRate: s(i),
				quantity: t.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice
			}), c = r.lines.find((t) => t.id === e.lineId);
			return {
				itemType: Zu(e.productId)?.itemType ?? "STOCK",
				...t,
				id: c?.id ?? rp("line"),
				productId: e.productId,
				unitId: e.unitId,
				sku: sp(e.productId, e.unitId).sku,
				description: sp(e.productId, e.unitId).description,
				unitSymbol: sp(e.productId, e.unitId).unitSymbol,
				quantity: t.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice,
				priceSource: e.priceSource,
				customerPriceId: e.customerPriceId,
				...a(i),
				...o
			};
		}), o = {
			...r,
			recipient: t.locationId === void 0 && t.accountingContactId === void 0 ? r.recipient : nd(r.customerId, t),
			documentDate: t.documentDate,
			expiryDate: t.expiryDate,
			customerReference: np(t.customerReference),
			notes: np(t.notes),
			lines: i,
			totals: Ef(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Jf(qf.map((t) => t.id === e ? o : t)), o;
	},
	sendQuote(e) {
		let t = qf.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return Jf(qf.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = qf.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return Jf(qf.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = qf.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return Jf(qf.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = qf.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: rp("order"),
			type: "SALES_ORDER",
			documentNumber: ip("SO", Yf.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: ap(),
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
		return Zf([r, ...Yf], qf.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = Yf.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED" && n.status !== "INVOICED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: n.status === "INVOICED" ? "INVOICED" : t,
			fulfilmentStatus: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Zf(Yf.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = Yf.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = ap(), a = {
			id: rp("invoice"),
			managedDraftId: t.managedDraftId,
			type: "INVOICE",
			documentNumber: ip("INV", H.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: i,
			dueDate: op(i, Number(n().terms)),
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
		}, o = [a, ...H], s = Yf.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, a.id],
			updatedAt: r
		} : e);
		return Ld({
			quotes: qf,
			salesOrders: s,
			invoices: o
		}), H = o, Yf = s, $f(), Hf.postInvoice(a), a;
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
			if (n.areaPerPack && !Number.isInteger(e.quantity)) throw Error("Area-based lines must be credited in whole packs.");
			let i = V.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id).reduce((e, t) => e + t.quantity, 0);
			if (e.quantity + i > n.quantity + 1e-8) throw Error("Credit quantity cannot exceed the original invoice quantity.");
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = V.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id), s = e.quantity + i >= n.quantity - 1e-8, c = cp(s ? n.lineSubtotal - o.reduce((e, t) => e + t.lineSubtotal, 0) : n.lineSubtotal * e.quantity / n.quantity), l = cp(s ? n.taxAmount - o.reduce((e, t) => e + t.taxAmount, 0) : n.taxAmount * e.quantity / n.quantity);
			return {
				...n,
				requestedArea: e.quantity === n.quantity ? n.requestedArea : void 0,
				coveredArea: n.areaPerPack ? Math.round(e.quantity * n.areaPerPack * 1e8) / 1e8 : void 0,
				quantity: e.quantity,
				taxRate: a,
				lineSubtotal: c,
				taxAmount: l,
				lineTotal: cp(c + l)
			};
		}), a = Ef(i);
		if (a.total <= 0) throw Error("Credit note total must be greater than zero");
		if (cp(cp(V.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + a.total) > cp(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: rp("credit-note"),
			creditNoteNumber: ip("CN", V.getAll().map((e) => e.creditNoteNumber)),
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
		return V.create(s), Hf.postCreditNote(s), s;
	},
	applyCreditToInvoice(e) {
		B(), Bd();
		let t = V.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		let n = H.find((t) => t.id === e.invoiceId);
		if (!n) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void credit note cannot be applied");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be applied");
		if (n.status === "VOID") throw Error("Credit cannot be applied to a void invoice");
		if (n.status === "DRAFT") throw Error("Credit cannot be applied to a draft invoice");
		if (t.customerId !== n.customerId) throw Error("Credit note and invoice must belong to the same customer");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the credit note date");
		let r = cp(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = V.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: rp("credit-allocation"),
			allocationNumber: ip("CA", V.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = cp(i.amountApplied + r), c = cp(Math.max(0, i.totals.total - (i.amountRefunded ?? 0) - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
		if (R.begin(l, "SALES_CREDIT_APPLY", JSON.stringify({
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: r
		})).status !== "started") throw Error("Credit allocation was previously attempted; manual review required.");
		try {
			R.bindResult(l, o.id), V.commitAllocationAndCredit(o, {
				...i,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(n.id), R.complete(l, o.id);
		} catch (e) {
			try {
				R.flagForReview(l, "Credit allocation/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	reverseCreditAllocation(e) {
		B(), Bd();
		let t = V.getAllocationById(e.allocationId);
		if (!t) throw Error(`Credit allocation ${e.allocationId} was not found`);
		if (t.status === "REVERSED") throw Error("This credit allocation has already been reversed");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A reversal reason is required");
		let r = V.getById(t.creditNoteId);
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
		}, s = cp(V.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = cp(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - s)), l = `sales-credit-reversal:${t.id}`;
		if (R.begin(l, "SALES_CREDIT_REVERSAL", t.id).status !== "started") throw Error("Credit allocation reversal previously attempted; manual review required.");
		try {
			R.bindResult(l, t.id), V.commitAllocationAndCredit(o, {
				...r,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(i.id), R.complete(l, t.id);
		} catch (e) {
			try {
				R.flagForReview(l, "Credit reversal/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	voidCreditNote(e) {
		let t = V.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		if (t.status === "VOID") throw Error("This credit note has already been voided");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be voided here");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse customer refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required");
		if (V.getAllocationsByCreditNote(t.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this credit note");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: r,
			voidReason: n,
			updatedAt: r
		};
		return V.update(i), Hf.reverseCreditNote(i), i;
	},
	recordInvoicePayment(e) {
		if (B(), Bd(), e.operationId) {
			let t = R.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = H.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = cp(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (p(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, a = Pf.create({
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
			Hf.postPayment(a);
			let e = L.getBySource("CUSTOMER_PAYMENT", a.id).filter((e) => !e.reversedJournalEntryId);
			if (e.length !== 1 || e[0].status !== "POSTED") throw Error("Payment GL posting could not be verified uniquely.");
			R.complete(i, a.id);
		} catch (e) {
			try {
				R.flagForReview(i, "Payment or GL posting uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	voidInvoice(e, t) {
		B(), Bd();
		let n = H.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (Pf.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
		if (V.getAllocationsByInvoice(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("This invoice has applied credits. Reverse all active credit allocations before voiding the invoice.");
		if (n.managedDraftId && V.getByInvoice(n.id).some((e) => e.status !== "VOID")) throw Error("Void source credits before voiding this direct invoice.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			amountPaid: 0,
			amountDue: 0,
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		}, o = `sales-invoice-void:${e}`;
		if (R.begin(o, "SALES_INVOICE_VOID", e).status !== "started") throw Error("Invoice void was previously attempted; inspect GL and operation journal before retrying.");
		try {
			let t = L.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (t.length !== 1 || t[0].status !== "POSTED") throw Error("Invoice original GL must be uniquely posted before voiding.");
			R.bindResult(o, e), Hf.reverseInvoice(a);
			let n = L.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			Xf(H.map((t) => t.id === e ? a : t)), R.complete(o, e);
		} catch (e) {
			try {
				R.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		Dc("CUSTOMER_PAYMENT", e), B(), Bd();
		let n = Pf.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = H.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (R.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			R.bindResult(i, e);
			let n = Pf.reverse(e, t);
			Hf.reversePayment(n);
			let a = L.getBySource("CUSTOMER_PAYMENT", e).filter((e) => !e.reversedJournalEntryId);
			if (a.length !== 1 || a[0].status !== "REVERSED") throw Error("Payment GL reversal could not be verified.");
			return this.recalculateInvoiceBalance(r.id), R.complete(i, e), n;
		} catch (e) {
			try {
				R.flagForReview(i, "Payment reversal/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
	},
	recalculateInvoiceBalance(e) {
		let t = H.find((t) => t.id === e);
		if (!t) throw Error(`Invoice ${e} was not found`);
		if (t.status === "VOID") return t;
		let n = Pf.getReceivedByInvoice(e), r = V.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = cp(n.reduce((e, t) => e + t.amount, 0)), a = cp(r.reduce((e, t) => e + t.amount, 0)), o = cp(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : lp(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Xf(H.map((t) => t.id === e ? c : t)), c;
	}
};
function tp(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function np(e) {
	return e?.trim() || void 0;
}
function rp(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function ip(e, t) {
	return m(e, t, u((/* @__PURE__ */ new Date()).toISOString()).slice(0, 4));
}
function ap() {
	return u((/* @__PURE__ */ new Date()).toISOString());
}
function op(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function sp(e, t) {
	let n = Zu(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = Qu(e, t);
	if (!r) throw Error(`Unit ${t} was not found for ${n.name}`);
	return {
		sku: n.sku,
		description: n.name,
		unitSymbol: r.symbol
	};
}
function cp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function lp(e) {
	return e < up(/* @__PURE__ */ new Date());
}
function up(e) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
o("sales", {
	repository: U,
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
			rd(e.recipient);
			for (let n of e.lines) td(n), Yu(n, t.products.products.find((e) => e.id === n.productId));
		}
	},
	snapshot: () => ({
		quotes: qf,
		salesOrders: Yf,
		invoices: H
	}),
	restore: (e) => {
		qf = e.quotes, Yf = e.salesOrders, H = e.invoices, Qf = ep();
	},
	publish: () => Uf.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var dp = [
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
], fp = "htt.mock.contacts.suppliers.v1";
function pp(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var mp = Hc(fp, pp), hp = mp.status !== "invalid" && Wc(fp), gp = /* @__PURE__ */ new Set(), _p = mp.status === "ok" ? mp.data : structuredClone(dp);
function vp() {
	hp && Uc(fp, _p), gp.forEach((e) => {
		e();
	});
}
function yp(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function bp() {
	let e = _p.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function xp(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function Sp(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function Cp(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: xp(e.tradingName),
		abn: Sp(e.abn),
		status: e.status,
		email: xp(e.email),
		phone: xp(e.phone),
		website: xp(e.website),
		contactName: xp(e.contactName),
		addressLine1: xp(e.addressLine1),
		addressLine2: xp(e.addressLine2),
		suburb: xp(e.suburb),
		state: xp(e.state),
		postcode: xp(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: xp(e.notes)
	};
}
var wp = {
	subscribe(e) {
		return gp.add(e), () => {
			gp.delete(e);
		};
	},
	getSnapshot() {
		return _p;
	},
	getAll() {
		return _p;
	},
	getById(e) {
		return _p.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: yp("sup"),
			code: bp(),
			...Cp(e),
			currency: n().currency,
			createdAt: t,
			updatedAt: t
		};
		return _p = [r, ..._p], vp(), r;
	},
	update(e, t) {
		let n = wp.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...Cp(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return _p = _p.map((t) => t.id === e ? r : t), vp(), r;
	}
};
o("suppliers", {
	repository: wp,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: _p }),
	restore: (e) => {
		_p = e.suppliers;
	},
	publish: () => gp.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
function Tp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ep({ orderedQuantity: e, unitCost: t, taxRate: n = s(), inclusiveLineTotal: r }) {
	let i = Tp(e * t), a = Tp(r === void 0 ? i * n : r - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: Tp(i + a)
	};
}
function Dp(e) {
	let t = Tp(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Tp(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: Tp(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var Op = /* @__PURE__ */ new Set(), kp = P.read().purchaseOrders;
P.onRollback(() => {
	kp = P.read().purchaseOrders;
});
function Ap() {
	try {
		P.update("purchaseOrders", kp);
	} catch (e) {
		throw kp = P.read().purchaseOrders, e;
	}
	Op.forEach((e) => P.notify(e));
}
function jp(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Mp(e) {
	return m("PO", kp.map((e) => e.purchaseOrderNumber), e.slice(0, 4));
}
function Np(e) {
	return e?.trim() || void 0;
}
function Pp(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = Xu.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let i = t.units.find((t) => t.id === e.unitId);
		if (!i) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!i.active) throw Error(`${i.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		if (id(e.productId, e.unitId, e.orderedQuantity, "buy"), t.buyEnabled === !1) throw Error("Product is not available for purchasing.");
		let o = t.taxCode ?? n().gstCode, c = s(o), l = Ep({
			taxRate: c,
			inclusiveLineTotal: (e.priceBasis ?? n().basis) === "Inclusive" ? Math.round(e.orderedQuantity * e.unitCost * 100) / 100 : void 0,
			orderedQuantity: e.orderedQuantity,
			unitCost: r(e.unitCost, c, e.priceBasis)
		});
		return {
			id: jp("pol"),
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
function Fp(e) {
	let t = wp.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function Ip(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var Lp = {
	subscribe(e) {
		return Op.add(e), () => {
			Op.delete(e);
		};
	},
	getSnapshot() {
		return kp;
	},
	getAll() {
		return kp;
	},
	getById(e) {
		return kp.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return kp.filter((t) => t.supplierId === e);
	},
	create(e) {
		Ip(e);
		let t = Fp(e.supplierId), n = Pp(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: jp("po"),
			purchaseOrderNumber: Mp(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: Np(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: Np(e.supplierReference),
			notes: Np(e.notes),
			lines: n,
			totals: Dp(n),
			createdAt: r,
			updatedAt: r
		};
		return kp = [i, ...kp], Ap(), i;
	},
	updateDraft(e, t) {
		let n = Lp.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		Ip(t);
		let r = Fp(t.supplierId), i = Pp(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: Np(t.expectedDeliveryDate),
			supplierReference: Np(t.supplierReference),
			notes: Np(t.notes),
			lines: i,
			totals: Dp(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return kp = kp.map((e) => e.id === n.id ? a : e), Ap(), a;
	},
	approve(e) {
		let t = Lp.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return Rp(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = Lp.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return Rp(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = Lp.getById(e);
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
		return kp = kp.map((e) => e.id === n.id ? o : e), Ap(), o;
	},
	recordSupplierBill(e, t) {
		let n = Lp.getById(e);
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
			let n = zp(e.billedQuantity + t);
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
		return kp = kp.map((e) => e.id === n.id ? c : e), Ap(), c;
	},
	reverseSupplierBill(e, t) {
		let n = Lp.getById(e);
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
				billedQuantity: zp(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return kp = kp.map((e) => e.id === n.id ? c : e), Ap(), c;
	},
	cancel(e, t) {
		let n = Lp.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return Rp(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function Rp(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return kp = kp.map((t) => t.id === e.id ? n : t), Ap(), n;
}
function zp(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
o("purchaseOrders", {
	repository: Lp,
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
	snapshot: () => ({ purchaseOrders: kp }),
	restore: (e) => {
		kp = e.purchaseOrders;
	},
	publish: () => Op.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function W(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Bp(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function Vp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Hp({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return Bp(e / t);
}
function Up({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return Vp(e * t);
}
function Wp({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = W(e + n), a = Vp(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : Bp(a / i)
	};
}
function Gp({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return Vp(e * t);
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function Kp(e) {
	return Vp(e.lines.reduce((e, t) => {
		let n = Hp({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + Up({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function qp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Jp(e) {
	return I.requireBySystemRole(e).id;
}
function Yp(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	if (/^\d{4}-\d{2}-\d{2}$/.test(e)) return e;
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
function Xp(e, t) {
	return L.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Zp(e, t) {
	let n = Xp(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Qp = {
	validateGoodsReceiptPosting(e) {
		let t = I.requireBySystemRole("INVENTORY"), n = I.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = Kp(e);
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
		let a = qp(e.totals.subtotal - t);
		if (a !== 0) {
			let e = I.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = qp(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = Xp("SUPPLIER_BILL", e.id);
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
					accountId: Jp("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				...Lf(e.lines, "paid", !0, e.totals.taxAmount),
				...i === 0 ? [] : [{
					accountId: Jp("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: Jp("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = Zp("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? L.getById(t.reversalJournalEntryId) : void 0 : L.reverse({
			journalEntryId: t.id,
			reversalDate: Yp(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = Xp("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = Ku.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return L.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: Jp("ACCOUNTS_PAYABLE"),
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
		let t = Zp("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? L.getById(t.reversalJournalEntryId) : void 0 : L.reverse({
			journalEntryId: t.id,
			reversalDate: Yp(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return Xp("SUPPLIER_CREDIT", e.id) || L.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: Jp("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				...e.lines.reduce((e, t) => {
					let n = t.expenseAccountId ?? Jp("PURCHASE_PRICE_VARIANCE"), r = e.find((e) => e.accountId === n);
					return r ? r.credit = Math.round((r.credit + t.lineSubtotal) * 100) / 100 : t.lineSubtotal && e.push({
						accountId: n,
						debit: 0,
						credit: t.lineSubtotal
					}), e;
				}, []),
				...Lf(e.lines, "paid", !1, e.totals.taxAmount)
			]
		});
	},
	reverseSupplierCredit(e) {
		for (let t of L.getBySource("SUPPLIER_CREDIT_RECLASS", e.id).filter((e) => e.status === "POSTED")) L.reverse({
			journalEntryId: t.id,
			reversalDate: Yp(e.voidedAt),
			reason: e.voidReason ?? "Credit void"
		});
		let t = Zp("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? L.getById(t.reversalJournalEntryId) : void 0 : L.reverse({
			journalEntryId: t.id,
			reversalDate: Yp(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, $p = structuredClone([{
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
}]), em = {
	getAll() {
		return $p;
	},
	getById(e) {
		return $p.find((t) => t.id === e);
	},
	getActive() {
		return $p.filter((e) => e.status === "ACTIVE");
	}
}, tm = /* @__PURE__ */ new Set(), nm = [];
function rm() {
	tm.forEach((e) => e());
}
function im() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = nm.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var am = {
	subscribe(e) {
		return tm.add(e), () => {
			tm.delete(e);
		};
	},
	getSnapshot() {
		return nm;
	},
	getAll() {
		return nm;
	},
	getByReference(e, t) {
		return nm.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return nm.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return nm.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: im(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return nm = [t, ...nm], rm(), t;
	}
};
o("inventoryMovements", {
	repository: am,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: nm }),
	restore: (e) => {
		nm = e.movements;
	},
	publish: () => tm.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var om = /* @__PURE__ */ new Set(), sm = [];
function cm() {
	om.forEach((e) => e());
}
var lm = {
	subscribe(e) {
		return om.add(e), () => {
			om.delete(e);
		};
	},
	getSnapshot() {
		return sm;
	},
	getAll() {
		return sm;
	},
	getBalance(e, t) {
		return sm.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = lm.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return sm = sm.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? sm.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...sm], cm(), e;
	},
	replaceAll(e) {
		sm = e, cm();
	},
	clear() {
		sm = [], cm();
	}
};
o("costBalances", {
	repository: lm,
	read: "inventory.cost.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: sm }),
	restore: (e) => {
		sm = e.balances;
	},
	publish: () => om.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var um = /* @__PURE__ */ new Set(), dm = [];
function fm() {
	um.forEach((e) => e());
}
function pm() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = dm.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function mm(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var hm = {
	subscribe(e) {
		return um.add(e), () => {
			um.delete(e);
		};
	},
	getSnapshot() {
		return dm;
	},
	getAll() {
		return dm;
	},
	getByReference(e, t) {
		return dm.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return dm.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return dm.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return dm.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return mm(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: pm(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = hm.build(e);
		return dm = [t, ...dm], fm(), t;
	},
	replaceAll(e) {
		dm = e, fm();
	},
	clear() {
		dm = [], fm();
	}
};
o("costMovements", {
	repository: hm,
	read: "inventory.cost.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: dm }),
	restore: (e) => {
		dm = e.movements;
	},
	publish: () => um.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var gm = /* @__PURE__ */ new Set(), _m = "2026-01-01T00:00:00.000Z", vm = Xu.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: _m,
	updatedAt: _m
}));
function ym() {
	gm.forEach((e) => e());
}
var bm = {
	ensureProductPolicy(e, t, n) {
		let r = vm.find((t) => t.productId === e), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			productId: e,
			baseUnitId: t,
			active: n ? r?.active ?? !0 : !1,
			costingMethod: "MOVING_WEIGHTED_AVERAGE",
			createdAt: r?.createdAt ?? i,
			updatedAt: i
		};
		return vm = [...vm.filter((t) => t.productId !== e), a], ym(), a;
	},
	subscribe(e) {
		return gm.add(e), () => {
			gm.delete(e);
		};
	},
	getSnapshot() {
		return vm;
	},
	getAll() {
		return vm;
	},
	getByProductId(e) {
		return vm.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = bm.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		if (t && !qu(Zu(e) ?? { itemType: "SERVICE" })) throw Error("Inventory costing cannot be enabled for non-stock/service items.");
		let n = {
			...bm.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return vm = vm.map((t) => t.productId === e ? n : t), ym(), n;
	}
};
o("costingPolicies", {
	repository: bm,
	read: "inventory.cost.read",
	commands: {
		ensureProductPolicy: null,
		setActive: "accounting.post"
	},
	snapshot: () => ({ policies: vm }),
	restore: (e) => {
		vm = e.policies;
	},
	publish: () => gm.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function xm(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function Sm(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function Cm(e, t) {
	let n = Zu(e);
	if (!n) throw Error("Product was not found.");
	if (!qu(n)) throw Error("Non-stock/service items cannot move inventory value.");
	let r = bm.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = Qu(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function wm(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = Vp(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(Vp(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function Tm(e) {
	if (e && hm.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function Em({ movement: e, balance: t }) {
	let n = hm.getAll(), r = lm.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	hm.replaceAll(i), lm.replaceAll(a);
}
function Dm(e) {
	if (xm(e.quantity), Sm(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	Tm(e.inventoryMovementId);
	let { policy: t, unit: n } = Cm(e.productId, e.unitId), r = W(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = Hp({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = Up({
		quantityBase: r,
		unitCostBase: i
	}), o = lm.getBalance(e.siteId, e.productId);
	o && wm(o, t.baseUnitId);
	let s = Wp({
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
	wm(l, t.baseUnitId);
	let u = hm.build({
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
	return Em({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function Om(e) {
	xm(e.quantity), Sm(e.occurredAt), Tm(e.inventoryMovementId);
	let { policy: t, unit: n } = Cm(e.productId, e.unitId), r = W(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = lm.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (wm(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = Bp(i.averageCostPerBaseUnit), o = Gp({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = W(i.quantityOnHand - r), c = s === 0, l = Vp(c ? -i.inventoryValue : -o), u = c ? 0 : Vp(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : Bp(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	wm(p, t.baseUnitId);
	let m = hm.build({
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
	return Em({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function km(e) {
	if (xm(e.quantityBase), Sm(e.occurredAt), Tm(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = Zu(e.productId);
	if (!t) throw Error("Product was not found.");
	if (!qu(t)) throw Error("Non-stock/service items cannot restore inventory value.");
	let n = bm.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = W(e.quantityBase), i = Bp(e.unitCostBase), a = Vp(e.inventoryValue), o = lm.getBalance(e.siteId, e.productId);
	o && wm(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = W(s + r), u = Vp(c + a), d = l === 0 ? 0 : Bp(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	wm(p, n.baseUnitId);
	let m = hm.build({
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
	return Em({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var Am = /* @__PURE__ */ new Set(), jm = [];
function Mm() {
	Am.forEach((e) => e());
}
function Nm(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var Pm = {
	subscribe(e) {
		return Am.add(e), () => {
			Am.delete(e);
		};
	},
	getSnapshot() {
		return jm;
	},
	getAll() {
		return jm;
	},
	getBalance(e, t) {
		return jm.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = Pm.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: Nm(i.quantityOnHand + r),
				updatedAt: a
			};
			return jm = jm.map((r) => r.siteId === e && r.productId === t ? n : r), Mm(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: Nm(r),
			updatedAt: a
		};
		return jm = [o, ...jm], Mm(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = Pm.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = Nm(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return jm = jm.map((n) => n.siteId === e && n.productId === t ? o : n), Mm(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of am.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: Nm((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		jm = Array.from(e.values()), Mm();
	}
};
o("stock", {
	repository: Pm,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: jm }),
	restore: (e) => {
		jm = e.balances;
	},
	publish: () => Am.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/goodsReceiptRepository.ts
var Fm = /* @__PURE__ */ new Set(), Im = P.read().goodsReceipts;
P.onRollback(() => {
	Im = P.read().goodsReceipts;
});
function Lm() {
	try {
		P.update("goodsReceipts", Im);
	} catch (e) {
		throw Im = P.read().goodsReceipts, e;
	}
	Fm.forEach((e) => P.notify(e));
}
function Rm(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function zm(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = Im.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Bm(e) {
	return e?.trim() || void 0;
}
var Vm = {
	subscribe(e) {
		return Fm.add(e), () => {
			Fm.delete(e);
		};
	},
	getSnapshot() {
		return Im;
	},
	getAll() {
		return Im;
	},
	getById(e) {
		return Im.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return Im.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = Lp.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = em.getById(e.siteId);
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
			let r = Rm(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!Zu(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = Qu(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = Rm(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: zm(e.receiptDate),
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
			supplierDeliveryReference: Bm(e.supplierDeliveryReference),
			notes: Bm(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		Qp.validateGoodsReceiptPosting(s), B();
		let c = z.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return z.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = Zu(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				z.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = am.create({
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
				}), z.runStep(c, `COST:${r.id}`, () => {
					let t = l.get(r.id);
					if (!t) throw Error(`Missing inventory movement for ${r.id}`);
					Dm({
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
				}), z.runStep(c, `STOCK:${r.id}`, () => {
					Pm.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			z.runStep(c, "JOURNAL", () => {
				Qp.postGoodsReceipt(s);
			}), z.runStep(c, "PURCHASE_ORDER", () => {
				Lp.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), z.runStep(c, "RECEIPT", () => {
				Im = [s, ...Im], Lm();
			});
		}), z.recover(c), s;
	}
};
o("goodsReceipts", {
	repository: Vm,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: Im }),
	restore: (e) => {
		Im = e.goodsReceipts;
	},
	publish: () => Fm.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var Hm = 1e-4;
function Um(e) {
	return Vp(e);
}
function Wm(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - W(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function Gm(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function Km(e, t, n) {
	let r = Hp({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return Up({
		quantityBase: W(e * n),
		unitCostBase: r
	});
}
function qm(e, t, n) {
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
function Jm(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = qm(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), Wm(e.quantity), Gm(e.billUnitCost);
		let r = W(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > Hm);
		if (W(d.reduce((e, t) => e + t.availableQuantity, 0)) + Hm < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= Hm) break;
			let s = W(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = W(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = Up({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: Hp({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = Um(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), h = Math.abs(o.availableQuantity - s) <= Hm ? Um(p - m) : Km(s, o.receiptUnitCost, o.conversionToBase);
			if (h < 0) throw Error("Receipt cost has been overallocated.");
			let g = Um(s * e.billUnitCost), ee = Um(g - h);
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
				priceVariance: ee,
				status: "ACTIVE",
				createdAt: l
			}), o.availableQuantity = W(o.availableQuantity - s), r = W(r - s);
		}
		if (r > Hm) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = Um(Um(e.quantity * e.billUnitCost) - Um(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = Um(p.matchedBillValue + f), p.priceVariance = Um(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = W(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = W(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = Um(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = Um(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: Um(p - f)
	};
}
var Ym = {
	calculate: Jm,
	getAvailableReceiptLines(e, t, n) {
		return qm(e, t, n);
	}
}, Xm = P.read().receiptMatches;
P.onRollback(() => {
	Xm = P.read().receiptMatches;
});
var Zm = /* @__PURE__ */ new Set(), Qm = () => {
	try {
		P.update("receiptMatches", Xm);
	} catch (e) {
		throw Xm = P.read().receiptMatches, e;
	}
	Zm.forEach((e) => P.notify(e));
}, $m = {
	getAll() {
		return [...Xm];
	},
	subscribe(e) {
		return Zm.add(e), () => {
			Zm.delete(e);
		};
	},
	getSnapshot() {
		return Xm;
	},
	getByBill(e) {
		return Xm.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (Xm.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		Xm = [...Xm, ...t], Qm();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		Xm = Xm.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), Qm();
	}
};
o("receiptMatches", {
	repository: $m,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: Xm }),
	restore: (e) => {
		Xm = e.matches;
	},
	publish: () => Zm.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
function eh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function th({ quantity: e, unitCost: t, inclusiveLineTotal: n, taxRate: r = .1 }) {
	let i = eh(e * t), a = eh(n === void 0 ? i * r : n - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: eh(i + a)
	};
}
function nh(e) {
	let t = eh(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = eh(e.reduce((e, t) => e + t.taxAmount, 0)), r = eh(t + n);
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
var rh = /* @__PURE__ */ new Set(), G = P.read().supplierBills;
P.onRollback(() => {
	G = P.read().supplierBills;
});
function ih() {
	try {
		P.update("supplierBills", G);
	} catch (e) {
		throw G = P.read().supplierBills, e;
	}
	rh.forEach((e) => P.notify(e));
}
function ah(e) {
	return e?.trim() || void 0;
}
function oh(e) {
	return m("BILL", G.map((e) => e.billNumber), e.slice(0, 4));
}
var sh = {
	insertExpenseBill(e) {
		let t = G.find((t) => t.managedDraftId === e.managedDraftId);
		if (t) return t;
		if (G.some((t) => t.supplierId === e.supplierId && t.supplierInvoiceNumber.toLowerCase() === e.supplierInvoiceNumber.toLowerCase() && t.status !== "VOID")) throw Error("Supplier invoice reference already exists.");
		return G = [e, ...G], ih(), e;
	},
	subscribe(e) {
		return rh.add(e), () => {
			rh.delete(e);
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
		let r = lh(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = lh(n.totals.amountPaid + r), a = lh(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return G = G.map((t) => t.id === e ? o : t), ih(), o;
	},
	reversePayment(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = lh(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = lh(Math.max(0, n.totals.amountPaid - r)), a = lh(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return G = G.map((t) => t.id === e ? o : t), ih(), o;
	},
	applyCredit(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = lh(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = lh(n.totals.amountCredited + r), a = lh(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return G = G.map((t) => t.id === e ? o : t), ih(), o;
	},
	reverseCredit(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = lh(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = lh(Math.max(0, n.totals.amountCredited - r)), a = lh(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return G = G.map((t) => t.id === e ? o : t), ih(), o;
	},
	markVoid(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("This supplier bill has already been voided.");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required.");
		if (n.status !== "OPEN" || n.totals.amountPaid > 0 || n.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if ((ee().supplierCredits?.supplierCredits ?? P.read().supplierCredits).some((e) => e.sourceSupplierBillId === n.id && e.status !== "VOID")) throw Error("Reverse source supplier credits and linked physical returns before voiding the bill.");
		if (n.kind === "EXPENSE") {
			B();
			let e = (/* @__PURE__ */ new Date()).toISOString(), t = {
				...n,
				status: "VOID",
				voidedAt: e,
				voidReason: r,
				updatedAt: e
			};
			return Qp.reverseSupplierBill(t), G = G.map((e) => e.id === n.id ? t : e), ih(), t;
		}
		if ($m.getByBill(n.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		};
		B();
		let o = z.begin("SUPPLIER_BILL_VOID", n.id).key;
		return z.registerRecovery(o, () => {
			z.runStep(o, "REVERSAL_JOURNAL", () => {
				Qp.reverseSupplierBill(a);
			}), z.runStep(o, "PURCHASE_ORDER", () => {
				Lp.reverseSupplierBill(n.purchaseOrderId, n.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), z.runStep(o, "MATCHES", () => {
				$m.reverseForBill(n.id, r, u(i));
			}), z.runStep(o, "BILL", () => {
				G = G.map((e) => e.id === n.id ? a : e), ih();
			});
		}), z.recover(o), a;
	},
	getByPurchaseOrder(e) {
		return G.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = Lp.getById(e.purchaseOrderId);
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
			let r = ch(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = th({
				taxRate: a,
				quantity: e.quantity,
				unitCost: e.unitCost
			});
			return n.grossUnitCost !== void 0 && e.unitCost === n.unitCost && (o.taxAmount = lh(e.quantity * n.grossUnitCost - o.lineSubtotal), o.lineTotal = lh(o.lineSubtotal + o.taxAmount)), {
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
		}), o = nh(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: oh(e.billDate),
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
			notes: ah(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = Ym.calculate({
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
			receipts: Vm.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: $m.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		Qp.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), B();
		let u = z.begin("SUPPLIER_BILL", c.id).key;
		return z.registerRecovery(u, () => {
			z.runStep(u, "JOURNAL", () => {
				Qp.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), z.runStep(u, "PURCHASE_ORDER", () => {
				Lp.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), z.runStep(u, "MATCHES", () => {
				$m.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), z.runStep(u, "BILL", () => {
				G = [c, ...G], ih();
			});
		}), z.recover(u), c;
	}
};
function ch(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function lh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
o("supplierBills", {
	repository: sh,
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
	snapshot: () => ({ supplierBills: G }),
	restore: (e) => {
		G = e.supplierBills;
	},
	publish: () => rh.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var uh = /* @__PURE__ */ new Set(), K = P.read().supplierCredits, dh = P.read().supplierCreditAllocations, fh = P.read().supplierCredits, ph = P.read().supplierCreditAllocations;
P.onRollback(() => {
	K = P.read().supplierCredits, dh = P.read().supplierCreditAllocations, fh = K, ph = dh;
});
function mh() {
	P.update("supplierCredits", K), P.update("supplierCreditAllocations", dh), fh = [...K], ph = [...dh], uh.forEach((e) => P.notify(e));
}
var hh = !1, q = {
	subscribe(e) {
		return uh.add(e), () => {
			uh.delete(e);
		};
	},
	getSnapshot() {
		return fh;
	},
	getAllocationSnapshot() {
		return ph;
	},
	getAll() {
		return fh;
	},
	getAllAllocations() {
		return ph;
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
		return dh.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return dh.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return dh.filter((t) => t.supplierBillId === e);
	},
	createReturnCredit(e, t) {
		let n = {
			...q.create(e),
			physicalReturnId: t
		};
		return q.update(n), n;
	},
	voidReturnCredit(e) {
		hh = !0;
		try {
			return q.voidCredit(e);
		} finally {
			hh = !1;
		}
	},
	create(e) {
		let t = sh.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (K.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!yh(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, n) => {
			let r = i.get(e.supplierBillLineId);
			if (!r) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(r.id)) throw Error(`${r.description} appears more than once in the supplier credit.`);
			a.add(r.id);
			let o = xh(e.quantity);
			if (!Number.isFinite(o) || o <= 0) throw Error(`${r.description} credit quantity must be greater than zero.`);
			if (o > r.quantity) throw Error(`${r.description} credit quantity cannot exceed the source bill quantity.`);
			let s = e.unitCost;
			if (!Number.isFinite(s) || s < 0) throw Error(`${r.description} unit cost cannot be negative.`);
			if (s > r.unitCost + 1e-8) throw Error(`${r.description} credit unit cost cannot exceed the source bill unit cost.`);
			let c = K.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.supplierBillLineId === r.id), l = Math.abs(s - r.unitCost) < 1e-8, u = c.every((e) => Math.abs(e.unitCost - r.unitCost) < 1e-8), d = l && u && Math.abs(o + c.reduce((e, t) => e + t.quantity, 0) - r.quantity) < 1e-8, f = c.reduce((e, t) => e + t.lineSubtotal, 0), p = c.reduce((e, t) => e + t.taxAmount, 0), m = bh(d ? r.lineSubtotal - f : l ? r.lineSubtotal * o / r.quantity : o * s), h = bh(d ? r.taxAmount - p : r.unitCost ? r.taxAmount * o / r.quantity * s / r.unitCost : 0);
			if (m < 0 || h < 0 || bh(m + f) > r.lineSubtotal || bh(h + p) > r.taxAmount) throw Error("Credit line value exceeds the uncredited source bill line.");
			let g = bh(m + h);
			return {
				id: vh(`supplier-credit-line-${n + 1}`),
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
		}), s = bh(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = bh(o.reduce((e, t) => e + t.taxAmount, 0)), l = bh(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (bh(bh(K.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > bh(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: vh("supplier-credit"),
			creditNumber: _h(e.creditDate),
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
		return K = [d, ...K], mh(), Qp.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = K.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = sh.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!yh(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = bh(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: vh("supplier-credit-allocation"),
			allocationNumber: gh(e.allocationDate),
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
		sh.applyCredit(n.id, r);
		let o = bh(t.amountApplied + r), s = bh(Math.max(0, t.totals.total - (t.amountRefunded ?? 0) - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return dh = [a, ...dh], K = K.map((e) => e.id === t.id ? c : e), mh(), a;
	},
	reverseAllocation(e) {
		let t = dh.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = K.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = sh.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		sh.reverseCredit(i.id, t.amount);
		let o = bh(Math.max(0, r.amountApplied - t.amount)), s = bh(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - o)), c = {
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
		return K = K.map((e) => e.id === r.id ? c : e), dh = dh.map((e) => e.id === t.id ? l : e), mh(), l;
	},
	voidCredit(e) {
		let t = K.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		if (t.physicalReturnId && !hh) throw Error("Reverse the linked physical supplier return instead of voiding its credit separately.");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse supplier refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (dh.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: hh && e.voidDate ? e.voidDate : r,
			voidReason: n,
			updatedAt: r
		};
		return K = K.map((e) => e.id === t.id ? i : e), mh(), Qp.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!dh.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return dh = dh.map((t) => t.id === e.id ? e : t), mh(), e;
	},
	update(e) {
		if (!K.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return K = K.map((t) => t.id === e.id ? e : t), mh(), e;
	}
};
function gh(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = dh.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function _h(e) {
	return m("SC", K.map((e) => e.creditNumber), e.slice(0, 4));
}
function vh(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function yh(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function bh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function xh(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var Sh = q.create;
q.create = function(...e) {
	return B(), P.transaction(() => Sh.apply(q, e));
};
var Ch = q.applyToBill;
q.applyToBill = function(...e) {
	return B(), P.transaction(() => Ch.apply(q, e));
};
var wh = q.reverseAllocation;
q.reverseAllocation = function(...e) {
	return B(), P.transaction(() => wh.apply(q, e));
};
var Th = q.voidCredit;
q.voidCredit = function(...e) {
	return B(), P.transaction(() => Th.apply(q, e));
};
var Eh = q.update;
q.update = function(...e) {
	return B(), P.transaction(() => Eh.apply(q, e));
};
var Dh = q.updateAllocation;
q.updateAllocation = function(...e) {
	return B(), P.transaction(() => Dh.apply(q, e));
}, o("supplierCredits", {
	repository: q,
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
		supplierCredits: K,
		allocations: dh
	}),
	restore: (e) => {
		K = e.supplierCredits, dh = e.allocations, fh = [...K], ph = [...dh];
	},
	publish: () => uh.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/profitAndLossService.ts
function Oh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function kh(e, t) {
	p(e, t);
}
function Ah(e, t, n, r) {
	if (kh(n, "From date"), kh(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = t.filter((e) => e.journalDate >= n && e.journalDate <= r), a = jh(e.filter((e) => e.type === "REVENUE"), i, "REVENUE"), o = jh(e.filter((e) => e.type === "EXPENSE"), i, "EXPENSE"), s = Oh(a.reduce((e, t) => e + t.amount, 0)), c = Oh(o.reduce((e, t) => e + t.amount, 0)), l = e.find((e) => e.systemRole === "SALES_REVENUE");
	if (!l) throw Error("Sales Revenue system account was not found.");
	if (l.type !== "REVENUE") throw Error("Sales Revenue system account must be a revenue account.");
	let u = e.find((e) => e.systemRole === "COST_OF_GOODS_SOLD");
	if (!u) throw Error("Cost of Goods Sold system account was not found.");
	if (u.type !== "EXPENSE") throw Error("Cost of Goods Sold system account must be an expense account.");
	let d = Oh(a.find((e) => e.accountId === l.id)?.amount ?? 0), f = Oh(o.find((e) => e.accountId === u.id)?.amount ?? 0), p = Oh(d - f);
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
		operatingExpenses: Oh(c - f),
		totalExpenses: c,
		netProfit: Oh(s - c)
	};
}
function jh(e, t, n) {
	return e.map((e) => {
		let r = 0, i = 0;
		for (let n of t) for (let t of n.lines) t.accountId === e.id && (r = Oh(r + t.debit), i = Oh(i + t.credit));
		let a = Oh(n === "REVENUE" ? i - r : r - i);
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
function Mh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Nh(e) {
	p(e);
}
function Ph(e, t) {
	let n = 0, r = 0;
	for (let i of t) for (let t of i.lines) t.accountId === e.id && (n = Mh(n + t.debit), r = Mh(r + t.credit));
	return e.type === "ASSET" || e.type === "EXPENSE" ? Mh(n - r) : Mh(r - n);
}
function Fh(e, t, n) {
	return e.filter((e) => e.type === n).map((e) => ({
		accountId: e.id,
		accountCode: e.code,
		accountName: e.name,
		amount: Ph(e, t)
	})).filter((e) => e.amount !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 }));
}
function Ih(e) {
	return Mh(e.reduce((e, t) => e + t.amount, 0));
}
function Lh(e, t, n) {
	Nh(n);
	let r = t.filter((e) => e.journalDate <= n), i = Fh(e, r, "ASSET"), a = Fh(e, r, "LIABILITY"), o = Fh(e, r, "EQUITY"), s = e.filter((e) => e.type === "REVENUE"), c = e.filter((e) => e.type === "EXPENSE"), l = Mh(s.reduce((e, t) => e + Ph(t, r), 0)), u = Mh(c.reduce((e, t) => e + Ph(t, r), 0)), d = Ih(i), f = Ih(a), p = Ih(o), m = Mh(l - u), h = Mh(p + m), g = Mh(f + h), ee = Mh(d - g);
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
		difference: ee,
		balanced: ee === 0
	};
}
//#endregion
//#region src/features/accounting/data/trialBalanceService.ts
function Rh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function zh(e, t) {
	p(e, t);
}
function Bh(e, t) {
	let n = Rh(e - t);
	return n >= 0 ? {
		debit: n,
		credit: 0
	} : {
		debit: 0,
		credit: Rh(Math.abs(n))
	};
}
function Vh(e, t, n, r) {
	if (zh(n, "From date"), zh(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = e.map((e) => {
		let i = 0, a = 0, o = 0, s = 0;
		for (let c of t) for (let t of c.lines) if (t.accountId === e.id) {
			if (c.journalDate < n) {
				i = Rh(i + t.debit), a = Rh(a + t.credit);
				continue;
			}
			c.journalDate <= r && (o = Rh(o + t.debit), s = Rh(s + t.credit));
		}
		let c = Bh(i, a), l = Bh(Rh(i + o), Rh(a + s));
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
	}).filter((e) => e.openingDebit !== 0 || e.openingCredit !== 0 || e.periodDebit !== 0 || e.periodCredit !== 0 || e.closingDebit !== 0 || e.closingCredit !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 })), a = Rh(i.reduce((e, t) => e + t.openingDebit, 0)), o = Rh(i.reduce((e, t) => e + t.openingCredit, 0)), s = Rh(i.reduce((e, t) => e + t.periodDebit, 0)), c = Rh(i.reduce((e, t) => e + t.periodCredit, 0)), l = Rh(i.reduce((e, t) => e + t.closingDebit, 0)), u = Rh(i.reduce((e, t) => e + t.closingCredit, 0)), d = Rh(l - u);
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
//#region src/features/banking/data/bankRegisterService.ts
function Hh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Uh(e, t) {
	p(e, t);
}
function Wh(e, t, n) {
	Uh(e.openingBalanceDate, "Opening balance date"), Uh(n, "As-at date");
	let r = t.filter((t) => t.journalDate >= e.openingBalanceDate && t.journalDate <= n).flatMap((t) => t.lines.filter((t) => t.accountId === e.glAccountId).map((e) => ({
		entry: t,
		line: e
	}))).sort((e, t) => {
		let n = e.entry.journalDate.localeCompare(t.entry.journalDate);
		if (n !== 0) return n;
		let r = e.entry.createdAt.localeCompare(t.entry.createdAt);
		return r === 0 ? e.line.id.localeCompare(t.line.id) : r;
	}), i = Hh(e.openingBalance), a = 0, o = 0, s = r.map(({ entry: t, line: n }) => {
		let r = Hh(n.debit), s = Hh(n.credit);
		return a = Hh(a + r), o = Hh(o + s), i = Hh(i + r - s), {
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
		openingBalance: Hh(e.openingBalance),
		moneyIn: a,
		moneyOut: o,
		closingBalance: i,
		transactionCount: s.length,
		transactions: s
	};
}
//#endregion
//#region src/features/cash-reports/cashReportService.ts
var Gh = [
	"Customer receipts & reversals",
	"Customer refunds & reversals",
	"Supplier payments & reversals",
	"Supplier refunds & reversals",
	"Bank opening adjustments",
	"Transfers across selection",
	"Other bank movements / review"
], Kh = (e) => Math.round(e * 100), qh = (e) => e / 100;
function Jh(e) {
	switch (e.sourceType) {
		case "CUSTOMER_PAYMENT":
		case "CUSTOMER_PAYMENT_REVERSAL": return Gh[0];
		case "CUSTOMER_REFUND": return Gh[1];
		case "SUPPLIER_PAYMENT":
		case "SUPPLIER_PAYMENT_REVERSAL": return Gh[2];
		case "SUPPLIER_REFUND": return Gh[3];
		case "OPENING_BALANCE": return Gh[4];
		case "BANK_TRANSFER": return Gh[5];
		default: return Gh[6];
	}
}
function Yh(e) {
	if (p(e.from, "From date"), p(e.to, "To date"), e.from > e.to) throw Error("From date must not exceed To date.");
	if (!e.currency.trim()) throw Error("Select a currency.");
	let t = new Map(e.bankAccounts.map((e) => [e.id, e]));
	if (t.size !== e.bankAccounts.length) throw Error("Duplicate bank account IDs require review.");
	if (e.bankIds && (new Set(e.bankIds).size !== e.bankIds.length || e.bankIds.some((e) => !t.has(e)))) throw Error("Invalid bank account selection.");
	let n = e.bankAccounts.filter((t) => (!e.bankIds || e.bankIds.includes(t.id)) && t.currency === e.currency);
	if (e.bankIds?.some((n) => t.get(n).currency !== e.currency)) throw Error("Selected banks must use the report currency.");
	for (let t of n) {
		if (e.bankAccounts.filter((e) => e.glAccountId === t.glAccountId).length !== 1) throw Error("Duplicate bank GL mappings require review before reporting.");
		p(t.openingBalanceDate, "Bank opening date");
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
		let n = Wh(t, e.journalEntries, e.to), o = t.openingBalanceDate < e.from ? Kh(t.openingBalance) : 0, s = 0, c = 0;
		if (t.openingBalanceDate >= e.from && t.openingBalance !== 0) {
			let e = Kh(t.openingBalance);
			a.push({
				id: `setup:${t.id}`,
				bankId: t.id,
				bankName: t.name,
				date: t.openingBalanceDate,
				description: "Bank setup opening balance (not a cash receipt)",
				sourceType: "BANK_SETUP",
				category: Gh[4],
				moneyIn: qh(Math.max(e, 0)),
				moneyOut: qh(Math.max(-e, 0))
			}), s += Math.max(e, 0), c += Math.max(-e, 0);
		}
		for (let i of n.transactions) {
			if (i.transactionDate < e.from) {
				o += Kh(i.moneyIn) - Kh(i.moneyOut);
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
				category: Jh(n),
				moneyIn: i.moneyIn,
				moneyOut: i.moneyOut
			}), s += Kh(i.moneyIn), c += Kh(i.moneyOut);
		}
		let l = Kh(n.closingBalance);
		return {
			bankId: t.id,
			name: t.name,
			active: t.active,
			opening: qh(o),
			moneyIn: qh(s),
			moneyOut: qh(c),
			closing: qh(l),
			difference: qh(o + s - c - l)
		};
	}), s = new Map(Gh.map((e) => [e, {
		category: e,
		moneyIn: 0,
		moneyOut: 0,
		net: 0
	}])), c = /* @__PURE__ */ new Map();
	for (let e of a) {
		if (e.category === Gh[5]) {
			let t = e.journalId;
			c.set(t, (c.get(t) ?? 0) + Kh(e.moneyIn) - Kh(e.moneyOut));
			continue;
		}
		let t = s.get(e.category);
		t.moneyIn += Kh(e.moneyIn), t.moneyOut += Kh(e.moneyOut);
	}
	for (let e of c.values()) {
		let t = s.get(Gh[5]);
		t.moneyIn += Math.max(e, 0), t.moneyOut += Math.max(-e, 0);
	}
	let l = [...s.values()].map((e) => ({
		category: e.category,
		moneyIn: qh(e.moneyIn),
		moneyOut: qh(e.moneyOut),
		net: qh(e.moneyIn - e.moneyOut)
	})), u = (e) => qh(o.reduce((t, n) => t + Kh(n[e]), 0)), d = u("opening"), f = u("closing"), m = qh(l.reduce((e, t) => e + Kh(t.net), 0)), h = a.filter((e) => e.category === Gh[6]).length;
	return h && i.push(`${h} bank ledger line(s) need activity classification review. They are included in totals.`), a.sort((e, t) => e.date.localeCompare(t.date) || (e.journalNumber ?? "").localeCompare(t.journalNumber ?? "") || e.id.localeCompare(t.id)), {
		from: e.from,
		to: e.to,
		currency: e.currency,
		accounts: o,
		groups: l,
		details: a,
		warnings: i,
		opening: d,
		closing: f,
		net: m,
		grossIn: u("moneyIn"),
		grossOut: u("moneyOut"),
		difference: qh(Kh(d) + Kh(m) - Kh(f))
	};
}
//#endregion
//#region src/features/net-analysis/netAnalysisService.ts
var Xh = (e) => Math.round(e * 100);
function Zh(e) {
	for (let t of [
		e.subtotal,
		e.tax,
		e.total
	]) if (!Number.isFinite(t) || t < 0 || Math.abs(t * 100 - Xh(t)) > 1e-6) throw Error(`${e.number}: invalid saved monetary totals.`);
	if (Xh(e.subtotal) + Xh(e.tax) !== Xh(e.total)) throw Error(`${e.number}: saved net, tax and gross do not reconcile.`);
}
function Qh(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) {
		if (r.status === "DRAFT" || r.openingBalanceImportId) continue;
		let e = `${r.kind}:${r.id}`;
		if (t.has(e)) throw Error(`Duplicate analysis source: ${r.number}.`);
		t.add(e), p(r.date, `Document date (${r.number})`), Zh(r);
		let i = r.kind === "CUSTOMER_CREDIT" || r.kind === "SUPPLIER_CREDIT", a = i ? -1 : 1, { voidedAt: o, openingBalanceImportId: s, ...c } = r, l = (t, n, i) => ({
			...c,
			date: t,
			eventId: `${e}:${i}`,
			event: i,
			subtotal: Xh(r.subtotal) * n / 100,
			tax: Xh(r.tax) * n / 100,
			total: Xh(r.total) * n / 100
		});
		if (n.push(l(r.date, a, i ? "CREDIT" : "DOCUMENT")), r.status === "VOID") {
			if (!r.voidedAt) throw Error(`${r.number}: void date is missing. Review the source record before reporting.`);
			let e = u(r.voidedAt);
			if (p(e, `Void date (${r.number})`), e < r.date) throw Error(`${r.number}: void date precedes the original document.`);
			n.push(l(e, -a, "VOID"));
		}
	}
	return n.sort((e, t) => e.date.localeCompare(t.date) || e.number.localeCompare(t.number) || e.eventId.localeCompare(t.eventId));
}
function $h(e, t) {
	if (p(t.from, "From date"), p(t.to, "To date"), t.from > t.to) throw Error("From date must not exceed To date.");
	let n = t.query?.trim().toLowerCase() ?? "", r = Qh(e).filter((e) => e.date >= t.from && e.date <= t.to && (!t.partyId || e.partyId === t.partyId) && (!t.event || t.event === "ALL" || e.event === t.event) && `${e.number} ${e.partyName} ${e.partyId} ${e.kind}`.toLowerCase().includes(n)), i = (e, t) => e.reduce((e, n) => e + Xh(n[t]), 0) / 100, a = {
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
function eg(e, t, n) {
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
function tg(e, t) {
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
var ng = [
	"Profit & loss",
	"Balance sheet",
	"Trial balance",
	"Cash flow",
	"Net sales",
	"Net purchases"
];
function rg(e) {
	let t = e.split(",").map((e) => e.trim());
	if (!t.length || t.length > ng.length || t.some((e) => !e)) throw Error("Select one to six supported reports.");
	let n = t.map((e) => ng.find((t) => t.toLowerCase() === e.toLowerCase()));
	if (n.some((e) => !e)) throw Error(`Supported reports: ${ng.join(", ")}.`);
	if (new Set(n).size !== n.length) throw Error("Each report may appear only once in a pack.");
	return n;
}
var ig = (e) => JSON.stringify(e);
function ag(e, t, n) {
	if (p(e.periodStart, "From date"), p(e.periodEnd, "To date"), e.periodStart > e.periodEnd) throw Error("From date must not exceed To date.");
	let r = rg(e.reports), i = e.periodStart, a = e.periodEnd, o = r.map((e) => {
		if (e === "Profit & loss") {
			let n = Ah(t.accounts, t.journals, i, a);
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
			let n = Lh(t.accounts, t.journals, a);
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
			let n = Vh(t.accounts, t.journals, i, a);
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
			let n = Yh({
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
		let n = e === "Net purchases", r = $h(n ? tg(t.bills, t.supplierCredits) : eg(t.documents, t.customerCredits, t.customers), {
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
		sourceSignature: ig(t),
		sections: o
	});
}
//#endregion
//#region src/features/report-packs/reportPackCommand.ts
function og() {
	let e = n();
	return {
		accounts: I.getAll(),
		journals: L.getAll(),
		banks: Ku.getAll(),
		documents: U.getAll(),
		customerCredits: V.getAll(),
		customers: au.getAll().map((e) => ({
			id: e.id,
			businessName: e.businessName
		})),
		bills: sh.getAll(),
		supplierCredits: q.getAll(),
		company: {
			name: e.companyName,
			currency: e.currency,
			timezone: e.timezone
		}
	};
}
function sg(e) {
	let t = N.require("accounting.read"), n = j({
		id: D().trim().min(1).max(200),
		expectedRevision: D().regex(/^\d+$/)
	}).strict().parse(e), r = d["report-packs"]?.find((e) => e.id === n.id);
	if (!r) throw Error("Report pack configuration was not found.");
	if (r.revision !== n.expectedRevision) throw Error("Report pack changed. Reload before generating.");
	if (r.status !== "Active") throw Error("Activate this report pack before generating.");
	return ag({
		id: r.id,
		revision: r.revision,
		name: r.name,
		cover: r.cover,
		introduction: r.introduction,
		periodStart: r.periodStart,
		periodEnd: r.periodEnd,
		reports: r.reports
	}, og(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: t.userId
	});
}
//#endregion
//#region src/features/page-previews/catalog.ts
var J = (e, t, n = "text", r, i) => ({
	key: e,
	label: t,
	type: n,
	options: r,
	value: i,
	required: !0
}), Y = (e, t, n) => J(e, t, "select", n), cg = (e, t, n = "0") => ({
	...J(e, t, "number", void 0, n),
	min: 0,
	step: "0.01"
}), lg = (e, t) => J(e, t, "date", void 0, "2026-10-16"), ug = (e, t) => ({
	...Y(e, t, [
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
}), dg = [];
function fg(e, t, n, r, i, a, o, s, c) {
	dg.push({
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
fg("products", "Products & services", "Inventory & pricing", "/inventory/products", "inventory.read", "Maintain purchasing, selling, stock and packaging information.", [
	J("sku", "SKU"),
	Y("kind", "Product type", [
		"Stock item",
		"Service",
		"Non-stock item"
	]),
	Y("unit", "Selling unit", [
		"Pack",
		"m²",
		"Bucket",
		"Each"
	]),
	cg("price", "Standard selling price", "49.50"),
	cg("cost", "Buying cost (sample)", "25"),
	cg("coverage", "m² per pack", "2.2"),
	Y("rounding", "Pack rounding", ["Whole packs up", "Allow fractional packs"]),
	cg("reorder", "Reorder point", "10"),
	cg("target", "Target stock", "50"),
	Y("buy", "Available for purchasing", ["Yes", "No"]),
	Y("sell", "Available for selling", ["Yes", "No"]),
	Y("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	J("brand", "Brand"),
	J("category", "Category"),
	J("image", "Image URL (preview only)")
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
]), fg("promotions", "Scheduled promotions", "Inventory & pricing", "/inventory/promotions", "inventory.read", "Plan customer and product specials with explicit start and end times.", [
	J("product", "Product / SKU"),
	J("customer", "Customer scope"),
	J("starts", "Starts (local time)", "datetime-local", void 0, "2026-10-16T09:00"),
	J("ends", "Ends (local time)", "datetime-local", void 0, "2026-10-31T17:00"),
	cg("price", "Promotional unit price", "45"),
	Y("priority", "Priority when rules overlap", [
		"Customer price first",
		"Promotion first",
		"Lowest eligible price"
	]),
	J("timezone", "Time zone", "text", void 0, "Pacific/Auckland")
], {
	name: "October flooring special",
	product: "SAMPLE-OAK",
	customer: "All trade customers"
}, [
	"Overview",
	"Price comparison",
	"History"
]), fg("tax-codes", "Tax codes", "Accounting", "/accounting/tax-codes", "accounting.read", "Review GST codes, inclusive/exclusive calculation and reporting mappings.", [
	J("code", "Tax code"),
	cg("rate", "Tax rate (%)", "15"),
	Y("basis", "Entry basis", ["Exclusive", "Inclusive"]),
	ug("collected", "GST collected account"),
	ug("paid", "GST paid account"),
	J("report", "Return / report mapping")
], {
	name: "Standard GST",
	code: "GST15",
	report: "Output / input GST"
}, [
	"Overview",
	"Calculation preview",
	"Reporting"
]), fg("linked-accounts", "Linked accounts", "Accounting", "/accounting/linked-accounts", "accounting.read", "Preview default general ledger mappings used by each business process.", [
	Y("process", "Business process", [
		"Sales",
		"Purchases",
		"Payroll"
	]),
	ug("receivable", "Receivables / payables control"),
	ug("income", "Income / expense account"),
	ug("inventory", "Inventory account"),
	ug("cogs", "Cost of goods sold"),
	ug("gst", "GST control account"),
	ug("payroll", "Payroll clearing account")
], {
	name: "Sales posting defaults",
	process: "Sales"
}, ["Overview", "Posting example"]), fg("jobs", "Jobs & projects", "Accounting", "/accounting/jobs", "accounting.read", "Track project budgets, allocate posted revenue and costs, and compare actual profitability.", [
	J("code", "Job code"),
	J("customer", "Customer"),
	J("owner", "Project owner"),
	lg("starts", "Start date"),
	lg("ends", "End date"),
	cg("budget", "Revenue budget", "10000"),
	cg("costBudget", "Cost budget", "6000")
], {
	name: "Sample showroom installation",
	code: "JOB-SAMPLE",
	customer: "Sample Flooring Ltd",
	owner: "Sample team"
}, [
	"Overview",
	"Transactions",
	"Profitability"
]), fg("bank-accounts", "Bank account setup", "Banking", "/banking/setup/accounts", "banking.read", "Preview bank account details, ledger links and feed preferences.", [
	J("number", "Account number (sample only)"),
	J("bank", "Bank name"),
	Y("currency", "Currency", ["NZD", "AUD"]),
	ug("ledger", "Linked bank GL account"),
	Y("feed", "Feed provider", ["Manual import", "Provider to be configured"]),
	lg("feedStart", "Feed start date")
], {
	name: "Sample operating account",
	number: "00-0000-0000000-00",
	bank: "Sample Bank"
}, [
	"Overview",
	"Feed settings",
	"Import history"
]), fg("bank-rules", "Bank rules", "Banking", "/banking/rules", "banking.read", "Define matching conditions and resulting categorisation before testing a sample.", [
	Y("match", "Match mode", ["All conditions", "Any condition"]),
	Y("field", "Transaction field", [
		"Description",
		"Payee",
		"Reference"
	]),
	Y("operator", "Operator", [
		"Contains",
		"Equals",
		"Starts with"
	]),
	J("value", "Match text"),
	ug("account", "Categorise to account"),
	Y("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	Y("enabled", "Enabled", ["Yes", "No"])
], {
	name: "Sample office supplies",
	value: "OFFICE",
	field: "Description"
}, [
	"Overview",
	"Test rule",
	"History"
]), fg("payment-batches", "Electronic payment batches", "Banking", "/banking/payment-batches", "banking.read", "Select sample supplier or wage payments, review approval and bank export layout.", [
	Y("kind", "Batch type", ["Supplier payments", "Wages"]),
	lg("payDate", "Payment date"),
	J("bank", "Paying account"),
	J("reference", "Bank reference"),
	Y("format", "Export format", ["NZ bank CSV preview", "ABA layout preview"]),
	cg("total", "Batch total", "1100")
], {
	name: "Sample supplier batch",
	bank: "Sample operating account",
	reference: "OCT-SAMPLE"
}, [
	"Overview",
	"Payments",
	"Approval & export"
]), fg("pay-items", "Pay items", "Payroll", "/payroll/pay-items", "accounting.read", "Configure sample earnings, allowances, deductions, leave, tax and employer contributions.", [
	J("code", "Pay item code"),
	Y("category", "Category", [
		"Earnings",
		"Allowance",
		"Deduction",
		"Leave",
		"Tax",
		"Employer contribution"
	]),
	Y("method", "Calculation method", [
		"Hourly rate",
		"Fixed amount",
		"Percentage"
	]),
	cg("rate", "Rate / amount", "30"),
	Y("taxable", "Tax treatment", [
		"Taxable",
		"Non-taxable",
		"Before tax deduction",
		"After tax deduction"
	]),
	ug("expense", "Expense account"),
	ug("liability", "Liability / clearing account")
], {
	name: "Ordinary hours",
	code: "ORD",
	category: "Earnings"
}, [
	"Overview",
	"Employee assignments",
	"Posting preview"
]), fg("filing", "Payroll filing", "Payroll", "/payroll/filing", "accounting.read", "Review a sample NZ Payday Filing submission and its response / correction workflow.", [
	J("payrun", "Pay run reference"),
	lg("payDate", "Pay date"),
	J("employer", "Employer IRD identifier (sample)"),
	Y("type", "Submission type", ["Employment information", "Amendment"]),
	J("contact", "Payroll contact email", "email")
], {
	name: "October employment information",
	payrun: "SAMPLE-RUN-01",
	employer: "000-000-000",
	contact: "payroll@example.invalid"
}, [
	"Overview",
	"Employees & validation",
	"Submission & response"
]), fg("recurring", "Recurring transactions", "Automation & tasks", "/automation/recurring", "inventory.read", "Generate due invoice and expense drafts from saved local templates with ordered schedules and retry protection.", [
	Y("kind", "Transaction type", [
		"Invoice",
		"Bill",
		"Bank transaction"
	]),
	J("contact", "Customer / supplier"),
	Y("frequency", "Frequency", [
		"Weekly",
		"Fortnightly",
		"Monthly",
		"Quarterly"
	]),
	lg("next", "Next generation date"),
	lg("ends", "Schedule end date"),
	cg("total", "Template amount", "220"),
	Y("mode", "Generation mode", ["Draft for review", "Require approval"])
], {
	name: "Monthly sample maintenance",
	contact: "Sample Flooring Ltd"
}, [
	"Overview",
	"Template lines",
	"Run history"
]), fg("tasks", "Tasks & action centre", "Automation & tasks", "/tasks", "sales.read", "Maintain local tasks, owners and due dates with audited completion and reopening.", [
	J("customer", "Customer / branch"),
	J("owner", "Assigned to"),
	lg("due", "Due date"),
	Y("priority", "Priority", [
		"Normal",
		"High",
		"Low"
	]),
	J("notes", "Task instructions", "textarea")
], {
	name: "Follow up showroom quote",
	customer: "Sample Flooring / North branch",
	owner: "Sample sales",
	notes: "Confirm quantities and planned installation date."
}, [
	"Overview",
	"Notes & attachments",
	"Status history"
]), fg("visits", "Sales visits & activity", "Automation & tasks", "/sales/activity", "sales.read", "Plan local sales visits, record trusted check-in/out, outcomes and linked follow-up tasks.", [
	J("salesperson", "Salesperson"),
	J("customer", "Customer / branch"),
	J("checkin", "Check-in", "datetime-local", void 0, "2026-10-16T09:00"),
	J("checkout", "Check-out", "datetime-local", void 0, "2026-10-16T09:30"),
	J("outcome", "Visit outcome", "textarea"),
	J("location", "Recorded location")
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
]), fg("draft-review", "Customer & contact review", "Automation & tasks", "/contacts/review", "sales.read", "Review local customer, branch and contact drafts, compare duplicates and approve or link real records.", [
	Y("kind", "Draft type", [
		"Customer",
		"Branch",
		"Contact"
	]),
	J("company", "Customer / company"),
	J("branch", "Branch"),
	J("email", "Email", "email"),
	J("phone", "Phone"),
	Y("source", "Source", [
		"Sales draft",
		"Selected phone contact",
		"Business card OCR"
	]),
	Y("decision", "Review decision", [
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
]), fg("templates", "PDF & email templates", "Documents & imports", "/documents/templates", "accounting.read", "Design sample invoice, quote, PO, statement and remittance layouts and email copy.", [
	Y("kind", "Document type", [
		"Invoice",
		"Quotation",
		"Purchase order",
		"Customer statement",
		"Remittance"
	]),
	J("subject", "Email subject"),
	J("body", "Email body", "textarea"),
	J("footer", "PDF footer", "textarea"),
	Y("logo", "Logo position", [
		"Left",
		"Centre",
		"Right"
	]),
	Y("paper", "Paper size", ["A4", "Letter"])
], {
	name: "Standard invoice template",
	subject: "Your document {{number}}",
	body: "Hello {{contact}}, please review the attached {{type}}.",
	footer: "Thank you for your business."
}, [
	"Overview",
	"PDF preview",
	"Email preview"
]), fg("custom-reports", "Saved & favourite reports", "Reports", "/reports/saved", "accounting.read", "Save explicit filters and ordered columns, run local data and export complete results.", [
	Y("dataset", "Dataset", [
		"Sales",
		"Purchases",
		"Payroll",
		"Banking",
		"General ledger"
	]),
	J("columns", "Columns (comma separated)"),
	J("filter", "Filter expression (preview)"),
	Y("basis", "Basis", ["Accrual", "Cash"]),
	Y("favourite", "Favourite", ["Yes", "No"])
], {
	name: "Monthly sales by customer",
	columns: "Customer, Date, Net, GST, Total",
	filter: "Date: current month"
}, ["Overview", "Report preview"]), fg("report-packs", "Report packs", "Reports", "/reports/packs", "accounting.read", "Generate combined financial reports from current local books, with ordered sections and printable exports.", [
	J("company", "Company"),
	J("period", "Reporting period"),
	J("reports", "Included reports (comma separated)"),
	J("cover", "Cover heading"),
	J("introduction", "Cover note", "textarea")
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
var pg = dg;
[...new Set(dg.map((e) => e.group))], Y("gst", "GST registration", ["Registered", "Not registered"]), Y("filing", "GST filing cycle", [
	"Two monthly",
	"Monthly",
	"Six monthly"
]), cg("quoteNext", "Next quote number", "1001"), cg("orderNext", "Next order number", "1001"), cg("invoiceNext", "Next invoice number", "1001"), cg("creditNext", "Next credit number", "1001"), Y("terms", "Default terms", [
	"20th of following month",
	"Due on receipt",
	"30 days"
]), Y("template", "Default template", ["Standard invoice", "Trade invoice"]), Y("reminders", "Overdue reminders", ["Manual only", "7 and 14 days overdue"]), Y("onlinePayment", "Online payment option", ["Disabled", "Configuration preview"]), cg("next", "Next PO number", "1001"), Y("terms", "Default payment terms", [
	"20th of following month",
	"30 days",
	"Due on receipt"
]), ug("expense", "Default expense account"), Y("receipt", "Bill matching", ["Require receipt match", "Allow expense bills"]), Y("remittance", "Remittance preference", ["Preview before sending", "Manual"]), Y("cycle", "Pay cycle", [
	"Weekly",
	"Fortnightly",
	"Monthly"
]), Y("day", "Pay day", [
	"Wednesday",
	"Thursday",
	"Friday"
]), ug("wages", "Wages expense account"), ug("clearing", "Payroll clearing account"), Y("bank", "Paying bank", ["Sample operating account"]), Y("filing", "Filing region", ["New Zealand · Payday Filing", "Australia · STP preview"]), Y("basis", "Default basis", ["Accrual", "Cash"]), Y("currency", "Display currency", ["NZD", "AUD"]), Y("precision", "Decimal places", ["2", "0"]), Y("negative", "Negative number style", ["(1,234.56)", "-1,234.56"]), Y("comparative", "Comparative period", [
	"Previous period",
	"Previous year",
	"None"
]);
//#endregion
//#region src/features/page-previews/previewModel.ts
function mg(e, t) {
	return Object.fromEntries(e.map((e) => [e.key, t?.[e.key] ?? e.value ?? e.options?.[0] ?? ""]));
}
Object.fromEntries(pg.map((e) => [e.id, [{
	...mg(e.fields),
	...e.example,
	id: "sample-1",
	name: e.example.name,
	status: "Draft"
}]]));
function hg(e) {
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
//#region src/features/saved-reports/savedReportService.ts
var gg = [
	"Sales",
	"Purchases",
	"Banking",
	"General ledger"
], X = (e, t, n = !1) => ({
	key: e,
	label: t,
	numeric: n
}), _g = [
	X("date", "Date"),
	X("number", "Document"),
	X("contact", "Contact"),
	X("partyId", "Contact ID"),
	X("activity", "Activity"),
	X("status", "Current status"),
	X("net", "Net", !0),
	X("tax", "Tax", !0),
	X("gross", "Gross", !0)
], vg = {
	Sales: _g,
	Purchases: _g,
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
}, yg = (e) => e === "Banking" ? "Cash" : "Accrual", bg = j({
	from: D(),
	to: D(),
	query: D().max(500).default(""),
	partyId: D().max(200).optional(),
	bankId: D().max(200).optional(),
	accountId: D().max(200).optional(),
	currency: D().min(1).max(10).optional()
}).strict();
function xg(e) {
	let t = M(gg).parse(e.dataset);
	if (e.basis !== yg(t)) throw Error(`${t} uses ${yg(t)} basis. Cash-basis sales/purchase recognition is not available.`);
	if (e.favourite !== void 0 && !["Yes", "No"].includes(e.favourite)) throw Error("Favourite must be Yes or No.");
	let n;
	try {
		n = JSON.parse(e.filter ?? "");
	} catch {
		throw Error("Legacy filter text is not executable. Edit and save explicit report dates and filters.");
	}
	let r = bg.parse(n);
	if (p(r.from, "From date"), p(r.to, "To date"), r.from > r.to) throw Error("From date must not exceed To date.");
	if (t !== "Sales" && t !== "Purchases" && r.partyId) throw Error("Contact filters require Sales or Purchases.");
	if (t !== "Banking" && (r.bankId || r.currency)) throw Error("Bank and currency filters require Banking.");
	if (t !== "General ledger" && r.accountId) throw Error("Account filters require General ledger.");
	let i = e.columns.split(",").map((e) => e.trim()), a = t === "Sales" || t === "Purchases" ? {
		customer: "contact",
		supplier: "contact",
		gst: "tax",
		total: "gross"
	} : {}, o = i.map((e) => vg[t].find((t) => t.label.toLowerCase() === e.toLowerCase() || t.key.toLowerCase() === (a[e.toLowerCase()] ?? e.toLowerCase())));
	if (!i.length || i.length > vg[t].length || o.some((e) => !e) || new Set(o.map((e) => e?.key)).size !== o.length) throw Error(`Select distinct supported columns for ${t}: ${vg[t].map((e) => e.label).join(", ")}.`);
	return {
		dataset: t,
		filters: r,
		columns: o
	};
}
var Sg = (e, t) => e.reduce((e, n) => {
	let r = Number(n.values[t]), i = e + Math.round(r * 100);
	if (!Number.isFinite(r) || !Number.isSafeInteger(i)) throw Error("Report monetary total exceeds supported cents precision.");
	return i;
}, 0) / 100;
function Cg(e, t, n) {
	let { dataset: r, filters: i, columns: a } = xg(e), o = i.query.trim().toLowerCase(), s = [], c = [], l = [], u = t.company.currency;
	if (r === "Sales" || r === "Purchases") {
		let e = r === "Sales" ? eg(t.documents, t.customerCredits, t.customers) : tg(t.bills, t.supplierCredits);
		if (i.partyId && !e.some((e) => e.partyId === i.partyId) && !(r === "Sales" && t.customers.some((e) => e.id === i.partyId))) throw Error("Selected contact is not available in this dataset.");
		let n = {
			DOCUMENT: "Original document",
			CREDIT: "Credit note",
			VOID: "Void reversal"
		};
		s = Qh(e).filter((e) => e.date >= i.from && e.date <= i.to && (!i.partyId || e.partyId === i.partyId)).map((e) => ({
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
		let e = Yh({
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
		value: Sg(s, t)
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
		sourceSignature: ig(t),
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
function wg(e) {
	let t = N.require("accounting.read"), n = j({
		id: D().trim().min(1).max(200),
		expectedRevision: D().regex(/^\d+$/)
	}).strict().parse(e), r = d["custom-reports"]?.find((e) => e.id === n.id);
	if (!r) throw Error("Saved report was not found.");
	if (r.revision !== n.expectedRevision) throw Error("Saved report changed. Reload before running.");
	if (r.status !== "Active") throw Error("Activate this saved report before running.");
	return Cg({
		id: r.id,
		revision: r.revision,
		name: r.name,
		dataset: r.dataset,
		columns: r.columns,
		basis: r.basis,
		filter: r.filter,
		favourite: r.favourite
	}, og(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: t.userId
	});
}
//#endregion
//#region src/features/business-workspace/workspaceRepository.ts
var Tg = Zs(D(), D().max(2e4)), Eg = [
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
], Dg = () => (/* @__PURE__ */ new Date()).toISOString(), Og = {
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
}, kg = /* @__PURE__ */ new Set(), Ag = 0, jg = () => {
	Ag++, kg.forEach((e) => e());
}, Mg = Object.fromEntries(Object.keys(Og).map((e) => [e, []]));
for (let e of Object.keys(Og)) d[e] = [];
var Ng = () => ({
	collected: I.getAll().find((e) => e.systemRole === "GST_PAYABLE")?.id ?? "",
	paid: I.getAll().find((e) => e.systemRole === "GST_RECEIVABLE")?.id ?? ""
});
d["tax-codes"] = [{
	id: "tax-gst",
	name: "GST",
	status: "Active",
	revision: "1",
	createdAt: Dg(),
	updatedAt: Dg(),
	code: "GST",
	rate: "10",
	basis: "Exclusive",
	report: "GST",
	...Ng()
}, {
	id: "tax-zero",
	name: "Zero rated",
	status: "Active",
	revision: "1",
	createdAt: Dg(),
	updatedAt: Dg(),
	code: "ZERO",
	rate: "0",
	basis: "Exclusive",
	report: "Zero rated",
	...Ng()
}];
function Pg(e, t) {
	if (!e?.trim()) throw Error(`${t} is required.`);
}
function Fg(e, t) {
	if (!e?.trim() || !Number.isFinite(Number(e)) || Number(e) < 0) throw Error(`${t} must be a non-negative number.`);
}
function Ig(e, t) {
	let n = I.getAll().find((t) => t.id === e);
	if (!n?.active || t && n.type !== t) throw Error("Select an active account of the correct type.");
	return n;
}
function Lg(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && (/* @__PURE__ */ new Date(e + "T00:00:00Z")).toISOString().slice(0, 10) === e;
}
function Rg(e, t, n, r = !0) {
	let i = Og[e];
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
	Pg(t.name, "Name");
	for (let e of i.required) Pg(t[e], e);
	if (![
		"Active",
		"Inactive",
		"Open",
		"In progress",
		"Completed"
	].includes(t.status ?? "Active")) throw Error("Invalid business status.");
	if (e === "tax-codes") {
		if (Fg(t.rate, "Tax rate"), t.basis && !["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid entry basis.");
		if (r) {
			let e = n.find((e) => e.id === t.id), r = ee(), i = d.settings?.find((e) => e.section === "business" && e.status === "Active")?.gstCode ?? "GST";
			if (t.status === "Inactive" && t.code === i) throw Error("The default tax code must remain active. Change the business default first.");
			if (e && e.code !== t.code && (e.code === i || r.products.products.some((t) => (t.taxCode ?? "GST") === e.code) || (d["bank-rules"] ?? []).some((t) => t.taxCode === e.code))) throw Error("A referenced tax code cannot be renamed. Create a new code and update future-use references.");
		}
		if (Number(t.rate) > 100) throw Error("Tax rate cannot exceed 100%.");
		if (r) {
			let e = Ig(t.collected, "LIABILITY"), n = Ig(t.paid, "ASSET"), r = (ee().bankAccounts?.bankAccounts ?? []).map((e) => e.glAccountId);
			if (e.systemRole && e.systemRole !== "GST_PAYABLE" || n.systemRole && n.systemRole !== "GST_RECEIVABLE" || r.includes(n.id)) throw Error("Tax mappings cannot use AR/AP, inventory, GRNI or bank control accounts.");
		}
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Tax code must be unique.");
		if (!/^[A-Z0-9_-]{1,24}$/.test(t.code)) throw Error("Use uppercase letters/numbers for a tax code.");
	}
	if (e === "linked-accounts" && r) {
		let e = I.requireBySystemRole(t.role), n = t.status === "Inactive" ? I.getAll().find((e) => e.systemRole === t.role)?.id : t.accountId, r = ee().journals?.journalEntries ?? [];
		if (n !== e.id && r.some((t) => t.lines.some((t) => t.accountId === e.id || t.accountId === n))) throw Error("A used posting account cannot be remapped without a ledger migration.");
	}
	if (e === "linked-accounts") {
		if (!Eg.includes(t.role)) throw Error("Unknown account role.");
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
		if (r && Ig(t.accountId, e), n.some((e) => e.id !== t.id && e.role === t.role)) throw Error("A linked account role may only have one mapping.");
	}
	if (e === "promotions") {
		let e = Zu(t.productId);
		if (r && (!e || !Qu(e.id, t.unitId))) throw Error("Product/unit not found.");
		if (Fg(t.price, "Price"), !Number.isInteger(Number(t.priority))) throw Error("Priority must be an integer.");
		if (![
			"Customer price first",
			"Promotion first",
			"Lowest eligible price"
		].includes(t.policy)) throw Error("Invalid price conflict policy.");
		if (!/([+-]\d\d:\d\d|Z)$/.test(t.starts) || !Number.isFinite(Date.parse(t.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(t.ends) || !Number.isFinite(Date.parse(t.ends)) || Date.parse(t.ends) <= Date.parse(t.starts)) throw Error("Promotion requires explicit time offsets and an end after start.");
	}
	if (r && t.customerId && !au.getById(t.customerId)) throw Error("Customer was not found.");
	if (e === "jobs") {
		if (Fg(t.budget, "Revenue budget"), Fg(t.costBudget, "Cost budget"), r) for (let e of ["budget", "costBudget"]) {
			let n = Number(t[e]);
			if (!Number.isSafeInteger(Math.round(n * 100)) || Math.abs(Math.round(n * 100) / 100 - n) > 1e-7) throw Error("Project budgets require safe currency amounts with at most two decimals.");
		}
		if (!Lg(t.starts) || !Lg(t.ends) || t.ends < t.starts) throw Error("Invalid project dates.");
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Job code must be unique.");
	}
	if (e === "tasks") {
		if (r && t.id && (ee().salesVisits?.visits ?? []).some((e) => e.followupTaskId === t.id && e.customerId !== t.customerId)) throw Error("A visit follow-up must retain the visit customer.");
		if (r && ![
			"Open",
			"In progress",
			"Completed"
		].includes(t.status ?? "Open")) throw Error("Task status must be Open, In progress or Completed.");
		if (!Lg(t.due) || ![
			"Low",
			"Normal",
			"High"
		].includes(t.priority)) throw Error("Invalid due date or priority.");
	}
	if (e === "bank-rules") {
		if (r && Ig(t.accountId), ![
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
	if (e === "custom-reports" && r && xg({
		dataset: t.dataset,
		columns: t.columns,
		basis: t.basis,
		filter: t.filter,
		favourite: t.favourite
	}), e === "report-packs" && r && rg(t.reports), e === "report-packs" && (!Lg(t.periodStart) || !Lg(t.periodEnd) || t.periodEnd < t.periodStart)) throw Error("Invalid report period.");
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
			]) Pg(t[e], e);
			if (t.status !== "Active") throw Error("Business settings must remain active.");
			if (!["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid price basis.");
			if (!/^\d+$/.test(t.terms) || Number(t.terms) > 365) throw Error("Payment terms must be 0–365 days.");
			if (!/^\d{2}-\d{2}$/.test(t.yearEnd) || !Lg("2001-" + t.yearEnd)) throw Error("Year end must be MM-DD.");
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
				let e = ee().journals.journalEntries, r = n.find((e) => e.id === t.id), i = ee().bankAccounts.bankAccounts, a = r?.currency ?? i[0]?.currency ?? "AUD";
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
function zg(e, t, n) {
	Mg[e].push({
		id: crypto.randomUUID(),
		name: n,
		status: "Active",
		revision: "1",
		createdAt: Dg(),
		updatedAt: Dg(),
		recordId: t.id,
		actorId: N.current()?.userId ?? "local-test",
		after: JSON.stringify(t)
	});
}
var Bg = Object.fromEntries(Object.keys(Og).map((e) => {
	let t = {
		run(t) {
			if (e !== "custom-reports") throw Error("Saved-report execution is not available on this register.");
			return wg(t);
		},
		generate(t) {
			if (e !== "report-packs") throw Error("Report generation is only available for report packs.");
			return sg(t);
		},
		getAll: () => d[e],
		getById: (t) => d[e].find((e) => e.id === t),
		save(t, n) {
			let r = Tg.parse(t), i = d[e].find((e) => e.id === r.id);
			if (i && i.revision !== n) throw Error("Record changed. Reload before saving.");
			if (!i && n !== void 0) throw Error("Record no longer exists.");
			let a = Dg(), o = {
				...r,
				id: i?.id ?? crypto.randomUUID(),
				name: r.name.trim(),
				status: r.status ?? (e === "tasks" ? "Open" : "Active"),
				revision: String(Number(i?.revision ?? "0") + 1),
				createdAt: i?.createdAt ?? a,
				updatedAt: a
			};
			return e === "tasks" && (delete o.completedAt, delete o.completedBy, o.status === "Completed" && (o.completedAt = i?.status === "Completed" && i.completedAt || a, o.completedBy = i?.status === "Completed" ? i.completedBy || N.current()?.userId || "local-test" : N.current()?.userId ?? "local-test")), Rg(e, o, d[e]), d[e] = [...d[e].filter((e) => e.id !== o.id), o], zg(e, o, i ? "Updated" : "Created"), jg(), o;
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
			zg(e, {
				...i,
				note: r.trim()
			}, "Note added"), jg();
		}
	};
	return o("workspace_" + e.replaceAll("-", "_"), {
		validate: (t, n) => {
			Vg(e, t), Hg(e, t, n);
		},
		repository: t,
		read: Og[e].read,
		commands: {
			run: e === "custom-reports" ? "accounting.read" : null,
			generate: e === "report-packs" ? "accounting.read" : null,
			save: Og[e].write,
			setStatus: Og[e].write,
			addNote: e === "tasks" ? "sales.write" : null
		},
		snapshot: () => ({
			records: d[e],
			history: Mg[e]
		}),
		restore: (t) => {
			Vg(e, t), d[e] = t.records, Mg[e] = t.history;
		},
		publish: jg
	}), [e, t];
}));
function Vg(e, t) {
	let n = j({
		records: A(Tg),
		history: A(Tg)
	}).strict().parse(t), r = /* @__PURE__ */ new Set();
	for (let t of n.records) {
		if (!t.id || r.has(t.id) || !/^\d+$/.test(t.revision)) throw Error("Invalid workspace record identity.");
		r.add(t.id), Rg(e, t, n.records, !1);
	}
	return n;
}
function Hg(e, t, n) {
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
var Ug = D().trim().min(1).max(200), Wg = D().trim().min(1).max(4e3), Gg = D().refine((e) => {
	try {
		return p(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), Kg = D().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}, "Invalid visit timestamp."), qg = j({
	operationId: Ug,
	name: Ug,
	customerId: Ug,
	locationId: Ug.optional(),
	plannedDate: Gg,
	locationNote: D().trim().max(500).default("")
}).strict(), Jg = j({
	name: Ug,
	due: Gg,
	priority: M([
		"Low",
		"Normal",
		"High"
	]),
	notes: Wg
}).strict(), Yg = j({
	id: Ug,
	expectedRevision: k().int().positive(),
	outcome: Wg,
	followup: Jg.optional()
}).strict(), Xg = j({
	id: Ug,
	action: Ug,
	actorId: Ug,
	at: Kg,
	note: D().optional()
}).strict(), Zg = j({
	id: Ug,
	operationId: Ug,
	creationFingerprint: D().min(1).max(3e3),
	name: Ug,
	customerId: Ug,
	customerName: Ug,
	locationId: Ug.optional(),
	locationName: D().max(200).optional(),
	locationNote: D().max(500),
	plannedDate: Gg,
	status: M([
		"Planned",
		"Checked in",
		"Completed",
		"Cancelled"
	]),
	revision: k().int().positive(),
	ownerId: Ug,
	createdAt: Kg,
	updatedAt: Kg,
	checkInAt: Kg.optional(),
	checkInBy: Ug.optional(),
	checkOutAt: Kg.optional(),
	checkOutBy: Ug.optional(),
	outcome: Wg.optional(),
	completionFingerprint: D().optional(),
	followupTaskId: Ug.optional(),
	history: A(Xg).min(1)
}).strict(), Qg = [], $g = 0, e_ = /* @__PURE__ */ new Set(), t_ = () => {
	$g++, e_.forEach((e) => e());
}, n_ = () => N.require("sales.write").userId, r_ = () => (/* @__PURE__ */ new Date()).toISOString(), i_ = (e, t, n, r) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	...r ? { note: r } : {}
});
function a_(e) {
	let t = Qg.find((t) => t.id === e);
	if (!t) throw Error("Visit not found.");
	return t;
}
function o_(e, t) {
	if (e.revision !== t) throw Error("Visit changed. Reload before continuing.");
}
function s_(e) {
	let t = r_();
	if (t < e.updatedAt) throw Error("System clock precedes the last visit update. Correct the clock before continuing.");
	return t;
}
function c_(e) {
	return Qg = [...Qg.filter((t) => t.id !== e.id), e], t_(), e;
}
function l_(e, t) {
	let n = au.getById(e);
	if (!n || n.status === "INACTIVE") throw Error("Choose an available customer.");
	if (t && !n.locations.some((e) => e.id === t)) throw Error("Choose a location belonging to the selected customer.");
	return n;
}
o("salesVisits", {
	repository: {
		subscribe(e) {
			return e_.add(e), () => {
				e_.delete(e);
			};
		},
		getSnapshot: () => Qg,
		getAll: () => Qg,
		create(e) {
			let t = n_(), n = qg.parse(e), r = JSON.stringify(n), i = Qg.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.creationFingerprint !== r) throw Error("Operation ID was used for different visit data.");
				return i;
			}
			let a = l_(n.customerId, n.locationId), o = r_();
			return c_({
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
				history: [i_("Planned", t, o)]
			});
		},
		update(e) {
			let t = n_(), n = qg.omit({ operationId: !0 }).extend({
				id: Ug,
				expectedRevision: k().int().positive()
			}).strict().parse(e), r = a_(n.id);
			if (o_(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be edited.");
			let i = l_(n.customerId, n.locationId), a = s_(r), o = {
				...r,
				name: n.name,
				customerId: n.customerId,
				customerName: i.businessName,
				plannedDate: n.plannedDate,
				locationNote: n.locationNote,
				revision: r.revision + 1,
				updatedAt: a,
				history: [...r.history, i_("Plan updated", t, a, r.plannedDate + " → " + n.plannedDate)]
			};
			return delete o.locationId, delete o.locationName, n.locationId && (o.locationId = n.locationId, o.locationName = i.locations.find((e) => e.id === n.locationId).name), c_(o);
		},
		checkIn(e) {
			let t = n_(), n = j({
				id: Ug,
				expectedRevision: k().int().positive()
			}).strict().parse(e), r = a_(n.id);
			if (r.status === "Checked in" && r.revision === n.expectedRevision + 1) return r;
			if (o_(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be checked in.");
			l_(r.customerId, r.locationId);
			let i = s_(r);
			return c_({
				...r,
				status: "Checked in",
				revision: r.revision + 1,
				checkInAt: i,
				checkInBy: t,
				updatedAt: i,
				history: [...r.history, i_("Checked in", t, i)]
			});
		},
		finish(e) {
			let t = n_(), n = Yg.parse(e), r = a_(n.id), i = JSON.stringify({
				outcome: n.outcome,
				followup: n.followup
			});
			if (r.status === "Completed") {
				if (r.completionFingerprint === i) return r;
				throw Error("Visit is already completed with a different outcome.");
			}
			if (o_(r, n.expectedRevision), r.status !== "Checked in") throw Error("Check in before completing the visit.");
			let a = s_(r);
			if (a < r.checkInAt) throw Error("System clock precedes check-in. Correct the clock before completing.");
			let o;
			return n.followup && (o = Bg.tasks.save({
				...n.followup,
				customerId: r.customerId,
				owner: t,
				status: "Open"
			}).id), c_({
				...r,
				status: "Completed",
				revision: r.revision + 1,
				checkOutAt: a,
				checkOutBy: t,
				outcome: n.outcome,
				completionFingerprint: i,
				...o ? { followupTaskId: o } : {},
				updatedAt: a,
				history: [...r.history, i_("Completed", t, a, n.outcome)]
			});
		},
		cancel(e) {
			let t = n_(), n = j({
				id: Ug,
				expectedRevision: k().int().positive(),
				reason: Wg
			}).strict().parse(e), r = a_(n.id);
			if (o_(r, n.expectedRevision), !["Planned", "Checked in"].includes(r.status)) throw Error("Only an unfinished visit can be cancelled.");
			let i = s_(r);
			return c_({
				...r,
				status: "Cancelled",
				revision: r.revision + 1,
				updatedAt: i,
				history: [...r.history, i_("Cancelled", t, i, n.reason)]
			});
		},
		addNote(e) {
			let t = n_(), n = j({
				id: Ug,
				expectedRevision: k().int().positive(),
				note: Wg
			}).strict().parse(e), r = a_(n.id);
			o_(r, n.expectedRevision);
			let i = s_(r);
			return c_({
				...r,
				revision: r.revision + 1,
				updatedAt: i,
				history: [...r.history, i_("Note added", t, i, n.note)]
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
	snapshot: () => ({ visits: Qg }),
	restore: (e) => {
		Qg = e.visits;
	},
	publish: t_,
	validate: (e, t) => {
		let n = j({ visits: A(Zg) }).strict().parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.visits) {
			if (i.has(e.operationId)) throw Error("Duplicate visit operation ID.");
			if (i.add(e.operationId), !r.customers.customers.find((t) => t.id === e.customerId) || e.locationId && !e.locationName) throw Error("Invalid visit customer/location reference.");
			if (e.history.length !== e.revision || new Set(e.history.map((e) => e.id)).size !== e.history.length || e.updatedAt < e.createdAt) throw Error("Invalid visit history.");
			if (qg.parse(JSON.parse(e.creationFingerprint)).operationId !== e.operationId || e.history[0].action !== "Planned" || e.history[0].actorId !== e.ownerId || e.history[0].at !== e.createdAt) throw Error("Visit creation fingerprint is inconsistent.");
			if (!!e.checkInAt != !!e.checkInBy || !!e.checkOutAt != !!e.checkOutBy || e.checkInAt && e.checkInAt < e.createdAt || e.checkOutAt && (!e.checkInAt || e.checkOutAt < e.checkInAt)) throw Error("Invalid visit check-in/out history.");
			if (e.status === "Planned" && (e.checkInAt || e.checkOutAt) || e.status === "Checked in" && (!e.checkInAt || e.checkOutAt) || e.status === "Completed" && (!e.checkInAt || !e.checkOutAt || !e.outcome || !e.completionFingerprint) || e.status !== "Completed" && (e.checkOutAt || e.outcome || e.followupTaskId || e.completionFingerprint)) throw Error("Visit state is inconsistent.");
			if (e.status === "Completed") {
				let t = j({
					outcome: Wg,
					followup: Jg.optional()
				}).strict().parse(JSON.parse(e.completionFingerprint));
				if (t.outcome !== e.outcome || !!t.followup != !!e.followupTaskId) throw Error("Visit completion fingerprint is inconsistent.");
			}
			if (e.followupTaskId && !r.workspace_tasks.records.some((t) => t.id === e.followupTaskId && t.customerId === e.customerId)) throw Error("Visit follow-up task is missing or belongs to another customer.");
		}
	}
});
//#endregion
//#region src/features/direct-documents/managedDocumentRepository.ts
var Z = D().trim().min(1).max(200), u_ = D().trim().max(2e3).optional(), d_ = j({
	requestedArea: k().finite().positive().max(1e9).optional(),
	productId: Z,
	unitId: Z,
	quantity: k().positive().finite(),
	unitPrice: k().nonnegative().finite().optional(),
	priceBasis: M(["Inclusive", "Exclusive"]).optional()
}).strict(), f_ = j({
	description: D().trim().min(1).max(500),
	accountId: Z,
	quantity: k().positive().finite(),
	unitCost: k().nonnegative().finite(),
	taxCode: Z,
	priceBasis: M(["Inclusive", "Exclusive"]).optional()
}).strict(), p_ = j({
	kind: M(["ORDER", "INVOICE"]),
	customerId: Z,
	locationId: Z.or(ec("")).optional(),
	accountingContactId: Z.or(ec("")).optional(),
	documentDate: Z,
	dueDate: Z.optional(),
	customerReference: u_,
	notes: u_,
	lines: A(d_).min(1).max(500)
}).strict(), m_ = j({
	kind: ec("EXPENSE"),
	supplierId: Z,
	supplierInvoiceNumber: Z,
	documentDate: Z,
	dueDate: Z,
	notes: u_,
	lines: A(f_).min(1).max(500)
}).strict(), h_ = (e) => qs([p_, m_]).parse(e), g_ = k().finite().nonnegative().refine((e) => Number.isSafeInteger(Math.round(e * 100)) && e === Math.round(e * 100) / 100, "Use an amount in whole cents within the supported range."), __ = j({
	operationId: Z,
	sourceName: D().trim().max(200),
	reviewed: zs(),
	declared: j({
		subtotal: g_,
		taxAmount: g_,
		total: g_
	}).strict(),
	payload: m_.extend({ notes: D().trim().max(1e3).optional() })
}).strict();
function v_(e) {
	return {
		...e.payload,
		notes: [
			e.payload.notes,
			`Reviewed source: ${e.sourceName || "Manual entry"}`,
			`Declared net / tax / total: ${e.declared.subtotal.toFixed(2)} / ${e.declared.taxAmount.toFixed(2)} / ${e.declared.total.toFixed(2)}`
		].filter(Boolean).join("\n")
	};
}
function y_(e) {
	let t = wp.getById(e.payload.supplierId);
	if (!t || t.status !== "ACTIVE") throw Error("Select an active supplier.");
	let n = j_(e.payload), r = e.payload.supplierInvoiceNumber.trim().toLowerCase(), i = sh.getAll(), a = new Set(i.filter((e) => e.status === "VOID").map((e) => e.id)), o = [...S_.filter((t) => t.operationId !== e.operationId && t.status !== "CANCELLED" && !(t.status === "POSTED" && t.documentId && a.has(t.documentId)) && t.payload.kind === "EXPENSE" && t.payload.supplierId === e.payload.supplierId && t.payload.supplierInvoiceNumber.trim().toLowerCase() === r).map((e) => ({
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
var b_ = () => I.getAll().filter((e) => e.active && e.type === "EXPENSE" && e.allowManualPosting && (!e.systemRole || e.systemRole === "OPERATING_EXPENSE" || e.systemRole === "FREIGHT")).map((e) => ({
	id: e.id,
	code: e.code,
	name: e.name
}));
b_();
var x_ = [], S_ = [], C_ = 0, w_ = /* @__PURE__ */ new Set(), T_ = () => {
	C_++, w_.forEach((e) => e());
}, E_ = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function D_(e, t) {
	return {
		action: e,
		actorId: N.current()?.userId ?? "local-test",
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...t ? { reason: t } : {}
	};
}
function O_(e) {
	for (let t of e) if (t.taxAmount) for (let [e, n] of [[t.taxCollectedAccountId, "LIABILITY"], [t.taxPaidAccountId, "ASSET"]]) {
		if (!e) continue;
		let t = I.requireById(e);
		if (!t.active || t.type !== n) throw Error("A snapshotted tax posting account is no longer active or has the wrong type.");
	}
}
function k_(e) {
	let t = I.requireById(e);
	if (!t.active || t.type !== "EXPENSE" || !t.allowManualPosting || t.systemRole && t.systemRole !== "OPERATING_EXPENSE" && t.systemRole !== "FREIGHT") throw Error("Use an active manual expense account, not an inventory, GRNI or control account.");
	return t;
}
function A_(e) {
	let t = e.payload;
	if (t.kind === "EXPENSE") {
		let n = wp.getById(t.supplierId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active supplier.");
		for (let t of e.lines) k_(t.expenseAccountId);
	} else {
		let n = au.getById(t.customerId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active customer.");
		for (let t of e.lines) id(t.productId, t.unitId, t.quantity, "sell");
	}
	O_(e.lines);
}
function j_(e) {
	if (p(e.documentDate, "Document date"), e.dueDate && (p(e.dueDate, "Due date"), e.dueDate < e.documentDate)) throw Error("Due date cannot precede document date.");
	if (e.kind !== "ORDER" && !e.dueDate) throw Error("Due date is required.");
	let t = e.kind === "EXPENSE" ? e.lines.map((e) => {
		k_(e.accountId);
		let t = a(e.taxCode), i = r(e.unitCost, t.taxRate, e.priceBasis), o = E_(e.quantity * i), s = (e.priceBasis ?? n().basis) === "Inclusive" ? E_(e.quantity * e.unitCost - o) : E_(o * t.taxRate);
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
			unitCost: i,
			...t,
			lineSubtotal: o,
			taxAmount: s,
			lineTotal: E_(o + s)
		};
	}) : e.lines.map((t) => Df({
		customerId: e.customerId,
		documentDate: e.documentDate,
		draft: t
	})), i = Ef(t);
	if (i.total <= 0 || !Number.isFinite(i.total)) throw Error("Document total must be finite and greater than zero.");
	return {
		lines: t,
		totals: i
	};
}
function M_(e) {
	let t = () => e === "sales" ? x_ : S_;
	function n(t) {
		return e === "sales" ? x_ = [...x_.filter((e) => e.id !== t.id), t] : S_ = [...S_.filter((e) => e.id !== t.id), t], T_(), t;
	}
	let r = (e) => {
		let n = t().find((t) => t.id === e);
		if (!n) throw Error("Draft not found.");
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
			history: [...e.history, D_(t, i)]
		});
	}
	let o = (e, t) => P_.save({
		operationId: e,
		payload: t
	});
	return {
		getAll: t,
		reviewCapture(t) {
			if (N.require("purchases.bill"), e !== "expense") throw Error("Capture is only available for expense bills.");
			return y_(__.parse(t));
		},
		capture(n) {
			if (N.require("purchases.bill"), e !== "expense") throw Error("Capture is only available for expense bills.");
			let r = __.parse(n);
			if (!r.reviewed) throw Error("Confirm that the supplier document has been reviewed.");
			let i = v_(r);
			if (t().find((e) => e.operationId === r.operationId)) return o(r.operationId, i);
			let a = y_(r);
			if (!a.matches) throw Error(a.issues.join(" "));
			return o(r.operationId, i);
		},
		save(a) {
			let o = j({
				operationId: Z,
				id: Z.optional(),
				expectedRevision: k().int().positive().optional(),
				payload: e === "sales" ? p_ : m_
			}).strict().parse(a), s = JSON.stringify(o.payload);
			if (!o.id) {
				let e = t().find((e) => e.operationId === o.operationId);
				if (e) {
					if (e.creationFingerprint !== s) throw Error("Operation ID was used for different draft data.");
					return e;
				}
			}
			let c = o.id ? r(o.id) : void 0;
			if (c && (i(c, o.expectedRevision ?? -1), c.status !== "DRAFT")) throw Error("Only unapproved drafts can be edited. Reopen an approved draft before editing.");
			let l = j_(o.payload), u = (/* @__PURE__ */ new Date()).toISOString(), d = {
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
				recipient: o.payload.kind === "EXPENSE" ? void 0 : nd(o.payload.customerId, o.payload),
				...l,
				createdAt: c?.createdAt ?? u,
				updatedAt: u,
				history: [...c?.history ?? [], D_(c ? "Edited" : "Created")]
			};
			if (c && c.kind !== d.kind) throw Error("Document kind cannot change.");
			return A_(d), n(d);
		},
		approve(e, t) {
			let n = r(e);
			if (n.status === "APPROVED" && n.revision === t + 1) return n;
			if (i(n, t), n.status !== "DRAFT") throw Error("Only a draft can be approved.");
			return A_(n), a(n, "Approved", { status: "APPROVED" });
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
			B(), Rc(n.payload.documentDate), A_(n);
			let o, s = n.payload;
			if (s.kind === "EXPENSE") {
				let e = wp.getById(s.supplierId), t = (/* @__PURE__ */ new Date()).toISOString(), r = {
					id: crypto.randomUUID(),
					managedDraftId: n.id,
					kind: "EXPENSE",
					billNumber: m("BILL", sh.getAll().map((e) => e.billNumber), s.documentDate.slice(0, 4)),
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
				sh.insertExpenseBill(r);
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
						...Lf(r.lines, "paid", !0, r.totals.taxAmount),
						{
							accountId: I.requireBySystemRole("ACCOUNTS_PAYABLE").id,
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
				o = s.kind === "ORDER" ? U.createManagedOrder(e).id : U.createManagedInvoice({
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
			return U.cancelManagedOrder(n.documentId, t), a(n, "Order cancelled", {}, t);
		}
	};
}
var N_ = M_("sales"), P_ = M_("expense"), F_ = j({
	recipient: j({
		locationId: D().optional(),
		locationName: D().optional(),
		deliveryAddress: D().optional(),
		accountingContactId: D().optional(),
		accountingContactName: D().optional(),
		accountingEmail: D().email().optional()
	}).strict().optional(),
	id: Z,
	operationId: Z,
	creationFingerprint: D().max(1e6),
	revision: k().int().positive(),
	kind: M([
		"ORDER",
		"INVOICE",
		"EXPENSE"
	]),
	status: M([
		"DRAFT",
		"APPROVED",
		"POSTED",
		"CANCELLED"
	]),
	payload: qs([p_, m_]),
	lines: A(j({
		id: Z,
		description: D().min(1),
		quantity: k().finite().positive(),
		unitSymbol: D().min(1),
		unitPrice: k().finite().nonnegative().optional(),
		unitCost: k().finite().nonnegative().optional(),
		taxRate: k().finite().min(0).max(1),
		taxCode: Z,
		taxPaidAccountId: Z.optional(),
		taxCollectedAccountId: Z.optional(),
		lineSubtotal: k().finite().nonnegative(),
		taxAmount: k().finite().nonnegative(),
		lineTotal: k().finite().nonnegative()
	}).passthrough()).min(1),
	totals: j({
		subtotal: k().finite(),
		taxAmount: k().finite(),
		total: k().finite()
	}),
	documentId: Z.optional(),
	createdAt: Z,
	updatedAt: Z,
	history: A(j({
		action: Z,
		actorId: Z,
		at: Z,
		reason: D().optional()
	}).strict()).min(1)
}).strict();
for (let e of ["sales", "expense"]) o(e === "sales" ? "managedSalesDocuments" : "expenseBillDrafts", {
	repository: e === "sales" ? N_ : P_,
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
	snapshot: () => e === "sales" ? { drafts: x_ } : {
		drafts: S_,
		options: b_()
	},
	restore: (t) => {
		e === "sales" ? x_ = t.drafts : (S_ = t.drafts, t.options);
	},
	publish: T_,
	validate: (t, n) => {
		let { drafts: r } = j({
			drafts: A(F_),
			...e === "expense" ? { options: A(j({
				id: Z,
				code: Z,
				name: Z
			}).strict()) } : {}
		}).strict().parse(t);
		for (let t of r) {
			if (rd(t.recipient), t.kind !== t.payload.kind || e === "expense" != (t.kind === "EXPENSE")) throw Error("Draft kind mismatch.");
			if (p(t.payload.documentDate), t.payload.dueDate && (p(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate)) throw Error("Draft due date is invalid.");
			let r = n, i = t.payload.kind === "EXPENSE" ? t.payload.supplierId : t.payload.customerId;
			if (!(t.payload.kind === "EXPENSE" ? r.suppliers.suppliers : r.customers.customers).some((e) => e.id === i) || t.lines.length !== t.payload.lines.length) throw Error("Draft party or line references are invalid.");
			for (let [e, n] of t.lines.entries()) {
				let i = t.payload.lines[e], a = n;
				if (t.kind !== "EXPENSE" && (td(a), Yu(a, r.products.products.find((e) => e.id === a.productId)), a.requestedArea !== i.requestedArea)) throw Error("Draft area requirement mismatch.");
				if (typeof a.quantity != "number" || !Number.isFinite(a.quantity) || a.quantity <= 0 || i.requestedArea === void 0 && a.quantity !== i.quantity || E_(a.lineSubtotal + a.taxAmount) !== a.lineTotal) throw Error("Draft line amounts are invalid.");
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
				if (E_(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Draft totals do not match lines.");
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
var I_ = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
];
function L_(e, t, n) {
	if (p(e), !Number.isSafeInteger(n) || n < 0 || !I_.includes(t)) throw Error("Invalid schedule occurrence.");
	let r = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	if (t === "Weekly" || t === "Fortnightly") r.setUTCDate(r.getUTCDate() + n * (t === "Weekly" ? 7 : 14));
	else {
		let e = r.getUTCDate();
		r.setUTCDate(1), r.setUTCMonth(r.getUTCMonth() + n * (t === "Monthly" ? 1 : 3));
		let i = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
		r.setUTCDate(Math.min(e, i));
	}
	let i = r.toISOString().slice(0, 10);
	return p(i), i;
}
function R_(e, t) {
	p(e);
	let n = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	n.setUTCDate(n.getUTCDate() + t);
	let r = n.toISOString().slice(0, 10);
	return p(r), r;
}
//#endregion
//#region src/features/recurring/recurringRepository.ts
var z_ = D().trim().min(1).max(200), B_ = D().refine((e) => {
	try {
		return p(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), V_ = j({
	operationId: z_,
	name: z_,
	sourceDraftId: z_,
	frequency: M(I_),
	firstDate: B_,
	endDate: B_
}).strict(), H_ = j({
	id: z_,
	expectedRevision: k().int().positive(),
	name: z_,
	endDate: B_
}).strict(), U_ = D().refine((e) => Number.isFinite(Date.parse(e)), "Invalid timestamp."), W_ = j({
	id: z_,
	name: z_,
	kind: M(["INVOICE", "EXPENSE"]),
	status: M([
		"Active",
		"Paused",
		"Ended"
	]),
	revision: k().int().positive(),
	operationId: z_,
	creationFingerprint: D().min(1).max(2e3),
	sourceDraftId: z_,
	payload: Vs(),
	frequency: M(I_),
	firstDate: B_,
	nextDate: B_,
	endDate: B_,
	occurrence: k().int().nonnegative(),
	termsDays: k().int().nonnegative(),
	createdAt: U_,
	updatedAt: U_
}).strict(), G_ = j({
	id: z_,
	scheduleId: z_,
	date: B_,
	draftId: z_,
	actorId: z_,
	createdAt: U_
}).strict(), K_ = 0, q_ = /* @__PURE__ */ new Set(), J_ = () => {
	K_++, q_.forEach((e) => e());
}, Y_ = {
	INVOICE: {
		schedules: [],
		runs: []
	},
	EXPENSE: {
		schedules: [],
		runs: []
	}
}, X_ = (e) => e === "INVOICE" ? "sales.manage" : "purchases.bill", Z_ = (e) => e === "INVOICE" ? N_ : P_, Q_ = () => (/* @__PURE__ */ new Date()).toISOString();
function $_(e) {
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
function ev(e) {
	let t = () => Y_[e], n = (e) => {
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
			N.require(X_(e));
			let r = V_.parse(n), i = JSON.stringify(r), a = t().schedules.find((e) => e.operationId === r.operationId);
			if (a) {
				if (a.creationFingerprint !== i) throw Error("Operation ID was used for a different recurring template.");
				return a;
			}
			let o = Z_(e).getAll().find((e) => e.id === r.sourceDraftId);
			if (!o || o.kind !== e || o.status === "CANCELLED") throw Error("Select an existing invoice or expense entry draft of the correct type.");
			if (r.endDate < r.firstDate) throw Error("End date must not precede first generation date.");
			let s = $_(o), c = Math.round((Date.parse(s.dueDate + "T00:00:00Z") - Date.parse(s.documentDate + "T00:00:00Z")) / 864e5), l = Q_(), u = {
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
			return t().schedules = [...t().schedules, u], J_(), u;
		},
		update(i) {
			N.require(X_(e));
			let a = H_.parse(i), o = n(a.id);
			if (r(o, a.expectedRevision), a.endDate < o.firstDate || o.occurrence && a.endDate < t().runs.filter((e) => e.scheduleId === o.id).map((e) => e.date).sort().at(-1)) throw Error("End date cannot precede the schedule start or its last generated occurrence.");
			let s = {
				...o,
				name: a.name,
				endDate: a.endDate,
				status: o.nextDate > a.endDate ? "Ended" : o.status === "Ended" ? "Paused" : o.status,
				revision: o.revision + 1,
				updatedAt: Q_()
			};
			return t().schedules = t().schedules.map((e) => e.id === o.id ? s : e), J_(), s;
		},
		setStatus(i) {
			N.require(X_(e));
			let a = j({
				id: z_,
				expectedRevision: k().int().positive(),
				status: M(["Active", "Paused"])
			}).strict().parse(i), o = n(a.id);
			if (r(o, a.expectedRevision), o.nextDate > o.endDate) throw Error("Extend the end date before resuming this ended schedule.");
			let s = {
				...o,
				status: a.status,
				revision: o.revision + 1,
				updatedAt: Q_()
			};
			return t().schedules = t().schedules.map((e) => e.id === o.id ? s : e), J_(), s;
		},
		generate(i) {
			N.require(X_(e));
			let a = j({
				id: z_,
				expectedRevision: k().int().positive(),
				date: B_
			}).strict().parse(i), o = n(a.id), s = t().runs.find((e) => e.scheduleId === o.id && e.date === a.date);
			if (s) return {
				schedule: o,
				run: s,
				draft: Z_(e).getAll().find((e) => e.id === s.draftId)
			};
			if (r(o, a.expectedRevision), o.status !== "Active") throw Error("Activate the schedule before generating.");
			if (a.date !== o.nextDate) throw Error("Generate the next occurrence in order.");
			if (a.date > u(Q_())) throw Error("This occurrence is not due yet.");
			if (a.date > o.endDate) throw Error("The schedule has ended.");
			let c = L_(o.firstDate, o.frequency, o.occurrence + 1), l = structuredClone(o.payload);
			l.documentDate = a.date, l.dueDate = R_(a.date, o.termsDays), l.kind === "EXPENSE" && (l.supplierInvoiceNumber = l.supplierInvoiceNumber.slice(0, 170) + " [" + a.date + "]");
			let d = Z_(e).save({
				operationId: "recurring:" + o.id + ":" + a.date,
				payload: l
			}), f = Q_(), p = {
				id: crypto.randomUUID(),
				scheduleId: o.id,
				date: a.date,
				draftId: d.id,
				actorId: N.current().userId,
				createdAt: f
			}, m = {
				...o,
				nextDate: c,
				occurrence: o.occurrence + 1,
				status: c > o.endDate ? "Ended" : "Active",
				revision: o.revision + 1,
				updatedAt: f
			};
			return t().schedules = t().schedules.map((e) => e.id === o.id ? m : e), t().runs = [...t().runs, p], J_(), {
				schedule: m,
				run: p,
				draft: d
			};
		}
	};
}
var tv = ev("INVOICE"), nv = ev("EXPENSE");
for (let e of ["INVOICE", "EXPENSE"]) o(e === "INVOICE" ? "recurringInvoices" : "recurringExpenses", {
	repository: e === "INVOICE" ? tv : nv,
	read: e === "INVOICE" ? "sales.read" : "purchases.read",
	commands: {
		create: X_(e),
		update: X_(e),
		setStatus: X_(e),
		generate: X_(e)
	},
	snapshot: () => structuredClone(Y_[e]),
	restore: (t) => {
		Y_[e] = t;
	},
	publish: J_,
	validate: (t, n) => {
		j({
			schedules: A(W_),
			runs: A(G_)
		}).strict().parse(t);
		let r = t, i = n;
		for (let t of r.schedules) {
			if (t.kind !== e || ![
				"Active",
				"Paused",
				"Ended"
			].includes(t.status) || !Number.isSafeInteger(t.revision) || t.revision < 1 || !Number.isSafeInteger(t.occurrence) || t.occurrence < 0 || !Number.isInteger(t.termsDays) || t.termsDays < 0 || t.payload.kind !== e) throw Error("Invalid recurring schedule.");
			if (V_.parse({
				operationId: t.operationId,
				name: t.name,
				sourceDraftId: t.sourceDraftId,
				frequency: t.frequency,
				firstDate: t.firstDate,
				endDate: t.endDate
			}), h_(t.payload), !t.id || !t.creationFingerprint || !Number.isFinite(Date.parse(t.createdAt)) || !Number.isFinite(Date.parse(t.updatedAt))) throw Error("Invalid recurring identity or audit timestamps.");
			if (p(t.payload.documentDate), p(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate || t.termsDays !== Math.round((Date.parse(t.payload.dueDate + "T00:00:00Z") - Date.parse(t.payload.documentDate + "T00:00:00Z")) / 864e5)) throw Error("Invalid recurring payment terms.");
			if (t.payload.kind === "EXPENSE") {
				if (!i.suppliers.suppliers.some((e) => e.id === t.payload.supplierId) || t.payload.lines.some((e) => !i.accounts.accounts.some((t) => t.id === e.accountId && t.type === "EXPENSE"))) throw Error("Recurring expense references are invalid.");
			} else if (!i.customers.customers.some((e) => e.id === t.payload.customerId) || t.payload.lines.some((e) => !i.products.products.some((t) => t.id === e.productId && t.units.some((t) => t.id === e.unitId)))) throw Error("Recurring invoice references are invalid.");
			if (t.status === "Ended" != t.nextDate > t.endDate) throw Error("Recurring end status is inconsistent.");
			if (t.nextDate !== L_(t.firstDate, t.frequency, t.occurrence) || t.endDate < t.firstDate) throw Error("Invalid recurring dates.");
			let n = (e === "INVOICE" ? i.managedSalesDocuments : i.expenseBillDrafts).drafts.find((e) => e.id === t.sourceDraftId);
			if (!n || n.kind !== e) throw Error("Recurring template source is missing.");
			let a = r.runs.filter((e) => e.scheduleId === t.id);
			if (a.length !== t.occurrence || new Set(a.map((e) => e.date)).size !== a.length) throw Error("Recurring run history does not match schedule.");
			for (let e = 0; e < a.length; e++) if (!a.some((n) => n.date === L_(t.firstDate, t.frequency, e))) throw Error("Recurring occurrences are incomplete.");
		}
		for (let t of r.runs) {
			let n = r.schedules.find((e) => e.id === t.scheduleId), a = (e === "INVOICE" ? i.managedSalesDocuments : i.expenseBillDrafts).drafts.find((e) => e.id === t.draftId);
			if (!n || !a || a.kind !== e || a.operationId !== "recurring:" + n.id + ":" + t.date || !t.actorId || !Number.isFinite(Date.parse(t.createdAt))) throw Error("Invalid recurring generated-draft reference.");
		}
	}
});
//#endregion
//#region src/features/supplier-returns/supplierReturnRepository.ts
var Q = D().trim().min(1).max(200), rv = k().finite().positive(), iv = k().finite().nonnegative(), av = j({
	operationId: Q,
	supplierBillId: Q,
	supplierCreditNumber: Q,
	returnDate: Q,
	reason: D().trim().min(3).max(2e3),
	lines: A(j({
		matchId: Q,
		quantity: rv
	}).strict()).min(1).max(500)
}).strict(), ov = j({
	id: Q,
	matchId: Q,
	supplierBillLineId: Q,
	goodsReceiptId: Q,
	goodsReceiptLineId: Q,
	productId: Q,
	unitId: Q,
	baseUnitId: Q,
	sku: Q,
	description: D(),
	unitSymbol: Q,
	quantity: rv,
	conversionToBase: rv,
	quantityBase: rv,
	siteId: Q,
	siteName: Q,
	inventoryMovementId: Q,
	costMovementId: Q,
	unitCostBase: iv,
	inventoryValue: iv,
	voidInventoryMovementId: Q.optional(),
	voidCostMovementId: Q.optional()
}).strict(), sv = j({
	id: Q,
	returnNumber: Q,
	operationId: Q,
	requestFingerprint: D().max(1e6),
	supplierBillId: Q,
	supplierBillNumber: Q,
	supplierId: Q,
	supplierName: Q,
	supplierCreditId: Q,
	returnDate: Q,
	reason: D().min(3).max(2e3),
	status: M(["POSTED", "VOID"]),
	lines: A(ov).min(1),
	inventoryValue: iv,
	journalId: Q.optional(),
	createdAt: Q,
	createdBy: Q,
	voidDate: Q.optional(),
	voidReason: D().optional(),
	voidedBy: Q.optional(),
	voidedAt: Q.optional()
}).strict(), cv = [], lv = 0, uv = /* @__PURE__ */ new Set(), dv = () => {
	lv++, uv.forEach((e) => e());
}, fv = (e) => Math.round(e * 1e4) / 1e4, pv = (e) => Math.round(e * 100) / 100;
function mv(e, t, n) {
	if (hm.getAll().some((r) => r.siteId === t && r.productId === n && u(r.occurredAt) > e)) throw Error("Return/reversal date precedes later inventory activity at this site.");
}
function hv(e) {
	let t = sh.getById(e);
	return !t || t.status === "VOID" || t.kind === "EXPENSE" || t.openingBalanceImportId ? [] : $m.getByBill(e).filter((e) => e.status === "ACTIVE").flatMap((e) => {
		let n = t.lines.find((t) => t.id === e.supplierBillLineId), r = Vm.getById(e.goodsReceiptId), i = r?.lines.find((t) => t.id === e.goodsReceiptLineId), a = n ? Qu(n.productId, n.unitId) : void 0;
		if (!n || !r || !i || !a) return [];
		let o = cv.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0);
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
o("physicalSupplierReturns", {
	repository: {
		create(e) {
			let t = av.parse(e), n = JSON.stringify(t), r = cv.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.requestFingerprint !== n) throw Error("Operation ID already used with different return data.");
				return r;
			}
			B(), p(t.returnDate, "Return date"), Rc(t.returnDate);
			let i = sh.getById(t.supplierBillId);
			if (!i || i.status === "VOID" || i.kind === "EXPENSE" || i.openingBalanceImportId) throw Error("Select an active stock bill matched to received goods.");
			if (t.returnDate < i.billDate) throw Error("Return date cannot precede bill date.");
			let a = hv(i.id), o = /* @__PURE__ */ new Set(), s = t.lines.map((e) => {
				if (o.has(e.matchId)) throw Error("Select each receipt match once.");
				o.add(e.matchId);
				let n = a.find((t) => t.matchId === e.matchId);
				if (!n) throw Error("Return line must belong to an active receipt match for this bill.");
				if (fv(e.quantity) !== e.quantity || e.quantity > n.availableQuantity + 1e-8) throw Error("Return quantity exceeds the matched receipt remainder or four decimal places.");
				if (t.returnDate < n.receiptDate) throw Error("Return date cannot precede receipt date.");
				let r = Zu(n.productId), i = Qu(n.productId, n.unitId), s = em.getById(n.siteId);
				if (!r || !i || !s || s.status !== "ACTIVE") throw Error("Return product, unit or active receiving site was not found.");
				if (r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(i.code) && !Number.isInteger(e.quantity)) throw Error("Whole packs must be returned in whole quantities.");
				mv(t.returnDate, s.id, r.id);
				let c = fv(e.quantity * n.conversionToBase);
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
				c.set(t, fv((c.get(t) ?? 0) + e.quantityBase));
			}
			for (let [e, t] of c) {
				let [n, r] = e.split("|");
				if ((Pm.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t) throw Error("Insufficient stock at the original receiving site.");
			}
			let l = /* @__PURE__ */ new Map();
			for (let e of s) {
				let t = i.lines.find((t) => t.id === e.supplierBillLineId), n = l.get(t.id);
				l.set(t.id, {
					supplierBillLineId: t.id,
					quantity: fv((n?.quantity ?? 0) + e.quantity),
					unitCost: t.unitCost
				});
			}
			let u = crypto.randomUUID(), d = "SR-" + t.returnDate.slice(0, 4) + "-" + String(cv.length + 1).padStart(5, "0"), f = q.createReturnCredit({
				sourceSupplierBillId: i.id,
				supplierCreditNumber: t.supplierCreditNumber,
				creditDate: t.returnDate,
				reason: t.reason,
				lines: [...l.values()]
			}, u), m = s.map((e) => {
				Pm.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let n = am.create({
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
				}), r = Om({
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
			}), h = pv(m.reduce((e, t) => e + t.inventoryValue, 0)), g = h ? L.post({
				journalDate: t.returnDate,
				description: `Physical supplier return ${d}`,
				reference: f.creditNumber,
				sourceType: "SUPPLIER_RETURN",
				sourceId: u,
				lines: [{
					accountId: I.requireBySystemRole("PURCHASE_PRICE_VARIANCE").id,
					debit: h,
					credit: 0
				}, {
					accountId: I.requireBySystemRole("INVENTORY").id,
					debit: 0,
					credit: h
				}]
			}) : void 0, ee = {
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
				lines: m,
				inventoryValue: h,
				journalId: g?.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				createdBy: N.current()?.userId ?? "local-test"
			};
			return cv = [ee, ...cv], dv(), ee;
		},
		reverse(e) {
			let t = j({
				returnId: Q,
				voidDate: Q,
				reason: D().trim().min(3).max(2e3)
			}).strict().parse(e), n = cv.find((e) => e.id === t.returnId);
			if (!n) throw Error("Supplier return not found.");
			if (n.status === "VOID") return n;
			if (B(), p(t.voidDate, "Reversal date"), Rc(t.voidDate), t.voidDate < n.returnDate) throw Error("Reversal date cannot precede return date.");
			for (let e of n.lines) mv(t.voidDate, e.siteId, e.productId);
			let r = q.getById(n.supplierCreditId);
			if ((r.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > t.voidDate) || q.getAllocationsByCredit(r.id).some((e) => e.reversedAt && u(e.reversedAt) > t.voidDate)) throw Error("Reversal date precedes later credit settlement activity.");
			q.voidReturnCredit({
				supplierCreditId: n.supplierCreditId,
				reason: t.reason,
				voidDate: t.voidDate
			});
			let i = n.lines.map((e) => {
				Pm.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let r = am.create({
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
				}), i = km({
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
			let a = {
				...n,
				status: "VOID",
				lines: i,
				voidDate: t.voidDate,
				voidReason: t.reason,
				voidedAt: (/* @__PURE__ */ new Date()).toISOString(),
				voidedBy: N.current()?.userId ?? "local-test"
			};
			return cv = cv.map((e) => e.id === n.id ? a : e), dv(), a;
		}
	},
	read: "purchases.return.read",
	commands: {
		create: "purchases.return",
		reverse: "purchases.return"
	},
	snapshot: () => ({ returns: cv }),
	restore: (e) => {
		cv = e.returns;
	},
	publish: dv,
	validate: (e, t) => {
		let n = j({ returns: A(sv) }).strict().parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.returns) {
			p(e.returnDate), e.voidDate && p(e.voidDate);
			let t = av.parse(JSON.parse(e.requestFingerprint));
			if (i.has(e.operationId) || t.operationId !== e.operationId || t.supplierBillId !== e.supplierBillId || t.returnDate !== e.returnDate) throw Error("Supplier return operation mismatch.");
			i.add(e.operationId);
			let n = r.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId && t.supplierId === e.supplierId), a = r.supplierCredits.supplierCredits.find((t) => t.id === e.supplierCreditId && t.physicalReturnId === e.id && t.sourceSupplierBillId === e.supplierBillId);
			if (!n || !a || e.status === "VOID" != (a.status === "VOID")) throw Error("Supplier return bill/credit reference is invalid.");
			if (pv(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue) throw Error("Supplier return cost total is invalid.");
			for (let t of e.lines) {
				let i = r.receiptMatches.matches.find((n) => n.id === t.matchId && n.supplierBillId === e.supplierBillId && n.supplierBillLineId === t.supplierBillLineId && n.goodsReceiptId === t.goodsReceiptId && n.goodsReceiptLineId === t.goodsReceiptLineId), a = r.costMovements.movements.find((e) => e.id === t.costMovementId), o = r.inventoryMovements.movements.find((e) => e.id === t.inventoryMovementId), s = r.goodsReceipts.goodsReceipts.find((e) => e.id === t.goodsReceiptId), c = n.lines.find((e) => e.id === t.supplierBillLineId);
				if (!i || !c || c.productId !== t.productId || c.unitId !== t.unitId || s?.siteId !== t.siteId || i.productId !== t.productId || !a || !o || a.referenceType !== "SUPPLIER_RETURN" || a.referenceId !== e.id || a.inventoryMovementId !== o.id || a.siteId !== t.siteId || a.productId !== t.productId || a.unitCostBase !== t.unitCostBase || a.quantityBase !== -t.quantityBase || pv(-a.valueChange) !== pv(t.inventoryValue) || fv(t.quantity * t.conversionToBase) !== t.quantityBase || o.referenceType !== "SUPPLIER_RETURN" || o.referenceId !== e.id || o.siteId !== t.siteId || o.productId !== t.productId || o.quantityBase !== -t.quantityBase || o.transactionQuantity !== -t.quantity || u(o.occurredAt) !== e.returnDate) throw Error("Supplier return stock/cost reference is invalid.");
				if (e.status === "VOID") {
					let n = r.costMovements.movements.find((e) => e.id === t.voidCostMovementId), i = r.inventoryMovements.movements.find((e) => e.id === t.voidInventoryMovementId);
					if (!n || !i || n.inventoryMovementId !== i.id || n.referenceType !== "SUPPLIER_RETURN_VOID" || n.referenceId !== e.id || n.siteId !== t.siteId || n.productId !== t.productId || n.quantityBase !== t.quantityBase || pv(n.valueChange) !== pv(t.inventoryValue) || i.referenceType !== "SUPPLIER_RETURN_VOID" || i.quantityBase !== t.quantityBase || i.referenceId !== e.id || u(n.occurredAt) !== e.voidDate) throw Error("Supplier return reversal reference is invalid.");
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
				let n = fv(e.lines.filter((e) => e.supplierBillLineId === t).reduce((e, t) => e + t.quantity, 0));
				if (!a.lines.some((e) => e.supplierBillLineId === t && e.quantity === n)) throw Error("Supplier return linked credit quantity mismatch.");
			}
			if (e.status === "VOID" && (!e.voidDate || e.voidDate < e.returnDate || !e.voidReason || !e.voidedBy)) throw Error("Supplier return reversal metadata is invalid.");
			if (e.inventoryValue && !r.journals.journalEntries.some((t) => t.id === e.journalId && t.sourceId === e.id && t.sourceType === "SUPPLIER_RETURN" && t.totalDebit === e.inventoryValue && (e.status === "VOID" ? t.status === "REVERSED" : t.status === "POSTED"))) throw Error("Supplier return journal reference is invalid.");
		}
		for (let e of r.supplierCredits.supplierCredits) if (e.physicalReturnId && !n.returns.some((t) => t.id === e.physicalReturnId && t.supplierCreditId === e.id)) throw Error("Supplier credit physical return reference is invalid.");
		for (let e of r.receiptMatches.matches) if (fv(n.returns.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0)) > e.matchedBaseQuantity + 1e-8) throw Error("Supplier return quantities exceed the receipt match.");
	}
});
//#endregion
//#region src/features/document-output/outputRepository.ts
var gv = D().min(1).max(200), _v = D().max(2e4), vv = _v.optional(), yv = [
	"QUOTE",
	"SALES_ORDER",
	"INVOICE",
	"CREDIT_NOTE"
], bv = j({
	operationId: gv,
	sourceId: gv,
	kind: M(yv),
	expectedUpdatedAt: gv,
	templateId: gv.optional()
}).strict(), xv = k().finite().nonnegative(), Sv = j({
	itemType: M([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	id: gv,
	sku: _v,
	description: _v,
	unitSymbol: _v,
	quantity: k().positive().finite(),
	unitPrice: xv,
	lineSubtotal: xv,
	taxAmount: xv,
	lineTotal: xv,
	taxCode: vv,
	taxRate: k().finite().min(0).max(1).optional(),
	requestedArea: k().positive().finite().optional(),
	areaPerPack: k().positive().finite().optional(),
	coveredArea: k().positive().finite().optional()
}).strict(), Cv = j({
	locationId: vv,
	locationName: vv,
	deliveryAddress: vv,
	accountingContactId: vv,
	accountingContactName: vv,
	accountingEmail: vv
}).strict(), wv = j({
	id: gv,
	revision: gv,
	name: _v,
	subject: _v,
	body: _v,
	footer: _v,
	paper: M(["A4", "Letter"])
}).strict(), Tv = j({
	id: gv,
	operationId: gv,
	requestFingerprint: _v,
	preparedAt: gv,
	preparedBy: gv,
	sourceId: gv,
	kind: M(yv),
	sourceUpdatedAt: gv,
	documentNumber: gv,
	status: gv,
	documentDate: gv,
	dueDate: vv,
	expiryDate: vv,
	reference: vv,
	notes: vv,
	customerId: gv,
	customerName: _v,
	customerCode: _v,
	customerIdentifier: vv,
	recipient: Cv.optional(),
	issuer: j({
		name: _v,
		tradingName: vv,
		identifier: vv,
		address: vv,
		email: vv,
		phone: vv,
		currency: gv
	}).strict(),
	lines: A(Sv).min(1),
	totals: j({
		subtotal: xv,
		taxAmount: xv,
		total: xv
	}).strict(),
	amountPaid: xv.optional(),
	amountDue: xv.optional(),
	template: wv,
	subject: _v,
	body: _v
}).strict();
function Ev(e, t) {
	if (e === "CREDIT_NOTE") {
		let e = V.getById(t);
		if (!e) throw Error("Credit note was not found.");
		return {
			...e,
			type: "CREDIT_NOTE",
			documentNumber: e.creditNoteNumber,
			documentDate: e.creditDate
		};
	}
	let n = U.getById(t);
	if (!n || n.type !== e) throw Error("Sales document was not found.");
	return n;
}
var Dv = (e) => e === "QUOTE" ? "Quotation" : e === "INVOICE" ? "Invoice" : e === "SALES_ORDER" ? "Sales order" : "Credit note";
function Ov() {
	return (d.templates ?? []).filter((e) => e.status === "Active" && [
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
var kv = [];
Ov();
var Av = 0, jv = /* @__PURE__ */ new Set(), Mv = () => {
	Av++, jv.forEach((e) => e());
};
function Nv(e, t) {
	let n = t ? d.templates?.find((n) => n.id === t && n.status === "Active" && n.kind === Dv(e)) : void 0;
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
var Pv = [
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
function Fv(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!Pv.includes(n)) throw Error(`Unsupported template token: ${n}.`);
		return t[n] ?? "";
	});
}
function Iv(e) {
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
var Lv = { prepare(e) {
	let t = bv.parse(e), r = JSON.stringify(t), i = kv.find((e) => e.operationId === t.operationId);
	if (i) {
		if (i.requestFingerprint !== r) throw Error("Operation ID was used for different output data.");
		return i;
	}
	let a = Ev(t.kind, t.sourceId);
	if (a.updatedAt !== t.expectedUpdatedAt) throw Error("Source document changed. Reload before preparing output.");
	let o = au.getById(a.customerId);
	if (!o) throw Error("Source customer was not found.");
	let s = n(), c = Nv(t.kind, t.templateId), l = structuredClone(a.recipient), u = {
		documentNumber: a.documentNumber,
		customerName: o.businessName,
		companyName: s.companyName,
		currency: s.currency,
		total: a.totals.total.toFixed(2),
		documentDate: a.documentDate,
		dueDate: "dueDate" in a ? a.dueDate : "",
		store: l?.locationName ?? "",
		accountingContact: l?.accountingContactName ?? ""
	}, d = {
		id: crypto.randomUUID(),
		operationId: t.operationId,
		requestFingerprint: r,
		preparedAt: (/* @__PURE__ */ new Date()).toISOString(),
		preparedBy: N.current()?.userId ?? "local-test",
		sourceId: a.id,
		kind: t.kind,
		sourceUpdatedAt: a.updatedAt,
		documentNumber: a.documentNumber,
		status: a.status,
		documentDate: a.documentDate,
		dueDate: "dueDate" in a ? a.dueDate : void 0,
		expiryDate: "expiryDate" in a ? a.expiryDate : void 0,
		reference: "customerReference" in a ? a.customerReference : void 0,
		notes: "reason" in a ? a.reason : a.notes,
		customerId: o.id,
		customerName: o.businessName,
		customerCode: o.code,
		customerIdentifier: o.abn,
		recipient: l,
		issuer: {
			name: s.companyName,
			tradingName: s.tradingName,
			identifier: s.identifier,
			address: s.address,
			email: s.email,
			phone: s.phone,
			currency: s.currency
		},
		lines: a.lines.map(Iv),
		totals: structuredClone(a.totals),
		amountPaid: "amountPaid" in a ? a.amountPaid : void 0,
		amountDue: "amountDue" in a ? a.amountDue : void 0,
		template: {
			...c,
			footer: Fv(c.footer, u)
		},
		subject: Fv(c.subject, u),
		body: Fv(c.body, u)
	};
	return Rv(d), kv = [d, ...kv], Mv(), d;
} };
function Rv(e) {
	let t = Tv.parse(e);
	if (rd(t.recipient), !Number.isFinite(Date.parse(t.preparedAt))) throw Error("Invalid preparation timestamp.");
	let n = bv.parse(JSON.parse(t.requestFingerprint));
	if (n.operationId !== t.operationId || n.sourceId !== t.sourceId || n.kind !== t.kind || n.expectedUpdatedAt !== t.sourceUpdatedAt) throw Error("Output source metadata mismatch.");
	let r = (e) => Math.round(e * 100) / 100;
	for (let e of t.lines) if (td(e), r(e.lineSubtotal + e.taxAmount) !== e.lineTotal) throw Error("Invalid output line total.");
	for (let [e, n] of [
		["subtotal", "lineSubtotal"],
		["taxAmount", "taxAmount"],
		["total", "lineTotal"]
	]) if (r(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Invalid output totals.");
	return t;
}
o("preparedSalesOutputs", {
	repository: Lv,
	read: "sales.read",
	commands: { prepare: "documents.prepare" },
	snapshot: () => ({
		artifacts: kv,
		templates: Ov()
	}),
	restore: (e) => {
		kv = e.artifacts, e.templates;
	},
	publish: Mv,
	validate: (e, t) => {
		let n = j({
			artifacts: A(Tv),
			templates: A(j({
				id: gv,
				name: _v,
				kind: gv
			}).strict())
		}).strict().parse(e), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
		for (let e of n.artifacts) {
			if (Rv(e), r.has(e.id) || i.has(e.operationId)) throw Error("Duplicate prepared output.");
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
//#region src/features/accounting/data/inventoryAccountingPostingService.ts
function zv(e) {
	return I.requireBySystemRole(e).id;
}
function Bv(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Vv(e) {
	return L.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function Hv(e) {
	let t = hm.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var Uv = {
	postSalesFulfilment(e) {
		let t = Vv(e.id);
		if (t) return t;
		let n = Bv(Hv(e).reduce((e, t) => {
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
				accountId: zv("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: zv("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = Vv(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? L.getById(r.reversalJournalEntryId) : void 0 : L.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, Wv = /* @__PURE__ */ new Set(), Gv = [], Kv = Gv;
function qv() {
	Kv = Gv, Wv.forEach((e) => e());
}
function Jv() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Gv.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function Yv(e, t) {
	return W(Gv.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function Xv(e) {
	let t = U.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.filter(Ju).map((e) => Yv(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.filter(Ju).every((e, t) => n[t] >= W(e.quantity));
	U.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function Zv(e) {
	let t = hm.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var Qv = {
	subscribe(e) {
		return Wv.add(e), () => {
			Wv.delete(e);
		};
	},
	getSnapshot() {
		return Kv;
	},
	getAll() {
		return Kv;
	},
	getById(e) {
		return Gv.find((t) => t.id === e);
	},
	getBySalesOrder(e) {
		return Gv.filter((t) => t.salesOrderId === e);
	},
	getFulfilledQuantity: Yv,
	getRemainingQuantity(e, t) {
		let n = U.getById(e);
		if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let r = n.lines.find((e) => e.id === t);
		if (!r) throw Error("Sales order line was not found.");
		return Ju(r) ? W(r.quantity - Yv(e, t)) : 0;
	},
	create(e) {
		let t = U.getById(e.salesOrderId);
		if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let n = t;
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "INVOICED") throw Error("Only a confirmed or partially fulfilled sales order can be fulfilled.");
		if (n.status === "INVOICED" && !n.invoiceIds.some((e) => {
			let t = U.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("This order has no active invoice; do not fulfil a void invoice.");
		let r = em.getById(e.siteId);
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
			if (!Ju(t)) throw Error("Non-stock and service lines do not require inventory dispatch.");
			let i = Zu(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let o = Qu(t.productId, t.unitId);
			if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
			if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
			let s = W(e.fulfilledQuantity);
			if (t.areaPerPack && !Number.isInteger(e.fulfilledQuantity)) throw Error("Area-based lines must be dispatched in whole packs.");
			let c = Yv(n.id, t.id);
			if (s > W(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
			let l = W(s * o.conversionToBase), u = Pm.getBalance(r.id, t.productId);
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
			let n = Pm.getBalance(r.id, e);
			if (!n || n.quantityOnHand < t) {
				let t = Zu(e);
				throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
			}
		}
		let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = Jv(), d = o.map((e) => ({
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
			let i = Zu(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let a = am.create({
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
			Om({
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
			}), Pm.issue({
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: t.fulfilledBaseQuantity
			});
		}
		return Uv.postSalesFulfilment(f), Gv = [f, ...Gv], qv(), Xv(n.id), f;
	},
	void(e) {
		let t = Gv.find((t) => t.id === e.fulfilmentId);
		if (!t) throw Error("Sales fulfilment was not found.");
		if (t.status === "VOIDED") throw Error("Sales fulfilment has already been voided.");
		if (Number.isNaN(Date.parse(e.voidDate))) throw Error("Fulfilment void date is invalid.");
		if (e.voidDate < t.fulfilmentDate) throw Error("Fulfilment void date cannot be earlier than the fulfilment date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Fulfilment void reason must contain at least 3 characters.");
		let r = U.getById(t.salesOrderId);
		if (!r || r.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		if (r.status === "INVOICED" && r.invoiceIds.some((e) => {
			let t = U.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("Cannot void a sales fulfilment for an invoiced sales order.");
		if (r.status !== "CONFIRMED" && r.status !== "PARTIALLY_FULFILLED" && r.status !== "FULFILLED" && r.status !== "INVOICED") throw Error(`Cannot void a sales fulfilment when the sales order status is ${r.status}.`);
		let i = Zv(t), a = /* @__PURE__ */ new Set(), o = t.lines.map((e) => {
			let n = Zu(e.productId);
			if (!n) throw Error(`Product ${e.sku} was not found.`);
			let r = i.find((n) => !a.has(n.id) && n.siteId === t.siteId && n.productId === e.productId && Math.abs(n.quantityBase) === e.fulfilledBaseQuantity);
			if (!r) throw Error(`Unique original inventory cost issue for ${e.sku} was not found.`);
			return a.add(r.id), {
				line: e,
				product: n,
				originalIssue: r
			};
		});
		Uv.reverseSalesFulfilment({
			fulfilment: t,
			reversalDate: e.voidDate,
			reason: n
		});
		for (let r of o) {
			let { line: i, product: a, originalIssue: o } = r, s = am.create({
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
			km({
				siteId: t.siteId,
				productId: i.productId,
				quantityBase: i.fulfilledBaseQuantity,
				unitCostBase: o.unitCostBase,
				inventoryValue: Vp(Math.abs(o.valueChange)),
				referenceType: "SALE",
				referenceId: t.id,
				referenceNumber: t.fulfilmentNumber,
				inventoryMovementId: s.id,
				occurredAt: e.voidDate,
				notes: `Void sales fulfilment ${t.fulfilmentNumber}: ${n}`
			}), Pm.receive({
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
		return Gv = Gv.map((e) => e.id === s.id ? s : e), qv(), Xv(t.salesOrderId), s;
	}
};
o("fulfilments", {
	repository: Qv,
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: Gv }),
	restore: (e) => {
		Gv = e.fulfilments, Kv = Gv;
	},
	publish: () => Wv.forEach((e) => e())
});
//#endregion
//#region src/features/direct-documents/dispatchRepository.ts
var $v = D().trim().min(1).max(200), ey = j({
	operationId: $v,
	salesOrderId: $v,
	siteId: $v,
	fulfilmentDate: $v,
	lines: A(j({
		salesOrderLineId: $v,
		fulfilledQuantity: k().positive().finite()
	}).strict()).min(1).max(500)
}).strict();
function ty() {
	return U.getAll().filter((e) => e.type === "SALES_ORDER" && [
		"CONFIRMED",
		"PARTIALLY_FULFILLED",
		"INVOICED"
	].includes(e.status)).filter((e) => e.type === "SALES_ORDER" && (e.status !== "INVOICED" || e.invoiceIds.some((e) => {
		let t = U.getById(e);
		return t?.type === "INVOICE" && t.status !== "VOID";
	}))).map((e) => ({
		id: e.id,
		number: e.documentNumber,
		date: e.documentDate,
		delivery: e.recipient?.deliveryAddress,
		store: e.recipient?.locationName,
		lines: e.lines.filter(Ju).map((t) => ({
			id: t.id,
			sku: t.sku,
			description: t.description,
			unit: t.unitSymbol,
			quantity: t.quantity,
			fulfilled: Qv.getAll().filter((t) => t.salesOrderId === e.id && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t.id).reduce((e, t) => e + t.fulfilledQuantity, 0)
		}))
	})).filter((e) => e.lines.length > 0);
}
ty();
var ny = [], ry = 0, iy = /* @__PURE__ */ new Set(), ay = () => {
	ry++, iy.forEach((e) => e());
};
o("salesDispatch", {
	repository: {
		record(e) {
			let t = ey.parse(e), n = JSON.stringify(t), r = ny.find((e) => e.id === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Dispatch operation ID was already used with different data.");
				return Qv.getAll().find((e) => e.id === r.fulfilmentId);
			}
			if (B(), p(t.fulfilmentDate), Rc(t.fulfilmentDate), new Set(t.lines.map((e) => e.salesOrderLineId)).size !== t.lines.length) throw Error("Each dispatch line must be selected only once.");
			let i = Qv.create(t);
			return ny = [...ny, {
				id: t.operationId,
				fingerprint: n,
				fulfilmentId: i.id
			}], ay(), i;
		},
		reverse(e) {
			let t = j({
				fulfilmentId: $v,
				voidDate: $v,
				reason: D().trim().min(3).max(1e3)
			}).strict().parse(e);
			B(), p(t.voidDate), Rc(t.voidDate);
			let n = Qv.getAll().find((e) => e.id === t.fulfilmentId);
			return n?.status === "VOIDED" ? n : Qv.void(t);
		}
	},
	read: "inventory.read",
	commands: {
		record: "inventory.adjust",
		reverse: "inventory.adjust"
	},
	snapshot: () => ({
		orders: ty(),
		requests: ny
	}),
	restore: (e) => {
		e.orders, ny = e.requests;
	},
	publish: ay,
	validate: (e, t) => {
		let n = j({
			orders: A(j({
				id: $v,
				number: $v,
				date: $v,
				delivery: D().optional(),
				store: D().optional(),
				lines: A(j({
					id: $v,
					sku: D(),
					description: D(),
					unit: D(),
					quantity: k().finite().positive(),
					fulfilled: k().finite().nonnegative()
				}).strict())
			}).strict()),
			requests: A(j({
				id: $v,
				fingerprint: D().max(1e6),
				fulfilmentId: $v
			}).strict())
		}).strict().parse(e), r = t.fulfilments.fulfilments;
		if (n.requests.some((e) => !r.some((t) => t.id === e.fulfilmentId))) throw Error("Dispatch result reference is invalid.");
	}
});
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function oy(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function sy(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) {
		if (r.has(t.id)) {
			i = oy(i + t.moneyIn), a = oy(a + t.moneyOut);
			continue;
		}
		o = oy(o + t.moneyIn), s = oy(s + t.moneyOut);
	}
	let c = oy(oy(t) + o - s), l = oy(e.closingBalance), u = oy(c - l);
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
var cy = /* @__PURE__ */ new Set(), ly = P.read().reconciliations;
P.onRollback(() => {
	ly = P.read().reconciliations;
});
function uy() {
	P.update("reconciliations", ly), cy.forEach((e) => P.notify(e));
}
function dy(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function fy(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function py() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function my(e) {
	return `BREC-${e.slice(0, 4)}-${String(ly.length + 1).padStart(4, "0")}`;
}
function hy(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of ly) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var gy = {
	subscribe(e) {
		return cy.add(e), () => {
			cy.delete(e);
		};
	},
	getSnapshot() {
		return ly;
	},
	getAll() {
		return ly;
	},
	getByBankAccount(e) {
		return ly.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return hy(e);
	},
	complete(e) {
		if (fy(e.statementDate), p(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let t = Ku.requireById(e.bankAccountId);
		if (!t.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < t.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let n = this.getLatestByBankAccount(t.id);
		if (n && e.statementDate <= n.statementDate) throw Error(`Statement date must be after the last reconciled date ${n.statementDate}.`);
		let r = Wh(t, L.getAll(), e.statementDate), i = new Set(r.transactions.map((e) => e.id)), a = hy(t.id), o = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !a.has(e));
		for (let e of o) if (!i.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let s = /* @__PURE__ */ new Set([...a, ...o]), c = sy(r, dy(e.statementBalance), Array.from(s));
		if (!c.reconciled) throw Error(`Bank reconciliation is out by ${c.difference.toFixed(2)}.`);
		let l = {
			id: py(),
			reconciliationNumber: my(e.statementDate),
			bankAccountId: t.id,
			statementDate: e.statementDate,
			statementBalance: dy(e.statementBalance),
			bookBalance: c.bookBalance,
			outstandingDeposits: c.outstandingDeposits,
			outstandingPayments: c.outstandingPayments,
			adjustedStatementBalance: c.adjustedStatementBalance,
			difference: c.difference,
			clearedTransactionIds: o,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ly = [l, ...ly], uy(), l;
	}
}, _y = gy.complete;
gy.complete = function(e) {
	return B(), P.transaction(() => _y.call(gy, e));
}, o("bankReconciliations", {
	repository: gy,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: ly }),
	restore: (e) => {
		ly = e.reconciliations;
	},
	publish: () => cy.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/settlementRepository.ts
var vy = (e) => Math.round((e + 2 ** -52) * 100) / 100, yy = D().trim().min(1).max(200), by = k().finite().positive().refine((e) => vy(e) === e, "Use cents precision"), xy = j({
	operationId: yy,
	customerId: yy,
	paymentDate: yy,
	bankAccountId: yy,
	reference: D().max(500).optional(),
	allocations: A(j({
		invoiceId: yy,
		amount: by
	}).strict()).min(1).max(500)
}).strict(), Sy = j({
	operationId: yy,
	creditId: yy,
	paymentDate: yy,
	bankAccountId: yy,
	amount: by,
	reference: D().max(500).optional()
}).strict(), Cy = [], wy = [], Ty = [], Ey = 0, Dy = /* @__PURE__ */ new Set(), Oy = () => {
	Ey++, Dy.forEach((e) => e());
};
function ky(e, t, n) {
	let r = JSON.stringify(n), i = e.find((e) => e.operationId === t);
	if (i && i.fingerprint !== r) throw Error("Operation ID was already used with different data.");
	return {
		old: i,
		fingerprint: r
	};
}
function Ay(e, t) {
	p(t, "Payment date");
	let n = Ku.requireById(e);
	if (!n.active || t < n.openingBalanceDate) throw Error("Bank is inactive or payment precedes its opening date.");
	let r = I.requireById(n.glAccountId);
	if (!r.active || r.type !== "ASSET") throw Error("Invalid bank ledger account.");
	return n;
}
function jy(e) {
	if (gy.getAll().some((t) => t.clearedTransactionIds.some((t) => t.startsWith(e + ":")))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function My(e, t) {
	let n = e === "customer" ? V.getById(t) : q.getById(t);
	if (!n || n.status === "VOID" || n.status === "DRAFT") throw Error("An issued credit is required.");
	return n;
}
function Ny(e, t, n) {
	let r = My(e, t), i = vy(n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0)), a = vy(r.totals.total - r.amountApplied - i);
	if (a < 0) throw Error("Refund exceeds the unused credit.");
	let o = {
		...r,
		refundEvents: n,
		amountRefunded: i,
		amountAvailable: a,
		status: a === 0 ? "FULLY_APPLIED" : "ISSUED",
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	e === "customer" ? V.update(o) : q.update(o);
}
function Py(e, t) {
	B();
	let n = Sy.parse(t), { old: r, fingerprint: i } = ky(e === "customer" ? wy : Ty, n.operationId, n);
	if (r) return r;
	let a = My(e, n.creditId), o = Ay(n.bankAccountId, n.paymentDate);
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
	return Ny(e, a.id, [...a.refundEvents ?? [], {
		id: u.id,
		date: u.paymentDate,
		amount: u.amount
	}]), e === "customer" ? wy = [...wy, u] : Ty = [...Ty, u], Oy(), u;
}
function Fy(e, t) {
	if (B(), p(t.reversalDate, "Reversal date"), !t.reason?.trim() || t.reason.trim().length < 3) throw Error("Enter a reversal reason.");
	let n = e === "customer" ? wy : Ty, r = n.find((e) => e.id === t.id);
	if (!r) throw Error("Refund was not found.");
	if (r.status === "REVERSED") return r;
	if (t.reversalDate < r.paymentDate) throw Error("Reversal cannot precede the refund.");
	jy(r.journalEntryId), L.reverse({
		journalEntryId: r.journalEntryId,
		reversalDate: t.reversalDate,
		reason: t.reason
	});
	let i = My(e, r.creditId);
	Ny(e, i.id, (i.refundEvents ?? []).map((e) => e.id === r.id ? {
		...e,
		reversalDate: t.reversalDate
	} : e));
	let a = {
		...r,
		status: "REVERSED",
		reversalDate: t.reversalDate
	};
	return e === "customer" ? wy = n.map((e) => e.id === r.id ? a : e) : Ty = n.map((e) => e.id === r.id ? a : e), Oy(), a;
}
var Iy = {
	recordReceipt(e) {
		let t = xy.parse(e), { old: n, fingerprint: r } = ky(Cy, t.operationId, t);
		if (n) return n;
		if (Ay(t.bankAccountId, t.paymentDate), new Set(t.allocations.map((e) => e.invoiceId)).size !== t.allocations.length) throw Error("Each invoice may only be allocated once.");
		for (let e of t.allocations) {
			let n = U.getAll().find((t) => t.id === e.invoiceId && t.type === "INVOICE");
			if (!n || n.type !== "INVOICE" || n.customerId !== t.customerId || t.paymentDate < n.documentDate || ["VOID", "DRAFT"].includes(n.status) || e.amount > n.amountDue) throw Error("Invalid invoice customer, date or outstanding amount.");
		}
		let i = t.allocations.map((e, n) => U.recordInvoicePayment({
			...t,
			invoiceId: e.invoiceId,
			amount: e.amount,
			method: "BANK_TRANSFER",
			operationId: t.operationId + ":" + n
		})), a = {
			...t,
			id: crypto.randomUUID(),
			fingerprint: r,
			amount: vy(i.reduce((e, t) => e + t.amount, 0)),
			paymentIds: i.map((e) => e.id),
			status: "POSTED"
		};
		return Cy = [...Cy, a], Oy(), a;
	},
	reverseReceipt(e) {
		let t = Cy.find((t) => t.id === e.id);
		if (!t) throw Error("Receipt not found.");
		if (t.status === "REVERSED") return t;
		for (let e of t.paymentIds) {
			let t = Pf.getById(e);
			if (!t || t.status !== "RECEIVED") throw Error("Receipt allocations changed; inspect individual payments first.");
			for (let t of L.getBySource("CUSTOMER_PAYMENT", e)) jy(t.id);
		}
		for (let n of t.paymentIds) U.reverseInvoicePayment(n, e.reason);
		let n = {
			...t,
			status: "REVERSED",
			reversalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		};
		return Cy = Cy.map((e) => e.id === t.id ? n : e), Oy(), n;
	},
	createRefund: (e) => Py("customer", e),
	reverseRefund: (e) => Fy("customer", e)
}, Ly = {
	create: (e) => Py("supplier", e),
	reverse: (e) => Fy("supplier", e),
	repairLegacyCredits(e) {
		if (B(), p(e.date, "Repair date"), e.reason?.trim().length < 3) throw Error("Enter a repair reason.");
		let t = [];
		for (let n of q.getAll().filter((e) => e.status !== "VOID")) {
			if (e.date < n.creditDate || L.getBySource("SUPPLIER_CREDIT_RECLASS", n.id).length) continue;
			let r = L.getBySource("SUPPLIER_CREDIT", n.id).find((e) => e.status === "POSTED");
			if (!r) continue;
			let i = I.requireBySystemRole("INVENTORY"), a = I.requireBySystemRole("PURCHASE_PRICE_VARIANCE"), o = vy(r.lines.filter((e) => e.accountId === i.id).reduce((e, t) => e + t.credit - t.debit, 0));
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
}, Ry = j({
	id: yy,
	operationId: yy,
	fingerprint: yy,
	creditId: yy,
	contactId: yy,
	paymentDate: yy,
	bankAccountId: yy,
	amount: by,
	journalEntryId: yy,
	status: M(["POSTED", "REVERSED"]),
	reference: D().optional(),
	reversalDate: D().optional()
}).strict();
o("customerSettlements", {
	repository: Iy,
	read: "sales.read",
	commands: {
		recordReceipt: "sales.payment",
		reverseReceipt: "sales.payment",
		createRefund: "sales.payment",
		reverseRefund: "sales.payment"
	},
	snapshot: () => ({
		receipts: Cy,
		refunds: wy
	}),
	restore: (e) => {
		Cy = e.receipts, wy = e.refunds;
	},
	validate: (e, t) => {
		zy(e, t, !1);
		let n = e;
		A(Ry.extend({ fingerprint: D() })).parse(n.refunds), A(j({
			id: yy,
			operationId: yy,
			paymentIds: A(yy),
			amount: by,
			status: M(["POSTED", "REVERSED"])
		}).passthrough()).parse(n.receipts);
	},
	publish: Oy
}), o("supplierRefunds", {
	repository: Ly,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		repairLegacyCredits: "accounting.recover"
	},
	snapshot: () => ({ refunds: Ty }),
	restore: (e) => {
		Ty = e.refunds;
	},
	validate: (e, t) => {
		zy(e, t, !0), A(Ry.extend({ fingerprint: D() })).parse(e.refunds);
	},
	publish: Oy
});
function zy(e, t, n) {
	let r = e, i = t.journals.journalEntries, a = n ? t.supplierCredits.supplierCredits : t.customerCredits.creditNotes, o = t.bankAccounts.bankAccounts;
	for (let e of r.refunds) {
		let t = a.find((t) => t.id === e.creditId), r = i.find((t) => t.id === e.journalEntryId), s = t?.refundEvents?.find((t) => t.id === e.id);
		if (!t || e.contactId !== ("customerId" in t ? t.customerId : t.supplierId) || !s || s.amount !== e.amount || s.date !== e.paymentDate || s.reversalDate !== e.reversalDate || !o.some((t) => t.id === e.bankAccountId) || !r || r.sourceId !== e.id || r.sourceType !== (n ? "SUPPLIER_REFUND" : "CUSTOMER_REFUND") || r.totalDebit !== e.amount || r.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) throw Error("Refund snapshot relationships are invalid.");
	}
	for (let e of a) {
		let t = vy(r.refunds.filter((t) => t.creditId === e.id && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
		if ((e.amountRefunded ?? 0) !== t) throw Error("Credit refunded balance is invalid.");
	}
	for (let e of a) for (let t of e.refundEvents ?? []) if (!r.refunds.some((n) => n.id === t.id && n.creditId === e.id)) throw Error("Credit refund history has no settlement record.");
	if (!n) {
		let e = t.customerPayments.payments;
		for (let t of r.receipts ?? []) {
			let n = t.paymentIds.map((t) => e.find((e) => e.id === t));
			if (new Set(t.paymentIds).size !== t.paymentIds.length || !n.length || n.some((e) => !e || e.customerId !== t.customerId || e.bankAccountId !== t.bankAccountId || e.status !== (t.status === "REVERSED" ? "REVERSED" : "RECEIVED")) || vy(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== t.amount) throw Error("Receipt allocation snapshot relationships are invalid.");
		}
	}
}
//#endregion
//#region src/features/sales/data/invoiceBalanceAsAtService.ts
function By(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= Uy(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: Wy(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => Vy(e, r)), a = Wy(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && Hy(t, r)), s = Wy(o.reduce((e, t) => e + t.amount, 0)), c = Wy(e.totals.total), l = Wy(Math.max(0, c - a - s));
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
function Vy(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Uy(e.reversedAt) : !1;
}
function Hy(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Uy(e.reversedAt) : !1;
}
function Uy(e) {
	return u(e);
}
function Wy(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function Gy(e, t, n) {
	let r = Jy(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= qy(e.voidedAt)) return Ky(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && Hy(t, n)), a = Jy(i.reduce((e, t) => e + t.amount, 0)), o = Jy(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - a));
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
function Ky(e, t, n) {
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
function qy(e) {
	return u(e);
}
function Jy(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function Yy(e, t, n = [], r = [], i = [], a = Qy()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = By(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = Xy(e.dueDate, a);
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
		current: $y(s.current),
		days1To30: $y(s.days1To30),
		days31To60: $y(s.days31To60),
		days61To90: $y(s.days61To90),
		days90Plus: $y(s.days90Plus)
	}, p = $y(c), m = $y(l), h = $y(i.reduce((t, n) => n.customerId === e.id ? t + Gy(n, r, a).amountAvailable : t, 0)), g = $y(p - h);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: h,
		netAccountBalance: g,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: $y(Math.max(0, e.creditLimit - Math.max(0, g))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function Xy(e, t = Qy()) {
	let n = Zy(e), r = Zy(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Zy(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function Qy() {
	return u((/* @__PURE__ */ new Date()).toISOString());
}
function $y(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function eb(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function tb(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function nb(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? eb(t - n) : eb(n - t);
}
function rb(e, t, n) {
	tb(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = eb(t + r.debit), n = eb(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: nb(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = eb(r.reduce((e, t) => e + t.totalDebit, 0)), o = eb(r.reduce((e, t) => e + t.totalCredit, 0));
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
function ib(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ab({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = Yy(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: ib(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = ib(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = ib(rb(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = ib(l - d);
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
function ob(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && sb(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = cb(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && sb(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = cb(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && sb(n.reversedAt) <= r ? t : t + n.amount, 0)), o = cb(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: cb(Math.max(0, o - i - a))
	};
}
function sb(e) {
	return u(e);
}
function cb(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function lb(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && ub(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = db(e.totals.total), i = db(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && ub(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: db(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - i))
	};
}
function ub(e) {
	return u(e);
}
function db(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function fb(e, t, n = [], r = [], i = [], a = yb()) {
	let o = hb(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = ob(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = mb(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = vb(r.reduce((t, n) => n.supplierId === e.id ? t + lb(n, i, a).amountAvailable : t, 0)), p = vb(s), m = vb(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: vb(c),
		aging: gb(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function pb(e, t, n = [], r = [], i = [], a = yb()) {
	let o = hb(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let h of e) {
		let e = fb(h, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: vb(s),
		unallocatedCredit: vb(c),
		totalOutstanding: vb(l),
		overdueAmount: vb(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: gb(o)
	};
}
function mb(e, t = yb()) {
	let n = _b(e), r = _b(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function hb() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function gb(e) {
	return {
		current: vb(e.current),
		days1To30: vb(e.days1To30),
		days31To60: vb(e.days31To60),
		days61To90: vb(e.days61To90),
		days90Plus: vb(e.days90Plus)
	};
}
function _b(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function vb(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function yb() {
	return u((/* @__PURE__ */ new Date()).toISOString());
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function bb(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function xb({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = pb(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = bb(rb(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = bb(c.totalOutstanding), f = bb(d - u);
	return {
		asOfDate: s,
		grossOutstanding: bb(c.grossOutstanding),
		unallocatedCredit: bb(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function Sb(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function Cb(e) {
	return e.slice(0, 10);
}
function wb(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function Tb(e, t) {
	Sb(t);
	let n = e.filter((e) => Cb(e.occurredAt) <= t).slice().sort(wb), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = W(n.quantityOnHand + e.quantityBase), a = Vp(n.inventoryValue + e.valueChange);
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
		let t = em.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = Zu(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : Bp(e.inventoryValue / e.quantityOnHand);
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
		totalInventoryValue: Vp(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function Eb(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Db(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function Ob({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	Db(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = Tb(n, r), o = Eb(rb(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = Eb(a.totalInventoryValue), c = Eb(s - o);
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
var kb = (e) => Math.round((e + 2 ** -52) * 100) / 100, $ = D().trim().min(1).max(200), Ab = k().finite().refine((e) => kb(e) === e, "Amounts must use cents precision"), jb = j({
	accountId: $,
	debit: Ab.nonnegative(),
	credit: Ab.nonnegative()
}).strict(), Mb = j({
	contactId: $,
	reference: $,
	date: $,
	dueDate: $,
	amount: Ab
}).strict(), Nb = j({
	operationId: $,
	date: $,
	reason: D().trim().min(3).max(1e3),
	gl: A(jb).min(2).max(5e3),
	ar: A(Mb).max(1e4),
	ap: A(Mb).max(1e4),
	banks: A(j({
		bankAccountId: $,
		amount: Ab
	}).strict()).max(500),
	stock: A(j({
		siteId: $,
		productId: $,
		quantity: k().positive().finite(),
		unitCost: k().nonnegative().finite()
	}).strict()).max(1e4)
}).strict(), Pb = [], Fb = 0, Ib = /* @__PURE__ */ new Set(), Lb = () => {
	Fb++, Ib.forEach((e) => e());
};
function Rb() {
	return ee();
}
function zb(e) {
	t(e), Ld(e.sales), Yd(e.customerCredits), P.update("supplierBills", e.supplierBills.supplierBills), P.update("supplierCredits", e.supplierCredits.supplierCredits);
}
function Bb(e, t) {
	if (new Set(e).size !== e.length) throw Error("Duplicate " + t + ".");
}
function Vb(e) {
	let t = Nb.parse(e);
	if (p(t.date, "Cutover date"), Rc(t.date), B(), Pb.some((e) => e.status === "POSTED")) throw Error("An opening batch is already active. Reverse the unused batch before replacing it.");
	let n = Rb();
	if (n.journals.journalEntries.some((e) => e.journalDate >= t.date)) throw Error("Cutover must be after all existing ledger activity. This import adds historical balances, never replaces existing transactions.");
	if (n.inventoryMovements.movements.some((e) => e.occurredAt.slice(0, 10) >= t.date)) throw Error("Cutover must be after existing inventory activity.");
	Bb(t.gl.map((e) => e.accountId), "GL account"), Bb(t.banks.map((e) => e.bankAccountId), "bank"), Bb(t.stock.map((e) => e.siteId + ":" + e.productId), "site/product");
	let r = ab({
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
	}), i = xb({
		suppliers: n.suppliers.suppliers,
		bills: n.supplierBills.supplierBills,
		payments: n.supplierPayments.supplierPayments,
		credits: n.supplierCredits.supplierCredits,
		creditAllocations: n.supplierCredits.allocations,
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: t.date
	}), a = Ob({
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
	let o = I.getAll(), s = (e) => I.requireBySystemRole(e).id, c = (e) => kb(t.gl.filter((t) => t.accountId === e).reduce((e, t) => e + t.debit - t.credit, 0));
	for (let e of t.gl) {
		let t = I.requireById(e.accountId);
		if (!t.active || ![
			"ASSET",
			"LIABILITY",
			"EQUITY"
		].includes(t.type) || e.debit > 0 && e.credit > 0 || e.debit + e.credit <= 0) throw Error("Opening GL requires active balance-sheet accounts and one positive debit or credit per row.");
	}
	let l = kb(t.gl.reduce((e, t) => e + t.debit, 0)), u = kb(t.gl.reduce((e, t) => e + t.credit, 0));
	if (l !== u || !l) throw Error("Opening trial balance does not balance.");
	let d = kb(t.ar.reduce((e, t) => e + t.amount, 0)), f = kb(t.ap.reduce((e, t) => e + t.amount, 0));
	if (c(s("ACCOUNTS_RECEIVABLE")) !== d || c(s("ACCOUNTS_PAYABLE")) !== -f) throw Error("AR/AP detail must equal imported GL control balances. Negative detail creates an unused historical credit.");
	for (let [e, r] of [["ar", t.ar], ["ap", t.ap]]) {
		Bb(r.map((e) => e.contactId + ":" + e.reference.toLowerCase()), e + " reference");
		for (let i of r) {
			if (p(i.date), p(i.dueDate), !i.amount || i.date > t.date || i.dueDate < i.date) throw Error("Invalid outstanding document amount/date.");
			if (!(e === "ar" ? n.customers.customers : n.suppliers.suppliers).some((e) => e.id === i.contactId)) throw Error("Opening contact not found.");
			if ((e === "ar" ? [...n.sales.invoices.map((e) => [e.customerId, e.documentNumber]), ...n.customerCredits.creditNotes.map((e) => [e.customerId, e.creditNoteNumber])] : [...n.supplierBills.supplierBills.map((e) => [e.supplierId, e.supplierInvoiceNumber]), ...n.supplierCredits.supplierCredits.map((e) => [e.supplierId, e.supplierCreditNumber])]).some(([e, t]) => e === i.contactId && t.toLowerCase() === i.reference.toLowerCase())) throw Error("Historical document reference already exists.");
		}
	}
	let m = 0;
	for (let e of t.stock) {
		let t = Zu(e.productId), n = em.getById(e.siteId);
		if (!t || t.status !== "ACTIVE" || t.itemType === "SERVICE" || n?.status !== "ACTIVE") throw Error("Opening stock requires active stocked products/sites.");
		if (Math.round(e.quantity * 1e4) / 1e4 !== e.quantity) throw Error("Stock quantities use at most four decimal places.");
		m = kb(m + kb(e.quantity * e.unitCost));
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
			let { input: t, debit: n, credit: r, ar: i, ap: a, inventory: o } = Vb(e);
			return {
				date: t.date,
				debit: n,
				credit: r,
				ar: i,
				ap: a,
				inventory: o,
				bank: kb(t.banks.reduce((e, t) => e + t.amount, 0)),
				documents: t.ar.length + t.ap.length
			};
		},
		post(e) {
			let t = Nb.parse(e), n = JSON.stringify(t), r = Pb.find((e) => e.operationId === t.operationId);
			if (n.length > 5e7) throw Error("Opening import exceeds 50 MB.");
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID already used for different opening data.");
				return r;
			}
			let { input: i, s: a } = Vb(t), o = crypto.randomUUID(), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
				id: o,
				operationId: i.operationId,
				fingerprint: n,
				date: i.date,
				reason: i.reason,
				status: "POSTED",
				actor: N.current()?.userId ?? "",
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
				let g = e === "ar" == t.amount > 0, ee = L.post({
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
				c.journalIds.push(ee.id), g ? d += r : f += r;
			}
			a.journals = Rb().journals, zb(a);
			let p = i.gl.filter((e) => ![l("ACCOUNTS_RECEIVABLE"), l("ACCOUNTS_PAYABLE")].includes(e.accountId));
			(d || f) && p.push({
				accountId: u,
				debit: kb(d),
				credit: kb(f)
			});
			let m = /* @__PURE__ */ new Map();
			for (let e of p) m.set(e.accountId, kb((m.get(e.accountId) ?? 0) + e.debit - e.credit));
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
				let t = Zu(e.productId), n = t.units.find((e) => e.id === t.baseUnitId), r = am.create({
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
				Pm.receive({
					siteId: e.siteId,
					productId: t.id,
					baseUnitId: t.baseUnitId,
					quantityBase: e.quantity
				});
				let a = Dm({
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
			return Pb = [...Pb, c], Lb(), c;
		},
		reverse(e) {
			if (p(e.date), Rc(e.date), B(), !e.reason?.trim() || e.reason.trim().length < 3) throw Error("Reversal reason is required.");
			let t = Pb.find((t) => t.id === e.id);
			if (!t) throw Error("Opening batch not found.");
			if (t.status === "REVERSED") return t;
			if (e.date < t.date) throw Error("Reversal date precedes cutover.");
			let n = Rb();
			if (n.journals.journalEntries.some((e) => !t.priorJournalIds.includes(e.id) && !t.journalIds.includes(e.id)) || n.inventoryMovements.movements.some((e) => !t.priorMovementIds.includes(e.id) && !t.movementIds.includes(e.id))) throw Error("Subsequent accounting or inventory activity exists. Reverse downstream activity before correcting opening balances.");
			let r = n.sales.invoices.filter((e) => t.invoiceIds.includes(e.id)), i = n.supplierBills.supplierBills.filter((e) => t.billIds.includes(e.id)), a = [...n.customerCredits.creditNotes.filter((e) => t.customerCreditIds.includes(e.id)), ...n.supplierCredits.supplierCredits.filter((e) => t.supplierCreditIds.includes(e.id))];
			if (r.some((e) => e.amountPaid !== 0 || e.amountDue !== e.totals.total) || i.some((e) => e.totals.amountPaid !== 0 || e.totals.amountCredited !== 0) || a.some((e) => e.amountApplied !== 0 || (e.amountRefunded ?? 0) !== 0)) throw Error("Opening balances have allocations or settlements. Reverse downstream allocations before correcting them.");
			for (let e of ["customerSettlements", "supplierRefunds"]) if (JSON.stringify(n[e]).includes(t.id)) throw Error("Opening balances have downstream settlements.");
			for (let e of t.journalIds) jy(e);
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
			return n.stock.balances = t.priorStock, n.costBalances.balances = t.priorCost, n.journals = Rb().journals, zb(n), Pb = Pb.map((n) => n.id === t.id ? {
				...n,
				status: "REVERSED",
				reversalDate: e.date,
				reversalReason: e.reason
			} : n), Lb(), Pb.find((e) => e.id === t.id);
		}
	},
	read: "accounting.read",
	commands: {
		preview: "accounting.post",
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ batches: Pb }),
	restore: (e) => {
		Pb = e.batches;
	},
	publish: Lb,
	validate: (e, t) => {
		let n = j({ batches: A(j({
			id: $,
			operationId: $,
			date: $,
			status: M(["POSTED", "REVERSED"]),
			journalIds: A($),
			invoiceIds: A($),
			billIds: A($),
			customerCreditIds: A($),
			supplierCreditIds: A($),
			fingerprint: D().min(1).max(5e7),
			reason: D().min(3),
			actor: $,
			createdAt: $,
			movementIds: A($),
			costMovementIds: A($),
			priorJournalIds: A($),
			priorMovementIds: A($),
			priorStock: A(j({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: k().finite().nonnegative(),
				updatedAt: $
			}).strict()),
			priorCost: A(j({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: k().finite().nonnegative(),
				averageCostPerBaseUnit: k().finite().nonnegative(),
				inventoryValue: k().finite().nonnegative(),
				costingMethod: ec("MOVING_WEIGHTED_AVERAGE"),
				updatedAt: $
			}).strict()),
			reversalDate: $.optional(),
			reversalReason: D().optional()
		}).strict()) }).strict().parse(e);
		for (let e of n.batches) {
			let n = Nb.parse(JSON.parse(e.fingerprint));
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
var Hb = /* @__PURE__ */ new Set(), Ub = P.read().supplierPayments;
P.onRollback(() => {
	Ub = P.read().supplierPayments;
});
function Wb() {
	P.update("supplierPayments", Ub), Hb.forEach((e) => P.notify(e));
}
var Gb = {
	subscribe(e) {
		return Hb.add(e), () => {
			Hb.delete(e);
		};
	},
	getSnapshot() {
		return Ub;
	},
	getAll() {
		return Ub;
	},
	getById(e) {
		return Ub.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return Ub.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return Ub.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: qb(e.reference),
			notes: qb(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: Jb(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = Ub.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (p(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = wp.getById(e.supplierId);
		if (!r) throw Error("Supplier was not found.");
		if (!e.paymentDate) throw Error("Payment date is required.");
		if (!e.method) throw Error("Payment method is required.");
		if (!e.bankAccountId) throw Error("Bank account is required.");
		let i = Ku.getById(e.bankAccountId);
		if (!i) throw Error("Bank account was not found.");
		if (!i.active) throw Error("The selected bank account is inactive.");
		let a = e.allocations.filter((e) => Number.isFinite(e.amount) && e.amount > 0);
		if (a.length === 0) throw Error("Allocate the payment to at least one supplier bill.");
		let o = /* @__PURE__ */ new Set(), s = a.map((t) => {
			if (o.has(t.supplierBillId)) throw Error("A supplier bill cannot appear more than once in the same payment.");
			o.add(t.supplierBillId);
			let n = sh.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = Jb(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${Yb(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), c = Jb(s.reduce((e, t) => e + t.amount, 0));
		if (c <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of s) sh.applyPayment(e.supplierBillId, e.amount);
		let l = (/* @__PURE__ */ new Date()).toISOString(), u = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: Kb(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: c,
			method: e.method,
			bankAccountId: i.id,
			reference: qb(e.reference),
			notes: qb(e.notes),
			allocations: s,
			status: "POSTED",
			createdAt: l,
			updatedAt: l
		};
		return Ub = [u, ...Ub], Wb(), Qp.postSupplierPayment(u), u;
	},
	reverse(e, t) {
		Dc("SUPPLIER_PAYMENT", e);
		let n = Ub.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = sh.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) sh.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return Ub = Ub.map((t) => t.id === e ? a : t), Wb(), Qp.reverseSupplierPayment(a), a;
	}
};
function Kb(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = Ub.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function qb(e) {
	return e?.trim() || void 0;
}
function Jb(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Yb(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: n().currency
	}).format(e);
}
var Xb = Gb.create;
Gb.create = function(...e) {
	return B(), P.transaction(() => Xb.apply(Gb, e));
};
var Zb = Gb.reverse;
Gb.reverse = function(...e) {
	return B(), P.transaction(() => Zb.apply(Gb, e));
}, o("supplierPayments", {
	repository: Gb,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: Ub }),
	restore: (e) => {
		Ub = e.supplierPayments;
	},
	publish: () => Hb.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/paymentBatchRepository.ts
var Qb = (e) => Math.round((e + 2 ** -52) * 100) / 100, $b = D().trim().min(1).max(200), ex = j({
	operationId: $b,
	paymentDate: $b,
	bankAccountId: $b,
	reference: D().max(500),
	allocations: A(j({
		supplierBillId: $b,
		amount: k().finite().positive().refine((e) => Qb(e) === e)
	}).strict()).min(1).max(500)
}).strict(), tx = [], nx = 0, rx = /* @__PURE__ */ new Set(), ix = () => {
	nx++, rx.forEach((e) => e());
}, ax = () => {
	let e = N.current();
	if (!e) throw Error("A verified session is required.");
	return e.userId;
};
function ox(e, t) {
	return {
		action: e,
		reason: t,
		actor: ax(),
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function sx(e) {
	let t = tx.find((t) => t.id === e);
	if (!t) throw Error("Payment batch was not found.");
	return t;
}
function cx(e) {
	return tx = tx.map((t) => t.id === e.id ? e : t), ix(), e;
}
function lx(e) {
	p(e.paymentDate, "Payment date");
	let t = Ku.requireById(e.bankAccountId);
	if (!t.active || e.paymentDate < t.openingBalanceDate) throw Error("Invalid paying bank account/date.");
	if (new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length) throw Error("Select each bill only once.");
	for (let t of e.allocations) {
		let n = sh.getById(t.supplierBillId);
		if (!n || n.status === "VOID" || t.amount > n.totals.amountDue || e.paymentDate < n.billDate) throw Error("A bill amount, date or outstanding balance changed. Review the batch.");
	}
}
o("paymentBatches", {
	repository: {
		create(e) {
			let t = ex.parse(e), n = JSON.stringify(t), r = tx.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID was used with different batch data.");
				return r;
			}
			lx(t);
			let i = {
				...t,
				id: crypto.randomUUID(),
				fingerprint: n,
				status: "DRAFT",
				createdBy: ax(),
				paymentIds: [],
				history: [ox("Created")]
			};
			return tx = [...tx, i], ix(), i;
		},
		approve(e) {
			let t = sx(e);
			if (t.status === "APPROVED") return t;
			if (t.status !== "DRAFT") throw Error("Only a draft batch can be approved.");
			return lx(t), cx({
				...t,
				status: "APPROVED",
				approvedBy: ax(),
				history: [...t.history, ox("Approved")]
			});
		},
		post(e) {
			let t = sx(e);
			if (t.status === "POSTED") return t;
			if (t.status !== "APPROVED") throw Error("Approve the batch before recording payments.");
			B(), lx(t);
			let n = /* @__PURE__ */ new Map();
			for (let e of t.allocations) {
				let t = sh.getById(e.supplierBillId);
				n.set(t.supplierId, [...n.get(t.supplierId) ?? [], e]);
			}
			let r = [...n].map(([e, n]) => Gb.create({
				operationId: "batch:" + t.id + ":" + e,
				supplierId: e,
				paymentDate: t.paymentDate,
				bankAccountId: t.bankAccountId,
				reference: t.reference,
				method: "BANK_TRANSFER",
				allocations: n
			}));
			return cx({
				...t,
				status: "POSTED",
				paymentIds: r.map((e) => e.id),
				history: [...t.history, ox("Payments recorded")]
			});
		},
		cancel(e) {
			let t = sx(e.id);
			if (!["DRAFT", "APPROVED"].includes(t.status) || e.reason?.trim().length < 3) throw Error("Only an unposted batch can be cancelled, with a reason.");
			return cx({
				...t,
				status: "CANCELLED",
				history: [...t.history, ox("Cancelled", e.reason)]
			});
		},
		reverse(e) {
			let t = sx(e.id);
			if (t.status === "REVERSED") return t;
			if (t.status !== "POSTED" || e.reason?.trim().length < 3) throw Error("A posted batch and reversal reason are required.");
			B();
			for (let e of t.paymentIds) {
				let t = Gb.getById(e);
				if (!t || t.status !== "POSTED") throw Error("Batch payments changed. Inspect before reversing.");
				Dc("SUPPLIER_PAYMENT", e);
			}
			for (let n of t.paymentIds) Gb.reverse(n, e.reason);
			return cx({
				...t,
				status: "REVERSED",
				history: [...t.history, ox("Reversed", e.reason)]
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
	snapshot: () => ({ batches: tx }),
	restore: (e) => {
		tx = e.batches;
	},
	validate: (e, t) => {
		let n = j({ batches: A(ex.extend({
			id: $b,
			fingerprint: D(),
			status: M([
				"DRAFT",
				"APPROVED",
				"POSTED",
				"REVERSED",
				"CANCELLED"
			]),
			createdBy: $b,
			approvedBy: $b.optional(),
			paymentIds: A($b),
			history: A(j({
				action: $b,
				actor: $b,
				at: $b,
				reason: D().optional()
			}))
		})) }).strict().parse(e), r = t.supplierPayments.supplierPayments;
		for (let e of n.batches) {
			if (!["POSTED", "REVERSED"].includes(e.status)) continue;
			let n = e.paymentIds.map((e) => r.find((t) => t.id === e));
			if (!n.length || n.some((t) => !t || t.bankAccountId !== e.bankAccountId || t.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) || Qb(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== Qb(e.allocations.reduce((e, t) => e + t.amount, 0))) throw Error("Batch payment relationships are invalid.");
			if (e.paymentIds.some((e) => !t.journals.journalEntries.some((t) => t.sourceType === "SUPPLIER_PAYMENT" && t.sourceId === e))) throw Error("A batch payment journal is missing.");
		}
	},
	publish: ix
});
//#endregion
//#region src/features/finance-closure/bankStatementRepository.ts
var ux = (e) => Math.round((e + 2 ** -52) * 100) / 100, dx = D().min(1).max(200), fx = [], px = 0, mx = /* @__PURE__ */ new Set(), hx = () => {
	px++, mx.forEach((e) => e());
};
function gx(e) {
	let t = Ku.requireById(e);
	if (!t.active) throw Error("Select an active bank account.");
	return t;
}
function _x(e) {
	let t = fx.find((t) => t.id === e);
	if (!t) throw Error("Statement line was not found.");
	return t;
}
function vx(e) {
	if (e.status !== "UNMATCHED") throw Error("This line is already processed. Revert it before changing it.");
	let t = gy.getLatestByBankAccount(e.bankAccountId);
	if (t && e.date <= t.statementDate) throw Error("Statement date is already reconciled.");
}
function yx(e) {
	return fx = fx.map((t) => t.id === e.id ? e : t), hx(), e;
}
var bx = (e, t) => Wh(gx(e), L.getAll(), t).transactions, xx = j({
	date: dx,
	description: D().trim().min(1).max(1e3),
	amount: k().finite().refine((e) => e !== 0 && ux(e) === e, "Enter a non-zero amount in cents"),
	reference: D().max(500).default(""),
	externalId: D().max(200).default("")
}).strict(), Sx = {
	importRows(e) {
		let t = j({
			bankAccountId: dx,
			rows: A(xx).min(1).max(1e4)
		}).strict().parse(e), n = gx(t.bankAccountId), r = 0, i = [...fx], a = [];
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
			let s = gy.getLatestByBankAccount(n.id);
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
		return fx = i, hx(), {
			created: a.length,
			duplicates: r
		};
	},
	importCsv(e) {
		if (typeof e.csv != "string" || e.csv.length > 1e7) throw Error("CSV exceeds the 10 MB limit.");
		let t = hg(e.csv.replace(/^\uFEFF/, "")), n = t.shift()?.map((e) => e.trim().toLowerCase()) ?? [];
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
		return Sx.importRows({
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
					l = ux(t - e);
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
		return p(e.asOfDate, "As-of date"), bx(e.bankAccountId, e.asOfDate).filter((e) => e.journalStatus === "POSTED" && !fx.some((t) => t.ledgerIds.includes(e.id)));
	},
	match(e) {
		let t = _x(e.id);
		if (vx(t), !Array.isArray(e.ledgerIds) || !e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Select unique ledger entries.");
		let n = Sx.candidates({
			bankAccountId: t.bankAccountId,
			asOfDate: t.date
		}), r = e.ledgerIds.map((e) => n.find((t) => t.id === e));
		if (r.some((e) => !e) || ux(r.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== t.amount) throw Error("Selected bank entries must match this signed statement amount exactly.");
		return yx({
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
		let t = _x(e.id);
		return (d["bank-rules"] ?? []).filter((e) => e.status === "Active" && e.enabled !== "No").filter((e) => {
			let n = (e.field === "Reference" ? t.reference : e.field === "Description" ? t.description : "").toLowerCase(), r = e.value.toLowerCase();
			return e.operator === "Equals" ? n === r : e.operator === "Starts with" ? n.startsWith(r) : n.includes(r);
		});
	},
	post(e) {
		B();
		let t = _x(e.id), n = JSON.stringify(e.splits);
		if (t.status === "POSTED") {
			if (t.fingerprint !== n) throw Error("Line was already posted with different categorisation.");
			return t;
		}
		vx(t);
		let r = A(j({
			accountId: dx,
			amount: k().finite().positive().refine((e) => ux(e) === e),
			taxCode: dx
		}).strict()).min(1).max(100).parse(e.splits);
		if (ux(r.reduce((e, t) => e + t.amount, 0)) !== Math.abs(t.amount)) throw Error("Split amounts must equal the statement total.");
		let i = gx(t.bankAccountId), o = t.amount < 0, c = r.flatMap((e) => {
			let t = I.requireById(e.accountId);
			if (!t.active || !t.allowManualPosting || !["EXPENSE", "REVENUE"].includes(t.type)) throw Error("Use an active manual expense/revenue account. Payments against AR/AP must be matched to their source documents.");
			let n = s(e.taxCode), r = ux(e.amount / (1 + n)), i = ux(e.amount - r);
			return [{
				accountId: t.id,
				debit: o ? r : 0,
				credit: o ? 0 : r
			}, ...i ? [{
				accountId: (o ? a(e.taxCode).taxPaidAccountId : a(e.taxCode).taxCollectedAccountId) || I.requireBySystemRole(o ? "GST_RECEIVABLE" : "GST_PAYABLE").id,
				debit: o ? i : 0,
				credit: o ? 0 : i
			}] : []];
		}), l = L.post({
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
		return yx({
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
		let t = _x(e.id);
		if (vx(t), e.reason?.trim().length < 3) throw Error("Enter an exclusion reason.");
		return yx({
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
		B();
		let t = _x(e.id);
		if (p(e.reversalDate, "Reversal date"), e.reason?.trim().length < 3 || e.reversalDate < t.date) throw Error("Enter a reason and a reversal date on or after the statement line.");
		if (t.status === "UNMATCHED") throw Error("Line is already unmatched.");
		for (let e of t.ledgerIds) jy(e.split(":")[0]);
		let n = gy.getLatestByBankAccount(t.bankAccountId);
		if (n && t.date <= n.statementDate) throw Error("Reconciled statement lines cannot be reverted.");
		return t.status === "POSTED" && t.journalEntryId && L.reverse({
			journalEntryId: t.journalEntryId,
			reversalDate: e.reversalDate,
			reason: e.reason
		}), yx({
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
		if (Rc(e.statementDate), B(), p(e.statementDate, "Statement date"), !fx.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate)) throw Error("Import the statement first.");
		if (fx.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate && t.status === "UNMATCHED")) throw Error("Process every statement line before completing reconciliation.");
		let t = fx.filter((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate).flatMap((e) => e.ledgerIds);
		return gy.complete({
			...e,
			clearedTransactionIds: [.../* @__PURE__ */ new Set([...gy.getClearedTransactionIds(e.bankAccountId), ...t])]
		});
	}
}, Cx = j({
	id: dx,
	key: D(),
	bankAccountId: dx,
	date: dx,
	description: D(),
	reference: D(),
	amount: k().finite(),
	externalId: D(),
	status: M([
		"UNMATCHED",
		"MATCHED",
		"POSTED",
		"IGNORED"
	]),
	ledgerIds: A(dx),
	journalEntryId: D().optional(),
	fingerprint: D().optional(),
	history: A(j({
		action: D(),
		date: D(),
		reason: D().optional()
	}))
}).strict();
o("bankStatements", {
	repository: Sx,
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
	snapshot: () => ({ lines: fx }),
	restore: (e) => {
		fx = e.lines;
	},
	validate: (e) => {
		A(Cx).parse(e.lines);
	},
	publish: hx
});
//#endregion
//#region src/features/business-workspace/productRepository.ts
var wx = j({
	id: D().min(1),
	code: M([
		"M2",
		"LM",
		"BOX",
		"PIECE",
		"ROLL",
		"BUCKET",
		"HOUR",
		"JOB"
	]),
	name: D().trim().min(1),
	symbol: D().min(1),
	conversionToBase: k().finite().positive(),
	basePrice: k().finite().nonnegative(),
	isBaseUnit: zs(),
	active: zs()
}).strict(), Tx = j({
	id: D().min(1),
	sku: D().trim().min(1).max(80),
	name: D().trim().min(1).max(180),
	category: M([
		"Timber",
		"Hybrid",
		"Laminate",
		"Vinyl",
		"Carpet",
		"Accessories",
		"Other"
	]),
	brand: D().optional(),
	collection: D().optional(),
	description: D().optional(),
	status: M(["ACTIVE", "INACTIVE"]),
	baseUnitId: D().min(1),
	units: A(wx).min(1),
	createdAt: D(),
	updatedAt: D(),
	revision: k().int().nonnegative().optional(),
	itemType: M([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	buyEnabled: zs().optional(),
	sellEnabled: zs().optional(),
	reorderPoint: k().finite().nonnegative().optional(),
	targetStock: k().finite().nonnegative().optional(),
	wholePacks: zs().optional(),
	taxCode: D().min(1).optional()
}).strict(), Ex = /* @__PURE__ */ new Set(), Dx = [...Xu];
function Ox() {
	Dx = [...Xu], Ex.forEach((e) => e());
}
function kx(e, t, n) {
	if (Array.isArray(e)) return e.some((e) => kx(e, t, n));
	if (!e || typeof e != "object") return !1;
	let r = e;
	return r.productId === t && (!n || r.unitId === n) || Object.values(r).some((e) => kx(e, t, n));
}
function Ax(e) {
	let t = A(Tx).parse(e), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.id) || r.has(e.sku.toLowerCase())) throw Error("Duplicate product ID or SKU.");
		if (n.add(e.id), r.add(e.sku.toLowerCase()), !qu(e) && e.buyEnabled !== !1) throw Error("Non-stock/service catalogue items must use expense bills for purchasing.");
		if (!qu(e) && ((e.reorderPoint ?? 0) !== 0 || (e.targetStock ?? 0) !== 0)) throw Error("Non-stock/service items cannot have stock reorder thresholds.");
		if (qu(e) && e.units.some((e) => e.code === "HOUR" || e.code === "JOB")) throw Error("Hour/job units require non-stock or service items.");
		if (new Set(e.units.map((e) => e.id)).size !== e.units.length || e.units.filter((e) => e.isBaseUnit).length !== 1 || !e.units.some((t) => t.id === e.baseUnitId && t.isBaseUnit && t.conversionToBase === 1)) throw Error("A product needs exactly one valid base unit.");
		if ((e.targetStock ?? 0) < (e.reorderPoint ?? 0)) throw Error("Target stock must be at least the reorder point.");
	}
	return t;
}
o("products", {
	validate: (e, t) => {
		let n = Ax(e.products), r = t.workspace_tax_codes.records, i = t.costingPolicies.policies, a = t.stock.balances;
		for (let e of n.filter((e) => !qu(e))) if (i.some((t) => t.productId === e.id && t.active) || a.some((t) => t.productId === e.id && t.quantityOnHand !== 0)) throw Error("Non-stock/service product has inventory activity or active costing.");
		if (n.some((e) => !r.some((t) => t.code === (e.taxCode ?? "GST")))) throw Error("Backup product tax-code reference is invalid.");
	},
	repository: {
		subscribe(e) {
			return Ex.add(e), () => {
				Ex.delete(e);
			};
		},
		getSnapshot: () => Dx,
		getAll: () => Xu,
		getById: (e) => Xu.find((t) => t.id === e),
		save(e, t) {
			let n = Tx.parse(e), r = Xu.find((e) => e.id === n.id);
			if (r && t !== (r.revision ?? 0)) throw Error("Product changed since it was opened. Reload before saving.");
			if (!r && t !== void 0) throw Error("Product no longer exists.");
			if (s(n.taxCode ?? "GST"), !qu(n) && n.buyEnabled !== !1) throw Error("Non-stock and service catalogue items are sales-only. Use expense/service bills for supplier costs.");
			let i = ee();
			if (delete i.products, r) {
				let e = { ...i };
				if (delete e.costingPolicies, (r.itemType ?? "STOCK") !== (n.itemType ?? "STOCK") && kx(e, n.id)) throw Error("A referenced product cannot change item type. Create a new catalogue item.");
				if (r.baseUnitId !== n.baseUnitId && kx(i, n.id)) throw Error("A referenced product cannot change base unit.");
				for (let e of r.units) {
					let t = n.units.find((t) => t.id === e.id);
					if ((!t || t.conversionToBase !== e.conversionToBase || t.code !== e.code) && kx(i, n.id, e.id)) throw Error("A referenced unit conversion cannot be changed or removed. Add a new unit instead.");
				}
			}
			let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
				...n,
				createdAt: r?.createdAt ?? a,
				updatedAt: a,
				revision: (r?.revision ?? 0) + 1
			};
			return Ax([...Xu.filter((e) => e.id !== n.id), o]), r ? Xu.splice(Xu.indexOf(r), 1, o) : Xu.push(o), bm.ensureProductPolicy(o.id, o.baseUnitId, qu(o)), r && qu(r) !== qu(o) && bm.setActive(o.id, qu(o)), Ox(), o;
		}
	},
	read: "inventory.read",
	commands: { save: "inventory.adjust" },
	snapshot: () => ({ products: structuredClone(Xu) }),
	restore: (e) => {
		let t = Ax(e.products);
		Xu.splice(0, Xu.length, ...t), Dx = [...Xu];
	},
	publish: Ox
});
//#endregion
//#region src/lib/persistence/financialConsistencyAudit.ts
function jx(e) {
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
var Mx = /* @__PURE__ */ new Set(), Nx = P.read().transactions, Px = P.read().transfers;
P.onRollback(() => {
	let e = P.read();
	Nx = e.transactions, Px = e.transfers;
});
function Fx() {
	Mx.forEach((e) => P.notify(e));
}
function Ix(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function Lx(e) {
	return e?.trim() || void 0;
}
function Rx(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function zx(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Bx(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Vx(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var Hx = {
	subscribe(e) {
		return Mx.add(e), () => {
			Mx.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return Nx;
	},
	getTransfersSnapshot() {
		return Px;
	},
	getTransactions() {
		return Nx;
	},
	getTransfers() {
		return Px;
	},
	createTransaction(e, t) {
		if (Rx(e.transactionDate), p(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = zx(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Ix(e.description, "Description"), i = Ku.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let a = I.requireById(i.glAccountId);
		if (!a.active) throw Error("The selected bank GL account is inactive.");
		let o = I.requireById(e.offsetAccountId);
		if (!o.active) throw Error("The offset account is inactive.");
		if (!o.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (o.id === a.id) throw Error("Bank and offset accounts must be different.");
		if (Ku.getByGlAccountId(o.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let s = Bx("banktxn"), c = Vx("BTXN", e.transactionDate, Nx.length + 1), l = t?.trim();
		if (t !== void 0 && !l) throw Error("Operation ID cannot be empty");
		if (l) {
			let t = R.begin(l, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Nx.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			l && R.bindResult(l, s);
			let t = L.post({
				journalDate: e.transactionDate,
				description: r,
				reference: Lx(e.reference),
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
				reference: Lx(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [u, ...Nx];
			if (P.update("transactions", d), Nx = d, Fx(), l) {
				let e = L.getBySource("BANK_TRANSACTION", s);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Bank GL posting could not be verified uniquely.");
			}
			return u;
		} catch (e) {
			if (l) try {
				R.flagForReview(l, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	},
	createTransfer(e, t) {
		Rx(e.transferDate), p(e.transferDate, "Transfer date");
		let n = zx(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Ix(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = Ku.requireById(e.fromBankAccountId), a = Ku.requireById(e.toBankAccountId);
		if (!i.active || !a.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== a.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < a.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let o = I.requireById(i.glAccountId), s = I.requireById(a.glAccountId);
		if (!o.active || !s.active) throw Error("Both bank GL accounts must be active.");
		if (o.id === s.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let c = Bx("banktrf"), l = Vx("BTRF", e.transferDate, Px.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = R.begin(u, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Px.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			u && R.bindResult(u, c);
			let t = L.post({
				journalDate: e.transferDate,
				description: r,
				reference: Lx(e.reference),
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
				reference: Lx(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [d, ...Px];
			if (P.update("transfers", f), Px = f, Fx(), u) {
				let e = L.getBySource("BANK_TRANSFER", c);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Transfer GL posting could not be verified uniquely.");
			}
			return d;
		} catch (e) {
			if (u) try {
				R.flagForReview(u, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	}
}, Ux = Hx.createTransaction;
Hx.createTransaction = function(e, t) {
	B();
	let n;
	try {
		return n = P.transaction(() => Ux.call(Hx, e, t)), t && R.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = R.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				R.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
};
var Wx = Hx.createTransfer;
Hx.createTransfer = function(e, t) {
	B();
	let n;
	try {
		return n = P.transaction(() => Wx.call(Hx, e, t)), t && R.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = R.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				R.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
}, o("bankTransactions", {
	repository: Hx,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: Nx,
		bankTransfers: Px
	}),
	restore: (e) => {
		Nx = e.bankTransactions, Px = e.bankTransfers;
	},
	publish: () => Mx.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function Gx() {
	return jx({
		transactions: Hx.getTransactions(),
		transfers: Hx.getTransfers(),
		payments: Pf.getAll(),
		journals: L.getAll(),
		invoices: U.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: V.getAll(),
		supplierBills: sh.getAll(),
		supplierPayments: Gb.getAll(),
		supplierCredits: q.getAll()
	});
}
//#endregion
//#region electron/security/periodCloseChecks.ts
function Kx(e) {
	let t = ee(), n = [], r = (e, t) => n.push({
		code: e,
		message: t
	});
	e.endDate >= u((/* @__PURE__ */ new Date()).toISOString()) && r("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of R.getUnresolved()) r("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of t.purchaseOperations) e.status !== "POSTED" && r("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of Gx()) r(e.code, `${e.entityId}: ${e.message}`);
	let i = {
		accounts: t.accounts.accounts,
		journalEntries: t.journals.journalEntries,
		asOfDate: e.endDate
	}, a = [
		["AR", () => ab({
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
		["AP", () => xb({
			...i,
			suppliers: t.suppliers.suppliers,
			bills: t.supplierBills.supplierBills,
			payments: t.supplierPayments.supplierPayments,
			credits: t.supplierCredits.supplierCredits,
			creditAllocations: t.supplierCredits.allocations
		})],
		["INVENTORY", () => Ob({
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
//#region src/features/purchases/data/purchasePostingRecoveryAuthorization.ts
var qx = null, Jx = {
	configureTrustedSession(e) {
		qx = e;
	},
	clear() {
		qx = null;
	},
	current() {
		return qx?.() ?? null;
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
}, Yx = "htt.purchasePosting.manualRecoveryAudit.v1";
function Xx() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(Yx) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var Zx = Xx();
function Qx(e) {
	Zx.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(Yx, JSON.stringify(Zx));
	} catch {}
}
o("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return Zx.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = z.get(e);
			return Jx.canRecover() && t?.status === "RECOVERY_REQUIRED" && z.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = Jx.requireRecoveryPermission(), n = z.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!z.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				z.recover(e), Qx({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw Qx({
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
	snapshot: () => Zx,
	restore: (e) => {
		Zx.splice(0, Zx.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var $x = !1;
function eS() {
	if ($x || ($x = !0, P.wasRestoredOnLoad())) return;
	let e = U.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) Hf.postInvoice(t), t.status === "VOID" && Hf.reverseInvoice(t);
	let t = Pf.getAll();
	for (let e of t) Hf.postPayment(e), e.status === "REVERSED" && Hf.reversePayment(e);
	let n = V.getAll();
	for (let e of n) e.status !== "DRAFT" && (Hf.postCreditNote(e), e.status === "VOID" && Hf.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function tS() {
	let e = Gx().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/sales/data/salesManualReviewService.ts
var nS = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function rS(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = l("business.command", {
			repository: "salesRecovery",
			method: "recordSalesManualReview",
			args: [e]
		});
		return f(t.view), t.result;
	}
	if (!e.businessRecordChecked || !e.originalGlChecked || !e.reversalGlChecked || !e.balancesChecked) throw Error("Business, original/reversal GL and balances must all be inspected.");
	let t = R.list().find((t) => t.operationId === e.operationId);
	if (!t || !nS.has(t.kind)) throw Error("Sales operation not found.");
	if (t.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return R.recordManualReview(e.operationId, e.reference, e.operator, e.summary);
}
//#endregion
//#region src/features/sales/data/salesConsistencyAudit.ts
var iS = (e) => Math.round(e * 100);
function aS(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + iS(t.amount), 0), s = a.reduce((e, t) => e + iS(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (iS(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), iS(t.amountDue) !== Math.max(0, iS(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > iS(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + iS(t.amount), 0);
		iS(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || iS(t.amountAvailable) !== 0 : iS(t.amountAvailable) !== iS(t.totals.total) - a - iS(t.amountRefunded ?? 0)) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
var oS = {
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
function sS(e) {
	return aS(e).map((e) => ({
		...e,
		action: oS[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var cS = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function lS(e, t) {
	let n = sS(e).map((e) => ({ ...e })), r = t.filter((e) => cS.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => cS.has(e.kind))) s.has(e.operationId) && n.push({
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
function uS() {
	let e = U.getAll();
	return lS({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Pf.getAll(),
		creditNotes: V.getAll(),
		allocations: V.getAllAllocations(),
		journals: L.getAll()
	}, R.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
var dS = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function fS(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!dS.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = lS(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function pS() {
	let e = U.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Pf.getAll(),
		creditNotes: V.getAll(),
		allocations: V.getAllAllocations(),
		journals: L.getAll()
	};
}
function mS(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = l("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [e]
		});
		return f(t.view), t.result;
	}
	let t = R.list(), n = fS(pS(), t, e.operationId);
	if (n.length) throw Error(`Sales recovery remains blocked: ${n.join(" ")}`);
	let r = t.find((t) => t.operationId === e.operationId);
	return {
		closed: R.closeReviewed(e.operationId, r.resultId, e.approvalReference, e.approver),
		remaining: uS()
	};
}
//#endregion
//#region electron/security/businessEngine.ts
o("salesRecovery", {
	repository: {
		recordSalesManualReview: rS,
		closeVerifiedSalesReview: mS
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
var hS = ee();
function gS(e) {
	Nc(Kx, () => e()?.userId ?? ""), N.connect(e), Jx.configureTrustedSession(e), eS(), tS();
}
//#endregion
export { Rc as assertPostingPeriod, gS as initialize, hS as workspaceDefaults };
