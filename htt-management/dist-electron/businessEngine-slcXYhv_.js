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
}, dt = e({
	termsDays: f().int().min(0).max(365),
	paymentMethod: T([
		"BANK_TRANSFER",
		"CARD",
		"CASH",
		"CHEQUE",
		"OTHER"
	]),
	termsSource: T([
		"SUPPLIER",
		"PURCHASE_SETTINGS",
		"LEGACY_30_DAY"
	]),
	settingsRevision: E().regex(/^\d+$/).optional()
}).strict();
function ft() {
	let e = x.settings?.find((e) => e.section === "purchases" && e.status === "Active");
	return {
		...e,
		terms: e?.termsPolicy ? e.terms : "30",
		termsPolicy: e?.termsPolicy ?? "SUPPLIER",
		paymentMethod: e?.paymentMethod ?? "BANK_TRANSFER"
	};
}
function pt(e) {
	let t = ft(), n = t.termsPolicy === "SUPPLIER" && e !== void 0;
	return dt.parse({
		termsDays: n ? e.paymentTermsDays : Number(t.terms),
		paymentMethod: t.paymentMethod,
		termsSource: n ? "SUPPLIER" : "PURCHASE_SETTINGS",
		settingsRevision: t.revision
	});
}
function mt(e) {
	return e.purchaseDefaults ?? {
		termsDays: 30,
		paymentMethod: "BANK_TRANSFER",
		termsSource: "LEGACY_30_DAY"
	};
}
function ht(e, t) {
	w(e, "Bill date");
	let n = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	return n.setUTCDate(n.getUTCDate() + t.termsDays), n.toISOString().slice(0, 10);
}
//#endregion
//#region src/features/purchases/data/mockPurchaseOrders.ts
var gt = [{
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
}], _t = [{
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
function vt() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function yt(e, t) {
	let n = vt();
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
function bt(e, t) {
	let n = vt();
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
function xt(e) {
	let t = vt();
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
var St = "htt:financial-snapshot:v1", Ct = (e) => !!e && typeof e == "object" && !Array.isArray(e), wt = (e) => new Set(e.map((e) => e.id)).size === e.length, Tt = (e) => {
	if (!Ct(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => Ct(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => Ct(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => Ct(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => Ct(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
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
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => Ct(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && Ct(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && Ct(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && Ct(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && wt(t) && wt(n) && wt(r) && wt(i);
}, Et = () => ({
	purchaseOrders: structuredClone(gt),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone(_t),
	transactions: [],
	transfers: [],
	journals: []
}), Dt, Ot = !1;
function kt() {
	return typeof window < "u" && !!window.localStorage;
}
function At() {
	if (Dt) return Dt;
	if (!kt()) return Et();
	let e = yt(St, Tt);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return Ot = e.status === "ok", Dt = e.status === "ok" ? {
		...Et(),
		...e.data
	} : Et(), Dt;
}
var jt = /* @__PURE__ */ new Set(), Mt = 0, Nt = /* @__PURE__ */ new Set();
function Pt(e) {
	if (kt() && !bt(St, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var k = {
	wasRestoredOnLoad() {
		return At(), Ot;
	},
	onRollback(e) {
		jt.add(e);
	},
	notify(e) {
		Mt ? Nt.add(e) : e();
	},
	transaction(e) {
		if (Mt) return e();
		let t = structuredClone(At());
		Dt = structuredClone(t), Mt++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			Pt(At());
		} catch (e) {
			throw Dt = t, jt.forEach((e) => e()), Nt.clear(), e;
		} finally {
			Mt--;
		}
		let r = [...Nt];
		return Nt.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(At());
	},
	update(e, t) {
		let n = {
			...At(),
			[e]: structuredClone(t)
		};
		if (!Tt(n)) throw Error("Invalid financial snapshot; write blocked.");
		Mt || Pt(n), Dt = n;
	},
	resetCacheForTests() {
		Dt = void 0, Ot = !1;
	}
};
i("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => k.read(),
	restore: (e) => {
		Dt = e;
	},
	publish: () => {}
});
//#endregion
//#region src/lib/persistence/financialOperationJournal.ts
var Ft = "htt:financial-operations:v1", It = [
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
function Lt() {
	let e = yt(Ft, be);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function Rt(e) {
	if (!xt(Ft) || !bt(Ft, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var A = {
	list() {
		return Lt().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !It.includes(t)) throw Error("Invalid operation identity.");
		let r = Lt(), i = r.find((t) => t.operationId === e);
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
		return Rt([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = Lt(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Rt(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = Lt(), r = n.find((t) => t.operationId === e);
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
		return Rt(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = Lt(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Rt(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = Lt(), a = i.find((t) => t.operationId === e);
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
		return Rt(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = Lt(), a = i.find((t) => t.operationId === e);
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
		return Rt(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	attachRepairProposal(e, t) {
		let n = Lt(), r = n.find((t) => t.operationId === e);
		if (!r || r.state !== "MANUAL_REVIEW" || !re(t) || t.status !== "PROPOSED" || !r.reviewHistory?.some((e) => e.reference === t.reference && e.operator === t.reviewer)) throw Error("Repair proposal has no trusted review evidence.");
		let i = {
			...r,
			repairProposalHistory: r.repairProposal ? [...r.repairProposalHistory ?? [], r.repairProposal] : r.repairProposalHistory,
			repairProposal: structuredClone(t)
		};
		return Rt(n.map((t) => t.operationId === e ? i : t)), structuredClone(i);
	},
	finishRepair(e, t, n, r, i, a) {
		let o = Lt(), s = o.find((t) => t.operationId === e), c = s?.repairProposal;
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
		return Rt(o.map((t) => t.operationId === e ? d : t)), structuredClone(d);
	},
	withdrawSourceRepair(e, t, n, r) {
		let i = Lt(), a = i.find((t) => t.operationId === e);
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
		return Rt(i.map((t) => t.operationId === e ? s : t)), s;
	},
	adoptReviewedResult(e, t) {
		let n = Lt(), r = n.find((t) => t.operationId === e);
		if (!r || r.state === "COMPLETED" || !t.trim() || r.resultId && r.resultId !== t) throw Error("Cannot replace a bound or completed result.");
		Rt(n.map((n) => n.operationId === e ? {
			...n,
			resultId: t
		} : n));
	},
	getUnresolved() {
		return Lt().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
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
var zt = /* @__PURE__ */ new Map(), Bt = "htt.purchasePosting.operations.v1";
function Vt() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function Ht() {
	let e = Vt();
	if (e) try {
		e.setItem(Bt, JSON.stringify([...zt.values()]));
	} catch {}
}
function Ut() {
	let e = Vt();
	if (e) try {
		let t = JSON.parse(e.getItem(Bt) ?? "[]");
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
			zt.set(t.key, {
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
Ut();
var Wt = /* @__PURE__ */ new Set(), Gt = /* @__PURE__ */ new Map(), Kt = /* @__PURE__ */ new Map(), qt;
function Jt() {
	Ht(), Wt.forEach((e) => e());
}
var j = {
	injectFailureBeforeStep(e, t, n = 1) {
		Kt.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		Kt.clear();
	},
	registerRecovery(e, t) {
		if (!zt.has(e)) throw Error(`Unknown posting operation: ${e}`);
		Gt.set(e, t);
	},
	runStep(e, t, n) {
		let r = zt.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = Kt.get(i) ?? 0;
		if (a > 0) throw Kt.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return Gt.has(e);
	},
	recover(e) {
		let t = zt.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = Gt.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (qt === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		qt = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			qt = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = zt.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...zt.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return Wt.add(e), () => {
			Wt.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if (zt.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return zt.set(n, r), Jt(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = zt.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		zt.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), Jt();
	},
	completeStep(e, t) {
		let n = zt.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (zt.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), Jt());
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
		zt.clear(), Gt.clear();
		for (let t of e) zt.set(t.key, t);
	},
	publish: () => Wt.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var Yt = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Xt(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${Yt.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function M() {
	Xt(A.list(), j.getAll());
}
//#endregion
//#region src/features/inventory/data/itemTypes.ts
function Zt(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function Qt(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function $t(e, t) {
	if (e.itemType !== void 0 && ![
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	].includes(String(e.itemType))) throw Error("Invalid saved sales item type.");
	if (t && (e.itemType ?? "STOCK") !== (t.itemType ?? "STOCK")) throw Error("Saved sales item type does not match its referenced product.");
}
//#endregion
//#region src/features/inventory/data/mockProducts.ts
var en = [
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
function tn(e) {
	return en.find((t) => t.id === e);
}
function nn(e, t) {
	return tn(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/business-workspace/productRules.ts
function rn(e, t, n, r) {
	let i = tn(e), a = nn(e, t);
	if (!i || i.status !== "ACTIVE" || !a?.active) throw Error("Select an active product and unit.");
	if (r === "buy" && !Zt(i)) throw Error("Non-stock/service items use expense bills, not inventory purchase orders.");
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
var an = [
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
], on = "htt.mock.contacts.suppliers.v1";
function sn(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var cn = yt(on, sn), ln = cn.status !== "invalid" && xt(on), un = /* @__PURE__ */ new Set(), dn = cn.status === "ok" ? cn.data : structuredClone(an);
function fn() {
	ln && bt(on, dn), un.forEach((e) => {
		e();
	});
}
function pn(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function mn() {
	let e = dn.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function hn(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function gn(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function _n(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: hn(e.tradingName),
		abn: gn(e.abn),
		status: e.status,
		email: hn(e.email),
		phone: hn(e.phone),
		website: hn(e.website),
		contactName: hn(e.contactName),
		addressLine1: hn(e.addressLine1),
		addressLine2: hn(e.addressLine2),
		suburb: hn(e.suburb),
		state: hn(e.state),
		postcode: hn(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: hn(e.notes)
	};
}
var vn = {
	subscribe(e) {
		return un.add(e), () => {
			un.delete(e);
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
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: pn("sup"),
			code: mn(),
			..._n(e),
			currency: C().currency,
			createdAt: t,
			updatedAt: t
		};
		return dn = [n, ...dn], fn(), n;
	},
	update(e, t) {
		let n = vn.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			..._n(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return dn = dn.map((t) => t.id === e ? r : t), fn(), r;
	}
};
i("suppliers", {
	repository: vn,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: dn }),
	restore: (e) => {
		dn = e.suppliers;
	},
	publish: () => un.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
function yn(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function bn({ orderedQuantity: e, unitCost: t, taxRate: n = ue(), inclusiveLineTotal: r }) {
	let i = yn(e * t), a = yn(r === void 0 ? i * n : r - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: yn(i + a)
	};
}
function xn(e) {
	let t = yn(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = yn(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: yn(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var Sn = /* @__PURE__ */ new Set(), Cn = k.read().purchaseOrders;
k.onRollback(() => {
	Cn = k.read().purchaseOrders;
});
function wn() {
	try {
		k.update("purchaseOrders", Cn);
	} catch (e) {
		throw Cn = k.read().purchaseOrders, e;
	}
	Sn.forEach((e) => k.notify(e));
}
function Tn(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function En(e) {
	return we("PO", Cn.map((e) => e.purchaseOrderNumber), e.slice(0, 4));
}
function Dn(e) {
	return e?.trim() || void 0;
}
function On(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = en.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let n = t.units.find((t) => t.id === e.unitId);
		if (!n) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!n.active) throw Error(`${n.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		if (rn(e.productId, e.unitId, e.orderedQuantity, "buy"), t.buyEnabled === !1) throw Error("Product is not available for purchasing.");
		let i = t.taxCode ?? C().gstCode, a = ue(i), o = bn({
			taxRate: a,
			inclusiveLineTotal: (e.priceBasis ?? C().basis) === "Inclusive" ? Math.round(e.orderedQuantity * e.unitCost * 100) / 100 : void 0,
			orderedQuantity: e.orderedQuantity,
			unitCost: De(e.unitCost, a, e.priceBasis)
		});
		return {
			id: Tn("pol"),
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
function kn(e) {
	let t = vn.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function An(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var jn = {
	subscribe(e) {
		return Sn.add(e), () => {
			Sn.delete(e);
		};
	},
	getSnapshot() {
		return le(Cn);
	},
	getAll() {
		return le(Cn);
	},
	getById(e) {
		return le(Cn).find((t) => t.id === e);
	},
	getBySupplier(e) {
		return le(Cn).filter((t) => t.supplierId === e);
	},
	create(e) {
		An(e);
		let t = kn(e.supplierId), n = On(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Tn("po"),
			purchaseDefaults: pt(t),
			purchaseOrderNumber: En(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: Dn(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: Dn(e.supplierReference),
			notes: Dn(e.notes),
			lines: n,
			totals: xn(n),
			createdAt: r,
			updatedAt: r
		};
		return Cn = [i, ...Cn], wn(), i;
	},
	updateDraft(e, t) {
		let n = jn.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		An(t);
		let r = kn(t.supplierId), i = On(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: Dn(t.expectedDeliveryDate),
			supplierReference: Dn(t.supplierReference),
			notes: Dn(t.notes),
			lines: i,
			totals: xn(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Cn = Cn.map((e) => e.id === n.id ? a : e), wn(), a;
	},
	approve(e) {
		let t = jn.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return Mn(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = jn.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return Mn(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = jn.getById(e);
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
		return Cn = Cn.map((e) => e.id === n.id ? o : e), wn(), o;
	},
	recordSupplierBill(e, t) {
		let n = jn.getById(e);
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
			let n = Nn(e.billedQuantity + t);
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
		return Cn = Cn.map((e) => e.id === n.id ? c : e), wn(), c;
	},
	reverseSupplierBill(e, t) {
		let n = jn.getById(e);
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
				billedQuantity: Nn(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Cn = Cn.map((e) => e.id === n.id ? c : e), wn(), c;
	},
	cancel(e, t) {
		let n = jn.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return Mn(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function Mn(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return Cn = Cn.map((t) => t.id === e.id ? n : t), wn(), n;
}
function Nn(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
i("purchaseOrders", {
	validate: (e) => {
		for (let t of e.purchaseOrders) t.purchaseDefaults !== void 0 && dt.parse(t.purchaseDefaults);
	},
	repository: jn,
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
	snapshot: () => ({ purchaseOrders: Cn }),
	restore: (e) => {
		Cn = e.purchaseOrders;
	},
	publish: () => Sn.forEach((e) => e())
});
function Pn(e) {
	if (Cn.some((t) => e.has(t.id) && t.status !== "DRAFT")) throw Error("Only draft purchase orders may be purged.");
	Cn = Cn.filter((t) => !e.has(t.id)), wn();
}
//#endregion
//#region src/features/accounting/data/accountRepository.ts
var Fn = /* @__PURE__ */ new Set(), N = "2026-10-08T00:00:00.000Z", In = [
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
function Ln() {
	Fn.forEach((e) => e());
}
function Rn(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function zn(e) {
	return e?.trim() || void 0;
}
function Bn(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function Vn(e, t) {
	if (In.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function Hn(e, t) {
	if (!e) return;
	let n = In.find((n) => n.id !== t && (Ee(e) ? n.id === Ee(e) : n.systemRole === e));
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function Un() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var P = {
	subscribe(e) {
		return Fn.add(e), () => {
			Fn.delete(e);
		};
	},
	getSnapshot() {
		return In;
	},
	getAll() {
		return In;
	},
	getById(e) {
		return In.find((t) => t.id === e);
	},
	getByCode(e) {
		return In.find((t) => t.code.toLowerCase() === e.trim().toLowerCase());
	},
	getBySystemRole(e) {
		return In.find((t) => Ee(e) ? t.id === Ee(e) : t.systemRole === e);
	},
	requireById(e) {
		let t = In.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = In.find((t) => Ee(e) ? t.id === Ee(e) : t.systemRole === e);
		if (!t) throw Error(`Accounting account for system role ${e} was not found.`);
		return t;
	},
	create(e) {
		let t = Rn(e.code, "Account code"), n = Rn(e.name, "Account name");
		Bn(t), Vn(t), Hn(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Un(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: zn(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return In = [...In, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), Ln(), i;
	},
	update(e, t) {
		let n = In.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = Rn(t.code, "Account code"), i = Rn(t.name, "Account name");
		if (Bn(r), Vn(r, e), (n.systemRole || S(n.id)) && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: zn(t.description),
			active: n.systemRole || S(n.id) ? !0 : t.active,
			allowManualPosting: n.systemRole || S(n.id) ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return In = In.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), Ln(), a;
	},
	setActive(e, t) {
		let n = In.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		if ((n.systemRole || S(n.id)) && !t) throw Error("System control accounts cannot be deactivated.");
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return In = In.map((t) => t.id === e ? r : t), Ln(), r;
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
	snapshot: () => ({ accounts: In }),
	restore: (e) => {
		In = e.accounts;
	},
	publish: () => Fn.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/taxPosting.ts
function Wn(e, t, n, r) {
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
function Gn(e, n) {
	let r = t(), i = r.journals?.journalEntries ?? [], a = r.bankReconciliations?.reconciliations ?? [], o = i.filter((t) => t.sourceType === e && t.sourceId === n).map((e) => e.id);
	if (a.some((e) => e.clearedTransactionIds.some((e) => o.some((t) => e.startsWith(t + ":"))))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Kn(e, n) {
	let r = t(), i = r.bankAccounts?.bankAccounts ?? [], a = r.bankReconciliations?.reconciliations ?? [];
	for (let t of i.filter((e) => n.includes(e.glAccountId))) {
		let n = a.filter((e) => e.bankAccountId === t.id).map((e) => e.statementDate).sort().at(-1);
		if (n && e <= n) throw Error(`Bank account is reconciled through ${n}. Use a posting date after that statement.`);
	}
}
function qn(e) {
	if (t().bankStatements?.lines.some((t) => t.status === "MATCHED" && t.ledgerIds.some((t) => t.startsWith(e + ":")))) throw Error("Unmatch the bank statement line before reversing its ledger source.");
}
//#endregion
//#region src/features/accounting/data/accountingPeriodRepository.ts
var Jn = [], Yn, Xn, Zn = /* @__PURE__ */ new Set();
function Qn(e, t) {
	Yn = e, Xn = t;
}
function $n() {
	let e = Xn?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function er(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function tr(e) {
	let t = Jn.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function nr() {
	Zn.forEach((e) => e());
}
function rr(e) {
	if (w(e, "Posting date"), !Jn.length) return;
	let t = Jn.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!Jn.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
i("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => Jn,
		subscribe(e) {
			return Zn.add(e), () => {
				Zn.delete(e);
			};
		},
		create(e) {
			let t = $n(), n = er(e.reason);
			if (w(e.startDate), w(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (Jn.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (Jn.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
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
			return Jn = [...Jn, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), nr(), r;
		},
		preflight(e) {
			let t = tr(e);
			if (!Yn) throw Error("Trusted close checks unavailable.");
			return Yn(t);
		},
		close(e) {
			let t = $n(), n = er(e.reason), r = tr(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (Jn.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return Jn = Jn.map((e) => e.id === r.id ? {
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
			} : e), nr(), tr(e.id);
		},
		reopen(e) {
			let t = $n(), n = er(e.reason), r = tr(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (Jn.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return Jn = Jn.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), nr(), tr(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: Jn }),
	restore: (e) => {
		ge(e.periods), Jn = e.periods;
	},
	publish: nr
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var ir = /* @__PURE__ */ new Set(), ar = k.read().journals;
k.onRollback(() => {
	ar = k.read().journals;
});
function or() {
	ir.forEach((e) => k.notify(e));
}
function sr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function cr(e) {
	return e?.trim() || void 0;
}
function lr(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function ur(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = ar.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function dr(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function fr(e) {
	if (lr(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = P.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = sr(r.debit), o = sr(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = sr(t + a), n = sr(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function pr(e) {
	return e.lines.map((e, t) => {
		let n = P.requireById(e.accountId);
		return {
			id: dr(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: cr(e.description),
			debit: sr(e.debit),
			credit: sr(e.credit)
		};
	});
}
function mr(e, t) {
	let n = pe(ar).originals;
	return ar.find((r) => r.sourceType === e && r.sourceId === t && !r.reversedJournalEntryId && !n.has(r.id));
}
var F = {
	subscribe(e) {
		return ir.add(e), () => {
			ir.delete(e);
		};
	},
	getSnapshot() {
		return ar;
	},
	getAll() {
		return ar;
	},
	getById(e) {
		return ar.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return ar.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: mr,
	post(e) {
		rr(e.journalDate), Kn(e.journalDate, e.lines.map((e) => e.accountId));
		let t = fr(e), n = cr(e.sourceId);
		if (n) {
			let t = mr(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: dr("je"),
			journalNumber: ur(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: cr(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: pr(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...ar];
		return k.update("journals", a), ar = a, or(), i;
	},
	reverse(e) {
		rr(e.reversalDate);
		let t = ar.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (qn(t.id), t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (lr(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Reversal reason must contain at least 3 characters.");
		Kn(e.reversalDate, t.lines.map((e) => e.accountId));
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
		}, i = fr(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: dr("je"),
			journalNumber: ur(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: pr(r),
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
		}, c = [o, ...ar.map((e) => e.id === t.id ? s : e)];
		return k.update("journals", c), ar = c, or(), o;
	}
};
function hr(e, t, n, r) {
	let i = ar.find((t) => t.id === e);
	if (!i) throw Error("Duplicate journal no longer exists.");
	let a = F.reverse({
		journalEntryId: e,
		reversalDate: i.journalDate,
		reason: r
	}), o = ar.map((r) => r.id === e ? {
		...r,
		bankDuplicateCorrection: {
			canonicalJournalId: t,
			operationId: n
		}
	} : r), s = pe(o);
	if (s.invalid.length || !s.originals.has(e)) throw Error("Duplicate correction failed exact-pair verification.");
	return k.update("journals", o), ar = o, or(), a;
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
	snapshot: () => ({ journalEntries: ar }),
	restore: (e) => {
		ar = e.journalEntries;
	},
	publish: () => ir.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var gr = "htt.mock.banking.accounts.v1";
function _r(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var vr = /* @__PURE__ */ new Set(), yr = "2026-10-08T00:00:00.000Z", br = [{
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
	createdAt: yr,
	updatedAt: yr
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
	createdAt: yr,
	updatedAt: yr
}], xr = yt(gr, _r);
xr.status === "ok" && xr.data.every((e) => {
	let t = P.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (br = xr.data);
function Sr() {
	vr.forEach((e) => e());
}
function Cr(e) {
	let t = P.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of br) Cr(e);
var I = {
	subscribe(e) {
		return vr.add(e), () => {
			vr.delete(e);
		};
	},
	getSnapshot() {
		return br;
	},
	getAll() {
		return br;
	},
	getById(e) {
		return br.find((t) => t.id === e);
	},
	getByGlAccountId(e) {
		return br.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = br.find((t) => t.id === e);
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
		if (w(r.openingBalanceDate, "Opening date"), br[0] && r.currency !== br[0].currency) throw Error("This profile uses one base currency; foreign-currency bank accounts are not supported.");
		let i = br.find((e) => e.id === r.id);
		if (i && i.updatedAt !== n) throw Error("Bank account changed; reload before editing.");
		if (!i && r.id) throw Error("Bank account was not found.");
		if (br.some((e) => e.id !== i?.id && e.glAccountId === r.glAccountId)) throw Error("Each bank account needs its own GL account.");
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
		return Cr(s), br = [...br.filter((e) => e.id !== s.id), s], Sr(), s;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return br = br.map((t) => t.id === e ? r : t), xt(gr) && bt(gr, br), Sr(), r;
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
	snapshot: () => ({ bankAccounts: br }),
	restore: (e) => {
		br = e.bankAccounts;
	},
	publish: () => vr.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function L(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function wr(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function Tr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Er({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return wr(e / t);
}
function Dr({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return Tr(e * t);
}
function Or({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = L(e + n), a = Tr(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : wr(a / i)
	};
}
function kr({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return Tr(e * t);
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function Ar(e) {
	return Tr(e.lines.reduce((e, t) => {
		let n = Er({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + Dr({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function jr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Mr(e) {
	return P.requireBySystemRole(e).id;
}
function Nr(e) {
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
function Pr(e, t) {
	return F.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Fr(e, t) {
	let n = Pr(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Ir = {
	validateGoodsReceiptPosting(e) {
		let t = P.requireBySystemRole("INVENTORY"), n = P.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = Ar(e);
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
		let a = jr(e.totals.subtotal - t);
		if (a !== 0) {
			let e = P.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = jr(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = Pr("SUPPLIER_BILL", e.id);
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
					accountId: Mr("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				...Wn(e.lines, "paid", !0, e.totals.taxAmount),
				...i === 0 ? [] : [{
					accountId: Mr("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: Mr("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = Fr("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Nr(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = Pr("SUPPLIER_PAYMENT", e.id);
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
				accountId: Mr("ACCOUNTS_PAYABLE"),
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
		let t = Fr("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Nr(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return Pr("SUPPLIER_CREDIT", e.id) || F.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: Mr("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				...e.lines.reduce((e, t) => {
					let n = t.expenseAccountId ?? Mr("PURCHASE_PRICE_VARIANCE"), r = e.find((e) => e.accountId === n);
					return r ? r.credit = Math.round((r.credit + t.lineSubtotal) * 100) / 100 : t.lineSubtotal && e.push({
						accountId: n,
						debit: 0,
						credit: t.lineSubtotal
					}), e;
				}, []),
				...Wn(e.lines, "paid", !1, e.totals.taxAmount)
			]
		});
	},
	reverseSupplierCredit(e) {
		for (let t of F.getBySource("SUPPLIER_CREDIT_RECLASS", e.id).filter((e) => e.status === "POSTED")) F.reverse({
			journalEntryId: t.id,
			reversalDate: Nr(e.voidedAt),
			reason: e.voidReason ?? "Credit void"
		});
		let t = Fr("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Nr(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, Lr = structuredClone([{
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
}]), Rr = {
	getAll() {
		return Lr;
	},
	getById(e) {
		return Lr.find((t) => t.id === e);
	},
	getActive() {
		return Lr.filter((e) => e.status === "ACTIVE");
	}
}, zr = /* @__PURE__ */ new Set(), Br = [];
function Vr() {
	zr.forEach((e) => e());
}
function Hr() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Br.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var Ur = {
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
	getByReference(e, t) {
		return Br.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return Br.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return Br.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: Hr(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Br = [t, ...Br], Vr(), t;
	}
};
i("inventoryMovements", {
	repository: Ur,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: Br }),
	restore: (e) => {
		Br = e.movements;
	},
	publish: () => zr.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var Wr = /* @__PURE__ */ new Set(), Gr = [];
function Kr() {
	Wr.forEach((e) => e());
}
var qr = {
	subscribe(e) {
		return Wr.add(e), () => {
			Wr.delete(e);
		};
	},
	getSnapshot() {
		return Gr;
	},
	getAll() {
		return Gr;
	},
	getBalance(e, t) {
		return Gr.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = qr.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return Gr = Gr.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? Gr.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...Gr], Kr(), e;
	},
	replaceAll(e) {
		Gr = e, Kr();
	},
	clear() {
		Gr = [], Kr();
	}
};
i("costBalances", {
	repository: qr,
	read: "inventory.cost.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: Gr }),
	restore: (e) => {
		Gr = e.balances;
	},
	publish: () => Wr.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var Jr = /* @__PURE__ */ new Set(), Yr = [];
function Xr() {
	Jr.forEach((e) => e());
}
function Zr() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Yr.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function Qr(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var $r = {
	subscribe(e) {
		return Jr.add(e), () => {
			Jr.delete(e);
		};
	},
	getSnapshot() {
		return Yr;
	},
	getAll() {
		return Yr;
	},
	getByReference(e, t) {
		return Yr.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return Yr.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return Yr.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return Yr.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return Qr(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: Zr(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = $r.build(e);
		return Yr = [t, ...Yr], Xr(), t;
	},
	replaceAll(e) {
		Yr = e, Xr();
	},
	clear() {
		Yr = [], Xr();
	}
};
i("costMovements", {
	repository: $r,
	read: "inventory.cost.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: Yr }),
	restore: (e) => {
		Yr = e.movements;
	},
	publish: () => Jr.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var ei = /* @__PURE__ */ new Set(), ti = "2026-01-01T00:00:00.000Z", ni = en.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: ti,
	updatedAt: ti
}));
function ri() {
	ei.forEach((e) => e());
}
var ii = {
	ensureProductPolicy(e, t, n) {
		let r = ni.find((t) => t.productId === e), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			productId: e,
			baseUnitId: t,
			active: n ? r?.active ?? !0 : !1,
			costingMethod: "MOVING_WEIGHTED_AVERAGE",
			createdAt: r?.createdAt ?? i,
			updatedAt: i
		};
		return ni = [...ni.filter((t) => t.productId !== e), a], ri(), a;
	},
	subscribe(e) {
		return ei.add(e), () => {
			ei.delete(e);
		};
	},
	getSnapshot() {
		return ni;
	},
	getAll() {
		return ni;
	},
	getByProductId(e) {
		return ni.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = ii.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		if (t && !Zt(tn(e) ?? { itemType: "SERVICE" })) throw Error("Inventory costing cannot be enabled for non-stock/service items.");
		let n = {
			...ii.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ni = ni.map((t) => t.productId === e ? n : t), ri(), n;
	}
};
i("costingPolicies", {
	repository: ii,
	read: "inventory.cost.read",
	commands: {
		ensureProductPolicy: null,
		setActive: "accounting.post"
	},
	snapshot: () => ({ policies: ni }),
	restore: (e) => {
		ni = e.policies;
	},
	publish: () => ei.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function ai(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function oi(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function si(e, t) {
	let n = tn(e);
	if (!n) throw Error("Product was not found.");
	if (!Zt(n)) throw Error("Non-stock/service items cannot move inventory value.");
	let r = ii.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = nn(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function ci(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = Tr(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(Tr(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function li(e) {
	if (e && $r.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function ui({ movement: e, balance: t }) {
	let n = $r.getAll(), r = qr.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	$r.replaceAll(i), qr.replaceAll(a);
}
function di(e) {
	if (ai(e.quantity), oi(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	li(e.inventoryMovementId);
	let { policy: t, unit: n } = si(e.productId, e.unitId), r = L(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = Er({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = Dr({
		quantityBase: r,
		unitCostBase: i
	}), o = qr.getBalance(e.siteId, e.productId);
	o && ci(o, t.baseUnitId);
	let s = Or({
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
	ci(l, t.baseUnitId);
	let u = $r.build({
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
	return ui({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function fi(e) {
	ai(e.quantity), oi(e.occurredAt), li(e.inventoryMovementId);
	let { policy: t, unit: n } = si(e.productId, e.unitId), r = L(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = qr.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (ci(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = wr(i.averageCostPerBaseUnit), o = kr({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = L(i.quantityOnHand - r), c = s === 0, l = Tr(c ? -i.inventoryValue : -o), u = c ? 0 : Tr(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : wr(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	ci(p, t.baseUnitId);
	let m = $r.build({
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
	return ui({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function pi(e) {
	if (ai(e.quantityBase), oi(e.occurredAt), li(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = tn(e.productId);
	if (!t) throw Error("Product was not found.");
	if (!Zt(t)) throw Error("Non-stock/service items cannot restore inventory value.");
	let n = ii.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = L(e.quantityBase), i = wr(e.unitCostBase), a = Tr(e.inventoryValue), o = qr.getBalance(e.siteId, e.productId);
	o && ci(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = L(s + r), u = Tr(c + a), d = l === 0 ? 0 : wr(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	ci(p, n.baseUnitId);
	let m = $r.build({
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
	return ui({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var mi = /* @__PURE__ */ new Set(), hi = [];
function gi() {
	mi.forEach((e) => e());
}
function _i(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var vi = {
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
	getBalance(e, t) {
		return hi.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = vi.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: _i(i.quantityOnHand + r),
				updatedAt: a
			};
			return hi = hi.map((r) => r.siteId === e && r.productId === t ? n : r), gi(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: _i(r),
			updatedAt: a
		};
		return hi = [o, ...hi], gi(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = vi.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = _i(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return hi = hi.map((n) => n.siteId === e && n.productId === t ? o : n), gi(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of Ur.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: _i((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		hi = Array.from(e.values()), gi();
	}
};
i("stock", {
	repository: vi,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: hi }),
	restore: (e) => {
		hi = e.balances;
	},
	publish: () => mi.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/goodsReceiptRepository.ts
var yi = /* @__PURE__ */ new Set(), bi = k.read().goodsReceipts;
k.onRollback(() => {
	bi = k.read().goodsReceipts;
});
function xi() {
	try {
		k.update("goodsReceipts", bi);
	} catch (e) {
		throw bi = k.read().goodsReceipts, e;
	}
	yi.forEach((e) => k.notify(e));
}
function Si(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Ci(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = bi.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function wi(e) {
	return e?.trim() || void 0;
}
var Ti = {
	subscribe(e) {
		return yi.add(e), () => {
			yi.delete(e);
		};
	},
	getSnapshot() {
		return bi;
	},
	getAll() {
		return bi;
	},
	getById(e) {
		return bi.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return bi.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = jn.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = Rr.getById(e.siteId);
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
			let r = Si(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!tn(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = nn(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = Si(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: Ci(e.receiptDate),
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
			supplierDeliveryReference: wi(e.supplierDeliveryReference),
			notes: wi(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		Ir.validateGoodsReceiptPosting(s), M();
		let c = j.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return j.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = tn(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				j.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = Ur.create({
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
					di({
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
					vi.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			j.runStep(c, "JOURNAL", () => {
				Ir.postGoodsReceipt(s);
			}), j.runStep(c, "PURCHASE_ORDER", () => {
				jn.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), j.runStep(c, "RECEIPT", () => {
				bi = [s, ...bi], xi();
			});
		}), j.recover(c), s;
	}
};
i("goodsReceipts", {
	repository: Ti,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: bi }),
	restore: (e) => {
		bi = e.goodsReceipts;
	},
	publish: () => yi.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var Ei = 1e-4;
function Di(e) {
	return Tr(e);
}
function Oi(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - L(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function ki(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function Ai(e, t, n) {
	let r = Er({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return Dr({
		quantityBase: L(e * n),
		unitCostBase: r
	});
}
function ji(e, t, n) {
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
function Mi(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = ji(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), Oi(e.quantity), ki(e.billUnitCost);
		let r = L(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > Ei);
		if (L(d.reduce((e, t) => e + t.availableQuantity, 0)) + Ei < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= Ei) break;
			let s = L(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = L(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = Dr({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: Er({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = Di(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), h = Math.abs(o.availableQuantity - s) <= Ei ? Di(p - m) : Ai(s, o.receiptUnitCost, o.conversionToBase);
			if (h < 0) throw Error("Receipt cost has been overallocated.");
			let g = Di(s * e.billUnitCost), _ = Di(g - h);
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
		if (r > Ei) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = Di(Di(e.quantity * e.billUnitCost) - Di(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = Di(p.matchedBillValue + f), p.priceVariance = Di(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = L(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = L(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = Di(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = Di(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: Di(p - f)
	};
}
var Ni = {
	calculate: Mi,
	getAvailableReceiptLines(e, t, n) {
		return ji(e, t, n);
	}
}, Pi = k.read().receiptMatches;
k.onRollback(() => {
	Pi = k.read().receiptMatches;
});
var Fi = /* @__PURE__ */ new Set(), Ii = () => {
	try {
		k.update("receiptMatches", Pi);
	} catch (e) {
		throw Pi = k.read().receiptMatches, e;
	}
	Fi.forEach((e) => k.notify(e));
}, Li = {
	getAll() {
		return [...Pi];
	},
	subscribe(e) {
		return Fi.add(e), () => {
			Fi.delete(e);
		};
	},
	getSnapshot() {
		return Pi;
	},
	getByBill(e) {
		return Pi.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (Pi.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		Pi = [...Pi, ...t], Ii();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		Pi = Pi.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), Ii();
	}
};
i("receiptMatches", {
	repository: Li,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: Pi }),
	restore: (e) => {
		Pi = e.matches;
	},
	publish: () => Fi.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
function Ri(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function zi({ quantity: e, unitCost: t, inclusiveLineTotal: n, taxRate: r = .1 }) {
	let i = Ri(e * t), a = Ri(n === void 0 ? i * r : n - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: Ri(i + a)
	};
}
function Bi(e) {
	let t = Ri(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Ri(e.reduce((e, t) => e + t.taxAmount, 0)), r = Ri(t + n);
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
var Vi = /* @__PURE__ */ new Set(), R = k.read().supplierBills;
k.onRollback(() => {
	R = k.read().supplierBills;
});
function Hi() {
	try {
		k.update("supplierBills", R);
	} catch (e) {
		throw R = k.read().supplierBills, e;
	}
	Vi.forEach((e) => k.notify(e));
}
function Ui(e) {
	return e?.trim() || void 0;
}
function Wi(e) {
	return we("BILL", R.map((e) => e.billNumber), e.slice(0, 4));
}
var Gi = {
	insertExpenseBill(e) {
		let t = R.find((t) => t.managedDraftId === e.managedDraftId);
		if (t) return t;
		if (R.some((t) => t.supplierId === e.supplierId && t.supplierInvoiceNumber.toLowerCase() === e.supplierInvoiceNumber.toLowerCase() && t.status !== "VOID")) throw Error("Supplier invoice reference already exists.");
		return R = [e, ...R], Hi(), e;
	},
	subscribe(e) {
		return Vi.add(e), () => {
			Vi.delete(e);
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
		let r = qi(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = qi(n.totals.amountPaid + r), a = qi(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return R = R.map((t) => t.id === e ? o : t), Hi(), o;
	},
	reversePayment(e, t) {
		let n = R.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = qi(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = qi(Math.max(0, n.totals.amountPaid - r)), a = qi(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return R = R.map((t) => t.id === e ? o : t), Hi(), o;
	},
	applyCredit(e, t) {
		let n = R.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = qi(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = qi(n.totals.amountCredited + r), a = qi(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return R = R.map((t) => t.id === e ? o : t), Hi(), o;
	},
	reverseCredit(e, t) {
		let n = R.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = qi(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = qi(Math.max(0, n.totals.amountCredited - r)), a = qi(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return R = R.map((t) => t.id === e ? o : t), Hi(), o;
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
			return Ir.reverseSupplierBill(t), R = R.map((e) => e.id === r.id ? t : e), Hi(), t;
		}
		if (Li.getByBill(r.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
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
				Ir.reverseSupplierBill(o);
			}), j.runStep(s, "PURCHASE_ORDER", () => {
				jn.reverseSupplierBill(r.purchaseOrderId, r.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), j.runStep(s, "MATCHES", () => {
				Li.reverseForBill(r.id, i, ve(a));
			}), j.runStep(s, "BILL", () => {
				R = R.map((e) => e.id === r.id ? o : e), Hi();
			});
		}), j.recover(s), o;
	},
	getByPurchaseOrder(e) {
		return R.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = jn.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (![
			"PARTIALLY_RECEIVED",
			"RECEIVED",
			"BILLED"
		].includes(t.status)) throw Error("Supplier bills can only be created for purchase orders with received goods.");
		let n = e.supplierInvoiceNumber.trim();
		if (!n) throw Error("Supplier invoice number is required.");
		if (R.some((e) => e.supplierId === t.supplierId && e.supplierInvoiceNumber.toLowerCase() === n.toLowerCase() && e.status !== "VOID")) throw Error("This supplier invoice number has already been entered.");
		if (e = {
			...e,
			dueDate: e.dueDate || ht(e.billDate, mt(t))
		}, w(e.billDate, "Bill date"), w(e.dueDate, "Due date"), !e.billDate) throw Error("Bill date is required.");
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
			let r = Ki(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = zi({
				taxRate: a,
				quantity: e.quantity,
				unitCost: e.unitCost
			});
			return n.grossUnitCost !== void 0 && e.unitCost === n.unitCost && (o.taxAmount = qi(e.quantity * n.grossUnitCost - o.lineSubtotal), o.lineTotal = qi(o.lineSubtotal + o.taxAmount)), {
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
		}), o = Bi(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: Wi(e.billDate),
			supplierInvoiceNumber: n,
			supplierId: t.supplierId,
			supplierCode: t.supplierCode,
			supplierName: t.supplierName,
			purchaseOrderId: t.id,
			purchaseOrderNumber: t.purchaseOrderNumber,
			billDate: e.billDate,
			purchaseDefaults: structuredClone(mt(t)),
			dueDate: e.dueDate,
			status: "OPEN",
			lines: a,
			totals: o,
			notes: Ui(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = Ni.calculate({
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
			receipts: Ti.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: Li.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		Ir.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), M();
		let u = j.begin("SUPPLIER_BILL", c.id).key;
		return j.registerRecovery(u, () => {
			j.runStep(u, "JOURNAL", () => {
				Ir.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), j.runStep(u, "PURCHASE_ORDER", () => {
				jn.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), j.runStep(u, "MATCHES", () => {
				Li.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), j.runStep(u, "BILL", () => {
				R = [c, ...R], Hi();
			});
		}), j.recover(u), c;
	}
};
function Ki(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function qi(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
i("supplierBills", {
	validate: (e, t) => {
		for (let n of e.supplierBills) if (n.purchaseDefaults !== void 0 && (dt.parse(n.purchaseDefaults), n.purchaseOrderId)) {
			let e = t.purchaseOrders.purchaseOrders.find((e) => e.id === n.purchaseOrderId);
			if (!e || JSON.stringify(mt(e)) !== JSON.stringify(n.purchaseDefaults)) throw Error("Bill purchase defaults do not match the source order.");
		}
	},
	repository: Gi,
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
	publish: () => Vi.forEach((e) => e())
});
function Ji(e, t) {
	let { status: n, ...r } = t;
	R = R.map((t) => t.id === e ? {
		...t,
		status: n,
		totals: {
			...t.totals,
			...r
		}
	} : t), Hi();
}
//#endregion
//#region src/features/purchases/data/supplierPaymentRepository.ts
var Yi = /* @__PURE__ */ new Set(), Xi = k.read().supplierPayments;
k.onRollback(() => {
	Xi = k.read().supplierPayments;
});
function Zi() {
	k.update("supplierPayments", Xi), Yi.forEach((e) => k.notify(e));
}
var Qi = {
	subscribe(e) {
		return Yi.add(e), () => {
			Yi.delete(e);
		};
	},
	getSnapshot() {
		return Xi;
	},
	getAll() {
		return Xi;
	},
	getById(e) {
		return Xi.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return Xi.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return Xi.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: ea(e.reference),
			notes: ea(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: ta(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = Xi.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (w(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = vn.getById(e.supplierId);
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
			let n = Gi.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = ta(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${na(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), c = ta(s.reduce((e, t) => e + t.amount, 0));
		if (c <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of s) Gi.applyPayment(e.supplierBillId, e.amount);
		let l = (/* @__PURE__ */ new Date()).toISOString(), u = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: $i(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: c,
			method: e.method,
			bankAccountId: i.id,
			reference: ea(e.reference),
			notes: ea(e.notes),
			allocations: s,
			status: "POSTED",
			createdAt: l,
			updatedAt: l
		};
		return Xi = [u, ...Xi], Zi(), Ir.postSupplierPayment(u), u;
	},
	recordPrepaymentSettlement(e) {
		w(e.paymentDate);
		let t = vn.getById(e.supplierId), n = Gi.getById(e.supplierBillId);
		if (!t || !n || n.supplierId !== t.id || e.paymentDate < n.billDate || !e.prepaymentId || !e.applicationId || !Number.isFinite(e.amount) || e.amount <= 0) throw Error("Invalid supplier prepayment application.");
		if (Xi.some((t) => t.id === e.id || t.prepaymentApplicationId === e.applicationId)) throw Error("Prepayment application already exists.");
		Gi.applyPayment(n.id, e.amount);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: e.id,
			prepaymentId: e.prepaymentId,
			prepaymentApplicationId: e.applicationId,
			paymentNumber: $i(e.paymentDate),
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
		return Xi = [i, ...Xi], Zi(), i;
	},
	reversePrepaymentSettlement(e, t, n) {
		w(t);
		let r = Xi.find((t) => t.id === e);
		if (!r?.prepaymentApplicationId || r.status !== "POSTED" || t < r.paymentDate || n.trim().length < 3) throw Error("Invalid supplier prepayment reversal.");
		for (let e of r.allocations) Gi.reversePayment(e.supplierBillId, e.amount);
		let i = {
			...r,
			status: "REVERSED",
			reversedAt: t,
			reversalReason: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Xi = Xi.map((t) => t.id === e ? i : t), Zi(), i;
	},
	reverse(e, t) {
		if (Gn("SUPPLIER_PAYMENT", e), Xi.find((t) => t.id === e)?.prepaymentApplicationId) throw Error("Reverse this settlement through supplier prepayments.");
		let n = Xi.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = Gi.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) Gi.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return Xi = Xi.map((t) => t.id === e ? a : t), Zi(), Ir.reverseSupplierPayment(a), a;
	}
};
function $i(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = Xi.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function ea(e) {
	return e?.trim() || void 0;
}
function ta(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function na(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: C().currency
	}).format(e);
}
var ra = Qi.create;
Qi.create = function(...e) {
	return M(), k.transaction(() => ra.apply(Qi, e));
};
var ia = Qi.reverse;
Qi.reverse = function(...e) {
	return M(), k.transaction(() => ia.apply(Qi, e));
}, i("supplierPayments", {
	repository: Qi,
	read: "purchases.read",
	commands: {
		recordPrepaymentSettlement: null,
		reversePrepaymentSettlement: null,
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: Xi }),
	restore: (e) => {
		Xi = e.supplierPayments;
	},
	publish: () => Yi.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/paymentBatchRepository.ts
var aa = (e) => Math.round((e + 2 ** -52) * 100) / 100, oa = E().trim().min(1).max(200), sa = e({
	operationId: oa,
	paymentDate: oa,
	bankAccountId: oa,
	reference: E().max(500),
	allocations: s(e({
		supplierBillId: oa,
		amount: f().finite().positive().refine((e) => aa(e) === e)
	}).strict()).min(1).max(500)
}).strict(), ca = [], la = 0, ua = /* @__PURE__ */ new Set(), da = () => {
	la++, ua.forEach((e) => e());
}, fa = () => {
	let e = O.current();
	if (!e) throw Error("A verified session is required.");
	return e.userId;
};
function pa(e, t) {
	return {
		action: e,
		reason: t,
		actor: fa(),
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function ma(e) {
	let t = ca.find((t) => t.id === e);
	if (!t) throw Error("Payment batch was not found.");
	return t;
}
function ha(e) {
	return ca = ca.map((t) => t.id === e.id ? e : t), da(), e;
}
function ga(e) {
	w(e.paymentDate, "Payment date");
	let t = I.requireById(e.bankAccountId);
	if (!t.active || e.paymentDate < t.openingBalanceDate) throw Error("Invalid paying bank account/date.");
	if (new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length) throw Error("Select each bill only once.");
	for (let t of e.allocations) {
		let n = Gi.getById(t.supplierBillId);
		if (!n || n.status === "VOID" || t.amount > n.totals.amountDue || e.paymentDate < n.billDate) throw Error("A bill amount, date or outstanding balance changed. Review the batch.");
	}
}
var _a = {
	create(e) {
		let t = sa.parse(e), n = JSON.stringify(t), r = ca.find((e) => e.operationId === t.operationId);
		if (r) {
			if (r.fingerprint !== n) throw Error("Operation ID was used with different batch data.");
			return r;
		}
		ga(t);
		let i = {
			...t,
			id: crypto.randomUUID(),
			fingerprint: n,
			status: "DRAFT",
			createdBy: fa(),
			paymentIds: [],
			history: [pa("Created")]
		};
		return ca = [...ca, i], da(), i;
	},
	approve(e) {
		let t = ma(e);
		if (t.status === "APPROVED") return t;
		if (t.status !== "DRAFT") throw Error("Only a draft batch can be approved.");
		return ga(t), ha({
			...t,
			status: "APPROVED",
			approvedBy: fa(),
			history: [...t.history, pa("Approved")]
		});
	},
	post(e) {
		let t = ma(e);
		if (t.status === "POSTED") return t;
		if (t.status !== "APPROVED") throw Error("Approve the batch before recording payments.");
		M(), ga(t);
		let n = /* @__PURE__ */ new Map();
		for (let e of t.allocations) {
			let t = Gi.getById(e.supplierBillId);
			n.set(t.supplierId, [...n.get(t.supplierId) ?? [], e]);
		}
		let r = [...n].map(([e, n]) => Qi.create({
			operationId: "batch:" + t.id + ":" + e,
			supplierId: e,
			paymentDate: t.paymentDate,
			bankAccountId: t.bankAccountId,
			reference: t.reference,
			method: "BANK_TRANSFER",
			allocations: n
		}));
		if (r.some((e) => e.status !== "POSTED")) throw Error("Batch payment is not posted. Inspect the prior operation before retrying.");
		return ha({
			...t,
			status: "POSTED",
			paymentIds: r.map((e) => e.id),
			history: [...t.history, pa("Payments recorded")]
		});
	},
	cancel(e) {
		let t = ma(e.id);
		if (!["DRAFT", "APPROVED"].includes(t.status) || e.reason?.trim().length < 3) throw Error("Only an unposted batch can be cancelled, with a reason.");
		return ha({
			...t,
			status: "CANCELLED",
			history: [...t.history, pa("Cancelled", e.reason)]
		});
	},
	reverse(e) {
		let t = ma(e.id);
		if (t.status === "REVERSED") return t;
		if (t.status !== "POSTED" || e.reason?.trim().length < 3) throw Error("A posted batch and reversal reason are required.");
		M();
		for (let e of t.paymentIds) {
			let t = Qi.getById(e);
			if (!t || t.status !== "POSTED") throw Error("Batch payments changed. Inspect before reversing.");
			Gn("SUPPLIER_PAYMENT", e);
		}
		for (let n of t.paymentIds) Qi.reverse(n, e.reason);
		return ha({
			...t,
			status: "REVERSED",
			history: [...t.history, pa("Reversed", e.reason)]
		});
	}
};
i("paymentBatches", {
	repository: _a,
	read: "banking.read",
	commands: {
		create: "purchases.payment",
		approve: "accounting.post",
		post: "purchases.payment",
		cancel: "purchases.payment",
		reverse: "purchases.payment"
	},
	snapshot: () => ({ batches: ca }),
	restore: (e) => {
		ca = e.batches;
	},
	validate: (t, n) => {
		let r = sa.extend({
			id: oa,
			fingerprint: E(),
			status: T([
				"DRAFT",
				"APPROVED",
				"POSTED",
				"REVERSED",
				"CANCELLED"
			]),
			createdBy: oa,
			approvedBy: oa.optional(),
			paymentIds: s(oa),
			history: s(e({
				action: oa,
				actor: oa,
				at: oa,
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
				if (u.has(t) || !n || !r || s.has(n.supplierId) || n.operationId !== "batch:" + e.id + ":" + n.supplierId || n.bankAccountId !== e.bankAccountId || n.paymentDate !== e.paymentDate || n.method !== "BANK_TRANSFER" || (n.reference ?? "") !== e.reference.trim() || n.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED") || d(n.allocations) !== d(r) || n.amount !== aa(r.reduce((e, t) => e + t.amount, 0))) throw Error("Payment batch payment relationships are invalid.");
				if (u.add(t), s.add(n.supplierId), !a.journals.journalEntries.some((e) => e.sourceType === "SUPPLIER_PAYMENT" && e.sourceId === t)) throw Error("A batch payment journal is missing.");
			}
		}
	},
	publish: da
});
//#endregion
//#region src/features/payroll/data/australianTax.ts
var va = [
	"Manual",
	"1",
	"2",
	"3",
	"4-resident",
	"4-foreign",
	"5",
	"6"
], ya = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
], ba = {
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
function xa(e, t, n, r) {
	if (!Number.isFinite(e) || e < 0 || e > 1e9) throw Error("Invalid taxable earnings.");
	if (r < "2026-07-01" || r > "2027-06-30") throw Error("Automatic PAYG is available only for pay dates in 2026–27. Use a reviewed manual amount for another year.");
	if (t === "Manual") throw Error("Manual withholding must be entered explicitly.");
	if (t.startsWith("4-")) return Math.floor(Math.floor(e) * (t === "4-resident" ? .47 : .45) + 1e-9);
	let i = Math.round(e * 100);
	n === "Monthly" && i % 100 == 33 && i++;
	let a = n === "Weekly" ? i / 100 : n === "Fortnightly" ? i / 200 : n === "Monthly" ? i * 3 / 1300 : i / 1300, o = Math.floor(a + 1e-9) + .99, s = ba[t]?.find(([e]) => o < e);
	if (!s) throw Error("Unsupported PAYG scale.");
	let c = Math.max(0, Math.round(s[1] * o - s[2]));
	return n === "Weekly" ? c : n === "Fortnightly" ? c * 2 : n === "Monthly" ? Math.round(c * 13 / 3) : c * 13;
}
//#endregion
//#region src/features/payroll/data/payrollProjects.ts
function Sa(e, t, n, r) {
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
function Ca(e, t) {
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
}), B = (e, t, n) => z(e, t, "select", n), wa = (e, t, n = "0") => ({
	...z(e, t, "number", void 0, n),
	min: 0,
	step: "0.01"
}), Ta = (e, t) => z(e, t, "date", void 0, "2026-10-16"), Ea = (e, t) => ({
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
}), Da = [];
function Oa(e, t, n, r, i, a, o, s, c) {
	Da.push({
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
Oa("products", "Products & services", "Inventory & pricing", "/inventory/products", "inventory.read", "Maintain purchasing, selling, stock and packaging information.", [
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
	wa("price", "Standard selling price", "49.50"),
	wa("cost", "Buying cost (sample)", "25"),
	wa("coverage", "m² per pack", "2.2"),
	B("rounding", "Pack rounding", ["Whole packs up", "Allow fractional packs"]),
	wa("reorder", "Reorder point", "10"),
	wa("target", "Target stock", "50"),
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
]), Oa("promotions", "Scheduled promotions", "Inventory & pricing", "/inventory/promotions", "inventory.read", "Plan customer and product specials with explicit start and end times.", [
	z("product", "Product / SKU"),
	z("customer", "Customer scope"),
	z("starts", "Starts (local time)", "datetime-local", void 0, "2026-10-16T09:00"),
	z("ends", "Ends (local time)", "datetime-local", void 0, "2026-10-31T17:00"),
	wa("price", "Promotional unit price", "45"),
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
]), Oa("tax-codes", "Tax codes", "Accounting", "/accounting/tax-codes", "accounting.read", "Review GST codes, inclusive/exclusive calculation and reporting mappings.", [
	z("code", "Tax code"),
	wa("rate", "Tax rate (%)", "15"),
	B("basis", "Entry basis", ["Exclusive", "Inclusive"]),
	Ea("collected", "GST collected account"),
	Ea("paid", "GST paid account"),
	z("report", "Return / report mapping")
], {
	name: "Standard GST",
	code: "GST15",
	report: "Output / input GST"
}, [
	"Overview",
	"Calculation preview",
	"Reporting"
]), Oa("linked-accounts", "Linked accounts", "Accounting", "/accounting/linked-accounts", "accounting.read", "Preview default general ledger mappings used by each business process.", [
	B("process", "Business process", [
		"Sales",
		"Purchases",
		"Payroll"
	]),
	Ea("receivable", "Receivables / payables control"),
	Ea("income", "Income / expense account"),
	Ea("inventory", "Inventory account"),
	Ea("cogs", "Cost of goods sold"),
	Ea("gst", "GST control account"),
	Ea("payroll", "Payroll clearing account")
], {
	name: "Sales posting defaults",
	process: "Sales"
}, ["Overview", "Posting example"]), Oa("jobs", "Jobs & projects", "Accounting", "/accounting/jobs", "accounting.read", "Track project budgets, allocate posted revenue and costs, and compare actual profitability.", [
	z("code", "Job code"),
	z("customer", "Customer"),
	z("owner", "Project owner"),
	Ta("starts", "Start date"),
	Ta("ends", "End date"),
	wa("budget", "Revenue budget", "10000"),
	wa("costBudget", "Cost budget", "6000")
], {
	name: "Sample showroom installation",
	code: "JOB-SAMPLE",
	customer: "Sample Flooring Ltd",
	owner: "Sample team"
}, [
	"Overview",
	"Transactions",
	"Profitability"
]), Oa("bank-accounts", "Bank account setup", "Banking", "/banking/setup/accounts", "banking.read", "Preview bank account details, ledger links and feed preferences.", [
	z("number", "Account number (sample only)"),
	z("bank", "Bank name"),
	B("currency", "Currency", ["NZD", "AUD"]),
	Ea("ledger", "Linked bank GL account"),
	B("feed", "Feed provider", ["Manual import", "Provider to be configured"]),
	Ta("feedStart", "Feed start date")
], {
	name: "Sample operating account",
	number: "00-0000-0000000-00",
	bank: "Sample Bank"
}, [
	"Overview",
	"Feed settings",
	"Import history"
]), Oa("bank-rules", "Bank rules", "Banking", "/banking/rules", "banking.read", "Define matching conditions and resulting categorisation before testing a sample.", [
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
	Ea("account", "Categorise to account"),
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
]), Oa("payment-batches", "Electronic payment batches", "Banking", "/banking/payment-batches", "banking.read", "Select sample supplier or wage payments, review approval and bank export layout.", [
	B("kind", "Batch type", ["Supplier payments", "Wages"]),
	Ta("payDate", "Payment date"),
	z("bank", "Paying account"),
	z("reference", "Bank reference"),
	B("format", "Export format", ["NZ bank CSV preview", "ABA layout preview"]),
	wa("total", "Batch total", "1100")
], {
	name: "Sample supplier batch",
	bank: "Sample operating account",
	reference: "OCT-SAMPLE"
}, [
	"Overview",
	"Payments",
	"Approval & export"
]), Oa("pay-items", "Pay items", "Payroll", "/payroll/pay-items", "payroll.read", "Configure sample earnings, allowances, deductions, leave, tax and employer contributions.", [
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
	wa("rate", "Rate / amount", "30"),
	B("taxable", "Tax treatment", [
		"Taxable",
		"Non-taxable",
		"Before tax deduction",
		"After tax deduction"
	]),
	Ea("expense", "Expense account"),
	Ea("liability", "Liability / clearing account")
], {
	name: "Ordinary hours",
	code: "ORD",
	category: "Earnings"
}, [
	"Overview",
	"Employee assignments",
	"Posting preview"
]), Oa("filing", "Payroll filing", "Payroll", "/payroll/filing", "payroll.read", "Review a sample NZ Payday Filing submission and its response / correction workflow.", [
	z("payrun", "Pay run reference"),
	Ta("payDate", "Pay date"),
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
]), Oa("recurring", "Recurring transactions", "Automation & tasks", "/automation/recurring", "inventory.read", "Generate due invoice and expense drafts from saved local templates with ordered schedules and retry protection.", [
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
	Ta("next", "Next generation date"),
	Ta("ends", "Schedule end date"),
	wa("total", "Template amount", "220"),
	B("mode", "Generation mode", ["Draft for review", "Require approval"])
], {
	name: "Monthly sample maintenance",
	contact: "Sample Flooring Ltd"
}, [
	"Overview",
	"Template lines",
	"Run history"
]), Oa("tasks", "Tasks & action centre", "Automation & tasks", "/tasks", "sales.read", "Maintain local tasks, owners and due dates with audited completion and reopening.", [
	z("customer", "Customer / branch"),
	z("owner", "Assigned to"),
	Ta("due", "Due date"),
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
]), Oa("visits", "Sales visits & activity", "Automation & tasks", "/sales/activity", "sales.read", "Plan local sales visits, record trusted check-in/out, outcomes and linked follow-up tasks.", [
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
]), Oa("draft-review", "Customer & contact review", "Automation & tasks", "/contacts/review", "sales.read", "Review local customer, branch and contact drafts, compare duplicates and approve or link real records.", [
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
]), Oa("templates", "PDF & email templates", "Documents & imports", "/documents/templates", "accounting.read", "Design sample invoice, quote, PO, statement and remittance layouts and email copy.", [
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
]), Oa("custom-reports", "Saved & favourite reports", "Reports", "/reports/saved", "accounting.read", "Save explicit filters and ordered columns, run local data and export complete results.", [
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
}, ["Overview", "Report preview"]), Oa("report-packs", "Report packs", "Reports", "/reports/packs", "accounting.read", "Generate combined financial reports from current local books, with ordered sections and printable exports.", [
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
var ka = Da;
[...new Set(Da.map((e) => e.group))], B("gst", "GST registration", ["Registered", "Not registered"]), B("filing", "GST filing cycle", [
	"Two monthly",
	"Monthly",
	"Six monthly"
]), wa("quoteNext", "Next quote number", "1001"), wa("orderNext", "Next order number", "1001"), wa("invoiceNext", "Next invoice number", "1001"), wa("creditNext", "Next credit number", "1001"), B("terms", "Default terms", [
	"20th of following month",
	"Due on receipt",
	"30 days"
]), B("template", "Default template", ["Standard invoice", "Trade invoice"]), B("reminders", "Overdue reminders", ["Manual only", "7 and 14 days overdue"]), B("onlinePayment", "Online payment option", ["Disabled", "Configuration preview"]), wa("next", "Next PO number", "1001"), B("terms", "Default payment terms", [
	"20th of following month",
	"30 days",
	"Due on receipt"
]), Ea("expense", "Default expense account"), B("receipt", "Bill matching", ["Require receipt match", "Allow expense bills"]), B("remittance", "Remittance preference", ["Preview before sending", "Manual"]), B("cycle", "Pay cycle", [
	"Weekly",
	"Fortnightly",
	"Monthly"
]), B("day", "Pay day", [
	"Wednesday",
	"Thursday",
	"Friday"
]), Ea("wages", "Wages expense account"), Ea("clearing", "Payroll clearing account"), B("bank", "Paying bank", ["Sample operating account"]), B("filing", "Filing region", ["New Zealand · Payday Filing", "Australia · STP preview"]), B("basis", "Default basis", ["Accrual", "Cash"]), B("currency", "Display currency", ["NZD", "AUD"]), B("precision", "Decimal places", ["2", "0"]), B("negative", "Negative number style", ["(1,234.56)", "-1,234.56"]), B("comparative", "Comparative period", [
	"Previous period",
	"Previous year",
	"None"
]);
//#endregion
//#region src/features/page-previews/previewModel.ts
function Aa(e, t) {
	return Object.fromEntries(e.map((e) => [e.key, t?.[e.key] ?? e.value ?? e.options?.[0] ?? ""]));
}
Object.fromEntries(ka.map((e) => [e.id, [{
	...Aa(e.fields),
	...e.example,
	id: "sample-1",
	name: e.example.name,
	status: "Draft"
}]]));
function ja(e) {
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
var Ma = [
	"Customer",
	"Branch",
	"Contact"
], Na = [
	"Manual",
	"Sales draft",
	"Selected contact",
	"Card transcription"
], Pa = {
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
}, Fa = se(E(), he([
	E().max(2e3),
	f().finite(),
	y()
]));
function Ia(e, t) {
	let n = Fa.parse(t), r = Pa[e];
	if (Object.keys(n).some((e) => !Object.hasOwn(r, e))) throw Error("Unsupported draft field. Use the documented fields for this draft type.");
	for (let [e, t] of Object.entries(n)) if (typeof t != typeof r[e]) throw Error(`Invalid value type for ${e}.`);
	return {
		...r,
		...n
	};
}
var La = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), Ra = (e) => String(e ?? "").trim().toLowerCase(), za = (e) => String(e ?? "").replace(/\D/g, ""), Ba = (e, t, n = La) => !!n(e) && n(e) === n(t);
function Va(e, t) {
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
		(Ba(r.businessName, e.businessName) || Ba(r.businessName, e.tradingName) || Ba(r.tradingName, e.businessName) || Ba(r.tradingName, e.tradingName)) && t.push("Business/trading name"), Ba(r.email, e.email, Ra) && t.push("Email"), Ba(r.phone, e.phone, za) && t.push("Phone"), Ba(r.abn, e.abn) && t.push("Identifier"), i(e.id, e.id, e.businessName, [
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
			Ba(r.name, e.name) && t.push("Branch name"), String(r.addressLine1).trim() && Ba([
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
			].join(" ")) && t.push("Address"), Ba(r.phone, e.phone, za) && t.push("Phone"), i(e.id, n.id, e.name, [
				e.addressLine1,
				e.suburb,
				e.postcode
			].filter(Boolean).join(" · "), t);
		}
		else for (let e of n.contacts) {
			let t = [];
			Ba([r.firstName, r.lastName].join(" "), [e.firstName, e.lastName].join(" ")) && t.push("Contact name"), Ba(r.email, e.email, Ra) && t.push("Email"), (Ba(r.phone, e.phone, za) || Ba(r.phone, e.mobile, za) || Ba(r.mobile, e.phone, za) || Ba(r.mobile, e.mobile, za)) && t.push("Phone/mobile"), i(e.id, n.id, `${e.firstName} ${e.lastName}`, [
				e.email,
				e.phone,
				e.mobile
			].filter(Boolean).join(" · "), t);
		}
	}
	return n.sort((e, t) => t.reasons.length - e.reasons.length || e.name.localeCompare(t.name) || e.id.localeCompare(t.id));
}
function Ha(e) {
	return JSON.stringify(e);
}
//#endregion
//#region src/features/data-transfer/transferModel.ts
var Ua = [
	"Customers",
	"Suppliers",
	"Customer branches",
	"Customer contacts",
	"Products"
], Wa = ["Create", "Update by ID"], Ga = "HTT-CSV-1", Ka = {
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
}, qa = {
	Customers: Pa.Customer,
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
		...Pa.Branch
	},
	"Customer contacts": {
		customerId: "",
		...Pa.Contact
	},
	Products: Ka
}, Ja = (e) => [
	"_format",
	"id",
	"recordToken",
	"externalId",
	...Object.keys(qa[e])
], Ya = {
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
}, Xa = e({
	dataset: T(Ua),
	mode: T(Wa),
	fileName: E().trim().min(1).max(200),
	text: E().max(1e6),
	mapping: se(E(), f().int().nonnegative()).optional()
}).strict();
function Za(e) {
	if (e.text.includes("\0")) throw Error("CSV source must be text without NUL characters.");
	let t = ja(e.text.replace(/^\uFEFF/, ""));
	if (t.length < 2 || t.length > 501) throw Error("Choose a CSV header and 1–500 data records.");
	let n = t[0].map((e) => e.trim());
	if (n.length > 64 || n.some((e) => !e || e.length > 120) || new Set(n.map((e) => e.toLowerCase())).size !== n.length) throw Error("CSV requires 1–64 distinct, nonempty column names of at most 120 characters.");
	if (t.slice(1).some((e) => e.length !== n.length || e.some((e) => e.length > 1e5))) throw Error("Each CSV record must match the header width; cells may not exceed 100,000 characters.");
	let r = Ja(e.dataset), i = e.mapping ?? Object.fromEntries(r.flatMap((e) => {
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
function Qa(e) {
	return e.map((e) => e.map((e) => "\"" + (/^[=+@\-'\t\r]/.test(e) ? "'" + e : e).replaceAll("\"", "\"\"") + "\"").join(",")).join("\r\n");
}
//#endregion
//#region src/features/payroll/data/payrollModel.ts
var V = E().trim().min(1).max(200), $a = E().refine((e) => /^\d{4}-\d{2}-\d{2}$/.test(e) && !isNaN(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e, "Use a valid date."), eo = E().trim().min(3).max(2e3), to = f().finite().min(0).max(1e9).refine((e) => Math.abs(e * 100 - Math.round(e * 100)) < 1e-5, "Use whole cents."), no = f().finite().min(0).max(1e5).refine((e) => Math.abs(e * 1e4 - Math.round(e * 1e4)) < 1e-6, "Use at most four decimal places."), ro = e({
	actorId: V,
	at: Me(),
	action: V,
	reason: eo,
	revision: f().int().positive()
}).strict(), io = {
	id: V,
	revision: f().int().positive(),
	history: s(ro).min(1)
}, ao = e({
	code: E().trim().min(1).max(40),
	name: V,
	position: E().trim().max(200),
	email: ee().or(b("")),
	startDate: $a,
	endDate: $a.or(b("")),
	status: T(["Active", "Inactive"]),
	basis: T(["Hourly", "Salary"]),
	rate: to,
	earningItemId: V,
	taxScale: T(va).default("Manual"),
	standardTaxConfirmed: y().default(!1),
	superFund: E().trim().max(200).default(""),
	superMemberId: E().trim().max(100).default(""),
	bankAccount: E().trim().max(100),
	taxIdentifier: E().trim().max(100),
	annualOpening: no,
	personalOpening: no
}).strict(), oo = ao.extend(io).strict(), so = e({
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
	rate: to,
	taxable: y(),
	accountId: V,
	liabilityAccountId: E().trim().max(200),
	active: y()
}).strict(), co = so.extend(io).strict(), lo = e({
	netAccountId: V,
	taxItemId: V,
	currency: E().regex(/^[A-Z]{3}$/),
	region: b("Australia"),
	frequency: T(ya).default("Fortnightly"),
	superItemId: V,
	employerName: V,
	employerIdentifier: E().trim().max(100)
}).strict(), uo = lo.extend(io).strict(), fo = e({
	id: V,
	code: E().max(200),
	name: V,
	revision: V
}).strict(), po = e({
	employeeId: V,
	itemId: V,
	projectId: V.optional(),
	date: $a,
	hours: no.refine((e) => e > 0),
	notes: E().trim().max(1e3)
}).strict(), mo = po.extend({
	...io,
	project: fo.optional(),
	status: T([
		"Draft",
		"Submitted",
		"Approved"
	])
}).strict(), ho = e({
	employeeId: V,
	type: T([
		"Annual",
		"Personal",
		"Unpaid"
	]),
	start: $a,
	end: $a,
	hours: no.refine((e) => e > 0),
	notes: E().trim().max(1e3)
}).strict(), go = ho.extend({
	...io,
	status: T([
		"Pending",
		"Approved",
		"Declined",
		"Cancelled"
	])
}).strict(), _o = e({
	employeeId: V,
	itemId: V,
	quantity: no.refine((e) => e > 0),
	rate: to
}).strict(), vo = e({
	name: V,
	start: $a,
	end: $a,
	payDate: $a,
	employeeInputs: s(e({
		employeeId: V,
		withholding: to,
		additionalWithholding: to.default(0),
		superMethod: T(["Reviewed amount", "12% reviewed QE"]).default("Reviewed amount"),
		superBase: to.default(0),
		superAmount: to.default(0),
		salaryOverride: to.optional(),
		annualAccrual: no,
		personalAccrual: no
	}).strict()).min(1).max(500),
	adjustments: s(_o).max(2e3),
	taxReviewed: y(),
	reviewReference: E().trim().max(500)
}).strict(), yo = e({
	item: co,
	quantity: no,
	rate: to,
	amount: to,
	source: E().max(200)
}).strict(), bo = e({
	gross: to,
	taxable: to,
	deductions: to,
	net: to,
	employerCost: to,
	withholding: to
}).strict(), xo = e({
	employee: oo,
	lines: s(yo).min(1),
	projectAllocation: e({
		times: s(mo).min(1),
		leaves: s(go),
		leaveHours: no,
		costs: s(e({
			lineIndex: f().int().nonnegative(),
			project: fo,
			amount: to.refine((e) => e > 0)
		}).strict())
	}).strict().optional(),
	timeIds: s(V),
	leaveIds: s(V),
	annualAccrual: no,
	personalAccrual: no,
	totals: bo
}).strict(), So = vo.extend({
	...io,
	status: T([
		"Draft",
		"Approved",
		"Posted",
		"Reversed",
		"Cancelled"
	]),
	slips: s(xo).min(1),
	totals: bo,
	settings: uo,
	sourceToken: V,
	journalId: V.optional(),
	reversalJournalId: V.optional(),
	reversalDate: $a.optional()
}).strict(), Co = e({
	...io,
	operationId: V,
	runId: V,
	accountId: V,
	bankAccountId: V,
	date: $a,
	amount: to.refine((e) => e > 0),
	reference: E().trim().max(200),
	status: T(["Posted", "Reversed"]),
	journalId: V,
	reversalJournalId: V.optional(),
	reversalDate: $a.optional()
}).strict(), wo = e({
	...io,
	runId: V,
	status: T([
		"Prepared",
		"External reference recorded",
		"Correction needed"
	]),
	reference: E().trim().max(200),
	notes: E().trim().max(1e3),
	runRevision: f().int().positive()
}).strict(), To = e({
	employees: s(oo),
	items: s(co),
	timesheets: s(mo),
	leave: s(go),
	runs: s(So),
	payments: s(Co),
	filings: s(wo),
	settings: s(uo).max(1),
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
}).strict(), Eo = () => ({
	employees: [],
	items: [],
	timesheets: [],
	leave: [],
	runs: [],
	payments: [],
	filings: [],
	settings: [],
	receipts: []
}), Do = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Oo(e) {
	let t = (t) => Do(e.filter(t).reduce((e, t) => e + t.amount, 0)), n = (e) => ["Earnings", "Allowance"].includes(e.item.category), r = t(n), i = t((e) => ["Deduction", "Tax"].includes(e.item.category));
	return bo.parse({
		gross: r,
		taxable: t((e) => n(e) && e.item.taxable),
		deductions: i,
		net: Do(r - i),
		employerCost: t((e) => e.item.category === "Employer contribution"),
		withholding: t((e) => e.item.category === "Tax")
	});
}
function ko(e) {
	return bo.parse(Object.fromEntries(Object.keys(bo.shape).map((t) => [t, Do(e.reduce((e, n) => e + n.totals[t], 0))])));
}
//#endregion
//#region electron/security/payrollRepository.ts
var H = Eo(), Ao = (e) => Array.isArray(e) ? e.map(Ao) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, Ao(e[t])])) : e, jo = (e) => Oe("sha256").update(JSON.stringify(Ao(e))).digest("hex"), Mo = {
	operationId: V,
	reason: eo
}, No = {
	id: V.optional(),
	expectedRevision: f().int().nonnegative()
};
function Po(e = "payroll.manage") {
	return O.require(e);
}
function U(e, t) {
	let n = H[e].find((e) => e.id === t);
	if (!n) throw Error("Payroll record was not found.");
	return n;
}
var Fo = (e) => !["Cancelled", "Reversed"].includes(e.status);
function Io(e, t, n) {
	return H.runs.some((r) => r.id !== n && Fo(r) && r.slips.some((n) => (e === "timesheets" ? n.timeIds : n.leaveIds).includes(t)));
}
function Lo(e, t) {
	return H[e] = [...H[e].filter((e) => e.id !== t.id), t], structuredClone(t);
}
function Ro(e, t, n) {
	let r = (e?.revision ?? 0) + 1;
	return {
		id: e?.id ?? crypto.randomUUID(),
		revision: r,
		history: [...e?.history ?? [], {
			actorId: Po("payroll.read").userId,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			action: t,
			reason: n,
			revision: r
		}]
	};
}
function zo(e, t) {
	if ((e?.revision ?? 0) !== t) throw Error("Payroll record changed. Reload before editing.");
}
function Bo(e, t, n) {
	let r = jo({
		input: e,
		actorId: Po("payroll.read").userId
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
		actorId: Po("payroll.read").userId,
		entity: t,
		recordId: a.id,
		revision: a.revision
	}), To.parse(H), a;
}
function Vo(e, t, n = !0) {
	let r = P.requireById(e);
	if (r.type !== t || n && !r.active || r.systemRole && (t !== "EXPENSE" || r.systemRole !== "OPERATING_EXPENSE")) throw Error(`Use a dedicated ${t.toLowerCase()} payroll account, not a bank, tax, AR/AP or stock control account.`);
	return r;
}
function Ho(e, t = !0) {
	if (Vo(e.accountId, [
		"Earnings",
		"Allowance",
		"Employer contribution"
	].includes(e.category) ? "EXPENSE" : "LIABILITY", t), e.category === "Employer contribution") Vo(e.liabilityAccountId, "LIABILITY", t);
	else if (e.liabilityAccountId) throw Error("Only employer contributions use a second liability account.");
	if (["Earnings", "Allowance"].includes(e.category) && e.method === "Percentage" || e.category === "Tax" && e.method !== "Fixed") throw Error("Earnings use hourly/fixed values; withholding tax is an explicitly reviewed fixed amount.");
	if (e.method === "Percentage" && e.rate > 100) throw Error("Percentage rates cannot exceed 100.");
}
function Uo(e) {
	let t = U("employees", e);
	if (t.status !== "Active") throw Error("Select an active employee.");
	return t;
}
function Wo(e, t, n = t) {
	if (t < e.startDate || e.endDate && n > e.endDate) throw Error("Dates must be within the employment period.");
}
function Go(e) {
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
function Ko(e) {
	if (e.projectId) {
		let t = Go(e.projectId);
		if (e.project && jo(e.project) !== jo(t)) throw Error("Project changed. Reopen and review the timesheet project.");
	}
	let t = Uo(e.employeeId);
	Wo(t, e.date);
	let n = U("items", e.itemId);
	if (!n.active || n.category !== "Earnings" || t.basis === "Hourly" && n.method !== "Hourly" || t.basis === "Salary" && n.id !== t.earningItemId) throw Error("Select an appropriate employee earnings item.");
	Ho(n);
}
function qo(e, t) {
	if (Wo(Uo(e.employeeId), e.start, e.end), e.start > e.end || e.hours > ((Date.parse(e.end) - Date.parse(e.start)) / 864e5 + 1) * 24) throw Error("Leave dates or hours are invalid.");
	if (H.leave.some((n) => n.id !== t && n.employeeId === e.employeeId && ["Pending", "Approved"].includes(n.status) && n.start <= e.end && n.end >= e.start)) throw Error("Leave request dates overlap.");
}
function Jo() {
	let e = H.settings[0];
	if (!e) throw Error("Configure payroll settings first.");
	Vo(e.netAccountId, "LIABILITY");
	let t = U("items", e.taxItemId);
	if (t.category !== "Tax" || !t.active) throw Error("Select an active fixed withholding item.");
	if (Ho(t), e.netAccountId === t.accountId) throw Error("Net wages and withholding require separate liability accounts.");
	let n = U("items", e.superItemId);
	if (n.category !== "Employer contribution" || n.method !== "Fixed" || !n.active) throw Error("Use an active fixed super contribution item.");
	if (Ho(n), e.currency !== "AUD" || e.currency !== C().currency) throw Error("Payroll currency must match the business currency.");
	return e;
}
function Yo(e, t) {
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
function Xo(e, t) {
	let n = Yo(e, t);
	if (n.annual - n.reservedAnnual < -1e-5 || n.personal - n.reservedPersonal < -1e-5) throw Error("Approved leave exceeds the available recorded hours.");
}
var Zo = () => jo({
	employees: H.employees,
	items: H.items,
	timesheets: H.timesheets,
	leave: H.leave,
	settings: H.settings
});
function Qo(e, t) {
	if (e.start > e.end || e.payDate < e.end) throw Error("Pay date must follow a valid pay period.");
	let n = Jo(), r = /* @__PURE__ */ new Set(), i = [];
	for (let a of e.employeeInputs) {
		if (r.has(a.employeeId)) throw Error("Include each employee only once.");
		r.add(a.employeeId);
		let o = Uo(a.employeeId);
		if (o.startDate > e.end || o.endDate && o.endDate < e.start) throw Error("Employment does not overlap this pay period.");
		if (o.basis === "Salary" && (o.startDate > e.start || o.endDate && o.endDate < e.end) && a.salaryOverride === void 0) throw Error("Partial-period salary requires a reviewed salary override.");
		if (H.runs.some((n) => n.id !== t && Fo(n) && n.start <= e.end && n.end >= e.start && n.slips.some((e) => e.employee.id === o.id))) throw Error("Employee already has an overlapping pay run. Cancel or reverse it before replacing it.");
		let s = U("items", o.earningItemId);
		if (!s.active || s.category !== "Earnings" || s.method !== (o.basis === "Hourly" ? "Hourly" : "Fixed")) throw Error("Employee earning item does not match the pay basis.");
		Ho(s);
		let c = H.timesheets.filter((t) => t.employeeId === o.id && t.status === "Approved" && t.date >= e.start && t.date <= e.end), l = H.leave.filter((t) => t.employeeId === o.id && t.status === "Approved" && t.start <= e.end && t.end >= e.start);
		if (l.some((t) => t.start < e.start || t.end > e.end)) throw Error("Split leave spanning pay periods before including it in payroll.");
		for (let e of c) Ko(e);
		for (let e of l) qo(e, e.id);
		if (c.some((e) => Io("timesheets", e.id, t)) || l.some((e) => Io("leave", e.id, t))) throw Error("Hours or leave are already reserved by another pay run.");
		if (c.some((e) => l.some((t) => e.date >= t.start && e.date <= t.end))) throw Error("Approved timesheet and leave dates overlap; correct them before payroll.");
		if (o.basis === "Salary" && l.some((e) => e.type === "Unpaid") && a.salaryOverride === void 0) throw Error("Salary with unpaid leave requires an explicitly reviewed salary override.");
		if (o.basis === "Hourly" && a.salaryOverride !== void 0) throw Error("Hourly employees cannot use a salary override.");
		let u = [], d = (e, t, n, r) => {
			if (Ho(e), !e.active) throw Error("Inactive pay item.");
			let i = Do(t * n);
			to.parse(i), u.push({
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
		let m = Do(u.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + t.amount, 0));
		if (m <= 0) throw Error("Each employee needs positive gross earnings.");
		for (let e of f.filter((e) => U("items", e.itemId).method === "Percentage")) {
			if (e.quantity !== 1 || e.rate > 100) throw Error("Percentage items require quantity 1 and rate 0–100.");
			d(U("items", e.itemId), 1, Do(m * e.rate / 100), "Adjustment"), u[u.length - 1].quantity = 1, u[u.length - 1].rate = e.rate;
		}
		let h = Do(u.filter((e) => ["Earnings", "Allowance"].includes(e.item.category) && e.item.taxable).reduce((e, t) => e + t.amount, 0)), g = a.withholding;
		if (o.taxScale !== "Manual") {
			if (!o.standardTaxConfirmed) throw Error("Confirm the standard PAYG case or use reviewed manual withholding.");
			if (!o.taxScale.startsWith("4-") && !/^\d{8,9}$/.test(o.taxIdentifier.replace(/\s/g, ""))) throw Error("Record a provided eight- or nine-digit TFN for the selected scale.");
			if (a.withholding !== 0) throw Error("Clear manual withholding for an automatic PAYG employee.");
			g = xa(h, o.taxScale, n.frequency, e.payDate);
		}
		if (g = Do(g + a.additionalWithholding), d(U("items", n.taxItemId), 1, g, o.taxScale === "Manual" ? "Reviewed PAYG" : "ATO 2026–27 scale " + o.taxScale), a.superMethod === "12% reviewed QE" && (e.payDate < "2026-07-01" || e.payDate > "2027-06-30" || a.superBase > m)) throw Error("Reviewed qualifying earnings must not exceed gross and the 12% helper is limited to 2026–27. Use a reviewed super amount for exceptions.");
		let _ = a.superMethod === "12% reviewed QE" ? Do(a.superBase * .12) : a.superAmount;
		d(U("items", n.superItemId), 1, _, a.superMethod === "12% reviewed QE" ? "SG 12% reviewed QE" : "Reviewed SG amount");
		let v = Oo(u), ee = c.some((e) => e.project) ? {
			times: structuredClone(c),
			leaves: structuredClone(l),
			leaveHours: l.reduce((e, t) => e + t.hours, 0),
			costs: Sa(o.basis, c, l.reduce((e, t) => e + t.hours, 0), u)
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
		totals: ko(i),
		settings: structuredClone(n),
		sourceToken: Zo()
	};
}
function $o(e) {
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
function es(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of $o(e).filter((e) => e.credit)) t.set(n.accountId, Do((t.get(n.accountId) ?? 0) + n.credit));
	return [...t].map(([t, n]) => ({
		accountId: t,
		amount: n,
		paid: Do(H.payments.filter((n) => n.runId === e.id && n.accountId === t && n.status === "Posted").reduce((e, t) => e + t.amount, 0))
	}));
}
var ts = {
	balances(e) {
		return Po("payroll.read"), Yo(V.parse(e));
	},
	obligations(e) {
		return Po("payroll.read"), es(U("runs", V.parse(e)));
	},
	setupDefaults(t) {
		Po(), O.require("accounting.post");
		let n = e(Mo).strict().parse(t);
		return Bo(n, "settings", () => {
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
					...Ro(void 0, "Created", n.reason),
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
			return Lo("settings", {
				...Ro(void 0, "Configured", n.reason),
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
		Po();
		let n = e({
			...Mo,
			...No,
			values: ao
		}).strict().parse(t);
		return Bo(n, "employees", () => {
			let e = n.id ? U("employees", n.id) : void 0;
			if (zo(e, n.expectedRevision), H.employees.some((t) => t.id !== e?.id && t.code.toLowerCase() === n.values.code.toLowerCase())) throw Error("Employee code already exists.");
			if (n.values.endDate && n.values.endDate < n.values.startDate) throw Error("Employment end date is before the start date.");
			let t = U("items", n.values.earningItemId);
			if (!t.active || t.category !== "Earnings" || t.method !== (n.values.basis === "Hourly" ? "Hourly" : "Fixed")) throw Error("Select an active earning item matching the pay basis.");
			if (e && H.runs.some((t) => ["Posted", "Reversed"].includes(t.status) && t.slips.some((t) => t.employee.id === e.id)) && (e.annualOpening !== n.values.annualOpening || e.personalOpening !== n.values.personalOpening)) throw Error("Opening leave hours are locked after payroll posting.");
			return Lo("employees", {
				...n.values,
				...Ro(e, e ? "Edited" : "Created", n.reason)
			});
		});
	},
	saveItem(t) {
		Po();
		let n = e({
			...Mo,
			...No,
			values: so
		}).strict().parse(t);
		return Bo(n, "items", () => {
			let e = n.id ? U("items", n.id) : void 0;
			if (zo(e, n.expectedRevision), H.items.some((t) => t.id !== e?.id && t.code.toLowerCase() === n.values.code.toLowerCase())) throw Error("Pay item code already exists.");
			let t = {
				...n.values,
				...Ro(e, e ? "Edited" : "Created", n.reason)
			};
			return Ho(t), Lo("items", t);
		});
	},
	saveSettings(t) {
		Po();
		let n = e({
			...Mo,
			expectedRevision: f().int().nonnegative(),
			values: lo
		}).strict().parse(t);
		return Bo(n, "settings", () => {
			let e = H.settings[0];
			zo(e, n.expectedRevision), Vo(n.values.netAccountId, "LIABILITY");
			let t = U("items", n.values.superItemId);
			if (t.category !== "Employer contribution" || t.method !== "Fixed" || !t.active) throw Error("Select an active fixed super guarantee item.");
			let r = U("items", n.values.taxItemId);
			if (r.category !== "Tax" || !r.active || r.accountId === n.values.netAccountId) throw Error("Use a valid withholding item and a separate net wages account.");
			if (n.values.currency !== "AUD" || n.values.currency !== C().currency) throw Error("Payroll currency must match the business.");
			return Lo("settings", {
				...n.values,
				...Ro(e, "Settings changed", n.reason)
			});
		});
	},
	saveTime(t) {
		Po();
		let n = e({
			...Mo,
			...No,
			values: po
		}).strict().parse(t);
		return Bo(n, "timesheets", () => {
			let e = n.id ? U("timesheets", n.id) : void 0;
			if (zo(e, n.expectedRevision), e && (e.status !== "Draft" || Io("timesheets", e.id))) throw Error("Only an unreserved draft timesheet can be edited.");
			Ko(n.values);
			let t = Uo(n.values.employeeId), r = U("items", n.values.itemId);
			if (H.timesheets.filter((r) => r.id !== e?.id && r.employeeId === t.id && r.date === n.values.date).reduce((e, t) => e + t.hours, 0) + n.values.hours > 24) throw Error("Total timesheet hours cannot exceed 24 for one employee/day.");
			if (H.timesheets.some((i) => i.id !== e?.id && i.employeeId === t.id && i.itemId === r.id && i.date === n.values.date && i.projectId === n.values.projectId)) throw Error("A timesheet already exists for this employee, day and item.");
			return Lo("timesheets", {
				...n.values,
				...n.values.projectId ? { project: Go(n.values.projectId) } : {},
				...Ro(e, e ? "Edited" : "Created", n.reason),
				status: "Draft"
			});
		});
	},
	changeTime(t) {
		let n = e({
			...Mo,
			id: V,
			expectedRevision: f().int().positive(),
			action: T([
				"Submit",
				"Approve",
				"Reopen"
			])
		}).strict().parse(t);
		return Po(n.action === "Approve" ? "payroll.approve" : "payroll.manage"), Bo(n, "timesheets", () => {
			let e = U("timesheets", n.id);
			if (zo(e, n.expectedRevision), Io("timesheets", e.id)) throw Error("Timesheet is reserved by a pay run.");
			if (n.action === "Submit" && e.status !== "Draft" || n.action === "Approve" && e.status !== "Submitted" || n.action === "Reopen" && e.status === "Draft") throw Error("Invalid timesheet transition.");
			return n.action !== "Reopen" && Ko(e), Lo("timesheets", {
				...e,
				...Ro(e, n.action, n.reason),
				status: n.action === "Submit" ? "Submitted" : n.action === "Approve" ? "Approved" : "Draft"
			});
		});
	},
	saveLeave(t) {
		Po();
		let n = e({
			...Mo,
			...No,
			values: ho
		}).strict().parse(t);
		return Bo(n, "leave", () => {
			let e = n.id ? U("leave", n.id) : void 0;
			if (zo(e, n.expectedRevision), e && (e.status !== "Pending" || Io("leave", e.id))) throw Error("Only an unreserved pending leave request can be edited.");
			return qo(n.values, e?.id), Lo("leave", {
				...n.values,
				...Ro(e, e ? "Edited" : "Created", n.reason),
				status: "Pending"
			});
		});
	},
	changeLeave(t) {
		let n = e({
			...Mo,
			id: V,
			expectedRevision: f().int().positive(),
			action: T([
				"Approve",
				"Decline",
				"Cancel",
				"Reopen"
			])
		}).strict().parse(t);
		return Po(n.action === "Approve" || n.action === "Decline" ? "payroll.approve" : "payroll.manage"), Bo(n, "leave", () => {
			let e = U("leave", n.id);
			if (zo(e, n.expectedRevision), Io("leave", e.id)) throw Error("Leave is reserved by a pay run.");
			if (["Approve", "Decline"].includes(n.action) && e.status !== "Pending" || n.action === "Cancel" && ["Cancelled", "Declined"].includes(e.status) || n.action === "Reopen" && !["Cancelled", "Declined"].includes(e.status)) throw Error("Invalid leave transition.");
			(n.action === "Approve" || n.action === "Reopen") && qo(e, e.id);
			let t = Lo("leave", {
				...e,
				...Ro(e, n.action, n.reason),
				status: n.action === "Approve" ? "Approved" : n.action === "Decline" ? "Declined" : n.action === "Cancel" ? "Cancelled" : "Pending"
			});
			return t.status === "Approved" && Xo(e.employeeId), t;
		});
	},
	saveRun(t) {
		Po();
		let n = e({
			...Mo,
			...No,
			values: vo
		}).strict().parse(t);
		return Bo(n, "runs", () => {
			let e = n.id ? U("runs", n.id) : void 0;
			if (zo(e, n.expectedRevision), e && e.status !== "Draft") throw Error("Only a draft pay run can be recalculated.");
			let t = Qo(n.values, e?.id);
			return Lo("runs", {
				...n.values,
				...Ro(e, e ? "Recalculated" : "Created", n.reason),
				...t,
				status: "Draft"
			});
		});
	},
	changeRun(t) {
		let n = e({
			...Mo,
			id: V,
			expectedRevision: f().int().positive(),
			action: T([
				"Approve",
				"Reopen",
				"Cancel",
				"Post",
				"Reverse"
			]),
			date: $a.optional()
		}).strict().parse(t);
		return Po(n.action === "Approve" ? "payroll.approve" : ["Post", "Reverse"].includes(n.action) ? "payroll.post" : "payroll.manage"), Bo(n, "runs", () => {
			let e = U("runs", n.id);
			if (zo(e, n.expectedRevision), n.action === "Approve" || n.action === "Post") {
				if (e.status !== (n.action === "Approve" ? "Draft" : "Approved")) throw Error("Invalid pay-run transition.");
				if (!e.taxReviewed || e.reviewReference.trim().length < 3) throw Error("Confirm reviewed withholding and provide its reference.");
				if (e.sourceToken !== Zo()) throw Error("Payroll sources changed. Reopen and recalculate the run.");
				if (jo(Qo(vo.parse(Object.fromEntries(Object.keys(vo.shape).map((t) => [t, e[t]]))), e.id).slips) !== jo(e.slips)) throw Error("Payroll calculation changed. Recalculate the run.");
			}
			if (n.action === "Approve") return Lo("runs", {
				...e,
				...Ro(e, "Approved", n.reason),
				status: "Approved"
			});
			if (n.action === "Reopen") {
				if (e.status !== "Approved") throw Error("Only an approved run can be reopened.");
				return Lo("runs", {
					...e,
					...Ro(e, "Reopened", n.reason),
					status: "Draft",
					taxReviewed: !1
				});
			}
			if (n.action === "Cancel") {
				if (!["Draft", "Approved"].includes(e.status)) throw Error("Only an unposted run can be cancelled.");
				return Lo("runs", {
					...e,
					...Ro(e, "Cancelled", n.reason),
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
					lines: $o(e)
				}), r = Lo("runs", {
					...e,
					...Ro(e, "Posted", n.reason),
					status: "Posted",
					journalId: t.id
				});
				return e.slips.forEach((e) => Xo(e.employee.id)), r;
			}
			if (e.status !== "Posted" || !n.date || n.date < e.payDate) throw Error("Reverse a posted run on or after its pay date.");
			if (H.payments.some((t) => t.runId === e.id && t.status === "Posted")) throw Error("Reverse recorded payroll payments before reversing the run.");
			let t = F.reverse({
				journalEntryId: e.journalId,
				reversalDate: n.date,
				reason: n.reason
			}), r = Lo("runs", {
				...e,
				...Ro(e, "Reversed", n.reason),
				status: "Reversed",
				reversalJournalId: t.id,
				reversalDate: n.date
			});
			e.slips.forEach((e) => Xo(e.employee.id));
			for (let t of H.filings.filter((t) => t.runId === e.id)) Lo("filings", {
				...t,
				...Ro(t, "Correction needed", n.reason),
				status: "Correction needed"
			});
			return r;
		});
	},
	recordPayment(t) {
		Po("payroll.post"), O.require("banking.write");
		let n = e({
			...Mo,
			runId: V,
			accountId: V,
			bankAccountId: V,
			date: $a,
			amount: to.refine((e) => e > 0),
			reference: E().trim().max(200)
		}).strict().parse(t);
		return Bo(n, "payments", () => {
			M();
			let e = U("runs", n.runId);
			if (e.status !== "Posted" || n.date < e.payDate) throw Error("Record payment against a posted run on or after pay date.");
			let t = es(e).find((e) => e.accountId === n.accountId);
			if (!t || n.amount > Do(t.amount - t.paid)) throw Error("Payment exceeds the outstanding payroll liability.");
			Vo(n.accountId, "LIABILITY");
			let r = I.requireById(n.bankAccountId), i = P.requireById(r.glAccountId);
			if (!r.active || !i.active || i.type !== "ASSET" || r.currency !== e.settings.currency || n.date < r.openingBalanceDate) throw Error("Use an active bank in the payroll currency with a valid posting date.");
			let a = Ro(void 0, "Payment recorded", n.reason), o = F.post({
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
			return Lo("payments", {
				...c,
				...a,
				status: "Posted",
				journalId: o.id
			});
		});
	},
	reversePayment(t) {
		Po("payroll.post"), O.require("banking.write");
		let n = e({
			...Mo,
			id: V,
			expectedRevision: f().int().positive(),
			date: $a
		}).strict().parse(t);
		return Bo(n, "payments", () => {
			M();
			let e = U("payments", n.id);
			if (zo(e, n.expectedRevision), e.status !== "Posted" || n.date < e.date) throw Error("Reverse a posted payment on or after its date.");
			Gn("PAYROLL_PAYMENT", e.id);
			let t = F.reverse({
				journalEntryId: e.journalId,
				reversalDate: n.date,
				reason: n.reason
			});
			return Lo("payments", {
				...e,
				...Ro(e, "Payment reversed", n.reason),
				status: "Reversed",
				reversalJournalId: t.id,
				reversalDate: n.date
			});
		});
	},
	recordFiling(t) {
		Po();
		let n = e({
			...Mo,
			runId: V,
			expectedRevision: f().int().nonnegative(),
			reference: E().trim().max(200),
			notes: E().trim().max(1e3)
		}).strict().parse(t);
		return Bo(n, "filings", () => {
			let e = U("runs", n.runId);
			if (e.status !== "Posted") throw Error("Prepare filing review only for a posted run.");
			let t = H.filings.find((t) => t.runId === e.id);
			return zo(t, n.expectedRevision), Lo("filings", {
				...Ro(t, "Filing review recorded", n.reason),
				runId: e.id,
				runRevision: e.revision,
				reference: n.reference,
				notes: n.notes,
				status: n.reference ? "External reference recorded" : "Prepared"
			});
		});
	},
	exportSlip(t) {
		Po("payroll.read");
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
		Po("payroll.read");
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
			String(Do(e.totals.deductions - e.totals.withholding)),
			String(e.totals.net),
			String(e.totals.employerCost),
			t.reviewReference,
			e.projectAllocation?.costs.map((e) => `${e.project.code} / ${e.project.name} v${e.project.revision}: ${e.amount.toFixed(2)}`).join("; ") ?? "Unallocated"
		])];
		return {
			name: "Payroll-review-" + t.id + ".csv",
			csv: Qa(n)
		};
	}
};
i("payroll", {
	repository: ts,
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
		let n = To.parse(e), r = t, i = r.accounts.accounts, a = r.journals.journalEntries, o = r.bankAccounts.bankAccounts;
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
				t.set(n.accountId, [Do(e[0] + n.debit), Do(e[1] + n.credit)]);
			}
			return [...t].filter(([, e]) => e[0] || e[1]).sort(([e], [t]) => e.localeCompare(t));
		};
		function f(e, t, n, r, i, o, s, c) {
			let l = a.find((t) => t.id === e);
			if (!l || l.sourceType !== t || l.sourceId !== n || l.journalDate !== r || jo(d(l.lines)) !== jo(d(i)) || l.status !== (o ? "REVERSED" : "POSTED")) throw Error("Payroll source journal mismatch.");
			if (o) {
				let e = a.find((e) => e.id === s);
				if (!e || e.reversedJournalEntryId !== l.id || l.reversalJournalEntryId !== e.id || e.journalDate !== c || jo(d(e.lines)) !== jo(d(i.map((e) => ({
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
					if (jo(r.costs) !== jo(Sa(t.employee.basis, r.times, r.leaveHours, t.lines))) throw Error("Payroll project costs differ from frozen hours.");
					if (Fo(e) && (r.times.some((e) => jo(e) !== jo(n.timesheets.find((t) => t.id === e.id))) || r.leaves.some((e) => jo(e) !== jo(n.leave.find((t) => t.id === e.id))) || r.leaveHours !== n.leave.filter((e) => t.leaveIds.includes(e.id)).reduce((e, t) => e + t.hours, 0))) throw Error("Payroll project source changed.");
				} else if (Fo(e) && n.timesheets.some((e) => t.timeIds.includes(e.id) && e.project)) throw Error("Payroll project cost snapshot is missing.");
				let a = Do(t.lines.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + t.amount, 0));
				for (let e of t.lines) {
					c("items", e.item.id), l(e.item.accountId, [
						"Earnings",
						"Allowance",
						"Employer contribution"
					].includes(e.item.category) ? "EXPENSE" : "LIABILITY"), e.item.category === "Employer contribution" && l(e.item.liabilityAccountId, "LIABILITY");
					let t = e.item.method === "Percentage" ? Do(a * e.rate / 100) : Do(e.quantity * e.rate);
					if (e.amount !== t) throw Error("Payroll line calculation mismatch.");
				}
				if (t.employee.taxScale !== "Manual" && (!t.employee.standardTaxConfirmed || i.withholding !== 0)) throw Error("Automatic PAYG declaration mismatch.");
				let o = t.lines.filter((t) => t.item.id === e.settings.superItemId), u = t.lines.filter((e) => e.item.category === "Tax");
				if (o.length !== 1 || o[0].amount !== (i.superMethod === "12% reviewed QE" ? Do(i.superBase * .12) : i.superAmount) || u.length !== 1 || u[0].item.id !== e.settings.taxItemId || new Set(t.timeIds).size !== t.timeIds.length || new Set(t.leaveIds).size !== t.leaveIds.length) throw Error("Payroll tax, super or source snapshot mismatch.");
				let d = Do((t.employee.taxScale === "Manual" ? i.withholding : xa(t.totals.taxable, t.employee.taxScale, e.settings.frequency, e.payDate)) + i.additionalWithholding);
				if (jo(Oo(t.lines)) !== jo(t.totals) || t.totals.withholding !== d) throw Error("Payroll payslip totals mismatch.");
				for (let [n, r] of [["timesheets", t.timeIds], ["leave", t.leaveIds]]) for (let i of r) {
					let r = c(n, i);
					if (r.employeeId !== t.employee.id) throw Error("Payroll hours belong to another employee.");
					if (Fo(e)) {
						if (p.has(i) || r.status !== "Approved") throw Error("Payroll source is reused or unapproved.");
						let a = n === "timesheets" ? r.date : r.start, o = n === "timesheets" ? r.date : r.end;
						if (Wo(t.employee, a, o), a < e.start || o > e.end) throw Error("Payroll source dates are outside the pay period.");
						let s = n === "timesheets" ? "Time:" : "Leave:", c = t.employee.basis === "Hourly" && (n === "timesheets" || r.type !== "Unpaid"), l = t.lines.filter((e) => e.source === s + i);
						if (c ? l.length !== 1 || l[0].quantity !== r.hours || l[0].item.id !== (n === "timesheets" ? r.itemId : t.employee.earningItemId) : l.length !== 0) throw Error("Payroll source hours do not match the frozen payslip.");
						p.add(i);
					}
				}
			}
			if (jo(ko(e.slips)) !== jo(e.totals)) throw Error("Payroll run totals mismatch.");
			if (["Posted", "Reversed"].includes(e.status)) {
				if (!e.taxReviewed || e.reviewReference.trim().length < 3) throw Error("Posted payroll has no withholding review.");
				f(e.journalId, "PAYROLL", e.id, e.payDate, $o(e), e.status === "Reversed", e.reversalJournalId, e.reversalDate);
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
			for (let n of $o(e).filter((e) => e.credit)) t.set(n.accountId, Do((t.get(n.accountId) ?? 0) + n.credit));
			for (let [r, i] of t) if (Do(n.payments.filter((t) => t.runId === e.id && t.accountId === r && t.status === "Posted").reduce((e, t) => e + t.amount, 0)) > i) throw Error("Payroll liabilities are overpaid.");
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
			if (m.add(e.operationId), e.input.operationId !== e.operationId || jo({
				input: e.input,
				actorId: e.actorId
			}) !== e.fingerprint) throw Error("Invalid payroll operation fingerprint.");
			if (c(e.entity, e.recordId).revision < e.revision) throw Error("Invalid payroll operation revision.");
		}
	}
});
//#endregion
//#region electron/security/bankInstructionRepository.ts
var ns = E().trim().min(1).max(200), rs = E().regex(/^[a-f0-9]{64}$/), is = E().trim().min(3).max(2e3), as = T(["SUPPLIER", "PAYROLL"]), os = Me(), ss = (e) => Array.isArray(e) ? e.map(ss) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, ss(e[t])])) : e, cs = (e) => Oe("sha256").update(JSON.stringify(ss(e))).digest("hex"), ls = (e) => Oe("sha256").update(e, "ascii").digest("hex"), us = lt, ds = (e) => [
	"Prepared",
	"Approved",
	"Exported"
].includes(e.status);
function fs(e, t = !1, n = !1) {
	O.require("banking.read"), O.require(e === "PAYROLL" ? n ? "payroll.approve" : t ? "payroll.post" : "payroll.read" : t ? "purchases.payment" : "purchases.read");
}
function ps(e, t, n) {
	let r = (e === "PAYROLL" ? n.payroll.employees : n.suppliers.suppliers).find((e) => e.id === t);
	if (!r) throw Error("Beneficiary source was not found.");
	return {
		entity: r,
		revision: String(e === "PAYROLL" ? r.revision : r.updatedAt)
	};
}
function ms(e, t) {
	let n = t.bankAccounts.bankAccounts.find((t) => t.id === e);
	if (!n?.active || n.currency !== "AUD" || n.accountType === "CREDIT_CARD" || !t.accounts.accounts.some((e) => e.id === n.glAccountId && e.active && e.type === "ASSET")) throw Error("Use an active AUD bank and active bank GL account.");
	return n;
}
function hs(e, t, n, r, i) {
	let a = ms(n, i);
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
		financialToken: cs({
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
function gs(e, n, r, i, a, o = t()) {
	let { entries: s, financialToken: c } = hs(e, n, r, i, o), l = ms(r, o), u = [...us().profiles].reverse().find((e) => e.bankAccountId === r);
	if (!u || u.sourceRevision !== l.updatedAt) throw Error("Review and save the current paying-bank file profile first.");
	ot(i, u.values);
	let d = s.map((t) => {
		let n = [...us().beneficiaries].reverse().find((n) => n.kind === e && n.entityId === t.entityId), r = ps(e, t.entityId, o);
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
	})), p = st(u.values, i, f), m = cs({
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
		sha256: ls(p.text)
	};
}
function _s(e) {
	let t = us().instructions.find((t) => t.id === e);
	if (!t) throw Error("Bank instruction batch was not found.");
	return t;
}
function vs(e, t) {
	if (e.revision !== t) throw Error("Instruction changed. Refresh before continuing.");
}
function ys(e, t, n) {
	return {
		id: ke(),
		action: e,
		reason: t,
		revision: n,
		actorId: O.current().userId,
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function bs(e) {
	return us().instructions = us().instructions.map((t) => t.id === e.id ? e : t), e;
}
function xs(e, t, n) {
	let r = O.current().userId, i = cs({
		input: e,
		actor: r
	}), a = us().receipts.find((t) => t.operationId === e.operationId);
	if (a) {
		if (a.fingerprint !== i || a.actorId !== r) throw Error("Operation ID has different bank-instruction data.");
		return structuredClone(a.result);
	}
	let o = n();
	return us().receipts.push({
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
var Ss = e({
	kind: as,
	sourceId: ns,
	bankAccountId: ns,
	date: ns,
	reference: Ze(18)
}).strict(), Cs = e({
	operationId: ns,
	id: ns,
	expectedRevision: f().int().positive(),
	reason: is
}).strict();
function ws(e) {
	let t = gs(e.kind, e.sourceId, e.bankAccountId, e.date, e.credits[0].reference);
	if (t.sourceToken !== e.sourceToken || t.sha256 !== e.sha256) throw Error("Approved payment sources or bank details changed. Void the old file and prepare a reviewed replacement.");
	return t;
}
var Ts = {
	savePayer(n) {
		O.require("banking.write");
		let r = e({
			operationId: ns,
			expectedRevision: f().int().nonnegative(),
			values: et,
			reason: is
		}).strict().parse(n);
		return xs(r, "SHARED", () => {
			let e = ms(r.values.bankAccountId, t()), n = [...us().profiles].reverse().find((t) => t.bankAccountId === e.id);
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
			return us().profiles.push(i), i;
		});
	},
	saveBeneficiary(n) {
		O.require("banking.write");
		let r = e({
			operationId: ns,
			kind: as,
			entityId: ns,
			expectedRevision: f().int().nonnegative(),
			values: tt,
			reason: is
		}).strict().parse(n);
		return fs(r.kind, !0), r.kind === "PAYROLL" && O.require("payroll.manage"), xs(r, r.kind, () => {
			let e = ps(r.kind, r.entityId, t()), n = [...us().beneficiaries].reverse().find((e) => e.kind === r.kind && e.entityId === r.entityId);
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
			return us().beneficiaries.push(i), i;
		});
	},
	preview(e) {
		let t = Ss.parse(e);
		return fs(t.kind), gs(t.kind, t.sourceId, t.bankAccountId, t.date, t.reference);
	},
	prepare(e) {
		O.require("banking.write");
		let t = Ss.extend({
			operationId: ns,
			expectedSourceToken: rs,
			reason: is
		}).parse(e);
		return fs(t.kind, !0), xs(t, t.kind, () => {
			if (us().instructions.some((e) => ds(e) && (e.sourceId === t.sourceId && e.kind === t.kind || t.kind === "SUPPLIER" && e.kind === "SUPPLIER" && Es(e.sourceId, t.sourceId)))) throw Error("An active instruction already reserves this source or one of its bills. Void or reverse it before replacement.");
			let e = gs(t.kind, t.sourceId, t.bankAccountId, t.date, t.reference);
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
				history: [ys("Prepared", t.reason, 1)]
			};
			return us().instructions.push(n), n;
		});
	},
	approve(e) {
		O.require("accounting.post"), O.require("banking.write");
		let t = Cs.parse(e), n = _s(t.id);
		return fs(n.kind, !1, !0), xs(t, n.kind, () => {
			if (vs(n, t.expectedRevision), n.status !== "Prepared") throw Error("Only a prepared instruction can be approved.");
			if (n.createdBy === O.current().userId) throw Error("A different authorized reviewer must approve the bank file.");
			return M(), ws(n), bs({
				...n,
				status: "Approved",
				approvedBy: O.current().userId,
				revision: n.revision + 1,
				history: [...n.history, ys("Approved", t.reason, n.revision + 1)]
			});
		});
	},
	exportFile(e) {
		O.require("banking.write");
		let t = Cs.extend({ acknowledgeDuplicateRisk: b(!0) }).parse(e), n = _s(t.id);
		return fs(n.kind, !0), xs(t, n.kind, () => {
			if (vs(n, t.expectedRevision), !["Approved", "Exported"].includes(n.status)) throw Error("Only a current approved, unrecorded file can be exported.");
			return ws(n), bs({
				...n,
				status: "Exported",
				revision: n.revision + 1,
				history: [...n.history, ys("Exported", t.reason, n.revision + 1)]
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
		let t = Cs.extend({ confirmedNotExecuted: b(!0) }).parse(e), n = _s(t.id);
		return fs(n.kind, !0), xs(t, n.kind, () => {
			if (vs(n, t.expectedRevision), ![
				"Prepared",
				"Approved",
				"Exported"
			].includes(n.status)) throw Error("Recorded local payments require their normal reversal.");
			return bs({
				...n,
				status: "Voided",
				revision: n.revision + 1,
				history: [...n.history, ys("Voided", t.reason, n.revision + 1)]
			});
		});
	},
	recordLocal(e) {
		O.require("banking.write");
		let n = Cs.extend({
			externalReference: Ze(100),
			confirmedExternalExecution: b(!0)
		}).parse(e), r = _s(n.id);
		return fs(r.kind, !0), xs(n, r.kind, () => {
			if (vs(r, n.expectedRevision), r.status !== "Exported") throw Error("Export and externally verify the approved instruction before local recording.");
			if (M(), rr(r.date), hs(r.kind, r.sourceId, r.bankAccountId, r.date, t()).financialToken !== r.financialToken) throw Error("Outstanding financial sources changed. Review the external result before recording.");
			let e;
			if (r.kind === "SUPPLIER") e = _a.post(r.sourceId).paymentIds;
			else {
				let i = t().payroll.runs.find((e) => e.id === r.sourceId);
				e = [ts.recordPayment({
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
			return bs({
				...r,
				status: "Recorded locally",
				localPaymentIds: e,
				externalReference: n.externalReference,
				revision: r.revision + 1,
				history: [...r.history, ys("Recorded locally", n.reason, r.revision + 1)]
			});
		});
	},
	reverseLocal(e) {
		O.require("banking.write");
		let n = Cs.extend({ date: ns }).parse(e), r = _s(n.id);
		return fs(r.kind, !0), xs(n, r.kind, () => {
			if (vs(r, n.expectedRevision), r.status !== "Recorded locally") throw Error("Only recorded local instruction payments can be reversed.");
			if (M(), r.kind === "SUPPLIER") {
				if (n.date !== r.date) throw Error("Supplier batch reversal uses the original payment date.");
				_a.reverse({
					id: r.sourceId,
					reason: n.reason
				});
			} else for (let e of r.localPaymentIds) {
				let i = t().payroll.payments.find((t) => t.id === e);
				ts.reversePayment({
					operationId: "reverse-bank-instruction:" + r.id + ":" + e,
					reason: n.reason,
					id: e,
					expectedRevision: i.revision,
					date: n.date
				});
			}
			return bs({
				...r,
				status: "Reversed locally",
				revision: r.revision + 1,
				history: [...r.history, ys("Reversed locally", n.reason, r.revision + 1)]
			});
		});
	}
};
function Es(e, n) {
	let r = t().paymentBatches.batches, i = r.find((t) => t.id === e), a = r.find((e) => e.id === n);
	return i && a && i.allocations.some((e) => a.allocations.some((t) => t.supplierBillId === e.supplierBillId));
}
function Ds(e, n, r) {
	let i = t(), a = r[0];
	for (let t of us().instructions.filter((e) => ds(e) || e.status === "Recorded locally")) if (t.kind === "SUPPLIER") {
		let r = i.paymentBatches.batches.find((e) => e.id === t.sourceId);
		if (e === "paymentBatches" && [
			"post",
			"cancel",
			"reverse"
		].includes(n) && (typeof a == "string" ? a : a?.id) === t.sourceId) throw Error("Manage this reserved batch through its bank instruction.");
		if (ds(t) && e === "supplierPayments" && n === "create" && a?.allocations?.some((e) => r.allocations.some((t) => t.supplierBillId === e.supplierBillId))) throw Error("Bills are reserved by an active bank instruction.");
	} else {
		let r = i.payroll.runs.find((e) => e.id === t.sourceId);
		if (e === "payroll" && (n === "recordPayment" && a?.runId === t.sourceId && a.accountId === r.settings.netAccountId || n === "reversePayment" && t.localPaymentIds.includes(a?.id) || n === "changeRun" && a?.id === t.sourceId && a.action === "Reverse")) throw Error("Manage this reserved payroll payment through its bank instruction.");
	}
}
var Os = e({
	id: de(),
	action: ns,
	actorId: ns,
	at: os,
	reason: is,
	revision: f().int().positive()
}).strict(), ks = e({
	id: de(),
	bankAccountId: ns,
	revision: f().int().positive(),
	values: et,
	sourceRevision: ns,
	actorId: ns,
	at: os,
	reason: is
}).strict(), As = e({
	id: de(),
	kind: as,
	entityId: ns,
	revision: f().int().positive(),
	bsb: tt.shape.bsb,
	account: tt.shape.account,
	title: tt.shape.title,
	sourceRevision: ns,
	actorId: ns,
	at: os,
	reason: is
}).strict(), js = e({
	id: de(),
	operationId: ns,
	kind: as,
	sourceId: ns,
	bankAccountId: ns,
	date: ns,
	status: T([
		"Prepared",
		"Approved",
		"Exported",
		"Recorded locally",
		"Voided",
		"Reversed locally"
	]),
	revision: f().int().positive(),
	financialToken: rs,
	sourceToken: rs,
	payer: ks,
	beneficiaries: s(As).min(1).max(500),
	credits: s(nt).min(1).max(500),
	text: E().max(1e5),
	sha256: rs,
	createdBy: ns,
	approvedBy: ns.optional(),
	localPaymentIds: s(ns),
	externalReference: E().max(100).optional(),
	history: s(Os).min(1)
}).strict();
i("bankInstructions", {
	repository: Ts,
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
	snapshot: us,
	restore: ut,
	publish: () => {},
	view: (e) => ({
		profiles: us().profiles,
		beneficiaries: us().beneficiaries.filter((t) => t.kind !== "PAYROLL" || g(e, "payroll.read")),
		instructions: us().instructions.filter((t) => t.kind !== "PAYROLL" || g(e, "payroll.read")),
		receipts: us().receipts.filter((t) => t.input.__kind !== "PAYROLL" || g(e, "payroll.read"))
	}),
	validate: (t, n) => {
		let r = e({
			profiles: s(ks),
			beneficiaries: s(As),
			instructions: s(js),
			receipts: s(e({
				operationId: ns,
				fingerprint: rs,
				actorId: ns,
				input: se(E(), ye()),
				result: ye()
			}).strict())
		}).strict().parse(t), i = n;
		for (let e of r.profiles) if (!i.bankAccounts.bankAccounts.some((t) => t.id === e.bankAccountId) || e.values.bankAccountId !== e.bankAccountId) throw Error("Invalid payer bank reference.");
		for (let e of r.beneficiaries) ps(e.kind, e.entityId, i);
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
			].includes(e.input.__kind) || cs({
				input: t,
				actor: e.actorId
			}) !== e.fingerprint) throw Error("Invalid bank instruction request receipt.");
		}
		for (let e of r.instructions) {
			let t = st(e.payer.values, e.date, e.credits);
			if (e.sourceToken !== cs({
				financialToken: e.financialToken,
				payer: e.payer,
				beneficiaries: e.beneficiaries
			}) || new Set(e.history.map((e) => e.id)).size !== e.history.length || t.text !== e.text || ls(e.text) !== e.sha256 || e.bankAccountId !== e.payer.bankAccountId || !r.profiles.some((t) => t.id === e.payer.id && cs(t) === cs(e.payer)) || e.beneficiaries.length !== e.credits.length || new Set(e.beneficiaries.map((e) => e.entityId)).size !== e.beneficiaries.length) throw Error("Bank instruction bytes or approved profiles are invalid.");
			if (e.credits.forEach((t, n) => {
				let i = e.beneficiaries[n];
				if (i.kind !== e.kind || i.entityId !== t.beneficiaryId || i.account !== t.account || i.bsb !== t.bsb || i.title !== t.title || t.code !== (e.kind === "PAYROLL" ? "53" : "50") || !r.beneficiaries.some((e) => e.id === i.id && cs(e) === cs(i))) throw Error("Bank instruction beneficiary binding is invalid.");
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
				if (!a || cs(a) !== cs(n) || a.actorId !== e.actorId || a.revision !== t.expectedRevision + 1 || a.reason !== t.reason || t.__kind !== (i ? "SHARED" : t.kind) || cs(i ? a.values : {
					bsb: a.bsb,
					account: a.account,
					title: a.title
				}) !== cs(t.values) || !i && (a.kind !== t.kind || a.entityId !== t.entityId)) throw Error("Invalid bank profile receipt binding.");
			} else {
				let i = !!t.expectedSourceToken, a = r.instructions.find((n) => i ? n.operationId === e.operationId : n.id === t.id);
				if (!a || t.__kind !== a.kind) throw Error("Invalid instruction receipt source.");
				let o = i ? 1 : t.expectedRevision + 1, s = a.history.slice(0, o), c = s.at(-1), l = i ? "Prepared" : t.acknowledgeDuplicateRisk ? "Exported" : t.confirmedNotExecuted ? "Voided" : t.confirmedExternalExecution ? "Recorded locally" : t.date ? "Reversed locally" : "Approved";
				if (s.length !== o || c?.action !== l || c.actorId !== e.actorId || c.reason !== t.reason) throw Error("Invalid instruction receipt history.");
				if (l === "Exported") {
					if (cs(n) !== cs({
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
					if (cs(n) !== cs(r) || i && (t.sourceId !== a.sourceId || t.kind !== a.kind || t.bankAccountId !== a.bankAccountId || t.date !== a.date || t.reference !== a.credits[0].reference || t.expectedSourceToken !== a.sourceToken)) throw Error("Invalid instruction result receipt.");
				}
			}
		}
		let a = r.instructions.filter((e) => !["Voided", "Reversed locally"].includes(e.status)), o = a.filter((e) => ds(e));
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
var Ms = e({
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
function Ns(e) {
	let t = s(Ms).min(1).max(20).parse(e.conditions ? JSON.parse(e.conditions) : [{
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
function Ps(e, t) {
	let n = Ns(e);
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
var Fs = (e) => Math.round((e + 2 ** -52) * 100) / 100, Is = (e) => e.lines.length >= 2 && new Set(e.lines.map((e) => e.id)).size === e.lines.length && e.totalDebit > 0 && e.totalDebit === e.totalCredit && e.lines.every((e) => Number.isFinite(e.debit) && Number.isFinite(e.credit) && e.debit >= 0 && e.credit >= 0 && Fs(e.debit) === e.debit && Fs(e.credit) === e.credit && !(e.debit && e.credit)) && Fs(e.lines.reduce((e, t) => e + t.debit, 0)) === e.totalDebit && Fs(e.lines.reduce((e, t) => e + t.credit, 0)) === e.totalCredit, Ls = (e, t = !1) => JSON.stringify(e.lines.map((e) => [
	e.accountId,
	e.description ?? null,
	t ? e.credit : e.debit,
	t ? e.debit : e.credit
]).sort((e, t) => JSON.stringify(e).localeCompare(JSON.stringify(t))));
function Rs(e) {
	let t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), r = [], i = e.filter((e) => e.sourceType === "BANK_STATEMENT" && !e.reversedJournalEntryId && (e.status === "REVERSED" || e.reversalJournalEntryId || e.reversedAt)), a = (e, t, i) => {
		n.add(e.id), t.forEach((e) => n.add(e)), r.push({
			journalId: e.id,
			message: i
		});
	};
	for (let n of i) {
		let r = e.filter((e) => e.id === n.reversalJournalEntryId), i = r[0];
		if (e.filter((e) => e.id === n.id).length !== 1 || r.length !== 1 || n.status !== "REVERSED" || !n.sourceId || !/^.+:\d+$/.test(n.sourceId) || !n.reversalReason?.trim() || !Number.isFinite(Date.parse(n.reversedAt ?? "")) || n.reversedAt !== i.postedAt || i.status !== "POSTED" || i.sourceType !== "BANK_STATEMENT" || i.sourceId !== void 0 || i.reversedJournalEntryId !== n.id || e.filter((e) => e.reversalJournalEntryId === i.id).length !== 1 || i.reversalJournalEntryId || i.reversedAt || n.reference !== i.reference || e.filter((e) => e.reversedJournalEntryId === n.id).length !== 1 || !Is(n) || !Is(i) || n.totalDebit !== i.totalCredit || n.totalCredit !== i.totalDebit || Ls(n, !0) !== Ls(i)) {
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
function zs(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Bs(e, t) {
	w(e, t);
}
function Vs(e, t, n) {
	Bs(e.openingBalanceDate, "Opening balance date"), Bs(n, "As-at date");
	let r = pe(t), i = ae(t), a = Rs(t), o = new Set([
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
	}), c = zs(e.openingBalance), l = 0, u = 0, d = s.map(({ entry: t, line: n }) => {
		let r = zs(n.debit), s = zs(n.credit);
		return l = zs(l + r), u = zs(u + s), c = zs(c + r - s), {
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
		openingBalance: zs(e.openingBalance),
		moneyIn: l,
		moneyOut: u,
		closingBalance: c,
		transactionCount: d.length,
		transactions: d
	};
}
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function Hs(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Us(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) if (!t.correctionOnly) {
		if (r.has(t.id)) {
			i = Hs(i + t.moneyIn), a = Hs(a + t.moneyOut);
			continue;
		}
		o = Hs(o + t.moneyIn), s = Hs(s + t.moneyOut);
	}
	let c = Hs(Hs(t) + o - s), l = Hs(e.closingBalance), u = Hs(c - l);
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
var Ws = (e) => new Set(e).size === e.length, Gs = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Ks(e, t, n, r) {
	return e.some((e) => e.bankAccountId === t && e.status === "COMPLETED" && e.statementDate < r && e.clearedTransactionIds.includes(n));
}
function qs(e) {
	let { bank: t, journals: n, reconciliations: r, throughDate: i } = e, a = [];
	if (w(i, "Reconciliation proof date"), w(t.openingBalanceDate, "Bank opening date"), !Ws(r.map((e) => e.id)) || !Ws(n.map((e) => e.id)) || !Ws(n.flatMap((e) => e.lines.map((t) => e.id + ":" + t.id)))) return ["Duplicate reconciliation or ledger row identity."];
	for (let e of r.filter((e) => e.bankAccountId === t.id)) try {
		w(e.statementDate);
	} catch {
		return ["Reconciliation statement date is invalid."];
	}
	let o = ae(n);
	n.some((e) => o.has(e.id) && e.journalDate >= t.openingBalanceDate && e.journalDate <= i && e.lines.some((e) => e.accountId === t.glAccountId)) && a.push("Bank journal reversal has incomplete or inconsistent owner, lifecycle or amount evidence.");
	let s = Rs(n);
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
		if (e.status !== "COMPLETED" || e.statementDate <= d || e.statementDate < t.openingBalanceDate || !Number.isFinite(e.statementBalance) || Gs(e.statementBalance) !== e.statementBalance || !Ws(e.clearedTransactionIds)) return ["Reconciliation sequence, status, balance or cleared identities are invalid."];
		let r = Vs(t, n, e.statementDate), i = new Map(r.transactions.map((e) => [e.id, e])), o = /* @__PURE__ */ new Set(), c = new Set(e.clearedTransactionIds);
		for (let e of n.filter((e) => s.verifiedIds.has(e.id) && e.reversalJournalEntryId)) {
			let t = r.transactions.filter((t) => t.journalEntryId === e.id || t.journalEntryId === e.reversalJournalEntryId);
			t.length && t.every((e) => c.has(e.id)) && t.forEach((e) => o.add(e.id));
		}
		if (e.clearedTransactionIds.some((t) => {
			let r = i.get(t);
			return l.has(t) || !r || r.correctionIssue || !o.has(t) && (r.correctionOnly || !ce(u.get(r.journalEntryId), n, e.statementDate));
		})) return ["Cleared rows are missing, reversed, internal offsets or duplicated across statements."];
		e.clearedTransactionIds.forEach((e) => l.add(e));
		let f = Us(r, e.statementBalance, [...l]), p = (t) => t.reconciled && [
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
		!p(f) && !p(Us(m, e.statementBalance, [...l])) && a.push("Saved reconciliation totals do not match the current dated bank ledger: " + e.reconciliationNumber), d = e.statementDate;
	}
	if (!c.length) return a;
	let f = c.at(-1).statementDate, p = Vs(t, n, f), m = new Map(p.transactions.map((e) => [e.id, e])), h = /* @__PURE__ */ new Set();
	for (let i of (e.statements ?? []).filter((e) => e.bankAccountId === t.id && e.date <= f)) i.status === "UNMATCHED" && a.push("Imported statement contains an unresolved line."), (i.status === "MATCHED" || i.status === "POSTED") && (i.ledgerIds.some((e) => Ks(r, t.id, e, i.date)) && a.push("Imported statement match reuses a ledger row already cleared in an earlier statement."), (!i.ledgerIds.length || !Ws(i.ledgerIds) || i.ledgerIds.some((e) => {
		let t = m.get(e);
		return !l.has(e) || !t || t.correctionOnly || t.correctionIssue || !ce(u.get(t.journalEntryId), n, i.date) || h.has(e);
	}) || Gs(i.ledgerIds.reduce((e, t) => e + (m.get(t)?.moneyIn ?? 0) - (m.get(t)?.moneyOut ?? 0), 0)) !== i.amount) && a.push("Imported statement match, amount or clearing is inconsistent."), i.ledgerIds.forEach((e) => h.add(e)));
	return a;
}
//#endregion
//#region src/features/banking/data/bankReconciliationRepository.ts
var Js = /* @__PURE__ */ new Set(), Ys = k.read().reconciliations;
k.onRollback(() => {
	Ys = k.read().reconciliations;
});
function Xs() {
	k.update("reconciliations", Ys), Js.forEach((e) => k.notify(e));
}
function Zs(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Qs(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function $s() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function ec(e) {
	return `BREC-${e.slice(0, 4)}-${String(Ys.length + 1).padStart(4, "0")}`;
}
function tc(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of Ys) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var nc = {
	subscribe(e) {
		return Js.add(e), () => {
			Js.delete(e);
		};
	},
	getSnapshot() {
		return Ys;
	},
	getAll() {
		return Ys;
	},
	getByBankAccount(e) {
		return Ys.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return tc(e);
	},
	complete(e, n) {
		if (Qs(e.statementDate), w(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let r = I.requireById(e.bankAccountId);
		if (!r.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < r.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let i = F.getAll(), a = new Map(i.map((e) => [e.id, e])), o = qs({
			bank: r,
			journals: i,
			reconciliations: Ys,
			throughDate: e.statementDate
		});
		if (o.length) throw Error("Existing bank reconciliation evidence is invalid: " + o.join(" "));
		let s = this.getLatestByBankAccount(r.id);
		if (s && e.statementDate <= s.statementDate) throw Error(`Statement date must be after the last reconciled date ${s.statementDate}.`);
		let c = Vs(r, F.getAll(), e.statementDate), l = new Set(c.transactions.filter((t) => !t.correctionOnly && !t.correctionIssue && ce(a.get(t.journalEntryId), i, e.statementDate)).map((e) => e.id)), u = tc(r.id), d = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !u.has(e));
		for (let e of d) if (!l.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let f = /* @__PURE__ */ new Set([...u, ...d]), p = t().bankStatements?.lines.filter((t) => t.bankAccountId === r.id && t.date <= e.statementDate) ?? [];
		if (p.some((e) => e.status === "UNMATCHED")) throw Error("Process every imported statement line before completing reconciliation.");
		let m = new Map(c.transactions.map((e) => [e.id, e]));
		for (let e of p.filter((e) => e.status === "MATCHED" || e.status === "POSTED")) {
			if (e.ledgerIds.some((t) => Ks(Ys, r.id, t, e.date))) throw Error("Statement match reuses a ledger row already cleared in an earlier statement. Unmatch this unreconciled line and select its genuine source.");
			if (e.ledgerIds.some((t) => !m.has(t) || m.get(t)?.correctionOnly || m.get(t)?.correctionIssue || !ce(a.get(m.get(t).journalEntryId), i, e.date))) throw Error("Repair stale imported statement matches before completing reconciliation.");
			if (e.ledgerIds.some((e) => !f.has(e))) throw Error("Include every processed imported statement entry in reconciliation.");
		}
		let h = Us(c, Zs(e.statementBalance), Array.from(f));
		if (!h.reconciled) throw Error(`Bank reconciliation is out by ${h.difference.toFixed(2)}.`);
		let g = $s();
		if (n) {
			if (A.begin(n, "BANK_RECONCILIATION", JSON.stringify(e)).status !== "started") throw Error("Bank reconciliation requires manual review before retry.");
			A.bindResult(n, g);
		}
		let _ = {
			id: g,
			reconciliationNumber: ec(e.statementDate),
			bankAccountId: r.id,
			statementDate: e.statementDate,
			statementBalance: Zs(e.statementBalance),
			bookBalance: h.bookBalance,
			outstandingDeposits: h.outstandingDeposits,
			outstandingPayments: h.outstandingPayments,
			adjustedStatementBalance: h.adjustedStatementBalance,
			difference: h.difference,
			clearedTransactionIds: d,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ys = [_, ...Ys], Xs(), _;
	}
}, rc = nc.complete;
nc.complete = function(e, t) {
	let n = t?.trim() ?? `bankrec-operation-${$s()}`;
	if (t !== void 0 && !n) throw Error("Operation ID cannot be empty.");
	if (n) {
		let t = A.list().find((e) => e.operationId === n);
		if (t) {
			if (t.kind !== "BANK_RECONCILIATION" || t.fingerprint !== JSON.stringify(e)) throw Error("Operation ID reused with different business data.");
			let n = Ys.find((e) => e.id === t.resultId);
			if (t.state === "COMPLETED" && n && Ys.filter((e) => e.id === n.id).length === 1 && n.status === "COMPLETED" && n.bankAccountId === e.bankAccountId && n.statementDate === e.statementDate && n.statementBalance === Zs(e.statementBalance)) return n;
			throw Error("Bank reconciliation requires manual review before retry.");
		}
	}
	M();
	try {
		let t = k.transaction(() => rc.call(nc, e, n));
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
	repository: nc,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: Ys }),
	restore: (e) => {
		Ys = e.reconciliations;
	},
	publish: () => Js.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/pricingInstant.ts
function ic(e, t) {
	let n = new Intl.DateTimeFormat("en-CA", {
		timeZone: t,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(new Date(e)), r = (e) => n.find((t) => t.type === e).value;
	return `${r("year")}-${r("month")}-${r("day")}`;
}
function ac(e) {
	let t = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/.exec(e);
	if (!t || Number(t[2]) > 23 || Number(t[3]) > 59 || Number(t[4]) > 59 || !Number.isFinite(Date.parse(e))) throw Error("Pricing time must be an ISO timestamp with seconds and an explicit UTC offset.");
	if (w(t[1], "Pricing date"), t[6] !== "Z" && (Number(t[6].slice(1, 3)) > 14 || Number(t[6].slice(4)) > 59 || Number(t[6].slice(1, 3)) === 14 && Number(t[6].slice(4)) !== 0)) throw Error("Invalid pricing UTC offset.");
	return new Date(e).toISOString();
}
function oc(e, t, n = C().timezone, r = (/* @__PURE__ */ new Date()).toISOString()) {
	if (w(e, "Document date"), ic(r, n), t === void 0) {
		if (ic(r, n) === e) t = r;
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
	let i = ac(t);
	if (ic(i, n) !== e) throw Error("Pricing time must fall on the document date in the pricing timezone.");
	return {
		pricingAt: i,
		pricingTimezone: n
	};
}
function sc(e, t) {
	if (e.pricingAt === void 0 && e.pricingTimezone === void 0) return;
	if (!e.pricingAt || !e.pricingTimezone) throw Error("Incomplete pricing time snapshot.");
	let n = ic(ac(e.pricingAt), e.pricingTimezone);
	if (t && n !== t) throw Error("Pricing snapshot date does not match the document.");
}
//#endregion
//#region src/features/sales/data/areaPacks.ts
function cc(e, t) {
	let n = tn(e), r = n?.units.find((e) => e.id === t), i = n?.units.find((e) => e.id === n.baseUnitId);
	return n?.status === "ACTIVE" && n.itemType !== "SERVICE" && r?.active && i?.code === "M2" && ["BOX", "ROLL"].includes(r.code) && Number.isFinite(r.conversionToBase) && r.conversionToBase > 0 ? r.conversionToBase : void 0;
}
function lc(e, t, n, r) {
	if (r === void 0) return { quantity: n };
	let i = cc(e, t);
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
function uc(e) {
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
var dc = [
	"Flooring Retailer",
	"Builder",
	"Developer",
	"Designer",
	"Architect",
	"Installer",
	"Other"
], fc = [
	"ACTIVE",
	"ON_HOLD",
	"INACTIVE"
], pc = E().trim().refine((e) => e === "" || E().email().safeParse(e).success, { message: "Enter a valid email address" }), mc = E().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), hc = e({
	businessName: E().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: E().trim().max(120, "Trading name is too long"),
	abn: mc,
	businessType: T(dc),
	status: T(fc),
	email: pc,
	phone: E().trim().max(40, "Phone number is too long"),
	website: E().trim().max(200, "Website is too long"),
	creditLimit: f({ message: "Credit limit is required" }).min(0, "Credit limit cannot be negative"),
	paymentTermsDays: f({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days")
}), gc = e({
	name: E().trim().min(1, "Location name is required").max(100, "Location name is too long"),
	addressLine1: E().trim().min(1, "Address is required").max(160, "Address is too long"),
	addressLine2: E().trim().max(160, "Address is too long"),
	suburb: E().trim().min(1, "Suburb is required").max(100, "Suburb is too long"),
	state: E().trim().min(1, "State is required").max(50, "State is too long"),
	postcode: E().trim().min(1, "Postcode is required").max(20, "Postcode is too long"),
	country: E().trim().min(1, "Country is required").max(100, "Country is too long"),
	phone: E().trim().max(40, "Phone number is too long"),
	isPrimary: y()
}), _c = e({
	isAccounting: y().optional(),
	firstName: E().trim().min(1, "First name is required").max(80, "First name is too long"),
	lastName: E().trim().min(1, "Last name is required").max(80, "Last name is too long"),
	jobTitle: E().trim().max(100, "Job title is too long"),
	email: E().trim().min(1, "Email is required").email("Enter a valid email address"),
	phone: E().trim().max(40, "Phone number is too long"),
	mobile: E().trim().max(40, "Mobile number is too long"),
	locationId: E(),
	isPrimary: y()
}), vc = [
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
], yc = "htt.mock.contacts.customers.v1";
function bc(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var xc = yt(yc, bc), Sc = xc.status !== "invalid" && xt(yc), Cc = /* @__PURE__ */ new Set(), wc = xc.status === "ok" ? xc.data : structuredClone(vc);
function Tc() {
	Sc && bt(yc, wc), Cc.forEach((e) => {
		e();
	});
}
function Ec(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Dc() {
	let e = wc.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function Oc(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function kc(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function Ac(e, t) {
	let n = !1;
	if (wc = wc.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	Tc();
}
var W = {
	subscribe(e) {
		return Cc.add(e), () => {
			Cc.delete(e);
		};
	},
	getSnapshot() {
		return wc;
	},
	getAll() {
		return wc;
	},
	getById(e) {
		return wc.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: Ec("cus"),
			code: Dc(),
			businessName: e.businessName.trim(),
			tradingName: Oc(e.tradingName),
			abn: kc(e.abn),
			businessType: e.businessType,
			status: e.status,
			email: Oc(e.email),
			phone: Oc(e.phone),
			website: Oc(e.website),
			creditLimit: e.creditLimit,
			currentBalance: 0,
			overdueBalance: 0,
			paymentTermsDays: e.paymentTermsDays,
			locations: [],
			contacts: [],
			createdAt: t,
			updatedAt: t
		};
		return wc = [n, ...wc], Tc(), n;
	},
	update(e, t) {
		let n;
		if (Ac(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: Oc(t.tradingName),
			abn: kc(t.abn),
			businessType: t.businessType,
			status: t.status,
			email: Oc(t.email),
			phone: Oc(t.phone),
			website: Oc(t.website),
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
			id: Ec("loc"),
			name: t.name.trim(),
			addressLine1: t.addressLine1.trim(),
			addressLine2: Oc(t.addressLine2),
			suburb: t.suburb.trim(),
			state: t.state.trim(),
			postcode: t.postcode.trim(),
			country: t.country.trim(),
			phone: Oc(t.phone),
			isPrimary: r
		};
		return Ac(e, (e) => ({
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
			addressLine2: Oc(n.addressLine2),
			suburb: n.suburb.trim(),
			state: n.state.trim(),
			postcode: n.postcode.trim(),
			country: n.country.trim(),
			phone: Oc(n.phone),
			isPrimary: a
		};
		return Ac(e, (e) => ({
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
		t = _c.parse(t);
		let n = W.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: Ec("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: Oc(t.jobTitle),
			email: t.email.trim(),
			phone: Oc(t.phone),
			mobile: Oc(t.mobile),
			locationId: Oc(t.locationId),
			isPrimary: r,
			isAccounting: t.isAccounting ?? !1
		};
		return Ac(e, (e) => ({
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
		n = _c.parse(n);
		let r = W.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		if (n.locationId && !r.locations.some((e) => e.id === n.locationId)) throw Error("The selected location does not belong to this customer");
		let i = r.contacts.find((e) => e.id === t);
		if (!i) throw Error(`Contact ${t} was not found`);
		let a = n.isPrimary || r.contacts.length === 1, o = {
			...i,
			firstName: n.firstName.trim(),
			lastName: n.lastName.trim(),
			jobTitle: Oc(n.jobTitle),
			email: n.email.trim(),
			phone: Oc(n.phone),
			mobile: Oc(n.mobile),
			locationId: Oc(n.locationId),
			isPrimary: a,
			isAccounting: n.isAccounting ?? !1
		};
		return Ac(e, (e) => ({
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
	snapshot: () => ({ customers: wc }),
	restore: (e) => {
		wc = e.customers;
	},
	publish: () => Cc.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesRecipients.ts
function jc(e, t) {
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
function Mc(e) {
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
var Nc = "htt.mock.sales.quotes.v1", Pc = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function Fc(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !Pc.has(String(t.status)) || ![
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
function Ic() {
	return yt(Nc, Fc);
}
function Lc(e) {
	if (Ic().status === "invalid" || !xt("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!bt("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var Rc = "htt.mock.sales.quote-orders.v1";
function zc(e) {
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
function Bc(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!Fc(t.quotes) || !zc(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function Vc() {
	return yt(Rc, Bc);
}
function Hc(e) {
	if (!Bc(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = Vc(), n = Ic();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !xt("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!bt("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var Uc = "htt.mock.sales.documents.v1";
function Wc(e) {
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
function Gc(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!Bc(t) || !Wc(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function Kc() {
	return yt(Uc, Gc);
}
function qc(e) {
	if (!Gc(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = Kc();
	if (t.status === "invalid" || t.status === "unavailable" || !xt("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!bt("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var Jc = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Yc(e) {
	let t = e.filter((e) => Jc.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function Xc() {
	Yc(A.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var Zc = [{
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
}], Qc = [{
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
}], $c = [{
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
}], el = "htt.mock.sales.credit-notes.v1", tl = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, nl = (e) => typeof e == "string" && e.length > 0;
function rl(e) {
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
		].every((e) => nl(t[e])) || ![
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
		].every((e) => tl(i[e])) || !tl(t.amountApplied) || !tl(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => nl(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !tl(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		if (Math.abs(t - e.amountApplied) > .011) return !1;
		let n = e.refundEvents ?? [];
		if (!Array.isArray(n) || n.some((e) => !e || !nl(e.id) || !nl(e.date) || !tl(e.amount) || e.amount <= 0 || e.reversalDate !== void 0 && !nl(e.reversalDate)) || new Set(n.map((e) => e.id)).size !== n.length) return !1;
		let r = n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0);
		return !tl(e.amountRefunded ?? 0) || Math.abs(r - (e.amountRefunded ?? 0)) > .011 || t + r > e.totals.total + .011 ? !1 : e.status === "VOID" ? t === 0 && r === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t - r)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function il() {
	return yt(el, rl);
}
function al(e) {
	if (!rl(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = il();
	if (t.status === "invalid" || t.status === "unavailable" || !xt("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!bt("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var ol = /* @__PURE__ */ new Set(), sl = il(), cl = sl.status === "ok" ? structuredClone(sl.data.creditNotes) : [], ll = sl.status === "ok" ? structuredClone(sl.data.allocations) : [], ul = [...cl], dl = [...ll];
function fl() {
	ul = [...cl], dl = [...ll], ol.forEach((e) => e());
}
function pl(e, t) {
	al({
		creditNotes: e,
		allocations: t
	}), cl = e, ll = t, fl();
}
var G = {
	subscribe(e) {
		return ol.add(e), () => {
			ol.delete(e);
		};
	},
	getSnapshot() {
		return ul;
	},
	getAllocationSnapshot() {
		return dl;
	},
	getAll() {
		return ul;
	},
	getAllAllocations() {
		return dl;
	},
	getById(e) {
		return cl.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return cl.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return cl.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return ll.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return ll.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if (cl.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return pl([e, ...cl], ll), e;
	},
	update(e) {
		if (!cl.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return pl(cl.map((t) => t.id === e.id ? e : t), ll), e;
	},
	createAllocation(e) {
		if (ll.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return pl(cl, [e, ...ll]), e;
	},
	updateAllocation(e) {
		if (!ll.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return pl(cl, ll.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!cl.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = ll.some((t) => t.id === e.id) ? ll.map((t) => t.id === e.id ? e : t) : [e, ...ll];
		pl(cl.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return ll.find((t) => t.id === e);
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
			Mc(n.recipient);
			for (let e of n.lines) uc(e), $t(e, t.products.products.find((t) => t.id === e.productId));
		}
	},
	snapshot: () => ({
		creditNotes: cl,
		allocations: ll
	}),
	restore: (e) => {
		cl = e.creditNotes, ll = e.allocations, ul = [...cl], dl = [...ll];
	},
	publish: () => ol.forEach((e) => e())
});
function ml(e, t) {
	pl(cl.map((n) => n.id === e ? {
		...n,
		...t
	} : n), ll);
}
//#endregion
//#region src/features/contacts/data/customerPricingStorage.ts
var hl = "htt.mock.contacts.customerPricing.v1";
function gl(e) {
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
function _l() {
	return yt(hl, gl);
}
function vl(e) {
	if (_l().status === "invalid" || !xt("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!bt("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var yl = [
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
], bl = /* @__PURE__ */ new Set(), xl = _l(), Sl = xl.status === "ok" ? xl.data : structuredClone(yl);
function Cl() {
	bl.forEach((e) => {
		e();
	});
}
function wl(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Tl(e) {
	return e.trim() || void 0;
}
function El(e, t) {
	let n = tn(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = n.units.find((e) => e.id === t);
	if (!r) throw Error(`Unit ${t} does not belong to product ${e}`);
	if (!r.active) throw Error("The selected product unit is inactive");
	return {
		product: n,
		unit: r
	};
}
function Dl(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function Ol({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = Sl.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : Dl(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = Nl(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function kl(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function Al(e) {
	let t = nn(e.productId, e.unitId);
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
var jl = {
	subscribe(e) {
		return bl.add(e), () => {
			bl.delete(e);
		};
	},
	getSnapshot() {
		return Sl;
	},
	getAll() {
		return Sl;
	},
	getById(e) {
		return Sl.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Sl.filter((t) => t.customerId === e);
	},
	create(e, t) {
		El(t.productId, t.unitId);
		let n = Tl(t.effectiveTo);
		t.active && Ol({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = kl(t), a = {
			id: wl("cprice"),
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
		}, o = [a, ...Sl];
		return vl(o), Sl = o, Cl(), a;
	},
	update(e, t) {
		let n = jl.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		El(t.productId, t.unitId);
		let r = Tl(t.effectiveTo);
		t.active && Ol({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = kl(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = Sl.map((t) => t.id === e ? a : t);
		return vl(o), Sl = o, Cl(), a;
	},
	resolve(e) {
		return Al(e);
	},
	resolvePrice(e, t, n, r, i = r) {
		let a = jl.resolveBasePrice(e, t, n, r.slice(0, 10)), o = m({
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
		let { unit: i } = El(t, n), a = Sl.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && Ml(r, i.effectiveFrom, i.effectiveTo));
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
		let o = Al(a);
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
function Ml(e, t, n) {
	return !(e < t || n && e > n);
}
function Nl(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
i("customerPrices", {
	repository: jl,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: Sl }),
	restore: (e) => {
		Sl = e.customerPrices;
	},
	publish: () => bl.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
function Pl(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Fl({ quantity: e, standardUnitPrice: t, unitPrice: n, taxRate: r = ue(), inclusiveLineTotal: i }) {
	let a = Pl(e * n), o = Pl(i === void 0 ? a * r : i - a), s = Pl(a + o), c = Pl(t - n);
	return {
		discountAmount: c,
		discountPercent: t > 0 ? Pl(c / t * 100) : 0,
		lineSubtotal: a,
		taxAmount: o,
		lineTotal: s
	};
}
function Il(e) {
	let t = Pl(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Pl(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: Pl(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function Ll({ customerId: e, documentDate: t, draft: n, pricingAt: i, pricingContext: a }) {
	if (n.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let o = tn(n.productId);
	if (!o) throw Error(`Product ${n.productId} was not found`);
	if (o.status !== "ACTIVE") throw Error(`${o.name} is inactive`);
	let s = nn(n.productId, n.unitId);
	if (!s) throw Error(`Unit ${n.unitId} was not found for ${o.name}`);
	let c = a ?? oc(t, i), l = jl.resolvePrice(e, n.productId, n.unitId, t, c.pricingAt), u = n.unitPrice !== void 0, d = u ? n.unitPrice : l.effectivePrice;
	if (!Number.isFinite(d) || d < 0) throw Error("Unit price cannot be negative");
	let f = lc(n.productId, n.unitId, n.quantity, n.requestedArea);
	if (rn(n.productId, n.unitId, f.quantity, "sell"), o.sellEnabled === !1) throw Error("Product is not available for selling.");
	let p = o.taxCode ?? C().gstCode, m = ue(p), h = u ? De(d, m, n.priceBasis) : d, g = Fl({
		taxRate: m,
		inclusiveLineTotal: u && (n.priceBasis ?? C().basis) === "Inclusive" ? Math.round(f.quantity * d * 100) / 100 : void 0,
		quantity: f.quantity,
		standardUnitPrice: l.basePrice,
		unitPrice: h
	});
	return {
		id: Rl("line"),
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
function Rl(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var zl = /* @__PURE__ */ new Set(), Bl = k.read().payments;
function Vl() {
	zl.forEach((e) => e());
}
function Hl() {
	return `payment_${crypto.randomUUID()}`;
}
function Ul() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Bl.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var Wl = {
	subscribe(e) {
		return zl.add(e), () => {
			zl.delete(e);
		};
	},
	getSnapshot() {
		return Bl;
	},
	getAll() {
		return Bl;
	},
	getById(e) {
		return Bl.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Bl.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Bl.filter((t) => t.invoiceId === e);
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
		if (Kl(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = A.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: Kl(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: Gl(e.reference),
				notes: Gl(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = Bl.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Hl(),
			paymentNumber: Ul(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: Kl(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: Gl(e.reference),
			notes: Gl(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && A.bindResult(n, i.id);
		let a = [i, ...Bl];
		if (k.update("payments", a), Bl = a, n && !e.deferOperationCompletion) try {
			A.complete(n, i.id);
		} catch (e) {
			try {
				A.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return Vl(), i;
	},
	recordDepositSettlement(e) {
		if (w(e.paymentDate), !e.depositId || !e.applicationId || !Number.isFinite(e.amount) || e.amount <= 0) throw Error("Invalid deposit application payment.");
		if (Bl.some((t) => t.id === e.id || t.depositApplicationId === e.applicationId)) throw Error("Deposit application payment already exists.");
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: e.id,
			paymentNumber: Ul(),
			depositId: e.depositId,
			depositApplicationId: e.applicationId,
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			bankAccountId: e.bankAccountId,
			amount: Kl(e.amount),
			reference: e.reference,
			method: "OTHER",
			notes: "Deposit applied to invoice; no new bank receipt.",
			status: "RECEIVED",
			createdAt: t,
			updatedAt: t
		}, r = [n, ...Bl];
		return k.update("payments", r), Bl = r, Vl(), n;
	},
	reverseDepositSettlement(e, t, n) {
		w(t);
		let r = Bl.find((t) => t.id === e);
		if (!r?.depositApplicationId || r.status !== "RECEIVED" || t < r.paymentDate || n.trim().length < 3) throw Error("Invalid deposit settlement reversal.");
		let i = {
			...r,
			status: "REVERSED",
			reversedAt: t,
			reversalReason: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, a = Bl.map((t) => t.id === e ? i : t);
		return k.update("payments", a), Bl = a, Vl(), i;
	},
	reverse(e, t) {
		let n = Bl.find((t) => t.id === e);
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
		}, o = Bl.map((t) => t.id === e ? a : t);
		return k.update("payments", o), Bl = o, Vl(), a;
	},
	getReceivedByInvoice(e) {
		return Bl.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function Gl(e) {
	return e?.trim() || void 0;
}
function Kl(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
i("customerPayments", {
	repository: Wl,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null,
		recordDepositSettlement: null,
		reverseDepositSettlement: null
	},
	snapshot: () => ({ payments: Bl }),
	restore: (e) => {
		Bl = e.payments;
	},
	publish: () => zl.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/salesAccountingPostingService.ts
function ql(e) {
	return P.requireBySystemRole(e).id;
}
function Jl(e) {
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
function Yl(e, t) {
	return F.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Xl(e, t) {
	let n = Yl(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Zl = {
	postInvoice(e) {
		return Yl("CUSTOMER_INVOICE", e.id) || F.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: ql("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: ql("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				...Wn(e.lines, "collected", !1, e.totals.taxAmount)
			]
		});
	},
	reverseInvoice(e) {
		let t = Xl("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Jl(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = Yl("CUSTOMER_PAYMENT", e.id);
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
				accountId: ql("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = Xl("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Jl(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return Yl("CREDIT_NOTE", e.id) || F.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: ql("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				...Wn(e.lines, "collected", !0, e.totals.taxAmount),
				{
					accountId: ql("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = Xl("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Jl(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, Ql = /* @__PURE__ */ new Set(), $l = Kc(), eu = Vc(), tu = Ic(), nu = $l.status === "ok" ? structuredClone($l.data.quotes) : eu.status === "ok" ? structuredClone(eu.data.quotes) : tu.status === "ok" ? structuredClone(tu.data) : structuredClone(Zc);
function ru(e) {
	$l.status === "ok" || Kc().status !== "empty" ? qc({
		quotes: e,
		salesOrders: iu,
		invoices: au
	}) : eu.status === "ok" || Vc().status !== "empty" ? Hc({
		quotes: e,
		salesOrders: iu
	}) : Lc(e), nu = e, lu();
}
var iu = $l.status === "ok" ? structuredClone($l.data.salesOrders) : eu.status === "ok" ? structuredClone(eu.data.salesOrders) : structuredClone(Qc), au = $l.status === "ok" ? structuredClone($l.data.invoices) : structuredClone($c);
function ou(e) {
	qc({
		quotes: nu,
		salesOrders: iu,
		invoices: e
	}), au = e, lu();
}
function su(e, t = nu) {
	$l.status === "ok" || Kc().status !== "empty" ? qc({
		quotes: t,
		salesOrders: e,
		invoices: au
	}) : Hc({
		quotes: t,
		salesOrders: e
	}), iu = e, nu = t, lu();
}
var cu = uu();
function lu() {
	cu = uu(), Ql.forEach((e) => e());
}
function uu() {
	return [
		...nu,
		...iu,
		...au
	];
}
var K = {
	createManagedOrder(e) {
		let t = iu.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: pu("order"),
			managedDraftId: e.draftId,
			type: "SALES_ORDER",
			status: "CONFIRMED",
			documentNumber: mu("SO", iu.map((e) => e.documentNumber)),
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
		return su([r, ...iu]), r;
	},
	createManagedInvoice(e) {
		let t = au.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = K.createManagedOrder(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: pu("invoice"),
			managedDraftId: e.draftId,
			type: "INVOICE",
			status: "ISSUED",
			documentNumber: mu("INV", au.map((e) => e.documentNumber)),
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
		}, a = iu.map((e) => e.id === n.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: r
		} : e);
		return qc({
			quotes: nu,
			salesOrders: a,
			invoices: [i, ...au]
		}), iu = a, au = [i, ...au], lu(), Zl.postInvoice(i), i;
	},
	cancelManagedOrder(e, t) {
		let n = iu.find((t) => t.id === e);
		if (!n?.managedDraftId) throw Error("Managed order not found.");
		if (n.status === "CANCELLED") return n;
		if (n.invoiceIds.some((e) => au.some((t) => t.id === e && t.status !== "VOID"))) throw Error("Void active invoices before cancelling the order.");
		if (n.status === "PARTIALLY_FULFILLED" || n.status === "FULFILLED" || n.fulfilmentStatus === "PARTIALLY_FULFILLED" || n.fulfilmentStatus === "FULFILLED") throw Error("Reverse active fulfilments before cancelling the order.");
		if (t.trim().length < 3) throw Error("Cancellation reason is required.");
		let r = {
			...n,
			status: "CANCELLED",
			notes: (n.notes ?? "") + "\nCancelled: " + t.trim(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return su(iu.map((t) => t.id === e ? r : t)), r;
	},
	subscribe(e) {
		return Ql.add(e), () => {
			Ql.delete(e);
		};
	},
	getSnapshot() {
		return le(cu);
	},
	getAll() {
		return le(cu);
	},
	getById(e) {
		return le(cu).find((t) => t.id === e);
	},
	getByCustomer(e) {
		return le(cu).filter((t) => t.customerId === e);
	},
	getQuotesByCustomer(e) {
		return le(nu).filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return iu.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return au.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (du(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = oc(e.documentDate, e.pricingAt), n = e.lines.map((n) => Ll({
			customerId: e.customerId,
			documentDate: e.documentDate,
			pricingContext: t,
			draft: n
		})), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: pu("quote"),
			type: "QUOTE",
			documentNumber: mu("QU", nu.map((e) => e.documentNumber)),
			recipient: jc(e.customerId, e),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: fu(e.customerReference),
			notes: fu(e.notes),
			lines: n,
			totals: Il(n),
			createdAt: r,
			updatedAt: r
		};
		return ru([i, ...nu]), i;
	},
	updateDraftQuote(e, t) {
		let n = nu.find((t) => t.id === e);
		if (!n) throw Error(`Quote ${e} was not found`);
		if (n.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let r = n.lines.find((e) => e.pricingAt), i = oc(t.documentDate, t.pricingAt ?? (t.documentDate === n.documentDate ? r?.pricingAt : void 0), t.documentDate === n.documentDate && (!t.pricingAt || t.pricingAt === r?.pricingAt) ? r?.pricingTimezone : void 0), a = t.lines.map((e) => {
			let r = Ll({
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
			recipient: t.locationId === void 0 && t.accountingContactId === void 0 ? n.recipient : jc(n.customerId, t),
			documentDate: t.documentDate,
			expiryDate: t.expiryDate,
			customerReference: fu(t.customerReference),
			notes: fu(t.notes),
			lines: a,
			totals: Il(a),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ru(nu.map((t) => t.id === e ? o : t)), o;
	},
	sendQuote(e) {
		let t = nu.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return ru(nu.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = nu.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return ru(nu.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = nu.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return ru(nu.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = nu.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: pu("order"),
			type: "SALES_ORDER",
			documentNumber: mu("SO", iu.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: hu(),
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
		return su([r, ...iu], nu.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = iu.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED" && n.status !== "INVOICED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: n.status === "INVOICED" ? "INVOICED" : t,
			fulfilmentStatus: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return su(iu.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = iu.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = hu(), i = {
			id: pu("invoice"),
			managedDraftId: t.managedDraftId,
			type: "INVOICE",
			documentNumber: mu("INV", au.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: r,
			dueDate: gu(r, Number(C().terms)),
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
		}, a = [i, ...au], o = iu.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: n
		} : e);
		return qc({
			quotes: nu,
			salesOrders: o,
			invoices: a
		}), au = a, iu = o, lu(), Zl.postInvoice(i), i;
	},
	createCreditNoteFromInvoice(e) {
		let t = au.find((t) => t.id === e.invoiceId);
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
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = G.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id), s = e.quantity + i >= n.quantity - 1e-8, c = _u(s ? n.lineSubtotal - o.reduce((e, t) => e + t.lineSubtotal, 0) : n.lineSubtotal * e.quantity / n.quantity), l = _u(s ? n.taxAmount - o.reduce((e, t) => e + t.taxAmount, 0) : n.taxAmount * e.quantity / n.quantity);
			return {
				...n,
				requestedArea: e.quantity === n.quantity ? n.requestedArea : void 0,
				coveredArea: n.areaPerPack ? Math.round(e.quantity * n.areaPerPack * 1e8) / 1e8 : void 0,
				quantity: e.quantity,
				taxRate: a,
				lineSubtotal: c,
				taxAmount: l,
				lineTotal: _u(c + l)
			};
		}), a = Il(i);
		if (a.total <= 0) throw Error("Credit note total must be greater than zero");
		if (_u(_u(G.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + a.total) > _u(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: pu("credit-note"),
			creditNoteNumber: mu("CN", G.getAll().map((e) => e.creditNoteNumber)),
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
		return G.create(s), Zl.postCreditNote(s), s;
	},
	applyCreditToInvoice(e) {
		M(), Xc();
		let t = G.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		let n = au.find((t) => t.id === e.invoiceId);
		if (!n) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void credit note cannot be applied");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be applied");
		if (n.status === "VOID") throw Error("Credit cannot be applied to a void invoice");
		if (n.status === "DRAFT") throw Error("Credit cannot be applied to a draft invoice");
		if (t.customerId !== n.customerId) throw Error("Credit note and invoice must belong to the same customer");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the credit note date");
		let r = _u(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = G.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: pu("credit-allocation"),
			allocationNumber: mu("CA", G.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = _u(i.amountApplied + r), c = _u(Math.max(0, i.totals.total - (i.amountRefunded ?? 0) - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
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
		M(), Xc();
		let t = G.getAllocationById(e.allocationId);
		if (!t) throw Error(`Credit allocation ${e.allocationId} was not found`);
		if (t.status === "REVERSED") throw Error("This credit allocation has already been reversed");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A reversal reason is required");
		let r = G.getById(t.creditNoteId);
		if (!r) throw Error("Credit note was not found");
		if (r.status === "VOID") throw Error("Allocations on a void credit note cannot be reversed here");
		let i = au.find((e) => e.id === t.invoiceId);
		if (!i) throw Error("Allocated invoice was not found");
		if (i.status === "VOID") throw Error("Credit allocation cannot be reversed after the invoice has been voided");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			updatedAt: a
		}, s = _u(G.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = _u(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - s)), l = `sales-credit-reversal:${t.id}`;
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
		return G.update(a), Zl.reverseCreditNote(a), a;
	},
	recordInvoicePayment(e) {
		if (M(), Xc(), e.operationId) {
			let t = A.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = au.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = _u(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (w(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, a = Wl.create({
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
			Zl.postPayment(a);
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
		M(), Xc();
		let n = au.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (Wl.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
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
			A.bindResult(o, e), Zl.reverseInvoice(a);
			let n = F.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			ou(au.map((t) => t.id === e ? a : t)), A.complete(o, e);
		} catch (e) {
			try {
				A.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		if (Gn("CUSTOMER_PAYMENT", e), M(), Xc(), Wl.getById(e)?.depositApplicationId) throw Error("Reverse this settlement through customer deposits.");
		let n = Wl.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = au.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (A.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			A.bindResult(i, e);
			let n = Wl.reverse(e, t);
			Zl.reversePayment(n);
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
		let t = au.find((t) => t.id === e);
		if (!t) throw Error(`Invoice ${e} was not found`);
		if (t.status === "VOID") return t;
		let n = Wl.getReceivedByInvoice(e), r = G.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = _u(n.reduce((e, t) => e + t.amount, 0)), a = _u(r.reduce((e, t) => e + t.amount, 0)), o = _u(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : vu(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ou(au.map((t) => t.id === e ? c : t)), c;
	}
};
function du(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function fu(e) {
	return e?.trim() || void 0;
}
function pu(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function mu(e, t) {
	return we(e, t, ve((/* @__PURE__ */ new Date()).toISOString()).slice(0, 4));
}
function hu() {
	return ve((/* @__PURE__ */ new Date()).toISOString());
}
function gu(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function _u(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function vu(e) {
	return e < yu(/* @__PURE__ */ new Date());
}
function yu(e) {
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
			Mc(e.recipient);
			for (let n of e.lines) uc(n), sc(n), $t(n, t.products.products.find((e) => e.id === n.productId));
		}
	},
	snapshot: () => ({
		quotes: nu,
		salesOrders: iu,
		invoices: au
	}),
	restore: (e) => {
		nu = e.quotes, iu = e.salesOrders, au = e.invoices, cu = uu();
	},
	publish: () => Ql.forEach((e) => e())
});
function bu(e, t) {
	ou(au.map((n) => n.id === e ? {
		...n,
		...t
	} : n));
}
function xu(e) {
	if (nu.some((t) => e.has(t.id) && t.status !== "DRAFT")) throw Error("Only draft quotes may be purged.");
	ru(nu.filter((t) => !e.has(t.id)));
}
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var Su = /* @__PURE__ */ new Set(), q = k.read().supplierCredits, Cu = k.read().supplierCreditAllocations, wu = k.read().supplierCredits, Tu = k.read().supplierCreditAllocations;
k.onRollback(() => {
	q = k.read().supplierCredits, Cu = k.read().supplierCreditAllocations, wu = q, Tu = Cu;
});
function Eu() {
	k.update("supplierCredits", q), k.update("supplierCreditAllocations", Cu), wu = [...q], Tu = [...Cu], Su.forEach((e) => k.notify(e));
}
var Du = !1, J = {
	subscribe(e) {
		return Su.add(e), () => {
			Su.delete(e);
		};
	},
	getSnapshot() {
		return wu;
	},
	getAllocationSnapshot() {
		return Tu;
	},
	getAll() {
		return wu;
	},
	getAllAllocations() {
		return Tu;
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
		return Cu.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return Cu.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return Cu.filter((t) => t.supplierBillId === e);
	},
	createReturnCredit(e, t) {
		let n = {
			...J.create(e),
			physicalReturnId: t
		};
		return J.update(n), n;
	},
	voidReturnCredit(e) {
		Du = !0;
		try {
			return J.voidCredit(e);
		} finally {
			Du = !1;
		}
	},
	create(e) {
		let t = Gi.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (q.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!ju(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, n) => {
			let r = i.get(e.supplierBillLineId);
			if (!r) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(r.id)) throw Error(`${r.description} appears more than once in the supplier credit.`);
			a.add(r.id);
			let o = Nu(e.quantity);
			if (!Number.isFinite(o) || o <= 0) throw Error(`${r.description} credit quantity must be greater than zero.`);
			if (o > r.quantity) throw Error(`${r.description} credit quantity cannot exceed the source bill quantity.`);
			let s = e.unitCost;
			if (!Number.isFinite(s) || s < 0) throw Error(`${r.description} unit cost cannot be negative.`);
			if (s > r.unitCost + 1e-8) throw Error(`${r.description} credit unit cost cannot exceed the source bill unit cost.`);
			let c = q.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.supplierBillLineId === r.id), l = Math.abs(s - r.unitCost) < 1e-8, u = c.every((e) => Math.abs(e.unitCost - r.unitCost) < 1e-8), d = l && u && Math.abs(o + c.reduce((e, t) => e + t.quantity, 0) - r.quantity) < 1e-8, f = c.reduce((e, t) => e + t.lineSubtotal, 0), p = c.reduce((e, t) => e + t.taxAmount, 0), m = Mu(d ? r.lineSubtotal - f : l ? r.lineSubtotal * o / r.quantity : o * s), h = Mu(d ? r.taxAmount - p : r.unitCost ? r.taxAmount * o / r.quantity * s / r.unitCost : 0);
			if (m < 0 || h < 0 || Mu(m + f) > r.lineSubtotal || Mu(h + p) > r.taxAmount) throw Error("Credit line value exceeds the uncredited source bill line.");
			let g = Mu(m + h);
			return {
				id: Au(`supplier-credit-line-${n + 1}`),
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
		}), s = Mu(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = Mu(o.reduce((e, t) => e + t.taxAmount, 0)), l = Mu(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (Mu(Mu(q.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > Mu(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: Au("supplier-credit"),
			creditNumber: ku(e.creditDate),
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
		return q = [d, ...q], Eu(), Ir.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = q.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = Gi.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!ju(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = Mu(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: Au("supplier-credit-allocation"),
			allocationNumber: Ou(e.allocationDate),
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
		Gi.applyCredit(n.id, r);
		let o = Mu(t.amountApplied + r), s = Mu(Math.max(0, t.totals.total - (t.amountRefunded ?? 0) - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return Cu = [a, ...Cu], q = q.map((e) => e.id === t.id ? c : e), Eu(), a;
	},
	reverseAllocation(e) {
		let t = Cu.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = q.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = Gi.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		Gi.reverseCredit(i.id, t.amount);
		let o = Mu(Math.max(0, r.amountApplied - t.amount)), s = Mu(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - o)), c = {
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
		return q = q.map((e) => e.id === r.id ? c : e), Cu = Cu.map((e) => e.id === t.id ? l : e), Eu(), l;
	},
	voidCredit(e) {
		let t = q.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		if (t.physicalReturnId && !Du) throw Error("Reverse the linked physical supplier return instead of voiding its credit separately.");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse supplier refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (Cu.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: Du && e.voidDate ? e.voidDate : r,
			voidReason: n,
			updatedAt: r
		};
		return q = q.map((e) => e.id === t.id ? i : e), Eu(), Ir.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!Cu.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return Cu = Cu.map((t) => t.id === e.id ? e : t), Eu(), e;
	},
	update(e) {
		if (!q.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return q = q.map((t) => t.id === e.id ? e : t), Eu(), e;
	}
};
function Ou(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = Cu.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function ku(e) {
	return we("SC", q.map((e) => e.creditNumber), e.slice(0, 4));
}
function Au(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function ju(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function Mu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Nu(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var Pu = J.create;
J.create = function(...e) {
	return M(), k.transaction(() => Pu.apply(J, e));
};
var Fu = J.applyToBill;
J.applyToBill = function(...e) {
	return M(), k.transaction(() => Fu.apply(J, e));
};
var Iu = J.reverseAllocation;
J.reverseAllocation = function(...e) {
	return M(), k.transaction(() => Iu.apply(J, e));
};
var Lu = J.voidCredit;
J.voidCredit = function(...e) {
	return M(), k.transaction(() => Lu.apply(J, e));
};
var Ru = J.update;
J.update = function(...e) {
	return M(), k.transaction(() => Ru.apply(J, e));
};
var zu = J.updateAllocation;
J.updateAllocation = function(...e) {
	return M(), k.transaction(() => zu.apply(J, e));
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
		allocations: Cu
	}),
	restore: (e) => {
		q = e.supplierCredits, Cu = e.allocations, wu = [...q], Tu = [...Cu];
	},
	publish: () => Su.forEach((e) => e())
});
function Bu(e, t) {
	q = q.map((n) => n.id === e ? {
		...n,
		...t
	} : n), Eu();
}
//#endregion
//#region src/features/finance-closure/settlementRepository.ts
var Vu = (e) => Math.round((e + 2 ** -52) * 100) / 100, Hu = E().trim().min(1).max(200), Uu = f().finite().positive().refine((e) => Vu(e) === e, "Use cents precision"), Wu = e({
	operationId: Hu,
	customerId: Hu,
	paymentDate: Hu,
	bankAccountId: Hu,
	reference: E().max(500).optional(),
	allocations: s(e({
		invoiceId: Hu,
		amount: Uu
	}).strict()).min(1).max(500)
}).strict(), Gu = e({
	operationId: Hu,
	creditId: Hu,
	paymentDate: Hu,
	bankAccountId: Hu,
	amount: Uu,
	reference: E().max(500).optional()
}).strict(), Ku = [], qu = [], Ju = [], Yu = 0, Xu = /* @__PURE__ */ new Set(), Zu = () => {
	Yu++, Xu.forEach((e) => e());
};
function Qu(e, t, n) {
	let r = JSON.stringify(n), i = e.find((e) => e.operationId === t);
	if (i && i.fingerprint !== r) throw Error("Operation ID was already used with different data.");
	return {
		old: i,
		fingerprint: r
	};
}
function $u(e, t) {
	w(t, "Payment date");
	let n = I.requireById(e);
	if (!n.active || t < n.openingBalanceDate) throw Error("Bank is inactive or payment precedes its opening date.");
	let r = P.requireById(n.glAccountId);
	if (!r.active || r.type !== "ASSET") throw Error("Invalid bank ledger account.");
	return n;
}
function ed(e) {
	if (nc.getAll().some((t) => t.clearedTransactionIds.some((t) => t.startsWith(e + ":")))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function td(e, t) {
	let n = e === "customer" ? G.getById(t) : J.getById(t);
	if (!n || n.status === "VOID" || n.status === "DRAFT") throw Error("An issued credit is required.");
	return n;
}
function nd(e, t, n) {
	let r = td(e, t), i = Vu(n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0)), a = Vu(r.totals.total - r.amountApplied - i);
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
function rd(e, t) {
	M();
	let n = Gu.parse(t), { old: r, fingerprint: i } = Qu(e === "customer" ? qu : Ju, n.operationId, n);
	if (r) return r;
	let a = td(e, n.creditId), o = $u(n.bankAccountId, n.paymentDate);
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
	return nd(e, a.id, [...a.refundEvents ?? [], {
		id: u.id,
		date: u.paymentDate,
		amount: u.amount
	}]), e === "customer" ? qu = [...qu, u] : Ju = [...Ju, u], Zu(), u;
}
function id(e, t) {
	if (M(), w(t.reversalDate, "Reversal date"), !t.reason?.trim() || t.reason.trim().length < 3) throw Error("Enter a reversal reason.");
	let n = e === "customer" ? qu : Ju, r = n.find((e) => e.id === t.id);
	if (!r) throw Error("Refund was not found.");
	if (r.status === "REVERSED") return r;
	if (t.reversalDate < r.paymentDate) throw Error("Reversal cannot precede the refund.");
	ed(r.journalEntryId), F.reverse({
		journalEntryId: r.journalEntryId,
		reversalDate: t.reversalDate,
		reason: t.reason
	});
	let i = td(e, r.creditId);
	nd(e, i.id, (i.refundEvents ?? []).map((e) => e.id === r.id ? {
		...e,
		reversalDate: t.reversalDate
	} : e));
	let a = {
		...r,
		status: "REVERSED",
		reversalDate: t.reversalDate
	};
	return e === "customer" ? qu = n.map((e) => e.id === r.id ? a : e) : Ju = n.map((e) => e.id === r.id ? a : e), Zu(), a;
}
var ad = {
	recordReceipt(e) {
		let t = Wu.parse(e), { old: n, fingerprint: r } = Qu(Ku, t.operationId, t);
		if (n) return n;
		if ($u(t.bankAccountId, t.paymentDate), new Set(t.allocations.map((e) => e.invoiceId)).size !== t.allocations.length) throw Error("Each invoice may only be allocated once.");
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
			amount: Vu(i.reduce((e, t) => e + t.amount, 0)),
			paymentIds: i.map((e) => e.id),
			status: "POSTED"
		};
		return Ku = [...Ku, a], Zu(), a;
	},
	reverseReceipt(e) {
		let t = Ku.find((t) => t.id === e.id);
		if (!t) throw Error("Receipt not found.");
		if (t.status === "REVERSED") return t;
		for (let e of t.paymentIds) {
			let t = Wl.getById(e);
			if (!t || t.status !== "RECEIVED") throw Error("Receipt allocations changed; inspect individual payments first.");
			for (let t of F.getBySource("CUSTOMER_PAYMENT", e)) ed(t.id);
		}
		for (let n of t.paymentIds) K.reverseInvoicePayment(n, e.reason);
		let n = {
			...t,
			status: "REVERSED",
			reversalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		};
		return Ku = Ku.map((e) => e.id === t.id ? n : e), Zu(), n;
	},
	createRefund: (e) => rd("customer", e),
	reverseRefund: (e) => id("customer", e)
}, od = {
	create: (e) => rd("supplier", e),
	reverse: (e) => id("supplier", e),
	repairLegacyCredits(e) {
		if (M(), w(e.date, "Repair date"), e.reason?.trim().length < 3) throw Error("Enter a repair reason.");
		let t = [];
		for (let n of J.getAll().filter((e) => e.status !== "VOID")) {
			if (e.date < n.creditDate || F.getBySource("SUPPLIER_CREDIT_RECLASS", n.id).length) continue;
			let r = F.getBySource("SUPPLIER_CREDIT", n.id).find((e) => e.status === "POSTED");
			if (!r) continue;
			let i = P.requireBySystemRole("INVENTORY"), a = P.requireBySystemRole("PURCHASE_PRICE_VARIANCE"), o = Vu(r.lines.filter((e) => e.accountId === i.id).reduce((e, t) => e + t.credit - t.debit, 0));
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
}, sd = e({
	id: Hu,
	operationId: Hu,
	fingerprint: Hu,
	creditId: Hu,
	contactId: Hu,
	paymentDate: Hu,
	bankAccountId: Hu,
	amount: Uu,
	journalEntryId: Hu,
	status: T(["POSTED", "REVERSED"]),
	reference: E().optional(),
	reversalDate: E().optional()
}).strict();
i("customerSettlements", {
	repository: ad,
	read: "sales.read",
	commands: {
		recordReceipt: "sales.payment",
		reverseReceipt: "sales.payment",
		createRefund: "sales.payment",
		reverseRefund: "sales.payment"
	},
	snapshot: () => ({
		receipts: Ku,
		refunds: qu
	}),
	restore: (e) => {
		Ku = e.receipts, qu = e.refunds;
	},
	validate: (t, n) => {
		cd(t, n, !1);
		let r = t;
		s(sd.extend({ fingerprint: E() })).parse(r.refunds), s(e({
			id: Hu,
			operationId: Hu,
			paymentIds: s(Hu),
			amount: Uu,
			status: T(["POSTED", "REVERSED"])
		}).passthrough()).parse(r.receipts);
	},
	publish: Zu
}), i("supplierRefunds", {
	repository: od,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		repairLegacyCredits: "accounting.recover"
	},
	snapshot: () => ({ refunds: Ju }),
	restore: (e) => {
		Ju = e.refunds;
	},
	validate: (e, t) => {
		cd(e, t, !0), s(sd.extend({ fingerprint: E() })).parse(e.refunds);
	},
	publish: Zu
});
function cd(e, t, n) {
	let r = e, i = t.journals.journalEntries, a = n ? t.supplierCredits.supplierCredits : t.customerCredits.creditNotes, o = t.bankAccounts.bankAccounts;
	for (let e of r.refunds) {
		let t = a.find((t) => t.id === e.creditId), r = i.find((t) => t.id === e.journalEntryId), s = t?.refundEvents?.find((t) => t.id === e.id);
		if (!t || e.contactId !== ("customerId" in t ? t.customerId : t.supplierId) || !s || s.amount !== e.amount || s.date !== e.paymentDate || s.reversalDate !== e.reversalDate || !o.some((t) => t.id === e.bankAccountId) || !r || r.sourceId !== e.id || r.sourceType !== (n ? "SUPPLIER_REFUND" : "CUSTOMER_REFUND") || r.totalDebit !== e.amount || r.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) throw Error("Refund snapshot relationships are invalid.");
	}
	for (let e of a) {
		let t = Vu(r.refunds.filter((t) => t.creditId === e.id && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
		if ((e.amountRefunded ?? 0) !== t) throw Error("Credit refunded balance is invalid.");
	}
	for (let e of a) for (let t of e.refundEvents ?? []) if (!r.refunds.some((n) => n.id === t.id && n.creditId === e.id)) throw Error("Credit refund history has no settlement record.");
	if (!n) {
		let e = t.customerPayments.payments;
		for (let t of r.receipts ?? []) {
			let n = t.paymentIds.map((t) => e.find((e) => e.id === t));
			if (new Set(t.paymentIds).size !== t.paymentIds.length || !n.length || n.some((e) => !e || e.customerId !== t.customerId || e.bankAccountId !== t.bankAccountId || e.status !== (t.status === "REVERSED" ? "REVERSED" : "RECEIVED")) || Vu(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== t.amount) throw Error("Receipt allocation snapshot relationships are invalid.");
		}
	}
}
//#endregion
//#region src/features/finance-closure/bankStatementRepository.ts
var ld = (e) => Math.round((e + 2 ** -52) * 100) / 100, ud = E().min(1).max(200), dd = [], fd = 0, pd = /* @__PURE__ */ new Set(), md = () => {
	fd++, pd.forEach((e) => e());
};
function hd(e) {
	let t = I.requireById(e);
	if (!t.active) throw Error("Select an active bank account.");
	return t;
}
function gd(e) {
	let t = dd.find((t) => t.id === e);
	if (!t) throw Error("Statement line was not found.");
	return t;
}
function _d(e) {
	if (e.status !== "UNMATCHED") throw Error("This line is already processed. Revert it before changing it.");
	let t = nc.getLatestByBankAccount(e.bankAccountId);
	if (t && e.date <= t.statementDate) throw Error("Statement date is already reconciled.");
}
function vd(e) {
	return dd = dd.map((t) => t.id === e.id ? e : t), md(), e;
}
var yd = (e, t) => Vs(hd(e), F.getAll(), t).transactions;
function bd(e) {
	if (e.date < hd(e.bankAccountId).openingBalanceDate) throw Error("Statement predates the current bank opening date.");
}
function xd(e) {
	let t = F.getAll(), n = Rs(t);
	if (t.some((t) => t.sourceType === "BANK_STATEMENT" && t.sourceId?.startsWith(e + ":") && n.reviewIds.has(t.id))) throw Error("Earlier categorisation correction requires reviewed recovery before changing this line again.");
}
var Sd = e({
	date: ud,
	description: E().trim().min(1).max(1e3),
	amount: f().finite().refine((e) => e !== 0 && ld(e) === e, "Enter a non-zero amount in cents"),
	reference: E().max(500).default(""),
	externalId: E().max(200).default(""),
	payee: E().trim().max(500).optional()
}).strict(), Cd = {
	importRows(t) {
		let n = e({
			bankAccountId: ud,
			rows: s(Sd).min(1).max(1e4)
		}).strict().parse(t), r = hd(n.bankAccountId), i = 0, a = [...dd], o = [];
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
			let s = nc.getLatestByBankAccount(r.id);
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
		return dd = a, md(), {
			created: o.length,
			duplicates: i
		};
	},
	importCsv(e) {
		if (typeof e.csv != "string" || e.csv.length > 1e7) throw Error("CSV exceeds the 10 MB limit.");
		let t = ja(e.csv.replace(/^\uFEFF/, "")), n = t.shift()?.map((e) => e.trim().toLowerCase()) ?? [];
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
		return Cd.importRows({
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
					l = ld(t - e);
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
		let t = nc.getClearedTransactionIds(e.bankAccountId), n = F.getAll(), r = new Map(n.map((e) => [e.id, e]));
		return yd(e.bankAccountId, e.asOfDate).filter((i) => ce(r.get(i.journalEntryId), n, e.asOfDate) && !i.correctionOnly && !i.correctionIssue && !t.has(i.id) && !dd.some((e) => e.ledgerIds.includes(i.id)));
	},
	match(e) {
		let t = gd(e.id);
		if (_d(t), bd(t), !Array.isArray(e.ledgerIds) || !e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Select unique ledger entries.");
		let n = nc.getClearedTransactionIds(t.bankAccountId);
		if (e.ledgerIds.some((e) => n.has(e))) throw Error("Selected bank entries were already cleared by a completed reconciliation. Use the genuine source of this new statement line.");
		let r = Cd.candidates({
			bankAccountId: t.bankAccountId,
			asOfDate: t.date
		}), i = e.ledgerIds.map((e) => r.find((t) => t.id === e));
		if (i.some((e) => !e) || ld(i.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== t.amount) throw Error("Selected bank entries must match this signed statement amount exactly.");
		return vd({
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
		let t = gd(e.id);
		return (x["bank-rules"] ?? []).filter((e) => e.status === "Active" && e.enabled !== "No").filter((e) => Ps(e, t)).sort((e, t) => Number(e.priority ?? 100) - Number(t.priority ?? 100) || e.id.localeCompare(t.id));
	},
	post(t) {
		M();
		let n = gd(t.id), i = JSON.stringify(t.splits);
		if (n.status === "POSTED") {
			if (n.fingerprint !== i) throw Error("Line was already posted with different categorisation.");
			return n;
		}
		_d(n), bd(n), xd(n.id);
		let a = s(e({
			accountId: ud,
			amount: f().finite().positive().refine((e) => ld(e) === e),
			taxCode: ud
		}).strict()).min(1).max(100).parse(t.splits);
		if (ld(a.reduce((e, t) => e + t.amount, 0)) !== Math.abs(n.amount)) throw Error("Split amounts must equal the statement total.");
		let o = hd(n.bankAccountId), c = n.amount < 0, l = a.flatMap((e) => {
			let t = P.requireById(e.accountId);
			if (!t.active || !t.allowManualPosting || !["EXPENSE", "REVENUE"].includes(t.type)) throw Error("Use an active manual expense/revenue account. Payments against AR/AP must be matched to their source documents.");
			let n = ue(e.taxCode), i = ld(e.amount / (1 + n)), a = ld(e.amount - i);
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
		return vd({
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
		let t = gd(e.id);
		if (_d(t), e.reason?.trim().length < 3) throw Error("Enter an exclusion reason.");
		return vd({
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
		let t = gd(e.id);
		if (w(e.reversalDate, "Reversal date"), e.reason?.trim().length < 3 || e.reversalDate < t.date) throw Error("Enter a reason and a reversal date on or after the statement line.");
		if (t.status === "UNMATCHED") throw Error("Line is already unmatched.");
		let n = nc.getLatestByBankAccount(t.bankAccountId);
		if (n && t.date <= n.statementDate) throw Error("Reconciled statement lines cannot be reverted.");
		if (t.status === "POSTED" && xd(t.id), t.status === "POSTED" && e.reversalDate !== t.date) throw Error("Categorisation correction must reverse on the original statement date in an open period. It does not reverse an external payment.");
		if (t.status === "POSTED") for (let e of t.ledgerIds) ed(e.split(":")[0]);
		return t.status === "POSTED" && t.journalEntryId && F.reverse({
			journalEntryId: t.journalEntryId,
			reversalDate: e.reversalDate,
			reason: e.reason
		}), vd({
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
		if (rr(e.statementDate), M(), w(e.statementDate, "Statement date"), !dd.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate)) throw Error("Import the statement first.");
		if (dd.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate && t.status === "UNMATCHED")) throw Error("Process every statement line before completing reconciliation.");
		let t = dd.filter((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate), n = yd(e.bankAccountId, e.statementDate), r = F.getAll(), i = new Map(r.map((e) => [e.id, e]));
		for (let a of t.filter((e) => e.status === "MATCHED" || e.status === "POSTED")) {
			if (a.ledgerIds.some((t) => Ks(nc.getAll(), e.bankAccountId, t, a.date))) throw Error("Statement match reuses a ledger row already cleared in an earlier statement. Unmatch this unreconciled line and select its genuine source.");
			let t = a.ledgerIds.map((e) => n.find((t) => t.id === e));
			if (!t.length || t.some((e) => !e || !ce(i.get(e.journalEntryId), r, a.date) || e.correctionOnly || e.correctionIssue) || ld(t.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== a.amount) throw Error("Statement match is stale. Revert the statement line and review its ledger sources before reconciling.");
		}
		let a = t.flatMap((e) => e.ledgerIds);
		return nc.complete({
			...e,
			clearedTransactionIds: [.../* @__PURE__ */ new Set([...nc.getClearedTransactionIds(e.bankAccountId), ...a])]
		});
	}
}, wd = e({
	id: ud,
	key: E(),
	bankAccountId: ud,
	date: ud,
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
	ledgerIds: s(ud),
	journalEntryId: E().optional(),
	fingerprint: E().optional(),
	history: s(e({
		action: E(),
		date: E(),
		reason: E().optional()
	}))
}).strict();
i("bankStatements", {
	repository: Cd,
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
	snapshot: () => ({ lines: dd }),
	restore: (e) => {
		dd = e.lines;
	},
	validate: (t, n) => {
		let r = e({ lines: s(wd) }).strict().parse(t), i = n, a = i.bankAccounts.bankAccounts, o = i.journals.journalEntries, c = /* @__PURE__ */ new Set(), l = new Map(o.map((e) => [e.id, e])), u = new Map(o.flatMap((e) => e.lines.map((t) => [e.id + ":" + t.id, {
			journal: e,
			entry: t
		}])));
		if (new Set(r.lines.map((e) => e.key)).size !== r.lines.length) throw Error("Duplicate bank statement import key.");
		for (let t of r.lines) {
			let n = a.find((e) => e.id === t.bankAccountId);
			if (!n) throw Error("Bank statement account is missing.");
			try {
				w(t.date), Sd.parse({
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
				c.add(e), o = ld(o + a.debit - a.credit);
			}
			if (o !== t.amount) throw Error("Bank statement amount does not match its ledger links.");
			if (t.status === "MATCHED") {
				if (t.journalEntryId || t.fingerprint) throw Error("Matched bank statements cannot claim categorisation journals.");
			} else {
				let r = l.get(t.journalEntryId ?? ""), i = t.history.filter((e) => e.action === "Posted").length - 1, a = r?.lines.filter((e) => e.accountId === n.glAccountId).map((e) => r.id + ":" + e.id).sort();
				if (!r || r.status !== "POSTED" || r.sourceType !== "BANK_STATEMENT" || r.sourceId !== t.id + ":" + i || r.journalDate !== t.date || JSON.stringify(a) !== JSON.stringify([...t.ledgerIds].sort())) throw Error("Bank statement categorisation journal does not match its source.");
				try {
					if (ld(s(e({
						accountId: ud,
						amount: f().finite().positive().refine((e) => ld(e) === e),
						taxCode: ud
					}).strict()).min(1).max(100).parse(JSON.parse(t.fingerprint ?? "")).reduce((e, t) => e + t.amount, 0)) !== Math.abs(t.amount)) throw Error("Wrong split total.");
				} catch {
					throw Error("Bank statement categorisation fingerprint is invalid.");
				}
			}
		}
	},
	publish: md
});
//#endregion
//#region src/features/bank-rules/ruleState.ts
var Td = [], Ed = () => Td, Dd = (e) => {
	Td = e;
}, Od = E().trim().min(1).max(200), kd = E().regex(/^[a-f0-9]{64}$/), Ad = E().trim().min(3).max(2e3), jd = (e) => Array.isArray(e) ? e.map(jd) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, jd(e[t])])) : e, Md = (e) => Oe("sha256").update(JSON.stringify(jd(e))).digest("hex"), Nd = /* @__PURE__ */ new Map();
function Pd(e, t) {
	let n = t.bankStatements.lines.find((t) => t.id === e);
	if (!n) throw Error("Statement line not found.");
	let r = {
		lineId: e,
		description: n.description,
		date: n.date,
		amount: n.amount,
		lineToken: Md(n),
		status: "No match",
		reason: "No enabled rule matches."
	};
	if (n.status !== "UNMATCHED") return {
		...r,
		status: "Blocked",
		reason: "Only unmatched statement lines can be classified."
	};
	let i = t.workspace_bank_rules.records.filter((e) => e.status === "Active" && e.enabled !== "No" && Ps(e, n));
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
		ruleToken: Md(s)
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
		rr(n.date), M();
	} catch (e) {
		return f(e.message);
	}
	return t.journals.journalEntries.filter((e) => e.status === "POSTED" && e.journalDate <= n.date).some((e) => e.lines.some((e) => e.accountId === l.glAccountId && Math.round((e.debit - e.credit) * 100) === Math.round(n.amount * 100))) ? f("An equal signed bank ledger entry exists. Review and match its genuine source before categorising.") : {
		...c,
		status: "Ready",
		reason: "Unique highest-priority rule; review the saved categorisation before posting."
	};
}
var Fd = (e) => ({
	operationId: e.operationId,
	action: e.action,
	actorId: e.actorId,
	at: e.at,
	reason: e.reason,
	previewDigest: e.previewDigest,
	automatic: e.automatic
});
function Id(e, t, n, r, i) {
	let a = O.require("banking.write"), o = (/* @__PURE__ */ new Date()).toISOString(), s = {
		operationId: e,
		action: "Applied",
		actorId: a.userId,
		at: o,
		reason: r,
		previewDigest: n,
		automatic: i
	}, c = Md({
		...s,
		decisions: t
	}), l = t.map((e) => ({
		id: ke(),
		...s,
		fingerprint: c,
		decision: e
	}));
	return Dd([...Ed(), ...l]), structuredClone(l);
}
function Ld(e, t, n, r) {
	let i = O.require("banking.write"), a = Ed().filter((t) => t.operationId === e);
	if (a.length && (a[0].actorId !== i.userId || a[0].previewDigest !== t || a[0].reason !== n || a[0].action !== r)) throw Error("Operation ID has different bank-rule data.");
	return a.length ? structuredClone(a) : void 0;
}
function Rd(e, n) {
	O.require("banking.write");
	let r = t(), i = e.map((e) => Pd(e, r)).filter((e) => e.status === "Ready" && r.workspace_bank_rules.records.some((t) => t.id === e.ruleId && t.automatic === "Yes"));
	i.length && Id("auto-rule:" + n, i, Md(r), "Automatic classification of newly imported statement lines", !0);
}
var zd = {
	preview(n) {
		let r = O.require("banking.read"), i = e({ lineIds: s(Od).min(1).max(100) }).strict().parse(n);
		if (new Set(i.lineIds).size !== i.lineIds.length) throw Error("Select each line once.");
		let a = t(), o = i.lineIds.map((e) => Pd(e, a)), c = Md({
			nonce: ke(),
			actor: r.userId,
			snapshot: a,
			rows: o
		}), l = Date.now() + 3e5;
		for (let [e, t] of Nd) t.expires < Date.now() && Nd.delete(e);
		return Nd.size >= 100 && Nd.delete(Nd.keys().next().value), Nd.set(c, {
			actor: r.userId,
			expires: l,
			snapshot: Md(a),
			rows: o
		}), {
			digest: c,
			expiresAt: new Date(l).toISOString(),
			rows: o
		};
	},
	apply(n) {
		let r = O.require("banking.write"), i = e({
			operationId: Od,
			expectedDigest: kd,
			reason: Ad
		}).strict().parse(n), a = Ld(i.operationId, i.expectedDigest, i.reason, "Applied");
		if (a) return a;
		let o = Nd.get(i.expectedDigest), s = t();
		if (!o || o.actor !== r.userId || o.expires < Date.now() || o.snapshot !== Md(s)) throw Error("Rule preview expired or business data changed. Preview again.");
		let c = o.rows.map((e) => Pd(e.lineId, s));
		if (c.some((e) => e.status !== "Ready")) throw Error("Every selected line must have a unique eligible classification.");
		if (c.some((e) => {
			let t = Ed().findLast((t) => t.decision.lineId === e.lineId);
			return t?.action === "Applied" && t.decision.lineToken === e.lineToken;
		})) throw Error("A saved classification already exists. Withdraw it before replacing it.");
		return Id(i.operationId, c, i.expectedDigest, i.reason, !1);
	},
	current(n) {
		O.require("banking.read");
		let r = e({ lineId: Od }).strict().parse(n), i = Ed().findLast((e) => e.decision.lineId === r.lineId);
		if (!i || i.action !== "Applied") return null;
		let a = Pd(r.lineId, t());
		return a.status === "Ready" && Md(a) === Md(i.decision) ? structuredClone(a) : null;
	},
	post(n) {
		O.require("banking.write");
		let r = e({ receiptId: Od }).strict().parse(n), i = Ed().find((e) => e.id === r.receiptId);
		if (!i || i.action !== "Applied" || Ed().findLast((e) => e.decision.lineId === i.decision.lineId)?.id !== i.id) throw Error("Saved classification changed. Review again.");
		let a = t().bankStatements.lines.find((e) => e.id === i.decision.lineId);
		if (!a) throw Error("Statement line not found.");
		let o = [{
			accountId: i.decision.accountId,
			amount: Math.abs(i.decision.amount),
			taxCode: i.decision.taxCode
		}];
		if (a.status !== "POSTED" && !zd.current({ lineId: a.id })) throw Error("Saved classification is stale or blocked. Review the source and rule before posting.");
		return Cd.post({
			id: a.id,
			splits: o
		});
	},
	withdraw(n) {
		let r = O.require("banking.write"), i = e({
			operationId: Od,
			receiptId: Od,
			reason: Ad
		}).strict().parse(n), a = Ld(i.operationId, Md({ receiptId: i.receiptId }), i.reason, "Withdrawn");
		if (a) return a;
		let o = Ed().find((e) => e.id === i.receiptId);
		if (!o || Ed().findLast((e) => e.decision.lineId === o.decision.lineId)?.id !== o.id || o.action !== "Applied") throw Error("Classification changed. Refresh first.");
		let s = t().bankStatements.lines.find((e) => e.id === o.decision.lineId);
		if (!s || s.status !== "UNMATCHED") throw Error("Processed lines use their normal unmatch or reversal workflow.");
		let c = {
			operationId: i.operationId,
			action: "Withdrawn",
			actorId: r.userId,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			reason: i.reason,
			previewDigest: Md({ receiptId: i.receiptId }),
			automatic: !1
		}, l = {
			id: ke(),
			...c,
			decision: o.decision,
			fingerprint: Md({
				...c,
				decisions: [o.decision]
			})
		};
		return Dd([...Ed(), l]), [structuredClone(l)];
	}
}, Bd = e({
	lineId: Od,
	description: E().min(1).max(1e3),
	date: Od,
	amount: f().finite(),
	status: b("Ready"),
	ruleId: Od,
	ruleName: Od,
	accountId: Od,
	taxCode: Od,
	reason: E().min(1).max(2e3),
	lineToken: kd,
	ruleToken: kd
}).strict(), Vd = e({
	id: de(),
	operationId: Od,
	fingerprint: kd,
	action: T(["Applied", "Withdrawn"]),
	actorId: Od,
	at: Me(),
	reason: Ad,
	previewDigest: kd,
	automatic: y(),
	decision: Bd
}).strict();
i("bankRuleApplications", {
	repository: zd,
	read: "banking.read",
	commands: {
		preview: "banking.read",
		apply: "banking.write",
		withdraw: "banking.write",
		current: "banking.read",
		post: "banking.write"
	},
	snapshot: () => ({ receipts: Ed() }),
	restore: (e) => Dd(e.receipts),
	publish: () => {},
	validate: (t, n) => {
		let { receipts: r } = e({ receipts: s(Vd) }).strict().parse(t), i = n, a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
		for (let e of r) {
			let t = i.bankStatements.lines.find((t) => t.id === e.decision.lineId), n = o.get(e.decision.lineId);
			if (!t || t.date !== e.decision.date || t.amount !== e.decision.amount || t.description !== e.decision.description || !i.accounts.accounts.some((t) => t.id === e.decision.accountId) || !i.workspace_bank_rules.records.some((t) => t.id === e.decision.ruleId) || !i.workspace_tax_codes.records.some((t) => t.code === e.decision.taxCode)) throw Error("Invalid saved bank-rule source or action references.");
			if (e.action === "Withdrawn" && (!n || n.action !== "Applied" || Md(n.decision) !== Md(e.decision) || e.previewDigest !== Md({ receiptId: n.id }) || e.automatic)) throw Error("Invalid bank-rule withdrawal lifecycle.");
			if (e.action === "Applied" && n?.action === "Applied" && n.decision.lineToken === e.decision.lineToken) throw Error("Duplicate saved bank classification.");
			o.set(e.decision.lineId, e), a.set(e.operationId, [...a.get(e.operationId) ?? [], e]);
		}
		for (let e of a.values()) {
			let t = e[0];
			if (e.some((e) => Md(Fd(e)) !== Md(Fd(t)) || e.fingerprint !== t.fingerprint) || new Set(e.map((e) => e.decision.lineId)).size !== e.length || Md({
				...Fd(t),
				decisions: e.map((e) => e.decision)
			}) !== t.fingerprint) throw Error("Invalid bank-rule batch receipt.");
		}
	}
});
//#endregion
//#region src/features/recurring/recurringDates.ts
var Hd = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
];
function Ud(e, t, n) {
	if (w(e), !Number.isSafeInteger(n) || n < 0 || !Hd.includes(t)) throw Error("Invalid schedule occurrence.");
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
function Wd(e, t) {
	w(e);
	let n = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	n.setUTCDate(n.getUTCDate() + t);
	let r = n.toISOString().slice(0, 10);
	return w(r), r;
}
//#endregion
//#region src/features/direct-documents/managedDocumentRepository.ts
var Y = E().trim().min(1).max(200), Gd = E().trim().max(2e3).optional(), Kd = e({
	requestedArea: f().finite().positive().max(1e9).optional(),
	productId: Y,
	unitId: Y,
	quantity: f().positive().finite(),
	unitPrice: f().nonnegative().finite().optional(),
	priceBasis: T(["Inclusive", "Exclusive"]).optional()
}).strict(), qd = e({
	description: E().trim().min(1).max(500),
	accountId: Y,
	quantity: f().positive().finite(),
	unitCost: f().nonnegative().finite(),
	taxCode: Y,
	priceBasis: T(["Inclusive", "Exclusive"]).optional()
}).strict(), Jd = e({
	kind: T(["ORDER", "INVOICE"]),
	customerId: Y,
	pricingAt: Y.optional(),
	pricingTimezone: Y.optional(),
	locationId: Y.or(b("")).optional(),
	accountingContactId: Y.or(b("")).optional(),
	documentDate: Y,
	dueDate: Y.optional(),
	customerReference: Gd,
	notes: Gd,
	lines: s(Kd).min(1).max(500)
}).strict(), Yd = e({
	kind: b("EXPENSE"),
	supplierId: Y,
	supplierInvoiceNumber: Y,
	documentDate: Y,
	dueDate: Y.optional(),
	notes: Gd,
	lines: s(qd).min(1).max(500)
}).strict(), Xd = (e) => he([Jd, Yd]).parse(e), Zd = f().finite().nonnegative().refine((e) => Number.isSafeInteger(Math.round(e * 100)) && e === Math.round(e * 100) / 100, "Use an amount in whole cents within the supported range."), Qd = e({
	operationId: Y,
	sourceName: E().trim().max(200),
	reviewed: y(),
	declared: e({
		subtotal: Zd,
		taxAmount: Zd,
		total: Zd
	}).strict(),
	payload: Yd.extend({ notes: E().trim().max(1e3).optional() })
}).strict();
function $d(e) {
	return {
		...e.payload,
		notes: [
			e.payload.notes,
			`Reviewed source: ${e.sourceName || "Manual entry"}`,
			`Declared net / tax / total: ${e.declared.subtotal.toFixed(2)} / ${e.declared.taxAmount.toFixed(2)} / ${e.declared.total.toFixed(2)}`
		].filter(Boolean).join("\n")
	};
}
function ef(e) {
	let t = vn.getById(e.payload.supplierId);
	if (!t || t.status !== "ACTIVE") throw Error("Select an active supplier.");
	let n = pf(e.payload), r = e.payload.supplierInvoiceNumber.trim().toLowerCase(), i = Gi.getAll(), a = new Set(i.filter((e) => e.status === "VOID").map((e) => e.id)), o = [...rf.filter((t) => t.operationId !== e.operationId && t.status !== "CANCELLED" && !(t.status === "POSTED" && t.documentId && a.has(t.documentId)) && t.payload.kind === "EXPENSE" && t.payload.supplierId === e.payload.supplierId && t.payload.supplierInvoiceNumber.trim().toLowerCase() === r).map((e) => ({
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
var tf = () => P.getAll().filter((e) => e.active && e.type === "EXPENSE" && e.allowManualPosting && (!e.systemRole || e.systemRole === "OPERATING_EXPENSE" || e.systemRole === "FREIGHT")).map((e) => ({
	id: e.id,
	code: e.code,
	name: e.name
}));
tf();
var nf = [], rf = [], af = 0, of = /* @__PURE__ */ new Set(), sf = () => {
	af++, of.forEach((e) => e());
}, cf = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function lf(e, t) {
	return {
		action: e,
		actorId: O.current()?.userId ?? "local-test",
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...t ? { reason: t } : {}
	};
}
function uf(e) {
	for (let t of e) if (t.taxAmount) for (let [e, n] of [[t.taxCollectedAccountId, "LIABILITY"], [t.taxPaidAccountId, "ASSET"]]) {
		if (!e) continue;
		let t = P.requireById(e);
		if (!t.active || t.type !== n) throw Error("A snapshotted tax posting account is no longer active or has the wrong type.");
	}
}
function df(e) {
	let t = P.requireById(e);
	if (!t.active || t.type !== "EXPENSE" || !t.allowManualPosting || t.systemRole && t.systemRole !== "OPERATING_EXPENSE" && t.systemRole !== "FREIGHT") throw Error("Use an active manual expense account, not an inventory, GRNI or control account.");
	return t;
}
function ff(e) {
	let t = e.payload;
	if (t.kind === "EXPENSE") {
		let n = vn.getById(t.supplierId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active supplier.");
		for (let t of e.lines) df(t.expenseAccountId);
	} else {
		let n = W.getById(t.customerId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active customer.");
		for (let t of e.lines) rn(t.productId, t.unitId, t.quantity, "sell");
	}
	uf(e.lines);
}
function pf(e) {
	if (w(e.documentDate, "Document date"), e.dueDate && (w(e.dueDate, "Due date"), e.dueDate < e.documentDate)) throw Error("Due date cannot precede document date.");
	if (e.kind !== "ORDER" && !e.dueDate) throw Error("Due date is required.");
	let t = e.kind === "EXPENSE" ? void 0 : oc(e.documentDate, e.pricingAt, e.pricingTimezone), n = e.kind === "EXPENSE" ? e.lines.map((e) => {
		df(e.accountId);
		let t = r(e.taxCode), n = De(e.unitCost, t.taxRate, e.priceBasis), i = cf(e.quantity * n), a = (e.priceBasis ?? C().basis) === "Inclusive" ? cf(e.quantity * e.unitCost - i) : cf(i * t.taxRate);
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
			lineTotal: cf(i + a)
		};
	}) : e.lines.map((n) => Ll({
		customerId: e.customerId,
		documentDate: e.documentDate,
		pricingContext: t,
		draft: n
	})), i = Il(n);
	if (i.total <= 0 || !Number.isFinite(i.total)) throw Error("Document total must be finite and greater than zero.");
	return {
		lines: n,
		totals: i
	};
}
function mf(t) {
	let n = () => t === "sales" ? nf : rf;
	function r(e) {
		return t === "sales" ? nf = [...nf.filter((t) => t.id !== e.id), e] : rf = [...rf.filter((t) => t.id !== e.id), e], sf(), e;
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
			history: [...e.history, lf(t, i)]
		});
	}
	let s = (e, t) => gf.save({
		operationId: e,
		payload: t
	});
	return {
		getAll: () => le(n()),
		reviewCapture(e) {
			if (O.require("purchases.bill"), t !== "expense") throw Error("Capture is only available for expense bills.");
			return ef(Qd.parse(e));
		},
		capture(e) {
			if (O.require("purchases.bill"), t !== "expense") throw Error("Capture is only available for expense bills.");
			let r = Qd.parse(e);
			if (!r.reviewed) throw Error("Confirm that the supplier document has been reviewed.");
			let i = $d(r);
			if (n().find((e) => e.operationId === r.operationId)) return s(r.operationId, i);
			let a = ef(r);
			if (!a.matches) throw Error(a.issues.join(" "));
			return s(r.operationId, i);
		},
		save(o) {
			let s = e({
				operationId: Y,
				id: Y.optional(),
				expectedRevision: f().int().positive().optional(),
				payload: t === "sales" ? Jd : Yd
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
				let e = l?.payload.kind === "EXPENSE" ? void 0 : l?.payload, t = e && e.documentDate === s.payload.documentDate && (!s.payload.pricingAt || s.payload.pricingAt === e.pricingAt), n = oc(s.payload.documentDate, s.payload.pricingAt ?? (t ? e.pricingAt : void 0), t ? e.pricingTimezone : C().timezone);
				s.payload = {
					...s.payload,
					...n
				};
			}
			let u = s.payload.kind === "EXPENSE" ? l ? l.purchaseDefaults : pt(vn.getById(s.payload.supplierId)) : void 0;
			s.payload.kind === "EXPENSE" && !s.payload.dueDate && (s.payload = {
				...s.payload,
				dueDate: ht(s.payload.documentDate, u ?? { termsDays: 30 })
			});
			let d = pf(s.payload), p = (/* @__PURE__ */ new Date()).toISOString(), m = {
				purchaseDefaults: u,
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
						quantity: d.lines[t].quantity
					}))
				},
				recipient: s.payload.kind === "EXPENSE" ? void 0 : jc(s.payload.customerId, s.payload),
				...d,
				createdAt: l?.createdAt ?? p,
				updatedAt: p,
				history: [...l?.history ?? [], lf(l ? "Edited" : "Created")]
			};
			if (l && l.kind !== m.kind) throw Error("Document kind cannot change.");
			return ff(m), r(m);
		},
		approve(e, t) {
			let n = i(e);
			if (n.status === "APPROVED" && n.revision === t + 1) return n;
			if (a(n, t), n.status !== "DRAFT") throw Error("Only a draft can be approved.");
			return ff(n), o(n, "Approved", { status: "APPROVED" });
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
			M(), rr(n.payload.documentDate), ff(n);
			let r, s = n.payload;
			if (s.kind === "EXPENSE") {
				let e = vn.getById(s.supplierId), t = (/* @__PURE__ */ new Date()).toISOString(), i = {
					id: crypto.randomUUID(),
					managedDraftId: n.id,
					kind: "EXPENSE",
					billNumber: we("BILL", Gi.getAll().map((e) => e.billNumber), s.documentDate.slice(0, 4)),
					supplierInvoiceNumber: s.supplierInvoiceNumber,
					supplierId: e.id,
					supplierCode: e.code,
					supplierName: e.businessName,
					purchaseOrderId: "",
					purchaseOrderNumber: "Expense / service bill",
					billDate: s.documentDate,
					dueDate: s.dueDate,
					purchaseDefaults: structuredClone(n.purchaseDefaults),
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
				Gi.insertExpenseBill(i);
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
						...Wn(i.lines, "paid", !0, i.totals.taxAmount),
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
var hf = mf("sales"), gf = mf("expense"), _f = e({
	purchaseDefaults: dt.optional(),
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
	payload: he([Jd, Yd]),
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
	repository: t === "sales" ? hf : gf,
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
	snapshot: () => t === "sales" ? { drafts: nf } : {
		drafts: rf,
		options: tf()
	},
	restore: (e) => {
		t === "sales" ? nf = e.drafts : (rf = e.drafts, e.options);
	},
	publish: sf,
	validate: (n, r) => {
		let { drafts: i } = e({
			drafts: s(_f),
			...t === "expense" ? { options: s(e({
				id: Y,
				code: Y,
				name: Y
			}).strict()) } : {}
		}).strict().parse(n);
		for (let e of i) {
			if (Mc(e.recipient), e.kind !== e.payload.kind || t === "expense" != (e.kind === "EXPENSE")) throw Error("Draft kind mismatch.");
			if (e.kind !== "EXPENSE" && e.purchaseDefaults) throw Error("Purchase defaults belong to expense bills only.");
			if (e.kind !== "ORDER" && !e.payload.dueDate) throw Error("Saved bill or invoice requires a due date.");
			if (w(e.payload.documentDate), e.payload.dueDate && (w(e.payload.dueDate), e.payload.dueDate < e.payload.documentDate)) throw Error("Draft due date is invalid.");
			let n = r, i = e.payload.kind === "EXPENSE" ? e.payload.supplierId : e.payload.customerId;
			if (!(e.payload.kind === "EXPENSE" ? n.suppliers.suppliers : n.customers.customers).some((e) => e.id === i) || e.lines.length !== e.payload.lines.length) throw Error("Draft party or line references are invalid.");
			for (let [t, r] of e.lines.entries()) {
				let i = e.payload.lines[t], a = r;
				if (e.kind !== "EXPENSE") {
					if (uc(a), sc(a, e.payload.documentDate), e.payload.kind !== "EXPENSE" && (e.payload.pricingAt !== a.pricingAt || e.payload.pricingTimezone !== a.pricingTimezone)) throw Error("Draft pricing context mismatch.");
					if ($t(a, n.products.products.find((e) => e.id === a.productId)), a.requestedArea !== i.requestedArea) throw Error("Draft area requirement mismatch.");
				}
				if (typeof a.quantity != "number" || !Number.isFinite(a.quantity) || a.quantity <= 0 || i.requestedArea === void 0 && a.quantity !== i.quantity || cf(a.lineSubtotal + a.taxAmount) !== a.lineTotal) throw Error("Draft line amounts are invalid.");
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
				if (cf(e.lines.reduce((e, t) => e + t[n], 0)) !== e.totals[t]) throw Error("Draft totals do not match lines.");
			}
			if (e.status === "POSTED") {
				let t = r;
				if (!(e.kind === "EXPENSE" ? t.supplierBills.supplierBills : e.kind === "ORDER" ? t.sales.salesOrders : t.sales.invoices).some((t) => t.id === e.documentId && t.managedDraftId === e.id && t.totals.total === e.totals.total && (e.kind !== "EXPENSE" || t.dueDate === e.payload.dueDate && JSON.stringify(t.purchaseDefaults) === JSON.stringify(e.purchaseDefaults)))) throw Error("Posted draft source reference is invalid.");
			}
		}
	}
});
function vf(e) {
	if ([...nf, ...rf].some((t) => e.has(t.id) && (t.status !== "DRAFT" || t.documentId))) throw Error("Only unposted drafts may be purged.");
	nf = nf.filter((t) => !e.has(t.id)), rf = rf.filter((t) => !e.has(t.id)), sf();
}
//#endregion
//#region src/features/recurring/recurringRepository.ts
var yf = E().trim().min(1).max(200), bf = E().refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), xf = e({
	operationId: yf,
	name: yf,
	sourceDraftId: yf,
	frequency: T(Hd),
	firstDate: bf,
	endDate: bf
}).strict(), Sf = e({
	id: yf,
	expectedRevision: f().int().positive(),
	name: yf,
	endDate: bf
}).strict(), Cf = E().refine((e) => Number.isFinite(Date.parse(e)), "Invalid timestamp."), wf = e({
	id: yf,
	name: yf,
	kind: T(["INVOICE", "EXPENSE"]),
	status: T([
		"Active",
		"Paused",
		"Ended"
	]),
	revision: f().int().positive(),
	operationId: yf,
	creationFingerprint: E().min(1).max(2e3),
	sourceDraftId: yf,
	payload: ye(),
	frequency: T(Hd),
	firstDate: bf,
	nextDate: bf,
	endDate: bf,
	occurrence: f().int().nonnegative(),
	termsDays: f().int().nonnegative(),
	createdAt: Cf,
	updatedAt: Cf
}).strict(), Tf = e({
	id: yf,
	scheduleId: yf,
	date: bf,
	draftId: yf,
	actorId: yf,
	createdAt: Cf
}).strict(), Ef = 0, Df = /* @__PURE__ */ new Set(), Of = () => {
	Ef++, Df.forEach((e) => e());
}, kf = {
	INVOICE: {
		schedules: [],
		runs: []
	},
	EXPENSE: {
		schedules: [],
		runs: []
	}
}, Af = (e) => e === "INVOICE" ? "sales.manage" : "purchases.bill", jf = (e) => e === "INVOICE" ? hf : gf, Mf = () => (/* @__PURE__ */ new Date()).toISOString();
function Nf(e) {
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
function Pf(t) {
	let n = () => kf[t], r = (e) => {
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
			O.require(Af(t));
			let r = xf.parse(e), i = JSON.stringify(r), a = n().schedules.find((e) => e.operationId === r.operationId);
			if (a) {
				if (a.creationFingerprint !== i) throw Error("Operation ID was used for a different recurring template.");
				return a;
			}
			let o = jf(t).getAll().find((e) => e.id === r.sourceDraftId);
			if (!o || o.kind !== t || o.status === "CANCELLED") throw Error("Select an existing invoice or expense entry draft of the correct type.");
			if (r.endDate < r.firstDate) throw Error("End date must not precede first generation date.");
			let s = Nf(o), c = Math.round((Date.parse(s.dueDate + "T00:00:00Z") - Date.parse(s.documentDate + "T00:00:00Z")) / 864e5), l = Mf(), u = {
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
			return n().schedules = [...n().schedules, u], Of(), u;
		},
		update(e) {
			O.require(Af(t));
			let a = Sf.parse(e), o = r(a.id);
			if (i(o, a.expectedRevision), a.endDate < o.firstDate || o.occurrence && a.endDate < n().runs.filter((e) => e.scheduleId === o.id).map((e) => e.date).sort().at(-1)) throw Error("End date cannot precede the schedule start or its last generated occurrence.");
			let s = {
				...o,
				name: a.name,
				endDate: a.endDate,
				status: o.nextDate > a.endDate ? "Ended" : o.status === "Ended" ? "Paused" : o.status,
				revision: o.revision + 1,
				updatedAt: Mf()
			};
			return n().schedules = n().schedules.map((e) => e.id === o.id ? s : e), Of(), s;
		},
		setStatus(a) {
			O.require(Af(t));
			let o = e({
				id: yf,
				expectedRevision: f().int().positive(),
				status: T(["Active", "Paused"])
			}).strict().parse(a), s = r(o.id);
			if (i(s, o.expectedRevision), s.nextDate > s.endDate) throw Error("Extend the end date before resuming this ended schedule.");
			let c = {
				...s,
				status: o.status,
				revision: s.revision + 1,
				updatedAt: Mf()
			};
			return n().schedules = n().schedules.map((e) => e.id === s.id ? c : e), Of(), c;
		},
		generate(a) {
			O.require(Af(t));
			let o = e({
				id: yf,
				expectedRevision: f().int().positive(),
				date: bf
			}).strict().parse(a), s = r(o.id), c = n().runs.find((e) => e.scheduleId === s.id && e.date === o.date);
			if (c) return {
				schedule: s,
				run: c,
				draft: jf(t).getAll().find((e) => e.id === c.draftId)
			};
			if (i(s, o.expectedRevision), s.status !== "Active") throw Error("Activate the schedule before generating.");
			if (o.date !== s.nextDate) throw Error("Generate the next occurrence in order.");
			if (o.date > ve(Mf())) throw Error("This occurrence is not due yet.");
			if (o.date > s.endDate) throw Error("The schedule has ended.");
			let l = Ud(s.firstDate, s.frequency, s.occurrence + 1), u = structuredClone(s.payload);
			u.documentDate = o.date, u.kind !== "EXPENSE" && (delete u.pricingAt, delete u.pricingTimezone), u.dueDate = Wd(o.date, s.termsDays), u.kind === "EXPENSE" && (u.supplierInvoiceNumber = u.supplierInvoiceNumber.slice(0, 170) + " [" + o.date + "]");
			let d = jf(t).save({
				operationId: "recurring:" + s.id + ":" + o.date,
				payload: u
			}), p = Mf(), m = {
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
			return n().schedules = n().schedules.map((e) => e.id === s.id ? h : e), n().runs = [...n().runs, m], Of(), {
				schedule: h,
				run: m,
				draft: d
			};
		}
	};
}
var Ff = Pf("INVOICE"), If = Pf("EXPENSE");
for (let t of ["INVOICE", "EXPENSE"]) i(t === "INVOICE" ? "recurringInvoices" : "recurringExpenses", {
	repository: t === "INVOICE" ? Ff : If,
	read: t === "INVOICE" ? "sales.read" : "purchases.read",
	commands: {
		create: Af(t),
		update: Af(t),
		setStatus: Af(t),
		generate: Af(t)
	},
	snapshot: () => structuredClone(kf[t]),
	restore: (e) => {
		kf[t] = e;
	},
	publish: Of,
	validate: (n, r) => {
		e({
			schedules: s(wf),
			runs: s(Tf)
		}).strict().parse(n);
		let i = n, a = r;
		for (let e of i.schedules) {
			if (e.kind !== t || ![
				"Active",
				"Paused",
				"Ended"
			].includes(e.status) || !Number.isSafeInteger(e.revision) || e.revision < 1 || !Number.isSafeInteger(e.occurrence) || e.occurrence < 0 || !Number.isInteger(e.termsDays) || e.termsDays < 0 || e.payload.kind !== t) throw Error("Invalid recurring schedule.");
			if (xf.parse({
				operationId: e.operationId,
				name: e.name,
				sourceDraftId: e.sourceDraftId,
				frequency: e.frequency,
				firstDate: e.firstDate,
				endDate: e.endDate
			}), Xd(e.payload), !e.id || !e.creationFingerprint || !Number.isFinite(Date.parse(e.createdAt)) || !Number.isFinite(Date.parse(e.updatedAt))) throw Error("Invalid recurring identity or audit timestamps.");
			if (w(e.payload.documentDate), w(e.payload.dueDate), e.payload.dueDate < e.payload.documentDate || e.termsDays !== Math.round((Date.parse(e.payload.dueDate + "T00:00:00Z") - Date.parse(e.payload.documentDate + "T00:00:00Z")) / 864e5)) throw Error("Invalid recurring payment terms.");
			if (e.payload.kind === "EXPENSE") {
				if (!a.suppliers.suppliers.some((t) => t.id === e.payload.supplierId) || e.payload.lines.some((e) => !a.accounts.accounts.some((t) => t.id === e.accountId && t.type === "EXPENSE"))) throw Error("Recurring expense references are invalid.");
			} else if (!a.customers.customers.some((t) => t.id === e.payload.customerId) || e.payload.lines.some((e) => !a.products.products.some((t) => t.id === e.productId && t.units.some((t) => t.id === e.unitId)))) throw Error("Recurring invoice references are invalid.");
			if (e.status === "Ended" != e.nextDate > e.endDate) throw Error("Recurring end status is inconsistent.");
			if (e.nextDate !== Ud(e.firstDate, e.frequency, e.occurrence) || e.endDate < e.firstDate) throw Error("Invalid recurring dates.");
			let n = (t === "INVOICE" ? a.managedSalesDocuments : a.expenseBillDrafts).drafts.find((t) => t.id === e.sourceDraftId);
			if (!n || n.kind !== t) throw Error("Recurring template source is missing.");
			let r = i.runs.filter((t) => t.scheduleId === e.id);
			if (r.length !== e.occurrence || new Set(r.map((e) => e.date)).size !== r.length) throw Error("Recurring run history does not match schedule.");
			for (let t = 0; t < r.length; t++) if (!r.some((n) => n.date === Ud(e.firstDate, e.frequency, t))) throw Error("Recurring occurrences are incomplete.");
		}
		for (let e of i.runs) {
			let n = i.schedules.find((t) => t.id === e.scheduleId), r = (t === "INVOICE" ? a.managedSalesDocuments : a.expenseBillDrafts).drafts.find((t) => t.id === e.draftId);
			if (!n || !r || r.kind !== t || r.operationId !== "recurring:" + n.id + ":" + e.date || !e.actorId || !Number.isFinite(Date.parse(e.createdAt))) throw Error("Invalid recurring generated-draft reference.");
		}
	}
});
//#endregion
//#region src/features/banking/data/bankTransactionRepository.ts
var Lf = /* @__PURE__ */ new Set(), Rf = k.read().transactions, zf = k.read().transfers;
k.onRollback(() => {
	let e = k.read();
	Rf = e.transactions, zf = e.transfers;
});
function Bf() {
	Lf.forEach((e) => k.notify(e));
}
function Vf(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function Hf(e) {
	return e?.trim() || void 0;
}
function Uf(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function Wf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Gf(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Kf(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var qf = {
	subscribe(e) {
		return Lf.add(e), () => {
			Lf.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return Rf;
	},
	getTransfersSnapshot() {
		return zf;
	},
	getTransactions() {
		return Rf;
	},
	getTransfers() {
		return zf;
	},
	createTransaction(e, t) {
		if (Uf(e.transactionDate), w(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = Wf(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Vf(e.description, "Description"), i = I.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let a = P.requireById(i.glAccountId);
		if (!a.active) throw Error("The selected bank GL account is inactive.");
		let o = P.requireById(e.offsetAccountId);
		if (!o.active) throw Error("The offset account is inactive.");
		if (!o.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (o.id === a.id) throw Error("Bank and offset accounts must be different.");
		if (I.getByGlAccountId(o.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let s = Gf("banktxn"), c = Kf("BTXN", e.transactionDate, Rf.length + 1), l = t?.trim();
		if (t !== void 0 && !l) throw Error("Operation ID cannot be empty");
		if (l) {
			let t = A.begin(l, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Rf.find((e) => e.id === t.operation.resultId);
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
				reference: Hf(e.reference),
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
				reference: Hf(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [u, ...Rf];
			if (k.update("transactions", d), Rf = d, Bf(), l) {
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
		Uf(e.transferDate), w(e.transferDate, "Transfer date");
		let n = Wf(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Vf(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = I.requireById(e.fromBankAccountId), a = I.requireById(e.toBankAccountId);
		if (!i.active || !a.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== a.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < a.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let o = P.requireById(i.glAccountId), s = P.requireById(a.glAccountId);
		if (!o.active || !s.active) throw Error("Both bank GL accounts must be active.");
		if (o.id === s.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let c = Gf("banktrf"), l = Kf("BTRF", e.transferDate, zf.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = A.begin(u, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = zf.find((e) => e.id === t.operation.resultId);
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
				reference: Hf(e.reference),
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
				reference: Hf(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [d, ...zf];
			if (k.update("transfers", f), zf = f, Bf(), u) {
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
}, Jf = qf.createTransaction;
qf.createTransaction = function(e, t) {
	M();
	let n;
	try {
		return n = k.transaction(() => Jf.call(qf, e, t)), t && A.complete(t.trim(), n.id), n;
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
var Yf = qf.createTransfer;
qf.createTransfer = function(e, t) {
	M();
	let n;
	try {
		return n = k.transaction(() => Yf.call(qf, e, t)), t && A.complete(t.trim(), n.id), n;
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
function Xf(e) {
	if (Rf.some((t) => t.id === e.id) || zf.some((t) => t.id === e.id)) throw Error("Bank result already exists; restoration cannot duplicate it.");
	"transactionNumber" in e ? (Rf = [structuredClone(e), ...Rf], k.update("transactions", Rf)) : (zf = [structuredClone(e), ...zf], k.update("transfers", zf)), Bf();
}
function Zf(e, t, n) {
	if ([...Rf, ...zf].filter((n) => n.id === e && n.journalEntryId === t).length !== 1) throw Error("Bank result changed before journal repair.");
	Rf = Rf.map((t) => t.id === e ? {
		...t,
		journalEntryId: n
	} : t), zf = zf.map((t) => t.id === e ? {
		...t,
		journalEntryId: n
	} : t), k.update("transactions", Rf), k.update("transfers", zf), Bf();
}
i("bankTransactions", {
	repository: qf,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: Rf,
		bankTransfers: zf
	}),
	restore: (e) => {
		Rf = e.bankTransactions, zf = e.bankTransfers;
	},
	publish: () => Lf.forEach((e) => e())
});
//#endregion
//#region src/features/recurring/recurringBankRepository.ts
var Qf = E().trim().min(1).max(200), $f = E().refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}), ep = Me(), tp = e({
	bankAccountId: Qf,
	direction: T(["MONEY_IN", "MONEY_OUT"]),
	amount: f().finite().positive().max(0xe8d4a51000).refine((e) => e === Math.round(e * 100) / 100, "Use whole cents."),
	offsetAccountId: Qf,
	description: Qf,
	reference: E().trim().max(200).optional().transform((e) => e || void 0)
}).strict(), np = e({
	operationId: Qf,
	name: Qf,
	payload: tp,
	frequency: T(Hd),
	firstDate: $f,
	endDate: $f
}).strict(), rp = np.extend({
	id: Qf,
	kind: b("BANK"),
	creationFingerprint: E(),
	status: T([
		"Active",
		"Paused",
		"Ended"
	]),
	revision: f().int().positive(),
	nextDate: $f,
	occurrence: f().int().nonnegative(),
	createdAt: ep,
	updatedAt: ep
}), ip = e({
	id: Qf,
	action: T([
		"Generated",
		"Approved",
		"Posted",
		"Cancelled"
	]),
	actorId: Qf,
	at: ep,
	reason: E().trim().min(3).max(2e3).optional()
}).strict(), ap = e({
	id: Qf,
	scheduleId: Qf,
	date: $f,
	payload: tp,
	status: T([
		"DRAFT",
		"APPROVED",
		"POSTED",
		"CANCELLED"
	]),
	revision: f().int().positive(),
	actorId: Qf,
	createdAt: ep,
	updatedAt: ep,
	approvedBy: Qf.optional(),
	transactionId: Qf.optional(),
	reason: E().max(2e3).optional(),
	history: s(ip).min(1)
}).strict(), op = [], sp = [], cp = 0, lp = /* @__PURE__ */ new Set(), up = () => {
	cp++, lp.forEach((e) => e());
};
function dp(e) {
	let t = I.requireById(e.bankAccountId), n = P.requireById(t.glAccountId), r = P.requireById(e.offsetAccountId);
	if (!t.active || !n.active || !r.active || !r.allowManualPosting || I.getByGlAccountId(r.id) || r.systemRole && !["OPERATING_EXPENSE", "FREIGHT"].includes(r.systemRole)) throw Error("Use an active bank and an eligible manual offset account; control accounts require their source workflow.");
}
function fp(e) {
	let t = op.find((t) => t.id === e);
	if (!t) throw Error("Recurring bank schedule not found.");
	return t;
}
function pp(e, t) {
	if (e.revision !== t) throw Error("Recurring bank record changed. Refresh first.");
}
var mp = e({
	id: Qf,
	expectedRevision: f().int().positive()
}).strict(), hp = {
	getAll: () => op,
	getDrafts: () => sp,
	create(e) {
		O.require("banking.write");
		let t = np.parse(e), n = JSON.stringify(t), r = op.find((e) => e.operationId === t.operationId);
		if (r) {
			if (r.creationFingerprint !== n) throw Error("Operation ID has different bank template data.");
			return r;
		}
		if (dp(t.payload), t.endDate < t.firstDate) throw Error("End date precedes first date.");
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
		return op = [...op, a], up(), a;
	},
	update(e) {
		O.require("banking.write");
		let t = mp.extend({
			name: Qf,
			endDate: $f
		}).parse(e), n = fp(t.id);
		if (pp(n, t.expectedRevision), t.endDate < n.firstDate || sp.some((e) => e.scheduleId === n.id && e.date > t.endDate)) throw Error("End date cannot precede existing occurrences.");
		let r = {
			...n,
			name: t.name,
			endDate: t.endDate,
			status: n.nextDate > t.endDate ? "Ended" : n.status === "Ended" ? "Paused" : n.status,
			revision: n.revision + 1,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return op = op.map((e) => e.id === n.id ? r : e), up(), r;
	},
	setStatus(e) {
		O.require("banking.write");
		let t = mp.extend({ status: T(["Active", "Paused"]) }).parse(e), n = fp(t.id);
		if (pp(n, t.expectedRevision), n.nextDate > n.endDate) throw Error("Extend the schedule before resuming.");
		let r = {
			...n,
			status: t.status,
			revision: n.revision + 1,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return op = op.map((e) => e.id === n.id ? r : e), up(), r;
	},
	generate(e) {
		let t = O.require("banking.write"), n = mp.extend({ date: $f }).parse(e), r = fp(n.id), i = sp.find((e) => e.scheduleId === r.id && e.date === n.date);
		if (i) return {
			schedule: r,
			draft: i
		};
		if (pp(r, n.expectedRevision), r.status !== "Active" || n.date !== r.nextDate || n.date > r.endDate || n.date > ve((/* @__PURE__ */ new Date()).toISOString())) throw Error("Generate an active due bank occurrence in order.");
		dp(r.payload);
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
		}, c = Ud(r.firstDate, r.frequency, r.occurrence + 1), l = {
			...r,
			nextDate: c,
			occurrence: r.occurrence + 1,
			status: c > r.endDate ? "Ended" : "Active",
			revision: r.revision + 1,
			updatedAt: o
		};
		return sp = [...sp, s], op = op.map((e) => e.id === r.id ? l : e), up(), {
			schedule: l,
			draft: s
		};
	},
	review(e) {
		let t = O.require("banking.write"), n = mp.extend({
			action: T([
				"Approve",
				"Post",
				"Cancel"
			]),
			reason: E().trim().min(3).max(2e3)
		}).parse(e), r = sp.find((e) => e.id === n.id);
		if (!r) throw Error("Recurring bank draft not found.");
		if (n.action === "Post" && r.status === "POSTED") return r;
		pp(r, n.expectedRevision);
		let i;
		if (n.action === "Approve") {
			if (r.status !== "DRAFT") throw Error("Only draft bank occurrences can be approved.");
			dp(r.payload), i = {
				...r,
				status: "APPROVED",
				approvedBy: t.userId
			};
		} else if (n.action === "Post") {
			if (O.require("accounting.post"), r.status !== "APPROVED") throw Error("Review and approve the bank draft before posting.");
			dp(r.payload), rr(r.date);
			let e = qf.createTransaction({
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
		}, sp = sp.map((e) => e.id === i.id ? i : e), up(), i;
	}
};
i("recurringBank", {
	repository: hp,
	read: "banking.read",
	commands: {
		create: "banking.write",
		update: "banking.write",
		setStatus: "banking.write",
		generate: "banking.write",
		review: "banking.write"
	},
	snapshot: () => ({
		schedules: op,
		drafts: sp
	}),
	restore: (e) => {
		op = e.schedules, sp = e.drafts;
	},
	publish: up,
	validate: (t, n) => {
		let r = e({
			schedules: s(rp),
			drafts: s(ap)
		}).strict().parse(t), i = n;
		if (new Set(r.schedules.map((e) => e.operationId)).size !== r.schedules.length) throw Error("Duplicate recurring bank creation request.");
		for (let e of r.schedules) {
			let t = r.drafts.filter((t) => t.scheduleId === e.id);
			if (e.nextDate !== Ud(e.firstDate, e.frequency, e.occurrence) || e.endDate < e.firstDate || e.status === "Ended" != e.nextDate > e.endDate || t.length !== e.occurrence || new Set(t.map((e) => e.date)).size !== t.length || !i.bankAccounts.bankAccounts.some((t) => t.id === e.payload.bankAccountId) || !i.accounts.accounts.some((t) => t.id === e.payload.offsetAccountId)) throw Error("Invalid recurring bank schedule or references.");
			for (let n = 0; n < t.length; n++) if (!t.some((t) => t.date === Ud(e.firstDate, e.frequency, n))) throw Error("Missing recurring bank occurrence.");
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
var gp = [
	"INVOICE",
	"EXPENSE",
	"BANK"
], _p = (e) => e === "INVOICE" ? "sales.manage" : e === "EXPENSE" ? "purchases.bill" : "banking.write", vp = (e) => e === "INVOICE" ? "sales.read" : e === "EXPENSE" ? "purchases.read" : "banking.read", yp = E().trim().min(1).max(200), bp = T(gp), xp = Me(), Sp = E().refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}), Cp = e({
	id: bp,
	enabled: y(),
	revision: f().int().positive(),
	actorId: yp,
	updatedAt: xp
}).strict(), wp = e({
	id: yp,
	status: T([
		"FAILED",
		"RETRY",
		"RESOLVED"
	]),
	actorId: yp,
	at: xp,
	reason: E().min(1).max(2e3)
}).strict(), Tp = e({
	id: yp,
	kind: bp,
	scheduleId: yp,
	date: Sp,
	status: T([
		"FAILED",
		"RETRY",
		"RESOLVED"
	]),
	revision: f().int().positive(),
	attempts: f().int().positive(),
	error: E().min(1).max(2e3),
	actorId: yp,
	updatedAt: xp,
	draftId: yp.optional(),
	history: s(wp).min(1)
}).strict(), Ep = [], Dp = [], Op = 0, kp = /* @__PURE__ */ new Set(), Ap = () => {
	Op++, kp.forEach((e) => e());
}, jp = (e) => e === "INVOICE" ? Ff : e === "EXPENSE" ? If : hp, Mp = () => gp.flatMap((e) => jp(e).getAll().map((t) => ({
	...t,
	kind: e
})));
function Np(e) {
	let t = ve((/* @__PURE__ */ new Date()).toISOString());
	return Mp().filter((n) => g(e, _p(n.kind)) && Ep.some((e) => e.id === n.kind && e.enabled) && n.status === "Active" && n.nextDate <= t && n.nextDate <= n.endDate && !Dp.some((e) => e.kind === n.kind && e.scheduleId === n.id && e.date === n.nextDate && e.status === "FAILED")).sort((e, t) => e.nextDate.localeCompare(t.nextDate) || e.kind.localeCompare(t.kind) || e.id.localeCompare(t.id));
}
var Pp = /* @__PURE__ */ new Map();
function Fp(e, t, n, r) {
	let i = O.require(_p(e)), a = crypto.randomUUID();
	return Pp.set(a, {
		kind: e,
		scheduleId: t,
		date: n,
		error: r.slice(0, 2e3) || "Generation failed.",
		actor: i.userId
	}), a;
}
function Ip() {
	Dp = Dp.map((e) => {
		if (e.status === "RESOLVED") return e;
		let t = jp(e.kind), n = e.kind === "BANK" ? hp.getDrafts().find((t) => t.scheduleId === e.scheduleId && t.date === e.date) : "getRuns" in t ? t.getRuns().find((t) => t.scheduleId === e.scheduleId && t.date === e.date) : void 0;
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
				due: Np(e).length,
				limit: 20
			};
		},
		configure(t) {
			let n = e({
				kind: bp,
				enabled: y(),
				expectedRevision: f().int().nonnegative()
			}).strict().parse(t), r = O.require(_p(n.kind)), i = Ep.find((e) => e.id === n.kind);
			if ((i?.revision ?? 0) !== n.expectedRevision) throw Error("Automation policy changed. Refresh first.");
			let a = {
				id: n.kind,
				enabled: n.enabled,
				revision: (i?.revision ?? 0) + 1,
				actorId: r.userId,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			return Ep = [...Ep.filter((e) => e.id !== n.kind), a], Ap(), a;
		},
		execute(t) {
			let n = e({
				kind: bp,
				id: yp,
				expectedRevision: f().int().positive(),
				date: Sp
			}).strict().parse(t);
			O.require(_p(n.kind));
			let r = jp(n.kind).generate({
				id: n.id,
				expectedRevision: n.expectedRevision,
				date: n.date
			});
			return Ip(), Ap(), r;
		},
		recordFailure(t) {
			let n = e({ ticket: yp }).strict().parse(t), r = Pp.get(n.ticket);
			if (Pp.delete(n.ticket), !r) throw Error("Only a trusted failed desktop attempt can enter the error queue.");
			let i = O.require(_p(r.kind));
			if (i.userId !== r.actor) throw Error("Failure actor changed.");
			let a = jp(r.kind).getAll().find((e) => e.id === r.scheduleId);
			if (!a || a.nextDate !== r.date) throw Error("Failed occurrence is no longer current.");
			let o = Dp.find((e) => e.kind === r.kind && e.scheduleId === r.scheduleId && e.date === r.date), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
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
			return Dp = [...Dp.filter((e) => e.id !== c.id), c], Ap(), c;
		},
		retry(t) {
			let n = e({
				id: yp,
				expectedRevision: f().int().positive(),
				reason: E().trim().min(3).max(2e3)
			}).strict().parse(t), r = Dp.find((e) => e.id === n.id);
			if (!r) throw Error("Recurring error not found.");
			let i = O.require(_p(r.kind));
			if (r.revision !== n.expectedRevision || r.status !== "FAILED") throw Error("Error queue changed. Refresh first.");
			Ip();
			let a = Dp.find((e) => e.id === r.id);
			if (a.status === "RESOLVED") return Ap(), a;
			let o = jp(r.kind).getAll().find((e) => e.id === r.scheduleId);
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
			return Dp = Dp.map((e) => e.id === c.id ? c : e), Ap(), c;
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
		policies: Ep,
		tasks: Dp
	}),
	restore: (e) => {
		Ep = e.policies, Dp = e.tasks;
	},
	publish: Ap,
	view: (e) => ({
		policies: Ep.filter((t) => g(e, vp(t.id))),
		tasks: Dp.filter((t) => g(e, vp(t.kind)))
	}),
	validate: (t, n) => {
		let r = e({
			policies: s(Cp),
			tasks: s(Tp)
		}).strict().parse(t), i = n;
		if (new Set(r.policies.map((e) => e.id)).size !== r.policies.length || new Set(r.tasks.map((e) => e.kind + ":" + e.scheduleId + ":" + e.date)).size !== r.tasks.length) throw Error("Duplicate recurring automation identity.");
		for (let e of r.tasks) {
			let t = i[e.kind === "INVOICE" ? "recurringInvoices" : e.kind === "EXPENSE" ? "recurringExpenses" : "recurringBank"], n = t.schedules.find((t) => t.id === e.scheduleId), r = e.history.at(-1), a = n && ["Monthly", "Quarterly"].includes(n.frequency), o = (n ? a ? (Number(e.date.slice(0, 4)) - Number(n.firstDate.slice(0, 4))) * 12 + Number(e.date.slice(5, 7)) - Number(n.firstDate.slice(5, 7)) : (Date.parse(e.date + "T00:00:00Z") - Date.parse(n.firstDate + "T00:00:00Z")) / 864e5 : NaN) / (a ? n.frequency === "Monthly" ? 1 : 3 : n?.frequency === "Weekly" ? 7 : 14);
			if (!n || !Number.isSafeInteger(o) || o < 0 || Ud(n.firstDate, n.frequency, o) !== e.date || e.date < n.firstDate || r.status !== e.status || r.actorId !== e.actorId || r.at !== e.updatedAt || e.revision !== e.history.length || e.attempts !== e.history.filter((e) => e.status === "FAILED").length || e.history[0].status !== "FAILED" || new Set(e.history.map((e) => e.id)).size !== e.history.length) throw Error("Invalid recurring error evidence.");
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
function Lp(e) {
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
var Rp = (e) => Math.round(e * 100);
function zp(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + Rp(t.amount), 0), s = a.reduce((e, t) => e + Rp(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (Rp(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), Rp(t.amountDue) !== Math.max(0, Rp(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > Rp(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + Rp(t.amount), 0);
		Rp(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || Rp(t.amountAvailable) !== 0 : Rp(t.amountAvailable) !== Rp(t.totals.total) - a - Rp(t.amountRefunded ?? 0)) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
function Bp(e) {
	let n = A.list(), r = n.find((t) => t.operationId === e), i = [];
	if (!r || r.kind !== "BANK_RECONCILIATION" || r.state !== "MANUAL_REVIEW") return ["Operation is not an unresolved bank reconciliation review."];
	if (!r.resultId) return ["Operation has no durable bound result; cannot infer clearing."];
	r.reviewHistory?.length || i.push("Operator reconciliation evidence is missing.");
	let a = nc.getAll(), o = a.filter((e) => e.id === r.resultId);
	if (o.length !== 1) return [...i, "Completed reconciliation result is missing or duplicated."];
	let s = o[0], c = I.getById(s.bankAccountId), l = F.getAll();
	if (!c) return [...i, "Reconciliation bank account is missing."];
	let u = (e) => JSON.stringify([...e].sort()), d = (e) => Math.round((e + 2 ** -52) * 100) / 100, f = a.filter((e) => e.bankAccountId === c.id && e.statementDate <= s.statementDate), p = t().bankStatements?.lines ?? [];
	try {
		i.push(...qs({
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
var Vp = (e) => e === "BANK_TRANSACTION" || e === "BANK_TRANSFER";
function Hp(e, t, n = !0) {
	let r = A.list(), i = r.filter((t) => t.operationId === e);
	if (i.length !== 1) return ["Bank operation identity is missing or duplicated."];
	let a = i[0], o = [];
	if ((!Vp(a.kind) || (n ? a.state !== "MANUAL_REVIEW" : a.state === "COMPLETED")) && o.push("Operation is not an unresolved bank review."), a.resultId || o.push("Operation has no durable bound result; cannot infer effects."), n && !a.reviewHistory?.length && o.push("Operator reconciliation evidence is missing."), o.length) return o;
	let s = t?.transactions ?? qf.getTransactions(), c = t?.transfers ?? qf.getTransfers(), l = t?.journals ?? F.getAll(), u = a.kind === "BANK_TRANSACTION" ? s : c;
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
function Up(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= Kp(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: qp(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => Wp(e, r)), a = qp(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && Gp(t, r)), s = qp(o.reduce((e, t) => e + t.amount, 0)), c = qp(e.totals.total), l = qp(Math.max(0, c - a - s));
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
function Wp(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Kp(e.reversedAt) : !1;
}
function Gp(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Kp(e.reversedAt) : !1;
}
function Kp(e) {
	return ve(e);
}
function qp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function Jp(e, t, n) {
	let r = Zp(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= Xp(e.voidedAt)) return Yp(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && Gp(t, n)), a = Zp(i.reduce((e, t) => e + t.amount, 0)), o = Zp(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - a));
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
function Yp(e, t, n) {
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
function Xp(e) {
	return ve(e);
}
function Zp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function Qp(e, t, n = [], r = [], i = [], a = tm()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = Up(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = $p(e.dueDate, a);
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
		current: nm(s.current),
		days1To30: nm(s.days1To30),
		days31To60: nm(s.days31To60),
		days61To90: nm(s.days61To90),
		days90Plus: nm(s.days90Plus)
	}, p = nm(c), m = nm(l), h = nm(i.reduce((t, n) => n.customerId === e.id ? t + Jp(n, r, a).amountAvailable : t, 0)), g = nm(p - h);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: h,
		netAccountBalance: g,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: nm(Math.max(0, e.creditLimit - Math.max(0, g))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function $p(e, t = tm()) {
	let n = em(e), r = em(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function em(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function tm() {
	return ve((/* @__PURE__ */ new Date()).toISOString());
}
function nm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function rm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function im(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function am(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? rm(t - n) : rm(n - t);
}
function om(e, t, n) {
	im(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = rm(t + r.debit), n = rm(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: am(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = rm(r.reduce((e, t) => e + t.totalDebit, 0)), o = rm(r.reduce((e, t) => e + t.totalCredit, 0));
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
function sm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function cm({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = Qp(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: sm(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = sm(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = sm(om(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = sm(l - d);
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
function lm(e) {
	return Lp({
		transactions: e?.transactions ?? qf.getTransactions(),
		transfers: e?.transfers ?? qf.getTransfers(),
		payments: Wl.getAll(),
		journals: e?.journals ?? F.getAll(),
		invoices: K.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: G.getAll(),
		supplierBills: Gi.getAll(),
		supplierPayments: Qi.getAll(),
		supplierCredits: J.getAll()
	});
}
//#endregion
//#region src/features/sales/data/salesRecoveryInspection.ts
var um = {
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
function dm(e) {
	return zp(e).map((e) => ({
		...e,
		action: um[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var fm = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function pm(e, t) {
	let n = dm(e).map((e) => ({ ...e })), r = t.filter((e) => fm.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => fm.has(e.kind))) s.has(e.operationId) && n.push({
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
function mm() {
	let e = K.getAll();
	return pm({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Wl.getAll(),
		creditNotes: G.getAll(),
		allocations: G.getAllAllocations(),
		journals: F.getAll()
	}, A.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
function hm(e) {
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
var gm = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function _m(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!gm.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = pm(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function vm() {
	let e = K.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Wl.getAll(),
		creditNotes: G.getAll(),
		allocations: G.getAllAllocations(),
		journals: F.getAll()
	};
}
function ym(e) {
	let n = [], r = vm(), i = A.list().find((t) => t.operationId === e), a = r.payments.find((e) => e.id === i?.resultId), o = (e) => Math.round(e * 100), s = (e) => {
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
		].sort().at(-1) ?? "1970-01-01", t = cm({
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
function bm(e) {
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
	if (!n || !e.expectedRevision || hm(n) !== e.expectedRevision) throw Error("Recovery evidence changed. Refresh and review before approval.");
	let r = n.kind === "BANK_RECONCILIATION" ? Bp(e.operationId) : Vp(n.kind) ? Hp(e.operationId) : _m(vm(), t, e.operationId);
	n.kind !== "BANK_RECONCILIATION" && !Vp(n.kind) && r.push(...ym(e.operationId));
	let i = lm();
	if (i.length && r.push("Financial consistency checks failed: " + i.map((e) => e.code).join(", ")), r.length) throw Error(`Financial recovery remains blocked: ${r.join(" ")}`);
	let a = t.find((t) => t.operationId === e.operationId);
	return {
		closed: A.closeReviewed(e.operationId, a.resultId, e.approvalReference, e.approver),
		remaining: mm()
	};
}
//#endregion
//#region src/features/purchases/data/supplierBillBalanceAsAtService.ts
function xm(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && Sm(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = Cm(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && Sm(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = Cm(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && Sm(n.reversedAt) <= r ? t : t + n.amount, 0)), o = Cm(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: Cm(Math.max(0, o - i - a))
	};
}
function Sm(e) {
	return ve(e);
}
function Cm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function wm(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && Tm(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = Em(e.totals.total), i = Em(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && Tm(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: Em(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - i))
	};
}
function Tm(e) {
	return ve(e);
}
function Em(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function Dm(e, t, n = [], r = [], i = [], a = Pm()) {
	let o = Am(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = xm(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = km(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = Nm(r.reduce((t, n) => n.supplierId === e.id ? t + wm(n, i, a).amountAvailable : t, 0)), p = Nm(s), m = Nm(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: Nm(c),
		aging: jm(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function Om(e, t, n = [], r = [], i = [], a = Pm()) {
	let o = Am(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let h of e) {
		let e = Dm(h, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: Nm(s),
		unallocatedCredit: Nm(c),
		totalOutstanding: Nm(l),
		overdueAmount: Nm(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: jm(o)
	};
}
function km(e, t = Pm()) {
	let n = Mm(e), r = Mm(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Am() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function jm(e) {
	return {
		current: Nm(e.current),
		days1To30: Nm(e.days1To30),
		days31To60: Nm(e.days31To60),
		days61To90: Nm(e.days61To90),
		days90Plus: Nm(e.days90Plus)
	};
}
function Mm(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function Nm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Pm() {
	return ve((/* @__PURE__ */ new Date()).toISOString());
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function Fm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Im({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = Om(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = Fm(om(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = Fm(c.totalOutstanding), f = Fm(d - u);
	return {
		asOfDate: s,
		grossOutstanding: Fm(c.grossOutstanding),
		unallocatedCredit: Fm(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function Lm(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function Rm(e) {
	return e.slice(0, 10);
}
function zm(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function Bm(e, t) {
	Lm(t);
	let n = e.filter((e) => Rm(e.occurredAt) <= t).slice().sort(zm), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = L(n.quantityOnHand + e.quantityBase), a = Tr(n.inventoryValue + e.valueChange);
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
		let t = Rr.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = tn(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : wr(e.inventoryValue / e.quantityOnHand);
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
		totalInventoryValue: Tr(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function Vm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Hm(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function Um({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	Hm(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = Bm(n, r), o = Vm(om(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = Vm(a.totalInventoryValue), c = Vm(s - o);
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
var Wm = Tr, Gm = (e) => /^\d{4}-\d{2}-\d{2}$/.test(e) && !Number.isNaN(Date.parse(`${e}T00:00:00Z`)) && (/* @__PURE__ */ new Date(`${e}T00:00:00Z`)).toISOString().slice(0, 10) === e, Km = (e) => Date.parse(`${e}T00:00:00Z`), qm = (e) => e <= 30 ? "CURRENT" : e <= 60 ? "31_60" : e <= 90 ? "61_90" : "OVER_90";
function Jm(e) {
	let { filters: t, receipts: n, matches: r, journals: i, grniAccountId: a } = e;
	if (!Gm(t.asOfDate)) throw Error("Invalid GRNI as-of date.");
	if (t.receiptDateFrom && !Gm(t.receiptDateFrom)) throw Error("Invalid receipt start date.");
	if (t.receiptDateTo && !Gm(t.receiptDateTo)) throw Error("Invalid receipt end date.");
	let o = [];
	for (let e of n) if (!(e.status !== "POSTED" || e.receiptDate > t.asOfDate) && !(t.supplierId && e.supplierId !== t.supplierId) && !(t.purchaseOrderId && e.purchaseOrderId !== t.purchaseOrderId) && !(t.goodsReceiptId && e.id !== t.goodsReceiptId) && !(t.siteId && e.siteId !== t.siteId) && !(t.receiptDateFrom && e.receiptDate < t.receiptDateFrom) && !(t.receiptDateTo && e.receiptDate > t.receiptDateTo)) for (let n of e.lines) {
		let i = r.filter((r) => r.goodsReceiptId === e.id && r.goodsReceiptLineId === n.id && (r.accountingDate ?? r.createdAt.slice(0, 10)) <= t.asOfDate && (!(r.reversalAccountingDate ?? r.reversedAt?.slice(0, 10)) || (r.reversalAccountingDate ?? r.reversedAt.slice(0, 10)) > t.asOfDate) && (r.status === "ACTIVE" || !!r.reversedAt)), a = L(i.reduce((e, t) => e + t.matchedQuantity, 0)), s = Wm(i.reduce((e, t) => e + t.matchedReceiptValue, 0)), c = Dr({
			quantityBase: n.receivedBaseQuantity,
			unitCostBase: Er({
				transactionUnitCost: n.unitCost,
				conversionToBase: n.conversionToBase
			})
		}), l = L(n.receivedQuantity - a), u = Wm(c - s);
		if (l < -1e-4 || u < -.01) throw Error(`Overmatched receipt line: ${e.receiptNumber}/${n.id}`);
		if (t.outstandingOnly && l <= 0 && Math.abs(u) < .005) continue;
		let d = Math.max(0, Math.floor((Km(t.asOfDate) - Km(e.receiptDate)) / 864e5));
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
			agingBucket: qm(d)
		});
	}
	let s = {
		receivedValue: Wm(o.reduce((e, t) => e + t.receivedValue, 0)),
		matchedValue: Wm(o.reduce((e, t) => e + t.matchedValue, 0)),
		outstandingValue: Wm(o.reduce((e, t) => e + t.outstandingValue, 0))
	}, c = {
		CURRENT: 0,
		"31_60": 0,
		"61_90": 0,
		OVER_90: 0
	};
	for (let e of o) c[e.agingBucket] = Wm(c[e.agingBucket] + e.outstandingValue);
	let l = !!(t.supplierId || t.purchaseOrderId || t.goodsReceiptId || t.siteId || t.receiptDateFrom || t.receiptDateTo), u = 0;
	for (let e of i) if (!(e.journalDate > t.asOfDate)) for (let t of e.lines) t.accountId === a && (u += t.credit - t.debit);
	return u = Wm(u), {
		asOfDate: t.asOfDate,
		rows: o,
		totals: s,
		aging: c,
		glCreditBalance: u,
		difference: l ? NaN : Wm(s.outstandingValue - u)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseAccountingReconciliationService.ts
var Ym = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Xm(e) {
	let { asOfDate: t, accounts: n, journalEntries: r, costMovements: i, receipts: a, matches: o } = e, s = (e) => {
		let t = n.find((t) => t.systemRole === e);
		if (!t) throw Error(`Missing accounting control account: ${e}`);
		return t;
	}, c = s("INVENTORY"), l = s("GRNI"), u = s("PURCHASE_PRICE_VARIANCE");
	if (c.type !== "ASSET" || l.type !== "LIABILITY" || u.type !== "EXPENSE") throw Error("Purchase reconciliation control account types are invalid.");
	let d = Um({
		accounts: n,
		journalEntries: r,
		costMovements: i,
		asOfDate: t
	}), f = Jm({
		filters: { asOfDate: t },
		receipts: a,
		matches: o,
		journals: r,
		grniAccountId: l.id
	}), p = Ym(o.filter((e) => (e.accountingDate ?? e.createdAt.slice(0, 10)) <= t && (!(e.reversalAccountingDate ?? e.reversedAt?.slice(0, 10)) || (e.reversalAccountingDate ?? e.reversedAt.slice(0, 10)) > t) && (e.status === "ACTIVE" || !!e.reversedAt)).reduce((e, t) => e + t.priceVariance, 0)), m = Ym(r.filter((e) => e.journalDate <= t).flatMap((e) => e.lines).filter((e) => e.accountId === u.id).reduce((e, t) => e + t.debit - t.credit, 0)), h = (e, t, n) => {
		let r = Ym(t - n);
		return {
			accountId: e.id,
			accountCode: e.code,
			accountName: e.name,
			subledger: Ym(t),
			generalLedger: Ym(n),
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
function Zm(e) {
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
function Qm(e) {
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
var $m = E().trim().min(1).max(200), eh = E().regex(/^[a-f0-9]{64}$/), th = E().trim().min(3).max(200), nh = e({
	operationId: $m,
	expectedDigest: eh,
	reference: th,
	summary: E().trim().min(10).max(4e3),
	businessChecked: b(!0),
	glChecked: b(!0),
	externalEvidenceChecked: b(!0)
}).strict(), rh = e({
	operationId: $m,
	proposalId: $m,
	expectedDigest: eh,
	approvalReference: th,
	confirm: b(!0)
}).strict(), ih = (e) => Math.round(e * 100), ah = (e) => e / 100;
function oh(e) {
	return Array.isArray(e) ? e.map(oh) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).sort(([e], [t]) => e.localeCompare(t)).map(([e, t]) => [e, oh(t)])) : e;
}
var sh = (e) => Oe("sha256").update(JSON.stringify(oh(e))).digest("hex"), ch = [
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_PAYMENT_REVERSAL",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL"
];
function lh(e) {
	return {
		...e.sales,
		payments: e.customerPayments.payments,
		creditNotes: e.customerCredits.creditNotes,
		allocations: e.customerCredits.allocations,
		journals: e.journals.journalEntries
	};
}
function uh(e, t) {
	return sh(e) === sh(t);
}
function dh(t, n) {
	let r = lh(n), i = [];
	if (t.kind === "CUSTOMER_PAYMENT") {
		let n = e({
			customerId: $m,
			invoiceId: $m,
			paymentDate: $m,
			amount: f().finite().positive(),
			method: $m,
			bankAccountId: $m,
			reference: E().optional(),
			notes: E().optional()
		}).strict().parse(JSON.parse(t.fingerprint));
		i = r.payments.filter((e) => e.status === "RECEIVED" && !e.depositApplicationId && uh(n, {
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
			creditNoteId: $m,
			invoiceId: $m,
			allocationDate: $m,
			amount: f().finite().positive()
		}).strict().parse(JSON.parse(t.fingerprint));
		i = r.allocations.filter((e) => e.status === "APPLIED" && uh(n, {
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: e.amount
		}));
	} else t.kind === "SALES_INVOICE_VOID" ? i = r.invoices.filter((e) => e.id === t.fingerprint && e.status === "VOID") : t.kind === "SALES_PAYMENT_REVERSAL" ? i = r.payments.filter((e) => e.id === t.fingerprint && e.status === "REVERSED") : t.kind === "SALES_CREDIT_REVERSAL" && (i = r.allocations.filter((e) => e.id === t.fingerprint && e.status === "REVERSED"));
	if (!(i.length !== 1 || t.resultId && t.resultId !== i[0].id)) return i[0].id;
}
function fh() {
	let e = t(), n = structuredClone(e), r = A.list(), i = [], a = [], o = sh({
		business: e,
		operations: r.filter((e) => e.kind !== "SOURCE_METADATA_REPAIR")
	}), s = (e, t, n, r, i, o) => {
		uh(r, i) || a.push({
			kind: e,
			id: t.id,
			path: n,
			before: r,
			after: i,
			evidence: o
		});
	}, c = (e) => Number.isFinite(e) && e >= 0 && Number.isSafeInteger(ih(e)) && e === ah(ih(e));
	for (let [e, t] of [
		["transactions", n.bankTransactions.bankTransactions],
		["transfers", n.bankTransactions.bankTransfers],
		["payments", n.customerPayments.payments],
		["supplierBills", n.supplierBills.supplierBills],
		["supplierPayments", n.supplierPayments.supplierPayments],
		["supplierCredits", n.supplierCredits.supplierCredits],
		["supplierCreditAllocations", n.supplierCredits.allocations],
		["journals", n.journals.journalEntries]
	]) uh(n.financialCache[e], t) || i.push("Financial cache/source copies disagree: " + e + ". Restore a consistent snapshot first.");
	for (let e of n.sales.invoices) {
		if (["VOID", "DRAFT"].includes(e.status)) continue;
		let t = n.customerPayments.payments.filter((t) => t.invoiceId === e.id && t.status === "RECEIVED"), r = n.customerCredits.allocations.filter((t) => t.invoiceId === e.id && t.status === "APPLIED"), a = t.reduce((e, t) => e + ih(t.amount), 0), o = r.reduce((e, t) => e + ih(t.amount), 0), l = ih(e.totals.total);
		if (!c(e.totals.total) || [...t, ...r].some((e) => !c(e.amount) || e.amount <= 0) || a + o > l) {
			i.push("Invalid or excessive invoice settlement: " + e.id);
			continue;
		}
		let u = {
			amountPaid: ah(a),
			amountDue: ah(l - a - o),
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
		}))), r = n.supplierCredits.allocations.filter((t) => t.supplierBillId === e.id && t.status === "APPLIED"), a = t.reduce((e, t) => e + ih(t.amount), 0), o = r.reduce((e, t) => e + ih(t.amount), 0), l = ih(e.totals.total);
		if (!c(e.totals.total) || [...t, ...r].some((t) => !c(t.amount) || t.amount <= 0 || t.supplierId !== e.supplierId) || a + o > l) {
			i.push("Invalid or excessive bill settlement: " + e.id);
			continue;
		}
		let u = {
			amountPaid: ah(a),
			amountCredited: ah(o),
			amountDue: ah(l - a - o),
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
			let t = r.filter((t) => t[e ? "creditNoteId" : "supplierCreditId"] === n.id && t.status === "APPLIED"), a = t.reduce((e, t) => e + ih(t.amount), 0), o = ih(n.amountRefunded ?? 0), l = ih(n.totals.total);
			if (!c(n.totals.total) || !c(n.amountRefunded ?? 0) || t.some((e) => !c(e.amount) || e.amount <= 0) || a + o > l) {
				i.push("Invalid or excessive credit settlement: " + n.id);
				continue;
			}
			let u = {
				amountApplied: ah(a),
				amountAvailable: ah(l - a - o),
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
		if (!ch.includes(e.kind)) {
			i.push("Separate recovery required for " + e.kind + ": " + e.operationId);
			continue;
		}
		let t;
		try {
			t = dh(e, n);
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
		(!c(t.amount) || t.amount <= 0 || r.length !== 1 || r[0].status !== (t.status === "REVERSED" ? "REVERSED" : "POSTED") || r[0].journalDate !== t.paymentDate || !o || !s || r[0].lines.length !== 2 || !r[0].lines.some((e) => e.accountId === o && ih(e.debit) === ih(t.amount) && e.credit === 0) || !r[0].lines.some((e) => e.accountId === s && ih(e.credit) === ih(t.amount) && e.debit === 0)) && i.push("Payment original date, bank/control accounts or amount do not match: " + t.id), e && t.allocations.some((e) => {
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
			for (let n of e) t.set(n.accountId, (t.get(n.accountId) ?? 0) + ih(n.debit) - ih(n.credit));
			return [...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t));
		};
		(t.length !== 1 || t[0].journalDate < e.journalDate || !uh(r(t[0].lines), r(e.lines.map((e) => ({
			...e,
			debit: e.credit,
			credit: e.debit
		}))))) && i.push("Original/reversal account proof failed: " + e.id);
	}
	let p = lh(n), m = r.map((e) => u.has(e.operationId) ? {
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
		i.push(..._m(p, m.map((t) => t.operationId === e ? a : t), e).map((t) => e + ": " + t));
	}
	i.push(...Lp({
		transactions: n.bankTransactions.bankTransactions,
		transfers: n.bankTransactions.bankTransfers,
		payments: p.payments,
		journals: p.journals,
		invoices: p.invoices,
		creditNotes: p.creditNotes,
		supplierBills: n.supplierBills.supplierBills,
		supplierPayments: n.supplierPayments.supplierPayments,
		supplierCredits: n.supplierCredits.supplierCredits
	}).map((e) => e.code + ": " + e.entityId)), i.push(...zp(p).map((e) => e.code + ": " + e.entityId)), n.financialCache.supplierBills = structuredClone(n.supplierBills.supplierBills), n.financialCache.supplierCredits = structuredClone(n.supplierCredits.supplierCredits);
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
		["AR", () => cm({
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
		["AP", () => Im({
			...g,
			suppliers: n.suppliers.suppliers,
			bills: n.supplierBills.supplierBills,
			payments: n.supplierPayments.supplierPayments,
			credits: n.supplierCredits.supplierCredits,
			creditAllocations: n.supplierCredits.allocations
		})],
		["Inventory/GRNI/PPV", () => Xm({
			...g,
			costMovements: n.costMovements.movements,
			receipts: n.goodsReceipts.goodsReceipts,
			matches: n.receiptMatches.matches
		})],
		["Deposits", () => Zm({
			deposits: n.customerDeposits,
			accounts: n.accounts.accounts,
			journals: [...p.journals],
			banks: n.bankAccounts.bankAccounts,
			customers: n.customers.customers,
			asOfDate: h
		})],
		["Prepayments", () => Qm({
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
function ph(t) {
	return O.require("audit.read"), e({}).strict().parse(t), fh();
}
function mh(e) {
	let t = O.require("accounting.recover"), n = nh.parse(e), r = A.list().find((e) => e.operationId === n.operationId), i = JSON.stringify(n);
	if (r) {
		if (r.kind !== "SOURCE_METADATA_REPAIR" || r.state === "COMPLETED" && r.fingerprint !== i) throw Error("Operation ID was used for different recovery data.");
		if (r.fingerprint === i || r.repairProposal?.reference === n.reference && r.repairProposal.evidenceDigest === n.expectedDigest && r.repairProposal.summary === n.summary) return r;
	}
	if (A.getUnresolved().some((e) => e.kind === "SOURCE_METADATA_REPAIR" && e.operationId !== n.operationId)) throw Error("An existing source repair proposal must be reviewed or replaced first.");
	let a = fh();
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
function hh(e) {
	let t = O.require("accounting.recover"), n = rh.parse(e), r = A.list().find((e) => e.operationId === n.operationId), i = r?.repairProposal;
	if (r?.kind !== "SOURCE_METADATA_REPAIR" || !i || i.id !== n.proposalId || i.evidenceDigest !== n.expectedDigest) throw Error("Source repair proposal changed.");
	if (i.status === "EXECUTED") {
		if (i.approver !== t.userId || i.approvalReference !== n.approvalReference) throw Error("Already executed under another approval.");
		return r;
	}
	if (i.reviewer === t.userId || r.reviewHistory?.some((e) => e.operator === t.userId)) throw Error("A different authorized operator must approve.");
	let a = fh(), o = JSON.parse(i.planJson);
	if (!a.eligible || a.evidenceDigest !== i.evidenceDigest || !uh(a.changes, o.changes)) throw Error("Source repair evidence changed. Refresh and replace the proposal.");
	let s = A.list();
	for (let e of a.changes.filter((e) => e.kind === "OPERATION")) if (s.find((t) => t.operationId === e.id)?.reviewHistory?.some((e) => e.operator === t.userId)) throw Error("Approver recorded review evidence on a source operation. Use another authorized operator.");
	return k.transaction(() => {
		for (let e of a.changes) e.kind === "INVOICE" ? bu(e.id, e.after) : e.kind === "BILL" ? Ji(e.id, e.after) : e.kind === "CUSTOMER_CREDIT" ? ml(e.id, e.after) : e.kind === "SUPPLIER_CREDIT" && Bu(e.id, e.after);
		let e = fh();
		if (e.blockers.some((e) => e !== "No supported source metadata defects found.") || e.changes.some((e) => e.kind !== "OPERATION" && e.kind !== "PURCHASE_OPERATION")) throw Error("Post-repair source verification failed: " + e.blockers.join(" "));
		for (let [e, r] of a.changes.filter((e) => e.kind === "OPERATION").entries()) A.adoptReviewedResult(r.id, String(r.after.resultId)), A.recordManualReview(r.id, i.reference + " / " + e, i.reviewer, "Source repair " + i.id + ": exact request, original GL and settlement verified."), A.closeReviewed(r.id, String(r.after.resultId), n.approvalReference + " / " + e, t.userId);
		for (let e of a.changes.filter((e) => e.kind === "PURCHASE_OPERATION")) j.setStatus(e.id, "POSTED");
		let r = fh();
		if (r.changes.length || r.blockers.some((e) => e !== "No supported source metadata defects found.")) throw Error("Final source verification failed.");
		return A.finishRepair(n.operationId, i.id, t.userId, n.approvalReference, r.evidenceDigest);
	});
}
function gh(t) {
	let n = O.require("accounting.recover"), r = e({
		operationId: $m,
		proposalId: $m,
		reason: E().trim().min(10).max(500)
	}).strict().parse(t), i = fh();
	if (i.changes.length || i.blockers.some((e) => e !== "No supported source metadata defects found.")) throw Error("Source defects remain. Replace the reviewed proposal or use validated backup recovery; withdrawal cannot release unresolved source blockers.");
	return A.withdrawSourceRepair(r.operationId, r.proposalId, n.userId, r.reason);
}
//#endregion
//#region electron/security/targetedFinancialRepair.ts
var _h = E().trim().min(1).max(200), vh = E().trim().min(3).max(500), yh = E().trim().min(10).max(4e3), bh = E().regex(/^[a-f0-9]{64}$/), xh = e({ operationId: _h }).strict(), Sh = xh.extend({
	expectedDigest: bh,
	reference: vh,
	summary: yh,
	businessChecked: b(!0),
	glChecked: b(!0),
	externalEvidenceChecked: b(!0)
}).strict(), Ch = xh.extend({
	proposalId: _h,
	expectedDigest: bh,
	approvalReference: vh,
	confirm: b(!0)
}).strict(), wh = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Th(e) {
	return Array.isArray(e) ? e.map(Th) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).sort(([e], [t]) => e.localeCompare(t)).map(([e, t]) => [e, Th(t)])) : e;
}
var Eh = (e) => Oe("sha256").update(JSON.stringify(Th(e))).digest("hex");
function Dh() {
	return Eh({
		business: t(),
		operations: A.list().map(({ repairProposal: e, ...t }) => t)
	});
}
function Oh(e, t) {
	return typeof e == "string" ? e === t || e.startsWith(t + ":") : Array.isArray(e) ? e.some((e) => Oh(e, t)) : !!e && typeof e == "object" && Object.values(e).some((e) => Oh(e, t));
}
function kh(t) {
	let n = {
		amount: f().finite().positive(),
		description: E().trim().min(1).max(2e3),
		reference: E().max(2e3).optional()
	}, r = (t.kind === "BANK_TRANSACTION" ? e({
		...n,
		bankAccountId: _h,
		transactionDate: _h,
		direction: T(["MONEY_IN", "MONEY_OUT"]),
		offsetAccountId: _h
	}).strict() : e({
		...n,
		fromBankAccountId: _h,
		toBankAccountId: _h,
		transferDate: _h
	}).strict()).parse(JSON.parse(t.fingerprint));
	return {
		...r,
		amount: wh(r.amount),
		description: r.description.trim(),
		reference: r.reference?.trim() || void 0
	};
}
function Ah(e) {
	let n = A.list(), r = n.find((t) => t.operationId === e), i = {
		operationId: e,
		resultId: r?.resultId,
		evidenceDigest: Dh(),
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
		o = kh(r);
	} catch {
		return a("Saved bank intent is invalid or unreadable.");
	}
	if (o.amount <= 0) return a("Saved bank amount does not round to positive cents.");
	let s = qf.getTransactions(), c = qf.getTransfers(), l = F.getAll(), u = [...s, ...c].filter((e) => e.id === r.resultId), d = l.filter((e) => e.sourceType === r.kind && e.sourceId === r.resultId), f = t();
	if (l.some((e) => e.sourceId === r.resultId && e.sourceType !== r.kind)) return a("A journal with another source kind claims this bound result.");
	let p = k.read();
	if (JSON.stringify(p.transactions) !== JSON.stringify(s) || JSON.stringify(p.transfers) !== JSON.stringify(c) || JSON.stringify(p.journals) !== JSON.stringify(l)) return a("Financial cache and source repositories disagree; restore a consistent snapshot first.");
	if (new Set(l.map((e) => e.id)).size !== l.length || u.length > 1) return a("Duplicate bank or journal identities are ambiguous.");
	if (u.length === 1 && d.length === 2) {
		let t = u[0], s = d.find((e) => e.id === t.journalEntryId), c = d.find((e) => e.id !== t.journalEntryId);
		if (!s || !c || s.status !== "POSTED" || c.status !== "POSTED" || [s, c].some((e) => e.bankDuplicateCorrection || e.reversedJournalEntryId || e.reversalJournalEntryId || e.reversedAt) || !Se(s, c)) return a("Duplicate journals must be exact original postings with an unambiguous existing bank-record link.");
		let p = { ...f };
		if (delete p.journals, delete p.financialCache, Object.values(p).some((e) => Oh(e, c.id)) || n.some((e) => Oh(e, c.id)) || l.some((e) => e.id !== c.id && Oh(e, c.id))) return a("The duplicate journal is referenced by matching, clearing or another source.");
		let m = s.journalDate;
		try {
			w(m, "Duplicate financial date"), rr(m), Kn(m, c.lines.map((e) => e.accountId));
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
		}, ee = { journals: [_, ...l.map((e) => e.id === c.id ? v : e)] }, y = Hp(e, ee, !1), b = lm(ee);
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
		if (Object.entries(f).some(([e, t]) => e !== "financialCache" && Oh(t, r.resultId))) return a("Other business records still reference the bound result.");
		let e = lm();
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
		if (delete t.journals, delete t.financialCache, Object.values(t).some((e) => Oh(e, r.resultId))) return a("Another repository references the missing bank result.");
		if ([...s.map((e) => e.transactionNumber), ...c.map((e) => e.transferNumber)].includes(h)) return a("Recovered business number is already in use.");
		let n = "transactionNumber" in g ? { transactions: [g, ...s] } : { transfers: [g, ...c] }, o = Hp(e, n, !1), l = lm(n);
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
			if (delete e.bankTransactions, delete e.financialCache, Object.values(e).some((e) => Oh(e, t.journalEntryId))) return a("The stale missing journal is still referenced by another repository.");
		}
		let o = {
			...t,
			journalEntryId: n.id
		}, p = "transactionNumber" in o ? { transactions: s.map((e) => e.id === o.id ? o : e) } : { transfers: c.map((e) => e.id === o.id ? o : e) }, m = Hp(e, p, !1), h = lm(p);
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
		if (delete n.bankTransactions, delete n.financialCache, Object.values(n).some((e) => Oh(e, t.journalEntryId))) return a("Missing journal is referenced by clearing, matching or another repository.");
		let d = "bankAccountId" in g ? I.getById(g.bankAccountId) : void 0, p = "fromBankAccountId" in g ? I.getById(g.fromBankAccountId) : void 0, h = "toBankAccountId" in g ? I.getById(g.toBankAccountId) : void 0, _ = "direction" in g ? g.direction === "MONEY_IN" ? d?.glAccountId : g.offsetAccountId : h?.glAccountId, v = "direction" in g ? g.direction === "MONEY_IN" ? g.offsetAccountId : d?.glAccountId : p?.glAccountId;
		if (!_ || !v) return a("Bank GL mapping is missing.");
		try {
			rr(m), Kn(m, [_, v]);
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
		}, ne = Hp(e, te, !1), S = lm(te);
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
function jh(e) {
	return O.require("audit.read"), Ah(xh.parse(e).operationId).public;
}
function Mh(e) {
	let t = O.require("accounting.recover"), n = Sh.parse(e), r = Ah(n.operationId).public;
	if (!r.eligible || !r.action) throw Error("Targeted repair blocked: " + r.blockers.join(" "));
	if (r.evidenceDigest !== n.expectedDigest) throw Error("Repair evidence changed. Refresh the preview.");
	let i = crypto.randomUUID();
	A.recordManualReview(n.operationId, n.reference, t.userId, n.summary + " · Proposed " + r.action + " · " + i);
	let a = Ah(n.operationId).public;
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
function Nh(e) {
	let n = O.require("accounting.recover"), r = Ch.parse(e), i = A.list().find((e) => e.operationId === r.operationId), a = i?.repairProposal;
	if (!i || !a || a.id !== r.proposalId || a.evidenceDigest !== r.expectedDigest) throw Error("Repair proposal changed. Refresh the preview.");
	if (a.status === "EXECUTED") {
		if (a.approver !== n.userId || a.approvalReference !== r.approvalReference) throw Error("Repair was already executed with a different approval.");
		return structuredClone(i);
	}
	if (i.state !== "MANUAL_REVIEW" || a.reviewer === n.userId || i.reviewHistory?.some((e) => e.operator === n.userId)) throw Error("Repair approval requires a different authorized operator.");
	if (i.reviewHistory?.some((e) => e.reference === r.approvalReference)) throw Error("Approval reference must differ from review evidence.");
	let o = Ah(r.operationId), s = o.public;
	if (!s.eligible || s.action !== a.action || s.evidenceDigest !== a.evidenceDigest) throw Error("Repair evidence changed or is no longer eligible. Refresh and propose again.");
	let c = () => {
		let e = s.existingJournalId;
		if (s.action === "RESTORE_BANK_RECORD") Xf(o.record);
		else if (s.action === "RESTORE_BANK_JOURNAL_LINK") Zf(i.resultId, s.previousJournalId, s.existingJournalId);
		else if (s.action === "REVERSE_BANK_DUPLICATE") O.require("banking.write"), O.require("accounting.post"), e = hr(s.duplicateJournalId, s.existingJournalId, i.operationId, "Approved duplicate correction " + a.id + "; " + r.approvalReference).id;
		else if (s.action === "RESTORE_BANK_JOURNAL") {
			O.require("banking.write"), O.require("accounting.post");
			let t = F.post(o.draft);
			e = t.id, Zf(i.resultId, s.previousJournalId, t.id);
		}
		let c = lm();
		if (c.length) throw Error("Post-repair consistency checks failed: " + c.map((e) => e.code).join(", "));
		if (s.action !== "CANCEL_NO_EFFECT") {
			let e = Hp(r.operationId);
			if (e.length) throw Error("Post-repair source proof failed: " + e.join(" "));
		} else if (Ah(r.operationId).public.action !== "CANCEL_NO_EFFECT") throw Error("No-effect evidence changed before cancellation.");
		return A.finishRepair(r.operationId, a.id, n.userId, r.approvalReference, Eh(t()), e);
	};
	return s.action === "CANCEL_NO_EFFECT" ? c() : k.transaction(c);
}
//#endregion
//#region src/features/document-output/purchaseOutputRepository.ts
var Ph = E().min(1).max(200), Fh = E().max(2e4), Ih = f().finite().nonnegative(), Lh = ["PURCHASE_ORDER", "REMITTANCE"], Rh = e({
	operationId: Ph,
	kind: T(Lh),
	sourceId: Ph,
	expectedRevision: E().min(1).max(5e5),
	templateId: Ph.optional()
}).strict(), zh = e({
	id: Ph,
	description: Fh,
	reference: Fh,
	quantity: f().finite().positive(),
	unit: Fh,
	unitPrice: Ih,
	net: Ih,
	tax: Ih,
	total: Ih,
	taxCode: Fh.optional(),
	taxRate: f().finite().min(0).max(1).optional()
}).strict(), Bh = e({
	id: Ph,
	revision: Ph,
	name: Fh,
	subject: Fh,
	body: Fh,
	footer: Fh,
	logoPosition: T([
		"Left",
		"Centre",
		"Right"
	]).optional(),
	paper: T(["A4", "Letter"])
}).strict(), Vh = e({
	id: Ph,
	operationId: Ph,
	requestFingerprint: E().max(1e6),
	kind: T(Lh),
	sourceId: Ph,
	sourceRevision: E().min(1).max(5e5),
	preparedAt: Ph,
	preparedBy: Ph,
	documentNumber: Ph,
	status: Ph,
	date: Ph,
	expectedDeliveryDate: Fh.optional(),
	reference: Fh.optional(),
	notes: Fh.optional(),
	supplierId: Ph,
	supplierName: Fh,
	supplierCode: Fh,
	supplierEmail: Fh.optional(),
	supplierContact: Fh.optional(),
	supplierAddress: Fh,
	supplierMetadataAt: Ph,
	issuer: e({
		name: Fh,
		identifier: Fh,
		address: Fh,
		email: Fh,
		currency: Ph,
		logo: Ie.optional()
	}).strict(),
	method: Fh.optional(),
	noncash: y(),
	lines: s(zh).min(1),
	subtotal: Ih,
	tax: Ih,
	total: Ih,
	template: Bh,
	subject: Fh,
	body: Fh
}).strict(), Hh = (e) => e === "PURCHASE_ORDER" ? "Purchase order" : "Remittance";
function Uh(e, t) {
	let n = e === "PURCHASE_ORDER" ? jn.getById(t) : Qi.getById(t);
	if (!n) throw Error("Purchase output source was not found.");
	return n;
}
function Wh(e, t) {
	let n = Uh(e, t), r = vn.getById(n.supplierId);
	if (!r) throw Error("Source supplier was not found.");
	return JSON.stringify([n, r]);
}
var Gh = (e, t) => g(e, "accounting.read") || t === "PURCHASE_ORDER" && g(e, "purchases.write"), Kh = [], qh = 0, Jh = /* @__PURE__ */ new Set(), Yh = () => {
	qh++, Jh.forEach((e) => e());
};
function Xh() {
	return (x.templates ?? []).filter((e) => e.status === "Active" && ["Purchase order", "Remittance"].includes(e.kind));
}
function Zh(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!Object.hasOwn(t, n)) throw Error("Unsupported purchase template token: " + n);
		return t[n];
	});
}
function Qh(e) {
	let t = Vh.parse(e), n = Rh.parse(JSON.parse(t.requestFingerprint));
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
		let t = Rh.parse(e), n = O.require("purchases.read");
		if (!Gh(n, t.kind) || t.kind === "REMITTANCE" && !g(n, "accounting.post") || t.kind === "PURCHASE_ORDER" && !g(n, "accounting.post") && !g(n, "purchases.write")) throw Error("Permission denied: purchase document preparation.");
		let r = JSON.stringify(t), i = Kh.find((e) => e.operationId === t.operationId);
		if (i) {
			if (i.requestFingerprint !== r) throw Error("Operation ID was used for different output data.");
			return i;
		}
		let a = Uh(t.kind, t.sourceId), o = vn.getById(a.supplierId);
		if (Wh(t.kind, t.sourceId) !== t.expectedRevision) throw Error("Source or supplier changed. Refresh before preparing output.");
		let s = C(), c = t.templateId ? Xh().find((e) => e.id === t.templateId && e.kind === Hh(t.kind)) : void 0;
		if (t.templateId && !c) throw Error("Select an active matching purchase template.");
		let l = t.kind === "PURCHASE_ORDER" ? jn.getById(t.sourceId) : void 0, u = t.kind === "REMITTANCE" ? Qi.getById(t.sourceId) : void 0, d = l ? l.lines.map((e) => ({
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
			name: c?.name ?? "Standard " + Hh(t.kind),
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
				footer: Zh(m.footer, p)
			},
			subject: Zh(m.subject, p),
			body: Zh(m.body, p)
		};
		return Qh(h), Kh = [h, ...Kh], Yh(), h;
	} },
	read: "purchases.read",
	commands: { prepare: "purchases.read" },
	snapshot: () => ({
		artifacts: Kh,
		templates: Xh().map((e) => ({
			id: e.id,
			name: e.name,
			kind: e.kind
		}))
	}),
	restore: (e) => {
		Kh = e.artifacts, e.templates;
	},
	publish: Yh,
	view: (e) => ({
		artifacts: Kh.filter((t) => Gh(e, t.kind)),
		templates: Xh().filter((t) => Gh(e, t.kind === "Purchase order" ? "PURCHASE_ORDER" : "REMITTANCE")).map((e) => ({
			id: e.id,
			name: e.name,
			kind: e.kind
		}))
	}),
	validate: (t, n) => {
		let r = e({
			artifacts: s(Vh),
			templates: s(e({
				id: Ph,
				name: Fh,
				kind: Ph
			}).strict())
		}).strict().parse(t).artifacts, i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set(), o = n;
		for (let e of r) {
			if (Qh(e), a.has(e.id) || i.has(e.operationId)) throw Error("Duplicate purchase output.");
			a.add(e.id), i.add(e.operationId);
			let t = (e.kind === "PURCHASE_ORDER" ? o.purchaseOrders.purchaseOrders : o.supplierPayments.supplierPayments).find((t) => t.id === e.sourceId);
			if (!t || t.supplierId !== e.supplierId) throw Error("Invalid purchase output source reference.");
		}
	}
});
//#endregion
//#region src/features/sales/data/recoveryWorkbench.ts
var $h = [
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
];
function eg() {
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
		payments: Wl.getAll(),
		creditNotes: G.getAll(),
		allocations: G.getAllAllocations(),
		journals: F.getAll()
	}, i = lm(), a = t.filter((e) => e.state !== "COMPLETED" || e.reviewHistory?.length).map((n) => {
		let a = $h.includes(n.kind) || Vp(n.kind) || n.kind === "BANK_RECONCILIATION", o = [], s = (e, t) => {
			o.some((e) => e.path === t) || o.push({
				label: e,
				path: t
			});
		};
		if (n.kind === "BANK_RECONCILIATION") {
			let e = nc.getAll().find((e) => e.id === n.resultId);
			s("Bank reconciliation records", e ? "/banking/accounts/" + encodeURIComponent(e.bankAccountId) : "/banking");
		}
		if (Vp(n.kind)) {
			let e = (n.kind === "BANK_TRANSACTION" ? qf.getTransactions() : qf.getTransfers()).find((e) => e.id === n.resultId);
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
		let d = n.state === "COMPLETED" ? [] : a ? n.kind === "BANK_RECONCILIATION" ? Bp(n.operationId) : Vp(n.kind) ? Hp(n.operationId) : _m(r, t, n.operationId) : ["This operation kind has no verified closure procedure. It remains blocked; do not replay it."];
		return n.state !== "COMPLETED" && a && (n.kind !== "BANK_RECONCILIATION" && !Vp(n.kind) && d.push(...ym(n.operationId)), i.length && d.push("Financial consistency checks failed: " + i.map((e) => e.code).join(", ")), n.reviewHistory?.some((t) => t.operator.trim().toLowerCase() === e.userId.toLowerCase()) && d.push("A different authorized operator must approve; this account recorded review evidence."), g(e, "accounting.recover") || d.push("Your role can inspect but cannot approve recovery.")), {
			...structuredClone(n),
			supported: a,
			revision: hm(n),
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
var tg = (e) => Math.round((e + 2 ** -52) * 100) / 100, ng = E().trim().min(1).max(200), rg = ng.refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}), ig = f().finite().positive().refine((e) => tg(e) === e), ag = E().trim().min(3).max(2e3), og = E().trim().max(500).default(""), sg = e({
	operationId: ng,
	supplierId: ng,
	date: rg,
	bankAccountId: ng,
	amount: ig,
	reference: og,
	reason: ag
}).strict(), cg = e({
	operationId: ng,
	prepaymentId: ng,
	supplierBillId: ng,
	date: rg,
	amount: ig,
	reference: og,
	reason: ag
}).strict(), lg = e({
	operationId: ng,
	prepaymentId: ng,
	bankAccountId: ng,
	date: rg,
	amount: ig,
	reference: og,
	reason: ag
}).strict(), ug = {
	id: ng,
	fingerprint: E(),
	journalId: ng,
	status: T(["POSTED", "REVERSED"]),
	createdBy: ng,
	createdAt: ng,
	reversalDate: rg.optional(),
	reversalReason: ag.optional(),
	reversedBy: ng.optional()
}, dg = sg.extend({
	...ug,
	assetAccountId: ng
}).strict(), fg = cg.extend({
	...ug,
	paymentId: ng
}).strict(), pg = lg.extend(ug).strict(), mg = e({
	prepayments: s(dg),
	applications: s(fg),
	refunds: s(pg),
	settings: s(e({
		id: ng,
		assetAccountId: ng
	}).strict()).max(1)
}).strict(), hg = {
	prepayments: [],
	applications: [],
	refunds: [],
	settings: []
}, gg = 0, _g = /* @__PURE__ */ new Set(), vg = () => {
	gg++, _g.forEach((e) => e());
};
function yg(e) {
	let t = hg.prepayments.find((t) => t.id === e);
	if (!t) throw Error("Supplier prepayment not found.");
	return t;
}
function bg(e) {
	let t = yg(e);
	return t.status === "REVERSED" ? 0 : tg(t.amount - hg.applications.filter((t) => t.prepaymentId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0) - hg.refunds.filter((t) => t.prepaymentId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
}
function xg(e, t) {
	let n = e.prepayments.find((e) => e.id === t), r = /* @__PURE__ */ new Map(), i = (e, t) => r.set(e, tg((r.get(e) ?? 0) + t));
	i(n.date, n.amount), n.reversalDate && i(n.reversalDate, -n.amount);
	for (let r of [...e.applications, ...e.refunds].filter((e) => e.prepaymentId === t)) {
		if (r.date < n.date || r.reversalDate && r.reversalDate < r.date) throw Error("Prepayment event dates are invalid.");
		i(r.date, -r.amount), r.reversalDate && i(r.reversalDate, r.amount);
	}
	let a = 0;
	for (let [, e] of [...r].sort(([e], [t]) => e.localeCompare(t))) if (a = tg(a + e), a < 0) throw Error("Prepayment would be overdrawn on a historical date.");
}
function Sg(e) {
	let t = JSON.stringify(e), n = [
		...hg.prepayments,
		...hg.applications,
		...hg.refunds
	].find((t) => t.operationId === e.operationId);
	if (n && n.fingerprint !== t) throw Error("Operation ID already used with different prepayment data.");
	return {
		prior: n,
		fingerprint: t
	};
}
function Cg(e) {
	let t = P.requireById(e);
	if (!t.active || t.type !== "ASSET" || t.systemRole || t.allowManualPosting) throw Error("Use the dedicated active prepayment asset account.");
	return t;
}
function wg(e, t) {
	let n = I.requireById(e), r = P.requireById(n.glAccountId);
	if (!n.active || t < n.openingBalanceDate || !r.active || r.type !== "ASSET") throw Error("Use an active bank account and a date after its opening balance.");
	return n;
}
function Tg(e) {
	w(e), rr(e), M();
}
function Eg(e, t, n = crypto.randomUUID()) {
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
			if (O.require("accounting.post"), hg.settings[0]) return hg.settings[0];
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
			return hg.settings = [n], vg(), n;
		},
		balance(e) {
			return O.require("purchases.read"), bg(e);
		},
		pay(e) {
			O.require("purchases.payment");
			let t = sg.parse(e), { prior: n, fingerprint: r } = Sg(t);
			if (n) return n;
			Tg(t.date);
			let i = vn.getById(t.supplierId);
			if (!i || i.status === "INACTIVE") throw Error("Choose an active supplier.");
			let a = hg.settings[0];
			if (!a) throw Error("Configure the prepayment asset account first.");
			Cg(a.assetAccountId);
			let o = wg(t.bankAccountId, t.date), s = crypto.randomUUID(), c = F.post({
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
				...Eg(r, c.id, s),
				assetAccountId: a.assetAccountId
			};
			return hg.prepayments = [...hg.prepayments, l], vg(), l;
		},
		apply(e) {
			O.require("purchases.payment");
			let t = cg.parse(e), { prior: n, fingerprint: r } = Sg(t);
			if (n) return n;
			Tg(t.date);
			let i = yg(t.prepaymentId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > bg(i.id)) throw Error("Prepayment date or available balance is insufficient.");
			Cg(i.assetAccountId);
			let a = Gi.getById(t.supplierBillId);
			if (!a || a.supplierId !== i.supplierId || ["VOID", "DRAFT"].includes(a.status) || t.date < a.billDate) throw Error("Choose an issued bill for the same supplier.");
			if (t.amount > a.totals.amountDue) throw Error("Prepayment application exceeds bill amount due.");
			let o = crypto.randomUUID(), s = "prepayment-payment:" + o;
			Qi.recordPrepaymentSettlement({
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
				...Eg(r, c.id, o),
				paymentId: s
			};
			return hg.applications = [...hg.applications, l], xg(hg, i.id), vg(), l;
		},
		refund(e) {
			O.require("purchases.payment");
			let t = lg.parse(e), { prior: n, fingerprint: r } = Sg(t);
			if (n) return n;
			Tg(t.date);
			let i = yg(t.prepaymentId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > bg(i.id)) throw Error("Refund exceeds the available prepayment.");
			Cg(i.assetAccountId);
			let a = wg(t.bankAccountId, t.date), o = crypto.randomUUID(), s = F.post({
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
				...Eg(r, s.id, o)
			};
			return hg.refunds = [...hg.refunds, c], xg(hg, i.id), vg(), c;
		},
		reverse(t) {
			let n = O.require("purchases.payment"), r = e({
				entity: T([
					"prepayments",
					"applications",
					"refunds"
				]),
				id: ng,
				reversalDate: rg,
				reason: ag
			}).strict().parse(t), i = hg[r.entity].find((e) => e.id === r.id);
			if (!i) throw Error("Prepayment record not found.");
			if (i.status === "REVERSED") return i;
			if (Tg(r.reversalDate), r.reversalDate < i.date) throw Error("Prepayment reversal cannot precede its original date.");
			let a = r.entity === "prepayments" ? i.id : i.prepaymentId;
			if (r.entity === "prepayments" && [...hg.applications, ...hg.refunds].some((e) => e.prepaymentId === i.id && e.status === "POSTED")) throw Error("Reverse prepayment applications and refunds before reversing its receipt.");
			ed(i.journalId), F.reverse({
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
			if (hg[r.entity] = hg[r.entity].map((e) => e.id === r.id ? o : e), r.entity === "applications") {
				let e = i;
				Qi.reversePrepaymentSettlement(e.paymentId, r.reversalDate, r.reason);
			}
			return xg(hg, a), vg(), o;
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
	snapshot: () => hg,
	restore: (e) => {
		hg = e;
	},
	publish: vg,
	validate: (e, t) => {
		let n = mg.parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.settings) {
			let t = r.accounts.accounts.find((t) => t.id === e.assetAccountId);
			if (!t || t.type !== "ASSET" || t.systemRole || t.allowManualPosting) throw Error("Invalid prepayment asset mapping.");
		}
		let a = (e) => {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) t.set(n.accountId, tg((t.get(n.accountId) ?? 0) + n.debit - n.credit));
			return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
		};
		for (let e of [
			"prepayments",
			"applications",
			"refunds"
		]) for (let t of n[e]) {
			let o = (e === "prepayments" ? sg : e === "applications" ? cg : lg).parse(JSON.parse(t.fingerprint));
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
		for (let e of n.prepayments) if (xg(n, e.id), e.status === "REVERSED" && [...n.applications, ...n.refunds].some((t) => t.prepaymentId === e.id && (t.status === "POSTED" || t.reversalDate > e.reversalDate))) throw Error("Reversed prepayment has later consumption.");
		for (let e of r.supplierPayments.supplierPayments) if (e.prepaymentApplicationId && !n.applications.some((t) => t.id === e.prepaymentApplicationId && t.paymentId === e.id && t.prepaymentId === e.prepaymentId)) throw Error("Orphan prepayment settlement payment.");
	}
});
//#endregion
//#region src/features/customer-deposits/customerDepositRepository.ts
var Dg = (e) => Math.round((e + 2 ** -52) * 100) / 100, Og = E().trim().min(1).max(200), kg = Og.refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}), Ag = f().finite().positive().refine((e) => Dg(e) === e), jg = E().trim().min(3).max(2e3), Mg = E().trim().max(500).default(""), Ng = e({
	operationId: Og,
	customerId: Og,
	date: kg,
	bankAccountId: Og,
	amount: Ag,
	reference: Mg,
	reason: jg
}).strict(), Pg = e({
	operationId: Og,
	depositId: Og,
	invoiceId: Og,
	date: kg,
	amount: Ag,
	reference: Mg,
	reason: jg
}).strict(), Fg = e({
	operationId: Og,
	depositId: Og,
	bankAccountId: Og,
	date: kg,
	amount: Ag,
	reference: Mg,
	reason: jg
}).strict(), Ig = {
	id: Og,
	fingerprint: E(),
	journalId: Og,
	status: T(["POSTED", "REVERSED"]),
	createdBy: Og,
	createdAt: Og,
	reversalDate: kg.optional(),
	reversalReason: jg.optional(),
	reversedBy: Og.optional()
}, Lg = Ng.extend({
	...Ig,
	liabilityAccountId: Og
}).strict(), Rg = Pg.extend({
	...Ig,
	paymentId: Og
}).strict(), zg = Fg.extend(Ig).strict(), Bg = e({
	deposits: s(Lg),
	applications: s(Rg),
	refunds: s(zg),
	settings: s(e({
		id: Og,
		liabilityAccountId: Og
	}).strict()).max(1)
}).strict(), Vg = {
	deposits: [],
	applications: [],
	refunds: [],
	settings: []
}, Hg = 0, Ug = /* @__PURE__ */ new Set(), Wg = () => {
	Hg++, Ug.forEach((e) => e());
};
function Gg(e) {
	let t = Vg.deposits.find((t) => t.id === e);
	if (!t) throw Error("Customer deposit not found.");
	return t;
}
function Kg(e) {
	let t = Gg(e);
	return t.status === "REVERSED" ? 0 : Dg(t.amount - Vg.applications.filter((t) => t.depositId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0) - Vg.refunds.filter((t) => t.depositId === e && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
}
function qg(e, t) {
	let n = e.deposits.find((e) => e.id === t), r = /* @__PURE__ */ new Map(), i = (e, t) => r.set(e, Dg((r.get(e) ?? 0) + t));
	i(n.date, n.amount), n.reversalDate && i(n.reversalDate, -n.amount);
	for (let r of [...e.applications, ...e.refunds].filter((e) => e.depositId === t)) {
		if (r.date < n.date || r.reversalDate && r.reversalDate < r.date) throw Error("Deposit event dates are invalid.");
		i(r.date, -r.amount), r.reversalDate && i(r.reversalDate, r.amount);
	}
	let a = 0;
	for (let [, e] of [...r].sort(([e], [t]) => e.localeCompare(t))) if (a = Dg(a + e), a < 0) throw Error("Deposit would be overdrawn on a historical date.");
}
function Jg(e) {
	let t = JSON.stringify(e), n = [
		...Vg.deposits,
		...Vg.applications,
		...Vg.refunds
	].find((t) => t.operationId === e.operationId);
	if (n && n.fingerprint !== t) throw Error("Operation ID already used with different deposit data.");
	return {
		prior: n,
		fingerprint: t
	};
}
function Yg(e) {
	let t = P.requireById(e);
	if (!t.active || t.type !== "LIABILITY" || t.systemRole || t.allowManualPosting) throw Error("Use the dedicated active deposit liability account.");
	return t;
}
function Xg(e, t) {
	let n = I.requireById(e), r = P.requireById(n.glAccountId);
	if (!n.active || t < n.openingBalanceDate || !r.active || r.type !== "ASSET") throw Error("Use an active bank account and a date after its opening balance.");
	return n;
}
function Zg(e) {
	w(e), rr(e), M();
}
function Qg(e, t, n = crypto.randomUUID()) {
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
			if (O.require("accounting.post"), Vg.settings[0]) return Vg.settings[0];
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
			return Vg.settings = [n], Wg(), n;
		},
		balance(e) {
			return O.require("sales.read"), Kg(e);
		},
		receive(e) {
			O.require("sales.payment");
			let t = Ng.parse(e), { prior: n, fingerprint: r } = Jg(t);
			if (n) return n;
			Zg(t.date);
			let i = W.getById(t.customerId);
			if (!i || i.status === "INACTIVE") throw Error("Choose an active customer.");
			let a = Vg.settings[0];
			if (!a) throw Error("Configure the deposit liability account first.");
			Yg(a.liabilityAccountId);
			let o = Xg(t.bankAccountId, t.date), s = crypto.randomUUID(), c = F.post({
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
				...Qg(r, c.id, s),
				liabilityAccountId: a.liabilityAccountId
			};
			return Vg.deposits = [...Vg.deposits, l], Wg(), l;
		},
		apply(e) {
			O.require("sales.payment");
			let t = Pg.parse(e), { prior: n, fingerprint: r } = Jg(t);
			if (n) return n;
			Zg(t.date);
			let i = Gg(t.depositId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > Kg(i.id)) throw Error("Deposit date or available balance is insufficient.");
			Yg(i.liabilityAccountId);
			let a = K.getAll().find((e) => e.id === t.invoiceId && e.type === "INVOICE");
			if (!a || a.type !== "INVOICE" || a.customerId !== i.customerId || ["VOID", "DRAFT"].includes(a.status) || t.date < a.documentDate) throw Error("Choose an issued invoice for the same customer.");
			let o = K.recalculateInvoiceBalance(a.id);
			if (t.amount > o.amountDue) throw Error("Deposit application exceeds invoice amount due.");
			let s = crypto.randomUUID(), c = "deposit-payment:" + s;
			Wl.recordDepositSettlement({
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
				...Qg(r, l.id, s),
				paymentId: c
			};
			return Vg.applications = [...Vg.applications, u], qg(Vg, i.id), K.recalculateInvoiceBalance(a.id), Wg(), u;
		},
		refund(e) {
			O.require("sales.payment");
			let t = Fg.parse(e), { prior: n, fingerprint: r } = Jg(t);
			if (n) return n;
			Zg(t.date);
			let i = Gg(t.depositId);
			if (i.status !== "POSTED" || t.date < i.date || t.amount > Kg(i.id)) throw Error("Refund exceeds the available deposit.");
			Yg(i.liabilityAccountId);
			let a = Xg(t.bankAccountId, t.date), o = crypto.randomUUID(), s = F.post({
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
				...Qg(r, s.id, o)
			};
			return Vg.refunds = [...Vg.refunds, c], qg(Vg, i.id), Wg(), c;
		},
		reverse(t) {
			let n = O.require("sales.payment"), r = e({
				entity: T([
					"deposits",
					"applications",
					"refunds"
				]),
				id: Og,
				reversalDate: kg,
				reason: jg
			}).strict().parse(t), i = Vg[r.entity].find((e) => e.id === r.id);
			if (!i) throw Error("Deposit record not found.");
			if (i.status === "REVERSED") return i;
			if (Zg(r.reversalDate), r.reversalDate < i.date) throw Error("Deposit reversal cannot precede its original date.");
			let a = r.entity === "deposits" ? i.id : i.depositId;
			if (r.entity === "deposits" && [...Vg.applications, ...Vg.refunds].some((e) => e.depositId === i.id && e.status === "POSTED")) throw Error("Reverse deposit applications and refunds before reversing its receipt.");
			ed(i.journalId), F.reverse({
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
			if (Vg[r.entity] = Vg[r.entity].map((e) => e.id === r.id ? o : e), r.entity === "applications") {
				let e = i;
				Wl.reverseDepositSettlement(e.paymentId, r.reversalDate, r.reason), K.recalculateInvoiceBalance(e.invoiceId);
			}
			return qg(Vg, a), Wg(), o;
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
	snapshot: () => Vg,
	restore: (e) => {
		Vg = e;
	},
	publish: Wg,
	validate: (e, t) => {
		let n = Bg.parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.settings) {
			let t = r.accounts.accounts.find((t) => t.id === e.liabilityAccountId);
			if (!t || t.type !== "LIABILITY" || t.systemRole || t.allowManualPosting) throw Error("Invalid deposit liability mapping.");
		}
		let a = (e) => {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) t.set(n.accountId, Dg((t.get(n.accountId) ?? 0) + n.debit - n.credit));
			return JSON.stringify([...t].filter(([, e]) => e).sort(([e], [t]) => e.localeCompare(t)));
		};
		for (let e of [
			"deposits",
			"applications",
			"refunds"
		]) for (let t of n[e]) {
			let o = (e === "deposits" ? Ng : e === "applications" ? Pg : Fg).parse(JSON.parse(t.fingerprint));
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
		for (let e of n.deposits) if (qg(n, e.id), e.status === "REVERSED" && [...n.applications, ...n.refunds].some((t) => t.depositId === e.id && (t.status === "POSTED" || t.reversalDate > e.reversalDate))) throw Error("Reversed deposit has later consumption.");
		for (let e of r.customerPayments.payments) if (e.depositApplicationId && !n.applications.some((t) => t.id === e.depositApplicationId && t.paymentId === e.id && t.depositId === e.depositId)) throw Error("Orphan deposit settlement payment.");
	}
});
//#endregion
//#region src/features/accounting/data/inventoryAccountingPostingService.ts
function $g(e) {
	return P.requireBySystemRole(e).id;
}
function e_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function t_(e) {
	return F.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function n_(e) {
	let t = $r.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var r_ = {
	postSalesFulfilment(e) {
		let t = t_(e.id);
		if (t) return t;
		let n = e_(n_(e).reduce((e, t) => {
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
				accountId: $g("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: $g("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = t_(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? F.getById(r.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, i_ = /* @__PURE__ */ new Set(), a_ = [], o_ = a_;
function s_() {
	o_ = a_, i_.forEach((e) => e());
}
function c_() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = a_.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function l_(e, t) {
	return L(a_.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function u_(e) {
	let t = K.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.filter(Qt).map((e) => l_(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.filter(Qt).every((e, t) => n[t] >= L(e.quantity));
	K.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function d_(e) {
	let t = $r.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var f_ = {
	subscribe(e) {
		return i_.add(e), () => {
			i_.delete(e);
		};
	},
	getSnapshot() {
		return o_;
	},
	getAll() {
		return o_;
	},
	getById(e) {
		return a_.find((t) => t.id === e);
	},
	getBySalesOrder(e) {
		return a_.filter((t) => t.salesOrderId === e);
	},
	getFulfilledQuantity: l_,
	getRemainingQuantity(e, t) {
		let n = K.getById(e);
		if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let r = n.lines.find((e) => e.id === t);
		if (!r) throw Error("Sales order line was not found.");
		return Qt(r) ? L(r.quantity - l_(e, t)) : 0;
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
		let r = Rr.getById(e.siteId);
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
			if (!Qt(t)) throw Error("Non-stock and service lines do not require inventory dispatch.");
			let i = tn(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let o = nn(t.productId, t.unitId);
			if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
			if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
			let s = L(e.fulfilledQuantity);
			if (t.areaPerPack && !Number.isInteger(e.fulfilledQuantity)) throw Error("Area-based lines must be dispatched in whole packs.");
			let c = l_(n.id, t.id);
			if (s > L(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
			let l = L(s * o.conversionToBase), u = vi.getBalance(r.id, t.productId);
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
			let n = vi.getBalance(r.id, e);
			if (!n || n.quantityOnHand < t) {
				let t = tn(e);
				throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
			}
		}
		let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = c_(), d = o.map((e) => ({
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
			let i = tn(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let a = Ur.create({
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
			fi({
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
			}), vi.issue({
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: t.fulfilledBaseQuantity
			});
		}
		return r_.postSalesFulfilment(f), a_ = [f, ...a_], s_(), u_(n.id), f;
	},
	void(e) {
		if (t().physicalCustomerReturns?.returns.some((t) => t.status === "POSTED" && t.lines.some((t) => t.fulfilmentId === e.fulfilmentId))) throw Error("Reverse physical customer returns before voiding this dispatch.");
		let n = a_.find((t) => t.id === e.fulfilmentId);
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
		let a = d_(n), o = /* @__PURE__ */ new Set(), s = n.lines.map((e) => {
			let t = tn(e.productId);
			if (!t) throw Error(`Product ${e.sku} was not found.`);
			let r = a.find((t) => !o.has(t.id) && t.siteId === n.siteId && t.productId === e.productId && Math.abs(t.quantityBase) === e.fulfilledBaseQuantity);
			if (!r) throw Error(`Unique original inventory cost issue for ${e.sku} was not found.`);
			return o.add(r.id), {
				line: e,
				product: t,
				originalIssue: r
			};
		});
		r_.reverseSalesFulfilment({
			fulfilment: n,
			reversalDate: e.voidDate,
			reason: r
		});
		for (let t of s) {
			let { line: i, product: a, originalIssue: o } = t, s = Ur.create({
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
			pi({
				siteId: n.siteId,
				productId: i.productId,
				quantityBase: i.fulfilledBaseQuantity,
				unitCostBase: o.unitCostBase,
				inventoryValue: Tr(Math.abs(o.valueChange)),
				referenceType: "SALE",
				referenceId: n.id,
				referenceNumber: n.fulfilmentNumber,
				inventoryMovementId: s.id,
				occurredAt: e.voidDate,
				notes: `Void sales fulfilment ${n.fulfilmentNumber}: ${r}`
			}), vi.receive({
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
		return a_ = a_.map((e) => e.id === c.id ? c : e), s_(), u_(n.salesOrderId), c;
	}
};
i("fulfilments", {
	repository: f_,
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: a_ }),
	restore: (e) => {
		a_ = e.fulfilments, o_ = a_;
	},
	publish: () => i_.forEach((e) => e())
});
//#endregion
//#region src/features/customer-returns/customerReturnRepository.ts
var X = E().trim().min(1).max(200), p_ = f().finite().positive().refine((e) => Math.round(e * 1e4) / 1e4 === e), m_ = f().finite().nonnegative(), h_ = e({
	operationId: X,
	invoiceId: X,
	creditNoteId: X.optional(),
	returnDate: X,
	reason: E().trim().min(3).max(2e3),
	lines: s(e({
		costMovementId: X,
		invoiceLineId: X,
		quantity: p_
	}).strict()).min(1).max(500)
}).strict(), g_ = e({
	costMovementId: X,
	invoiceLineId: X,
	fulfilmentId: X,
	productId: X,
	unitId: X,
	baseUnitId: X,
	siteId: X,
	description: E(),
	quantity: p_,
	conversionToBase: p_,
	quantityBase: p_,
	inventoryValue: m_,
	unitCostBase: m_,
	movementId: X,
	restoredCostId: X,
	reversalMovementId: X.optional(),
	reversalCostId: X.optional()
}).strict(), __ = e({
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
	lines: s(g_).min(1),
	inventoryValue: m_,
	journalId: X.optional(),
	createdBy: X,
	createdAt: X,
	reversalDate: X.optional(),
	reversalReason: X.optional(),
	reversedBy: X.optional()
}).strict(), v_ = [], y_ = 0, b_ = /* @__PURE__ */ new Set(), x_ = () => {
	y_++, b_.forEach((e) => e());
}, S_ = (e) => Math.round(e * 1e4) / 1e4, C_ = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function w_(e, t, n) {
	if ($r.getAll().some((r) => r.siteId === e && r.productId === t && ve(r.occurredAt) > n)) throw Error("Return date precedes later inventory activity at this site.");
}
function T_(e) {
	let t = K.getAll().find((t) => t.id === e && t.type === "INVOICE");
	if (!t || t.type !== "INVOICE" || ["VOID", "DRAFT"].includes(t.status) || t.openingBalanceImportId) return [];
	let n = [];
	for (let e of f_.getAll().filter((e) => e.salesOrderId === t.sourceSalesOrderId && e.status === "ACTIVE")) {
		let r = /* @__PURE__ */ new Set();
		for (let i of e.lines) {
			let a = t.lines.find((e) => e.id === i.salesOrderLineId && e.productId === i.productId && e.unitId === i.unitId), o = $r.getAll().find((t) => t.referenceType === "SALE" && t.referenceId === e.id && t.movementType === "ISSUE" && t.productId === i.productId && Ur.getAll().some((e) => e.id === t.inventoryMovementId && e.transactionUnitId === i.unitId) && t.siteId === e.siteId && S_(-t.quantityBase) === S_(i.fulfilledBaseQuantity) && !r.has(t.id));
			if (!a || !o) continue;
			r.add(o.id);
			let s = v_.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((e) => e.costMovementId === o.id).reduce((e, t) => e + t.quantityBase, 0);
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
			let t = O.require("sales.payment"), n = h_.parse(e), r = JSON.stringify(n), i = v_.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already used with different customer return data.");
				return i;
			}
			w(n.returnDate), rr(n.returnDate), M();
			let a = K.getAll().find((e) => e.id === n.invoiceId && e.type === "INVOICE");
			if (!a || a.type !== "INVOICE" || n.returnDate < a.documentDate) throw Error("Select an issued invoice and a return date on or after it.");
			let o = T_(a.id), s = /* @__PURE__ */ new Set(), c = n.lines.map((e) => {
				if (s.has(e.costMovementId)) throw Error("Select each original dispatch cost only once.");
				s.add(e.costMovementId);
				let t = o.find((t) => t.costMovementId === e.costMovementId && t.invoiceLineId === e.invoiceLineId);
				if (!t || e.quantity > t.availableQuantity + 1e-8 || n.returnDate < t.dispatchDate) throw Error("Return exceeds dispatched quantities or precedes dispatch.");
				let r = tn(t.productId), i = Rr.getById(t.siteId), c = a.lines.find((t) => t.id === e.invoiceLineId);
				if (!r || !i || i.status !== "ACTIVE") throw Error("An active original receiving site and product are required.");
				if ((c.areaPerPack || r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(r.units.find((e) => e.id === t.unitId)?.code ?? "")) && !Number.isInteger(e.quantity)) throw Error("Return whole packs in whole quantities.");
				w_(t.siteId, t.productId, n.returnDate);
				let l = S_(e.quantity * t.conversionToBase);
				if (l <= 0) throw Error("Return quantity rounds to zero.");
				let u = v_.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((e) => e.costMovementId === t.costMovementId), d = C_(l + u.reduce((e, t) => e + t.quantityBase, 0) >= t.originalQuantityBase - 1e-8 ? t.originalValue - u.reduce((e, t) => e + t.inventoryValue, 0) : t.originalValue * l / t.originalQuantityBase);
				return {
					...t,
					quantity: e.quantity,
					quantityBase: l,
					inventoryValue: d
				};
			}), l = /* @__PURE__ */ new Map();
			for (let e of c) l.set(e.invoiceLineId, S_((l.get(e.invoiceLineId) ?? 0) + e.quantity));
			let u = n.creditNoteId ? G.getById(n.creditNoteId) : void 0;
			if (n.creditNoteId) {
				if (!u || u.sourceInvoiceId !== a.id || ["VOID", "DRAFT"].includes(u.status) || u.creditDate > n.returnDate) throw Error("Select an issued credit for this invoice dated before receipt.");
				for (let [e, t] of l) {
					let n = u.lines.find((t) => t.id === e)?.quantity ?? 0;
					if (t + v_.filter((e) => e.status === "POSTED" && e.creditNoteId === u.id).flatMap((e) => e.lines).filter((t) => t.invoiceLineId === e).reduce((e, t) => e + t.quantity, 0) > n + 1e-8) throw Error("Physical return exceeds the linked credit quantities.");
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
			let d = crypto.randomUUID(), f = "CRTN-" + String(v_.length + 1).padStart(6, "0"), p = c.map((e) => {
				vi.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = Ur.create({
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
				}), r = pi({
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
			}), m = C_(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? F.post({
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
			return v_ = [g, ...v_], x_(), g;
		},
		reverse(t) {
			let n = O.require("sales.payment"), r = e({
				id: X,
				reversalDate: X,
				reason: E().trim().min(3).max(2e3)
			}).strict().parse(t), i = v_.find((e) => e.id === r.id);
			if (!i) throw Error("Customer return not found.");
			if (i.status === "REVERSED") return i;
			if (w(r.reversalDate), rr(r.reversalDate), M(), r.reversalDate < i.returnDate) throw Error("Reversal precedes the return.");
			let a = /* @__PURE__ */ new Map();
			for (let e of i.lines) {
				w_(e.siteId, e.productId, r.reversalDate);
				let t = e.siteId + "|" + e.productId, n = a.get(t) ?? {
					quantity: 0,
					value: 0
				};
				a.set(t, {
					quantity: S_(n.quantity + e.quantityBase),
					value: C_(n.value + e.inventoryValue)
				});
			}
			for (let [e, t] of a) {
				let [n, r] = e.split("|"), i = qr.getBalance(n, r);
				if ((vi.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t.quantity || (i?.inventoryValue ?? 0) + .001 < t.value || Math.abs((i?.quantityOnHand ?? 0) - t.quantity) < 1e-8 && Math.abs((i?.inventoryValue ?? 0) - t.value) > .001) throw Error("Returned stock/value has been used; restore stock availability before reversal.");
			}
			let o = G.getById(i.creditNoteId);
			if (i.ownsCredit && ((o.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > r.reversalDate) || G.getAllocationsByCreditNote(o.id).some((e) => (e.reversedAt ? ve(e.reversedAt) : e.allocationDate) > r.reversalDate))) throw Error("Return reversal precedes later credit settlement activity.");
			v_ = v_.map((e) => e.id === i.id ? {
				...e,
				status: "REVERSED"
			} : e), i.ownsCredit && K.voidCreditNote({
				creditNoteId: i.creditNoteId,
				reason: r.reason,
				voidDate: r.reversalDate
			});
			let s = i.lines.map((e) => {
				vi.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = Ur.create({
					movementType: "RETURN_OUT",
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: -e.quantityBase,
					transactionUnitId: e.unitId,
					transactionUnitSymbol: Ur.getAll().find((t) => t.id === e.movementId)?.transactionUnitSymbol ?? "",
					transactionQuantity: -e.quantity,
					conversionToBase: e.conversionToBase,
					referenceType: "CUSTOMER_RETURN_VOID",
					referenceId: i.id,
					referenceNumber: i.number,
					occurredAt: r.reversalDate,
					notes: r.reason
				}), n = qr.requireBalance(e.siteId, e.productId), a = S_(n.quantityOnHand - e.quantityBase), o = C_(n.inventoryValue - e.inventoryValue), s = a ? wr(o / a) : 0;
				qr.save({
					...n,
					quantityOnHand: a,
					inventoryValue: o,
					averageCostPerBaseUnit: s,
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				});
				let c = $r.create({
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
			return v_ = v_.map((e) => e.id === i.id ? c : e), x_(), c;
		}
	},
	read: "inventory.cost.read",
	commands: {
		create: "sales.payment",
		reverse: "sales.payment"
	},
	snapshot: () => ({ returns: v_ }),
	restore: (e) => {
		v_ = e.returns;
	},
	publish: x_,
	validate: (t, n) => {
		let r = e({ returns: s(__) }).strict().parse(t), i = n, a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map();
		for (let e of r.returns) {
			let t = h_.parse(JSON.parse(e.fingerprint));
			if (w(e.returnDate), a.has(e.operationId) || t.operationId !== e.operationId || t.invoiceId !== e.invoiceId || t.returnDate !== e.returnDate || t.reason !== e.reason || t.lines.length !== e.lines.length || e.ownsCredit !== !t.creditNoteId || t.creditNoteId && t.creditNoteId !== e.creditNoteId) throw Error("Customer return request mismatch.");
			a.add(e.operationId);
			let n = i.sales.invoices.find((t) => t.id === e.invoiceId && t.customerId === e.customerId), r = i.customerCredits.creditNotes.find((t) => t.id === e.creditNoteId && t.sourceInvoiceId === e.invoiceId);
			if (!n || !r || e.status === "POSTED" && r.status === "VOID" || e.status === "REVERSED" && e.ownsCredit && r.status !== "VOID" || C_(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue || new Set(e.lines.map((e) => e.costMovementId)).size !== e.lines.length) throw Error("Customer return source or totals mismatch.");
			for (let r of e.lines) {
				let a = t.lines.find((e) => e.costMovementId === r.costMovementId && e.invoiceLineId === r.invoiceLineId), s = i.costMovements.movements.find((e) => e.id === r.costMovementId), c = i.costMovements.movements.find((e) => e.id === r.restoredCostId), l = i.inventoryMovements.movements.find((e) => e.id === r.movementId), u = i.fulfilments.fulfilments.find((e) => e.id === r.fulfilmentId);
				if (!a || a.quantity !== r.quantity || !u || u.salesOrderId !== n.sourceSalesOrderId || !s || s.referenceType !== "SALE" || s.referenceId !== u.id || s.productId !== r.productId || s.siteId !== r.siteId || S_(r.quantity * r.conversionToBase) !== r.quantityBase || !c || c.referenceType !== "CUSTOMER_RETURN" || c.referenceId !== e.id || c.inventoryMovementId !== r.movementId || c.quantityBase !== r.quantityBase || c.valueChange !== r.inventoryValue || !l || l.referenceId !== e.id || l.quantityBase !== r.quantityBase || ve(c.occurredAt) !== e.returnDate) throw Error("Customer return inventory/cost references mismatch.");
				if (e.status === "POSTED") {
					if (u.status !== "ACTIVE") throw Error("Active customer return has a void dispatch.");
					let e = o.get(s.id) ?? {
						quantity: 0,
						value: 0
					}, t = {
						quantity: S_(e.quantity + r.quantityBase),
						value: C_(e.value + r.inventoryValue)
					};
					if (o.set(s.id, t), t.quantity > -s.quantityBase + 1e-8 || t.value > -s.valueChange + .001) throw Error("Customer returns exceed original dispatched stock/cost.");
				}
				if (e.status === "REVERSED") {
					let t = i.costMovements.movements.find((e) => e.id === r.reversalCostId);
					if (!t || t.referenceType !== "CUSTOMER_RETURN_VOID" || t.referenceId !== e.id || t.inventoryMovementId !== r.reversalMovementId || t.quantityBase !== -r.quantityBase || t.valueChange !== -r.inventoryValue || ve(t.occurredAt) !== e.reversalDate) throw Error("Customer return reversal references mismatch.");
				}
			}
			if (e.status === "POSTED") for (let t of e.lines) {
				let n = e.creditNoteId + "|" + t.invoiceLineId, i = S_((c.get(n) ?? 0) + t.quantity);
				if (c.set(n, i), !r.lines.some((e) => e.id === t.invoiceLineId && e.quantity + 1e-8 >= i)) throw Error("Customer returns exceed linked credit quantity.");
			}
			for (let t of new Set(e.lines.map((e) => e.invoiceLineId))) {
				let n = S_(e.lines.filter((e) => e.invoiceLineId === t).reduce((e, t) => e + t.quantity, 0));
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
var E_ = E().trim().min(1).max(200), D_ = E().regex(/^[a-f0-9]{64}$/), O_ = (e) => Array.isArray(e) ? e.map(O_) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, O_(e[t])])) : e, k_ = (e) => Oe("sha256").update(JSON.stringify(O_(e))).digest("hex"), A_ = (e) => e === "Purchase order" || e === "Expense bill draft" ? "purchases.read" : "sales.read", j_ = (e) => e === "Quote" ? "sales.write" : e === "Purchase order" ? "purchases.write" : e === "Expense bill draft" ? "purchases.bill" : "sales.manage";
function M_(e, t) {
	let [n, r] = oe[e];
	return (t[n]?.[r] ?? []).filter((t) => e === "Sales order draft" ? t.kind === "ORDER" : e !== "Invoice draft" || t.kind === "INVOICE");
}
function N_(e, t, n) {
	let r = M_(e, n).find((e) => e.id === t);
	if (!r) throw Error("Document was not found in the selected dataset.");
	return r;
}
function P_(e, t, n) {
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
function F_(e, n = t()) {
	return xe.filter((t) => g(e, A_(t))).flatMap((t) => M_(t, n).map((r) => {
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
			token: k_({
				record: r,
				lifecycle: i?.id ?? ""
			}),
			deleted: i?.action === "Trashed",
			last: i,
			canWrite: g(e, j_(t)),
			issues: P_(t, r, n)
		};
	}));
}
var I_ = e({
	operationId: E_,
	action: T(["Trashed", "Recovered"]),
	reason: E().trim().min(3).max(2e3),
	records: s(e({
		kind: T(xe),
		recordId: E_,
		token: D_
	}).strict()).min(1).max(100)
}).strict(), L_ = e({
	id: E_,
	operationId: E_,
	fingerprint: D_,
	kind: T(xe),
	recordId: E_,
	action: T([
		"Trashed",
		"Recovered",
		"Purged"
	]),
	actorId: E_,
	at: Me(),
	reason: E().trim().min(3).max(2e3),
	recordToken: D_,
	contentToken: D_
}).strict(), R_ = s(e({
	kind: T(xe),
	recordId: E_,
	token: D_
}).strict()).min(1).max(100), z_ = e({
	operationId: E_,
	records: R_,
	expectedDigest: D_,
	reason: E().trim().min(10).max(2e3),
	confirmation: E()
}).strict(), B_ = e({
	id: de(),
	fileName: E().regex(/^pre-purge-[a-f0-9-]+\.json$/),
	sha256: D_,
	createdAt: Me()
}).strict().refine((e) => e.fileName === `pre-purge-${e.id}.json`, "Backup filename and identity must match."), V_ = e({
	previewDigest: D_,
	confirmation: E(),
	backup: B_,
	label: E_,
	reservedNumber: E_.optional(),
	creationOperationId: E_.optional()
}).strict(), H_ = L_.extend({ purge: V_.optional() }), U_ = /* @__PURE__ */ new Map();
function W_() {
	let e = O.require("users.manage");
	if (!e.roles.includes("ADMIN")) throw Error("Only an ADMIN may permanently purge documents.");
	return e;
}
function G_(e, t) {
	if (typeof e == "string") {
		if (e === t || e.startsWith(t + ":")) return !0;
		if ((e.startsWith("{") || e.startsWith("[")) && e.length < 5e7) try {
			return G_(JSON.parse(e), t);
		} catch {}
		return !1;
	}
	return Array.isArray(e) ? e.some((e) => G_(e, t)) : !!e && typeof e == "object" && Object.values(e).some((e) => G_(e, t));
}
function K_(e, t, n) {
	let r = P_(e, t, n), [i, a] = oe[e];
	for (let [o, s] of Object.entries(n)) {
		if (o === "documentRecycle") continue;
		let n = s;
		if (o === i && (n = {
			...s,
			[a]: s[a].filter((e) => e.id !== t.id)
		}), o === "financialCache" && e === "Purchase order") {
			let e = s.purchaseOrders?.find((e) => e.id === t.id);
			(!e || k_(e) !== k_(t)) && r.push("Purchase order cache does not match its source."), n = {
				...s,
				purchaseOrders: s.purchaseOrders.filter((e) => e.id !== t.id)
			};
		}
		G_(n, t.id) && r.push(`Referenced by ${o}; permanent purge is blocked.`);
	}
	return G_(A.list(), t.id) && r.push("Referenced by the financial operation journal."), [...new Set(r)];
}
function q_(e, t) {
	if (new Set(e.map((e) => e.recordId)).size !== e.length) throw Error("Select each document only once.");
	return e.map((e) => {
		let n = N_(e.kind, e.recordId, t), r = me().findLast((t) => t.recordId === e.recordId);
		if (k_({
			record: n,
			lifecycle: r?.id ?? ""
		}) !== e.token) throw Error("Document changed. Refresh the selection.");
		let i = K_(e.kind, n, t);
		return r?.action !== "Trashed" && i.push("Move this draft to the recycle bin before permanent purge."), {
			...e,
			label: n.documentNumber ?? n.purchaseOrderNumber ?? `${n.kind} · ${n.id}`,
			blockers: i
		};
	});
}
function J_(e, t) {
	return k_({
		records: e,
		snapshots: t,
		operations: A.list()
	});
}
i("documentRecycle", {
	repository: {
		preparePurge(n) {
			let r = W_(), i = e({ records: R_ }).strict().parse(n), a = t(), o = q_(i.records, a), s = k_({
				nonce: crypto.randomUUID(),
				actor: r.userId,
				evidence: J_(i.records, a)
			}), c = Date.now() + 3e5;
			for (let [e, t] of U_) t.expires < Date.now() && U_.delete(e);
			return U_.size >= 100 && U_.delete(U_.keys().next().value), U_.set(s, {
				actor: r.userId,
				expires: c,
				evidence: J_(i.records, a)
			}), {
				digest: s,
				expiresAt: new Date(c).toISOString(),
				rows: o,
				confirmation: `PURGE ${o.length} DRAFTS`,
				eligible: o.every((e) => !e.blockers.length)
			};
		},
		purge(e) {
			let n = W_(), r = z_.parse(e), i = k_({
				input: r,
				actorId: n.userId
			}), a = me().filter((e) => e.operationId === r.operationId);
			if (a.length) {
				if (a[0].fingerprint !== i) throw Error("Operation ID has different purge data.");
				return structuredClone(a);
			}
			let o = t(), s = U_.get(r.expectedDigest);
			if (!s || s.actor !== n.userId || s.expires < Date.now() || s.evidence !== J_(r.records, o)) throw Error("Purge preview expired or data changed. Prepare a fresh preview.");
			let c = q_(r.records, o);
			if (r.confirmation !== `PURGE ${c.length} DRAFTS`) throw Error("Type the exact permanent purge confirmation.");
			if (c.some((e) => e.blockers.length)) throw Error(c.flatMap((e) => e.blockers).join(" "));
			let l = B_.parse(u()), d = (/* @__PURE__ */ new Date()).toISOString(), f = c.map((e) => {
				let t = N_(e.kind, e.recordId, o);
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
					contentToken: k_(t),
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
				p("Quote").size && xu(p("Quote")), p("Purchase order").size && Pn(p("Purchase order"));
				let e = /* @__PURE__ */ new Set([
					...p("Sales order draft"),
					...p("Invoice draft"),
					...p("Expense bill draft")
				]);
				e.size && vf(e), Ce([...me(), ...f]);
			}), structuredClone(f);
		},
		list() {
			return F_(O.require("inventory.read"));
		},
		detail(e, n) {
			return e = T(xe).parse(e), O.require("inventory.read"), O.require(A_(e)), structuredClone(N_(e, E_.parse(n), t()));
		},
		change(e) {
			let n = I_.parse(e), r = O.require("inventory.read");
			n.records.forEach((e) => {
				O.require(A_(e.kind)), O.require(j_(e.kind));
			});
			let i = k_({
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
				let t = N_(e.kind, e.recordId, o);
				if (k_({
					record: t,
					lifecycle: me().findLast((t) => t.recordId === e.recordId)?.id ?? ""
				}) !== e.token) throw Error("Document changed. Refresh and review the selection again.");
				if (_e(e.recordId) !== (n.action === "Recovered")) throw Error("Document recycle state changed. Refresh the selection.");
				let r = P_(e.kind, t, o);
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
				contentToken: k_(N_(e.kind, e.recordId, o))
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
	view: (e) => ({ history: me().filter((t) => g(e, A_(t.kind))) }),
	validate: (t, n) => {
		let { history: r } = e({ history: s(H_) }).strict().parse(t), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
		for (let e of r) {
			if (i.has(e.id)) throw Error("Duplicate recycle event.");
			i.add(e.id);
			let t = r.findLast((t) => t.recordId === e.recordId);
			if (r.some((t) => t.recordId === e.recordId && t.kind !== e.kind)) throw Error("Recycle document kind changed.");
			let s = t.action === "Purged" ? void 0 : N_(e.kind, e.recordId, n);
			if (a.get(e.recordId) === "Purged" || e.action === "Purged" && a.get(e.recordId) !== "Trashed") throw Error("Invalid permanent purge lifecycle.");
			if (e.action === "Purged") {
				if (e.reason.trim().length < 10) throw Error("Permanent purge reason is too short.");
				if (!e.purge || M_(e.kind, n).some((t) => t.id === e.recordId)) throw Error("Purged source must be absent and its backup receipt retained.");
				if (r.slice(0, r.indexOf(e)).findLast((t) => t.recordId === e.recordId)?.contentToken !== e.contentToken) throw Error("Purge content receipt changed.");
				for (let [t, r] of Object.entries(n)) if (t !== "documentRecycle" && G_(r, e.recordId)) throw Error("Purged document still has references.");
				if (xe.flatMap((e) => M_(e, n)).some((t) => e.purge?.creationOperationId && t.operationId === e.purge.creationOperationId || e.purge?.reservedNumber && (t.documentNumber === e.purge.reservedNumber || t.purchaseOrderNumber === e.purge.reservedNumber))) throw Error("Purged document identity was reused.");
			} else if (e.purge) throw Error("Unexpected permanent purge receipt.");
			if ((a.get(e.recordId) ?? "Recovered") === e.action) throw Error("Invalid recycle lifecycle sequence.");
			if (!r.slice(r.indexOf(e) + 1).some((t) => t.recordId === e.recordId) && e.action === "Trashed" && (P_(e.kind, s, n).length || k_(s) !== e.contentToken)) throw Error("Recycled document content or references changed.");
			a.set(e.recordId, e.action), o.set(e.operationId, [...o.get(e.operationId) ?? [], e]);
		}
		for (let e of o.values()) {
			let t = e[0], n = e.map((e) => ({
				kind: e.kind,
				recordId: e.recordId,
				token: e.recordToken
			}));
			if (new Set(n.map((e) => e.recordId)).size !== n.length || e.some((e) => e.fingerprint !== t.fingerprint || e.action !== t.action || e.actorId !== t.actorId || e.at !== t.at || e.reason !== t.reason) || k_({
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
			}) !== t.fingerprint || t.action === "Purged" && (t.purge?.confirmation !== `PURGE ${n.length} DRAFTS` || e.some((e) => k_(e.purge?.backup) !== k_(t.purge?.backup) || e.purge?.previewDigest !== t.purge?.previewDigest || e.purge?.confirmation !== t.purge?.confirmation))) throw Error("Invalid recycle operation receipt.");
		}
	}
});
//#endregion
//#region src/features/contacts/schemas/supplierSchemas.ts
var Y_ = ["ACTIVE", "INACTIVE"], X_ = E().trim().refine((e) => e === "" || E().email().safeParse(e).success, { message: "Enter a valid email address" }), Z_ = E().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), Q_ = e({
	businessName: E().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: E().trim().max(120, "Trading name is too long"),
	abn: Z_,
	status: T(Y_),
	email: X_,
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
}), $_ = e({
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
}).strict(), ev = e({
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
	units: s($_).min(1),
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
}).strict(), tv = /* @__PURE__ */ new Set(), nv = [...en];
function rv() {
	nv = [...en], tv.forEach((e) => e());
}
function iv(e, t, n) {
	if (Array.isArray(e)) return e.some((e) => iv(e, t, n));
	if (!e || typeof e != "object") return !1;
	let r = e;
	return r.productId === t && (!n || r.unitId === n) || Object.values(r).some((e) => iv(e, t, n));
}
function av(e) {
	let t = s(ev).parse(e), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.id) || r.has(e.sku.toLowerCase())) throw Error("Duplicate product ID or SKU.");
		if (n.add(e.id), r.add(e.sku.toLowerCase()), !Zt(e) && e.buyEnabled !== !1) throw Error("Non-stock/service catalogue items must use expense bills for purchasing.");
		if (!Zt(e) && ((e.reorderPoint ?? 0) !== 0 || (e.targetStock ?? 0) !== 0)) throw Error("Non-stock/service items cannot have stock reorder thresholds.");
		if (Zt(e) && e.units.some((e) => e.code === "HOUR" || e.code === "JOB")) throw Error("Hour/job units require non-stock or service items.");
		if (new Set(e.units.map((e) => e.id)).size !== e.units.length || e.units.filter((e) => e.isBaseUnit).length !== 1 || !e.units.some((t) => t.id === e.baseUnitId && t.isBaseUnit && t.conversionToBase === 1)) throw Error("A product needs exactly one valid base unit.");
		if ((e.targetStock ?? 0) < (e.reorderPoint ?? 0)) throw Error("Target stock must be at least the reorder point.");
	}
	return t;
}
var ov = {
	subscribe(e) {
		return tv.add(e), () => {
			tv.delete(e);
		};
	},
	getSnapshot: () => nv,
	getAll: () => en,
	getById: (e) => en.find((t) => t.id === e),
	save(e, n) {
		let r = ev.parse(e), i = en.find((e) => e.id === r.id);
		if (i && n !== (i.revision ?? 0)) throw Error("Product changed since it was opened. Reload before saving.");
		if (!i && n !== void 0) throw Error("Product no longer exists.");
		if (ue(r.taxCode ?? "GST"), !Zt(r) && r.buyEnabled !== !1) throw Error("Non-stock and service catalogue items are sales-only. Use expense/service bills for supplier costs.");
		let a = t();
		if (delete a.products, i) {
			let e = { ...a };
			if (delete e.costingPolicies, (i.itemType ?? "STOCK") !== (r.itemType ?? "STOCK") && iv(e, r.id)) throw Error("A referenced product cannot change item type. Create a new catalogue item.");
			if (i.baseUnitId !== r.baseUnitId && iv(a, r.id)) throw Error("A referenced product cannot change base unit.");
			for (let e of i.units) {
				let t = r.units.find((t) => t.id === e.id);
				if ((!t || t.conversionToBase !== e.conversionToBase || t.code !== e.code) && iv(a, r.id, e.id)) throw Error("A referenced unit conversion cannot be changed or removed. Add a new unit instead.");
			}
		}
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			...r,
			createdAt: i?.createdAt ?? o,
			updatedAt: o,
			revision: (i?.revision ?? 0) + 1
		};
		return av([...en.filter((e) => e.id !== r.id), s]), i ? en.splice(en.indexOf(i), 1, s) : en.push(s), ii.ensureProductPolicy(s.id, s.baseUnitId, Zt(s)), i && Zt(i) !== Zt(s) && ii.setActive(s.id, Zt(s)), rv(), s;
	}
};
i("products", {
	validate: (e, t) => {
		let n = av(e.products), r = t.workspace_tax_codes.records, i = t.costingPolicies.policies, a = t.stock.balances;
		for (let e of n.filter((e) => !Zt(e))) if (i.some((t) => t.productId === e.id && t.active) || a.some((t) => t.productId === e.id && t.quantityOnHand !== 0)) throw Error("Non-stock/service product has inventory activity or active costing.");
		if (n.some((e) => !r.some((t) => t.code === (e.taxCode ?? "GST")))) throw Error("Backup product tax-code reference is invalid.");
	},
	repository: ov,
	read: "inventory.read",
	commands: { save: "inventory.adjust" },
	snapshot: () => ({ products: structuredClone(en) }),
	restore: (e) => {
		let t = av(e.products);
		en.splice(0, en.length, ...t), nv = [...en];
	},
	publish: rv
});
//#endregion
//#region electron/security/transferRepository.ts
var sv = E().trim().min(1).max(200), cv = E().trim().min(1).max(2e3), lv = (e) => Array.isArray(e) ? e.map(lv) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).filter(([, e]) => e !== void 0).sort(([e], [t]) => e < t ? -1 : +(e > t)).map(([e, t]) => [e, lv(t)])) : e, uv = (e) => Oe("sha256").update(JSON.stringify(lv(e))).digest("hex"), dv = [], fv = (e, t = !1) => {
	O.require("inventory.read");
	let n = O.require(Ya[e].read);
	return t && O.require(Ya[e].write), n.userId;
};
function pv(e) {
	return e === "Customers" ? W.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Suppliers" ? vn.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Products" ? ov.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : W.getAll().flatMap((t) => (e === "Customer branches" ? t.locations : t.contacts).map((e) => ({
		id: e.id,
		parentId: t.id,
		raw: e
	})));
}
function mv(e, t) {
	let n = {};
	for (let [r, i] of Object.entries(qa[e])) n[r] = String(t.raw[r] ?? i);
	if ((e === "Customer branches" || e === "Customer contacts") && (n.customerId = t.parentId), e === "Products") {
		let e = t.raw;
		n.taxCode = e.taxCode ?? "", n.itemType = e.itemType ?? "STOCK", n.buyEnabled = String(e.buyEnabled ?? (e.itemType === void 0 || e.itemType === "STOCK")), n.baseUnitCode = e.units.find((t) => t.id === e.baseUnitId).code, n.unitsJson = JSON.stringify(e.units);
	}
	return n;
}
function hv(e, t) {
	return {
		_format: Ga,
		id: t.id,
		recordToken: uv({
			parentId: t.parentId,
			record: t.raw
		}),
		externalId: dv.filter((t) => t.dataset === e).flatMap((e) => e.results).find((e) => e.action === "Created" && e.recordId === t.id)?.externalId ?? "",
		...mv(e, t)
	};
}
function gv(e, t) {
	if (!/^-?\d+(?:\.\d+)?$/.test(e) || !Number.isFinite(Number(e)) || Math.abs(Number(e)) > 2 ** 53 - 1) throw Error(`${t} must contain a safe plain number.`);
	return Number(e);
}
function _v(e, t, n) {
	let r = n ? mv(e, n) : { ...qa[e] };
	for (let n of Object.keys(qa[e])) if (Object.hasOwn(t, n)) {
		let i = t[n].trim();
		if (typeof qa[e][n] == "number") r[n] = gv(i, n);
		else if (typeof qa[e][n] == "boolean") {
			if (!["true", "false"].includes(i)) throw Error(`${n} must be true or false.`);
			r[n] = i === "true";
		} else r[n] = i.trim();
	}
	if (n) for (let [n, i] of Object.entries(qa[e])) Object.hasOwn(t, n) || (typeof i == "number" && (r[n] = Number(r[n])), typeof i == "boolean" && (r[n] = r[n] === "true"));
	return r;
}
var vv = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), yv = (e, t) => e.some((e) => e.reasons.some((n) => !t.some((t) => t.id === e.id && t.reasons.includes(n))));
function bv(e, t) {
	return t.map((t) => ({
		id: t.id,
		reasons: [
			...vv(t.businessName) === vv(e.businessName) ? ["Name"] : [],
			...e.email && t.email?.toLowerCase() === e.email.toLowerCase() ? ["Email"] : [],
			...e.abn && vv(t.abn) === vv(e.abn) ? ["Identifier"] : []
		]
	})).filter((e) => e.reasons.length);
}
function xv(t, n, r, i = !1) {
	let a = r.id ? pv(t).find((e) => e.id === r.id) : void 0;
	if (n === "Update by ID") {
		if (!a) throw Error("Existing record ID was not found.");
		if (!i && (!r.recordToken || r.recordToken !== hv(t, a).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
	} else if (r.id || r.recordToken) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
	if (n === "Update by ID" && r.externalId && r.externalId !== hv(t, a).externalId) throw Error("External source IDs cannot be reassigned by an update. Keep the export value or leave it blank.");
	let o = n === "Update by ID" ? a : void 0, c = o ? hv(t, o) : null, l = _v(t, r, o), u;
	if (t === "Customers") {
		let e = hc.strict().parse(l), t = W.getAll().filter((e) => e.id !== o?.id);
		if (yv(Va({
			kind: "Customer",
			customerId: "",
			values: e
		}, t), o ? Va({
			kind: "Customer",
			customerId: "",
			values: o.raw
		}, t) : [])) throw Error("Possible existing customer duplicate. Use the customer review workflow or explicit ID update.");
		u = o ? W.update(o.id, e) : W.create(e);
	} else if (t === "Suppliers") {
		let e = Q_.strict().parse(l), t = vn.getAll().filter((e) => e.id !== o?.id);
		if (yv(bv(e, t), o ? bv(o.raw, t) : [])) throw Error("Possible existing supplier duplicate. Resolve it before import.");
		u = o ? vn.update(o.id, e) : vn.create(e);
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
		let h = ev.parse({
			...p,
			id: o?.id ?? crypto.randomUUID(),
			baseUnitId: a.id,
			units: i,
			createdAt: n?.createdAt ?? m,
			updatedAt: m
		});
		u = ov.save(h, n?.revision ?? (o ? 0 : void 0));
	} else {
		let e = String(l.customerId), n = W.getById(e);
		if (!n || n.status === "INACTIVE") throw Error("Select an existing, non-inactive parent customer.");
		if (o && o.parentId !== e) throw Error("Existing branch/contact cannot move to a different customer.");
		let { customerId: r, ...i } = l, a = t === "Customer branches" ? "Branch" : "Contact", s = a === "Branch" ? gc.strict().parse(i) : _c.strict().parse(i);
		if (yv(Va({
			kind: a,
			customerId: e,
			values: s
		}, [n]).filter((e) => e.id !== o?.id), o ? Va({
			kind: a,
			customerId: e,
			values: o.raw
		}, [n]).filter((e) => e.id !== o.id) : [])) throw Error("Possible existing branch/contact duplicate. Use customer review or explicit ID update.");
		u = a === "Branch" ? o ? W.updateLocation(e, o.id, s) : W.addLocation(e, s) : o ? W.updateContact(e, o.id, s) : W.addContact(e, s);
	}
	let d = pv(t).find((e) => e.id === u.id);
	return {
		recordId: u.id,
		before: c,
		after: hv(t, d)
	};
}
function Sv(e) {
	if (fv(e.dataset, !0), Buffer.byteLength(e.text, "utf8") > 1e6) throw Error("CSV source exceeds 1 MB of UTF-8 text.");
	let n = Za(e), r = new Map(pv(e.dataset).map((t) => [t.id, hv(e.dataset, t)])), i = t(), a = uv({
		input: e,
		master: i
	}), o = /* @__PURE__ */ new Set(), s = [], c = [];
	try {
		for (let t of n.rows) {
			let n = t.values, i = (n.externalId ?? "").trim(), a = uv({
				dataset: e.dataset,
				values: Object.fromEntries(Object.keys(qa[e.dataset]).filter((e) => Object.hasOwn(n, e)).map((e) => [e, n[e]]))
			}), l = e.mode === "Create" ? i : n.id, u = "", d;
			try {
				if (!l) throw Error(e.mode === "Create" ? "externalId is required for safe create retries." : "id is required for explicit updates.");
				if (l.length > 200 || i.length > 200) throw Error("Import identity exceeds 200 characters.");
				if (o.has(l)) throw Error("Repeated identity in this CSV file.");
				if (o.add(l), e.mode === "Create" && (n.id || n.recordToken)) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
				if (e.mode === "Update by ID" && (!r.has(n.id) || n.recordToken !== r.get(n.id).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
				let c = e.mode === "Create" ? dv.filter((t) => t.dataset === e.dataset).flatMap((e) => e.results).find((e) => e.action === "Created" && e.externalId === i) : void 0;
				if (c) {
					if (c.identityFingerprint !== a) throw Error("Source externalId already contains different creation data. Use an explicit ID update.");
					let n = pv(e.dataset).find((e) => e.id === c.recordId);
					if (!n) throw Error("Prior imported record is missing.");
					d = {
						row: t.row,
						externalId: i,
						recordId: n.id,
						action: "Skipped",
						identityFingerprint: a,
						before: null,
						after: hv(e.dataset, n)
					};
				} else {
					let o = xv(e.dataset, e.mode, n, !0);
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
				let r = pv(e.dataset).find((e) => e.id === n.recordId), a = hv(e.dataset, r);
				if (t.values = Object.fromEntries(Object.keys(qa[e.dataset]).filter((e) => Object.hasOwn(a, e)).map((e) => [e, a[e]])), e.dataset === "Products") {
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
var Cv = {
	review(e) {
		return Sv(Xa.parse(e)).preview;
	},
	commit(e) {
		let t = Xa.extend({
			operationId: sv,
			expectedPreview: E().regex(/^[a-f0-9]{64}$/),
			reason: cv
		}).strict().parse(e), n = fv(t.dataset, !0), { operationId: r, expectedPreview: i, reason: a, ...o } = t, s = uv({
			source: o,
			reason: a
		}), c = dv.find((e) => e.operationId === r);
		if (c) {
			if (c.fingerprint !== s) throw Error("Operation ID already has different import data.");
			return structuredClone(c);
		}
		let l = Sv(o);
		if (l.preview.fingerprint !== i) throw Error("Business records or import fields changed. Validate the file again.");
		if (!l.preview.valid) throw Error("Resolve every validation error before committing the batch.");
		let u = Za(o), d = new Set(u.rows.map((e) => e.values.customerId || pv(o.dataset).find((t) => t.id === e.values.id)?.parentId || "")), f = (e) => JSON.stringify({
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
				...xv(o.dataset, o.mode, t.values, !0),
				before: n.before
			});
		}
		for (let e of m) {
			let t = pv(o.dataset).find((t) => t.id === e.recordId);
			e.after = hv(o.dataset, t), e.action === "Created" && (e.after.externalId = e.externalId);
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
		return Ev.parse(h), dv = [...dv, h], structuredClone(h);
	},
	export(e) {
		e = T(Ua).parse(e), fv(e);
		let t = Ja(e), n = pv(e).map((t) => hv(e, t));
		return {
			dataset: e,
			count: n.length,
			csv: Qa([t, ...n.map((e) => t.map((t) => e[t] ?? ""))])
		};
	},
	template(e) {
		e = T(Ua).parse(e), fv(e);
		let t = Ja(e).filter((e) => !["id", "recordToken"].includes(e)), n = {
			_format: Ga,
			externalId: "replace-with-stable-source-id",
			...Object.fromEntries(Object.entries(qa[e]).map(([e, t]) => [e, String(t)]))
		};
		return (e === "Customers" || e === "Suppliers") && (n.businessName = "Replace company name"), e === "Suppliers" && (n.country = "Replace country"), e === "Customer branches" && (n.name = "Replace branch name", n.addressLine1 = "Replace address", n.suburb = "Replace city", n.state = "Replace region", n.postcode = "Replace postcode", n.country = "Replace country"), e === "Customer contacts" && (n.firstName = "Replace", n.lastName = "Name", n.email = "replace@example.test"), e === "Products" && (n.sku = "REPLACE-SKU", n.name = "Replace product name"), Qa([t, t.map((e) => n[e] ?? "")]);
	}
}, wv = se(E(), E()), Tv = e({
	row: f().int().min(2).max(501),
	externalId: E().max(200),
	recordId: sv,
	action: T([
		"Created",
		"Updated",
		"Skipped"
	]),
	identityFingerprint: E().regex(/^[a-f0-9]{64}$/),
	before: wv.nullable(),
	after: wv
}).strict(), Ev = e({
	id: sv,
	operationId: sv,
	fingerprint: E().regex(/^[a-f0-9]{64}$/),
	dataset: T(Ua),
	mode: T(Wa),
	fileName: sv,
	sourceHash: E().regex(/^[a-f0-9]{64}$/),
	actorId: sv,
	at: E().refine((e) => new Date(e).toISOString() === e),
	reason: cv,
	results: s(Tv).min(1).max(500),
	parentChanges: s(e({
		customerId: sv,
		before: E().max(5e6),
		after: E().max(5e6)
	}).strict()).max(500)
}).strict();
i("dataTransfers", {
	repository: Cv,
	read: "inventory.read",
	commands: {
		review: "inventory.read",
		commit: "inventory.read",
		export: "inventory.read",
		template: "inventory.read"
	},
	snapshot: () => ({ runs: dv }),
	restore: (e) => {
		dv = e.runs;
	},
	publish: () => {},
	view: (e) => ({ runs: dv.filter((t) => g(e, Ya[t.dataset].read)) }),
	validate: (t, n) => {
		let r = e({ runs: s(Ev) }).strict().parse(t), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set();
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
				if (e.before && (Object.keys(e.before).some((e) => !Ja(t.dataset).includes(e)) || e.before._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(e.before.recordToken))) throw Error("Invalid import before-state audit.");
				if (Object.keys(e.after).some((e) => !Ja(t.dataset).includes(e)) || e.after._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(e.after.recordToken)) throw Error("Invalid import audit fields.");
			}
			if (new Set(t.parentChanges.map((e) => e.customerId)).size !== t.parentChanges.length || t.parentChanges.length && !["Customer branches", "Customer contacts"].includes(t.dataset)) throw Error("Invalid import parent audit.");
			for (let n of t.parentChanges) {
				if (!r.some((e) => e.id === n.customerId)) throw Error("Invalid import parent reference.");
				for (let t of [n.before, n.after]) {
					let n = e({
						primaryLocationId: E().optional(),
						primaryContactId: E().optional(),
						locations: s(e({ id: sv }).passthrough()),
						contacts: s(e({ id: sv }).passthrough())
					}).strict().parse(JSON.parse(t));
					if (n.primaryLocationId && !n.locations.some((e) => e.id === n.primaryLocationId) || n.primaryContactId && !n.contacts.some((e) => e.id === n.primaryContactId)) throw Error("Invalid import primary-record audit.");
				}
			}
		}
	}
});
//#endregion
//#region electron/security/attachmentRepository.ts
var Z = E().trim().min(1).max(200), Dv = E().trim().min(1).max(2e3), Ov = E().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), kv = e({
	id: Z,
	number: f().int().positive(),
	name: Z,
	mime: Z,
	size: f().int().positive().max(p),
	sha256: E().regex(/^[a-f0-9]{64}$/),
	content: E().max(14e6),
	createdAt: Ov,
	createdBy: Z,
	restoredFrom: Z.optional()
}).strict(), Av = e({
	id: Z,
	title: E().trim().min(1).max(200),
	target: _,
	revision: f().int().positive(),
	currentVersionId: Z,
	versions: s(kv).min(1).max(100),
	createdAt: Ov,
	createdBy: Z,
	updatedAt: Ov,
	updatedBy: Z,
	deletedAt: Ov.optional(),
	deletedBy: Z.optional()
}).strict(), jv = (e) => ({
	title: e.title,
	deleted: !!e.deletedAt,
	currentVersionId: e.currentVersionId,
	versionsCount: e.versions.length
}), Mv = e({
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
	at: Ov,
	revision: f().int().positive(),
	reason: Dv,
	versionId: Z.optional(),
	fingerprint: E().regex(/^[a-f0-9]{64}$/),
	after: e({
		title: Z,
		deleted: y(),
		currentVersionId: Z,
		versionsCount: f().int().positive()
	}).strict()
}).strict(), Nv = [], Pv = [];
function Fv() {
	return O.require("inventory.read");
}
var Iv = () => t([...new Set(Object.values(o).map((e) => e.repository))]);
function Lv(e, t, r = Iv()) {
	return n(r, t).find((t) => t.kind === e.kind && t.id === e.id);
}
function Rv(e, t = !1) {
	let n = Fv(), r = Lv(e, n);
	if (!r) throw Error("Business link was not found or access is denied.");
	if (t && !r.canWrite) throw Error("Permission denied: attachment maintenance requires the linked object write permission.");
	return n.userId;
}
function zv(e, t = !1) {
	let n = Nv.find((t) => t.id === Z.parse(e));
	if (!n) throw Error("Attachment not found or access denied.");
	return Rv(n.target, t), n;
}
var Bv = (e) => Oe("sha256").update(JSON.stringify(e)).digest("hex"), Vv = (e, t) => {
	let n = Lv(e.target, t);
	return {
		...e,
		targetLabel: n.label,
		targetPath: n.path,
		canWrite: n.canWrite,
		versions: e.versions.map(({ content: e, ...t }) => t)
	};
};
function Hv(e, t) {
	if (e.revision !== t) throw Error("Attachment changed. Refresh before continuing.");
}
function Uv(e, t) {
	if (t < e.updatedAt) throw Error("System clock precedes the last attachment change.");
}
function Wv(e) {
	if (Nv.flatMap((e) => e.versions).reduce((e, t) => e + t.size, 0) + e > 5e7) throw Error("Local attachment library exceeds 50 MB including versions and trash. Export/archive the business profile before adding more files.");
}
function Gv(e, t) {
	let n = Pv.find((t) => t.operationId === e);
	if (!n) return;
	let r = zv(n.documentId, !0);
	if (n.fingerprint !== t) throw Error("Operation ID already has different attachment data.");
	return Vv(r, O.current());
}
function Kv(e, t, n, r, i, a) {
	return Nv = [...Nv.filter((t) => t.id !== e.id), e], Pv = [...Pv, {
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
		after: jv(e)
	}], Vv(e, O.current());
}
i("attachments", {
	repository: {
		targets() {
			return n(Iv(), Fv());
		},
		checkTarget(e) {
			return Rv(_.parse(e), !0), !0;
		},
		upload(t) {
			let n = e({
				operationId: Z,
				id: Z.optional(),
				expectedRevision: f().int().nonnegative(),
				target: _,
				title: Z,
				reason: Dv,
				file: e({
					name: Z,
					content: E().max(14e6)
				}).strict()
			}).strict().parse(t), r = Rv(n.target, !0), i = l(n.file.name, n.file.content), a = Bv({
				...n,
				file: {
					name: i.name,
					sha256: i.sha256
				}
			}), o = Gv(n.operationId, a);
			if (o) return o;
			let s = n.id ? zv(n.id, !0) : void 0;
			if (s) {
				if (Hv(s, n.expectedRevision), JSON.stringify(s.target) !== JSON.stringify(n.target)) throw Error("An attachment retains its original business link.");
				if (s.deletedAt) throw Error("Recover the attachment before adding a version.");
				if (s.versions.some((e) => e.sha256 === i.sha256)) throw Error("These file bytes already exist in this attachment. Use version restore instead.");
				if (s.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
			} else if (n.expectedRevision !== 0) throw Error("A new attachment requires revision zero.");
			if (!s && Nv.some((e) => !e.deletedAt && e.target.kind === n.target.kind && e.target.id === n.target.id && e.versions.some((e) => e.sha256 === i.sha256))) throw Error("This file already exists on the selected business object. Open its existing attachment.");
			Wv(i.size);
			let c = (/* @__PURE__ */ new Date()).toISOString();
			s && Uv(s, c);
			let u = {
				...i,
				id: crypto.randomUUID(),
				number: (s?.versions.length ?? 0) + 1,
				createdAt: c,
				createdBy: r
			};
			return Kv({
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
				reason: Dv,
				title: Z.optional(),
				versionId: Z.optional()
			}).strict().parse(t), r = zv(n.id, !0), i = Bv(n), o = Gv(n.operationId, i);
			if (o) return o;
			Hv(r, n.expectedRevision);
			let s = Rv(r.target, !0), c = (/* @__PURE__ */ new Date()).toISOString();
			Uv(r, c);
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
					Wv(e.size), a(e);
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
			return Kv(l, n.action, n.operationId, i, n.reason, u);
		},
		read(t) {
			let n = e({
				id: Z,
				versionId: Z
			}).strict().parse(t), r = zv(n.id).versions.find((e) => e.id === n.versionId);
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
		documents: Nv,
		history: Pv
	}),
	restore: (e) => {
		Nv = e.documents, Pv = e.history;
	},
	publish: () => {},
	view: (e) => {
		let t = Nv.filter((t) => Lv(t.target, e));
		return {
			documents: t.map((t) => Vv(t, e)),
			history: Pv.filter((e) => t.some((t) => t.id === e.documentId)).map(({ fingerprint: e, ...t }) => t)
		};
	},
	validate: (t, n) => {
		let r = e({
			documents: s(Av),
			history: s(Mv)
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
			if (u !== e.versions.length || m.actorId !== e.updatedBy || m.at !== e.updatedAt || JSON.stringify(m.after) !== JSON.stringify(jv(e))) throw Error("Attachment metadata differs from audit.");
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
function qv(e) {
	let t = Math.round(e * 100);
	if (!Number.isFinite(e) || !Number.isSafeInteger(t) || Math.abs(t / 100 - e) > 1e-7) throw Error("Amounts must be safe currency values with at most two decimals.");
	return t;
}
function Jv(e, t) {
	return e.flatMap((n) => n.lines.flatMap((r, i) => {
		let a = t.find((e) => e.id === r.accountId);
		if (!a || !["REVENUE", "EXPENSE"].includes(a.type)) return [];
		let o = n, s = r;
		if (n.reversedJournalEntryId) {
			let t = e.find((e) => e.id === n.reversedJournalEntryId), a = t?.lines[i];
			if (!t || !a || a.accountId !== r.accountId || qv(a.debit) !== qv(r.credit) || qv(a.credit) !== qv(r.debit)) throw Error("Reversal line does not match its original source.");
			o = t, s = a;
		}
		let c = qv(a.type === "REVENUE" ? r.credit - r.debit : r.debit - r.credit);
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
function Yv(e, t, n, r, i, a) {
	if (w(i, "From date"), w(a, "To date"), i > a) throw Error("From date must not follow to date.");
	let o = Jv(e, t).filter((e) => e.date >= i && e.date <= a), s = o.flatMap((e) => {
		let t = r.find((t) => t.journalId === e.rootJournalId && t.lineId === e.rootLineId), i = e.amount < 0 ? -1 : 1, a = qv(e.capacity), o = (t?.splits ?? []).map((t) => {
			let r = qv(t.amount);
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
		for (let r of s.filter((t) => t.jobId === e)) r.kind === "REVENUE" ? t += qv(r.allocated) : n += qv(r.allocated);
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
			let t = c(e.id), n = qv(Math.round(Number(e.budget) * 100) / 100), r = qv(Math.round(Number(e.costBudget) * 100) / 100);
			return {
				id: e.id,
				name: e.name,
				code: e.code,
				status: e.status,
				...t,
				budget: n / 100,
				costBudget: r / 100,
				budgetProfit: (n - r) / 100,
				revenueVariance: (qv(t.revenue) - n) / 100,
				costVariance: (r - qv(t.cost)) / 100,
				profitVariance: (qv(t.profit) - n + r) / 100
			};
		}),
		unallocated: c(""),
		ledger: {
			revenue: o.filter((e) => e.kind === "REVENUE").reduce((e, t) => e + qv(t.amount), 0) / 100,
			cost: o.filter((e) => e.kind === "EXPENSE").reduce((e, t) => e + qv(t.amount), 0) / 100
		}
	};
}
//#endregion
//#region src/features/job-costing/jobCostingRepository.ts
var Xv = E().trim().min(1).max(200), Zv = E().trim().min(1).max(2e3), Qv = E().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), $v = e({
	jobId: Xv,
	amount: f().finite().positive().refine((e) => {
		try {
			return qv(e), !0;
		} catch {
			return !1;
		}
	})
}).strict(), ey = e({
	id: Xv,
	journalId: Xv,
	lineId: Xv,
	revision: f().int().positive(),
	splits: s($v).max(100),
	updatedAt: Qv,
	updatedBy: Xv
}).strict(), ty = e({
	id: Xv,
	operationId: Xv,
	recordId: Xv,
	revision: f().int().positive(),
	at: Qv,
	actorId: Xv,
	reason: Zv,
	fingerprint: E().max(3e6),
	before: s($v),
	after: s($v)
}).strict(), ny = e({
	operationId: Xv,
	journalId: Xv,
	lineId: Xv,
	expectedRevision: f().int().nonnegative(),
	expectedSource: E().max(2e6),
	splits: s($v).max(100),
	reason: Zv
}).strict(), ry = [], iy = [], ay = /* @__PURE__ */ new Set(), oy = () => ay.forEach((e) => e());
function sy(e, t, n) {
	if (new Set(e.map((e) => e.jobId)).size !== e.length) throw Error("Use one split per project.");
	if (e.some((e) => !n.some((t) => t.id === e.jobId))) throw Error("Project was not found.");
	if (e.reduce((e, t) => e + qv(t.amount), 0) > qv(t)) throw Error("Project splits exceed the source amount.");
}
function cy() {
	return Ca(t().payroll?.runs ?? [], F.getAll());
}
i("jobCosting", {
	repository: {
		subscribe(e) {
			return ay.add(e), () => {
				ay.delete(e);
			};
		},
		getSnapshot: () => ry,
		review() {
			O.require("accounting.read");
			let e = cy();
			return {
				lines: Jv(F.getAll(), P.getAll()).map((t) => ({
					...t,
					payrollManaged: e.some((e) => e.journalId === t.rootJournalId && e.lineId === t.rootLineId)
				})),
				allocations: structuredClone([...ry, ...e]),
				history: structuredClone(iy)
			};
		},
		report(t) {
			O.require("accounting.read");
			let n = e({
				from: E(),
				to: E()
			}).strict().parse(t);
			return Yv(F.getAll(), P.getAll(), x.jobs, [...ry, ...cy()], n.from, n.to);
		},
		save(e) {
			let t = O.require("accounting.post"), n = ny.parse(e), r = JSON.stringify(n), i = iy.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already has different allocation data.");
				return ry.find((e) => e.id === i.recordId);
			}
			let a = Jv(F.getAll(), P.getAll()).find((e) => e.journalId === n.journalId && e.lineId === n.lineId);
			if (!a) throw Error("Select a posted revenue or expense line.");
			if (a.reversal) throw Error("Allocate the original line; reversal entries inherit its splits.");
			if (n.expectedSource !== a.signature) throw Error("Source journal changed. Refresh before allocating.");
			if (cy().some((e) => e.journalId === a.journalId && e.lineId === a.lineId)) throw Error("Frozen payroll project costs are managed through payroll; reverse and replace the source to correct them.");
			let o = ry.find((e) => e.journalId === a.journalId && e.lineId === a.lineId);
			if ((o?.revision ?? 0) !== n.expectedRevision) throw Error("Allocation changed. Refresh before saving.");
			sy(n.splits, a.capacity, x.jobs);
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
			return ry = [...ry.filter((e) => e.id !== c.id), c], iy = [...iy, {
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
			}], oy(), c;
		}
	},
	read: "accounting.read",
	commands: {
		review: "accounting.read",
		report: "accounting.read",
		save: "accounting.post"
	},
	snapshot: () => ({
		allocations: ry,
		history: iy
	}),
	restore: (e) => {
		ry = e.allocations, iy = e.history;
	},
	publish: oy,
	validate: (t, n) => {
		let r = e({
			allocations: s(ey),
			history: s(ty)
		}).strict().parse(t), i = n.workspace_jobs.records, a = Jv(n.journals.journalEntries, n.accounts.accounts), o = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set(), l = Ca(n.payroll?.runs ?? [], n.journals.journalEntries);
		for (let e of r.allocations) {
			if (l.some((t) => t.journalId === e.journalId && t.lineId === e.lineId)) throw Error("Manual allocation duplicates frozen payroll project costs.");
			let t = a.find((t) => t.journalId === e.journalId && t.lineId === e.lineId), n = e.journalId + ":" + e.lineId;
			if (!t || t.reversal || o.has(n)) throw Error("Invalid project source reference.");
			o.add(n), sy(e.splits, t.capacity, i);
			let s = r.history.filter((t) => t.recordId === e.id);
			if (s.length !== e.revision) throw Error("Invalid allocation history length.");
			let c = [], u = "";
			for (let [n, r] of s.entries()) {
				let a = ny.parse(JSON.parse(r.fingerprint));
				if (r.revision !== n + 1 || r.at < u || JSON.stringify(r.before) !== JSON.stringify(c) || a.journalId !== e.journalId || a.lineId !== e.lineId || a.operationId !== r.operationId || a.expectedRevision !== n || a.reason !== r.reason || JSON.stringify(a.splits) !== JSON.stringify(r.after)) throw Error("Invalid allocation history chain.");
				sy(r.after, t.capacity, i), c = r.after, u = r.at;
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
var ly = E().trim().min(1).max(200), uy = E().trim().max(2e3), dy = E().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), fy = e({
	operationId: ly,
	kind: T(Ma),
	customerId: E().max(200).default(""),
	values: Fa,
	source: T(Na).default("Manual"),
	externalId: E().trim().max(200).default(""),
	sourceReference: E().trim().max(500).default("")
}).strict(), py = e({
	id: ly,
	action: ly,
	actorId: ly,
	at: dy,
	reason: uy,
	data: E().max(2e6)
}).strict(), my = e({
	action: T([
		"Approve new",
		"Link existing",
		"Reject"
	]),
	actorId: ly,
	at: dy,
	reason: uy,
	fingerprint: E().max(1e4),
	customerId: E(),
	targetId: E(),
	snapshot: ye()
}).strict(), hy = fy.extend({
	id: ly,
	state: T([
		"Pending",
		"Approved",
		"Linked",
		"Rejected"
	]),
	revision: f().int().positive(),
	createdBy: ly,
	createdAt: dy,
	updatedAt: dy,
	creationFingerprint: E().max(1e5),
	history: s(py).min(1),
	decision: my.optional()
}).strict(), gy = [], _y = /* @__PURE__ */ new Set(), vy = () => _y.forEach((e) => e());
function yy() {
	let e = O.require("contacts.write");
	return O.require("sales.read"), e.userId;
}
var by = () => (/* @__PURE__ */ new Date()).toISOString();
function xy(e) {
	let t = by();
	if (t < e.updatedAt) throw Error("System clock precedes the last review update. Correct it before continuing.");
	return t;
}
var Sy = (e, t, n, r = "", i = {}) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	reason: r,
	data: JSON.stringify(i)
});
function Cy(e) {
	let t = gy.find((t) => t.id === e);
	if (!t) throw Error("Review draft not found.");
	return t;
}
function wy(e, t) {
	if (e.revision !== t) throw Error("Review draft changed. Reload before continuing.");
}
function Ty(e) {
	return gy = [...gy.filter((t) => t.id !== e.id), e], vy(), e;
}
function Ey(e) {
	let t = fy.parse(e);
	if (t.values = Ia(t.kind, t.values), t.kind === "Customer" && t.customerId) throw Error("Customer drafts must not have a parent customer.");
	if (t.customerId && !W.getById(t.customerId)) throw Error("Parent customer was not found.");
	return t;
}
function Dy(e, t) {
	return e === "Customer" ? hc.strict().parse(t) : e === "Branch" ? gc.strict().parse(t) : _c.strict().parse(t);
}
function Oy(e, t, n) {
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
var ky = {
	subscribe(e) {
		return _y.add(e), () => {
			_y.delete(e);
		};
	},
	getSnapshot: () => gy,
	create(e) {
		let t = yy(), n = Ey(e), { operationId: r, ...i } = n, a = JSON.stringify(i), o = gy.find((e) => e.operationId === r) || n.externalId && gy.find((e) => e.source === n.source && e.externalId === n.externalId);
		if (o) {
			if (o.creationFingerprint !== a) throw Error("Operation or external source ID already contains different draft data.");
			return o;
		}
		let s = by();
		return Ty({
			...n,
			id: crypto.randomUUID(),
			state: "Pending",
			revision: 1,
			createdBy: t,
			createdAt: s,
			updatedAt: s,
			creationFingerprint: a,
			history: [Sy("Received", t, s, "", i)]
		});
	},
	importBatch(t) {
		yy();
		let n = e({
			operationId: ly.max(150),
			drafts: s(fy.omit({ operationId: !0 })).min(1).max(100)
		}).strict().parse(t);
		if (n.drafts.some((e) => !e.externalId)) throw Error("Each imported draft requires a source external ID for safe retry.");
		return n.drafts.map((e, t) => ky.create({
			...e,
			operationId: n.operationId + ":" + t
		}));
	},
	update(t) {
		let n = yy(), r = e({
			id: ly,
			expectedRevision: f().int().positive(),
			customerId: E().max(200),
			values: Fa
		}).strict().parse(t), i = Cy(r.id);
		if (wy(i, r.expectedRevision), i.state !== "Pending") throw Error("Only pending drafts can be edited.");
		let a = Ey({
			operationId: i.operationId,
			kind: i.kind,
			customerId: r.customerId,
			values: r.values,
			source: i.source,
			externalId: i.externalId,
			sourceReference: i.sourceReference
		}), o = xy(i);
		return Ty({
			...i,
			customerId: a.customerId,
			values: a.values,
			revision: i.revision + 1,
			updatedAt: o,
			history: [...i.history, Sy("Updated", n, o, "", {
				customerId: a.customerId,
				values: a.values
			})]
		});
	},
	review(e) {
		O.require("sales.read");
		let t = Cy(ly.parse(e)), n = W.getAll(), r = "";
		try {
			if (Dy(t.kind, t.values), t.kind !== "Customer" && !n.some((e) => e.id === t.customerId)) throw Error("Select the parent customer.");
		} catch (e) {
			r = e.message;
		}
		return {
			revision: t.revision,
			duplicates: Va(t, n),
			masterSignature: Ha(n),
			validationError: r
		};
	},
	decide(t) {
		let n = yy(), r = e({
			id: ly,
			expectedRevision: f().int().positive(),
			action: T([
				"Approve new",
				"Link existing",
				"Reject"
			]),
			reason: uy,
			allowDuplicate: y().default(!1),
			targetId: E().max(200).default(""),
			expectedMaster: E().max(25e6).optional()
		}).strict().parse(t), i = Cy(r.id), a = JSON.stringify({
			action: r.action,
			reason: r.reason,
			allowDuplicate: r.allowDuplicate,
			targetId: r.targetId
		});
		if (i.state !== "Pending") {
			if (i.decision?.fingerprint === a) return i;
			throw Error("This draft already has a different decision.");
		}
		wy(i, r.expectedRevision);
		let o = xy(i), s = {
			customerId: "",
			targetId: "",
			snapshot: null
		};
		if (r.action === "Reject") {
			if (!r.reason) throw Error("Explain why the draft is rejected.");
		} else {
			let e = W.getAll();
			if (r.expectedMaster !== Ha(e)) throw Error("Customer records changed. Refresh duplicate review before deciding.");
			if (r.action === "Link existing") {
				if (!r.reason) throw Error("Explain why this existing record is the correct match.");
				s = Oy(i.kind, i.customerId, r.targetId);
			} else {
				if (Va(i, e).length && (!r.allowDuplicate || !r.reason)) throw Error("Possible duplicates exist. Link an existing record or explicitly confirm a separate new record with a reason.");
				let t = Dy(i.kind, i.values);
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
		return Ty({
			...i,
			state: r.action === "Reject" ? "Rejected" : r.action === "Link existing" ? "Linked" : "Approved",
			revision: i.revision + 1,
			updatedAt: o,
			decision: c,
			history: [...i.history, Sy(r.action, n, o, r.reason, c)]
		});
	},
	reopen(t) {
		let n = yy(), r = e({
			id: ly,
			expectedRevision: f().int().positive(),
			reason: uy.refine(Boolean, "Explain why this draft is reopened.")
		}).strict().parse(t), i = Cy(r.id);
		if (wy(i, r.expectedRevision), i.state !== "Rejected") throw Error("Only rejected drafts may be reopened.");
		let a = xy(i), o = {
			...i,
			state: "Pending",
			revision: i.revision + 1,
			updatedAt: a,
			history: [...i.history, Sy("Reopened", n, a, r.reason)]
		};
		return delete o.decision, Ty(o);
	}
};
i("contactReviews", {
	repository: ky,
	read: "sales.read",
	commands: {
		create: "contacts.write",
		update: "contacts.write",
		importBatch: "contacts.write",
		review: "sales.read",
		decide: "contacts.write",
		reopen: "contacts.write"
	},
	snapshot: () => ({ drafts: gy }),
	restore: (e) => {
		gy = e.drafts;
	},
	publish: vy,
	validate: (t, n) => {
		let r = e({ drafts: s(hy) }).strict().parse(t), i = n.customers.customers, a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
		for (let t of r.drafts) {
			let n = Ia(t.kind, t.values);
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
					reason: uy,
					allowDuplicate: y(),
					targetId: E()
				}).strict().parse(JSON.parse(t.decision.fingerprint)), a = t.history.at(-1);
				if (r.action !== n || r.reason !== t.decision.reason || r.targetId !== (n === "Link existing" ? t.decision.targetId : "") || a.actorId !== t.decision.actorId || a.at !== t.decision.at || a.reason !== t.decision.reason || JSON.stringify(JSON.parse(a.data)) !== JSON.stringify(t.decision)) throw Error("Review decision audit is inconsistent.");
				if (t.decision.action !== n) throw Error("Invalid review decision.");
				if (n !== "Reject") {
					let e = i.find((e) => e.id === t.decision.customerId), r = t.kind === "Customer" ? e : t.kind === "Branch" ? e?.locations.find((e) => e.id === t.decision.targetId) : e?.contacts.find((e) => e.id === t.decision.targetId);
					if (!r || r.id !== t.decision.targetId || t.kind !== "Customer" && e.id !== t.customerId || t.decision.snapshot?.id !== r.id) throw Error("Invalid resolved review reference.");
					n === "Approve new" && Dy(t.kind, t.values);
				} else if (!t.decision.reason || t.decision.customerId || t.decision.targetId) throw Error("Invalid rejection.");
			}
		}
	}
});
//#endregion
//#region src/features/report-settings/reportPresentation.ts
var Ay = e({
	header: E().max(160),
	precision: f().int().min(2).max(4),
	basis: T(["Accrual", "Cash"]),
	currency: T([
		"BASE",
		"AUD",
		"NZD"
	]),
	revision: E().regex(/^\d+$/).optional()
}).strict(), jy = {
	header: "",
	precision: 2,
	basis: "Accrual",
	currency: "BASE"
};
function My() {
	let e = x.settings?.find((e) => e.section === "reports" && e.status === "Active");
	return e?.reportDefaults === "Yes" ? Ay.parse({
		header: e.header,
		precision: Number(e.precision),
		basis: e.basis,
		currency: e.currency,
		revision: e.revision
	}) : { ...jy };
}
//#endregion
//#region src/features/accounting/data/profitAndLossService.ts
function Ny(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Py(e, t) {
	w(e, t);
}
function Fy(e, t, n, r) {
	if (Py(n, "From date"), Py(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = t.filter((e) => e.journalDate >= n && e.journalDate <= r), a = Iy(e.filter((e) => e.type === "REVENUE"), i, "REVENUE"), o = Iy(e.filter((e) => e.type === "EXPENSE"), i, "EXPENSE"), s = Ny(a.reduce((e, t) => e + t.amount, 0)), c = Ny(o.reduce((e, t) => e + t.amount, 0)), l = e.find((e) => e.systemRole === "SALES_REVENUE");
	if (!l) throw Error("Sales Revenue system account was not found.");
	if (l.type !== "REVENUE") throw Error("Sales Revenue system account must be a revenue account.");
	let u = e.find((e) => e.systemRole === "COST_OF_GOODS_SOLD");
	if (!u) throw Error("Cost of Goods Sold system account was not found.");
	if (u.type !== "EXPENSE") throw Error("Cost of Goods Sold system account must be an expense account.");
	let d = Ny(a.find((e) => e.accountId === l.id)?.amount ?? 0), f = Ny(o.find((e) => e.accountId === u.id)?.amount ?? 0), p = Ny(d - f);
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
		operatingExpenses: Ny(c - f),
		totalExpenses: c,
		netProfit: Ny(s - c)
	};
}
function Iy(e, t, n) {
	return e.map((e) => {
		let r = 0, i = 0;
		for (let n of t) for (let t of n.lines) t.accountId === e.id && (r = Ny(r + t.debit), i = Ny(i + t.credit));
		let a = Ny(n === "REVENUE" ? i - r : r - i);
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
function Ly(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ry(e) {
	w(e);
}
function zy(e, t) {
	let n = 0, r = 0;
	for (let i of t) for (let t of i.lines) t.accountId === e.id && (n = Ly(n + t.debit), r = Ly(r + t.credit));
	return e.type === "ASSET" || e.type === "EXPENSE" ? Ly(n - r) : Ly(r - n);
}
function By(e, t, n) {
	return e.filter((e) => e.type === n).map((e) => ({
		accountId: e.id,
		accountCode: e.code,
		accountName: e.name,
		amount: zy(e, t)
	})).filter((e) => e.amount !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 }));
}
function Vy(e) {
	return Ly(e.reduce((e, t) => e + t.amount, 0));
}
function Hy(e, t, n) {
	Ry(n);
	let r = t.filter((e) => e.journalDate <= n), i = By(e, r, "ASSET"), a = By(e, r, "LIABILITY"), o = By(e, r, "EQUITY"), s = e.filter((e) => e.type === "REVENUE"), c = e.filter((e) => e.type === "EXPENSE"), l = Ly(s.reduce((e, t) => e + zy(t, r), 0)), u = Ly(c.reduce((e, t) => e + zy(t, r), 0)), d = Vy(i), f = Vy(a), p = Vy(o), m = Ly(l - u), h = Ly(p + m), g = Ly(f + h), _ = Ly(d - g);
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
function Uy(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Wy(e, t) {
	w(e, t);
}
function Gy(e, t) {
	let n = Uy(e - t);
	return n >= 0 ? {
		debit: n,
		credit: 0
	} : {
		debit: 0,
		credit: Uy(Math.abs(n))
	};
}
function Ky(e, t, n, r) {
	if (Wy(n, "From date"), Wy(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = e.map((e) => {
		let i = 0, a = 0, o = 0, s = 0;
		for (let c of t) for (let t of c.lines) if (t.accountId === e.id) {
			if (c.journalDate < n) {
				i = Uy(i + t.debit), a = Uy(a + t.credit);
				continue;
			}
			c.journalDate <= r && (o = Uy(o + t.debit), s = Uy(s + t.credit));
		}
		let c = Gy(i, a), l = Gy(Uy(i + o), Uy(a + s));
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
	}).filter((e) => e.openingDebit !== 0 || e.openingCredit !== 0 || e.periodDebit !== 0 || e.periodCredit !== 0 || e.closingDebit !== 0 || e.closingCredit !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 })), a = Uy(i.reduce((e, t) => e + t.openingDebit, 0)), o = Uy(i.reduce((e, t) => e + t.openingCredit, 0)), s = Uy(i.reduce((e, t) => e + t.periodDebit, 0)), c = Uy(i.reduce((e, t) => e + t.periodCredit, 0)), l = Uy(i.reduce((e, t) => e + t.closingDebit, 0)), u = Uy(i.reduce((e, t) => e + t.closingCredit, 0)), d = Uy(l - u);
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
var qy = [
	"Customer receipts & reversals",
	"Customer refunds & reversals",
	"Supplier payments & reversals",
	"Supplier refunds & reversals",
	"Bank opening adjustments",
	"Transfers across selection",
	"Other bank movements / review"
], Jy = (e) => Math.round(e * 100), Yy = (e) => e / 100;
function Xy(e) {
	switch (e.sourceType) {
		case "CUSTOMER_DEPOSIT":
		case "CUSTOMER_PAYMENT":
		case "CUSTOMER_PAYMENT_REVERSAL": return qy[0];
		case "CUSTOMER_DEPOSIT_REFUND":
		case "CUSTOMER_REFUND": return qy[1];
		case "SUPPLIER_PREPAYMENT":
		case "SUPPLIER_PAYMENT":
		case "SUPPLIER_PAYMENT_REVERSAL": return qy[2];
		case "SUPPLIER_PREPAYMENT_REFUND":
		case "SUPPLIER_REFUND": return qy[3];
		case "OPENING_BALANCE": return qy[4];
		case "BANK_TRANSFER": return qy[5];
		default: return qy[6];
	}
}
function Zy(e) {
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
		let n = Vs(t, e.journalEntries, e.to), o = t.openingBalanceDate < e.from ? Jy(t.openingBalance) : 0, s = 0, c = 0;
		if (t.openingBalanceDate >= e.from && t.openingBalance !== 0) {
			let e = Jy(t.openingBalance);
			a.push({
				id: `setup:${t.id}`,
				bankId: t.id,
				bankName: t.name,
				date: t.openingBalanceDate,
				description: "Bank setup opening balance (not a cash receipt)",
				sourceType: "BANK_SETUP",
				category: qy[4],
				moneyIn: Yy(Math.max(e, 0)),
				moneyOut: Yy(Math.max(-e, 0))
			}), s += Math.max(e, 0), c += Math.max(-e, 0);
		}
		let l = n.transactions.filter((t) => t.correctionOnly && t.transactionDate >= e.from).length;
		l && i.push(`${t.name}: ${l} internal correction lines remain visible in the bank register and are excluded from cash movement totals.`), n.transactions.some((e) => e.correctionIssue) && i.push(`${t.name}: bank journal or categorisation correction evidence requires review. Its ledger movements remain included; no historical amount or date is silently changed.`);
		for (let i of n.transactions) {
			if (i.correctionOnly) continue;
			if (i.transactionDate < e.from) {
				o += Jy(i.moneyIn) - Jy(i.moneyOut);
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
				category: Xy(n),
				moneyIn: i.moneyIn,
				moneyOut: i.moneyOut
			}), s += Jy(i.moneyIn), c += Jy(i.moneyOut);
		}
		let u = Jy(n.closingBalance);
		return {
			bankId: t.id,
			name: t.name,
			active: t.active,
			opening: Yy(o),
			moneyIn: Yy(s),
			moneyOut: Yy(c),
			closing: Yy(u),
			difference: Yy(o + s - c - u)
		};
	}), s = new Map(qy.map((e) => [e, {
		category: e,
		moneyIn: 0,
		moneyOut: 0,
		net: 0
	}])), c = /* @__PURE__ */ new Map();
	for (let e of a) {
		if (e.category === qy[5]) {
			let t = e.journalId;
			c.set(t, (c.get(t) ?? 0) + Jy(e.moneyIn) - Jy(e.moneyOut));
			continue;
		}
		let t = s.get(e.category);
		t.moneyIn += Jy(e.moneyIn), t.moneyOut += Jy(e.moneyOut);
	}
	for (let e of c.values()) {
		let t = s.get(qy[5]);
		t.moneyIn += Math.max(e, 0), t.moneyOut += Math.max(-e, 0);
	}
	let l = [...s.values()].map((e) => ({
		category: e.category,
		moneyIn: Yy(e.moneyIn),
		moneyOut: Yy(e.moneyOut),
		net: Yy(e.moneyIn - e.moneyOut)
	})), u = (e) => Yy(o.reduce((t, n) => t + Jy(n[e]), 0)), d = u("opening"), f = u("closing"), p = Yy(l.reduce((e, t) => e + Jy(t.net), 0)), m = a.filter((e) => e.category === qy[6]).length;
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
		difference: Yy(Jy(d) + Jy(p) - Jy(f))
	};
}
//#endregion
//#region src/features/net-analysis/netAnalysisService.ts
var Qy = (e) => Math.round(e * 100);
function $y(e) {
	for (let t of [
		e.subtotal,
		e.tax,
		e.total
	]) if (!Number.isFinite(t) || t < 0 || Math.abs(t * 100 - Qy(t)) > 1e-6) throw Error(`${e.number}: invalid saved monetary totals.`);
	if (Qy(e.subtotal) + Qy(e.tax) !== Qy(e.total)) throw Error(`${e.number}: saved net, tax and gross do not reconcile.`);
}
function eb(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) {
		if (r.status === "DRAFT" || r.openingBalanceImportId) continue;
		let e = `${r.kind}:${r.id}`;
		if (t.has(e)) throw Error(`Duplicate analysis source: ${r.number}.`);
		t.add(e), w(r.date, `Document date (${r.number})`), $y(r);
		let i = r.kind === "CUSTOMER_CREDIT" || r.kind === "SUPPLIER_CREDIT", a = i ? -1 : 1, { voidedAt: o, openingBalanceImportId: s, ...c } = r, l = (t, n, i) => ({
			...c,
			date: t,
			eventId: `${e}:${i}`,
			event: i,
			subtotal: Qy(r.subtotal) * n / 100,
			tax: Qy(r.tax) * n / 100,
			total: Qy(r.total) * n / 100
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
function tb(e, t) {
	if (w(t.from, "From date"), w(t.to, "To date"), t.from > t.to) throw Error("From date must not exceed To date.");
	let n = t.query?.trim().toLowerCase() ?? "", r = eb(e).filter((e) => e.date >= t.from && e.date <= t.to && (!t.partyId || e.partyId === t.partyId) && (!t.event || t.event === "ALL" || e.event === t.event) && `${e.number} ${e.partyName} ${e.partyId} ${e.kind}`.toLowerCase().includes(n)), i = (e, t) => e.reduce((e, n) => e + Qy(n[t]), 0) / 100, a = {
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
function nb(e, t, n) {
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
function rb(e, t) {
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
var ib = [
	"Profit & loss",
	"Balance sheet",
	"Trial balance",
	"Cash flow",
	"Net sales",
	"Net purchases"
];
function ab(e) {
	let t = e.split(",").map((e) => e.trim());
	if (!t.length || t.length > ib.length || t.some((e) => !e)) throw Error("Select one to six supported reports.");
	let n = t.map((e) => ib.find((t) => t.toLowerCase() === e.toLowerCase()));
	if (n.some((e) => !e)) throw Error(`Supported reports: ${ib.join(", ")}.`);
	if (new Set(n).size !== n.length) throw Error("Each report may appear only once in a pack.");
	return n;
}
var ob = (e) => JSON.stringify(e);
function sb(e, t, n) {
	if (w(e.periodStart, "From date"), w(e.periodEnd, "To date"), e.periodStart > e.periodEnd) throw Error("From date must not exceed To date.");
	let r = ab(e.reports), i = e.periodStart, a = e.periodEnd, o = r.map((e) => {
		if (e === "Profit & loss") {
			let n = Fy(t.accounts, t.journals, i, a);
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
			let n = Hy(t.accounts, t.journals, a);
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
			let n = Ky(t.accounts, t.journals, i, a);
			return {
				title: e,
				description: `Accrual opening balances and period movements from ${i} to ${a}.`,
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
			let n = Zy({
				bankAccounts: t.banks,
				journalEntries: t.journals,
				from: i,
				to: a,
				currency: t.company.currency
			}), r = [...new Set(t.banks.filter((e) => e.currency !== t.company.currency).map((e) => e.currency))];
			return {
				title: e,
				description: `Cash basis · bank ledger working paper in ${t.company.currency}. Selected-bank transfers are netted per journal. Opening adjustments are included separately. Operating/investing/financing classification requires accountant review.`,
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
		let n = e === "Net purchases", r = tb(n ? rb(t.bills, t.supplierCredits) : nb(t.documents, t.customerCredits, t.customers), {
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
		sourceSignature: ob(t),
		sections: o
	});
}
//#endregion
//#region src/features/report-packs/reportPackCommand.ts
function cb() {
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
		bills: Gi.getAll(),
		supplierCredits: J.getAll(),
		company: {
			presentation: My(),
			name: e.companyName,
			currency: e.currency,
			timezone: e.timezone,
			...Ve() ? { logo: Ve() } : {}
		}
	};
}
function lb(t) {
	let n = O.require("accounting.read"), r = e({
		id: E().trim().min(1).max(200),
		expectedRevision: E().regex(/^\d+$/)
	}).strict().parse(t), i = x["report-packs"]?.find((e) => e.id === r.id);
	if (!i) throw Error("Report pack configuration was not found.");
	if (i.revision !== r.expectedRevision) throw Error("Report pack changed. Reload before generating.");
	if (i.status !== "Active") throw Error("Activate this report pack before generating.");
	return sb({
		id: i.id,
		revision: i.revision,
		name: i.name,
		cover: i.cover,
		introduction: i.introduction,
		periodStart: i.periodStart,
		periodEnd: i.periodEnd,
		reports: i.reports
	}, cb(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: n.userId
	});
}
//#endregion
//#region src/features/saved-reports/savedReportService.ts
var ub = [
	"Sales",
	"Purchases",
	"Banking",
	"General ledger"
], db = (e, t, n = !1) => ({
	key: e,
	label: t,
	numeric: n
}), fb = [
	db("date", "Date"),
	db("number", "Document"),
	db("contact", "Contact"),
	db("partyId", "Contact ID"),
	db("activity", "Activity"),
	db("status", "Current status"),
	db("net", "Net", !0),
	db("tax", "Tax", !0),
	db("gross", "Gross", !0)
], pb = {
	Sales: fb,
	Purchases: fb,
	Banking: [
		db("date", "Date"),
		db("bank", "Bank"),
		db("journal", "Journal"),
		db("description", "Description"),
		db("source", "Source"),
		db("category", "Activity"),
		db("moneyIn", "Money in", !0),
		db("moneyOut", "Money out", !0),
		db("net", "Net", !0)
	],
	"General ledger": [
		db("date", "Date"),
		db("journal", "Journal"),
		db("accountCode", "Account code"),
		db("account", "Account"),
		db("description", "Description"),
		db("source", "Source"),
		db("status", "Current status"),
		db("debit", "Debit", !0),
		db("credit", "Credit", !0)
	]
}, mb = (e) => e === "Banking" ? "Cash" : "Accrual", hb = e({
	from: E(),
	to: E(),
	query: E().max(500).default(""),
	partyId: E().max(200).optional(),
	bankId: E().max(200).optional(),
	accountId: E().max(200).optional(),
	currency: E().min(1).max(10).optional()
}).strict();
function gb(e) {
	let t = T(ub).parse(e.dataset);
	if (e.basis !== mb(t)) throw Error(`${t} uses ${mb(t)} basis. Cash-basis sales/purchase recognition is not available.`);
	if (e.favourite !== void 0 && !["Yes", "No"].includes(e.favourite)) throw Error("Favourite must be Yes or No.");
	let n;
	try {
		n = JSON.parse(e.filter ?? "");
	} catch {
		throw Error("Legacy filter text is not executable. Edit and save explicit report dates and filters.");
	}
	let r = hb.parse(n);
	if (w(r.from, "From date"), w(r.to, "To date"), r.from > r.to) throw Error("From date must not exceed To date.");
	if (t !== "Sales" && t !== "Purchases" && r.partyId) throw Error("Contact filters require Sales or Purchases.");
	if (t !== "Banking" && (r.bankId || r.currency)) throw Error("Bank and currency filters require Banking.");
	if (t !== "General ledger" && r.accountId) throw Error("Account filters require General ledger.");
	let i = e.columns.split(",").map((e) => e.trim()), a = t === "Sales" || t === "Purchases" ? {
		customer: "contact",
		supplier: "contact",
		gst: "tax",
		total: "gross"
	} : {}, o = i.map((e) => pb[t].find((t) => t.label.toLowerCase() === e.toLowerCase() || t.key.toLowerCase() === (a[e.toLowerCase()] ?? e.toLowerCase())));
	if (!i.length || i.length > pb[t].length || o.some((e) => !e) || new Set(o.map((e) => e?.key)).size !== o.length) throw Error(`Select distinct supported columns for ${t}: ${pb[t].map((e) => e.label).join(", ")}.`);
	return {
		dataset: t,
		filters: r,
		columns: o
	};
}
var _b = (e, t) => e.reduce((e, n) => {
	let r = Number(n.values[t]), i = e + Math.round(r * 100);
	if (!Number.isFinite(r) || !Number.isSafeInteger(i)) throw Error("Report monetary total exceeds supported cents precision.");
	return i;
}, 0) / 100;
function vb(e, t, n) {
	let { dataset: r, filters: i, columns: a } = gb(e), o = i.query.trim().toLowerCase(), s = [], c = [], l = [], u = t.company.currency;
	if (r === "Sales" || r === "Purchases") {
		let e = r === "Sales" ? nb(t.documents, t.customerCredits, t.customers) : rb(t.bills, t.supplierCredits);
		if (i.partyId && !e.some((e) => e.partyId === i.partyId) && !(r === "Sales" && t.customers.some((e) => e.id === i.partyId))) throw Error("Selected contact is not available in this dataset.");
		let n = {
			DOCUMENT: "Original document",
			CREDIT: "Credit note",
			VOID: "Void reversal"
		};
		s = eb(e).filter((e) => e.date >= i.from && e.date <= i.to && (!i.partyId || e.partyId === i.partyId)).map((e) => ({
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
		let e = Zy({
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
		value: _b(s, t)
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
		...t.company.presentation ? { presentation: t.company.presentation } : {},
		...t.company.logo ? { logo: t.company.logo } : {},
		sourceSignature: ob(t),
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
function yb(t) {
	let n = O.require("accounting.read"), r = e({
		id: E().trim().min(1).max(200),
		expectedRevision: E().regex(/^\d+$/)
	}).strict().parse(t), i = x["custom-reports"]?.find((e) => e.id === r.id);
	if (!i) throw Error("Saved report was not found.");
	if (i.revision !== r.expectedRevision) throw Error("Saved report changed. Reload before running.");
	if (i.status !== "Active") throw Error("Activate this saved report before running.");
	return vb({
		id: i.id,
		revision: i.revision,
		name: i.name,
		dataset: i.dataset,
		columns: i.columns,
		basis: i.basis,
		filter: i.filter,
		favourite: i.favourite
	}, cb(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: n.userId
	});
}
//#endregion
//#region src/features/business-workspace/workspaceRepository.ts
var bb = se(E(), E().max(2e4)), xb = [
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
], Sb = () => (/* @__PURE__ */ new Date()).toISOString(), Cb = {
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
		fields: /* @__PURE__ */ "reportDefaults.termsPolicy.paymentMethod.section.companyName.currency.timezone.yearEnd.gstCode.quotePrefix.orderPrefix.invoicePrefix.creditPrefix.purchasePrefix.terms.sender.payCycle.payDay.filingRegion.basis.precision.header.logo.nextQuote.nextOrder.nextInvoice.nextCredit.nextPurchase.billPrefix.supplierCreditPrefix.nextBill.nextSupplierCredit.tradingName.identifier.email.phone.address".split(".")
	}
}, wb = /* @__PURE__ */ new Set(), Tb = 0, Eb = () => {
	Tb++, wb.forEach((e) => e());
}, Db = Object.fromEntries(Object.keys(Cb).map((e) => [e, []]));
for (let e of Object.keys(Cb)) x[e] = [];
var Ob = () => ({
	collected: P.getAll().find((e) => e.systemRole === "GST_PAYABLE")?.id ?? "",
	paid: P.getAll().find((e) => e.systemRole === "GST_RECEIVABLE")?.id ?? ""
});
x["tax-codes"] = [{
	id: "tax-gst",
	name: "GST",
	status: "Active",
	revision: "1",
	createdAt: Sb(),
	updatedAt: Sb(),
	code: "GST",
	rate: "10",
	basis: "Exclusive",
	report: "GST",
	...Ob()
}, {
	id: "tax-zero",
	name: "Zero rated",
	status: "Active",
	revision: "1",
	createdAt: Sb(),
	updatedAt: Sb(),
	code: "ZERO",
	rate: "0",
	basis: "Exclusive",
	report: "Zero rated",
	...Ob()
}];
function kb(e, t) {
	if (!e?.trim()) throw Error(`${t} is required.`);
}
function Ab(e, t) {
	if (!e?.trim() || !Number.isFinite(Number(e)) || Number(e) < 0) throw Error(`${t} must be a non-negative number.`);
}
function jb(e, t) {
	let n = P.getAll().find((t) => t.id === e);
	if (!n?.active || t && n.type !== t) throw Error("Select an active account of the correct type.");
	return n;
}
function Mb(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && (/* @__PURE__ */ new Date(e + "T00:00:00Z")).toISOString().slice(0, 10) === e;
}
function Nb(e, n, r, i = !0) {
	let a = Cb[e];
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
	kb(n.name, "Name");
	for (let e of a.required) kb(n[e], e);
	if (![
		"Active",
		"Inactive",
		"Open",
		"In progress",
		"Completed"
	].includes(n.status ?? "Active")) throw Error("Invalid business status.");
	if (e === "tax-codes") {
		if (Ab(n.rate, "Tax rate"), n.basis && !["Exclusive", "Inclusive"].includes(n.basis)) throw Error("Invalid entry basis.");
		if (i) {
			let e = r.find((e) => e.id === n.id), i = t(), a = x.settings?.find((e) => e.section === "business" && e.status === "Active")?.gstCode ?? "GST";
			if (n.status === "Inactive" && n.code === a) throw Error("The default tax code must remain active. Change the business default first.");
			if (e && e.code !== n.code && (e.code === a || i.products.products.some((t) => (t.taxCode ?? "GST") === e.code) || (x["bank-rules"] ?? []).some((t) => t.taxCode === e.code) || (i.bankRuleApplications?.receipts ?? []).some((t) => t.decision.taxCode === e.code))) throw Error("A referenced tax code cannot be renamed. Create a new code and update future-use references.");
		}
		if (Number(n.rate) > 100) throw Error("Tax rate cannot exceed 100%.");
		if (i) {
			let e = jb(n.collected, "LIABILITY"), r = jb(n.paid, "ASSET"), i = (t().bankAccounts?.bankAccounts ?? []).map((e) => e.glAccountId);
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
		if (!xb.includes(n.role)) throw Error("Unknown account role.");
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
		if (i && jb(n.accountId, e), r.some((e) => e.id !== n.id && e.role === n.role)) throw Error("A linked account role may only have one mapping.");
	}
	if (e === "promotions") {
		let e = tn(n.productId);
		if (i && (!e || !nn(e.id, n.unitId))) throw Error("Product/unit not found.");
		if (Ab(n.price, "Price"), !Number.isInteger(Number(n.priority))) throw Error("Priority must be an integer.");
		if (![
			"Customer price first",
			"Promotion first",
			"Lowest eligible price"
		].includes(n.policy)) throw Error("Invalid price conflict policy.");
		if (!/([+-]\d\d:\d\d|Z)$/.test(n.starts) || !Number.isFinite(Date.parse(n.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(n.ends) || !Number.isFinite(Date.parse(n.ends)) || Date.parse(n.ends) <= Date.parse(n.starts)) throw Error("Promotion requires explicit time offsets and an end after start.");
	}
	if (i && n.customerId && !W.getById(n.customerId)) throw Error("Customer was not found.");
	if (e === "jobs") {
		if (Ab(n.budget, "Revenue budget"), Ab(n.costBudget, "Cost budget"), i) for (let e of ["budget", "costBudget"]) {
			let t = Number(n[e]);
			if (!Number.isSafeInteger(Math.round(t * 100)) || Math.abs(Math.round(t * 100) / 100 - t) > 1e-7) throw Error("Project budgets require safe currency amounts with at most two decimals.");
		}
		if (!Mb(n.starts) || !Mb(n.ends) || n.ends < n.starts) throw Error("Invalid project dates.");
		if (r.some((e) => e.id !== n.id && e.code.toLowerCase() === n.code.toLowerCase())) throw Error("Job code must be unique.");
	}
	if (e === "tasks") {
		if (i && n.id && (t().salesVisits?.visits ?? []).some((e) => e.followupTaskId === n.id && e.customerId !== n.customerId)) throw Error("A visit follow-up must retain the visit customer.");
		if (i && ![
			"Open",
			"In progress",
			"Completed"
		].includes(n.status ?? "Open")) throw Error("Task status must be Open, In progress or Completed.");
		if (!Mb(n.due) || ![
			"Low",
			"Normal",
			"High"
		].includes(n.priority)) throw Error("Invalid due date or priority.");
	}
	if (e === "bank-rules") {
		if (i && jb(n.accountId), Ns(n), i && n.bankAccountId && n.bankAccountId !== "ALL" && !t().bankAccounts.bankAccounts.some((e) => e.id === n.bankAccountId)) throw Error("Bank rule scope account was not found.");
		if (i && !x["tax-codes"].some((e) => e.status === "Active" && e.code === n.taxCode)) throw Error("Active tax code not found.");
	}
	if (e === "custom-reports" && i && gb({
		dataset: n.dataset,
		columns: n.columns,
		basis: n.basis,
		filter: n.filter,
		favourite: n.favourite
	}), e === "report-packs" && i && ab(n.reports), e === "report-packs" && (!Mb(n.periodStart) || !Mb(n.periodEnd) || n.periodEnd < n.periodStart)) throw Error("Invalid report period.");
	if (e === "settings") {
		if (r.some((e) => e.id !== n.id && e.section === n.section)) throw Error("One record per settings section is allowed.");
		if (n.section === "reports" && n.reportDefaults !== void 0) {
			if (n.reportDefaults !== "Yes" || n.status !== "Active") throw Error("Report defaults must remain active.");
			if (!/^[234]$/.test(n.precision)) throw Error("Amount precision must be 2, 3 or 4.");
			Ay.parse({
				header: n.header,
				precision: Number(n.precision),
				basis: n.basis,
				currency: n.currency
			});
		}
		if (n.section === "purchases" && (n.termsPolicy !== void 0 || n.paymentMethod !== void 0)) {
			if (n.status !== "Active") throw Error("Purchase settings must remain active.");
			if (!/^\d+$/.test(n.terms) || Number(n.terms) > 365) throw Error("Purchase terms must be 0–365 days.");
			if (!["SUPPLIER", "PURCHASE_SETTINGS"].includes(n.termsPolicy)) throw Error("Invalid purchase terms policy.");
			if (![
				"BANK_TRANSFER",
				"CARD",
				"CASH",
				"CHEQUE",
				"OTHER"
			].includes(n.paymentMethod)) throw Error("Invalid preferred payment method.");
		}
		if (n.section === "business") {
			for (let e of [
				"companyName",
				"currency",
				"timezone",
				"yearEnd",
				"gstCode",
				"basis",
				"terms"
			]) kb(n[e], e);
			if (n.status !== "Active") throw Error("Business settings must remain active.");
			if (!["Exclusive", "Inclusive"].includes(n.basis)) throw Error("Invalid price basis.");
			if (!/^\d+$/.test(n.terms) || Number(n.terms) > 365) throw Error("Payment terms must be 0–365 days.");
			if (!/^\d{2}-\d{2}$/.test(n.yearEnd) || !Mb("2001-" + n.yearEnd)) throw Error("Year end must be MM-DD.");
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
		if (n.currency && !(n.section === "reports" ? [
			"BASE",
			"NZD",
			"AUD"
		] : ["NZD", "AUD"]).includes(n.currency)) throw Error("Unsupported currency.");
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
function Pb(e, t, n) {
	Db[e].push({
		id: crypto.randomUUID(),
		name: n,
		status: "Active",
		revision: "1",
		createdAt: Sb(),
		updatedAt: Sb(),
		recordId: t.id,
		actorId: O.current()?.userId ?? "local-test",
		after: JSON.stringify(t)
	});
}
var Fb = Object.fromEntries(Object.keys(Cb).map((e) => {
	let t = {
		run(t) {
			if (e !== "custom-reports") throw Error("Saved-report execution is not available on this register.");
			return yb(t);
		},
		generate(t) {
			if (e !== "report-packs") throw Error("Report generation is only available for report packs.");
			return lb(t);
		},
		getAll: () => x[e],
		getById: (t) => x[e].find((e) => e.id === t),
		save(t, n) {
			let r = bb.parse(t), i = x[e].find((e) => e.id === r.id);
			if (i && i.revision !== n) throw Error("Record changed. Reload before saving.");
			if (!i && n !== void 0) throw Error("Record no longer exists.");
			let a = Sb(), o = {
				...r,
				id: i?.id ?? crypto.randomUUID(),
				name: r.name.trim(),
				status: r.status ?? (e === "tasks" ? "Open" : "Active"),
				revision: String(Number(i?.revision ?? "0") + 1),
				createdAt: i?.createdAt ?? a,
				updatedAt: a
			};
			return e === "tasks" && (delete o.completedAt, delete o.completedBy, o.status === "Completed" && (o.completedAt = i?.status === "Completed" && i.completedAt || a, o.completedBy = i?.status === "Completed" ? i.completedBy || O.current()?.userId || "local-test" : O.current()?.userId ?? "local-test")), Nb(e, o, x[e]), x[e] = [...x[e].filter((e) => e.id !== o.id), o], Pb(e, o, i ? "Updated" : "Created"), Eb(), o;
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
			Pb(e, {
				...i,
				note: r.trim()
			}, "Note added"), Eb();
		}
	};
	return i("workspace_" + e.replaceAll("-", "_"), {
		validate: (t, n) => {
			Ib(e, t), Lb(e, t, n);
		},
		repository: t,
		read: Cb[e].read,
		commands: {
			run: e === "custom-reports" ? "accounting.read" : null,
			generate: e === "report-packs" ? "accounting.read" : null,
			save: Cb[e].write,
			setStatus: Cb[e].write,
			addNote: e === "tasks" ? "sales.write" : null
		},
		snapshot: () => ({
			records: x[e],
			history: Db[e]
		}),
		restore: (t) => {
			Ib(e, t), x[e] = t.records, Db[e] = t.history;
		},
		publish: Eb
	}), [e, t];
}));
function Ib(t, n) {
	let r = e({
		records: s(bb),
		history: s(bb)
	}).strict().parse(n), i = /* @__PURE__ */ new Set();
	for (let e of r.records) {
		if (!e.id || i.has(e.id) || !/^\d+$/.test(e.revision)) throw Error("Invalid workspace record identity.");
		i.add(e.id), Nb(t, e, r.records, !1);
	}
	return r;
}
function Lb(e, t, n) {
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
var Rb = E().trim().min(1).max(200), zb = E().trim().min(1).max(4e3), Bb = E().refine((e) => {
	try {
		return w(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), Vb = E().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}, "Invalid visit timestamp."), Hb = e({
	operationId: Rb,
	name: Rb,
	customerId: Rb,
	locationId: Rb.optional(),
	plannedDate: Bb,
	locationNote: E().trim().max(500).default("")
}).strict(), Ub = e({
	name: Rb,
	due: Bb,
	priority: T([
		"Low",
		"Normal",
		"High"
	]),
	notes: zb
}).strict(), Wb = e({
	id: Rb,
	expectedRevision: f().int().positive(),
	outcome: zb,
	followup: Ub.optional()
}).strict(), Gb = e({
	id: Rb,
	action: Rb,
	actorId: Rb,
	at: Vb,
	note: E().optional()
}).strict(), Kb = e({
	id: Rb,
	operationId: Rb,
	creationFingerprint: E().min(1).max(3e3),
	name: Rb,
	customerId: Rb,
	customerName: Rb,
	locationId: Rb.optional(),
	locationName: E().max(200).optional(),
	locationNote: E().max(500),
	plannedDate: Bb,
	status: T([
		"Planned",
		"Checked in",
		"Completed",
		"Cancelled"
	]),
	revision: f().int().positive(),
	ownerId: Rb,
	createdAt: Vb,
	updatedAt: Vb,
	checkInAt: Vb.optional(),
	checkInBy: Rb.optional(),
	checkOutAt: Vb.optional(),
	checkOutBy: Rb.optional(),
	outcome: zb.optional(),
	completionFingerprint: E().optional(),
	followupTaskId: Rb.optional(),
	history: s(Gb).min(1)
}).strict(), qb = [], Jb = 0, Yb = /* @__PURE__ */ new Set(), Xb = () => {
	Jb++, Yb.forEach((e) => e());
}, Zb = () => O.require("sales.write").userId, Qb = () => (/* @__PURE__ */ new Date()).toISOString(), $b = (e, t, n, r) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	...r ? { note: r } : {}
});
function ex(e) {
	let t = qb.find((t) => t.id === e);
	if (!t) throw Error("Visit not found.");
	return t;
}
function tx(e, t) {
	if (e.revision !== t) throw Error("Visit changed. Reload before continuing.");
}
function nx(e) {
	let t = Qb();
	if (t < e.updatedAt) throw Error("System clock precedes the last visit update. Correct the clock before continuing.");
	return t;
}
function rx(e) {
	return qb = [...qb.filter((t) => t.id !== e.id), e], Xb(), e;
}
function ix(e, t) {
	let n = W.getById(e);
	if (!n || n.status === "INACTIVE") throw Error("Choose an available customer.");
	if (t && !n.locations.some((e) => e.id === t)) throw Error("Choose a location belonging to the selected customer.");
	return n;
}
i("salesVisits", {
	repository: {
		subscribe(e) {
			return Yb.add(e), () => {
				Yb.delete(e);
			};
		},
		getSnapshot: () => qb,
		getAll: () => qb,
		create(e) {
			let t = Zb(), n = Hb.parse(e), r = JSON.stringify(n), i = qb.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.creationFingerprint !== r) throw Error("Operation ID was used for different visit data.");
				return i;
			}
			let a = ix(n.customerId, n.locationId), o = Qb();
			return rx({
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
				history: [$b("Planned", t, o)]
			});
		},
		update(e) {
			let t = Zb(), n = Hb.omit({ operationId: !0 }).extend({
				id: Rb,
				expectedRevision: f().int().positive()
			}).strict().parse(e), r = ex(n.id);
			if (tx(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be edited.");
			let i = ix(n.customerId, n.locationId), a = nx(r), o = {
				...r,
				name: n.name,
				customerId: n.customerId,
				customerName: i.businessName,
				plannedDate: n.plannedDate,
				locationNote: n.locationNote,
				revision: r.revision + 1,
				updatedAt: a,
				history: [...r.history, $b("Plan updated", t, a, r.plannedDate + " → " + n.plannedDate)]
			};
			return delete o.locationId, delete o.locationName, n.locationId && (o.locationId = n.locationId, o.locationName = i.locations.find((e) => e.id === n.locationId).name), rx(o);
		},
		checkIn(t) {
			let n = Zb(), r = e({
				id: Rb,
				expectedRevision: f().int().positive()
			}).strict().parse(t), i = ex(r.id);
			if (i.status === "Checked in" && i.revision === r.expectedRevision + 1) return i;
			if (tx(i, r.expectedRevision), i.status !== "Planned") throw Error("Only a planned visit can be checked in.");
			ix(i.customerId, i.locationId);
			let a = nx(i);
			return rx({
				...i,
				status: "Checked in",
				revision: i.revision + 1,
				checkInAt: a,
				checkInBy: n,
				updatedAt: a,
				history: [...i.history, $b("Checked in", n, a)]
			});
		},
		finish(e) {
			let t = Zb(), n = Wb.parse(e), r = ex(n.id), i = JSON.stringify({
				outcome: n.outcome,
				followup: n.followup
			});
			if (r.status === "Completed") {
				if (r.completionFingerprint === i) return r;
				throw Error("Visit is already completed with a different outcome.");
			}
			if (tx(r, n.expectedRevision), r.status !== "Checked in") throw Error("Check in before completing the visit.");
			let a = nx(r);
			if (a < r.checkInAt) throw Error("System clock precedes check-in. Correct the clock before completing.");
			let o;
			return n.followup && (o = Fb.tasks.save({
				...n.followup,
				customerId: r.customerId,
				owner: t,
				status: "Open"
			}).id), rx({
				...r,
				status: "Completed",
				revision: r.revision + 1,
				checkOutAt: a,
				checkOutBy: t,
				outcome: n.outcome,
				completionFingerprint: i,
				...o ? { followupTaskId: o } : {},
				updatedAt: a,
				history: [...r.history, $b("Completed", t, a, n.outcome)]
			});
		},
		cancel(t) {
			let n = Zb(), r = e({
				id: Rb,
				expectedRevision: f().int().positive(),
				reason: zb
			}).strict().parse(t), i = ex(r.id);
			if (tx(i, r.expectedRevision), !["Planned", "Checked in"].includes(i.status)) throw Error("Only an unfinished visit can be cancelled.");
			let a = nx(i);
			return rx({
				...i,
				status: "Cancelled",
				revision: i.revision + 1,
				updatedAt: a,
				history: [...i.history, $b("Cancelled", n, a, r.reason)]
			});
		},
		addNote(t) {
			let n = Zb(), r = e({
				id: Rb,
				expectedRevision: f().int().positive(),
				note: zb
			}).strict().parse(t), i = ex(r.id);
			tx(i, r.expectedRevision);
			let a = nx(i);
			return rx({
				...i,
				revision: i.revision + 1,
				updatedAt: a,
				history: [...i.history, $b("Note added", n, a, r.note)]
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
	snapshot: () => ({ visits: qb }),
	restore: (e) => {
		qb = e.visits;
	},
	publish: Xb,
	validate: (t, n) => {
		let r = e({ visits: s(Kb) }).strict().parse(t), i = n, a = /* @__PURE__ */ new Set();
		for (let t of r.visits) {
			if (a.has(t.operationId)) throw Error("Duplicate visit operation ID.");
			if (a.add(t.operationId), !i.customers.customers.find((e) => e.id === t.customerId) || t.locationId && !t.locationName) throw Error("Invalid visit customer/location reference.");
			if (t.history.length !== t.revision || new Set(t.history.map((e) => e.id)).size !== t.history.length || t.updatedAt < t.createdAt) throw Error("Invalid visit history.");
			if (Hb.parse(JSON.parse(t.creationFingerprint)).operationId !== t.operationId || t.history[0].action !== "Planned" || t.history[0].actorId !== t.ownerId || t.history[0].at !== t.createdAt) throw Error("Visit creation fingerprint is inconsistent.");
			if (!!t.checkInAt != !!t.checkInBy || !!t.checkOutAt != !!t.checkOutBy || t.checkInAt && t.checkInAt < t.createdAt || t.checkOutAt && (!t.checkInAt || t.checkOutAt < t.checkInAt)) throw Error("Invalid visit check-in/out history.");
			if (t.status === "Planned" && (t.checkInAt || t.checkOutAt) || t.status === "Checked in" && (!t.checkInAt || t.checkOutAt) || t.status === "Completed" && (!t.checkInAt || !t.checkOutAt || !t.outcome || !t.completionFingerprint) || t.status !== "Completed" && (t.checkOutAt || t.outcome || t.followupTaskId || t.completionFingerprint)) throw Error("Visit state is inconsistent.");
			if (t.status === "Completed") {
				let n = e({
					outcome: zb,
					followup: Ub.optional()
				}).strict().parse(JSON.parse(t.completionFingerprint));
				if (n.outcome !== t.outcome || !!n.followup != !!t.followupTaskId) throw Error("Visit completion fingerprint is inconsistent.");
			}
			if (t.followupTaskId && !i.workspace_tasks.records.some((e) => e.id === t.followupTaskId && e.customerId === t.customerId)) throw Error("Visit follow-up task is missing or belongs to another customer.");
		}
	}
});
//#endregion
//#region src/features/supplier-returns/supplierReturnRepository.ts
var Q = E().trim().min(1).max(200), ax = f().finite().positive(), ox = f().finite().nonnegative(), sx = e({
	operationId: Q,
	supplierBillId: Q,
	supplierCreditNumber: Q,
	returnDate: Q,
	reason: E().trim().min(3).max(2e3),
	lines: s(e({
		matchId: Q,
		quantity: ax
	}).strict()).min(1).max(500)
}).strict(), cx = e({
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
	quantity: ax,
	conversionToBase: ax,
	quantityBase: ax,
	siteId: Q,
	siteName: Q,
	inventoryMovementId: Q,
	costMovementId: Q,
	unitCostBase: ox,
	inventoryValue: ox,
	voidInventoryMovementId: Q.optional(),
	voidCostMovementId: Q.optional()
}).strict(), lx = e({
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
	lines: s(cx).min(1),
	inventoryValue: ox,
	journalId: Q.optional(),
	createdAt: Q,
	createdBy: Q,
	voidDate: Q.optional(),
	voidReason: E().optional(),
	voidedBy: Q.optional(),
	voidedAt: Q.optional()
}).strict(), ux = [], dx = 0, fx = /* @__PURE__ */ new Set(), px = () => {
	dx++, fx.forEach((e) => e());
}, mx = (e) => Math.round(e * 1e4) / 1e4, hx = (e) => Math.round(e * 100) / 100;
function gx(e, t, n) {
	if ($r.getAll().some((r) => r.siteId === t && r.productId === n && ve(r.occurredAt) > e)) throw Error("Return/reversal date precedes later inventory activity at this site.");
}
function _x(e) {
	let t = Gi.getById(e);
	return !t || t.status === "VOID" || t.kind === "EXPENSE" || t.openingBalanceImportId ? [] : Li.getByBill(e).filter((e) => e.status === "ACTIVE").flatMap((e) => {
		let n = t.lines.find((t) => t.id === e.supplierBillLineId), r = Ti.getById(e.goodsReceiptId), i = r?.lines.find((t) => t.id === e.goodsReceiptLineId), a = n ? nn(n.productId, n.unitId) : void 0;
		if (!n || !r || !i || !a) return [];
		let o = ux.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0);
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
			let t = sx.parse(e), n = JSON.stringify(t), r = ux.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.requestFingerprint !== n) throw Error("Operation ID already used with different return data.");
				return r;
			}
			M(), w(t.returnDate, "Return date"), rr(t.returnDate);
			let i = Gi.getById(t.supplierBillId);
			if (!i || i.status === "VOID" || i.kind === "EXPENSE" || i.openingBalanceImportId) throw Error("Select an active stock bill matched to received goods.");
			if (t.returnDate < i.billDate) throw Error("Return date cannot precede bill date.");
			let a = _x(i.id), o = /* @__PURE__ */ new Set(), s = t.lines.map((e) => {
				if (o.has(e.matchId)) throw Error("Select each receipt match once.");
				o.add(e.matchId);
				let n = a.find((t) => t.matchId === e.matchId);
				if (!n) throw Error("Return line must belong to an active receipt match for this bill.");
				if (mx(e.quantity) !== e.quantity || e.quantity > n.availableQuantity + 1e-8) throw Error("Return quantity exceeds the matched receipt remainder or four decimal places.");
				if (t.returnDate < n.receiptDate) throw Error("Return date cannot precede receipt date.");
				let r = tn(n.productId), i = nn(n.productId, n.unitId), s = Rr.getById(n.siteId);
				if (!r || !i || !s || s.status !== "ACTIVE") throw Error("Return product, unit or active receiving site was not found.");
				if (r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(i.code) && !Number.isInteger(e.quantity)) throw Error("Whole packs must be returned in whole quantities.");
				gx(t.returnDate, s.id, r.id);
				let c = mx(e.quantity * n.conversionToBase);
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
				c.set(t, mx((c.get(t) ?? 0) + e.quantityBase));
			}
			for (let [e, t] of c) {
				let [n, r] = e.split("|");
				if ((vi.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t) throw Error("Insufficient stock at the original receiving site.");
			}
			let l = /* @__PURE__ */ new Map();
			for (let e of s) {
				let t = i.lines.find((t) => t.id === e.supplierBillLineId), n = l.get(t.id);
				l.set(t.id, {
					supplierBillLineId: t.id,
					quantity: mx((n?.quantity ?? 0) + e.quantity),
					unitCost: t.unitCost
				});
			}
			let u = crypto.randomUUID(), d = "SR-" + t.returnDate.slice(0, 4) + "-" + String(ux.length + 1).padStart(5, "0"), f = J.createReturnCredit({
				sourceSupplierBillId: i.id,
				supplierCreditNumber: t.supplierCreditNumber,
				creditDate: t.returnDate,
				reason: t.reason,
				lines: [...l.values()]
			}, u), p = s.map((e) => {
				vi.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let n = Ur.create({
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
				}), r = fi({
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
			}), m = hx(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? F.post({
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
			return ux = [g, ...ux], px(), g;
		},
		reverse(t) {
			let n = e({
				returnId: Q,
				voidDate: Q,
				reason: E().trim().min(3).max(2e3)
			}).strict().parse(t), r = ux.find((e) => e.id === n.returnId);
			if (!r) throw Error("Supplier return not found.");
			if (r.status === "VOID") return r;
			if (M(), w(n.voidDate, "Reversal date"), rr(n.voidDate), n.voidDate < r.returnDate) throw Error("Reversal date cannot precede return date.");
			for (let e of r.lines) gx(n.voidDate, e.siteId, e.productId);
			let i = J.getById(r.supplierCreditId);
			if ((i.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > n.voidDate) || J.getAllocationsByCredit(i.id).some((e) => e.reversedAt && ve(e.reversedAt) > n.voidDate)) throw Error("Reversal date precedes later credit settlement activity.");
			J.voidReturnCredit({
				supplierCreditId: r.supplierCreditId,
				reason: n.reason,
				voidDate: n.voidDate
			});
			let a = r.lines.map((e) => {
				vi.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = Ur.create({
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
				}), i = pi({
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
			return ux = ux.map((e) => e.id === r.id ? o : e), px(), o;
		}
	},
	read: "purchases.return.read",
	commands: {
		create: "purchases.return",
		reverse: "purchases.return"
	},
	snapshot: () => ({ returns: ux }),
	restore: (e) => {
		ux = e.returns;
	},
	publish: px,
	validate: (t, n) => {
		let r = e({ returns: s(lx) }).strict().parse(t), i = n, a = /* @__PURE__ */ new Set();
		for (let e of r.returns) {
			w(e.returnDate), e.voidDate && w(e.voidDate);
			let t = sx.parse(JSON.parse(e.requestFingerprint));
			if (a.has(e.operationId) || t.operationId !== e.operationId || t.supplierBillId !== e.supplierBillId || t.returnDate !== e.returnDate) throw Error("Supplier return operation mismatch.");
			a.add(e.operationId);
			let n = i.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId && t.supplierId === e.supplierId), r = i.supplierCredits.supplierCredits.find((t) => t.id === e.supplierCreditId && t.physicalReturnId === e.id && t.sourceSupplierBillId === e.supplierBillId);
			if (!n || !r || e.status === "VOID" != (r.status === "VOID")) throw Error("Supplier return bill/credit reference is invalid.");
			if (hx(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue) throw Error("Supplier return cost total is invalid.");
			for (let t of e.lines) {
				let r = i.receiptMatches.matches.find((n) => n.id === t.matchId && n.supplierBillId === e.supplierBillId && n.supplierBillLineId === t.supplierBillLineId && n.goodsReceiptId === t.goodsReceiptId && n.goodsReceiptLineId === t.goodsReceiptLineId), a = i.costMovements.movements.find((e) => e.id === t.costMovementId), o = i.inventoryMovements.movements.find((e) => e.id === t.inventoryMovementId), s = i.goodsReceipts.goodsReceipts.find((e) => e.id === t.goodsReceiptId), c = n.lines.find((e) => e.id === t.supplierBillLineId);
				if (!r || !c || c.productId !== t.productId || c.unitId !== t.unitId || s?.siteId !== t.siteId || r.productId !== t.productId || !a || !o || a.referenceType !== "SUPPLIER_RETURN" || a.referenceId !== e.id || a.inventoryMovementId !== o.id || a.siteId !== t.siteId || a.productId !== t.productId || a.unitCostBase !== t.unitCostBase || a.quantityBase !== -t.quantityBase || hx(-a.valueChange) !== hx(t.inventoryValue) || mx(t.quantity * t.conversionToBase) !== t.quantityBase || o.referenceType !== "SUPPLIER_RETURN" || o.referenceId !== e.id || o.siteId !== t.siteId || o.productId !== t.productId || o.quantityBase !== -t.quantityBase || o.transactionQuantity !== -t.quantity || ve(o.occurredAt) !== e.returnDate) throw Error("Supplier return stock/cost reference is invalid.");
				if (e.status === "VOID") {
					let n = i.costMovements.movements.find((e) => e.id === t.voidCostMovementId), r = i.inventoryMovements.movements.find((e) => e.id === t.voidInventoryMovementId);
					if (!n || !r || n.inventoryMovementId !== r.id || n.referenceType !== "SUPPLIER_RETURN_VOID" || n.referenceId !== e.id || n.siteId !== t.siteId || n.productId !== t.productId || n.quantityBase !== t.quantityBase || hx(n.valueChange) !== hx(t.inventoryValue) || r.referenceType !== "SUPPLIER_RETURN_VOID" || r.quantityBase !== t.quantityBase || r.referenceId !== e.id || ve(n.occurredAt) !== e.voidDate) throw Error("Supplier return reversal reference is invalid.");
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
				let n = mx(e.lines.filter((e) => e.supplierBillLineId === t).reduce((e, t) => e + t.quantity, 0));
				if (!r.lines.some((e) => e.supplierBillLineId === t && e.quantity === n)) throw Error("Supplier return linked credit quantity mismatch.");
			}
			if (e.status === "VOID" && (!e.voidDate || e.voidDate < e.returnDate || !e.voidReason || !e.voidedBy)) throw Error("Supplier return reversal metadata is invalid.");
			if (e.inventoryValue && !i.journals.journalEntries.some((t) => t.id === e.journalId && t.sourceId === e.id && t.sourceType === "SUPPLIER_RETURN" && t.totalDebit === e.inventoryValue && (e.status === "VOID" ? t.status === "REVERSED" : t.status === "POSTED"))) throw Error("Supplier return journal reference is invalid.");
		}
		for (let e of i.supplierCredits.supplierCredits) if (e.physicalReturnId && !r.returns.some((t) => t.id === e.physicalReturnId && t.supplierCreditId === e.id)) throw Error("Supplier credit physical return reference is invalid.");
		for (let e of i.receiptMatches.matches) if (mx(r.returns.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0)) > e.matchedBaseQuantity + 1e-8) throw Error("Supplier return quantities exceed the receipt match.");
	}
});
//#endregion
//#region src/features/document-output/outputRepository.ts
var vx = E().min(1).max(200), yx = E().max(2e4), bx = yx.optional(), xx = [
	"QUOTE",
	"SALES_ORDER",
	"INVOICE",
	"CREDIT_NOTE"
], Sx = e({
	operationId: vx,
	sourceId: vx,
	kind: T(xx),
	expectedUpdatedAt: vx,
	templateId: vx.optional()
}).strict(), Cx = f().finite().nonnegative(), wx = e({
	itemType: T([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	id: vx,
	sku: yx,
	description: yx,
	unitSymbol: yx,
	quantity: f().positive().finite(),
	unitPrice: Cx,
	lineSubtotal: Cx,
	taxAmount: Cx,
	lineTotal: Cx,
	taxCode: bx,
	taxRate: f().finite().min(0).max(1).optional(),
	requestedArea: f().positive().finite().optional(),
	areaPerPack: f().positive().finite().optional(),
	coveredArea: f().positive().finite().optional()
}).strict(), Tx = e({
	locationId: bx,
	locationName: bx,
	deliveryAddress: bx,
	accountingContactId: bx,
	accountingContactName: bx,
	accountingEmail: bx
}).strict(), Ex = e({
	id: vx,
	revision: vx,
	name: yx,
	subject: yx,
	body: yx,
	footer: yx,
	logoPosition: T([
		"Left",
		"Centre",
		"Right"
	]).optional(),
	paper: T(["A4", "Letter"])
}).strict(), Dx = e({
	id: vx,
	operationId: vx,
	requestFingerprint: yx,
	preparedAt: vx,
	preparedBy: vx,
	sourceId: vx,
	kind: T(xx),
	sourceUpdatedAt: vx,
	documentNumber: vx,
	status: vx,
	documentDate: vx,
	dueDate: bx,
	expiryDate: bx,
	reference: bx,
	notes: bx,
	customerId: vx,
	customerName: yx,
	customerCode: yx,
	customerIdentifier: bx,
	recipient: Tx.optional(),
	issuer: e({
		name: yx,
		tradingName: bx,
		identifier: bx,
		address: bx,
		email: bx,
		phone: bx,
		currency: vx,
		logo: Ie.optional()
	}).strict(),
	lines: s(wx).min(1),
	totals: e({
		subtotal: Cx,
		taxAmount: Cx,
		total: Cx
	}).strict(),
	amountPaid: Cx.optional(),
	amountDue: Cx.optional(),
	template: Ex,
	subject: yx,
	body: yx
}).strict();
function Ox(e, t) {
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
var kx = (e) => e === "QUOTE" ? "Quotation" : e === "INVOICE" ? "Invoice" : e === "SALES_ORDER" ? "Sales order" : "Credit note";
function Ax() {
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
var jx = [];
Ax();
var Mx = 0, Nx = /* @__PURE__ */ new Set(), Px = () => {
	Mx++, Nx.forEach((e) => e());
};
function Fx(e, t) {
	let n = t ? x.templates?.find((n) => n.id === t && n.status === "Active" && n.kind === kx(e)) : void 0;
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
var Ix = [
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
function Lx(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!Ix.includes(n)) throw Error(`Unsupported template token: ${n}.`);
		return t[n] ?? "";
	});
}
function Rx(e) {
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
var zx = { prepare(e) {
	let t = Sx.parse(e), n = JSON.stringify(t), r = jx.find((e) => e.operationId === t.operationId);
	if (r) {
		if (r.requestFingerprint !== n) throw Error("Operation ID was used for different output data.");
		return r;
	}
	let i = Ox(t.kind, t.sourceId);
	if (i.updatedAt !== t.expectedUpdatedAt) throw Error("Source document changed. Reload before preparing output.");
	let a = W.getById(i.customerId);
	if (!a) throw Error("Source customer was not found.");
	let o = C(), s = Fx(t.kind, t.templateId), c = structuredClone(i.recipient), l = {
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
		lines: i.lines.map(Rx),
		totals: structuredClone(i.totals),
		amountPaid: "amountPaid" in i ? i.amountPaid : void 0,
		amountDue: "amountDue" in i ? i.amountDue : void 0,
		template: {
			...s,
			footer: Lx(s.footer, l)
		},
		subject: Lx(s.subject, l),
		body: Lx(s.body, l)
	};
	return Bx(u), jx = [u, ...jx], Px(), u;
} };
function Bx(e) {
	let t = Dx.parse(e);
	if (Mc(t.recipient), !Number.isFinite(Date.parse(t.preparedAt))) throw Error("Invalid preparation timestamp.");
	let n = Sx.parse(JSON.parse(t.requestFingerprint));
	if (n.operationId !== t.operationId || n.sourceId !== t.sourceId || n.kind !== t.kind || n.expectedUpdatedAt !== t.sourceUpdatedAt) throw Error("Output source metadata mismatch.");
	let r = (e) => Math.round(e * 100) / 100;
	for (let e of t.lines) if (uc(e), r(e.lineSubtotal + e.taxAmount) !== e.lineTotal) throw Error("Invalid output line total.");
	for (let [e, n] of [
		["subtotal", "lineSubtotal"],
		["taxAmount", "taxAmount"],
		["total", "lineTotal"]
	]) if (r(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Invalid output totals.");
	return t;
}
i("preparedSalesOutputs", {
	repository: zx,
	read: "sales.read",
	commands: { prepare: "documents.prepare" },
	snapshot: () => ({
		artifacts: jx,
		templates: Ax()
	}),
	restore: (e) => {
		jx = e.artifacts, e.templates;
	},
	publish: Px,
	validate: (t, n) => {
		let r = e({
			artifacts: s(Dx),
			templates: s(e({
				id: vx,
				name: yx,
				kind: vx
			}).strict())
		}).strict().parse(t), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set();
		for (let e of r.artifacts) {
			if (Bx(e), i.has(e.id) || a.has(e.operationId)) throw Error("Duplicate prepared output.");
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
var Vx = E().trim().min(1).max(200), Hx = e({
	operationId: Vx,
	salesOrderId: Vx,
	siteId: Vx,
	fulfilmentDate: Vx,
	lines: s(e({
		salesOrderLineId: Vx,
		fulfilledQuantity: f().positive().finite()
	}).strict()).min(1).max(500)
}).strict();
function Ux() {
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
		lines: e.lines.filter(Qt).map((t) => ({
			id: t.id,
			sku: t.sku,
			description: t.description,
			unit: t.unitSymbol,
			quantity: t.quantity,
			fulfilled: f_.getAll().filter((t) => t.salesOrderId === e.id && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t.id).reduce((e, t) => e + t.fulfilledQuantity, 0)
		}))
	})).filter((e) => e.lines.length > 0);
}
Ux();
var Wx = [], Gx = 0, Kx = /* @__PURE__ */ new Set(), qx = () => {
	Gx++, Kx.forEach((e) => e());
};
i("salesDispatch", {
	repository: {
		record(e) {
			let t = Hx.parse(e), n = JSON.stringify(t), r = Wx.find((e) => e.id === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Dispatch operation ID was already used with different data.");
				return f_.getAll().find((e) => e.id === r.fulfilmentId);
			}
			if (M(), w(t.fulfilmentDate), rr(t.fulfilmentDate), new Set(t.lines.map((e) => e.salesOrderLineId)).size !== t.lines.length) throw Error("Each dispatch line must be selected only once.");
			let i = f_.create(t);
			return Wx = [...Wx, {
				id: t.operationId,
				fingerprint: n,
				fulfilmentId: i.id
			}], qx(), i;
		},
		reverse(t) {
			let n = e({
				fulfilmentId: Vx,
				voidDate: Vx,
				reason: E().trim().min(3).max(1e3)
			}).strict().parse(t);
			M(), w(n.voidDate), rr(n.voidDate);
			let r = f_.getAll().find((e) => e.id === n.fulfilmentId);
			return r?.status === "VOIDED" ? r : f_.void(n);
		}
	},
	read: "inventory.read",
	commands: {
		record: "inventory.adjust",
		reverse: "inventory.adjust"
	},
	snapshot: () => ({
		orders: Ux(),
		requests: Wx
	}),
	restore: (e) => {
		e.orders, Wx = e.requests;
	},
	publish: qx,
	validate: (t, n) => {
		let r = e({
			orders: s(e({
				id: Vx,
				number: Vx,
				date: Vx,
				delivery: E().optional(),
				store: E().optional(),
				lines: s(e({
					id: Vx,
					sku: E(),
					description: E(),
					unit: E(),
					quantity: f().finite().positive(),
					fulfilled: f().finite().nonnegative()
				}).strict())
			}).strict()),
			requests: s(e({
				id: Vx,
				fingerprint: E().max(1e6),
				fulfilmentId: Vx
			}).strict())
		}).strict().parse(t), i = n.fulfilments.fulfilments;
		if (r.requests.some((e) => !i.some((t) => t.id === e.fulfilmentId))) throw Error("Dispatch result reference is invalid.");
	}
});
//#endregion
//#region src/features/finance-foundation/openingBalanceRepository.ts
var Jx = (e) => Math.round((e + 2 ** -52) * 100) / 100, $ = E().trim().min(1).max(200), Yx = f().finite().refine((e) => Jx(e) === e, "Amounts must use cents precision"), Xx = e({
	accountId: $,
	debit: Yx.nonnegative(),
	credit: Yx.nonnegative()
}).strict(), Zx = e({
	contactId: $,
	reference: $,
	date: $,
	dueDate: $,
	amount: Yx
}).strict(), Qx = e({
	operationId: $,
	date: $,
	reason: E().trim().min(3).max(1e3),
	gl: s(Xx).min(2).max(5e3),
	ar: s(Zx).max(1e4),
	ap: s(Zx).max(1e4),
	banks: s(e({
		bankAccountId: $,
		amount: Yx
	}).strict()).max(500),
	stock: s(e({
		siteId: $,
		productId: $,
		quantity: f().positive().finite(),
		unitCost: f().nonnegative().finite()
	}).strict()).max(1e4)
}).strict(), $x = [], eS = 0, tS = /* @__PURE__ */ new Set(), nS = () => {
	eS++, tS.forEach((e) => e());
};
function rS() {
	return t();
}
function iS(e) {
	d(e), qc(e.sales), al(e.customerCredits), k.update("supplierBills", e.supplierBills.supplierBills), k.update("supplierCredits", e.supplierCredits.supplierCredits);
}
function aS(e, t) {
	if (new Set(e).size !== e.length) throw Error("Duplicate " + t + ".");
}
function oS(e) {
	let t = Qx.parse(e);
	if (w(t.date, "Cutover date"), rr(t.date), M(), $x.some((e) => e.status === "POSTED")) throw Error("An opening batch is already active. Reverse the unused batch before replacing it.");
	let n = rS();
	if (n.journals.journalEntries.some((e) => e.journalDate >= t.date)) throw Error("Cutover must be after all existing ledger activity. This import adds historical balances, never replaces existing transactions.");
	if (n.inventoryMovements.movements.some((e) => e.occurredAt.slice(0, 10) >= t.date)) throw Error("Cutover must be after existing inventory activity.");
	aS(t.gl.map((e) => e.accountId), "GL account"), aS(t.banks.map((e) => e.bankAccountId), "bank"), aS(t.stock.map((e) => e.siteId + ":" + e.productId), "site/product");
	let r = cm({
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
	}), i = Im({
		suppliers: n.suppliers.suppliers,
		bills: n.supplierBills.supplierBills,
		payments: n.supplierPayments.supplierPayments,
		credits: n.supplierCredits.supplierCredits,
		creditAllocations: n.supplierCredits.allocations,
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: t.date
	}), a = Um({
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
	let o = P.getAll(), s = (e) => P.requireBySystemRole(e).id, c = (e) => Jx(t.gl.filter((t) => t.accountId === e).reduce((e, t) => e + t.debit - t.credit, 0));
	for (let e of t.gl) {
		let t = P.requireById(e.accountId);
		if (!t.active || ![
			"ASSET",
			"LIABILITY",
			"EQUITY"
		].includes(t.type) || e.debit > 0 && e.credit > 0 || e.debit + e.credit <= 0) throw Error("Opening GL requires active balance-sheet accounts and one positive debit or credit per row.");
	}
	let l = Jx(t.gl.reduce((e, t) => e + t.debit, 0)), u = Jx(t.gl.reduce((e, t) => e + t.credit, 0));
	if (l !== u || !l) throw Error("Opening trial balance does not balance.");
	let d = Jx(t.ar.reduce((e, t) => e + t.amount, 0)), f = Jx(t.ap.reduce((e, t) => e + t.amount, 0));
	if (c(s("ACCOUNTS_RECEIVABLE")) !== d || c(s("ACCOUNTS_PAYABLE")) !== -f) throw Error("AR/AP detail must equal imported GL control balances. Negative detail creates an unused historical credit.");
	for (let [e, r] of [["ar", t.ar], ["ap", t.ap]]) {
		aS(r.map((e) => e.contactId + ":" + e.reference.toLowerCase()), e + " reference");
		for (let i of r) {
			if (w(i.date), w(i.dueDate), !i.amount || i.date > t.date || i.dueDate < i.date) throw Error("Invalid outstanding document amount/date.");
			if (!(e === "ar" ? n.customers.customers : n.suppliers.suppliers).some((e) => e.id === i.contactId)) throw Error("Opening contact not found.");
			if ((e === "ar" ? [...n.sales.invoices.map((e) => [e.customerId, e.documentNumber]), ...n.customerCredits.creditNotes.map((e) => [e.customerId, e.creditNoteNumber])] : [...n.supplierBills.supplierBills.map((e) => [e.supplierId, e.supplierInvoiceNumber]), ...n.supplierCredits.supplierCredits.map((e) => [e.supplierId, e.supplierCreditNumber])]).some(([e, t]) => e === i.contactId && t.toLowerCase() === i.reference.toLowerCase())) throw Error("Historical document reference already exists.");
		}
	}
	let p = 0;
	for (let e of t.stock) {
		let t = tn(e.productId), n = Rr.getById(e.siteId);
		if (!t || t.status !== "ACTIVE" || t.itemType === "SERVICE" || n?.status !== "ACTIVE") throw Error("Opening stock requires active stocked products/sites.");
		if (Math.round(e.quantity * 1e4) / 1e4 !== e.quantity) throw Error("Stock quantities use at most four decimal places.");
		p = Jx(p + Jx(e.quantity * e.unitCost));
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
			let { input: t, debit: n, credit: r, ar: i, ap: a, inventory: o } = oS(e);
			return {
				date: t.date,
				debit: n,
				credit: r,
				ar: i,
				ap: a,
				inventory: o,
				bank: Jx(t.banks.reduce((e, t) => e + t.amount, 0)),
				documents: t.ar.length + t.ap.length
			};
		},
		post(e) {
			let t = Qx.parse(e), n = JSON.stringify(t), r = $x.find((e) => e.operationId === t.operationId);
			if (n.length > 5e7) throw Error("Opening import exceeds 50 MB.");
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID already used for different opening data.");
				return r;
			}
			let { input: i, s: a } = oS(t), o = crypto.randomUUID(), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
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
			a.journals = rS().journals, iS(a);
			let p = i.gl.filter((e) => ![l("ACCOUNTS_RECEIVABLE"), l("ACCOUNTS_PAYABLE")].includes(e.accountId));
			(d || f) && p.push({
				accountId: u,
				debit: Jx(d),
				credit: Jx(f)
			});
			let m = /* @__PURE__ */ new Map();
			for (let e of p) m.set(e.accountId, Jx((m.get(e.accountId) ?? 0) + e.debit - e.credit));
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
				let t = tn(e.productId), n = t.units.find((e) => e.id === t.baseUnitId), r = Ur.create({
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
				vi.receive({
					siteId: e.siteId,
					productId: t.id,
					baseUnitId: t.baseUnitId,
					quantityBase: e.quantity
				});
				let a = di({
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
			return $x = [...$x, c], nS(), c;
		},
		reverse(e) {
			if (w(e.date), rr(e.date), M(), !e.reason?.trim() || e.reason.trim().length < 3) throw Error("Reversal reason is required.");
			let t = $x.find((t) => t.id === e.id);
			if (!t) throw Error("Opening batch not found.");
			if (t.status === "REVERSED") return t;
			if (e.date < t.date) throw Error("Reversal date precedes cutover.");
			let n = rS();
			if (n.journals.journalEntries.some((e) => !t.priorJournalIds.includes(e.id) && !t.journalIds.includes(e.id)) || n.inventoryMovements.movements.some((e) => !t.priorMovementIds.includes(e.id) && !t.movementIds.includes(e.id))) throw Error("Subsequent accounting or inventory activity exists. Reverse downstream activity before correcting opening balances.");
			let r = n.sales.invoices.filter((e) => t.invoiceIds.includes(e.id)), i = n.supplierBills.supplierBills.filter((e) => t.billIds.includes(e.id)), a = [...n.customerCredits.creditNotes.filter((e) => t.customerCreditIds.includes(e.id)), ...n.supplierCredits.supplierCredits.filter((e) => t.supplierCreditIds.includes(e.id))];
			if (r.some((e) => e.amountPaid !== 0 || e.amountDue !== e.totals.total) || i.some((e) => e.totals.amountPaid !== 0 || e.totals.amountCredited !== 0) || a.some((e) => e.amountApplied !== 0 || (e.amountRefunded ?? 0) !== 0)) throw Error("Opening balances have allocations or settlements. Reverse downstream allocations before correcting them.");
			for (let e of ["customerSettlements", "supplierRefunds"]) if (JSON.stringify(n[e]).includes(t.id)) throw Error("Opening balances have downstream settlements.");
			for (let e of t.journalIds) ed(e);
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
			return n.stock.balances = t.priorStock, n.costBalances.balances = t.priorCost, n.journals = rS().journals, iS(n), $x = $x.map((n) => n.id === t.id ? {
				...n,
				status: "REVERSED",
				reversalDate: e.date,
				reversalReason: e.reason
			} : n), nS(), $x.find((e) => e.id === t.id);
		}
	},
	read: "accounting.read",
	commands: {
		preview: "accounting.post",
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ batches: $x }),
	restore: (e) => {
		$x = e.batches;
	},
	publish: nS,
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
			let t = Qx.parse(JSON.parse(e.fingerprint));
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
function sS(e) {
	let n = t(), r = [], i = (e, t, n) => r.push({
		code: e,
		message: t,
		...n ? { path: n } : {}
	});
	e.endDate >= ve((/* @__PURE__ */ new Date()).toISOString()) && i("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of A.getUnresolved()) i("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of n.purchaseOperations) e.status !== "POSTED" && i("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of lm()) i(e.code, `${e.entityId}: ${e.message}`);
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
		for (let a of qs({
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
		["AR", () => cm({
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
		["AP", () => Im({
			...f,
			suppliers: n.suppliers.suppliers,
			bills: n.supplierBills.supplierBills,
			payments: n.supplierPayments.supplierPayments,
			credits: n.supplierCredits.supplierCredits,
			creditAllocations: n.supplierCredits.allocations
		})],
		["INVENTORY", () => Um({
			...f,
			costMovements: n.costMovements.movements
		})]
	];
	try {
		let t = Zm({
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
		let t = Qm({
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
var cS = null, lS = {
	configureTrustedSession(e) {
		cS = e;
	},
	clear() {
		cS = null;
	},
	current() {
		return cS?.() ?? null;
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
}, uS = "htt.purchasePosting.manualRecoveryAudit.v1";
function dS() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(uS) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var fS = dS();
function pS(e) {
	fS.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(uS, JSON.stringify(fS));
	} catch {}
}
i("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return fS.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = j.get(e);
			return lS.canRecover() && t?.status === "RECOVERY_REQUIRED" && j.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = lS.requireRecoveryPermission(), n = j.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!j.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				j.recover(e), pS({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw pS({
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
	snapshot: () => fS,
	restore: (e) => {
		fS.splice(0, fS.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var mS = !1;
function hS() {
	if (mS || (mS = !0, k.wasRestoredOnLoad())) return;
	let e = K.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) Zl.postInvoice(t), t.status === "VOID" && Zl.reverseInvoice(t);
	let t = Wl.getAll();
	for (let e of t) Zl.postPayment(e), e.status === "REVERSED" && Zl.reversePayment(e);
	let n = G.getAll();
	for (let e of n) e.status !== "DRAFT" && (Zl.postCreditNote(e), e.status === "VOID" && Zl.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function gS() {
	let e = lm().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/sales/data/salesManualReviewService.ts
var _S = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION"
]);
function vS(e) {
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
	if (!t || !_S.has(t.kind)) throw Error("Sales operation not found.");
	if (t.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return A.recordManualReview(e.operationId, e.reference, e.operator, e.summary);
}
//#endregion
//#region electron/security/businessEngine.ts
i("salesRecovery", {
	repository: {
		previewSourceRepair: ph,
		proposeSourceRepair: mh,
		executeSourceRepair: hh,
		withdrawSourceRepair: gh,
		inspectRecovery: eg,
		recordSalesManualReview: vS,
		closeVerifiedSalesReview: bm,
		previewTargetedRepair: jh,
		proposeTargetedRepair: Mh,
		executeTargetedRepair: Nh
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
var yS = t();
function bS(e) {
	Qn(sS, () => e()?.userId ?? ""), O.connect(e), lS.configureTrustedSession(e), hS(), gS();
}
//#endregion
export { Ds as assertBankInstructionCommand, rr as assertPostingPeriod, Rd as classifyImportedBankLines, Np as dueRecurringCandidates, bS as initialize, Fp as prepareRecurringFailure, yS as workspaceDefaults };
