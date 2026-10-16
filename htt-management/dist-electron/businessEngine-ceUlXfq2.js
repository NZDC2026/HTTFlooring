import { a as e, i as t, n, o as r, p as i, r as a, t as o, u as s } from "./accountingPeriodValidation-wQqi6VPo.js";
//#region \0rolldown/runtime.js
var c = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), l = /* @__PURE__ */ c(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.for("react.view_transition"), m = Symbol.iterator;
	function ee(e) {
		return typeof e != "object" || !e ? null : (e = m && e[m] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var te = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, ne = Object.assign, re = {};
	function ie(e, t, n) {
		this.props = e, this.context = t, this.refs = re, this.updater = n || te;
	}
	ie.prototype.isReactComponent = {}, ie.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, ie.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function ae() {}
	ae.prototype = ie.prototype;
	function oe(e, t, n) {
		this.props = e, this.context = t, this.refs = re, this.updater = n || te;
	}
	var se = oe.prototype = new ae();
	se.constructor = oe, ne(se, ie.prototype), se.isPureReactComponent = !0;
	var ce = Array.isArray;
	function le() {}
	var h = {
		H: null,
		A: null,
		T: null,
		S: null
	}, ue = Object.prototype.hasOwnProperty;
	function de(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function g(e, t) {
		return de(e.type, t, e.props);
	}
	function fe(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function pe(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var me = /\/+/g;
	function he(e, t) {
		return typeof e == "object" && e && e.key != null ? pe("" + e.key) : t.toString(36);
	}
	function ge(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(le, le) : (e.status = "pending", e.then(function(t) {
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
	function _e(e, r, i, a, o) {
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
				case d: return c = e._init, _e(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + he(e, 0) : a, ce(o) ? (i = "", c != null && (i = c.replace(me, "$&/") + "/"), _e(o, r, i, "", function(e) {
			return e;
		})) : o != null && (fe(o) && (o = g(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(me, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (ce(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + he(a, u), c += _e(a, r, i, s, o);
		else if (u = ee(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + he(a, u++), c += _e(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return _e(ge(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function ve(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return _e(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function ye(e) {
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
	var be = typeof reportError == "function" ? reportError : function(e) {
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
	function _(e) {
		var t = h.T, n = {};
		n.types = t === null ? null : t.types, h.T = n;
		try {
			var r = e(), i = h.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(le, be);
		} catch (e) {
			be(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), h.T = t;
		}
	}
	function xe(e) {
		var t = h.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else _(xe.bind(null, e));
	}
	var Se = {
		map: ve,
		forEach: function(e, t, n) {
			ve(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return ve(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return ve(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!fe(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = Se, e.Component = ie, e.Fragment = r, e.Profiler = a, e.PureComponent = oe, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = h, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return h.H.useMemoCache(e);
		}
	}, e.addTransitionType = xe, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = ne({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !ue.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return de(e.type, i, r);
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
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) ue.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return de(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = fe, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: ye
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = _, e.unstable_useCacheRefresh = function() {
		return h.H.useCacheRefresh();
	}, e.use = function(e) {
		return h.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return h.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return h.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return h.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return h.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return h.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return h.H.useEffectEvent(e);
	}, e.useId = function() {
		return h.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return h.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return h.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return h.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return h.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return h.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return h.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return h.H.useRef(e);
	}, e.useState = function(e) {
		return h.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return h.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return h.H.useTransition();
	}, e.version = "19.3.0";
})), u = /* @__PURE__ */ c(((e, t) => {
	process.env.NODE_ENV !== "production" && (function() {
		function n(e, t) {
			Object.defineProperty(a.prototype, e, { get: function() {
				console.warn("%s(...) is deprecated in plain JavaScript React classes. %s", t[0], t[1]);
			} });
		}
		function r(e) {
			return typeof e != "object" || !e ? null : (e = Ne && e[Ne] || e["@@iterator"], typeof e == "function" ? e : null);
		}
		function i(e, t) {
			e = (e = e.constructor) && (e.displayName || e.name) || "ReactClass";
			var n = e + "." + t;
			Pe[n] || (console.error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", t, e), Pe[n] = !0);
		}
		function a(e, t, n) {
			this.props = e, this.context = t, this.refs = Le, this.updater = n || Fe;
		}
		function o() {}
		function s(e, t, n) {
			this.props = e, this.context = t, this.refs = Le, this.updater = n || Fe;
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
			if (typeof e == "function") return e.$$typeof === Be ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case xe: return "Fragment";
				case Ce: return "Profiler";
				case Se: return "StrictMode";
				case De: return "Suspense";
				case Oe: return "SuspenseList";
				case je: return "Activity";
				case Me: return "ViewTransition";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case _: return "Portal";
				case Te: return e.displayName || "Context";
				case we: return (e._context.displayName || "Context") + ".Consumer";
				case Ee:
					var t = e.render;
					return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case ke: return t = e.displayName || null, t === null ? d(e.type) || "Memo" : t;
				case Ae:
					t = e._payload, e = e._init;
					try {
						return d(e(t));
					} catch {}
			}
			return null;
		}
		function f(e) {
			if (e === xe) return "<>";
			if (typeof e == "object" && e && e.$$typeof === Ae) return "<...>";
			try {
				var t = d(e);
				return t ? "<" + t + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function p() {
			var e = v.A;
			return e === null ? null : e.getOwner();
		}
		function m() {
			return Error("react-stack-top-frame");
		}
		function ee(e) {
			if (Ve.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function te(e, t) {
			function n() {
				Ue || (Ue = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function ne() {
			var e = d(this.type);
			return Ge[e] || (Ge[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function re(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: be,
				type: e,
				key: t,
				props: n,
				_owner: r
			}, (o === void 0 ? null : o) === null ? Object.defineProperty(e, "ref", {
				enumerable: !1,
				value: null
			}) : Object.defineProperty(e, "ref", {
				enumerable: !1,
				get: ne
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
		function ie(e, t) {
			return t = re(e.type, t, e.props, e._owner, e._debugStack, e._debugTask), e._store && (t._store.validated = e._store.validated), t;
		}
		function ae(e) {
			oe(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === Ae && (e._payload.status === "fulfilled" ? oe(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function oe(e) {
			return typeof e == "object" && !!e && e.$$typeof === be;
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
		function ce(e, t) {
			return typeof e == "object" && e && e.key != null ? (u(e.key), se("" + e.key)) : t.toString(36);
		}
		function le(e) {
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
		function h(e, t, n, i, a) {
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
					case be:
					case _:
						s = !0;
						break;
					case Ae: return s = e._init, h(s(e._payload), t, n, i, a);
				}
			}
			if (s) {
				s = e, a = a(s);
				var c = i === "" ? "." + ce(s, 0) : i;
				return ze(a) ? (n = "", c != null && (n = c.replace(Ye, "$&/") + "/"), h(a, t, n, "", function(e) {
					return e;
				})) : a != null && (oe(a) && (a.key != null && (s && s.key === a.key || u(a.key)), n = ie(a, n + (a.key == null || s && s.key === a.key ? "" : ("" + a.key).replace(Ye, "$&/") + "/") + c), i !== "" && s != null && oe(s) && s.key == null && s._store && !s._store.validated && (n._store.validated = 2), a = n), t.push(a)), 1;
			}
			if (s = 0, c = i === "" ? "." : i + ":", ze(e)) for (var l = 0; l < e.length; l++) i = e[l], o = c + ce(i, l), s += h(i, t, n, o, a);
			else if (l = r(e), typeof l == "function") for (l === e.entries && (Je || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Je = !0), e = l.call(e), l = 0; !(i = e.next()).done;) i = i.value, o = c + ce(i, l++), s += h(i, t, n, o, a);
			else if (o === "object") {
				if (typeof e.then == "function") return h(le(e), t, n, i, a);
				throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
			}
			return s;
		}
		function ue(e, t, n) {
			if (e == null) return e;
			var r = [], i = 0;
			return h(e, r, "", "", function(e) {
				return t.call(n, e, i++);
			}), r;
		}
		function de(e) {
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
		function g() {
			var e = v.H;
			return e === null && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."), e;
		}
		function fe() {
			v.asyncTransitions--;
		}
		function pe(e) {
			var t = v.T, n = {};
			n.types = t === null ? null : t.types, n._updatedFibers = /* @__PURE__ */ new Set(), v.T = n;
			try {
				var r = e(), i = v.S;
				i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && (v.asyncTransitions++, r.then(fe, fe), r.then(c, Xe));
			} catch (e) {
				Xe(e);
			} finally {
				t === null && n._updatedFibers && (e = n._updatedFibers.size, n._updatedFibers.clear(), 10 < e && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), t !== null && n.types !== null && (t.types !== null && t.types !== n.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), t.types = n.types), v.T = t;
			}
		}
		function me(e) {
			var t = v.T;
			if (t !== null) {
				var n = t.types;
				n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
			} else v.asyncTransitions === 0 && console.error("addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition."), pe(me.bind(null, e));
		}
		function he(e) {
			if (Qe === null) try {
				var n = ("require" + Math.random()).slice(0, 7);
				Qe = (t && t[n]).call(t, "timers").setImmediate;
			} catch {
				Qe = function(e) {
					!1 === Ze && (Ze = !0, typeof MessageChannel > "u" && console.error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
					var t = new MessageChannel();
					t.port1.onmessage = e, t.port2.postMessage(void 0);
				};
			}
			return Qe(e);
		}
		function ge(e) {
			return 1 < e.length && typeof AggregateError == "function" ? AggregateError(e) : e[0];
		}
		function _e(e, t) {
			t !== y - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), y = t;
		}
		function ve(e, t, n) {
			var r = v.actQueue;
			if (r !== null) {
				if (r.length !== 0) try {
					ye(r), he(function() {
						return ve(e, t, n);
					});
					return;
				} catch (e) {
					v.thrownErrors.push(e);
				}
				else v.actQueue = null;
			}
			0 < v.thrownErrors.length ? (r = ge(v.thrownErrors), v.thrownErrors.length = 0, n(r)) : t(e);
		}
		function ye(e) {
			if (!et) {
				et = !0;
				var t = 0;
				try {
					for (; t < e.length; t++) {
						var n = e[t];
						do {
							v.didUsePromise = !1;
							var r = n(!1);
							if (r !== null) {
								if (v.didUsePromise) {
									e[t] = n, e.splice(0, t);
									return;
								}
								n = r;
							} else break;
						} while (1);
					}
					e.length = 0;
				} catch (n) {
					e.splice(0, t + 1), v.thrownErrors.push(n);
				} finally {
					et = !1;
				}
			}
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var be = Symbol.for("react.transitional.element"), _ = Symbol.for("react.portal"), xe = Symbol.for("react.fragment"), Se = Symbol.for("react.strict_mode"), Ce = Symbol.for("react.profiler"), we = Symbol.for("react.consumer"), Te = Symbol.for("react.context"), Ee = Symbol.for("react.forward_ref"), De = Symbol.for("react.suspense"), Oe = Symbol.for("react.suspense_list"), ke = Symbol.for("react.memo"), Ae = Symbol.for("react.lazy"), je = Symbol.for("react.activity"), Me = Symbol.for("react.view_transition"), Ne = Symbol.iterator, Pe = {}, Fe = {
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
		}, Ie = Object.assign, Le = {};
		Object.freeze(Le), a.prototype.isReactComponent = {}, a.prototype.setState = function(e, t) {
			if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
			this.updater.enqueueSetState(this, e, t, "setState");
		}, a.prototype.forceUpdate = function(e) {
			this.updater.enqueueForceUpdate(this, e, "forceUpdate");
		};
		var Re = {
			isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
			replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
		};
		for (nt in Re) Re.hasOwnProperty(nt) && n(nt, Re[nt]);
		o.prototype = a.prototype, Re = s.prototype = new o(), Re.constructor = s, Ie(Re, a.prototype), Re.isPureReactComponent = !0;
		var ze = Array.isArray, Be = Symbol.for("react.client.reference"), v = {
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
		}, Ve = Object.prototype.hasOwnProperty, He = console.createTask ? console.createTask : function() {
			return null;
		};
		Re = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var Ue, We, Ge = {}, Ke = Re.react_stack_bottom_frame.bind(Re, m)(), qe = He(f(m)), Je = !1, Ye = /\/+/g, Xe = typeof reportError == "function" ? reportError : function(e) {
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
		}, Ze = !1, Qe = null, y = 0, $e = !1, et = !1, tt = typeof queueMicrotask == "function" ? function(e) {
			queueMicrotask(function() {
				return queueMicrotask(e);
			});
		} : he;
		Re = Object.freeze({
			__proto__: null,
			c: function(e) {
				return g().useMemoCache(e);
			}
		});
		var nt = {
			map: ue,
			forEach: function(e, t, n) {
				ue(e, function() {
					t.apply(this, arguments);
				}, n);
			},
			count: function(e) {
				var t = 0;
				return ue(e, function() {
					t++;
				}), t;
			},
			toArray: function(e) {
				return ue(e, function(e) {
					return e;
				}) || [];
			},
			only: function(e) {
				if (!oe(e)) throw Error("React.Children.only expected to receive a single React element child.");
				return e;
			}
		};
		e.Activity = je, e.Children = nt, e.Component = a, e.Fragment = xe, e.Profiler = Ce, e.PureComponent = s, e.StrictMode = Se, e.Suspense = De, e.ViewTransition = Me, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = v, e.__COMPILER_RUNTIME = Re, e.act = function(e) {
			var t = v.actQueue, n = y;
			y++;
			var r = v.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				v.thrownErrors.push(e);
			}
			if (0 < v.thrownErrors.length) throw _e(t, n), e = ge(v.thrownErrors), v.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return tt(function() {
					i || $e || ($e = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				}), { then: function(e, a) {
					i = !0, o.then(function(i) {
						if (_e(t, n), n === 0) {
							try {
								ye(r), he(function() {
									return ve(i, e, a);
								});
							} catch (e) {
								v.thrownErrors.push(e);
							}
							if (0 < v.thrownErrors.length) {
								var o = ge(v.thrownErrors);
								v.thrownErrors.length = 0, a(o);
							}
						} else e(i);
					}, function(e) {
						_e(t, n), 0 < v.thrownErrors.length ? (e = ge(v.thrownErrors), v.thrownErrors.length = 0, a(e)) : a(e);
					});
				} };
			}
			var s = a;
			if (_e(t, n), n === 0 && (ye(r), r.length !== 0 && tt(function() {
				i || $e || ($e = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), v.actQueue = null), 0 < v.thrownErrors.length) throw e = ge(v.thrownErrors), v.thrownErrors.length = 0, e;
			return { then: function(e, t) {
				i = !0, n === 0 ? (v.actQueue = r, he(function() {
					return ve(s, e, t);
				})) : e(s);
			} };
		}, e.addTransitionType = me, e.cache = function(e) {
			return function() {
				return e.apply(null, arguments);
			};
		}, e.cacheSignal = function() {
			return null;
		}, e.captureOwnerStack = function() {
			var e = v.getCurrentStack;
			return e === null ? null : e();
		}, e.cloneElement = function(e, t, n) {
			if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
			var r = Ie({}, e.props), i = e.key, a = e._owner;
			if (t != null) {
				var o;
				a: {
					if (Ve.call(t, "ref") && (o = Object.getOwnPropertyDescriptor(t, "ref").get) && o.isReactWarning) {
						o = !1;
						break a;
					}
					o = t.ref !== void 0;
				}
				for (s in o && (a = p()), ee(t) && (u(t.key), i = "" + t.key), t) !Ve.call(t, s) || s === "key" || s === "__self" || s === "__source" || s === "ref" && t.ref === void 0 || (r[s] = t[s]);
			}
			var s = arguments.length - 2;
			if (s === 1) r.children = n;
			else if (1 < s) {
				o = Array(s);
				for (var c = 0; c < s; c++) o[c] = arguments[c + 2];
				r.children = o;
			}
			for (r = re(e.type, i, r, a, e._debugStack, e._debugTask), i = 2; i < arguments.length; i++) ae(arguments[i]);
			return r;
		}, e.createContext = function(e) {
			return e = {
				$$typeof: Te,
				_currentValue: e,
				_currentValue2: e,
				_threadCount: 0,
				Provider: null,
				Consumer: null
			}, e.Provider = e, e.Consumer = {
				$$typeof: we,
				_context: e
			}, e._currentRenderer = null, e._currentRenderer2 = null, e;
		}, e.createElement = function(e, t, n) {
			for (var r = 2; r < arguments.length; r++) ae(arguments[r]);
			var i;
			r = {};
			var a = null;
			if (t != null) for (i in We || !("__self" in t) || "key" in t || (We = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), ee(t) && (u(t.key), a = "" + t.key), t) Ve.call(t, i) && i !== "key" && i !== "__self" && i !== "__source" && (r[i] = t[i]);
			var o = arguments.length - 2;
			if (o === 1) r.children = n;
			else if (1 < o) {
				for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
				Object.freeze && Object.freeze(s), r.children = s;
			}
			if (e && e.defaultProps) for (i in o = e.defaultProps, o) r[i] === void 0 && (r[i] = o[i]);
			return a && te(r, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), (i = 1e4 > v.recentlyCreatedOwnerStacks++) ? (s = Error.stackTraceLimit, Error.stackTraceLimit = 10, o = Error("react-stack-top-frame"), Error.stackTraceLimit = s) : o = Ke, re(e, a, r, p(), o, i ? He(f(e)) : qe);
		}, e.createRef = function() {
			var e = { current: null };
			return Object.seal(e), e;
		}, e.forwardRef = function(e) {
			e != null && e.$$typeof === ke ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e == "function" ? e.length !== 0 && e.length !== 2 && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.") : console.error("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e), e != null && e.defaultProps != null && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
			var t = {
				$$typeof: Ee,
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
		}, e.isValidElement = oe, e.lazy = function(e) {
			e = {
				_status: -1,
				_result: e
			};
			var t = {
				$$typeof: Ae,
				_payload: e,
				_init: de
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
				$$typeof: ke,
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
		}, e.startTransition = pe, e.unstable_useCacheRefresh = function() {
			return g().useCacheRefresh();
		}, e.use = function(e) {
			return g().use(e);
		}, e.useActionState = function(e, t, n) {
			return g().useActionState(e, t, n);
		}, e.useCallback = function(e, t) {
			return g().useCallback(e, t);
		}, e.useContext = function(e) {
			var t = g();
			return e.$$typeof === we && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"), t.useContext(e);
		}, e.useDebugValue = function(e, t) {
			return g().useDebugValue(e, t);
		}, e.useDeferredValue = function(e, t) {
			return g().useDeferredValue(e, t);
		}, e.useEffect = function(e, t) {
			return e ?? console.warn("React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"), g().useEffect(e, t);
		}, e.useEffectEvent = function(e) {
			return g().useEffectEvent(e);
		}, e.useId = function() {
			return g().useId();
		}, e.useImperativeHandle = function(e, t, n) {
			return g().useImperativeHandle(e, t, n);
		}, e.useInsertionEffect = function(e, t) {
			return e ?? console.warn("React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"), g().useInsertionEffect(e, t);
		}, e.useLayoutEffect = function(e, t) {
			return e ?? console.warn("React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"), g().useLayoutEffect(e, t);
		}, e.useMemo = function(e, t) {
			return g().useMemo(e, t);
		}, e.useOptimistic = function(e, t) {
			return g().useOptimistic(e, t);
		}, e.useReducer = function(e, t, n) {
			return g().useReducer(e, t, n);
		}, e.useRef = function(e) {
			return g().useRef(e);
		}, e.useState = function(e) {
			return g().useState(e);
		}, e.useSyncExternalStore = function(e, t, n) {
			return g().useSyncExternalStore(e, t, n);
		}, e.useTransition = function() {
			return g().useTransition();
		}, e.version = "19.3.0", typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
})), d = /* @__PURE__ */ c(((e, t) => {
	t.exports = process.env.NODE_ENV === "production" ? l() : u();
}));
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/util.js
function f(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function p(e, t = "|") {
	return e.map((e) => xe(e)).join(t);
}
function m(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
var ee = class {
	constructor(e) {
		this._getter = e, this._value = void 0;
	}
	get value() {
		let e = this._getter;
		return e !== void 0 && (this._value = e(), this._getter = void 0), this._value;
	}
};
function te(e) {
	return new ee(e);
}
function ne(e) {
	return e == null;
}
function re(e) {
	let t = +!!e.startsWith("^"), n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function ie(e, t) {
	let n = e / t, r = Math.round(n), i = 4 * 2 ** -52 * Math.max(Math.abs(n), 1);
	return Math.abs(n - r) < i ? 0 : n - r;
}
function ae(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function oe(e) {
	let t = Object.getOwnPropertyDescriptor(e, "shape");
	return t?.get ? t.get.raw : t?.value;
}
function se(e) {
	return oe(e._zod.def) ?? e._zod.def.shape;
}
function ce(e, t, n) {
	Object.defineProperty(e, t, {
		get() {
			let e = n();
			return ae(this, t, e), e;
		},
		enumerable: !0,
		configurable: !0
	});
}
function le(e, t, n) {
	t in e ? ae(e, t, n) : e[t] = n;
}
function h(e, t, n, r) {
	let i = se(t);
	for (let a of n) {
		let n = Object.getOwnPropertyDescriptor(i, a);
		n.enumerable && (n.get ? ce(e, a, () => {
			let e = t._zod.def.shape[a];
			return r ? r(e, a) : e;
		}) : le(e, a, r ? r(n.value, a) : n.value));
	}
}
function ue(e, t) {
	for (let n of Reflect.ownKeys(t)) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.enumerable && (r.get ? ce(e, n, () => t[n]) : le(e, n, r.value));
	}
}
function de(...e) {
	let t = {};
	for (let n of e) {
		let e = Object.getOwnPropertyDescriptors(n);
		Object.assign(t, e);
	}
	return Object.defineProperties({}, t);
}
function g(e) {
	return JSON.stringify(e);
}
function fe(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var pe = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function me(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var he = /* @__PURE__*/ te(() => {
	if (ct.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function ge(e) {
	if (me(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return me(n) !== !1 && Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") !== !1;
}
function _e(e) {
	return ge(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var ve = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function ye(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function be(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n?.parent) && (r._zod.parent = e), r;
}
function _(e) {
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
function xe(e) {
	return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function Se(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
var Ce = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, we = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function Te(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	let i = {};
	return h(i, e, Ee(e, t)), be(e, de(n, {
		shape: i,
		checks: []
	}));
}
function Ee(e, t) {
	let n = se(e), r = [];
	for (let e of Reflect.ownKeys(t)) {
		if (!Object.getOwnPropertyDescriptor(n, e)?.enumerable) throw Error(`Unrecognized key: "${String(e)}"`);
		t[e] && r.push(e);
	}
	return r;
}
function De(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	let i = new Set(Ee(e, t)), a = {};
	return h(a, e, Reflect.ownKeys(se(e)).filter((e) => !i.has(e))), be(e, de(n, {
		shape: a,
		checks: []
	}));
}
function Oe(e, t) {
	if (!ge(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = se(e);
		for (let e of Reflect.ownKeys(t)) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return be(e, de(e._zod.def, { shape: ke(e, t) }));
}
function ke(e, t) {
	let n = {};
	return h(n, e, Reflect.ownKeys(se(e))), ue(n, t), n;
}
function Ae(e, t) {
	if (!ge(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return be(e, de(e._zod.def, { shape: ke(e, t) }));
}
function je(e, t) {
	if (!t?._zod?.def) throw Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (e._zod.def.checks?.length) throw Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	let n = {};
	return h(n, e, Reflect.ownKeys(se(e))), h(n, t, Reflect.ownKeys(se(t))), be(e, de(e._zod.def, {
		shape: n,
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: t._zod.def.checks ?? []
	}));
}
function Me(e, t, n, r = "partial") {
	let i = t._zod.def.checks;
	if (i && i.length > 0) throw Error(`.${r}() cannot be used on object schemas containing refinements`);
	let a = n ? new Set(Ee(t, n)) : void 0, o = {};
	return h(o, t, Reflect.ownKeys(se(t)), e && ((t, n) => a && !a.has(n) ? t : new e({
		type: "optional",
		innerType: t
	}))), be(t, de(t._zod.def, {
		shape: o,
		checks: []
	}));
}
function Ne(e, t, n) {
	let r = n ? new Set(Ee(t, n)) : void 0, i = {};
	return h(i, t, Reflect.ownKeys(se(t)), (t, n) => r && !r.has(n) ? t : new e({
		type: "nonoptional",
		innerType: t
	})), be(t, de(t._zod.def, { shape: i }));
}
function Pe(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function Fe(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
	return !1;
}
function Ie(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function Le(e) {
	return typeof e == "string" ? e : e?.message;
}
function Re(e, t, n) {
	var r;
	for (let i = t; i < e.length; i++) (r = e[i]).schema ?? (r.schema = n);
}
function ze(e, t, n) {
	var r;
	let i = e.inst?._zod?.traits;
	i?.has("$ZodType") && (i.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
	let a = e.schema === e.inst ? void 0 : e.schema?._zod.def?.error, o = e.message ? e.message : Le(e.inst?._zod.def?.error?.(e)) ?? Le(a?.(e)) ?? Le(t?.error?.(e)) ?? Le(n.customError?.(e)) ?? Le(n.localeError?.(e)) ?? "Invalid input", s = {};
	for (let t of Object.keys(e)) t !== "inst" && t !== "schema" && t !== "continue" && t !== "input" && t !== "__proto__" && (s[t] = e[t]);
	return s.path ??= [], s.message = o, t?.reportInput && (s.input = e.input), s;
}
var Be = /[\uD800-\uDBFF]/;
function v(e) {
	let t = e.length;
	if (!Be.test(e)) return t;
	let n = t;
	for (let r = 0; r < t - 1; r++) (e.charCodeAt(r) & 64512) == 55296 && (e.charCodeAt(r + 1) & 64512) == 56320 && (n--, r++);
	return n;
}
function Ve(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function He(e) {
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
function Ue(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
function We(e, t) {
	for (let n in t) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.get ? Object.defineProperty(e, n, {
			...r,
			enumerable: !1
		}) : Je(e, n, r.value);
	}
}
function Ge(e, t, n, r = !0) {
	return Object.defineProperty(e, t, {
		configurable: !0,
		writable: !0,
		enumerable: r,
		value: n
	}), n;
}
function Ke(e, t, n) {
	return Ge(e, t, n, !1);
}
function qe(e, t) {
	for (let n in e) {
		let r = e[n];
		Object.defineProperty(t, n, {
			configurable: !0,
			enumerable: !0,
			get() {
				return Ge(this, n, r(this));
			},
			set(e) {
				Ge(this, n, e);
			}
		});
	}
	return t;
}
function Je(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		get() {
			return this == null ? n : Ge(this, t, n.bind(this));
		},
		set(e) {
			Ge(this, t, e);
		}
	});
}
function Ye(e, t) {
	let n = Object.getPrototypeOf(e);
	return t in n ? void 0 : n;
}
var Xe, Ze = !1, Qe = {
	configurable: !0,
	get() {
		Ze = !0;
	}
};
function y(e, t, n) {
	let r = Object.getPrototypeOf(e._zod);
	if (t in r && Xe !== e._zod) {
		Xe = void 0;
		return;
	}
	Xe = e._zod, Object.defineProperty(r, t, {
		configurable: !0,
		get() {
			Object.defineProperty(this, t, Qe);
			let e = Ze;
			Ze = !1;
			try {
				let r = n(this);
				return Ze ? delete this[t] : Object.defineProperty(this, t, {
					configurable: !0,
					writable: !0,
					value: r
				}), Ze ||= e, r;
			} catch (n) {
				throw delete this[t], Ze ||= e, n;
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
function $e(e, t, n, r) {
	let i = Ye(e, t);
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
var et = "~constantCatch";
function tt(e) {
	let t = () => e;
	return t[et] = !0, t;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/core.js
var nt, rt = {
	value: void 0,
	enumerable: !1
}, it = "captureStackTrace" in Error ? Error : null;
function at(e) {
	let t = it;
	if (t) {
		let n = t.stackTraceLimit;
		if (typeof n == "number") {
			try {
				t.stackTraceLimit = 0;
			} catch {
				return it = null, new e();
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
function b(e, t, n, r) {
	let i = {};
	function a(e) {
		this.def = e, this.constr = d, this.traits = /* @__PURE__ */ new Set();
	}
	a.prototype = i;
	let o = n, s = o && /* @__PURE__ */ new WeakSet();
	function c(n, r) {
		if (!n._zod) {
			rt.value = new a(r);
			try {
				Object.defineProperty(n, "_zod", rt);
			} finally {
				rt.value = void 0;
			}
		} else if (n._zod.traits.has(e)) return;
		if (n._zod.traits.add(e), t(n, r), s) {
			let e = Object.getPrototypeOf(n), t = n._zod.constr.prototype, r = e;
			for (; r && r !== t;) r = Object.getPrototypeOf(r);
			let i = r ?? e;
			s.has(i) || (s.add(i), We(i, o));
		}
		let i = d.prototype;
		for (let e in i) Object.prototype.hasOwnProperty.call(i, e) && (e in n || (n[e] = i[e].bind(n)));
	}
	let l = r?.Parent ?? Object;
	class u extends l {}
	Object.defineProperty(u, "name", { value: e });
	function d(e) {
		let t = r?.Parent ? at(u) : this;
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
var ot = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, st = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(nt = globalThis).__zod_globalConfig ?? (nt.__zod_globalConfig = {});
var ct = globalThis.__zod_globalConfig;
function lt(e) {
	return e && Object.assign(ct, e), ct;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/errors.js
function ut() {
	let e = this._zod;
	return e.message ??= JSON.stringify(e.def, m, 2), e.message;
}
function dt(e) {
	this._zod.message = e;
}
var ft = {
	get: ut,
	set: dt,
	enumerable: !0,
	configurable: !0
}, pt = {
	value: void 0,
	enumerable: !1
}, mt = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), ht = (e, t) => {
	e.name = "$ZodError", pt.value = t, Object.defineProperty(e, "issues", pt), pt.value = void 0, Object.defineProperty(e, "message", ft);
	let n = Object.getPrototypeOf(e);
	mt.has(n) || (mt.add(n), Object.defineProperty(n, "toString", {
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
}, gt = b("$ZodError", ht);
b("$ZodError", ht, void 0, { Parent: Error });
function _t(e, t, n) {
	return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, {
		value: n(),
		writable: !0,
		enumerable: !0,
		configurable: !0
	}) : e[t] = n()), e[t];
}
function vt(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? _t(n, i.path[0], () => []).push(t(i)) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function yt(e, t = (e) => e.message) {
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
function bt(e, t) {
	return {
		callee: t?.callee ?? e,
		Err: t?.Err
	};
}
var xt = (e) => {
	let t = (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !1
		} : { async: !1 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise) throw new ot();
		if (s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => ze(e, o, lt())));
			throw pe(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, St = (e) => {
	let t = async (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !0
		} : { async: !0 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise && (s = await s), s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => ze(e, o, lt())));
			throw pe(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, Ct = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new ot();
	return a.issues.length ? wt(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
};
function wt(e, t, n) {
	let r;
	return {
		success: !1,
		get error() {
			return r || (r = new e(t.map((e) => ze(e, n, lt()))), t = void 0, n = void 0), r;
		},
		set error(e) {
			r = e, t = void 0, n = void 0;
		}
	};
}
var Tt = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		async: !0
	} : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? wt(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
}, Et = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), Dt = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), Ot = ((e, t, n) => {
	let r = e._zod.bag.validator;
	if (r !== void 0) {
		if (r(t) !== Et) return !0;
		if (r.definite === !0 && n === void 0) return !1;
	}
	return kt(e, t, n);
});
function kt(e, t, n) {
	let r = n ? {
		...n,
		async: !1,
		abortEarly: !0
	} : {
		async: !1,
		abortEarly: !0
	}, i = e._zod.bag.fallbackRun, a;
	if (i ? (r[Dt] = !0, a = i({
		value: t,
		issues: []
	}, r)) : a = e._zod.run({
		value: t,
		issues: []
	}, r), a instanceof Promise) throw new ot();
	return a.issues.length === 0;
}
var At = async (e, t, n) => {
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
}, jt = (e) => {
	let t = xt(e), n = (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return t(e, r, o, bt(n, a));
	};
	return n;
}, Mt = (e) => {
	let t = xt(e), n = (e, r, i, a) => t(e, r, i, bt(n, a));
	return n;
}, Nt = (e) => {
	let t = St(e), n = async (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return await t(e, r, o, bt(n, a));
	};
	return n;
}, Pt = (e) => {
	let t = St(e), n = async (e, r, i, a) => await t(e, r, i, bt(n, a));
	return n;
}, Ft = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Ct(e)(t, n, i);
}, It = (e) => (t, n, r) => Ct(e)(t, n, r), Lt = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Tt(e)(t, n, i);
}, Rt = (e) => async (t, n, r) => Tt(e)(t, n, r), zt = /^[cC][0-9a-z]{6,}$/, Bt = /^[0-9a-z]+$/, Vt = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, Ht = /^[0-9a-vA-V]{20}$/, Ut = /^[A-Za-z0-9]{27}$/, Wt = /^[a-zA-Z0-9_-]{21}$/;
function Gt(e) {
	return RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
var Kt = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, qt = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Jt = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, Yt = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Xt = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function Zt() {
	return new RegExp(Xt, "u");
}
var Qt = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, $t = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, en = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, tn = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, nn = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, rn = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, an = /^https?$/, on = /^\+[1-9]\d{6,14}$/, sn = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function cn(e) {
	return RegExp(`^${e}$`);
}
var ln = /*@__PURE__*/ cn(sn);
function un(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function dn(e) {
	return RegExp(`^${un(e)}$`);
}
function fn(e) {
	let t = ["Z"];
	e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let n = `${un({
		precision: e.precision,
		seconds: !0
	})}(?:${t.join("|")})`, r = e.local ? `${n}|${un({ precision: e.precision })}` : n;
	return RegExp(`^${sn}T(?:${r})$`);
}
var pn = /^[\s\S]{0,}$/, mn = /^-?\d+$/, hn = /^-?\d+(?:\.\d+)?$/, gn = /^(?:true|false)$/i, _n = /^[^A-Z]*$/, vn = /^[^a-z]*$/, yn = /*@__PURE__*/ b("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), bn = (e) => {
	let t = e.value;
	return !ne(t) && t.length !== void 0;
}, xn = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, Sn = /*@__PURE__*/ b("$ZodCheckLessThan", (e, t) => {
	yn.init(e, t);
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
}), Cn = /*@__PURE__*/ b("$ZodCheckGreaterThan", (e, t) => {
	yn.init(e, t);
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
}), wn = /*@__PURE__*/ b("$ZodCheckMultipleOf", (e, t) => {
	yn.init(e, t), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? t.value !== BigInt(0) && n.value % t.value === BigInt(0) : ie(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Tn = /*@__PURE__*/ b("$ZodCheckNumberFormat", (e, t) => {
	yn.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = Ce[t.format];
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
}), En = /*@__PURE__*/ b("$ZodCheckMaxLength", (e, t) => {
	var n;
	yn.init(e, t), (n = e._zod.def).when ?? (n.when = bn), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i > t.maximum ? v(r) : i) <= t.maximum) return;
		let a = Ve(r);
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
}), Dn = /*@__PURE__*/ b("$ZodCheckMinLength", (e, t) => {
	var n;
	yn.init(e, t), (n = e._zod.def).when ?? (n.when = bn), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i >= t.minimum && i < t.minimum * 2 ? v(r) : i) >= t.minimum) return;
		let a = Ve(r);
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
}), On = /*@__PURE__*/ b("$ZodCheckLengthEquals", (e, t) => {
	var n;
	yn.init(e, t), (n = e._zod.def).when ?? (n.when = bn), e._zod.check = (n) => {
		let r = n.value, i = r.length, a = typeof r == "string" && i >= t.length && i <= t.length * 2 ? v(r) : i;
		if (a === t.length) return;
		let o = Ve(r), s = a > t.length;
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
}), kn = /*@__PURE__*/ b("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	yn.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
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
}), An = /*@__PURE__*/ b("$ZodCheckRegex", (e, t) => {
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
}), jn = /*@__PURE__*/ b("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= _n, kn.init(e, t);
}), Mn = /*@__PURE__*/ b("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= vn, kn.init(e, t);
}), Nn = /*@__PURE__*/ b("$ZodCheckIncludes", (e, t) => {
	yn.init(e, t);
	let n = ye(t.includes);
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
}), Pn = /*@__PURE__*/ b("$ZodCheckStartsWith", (e, t) => {
	yn.init(e, t);
	let n = RegExp(`^${ye(t.prefix)}.*`);
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
}), Fn = /*@__PURE__*/ b("$ZodCheckEndsWith", (e, t) => {
	yn.init(e, t);
	let n = RegExp(`.*${ye(t.suffix)}$`);
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
}), In = /*@__PURE__*/ b("$ZodCheckOverwrite", (e, t) => {
	yn.init(e, t), e._zod.check = (e) => {
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
}, x = /*@__PURE__*/ b("$ZodType", (e, t) => {
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
			let i = Pe(t), a;
			for (let o of n) {
				if (o._zod.def.when) {
					if (Fe(t) || !o._zod.def.when(t)) continue;
				} else if (i) continue;
				let n = t.issues.length, s = o._zod.check(t);
				if (s instanceof Promise && r?.async === !1) throw new ot();
				if (a || s instanceof Promise) a = (a ?? Promise.resolve()).then(async () => {
					await s, t.issues.length !== n && (Re(t.issues, n, e), i ||= Pe(t, n));
				});
				else {
					if (t.issues.length === n) continue;
					Re(t.issues, n, e), i ||= Pe(t, n);
				}
			}
			return a ? a.then(() => t) : t;
		}, n = (n, r, a) => {
			if (Pe(n)) return n.aborted = !0, n;
			let o = t(r, i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new ot();
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
				if (a.async === !1) throw new ot();
				return o.then((e) => t(e, i, a));
			}
			return t(o, i, a);
		};
	}
}, {
	get "~standard"() {
		return Ke(this, "~standard", Vn(this));
	},
	set "~standard"(e) {
		Ge(this, "~standard", e);
	}
}), zn = (e, t) => e.issues.length ? { issues: e.issues.map((e) => ze(e, t, lt())) } : { value: e.value };
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
var Hn = /*@__PURE__*/ b("$ZodString", (e, t) => {
	x.init(e, t), e._zod.pattern = t.pattern ?? pn, e._zod.parse = (n, r) => {
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
}), S = /*@__PURE__*/ b("$ZodStringFormat", (e, t) => {
	kn.init(e, t), Hn.init(e, t);
}), Un = /*@__PURE__*/ b("$ZodGUID", (e, t) => {
	t.pattern ??= qt, S.init(e, t);
}), Wn = /*@__PURE__*/ b("$ZodUUID", (e, t) => {
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
		t.pattern ??= Jt(e);
	} else t.pattern ??= Jt();
	S.init(e, t);
}), Gn = /*@__PURE__*/ b("$ZodEmail", (e, t) => {
	t.pattern ??= Yt, S.init(e, t);
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
	if (!t.normalize && t.protocol?.source === an.source && !/^https?:\/\//i.test(e)) return 1;
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
var $n = /*@__PURE__*/ b("$ZodURL", (e, t) => {
	S.init(e, t), e._zod.check = (n) => {
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
}), er = /*@__PURE__*/ b("$ZodEmoji", (e, t) => {
	t.pattern ??= Zt(), S.init(e, t);
}), tr = /*@__PURE__*/ b("$ZodNanoID", (e, t) => {
	if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1)) throw Error(`Invalid nanoid length: ${t.length}`);
	t.pattern ??= t.length === void 0 ? Wt : Gt(t.length), S.init(e, t);
}), nr = /*@__PURE__*/ b("$ZodCUID", (e, t) => {
	t.pattern ??= zt, S.init(e, t);
}), rr = /*@__PURE__*/ b("$ZodCUID2", (e, t) => {
	t.pattern ??= Bt, S.init(e, t);
}), ir = /*@__PURE__*/ b("$ZodULID", (e, t) => {
	t.pattern ??= Vt, S.init(e, t);
}), ar = /*@__PURE__*/ b("$ZodXID", (e, t) => {
	t.pattern ??= Ht, S.init(e, t);
}), or = /*@__PURE__*/ b("$ZodKSUID", (e, t) => {
	t.pattern ??= Ut, S.init(e, t);
}), sr = /*@__PURE__*/ b("$ZodISODateTime", (e, t) => {
	t.pattern ??= fn(t), S.init(e, t);
}), cr = /*@__PURE__*/ b("$ZodISODate", (e, t) => {
	t.pattern ??= ln, S.init(e, t);
}), lr = /*@__PURE__*/ b("$ZodISOTime", (e, t) => {
	t.pattern ??= dn(t), S.init(e, t);
}), ur = /*@__PURE__*/ b("$ZodISODuration", (e, t) => {
	t.pattern ??= Kt, S.init(e, t);
}), dr = /*@__PURE__*/ b("$ZodIPv4", (e, t) => {
	t.pattern ??= Qt, S.init(e, t);
}), fr = /^[0-9a-fA-F:.]+$/;
function pr(e) {
	return fr.test(e) ? Kn(`http://[${e}]`) : !1;
}
var mr = /*@__PURE__*/ b("$ZodIPv6", (e, t) => {
	t.pattern ??= $t, S.init(e, t), e._zod.check = (n) => {
		pr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), hr = /*@__PURE__*/ b("$ZodCIDRv4", (e, t) => {
	t.pattern ??= en, S.init(e, t);
});
function gr(e) {
	let t = e.split("/");
	if (t.length !== 2) return !1;
	let [n, r] = t;
	if (!r) return !1;
	let i = Number(r);
	return `${i}` !== r || i < 0 || i > 128 ? !1 : pr(n);
}
var _r = /*@__PURE__*/ b("$ZodCIDRv6", (e, t) => {
	t.pattern ??= tn, S.init(e, t), e._zod.check = (n) => {
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
var yr = /^[0-9a-zA-Z+/]*={0,2}$/, br = /*@__PURE__*/ b("$ZodBase64", (e, t) => {
	t.pattern ??= yr, S.init(e, t), e._zod.check = (n) => {
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
var Cr = /*@__PURE__*/ b("$ZodBase64URL", (e, t) => {
	t.pattern ??= xr, S.init(e, t), e._zod.check = (n) => {
		Sr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), wr = /*@__PURE__*/ b("$ZodE164", (e, t) => {
	t.pattern ??= on, S.init(e, t);
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
var Er = /*@__PURE__*/ b("$ZodJWT", (e, t) => {
	S.init(e, t), e._zod.check = (n) => {
		Tr(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Dr = /*@__PURE__*/ b("$ZodNumber", (e, t) => {
	x.init(e, t), e._zod.pattern = hn, e._zod.parse = (n, r) => {
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
}), Or = /*@__PURE__*/ b("$ZodNumberFormat", (e, t) => {
	Tn.init(e, t), Dr.init(e, t);
}), kr = /*@__PURE__*/ b("$ZodBoolean", (e, t) => {
	x.init(e, t), e._zod.pattern = gn, e._zod.parse = (n, r) => {
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
}), Ar = /*@__PURE__*/ b("$ZodUnknown", (e, t) => {
	x.init(e, t), e._zod.parse = (e) => e;
}), jr = /*@__PURE__*/ b("$ZodNever", (e, t) => {
	x.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function Mr(e, t, n) {
	e.issues.length && t.issues.push(...Ie(n, e.issues)), t.value[n] = e.value;
}
var Nr = /*@__PURE__*/ b("$ZodArray", (e, t) => {
	x.init(e, t);
	let n = ct.memoizer;
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
			else if (Mr(c, r, e), s && c.issues.length !== 0 && Pe(c)) break;
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	};
});
function Pr(e, t, n, r, i, a) {
	let o = n in r, s = a === "optional";
	if (o || !s || i !== "optional") {
		if (e.issues.length) {
			if (i !== void 0 && s && !o) return;
			t.issues.push(...Ie(n, e.issues));
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
	let a = Se(e.shape);
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
			if (Pe(n, p)) break;
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
var Rr = /*@__PURE__*/ b("$ZodObject", (e, t) => {
	x.init(e, t);
	let n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
	if (r) {
		let e = () => {
			let n = { ...r };
			return Object.defineProperty(t, "shape", { value: n }), e.raw = n, n;
		};
		e.raw = r, Object.defineProperty(t, "shape", { get: e });
	}
	let i = te(() => Ir(t));
	y(e, "propValues", (e) => {
		let t = e.def.shape, n = {};
		for (let e in t) {
			let r = t[e]._zod;
			if (r.values) {
				Object.prototype.hasOwnProperty.call(n, e) || ae(n, e, /* @__PURE__ */ new Set());
				for (let t of r.values) n[e].add(t);
				r.optin !== void 0 && n[e].add(void 0);
			}
		}
		return n;
	});
	let a = me, o = t.catchall, s, c = ct.memoizer;
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
				if (Pe(t, f)) break;
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
}), zr = /*@__PURE__*/ b("$ZodObjectJIT", (e, t) => {
	Rr.init(e, t);
	let n = e._zod.parse, r = te(() => Ir(t)), i = ct.memoizer, a = (t) => {
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
			let n = l[e], r = typeof e == "symbol" ? `syms[${a.indexOf(e)}]` : g(e), i = `${r} in input`, u = t[e], d = u?._zod?.optin, f = d !== void 0, p = u?._zod?.optout === "optional";
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
	}, o, s = me, c = !ct.jitless, l = c && he.value, u = t.catchall, d;
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
	let i = e.filter((e) => !Pe(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => ze(e, r, lt())))
	}), t);
}
var Vr = /*@__PURE__*/ b("$ZodUnion", (e, t) => {
	x.init(e, t), y(e, "optin", (e) => e.def.options.some((e) => e._zod.optin === "defaulted") ? "defaulted" : e.def.options.some((e) => e._zod.optin !== void 0) ? "optional" : void 0), y(e, "optout", (e) => e.def.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), y(e, "values", (e) => {
		if (e.def.options.every((e) => e._zod.values)) return new Set(e.def.options.flatMap((e) => Array.from(e._zod.values)));
	}), y(e, "pattern", (e) => {
		if (e.def.options.every((e) => e._zod.pattern)) {
			let t = e.def.options.map((e) => e._zod.pattern);
			return RegExp(`^(${t.map((e) => re(e.source)).join("|")})$`);
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
}), Hr = /*@__PURE__*/ b("$ZodIntersection", (e, t) => {
	x.init(e, t), e._zod.parse = (e, n) => {
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
	if (ge(e) && ge(t)) {
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
		if (Pe(e)) return e;
		throw Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
	}
	return e.value = c.data, e;
}
var Gr = /*@__PURE__*/ b("$ZodRecord", (e, t) => {
	x.init(e, t);
	let n = ct.memoizer;
	n?.attach(e), e._zod.parse = (r, i) => {
		let a = r.value;
		if (!ge(a)) return r.issues.push({
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
						issues: s.issues.map((e) => ze(e, i, lt())),
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
					e.issues.length && r.issues.push(...Ie(n, e.issues)), r.value[l] = e.value;
				})) : (u.issues.length && r.issues.push(...Ie(n, u.issues)), r.value[l] = u.value);
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
				if (typeof n == "string" && hn.test(n) && l.issues.length) {
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
						issues: l.issues.map((e) => ze(e, i, lt())),
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
					e.issues.length && r.issues.push(...Ie(n, e.issues)), r.value[u] = e.value;
				})) : (d.issues.length && r.issues.push(...Ie(n, d.issues)), r.value[u] = d.value);
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
}), Kr = /*@__PURE__*/ b("$ZodEnum", (e, t) => {
	x.init(e, t);
	let n = f(t.entries), r = new Set(n);
	e._zod.values = r, y(e, "pattern", (e) => {
		let t = f(e.def.entries).filter((e) => ve.has(typeof e));
		return RegExp(t.length ? `^(${t.map((e) => ye(e.toString())).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), qr = /*@__PURE__*/ b("$ZodTransform", (e, t) => {
	x.init(e, t), e._zod.optin = "optional", ct.memoizer?.guard(e), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new st(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new ot();
		return n.value = i, n;
	};
});
function Jr(e, t) {
	return e.value = t.issues.length ? void 0 : t.value, e;
}
var Yr = /*@__PURE__*/ b("$ZodOptional", (e, t) => {
	x.init(e, t), y(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", y(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? /* @__PURE__ */ new Set([...t, void 0]) : void 0;
	}), y(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${re(t.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (e.value === void 0) {
			if (t.innerType._zod.optin !== "defaulted") return e;
			let r = t.innerType._zod.run({
				value: e.value,
				issues: []
			}, n);
			return r instanceof Promise ? r.then((t) => Jr(e, t)) : Jr(e, r);
		}
		return t.innerType._zod.run(e, n);
	};
}), Xr = /*@__PURE__*/ b("$ZodExactOptional", (e, t) => {
	Yr.init(e, t), y(e, "values", (e) => e.def.innerType._zod.values), y(e, "pattern", (e) => e.def.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), Zr = /*@__PURE__*/ b("$ZodNullable", (e, t) => {
	x.init(e, t), y(e, "optin", (e) => e.def.innerType._zod.optin), y(e, "optout", (e) => e.def.innerType._zod.optout), y(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${re(t.source)}|null)$`) : void 0;
	}), y(e, "values", (e) => e.def.innerType._zod.values ? /* @__PURE__ */ new Set([...e.def.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), Qr = /*@__PURE__*/ b("$ZodDefault", (e, t) => {
	x.init(e, t), e._zod.optin = "defaulted", y(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => $r(e, t)) : $r(r, t);
	};
});
function $r(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var ei = /*@__PURE__*/ b("$ZodPrefault", (e, t) => {
	x.init(e, t), e._zod.optin = "defaulted", y(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), ti = /*@__PURE__*/ b("$ZodNonOptional", (e, t) => {
	x.init(e, t), y(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? new Set([...t].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => ni(t, e)) : ni(i, e);
	};
});
function ni(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
function ri(e, t, n, r) {
	return t.issues.length ? (e.value = n.catchValue({
		...t,
		value: e.value,
		error: { issues: t.issues.map((e) => ze(e, r, lt())) },
		input: e.value
	}), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
var ii = /*@__PURE__*/ b("$ZodCatch", (e, t) => {
	x.init(e, t), y(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), y(e, "optout", (e) => e.def.innerType._zod.optout), y(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run({
			value: e.value,
			issues: []
		}, n);
		return r instanceof Promise ? r.then((r) => ri(e, r, t, n)) : ri(e, r, t, n);
	};
}), ai = /*@__PURE__*/ b("$ZodPipe", (e, t) => {
	x.init(e, t), y(e, "values", (e) => e.def.in._zod.values), y(e, "optin", (e) => e.def.in._zod.optin), y(e, "optout", (e) => e.def.out._zod.optout), y(e, "propValues", (e) => e.def.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => oi(e, t.in, n)) : oi(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => oi(e, t.out, n)) : oi(r, t.out, n);
	};
});
function oi(e, t, n) {
	return e.issues.some((e) => e.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues
	}, n);
}
var si = /*@__PURE__*/ b("$ZodReadonly", (e, t) => {
	x.init(e, t), y(e, "propValues", (e) => e.def.innerType._zod.propValues), y(e, "values", (e) => e.def.innerType._zod.values), y(e, "optin", (e) => e.def.innerType?._zod?.optin), y(e, "optout", (e) => e.def.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(ci) : ci(r);
	};
});
function ci(e) {
	return e.memo || (e.value = Object.freeze(e.value)), e;
}
var li = /*@__PURE__*/ b("$ZodCustom", (e, t) => {
	yn.init(e, t), x.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => ui(t, n, r, e));
		ui(i, n, r, e);
	};
});
function ui(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(Ue(e));
	}
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/memoizer.js
var di = class extends Error {
	constructor() {
		super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
	}
}, fi = "~memo", pi = [];
function mi(e) {
	return typeof e == "object" && !!e;
}
function hi(e) {
	return e.map((e) => e.path ? {
		...e,
		path: e.path.slice()
	} : { ...e });
}
var gi = /*@__PURE__*/ new WeakMap(), _i = 0, vi = 1, yi = 2;
function bi(e, t, n) {
	let r = gi.get(e);
	if (r !== void 0) return r ? yi : _i;
	if (t.has(e)) return yi;
	t.add(e);
	let i = _i, a = (e) => {
		if (i !== yi && e?._zod) {
			let r = bi(e, t, n);
			r > i && (i = r);
		}
	}, o = (e, r) => {
		let i = _i;
		for (let a of Reflect.ownKeys(e)) {
			let o = Object.getOwnPropertyDescriptor(e, a);
			if (r && !o.enumerable) continue;
			let s = o.get ? vi : o.value?._zod ? bi(o.value, t, n) : _i;
			s > i && (i = s);
		}
		return i;
	}, s = (e) => {
		e > i && (i = e);
	}, c = e._zod.def;
	switch (c.type) {
		case "object": {
			let e = oe(c);
			s(e ? o(e, !0) : vi), a(c.catchall);
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
			s(r ? bi(r, t, !1) : vi);
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
	return t !== vi && gi.set(e, t === yi), t;
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
				if (n.direction !== "backward" && Di(n, e.value)) throw new di();
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
					if (i === _i) return e._zod.parse = t, e._zod.run === o && (e._zod.run = t), t(s, c);
					i === yi || r ? n = !0 : r = !0;
				}
				let l = s.value;
				if (!mi(l)) return t(s, c);
				let u = c[fi];
				u || (u = {
					buckets: /* @__PURE__ */ new WeakMap(),
					backEdges: void 0
				}, c[fi] = u);
				let d;
				i === c ? d = a : (d = Si(u, e), i = c, a = d);
				let f = d.get(l);
				if (f) return s.value = f.value, f.issues ? f.issues.length && s.issues.push(...hi(f.issues)) : (s.memo = !0, u.backEdges ?? (u.backEdges = /* @__PURE__ */ new WeakSet()), u.backEdges.add(f.value)), s;
				Ci = d;
				let p = wi.length, m = t(s, c);
				Ci = void 0;
				let ee = wi.length > p ? wi.pop() : void 0;
				return m instanceof Promise ? m.then((e) => (ee && (ee.issues = e.issues.length ? hi(e.issues) : pi), e)) : (ee && (ee.issues = m.issues.length ? hi(m.issues) : pi), m);
			};
			e._zod.parse = o, e._zod.run === t && (e._zod.run = o);
		});
	}
};
function Ei() {
	return Ti;
}
function Di(e, t) {
	let n = e[fi]?.backEdges;
	return n !== void 0 && mi(t) && n.has(t);
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
			case "invalid_type": return `Invalid input: expected ${i(e.expected)}, received ${i(He(e.input), e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Invalid input: expected ${xe(e.values[0])}` : `Invalid option: expected one of ${p(e.values, "|")}`;
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
			case "unrecognized_keys": return `Unrecognized key${e.keys.length > 1 ? "s" : ""}: ${p(e.keys, ", ")}`;
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
		..._(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function Ii(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Li(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ri(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		..._(t)
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
		..._(t)
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
		..._(t)
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
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Hi(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ui(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Wi(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Gi(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ki(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function qi(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ji(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Yi(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Xi(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Zi(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Qi(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function $i(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ea(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ta(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function na(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ra(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		..._(t)
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
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function aa(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function oa(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function sa(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ca(e, t) {
	return new e(Pi({
		type: "number",
		checks: [],
		..._(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function la(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ua(e, t) {
	return new e({
		type: "boolean",
		..._(t)
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
		..._(t)
	});
}
// @__NO_SIDE_EFFECTS__
function pa(e, t) {
	return new Sn({
		check: "less_than",
		..._(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function ma(e, t) {
	return new Sn({
		check: "less_than",
		..._(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function ha(e, t) {
	return new Cn({
		check: "greater_than",
		..._(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function ga(e, t) {
	return new Cn({
		check: "greater_than",
		..._(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function _a(e, t) {
	return new wn({
		check: "multiple_of",
		..._(t),
		value: e
	});
}
// @__NO_SIDE_EFFECTS__
function va(e, t) {
	return new En({
		check: "max_length",
		..._(t),
		maximum: e
	});
}
// @__NO_SIDE_EFFECTS__
function ya(e, t) {
	return new Dn({
		check: "min_length",
		..._(t),
		minimum: e
	});
}
// @__NO_SIDE_EFFECTS__
function ba(e, t) {
	return new On({
		check: "length_equals",
		..._(t),
		length: e
	});
}
// @__NO_SIDE_EFFECTS__
function xa(e, t) {
	return new An({
		check: "string_format",
		format: "regex",
		..._(t),
		pattern: e
	});
}
// @__NO_SIDE_EFFECTS__
function Sa(e) {
	return new jn({
		check: "string_format",
		format: "lowercase",
		..._(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Ca(e) {
	return new Mn({
		check: "string_format",
		format: "uppercase",
		..._(e)
	});
}
// @__NO_SIDE_EFFECTS__
function wa(e, t) {
	return new Nn({
		check: "string_format",
		format: "includes",
		..._(t),
		includes: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ta(e, t) {
	return new Pn({
		check: "string_format",
		format: "starts_with",
		..._(t),
		prefix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ea(e, t) {
	return new Fn({
		check: "string_format",
		format: "ends_with",
		..._(t),
		suffix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Da(e) {
	return new In({
		check: "overwrite",
		tx: e
	});
}
// @__NO_SIDE_EFFECTS__
function Oa(e) {
	return /* @__PURE__ */ Da((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function ka() {
	return /* @__PURE__ */ Da((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Aa() {
	return /* @__PURE__ */ Da((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function ja() {
	return /* @__PURE__ */ Da((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function Ma() {
	return /* @__PURE__ */ Da((e) => fe(e));
}
// @__NO_SIDE_EFFECTS__
function Na(e, t, n) {
	return new e({
		type: "array",
		element: t,
		..._(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Pa(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		..._(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Fa(e, t) {
	let n = /* @__PURE__ */ Ia((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(Ue(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", "input" in r || (r.input = t.value), r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(Ue(r));
		}
	}, e(t.value, t)), t);
	return n;
}
// @__NO_SIDE_EFFECTS__
function Ia(e, t) {
	let n = new yn({
		check: "custom",
		..._(t)
	});
	return n._zod.check = e, n;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/to-json-schema.js
function La(e, ...t) {
	for (let n of t) for (let t of Reflect.ownKeys(n)) Object.prototype.propertyIsEnumerable.call(n, t) && ae(e, t, n[t]);
	return e;
}
function Ra(e) {
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
function za(e, t, n, r, i) {
	let a = typeof t.unrepresentable == "function" ? t.unrepresentable({
		zodSchema: e,
		path: r.path,
		message: i
	}) : t.unrepresentable;
	if (a === "any") return !1;
	if (a === void 0 || a === "throw") throw Error(i);
	return Object.assign(n, a), !0;
}
function C(e, t, n = {
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
		a && (o.ref ||= a, C(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && La(o.schema, c), t.io === "input" && Ya(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function Ba(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function Va(e, t) {
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
				ref: `${i("__shared")}#/${r}/${Ba(a)}`
			};
		}
		let i = `#/${r}/`;
		if (t[1] === n && !t[1].schema.id) return { ref: "#" };
		let a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + Ba(a)
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
function Ha(e) {
	let t = e.anyOf;
	if (!Array.isArray(t) || t.length === 0 || e.type !== void 0) return;
	let n = [];
	for (let e of t) {
		if (!e || typeof e != "object") return;
		Ha(e);
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
var Ua = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]), Wa = ["oneOf", "anyOf"];
function Ga(e) {
	let t = e.additionalProperties;
	return t === void 0 || t === !1 || typeof t != "object" || !t ? null : Object.keys(t).length ? t : null;
}
function Ka(e) {
	let t = [];
	for (let n of e) {
		if (typeof n != "object" || n.type !== "object") return null;
		for (let e in n) if (!Ua.has(e)) return null;
		t.push(n);
	}
	let n = {}, r = /* @__PURE__ */ new Set();
	for (let e of t) {
		for (let r in e.properties) {
			if (Object.prototype.hasOwnProperty.call(n, r)) continue;
			let e = [];
			for (let n of t) {
				let t = n.properties?.[r] ?? Ga(n);
				t != null && (e.some((e) => JSON.stringify(e) === JSON.stringify(t)) || e.push(t));
			}
			ae(n, r, e.length === 1 ? e[0] : Ka(e) ?? { allOf: e });
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
			let t = Ga(n);
			t && !e.some((e) => JSON.stringify(e) === JSON.stringify(t)) && e.push(t);
		}
		e.length === 1 ? i.additionalProperties = e[0] : e.length > 1 && (i.additionalProperties = { allOf: e });
	}
	return i;
}
function qa(e) {
	let t = e.allOf;
	if (!Array.isArray(t) || t.length < 2) return;
	for (let t of Ua) if (t in e) return;
	let n = t.filter((e) => Wa.some((t) => Array.isArray(e[t]))), r = null;
	if (!n.length) r = Ka(t);
	else {
		let e = n[0], i = Wa.find((t) => Array.isArray(e[t]));
		if (Object.keys(e).length !== 1) return;
		let a = t.filter((t) => t !== e), o = e[i].map((e) => Ka([...a, e]));
		if (o.some((e) => !e)) return;
		r = { [i]: o };
	}
	r && (delete e.allOf, La(e, r));
}
function Ja(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : La(i, s), La(i, a), t._zod.parent === o) for (let e in i) e !== "$ref" && e !== "allOf" && (e in a || delete i[e]);
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
		if (e.target !== "openapi-3.0") for (let t of e.seen.entries()) Ha(t[1].def ?? t[1].schema);
		for (let t of e.deferred) t();
		if (e.intersections.length) {
			let t = /* @__PURE__ */ new Map();
			for (let n of e.seen.values()) for (let e of [n.schema, n.def]) {
				let n = e?.allOf;
				if (!Array.isArray(n)) continue;
				let r = t.get(n);
				r ? r.push(e) : t.set(n, [e]);
			}
			for (let n of e.intersections) for (let e of t.get(n) ?? []) qa(e);
		}
	}
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	La(i, n.defId ? n.schema : n.def ?? n.schema);
	let a = e.metadataRegistry.get(t)?.id;
	a !== void 0 && i.id === a && delete i.id;
	let o = e.external?.defs ?? {};
	if (!e.external || e.sharedEmitDoneFor !== e.external) for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (e.def.id === e.defId && delete e.def.id, ae(o, e.defId, e.def));
	}
	e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(o).length > 0 && (e.target === "draft-2020-12" ? i.$defs = o : i.definitions = o);
	try {
		let n = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: Za(t, "input", e.processors),
					output: Za(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function Ya(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return Ya(r.element, n);
	if (r.type === "set") return Ya(r.valueType, n);
	if (r.type === "lazy") return Ya(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch") return Ya(r.innerType, n);
	if (r.type === "intersection") return Ya(r.left, n) || Ya(r.right, n);
	if (r.type === "record" || r.type === "map") return Ya(r.keyType, n) || Ya(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : Ya(r.in, n) || Ya(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (Ya(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (Ya(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (Ya(e, n)) return !0;
		return !!(r.rest && Ya(r.rest, n));
	}
	return !1;
}
var Xa = (e, t = {}) => (n) => {
	let r = Ra({
		...n,
		processors: t
	});
	return C(e, r), Va(r, e), Ja(r, e);
}, Za = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = Ra({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return C(e, o), Va(o, e), Ja(o, e);
}, Qa = (e, t, n) => {
	(e[t] === void 0 || n > e[t]) && (e[t] = n);
}, $a = (e, t, n) => {
	(e[t] === void 0 || n < e[t]) && (e[t] = n);
}, eo = (e, t) => {
	Qa(e, "minimum", t), $a(e, "maximum", t);
}, to = (e, t) => {
	e.multipleOf ??= [], e.multipleOf.includes(t) || e.multipleOf.push(t);
}, no = (e, t) => {
	e.patterns ??= /* @__PURE__ */ new Set(), e.patterns.add(t);
}, ro = (e, t) => {
	e.mime = e.mime ? e.mime.filter((e) => t.includes(e)) : [...t];
}, io = (e, t) => {
	e.format = t, t.includes("int") && (e.isInt = !0);
}, ao = (e, t) => Qa(e, "minimum", t.minimum), oo = (e, t) => $a(e, "maximum", t.maximum), so = (e) => (t, n) => {
	io(t, n.format);
	let [r, i] = e[n.format];
	Qa(t, "minimum", r), $a(t, "maximum", i);
}, co = {
	greater_than: (e, t) => Qa(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
	less_than: (e, t) => $a(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
	multiple_of: (e, t) => to(e, t.value),
	number_format: so(Ce),
	bigint_format: so(we),
	min_length: ao,
	max_length: oo,
	length_equals: (e, t) => eo(e, t.length),
	min_size: ao,
	max_size: oo,
	size_equals: (e, t) => eo(e, t.size),
	string_format: (e, t) => {
		io(e, t.format), t.pattern && no(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
	},
	mime_type: (e, t) => ro(e, t.mime)
};
function lo(e) {
	let t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
	for (let e of r) co[e._zod.def.check]?.(t, e._zod.def);
	let i = e._zod.bag;
	i.minimum !== void 0 && Qa(t, "minimum", i.minimum), i.exclusiveMinimum !== void 0 && Qa(t, "exclusiveMinimum", i.exclusiveMinimum), i.maximum !== void 0 && $a(t, "maximum", i.maximum), i.exclusiveMaximum !== void 0 && $a(t, "exclusiveMaximum", i.exclusiveMaximum), i.multipleOf !== void 0 && to(t, i.multipleOf), i.format !== void 0 && (t.format ??= i.format, i.format.includes("int") && (t.isInt = !0)), i.mime && ro(t, i.mime);
	for (let e of i.patterns ?? []) no(t, e);
	return t;
}
var uo = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, fo = /* @__PURE__ */ new Map([[yr, nn], [xr, rn]]), po = (e) => fo.get(e) ?? e, mo = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l, laxFormat: u } = lo(e);
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = uo[s] ?? s, i.format === "" && delete i.format, (s === "time" || u) && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c].map(po);
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, ho = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, multipleOf: s, exclusiveMaximum: c, exclusiveMinimum: l, isInt: u } = lo(e);
	i.type = u ? "integer" : "number";
	let d = typeof l == "number" && l >= (a ?? -Infinity), f = typeof c == "number" && c <= (o ?? Infinity), p = t.target === "draft-04" || t.target === "openapi-3.0";
	if (d ? p ? (i.minimum = l, i.exclusiveMinimum = !0) : i.exclusiveMinimum = l : typeof a == "number" && (i.minimum = a), f ? p ? (i.maximum = c, i.exclusiveMaximum = !0) : i.exclusiveMaximum = c : typeof o == "number" && (i.maximum = o), s) {
		let n = /* @__PURE__ */ new Set();
		for (let a of s) Number.isFinite(a) && a !== 0 ? n.add(Math.abs(a)) : za(e, t, i, r, `A multipleOf divisor of ${a} cannot be represented in JSON Schema`);
		let [a, ...o] = n;
		a !== void 0 && (i.multipleOf = a), o.length && (i.allOf = [...i.allOf ?? [], ...o.map((e) => ({ multipleOf: e }))]);
	}
}, go = (e, t, n, r) => {
	n.type = "boolean";
}, _o = (e, t, n, r) => {
	n.not = {};
}, vo = (e, t, n, r) => {
	let i = e._zod.def, a = f(i.entries);
	if (a.length === 0) {
		n.not = {};
		return;
	}
	a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a;
}, yo = (e, t, n, r) => {
	za(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, bo = (e, t, n, r) => {
	za(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, xo = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = lo(e);
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = C(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
};
function So(e) {
	let t = e._zod.def;
	return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? So(t.out) : t.type === "catch" ? So(t.innerType) : e._zod.optin;
}
var Co = (e, t, n, r) => {
	let i = n, a = e._zod.def, o = a.shape;
	if (Object.getOwnPropertySymbols(o).length && za(e, t, i, r, "Symbol keys cannot be represented in JSON Schema")) return;
	i.type = "object", i.properties = {};
	for (let e in o) ae(i.properties, e, C(o[e], t, {
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
		(t.io === "input" ? So(n) === void 0 : n._zod.optout === void 0) && s.push(e);
	}
	s.length > 0 && (i.required = s), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = C(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, wo = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => C(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, To = (e, t, n, r) => {
	let i = e._zod.def, a = C(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = C(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1, c = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
	n.allOf = c, t.intersections.push(c);
};
function Eo(e, t, n) {
	if (t.$ref) {
		if (n.has(t)) return t;
		n.add(t);
		let r = e.get(t)?.def;
		if (!r) return t;
		let i = Eo(e, r, n);
		return i === r ? t : i;
	}
	for (let r of ["anyOf", "oneOf"]) {
		let i = t[r];
		if (!Array.isArray(i)) continue;
		let a = i.map((t) => Eo(e, t, n));
		a.some((e, t) => e !== i[t]) && (t = {
			...t,
			[r]: a
		});
	}
	let r = Array.isArray(t.type) ? t.type : [t.type], i = !r.includes("string") && r.some((e) => e === "number" || e === "integer"), a = t.enum ?? (t.const === void 0 ? void 0 : [t.const]);
	if (!i && !a?.some((e) => typeof e == "number")) return t;
	let { minimum: o, maximum: s, exclusiveMinimum: c, exclusiveMaximum: l, multipleOf: u, format: d, id: f, ...p } = t;
	return p.enum ? p.enum = p.enum.map((e) => typeof e == "number" ? String(e) : e) : typeof p.const == "number" && (p.const = String(p.const)), i ? (p.type = "string", a || (p.pattern = (r.includes("number") ? hn : mn).source), p) : p;
}
var Do = /* @__PURE__ */ new WeakMap();
function Oo(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.seen.values()) n.def && !t.has(n.schema) && t.set(n.schema, n);
	let n = /* @__PURE__ */ new Map();
	for (let r of Do.get(e) ?? []) {
		let i = e.seen.get(r), a = (i?.def ?? i?.schema)?.propertyNames;
		if (!a || a === !0 || n.has(a)) continue;
		let o = Eo(t, a, /* @__PURE__ */ new Set());
		o !== a && n.set(a, o);
	}
	if (n.size) for (let t of e.seen.values()) for (let e of [t.schema, t.def]) {
		let t = e && n.get(e.propertyNames);
		t && (e.propertyNames = t);
	}
}
var ko = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object";
	let o = a.keyType, s = lo(o).patterns;
	if (a.mode === "loose" && s && s.size > 0) {
		let e = C(a.valueType, t, {
			...r,
			path: [
				...r.path,
				"patternProperties",
				"*"
			]
		});
		i.patternProperties = {};
		for (let t of s) ae(i.patternProperties, po(t).source, e);
	} else {
		if (t.target === "draft-07" || t.target === "draft-2020-12") {
			i.propertyNames = C(a.keyType, t, {
				...r,
				path: [...r.path, "propertyNames"]
			});
			let n = Do.get(t);
			n || (n = [], Do.set(t, n), t.deferred.push(() => Oo(t))), n.push(e);
		}
		i.additionalProperties = C(a.valueType, t, {
			...r,
			path: [...r.path, "additionalProperties"]
		});
	}
	let c = o._zod.values, l = t.io === "input" && So(a.valueType) !== void 0;
	if (c && !a.partial && !l) {
		let e = [...c].filter((e) => typeof e == "string" || typeof e == "number");
		e.length > 0 && (i.required = e.map(String));
	}
}, Ao = (e, t, n, r) => {
	let i = e._zod.def, a = C(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, jo = (e, t, n, r) => {
	let i = e._zod.def;
	C(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Mo = Symbol();
function No(e, t, n, r, i) {
	let a = !1, o = JSON.stringify(e, (e, t) => typeof t == "bigint" ? (a = !0, null) : t);
	return a ? (za(t, n, r, i, "BigInt defaults cannot be represented in JSON Schema"), Mo) : JSON.parse(o);
}
var Po = (e, t, n, r) => {
	let i = e._zod.def;
	C(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o = No(i.defaultValue, e, t, n, r);
	o !== Mo && (n.default = o);
}, Fo = (e, t, n, r) => {
	let i = e._zod.def;
	C(i.innerType, t, r);
	let a = t.seen.get(e);
	if (a.ref = i.innerType, t.io !== "input") return;
	let o = No(i.defaultValue, e, t, n, r);
	o !== Mo && (n._prefault = o);
}, Io = (e, t, n, r) => {
	let i = e._zod.def;
	C(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		za(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	n.default = o;
}, Lo = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	C(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, Ro = (e, t, n, r) => {
	let i = e._zod.def;
	C(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, zo = (e, t, n, r) => {
	let i = e._zod.def;
	C(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Bo = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function Vo(e, t, n) {
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
var Ho = /*@__PURE__*/ b("ZodError", (e, t) => {
	gt.init(e, t), e.name = "ZodError";
	let n = Object.getPrototypeOf(e);
	Bo.has(n) || (Bo.add(n), Vo(n, "format", (e) => (t) => yt(e, t)), Vo(n, "flatten", (e) => (t) => vt(e, t)), Vo(n, "addIssue", (e) => (t) => {
		e.issues.push(t), e.message = JSON.stringify(e.issues, m, 2);
	}), Vo(n, "addIssues", (e) => (t) => {
		e.issues.push(...t), e.message = JSON.stringify(e.issues, m, 2);
	}), Object.defineProperty(n, "isEmpty", {
		configurable: !0,
		enumerable: !1,
		get() {
			return this.issues.length === 0;
		}
	}));
}, void 0, { Parent: Error }), Uo = /* @__PURE__ */ xt(Ho), Wo = /* @__PURE__ */ St(Ho), Go = /* @__PURE__ */ Ct(Ho), Ko = /* @__PURE__ */ Tt(Ho), qo = /* @__PURE__ */ jt(Ho), Jo = /* @__PURE__ */ Mt(Ho), Yo = /* @__PURE__ */ Nt(Ho), Xo = /* @__PURE__ */ Pt(Ho), Zo = /* @__PURE__ */ Ft(Ho), Qo = /* @__PURE__ */ It(Ho), $o = /* @__PURE__ */ Lt(Ho), es = /* @__PURE__ */ Rt(Ho);
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/schemas.js
function ts() {
	ct.localeError || lt(ki());
}
function ns() {
	ct.memoizer || lt({ memoizer: Ei() });
}
var w = /*@__PURE__*/ b("ZodType", (e, t) => (ts(), x.init(e, t), e.def = t, e.type = t.type, e), {
	check(...e) {
		let t = this.def;
		return this.clone(de(t, { checks: [...t.checks ?? [], ...e.map((e) => typeof e == "function" ? { _zod: {
			check: e,
			def: { check: "custom" },
			onattach: []
		} } : e)] }), { parent: !0 });
	},
	with(...e) {
		return this.check(...e);
	},
	clone(e, t) {
		return be(this, e, t);
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
		return this.check(/* @__PURE__ */ Da(e));
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
		return D(this);
	},
	or(e) {
		return Vs([this, e]);
	},
	and(e) {
		return Us(this, e);
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
		return Ke(this, "~standard", {
			...Vn(this),
			jsonSchema: {
				input: Za(this, "input"),
				output: Za(this, "output")
			}
		});
	},
	set "~standard"(e) {
		Ge(this, "~standard", e);
	},
	parse: function e(t, n) {
		return Uo(this, t, n, { callee: e });
	},
	parseAsync: async function e(t, n) {
		return await Wo(this, t, n, { callee: e });
	},
	safeParse(e, t) {
		return Go(this, e, t);
	},
	async safeParseAsync(e, t) {
		return Ko(this, e, t);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(e) {
		Ge(this, "spa", e);
	},
	validate(e, t) {
		return Ot(this, e, t);
	},
	validateAsync(e, t) {
		return At(this, e, t);
	},
	encode: function e(t, n) {
		return qo(this, t, n, { callee: e });
	},
	decode: function e(t, n) {
		return Jo(this, t, n, { callee: e });
	},
	encodeAsync: async function e(t, n) {
		return await Yo(this, t, n, { callee: e });
	},
	decodeAsync: async function e(t, n) {
		return await Xo(this, t, n, { callee: e });
	},
	safeEncode(e, t) {
		return Zo(this, e, t);
	},
	safeDecode(e, t) {
		return Qo(this, e, t);
	},
	async safeEncodeAsync(e, t) {
		return $o(this, e, t);
	},
	async safeDecodeAsync(e, t) {
		return es(this, e, t);
	},
	toJSONSchema(e) {
		return Xa(this, {})(e);
	},
	get description() {
		return Ni.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
}), rs = /*@__PURE__*/ b("_ZodString", (e, t) => {
	Hn.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => mo(e, t, n, r);
}, /*@__PURE__*/ qe({
	format: (e) => lo(e).format ?? null,
	minLength: (e) => lo(e).minimum ?? null,
	maxLength: (e) => lo(e).maximum ?? null
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
		return this.check(/* @__PURE__ */ ka());
	},
	normalize(...e) {
		return this.check(/* @__PURE__ */ Oa(...e));
	},
	toLowerCase() {
		return this.check(/* @__PURE__ */ Aa());
	},
	toUpperCase() {
		return this.check(/* @__PURE__ */ ja());
	},
	slugify() {
		return this.check(/* @__PURE__ */ Ma());
	}
})), is = /*@__PURE__*/ b("ZodString", (e, t) => {
	Hn.init(e, t), rs.init(e, t);
}, {
	email(e) {
		return this.check(/* @__PURE__ */ Ii(ls, e));
	},
	url(e) {
		return this.check(/* @__PURE__ */ Hi(fs, e));
	},
	jwt(e) {
		return this.check(/* @__PURE__ */ ra(Ds, e));
	},
	emoji(e) {
		return this.check(/* @__PURE__ */ Ui(ps, e));
	},
	guid(e) {
		return this.check(/* @__PURE__ */ Li(us, e));
	},
	uuid(e) {
		return this.check(/* @__PURE__ */ Ri(ds, e));
	},
	uuidv4(e) {
		return this.check(/* @__PURE__ */ zi(ds, e));
	},
	uuidv6(e) {
		return this.check(/* @__PURE__ */ Bi(ds, e));
	},
	uuidv7(e) {
		return this.check(/* @__PURE__ */ Vi(ds, e));
	},
	nanoid(e) {
		return this.check(/* @__PURE__ */ Wi(ms, e));
	},
	cuid(e) {
		return this.check(/* @__PURE__ */ Gi(hs, e));
	},
	cuid2(e) {
		return this.check(/* @__PURE__ */ Ki(gs, e));
	},
	ulid(e) {
		return this.check(/* @__PURE__ */ qi(_s, e));
	},
	base64(e) {
		return this.check(/* @__PURE__ */ ea(ws, e));
	},
	base64url(e) {
		return this.check(/* @__PURE__ */ ta(Ts, e));
	},
	xid(e) {
		return this.check(/* @__PURE__ */ Ji(vs, e));
	},
	ksuid(e) {
		return this.check(/* @__PURE__ */ Yi(ys, e));
	},
	ipv4(e) {
		return this.check(/* @__PURE__ */ Xi(bs, e));
	},
	ipv6(e) {
		return this.check(/* @__PURE__ */ Zi(xs, e));
	},
	cidrv4(e) {
		return this.check(/* @__PURE__ */ Qi(Ss, e));
	},
	cidrv6(e) {
		return this.check(/* @__PURE__ */ $i(Cs, e));
	},
	e164(e) {
		return this.check(/* @__PURE__ */ na(Es, e));
	},
	datetime(e) {
		return this.check(/* @__PURE__ */ ia(as, e));
	},
	date(e) {
		return this.check(/* @__PURE__ */ aa(os, e));
	},
	time(e) {
		return this.check(/* @__PURE__ */ oa(ss, e));
	},
	duration(e) {
		return this.check(/* @__PURE__ */ sa(cs, e));
	}
});
function T(e) {
	return /* @__PURE__ */ Fi(is, e);
}
var E = /*@__PURE__*/ b("ZodStringFormat", (e, t) => {
	S.init(e, t), rs.init(e, t);
}), as = /*@__PURE__*/ b("ZodISODateTime", (e, t) => {
	sr.init(e, t), E.init(e, t);
}), os = /*@__PURE__*/ b("ZodISODate", (e, t) => {
	cr.init(e, t), E.init(e, t);
}), ss = /*@__PURE__*/ b("ZodISOTime", (e, t) => {
	lr.init(e, t), E.init(e, t);
}), cs = /*@__PURE__*/ b("ZodISODuration", (e, t) => {
	ur.init(e, t), E.init(e, t);
}), ls = /*@__PURE__*/ b("ZodEmail", (e, t) => {
	Gn.init(e, t), E.init(e, t);
}), us = /*@__PURE__*/ b("ZodGUID", (e, t) => {
	Un.init(e, t), E.init(e, t);
}), ds = /*@__PURE__*/ b("ZodUUID", (e, t) => {
	Wn.init(e, t), E.init(e, t);
}), fs = /*@__PURE__*/ b("ZodURL", (e, t) => {
	$n.init(e, t), E.init(e, t);
}), ps = /*@__PURE__*/ b("ZodEmoji", (e, t) => {
	er.init(e, t), E.init(e, t);
}), ms = /*@__PURE__*/ b("ZodNanoID", (e, t) => {
	tr.init(e, t), E.init(e, t);
}), hs = /*@__PURE__*/ b("ZodCUID", (e, t) => {
	nr.init(e, t), E.init(e, t);
}), gs = /*@__PURE__*/ b("ZodCUID2", (e, t) => {
	rr.init(e, t), E.init(e, t);
}), _s = /*@__PURE__*/ b("ZodULID", (e, t) => {
	ir.init(e, t), E.init(e, t);
}), vs = /*@__PURE__*/ b("ZodXID", (e, t) => {
	ar.init(e, t), E.init(e, t);
}), ys = /*@__PURE__*/ b("ZodKSUID", (e, t) => {
	or.init(e, t), E.init(e, t);
}), bs = /*@__PURE__*/ b("ZodIPv4", (e, t) => {
	dr.init(e, t), E.init(e, t);
}), xs = /*@__PURE__*/ b("ZodIPv6", (e, t) => {
	mr.init(e, t), E.init(e, t);
}), Ss = /*@__PURE__*/ b("ZodCIDRv4", (e, t) => {
	hr.init(e, t), E.init(e, t);
}), Cs = /*@__PURE__*/ b("ZodCIDRv6", (e, t) => {
	_r.init(e, t), E.init(e, t);
}), ws = /*@__PURE__*/ b("ZodBase64", (e, t) => {
	br.init(e, t), E.init(e, t);
}), Ts = /*@__PURE__*/ b("ZodBase64URL", (e, t) => {
	Cr.init(e, t), E.init(e, t);
}), Es = /*@__PURE__*/ b("ZodE164", (e, t) => {
	wr.init(e, t), E.init(e, t);
}), Ds = /*@__PURE__*/ b("ZodJWT", (e, t) => {
	Er.init(e, t), E.init(e, t);
}), Os = /*@__PURE__*/ b("ZodNumber", (e, t) => {
	Dr.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => ho(e, t, n, r), e.isFinite = !0;
}, /*@__PURE__*/ qe({
	minValue: (e) => {
		let { minimum: t, exclusiveMinimum: n } = lo(e);
		return Math.max(t ?? -Infinity, n ?? -Infinity);
	},
	maxValue: (e) => {
		let { maximum: t, exclusiveMaximum: n } = lo(e);
		return Math.min(t ?? Infinity, n ?? Infinity);
	},
	isInt: (e) => {
		let { isInt: t, multipleOf: n } = lo(e);
		return !!t || !!n?.some(Number.isSafeInteger);
	},
	format: (e) => lo(e).format ?? null
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
		return this.check(js(e));
	},
	safe(e) {
		return this.check(js(e));
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
function ks(e) {
	return /* @__PURE__ */ ca(Os, e);
}
var As = /*@__PURE__*/ b("ZodNumberFormat", (e, t) => {
	Or.init(e, t), Os.init(e, t);
});
function js(e) {
	return /* @__PURE__ */ la(As, e);
}
var Ms = /*@__PURE__*/ b("ZodBoolean", (e, t) => {
	kr.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => go(e, t, n, r);
});
function Ns(e) {
	return /* @__PURE__ */ ua(Ms, e);
}
var Ps = /*@__PURE__*/ b("ZodUnknown", (e, t) => {
	Ar.init(e, t), w.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function Fs() {
	return /* @__PURE__ */ da(Ps);
}
var Is = /*@__PURE__*/ b("ZodNever", (e, t) => {
	jr.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => _o(e, t, n, r);
});
function Ls(e) {
	return /* @__PURE__ */ fa(Is, e);
}
var Rs = /*@__PURE__*/ b("ZodArray", (e, t) => {
	ns(), Nr.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => xo(e, t, n, r), e.element = t.element;
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
function D(e, t) {
	return /* @__PURE__ */ Na(Rs, e, t);
}
var zs = /*@__PURE__*/ b("ZodObject", (e, t) => {
	ns(), zr.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => Co(e, t, n, r), $e(e, "shape", (e) => e._zod.def.shape, !1);
}, {
	keyof() {
		return qs(Object.keys(this._zod.def.shape));
	},
	catchall(e) {
		return this.clone(de(this._zod.def, { catchall: e }));
	},
	passthrough() {
		return this.clone(de(this._zod.def, { catchall: Fs() }));
	},
	loose() {
		return this.clone(de(this._zod.def, { catchall: Fs() }));
	},
	strict() {
		return this.clone(de(this._zod.def, { catchall: Ls() }));
	},
	strip() {
		return this.clone(de(this._zod.def, { catchall: void 0 }));
	},
	extend(e) {
		return Oe(this, e);
	},
	safeExtend(e) {
		return Ae(this, e);
	},
	merge(e) {
		return je(this, e);
	},
	pick(e) {
		return Te(this, e);
	},
	omit(e) {
		return De(this, e);
	},
	partial(...e) {
		return Me(Xs, this, e[0]);
	},
	exactPartial(...e) {
		return Me(Qs, this, e[0], "exactPartial");
	},
	required(...e) {
		return Ne(oc, this, e[0]);
	}
});
function O(e, t) {
	return new zs({
		type: "object",
		shape: e ?? {},
		..._(t)
	});
}
var Bs = /*@__PURE__*/ b("ZodUnion", (e, t) => {
	Vr.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => wo(e, t, n, r), e.options = t.options;
});
function Vs(e, t) {
	return new Bs({
		type: "union",
		options: e,
		..._(t)
	});
}
var Hs = /*@__PURE__*/ b("ZodIntersection", (e, t) => {
	Hr.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => To(e, t, n, r);
});
function Us(e, t) {
	return new Hs({
		type: "intersection",
		left: e,
		right: t
	});
}
var Ws = /*@__PURE__*/ b("ZodRecord", (e, t) => {
	ns(), Gr.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => ko(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function Gs(e, t, n) {
	return !t || !t._zod ? new Ws({
		type: "record",
		keyType: T(),
		valueType: e,
		..._(t)
	}) : new Ws({
		type: "record",
		keyType: e,
		valueType: t,
		..._(n)
	});
}
var Ks = /*@__PURE__*/ b("ZodEnum", (e, t) => {
	Kr.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => vo(e, t, n, r), e.enum = t.entries, e.options = [...e._zod.values];
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new Ks({
			...t,
			checks: [],
			..._(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new Ks({
			...t,
			checks: [],
			..._(r),
			entries: i
		});
	};
});
function qs(e, t) {
	return new Ks({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		..._(t)
	});
}
var Js = /*@__PURE__*/ b("ZodTransform", (e, t) => {
	ns(), qr.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => bo(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new st(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(Ue(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", "input" in t || (t.input = n.value), t.inst ??= e, n.issues.push(Ue(t));
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
var Xs = /*@__PURE__*/ b("ZodOptional", (e, t) => {
	Yr.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => zo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Zs(e) {
	return new Xs({
		type: "optional",
		innerType: e
	});
}
var Qs = /*@__PURE__*/ b("ZodExactOptional", (e, t) => {
	Xr.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => zo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function $s(e) {
	return new Qs({
		type: "optional",
		innerType: e
	});
}
var ec = /*@__PURE__*/ b("ZodNullable", (e, t) => {
	Zr.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ao(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function tc(e) {
	return new ec({
		type: "nullable",
		innerType: e
	});
}
var nc = /*@__PURE__*/ b("ZodDefault", (e, t) => {
	Qr.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => Po(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function rc(e, t) {
	return new nc({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : _e(t);
		}
	});
}
var ic = /*@__PURE__*/ b("ZodPrefault", (e, t) => {
	ei.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => Fo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function ac(e, t) {
	return new ic({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : _e(t);
		}
	});
}
var oc = /*@__PURE__*/ b("ZodNonOptional", (e, t) => {
	ti.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => jo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function sc(e, t) {
	return new oc({
		type: "nonoptional",
		innerType: e,
		..._(t)
	});
}
var cc = /*@__PURE__*/ b("ZodCatch", (e, t) => {
	ii.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => Io(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function lc(e, t) {
	return new cc({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : tt(t)
	});
}
var uc = /*@__PURE__*/ b("ZodPipe", (e, t) => {
	ai.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => Lo(e, t, n, r), e.in = t.in, e.out = t.out;
});
function dc(e, t) {
	return new uc({
		type: "pipe",
		in: e,
		out: t
	});
}
var fc = /*@__PURE__*/ b("ZodReadonly", (e, t) => {
	si.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ro(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function pc(e) {
	return new fc({
		type: "readonly",
		innerType: e
	});
}
var mc = /*@__PURE__*/ b("ZodCustom", (e, t) => {
	li.init(e, t), w.init(e, t), e._zod.processJSONSchema = (t, n, r) => yo(e, t, n, r);
});
function hc(e, t = {}) {
	return /* @__PURE__ */ Pa(mc, e, t);
}
function gc(e, t) {
	return /* @__PURE__ */ Fa(e, t);
}
d();
var _c = null, vc = {
	connect(e) {
		return _c = e, () => {
			_c === e && (_c = null);
		};
	},
	disconnect() {
		_c = null;
	},
	current() {
		return _c?.() ?? null;
	},
	require(e) {
		return i(this.current(), e);
	}
}, yc = [{
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
}], bc = [{
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
function xc() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function Sc(e, t) {
	let n = xc();
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
function Cc(e, t) {
	let n = xc();
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
function wc(e) {
	let t = xc();
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
var Tc = "htt:financial-snapshot:v1", Ec = (e) => !!e && typeof e == "object" && !Array.isArray(e), Dc = (e) => new Set(e.map((e) => e.id)).size === e.length, Oc = (e) => {
	if (!Ec(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => Ec(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => Ec(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => Ec(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => Ec(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
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
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => Ec(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && Ec(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && Ec(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && Ec(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && Dc(t) && Dc(n) && Dc(r) && Dc(i);
}, kc = () => ({
	purchaseOrders: structuredClone(yc),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone(bc),
	transactions: [],
	transfers: [],
	journals: []
}), Ac, jc = !1;
function Mc() {
	return typeof window < "u" && !!window.localStorage;
}
function Nc() {
	if (Ac) return Ac;
	if (!Mc()) return kc();
	let e = Sc(Tc, Oc);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return jc = e.status === "ok", Ac = e.status === "ok" ? {
		...kc(),
		...e.data
	} : kc(), Ac;
}
var Pc = /* @__PURE__ */ new Set(), Fc = 0, Ic = /* @__PURE__ */ new Set();
function Lc(e) {
	if (Mc() && !Cc(Tc, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var k = {
	wasRestoredOnLoad() {
		return Nc(), jc;
	},
	onRollback(e) {
		Pc.add(e);
	},
	notify(e) {
		Fc ? Ic.add(e) : e();
	},
	transaction(e) {
		if (Fc) return e();
		let t = structuredClone(Nc());
		Ac = structuredClone(t), Fc++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			Lc(Nc());
		} catch (e) {
			throw Ac = t, Pc.forEach((e) => e()), Ic.clear(), e;
		} finally {
			Fc--;
		}
		let r = [...Ic];
		return Ic.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(Nc());
	},
	update(e, t) {
		let n = {
			...Nc(),
			[e]: structuredClone(t)
		};
		if (!Oc(n)) throw Error("Invalid financial snapshot; write blocked.");
		Fc || Lc(n), Ac = n;
	},
	resetCacheForTests() {
		Ac = void 0, jc = !1;
	}
};
r("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => k.read(),
	restore: (e) => {
		Ac = e;
	},
	publish: () => {}
});
//#endregion
//#region src/lib/persistence/financialOperationJournal.ts
var Rc = "htt:financial-operations:v1", zc = [
	"CUSTOMER_PAYMENT",
	"PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
], Bc = [
	"PENDING",
	"COMPLETED",
	"MANUAL_REVIEW"
], Vc = (e) => Array.isArray(e) && e.every((e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.operationId == "string" && t.operationId.length > 0 && zc.includes(String(t.kind)) && typeof t.fingerprint == "string" && t.fingerprint.length > 0 && Bc.includes(String(t.state)) && typeof t.createdAt == "string" && typeof t.updatedAt == "string" && (t.resultId === void 0 || typeof t.resultId == "string") && (t.note === void 0 || typeof t.note == "string") && (t.reviewHistory === void 0 || Array.isArray(t.reviewHistory) && t.reviewHistory.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		return typeof t.reference == "string" && t.reference.length >= 3 && typeof t.operator == "string" && t.operator.length >= 2 && typeof t.recordedAt == "string" && typeof t.summary == "string" && t.summary.length >= 3;
	}));
}) && new Set(e.map((e) => e.operationId)).size === e.length;
function Hc() {
	let e = Sc(Rc, Vc);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function Uc(e) {
	if (!wc(Rc) || !Cc(Rc, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var A = {
	list() {
		return Hc().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !zc.includes(t)) throw Error("Invalid operation identity.");
		let r = Hc(), i = r.find((t) => t.operationId === e);
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
		return Uc([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = Hc(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Uc(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = Hc(), r = n.find((t) => t.operationId === e);
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
		return Uc(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = Hc(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Uc(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = Hc(), a = i.find((t) => t.operationId === e);
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
		return Uc(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = Hc(), a = i.find((t) => t.operationId === e);
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
		return Uc(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	getUnresolved() {
		return Hc().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
	}
};
r("financialOperations", {
	repository: A,
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
var Wc = /* @__PURE__ */ new Map(), Gc = "htt.purchasePosting.operations.v1";
function Kc() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function qc() {
	let e = Kc();
	if (e) try {
		e.setItem(Gc, JSON.stringify([...Wc.values()]));
	} catch {}
}
function Jc() {
	let e = Kc();
	if (e) try {
		let t = JSON.parse(e.getItem(Gc) ?? "[]");
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
			Wc.set(t.key, {
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
Jc();
var Yc = /* @__PURE__ */ new Set(), Xc = /* @__PURE__ */ new Map(), Zc = /* @__PURE__ */ new Map(), Qc;
function $c() {
	qc(), Yc.forEach((e) => e());
}
var j = {
	injectFailureBeforeStep(e, t, n = 1) {
		Zc.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		Zc.clear();
	},
	registerRecovery(e, t) {
		if (!Wc.has(e)) throw Error(`Unknown posting operation: ${e}`);
		Xc.set(e, t);
	},
	runStep(e, t, n) {
		let r = Wc.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = Zc.get(i) ?? 0;
		if (a > 0) throw Zc.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return Xc.has(e);
	},
	recover(e) {
		let t = Wc.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = Xc.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (Qc === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		Qc = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			Qc = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = Wc.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...Wc.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return Yc.add(e), () => {
			Yc.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if (Wc.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Wc.set(n, r), $c(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = Wc.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		Wc.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), $c();
	},
	completeStep(e, t) {
		let n = Wc.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (Wc.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), $c());
	}
};
r("purchaseOperations", {
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
		Wc.clear(), Xc.clear();
		for (let t of e) Wc.set(t.key, t);
	},
	publish: () => Yc.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var el = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function tl(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${el.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function M() {
	tl(A.list(), j.getAll());
}
//#endregion
//#region src/features/inventory/data/mockProducts.ts
var nl = [
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
function rl(e) {
	return nl.find((t) => t.id === e);
}
function il(e, t) {
	return rl(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/business-workspace/productRules.ts
function al(e, t, n, r) {
	let i = rl(e), a = il(e, t);
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
//#region src/features/business-workspace/configurationState.ts
var N = {}, ol = (e) => N["linked-accounts"]?.find((t) => t.status === "Active" && t.role === e)?.accountId;
function sl(e = "GST") {
	let t = N["tax-codes"]?.find((t) => t.status === "Active" && t.code === e);
	if (!t) {
		if (!N["tax-codes"] && e === "GST") return .1;
		throw Error(`Active tax code ${e} was not found.`);
	}
	return Number(t.rate) / 100;
}
function cl(e) {
	let t = Date.parse(e.at.length === 10 ? e.at + "T00:00:00Z" : e.at), n = (N.promotions ?? []).filter((n) => n.status === "Active" && n.productId === e.productId && n.unitId === e.unitId && (!n.customerId || n.customerId === e.customerId) && Date.parse(n.starts) <= t && t < Date.parse(n.ends));
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
function ll(e) {
	return (N["linked-accounts"] ?? []).some((t) => t.status === "Active" && t.accountId === e);
}
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var ul = [
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
		currency: "AUD",
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
		currency: "AUD",
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
		currency: "AUD",
		taxRegistered: !0,
		createdAt: "2026-03-05T01:00:00.000Z",
		updatedAt: "2026-03-05T01:00:00.000Z"
	}
], dl = "htt.mock.contacts.suppliers.v1";
function fl(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var pl = Sc(dl, fl), ml = pl.status !== "invalid" && wc(dl), hl = /* @__PURE__ */ new Set(), gl = pl.status === "ok" ? pl.data : structuredClone(ul);
function _l() {
	ml && Cc(dl, gl), hl.forEach((e) => {
		e();
	});
}
function vl(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function yl() {
	let e = gl.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function bl(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function xl(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function Sl(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: bl(e.tradingName),
		abn: xl(e.abn),
		status: e.status,
		email: bl(e.email),
		phone: bl(e.phone),
		website: bl(e.website),
		contactName: bl(e.contactName),
		addressLine1: bl(e.addressLine1),
		addressLine2: bl(e.addressLine2),
		suburb: bl(e.suburb),
		state: bl(e.state),
		postcode: bl(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: bl(e.notes)
	};
}
var Cl = {
	subscribe(e) {
		return hl.add(e), () => {
			hl.delete(e);
		};
	},
	getSnapshot() {
		return gl;
	},
	getAll() {
		return gl;
	},
	getById(e) {
		return gl.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: vl("sup"),
			code: yl(),
			...Sl(e),
			currency: "AUD",
			createdAt: t,
			updatedAt: t
		};
		return gl = [n, ...gl], _l(), n;
	},
	update(e, t) {
		let n = Cl.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...Sl(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return gl = gl.map((t) => t.id === e ? r : t), _l(), r;
	}
};
r("suppliers", {
	repository: Cl,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: gl }),
	restore: (e) => {
		gl = e.suppliers;
	},
	publish: () => hl.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
function wl(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Tl({ orderedQuantity: e, unitCost: t, taxRate: n = sl() }) {
	let r = wl(e * t), i = wl(r * n);
	return {
		lineSubtotal: r,
		taxAmount: i,
		lineTotal: wl(r + i)
	};
}
function El(e) {
	let t = wl(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = wl(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: wl(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var Dl = /* @__PURE__ */ new Set(), P = k.read().purchaseOrders;
k.onRollback(() => {
	P = k.read().purchaseOrders;
});
function Ol() {
	try {
		k.update("purchaseOrders", P);
	} catch (e) {
		throw P = k.read().purchaseOrders, e;
	}
	Dl.forEach((e) => k.notify(e));
}
function kl(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Al(e) {
	return e.slice(0, 4);
}
function jl(e) {
	let t = Al(e), n = RegExp(`^PO-${t}-(\\d+)$`), r = P.map((e) => {
		let t = e.purchaseOrderNumber.match(n);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `PO-${t}-${(Math.max(0, ...r) + 1).toString().padStart(4, "0")}`;
}
function Ml(e) {
	return e?.trim() || void 0;
}
function Nl(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = nl.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let n = t.units.find((t) => t.id === e.unitId);
		if (!n) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!n.active) throw Error(`${n.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		if (al(e.productId, e.unitId, e.orderedQuantity, "buy"), t.buyEnabled === !1) throw Error("Product is not available for purchasing.");
		let r = t.taxCode ?? "GST", i = sl(r), a = Tl({
			taxRate: i,
			orderedQuantity: e.orderedQuantity,
			unitCost: e.unitCost
		});
		return {
			id: kl("pol"),
			taxCode: r,
			taxRate: i,
			productId: t.id,
			unitId: n.id,
			sku: t.sku,
			description: t.name,
			unitSymbol: n.symbol,
			orderedQuantity: e.orderedQuantity,
			receivedQuantity: 0,
			billedQuantity: 0,
			unitCost: e.unitCost,
			...a
		};
	});
}
function Pl(e) {
	let t = Cl.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function Fl(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var Il = {
	subscribe(e) {
		return Dl.add(e), () => {
			Dl.delete(e);
		};
	},
	getSnapshot() {
		return P;
	},
	getAll() {
		return P;
	},
	getById(e) {
		return P.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return P.filter((t) => t.supplierId === e);
	},
	create(e) {
		Fl(e);
		let t = Pl(e.supplierId), n = Nl(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: kl("po"),
			purchaseOrderNumber: jl(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: Ml(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: Ml(e.supplierReference),
			notes: Ml(e.notes),
			lines: n,
			totals: El(n),
			createdAt: r,
			updatedAt: r
		};
		return P = [i, ...P], Ol(), i;
	},
	updateDraft(e, t) {
		let n = Il.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		Fl(t);
		let r = Pl(t.supplierId), i = Nl(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: Ml(t.expectedDeliveryDate),
			supplierReference: Ml(t.supplierReference),
			notes: Ml(t.notes),
			lines: i,
			totals: El(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return P = P.map((e) => e.id === n.id ? a : e), Ol(), a;
	},
	approve(e) {
		let t = Il.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return Ll(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = Il.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return Ll(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = Il.getById(e);
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
		return P = P.map((e) => e.id === n.id ? o : e), Ol(), o;
	},
	recordSupplierBill(e, t) {
		let n = Il.getById(e);
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
			let n = Rl(e.billedQuantity + t);
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
		return P = P.map((e) => e.id === n.id ? c : e), Ol(), c;
	},
	reverseSupplierBill(e, t) {
		let n = Il.getById(e);
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
				billedQuantity: Rl(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return P = P.map((e) => e.id === n.id ? c : e), Ol(), c;
	},
	cancel(e, t) {
		let n = Il.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return Ll(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function Ll(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return P = P.map((t) => t.id === e.id ? n : t), Ol(), n;
}
function Rl(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
r("purchaseOrders", {
	repository: Il,
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
	snapshot: () => ({ purchaseOrders: P }),
	restore: (e) => {
		P = e.purchaseOrders;
	},
	publish: () => Dl.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/accountRepository.ts
var zl = /* @__PURE__ */ new Set(), F = "2026-10-08T00:00:00.000Z", I = [
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
function Bl() {
	zl.forEach((e) => e());
}
function Vl(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function Hl(e) {
	return e?.trim() || void 0;
}
function Ul(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function Wl(e, t) {
	if (I.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function Gl(e, t) {
	if (!e) return;
	let n = I.find((n) => n.id !== t && (ol(e) ? n.id === ol(e) : n.systemRole === e));
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function Kl() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var L = {
	subscribe(e) {
		return zl.add(e), () => {
			zl.delete(e);
		};
	},
	getSnapshot() {
		return I;
	},
	getAll() {
		return I;
	},
	getById(e) {
		return I.find((t) => t.id === e);
	},
	getByCode(e) {
		return I.find((t) => t.code.toLowerCase() === e.trim().toLowerCase());
	},
	getBySystemRole(e) {
		return I.find((t) => ol(e) ? t.id === ol(e) : t.systemRole === e);
	},
	requireById(e) {
		let t = I.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = I.find((t) => ol(e) ? t.id === ol(e) : t.systemRole === e);
		if (!t) throw Error(`Accounting account for system role ${e} was not found.`);
		return t;
	},
	create(e) {
		let t = Vl(e.code, "Account code"), n = Vl(e.name, "Account name");
		Ul(t), Wl(t), Gl(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Kl(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: Hl(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return I = [...I, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), Bl(), i;
	},
	update(e, t) {
		let n = I.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = Vl(t.code, "Account code"), i = Vl(t.name, "Account name");
		if (Ul(r), Wl(r, e), (n.systemRole || ll(n.id)) && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: Hl(t.description),
			active: n.systemRole || ll(n.id) ? !0 : t.active,
			allowManualPosting: n.systemRole || ll(n.id) ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return I = I.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), Bl(), a;
	},
	setActive(e, t) {
		let n = I.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		if ((n.systemRole || ll(n.id)) && !t) throw Error("System control accounts cannot be deactivated.");
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return I = I.map((t) => t.id === e ? r : t), Bl(), r;
	}
};
r("accounts", {
	repository: L,
	read: "accounting.read",
	commands: {
		if: null,
		create: "accounting.post",
		update: "accounting.post",
		setActive: "accounting.post"
	},
	snapshot: () => ({ accounts: I }),
	restore: (e) => {
		I = e.accounts;
	},
	publish: () => zl.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/reconciliationLock.ts
function ql(e, t) {
	let n = s(), r = n.journals?.journalEntries ?? [], i = n.bankReconciliations?.reconciliations ?? [], a = r.filter((n) => n.sourceType === e && n.sourceId === t).map((e) => e.id);
	if (i.some((e) => e.clearedTransactionIds.some((e) => a.some((t) => e.startsWith(t + ":"))))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Jl(e, t) {
	let n = s(), r = n.bankAccounts?.bankAccounts ?? [], i = n.bankReconciliations?.reconciliations ?? [];
	for (let n of r.filter((e) => t.includes(e.glAccountId))) {
		let t = i.filter((e) => e.bankAccountId === n.id).map((e) => e.statementDate).sort().at(-1);
		if (t && e <= t) throw Error(`Bank account is reconciled through ${t}. Use a posting date after that statement.`);
	}
}
//#endregion
//#region src/features/accounting/data/accountingPeriodRepository.ts
var Yl = [], Xl, Zl, Ql = /* @__PURE__ */ new Set();
function $l(e, t) {
	Xl = e, Zl = t;
}
function eu() {
	let e = Zl?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function tu(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function nu(e) {
	let t = Yl.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function ru() {
	Ql.forEach((e) => e());
}
function iu(e) {
	if (a(e, "Posting date"), !Yl.length) return;
	let t = Yl.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!Yl.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
r("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => Yl,
		subscribe(e) {
			return Ql.add(e), () => {
				Ql.delete(e);
			};
		},
		create(e) {
			let t = eu(), n = tu(e.reason);
			if (a(e.startDate), a(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (Yl.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (Yl.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
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
			return Yl = [...Yl, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), ru(), r;
		},
		preflight(e) {
			let t = nu(e);
			if (!Xl) throw Error("Trusted close checks unavailable.");
			return Xl(t);
		},
		close(e) {
			let t = eu(), n = tu(e.reason), r = nu(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (Yl.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return Yl = Yl.map((e) => e.id === r.id ? {
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
			} : e), ru(), nu(e.id);
		},
		reopen(e) {
			let t = eu(), n = tu(e.reason), r = nu(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (Yl.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return Yl = Yl.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), ru(), nu(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: Yl }),
	restore: (e) => {
		o(e.periods), Yl = e.periods;
	},
	publish: ru
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var au = /* @__PURE__ */ new Set(), ou = k.read().journals;
k.onRollback(() => {
	ou = k.read().journals;
});
function su() {
	au.forEach((e) => k.notify(e));
}
function cu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function lu(e) {
	return e?.trim() || void 0;
}
function uu(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function du(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = ou.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function fu(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function pu(e) {
	if (uu(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = L.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = cu(r.debit), o = cu(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = cu(t + a), n = cu(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function mu(e) {
	return e.lines.map((e, t) => {
		let n = L.requireById(e.accountId);
		return {
			id: fu(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: lu(e.description),
			debit: cu(e.debit),
			credit: cu(e.credit)
		};
	});
}
function hu(e, t) {
	return ou.find((n) => n.sourceType === e && n.sourceId === t && !n.reversedJournalEntryId);
}
var R = {
	subscribe(e) {
		return au.add(e), () => {
			au.delete(e);
		};
	},
	getSnapshot() {
		return ou;
	},
	getAll() {
		return ou;
	},
	getById(e) {
		return ou.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return ou.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: hu,
	post(e) {
		iu(e.journalDate), Jl(e.journalDate, e.lines.map((e) => e.accountId));
		let t = pu(e), n = lu(e.sourceId);
		if (n) {
			let t = hu(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: fu("je"),
			journalNumber: du(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: lu(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: mu(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...ou];
		return k.update("journals", a), ou = a, su(), i;
	},
	reverse(e) {
		iu(e.reversalDate);
		let t = ou.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (uu(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Reversal reason must contain at least 3 characters.");
		Jl(e.reversalDate, t.lines.map((e) => e.accountId));
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
		}, i = pu(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: fu("je"),
			journalNumber: du(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: mu(r),
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
		}, c = [o, ...ou.map((e) => e.id === t.id ? s : e)];
		return k.update("journals", c), ou = c, su(), o;
	}
};
r("journals", {
	repository: R,
	read: "accounting.read",
	commands: {
		if: null,
		validateDate: null,
		for: null,
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ journalEntries: ou }),
	restore: (e) => {
		ou = e.journalEntries;
	},
	publish: () => au.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var gu = "htt.mock.banking.accounts.v1";
function _u(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var vu = /* @__PURE__ */ new Set(), yu = "2026-10-08T00:00:00.000Z", z = [{
	id: "bank_001",
	name: "Operating Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1000",
	accountType: "TRANSACTION",
	currency: "AUD",
	glAccountId: "acc_1000",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: yu,
	updatedAt: yu
}, {
	id: "bank_002",
	name: "Savings Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1010",
	accountType: "SAVINGS",
	currency: "AUD",
	glAccountId: "acc_1010",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: yu,
	updatedAt: yu
}], bu = Sc(gu, _u);
bu.status === "ok" && bu.data.every((e) => {
	let t = L.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (z = bu.data);
function xu() {
	vu.forEach((e) => e());
}
function Su(e) {
	let t = L.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of z) Su(e);
var Cu = {
	subscribe(e) {
		return vu.add(e), () => {
			vu.delete(e);
		};
	},
	getSnapshot() {
		return z;
	},
	getAll() {
		return z;
	},
	getById(e) {
		return z.find((t) => t.id === e);
	},
	getByGlAccountId(e) {
		return z.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = z.find((t) => t.id === e);
		if (!t) throw Error("Bank account was not found.");
		return t;
	},
	save(e, t) {
		let n = O({
			id: T().optional(),
			name: T().trim().min(1).max(180),
			bankName: T().trim().min(1).max(180),
			accountNumber: T().trim().min(1).max(100),
			accountType: qs([
				"TRANSACTION",
				"SAVINGS",
				"CREDIT_CARD",
				"OTHER"
			]),
			currency: qs(["AUD", "NZD"]),
			glAccountId: T().min(1),
			openingBalanceDate: T(),
			active: Ns()
		}).strict().parse(e);
		if (a(n.openingBalanceDate, "Opening date"), z[0] && n.currency !== z[0].currency) throw Error("This profile uses one base currency; foreign-currency bank accounts are not supported.");
		let r = z.find((e) => e.id === n.id);
		if (r && r.updatedAt !== t) throw Error("Bank account changed; reload before editing.");
		if (!r && n.id) throw Error("Bank account was not found.");
		if (z.some((e) => e.id !== r?.id && e.glAccountId === n.glAccountId)) throw Error("Each bank account needs its own GL account.");
		let i = L.requireById(n.glAccountId);
		if (!i.active || i.type !== "ASSET" || i.systemRole && i.systemRole !== "BANK") throw Error("Choose an active bank Asset account.");
		if (r && R.getAll().some((e) => e.lines.some((e) => e.accountId === r.glAccountId)) && (r.glAccountId !== n.glAccountId || r.openingBalanceDate !== n.openingBalanceDate || r.currency !== n.currency)) throw Error("A used bank account cannot change its ledger, currency or opening date.");
		let o = new Date(Math.max(Date.now(), r ? Date.parse(r.updatedAt) + 1 : 0)).toISOString(), s = {
			...n,
			id: r?.id ?? crypto.randomUUID(),
			openingBalance: r?.openingBalance ?? 0,
			createdAt: r?.createdAt ?? o,
			updatedAt: o
		};
		return Su(s), z = [...z.filter((e) => e.id !== s.id), s], xu(), s;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return z = z.map((t) => t.id === e ? r : t), wc(gu) && Cc(gu, z), xu(), r;
	}
};
r("bankAccounts", {
	repository: Cu,
	read: "banking.read",
	commands: {
		if: null,
		validateBankAccount: null,
		setActive: "banking.write",
		save: "banking.write"
	},
	snapshot: () => ({ bankAccounts: z }),
	restore: (e) => {
		z = e.bankAccounts;
	},
	publish: () => vu.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function B(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function wu(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function Tu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Eu({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return wu(e / t);
}
function Du({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return Tu(e * t);
}
function Ou({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = B(e + n), a = Tu(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : wu(a / i)
	};
}
function ku({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return Tu(e * t);
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function Au(e) {
	return Tu(e.lines.reduce((e, t) => {
		let n = Eu({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + Du({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function ju(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Mu(e) {
	return L.requireBySystemRole(e).id;
}
function Nu(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: "Pacific/Auckland",
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function Pu(e, t) {
	return R.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Fu(e, t) {
	let n = Pu(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Iu = {
	validateGoodsReceiptPosting(e) {
		let t = L.requireBySystemRole("INVENTORY"), n = L.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = Au(e);
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
		let t = R.getBySource("GOODS_RECEIPT", e.id).find((e) => !e.reversedJournalEntryId);
		if (t) return t;
		let { inventoryAccountId: n, grniAccountId: r, receiptValue: i } = this.validateGoodsReceiptPosting(e);
		return R.post({
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
		let n = L.requireBySystemRole("GRNI"), r = L.requireBySystemRole("GST_RECEIVABLE"), i = L.requireBySystemRole("ACCOUNTS_PAYABLE");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI account must be an active liability account.");
		if (!r.active || r.type !== "ASSET") throw Error("GST Receivable must be an active asset account.");
		if (!i.active || i.type !== "LIABILITY") throw Error("Accounts Payable must be an active liability account.");
		if (!Number.isFinite(t) || t < 0) throw Error("Matched receipt value must be a non-negative finite number.");
		let a = ju(e.totals.subtotal - t);
		if (a !== 0) {
			let e = L.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = ju(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = Pu("SUPPLIER_BILL", e.id);
		if (n) return n;
		let r = t ?? e.totals.subtotal, { variance: i } = this.validateSupplierBillPosting(e, r);
		return R.post({
			journalDate: e.billDate,
			description: `Supplier bill ${e.billNumber}`,
			reference: e.supplierInvoiceNumber,
			sourceType: "SUPPLIER_BILL",
			sourceId: e.id,
			lines: [
				{
					accountId: Mu("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				{
					accountId: Mu("GST_RECEIVABLE"),
					description: `GST - ${e.billNumber}`,
					debit: e.totals.taxAmount,
					credit: 0
				},
				...i === 0 ? [] : [{
					accountId: Mu("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: Mu("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = Fu("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? R.getById(t.reversalJournalEntryId) : void 0 : R.reverse({
			journalEntryId: t.id,
			reversalDate: Nu(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = Pu("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = Cu.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return R.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: Mu("ACCOUNTS_PAYABLE"),
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
		let t = Fu("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? R.getById(t.reversalJournalEntryId) : void 0 : R.reverse({
			journalEntryId: t.id,
			reversalDate: Nu(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return Pu("SUPPLIER_CREDIT", e.id) || R.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: Mu("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: Mu("PURCHASE_PRICE_VARIANCE"),
					description: e.creditNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				{
					accountId: Mu("GST_RECEIVABLE"),
					description: e.creditNumber,
					debit: 0,
					credit: e.totals.taxAmount
				}
			]
		});
	},
	reverseSupplierCredit(e) {
		for (let t of R.getBySource("SUPPLIER_CREDIT_RECLASS", e.id).filter((e) => e.status === "POSTED")) R.reverse({
			journalEntryId: t.id,
			reversalDate: Nu(e.voidedAt),
			reason: e.voidReason ?? "Credit void"
		});
		let t = Fu("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? R.getById(t.reversalJournalEntryId) : void 0 : R.reverse({
			journalEntryId: t.id,
			reversalDate: Nu(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, Lu = structuredClone([{
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
}]), Ru = {
	getAll() {
		return Lu;
	},
	getById(e) {
		return Lu.find((t) => t.id === e);
	},
	getActive() {
		return Lu.filter((e) => e.status === "ACTIVE");
	}
}, zu = /* @__PURE__ */ new Set(), Bu = [];
function Vu() {
	zu.forEach((e) => e());
}
function Hu() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Bu.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var Uu = {
	subscribe(e) {
		return zu.add(e), () => {
			zu.delete(e);
		};
	},
	getSnapshot() {
		return Bu;
	},
	getAll() {
		return Bu;
	},
	getByReference(e, t) {
		return Bu.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return Bu.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return Bu.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: Hu(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Bu = [t, ...Bu], Vu(), t;
	}
};
r("inventoryMovements", {
	repository: Uu,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: Bu }),
	restore: (e) => {
		Bu = e.movements;
	},
	publish: () => zu.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var Wu = /* @__PURE__ */ new Set(), Gu = [];
function Ku() {
	Wu.forEach((e) => e());
}
var qu = {
	subscribe(e) {
		return Wu.add(e), () => {
			Wu.delete(e);
		};
	},
	getSnapshot() {
		return Gu;
	},
	getAll() {
		return Gu;
	},
	getBalance(e, t) {
		return Gu.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = qu.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return Gu = Gu.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? Gu.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...Gu], Ku(), e;
	},
	replaceAll(e) {
		Gu = e, Ku();
	},
	clear() {
		Gu = [], Ku();
	}
};
r("costBalances", {
	repository: qu,
	read: "inventory.cost.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: Gu }),
	restore: (e) => {
		Gu = e.balances;
	},
	publish: () => Wu.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var Ju = /* @__PURE__ */ new Set(), Yu = [];
function Xu() {
	Ju.forEach((e) => e());
}
function Zu() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Yu.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function Qu(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var $u = {
	subscribe(e) {
		return Ju.add(e), () => {
			Ju.delete(e);
		};
	},
	getSnapshot() {
		return Yu;
	},
	getAll() {
		return Yu;
	},
	getByReference(e, t) {
		return Yu.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return Yu.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return Yu.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return Yu.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return Qu(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: Zu(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = $u.build(e);
		return Yu = [t, ...Yu], Xu(), t;
	},
	replaceAll(e) {
		Yu = e, Xu();
	},
	clear() {
		Yu = [], Xu();
	}
};
r("costMovements", {
	repository: $u,
	read: "inventory.cost.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: Yu }),
	restore: (e) => {
		Yu = e.movements;
	},
	publish: () => Ju.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var ed = /* @__PURE__ */ new Set(), td = "2026-01-01T00:00:00.000Z", nd = nl.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: td,
	updatedAt: td
}));
function rd() {
	ed.forEach((e) => e());
}
var id = {
	ensureProductPolicy(e, t, n) {
		let r = nd.find((t) => t.productId === e), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			productId: e,
			baseUnitId: t,
			active: r?.active ?? n,
			costingMethod: "MOVING_WEIGHTED_AVERAGE",
			createdAt: r?.createdAt ?? i,
			updatedAt: i
		};
		return nd = [...nd.filter((t) => t.productId !== e), a], rd(), a;
	},
	subscribe(e) {
		return ed.add(e), () => {
			ed.delete(e);
		};
	},
	getSnapshot() {
		return nd;
	},
	getAll() {
		return nd;
	},
	getByProductId(e) {
		return nd.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = id.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		let n = {
			...id.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return nd = nd.map((t) => t.productId === e ? n : t), rd(), n;
	}
};
r("costingPolicies", {
	repository: id,
	read: "inventory.cost.read",
	commands: {
		ensureProductPolicy: null,
		setActive: "accounting.post"
	},
	snapshot: () => ({ policies: nd }),
	restore: (e) => {
		nd = e.policies;
	},
	publish: () => ed.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function ad(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function od(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function sd(e, t) {
	let n = rl(e);
	if (!n) throw Error("Product was not found.");
	let r = id.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = il(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function cd(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = Tu(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(Tu(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function ld(e) {
	if (e && $u.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function ud({ movement: e, balance: t }) {
	let n = $u.getAll(), r = qu.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	$u.replaceAll(i), qu.replaceAll(a);
}
function dd(e) {
	if (ad(e.quantity), od(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	ld(e.inventoryMovementId);
	let { policy: t, unit: n } = sd(e.productId, e.unitId), r = B(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = Eu({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = Du({
		quantityBase: r,
		unitCostBase: i
	}), o = qu.getBalance(e.siteId, e.productId);
	o && cd(o, t.baseUnitId);
	let s = Ou({
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
	cd(l, t.baseUnitId);
	let u = $u.build({
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
	return ud({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function fd(e) {
	ad(e.quantity), od(e.occurredAt), ld(e.inventoryMovementId);
	let { policy: t, unit: n } = sd(e.productId, e.unitId), r = B(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = qu.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (cd(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = wu(i.averageCostPerBaseUnit), o = ku({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = B(i.quantityOnHand - r), c = s === 0, l = Tu(c ? -i.inventoryValue : -o), u = c ? 0 : Tu(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : wu(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	cd(p, t.baseUnitId);
	let m = $u.build({
		movementType: e.movementType ?? "ISSUE",
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: t.baseUnitId,
		quantityBase: B(-r),
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
	return ud({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function pd(e) {
	if (ad(e.quantityBase), od(e.occurredAt), ld(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = rl(e.productId);
	if (!t) throw Error("Product was not found.");
	let n = id.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = B(e.quantityBase), i = wu(e.unitCostBase), a = Tu(e.inventoryValue), o = qu.getBalance(e.siteId, e.productId);
	o && cd(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = B(s + r), u = Tu(c + a), d = l === 0 ? 0 : wu(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	cd(p, n.baseUnitId);
	let m = $u.build({
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
	return ud({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var md = /* @__PURE__ */ new Set(), hd = [];
function gd() {
	md.forEach((e) => e());
}
function _d(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var vd = {
	subscribe(e) {
		return md.add(e), () => {
			md.delete(e);
		};
	},
	getSnapshot() {
		return hd;
	},
	getAll() {
		return hd;
	},
	getBalance(e, t) {
		return hd.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = vd.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: _d(i.quantityOnHand + r),
				updatedAt: a
			};
			return hd = hd.map((r) => r.siteId === e && r.productId === t ? n : r), gd(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: _d(r),
			updatedAt: a
		};
		return hd = [o, ...hd], gd(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = vd.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = _d(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return hd = hd.map((n) => n.siteId === e && n.productId === t ? o : n), gd(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of Uu.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: _d((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		hd = Array.from(e.values()), gd();
	}
};
r("stock", {
	repository: vd,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: hd }),
	restore: (e) => {
		hd = e.balances;
	},
	publish: () => md.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/goodsReceiptRepository.ts
var yd = /* @__PURE__ */ new Set(), bd = k.read().goodsReceipts;
k.onRollback(() => {
	bd = k.read().goodsReceipts;
});
function xd() {
	try {
		k.update("goodsReceipts", bd);
	} catch (e) {
		throw bd = k.read().goodsReceipts, e;
	}
	yd.forEach((e) => k.notify(e));
}
function Sd(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Cd(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = bd.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function wd(e) {
	return e?.trim() || void 0;
}
var Td = {
	subscribe(e) {
		return yd.add(e), () => {
			yd.delete(e);
		};
	},
	getSnapshot() {
		return bd;
	},
	getAll() {
		return bd;
	},
	getById(e) {
		return bd.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return bd.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = Il.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = Ru.getById(e.siteId);
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
			let r = Sd(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!rl(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = il(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = Sd(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: Cd(e.receiptDate),
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
			supplierDeliveryReference: wd(e.supplierDeliveryReference),
			notes: wd(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		Iu.validateGoodsReceiptPosting(s), M();
		let c = j.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return j.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = rl(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				j.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = Uu.create({
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
					dd({
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
					vd.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			j.runStep(c, "JOURNAL", () => {
				Iu.postGoodsReceipt(s);
			}), j.runStep(c, "PURCHASE_ORDER", () => {
				Il.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), j.runStep(c, "RECEIPT", () => {
				bd = [s, ...bd], xd();
			});
		}), j.recover(c), s;
	}
};
r("goodsReceipts", {
	repository: Td,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: bd }),
	restore: (e) => {
		bd = e.goodsReceipts;
	},
	publish: () => yd.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var Ed = 1e-4;
function Dd(e) {
	return Tu(e);
}
function Od(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - B(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function kd(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function Ad(e, t, n) {
	let r = Eu({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return Du({
		quantityBase: B(e * n),
		unitCostBase: r
	});
}
function jd(e, t, n) {
	let r = [], i = n.filter((e) => e.status === "ACTIVE");
	for (let n of t) if (n.purchaseOrderId === e && n.status === "POSTED") for (let e of n.lines) {
		let t = B(i.filter((t) => t.goodsReceiptId === n.id && t.goodsReceiptLineId === e.id).reduce((e, t) => e + t.matchedQuantity, 0)), a = B(e.receivedQuantity - t);
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
function Md(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = jd(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), Od(e.quantity), kd(e.billUnitCost);
		let r = B(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > Ed);
		if (B(d.reduce((e, t) => e + t.availableQuantity, 0)) + Ed < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= Ed) break;
			let s = B(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = B(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = Du({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: Eu({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = Dd(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), ee = Math.abs(o.availableQuantity - s) <= Ed ? Dd(p - m) : Ad(s, o.receiptUnitCost, o.conversionToBase);
			if (ee < 0) throw Error("Receipt cost has been overallocated.");
			let te = Dd(s * e.billUnitCost), ne = Dd(te - ee);
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
				matchedReceiptValue: ee,
				billUnitCost: e.billUnitCost,
				matchedBillValue: te,
				priceVariance: ne,
				status: "ACTIVE",
				createdAt: l
			}), o.availableQuantity = B(o.availableQuantity - s), r = B(r - s);
		}
		if (r > Ed) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = Dd(Dd(e.quantity * e.billUnitCost) - Dd(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = Dd(p.matchedBillValue + f), p.priceVariance = Dd(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = B(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = B(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = Dd(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = Dd(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: Dd(p - f)
	};
}
var Nd = {
	calculate: Md,
	getAvailableReceiptLines(e, t, n) {
		return jd(e, t, n);
	}
}, Pd = k.read().receiptMatches;
k.onRollback(() => {
	Pd = k.read().receiptMatches;
});
var Fd = /* @__PURE__ */ new Set(), Id = () => {
	try {
		k.update("receiptMatches", Pd);
	} catch (e) {
		throw Pd = k.read().receiptMatches, e;
	}
	Fd.forEach((e) => k.notify(e));
}, Ld = {
	getAll() {
		return [...Pd];
	},
	subscribe(e) {
		return Fd.add(e), () => {
			Fd.delete(e);
		};
	},
	getSnapshot() {
		return Pd;
	},
	getByBill(e) {
		return Pd.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (Pd.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		Pd = [...Pd, ...t], Id();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		Pd = Pd.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), Id();
	}
};
r("receiptMatches", {
	repository: Ld,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: Pd }),
	restore: (e) => {
		Pd = e.matches;
	},
	publish: () => Fd.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
function Rd(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function zd({ quantity: e, unitCost: t, taxRate: n = .1 }) {
	let r = Rd(e * t), i = Rd(r * n);
	return {
		lineSubtotal: r,
		taxAmount: i,
		lineTotal: Rd(r + i)
	};
}
function Bd(e) {
	let t = Rd(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Rd(e.reduce((e, t) => e + t.taxAmount, 0)), r = Rd(t + n);
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
var Vd = /* @__PURE__ */ new Set(), V = k.read().supplierBills;
k.onRollback(() => {
	V = k.read().supplierBills;
});
function Hd() {
	try {
		k.update("supplierBills", V);
	} catch (e) {
		throw V = k.read().supplierBills, e;
	}
	Vd.forEach((e) => k.notify(e));
}
function Ud(e) {
	return e?.trim() || void 0;
}
function Wd(e) {
	let t = `BILL-${e.slice(0, 4)}-`, n = V.filter((e) => e.billNumber.startsWith(t)).map((e) => Number.parseInt(e.billNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
var Gd = {
	subscribe(e) {
		return Vd.add(e), () => {
			Vd.delete(e);
		};
	},
	getSnapshot() {
		return V;
	},
	getAll() {
		return V;
	},
	getById(e) {
		return V.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return V.filter((t) => t.supplierId === e);
	},
	applyPayment(e, t) {
		let n = V.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a payment.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment allocation must be greater than zero.");
		let r = qd(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = qd(n.totals.amountPaid + r), a = qd(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return V = V.map((t) => t.id === e ? o : t), Hd(), o;
	},
	reversePayment(e, t) {
		let n = V.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = qd(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = qd(Math.max(0, n.totals.amountPaid - r)), a = qd(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return V = V.map((t) => t.id === e ? o : t), Hd(), o;
	},
	applyCredit(e, t) {
		let n = V.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = qd(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = qd(n.totals.amountCredited + r), a = qd(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return V = V.map((t) => t.id === e ? o : t), Hd(), o;
	},
	reverseCredit(e, t) {
		let n = V.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = qd(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = qd(Math.max(0, n.totals.amountCredited - r)), a = qd(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return V = V.map((t) => t.id === e ? o : t), Hd(), o;
	},
	markVoid(e, t) {
		let r = V.find((t) => t.id === e);
		if (!r) throw Error("Supplier bill was not found.");
		if (r.status === "VOID") throw Error("This supplier bill has already been voided.");
		let i = t.trim();
		if (i.length < 3) throw Error("A void reason is required.");
		if (r.status !== "OPEN" || r.totals.amountPaid > 0 || r.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if (Ld.getByBill(r.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
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
				Iu.reverseSupplierBill(o);
			}), j.runStep(s, "PURCHASE_ORDER", () => {
				Il.reverseSupplierBill(r.purchaseOrderId, r.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), j.runStep(s, "MATCHES", () => {
				Ld.reverseForBill(r.id, i, n(a));
			}), j.runStep(s, "BILL", () => {
				V = V.map((e) => e.id === r.id ? o : e), Hd();
			});
		}), j.recover(s), o;
	},
	getByPurchaseOrder(e) {
		return V.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = Il.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (![
			"PARTIALLY_RECEIVED",
			"RECEIVED",
			"BILLED"
		].includes(t.status)) throw Error("Supplier bills can only be created for purchase orders with received goods.");
		let n = e.supplierInvoiceNumber.trim();
		if (!n) throw Error("Supplier invoice number is required.");
		if (V.some((e) => e.supplierId === t.supplierId && e.supplierInvoiceNumber.toLowerCase() === n.toLowerCase() && e.status !== "VOID")) throw Error("This supplier invoice number has already been entered.");
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
			let r = Kd(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = zd({
				taxRate: a,
				quantity: e.quantity,
				unitCost: e.unitCost
			});
			return {
				id: `bill_line_${crypto.randomUUID()}`,
				taxRate: a,
				taxCode: n.taxCode,
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
		}), o = Bd(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: Wd(e.billDate),
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
			notes: Ud(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = Nd.calculate({
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
			receipts: Td.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: Ld.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		Iu.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), M();
		let u = j.begin("SUPPLIER_BILL", c.id).key;
		return j.registerRecovery(u, () => {
			j.runStep(u, "JOURNAL", () => {
				Iu.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), j.runStep(u, "PURCHASE_ORDER", () => {
				Il.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), j.runStep(u, "MATCHES", () => {
				Ld.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), j.runStep(u, "BILL", () => {
				V = [c, ...V], Hd();
			});
		}), j.recover(u), c;
	}
};
function Kd(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function qd(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
r("supplierBills", {
	repository: Gd,
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
	snapshot: () => ({ supplierBills: V }),
	restore: (e) => {
		V = e.supplierBills;
	},
	publish: () => Vd.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierPaymentRepository.ts
var Jd = /* @__PURE__ */ new Set(), Yd = k.read().supplierPayments;
k.onRollback(() => {
	Yd = k.read().supplierPayments;
});
function Xd() {
	k.update("supplierPayments", Yd), Jd.forEach((e) => k.notify(e));
}
var Zd = {
	subscribe(e) {
		return Jd.add(e), () => {
			Jd.delete(e);
		};
	},
	getSnapshot() {
		return Yd;
	},
	getAll() {
		return Yd;
	},
	getById(e) {
		return Yd.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return Yd.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return Yd.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: $d(e.reference),
			notes: $d(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: ef(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = Yd.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (a(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = Cl.getById(e.supplierId);
		if (!r) throw Error("Supplier was not found.");
		if (!e.paymentDate) throw Error("Payment date is required.");
		if (!e.method) throw Error("Payment method is required.");
		if (!e.bankAccountId) throw Error("Bank account is required.");
		let i = Cu.getById(e.bankAccountId);
		if (!i) throw Error("Bank account was not found.");
		if (!i.active) throw Error("The selected bank account is inactive.");
		let o = e.allocations.filter((e) => Number.isFinite(e.amount) && e.amount > 0);
		if (o.length === 0) throw Error("Allocate the payment to at least one supplier bill.");
		let s = /* @__PURE__ */ new Set(), c = o.map((t) => {
			if (s.has(t.supplierBillId)) throw Error("A supplier bill cannot appear more than once in the same payment.");
			s.add(t.supplierBillId);
			let n = Gd.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = ef(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${tf(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), l = ef(c.reduce((e, t) => e + t.amount, 0));
		if (l <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of c) Gd.applyPayment(e.supplierBillId, e.amount);
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: Qd(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: l,
			method: e.method,
			bankAccountId: i.id,
			reference: $d(e.reference),
			notes: $d(e.notes),
			allocations: c,
			status: "POSTED",
			createdAt: u,
			updatedAt: u
		};
		return Yd = [d, ...Yd], Xd(), Iu.postSupplierPayment(d), d;
	},
	reverse(e, t) {
		ql("SUPPLIER_PAYMENT", e);
		let n = Yd.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = Gd.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) Gd.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return Yd = Yd.map((t) => t.id === e ? a : t), Xd(), Iu.reverseSupplierPayment(a), a;
	}
};
function Qd(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = Yd.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function $d(e) {
	return e?.trim() || void 0;
}
function ef(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function tf(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: "AUD"
	}).format(e);
}
var nf = Zd.create;
Zd.create = function(...e) {
	return M(), k.transaction(() => nf.apply(Zd, e));
};
var rf = Zd.reverse;
Zd.reverse = function(...e) {
	return M(), k.transaction(() => rf.apply(Zd, e));
}, r("supplierPayments", {
	repository: Zd,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: Yd }),
	restore: (e) => {
		Yd = e.supplierPayments;
	},
	publish: () => Jd.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/paymentBatchRepository.ts
var af = (e) => Math.round((e + 2 ** -52) * 100) / 100, of = T().trim().min(1).max(200), sf = O({
	operationId: of,
	paymentDate: of,
	bankAccountId: of,
	reference: T().max(500),
	allocations: D(O({
		supplierBillId: of,
		amount: ks().finite().positive().refine((e) => af(e) === e)
	}).strict()).min(1).max(500)
}).strict(), cf = [], lf = 0, uf = /* @__PURE__ */ new Set(), df = () => {
	lf++, uf.forEach((e) => e());
}, ff = () => {
	let e = vc.current();
	if (!e) throw Error("A verified session is required.");
	return e.userId;
};
function pf(e, t) {
	return {
		action: e,
		reason: t,
		actor: ff(),
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function mf(e) {
	let t = cf.find((t) => t.id === e);
	if (!t) throw Error("Payment batch was not found.");
	return t;
}
function hf(e) {
	return cf = cf.map((t) => t.id === e.id ? e : t), df(), e;
}
function gf(e) {
	a(e.paymentDate, "Payment date");
	let t = Cu.requireById(e.bankAccountId);
	if (!t.active || e.paymentDate < t.openingBalanceDate) throw Error("Invalid paying bank account/date.");
	if (new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length) throw Error("Select each bill only once.");
	for (let t of e.allocations) {
		let n = Gd.getById(t.supplierBillId);
		if (!n || n.status === "VOID" || t.amount > n.totals.amountDue || e.paymentDate < n.billDate) throw Error("A bill amount, date or outstanding balance changed. Review the batch.");
	}
}
r("paymentBatches", {
	repository: {
		create(e) {
			let t = sf.parse(e), n = JSON.stringify(t), r = cf.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID was used with different batch data.");
				return r;
			}
			gf(t);
			let i = {
				...t,
				id: crypto.randomUUID(),
				fingerprint: n,
				status: "DRAFT",
				createdBy: ff(),
				paymentIds: [],
				history: [pf("Created")]
			};
			return cf = [...cf, i], df(), i;
		},
		approve(e) {
			let t = mf(e);
			if (t.status === "APPROVED") return t;
			if (t.status !== "DRAFT") throw Error("Only a draft batch can be approved.");
			return gf(t), hf({
				...t,
				status: "APPROVED",
				approvedBy: ff(),
				history: [...t.history, pf("Approved")]
			});
		},
		post(e) {
			let t = mf(e);
			if (t.status === "POSTED") return t;
			if (t.status !== "APPROVED") throw Error("Approve the batch before recording payments.");
			M(), gf(t);
			let n = /* @__PURE__ */ new Map();
			for (let e of t.allocations) {
				let t = Gd.getById(e.supplierBillId);
				n.set(t.supplierId, [...n.get(t.supplierId) ?? [], e]);
			}
			let r = [...n].map(([e, n]) => Zd.create({
				operationId: "batch:" + t.id + ":" + e,
				supplierId: e,
				paymentDate: t.paymentDate,
				bankAccountId: t.bankAccountId,
				reference: t.reference,
				method: "BANK_TRANSFER",
				allocations: n
			}));
			return hf({
				...t,
				status: "POSTED",
				paymentIds: r.map((e) => e.id),
				history: [...t.history, pf("Payments recorded")]
			});
		},
		cancel(e) {
			let t = mf(e.id);
			if (!["DRAFT", "APPROVED"].includes(t.status) || e.reason?.trim().length < 3) throw Error("Only an unposted batch can be cancelled, with a reason.");
			return hf({
				...t,
				status: "CANCELLED",
				history: [...t.history, pf("Cancelled", e.reason)]
			});
		},
		reverse(e) {
			let t = mf(e.id);
			if (t.status === "REVERSED") return t;
			if (t.status !== "POSTED" || e.reason?.trim().length < 3) throw Error("A posted batch and reversal reason are required.");
			M();
			for (let e of t.paymentIds) {
				let t = Zd.getById(e);
				if (!t || t.status !== "POSTED") throw Error("Batch payments changed. Inspect before reversing.");
				ql("SUPPLIER_PAYMENT", e);
			}
			for (let n of t.paymentIds) Zd.reverse(n, e.reason);
			return hf({
				...t,
				status: "REVERSED",
				history: [...t.history, pf("Reversed", e.reason)]
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
	snapshot: () => ({ batches: cf }),
	restore: (e) => {
		cf = e.batches;
	},
	validate: (e, t) => {
		let n = O({ batches: D(sf.extend({
			id: of,
			fingerprint: T(),
			status: qs([
				"DRAFT",
				"APPROVED",
				"POSTED",
				"REVERSED",
				"CANCELLED"
			]),
			createdBy: of,
			approvedBy: of.optional(),
			paymentIds: D(of),
			history: D(O({
				action: of,
				actor: of,
				at: of,
				reason: T().optional()
			}))
		})) }).strict().parse(e), r = t.supplierPayments.supplierPayments;
		for (let e of n.batches) {
			if (!["POSTED", "REVERSED"].includes(e.status)) continue;
			let n = e.paymentIds.map((e) => r.find((t) => t.id === e));
			if (!n.length || n.some((t) => !t || t.bankAccountId !== e.bankAccountId || t.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) || af(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== af(e.allocations.reduce((e, t) => e + t.amount, 0))) throw Error("Batch payment relationships are invalid.");
			if (e.paymentIds.some((e) => !t.journals.journalEntries.some((t) => t.sourceType === "SUPPLIER_PAYMENT" && t.sourceId === e))) throw Error("A batch payment journal is missing.");
		}
	},
	publish: df
});
//#endregion
//#region src/features/sales/data/quoteStorage.ts
var _f = "htt.mock.sales.quotes.v1", vf = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function yf(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !vf.has(String(t.status)) || ![
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
function bf() {
	return Sc(_f, yf);
}
function xf(e) {
	if (bf().status === "invalid" || !wc("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!Cc("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var Sf = "htt.mock.sales.quote-orders.v1";
function Cf(e) {
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
function wf(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!yf(t.quotes) || !Cf(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function Tf() {
	return Sc(Sf, wf);
}
function Ef(e) {
	if (!wf(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = Tf(), n = bf();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !wc("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!Cc("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var Df = "htt.mock.sales.documents.v1";
function Of(e) {
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
function kf(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!wf(t) || !Of(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function Af() {
	return Sc(Df, kf);
}
function jf(e) {
	if (!kf(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = Af();
	if (t.status === "invalid" || t.status === "unavailable" || !wc("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!Cc("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var Mf = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Nf(e) {
	let t = e.filter((e) => Mf.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function Pf() {
	Nf(A.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var Ff = [{
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
}], If = [{
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
}], Lf = [{
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
}], Rf = "htt.mock.sales.credit-notes.v1", zf = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, Bf = (e) => typeof e == "string" && e.length > 0;
function Vf(e) {
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
		].every((e) => Bf(t[e])) || ![
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
		].every((e) => zf(i[e])) || !zf(t.amountApplied) || !zf(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => Bf(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !zf(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		if (Math.abs(t - e.amountApplied) > .011) return !1;
		let n = e.refundEvents ?? [];
		if (!Array.isArray(n) || n.some((e) => !e || !Bf(e.id) || !Bf(e.date) || !zf(e.amount) || e.amount <= 0 || e.reversalDate !== void 0 && !Bf(e.reversalDate)) || new Set(n.map((e) => e.id)).size !== n.length) return !1;
		let r = n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0);
		return !zf(e.amountRefunded ?? 0) || Math.abs(r - (e.amountRefunded ?? 0)) > .011 || t + r > e.totals.total + .011 ? !1 : e.status === "VOID" ? t === 0 && r === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t - r)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function Hf() {
	return Sc(Rf, Vf);
}
function Uf(e) {
	if (!Vf(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = Hf();
	if (t.status === "invalid" || t.status === "unavailable" || !wc("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!Cc("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var Wf = /* @__PURE__ */ new Set(), Gf = Hf(), Kf = Gf.status === "ok" ? structuredClone(Gf.data.creditNotes) : [], H = Gf.status === "ok" ? structuredClone(Gf.data.allocations) : [], qf = [...Kf], Jf = [...H];
function Yf() {
	qf = [...Kf], Jf = [...H], Wf.forEach((e) => e());
}
function Xf(e, t) {
	Uf({
		creditNotes: e,
		allocations: t
	}), Kf = e, H = t, Yf();
}
var U = {
	subscribe(e) {
		return Wf.add(e), () => {
			Wf.delete(e);
		};
	},
	getSnapshot() {
		return qf;
	},
	getAllocationSnapshot() {
		return Jf;
	},
	getAll() {
		return qf;
	},
	getAllAllocations() {
		return Jf;
	},
	getById(e) {
		return Kf.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Kf.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Kf.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return H.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return H.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if (Kf.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return Xf([e, ...Kf], H), e;
	},
	update(e) {
		if (!Kf.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return Xf(Kf.map((t) => t.id === e.id ? e : t), H), e;
	},
	createAllocation(e) {
		if (H.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return Xf(Kf, [e, ...H]), e;
	},
	updateAllocation(e) {
		if (!H.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return Xf(Kf, H.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!Kf.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = H.some((t) => t.id === e.id) ? H.map((t) => t.id === e.id ? e : t) : [e, ...H];
		Xf(Kf.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return H.find((t) => t.id === e);
	}
};
r("customerCredits", {
	repository: U,
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
		creditNotes: Kf,
		allocations: H
	}),
	restore: (e) => {
		Kf = e.creditNotes, H = e.allocations, qf = [...Kf], Jf = [...H];
	},
	publish: () => Wf.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/customerPricingStorage.ts
var Zf = "htt.mock.contacts.customerPricing.v1";
function Qf(e) {
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
function $f() {
	return Sc(Zf, Qf);
}
function ep(e) {
	if ($f().status === "invalid" || !wc("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!Cc("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var tp = [
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
], np = /* @__PURE__ */ new Set(), rp = $f(), ip = rp.status === "ok" ? rp.data : structuredClone(tp);
function ap() {
	np.forEach((e) => {
		e();
	});
}
function op(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function sp(e) {
	return e.trim() || void 0;
}
function cp(e, t) {
	let n = rl(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = n.units.find((e) => e.id === t);
	if (!r) throw Error(`Unit ${t} does not belong to product ${e}`);
	if (!r.active) throw Error("The selected product unit is inactive");
	return {
		product: n,
		unit: r
	};
}
function lp(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function up({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = ip.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : lp(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = hp(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function dp(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function fp(e) {
	let t = il(e.productId, e.unitId);
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
var pp = {
	subscribe(e) {
		return np.add(e), () => {
			np.delete(e);
		};
	},
	getSnapshot() {
		return ip;
	},
	getAll() {
		return ip;
	},
	getById(e) {
		return ip.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return ip.filter((t) => t.customerId === e);
	},
	create(e, t) {
		cp(t.productId, t.unitId);
		let n = sp(t.effectiveTo);
		t.active && up({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = dp(t), a = {
			id: op("cprice"),
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
		}, o = [a, ...ip];
		return ep(o), ip = o, ap(), a;
	},
	update(e, t) {
		let n = pp.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		cp(t.productId, t.unitId);
		let r = sp(t.effectiveTo);
		t.active && up({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = dp(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = ip.map((t) => t.id === e ? a : t);
		return ep(o), ip = o, ap(), a;
	},
	resolve(e) {
		return fp(e);
	},
	resolvePrice(e, t, n, r) {
		let i = pp.resolveBasePrice(e, t, n, r.slice(0, 10)), a = cl({
			customerId: e,
			productId: t,
			unitId: n,
			at: r,
			customerPrice: i.effectivePrice,
			basePrice: i.basePrice,
			hasCustomerPrice: i.source === "CUSTOMER_PRICE"
		});
		if (!a.promotionId) return i;
		let o = Number((i.basePrice - a.price).toFixed(2));
		return {
			...i,
			date: r,
			effectivePrice: a.price,
			source: "PROMOTIONAL_PRICE",
			promotionId: a.promotionId,
			discountAmount: o,
			discountPercent: i.basePrice ? Number((o / i.basePrice * 100).toFixed(2)) : 0
		};
	},
	resolveBasePrice(e, t, n, r) {
		let { unit: i } = cp(t, n), a = ip.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && mp(r, i.effectiveFrom, i.effectiveTo));
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
		let o = fp(a);
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
function mp(e, t, n) {
	return !(e < t || n && e > n);
}
function hp(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
r("customerPrices", {
	repository: pp,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: ip }),
	restore: (e) => {
		ip = e.customerPrices;
	},
	publish: () => np.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
function gp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function _p({ quantity: e, standardUnitPrice: t, unitPrice: n, taxRate: r = sl() }) {
	let i = gp(e * n), a = gp(i * r), o = gp(i + a), s = gp(t - n);
	return {
		discountAmount: s,
		discountPercent: t > 0 ? gp(s / t * 100) : 0,
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: o
	};
}
function vp(e) {
	let t = gp(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = gp(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: gp(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function yp({ customerId: e, documentDate: t, draft: n }) {
	if (n.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let r = rl(n.productId);
	if (!r) throw Error(`Product ${n.productId} was not found`);
	if (r.status !== "ACTIVE") throw Error(`${r.name} is inactive`);
	let i = il(n.productId, n.unitId);
	if (!i) throw Error(`Unit ${n.unitId} was not found for ${r.name}`);
	let a = pp.resolvePrice(e, n.productId, n.unitId, t), o = n.unitPrice !== void 0, s = o ? n.unitPrice : a.effectivePrice;
	if (!Number.isFinite(s) || s < 0) throw Error("Unit price cannot be negative");
	if (al(n.productId, n.unitId, n.quantity, "sell"), r.sellEnabled === !1) throw Error("Product is not available for selling.");
	let c = r.taxCode ?? "GST", l = sl(c), u = _p({
		taxRate: l,
		quantity: n.quantity,
		standardUnitPrice: a.basePrice,
		unitPrice: s
	});
	return {
		id: bp("line"),
		taxCode: c,
		taxRate: l,
		promotionId: o ? void 0 : a.promotionId,
		productId: r.id,
		unitId: i.id,
		sku: r.sku,
		description: r.name,
		unitSymbol: i.symbol,
		quantity: n.quantity,
		standardUnitPrice: a.basePrice,
		unitPrice: s,
		priceSource: o ? "MANUAL" : a.source,
		customerPriceId: o ? void 0 : a.customerPrice?.id,
		...u
	};
}
function bp(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var xp = /* @__PURE__ */ new Set(), Sp = k.read().payments;
function Cp() {
	xp.forEach((e) => e());
}
function wp() {
	return `payment_${crypto.randomUUID()}`;
}
function Tp() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Sp.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var Ep = {
	subscribe(e) {
		return xp.add(e), () => {
			xp.delete(e);
		};
	},
	getSnapshot() {
		return Sp;
	},
	getAll() {
		return Sp;
	},
	getById(e) {
		return Sp.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Sp.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Sp.filter((t) => t.invoiceId === e);
	},
	create(e) {
		if (!e.customerId) throw Error("Customer is required");
		if (!e.invoiceId) throw Error("Invoice is required");
		if (!e.paymentDate) throw Error("Payment date is required");
		if (!e.bankAccountId) throw Error("Bank account is required");
		let t = Cu.getById(e.bankAccountId);
		if (!t) throw Error("Bank account was not found");
		if (!t.active) throw Error("The selected bank account is inactive");
		if (!Number.isFinite(e.amount) || e.amount <= 0) throw Error("Payment amount must be greater than zero");
		if (a(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (Op(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = A.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: Op(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: Dp(e.reference),
				notes: Dp(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = Sp.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: wp(),
			paymentNumber: Tp(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: Op(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: Dp(e.reference),
			notes: Dp(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && A.bindResult(n, i.id);
		let o = [i, ...Sp];
		if (k.update("payments", o), Sp = o, n && !e.deferOperationCompletion) try {
			A.complete(n, i.id);
		} catch (e) {
			try {
				A.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return Cp(), i;
	},
	reverse(e, t) {
		let n = Sp.find((t) => t.id === e);
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
		}, o = Sp.map((t) => t.id === e ? a : t);
		return k.update("payments", o), Sp = o, Cp(), a;
	},
	getReceivedByInvoice(e) {
		return Sp.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function Dp(e) {
	return e?.trim() || void 0;
}
function Op(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
r("customerPayments", {
	repository: Ep,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null
	},
	snapshot: () => ({ payments: Sp }),
	restore: (e) => {
		Sp = e.payments;
	},
	publish: () => xp.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/salesAccountingPostingService.ts
function kp(e) {
	return L.requireBySystemRole(e).id;
}
function Ap(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: "Pacific/Auckland",
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function jp(e, t) {
	return R.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Mp(e, t) {
	let n = jp(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Np = {
	postInvoice(e) {
		return jp("CUSTOMER_INVOICE", e.id) || R.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: kp("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: kp("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				{
					accountId: kp("GST_PAYABLE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.taxAmount
				}
			]
		});
	},
	reverseInvoice(e) {
		let t = Mp("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? R.getById(t.reversalJournalEntryId) : void 0 : R.reverse({
			journalEntryId: t.id,
			reversalDate: Ap(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = jp("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = Cu.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this customer payment is inactive.");
		return R.post({
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
				accountId: kp("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = Mp("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? R.getById(t.reversalJournalEntryId) : void 0 : R.reverse({
			journalEntryId: t.id,
			reversalDate: Ap(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return jp("CREDIT_NOTE", e.id) || R.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: kp("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				{
					accountId: kp("GST_PAYABLE"),
					description: e.creditNoteNumber,
					debit: e.totals.taxAmount,
					credit: 0
				},
				{
					accountId: kp("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = Mp("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? R.getById(t.reversalJournalEntryId) : void 0 : R.reverse({
			journalEntryId: t.id,
			reversalDate: Ap(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, Pp = /* @__PURE__ */ new Set(), Fp = Af(), Ip = Tf(), Lp = bf(), W = Fp.status === "ok" ? structuredClone(Fp.data.quotes) : Ip.status === "ok" ? structuredClone(Ip.data.quotes) : Lp.status === "ok" ? structuredClone(Lp.data) : structuredClone(Ff);
function Rp(e) {
	Fp.status === "ok" || Af().status !== "empty" ? jf({
		quotes: e,
		salesOrders: zp,
		invoices: G
	}) : Ip.status === "ok" || Tf().status !== "empty" ? Ef({
		quotes: e,
		salesOrders: zp
	}) : xf(e), W = e, Up();
}
var zp = Fp.status === "ok" ? structuredClone(Fp.data.salesOrders) : Ip.status === "ok" ? structuredClone(Ip.data.salesOrders) : structuredClone(If), G = Fp.status === "ok" ? structuredClone(Fp.data.invoices) : structuredClone(Lf);
function Bp(e) {
	jf({
		quotes: W,
		salesOrders: zp,
		invoices: e
	}), G = e, Up();
}
function Vp(e, t = W) {
	Fp.status === "ok" || Af().status !== "empty" ? jf({
		quotes: t,
		salesOrders: e,
		invoices: G
	}) : Ef({
		quotes: t,
		salesOrders: e
	}), zp = e, W = t, Up();
}
var Hp = Wp();
function Up() {
	Hp = Wp(), Pp.forEach((e) => e());
}
function Wp() {
	return [
		...W,
		...zp,
		...G
	];
}
var Gp = {
	subscribe(e) {
		return Pp.add(e), () => {
			Pp.delete(e);
		};
	},
	getSnapshot() {
		return Hp;
	},
	getAll() {
		return Hp;
	},
	getById(e) {
		return Hp.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Hp.filter((t) => t.customerId === e);
	},
	getQuotesByCustomer(e) {
		return W.filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return zp.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return G.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (Kp(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = e.lines.map((t) => yp({
			customerId: e.customerId,
			documentDate: e.documentDate,
			draft: t
		})), n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Jp("quote"),
			type: "QUOTE",
			documentNumber: Yp("QU", W.map((e) => e.documentNumber)),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: qp(e.customerReference),
			notes: qp(e.notes),
			lines: t,
			totals: vp(t),
			createdAt: n,
			updatedAt: n
		};
		return Rp([r, ...W]), r;
	},
	updateDraftQuote(e, t) {
		let n = W.find((t) => t.id === e);
		if (!n) throw Error(`Quote ${e} was not found`);
		if (n.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let r = t.lines.map((e) => {
			if (e.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
			if (!Number.isFinite(e.standardUnitPrice) || !Number.isFinite(e.unitPrice) || e.standardUnitPrice < 0 || e.unitPrice < 0) throw Error("Sales prices cannot be negative");
			al(e.productId, e.unitId, e.quantity, "sell");
			let t = rl(e.productId)?.taxCode ?? "GST", r = sl(t), i = _p({
				taxRate: r,
				quantity: e.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice
			});
			return {
				id: n.lines.find((t) => t.id === e.lineId)?.id ?? Jp("line"),
				productId: e.productId,
				unitId: e.unitId,
				sku: Qp(e.productId, e.unitId).sku,
				description: Qp(e.productId, e.unitId).description,
				unitSymbol: Qp(e.productId, e.unitId).unitSymbol,
				quantity: e.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice,
				priceSource: e.priceSource,
				customerPriceId: e.customerPriceId,
				taxCode: t,
				taxRate: r,
				...i
			};
		}), i = {
			...n,
			documentDate: t.documentDate,
			expiryDate: t.expiryDate,
			customerReference: qp(t.customerReference),
			notes: qp(t.notes),
			lines: r,
			totals: vp(r),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Rp(W.map((t) => t.id === e ? i : t)), i;
	},
	sendQuote(e) {
		let t = W.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return Rp(W.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = W.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return Rp(W.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = W.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return Rp(W.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = W.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Jp("order"),
			type: "SALES_ORDER",
			documentNumber: Yp("SO", zp.map((e) => e.documentNumber)),
			customerId: t.customerId,
			documentDate: Xp(),
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
		return Vp([r, ...zp], W.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = zp.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Vp(zp.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = zp.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = Xp(), i = {
			id: Jp("invoice"),
			type: "INVOICE",
			documentNumber: Yp("INV", G.map((e) => e.documentNumber)),
			customerId: t.customerId,
			documentDate: r,
			dueDate: Zp(r, 30),
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
		}, a = [i, ...G], o = zp.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: n
		} : e);
		return jf({
			quotes: W,
			salesOrders: o,
			invoices: a
		}), G = a, zp = o, Up(), Np.postInvoice(i), i;
	},
	createCreditNoteFromInvoice(e) {
		let t = G.find((t) => t.id === e.invoiceId);
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
			let i = U.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id).reduce((e, t) => e + t.quantity, 0);
			if (e.quantity + i > n.quantity + 1e-8) throw Error("Credit quantity cannot exceed the original invoice quantity.");
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1);
			return {
				...n,
				quantity: e.quantity,
				taxRate: a,
				..._p({
					quantity: e.quantity,
					unitPrice: n.unitPrice,
					standardUnitPrice: n.standardUnitPrice,
					taxRate: a
				})
			};
		}), a = vp(i);
		if (a.total <= 0) throw Error("Credit note total must be greater than zero");
		if ($p($p(U.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + a.total) > $p(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: Jp("credit-note"),
			creditNoteNumber: Yp("CN", U.getAll().map((e) => e.creditNoteNumber)),
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
		return U.create(s), Np.postCreditNote(s), s;
	},
	applyCreditToInvoice(e) {
		M(), Pf();
		let t = U.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		let n = G.find((t) => t.id === e.invoiceId);
		if (!n) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void credit note cannot be applied");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be applied");
		if (n.status === "VOID") throw Error("Credit cannot be applied to a void invoice");
		if (n.status === "DRAFT") throw Error("Credit cannot be applied to a draft invoice");
		if (t.customerId !== n.customerId) throw Error("Credit note and invoice must belong to the same customer");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the credit note date");
		let r = $p(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = U.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: Jp("credit-allocation"),
			allocationNumber: Yp("CA", U.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = $p(i.amountApplied + r), c = $p(Math.max(0, i.totals.total - (i.amountRefunded ?? 0) - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
		if (A.begin(l, "SALES_CREDIT_APPLY", JSON.stringify({
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: r
		})).status !== "started") throw Error("Credit allocation was previously attempted; manual review required.");
		try {
			A.bindResult(l, o.id), U.commitAllocationAndCredit(o, {
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
		M(), Pf();
		let t = U.getAllocationById(e.allocationId);
		if (!t) throw Error(`Credit allocation ${e.allocationId} was not found`);
		if (t.status === "REVERSED") throw Error("This credit allocation has already been reversed");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A reversal reason is required");
		let r = U.getById(t.creditNoteId);
		if (!r) throw Error("Credit note was not found");
		if (r.status === "VOID") throw Error("Allocations on a void credit note cannot be reversed here");
		let i = G.find((e) => e.id === t.invoiceId);
		if (!i) throw Error("Allocated invoice was not found");
		if (i.status === "VOID") throw Error("Credit allocation cannot be reversed after the invoice has been voided");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			updatedAt: a
		}, s = $p(U.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = $p(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - s)), l = `sales-credit-reversal:${t.id}`;
		if (A.begin(l, "SALES_CREDIT_REVERSAL", t.id).status !== "started") throw Error("Credit allocation reversal previously attempted; manual review required.");
		try {
			A.bindResult(l, t.id), U.commitAllocationAndCredit(o, {
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
		let t = U.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		if (t.status === "VOID") throw Error("This credit note has already been voided");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be voided here");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse customer refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required");
		if (U.getAllocationsByCreditNote(t.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this credit note");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: r,
			voidReason: n,
			updatedAt: r
		};
		return U.update(i), Np.reverseCreditNote(i), i;
	},
	recordInvoicePayment(e) {
		if (M(), Pf(), e.operationId) {
			let t = A.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = G.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = $p(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (a(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, o = Ep.create({
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
			Np.postPayment(o);
			let e = R.getBySource("CUSTOMER_PAYMENT", o.id).filter((e) => !e.reversedJournalEntryId);
			if (e.length !== 1 || e[0].status !== "POSTED") throw Error("Payment GL posting could not be verified uniquely.");
			A.complete(i, o.id);
		} catch (e) {
			try {
				A.flagForReview(i, "Payment or GL posting uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	voidInvoice(e, t) {
		M(), Pf();
		let n = G.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (Ep.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
		if (U.getAllocationsByInvoice(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("This invoice has applied credits. Reverse all active credit allocations before voiding the invoice.");
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
			let t = R.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (t.length !== 1 || t[0].status !== "POSTED") throw Error("Invoice original GL must be uniquely posted before voiding.");
			A.bindResult(o, e), Np.reverseInvoice(a);
			let n = R.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			Bp(G.map((t) => t.id === e ? a : t)), A.complete(o, e);
		} catch (e) {
			try {
				A.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		ql("CUSTOMER_PAYMENT", e), M(), Pf();
		let n = Ep.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = G.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (A.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			A.bindResult(i, e);
			let n = Ep.reverse(e, t);
			Np.reversePayment(n);
			let a = R.getBySource("CUSTOMER_PAYMENT", e).filter((e) => !e.reversedJournalEntryId);
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
		let t = G.find((t) => t.id === e);
		if (!t) throw Error(`Invoice ${e} was not found`);
		if (t.status === "VOID") return t;
		let n = Ep.getReceivedByInvoice(e), r = U.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = $p(n.reduce((e, t) => e + t.amount, 0)), a = $p(r.reduce((e, t) => e + t.amount, 0)), o = $p(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : em(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Bp(G.map((t) => t.id === e ? c : t)), c;
	}
};
function Kp(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function qp(e) {
	return e?.trim() || void 0;
}
function Jp(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Yp(e, t) {
	let n = (/* @__PURE__ */ new Date()).getFullYear(), r = t.reduce((e, t) => {
		let n = t.match(/-(\d+)$/);
		if (!n) return e;
		let r = Number(n[1]);
		return Math.max(e, r);
	}, 0) + 1;
	return `${e}-${n}-${String(r).padStart(4, "0")}`;
}
function Xp() {
	let e = /* @__PURE__ */ new Date();
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
function Zp(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function Qp(e, t) {
	let n = rl(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = il(e, t);
	if (!r) throw Error(`Unit ${t} was not found for ${n.name}`);
	return {
		sku: n.sku,
		description: n.name,
		unitSymbol: r.symbol
	};
}
function $p(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function em(e) {
	return e < tm(/* @__PURE__ */ new Date());
}
function tm(e) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
r("sales", {
	repository: Gp,
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
		quotes: W,
		salesOrders: zp,
		invoices: G
	}),
	restore: (e) => {
		W = e.quotes, zp = e.salesOrders, G = e.invoices, Hp = Wp();
	},
	publish: () => Pp.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var nm = /* @__PURE__ */ new Set(), K = k.read().supplierCredits, q = k.read().supplierCreditAllocations, rm = k.read().supplierCredits, im = k.read().supplierCreditAllocations;
k.onRollback(() => {
	K = k.read().supplierCredits, q = k.read().supplierCreditAllocations, rm = K, im = q;
});
function am() {
	k.update("supplierCredits", K), k.update("supplierCreditAllocations", q), rm = [...K], im = [...q], nm.forEach((e) => k.notify(e));
}
var J = {
	subscribe(e) {
		return nm.add(e), () => {
			nm.delete(e);
		};
	},
	getSnapshot() {
		return rm;
	},
	getAllocationSnapshot() {
		return im;
	},
	getAll() {
		return rm;
	},
	getAllAllocations() {
		return im;
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
		let t = Gd.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (K.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!lm(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, t) => {
			let n = i.get(e.supplierBillLineId);
			if (!n) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(n.id)) throw Error(`${n.description} appears more than once in the supplier credit.`);
			a.add(n.id);
			let r = dm(e.quantity);
			if (!Number.isFinite(r) || r <= 0) throw Error(`${n.description} credit quantity must be greater than zero.`);
			if (r > n.quantity) throw Error(`${n.description} credit quantity cannot exceed the source bill quantity.`);
			let o = um(e.unitCost);
			if (!Number.isFinite(o) || o < 0) throw Error(`${n.description} unit cost cannot be negative.`);
			if (o > n.unitCost) throw Error(`${n.description} credit unit cost cannot exceed the source bill unit cost.`);
			let s = um(r * o), c = um(s * (n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1))), l = um(s + c);
			return {
				id: cm(`supplier-credit-line-${t + 1}`),
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
		}), s = um(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = um(o.reduce((e, t) => e + t.taxAmount, 0)), l = um(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (um(um(K.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > um(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: cm("supplier-credit"),
			creditNumber: sm(e.creditDate),
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
		return K = [d, ...K], am(), Iu.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = K.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = Gd.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!lm(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = um(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: cm("supplier-credit-allocation"),
			allocationNumber: om(e.allocationDate),
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
		Gd.applyCredit(n.id, r);
		let o = um(t.amountApplied + r), s = um(Math.max(0, t.totals.total - (t.amountRefunded ?? 0) - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return q = [a, ...q], K = K.map((e) => e.id === t.id ? c : e), am(), a;
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
		let i = Gd.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		Gd.reverseCredit(i.id, t.amount);
		let o = um(Math.max(0, r.amountApplied - t.amount)), s = um(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - o)), c = {
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
		return K = K.map((e) => e.id === r.id ? c : e), q = q.map((e) => e.id === t.id ? l : e), am(), l;
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
		return K = K.map((e) => e.id === t.id ? i : e), am(), Iu.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!q.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return q = q.map((t) => t.id === e.id ? e : t), am(), e;
	},
	update(e) {
		if (!K.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return K = K.map((t) => t.id === e.id ? e : t), am(), e;
	}
};
function om(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = q.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function sm(e) {
	let t = `SC-${e.slice(0, 4)}-`, n = K.filter((e) => e.creditNumber.startsWith(t)).map((e) => Number.parseInt(e.creditNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function cm(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function lm(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function um(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function dm(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var fm = J.create;
J.create = function(...e) {
	return M(), k.transaction(() => fm.apply(J, e));
};
var pm = J.applyToBill;
J.applyToBill = function(...e) {
	return M(), k.transaction(() => pm.apply(J, e));
};
var mm = J.reverseAllocation;
J.reverseAllocation = function(...e) {
	return M(), k.transaction(() => mm.apply(J, e));
};
var hm = J.voidCredit;
J.voidCredit = function(...e) {
	return M(), k.transaction(() => hm.apply(J, e));
};
var gm = J.update;
J.update = function(...e) {
	return M(), k.transaction(() => gm.apply(J, e));
};
var _m = J.updateAllocation;
J.updateAllocation = function(...e) {
	return M(), k.transaction(() => _m.apply(J, e));
}, r("supplierCredits", {
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
		K = e.supplierCredits, q = e.allocations, rm = [...K], im = [...q];
	},
	publish: () => nm.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/bankRegisterService.ts
function vm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ym(e, t) {
	a(e, t);
}
function bm(e, t, n) {
	ym(e.openingBalanceDate, "Opening balance date"), ym(n, "As-at date");
	let r = t.filter((t) => t.journalDate >= e.openingBalanceDate && t.journalDate <= n).flatMap((t) => t.lines.filter((t) => t.accountId === e.glAccountId).map((e) => ({
		entry: t,
		line: e
	}))).sort((e, t) => {
		let n = e.entry.journalDate.localeCompare(t.entry.journalDate);
		if (n !== 0) return n;
		let r = e.entry.createdAt.localeCompare(t.entry.createdAt);
		return r === 0 ? e.line.id.localeCompare(t.line.id) : r;
	}), i = vm(e.openingBalance), a = 0, o = 0, s = r.map(({ entry: t, line: n }) => {
		let r = vm(n.debit), s = vm(n.credit);
		return a = vm(a + r), o = vm(o + s), i = vm(i + r - s), {
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
		openingBalance: vm(e.openingBalance),
		moneyIn: a,
		moneyOut: o,
		closingBalance: i,
		transactionCount: s.length,
		transactions: s
	};
}
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function xm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Sm(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) {
		if (r.has(t.id)) {
			i = xm(i + t.moneyIn), a = xm(a + t.moneyOut);
			continue;
		}
		o = xm(o + t.moneyIn), s = xm(s + t.moneyOut);
	}
	let c = xm(xm(t) + o - s), l = xm(e.closingBalance), u = xm(c - l);
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
var Cm = /* @__PURE__ */ new Set(), wm = k.read().reconciliations;
k.onRollback(() => {
	wm = k.read().reconciliations;
});
function Tm() {
	k.update("reconciliations", wm), Cm.forEach((e) => k.notify(e));
}
function Em(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Dm(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function Om() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function km(e) {
	return `BREC-${e.slice(0, 4)}-${String(wm.length + 1).padStart(4, "0")}`;
}
function Am(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of wm) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var jm = {
	subscribe(e) {
		return Cm.add(e), () => {
			Cm.delete(e);
		};
	},
	getSnapshot() {
		return wm;
	},
	getAll() {
		return wm;
	},
	getByBankAccount(e) {
		return wm.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return Am(e);
	},
	complete(e) {
		if (Dm(e.statementDate), a(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let t = Cu.requireById(e.bankAccountId);
		if (!t.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < t.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let n = this.getLatestByBankAccount(t.id);
		if (n && e.statementDate <= n.statementDate) throw Error(`Statement date must be after the last reconciled date ${n.statementDate}.`);
		let r = bm(t, R.getAll(), e.statementDate), i = new Set(r.transactions.map((e) => e.id)), o = Am(t.id), s = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !o.has(e));
		for (let e of s) if (!i.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let c = /* @__PURE__ */ new Set([...o, ...s]), l = Sm(r, Em(e.statementBalance), Array.from(c));
		if (!l.reconciled) throw Error(`Bank reconciliation is out by ${l.difference.toFixed(2)}.`);
		let u = {
			id: Om(),
			reconciliationNumber: km(e.statementDate),
			bankAccountId: t.id,
			statementDate: e.statementDate,
			statementBalance: Em(e.statementBalance),
			bookBalance: l.bookBalance,
			outstandingDeposits: l.outstandingDeposits,
			outstandingPayments: l.outstandingPayments,
			adjustedStatementBalance: l.adjustedStatementBalance,
			difference: l.difference,
			clearedTransactionIds: s,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return wm = [u, ...wm], Tm(), u;
	}
}, Mm = jm.complete;
jm.complete = function(e) {
	return M(), k.transaction(() => Mm.call(jm, e));
}, r("bankReconciliations", {
	repository: jm,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: wm }),
	restore: (e) => {
		wm = e.reconciliations;
	},
	publish: () => Cm.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/settlementRepository.ts
var Nm = (e) => Math.round((e + 2 ** -52) * 100) / 100, Y = T().trim().min(1).max(200), Pm = ks().finite().positive().refine((e) => Nm(e) === e, "Use cents precision"), Fm = O({
	operationId: Y,
	customerId: Y,
	paymentDate: Y,
	bankAccountId: Y,
	reference: T().max(500).optional(),
	allocations: D(O({
		invoiceId: Y,
		amount: Pm
	}).strict()).min(1).max(500)
}).strict(), Im = O({
	operationId: Y,
	creditId: Y,
	paymentDate: Y,
	bankAccountId: Y,
	amount: Pm,
	reference: T().max(500).optional()
}).strict(), Lm = [], Rm = [], zm = [], Bm = 0, Vm = /* @__PURE__ */ new Set(), Hm = () => {
	Bm++, Vm.forEach((e) => e());
};
function Um(e, t, n) {
	let r = JSON.stringify(n), i = e.find((e) => e.operationId === t);
	if (i && i.fingerprint !== r) throw Error("Operation ID was already used with different data.");
	return {
		old: i,
		fingerprint: r
	};
}
function Wm(e, t) {
	a(t, "Payment date");
	let n = Cu.requireById(e);
	if (!n.active || t < n.openingBalanceDate) throw Error("Bank is inactive or payment precedes its opening date.");
	let r = L.requireById(n.glAccountId);
	if (!r.active || r.type !== "ASSET") throw Error("Invalid bank ledger account.");
	return n;
}
function Gm(e) {
	if (jm.getAll().some((t) => t.clearedTransactionIds.some((t) => t.startsWith(e + ":")))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Km(e, t) {
	let n = e === "customer" ? U.getById(t) : J.getById(t);
	if (!n || n.status === "VOID" || n.status === "DRAFT") throw Error("An issued credit is required.");
	return n;
}
function qm(e, t, n) {
	let r = Km(e, t), i = Nm(n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0)), a = Nm(r.totals.total - r.amountApplied - i);
	if (a < 0) throw Error("Refund exceeds the unused credit.");
	let o = {
		...r,
		refundEvents: n,
		amountRefunded: i,
		amountAvailable: a,
		status: a === 0 ? "FULLY_APPLIED" : "ISSUED",
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	e === "customer" ? U.update(o) : J.update(o);
}
function Jm(e, t) {
	M();
	let n = Im.parse(t), { old: r, fingerprint: i } = Um(e === "customer" ? Rm : zm, n.operationId, n);
	if (r) return r;
	let a = Km(e, n.creditId), o = Wm(n.bankAccountId, n.paymentDate);
	if (n.paymentDate < a.creditDate || n.amount > a.amountAvailable) throw Error("Refund date/amount exceeds the available credit.");
	let s = L.requireBySystemRole(e === "customer" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"), c = crypto.randomUUID(), l = R.post({
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
	return qm(e, a.id, [...a.refundEvents ?? [], {
		id: u.id,
		date: u.paymentDate,
		amount: u.amount
	}]), e === "customer" ? Rm = [...Rm, u] : zm = [...zm, u], Hm(), u;
}
function Ym(e, t) {
	if (M(), a(t.reversalDate, "Reversal date"), !t.reason?.trim() || t.reason.trim().length < 3) throw Error("Enter a reversal reason.");
	let n = e === "customer" ? Rm : zm, r = n.find((e) => e.id === t.id);
	if (!r) throw Error("Refund was not found.");
	if (r.status === "REVERSED") return r;
	if (t.reversalDate < r.paymentDate) throw Error("Reversal cannot precede the refund.");
	Gm(r.journalEntryId), R.reverse({
		journalEntryId: r.journalEntryId,
		reversalDate: t.reversalDate,
		reason: t.reason
	});
	let i = Km(e, r.creditId);
	qm(e, i.id, (i.refundEvents ?? []).map((e) => e.id === r.id ? {
		...e,
		reversalDate: t.reversalDate
	} : e));
	let o = {
		...r,
		status: "REVERSED",
		reversalDate: t.reversalDate
	};
	return e === "customer" ? Rm = n.map((e) => e.id === r.id ? o : e) : zm = n.map((e) => e.id === r.id ? o : e), Hm(), o;
}
var Xm = {
	recordReceipt(e) {
		let t = Fm.parse(e), { old: n, fingerprint: r } = Um(Lm, t.operationId, t);
		if (n) return n;
		if (Wm(t.bankAccountId, t.paymentDate), new Set(t.allocations.map((e) => e.invoiceId)).size !== t.allocations.length) throw Error("Each invoice may only be allocated once.");
		for (let e of t.allocations) {
			let n = Gp.getAll().find((t) => t.id === e.invoiceId && t.type === "INVOICE");
			if (!n || n.type !== "INVOICE" || n.customerId !== t.customerId || t.paymentDate < n.documentDate || ["VOID", "DRAFT"].includes(n.status) || e.amount > n.amountDue) throw Error("Invalid invoice customer, date or outstanding amount.");
		}
		let i = t.allocations.map((e, n) => Gp.recordInvoicePayment({
			...t,
			invoiceId: e.invoiceId,
			amount: e.amount,
			method: "BANK_TRANSFER",
			operationId: t.operationId + ":" + n
		})), a = {
			...t,
			id: crypto.randomUUID(),
			fingerprint: r,
			amount: Nm(i.reduce((e, t) => e + t.amount, 0)),
			paymentIds: i.map((e) => e.id),
			status: "POSTED"
		};
		return Lm = [...Lm, a], Hm(), a;
	},
	reverseReceipt(e) {
		let t = Lm.find((t) => t.id === e.id);
		if (!t) throw Error("Receipt not found.");
		if (t.status === "REVERSED") return t;
		for (let e of t.paymentIds) {
			let t = Ep.getById(e);
			if (!t || t.status !== "RECEIVED") throw Error("Receipt allocations changed; inspect individual payments first.");
			for (let t of R.getBySource("CUSTOMER_PAYMENT", e)) Gm(t.id);
		}
		for (let n of t.paymentIds) Gp.reverseInvoicePayment(n, e.reason);
		let n = {
			...t,
			status: "REVERSED",
			reversalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		};
		return Lm = Lm.map((e) => e.id === t.id ? n : e), Hm(), n;
	},
	createRefund: (e) => Jm("customer", e),
	reverseRefund: (e) => Ym("customer", e)
}, Zm = {
	create: (e) => Jm("supplier", e),
	reverse: (e) => Ym("supplier", e),
	repairLegacyCredits(e) {
		if (M(), a(e.date, "Repair date"), e.reason?.trim().length < 3) throw Error("Enter a repair reason.");
		let t = [];
		for (let n of J.getAll().filter((e) => e.status !== "VOID")) {
			if (e.date < n.creditDate || R.getBySource("SUPPLIER_CREDIT_RECLASS", n.id).length) continue;
			let r = R.getBySource("SUPPLIER_CREDIT", n.id).find((e) => e.status === "POSTED");
			if (!r) continue;
			let i = L.requireBySystemRole("INVENTORY"), a = L.requireBySystemRole("PURCHASE_PRICE_VARIANCE"), o = Nm(r.lines.filter((e) => e.accountId === i.id).reduce((e, t) => e + t.credit - t.debit, 0));
			o <= 0 || t.push(R.post({
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
}, Qm = O({
	id: Y,
	operationId: Y,
	fingerprint: Y,
	creditId: Y,
	contactId: Y,
	paymentDate: Y,
	bankAccountId: Y,
	amount: Pm,
	journalEntryId: Y,
	status: qs(["POSTED", "REVERSED"]),
	reference: T().optional(),
	reversalDate: T().optional()
}).strict();
r("customerSettlements", {
	repository: Xm,
	read: "sales.read",
	commands: {
		recordReceipt: "sales.payment",
		reverseReceipt: "sales.payment",
		createRefund: "sales.payment",
		reverseRefund: "sales.payment"
	},
	snapshot: () => ({
		receipts: Lm,
		refunds: Rm
	}),
	restore: (e) => {
		Lm = e.receipts, Rm = e.refunds;
	},
	validate: (e, t) => {
		$m(e, t, !1);
		let n = e;
		D(Qm.extend({ fingerprint: T() })).parse(n.refunds), D(O({
			id: Y,
			operationId: Y,
			paymentIds: D(Y),
			amount: Pm,
			status: qs(["POSTED", "REVERSED"])
		}).passthrough()).parse(n.receipts);
	},
	publish: Hm
}), r("supplierRefunds", {
	repository: Zm,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		repairLegacyCredits: "accounting.recover"
	},
	snapshot: () => ({ refunds: zm }),
	restore: (e) => {
		zm = e.refunds;
	},
	validate: (e, t) => {
		$m(e, t, !0), D(Qm.extend({ fingerprint: T() })).parse(e.refunds);
	},
	publish: Hm
});
function $m(e, t, n) {
	let r = e, i = t.journals.journalEntries, a = n ? t.supplierCredits.supplierCredits : t.customerCredits.creditNotes, o = t.bankAccounts.bankAccounts;
	for (let e of r.refunds) {
		let t = a.find((t) => t.id === e.creditId), r = i.find((t) => t.id === e.journalEntryId), s = t?.refundEvents?.find((t) => t.id === e.id);
		if (!t || e.contactId !== ("customerId" in t ? t.customerId : t.supplierId) || !s || s.amount !== e.amount || s.date !== e.paymentDate || s.reversalDate !== e.reversalDate || !o.some((t) => t.id === e.bankAccountId) || !r || r.sourceId !== e.id || r.sourceType !== (n ? "SUPPLIER_REFUND" : "CUSTOMER_REFUND") || r.totalDebit !== e.amount || r.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) throw Error("Refund snapshot relationships are invalid.");
	}
	for (let e of a) {
		let t = Nm(r.refunds.filter((t) => t.creditId === e.id && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
		if ((e.amountRefunded ?? 0) !== t) throw Error("Credit refunded balance is invalid.");
	}
	for (let e of a) for (let t of e.refundEvents ?? []) if (!r.refunds.some((n) => n.id === t.id && n.creditId === e.id)) throw Error("Credit refund history has no settlement record.");
	if (!n) {
		let e = t.customerPayments.payments;
		for (let t of r.receipts ?? []) {
			let n = t.paymentIds.map((t) => e.find((e) => e.id === t));
			if (new Set(t.paymentIds).size !== t.paymentIds.length || !n.length || n.some((e) => !e || e.customerId !== t.customerId || e.bankAccountId !== t.bankAccountId || e.status !== (t.status === "REVERSED" ? "REVERSED" : "RECEIVED")) || Nm(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== t.amount) throw Error("Receipt allocation snapshot relationships are invalid.");
		}
	}
}
//#endregion
//#region src/features/page-previews/catalog.ts
var X = (e, t, n = "text", r, i) => ({
	key: e,
	label: t,
	type: n,
	options: r,
	value: i,
	required: !0
}), Z = (e, t, n) => X(e, t, "select", n), eh = (e, t, n = "0") => ({
	...X(e, t, "number", void 0, n),
	min: 0,
	step: "0.01"
}), th = (e, t) => X(e, t, "date", void 0, "2026-10-16"), nh = (e, t) => ({
	...Z(e, t, [
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
}), rh = [];
function Q(e, t, n, r, i, a, o, s, c) {
	rh.push({
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
Q("products", "Products & services", "Inventory & pricing", "/inventory/products", "inventory.read", "Maintain purchasing, selling, stock and packaging information.", [
	X("sku", "SKU"),
	Z("kind", "Product type", [
		"Stock item",
		"Service",
		"Non-stock item"
	]),
	Z("unit", "Selling unit", [
		"Pack",
		"m²",
		"Bucket",
		"Each"
	]),
	eh("price", "Standard selling price", "49.50"),
	eh("cost", "Buying cost (sample)", "25"),
	eh("coverage", "m² per pack", "2.2"),
	Z("rounding", "Pack rounding", ["Whole packs up", "Allow fractional packs"]),
	eh("reorder", "Reorder point", "10"),
	eh("target", "Target stock", "50"),
	Z("buy", "Available for purchasing", ["Yes", "No"]),
	Z("sell", "Available for selling", ["Yes", "No"]),
	Z("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	X("brand", "Brand"),
	X("category", "Category"),
	X("image", "Image URL (preview only)")
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
]), Q("promotions", "Scheduled promotions", "Inventory & pricing", "/inventory/promotions", "inventory.read", "Plan customer and product specials with explicit start and end times.", [
	X("product", "Product / SKU"),
	X("customer", "Customer scope"),
	X("starts", "Starts (local time)", "datetime-local", void 0, "2026-10-16T09:00"),
	X("ends", "Ends (local time)", "datetime-local", void 0, "2026-10-31T17:00"),
	eh("price", "Promotional unit price", "45"),
	Z("priority", "Priority when rules overlap", [
		"Customer price first",
		"Promotion first",
		"Lowest eligible price"
	]),
	X("timezone", "Time zone", "text", void 0, "Pacific/Auckland")
], {
	name: "October flooring special",
	product: "SAMPLE-OAK",
	customer: "All trade customers"
}, [
	"Overview",
	"Price comparison",
	"History"
]), Q("tax-codes", "Tax codes", "Accounting", "/accounting/tax-codes", "accounting.read", "Review GST codes, inclusive/exclusive calculation and reporting mappings.", [
	X("code", "Tax code"),
	eh("rate", "Tax rate (%)", "15"),
	Z("basis", "Entry basis", ["Exclusive", "Inclusive"]),
	nh("collected", "GST collected account"),
	nh("paid", "GST paid account"),
	X("report", "Return / report mapping")
], {
	name: "Standard GST",
	code: "GST15",
	report: "Output / input GST"
}, [
	"Overview",
	"Calculation preview",
	"Reporting"
]), Q("linked-accounts", "Linked accounts", "Accounting", "/accounting/linked-accounts", "accounting.read", "Preview default general ledger mappings used by each business process.", [
	Z("process", "Business process", [
		"Sales",
		"Purchases",
		"Payroll"
	]),
	nh("receivable", "Receivables / payables control"),
	nh("income", "Income / expense account"),
	nh("inventory", "Inventory account"),
	nh("cogs", "Cost of goods sold"),
	nh("gst", "GST control account"),
	nh("payroll", "Payroll clearing account")
], {
	name: "Sales posting defaults",
	process: "Sales"
}, ["Overview", "Posting example"]), Q("jobs", "Jobs & projects", "Accounting", "/accounting/jobs", "accounting.read", "Track project budgets, assigned contacts and sample profitability.", [
	X("code", "Job code"),
	X("customer", "Customer"),
	X("owner", "Project owner"),
	th("starts", "Start date"),
	th("ends", "End date"),
	eh("budget", "Revenue budget", "10000"),
	eh("costBudget", "Cost budget", "6000")
], {
	name: "Sample showroom installation",
	code: "JOB-SAMPLE",
	customer: "Sample Flooring Ltd",
	owner: "Sample team"
}, [
	"Overview",
	"Transactions",
	"Profitability"
]), Q("bank-accounts", "Bank account setup", "Banking", "/banking/setup/accounts", "banking.read", "Preview bank account details, ledger links and feed preferences.", [
	X("number", "Account number (sample only)"),
	X("bank", "Bank name"),
	Z("currency", "Currency", ["NZD", "AUD"]),
	nh("ledger", "Linked bank GL account"),
	Z("feed", "Feed provider", ["Manual import", "Provider to be configured"]),
	th("feedStart", "Feed start date")
], {
	name: "Sample operating account",
	number: "00-0000-0000000-00",
	bank: "Sample Bank"
}, [
	"Overview",
	"Feed settings",
	"Import history"
]), Q("bank-rules", "Bank rules", "Banking", "/banking/rules", "banking.read", "Define matching conditions and resulting categorisation before testing a sample.", [
	Z("match", "Match mode", ["All conditions", "Any condition"]),
	Z("field", "Transaction field", [
		"Description",
		"Payee",
		"Reference"
	]),
	Z("operator", "Operator", [
		"Contains",
		"Equals",
		"Starts with"
	]),
	X("value", "Match text"),
	nh("account", "Categorise to account"),
	Z("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	Z("enabled", "Enabled", ["Yes", "No"])
], {
	name: "Sample office supplies",
	value: "OFFICE",
	field: "Description"
}, [
	"Overview",
	"Test rule",
	"History"
]), Q("payment-batches", "Electronic payment batches", "Banking", "/banking/payment-batches", "banking.read", "Select sample supplier or wage payments, review approval and bank export layout.", [
	Z("kind", "Batch type", ["Supplier payments", "Wages"]),
	th("payDate", "Payment date"),
	X("bank", "Paying account"),
	X("reference", "Bank reference"),
	Z("format", "Export format", ["NZ bank CSV preview", "ABA layout preview"]),
	eh("total", "Batch total", "1100")
], {
	name: "Sample supplier batch",
	bank: "Sample operating account",
	reference: "OCT-SAMPLE"
}, [
	"Overview",
	"Payments",
	"Approval & export"
]), Q("pay-items", "Pay items", "Payroll", "/payroll/pay-items", "accounting.read", "Configure sample earnings, allowances, deductions, leave, tax and employer contributions.", [
	X("code", "Pay item code"),
	Z("category", "Category", [
		"Earnings",
		"Allowance",
		"Deduction",
		"Leave",
		"Tax",
		"Employer contribution"
	]),
	Z("method", "Calculation method", [
		"Hourly rate",
		"Fixed amount",
		"Percentage"
	]),
	eh("rate", "Rate / amount", "30"),
	Z("taxable", "Tax treatment", [
		"Taxable",
		"Non-taxable",
		"Before tax deduction",
		"After tax deduction"
	]),
	nh("expense", "Expense account"),
	nh("liability", "Liability / clearing account")
], {
	name: "Ordinary hours",
	code: "ORD",
	category: "Earnings"
}, [
	"Overview",
	"Employee assignments",
	"Posting preview"
]), Q("filing", "Payroll filing", "Payroll", "/payroll/filing", "accounting.read", "Review a sample NZ Payday Filing submission and its response / correction workflow.", [
	X("payrun", "Pay run reference"),
	th("payDate", "Pay date"),
	X("employer", "Employer IRD identifier (sample)"),
	Z("type", "Submission type", ["Employment information", "Amendment"]),
	X("contact", "Payroll contact email", "email")
], {
	name: "October employment information",
	payrun: "SAMPLE-RUN-01",
	employer: "000-000-000",
	contact: "payroll@example.invalid"
}, [
	"Overview",
	"Employees & validation",
	"Submission & response"
]), Q("recurring", "Recurring transactions", "Automation & tasks", "/automation/recurring", "accounting.read", "Prepare templates, schedules, generated-item previews and failure recovery.", [
	Z("kind", "Transaction type", [
		"Invoice",
		"Bill",
		"Bank transaction"
	]),
	X("contact", "Customer / supplier"),
	Z("frequency", "Frequency", [
		"Weekly",
		"Fortnightly",
		"Monthly",
		"Quarterly"
	]),
	th("next", "Next generation date"),
	th("ends", "Schedule end date"),
	eh("total", "Template amount", "220"),
	Z("mode", "Generation mode", ["Draft for review", "Require approval"])
], {
	name: "Monthly sample maintenance",
	contact: "Sample Flooring Ltd"
}, [
	"Overview",
	"Template lines",
	"Run history"
]), Q("tasks", "Tasks & action centre", "Automation & tasks", "/tasks", "sales.read", "Review due and overdue work, assign owners and retain preview status history.", [
	X("customer", "Customer / branch"),
	X("owner", "Assigned to"),
	th("due", "Due date"),
	Z("priority", "Priority", [
		"Normal",
		"High",
		"Low"
	]),
	X("notes", "Task instructions", "textarea")
], {
	name: "Follow up showroom quote",
	customer: "Sample Flooring / North branch",
	owner: "Sample sales",
	notes: "Confirm quantities and planned installation date."
}, [
	"Overview",
	"Notes & attachments",
	"Status history"
]), Q("visits", "Sales visits & activity", "Automation & tasks", "/sales/activity", "sales.read", "Inspect sales visits, check-in/out times, outcomes and follow-up tasks.", [
	X("salesperson", "Salesperson"),
	X("customer", "Customer / branch"),
	X("checkin", "Check-in", "datetime-local", void 0, "2026-10-16T09:00"),
	X("checkout", "Check-out", "datetime-local", void 0, "2026-10-16T09:30"),
	X("outcome", "Visit outcome", "textarea"),
	X("location", "Recorded location")
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
]), Q("draft-review", "Customer & contact review", "Automation & tasks", "/contacts/review", "contacts.write", "Review incoming customer/contact drafts, field mapping, duplicates and sync exceptions.", [
	Z("kind", "Draft type", [
		"Customer",
		"Branch",
		"Contact"
	]),
	X("company", "Customer / company"),
	X("branch", "Branch"),
	X("email", "Email", "email"),
	X("phone", "Phone"),
	Z("source", "Source", [
		"Sales draft",
		"Selected phone contact",
		"Business card OCR"
	]),
	Z("decision", "Review decision", [
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
]), Q("templates", "PDF & email templates", "Documents & imports", "/documents/templates", "accounting.read", "Design sample invoice, quote, PO, statement and remittance layouts and email copy.", [
	Z("kind", "Document type", [
		"Invoice",
		"Quotation",
		"Purchase order",
		"Customer statement",
		"Remittance"
	]),
	X("subject", "Email subject"),
	X("body", "Email body", "textarea"),
	X("footer", "PDF footer", "textarea"),
	Z("logo", "Logo position", [
		"Left",
		"Centre",
		"Right"
	]),
	Z("paper", "Paper size", ["A4", "Letter"])
], {
	name: "Standard invoice template",
	subject: "Your document {{number}}",
	body: "Hello {{contact}}, please review the attached {{type}}.",
	footer: "Thank you for your business."
}, [
	"Overview",
	"PDF preview",
	"Email preview"
]), Q("custom-reports", "Saved & favourite reports", "Reports", "/reports/saved", "accounting.read", "Choose datasets, columns and filters, then save a sample report or mark it as a favourite.", [
	Z("dataset", "Dataset", [
		"Sales",
		"Purchases",
		"Payroll",
		"Banking",
		"General ledger"
	]),
	X("columns", "Columns (comma separated)"),
	X("filter", "Filter expression (preview)"),
	Z("basis", "Basis", ["Accrual", "Cash"]),
	Z("favourite", "Favourite", ["Yes", "No"])
], {
	name: "Monthly sales by customer",
	columns: "Customer, Date, Net, GST, Total",
	filter: "Date: current month"
}, ["Overview", "Report preview"]), Q("report-packs", "Report packs", "Reports", "/reports/packs", "accounting.read", "Compose financial reports, order sections and preview a cover and table of contents.", [
	X("company", "Company"),
	X("period", "Reporting period"),
	X("reports", "Included reports (comma separated)"),
	X("cover", "Cover heading"),
	X("introduction", "Cover note", "textarea")
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
var ih = rh;
[...new Set(rh.map((e) => e.group))], Z("gst", "GST registration", ["Registered", "Not registered"]), Z("filing", "GST filing cycle", [
	"Two monthly",
	"Monthly",
	"Six monthly"
]), eh("quoteNext", "Next quote number", "1001"), eh("orderNext", "Next order number", "1001"), eh("invoiceNext", "Next invoice number", "1001"), eh("creditNext", "Next credit number", "1001"), Z("terms", "Default terms", [
	"20th of following month",
	"Due on receipt",
	"30 days"
]), Z("template", "Default template", ["Standard invoice", "Trade invoice"]), Z("reminders", "Overdue reminders", ["Manual only", "7 and 14 days overdue"]), Z("onlinePayment", "Online payment option", ["Disabled", "Configuration preview"]), eh("next", "Next PO number", "1001"), Z("terms", "Default payment terms", [
	"20th of following month",
	"30 days",
	"Due on receipt"
]), nh("expense", "Default expense account"), Z("receipt", "Bill matching", ["Require receipt match", "Allow expense bills"]), Z("remittance", "Remittance preference", ["Preview before sending", "Manual"]), Z("cycle", "Pay cycle", [
	"Weekly",
	"Fortnightly",
	"Monthly"
]), Z("day", "Pay day", [
	"Wednesday",
	"Thursday",
	"Friday"
]), nh("wages", "Wages expense account"), nh("clearing", "Payroll clearing account"), Z("bank", "Paying bank", ["Sample operating account"]), Z("filing", "Filing region", ["New Zealand · Payday Filing", "Australia · STP preview"]), Z("basis", "Default basis", ["Accrual", "Cash"]), Z("currency", "Display currency", ["NZD", "AUD"]), Z("precision", "Decimal places", ["2", "0"]), Z("negative", "Negative number style", ["(1,234.56)", "-1,234.56"]), Z("comparative", "Comparative period", [
	"Previous period",
	"Previous year",
	"None"
]);
//#endregion
//#region src/features/page-previews/previewModel.ts
function ah(e, t) {
	return Object.fromEntries(e.map((e) => [e.key, t?.[e.key] ?? e.value ?? e.options?.[0] ?? ""]));
}
Object.fromEntries(ih.map((e) => [e.id, [{
	...ah(e.fields),
	...e.example,
	id: "sample-1",
	name: e.example.name,
	status: "Draft"
}]]));
function oh(e) {
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
var sh = (e) => Math.round((e + 2 ** -52) * 100) / 100, ch = T().min(1).max(200), lh = [], uh = 0, dh = /* @__PURE__ */ new Set(), fh = () => {
	uh++, dh.forEach((e) => e());
};
function ph(e) {
	let t = Cu.requireById(e);
	if (!t.active) throw Error("Select an active bank account.");
	return t;
}
function mh(e) {
	let t = lh.find((t) => t.id === e);
	if (!t) throw Error("Statement line was not found.");
	return t;
}
function hh(e) {
	if (e.status !== "UNMATCHED") throw Error("This line is already processed. Revert it before changing it.");
	let t = jm.getLatestByBankAccount(e.bankAccountId);
	if (t && e.date <= t.statementDate) throw Error("Statement date is already reconciled.");
}
function gh(e) {
	return lh = lh.map((t) => t.id === e.id ? e : t), fh(), e;
}
var _h = (e, t) => bm(ph(e), R.getAll(), t).transactions, vh = O({
	date: ch,
	description: T().trim().min(1).max(1e3),
	amount: ks().finite().refine((e) => e !== 0 && sh(e) === e, "Enter a non-zero amount in cents"),
	reference: T().max(500).default(""),
	externalId: T().max(200).default("")
}).strict(), yh = {
	importRows(e) {
		let t = O({
			bankAccountId: ch,
			rows: D(vh).min(1).max(1e4)
		}).strict().parse(e), n = ph(t.bankAccountId), r = 0, i = [...lh], o = [];
		for (let e of t.rows) {
			if (a(e.date, "Statement date"), e.date < n.openingBalanceDate) throw Error("Statement predates the bank opening date.");
			let t = JSON.stringify([n.id, e.externalId || [
				e.date,
				e.amount,
				e.description.trim().toLowerCase(),
				e.reference.trim().toLowerCase()
			]]), s = i.find((e) => e.key === t);
			if (s) {
				if (e.externalId && (s.amount !== e.amount || s.date !== e.date || s.description !== e.description || s.reference !== e.reference)) throw Error("Bank transaction ID conflicts with an existing row.");
				r++;
				continue;
			}
			let c = jm.getLatestByBankAccount(n.id);
			if (c && e.date <= c.statementDate) throw Error("Cannot import new rows into a reconciled statement period.");
			let l = {
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
			i.push(l), o.push(l);
		}
		return lh = i, fh(), {
			created: o.length,
			duplicates: r
		};
	},
	importCsv(e) {
		if (typeof e.csv != "string" || e.csv.length > 1e7) throw Error("CSV exceeds the 10 MB limit.");
		let t = oh(e.csv.replace(/^\uFEFF/, "")), n = t.shift()?.map((e) => e.trim().toLowerCase()) ?? [];
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
		return yh.importRows({
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
					l = sh(t - e);
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
		return a(e.asOfDate, "As-of date"), _h(e.bankAccountId, e.asOfDate).filter((e) => e.journalStatus === "POSTED" && !lh.some((t) => t.ledgerIds.includes(e.id)));
	},
	match(e) {
		let t = mh(e.id);
		if (hh(t), !Array.isArray(e.ledgerIds) || !e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Select unique ledger entries.");
		let n = yh.candidates({
			bankAccountId: t.bankAccountId,
			asOfDate: t.date
		}), r = e.ledgerIds.map((e) => n.find((t) => t.id === e));
		if (r.some((e) => !e) || sh(r.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== t.amount) throw Error("Selected bank entries must match this signed statement amount exactly.");
		return gh({
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
		let t = mh(e.id);
		return (N["bank-rules"] ?? []).filter((e) => e.status === "Active" && e.enabled !== "No").filter((e) => {
			let n = (e.field === "Reference" ? t.reference : e.field === "Description" ? t.description : "").toLowerCase(), r = e.value.toLowerCase();
			return e.operator === "Equals" ? n === r : e.operator === "Starts with" ? n.startsWith(r) : n.includes(r);
		});
	},
	post(e) {
		M();
		let t = mh(e.id), n = JSON.stringify(e.splits);
		if (t.status === "POSTED") {
			if (t.fingerprint !== n) throw Error("Line was already posted with different categorisation.");
			return t;
		}
		hh(t);
		let r = D(O({
			accountId: ch,
			amount: ks().finite().positive().refine((e) => sh(e) === e),
			taxCode: ch
		}).strict()).min(1).max(100).parse(e.splits);
		if (sh(r.reduce((e, t) => e + t.amount, 0)) !== Math.abs(t.amount)) throw Error("Split amounts must equal the statement total.");
		let i = ph(t.bankAccountId), a = t.amount < 0, o = r.flatMap((e) => {
			let t = L.requireById(e.accountId);
			if (!t.active || !t.allowManualPosting || !["EXPENSE", "REVENUE"].includes(t.type)) throw Error("Use an active manual expense/revenue account. Payments against AR/AP must be matched to their source documents.");
			let n = sl(e.taxCode), r = sh(e.amount / (1 + n)), i = sh(e.amount - r);
			return [{
				accountId: t.id,
				debit: a ? r : 0,
				credit: a ? 0 : r
			}, ...i ? [{
				accountId: L.requireBySystemRole(a ? "GST_RECEIVABLE" : "GST_PAYABLE").id,
				debit: a ? i : 0,
				credit: a ? 0 : i
			}] : []];
		}), s = R.post({
			journalDate: t.date,
			description: t.description,
			reference: t.reference,
			sourceType: "BANK_STATEMENT",
			sourceId: t.id + ":" + t.history.filter((e) => e.action === "Posted").length,
			lines: [{
				accountId: i.glAccountId,
				debit: a ? 0 : t.amount,
				credit: a ? -t.amount : 0
			}, ...o]
		}), c = s.lines.filter((e) => e.accountId === i.glAccountId).map((e) => s.id + ":" + e.id);
		return gh({
			...t,
			status: "POSTED",
			journalEntryId: s.id,
			ledgerIds: c,
			fingerprint: n,
			history: [...t.history, {
				action: "Posted",
				date: (/* @__PURE__ */ new Date()).toISOString()
			}]
		});
	},
	ignore(e) {
		let t = mh(e.id);
		if (hh(t), e.reason?.trim().length < 3) throw Error("Enter an exclusion reason.");
		return gh({
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
		let t = mh(e.id);
		if (a(e.reversalDate, "Reversal date"), e.reason?.trim().length < 3 || e.reversalDate < t.date) throw Error("Enter a reason and a reversal date on or after the statement line.");
		if (t.status === "UNMATCHED") throw Error("Line is already unmatched.");
		for (let e of t.ledgerIds) Gm(e.split(":")[0]);
		let n = jm.getLatestByBankAccount(t.bankAccountId);
		if (n && t.date <= n.statementDate) throw Error("Reconciled statement lines cannot be reverted.");
		return t.status === "POSTED" && t.journalEntryId && R.reverse({
			journalEntryId: t.journalEntryId,
			reversalDate: e.reversalDate,
			reason: e.reason
		}), gh({
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
		if (iu(e.statementDate), M(), a(e.statementDate, "Statement date"), !lh.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate)) throw Error("Import the statement first.");
		if (lh.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate && t.status === "UNMATCHED")) throw Error("Process every statement line before completing reconciliation.");
		let t = lh.filter((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate).flatMap((e) => e.ledgerIds);
		return jm.complete({
			...e,
			clearedTransactionIds: [.../* @__PURE__ */ new Set([...jm.getClearedTransactionIds(e.bankAccountId), ...t])]
		});
	}
}, bh = O({
	id: ch,
	key: T(),
	bankAccountId: ch,
	date: ch,
	description: T(),
	reference: T(),
	amount: ks().finite(),
	externalId: T(),
	status: qs([
		"UNMATCHED",
		"MATCHED",
		"POSTED",
		"IGNORED"
	]),
	ledgerIds: D(ch),
	journalEntryId: T().optional(),
	fingerprint: T().optional(),
	history: D(O({
		action: T(),
		date: T(),
		reason: T().optional()
	}))
}).strict();
r("bankStatements", {
	repository: yh,
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
	snapshot: () => ({ lines: lh }),
	restore: (e) => {
		lh = e.lines;
	},
	validate: (e) => {
		D(bh).parse(e.lines);
	},
	publish: fh
});
//#endregion
//#region src/features/business-workspace/productRepository.ts
var xh = O({
	id: T().min(1),
	code: qs([
		"M2",
		"LM",
		"BOX",
		"PIECE",
		"ROLL",
		"BUCKET"
	]),
	name: T().trim().min(1),
	symbol: T().min(1),
	conversionToBase: ks().finite().positive(),
	basePrice: ks().finite().nonnegative(),
	isBaseUnit: Ns(),
	active: Ns()
}).strict(), Sh = O({
	id: T().min(1),
	sku: T().trim().min(1).max(80),
	name: T().trim().min(1).max(180),
	category: qs([
		"Timber",
		"Hybrid",
		"Laminate",
		"Vinyl",
		"Carpet",
		"Accessories",
		"Other"
	]),
	brand: T().optional(),
	collection: T().optional(),
	description: T().optional(),
	status: qs(["ACTIVE", "INACTIVE"]),
	baseUnitId: T().min(1),
	units: D(xh).min(1),
	createdAt: T(),
	updatedAt: T(),
	revision: ks().int().nonnegative().optional(),
	itemType: qs([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	buyEnabled: Ns().optional(),
	sellEnabled: Ns().optional(),
	reorderPoint: ks().finite().nonnegative().optional(),
	targetStock: ks().finite().nonnegative().optional(),
	wholePacks: Ns().optional(),
	taxCode: T().min(1).optional()
}).strict(), Ch = /* @__PURE__ */ new Set(), wh = [...nl];
function Th() {
	wh = [...nl], Ch.forEach((e) => e());
}
function Eh(e, t, n) {
	if (Array.isArray(e)) return e.some((e) => Eh(e, t, n));
	if (!e || typeof e != "object") return !1;
	let r = e;
	return r.productId === t && (!n || r.unitId === n) || Object.values(r).some((e) => Eh(e, t, n));
}
function Dh(e) {
	let t = D(Sh).parse(e), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.id) || r.has(e.sku.toLowerCase())) throw Error("Duplicate product ID or SKU.");
		if (n.add(e.id), r.add(e.sku.toLowerCase()), new Set(e.units.map((e) => e.id)).size !== e.units.length || e.units.filter((e) => e.isBaseUnit).length !== 1 || !e.units.some((t) => t.id === e.baseUnitId && t.isBaseUnit && t.conversionToBase === 1)) throw Error("A product needs exactly one valid base unit.");
		if ((e.targetStock ?? 0) < (e.reorderPoint ?? 0)) throw Error("Target stock must be at least the reorder point.");
	}
	return t;
}
r("products", {
	validate: (e, t) => {
		let n = Dh(e.products), r = t.workspace_tax_codes.records;
		if (n.some((e) => !r.some((t) => t.code === (e.taxCode ?? "GST")))) throw Error("Backup product tax-code reference is invalid.");
	},
	repository: {
		subscribe(e) {
			return Ch.add(e), () => {
				Ch.delete(e);
			};
		},
		getSnapshot: () => wh,
		getAll: () => nl,
		getById: (e) => nl.find((t) => t.id === e),
		save(e, t) {
			let n = Sh.parse(e), r = nl.find((e) => e.id === n.id);
			if (r && t !== (r.revision ?? 0)) throw Error("Product changed since it was opened. Reload before saving.");
			if (!r && t !== void 0) throw Error("Product no longer exists.");
			if (sl(n.taxCode ?? "GST"), n.itemType && n.itemType !== "STOCK") throw Error("Only stocked products are supported by the current fulfilment workflow.");
			let i = s();
			if (delete i.products, r) {
				if (r.baseUnitId !== n.baseUnitId && Eh(i, n.id)) throw Error("A referenced product cannot change base unit.");
				for (let e of r.units) {
					let t = n.units.find((t) => t.id === e.id);
					if ((!t || t.conversionToBase !== e.conversionToBase || t.code !== e.code) && Eh(i, n.id, e.id)) throw Error("A referenced unit conversion cannot be changed or removed. Add a new unit instead.");
				}
			}
			let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
				...n,
				createdAt: r?.createdAt ?? a,
				updatedAt: a,
				revision: (r?.revision ?? 0) + 1
			};
			return Dh([...nl.filter((e) => e.id !== n.id), o]), r ? nl.splice(nl.indexOf(r), 1, o) : nl.push(o), id.ensureProductPolicy(o.id, o.baseUnitId, o.itemType !== "SERVICE" && o.itemType !== "NON_STOCK"), Th(), o;
		}
	},
	read: "inventory.read",
	commands: { save: "inventory.adjust" },
	snapshot: () => ({ products: structuredClone(nl) }),
	restore: (e) => {
		let t = Dh(e.products);
		nl.splice(0, nl.length, ...t), wh = [...nl];
	},
	publish: Th
});
//#endregion
//#region src/features/contacts/data/mockCustomers.ts
var Oh = [
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
], kh = "htt.mock.contacts.customers.v1";
function Ah(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var jh = Sc(kh, Ah), Mh = jh.status !== "invalid" && wc(kh), Nh = /* @__PURE__ */ new Set(), Ph = jh.status === "ok" ? jh.data : structuredClone(Oh);
function Fh() {
	Mh && Cc(kh, Ph), Nh.forEach((e) => {
		e();
	});
}
function Ih(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Lh() {
	let e = Ph.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function $(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function Rh(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function zh(e, t) {
	let n = !1;
	if (Ph = Ph.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	Fh();
}
var Bh = {
	subscribe(e) {
		return Nh.add(e), () => {
			Nh.delete(e);
		};
	},
	getSnapshot() {
		return Ph;
	},
	getAll() {
		return Ph;
	},
	getById(e) {
		return Ph.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: Ih("cus"),
			code: Lh(),
			businessName: e.businessName.trim(),
			tradingName: $(e.tradingName),
			abn: Rh(e.abn),
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
		return Ph = [n, ...Ph], Fh(), n;
	},
	update(e, t) {
		let n;
		if (zh(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: $(t.tradingName),
			abn: Rh(t.abn),
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
		let n = Bh.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: Ih("loc"),
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
		return zh(e, (e) => ({
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
		let r = Bh.getById(e);
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
		return zh(e, (e) => ({
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
		let n = Bh.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: Ih("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: $(t.jobTitle),
			email: t.email.trim(),
			phone: $(t.phone),
			mobile: $(t.mobile),
			locationId: $(t.locationId),
			isPrimary: r
		};
		return zh(e, (e) => ({
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
		let r = Bh.getById(e);
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
		return zh(e, (e) => ({
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
r("customers", {
	repository: Bh,
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
	snapshot: () => ({ customers: Ph }),
	restore: (e) => {
		Ph = e.customers;
	},
	publish: () => Nh.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/workspaceRepository.ts
var Vh = Gs(T(), T().max(2e4)), Hh = [
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
], Uh = () => (/* @__PURE__ */ new Date()).toISOString(), Wh = {
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
		read: "accounting.read",
		write: "accounting.post",
		required: ["section"],
		fields: [
			"section",
			"companyName",
			"currency",
			"timezone",
			"yearEnd",
			"gstCode",
			"quotePrefix",
			"orderPrefix",
			"invoicePrefix",
			"creditPrefix",
			"purchasePrefix",
			"terms",
			"sender",
			"payCycle",
			"payDay",
			"filingRegion",
			"basis",
			"precision",
			"header",
			"logo",
			"nextQuote",
			"nextOrder",
			"nextInvoice",
			"nextCredit",
			"nextPurchase"
		]
	}
}, Gh = /* @__PURE__ */ new Set(), Kh = 0, qh = () => {
	Kh++, Gh.forEach((e) => e());
}, Jh = Object.fromEntries(Object.keys(Wh).map((e) => [e, []]));
for (let e of Object.keys(Wh)) N[e] = [];
var Yh = () => ({
	collected: L.getAll().find((e) => e.systemRole === "GST_PAYABLE")?.id ?? "",
	paid: L.getAll().find((e) => e.systemRole === "GST_RECEIVABLE")?.id ?? ""
});
N["tax-codes"] = [{
	id: "tax-gst",
	name: "GST",
	status: "Active",
	revision: "1",
	createdAt: Uh(),
	updatedAt: Uh(),
	code: "GST",
	rate: "10",
	basis: "Exclusive",
	report: "GST",
	...Yh()
}, {
	id: "tax-zero",
	name: "Zero rated",
	status: "Active",
	revision: "1",
	createdAt: Uh(),
	updatedAt: Uh(),
	code: "ZERO",
	rate: "0",
	basis: "Exclusive",
	report: "Zero rated",
	...Yh()
}];
function Xh(e, t) {
	if (!e?.trim()) throw Error(`${t} is required.`);
}
function Zh(e, t) {
	if (!e?.trim() || !Number.isFinite(Number(e)) || Number(e) < 0) throw Error(`${t} must be a non-negative number.`);
}
function Qh(e, t) {
	let n = L.getAll().find((t) => t.id === e);
	if (!n?.active || t && n.type !== t) throw Error("Select an active account of the correct type.");
	return n;
}
function $h(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && (/* @__PURE__ */ new Date(e + "T00:00:00Z")).toISOString().slice(0, 10) === e;
}
function eg(e, t, n, r = !0) {
	let i = Wh[e];
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
	Xh(t.name, "Name");
	for (let e of i.required) Xh(t[e], e);
	if (![
		"Active",
		"Inactive",
		"Open",
		"In progress",
		"Completed"
	].includes(t.status ?? "Active")) throw Error("Invalid business status.");
	if (e === "tax-codes") {
		if (Zh(t.rate, "Tax rate"), t.basis && t.basis !== "Exclusive") throw Error("Only tax-exclusive document entry is supported.");
		if (Number(t.rate) > 100) throw Error("Tax rate cannot exceed 100%.");
		if (r && (Qh(t.collected, "LIABILITY"), Qh(t.paid, "ASSET"), t.collected !== L.requireBySystemRole("GST_PAYABLE").id || t.paid !== L.requireBySystemRole("GST_RECEIVABLE").id)) throw Error("Tax codes use the global GST posting accounts. Change the unused linked accounts first.");
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Tax code must be unique.");
		if (!/^[A-Z0-9_-]{1,24}$/.test(t.code)) throw Error("Use uppercase letters/numbers for a tax code.");
	}
	if (e === "linked-accounts" && r) {
		let e = L.requireBySystemRole(t.role), n = t.status === "Inactive" ? L.getAll().find((e) => e.systemRole === t.role)?.id : t.accountId, r = s().journals?.journalEntries ?? [];
		if (n !== e.id && r.some((t) => t.lines.some((t) => t.accountId === e.id || t.accountId === n))) throw Error("A used posting account cannot be remapped without a ledger migration.");
	}
	if (e === "linked-accounts") {
		if (!Hh.includes(t.role)) throw Error("Unknown account role.");
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
		if (r && Qh(t.accountId, e), n.some((e) => e.id !== t.id && e.role === t.role)) throw Error("A linked account role may only have one mapping.");
	}
	if (e === "promotions") {
		let e = rl(t.productId);
		if (r && (!e || !il(e.id, t.unitId))) throw Error("Product/unit not found.");
		if (Zh(t.price, "Price"), !Number.isInteger(Number(t.priority))) throw Error("Priority must be an integer.");
		if (![
			"Customer price first",
			"Promotion first",
			"Lowest eligible price"
		].includes(t.policy)) throw Error("Invalid price conflict policy.");
		if (!/([+-]\d\d:\d\d|Z)$/.test(t.starts) || !Number.isFinite(Date.parse(t.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(t.ends) || !Number.isFinite(Date.parse(t.ends)) || Date.parse(t.ends) <= Date.parse(t.starts)) throw Error("Promotion requires explicit time offsets and an end after start.");
	}
	if (r && t.customerId && !Bh.getById(t.customerId)) throw Error("Customer was not found.");
	if (e === "jobs") {
		if (Zh(t.budget, "Revenue budget"), Zh(t.costBudget, "Cost budget"), !$h(t.starts) || !$h(t.ends) || t.ends < t.starts) throw Error("Invalid project dates.");
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Job code must be unique.");
	}
	if (e === "tasks" && (!$h(t.due) || ![
		"Low",
		"Normal",
		"High"
	].includes(t.priority))) throw Error("Invalid due date or priority.");
	if (e === "bank-rules") {
		if (r && Qh(t.accountId), ![
			"Description",
			"Payee",
			"Reference"
		].includes(t.field) || ![
			"Contains",
			"Equals",
			"Starts with"
		].includes(t.operator)) throw Error("Invalid bank condition.");
		if (r && !N["tax-codes"].some((e) => e.status === "Active" && e.code === t.taxCode)) throw Error("Active tax code not found.");
	}
	if (e === "report-packs" && (!$h(t.periodStart) || !$h(t.periodEnd) || t.periodEnd < t.periodStart)) throw Error("Invalid report period.");
	if (e === "settings") {
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
			"nextPurchase"
		]) if (t[e] && (!/^\d+$/.test(t[e]) || Number(t[e]) < 1)) throw Error("Next document numbers must be positive integers.");
	}
}
function tg(e, t, n) {
	Jh[e].push({
		id: crypto.randomUUID(),
		name: n,
		status: "Active",
		revision: "1",
		createdAt: Uh(),
		updatedAt: Uh(),
		recordId: t.id,
		actorId: vc.current()?.userId ?? "local-test",
		after: JSON.stringify(t)
	});
}
Object.fromEntries(Object.keys(Wh).map((e) => {
	let t = {
		getAll: () => N[e],
		getById: (t) => N[e].find((e) => e.id === t),
		save(t, n) {
			let r = Vh.parse(t), i = N[e].find((e) => e.id === r.id);
			if (i && i.revision !== n) throw Error("Record changed. Reload before saving.");
			if (!i && n !== void 0) throw Error("Record no longer exists.");
			let a = Uh(), o = {
				...r,
				id: i?.id ?? crypto.randomUUID(),
				name: r.name.trim(),
				status: r.status ?? "Active",
				revision: String(Number(i?.revision ?? "0") + 1),
				createdAt: i?.createdAt ?? a,
				updatedAt: a
			};
			return e === "tasks" && o.status === "Completed" && (o.completedAt = i?.completedAt ?? a, o.completedBy = i?.completedBy ?? vc.current()?.userId ?? "local-test"), eg(e, o, N[e]), N[e] = [...N[e].filter((e) => e.id !== o.id), o], tg(e, o, i ? "Updated" : "Created"), qh(), o;
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
			tg(e, {
				...i,
				note: r.trim()
			}, "Note added"), qh();
		}
	};
	return r("workspace_" + e.replaceAll("-", "_"), {
		validate: (t, n) => {
			ng(e, t), rg(e, t, n);
		},
		repository: t,
		read: Wh[e].read,
		commands: {
			save: Wh[e].write,
			setStatus: Wh[e].write,
			addNote: e === "tasks" ? "sales.write" : null
		},
		snapshot: () => ({
			records: N[e],
			history: Jh[e]
		}),
		restore: (t) => {
			ng(e, t), N[e] = t.records, Jh[e] = t.history;
		},
		publish: qh
	}), [e, t];
}));
function ng(e, t) {
	let n = O({
		records: D(Vh),
		history: D(Vh)
	}).strict().parse(t), r = /* @__PURE__ */ new Set();
	for (let t of n.records) {
		if (!t.id || r.has(t.id) || !/^\d+$/.test(t.revision)) throw Error("Invalid workspace record identity.");
		r.add(t.id), eg(e, t, n.records, !1);
	}
	return n;
}
function rg(e, t, n) {
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
function ig(e) {
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
var ag = /* @__PURE__ */ new Set(), og = k.read().transactions, sg = k.read().transfers;
k.onRollback(() => {
	let e = k.read();
	og = e.transactions, sg = e.transfers;
});
function cg() {
	ag.forEach((e) => k.notify(e));
}
function lg(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function ug(e) {
	return e?.trim() || void 0;
}
function dg(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function fg(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function pg(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function mg(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var hg = {
	subscribe(e) {
		return ag.add(e), () => {
			ag.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return og;
	},
	getTransfersSnapshot() {
		return sg;
	},
	getTransactions() {
		return og;
	},
	getTransfers() {
		return sg;
	},
	createTransaction(e, t) {
		if (dg(e.transactionDate), a(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = fg(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = lg(e.description, "Description"), i = Cu.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let o = L.requireById(i.glAccountId);
		if (!o.active) throw Error("The selected bank GL account is inactive.");
		let s = L.requireById(e.offsetAccountId);
		if (!s.active) throw Error("The offset account is inactive.");
		if (!s.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (s.id === o.id) throw Error("Bank and offset accounts must be different.");
		if (Cu.getByGlAccountId(s.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let c = pg("banktxn"), l = mg("BTXN", e.transactionDate, og.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = A.begin(u, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = og.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			u && A.bindResult(u, c);
			let t = R.post({
				journalDate: e.transactionDate,
				description: r,
				reference: ug(e.reference),
				sourceType: "BANK_TRANSACTION",
				sourceId: c,
				lines: e.direction === "MONEY_IN" ? [{
					accountId: o.id,
					description: r,
					debit: n,
					credit: 0
				}, {
					accountId: s.id,
					description: r,
					debit: 0,
					credit: n
				}] : [{
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
			}), a = {
				id: c,
				transactionNumber: l,
				bankAccountId: i.id,
				transactionDate: e.transactionDate,
				direction: e.direction,
				amount: n,
				offsetAccountId: s.id,
				description: r,
				reference: ug(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [a, ...og];
			if (k.update("transactions", d), og = d, cg(), u) {
				let e = R.getBySource("BANK_TRANSACTION", c);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Bank GL posting could not be verified uniquely.");
			}
			return a;
		} catch (e) {
			if (u) try {
				A.flagForReview(u, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	},
	createTransfer(e, t) {
		dg(e.transferDate), a(e.transferDate, "Transfer date");
		let n = fg(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = lg(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = Cu.requireById(e.fromBankAccountId), o = Cu.requireById(e.toBankAccountId);
		if (!i.active || !o.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== o.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < o.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let s = L.requireById(i.glAccountId), c = L.requireById(o.glAccountId);
		if (!s.active || !c.active) throw Error("Both bank GL accounts must be active.");
		if (s.id === c.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let l = pg("banktrf"), u = mg("BTRF", e.transferDate, sg.length + 1), d = t?.trim();
		if (t !== void 0 && !d) throw Error("Operation ID cannot be empty");
		if (d) {
			let t = A.begin(d, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = sg.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			d && A.bindResult(d, l);
			let t = R.post({
				journalDate: e.transferDate,
				description: r,
				reference: ug(e.reference),
				sourceType: "BANK_TRANSFER",
				sourceId: l,
				lines: [{
					accountId: c.id,
					description: r,
					debit: n,
					credit: 0
				}, {
					accountId: s.id,
					description: r,
					debit: 0,
					credit: n
				}]
			}), a = {
				id: l,
				transferNumber: u,
				fromBankAccountId: i.id,
				toBankAccountId: o.id,
				transferDate: e.transferDate,
				amount: n,
				description: r,
				reference: ug(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [a, ...sg];
			if (k.update("transfers", f), sg = f, cg(), d) {
				let e = R.getBySource("BANK_TRANSFER", l);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Transfer GL posting could not be verified uniquely.");
			}
			return a;
		} catch (e) {
			if (d) try {
				A.flagForReview(d, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	}
}, gg = hg.createTransaction;
hg.createTransaction = function(e, t) {
	M();
	let n;
	try {
		return n = k.transaction(() => gg.call(hg, e, t)), t && A.complete(t.trim(), n.id), n;
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
var _g = hg.createTransfer;
hg.createTransfer = function(e, t) {
	M();
	let n;
	try {
		return n = k.transaction(() => _g.call(hg, e, t)), t && A.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = A.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				A.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
}, r("bankTransactions", {
	repository: hg,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: og,
		bankTransfers: sg
	}),
	restore: (e) => {
		og = e.bankTransactions, sg = e.bankTransfers;
	},
	publish: () => ag.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function vg() {
	return ig({
		transactions: hg.getTransactions(),
		transfers: hg.getTransfers(),
		payments: Ep.getAll(),
		journals: R.getAll(),
		invoices: Gp.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: U.getAll(),
		supplierBills: Gd.getAll(),
		supplierPayments: Zd.getAll(),
		supplierCredits: J.getAll()
	});
}
//#endregion
//#region src/features/sales/data/invoiceBalanceAsAtService.ts
function yg(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= Sg(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: Cg(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => bg(e, r)), a = Cg(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && xg(t, r)), s = Cg(o.reduce((e, t) => e + t.amount, 0)), c = Cg(e.totals.total), l = Cg(Math.max(0, c - a - s));
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
function bg(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Sg(e.reversedAt) : !1;
}
function xg(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Sg(e.reversedAt) : !1;
}
function Sg(e) {
	return n(e);
}
function Cg(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function wg(e, t, n) {
	let r = Dg(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= Eg(e.voidedAt)) return Tg(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && xg(t, n)), a = Dg(i.reduce((e, t) => e + t.amount, 0)), o = Dg(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - a));
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
function Tg(e, t, n) {
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
function Eg(e) {
	return n(e);
}
function Dg(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function Og(e, t, n = [], r = [], i = [], a = jg()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = yg(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = kg(e.dueDate, a);
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
		current: Mg(s.current),
		days1To30: Mg(s.days1To30),
		days31To60: Mg(s.days31To60),
		days61To90: Mg(s.days61To90),
		days90Plus: Mg(s.days90Plus)
	}, p = Mg(c), m = Mg(l), ee = Mg(i.reduce((t, n) => n.customerId === e.id ? t + wg(n, r, a).amountAvailable : t, 0)), te = Mg(p - ee);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: ee,
		netAccountBalance: te,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: Mg(Math.max(0, e.creditLimit - Math.max(0, te))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function kg(e, t = jg()) {
	let n = Ag(e), r = Ag(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Ag(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function jg() {
	let e = /* @__PURE__ */ new Date();
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
function Mg(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function Ng(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Pg(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function Fg(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? Ng(t - n) : Ng(n - t);
}
function Ig(e, t, n) {
	Pg(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = Ng(t + r.debit), n = Ng(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: Fg(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = Ng(r.reduce((e, t) => e + t.totalDebit, 0)), o = Ng(r.reduce((e, t) => e + t.totalCredit, 0));
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
function Lg(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Rg({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = Og(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: Lg(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = Lg(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = Lg(Ig(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = Lg(l - d);
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
function zg(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && Bg(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = Vg(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && Bg(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = Vg(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && Bg(n.reversedAt) <= r ? t : t + n.amount, 0)), o = Vg(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: Vg(Math.max(0, o - i - a))
	};
}
function Bg(e) {
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) return e.slice(0, 10);
	let n = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Pacific/Auckland",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(t), r = n.find((e) => e.type === "year")?.value, i = n.find((e) => e.type === "month")?.value, a = n.find((e) => e.type === "day")?.value;
	return !r || !i || !a ? e.slice(0, 10) : `${r}-${i}-${a}`;
}
function Vg(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function Hg(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && Ug(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = Wg(e.totals.total), i = Wg(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && Ug(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: Wg(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - i))
	};
}
function Ug(e) {
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) return e.slice(0, 10);
	let n = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Pacific/Auckland",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(t), r = n.find((e) => e.type === "year")?.value, i = n.find((e) => e.type === "month")?.value, a = n.find((e) => e.type === "day")?.value;
	return !r || !i || !a ? e.slice(0, 10) : `${r}-${i}-${a}`;
}
function Wg(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function Gg(e, t, n = [], r = [], i = [], a = Qg()) {
	let o = Jg(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = zg(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = qg(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = Zg(r.reduce((t, n) => n.supplierId === e.id ? t + Hg(n, i, a).amountAvailable : t, 0)), p = Zg(s), m = Zg(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: Zg(c),
		aging: Yg(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function Kg(e, t, n = [], r = [], i = [], a = Qg()) {
	let o = Jg(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let ee of e) {
		let e = Gg(ee, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: Zg(s),
		unallocatedCredit: Zg(c),
		totalOutstanding: Zg(l),
		overdueAmount: Zg(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: Yg(o)
	};
}
function qg(e, t = Qg()) {
	let n = Xg(e), r = Xg(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Jg() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function Yg(e) {
	return {
		current: Zg(e.current),
		days1To30: Zg(e.days1To30),
		days31To60: Zg(e.days31To60),
		days61To90: Zg(e.days61To90),
		days90Plus: Zg(e.days90Plus)
	};
}
function Xg(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function Zg(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Qg() {
	let e = /* @__PURE__ */ new Date();
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function $g(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function e_({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = Kg(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = $g(Ig(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = $g(c.totalOutstanding), f = $g(d - u);
	return {
		asOfDate: s,
		grossOutstanding: $g(c.grossOutstanding),
		unallocatedCredit: $g(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function t_(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function n_(e) {
	return e.slice(0, 10);
}
function r_(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function i_(e, t) {
	t_(t);
	let n = e.filter((e) => n_(e.occurredAt) <= t).slice().sort(r_), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = B(n.quantityOnHand + e.quantityBase), a = Tu(n.inventoryValue + e.valueChange);
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
		let t = Ru.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = rl(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : wu(e.inventoryValue / e.quantityOnHand);
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
		totalQuantity: B(i.reduce((e, t) => e + t.quantityOnHand, 0)),
		totalInventoryValue: Tu(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function a_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function o_(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function s_({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	o_(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = i_(n, r), o = a_(Ig(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = a_(a.totalInventoryValue), c = a_(s - o);
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
//#region electron/security/periodCloseChecks.ts
function c_(e) {
	let t = s(), r = [], i = (e, t) => r.push({
		code: e,
		message: t
	});
	e.endDate >= n((/* @__PURE__ */ new Date()).toISOString()) && i("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of A.getUnresolved()) i("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of t.purchaseOperations) e.status !== "POSTED" && i("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of vg()) i(e.code, `${e.entityId}: ${e.message}`);
	let a = {
		accounts: t.accounts.accounts,
		journalEntries: t.journals.journalEntries,
		asOfDate: e.endDate
	}, o = [
		["AR", () => Rg({
			...a,
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
		["AP", () => e_({
			...a,
			suppliers: t.suppliers.suppliers,
			bills: t.supplierBills.supplierBills,
			payments: t.supplierPayments.supplierPayments,
			credits: t.supplierCredits.supplierCredits,
			creditAllocations: t.supplierCredits.allocations
		})],
		["INVENTORY", () => s_({
			...a,
			costMovements: t.costMovements.movements
		})]
	];
	for (let [t, n] of o) try {
		let r = n();
		(!r.reconciled || !Number.isFinite(r.difference)) && i(`${t}_DIFFERENCE`, `${t} to GL difference at ${e.endDate}: ${r.difference}.`);
	} catch (e) {
		i(`${t}_CHECK_FAILED`, e instanceof Error ? e.message : String(e));
	}
	for (let n of t.bankAccounts.bankAccounts) (t.journals.journalEntries.some((t) => t.journalDate <= e.endDate && t.lines.some((e) => e.accountId === n.glAccountId)) || n.openingBalance !== 0 && n.openingBalanceDate <= e.endDate) && !t.bankReconciliations.reconciliations.some((t) => t.bankAccountId === n.id && t.statementDate >= e.endDate && t.status === "COMPLETED" && t.difference === 0) && i("BANK_NOT_RECONCILED", `Reconcile ${n.name ?? n.id} through ${e.endDate}.`);
	let c = t.journals.journalEntries.filter((t) => t.journalDate >= e.startDate && t.journalDate <= e.endDate), l = (e) => Math.round((e + 2 ** -52) * 100) / 100, u = l(c.reduce((e, t) => e + t.totalDebit, 0)), d = l(c.reduce((e, t) => e + t.totalCredit, 0));
	return (!Number.isFinite(u) || !Number.isFinite(d) || u !== d) && i("TRIAL_BALANCE", "Period journal debits and credits do not balance."), {
		blockers: r,
		journalCount: c.length,
		debit: u,
		credit: d
	};
}
//#endregion
//#region src/features/accounting/data/inventoryAccountingPostingService.ts
function l_(e) {
	return L.requireBySystemRole(e).id;
}
function u_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function d_(e) {
	return R.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function f_(e) {
	let t = $u.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var p_ = {
	postSalesFulfilment(e) {
		let t = d_(e.id);
		if (t) return t;
		let n = u_(f_(e).reduce((e, t) => {
			if (t.valueChange > 0) throw Error(`Sales fulfilment cost movement ${t.costMovementNumber} has an invalid positive inventory value change.`);
			return e - t.valueChange;
		}, 0));
		if (!Number.isFinite(n) || n < 0) throw Error("Sales fulfilment COGS amount is invalid.");
		if (n !== 0) return R.post({
			journalDate: e.fulfilmentDate,
			description: `COGS for sales fulfilment ${e.fulfilmentNumber}`,
			reference: e.fulfilmentNumber,
			sourceType: "SALES_FULFILMENT",
			sourceId: e.id,
			lines: [{
				accountId: l_("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: l_("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = d_(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? R.getById(r.reversalJournalEntryId) : void 0 : R.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, m_ = /* @__PURE__ */ new Set(), h_ = [], g_ = h_;
function __() {
	g_ = h_, m_.forEach((e) => e());
}
function v_() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = h_.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function y_(e, t) {
	return B(h_.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function b_(e) {
	let t = Gp.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.map((e) => y_(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.every((e, t) => n[t] >= B(e.quantity));
	Gp.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function x_(e) {
	let t = $u.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
r("fulfilments", {
	repository: {
		subscribe(e) {
			return m_.add(e), () => {
				m_.delete(e);
			};
		},
		getSnapshot() {
			return g_;
		},
		getAll() {
			return g_;
		},
		getById(e) {
			return h_.find((t) => t.id === e);
		},
		getBySalesOrder(e) {
			return h_.filter((t) => t.salesOrderId === e);
		},
		getFulfilledQuantity: y_,
		getRemainingQuantity(e, t) {
			let n = Gp.getById(e);
			if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
			let r = n.lines.find((e) => e.id === t);
			if (!r) throw Error("Sales order line was not found.");
			return B(r.quantity - y_(e, t));
		},
		create(e) {
			let t = Gp.getById(e.salesOrderId);
			if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
			let n = t;
			if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED") throw Error("Only a confirmed or partially fulfilled sales order can be fulfilled.");
			let r = Ru.getById(e.siteId);
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
				let i = rl(t.productId);
				if (!i) throw Error(`Product ${t.sku} was not found.`);
				let o = il(t.productId, t.unitId);
				if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
				if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
				let s = B(e.fulfilledQuantity), c = y_(n.id, t.id);
				if (s > B(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
				let l = B(s * o.conversionToBase), u = vd.getBalance(r.id, t.productId);
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
				s.set(e.orderLine.productId, B(t + e.fulfilledBaseQuantity));
			}
			for (let [e, t] of s) {
				let n = vd.getBalance(r.id, e);
				if (!n || n.quantityOnHand < t) {
					let t = rl(e);
					throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
				}
			}
			let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = v_(), d = o.map((e) => ({
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
				let i = rl(t.productId);
				if (!i) throw Error(`Product ${t.sku} was not found.`);
				let a = Uu.create({
					movementType: "SALE",
					siteId: r.id,
					productId: t.productId,
					baseUnitId: i.baseUnitId,
					quantityBase: B(-t.fulfilledBaseQuantity),
					transactionUnitId: t.unitId,
					transactionUnitSymbol: t.unitSymbol,
					transactionQuantity: B(-t.fulfilledQuantity),
					conversionToBase: t.conversionToBase,
					referenceType: "SALES_FULFILMENT",
					referenceId: f.id,
					referenceNumber: f.fulfilmentNumber,
					salesOrderId: n.id,
					salesOrderNumber: n.documentNumber,
					occurredAt: e.fulfilmentDate,
					notes: `Sales fulfilment ${f.fulfilmentNumber}`
				});
				fd({
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
				}), vd.issue({
					siteId: r.id,
					productId: t.productId,
					baseUnitId: i.baseUnitId,
					quantityBase: t.fulfilledBaseQuantity
				});
			}
			return p_.postSalesFulfilment(f), h_ = [f, ...h_], __(), b_(n.id), f;
		},
		void(e) {
			let t = h_.find((t) => t.id === e.fulfilmentId);
			if (!t) throw Error("Sales fulfilment was not found.");
			if (t.status === "VOIDED") throw Error("Sales fulfilment has already been voided.");
			if (Number.isNaN(Date.parse(e.voidDate))) throw Error("Fulfilment void date is invalid.");
			if (e.voidDate < t.fulfilmentDate) throw Error("Fulfilment void date cannot be earlier than the fulfilment date.");
			let n = e.reason.trim();
			if (n.length < 3) throw Error("Fulfilment void reason must contain at least 3 characters.");
			let r = Gp.getById(t.salesOrderId);
			if (!r || r.type !== "SALES_ORDER") throw Error("Sales order was not found.");
			if (r.status === "INVOICED") throw Error("Cannot void a sales fulfilment for an invoiced sales order.");
			if (r.status !== "CONFIRMED" && r.status !== "PARTIALLY_FULFILLED" && r.status !== "FULFILLED") throw Error(`Cannot void a sales fulfilment when the sales order status is ${r.status}.`);
			let i = x_(t), a = /* @__PURE__ */ new Set(), o = t.lines.map((e) => {
				let n = rl(e.productId);
				if (!n) throw Error(`Product ${e.sku} was not found.`);
				let r = i.find((n) => !a.has(n.id) && n.siteId === t.siteId && n.productId === e.productId && Math.abs(n.quantityBase) === e.fulfilledBaseQuantity);
				if (!r) throw Error(`Unique original inventory cost issue for ${e.sku} was not found.`);
				return a.add(r.id), {
					line: e,
					product: n,
					originalIssue: r
				};
			});
			p_.reverseSalesFulfilment({
				fulfilment: t,
				reversalDate: e.voidDate,
				reason: n
			});
			for (let r of o) {
				let { line: i, product: a, originalIssue: o } = r, s = Uu.create({
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
				pd({
					siteId: t.siteId,
					productId: i.productId,
					quantityBase: i.fulfilledBaseQuantity,
					unitCostBase: o.unitCostBase,
					inventoryValue: Tu(Math.abs(o.valueChange)),
					referenceType: "SALE",
					referenceId: t.id,
					referenceNumber: t.fulfilmentNumber,
					inventoryMovementId: s.id,
					occurredAt: e.voidDate,
					notes: `Void sales fulfilment ${t.fulfilmentNumber}: ${n}`
				}), vd.receive({
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
			return h_ = h_.map((e) => e.id === s.id ? s : e), __(), b_(t.salesOrderId), s;
		}
	},
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: h_ }),
	restore: (e) => {
		h_ = e.fulfilments, g_ = h_;
	},
	publish: () => m_.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchasePostingRecoveryAuthorization.ts
var S_ = null, C_ = {
	configureTrustedSession(e) {
		S_ = e;
	},
	clear() {
		S_ = null;
	},
	current() {
		return S_?.() ?? null;
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
}, w_ = "htt.purchasePosting.manualRecoveryAudit.v1";
function T_() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(w_) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var E_ = T_();
function D_(e) {
	E_.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(w_, JSON.stringify(E_));
	} catch {}
}
r("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return E_.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = j.get(e);
			return C_.canRecover() && t?.status === "RECOVERY_REQUIRED" && j.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = C_.requireRecoveryPermission(), n = j.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!j.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				j.recover(e), D_({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw D_({
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
	snapshot: () => E_,
	restore: (e) => {
		E_.splice(0, E_.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var O_ = !1;
function k_() {
	if (O_ || (O_ = !0, k.wasRestoredOnLoad())) return;
	let e = Gp.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) Np.postInvoice(t), t.status === "VOID" && Np.reverseInvoice(t);
	let t = Ep.getAll();
	for (let e of t) Np.postPayment(e), e.status === "REVERSED" && Np.reversePayment(e);
	let n = U.getAll();
	for (let e of n) e.status !== "DRAFT" && (Np.postCreditNote(e), e.status === "VOID" && Np.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function A_() {
	let e = vg().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/sales/data/salesManualReviewService.ts
var j_ = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function M_(n) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let r = e("business.command", {
			repository: "salesRecovery",
			method: "recordSalesManualReview",
			args: [n]
		});
		return t(r.view), r.result;
	}
	if (!n.businessRecordChecked || !n.originalGlChecked || !n.reversalGlChecked || !n.balancesChecked) throw Error("Business, original/reversal GL and balances must all be inspected.");
	let r = A.list().find((e) => e.operationId === n.operationId);
	if (!r || !j_.has(r.kind)) throw Error("Sales operation not found.");
	if (r.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return A.recordManualReview(n.operationId, n.reference, n.operator, n.summary);
}
//#endregion
//#region src/features/sales/data/salesConsistencyAudit.ts
var N_ = (e) => Math.round(e * 100);
function P_(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + N_(t.amount), 0), s = a.reduce((e, t) => e + N_(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (N_(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), N_(t.amountDue) !== Math.max(0, N_(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > N_(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		(!r || r.customerId !== t.customerId) && n("CREDIT_SOURCE_LINK", t.id, "Credit note source invoice missing or customer mismatch");
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + N_(t.amount), 0);
		N_(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || N_(t.amountAvailable) !== 0 : N_(t.amountAvailable) !== N_(t.totals.total) - a - N_(t.amountRefunded ?? 0)) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
var F_ = {
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
function I_(e) {
	return P_(e).map((e) => ({
		...e,
		action: F_[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var L_ = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function R_(e, t) {
	let n = I_(e).map((e) => ({ ...e })), r = t.filter((e) => L_.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => L_.has(e.kind))) s.has(e.operationId) && n.push({
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
function z_() {
	let e = Gp.getAll();
	return R_({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Ep.getAll(),
		creditNotes: U.getAll(),
		allocations: U.getAllAllocations(),
		journals: R.getAll()
	}, A.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
var B_ = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function V_(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!B_.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = R_(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function H_() {
	let e = Gp.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Ep.getAll(),
		creditNotes: U.getAll(),
		allocations: U.getAllAllocations(),
		journals: R.getAll()
	};
}
function U_(n) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let r = e("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [n]
		});
		return t(r.view), r.result;
	}
	let r = A.list(), i = V_(H_(), r, n.operationId);
	if (i.length) throw Error(`Sales recovery remains blocked: ${i.join(" ")}`);
	let a = r.find((e) => e.operationId === n.operationId);
	return {
		closed: A.closeReviewed(n.operationId, a.resultId, n.approvalReference, n.approver),
		remaining: z_()
	};
}
//#endregion
//#region electron/security/businessEngine.ts
r("salesRecovery", {
	repository: {
		recordSalesManualReview: M_,
		closeVerifiedSalesReview: U_
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
var W_ = s();
function G_(e) {
	$l(c_, () => e()?.userId ?? ""), vc.connect(e), C_.configureTrustedSession(e), k_(), A_();
}
//#endregion
export { iu as assertPostingPeriod, G_ as initialize, W_ as workspaceDefaults };
