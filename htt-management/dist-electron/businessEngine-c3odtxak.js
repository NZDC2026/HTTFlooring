import { $ as e, A as t, B as n, C as r, E as i, F as a, H as o, J as s, K as c, L as l, N as u, O as d, Q as f, R as p, S as m, T as h, U as g, V as _, W as v, X as ee, Y as y, Z as b, _ as x, a as te, at as ne, b as S, c as re, ct as ie, d as ae, dt as oe, et as se, f as ce, ft as le, g as C, h as ue, it as de, j as fe, l as pe, lt as me, m as w, nt as he, o as ge, ot as _e, p as ve, q as T, rt as ye, s as be, st as xe, tt as E, u as Se, ut as Ce, v as we, w as Te, x as Ee, y as De } from "./businessSnapshot-BYySNXvh.js";
import { createHash as Oe, randomUUID as ke } from "node:crypto";
import { deflateSync as Ae, inflateSync as je } from "node:zlib";
//#region \0rolldown/runtime.js
var D = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports);
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/iso.js
function Me(e) {
	return ne(c, e);
}
//#endregion
//#region src/features/security/trustedAuthorization.ts
var Ne = null, O = {
	connect(e) {
		return Ne = e, () => {
			Ne === e && (Ne = null);
		};
	},
	disconnect() {
		Ne = null;
	},
	current() {
		return Ne?.() ?? null;
	},
	require(e) {
		return v(this.current(), e);
	}
}, Pe = /* @__PURE__ */ D(((e) => {
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
})), Fe = /* @__PURE__ */ D(((e, t) => {
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
				O || (O = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
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
				return Ae(a) ? (n = "", c != null && (n = c.replace(ze, "$&/") + "/"), S(a, t, n, "", function(e) {
					return e;
				})) : a != null && (b(a) && (a.key != null && (s && s.key === a.key || u(a.key)), n = ee(a, n + (a.key == null || s && s.key === a.key ? "" : ("" + a.key).replace(ze, "$&/") + "/") + c), i !== "" && s != null && b(s) && s.key == null && s._store && !s._store.validated && (n._store.validated = 2), a = n), t.push(a)), 1;
			}
			if (s = 0, c = i === "" ? "." : i + ":", Ae(e)) for (var l = 0; l < e.length; l++) i = e[l], o = c + te(i, l), s += S(i, t, n, o, a);
			else if (l = r(e), typeof l == "function") for (l === e.entries && (Re || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Re = !0), e = l.call(e), l = 0; !(i = e.next()).done;) i = i.value, o = c + te(i, l++), s += S(i, t, n, o, a);
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
				i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && (D.asyncTransitions++, r.then(oe, oe), r.then(c, Be));
			} catch (e) {
				Be(e);
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
		function C(e) {
			return 1 < e.length && typeof AggregateError == "function" ? AggregateError(e) : e[0];
		}
		function ue(e, t) {
			t !== Ue - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), Ue = t;
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
		for (qe in ke) ke.hasOwnProperty(qe) && n(qe, ke[qe]);
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
		var O, Pe, Fe = {}, Ie = ke.react_stack_bottom_frame.bind(ke, m)(), Le = Ne(f(m)), Re = !1, ze = /\/+/g, Be = typeof reportError == "function" ? reportError : function(e) {
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
		} : le;
		ke = Object.freeze({
			__proto__: null,
			c: function(e) {
				return ae().useMemoCache(e);
			}
		});
		var qe = {
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
		e.Activity = Se, e.Children = qe, e.Component = a, e.Fragment = w, e.Profiler = ge, e.PureComponent = s, e.StrictMode = he, e.Suspense = ye, e.ViewTransition = Ce, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = D, e.__COMPILER_RUNTIME = ke, e.act = function(e) {
			var t = D.actQueue, n = Ue;
			Ue++;
			var r = D.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				D.thrownErrors.push(e);
			}
			if (0 < D.thrownErrors.length) throw ue(t, n), e = C(D.thrownErrors), D.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return Ke(function() {
					i || We || (We = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
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
			if (ue(t, n), n === 0 && (fe(r), r.length !== 0 && Ke(function() {
				i || We || (We = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
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
			if (t != null) for (i in Pe || !("__self" in t) || "key" in t || (Pe = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), h(t) && (u(t.key), a = "" + t.key), t) Me.call(t, i) && i !== "key" && i !== "__self" && i !== "__source" && (r[i] = t[i]);
			var o = arguments.length - 2;
			if (o === 1) r.children = n;
			else if (1 < o) {
				for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
				Object.freeze && Object.freeze(s), r.children = s;
			}
			if (e && e.defaultProps) for (i in o = e.defaultProps, o) r[i] === void 0 && (r[i] = o[i]);
			return a && g(r, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), (i = 1e4 > D.recentlyCreatedOwnerStacks++) ? (s = Error.stackTraceLimit, Error.stackTraceLimit = 10, o = Error("react-stack-top-frame"), Error.stackTraceLimit = s) : o = Ie, v(e, a, r, p(), o, i ? Ne(f(e)) : Le);
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
(/* @__PURE__ */ D(((e, t) => {
	t.exports = process.env.NODE_ENV === "production" ? Pe() : Fe();
})))();
var Ie = e({
	id: de(),
	name: E().min(1).max(100),
	mime: b("image/png"),
	width: f().int().min(1).max(1024),
	height: f().int().min(1).max(1024),
	size: f().int().min(1).max(262144),
	sha256: E().regex(/^[a-f0-9]{64}$/),
	content: E().min(4).max(349528).regex(/^[A-Za-z0-9+/]+={0,2}$/)
}).strict(), Le = {
	assets: [],
	history: []
}, Re = () => Le, ze = () => ({
	...Le,
	revision: Le.history.length,
	currentId: Le.history.at(-1)?.logoId ?? null
}), Be = (e) => {
	Le = e;
}, Ve = () => {
	let e = Le.assets.find((e) => e.id === ze().currentId);
	return e ? structuredClone(e) : void 0;
}, He = Buffer.from("89504e470d0a1a0a", "hex");
function Ue(e) {
	let t = 4294967295;
	for (let n of e) {
		t ^= n;
		for (let e = 0; e < 8; e++) t = t >>> 1 ^ (t & 1 ? 3988292384 : 0);
	}
	return (t ^ 4294967295) >>> 0;
}
function We(e, t) {
	let n = Buffer.from(e), r = Buffer.alloc(4), i = Buffer.alloc(4);
	return r.writeUInt32BE(t.length), i.writeUInt32BE(Ue(Buffer.concat([n, t]))), Buffer.concat([
		r,
		n,
		t,
		i
	]);
}
function Ge(e) {
	if (typeof e != "string" || e.length > 1398104 || !/^[A-Za-z0-9+/]+={0,2}$/.test(e)) throw Error("Choose a PNG file no larger than 1 MB.");
	let t = Buffer.from(e, "base64");
	if (!t.length || t.length > 1048576 || t.toString("base64") !== e || !t.subarray(0, 8).equals(He)) throw Error("Invalid PNG content.");
	let n = 8, r, i, a = !1, o = !1, s = [];
	for (; n < t.length;) {
		if (n + 12 > t.length) throw Error("Truncated PNG.");
		let e = t.readUInt32BE(n), c = t.subarray(n + 4, n + 8).toString("ascii"), l = n + 12 + e;
		if (l > t.length || !/^[A-Za-z]{4}$/.test(c) || t.readUInt32BE(l - 4) !== Ue(t.subarray(n + 4, l - 4))) throw Error("PNG chunk integrity failed.");
		let u = t.subarray(n + 8, l - 4);
		if (!r && c !== "IHDR") throw Error("PNG header must be first.");
		if (c === "IHDR") {
			if (r || e !== 13) throw Error("Invalid PNG header.");
			r = Buffer.from(u);
		} else if (c === "IDAT") {
			if (o) throw Error("PNG image chunks must be contiguous.");
			s.push(u);
		} else if (c === "tRNS") {
			if (i || s.length) throw Error("Invalid PNG transparency.");
			i = Buffer.from(u);
		} else if (c === "IEND") {
			if (e || !s.length || l !== t.length) throw Error("Invalid PNG end.");
			a = !0;
		} else if (s.length && (o = !0), [
			"acTL",
			"fcTL",
			"fdAT"
		].includes(c) || c[0] === c[0].toUpperCase()) throw Error("Only static non-indexed PNG images are supported.");
		n = l;
	}
	if (!r || !a) throw Error("Incomplete PNG.");
	let c = r.readUInt32BE(0), l = r.readUInt32BE(4), u = r[9], d = {
		0: 1,
		2: 3,
		4: 2,
		6: 4
	}[u];
	if (!c || !l || c > 1024 || l > 1024 || r[8] !== 8 || !d || r[10] || r[11] || r[12]) throw Error("Use a static 8-bit RGB, RGBA or grayscale PNG up to 1024 × 1024 pixels, without interlacing.");
	if (i && (u !== 0 && u !== 2 || i.length !== (u === 0 ? 2 : 6) || Array.from({ length: u === 0 ? 1 : 3 }, (e, t) => i.readUInt16BE(t * 2)).some((e) => e > 255))) throw Error("Invalid PNG transparency key.");
	let f = c * d, p = (f + 1) * l, m = je(Buffer.concat(s), { maxOutputLength: p });
	if (m.length !== p) throw Error("PNG pixel length mismatch.");
	let h = Buffer.alloc(f * l), g = Buffer.alloc((c * 4 + 1) * l), _ = (e, t, n) => {
		let r = e + t - n, i = Math.abs(r - e), a = Math.abs(r - t), o = Math.abs(r - n);
		return i <= a && i <= o ? e : a <= o ? t : n;
	};
	for (let e = 0; e < l; e++) {
		let t = m[e * (f + 1)];
		if (t > 4) throw Error("Invalid PNG filter.");
		for (let n = 0; n < f; n++) {
			let r = n >= d ? h[e * f + n - d] : 0, i = e ? h[(e - 1) * f + n] : 0, a = e && n >= d ? h[(e - 1) * f + n - d] : 0;
			h[e * f + n] = m[e * (f + 1) + 1 + n] + (t === 0 ? 0 : t === 1 ? r : t === 2 ? i : t === 3 ? Math.floor((r + i) / 2) : _(r, i, a)) & 255;
		}
		for (let t = 0; t < c; t++) {
			let n = e * f + t * d, r = e * (c * 4 + 1) + 1 + t * 4;
			g[r] = h[n], g[r + 1] = h[n + (u === 0 || u === 4 ? 0 : 1)], g[r + 2] = h[n + (u === 0 || u === 4 ? 0 : 2)], g[r + 3] = u === 4 ? h[n + 1] : u === 6 ? h[n + 3] : i && (u === 0 ? h[n] === i.readUInt16BE(0) : h[n] === i.readUInt16BE(0) && h[n + 1] === i.readUInt16BE(2) && h[n + 2] === i.readUInt16BE(4)) ? 0 : 255;
		}
	}
	let v = Buffer.from(r);
	v[9] = 6;
	let ee = Buffer.concat([
		He,
		We("IHDR", v),
		We("IDAT", Ae(g)),
		We("IEND", Buffer.alloc(0))
	]);
	if (ee.length > 262144) throw Error("Optimized logo exceeds 256 KB; reduce its dimensions or complexity.");
	return {
		width: c,
		height: l,
		size: ee.length,
		mime: "image/png",
		content: ee.toString("base64"),
		sha256: Oe("sha256").update(ee).digest("hex")
	};
}
//#endregion
//#region electron/security/brandingRepository.ts
var Ke = E().trim().min(1).max(200), qe = {
	operationId: Ke,
	expectedRevision: f().int().nonnegative(),
	reason: E().trim().min(3).max(2e3)
}, Je = (e) => Oe("sha256").update(JSON.stringify(e)).digest("hex");
function Ye(e, t) {
	let n = O.require("accounting.post"), r = ze(), i = Je(e), a = r.history.find((t) => t.operationId === e.operationId);
	if (a) {
		if (a.fingerprint !== i || a.actorId !== n.userId) throw Error("Branding operation ID has different data or actor.");
		return a.logoId ? r.assets.find((e) => e.id === a.logoId) : null;
	}
	if (r.revision !== e.expectedRevision) throw Error("Branding changed. Refresh before saving.");
	let o = t();
	return r.history.push({
		id: ke(),
		operationId: String(e.operationId),
		actorId: n.userId,
		at: (/* @__PURE__ */ new Date()).toISOString(),
		reason: String(e.reason),
		revision: r.revision + 1,
		logoId: o?.id ?? null,
		fingerprint: i,
		request: structuredClone(e)
	}), o;
}
i("branding", {
	repository: {
		upload(t) {
			O.require("accounting.post");
			let n = e({
				...qe,
				name: E().trim().min(1).max(100).regex(/^[^\\/\x00-\x1f\x7f]+\.png$/i),
				content: E().max(1398104)
			}).strict().parse(t), r = Ge(n.content);
			return Ye({
				operationId: n.operationId,
				expectedRevision: n.expectedRevision,
				reason: n.reason,
				name: n.name,
				sha256: r.sha256
			}, () => {
				let e = ze(), t = e.assets.find((e) => e.sha256 === r.sha256);
				if (t) return t;
				if (e.assets.length >= 20 || e.assets.reduce((e, t) => e + t.size, 0) + r.size > 4194304) throw Error("Branding history limit reached (20 images / 4 MB). Existing output snapshots are preserved.");
				let i = {
					id: ke(),
					name: n.name,
					...r
				};
				return e.assets.push(i), i;
			});
		},
		select(t) {
			O.require("accounting.post");
			let n = e({
				...qe,
				logoId: de().nullable()
			}).strict().parse(t);
			return Ye(n, () => {
				let e = n.logoId ? ze().assets.find((e) => e.id === n.logoId) : null;
				if (n.logoId && !e) throw Error("Logo version was not found.");
				return e ?? null;
			});
		}
	},
	read: "accounting.read",
	commands: {
		upload: "accounting.post",
		select: "accounting.post"
	},
	snapshot: Re,
	restore: Be,
	publish: () => {},
	validate: (t, n) => {
		let r = e({
			assets: s(Ie).max(20),
			history: s(e({
				id: de(),
				operationId: Ke,
				actorId: Ke,
				at: Me(),
				reason: E().min(3).max(2e3),
				revision: f().int().positive(),
				logoId: de().nullable(),
				fingerprint: E().regex(/^[a-f0-9]{64}$/),
				request: se(E(), ye())
			}).strict())
		}).strict().parse(t), i = (e) => {
			let t = Ge(e.content);
			if (Object.entries(t).some(([t, n]) => e[t] !== n)) throw Error("Logo image integrity failed.");
		};
		for (let [t, n] of r.history.entries()) {
			let i = "sha256" in n.request ? e({
				...qe,
				name: E().min(1).max(100),
				sha256: E().regex(/^[a-f0-9]{64}$/)
			}).strict().parse(n.request) : e({
				...qe,
				logoId: de().nullable()
			}).strict().parse(n.request);
			if (Je(i) !== n.fingerprint || i.expectedRevision !== t || i.operationId !== n.operationId || i.reason !== n.reason || ("sha256" in i ? !r.assets.some((e) => e.id === n.logoId && e.sha256 === i.sha256) : i.logoId !== n.logoId)) throw Error("Invalid branding request history.");
		}
		if (r.assets.forEach(i), r.assets.reduce((e, t) => e + t.size, 0) > 4194304 || new Set(r.assets.map((e) => e.sha256)).size !== r.assets.length || new Set(r.assets.map((e) => e.id)).size !== r.assets.length || new Set(r.history.map((e) => e.operationId)).size !== r.history.length || r.assets.some((e) => !r.history.some((t) => t.logoId === e.id)) || r.history.some((e, t) => e.revision !== t + 1 || e.logoId && !r.assets.some((t) => t.id === e.logoId))) throw Error("Invalid branding history.");
		for (let e of ["preparedSalesOutputs", "preparedPurchaseOutputs"]) for (let t of n[e]?.artifacts ?? []) if (t.issuer.logo) {
			let e = Ie.parse(t.issuer.logo);
			if (i(e), !r.assets.some((t) => t.id === e.id && Je(t) === Je(e))) throw Error("Output logo differs from its retained branding asset.");
		}
	}
});
//#endregion
//#region src/features/bank-instructions/aba.ts
var Xe = /^[A-Za-z0-9 !#$%&'()*+,\-./:;=?@_]+$/, Ze = (e) => E().trim().min(1).max(e).regex(Xe, "Use supported ASCII bank-file characters; do not truncate or transliterate account names silently."), Qe = E().regex(/^\d{3}-\d{3}$/).refine((e) => !["000-000", "999-999"].includes(e), "Enter a genuine BSB in nnn-nnn form."), $e = E().regex(/^\d{1,9}$/).refine((e) => Number(e) > 0, "Preserve leading zeros and use a nonzero account number."), et = e({
	bankAccountId: E().min(1).max(200),
	institution: T(["NAB", "CBA"]),
	bsb: Qe,
	account: $e,
	userId: E().regex(/^\d{6}$/).refine((e) => e !== "000000"),
	userName: Ze(26),
	remitter: Ze(16),
	description: Ze(12)
}).strict(), tt = e({
	bsb: Qe,
	account: $e,
	title: Ze(32)
}).strict(), nt = tt.extend({
	beneficiaryId: E().min(1).max(200),
	amount: f().finite().positive().refine((e) => Number.isSafeInteger(Math.round(e * 100)) && e === Math.round(e * 100) / 100),
	reference: Ze(18),
	code: T(["50", "53"])
}).strict();
function rt(e, t) {
	if (!Number.isSafeInteger(e) || e < 0 || String(e).length > t) throw Error("ABA numeric field or total overflow.");
	return String(e).padStart(t, "0");
}
var it = (e, t) => {
	if (e.length > t) throw Error("ABA text overflow.");
	return e.padEnd(t, " ");
}, at = (e, t) => e.padStart(t, " ");
function ot(e, t, n = ve((/* @__PURE__ */ new Date()).toISOString())) {
	if (w(e), w(n), e < "2000-01-01" || e > "2099-12-31") throw Error("ABA processing year must be 2000–2099.");
	let r = (Date.parse(e + "T00:00:00Z") - Date.parse(n + "T00:00:00Z")) / 864e5;
	if (r < (t.institution === "NAB" ? -7 : -4) || r > (t.institution === "NAB" ? 90 : 419)) throw Error("Processing date is outside this bank profile’s supported submission window.");
}
function st(e, t, n) {
	let r = et.parse(e), i = s(nt).min(1).max(500).parse(n);
	if (w(t), t < "2000-01-01" || t > "2099-12-31") throw Error("Invalid ABA year.");
	let a = i.reduce((e, t) => e + Math.round(t.amount * 100), 0);
	if (rt(a, 10), new Set(i.map((e) => e.beneficiaryId)).size !== i.length) throw Error("Only one consolidated credit per beneficiary is allowed.");
	if (i.some((e) => e.bsb === r.bsb && e.account === r.account)) throw Error("Beneficiary must differ from the paying account.");
	let o = "0" + " ".repeat(17) + "01" + r.institution + " ".repeat(7) + it(r.userName, 26) + r.userId + it(r.description, 12) + t.slice(8, 10) + t.slice(5, 7) + t.slice(2, 4) + " ".repeat(40), c = (e, t, n, i, a, o) => "1" + e + at(t, 9) + " " + o + rt(a, 10) + it(n, 32) + it(i, 18) + r.bsb + at(r.account, 9) + it(r.remitter, 16) + "00000000", l = [
		o,
		...i.map((e) => c(e.bsb, e.account, e.title, e.reference, Math.round(e.amount * 100), e.code)),
		c(r.bsb, r.account, r.userName, "BATCH DEBIT", a, "13"),
		"7999-999" + " ".repeat(12) + "0000000000" + rt(a, 10) + rt(a, 10) + " ".repeat(24) + rt(i.length + 1, 6) + " ".repeat(40)
	];
	if (l.some((e) => e.length !== 120 || !/^[\x20-\x7e]+$/.test(e))) throw Error("ABA records must contain exactly 120 ASCII bytes.");
	return {
		text: l.join("\r\n") + "\r\n",
		totalCents: a,
		creditCount: i.length,
		detailCount: i.length + 1
	};
}
//#endregion
//#region src/features/bank-instructions/instructionState.ts
var ct = {
	profiles: [],
	beneficiaries: [],
	instructions: [],
	receipts: []
}, lt = () => ct, ut = (e) => {
	ct = e;
}, dt = [{
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
}], ft = [{
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
function pt() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function mt(e, t) {
	let n = pt();
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
function ht(e, t) {
	let n = pt();
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
function gt(e) {
	let t = pt();
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
var _t = "htt:financial-snapshot:v1", vt = (e) => !!e && typeof e == "object" && !Array.isArray(e), yt = (e) => new Set(e.map((e) => e.id)).size === e.length, bt = (e) => {
	if (!vt(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => vt(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => vt(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => vt(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => vt(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
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
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => vt(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && vt(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && vt(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && vt(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && yt(t) && yt(n) && yt(r) && yt(i);
}, xt = () => ({
	purchaseOrders: structuredClone(dt),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone(ft),
	transactions: [],
	transfers: [],
	journals: []
}), St, Ct = !1;
function wt() {
	return typeof window < "u" && !!window.localStorage;
}
function Tt() {
	if (St) return St;
	if (!wt()) return xt();
	let e = mt(_t, bt);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return Ct = e.status === "ok", St = e.status === "ok" ? {
		...xt(),
		...e.data
	} : xt(), St;
}
var Et = /* @__PURE__ */ new Set(), Dt = 0, Ot = /* @__PURE__ */ new Set();
function kt(e) {
	if (wt() && !ht(_t, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var k = {
	wasRestoredOnLoad() {
		return Tt(), Ct;
	},
	onRollback(e) {
		Et.add(e);
	},
	notify(e) {
		Dt ? Ot.add(e) : e();
	},
	transaction(e) {
		if (Dt) return e();
		let t = structuredClone(Tt());
		St = structuredClone(t), Dt++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			kt(Tt());
		} catch (e) {
			throw St = t, Et.forEach((e) => e()), Ot.clear(), e;
		} finally {
			Dt--;
		}
		let r = [...Ot];
		return Ot.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(Tt());
	},
	update(e, t) {
		let n = {
			...Tt(),
			[e]: structuredClone(t)
		};
		if (!bt(n)) throw Error("Invalid financial snapshot; write blocked.");
		Dt || kt(n), St = n;
	},
	resetCacheForTests() {
		St = void 0, Ct = !1;
	}
};
i("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => k.read(),
	restore: (e) => {
		St = e;
	},
	publish: () => {}
});
//#endregion
//#region src/lib/persistence/financialOperationJournal.ts
var At = "htt:financial-operations:v1", jt = [
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
function Mt() {
	let e = mt(At, be);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function Nt(e) {
	if (!gt(At) || !ht(At, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var A = {
	list() {
		return Mt().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !jt.includes(t)) throw Error("Invalid operation identity.");
		let r = Mt(), i = r.find((t) => t.operationId === e);
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
		return Nt([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = Mt(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Nt(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = Mt(), r = n.find((t) => t.operationId === e);
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
		return Nt(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = Mt(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Nt(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = Mt(), a = i.find((t) => t.operationId === e);
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
		return Nt(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = Mt(), a = i.find((t) => t.operationId === e);
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
		return Nt(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	attachRepairProposal(e, t) {
		let n = Mt(), r = n.find((t) => t.operationId === e);
		if (!r || r.state !== "MANUAL_REVIEW" || !re(t) || t.status !== "PROPOSED" || !r.reviewHistory?.some((e) => e.reference === t.reference && e.operator === t.reviewer)) throw Error("Repair proposal has no trusted review evidence.");
		let i = {
			...r,
			repairProposalHistory: r.repairProposal ? [...r.repairProposalHistory ?? [], r.repairProposal] : r.repairProposalHistory,
			repairProposal: structuredClone(t)
		};
		return Nt(n.map((t) => t.operationId === e ? i : t)), structuredClone(i);
	},
	finishRepair(e, t, n, r, i, a) {
		let o = Mt(), s = o.find((t) => t.operationId === e), c = s?.repairProposal;
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
		return Nt(o.map((t) => t.operationId === e ? d : t)), structuredClone(d);
	},
	withdrawSourceRepair(e, t, n, r) {
		let i = Mt(), a = i.find((t) => t.operationId === e);
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
		return Nt(i.map((t) => t.operationId === e ? s : t)), s;
	},
	adoptReviewedResult(e, t) {
		let n = Mt(), r = n.find((t) => t.operationId === e);
		if (!r || r.state === "COMPLETED" || !t.trim() || r.resultId && r.resultId !== t) throw Error("Cannot replace a bound or completed result.");
		Nt(n.map((n) => n.operationId === e ? {
			...n,
			resultId: t
		} : n));
	},
	getUnresolved() {
		return Mt().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
	}
};
i("financialOperations", {
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
var Pt = /* @__PURE__ */ new Map(), Ft = "htt.purchasePosting.operations.v1";
function It() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function Lt() {
	let e = It();
	if (e) try {
		e.setItem(Ft, JSON.stringify([...Pt.values()]));
	} catch {}
}
function Rt() {
	let e = It();
	if (e) try {
		let t = JSON.parse(e.getItem(Ft) ?? "[]");
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
			Pt.set(t.key, {
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
Rt();
var zt = /* @__PURE__ */ new Set(), Bt = /* @__PURE__ */ new Map(), Vt = /* @__PURE__ */ new Map(), Ht;
function Ut() {
	Lt(), zt.forEach((e) => e());
}
var j = {
	injectFailureBeforeStep(e, t, n = 1) {
		Vt.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		Vt.clear();
	},
	registerRecovery(e, t) {
		if (!Pt.has(e)) throw Error(`Unknown posting operation: ${e}`);
		Bt.set(e, t);
	},
	runStep(e, t, n) {
		let r = Pt.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = Vt.get(i) ?? 0;
		if (a > 0) throw Vt.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return Bt.has(e);
	},
	recover(e) {
		let t = Pt.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = Bt.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (Ht === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		Ht = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			Ht = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = Pt.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...Pt.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return zt.add(e), () => {
			zt.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if (Pt.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Pt.set(n, r), Ut(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = Pt.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		Pt.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), Ut();
	},
	completeStep(e, t) {
		let n = Pt.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (Pt.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), Ut());
	}
};
i("purchaseOperations", {
	repository: j,
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
	snapshot: () => j.getAll(),
	restore: (e) => {
		Pt.clear(), Bt.clear();
		for (let t of e) Pt.set(t.key, t);
	},
	publish: () => zt.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var Wt = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Gt(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${Wt.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function M() {
	Gt(A.list(), j.getAll());
}
//#endregion
//#region src/features/inventory/data/itemTypes.ts
function Kt(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function qt(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function Jt(e, t) {
	if (e.itemType !== void 0 && ![
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	].includes(String(e.itemType))) throw Error("Invalid saved sales item type.");
	if (t && (e.itemType ?? "STOCK") !== (t.itemType ?? "STOCK")) throw Error("Saved sales item type does not match its referenced product.");
}
//#endregion
//#region src/features/inventory/data/mockProducts.ts
var Yt = [
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
function Xt(e) {
	return Yt.find((t) => t.id === e);
}
function Zt(e, t) {
	return Xt(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/business-workspace/productRules.ts
function Qt(e, t, n, r) {
	let i = Xt(e), a = Zt(e, t);
	if (!i || i.status !== "ACTIVE" || !a?.active) throw Error("Select an active product and unit.");
	if (r === "buy" && !Kt(i)) throw Error("Non-stock/service items use expense bills, not inventory purchase orders.");
	if (r === "buy" && i.buyEnabled === !1 || r === "sell" && i.sellEnabled === !1) throw Error(`Product is not available to ${r}.`);
	if (!Number.isFinite(n) || n <= 0) throw Error("Quantity must be finite and greater than zero.");
	if (i.wholePacks && [
		"BOX",
		"ROLL",
		"BUCKET"
	].includes(a.code) && !Number.isInteger(n)) throw Error("This product must be ordered in whole packs.");
}
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var $t = [
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
], en = "htt.mock.contacts.suppliers.v1";
function tn(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var nn = mt(en, tn), rn = nn.status !== "invalid" && gt(en), an = /* @__PURE__ */ new Set(), on = nn.status === "ok" ? nn.data : structuredClone($t);
function sn() {
	rn && ht(en, on), an.forEach((e) => {
		e();
	});
}
function cn(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function ln() {
	let e = on.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function un(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function dn(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function fn(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: un(e.tradingName),
		abn: dn(e.abn),
		status: e.status,
		email: un(e.email),
		phone: un(e.phone),
		website: un(e.website),
		contactName: un(e.contactName),
		addressLine1: un(e.addressLine1),
		addressLine2: un(e.addressLine2),
		suburb: un(e.suburb),
		state: un(e.state),
		postcode: un(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: un(e.notes)
	};
}
var pn = {
	subscribe(e) {
		return an.add(e), () => {
			an.delete(e);
		};
	},
	getSnapshot() {
		return on;
	},
	getAll() {
		return on;
	},
	getById(e) {
		return on.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: cn("sup"),
			code: ln(),
			...fn(e),
			currency: C().currency,
			createdAt: t,
			updatedAt: t
		};
		return on = [n, ...on], sn(), n;
	},
	update(e, t) {
		let n = pn.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...fn(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return on = on.map((t) => t.id === e ? r : t), sn(), r;
	}
};
i("suppliers", {
	repository: pn,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: on }),
	restore: (e) => {
		on = e.suppliers;
	},
	publish: () => an.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
function mn(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function hn({ orderedQuantity: e, unitCost: t, taxRate: n = ue(), inclusiveLineTotal: r }) {
	let i = mn(e * t), a = mn(r === void 0 ? i * n : r - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: mn(i + a)
	};
}
function gn(e) {
	let t = mn(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = mn(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: mn(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var _n = /* @__PURE__ */ new Set(), vn = k.read().purchaseOrders;
k.onRollback(() => {
	vn = k.read().purchaseOrders;
});
function yn() {
	try {
		k.update("purchaseOrders", vn);
	} catch (e) {
		throw vn = k.read().purchaseOrders, e;
	}
	_n.forEach((e) => k.notify(e));
}
function bn(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function xn(e) {
	return we("PO", vn.map((e) => e.purchaseOrderNumber), e.slice(0, 4));
}
function Sn(e) {
	return e?.trim() || void 0;
}
function Cn(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = Yt.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let n = t.units.find((t) => t.id === e.unitId);
		if (!n) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!n.active) throw Error(`${n.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		if (Qt(e.productId, e.unitId, e.orderedQuantity, "buy"), t.buyEnabled === !1) throw Error("Product is not available for purchasing.");
		let i = t.taxCode ?? C().gstCode, a = ue(i), o = hn({
			taxRate: a,
			inclusiveLineTotal: (e.priceBasis ?? C().basis) === "Inclusive" ? Math.round(e.orderedQuantity * e.unitCost * 100) / 100 : void 0,
			orderedQuantity: e.orderedQuantity,
			unitCost: De(e.unitCost, a, e.priceBasis)
		});
		return {
			id: bn("pol"),
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
function wn(e) {
	let t = pn.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function Tn(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var En = {
	subscribe(e) {
		return _n.add(e), () => {
			_n.delete(e);
		};
	},
	getSnapshot() {
		return le(vn);
	},
	getAll() {
		return le(vn);
	},
	getById(e) {
		return le(vn).find((t) => t.id === e);
	},
	getBySupplier(e) {
		return le(vn).filter((t) => t.supplierId === e);
	},
	create(e) {
		Tn(e);
		let t = wn(e.supplierId), n = Cn(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: bn("po"),
			purchaseOrderNumber: xn(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: Sn(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: Sn(e.supplierReference),
			notes: Sn(e.notes),
			lines: n,
			totals: gn(n),
			createdAt: r,
			updatedAt: r
		};
		return vn = [i, ...vn], yn(), i;
	},
	updateDraft(e, t) {
		let n = En.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		Tn(t);
		let r = wn(t.supplierId), i = Cn(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: Sn(t.expectedDeliveryDate),
			supplierReference: Sn(t.supplierReference),
			notes: Sn(t.notes),
			lines: i,
			totals: gn(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return vn = vn.map((e) => e.id === n.id ? a : e), yn(), a;
	},
	approve(e) {
		let t = En.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return Dn(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = En.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return Dn(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = En.getById(e);
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
		return vn = vn.map((e) => e.id === n.id ? o : e), yn(), o;
	},
	recordSupplierBill(e, t) {
		let n = En.getById(e);
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
			let n = On(e.billedQuantity + t);
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
		return vn = vn.map((e) => e.id === n.id ? c : e), yn(), c;
	},
	reverseSupplierBill(e, t) {
		let n = En.getById(e);
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
				billedQuantity: On(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return vn = vn.map((e) => e.id === n.id ? c : e), yn(), c;
	},
	cancel(e, t) {
		let n = En.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return Dn(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function Dn(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return vn = vn.map((t) => t.id === e.id ? n : t), yn(), n;
}
function On(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
i("purchaseOrders", {
	repository: En,
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
	snapshot: () => ({ purchaseOrders: vn }),
	restore: (e) => {
		vn = e.purchaseOrders;
	},
	publish: () => _n.forEach((e) => e())
});
function kn(e) {
	if (vn.some((t) => e.has(t.id) && t.status !== "DRAFT")) throw Error("Only draft purchase orders may be purged.");
	vn = vn.filter((t) => !e.has(t.id)), yn();
}
//#endregion
//#region src/features/accounting/data/accountRepository.ts
var An = /* @__PURE__ */ new Set(), N = "2026-10-08T00:00:00.000Z", jn = [
	{
		id: "acc_1000",
		code: "1000",
		name: "Operating Bank",
		type: "ASSET",
		systemRole: "BANK",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_1010",
		code: "1010",
		name: "Savings Bank",
		type: "ASSET",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_1100",
		code: "1100",
		name: "Accounts Receivable",
		type: "ASSET",
		systemRole: "ACCOUNTS_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_1200",
		code: "1200",
		name: "Inventory",
		type: "ASSET",
		systemRole: "INVENTORY",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_1300",
		code: "1300",
		name: "GST Receivable",
		type: "ASSET",
		systemRole: "GST_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_2000",
		code: "2000",
		name: "Accounts Payable",
		type: "LIABILITY",
		systemRole: "ACCOUNTS_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
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
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_2100",
		code: "2100",
		name: "GST Payable",
		type: "LIABILITY",
		systemRole: "GST_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_3000",
		code: "3000",
		name: "Owner's Equity",
		type: "EQUITY",
		systemRole: "OWNERS_EQUITY",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_3100",
		code: "3100",
		name: "Retained Earnings",
		type: "EQUITY",
		systemRole: "RETAINED_EARNINGS",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_4000",
		code: "4000",
		name: "Sales Revenue",
		type: "REVENUE",
		systemRole: "SALES_REVENUE",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_5000",
		code: "5000",
		name: "Cost of Goods Sold",
		type: "EXPENSE",
		systemRole: "COST_OF_GOODS_SOLD",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_5100",
		code: "5100",
		name: "Purchases / Materials",
		type: "EXPENSE",
		systemRole: "PURCHASES",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
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
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_5200",
		code: "5200",
		name: "Freight",
		type: "EXPENSE",
		systemRole: "FREIGHT",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_5300",
		code: "5300",
		name: "Operating Expenses",
		type: "EXPENSE",
		systemRole: "OPERATING_EXPENSE",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
	}
];
function Mn() {
	An.forEach((e) => e());
}
function Nn(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function Pn(e) {
	return e?.trim() || void 0;
}
function Fn(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function In(e, t) {
	if (jn.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function Ln(e, t) {
	if (!e) return;
	let n = jn.find((n) => n.id !== t && (Ee(e) ? n.id === Ee(e) : n.systemRole === e));
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function Rn() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var P = {
	subscribe(e) {
		return An.add(e), () => {
			An.delete(e);
		};
	},
	getSnapshot() {
		return jn;
	},
	getAll() {
		return jn;
	},
	getById(e) {
		return jn.find((t) => t.id === e);
	},
	getByCode(e) {
		return jn.find((t) => t.code.toLowerCase() === e.trim().toLowerCase());
	},
	getBySystemRole(e) {
		return jn.find((t) => Ee(e) ? t.id === Ee(e) : t.systemRole === e);
	},
	requireById(e) {
		let t = jn.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = jn.find((t) => Ee(e) ? t.id === Ee(e) : t.systemRole === e);
		if (!t) throw Error(`Accounting account for system role ${e} was not found.`);
		return t;
	},
	create(e) {
		let t = Nn(e.code, "Account code"), n = Nn(e.name, "Account name");
		Fn(t), In(t), Ln(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Rn(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: Pn(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return jn = [...jn, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), Mn(), i;
	},
	update(e, t) {
		let n = jn.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = Nn(t.code, "Account code"), i = Nn(t.name, "Account name");
		if (Fn(r), In(r, e), (n.systemRole || S(n.id)) && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: Pn(t.description),
			active: n.systemRole || S(n.id) ? !0 : t.active,
			allowManualPosting: n.systemRole || S(n.id) ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return jn = jn.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), Mn(), a;
	},
	setActive(e, t) {
		let n = jn.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		if ((n.systemRole || S(n.id)) && !t) throw Error("System control accounts cannot be deactivated.");
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return jn = jn.map((t) => t.id === e ? r : t), Mn(), r;
	}
};
i("accounts", {
	repository: P,
	read: "accounting.read",
	commands: {
		if: null,
		create: "accounting.post",
		update: "accounting.post",
		setActive: "accounting.post"
	},
	snapshot: () => ({ accounts: jn }),
	restore: (e) => {
		jn = e.accounts;
	},
	publish: () => An.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/taxPosting.ts
function zn(e, t, n, r) {
	let i = t === "paid" ? "GST_RECEIVABLE" : "GST_PAYABLE", a = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = (t === "paid" ? n.taxPaidAccountId : n.taxCollectedAccountId) || P.requireBySystemRole(i).id;
		a.set(e, (a.get(e) ?? 0) + n.taxAmount);
	}
	return e.length || a.set(P.requireBySystemRole(i).id, r), [...a].filter(([, e]) => Math.round((e + 2 ** -52) * 100) !== 0).map(([e, t]) => {
		let r = Math.round((t + 2 ** -52) * 100) / 100;
		return {
			accountId: e,
			debit: n ? r : 0,
			credit: n ? 0 : r
		};
	});
}
//#endregion
//#region src/features/banking/data/reconciliationLock.ts
function Bn(e, n) {
	let r = t(), i = r.journals?.journalEntries ?? [], a = r.bankReconciliations?.reconciliations ?? [], o = i.filter((t) => t.sourceType === e && t.sourceId === n).map((e) => e.id);
	if (a.some((e) => e.clearedTransactionIds.some((e) => o.some((t) => e.startsWith(t + ":"))))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Vn(e, n) {
	let r = t(), i = r.bankAccounts?.bankAccounts ?? [], a = r.bankReconciliations?.reconciliations ?? [];
	for (let t of i.filter((e) => n.includes(e.glAccountId))) {
		let n = a.filter((e) => e.bankAccountId === t.id).map((e) => e.statementDate).sort().at(-1);
		if (n && e <= n) throw Error(`Bank account is reconciled through ${n}. Use a posting date after that statement.`);
	}
}
function Hn(e) {
	if (t().bankStatements?.lines.some((t) => t.status === "MATCHED" && t.ledgerIds.some((t) => t.startsWith(e + ":")))) throw Error("Unmatch the bank statement line before reversing its ledger source.");
}
//#endregion
//#region src/features/accounting/data/accountingPeriodRepository.ts
var Un = [], Wn, Gn, Kn = /* @__PURE__ */ new Set();
function qn(e, t) {
	Wn = e, Gn = t;
}
function Jn() {
	let e = Gn?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function Yn(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function Xn(e) {
	let t = Un.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function Zn() {
	Kn.forEach((e) => e());
}
function Qn(e) {
	if (w(e, "Posting date"), !Un.length) return;
	let t = Un.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!Un.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
i("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => Un,
		subscribe(e) {
			return Kn.add(e), () => {
				Kn.delete(e);
			};
		},
		create(e) {
			let t = Jn(), n = Yn(e.reason);
			if (w(e.startDate), w(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (Un.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (Un.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
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
			return Un = [...Un, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), Zn(), r;
		},
		preflight(e) {
			let t = Xn(e);
			if (!Wn) throw Error("Trusted close checks unavailable.");
			return Wn(t);
		},
		close(e) {
			let t = Jn(), n = Yn(e.reason), r = Xn(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (Un.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return Un = Un.map((e) => e.id === r.id ? {
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
			} : e), Zn(), Xn(e.id);
		},
		reopen(e) {
			let t = Jn(), n = Yn(e.reason), r = Xn(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (Un.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return Un = Un.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), Zn(), Xn(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: Un }),
	restore: (e) => {
		ge(e.periods), Un = e.periods;
	},
	publish: Zn
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var $n = /* @__PURE__ */ new Set(), er = k.read().journals;
k.onRollback(() => {
	er = k.read().journals;
});
function tr() {
	$n.forEach((e) => k.notify(e));
}
function nr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function rr(e) {
	return e?.trim() || void 0;
}
function ir(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function ar(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = er.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function or(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function sr(e) {
	if (ir(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = P.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = nr(r.debit), o = nr(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = nr(t + a), n = nr(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function cr(e) {
	return e.lines.map((e, t) => {
		let n = P.requireById(e.accountId);
		return {
			id: or(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: rr(e.description),
			debit: nr(e.debit),
			credit: nr(e.credit)
		};
	});
}
function lr(e, t) {
	let n = pe(er).originals;
	return er.find((r) => r.sourceType === e && r.sourceId === t && !r.reversedJournalEntryId && !n.has(r.id));
}
var F = {
	subscribe(e) {
		return $n.add(e), () => {
			$n.delete(e);
		};
	},
	getSnapshot() {
		return er;
	},
	getAll() {
		return er;
	},
	getById(e) {
		return er.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return er.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: lr,
	post(e) {
		Qn(e.journalDate), Vn(e.journalDate, e.lines.map((e) => e.accountId));
		let t = sr(e), n = rr(e.sourceId);
		if (n) {
			let t = lr(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: or("je"),
			journalNumber: ar(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: rr(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: cr(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...er];
		return k.update("journals", a), er = a, tr(), i;
	},
	reverse(e) {
		Qn(e.reversalDate);
		let t = er.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (Hn(t.id), t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (ir(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Reversal reason must contain at least 3 characters.");
		Vn(e.reversalDate, t.lines.map((e) => e.accountId));
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
		}, i = sr(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: or("je"),
			journalNumber: ar(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: cr(r),
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
		}, c = [o, ...er.map((e) => e.id === t.id ? s : e)];
		return k.update("journals", c), er = c, tr(), o;
	}
};
function ur(e, t, n, r) {
	let i = er.find((t) => t.id === e);
	if (!i) throw Error("Duplicate journal no longer exists.");
	let a = F.reverse({
		journalEntryId: e,
		reversalDate: i.journalDate,
		reason: r
	}), o = er.map((r) => r.id === e ? {
		...r,
		bankDuplicateCorrection: {
			canonicalJournalId: t,
			operationId: n
		}
	} : r), s = pe(o);
	if (s.invalid.length || !s.originals.has(e)) throw Error("Duplicate correction failed exact-pair verification.");
	return k.update("journals", o), er = o, tr(), a;
}
i("journals", {
	repository: F,
	read: "accounting.read",
	commands: {
		if: null,
		validateDate: null,
		for: null,
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ journalEntries: er }),
	restore: (e) => {
		er = e.journalEntries;
	},
	publish: () => $n.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var dr = "htt.mock.banking.accounts.v1";
function fr(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var pr = /* @__PURE__ */ new Set(), mr = "2026-10-08T00:00:00.000Z", hr = [{
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
	createdAt: mr,
	updatedAt: mr
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
	createdAt: mr,
	updatedAt: mr
}], gr = mt(dr, fr);
gr.status === "ok" && gr.data.every((e) => {
	let t = P.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (hr = gr.data);
function _r() {
	pr.forEach((e) => e());
}
function vr(e) {
	let t = P.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of hr) vr(e);
var I = {
	subscribe(e) {
		return pr.add(e), () => {
			pr.delete(e);
		};
	},
	getSnapshot() {
		return hr;
	},
	getAll() {
		return hr;
	},
	getById(e) {
		return hr.find((t) => t.id === e);
	},
	getByGlAccountId(e) {
		return hr.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = hr.find((t) => t.id === e);
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
		if (w(r.openingBalanceDate, "Opening date"), hr[0] && r.currency !== hr[0].currency) throw Error("This profile uses one base currency; foreign-currency bank accounts are not supported.");
		let i = hr.find((e) => e.id === r.id);
		if (i && i.updatedAt !== n) throw Error("Bank account changed; reload before editing.");
		if (!i && r.id) throw Error("Bank account was not found.");
		if (hr.some((e) => e.id !== i?.id && e.glAccountId === r.glAccountId)) throw Error("Each bank account needs its own GL account.");
		let a = P.requireById(r.glAccountId);
		if (!a.active || a.type !== "ASSET" || a.systemRole && a.systemRole !== "BANK") throw Error("Choose an active bank Asset account.");
		if (i && F.getAll().some((e) => e.lines.some((e) => e.accountId === i.glAccountId)) && (i.glAccountId !== r.glAccountId || i.openingBalanceDate !== r.openingBalanceDate || i.currency !== r.currency)) throw Error("A used bank account cannot change its ledger, currency or opening date.");
		let o = new Date(Math.max(Date.now(), i ? Date.parse(i.updatedAt) + 1 : 0)).toISOString(), s = {
			...r,
			id: i?.id ?? crypto.randomUUID(),
			openingBalance: i?.openingBalance ?? 0,
			createdAt: i?.createdAt ?? o,
			updatedAt: o
		};
		return vr(s), hr = [...hr.filter((e) => e.id !== s.id), s], _r(), s;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return hr = hr.map((t) => t.id === e ? r : t), gt(dr) && ht(dr, hr), _r(), r;
	}
};
i("bankAccounts", {
	repository: I,
	read: "banking.read",
	commands: {
		if: null,
		validateBankAccount: null,
		setActive: "banking.write",
		save: "banking.write"
	},
	snapshot: () => ({ bankAccounts: hr }),
	restore: (e) => {
		hr = e.bankAccounts;
	},
	publish: () => pr.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function L(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function yr(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function br(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function xr({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return yr(e / t);
}
function Sr({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return br(e * t);
}
function Cr({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = L(e + n), a = br(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : yr(a / i)
	};
}
function wr({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return br(e * t);
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function Tr(e) {
	return br(e.lines.reduce((e, t) => {
		let n = xr({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + Sr({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function Er(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Dr(e) {
	return P.requireBySystemRole(e).id;
}
function Or(e) {
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
function kr(e, t) {
	return F.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Ar(e, t) {
	let n = kr(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var jr = {
	validateGoodsReceiptPosting(e) {
		let t = P.requireBySystemRole("INVENTORY"), n = P.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = Tr(e);
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
		let t = F.getBySource("GOODS_RECEIPT", e.id).find((e) => !e.reversedJournalEntryId);
		if (t) return t;
		let { inventoryAccountId: n, grniAccountId: r, receiptValue: i } = this.validateGoodsReceiptPosting(e);
		return F.post({
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
		let n = P.requireBySystemRole("GRNI"), r = P.requireBySystemRole("GST_RECEIVABLE"), i = P.requireBySystemRole("ACCOUNTS_PAYABLE");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI account must be an active liability account.");
		if (!r.active || r.type !== "ASSET") throw Error("GST Receivable must be an active asset account.");
		if (!i.active || i.type !== "LIABILITY") throw Error("Accounts Payable must be an active liability account.");
		if (!Number.isFinite(t) || t < 0) throw Error("Matched receipt value must be a non-negative finite number.");
		let a = Er(e.totals.subtotal - t);
		if (a !== 0) {
			let e = P.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = Er(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = kr("SUPPLIER_BILL", e.id);
		if (n) return n;
		let r = t ?? e.totals.subtotal, { variance: i } = this.validateSupplierBillPosting(e, r);
		return F.post({
			journalDate: e.billDate,
			description: `Supplier bill ${e.billNumber}`,
			reference: e.supplierInvoiceNumber,
			sourceType: "SUPPLIER_BILL",
			sourceId: e.id,
			lines: [
				{
					accountId: Dr("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				...zn(e.lines, "paid", !0, e.totals.taxAmount),
				...i === 0 ? [] : [{
					accountId: Dr("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: Dr("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = Ar("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Or(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = kr("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = I.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return F.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: Dr("ACCOUNTS_PAYABLE"),
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
		let t = Ar("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Or(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return kr("SUPPLIER_CREDIT", e.id) || F.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: Dr("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				...e.lines.reduce((e, t) => {
					let n = t.expenseAccountId ?? Dr("PURCHASE_PRICE_VARIANCE"), r = e.find((e) => e.accountId === n);
					return r ? r.credit = Math.round((r.credit + t.lineSubtotal) * 100) / 100 : t.lineSubtotal && e.push({
						accountId: n,
						debit: 0,
						credit: t.lineSubtotal
					}), e;
				}, []),
				...zn(e.lines, "paid", !1, e.totals.taxAmount)
			]
		});
	},
	reverseSupplierCredit(e) {
		for (let t of F.getBySource("SUPPLIER_CREDIT_RECLASS", e.id).filter((e) => e.status === "POSTED")) F.reverse({
			journalEntryId: t.id,
			reversalDate: Or(e.voidedAt),
			reason: e.voidReason ?? "Credit void"
		});
		let t = Ar("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Or(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, Mr = structuredClone([{
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
}]), Nr = {
	getAll() {
		return Mr;
	},
	getById(e) {
		return Mr.find((t) => t.id === e);
	},
	getActive() {
		return Mr.filter((e) => e.status === "ACTIVE");
	}
}, Pr = /* @__PURE__ */ new Set(), Fr = [];
function Ir() {
	Pr.forEach((e) => e());
}
function Lr() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Fr.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var Rr = {
	subscribe(e) {
		return Pr.add(e), () => {
			Pr.delete(e);
		};
	},
	getSnapshot() {
		return Fr;
	},
	getAll() {
		return Fr;
	},
	getByReference(e, t) {
		return Fr.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return Fr.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return Fr.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: Lr(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Fr = [t, ...Fr], Ir(), t;
	}
};
i("inventoryMovements", {
	repository: Rr,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: Fr }),
	restore: (e) => {
		Fr = e.movements;
	},
	publish: () => Pr.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var zr = /* @__PURE__ */ new Set(), Br = [];
function Vr() {
	zr.forEach((e) => e());
}
var Hr = {
	subscribe(e) {
		return zr.add(e), () => {
			zr.delete(e);
		};
	},
	getSnapshot() {
		return Br;
	},
	getAll() {
		return Br;
	},
	getBalance(e, t) {
		return Br.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = Hr.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return Br = Br.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? Br.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...Br], Vr(), e;
	},
	replaceAll(e) {
		Br = e, Vr();
	},
	clear() {
		Br = [], Vr();
	}
};
i("costBalances", {
	repository: Hr,
	read: "inventory.cost.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: Br }),
	restore: (e) => {
		Br = e.balances;
	},
	publish: () => zr.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var Ur = /* @__PURE__ */ new Set(), Wr = [];
function Gr() {
	Ur.forEach((e) => e());
}
function Kr() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Wr.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function qr(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var Jr = {
	subscribe(e) {
		return Ur.add(e), () => {
			Ur.delete(e);
		};
	},
	getSnapshot() {
		return Wr;
	},
	getAll() {
		return Wr;
	},
	getByReference(e, t) {
		return Wr.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return Wr.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return Wr.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return Wr.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return qr(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: Kr(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = Jr.build(e);
		return Wr = [t, ...Wr], Gr(), t;
	},
	replaceAll(e) {
		Wr = e, Gr();
	},
	clear() {
		Wr = [], Gr();
	}
};
i("costMovements", {
	repository: Jr,
	read: "inventory.cost.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: Wr }),
	restore: (e) => {
		Wr = e.movements;
	},
	publish: () => Ur.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var Yr = /* @__PURE__ */ new Set(), Xr = "2026-01-01T00:00:00.000Z", Zr = Yt.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: Xr,
	updatedAt: Xr
}));
function Qr() {
	Yr.forEach((e) => e());
}
var $r = {
	ensureProductPolicy(e, t, n) {
		let r = Zr.find((t) => t.productId === e), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			productId: e,
			baseUnitId: t,
			active: n ? r?.active ?? !0 : !1,
			costingMethod: "MOVING_WEIGHTED_AVERAGE",
			createdAt: r?.createdAt ?? i,
			updatedAt: i
		};
		return Zr = [...Zr.filter((t) => t.productId !== e), a], Qr(), a;
	},
	subscribe(e) {
		return Yr.add(e), () => {
			Yr.delete(e);
		};
	},
	getSnapshot() {
		return Zr;
	},
	getAll() {
		return Zr;
	},
	getByProductId(e) {
		return Zr.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = $r.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		if (t && !Kt(Xt(e) ?? { itemType: "SERVICE" })) throw Error("Inventory costing cannot be enabled for non-stock/service items.");
		let n = {
			...$r.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Zr = Zr.map((t) => t.productId === e ? n : t), Qr(), n;
	}
};
i("costingPolicies", {
	repository: $r,
	read: "inventory.cost.read",
	commands: {
		ensureProductPolicy: null,
		setActive: "accounting.post"
	},
	snapshot: () => ({ policies: Zr }),
	restore: (e) => {
		Zr = e.policies;
	},
	publish: () => Yr.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function ei(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function ti(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function ni(e, t) {
	let n = Xt(e);
	if (!n) throw Error("Product was not found.");
	if (!Kt(n)) throw Error("Non-stock/service items cannot move inventory value.");
	let r = $r.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = Zt(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function ri(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = br(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(br(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function ii(e) {
	if (e && Jr.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function ai({ movement: e, balance: t }) {
	let n = Jr.getAll(), r = Hr.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	Jr.replaceAll(i), Hr.replaceAll(a);
}
function oi(e) {
	if (ei(e.quantity), ti(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	ii(e.inventoryMovementId);
	let { policy: t, unit: n } = ni(e.productId, e.unitId), r = L(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = xr({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = Sr({
		quantityBase: r,
		unitCostBase: i
	}), o = Hr.getBalance(e.siteId, e.productId);
	o && ri(o, t.baseUnitId);
	let s = Cr({
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
	ri(l, t.baseUnitId);
	let u = Jr.build({
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
	return ai({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function si(e) {
	ei(e.quantity), ti(e.occurredAt), ii(e.inventoryMovementId);
	let { policy: t, unit: n } = ni(e.productId, e.unitId), r = L(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = Hr.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (ri(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = yr(i.averageCostPerBaseUnit), o = wr({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = L(i.quantityOnHand - r), c = s === 0, l = br(c ? -i.inventoryValue : -o), u = c ? 0 : br(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : yr(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	ri(p, t.baseUnitId);
	let m = Jr.build({
		movementType: e.movementType ?? "ISSUE",
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: t.baseUnitId,
		quantityBase: L(-r),
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
	return ai({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function ci(e) {
	if (ei(e.quantityBase), ti(e.occurredAt), ii(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = Xt(e.productId);
	if (!t) throw Error("Product was not found.");
	if (!Kt(t)) throw Error("Non-stock/service items cannot restore inventory value.");
	let n = $r.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = L(e.quantityBase), i = yr(e.unitCostBase), a = br(e.inventoryValue), o = Hr.getBalance(e.siteId, e.productId);
	o && ri(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = L(s + r), u = br(c + a), d = l === 0 ? 0 : yr(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	ri(p, n.baseUnitId);
	let m = Jr.build({
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
	return ai({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var li = /* @__PURE__ */ new Set(), ui = [];
function di() {
	li.forEach((e) => e());
}
function fi(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var pi = {
	subscribe(e) {
		return li.add(e), () => {
			li.delete(e);
		};
	},
	getSnapshot() {
		return ui;
	},
	getAll() {
		return ui;
	},
	getBalance(e, t) {
		return ui.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = pi.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: fi(i.quantityOnHand + r),
				updatedAt: a
			};
			return ui = ui.map((r) => r.siteId === e && r.productId === t ? n : r), di(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: fi(r),
			updatedAt: a
		};
		return ui = [o, ...ui], di(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = pi.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = fi(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ui = ui.map((n) => n.siteId === e && n.productId === t ? o : n), di(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of Rr.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: fi((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		ui = Array.from(e.values()), di();
	}
};
i("stock", {
	repository: pi,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: ui }),
	restore: (e) => {
		ui = e.balances;
	},
	publish: () => li.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/goodsReceiptRepository.ts
var mi = /* @__PURE__ */ new Set(), hi = k.read().goodsReceipts;
k.onRollback(() => {
	hi = k.read().goodsReceipts;
});
function gi() {
	try {
		k.update("goodsReceipts", hi);
	} catch (e) {
		throw hi = k.read().goodsReceipts, e;
	}
	mi.forEach((e) => k.notify(e));
}
function _i(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function vi(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = hi.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function yi(e) {
	return e?.trim() || void 0;
}
var bi = {
	subscribe(e) {
		return mi.add(e), () => {
			mi.delete(e);
		};
	},
	getSnapshot() {
		return hi;
	},
	getAll() {
		return hi;
	},
	getById(e) {
		return hi.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return hi.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = En.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = Nr.getById(e.siteId);
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
			let r = _i(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!Xt(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = Zt(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = _i(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: vi(e.receiptDate),
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
			supplierDeliveryReference: yi(e.supplierDeliveryReference),
			notes: yi(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		jr.validateGoodsReceiptPosting(s), M();
		let c = j.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return j.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = Xt(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				j.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = Rr.create({
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
				}), j.runStep(c, `COST:${r.id}`, () => {
					let t = l.get(r.id);
					if (!t) throw Error(`Missing inventory movement for ${r.id}`);
					oi({
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
				}), j.runStep(c, `STOCK:${r.id}`, () => {
					pi.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			j.runStep(c, "JOURNAL", () => {
				jr.postGoodsReceipt(s);
			}), j.runStep(c, "PURCHASE_ORDER", () => {
				En.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), j.runStep(c, "RECEIPT", () => {
				hi = [s, ...hi], gi();
			});
		}), j.recover(c), s;
	}
};
i("goodsReceipts", {
	repository: bi,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: hi }),
	restore: (e) => {
		hi = e.goodsReceipts;
	},
	publish: () => mi.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var xi = 1e-4;
function Si(e) {
	return br(e);
}
function Ci(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - L(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function wi(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function Ti(e, t, n) {
	let r = xr({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return Sr({
		quantityBase: L(e * n),
		unitCostBase: r
	});
}
function Ei(e, t, n) {
	let r = [], i = n.filter((e) => e.status === "ACTIVE");
	for (let n of t) if (n.purchaseOrderId === e && n.status === "POSTED") for (let e of n.lines) {
		let t = L(i.filter((t) => t.goodsReceiptId === n.id && t.goodsReceiptLineId === e.id).reduce((e, t) => e + t.matchedQuantity, 0)), a = L(e.receivedQuantity - t);
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
function Di(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = Ei(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), Ci(e.quantity), wi(e.billUnitCost);
		let r = L(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > xi);
		if (L(d.reduce((e, t) => e + t.availableQuantity, 0)) + xi < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= xi) break;
			let s = L(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = L(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = Sr({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: xr({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = Si(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), h = Math.abs(o.availableQuantity - s) <= xi ? Si(p - m) : Ti(s, o.receiptUnitCost, o.conversionToBase);
			if (h < 0) throw Error("Receipt cost has been overallocated.");
			let g = Si(s * e.billUnitCost), _ = Si(g - h);
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
			}), o.availableQuantity = L(o.availableQuantity - s), r = L(r - s);
		}
		if (r > xi) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = Si(Si(e.quantity * e.billUnitCost) - Si(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = Si(p.matchedBillValue + f), p.priceVariance = Si(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = L(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = L(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = Si(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = Si(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: Si(p - f)
	};
}
var Oi = {
	calculate: Di,
	getAvailableReceiptLines(e, t, n) {
		return Ei(e, t, n);
	}
}, ki = k.read().receiptMatches;
k.onRollback(() => {
	ki = k.read().receiptMatches;
});
var Ai = /* @__PURE__ */ new Set(), ji = () => {
	try {
		k.update("receiptMatches", ki);
	} catch (e) {
		throw ki = k.read().receiptMatches, e;
	}
	Ai.forEach((e) => k.notify(e));
}, Mi = {
	getAll() {
		return [...ki];
	},
	subscribe(e) {
		return Ai.add(e), () => {
			Ai.delete(e);
		};
	},
	getSnapshot() {
		return ki;
	},
	getByBill(e) {
		return ki.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (ki.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		ki = [...ki, ...t], ji();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		ki = ki.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), ji();
	}
};
i("receiptMatches", {
	repository: Mi,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: ki }),
	restore: (e) => {
		ki = e.matches;
	},
	publish: () => Ai.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
function Ni(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Pi({ quantity: e, unitCost: t, inclusiveLineTotal: n, taxRate: r = .1 }) {
	let i = Ni(e * t), a = Ni(n === void 0 ? i * r : n - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: Ni(i + a)
	};
}
function Fi(e) {
	let t = Ni(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Ni(e.reduce((e, t) => e + t.taxAmount, 0)), r = Ni(t + n);
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
var Ii = /* @__PURE__ */ new Set(), R = k.read().supplierBills;
k.onRollback(() => {
	R = k.read().supplierBills;
});
function Li() {
	try {
		k.update("supplierBills", R);
	} catch (e) {
		throw R = k.read().supplierBills, e;
	}
	Ii.forEach((e) => k.notify(e));
}
function Ri(e) {
	return e?.trim() || void 0;
}
function zi(e) {
	return we("BILL", R.map((e) => e.billNumber), e.slice(0, 4));
}
var Bi = {
	insertExpenseBill(e) {
		let t = R.find((t) => t.managedDraftId === e.managedDraftId);
		if (t) return t;
		if (R.some((t) => t.supplierId === e.supplierId && t.supplierInvoiceNumber.toLowerCase() === e.supplierInvoiceNumber.toLowerCase() && t.status !== "VOID")) throw Error("Supplier invoice reference already exists.");
		return R = [e, ...R], Li(), e;
	},
	subscribe(e) {
		return Ii.add(e), () => {
			Ii.delete(e);
		};
	},
	getSnapshot() {
		return R;
	},
	getAll() {
		return R;
	},
	getById(e) {
		return R.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return R.filter((t) => t.supplierId === e);
	},
	applyPayment(e, t) {
		let n = R.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a payment.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment allocation must be greater than zero.");
		let r = Hi(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = Hi(n.totals.amountPaid + r), a = Hi(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return R = R.map((t) => t.id === e ? o : t), Li(), o;
	},
	reversePayment(e, t) {
		let n = R.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = Hi(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = Hi(Math.max(0, n.totals.amountPaid - r)), a = Hi(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return R = R.map((t) => t.id === e ? o : t), Li(), o;
	},
	applyCredit(e, t) {
		let n = R.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = Hi(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = Hi(n.totals.amountCredited + r), a = Hi(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return R = R.map((t) => t.id === e ? o : t), Li(), o;
	},
	reverseCredit(e, t) {
		let n = R.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = Hi(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = Hi(Math.max(0, n.totals.amountCredited - r)), a = Hi(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return R = R.map((t) => t.id === e ? o : t), Li(), o;
	},
	markVoid(e, n) {
		let r = R.find((t) => t.id === e);
		if (!r) throw Error("Supplier bill was not found.");
		if (r.status === "VOID") throw Error("This supplier bill has already been voided.");
		let i = n.trim();
		if (i.length < 3) throw Error("A void reason is required.");
		if (r.status !== "OPEN" || r.totals.amountPaid > 0 || r.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if ((t().supplierCredits?.supplierCredits ?? k.read().supplierCredits).some((e) => e.sourceSupplierBillId === r.id && e.status !== "VOID")) throw Error("Reverse source supplier credits and linked physical returns before voiding the bill.");
		if (r.kind === "EXPENSE") {
			M();
			let e = (/* @__PURE__ */ new Date()).toISOString(), t = {
				...r,
				status: "VOID",
				voidedAt: e,
				voidReason: i,
				updatedAt: e
			};
			return jr.reverseSupplierBill(t), R = R.map((e) => e.id === r.id ? t : e), Li(), t;
		}
		if (Mi.getByBill(r.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...r,
			status: "VOID",
			voidedAt: a,
			voidReason: i,
			updatedAt: a
		};
		M();
		let s = j.begin("SUPPLIER_BILL_VOID", r.id).key;
		return j.registerRecovery(s, () => {
			j.runStep(s, "REVERSAL_JOURNAL", () => {
				jr.reverseSupplierBill(o);
			}), j.runStep(s, "PURCHASE_ORDER", () => {
				En.reverseSupplierBill(r.purchaseOrderId, r.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), j.runStep(s, "MATCHES", () => {
				Mi.reverseForBill(r.id, i, ve(a));
			}), j.runStep(s, "BILL", () => {
				R = R.map((e) => e.id === r.id ? o : e), Li();
			});
		}), j.recover(s), o;
	},
	getByPurchaseOrder(e) {
		return R.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = En.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (![
			"PARTIALLY_RECEIVED",
			"RECEIVED",
			"BILLED"
		].includes(t.status)) throw Error("Supplier bills can only be created for purchase orders with received goods.");
		let n = e.supplierInvoiceNumber.trim();
		if (!n) throw Error("Supplier invoice number is required.");
		if (R.some((e) => e.supplierId === t.supplierId && e.supplierInvoiceNumber.toLowerCase() === n.toLowerCase() && e.status !== "VOID")) throw Error("This supplier invoice number has already been entered.");
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
			let r = Vi(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = Pi({
				taxRate: a,
				quantity: e.quantity,
				unitCost: e.unitCost
			});
			return n.grossUnitCost !== void 0 && e.unitCost === n.unitCost && (o.taxAmount = Hi(e.quantity * n.grossUnitCost - o.lineSubtotal), o.lineTotal = Hi(o.lineSubtotal + o.taxAmount)), {
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
		}), o = Fi(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: zi(e.billDate),
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
			notes: Ri(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = Oi.calculate({
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
			receipts: bi.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: Mi.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		jr.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), M();
		let u = j.begin("SUPPLIER_BILL", c.id).key;
		return j.registerRecovery(u, () => {
			j.runStep(u, "JOURNAL", () => {
				jr.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), j.runStep(u, "PURCHASE_ORDER", () => {
				En.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), j.runStep(u, "MATCHES", () => {
				Mi.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), j.runStep(u, "BILL", () => {
				R = [c, ...R], Li();
			});
		}), j.recover(u), c;
	}
};
function Vi(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Hi(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
i("supplierBills", {
	repository: Bi,
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
	snapshot: () => ({ supplierBills: R }),
	restore: (e) => {
		R = e.supplierBills;
	},
	publish: () => Ii.forEach((e) => e())
});
function Ui(e, t) {
	let { status: n, ...r } = t;
	R = R.map((t) => t.id === e ? {
		...t,
		status: n,
		totals: {
			...t.totals,
			...r
		}
	} : t), Li();
}
//#endregion
//#region src/features/purchases/data/supplierPaymentRepository.ts
var Wi = /* @__PURE__ */ new Set(), Gi = k.read().supplierPayments;
k.onRollback(() => {
	Gi = k.read().supplierPayments;
});
function Ki() {
	k.update("supplierPayments", Gi), Wi.forEach((e) => k.notify(e));
}
var qi = {
	subscribe(e) {
		return Wi.add(e), () => {
			Wi.delete(e);
		};
	},
	getSnapshot() {
		return Gi;
	},
	getAll() {
		return Gi;
	},
	getById(e) {
		return Gi.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return Gi.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return Gi.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: Yi(e.reference),
			notes: Yi(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: Xi(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = Gi.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (w(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = pn.getById(e.supplierId);
		if (!r) throw Error("Supplier was not found.");
		if (!e.paymentDate) throw Error("Payment date is required.");
		if (!e.method) throw Error("Payment method is required.");
		if (!e.bankAccountId) throw Error("Bank account is required.");
		let i = I.getById(e.bankAccountId);
		if (!i) throw Error("Bank account was not found.");
		if (!i.active) throw Error("The selected bank account is inactive.");
		let a = e.allocations.filter((e) => Number.isFinite(e.amount) && e.amount > 0);
		if (a.length === 0) throw Error("Allocate the payment to at least one supplier bill.");
		let o = /* @__PURE__ */ new Set(), s = a.map((t) => {
			if (o.has(t.supplierBillId)) throw Error("A supplier bill cannot appear more than once in the same payment.");
			o.add(t.supplierBillId);
			let n = Bi.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = Xi(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${Zi(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), c = Xi(s.reduce((e, t) => e + t.amount, 0));
		if (c <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of s) Bi.applyPayment(e.supplierBillId, e.amount);
		let l = (/* @__PURE__ */ new Date()).toISOString(), u = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: Ji(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: c,
			method: e.method,
			bankAccountId: i.id,
			reference: Yi(e.reference),
			notes: Yi(e.notes),
			allocations: s,
			status: "POSTED",
			createdAt: l,
			updatedAt: l
		};
		return Gi = [u, ...Gi], Ki(), jr.postSupplierPayment(u), u;
	},
	recordPrepaymentSettlement(e) {
		w(e.paymentDate);
		let t = pn.getById(e.supplierId), n = Bi.getById(e.supplierBillId);
		if (!t || !n || n.supplierId !== t.id || e.paymentDate < n.billDate || !e.prepaymentId || !e.applicationId || !Number.isFinite(e.amount) || e.amount <= 0) throw Error("Invalid supplier prepayment application.");
		if (Gi.some((t) => t.id === e.id || t.prepaymentApplicationId === e.applicationId)) throw Error("Prepayment application already exists.");
		Bi.applyPayment(n.id, e.amount);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: e.id,
			prepaymentId: e.prepaymentId,
			prepaymentApplicationId: e.applicationId,
			paymentNumber: Ji(e.paymentDate),
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
		return Gi = [i, ...Gi], Ki(), i;
	},
	reversePrepaymentSettlement(e, t, n) {
		w(t);
		let r = Gi.find((t) => t.id === e);
		if (!r?.prepaymentApplicationId || r.status !== "POSTED" || t < r.paymentDate || n.trim().length < 3) throw Error("Invalid supplier prepayment reversal.");
		for (let e of r.allocations) Bi.reversePayment(e.supplierBillId, e.amount);
		let i = {
			...r,
			status: "REVERSED",
			reversedAt: t,
			reversalReason: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Gi = Gi.map((t) => t.id === e ? i : t), Ki(), i;
	},
	reverse(e, t) {
		if (Bn("SUPPLIER_PAYMENT", e), Gi.find((t) => t.id === e)?.prepaymentApplicationId) throw Error("Reverse this settlement through supplier prepayments.");
		let n = Gi.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = Bi.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) Bi.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return Gi = Gi.map((t) => t.id === e ? a : t), Ki(), jr.reverseSupplierPayment(a), a;
	}
};
function Ji(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = Gi.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Yi(e) {
	return e?.trim() || void 0;
}
function Xi(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Zi(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: C().currency
	}).format(e);
}
var Qi = qi.create;
qi.create = function(...e) {
	return M(), k.transaction(() => Qi.apply(qi, e));
};
var $i = qi.reverse;
qi.reverse = function(...e) {
	return M(), k.transaction(() => $i.apply(qi, e));
}, i("supplierPayments", {
	repository: qi,
	read: "purchases.read",
	commands: {
		recordPrepaymentSettlement: null,
		reversePrepaymentSettlement: null,
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: Gi }),
	restore: (e) => {
		Gi = e.supplierPayments;
	},
	publish: () => Wi.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/paymentBatchRepository.ts
var ea = (e) => Math.round((e + 2 ** -52) * 100) / 100, ta = E().trim().min(1).max(200), na = e({
	operationId: ta,
	paymentDate: ta,
	bankAccountId: ta,
	reference: E().max(500),
	allocations: s(e({
		supplierBillId: ta,
		amount: f().finite().positive().refine((e) => ea(e) === e)
	}).strict()).min(1).max(500)
}).strict(), ra = [], ia = 0, aa = /* @__PURE__ */ new Set(), oa = () => {
	ia++, aa.forEach((e) => e());
}, sa = () => {
	let e = O.current();
	if (!e) throw Error("A verified session is required.");
	return e.userId;
};
function ca(e, t) {
	return {
		action: e,
		reason: t,
		actor: sa(),
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function la(e) {
	let t = ra.find((t) => t.id === e);
	if (!t) throw Error("Payment batch was not found.");
	return t;
}
function ua(e) {
	return ra = ra.map((t) => t.id === e.id ? e : t), oa(), e;
}
function da(e) {
	w(e.paymentDate, "Payment date");
	let t = I.requireById(e.bankAccountId);
	if (!t.active || e.paymentDate < t.openingBalanceDate) throw Error("Invalid paying bank account/date.");
	if (new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length) throw Error("Select each bill only once.");
	for (let t of e.allocations) {
		let n = Bi.getById(t.supplierBillId);
		if (!n || n.status === "VOID" || t.amount > n.totals.amountDue || e.paymentDate < n.billDate) throw Error("A bill amount, date or outstanding balance changed. Review the batch.");
	}
}
var fa = {
	create(e) {
		let t = na.parse(e), n = JSON.stringify(t), r = ra.find((e) => e.operationId === t.operationId);
		if (r) {
			if (r.fingerprint !== n) throw Error("Operation ID was used with different batch data.");
			return r;
		}
		da(t);
		let i = {
			...t,
			id: crypto.randomUUID(),
			fingerprint: n,
			status: "DRAFT",
			createdBy: sa(),
			paymentIds: [],
			history: [ca("Created")]
		};
		return ra = [...ra, i], oa(), i;
	},
	approve(e) {
		let t = la(e);
		if (t.status === "APPROVED") return t;
		if (t.status !== "DRAFT") throw Error("Only a draft batch can be approved.");
		return da(t), ua({
			...t,
			status: "APPROVED",
			approvedBy: sa(),
			history: [...t.history, ca("Approved")]
		});
	},
	post(e) {
		let t = la(e);
		if (t.status === "POSTED") return t;
		if (t.status !== "APPROVED") throw Error("Approve the batch before recording payments.");
		M(), da(t);
		let n = /* @__PURE__ */ new Map();
		for (let e of t.allocations) {
			let t = Bi.getById(e.supplierBillId);
			n.set(t.supplierId, [...n.get(t.supplierId) ?? [], e]);
		}
		let r = [...n].map(([e, n]) => qi.create({
			operationId: "batch:" + t.id + ":" + e,
			supplierId: e,
			paymentDate: t.paymentDate,
			bankAccountId: t.bankAccountId,
			reference: t.reference,
			method: "BANK_TRANSFER",
			allocations: n
		}));
		if (r.some((e) => e.status !== "POSTED")) throw Error("Batch payment is not posted. Inspect the prior operation before retrying.");
		return ua({
			...t,
			status: "POSTED",
			paymentIds: r.map((e) => e.id),
			history: [...t.history, ca("Payments recorded")]
		});
	},
	cancel(e) {
		let t = la(e.id);
		if (!["DRAFT", "APPROVED"].includes(t.status) || e.reason?.trim().length < 3) throw Error("Only an unposted batch can be cancelled, with a reason.");
		return ua({
			...t,
			status: "CANCELLED",
			history: [...t.history, ca("Cancelled", e.reason)]
		});
	},
	reverse(e) {
		let t = la(e.id);
		if (t.status === "REVERSED") return t;
		if (t.status !== "POSTED" || e.reason?.trim().length < 3) throw Error("A posted batch and reversal reason are required.");
		M();
		for (let e of t.paymentIds) {
			let t = qi.getById(e);
			if (!t || t.status !== "POSTED") throw Error("Batch payments changed. Inspect before reversing.");
			Bn("SUPPLIER_PAYMENT", e);
		}
		for (let n of t.paymentIds) qi.reverse(n, e.reason);
		return ua({
			...t,
			status: "REVERSED",
			history: [...t.history, ca("Reversed", e.reason)]
		});
	}
};
i("paymentBatches", {
	repository: fa,
	read: "banking.read",
	commands: {
		create: "purchases.payment",
		approve: "accounting.post",
		post: "purchases.payment",
		cancel: "purchases.payment",
		reverse: "purchases.payment"
	},
	snapshot: () => ({ batches: ra }),
	restore: (e) => {
		ra = e.batches;
	},
	validate: (t, n) => {
		let r = na.extend({
			id: ta,
			fingerprint: E(),
			status: T([
				"DRAFT",
				"APPROVED",
				"POSTED",
				"REVERSED",
				"CANCELLED"
			]),
			createdBy: ta,
			approvedBy: ta.optional(),
			paymentIds: s(ta),
			history: s(e({
				action: ta,
				actor: ta,
				at: ta,
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
				if (u.has(t) || !n || !r || s.has(n.supplierId) || n.operationId !== "batch:" + e.id + ":" + n.supplierId || n.bankAccountId !== e.bankAccountId || n.paymentDate !== e.paymentDate || n.method !== "BANK_TRANSFER" || (n.reference ?? "") !== e.reference.trim() || n.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED") || d(n.allocations) !== d(r) || n.amount !== ea(r.reduce((e, t) => e + t.amount, 0))) throw Error("Payment batch payment relationships are invalid.");
				if (u.add(t), s.add(n.supplierId), !a.journals.journalEntries.some((e) => e.sourceType === "SUPPLIER_PAYMENT" && e.sourceId === t)) throw Error("A batch payment journal is missing.");
			}
		}
	},
	publish: oa
});
//#endregion
//#region src/features/payroll/data/australianTax.ts
var pa = [
	"Manual",
	"1",
	"2",
	"3",
	"4-resident",
	"4-foreign",
	"5",
	"6"
], ma = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
], ha = {
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
function ga(e, t, n, r) {
	if (!Number.isFinite(e) || e < 0 || e > 1e9) throw Error("Invalid taxable earnings.");
	if (r < "2026-07-01" || r > "2027-06-30") throw Error("Automatic PAYG is available only for pay dates in 2026–27. Use a reviewed manual amount for another year.");
	if (t === "Manual") throw Error("Manual withholding must be entered explicitly.");
	if (t.startsWith("4-")) return Math.floor(Math.floor(e) * (t === "4-resident" ? .47 : .45) + 1e-9);
	let i = Math.round(e * 100);
	n === "Monthly" && i % 100 == 33 && i++;
	let a = n === "Weekly" ? i / 100 : n === "Fortnightly" ? i / 200 : n === "Monthly" ? i * 3 / 1300 : i / 1300, o = Math.floor(a + 1e-9) + .99, s = ha[t]?.find(([e]) => o < e);
	if (!s) throw Error("Unsupported PAYG scale.");
	let c = Math.max(0, Math.round(s[1] * o - s[2]));
	return n === "Weekly" ? c : n === "Fortnightly" ? c * 2 : n === "Monthly" ? Math.round(c * 13 / 3) : c * 13;
}
//#endregion
//#region src/features/payroll/data/payrollProjects.ts
function _a(e, t, n, r) {
	let i = [];
	function a(e, t, n) {
		if (!n) return;
		let a = /* @__PURE__ */ new Map();
		for (let e of t) {
			let t = a.get(e.project.id);
			a.set(e.project.id, {
				project: e.project,
				weight: (t?.weight ?? 0) + e.weight
			});
		}
		let o = [...a.values()], s = Math.max(0, n - o.reduce((e, t) => e + t.weight, 0)), c = [...o.map((e) => e.weight), s], l = Math.round(r[e].amount * 100), u = c.map((e) => l * e / n), d = u.map(Math.floor), f = l - d.reduce((e, t) => e + t, 0), p = u.map((e, t) => ({
			i: t,
			f: e - d[t]
		})).sort((e, t) => t.f - e.f || e.i - t.i);
		for (let e of p) {
			if (f-- <= 0) break;
			d[e.i]++;
		}
		o.forEach((t, n) => {
			d[n] > 0 && i.push({
				lineIndex: e,
				project: structuredClone(t.project),
				amount: d[n] / 100
			});
		});
	}
	r.forEach((r, o) => {
		if (e === "Hourly" && r.source.startsWith("Time:")) {
			let e = t.find((e) => "Time:" + e.id === r.source);
			e?.project && r.amount > 0 && i.push({
				lineIndex: o,
				project: structuredClone(e.project),
				amount: r.amount
			});
		}
		e === "Salary" && r.source === "Salary" && a(o, t.filter((e) => e.project).map((e) => ({
			project: e.project,
			weight: e.hours
		})), t.reduce((e, t) => e + t.hours, n));
	});
	let o = i.filter((e) => ["Earnings", "Allowance"].includes(r[e.lineIndex].item.category)), s = r.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + Math.round(t.amount * 100), 0);
	return r.forEach((e, t) => {
		e.item.category === "Employer contribution" && a(t, o.map((e) => ({
			project: e.project,
			weight: Math.round(e.amount * 100)
		})), s);
	}), i;
}
function va(e, t) {
	let n = [];
	for (let r of e.filter((e) => (e.status === "Posted" || e.status === "Reversed") && e.slips.some((e) => e.projectAllocation))) {
		let e = t.find((e) => e.id === r.journalId);
		if (!e || e.sourceType !== "PAYROLL" || e.sourceId !== r.id || e.journalDate !== r.payDate) throw Error("Payroll project journal source mismatch.");
		let i = 0;
		function a(t, n, r) {
			let a = e.lines[i++];
			if (!a || a.accountId !== t || Math.round(a.debit * 100) !== Math.round(n * 100) || Math.round(a.credit * 100) !== Math.round(r * 100)) throw Error("Payroll project journal line mismatch.");
			return a;
		}
		for (let t of r.slips) {
			for (let [i, o] of t.lines.entries()) {
				if (o.amount <= 0) continue;
				let s = [
					"Earnings",
					"Allowance",
					"Employer contribution"
				].includes(o.item.category), c = a(o.item.accountId, s ? o.amount : 0, s ? 0 : o.amount), l = t.projectAllocation?.costs.filter((e) => e.lineIndex === i) ?? [];
				if (l.length) {
					if (!c || c.accountId !== o.item.accountId) throw Error("Payroll project journal line mismatch.");
					n.push({
						id: "payroll:" + r.id + ":" + c.id,
						journalId: e.id,
						lineId: c.id,
						revision: r.revision,
						splits: l.map((e) => ({
							jobId: e.project.id,
							jobName: e.project.name,
							amount: e.amount
						}))
					});
				}
				o.item.category === "Employer contribution" && a(o.item.liabilityAccountId, 0, o.amount);
			}
			t.totals.net && a(r.settings.netAccountId, 0, t.totals.net);
		}
		if (i !== e.lines.length) throw Error("Payroll project journal has extra lines.");
	}
	return n;
}
//#endregion
//#region src/features/page-previews/catalog.ts
var z = (e, t, n = "text", r, i) => ({
	key: e,
	label: t,
	type: n,
	options: r,
	value: i,
	required: !0
}), B = (e, t, n) => z(e, t, "select", n), ya = (e, t, n = "0") => ({
	...z(e, t, "number", void 0, n),
	min: 0,
	step: "0.01"
}), ba = (e, t) => z(e, t, "date", void 0, "2026-10-16"), xa = (e, t) => ({
	...B(e, t, [
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
}), Sa = [];
function Ca(e, t, n, r, i, a, o, s, c) {
	Sa.push({
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
Ca("products", "Products & services", "Inventory & pricing", "/inventory/products", "inventory.read", "Maintain purchasing, selling, stock and packaging information.", [
	z("sku", "SKU"),
	B("kind", "Product type", [
		"Stock item",
		"Service",
		"Non-stock item"
	]),
	B("unit", "Selling unit", [
		"Pack",
		"m²",
		"Bucket",
		"Each"
	]),
	ya("price", "Standard selling price", "49.50"),
	ya("cost", "Buying cost (sample)", "25"),
	ya("coverage", "m² per pack", "2.2"),
	B("rounding", "Pack rounding", ["Whole packs up", "Allow fractional packs"]),
	ya("reorder", "Reorder point", "10"),
	ya("target", "Target stock", "50"),
	B("buy", "Available for purchasing", ["Yes", "No"]),
	B("sell", "Available for selling", ["Yes", "No"]),
	B("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	z("brand", "Brand"),
	z("category", "Category"),
	z("image", "Image URL (preview only)")
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
]), Ca("promotions", "Scheduled promotions", "Inventory & pricing", "/inventory/promotions", "inventory.read", "Plan customer and product specials with explicit start and end times.", [
	z("product", "Product / SKU"),
	z("customer", "Customer scope"),
	z("starts", "Starts (local time)", "datetime-local", void 0, "2026-10-16T09:00"),
	z("ends", "Ends (local time)", "datetime-local", void 0, "2026-10-31T17:00"),
	ya("price", "Promotional unit price", "45"),
	B("priority", "Priority when rules overlap", [
		"Customer price first",
		"Promotion first",
		"Lowest eligible price"
	]),
	z("timezone", "Time zone", "text", void 0, "Pacific/Auckland")
], {
	name: "October flooring special",
	product: "SAMPLE-OAK",
	customer: "All trade customers"
}, [
	"Overview",
	"Price comparison",
	"History"
]), Ca("tax-codes", "Tax codes", "Accounting", "/accounting/tax-codes", "accounting.read", "Review GST codes, inclusive/exclusive calculation and reporting mappings.", [
	z("code", "Tax code"),
	ya("rate", "Tax rate (%)", "15"),
	B("basis", "Entry basis", ["Exclusive", "Inclusive"]),
	xa("collected", "GST collected account"),
	xa("paid", "GST paid account"),
	z("report", "Return / report mapping")
], {
	name: "Standard GST",
	code: "GST15",
	report: "Output / input GST"
}, [
	"Overview",
	"Calculation preview",
	"Reporting"
]), Ca("linked-accounts", "Linked accounts", "Accounting", "/accounting/linked-accounts", "accounting.read", "Preview default general ledger mappings used by each business process.", [
	B("process", "Business process", [
		"Sales",
		"Purchases",
		"Payroll"
	]),
	xa("receivable", "Receivables / payables control"),
	xa("income", "Income / expense account"),
	xa("inventory", "Inventory account"),
	xa("cogs", "Cost of goods sold"),
	xa("gst", "GST control account"),
	xa("payroll", "Payroll clearing account")
], {
	name: "Sales posting defaults",
	process: "Sales"
}, ["Overview", "Posting example"]), Ca("jobs", "Jobs & projects", "Accounting", "/accounting/jobs", "accounting.read", "Track project budgets, allocate posted revenue and costs, and compare actual profitability.", [
	z("code", "Job code"),
	z("customer", "Customer"),
	z("owner", "Project owner"),
	ba("starts", "Start date"),
	ba("ends", "End date"),
	ya("budget", "Revenue budget", "10000"),
	ya("costBudget", "Cost budget", "6000")
], {
	name: "Sample showroom installation",
	code: "JOB-SAMPLE",
	customer: "Sample Flooring Ltd",
	owner: "Sample team"
}, [
	"Overview",
	"Transactions",
	"Profitability"
]), Ca("bank-accounts", "Bank account setup", "Banking", "/banking/setup/accounts", "banking.read", "Preview bank account details, ledger links and feed preferences.", [
	z("number", "Account number (sample only)"),
	z("bank", "Bank name"),
	B("currency", "Currency", ["NZD", "AUD"]),
	xa("ledger", "Linked bank GL account"),
	B("feed", "Feed provider", ["Manual import", "Provider to be configured"]),
	ba("feedStart", "Feed start date")
], {
	name: "Sample operating account",
	number: "00-0000-0000000-00",
	bank: "Sample Bank"
}, [
	"Overview",
	"Feed settings",
	"Import history"
]), Ca("bank-rules", "Bank rules", "Banking", "/banking/rules", "banking.read", "Define matching conditions and resulting categorisation before testing a sample.", [
	B("match", "Match mode", ["All conditions", "Any condition"]),
	B("field", "Transaction field", [
		"Description",
		"Payee",
		"Reference"
	]),
	B("operator", "Operator", [
		"Contains",
		"Equals",
		"Starts with"
	]),
	z("value", "Match text"),
	xa("account", "Categorise to account"),
	B("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	B("enabled", "Enabled", ["Yes", "No"])
], {
	name: "Sample office supplies",
	value: "OFFICE",
	field: "Description"
}, [
	"Overview",
	"Test rule",
	"History"
]), Ca("payment-batches", "Electronic payment batches", "Banking", "/banking/payment-batches", "banking.read", "Select sample supplier or wage payments, review approval and bank export layout.", [
	B("kind", "Batch type", ["Supplier payments", "Wages"]),
	ba("payDate", "Payment date"),
	z("bank", "Paying account"),
	z("reference", "Bank reference"),
	B("format", "Export format", ["NZ bank CSV preview", "ABA layout preview"]),
	ya("total", "Batch total", "1100")
], {
	name: "Sample supplier batch",
	bank: "Sample operating account",
	reference: "OCT-SAMPLE"
}, [
	"Overview",
	"Payments",
	"Approval & export"
]), Ca("pay-items", "Pay items", "Payroll", "/payroll/pay-items", "payroll.read", "Configure sample earnings, allowances, deductions, leave, tax and employer contributions.", [
	z("code", "Pay item code"),
	B("category", "Category", [
		"Earnings",
		"Allowance",
		"Deduction",
		"Leave",
		"Tax",
		"Employer contribution"
	]),
	B("method", "Calculation method", [
		"Hourly rate",
		"Fixed amount",
		"Percentage"
	]),
	ya("rate", "Rate / amount", "30"),
	B("taxable", "Tax treatment", [
		"Taxable",
		"Non-taxable",
		"Before tax deduction",
		"After tax deduction"
	]),
	xa("expense", "Expense account"),
	xa("liability", "Liability / clearing account")
], {
	name: "Ordinary hours",
	code: "ORD",
	category: "Earnings"
}, [
	"Overview",
	"Employee assignments",
	"Posting preview"
]), Ca("filing", "Payroll filing", "Payroll", "/payroll/filing", "payroll.read", "Review a sample NZ Payday Filing submission and its response / correction workflow.", [
	z("payrun", "Pay run reference"),
	ba("payDate", "Pay date"),
	z("employer", "Employer IRD identifier (sample)"),
	B("type", "Submission type", ["Employment information", "Amendment"]),
	z("contact", "Payroll contact email", "email")
], {
	name: "October employment information",
	payrun: "SAMPLE-RUN-01",
	employer: "000-000-000",
	contact: "payroll@example.invalid"
}, [
	"Overview",
	"Employees & validation",
	"Submission & response"
]), Ca("recurring", "Recurring transactions", "Automation & tasks", "/automation/recurring", "inventory.read", "Generate due invoice and expense drafts from saved local templates with ordered schedules and retry protection.", [
	B("kind", "Transaction type", [
		"Invoice",
		"Bill",
		"Bank transaction"
	]),
	z("contact", "Customer / supplier"),
	B("frequency", "Frequency", [
		"Weekly",
		"Fortnightly",
		"Monthly",
		"Quarterly"
	]),
	ba("next", "Next generation date"),
	ba("ends", "Schedule end date"),
	ya("total", "Template amount", "220"),
	B("mode", "Generation mode", ["Draft for review", "Require approval"])
], {
	name: "Monthly sample maintenance",
	contact: "Sample Flooring Ltd"
}, [
	"Overview",
	"Template lines",
	"Run history"
]), Ca("tasks", "Tasks & action centre", "Automation & tasks", "/tasks", "sales.read", "Maintain local tasks, owners and due dates with audited completion and reopening.", [
	z("customer", "Customer / branch"),
	z("owner", "Assigned to"),
	ba("due", "Due date"),
	B("priority", "Priority", [
		"Normal",
		"High",
		"Low"
	]),
	z("notes", "Task instructions", "textarea")
], {
	name: "Follow up showroom quote",
	customer: "Sample Flooring / North branch",
	owner: "Sample sales",
	notes: "Confirm quantities and planned installation date."
}, [
	"Overview",
	"Notes & attachments",
	"Status history"
]), Ca("visits", "Sales visits & activity", "Automation & tasks", "/sales/activity", "sales.read", "Plan local sales visits, record trusted check-in/out, outcomes and linked follow-up tasks.", [
	z("salesperson", "Salesperson"),
	z("customer", "Customer / branch"),
	z("checkin", "Check-in", "datetime-local", void 0, "2026-10-16T09:00"),
	z("checkout", "Check-out", "datetime-local", void 0, "2026-10-16T09:30"),
	z("outcome", "Visit outcome", "textarea"),
	z("location", "Recorded location")
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
]), Ca("draft-review", "Customer & contact review", "Automation & tasks", "/contacts/review", "sales.read", "Review local customer, branch and contact drafts, compare duplicates and approve or link real records.", [
	B("kind", "Draft type", [
		"Customer",
		"Branch",
		"Contact"
	]),
	z("company", "Customer / company"),
	z("branch", "Branch"),
	z("email", "Email", "email"),
	z("phone", "Phone"),
	B("source", "Source", [
		"Sales draft",
		"Selected phone contact",
		"Business card OCR"
	]),
	B("decision", "Review decision", [
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
]), Ca("templates", "PDF & email templates", "Documents & imports", "/documents/templates", "accounting.read", "Design sample invoice, quote, PO, statement and remittance layouts and email copy.", [
	B("kind", "Document type", [
		"Invoice",
		"Quotation",
		"Purchase order",
		"Customer statement",
		"Remittance"
	]),
	z("subject", "Email subject"),
	z("body", "Email body", "textarea"),
	z("footer", "PDF footer", "textarea"),
	B("logo", "Logo position", [
		"Left",
		"Centre",
		"Right"
	]),
	B("paper", "Paper size", ["A4", "Letter"])
], {
	name: "Standard invoice template",
	subject: "Your document {{number}}",
	body: "Hello {{contact}}, please review the attached {{type}}.",
	footer: "Thank you for your business."
}, [
	"Overview",
	"PDF preview",
	"Email preview"
]), Ca("custom-reports", "Saved & favourite reports", "Reports", "/reports/saved", "accounting.read", "Save explicit filters and ordered columns, run local data and export complete results.", [
	B("dataset", "Dataset", [
		"Sales",
		"Purchases",
		"Payroll",
		"Banking",
		"General ledger"
	]),
	z("columns", "Columns (comma separated)"),
	z("filter", "Filter expression (preview)"),
	B("basis", "Basis", ["Accrual", "Cash"]),
	B("favourite", "Favourite", ["Yes", "No"])
], {
	name: "Monthly sales by customer",
	columns: "Customer, Date, Net, GST, Total",
	filter: "Date: current month"
}, ["Overview", "Report preview"]), Ca("report-packs", "Report packs", "Reports", "/reports/packs", "accounting.read", "Generate combined financial reports from current local books, with ordered sections and printable exports.", [
	z("company", "Company"),
	z("period", "Reporting period"),
	z("reports", "Included reports (comma separated)"),
	z("cover", "Cover heading"),
	z("introduction", "Cover note", "textarea")
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
var wa = Sa;
[...new Set(Sa.map((e) => e.group))], B("gst", "GST registration", ["Registered", "Not registered"]), B("filing", "GST filing cycle", [
	"Two monthly",
	"Monthly",
	"Six monthly"
]), ya("quoteNext", "Next quote number", "1001"), ya("orderNext", "Next order number", "1001"), ya("invoiceNext", "Next invoice number", "1001"), ya("creditNext", "Next credit number", "1001"), B("terms", "Default terms", [
	"20th of following month",
	"Due on receipt",
	"30 days"
]), B("template", "Default template", ["Standard invoice", "Trade invoice"]), B("reminders", "Overdue reminders", ["Manual only", "7 and 14 days overdue"]), B("onlinePayment", "Online payment option", ["Disabled", "Configuration preview"]), ya("next", "Next PO number", "1001"), B("terms", "Default payment terms", [
	"20th of following month",
	"30 days",
	"Due on receipt"
]), xa("expense", "Default expense account"), B("receipt", "Bill matching", ["Require receipt match", "Allow expense bills"]), B("remittance", "Remittance preference", ["Preview before sending", "Manual"]), B("cycle", "Pay cycle", [
	"Weekly",
	"Fortnightly",
	"Monthly"
]), B("day", "Pay day", [
	"Wednesday",
	"Thursday",
	"Friday"
]), xa("wages", "Wages expense account"), xa("clearing", "Payroll clearing account"), B("bank", "Paying bank", ["Sample operating account"]), B("filing", "Filing region", ["New Zealand · Payday Filing", "Australia · STP preview"]), B("basis", "Default basis", ["Accrual", "Cash"]), B("currency", "Display currency", ["NZD", "AUD"]), B("precision", "Decimal places", ["2", "0"]), B("negative", "Negative number style", ["(1,234.56)", "-1,234.56"]), B("comparative", "Comparative period", [
	"Previous period",
	"Previous year",
	"None"
]);
//#endregion
//#region src/features/page-previews/previewModel.ts
function Ta(e, t) {
	return Object.fromEntries(e.map((e) => [e.key, t?.[e.key] ?? e.value ?? e.options?.[0] ?? ""]));
}
Object.fromEntries(wa.map((e) => [e.id, [{
	...Ta(e.fields),
	...e.example,
	id: "sample-1",
	name: e.example.name,
	status: "Draft"
}]]));
function Ea(e) {
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
var Da = [
	"Customer",
	"Branch",
	"Contact"
], Oa = [
	"Manual",
	"Sales draft",
	"Selected contact",
	"Card transcription"
], ka = {
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
}, Aa = se(E(), he([
	E().max(2e3),
	f().finite(),
	y()
]));
function ja(e, t) {
	let n = Aa.parse(t), r = ka[e];
	if (Object.keys(n).some((e) => !Object.hasOwn(r, e))) throw Error("Unsupported draft field. Use the documented fields for this draft type.");
	for (let [e, t] of Object.entries(n)) if (typeof t != typeof r[e]) throw Error(`Invalid value type for ${e}.`);
	return {
		...r,
		...n
	};
}
var Ma = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), Na = (e) => String(e ?? "").trim().toLowerCase(), Pa = (e) => String(e ?? "").replace(/\D/g, ""), Fa = (e, t, n = Ma) => !!n(e) && n(e) === n(t);
function Ia(e, t) {
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
		(Fa(r.businessName, e.businessName) || Fa(r.businessName, e.tradingName) || Fa(r.tradingName, e.businessName) || Fa(r.tradingName, e.tradingName)) && t.push("Business/trading name"), Fa(r.email, e.email, Na) && t.push("Email"), Fa(r.phone, e.phone, Pa) && t.push("Phone"), Fa(r.abn, e.abn) && t.push("Identifier"), i(e.id, e.id, e.businessName, [
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
			Fa(r.name, e.name) && t.push("Branch name"), String(r.addressLine1).trim() && Fa([
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
			].join(" ")) && t.push("Address"), Fa(r.phone, e.phone, Pa) && t.push("Phone"), i(e.id, n.id, e.name, [
				e.addressLine1,
				e.suburb,
				e.postcode
			].filter(Boolean).join(" · "), t);
		}
		else for (let e of n.contacts) {
			let t = [];
			Fa([r.firstName, r.lastName].join(" "), [e.firstName, e.lastName].join(" ")) && t.push("Contact name"), Fa(r.email, e.email, Na) && t.push("Email"), (Fa(r.phone, e.phone, Pa) || Fa(r.phone, e.mobile, Pa) || Fa(r.mobile, e.phone, Pa) || Fa(r.mobile, e.mobile, Pa)) && t.push("Phone/mobile"), i(e.id, n.id, `${e.firstName} ${e.lastName}`, [
				e.email,
				e.phone,
				e.mobile
			].filter(Boolean).join(" · "), t);
		}
	}
	return n.sort((e, t) => t.reasons.length - e.reasons.length || e.name.localeCompare(t.name) || e.id.localeCompare(t.id));
}
function La(e) {
	return JSON.stringify(e);
}
//#endregion
//#region src/features/data-transfer/transferModel.ts
var Ra = [
	"Customers",
	"Suppliers",
	"Customer branches",
	"Customer contacts",
	"Products"
], za = ["Create", "Update by ID"], Ba = "HTT-CSV-1", Va = {
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
}, Ha = {
	Customers: ka.Customer,
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
		...ka.Branch
	},
	"Customer contacts": {
		customerId: "",
		...ka.Contact
	},
	Products: Va
}, Ua = (e) => [
	"_format",
	"id",
	"recordToken",
	"externalId",
	...Object.keys(Ha[e])
], Wa = {
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
}, Ga = e({
	dataset: T(Ra),
	mode: T(za),
	fileName: E().trim().min(1).max(200),
	text: E().max(1e6),
	mapping: se(E(), f().int().nonnegative()).optional()
}).strict();
function Ka(e) {
	if (e.text.includes("\0")) throw Error("CSV source must be text without NUL characters.");
	let t = Ea(e.text.replace(/^\uFEFF/, ""));
	if (t.length < 2 || t.length > 501) throw Error("Choose a CSV header and 1–500 data records.");
	let n = t[0].map((e) => e.trim());
	if (n.length > 64 || n.some((e) => !e || e.length > 120) || new Set(n.map((e) => e.toLowerCase())).size !== n.length) throw Error("CSV requires 1–64 distinct, nonempty column names of at most 120 characters.");
	if (t.slice(1).some((e) => e.length !== n.length || e.some((e) => e.length > 1e5))) throw Error("Each CSV record must match the header width; cells may not exceed 100,000 characters.");
	let r = Ua(e.dataset), i = e.mapping ?? Object.fromEntries(r.flatMap((e) => {
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
function qa(e) {
	return e.map((e) => e.map((e) => "\"" + (/^[=+@\-'\t\r]/.test(e) ? "'" + e : e).replaceAll("\"", "\"\"") + "\"").join(",")).join("\r\n");
}
//#endregion
//#region src/features/payroll/data/payrollModel.ts
var V = E().trim().min(1).max(200), Ja = E().refine((e) => /^\d{4}-\d{2}-\d{2}$/.test(e) && !isNaN(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e, "Use a valid date."), Ya = E().trim().min(3).max(2e3), Xa = f().finite().min(0).max(1e9).refine((e) => Math.abs(e * 100 - Math.round(e * 100)) < 1e-5, "Use whole cents."), Za = f().finite().min(0).max(1e5).refine((e) => Math.abs(e * 1e4 - Math.round(e * 1e4)) < 1e-6, "Use at most four decimal places."), Qa = e({
	actorId: V,
	at: Me(),
	action: V,
	reason: Ya,
	revision: f().int().positive()
}).strict(), $a = {
	id: V,
	revision: f().int().positive(),
	history: s(Qa).min(1)
}, eo = e({
	code: E().trim().min(1).max(40),
	name: V,
	position: E().trim().max(200),
	email: ee().or(b("")),
	startDate: Ja,
	endDate: Ja.or(b("")),
	status: T(["Active", "Inactive"]),
	basis: T(["Hourly", "Salary"]),
	rate: Xa,
	earningItemId: V,
	taxScale: T(pa).default("Manual"),
	standardTaxConfirmed: y().default(!1),
	superFund: E().trim().max(200).default(""),
	superMemberId: E().trim().max(100).default(""),
	bankAccount: E().trim().max(100),
	taxIdentifier: E().trim().max(100),
	annualOpening: Za,
	personalOpening: Za
}).strict(), to = eo.extend($a).strict(), no = e({
	code: E().trim().min(1).max(40),
	name: V,
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
	rate: Xa,
	taxable: y(),
	accountId: V,
	liabilityAccountId: E().trim().max(200),
	active: y()
}).strict(), ro = no.extend($a).strict(), io = e({
	netAccountId: V,
	taxItemId: V,
	currency: E().regex(/^[A-Z]{3}$/),
	region: b("Australia"),
	frequency: T(ma).default("Fortnightly"),
	superItemId: V,
	employerName: V,
	employerIdentifier: E().trim().max(100)
}).strict(), ao = io.extend($a).strict(), oo = e({
	id: V,
	code: E().max(200),
	name: V,
	revision: V
}).strict(), so = e({
	employeeId: V,
	itemId: V,
	projectId: V.optional(),
	date: Ja,
	hours: Za.refine((e) => e > 0),
	notes: E().trim().max(1e3)
}).strict(), co = so.extend({
	...$a,
	project: oo.optional(),
	status: T([
		"Draft",
		"Submitted",
		"Approved"
	])
}).strict(), lo = e({
	employeeId: V,
	type: T([
		"Annual",
		"Personal",
		"Unpaid"
	]),
	start: Ja,
	end: Ja,
	hours: Za.refine((e) => e > 0),
	notes: E().trim().max(1e3)
}).strict(), uo = lo.extend({
	...$a,
	status: T([
		"Pending",
		"Approved",
		"Declined",
		"Cancelled"
	])
}).strict(), fo = e({
	employeeId: V,
	itemId: V,
	quantity: Za.refine((e) => e > 0),
	rate: Xa
}).strict(), po = e({
	name: V,
	start: Ja,
	end: Ja,
	payDate: Ja,
	employeeInputs: s(e({
		employeeId: V,
		withholding: Xa,
		additionalWithholding: Xa.default(0),
		superMethod: T(["Reviewed amount", "12% reviewed QE"]).default("Reviewed amount"),
		superBase: Xa.default(0),
		superAmount: Xa.default(0),
		salaryOverride: Xa.optional(),
		annualAccrual: Za,
		personalAccrual: Za
	}).strict()).min(1).max(500),
	adjustments: s(fo).max(2e3),
	taxReviewed: y(),
	reviewReference: E().trim().max(500)
}).strict(), mo = e({
	item: ro,
	quantity: Za,
	rate: Xa,
	amount: Xa,
	source: E().max(200)
}).strict(), ho = e({
	gross: Xa,
	taxable: Xa,
	deductions: Xa,
	net: Xa,
	employerCost: Xa,
	withholding: Xa
}).strict(), go = e({
	employee: to,
	lines: s(mo).min(1),
	projectAllocation: e({
		times: s(co).min(1),
		leaves: s(uo),
		leaveHours: Za,
		costs: s(e({
			lineIndex: f().int().nonnegative(),
			project: oo,
			amount: Xa.refine((e) => e > 0)
		}).strict())
	}).strict().optional(),
	timeIds: s(V),
	leaveIds: s(V),
	annualAccrual: Za,
	personalAccrual: Za,
	totals: ho
}).strict(), _o = po.extend({
	...$a,
	status: T([
		"Draft",
		"Approved",
		"Posted",
		"Reversed",
		"Cancelled"
	]),
	slips: s(go).min(1),
	totals: ho,
	settings: ao,
	sourceToken: V,
	journalId: V.optional(),
	reversalJournalId: V.optional(),
	reversalDate: Ja.optional()
}).strict(), vo = e({
	...$a,
	operationId: V,
	runId: V,
	accountId: V,
	bankAccountId: V,
	date: Ja,
	amount: Xa.refine((e) => e > 0),
	reference: E().trim().max(200),
	status: T(["Posted", "Reversed"]),
	journalId: V,
	reversalJournalId: V.optional(),
	reversalDate: Ja.optional()
}).strict(), yo = e({
	...$a,
	runId: V,
	status: T([
		"Prepared",
		"External reference recorded",
		"Correction needed"
	]),
	reference: E().trim().max(200),
	notes: E().trim().max(1e3),
	runRevision: f().int().positive()
}).strict(), bo = e({
	employees: s(to),
	items: s(ro),
	timesheets: s(co),
	leave: s(uo),
	runs: s(_o),
	payments: s(vo),
	filings: s(yo),
	settings: s(ao).max(1),
	receipts: s(e({
		operationId: V,
		fingerprint: E().regex(/^[a-f0-9]{64}$/),
		input: se(E(), ye()),
		actorId: V,
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
		recordId: V,
		revision: f().int().positive()
	}).strict())
}).strict(), xo = () => ({
	employees: [],
	items: [],
	timesheets: [],
	leave: [],
	runs: [],
	payments: [],
	filings: [],
	settings: [],
	receipts: []
}), So = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Co(e) {
	let t = (t) => So(e.filter(t).reduce((e, t) => e + t.amount, 0)), n = (e) => ["Earnings", "Allowance"].includes(e.item.category), r = t(n), i = t((e) => ["Deduction", "Tax"].includes(e.item.category));
	return ho.parse({
		gross: r,
		taxable: t((e) => n(e) && e.item.taxable),
		deductions: i,
		net: So(r - i),
		employerCost: t((e) => e.item.category === "Employer contribution"),
		withholding: t((e) => e.item.category === "Tax")
	});
}
function wo(e) {
	return ho.parse(Object.fromEntries(Object.keys(ho.shape).map((t) => [t, So(e.reduce((e, n) => e + n.totals[t], 0))])));
}
//#endregion
//#region electron/security/payrollRepository.ts
var H = xo(), To = (e) => Array.isArray(e) ? e.map(To) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, To(e[t])])) : e, Eo = (e) => Oe("sha256").update(JSON.stringify(To(e))).digest("hex"), Do = {
	operationId: V,
	reason: Ya
}, Oo = {
	id: V.optional(),
	expectedRevision: f().int().nonnegative()
};
function ko(e = "payroll.manage") {
	return O.require(e);
}
function U(e, t) {
	let n = H[e].find((e) => e.id === t);
	if (!n) throw Error("Payroll record was not found.");
	return n;
}
var Ao = (e) => !["Cancelled", "Reversed"].includes(e.status);
function jo(e, t, n) {
	return H.runs.some((r) => r.id !== n && Ao(r) && r.slips.some((n) => (e === "timesheets" ? n.timeIds : n.leaveIds).includes(t)));
}
function Mo(e, t) {
	return H[e] = [...H[e].filter((e) => e.id !== t.id), t], structuredClone(t);
}
function No(e, t, n) {
	let r = (e?.revision ?? 0) + 1;
	return {
		id: e?.id ?? crypto.randomUUID(),
		revision: r,
		history: [...e?.history ?? [], {
			actorId: ko("payroll.read").userId,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			action: t,
			reason: n,
			revision: r
		}]
	};
}
function Po(e, t) {
	if ((e?.revision ?? 0) !== t) throw Error("Payroll record changed. Reload before editing.");
}
function Fo(e, t, n) {
	let r = Eo({
		input: e,
		actorId: ko("payroll.read").userId
	}), i = H.receipts.find((t) => t.operationId === e.operationId);
	if (i) {
		if (i.fingerprint !== r || i.entity !== t) throw Error("Operation ID already has different payroll data.");
		return structuredClone(U(t, i.recordId));
	}
	let a = n();
	return H.receipts.push({
		operationId: e.operationId,
		fingerprint: r,
		input: structuredClone(e),
		actorId: ko("payroll.read").userId,
		entity: t,
		recordId: a.id,
		revision: a.revision
	}), bo.parse(H), a;
}
function Io(e, t, n = !0) {
	let r = P.requireById(e);
	if (r.type !== t || n && !r.active || r.systemRole && (t !== "EXPENSE" || r.systemRole !== "OPERATING_EXPENSE")) throw Error(`Use a dedicated ${t.toLowerCase()} payroll account, not a bank, tax, AR/AP or stock control account.`);
	return r;
}
function Lo(e, t = !0) {
	if (Io(e.accountId, [
		"Earnings",
		"Allowance",
		"Employer contribution"
	].includes(e.category) ? "EXPENSE" : "LIABILITY", t), e.category === "Employer contribution") Io(e.liabilityAccountId, "LIABILITY", t);
	else if (e.liabilityAccountId) throw Error("Only employer contributions use a second liability account.");
	if (["Earnings", "Allowance"].includes(e.category) && e.method === "Percentage" || e.category === "Tax" && e.method !== "Fixed") throw Error("Earnings use hourly/fixed values; withholding tax is an explicitly reviewed fixed amount.");
	if (e.method === "Percentage" && e.rate > 100) throw Error("Percentage rates cannot exceed 100.");
}
function Ro(e) {
	let t = U("employees", e);
	if (t.status !== "Active") throw Error("Select an active employee.");
	return t;
}
function zo(e, t, n = t) {
	if (t < e.startDate || e.endDate && n > e.endDate) throw Error("Dates must be within the employment period.");
}
function Bo(e) {
	O.require("accounting.read");
	let t = x.jobs.find((t) => t.id === e);
	if (!t || t.status !== "Active") throw Error("Select an authorized active project.");
	return {
		id: t.id,
		code: t.code ?? "",
		name: t.name,
		revision: t.revision
	};
}
function Vo(e) {
	if (e.projectId) {
		let t = Bo(e.projectId);
		if (e.project && Eo(e.project) !== Eo(t)) throw Error("Project changed. Reopen and review the timesheet project.");
	}
	let t = Ro(e.employeeId);
	zo(t, e.date);
	let n = U("items", e.itemId);
	if (!n.active || n.category !== "Earnings" || t.basis === "Hourly" && n.method !== "Hourly" || t.basis === "Salary" && n.id !== t.earningItemId) throw Error("Select an appropriate employee earnings item.");
	Lo(n);
}
function Ho(e, t) {
	if (zo(Ro(e.employeeId), e.start, e.end), e.start > e.end || e.hours > ((Date.parse(e.end) - Date.parse(e.start)) / 864e5 + 1) * 24) throw Error("Leave dates or hours are invalid.");
	if (H.leave.some((n) => n.id !== t && n.employeeId === e.employeeId && ["Pending", "Approved"].includes(n.status) && n.start <= e.end && n.end >= e.start)) throw Error("Leave request dates overlap.");
}
function Uo() {
	let e = H.settings[0];
	if (!e) throw Error("Configure payroll settings first.");
	Io(e.netAccountId, "LIABILITY");
	let t = U("items", e.taxItemId);
	if (t.category !== "Tax" || !t.active) throw Error("Select an active fixed withholding item.");
	if (Lo(t), e.netAccountId === t.accountId) throw Error("Net wages and withholding require separate liability accounts.");
	let n = U("items", e.superItemId);
	if (n.category !== "Employer contribution" || n.method !== "Fixed" || !n.active) throw Error("Use an active fixed super contribution item.");
	if (Lo(n), e.currency !== "AUD" || e.currency !== C().currency) throw Error("Payroll currency must match the business currency.");
	return e;
}
function Wo(e, t) {
	let n = U("employees", e), r = n.annualOpening, i = n.personalOpening, a = /* @__PURE__ */ new Set();
	for (let n of H.runs.filter((e) => e.status === "Posted" && e.id !== t)) for (let t of n.slips.filter((t) => t.employee.id === e)) {
		r += t.annualAccrual, i += t.personalAccrual;
		for (let e of t.leaveIds) {
			let t = U("leave", e);
			a.add(e), t.type === "Annual" && (r -= t.hours), t.type === "Personal" && (i -= t.hours);
		}
	}
	let o = H.leave.filter((t) => t.employeeId === e && t.status === "Approved" && !a.has(t.id));
	return {
		annual: Math.round(r * 1e4) / 1e4,
		personal: Math.round(i * 1e4) / 1e4,
		reservedAnnual: o.filter((e) => e.type === "Annual").reduce((e, t) => e + t.hours, 0),
		reservedPersonal: o.filter((e) => e.type === "Personal").reduce((e, t) => e + t.hours, 0)
	};
}
function Go(e, t) {
	let n = Wo(e, t);
	if (n.annual - n.reservedAnnual < -1e-5 || n.personal - n.reservedPersonal < -1e-5) throw Error("Approved leave exceeds the available recorded hours.");
}
var Ko = () => Eo({
	employees: H.employees,
	items: H.items,
	timesheets: H.timesheets,
	leave: H.leave,
	settings: H.settings
});
function qo(e, t) {
	if (e.start > e.end || e.payDate < e.end) throw Error("Pay date must follow a valid pay period.");
	let n = Uo(), r = /* @__PURE__ */ new Set(), i = [];
	for (let a of e.employeeInputs) {
		if (r.has(a.employeeId)) throw Error("Include each employee only once.");
		r.add(a.employeeId);
		let o = Ro(a.employeeId);
		if (o.startDate > e.end || o.endDate && o.endDate < e.start) throw Error("Employment does not overlap this pay period.");
		if (o.basis === "Salary" && (o.startDate > e.start || o.endDate && o.endDate < e.end) && a.salaryOverride === void 0) throw Error("Partial-period salary requires a reviewed salary override.");
		if (H.runs.some((n) => n.id !== t && Ao(n) && n.start <= e.end && n.end >= e.start && n.slips.some((e) => e.employee.id === o.id))) throw Error("Employee already has an overlapping pay run. Cancel or reverse it before replacing it.");
		let s = U("items", o.earningItemId);
		if (!s.active || s.category !== "Earnings" || s.method !== (o.basis === "Hourly" ? "Hourly" : "Fixed")) throw Error("Employee earning item does not match the pay basis.");
		Lo(s);
		let c = H.timesheets.filter((t) => t.employeeId === o.id && t.status === "Approved" && t.date >= e.start && t.date <= e.end), l = H.leave.filter((t) => t.employeeId === o.id && t.status === "Approved" && t.start <= e.end && t.end >= e.start);
		if (l.some((t) => t.start < e.start || t.end > e.end)) throw Error("Split leave spanning pay periods before including it in payroll.");
		for (let e of c) Vo(e);
		for (let e of l) Ho(e, e.id);
		if (c.some((e) => jo("timesheets", e.id, t)) || l.some((e) => jo("leave", e.id, t))) throw Error("Hours or leave are already reserved by another pay run.");
		if (c.some((e) => l.some((t) => e.date >= t.start && e.date <= t.end))) throw Error("Approved timesheet and leave dates overlap; correct them before payroll.");
		if (o.basis === "Salary" && l.some((e) => e.type === "Unpaid") && a.salaryOverride === void 0) throw Error("Salary with unpaid leave requires an explicitly reviewed salary override.");
		if (o.basis === "Hourly" && a.salaryOverride !== void 0) throw Error("Hourly employees cannot use a salary override.");
		let u = [], d = (e, t, n, r) => {
			if (Lo(e), !e.active) throw Error("Inactive pay item.");
			let i = So(t * n);
			Xa.parse(i), u.push({
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
			let t = U("items", e.itemId);
			if (t.category !== "Earnings" || t.method !== "Hourly") throw Error("Timesheet must use hourly earnings.");
			d(t, e.hours, t.id === s.id ? o.rate : t.rate, "Time:" + e.id);
		}
		if (o.basis === "Hourly") for (let e of l.filter((e) => e.type !== "Unpaid")) d(s, e.hours, o.rate, "Leave:" + e.id);
		let f = e.adjustments.filter((e) => e.employeeId === o.id), p = f.filter((e) => U("items", e.itemId).method !== "Percentage");
		for (let e of p) {
			let t = U("items", e.itemId);
			if (t.id === n.superItemId) throw Error("Use the employee super guarantee fields for the standard contribution.");
			if (t.category === "Tax") throw Error("Use the explicit employee withholding field for tax.");
			if (t.method === "Fixed" && e.quantity !== 1) throw Error("Fixed pay items require quantity 1.");
			d(t, e.quantity, e.rate, "Adjustment");
		}
		let m = So(u.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + t.amount, 0));
		if (m <= 0) throw Error("Each employee needs positive gross earnings.");
		for (let e of f.filter((e) => U("items", e.itemId).method === "Percentage")) {
			if (e.quantity !== 1 || e.rate > 100) throw Error("Percentage items require quantity 1 and rate 0–100.");
			d(U("items", e.itemId), 1, So(m * e.rate / 100), "Adjustment"), u[u.length - 1].quantity = 1, u[u.length - 1].rate = e.rate;
		}
		let h = So(u.filter((e) => ["Earnings", "Allowance"].includes(e.item.category) && e.item.taxable).reduce((e, t) => e + t.amount, 0)), g = a.withholding;
		if (o.taxScale !== "Manual") {
			if (!o.standardTaxConfirmed) throw Error("Confirm the standard PAYG case or use reviewed manual withholding.");
			if (!o.taxScale.startsWith("4-") && !/^\d{8,9}$/.test(o.taxIdentifier.replace(/\s/g, ""))) throw Error("Record a provided eight- or nine-digit TFN for the selected scale.");
			if (a.withholding !== 0) throw Error("Clear manual withholding for an automatic PAYG employee.");
			g = ga(h, o.taxScale, n.frequency, e.payDate);
		}
		if (g = So(g + a.additionalWithholding), d(U("items", n.taxItemId), 1, g, o.taxScale === "Manual" ? "Reviewed PAYG" : "ATO 2026–27 scale " + o.taxScale), a.superMethod === "12% reviewed QE" && (e.payDate < "2026-07-01" || e.payDate > "2027-06-30" || a.superBase > m)) throw Error("Reviewed qualifying earnings must not exceed gross and the 12% helper is limited to 2026–27. Use a reviewed super amount for exceptions.");
		let _ = a.superMethod === "12% reviewed QE" ? So(a.superBase * .12) : a.superAmount;
		d(U("items", n.superItemId), 1, _, a.superMethod === "12% reviewed QE" ? "SG 12% reviewed QE" : "Reviewed SG amount");
		let v = Co(u), ee = c.some((e) => e.project) ? {
			times: structuredClone(c),
			leaves: structuredClone(l),
			leaveHours: l.reduce((e, t) => e + t.hours, 0),
			costs: _a(o.basis, c, l.reduce((e, t) => e + t.hours, 0), u)
		} : void 0;
		i.push({
			...ee ? { projectAllocation: ee } : {},
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
		totals: wo(i),
		settings: structuredClone(n),
		sourceToken: Ko()
	};
}
function Jo(e) {
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
function Yo(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of Jo(e).filter((e) => e.credit)) t.set(n.accountId, So((t.get(n.accountId) ?? 0) + n.credit));
	return [...t].map(([t, n]) => ({
		accountId: t,
		amount: n,
		paid: So(H.payments.filter((n) => n.runId === e.id && n.accountId === t && n.status === "Posted").reduce((e, t) => e + t.amount, 0))
	}));
}
var Xo = {
	balances(e) {
		return ko("payroll.read"), Wo(V.parse(e));
	},
	obligations(e) {
		return ko("payroll.read"), Yo(U("runs", V.parse(e)));
	},
	setupDefaults(t) {
		ko(), O.require("accounting.post");
		let n = e(Do).strict().parse(t);
		return Fo(n, "settings", () => {
			if (H.settings.length) throw Error("Payroll is already configured.");
			let e = (e, t, n) => {
				for (; P.getAll().some((t) => t.code === String(e));) e++;
				return P.create({
					code: String(e),
					name: t,
					type: n,
					active: !0,
					allowManualPosting: n === "EXPENSE"
				}).id;
			}, t = e(6e3, "Payroll wages", "EXPENSE"), r = e(6010, "Payroll employer contributions", "EXPENSE"), i = e(2200, "Net wages payable", "LIABILITY"), a = e(2210, "Payroll withholding payable", "LIABILITY"), o = e(2220, "Payroll deductions payable", "LIABILITY"), s = e(2230, "Employer contributions payable", "LIABILITY"), c = (e, t, r, i, a, o = "") => {
				let s = {
					...No(void 0, "Created", n.reason),
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
				return H.items.push(s), s;
			};
			c("ORD", "Ordinary hours", "Earnings", "Hourly", t), c("SAL", "Salary per run", "Earnings", "Fixed", t);
			let l = c("TAX", "Reviewed withholding", "Tax", "Fixed", a);
			c("ALLOW", "Allowance", "Allowance", "Fixed", t), c("DEDUCT", "Employee deduction", "Deduction", "Fixed", o);
			let u = c("SG", "Super guarantee", "Employer contribution", "Fixed", r, s);
			return Mo("settings", {
				...No(void 0, "Configured", n.reason),
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
		ko();
		let n = e({
			...Do,
			...Oo,
			values: eo
		}).strict().parse(t);
		return Fo(n, "employees", () => {
			let e = n.id ? U("employees", n.id) : void 0;
			if (Po(e, n.expectedRevision), H.employees.some((t) => t.id !== e?.id && t.code.toLowerCase() === n.values.code.toLowerCase())) throw Error("Employee code already exists.");
			if (n.values.endDate && n.values.endDate < n.values.startDate) throw Error("Employment end date is before the start date.");
			let t = U("items", n.values.earningItemId);
			if (!t.active || t.category !== "Earnings" || t.method !== (n.values.basis === "Hourly" ? "Hourly" : "Fixed")) throw Error("Select an active earning item matching the pay basis.");
			if (e && H.runs.some((t) => ["Posted", "Reversed"].includes(t.status) && t.slips.some((t) => t.employee.id === e.id)) && (e.annualOpening !== n.values.annualOpening || e.personalOpening !== n.values.personalOpening)) throw Error("Opening leave hours are locked after payroll posting.");
			return Mo("employees", {
				...n.values,
				...No(e, e ? "Edited" : "Created", n.reason)
			});
		});
	},
	saveItem(t) {
		ko();
		let n = e({
			...Do,
			...Oo,
			values: no
		}).strict().parse(t);
		return Fo(n, "items", () => {
			let e = n.id ? U("items", n.id) : void 0;
			if (Po(e, n.expectedRevision), H.items.some((t) => t.id !== e?.id && t.code.toLowerCase() === n.values.code.toLowerCase())) throw Error("Pay item code already exists.");
			let t = {
				...n.values,
				...No(e, e ? "Edited" : "Created", n.reason)
			};
			return Lo(t), Mo("items", t);
		});
	},
	saveSettings(t) {
		ko();
		let n = e({
			...Do,
			expectedRevision: f().int().nonnegative(),
			values: io
		}).strict().parse(t);
		return Fo(n, "settings", () => {
			let e = H.settings[0];
			Po(e, n.expectedRevision), Io(n.values.netAccountId, "LIABILITY");
			let t = U("items", n.values.superItemId);
			if (t.category !== "Employer contribution" || t.method !== "Fixed" || !t.active) throw Error("Select an active fixed super guarantee item.");
			let r = U("items", n.values.taxItemId);
			if (r.category !== "Tax" || !r.active || r.accountId === n.values.netAccountId) throw Error("Use a valid withholding item and a separate net wages account.");
			if (n.values.currency !== "AUD" || n.values.currency !== C().currency) throw Error("Payroll currency must match the business.");
			return Mo("settings", {
				...n.values,
				...No(e, "Settings changed", n.reason)
			});
		});
	},
	saveTime(t) {
		ko();
		let n = e({
			...Do,
			...Oo,
			values: so
		}).strict().parse(t);
		return Fo(n, "timesheets", () => {
			let e = n.id ? U("timesheets", n.id) : void 0;
			if (Po(e, n.expectedRevision), e && (e.status !== "Draft" || jo("timesheets", e.id))) throw Error("Only an unreserved draft timesheet can be edited.");
			Vo(n.values);
			let t = Ro(n.values.employeeId), r = U("items", n.values.itemId);
			if (H.timesheets.filter((r) => r.id !== e?.id && r.employeeId === t.id && r.date === n.values.date).reduce((e, t) => e + t.hours, 0) + n.values.hours > 24) throw Error("Total timesheet hours cannot exceed 24 for one employee/day.");
			if (H.timesheets.some((i) => i.id !== e?.id && i.employeeId === t.id && i.itemId === r.id && i.date === n.values.date && i.projectId === n.values.projectId)) throw Error("A timesheet already exists for this employee, day and item.");
			return Mo("timesheets", {
				...n.values,
				...n.values.projectId ? { project: Bo(n.values.projectId) } : {},
				...No(e, e ? "Edited" : "Created", n.reason),
				status: "Draft"
			});
		});
	},
	changeTime(t) {
		let n = e({
			...Do,
			id: V,
			expectedRevision: f().int().positive(),
			action: T([
				"Submit",
				"Approve",
				"Reopen"
			])
		}).strict().parse(t);
		return ko(n.action === "Approve" ? "payroll.approve" : "payroll.manage"), Fo(n, "timesheets", () => {
			let e = U("timesheets", n.id);
			if (Po(e, n.expectedRevision), jo("timesheets", e.id)) throw Error("Timesheet is reserved by a pay run.");
			if (n.action === "Submit" && e.status !== "Draft" || n.action === "Approve" && e.status !== "Submitted" || n.action === "Reopen" && e.status === "Draft") throw Error("Invalid timesheet transition.");
			return n.action !== "Reopen" && Vo(e), Mo("timesheets", {
				...e,
				...No(e, n.action, n.reason),
				status: n.action === "Submit" ? "Submitted" : n.action === "Approve" ? "Approved" : "Draft"
			});
		});
	},
	saveLeave(t) {
		ko();
		let n = e({
			...Do,
			...Oo,
			values: lo
		}).strict().parse(t);
		return Fo(n, "leave", () => {
			let e = n.id ? U("leave", n.id) : void 0;
			if (Po(e, n.expectedRevision), e && (e.status !== "Pending" || jo("leave", e.id))) throw Error("Only an unreserved pending leave request can be edited.");
			return Ho(n.values, e?.id), Mo("leave", {
				...n.values,
				...No(e, e ? "Edited" : "Created", n.reason),
				status: "Pending"
			});
		});
	},
	changeLeave(t) {
		let n = e({
			...Do,
			id: V,
			expectedRevision: f().int().positive(),
			action: T([
				"Approve",
				"Decline",
				"Cancel",
				"Reopen"
			])
		}).strict().parse(t);
		return ko(n.action === "Approve" || n.action === "Decline" ? "payroll.approve" : "payroll.manage"), Fo(n, "leave", () => {
			let e = U("leave", n.id);
			if (Po(e, n.expectedRevision), jo("leave", e.id)) throw Error("Leave is reserved by a pay run.");
			if (["Approve", "Decline"].includes(n.action) && e.status !== "Pending" || n.action === "Cancel" && ["Cancelled", "Declined"].includes(e.status) || n.action === "Reopen" && !["Cancelled", "Declined"].includes(e.status)) throw Error("Invalid leave transition.");
			(n.action === "Approve" || n.action === "Reopen") && Ho(e, e.id);
			let t = Mo("leave", {
				...e,
				...No(e, n.action, n.reason),
				status: n.action === "Approve" ? "Approved" : n.action === "Decline" ? "Declined" : n.action === "Cancel" ? "Cancelled" : "Pending"
			});
			return t.status === "Approved" && Go(e.employeeId), t;
		});
	},
	saveRun(t) {
		ko();
		let n = e({
			...Do,
			...Oo,
			values: po
		}).strict().parse(t);
		return Fo(n, "runs", () => {
			let e = n.id ? U("runs", n.id) : void 0;
			if (Po(e, n.expectedRevision), e && e.status !== "Draft") throw Error("Only a draft pay run can be recalculated.");
			let t = qo(n.values, e?.id);
			return Mo("runs", {
				...n.values,
				...No(e, e ? "Recalculated" : "Created", n.reason),
				...t,
				status: "Draft"
			});
		});
	},
	changeRun(t) {
		let n = e({
			...Do,
			id: V,
			expectedRevision: f().int().positive(),
			action: T([
				"Approve",
				"Reopen",
				"Cancel",
				"Post",
				"Reverse"
			]),
			date: Ja.optional()
		}).strict().parse(t);
		return ko(n.action === "Approve" ? "payroll.approve" : ["Post", "Reverse"].includes(n.action) ? "payroll.post" : "payroll.manage"), Fo(n, "runs", () => {
			let e = U("runs", n.id);
			if (Po(e, n.expectedRevision), n.action === "Approve" || n.action === "Post") {
				if (e.status !== (n.action === "Approve" ? "Draft" : "Approved")) throw Error("Invalid pay-run transition.");
				if (!e.taxReviewed || e.reviewReference.trim().length < 3) throw Error("Confirm reviewed withholding and provide its reference.");
				if (e.sourceToken !== Ko()) throw Error("Payroll sources changed. Reopen and recalculate the run.");
				if (Eo(qo(po.parse(Object.fromEntries(Object.keys(po.shape).map((t) => [t, e[t]]))), e.id).slips) !== Eo(e.slips)) throw Error("Payroll calculation changed. Recalculate the run.");
			}
			if (n.action === "Approve") return Mo("runs", {
				...e,
				...No(e, "Approved", n.reason),
				status: "Approved"
			});
			if (n.action === "Reopen") {
				if (e.status !== "Approved") throw Error("Only an approved run can be reopened.");
				return Mo("runs", {
					...e,
					...No(e, "Reopened", n.reason),
					status: "Draft",
					taxReviewed: !1
				});
			}
			if (n.action === "Cancel") {
				if (!["Draft", "Approved"].includes(e.status)) throw Error("Only an unposted run can be cancelled.");
				return Mo("runs", {
					...e,
					...No(e, "Cancelled", n.reason),
					status: "Cancelled"
				});
			}
			if (M(), n.action === "Post") {
				let t = F.post({
					journalDate: e.payDate,
					description: "Payroll " + e.name,
					reference: e.id,
					sourceType: "PAYROLL",
					sourceId: e.id,
					lines: Jo(e)
				}), r = Mo("runs", {
					...e,
					...No(e, "Posted", n.reason),
					status: "Posted",
					journalId: t.id
				});
				return e.slips.forEach((e) => Go(e.employee.id)), r;
			}
			if (e.status !== "Posted" || !n.date || n.date < e.payDate) throw Error("Reverse a posted run on or after its pay date.");
			if (H.payments.some((t) => t.runId === e.id && t.status === "Posted")) throw Error("Reverse recorded payroll payments before reversing the run.");
			let t = F.reverse({
				journalEntryId: e.journalId,
				reversalDate: n.date,
				reason: n.reason
			}), r = Mo("runs", {
				...e,
				...No(e, "Reversed", n.reason),
				status: "Reversed",
				reversalJournalId: t.id,
				reversalDate: n.date
			});
			e.slips.forEach((e) => Go(e.employee.id));
			for (let t of H.filings.filter((t) => t.runId === e.id)) Mo("filings", {
				...t,
				...No(t, "Correction needed", n.reason),
				status: "Correction needed"
			});
			return r;
		});
	},
	recordPayment(t) {
		ko("payroll.post"), O.require("banking.write");
		let n = e({
			...Do,
			runId: V,
			accountId: V,
			bankAccountId: V,
			date: Ja,
			amount: Xa.refine((e) => e > 0),
			reference: E().trim().max(200)
		}).strict().parse(t);
		return Fo(n, "payments", () => {
			M();
			let e = U("runs", n.runId);
			if (e.status !== "Posted" || n.date < e.payDate) throw Error("Record payment against a posted run on or after pay date.");
			let t = Yo(e).find((e) => e.accountId === n.accountId);
			if (!t || n.amount > So(t.amount - t.paid)) throw Error("Payment exceeds the outstanding payroll liability.");
			Io(n.accountId, "LIABILITY");
			let r = I.requireById(n.bankAccountId), i = P.requireById(r.glAccountId);
			if (!r.active || !i.active || i.type !== "ASSET" || r.currency !== e.settings.currency || n.date < r.openingBalanceDate) throw Error("Use an active bank in the payroll currency with a valid posting date.");
			let a = No(void 0, "Payment recorded", n.reason), o = F.post({
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
			return Mo("payments", {
				...c,
				...a,
				status: "Posted",
				journalId: o.id
			});
		});
	},
	reversePayment(t) {
		ko("payroll.post"), O.require("banking.write");
		let n = e({
			...Do,
			id: V,
			expectedRevision: f().int().positive(),
			date: Ja
		}).strict().parse(t);
		return Fo(n, "payments", () => {
			M();
			let e = U("payments", n.id);
			if (Po(e, n.expectedRevision), e.status !== "Posted" || n.date < e.date) throw Error("Reverse a posted payment on or after its date.");
			Bn("PAYROLL_PAYMENT", e.id);
			let t = F.reverse({
				journalEntryId: e.journalId,
				reversalDate: n.date,
				reason: n.reason
			});
			return Mo("payments", {
				...e,
				...No(e, "Payment reversed", n.reason),
				status: "Reversed",
				reversalJournalId: t.id,
				reversalDate: n.date
			});
		});
	},
	recordFiling(t) {
		ko();
		let n = e({
			...Do,
			runId: V,
			expectedRevision: f().int().nonnegative(),
			reference: E().trim().max(200),
			notes: E().trim().max(1e3)
		}).strict().parse(t);
		return Fo(n, "filings", () => {
			let e = U("runs", n.runId);
			if (e.status !== "Posted") throw Error("Prepare filing review only for a posted run.");
			let t = H.filings.find((t) => t.runId === e.id);
			return Po(t, n.expectedRevision), Mo("filings", {
				...No(t, "Filing review recorded", n.reason),
				runId: e.id,
				runRevision: e.revision,
				reference: n.reference,
				notes: n.notes,
				status: n.reference ? "External reference recorded" : "Prepared"
			});
		});
	},
	exportSlip(t) {
		ko("payroll.read");
		let n = e({
			runId: V,
			employeeId: V
		}).strict().parse(t), r = U("runs", n.runId), i = r.slips.find((e) => e.employee.id === n.employeeId);
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
				...i.projectAllocation?.costs.map((e) => `Project cost ${e.project.code} / ${e.project.name} v${e.project.revision} / ${i.lines[e.lineIndex].item.name}: ${e.amount.toFixed(2)}`) ?? [],
				"Accrued payroll; payment completion is recorded separately."
			].join("\n")
		};
	},
	exportRun(e) {
		ko("payroll.read");
		let t = U("runs", V.parse(e)), n = [[
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
			"Review reference",
			"Frozen project costs"
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
			String(So(e.totals.deductions - e.totals.withholding)),
			String(e.totals.net),
			String(e.totals.employerCost),
			t.reviewReference,
			e.projectAllocation?.costs.map((e) => `${e.project.code} / ${e.project.name} v${e.project.revision}: ${e.amount.toFixed(2)}`).join("; ") ?? "Unallocated"
		])];
		return {
			name: "Payroll-review-" + t.id + ".csv",
			csv: qa(n)
		};
	}
};
i("payroll", {
	repository: Xo,
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
	snapshot: () => H,
	restore: (e) => {
		H = e;
	},
	publish: () => {},
	validate: (e, t) => {
		let n = bo.parse(e), r = t, i = r.accounts.accounts, a = r.journals.journalEntries, o = r.bankAccounts.bankAccounts;
		function s(e) {
			if (!!e.projectId != !!e.project || e.projectId && e.projectId !== e.project?.id) throw Error("Invalid timesheet project binding.");
			if (e.project && ![...r.workspace_jobs.records, ...r.workspace_jobs.history.map((e) => JSON.parse(e.after))].some((t) => t.id === e.project.id && t.code === e.project.code && t.name === e.project.name && t.revision === e.project.revision)) throw Error("Invalid historical payroll project snapshot.");
		}
		n.timesheets.forEach(s);
		let c = (e, t) => {
			let r = n[e].find((e) => e.id === t);
			if (!r) throw Error("Invalid payroll reference.");
			return r;
		}, l = (e, t) => {
			let n = i.find((t) => t.id === e);
			if (!n || n.type !== t || n.systemRole && (t !== "EXPENSE" || n.systemRole !== "OPERATING_EXPENSE")) throw Error("Invalid payroll account mapping.");
		};
		for (let e of [n.employees, n.items]) if (new Set(e.map((e) => e.code.toLowerCase())).size !== e.length) throw Error("Duplicate payroll code.");
		let u = /* @__PURE__ */ new Set();
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
			if (u.has(t.id)) throw Error("Duplicate payroll record ID.");
			if (u.add(t.id), t.history.length !== t.revision || t.history.some((e, t) => e.revision !== t + 1)) throw Error("Invalid payroll revision history.");
		}
		for (let e of n.items) if (l(e.accountId, [
			"Earnings",
			"Allowance",
			"Employer contribution"
		].includes(e.category) ? "EXPENSE" : "LIABILITY"), e.category === "Employer contribution" && l(e.liabilityAccountId, "LIABILITY"), e.method === "Percentage" && ([
			"Earnings",
			"Allowance",
			"Tax"
		].includes(e.category) || e.rate > 100) || e.category === "Tax" && e.method !== "Fixed") throw Error("Invalid payroll item method.");
		for (let e of n.settings) {
			if (e.currency !== "AUD" || c("items", e.superItemId).category !== "Employer contribution") throw Error("Invalid AU payroll settings.");
			if (l(e.netAccountId, "LIABILITY"), c("items", e.taxItemId).category !== "Tax" || e.netAccountId === c("items", e.taxItemId).accountId) throw Error("Invalid payroll settings.");
		}
		for (let e of n.employees) if (c("items", e.earningItemId), e.endDate && e.endDate < e.startDate) throw Error("Invalid employment dates.");
		for (let e of n.timesheets) c("employees", e.employeeId), c("items", e.itemId);
		for (let e of n.leave) if (c("employees", e.employeeId), e.start > e.end) throw Error("Invalid leave dates.");
		let d = (e) => {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) {
				let e = t.get(n.accountId) ?? [0, 0];
				t.set(n.accountId, [So(e[0] + n.debit), So(e[1] + n.credit)]);
			}
			return [...t].filter(([, e]) => e[0] || e[1]).sort(([e], [t]) => e.localeCompare(t));
		};
		function f(e, t, n, r, i, o, s, c) {
			let l = a.find((t) => t.id === e);
			if (!l || l.sourceType !== t || l.sourceId !== n || l.journalDate !== r || Eo(d(l.lines)) !== Eo(d(i)) || l.status !== (o ? "REVERSED" : "POSTED")) throw Error("Payroll source journal mismatch.");
			if (o) {
				let e = a.find((e) => e.id === s);
				if (!e || e.reversedJournalEntryId !== l.id || l.reversalJournalEntryId !== e.id || e.journalDate !== c || Eo(d(e.lines)) !== Eo(d(i.map((e) => ({
					...e,
					debit: e.credit,
					credit: e.debit
				}))))) throw Error("Payroll reversal journal mismatch.");
			} else if (s || c) throw Error("Unexpected payroll reversal metadata.");
		}
		let p = /* @__PURE__ */ new Set();
		for (let e of n.runs) {
			if (e.start > e.end || e.payDate < e.end || new Set(e.employeeInputs.map((e) => e.employeeId)).size !== e.employeeInputs.length || e.slips.length !== e.employeeInputs.length || new Set(e.slips.map((e) => e.employee.id)).size !== e.slips.length) throw Error("Invalid payroll period or employees.");
			l(e.settings.netAccountId, "LIABILITY");
			for (let t of e.slips) {
				let r = c("employees", t.employee.id), i = e.employeeInputs.find((e) => e.employeeId === t.employee.id);
				if (!i || t.employee.revision > r.revision || i.annualAccrual !== t.annualAccrual || i.personalAccrual !== t.personalAccrual) throw Error("Invalid payroll employee snapshot.");
				if (t.projectAllocation) {
					let r = t.projectAllocation;
					if (!r.times.some((e) => e.project) || new Set(r.leaves.map((e) => e.id)).size !== r.leaves.length || r.leaves.length !== t.leaveIds.length || r.leaves.some((n) => !t.leaveIds.includes(n.id) || n.employeeId !== t.employee.id || n.status !== "Approved" || n.start < e.start || n.end > e.end) || r.leaveHours !== r.leaves.reduce((e, t) => e + t.hours, 0) || new Set(r.times.map((e) => e.id)).size !== r.times.length || r.times.length !== t.timeIds.length || r.times.some((n) => !t.timeIds.includes(n.id) || n.employeeId !== t.employee.id || n.status !== "Approved" || n.date < e.start || n.date > e.end)) throw Error("Invalid frozen project hours.");
					if (r.times.forEach(s), t.employee.basis === "Hourly" && r.times.some((e) => {
						let n = t.lines.filter((t) => t.source === "Time:" + e.id);
						return n.length !== 1 || n[0].quantity !== e.hours || n[0].item.id !== e.itemId;
					})) throw Error("Frozen project hours differ from payroll earnings.");
					if (Eo(r.costs) !== Eo(_a(t.employee.basis, r.times, r.leaveHours, t.lines))) throw Error("Payroll project costs differ from frozen hours.");
					if (Ao(e) && (r.times.some((e) => Eo(e) !== Eo(n.timesheets.find((t) => t.id === e.id))) || r.leaves.some((e) => Eo(e) !== Eo(n.leave.find((t) => t.id === e.id))) || r.leaveHours !== n.leave.filter((e) => t.leaveIds.includes(e.id)).reduce((e, t) => e + t.hours, 0))) throw Error("Payroll project source changed.");
				} else if (Ao(e) && n.timesheets.some((e) => t.timeIds.includes(e.id) && e.project)) throw Error("Payroll project cost snapshot is missing.");
				let a = So(t.lines.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + t.amount, 0));
				for (let e of t.lines) {
					c("items", e.item.id), l(e.item.accountId, [
						"Earnings",
						"Allowance",
						"Employer contribution"
					].includes(e.item.category) ? "EXPENSE" : "LIABILITY"), e.item.category === "Employer contribution" && l(e.item.liabilityAccountId, "LIABILITY");
					let t = e.item.method === "Percentage" ? So(a * e.rate / 100) : So(e.quantity * e.rate);
					if (e.amount !== t) throw Error("Payroll line calculation mismatch.");
				}
				if (t.employee.taxScale !== "Manual" && (!t.employee.standardTaxConfirmed || i.withholding !== 0)) throw Error("Automatic PAYG declaration mismatch.");
				let o = t.lines.filter((t) => t.item.id === e.settings.superItemId), u = t.lines.filter((e) => e.item.category === "Tax");
				if (o.length !== 1 || o[0].amount !== (i.superMethod === "12% reviewed QE" ? So(i.superBase * .12) : i.superAmount) || u.length !== 1 || u[0].item.id !== e.settings.taxItemId || new Set(t.timeIds).size !== t.timeIds.length || new Set(t.leaveIds).size !== t.leaveIds.length) throw Error("Payroll tax, super or source snapshot mismatch.");
				let d = So((t.employee.taxScale === "Manual" ? i.withholding : ga(t.totals.taxable, t.employee.taxScale, e.settings.frequency, e.payDate)) + i.additionalWithholding);
				if (Eo(Co(t.lines)) !== Eo(t.totals) || t.totals.withholding !== d) throw Error("Payroll payslip totals mismatch.");
				for (let [n, r] of [["timesheets", t.timeIds], ["leave", t.leaveIds]]) for (let i of r) {
					let r = c(n, i);
					if (r.employeeId !== t.employee.id) throw Error("Payroll hours belong to another employee.");
					if (Ao(e)) {
						if (p.has(i) || r.status !== "Approved") throw Error("Payroll source is reused or unapproved.");
						let a = n === "timesheets" ? r.date : r.start, o = n === "timesheets" ? r.date : r.end;
						if (zo(t.employee, a, o), a < e.start || o > e.end) throw Error("Payroll source dates are outside the pay period.");
						let s = n === "timesheets" ? "Time:" : "Leave:", c = t.employee.basis === "Hourly" && (n === "timesheets" || r.type !== "Unpaid"), l = t.lines.filter((e) => e.source === s + i);
						if (c ? l.length !== 1 || l[0].quantity !== r.hours || l[0].item.id !== (n === "timesheets" ? r.itemId : t.employee.earningItemId) : l.length !== 0) throw Error("Payroll source hours do not match the frozen payslip.");
						p.add(i);
					}
				}
			}
			if (Eo(wo(e.slips)) !== Eo(e.totals)) throw Error("Payroll run totals mismatch.");
			if (["Posted", "Reversed"].includes(e.status)) {
				if (!e.taxReviewed || e.reviewReference.trim().length < 3) throw Error("Posted payroll has no withholding review.");
				f(e.journalId, "PAYROLL", e.id, e.payDate, Jo(e), e.status === "Reversed", e.reversalJournalId, e.reversalDate);
			} else if (e.journalId || e.reversalJournalId) throw Error("Unposted payroll has journal metadata.");
		}
		for (let e of n.payments) {
			let t = c("runs", e.runId), n = o.find((t) => t.id === e.bankAccountId);
			if (!n || n.currency !== t.settings.currency || e.date < t.payDate || !["Posted", "Reversed"].includes(t.status) || e.status === "Posted" && t.status !== "Posted") throw Error("Invalid payroll payment source.");
			l(e.accountId, "LIABILITY"), f(e.journalId, "PAYROLL_PAYMENT", e.id, e.date, [{
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
			for (let n of Jo(e).filter((e) => e.credit)) t.set(n.accountId, So((t.get(n.accountId) ?? 0) + n.credit));
			for (let [r, i] of t) if (So(n.payments.filter((t) => t.runId === e.id && t.accountId === r && t.status === "Posted").reduce((e, t) => e + t.amount, 0)) > i) throw Error("Payroll liabilities are overpaid.");
			if (n.payments.some((n) => n.runId === e.id && !t.has(n.accountId))) throw Error("Payment uses an unrelated payroll liability.");
		}
		for (let e of n.filings) {
			let t = c("runs", e.runId);
			if (!["Posted", "Reversed"].includes(t.status) || e.runRevision > t.revision || t.status === "Reversed" && e.status !== "Correction needed" || e.status === "External reference recorded" && !e.reference) throw Error("Invalid payroll filing review.");
		}
		for (let e of a.filter((e) => ["PAYROLL", "PAYROLL_PAYMENT"].includes(e.sourceType) && !e.reversedJournalEntryId)) if (!(e.sourceType === "PAYROLL" ? n.runs : n.payments).some((t) => t.id === e.sourceId && t.journalId === e.id)) throw Error("Orphan payroll journal.");
		for (let e of n.employees) {
			let t = e.annualOpening, r = e.personalOpening, i = /* @__PURE__ */ new Set();
			for (let a of n.runs.filter((e) => e.status === "Posted")) for (let n of a.slips.filter((t) => t.employee.id === e.id)) {
				t += n.annualAccrual, r += n.personalAccrual;
				for (let e of n.leaveIds) {
					let n = c("leave", e);
					i.add(e), n.type === "Annual" && (t -= n.hours), n.type === "Personal" && (r -= n.hours);
				}
			}
			for (let a of n.leave.filter((t) => t.employeeId === e.id && t.status === "Approved" && !i.has(t.id))) a.type === "Annual" && (t -= a.hours), a.type === "Personal" && (r -= a.hours);
			if (t < -1e-5 || r < -1e-5) throw Error("Payroll leave balances are negative.");
		}
		let m = /* @__PURE__ */ new Set();
		for (let e of n.receipts) {
			if (m.has(e.operationId)) throw Error("Duplicate payroll operation.");
			if (m.add(e.operationId), e.input.operationId !== e.operationId || Eo({
				input: e.input,
				actorId: e.actorId
			}) !== e.fingerprint) throw Error("Invalid payroll operation fingerprint.");
			if (c(e.entity, e.recordId).revision < e.revision) throw Error("Invalid payroll operation revision.");
		}
	}
});
//#endregion
//#region electron/security/bankInstructionRepository.ts
var Zo = E().trim().min(1).max(200), Qo = E().regex(/^[a-f0-9]{64}$/), $o = E().trim().min(3).max(2e3), es = T(["SUPPLIER", "PAYROLL"]), ts = Me(), ns = (e) => Array.isArray(e) ? e.map(ns) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, ns(e[t])])) : e, rs = (e) => Oe("sha256").update(JSON.stringify(ns(e))).digest("hex"), is = (e) => Oe("sha256").update(e, "ascii").digest("hex"), as = lt, os = (e) => [
	"Prepared",
	"Approved",
	"Exported"
].includes(e.status);
function ss(e, t = !1, n = !1) {
	O.require("banking.read"), O.require(e === "PAYROLL" ? n ? "payroll.approve" : t ? "payroll.post" : "payroll.read" : t ? "purchases.payment" : "purchases.read");
}
function cs(e, t, n) {
	let r = (e === "PAYROLL" ? n.payroll.employees : n.suppliers.suppliers).find((e) => e.id === t);
	if (!r) throw Error("Beneficiary source was not found.");
	return {
		entity: r,
		revision: String(e === "PAYROLL" ? r.revision : r.updatedAt)
	};
}
function ls(e, t) {
	let n = t.bankAccounts.bankAccounts.find((t) => t.id === e);
	if (!n?.active || n.currency !== "AUD" || n.accountType === "CREDIT_CARD" || !t.accounts.accounts.some((e) => e.id === n.glAccountId && e.active && e.type === "ASSET")) throw Error("Use an active AUD bank and active bank GL account.");
	return n;
}
function us(e, t, n, r, i) {
	let a = ls(n, i);
	if (r < a.openingBalanceDate) throw Error("Payment predates bank opening.");
	let o = [], s;
	if (e === "SUPPLIER") {
		let e = i.paymentBatches.batches.find((e) => e.id === t);
		if (!e || e.status !== "APPROVED" || e.bankAccountId !== n || e.paymentDate !== r) throw Error("Select an approved unposted supplier batch with this bank and date.");
		let a = /* @__PURE__ */ new Map(), c = e.allocations.map((e) => {
			let t = i.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId), n = i.suppliers.suppliers.find((e) => e.id === t?.supplierId);
			if (!t || t.status === "VOID" || t.totals.amountDue < e.amount || r < t.billDate || n?.status !== "ACTIVE" || n.currency !== "AUD") throw Error("Supplier, bill date or outstanding amount changed.");
			return a.set(t.supplierId, (a.get(t.supplierId) ?? 0) + Math.round(e.amount * 100)), {
				id: t.id,
				supplierId: t.supplierId,
				amountDue: t.totals.amountDue,
				status: t.status,
				billDate: t.billDate,
				allocation: e.amount
			};
		});
		a.forEach((e, t) => o.push({
			entityId: t,
			amount: e / 100,
			reference: ""
		})), s = {
			batch: e,
			bills: c
		};
	} else {
		let e = i.payroll.runs.find((e) => e.id === t);
		if (!e || e.status !== "Posted" || e.settings.currency !== "AUD" || e.settings.region !== "Australia" || r < e.payDate) throw Error("Select a posted Australian pay run and a date on or after pay date.");
		let n = i.payroll.payments.filter((t) => t.runId === e.id && t.accountId === e.settings.netAccountId && t.status === "Posted");
		if (n.length) throw Error("Net wages already have recorded payments. Resolve the existing allocation before creating a full-run bank file.");
		e.slips.forEach((e) => {
			e.totals.net > 0 && o.push({
				entityId: e.employee.id,
				amount: e.totals.net,
				reference: ""
			});
		}), s = {
			run: e,
			netPayments: n
		};
	}
	if (!o.length) throw Error("No positive amounts are payable.");
	return {
		entries: o,
		financialToken: rs({
			proof: s,
			bank: {
				id: a.id,
				glAccountId: a.glAccountId,
				currency: a.currency,
				openingBalanceDate: a.openingBalanceDate
			}
		})
	};
}
function ds(e, n, r, i, a, o = t()) {
	let { entries: s, financialToken: c } = us(e, n, r, i, o), l = ls(r, o), u = [...as().profiles].reverse().find((e) => e.bankAccountId === r);
	if (!u || u.sourceRevision !== l.updatedAt) throw Error("Review and save the current paying-bank file profile first.");
	ot(i, u.values);
	let d = s.map((t) => {
		let n = [...as().beneficiaries].reverse().find((n) => n.kind === e && n.entityId === t.entityId), r = cs(e, t.entityId, o);
		if (!n || n.sourceRevision !== r.revision) throw Error("Review and save current structured bank details for every beneficiary.");
		return n;
	}), f = s.map((t, n) => ({
		...tt.parse({
			bsb: d[n].bsb,
			account: d[n].account,
			title: d[n].title
		}),
		beneficiaryId: t.entityId,
		amount: t.amount,
		reference: a,
		code: e === "PAYROLL" ? "53" : "50"
	})), p = st(u.values, i, f), m = rs({
		financialToken: c,
		payer: u,
		beneficiaries: d
	});
	return {
		payer: u,
		beneficiaries: d,
		credits: f,
		...p,
		financialToken: c,
		sourceToken: m,
		sha256: is(p.text)
	};
}
function fs(e) {
	let t = as().instructions.find((t) => t.id === e);
	if (!t) throw Error("Bank instruction batch was not found.");
	return t;
}
function ps(e, t) {
	if (e.revision !== t) throw Error("Instruction changed. Refresh before continuing.");
}
function ms(e, t, n) {
	return {
		id: ke(),
		action: e,
		reason: t,
		revision: n,
		actorId: O.current().userId,
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function hs(e) {
	return as().instructions = as().instructions.map((t) => t.id === e.id ? e : t), e;
}
function gs(e, t, n) {
	let r = O.current().userId, i = rs({
		input: e,
		actor: r
	}), a = as().receipts.find((t) => t.operationId === e.operationId);
	if (a) {
		if (a.fingerprint !== i || a.actorId !== r) throw Error("Operation ID has different bank-instruction data.");
		return structuredClone(a.result);
	}
	let o = n();
	return as().receipts.push({
		operationId: e.operationId,
		fingerprint: i,
		actorId: r,
		input: {
			...e,
			__kind: t
		},
		result: structuredClone(o)
	}), structuredClone(o);
}
var _s = e({
	kind: es,
	sourceId: Zo,
	bankAccountId: Zo,
	date: Zo,
	reference: Ze(18)
}).strict(), vs = e({
	operationId: Zo,
	id: Zo,
	expectedRevision: f().int().positive(),
	reason: $o
}).strict();
function ys(e) {
	let t = ds(e.kind, e.sourceId, e.bankAccountId, e.date, e.credits[0].reference);
	if (t.sourceToken !== e.sourceToken || t.sha256 !== e.sha256) throw Error("Approved payment sources or bank details changed. Void the old file and prepare a reviewed replacement.");
	return t;
}
var bs = {
	savePayer(n) {
		O.require("banking.write");
		let r = e({
			operationId: Zo,
			expectedRevision: f().int().nonnegative(),
			values: et,
			reason: $o
		}).strict().parse(n);
		return gs(r, "SHARED", () => {
			let e = ls(r.values.bankAccountId, t()), n = [...as().profiles].reverse().find((t) => t.bankAccountId === e.id);
			if ((n?.revision ?? 0) !== r.expectedRevision) throw Error("Paying-bank profile changed.");
			let i = {
				id: ke(),
				bankAccountId: e.id,
				revision: (n?.revision ?? 0) + 1,
				values: r.values,
				sourceRevision: e.updatedAt,
				actorId: O.current().userId,
				at: (/* @__PURE__ */ new Date()).toISOString(),
				reason: r.reason
			};
			return as().profiles.push(i), i;
		});
	},
	saveBeneficiary(n) {
		O.require("banking.write");
		let r = e({
			operationId: Zo,
			kind: es,
			entityId: Zo,
			expectedRevision: f().int().nonnegative(),
			values: tt,
			reason: $o
		}).strict().parse(n);
		return ss(r.kind, !0), r.kind === "PAYROLL" && O.require("payroll.manage"), gs(r, r.kind, () => {
			let e = cs(r.kind, r.entityId, t()), n = [...as().beneficiaries].reverse().find((e) => e.kind === r.kind && e.entityId === r.entityId);
			if ((n?.revision ?? 0) !== r.expectedRevision) throw Error("Beneficiary bank profile changed.");
			let i = {
				id: ke(),
				kind: r.kind,
				entityId: r.entityId,
				revision: (n?.revision ?? 0) + 1,
				...r.values,
				sourceRevision: e.revision,
				actorId: O.current().userId,
				at: (/* @__PURE__ */ new Date()).toISOString(),
				reason: r.reason
			};
			return as().beneficiaries.push(i), i;
		});
	},
	preview(e) {
		let t = _s.parse(e);
		return ss(t.kind), ds(t.kind, t.sourceId, t.bankAccountId, t.date, t.reference);
	},
	prepare(e) {
		O.require("banking.write");
		let t = _s.extend({
			operationId: Zo,
			expectedSourceToken: Qo,
			reason: $o
		}).parse(e);
		return ss(t.kind, !0), gs(t, t.kind, () => {
			if (as().instructions.some((e) => os(e) && (e.sourceId === t.sourceId && e.kind === t.kind || t.kind === "SUPPLIER" && e.kind === "SUPPLIER" && xs(e.sourceId, t.sourceId)))) throw Error("An active instruction already reserves this source or one of its bills. Void or reverse it before replacement.");
			let e = ds(t.kind, t.sourceId, t.bankAccountId, t.date, t.reference);
			if (e.sourceToken !== t.expectedSourceToken) throw Error("Preview sources changed. Preview again.");
			let n = {
				id: ke(),
				operationId: t.operationId,
				kind: t.kind,
				sourceId: t.sourceId,
				bankAccountId: t.bankAccountId,
				date: t.date,
				status: "Prepared",
				revision: 1,
				financialToken: e.financialToken,
				sourceToken: e.sourceToken,
				payer: e.payer,
				beneficiaries: e.beneficiaries,
				credits: e.credits,
				text: e.text,
				sha256: e.sha256,
				createdBy: O.current().userId,
				localPaymentIds: [],
				history: [ms("Prepared", t.reason, 1)]
			};
			return as().instructions.push(n), n;
		});
	},
	approve(e) {
		O.require("accounting.post"), O.require("banking.write");
		let t = vs.parse(e), n = fs(t.id);
		return ss(n.kind, !1, !0), gs(t, n.kind, () => {
			if (ps(n, t.expectedRevision), n.status !== "Prepared") throw Error("Only a prepared instruction can be approved.");
			if (n.createdBy === O.current().userId) throw Error("A different authorized reviewer must approve the bank file.");
			return M(), ys(n), hs({
				...n,
				status: "Approved",
				approvedBy: O.current().userId,
				revision: n.revision + 1,
				history: [...n.history, ms("Approved", t.reason, n.revision + 1)]
			});
		});
	},
	exportFile(e) {
		O.require("banking.write");
		let t = vs.extend({ acknowledgeDuplicateRisk: b(!0) }).parse(e), n = fs(t.id);
		return ss(n.kind, !0), gs(t, n.kind, () => {
			if (ps(n, t.expectedRevision), !["Approved", "Exported"].includes(n.status)) throw Error("Only a current approved, unrecorded file can be exported.");
			return ys(n), hs({
				...n,
				status: "Exported",
				revision: n.revision + 1,
				history: [...n.history, ms("Exported", t.reason, n.revision + 1)]
			}), {
				name: `HTT-${n.kind}-${n.id}.aba`,
				text: n.text,
				sha256: n.sha256,
				totalCents: n.credits.reduce((e, t) => e + Math.round(t.amount * 100), 0)
			};
		});
	},
	void(e) {
		O.require("banking.write");
		let t = vs.extend({ confirmedNotExecuted: b(!0) }).parse(e), n = fs(t.id);
		return ss(n.kind, !0), gs(t, n.kind, () => {
			if (ps(n, t.expectedRevision), ![
				"Prepared",
				"Approved",
				"Exported"
			].includes(n.status)) throw Error("Recorded local payments require their normal reversal.");
			return hs({
				...n,
				status: "Voided",
				revision: n.revision + 1,
				history: [...n.history, ms("Voided", t.reason, n.revision + 1)]
			});
		});
	},
	recordLocal(e) {
		O.require("banking.write");
		let n = vs.extend({
			externalReference: Ze(100),
			confirmedExternalExecution: b(!0)
		}).parse(e), r = fs(n.id);
		return ss(r.kind, !0), gs(n, r.kind, () => {
			if (ps(r, n.expectedRevision), r.status !== "Exported") throw Error("Export and externally verify the approved instruction before local recording.");
			if (M(), Qn(r.date), us(r.kind, r.sourceId, r.bankAccountId, r.date, t()).financialToken !== r.financialToken) throw Error("Outstanding financial sources changed. Review the external result before recording.");
			let e;
			if (r.kind === "SUPPLIER") e = fa.post(r.sourceId).paymentIds;
			else {
				let i = t().payroll.runs.find((e) => e.id === r.sourceId);
				e = [Xo.recordPayment({
					operationId: "bank-instruction:" + r.id,
					reason: n.reason,
					runId: r.sourceId,
					accountId: i.settings.netAccountId,
					bankAccountId: r.bankAccountId,
					date: r.date,
					amount: r.credits.reduce((e, t) => e + Math.round(t.amount * 100), 0) / 100,
					reference: n.externalReference
				}).id];
			}
			return hs({
				...r,
				status: "Recorded locally",
				localPaymentIds: e,
				externalReference: n.externalReference,
				revision: r.revision + 1,
				history: [...r.history, ms("Recorded locally", n.reason, r.revision + 1)]
			});
		});
	},
	reverseLocal(e) {
		O.require("banking.write");
		let n = vs.extend({ date: Zo }).parse(e), r = fs(n.id);
		return ss(r.kind, !0), gs(n, r.kind, () => {
			if (ps(r, n.expectedRevision), r.status !== "Recorded locally") throw Error("Only recorded local instruction payments can be reversed.");
			if (M(), r.kind === "SUPPLIER") {
				if (n.date !== r.date) throw Error("Supplier batch reversal uses the original payment date.");
				fa.reverse({
					id: r.sourceId,
					reason: n.reason
				});
			} else for (let e of r.localPaymentIds) {
				let i = t().payroll.payments.find((t) => t.id === e);
				Xo.reversePayment({
					operationId: "reverse-bank-instruction:" + r.id + ":" + e,
					reason: n.reason,
					id: e,
					expectedRevision: i.revision,
					date: n.date
				});
			}
			return hs({
				...r,
				status: "Reversed locally",
				revision: r.revision + 1,
				history: [...r.history, ms("Reversed locally", n.reason, r.revision + 1)]
			});
		});
	}
};
function xs(e, n) {
	let r = t().paymentBatches.batches, i = r.find((t) => t.id === e), a = r.find((e) => e.id === n);
	return i && a && i.allocations.some((e) => a.allocations.some((t) => t.supplierBillId === e.supplierBillId));
}
function Ss(e, n, r) {
	let i = t(), a = r[0];
	for (let t of as().instructions.filter((e) => os(e) || e.status === "Recorded locally")) if (t.kind === "SUPPLIER") {
		let r = i.paymentBatches.batches.find((e) => e.id === t.sourceId);
		if (e === "paymentBatches" && [
			"post",
			"cancel",
			"reverse"
		].includes(n) && (typeof a == "string" ? a : a?.id) === t.sourceId) throw Error("Manage this reserved batch through its bank instruction.");
		if (os(t) && e === "supplierPayments" && n === "create" && a?.allocations?.some((e) => r.allocations.some((t) => t.supplierBillId === e.supplierBillId))) throw Error("Bills are reserved by an active bank instruction.");
	} else {
		let r = i.payroll.runs.find((e) => e.id === t.sourceId);
		if (e === "payroll" && (n === "recordPayment" && a?.runId === t.sourceId && a.accountId === r.settings.netAccountId || n === "reversePayment" && t.localPaymentIds.includes(a?.id) || n === "changeRun" && a?.id === t.sourceId && a.action === "Reverse")) throw Error("Manage this reserved payroll payment through its bank instruction.");
	}
}
var Cs = e({
	id: de(),
	action: Zo,
	actorId: Zo,
	at: ts,
	reason: $o,
	revision: f().int().positive()
}).strict(), ws = e({
	id: de(),
	bankAccountId: Zo,
	revision: f().int().positive(),
	values: et,
	sourceRevision: Zo,
	actorId: Zo,
	at: ts,
	reason: $o
}).strict(), Ts = e({
	id: de(),
	kind: es,
	entityId: Zo,
	revision: f().int().positive(),
	bsb: tt.shape.bsb,
	account: tt.shape.account,
	title: tt.shape.title,
	sourceRevision: Zo,
	actorId: Zo,
	at: ts,
	reason: $o
}).strict(), Es = e({
	id: de(),
	operationId: Zo,
	kind: es,
	sourceId: Zo,
	bankAccountId: Zo,
	date: Zo,
	status: T([
		"Prepared",
		"Approved",
		"Exported",
		"Recorded locally",
		"Voided",
		"Reversed locally"
	]),
	revision: f().int().positive(),
	financialToken: Qo,
	sourceToken: Qo,
	payer: ws,
	beneficiaries: s(Ts).min(1).max(500),
	credits: s(nt).min(1).max(500),
	text: E().max(1e5),
	sha256: Qo,
	createdBy: Zo,
	approvedBy: Zo.optional(),
	localPaymentIds: s(Zo),
	externalReference: E().max(100).optional(),
	history: s(Cs).min(1)
}).strict();
i("bankInstructions", {
	repository: bs,
	read: "banking.read",
	commands: {
		savePayer: "banking.write",
		saveBeneficiary: "banking.write",
		preview: "banking.read",
		prepare: "banking.write",
		approve: "accounting.post",
		exportFile: "banking.write",
		void: "banking.write",
		recordLocal: "banking.write",
		reverseLocal: "banking.write"
	},
	snapshot: as,
	restore: ut,
	publish: () => {},
	view: (e) => ({
		profiles: as().profiles,
		beneficiaries: as().beneficiaries.filter((t) => t.kind !== "PAYROLL" || g(e, "payroll.read")),
		instructions: as().instructions.filter((t) => t.kind !== "PAYROLL" || g(e, "payroll.read")),
		receipts: as().receipts.filter((t) => t.input.__kind !== "PAYROLL" || g(e, "payroll.read"))
	}),
	validate: (t, n) => {
		let r = e({
			profiles: s(ws),
			beneficiaries: s(Ts),
			instructions: s(Es),
			receipts: s(e({
				operationId: Zo,
				fingerprint: Qo,
				actorId: Zo,
				input: se(E(), ye()),
				result: ye()
			}).strict())
		}).strict().parse(t), i = n;
		for (let e of r.profiles) if (!i.bankAccounts.bankAccounts.some((t) => t.id === e.bankAccountId) || e.values.bankAccountId !== e.bankAccountId) throw Error("Invalid payer bank reference.");
		for (let e of r.beneficiaries) cs(e.kind, e.entityId, i);
		for (let e of [r.profiles, r.beneficiaries]) {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) {
				let e = "values" in n ? n.bankAccountId : n.kind + ":" + n.entityId;
				if (n.revision !== (t.get(e) ?? 0) + 1) throw Error("Invalid bank-profile version sequence.");
				t.set(e, n.revision);
			}
		}
		if (new Set(r.receipts.map((e) => e.operationId)).size !== r.receipts.length || new Set(r.instructions.map((e) => e.operationId)).size !== r.instructions.length) throw Error("Duplicate instruction operation ID.");
		for (let e of r.receipts) {
			let t = { ...e.input };
			if (delete t.__kind, ![
				"SHARED",
				"SUPPLIER",
				"PAYROLL"
			].includes(e.input.__kind) || rs({
				input: t,
				actor: e.actorId
			}) !== e.fingerprint) throw Error("Invalid bank instruction request receipt.");
		}
		for (let e of r.instructions) {
			let t = st(e.payer.values, e.date, e.credits);
			if (e.sourceToken !== rs({
				financialToken: e.financialToken,
				payer: e.payer,
				beneficiaries: e.beneficiaries
			}) || new Set(e.history.map((e) => e.id)).size !== e.history.length || t.text !== e.text || is(e.text) !== e.sha256 || e.bankAccountId !== e.payer.bankAccountId || !r.profiles.some((t) => t.id === e.payer.id && rs(t) === rs(e.payer)) || e.beneficiaries.length !== e.credits.length || new Set(e.beneficiaries.map((e) => e.entityId)).size !== e.beneficiaries.length) throw Error("Bank instruction bytes or approved profiles are invalid.");
			if (e.credits.forEach((t, n) => {
				let i = e.beneficiaries[n];
				if (i.kind !== e.kind || i.entityId !== t.beneficiaryId || i.account !== t.account || i.bsb !== t.bsb || i.title !== t.title || t.code !== (e.kind === "PAYROLL" ? "53" : "50") || !r.beneficiaries.some((e) => e.id === i.id && rs(e) === rs(i))) throw Error("Bank instruction beneficiary binding is invalid.");
			}), e.kind === "PAYROLL") {
				let t = i.payroll.runs.find((t) => t.id === e.sourceId);
				if (!t || e.credits.some((e) => !t.slips.some((t) => t.employee.id === e.beneficiaryId && t.totals.net === e.amount)) || e.credits.length !== t.slips.filter((e) => e.totals.net > 0).length) throw Error("Payroll instruction amounts differ from the posted run.");
			} else {
				let t = i.paymentBatches.batches.find((t) => t.id === e.sourceId), n = /* @__PURE__ */ new Map();
				if (!t || t.bankAccountId !== e.bankAccountId || t.paymentDate !== e.date) throw Error("Supplier instruction source is missing.");
				for (let e of t.allocations) {
					let t = i.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId);
					if (!t) throw Error("Supplier instruction bill is missing.");
					n.set(t.supplierId, (n.get(t.supplierId) ?? 0) + Math.round(e.amount * 100));
				}
				if (n.size !== e.credits.length || e.credits.some((e) => n.get(e.beneficiaryId) !== Math.round(e.amount * 100))) throw Error("Supplier instruction amounts differ from its batch.");
			}
			let n;
			for (let t = 0; t < e.history.length; t++) {
				let r = e.history[t];
				if (r.revision !== t + 1) throw Error("Invalid instruction audit revision.");
				if (!n && r.action === "Prepared") n = "Prepared";
				else if (n === "Prepared" && r.action === "Approved") n = "Approved";
				else if (["Approved", "Exported"].includes(n ?? "") && r.action === "Exported") n = "Exported";
				else if ([
					"Prepared",
					"Approved",
					"Exported"
				].includes(n ?? "") && r.action === "Voided") n = "Voided";
				else if (n === "Exported" && r.action === "Recorded locally") n = "Recorded locally";
				else if (n === "Recorded locally" && r.action === "Reversed locally") n = "Reversed locally";
				else throw Error("Invalid bank instruction lifecycle.");
			}
			let a = e.history.find((e) => e.action === "Approved");
			if (n !== e.status || e.revision !== e.history.length || e.createdBy !== e.history[0].actorId || e.approvedBy !== a?.actorId || e.approvedBy === e.createdBy) throw Error("Invalid independent bank-file approval evidence.");
			let o = e.history.some((e) => e.action === "Recorded locally");
			if (o !== !!e.localPaymentIds.length || o !== !!e.externalReference || new Set(e.localPaymentIds).size !== e.localPaymentIds.length) throw Error("Local execution record is inconsistent.");
			if (o) {
				let n = e.status === "Reversed locally";
				if (e.kind === "PAYROLL") {
					let r = i.payroll.runs.find((t) => t.id === e.sourceId), a = e.localPaymentIds.map((e) => i.payroll.payments.find((t) => t.id === e));
					if (a.length !== 1 || a.some((i) => !i || i.runId !== e.sourceId || i.accountId !== r.settings.netAccountId || i.bankAccountId !== e.bankAccountId || Math.round(i.amount * 100) !== t.totalCents || i.date !== e.date || i.status !== (n ? "Reversed" : "Posted") || i.reference !== e.externalReference)) throw Error("Payroll instruction local payment binding is invalid.");
				} else {
					let t = i.paymentBatches.batches.find((t) => t.id === e.sourceId);
					if (t.status !== (n ? "REVERSED" : "POSTED") || JSON.stringify(t.paymentIds) !== JSON.stringify(e.localPaymentIds)) throw Error("Supplier instruction local payment binding is invalid.");
				}
			}
		}
		for (let e of r.receipts) {
			let t = e.input, n = e.result;
			if (t.values) {
				let i = !!t.values.bankAccountId, a = (i ? r.profiles : r.beneficiaries).find((e) => e.id === n?.id);
				if (!a || rs(a) !== rs(n) || a.actorId !== e.actorId || a.revision !== t.expectedRevision + 1 || a.reason !== t.reason || t.__kind !== (i ? "SHARED" : t.kind) || rs(i ? a.values : {
					bsb: a.bsb,
					account: a.account,
					title: a.title
				}) !== rs(t.values) || !i && (a.kind !== t.kind || a.entityId !== t.entityId)) throw Error("Invalid bank profile receipt binding.");
			} else {
				let i = !!t.expectedSourceToken, a = r.instructions.find((n) => i ? n.operationId === e.operationId : n.id === t.id);
				if (!a || t.__kind !== a.kind) throw Error("Invalid instruction receipt source.");
				let o = i ? 1 : t.expectedRevision + 1, s = a.history.slice(0, o), c = s.at(-1), l = i ? "Prepared" : t.acknowledgeDuplicateRisk ? "Exported" : t.confirmedNotExecuted ? "Voided" : t.confirmedExternalExecution ? "Recorded locally" : t.date ? "Reversed locally" : "Approved";
				if (s.length !== o || c?.action !== l || c.actorId !== e.actorId || c.reason !== t.reason) throw Error("Invalid instruction receipt history.");
				if (l === "Exported") {
					if (rs(n) !== rs({
						name: `HTT-${a.kind}-${a.id}.aba`,
						text: a.text,
						sha256: a.sha256,
						totalCents: a.credits.reduce((e, t) => e + Math.round(t.amount * 100), 0)
					})) throw Error("Invalid exported-file receipt.");
				} else {
					let e = s.some((e) => e.action === "Recorded locally"), r = {
						...a,
						status: c.action,
						revision: o,
						history: s,
						approvedBy: s.find((e) => e.action === "Approved")?.actorId,
						localPaymentIds: e ? a.localPaymentIds : [],
						externalReference: e ? a.externalReference : void 0
					};
					if (rs(n) !== rs(r) || i && (t.sourceId !== a.sourceId || t.kind !== a.kind || t.bankAccountId !== a.bankAccountId || t.date !== a.date || t.reference !== a.credits[0].reference || t.expectedSourceToken !== a.sourceToken)) throw Error("Invalid instruction result receipt.");
				}
			}
		}
		let a = r.instructions.filter((e) => !["Voided", "Reversed locally"].includes(e.status)), o = a.filter((e) => os(e));
		if (new Set(a.map((e) => e.kind + ":" + e.sourceId)).size !== a.length) throw Error("Duplicate reserved bank instruction source.");
		for (let e = 0; e < o.length; e++) for (let t = e + 1; t < o.length; t++) {
			let n = o[e], r = o[t];
			if (n.kind === "SUPPLIER" && r.kind === "SUPPLIER") {
				let e = i.paymentBatches.batches.find((e) => e.id === n.sourceId), t = i.paymentBatches.batches.find((e) => e.id === r.sourceId);
				if (e.allocations.some((e) => t.allocations.some((t) => e.supplierBillId === t.supplierBillId))) throw Error("Overlapping supplier instruction reservations.");
			}
		}
	}
});
var Ds = e({
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
function Os(e) {
	let t = s(Ds).min(1).max(20).parse(e.conditions ? JSON.parse(e.conditions) : [{
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
function ks(e, t) {
	let n = Os(e);
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
var As = (e) => Math.round((e + 2 ** -52) * 100) / 100, js = (e) => e.lines.length >= 2 && new Set(e.lines.map((e) => e.id)).size === e.lines.length && e.totalDebit > 0 && e.totalDebit === e.totalCredit && e.lines.every((e) => Number.isFinite(e.debit) && Number.isFinite(e.credit) && e.debit >= 0 && e.credit >= 0 && As(e.debit) === e.debit && As(e.credit) === e.credit && !(e.debit && e.credit)) && As(e.lines.reduce((e, t) => e + t.debit, 0)) === e.totalDebit && As(e.lines.reduce((e, t) => e + t.credit, 0)) === e.totalCredit, Ms = (e, t = !1) => JSON.stringify(e.lines.map((e) => [
	e.accountId,
	e.description ?? null,
	t ? e.credit : e.debit,
	t ? e.debit : e.credit
]).sort((e, t) => JSON.stringify(e).localeCompare(JSON.stringify(t))));
function Ns(e) {
	let t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), r = [], i = e.filter((e) => e.sourceType === "BANK_STATEMENT" && !e.reversedJournalEntryId && (e.status === "REVERSED" || e.reversalJournalEntryId || e.reversedAt)), a = (e, t, i) => {
		n.add(e.id), t.forEach((e) => n.add(e)), r.push({
			journalId: e.id,
			message: i
		});
	};
	for (let n of i) {
		let r = e.filter((e) => e.id === n.reversalJournalEntryId), i = r[0];
		if (e.filter((e) => e.id === n.id).length !== 1 || r.length !== 1 || n.status !== "REVERSED" || !n.sourceId || !/^.+:\d+$/.test(n.sourceId) || !n.reversalReason?.trim() || !Number.isFinite(Date.parse(n.reversedAt ?? "")) || n.reversedAt !== i.postedAt || i.status !== "POSTED" || i.sourceType !== "BANK_STATEMENT" || i.sourceId !== void 0 || i.reversedJournalEntryId !== n.id || e.filter((e) => e.reversalJournalEntryId === i.id).length !== 1 || i.reversalJournalEntryId || i.reversedAt || n.reference !== i.reference || e.filter((e) => e.reversedJournalEntryId === n.id).length !== 1 || !js(n) || !js(i) || n.totalDebit !== i.totalCredit || n.totalCredit !== i.totalDebit || Ms(n, !0) !== Ms(i)) {
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
function Ps(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Fs(e, t) {
	w(e, t);
}
function Is(e, t, n) {
	Fs(e.openingBalanceDate, "Opening balance date"), Fs(n, "As-at date");
	let r = pe(t), i = ae(t), a = Ns(t), o = new Set([
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
	}), c = Ps(e.openingBalance), l = 0, u = 0, d = s.map(({ entry: t, line: n }) => {
		let r = Ps(n.debit), s = Ps(n.credit);
		return l = Ps(l + r), u = Ps(u + s), c = Ps(c + r - s), {
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
		openingBalance: Ps(e.openingBalance),
		moneyIn: l,
		moneyOut: u,
		closingBalance: c,
		transactionCount: d.length,
		transactions: d
	};
}
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function Ls(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Rs(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) if (!t.correctionOnly) {
		if (r.has(t.id)) {
			i = Ls(i + t.moneyIn), a = Ls(a + t.moneyOut);
			continue;
		}
		o = Ls(o + t.moneyIn), s = Ls(s + t.moneyOut);
	}
	let c = Ls(Ls(t) + o - s), l = Ls(e.closingBalance), u = Ls(c - l);
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
var zs = (e) => new Set(e).size === e.length, Bs = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Vs(e, t, n, r) {
	return e.some((e) => e.bankAccountId === t && e.status === "COMPLETED" && e.statementDate < r && e.clearedTransactionIds.includes(n));
}
function Hs(e) {
	let { bank: t, journals: n, reconciliations: r, throughDate: i } = e, a = [];
	if (w(i, "Reconciliation proof date"), w(t.openingBalanceDate, "Bank opening date"), !zs(r.map((e) => e.id)) || !zs(n.map((e) => e.id)) || !zs(n.flatMap((e) => e.lines.map((t) => e.id + ":" + t.id)))) return ["Duplicate reconciliation or ledger row identity."];
	for (let e of r.filter((e) => e.bankAccountId === t.id)) try {
		w(e.statementDate);
	} catch {
		return ["Reconciliation statement date is invalid."];
	}
	let o = ae(n);
	n.some((e) => o.has(e.id) && e.journalDate >= t.openingBalanceDate && e.journalDate <= i && e.lines.some((e) => e.accountId === t.glAccountId)) && a.push("Bank journal reversal has incomplete or inconsistent owner, lifecycle or amount evidence.");
	let s = Ns(n);
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
		if (e.status !== "COMPLETED" || e.statementDate <= d || e.statementDate < t.openingBalanceDate || !Number.isFinite(e.statementBalance) || Bs(e.statementBalance) !== e.statementBalance || !zs(e.clearedTransactionIds)) return ["Reconciliation sequence, status, balance or cleared identities are invalid."];
		let r = Is(t, n, e.statementDate), i = new Map(r.transactions.map((e) => [e.id, e])), o = /* @__PURE__ */ new Set(), c = new Set(e.clearedTransactionIds);
		for (let e of n.filter((e) => s.verifiedIds.has(e.id) && e.reversalJournalEntryId)) {
			let t = r.transactions.filter((t) => t.journalEntryId === e.id || t.journalEntryId === e.reversalJournalEntryId);
			t.length && t.every((e) => c.has(e.id)) && t.forEach((e) => o.add(e.id));
		}
		if (e.clearedTransactionIds.some((t) => {
			let r = i.get(t);
			return l.has(t) || !r || r.correctionIssue || !o.has(t) && (r.correctionOnly || !ce(u.get(r.journalEntryId), n, e.statementDate));
		})) return ["Cleared rows are missing, reversed, internal offsets or duplicated across statements."];
		e.clearedTransactionIds.forEach((e) => l.add(e));
		let f = Rs(r, e.statementBalance, [...l]), p = (t) => t.reconciled && [
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
		!p(f) && !p(Rs(m, e.statementBalance, [...l])) && a.push("Saved reconciliation totals do not match the current dated bank ledger: " + e.reconciliationNumber), d = e.statementDate;
	}
	if (!c.length) return a;
	let f = c.at(-1).statementDate, p = Is(t, n, f), m = new Map(p.transactions.map((e) => [e.id, e])), h = /* @__PURE__ */ new Set();
	for (let i of (e.statements ?? []).filter((e) => e.bankAccountId === t.id && e.date <= f)) i.status === "UNMATCHED" && a.push("Imported statement contains an unresolved line."), (i.status === "MATCHED" || i.status === "POSTED") && (i.ledgerIds.some((e) => Vs(r, t.id, e, i.date)) && a.push("Imported statement match reuses a ledger row already cleared in an earlier statement."), (!i.ledgerIds.length || !zs(i.ledgerIds) || i.ledgerIds.some((e) => {
		let t = m.get(e);
		return !l.has(e) || !t || t.correctionOnly || t.correctionIssue || !ce(u.get(t.journalEntryId), n, i.date) || h.has(e);
	}) || Bs(i.ledgerIds.reduce((e, t) => e + (m.get(t)?.moneyIn ?? 0) - (m.get(t)?.moneyOut ?? 0), 0)) !== i.amount) && a.push("Imported statement match, amount or clearing is inconsistent."), i.ledgerIds.forEach((e) => h.add(e)));
	return a;
}
//#endregion
//#region src/features/banking/data/bankReconciliationRepository.ts
var Us = /* @__PURE__ */ new Set(), Ws = k.read().reconciliations;
k.onRollback(() => {
	Ws = k.read().reconciliations;
});
function Gs() {
	k.update("reconciliations", Ws), Us.forEach((e) => k.notify(e));
}
function Ks(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function qs(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function Js() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Ys(e) {
	return `BREC-${e.slice(0, 4)}-${String(Ws.length + 1).padStart(4, "0")}`;
}
function Xs(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of Ws) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var Zs = {
	subscribe(e) {
		return Us.add(e), () => {
			Us.delete(e);
		};
	},
	getSnapshot() {
		return Ws;
	},
	getAll() {
		return Ws;
	},
	getByBankAccount(e) {
		return Ws.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return Xs(e);
	},
	complete(e, n) {
		if (qs(e.statementDate), w(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let r = I.requireById(e.bankAccountId);
		if (!r.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < r.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let i = F.getAll(), a = new Map(i.map((e) => [e.id, e])), o = Hs({
			bank: r,
			journals: i,
			reconciliations: Ws,
			throughDate: e.statementDate
		});
		if (o.length) throw Error("Existing bank reconciliation evidence is invalid: " + o.join(" "));
		let s = this.getLatestByBankAccount(r.id);
		if (s && e.statementDate <= s.statementDate) throw Error(`Statement date must be after the last reconciled date ${s.statementDate}.`);
		let c = Is(r, F.getAll(), e.statementDate), l = new Set(c.transactions.filter((t) => !t.correctionOnly && !t.correctionIssue && ce(a.get(t.journalEntryId), i, e.statementDate)).map((e) => e.id)), u = Xs(r.id), d = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !u.has(e));
		for (let e of d) if (!l.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let f = /* @__PURE__ */ new Set([...u, ...d]), p = t().bankStatements?.lines.filter((t) => t.bankAccountId === r.id && t.date <= e.statementDate) ?? [];
		if (p.some((e) => e.status === "UNMATCHED")) throw Error("Process every imported statement line before completing reconciliation.");
		let m = new Map(c.transactions.map((e) => [e.id, e]));
		for (let e of p.filter((e) => e.status === "MATCHED" || e.status === "POSTED")) {
			if (e.ledgerIds.some((t) => Vs(Ws, r.id, t, e.date))) throw Error("Statement match reuses a ledger row already cleared in an earlier statement. Unmatch this unreconciled line and select its genuine source.");
			if (e.ledgerIds.some((t) => !m.has(t) || m.get(t)?.correctionOnly || m.get(t)?.correctionIssue || !ce(a.get(m.get(t).journalEntryId), i, e.date))) throw Error("Repair stale imported statement matches before completing reconciliation.");
			if (e.ledgerIds.some((e) => !f.has(e))) throw Error("Include every processed imported statement entry in reconciliation.");
		}
		let h = Rs(c, Ks(e.statementBalance), Array.from(f));
		if (!h.reconciled) throw Error(`Bank reconciliation is out by ${h.difference.toFixed(2)}.`);
		let g = Js();
		if (n) {
			if (A.begin(n, "BANK_RECONCILIATION", JSON.stringify(e)).status !== "started") throw Error("Bank reconciliation requires manual review before retry.");
			A.bindResult(n, g);
		}
		let _ = {
			id: g,
			reconciliationNumber: Ys(e.statementDate),
			bankAccountId: r.id,
			statementDate: e.statementDate,
			statementBalance: Ks(e.statementBalance),
			bookBalance: h.bookBalance,
			outstandingDeposits: h.outstandingDeposits,
			outstandingPayments: h.outstandingPayments,
			adjustedStatementBalance: h.adjustedStatementBalance,
			difference: h.difference,
			clearedTransactionIds: d,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ws = [_, ...Ws], Gs(), _;
	}
}, Qs = Zs.complete;
Zs.complete = function(e, t) {
	let n = t?.trim() ?? `bankrec-operation-${Js()}`;
	if (t !== void 0 && !n) throw Error("Operation ID cannot be empty.");
	if (n) {
		let t = A.list().find((e) => e.operationId === n);
		if (t) {
			if (t.kind !== "BANK_RECONCILIATION" || t.fingerprint !== JSON.stringify(e)) throw Error("Operation ID reused with different business data.");
			let n = Ws.find((e) => e.id === t.resultId);
			if (t.state === "COMPLETED" && n && Ws.filter((e) => e.id === n.id).length === 1 && n.status === "COMPLETED" && n.bankAccountId === e.bankAccountId && n.statementDate === e.statementDate && n.statementBalance === Ks(e.statementBalance)) return n;
			throw Error("Bank reconciliation requires manual review before retry.");
		}
	}
	M();
	try {
		let t = k.transaction(() => Qs.call(Zs, e, n));
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
}, i("bankReconciliations", {
	repository: Zs,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: Ws }),
	restore: (e) => {
		Ws = e.reconciliations;
	},
	publish: () => Us.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/pricingInstant.ts
function $s(e, t) {
	let n = new Intl.DateTimeFormat("en-CA", {
		timeZone: t,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(new Date(e)), r = (e) => n.find((t) => t.type === e).value;
	return `${r("year")}-${r("month")}-${r("day")}`;
}
function ec(e) {
	let t = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/.exec(e);
	if (!t || Number(t[2]) > 23 || Number(t[3]) > 59 || Number(t[4]) > 59 || !Number.isFinite(Date.parse(e))) throw Error("Pricing time must be an ISO timestamp with seconds and an explicit UTC offset.");
	if (w(t[1], "Pricing date"), t[6] !== "Z" && (Number(t[6].slice(1, 3)) > 14 || Number(t[6].slice(4)) > 59 || Number(t[6].slice(1, 3)) === 14 && Number(t[6].slice(4)) !== 0)) throw Error("Invalid pricing UTC offset.");
	return new Date(e).toISOString();
}
function tc(e, t, n = C().timezone, r = (/* @__PURE__ */ new Date()).toISOString()) {
	if (w(e, "Document date"), $s(r, n), t === void 0) {
		if ($s(r, n) === e) t = r;
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
	let i = ec(t);
	if ($s(i, n) !== e) throw Error("Pricing time must fall on the document date in the pricing timezone.");
	return {
		pricingAt: i,
		pricingTimezone: n
	};
}
function nc(e, t) {
	if (e.pricingAt === void 0 && e.pricingTimezone === void 0) return;
	if (!e.pricingAt || !e.pricingTimezone) throw Error("Incomplete pricing time snapshot.");
	let n = $s(ec(e.pricingAt), e.pricingTimezone);
	if (t && n !== t) throw Error("Pricing snapshot date does not match the document.");
}
//#endregion
//#region src/features/sales/data/areaPacks.ts
function rc(e, t) {
	let n = Xt(e), r = n?.units.find((e) => e.id === t), i = n?.units.find((e) => e.id === n.baseUnitId);
	return n?.status === "ACTIVE" && n.itemType !== "SERVICE" && r?.active && i?.code === "M2" && ["BOX", "ROLL"].includes(r.code) && Number.isFinite(r.conversionToBase) && r.conversionToBase > 0 ? r.conversionToBase : void 0;
}
function ic(e, t, n, r) {
	if (r === void 0) return { quantity: n };
	let i = rc(e, t);
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
function ac(e) {
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
var oc = [
	"Flooring Retailer",
	"Builder",
	"Developer",
	"Designer",
	"Architect",
	"Installer",
	"Other"
], sc = [
	"ACTIVE",
	"ON_HOLD",
	"INACTIVE"
], cc = E().trim().refine((e) => e === "" || E().email().safeParse(e).success, { message: "Enter a valid email address" }), lc = E().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), uc = e({
	businessName: E().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: E().trim().max(120, "Trading name is too long"),
	abn: lc,
	businessType: T(oc),
	status: T(sc),
	email: cc,
	phone: E().trim().max(40, "Phone number is too long"),
	website: E().trim().max(200, "Website is too long"),
	creditLimit: f({ message: "Credit limit is required" }).min(0, "Credit limit cannot be negative"),
	paymentTermsDays: f({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days")
}), dc = e({
	name: E().trim().min(1, "Location name is required").max(100, "Location name is too long"),
	addressLine1: E().trim().min(1, "Address is required").max(160, "Address is too long"),
	addressLine2: E().trim().max(160, "Address is too long"),
	suburb: E().trim().min(1, "Suburb is required").max(100, "Suburb is too long"),
	state: E().trim().min(1, "State is required").max(50, "State is too long"),
	postcode: E().trim().min(1, "Postcode is required").max(20, "Postcode is too long"),
	country: E().trim().min(1, "Country is required").max(100, "Country is too long"),
	phone: E().trim().max(40, "Phone number is too long"),
	isPrimary: y()
}), fc = e({
	isAccounting: y().optional(),
	firstName: E().trim().min(1, "First name is required").max(80, "First name is too long"),
	lastName: E().trim().min(1, "Last name is required").max(80, "Last name is too long"),
	jobTitle: E().trim().max(100, "Job title is too long"),
	email: E().trim().min(1, "Email is required").email("Enter a valid email address"),
	phone: E().trim().max(40, "Phone number is too long"),
	mobile: E().trim().max(40, "Mobile number is too long"),
	locationId: E(),
	isPrimary: y()
}), pc = [
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
], mc = "htt.mock.contacts.customers.v1";
function hc(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var gc = mt(mc, hc), _c = gc.status !== "invalid" && gt(mc), vc = /* @__PURE__ */ new Set(), yc = gc.status === "ok" ? gc.data : structuredClone(pc);
function bc() {
	_c && ht(mc, yc), vc.forEach((e) => {
		e();
	});
}
function xc(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Sc() {
	let e = yc.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function Cc(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function wc(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function Tc(e, t) {
	let n = !1;
	if (yc = yc.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	bc();
}
var W = {
	subscribe(e) {
		return vc.add(e), () => {
			vc.delete(e);
		};
	},
	getSnapshot() {
		return yc;
	},
	getAll() {
		return yc;
	},
	getById(e) {
		return yc.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: xc("cus"),
			code: Sc(),
			businessName: e.businessName.trim(),
			tradingName: Cc(e.tradingName),
			abn: wc(e.abn),
			businessType: e.businessType,
			status: e.status,
			email: Cc(e.email),
			phone: Cc(e.phone),
			website: Cc(e.website),
			creditLimit: e.creditLimit,
			currentBalance: 0,
			overdueBalance: 0,
			paymentTermsDays: e.paymentTermsDays,
			locations: [],
			contacts: [],
			createdAt: t,
			updatedAt: t
		};
		return yc = [n, ...yc], bc(), n;
	},
	update(e, t) {
		let n;
		if (Tc(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: Cc(t.tradingName),
			abn: wc(t.abn),
			businessType: t.businessType,
			status: t.status,
			email: Cc(t.email),
			phone: Cc(t.phone),
			website: Cc(t.website),
			creditLimit: t.creditLimit,
			paymentTermsDays: t.paymentTermsDays,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, n)), !n) throw Error(`Customer ${e} was not found`);
		return n;
	},
	addLocation(e, t) {
		let n = W.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: xc("loc"),
			name: t.name.trim(),
			addressLine1: t.addressLine1.trim(),
			addressLine2: Cc(t.addressLine2),
			suburb: t.suburb.trim(),
			state: t.state.trim(),
			postcode: t.postcode.trim(),
			country: t.country.trim(),
			phone: Cc(t.phone),
			isPrimary: r
		};
		return Tc(e, (e) => ({
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
		let r = W.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		let i = r.locations.find((e) => e.id === t);
		if (!i) throw Error(`Location ${t} was not found`);
		let a = n.isPrimary || r.locations.length === 1, o = {
			...i,
			name: n.name.trim(),
			addressLine1: n.addressLine1.trim(),
			addressLine2: Cc(n.addressLine2),
			suburb: n.suburb.trim(),
			state: n.state.trim(),
			postcode: n.postcode.trim(),
			country: n.country.trim(),
			phone: Cc(n.phone),
			isPrimary: a
		};
		return Tc(e, (e) => ({
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
		t = fc.parse(t);
		let n = W.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: xc("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: Cc(t.jobTitle),
			email: t.email.trim(),
			phone: Cc(t.phone),
			mobile: Cc(t.mobile),
			locationId: Cc(t.locationId),
			isPrimary: r,
			isAccounting: t.isAccounting ?? !1
		};
		return Tc(e, (e) => ({
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
		n = fc.parse(n);
		let r = W.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		if (n.locationId && !r.locations.some((e) => e.id === n.locationId)) throw Error("The selected location does not belong to this customer");
		let i = r.contacts.find((e) => e.id === t);
		if (!i) throw Error(`Contact ${t} was not found`);
		let a = n.isPrimary || r.contacts.length === 1, o = {
			...i,
			firstName: n.firstName.trim(),
			lastName: n.lastName.trim(),
			jobTitle: Cc(n.jobTitle),
			email: n.email.trim(),
			phone: Cc(n.phone),
			mobile: Cc(n.mobile),
			locationId: Cc(n.locationId),
			isPrimary: a,
			isAccounting: n.isAccounting ?? !1
		};
		return Tc(e, (e) => ({
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
	repository: W,
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
	snapshot: () => ({ customers: yc }),
	restore: (e) => {
		yc = e.customers;
	},
	publish: () => vc.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesRecipients.ts
function Ec(e, t) {
	let n = W.getById(e);
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
function Dc(e) {
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
var Oc = "htt.mock.sales.quotes.v1", kc = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function Ac(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !kc.has(String(t.status)) || ![
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
function jc() {
	return mt(Oc, Ac);
}
function Mc(e) {
	if (jc().status === "invalid" || !gt("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!ht("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var Nc = "htt.mock.sales.quote-orders.v1";
function Pc(e) {
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
function Fc(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!Ac(t.quotes) || !Pc(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function Ic() {
	return mt(Nc, Fc);
}
function Lc(e) {
	if (!Fc(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = Ic(), n = jc();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !gt("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!ht("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var Rc = "htt.mock.sales.documents.v1";
function zc(e) {
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
function Bc(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!Fc(t) || !zc(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function Vc() {
	return mt(Rc, Bc);
}
function Hc(e) {
	if (!Bc(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = Vc();
	if (t.status === "invalid" || t.status === "unavailable" || !gt("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!ht("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var Uc = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Wc(e) {
	let t = e.filter((e) => Uc.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function Gc() {
	Wc(A.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var Kc = [{
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
}], qc = [{
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
}], Jc = [{
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
}], Yc = "htt.mock.sales.credit-notes.v1", Xc = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, Zc = (e) => typeof e == "string" && e.length > 0;
function Qc(e) {
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
		].every((e) => Zc(t[e])) || ![
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
		].every((e) => Xc(i[e])) || !Xc(t.amountApplied) || !Xc(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => Zc(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !Xc(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		if (Math.abs(t - e.amountApplied) > .011) return !1;
		let n = e.refundEvents ?? [];
		if (!Array.isArray(n) || n.some((e) => !e || !Zc(e.id) || !Zc(e.date) || !Xc(e.amount) || e.amount <= 0 || e.reversalDate !== void 0 && !Zc(e.reversalDate)) || new Set(n.map((e) => e.id)).size !== n.length) return !1;
		let r = n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0);
		return !Xc(e.amountRefunded ?? 0) || Math.abs(r - (e.amountRefunded ?? 0)) > .011 || t + r > e.totals.total + .011 ? !1 : e.status === "VOID" ? t === 0 && r === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t - r)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function $c() {
	return mt(Yc, Qc);
}
function el(e) {
	if (!Qc(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = $c();
	if (t.status === "invalid" || t.status === "unavailable" || !gt("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!ht("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var tl = /* @__PURE__ */ new Set(), nl = $c(), rl = nl.status === "ok" ? structuredClone(nl.data.creditNotes) : [], il = nl.status === "ok" ? structuredClone(nl.data.allocations) : [], al = [...rl], ol = [...il];
function sl() {
	al = [...rl], ol = [...il], tl.forEach((e) => e());
}
function cl(e, t) {
	el({
		creditNotes: e,
		allocations: t
	}), rl = e, il = t, sl();
}
var G = {
	subscribe(e) {
		return tl.add(e), () => {
			tl.delete(e);
		};
	},
	getSnapshot() {
		return al;
	},
	getAllocationSnapshot() {
		return ol;
	},
	getAll() {
		return al;
	},
	getAllAllocations() {
		return ol;
	},
	getById(e) {
		return rl.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return rl.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return rl.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return il.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return il.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if (rl.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return cl([e, ...rl], il), e;
	},
	update(e) {
		if (!rl.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return cl(rl.map((t) => t.id === e.id ? e : t), il), e;
	},
	createAllocation(e) {
		if (il.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return cl(rl, [e, ...il]), e;
	},
	updateAllocation(e) {
		if (!il.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return cl(rl, il.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!rl.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = il.some((t) => t.id === e.id) ? il.map((t) => t.id === e.id ? e : t) : [e, ...il];
		cl(rl.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return il.find((t) => t.id === e);
	}
};
i("customerCredits", {
	repository: G,
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
			Dc(n.recipient);
			for (let e of n.lines) ac(e), Jt(e, t.products.products.find((t) => t.id === e.productId));
		}
	},
	snapshot: () => ({
		creditNotes: rl,
		allocations: il
	}),
	restore: (e) => {
		rl = e.creditNotes, il = e.allocations, al = [...rl], ol = [...il];
	},
	publish: () => tl.forEach((e) => e())
});
function ll(e, t) {
	cl(rl.map((n) => n.id === e ? {
		...n,
		...t
	} : n), il);
}
//#endregion
//#region src/features/contacts/data/customerPricingStorage.ts
var ul = "htt.mock.contacts.customerPricing.v1";
function dl(e) {
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
function fl() {
	return mt(ul, dl);
}
function pl(e) {
	if (fl().status === "invalid" || !gt("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!ht("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var ml = [
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
], hl = /* @__PURE__ */ new Set(), gl = fl(), _l = gl.status === "ok" ? gl.data : structuredClone(ml);
function vl() {
	hl.forEach((e) => {
		e();
	});
}
function yl(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function bl(e) {
	return e.trim() || void 0;
}
function xl(e, t) {
	let n = Xt(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = n.units.find((e) => e.id === t);
	if (!r) throw Error(`Unit ${t} does not belong to product ${e}`);
	if (!r.active) throw Error("The selected product unit is inactive");
	return {
		product: n,
		unit: r
	};
}
function Sl(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function Cl({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = _l.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : Sl(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = Ol(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function wl(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function Tl(e) {
	let t = Zt(e.productId, e.unitId);
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
var El = {
	subscribe(e) {
		return hl.add(e), () => {
			hl.delete(e);
		};
	},
	getSnapshot() {
		return _l;
	},
	getAll() {
		return _l;
	},
	getById(e) {
		return _l.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return _l.filter((t) => t.customerId === e);
	},
	create(e, t) {
		xl(t.productId, t.unitId);
		let n = bl(t.effectiveTo);
		t.active && Cl({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = wl(t), a = {
			id: yl("cprice"),
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
		}, o = [a, ..._l];
		return pl(o), _l = o, vl(), a;
	},
	update(e, t) {
		let n = El.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		xl(t.productId, t.unitId);
		let r = bl(t.effectiveTo);
		t.active && Cl({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = wl(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = _l.map((t) => t.id === e ? a : t);
		return pl(o), _l = o, vl(), a;
	},
	resolve(e) {
		return Tl(e);
	},
	resolvePrice(e, t, n, r, i = r) {
		let a = El.resolveBasePrice(e, t, n, r.slice(0, 10)), o = m({
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
		let { unit: i } = xl(t, n), a = _l.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && Dl(r, i.effectiveFrom, i.effectiveTo));
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
		let o = Tl(a);
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
function Dl(e, t, n) {
	return !(e < t || n && e > n);
}
function Ol(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
i("customerPrices", {
	repository: El,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: _l }),
	restore: (e) => {
		_l = e.customerPrices;
	},
	publish: () => hl.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
function kl(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Al({ quantity: e, standardUnitPrice: t, unitPrice: n, taxRate: r = ue(), inclusiveLineTotal: i }) {
	let a = kl(e * n), o = kl(i === void 0 ? a * r : i - a), s = kl(a + o), c = kl(t - n);
	return {
		discountAmount: c,
		discountPercent: t > 0 ? kl(c / t * 100) : 0,
		lineSubtotal: a,
		taxAmount: o,
		lineTotal: s
	};
}
function jl(e) {
	let t = kl(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = kl(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: kl(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function Ml({ customerId: e, documentDate: t, draft: n, pricingAt: i, pricingContext: a }) {
	if (n.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let o = Xt(n.productId);
	if (!o) throw Error(`Product ${n.productId} was not found`);
	if (o.status !== "ACTIVE") throw Error(`${o.name} is inactive`);
	let s = Zt(n.productId, n.unitId);
	if (!s) throw Error(`Unit ${n.unitId} was not found for ${o.name}`);
	let c = a ?? tc(t, i), l = El.resolvePrice(e, n.productId, n.unitId, t, c.pricingAt), u = n.unitPrice !== void 0, d = u ? n.unitPrice : l.effectivePrice;
	if (!Number.isFinite(d) || d < 0) throw Error("Unit price cannot be negative");
	let f = ic(n.productId, n.unitId, n.quantity, n.requestedArea);
	if (Qt(n.productId, n.unitId, f.quantity, "sell"), o.sellEnabled === !1) throw Error("Product is not available for selling.");
	let p = o.taxCode ?? C().gstCode, m = ue(p), h = u ? De(d, m, n.priceBasis) : d, g = Al({
		taxRate: m,
		inclusiveLineTotal: u && (n.priceBasis ?? C().basis) === "Inclusive" ? Math.round(f.quantity * d * 100) / 100 : void 0,
		quantity: f.quantity,
		standardUnitPrice: l.basePrice,
		unitPrice: h
	});
	return {
		id: Nl("line"),
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
function Nl(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var Pl = /* @__PURE__ */ new Set(), Fl = k.read().payments;
function Il() {
	Pl.forEach((e) => e());
}
function Ll() {
	return `payment_${crypto.randomUUID()}`;
}
function Rl() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Fl.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var zl = {
	subscribe(e) {
		return Pl.add(e), () => {
			Pl.delete(e);
		};
	},
	getSnapshot() {
		return Fl;
	},
	getAll() {
		return Fl;
	},
	getById(e) {
		return Fl.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Fl.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Fl.filter((t) => t.invoiceId === e);
	},
	create(e) {
		if (!e.customerId) throw Error("Customer is required");
		if (!e.invoiceId) throw Error("Invoice is required");
		if (!e.paymentDate) throw Error("Payment date is required");
		if (!e.bankAccountId) throw Error("Bank account is required");
		let t = I.getById(e.bankAccountId);
		if (!t) throw Error("Bank account was not found");
		if (!t.active) throw Error("The selected bank account is inactive");
		if (!Number.isFinite(e.amount) || e.amount <= 0) throw Error("Payment amount must be greater than zero");
		if (w(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (Vl(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = A.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: Vl(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: Bl(e.reference),
				notes: Bl(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = Fl.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Ll(),
			paymentNumber: Rl(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: Vl(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: Bl(e.reference),
			notes: Bl(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && A.bindResult(n, i.id);
		let a = [i, ...Fl];
		if (k.update("payments", a), Fl = a, n && !e.deferOperationCompletion) try {
			A.complete(n, i.id);
		} catch (e) {
			try {
				A.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return Il(), i;
	},
	recordDepositSettlement(e) {
		if (w(e.paymentDate), !e.depositId || !e.applicationId || !Number.isFinite(e.amount) || e.amount <= 0) throw Error("Invalid deposit application payment.");
		if (Fl.some((t) => t.id === e.id || t.depositApplicationId === e.applicationId)) throw Error("Deposit application payment already exists.");
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: e.id,
			paymentNumber: Rl(),
			depositId: e.depositId,
			depositApplicationId: e.applicationId,
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			bankAccountId: e.bankAccountId,
			amount: Vl(e.amount),
			reference: e.reference,
			method: "OTHER",
			notes: "Deposit applied to invoice; no new bank receipt.",
			status: "RECEIVED",
			createdAt: t,
			updatedAt: t
		}, r = [n, ...Fl];
		return k.update("payments", r), Fl = r, Il(), n;
	},
	reverseDepositSettlement(e, t, n) {
		w(t);
		let r = Fl.find((t) => t.id === e);
		if (!r?.depositApplicationId || r.status !== "RECEIVED" || t < r.paymentDate || n.trim().length < 3) throw Error("Invalid deposit settlement reversal.");
		let i = {
			...r,
			status: "REVERSED",
			reversedAt: t,
			reversalReason: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, a = Fl.map((t) => t.id === e ? i : t);
		return k.update("payments", a), Fl = a, Il(), i;
	},
	reverse(e, t) {
		let n = Fl.find((t) => t.id === e);
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
		}, o = Fl.map((t) => t.id === e ? a : t);
		return k.update("payments", o), Fl = o, Il(), a;
	},
	getReceivedByInvoice(e) {
		return Fl.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function Bl(e) {
	return e?.trim() || void 0;
}
function Vl(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
i("customerPayments", {
	repository: zl,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null,
		recordDepositSettlement: null,
		reverseDepositSettlement: null
	},
	snapshot: () => ({ payments: Fl }),
	restore: (e) => {
		Fl = e.payments;
	},
	publish: () => Pl.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/salesAccountingPostingService.ts
function Hl(e) {
	return P.requireBySystemRole(e).id;
}
function Ul(e) {
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
function Wl(e, t) {
	return F.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Gl(e, t) {
	let n = Wl(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Kl = {
	postInvoice(e) {
		return Wl("CUSTOMER_INVOICE", e.id) || F.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: Hl("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: Hl("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				...zn(e.lines, "collected", !1, e.totals.taxAmount)
			]
		});
	},
	reverseInvoice(e) {
		let t = Gl("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Ul(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = Wl("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = I.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this customer payment is inactive.");
		return F.post({
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
				accountId: Hl("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = Gl("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Ul(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return Wl("CREDIT_NOTE", e.id) || F.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: Hl("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				...zn(e.lines, "collected", !0, e.totals.taxAmount),
				{
					accountId: Hl("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = Gl("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Ul(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, ql = /* @__PURE__ */ new Set(), Jl = Vc(), Yl = Ic(), Xl = jc(), Zl = Jl.status === "ok" ? structuredClone(Jl.data.quotes) : Yl.status === "ok" ? structuredClone(Yl.data.quotes) : Xl.status === "ok" ? structuredClone(Xl.data) : structuredClone(Kc);
function Ql(e) {
	Jl.status === "ok" || Vc().status !== "empty" ? Hc({
		quotes: e,
		salesOrders: $l,
		invoices: eu
	}) : Yl.status === "ok" || Ic().status !== "empty" ? Lc({
		quotes: e,
		salesOrders: $l
	}) : Mc(e), Zl = e, iu();
}
var $l = Jl.status === "ok" ? structuredClone(Jl.data.salesOrders) : Yl.status === "ok" ? structuredClone(Yl.data.salesOrders) : structuredClone(qc), eu = Jl.status === "ok" ? structuredClone(Jl.data.invoices) : structuredClone(Jc);
function tu(e) {
	Hc({
		quotes: Zl,
		salesOrders: $l,
		invoices: e
	}), eu = e, iu();
}
function nu(e, t = Zl) {
	Jl.status === "ok" || Vc().status !== "empty" ? Hc({
		quotes: t,
		salesOrders: e,
		invoices: eu
	}) : Lc({
		quotes: t,
		salesOrders: e
	}), $l = e, Zl = t, iu();
}
var ru = au();
function iu() {
	ru = au(), ql.forEach((e) => e());
}
function au() {
	return [
		...Zl,
		...$l,
		...eu
	];
}
var K = {
	createManagedOrder(e) {
		let t = $l.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: cu("order"),
			managedDraftId: e.draftId,
			type: "SALES_ORDER",
			status: "CONFIRMED",
			documentNumber: lu("SO", $l.map((e) => e.documentNumber)),
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
		return nu([r, ...$l]), r;
	},
	createManagedInvoice(e) {
		let t = eu.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = K.createManagedOrder(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: cu("invoice"),
			managedDraftId: e.draftId,
			type: "INVOICE",
			status: "ISSUED",
			documentNumber: lu("INV", eu.map((e) => e.documentNumber)),
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
		}, a = $l.map((e) => e.id === n.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: r
		} : e);
		return Hc({
			quotes: Zl,
			salesOrders: a,
			invoices: [i, ...eu]
		}), $l = a, eu = [i, ...eu], iu(), Kl.postInvoice(i), i;
	},
	cancelManagedOrder(e, t) {
		let n = $l.find((t) => t.id === e);
		if (!n?.managedDraftId) throw Error("Managed order not found.");
		if (n.status === "CANCELLED") return n;
		if (n.invoiceIds.some((e) => eu.some((t) => t.id === e && t.status !== "VOID"))) throw Error("Void active invoices before cancelling the order.");
		if (n.status === "PARTIALLY_FULFILLED" || n.status === "FULFILLED" || n.fulfilmentStatus === "PARTIALLY_FULFILLED" || n.fulfilmentStatus === "FULFILLED") throw Error("Reverse active fulfilments before cancelling the order.");
		if (t.trim().length < 3) throw Error("Cancellation reason is required.");
		let r = {
			...n,
			status: "CANCELLED",
			notes: (n.notes ?? "") + "\nCancelled: " + t.trim(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return nu($l.map((t) => t.id === e ? r : t)), r;
	},
	subscribe(e) {
		return ql.add(e), () => {
			ql.delete(e);
		};
	},
	getSnapshot() {
		return le(ru);
	},
	getAll() {
		return le(ru);
	},
	getById(e) {
		return le(ru).find((t) => t.id === e);
	},
	getByCustomer(e) {
		return le(ru).filter((t) => t.customerId === e);
	},
	getQuotesByCustomer(e) {
		return le(Zl).filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return $l.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return eu.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (ou(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = tc(e.documentDate, e.pricingAt), n = e.lines.map((n) => Ml({
			customerId: e.customerId,
			documentDate: e.documentDate,
			pricingContext: t,
			draft: n
		})), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: cu("quote"),
			type: "QUOTE",
			documentNumber: lu("QU", Zl.map((e) => e.documentNumber)),
			recipient: Ec(e.customerId, e),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: su(e.customerReference),
			notes: su(e.notes),
			lines: n,
			totals: jl(n),
			createdAt: r,
			updatedAt: r
		};
		return Ql([i, ...Zl]), i;
	},
	updateDraftQuote(e, t) {
		let n = Zl.find((t) => t.id === e);
		if (!n) throw Error(`Quote ${e} was not found`);
		if (n.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let r = n.lines.find((e) => e.pricingAt), i = tc(t.documentDate, t.pricingAt ?? (t.documentDate === n.documentDate ? r?.pricingAt : void 0), t.documentDate === n.documentDate && (!t.pricingAt || t.pricingAt === r?.pricingAt) ? r?.pricingTimezone : void 0), a = t.lines.map((e) => {
			let r = Ml({
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
			recipient: t.locationId === void 0 && t.accountingContactId === void 0 ? n.recipient : Ec(n.customerId, t),
			documentDate: t.documentDate,
			expiryDate: t.expiryDate,
			customerReference: su(t.customerReference),
			notes: su(t.notes),
			lines: a,
			totals: jl(a),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ql(Zl.map((t) => t.id === e ? o : t)), o;
	},
	sendQuote(e) {
		let t = Zl.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return Ql(Zl.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = Zl.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return Ql(Zl.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = Zl.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return Ql(Zl.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = Zl.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: cu("order"),
			type: "SALES_ORDER",
			documentNumber: lu("SO", $l.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: uu(),
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
		return nu([r, ...$l], Zl.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = $l.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED" && n.status !== "INVOICED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: n.status === "INVOICED" ? "INVOICED" : t,
			fulfilmentStatus: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return nu($l.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = $l.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = uu(), i = {
			id: cu("invoice"),
			managedDraftId: t.managedDraftId,
			type: "INVOICE",
			documentNumber: lu("INV", eu.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: r,
			dueDate: du(r, Number(C().terms)),
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
		}, a = [i, ...eu], o = $l.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: n
		} : e);
		return Hc({
			quotes: Zl,
			salesOrders: o,
			invoices: a
		}), eu = a, $l = o, iu(), Kl.postInvoice(i), i;
	},
	createCreditNoteFromInvoice(e) {
		let t = eu.find((t) => t.id === e.invoiceId);
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
			let i = G.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id).reduce((e, t) => e + t.quantity, 0);
			if (e.quantity + i > n.quantity + 1e-8) throw Error("Credit quantity cannot exceed the original invoice quantity.");
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = G.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id), s = e.quantity + i >= n.quantity - 1e-8, c = fu(s ? n.lineSubtotal - o.reduce((e, t) => e + t.lineSubtotal, 0) : n.lineSubtotal * e.quantity / n.quantity), l = fu(s ? n.taxAmount - o.reduce((e, t) => e + t.taxAmount, 0) : n.taxAmount * e.quantity / n.quantity);
			return {
				...n,
				requestedArea: e.quantity === n.quantity ? n.requestedArea : void 0,
				coveredArea: n.areaPerPack ? Math.round(e.quantity * n.areaPerPack * 1e8) / 1e8 : void 0,
				quantity: e.quantity,
				taxRate: a,
				lineSubtotal: c,
				taxAmount: l,
				lineTotal: fu(c + l)
			};
		}), a = jl(i);
		if (a.total <= 0) throw Error("Credit note total must be greater than zero");
		if (fu(fu(G.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + a.total) > fu(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: cu("credit-note"),
			creditNoteNumber: lu("CN", G.getAll().map((e) => e.creditNoteNumber)),
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
		return G.create(s), Kl.postCreditNote(s), s;
	},
	applyCreditToInvoice(e) {
		M(), Gc();
		let t = G.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		let n = eu.find((t) => t.id === e.invoiceId);
		if (!n) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void credit note cannot be applied");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be applied");
		if (n.status === "VOID") throw Error("Credit cannot be applied to a void invoice");
		if (n.status === "DRAFT") throw Error("Credit cannot be applied to a draft invoice");
		if (t.customerId !== n.customerId) throw Error("Credit note and invoice must belong to the same customer");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the credit note date");
		let r = fu(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = G.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: cu("credit-allocation"),
			allocationNumber: lu("CA", G.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = fu(i.amountApplied + r), c = fu(Math.max(0, i.totals.total - (i.amountRefunded ?? 0) - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
		if (A.begin(l, "SALES_CREDIT_APPLY", JSON.stringify({
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: r
		})).status !== "started") throw Error("Credit allocation was previously attempted; manual review required.");
		try {
			A.bindResult(l, o.id), G.commitAllocationAndCredit(o, {
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
		M(), Gc();
		let t = G.getAllocationById(e.allocationId);
		if (!t) throw Error(`Credit allocation ${e.allocationId} was not found`);
		if (t.status === "REVERSED") throw Error("This credit allocation has already been reversed");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A reversal reason is required");
		let r = G.getById(t.creditNoteId);
		if (!r) throw Error("Credit note was not found");
		if (r.status === "VOID") throw Error("Allocations on a void credit note cannot be reversed here");
		let i = eu.find((e) => e.id === t.invoiceId);
		if (!i) throw Error("Allocated invoice was not found");
		if (i.status === "VOID") throw Error("Credit allocation cannot be reversed after the invoice has been voided");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			updatedAt: a
		}, s = fu(G.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = fu(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - s)), l = `sales-credit-reversal:${t.id}`;
		if (A.begin(l, "SALES_CREDIT_REVERSAL", t.id).status !== "started") throw Error("Credit allocation reversal previously attempted; manual review required.");
		try {
			A.bindResult(l, t.id), G.commitAllocationAndCredit(o, {
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
		if (t().physicalCustomerReturns?.returns.some((t) => t.creditNoteId === e.creditNoteId && t.status === "POSTED")) throw Error("Reverse the linked physical customer return before voiding this credit.");
		e.voidDate && w(e.voidDate, "Credit reversal date");
		let n = G.getById(e.creditNoteId);
		if (!n) throw Error(`Credit note ${e.creditNoteId} was not found`);
		if (n.status === "VOID") throw Error("This credit note has already been voided");
		if (n.status === "DRAFT") throw Error("A draft credit note cannot be voided here");
		if (e.voidDate && ((n.refundEvents ?? []).some((t) => (t.reversalDate ?? t.date) > e.voidDate) || G.getAllocationsByCreditNote(n.id).some((t) => (t.reversedAt ? ve(t.reversedAt) : t.allocationDate) > e.voidDate))) throw Error("Credit reversal precedes later settlement activity.");
		if (e.voidDate && e.voidDate < n.creditDate) throw Error("Credit reversal date precedes credit date.");
		if ((n.amountRefunded ?? 0) > 0) throw Error("Reverse customer refunds before voiding the credit.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (G.getAllocationsByCreditNote(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this credit note");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: e.voidDate ?? i,
			voidReason: r,
			updatedAt: i
		};
		return G.update(a), Kl.reverseCreditNote(a), a;
	},
	recordInvoicePayment(e) {
		if (M(), Gc(), e.operationId) {
			let t = A.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = eu.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = fu(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (w(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, a = zl.create({
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
			Kl.postPayment(a);
			let e = F.getBySource("CUSTOMER_PAYMENT", a.id).filter((e) => !e.reversedJournalEntryId);
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
		M(), Gc();
		let n = eu.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (zl.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
		if (G.getAllocationsByInvoice(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("This invoice has applied credits. Reverse all active credit allocations before voiding the invoice.");
		if (n.managedDraftId && G.getByInvoice(n.id).some((e) => e.status !== "VOID")) throw Error("Void source credits before voiding this direct invoice.");
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
			let t = F.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (t.length !== 1 || t[0].status !== "POSTED") throw Error("Invoice original GL must be uniquely posted before voiding.");
			A.bindResult(o, e), Kl.reverseInvoice(a);
			let n = F.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			tu(eu.map((t) => t.id === e ? a : t)), A.complete(o, e);
		} catch (e) {
			try {
				A.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		if (Bn("CUSTOMER_PAYMENT", e), M(), Gc(), zl.getById(e)?.depositApplicationId) throw Error("Reverse this settlement through customer deposits.");
		let n = zl.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = eu.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (A.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			A.bindResult(i, e);
			let n = zl.reverse(e, t);
			Kl.reversePayment(n);
			let a = F.getBySource("CUSTOMER_PAYMENT", e).filter((e) => !e.reversedJournalEntryId);
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
		let t = eu.find((t) => t.id === e);
		if (!t) throw Error(`Invoice ${e} was not found`);
		if (t.status === "VOID") return t;
		let n = zl.getReceivedByInvoice(e), r = G.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = fu(n.reduce((e, t) => e + t.amount, 0)), a = fu(r.reduce((e, t) => e + t.amount, 0)), o = fu(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : pu(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return tu(eu.map((t) => t.id === e ? c : t)), c;
	}
};
function ou(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function su(e) {
	return e?.trim() || void 0;
}
function cu(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function lu(e, t) {
	return we(e, t, ve((/* @__PURE__ */ new Date()).toISOString()).slice(0, 4));
}
function uu() {
	return ve((/* @__PURE__ */ new Date()).toISOString());
}
function du(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function fu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function pu(e) {
	return e < mu(/* @__PURE__ */ new Date());
}
function mu(e) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
i("sales", {
	repository: K,
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
			Dc(e.recipient);
			for (let n of e.lines) ac(n), nc(n), Jt(n, t.products.products.find((e) => e.id === n.productId));
		}
	},
	snapshot: () => ({
		quotes: Zl,
		salesOrders: $l,
		invoices: eu
	}),
	restore: (e) => {
		Zl = e.quotes, $l = e.salesOrders, eu = e.invoices, ru = au();
	},
	publish: () => ql.forEach((e) => e())
});
function hu(e, t) {
	tu(eu.map((n) => n.id === e ? {
		...n,
		...t
	} : n));
}
function gu(e) {
	if (Zl.some((t) => e.has(t.id) && t.status !== "DRAFT")) throw Error("Only draft quotes may be purged.");
	Ql(Zl.filter((t) => !e.has(t.id)));
}
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var _u = /* @__PURE__ */ new Set(), q = k.read().supplierCredits, vu = k.read().supplierCreditAllocations, yu = k.read().supplierCredits, bu = k.read().supplierCreditAllocations;
k.onRollback(() => {
	q = k.read().supplierCredits, vu = k.read().supplierCreditAllocations, yu = q, bu = vu;
});
function xu() {
	k.update("supplierCredits", q), k.update("supplierCreditAllocations", vu), yu = [...q], bu = [...vu], _u.forEach((e) => k.notify(e));
}
var Su = !1, J = {
	subscribe(e) {
		return _u.add(e), () => {
			_u.delete(e);
		};
	},
	getSnapshot() {
		return yu;
	},
	getAllocationSnapshot() {
		return bu;
	},
	getAll() {
		return yu;
	},
	getAllAllocations() {
		return bu;
	},
	getById(e) {
		return q.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return q.filter((t) => t.supplierId === e);
	},
	getBySourceBill(e) {
		return q.filter((t) => t.sourceSupplierBillId === e);
	},
	getAllocationById(e) {
		return vu.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return vu.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return vu.filter((t) => t.supplierBillId === e);
	},
	createReturnCredit(e, t) {
		let n = {
			...J.create(e),
			physicalReturnId: t
		};
		return J.update(n), n;
	},
	voidReturnCredit(e) {
		Su = !0;
		try {
			return J.voidCredit(e);
		} finally {
			Su = !1;
		}
	},
	create(e) {
		let t = Bi.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (q.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!Eu(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, n) => {
			let r = i.get(e.supplierBillLineId);
			if (!r) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(r.id)) throw Error(`${r.description} appears more than once in the supplier credit.`);
			a.add(r.id);
			let o = Ou(e.quantity);
			if (!Number.isFinite(o) || o <= 0) throw Error(`${r.description} credit quantity must be greater than zero.`);
			if (o > r.quantity) throw Error(`${r.description} credit quantity cannot exceed the source bill quantity.`);
			let s = e.unitCost;
			if (!Number.isFinite(s) || s < 0) throw Error(`${r.description} unit cost cannot be negative.`);
			if (s > r.unitCost + 1e-8) throw Error(`${r.description} credit unit cost cannot exceed the source bill unit cost.`);
			let c = q.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.supplierBillLineId === r.id), l = Math.abs(s - r.unitCost) < 1e-8, u = c.every((e) => Math.abs(e.unitCost - r.unitCost) < 1e-8), d = l && u && Math.abs(o + c.reduce((e, t) => e + t.quantity, 0) - r.quantity) < 1e-8, f = c.reduce((e, t) => e + t.lineSubtotal, 0), p = c.reduce((e, t) => e + t.taxAmount, 0), m = Du(d ? r.lineSubtotal - f : l ? r.lineSubtotal * o / r.quantity : o * s), h = Du(d ? r.taxAmount - p : r.unitCost ? r.taxAmount * o / r.quantity * s / r.unitCost : 0);
			if (m < 0 || h < 0 || Du(m + f) > r.lineSubtotal || Du(h + p) > r.taxAmount) throw Error("Credit line value exceeds the uncredited source bill line.");
			let g = Du(m + h);
			return {
				id: Tu(`supplier-credit-line-${n + 1}`),
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
		}), s = Du(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = Du(o.reduce((e, t) => e + t.taxAmount, 0)), l = Du(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (Du(Du(q.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > Du(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: Tu("supplier-credit"),
			creditNumber: wu(e.creditDate),
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
		return q = [d, ...q], xu(), jr.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = q.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = Bi.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!Eu(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = Du(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: Tu("supplier-credit-allocation"),
			allocationNumber: Cu(e.allocationDate),
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
		Bi.applyCredit(n.id, r);
		let o = Du(t.amountApplied + r), s = Du(Math.max(0, t.totals.total - (t.amountRefunded ?? 0) - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return vu = [a, ...vu], q = q.map((e) => e.id === t.id ? c : e), xu(), a;
	},
	reverseAllocation(e) {
		let t = vu.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = q.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = Bi.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		Bi.reverseCredit(i.id, t.amount);
		let o = Du(Math.max(0, r.amountApplied - t.amount)), s = Du(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - o)), c = {
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
		return q = q.map((e) => e.id === r.id ? c : e), vu = vu.map((e) => e.id === t.id ? l : e), xu(), l;
	},
	voidCredit(e) {
		let t = q.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		if (t.physicalReturnId && !Su) throw Error("Reverse the linked physical supplier return instead of voiding its credit separately.");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse supplier refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (vu.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: Su && e.voidDate ? e.voidDate : r,
			voidReason: n,
			updatedAt: r
		};
		return q = q.map((e) => e.id === t.id ? i : e), xu(), jr.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!vu.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return vu = vu.map((t) => t.id === e.id ? e : t), xu(), e;
	},
	update(e) {
		if (!q.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return q = q.map((t) => t.id === e.id ? e : t), xu(), e;
	}
};
function Cu(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = vu.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function wu(e) {
	return we("SC", q.map((e) => e.creditNumber), e.slice(0, 4));
}
function Tu(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function Eu(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function Du(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ou(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var ku = J.create;
J.create = function(...e) {
	return M(), k.transaction(() => ku.apply(J, e));
};
var Au = J.applyToBill;
J.applyToBill = function(...e) {
	return M(), k.transaction(() => Au.apply(J, e));
};
var ju = J.reverseAllocation;
J.reverseAllocation = function(...e) {
	return M(), k.transaction(() => ju.apply(J, e));
};
var Mu = J.voidCredit;
J.voidCredit = function(...e) {
	return M(), k.transaction(() => Mu.apply(J, e));
};
var Nu = J.update;
J.update = function(...e) {
	return M(), k.transaction(() => Nu.apply(J, e));
};
var Pu = J.updateAllocation;
J.updateAllocation = function(...e) {
	return M(), k.transaction(() => Pu.apply(J, e));
}, i("supplierCredits", {
	repository: J,
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
		supplierCredits: q,
		allocations: vu
	}),
	restore: (e) => {
		q = e.supplierCredits, vu = e.allocations, yu = [...q], bu = [...vu];
	},
	publish: () => _u.forEach((e) => e())
});
function Fu(e, t) {
	q = q.map((n) => n.id === e ? {
		...n,
		...t
	} : n), xu();
}
//#endregion
//#region src/features/finance-closure/settlementRepository.ts
var Iu = (e) => Math.round((e + 2 ** -52) * 100) / 100, Lu = E().trim().min(1).max(200), Ru = f().finite().positive().refine((e) => Iu(e) === e, "Use cents precision"), zu = e({
	operationId: Lu,
	customerId: Lu,
	paymentDate: Lu,
	bankAccountId: Lu,
	reference: E().max(500).optional(),
	allocations: s(e({
		invoiceId: Lu,
		amount: Ru
	}).strict()).min(1).max(500)
}).strict(), Bu = e({
	operationId: Lu,
	creditId: Lu,
	paymentDate: Lu,
	bankAccountId: Lu,
	amount: Ru,
	reference: E().max(500).optional()
}).strict(), Vu = [], Hu = [], Uu = [], Wu = 0, Gu = /* @__PURE__ */ new Set(), Ku = () => {
	Wu++, Gu.forEach((e) => e());
};
function qu(e, t, n) {
	let r = JSON.stringify(n), i = e.find((e) => e.operationId === t);
	if (i && i.fingerprint !== r) throw Error("Operation ID was already used with different data.");
	return {
		old: i,
		fingerprint: r
	};
}
function Ju(e, t) {
	w(t, "Payment date");
	let n = I.requireById(e);
	if (!n.active || t < n.openingBalanceDate) throw Error("Bank is inactive or payment precedes its opening date.");
	let r = P.requireById(n.glAccountId);
	if (!r.active || r.type !== "ASSET") throw Error("Invalid bank ledger account.");
	return n;
}
function Yu(e) {
	if (Zs.getAll().some((t) => t.clearedTransactionIds.some((t) => t.startsWith(e + ":")))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Xu(e, t) {
	let n = e === "customer" ? G.getById(t) : J.getById(t);
	if (!n || n.status === "VOID" || n.status === "DRAFT") throw Error("An issued credit is required.");
	return n;
}
function Zu(e, t, n) {
	let r = Xu(e, t), i = Iu(n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0)), a = Iu(r.totals.total - r.amountApplied - i);
	if (a < 0) throw Error("Refund exceeds the unused credit.");
	let o = {
		...r,
		refundEvents: n,
		amountRefunded: i,
		amountAvailable: a,
		status: a === 0 ? "FULLY_APPLIED" : "ISSUED",
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	e === "customer" ? G.update(o) : J.update(o);
}
function Qu(e, t) {
	M();
	let n = Bu.parse(t), { old: r, fingerprint: i } = qu(e === "customer" ? Hu : Uu, n.operationId, n);
	if (r) return r;
	let a = Xu(e, n.creditId), o = Ju(n.bankAccountId, n.paymentDate);
	if (n.paymentDate < a.creditDate || n.amount > a.amountAvailable) throw Error("Refund date/amount exceeds the available credit.");
	let s = P.requireBySystemRole(e === "customer" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"), c = crypto.randomUUID(), l = F.post({
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
	return Zu(e, a.id, [...a.refundEvents ?? [], {
		id: u.id,
		date: u.paymentDate,
		amount: u.amount
	}]), e === "customer" ? Hu = [...Hu, u] : Uu = [...Uu, u], Ku(), u;
}
function $u(e, t) {
	if (M(), w(t.reversalDate, "Reversal date"), !t.reason?.trim() || t.reason.trim().length < 3) throw Error("Enter a reversal reason.");
	let n = e === "customer" ? Hu : Uu, r = n.find((e) => e.id === t.id);
	if (!r) throw Error("Refund was not found.");
	if (r.status === "REVERSED") return r;
	if (t.reversalDate < r.paymentDate) throw Error("Reversal cannot precede the refund.");
	Yu(r.journalEntryId), F.reverse({
		journalEntryId: r.journalEntryId,
		reversalDate: t.reversalDate,
		reason: t.reason
	});
	let i = Xu(e, r.creditId);
	Zu(e, i.id, (i.refundEvents ?? []).map((e) => e.id === r.id ? {
		...e,
		reversalDate: t.reversalDate
	} : e));
	let a = {
		...r,
		status: "REVERSED",
		reversalDate: t.reversalDate
	};
	return e === "customer" ? Hu = n.map((e) => e.id === r.id ? a : e) : Uu = n.map((e) => e.id === r.id ? a : e), Ku(), a;
}
var ed = {
	recordReceipt(e) {
		let t = zu.parse(e), { old: n, fingerprint: r } = qu(Vu, t.operationId, t);
		if (n) return n;
		if (Ju(t.bankAccountId, t.paymentDate), new Set(t.allocations.map((e) => e.invoiceId)).size !== t.allocations.length) throw Error("Each invoice may only be allocated once.");
		for (let e of t.allocations) {
			let n = K.getAll().find((t) => t.id === e.invoiceId && t.type === "INVOICE");
			if (!n || n.type !== "INVOICE" || n.customerId !== t.customerId || t.paymentDate < n.documentDate || ["VOID", "DRAFT"].includes(n.status) || e.amount > n.amountDue) throw Error("Invalid invoice customer, date or outstanding amount.");
		}
		let i = t.allocations.map((e, n) => K.recordInvoicePayment({
			...t,
			invoiceId: e.invoiceId,
			amount: e.amount,
			method: "BANK_TRANSFER",
			operationId: t.operationId + ":" + n
		})), a = {
			...t,
			id: crypto.randomUUID(),
			fingerprint: r,
			amount: Iu(i.reduce((e, t) => e + t.amount, 0)),
			paymentIds: i.map((e) => e.id),
			status: "POSTED"
		};
		return Vu = [...Vu, a], Ku(), a;
	},
	reverseReceipt(e) {
		let t = Vu.find((t) => t.id === e.id);
		if (!t) throw Error("Receipt not found.");
		if (t.status === "REVERSED") return t;
		for (let e of t.paymentIds) {
			let t = zl.getById(e);
			if (!t || t.status !== "RECEIVED") throw Error("Receipt allocations changed; inspect individual payments first.");
			for (let t of F.getBySource("CUSTOMER_PAYMENT", e)) Yu(t.id);
		}
		for (let n of t.paymentIds) K.reverseInvoicePayment(n, e.reason);
		let n = {
			...t,
			status: "REVERSED",
			reversalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		};
		return Vu = Vu.map((e) => e.id === t.id ? n : e), Ku(), n;
	},
	createRefund: (e) => Qu("customer", e),
	reverseRefund: (e) => $u("customer", e)
}, td = {
	create: (e) => Qu("supplier", e),
	reverse: (e) => $u("supplier", e),
	repairLegacyCredits(e) {
		if (M(), w(e.date, "Repair date"), e.reason?.trim().length < 3) throw Error("Enter a repair reason.");
		let t = [];
		for (let n of J.getAll().filter((e) => e.status !== "VOID")) {
			if (e.date < n.creditDate || F.getBySource("SUPPLIER_CREDIT_RECLASS", n.id).length) continue;
			let r = F.getBySource("SUPPLIER_CREDIT", n.id).find((e) => e.status === "POSTED");
			if (!r) continue;
			let i = P.requireBySystemRole("INVENTORY"), a = P.requireBySystemRole("PURCHASE_PRICE_VARIANCE"), o = Iu(r.lines.filter((e) => e.accountId === i.id).reduce((e, t) => e + t.credit - t.debit, 0));
			o <= 0 || t.push(F.post({
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
}, nd = e({
	id: Lu,
	operationId: Lu,
	fingerprint: Lu,
	creditId: Lu,
	contactId: Lu,
	paymentDate: Lu,
	bankAccountId: Lu,
	amount: Ru,
	journalEntryId: Lu,
	status: T(["POSTED", "REVERSED"]),
	reference: E().optional(),
	reversalDate: E().optional()
}).strict();
i("customerSettlements", {
	repository: ed,
	read: "sales.read",
	commands: {
		recordReceipt: "sales.payment",
		reverseReceipt: "sales.payment",
		createRefund: "sales.payment",
		reverseRefund: "sales.payment"
	},
	snapshot: () => ({
		receipts: Vu,
		refunds: Hu
	}),
	restore: (e) => {
		Vu = e.receipts, Hu = e.refunds;
	},
	validate: (t, n) => {
		rd(t, n, !1);
		let r = t;
		s(nd.extend({ fingerprint: E() })).parse(r.refunds), s(e({
			id: Lu,
			operationId: Lu,
			paymentIds: s(Lu),
			amount: Ru,
			status: T(["POSTED", "REVERSED"])
		}).passthrough()).parse(r.receipts);
	},
	publish: Ku
}), i("supplierRefunds", {
	repository: td,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		repairLegacyCredits: "accounting.recover"
	},
	snapshot: () => ({ refunds: Uu }),
	restore: (e) => {
		Uu = e.refunds;
	},
	validate: (e, t) => {
		rd(e, t, !0), s(nd.extend({ fingerprint: E() })).parse(e.refunds);
	},
	publish: Ku
});
function rd(e, t, n) {
	let r = e, i = t.journals.journalEntries, a = n ? t.supplierCredits.supplierCredits : t.customerCredits.creditNotes, o = t.bankAccounts.bankAccounts;
	for (let e of r.refunds) {
		let t = a.find((t) => t.id === e.creditId), r = i.find((t) => t.id === e.journalEntryId), s = t?.refundEvents?.find((t) => t.id === e.id);
		if (!t || e.contactId !== ("customerId" in t ? t.customerId : t.supplierId) || !s || s.amount !== e.amount || s.date !== e.paymentDate || s.reversalDate !== e.reversalDate || !o.some((t) => t.id === e.bankAccountId) || !r || r.sourceId !== e.id || r.sourceType !== (n ? "SUPPLIER_REFUND" : "CUSTOMER_REFUND") || r.totalDebit !== e.amount || r.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) throw Error("Refund snapshot relationships are invalid.");
	}
	for (let e of a) {
		let t = Iu(r.refunds.filter((t) => t.creditId === e.id && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
		if ((e.amountRefunded ?? 0) !== t) throw Error("Credit refunded balance is invalid.");
	}
	for (let e of a) for (let t of e.refundEvents ?? []) if (!r.refunds.some((n) => n.id === t.id && n.creditId === e.id)) throw Error("Credit refund history has no settlement record.");
	if (!n) {
		let e = t.customerPayments.payments;
		for (let t of r.receipts ?? []) {
			let n = t.paymentIds.map((t) => e.find((e) => e.id === t));
			if (new Set(t.paymentIds).size !== t.paymentIds.length || !n.length || n.some((e) => !e || e.customerId !== t.customerId || e.bankAccountId !== t.bankAccountId || e.status !== (t.status === "REVERSED" ? "REVERSED" : "RECEIVED")) || Iu(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== t.amount) throw Error("Receipt allocation snapshot relationships are invalid.");
		}
	}
}
//#endregion
//#region src/features/finance-closure/bankStatementRepository.ts
var id = (e) => Math.round((e + 2 ** -52) * 100) / 100, ad = E().min(1).max(200), od = [], sd = 0, cd = /* @__PURE__ */ new Set(), ld = () => {
	sd++, cd.forEach((e) => e());
};
function ud(e) {
	let t = I.requireById(e);
	if (!t.active) throw Error("Select an active bank account.");
	return t;
}
function dd(e) {
	let t = od.find((t) => t.id === e);
	if (!t) throw Error("Statement line was not found.");
	return t;
}
function fd(e) {
	if (e.status !== "UNMATCHED") throw Error("This line is already processed. Revert it before changing it.");
	let t = Zs.getLatestByBankAccount(e.bankAccountId);
	if (t && e.date <= t.statementDate) throw Error("Statement date is already reconciled.");
}
function pd(e) {
	return od = od.map((t) => t.id === e.id ? e : t), ld(), e;
}
var md = (e, t) => Is(ud(e), F.getAll(), t).transactions;
function hd(e) {
	if (e.date < ud(e.bankAccountId).openingBalanceDate) throw Error("Statement predates the current bank opening date.");
}
function gd(e) {
	let t = F.getAll(), n = Ns(t);
	if (t.some((t) => t.sourceType === "BANK_STATEMENT" && t.sourceId?.startsWith(e + ":") && n.reviewIds.has(t.id))) throw Error("Earlier categorisation correction requires reviewed recovery before changing this line again.");
}
var _d = e({
	date: ad,
	description: E().trim().min(1).max(1e3),
	amount: f().finite().refine((e) => e !== 0 && id(e) === e, "Enter a non-zero amount in cents"),
	reference: E().max(500).default(""),
	externalId: E().max(200).default(""),
	payee: E().trim().max(500).optional()
}).strict(), vd = {
	importRows(t) {
		let n = e({
			bankAccountId: ad,
			rows: s(_d).min(1).max(1e4)
		}).strict().parse(t), r = ud(n.bankAccountId), i = 0, a = [...od], o = [];
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
			let s = Zs.getLatestByBankAccount(r.id);
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
		return od = a, ld(), {
			created: o.length,
			duplicates: i
		};
	},
	importCsv(e) {
		if (typeof e.csv != "string" || e.csv.length > 1e7) throw Error("CSV exceeds the 10 MB limit.");
		let t = Ea(e.csv.replace(/^\uFEFF/, "")), n = t.shift()?.map((e) => e.trim().toLowerCase()) ?? [];
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
		return vd.importRows({
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
					l = id(t - e);
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
		let t = Zs.getClearedTransactionIds(e.bankAccountId), n = F.getAll(), r = new Map(n.map((e) => [e.id, e]));
		return md(e.bankAccountId, e.asOfDate).filter((i) => ce(r.get(i.journalEntryId), n, e.asOfDate) && !i.correctionOnly && !i.correctionIssue && !t.has(i.id) && !od.some((e) => e.ledgerIds.includes(i.id)));
	},
	match(e) {
		let t = dd(e.id);
		if (fd(t), hd(t), !Array.isArray(e.ledgerIds) || !e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Select unique ledger entries.");
		let n = Zs.getClearedTransactionIds(t.bankAccountId);
		if (e.ledgerIds.some((e) => n.has(e))) throw Error("Selected bank entries were already cleared by a completed reconciliation. Use the genuine source of this new statement line.");
		let r = vd.candidates({
			bankAccountId: t.bankAccountId,
			asOfDate: t.date
		}), i = e.ledgerIds.map((e) => r.find((t) => t.id === e));
		if (i.some((e) => !e) || id(i.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== t.amount) throw Error("Selected bank entries must match this signed statement amount exactly.");
		return pd({
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
		let t = dd(e.id);
		return (x["bank-rules"] ?? []).filter((e) => e.status === "Active" && e.enabled !== "No").filter((e) => ks(e, t)).sort((e, t) => Number(e.priority ?? 100) - Number(t.priority ?? 100) || e.id.localeCompare(t.id));
	},
	post(t) {
		M();
		let n = dd(t.id), i = JSON.stringify(t.splits);
		if (n.status === "POSTED") {
			if (n.fingerprint !== i) throw Error("Line was already posted with different categorisation.");
			return n;
		}
		fd(n), hd(n), gd(n.id);
		let a = s(e({
			accountId: ad,
			amount: f().finite().positive().refine((e) => id(e) === e),
			taxCode: ad
		}).strict()).min(1).max(100).parse(t.splits);
		if (id(a.reduce((e, t) => e + t.amount, 0)) !== Math.abs(n.amount)) throw Error("Split amounts must equal the statement total.");
		let o = ud(n.bankAccountId), c = n.amount < 0, l = a.flatMap((e) => {
			let t = P.requireById(e.accountId);
			if (!t.active || !t.allowManualPosting || !["EXPENSE", "REVENUE"].includes(t.type)) throw Error("Use an active manual expense/revenue account. Payments against AR/AP must be matched to their source documents.");
			let n = ue(e.taxCode), i = id(e.amount / (1 + n)), a = id(e.amount - i);
			return [{
				accountId: t.id,
				debit: c ? i : 0,
				credit: c ? 0 : i
			}, ...a ? [{
				accountId: (c ? r(e.taxCode).taxPaidAccountId : r(e.taxCode).taxCollectedAccountId) || P.requireBySystemRole(c ? "GST_RECEIVABLE" : "GST_PAYABLE").id,
				debit: c ? a : 0,
				credit: c ? 0 : a
			}] : []];
		}), u = F.post({
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
		return pd({
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
		let t = dd(e.id);
		if (fd(t), e.reason?.trim().length < 3) throw Error("Enter an exclusion reason.");
		return pd({
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
		M();
		let t = dd(e.id);
		if (w(e.reversalDate, "Reversal date"), e.reason?.trim().length < 3 || e.reversalDate < t.date) throw Error("Enter a reason and a reversal date on or after the statement line.");
		if (t.status === "UNMATCHED") throw Error("Line is already unmatched.");
		let n = Zs.getLatestByBankAccount(t.bankAccountId);
		if (n && t.date <= n.statementDate) throw Error("Reconciled statement lines cannot be reverted.");
		if (t.status === "POSTED" && gd(t.id), t.status === "POSTED" && e.reversalDate !== t.date) throw Error("Categorisation correction must reverse on the original statement date in an open period. It does not reverse an external payment.");
		if (t.status === "POSTED") for (let e of t.ledgerIds) Yu(e.split(":")[0]);
		return t.status === "POSTED" && t.journalEntryId && F.reverse({
			journalEntryId: t.journalEntryId,
			reversalDate: e.reversalDate,
			reason: e.reason
		}), pd({
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
		if (Qn(e.statementDate), M(), w(e.statementDate, "Statement date"), !od.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate)) throw Error("Import the statement first.");
		if (od.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate && t.status === "UNMATCHED")) throw Error("Process every statement line before completing reconciliation.");
		let t = od.filter((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate), n = md(e.bankAccountId, e.statementDate), r = F.getAll(), i = new Map(r.map((e) => [e.id, e]));
		for (let a of t.filter((e) => e.status === "MATCHED" || e.status === "POSTED")) {
			if (a.ledgerIds.some((t) => Vs(Zs.getAll(), e.bankAccountId, t, a.date))) throw Error("Statement match reuses a ledger row already cleared in an earlier statement. Unmatch this unreconciled line and select its genuine source.");
			let t = a.ledgerIds.map((e) => n.find((t) => t.id === e));
			if (!t.length || t.some((e) => !e || !ce(i.get(e.journalEntryId), r, a.date) || e.correctionOnly || e.correctionIssue) || id(t.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== a.amount) throw Error("Statement match is stale. Revert the statement line and review its ledger sources before reconciling.");
		}
		let a = t.flatMap((e) => e.ledgerIds);
		return Zs.complete({
			...e,
			clearedTransactionIds: [.../* @__PURE__ */ new Set([...Zs.getClearedTransactionIds(e.bankAccountId), ...a])]
		});
	}
}, yd = e({
	id: ad,
	key: E(),
	bankAccountId: ad,
	date: ad,
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
	ledgerIds: s(ad),
	journalEntryId: E().optional(),
	fingerprint: E().optional(),
	history: s(e({
		action: E(),
		date: E(),
		reason: E().optional()
	}))
}).strict();
i("bankStatements", {
	repository: vd,
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
	snapshot: () => ({ lines: od }),
	restore: (e) => {
		od = e.lines;
	},
	validate: (t, n) => {
		let r = e({ lines: s(yd) }).strict().parse(t), i = n, a = i.bankAccounts.bankAccounts, o = i.journals.journalEntries, c = /* @__PURE__ */ new Set(), l = new Map(o.map((e) => [e.id, e])), u = new Map(o.flatMap((e) => e.lines.map((t) => [e.id + ":" + t.id, {
			journal: e,
			entry: t
		}])));
		if (new Set(r.lines.map((e) => e.key)).size !== r.lines.length) throw Error("Duplicate bank statement import key.");
		for (let t of r.lines) {
			let n = a.find((e) => e.id === t.bankAccountId);
			if (!n) throw Error("Bank statement account is missing.");
			try {
				w(t.date), _d.parse({
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
				c.add(e), o = id(o + a.debit - a.credit);
			}
			if (o !== t.amount) throw Error("Bank statement amount does not match its ledger links.");
			if (t.status === "MATCHED") {
				if (t.journalEntryId || t.fingerprint) throw Error("Matched bank statements cannot claim categorisation journals.");
			} else {
				let r = l.get(t.journalEntryId ?? ""), i = t.history.filter((e) => e.action === "Posted").length - 1, a = r?.lines.filter((e) => e.accountId === n.glAccountId).map((e) => r.id + ":" + e.id).sort();
				if (!r || r.status !== "POSTED" || r.sourceType !== "BANK_STATEMENT" || r.sourceId !== t.id + ":" + i || r.journalDate !== t.date || JSON.stringify(a) !== JSON.stringify([...t.ledgerIds].sort())) throw Error("Bank statement categorisation journal does not match its source.");
				try {
					if (id(s(e({
						accountId: ad,
						amount: f().finite().positive().refine((e) => id(e) === e),
						taxCode: ad
					}).strict()).min(1).max(100).parse(JSON.parse(t.fingerprint ?? "")).reduce((e, t) => e + t.amount, 0)) !== Math.abs(t.amount)) throw Error("Wrong split total.");
				} catch {
					throw Error("Bank statement categorisation fingerprint is invalid.");
				}
			}
		}
	},
	publish: ld
});
//#endregion
//#region src/features/bank-rules/ruleState.ts
var bd = [], xd = () => bd, Sd = (e) => {
	bd = e;
}, Cd = E().trim().min(1).max(200), wd = E().regex(/^[a-f0-9]{64}$/), Td = E().trim().min(3).max(2e3), Ed = (e) => Array.isArray(e) ? e.map(Ed) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, Ed(e[t])])) : e, Dd = (e) => Oe("sha256").update(JSON.stringify(Ed(e))).digest("hex"), Od = /* @__PURE__ */ new Map();
function kd(e, t) {
	let n = t.bankStatements.lines.find((t) => t.id === e);
	if (!n) throw Error("Statement line not found.");
	let r = {
		lineId: e,
		description: n.description,
		date: n.date,
		amount: n.amount,
		lineToken: Dd(n),
		status: "No match",
		reason: "No enabled rule matches."
	};
	if (n.status !== "UNMATCHED") return {
		...r,
		status: "Blocked",
		reason: "Only unmatched statement lines can be classified."
	};
	let i = t.workspace_bank_rules.records.filter((e) => e.status === "Active" && e.enabled !== "No" && ks(e, n));
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
		ruleToken: Dd(s)
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
		Qn(n.date), M();
	} catch (e) {
		return f(e.message);
	}
	return t.journals.journalEntries.filter((e) => e.status === "POSTED" && e.journalDate <= n.date).some((e) => e.lines.some((e) => e.accountId === l.glAccountId && Math.round((e.debit - e.credit) * 100) === Math.round(n.amount * 100))) ? f("An equal signed bank ledger entry exists. Review and match its genuine source before categorising.") : {
		...c,
		status: "Ready",
		reason: "Unique highest-priority rule; review the saved categorisation before posting."
	};
}
var Ad = (e) => ({
	operationId: e.operationId,
	action: e.action,
	actorId: e.actorId,
	at: e.at,
	reason: e.reason,
	previewDigest: e.previewDigest,
	automatic: e.automatic
});
function jd(e, t, n, r, i) {
	let a = O.require("banking.write"), o = (/* @__PURE__ */ new Date()).toISOString(), s = {
		operationId: e,
		action: "Applied",
		actorId: a.userId,
		at: o,
		reason: r,
		previewDigest: n,
		automatic: i
	}, c = Dd({
		...s,
		decisions: t
	}), l = t.map((e) => ({
		id: ke(),
		...s,
		fingerprint: c,
		decision: e
	}));
	return Sd([...xd(), ...l]), structuredClone(l);
}
function Md(e, t, n, r) {
	let i = O.require("banking.write"), a = xd().filter((t) => t.operationId === e);
	if (a.length && (a[0].actorId !== i.userId || a[0].previewDigest !== t || a[0].reason !== n || a[0].action !== r)) throw Error("Operation ID has different bank-rule data.");
	return a.length ? structuredClone(a) : void 0;
}
function Nd(e, n) {
	O.require("banking.write");
	let r = t(), i = e.map((e) => kd(e, r)).filter((e) => e.status === "Ready" && r.workspace_bank_rules.records.some((t) => t.id === e.ruleId && t.automatic === "Yes"));
	i.length && jd("auto-rule:" + n, i, Dd(r), "Automatic classification of newly imported statement lines", !0);
}
var Pd = {
	preview(n) {
		let r = O.require("banking.read"), i = e({ lineIds: s(Cd).min(1).max(100) }).strict().parse(n);
		if (new Set(i.lineIds).size !== i.lineIds.length) throw Error("Select each line once.");
		let a = t(), o = i.lineIds.map((e) => kd(e, a)), c = Dd({
			nonce: ke(),
			actor: r.userId,
			snapshot: a,
			rows: o
		}), l = Date.now() + 3e5;
		for (let [e, t] of Od) t.expires < Date.now() && Od.delete(e);
		return Od.size >= 100 && Od.delete(Od.keys().next().value), Od.set(c, {
			actor: r.userId,
			expires: l,
			snapshot: Dd(a),
			rows: o
		}), {
			digest: c,
			expiresAt: new Date(l).toISOString(),
			rows: o
		};
	},
	apply(n) {
		let r = O.require("banking.write"), i = e({
			operationId: Cd,
			expectedDigest: wd,
			reason: Td
		}).strict().parse(n), a = Md(i.operationId, i.expectedDigest, i.reason, "Applied");
		if (a) return a;
		let o = Od.get(i.expectedDigest), s = t();
		if (!o || o.actor !== r.userId || o.expires < Date.now() || o.snapshot !== Dd(s)) throw Error("Rule preview expired or business data changed. Preview again.");
		let c = o.rows.map((e) => kd(e.lineId, s));
		if (c.some((e) => e.status !== "Ready")) throw Error("Every selected line must have a unique eligible classification.");
		if (c.some((e) => {
			let t = xd().findLast((t) => t.decision.lineId === e.lineId);
			return t?.action === "Applied" && t.decision.lineToken === e.lineToken;
		})) throw Error("A saved classification already exists. Withdraw it before replacing it.");
		return jd(i.operationId, c, i.expectedDigest, i.reason, !1);
	},
	current(n) {
		O.require("banking.read");
		let r = e({ lineId: Cd }).strict().parse(n), i = xd().findLast((e) => e.decision.lineId === r.lineId);
		if (!i || i.action !== "Applied") return null;
		let a = kd(r.lineId, t());
		return a.status === "Ready" && Dd(a) === Dd(i.decision) ? structuredClone(a) : null;
	},
	post(n) {
		O.require("banking.write");
		let r = e({ receiptId: Cd }).strict().parse(n), i = xd().find((e) => e.id === r.receiptId);
		if (!i || i.action !== "Applied" || xd().findLast((e) => e.decision.lineId === i.decision.lineId)?.id !== i.id) throw Error("Saved classification changed. Review again.");
		let a = t().bankStatements.lines.find((e) => e.id === i.decision.lineId);
		if (!a) throw Error("Statement line not found.");
		let o = [{
			accountId: i.decision.accountId,
			amount: Math.abs(i.decision.amount),
			taxCode: i.decision.taxCode
		}];
		if (a.status !== "POSTED" && !Pd.current({ lineId: a.id })) throw Error("Saved classification is stale or blocked. Review the source and rule before posting.");
		return vd.post({
			id: a.id,
			splits: o
		});
	},
	withdraw(n) {
		let r = O.require("banking.write"), i = e({
			operationId: Cd,
			receiptId: Cd,
			reason: Td
		}).strict().parse(n), a = Md(i.operationId, Dd({ receiptId: i.receiptId }), i.reason, "Withdrawn");
		if (a) return a;
		let o = xd().find((e) => e.id === i.receiptId);
		if (!o || xd().findLast((e) => e.decision.lineId === o.decision.lineId)?.id !== o.id || o.action !== "Applied") throw Error("Classification changed. Refresh first.");
		let s = t().bankStatements.lines.find((e) => e.id === o.decision.lineId);
		if (!s || s.status !== "UNMATCHED") throw Error("Processed lines use their normal unmatch or reversal workflow.");
		let c = {
			operationId: i.operationId,
			action: "Withdrawn",
			actorId: r.userId,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			reason: i.reason,
			previewDigest: Dd({ receiptId: i.receiptId }),
			automatic: !1
		}, l = {
			id: ke(),
			...c,
			decision: o.decision,
			fingerprint: Dd({
				...c,
				decisions: [o.decision]
			})
		};
		return Sd([...xd(), l]), [structuredClone(l)];
	}
}, Fd = e({
	lineId: Cd,
	description: E().min(1).max(1e3),
	date: Cd,
	amount: f().finite(),
	status: b("Ready"),
	ruleId: Cd,
	ruleName: Cd,
	accountId: Cd,
	taxCode: Cd,
	reason: E().min(1).max(2e3),
	lineToken: wd,
	ruleToken: wd
}).strict(), Id = e({
	id: de(),
	operationId: Cd,
	fingerprint: wd,
	action: T(["Applied", "Withdrawn"]),
	actorId: Cd,
	at: Me(),
	reason: Td,
	previewDigest: wd,
	automatic: y(),
	decision: Fd
}).strict();
i("bankRuleApplications", {
	repository: Pd,
	read: "banking.read",
	commands: {
		preview: "banking.read",
		apply: "banking.write",
		withdraw: "banking.write",
		current: "banking.read",
		post: "banking.write"
	},
	snapshot: () => ({ receipts: xd() }),
	restore: (e) => Sd(e.receipts),
	publish: () => {},
	validate: (t, n) => {
		let { receipts: r } = e({ receipts: s(Id) }).strict().parse(t), i = n, a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
		for (let e of r) {
			let t = i.bankStatements.lines.find((t) => t.id === e.decision.lineId), n = o.get(e.decision.lineId);
			if (!t || t.date !== e.decision.date || t.amount !== e.decision.amount || t.description !== e.decision.description || !i.accounts.accounts.some((t) => t.id === e.decision.accountId) || !i.workspace_bank_rules.records.some((t) => t.id === e.decision.ruleId) || !i.workspace_tax_codes.records.some((t) => t.code === e.decision.taxCode)) throw Error("Invalid saved bank-rule source or action references.");
			if (e.action === "Withdrawn" && (!n || n.action !== "Applied" || Dd(n.decision) !== Dd(e.decision) || e.previewDigest !== Dd({ receiptId: n.id }) || e.automatic)) throw Error("Invalid bank-rule withdrawal lifecycle.");
			if (e.action === "Applied" && n?.action === "Applied" && n.decision.lineToken === e.decision.lineToken) throw Error("Duplicate saved bank classification.");
			o.set(e.decision.lineId, e), a.set(e.operationId, [...a.get(e.operationId) ?? [], e]);
		}
		for (let e of a.values()) {
			let t = e[0];
			if (e.some((e) => Dd(Ad(e)) !== Dd(Ad(t)) || e.fingerprint !== t.fingerprint) || new Set(e.map((e) => e.decision.lineId)).size !== e.length || Dd({
				...Ad(t),
				decisions: e.map((e) => e.decision)
			}) !== t.fingerprint) throw Error("Invalid bank-rule batch receipt.");
		}
	}
});
//#endregion
//#region src/features/recurring/recurringDates.ts
var Ld = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
];
function Rd(e, t, n) {
	if (w(e), !Number.isSafeInteger(n) || n < 0 || !Ld.includes(t)) throw Error("Invalid schedule occurrence.");
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
function zd(e, t) {
	w(e);
	let n = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	n.setUTCDate(n.getUTCDate() + t);
	let r = n.toISOString().slice(0, 10);
	return w(r), r;
}
//#endregion
//#region src/features/direct-documents/managedDocumentRepository.ts
var Y = E().trim().min(1).max(200), Bd = E().trim().max(2e3).optional(), Vd = e({
	requestedArea: f().finite().positive().max(1e9).optional(),
	productId: Y,
	unitId: Y,
	quantity: f().positive().finite(),
	unitPrice: f().nonnegative().finite().optional(),
	priceBasis: T(["Inclusive", "Exclusive"]).optional()
}).strict(), Hd = e({
	description: E().trim().min(1).max(500),
	accountId: Y,
	quantity: f().positive().finite(),
	unitCost: f().nonnegative().finite(),
	taxCode: Y,
	priceBasis: T(["Inclusive", "Exclusive"]).optional()
}).strict(), Ud = e({
	kind: T(["ORDER", "INVOICE"]),
	customerId: Y,
	pricingAt: Y.optional(),
	pricingTimezone: Y.optional(),
	locationId: Y.or(b("")).optional(),
	accountingContactId: Y.or(b("")).optional(),
	documentDate: Y,
	dueDate: Y.optional(),
	customerReference: Bd,
	notes: Bd,
	lines: s(Vd).min(1).max(500)
}).strict(), Wd = e({
	kind: b("EXPENSE"),
	supplierId: Y,
	supplierInvoiceNumber: Y,
	documentDate: Y,
	dueDate: Y,
	notes: Bd,
	lines: s(Hd).min(1).max(500)
}).strict(), Gd = (e) => he([Ud, Wd]).parse(e), Kd = f().finite().nonnegative().refine((e) => Number.isSafeInteger(Math.round(e * 100)) && e === Math.round(e * 100) / 100, "Use an amount in whole cents within the supported range."), qd = e({
	operationId: Y,
	sourceName: E().trim().max(200),
	reviewed: y(),
	declared: e({
		subtotal: Kd,
		taxAmount: Kd,
		total: Kd
	}).strict(),
	payload: Wd.extend({ notes: E().trim().max(1e3).optional() })
}).strict();
function Jd(e) {
	return {
		...e.payload,
		notes: [
			e.payload.notes,
			`Reviewed source: ${e.sourceName || "Manual entry"}`,
			`Declared net / tax / total: ${e.declared.subtotal.toFixed(2)} / ${e.declared.taxAmount.toFixed(2)} / ${e.declared.total.toFixed(2)}`
		].filter(Boolean).join("\n")
	};
}
function Yd(e) {
	let t = pn.getById(e.payload.supplierId);
	if (!t || t.status !== "ACTIVE") throw Error("Select an active supplier.");
	let n = cf(e.payload), r = e.payload.supplierInvoiceNumber.trim().toLowerCase(), i = Bi.getAll(), a = new Set(i.filter((e) => e.status === "VOID").map((e) => e.id)), o = [...Qd.filter((t) => t.operationId !== e.operationId && t.status !== "CANCELLED" && !(t.status === "POSTED" && t.documentId && a.has(t.documentId)) && t.payload.kind === "EXPENSE" && t.payload.supplierId === e.payload.supplierId && t.payload.supplierInvoiceNumber.trim().toLowerCase() === r).map((e) => ({
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
var Xd = () => P.getAll().filter((e) => e.active && e.type === "EXPENSE" && e.allowManualPosting && (!e.systemRole || e.systemRole === "OPERATING_EXPENSE" || e.systemRole === "FREIGHT")).map((e) => ({
	id: e.id,
	code: e.code,
	name: e.name
}));
Xd();
var Zd = [], Qd = [], $d = 0, ef = /* @__PURE__ */ new Set(), tf = () => {
	$d++, ef.forEach((e) => e());
}, nf = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function rf(e, t) {
	return {
		action: e,
		actorId: O.current()?.userId ?? "local-test",
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...t ? { reason: t } : {}
	};
}
function af(e) {
	for (let t of e) if (t.taxAmount) for (let [e, n] of [[t.taxCollectedAccountId, "LIABILITY"], [t.taxPaidAccountId, "ASSET"]]) {
		if (!e) continue;
		let t = P.requireById(e);
		if (!t.active || t.type !== n) throw Error("A snapshotted tax posting account is no longer active or has the wrong type.");
	}
}
function of(e) {
	let t = P.requireById(e);
	if (!t.active || t.type !== "EXPENSE" || !t.allowManualPosting || t.systemRole && t.systemRole !== "OPERATING_EXPENSE" && t.systemRole !== "FREIGHT") throw Error("Use an active manual expense account, not an inventory, GRNI or control account.");
	return t;
}
function sf(e) {
	let t = e.payload;
	if (t.kind === "EXPENSE") {
		let n = pn.getById(t.supplierId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active supplier.");
		for (let t of e.lines) of(t.expenseAccountId);
	} else {
		let n = W.getById(t.customerId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active customer.");
		for (let t of e.lines) Qt(t.productId, t.unitId, t.quantity, "sell");
	}
	af(e.lines);
}
function cf(e) {
	if (w(e.documentDate, "Document date"), e.dueDate && (w(e.dueDate, "Due date"), e.dueDate < e.documentDate)) throw Error("Due date cannot precede document date.");
	if (e.kind !== "ORDER" && !e.dueDate) throw Error("Due date is required.");
	let t = e.kind === "EXPENSE" ? void 0 : tc(e.documentDate, e.pricingAt, e.pricingTimezone), n = e.kind === "EXPENSE" ? e.lines.map((e) => {
		of(e.accountId);
		let t = r(e.taxCode), n = De(e.unitCost, t.taxRate, e.priceBasis), i = nf(e.quantity * n), a = (e.priceBasis ?? C().basis) === "Inclusive" ? nf(e.quantity * e.unitCost - i) : nf(i * t.taxRate);
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
			lineTotal: nf(i + a)
		};
	}) : e.lines.map((n) => Ml({
		customerId: e.customerId,
		documentDate: e.documentDate,
		pricingContext: t,
		draft: n
	})), i = jl(n);
	if (i.total <= 0 || !Number.isFinite(i.total)) throw Error("Document total must be finite and greater than zero.");
	return {
		lines: n,
		totals: i
	};
}
function lf(t) {
	let n = () => t === "sales" ? Zd : Qd;
	function r(e) {
		return t === "sales" ? Zd = [...Zd.filter((t) => t.id !== e.id), e] : Qd = [...Qd.filter((t) => t.id !== e.id), e], tf(), e;
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
			history: [...e.history, rf(t, i)]
		});
	}
	let s = (e, t) => df.save({
		operationId: e,
		payload: t
	});
	return {
		getAll: () => le(n()),
		reviewCapture(e) {
			if (O.require("purchases.bill"), t !== "expense") throw Error("Capture is only available for expense bills.");
			return Yd(qd.parse(e));
		},
		capture(e) {
			if (O.require("purchases.bill"), t !== "expense") throw Error("Capture is only available for expense bills.");
			let r = qd.parse(e);
			if (!r.reviewed) throw Error("Confirm that the supplier document has been reviewed.");
			let i = Jd(r);
			if (n().find((e) => e.operationId === r.operationId)) return s(r.operationId, i);
			let a = Yd(r);
			if (!a.matches) throw Error(a.issues.join(" "));
			return s(r.operationId, i);
		},
		save(o) {
			let s = e({
				operationId: Y,
				id: Y.optional(),
				expectedRevision: f().int().positive().optional(),
				payload: t === "sales" ? Ud : Wd
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
				let e = l?.payload.kind === "EXPENSE" ? void 0 : l?.payload, t = e && e.documentDate === s.payload.documentDate && (!s.payload.pricingAt || s.payload.pricingAt === e.pricingAt), n = tc(s.payload.documentDate, s.payload.pricingAt ?? (t ? e.pricingAt : void 0), t ? e.pricingTimezone : C().timezone);
				s.payload = {
					...s.payload,
					...n
				};
			}
			let u = cf(s.payload), d = (/* @__PURE__ */ new Date()).toISOString(), p = {
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
				recipient: s.payload.kind === "EXPENSE" ? void 0 : Ec(s.payload.customerId, s.payload),
				...u,
				createdAt: l?.createdAt ?? d,
				updatedAt: d,
				history: [...l?.history ?? [], rf(l ? "Edited" : "Created")]
			};
			if (l && l.kind !== p.kind) throw Error("Document kind cannot change.");
			return sf(p), r(p);
		},
		approve(e, t) {
			let n = i(e);
			if (n.status === "APPROVED" && n.revision === t + 1) return n;
			if (a(n, t), n.status !== "DRAFT") throw Error("Only a draft can be approved.");
			return sf(n), o(n, "Approved", { status: "APPROVED" });
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
			M(), Qn(n.payload.documentDate), sf(n);
			let r, s = n.payload;
			if (s.kind === "EXPENSE") {
				let e = pn.getById(s.supplierId), t = (/* @__PURE__ */ new Date()).toISOString(), i = {
					id: crypto.randomUUID(),
					managedDraftId: n.id,
					kind: "EXPENSE",
					billNumber: we("BILL", Bi.getAll().map((e) => e.billNumber), s.documentDate.slice(0, 4)),
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
				Bi.insertExpenseBill(i);
				let a = i.lines.filter((e) => e.lineSubtotal !== 0).map((e) => ({
					accountId: e.expenseAccountId,
					description: e.description,
					debit: e.lineSubtotal,
					credit: 0
				}));
				F.post({
					journalDate: i.billDate,
					description: "Expense bill " + i.billNumber,
					reference: i.supplierInvoiceNumber,
					sourceType: "SUPPLIER_BILL",
					sourceId: i.id,
					lines: [
						...a,
						...zn(i.lines, "paid", !0, i.totals.taxAmount),
						{
							accountId: P.requireBySystemRole("ACCOUNTS_PAYABLE").id,
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
				r = s.kind === "ORDER" ? K.createManagedOrder(e).id : K.createManagedInvoice({
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
			return K.cancelManagedOrder(n.documentId, t), o(n, "Order cancelled", {}, t);
		}
	};
}
var uf = lf("sales"), df = lf("expense"), ff = e({
	recipient: e({
		locationId: E().optional(),
		locationName: E().optional(),
		deliveryAddress: E().optional(),
		accountingContactId: E().optional(),
		accountingContactName: E().optional(),
		accountingEmail: E().email().optional()
	}).strict().optional(),
	id: Y,
	operationId: Y,
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
	payload: he([Ud, Wd]),
	lines: s(e({
		id: Y,
		description: E().min(1),
		quantity: f().finite().positive(),
		unitSymbol: E().min(1),
		unitPrice: f().finite().nonnegative().optional(),
		unitCost: f().finite().nonnegative().optional(),
		taxRate: f().finite().min(0).max(1),
		taxCode: Y,
		taxPaidAccountId: Y.optional(),
		taxCollectedAccountId: Y.optional(),
		lineSubtotal: f().finite().nonnegative(),
		taxAmount: f().finite().nonnegative(),
		lineTotal: f().finite().nonnegative()
	}).passthrough()).min(1),
	totals: e({
		subtotal: f().finite(),
		taxAmount: f().finite(),
		total: f().finite()
	}),
	documentId: Y.optional(),
	createdAt: Y,
	updatedAt: Y,
	history: s(e({
		action: Y,
		actorId: Y,
		at: Y,
		reason: E().optional()
	}).strict()).min(1)
}).strict();
for (let t of ["sales", "expense"]) i(t === "sales" ? "managedSalesDocuments" : "expenseBillDrafts", {
	repository: t === "sales" ? uf : df,
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
	snapshot: () => t === "sales" ? { drafts: Zd } : {
		drafts: Qd,
		options: Xd()
	},
	restore: (e) => {
		t === "sales" ? Zd = e.drafts : (Qd = e.drafts, e.options);
	},
	publish: tf,
	validate: (n, r) => {
		let { drafts: i } = e({
			drafts: s(ff),
			...t === "expense" ? { options: s(e({
				id: Y,
				code: Y,
				name: Y
			}).strict()) } : {}
		}).strict().parse(n);
		for (let e of i) {
			if (Dc(e.recipient), e.kind !== e.payload.kind || t === "expense" != (e.kind === "EXPENSE")) throw Error("Draft kind mismatch.");
			if (w(e.payload.documentDate), e.payload.dueDate && (w(e.payload.dueDate), e.payload.dueDate < e.payload.documentDate)) throw Error("Draft due date is invalid.");
			let n = r, i = e.payload.kind === "EXPENSE" ? e.payload.supplierId : e.payload.customerId;
			if (!(e.payload.kind === "EXPENSE" ? n.suppliers.suppliers : n.customers.customers).some((e) => e.id === i) || e.lines.length !== e.payload.lines.length) throw Error("Draft party or line references are invalid.");
			for (let [t, r] of e.lines.entries()) {
				let i = e.payload.lines[t], a = r;
				if (e.kind !== "EXPENSE") {
					if (ac(a), nc(a, e.payload.documentDate), e.payload.kind !== "EXPENSE" && (e.payload.pricingAt !== a.pricingAt || e.payload.pricingTimezone !== a.pricingTimezone)) throw Error("Draft pricing context mismatch.");
					if (Jt(a, n.products.products.find((e) => e.id === a.productId)), a.requestedArea !== i.requestedArea) throw Error("Draft area requirement mismatch.");
				}
				if (typeof a.quantity != "number" || !Number.isFinite(a.quantity) || a.quantity <= 0 || i.requestedArea === void 0 && a.quantity !== i.quantity || nf(a.lineSubtotal + a.taxAmount) !== a.lineTotal) throw Error("Draft line amounts are invalid.");
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
				if (nf(e.lines.reduce((e, t) => e + t[n], 0)) !== e.totals[t]) throw Error("Draft totals do not match lines.");
			}
			if (e.status === "POSTED") {
				let t = r;
				if (!(e.kind === "EXPENSE" ? t.supplierBills.supplierBills : e.kind === "ORDER" ? t.sales.salesOrders : t.sales.invoices).some((t) => t.id === e.documentId && t.managedDraftId === e.id && t.totals.total === e.totals.total)) throw Error("Posted draft source reference is invalid.");
			}
		}
	}
});
function pf(e) {
	if ([...Zd, ...Qd].some((t) => e.has(t.id) && (t.status !== "DRAFT" || t.documentId))) throw Error("Only unposted drafts may be purged.");
	Zd = Zd.filter((t) => !e.has(t.id)), Qd = Qd.filter((t) => !e.has(t.id)), tf();
}
//#endregion
//#region src/features/recurring/recurringRepository.ts
var mf = E().trim().min(1).max(200), hf = E().refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), gf = e({
	operationId: mf,
	name: mf,
	sourceDraftId: mf,
	frequency: T(Ld),
	firstDate: hf,
	endDate: hf
}).strict(), _f = e({
	id: mf,
	expectedRevision: f().int().positive(),
	name: mf,
	endDate: hf
}).strict(), vf = E().refine((e) => Number.isFinite(Date.parse(e)), "Invalid timestamp."), yf = e({
	id: mf,
	name: mf,
	kind: T(["INVOICE", "EXPENSE"]),
	status: T([
		"Active",
		"Paused",
		"Ended"
	]),
	revision: f().int().positive(),
	operationId: mf,
	creationFingerprint: E().min(1).max(2e3),
	sourceDraftId: mf,
	payload: ye(),
	frequency: T(Ld),
	firstDate: hf,
	nextDate: hf,
	endDate: hf,
	occurrence: f().int().nonnegative(),
	termsDays: f().int().nonnegative(),
	createdAt: vf,
	updatedAt: vf
}).strict(), bf = e({
	id: mf,
	scheduleId: mf,
	date: hf,
	draftId: mf,
	actorId: mf,
	createdAt: vf
}).strict(), xf = 0, Sf = /* @__PURE__ */ new Set(), Cf = () => {
	xf++, Sf.forEach((e) => e());
}, wf = {
	INVOICE: {
		schedules: [],
		runs: []
	},
	EXPENSE: {
		schedules: [],
		runs: []
	}
}, Tf = (e) => e === "INVOICE" ? "sales.manage" : "purchases.bill", Ef = (e) => e === "INVOICE" ? uf : df, Df = () => (/* @__PURE__ */ new Date()).toISOString();
function Of(e) {
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
function kf(t) {
	let n = () => wf[t], r = (e) => {
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
			O.require(Tf(t));
			let r = gf.parse(e), i = JSON.stringify(r), a = n().schedules.find((e) => e.operationId === r.operationId);
			if (a) {
				if (a.creationFingerprint !== i) throw Error("Operation ID was used for a different recurring template.");
				return a;
			}
			let o = Ef(t).getAll().find((e) => e.id === r.sourceDraftId);
			if (!o || o.kind !== t || o.status === "CANCELLED") throw Error("Select an existing invoice or expense entry draft of the correct type.");
			if (r.endDate < r.firstDate) throw Error("End date must not precede first generation date.");
			let s = Of(o), c = Math.round((Date.parse(s.dueDate + "T00:00:00Z") - Date.parse(s.documentDate + "T00:00:00Z")) / 864e5), l = Df(), u = {
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
			return n().schedules = [...n().schedules, u], Cf(), u;
		},
		update(e) {
			O.require(Tf(t));
			let a = _f.parse(e), o = r(a.id);
			if (i(o, a.expectedRevision), a.endDate < o.firstDate || o.occurrence && a.endDate < n().runs.filter((e) => e.scheduleId === o.id).map((e) => e.date).sort().at(-1)) throw Error("End date cannot precede the schedule start or its last generated occurrence.");
			let s = {
				...o,
				name: a.name,
				endDate: a.endDate,
				status: o.nextDate > a.endDate ? "Ended" : o.status === "Ended" ? "Paused" : o.status,
				revision: o.revision + 1,
				updatedAt: Df()
			};
			return n().schedules = n().schedules.map((e) => e.id === o.id ? s : e), Cf(), s;
		},
		setStatus(a) {
			O.require(Tf(t));
			let o = e({
				id: mf,
				expectedRevision: f().int().positive(),
				status: T(["Active", "Paused"])
			}).strict().parse(a), s = r(o.id);
			if (i(s, o.expectedRevision), s.nextDate > s.endDate) throw Error("Extend the end date before resuming this ended schedule.");
			let c = {
				...s,
				status: o.status,
				revision: s.revision + 1,
				updatedAt: Df()
			};
			return n().schedules = n().schedules.map((e) => e.id === s.id ? c : e), Cf(), c;
		},
		generate(a) {
			O.require(Tf(t));
			let o = e({
				id: mf,
				expectedRevision: f().int().positive(),
				date: hf
			}).strict().parse(a), s = r(o.id), c = n().runs.find((e) => e.scheduleId === s.id && e.date === o.date);
			if (c) return {
				schedule: s,
				run: c,
				draft: Ef(t).getAll().find((e) => e.id === c.draftId)
			};
			if (i(s, o.expectedRevision), s.status !== "Active") throw Error("Activate the schedule before generating.");
			if (o.date !== s.nextDate) throw Error("Generate the next occurrence in order.");
			if (o.date > ve(Df())) throw Error("This occurrence is not due yet.");
			if (o.date > s.endDate) throw Error("The schedule has ended.");
			let l = Rd(s.firstDate, s.frequency, s.occurrence + 1), u = structuredClone(s.payload);
			u.documentDate = o.date, u.kind !== "EXPENSE" && (delete u.pricingAt, delete u.pricingTimezone), u.dueDate = zd(o.date, s.termsDays), u.kind === "EXPENSE" && (u.supplierInvoiceNumber = u.supplierInvoiceNumber.slice(0, 170) + " [" + o.date + "]");
			let d = Ef(t).save({
				operationId: "recurring:" + s.id + ":" + o.date,
				payload: u
			}), p = Df(), m = {
				id: crypto.randomUUID(),
				scheduleId: s.id,
				date: o.date,
				draftId: d.id,
				actorId: O.current().userId,
				createdAt: p
			}, h = {
				...s,
				nextDate: l,
				occurrence: s.occurrence + 1,
				status: l > s.endDate ? "Ended" : "Active",
				revision: s.revision + 1,
				updatedAt: p
			};
			return n().schedules = n().schedules.map((e) => e.id === s.id ? h : e), n().runs = [...n().runs, m], Cf(), {
				schedule: h,
				run: m,
				draft: d
			};
		}
	};
}
var Af = kf("INVOICE"), jf = kf("EXPENSE");
for (let t of ["INVOICE", "EXPENSE"]) i(t === "INVOICE" ? "recurringInvoices" : "recurringExpenses", {
	repository: t === "INVOICE" ? Af : jf,
	read: t === "INVOICE" ? "sales.read" : "purchases.read",
	commands: {
		create: Tf(t),
		update: Tf(t),
		setStatus: Tf(t),
		generate: Tf(t)
	},
	snapshot: () => structuredClone(wf[t]),
	restore: (e) => {
		wf[t] = e;
	},
	publish: Cf,
	validate: (n, r) => {
		e({
			schedules: s(yf),
			runs: s(bf)
		}).strict().parse(n);
		let i = n, a = r;
		for (let e of i.schedules) {
			if (e.kind !== t || ![
				"Active",
				"Paused",
				"Ended"
			].includes(e.status) || !Number.isSafeInteger(e.revision) || e.revision < 1 || !Number.isSafeInteger(e.occurrence) || e.occurrence < 0 || !Number.isInteger(e.termsDays) || e.termsDays < 0 || e.payload.kind !== t) throw Error("Invalid recurring schedule.");
			if (gf.parse({
				operationId: e.operationId,
				name: e.name,
				sourceDraftId: e.sourceDraftId,
				frequency: e.frequency,
				firstDate: e.firstDate,
				endDate: e.endDate
			}), Gd(e.payload), !e.id || !e.creationFingerprint || !Number.isFinite(Date.parse(e.createdAt)) || !Number.isFinite(Date.parse(e.updatedAt))) throw Error("Invalid recurring identity or audit timestamps.");
			if (w(e.payload.documentDate), w(e.payload.dueDate), e.payload.dueDate < e.payload.documentDate || e.termsDays !== Math.round((Date.parse(e.payload.dueDate + "T00:00:00Z") - Date.parse(e.payload.documentDate + "T00:00:00Z")) / 864e5)) throw Error("Invalid recurring payment terms.");
			if (e.payload.kind === "EXPENSE") {
				if (!a.suppliers.suppliers.some((t) => t.id === e.payload.supplierId) || e.payload.lines.some((e) => !a.accounts.accounts.some((t) => t.id === e.accountId && t.type === "EXPENSE"))) throw Error("Recurring expense references are invalid.");
			} else if (!a.customers.customers.some((t) => t.id === e.payload.customerId) || e.payload.lines.some((e) => !a.products.products.some((t) => t.id === e.productId && t.units.some((t) => t.id === e.unitId)))) throw Error("Recurring invoice references are invalid.");
			if (e.status === "Ended" != e.nextDate > e.endDate) throw Error("Recurring end status is inconsistent.");
			if (e.nextDate !== Rd(e.firstDate, e.frequency, e.occurrence) || e.endDate < e.firstDate) throw Error("Invalid recurring dates.");
			let n = (t === "INVOICE" ? a.managedSalesDocuments : a.expenseBillDrafts).drafts.find((t) => t.id === e.sourceDraftId);
			if (!n || n.kind !== t) throw Error("Recurring template source is missing.");
			let r = i.runs.filter((t) => t.scheduleId === e.id);
			if (r.length !== e.occurrence || new Set(r.map((e) => e.date)).size !== r.length) throw Error("Recurring run history does not match schedule.");
			for (let t = 0; t < r.length; t++) if (!r.some((n) => n.date === Rd(e.firstDate, e.frequency, t))) throw Error("Recurring occurrences are incomplete.");
		}
		for (let e of i.runs) {
			let n = i.schedules.find((t) => t.id === e.scheduleId), r = (t === "INVOICE" ? a.managedSalesDocuments : a.expenseBillDrafts).drafts.find((t) => t.id === e.draftId);
			if (!n || !r || r.kind !== t || r.operationId !== "recurring:" + n.id + ":" + e.date || !e.actorId || !Number.isFinite(Date.parse(e.createdAt))) throw Error("Invalid recurring generated-draft reference.");
		}
	}
});
//#endregion
//#region src/features/banking/data/bankTransactionRepository.ts
var Mf = /* @__PURE__ */ new Set(), Nf = k.read().transactions, Pf = k.read().transfers;
k.onRollback(() => {
	let e = k.read();
	Nf = e.transactions, Pf = e.transfers;
});
function Ff() {
	Mf.forEach((e) => k.notify(e));
}
function If(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function Lf(e) {
	return e?.trim() || void 0;
}
function Rf(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function zf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Bf(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Vf(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var Hf = {
	subscribe(e) {
		return Mf.add(e), () => {
			Mf.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return Nf;
	},
	getTransfersSnapshot() {
		return Pf;
	},
	getTransactions() {
		return Nf;
	},
	getTransfers() {
		return Pf;
	},
	createTransaction(e, t) {
		if (Rf(e.transactionDate), w(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = zf(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = If(e.description, "Description"), i = I.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let a = P.requireById(i.glAccountId);
		if (!a.active) throw Error("The selected bank GL account is inactive.");
		let o = P.requireById(e.offsetAccountId);
		if (!o.active) throw Error("The offset account is inactive.");
		if (!o.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (o.id === a.id) throw Error("Bank and offset accounts must be different.");
		if (I.getByGlAccountId(o.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let s = Bf("banktxn"), c = Vf("BTXN", e.transactionDate, Nf.length + 1), l = t?.trim();
		if (t !== void 0 && !l) throw Error("Operation ID cannot be empty");
		if (l) {
			let t = A.begin(l, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Nf.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			l && A.bindResult(l, s);
			let t = F.post({
				journalDate: e.transactionDate,
				description: r,
				reference: Lf(e.reference),
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
				reference: Lf(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [u, ...Nf];
			if (k.update("transactions", d), Nf = d, Ff(), l) {
				let e = F.getBySource("BANK_TRANSACTION", s);
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
		Rf(e.transferDate), w(e.transferDate, "Transfer date");
		let n = zf(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = If(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = I.requireById(e.fromBankAccountId), a = I.requireById(e.toBankAccountId);
		if (!i.active || !a.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== a.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < a.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let o = P.requireById(i.glAccountId), s = P.requireById(a.glAccountId);
		if (!o.active || !s.active) throw Error("Both bank GL accounts must be active.");
		if (o.id === s.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let c = Bf("banktrf"), l = Vf("BTRF", e.transferDate, Pf.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = A.begin(u, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Pf.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			u && A.bindResult(u, c);
			let t = F.post({
				journalDate: e.transferDate,
				description: r,
				reference: Lf(e.reference),
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
				reference: Lf(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [d, ...Pf];
			if (k.update("transfers", f), Pf = f, Ff(), u) {
				let e = F.getBySource("BANK_TRANSFER", c);
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
}, Uf = Hf.createTransaction;
Hf.createTransaction = function(e, t) {
	M();
	let n;
	try {
		return n = k.transaction(() => Uf.call(Hf, e, t)), t && A.complete(t.trim(), n.id), n;
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
var Wf = Hf.createTransfer;
Hf.createTransfer = function(e, t) {
	M();
	let n;
	try {
		return n = k.transaction(() => Wf.call(Hf, e, t)), t && A.complete(t.trim(), n.id), n;
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
function Gf(e) {
	if (Nf.some((t) => t.id === e.id) || Pf.some((t) => t.id === e.id)) throw Error("Bank result already exists; restoration cannot duplicate it.");
	"transactionNumber" in e ? (Nf = [structuredClone(e), ...Nf], k.update("transactions", Nf)) : (Pf = [structuredClone(e), ...Pf], k.update("transfers", Pf)), Ff();
}
function Kf(e, t, n) {
	if ([...Nf, ...Pf].filter((n) => n.id === e && n.journalEntryId === t).length !== 1) throw Error("Bank result changed before journal repair.");
	Nf = Nf.map((t) => t.id === e ? {
		...t,
		journalEntryId: n
	} : t), Pf = Pf.map((t) => t.id === e ? {
		...t,
		journalEntryId: n
	} : t), k.update("transactions", Nf), k.update("transfers", Pf), Ff();
}
i("bankTransactions", {
	repository: Hf,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: Nf,
		bankTransfers: Pf
	}),
	restore: (e) => {
		Nf = e.bankTransactions, Pf = e.bankTransfers;
	},
	publish: () => Mf.forEach((e) => e())
});
//#endregion
//#region src/features/recurring/recurringBankRepository.ts
var qf = E().trim().min(1).max(200), Jf = E().refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}), Yf = Me(), Xf = e({
	bankAccountId: qf,
	direction: T(["MONEY_IN", "MONEY_OUT"]),
	amount: f().finite().positive().max(0xe8d4a51000).refine((e) => e === Math.round(e * 100) / 100, "Use whole cents."),
	offsetAccountId: qf,
	description: qf,
	reference: E().trim().max(200).optional().transform((e) => e || void 0)
}).strict(), Zf = e({
	operationId: qf,
	name: qf,
	payload: Xf,
	frequency: T(Ld),
	firstDate: Jf,
	endDate: Jf
}).strict(), Qf = Zf.extend({
	id: qf,
	kind: b("BANK"),
	creationFingerprint: E(),
	status: T([
		"Active",
		"Paused",
		"Ended"
	]),
	revision: f().int().positive(),
	nextDate: Jf,
	occurrence: f().int().nonnegative(),
	createdAt: Yf,
	updatedAt: Yf
}), $f = e({
	id: qf,
	action: T([
		"Generated",
		"Approved",
		"Posted",
		"Cancelled"
	]),
	actorId: qf,
	at: Yf,
	reason: E().trim().min(3).max(2e3).optional()
}).strict(), ep = e({
	id: qf,
	scheduleId: qf,
	date: Jf,
	payload: Xf,
	status: T([
		"DRAFT",
		"APPROVED",
		"POSTED",
		"CANCELLED"
	]),
	revision: f().int().positive(),
	actorId: qf,
	createdAt: Yf,
	updatedAt: Yf,
	approvedBy: qf.optional(),
	transactionId: qf.optional(),
	reason: E().max(2e3).optional(),
	history: s($f).min(1)
}).strict(), tp = [], np = [], rp = 0, ip = /* @__PURE__ */ new Set(), ap = () => {
	rp++, ip.forEach((e) => e());
};
function op(e) {
	let t = I.requireById(e.bankAccountId), n = P.requireById(t.glAccountId), r = P.requireById(e.offsetAccountId);
	if (!t.active || !n.active || !r.active || !r.allowManualPosting || I.getByGlAccountId(r.id) || r.systemRole && !["OPERATING_EXPENSE", "FREIGHT"].includes(r.systemRole)) throw Error("Use an active bank and an eligible manual offset account; control accounts require their source workflow.");
}
function sp(e) {
	let t = tp.find((t) => t.id === e);
	if (!t) throw Error("Recurring bank schedule not found.");
	return t;
}
function cp(e, t) {
	if (e.revision !== t) throw Error("Recurring bank record changed. Refresh first.");
}
var lp = e({
	id: qf,
	expectedRevision: f().int().positive()
}).strict(), up = {
	getAll: () => tp,
	getDrafts: () => np,
	create(e) {
		O.require("banking.write");
		let t = Zf.parse(e), n = JSON.stringify(t), r = tp.find((e) => e.operationId === t.operationId);
		if (r) {
			if (r.creationFingerprint !== n) throw Error("Operation ID has different bank template data.");
			return r;
		}
		if (op(t.payload), t.endDate < t.firstDate) throw Error("End date precedes first date.");
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
		return tp = [...tp, a], ap(), a;
	},
	update(e) {
		O.require("banking.write");
		let t = lp.extend({
			name: qf,
			endDate: Jf
		}).parse(e), n = sp(t.id);
		if (cp(n, t.expectedRevision), t.endDate < n.firstDate || np.some((e) => e.scheduleId === n.id && e.date > t.endDate)) throw Error("End date cannot precede existing occurrences.");
		let r = {
			...n,
			name: t.name,
			endDate: t.endDate,
			status: n.nextDate > t.endDate ? "Ended" : n.status === "Ended" ? "Paused" : n.status,
			revision: n.revision + 1,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return tp = tp.map((e) => e.id === n.id ? r : e), ap(), r;
	},
	setStatus(e) {
		O.require("banking.write");
		let t = lp.extend({ status: T(["Active", "Paused"]) }).parse(e), n = sp(t.id);
		if (cp(n, t.expectedRevision), n.nextDate > n.endDate) throw Error("Extend the schedule before resuming.");
		let r = {
			...n,
			status: t.status,
			revision: n.revision + 1,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return tp = tp.map((e) => e.id === n.id ? r : e), ap(), r;
	},
	generate(e) {
		let t = O.require("banking.write"), n = lp.extend({ date: Jf }).parse(e), r = sp(n.id), i = np.find((e) => e.scheduleId === r.id && e.date === n.date);
		if (i) return {
			schedule: r,
			draft: i
		};
		if (cp(r, n.expectedRevision), r.status !== "Active" || n.date !== r.nextDate || n.date > r.endDate || n.date > ve((/* @__PURE__ */ new Date()).toISOString())) throw Error("Generate an active due bank occurrence in order.");
		op(r.payload);
		let a = I.requireById(r.payload.bankAccountId);
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
		}, c = Rd(r.firstDate, r.frequency, r.occurrence + 1), l = {
			...r,
			nextDate: c,
			occurrence: r.occurrence + 1,
			status: c > r.endDate ? "Ended" : "Active",
			revision: r.revision + 1,
			updatedAt: o
		};
		return np = [...np, s], tp = tp.map((e) => e.id === r.id ? l : e), ap(), {
			schedule: l,
			draft: s
		};
	},
	review(e) {
		let t = O.require("banking.write"), n = lp.extend({
			action: T([
				"Approve",
				"Post",
				"Cancel"
			]),
			reason: E().trim().min(3).max(2e3)
		}).parse(e), r = np.find((e) => e.id === n.id);
		if (!r) throw Error("Recurring bank draft not found.");
		if (n.action === "Post" && r.status === "POSTED") return r;
		cp(r, n.expectedRevision);
		let i;
		if (n.action === "Approve") {
			if (r.status !== "DRAFT") throw Error("Only draft bank occurrences can be approved.");
			op(r.payload), i = {
				...r,
				status: "APPROVED",
				approvedBy: t.userId
			};
		} else if (n.action === "Post") {
			if (O.require("accounting.post"), r.status !== "APPROVED") throw Error("Review and approve the bank draft before posting.");
			op(r.payload), Qn(r.date);
			let e = Hf.createTransaction({
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
		}, np = np.map((e) => e.id === i.id ? i : e), ap(), i;
	}
};
i("recurringBank", {
	repository: up,
	read: "banking.read",
	commands: {
		create: "banking.write",
		update: "banking.write",
		setStatus: "banking.write",
		generate: "banking.write",
		review: "banking.write"
	},
	snapshot: () => ({
		schedules: tp,
		drafts: np
	}),
	restore: (e) => {
		tp = e.schedules, np = e.drafts;
	},
	publish: ap,
	validate: (t, n) => {
		let r = e({
			schedules: s(Qf),
			drafts: s(ep)
		}).strict().parse(t), i = n;
		if (new Set(r.schedules.map((e) => e.operationId)).size !== r.schedules.length) throw Error("Duplicate recurring bank creation request.");
		for (let e of r.schedules) {
			let t = r.drafts.filter((t) => t.scheduleId === e.id);
			if (e.nextDate !== Rd(e.firstDate, e.frequency, e.occurrence) || e.endDate < e.firstDate || e.status === "Ended" != e.nextDate > e.endDate || t.length !== e.occurrence || new Set(t.map((e) => e.date)).size !== t.length || !i.bankAccounts.bankAccounts.some((t) => t.id === e.payload.bankAccountId) || !i.accounts.accounts.some((t) => t.id === e.payload.offsetAccountId)) throw Error("Invalid recurring bank schedule or references.");
			for (let n = 0; n < t.length; n++) if (!t.some((t) => t.date === Rd(e.firstDate, e.frequency, n))) throw Error("Missing recurring bank occurrence.");
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
var dp = [
	"INVOICE",
	"EXPENSE",
	"BANK"
], fp = (e) => e === "INVOICE" ? "sales.manage" : e === "EXPENSE" ? "purchases.bill" : "banking.write", pp = (e) => e === "INVOICE" ? "sales.read" : e === "EXPENSE" ? "purchases.read" : "banking.read", mp = E().trim().min(1).max(200), hp = T(dp), gp = Me(), _p = E().refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}), vp = e({
	id: hp,
	enabled: y(),
	revision: f().int().positive(),
	actorId: mp,
	updatedAt: gp
}).strict(), yp = e({
	id: mp,
	status: T([
		"FAILED",
		"RETRY",
		"RESOLVED"
	]),
	actorId: mp,
	at: gp,
	reason: E().min(1).max(2e3)
}).strict(), bp = e({
	id: mp,
	kind: hp,
	scheduleId: mp,
	date: _p,
	status: T([
		"FAILED",
		"RETRY",
		"RESOLVED"
	]),
	revision: f().int().positive(),
	attempts: f().int().positive(),
	error: E().min(1).max(2e3),
	actorId: mp,
	updatedAt: gp,
	draftId: mp.optional(),
	history: s(yp).min(1)
}).strict(), xp = [], Sp = [], Cp = 0, wp = /* @__PURE__ */ new Set(), Tp = () => {
	Cp++, wp.forEach((e) => e());
}, Ep = (e) => e === "INVOICE" ? Af : e === "EXPENSE" ? jf : up, Dp = () => dp.flatMap((e) => Ep(e).getAll().map((t) => ({
	...t,
	kind: e
})));
function Op(e) {
	let t = ve((/* @__PURE__ */ new Date()).toISOString());
	return Dp().filter((n) => g(e, fp(n.kind)) && xp.some((e) => e.id === n.kind && e.enabled) && n.status === "Active" && n.nextDate <= t && n.nextDate <= n.endDate && !Sp.some((e) => e.kind === n.kind && e.scheduleId === n.id && e.date === n.nextDate && e.status === "FAILED")).sort((e, t) => e.nextDate.localeCompare(t.nextDate) || e.kind.localeCompare(t.kind) || e.id.localeCompare(t.id));
}
var kp = /* @__PURE__ */ new Map();
function Ap(e, t, n, r) {
	let i = O.require(fp(e)), a = crypto.randomUUID();
	return kp.set(a, {
		kind: e,
		scheduleId: t,
		date: n,
		error: r.slice(0, 2e3) || "Generation failed.",
		actor: i.userId
	}), a;
}
function jp() {
	Sp = Sp.map((e) => {
		if (e.status === "RESOLVED") return e;
		let t = Ep(e.kind), n = e.kind === "BANK" ? up.getDrafts().find((t) => t.scheduleId === e.scheduleId && t.date === e.date) : "getRuns" in t ? t.getRuns().find((t) => t.scheduleId === e.scheduleId && t.date === e.date) : void 0;
		if (!n) return e;
		let r = O.current().userId, i = (/* @__PURE__ */ new Date()).toISOString();
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
			let e = O.require("inventory.read");
			return {
				today: ve((/* @__PURE__ */ new Date()).toISOString()),
				due: Op(e).length,
				limit: 20
			};
		},
		configure(t) {
			let n = e({
				kind: hp,
				enabled: y(),
				expectedRevision: f().int().nonnegative()
			}).strict().parse(t), r = O.require(fp(n.kind)), i = xp.find((e) => e.id === n.kind);
			if ((i?.revision ?? 0) !== n.expectedRevision) throw Error("Automation policy changed. Refresh first.");
			let a = {
				id: n.kind,
				enabled: n.enabled,
				revision: (i?.revision ?? 0) + 1,
				actorId: r.userId,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			return xp = [...xp.filter((e) => e.id !== n.kind), a], Tp(), a;
		},
		execute(t) {
			let n = e({
				kind: hp,
				id: mp,
				expectedRevision: f().int().positive(),
				date: _p
			}).strict().parse(t);
			O.require(fp(n.kind));
			let r = Ep(n.kind).generate({
				id: n.id,
				expectedRevision: n.expectedRevision,
				date: n.date
			});
			return jp(), Tp(), r;
		},
		recordFailure(t) {
			let n = e({ ticket: mp }).strict().parse(t), r = kp.get(n.ticket);
			if (kp.delete(n.ticket), !r) throw Error("Only a trusted failed desktop attempt can enter the error queue.");
			let i = O.require(fp(r.kind));
			if (i.userId !== r.actor) throw Error("Failure actor changed.");
			let a = Ep(r.kind).getAll().find((e) => e.id === r.scheduleId);
			if (!a || a.nextDate !== r.date) throw Error("Failed occurrence is no longer current.");
			let o = Sp.find((e) => e.kind === r.kind && e.scheduleId === r.scheduleId && e.date === r.date), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
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
			return Sp = [...Sp.filter((e) => e.id !== c.id), c], Tp(), c;
		},
		retry(t) {
			let n = e({
				id: mp,
				expectedRevision: f().int().positive(),
				reason: E().trim().min(3).max(2e3)
			}).strict().parse(t), r = Sp.find((e) => e.id === n.id);
			if (!r) throw Error("Recurring error not found.");
			let i = O.require(fp(r.kind));
			if (r.revision !== n.expectedRevision || r.status !== "FAILED") throw Error("Error queue changed. Refresh first.");
			jp();
			let a = Sp.find((e) => e.id === r.id);
			if (a.status === "RESOLVED") return Tp(), a;
			let o = Ep(r.kind).getAll().find((e) => e.id === r.scheduleId);
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
			return Sp = Sp.map((e) => e.id === c.id ? c : e), Tp(), c;
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
		policies: xp,
		tasks: Sp
	}),
	restore: (e) => {
		xp = e.policies, Sp = e.tasks;
	},
	publish: Tp,
	view: (e) => ({
		policies: xp.filter((t) => g(e, pp(t.id))),
		tasks: Sp.filter((t) => g(e, pp(t.kind)))
	}),
	validate: (t, n) => {
		let r = e({
			policies: s(vp),
			tasks: s(bp)
		}).strict().parse(t), i = n;
		if (new Set(r.policies.map((e) => e.id)).size !== r.policies.length || new Set(r.tasks.map((e) => e.kind + ":" + e.scheduleId + ":" + e.date)).size !== r.tasks.length) throw Error("Duplicate recurring automation identity.");
		for (let e of r.tasks) {
			let t = i[e.kind === "INVOICE" ? "recurringInvoices" : e.kind === "EXPENSE" ? "recurringExpenses" : "recurringBank"], n = t.schedules.find((t) => t.id === e.scheduleId), r = e.history.at(-1), a = n && ["Monthly", "Quarterly"].includes(n.frequency), o = (n ? a ? (Number(e.date.slice(0, 4)) - Number(n.firstDate.slice(0, 4))) * 12 + Number(e.date.slice(5, 7)) - Number(n.firstDate.slice(5, 7)) : (Date.parse(e.date + "T00:00:00Z") - Date.parse(n.firstDate + "T00:00:00Z")) / 864e5 : NaN) / (a ? n.frequency === "Monthly" ? 1 : 3 : n?.frequency === "Weekly" ? 7 : 14);
			if (!n || !Number.isSafeInteger(o) || o < 0 || Rd(n.firstDate, n.frequency, o) !== e.date || e.date < n.firstDate || r.status !== e.status || r.actorId !== e.actorId || r.at !== e.updatedAt || e.revision !== e.history.length || e.attempts !== e.history.filter((e) => e.status === "FAILED").length || e.history[0].status !== "FAILED" || new Set(e.history.map((e) => e.id)).size !== e.history.length) throw Error("Invalid recurring error evidence.");
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
function Mp(e) {
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
var Np = (e) => Math.round(e * 100);
function Pp(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + Np(t.amount), 0), s = a.reduce((e, t) => e + Np(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (Np(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), Np(t.amountDue) !== Math.max(0, Np(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > Np(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + Np(t.amount), 0);
		Np(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || Np(t.amountAvailable) !== 0 : Np(t.amountAvailable) !== Np(t.totals.total) - a - Np(t.amountRefunded ?? 0)) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
function Fp(e) {
	let n = A.list(), r = n.find((t) => t.operationId === e), i = [];
	if (!r || r.kind !== "BANK_RECONCILIATION" || r.state !== "MANUAL_REVIEW") return ["Operation is not an unresolved bank reconciliation review."];
	if (!r.resultId) return ["Operation has no durable bound result; cannot infer clearing."];
	r.reviewHistory?.length || i.push("Operator reconciliation evidence is missing.");
	let a = Zs.getAll(), o = a.filter((e) => e.id === r.resultId);
	if (o.length !== 1) return [...i, "Completed reconciliation result is missing or duplicated."];
	let s = o[0], c = I.getById(s.bankAccountId), l = F.getAll();
	if (!c) return [...i, "Reconciliation bank account is missing."];
	let u = (e) => JSON.stringify([...e].sort()), d = (e) => Math.round((e + 2 ** -52) * 100) / 100, f = a.filter((e) => e.bankAccountId === c.id && e.statementDate <= s.statementDate), p = t().bankStatements?.lines ?? [];
	try {
		i.push(...Hs({
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
var Ip = (e) => e === "BANK_TRANSACTION" || e === "BANK_TRANSFER";
function Lp(e, t, n = !0) {
	let r = A.list(), i = r.filter((t) => t.operationId === e);
	if (i.length !== 1) return ["Bank operation identity is missing or duplicated."];
	let a = i[0], o = [];
	if ((!Ip(a.kind) || (n ? a.state !== "MANUAL_REVIEW" : a.state === "COMPLETED")) && o.push("Operation is not an unresolved bank review."), a.resultId || o.push("Operation has no durable bound result; cannot infer effects."), n && !a.reviewHistory?.length && o.push("Operator reconciliation evidence is missing."), o.length) return o;
	let s = t?.transactions ?? Hf.getTransactions(), c = t?.transfers ?? Hf.getTransfers(), l = t?.journals ?? F.getAll(), u = a.kind === "BANK_TRANSACTION" ? s : c;
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
	let b, x, te = P.getAll();
	if (a.kind === "BANK_TRANSACTION") {
		let e = I.getById(d.bankAccountId), t = te.find((e) => e.id === d.offsetAccountId);
		(!e || !t || !t.allowManualPosting || e.glAccountId === t.id || I.getByGlAccountId(t.id) || v < e.openingBalanceDate) && o.push("Bank or offset account mapping is invalid."), ["MONEY_IN", "MONEY_OUT"].includes(d.direction) || o.push("Bank direction is invalid."), b = d.direction === "MONEY_IN" ? e?.glAccountId : t?.id, x = d.direction === "MONEY_IN" ? t?.id : e?.glAccountId;
	} else {
		let e = I.getById(f.fromBankAccountId), t = I.getById(f.toBankAccountId);
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
function Rp(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= Vp(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: Hp(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => zp(e, r)), a = Hp(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && Bp(t, r)), s = Hp(o.reduce((e, t) => e + t.amount, 0)), c = Hp(e.totals.total), l = Hp(Math.max(0, c - a - s));
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
function zp(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Vp(e.reversedAt) : !1;
}
function Bp(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Vp(e.reversedAt) : !1;
}
function Vp(e) {
	return ve(e);
}
function Hp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function Up(e, t, n) {
	let r = Kp(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= Gp(e.voidedAt)) return Wp(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && Bp(t, n)), a = Kp(i.reduce((e, t) => e + t.amount, 0)), o = Kp(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - a));
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
function Wp(e, t, n) {
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
function Gp(e) {
	return ve(e);
}
function Kp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function qp(e, t, n = [], r = [], i = [], a = Xp()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = Rp(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = Jp(e.dueDate, a);
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
		current: Zp(s.current),
		days1To30: Zp(s.days1To30),
		days31To60: Zp(s.days31To60),
		days61To90: Zp(s.days61To90),
		days90Plus: Zp(s.days90Plus)
	}, p = Zp(c), m = Zp(l), h = Zp(i.reduce((t, n) => n.customerId === e.id ? t + Up(n, r, a).amountAvailable : t, 0)), g = Zp(p - h);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: h,
		netAccountBalance: g,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: Zp(Math.max(0, e.creditLimit - Math.max(0, g))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function Jp(e, t = Xp()) {
	let n = Yp(e), r = Yp(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Yp(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function Xp() {
	return ve((/* @__PURE__ */ new Date()).toISOString());
}
function Zp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function Qp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function $p(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function em(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? Qp(t - n) : Qp(n - t);
}
function tm(e, t, n) {
	$p(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = Qp(t + r.debit), n = Qp(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: em(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = Qp(r.reduce((e, t) => e + t.totalDebit, 0)), o = Qp(r.reduce((e, t) => e + t.totalCredit, 0));
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
function nm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function rm({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = qp(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: nm(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = nm(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = nm(tm(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = nm(l - d);
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
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function im(e) {
	return Mp({
		transactions: e?.transactions ?? Hf.getTransactions(),
		transfers: e?.transfers ?? Hf.getTransfers(),
		payments: zl.getAll(),
		journals: e?.journals ?? F.getAll(),
		invoices: K.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: G.getAll(),
		supplierBills: Bi.getAll(),
		supplierPayments: qi.getAll(),
		supplierCredits: J.getAll()
	});
}
//#endregion
//#region src/features/sales/data/salesRecoveryInspection.ts
var am = {
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
function om(e) {
	return Pp(e).map((e) => ({
		...e,
		action: am[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var sm = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function cm(e, t) {
	let n = om(e).map((e) => ({ ...e })), r = t.filter((e) => sm.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => sm.has(e.kind))) s.has(e.operationId) && n.push({
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
function lm() {
	let e = K.getAll();
	return cm({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: zl.getAll(),
		creditNotes: G.getAll(),
		allocations: G.getAllAllocations(),
		journals: F.getAll()
	}, A.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
function um(e) {
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
var dm = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function fm(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!dm.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = cm(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function pm() {
	let e = K.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: zl.getAll(),
		creditNotes: G.getAll(),
		allocations: G.getAllAllocations(),
		journals: F.getAll()
	};
}
function mm(e) {
	let n = [], r = pm(), i = A.list().find((t) => t.operationId === e), a = r.payments.find((e) => e.id === i?.resultId), o = (e) => Math.round(e * 100), s = (e) => {
		let t = /* @__PURE__ */ new Map();
		for (let n of e) t.set(n.accountId, (t.get(n.accountId) ?? 0) + o(n.debit) - o(n.credit));
		return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
	};
	if (a && ["CUSTOMER_PAYMENT", "SALES_PAYMENT_REVERSAL"].includes(i.kind)) {
		let e = r.journals.find((e) => e.sourceType === "CUSTOMER_PAYMENT" && e.sourceId === a.id && !e.reversedJournalEntryId), i = P.getAll().find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE"), s = I.getById(a.bankAccountId)?.glAccountId;
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
		].sort().at(-1) ?? "1970-01-01", t = rm({
			accounts: P.getAll(),
			journalEntries: [...r.journals],
			asOfDate: e,
			customers: W.getAll(),
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
function hm(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = h("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [e]
		});
		return Te(t.view), t.result;
	}
	if (typeof e.approvalReference != "string" || e.approvalReference.length > 500) throw Error("Provide an approval reference of 3–500 characters.");
	let t = A.list(), n = t.find((t) => t.operationId === e.operationId);
	if (!n || !e.expectedRevision || um(n) !== e.expectedRevision) throw Error("Recovery evidence changed. Refresh and review before approval.");
	let r = n.kind === "BANK_RECONCILIATION" ? Fp(e.operationId) : Ip(n.kind) ? Lp(e.operationId) : fm(pm(), t, e.operationId);
	n.kind !== "BANK_RECONCILIATION" && !Ip(n.kind) && r.push(...mm(e.operationId));
	let i = im();
	if (i.length && r.push("Financial consistency checks failed: " + i.map((e) => e.code).join(", ")), r.length) throw Error(`Financial recovery remains blocked: ${r.join(" ")}`);
	let a = t.find((t) => t.operationId === e.operationId);
	return {
		closed: A.closeReviewed(e.operationId, a.resultId, e.approvalReference, e.approver),
		remaining: lm()
	};
}
//#endregion
//#region src/features/purchases/data/supplierBillBalanceAsAtService.ts
function gm(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && _m(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = vm(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && _m(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = vm(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && _m(n.reversedAt) <= r ? t : t + n.amount, 0)), o = vm(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: vm(Math.max(0, o - i - a))
	};
}
function _m(e) {
	return ve(e);
}
function vm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function ym(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && bm(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = xm(e.totals.total), i = xm(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && bm(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: xm(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - i))
	};
}
function bm(e) {
	return ve(e);
}
function xm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function Sm(e, t, n = [], r = [], i = [], a = km()) {
	let o = Tm(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = gm(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = wm(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = Om(r.reduce((t, n) => n.supplierId === e.id ? t + ym(n, i, a).amountAvailable : t, 0)), p = Om(s), m = Om(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: Om(c),
		aging: Em(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function Cm(e, t, n = [], r = [], i = [], a = km()) {
	let o = Tm(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let h of e) {
		let e = Sm(h, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: Om(s),
		unallocatedCredit: Om(c),
		totalOutstanding: Om(l),
		overdueAmount: Om(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: Em(o)
	};
}
function wm(e, t = km()) {
	let n = Dm(e), r = Dm(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Tm() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function Em(e) {
	return {
		current: Om(e.current),
		days1To30: Om(e.days1To30),
		days31To60: Om(e.days31To60),
		days61To90: Om(e.days61To90),
		days90Plus: Om(e.days90Plus)
	};
}
function Dm(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function Om(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function km() {
	return ve((/* @__PURE__ */ new Date()).toISOString());
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function Am(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function jm({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = Cm(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = Am(tm(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = Am(c.totalOutstanding), f = Am(d - u);
	return {
		asOfDate: s,
		grossOutstanding: Am(c.grossOutstanding),
		unallocatedCredit: Am(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function Mm(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function Nm(e) {
	return e.slice(0, 10);
}
function Pm(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function Fm(e, t) {
	Mm(t);
	let n = e.filter((e) => Nm(e.occurredAt) <= t).slice().sort(Pm), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = L(n.quantityOnHand + e.quantityBase), a = br(n.inventoryValue + e.valueChange);
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
		let t = Nr.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = Xt(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : yr(e.inventoryValue / e.quantityOnHand);
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
		totalQuantity: L(i.reduce((e, t) => e + t.quantityOnHand, 0)),
		totalInventoryValue: br(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function Im(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Lm(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function Rm({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	Lm(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = Fm(n, r), o = Im(tm(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = Im(a.totalInventoryValue), c = Im(s - o);
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
var zm = br, Bm = (e) => /^\d{4}-\d{2}-\d{2}$/.test(e) && !Number.isNaN(Date.parse(`${e}T00:00:00Z`)) && (/* @__PURE__ */ new Date(`${e}T00:00:00Z`)).toISOString().slice(0, 10) === e, Vm = (e) => Date.parse(`${e}T00:00:00Z`), Hm = (e) => e <= 30 ? "CURRENT" : e <= 60 ? "31_60" : e <= 90 ? "61_90" : "OVER_90";
function Um(e) {
	let { filters: t, receipts: n, matches: r, journals: i, grniAccountId: a } = e;
	if (!Bm(t.asOfDate)) throw Error("Invalid GRNI as-of date.");
	if (t.receiptDateFrom && !Bm(t.receiptDateFrom)) throw Error("Invalid receipt start date.");
	if (t.receiptDateTo && !Bm(t.receiptDateTo)) throw Error("Invalid receipt end date.");
	let o = [];
	for (let e of n) if (!(e.status !== "POSTED" || e.receiptDate > t.asOfDate) && !(t.supplierId && e.supplierId !== t.supplierId) && !(t.purchaseOrderId && e.purchaseOrderId !== t.purchaseOrderId) && !(t.goodsReceiptId && e.id !== t.goodsReceiptId) && !(t.siteId && e.siteId !== t.siteId) && !(t.receiptDateFrom && e.receiptDate < t.receiptDateFrom) && !(t.receiptDateTo && e.receiptDate > t.receiptDateTo)) for (let n of e.lines) {
		let i = r.filter((r) => r.goodsReceiptId === e.id && r.goodsReceiptLineId === n.id && (r.accountingDate ?? r.createdAt.slice(0, 10)) <= t.asOfDate && (!(r.reversalAccountingDate ?? r.reversedAt?.slice(0, 10)) || (r.reversalAccountingDate ?? r.reversedAt.slice(0, 10)) > t.asOfDate) && (r.status === "ACTIVE" || !!r.reversedAt)), a = L(i.reduce((e, t) => e + t.matchedQuantity, 0)), s = zm(i.reduce((e, t) => e + t.matchedReceiptValue, 0)), c = Sr({
			quantityBase: n.receivedBaseQuantity,
			unitCostBase: xr({
				transactionUnitCost: n.unitCost,
				conversionToBase: n.conversionToBase
			})
		}), l = L(n.receivedQuantity - a), u = zm(c - s);
		if (l < -1e-4 || u < -.01) throw Error(`Overmatched receipt line: ${e.receiptNumber}/${n.id}`);
		if (t.outstandingOnly && l <= 0 && Math.abs(u) < .005) continue;
		let d = Math.max(0, Math.floor((Vm(t.asOfDate) - Vm(e.receiptDate)) / 864e5));
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
			agingBucket: Hm(d)
		});
	}
	let s = {
		receivedValue: zm(o.reduce((e, t) => e + t.receivedValue, 0)),
		matchedValue: zm(o.reduce((e, t) => e + t.matchedValue, 0)),
		outstandingValue: zm(o.reduce((e, t) => e + t.outstandingValue, 0))
	}, c = {
		CURRENT: 0,
		"31_60": 0,
		"61_90": 0,
		OVER_90: 0
	};
	for (let e of o) c[e.agingBucket] = zm(c[e.agingBucket] + e.outstandingValue);
	let l = !!(t.supplierId || t.purchaseOrderId || t.goodsReceiptId || t.siteId || t.receiptDateFrom || t.receiptDateTo), u = 0;
	for (let e of i) if (!(e.journalDate > t.asOfDate)) for (let t of e.lines) t.accountId === a && (u += t.credit - t.debit);
	return u = zm(u), {
		asOfDate: t.asOfDate,
		rows: o,
		totals: s,
		aging: c,
		glCreditBalance: u,
		difference: l ? NaN : zm(s.outstandingValue - u)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseAccountingReconciliationService.ts
var Wm = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Gm(e) {
	let { asOfDate: t, accounts: n, journalEntries: r, costMovements: i, receipts: a, matches: o } = e, s = (e) => {
		let t = n.find((t) => t.systemRole === e);
		if (!t) throw Error(`Missing accounting control account: ${e}`);
		return t;
	}, c = s("INVENTORY"), l = s("GRNI"), u = s("PURCHASE_PRICE_VARIANCE");
	if (c.type !== "ASSET" || l.type !== "LIABILITY" || u.type !== "EXPENSE") throw Error("Purchase reconciliation control account types are invalid.");
	let d = Rm({
		accounts: n,
		journalEntries: r,
		costMovements: i,
		asOfDate: t
	}), f = Um({
		filters: { asOfDate: t },
		receipts: a,
		matches: o,
		journals: r,
		grniAccountId: l.id
	}), p = Wm(o.filter((e) => (e.accountingDate ?? e.createdAt.slice(0, 10)) <= t && (!(e.reversalAccountingDate ?? e.reversedAt?.slice(0, 10)) || (e.reversalAccountingDate ?? e.reversedAt.slice(0, 10)) > t) && (e.status === "ACTIVE" || !!e.reversedAt)).reduce((e, t) => e + t.priceVariance, 0)), m = Wm(r.filter((e) => e.journalDate <= t).flatMap((e) => e.lines).filter((e) => e.accountId === u.id).reduce((e, t) => e + t.debit - t.credit, 0)), h = (e, t, n) => {
		let r = Wm(t - n);
		return {
			accountId: e.id,
			accountCode: e.code,
			accountName: e.name,
			subledger: Wm(t),
			generalLedger: Wm(n),
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
function Km(e) {
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
function qm(e) {
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
var Jm = E().trim().min(1).max(200), Ym = E().regex(/^[a-f0-9]{64}$/), Xm = E().trim().min(3).max(200), Zm = e({
	operationId: Jm,
	expectedDigest: Ym,
	reference: Xm,
	summary: E().trim().min(10).max(4e3),
	businessChecked: b(!0),
	glChecked: b(!0),
	externalEvidenceChecked: b(!0)
}).strict(), Qm = e({
	operationId: Jm,
	proposalId: Jm,
	expectedDigest: Ym,
	approvalReference: Xm,
	confirm: b(!0)
}).strict(), $m = (e) => Math.round(e * 100), eh = (e) => e / 100;
function th(e) {
	return Array.isArray(e) ? e.map(th) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).sort(([e], [t]) => e.localeCompare(t)).map(([e, t]) => [e, th(t)])) : e;
}
var nh = (e) => Oe("sha256").update(JSON.stringify(th(e))).digest("hex"), rh = [
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_PAYMENT_REVERSAL",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL"
];
function ih(e) {
	return {
		...e.sales,
		payments: e.customerPayments.payments,
		creditNotes: e.customerCredits.creditNotes,
		allocations: e.customerCredits.allocations,
		journals: e.journals.journalEntries
	};
}
function ah(e, t) {
	return nh(e) === nh(t);
}
function oh(t, n) {
	let r = ih(n), i = [];
	if (t.kind === "CUSTOMER_PAYMENT") {
		let n = e({
			customerId: Jm,
			invoiceId: Jm,
			paymentDate: Jm,
			amount: f().finite().positive(),
			method: Jm,
			bankAccountId: Jm,
			reference: E().optional(),
			notes: E().optional()
		}).strict().parse(JSON.parse(t.fingerprint));
		i = r.payments.filter((e) => e.status === "RECEIVED" && !e.depositApplicationId && ah(n, {
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
			creditNoteId: Jm,
			invoiceId: Jm,
			allocationDate: Jm,
			amount: f().finite().positive()
		}).strict().parse(JSON.parse(t.fingerprint));
		i = r.allocations.filter((e) => e.status === "APPLIED" && ah(n, {
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: e.amount
		}));
	} else t.kind === "SALES_INVOICE_VOID" ? i = r.invoices.filter((e) => e.id === t.fingerprint && e.status === "VOID") : t.kind === "SALES_PAYMENT_REVERSAL" ? i = r.payments.filter((e) => e.id === t.fingerprint && e.status === "REVERSED") : t.kind === "SALES_CREDIT_REVERSAL" && (i = r.allocations.filter((e) => e.id === t.fingerprint && e.status === "REVERSED"));
	if (!(i.length !== 1 || t.resultId && t.resultId !== i[0].id)) return i[0].id;
}
function sh() {
	let e = t(), n = structuredClone(e), r = A.list(), i = [], a = [], o = nh({
		business: e,
		operations: r.filter((e) => e.kind !== "SOURCE_METADATA_REPAIR")
	}), s = (e, t, n, r, i, o) => {
		ah(r, i) || a.push({
			kind: e,
			id: t.id,
			path: n,
			before: r,
			after: i,
			evidence: o
		});
	}, c = (e) => Number.isFinite(e) && e >= 0 && Number.isSafeInteger($m(e)) && e === eh($m(e));
	for (let [e, t] of [
		["transactions", n.bankTransactions.bankTransactions],
		["transfers", n.bankTransactions.bankTransfers],
		["payments", n.customerPayments.payments],
		["supplierBills", n.supplierBills.supplierBills],
		["supplierPayments", n.supplierPayments.supplierPayments],
		["supplierCredits", n.supplierCredits.supplierCredits],
		["supplierCreditAllocations", n.supplierCredits.allocations],
		["journals", n.journals.journalEntries]
	]) ah(n.financialCache[e], t) || i.push("Financial cache/source copies disagree: " + e + ". Restore a consistent snapshot first.");
	for (let e of n.sales.invoices) {
		if (["VOID", "DRAFT"].includes(e.status)) continue;
		let t = n.customerPayments.payments.filter((t) => t.invoiceId === e.id && t.status === "RECEIVED"), r = n.customerCredits.allocations.filter((t) => t.invoiceId === e.id && t.status === "APPLIED"), a = t.reduce((e, t) => e + $m(t.amount), 0), o = r.reduce((e, t) => e + $m(t.amount), 0), l = $m(e.totals.total);
		if (!c(e.totals.total) || [...t, ...r].some((e) => !c(e.amount) || e.amount <= 0) || a + o > l) {
			i.push("Invalid or excessive invoice settlement: " + e.id);
			continue;
		}
		let u = {
			amountPaid: eh(a),
			amountDue: eh(l - a - o),
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
		}))), r = n.supplierCredits.allocations.filter((t) => t.supplierBillId === e.id && t.status === "APPLIED"), a = t.reduce((e, t) => e + $m(t.amount), 0), o = r.reduce((e, t) => e + $m(t.amount), 0), l = $m(e.totals.total);
		if (!c(e.totals.total) || [...t, ...r].some((t) => !c(t.amount) || t.amount <= 0 || t.supplierId !== e.supplierId) || a + o > l) {
			i.push("Invalid or excessive bill settlement: " + e.id);
			continue;
		}
		let u = {
			amountPaid: eh(a),
			amountCredited: eh(o),
			amountDue: eh(l - a - o),
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
			let t = r.filter((t) => t[e ? "creditNoteId" : "supplierCreditId"] === n.id && t.status === "APPLIED"), a = t.reduce((e, t) => e + $m(t.amount), 0), o = $m(n.amountRefunded ?? 0), l = $m(n.totals.total);
			if (!c(n.totals.total) || !c(n.amountRefunded ?? 0) || t.some((e) => !c(e.amount) || e.amount <= 0) || a + o > l) {
				i.push("Invalid or excessive credit settlement: " + n.id);
				continue;
			}
			let u = {
				amountApplied: eh(a),
				amountAvailable: eh(l - a - o),
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
		if (!rh.includes(e.kind)) {
			i.push("Separate recovery required for " + e.kind + ": " + e.operationId);
			continue;
		}
		let t;
		try {
			t = oh(e, n);
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
		(!c(t.amount) || t.amount <= 0 || r.length !== 1 || r[0].status !== (t.status === "REVERSED" ? "REVERSED" : "POSTED") || r[0].journalDate !== t.paymentDate || !o || !s || r[0].lines.length !== 2 || !r[0].lines.some((e) => e.accountId === o && $m(e.debit) === $m(t.amount) && e.credit === 0) || !r[0].lines.some((e) => e.accountId === s && $m(e.credit) === $m(t.amount) && e.debit === 0)) && i.push("Payment original date, bank/control accounts or amount do not match: " + t.id), e && t.allocations.some((e) => {
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
			for (let n of e) t.set(n.accountId, (t.get(n.accountId) ?? 0) + $m(n.debit) - $m(n.credit));
			return [...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t));
		};
		(t.length !== 1 || t[0].journalDate < e.journalDate || !ah(r(t[0].lines), r(e.lines.map((e) => ({
			...e,
			debit: e.credit,
			credit: e.debit
		}))))) && i.push("Original/reversal account proof failed: " + e.id);
	}
	let p = ih(n), m = r.map((e) => u.has(e.operationId) ? {
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
		i.push(...fm(p, m.map((t) => t.operationId === e ? a : t), e).map((t) => e + ": " + t));
	}
	i.push(...Mp({
		transactions: n.bankTransactions.bankTransactions,
		transfers: n.bankTransactions.bankTransfers,
		payments: p.payments,
		journals: p.journals,
		invoices: p.invoices,
		creditNotes: p.creditNotes,
		supplierBills: n.supplierBills.supplierBills,
		supplierPayments: n.supplierPayments.supplierPayments,
		supplierCredits: n.supplierCredits.supplierCredits
	}).map((e) => e.code + ": " + e.entityId)), i.push(...Pp(p).map((e) => e.code + ": " + e.entityId)), n.financialCache.supplierBills = structuredClone(n.supplierBills.supplierBills), n.financialCache.supplierCredits = structuredClone(n.supplierCredits.supplierCredits);
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
		["AR", () => rm({
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
		["AP", () => jm({
			...g,
			suppliers: n.suppliers.suppliers,
			bills: n.supplierBills.supplierBills,
			payments: n.supplierPayments.supplierPayments,
			credits: n.supplierCredits.supplierCredits,
			creditAllocations: n.supplierCredits.allocations
		})],
		["Inventory/GRNI/PPV", () => Gm({
			...g,
			costMovements: n.costMovements.movements,
			receipts: n.goodsReceipts.goodsReceipts,
			matches: n.receiptMatches.matches
		})],
		["Deposits", () => Km({
			deposits: n.customerDeposits,
			accounts: n.accounts.accounts,
			journals: [...p.journals],
			banks: n.bankAccounts.bankAccounts,
			customers: n.customers.customers,
			asOfDate: h
		})],
		["Prepayments", () => qm({
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
function ch(t) {
	return O.require("audit.read"), e({}).strict().parse(t), sh();
}
function lh(e) {
	let t = O.require("accounting.recover"), n = Zm.parse(e), r = A.list().find((e) => e.operationId === n.operationId), i = JSON.stringify(n);
	if (r) {
		if (r.kind !== "SOURCE_METADATA_REPAIR" || r.state === "COMPLETED" && r.fingerprint !== i) throw Error("Operation ID was used for different recovery data.");
		if (r.fingerprint === i || r.repairProposal?.reference === n.reference && r.repairProposal.evidenceDigest === n.expectedDigest && r.repairProposal.summary === n.summary) return r;
	}
	if (A.getUnresolved().some((e) => e.kind === "SOURCE_METADATA_REPAIR" && e.operationId !== n.operationId)) throw Error("An existing source repair proposal must be reviewed or replaced first.");
	let a = sh();
	if (!a.eligible || a.evidenceDigest !== n.expectedDigest) throw Error("Source repair blocked or evidence changed: " + a.blockers.join(" "));
	return r || (A.begin(n.operationId, "SOURCE_METADATA_REPAIR", i), A.bindResult(n.operationId, n.operationId)), A.recordManualReview(n.operationId, n.reference, t.userId, n.summary), A.attachRepairProposal(n.operationId, {
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
function uh(e) {
	let t = O.require("accounting.recover"), n = Qm.parse(e), r = A.list().find((e) => e.operationId === n.operationId), i = r?.repairProposal;
	if (r?.kind !== "SOURCE_METADATA_REPAIR" || !i || i.id !== n.proposalId || i.evidenceDigest !== n.expectedDigest) throw Error("Source repair proposal changed.");
	if (i.status === "EXECUTED") {
		if (i.approver !== t.userId || i.approvalReference !== n.approvalReference) throw Error("Already executed under another approval.");
		return r;
	}
	if (i.reviewer === t.userId || r.reviewHistory?.some((e) => e.operator === t.userId)) throw Error("A different authorized operator must approve.");
	let a = sh(), o = JSON.parse(i.planJson);
	if (!a.eligible || a.evidenceDigest !== i.evidenceDigest || !ah(a.changes, o.changes)) throw Error("Source repair evidence changed. Refresh and replace the proposal.");
	let s = A.list();
	for (let e of a.changes.filter((e) => e.kind === "OPERATION")) if (s.find((t) => t.operationId === e.id)?.reviewHistory?.some((e) => e.operator === t.userId)) throw Error("Approver recorded review evidence on a source operation. Use another authorized operator.");
	return k.transaction(() => {
		for (let e of a.changes) e.kind === "INVOICE" ? hu(e.id, e.after) : e.kind === "BILL" ? Ui(e.id, e.after) : e.kind === "CUSTOMER_CREDIT" ? ll(e.id, e.after) : e.kind === "SUPPLIER_CREDIT" && Fu(e.id, e.after);
		let e = sh();
		if (e.blockers.some((e) => e !== "No supported source metadata defects found.") || e.changes.some((e) => e.kind !== "OPERATION" && e.kind !== "PURCHASE_OPERATION")) throw Error("Post-repair source verification failed: " + e.blockers.join(" "));
		for (let [e, r] of a.changes.filter((e) => e.kind === "OPERATION").entries()) A.adoptReviewedResult(r.id, String(r.after.resultId)), A.recordManualReview(r.id, i.reference + " / " + e, i.reviewer, "Source repair " + i.id + ": exact request, original GL and settlement verified."), A.closeReviewed(r.id, String(r.after.resultId), n.approvalReference + " / " + e, t.userId);
		for (let e of a.changes.filter((e) => e.kind === "PURCHASE_OPERATION")) j.setStatus(e.id, "POSTED");
		let r = sh();
		if (r.changes.length || r.blockers.some((e) => e !== "No supported source metadata defects found.")) throw Error("Final source verification failed.");
		return A.finishRepair(n.operationId, i.id, t.userId, n.approvalReference, r.evidenceDigest);
	});
}
function dh(t) {
	let n = O.require("accounting.recover"), r = e({
		operationId: Jm,
		proposalId: Jm,
		reason: E().trim().min(10).max(500)
	}).strict().parse(t), i = sh();
	if (i.changes.length || i.blockers.some((e) => e !== "No supported source metadata defects found.")) throw Error("Source defects remain. Replace the reviewed proposal or use validated backup recovery; withdrawal cannot release unresolved source blockers.");
	return A.withdrawSourceRepair(r.operationId, r.proposalId, n.userId, r.reason);
}
//#endregion
//#region electron/security/targetedFinancialRepair.ts
var fh = E().trim().min(1).max(200), ph = E().trim().min(3).max(500), mh = E().trim().min(10).max(4e3), hh = E().regex(/^[a-f0-9]{64}$/), gh = e({ operationId: fh }).strict(), _h = gh.extend({
	expectedDigest: hh,
	reference: ph,
	summary: mh,
	businessChecked: b(!0),
	glChecked: b(!0),
	externalEvidenceChecked: b(!0)
}).strict(), vh = gh.extend({
	proposalId: fh,
	expectedDigest: hh,
	approvalReference: ph,
	confirm: b(!0)
}).strict(), yh = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function bh(e) {
	return Array.isArray(e) ? e.map(bh) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).sort(([e], [t]) => e.localeCompare(t)).map(([e, t]) => [e, bh(t)])) : e;
}
var xh = (e) => Oe("sha256").update(JSON.stringify(bh(e))).digest("hex");
function Sh() {
	return xh({
		business: t(),
		operations: A.list().map(({ repairProposal: e, ...t }) => t)
	});
}
function Ch(e, t) {
	return typeof e == "string" ? e === t || e.startsWith(t + ":") : Array.isArray(e) ? e.some((e) => Ch(e, t)) : !!e && typeof e == "object" && Object.values(e).some((e) => Ch(e, t));
}
function wh(t) {
	let n = {
		amount: f().finite().positive(),
		description: E().trim().min(1).max(2e3),
		reference: E().max(2e3).optional()
	}, r = (t.kind === "BANK_TRANSACTION" ? e({
		...n,
		bankAccountId: fh,
		transactionDate: fh,
		direction: T(["MONEY_IN", "MONEY_OUT"]),
		offsetAccountId: fh
	}).strict() : e({
		...n,
		fromBankAccountId: fh,
		toBankAccountId: fh,
		transferDate: fh
	}).strict()).parse(JSON.parse(t.fingerprint));
	return {
		...r,
		amount: yh(r.amount),
		description: r.description.trim(),
		reference: r.reference?.trim() || void 0
	};
}
function Th(e) {
	let n = A.list(), r = n.find((t) => t.operationId === e), i = {
		operationId: e,
		resultId: r?.resultId,
		evidenceDigest: Sh(),
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
		o = wh(r);
	} catch {
		return a("Saved bank intent is invalid or unreadable.");
	}
	if (o.amount <= 0) return a("Saved bank amount does not round to positive cents.");
	let s = Hf.getTransactions(), c = Hf.getTransfers(), l = F.getAll(), u = [...s, ...c].filter((e) => e.id === r.resultId), d = l.filter((e) => e.sourceType === r.kind && e.sourceId === r.resultId), f = t();
	if (l.some((e) => e.sourceId === r.resultId && e.sourceType !== r.kind)) return a("A journal with another source kind claims this bound result.");
	let p = k.read();
	if (JSON.stringify(p.transactions) !== JSON.stringify(s) || JSON.stringify(p.transfers) !== JSON.stringify(c) || JSON.stringify(p.journals) !== JSON.stringify(l)) return a("Financial cache and source repositories disagree; restore a consistent snapshot first.");
	if (new Set(l.map((e) => e.id)).size !== l.length || u.length > 1) return a("Duplicate bank or journal identities are ambiguous.");
	if (u.length === 1 && d.length === 2) {
		let t = u[0], s = d.find((e) => e.id === t.journalEntryId), c = d.find((e) => e.id !== t.journalEntryId);
		if (!s || !c || s.status !== "POSTED" || c.status !== "POSTED" || [s, c].some((e) => e.bankDuplicateCorrection || e.reversedJournalEntryId || e.reversalJournalEntryId || e.reversedAt) || !Se(s, c)) return a("Duplicate journals must be exact original postings with an unambiguous existing bank-record link.");
		let p = { ...f };
		if (delete p.journals, delete p.financialCache, Object.values(p).some((e) => Ch(e, c.id)) || n.some((e) => Ch(e, c.id)) || l.some((e) => e.id !== c.id && Ch(e, c.id))) return a("The duplicate journal is referenced by matching, clearing or another source.");
		let m = s.journalDate;
		try {
			w(m, "Duplicate financial date"), Qn(m), Vn(m, c.lines.map((e) => e.accountId));
		} catch (e) {
			return a(e.message);
		}
		if (c.lines.some((e) => !P.getAll().find((t) => t.id === e.accountId)?.active) || I.getAll().some((e) => c.lines.some((t) => t.accountId === e.glAccountId) && !e.active)) return a("Duplicate correction requires active bank and GL accounts.");
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
		}, ee = { journals: [_, ...l.map((e) => e.id === c.id ? v : e)] }, y = Lp(e, ee, !1), b = im(ee);
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
		if (Object.entries(f).some(([e, t]) => e !== "financialCache" && Ch(t, r.resultId))) return a("Other business records still reference the bound result.");
		let e = im();
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
		if (delete t.journals, delete t.financialCache, Object.values(t).some((e) => Ch(e, r.resultId))) return a("Another repository references the missing bank result.");
		if ([...s.map((e) => e.transactionNumber), ...c.map((e) => e.transferNumber)].includes(h)) return a("Recovered business number is already in use.");
		let n = "transactionNumber" in g ? { transactions: [g, ...s] } : { transfers: [g, ...c] }, o = Lp(e, n, !1), l = im(n);
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
			if (delete e.bankTransactions, delete e.financialCache, Object.values(e).some((e) => Ch(e, t.journalEntryId))) return a("The stale missing journal is still referenced by another repository.");
		}
		let o = {
			...t,
			journalEntryId: n.id
		}, p = "transactionNumber" in o ? { transactions: s.map((e) => e.id === o.id ? o : e) } : { transfers: c.map((e) => e.id === o.id ? o : e) }, m = Lp(e, p, !1), h = im(p);
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
		if (delete n.bankTransactions, delete n.financialCache, Object.values(n).some((e) => Ch(e, t.journalEntryId))) return a("Missing journal is referenced by clearing, matching or another repository.");
		let d = "bankAccountId" in g ? I.getById(g.bankAccountId) : void 0, p = "fromBankAccountId" in g ? I.getById(g.fromBankAccountId) : void 0, h = "toBankAccountId" in g ? I.getById(g.toBankAccountId) : void 0, _ = "direction" in g ? g.direction === "MONEY_IN" ? d?.glAccountId : g.offsetAccountId : h?.glAccountId, v = "direction" in g ? g.direction === "MONEY_IN" ? g.offsetAccountId : d?.glAccountId : p?.glAccountId;
		if (!_ || !v) return a("Bank GL mapping is missing.");
		try {
			Qn(m), Vn(m, [_, v]);
		} catch (e) {
			return a(e.message);
		}
		if ([
			d,
			p,
			h
		].filter(Boolean).some((e) => !e.active) || [_, v].some((e) => !P.getAll().find((t) => t.id === e)?.active)) return a("Missing-journal repair requires currently active bank and GL accounts.");
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
				let n = P.requireById(e.accountId);
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
		}, ne = Lp(e, te, !1), S = im(te);
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
function Eh(e) {
	return O.require("audit.read"), Th(gh.parse(e).operationId).public;
}
function Dh(e) {
	let t = O.require("accounting.recover"), n = _h.parse(e), r = Th(n.operationId).public;
	if (!r.eligible || !r.action) throw Error("Targeted repair blocked: " + r.blockers.join(" "));
	if (r.evidenceDigest !== n.expectedDigest) throw Error("Repair evidence changed. Refresh the preview.");
	let i = crypto.randomUUID();
	A.recordManualReview(n.operationId, n.reference, t.userId, n.summary + " · Proposed " + r.action + " · " + i);
	let a = Th(n.operationId).public;
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
function Oh(e) {
	let n = O.require("accounting.recover"), r = vh.parse(e), i = A.list().find((e) => e.operationId === r.operationId), a = i?.repairProposal;
	if (!i || !a || a.id !== r.proposalId || a.evidenceDigest !== r.expectedDigest) throw Error("Repair proposal changed. Refresh the preview.");
	if (a.status === "EXECUTED") {
		if (a.approver !== n.userId || a.approvalReference !== r.approvalReference) throw Error("Repair was already executed with a different approval.");
		return structuredClone(i);
	}
	if (i.state !== "MANUAL_REVIEW" || a.reviewer === n.userId || i.reviewHistory?.some((e) => e.operator === n.userId)) throw Error("Repair approval requires a different authorized operator.");
	if (i.reviewHistory?.some((e) => e.reference === r.approvalReference)) throw Error("Approval reference must differ from review evidence.");
	let o = Th(r.operationId), s = o.public;
	if (!s.eligible || s.action !== a.action || s.evidenceDigest !== a.evidenceDigest) throw Error("Repair evidence changed or is no longer eligible. Refresh and propose again.");
	let c = () => {
		let e = s.existingJournalId;
		if (s.action === "RESTORE_BANK_RECORD") Gf(o.record);
		else if (s.action === "RESTORE_BANK_JOURNAL_LINK") Kf(i.resultId, s.previousJournalId, s.existingJournalId);
		else if (s.action === "REVERSE_BANK_DUPLICATE") O.require("banking.write"), O.require("accounting.post"), e = ur(s.duplicateJournalId, s.existingJournalId, i.operationId, "Approved duplicate correction " + a.id + "; " + r.approvalReference).id;
		else if (s.action === "RESTORE_BANK_JOURNAL") {
			O.require("banking.write"), O.require("accounting.post");
			let t = F.post(o.draft);
			e = t.id, Kf(i.resultId, s.previousJournalId, t.id);
		}
		let c = im();
		if (c.length) throw Error("Post-repair consistency checks failed: " + c.map((e) => e.code).join(", "));
		if (s.action !== "CANCEL_NO_EFFECT") {
			let e = Lp(r.operationId);
			if (e.length) throw Error("Post-repair source proof failed: " + e.join(" "));
		} else if (Th(r.operationId).public.action !== "CANCEL_NO_EFFECT") throw Error("No-effect evidence changed before cancellation.");
		return A.finishRepair(r.operationId, a.id, n.userId, r.approvalReference, xh(t()), e);
	};
	return s.action === "CANCEL_NO_EFFECT" ? c() : k.transaction(c);
}
//#endregion
//#region src/features/document-output/purchaseOutputRepository.ts
var kh = E().min(1).max(200), Ah = E().max(2e4), jh = f().finite().nonnegative(), Mh = ["PURCHASE_ORDER", "REMITTANCE"], Nh = e({
	operationId: kh,
	kind: T(Mh),
	sourceId: kh,
	expectedRevision: E().min(1).max(5e5),
	templateId: kh.optional()
}).strict(), Ph = e({
	id: kh,
	description: Ah,
	reference: Ah,
	quantity: f().finite().positive(),
	unit: Ah,
	unitPrice: jh,
	net: jh,
	tax: jh,
	total: jh,
	taxCode: Ah.optional(),
	taxRate: f().finite().min(0).max(1).optional()
}).strict(), Fh = e({
	id: kh,
	revision: kh,
	name: Ah,
	subject: Ah,
	body: Ah,
	footer: Ah,
	logoPosition: T([
		"Left",
		"Centre",
		"Right"
	]).optional(),
	paper: T(["A4", "Letter"])
}).strict(), Ih = e({
	id: kh,
	operationId: kh,
	requestFingerprint: E().max(1e6),
	kind: T(Mh),
	sourceId: kh,
	sourceRevision: E().min(1).max(5e5),
	preparedAt: kh,
	preparedBy: kh,
	documentNumber: kh,
	status: kh,
	date: kh,
	expectedDeliveryDate: Ah.optional(),
	reference: Ah.optional(),
	notes: Ah.optional(),
	supplierId: kh,
	supplierName: Ah,
	supplierCode: Ah,
	supplierEmail: Ah.optional(),
	supplierContact: Ah.optional(),
	supplierAddress: Ah,
	supplierMetadataAt: kh,
	issuer: e({
		name: Ah,
		identifier: Ah,
		address: Ah,
		email: Ah,
		currency: kh,
		logo: Ie.optional()
	}).strict(),
	method: Ah.optional(),
	noncash: y(),
	lines: s(Ph).min(1),
	subtotal: jh,
	tax: jh,
	total: jh,
	template: Fh,
	subject: Ah,
	body: Ah
}).strict(), Lh = (e) => e === "PURCHASE_ORDER" ? "Purchase order" : "Remittance";
function Rh(e, t) {
	let n = e === "PURCHASE_ORDER" ? En.getById(t) : qi.getById(t);
	if (!n) throw Error("Purchase output source was not found.");
	return n;
}
function zh(e, t) {
	let n = Rh(e, t), r = pn.getById(n.supplierId);
	if (!r) throw Error("Source supplier was not found.");
	return JSON.stringify([n, r]);
}
var Bh = (e, t) => g(e, "accounting.read") || t === "PURCHASE_ORDER" && g(e, "purchases.write"), Vh = [], Hh = 0, Uh = /* @__PURE__ */ new Set(), Wh = () => {
	Hh++, Uh.forEach((e) => e());
};
function Gh() {
	return (x.templates ?? []).filter((e) => e.status === "Active" && ["Purchase order", "Remittance"].includes(e.kind));
}
function Kh(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!Object.hasOwn(t, n)) throw Error("Unsupported purchase template token: " + n);
		return t[n];
	});
}
function qh(e) {
	let t = Ih.parse(e), n = Nh.parse(JSON.parse(t.requestFingerprint));
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
		let t = Nh.parse(e), n = O.require("purchases.read");
		if (!Bh(n, t.kind) || t.kind === "REMITTANCE" && !g(n, "accounting.post") || t.kind === "PURCHASE_ORDER" && !g(n, "accounting.post") && !g(n, "purchases.write")) throw Error("Permission denied: purchase document preparation.");
		let r = JSON.stringify(t), i = Vh.find((e) => e.operationId === t.operationId);
		if (i) {
			if (i.requestFingerprint !== r) throw Error("Operation ID was used for different output data.");
			return i;
		}
		let a = Rh(t.kind, t.sourceId), o = pn.getById(a.supplierId);
		if (zh(t.kind, t.sourceId) !== t.expectedRevision) throw Error("Source or supplier changed. Refresh before preparing output.");
		let s = C(), c = t.templateId ? Gh().find((e) => e.id === t.templateId && e.kind === Lh(t.kind)) : void 0;
		if (t.templateId && !c) throw Error("Select an active matching purchase template.");
		let l = t.kind === "PURCHASE_ORDER" ? En.getById(t.sourceId) : void 0, u = t.kind === "REMITTANCE" ? qi.getById(t.sourceId) : void 0, d = l ? l.lines.map((e) => ({
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
			name: c?.name ?? "Standard " + Lh(t.kind),
			subject: c?.subject ?? "{{documentNumber}} · {{companyName}}",
			body: c?.body ?? "Dear {{supplierName}},\nPlease review {{documentNumber}} for {{currency}} {{total}}.",
			footer: c?.footer ?? "",
			...Ve() ? { logoPosition: c?.logo === "Centre" ? "Centre" : c?.logo === "Right" ? "Right" : "Left" } : {},
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
				currency: s.currency,
				...Ve() ? { logo: Ve() } : {}
			},
			method: u?.method,
			noncash: !!u?.prepaymentApplicationId,
			lines: d,
			subtotal: l?.totals.subtotal ?? f,
			tax: l?.totals.taxAmount ?? 0,
			total: f,
			template: {
				...m,
				footer: Kh(m.footer, p)
			},
			subject: Kh(m.subject, p),
			body: Kh(m.body, p)
		};
		return qh(h), Vh = [h, ...Vh], Wh(), h;
	} },
	read: "purchases.read",
	commands: { prepare: "purchases.read" },
	snapshot: () => ({
		artifacts: Vh,
		templates: Gh().map((e) => ({
			id: e.id,
			name: e.name,
			kind: e.kind
		}))
	}),
	restore: (e) => {
		Vh = e.artifacts, e.templates;
	},
	publish: Wh,
	view: (e) => ({
		artifacts: Vh.filter((t) => Bh(e, t.kind)),
		templates: Gh().filter((t) => Bh(e, t.kind === "Purchase order" ? "PURCHASE_ORDER" : "REMITTANCE")).map((e) => ({
			id: e.id,
			name: e.name,
			kind: e.kind
		}))
	}),
	validate: (t, n) => {
		let r = e({
			artifacts: s(Ih),
			templates: s(e({
				id: kh,
				name: Ah,
				kind: kh
			}).strict())
		}).strict().parse(t).artifacts, i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set(), o = n;
		for (let e of r) {
			if (qh(e), a.has(e.id) || i.has(e.operationId)) throw Error("Duplicate purchase output.");
			a.add(e.id), i.add(e.operationId);
			let t = (e.kind === "PURCHASE_ORDER" ? o.purchaseOrders.purchaseOrders : o.supplierPayments.supplierPayments).find((t) => t.id === e.sourceId);
			if (!t || t.supplierId !== e.supplierId) throw Error("Invalid purchase output source reference.");
		}
	}
});
//#endregion
//#region src/features/sales/data/recoveryWorkbench.ts
var Jh = [
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
];
function Yh() {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let e = h("business.command", {
			repository: "salesRecovery",
			method: "inspectRecovery",
			args: []
		});
		return Te(e.view), e.result;
	}
	let e = O.require("audit.read"), t = A.list(), n = K.getAll(), r = {
		quotes: n.filter((e) => e.type === "QUOTE"),
		salesOrders: n.filter((e) => e.type === "SALES_ORDER"),
		invoices: n.filter((e) => e.type === "INVOICE"),
		payments: zl.getAll(),
		creditNotes: G.getAll(),
		allocations: G.getAllAllocations(),
		journals: F.getAll()
	}, i = im(), a = t.filter((e) => e.state !== "COMPLETED" || e.reviewHistory?.length).map((n) => {
		let a = Jh.includes(n.kind) || Ip(n.kind) || n.kind === "BANK_RECONCILIATION", o = [], s = (e, t) => {
			o.some((e) => e.path === t) || o.push({
				label: e,
				path: t
			});
		};
		if (n.kind === "BANK_RECONCILIATION") {
			let e = Zs.getAll().find((e) => e.id === n.resultId);
			s("Bank reconciliation records", e ? "/banking/accounts/" + encodeURIComponent(e.bankAccountId) : "/banking");
		}
		if (Ip(n.kind)) {
			let e = (n.kind === "BANK_TRANSACTION" ? Hf.getTransactions() : Hf.getTransfers()).find((e) => e.id === n.resultId);
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
		let d = n.state === "COMPLETED" ? [] : a ? n.kind === "BANK_RECONCILIATION" ? Fp(n.operationId) : Ip(n.kind) ? Lp(n.operationId) : fm(r, t, n.operationId) : ["This operation kind has no verified closure procedure. It remains blocked; do not replay it."];
		return n.state !== "COMPLETED" && a && (n.kind !== "BANK_RECONCILIATION" && !Ip(n.kind) && d.push(...mm(n.operationId)), i.length && d.push("Financial consistency checks failed: " + i.map((e) => e.code).join(", ")), n.reviewHistory?.some((t) => t.operator.trim().toLowerCase() === e.userId.toLowerCase()) && d.push("A different authorized operator must approve; this account recorded review evidence."), g(e, "accounting.recover") || d.push("Your role can inspect but cannot approve recovery.")), {
			...structuredClone(n),
			supported: a,
			revision: um(n),
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
var Xh = (e) => Math.round((e + 2 ** -52) * 100) / 100, Zh = E().trim().min(1).max(200), Qh = Zh.refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}), $h = f().finite().positive().refine((e) => Xh(e) === e), eg = E().trim().min(3).max(2e3), tg = E().trim().max(500).default(""), ng = e({
	operationId: Zh,
	supplierId: Zh,
	date: Qh,
	bankAccountId: Zh,
	amount: $h,
	reference: tg,
	reason: eg
}).strict(), rg = e({
	operationId: Zh,
	prepaymentId: Zh,
	supplierBillId: Zh,
	date: Qh,
	amount: $h,
	reference: tg,
	reason: eg
}).strict(), ig = e({
	operationId: Zh,
	prepaymentId: Zh,
	bankAccountId: Zh,
	date: Qh,
	amount: $h,
	reference: tg,
	reason: eg
}).strict(), ag = {
	id: Zh,
	fingerprint: E(),
	journalId: Zh,
	status: T(["POSTED", "REVERSED"]),
	createdBy: Zh,
	createdAt: Zh,
	reversalDate: Qh.optional(),
	reversalReason: eg.optional(),
	reversedBy: Zh.optional()
}, og = ng.extend({
	...ag,
	assetAccountId: Zh
}).strict(), sg = rg.extend({
	...ag,
	paymentId: Zh
}).strict(), cg = ig.extend(ag).strict(), lg = e({
	prepayments: s(og),
	applications: s(sg),
	refunds: s(cg),
	settings: s(e({
		id: Zh,
		assetAccountId: Zh
	}).strict()).max(1)
}).strict(), ug = {
	prepayments: [],
	applications: [],
	refunds: [],
	settings: []
}, dg = 0, fg = /* @__PURE__ */ new Set(), pg = () => {
	dg++, fg.forEach((e) => e());
};
function mg(e) {
	let t = ug.prepayments.find((t) => t.id === e);
	if (!t) throw Error("Supplier prepayment not found.");
	return t;
}
function hg(e) {
	let t = mg(e);
	return t.status === "REVERSED" ? 0 : Xh(t.amount - ug.applications.filter((t) => t.prepaymentId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0) - ug.refunds.filter((t) => t.prepaymentId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
}
function gg(e, t) {
	let n = e.prepayments.find((e) => e.id === t), r = /* @__PURE__ */ new Map(), i = (e, t) => r.set(e, Xh((r.get(e) ?? 0) + t));
	i(n.date, n.amount), n.reversalDate && i(n.reversalDate, -n.amount);
	for (let r of [...e.applications, ...e.refunds].filter((e) => e.prepaymentId === t)) {
		if (r.date < n.date || r.reversalDate && r.reversalDate < r.date) throw Error("Prepayment event dates are invalid.");
		i(r.date, -r.amount), r.reversalDate && i(r.reversalDate, r.amount);
	}
	let a = 0;
	for (let [, e] of [...r].sort(([e], [t]) => e.localeCompare(t))) if (a = Xh(a + e), a < 0) throw Error("Prepayment would be overdrawn on a historical date.");
}
function _g(e) {
	let t = JSON.stringify(e), n = [
		...ug.prepayments,
		...ug.applications,
		...ug.refunds
	].find((t) => t.operationId === e.operationId);
	if (n && n.fingerprint !== t) throw Error("Operation ID already used with different prepayment data.");
	return {
		prior: n,
		fingerprint: t
	};
}
function vg(e) {
	let t = P.requireById(e);
	if (!t.active || t.type !== "ASSET" || t.systemRole || t.allowManualPosting) throw Error("Use the dedicated active prepayment asset account.");
	return t;
}
function yg(e, t) {
	let n = I.requireById(e), r = P.requireById(n.glAccountId);
	if (!n.active || t < n.openingBalanceDate || !r.active || r.type !== "ASSET") throw Error("Use an active bank account and a date after its opening balance.");
	return n;
}
function bg(e) {
	w(e), Qn(e), M();
}
function xg(e, t, n = crypto.randomUUID()) {
	return {
		id: n,
		fingerprint: e,
		journalId: t,
		status: "POSTED",
		createdBy: O.require("purchases.payment").userId,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
i("supplierPrepayments", {
	repository: {
		setupDefaults() {
			if (O.require("accounting.post"), ug.settings[0]) return ug.settings[0];
			let e = 1390;
			for (; P.getAll().some((t) => t.code === String(e));) e++;
			let t = P.create({
				code: String(e),
				name: "Supplier prepayments paid",
				type: "ASSET",
				active: !0,
				allowManualPosting: !1
			}), n = {
				id: crypto.randomUUID(),
				assetAccountId: t.id
			};
			return ug.settings = [n], pg(), n;
		},
		balance(e) {
			return O.require("purchases.read"), hg(e);
		},
		pay(e) {
			O.require("purchases.payment");
			let t = ng.parse(e), { prior: n, fingerprint: r } = _g(t);
			if (n) return n;
			bg(t.date);
			let i = pn.getById(t.supplierId);
			if (!i || i.status === "INACTIVE") throw Error("Choose an active supplier.");
			let a = ug.settings[0];
			if (!a) throw Error("Configure the prepayment asset account first.");
			vg(a.assetAccountId);
			let o = yg(t.bankAccountId, t.date), s = crypto.randomUUID(), c = F.post({
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
				...xg(r, c.id, s),
				assetAccountId: a.assetAccountId
			};
			return ug.prepayments = [...ug.prepayments, l], pg(), l;
		},
		apply(e) {
			O.require("purchases.payment");
			let t = rg.parse(e), { prior: n, fingerprint: r } = _g(t);
			if (n) return n;
			bg(t.date);
			let i = mg(t.prepaymentId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > hg(i.id)) throw Error("Prepayment date or available balance is insufficient.");
			vg(i.assetAccountId);
			let a = Bi.getById(t.supplierBillId);
			if (!a || a.supplierId !== i.supplierId || ["VOID", "DRAFT"].includes(a.status) || t.date < a.billDate) throw Error("Choose an issued bill for the same supplier.");
			if (t.amount > a.totals.amountDue) throw Error("Prepayment application exceeds bill amount due.");
			let o = crypto.randomUUID(), s = "prepayment-payment:" + o;
			qi.recordPrepaymentSettlement({
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
			let c = F.post({
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
					accountId: P.requireBySystemRole("ACCOUNTS_PAYABLE").id,
					debit: t.amount,
					credit: 0
				}]
			}), l = {
				...t,
				...xg(r, c.id, o),
				paymentId: s
			};
			return ug.applications = [...ug.applications, l], gg(ug, i.id), pg(), l;
		},
		refund(e) {
			O.require("purchases.payment");
			let t = ig.parse(e), { prior: n, fingerprint: r } = _g(t);
			if (n) return n;
			bg(t.date);
			let i = mg(t.prepaymentId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > hg(i.id)) throw Error("Refund exceeds the available prepayment.");
			vg(i.assetAccountId);
			let a = yg(t.bankAccountId, t.date), o = crypto.randomUUID(), s = F.post({
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
				...xg(r, s.id, o)
			};
			return ug.refunds = [...ug.refunds, c], gg(ug, i.id), pg(), c;
		},
		reverse(t) {
			let n = O.require("purchases.payment"), r = e({
				entity: T([
					"prepayments",
					"applications",
					"refunds"
				]),
				id: Zh,
				reversalDate: Qh,
				reason: eg
			}).strict().parse(t), i = ug[r.entity].find((e) => e.id === r.id);
			if (!i) throw Error("Prepayment record not found.");
			if (i.status === "REVERSED") return i;
			if (bg(r.reversalDate), r.reversalDate < i.date) throw Error("Prepayment reversal cannot precede its original date.");
			let a = r.entity === "prepayments" ? i.id : i.prepaymentId;
			if (r.entity === "prepayments" && [...ug.applications, ...ug.refunds].some((e) => e.prepaymentId === i.id && e.status === "POSTED")) throw Error("Reverse prepayment applications and refunds before reversing its receipt.");
			Yu(i.journalId), F.reverse({
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
			if (ug[r.entity] = ug[r.entity].map((e) => e.id === r.id ? o : e), r.entity === "applications") {
				let e = i;
				qi.reversePrepaymentSettlement(e.paymentId, r.reversalDate, r.reason);
			}
			return gg(ug, a), pg(), o;
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
	snapshot: () => ug,
	restore: (e) => {
		ug = e;
	},
	publish: pg,
	validate: (e, t) => {
		let n = lg.parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.settings) {
			let t = r.accounts.accounts.find((t) => t.id === e.assetAccountId);
			if (!t || t.type !== "ASSET" || t.systemRole || t.allowManualPosting) throw Error("Invalid prepayment asset mapping.");
		}
		let a = (e) => {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) t.set(n.accountId, Xh((t.get(n.accountId) ?? 0) + n.debit - n.credit));
			return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
		};
		for (let e of [
			"prepayments",
			"applications",
			"refunds"
		]) for (let t of n[e]) {
			let o = (e === "prepayments" ? ng : e === "applications" ? rg : ig).parse(JSON.parse(t.fingerprint));
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
		for (let e of n.prepayments) if (gg(n, e.id), e.status === "REVERSED" && [...n.applications, ...n.refunds].some((t) => t.prepaymentId === e.id && (t.status === "POSTED" || t.reversalDate > e.reversalDate))) throw Error("Reversed prepayment has later consumption.");
		for (let e of r.supplierPayments.supplierPayments) if (e.prepaymentApplicationId && !n.applications.some((t) => t.id === e.prepaymentApplicationId && t.paymentId === e.id && t.prepaymentId === e.prepaymentId)) throw Error("Orphan prepayment settlement payment.");
	}
});
//#endregion
//#region src/features/customer-deposits/customerDepositRepository.ts
var Sg = (e) => Math.round((e + 2 ** -52) * 100) / 100, Cg = E().trim().min(1).max(200), wg = Cg.refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}), Tg = f().finite().positive().refine((e) => Sg(e) === e), Eg = E().trim().min(3).max(2e3), Dg = E().trim().max(500).default(""), Og = e({
	operationId: Cg,
	customerId: Cg,
	date: wg,
	bankAccountId: Cg,
	amount: Tg,
	reference: Dg,
	reason: Eg
}).strict(), kg = e({
	operationId: Cg,
	depositId: Cg,
	invoiceId: Cg,
	date: wg,
	amount: Tg,
	reference: Dg,
	reason: Eg
}).strict(), Ag = e({
	operationId: Cg,
	depositId: Cg,
	bankAccountId: Cg,
	date: wg,
	amount: Tg,
	reference: Dg,
	reason: Eg
}).strict(), jg = {
	id: Cg,
	fingerprint: E(),
	journalId: Cg,
	status: T(["POSTED", "REVERSED"]),
	createdBy: Cg,
	createdAt: Cg,
	reversalDate: wg.optional(),
	reversalReason: Eg.optional(),
	reversedBy: Cg.optional()
}, Mg = Og.extend({
	...jg,
	liabilityAccountId: Cg
}).strict(), Ng = kg.extend({
	...jg,
	paymentId: Cg
}).strict(), Pg = Ag.extend(jg).strict(), Fg = e({
	deposits: s(Mg),
	applications: s(Ng),
	refunds: s(Pg),
	settings: s(e({
		id: Cg,
		liabilityAccountId: Cg
	}).strict()).max(1)
}).strict(), Ig = {
	deposits: [],
	applications: [],
	refunds: [],
	settings: []
}, Lg = 0, Rg = /* @__PURE__ */ new Set(), zg = () => {
	Lg++, Rg.forEach((e) => e());
};
function Bg(e) {
	let t = Ig.deposits.find((t) => t.id === e);
	if (!t) throw Error("Customer deposit not found.");
	return t;
}
function Vg(e) {
	let t = Bg(e);
	return t.status === "REVERSED" ? 0 : Sg(t.amount - Ig.applications.filter((t) => t.depositId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0) - Ig.refunds.filter((t) => t.depositId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
}
function Hg(e, t) {
	let n = e.deposits.find((e) => e.id === t), r = /* @__PURE__ */ new Map(), i = (e, t) => r.set(e, Sg((r.get(e) ?? 0) + t));
	i(n.date, n.amount), n.reversalDate && i(n.reversalDate, -n.amount);
	for (let r of [...e.applications, ...e.refunds].filter((e) => e.depositId === t)) {
		if (r.date < n.date || r.reversalDate && r.reversalDate < r.date) throw Error("Deposit event dates are invalid.");
		i(r.date, -r.amount), r.reversalDate && i(r.reversalDate, r.amount);
	}
	let a = 0;
	for (let [, e] of [...r].sort(([e], [t]) => e.localeCompare(t))) if (a = Sg(a + e), a < 0) throw Error("Deposit would be overdrawn on a historical date.");
}
function Ug(e) {
	let t = JSON.stringify(e), n = [
		...Ig.deposits,
		...Ig.applications,
		...Ig.refunds
	].find((t) => t.operationId === e.operationId);
	if (n && n.fingerprint !== t) throw Error("Operation ID already used with different deposit data.");
	return {
		prior: n,
		fingerprint: t
	};
}
function Wg(e) {
	let t = P.requireById(e);
	if (!t.active || t.type !== "LIABILITY" || t.systemRole || t.allowManualPosting) throw Error("Use the dedicated active deposit liability account.");
	return t;
}
function Gg(e, t) {
	let n = I.requireById(e), r = P.requireById(n.glAccountId);
	if (!n.active || t < n.openingBalanceDate || !r.active || r.type !== "ASSET") throw Error("Use an active bank account and a date after its opening balance.");
	return n;
}
function Kg(e) {
	w(e), Qn(e), M();
}
function qg(e, t, n = crypto.randomUUID()) {
	return {
		id: n,
		fingerprint: e,
		journalId: t,
		status: "POSTED",
		createdBy: O.require("sales.payment").userId,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
i("customerDeposits", {
	repository: {
		setupDefaults() {
			if (O.require("accounting.post"), Ig.settings[0]) return Ig.settings[0];
			let e = 2290;
			for (; P.getAll().some((t) => t.code === String(e));) e++;
			let t = P.create({
				code: String(e),
				name: "Customer deposits held",
				type: "LIABILITY",
				active: !0,
				allowManualPosting: !1
			}), n = {
				id: crypto.randomUUID(),
				liabilityAccountId: t.id
			};
			return Ig.settings = [n], zg(), n;
		},
		balance(e) {
			return O.require("sales.read"), Vg(e);
		},
		receive(e) {
			O.require("sales.payment");
			let t = Og.parse(e), { prior: n, fingerprint: r } = Ug(t);
			if (n) return n;
			Kg(t.date);
			let i = W.getById(t.customerId);
			if (!i || i.status === "INACTIVE") throw Error("Choose an active customer.");
			let a = Ig.settings[0];
			if (!a) throw Error("Configure the deposit liability account first.");
			Wg(a.liabilityAccountId);
			let o = Gg(t.bankAccountId, t.date), s = crypto.randomUUID(), c = F.post({
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
				...qg(r, c.id, s),
				liabilityAccountId: a.liabilityAccountId
			};
			return Ig.deposits = [...Ig.deposits, l], zg(), l;
		},
		apply(e) {
			O.require("sales.payment");
			let t = kg.parse(e), { prior: n, fingerprint: r } = Ug(t);
			if (n) return n;
			Kg(t.date);
			let i = Bg(t.depositId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > Vg(i.id)) throw Error("Deposit date or available balance is insufficient.");
			Wg(i.liabilityAccountId);
			let a = K.getAll().find((e) => e.id === t.invoiceId && e.type === "INVOICE");
			if (!a || a.type !== "INVOICE" || a.customerId !== i.customerId || ["VOID", "DRAFT"].includes(a.status) || t.date < a.documentDate) throw Error("Choose an issued invoice for the same customer.");
			let o = K.recalculateInvoiceBalance(a.id);
			if (t.amount > o.amountDue) throw Error("Deposit application exceeds invoice amount due.");
			let s = crypto.randomUUID(), c = "deposit-payment:" + s;
			zl.recordDepositSettlement({
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
			let l = F.post({
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
					accountId: P.requireBySystemRole("ACCOUNTS_RECEIVABLE").id,
					debit: 0,
					credit: t.amount
				}]
			}), u = {
				...t,
				...qg(r, l.id, s),
				paymentId: c
			};
			return Ig.applications = [...Ig.applications, u], Hg(Ig, i.id), K.recalculateInvoiceBalance(a.id), zg(), u;
		},
		refund(e) {
			O.require("sales.payment");
			let t = Ag.parse(e), { prior: n, fingerprint: r } = Ug(t);
			if (n) return n;
			Kg(t.date);
			let i = Bg(t.depositId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > Vg(i.id)) throw Error("Refund exceeds the available deposit.");
			Wg(i.liabilityAccountId);
			let a = Gg(t.bankAccountId, t.date), o = crypto.randomUUID(), s = F.post({
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
				...qg(r, s.id, o)
			};
			return Ig.refunds = [...Ig.refunds, c], Hg(Ig, i.id), zg(), c;
		},
		reverse(t) {
			let n = O.require("sales.payment"), r = e({
				entity: T([
					"deposits",
					"applications",
					"refunds"
				]),
				id: Cg,
				reversalDate: wg,
				reason: Eg
			}).strict().parse(t), i = Ig[r.entity].find((e) => e.id === r.id);
			if (!i) throw Error("Deposit record not found.");
			if (i.status === "REVERSED") return i;
			if (Kg(r.reversalDate), r.reversalDate < i.date) throw Error("Deposit reversal cannot precede its original date.");
			let a = r.entity === "deposits" ? i.id : i.depositId;
			if (r.entity === "deposits" && [...Ig.applications, ...Ig.refunds].some((e) => e.depositId === i.id && e.status === "POSTED")) throw Error("Reverse deposit applications and refunds before reversing its receipt.");
			Yu(i.journalId), F.reverse({
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
			if (Ig[r.entity] = Ig[r.entity].map((e) => e.id === r.id ? o : e), r.entity === "applications") {
				let e = i;
				zl.reverseDepositSettlement(e.paymentId, r.reversalDate, r.reason), K.recalculateInvoiceBalance(e.invoiceId);
			}
			return Hg(Ig, a), zg(), o;
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
	snapshot: () => Ig,
	restore: (e) => {
		Ig = e;
	},
	publish: zg,
	validate: (e, t) => {
		let n = Fg.parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.settings) {
			let t = r.accounts.accounts.find((t) => t.id === e.liabilityAccountId);
			if (!t || t.type !== "LIABILITY" || t.systemRole || t.allowManualPosting) throw Error("Invalid deposit liability mapping.");
		}
		let a = (e) => {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) t.set(n.accountId, Sg((t.get(n.accountId) ?? 0) + n.debit - n.credit));
			return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
		};
		for (let e of [
			"deposits",
			"applications",
			"refunds"
		]) for (let t of n[e]) {
			let o = (e === "deposits" ? Og : e === "applications" ? kg : Ag).parse(JSON.parse(t.fingerprint));
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
		for (let e of n.deposits) if (Hg(n, e.id), e.status === "REVERSED" && [...n.applications, ...n.refunds].some((t) => t.depositId === e.id && (t.status === "POSTED" || t.reversalDate > e.reversalDate))) throw Error("Reversed deposit has later consumption.");
		for (let e of r.customerPayments.payments) if (e.depositApplicationId && !n.applications.some((t) => t.id === e.depositApplicationId && t.paymentId === e.id && t.depositId === e.depositId)) throw Error("Orphan deposit settlement payment.");
	}
});
//#endregion
//#region src/features/accounting/data/inventoryAccountingPostingService.ts
function Jg(e) {
	return P.requireBySystemRole(e).id;
}
function Yg(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Xg(e) {
	return F.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function Zg(e) {
	let t = Jr.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var Qg = {
	postSalesFulfilment(e) {
		let t = Xg(e.id);
		if (t) return t;
		let n = Yg(Zg(e).reduce((e, t) => {
			if (t.valueChange > 0) throw Error(`Sales fulfilment cost movement ${t.costMovementNumber} has an invalid positive inventory value change.`);
			return e - t.valueChange;
		}, 0));
		if (!Number.isFinite(n) || n < 0) throw Error("Sales fulfilment COGS amount is invalid.");
		if (n !== 0) return F.post({
			journalDate: e.fulfilmentDate,
			description: `COGS for sales fulfilment ${e.fulfilmentNumber}`,
			reference: e.fulfilmentNumber,
			sourceType: "SALES_FULFILMENT",
			sourceId: e.id,
			lines: [{
				accountId: Jg("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: Jg("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = Xg(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? F.getById(r.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, $g = /* @__PURE__ */ new Set(), e_ = [], t_ = e_;
function n_() {
	t_ = e_, $g.forEach((e) => e());
}
function r_() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = e_.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function i_(e, t) {
	return L(e_.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function a_(e) {
	let t = K.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.filter(qt).map((e) => i_(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.filter(qt).every((e, t) => n[t] >= L(e.quantity));
	K.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function o_(e) {
	let t = Jr.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var s_ = {
	subscribe(e) {
		return $g.add(e), () => {
			$g.delete(e);
		};
	},
	getSnapshot() {
		return t_;
	},
	getAll() {
		return t_;
	},
	getById(e) {
		return e_.find((t) => t.id === e);
	},
	getBySalesOrder(e) {
		return e_.filter((t) => t.salesOrderId === e);
	},
	getFulfilledQuantity: i_,
	getRemainingQuantity(e, t) {
		let n = K.getById(e);
		if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let r = n.lines.find((e) => e.id === t);
		if (!r) throw Error("Sales order line was not found.");
		return qt(r) ? L(r.quantity - i_(e, t)) : 0;
	},
	create(e) {
		let t = K.getById(e.salesOrderId);
		if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let n = t;
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "INVOICED") throw Error("Only a confirmed or partially fulfilled sales order can be fulfilled.");
		if (n.status === "INVOICED" && !n.invoiceIds.some((e) => {
			let t = K.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("This order has no active invoice; do not fulfil a void invoice.");
		let r = Nr.getById(e.siteId);
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
			if (!qt(t)) throw Error("Non-stock and service lines do not require inventory dispatch.");
			let i = Xt(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let o = Zt(t.productId, t.unitId);
			if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
			if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
			let s = L(e.fulfilledQuantity);
			if (t.areaPerPack && !Number.isInteger(e.fulfilledQuantity)) throw Error("Area-based lines must be dispatched in whole packs.");
			let c = i_(n.id, t.id);
			if (s > L(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
			let l = L(s * o.conversionToBase), u = pi.getBalance(r.id, t.productId);
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
			s.set(e.orderLine.productId, L(t + e.fulfilledBaseQuantity));
		}
		for (let [e, t] of s) {
			let n = pi.getBalance(r.id, e);
			if (!n || n.quantityOnHand < t) {
				let t = Xt(e);
				throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
			}
		}
		let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = r_(), d = o.map((e) => ({
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
			let i = Xt(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let a = Rr.create({
				movementType: "SALE",
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: L(-t.fulfilledBaseQuantity),
				transactionUnitId: t.unitId,
				transactionUnitSymbol: t.unitSymbol,
				transactionQuantity: L(-t.fulfilledQuantity),
				conversionToBase: t.conversionToBase,
				referenceType: "SALES_FULFILMENT",
				referenceId: f.id,
				referenceNumber: f.fulfilmentNumber,
				salesOrderId: n.id,
				salesOrderNumber: n.documentNumber,
				occurredAt: e.fulfilmentDate,
				notes: `Sales fulfilment ${f.fulfilmentNumber}`
			});
			si({
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
			}), pi.issue({
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: t.fulfilledBaseQuantity
			});
		}
		return Qg.postSalesFulfilment(f), e_ = [f, ...e_], n_(), a_(n.id), f;
	},
	void(e) {
		if (t().physicalCustomerReturns?.returns.some((t) => t.status === "POSTED" && t.lines.some((t) => t.fulfilmentId === e.fulfilmentId))) throw Error("Reverse physical customer returns before voiding this dispatch.");
		let n = e_.find((t) => t.id === e.fulfilmentId);
		if (!n) throw Error("Sales fulfilment was not found.");
		if (n.status === "VOIDED") throw Error("Sales fulfilment has already been voided.");
		if (Number.isNaN(Date.parse(e.voidDate))) throw Error("Fulfilment void date is invalid.");
		if (e.voidDate < n.fulfilmentDate) throw Error("Fulfilment void date cannot be earlier than the fulfilment date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("Fulfilment void reason must contain at least 3 characters.");
		let i = K.getById(n.salesOrderId);
		if (!i || i.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		if (i.status === "INVOICED" && i.invoiceIds.some((e) => {
			let t = K.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("Cannot void a sales fulfilment for an invoiced sales order.");
		if (i.status !== "CONFIRMED" && i.status !== "PARTIALLY_FULFILLED" && i.status !== "FULFILLED" && i.status !== "INVOICED") throw Error(`Cannot void a sales fulfilment when the sales order status is ${i.status}.`);
		let a = o_(n), o = /* @__PURE__ */ new Set(), s = n.lines.map((e) => {
			let t = Xt(e.productId);
			if (!t) throw Error(`Product ${e.sku} was not found.`);
			let r = a.find((t) => !o.has(t.id) && t.siteId === n.siteId && t.productId === e.productId && Math.abs(t.quantityBase) === e.fulfilledBaseQuantity);
			if (!r) throw Error(`Unique original inventory cost issue for ${e.sku} was not found.`);
			return o.add(r.id), {
				line: e,
				product: t,
				originalIssue: r
			};
		});
		Qg.reverseSalesFulfilment({
			fulfilment: n,
			reversalDate: e.voidDate,
			reason: r
		});
		for (let t of s) {
			let { line: i, product: a, originalIssue: o } = t, s = Rr.create({
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
			ci({
				siteId: n.siteId,
				productId: i.productId,
				quantityBase: i.fulfilledBaseQuantity,
				unitCostBase: o.unitCostBase,
				inventoryValue: br(Math.abs(o.valueChange)),
				referenceType: "SALE",
				referenceId: n.id,
				referenceNumber: n.fulfilmentNumber,
				inventoryMovementId: s.id,
				occurredAt: e.voidDate,
				notes: `Void sales fulfilment ${n.fulfilmentNumber}: ${r}`
			}), pi.receive({
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
		return e_ = e_.map((e) => e.id === c.id ? c : e), n_(), a_(n.salesOrderId), c;
	}
};
i("fulfilments", {
	repository: s_,
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: e_ }),
	restore: (e) => {
		e_ = e.fulfilments, t_ = e_;
	},
	publish: () => $g.forEach((e) => e())
});
//#endregion
//#region src/features/customer-returns/customerReturnRepository.ts
var X = E().trim().min(1).max(200), c_ = f().finite().positive().refine((e) => Math.round(e * 1e4) / 1e4 === e), l_ = f().finite().nonnegative(), u_ = e({
	operationId: X,
	invoiceId: X,
	creditNoteId: X.optional(),
	returnDate: X,
	reason: E().trim().min(3).max(2e3),
	lines: s(e({
		costMovementId: X,
		invoiceLineId: X,
		quantity: c_
	}).strict()).min(1).max(500)
}).strict(), d_ = e({
	costMovementId: X,
	invoiceLineId: X,
	fulfilmentId: X,
	productId: X,
	unitId: X,
	baseUnitId: X,
	siteId: X,
	description: E(),
	quantity: c_,
	conversionToBase: c_,
	quantityBase: c_,
	inventoryValue: l_,
	unitCostBase: l_,
	movementId: X,
	restoredCostId: X,
	reversalMovementId: X.optional(),
	reversalCostId: X.optional()
}).strict(), f_ = e({
	id: X,
	number: X,
	operationId: X,
	fingerprint: E(),
	invoiceId: X,
	invoiceNumber: X,
	customerId: X,
	creditNoteId: X,
	ownsCredit: y(),
	returnDate: X,
	reason: X.max(2e3),
	status: T(["POSTED", "REVERSED"]),
	lines: s(d_).min(1),
	inventoryValue: l_,
	journalId: X.optional(),
	createdBy: X,
	createdAt: X,
	reversalDate: X.optional(),
	reversalReason: X.optional(),
	reversedBy: X.optional()
}).strict(), p_ = [], m_ = 0, h_ = /* @__PURE__ */ new Set(), g_ = () => {
	m_++, h_.forEach((e) => e());
}, __ = (e) => Math.round(e * 1e4) / 1e4, v_ = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function y_(e, t, n) {
	if (Jr.getAll().some((r) => r.siteId === e && r.productId === t && ve(r.occurredAt) > n)) throw Error("Return date precedes later inventory activity at this site.");
}
function b_(e) {
	let t = K.getAll().find((t) => t.id === e && t.type === "INVOICE");
	if (!t || t.type !== "INVOICE" || ["VOID", "DRAFT"].includes(t.status) || t.openingBalanceImportId) return [];
	let n = [];
	for (let e of s_.getAll().filter((e) => e.salesOrderId === t.sourceSalesOrderId && e.status === "ACTIVE")) {
		let r = /* @__PURE__ */ new Set();
		for (let i of e.lines) {
			let a = t.lines.find((e) => e.id === i.salesOrderLineId && e.productId === i.productId && e.unitId === i.unitId), o = Jr.getAll().find((t) => t.referenceType === "SALE" && t.referenceId === e.id && t.movementType === "ISSUE" && t.productId === i.productId && Rr.getAll().some((e) => e.id === t.inventoryMovementId && e.transactionUnitId === i.unitId) && t.siteId === e.siteId && __(-t.quantityBase) === __(i.fulfilledBaseQuantity) && !r.has(t.id));
			if (!a || !o) continue;
			r.add(o.id);
			let s = p_.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((e) => e.costMovementId === o.id).reduce((e, t) => e + t.quantityBase, 0);
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
			let t = O.require("sales.payment"), n = u_.parse(e), r = JSON.stringify(n), i = p_.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already used with different customer return data.");
				return i;
			}
			w(n.returnDate), Qn(n.returnDate), M();
			let a = K.getAll().find((e) => e.id === n.invoiceId && e.type === "INVOICE");
			if (!a || a.type !== "INVOICE" || n.returnDate < a.documentDate) throw Error("Select an issued invoice and a return date on or after it.");
			let o = b_(a.id), s = /* @__PURE__ */ new Set(), c = n.lines.map((e) => {
				if (s.has(e.costMovementId)) throw Error("Select each original dispatch cost only once.");
				s.add(e.costMovementId);
				let t = o.find((t) => t.costMovementId === e.costMovementId && t.invoiceLineId === e.invoiceLineId);
				if (!t || e.quantity > t.availableQuantity + 1e-8 || n.returnDate < t.dispatchDate) throw Error("Return exceeds dispatched quantities or precedes dispatch.");
				let r = Xt(t.productId), i = Nr.getById(t.siteId), c = a.lines.find((t) => t.id === e.invoiceLineId);
				if (!r || !i || i.status !== "ACTIVE") throw Error("An active original receiving site and product are required.");
				if ((c.areaPerPack || r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(r.units.find((e) => e.id === t.unitId)?.code ?? "")) && !Number.isInteger(e.quantity)) throw Error("Return whole packs in whole quantities.");
				y_(t.siteId, t.productId, n.returnDate);
				let l = __(e.quantity * t.conversionToBase);
				if (l <= 0) throw Error("Return quantity rounds to zero.");
				let u = p_.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((e) => e.costMovementId === t.costMovementId), d = v_(l + u.reduce((e, t) => e + t.quantityBase, 0) >= t.originalQuantityBase - 1e-8 ? t.originalValue - u.reduce((e, t) => e + t.inventoryValue, 0) : t.originalValue * l / t.originalQuantityBase);
				return {
					...t,
					quantity: e.quantity,
					quantityBase: l,
					inventoryValue: d
				};
			}), l = /* @__PURE__ */ new Map();
			for (let e of c) l.set(e.invoiceLineId, __((l.get(e.invoiceLineId) ?? 0) + e.quantity));
			let u = n.creditNoteId ? G.getById(n.creditNoteId) : void 0;
			if (n.creditNoteId) {
				if (!u || u.sourceInvoiceId !== a.id || ["VOID", "DRAFT"].includes(u.status) || u.creditDate > n.returnDate) throw Error("Select an issued credit for this invoice dated before receipt.");
				for (let [e, t] of l) {
					let n = u.lines.find((t) => t.id === e)?.quantity ?? 0;
					if (t + p_.filter((e) => e.status === "POSTED" && e.creditNoteId === u.id).flatMap((e) => e.lines).filter((t) => t.invoiceLineId === e).reduce((e, t) => e + t.quantity, 0) > n + 1e-8) throw Error("Physical return exceeds the linked credit quantities.");
				}
			} else u = K.createCreditNoteFromInvoice({
				invoiceId: a.id,
				creditDate: n.returnDate,
				reason: n.reason,
				lines: [...l].map(([e, t]) => ({
					...a.lines.find((t) => t.id === e),
					quantity: t
				}))
			});
			let d = crypto.randomUUID(), f = "CRTN-" + String(p_.length + 1).padStart(6, "0"), p = c.map((e) => {
				pi.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = Rr.create({
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
				}), r = ci({
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
			}), m = v_(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? F.post({
				journalDate: n.returnDate,
				description: "Customer goods returned " + f,
				sourceType: "CUSTOMER_RETURN",
				sourceId: d,
				lines: [{
					accountId: P.requireBySystemRole("INVENTORY").id,
					debit: m,
					credit: 0
				}, {
					accountId: P.requireBySystemRole("COST_OF_GOODS_SOLD").id,
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
			return p_ = [g, ...p_], g_(), g;
		},
		reverse(t) {
			let n = O.require("sales.payment"), r = e({
				id: X,
				reversalDate: X,
				reason: E().trim().min(3).max(2e3)
			}).strict().parse(t), i = p_.find((e) => e.id === r.id);
			if (!i) throw Error("Customer return not found.");
			if (i.status === "REVERSED") return i;
			if (w(r.reversalDate), Qn(r.reversalDate), M(), r.reversalDate < i.returnDate) throw Error("Reversal precedes the return.");
			let a = /* @__PURE__ */ new Map();
			for (let e of i.lines) {
				y_(e.siteId, e.productId, r.reversalDate);
				let t = e.siteId + "|" + e.productId, n = a.get(t) ?? {
					quantity: 0,
					value: 0
				};
				a.set(t, {
					quantity: __(n.quantity + e.quantityBase),
					value: v_(n.value + e.inventoryValue)
				});
			}
			for (let [e, t] of a) {
				let [n, r] = e.split("|"), i = Hr.getBalance(n, r);
				if ((pi.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t.quantity || (i?.inventoryValue ?? 0) + .001 < t.value || Math.abs((i?.quantityOnHand ?? 0) - t.quantity) < 1e-8 && Math.abs((i?.inventoryValue ?? 0) - t.value) > .001) throw Error("Returned stock/value has been used; restore stock availability before reversal.");
			}
			let o = G.getById(i.creditNoteId);
			if (i.ownsCredit && ((o.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > r.reversalDate) || G.getAllocationsByCreditNote(o.id).some((e) => (e.reversedAt ? ve(e.reversedAt) : e.allocationDate) > r.reversalDate))) throw Error("Return reversal precedes later credit settlement activity.");
			p_ = p_.map((e) => e.id === i.id ? {
				...e,
				status: "REVERSED"
			} : e), i.ownsCredit && K.voidCreditNote({
				creditNoteId: i.creditNoteId,
				reason: r.reason,
				voidDate: r.reversalDate
			});
			let s = i.lines.map((e) => {
				pi.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = Rr.create({
					movementType: "RETURN_OUT",
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: -e.quantityBase,
					transactionUnitId: e.unitId,
					transactionUnitSymbol: Rr.getAll().find((t) => t.id === e.movementId)?.transactionUnitSymbol ?? "",
					transactionQuantity: -e.quantity,
					conversionToBase: e.conversionToBase,
					referenceType: "CUSTOMER_RETURN_VOID",
					referenceId: i.id,
					referenceNumber: i.number,
					occurredAt: r.reversalDate,
					notes: r.reason
				}), n = Hr.requireBalance(e.siteId, e.productId), a = __(n.quantityOnHand - e.quantityBase), o = v_(n.inventoryValue - e.inventoryValue), s = a ? yr(o / a) : 0;
				Hr.save({
					...n,
					quantityOnHand: a,
					inventoryValue: o,
					averageCostPerBaseUnit: s,
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				});
				let c = Jr.create({
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
			i.journalId && F.reverse({
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
			return p_ = p_.map((e) => e.id === i.id ? c : e), g_(), c;
		}
	},
	read: "inventory.cost.read",
	commands: {
		create: "sales.payment",
		reverse: "sales.payment"
	},
	snapshot: () => ({ returns: p_ }),
	restore: (e) => {
		p_ = e.returns;
	},
	publish: g_,
	validate: (t, n) => {
		let r = e({ returns: s(f_) }).strict().parse(t), i = n, a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map();
		for (let e of r.returns) {
			let t = u_.parse(JSON.parse(e.fingerprint));
			if (w(e.returnDate), a.has(e.operationId) || t.operationId !== e.operationId || t.invoiceId !== e.invoiceId || t.returnDate !== e.returnDate || t.reason !== e.reason || t.lines.length !== e.lines.length || e.ownsCredit !== !t.creditNoteId || t.creditNoteId && t.creditNoteId !== e.creditNoteId) throw Error("Customer return request mismatch.");
			a.add(e.operationId);
			let n = i.sales.invoices.find((t) => t.id === e.invoiceId && t.customerId === e.customerId), r = i.customerCredits.creditNotes.find((t) => t.id === e.creditNoteId && t.sourceInvoiceId === e.invoiceId);
			if (!n || !r || e.status === "POSTED" && r.status === "VOID" || e.status === "REVERSED" && e.ownsCredit && r.status !== "VOID" || v_(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue || new Set(e.lines.map((e) => e.costMovementId)).size !== e.lines.length) throw Error("Customer return source or totals mismatch.");
			for (let r of e.lines) {
				let a = t.lines.find((e) => e.costMovementId === r.costMovementId && e.invoiceLineId === r.invoiceLineId), s = i.costMovements.movements.find((e) => e.id === r.costMovementId), c = i.costMovements.movements.find((e) => e.id === r.restoredCostId), l = i.inventoryMovements.movements.find((e) => e.id === r.movementId), u = i.fulfilments.fulfilments.find((e) => e.id === r.fulfilmentId);
				if (!a || a.quantity !== r.quantity || !u || u.salesOrderId !== n.sourceSalesOrderId || !s || s.referenceType !== "SALE" || s.referenceId !== u.id || s.productId !== r.productId || s.siteId !== r.siteId || __(r.quantity * r.conversionToBase) !== r.quantityBase || !c || c.referenceType !== "CUSTOMER_RETURN" || c.referenceId !== e.id || c.inventoryMovementId !== r.movementId || c.quantityBase !== r.quantityBase || c.valueChange !== r.inventoryValue || !l || l.referenceId !== e.id || l.quantityBase !== r.quantityBase || ve(c.occurredAt) !== e.returnDate) throw Error("Customer return inventory/cost references mismatch.");
				if (e.status === "POSTED") {
					if (u.status !== "ACTIVE") throw Error("Active customer return has a void dispatch.");
					let e = o.get(s.id) ?? {
						quantity: 0,
						value: 0
					}, t = {
						quantity: __(e.quantity + r.quantityBase),
						value: v_(e.value + r.inventoryValue)
					};
					if (o.set(s.id, t), t.quantity > -s.quantityBase + 1e-8 || t.value > -s.valueChange + .001) throw Error("Customer returns exceed original dispatched stock/cost.");
				}
				if (e.status === "REVERSED") {
					let t = i.costMovements.movements.find((e) => e.id === r.reversalCostId);
					if (!t || t.referenceType !== "CUSTOMER_RETURN_VOID" || t.referenceId !== e.id || t.inventoryMovementId !== r.reversalMovementId || t.quantityBase !== -r.quantityBase || t.valueChange !== -r.inventoryValue || ve(t.occurredAt) !== e.reversalDate) throw Error("Customer return reversal references mismatch.");
				}
			}
			if (e.status === "POSTED") for (let t of e.lines) {
				let n = e.creditNoteId + "|" + t.invoiceLineId, i = __((c.get(n) ?? 0) + t.quantity);
				if (c.set(n, i), !r.lines.some((e) => e.id === t.invoiceLineId && e.quantity + 1e-8 >= i)) throw Error("Customer returns exceed linked credit quantity.");
			}
			for (let t of new Set(e.lines.map((e) => e.invoiceLineId))) {
				let n = __(e.lines.filter((e) => e.invoiceLineId === t).reduce((e, t) => e + t.quantity, 0));
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
//#region electron/security/documentRecycleRepository.ts
var x_ = E().trim().min(1).max(200), S_ = E().regex(/^[a-f0-9]{64}$/), C_ = (e) => Array.isArray(e) ? e.map(C_) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, C_(e[t])])) : e, w_ = (e) => Oe("sha256").update(JSON.stringify(C_(e))).digest("hex"), T_ = (e) => e === "Purchase order" || e === "Expense bill draft" ? "purchases.read" : "sales.read", E_ = (e) => e === "Quote" ? "sales.write" : e === "Purchase order" ? "purchases.write" : e === "Expense bill draft" ? "purchases.bill" : "sales.manage";
function D_(e, t) {
	let [n, r] = oe[e];
	return (t[n]?.[r] ?? []).filter((t) => e === "Sales order draft" ? t.kind === "ORDER" : e !== "Invoice draft" || t.kind === "INVOICE");
}
function O_(e, t, n) {
	let r = D_(e, n).find((e) => e.id === t);
	if (!r) throw Error("Document was not found in the selected dataset.");
	return r;
}
function k_(e, t, n) {
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
function A_(e, n = t()) {
	return xe.filter((t) => g(e, T_(t))).flatMap((t) => D_(t, n).map((r) => {
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
			token: w_({
				record: r,
				lifecycle: i?.id ?? ""
			}),
			deleted: i?.action === "Trashed",
			last: i,
			canWrite: g(e, E_(t)),
			issues: k_(t, r, n)
		};
	}));
}
var j_ = e({
	operationId: x_,
	action: T(["Trashed", "Recovered"]),
	reason: E().trim().min(3).max(2e3),
	records: s(e({
		kind: T(xe),
		recordId: x_,
		token: S_
	}).strict()).min(1).max(100)
}).strict(), M_ = e({
	id: x_,
	operationId: x_,
	fingerprint: S_,
	kind: T(xe),
	recordId: x_,
	action: T([
		"Trashed",
		"Recovered",
		"Purged"
	]),
	actorId: x_,
	at: Me(),
	reason: E().trim().min(3).max(2e3),
	recordToken: S_,
	contentToken: S_
}).strict(), N_ = s(e({
	kind: T(xe),
	recordId: x_,
	token: S_
}).strict()).min(1).max(100), P_ = e({
	operationId: x_,
	records: N_,
	expectedDigest: S_,
	reason: E().trim().min(10).max(2e3),
	confirmation: E()
}).strict(), F_ = e({
	id: de(),
	fileName: E().regex(/^pre-purge-[a-f0-9-]+\.json$/),
	sha256: S_,
	createdAt: Me()
}).strict().refine((e) => e.fileName === `pre-purge-${e.id}.json`, "Backup filename and identity must match."), I_ = e({
	previewDigest: S_,
	confirmation: E(),
	backup: F_,
	label: x_,
	reservedNumber: x_.optional(),
	creationOperationId: x_.optional()
}).strict(), L_ = M_.extend({ purge: I_.optional() }), R_ = /* @__PURE__ */ new Map();
function z_() {
	let e = O.require("users.manage");
	if (!e.roles.includes("ADMIN")) throw Error("Only an ADMIN may permanently purge documents.");
	return e;
}
function B_(e, t) {
	if (typeof e == "string") {
		if (e === t || e.startsWith(t + ":")) return !0;
		if ((e.startsWith("{") || e.startsWith("[")) && e.length < 5e7) try {
			return B_(JSON.parse(e), t);
		} catch {}
		return !1;
	}
	return Array.isArray(e) ? e.some((e) => B_(e, t)) : !!e && typeof e == "object" && Object.values(e).some((e) => B_(e, t));
}
function V_(e, t, n) {
	let r = k_(e, t, n), [i, a] = oe[e];
	for (let [o, s] of Object.entries(n)) {
		if (o === "documentRecycle") continue;
		let n = s;
		if (o === i && (n = {
			...s,
			[a]: s[a].filter((e) => e.id !== t.id)
		}), o === "financialCache" && e === "Purchase order") {
			let e = s.purchaseOrders?.find((e) => e.id === t.id);
			(!e || w_(e) !== w_(t)) && r.push("Purchase order cache does not match its source."), n = {
				...s,
				purchaseOrders: s.purchaseOrders.filter((e) => e.id !== t.id)
			};
		}
		B_(n, t.id) && r.push(`Referenced by ${o}; permanent purge is blocked.`);
	}
	return B_(A.list(), t.id) && r.push("Referenced by the financial operation journal."), [...new Set(r)];
}
function H_(e, t) {
	if (new Set(e.map((e) => e.recordId)).size !== e.length) throw Error("Select each document only once.");
	return e.map((e) => {
		let n = O_(e.kind, e.recordId, t), r = me().findLast((t) => t.recordId === e.recordId);
		if (w_({
			record: n,
			lifecycle: r?.id ?? ""
		}) !== e.token) throw Error("Document changed. Refresh the selection.");
		let i = V_(e.kind, n, t);
		return r?.action !== "Trashed" && i.push("Move this draft to the recycle bin before permanent purge."), {
			...e,
			label: n.documentNumber ?? n.purchaseOrderNumber ?? `${n.kind} · ${n.id}`,
			blockers: i
		};
	});
}
function U_(e, t) {
	return w_({
		records: e,
		snapshots: t,
		operations: A.list()
	});
}
i("documentRecycle", {
	repository: {
		preparePurge(n) {
			let r = z_(), i = e({ records: N_ }).strict().parse(n), a = t(), o = H_(i.records, a), s = w_({
				nonce: crypto.randomUUID(),
				actor: r.userId,
				evidence: U_(i.records, a)
			}), c = Date.now() + 3e5;
			for (let [e, t] of R_) t.expires < Date.now() && R_.delete(e);
			return R_.size >= 100 && R_.delete(R_.keys().next().value), R_.set(s, {
				actor: r.userId,
				expires: c,
				evidence: U_(i.records, a)
			}), {
				digest: s,
				expiresAt: new Date(c).toISOString(),
				rows: o,
				confirmation: `PURGE ${o.length} DRAFTS`,
				eligible: o.every((e) => !e.blockers.length)
			};
		},
		purge(e) {
			let n = z_(), r = P_.parse(e), i = w_({
				input: r,
				actorId: n.userId
			}), a = me().filter((e) => e.operationId === r.operationId);
			if (a.length) {
				if (a[0].fingerprint !== i) throw Error("Operation ID has different purge data.");
				return structuredClone(a);
			}
			let o = t(), s = R_.get(r.expectedDigest);
			if (!s || s.actor !== n.userId || s.expires < Date.now() || s.evidence !== U_(r.records, o)) throw Error("Purge preview expired or data changed. Prepare a fresh preview.");
			let c = H_(r.records, o);
			if (r.confirmation !== `PURGE ${c.length} DRAFTS`) throw Error("Type the exact permanent purge confirmation.");
			if (c.some((e) => e.blockers.length)) throw Error(c.flatMap((e) => e.blockers).join(" "));
			let l = F_.parse(u()), d = (/* @__PURE__ */ new Date()).toISOString(), f = c.map((e) => {
				let t = O_(e.kind, e.recordId, o);
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
					contentToken: w_(t),
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
			return k.transaction(() => {
				p("Quote").size && gu(p("Quote")), p("Purchase order").size && kn(p("Purchase order"));
				let e = /* @__PURE__ */ new Set([
					...p("Sales order draft"),
					...p("Invoice draft"),
					...p("Expense bill draft")
				]);
				e.size && pf(e), Ce([...me(), ...f]);
			}), structuredClone(f);
		},
		list() {
			return A_(O.require("inventory.read"));
		},
		detail(e, n) {
			return e = T(xe).parse(e), O.require("inventory.read"), O.require(T_(e)), structuredClone(O_(e, x_.parse(n), t()));
		},
		change(e) {
			let n = j_.parse(e), r = O.require("inventory.read");
			n.records.forEach((e) => {
				O.require(T_(e.kind)), O.require(E_(e.kind));
			});
			let i = w_({
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
				let t = O_(e.kind, e.recordId, o);
				if (w_({
					record: t,
					lifecycle: me().findLast((t) => t.recordId === e.recordId)?.id ?? ""
				}) !== e.token) throw Error("Document changed. Refresh and review the selection again.");
				if (_e(e.recordId) !== (n.action === "Recovered")) throw Error("Document recycle state changed. Refresh the selection.");
				let r = k_(e.kind, t, o);
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
				contentToken: w_(O_(e.kind, e.recordId, o))
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
	view: (e) => ({ history: me().filter((t) => g(e, T_(t.kind))) }),
	validate: (t, n) => {
		let { history: r } = e({ history: s(L_) }).strict().parse(t), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
		for (let e of r) {
			if (i.has(e.id)) throw Error("Duplicate recycle event.");
			i.add(e.id);
			let t = r.findLast((t) => t.recordId === e.recordId);
			if (r.some((t) => t.recordId === e.recordId && t.kind !== e.kind)) throw Error("Recycle document kind changed.");
			let s = t.action === "Purged" ? void 0 : O_(e.kind, e.recordId, n);
			if (a.get(e.recordId) === "Purged" || e.action === "Purged" && a.get(e.recordId) !== "Trashed") throw Error("Invalid permanent purge lifecycle.");
			if (e.action === "Purged") {
				if (e.reason.trim().length < 10) throw Error("Permanent purge reason is too short.");
				if (!e.purge || D_(e.kind, n).some((t) => t.id === e.recordId)) throw Error("Purged source must be absent and its backup receipt retained.");
				if (r.slice(0, r.indexOf(e)).findLast((t) => t.recordId === e.recordId)?.contentToken !== e.contentToken) throw Error("Purge content receipt changed.");
				for (let [t, r] of Object.entries(n)) if (t !== "documentRecycle" && B_(r, e.recordId)) throw Error("Purged document still has references.");
				if (xe.flatMap((e) => D_(e, n)).some((t) => e.purge?.creationOperationId && t.operationId === e.purge.creationOperationId || e.purge?.reservedNumber && (t.documentNumber === e.purge.reservedNumber || t.purchaseOrderNumber === e.purge.reservedNumber))) throw Error("Purged document identity was reused.");
			} else if (e.purge) throw Error("Unexpected permanent purge receipt.");
			if ((a.get(e.recordId) ?? "Recovered") === e.action) throw Error("Invalid recycle lifecycle sequence.");
			if (!r.slice(r.indexOf(e) + 1).some((t) => t.recordId === e.recordId) && e.action === "Trashed" && (k_(e.kind, s, n).length || w_(s) !== e.contentToken)) throw Error("Recycled document content or references changed.");
			a.set(e.recordId, e.action), o.set(e.operationId, [...o.get(e.operationId) ?? [], e]);
		}
		for (let e of o.values()) {
			let t = e[0], n = e.map((e) => ({
				kind: e.kind,
				recordId: e.recordId,
				token: e.recordToken
			}));
			if (new Set(n.map((e) => e.recordId)).size !== n.length || e.some((e) => e.fingerprint !== t.fingerprint || e.action !== t.action || e.actorId !== t.actorId || e.at !== t.at || e.reason !== t.reason) || w_({
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
			}) !== t.fingerprint || t.action === "Purged" && (t.purge?.confirmation !== `PURGE ${n.length} DRAFTS` || e.some((e) => w_(e.purge?.backup) !== w_(t.purge?.backup) || e.purge?.previewDigest !== t.purge?.previewDigest || e.purge?.confirmation !== t.purge?.confirmation))) throw Error("Invalid recycle operation receipt.");
		}
	}
});
//#endregion
//#region src/features/contacts/schemas/supplierSchemas.ts
var W_ = ["ACTIVE", "INACTIVE"], G_ = E().trim().refine((e) => e === "" || E().email().safeParse(e).success, { message: "Enter a valid email address" }), K_ = E().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), q_ = e({
	businessName: E().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: E().trim().max(120, "Trading name is too long"),
	abn: K_,
	status: T(W_),
	email: G_,
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
}), J_ = e({
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
}).strict(), Y_ = e({
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
	units: s(J_).min(1),
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
}).strict(), X_ = /* @__PURE__ */ new Set(), Z_ = [...Yt];
function Q_() {
	Z_ = [...Yt], X_.forEach((e) => e());
}
function $_(e, t, n) {
	if (Array.isArray(e)) return e.some((e) => $_(e, t, n));
	if (!e || typeof e != "object") return !1;
	let r = e;
	return r.productId === t && (!n || r.unitId === n) || Object.values(r).some((e) => $_(e, t, n));
}
function ev(e) {
	let t = s(Y_).parse(e), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.id) || r.has(e.sku.toLowerCase())) throw Error("Duplicate product ID or SKU.");
		if (n.add(e.id), r.add(e.sku.toLowerCase()), !Kt(e) && e.buyEnabled !== !1) throw Error("Non-stock/service catalogue items must use expense bills for purchasing.");
		if (!Kt(e) && ((e.reorderPoint ?? 0) !== 0 || (e.targetStock ?? 0) !== 0)) throw Error("Non-stock/service items cannot have stock reorder thresholds.");
		if (Kt(e) && e.units.some((e) => e.code === "HOUR" || e.code === "JOB")) throw Error("Hour/job units require non-stock or service items.");
		if (new Set(e.units.map((e) => e.id)).size !== e.units.length || e.units.filter((e) => e.isBaseUnit).length !== 1 || !e.units.some((t) => t.id === e.baseUnitId && t.isBaseUnit && t.conversionToBase === 1)) throw Error("A product needs exactly one valid base unit.");
		if ((e.targetStock ?? 0) < (e.reorderPoint ?? 0)) throw Error("Target stock must be at least the reorder point.");
	}
	return t;
}
var tv = {
	subscribe(e) {
		return X_.add(e), () => {
			X_.delete(e);
		};
	},
	getSnapshot: () => Z_,
	getAll: () => Yt,
	getById: (e) => Yt.find((t) => t.id === e),
	save(e, n) {
		let r = Y_.parse(e), i = Yt.find((e) => e.id === r.id);
		if (i && n !== (i.revision ?? 0)) throw Error("Product changed since it was opened. Reload before saving.");
		if (!i && n !== void 0) throw Error("Product no longer exists.");
		if (ue(r.taxCode ?? "GST"), !Kt(r) && r.buyEnabled !== !1) throw Error("Non-stock and service catalogue items are sales-only. Use expense/service bills for supplier costs.");
		let a = t();
		if (delete a.products, i) {
			let e = { ...a };
			if (delete e.costingPolicies, (i.itemType ?? "STOCK") !== (r.itemType ?? "STOCK") && $_(e, r.id)) throw Error("A referenced product cannot change item type. Create a new catalogue item.");
			if (i.baseUnitId !== r.baseUnitId && $_(a, r.id)) throw Error("A referenced product cannot change base unit.");
			for (let e of i.units) {
				let t = r.units.find((t) => t.id === e.id);
				if ((!t || t.conversionToBase !== e.conversionToBase || t.code !== e.code) && $_(a, r.id, e.id)) throw Error("A referenced unit conversion cannot be changed or removed. Add a new unit instead.");
			}
		}
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			...r,
			createdAt: i?.createdAt ?? o,
			updatedAt: o,
			revision: (i?.revision ?? 0) + 1
		};
		return ev([...Yt.filter((e) => e.id !== r.id), s]), i ? Yt.splice(Yt.indexOf(i), 1, s) : Yt.push(s), $r.ensureProductPolicy(s.id, s.baseUnitId, Kt(s)), i && Kt(i) !== Kt(s) && $r.setActive(s.id, Kt(s)), Q_(), s;
	}
};
i("products", {
	validate: (e, t) => {
		let n = ev(e.products), r = t.workspace_tax_codes.records, i = t.costingPolicies.policies, a = t.stock.balances;
		for (let e of n.filter((e) => !Kt(e))) if (i.some((t) => t.productId === e.id && t.active) || a.some((t) => t.productId === e.id && t.quantityOnHand !== 0)) throw Error("Non-stock/service product has inventory activity or active costing.");
		if (n.some((e) => !r.some((t) => t.code === (e.taxCode ?? "GST")))) throw Error("Backup product tax-code reference is invalid.");
	},
	repository: tv,
	read: "inventory.read",
	commands: { save: "inventory.adjust" },
	snapshot: () => ({ products: structuredClone(Yt) }),
	restore: (e) => {
		let t = ev(e.products);
		Yt.splice(0, Yt.length, ...t), Z_ = [...Yt];
	},
	publish: Q_
});
//#endregion
//#region electron/security/transferRepository.ts
var nv = E().trim().min(1).max(200), rv = E().trim().min(1).max(2e3), iv = (e) => Array.isArray(e) ? e.map(iv) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).filter(([, e]) => e !== void 0).sort(([e], [t]) => e < t ? -1 : +(e > t)).map(([e, t]) => [e, iv(t)])) : e, av = (e) => Oe("sha256").update(JSON.stringify(iv(e))).digest("hex"), ov = [], sv = (e, t = !1) => {
	O.require("inventory.read");
	let n = O.require(Wa[e].read);
	return t && O.require(Wa[e].write), n.userId;
};
function cv(e) {
	return e === "Customers" ? W.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Suppliers" ? pn.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Products" ? tv.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : W.getAll().flatMap((t) => (e === "Customer branches" ? t.locations : t.contacts).map((e) => ({
		id: e.id,
		parentId: t.id,
		raw: e
	})));
}
function lv(e, t) {
	let n = {};
	for (let [r, i] of Object.entries(Ha[e])) n[r] = String(t.raw[r] ?? i);
	if ((e === "Customer branches" || e === "Customer contacts") && (n.customerId = t.parentId), e === "Products") {
		let e = t.raw;
		n.taxCode = e.taxCode ?? "", n.itemType = e.itemType ?? "STOCK", n.buyEnabled = String(e.buyEnabled ?? (e.itemType === void 0 || e.itemType === "STOCK")), n.baseUnitCode = e.units.find((t) => t.id === e.baseUnitId).code, n.unitsJson = JSON.stringify(e.units);
	}
	return n;
}
function uv(e, t) {
	return {
		_format: Ba,
		id: t.id,
		recordToken: av({
			parentId: t.parentId,
			record: t.raw
		}),
		externalId: ov.filter((t) => t.dataset === e).flatMap((e) => e.results).find((e) => e.action === "Created" && e.recordId === t.id)?.externalId ?? "",
		...lv(e, t)
	};
}
function dv(e, t) {
	if (!/^-?\d+(?:\.\d+)?$/.test(e) || !Number.isFinite(Number(e)) || Math.abs(Number(e)) > 2 ** 53 - 1) throw Error(`${t} must contain a safe plain number.`);
	return Number(e);
}
function fv(e, t, n) {
	let r = n ? lv(e, n) : { ...Ha[e] };
	for (let n of Object.keys(Ha[e])) if (Object.hasOwn(t, n)) {
		let i = t[n].trim();
		if (typeof Ha[e][n] == "number") r[n] = dv(i, n);
		else if (typeof Ha[e][n] == "boolean") {
			if (!["true", "false"].includes(i)) throw Error(`${n} must be true or false.`);
			r[n] = i === "true";
		} else r[n] = i.trim();
	}
	if (n) for (let [n, i] of Object.entries(Ha[e])) Object.hasOwn(t, n) || (typeof i == "number" && (r[n] = Number(r[n])), typeof i == "boolean" && (r[n] = r[n] === "true"));
	return r;
}
var pv = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), mv = (e, t) => e.some((e) => e.reasons.some((n) => !t.some((t) => t.id === e.id && t.reasons.includes(n))));
function hv(e, t) {
	return t.map((t) => ({
		id: t.id,
		reasons: [
			...pv(t.businessName) === pv(e.businessName) ? ["Name"] : [],
			...e.email && t.email?.toLowerCase() === e.email.toLowerCase() ? ["Email"] : [],
			...e.abn && pv(t.abn) === pv(e.abn) ? ["Identifier"] : []
		]
	})).filter((e) => e.reasons.length);
}
function gv(t, n, r, i = !1) {
	let a = r.id ? cv(t).find((e) => e.id === r.id) : void 0;
	if (n === "Update by ID") {
		if (!a) throw Error("Existing record ID was not found.");
		if (!i && (!r.recordToken || r.recordToken !== uv(t, a).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
	} else if (r.id || r.recordToken) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
	if (n === "Update by ID" && r.externalId && r.externalId !== uv(t, a).externalId) throw Error("External source IDs cannot be reassigned by an update. Keep the export value or leave it blank.");
	let o = n === "Update by ID" ? a : void 0, c = o ? uv(t, o) : null, l = fv(t, r, o), u;
	if (t === "Customers") {
		let e = uc.strict().parse(l), t = W.getAll().filter((e) => e.id !== o?.id);
		if (mv(Ia({
			kind: "Customer",
			customerId: "",
			values: e
		}, t), o ? Ia({
			kind: "Customer",
			customerId: "",
			values: o.raw
		}, t) : [])) throw Error("Possible existing customer duplicate. Use the customer review workflow or explicit ID update.");
		u = o ? W.update(o.id, e) : W.create(e);
	} else if (t === "Suppliers") {
		let e = q_.strict().parse(l), t = pn.getAll().filter((e) => e.id !== o?.id);
		if (mv(hv(e, t), o ? hv(o.raw, t) : [])) throw Error("Possible existing supplier duplicate. Resolve it before import.");
		u = o ? pn.update(o.id, e) : pn.create(e);
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
		let h = Y_.parse({
			...p,
			id: o?.id ?? crypto.randomUUID(),
			baseUnitId: a.id,
			units: i,
			createdAt: n?.createdAt ?? m,
			updatedAt: m
		});
		u = tv.save(h, n?.revision ?? (o ? 0 : void 0));
	} else {
		let e = String(l.customerId), n = W.getById(e);
		if (!n || n.status === "INACTIVE") throw Error("Select an existing, non-inactive parent customer.");
		if (o && o.parentId !== e) throw Error("Existing branch/contact cannot move to a different customer.");
		let { customerId: r, ...i } = l, a = t === "Customer branches" ? "Branch" : "Contact", s = a === "Branch" ? dc.strict().parse(i) : fc.strict().parse(i);
		if (mv(Ia({
			kind: a,
			customerId: e,
			values: s
		}, [n]).filter((e) => e.id !== o?.id), o ? Ia({
			kind: a,
			customerId: e,
			values: o.raw
		}, [n]).filter((e) => e.id !== o.id) : [])) throw Error("Possible existing branch/contact duplicate. Use customer review or explicit ID update.");
		u = a === "Branch" ? o ? W.updateLocation(e, o.id, s) : W.addLocation(e, s) : o ? W.updateContact(e, o.id, s) : W.addContact(e, s);
	}
	let d = cv(t).find((e) => e.id === u.id);
	return {
		recordId: u.id,
		before: c,
		after: uv(t, d)
	};
}
function _v(e) {
	if (sv(e.dataset, !0), Buffer.byteLength(e.text, "utf8") > 1e6) throw Error("CSV source exceeds 1 MB of UTF-8 text.");
	let n = Ka(e), r = new Map(cv(e.dataset).map((t) => [t.id, uv(e.dataset, t)])), i = t(), a = av({
		input: e,
		master: i
	}), o = /* @__PURE__ */ new Set(), s = [], c = [];
	try {
		for (let t of n.rows) {
			let n = t.values, i = (n.externalId ?? "").trim(), a = av({
				dataset: e.dataset,
				values: Object.fromEntries(Object.keys(Ha[e.dataset]).filter((e) => Object.hasOwn(n, e)).map((e) => [e, n[e]]))
			}), l = e.mode === "Create" ? i : n.id, u = "", d;
			try {
				if (!l) throw Error(e.mode === "Create" ? "externalId is required for safe create retries." : "id is required for explicit updates.");
				if (l.length > 200 || i.length > 200) throw Error("Import identity exceeds 200 characters.");
				if (o.has(l)) throw Error("Repeated identity in this CSV file.");
				if (o.add(l), e.mode === "Create" && (n.id || n.recordToken)) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
				if (e.mode === "Update by ID" && (!r.has(n.id) || n.recordToken !== r.get(n.id).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
				let c = e.mode === "Create" ? ov.filter((t) => t.dataset === e.dataset).flatMap((e) => e.results).find((e) => e.action === "Created" && e.externalId === i) : void 0;
				if (c) {
					if (c.identityFingerprint !== a) throw Error("Source externalId already contains different creation data. Use an explicit ID update.");
					let n = cv(e.dataset).find((e) => e.id === c.recordId);
					if (!n) throw Error("Prior imported record is missing.");
					d = {
						row: t.row,
						externalId: i,
						recordId: n.id,
						action: "Skipped",
						identityFingerprint: a,
						before: null,
						after: uv(e.dataset, n)
					};
				} else {
					let o = gv(e.dataset, e.mode, n, !0);
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
				let r = cv(e.dataset).find((e) => e.id === n.recordId), a = uv(e.dataset, r);
				if (t.values = Object.fromEntries(Object.keys(Ha[e.dataset]).filter((e) => Object.hasOwn(a, e)).map((e) => [e, a[e]])), e.dataset === "Products") {
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
var vv = {
	review(e) {
		return _v(Ga.parse(e)).preview;
	},
	commit(e) {
		let t = Ga.extend({
			operationId: nv,
			expectedPreview: E().regex(/^[a-f0-9]{64}$/),
			reason: rv
		}).strict().parse(e), n = sv(t.dataset, !0), { operationId: r, expectedPreview: i, reason: a, ...o } = t, s = av({
			source: o,
			reason: a
		}), c = ov.find((e) => e.operationId === r);
		if (c) {
			if (c.fingerprint !== s) throw Error("Operation ID already has different import data.");
			return structuredClone(c);
		}
		let l = _v(o);
		if (l.preview.fingerprint !== i) throw Error("Business records or import fields changed. Validate the file again.");
		if (!l.preview.valid) throw Error("Resolve every validation error before committing the batch.");
		let u = Ka(o), d = new Set(u.rows.map((e) => e.values.customerId || cv(o.dataset).find((t) => t.id === e.values.id)?.parentId || "")), f = (e) => JSON.stringify({
			primaryLocationId: e.primaryLocationId,
			primaryContactId: e.primaryContactId,
			locations: e.locations,
			contacts: e.contacts
		}), p = ["Customer branches", "Customer contacts"].includes(o.dataset) ? W.getAll().filter((e) => d.has(e.id)).map((e) => ({
			customerId: e.id,
			before: f(e)
		})) : [], m = [];
		for (let [e, t] of u.rows.entries()) {
			let n = l.results[e];
			n.action === "Skipped" ? m.push(n) : m.push({
				...n,
				...gv(o.dataset, o.mode, t.values, !0),
				before: n.before
			});
		}
		for (let e of m) {
			let t = cv(o.dataset).find((t) => t.id === e.recordId);
			e.after = uv(o.dataset, t), e.action === "Created" && (e.after.externalId = e.externalId);
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
				after: f(W.getById(e.customerId))
			})).filter((e) => e.before !== e.after)
		};
		return xv.parse(h), ov = [...ov, h], structuredClone(h);
	},
	export(e) {
		e = T(Ra).parse(e), sv(e);
		let t = Ua(e), n = cv(e).map((t) => uv(e, t));
		return {
			dataset: e,
			count: n.length,
			csv: qa([t, ...n.map((e) => t.map((t) => e[t] ?? ""))])
		};
	},
	template(e) {
		e = T(Ra).parse(e), sv(e);
		let t = Ua(e).filter((e) => !["id", "recordToken"].includes(e)), n = {
			_format: Ba,
			externalId: "replace-with-stable-source-id",
			...Object.fromEntries(Object.entries(Ha[e]).map(([e, t]) => [e, String(t)]))
		};
		return (e === "Customers" || e === "Suppliers") && (n.businessName = "Replace company name"), e === "Suppliers" && (n.country = "Replace country"), e === "Customer branches" && (n.name = "Replace branch name", n.addressLine1 = "Replace address", n.suburb = "Replace city", n.state = "Replace region", n.postcode = "Replace postcode", n.country = "Replace country"), e === "Customer contacts" && (n.firstName = "Replace", n.lastName = "Name", n.email = "replace@example.test"), e === "Products" && (n.sku = "REPLACE-SKU", n.name = "Replace product name"), qa([t, t.map((e) => n[e] ?? "")]);
	}
}, yv = se(E(), E()), bv = e({
	row: f().int().min(2).max(501),
	externalId: E().max(200),
	recordId: nv,
	action: T([
		"Created",
		"Updated",
		"Skipped"
	]),
	identityFingerprint: E().regex(/^[a-f0-9]{64}$/),
	before: yv.nullable(),
	after: yv
}).strict(), xv = e({
	id: nv,
	operationId: nv,
	fingerprint: E().regex(/^[a-f0-9]{64}$/),
	dataset: T(Ra),
	mode: T(za),
	fileName: nv,
	sourceHash: E().regex(/^[a-f0-9]{64}$/),
	actorId: nv,
	at: E().refine((e) => new Date(e).toISOString() === e),
	reason: rv,
	results: s(bv).min(1).max(500),
	parentChanges: s(e({
		customerId: nv,
		before: E().max(5e6),
		after: E().max(5e6)
	}).strict()).max(500)
}).strict();
i("dataTransfers", {
	repository: vv,
	read: "inventory.read",
	commands: {
		review: "inventory.read",
		commit: "inventory.read",
		export: "inventory.read",
		template: "inventory.read"
	},
	snapshot: () => ({ runs: ov }),
	restore: (e) => {
		ov = e.runs;
	},
	publish: () => {},
	view: (e) => ({ runs: ov.filter((t) => g(e, Wa[t.dataset].read)) }),
	validate: (t, n) => {
		let r = e({ runs: s(xv) }).strict().parse(t), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set();
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
				if (e.before && (Object.keys(e.before).some((e) => !Ua(t.dataset).includes(e)) || e.before._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(e.before.recordToken))) throw Error("Invalid import before-state audit.");
				if (Object.keys(e.after).some((e) => !Ua(t.dataset).includes(e)) || e.after._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(e.after.recordToken)) throw Error("Invalid import audit fields.");
			}
			if (new Set(t.parentChanges.map((e) => e.customerId)).size !== t.parentChanges.length || t.parentChanges.length && !["Customer branches", "Customer contacts"].includes(t.dataset)) throw Error("Invalid import parent audit.");
			for (let n of t.parentChanges) {
				if (!r.some((e) => e.id === n.customerId)) throw Error("Invalid import parent reference.");
				for (let t of [n.before, n.after]) {
					let n = e({
						primaryLocationId: E().optional(),
						primaryContactId: E().optional(),
						locations: s(e({ id: nv }).passthrough()),
						contacts: s(e({ id: nv }).passthrough())
					}).strict().parse(JSON.parse(t));
					if (n.primaryLocationId && !n.locations.some((e) => e.id === n.primaryLocationId) || n.primaryContactId && !n.contacts.some((e) => e.id === n.primaryContactId)) throw Error("Invalid import primary-record audit.");
				}
			}
		}
	}
});
//#endregion
//#region electron/security/attachmentRepository.ts
var Z = E().trim().min(1).max(200), Sv = E().trim().min(1).max(2e3), Cv = E().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), wv = e({
	id: Z,
	number: f().int().positive(),
	name: Z,
	mime: Z,
	size: f().int().positive().max(p),
	sha256: E().regex(/^[a-f0-9]{64}$/),
	content: E().max(14e6),
	createdAt: Cv,
	createdBy: Z,
	restoredFrom: Z.optional()
}).strict(), Tv = e({
	id: Z,
	title: E().trim().min(1).max(200),
	target: _,
	revision: f().int().positive(),
	currentVersionId: Z,
	versions: s(wv).min(1).max(100),
	createdAt: Cv,
	createdBy: Z,
	updatedAt: Cv,
	updatedBy: Z,
	deletedAt: Cv.optional(),
	deletedBy: Z.optional()
}).strict(), Ev = (e) => ({
	title: e.title,
	deleted: !!e.deletedAt,
	currentVersionId: e.currentVersionId,
	versionsCount: e.versions.length
}), Dv = e({
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
	at: Cv,
	revision: f().int().positive(),
	reason: Sv,
	versionId: Z.optional(),
	fingerprint: E().regex(/^[a-f0-9]{64}$/),
	after: e({
		title: Z,
		deleted: y(),
		currentVersionId: Z,
		versionsCount: f().int().positive()
	}).strict()
}).strict(), Ov = [], kv = [];
function Av() {
	return O.require("inventory.read");
}
var jv = () => t([...new Set(Object.values(o).map((e) => e.repository))]);
function Mv(e, t, r = jv()) {
	return n(r, t).find((t) => t.kind === e.kind && t.id === e.id);
}
function Nv(e, t = !1) {
	let n = Av(), r = Mv(e, n);
	if (!r) throw Error("Business link was not found or access is denied.");
	if (t && !r.canWrite) throw Error("Permission denied: attachment maintenance requires the linked object write permission.");
	return n.userId;
}
function Pv(e, t = !1) {
	let n = Ov.find((t) => t.id === Z.parse(e));
	if (!n) throw Error("Attachment not found or access denied.");
	return Nv(n.target, t), n;
}
var Fv = (e) => Oe("sha256").update(JSON.stringify(e)).digest("hex"), Iv = (e, t) => {
	let n = Mv(e.target, t);
	return {
		...e,
		targetLabel: n.label,
		targetPath: n.path,
		canWrite: n.canWrite,
		versions: e.versions.map(({ content: e, ...t }) => t)
	};
};
function Lv(e, t) {
	if (e.revision !== t) throw Error("Attachment changed. Refresh before continuing.");
}
function Rv(e, t) {
	if (t < e.updatedAt) throw Error("System clock precedes the last attachment change.");
}
function zv(e) {
	if (Ov.flatMap((e) => e.versions).reduce((e, t) => e + t.size, 0) + e > 5e7) throw Error("Local attachment library exceeds 50 MB including versions and trash. Export/archive the business profile before adding more files.");
}
function Bv(e, t) {
	let n = kv.find((t) => t.operationId === e);
	if (!n) return;
	let r = Pv(n.documentId, !0);
	if (n.fingerprint !== t) throw Error("Operation ID already has different attachment data.");
	return Iv(r, O.current());
}
function Vv(e, t, n, r, i, a) {
	return Ov = [...Ov.filter((t) => t.id !== e.id), e], kv = [...kv, {
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
		after: Ev(e)
	}], Iv(e, O.current());
}
i("attachments", {
	repository: {
		targets() {
			return n(jv(), Av());
		},
		checkTarget(e) {
			return Nv(_.parse(e), !0), !0;
		},
		upload(t) {
			let n = e({
				operationId: Z,
				id: Z.optional(),
				expectedRevision: f().int().nonnegative(),
				target: _,
				title: Z,
				reason: Sv,
				file: e({
					name: Z,
					content: E().max(14e6)
				}).strict()
			}).strict().parse(t), r = Nv(n.target, !0), i = l(n.file.name, n.file.content), a = Fv({
				...n,
				file: {
					name: i.name,
					sha256: i.sha256
				}
			}), o = Bv(n.operationId, a);
			if (o) return o;
			let s = n.id ? Pv(n.id, !0) : void 0;
			if (s) {
				if (Lv(s, n.expectedRevision), JSON.stringify(s.target) !== JSON.stringify(n.target)) throw Error("An attachment retains its original business link.");
				if (s.deletedAt) throw Error("Recover the attachment before adding a version.");
				if (s.versions.some((e) => e.sha256 === i.sha256)) throw Error("These file bytes already exist in this attachment. Use version restore instead.");
				if (s.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
			} else if (n.expectedRevision !== 0) throw Error("A new attachment requires revision zero.");
			if (!s && Ov.some((e) => !e.deletedAt && e.target.kind === n.target.kind && e.target.id === n.target.id && e.versions.some((e) => e.sha256 === i.sha256))) throw Error("This file already exists on the selected business object. Open its existing attachment.");
			zv(i.size);
			let c = (/* @__PURE__ */ new Date()).toISOString();
			s && Rv(s, c);
			let u = {
				...i,
				id: crypto.randomUUID(),
				number: (s?.versions.length ?? 0) + 1,
				createdAt: c,
				createdBy: r
			};
			return Vv({
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
				reason: Sv,
				title: Z.optional(),
				versionId: Z.optional()
			}).strict().parse(t), r = Pv(n.id, !0), i = Fv(n), o = Bv(n.operationId, i);
			if (o) return o;
			Lv(r, n.expectedRevision);
			let s = Nv(r.target, !0), c = (/* @__PURE__ */ new Date()).toISOString();
			Rv(r, c);
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
					zv(e.size), a(e);
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
			return Vv(l, n.action, n.operationId, i, n.reason, u);
		},
		read(t) {
			let n = e({
				id: Z,
				versionId: Z
			}).strict().parse(t), r = Pv(n.id).versions.find((e) => e.id === n.versionId);
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
		documents: Ov,
		history: kv
	}),
	restore: (e) => {
		Ov = e.documents, kv = e.history;
	},
	publish: () => {},
	view: (e) => {
		let t = Ov.filter((t) => Mv(t.target, e));
		return {
			documents: t.map((t) => Iv(t, e)),
			history: kv.filter((e) => t.some((t) => t.id === e.documentId)).map(({ fingerprint: e, ...t }) => t)
		};
	},
	validate: (t, n) => {
		let r = e({
			documents: s(Tv),
			history: s(Dv)
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
			if (u !== e.versions.length || m.actorId !== e.updatedBy || m.at !== e.updatedAt || JSON.stringify(m.after) !== JSON.stringify(Ev(e))) throw Error("Attachment metadata differs from audit.");
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
function Hv(e) {
	let t = Math.round(e * 100);
	if (!Number.isFinite(e) || !Number.isSafeInteger(t) || Math.abs(t / 100 - e) > 1e-7) throw Error("Amounts must be safe currency values with at most two decimals.");
	return t;
}
function Uv(e, t) {
	return e.flatMap((n) => n.lines.flatMap((r, i) => {
		let a = t.find((e) => e.id === r.accountId);
		if (!a || !["REVENUE", "EXPENSE"].includes(a.type)) return [];
		let o = n, s = r;
		if (n.reversedJournalEntryId) {
			let t = e.find((e) => e.id === n.reversedJournalEntryId), a = t?.lines[i];
			if (!t || !a || a.accountId !== r.accountId || Hv(a.debit) !== Hv(r.credit) || Hv(a.credit) !== Hv(r.debit)) throw Error("Reversal line does not match its original source.");
			o = t, s = a;
		}
		let c = Hv(a.type === "REVENUE" ? r.credit - r.debit : r.debit - r.credit);
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
function Wv(e, t, n, r, i, a) {
	if (w(i, "From date"), w(a, "To date"), i > a) throw Error("From date must not follow to date.");
	let o = Uv(e, t).filter((e) => e.date >= i && e.date <= a), s = o.flatMap((e) => {
		let t = r.find((t) => t.journalId === e.rootJournalId && t.lineId === e.rootLineId), i = e.amount < 0 ? -1 : 1, a = Hv(e.capacity), o = (t?.splits ?? []).map((t) => {
			let r = Hv(t.amount);
			return a -= r, {
				...e,
				jobId: t.jobId,
				jobName: t.jobName ?? n.find((e) => e.id === t.jobId)?.name ?? t.jobId,
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
		for (let r of s.filter((t) => t.jobId === e)) r.kind === "REVENUE" ? t += Hv(r.allocated) : n += Hv(r.allocated);
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
			let t = c(e.id), n = Hv(Math.round(Number(e.budget) * 100) / 100), r = Hv(Math.round(Number(e.costBudget) * 100) / 100);
			return {
				id: e.id,
				name: e.name,
				code: e.code,
				status: e.status,
				...t,
				budget: n / 100,
				costBudget: r / 100,
				budgetProfit: (n - r) / 100,
				revenueVariance: (Hv(t.revenue) - n) / 100,
				costVariance: (r - Hv(t.cost)) / 100,
				profitVariance: (Hv(t.profit) - n + r) / 100
			};
		}),
		unallocated: c(""),
		ledger: {
			revenue: o.filter((e) => e.kind === "REVENUE").reduce((e, t) => e + Hv(t.amount), 0) / 100,
			cost: o.filter((e) => e.kind === "EXPENSE").reduce((e, t) => e + Hv(t.amount), 0) / 100
		}
	};
}
//#endregion
//#region src/features/job-costing/jobCostingRepository.ts
var Gv = E().trim().min(1).max(200), Kv = E().trim().min(1).max(2e3), qv = E().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), Jv = e({
	jobId: Gv,
	amount: f().finite().positive().refine((e) => {
		try {
			return Hv(e), !0;
		} catch {
			return !1;
		}
	})
}).strict(), Yv = e({
	id: Gv,
	journalId: Gv,
	lineId: Gv,
	revision: f().int().positive(),
	splits: s(Jv).max(100),
	updatedAt: qv,
	updatedBy: Gv
}).strict(), Xv = e({
	id: Gv,
	operationId: Gv,
	recordId: Gv,
	revision: f().int().positive(),
	at: qv,
	actorId: Gv,
	reason: Kv,
	fingerprint: E().max(3e6),
	before: s(Jv),
	after: s(Jv)
}).strict(), Zv = e({
	operationId: Gv,
	journalId: Gv,
	lineId: Gv,
	expectedRevision: f().int().nonnegative(),
	expectedSource: E().max(2e6),
	splits: s(Jv).max(100),
	reason: Kv
}).strict(), Qv = [], $v = [], ey = /* @__PURE__ */ new Set(), ty = () => ey.forEach((e) => e());
function ny(e, t, n) {
	if (new Set(e.map((e) => e.jobId)).size !== e.length) throw Error("Use one split per project.");
	if (e.some((e) => !n.some((t) => t.id === e.jobId))) throw Error("Project was not found.");
	if (e.reduce((e, t) => e + Hv(t.amount), 0) > Hv(t)) throw Error("Project splits exceed the source amount.");
}
function ry() {
	return va(t().payroll?.runs ?? [], F.getAll());
}
i("jobCosting", {
	repository: {
		subscribe(e) {
			return ey.add(e), () => {
				ey.delete(e);
			};
		},
		getSnapshot: () => Qv,
		review() {
			O.require("accounting.read");
			let e = ry();
			return {
				lines: Uv(F.getAll(), P.getAll()).map((t) => ({
					...t,
					payrollManaged: e.some((e) => e.journalId === t.rootJournalId && e.lineId === t.rootLineId)
				})),
				allocations: structuredClone([...Qv, ...e]),
				history: structuredClone($v)
			};
		},
		report(t) {
			O.require("accounting.read");
			let n = e({
				from: E(),
				to: E()
			}).strict().parse(t);
			return Wv(F.getAll(), P.getAll(), x.jobs, [...Qv, ...ry()], n.from, n.to);
		},
		save(e) {
			let t = O.require("accounting.post"), n = Zv.parse(e), r = JSON.stringify(n), i = $v.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already has different allocation data.");
				return Qv.find((e) => e.id === i.recordId);
			}
			let a = Uv(F.getAll(), P.getAll()).find((e) => e.journalId === n.journalId && e.lineId === n.lineId);
			if (!a) throw Error("Select a posted revenue or expense line.");
			if (a.reversal) throw Error("Allocate the original line; reversal entries inherit its splits.");
			if (n.expectedSource !== a.signature) throw Error("Source journal changed. Refresh before allocating.");
			if (ry().some((e) => e.journalId === a.journalId && e.lineId === a.lineId)) throw Error("Frozen payroll project costs are managed through payroll; reverse and replace the source to correct them.");
			let o = Qv.find((e) => e.journalId === a.journalId && e.lineId === a.lineId);
			if ((o?.revision ?? 0) !== n.expectedRevision) throw Error("Allocation changed. Refresh before saving.");
			ny(n.splits, a.capacity, x.jobs);
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
			return Qv = [...Qv.filter((e) => e.id !== c.id), c], $v = [...$v, {
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
			}], ty(), c;
		}
	},
	read: "accounting.read",
	commands: {
		review: "accounting.read",
		report: "accounting.read",
		save: "accounting.post"
	},
	snapshot: () => ({
		allocations: Qv,
		history: $v
	}),
	restore: (e) => {
		Qv = e.allocations, $v = e.history;
	},
	publish: ty,
	validate: (t, n) => {
		let r = e({
			allocations: s(Yv),
			history: s(Xv)
		}).strict().parse(t), i = n.workspace_jobs.records, a = Uv(n.journals.journalEntries, n.accounts.accounts), o = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set(), l = va(n.payroll?.runs ?? [], n.journals.journalEntries);
		for (let e of r.allocations) {
			if (l.some((t) => t.journalId === e.journalId && t.lineId === e.lineId)) throw Error("Manual allocation duplicates frozen payroll project costs.");
			let t = a.find((t) => t.journalId === e.journalId && t.lineId === e.lineId), n = e.journalId + ":" + e.lineId;
			if (!t || t.reversal || o.has(n)) throw Error("Invalid project source reference.");
			o.add(n), ny(e.splits, t.capacity, i);
			let s = r.history.filter((t) => t.recordId === e.id);
			if (s.length !== e.revision) throw Error("Invalid allocation history length.");
			let c = [], u = "";
			for (let [n, r] of s.entries()) {
				let a = Zv.parse(JSON.parse(r.fingerprint));
				if (r.revision !== n + 1 || r.at < u || JSON.stringify(r.before) !== JSON.stringify(c) || a.journalId !== e.journalId || a.lineId !== e.lineId || a.operationId !== r.operationId || a.expectedRevision !== n || a.reason !== r.reason || JSON.stringify(a.splits) !== JSON.stringify(r.after)) throw Error("Invalid allocation history chain.");
				ny(r.after, t.capacity, i), c = r.after, u = r.at;
			}
			let d = s.at(-1);
			if (JSON.stringify(c) !== JSON.stringify(e.splits) || d.at !== e.updatedAt || d.actorId !== e.updatedBy) throw Error("Allocation outcome differs from audit history.");
		}
		for (let e of r.history) {
			if (c.has(e.operationId) || !r.allocations.some((t) => t.id === e.recordId)) throw Error("Invalid allocation operation reference.");
			c.add(e.operationId);
		}
	}
});
//#endregion
//#region src/features/contact-review/reviewRepository.ts
var iy = E().trim().min(1).max(200), ay = E().trim().max(2e3), oy = E().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), sy = e({
	operationId: iy,
	kind: T(Da),
	customerId: E().max(200).default(""),
	values: Aa,
	source: T(Oa).default("Manual"),
	externalId: E().trim().max(200).default(""),
	sourceReference: E().trim().max(500).default("")
}).strict(), cy = e({
	id: iy,
	action: iy,
	actorId: iy,
	at: oy,
	reason: ay,
	data: E().max(2e6)
}).strict(), ly = e({
	action: T([
		"Approve new",
		"Link existing",
		"Reject"
	]),
	actorId: iy,
	at: oy,
	reason: ay,
	fingerprint: E().max(1e4),
	customerId: E(),
	targetId: E(),
	snapshot: ye()
}).strict(), uy = sy.extend({
	id: iy,
	state: T([
		"Pending",
		"Approved",
		"Linked",
		"Rejected"
	]),
	revision: f().int().positive(),
	createdBy: iy,
	createdAt: oy,
	updatedAt: oy,
	creationFingerprint: E().max(1e5),
	history: s(cy).min(1),
	decision: ly.optional()
}).strict(), dy = [], fy = /* @__PURE__ */ new Set(), py = () => fy.forEach((e) => e());
function my() {
	let e = O.require("contacts.write");
	return O.require("sales.read"), e.userId;
}
var hy = () => (/* @__PURE__ */ new Date()).toISOString();
function gy(e) {
	let t = hy();
	if (t < e.updatedAt) throw Error("System clock precedes the last review update. Correct it before continuing.");
	return t;
}
var _y = (e, t, n, r = "", i = {}) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	reason: r,
	data: JSON.stringify(i)
});
function vy(e) {
	let t = dy.find((t) => t.id === e);
	if (!t) throw Error("Review draft not found.");
	return t;
}
function yy(e, t) {
	if (e.revision !== t) throw Error("Review draft changed. Reload before continuing.");
}
function by(e) {
	return dy = [...dy.filter((t) => t.id !== e.id), e], py(), e;
}
function xy(e) {
	let t = sy.parse(e);
	if (t.values = ja(t.kind, t.values), t.kind === "Customer" && t.customerId) throw Error("Customer drafts must not have a parent customer.");
	if (t.customerId && !W.getById(t.customerId)) throw Error("Parent customer was not found.");
	return t;
}
function Sy(e, t) {
	return e === "Customer" ? uc.strict().parse(t) : e === "Branch" ? dc.strict().parse(t) : fc.strict().parse(t);
}
function Cy(e, t, n) {
	let r = W.getById(e === "Customer" ? n : t);
	if (!r) throw Error("Choose an existing customer.");
	let i = e === "Customer" ? r : e === "Branch" ? r.locations.find((e) => e.id === n) : r.contacts.find((e) => e.id === n);
	if (!i) throw Error("The selected record does not belong to this customer or draft type.");
	return {
		customerId: r.id,
		targetId: i.id,
		snapshot: structuredClone(i)
	};
}
var wy = {
	subscribe(e) {
		return fy.add(e), () => {
			fy.delete(e);
		};
	},
	getSnapshot: () => dy,
	create(e) {
		let t = my(), n = xy(e), { operationId: r, ...i } = n, a = JSON.stringify(i), o = dy.find((e) => e.operationId === r) || n.externalId && dy.find((e) => e.source === n.source && e.externalId === n.externalId);
		if (o) {
			if (o.creationFingerprint !== a) throw Error("Operation or external source ID already contains different draft data.");
			return o;
		}
		let s = hy();
		return by({
			...n,
			id: crypto.randomUUID(),
			state: "Pending",
			revision: 1,
			createdBy: t,
			createdAt: s,
			updatedAt: s,
			creationFingerprint: a,
			history: [_y("Received", t, s, "", i)]
		});
	},
	importBatch(t) {
		my();
		let n = e({
			operationId: iy.max(150),
			drafts: s(sy.omit({ operationId: !0 })).min(1).max(100)
		}).strict().parse(t);
		if (n.drafts.some((e) => !e.externalId)) throw Error("Each imported draft requires a source external ID for safe retry.");
		return n.drafts.map((e, t) => wy.create({
			...e,
			operationId: n.operationId + ":" + t
		}));
	},
	update(t) {
		let n = my(), r = e({
			id: iy,
			expectedRevision: f().int().positive(),
			customerId: E().max(200),
			values: Aa
		}).strict().parse(t), i = vy(r.id);
		if (yy(i, r.expectedRevision), i.state !== "Pending") throw Error("Only pending drafts can be edited.");
		let a = xy({
			operationId: i.operationId,
			kind: i.kind,
			customerId: r.customerId,
			values: r.values,
			source: i.source,
			externalId: i.externalId,
			sourceReference: i.sourceReference
		}), o = gy(i);
		return by({
			...i,
			customerId: a.customerId,
			values: a.values,
			revision: i.revision + 1,
			updatedAt: o,
			history: [...i.history, _y("Updated", n, o, "", {
				customerId: a.customerId,
				values: a.values
			})]
		});
	},
	review(e) {
		O.require("sales.read");
		let t = vy(iy.parse(e)), n = W.getAll(), r = "";
		try {
			if (Sy(t.kind, t.values), t.kind !== "Customer" && !n.some((e) => e.id === t.customerId)) throw Error("Select the parent customer.");
		} catch (e) {
			r = e.message;
		}
		return {
			revision: t.revision,
			duplicates: Ia(t, n),
			masterSignature: La(n),
			validationError: r
		};
	},
	decide(t) {
		let n = my(), r = e({
			id: iy,
			expectedRevision: f().int().positive(),
			action: T([
				"Approve new",
				"Link existing",
				"Reject"
			]),
			reason: ay,
			allowDuplicate: y().default(!1),
			targetId: E().max(200).default(""),
			expectedMaster: E().max(25e6).optional()
		}).strict().parse(t), i = vy(r.id), a = JSON.stringify({
			action: r.action,
			reason: r.reason,
			allowDuplicate: r.allowDuplicate,
			targetId: r.targetId
		});
		if (i.state !== "Pending") {
			if (i.decision?.fingerprint === a) return i;
			throw Error("This draft already has a different decision.");
		}
		yy(i, r.expectedRevision);
		let o = gy(i), s = {
			customerId: "",
			targetId: "",
			snapshot: null
		};
		if (r.action === "Reject") {
			if (!r.reason) throw Error("Explain why the draft is rejected.");
		} else {
			let e = W.getAll();
			if (r.expectedMaster !== La(e)) throw Error("Customer records changed. Refresh duplicate review before deciding.");
			if (r.action === "Link existing") {
				if (!r.reason) throw Error("Explain why this existing record is the correct match.");
				s = Cy(i.kind, i.customerId, r.targetId);
			} else {
				if (Ia(i, e).length && (!r.allowDuplicate || !r.reason)) throw Error("Possible duplicates exist. Link an existing record or explicitly confirm a separate new record with a reason.");
				let t = Sy(i.kind, i.values);
				if (i.kind === "Customer") {
					let e = W.create(t);
					s = {
						customerId: e.id,
						targetId: e.id,
						snapshot: structuredClone(e)
					};
				} else {
					let e = W.getById(i.customerId);
					if (!e || e.status === "INACTIVE") throw Error("Select an available parent customer.");
					let n = i.kind === "Branch" ? W.addLocation(e.id, t) : W.addContact(e.id, t);
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
		return by({
			...i,
			state: r.action === "Reject" ? "Rejected" : r.action === "Link existing" ? "Linked" : "Approved",
			revision: i.revision + 1,
			updatedAt: o,
			decision: c,
			history: [...i.history, _y(r.action, n, o, r.reason, c)]
		});
	},
	reopen(t) {
		let n = my(), r = e({
			id: iy,
			expectedRevision: f().int().positive(),
			reason: ay.refine(Boolean, "Explain why this draft is reopened.")
		}).strict().parse(t), i = vy(r.id);
		if (yy(i, r.expectedRevision), i.state !== "Rejected") throw Error("Only rejected drafts may be reopened.");
		let a = gy(i), o = {
			...i,
			state: "Pending",
			revision: i.revision + 1,
			updatedAt: a,
			history: [...i.history, _y("Reopened", n, a, r.reason)]
		};
		return delete o.decision, by(o);
	}
};
i("contactReviews", {
	repository: wy,
	read: "sales.read",
	commands: {
		create: "contacts.write",
		update: "contacts.write",
		importBatch: "contacts.write",
		review: "sales.read",
		decide: "contacts.write",
		reopen: "contacts.write"
	},
	snapshot: () => ({ drafts: dy }),
	restore: (e) => {
		dy = e.drafts;
	},
	publish: py,
	validate: (t, n) => {
		let r = e({ drafts: s(uy) }).strict().parse(t), i = n.customers.customers, a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
		for (let t of r.drafts) {
			let n = ja(t.kind, t.values);
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
					reason: ay,
					allowDuplicate: y(),
					targetId: E()
				}).strict().parse(JSON.parse(t.decision.fingerprint)), a = t.history.at(-1);
				if (r.action !== n || r.reason !== t.decision.reason || r.targetId !== (n === "Link existing" ? t.decision.targetId : "") || a.actorId !== t.decision.actorId || a.at !== t.decision.at || a.reason !== t.decision.reason || JSON.stringify(JSON.parse(a.data)) !== JSON.stringify(t.decision)) throw Error("Review decision audit is inconsistent.");
				if (t.decision.action !== n) throw Error("Invalid review decision.");
				if (n !== "Reject") {
					let e = i.find((e) => e.id === t.decision.customerId), r = t.kind === "Customer" ? e : t.kind === "Branch" ? e?.locations.find((e) => e.id === t.decision.targetId) : e?.contacts.find((e) => e.id === t.decision.targetId);
					if (!r || r.id !== t.decision.targetId || t.kind !== "Customer" && e.id !== t.customerId || t.decision.snapshot?.id !== r.id) throw Error("Invalid resolved review reference.");
					n === "Approve new" && Sy(t.kind, t.values);
				} else if (!t.decision.reason || t.decision.customerId || t.decision.targetId) throw Error("Invalid rejection.");
			}
		}
	}
});
//#endregion
//#region src/features/accounting/data/profitAndLossService.ts
function Ty(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ey(e, t) {
	w(e, t);
}
function Dy(e, t, n, r) {
	if (Ey(n, "From date"), Ey(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = t.filter((e) => e.journalDate >= n && e.journalDate <= r), a = Oy(e.filter((e) => e.type === "REVENUE"), i, "REVENUE"), o = Oy(e.filter((e) => e.type === "EXPENSE"), i, "EXPENSE"), s = Ty(a.reduce((e, t) => e + t.amount, 0)), c = Ty(o.reduce((e, t) => e + t.amount, 0)), l = e.find((e) => e.systemRole === "SALES_REVENUE");
	if (!l) throw Error("Sales Revenue system account was not found.");
	if (l.type !== "REVENUE") throw Error("Sales Revenue system account must be a revenue account.");
	let u = e.find((e) => e.systemRole === "COST_OF_GOODS_SOLD");
	if (!u) throw Error("Cost of Goods Sold system account was not found.");
	if (u.type !== "EXPENSE") throw Error("Cost of Goods Sold system account must be an expense account.");
	let d = Ty(a.find((e) => e.accountId === l.id)?.amount ?? 0), f = Ty(o.find((e) => e.accountId === u.id)?.amount ?? 0), p = Ty(d - f);
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
		operatingExpenses: Ty(c - f),
		totalExpenses: c,
		netProfit: Ty(s - c)
	};
}
function Oy(e, t, n) {
	return e.map((e) => {
		let r = 0, i = 0;
		for (let n of t) for (let t of n.lines) t.accountId === e.id && (r = Ty(r + t.debit), i = Ty(i + t.credit));
		let a = Ty(n === "REVENUE" ? i - r : r - i);
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
function ky(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ay(e) {
	w(e);
}
function jy(e, t) {
	let n = 0, r = 0;
	for (let i of t) for (let t of i.lines) t.accountId === e.id && (n = ky(n + t.debit), r = ky(r + t.credit));
	return e.type === "ASSET" || e.type === "EXPENSE" ? ky(n - r) : ky(r - n);
}
function My(e, t, n) {
	return e.filter((e) => e.type === n).map((e) => ({
		accountId: e.id,
		accountCode: e.code,
		accountName: e.name,
		amount: jy(e, t)
	})).filter((e) => e.amount !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 }));
}
function Ny(e) {
	return ky(e.reduce((e, t) => e + t.amount, 0));
}
function Py(e, t, n) {
	Ay(n);
	let r = t.filter((e) => e.journalDate <= n), i = My(e, r, "ASSET"), a = My(e, r, "LIABILITY"), o = My(e, r, "EQUITY"), s = e.filter((e) => e.type === "REVENUE"), c = e.filter((e) => e.type === "EXPENSE"), l = ky(s.reduce((e, t) => e + jy(t, r), 0)), u = ky(c.reduce((e, t) => e + jy(t, r), 0)), d = Ny(i), f = Ny(a), p = Ny(o), m = ky(l - u), h = ky(p + m), g = ky(f + h), _ = ky(d - g);
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
function Fy(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Iy(e, t) {
	w(e, t);
}
function Ly(e, t) {
	let n = Fy(e - t);
	return n >= 0 ? {
		debit: n,
		credit: 0
	} : {
		debit: 0,
		credit: Fy(Math.abs(n))
	};
}
function Ry(e, t, n, r) {
	if (Iy(n, "From date"), Iy(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = e.map((e) => {
		let i = 0, a = 0, o = 0, s = 0;
		for (let c of t) for (let t of c.lines) if (t.accountId === e.id) {
			if (c.journalDate < n) {
				i = Fy(i + t.debit), a = Fy(a + t.credit);
				continue;
			}
			c.journalDate <= r && (o = Fy(o + t.debit), s = Fy(s + t.credit));
		}
		let c = Ly(i, a), l = Ly(Fy(i + o), Fy(a + s));
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
	}).filter((e) => e.openingDebit !== 0 || e.openingCredit !== 0 || e.periodDebit !== 0 || e.periodCredit !== 0 || e.closingDebit !== 0 || e.closingCredit !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 })), a = Fy(i.reduce((e, t) => e + t.openingDebit, 0)), o = Fy(i.reduce((e, t) => e + t.openingCredit, 0)), s = Fy(i.reduce((e, t) => e + t.periodDebit, 0)), c = Fy(i.reduce((e, t) => e + t.periodCredit, 0)), l = Fy(i.reduce((e, t) => e + t.closingDebit, 0)), u = Fy(i.reduce((e, t) => e + t.closingCredit, 0)), d = Fy(l - u);
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
var zy = [
	"Customer receipts & reversals",
	"Customer refunds & reversals",
	"Supplier payments & reversals",
	"Supplier refunds & reversals",
	"Bank opening adjustments",
	"Transfers across selection",
	"Other bank movements / review"
], By = (e) => Math.round(e * 100), Vy = (e) => e / 100;
function Hy(e) {
	switch (e.sourceType) {
		case "CUSTOMER_DEPOSIT":
		case "CUSTOMER_PAYMENT":
		case "CUSTOMER_PAYMENT_REVERSAL": return zy[0];
		case "CUSTOMER_DEPOSIT_REFUND":
		case "CUSTOMER_REFUND": return zy[1];
		case "SUPPLIER_PREPAYMENT":
		case "SUPPLIER_PAYMENT":
		case "SUPPLIER_PAYMENT_REVERSAL": return zy[2];
		case "SUPPLIER_PREPAYMENT_REFUND":
		case "SUPPLIER_REFUND": return zy[3];
		case "OPENING_BALANCE": return zy[4];
		case "BANK_TRANSFER": return zy[5];
		default: return zy[6];
	}
}
function Uy(e) {
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
		let n = Is(t, e.journalEntries, e.to), o = t.openingBalanceDate < e.from ? By(t.openingBalance) : 0, s = 0, c = 0;
		if (t.openingBalanceDate >= e.from && t.openingBalance !== 0) {
			let e = By(t.openingBalance);
			a.push({
				id: `setup:${t.id}`,
				bankId: t.id,
				bankName: t.name,
				date: t.openingBalanceDate,
				description: "Bank setup opening balance (not a cash receipt)",
				sourceType: "BANK_SETUP",
				category: zy[4],
				moneyIn: Vy(Math.max(e, 0)),
				moneyOut: Vy(Math.max(-e, 0))
			}), s += Math.max(e, 0), c += Math.max(-e, 0);
		}
		let l = n.transactions.filter((t) => t.correctionOnly && t.transactionDate >= e.from).length;
		l && i.push(`${t.name}: ${l} internal correction lines remain visible in the bank register and are excluded from cash movement totals.`), n.transactions.some((e) => e.correctionIssue) && i.push(`${t.name}: bank journal or categorisation correction evidence requires review. Its ledger movements remain included; no historical amount or date is silently changed.`);
		for (let i of n.transactions) {
			if (i.correctionOnly) continue;
			if (i.transactionDate < e.from) {
				o += By(i.moneyIn) - By(i.moneyOut);
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
				category: Hy(n),
				moneyIn: i.moneyIn,
				moneyOut: i.moneyOut
			}), s += By(i.moneyIn), c += By(i.moneyOut);
		}
		let u = By(n.closingBalance);
		return {
			bankId: t.id,
			name: t.name,
			active: t.active,
			opening: Vy(o),
			moneyIn: Vy(s),
			moneyOut: Vy(c),
			closing: Vy(u),
			difference: Vy(o + s - c - u)
		};
	}), s = new Map(zy.map((e) => [e, {
		category: e,
		moneyIn: 0,
		moneyOut: 0,
		net: 0
	}])), c = /* @__PURE__ */ new Map();
	for (let e of a) {
		if (e.category === zy[5]) {
			let t = e.journalId;
			c.set(t, (c.get(t) ?? 0) + By(e.moneyIn) - By(e.moneyOut));
			continue;
		}
		let t = s.get(e.category);
		t.moneyIn += By(e.moneyIn), t.moneyOut += By(e.moneyOut);
	}
	for (let e of c.values()) {
		let t = s.get(zy[5]);
		t.moneyIn += Math.max(e, 0), t.moneyOut += Math.max(-e, 0);
	}
	let l = [...s.values()].map((e) => ({
		category: e.category,
		moneyIn: Vy(e.moneyIn),
		moneyOut: Vy(e.moneyOut),
		net: Vy(e.moneyIn - e.moneyOut)
	})), u = (e) => Vy(o.reduce((t, n) => t + By(n[e]), 0)), d = u("opening"), f = u("closing"), p = Vy(l.reduce((e, t) => e + By(t.net), 0)), m = a.filter((e) => e.category === zy[6]).length;
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
		difference: Vy(By(d) + By(p) - By(f))
	};
}
//#endregion
//#region src/features/net-analysis/netAnalysisService.ts
var Wy = (e) => Math.round(e * 100);
function Gy(e) {
	for (let t of [
		e.subtotal,
		e.tax,
		e.total
	]) if (!Number.isFinite(t) || t < 0 || Math.abs(t * 100 - Wy(t)) > 1e-6) throw Error(`${e.number}: invalid saved monetary totals.`);
	if (Wy(e.subtotal) + Wy(e.tax) !== Wy(e.total)) throw Error(`${e.number}: saved net, tax and gross do not reconcile.`);
}
function Ky(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) {
		if (r.status === "DRAFT" || r.openingBalanceImportId) continue;
		let e = `${r.kind}:${r.id}`;
		if (t.has(e)) throw Error(`Duplicate analysis source: ${r.number}.`);
		t.add(e), w(r.date, `Document date (${r.number})`), Gy(r);
		let i = r.kind === "CUSTOMER_CREDIT" || r.kind === "SUPPLIER_CREDIT", a = i ? -1 : 1, { voidedAt: o, openingBalanceImportId: s, ...c } = r, l = (t, n, i) => ({
			...c,
			date: t,
			eventId: `${e}:${i}`,
			event: i,
			subtotal: Wy(r.subtotal) * n / 100,
			tax: Wy(r.tax) * n / 100,
			total: Wy(r.total) * n / 100
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
function qy(e, t) {
	if (w(t.from, "From date"), w(t.to, "To date"), t.from > t.to) throw Error("From date must not exceed To date.");
	let n = t.query?.trim().toLowerCase() ?? "", r = Ky(e).filter((e) => e.date >= t.from && e.date <= t.to && (!t.partyId || e.partyId === t.partyId) && (!t.event || t.event === "ALL" || e.event === t.event) && `${e.number} ${e.partyName} ${e.partyId} ${e.kind}`.toLowerCase().includes(n)), i = (e, t) => e.reduce((e, n) => e + Wy(n[t]), 0) / 100, a = {
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
function Jy(e, t, n) {
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
function Yy(e, t) {
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
var Xy = [
	"Profit & loss",
	"Balance sheet",
	"Trial balance",
	"Cash flow",
	"Net sales",
	"Net purchases"
];
function Zy(e) {
	let t = e.split(",").map((e) => e.trim());
	if (!t.length || t.length > Xy.length || t.some((e) => !e)) throw Error("Select one to six supported reports.");
	let n = t.map((e) => Xy.find((t) => t.toLowerCase() === e.toLowerCase()));
	if (n.some((e) => !e)) throw Error(`Supported reports: ${Xy.join(", ")}.`);
	if (new Set(n).size !== n.length) throw Error("Each report may appear only once in a pack.");
	return n;
}
var Qy = (e) => JSON.stringify(e);
function $y(e, t, n) {
	if (w(e.periodStart, "From date"), w(e.periodEnd, "To date"), e.periodStart > e.periodEnd) throw Error("From date must not exceed To date.");
	let r = Zy(e.reports), i = e.periodStart, a = e.periodEnd, o = r.map((e) => {
		if (e === "Profit & loss") {
			let n = Dy(t.accounts, t.journals, i, a);
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
			let n = Py(t.accounts, t.journals, a);
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
			let n = Ry(t.accounts, t.journals, i, a);
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
			let n = Uy({
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
		let n = e === "Net purchases", r = qy(n ? Yy(t.bills, t.supplierCredits) : Jy(t.documents, t.customerCredits, t.customers), {
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
		sourceSignature: Qy(t),
		sections: o
	});
}
//#endregion
//#region src/features/report-packs/reportPackCommand.ts
function eb() {
	let e = C();
	return {
		accounts: P.getAll(),
		journals: F.getAll(),
		banks: I.getAll(),
		documents: K.getAll(),
		customerCredits: G.getAll(),
		customers: W.getAll().map((e) => ({
			id: e.id,
			businessName: e.businessName
		})),
		bills: Bi.getAll(),
		supplierCredits: J.getAll(),
		company: {
			name: e.companyName,
			currency: e.currency,
			timezone: e.timezone,
			...Ve() ? { logo: Ve() } : {}
		}
	};
}
function tb(t) {
	let n = O.require("accounting.read"), r = e({
		id: E().trim().min(1).max(200),
		expectedRevision: E().regex(/^\d+$/)
	}).strict().parse(t), i = x["report-packs"]?.find((e) => e.id === r.id);
	if (!i) throw Error("Report pack configuration was not found.");
	if (i.revision !== r.expectedRevision) throw Error("Report pack changed. Reload before generating.");
	if (i.status !== "Active") throw Error("Activate this report pack before generating.");
	return $y({
		id: i.id,
		revision: i.revision,
		name: i.name,
		cover: i.cover,
		introduction: i.introduction,
		periodStart: i.periodStart,
		periodEnd: i.periodEnd,
		reports: i.reports
	}, eb(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: n.userId
	});
}
//#endregion
//#region src/features/saved-reports/savedReportService.ts
var nb = [
	"Sales",
	"Purchases",
	"Banking",
	"General ledger"
], rb = (e, t, n = !1) => ({
	key: e,
	label: t,
	numeric: n
}), ib = [
	rb("date", "Date"),
	rb("number", "Document"),
	rb("contact", "Contact"),
	rb("partyId", "Contact ID"),
	rb("activity", "Activity"),
	rb("status", "Current status"),
	rb("net", "Net", !0),
	rb("tax", "Tax", !0),
	rb("gross", "Gross", !0)
], ab = {
	Sales: ib,
	Purchases: ib,
	Banking: [
		rb("date", "Date"),
		rb("bank", "Bank"),
		rb("journal", "Journal"),
		rb("description", "Description"),
		rb("source", "Source"),
		rb("category", "Activity"),
		rb("moneyIn", "Money in", !0),
		rb("moneyOut", "Money out", !0),
		rb("net", "Net", !0)
	],
	"General ledger": [
		rb("date", "Date"),
		rb("journal", "Journal"),
		rb("accountCode", "Account code"),
		rb("account", "Account"),
		rb("description", "Description"),
		rb("source", "Source"),
		rb("status", "Current status"),
		rb("debit", "Debit", !0),
		rb("credit", "Credit", !0)
	]
}, ob = (e) => e === "Banking" ? "Cash" : "Accrual", sb = e({
	from: E(),
	to: E(),
	query: E().max(500).default(""),
	partyId: E().max(200).optional(),
	bankId: E().max(200).optional(),
	accountId: E().max(200).optional(),
	currency: E().min(1).max(10).optional()
}).strict();
function cb(e) {
	let t = T(nb).parse(e.dataset);
	if (e.basis !== ob(t)) throw Error(`${t} uses ${ob(t)} basis. Cash-basis sales/purchase recognition is not available.`);
	if (e.favourite !== void 0 && !["Yes", "No"].includes(e.favourite)) throw Error("Favourite must be Yes or No.");
	let n;
	try {
		n = JSON.parse(e.filter ?? "");
	} catch {
		throw Error("Legacy filter text is not executable. Edit and save explicit report dates and filters.");
	}
	let r = sb.parse(n);
	if (w(r.from, "From date"), w(r.to, "To date"), r.from > r.to) throw Error("From date must not exceed To date.");
	if (t !== "Sales" && t !== "Purchases" && r.partyId) throw Error("Contact filters require Sales or Purchases.");
	if (t !== "Banking" && (r.bankId || r.currency)) throw Error("Bank and currency filters require Banking.");
	if (t !== "General ledger" && r.accountId) throw Error("Account filters require General ledger.");
	let i = e.columns.split(",").map((e) => e.trim()), a = t === "Sales" || t === "Purchases" ? {
		customer: "contact",
		supplier: "contact",
		gst: "tax",
		total: "gross"
	} : {}, o = i.map((e) => ab[t].find((t) => t.label.toLowerCase() === e.toLowerCase() || t.key.toLowerCase() === (a[e.toLowerCase()] ?? e.toLowerCase())));
	if (!i.length || i.length > ab[t].length || o.some((e) => !e) || new Set(o.map((e) => e?.key)).size !== o.length) throw Error(`Select distinct supported columns for ${t}: ${ab[t].map((e) => e.label).join(", ")}.`);
	return {
		dataset: t,
		filters: r,
		columns: o
	};
}
var lb = (e, t) => e.reduce((e, n) => {
	let r = Number(n.values[t]), i = e + Math.round(r * 100);
	if (!Number.isFinite(r) || !Number.isSafeInteger(i)) throw Error("Report monetary total exceeds supported cents precision.");
	return i;
}, 0) / 100;
function ub(e, t, n) {
	let { dataset: r, filters: i, columns: a } = cb(e), o = i.query.trim().toLowerCase(), s = [], c = [], l = [], u = t.company.currency;
	if (r === "Sales" || r === "Purchases") {
		let e = r === "Sales" ? Jy(t.documents, t.customerCredits, t.customers) : Yy(t.bills, t.supplierCredits);
		if (i.partyId && !e.some((e) => e.partyId === i.partyId) && !(r === "Sales" && t.customers.some((e) => e.id === i.partyId))) throw Error("Selected contact is not available in this dataset.");
		let n = {
			DOCUMENT: "Original document",
			CREDIT: "Credit note",
			VOID: "Void reversal"
		};
		s = Ky(e).filter((e) => e.date >= i.from && e.date <= i.to && (!i.partyId || e.partyId === i.partyId)).map((e) => ({
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
		let e = Uy({
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
		value: lb(s, t)
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
		...t.company.logo ? { logo: t.company.logo } : {},
		sourceSignature: Qy(t),
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
function db(t) {
	let n = O.require("accounting.read"), r = e({
		id: E().trim().min(1).max(200),
		expectedRevision: E().regex(/^\d+$/)
	}).strict().parse(t), i = x["custom-reports"]?.find((e) => e.id === r.id);
	if (!i) throw Error("Saved report was not found.");
	if (i.revision !== r.expectedRevision) throw Error("Saved report changed. Reload before running.");
	if (i.status !== "Active") throw Error("Activate this saved report before running.");
	return ub({
		id: i.id,
		revision: i.revision,
		name: i.name,
		dataset: i.dataset,
		columns: i.columns,
		basis: i.basis,
		filter: i.filter,
		favourite: i.favourite
	}, eb(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: n.userId
	});
}
//#endregion
//#region src/features/business-workspace/workspaceRepository.ts
var fb = se(E(), E().max(2e4)), pb = [
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
], mb = () => (/* @__PURE__ */ new Date()).toISOString(), hb = {
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
}, gb = /* @__PURE__ */ new Set(), _b = 0, vb = () => {
	_b++, gb.forEach((e) => e());
}, yb = Object.fromEntries(Object.keys(hb).map((e) => [e, []]));
for (let e of Object.keys(hb)) x[e] = [];
var bb = () => ({
	collected: P.getAll().find((e) => e.systemRole === "GST_PAYABLE")?.id ?? "",
	paid: P.getAll().find((e) => e.systemRole === "GST_RECEIVABLE")?.id ?? ""
});
x["tax-codes"] = [{
	id: "tax-gst",
	name: "GST",
	status: "Active",
	revision: "1",
	createdAt: mb(),
	updatedAt: mb(),
	code: "GST",
	rate: "10",
	basis: "Exclusive",
	report: "GST",
	...bb()
}, {
	id: "tax-zero",
	name: "Zero rated",
	status: "Active",
	revision: "1",
	createdAt: mb(),
	updatedAt: mb(),
	code: "ZERO",
	rate: "0",
	basis: "Exclusive",
	report: "Zero rated",
	...bb()
}];
function xb(e, t) {
	if (!e?.trim()) throw Error(`${t} is required.`);
}
function Sb(e, t) {
	if (!e?.trim() || !Number.isFinite(Number(e)) || Number(e) < 0) throw Error(`${t} must be a non-negative number.`);
}
function Cb(e, t) {
	let n = P.getAll().find((t) => t.id === e);
	if (!n?.active || t && n.type !== t) throw Error("Select an active account of the correct type.");
	return n;
}
function wb(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && (/* @__PURE__ */ new Date(e + "T00:00:00Z")).toISOString().slice(0, 10) === e;
}
function Tb(e, n, r, i = !0) {
	let a = hb[e];
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
	xb(n.name, "Name");
	for (let e of a.required) xb(n[e], e);
	if (![
		"Active",
		"Inactive",
		"Open",
		"In progress",
		"Completed"
	].includes(n.status ?? "Active")) throw Error("Invalid business status.");
	if (e === "tax-codes") {
		if (Sb(n.rate, "Tax rate"), n.basis && !["Exclusive", "Inclusive"].includes(n.basis)) throw Error("Invalid entry basis.");
		if (i) {
			let e = r.find((e) => e.id === n.id), i = t(), a = x.settings?.find((e) => e.section === "business" && e.status === "Active")?.gstCode ?? "GST";
			if (n.status === "Inactive" && n.code === a) throw Error("The default tax code must remain active. Change the business default first.");
			if (e && e.code !== n.code && (e.code === a || i.products.products.some((t) => (t.taxCode ?? "GST") === e.code) || (x["bank-rules"] ?? []).some((t) => t.taxCode === e.code) || (i.bankRuleApplications?.receipts ?? []).some((t) => t.decision.taxCode === e.code))) throw Error("A referenced tax code cannot be renamed. Create a new code and update future-use references.");
		}
		if (Number(n.rate) > 100) throw Error("Tax rate cannot exceed 100%.");
		if (i) {
			let e = Cb(n.collected, "LIABILITY"), r = Cb(n.paid, "ASSET"), i = (t().bankAccounts?.bankAccounts ?? []).map((e) => e.glAccountId);
			if (e.systemRole && e.systemRole !== "GST_PAYABLE" || r.systemRole && r.systemRole !== "GST_RECEIVABLE" || i.includes(r.id)) throw Error("Tax mappings cannot use AR/AP, inventory, GRNI or bank control accounts.");
		}
		if (r.some((e) => e.id !== n.id && e.code.toLowerCase() === n.code.toLowerCase())) throw Error("Tax code must be unique.");
		if (!/^[A-Z0-9_-]{1,24}$/.test(n.code)) throw Error("Use uppercase letters/numbers for a tax code.");
	}
	if (e === "linked-accounts" && i) {
		let e = P.requireBySystemRole(n.role), r = n.status === "Inactive" ? P.getAll().find((e) => e.systemRole === n.role)?.id : n.accountId, i = t().journals?.journalEntries ?? [];
		if (r !== e.id && i.some((t) => t.lines.some((t) => t.accountId === e.id || t.accountId === r))) throw Error("A used posting account cannot be remapped without a ledger migration.");
	}
	if (e === "linked-accounts") {
		if (!pb.includes(n.role)) throw Error("Unknown account role.");
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
		if (i && Cb(n.accountId, e), r.some((e) => e.id !== n.id && e.role === n.role)) throw Error("A linked account role may only have one mapping.");
	}
	if (e === "promotions") {
		let e = Xt(n.productId);
		if (i && (!e || !Zt(e.id, n.unitId))) throw Error("Product/unit not found.");
		if (Sb(n.price, "Price"), !Number.isInteger(Number(n.priority))) throw Error("Priority must be an integer.");
		if (![
			"Customer price first",
			"Promotion first",
			"Lowest eligible price"
		].includes(n.policy)) throw Error("Invalid price conflict policy.");
		if (!/([+-]\d\d:\d\d|Z)$/.test(n.starts) || !Number.isFinite(Date.parse(n.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(n.ends) || !Number.isFinite(Date.parse(n.ends)) || Date.parse(n.ends) <= Date.parse(n.starts)) throw Error("Promotion requires explicit time offsets and an end after start.");
	}
	if (i && n.customerId && !W.getById(n.customerId)) throw Error("Customer was not found.");
	if (e === "jobs") {
		if (Sb(n.budget, "Revenue budget"), Sb(n.costBudget, "Cost budget"), i) for (let e of ["budget", "costBudget"]) {
			let t = Number(n[e]);
			if (!Number.isSafeInteger(Math.round(t * 100)) || Math.abs(Math.round(t * 100) / 100 - t) > 1e-7) throw Error("Project budgets require safe currency amounts with at most two decimals.");
		}
		if (!wb(n.starts) || !wb(n.ends) || n.ends < n.starts) throw Error("Invalid project dates.");
		if (r.some((e) => e.id !== n.id && e.code.toLowerCase() === n.code.toLowerCase())) throw Error("Job code must be unique.");
	}
	if (e === "tasks") {
		if (i && n.id && (t().salesVisits?.visits ?? []).some((e) => e.followupTaskId === n.id && e.customerId !== n.customerId)) throw Error("A visit follow-up must retain the visit customer.");
		if (i && ![
			"Open",
			"In progress",
			"Completed"
		].includes(n.status ?? "Open")) throw Error("Task status must be Open, In progress or Completed.");
		if (!wb(n.due) || ![
			"Low",
			"Normal",
			"High"
		].includes(n.priority)) throw Error("Invalid due date or priority.");
	}
	if (e === "bank-rules") {
		if (i && Cb(n.accountId), Os(n), i && n.bankAccountId && n.bankAccountId !== "ALL" && !t().bankAccounts.bankAccounts.some((e) => e.id === n.bankAccountId)) throw Error("Bank rule scope account was not found.");
		if (i && !x["tax-codes"].some((e) => e.status === "Active" && e.code === n.taxCode)) throw Error("Active tax code not found.");
	}
	if (e === "custom-reports" && i && cb({
		dataset: n.dataset,
		columns: n.columns,
		basis: n.basis,
		filter: n.filter,
		favourite: n.favourite
	}), e === "report-packs" && i && Zy(n.reports), e === "report-packs" && (!wb(n.periodStart) || !wb(n.periodEnd) || n.periodEnd < n.periodStart)) throw Error("Invalid report period.");
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
			]) xb(n[e], e);
			if (n.status !== "Active") throw Error("Business settings must remain active.");
			if (!["Exclusive", "Inclusive"].includes(n.basis)) throw Error("Invalid price basis.");
			if (!/^\d+$/.test(n.terms) || Number(n.terms) > 365) throw Error("Payment terms must be 0–365 days.");
			if (!/^\d{2}-\d{2}$/.test(n.yearEnd) || !wb("2001-" + n.yearEnd)) throw Error("Year end must be MM-DD.");
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
function Eb(e, t, n) {
	yb[e].push({
		id: crypto.randomUUID(),
		name: n,
		status: "Active",
		revision: "1",
		createdAt: mb(),
		updatedAt: mb(),
		recordId: t.id,
		actorId: O.current()?.userId ?? "local-test",
		after: JSON.stringify(t)
	});
}
var Db = Object.fromEntries(Object.keys(hb).map((e) => {
	let t = {
		run(t) {
			if (e !== "custom-reports") throw Error("Saved-report execution is not available on this register.");
			return db(t);
		},
		generate(t) {
			if (e !== "report-packs") throw Error("Report generation is only available for report packs.");
			return tb(t);
		},
		getAll: () => x[e],
		getById: (t) => x[e].find((e) => e.id === t),
		save(t, n) {
			let r = fb.parse(t), i = x[e].find((e) => e.id === r.id);
			if (i && i.revision !== n) throw Error("Record changed. Reload before saving.");
			if (!i && n !== void 0) throw Error("Record no longer exists.");
			let a = mb(), o = {
				...r,
				id: i?.id ?? crypto.randomUUID(),
				name: r.name.trim(),
				status: r.status ?? (e === "tasks" ? "Open" : "Active"),
				revision: String(Number(i?.revision ?? "0") + 1),
				createdAt: i?.createdAt ?? a,
				updatedAt: a
			};
			return e === "tasks" && (delete o.completedAt, delete o.completedBy, o.status === "Completed" && (o.completedAt = i?.status === "Completed" && i.completedAt || a, o.completedBy = i?.status === "Completed" ? i.completedBy || O.current()?.userId || "local-test" : O.current()?.userId ?? "local-test")), Tb(e, o, x[e]), x[e] = [...x[e].filter((e) => e.id !== o.id), o], Eb(e, o, i ? "Updated" : "Created"), vb(), o;
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
			Eb(e, {
				...i,
				note: r.trim()
			}, "Note added"), vb();
		}
	};
	return i("workspace_" + e.replaceAll("-", "_"), {
		validate: (t, n) => {
			Ob(e, t), kb(e, t, n);
		},
		repository: t,
		read: hb[e].read,
		commands: {
			run: e === "custom-reports" ? "accounting.read" : null,
			generate: e === "report-packs" ? "accounting.read" : null,
			save: hb[e].write,
			setStatus: hb[e].write,
			addNote: e === "tasks" ? "sales.write" : null
		},
		snapshot: () => ({
			records: x[e],
			history: yb[e]
		}),
		restore: (t) => {
			Ob(e, t), x[e] = t.records, yb[e] = t.history;
		},
		publish: vb
	}), [e, t];
}));
function Ob(t, n) {
	let r = e({
		records: s(fb),
		history: s(fb)
	}).strict().parse(n), i = /* @__PURE__ */ new Set();
	for (let e of r.records) {
		if (!e.id || i.has(e.id) || !/^\d+$/.test(e.revision)) throw Error("Invalid workspace record identity.");
		i.add(e.id), Tb(t, e, r.records, !1);
	}
	return r;
}
function kb(e, t, n) {
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
var Ab = E().trim().min(1).max(200), jb = E().trim().min(1).max(4e3), Mb = E().refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), Nb = E().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}, "Invalid visit timestamp."), Pb = e({
	operationId: Ab,
	name: Ab,
	customerId: Ab,
	locationId: Ab.optional(),
	plannedDate: Mb,
	locationNote: E().trim().max(500).default("")
}).strict(), Fb = e({
	name: Ab,
	due: Mb,
	priority: T([
		"Low",
		"Normal",
		"High"
	]),
	notes: jb
}).strict(), Ib = e({
	id: Ab,
	expectedRevision: f().int().positive(),
	outcome: jb,
	followup: Fb.optional()
}).strict(), Lb = e({
	id: Ab,
	action: Ab,
	actorId: Ab,
	at: Nb,
	note: E().optional()
}).strict(), Rb = e({
	id: Ab,
	operationId: Ab,
	creationFingerprint: E().min(1).max(3e3),
	name: Ab,
	customerId: Ab,
	customerName: Ab,
	locationId: Ab.optional(),
	locationName: E().max(200).optional(),
	locationNote: E().max(500),
	plannedDate: Mb,
	status: T([
		"Planned",
		"Checked in",
		"Completed",
		"Cancelled"
	]),
	revision: f().int().positive(),
	ownerId: Ab,
	createdAt: Nb,
	updatedAt: Nb,
	checkInAt: Nb.optional(),
	checkInBy: Ab.optional(),
	checkOutAt: Nb.optional(),
	checkOutBy: Ab.optional(),
	outcome: jb.optional(),
	completionFingerprint: E().optional(),
	followupTaskId: Ab.optional(),
	history: s(Lb).min(1)
}).strict(), zb = [], Bb = 0, Vb = /* @__PURE__ */ new Set(), Hb = () => {
	Bb++, Vb.forEach((e) => e());
}, Ub = () => O.require("sales.write").userId, Wb = () => (/* @__PURE__ */ new Date()).toISOString(), Gb = (e, t, n, r) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	...r ? { note: r } : {}
});
function Kb(e) {
	let t = zb.find((t) => t.id === e);
	if (!t) throw Error("Visit not found.");
	return t;
}
function qb(e, t) {
	if (e.revision !== t) throw Error("Visit changed. Reload before continuing.");
}
function Jb(e) {
	let t = Wb();
	if (t < e.updatedAt) throw Error("System clock precedes the last visit update. Correct the clock before continuing.");
	return t;
}
function Yb(e) {
	return zb = [...zb.filter((t) => t.id !== e.id), e], Hb(), e;
}
function Xb(e, t) {
	let n = W.getById(e);
	if (!n || n.status === "INACTIVE") throw Error("Choose an available customer.");
	if (t && !n.locations.some((e) => e.id === t)) throw Error("Choose a location belonging to the selected customer.");
	return n;
}
i("salesVisits", {
	repository: {
		subscribe(e) {
			return Vb.add(e), () => {
				Vb.delete(e);
			};
		},
		getSnapshot: () => zb,
		getAll: () => zb,
		create(e) {
			let t = Ub(), n = Pb.parse(e), r = JSON.stringify(n), i = zb.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.creationFingerprint !== r) throw Error("Operation ID was used for different visit data.");
				return i;
			}
			let a = Xb(n.customerId, n.locationId), o = Wb();
			return Yb({
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
				history: [Gb("Planned", t, o)]
			});
		},
		update(e) {
			let t = Ub(), n = Pb.omit({ operationId: !0 }).extend({
				id: Ab,
				expectedRevision: f().int().positive()
			}).strict().parse(e), r = Kb(n.id);
			if (qb(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be edited.");
			let i = Xb(n.customerId, n.locationId), a = Jb(r), o = {
				...r,
				name: n.name,
				customerId: n.customerId,
				customerName: i.businessName,
				plannedDate: n.plannedDate,
				locationNote: n.locationNote,
				revision: r.revision + 1,
				updatedAt: a,
				history: [...r.history, Gb("Plan updated", t, a, r.plannedDate + " → " + n.plannedDate)]
			};
			return delete o.locationId, delete o.locationName, n.locationId && (o.locationId = n.locationId, o.locationName = i.locations.find((e) => e.id === n.locationId).name), Yb(o);
		},
		checkIn(t) {
			let n = Ub(), r = e({
				id: Ab,
				expectedRevision: f().int().positive()
			}).strict().parse(t), i = Kb(r.id);
			if (i.status === "Checked in" && i.revision === r.expectedRevision + 1) return i;
			if (qb(i, r.expectedRevision), i.status !== "Planned") throw Error("Only a planned visit can be checked in.");
			Xb(i.customerId, i.locationId);
			let a = Jb(i);
			return Yb({
				...i,
				status: "Checked in",
				revision: i.revision + 1,
				checkInAt: a,
				checkInBy: n,
				updatedAt: a,
				history: [...i.history, Gb("Checked in", n, a)]
			});
		},
		finish(e) {
			let t = Ub(), n = Ib.parse(e), r = Kb(n.id), i = JSON.stringify({
				outcome: n.outcome,
				followup: n.followup
			});
			if (r.status === "Completed") {
				if (r.completionFingerprint === i) return r;
				throw Error("Visit is already completed with a different outcome.");
			}
			if (qb(r, n.expectedRevision), r.status !== "Checked in") throw Error("Check in before completing the visit.");
			let a = Jb(r);
			if (a < r.checkInAt) throw Error("System clock precedes check-in. Correct the clock before completing.");
			let o;
			return n.followup && (o = Db.tasks.save({
				...n.followup,
				customerId: r.customerId,
				owner: t,
				status: "Open"
			}).id), Yb({
				...r,
				status: "Completed",
				revision: r.revision + 1,
				checkOutAt: a,
				checkOutBy: t,
				outcome: n.outcome,
				completionFingerprint: i,
				...o ? { followupTaskId: o } : {},
				updatedAt: a,
				history: [...r.history, Gb("Completed", t, a, n.outcome)]
			});
		},
		cancel(t) {
			let n = Ub(), r = e({
				id: Ab,
				expectedRevision: f().int().positive(),
				reason: jb
			}).strict().parse(t), i = Kb(r.id);
			if (qb(i, r.expectedRevision), !["Planned", "Checked in"].includes(i.status)) throw Error("Only an unfinished visit can be cancelled.");
			let a = Jb(i);
			return Yb({
				...i,
				status: "Cancelled",
				revision: i.revision + 1,
				updatedAt: a,
				history: [...i.history, Gb("Cancelled", n, a, r.reason)]
			});
		},
		addNote(t) {
			let n = Ub(), r = e({
				id: Ab,
				expectedRevision: f().int().positive(),
				note: jb
			}).strict().parse(t), i = Kb(r.id);
			qb(i, r.expectedRevision);
			let a = Jb(i);
			return Yb({
				...i,
				revision: i.revision + 1,
				updatedAt: a,
				history: [...i.history, Gb("Note added", n, a, r.note)]
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
	snapshot: () => ({ visits: zb }),
	restore: (e) => {
		zb = e.visits;
	},
	publish: Hb,
	validate: (t, n) => {
		let r = e({ visits: s(Rb) }).strict().parse(t), i = n, a = /* @__PURE__ */ new Set();
		for (let t of r.visits) {
			if (a.has(t.operationId)) throw Error("Duplicate visit operation ID.");
			if (a.add(t.operationId), !i.customers.customers.find((e) => e.id === t.customerId) || t.locationId && !t.locationName) throw Error("Invalid visit customer/location reference.");
			if (t.history.length !== t.revision || new Set(t.history.map((e) => e.id)).size !== t.history.length || t.updatedAt < t.createdAt) throw Error("Invalid visit history.");
			if (Pb.parse(JSON.parse(t.creationFingerprint)).operationId !== t.operationId || t.history[0].action !== "Planned" || t.history[0].actorId !== t.ownerId || t.history[0].at !== t.createdAt) throw Error("Visit creation fingerprint is inconsistent.");
			if (!!t.checkInAt != !!t.checkInBy || !!t.checkOutAt != !!t.checkOutBy || t.checkInAt && t.checkInAt < t.createdAt || t.checkOutAt && (!t.checkInAt || t.checkOutAt < t.checkInAt)) throw Error("Invalid visit check-in/out history.");
			if (t.status === "Planned" && (t.checkInAt || t.checkOutAt) || t.status === "Checked in" && (!t.checkInAt || t.checkOutAt) || t.status === "Completed" && (!t.checkInAt || !t.checkOutAt || !t.outcome || !t.completionFingerprint) || t.status !== "Completed" && (t.checkOutAt || t.outcome || t.followupTaskId || t.completionFingerprint)) throw Error("Visit state is inconsistent.");
			if (t.status === "Completed") {
				let n = e({
					outcome: jb,
					followup: Fb.optional()
				}).strict().parse(JSON.parse(t.completionFingerprint));
				if (n.outcome !== t.outcome || !!n.followup != !!t.followupTaskId) throw Error("Visit completion fingerprint is inconsistent.");
			}
			if (t.followupTaskId && !i.workspace_tasks.records.some((e) => e.id === t.followupTaskId && e.customerId === t.customerId)) throw Error("Visit follow-up task is missing or belongs to another customer.");
		}
	}
});
//#endregion
//#region src/features/supplier-returns/supplierReturnRepository.ts
var Q = E().trim().min(1).max(200), Zb = f().finite().positive(), Qb = f().finite().nonnegative(), $b = e({
	operationId: Q,
	supplierBillId: Q,
	supplierCreditNumber: Q,
	returnDate: Q,
	reason: E().trim().min(3).max(2e3),
	lines: s(e({
		matchId: Q,
		quantity: Zb
	}).strict()).min(1).max(500)
}).strict(), ex = e({
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
	quantity: Zb,
	conversionToBase: Zb,
	quantityBase: Zb,
	siteId: Q,
	siteName: Q,
	inventoryMovementId: Q,
	costMovementId: Q,
	unitCostBase: Qb,
	inventoryValue: Qb,
	voidInventoryMovementId: Q.optional(),
	voidCostMovementId: Q.optional()
}).strict(), tx = e({
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
	lines: s(ex).min(1),
	inventoryValue: Qb,
	journalId: Q.optional(),
	createdAt: Q,
	createdBy: Q,
	voidDate: Q.optional(),
	voidReason: E().optional(),
	voidedBy: Q.optional(),
	voidedAt: Q.optional()
}).strict(), nx = [], rx = 0, ix = /* @__PURE__ */ new Set(), ax = () => {
	rx++, ix.forEach((e) => e());
}, ox = (e) => Math.round(e * 1e4) / 1e4, sx = (e) => Math.round(e * 100) / 100;
function cx(e, t, n) {
	if (Jr.getAll().some((r) => r.siteId === t && r.productId === n && ve(r.occurredAt) > e)) throw Error("Return/reversal date precedes later inventory activity at this site.");
}
function lx(e) {
	let t = Bi.getById(e);
	return !t || t.status === "VOID" || t.kind === "EXPENSE" || t.openingBalanceImportId ? [] : Mi.getByBill(e).filter((e) => e.status === "ACTIVE").flatMap((e) => {
		let n = t.lines.find((t) => t.id === e.supplierBillLineId), r = bi.getById(e.goodsReceiptId), i = r?.lines.find((t) => t.id === e.goodsReceiptLineId), a = n ? Zt(n.productId, n.unitId) : void 0;
		if (!n || !r || !i || !a) return [];
		let o = nx.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0);
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
			let t = $b.parse(e), n = JSON.stringify(t), r = nx.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.requestFingerprint !== n) throw Error("Operation ID already used with different return data.");
				return r;
			}
			M(), w(t.returnDate, "Return date"), Qn(t.returnDate);
			let i = Bi.getById(t.supplierBillId);
			if (!i || i.status === "VOID" || i.kind === "EXPENSE" || i.openingBalanceImportId) throw Error("Select an active stock bill matched to received goods.");
			if (t.returnDate < i.billDate) throw Error("Return date cannot precede bill date.");
			let a = lx(i.id), o = /* @__PURE__ */ new Set(), s = t.lines.map((e) => {
				if (o.has(e.matchId)) throw Error("Select each receipt match once.");
				o.add(e.matchId);
				let n = a.find((t) => t.matchId === e.matchId);
				if (!n) throw Error("Return line must belong to an active receipt match for this bill.");
				if (ox(e.quantity) !== e.quantity || e.quantity > n.availableQuantity + 1e-8) throw Error("Return quantity exceeds the matched receipt remainder or four decimal places.");
				if (t.returnDate < n.receiptDate) throw Error("Return date cannot precede receipt date.");
				let r = Xt(n.productId), i = Zt(n.productId, n.unitId), s = Nr.getById(n.siteId);
				if (!r || !i || !s || s.status !== "ACTIVE") throw Error("Return product, unit or active receiving site was not found.");
				if (r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(i.code) && !Number.isInteger(e.quantity)) throw Error("Whole packs must be returned in whole quantities.");
				cx(t.returnDate, s.id, r.id);
				let c = ox(e.quantity * n.conversionToBase);
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
				c.set(t, ox((c.get(t) ?? 0) + e.quantityBase));
			}
			for (let [e, t] of c) {
				let [n, r] = e.split("|");
				if ((pi.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t) throw Error("Insufficient stock at the original receiving site.");
			}
			let l = /* @__PURE__ */ new Map();
			for (let e of s) {
				let t = i.lines.find((t) => t.id === e.supplierBillLineId), n = l.get(t.id);
				l.set(t.id, {
					supplierBillLineId: t.id,
					quantity: ox((n?.quantity ?? 0) + e.quantity),
					unitCost: t.unitCost
				});
			}
			let u = crypto.randomUUID(), d = "SR-" + t.returnDate.slice(0, 4) + "-" + String(nx.length + 1).padStart(5, "0"), f = J.createReturnCredit({
				sourceSupplierBillId: i.id,
				supplierCreditNumber: t.supplierCreditNumber,
				creditDate: t.returnDate,
				reason: t.reason,
				lines: [...l.values()]
			}, u), p = s.map((e) => {
				pi.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let n = Rr.create({
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
				}), r = si({
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
			}), m = sx(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? F.post({
				journalDate: t.returnDate,
				description: `Physical supplier return ${d}`,
				reference: f.creditNumber,
				sourceType: "SUPPLIER_RETURN",
				sourceId: u,
				lines: [{
					accountId: P.requireBySystemRole("PURCHASE_PRICE_VARIANCE").id,
					debit: m,
					credit: 0
				}, {
					accountId: P.requireBySystemRole("INVENTORY").id,
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
				createdBy: O.current()?.userId ?? "local-test"
			};
			return nx = [g, ...nx], ax(), g;
		},
		reverse(t) {
			let n = e({
				returnId: Q,
				voidDate: Q,
				reason: E().trim().min(3).max(2e3)
			}).strict().parse(t), r = nx.find((e) => e.id === n.returnId);
			if (!r) throw Error("Supplier return not found.");
			if (r.status === "VOID") return r;
			if (M(), w(n.voidDate, "Reversal date"), Qn(n.voidDate), n.voidDate < r.returnDate) throw Error("Reversal date cannot precede return date.");
			for (let e of r.lines) cx(n.voidDate, e.siteId, e.productId);
			let i = J.getById(r.supplierCreditId);
			if ((i.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > n.voidDate) || J.getAllocationsByCredit(i.id).some((e) => e.reversedAt && ve(e.reversedAt) > n.voidDate)) throw Error("Reversal date precedes later credit settlement activity.");
			J.voidReturnCredit({
				supplierCreditId: r.supplierCreditId,
				reason: n.reason,
				voidDate: n.voidDate
			});
			let a = r.lines.map((e) => {
				pi.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = Rr.create({
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
				}), i = ci({
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
			r.journalId && F.reverse({
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
				voidedBy: O.current()?.userId ?? "local-test"
			};
			return nx = nx.map((e) => e.id === r.id ? o : e), ax(), o;
		}
	},
	read: "purchases.return.read",
	commands: {
		create: "purchases.return",
		reverse: "purchases.return"
	},
	snapshot: () => ({ returns: nx }),
	restore: (e) => {
		nx = e.returns;
	},
	publish: ax,
	validate: (t, n) => {
		let r = e({ returns: s(tx) }).strict().parse(t), i = n, a = /* @__PURE__ */ new Set();
		for (let e of r.returns) {
			w(e.returnDate), e.voidDate && w(e.voidDate);
			let t = $b.parse(JSON.parse(e.requestFingerprint));
			if (a.has(e.operationId) || t.operationId !== e.operationId || t.supplierBillId !== e.supplierBillId || t.returnDate !== e.returnDate) throw Error("Supplier return operation mismatch.");
			a.add(e.operationId);
			let n = i.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId && t.supplierId === e.supplierId), r = i.supplierCredits.supplierCredits.find((t) => t.id === e.supplierCreditId && t.physicalReturnId === e.id && t.sourceSupplierBillId === e.supplierBillId);
			if (!n || !r || e.status === "VOID" != (r.status === "VOID")) throw Error("Supplier return bill/credit reference is invalid.");
			if (sx(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue) throw Error("Supplier return cost total is invalid.");
			for (let t of e.lines) {
				let r = i.receiptMatches.matches.find((n) => n.id === t.matchId && n.supplierBillId === e.supplierBillId && n.supplierBillLineId === t.supplierBillLineId && n.goodsReceiptId === t.goodsReceiptId && n.goodsReceiptLineId === t.goodsReceiptLineId), a = i.costMovements.movements.find((e) => e.id === t.costMovementId), o = i.inventoryMovements.movements.find((e) => e.id === t.inventoryMovementId), s = i.goodsReceipts.goodsReceipts.find((e) => e.id === t.goodsReceiptId), c = n.lines.find((e) => e.id === t.supplierBillLineId);
				if (!r || !c || c.productId !== t.productId || c.unitId !== t.unitId || s?.siteId !== t.siteId || r.productId !== t.productId || !a || !o || a.referenceType !== "SUPPLIER_RETURN" || a.referenceId !== e.id || a.inventoryMovementId !== o.id || a.siteId !== t.siteId || a.productId !== t.productId || a.unitCostBase !== t.unitCostBase || a.quantityBase !== -t.quantityBase || sx(-a.valueChange) !== sx(t.inventoryValue) || ox(t.quantity * t.conversionToBase) !== t.quantityBase || o.referenceType !== "SUPPLIER_RETURN" || o.referenceId !== e.id || o.siteId !== t.siteId || o.productId !== t.productId || o.quantityBase !== -t.quantityBase || o.transactionQuantity !== -t.quantity || ve(o.occurredAt) !== e.returnDate) throw Error("Supplier return stock/cost reference is invalid.");
				if (e.status === "VOID") {
					let n = i.costMovements.movements.find((e) => e.id === t.voidCostMovementId), r = i.inventoryMovements.movements.find((e) => e.id === t.voidInventoryMovementId);
					if (!n || !r || n.inventoryMovementId !== r.id || n.referenceType !== "SUPPLIER_RETURN_VOID" || n.referenceId !== e.id || n.siteId !== t.siteId || n.productId !== t.productId || n.quantityBase !== t.quantityBase || sx(n.valueChange) !== sx(t.inventoryValue) || r.referenceType !== "SUPPLIER_RETURN_VOID" || r.quantityBase !== t.quantityBase || r.referenceId !== e.id || ve(n.occurredAt) !== e.voidDate) throw Error("Supplier return reversal reference is invalid.");
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
				let n = ox(e.lines.filter((e) => e.supplierBillLineId === t).reduce((e, t) => e + t.quantity, 0));
				if (!r.lines.some((e) => e.supplierBillLineId === t && e.quantity === n)) throw Error("Supplier return linked credit quantity mismatch.");
			}
			if (e.status === "VOID" && (!e.voidDate || e.voidDate < e.returnDate || !e.voidReason || !e.voidedBy)) throw Error("Supplier return reversal metadata is invalid.");
			if (e.inventoryValue && !i.journals.journalEntries.some((t) => t.id === e.journalId && t.sourceId === e.id && t.sourceType === "SUPPLIER_RETURN" && t.totalDebit === e.inventoryValue && (e.status === "VOID" ? t.status === "REVERSED" : t.status === "POSTED"))) throw Error("Supplier return journal reference is invalid.");
		}
		for (let e of i.supplierCredits.supplierCredits) if (e.physicalReturnId && !r.returns.some((t) => t.id === e.physicalReturnId && t.supplierCreditId === e.id)) throw Error("Supplier credit physical return reference is invalid.");
		for (let e of i.receiptMatches.matches) if (ox(r.returns.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0)) > e.matchedBaseQuantity + 1e-8) throw Error("Supplier return quantities exceed the receipt match.");
	}
});
//#endregion
//#region src/features/document-output/outputRepository.ts
var ux = E().min(1).max(200), dx = E().max(2e4), fx = dx.optional(), px = [
	"QUOTE",
	"SALES_ORDER",
	"INVOICE",
	"CREDIT_NOTE"
], mx = e({
	operationId: ux,
	sourceId: ux,
	kind: T(px),
	expectedUpdatedAt: ux,
	templateId: ux.optional()
}).strict(), hx = f().finite().nonnegative(), gx = e({
	itemType: T([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	id: ux,
	sku: dx,
	description: dx,
	unitSymbol: dx,
	quantity: f().positive().finite(),
	unitPrice: hx,
	lineSubtotal: hx,
	taxAmount: hx,
	lineTotal: hx,
	taxCode: fx,
	taxRate: f().finite().min(0).max(1).optional(),
	requestedArea: f().positive().finite().optional(),
	areaPerPack: f().positive().finite().optional(),
	coveredArea: f().positive().finite().optional()
}).strict(), _x = e({
	locationId: fx,
	locationName: fx,
	deliveryAddress: fx,
	accountingContactId: fx,
	accountingContactName: fx,
	accountingEmail: fx
}).strict(), vx = e({
	id: ux,
	revision: ux,
	name: dx,
	subject: dx,
	body: dx,
	footer: dx,
	logoPosition: T([
		"Left",
		"Centre",
		"Right"
	]).optional(),
	paper: T(["A4", "Letter"])
}).strict(), yx = e({
	id: ux,
	operationId: ux,
	requestFingerprint: dx,
	preparedAt: ux,
	preparedBy: ux,
	sourceId: ux,
	kind: T(px),
	sourceUpdatedAt: ux,
	documentNumber: ux,
	status: ux,
	documentDate: ux,
	dueDate: fx,
	expiryDate: fx,
	reference: fx,
	notes: fx,
	customerId: ux,
	customerName: dx,
	customerCode: dx,
	customerIdentifier: fx,
	recipient: _x.optional(),
	issuer: e({
		name: dx,
		tradingName: fx,
		identifier: fx,
		address: fx,
		email: fx,
		phone: fx,
		currency: ux,
		logo: Ie.optional()
	}).strict(),
	lines: s(gx).min(1),
	totals: e({
		subtotal: hx,
		taxAmount: hx,
		total: hx
	}).strict(),
	amountPaid: hx.optional(),
	amountDue: hx.optional(),
	template: vx,
	subject: dx,
	body: dx
}).strict();
function bx(e, t) {
	if (e === "CREDIT_NOTE") {
		let e = G.getById(t);
		if (!e) throw Error("Credit note was not found.");
		return {
			...e,
			type: "CREDIT_NOTE",
			documentNumber: e.creditNoteNumber,
			documentDate: e.creditDate
		};
	}
	let n = K.getById(t);
	if (!n || n.type !== e) throw Error("Sales document was not found.");
	return n;
}
var xx = (e) => e === "QUOTE" ? "Quotation" : e === "INVOICE" ? "Invoice" : e === "SALES_ORDER" ? "Sales order" : "Credit note";
function Sx() {
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
var Cx = [];
Sx();
var wx = 0, Tx = /* @__PURE__ */ new Set(), Ex = () => {
	wx++, Tx.forEach((e) => e());
};
function Dx(e, t) {
	let n = t ? x.templates?.find((n) => n.id === t && n.status === "Active" && n.kind === xx(e)) : void 0;
	if (t && !n) throw Error("Select an active template for this document type.");
	return {
		id: n?.id ?? "built-in",
		revision: n?.revision ?? "1",
		name: n?.name ?? "Standard sales document",
		subject: n?.subject ?? "{{documentNumber}} · {{companyName}}",
		body: n?.body ?? "Dear {{customerName}},\nPlease find {{documentNumber}} for {{currency}} {{total}}.\n{{companyName}}",
		footer: n?.footer ?? "",
		...Ve() ? { logoPosition: n?.logo === "Centre" ? "Centre" : n?.logo === "Right" ? "Right" : "Left" } : {},
		paper: n?.paper === "Letter" ? "Letter" : "A4"
	};
}
var Ox = [
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
function kx(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!Ox.includes(n)) throw Error(`Unsupported template token: ${n}.`);
		return t[n] ?? "";
	});
}
function Ax(e) {
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
var jx = { prepare(e) {
	let t = mx.parse(e), n = JSON.stringify(t), r = Cx.find((e) => e.operationId === t.operationId);
	if (r) {
		if (r.requestFingerprint !== n) throw Error("Operation ID was used for different output data.");
		return r;
	}
	let i = bx(t.kind, t.sourceId);
	if (i.updatedAt !== t.expectedUpdatedAt) throw Error("Source document changed. Reload before preparing output.");
	let a = W.getById(i.customerId);
	if (!a) throw Error("Source customer was not found.");
	let o = C(), s = Dx(t.kind, t.templateId), c = structuredClone(i.recipient), l = {
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
		preparedBy: O.current()?.userId ?? "local-test",
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
			currency: o.currency,
			...Ve() ? { logo: Ve() } : {}
		},
		lines: i.lines.map(Ax),
		totals: structuredClone(i.totals),
		amountPaid: "amountPaid" in i ? i.amountPaid : void 0,
		amountDue: "amountDue" in i ? i.amountDue : void 0,
		template: {
			...s,
			footer: kx(s.footer, l)
		},
		subject: kx(s.subject, l),
		body: kx(s.body, l)
	};
	return Mx(u), Cx = [u, ...Cx], Ex(), u;
} };
function Mx(e) {
	let t = yx.parse(e);
	if (Dc(t.recipient), !Number.isFinite(Date.parse(t.preparedAt))) throw Error("Invalid preparation timestamp.");
	let n = mx.parse(JSON.parse(t.requestFingerprint));
	if (n.operationId !== t.operationId || n.sourceId !== t.sourceId || n.kind !== t.kind || n.expectedUpdatedAt !== t.sourceUpdatedAt) throw Error("Output source metadata mismatch.");
	let r = (e) => Math.round(e * 100) / 100;
	for (let e of t.lines) if (ac(e), r(e.lineSubtotal + e.taxAmount) !== e.lineTotal) throw Error("Invalid output line total.");
	for (let [e, n] of [
		["subtotal", "lineSubtotal"],
		["taxAmount", "taxAmount"],
		["total", "lineTotal"]
	]) if (r(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Invalid output totals.");
	return t;
}
i("preparedSalesOutputs", {
	repository: jx,
	read: "sales.read",
	commands: { prepare: "documents.prepare" },
	snapshot: () => ({
		artifacts: Cx,
		templates: Sx()
	}),
	restore: (e) => {
		Cx = e.artifacts, e.templates;
	},
	publish: Ex,
	validate: (t, n) => {
		let r = e({
			artifacts: s(yx),
			templates: s(e({
				id: ux,
				name: dx,
				kind: ux
			}).strict())
		}).strict().parse(t), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set();
		for (let e of r.artifacts) {
			if (Mx(e), i.has(e.id) || a.has(e.operationId)) throw Error("Duplicate prepared output.");
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
var Nx = E().trim().min(1).max(200), Px = e({
	operationId: Nx,
	salesOrderId: Nx,
	siteId: Nx,
	fulfilmentDate: Nx,
	lines: s(e({
		salesOrderLineId: Nx,
		fulfilledQuantity: f().positive().finite()
	}).strict()).min(1).max(500)
}).strict();
function Fx() {
	return K.getAll().filter((e) => e.type === "SALES_ORDER" && [
		"CONFIRMED",
		"PARTIALLY_FULFILLED",
		"INVOICED"
	].includes(e.status)).filter((e) => e.type === "SALES_ORDER" && (e.status !== "INVOICED" || e.invoiceIds.some((e) => {
		let t = K.getById(e);
		return t?.type === "INVOICE" && t.status !== "VOID";
	}))).map((e) => ({
		id: e.id,
		number: e.documentNumber,
		date: e.documentDate,
		delivery: e.recipient?.deliveryAddress,
		store: e.recipient?.locationName,
		lines: e.lines.filter(qt).map((t) => ({
			id: t.id,
			sku: t.sku,
			description: t.description,
			unit: t.unitSymbol,
			quantity: t.quantity,
			fulfilled: s_.getAll().filter((t) => t.salesOrderId === e.id && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t.id).reduce((e, t) => e + t.fulfilledQuantity, 0)
		}))
	})).filter((e) => e.lines.length > 0);
}
Fx();
var Ix = [], Lx = 0, Rx = /* @__PURE__ */ new Set(), zx = () => {
	Lx++, Rx.forEach((e) => e());
};
i("salesDispatch", {
	repository: {
		record(e) {
			let t = Px.parse(e), n = JSON.stringify(t), r = Ix.find((e) => e.id === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Dispatch operation ID was already used with different data.");
				return s_.getAll().find((e) => e.id === r.fulfilmentId);
			}
			if (M(), w(t.fulfilmentDate), Qn(t.fulfilmentDate), new Set(t.lines.map((e) => e.salesOrderLineId)).size !== t.lines.length) throw Error("Each dispatch line must be selected only once.");
			let i = s_.create(t);
			return Ix = [...Ix, {
				id: t.operationId,
				fingerprint: n,
				fulfilmentId: i.id
			}], zx(), i;
		},
		reverse(t) {
			let n = e({
				fulfilmentId: Nx,
				voidDate: Nx,
				reason: E().trim().min(3).max(1e3)
			}).strict().parse(t);
			M(), w(n.voidDate), Qn(n.voidDate);
			let r = s_.getAll().find((e) => e.id === n.fulfilmentId);
			return r?.status === "VOIDED" ? r : s_.void(n);
		}
	},
	read: "inventory.read",
	commands: {
		record: "inventory.adjust",
		reverse: "inventory.adjust"
	},
	snapshot: () => ({
		orders: Fx(),
		requests: Ix
	}),
	restore: (e) => {
		e.orders, Ix = e.requests;
	},
	publish: zx,
	validate: (t, n) => {
		let r = e({
			orders: s(e({
				id: Nx,
				number: Nx,
				date: Nx,
				delivery: E().optional(),
				store: E().optional(),
				lines: s(e({
					id: Nx,
					sku: E(),
					description: E(),
					unit: E(),
					quantity: f().finite().positive(),
					fulfilled: f().finite().nonnegative()
				}).strict())
			}).strict()),
			requests: s(e({
				id: Nx,
				fingerprint: E().max(1e6),
				fulfilmentId: Nx
			}).strict())
		}).strict().parse(t), i = n.fulfilments.fulfilments;
		if (r.requests.some((e) => !i.some((t) => t.id === e.fulfilmentId))) throw Error("Dispatch result reference is invalid.");
	}
});
//#endregion
//#region src/features/finance-foundation/openingBalanceRepository.ts
var Bx = (e) => Math.round((e + 2 ** -52) * 100) / 100, $ = E().trim().min(1).max(200), Vx = f().finite().refine((e) => Bx(e) === e, "Amounts must use cents precision"), Hx = e({
	accountId: $,
	debit: Vx.nonnegative(),
	credit: Vx.nonnegative()
}).strict(), Ux = e({
	contactId: $,
	reference: $,
	date: $,
	dueDate: $,
	amount: Vx
}).strict(), Wx = e({
	operationId: $,
	date: $,
	reason: E().trim().min(3).max(1e3),
	gl: s(Hx).min(2).max(5e3),
	ar: s(Ux).max(1e4),
	ap: s(Ux).max(1e4),
	banks: s(e({
		bankAccountId: $,
		amount: Vx
	}).strict()).max(500),
	stock: s(e({
		siteId: $,
		productId: $,
		quantity: f().positive().finite(),
		unitCost: f().nonnegative().finite()
	}).strict()).max(1e4)
}).strict(), Gx = [], Kx = 0, qx = /* @__PURE__ */ new Set(), Jx = () => {
	Kx++, qx.forEach((e) => e());
};
function Yx() {
	return t();
}
function Xx(e) {
	d(e), Hc(e.sales), el(e.customerCredits), k.update("supplierBills", e.supplierBills.supplierBills), k.update("supplierCredits", e.supplierCredits.supplierCredits);
}
function Zx(e, t) {
	if (new Set(e).size !== e.length) throw Error("Duplicate " + t + ".");
}
function Qx(e) {
	let t = Wx.parse(e);
	if (w(t.date, "Cutover date"), Qn(t.date), M(), Gx.some((e) => e.status === "POSTED")) throw Error("An opening batch is already active. Reverse the unused batch before replacing it.");
	let n = Yx();
	if (n.journals.journalEntries.some((e) => e.journalDate >= t.date)) throw Error("Cutover must be after all existing ledger activity. This import adds historical balances, never replaces existing transactions.");
	if (n.inventoryMovements.movements.some((e) => e.occurredAt.slice(0, 10) >= t.date)) throw Error("Cutover must be after existing inventory activity.");
	Zx(t.gl.map((e) => e.accountId), "GL account"), Zx(t.banks.map((e) => e.bankAccountId), "bank"), Zx(t.stock.map((e) => e.siteId + ":" + e.productId), "site/product");
	let r = rm({
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
	}), i = jm({
		suppliers: n.suppliers.suppliers,
		bills: n.supplierBills.supplierBills,
		payments: n.supplierPayments.supplierPayments,
		credits: n.supplierCredits.supplierCredits,
		creditAllocations: n.supplierCredits.allocations,
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: t.date
	}), a = Rm({
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
	let o = P.getAll(), s = (e) => P.requireBySystemRole(e).id, c = (e) => Bx(t.gl.filter((t) => t.accountId === e).reduce((e, t) => e + t.debit - t.credit, 0));
	for (let e of t.gl) {
		let t = P.requireById(e.accountId);
		if (!t.active || ![
			"ASSET",
			"LIABILITY",
			"EQUITY"
		].includes(t.type) || e.debit > 0 && e.credit > 0 || e.debit + e.credit <= 0) throw Error("Opening GL requires active balance-sheet accounts and one positive debit or credit per row.");
	}
	let l = Bx(t.gl.reduce((e, t) => e + t.debit, 0)), u = Bx(t.gl.reduce((e, t) => e + t.credit, 0));
	if (l !== u || !l) throw Error("Opening trial balance does not balance.");
	let d = Bx(t.ar.reduce((e, t) => e + t.amount, 0)), f = Bx(t.ap.reduce((e, t) => e + t.amount, 0));
	if (c(s("ACCOUNTS_RECEIVABLE")) !== d || c(s("ACCOUNTS_PAYABLE")) !== -f) throw Error("AR/AP detail must equal imported GL control balances. Negative detail creates an unused historical credit.");
	for (let [e, r] of [["ar", t.ar], ["ap", t.ap]]) {
		Zx(r.map((e) => e.contactId + ":" + e.reference.toLowerCase()), e + " reference");
		for (let i of r) {
			if (w(i.date), w(i.dueDate), !i.amount || i.date > t.date || i.dueDate < i.date) throw Error("Invalid outstanding document amount/date.");
			if (!(e === "ar" ? n.customers.customers : n.suppliers.suppliers).some((e) => e.id === i.contactId)) throw Error("Opening contact not found.");
			if ((e === "ar" ? [...n.sales.invoices.map((e) => [e.customerId, e.documentNumber]), ...n.customerCredits.creditNotes.map((e) => [e.customerId, e.creditNoteNumber])] : [...n.supplierBills.supplierBills.map((e) => [e.supplierId, e.supplierInvoiceNumber]), ...n.supplierCredits.supplierCredits.map((e) => [e.supplierId, e.supplierCreditNumber])]).some(([e, t]) => e === i.contactId && t.toLowerCase() === i.reference.toLowerCase())) throw Error("Historical document reference already exists.");
		}
	}
	let p = 0;
	for (let e of t.stock) {
		let t = Xt(e.productId), n = Nr.getById(e.siteId);
		if (!t || t.status !== "ACTIVE" || t.itemType === "SERVICE" || n?.status !== "ACTIVE") throw Error("Opening stock requires active stocked products/sites.");
		if (Math.round(e.quantity * 1e4) / 1e4 !== e.quantity) throw Error("Stock quantities use at most four decimal places.");
		p = Bx(p + Bx(e.quantity * e.unitCost));
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
			let { input: t, debit: n, credit: r, ar: i, ap: a, inventory: o } = Qx(e);
			return {
				date: t.date,
				debit: n,
				credit: r,
				ar: i,
				ap: a,
				inventory: o,
				bank: Bx(t.banks.reduce((e, t) => e + t.amount, 0)),
				documents: t.ar.length + t.ap.length
			};
		},
		post(e) {
			let t = Wx.parse(e), n = JSON.stringify(t), r = Gx.find((e) => e.operationId === t.operationId);
			if (n.length > 5e7) throw Error("Opening import exceeds 50 MB.");
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID already used for different opening data.");
				return r;
			}
			let { input: i, s: a } = Qx(t), o = crypto.randomUUID(), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
				id: o,
				operationId: i.operationId,
				fingerprint: n,
				date: i.date,
				reason: i.reason,
				status: "POSTED",
				actor: O.current()?.userId ?? "",
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
			}, l = (e) => P.requireBySystemRole(e).id, u = l("OWNERS_EQUITY"), d = 0, f = 0;
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
				let g = e === "ar" == t.amount > 0, _ = F.post({
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
			a.journals = Yx().journals, Xx(a);
			let p = i.gl.filter((e) => ![l("ACCOUNTS_RECEIVABLE"), l("ACCOUNTS_PAYABLE")].includes(e.accountId));
			(d || f) && p.push({
				accountId: u,
				debit: Bx(d),
				credit: Bx(f)
			});
			let m = /* @__PURE__ */ new Map();
			for (let e of p) m.set(e.accountId, Bx((m.get(e.accountId) ?? 0) + e.debit - e.credit));
			let h = [...m].filter(([, e]) => e !== 0).map(([e, t]) => ({
				accountId: e,
				debit: Math.max(0, t),
				credit: Math.max(0, -t)
			}));
			if (h.length) {
				let e = F.post({
					journalDate: i.date,
					description: "Opening trial balance " + i.reason,
					sourceType: "OPENING_BALANCE",
					sourceId: o,
					lines: h
				});
				c.journalIds.push(e.id);
			}
			for (let e of i.stock) {
				let t = Xt(e.productId), n = t.units.find((e) => e.id === t.baseUnitId), r = Rr.create({
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
				pi.receive({
					siteId: e.siteId,
					productId: t.id,
					baseUnitId: t.baseUnitId,
					quantityBase: e.quantity
				});
				let a = oi({
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
			return Gx = [...Gx, c], Jx(), c;
		},
		reverse(e) {
			if (w(e.date), Qn(e.date), M(), !e.reason?.trim() || e.reason.trim().length < 3) throw Error("Reversal reason is required.");
			let t = Gx.find((t) => t.id === e.id);
			if (!t) throw Error("Opening batch not found.");
			if (t.status === "REVERSED") return t;
			if (e.date < t.date) throw Error("Reversal date precedes cutover.");
			let n = Yx();
			if (n.journals.journalEntries.some((e) => !t.priorJournalIds.includes(e.id) && !t.journalIds.includes(e.id)) || n.inventoryMovements.movements.some((e) => !t.priorMovementIds.includes(e.id) && !t.movementIds.includes(e.id))) throw Error("Subsequent accounting or inventory activity exists. Reverse downstream activity before correcting opening balances.");
			let r = n.sales.invoices.filter((e) => t.invoiceIds.includes(e.id)), i = n.supplierBills.supplierBills.filter((e) => t.billIds.includes(e.id)), a = [...n.customerCredits.creditNotes.filter((e) => t.customerCreditIds.includes(e.id)), ...n.supplierCredits.supplierCredits.filter((e) => t.supplierCreditIds.includes(e.id))];
			if (r.some((e) => e.amountPaid !== 0 || e.amountDue !== e.totals.total) || i.some((e) => e.totals.amountPaid !== 0 || e.totals.amountCredited !== 0) || a.some((e) => e.amountApplied !== 0 || (e.amountRefunded ?? 0) !== 0)) throw Error("Opening balances have allocations or settlements. Reverse downstream allocations before correcting them.");
			for (let e of ["customerSettlements", "supplierRefunds"]) if (JSON.stringify(n[e]).includes(t.id)) throw Error("Opening balances have downstream settlements.");
			for (let e of t.journalIds) Yu(e);
			for (let n of t.journalIds) F.reverse({
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
			return n.stock.balances = t.priorStock, n.costBalances.balances = t.priorCost, n.journals = Yx().journals, Xx(n), Gx = Gx.map((n) => n.id === t.id ? {
				...n,
				status: "REVERSED",
				reversalDate: e.date,
				reversalReason: e.reason
			} : n), Jx(), Gx.find((e) => e.id === t.id);
		}
	},
	read: "accounting.read",
	commands: {
		preview: "accounting.post",
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ batches: Gx }),
	restore: (e) => {
		Gx = e.batches;
	},
	publish: Jx,
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
			let t = Wx.parse(JSON.parse(e.fingerprint));
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
//#region electron/security/periodCloseChecks.ts
function $x(e) {
	let n = t(), r = [], i = (e, t, n) => r.push({
		code: e,
		message: t,
		...n ? { path: n } : {}
	});
	e.endDate >= ve((/* @__PURE__ */ new Date()).toISOString()) && i("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of A.getUnresolved()) i("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of n.purchaseOperations) e.status !== "POSTED" && i("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of im()) i(e.code, `${e.entityId}: ${e.message}`);
	let a = g(O.current(), "payroll.read");
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
		for (let a of Hs({
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
		["AR", () => rm({
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
		["AP", () => jm({
			...f,
			suppliers: n.suppliers.suppliers,
			bills: n.supplierBills.supplierBills,
			payments: n.supplierPayments.supplierPayments,
			credits: n.supplierCredits.supplierCredits,
			creditAllocations: n.supplierCredits.allocations
		})],
		["INVENTORY", () => Rm({
			...f,
			costMovements: n.costMovements.movements
		})]
	];
	try {
		let t = Km({
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
		let t = qm({
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
var eS = null, tS = {
	configureTrustedSession(e) {
		eS = e;
	},
	clear() {
		eS = null;
	},
	current() {
		return eS?.() ?? null;
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
}, nS = "htt.purchasePosting.manualRecoveryAudit.v1";
function rS() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(nS) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var iS = rS();
function aS(e) {
	iS.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(nS, JSON.stringify(iS));
	} catch {}
}
i("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return iS.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = j.get(e);
			return tS.canRecover() && t?.status === "RECOVERY_REQUIRED" && j.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = tS.requireRecoveryPermission(), n = j.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!j.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				j.recover(e), aS({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw aS({
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
	snapshot: () => iS,
	restore: (e) => {
		iS.splice(0, iS.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var oS = !1;
function sS() {
	if (oS || (oS = !0, k.wasRestoredOnLoad())) return;
	let e = K.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) Kl.postInvoice(t), t.status === "VOID" && Kl.reverseInvoice(t);
	let t = zl.getAll();
	for (let e of t) Kl.postPayment(e), e.status === "REVERSED" && Kl.reversePayment(e);
	let n = G.getAll();
	for (let e of n) e.status !== "DRAFT" && (Kl.postCreditNote(e), e.status === "VOID" && Kl.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function cS() {
	let e = im().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/sales/data/salesManualReviewService.ts
var lS = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION"
]);
function uS(e) {
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
	let t = A.list().find((t) => t.operationId === e.operationId);
	if (!t || !lS.has(t.kind)) throw Error("Sales operation not found.");
	if (t.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return A.recordManualReview(e.operationId, e.reference, e.operator, e.summary);
}
//#endregion
//#region electron/security/businessEngine.ts
i("salesRecovery", {
	repository: {
		previewSourceRepair: ch,
		proposeSourceRepair: lh,
		executeSourceRepair: uh,
		withdrawSourceRepair: dh,
		inspectRecovery: Yh,
		recordSalesManualReview: uS,
		closeVerifiedSalesReview: hm,
		previewTargetedRepair: Eh,
		proposeTargetedRepair: Dh,
		executeTargetedRepair: Oh
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
var dS = t();
function fS(e) {
	qn($x, () => e()?.userId ?? ""), O.connect(e), tS.configureTrustedSession(e), sS(), cS();
}
//#endregion
export { Ss as assertBankInstructionCommand, Qn as assertPostingPeriod, Nd as classifyImportedBankLines, Op as dueRecurringCandidates, fS as initialize, Ap as prepareRecurringFailure, dS as workspaceDefaults };
