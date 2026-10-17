import { S as e, _ as t, a as n, c as r, d as i, f as a, h as o, i as s, l as c, m as l, n as u, o as d, p as f, r as p, s as m, t as h, u as ee, y as te } from "./accountingPeriodValidation-DKQjzU2X.js";
//#region \0rolldown/runtime.js
var ne = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), re = /* @__PURE__ */ ne(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.for("react.view_transition"), m = Symbol.iterator;
	function h(e) {
		return typeof e != "object" || !e ? null : (e = m && e[m] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var ee = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, te = Object.assign, ne = {};
	function re(e, t, n) {
		this.props = e, this.context = t, this.refs = ne, this.updater = n || ee;
	}
	re.prototype.isReactComponent = {}, re.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, re.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function ie() {}
	ie.prototype = re.prototype;
	function ae(e, t, n) {
		this.props = e, this.context = t, this.refs = ne, this.updater = n || ee;
	}
	var oe = ae.prototype = new ie();
	oe.constructor = ae, te(oe, re.prototype), oe.isPureReactComponent = !0;
	var se = Array.isArray;
	function ce() {}
	var g = {
		H: null,
		A: null,
		T: null,
		S: null
	}, le = Object.prototype.hasOwnProperty;
	function ue(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function _(e, t) {
		return ue(e.type, t, e.props);
	}
	function de(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function fe(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var pe = /\/+/g;
	function me(e, t) {
		return typeof e == "object" && e && e.key != null ? fe("" + e.key) : t.toString(36);
	}
	function he(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(ce, ce) : (e.status = "pending", e.then(function(t) {
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
	function ge(e, r, i, a, o) {
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
				case d: return c = e._init, ge(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + me(e, 0) : a, se(o) ? (i = "", c != null && (i = c.replace(pe, "$&/") + "/"), ge(o, r, i, "", function(e) {
			return e;
		})) : o != null && (de(o) && (o = _(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(pe, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (se(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + me(a, u), c += ge(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + me(a, u++), c += ge(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return ge(he(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function _e(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return ge(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function ve(e) {
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
	var ye = typeof reportError == "function" ? reportError : function(e) {
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
	function be(e) {
		var t = g.T, n = {};
		n.types = t === null ? null : t.types, g.T = n;
		try {
			var r = e(), i = g.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(ce, ye);
		} catch (e) {
			ye(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), g.T = t;
		}
	}
	function xe(e) {
		var t = g.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else be(xe.bind(null, e));
	}
	var Se = {
		map: _e,
		forEach: function(e, t, n) {
			_e(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return _e(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return _e(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!de(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = Se, e.Component = re, e.Fragment = r, e.Profiler = a, e.PureComponent = ae, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = g, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return g.H.useMemoCache(e);
		}
	}, e.addTransitionType = xe, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = te({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !le.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return ue(e.type, i, r);
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
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) le.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return ue(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = de, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: ve
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = be, e.unstable_useCacheRefresh = function() {
		return g.H.useCacheRefresh();
	}, e.use = function(e) {
		return g.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return g.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return g.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return g.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return g.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return g.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return g.H.useEffectEvent(e);
	}, e.useId = function() {
		return g.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return g.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return g.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return g.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return g.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return g.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return g.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return g.H.useRef(e);
	}, e.useState = function(e) {
		return g.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return g.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return g.H.useTransition();
	}, e.version = "19.3.0";
})), ie = /* @__PURE__ */ ne(((e, t) => {
	process.env.NODE_ENV !== "production" && (function() {
		function n(e, t) {
			Object.defineProperty(a.prototype, e, { get: function() {
				console.warn("%s(...) is deprecated in plain JavaScript React classes. %s", t[0], t[1]);
			} });
		}
		function r(e) {
			return typeof e != "object" || !e ? null : (e = Me && e[Me] || e["@@iterator"], typeof e == "function" ? e : null);
		}
		function i(e, t) {
			e = (e = e.constructor) && (e.displayName || e.name) || "ReactClass";
			var n = e + "." + t;
			Ne[n] || (console.error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", t, e), Ne[n] = !0);
		}
		function a(e, t, n) {
			this.props = e, this.context = t, this.refs = Ie, this.updater = n || Pe;
		}
		function o() {}
		function s(e, t, n) {
			this.props = e, this.context = t, this.refs = Ie, this.updater = n || Pe;
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
			if (typeof e == "function") return e.$$typeof === ze ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case xe: return "Fragment";
				case Ce: return "Profiler";
				case Se: return "StrictMode";
				case De: return "Suspense";
				case Oe: return "SuspenseList";
				case Ae: return "Activity";
				case je: return "ViewTransition";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case be: return "Portal";
				case Te: return e.displayName || "Context";
				case we: return (e._context.displayName || "Context") + ".Consumer";
				case Ee:
					var t = e.render;
					return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case ke: return t = e.displayName || null, t === null ? d(e.type) || "Memo" : t;
				case v:
					t = e._payload, e = e._init;
					try {
						return d(e(t));
					} catch {}
			}
			return null;
		}
		function f(e) {
			if (e === xe) return "<>";
			if (typeof e == "object" && e && e.$$typeof === v) return "<...>";
			try {
				var t = d(e);
				return t ? "<" + t + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function p() {
			var e = y.A;
			return e === null ? null : e.getOwner();
		}
		function m() {
			return Error("react-stack-top-frame");
		}
		function h(e) {
			if (Be.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function ee(e, t) {
			function n() {
				He || (He = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function te() {
			var e = d(this.type);
			return We[e] || (We[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function ne(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: ye,
				type: e,
				key: t,
				props: n,
				_owner: r
			}, (o === void 0 ? null : o) === null ? Object.defineProperty(e, "ref", {
				enumerable: !1,
				value: null
			}) : Object.defineProperty(e, "ref", {
				enumerable: !1,
				get: te
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
		function re(e, t) {
			return t = ne(e.type, t, e.props, e._owner, e._debugStack, e._debugTask), e._store && (t._store.validated = e._store.validated), t;
		}
		function ie(e) {
			ae(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === v && (e._payload.status === "fulfilled" ? ae(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function ae(e) {
			return typeof e == "object" && !!e && e.$$typeof === ye;
		}
		function oe(e) {
			var t = {
				"=": "=0",
				":": "=2"
			};
			return "$" + e.replace(/[=:]/g, function(e) {
				return t[e];
			});
		}
		function se(e, t) {
			return typeof e == "object" && e && e.key != null ? (u(e.key), oe("" + e.key)) : t.toString(36);
		}
		function ce(e) {
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
		function g(e, t, n, i, a) {
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
					case ye:
					case be:
						s = !0;
						break;
					case v: return s = e._init, g(s(e._payload), t, n, i, a);
				}
			}
			if (s) {
				s = e, a = a(s);
				var c = i === "" ? "." + se(s, 0) : i;
				return Re(a) ? (n = "", c != null && (n = c.replace(Je, "$&/") + "/"), g(a, t, n, "", function(e) {
					return e;
				})) : a != null && (ae(a) && (a.key != null && (s && s.key === a.key || u(a.key)), n = re(a, n + (a.key == null || s && s.key === a.key ? "" : ("" + a.key).replace(Je, "$&/") + "/") + c), i !== "" && s != null && ae(s) && s.key == null && s._store && !s._store.validated && (n._store.validated = 2), a = n), t.push(a)), 1;
			}
			if (s = 0, c = i === "" ? "." : i + ":", Re(e)) for (var l = 0; l < e.length; l++) i = e[l], o = c + se(i, l), s += g(i, t, n, o, a);
			else if (l = r(e), typeof l == "function") for (l === e.entries && (qe || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), qe = !0), e = l.call(e), l = 0; !(i = e.next()).done;) i = i.value, o = c + se(i, l++), s += g(i, t, n, o, a);
			else if (o === "object") {
				if (typeof e.then == "function") return g(ce(e), t, n, i, a);
				throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
			}
			return s;
		}
		function le(e, t, n) {
			if (e == null) return e;
			var r = [], i = 0;
			return g(e, r, "", "", function(e) {
				return t.call(n, e, i++);
			}), r;
		}
		function ue(e) {
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
		function _() {
			var e = y.H;
			return e === null && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."), e;
		}
		function de() {
			y.asyncTransitions--;
		}
		function fe(e) {
			var t = y.T, n = {};
			n.types = t === null ? null : t.types, n._updatedFibers = /* @__PURE__ */ new Set(), y.T = n;
			try {
				var r = e(), i = y.S;
				i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && (y.asyncTransitions++, r.then(de, de), r.then(c, Ye));
			} catch (e) {
				Ye(e);
			} finally {
				t === null && n._updatedFibers && (e = n._updatedFibers.size, n._updatedFibers.clear(), 10 < e && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), t !== null && n.types !== null && (t.types !== null && t.types !== n.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), t.types = n.types), y.T = t;
			}
		}
		function pe(e) {
			var t = y.T;
			if (t !== null) {
				var n = t.types;
				n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
			} else y.asyncTransitions === 0 && console.error("addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition."), fe(pe.bind(null, e));
		}
		function me(e) {
			if (Ze === null) try {
				var n = ("require" + Math.random()).slice(0, 7);
				Ze = (t && t[n]).call(t, "timers").setImmediate;
			} catch {
				Ze = function(e) {
					!1 === Xe && (Xe = !0, typeof MessageChannel > "u" && console.error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
					var t = new MessageChannel();
					t.port1.onmessage = e, t.port2.postMessage(void 0);
				};
			}
			return Ze(e);
		}
		function he(e) {
			return 1 < e.length && typeof AggregateError == "function" ? AggregateError(e) : e[0];
		}
		function ge(e, t) {
			t !== Qe - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), Qe = t;
		}
		function _e(e, t, n) {
			var r = y.actQueue;
			if (r !== null) {
				if (r.length !== 0) try {
					ve(r), me(function() {
						return _e(e, t, n);
					});
					return;
				} catch (e) {
					y.thrownErrors.push(e);
				}
				else y.actQueue = null;
			}
			0 < y.thrownErrors.length ? (r = he(y.thrownErrors), y.thrownErrors.length = 0, n(r)) : t(e);
		}
		function ve(e) {
			if (!et) {
				et = !0;
				var t = 0;
				try {
					for (; t < e.length; t++) {
						var n = e[t];
						do {
							y.didUsePromise = !1;
							var r = n(!1);
							if (r !== null) {
								if (y.didUsePromise) {
									e[t] = n, e.splice(0, t);
									return;
								}
								n = r;
							} else break;
						} while (1);
					}
					e.length = 0;
				} catch (n) {
					e.splice(0, t + 1), y.thrownErrors.push(n);
				} finally {
					et = !1;
				}
			}
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var ye = Symbol.for("react.transitional.element"), be = Symbol.for("react.portal"), xe = Symbol.for("react.fragment"), Se = Symbol.for("react.strict_mode"), Ce = Symbol.for("react.profiler"), we = Symbol.for("react.consumer"), Te = Symbol.for("react.context"), Ee = Symbol.for("react.forward_ref"), De = Symbol.for("react.suspense"), Oe = Symbol.for("react.suspense_list"), ke = Symbol.for("react.memo"), v = Symbol.for("react.lazy"), Ae = Symbol.for("react.activity"), je = Symbol.for("react.view_transition"), Me = Symbol.iterator, Ne = {}, Pe = {
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
		}, Fe = Object.assign, Ie = {};
		Object.freeze(Ie), a.prototype.isReactComponent = {}, a.prototype.setState = function(e, t) {
			if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
			this.updater.enqueueSetState(this, e, t, "setState");
		}, a.prototype.forceUpdate = function(e) {
			this.updater.enqueueForceUpdate(this, e, "forceUpdate");
		};
		var Le = {
			isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
			replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
		};
		for (nt in Le) Le.hasOwnProperty(nt) && n(nt, Le[nt]);
		o.prototype = a.prototype, Le = s.prototype = new o(), Le.constructor = s, Fe(Le, a.prototype), Le.isPureReactComponent = !0;
		var Re = Array.isArray, ze = Symbol.for("react.client.reference"), y = {
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
		}, Be = Object.prototype.hasOwnProperty, Ve = console.createTask ? console.createTask : function() {
			return null;
		};
		Le = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var He, Ue, We = {}, Ge = Le.react_stack_bottom_frame.bind(Le, m)(), Ke = Ve(f(m)), qe = !1, Je = /\/+/g, Ye = typeof reportError == "function" ? reportError : function(e) {
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
		}, Xe = !1, Ze = null, Qe = 0, $e = !1, et = !1, tt = typeof queueMicrotask == "function" ? function(e) {
			queueMicrotask(function() {
				return queueMicrotask(e);
			});
		} : me;
		Le = Object.freeze({
			__proto__: null,
			c: function(e) {
				return _().useMemoCache(e);
			}
		});
		var nt = {
			map: le,
			forEach: function(e, t, n) {
				le(e, function() {
					t.apply(this, arguments);
				}, n);
			},
			count: function(e) {
				var t = 0;
				return le(e, function() {
					t++;
				}), t;
			},
			toArray: function(e) {
				return le(e, function(e) {
					return e;
				}) || [];
			},
			only: function(e) {
				if (!ae(e)) throw Error("React.Children.only expected to receive a single React element child.");
				return e;
			}
		};
		e.Activity = Ae, e.Children = nt, e.Component = a, e.Fragment = xe, e.Profiler = Ce, e.PureComponent = s, e.StrictMode = Se, e.Suspense = De, e.ViewTransition = je, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = y, e.__COMPILER_RUNTIME = Le, e.act = function(e) {
			var t = y.actQueue, n = Qe;
			Qe++;
			var r = y.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				y.thrownErrors.push(e);
			}
			if (0 < y.thrownErrors.length) throw ge(t, n), e = he(y.thrownErrors), y.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return tt(function() {
					i || $e || ($e = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				}), { then: function(e, a) {
					i = !0, o.then(function(i) {
						if (ge(t, n), n === 0) {
							try {
								ve(r), me(function() {
									return _e(i, e, a);
								});
							} catch (e) {
								y.thrownErrors.push(e);
							}
							if (0 < y.thrownErrors.length) {
								var o = he(y.thrownErrors);
								y.thrownErrors.length = 0, a(o);
							}
						} else e(i);
					}, function(e) {
						ge(t, n), 0 < y.thrownErrors.length ? (e = he(y.thrownErrors), y.thrownErrors.length = 0, a(e)) : a(e);
					});
				} };
			}
			var s = a;
			if (ge(t, n), n === 0 && (ve(r), r.length !== 0 && tt(function() {
				i || $e || ($e = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), y.actQueue = null), 0 < y.thrownErrors.length) throw e = he(y.thrownErrors), y.thrownErrors.length = 0, e;
			return { then: function(e, t) {
				i = !0, n === 0 ? (y.actQueue = r, me(function() {
					return _e(s, e, t);
				})) : e(s);
			} };
		}, e.addTransitionType = pe, e.cache = function(e) {
			return function() {
				return e.apply(null, arguments);
			};
		}, e.cacheSignal = function() {
			return null;
		}, e.captureOwnerStack = function() {
			var e = y.getCurrentStack;
			return e === null ? null : e();
		}, e.cloneElement = function(e, t, n) {
			if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
			var r = Fe({}, e.props), i = e.key, a = e._owner;
			if (t != null) {
				var o;
				a: {
					if (Be.call(t, "ref") && (o = Object.getOwnPropertyDescriptor(t, "ref").get) && o.isReactWarning) {
						o = !1;
						break a;
					}
					o = t.ref !== void 0;
				}
				for (s in o && (a = p()), h(t) && (u(t.key), i = "" + t.key), t) !Be.call(t, s) || s === "key" || s === "__self" || s === "__source" || s === "ref" && t.ref === void 0 || (r[s] = t[s]);
			}
			var s = arguments.length - 2;
			if (s === 1) r.children = n;
			else if (1 < s) {
				o = Array(s);
				for (var c = 0; c < s; c++) o[c] = arguments[c + 2];
				r.children = o;
			}
			for (r = ne(e.type, i, r, a, e._debugStack, e._debugTask), i = 2; i < arguments.length; i++) ie(arguments[i]);
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
			for (var r = 2; r < arguments.length; r++) ie(arguments[r]);
			var i;
			r = {};
			var a = null;
			if (t != null) for (i in Ue || !("__self" in t) || "key" in t || (Ue = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), h(t) && (u(t.key), a = "" + t.key), t) Be.call(t, i) && i !== "key" && i !== "__self" && i !== "__source" && (r[i] = t[i]);
			var o = arguments.length - 2;
			if (o === 1) r.children = n;
			else if (1 < o) {
				for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
				Object.freeze && Object.freeze(s), r.children = s;
			}
			if (e && e.defaultProps) for (i in o = e.defaultProps, o) r[i] === void 0 && (r[i] = o[i]);
			return a && ee(r, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), (i = 1e4 > y.recentlyCreatedOwnerStacks++) ? (s = Error.stackTraceLimit, Error.stackTraceLimit = 10, o = Error("react-stack-top-frame"), Error.stackTraceLimit = s) : o = Ge, ne(e, a, r, p(), o, i ? Ve(f(e)) : Ke);
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
		}, e.isValidElement = ae, e.lazy = function(e) {
			e = {
				_status: -1,
				_result: e
			};
			var t = {
				$$typeof: v,
				_payload: e,
				_init: ue
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
		}, e.startTransition = fe, e.unstable_useCacheRefresh = function() {
			return _().useCacheRefresh();
		}, e.use = function(e) {
			return _().use(e);
		}, e.useActionState = function(e, t, n) {
			return _().useActionState(e, t, n);
		}, e.useCallback = function(e, t) {
			return _().useCallback(e, t);
		}, e.useContext = function(e) {
			var t = _();
			return e.$$typeof === we && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"), t.useContext(e);
		}, e.useDebugValue = function(e, t) {
			return _().useDebugValue(e, t);
		}, e.useDeferredValue = function(e, t) {
			return _().useDeferredValue(e, t);
		}, e.useEffect = function(e, t) {
			return e ?? console.warn("React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"), _().useEffect(e, t);
		}, e.useEffectEvent = function(e) {
			return _().useEffectEvent(e);
		}, e.useId = function() {
			return _().useId();
		}, e.useImperativeHandle = function(e, t, n) {
			return _().useImperativeHandle(e, t, n);
		}, e.useInsertionEffect = function(e, t) {
			return e ?? console.warn("React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"), _().useInsertionEffect(e, t);
		}, e.useLayoutEffect = function(e, t) {
			return e ?? console.warn("React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"), _().useLayoutEffect(e, t);
		}, e.useMemo = function(e, t) {
			return _().useMemo(e, t);
		}, e.useOptimistic = function(e, t) {
			return _().useOptimistic(e, t);
		}, e.useReducer = function(e, t, n) {
			return _().useReducer(e, t, n);
		}, e.useRef = function(e) {
			return _().useRef(e);
		}, e.useState = function(e) {
			return _().useState(e);
		}, e.useSyncExternalStore = function(e, t, n) {
			return _().useSyncExternalStore(e, t, n);
		}, e.useTransition = function() {
			return _().useTransition();
		}, e.version = "19.3.0", typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
})), ae = /* @__PURE__ */ ne(((e, t) => {
	t.exports = process.env.NODE_ENV === "production" ? re() : ie();
}));
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/util.js
function oe(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function se(e, t = "|") {
	return e.map((e) => Ae(e)).join(t);
}
function ce(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
var g = class {
	constructor(e) {
		this._getter = e, this._value = void 0;
	}
	get value() {
		let e = this._getter;
		return e !== void 0 && (this._value = e(), this._getter = void 0), this._value;
	}
};
function le(e) {
	return new g(e);
}
function ue(e) {
	return e == null;
}
function _(e) {
	let t = +!!e.startsWith("^"), n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
function de(e, t) {
	let n = e / t, r = Math.round(n), i = 4 * 2 ** -52 * Math.max(Math.abs(n), 1);
	return Math.abs(n - r) < i ? 0 : n - r;
}
function fe(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function pe(e) {
	let t = Object.getOwnPropertyDescriptor(e, "shape");
	return t?.get ? t.get.raw : t?.value;
}
function me(e) {
	return pe(e._zod.def) ?? e._zod.def.shape;
}
function he(e, t, n) {
	Object.defineProperty(e, t, {
		get() {
			let e = n();
			return fe(this, t, e), e;
		},
		enumerable: !0,
		configurable: !0
	});
}
function ge(e, t, n) {
	t in e ? fe(e, t, n) : e[t] = n;
}
function _e(e, t, n, r) {
	let i = me(t);
	for (let a of n) {
		let n = Object.getOwnPropertyDescriptor(i, a);
		n.enumerable && (n.get ? he(e, a, () => {
			let e = t._zod.def.shape[a];
			return r ? r(e, a) : e;
		}) : ge(e, a, r ? r(n.value, a) : n.value));
	}
}
function ve(e, t) {
	for (let n of Reflect.ownKeys(t)) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.enumerable && (r.get ? he(e, n, () => t[n]) : ge(e, n, r.value));
	}
}
function ye(...e) {
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
var we = /* @__PURE__*/ le(() => {
	if (_t.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function Te(e) {
	if (Ce(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return Ce(n) !== !1 && Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") !== !1;
}
function Ee(e) {
	return Te(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var De = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function Oe(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ke(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n?.parent) && (r._zod.parent = e), r;
}
function v(e) {
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
function Ae(e) {
	return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function je(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
var Me = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, Ne = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function Pe(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	let i = {};
	return _e(i, e, Fe(e, t)), ke(e, ye(n, {
		shape: i,
		checks: []
	}));
}
function Fe(e, t) {
	let n = me(e), r = [];
	for (let e of Reflect.ownKeys(t)) {
		if (!Object.getOwnPropertyDescriptor(n, e)?.enumerable) throw Error(`Unrecognized key: "${String(e)}"`);
		t[e] && r.push(e);
	}
	return r;
}
function Ie(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	let i = new Set(Fe(e, t)), a = {};
	return _e(a, e, Reflect.ownKeys(me(e)).filter((e) => !i.has(e))), ke(e, ye(n, {
		shape: a,
		checks: []
	}));
}
function Le(e, t) {
	if (!Te(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = me(e);
		for (let e of Reflect.ownKeys(t)) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return ke(e, ye(e._zod.def, { shape: Re(e, t) }));
}
function Re(e, t) {
	let n = {};
	return _e(n, e, Reflect.ownKeys(me(e))), ve(n, t), n;
}
function ze(e, t) {
	if (!Te(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return ke(e, ye(e._zod.def, { shape: Re(e, t) }));
}
function y(e, t) {
	if (!t?._zod?.def) throw Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (e._zod.def.checks?.length) throw Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	let n = {};
	return _e(n, e, Reflect.ownKeys(me(e))), _e(n, t, Reflect.ownKeys(me(t))), ke(e, ye(e._zod.def, {
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
	let a = n ? new Set(Fe(t, n)) : void 0, o = {};
	return _e(o, t, Reflect.ownKeys(me(t)), e && ((t, n) => a && !a.has(n) ? t : new e({
		type: "optional",
		innerType: t
	}))), ke(t, ye(t._zod.def, {
		shape: o,
		checks: []
	}));
}
function Ve(e, t, n) {
	let r = n ? new Set(Fe(t, n)) : void 0, i = {};
	return _e(i, t, Reflect.ownKeys(me(t)), (t, n) => r && !r.has(n) ? t : new e({
		type: "nonoptional",
		innerType: t
	})), ke(t, ye(t._zod.def, { shape: i }));
}
function He(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function Ue(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
	return !1;
}
function We(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function Ge(e) {
	return typeof e == "string" ? e : e?.message;
}
function Ke(e, t, n) {
	var r;
	for (let i = t; i < e.length; i++) (r = e[i]).schema ?? (r.schema = n);
}
function qe(e, t, n) {
	var r;
	let i = e.inst?._zod?.traits;
	i?.has("$ZodType") && (i.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
	let a = e.schema === e.inst ? void 0 : e.schema?._zod.def?.error, o = e.message ? e.message : Ge(e.inst?._zod.def?.error?.(e)) ?? Ge(a?.(e)) ?? Ge(t?.error?.(e)) ?? Ge(n.customError?.(e)) ?? Ge(n.localeError?.(e)) ?? "Invalid input", s = {};
	for (let t of Object.keys(e)) t !== "inst" && t !== "schema" && t !== "continue" && t !== "input" && t !== "__proto__" && (s[t] = e[t]);
	return s.path ??= [], s.message = o, t?.reportInput && (s.input = e.input), s;
}
var Je = /[\uD800-\uDBFF]/;
function Ye(e) {
	let t = e.length;
	if (!Je.test(e)) return t;
	let n = t;
	for (let r = 0; r < t - 1; r++) (e.charCodeAt(r) & 64512) == 55296 && (e.charCodeAt(r + 1) & 64512) == 56320 && (n--, r++);
	return n;
}
function Xe(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Ze(e) {
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
function Qe(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
function $e(e, t) {
	for (let n in t) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.get ? Object.defineProperty(e, n, {
			...r,
			enumerable: !1
		}) : rt(e, n, r.value);
	}
}
function et(e, t, n, r = !0) {
	return Object.defineProperty(e, t, {
		configurable: !0,
		writable: !0,
		enumerable: r,
		value: n
	}), n;
}
function tt(e, t, n) {
	return et(e, t, n, !1);
}
function nt(e, t) {
	for (let n in e) {
		let r = e[n];
		Object.defineProperty(t, n, {
			configurable: !0,
			enumerable: !0,
			get() {
				return et(this, n, r(this));
			},
			set(e) {
				et(this, n, e);
			}
		});
	}
	return t;
}
function rt(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		get() {
			return this == null ? n : et(this, t, n.bind(this));
		},
		set(e) {
			et(this, t, e);
		}
	});
}
function it(e, t) {
	let n = Object.getPrototypeOf(e);
	return t in n ? void 0 : n;
}
var at, ot = !1, st = {
	configurable: !0,
	get() {
		ot = !0;
	}
};
function b(e, t, n) {
	let r = Object.getPrototypeOf(e._zod);
	if (t in r && at !== e._zod) {
		at = void 0;
		return;
	}
	at = e._zod, Object.defineProperty(r, t, {
		configurable: !0,
		get() {
			Object.defineProperty(this, t, st);
			let e = ot;
			ot = !1;
			try {
				let r = n(this);
				return ot ? delete this[t] : Object.defineProperty(this, t, {
					configurable: !0,
					writable: !0,
					value: r
				}), ot ||= e, r;
			} catch (n) {
				throw delete this[t], ot ||= e, n;
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
function ct(e, t, n, r) {
	let i = it(e, t);
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
var lt = "~constantCatch";
function ut(e) {
	let t = () => e;
	return t[lt] = !0, t;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/core.js
var dt, ft = {
	value: void 0,
	enumerable: !1
}, pt = "captureStackTrace" in Error ? Error : null;
function mt(e) {
	let t = pt;
	if (t) {
		let n = t.stackTraceLimit;
		if (typeof n == "number") {
			try {
				t.stackTraceLimit = 0;
			} catch {
				return pt = null, new e();
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
function x(e, t, n, r) {
	let i = {};
	function a(e) {
		this.def = e, this.constr = d, this.traits = /* @__PURE__ */ new Set();
	}
	a.prototype = i;
	let o = n, s = o && /* @__PURE__ */ new WeakSet();
	function c(n, r) {
		if (!n._zod) {
			ft.value = new a(r);
			try {
				Object.defineProperty(n, "_zod", ft);
			} finally {
				ft.value = void 0;
			}
		} else if (n._zod.traits.has(e)) return;
		if (n._zod.traits.add(e), t(n, r), s) {
			let e = Object.getPrototypeOf(n), t = n._zod.constr.prototype, r = e;
			for (; r && r !== t;) r = Object.getPrototypeOf(r);
			let i = r ?? e;
			s.has(i) || (s.add(i), $e(i, o));
		}
		let i = d.prototype;
		for (let e in i) Object.prototype.hasOwnProperty.call(i, e) && (e in n || (n[e] = i[e].bind(n)));
	}
	let l = r?.Parent ?? Object;
	class u extends l {}
	Object.defineProperty(u, "name", { value: e });
	function d(e) {
		let t = r?.Parent ? mt(u) : this;
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
var ht = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, gt = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(dt = globalThis).__zod_globalConfig ?? (dt.__zod_globalConfig = {});
var _t = globalThis.__zod_globalConfig;
function vt(e) {
	return e && Object.assign(_t, e), _t;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/errors.js
function yt() {
	let e = this._zod;
	return e.message ??= JSON.stringify(e.def, ce, 2), e.message;
}
function bt(e) {
	this._zod.message = e;
}
var xt = {
	get: yt,
	set: bt,
	enumerable: !0,
	configurable: !0
}, St = {
	value: void 0,
	enumerable: !1
}, Ct = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), wt = (e, t) => {
	e.name = "$ZodError", St.value = t, Object.defineProperty(e, "issues", St), St.value = void 0, Object.defineProperty(e, "message", xt);
	let n = Object.getPrototypeOf(e);
	Ct.has(n) || (Ct.add(n), Object.defineProperty(n, "toString", {
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
}, Tt = x("$ZodError", wt);
x("$ZodError", wt, void 0, { Parent: Error });
function Et(e, t, n) {
	return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, {
		value: n(),
		writable: !0,
		enumerable: !0,
		configurable: !0
	}) : e[t] = n()), e[t];
}
function Dt(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? Et(n, i.path[0], () => []).push(t(i)) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function Ot(e, t = (e) => e.message) {
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
function kt(e, t) {
	return {
		callee: t?.callee ?? e,
		Err: t?.Err
	};
}
var At = (e) => {
	let t = (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !1
		} : { async: !1 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise) throw new ht();
		if (s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => qe(e, o, vt())));
			throw Se(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, jt = (e) => {
	let t = async (n, r, i, a) => {
		let o = i ? {
			...i,
			async: !0
		} : { async: !0 }, s = n._zod.run({
			value: r,
			issues: []
		}, o);
		if (s instanceof Promise && (s = await s), s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => qe(e, o, vt())));
			throw Se(n, a?.callee ?? t), n;
		}
		return s.value;
	};
	return t;
}, Mt = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new ht();
	return a.issues.length ? Nt(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
};
function Nt(e, t, n) {
	let r;
	return {
		success: !1,
		get error() {
			return r || (r = new e(t.map((e) => qe(e, n, vt()))), t = void 0, n = void 0), r;
		},
		set error(e) {
			r = e, t = void 0, n = void 0;
		}
	};
}
var Pt = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		async: !0
	} : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? Nt(e, a.issues, i) : {
		success: !0,
		data: a.value
	};
}, Ft = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), It = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), Lt = ((e, t, n) => {
	let r = e._zod.bag.validator;
	if (r !== void 0) {
		if (r(t) !== Ft) return !0;
		if (r.definite === !0 && n === void 0) return !1;
	}
	return Rt(e, t, n);
});
function Rt(e, t, n) {
	let r = n ? {
		...n,
		async: !1,
		abortEarly: !0
	} : {
		async: !1,
		abortEarly: !0
	}, i = e._zod.bag.fallbackRun, a;
	if (i ? (r[It] = !0, a = i({
		value: t,
		issues: []
	}, r)) : a = e._zod.run({
		value: t,
		issues: []
	}, r), a instanceof Promise) throw new ht();
	return a.issues.length === 0;
}
var zt = async (e, t, n) => {
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
}, Bt = (e) => {
	let t = At(e), n = (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return t(e, r, o, kt(n, a));
	};
	return n;
}, Vt = (e) => {
	let t = At(e), n = (e, r, i, a) => t(e, r, i, kt(n, a));
	return n;
}, Ht = (e) => {
	let t = jt(e), n = async (e, r, i, a) => {
		let o = i ? {
			...i,
			direction: "backward"
		} : { direction: "backward" };
		return await t(e, r, o, kt(n, a));
	};
	return n;
}, Ut = (e) => {
	let t = jt(e), n = async (e, r, i, a) => await t(e, r, i, kt(n, a));
	return n;
}, Wt = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Mt(e)(t, n, i);
}, Gt = (e) => (t, n, r) => Mt(e)(t, n, r), Kt = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Pt(e)(t, n, i);
}, qt = (e) => async (t, n, r) => Pt(e)(t, n, r), Jt = /^[cC][0-9a-z]{6,}$/, Yt = /^[0-9a-z]+$/, Xt = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, Zt = /^[0-9a-vA-V]{20}$/, Qt = /^[A-Za-z0-9]{27}$/, $t = /^[a-zA-Z0-9_-]{21}$/;
function en(e) {
	return RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
var tn = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, nn = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, rn = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, an = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, on = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function sn() {
	return new RegExp(on, "u");
}
var cn = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, ln = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, un = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, dn = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, fn = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, pn = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, mn = /^https?$/, hn = /^\+[1-9]\d{6,14}$/, gn = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function _n(e) {
	return RegExp(`^${e}$`);
}
var vn = /*@__PURE__*/ _n(gn);
function yn(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function bn(e) {
	return RegExp(`^${yn(e)}$`);
}
function xn(e) {
	let t = ["Z"];
	e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let n = `${yn({
		precision: e.precision,
		seconds: !0
	})}(?:${t.join("|")})`, r = e.local ? `${n}|${yn({ precision: e.precision })}` : n;
	return RegExp(`^${gn}T(?:${r})$`);
}
var Sn = /^[\s\S]{0,}$/, Cn = /^-?\d+$/, wn = /^-?\d+(?:\.\d+)?$/, Tn = /^(?:true|false)$/i, En = /^[^A-Z]*$/, Dn = /^[^a-z]*$/, On = /*@__PURE__*/ x("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), kn = (e) => {
	let t = e.value;
	return !ue(t) && t.length !== void 0;
}, An = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, jn = /*@__PURE__*/ x("$ZodCheckLessThan", (e, t) => {
	On.init(e, t);
	let n = An[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: An[typeof r.value] ?? n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Mn = /*@__PURE__*/ x("$ZodCheckGreaterThan", (e, t) => {
	On.init(e, t);
	let n = An[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: An[typeof r.value] ?? n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Nn = /*@__PURE__*/ x("$ZodCheckMultipleOf", (e, t) => {
	On.init(e, t), e._zod.check = (n) => {
		if (typeof n.value != typeof t.value) throw Error("Cannot mix number and bigint in multiple_of check.");
		(typeof n.value == "bigint" ? t.value !== BigInt(0) && n.value % t.value === BigInt(0) : de(n.value, t.value) === 0) || n.issues.push({
			origin: typeof n.value,
			code: "not_multiple_of",
			divisor: t.value,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Pn = /*@__PURE__*/ x("$ZodCheckNumberFormat", (e, t) => {
	On.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = Me[t.format];
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
}), Fn = /*@__PURE__*/ x("$ZodCheckMaxLength", (e, t) => {
	var n;
	On.init(e, t), (n = e._zod.def).when ?? (n.when = kn), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i > t.maximum ? Ye(r) : i) <= t.maximum) return;
		let a = Xe(r);
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
}), In = /*@__PURE__*/ x("$ZodCheckMinLength", (e, t) => {
	var n;
	On.init(e, t), (n = e._zod.def).when ?? (n.when = kn), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i >= t.minimum && i < t.minimum * 2 ? Ye(r) : i) >= t.minimum) return;
		let a = Xe(r);
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
}), Ln = /*@__PURE__*/ x("$ZodCheckLengthEquals", (e, t) => {
	var n;
	On.init(e, t), (n = e._zod.def).when ?? (n.when = kn), e._zod.check = (n) => {
		let r = n.value, i = r.length, a = typeof r == "string" && i >= t.length && i <= t.length * 2 ? Ye(r) : i;
		if (a === t.length) return;
		let o = Xe(r), s = a > t.length;
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
}), Rn = /*@__PURE__*/ x("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	On.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
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
}), zn = /*@__PURE__*/ x("$ZodCheckRegex", (e, t) => {
	Rn.init(e, t), e._zod.check = (n) => {
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
}), Bn = /*@__PURE__*/ x("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= En, Rn.init(e, t);
}), Vn = /*@__PURE__*/ x("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= Dn, Rn.init(e, t);
}), Hn = /*@__PURE__*/ x("$ZodCheckIncludes", (e, t) => {
	On.init(e, t);
	let n = Oe(t.includes);
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
}), Un = /*@__PURE__*/ x("$ZodCheckStartsWith", (e, t) => {
	On.init(e, t);
	let n = RegExp(`^${Oe(t.prefix)}.*`);
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
}), Wn = /*@__PURE__*/ x("$ZodCheckEndsWith", (e, t) => {
	On.init(e, t);
	let n = RegExp(`.*${Oe(t.suffix)}$`);
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
}), Gn = /*@__PURE__*/ x("$ZodCheckOverwrite", (e, t) => {
	On.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), Kn = class {
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
}, qn = {
	major: 4,
	minor: 6,
	patch: 5
}, S = /*@__PURE__*/ x("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = qn;
	let r = e._zod.def.checks, i = e._zod.traits.has("$ZodCheck") ? [e, ...r ?? []] : r?.length ? [...r] : [];
	for (let t of i) for (let n of t._zod.onattach) n(e);
	if (i.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (t, n, r) => {
			if (t.memo) return t;
			let i = He(t), a;
			for (let o of n) {
				if (o._zod.def.when) {
					if (Ue(t) || !o._zod.def.when(t)) continue;
				} else if (i) continue;
				let n = t.issues.length, s = o._zod.check(t);
				if (s instanceof Promise && r?.async === !1) throw new ht();
				if (a || s instanceof Promise) a = (a ?? Promise.resolve()).then(async () => {
					await s, t.issues.length !== n && (Ke(t.issues, n, e), i ||= He(t, n));
				});
				else {
					if (t.issues.length === n) continue;
					Ke(t.issues, n, e), i ||= He(t, n);
				}
			}
			return a ? a.then(() => t) : t;
		}, n = (n, r, a) => {
			if (He(n)) return n.aborted = !0, n;
			let o = t(r, i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new ht();
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
				if (a.async === !1) throw new ht();
				return o.then((e) => t(e, i, a));
			}
			return t(o, i, a);
		};
	}
}, {
	get "~standard"() {
		return tt(this, "~standard", Xn(this));
	},
	set "~standard"(e) {
		et(this, "~standard", e);
	}
}), Jn = (e, t) => e.issues.length ? { issues: e.issues.map((e) => qe(e, t, vt())) } : { value: e.value };
async function Yn(e, t) {
	let n = { async: !0 };
	return Jn(await e._zod.run({
		value: t,
		issues: []
	}, n), n);
}
function Xn(e) {
	return {
		validate: (t) => {
			let n = { async: !1 };
			try {
				let r = e._zod.run({
					value: t,
					issues: []
				}, n);
				if (!(r instanceof Promise)) return Jn(r, n);
			} catch {}
			return Yn(e, t);
		},
		vendor: "zod",
		version: 1
	};
}
var Zn = /*@__PURE__*/ x("$ZodString", (e, t) => {
	S.init(e, t), e._zod.pattern = t.pattern ?? Sn, e._zod.parse = (n, r) => {
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
}), C = /*@__PURE__*/ x("$ZodStringFormat", (e, t) => {
	Rn.init(e, t), Zn.init(e, t);
}), Qn = /*@__PURE__*/ x("$ZodGUID", (e, t) => {
	t.pattern ??= nn, C.init(e, t);
}), $n = /*@__PURE__*/ x("$ZodUUID", (e, t) => {
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
		t.pattern ??= rn(e);
	} else t.pattern ??= rn();
	C.init(e, t);
}), er = /*@__PURE__*/ x("$ZodEmail", (e, t) => {
	t.pattern ??= an, C.init(e, t);
});
function tr(e) {
	try {
		return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
	} catch {
		return !1;
	}
}
function nr(e, t) {
	return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? tr(e) || 2 : rr(e, t);
}
function rr(e, t) {
	if (!t.normalize && t.protocol?.source === mn.source && !/^https?:\/\//i.test(e)) return 1;
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
var ir = /[\t\n\r]/g;
function ar(e) {
	return e.replace(ir, "");
}
function or(e, t) {
	return t.lastIndex = 0, t.test(e.hostname);
}
function sr(e, t) {
	return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
var cr = /*@__PURE__*/ x("$ZodURL", (e, t) => {
	C.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim(), i = nr(r, t);
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
				n.value = ar(r);
				return;
			}
			t.hostname && !or(i, t.hostname) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), t.protocol && !sr(i, t.protocol) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), n.value = t.normalize ? i.href : ar(r);
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
}), lr = /*@__PURE__*/ x("$ZodEmoji", (e, t) => {
	t.pattern ??= sn(), C.init(e, t);
}), ur = /*@__PURE__*/ x("$ZodNanoID", (e, t) => {
	if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1)) throw Error(`Invalid nanoid length: ${t.length}`);
	t.pattern ??= t.length === void 0 ? $t : en(t.length), C.init(e, t);
}), dr = /*@__PURE__*/ x("$ZodCUID", (e, t) => {
	t.pattern ??= Jt, C.init(e, t);
}), fr = /*@__PURE__*/ x("$ZodCUID2", (e, t) => {
	t.pattern ??= Yt, C.init(e, t);
}), pr = /*@__PURE__*/ x("$ZodULID", (e, t) => {
	t.pattern ??= Xt, C.init(e, t);
}), mr = /*@__PURE__*/ x("$ZodXID", (e, t) => {
	t.pattern ??= Zt, C.init(e, t);
}), hr = /*@__PURE__*/ x("$ZodKSUID", (e, t) => {
	t.pattern ??= Qt, C.init(e, t);
}), gr = /*@__PURE__*/ x("$ZodISODateTime", (e, t) => {
	t.pattern ??= xn(t), C.init(e, t);
}), _r = /*@__PURE__*/ x("$ZodISODate", (e, t) => {
	t.pattern ??= vn, C.init(e, t);
}), vr = /*@__PURE__*/ x("$ZodISOTime", (e, t) => {
	t.pattern ??= bn(t), C.init(e, t);
}), yr = /*@__PURE__*/ x("$ZodISODuration", (e, t) => {
	t.pattern ??= tn, C.init(e, t);
}), br = /*@__PURE__*/ x("$ZodIPv4", (e, t) => {
	t.pattern ??= cn, C.init(e, t);
}), xr = /^[0-9a-fA-F:.]+$/;
function Sr(e) {
	return xr.test(e) ? tr(`http://[${e}]`) : !1;
}
var Cr = /*@__PURE__*/ x("$ZodIPv6", (e, t) => {
	t.pattern ??= ln, C.init(e, t), e._zod.check = (n) => {
		Sr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), wr = /*@__PURE__*/ x("$ZodCIDRv4", (e, t) => {
	t.pattern ??= un, C.init(e, t);
});
function Tr(e) {
	let t = e.split("/");
	if (t.length !== 2) return !1;
	let [n, r] = t;
	if (!r) return !1;
	let i = Number(r);
	return `${i}` !== r || i < 0 || i > 128 ? !1 : Sr(n);
}
var Er = /*@__PURE__*/ x("$ZodCIDRv6", (e, t) => {
	t.pattern ??= dn, C.init(e, t), e._zod.check = (n) => {
		Tr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function Dr(e) {
	if (e === "") return !0;
	if (/\s/.test(e) || e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var Or = /^[0-9a-zA-Z+/]*={0,2}$/, kr = /*@__PURE__*/ x("$ZodBase64", (e, t) => {
	t.pattern ??= Or, C.init(e, t), e._zod.check = (n) => {
		Dr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Ar = /^[A-Za-z0-9_-]*$/;
function jr(e) {
	if (!Ar.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return Dr(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var Mr = /*@__PURE__*/ x("$ZodBase64URL", (e, t) => {
	t.pattern ??= Ar, C.init(e, t), e._zod.check = (n) => {
		jr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Nr = /*@__PURE__*/ x("$ZodE164", (e, t) => {
	t.pattern ??= hn, C.init(e, t);
});
function Pr(e, t = null) {
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
var Fr = /*@__PURE__*/ x("$ZodJWT", (e, t) => {
	C.init(e, t), e._zod.check = (n) => {
		Pr(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Ir = /*@__PURE__*/ x("$ZodNumber", (e, t) => {
	S.init(e, t), e._zod.pattern = wn, e._zod.parse = (n, r) => {
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
}), Lr = /*@__PURE__*/ x("$ZodNumberFormat", (e, t) => {
	Pn.init(e, t), Ir.init(e, t);
}), Rr = /*@__PURE__*/ x("$ZodBoolean", (e, t) => {
	S.init(e, t), e._zod.pattern = Tn, e._zod.parse = (n, r) => {
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
}), zr = /*@__PURE__*/ x("$ZodUnknown", (e, t) => {
	S.init(e, t), e._zod.parse = (e) => e;
}), Br = /*@__PURE__*/ x("$ZodNever", (e, t) => {
	S.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function Vr(e, t, n) {
	e.issues.length && t.issues.push(...We(n, e.issues)), t.value[n] = e.value;
}
var Hr = /*@__PURE__*/ x("$ZodArray", (e, t) => {
	S.init(e, t);
	let n = _t.memoizer;
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
			if (c instanceof Promise) o.push(c.then((t) => Vr(t, r, e)));
			else if (Vr(c, r, e), s && c.issues.length !== 0 && He(c)) break;
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	};
});
function Ur(e, t, n, r, i, a) {
	let o = n in r, s = a === "optional";
	if (o || !s || i !== "optional") {
		if (e.issues.length) {
			if (i !== void 0 && s && !o) return;
			t.issues.push(...We(n, e.issues));
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
var Wr = [];
function Gr(e) {
	let t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : Wr, i = r.length ? [...t, ...r] : t;
	for (let t of i) if (!e.shape?.[t]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${String(t)}": expected a Zod schema`);
	let a = je(e.shape);
	return {
		...e,
		allKeys: i,
		symbolKeys: r,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(a)
	};
}
function Kr(e, t, n, r, i, a, o) {
	let s = [], c = i.keySet, l = i.catchall._zod, u = l.def.type, d = l.optin, f = l.optout, p = 0;
	for (let i in t) {
		if (o && n.issues.length !== p) {
			if (He(n, p)) break;
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
		a instanceof Promise ? e.push(a.then((e) => Ur(e, n, i, t, d, f))) : Ur(a, n, i, t, d, f);
	}
	return s.length && n.issues.push({
		code: "unrecognized_keys",
		keys: s,
		input: t,
		inst: a,
		continue: !0
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var qr = /*@__PURE__*/ x("$ZodObject", (e, t) => {
	S.init(e, t);
	let n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
	if (r) {
		let e = () => {
			let n = { ...r };
			return Object.defineProperty(t, "shape", { value: n }), e.raw = n, n;
		};
		e.raw = r, Object.defineProperty(t, "shape", { get: e });
	}
	let i = le(() => Gr(t));
	b(e, "propValues", (e) => {
		let t = e.def.shape, n = {};
		for (let e in t) {
			let r = t[e]._zod;
			if (r.values) {
				Object.prototype.hasOwnProperty.call(n, e) || fe(n, e, /* @__PURE__ */ new Set());
				for (let t of r.values) n[e].add(t);
				r.optin !== void 0 && n[e].add(void 0);
			}
		}
		return n;
	});
	let a = Ce, o = t.catchall, s, c = _t.memoizer;
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
				if (He(t, f)) break;
				f = t.issues.length;
			}
			if (e === "__proto__") continue;
			let i = u[e], a = i._zod.optin, o = i._zod.optout, s = i._zod.run({
				value: r[e],
				issues: []
			}, n);
			s instanceof Promise ? l.push(s.then((n) => Ur(n, t, e, r, a, o))) : Ur(s, t, e, r, a, o);
		}
		return o ? Kr(l, r, t, n, i.value, e, d === !0) : l.length ? Promise.all(l).then(() => t) : t;
	};
}), Jr = /*@__PURE__*/ x("$ZodObjectJIT", (e, t) => {
	qr.init(e, t);
	let n = e._zod.parse, r = le(() => Gr(t)), i = _t.memoizer, a = (t) => {
		let n = r.value, a = n.symbolKeys, o = new Kn(["payload", "ctx"], {
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
	}, o, s = Ce, c = !_t.jitless, l = c && we.value, u = t.catchall, d;
	e._zod.parse = (i, f) => {
		d ??= r.value;
		let p = i.value;
		return s(p) ? c && l && f?.async === !1 && f.jitless !== !0 ? (o ||= a(t.shape), i = o(i, f), u ? Kr([], p, i, f, d, e, f?.abortEarly === !0) : i) : n(i, f) : (i.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), i);
	};
});
function Yr(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !He(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => qe(e, r, vt())))
	}), t);
}
var Xr = /*@__PURE__*/ x("$ZodUnion", (e, t) => {
	S.init(e, t), b(e, "optin", (e) => e.def.options.some((e) => e._zod.optin === "defaulted") ? "defaulted" : e.def.options.some((e) => e._zod.optin !== void 0) ? "optional" : void 0), b(e, "optout", (e) => e.def.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), b(e, "values", (e) => {
		if (e.def.options.every((e) => e._zod.values)) return new Set(e.def.options.flatMap((e) => Array.from(e._zod.values)));
	}), b(e, "pattern", (e) => {
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
		return a ? Promise.all(o).then((t) => Yr(t, r, e, i)) : Yr(o, r, e, i);
	};
}), Zr = /*@__PURE__*/ x("$ZodIntersection", (e, t) => {
	S.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => $r(e, t, n)) : $r(e, i, a);
	};
});
function Qr(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (Te(e) && Te(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		Object.prototype.hasOwnProperty.call(i, "__proto__") && delete i.__proto__;
		for (let n of r) {
			if (n === "__proto__") continue;
			let r = Qr(e[n], t[n]);
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
			let i = e[r], a = t[r], o = Qr(i, a);
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
function $r(e, t, n) {
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
	let c = Qr(t.value, n.value);
	if (!c.valid) {
		if (He(e)) return e;
		throw Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
	}
	return e.value = c.data, e;
}
var ei = /*@__PURE__*/ x("$ZodRecord", (e, t) => {
	S.init(e, t);
	let n = _t.memoizer;
	n?.attach(e), e._zod.parse = (r, i) => {
		let a = r.value;
		if (!Te(a)) return r.issues.push({
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
						issues: s.issues.map((e) => qe(e, i, vt())),
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
					e.issues.length && r.issues.push(...We(n, e.issues)), r.value[l] = e.value;
				})) : (u.issues.length && r.issues.push(...We(n, u.issues)), r.value[l] = u.value);
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
				if (typeof n == "string" && wn.test(n) && l.issues.length) {
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
						issues: l.issues.map((e) => qe(e, i, vt())),
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
					e.issues.length && r.issues.push(...We(n, e.issues)), r.value[u] = e.value;
				})) : (d.issues.length && r.issues.push(...We(n, d.issues)), r.value[u] = d.value);
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
}), ti = /*@__PURE__*/ x("$ZodEnum", (e, t) => {
	S.init(e, t);
	let n = oe(t.entries), r = new Set(n);
	e._zod.values = r, b(e, "pattern", (e) => {
		let t = oe(e.def.entries).filter((e) => De.has(typeof e));
		return RegExp(t.length ? `^(${t.map((e) => Oe(e.toString())).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), ni = /*@__PURE__*/ x("$ZodLiteral", (e, t) => {
	S.init(e, t);
	let n = new Set(t.values);
	e._zod.values = n, b(e, "pattern", (e) => {
		let t = e.def.values;
		return RegExp(t.length ? `^(${t.map((e) => typeof e == "string" ? Oe(e) : e ? Oe(e.toString()) : String(e)).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (r, i) => {
		let a = r.value;
		return n.has(a) || r.issues.push({
			code: "invalid_value",
			values: t.values,
			input: a,
			inst: e
		}), r;
	};
}), ri = /*@__PURE__*/ x("$ZodTransform", (e, t) => {
	S.init(e, t), e._zod.optin = "optional", _t.memoizer?.guard(e), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new gt(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new ht();
		return n.value = i, n;
	};
});
function ii(e, t) {
	return e.value = t.issues.length ? void 0 : t.value, e;
}
var ai = /*@__PURE__*/ x("$ZodOptional", (e, t) => {
	S.init(e, t), b(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", b(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? /* @__PURE__ */ new Set([...t, void 0]) : void 0;
	}), b(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${_(t.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (e.value === void 0) {
			if (t.innerType._zod.optin !== "defaulted") return e;
			let r = t.innerType._zod.run({
				value: e.value,
				issues: []
			}, n);
			return r instanceof Promise ? r.then((t) => ii(e, t)) : ii(e, r);
		}
		return t.innerType._zod.run(e, n);
	};
}), oi = /*@__PURE__*/ x("$ZodExactOptional", (e, t) => {
	ai.init(e, t), b(e, "values", (e) => e.def.innerType._zod.values), b(e, "pattern", (e) => e.def.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), si = /*@__PURE__*/ x("$ZodNullable", (e, t) => {
	S.init(e, t), b(e, "optin", (e) => e.def.innerType._zod.optin), b(e, "optout", (e) => e.def.innerType._zod.optout), b(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${_(t.source)}|null)$`) : void 0;
	}), b(e, "values", (e) => e.def.innerType._zod.values ? /* @__PURE__ */ new Set([...e.def.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), ci = /*@__PURE__*/ x("$ZodDefault", (e, t) => {
	S.init(e, t), e._zod.optin = "defaulted", b(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => li(e, t)) : li(r, t);
	};
});
function li(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var ui = /*@__PURE__*/ x("$ZodPrefault", (e, t) => {
	S.init(e, t), e._zod.optin = "defaulted", b(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), di = /*@__PURE__*/ x("$ZodNonOptional", (e, t) => {
	S.init(e, t), b(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? new Set([...t].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => fi(t, e)) : fi(i, e);
	};
});
function fi(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
function pi(e, t, n, r) {
	return t.issues.length ? (e.value = n.catchValue({
		...t,
		value: e.value,
		error: { issues: t.issues.map((e) => qe(e, r, vt())) },
		input: e.value
	}), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
var mi = /*@__PURE__*/ x("$ZodCatch", (e, t) => {
	S.init(e, t), b(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), b(e, "optout", (e) => e.def.innerType._zod.optout), b(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run({
			value: e.value,
			issues: []
		}, n);
		return r instanceof Promise ? r.then((r) => pi(e, r, t, n)) : pi(e, r, t, n);
	};
}), hi = /*@__PURE__*/ x("$ZodPipe", (e, t) => {
	S.init(e, t), b(e, "values", (e) => e.def.in._zod.values), b(e, "optin", (e) => e.def.in._zod.optin), b(e, "optout", (e) => e.def.out._zod.optout), b(e, "propValues", (e) => e.def.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => gi(e, t.in, n)) : gi(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => gi(e, t.out, n)) : gi(r, t.out, n);
	};
});
function gi(e, t, n) {
	return e.issues.some((e) => e.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues
	}, n);
}
var _i = /*@__PURE__*/ x("$ZodReadonly", (e, t) => {
	S.init(e, t), b(e, "propValues", (e) => e.def.innerType._zod.propValues), b(e, "values", (e) => e.def.innerType._zod.values), b(e, "optin", (e) => e.def.innerType?._zod?.optin), b(e, "optout", (e) => e.def.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(vi) : vi(r);
	};
});
function vi(e) {
	return e.memo || (e.value = Object.freeze(e.value)), e;
}
var yi = /*@__PURE__*/ x("$ZodCustom", (e, t) => {
	On.init(e, t), S.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => bi(t, n, r, e));
		bi(i, n, r, e);
	};
});
function bi(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(Qe(e));
	}
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/memoizer.js
var xi = class extends Error {
	constructor() {
		super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
	}
}, Si = "~memo", Ci = [];
function wi(e) {
	return typeof e == "object" && !!e;
}
function Ti(e) {
	return e.map((e) => e.path ? {
		...e,
		path: e.path.slice()
	} : { ...e });
}
var Ei = /*@__PURE__*/ new WeakMap(), Di = 0, Oi = 1, ki = 2;
function Ai(e, t, n) {
	let r = Ei.get(e);
	if (r !== void 0) return r ? ki : Di;
	if (t.has(e)) return ki;
	t.add(e);
	let i = Di, a = (e) => {
		if (i !== ki && e?._zod) {
			let r = Ai(e, t, n);
			r > i && (i = r);
		}
	}, o = (e, r) => {
		let i = Di;
		for (let a of Reflect.ownKeys(e)) {
			let o = Object.getOwnPropertyDescriptor(e, a);
			if (r && !o.enumerable) continue;
			let s = o.get ? Oi : o.value?._zod ? Ai(o.value, t, n) : Di;
			s > i && (i = s);
		}
		return i;
	}, s = (e) => {
		e > i && (i = e);
	}, c = e._zod.def;
	switch (c.type) {
		case "object": {
			let e = pe(c);
			s(e ? o(e, !0) : Oi), a(c.catchall);
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
			s(r ? Ai(r, t, !1) : Oi);
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
	return t.delete(e), ji(e, i);
}
function ji(e, t) {
	return t !== Oi && Ei.set(e, t === ki), t;
}
function Mi(e, t) {
	let n = e.buckets.get(t);
	return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
var Ni, Pi = [], Fi = {
	alloc(e, t, n) {
		let r = Ni;
		if (!r) return n;
		Ni = void 0;
		let i = {
			value: n,
			issues: null
		};
		return r.set(t.value, i), Pi.push(i), n;
	},
	guard(e) {
		var t;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, n = (e, n) => {
				if (n.direction !== "backward" && Li(n, e.value)) throw new xi();
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
					let i = Ai(e, /* @__PURE__ */ new Set(), !1);
					if (i === Di) return e._zod.parse = t, e._zod.run === o && (e._zod.run = t), t(s, c);
					i === ki || r ? n = !0 : r = !0;
				}
				let l = s.value;
				if (!wi(l)) return t(s, c);
				let u = c[Si];
				u || (u = {
					buckets: /* @__PURE__ */ new WeakMap(),
					backEdges: void 0
				}, c[Si] = u);
				let d;
				i === c ? d = a : (d = Mi(u, e), i = c, a = d);
				let f = d.get(l);
				if (f) return s.value = f.value, f.issues ? f.issues.length && s.issues.push(...Ti(f.issues)) : (s.memo = !0, u.backEdges ?? (u.backEdges = /* @__PURE__ */ new WeakSet()), u.backEdges.add(f.value)), s;
				Ni = d;
				let p = Pi.length, m = t(s, c);
				Ni = void 0;
				let h = Pi.length > p ? Pi.pop() : void 0;
				return m instanceof Promise ? m.then((e) => (h && (h.issues = e.issues.length ? Ti(e.issues) : Ci), e)) : (h && (h.issues = m.issues.length ? Ti(m.issues) : Ci), m);
			};
			e._zod.parse = o, e._zod.run === t && (e._zod.run = o);
		});
	}
};
function Ii() {
	return Fi;
}
function Li(e, t) {
	let n = e[Si]?.backEdges;
	return n !== void 0 && wi(t) && n.has(t);
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/locales/en.js
var Ri = () => {
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
			case "invalid_type": return `Invalid input: expected ${i(e.expected)}, received ${i(Ze(e.input), e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Invalid input: expected ${Ae(e.values[0])}` : `Invalid option: expected one of ${se(e.values, "|")}`;
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
			case "unrecognized_keys": return `Unrecognized key${e.keys.length > 1 ? "s" : ""}: ${se(e.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${e.origin}`;
			case "invalid_union": return e.options && Array.isArray(e.options) && e.options.length > 0 ? `Invalid discriminator value. Expected ${e.options.map((e) => `'${e}'`).join(" | ")}` : e.inclusive === !1 ? "Invalid input: more than one option matched" : "Invalid input";
			case "invalid_element": return `Invalid value in ${e.origin}`;
			default: return "Invalid input";
		}
	};
};
function zi() {
	return { localeError: Ri() };
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/registries.js
var Bi, Vi = class {
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
function Hi() {
	return new Vi();
}
(Bi = globalThis).__zod_globalRegistry ?? (Bi.__zod_globalRegistry = Hi());
var Ui = globalThis.__zod_globalRegistry;
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/api.js
function Wi(e) {
	return e.checks &&= [...e.checks], e;
}
// @__NO_SIDE_EFFECTS__
function Gi(e, t) {
	return new e(Wi({
		type: "string",
		...v(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function Ki(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function qi(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ji(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Yi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Xi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Zi(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Qi(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function $i(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ea(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ta(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function na(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ra(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ia(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function aa(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function oa(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function sa(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ca(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function la(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ua(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function da(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function fa(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function pa(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ma(e, t) {
	return new e({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ha(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ga(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function _a(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function va(e, t) {
	return new e(Wi({
		type: "number",
		checks: [],
		...v(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function ya(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ba(e, t) {
	return new e({
		type: "boolean",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function xa(e) {
	return new e({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function Sa(e, t) {
	return new e({
		type: "never",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ca(e, t) {
	return new jn({
		check: "less_than",
		...v(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function wa(e, t) {
	return new jn({
		check: "less_than",
		...v(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Ta(e, t) {
	return new Mn({
		check: "greater_than",
		...v(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function Ea(e, t) {
	return new Mn({
		check: "greater_than",
		...v(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function Da(e, t) {
	return new Nn({
		check: "multiple_of",
		...v(t),
		value: e
	});
}
// @__NO_SIDE_EFFECTS__
function Oa(e, t) {
	return new Fn({
		check: "max_length",
		...v(t),
		maximum: e
	});
}
// @__NO_SIDE_EFFECTS__
function ka(e, t) {
	return new In({
		check: "min_length",
		...v(t),
		minimum: e
	});
}
// @__NO_SIDE_EFFECTS__
function Aa(e, t) {
	return new Ln({
		check: "length_equals",
		...v(t),
		length: e
	});
}
// @__NO_SIDE_EFFECTS__
function ja(e, t) {
	return new zn({
		check: "string_format",
		format: "regex",
		...v(t),
		pattern: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ma(e) {
	return new Bn({
		check: "string_format",
		format: "lowercase",
		...v(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Na(e) {
	return new Vn({
		check: "string_format",
		format: "uppercase",
		...v(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Pa(e, t) {
	return new Hn({
		check: "string_format",
		format: "includes",
		...v(t),
		includes: e
	});
}
// @__NO_SIDE_EFFECTS__
function Fa(e, t) {
	return new Un({
		check: "string_format",
		format: "starts_with",
		...v(t),
		prefix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ia(e, t) {
	return new Wn({
		check: "string_format",
		format: "ends_with",
		...v(t),
		suffix: e
	});
}
// @__NO_SIDE_EFFECTS__
function La(e) {
	return new Gn({
		check: "overwrite",
		tx: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ra(e) {
	return /* @__PURE__ */ La((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function za() {
	return /* @__PURE__ */ La((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Ba() {
	return /* @__PURE__ */ La((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Va() {
	return /* @__PURE__ */ La((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function Ha() {
	return /* @__PURE__ */ La((e) => xe(e));
}
// @__NO_SIDE_EFFECTS__
function Ua(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...v(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Wa(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...v(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Ga(e, t) {
	let n = /* @__PURE__ */ Ka((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(Qe(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", "input" in r || (r.input = t.value), r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(Qe(r));
		}
	}, e(t.value, t)), t);
	return n;
}
// @__NO_SIDE_EFFECTS__
function Ka(e, t) {
	let n = new On({
		check: "custom",
		...v(t)
	});
	return n._zod.check = e, n;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/to-json-schema.js
function qa(e, ...t) {
	for (let n of t) for (let t of Reflect.ownKeys(n)) Object.prototype.propertyIsEnumerable.call(n, t) && fe(e, t, n[t]);
	return e;
}
function Ja(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? Ui,
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
function Ya(e, t, n, r, i) {
	let a = typeof t.unrepresentable == "function" ? t.unrepresentable({
		zodSchema: e,
		path: r.path,
		message: i
	}) : t.unrepresentable;
	if (a === "any") return !1;
	if (a === void 0 || a === "throw") throw Error(i);
	return Object.assign(n, a), !0;
}
function w(e, t, n = {
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
		a && (o.ref ||= a, w(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && qa(o.schema, c), t.io === "input" && ao(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function Xa(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function Za(e, t) {
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
				ref: `${i("__shared")}#/${r}/${Xa(a)}`
			};
		}
		let i = `#/${r}/`;
		if (t[1] === n && !t[1].schema.id) return { ref: "#" };
		let a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + Xa(a)
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
function Qa(e) {
	let t = e.anyOf;
	if (!Array.isArray(t) || t.length === 0 || e.type !== void 0) return;
	let n = [];
	for (let e of t) {
		if (!e || typeof e != "object") return;
		Qa(e);
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
var $a = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]), eo = ["oneOf", "anyOf"];
function to(e) {
	let t = e.additionalProperties;
	return t === void 0 || t === !1 || typeof t != "object" || !t ? null : Object.keys(t).length ? t : null;
}
function no(e) {
	let t = [];
	for (let n of e) {
		if (typeof n != "object" || n.type !== "object") return null;
		for (let e in n) if (!$a.has(e)) return null;
		t.push(n);
	}
	let n = {}, r = /* @__PURE__ */ new Set();
	for (let e of t) {
		for (let r in e.properties) {
			if (Object.prototype.hasOwnProperty.call(n, r)) continue;
			let e = [];
			for (let n of t) {
				let t = n.properties?.[r] ?? to(n);
				t != null && (e.some((e) => JSON.stringify(e) === JSON.stringify(t)) || e.push(t));
			}
			fe(n, r, e.length === 1 ? e[0] : no(e) ?? { allOf: e });
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
			let t = to(n);
			t && !e.some((e) => JSON.stringify(e) === JSON.stringify(t)) && e.push(t);
		}
		e.length === 1 ? i.additionalProperties = e[0] : e.length > 1 && (i.additionalProperties = { allOf: e });
	}
	return i;
}
function ro(e) {
	let t = e.allOf;
	if (!Array.isArray(t) || t.length < 2) return;
	for (let t of $a) if (t in e) return;
	let n = t.filter((e) => eo.some((t) => Array.isArray(e[t]))), r = null;
	if (!n.length) r = no(t);
	else {
		let e = n[0], i = eo.find((t) => Array.isArray(e[t]));
		if (Object.keys(e).length !== 1) return;
		let a = t.filter((t) => t !== e), o = e[i].map((e) => no([...a, e]));
		if (o.some((e) => !e)) return;
		r = { [i]: o };
	}
	r && (delete e.allOf, qa(e, r));
}
function io(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : qa(i, s), qa(i, a), t._zod.parent === o) for (let e in i) e !== "$ref" && e !== "allOf" && (e in a || delete i[e]);
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
		if (e.target !== "openapi-3.0") for (let t of e.seen.entries()) Qa(t[1].def ?? t[1].schema);
		for (let t of e.deferred) t();
		if (e.intersections.length) {
			let t = /* @__PURE__ */ new Map();
			for (let n of e.seen.values()) for (let e of [n.schema, n.def]) {
				let n = e?.allOf;
				if (!Array.isArray(n)) continue;
				let r = t.get(n);
				r ? r.push(e) : t.set(n, [e]);
			}
			for (let n of e.intersections) for (let e of t.get(n) ?? []) ro(e);
		}
	}
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	qa(i, n.defId ? n.schema : n.def ?? n.schema);
	let a = e.metadataRegistry.get(t)?.id;
	a !== void 0 && i.id === a && delete i.id;
	let o = e.external?.defs ?? {};
	if (!e.external || e.sharedEmitDoneFor !== e.external) for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (e.def.id === e.defId && delete e.def.id, fe(o, e.defId, e.def));
	}
	e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(o).length > 0 && (e.target === "draft-2020-12" ? i.$defs = o : i.definitions = o);
	try {
		let n = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: so(t, "input", e.processors),
					output: so(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function ao(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return ao(r.element, n);
	if (r.type === "set") return ao(r.valueType, n);
	if (r.type === "lazy") return ao(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch") return ao(r.innerType, n);
	if (r.type === "intersection") return ao(r.left, n) || ao(r.right, n);
	if (r.type === "record" || r.type === "map") return ao(r.keyType, n) || ao(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : ao(r.in, n) || ao(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (ao(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (ao(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (ao(e, n)) return !0;
		return !!(r.rest && ao(r.rest, n));
	}
	return !1;
}
var oo = (e, t = {}) => (n) => {
	let r = Ja({
		...n,
		processors: t
	});
	return w(e, r), Za(r, e), io(r, e);
}, so = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = Ja({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return w(e, o), Za(o, e), io(o, e);
}, co = (e, t, n) => {
	(e[t] === void 0 || n > e[t]) && (e[t] = n);
}, lo = (e, t, n) => {
	(e[t] === void 0 || n < e[t]) && (e[t] = n);
}, uo = (e, t) => {
	co(e, "minimum", t), lo(e, "maximum", t);
}, fo = (e, t) => {
	e.multipleOf ??= [], e.multipleOf.includes(t) || e.multipleOf.push(t);
}, po = (e, t) => {
	e.patterns ??= /* @__PURE__ */ new Set(), e.patterns.add(t);
}, mo = (e, t) => {
	e.mime = e.mime ? e.mime.filter((e) => t.includes(e)) : [...t];
}, ho = (e, t) => {
	e.format = t, t.includes("int") && (e.isInt = !0);
}, go = (e, t) => co(e, "minimum", t.minimum), _o = (e, t) => lo(e, "maximum", t.maximum), vo = (e) => (t, n) => {
	ho(t, n.format);
	let [r, i] = e[n.format];
	co(t, "minimum", r), lo(t, "maximum", i);
}, yo = {
	greater_than: (e, t) => co(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
	less_than: (e, t) => lo(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
	multiple_of: (e, t) => fo(e, t.value),
	number_format: vo(Me),
	bigint_format: vo(Ne),
	min_length: go,
	max_length: _o,
	length_equals: (e, t) => uo(e, t.length),
	min_size: go,
	max_size: _o,
	size_equals: (e, t) => uo(e, t.size),
	string_format: (e, t) => {
		ho(e, t.format), t.pattern && po(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
	},
	mime_type: (e, t) => mo(e, t.mime)
};
function bo(e) {
	let t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
	for (let e of r) yo[e._zod.def.check]?.(t, e._zod.def);
	let i = e._zod.bag;
	i.minimum !== void 0 && co(t, "minimum", i.minimum), i.exclusiveMinimum !== void 0 && co(t, "exclusiveMinimum", i.exclusiveMinimum), i.maximum !== void 0 && lo(t, "maximum", i.maximum), i.exclusiveMaximum !== void 0 && lo(t, "exclusiveMaximum", i.exclusiveMaximum), i.multipleOf !== void 0 && fo(t, i.multipleOf), i.format !== void 0 && (t.format ??= i.format, i.format.includes("int") && (t.isInt = !0)), i.mime && mo(t, i.mime);
	for (let e of i.patterns ?? []) po(t, e);
	return t;
}
var xo = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, So = /* @__PURE__ */ new Map([[Or, fn], [Ar, pn]]), Co = (e) => So.get(e) ?? e, wo = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l, laxFormat: u } = bo(e);
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = xo[s] ?? s, i.format === "" && delete i.format, (s === "time" || u) && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c].map(Co);
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, To = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, multipleOf: s, exclusiveMaximum: c, exclusiveMinimum: l, isInt: u } = bo(e);
	i.type = u ? "integer" : "number";
	let d = typeof l == "number" && l >= (a ?? -Infinity), f = typeof c == "number" && c <= (o ?? Infinity), p = t.target === "draft-04" || t.target === "openapi-3.0";
	if (d ? p ? (i.minimum = l, i.exclusiveMinimum = !0) : i.exclusiveMinimum = l : typeof a == "number" && (i.minimum = a), f ? p ? (i.maximum = c, i.exclusiveMaximum = !0) : i.exclusiveMaximum = c : typeof o == "number" && (i.maximum = o), s) {
		let n = /* @__PURE__ */ new Set();
		for (let a of s) Number.isFinite(a) && a !== 0 ? n.add(Math.abs(a)) : Ya(e, t, i, r, `A multipleOf divisor of ${a} cannot be represented in JSON Schema`);
		let [a, ...o] = n;
		a !== void 0 && (i.multipleOf = a), o.length && (i.allOf = [...i.allOf ?? [], ...o.map((e) => ({ multipleOf: e }))]);
	}
}, Eo = (e, t, n, r) => {
	n.type = "boolean";
}, Do = (e, t, n, r) => {
	n.not = {};
}, Oo = (e, t, n, r) => {
	let i = e._zod.def, a = oe(i.entries);
	if (a.length === 0) {
		n.not = {};
		return;
	}
	a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a;
}, ko = (e, t, n, r) => {
	let i = e._zod.def;
	if (i.values.length === 0) {
		n.not = {};
		return;
	}
	let a = [];
	for (let o of i.values) if (o === void 0) {
		if (Ya(e, t, n, r, "Literal `undefined` cannot be represented in JSON Schema")) return;
	} else if (typeof o == "bigint") {
		if (Ya(e, t, n, r, "BigInt literals cannot be represented in JSON Schema")) return;
		a.push(Number(o));
	} else a.push(o);
	if (a.length !== 0) {
		if (a.length === 1) {
			let e = a[0];
			n.type = e === null ? "null" : typeof e, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [e] : n.const = e;
		} else a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), a.every((e) => typeof e == "boolean") && (n.type = "boolean"), a.every((e) => e === null) && (n.type = "null"), n.enum = a;
	}
}, Ao = (e, t, n, r) => {
	Ya(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, jo = (e, t, n, r) => {
	Ya(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, Mo = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = bo(e);
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = w(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
};
function No(e) {
	let t = e._zod.def;
	return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? No(t.out) : t.type === "catch" ? No(t.innerType) : e._zod.optin;
}
var Po = (e, t, n, r) => {
	let i = n, a = e._zod.def, o = a.shape;
	if (Object.getOwnPropertySymbols(o).length && Ya(e, t, i, r, "Symbol keys cannot be represented in JSON Schema")) return;
	i.type = "object", i.properties = {};
	for (let e in o) fe(i.properties, e, w(o[e], t, {
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
		(t.io === "input" ? No(n) === void 0 : n._zod.optout === void 0) && s.push(e);
	}
	s.length > 0 && (i.required = s), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = w(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, Fo = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => w(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, Io = (e, t, n, r) => {
	let i = e._zod.def, a = w(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = w(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1, c = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
	n.allOf = c, t.intersections.push(c);
};
function Lo(e, t, n) {
	if (t.$ref) {
		if (n.has(t)) return t;
		n.add(t);
		let r = e.get(t)?.def;
		if (!r) return t;
		let i = Lo(e, r, n);
		return i === r ? t : i;
	}
	for (let r of ["anyOf", "oneOf"]) {
		let i = t[r];
		if (!Array.isArray(i)) continue;
		let a = i.map((t) => Lo(e, t, n));
		a.some((e, t) => e !== i[t]) && (t = {
			...t,
			[r]: a
		});
	}
	let r = Array.isArray(t.type) ? t.type : [t.type], i = !r.includes("string") && r.some((e) => e === "number" || e === "integer"), a = t.enum ?? (t.const === void 0 ? void 0 : [t.const]);
	if (!i && !a?.some((e) => typeof e == "number")) return t;
	let { minimum: o, maximum: s, exclusiveMinimum: c, exclusiveMaximum: l, multipleOf: u, format: d, id: f, ...p } = t;
	return p.enum ? p.enum = p.enum.map((e) => typeof e == "number" ? String(e) : e) : typeof p.const == "number" && (p.const = String(p.const)), i ? (p.type = "string", a || (p.pattern = (r.includes("number") ? wn : Cn).source), p) : p;
}
var Ro = /* @__PURE__ */ new WeakMap();
function zo(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.seen.values()) n.def && !t.has(n.schema) && t.set(n.schema, n);
	let n = /* @__PURE__ */ new Map();
	for (let r of Ro.get(e) ?? []) {
		let i = e.seen.get(r), a = (i?.def ?? i?.schema)?.propertyNames;
		if (!a || a === !0 || n.has(a)) continue;
		let o = Lo(t, a, /* @__PURE__ */ new Set());
		o !== a && n.set(a, o);
	}
	if (n.size) for (let t of e.seen.values()) for (let e of [t.schema, t.def]) {
		let t = e && n.get(e.propertyNames);
		t && (e.propertyNames = t);
	}
}
var Bo = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object";
	let o = a.keyType, s = bo(o).patterns;
	if (a.mode === "loose" && s && s.size > 0) {
		let e = w(a.valueType, t, {
			...r,
			path: [
				...r.path,
				"patternProperties",
				"*"
			]
		});
		i.patternProperties = {};
		for (let t of s) fe(i.patternProperties, Co(t).source, e);
	} else {
		if (t.target === "draft-07" || t.target === "draft-2020-12") {
			i.propertyNames = w(a.keyType, t, {
				...r,
				path: [...r.path, "propertyNames"]
			});
			let n = Ro.get(t);
			n || (n = [], Ro.set(t, n), t.deferred.push(() => zo(t))), n.push(e);
		}
		i.additionalProperties = w(a.valueType, t, {
			...r,
			path: [...r.path, "additionalProperties"]
		});
	}
	let c = o._zod.values, l = t.io === "input" && No(a.valueType) !== void 0;
	if (c && !a.partial && !l) {
		let e = [...c].filter((e) => typeof e == "string" || typeof e == "number");
		e.length > 0 && (i.required = e.map(String));
	}
}, Vo = (e, t, n, r) => {
	let i = e._zod.def, a = w(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, Ho = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Uo = Symbol();
function Wo(e, t, n, r, i) {
	let a = !1, o = JSON.stringify(e, (e, t) => typeof t == "bigint" ? (a = !0, null) : t);
	return a ? (Ya(t, n, r, i, "BigInt defaults cannot be represented in JSON Schema"), Uo) : JSON.parse(o);
}
var Go = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o = Wo(i.defaultValue, e, t, n, r);
	o !== Uo && (n.default = o);
}, Ko = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	if (a.ref = i.innerType, t.io !== "input") return;
	let o = Wo(i.defaultValue, e, t, n, r);
	o !== Uo && (n._prefault = o);
}, qo = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		Ya(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	n.default = o;
}, Jo = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	w(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, Yo = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, Xo = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Zo = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function Qo(e, t, n) {
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
var $o = /*@__PURE__*/ x("ZodError", (e, t) => {
	Tt.init(e, t), e.name = "ZodError";
	let n = Object.getPrototypeOf(e);
	Zo.has(n) || (Zo.add(n), Qo(n, "format", (e) => (t) => Ot(e, t)), Qo(n, "flatten", (e) => (t) => Dt(e, t)), Qo(n, "addIssue", (e) => (t) => {
		e.issues.push(t), e.message = JSON.stringify(e.issues, ce, 2);
	}), Qo(n, "addIssues", (e) => (t) => {
		e.issues.push(...t), e.message = JSON.stringify(e.issues, ce, 2);
	}), Object.defineProperty(n, "isEmpty", {
		configurable: !0,
		enumerable: !1,
		get() {
			return this.issues.length === 0;
		}
	}));
}, void 0, { Parent: Error }), es = /* @__PURE__ */ At($o), ts = /* @__PURE__ */ jt($o), ns = /* @__PURE__ */ Mt($o), rs = /* @__PURE__ */ Pt($o), is = /* @__PURE__ */ Bt($o), as = /* @__PURE__ */ Vt($o), os = /* @__PURE__ */ Ht($o), ss = /* @__PURE__ */ Ut($o), cs = /* @__PURE__ */ Wt($o), ls = /* @__PURE__ */ Gt($o), us = /* @__PURE__ */ Kt($o), ds = /* @__PURE__ */ qt($o);
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/schemas.js
function fs() {
	_t.localeError || vt(zi());
}
function ps() {
	_t.memoizer || vt({ memoizer: Ii() });
}
var T = /*@__PURE__*/ x("ZodType", (e, t) => (fs(), S.init(e, t), e.def = t, e.type = t.type, e), {
	check(...e) {
		let t = this.def;
		return this.clone(ye(t, { checks: [...t.checks ?? [], ...e.map((e) => typeof e == "function" ? { _zod: {
			check: e,
			def: { check: "custom" },
			onattach: []
		} } : e)] }), { parent: !0 });
	},
	with(...e) {
		return this.check(...e);
	},
	clone(e, t) {
		return ke(this, e, t);
	},
	brand() {
		return this;
	},
	register(e, t) {
		return e.add(this, t), this;
	},
	refine(e, t) {
		return this.check(Ec(e, t));
	},
	superRefine(e, t) {
		return this.check(Dc(e, t));
	},
	overwrite(e) {
		return this.check(/* @__PURE__ */ La(e));
	},
	optional() {
		return cc(this);
	},
	exactOptional() {
		return uc(this);
	},
	nullable() {
		return fc(this);
	},
	nullish() {
		return cc(fc(this));
	},
	nonoptional(e) {
		return vc(this, e);
	},
	array() {
		return k(this);
	},
	or(e) {
		return Zs([this, e]);
	},
	and(e) {
		return $s(this, e);
	},
	transform(e) {
		return Sc(this, oc(e));
	},
	default(e) {
		return mc(this, e);
	},
	prefault(e) {
		return gc(this, e);
	},
	catch(e) {
		return bc(this, e);
	},
	pipe(e) {
		return Sc(this, e);
	},
	readonly() {
		return wc(this);
	},
	describe(e) {
		let t = this.clone();
		return Ui.add(t, { description: e }), t;
	},
	meta(...e) {
		if (e.length === 0) return Ui.get(this);
		let t = this.clone();
		return Ui.add(t, e[0]), t;
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
		return tt(this, "~standard", {
			...Xn(this),
			jsonSchema: {
				input: so(this, "input"),
				output: so(this, "output")
			}
		});
	},
	set "~standard"(e) {
		et(this, "~standard", e);
	},
	parse: function e(t, n) {
		return es(this, t, n, { callee: e });
	},
	parseAsync: async function e(t, n) {
		return await ts(this, t, n, { callee: e });
	},
	safeParse(e, t) {
		return ns(this, e, t);
	},
	async safeParseAsync(e, t) {
		return rs(this, e, t);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(e) {
		et(this, "spa", e);
	},
	validate(e, t) {
		return Lt(this, e, t);
	},
	validateAsync(e, t) {
		return zt(this, e, t);
	},
	encode: function e(t, n) {
		return is(this, t, n, { callee: e });
	},
	decode: function e(t, n) {
		return as(this, t, n, { callee: e });
	},
	encodeAsync: async function e(t, n) {
		return await os(this, t, n, { callee: e });
	},
	decodeAsync: async function e(t, n) {
		return await ss(this, t, n, { callee: e });
	},
	safeEncode(e, t) {
		return cs(this, e, t);
	},
	safeDecode(e, t) {
		return ls(this, e, t);
	},
	async safeEncodeAsync(e, t) {
		return us(this, e, t);
	},
	async safeDecodeAsync(e, t) {
		return ds(this, e, t);
	},
	toJSONSchema(e) {
		return oo(this, {})(e);
	},
	get description() {
		return Ui.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
}), ms = /*@__PURE__*/ x("_ZodString", (e, t) => {
	Zn.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => wo(e, t, n, r);
}, /*@__PURE__*/ nt({
	format: (e) => bo(e).format ?? null,
	minLength: (e) => bo(e).minimum ?? null,
	maxLength: (e) => bo(e).maximum ?? null
}, {
	regex(...e) {
		return this.check(/* @__PURE__ */ ja(...e));
	},
	includes(...e) {
		return this.check(/* @__PURE__ */ Pa(...e));
	},
	startsWith(...e) {
		return this.check(/* @__PURE__ */ Fa(...e));
	},
	endsWith(...e) {
		return this.check(/* @__PURE__ */ Ia(...e));
	},
	min(...e) {
		return this.check(/* @__PURE__ */ ka(...e));
	},
	max(...e) {
		return this.check(/* @__PURE__ */ Oa(...e));
	},
	length(...e) {
		return this.check(/* @__PURE__ */ Aa(...e));
	},
	nonempty(...e) {
		return this.check(/* @__PURE__ */ ka(1, ...e));
	},
	lowercase(e) {
		return this.check(/* @__PURE__ */ Ma(e));
	},
	uppercase(e) {
		return this.check(/* @__PURE__ */ Na(e));
	},
	trim() {
		return this.check(/* @__PURE__ */ za());
	},
	normalize(...e) {
		return this.check(/* @__PURE__ */ Ra(...e));
	},
	toLowerCase() {
		return this.check(/* @__PURE__ */ Ba());
	},
	toUpperCase() {
		return this.check(/* @__PURE__ */ Va());
	},
	slugify() {
		return this.check(/* @__PURE__ */ Ha());
	}
})), hs = /*@__PURE__*/ x("ZodString", (e, t) => {
	Zn.init(e, t), ms.init(e, t);
}, {
	email(e) {
		return this.check(/* @__PURE__ */ Ki(bs, e));
	},
	url(e) {
		return this.check(/* @__PURE__ */ Qi(Cs, e));
	},
	jwt(e) {
		return this.check(/* @__PURE__ */ pa(Rs, e));
	},
	emoji(e) {
		return this.check(/* @__PURE__ */ $i(ws, e));
	},
	guid(e) {
		return this.check(/* @__PURE__ */ qi(xs, e));
	},
	uuid(e) {
		return this.check(/* @__PURE__ */ Ji(Ss, e));
	},
	uuidv4(e) {
		return this.check(/* @__PURE__ */ Yi(Ss, e));
	},
	uuidv6(e) {
		return this.check(/* @__PURE__ */ Xi(Ss, e));
	},
	uuidv7(e) {
		return this.check(/* @__PURE__ */ Zi(Ss, e));
	},
	nanoid(e) {
		return this.check(/* @__PURE__ */ ea(Ts, e));
	},
	cuid(e) {
		return this.check(/* @__PURE__ */ ta(Es, e));
	},
	cuid2(e) {
		return this.check(/* @__PURE__ */ na(Ds, e));
	},
	ulid(e) {
		return this.check(/* @__PURE__ */ ra(Os, e));
	},
	base64(e) {
		return this.check(/* @__PURE__ */ ua(Fs, e));
	},
	base64url(e) {
		return this.check(/* @__PURE__ */ da(Is, e));
	},
	xid(e) {
		return this.check(/* @__PURE__ */ ia(ks, e));
	},
	ksuid(e) {
		return this.check(/* @__PURE__ */ aa(As, e));
	},
	ipv4(e) {
		return this.check(/* @__PURE__ */ oa(js, e));
	},
	ipv6(e) {
		return this.check(/* @__PURE__ */ sa(Ms, e));
	},
	cidrv4(e) {
		return this.check(/* @__PURE__ */ ca(Ns, e));
	},
	cidrv6(e) {
		return this.check(/* @__PURE__ */ la(Ps, e));
	},
	e164(e) {
		return this.check(/* @__PURE__ */ fa(Ls, e));
	},
	datetime(e) {
		return this.check(/* @__PURE__ */ ma(gs, e));
	},
	date(e) {
		return this.check(/* @__PURE__ */ ha(_s, e));
	},
	time(e) {
		return this.check(/* @__PURE__ */ ga(vs, e));
	},
	duration(e) {
		return this.check(/* @__PURE__ */ _a(ys, e));
	}
});
function E(e) {
	return /* @__PURE__ */ Gi(hs, e);
}
var D = /*@__PURE__*/ x("ZodStringFormat", (e, t) => {
	C.init(e, t), ms.init(e, t);
}), gs = /*@__PURE__*/ x("ZodISODateTime", (e, t) => {
	gr.init(e, t), D.init(e, t);
}), _s = /*@__PURE__*/ x("ZodISODate", (e, t) => {
	_r.init(e, t), D.init(e, t);
}), vs = /*@__PURE__*/ x("ZodISOTime", (e, t) => {
	vr.init(e, t), D.init(e, t);
}), ys = /*@__PURE__*/ x("ZodISODuration", (e, t) => {
	yr.init(e, t), D.init(e, t);
}), bs = /*@__PURE__*/ x("ZodEmail", (e, t) => {
	er.init(e, t), D.init(e, t);
}), xs = /*@__PURE__*/ x("ZodGUID", (e, t) => {
	Qn.init(e, t), D.init(e, t);
}), Ss = /*@__PURE__*/ x("ZodUUID", (e, t) => {
	$n.init(e, t), D.init(e, t);
}), Cs = /*@__PURE__*/ x("ZodURL", (e, t) => {
	cr.init(e, t), D.init(e, t);
}), ws = /*@__PURE__*/ x("ZodEmoji", (e, t) => {
	lr.init(e, t), D.init(e, t);
}), Ts = /*@__PURE__*/ x("ZodNanoID", (e, t) => {
	ur.init(e, t), D.init(e, t);
}), Es = /*@__PURE__*/ x("ZodCUID", (e, t) => {
	dr.init(e, t), D.init(e, t);
}), Ds = /*@__PURE__*/ x("ZodCUID2", (e, t) => {
	fr.init(e, t), D.init(e, t);
}), Os = /*@__PURE__*/ x("ZodULID", (e, t) => {
	pr.init(e, t), D.init(e, t);
}), ks = /*@__PURE__*/ x("ZodXID", (e, t) => {
	mr.init(e, t), D.init(e, t);
}), As = /*@__PURE__*/ x("ZodKSUID", (e, t) => {
	hr.init(e, t), D.init(e, t);
}), js = /*@__PURE__*/ x("ZodIPv4", (e, t) => {
	br.init(e, t), D.init(e, t);
}), Ms = /*@__PURE__*/ x("ZodIPv6", (e, t) => {
	Cr.init(e, t), D.init(e, t);
}), Ns = /*@__PURE__*/ x("ZodCIDRv4", (e, t) => {
	wr.init(e, t), D.init(e, t);
}), Ps = /*@__PURE__*/ x("ZodCIDRv6", (e, t) => {
	Er.init(e, t), D.init(e, t);
}), Fs = /*@__PURE__*/ x("ZodBase64", (e, t) => {
	kr.init(e, t), D.init(e, t);
}), Is = /*@__PURE__*/ x("ZodBase64URL", (e, t) => {
	Mr.init(e, t), D.init(e, t);
}), Ls = /*@__PURE__*/ x("ZodE164", (e, t) => {
	Nr.init(e, t), D.init(e, t);
}), Rs = /*@__PURE__*/ x("ZodJWT", (e, t) => {
	Fr.init(e, t), D.init(e, t);
}), zs = /*@__PURE__*/ x("ZodNumber", (e, t) => {
	Ir.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => To(e, t, n, r), e.isFinite = !0;
}, /*@__PURE__*/ nt({
	minValue: (e) => {
		let { minimum: t, exclusiveMinimum: n } = bo(e);
		return Math.max(t ?? -Infinity, n ?? -Infinity);
	},
	maxValue: (e) => {
		let { maximum: t, exclusiveMaximum: n } = bo(e);
		return Math.min(t ?? Infinity, n ?? Infinity);
	},
	isInt: (e) => {
		let { isInt: t, multipleOf: n } = bo(e);
		return !!t || !!n?.some(Number.isSafeInteger);
	},
	format: (e) => bo(e).format ?? null
}, {
	gt(e, t) {
		return this.check(/* @__PURE__ */ Ta(e, t));
	},
	gte(e, t) {
		return this.check(/* @__PURE__ */ Ea(e, t));
	},
	min(e, t) {
		return this.check(/* @__PURE__ */ Ea(e, t));
	},
	lt(e, t) {
		return this.check(/* @__PURE__ */ Ca(e, t));
	},
	lte(e, t) {
		return this.check(/* @__PURE__ */ wa(e, t));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ wa(e, t));
	},
	int(e) {
		return this.check(Vs(e));
	},
	safe(e) {
		return this.check(Vs(e));
	},
	positive(e) {
		return this.check(/* @__PURE__ */ Ta(0, e));
	},
	nonnegative(e) {
		return this.check(/* @__PURE__ */ Ea(0, e));
	},
	negative(e) {
		return this.check(/* @__PURE__ */ Ca(0, e));
	},
	nonpositive(e) {
		return this.check(/* @__PURE__ */ wa(0, e));
	},
	multipleOf(e, t) {
		return this.check(/* @__PURE__ */ Da(e, t));
	},
	step(e, t) {
		return this.check(/* @__PURE__ */ Da(e, t));
	},
	finite() {
		return this;
	}
}));
function O(e) {
	return /* @__PURE__ */ va(zs, e);
}
var Bs = /*@__PURE__*/ x("ZodNumberFormat", (e, t) => {
	Lr.init(e, t), zs.init(e, t);
});
function Vs(e) {
	return /* @__PURE__ */ ya(Bs, e);
}
var Hs = /*@__PURE__*/ x("ZodBoolean", (e, t) => {
	Rr.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Eo(e, t, n, r);
});
function Us(e) {
	return /* @__PURE__ */ ba(Hs, e);
}
var Ws = /*@__PURE__*/ x("ZodUnknown", (e, t) => {
	zr.init(e, t), T.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function Gs() {
	return /* @__PURE__ */ xa(Ws);
}
var Ks = /*@__PURE__*/ x("ZodNever", (e, t) => {
	Br.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Do(e, t, n, r);
});
function qs(e) {
	return /* @__PURE__ */ Sa(Ks, e);
}
var Js = /*@__PURE__*/ x("ZodArray", (e, t) => {
	ps(), Hr.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Mo(e, t, n, r), e.element = t.element;
}, {
	min(e, t) {
		return this.check(/* @__PURE__ */ ka(e, t));
	},
	nonempty(e) {
		return this.check(/* @__PURE__ */ ka(1, e));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ Oa(e, t));
	},
	length(e, t) {
		return this.check(/* @__PURE__ */ Aa(e, t));
	},
	unwrap() {
		return this.element;
	}
});
function k(e, t) {
	return /* @__PURE__ */ Ua(Js, e, t);
}
var Ys = /*@__PURE__*/ x("ZodObject", (e, t) => {
	ps(), Jr.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Po(e, t, n, r), ct(e, "shape", (e) => e._zod.def.shape, !1);
}, {
	keyof() {
		return j(Object.keys(this._zod.def.shape));
	},
	catchall(e) {
		return this.clone(ye(this._zod.def, { catchall: e }));
	},
	passthrough() {
		return this.clone(ye(this._zod.def, { catchall: Gs() }));
	},
	loose() {
		return this.clone(ye(this._zod.def, { catchall: Gs() }));
	},
	strict() {
		return this.clone(ye(this._zod.def, { catchall: qs() }));
	},
	strip() {
		return this.clone(ye(this._zod.def, { catchall: void 0 }));
	},
	extend(e) {
		return Le(this, e);
	},
	safeExtend(e) {
		return ze(this, e);
	},
	merge(e) {
		return y(this, e);
	},
	pick(e) {
		return Pe(this, e);
	},
	omit(e) {
		return Ie(this, e);
	},
	partial(...e) {
		return Be(sc, this, e[0]);
	},
	exactPartial(...e) {
		return Be(lc, this, e[0], "exactPartial");
	},
	required(...e) {
		return Ve(_c, this, e[0]);
	}
});
function A(e, t) {
	return new Ys({
		type: "object",
		shape: e ?? {},
		...v(t)
	});
}
var Xs = /*@__PURE__*/ x("ZodUnion", (e, t) => {
	Xr.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Fo(e, t, n, r), e.options = t.options;
});
function Zs(e, t) {
	return new Xs({
		type: "union",
		options: e,
		...v(t)
	});
}
var Qs = /*@__PURE__*/ x("ZodIntersection", (e, t) => {
	Zr.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Io(e, t, n, r);
});
function $s(e, t) {
	return new Qs({
		type: "intersection",
		left: e,
		right: t
	});
}
var ec = /*@__PURE__*/ x("ZodRecord", (e, t) => {
	ps(), ei.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Bo(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function tc(e, t, n) {
	return !t || !t._zod ? new ec({
		type: "record",
		keyType: E(),
		valueType: e,
		...v(t)
	}) : new ec({
		type: "record",
		keyType: e,
		valueType: t,
		...v(n)
	});
}
var nc = /*@__PURE__*/ x("ZodEnum", (e, t) => {
	ti.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Oo(e, t, n, r), e.enum = t.entries, e.options = [...e._zod.values];
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new nc({
			...t,
			checks: [],
			...v(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new nc({
			...t,
			checks: [],
			...v(r),
			entries: i
		});
	};
});
function j(e, t) {
	return new nc({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...v(t)
	});
}
var rc = /*@__PURE__*/ x("ZodLiteral", (e, t) => {
	ni.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => ko(e, t, n, r), e.values = new Set(t.values), Object.defineProperty(e, "value", { get() {
		if (t.values.length > 1) throw Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return t.values[0];
	} });
});
function ic(e, t) {
	return new rc({
		type: "literal",
		values: Array.isArray(e) ? e : [e],
		...v(t)
	});
}
var ac = /*@__PURE__*/ x("ZodTransform", (e, t) => {
	ps(), ri.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => jo(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new gt(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(Qe(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", "input" in t || (t.input = n.value), t.inst ??= e, n.issues.push(Qe(t));
			}
		};
		let i = t.transform(n.value, n);
		return i instanceof Promise ? i.then((e) => (n.value = e, n)) : (n.value = i, n);
	};
});
function oc(e) {
	return new ac({
		type: "transform",
		transform: e
	});
}
var sc = /*@__PURE__*/ x("ZodOptional", (e, t) => {
	ai.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Xo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function cc(e) {
	return new sc({
		type: "optional",
		innerType: e
	});
}
var lc = /*@__PURE__*/ x("ZodExactOptional", (e, t) => {
	oi.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Xo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function uc(e) {
	return new lc({
		type: "optional",
		innerType: e
	});
}
var dc = /*@__PURE__*/ x("ZodNullable", (e, t) => {
	si.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Vo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function fc(e) {
	return new dc({
		type: "nullable",
		innerType: e
	});
}
var pc = /*@__PURE__*/ x("ZodDefault", (e, t) => {
	ci.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Go(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function mc(e, t) {
	return new pc({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : Ee(t);
		}
	});
}
var hc = /*@__PURE__*/ x("ZodPrefault", (e, t) => {
	ui.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ko(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function gc(e, t) {
	return new hc({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : Ee(t);
		}
	});
}
var _c = /*@__PURE__*/ x("ZodNonOptional", (e, t) => {
	di.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ho(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function vc(e, t) {
	return new _c({
		type: "nonoptional",
		innerType: e,
		...v(t)
	});
}
var yc = /*@__PURE__*/ x("ZodCatch", (e, t) => {
	mi.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => qo(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function bc(e, t) {
	return new yc({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : ut(t)
	});
}
var xc = /*@__PURE__*/ x("ZodPipe", (e, t) => {
	hi.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Jo(e, t, n, r), e.in = t.in, e.out = t.out;
});
function Sc(e, t) {
	return new xc({
		type: "pipe",
		in: e,
		out: t
	});
}
var Cc = /*@__PURE__*/ x("ZodReadonly", (e, t) => {
	_i.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Yo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function wc(e) {
	return new Cc({
		type: "readonly",
		innerType: e
	});
}
var Tc = /*@__PURE__*/ x("ZodCustom", (e, t) => {
	yi.init(e, t), T.init(e, t), e._zod.processJSONSchema = (t, n, r) => Ao(e, t, n, r);
});
function Ec(e, t = {}) {
	return /* @__PURE__ */ Wa(Tc, e, t);
}
function Dc(e, t) {
	return /* @__PURE__ */ Ga(e, t);
}
ae();
var Oc = null, kc = {
	connect(e) {
		return Oc = e, () => {
			Oc === e && (Oc = null);
		};
	},
	disconnect() {
		Oc = null;
	},
	current() {
		return Oc?.() ?? null;
	},
	require(t) {
		return e(this.current(), t);
	}
}, Ac = [
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
function jc(e) {
	return Ac.find((t) => t.id === e);
}
function Mc(e, t) {
	return jc(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/sales/data/areaPacks.ts
function Nc(e, t) {
	let n = jc(e), r = n?.units.find((e) => e.id === t), i = n?.units.find((e) => e.id === n.baseUnitId);
	return n?.status === "ACTIVE" && r?.active && i?.code === "M2" && ["BOX", "ROLL"].includes(r.code) && Number.isFinite(r.conversionToBase) && r.conversionToBase > 0 ? r.conversionToBase : void 0;
}
function Pc(e, t, n, r) {
	if (r === void 0) return { quantity: n };
	let i = Nc(e, t);
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
function Fc(e) {
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
var Ic = [
	"Flooring Retailer",
	"Builder",
	"Developer",
	"Designer",
	"Architect",
	"Installer",
	"Other"
], Lc = [
	"ACTIVE",
	"ON_HOLD",
	"INACTIVE"
], Rc = E().trim().refine((e) => e === "" || E().email().safeParse(e).success, { message: "Enter a valid email address" }), zc = E().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" });
A({
	businessName: E().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: E().trim().max(120, "Trading name is too long"),
	abn: zc,
	businessType: j(Ic),
	status: j(Lc),
	email: Rc,
	phone: E().trim().max(40, "Phone number is too long"),
	website: E().trim().max(200, "Website is too long"),
	creditLimit: O({ message: "Credit limit is required" }).min(0, "Credit limit cannot be negative"),
	paymentTermsDays: O({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days")
}), A({
	name: E().trim().min(1, "Location name is required").max(100, "Location name is too long"),
	addressLine1: E().trim().min(1, "Address is required").max(160, "Address is too long"),
	addressLine2: E().trim().max(160, "Address is too long"),
	suburb: E().trim().min(1, "Suburb is required").max(100, "Suburb is too long"),
	state: E().trim().min(1, "State is required").max(50, "State is too long"),
	postcode: E().trim().min(1, "Postcode is required").max(20, "Postcode is too long"),
	country: E().trim().min(1, "Country is required").max(100, "Country is too long"),
	phone: E().trim().max(40, "Phone number is too long"),
	isPrimary: Us()
});
var Bc = A({
	isAccounting: Us().optional(),
	firstName: E().trim().min(1, "First name is required").max(80, "First name is too long"),
	lastName: E().trim().min(1, "Last name is required").max(80, "Last name is too long"),
	jobTitle: E().trim().max(100, "Job title is too long"),
	email: E().trim().min(1, "Email is required").email("Enter a valid email address"),
	phone: E().trim().max(40, "Phone number is too long"),
	mobile: E().trim().max(40, "Mobile number is too long"),
	locationId: E(),
	isPrimary: Us()
});
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
//#region src/features/contacts/data/mockCustomers.ts
var Gc = [
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
], Kc = "htt.mock.contacts.customers.v1";
function qc(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var Jc = Hc(Kc, qc), Yc = Jc.status !== "invalid" && Wc(Kc), Xc = /* @__PURE__ */ new Set(), Zc = Jc.status === "ok" ? Jc.data : structuredClone(Gc);
function Qc() {
	Yc && Uc(Kc, Zc), Xc.forEach((e) => {
		e();
	});
}
function $c(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function el() {
	let e = Zc.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function M(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function tl(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function nl(e, t) {
	let n = !1;
	if (Zc = Zc.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	Qc();
}
var rl = {
	subscribe(e) {
		return Xc.add(e), () => {
			Xc.delete(e);
		};
	},
	getSnapshot() {
		return Zc;
	},
	getAll() {
		return Zc;
	},
	getById(e) {
		return Zc.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: $c("cus"),
			code: el(),
			businessName: e.businessName.trim(),
			tradingName: M(e.tradingName),
			abn: tl(e.abn),
			businessType: e.businessType,
			status: e.status,
			email: M(e.email),
			phone: M(e.phone),
			website: M(e.website),
			creditLimit: e.creditLimit,
			currentBalance: 0,
			overdueBalance: 0,
			paymentTermsDays: e.paymentTermsDays,
			locations: [],
			contacts: [],
			createdAt: t,
			updatedAt: t
		};
		return Zc = [n, ...Zc], Qc(), n;
	},
	update(e, t) {
		let n;
		if (nl(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: M(t.tradingName),
			abn: tl(t.abn),
			businessType: t.businessType,
			status: t.status,
			email: M(t.email),
			phone: M(t.phone),
			website: M(t.website),
			creditLimit: t.creditLimit,
			paymentTermsDays: t.paymentTermsDays,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, n)), !n) throw Error(`Customer ${e} was not found`);
		return n;
	},
	addLocation(e, t) {
		let n = rl.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: $c("loc"),
			name: t.name.trim(),
			addressLine1: t.addressLine1.trim(),
			addressLine2: M(t.addressLine2),
			suburb: t.suburb.trim(),
			state: t.state.trim(),
			postcode: t.postcode.trim(),
			country: t.country.trim(),
			phone: M(t.phone),
			isPrimary: r
		};
		return nl(e, (e) => ({
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
		let r = rl.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		let i = r.locations.find((e) => e.id === t);
		if (!i) throw Error(`Location ${t} was not found`);
		let a = n.isPrimary || r.locations.length === 1, o = {
			...i,
			name: n.name.trim(),
			addressLine1: n.addressLine1.trim(),
			addressLine2: M(n.addressLine2),
			suburb: n.suburb.trim(),
			state: n.state.trim(),
			postcode: n.postcode.trim(),
			country: n.country.trim(),
			phone: M(n.phone),
			isPrimary: a
		};
		return nl(e, (e) => ({
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
		t = Bc.parse(t);
		let n = rl.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: $c("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: M(t.jobTitle),
			email: t.email.trim(),
			phone: M(t.phone),
			mobile: M(t.mobile),
			locationId: M(t.locationId),
			isPrimary: r,
			isAccounting: t.isAccounting ?? !1
		};
		return nl(e, (e) => ({
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
		n = Bc.parse(n);
		let r = rl.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		if (n.locationId && !r.locations.some((e) => e.id === n.locationId)) throw Error("The selected location does not belong to this customer");
		let i = r.contacts.find((e) => e.id === t);
		if (!i) throw Error(`Contact ${t} was not found`);
		let a = n.isPrimary || r.contacts.length === 1, o = {
			...i,
			firstName: n.firstName.trim(),
			lastName: n.lastName.trim(),
			jobTitle: M(n.jobTitle),
			email: n.email.trim(),
			phone: M(n.phone),
			mobile: M(n.mobile),
			locationId: M(n.locationId),
			isPrimary: a,
			isAccounting: n.isAccounting ?? !1
		};
		return nl(e, (e) => ({
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
	repository: rl,
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
	snapshot: () => ({ customers: Zc }),
	restore: (e) => {
		Zc = e.customers;
	},
	publish: () => Xc.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesRecipients.ts
function il(e, t) {
	let n = rl.getById(e);
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
function al(e) {
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
//#region src/features/banking/data/reconciliationLock.ts
function ol(e, t) {
	let n = te(), r = n.journals?.journalEntries ?? [], i = n.bankReconciliations?.reconciliations ?? [], a = r.filter((n) => n.sourceType === e && n.sourceId === t).map((e) => e.id);
	if (i.some((e) => e.clearedTransactionIds.some((e) => a.some((t) => e.startsWith(t + ":"))))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function sl(e, t) {
	let n = te(), r = n.bankAccounts?.bankAccounts ?? [], i = n.bankReconciliations?.reconciliations ?? [];
	for (let n of r.filter((e) => t.includes(e.glAccountId))) {
		let t = i.filter((e) => e.bankAccountId === n.id).map((e) => e.statementDate).sort().at(-1);
		if (t && e <= t) throw Error(`Bank account is reconciled through ${t}. Use a posting date after that statement.`);
	}
}
//#endregion
//#region src/features/business-workspace/productRules.ts
function cl(e, t, n, r) {
	let i = jc(e), a = Mc(e, t);
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
//#region src/lib/persistence/financialOperationJournal.ts
var ll = "htt:financial-operations:v1", ul = [
	"CUSTOMER_PAYMENT",
	"PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
], dl = [
	"PENDING",
	"COMPLETED",
	"MANUAL_REVIEW"
], fl = (e) => Array.isArray(e) && e.every((e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.operationId == "string" && t.operationId.length > 0 && ul.includes(String(t.kind)) && typeof t.fingerprint == "string" && t.fingerprint.length > 0 && dl.includes(String(t.state)) && typeof t.createdAt == "string" && typeof t.updatedAt == "string" && (t.resultId === void 0 || typeof t.resultId == "string") && (t.note === void 0 || typeof t.note == "string") && (t.reviewHistory === void 0 || Array.isArray(t.reviewHistory) && t.reviewHistory.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		return typeof t.reference == "string" && t.reference.length >= 3 && typeof t.operator == "string" && t.operator.length >= 2 && typeof t.recordedAt == "string" && typeof t.summary == "string" && t.summary.length >= 3;
	}));
}) && new Set(e.map((e) => e.operationId)).size === e.length;
function pl() {
	let e = Hc(ll, fl);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function ml(e) {
	if (!Wc(ll) || !Uc(ll, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var N = {
	list() {
		return pl().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !ul.includes(t)) throw Error("Invalid operation identity.");
		let r = pl(), i = r.find((t) => t.operationId === e);
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
		return ml([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = pl(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ml(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = pl(), r = n.find((t) => t.operationId === e);
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
		return ml(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = pl(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ml(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = pl(), a = i.find((t) => t.operationId === e);
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
		return ml(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = pl(), a = i.find((t) => t.operationId === e);
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
		return ml(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	getUnresolved() {
		return pl().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
	}
};
o("financialOperations", {
	repository: N,
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
var hl = /* @__PURE__ */ new Map(), gl = "htt.purchasePosting.operations.v1";
function _l() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function vl() {
	let e = _l();
	if (e) try {
		e.setItem(gl, JSON.stringify([...hl.values()]));
	} catch {}
}
function yl() {
	let e = _l();
	if (e) try {
		let t = JSON.parse(e.getItem(gl) ?? "[]");
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
			hl.set(t.key, {
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
yl();
var bl = /* @__PURE__ */ new Set(), xl = /* @__PURE__ */ new Map(), Sl = /* @__PURE__ */ new Map(), Cl;
function wl() {
	vl(), bl.forEach((e) => e());
}
var P = {
	injectFailureBeforeStep(e, t, n = 1) {
		Sl.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		Sl.clear();
	},
	registerRecovery(e, t) {
		if (!hl.has(e)) throw Error(`Unknown posting operation: ${e}`);
		xl.set(e, t);
	},
	runStep(e, t, n) {
		let r = hl.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = Sl.get(i) ?? 0;
		if (a > 0) throw Sl.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return xl.has(e);
	},
	recover(e) {
		let t = hl.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = xl.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (Cl === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		Cl = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			Cl = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = hl.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...hl.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return bl.add(e), () => {
			bl.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if (hl.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return hl.set(n, r), wl(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = hl.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		hl.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), wl();
	},
	completeStep(e, t) {
		let n = hl.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (hl.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), wl());
	}
};
o("purchaseOperations", {
	repository: P,
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
	snapshot: () => P.getAll(),
	restore: (e) => {
		hl.clear(), xl.clear();
		for (let t of e) hl.set(t.key, t);
	},
	publish: () => bl.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var Tl = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function El(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${Tl.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function F() {
	El(N.list(), P.getAll());
}
//#endregion
//#region src/features/sales/data/quoteStorage.ts
var Dl = "htt.mock.sales.quotes.v1", Ol = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function kl(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !Ol.has(String(t.status)) || ![
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
function Al() {
	return Hc(Dl, kl);
}
function jl(e) {
	if (Al().status === "invalid" || !Wc("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!Uc("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var Ml = "htt.mock.sales.quote-orders.v1";
function Nl(e) {
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
function Pl(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!kl(t.quotes) || !Nl(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function Fl() {
	return Hc(Ml, Pl);
}
function Il(e) {
	if (!Pl(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = Fl(), n = Al();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !Wc("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!Uc("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var Ll = "htt.mock.sales.documents.v1";
function Rl(e) {
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
function zl(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!Pl(t) || !Rl(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function Bl() {
	return Hc(Ll, zl);
}
function Vl(e) {
	if (!zl(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = Bl();
	if (t.status === "invalid" || t.status === "unavailable" || !Wc("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!Uc("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/accounting/data/accountingPeriodRepository.ts
var Hl = [], Ul, Wl, Gl = /* @__PURE__ */ new Set();
function Kl(e, t) {
	Ul = e, Wl = t;
}
function ql() {
	let e = Wl?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function Jl(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function Yl(e) {
	let t = Hl.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function Xl() {
	Gl.forEach((e) => e());
}
function Zl(e) {
	if (p(e, "Posting date"), !Hl.length) return;
	let t = Hl.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!Hl.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
o("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => Hl,
		subscribe(e) {
			return Gl.add(e), () => {
				Gl.delete(e);
			};
		},
		create(e) {
			let t = ql(), n = Jl(e.reason);
			if (p(e.startDate), p(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (Hl.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (Hl.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
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
			return Hl = [...Hl, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), Xl(), r;
		},
		preflight(e) {
			let t = Yl(e);
			if (!Ul) throw Error("Trusted close checks unavailable.");
			return Ul(t);
		},
		close(e) {
			let t = ql(), n = Jl(e.reason), r = Yl(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (Hl.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return Hl = Hl.map((e) => e.id === r.id ? {
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
			} : e), Xl(), Yl(e.id);
		},
		reopen(e) {
			let t = ql(), n = Jl(e.reason), r = Yl(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (Hl.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return Hl = Hl.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), Xl(), Yl(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: Hl }),
	restore: (e) => {
		h(e.periods), Hl = e.periods;
	},
	publish: Xl
});
//#endregion
//#region src/features/purchases/data/mockPurchaseOrders.ts
var Ql = [{
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
}], $l = [{
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
}], eu = "htt:financial-snapshot:v1", tu = (e) => !!e && typeof e == "object" && !Array.isArray(e), nu = (e) => new Set(e.map((e) => e.id)).size === e.length, ru = (e) => {
	if (!tu(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => tu(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => tu(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => tu(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => tu(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
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
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => tu(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && tu(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && tu(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && tu(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && nu(t) && nu(n) && nu(r) && nu(i);
}, iu = () => ({
	purchaseOrders: structuredClone(Ql),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone($l),
	transactions: [],
	transfers: [],
	journals: []
}), au, ou = !1;
function su() {
	return typeof window < "u" && !!window.localStorage;
}
function cu() {
	if (au) return au;
	if (!su()) return iu();
	let e = Hc(eu, ru);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return ou = e.status === "ok", au = e.status === "ok" ? {
		...iu(),
		...e.data
	} : iu(), au;
}
var lu = /* @__PURE__ */ new Set(), uu = 0, du = /* @__PURE__ */ new Set();
function fu(e) {
	if (su() && !Uc(eu, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var I = {
	wasRestoredOnLoad() {
		return cu(), ou;
	},
	onRollback(e) {
		lu.add(e);
	},
	notify(e) {
		uu ? du.add(e) : e();
	},
	transaction(e) {
		if (uu) return e();
		let t = structuredClone(cu());
		au = structuredClone(t), uu++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			fu(cu());
		} catch (e) {
			throw au = t, lu.forEach((e) => e()), du.clear(), e;
		} finally {
			uu--;
		}
		let r = [...du];
		return du.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(cu());
	},
	update(e, t) {
		let n = {
			...cu(),
			[e]: structuredClone(t)
		};
		if (!ru(n)) throw Error("Invalid financial snapshot; write blocked.");
		uu || fu(n), au = n;
	},
	resetCacheForTests() {
		au = void 0, ou = !1;
	}
};
o("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => I.read(),
	restore: (e) => {
		au = e;
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/accountRepository.ts
var pu = /* @__PURE__ */ new Set(), L = "2026-10-08T00:00:00.000Z", mu = [
	{
		id: "acc_1000",
		code: "1000",
		name: "Operating Bank",
		type: "ASSET",
		systemRole: "BANK",
		active: !0,
		allowManualPosting: !0,
		createdAt: L,
		updatedAt: L
	},
	{
		id: "acc_1010",
		code: "1010",
		name: "Savings Bank",
		type: "ASSET",
		active: !0,
		allowManualPosting: !0,
		createdAt: L,
		updatedAt: L
	},
	{
		id: "acc_1100",
		code: "1100",
		name: "Accounts Receivable",
		type: "ASSET",
		systemRole: "ACCOUNTS_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: L,
		updatedAt: L
	},
	{
		id: "acc_1200",
		code: "1200",
		name: "Inventory",
		type: "ASSET",
		systemRole: "INVENTORY",
		active: !0,
		allowManualPosting: !1,
		createdAt: L,
		updatedAt: L
	},
	{
		id: "acc_1300",
		code: "1300",
		name: "GST Receivable",
		type: "ASSET",
		systemRole: "GST_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: L,
		updatedAt: L
	},
	{
		id: "acc_2000",
		code: "2000",
		name: "Accounts Payable",
		type: "LIABILITY",
		systemRole: "ACCOUNTS_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: L,
		updatedAt: L
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
		createdAt: L,
		updatedAt: L
	},
	{
		id: "acc_2100",
		code: "2100",
		name: "GST Payable",
		type: "LIABILITY",
		systemRole: "GST_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: L,
		updatedAt: L
	},
	{
		id: "acc_3000",
		code: "3000",
		name: "Owner's Equity",
		type: "EQUITY",
		systemRole: "OWNERS_EQUITY",
		active: !0,
		allowManualPosting: !0,
		createdAt: L,
		updatedAt: L
	},
	{
		id: "acc_3100",
		code: "3100",
		name: "Retained Earnings",
		type: "EQUITY",
		systemRole: "RETAINED_EARNINGS",
		active: !0,
		allowManualPosting: !1,
		createdAt: L,
		updatedAt: L
	},
	{
		id: "acc_4000",
		code: "4000",
		name: "Sales Revenue",
		type: "REVENUE",
		systemRole: "SALES_REVENUE",
		active: !0,
		allowManualPosting: !1,
		createdAt: L,
		updatedAt: L
	},
	{
		id: "acc_5000",
		code: "5000",
		name: "Cost of Goods Sold",
		type: "EXPENSE",
		systemRole: "COST_OF_GOODS_SOLD",
		active: !0,
		allowManualPosting: !1,
		createdAt: L,
		updatedAt: L
	},
	{
		id: "acc_5100",
		code: "5100",
		name: "Purchases / Materials",
		type: "EXPENSE",
		systemRole: "PURCHASES",
		active: !0,
		allowManualPosting: !0,
		createdAt: L,
		updatedAt: L
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
		createdAt: L,
		updatedAt: L
	},
	{
		id: "acc_5200",
		code: "5200",
		name: "Freight",
		type: "EXPENSE",
		systemRole: "FREIGHT",
		active: !0,
		allowManualPosting: !0,
		createdAt: L,
		updatedAt: L
	},
	{
		id: "acc_5300",
		code: "5300",
		name: "Operating Expenses",
		type: "EXPENSE",
		systemRole: "OPERATING_EXPENSE",
		active: !0,
		allowManualPosting: !0,
		createdAt: L,
		updatedAt: L
	}
];
function hu() {
	pu.forEach((e) => e());
}
function gu(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function _u(e) {
	return e?.trim() || void 0;
}
function vu(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function yu(e, t) {
	if (mu.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function bu(e, t) {
	if (!e) return;
	let n = mu.find((n) => n.id !== t && (ee(e) ? n.id === ee(e) : n.systemRole === e));
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function xu() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var R = {
	subscribe(e) {
		return pu.add(e), () => {
			pu.delete(e);
		};
	},
	getSnapshot() {
		return mu;
	},
	getAll() {
		return mu;
	},
	getById(e) {
		return mu.find((t) => t.id === e);
	},
	getByCode(e) {
		return mu.find((t) => t.code.toLowerCase() === e.trim().toLowerCase());
	},
	getBySystemRole(e) {
		return mu.find((t) => ee(e) ? t.id === ee(e) : t.systemRole === e);
	},
	requireById(e) {
		let t = mu.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = mu.find((t) => ee(e) ? t.id === ee(e) : t.systemRole === e);
		if (!t) throw Error(`Accounting account for system role ${e} was not found.`);
		return t;
	},
	create(e) {
		let t = gu(e.code, "Account code"), n = gu(e.name, "Account name");
		vu(t), yu(t), bu(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: xu(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: _u(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return mu = [...mu, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), hu(), i;
	},
	update(e, t) {
		let n = mu.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = gu(t.code, "Account code"), i = gu(t.name, "Account name");
		if (vu(r), yu(r, e), (n.systemRole || c(n.id)) && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: _u(t.description),
			active: n.systemRole || c(n.id) ? !0 : t.active,
			allowManualPosting: n.systemRole || c(n.id) ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return mu = mu.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), hu(), a;
	},
	setActive(e, t) {
		let n = mu.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		if ((n.systemRole || c(n.id)) && !t) throw Error("System control accounts cannot be deactivated.");
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return mu = mu.map((t) => t.id === e ? r : t), hu(), r;
	}
};
o("accounts", {
	repository: R,
	read: "accounting.read",
	commands: {
		if: null,
		create: "accounting.post",
		update: "accounting.post",
		setActive: "accounting.post"
	},
	snapshot: () => ({ accounts: mu }),
	restore: (e) => {
		mu = e.accounts;
	},
	publish: () => pu.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var Su = /* @__PURE__ */ new Set(), Cu = I.read().journals;
I.onRollback(() => {
	Cu = I.read().journals;
});
function wu() {
	Su.forEach((e) => I.notify(e));
}
function Tu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Eu(e) {
	return e?.trim() || void 0;
}
function Du(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function Ou(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = Cu.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function ku(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function Au(e) {
	if (Du(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = R.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = Tu(r.debit), o = Tu(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = Tu(t + a), n = Tu(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function ju(e) {
	return e.lines.map((e, t) => {
		let n = R.requireById(e.accountId);
		return {
			id: ku(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: Eu(e.description),
			debit: Tu(e.debit),
			credit: Tu(e.credit)
		};
	});
}
function Mu(e, t) {
	return Cu.find((n) => n.sourceType === e && n.sourceId === t && !n.reversedJournalEntryId);
}
var z = {
	subscribe(e) {
		return Su.add(e), () => {
			Su.delete(e);
		};
	},
	getSnapshot() {
		return Cu;
	},
	getAll() {
		return Cu;
	},
	getById(e) {
		return Cu.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return Cu.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: Mu,
	post(e) {
		Zl(e.journalDate), sl(e.journalDate, e.lines.map((e) => e.accountId));
		let t = Au(e), n = Eu(e.sourceId);
		if (n) {
			let t = Mu(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: ku("je"),
			journalNumber: Ou(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: Eu(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: ju(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...Cu];
		return I.update("journals", a), Cu = a, wu(), i;
	},
	reverse(e) {
		Zl(e.reversalDate);
		let t = Cu.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (Du(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Reversal reason must contain at least 3 characters.");
		sl(e.reversalDate, t.lines.map((e) => e.accountId));
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
		}, i = Au(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: ku("je"),
			journalNumber: Ou(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: ju(r),
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
		}, c = [o, ...Cu.map((e) => e.id === t.id ? s : e)];
		return I.update("journals", c), Cu = c, wu(), o;
	}
};
o("journals", {
	repository: z,
	read: "accounting.read",
	commands: {
		if: null,
		validateDate: null,
		for: null,
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ journalEntries: Cu }),
	restore: (e) => {
		Cu = e.journalEntries;
	},
	publish: () => Su.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var Nu = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Pu(e) {
	let t = e.filter((e) => Nu.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function Fu() {
	Pu(N.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var Iu = [{
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
}], Lu = [{
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
}], Ru = [{
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
}], zu = "htt.mock.sales.credit-notes.v1", Bu = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, Vu = (e) => typeof e == "string" && e.length > 0;
function Hu(e) {
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
		].every((e) => Vu(t[e])) || ![
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
		].every((e) => Bu(i[e])) || !Bu(t.amountApplied) || !Bu(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => Vu(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !Bu(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		if (Math.abs(t - e.amountApplied) > .011) return !1;
		let n = e.refundEvents ?? [];
		if (!Array.isArray(n) || n.some((e) => !e || !Vu(e.id) || !Vu(e.date) || !Bu(e.amount) || e.amount <= 0 || e.reversalDate !== void 0 && !Vu(e.reversalDate)) || new Set(n.map((e) => e.id)).size !== n.length) return !1;
		let r = n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0);
		return !Bu(e.amountRefunded ?? 0) || Math.abs(r - (e.amountRefunded ?? 0)) > .011 || t + r > e.totals.total + .011 ? !1 : e.status === "VOID" ? t === 0 && r === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t - r)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function Uu() {
	return Hc(zu, Hu);
}
function Wu(e) {
	if (!Hu(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = Uu();
	if (t.status === "invalid" || t.status === "unavailable" || !Wc("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!Uc("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var Gu = /* @__PURE__ */ new Set(), Ku = Uu(), qu = Ku.status === "ok" ? structuredClone(Ku.data.creditNotes) : [], Ju = Ku.status === "ok" ? structuredClone(Ku.data.allocations) : [], Yu = [...qu], Xu = [...Ju];
function Zu() {
	Yu = [...qu], Xu = [...Ju], Gu.forEach((e) => e());
}
function Qu(e, t) {
	Wu({
		creditNotes: e,
		allocations: t
	}), qu = e, Ju = t, Zu();
}
var B = {
	subscribe(e) {
		return Gu.add(e), () => {
			Gu.delete(e);
		};
	},
	getSnapshot() {
		return Yu;
	},
	getAllocationSnapshot() {
		return Xu;
	},
	getAll() {
		return Yu;
	},
	getAllAllocations() {
		return Xu;
	},
	getById(e) {
		return qu.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return qu.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return qu.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return Ju.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return Ju.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if (qu.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return Qu([e, ...qu], Ju), e;
	},
	update(e) {
		if (!qu.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return Qu(qu.map((t) => t.id === e.id ? e : t), Ju), e;
	},
	createAllocation(e) {
		if (Ju.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return Qu(qu, [e, ...Ju]), e;
	},
	updateAllocation(e) {
		if (!Ju.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return Qu(qu, Ju.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!qu.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = Ju.some((t) => t.id === e.id) ? Ju.map((t) => t.id === e.id ? e : t) : [e, ...Ju];
		Qu(qu.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return Ju.find((t) => t.id === e);
	}
};
o("customerCredits", {
	repository: B,
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
	validate: (e) => {
		for (let t of e.creditNotes) {
			al(t.recipient);
			for (let e of t.lines) Fc(e);
		}
	},
	snapshot: () => ({
		creditNotes: qu,
		allocations: Ju
	}),
	restore: (e) => {
		qu = e.creditNotes, Ju = e.allocations, Yu = [...qu], Xu = [...Ju];
	},
	publish: () => Gu.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/customerPricingStorage.ts
var $u = "htt.mock.contacts.customerPricing.v1";
function ed(e) {
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
function td() {
	return Hc($u, ed);
}
function nd(e) {
	if (td().status === "invalid" || !Wc("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!Uc("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var rd = [
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
], id = /* @__PURE__ */ new Set(), ad = td(), od = ad.status === "ok" ? ad.data : structuredClone(rd);
function sd() {
	id.forEach((e) => {
		e();
	});
}
function cd(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function ld(e) {
	return e.trim() || void 0;
}
function ud(e, t) {
	let n = jc(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = n.units.find((e) => e.id === t);
	if (!r) throw Error(`Unit ${t} does not belong to product ${e}`);
	if (!r.active) throw Error("The selected product unit is inactive");
	return {
		product: n,
		unit: r
	};
}
function dd(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function fd({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = od.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : dd(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = _d(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function pd(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function md(e) {
	let t = Mc(e.productId, e.unitId);
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
var hd = {
	subscribe(e) {
		return id.add(e), () => {
			id.delete(e);
		};
	},
	getSnapshot() {
		return od;
	},
	getAll() {
		return od;
	},
	getById(e) {
		return od.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return od.filter((t) => t.customerId === e);
	},
	create(e, t) {
		ud(t.productId, t.unitId);
		let n = ld(t.effectiveTo);
		t.active && fd({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = pd(t), a = {
			id: cd("cprice"),
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
		}, o = [a, ...od];
		return nd(o), od = o, sd(), a;
	},
	update(e, t) {
		let n = hd.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		ud(t.productId, t.unitId);
		let r = ld(t.effectiveTo);
		t.active && fd({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = pd(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = od.map((t) => t.id === e ? a : t);
		return nd(o), od = o, sd(), a;
	},
	resolve(e) {
		return md(e);
	},
	resolvePrice(e, t, n, r) {
		let a = hd.resolveBasePrice(e, t, n, r.slice(0, 10)), o = i({
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
		let { unit: i } = ud(t, n), a = od.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && gd(r, i.effectiveFrom, i.effectiveTo));
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
		let o = md(a);
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
function gd(e, t, n) {
	return !(e < t || n && e > n);
}
function _d(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
o("customerPrices", {
	repository: hd,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: od }),
	restore: (e) => {
		od = e.customerPrices;
	},
	publish: () => id.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
function vd(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function yd({ quantity: e, standardUnitPrice: t, unitPrice: n, taxRate: r = s(), inclusiveLineTotal: i }) {
	let a = vd(e * n), o = vd(i === void 0 ? a * r : i - a), c = vd(a + o), l = vd(t - n);
	return {
		discountAmount: l,
		discountPercent: t > 0 ? vd(l / t * 100) : 0,
		lineSubtotal: a,
		taxAmount: o,
		lineTotal: c
	};
}
function bd(e) {
	let t = vd(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = vd(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: vd(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function xd({ customerId: e, documentDate: t, draft: i }) {
	if (i.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let o = jc(i.productId);
	if (!o) throw Error(`Product ${i.productId} was not found`);
	if (o.status !== "ACTIVE") throw Error(`${o.name} is inactive`);
	let c = Mc(i.productId, i.unitId);
	if (!c) throw Error(`Unit ${i.unitId} was not found for ${o.name}`);
	let l = hd.resolvePrice(e, i.productId, i.unitId, t), u = i.unitPrice !== void 0, d = u ? i.unitPrice : l.effectivePrice;
	if (!Number.isFinite(d) || d < 0) throw Error("Unit price cannot be negative");
	let f = Pc(i.productId, i.unitId, i.quantity, i.requestedArea);
	if (cl(i.productId, i.unitId, f.quantity, "sell"), o.sellEnabled === !1) throw Error("Product is not available for selling.");
	let p = o.taxCode ?? n().gstCode, m = s(p), h = u ? r(d, m, i.priceBasis) : d, ee = yd({
		taxRate: m,
		inclusiveLineTotal: u && (i.priceBasis ?? n().basis) === "Inclusive" ? Math.round(f.quantity * d * 100) / 100 : void 0,
		quantity: f.quantity,
		standardUnitPrice: l.basePrice,
		unitPrice: h
	});
	return {
		id: Sd("line"),
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
		...ee
	};
}
function Sd(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var Cd = "htt.mock.banking.accounts.v1";
function wd(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var Td = /* @__PURE__ */ new Set(), Ed = "2026-10-08T00:00:00.000Z", Dd = [{
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
	createdAt: Ed,
	updatedAt: Ed
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
	createdAt: Ed,
	updatedAt: Ed
}], Od = Hc(Cd, wd);
Od.status === "ok" && Od.data.every((e) => {
	let t = R.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (Dd = Od.data);
function kd() {
	Td.forEach((e) => e());
}
function Ad(e) {
	let t = R.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of Dd) Ad(e);
var jd = {
	subscribe(e) {
		return Td.add(e), () => {
			Td.delete(e);
		};
	},
	getSnapshot() {
		return Dd;
	},
	getAll() {
		return Dd;
	},
	getById(e) {
		return Dd.find((t) => t.id === e);
	},
	getByGlAccountId(e) {
		return Dd.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = Dd.find((t) => t.id === e);
		if (!t) throw Error("Bank account was not found.");
		return t;
	},
	save(e, t) {
		let n = A({
			id: E().optional(),
			name: E().trim().min(1).max(180),
			bankName: E().trim().min(1).max(180),
			accountNumber: E().trim().min(1).max(100),
			accountType: j([
				"TRANSACTION",
				"SAVINGS",
				"CREDIT_CARD",
				"OTHER"
			]),
			currency: j(["AUD", "NZD"]),
			glAccountId: E().min(1),
			openingBalanceDate: E(),
			active: Us()
		}).strict().parse(e);
		if (p(n.openingBalanceDate, "Opening date"), Dd[0] && n.currency !== Dd[0].currency) throw Error("This profile uses one base currency; foreign-currency bank accounts are not supported.");
		let r = Dd.find((e) => e.id === n.id);
		if (r && r.updatedAt !== t) throw Error("Bank account changed; reload before editing.");
		if (!r && n.id) throw Error("Bank account was not found.");
		if (Dd.some((e) => e.id !== r?.id && e.glAccountId === n.glAccountId)) throw Error("Each bank account needs its own GL account.");
		let i = R.requireById(n.glAccountId);
		if (!i.active || i.type !== "ASSET" || i.systemRole && i.systemRole !== "BANK") throw Error("Choose an active bank Asset account.");
		if (r && z.getAll().some((e) => e.lines.some((e) => e.accountId === r.glAccountId)) && (r.glAccountId !== n.glAccountId || r.openingBalanceDate !== n.openingBalanceDate || r.currency !== n.currency)) throw Error("A used bank account cannot change its ledger, currency or opening date.");
		let a = new Date(Math.max(Date.now(), r ? Date.parse(r.updatedAt) + 1 : 0)).toISOString(), o = {
			...n,
			id: r?.id ?? crypto.randomUUID(),
			openingBalance: r?.openingBalance ?? 0,
			createdAt: r?.createdAt ?? a,
			updatedAt: a
		};
		return Ad(o), Dd = [...Dd.filter((e) => e.id !== o.id), o], kd(), o;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Dd = Dd.map((t) => t.id === e ? r : t), Wc(Cd) && Uc(Cd, Dd), kd(), r;
	}
};
o("bankAccounts", {
	repository: jd,
	read: "banking.read",
	commands: {
		if: null,
		validateBankAccount: null,
		setActive: "banking.write",
		save: "banking.write"
	},
	snapshot: () => ({ bankAccounts: Dd }),
	restore: (e) => {
		Dd = e.bankAccounts;
	},
	publish: () => Td.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var Md = /* @__PURE__ */ new Set(), Nd = I.read().payments;
function Pd() {
	Md.forEach((e) => e());
}
function Fd() {
	return `payment_${crypto.randomUUID()}`;
}
function Id() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Nd.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var Ld = {
	subscribe(e) {
		return Md.add(e), () => {
			Md.delete(e);
		};
	},
	getSnapshot() {
		return Nd;
	},
	getAll() {
		return Nd;
	},
	getById(e) {
		return Nd.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Nd.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Nd.filter((t) => t.invoiceId === e);
	},
	create(e) {
		if (!e.customerId) throw Error("Customer is required");
		if (!e.invoiceId) throw Error("Invoice is required");
		if (!e.paymentDate) throw Error("Payment date is required");
		if (!e.bankAccountId) throw Error("Bank account is required");
		let t = jd.getById(e.bankAccountId);
		if (!t) throw Error("Bank account was not found");
		if (!t.active) throw Error("The selected bank account is inactive");
		if (!Number.isFinite(e.amount) || e.amount <= 0) throw Error("Payment amount must be greater than zero");
		if (p(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (zd(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = N.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: zd(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: Rd(e.reference),
				notes: Rd(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = Nd.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Fd(),
			paymentNumber: Id(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: zd(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: Rd(e.reference),
			notes: Rd(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && N.bindResult(n, i.id);
		let a = [i, ...Nd];
		if (I.update("payments", a), Nd = a, n && !e.deferOperationCompletion) try {
			N.complete(n, i.id);
		} catch (e) {
			try {
				N.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return Pd(), i;
	},
	reverse(e, t) {
		let n = Nd.find((t) => t.id === e);
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
		}, o = Nd.map((t) => t.id === e ? a : t);
		return I.update("payments", o), Nd = o, Pd(), a;
	},
	getReceivedByInvoice(e) {
		return Nd.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function Rd(e) {
	return e?.trim() || void 0;
}
function zd(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
o("customerPayments", {
	repository: Ld,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null
	},
	snapshot: () => ({ payments: Nd }),
	restore: (e) => {
		Nd = e.payments;
	},
	publish: () => Md.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/taxPosting.ts
function Bd(e, t, n, r) {
	let i = t === "paid" ? "GST_RECEIVABLE" : "GST_PAYABLE", a = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = (t === "paid" ? n.taxPaidAccountId : n.taxCollectedAccountId) || R.requireBySystemRole(i).id;
		a.set(e, (a.get(e) ?? 0) + n.taxAmount);
	}
	return e.length || a.set(R.requireBySystemRole(i).id, r), [...a].filter(([, e]) => Math.round((e + 2 ** -52) * 100) !== 0).map(([e, t]) => {
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
function Vd(e) {
	return R.requireBySystemRole(e).id;
}
function Hd(e) {
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
function Ud(e, t) {
	return z.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Wd(e, t) {
	let n = Ud(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Gd = {
	postInvoice(e) {
		return Ud("CUSTOMER_INVOICE", e.id) || z.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: Vd("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: Vd("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				...Bd(e.lines, "collected", !1, e.totals.taxAmount)
			]
		});
	},
	reverseInvoice(e) {
		let t = Wd("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? z.getById(t.reversalJournalEntryId) : void 0 : z.reverse({
			journalEntryId: t.id,
			reversalDate: Hd(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = Ud("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = jd.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this customer payment is inactive.");
		return z.post({
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
				accountId: Vd("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = Wd("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? z.getById(t.reversalJournalEntryId) : void 0 : z.reverse({
			journalEntryId: t.id,
			reversalDate: Hd(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return Ud("CREDIT_NOTE", e.id) || z.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: Vd("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				...Bd(e.lines, "collected", !0, e.totals.taxAmount),
				{
					accountId: Vd("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = Wd("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? z.getById(t.reversalJournalEntryId) : void 0 : z.reverse({
			journalEntryId: t.id,
			reversalDate: Hd(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, Kd = /* @__PURE__ */ new Set(), qd = Bl(), Jd = Fl(), Yd = Al(), V = qd.status === "ok" ? structuredClone(qd.data.quotes) : Jd.status === "ok" ? structuredClone(Jd.data.quotes) : Yd.status === "ok" ? structuredClone(Yd.data) : structuredClone(Iu);
function Xd(e) {
	qd.status === "ok" || Bl().status !== "empty" ? Vl({
		quotes: e,
		salesOrders: H,
		invoices: U
	}) : Jd.status === "ok" || Fl().status !== "empty" ? Il({
		quotes: e,
		salesOrders: H
	}) : jl(e), V = e, ef();
}
var H = qd.status === "ok" ? structuredClone(qd.data.salesOrders) : Jd.status === "ok" ? structuredClone(Jd.data.salesOrders) : structuredClone(Lu), U = qd.status === "ok" ? structuredClone(qd.data.invoices) : structuredClone(Ru);
function Zd(e) {
	Vl({
		quotes: V,
		salesOrders: H,
		invoices: e
	}), U = e, ef();
}
function Qd(e, t = V) {
	qd.status === "ok" || Bl().status !== "empty" ? Vl({
		quotes: t,
		salesOrders: e,
		invoices: U
	}) : Il({
		quotes: t,
		salesOrders: e
	}), H = e, V = t, ef();
}
var $d = tf();
function ef() {
	$d = tf(), Kd.forEach((e) => e());
}
function tf() {
	return [
		...V,
		...H,
		...U
	];
}
var W = {
	createManagedOrder(e) {
		let t = H.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: af("order"),
			managedDraftId: e.draftId,
			type: "SALES_ORDER",
			status: "CONFIRMED",
			documentNumber: of("SO", H.map((e) => e.documentNumber)),
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
		return Qd([r, ...H]), r;
	},
	createManagedInvoice(e) {
		let t = U.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = W.createManagedOrder(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: af("invoice"),
			managedDraftId: e.draftId,
			type: "INVOICE",
			status: "ISSUED",
			documentNumber: of("INV", U.map((e) => e.documentNumber)),
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
		}, a = H.map((e) => e.id === n.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: r
		} : e);
		return Vl({
			quotes: V,
			salesOrders: a,
			invoices: [i, ...U]
		}), H = a, U = [i, ...U], ef(), Gd.postInvoice(i), i;
	},
	cancelManagedOrder(e, t) {
		let n = H.find((t) => t.id === e);
		if (!n?.managedDraftId) throw Error("Managed order not found.");
		if (n.status === "CANCELLED") return n;
		if (n.invoiceIds.some((e) => U.some((t) => t.id === e && t.status !== "VOID"))) throw Error("Void active invoices before cancelling the order.");
		if (n.status === "PARTIALLY_FULFILLED" || n.status === "FULFILLED" || n.fulfilmentStatus === "PARTIALLY_FULFILLED" || n.fulfilmentStatus === "FULFILLED") throw Error("Reverse active fulfilments before cancelling the order.");
		if (t.trim().length < 3) throw Error("Cancellation reason is required.");
		let r = {
			...n,
			status: "CANCELLED",
			notes: (n.notes ?? "") + "\nCancelled: " + t.trim(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Qd(H.map((t) => t.id === e ? r : t)), r;
	},
	subscribe(e) {
		return Kd.add(e), () => {
			Kd.delete(e);
		};
	},
	getSnapshot() {
		return $d;
	},
	getAll() {
		return $d;
	},
	getById(e) {
		return $d.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return $d.filter((t) => t.customerId === e);
	},
	getQuotesByCustomer(e) {
		return V.filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return H.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return U.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (nf(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = e.lines.map((t) => xd({
			customerId: e.customerId,
			documentDate: e.documentDate,
			draft: t
		})), n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: af("quote"),
			type: "QUOTE",
			documentNumber: of("QU", V.map((e) => e.documentNumber)),
			recipient: il(e.customerId, e),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: rf(e.customerReference),
			notes: rf(e.notes),
			lines: t,
			totals: bd(t),
			createdAt: n,
			updatedAt: n
		};
		return Xd([r, ...V]), r;
	},
	updateDraftQuote(e, t) {
		let r = V.find((t) => t.id === e);
		if (!r) throw Error(`Quote ${e} was not found`);
		if (r.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let i = t.lines.map((e) => {
			if (e.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
			if (!Number.isFinite(e.standardUnitPrice) || !Number.isFinite(e.unitPrice) || e.standardUnitPrice < 0 || e.unitPrice < 0) throw Error("Sales prices cannot be negative");
			let t = Pc(e.productId, e.unitId, e.quantity, e.requestedArea);
			cl(e.productId, e.unitId, t.quantity, "sell");
			let i = jc(e.productId)?.taxCode ?? n().gstCode, o = yd({
				taxRate: s(i),
				quantity: t.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice
			}), c = r.lines.find((t) => t.id === e.lineId);
			return {
				...t,
				id: c?.id ?? af("line"),
				productId: e.productId,
				unitId: e.unitId,
				sku: lf(e.productId, e.unitId).sku,
				description: lf(e.productId, e.unitId).description,
				unitSymbol: lf(e.productId, e.unitId).unitSymbol,
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
			recipient: t.locationId === void 0 && t.accountingContactId === void 0 ? r.recipient : il(r.customerId, t),
			documentDate: t.documentDate,
			expiryDate: t.expiryDate,
			customerReference: rf(t.customerReference),
			notes: rf(t.notes),
			lines: i,
			totals: bd(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Xd(V.map((t) => t.id === e ? o : t)), o;
	},
	sendQuote(e) {
		let t = V.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return Xd(V.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = V.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return Xd(V.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = V.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return Xd(V.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = V.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: af("order"),
			type: "SALES_ORDER",
			documentNumber: of("SO", H.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: sf(),
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
		return Qd([r, ...H], V.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = H.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED" && n.status !== "INVOICED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: n.status === "INVOICED" ? "INVOICED" : t,
			fulfilmentStatus: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Qd(H.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = H.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = sf(), a = {
			id: af("invoice"),
			managedDraftId: t.managedDraftId,
			type: "INVOICE",
			documentNumber: of("INV", U.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: i,
			dueDate: cf(i, Number(n().terms)),
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
		}, o = [a, ...U], s = H.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, a.id],
			updatedAt: r
		} : e);
		return Vl({
			quotes: V,
			salesOrders: s,
			invoices: o
		}), U = o, H = s, ef(), Gd.postInvoice(a), a;
	},
	createCreditNoteFromInvoice(e) {
		let t = U.find((t) => t.id === e.invoiceId);
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
			let i = B.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id).reduce((e, t) => e + t.quantity, 0);
			if (e.quantity + i > n.quantity + 1e-8) throw Error("Credit quantity cannot exceed the original invoice quantity.");
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = B.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id), s = e.quantity + i >= n.quantity - 1e-8, c = uf(s ? n.lineSubtotal - o.reduce((e, t) => e + t.lineSubtotal, 0) : n.lineSubtotal * e.quantity / n.quantity), l = uf(s ? n.taxAmount - o.reduce((e, t) => e + t.taxAmount, 0) : n.taxAmount * e.quantity / n.quantity);
			return {
				...n,
				requestedArea: e.quantity === n.quantity ? n.requestedArea : void 0,
				coveredArea: n.areaPerPack ? Math.round(e.quantity * n.areaPerPack * 1e8) / 1e8 : void 0,
				quantity: e.quantity,
				taxRate: a,
				lineSubtotal: c,
				taxAmount: l,
				lineTotal: uf(c + l)
			};
		}), a = bd(i);
		if (a.total <= 0) throw Error("Credit note total must be greater than zero");
		if (uf(uf(B.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + a.total) > uf(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: af("credit-note"),
			creditNoteNumber: of("CN", B.getAll().map((e) => e.creditNoteNumber)),
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
		return B.create(s), Gd.postCreditNote(s), s;
	},
	applyCreditToInvoice(e) {
		F(), Fu();
		let t = B.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		let n = U.find((t) => t.id === e.invoiceId);
		if (!n) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void credit note cannot be applied");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be applied");
		if (n.status === "VOID") throw Error("Credit cannot be applied to a void invoice");
		if (n.status === "DRAFT") throw Error("Credit cannot be applied to a draft invoice");
		if (t.customerId !== n.customerId) throw Error("Credit note and invoice must belong to the same customer");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the credit note date");
		let r = uf(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = B.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: af("credit-allocation"),
			allocationNumber: of("CA", B.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = uf(i.amountApplied + r), c = uf(Math.max(0, i.totals.total - (i.amountRefunded ?? 0) - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
		if (N.begin(l, "SALES_CREDIT_APPLY", JSON.stringify({
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: r
		})).status !== "started") throw Error("Credit allocation was previously attempted; manual review required.");
		try {
			N.bindResult(l, o.id), B.commitAllocationAndCredit(o, {
				...i,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(n.id), N.complete(l, o.id);
		} catch (e) {
			try {
				N.flagForReview(l, "Credit allocation/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	reverseCreditAllocation(e) {
		F(), Fu();
		let t = B.getAllocationById(e.allocationId);
		if (!t) throw Error(`Credit allocation ${e.allocationId} was not found`);
		if (t.status === "REVERSED") throw Error("This credit allocation has already been reversed");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A reversal reason is required");
		let r = B.getById(t.creditNoteId);
		if (!r) throw Error("Credit note was not found");
		if (r.status === "VOID") throw Error("Allocations on a void credit note cannot be reversed here");
		let i = U.find((e) => e.id === t.invoiceId);
		if (!i) throw Error("Allocated invoice was not found");
		if (i.status === "VOID") throw Error("Credit allocation cannot be reversed after the invoice has been voided");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			updatedAt: a
		}, s = uf(B.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = uf(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - s)), l = `sales-credit-reversal:${t.id}`;
		if (N.begin(l, "SALES_CREDIT_REVERSAL", t.id).status !== "started") throw Error("Credit allocation reversal previously attempted; manual review required.");
		try {
			N.bindResult(l, t.id), B.commitAllocationAndCredit(o, {
				...r,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(i.id), N.complete(l, t.id);
		} catch (e) {
			try {
				N.flagForReview(l, "Credit reversal/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	voidCreditNote(e) {
		let t = B.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		if (t.status === "VOID") throw Error("This credit note has already been voided");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be voided here");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse customer refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required");
		if (B.getAllocationsByCreditNote(t.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this credit note");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: r,
			voidReason: n,
			updatedAt: r
		};
		return B.update(i), Gd.reverseCreditNote(i), i;
	},
	recordInvoicePayment(e) {
		if (F(), Fu(), e.operationId) {
			let t = N.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = U.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = uf(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (p(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, a = Ld.create({
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
			Gd.postPayment(a);
			let e = z.getBySource("CUSTOMER_PAYMENT", a.id).filter((e) => !e.reversedJournalEntryId);
			if (e.length !== 1 || e[0].status !== "POSTED") throw Error("Payment GL posting could not be verified uniquely.");
			N.complete(i, a.id);
		} catch (e) {
			try {
				N.flagForReview(i, "Payment or GL posting uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	voidInvoice(e, t) {
		F(), Fu();
		let n = U.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (Ld.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
		if (B.getAllocationsByInvoice(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("This invoice has applied credits. Reverse all active credit allocations before voiding the invoice.");
		if (n.managedDraftId && B.getByInvoice(n.id).some((e) => e.status !== "VOID")) throw Error("Void source credits before voiding this direct invoice.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			amountPaid: 0,
			amountDue: 0,
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		}, o = `sales-invoice-void:${e}`;
		if (N.begin(o, "SALES_INVOICE_VOID", e).status !== "started") throw Error("Invoice void was previously attempted; inspect GL and operation journal before retrying.");
		try {
			let t = z.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (t.length !== 1 || t[0].status !== "POSTED") throw Error("Invoice original GL must be uniquely posted before voiding.");
			N.bindResult(o, e), Gd.reverseInvoice(a);
			let n = z.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			Zd(U.map((t) => t.id === e ? a : t)), N.complete(o, e);
		} catch (e) {
			try {
				N.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		ol("CUSTOMER_PAYMENT", e), F(), Fu();
		let n = Ld.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = U.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (N.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			N.bindResult(i, e);
			let n = Ld.reverse(e, t);
			Gd.reversePayment(n);
			let a = z.getBySource("CUSTOMER_PAYMENT", e).filter((e) => !e.reversedJournalEntryId);
			if (a.length !== 1 || a[0].status !== "REVERSED") throw Error("Payment GL reversal could not be verified.");
			return this.recalculateInvoiceBalance(r.id), N.complete(i, e), n;
		} catch (e) {
			try {
				N.flagForReview(i, "Payment reversal/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
	},
	recalculateInvoiceBalance(e) {
		let t = U.find((t) => t.id === e);
		if (!t) throw Error(`Invoice ${e} was not found`);
		if (t.status === "VOID") return t;
		let n = Ld.getReceivedByInvoice(e), r = B.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = uf(n.reduce((e, t) => e + t.amount, 0)), a = uf(r.reduce((e, t) => e + t.amount, 0)), o = uf(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : df(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Zd(U.map((t) => t.id === e ? c : t)), c;
	}
};
function nf(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function rf(e) {
	return e?.trim() || void 0;
}
function af(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function of(e, t) {
	return m(e, t, u((/* @__PURE__ */ new Date()).toISOString()).slice(0, 4));
}
function sf() {
	return u((/* @__PURE__ */ new Date()).toISOString());
}
function cf(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function lf(e, t) {
	let n = jc(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = Mc(e, t);
	if (!r) throw Error(`Unit ${t} was not found for ${n.name}`);
	return {
		sku: n.sku,
		description: n.name,
		unitSymbol: r.symbol
	};
}
function uf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function df(e) {
	return e < ff(/* @__PURE__ */ new Date());
}
function ff(e) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
o("sales", {
	repository: W,
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
	validate: (e) => {
		let t = e;
		for (let e of [
			...t.quotes,
			...t.salesOrders,
			...t.invoices
		]) {
			al(e.recipient);
			for (let t of e.lines) Fc(t);
		}
	},
	snapshot: () => ({
		quotes: V,
		salesOrders: H,
		invoices: U
	}),
	restore: (e) => {
		V = e.quotes, H = e.salesOrders, U = e.invoices, $d = tf();
	},
	publish: () => Kd.forEach((e) => e())
});
//#endregion
//#region src/features/document-output/outputRepository.ts
var pf = E().min(1).max(200), mf = E().max(2e4), hf = mf.optional(), gf = [
	"QUOTE",
	"SALES_ORDER",
	"INVOICE",
	"CREDIT_NOTE"
], _f = A({
	operationId: pf,
	sourceId: pf,
	kind: j(gf),
	expectedUpdatedAt: pf,
	templateId: pf.optional()
}).strict(), vf = O().finite().nonnegative(), yf = A({
	id: pf,
	sku: mf,
	description: mf,
	unitSymbol: mf,
	quantity: O().positive().finite(),
	unitPrice: vf,
	lineSubtotal: vf,
	taxAmount: vf,
	lineTotal: vf,
	taxCode: hf,
	taxRate: O().finite().min(0).max(1).optional(),
	requestedArea: O().positive().finite().optional(),
	areaPerPack: O().positive().finite().optional(),
	coveredArea: O().positive().finite().optional()
}).strict(), bf = A({
	locationId: hf,
	locationName: hf,
	deliveryAddress: hf,
	accountingContactId: hf,
	accountingContactName: hf,
	accountingEmail: hf
}).strict(), xf = A({
	id: pf,
	revision: pf,
	name: mf,
	subject: mf,
	body: mf,
	footer: mf,
	paper: j(["A4", "Letter"])
}).strict(), Sf = A({
	id: pf,
	operationId: pf,
	requestFingerprint: mf,
	preparedAt: pf,
	preparedBy: pf,
	sourceId: pf,
	kind: j(gf),
	sourceUpdatedAt: pf,
	documentNumber: pf,
	status: pf,
	documentDate: pf,
	dueDate: hf,
	expiryDate: hf,
	reference: hf,
	notes: hf,
	customerId: pf,
	customerName: mf,
	customerCode: mf,
	customerIdentifier: hf,
	recipient: bf.optional(),
	issuer: A({
		name: mf,
		tradingName: hf,
		identifier: hf,
		address: hf,
		email: hf,
		phone: hf,
		currency: pf
	}).strict(),
	lines: k(yf).min(1),
	totals: A({
		subtotal: vf,
		taxAmount: vf,
		total: vf
	}).strict(),
	amountPaid: vf.optional(),
	amountDue: vf.optional(),
	template: xf,
	subject: mf,
	body: mf
}).strict();
function Cf(e, t) {
	if (e === "CREDIT_NOTE") {
		let e = B.getById(t);
		if (!e) throw Error("Credit note was not found.");
		return {
			...e,
			type: "CREDIT_NOTE",
			documentNumber: e.creditNoteNumber,
			documentDate: e.creditDate
		};
	}
	let n = W.getById(t);
	if (!n || n.type !== e) throw Error("Sales document was not found.");
	return n;
}
var wf = (e) => e === "QUOTE" ? "Quotation" : e === "INVOICE" ? "Invoice" : e === "SALES_ORDER" ? "Sales order" : "Credit note";
function Tf() {
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
var Ef = [];
Tf();
var Df = 0, Of = /* @__PURE__ */ new Set(), kf = () => {
	Df++, Of.forEach((e) => e());
};
function Af(e, t) {
	let n = t ? d.templates?.find((n) => n.id === t && n.status === "Active" && n.kind === wf(e)) : void 0;
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
var jf = [
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
function Mf(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!jf.includes(n)) throw Error(`Unsupported template token: ${n}.`);
		return t[n] ?? "";
	});
}
function Nf(e) {
	return {
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
var Pf = { prepare(e) {
	let t = _f.parse(e), r = JSON.stringify(t), i = Ef.find((e) => e.operationId === t.operationId);
	if (i) {
		if (i.requestFingerprint !== r) throw Error("Operation ID was used for different output data.");
		return i;
	}
	let a = Cf(t.kind, t.sourceId);
	if (a.updatedAt !== t.expectedUpdatedAt) throw Error("Source document changed. Reload before preparing output.");
	let o = rl.getById(a.customerId);
	if (!o) throw Error("Source customer was not found.");
	let s = n(), c = Af(t.kind, t.templateId), l = structuredClone(a.recipient), u = {
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
		preparedBy: kc.current()?.userId ?? "local-test",
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
		lines: a.lines.map(Nf),
		totals: structuredClone(a.totals),
		amountPaid: "amountPaid" in a ? a.amountPaid : void 0,
		amountDue: "amountDue" in a ? a.amountDue : void 0,
		template: {
			...c,
			footer: Mf(c.footer, u)
		},
		subject: Mf(c.subject, u),
		body: Mf(c.body, u)
	};
	return Ff(d), Ef = [d, ...Ef], kf(), d;
} };
function Ff(e) {
	let t = Sf.parse(e);
	if (al(t.recipient), !Number.isFinite(Date.parse(t.preparedAt))) throw Error("Invalid preparation timestamp.");
	let n = _f.parse(JSON.parse(t.requestFingerprint));
	if (n.operationId !== t.operationId || n.sourceId !== t.sourceId || n.kind !== t.kind || n.expectedUpdatedAt !== t.sourceUpdatedAt) throw Error("Output source metadata mismatch.");
	let r = (e) => Math.round(e * 100) / 100;
	for (let e of t.lines) if (Fc(e), r(e.lineSubtotal + e.taxAmount) !== e.lineTotal) throw Error("Invalid output line total.");
	for (let [e, n] of [
		["subtotal", "lineSubtotal"],
		["taxAmount", "taxAmount"],
		["total", "lineTotal"]
	]) if (r(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Invalid output totals.");
	return t;
}
o("preparedSalesOutputs", {
	repository: Pf,
	read: "sales.read",
	commands: { prepare: "documents.prepare" },
	snapshot: () => ({
		artifacts: Ef,
		templates: Tf()
	}),
	restore: (e) => {
		Ef = e.artifacts, e.templates;
	},
	publish: kf,
	validate: (e, t) => {
		let n = A({
			artifacts: k(Sf),
			templates: k(A({
				id: pf,
				name: mf,
				kind: pf
			}).strict())
		}).strict().parse(e), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
		for (let e of n.artifacts) {
			if (Ff(e), r.has(e.id) || i.has(e.operationId)) throw Error("Duplicate prepared output.");
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
//#region src/features/inventory/data/inventorySiteRepository.ts
var If = structuredClone([{
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
}]), Lf = {
	getAll() {
		return If;
	},
	getById(e) {
		return If.find((t) => t.id === e);
	},
	getActive() {
		return If.filter((e) => e.status === "ACTIVE");
	}
}, Rf = /* @__PURE__ */ new Set(), zf = [];
function Bf() {
	Rf.forEach((e) => e());
}
function Vf() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = zf.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var Hf = {
	subscribe(e) {
		return Rf.add(e), () => {
			Rf.delete(e);
		};
	},
	getSnapshot() {
		return zf;
	},
	getAll() {
		return zf;
	},
	getByReference(e, t) {
		return zf.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return zf.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return zf.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: Vf(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return zf = [t, ...zf], Bf(), t;
	}
};
o("inventoryMovements", {
	repository: Hf,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: zf }),
	restore: (e) => {
		zf = e.movements;
	},
	publish: () => Rf.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var Uf = /* @__PURE__ */ new Set(), Wf = [];
function Gf() {
	Uf.forEach((e) => e());
}
function Kf(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var qf = {
	subscribe(e) {
		return Uf.add(e), () => {
			Uf.delete(e);
		};
	},
	getSnapshot() {
		return Wf;
	},
	getAll() {
		return Wf;
	},
	getBalance(e, t) {
		return Wf.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = qf.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: Kf(i.quantityOnHand + r),
				updatedAt: a
			};
			return Wf = Wf.map((r) => r.siteId === e && r.productId === t ? n : r), Gf(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: Kf(r),
			updatedAt: a
		};
		return Wf = [o, ...Wf], Gf(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = qf.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = Kf(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Wf = Wf.map((n) => n.siteId === e && n.productId === t ? o : n), Gf(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of Hf.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: Kf((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		Wf = Array.from(e.values()), Gf();
	}
};
o("stock", {
	repository: qf,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: Wf }),
	restore: (e) => {
		Wf = e.balances;
	},
	publish: () => Uf.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var Jf = /* @__PURE__ */ new Set(), Yf = [];
function Xf() {
	Jf.forEach((e) => e());
}
var Zf = {
	subscribe(e) {
		return Jf.add(e), () => {
			Jf.delete(e);
		};
	},
	getSnapshot() {
		return Yf;
	},
	getAll() {
		return Yf;
	},
	getBalance(e, t) {
		return Yf.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = Zf.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return Yf = Yf.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? Yf.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...Yf], Xf(), e;
	},
	replaceAll(e) {
		Yf = e, Xf();
	},
	clear() {
		Yf = [], Xf();
	}
};
o("costBalances", {
	repository: Zf,
	read: "inventory.cost.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: Yf }),
	restore: (e) => {
		Yf = e.balances;
	},
	publish: () => Jf.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var Qf = /* @__PURE__ */ new Set(), $f = [];
function ep() {
	Qf.forEach((e) => e());
}
function tp() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = $f.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function np(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var rp = {
	subscribe(e) {
		return Qf.add(e), () => {
			Qf.delete(e);
		};
	},
	getSnapshot() {
		return $f;
	},
	getAll() {
		return $f;
	},
	getByReference(e, t) {
		return $f.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return $f.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return $f.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return $f.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return np(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: tp(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = rp.build(e);
		return $f = [t, ...$f], ep(), t;
	},
	replaceAll(e) {
		$f = e, ep();
	},
	clear() {
		$f = [], ep();
	}
};
o("costMovements", {
	repository: rp,
	read: "inventory.cost.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: $f }),
	restore: (e) => {
		$f = e.movements;
	},
	publish: () => Qf.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var ip = /* @__PURE__ */ new Set(), ap = "2026-01-01T00:00:00.000Z", op = Ac.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: ap,
	updatedAt: ap
}));
function sp() {
	ip.forEach((e) => e());
}
var cp = {
	ensureProductPolicy(e, t, n) {
		let r = op.find((t) => t.productId === e), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			productId: e,
			baseUnitId: t,
			active: r?.active ?? n,
			costingMethod: "MOVING_WEIGHTED_AVERAGE",
			createdAt: r?.createdAt ?? i,
			updatedAt: i
		};
		return op = [...op.filter((t) => t.productId !== e), a], sp(), a;
	},
	subscribe(e) {
		return ip.add(e), () => {
			ip.delete(e);
		};
	},
	getSnapshot() {
		return op;
	},
	getAll() {
		return op;
	},
	getByProductId(e) {
		return op.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = cp.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		let n = {
			...cp.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return op = op.map((t) => t.productId === e ? n : t), sp(), n;
	}
};
o("costingPolicies", {
	repository: cp,
	read: "inventory.cost.read",
	commands: {
		ensureProductPolicy: null,
		setActive: "accounting.post"
	},
	snapshot: () => ({ policies: op }),
	restore: (e) => {
		op = e.policies;
	},
	publish: () => ip.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function G(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function lp(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function up(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function dp({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return lp(e / t);
}
function fp({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return up(e * t);
}
function pp({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = G(e + n), a = up(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : lp(a / i)
	};
}
function mp({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return up(e * t);
}
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function hp(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function gp(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function _p(e, t) {
	let n = jc(e);
	if (!n) throw Error("Product was not found.");
	let r = cp.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = Mc(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function vp(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = up(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(up(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function yp(e) {
	if (e && rp.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function bp({ movement: e, balance: t }) {
	let n = rp.getAll(), r = Zf.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	rp.replaceAll(i), Zf.replaceAll(a);
}
function xp(e) {
	if (hp(e.quantity), gp(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	yp(e.inventoryMovementId);
	let { policy: t, unit: n } = _p(e.productId, e.unitId), r = G(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = dp({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = fp({
		quantityBase: r,
		unitCostBase: i
	}), o = Zf.getBalance(e.siteId, e.productId);
	o && vp(o, t.baseUnitId);
	let s = pp({
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
	vp(l, t.baseUnitId);
	let u = rp.build({
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
	return bp({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function Sp(e) {
	hp(e.quantity), gp(e.occurredAt), yp(e.inventoryMovementId);
	let { policy: t, unit: n } = _p(e.productId, e.unitId), r = G(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = Zf.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (vp(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = lp(i.averageCostPerBaseUnit), o = mp({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = G(i.quantityOnHand - r), c = s === 0, l = up(c ? -i.inventoryValue : -o), u = c ? 0 : up(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : lp(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	vp(p, t.baseUnitId);
	let m = rp.build({
		movementType: e.movementType ?? "ISSUE",
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: t.baseUnitId,
		quantityBase: G(-r),
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
	return bp({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function Cp(e) {
	if (hp(e.quantityBase), gp(e.occurredAt), yp(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = jc(e.productId);
	if (!t) throw Error("Product was not found.");
	let n = cp.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = G(e.quantityBase), i = lp(e.unitCostBase), a = up(e.inventoryValue), o = Zf.getBalance(e.siteId, e.productId);
	o && vp(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = G(s + r), u = up(c + a), d = l === 0 ? 0 : lp(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	vp(p, n.baseUnitId);
	let m = rp.build({
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
	return bp({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/accounting/data/inventoryAccountingPostingService.ts
function wp(e) {
	return R.requireBySystemRole(e).id;
}
function Tp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ep(e) {
	return z.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function Dp(e) {
	let t = rp.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var Op = {
	postSalesFulfilment(e) {
		let t = Ep(e.id);
		if (t) return t;
		let n = Tp(Dp(e).reduce((e, t) => {
			if (t.valueChange > 0) throw Error(`Sales fulfilment cost movement ${t.costMovementNumber} has an invalid positive inventory value change.`);
			return e - t.valueChange;
		}, 0));
		if (!Number.isFinite(n) || n < 0) throw Error("Sales fulfilment COGS amount is invalid.");
		if (n !== 0) return z.post({
			journalDate: e.fulfilmentDate,
			description: `COGS for sales fulfilment ${e.fulfilmentNumber}`,
			reference: e.fulfilmentNumber,
			sourceType: "SALES_FULFILMENT",
			sourceId: e.id,
			lines: [{
				accountId: wp("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: wp("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = Ep(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? z.getById(r.reversalJournalEntryId) : void 0 : z.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, kp = /* @__PURE__ */ new Set(), Ap = [], jp = Ap;
function Mp() {
	jp = Ap, kp.forEach((e) => e());
}
function Np() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Ap.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function Pp(e, t) {
	return G(Ap.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function Fp(e) {
	let t = W.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.map((e) => Pp(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.every((e, t) => n[t] >= G(e.quantity));
	W.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function Ip(e) {
	let t = rp.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var Lp = {
	subscribe(e) {
		return kp.add(e), () => {
			kp.delete(e);
		};
	},
	getSnapshot() {
		return jp;
	},
	getAll() {
		return jp;
	},
	getById(e) {
		return Ap.find((t) => t.id === e);
	},
	getBySalesOrder(e) {
		return Ap.filter((t) => t.salesOrderId === e);
	},
	getFulfilledQuantity: Pp,
	getRemainingQuantity(e, t) {
		let n = W.getById(e);
		if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let r = n.lines.find((e) => e.id === t);
		if (!r) throw Error("Sales order line was not found.");
		return G(r.quantity - Pp(e, t));
	},
	create(e) {
		let t = W.getById(e.salesOrderId);
		if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let n = t;
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "INVOICED") throw Error("Only a confirmed or partially fulfilled sales order can be fulfilled.");
		if (n.status === "INVOICED" && !n.invoiceIds.some((e) => {
			let t = W.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("This order has no active invoice; do not fulfil a void invoice.");
		let r = Lf.getById(e.siteId);
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
			let i = jc(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let o = Mc(t.productId, t.unitId);
			if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
			if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
			let s = G(e.fulfilledQuantity);
			if (t.areaPerPack && !Number.isInteger(e.fulfilledQuantity)) throw Error("Area-based lines must be dispatched in whole packs.");
			let c = Pp(n.id, t.id);
			if (s > G(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
			let l = G(s * o.conversionToBase), u = qf.getBalance(r.id, t.productId);
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
			s.set(e.orderLine.productId, G(t + e.fulfilledBaseQuantity));
		}
		for (let [e, t] of s) {
			let n = qf.getBalance(r.id, e);
			if (!n || n.quantityOnHand < t) {
				let t = jc(e);
				throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
			}
		}
		let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = Np(), d = o.map((e) => ({
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
			let i = jc(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let a = Hf.create({
				movementType: "SALE",
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: G(-t.fulfilledBaseQuantity),
				transactionUnitId: t.unitId,
				transactionUnitSymbol: t.unitSymbol,
				transactionQuantity: G(-t.fulfilledQuantity),
				conversionToBase: t.conversionToBase,
				referenceType: "SALES_FULFILMENT",
				referenceId: f.id,
				referenceNumber: f.fulfilmentNumber,
				salesOrderId: n.id,
				salesOrderNumber: n.documentNumber,
				occurredAt: e.fulfilmentDate,
				notes: `Sales fulfilment ${f.fulfilmentNumber}`
			});
			Sp({
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
			}), qf.issue({
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: t.fulfilledBaseQuantity
			});
		}
		return Op.postSalesFulfilment(f), Ap = [f, ...Ap], Mp(), Fp(n.id), f;
	},
	void(e) {
		let t = Ap.find((t) => t.id === e.fulfilmentId);
		if (!t) throw Error("Sales fulfilment was not found.");
		if (t.status === "VOIDED") throw Error("Sales fulfilment has already been voided.");
		if (Number.isNaN(Date.parse(e.voidDate))) throw Error("Fulfilment void date is invalid.");
		if (e.voidDate < t.fulfilmentDate) throw Error("Fulfilment void date cannot be earlier than the fulfilment date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Fulfilment void reason must contain at least 3 characters.");
		let r = W.getById(t.salesOrderId);
		if (!r || r.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		if (r.status === "INVOICED" && r.invoiceIds.some((e) => {
			let t = W.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("Cannot void a sales fulfilment for an invoiced sales order.");
		if (r.status !== "CONFIRMED" && r.status !== "PARTIALLY_FULFILLED" && r.status !== "FULFILLED" && r.status !== "INVOICED") throw Error(`Cannot void a sales fulfilment when the sales order status is ${r.status}.`);
		let i = Ip(t), a = /* @__PURE__ */ new Set(), o = t.lines.map((e) => {
			let n = jc(e.productId);
			if (!n) throw Error(`Product ${e.sku} was not found.`);
			let r = i.find((n) => !a.has(n.id) && n.siteId === t.siteId && n.productId === e.productId && Math.abs(n.quantityBase) === e.fulfilledBaseQuantity);
			if (!r) throw Error(`Unique original inventory cost issue for ${e.sku} was not found.`);
			return a.add(r.id), {
				line: e,
				product: n,
				originalIssue: r
			};
		});
		Op.reverseSalesFulfilment({
			fulfilment: t,
			reversalDate: e.voidDate,
			reason: n
		});
		for (let r of o) {
			let { line: i, product: a, originalIssue: o } = r, s = Hf.create({
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
			Cp({
				siteId: t.siteId,
				productId: i.productId,
				quantityBase: i.fulfilledBaseQuantity,
				unitCostBase: o.unitCostBase,
				inventoryValue: up(Math.abs(o.valueChange)),
				referenceType: "SALE",
				referenceId: t.id,
				referenceNumber: t.fulfilmentNumber,
				inventoryMovementId: s.id,
				occurredAt: e.voidDate,
				notes: `Void sales fulfilment ${t.fulfilmentNumber}: ${n}`
			}), qf.receive({
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
		return Ap = Ap.map((e) => e.id === s.id ? s : e), Mp(), Fp(t.salesOrderId), s;
	}
};
o("fulfilments", {
	repository: Lp,
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: Ap }),
	restore: (e) => {
		Ap = e.fulfilments, jp = Ap;
	},
	publish: () => kp.forEach((e) => e())
});
//#endregion
//#region src/features/direct-documents/dispatchRepository.ts
var Rp = E().trim().min(1).max(200), zp = A({
	operationId: Rp,
	salesOrderId: Rp,
	siteId: Rp,
	fulfilmentDate: Rp,
	lines: k(A({
		salesOrderLineId: Rp,
		fulfilledQuantity: O().positive().finite()
	}).strict()).min(1).max(500)
}).strict();
function Bp() {
	return W.getAll().filter((e) => e.type === "SALES_ORDER" && [
		"CONFIRMED",
		"PARTIALLY_FULFILLED",
		"INVOICED"
	].includes(e.status)).filter((e) => e.type === "SALES_ORDER" && (e.status !== "INVOICED" || e.invoiceIds.some((e) => {
		let t = W.getById(e);
		return t?.type === "INVOICE" && t.status !== "VOID";
	}))).map((e) => ({
		id: e.id,
		number: e.documentNumber,
		date: e.documentDate,
		delivery: e.recipient?.deliveryAddress,
		store: e.recipient?.locationName,
		lines: e.lines.map((t) => ({
			id: t.id,
			sku: t.sku,
			description: t.description,
			unit: t.unitSymbol,
			quantity: t.quantity,
			fulfilled: Lp.getAll().filter((t) => t.salesOrderId === e.id && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t.id).reduce((e, t) => e + t.fulfilledQuantity, 0)
		}))
	}));
}
Bp();
var Vp = [], Hp = 0, Up = /* @__PURE__ */ new Set(), Wp = () => {
	Hp++, Up.forEach((e) => e());
};
o("salesDispatch", {
	repository: {
		record(e) {
			let t = zp.parse(e), n = JSON.stringify(t), r = Vp.find((e) => e.id === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Dispatch operation ID was already used with different data.");
				return Lp.getAll().find((e) => e.id === r.fulfilmentId);
			}
			if (F(), p(t.fulfilmentDate), Zl(t.fulfilmentDate), new Set(t.lines.map((e) => e.salesOrderLineId)).size !== t.lines.length) throw Error("Each dispatch line must be selected only once.");
			let i = Lp.create(t);
			return Vp = [...Vp, {
				id: t.operationId,
				fingerprint: n,
				fulfilmentId: i.id
			}], Wp(), i;
		},
		reverse(e) {
			let t = A({
				fulfilmentId: Rp,
				voidDate: Rp,
				reason: E().trim().min(3).max(1e3)
			}).strict().parse(e);
			F(), p(t.voidDate), Zl(t.voidDate);
			let n = Lp.getAll().find((e) => e.id === t.fulfilmentId);
			return n?.status === "VOIDED" ? n : Lp.void(t);
		}
	},
	read: "inventory.read",
	commands: {
		record: "inventory.adjust",
		reverse: "inventory.adjust"
	},
	snapshot: () => ({
		orders: Bp(),
		requests: Vp
	}),
	restore: (e) => {
		e.orders, Vp = e.requests;
	},
	publish: Wp,
	validate: (e, t) => {
		let n = A({
			orders: k(A({
				id: Rp,
				number: Rp,
				date: Rp,
				delivery: E().optional(),
				store: E().optional(),
				lines: k(A({
					id: Rp,
					sku: E(),
					description: E(),
					unit: E(),
					quantity: O().finite().positive(),
					fulfilled: O().finite().nonnegative()
				}).strict())
			}).strict()),
			requests: k(A({
				id: Rp,
				fingerprint: E().max(1e6),
				fulfilmentId: Rp
			}).strict())
		}).strict().parse(e), r = t.fulfilments.fulfilments;
		if (n.requests.some((e) => !r.some((t) => t.id === e.fulfilmentId))) throw Error("Dispatch result reference is invalid.");
	}
});
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var Gp = [
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
], Kp = "htt.mock.contacts.suppliers.v1";
function qp(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var Jp = Hc(Kp, qp), Yp = Jp.status !== "invalid" && Wc(Kp), Xp = /* @__PURE__ */ new Set(), Zp = Jp.status === "ok" ? Jp.data : structuredClone(Gp);
function Qp() {
	Yp && Uc(Kp, Zp), Xp.forEach((e) => {
		e();
	});
}
function $p(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function em() {
	let e = Zp.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function tm(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function nm(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function rm(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: tm(e.tradingName),
		abn: nm(e.abn),
		status: e.status,
		email: tm(e.email),
		phone: tm(e.phone),
		website: tm(e.website),
		contactName: tm(e.contactName),
		addressLine1: tm(e.addressLine1),
		addressLine2: tm(e.addressLine2),
		suburb: tm(e.suburb),
		state: tm(e.state),
		postcode: tm(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: tm(e.notes)
	};
}
var im = {
	subscribe(e) {
		return Xp.add(e), () => {
			Xp.delete(e);
		};
	},
	getSnapshot() {
		return Zp;
	},
	getAll() {
		return Zp;
	},
	getById(e) {
		return Zp.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: $p("sup"),
			code: em(),
			...rm(e),
			currency: n().currency,
			createdAt: t,
			updatedAt: t
		};
		return Zp = [r, ...Zp], Qp(), r;
	},
	update(e, t) {
		let n = im.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...rm(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Zp = Zp.map((t) => t.id === e ? r : t), Qp(), r;
	}
};
o("suppliers", {
	repository: im,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: Zp }),
	restore: (e) => {
		Zp = e.suppliers;
	},
	publish: () => Xp.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
function am(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function om({ orderedQuantity: e, unitCost: t, taxRate: n = s(), inclusiveLineTotal: r }) {
	let i = am(e * t), a = am(r === void 0 ? i * n : r - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: am(i + a)
	};
}
function sm(e) {
	let t = am(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = am(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: am(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var cm = /* @__PURE__ */ new Set(), K = I.read().purchaseOrders;
I.onRollback(() => {
	K = I.read().purchaseOrders;
});
function lm() {
	try {
		I.update("purchaseOrders", K);
	} catch (e) {
		throw K = I.read().purchaseOrders, e;
	}
	cm.forEach((e) => I.notify(e));
}
function um(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function dm(e) {
	return m("PO", K.map((e) => e.purchaseOrderNumber), e.slice(0, 4));
}
function fm(e) {
	return e?.trim() || void 0;
}
function pm(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = Ac.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let i = t.units.find((t) => t.id === e.unitId);
		if (!i) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!i.active) throw Error(`${i.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		if (cl(e.productId, e.unitId, e.orderedQuantity, "buy"), t.buyEnabled === !1) throw Error("Product is not available for purchasing.");
		let o = t.taxCode ?? n().gstCode, c = s(o), l = om({
			taxRate: c,
			inclusiveLineTotal: (e.priceBasis ?? n().basis) === "Inclusive" ? Math.round(e.orderedQuantity * e.unitCost * 100) / 100 : void 0,
			orderedQuantity: e.orderedQuantity,
			unitCost: r(e.unitCost, c, e.priceBasis)
		});
		return {
			id: um("pol"),
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
function mm(e) {
	let t = im.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function hm(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var gm = {
	subscribe(e) {
		return cm.add(e), () => {
			cm.delete(e);
		};
	},
	getSnapshot() {
		return K;
	},
	getAll() {
		return K;
	},
	getById(e) {
		return K.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return K.filter((t) => t.supplierId === e);
	},
	create(e) {
		hm(e);
		let t = mm(e.supplierId), n = pm(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: um("po"),
			purchaseOrderNumber: dm(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: fm(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: fm(e.supplierReference),
			notes: fm(e.notes),
			lines: n,
			totals: sm(n),
			createdAt: r,
			updatedAt: r
		};
		return K = [i, ...K], lm(), i;
	},
	updateDraft(e, t) {
		let n = gm.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		hm(t);
		let r = mm(t.supplierId), i = pm(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: fm(t.expectedDeliveryDate),
			supplierReference: fm(t.supplierReference),
			notes: fm(t.notes),
			lines: i,
			totals: sm(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((e) => e.id === n.id ? a : e), lm(), a;
	},
	approve(e) {
		let t = gm.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return _m(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = gm.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return _m(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = gm.getById(e);
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
		return K = K.map((e) => e.id === n.id ? o : e), lm(), o;
	},
	recordSupplierBill(e, t) {
		let n = gm.getById(e);
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
			let n = vm(e.billedQuantity + t);
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
		return K = K.map((e) => e.id === n.id ? c : e), lm(), c;
	},
	reverseSupplierBill(e, t) {
		let n = gm.getById(e);
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
				billedQuantity: vm(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((e) => e.id === n.id ? c : e), lm(), c;
	},
	cancel(e, t) {
		let n = gm.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return _m(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function _m(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return K = K.map((t) => t.id === e.id ? n : t), lm(), n;
}
function vm(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
o("purchaseOrders", {
	repository: gm,
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
	snapshot: () => ({ purchaseOrders: K }),
	restore: (e) => {
		K = e.purchaseOrders;
	},
	publish: () => cm.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function ym(e) {
	return up(e.lines.reduce((e, t) => {
		let n = dp({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + fp({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function bm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function xm(e) {
	return R.requireBySystemRole(e).id;
}
function Sm(e) {
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
function Cm(e, t) {
	return z.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function wm(e, t) {
	let n = Cm(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Tm = {
	validateGoodsReceiptPosting(e) {
		let t = R.requireBySystemRole("INVENTORY"), n = R.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = ym(e);
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
		let t = z.getBySource("GOODS_RECEIPT", e.id).find((e) => !e.reversedJournalEntryId);
		if (t) return t;
		let { inventoryAccountId: n, grniAccountId: r, receiptValue: i } = this.validateGoodsReceiptPosting(e);
		return z.post({
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
		let n = R.requireBySystemRole("GRNI"), r = R.requireBySystemRole("GST_RECEIVABLE"), i = R.requireBySystemRole("ACCOUNTS_PAYABLE");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI account must be an active liability account.");
		if (!r.active || r.type !== "ASSET") throw Error("GST Receivable must be an active asset account.");
		if (!i.active || i.type !== "LIABILITY") throw Error("Accounts Payable must be an active liability account.");
		if (!Number.isFinite(t) || t < 0) throw Error("Matched receipt value must be a non-negative finite number.");
		let a = bm(e.totals.subtotal - t);
		if (a !== 0) {
			let e = R.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = bm(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = Cm("SUPPLIER_BILL", e.id);
		if (n) return n;
		let r = t ?? e.totals.subtotal, { variance: i } = this.validateSupplierBillPosting(e, r);
		return z.post({
			journalDate: e.billDate,
			description: `Supplier bill ${e.billNumber}`,
			reference: e.supplierInvoiceNumber,
			sourceType: "SUPPLIER_BILL",
			sourceId: e.id,
			lines: [
				{
					accountId: xm("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				...Bd(e.lines, "paid", !0, e.totals.taxAmount),
				...i === 0 ? [] : [{
					accountId: xm("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: xm("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = wm("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? z.getById(t.reversalJournalEntryId) : void 0 : z.reverse({
			journalEntryId: t.id,
			reversalDate: Sm(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = Cm("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = jd.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return z.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: xm("ACCOUNTS_PAYABLE"),
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
		let t = wm("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? z.getById(t.reversalJournalEntryId) : void 0 : z.reverse({
			journalEntryId: t.id,
			reversalDate: Sm(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return Cm("SUPPLIER_CREDIT", e.id) || z.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: xm("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				...e.lines.reduce((e, t) => {
					let n = t.expenseAccountId ?? xm("PURCHASE_PRICE_VARIANCE"), r = e.find((e) => e.accountId === n);
					return r ? r.credit = Math.round((r.credit + t.lineSubtotal) * 100) / 100 : t.lineSubtotal && e.push({
						accountId: n,
						debit: 0,
						credit: t.lineSubtotal
					}), e;
				}, []),
				...Bd(e.lines, "paid", !1, e.totals.taxAmount)
			]
		});
	},
	reverseSupplierCredit(e) {
		for (let t of z.getBySource("SUPPLIER_CREDIT_RECLASS", e.id).filter((e) => e.status === "POSTED")) z.reverse({
			journalEntryId: t.id,
			reversalDate: Sm(e.voidedAt),
			reason: e.voidReason ?? "Credit void"
		});
		let t = wm("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? z.getById(t.reversalJournalEntryId) : void 0 : z.reverse({
			journalEntryId: t.id,
			reversalDate: Sm(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, Em = /* @__PURE__ */ new Set(), Dm = I.read().goodsReceipts;
I.onRollback(() => {
	Dm = I.read().goodsReceipts;
});
function Om() {
	try {
		I.update("goodsReceipts", Dm);
	} catch (e) {
		throw Dm = I.read().goodsReceipts, e;
	}
	Em.forEach((e) => I.notify(e));
}
function km(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Am(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = Dm.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function jm(e) {
	return e?.trim() || void 0;
}
var Mm = {
	subscribe(e) {
		return Em.add(e), () => {
			Em.delete(e);
		};
	},
	getSnapshot() {
		return Dm;
	},
	getAll() {
		return Dm;
	},
	getById(e) {
		return Dm.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return Dm.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = gm.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = Lf.getById(e.siteId);
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
			let r = km(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!jc(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = Mc(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = km(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: Am(e.receiptDate),
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
			supplierDeliveryReference: jm(e.supplierDeliveryReference),
			notes: jm(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		Tm.validateGoodsReceiptPosting(s), F();
		let c = P.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return P.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = jc(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				P.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = Hf.create({
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
				}), P.runStep(c, `COST:${r.id}`, () => {
					let t = l.get(r.id);
					if (!t) throw Error(`Missing inventory movement for ${r.id}`);
					xp({
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
				}), P.runStep(c, `STOCK:${r.id}`, () => {
					qf.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			P.runStep(c, "JOURNAL", () => {
				Tm.postGoodsReceipt(s);
			}), P.runStep(c, "PURCHASE_ORDER", () => {
				gm.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), P.runStep(c, "RECEIPT", () => {
				Dm = [s, ...Dm], Om();
			});
		}), P.recover(c), s;
	}
};
o("goodsReceipts", {
	repository: Mm,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: Dm }),
	restore: (e) => {
		Dm = e.goodsReceipts;
	},
	publish: () => Em.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var Nm = 1e-4;
function Pm(e) {
	return up(e);
}
function Fm(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - G(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function Im(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function Lm(e, t, n) {
	let r = dp({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return fp({
		quantityBase: G(e * n),
		unitCostBase: r
	});
}
function Rm(e, t, n) {
	let r = [], i = n.filter((e) => e.status === "ACTIVE");
	for (let n of t) if (n.purchaseOrderId === e && n.status === "POSTED") for (let e of n.lines) {
		let t = G(i.filter((t) => t.goodsReceiptId === n.id && t.goodsReceiptLineId === e.id).reduce((e, t) => e + t.matchedQuantity, 0)), a = G(e.receivedQuantity - t);
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
function zm(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = Rm(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), Fm(e.quantity), Im(e.billUnitCost);
		let r = G(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > Nm);
		if (G(d.reduce((e, t) => e + t.availableQuantity, 0)) + Nm < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= Nm) break;
			let s = G(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = G(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = fp({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: dp({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = Pm(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), h = Math.abs(o.availableQuantity - s) <= Nm ? Pm(p - m) : Lm(s, o.receiptUnitCost, o.conversionToBase);
			if (h < 0) throw Error("Receipt cost has been overallocated.");
			let ee = Pm(s * e.billUnitCost), te = Pm(ee - h);
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
				matchedBillValue: ee,
				priceVariance: te,
				status: "ACTIVE",
				createdAt: l
			}), o.availableQuantity = G(o.availableQuantity - s), r = G(r - s);
		}
		if (r > Nm) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = Pm(Pm(e.quantity * e.billUnitCost) - Pm(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = Pm(p.matchedBillValue + f), p.priceVariance = Pm(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = G(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = G(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = Pm(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = Pm(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: Pm(p - f)
	};
}
var Bm = {
	calculate: zm,
	getAvailableReceiptLines(e, t, n) {
		return Rm(e, t, n);
	}
}, Vm = I.read().receiptMatches;
I.onRollback(() => {
	Vm = I.read().receiptMatches;
});
var Hm = /* @__PURE__ */ new Set(), Um = () => {
	try {
		I.update("receiptMatches", Vm);
	} catch (e) {
		throw Vm = I.read().receiptMatches, e;
	}
	Hm.forEach((e) => I.notify(e));
}, Wm = {
	getAll() {
		return [...Vm];
	},
	subscribe(e) {
		return Hm.add(e), () => {
			Hm.delete(e);
		};
	},
	getSnapshot() {
		return Vm;
	},
	getByBill(e) {
		return Vm.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (Vm.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		Vm = [...Vm, ...t], Um();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		Vm = Vm.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), Um();
	}
};
o("receiptMatches", {
	repository: Wm,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: Vm }),
	restore: (e) => {
		Vm = e.matches;
	},
	publish: () => Hm.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
function Gm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Km({ quantity: e, unitCost: t, inclusiveLineTotal: n, taxRate: r = .1 }) {
	let i = Gm(e * t), a = Gm(n === void 0 ? i * r : n - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: Gm(i + a)
	};
}
function qm(e) {
	let t = Gm(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Gm(e.reduce((e, t) => e + t.taxAmount, 0)), r = Gm(t + n);
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
var Jm = /* @__PURE__ */ new Set(), q = I.read().supplierBills;
I.onRollback(() => {
	q = I.read().supplierBills;
});
function Ym() {
	try {
		I.update("supplierBills", q);
	} catch (e) {
		throw q = I.read().supplierBills, e;
	}
	Jm.forEach((e) => I.notify(e));
}
function Xm(e) {
	return e?.trim() || void 0;
}
function Zm(e) {
	return m("BILL", q.map((e) => e.billNumber), e.slice(0, 4));
}
var Qm = {
	insertExpenseBill(e) {
		let t = q.find((t) => t.managedDraftId === e.managedDraftId);
		if (t) return t;
		if (q.some((t) => t.supplierId === e.supplierId && t.supplierInvoiceNumber.toLowerCase() === e.supplierInvoiceNumber.toLowerCase() && t.status !== "VOID")) throw Error("Supplier invoice reference already exists.");
		return q = [e, ...q], Ym(), e;
	},
	subscribe(e) {
		return Jm.add(e), () => {
			Jm.delete(e);
		};
	},
	getSnapshot() {
		return q;
	},
	getAll() {
		return q;
	},
	getById(e) {
		return q.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return q.filter((t) => t.supplierId === e);
	},
	applyPayment(e, t) {
		let n = q.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a payment.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment allocation must be greater than zero.");
		let r = eh(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = eh(n.totals.amountPaid + r), a = eh(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return q = q.map((t) => t.id === e ? o : t), Ym(), o;
	},
	reversePayment(e, t) {
		let n = q.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = eh(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = eh(Math.max(0, n.totals.amountPaid - r)), a = eh(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return q = q.map((t) => t.id === e ? o : t), Ym(), o;
	},
	applyCredit(e, t) {
		let n = q.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = eh(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = eh(n.totals.amountCredited + r), a = eh(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return q = q.map((t) => t.id === e ? o : t), Ym(), o;
	},
	reverseCredit(e, t) {
		let n = q.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = eh(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = eh(Math.max(0, n.totals.amountCredited - r)), a = eh(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return q = q.map((t) => t.id === e ? o : t), Ym(), o;
	},
	markVoid(e, t) {
		let n = q.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("This supplier bill has already been voided.");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required.");
		if (n.status !== "OPEN" || n.totals.amountPaid > 0 || n.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if (n.kind === "EXPENSE") {
			if (te().supplierCredits.supplierCredits.some((e) => e.sourceSupplierBillId === n.id && e.status !== "VOID")) throw Error("Void source supplier credits before voiding the expense bill.");
			F();
			let e = (/* @__PURE__ */ new Date()).toISOString(), t = {
				...n,
				status: "VOID",
				voidedAt: e,
				voidReason: r,
				updatedAt: e
			};
			return Tm.reverseSupplierBill(t), q = q.map((e) => e.id === n.id ? t : e), Ym(), t;
		}
		if (Wm.getByBill(n.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		};
		F();
		let o = P.begin("SUPPLIER_BILL_VOID", n.id).key;
		return P.registerRecovery(o, () => {
			P.runStep(o, "REVERSAL_JOURNAL", () => {
				Tm.reverseSupplierBill(a);
			}), P.runStep(o, "PURCHASE_ORDER", () => {
				gm.reverseSupplierBill(n.purchaseOrderId, n.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), P.runStep(o, "MATCHES", () => {
				Wm.reverseForBill(n.id, r, u(i));
			}), P.runStep(o, "BILL", () => {
				q = q.map((e) => e.id === n.id ? a : e), Ym();
			});
		}), P.recover(o), a;
	},
	getByPurchaseOrder(e) {
		return q.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = gm.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (![
			"PARTIALLY_RECEIVED",
			"RECEIVED",
			"BILLED"
		].includes(t.status)) throw Error("Supplier bills can only be created for purchase orders with received goods.");
		let n = e.supplierInvoiceNumber.trim();
		if (!n) throw Error("Supplier invoice number is required.");
		if (q.some((e) => e.supplierId === t.supplierId && e.supplierInvoiceNumber.toLowerCase() === n.toLowerCase() && e.status !== "VOID")) throw Error("This supplier invoice number has already been entered.");
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
			let r = $m(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = Km({
				taxRate: a,
				quantity: e.quantity,
				unitCost: e.unitCost
			});
			return n.grossUnitCost !== void 0 && e.unitCost === n.unitCost && (o.taxAmount = eh(e.quantity * n.grossUnitCost - o.lineSubtotal), o.lineTotal = eh(o.lineSubtotal + o.taxAmount)), {
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
		}), o = qm(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: Zm(e.billDate),
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
			notes: Xm(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = Bm.calculate({
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
			receipts: Mm.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: Wm.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		Tm.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), F();
		let u = P.begin("SUPPLIER_BILL", c.id).key;
		return P.registerRecovery(u, () => {
			P.runStep(u, "JOURNAL", () => {
				Tm.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), P.runStep(u, "PURCHASE_ORDER", () => {
				gm.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), P.runStep(u, "MATCHES", () => {
				Wm.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), P.runStep(u, "BILL", () => {
				q = [c, ...q], Ym();
			});
		}), P.recover(u), c;
	}
};
function $m(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function eh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
o("supplierBills", {
	repository: Qm,
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
	snapshot: () => ({ supplierBills: q }),
	restore: (e) => {
		q = e.supplierBills;
	},
	publish: () => Jm.forEach((e) => e())
});
//#endregion
//#region src/features/direct-documents/managedDocumentRepository.ts
var J = E().trim().min(1).max(200), th = E().trim().max(2e3).optional(), nh = A({
	requestedArea: O().finite().positive().max(1e9).optional(),
	productId: J,
	unitId: J,
	quantity: O().positive().finite(),
	unitPrice: O().nonnegative().finite().optional(),
	priceBasis: j(["Inclusive", "Exclusive"]).optional()
}).strict(), rh = A({
	description: E().trim().min(1).max(500),
	accountId: J,
	quantity: O().positive().finite(),
	unitCost: O().nonnegative().finite(),
	taxCode: J,
	priceBasis: j(["Inclusive", "Exclusive"]).optional()
}).strict(), ih = A({
	kind: j(["ORDER", "INVOICE"]),
	customerId: J,
	locationId: J.or(ic("")).optional(),
	accountingContactId: J.or(ic("")).optional(),
	documentDate: J,
	dueDate: J.optional(),
	customerReference: th,
	notes: th,
	lines: k(nh).min(1).max(500)
}).strict(), ah = A({
	kind: ic("EXPENSE"),
	supplierId: J,
	supplierInvoiceNumber: J,
	documentDate: J,
	dueDate: J,
	notes: th,
	lines: k(rh).min(1).max(500)
}).strict(), oh = () => R.getAll().filter((e) => e.active && e.type === "EXPENSE" && e.allowManualPosting && (!e.systemRole || e.systemRole === "OPERATING_EXPENSE" || e.systemRole === "FREIGHT")).map((e) => ({
	id: e.id,
	code: e.code,
	name: e.name
}));
oh();
var sh = [], ch = [], lh = 0, uh = /* @__PURE__ */ new Set(), dh = () => {
	lh++, uh.forEach((e) => e());
}, fh = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function ph(e, t) {
	return {
		action: e,
		actorId: kc.current()?.userId ?? "local-test",
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...t ? { reason: t } : {}
	};
}
function mh(e) {
	for (let t of e) if (t.taxAmount) for (let [e, n] of [[t.taxCollectedAccountId, "LIABILITY"], [t.taxPaidAccountId, "ASSET"]]) {
		if (!e) continue;
		let t = R.requireById(e);
		if (!t.active || t.type !== n) throw Error("A snapshotted tax posting account is no longer active or has the wrong type.");
	}
}
function hh(e) {
	let t = R.requireById(e);
	if (!t.active || t.type !== "EXPENSE" || !t.allowManualPosting || t.systemRole && t.systemRole !== "OPERATING_EXPENSE" && t.systemRole !== "FREIGHT") throw Error("Use an active manual expense account, not an inventory, GRNI or control account.");
	return t;
}
function gh(e) {
	let t = e.payload;
	if (t.kind === "EXPENSE") {
		let n = im.getById(t.supplierId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active supplier.");
		for (let t of e.lines) hh(t.expenseAccountId);
	} else {
		let n = rl.getById(t.customerId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active customer.");
		for (let t of e.lines) cl(t.productId, t.unitId, t.quantity, "sell");
	}
	mh(e.lines);
}
function _h(e) {
	if (p(e.documentDate, "Document date"), e.dueDate && (p(e.dueDate, "Due date"), e.dueDate < e.documentDate)) throw Error("Due date cannot precede document date.");
	if (e.kind !== "ORDER" && !e.dueDate) throw Error("Due date is required.");
	let t = e.kind === "EXPENSE" ? e.lines.map((e) => {
		hh(e.accountId);
		let t = a(e.taxCode), i = r(e.unitCost, t.taxRate, e.priceBasis), o = fh(e.quantity * i), s = (e.priceBasis ?? n().basis) === "Inclusive" ? fh(e.quantity * e.unitCost - o) : fh(o * t.taxRate);
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
			lineTotal: fh(o + s)
		};
	}) : e.lines.map((t) => xd({
		customerId: e.customerId,
		documentDate: e.documentDate,
		draft: t
	})), i = bd(t);
	if (i.total <= 0 || !Number.isFinite(i.total)) throw Error("Document total must be finite and greater than zero.");
	return {
		lines: t,
		totals: i
	};
}
function vh(e) {
	let t = () => e === "sales" ? sh : ch;
	function n(t) {
		return e === "sales" ? sh = [...sh.filter((e) => e.id !== t.id), t] : ch = [...ch.filter((e) => e.id !== t.id), t], dh(), t;
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
			history: [...e.history, ph(t, i)]
		});
	}
	return {
		save(a) {
			let o = A({
				operationId: J,
				id: J.optional(),
				expectedRevision: O().int().positive().optional(),
				payload: e === "sales" ? ih : ah
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
			let l = _h(o.payload), u = (/* @__PURE__ */ new Date()).toISOString(), d = {
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
				recipient: o.payload.kind === "EXPENSE" ? void 0 : il(o.payload.customerId, o.payload),
				...l,
				createdAt: c?.createdAt ?? u,
				updatedAt: u,
				history: [...c?.history ?? [], ph(c ? "Edited" : "Created")]
			};
			if (c && c.kind !== d.kind) throw Error("Document kind cannot change.");
			return gh(d), n(d);
		},
		approve(e, t) {
			let n = r(e);
			if (n.status === "APPROVED" && n.revision === t + 1) return n;
			if (i(n, t), n.status !== "DRAFT") throw Error("Only a draft can be approved.");
			return gh(n), a(n, "Approved", { status: "APPROVED" });
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
			F(), Zl(n.payload.documentDate), gh(n);
			let o, s = n.payload;
			if (s.kind === "EXPENSE") {
				let e = im.getById(s.supplierId), t = (/* @__PURE__ */ new Date()).toISOString(), r = {
					id: crypto.randomUUID(),
					managedDraftId: n.id,
					kind: "EXPENSE",
					billNumber: m("BILL", Qm.getAll().map((e) => e.billNumber), s.documentDate.slice(0, 4)),
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
				Qm.insertExpenseBill(r);
				let i = r.lines.filter((e) => e.lineSubtotal !== 0).map((e) => ({
					accountId: e.expenseAccountId,
					description: e.description,
					debit: e.lineSubtotal,
					credit: 0
				}));
				z.post({
					journalDate: r.billDate,
					description: "Expense bill " + r.billNumber,
					reference: r.supplierInvoiceNumber,
					sourceType: "SUPPLIER_BILL",
					sourceId: r.id,
					lines: [
						...i,
						...Bd(r.lines, "paid", !0, r.totals.taxAmount),
						{
							accountId: R.requireBySystemRole("ACCOUNTS_PAYABLE").id,
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
				o = s.kind === "ORDER" ? W.createManagedOrder(e).id : W.createManagedInvoice({
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
			return W.cancelManagedOrder(n.documentId, t), a(n, "Order cancelled", {}, t);
		}
	};
}
var yh = vh("sales"), bh = vh("expense"), xh = A({
	recipient: A({
		locationId: E().optional(),
		locationName: E().optional(),
		deliveryAddress: E().optional(),
		accountingContactId: E().optional(),
		accountingContactName: E().optional(),
		accountingEmail: E().email().optional()
	}).strict().optional(),
	id: J,
	operationId: J,
	creationFingerprint: E().max(1e6),
	revision: O().int().positive(),
	kind: j([
		"ORDER",
		"INVOICE",
		"EXPENSE"
	]),
	status: j([
		"DRAFT",
		"APPROVED",
		"POSTED",
		"CANCELLED"
	]),
	payload: Zs([ih, ah]),
	lines: k(A({
		id: J,
		description: E().min(1),
		quantity: O().finite().positive(),
		unitSymbol: E().min(1),
		unitPrice: O().finite().nonnegative().optional(),
		unitCost: O().finite().nonnegative().optional(),
		taxRate: O().finite().min(0).max(1),
		taxCode: J,
		taxPaidAccountId: J.optional(),
		taxCollectedAccountId: J.optional(),
		lineSubtotal: O().finite().nonnegative(),
		taxAmount: O().finite().nonnegative(),
		lineTotal: O().finite().nonnegative()
	}).passthrough()).min(1),
	totals: A({
		subtotal: O().finite(),
		taxAmount: O().finite(),
		total: O().finite()
	}),
	documentId: J.optional(),
	createdAt: J,
	updatedAt: J,
	history: k(A({
		action: J,
		actorId: J,
		at: J,
		reason: E().optional()
	}).strict()).min(1)
}).strict();
for (let e of ["sales", "expense"]) o(e === "sales" ? "managedSalesDocuments" : "expenseBillDrafts", {
	repository: e === "sales" ? yh : bh,
	read: e === "sales" ? "sales.read" : "purchases.read",
	commands: {
		save: e === "sales" ? "sales.manage" : "purchases.bill",
		approve: e === "sales" ? "sales.manage" : "accounting.post",
		reopen: e === "sales" ? "sales.manage" : "accounting.post",
		cancel: e === "sales" ? "sales.manage" : "purchases.bill",
		post: e === "sales" ? "sales.manage" : "purchases.bill",
		cancelOrder: e === "sales" ? "sales.manage" : null
	},
	snapshot: () => e === "sales" ? { drafts: sh } : {
		drafts: ch,
		options: oh()
	},
	restore: (t) => {
		e === "sales" ? sh = t.drafts : (ch = t.drafts, t.options);
	},
	publish: dh,
	validate: (t, n) => {
		let { drafts: r } = A({
			drafts: k(xh),
			...e === "expense" ? { options: k(A({
				id: J,
				code: J,
				name: J
			}).strict()) } : {}
		}).strict().parse(t);
		for (let t of r) {
			if (al(t.recipient), t.kind !== t.payload.kind || e === "expense" != (t.kind === "EXPENSE")) throw Error("Draft kind mismatch.");
			if (p(t.payload.documentDate), t.payload.dueDate && (p(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate)) throw Error("Draft due date is invalid.");
			let r = n, i = t.payload.kind === "EXPENSE" ? t.payload.supplierId : t.payload.customerId;
			if (!(t.payload.kind === "EXPENSE" ? r.suppliers.suppliers : r.customers.customers).some((e) => e.id === i) || t.lines.length !== t.payload.lines.length) throw Error("Draft party or line references are invalid.");
			for (let [e, n] of t.lines.entries()) {
				let i = t.payload.lines[e], a = n;
				if (t.kind !== "EXPENSE" && (Fc(a), a.requestedArea !== i.requestedArea)) throw Error("Draft area requirement mismatch.");
				if (typeof a.quantity != "number" || !Number.isFinite(a.quantity) || a.quantity <= 0 || i.requestedArea === void 0 && a.quantity !== i.quantity || fh(a.lineSubtotal + a.taxAmount) !== a.lineTotal) throw Error("Draft line amounts are invalid.");
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
				if (fh(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Draft totals do not match lines.");
			}
			if (t.status === "POSTED") {
				let e = n;
				if (!(t.kind === "EXPENSE" ? e.supplierBills.supplierBills : t.kind === "ORDER" ? e.sales.salesOrders : e.sales.invoices).some((e) => e.id === t.documentId && e.managedDraftId === t.id && e.totals.total === t.totals.total)) throw Error("Posted draft source reference is invalid.");
			}
		}
	}
});
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var Sh = /* @__PURE__ */ new Set(), Y = I.read().supplierCredits, Ch = I.read().supplierCreditAllocations, wh = I.read().supplierCredits, Th = I.read().supplierCreditAllocations;
I.onRollback(() => {
	Y = I.read().supplierCredits, Ch = I.read().supplierCreditAllocations, wh = Y, Th = Ch;
});
function Eh() {
	I.update("supplierCredits", Y), I.update("supplierCreditAllocations", Ch), wh = [...Y], Th = [...Ch], Sh.forEach((e) => I.notify(e));
}
var X = {
	subscribe(e) {
		return Sh.add(e), () => {
			Sh.delete(e);
		};
	},
	getSnapshot() {
		return wh;
	},
	getAllocationSnapshot() {
		return Th;
	},
	getAll() {
		return wh;
	},
	getAllAllocations() {
		return Th;
	},
	getById(e) {
		return Y.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return Y.filter((t) => t.supplierId === e);
	},
	getBySourceBill(e) {
		return Y.filter((t) => t.sourceSupplierBillId === e);
	},
	getAllocationById(e) {
		return Ch.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return Ch.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return Ch.filter((t) => t.supplierBillId === e);
	},
	create(e) {
		let t = Qm.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (Y.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!Ah(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, t) => {
			let n = i.get(e.supplierBillLineId);
			if (!n) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(n.id)) throw Error(`${n.description} appears more than once in the supplier credit.`);
			a.add(n.id);
			let r = Mh(e.quantity);
			if (!Number.isFinite(r) || r <= 0) throw Error(`${n.description} credit quantity must be greater than zero.`);
			if (r > n.quantity) throw Error(`${n.description} credit quantity cannot exceed the source bill quantity.`);
			let o = e.unitCost;
			if (!Number.isFinite(o) || o < 0) throw Error(`${n.description} unit cost cannot be negative.`);
			if (o > n.unitCost + 1e-8) throw Error(`${n.description} credit unit cost cannot exceed the source bill unit cost.`);
			let s = jh(r * o), c = jh(n.unitCost ? n.taxAmount * r / n.quantity * o / n.unitCost : 0), l = jh(s + c);
			return {
				id: kh(`supplier-credit-line-${t + 1}`),
				expenseAccountId: n.expenseAccountId,
				taxCode: n.taxCode,
				taxRate: n.taxRate,
				taxCollectedAccountId: n.taxCollectedAccountId,
				taxPaidAccountId: n.taxPaidAccountId,
				taxReport: n.taxReport,
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
		}), s = jh(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = jh(o.reduce((e, t) => e + t.taxAmount, 0)), l = jh(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (jh(jh(Y.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > jh(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: kh("supplier-credit"),
			creditNumber: Oh(e.creditDate),
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
		return Y = [d, ...Y], Eh(), Tm.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = Y.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = Qm.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!Ah(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = jh(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: kh("supplier-credit-allocation"),
			allocationNumber: Dh(e.allocationDate),
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
		Qm.applyCredit(n.id, r);
		let o = jh(t.amountApplied + r), s = jh(Math.max(0, t.totals.total - (t.amountRefunded ?? 0) - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return Ch = [a, ...Ch], Y = Y.map((e) => e.id === t.id ? c : e), Eh(), a;
	},
	reverseAllocation(e) {
		let t = Ch.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = Y.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = Qm.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		Qm.reverseCredit(i.id, t.amount);
		let o = jh(Math.max(0, r.amountApplied - t.amount)), s = jh(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - o)), c = {
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
		return Y = Y.map((e) => e.id === r.id ? c : e), Ch = Ch.map((e) => e.id === t.id ? l : e), Eh(), l;
	},
	voidCredit(e) {
		let t = Y.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse supplier refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (Ch.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: r,
			voidReason: n,
			updatedAt: r
		};
		return Y = Y.map((e) => e.id === t.id ? i : e), Eh(), Tm.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!Ch.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return Ch = Ch.map((t) => t.id === e.id ? e : t), Eh(), e;
	},
	update(e) {
		if (!Y.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return Y = Y.map((t) => t.id === e.id ? e : t), Eh(), e;
	}
};
function Dh(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = Ch.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Oh(e) {
	return m("SC", Y.map((e) => e.creditNumber), e.slice(0, 4));
}
function kh(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function Ah(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function jh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Mh(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var Nh = X.create;
X.create = function(...e) {
	return F(), I.transaction(() => Nh.apply(X, e));
};
var Ph = X.applyToBill;
X.applyToBill = function(...e) {
	return F(), I.transaction(() => Ph.apply(X, e));
};
var Fh = X.reverseAllocation;
X.reverseAllocation = function(...e) {
	return F(), I.transaction(() => Fh.apply(X, e));
};
var Ih = X.voidCredit;
X.voidCredit = function(...e) {
	return F(), I.transaction(() => Ih.apply(X, e));
};
var Lh = X.update;
X.update = function(...e) {
	return F(), I.transaction(() => Lh.apply(X, e));
};
var Rh = X.updateAllocation;
X.updateAllocation = function(...e) {
	return F(), I.transaction(() => Rh.apply(X, e));
}, o("supplierCredits", {
	repository: X,
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
		supplierCredits: Y,
		allocations: Ch
	}),
	restore: (e) => {
		Y = e.supplierCredits, Ch = e.allocations, wh = [...Y], Th = [...Ch];
	},
	publish: () => Sh.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/bankRegisterService.ts
function zh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Bh(e, t) {
	p(e, t);
}
function Vh(e, t, n) {
	Bh(e.openingBalanceDate, "Opening balance date"), Bh(n, "As-at date");
	let r = t.filter((t) => t.journalDate >= e.openingBalanceDate && t.journalDate <= n).flatMap((t) => t.lines.filter((t) => t.accountId === e.glAccountId).map((e) => ({
		entry: t,
		line: e
	}))).sort((e, t) => {
		let n = e.entry.journalDate.localeCompare(t.entry.journalDate);
		if (n !== 0) return n;
		let r = e.entry.createdAt.localeCompare(t.entry.createdAt);
		return r === 0 ? e.line.id.localeCompare(t.line.id) : r;
	}), i = zh(e.openingBalance), a = 0, o = 0, s = r.map(({ entry: t, line: n }) => {
		let r = zh(n.debit), s = zh(n.credit);
		return a = zh(a + r), o = zh(o + s), i = zh(i + r - s), {
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
		openingBalance: zh(e.openingBalance),
		moneyIn: a,
		moneyOut: o,
		closingBalance: i,
		transactionCount: s.length,
		transactions: s
	};
}
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function Hh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Uh(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) {
		if (r.has(t.id)) {
			i = Hh(i + t.moneyIn), a = Hh(a + t.moneyOut);
			continue;
		}
		o = Hh(o + t.moneyIn), s = Hh(s + t.moneyOut);
	}
	let c = Hh(Hh(t) + o - s), l = Hh(e.closingBalance), u = Hh(c - l);
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
var Wh = /* @__PURE__ */ new Set(), Gh = I.read().reconciliations;
I.onRollback(() => {
	Gh = I.read().reconciliations;
});
function Kh() {
	I.update("reconciliations", Gh), Wh.forEach((e) => I.notify(e));
}
function qh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Jh(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function Yh() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Xh(e) {
	return `BREC-${e.slice(0, 4)}-${String(Gh.length + 1).padStart(4, "0")}`;
}
function Zh(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of Gh) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var Qh = {
	subscribe(e) {
		return Wh.add(e), () => {
			Wh.delete(e);
		};
	},
	getSnapshot() {
		return Gh;
	},
	getAll() {
		return Gh;
	},
	getByBankAccount(e) {
		return Gh.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return Zh(e);
	},
	complete(e) {
		if (Jh(e.statementDate), p(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let t = jd.requireById(e.bankAccountId);
		if (!t.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < t.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let n = this.getLatestByBankAccount(t.id);
		if (n && e.statementDate <= n.statementDate) throw Error(`Statement date must be after the last reconciled date ${n.statementDate}.`);
		let r = Vh(t, z.getAll(), e.statementDate), i = new Set(r.transactions.map((e) => e.id)), a = Zh(t.id), o = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !a.has(e));
		for (let e of o) if (!i.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let s = /* @__PURE__ */ new Set([...a, ...o]), c = Uh(r, qh(e.statementBalance), Array.from(s));
		if (!c.reconciled) throw Error(`Bank reconciliation is out by ${c.difference.toFixed(2)}.`);
		let l = {
			id: Yh(),
			reconciliationNumber: Xh(e.statementDate),
			bankAccountId: t.id,
			statementDate: e.statementDate,
			statementBalance: qh(e.statementBalance),
			bookBalance: c.bookBalance,
			outstandingDeposits: c.outstandingDeposits,
			outstandingPayments: c.outstandingPayments,
			adjustedStatementBalance: c.adjustedStatementBalance,
			difference: c.difference,
			clearedTransactionIds: o,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Gh = [l, ...Gh], Kh(), l;
	}
}, $h = Qh.complete;
Qh.complete = function(e) {
	return F(), I.transaction(() => $h.call(Qh, e));
}, o("bankReconciliations", {
	repository: Qh,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: Gh }),
	restore: (e) => {
		Gh = e.reconciliations;
	},
	publish: () => Wh.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/settlementRepository.ts
var eg = (e) => Math.round((e + 2 ** -52) * 100) / 100, tg = E().trim().min(1).max(200), ng = O().finite().positive().refine((e) => eg(e) === e, "Use cents precision"), rg = A({
	operationId: tg,
	customerId: tg,
	paymentDate: tg,
	bankAccountId: tg,
	reference: E().max(500).optional(),
	allocations: k(A({
		invoiceId: tg,
		amount: ng
	}).strict()).min(1).max(500)
}).strict(), ig = A({
	operationId: tg,
	creditId: tg,
	paymentDate: tg,
	bankAccountId: tg,
	amount: ng,
	reference: E().max(500).optional()
}).strict(), ag = [], og = [], sg = [], cg = 0, lg = /* @__PURE__ */ new Set(), ug = () => {
	cg++, lg.forEach((e) => e());
};
function dg(e, t, n) {
	let r = JSON.stringify(n), i = e.find((e) => e.operationId === t);
	if (i && i.fingerprint !== r) throw Error("Operation ID was already used with different data.");
	return {
		old: i,
		fingerprint: r
	};
}
function fg(e, t) {
	p(t, "Payment date");
	let n = jd.requireById(e);
	if (!n.active || t < n.openingBalanceDate) throw Error("Bank is inactive or payment precedes its opening date.");
	let r = R.requireById(n.glAccountId);
	if (!r.active || r.type !== "ASSET") throw Error("Invalid bank ledger account.");
	return n;
}
function pg(e) {
	if (Qh.getAll().some((t) => t.clearedTransactionIds.some((t) => t.startsWith(e + ":")))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function mg(e, t) {
	let n = e === "customer" ? B.getById(t) : X.getById(t);
	if (!n || n.status === "VOID" || n.status === "DRAFT") throw Error("An issued credit is required.");
	return n;
}
function hg(e, t, n) {
	let r = mg(e, t), i = eg(n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0)), a = eg(r.totals.total - r.amountApplied - i);
	if (a < 0) throw Error("Refund exceeds the unused credit.");
	let o = {
		...r,
		refundEvents: n,
		amountRefunded: i,
		amountAvailable: a,
		status: a === 0 ? "FULLY_APPLIED" : "ISSUED",
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	e === "customer" ? B.update(o) : X.update(o);
}
function gg(e, t) {
	F();
	let n = ig.parse(t), { old: r, fingerprint: i } = dg(e === "customer" ? og : sg, n.operationId, n);
	if (r) return r;
	let a = mg(e, n.creditId), o = fg(n.bankAccountId, n.paymentDate);
	if (n.paymentDate < a.creditDate || n.amount > a.amountAvailable) throw Error("Refund date/amount exceeds the available credit.");
	let s = R.requireBySystemRole(e === "customer" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"), c = crypto.randomUUID(), l = z.post({
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
	return hg(e, a.id, [...a.refundEvents ?? [], {
		id: u.id,
		date: u.paymentDate,
		amount: u.amount
	}]), e === "customer" ? og = [...og, u] : sg = [...sg, u], ug(), u;
}
function _g(e, t) {
	if (F(), p(t.reversalDate, "Reversal date"), !t.reason?.trim() || t.reason.trim().length < 3) throw Error("Enter a reversal reason.");
	let n = e === "customer" ? og : sg, r = n.find((e) => e.id === t.id);
	if (!r) throw Error("Refund was not found.");
	if (r.status === "REVERSED") return r;
	if (t.reversalDate < r.paymentDate) throw Error("Reversal cannot precede the refund.");
	pg(r.journalEntryId), z.reverse({
		journalEntryId: r.journalEntryId,
		reversalDate: t.reversalDate,
		reason: t.reason
	});
	let i = mg(e, r.creditId);
	hg(e, i.id, (i.refundEvents ?? []).map((e) => e.id === r.id ? {
		...e,
		reversalDate: t.reversalDate
	} : e));
	let a = {
		...r,
		status: "REVERSED",
		reversalDate: t.reversalDate
	};
	return e === "customer" ? og = n.map((e) => e.id === r.id ? a : e) : sg = n.map((e) => e.id === r.id ? a : e), ug(), a;
}
var vg = {
	recordReceipt(e) {
		let t = rg.parse(e), { old: n, fingerprint: r } = dg(ag, t.operationId, t);
		if (n) return n;
		if (fg(t.bankAccountId, t.paymentDate), new Set(t.allocations.map((e) => e.invoiceId)).size !== t.allocations.length) throw Error("Each invoice may only be allocated once.");
		for (let e of t.allocations) {
			let n = W.getAll().find((t) => t.id === e.invoiceId && t.type === "INVOICE");
			if (!n || n.type !== "INVOICE" || n.customerId !== t.customerId || t.paymentDate < n.documentDate || ["VOID", "DRAFT"].includes(n.status) || e.amount > n.amountDue) throw Error("Invalid invoice customer, date or outstanding amount.");
		}
		let i = t.allocations.map((e, n) => W.recordInvoicePayment({
			...t,
			invoiceId: e.invoiceId,
			amount: e.amount,
			method: "BANK_TRANSFER",
			operationId: t.operationId + ":" + n
		})), a = {
			...t,
			id: crypto.randomUUID(),
			fingerprint: r,
			amount: eg(i.reduce((e, t) => e + t.amount, 0)),
			paymentIds: i.map((e) => e.id),
			status: "POSTED"
		};
		return ag = [...ag, a], ug(), a;
	},
	reverseReceipt(e) {
		let t = ag.find((t) => t.id === e.id);
		if (!t) throw Error("Receipt not found.");
		if (t.status === "REVERSED") return t;
		for (let e of t.paymentIds) {
			let t = Ld.getById(e);
			if (!t || t.status !== "RECEIVED") throw Error("Receipt allocations changed; inspect individual payments first.");
			for (let t of z.getBySource("CUSTOMER_PAYMENT", e)) pg(t.id);
		}
		for (let n of t.paymentIds) W.reverseInvoicePayment(n, e.reason);
		let n = {
			...t,
			status: "REVERSED",
			reversalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		};
		return ag = ag.map((e) => e.id === t.id ? n : e), ug(), n;
	},
	createRefund: (e) => gg("customer", e),
	reverseRefund: (e) => _g("customer", e)
}, yg = {
	create: (e) => gg("supplier", e),
	reverse: (e) => _g("supplier", e),
	repairLegacyCredits(e) {
		if (F(), p(e.date, "Repair date"), e.reason?.trim().length < 3) throw Error("Enter a repair reason.");
		let t = [];
		for (let n of X.getAll().filter((e) => e.status !== "VOID")) {
			if (e.date < n.creditDate || z.getBySource("SUPPLIER_CREDIT_RECLASS", n.id).length) continue;
			let r = z.getBySource("SUPPLIER_CREDIT", n.id).find((e) => e.status === "POSTED");
			if (!r) continue;
			let i = R.requireBySystemRole("INVENTORY"), a = R.requireBySystemRole("PURCHASE_PRICE_VARIANCE"), o = eg(r.lines.filter((e) => e.accountId === i.id).reduce((e, t) => e + t.credit - t.debit, 0));
			o <= 0 || t.push(z.post({
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
}, bg = A({
	id: tg,
	operationId: tg,
	fingerprint: tg,
	creditId: tg,
	contactId: tg,
	paymentDate: tg,
	bankAccountId: tg,
	amount: ng,
	journalEntryId: tg,
	status: j(["POSTED", "REVERSED"]),
	reference: E().optional(),
	reversalDate: E().optional()
}).strict();
o("customerSettlements", {
	repository: vg,
	read: "sales.read",
	commands: {
		recordReceipt: "sales.payment",
		reverseReceipt: "sales.payment",
		createRefund: "sales.payment",
		reverseRefund: "sales.payment"
	},
	snapshot: () => ({
		receipts: ag,
		refunds: og
	}),
	restore: (e) => {
		ag = e.receipts, og = e.refunds;
	},
	validate: (e, t) => {
		xg(e, t, !1);
		let n = e;
		k(bg.extend({ fingerprint: E() })).parse(n.refunds), k(A({
			id: tg,
			operationId: tg,
			paymentIds: k(tg),
			amount: ng,
			status: j(["POSTED", "REVERSED"])
		}).passthrough()).parse(n.receipts);
	},
	publish: ug
}), o("supplierRefunds", {
	repository: yg,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		repairLegacyCredits: "accounting.recover"
	},
	snapshot: () => ({ refunds: sg }),
	restore: (e) => {
		sg = e.refunds;
	},
	validate: (e, t) => {
		xg(e, t, !0), k(bg.extend({ fingerprint: E() })).parse(e.refunds);
	},
	publish: ug
});
function xg(e, t, n) {
	let r = e, i = t.journals.journalEntries, a = n ? t.supplierCredits.supplierCredits : t.customerCredits.creditNotes, o = t.bankAccounts.bankAccounts;
	for (let e of r.refunds) {
		let t = a.find((t) => t.id === e.creditId), r = i.find((t) => t.id === e.journalEntryId), s = t?.refundEvents?.find((t) => t.id === e.id);
		if (!t || e.contactId !== ("customerId" in t ? t.customerId : t.supplierId) || !s || s.amount !== e.amount || s.date !== e.paymentDate || s.reversalDate !== e.reversalDate || !o.some((t) => t.id === e.bankAccountId) || !r || r.sourceId !== e.id || r.sourceType !== (n ? "SUPPLIER_REFUND" : "CUSTOMER_REFUND") || r.totalDebit !== e.amount || r.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) throw Error("Refund snapshot relationships are invalid.");
	}
	for (let e of a) {
		let t = eg(r.refunds.filter((t) => t.creditId === e.id && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
		if ((e.amountRefunded ?? 0) !== t) throw Error("Credit refunded balance is invalid.");
	}
	for (let e of a) for (let t of e.refundEvents ?? []) if (!r.refunds.some((n) => n.id === t.id && n.creditId === e.id)) throw Error("Credit refund history has no settlement record.");
	if (!n) {
		let e = t.customerPayments.payments;
		for (let t of r.receipts ?? []) {
			let n = t.paymentIds.map((t) => e.find((e) => e.id === t));
			if (new Set(t.paymentIds).size !== t.paymentIds.length || !n.length || n.some((e) => !e || e.customerId !== t.customerId || e.bankAccountId !== t.bankAccountId || e.status !== (t.status === "REVERSED" ? "REVERSED" : "RECEIVED")) || eg(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== t.amount) throw Error("Receipt allocation snapshot relationships are invalid.");
		}
	}
}
//#endregion
//#region src/features/sales/data/invoiceBalanceAsAtService.ts
function Sg(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= Tg(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: Eg(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => Cg(e, r)), a = Eg(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && wg(t, r)), s = Eg(o.reduce((e, t) => e + t.amount, 0)), c = Eg(e.totals.total), l = Eg(Math.max(0, c - a - s));
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
function Cg(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Tg(e.reversedAt) : !1;
}
function wg(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Tg(e.reversedAt) : !1;
}
function Tg(e) {
	return u(e);
}
function Eg(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function Dg(e, t, n) {
	let r = Ag(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= kg(e.voidedAt)) return Og(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && wg(t, n)), a = Ag(i.reduce((e, t) => e + t.amount, 0)), o = Ag(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - a));
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
function Og(e, t, n) {
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
function kg(e) {
	return u(e);
}
function Ag(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function jg(e, t, n = [], r = [], i = [], a = Pg()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = Sg(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = Mg(e.dueDate, a);
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
		current: Fg(s.current),
		days1To30: Fg(s.days1To30),
		days31To60: Fg(s.days31To60),
		days61To90: Fg(s.days61To90),
		days90Plus: Fg(s.days90Plus)
	}, p = Fg(c), m = Fg(l), h = Fg(i.reduce((t, n) => n.customerId === e.id ? t + Dg(n, r, a).amountAvailable : t, 0)), ee = Fg(p - h);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: h,
		netAccountBalance: ee,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: Fg(Math.max(0, e.creditLimit - Math.max(0, ee))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function Mg(e, t = Pg()) {
	let n = Ng(e), r = Ng(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Ng(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function Pg() {
	return u((/* @__PURE__ */ new Date()).toISOString());
}
function Fg(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function Ig(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Lg(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function Rg(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? Ig(t - n) : Ig(n - t);
}
function zg(e, t, n) {
	Lg(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = Ig(t + r.debit), n = Ig(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: Rg(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = Ig(r.reduce((e, t) => e + t.totalDebit, 0)), o = Ig(r.reduce((e, t) => e + t.totalCredit, 0));
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
function Bg(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Vg({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = jg(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: Bg(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = Bg(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = Bg(zg(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = Bg(l - d);
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
function Hg(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && Ug(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = Wg(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && Ug(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = Wg(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && Ug(n.reversedAt) <= r ? t : t + n.amount, 0)), o = Wg(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: Wg(Math.max(0, o - i - a))
	};
}
function Ug(e) {
	return u(e);
}
function Wg(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function Gg(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && Kg(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = qg(e.totals.total), i = qg(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && Kg(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: qg(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - i))
	};
}
function Kg(e) {
	return u(e);
}
function qg(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function Jg(e, t, n = [], r = [], i = [], a = t_()) {
	let o = Zg(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = Hg(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = Xg(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = e_(r.reduce((t, n) => n.supplierId === e.id ? t + Gg(n, i, a).amountAvailable : t, 0)), p = e_(s), m = e_(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: e_(c),
		aging: Qg(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function Yg(e, t, n = [], r = [], i = [], a = t_()) {
	let o = Zg(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let h of e) {
		let e = Jg(h, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: e_(s),
		unallocatedCredit: e_(c),
		totalOutstanding: e_(l),
		overdueAmount: e_(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: Qg(o)
	};
}
function Xg(e, t = t_()) {
	let n = $g(e), r = $g(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Zg() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function Qg(e) {
	return {
		current: e_(e.current),
		days1To30: e_(e.days1To30),
		days31To60: e_(e.days31To60),
		days61To90: e_(e.days61To90),
		days90Plus: e_(e.days90Plus)
	};
}
function $g(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function e_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function t_() {
	return u((/* @__PURE__ */ new Date()).toISOString());
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function n_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function r_({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = Yg(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = n_(zg(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = n_(c.totalOutstanding), f = n_(d - u);
	return {
		asOfDate: s,
		grossOutstanding: n_(c.grossOutstanding),
		unallocatedCredit: n_(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function i_(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function a_(e) {
	return e.slice(0, 10);
}
function o_(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function s_(e, t) {
	i_(t);
	let n = e.filter((e) => a_(e.occurredAt) <= t).slice().sort(o_), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = G(n.quantityOnHand + e.quantityBase), a = up(n.inventoryValue + e.valueChange);
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
		let t = Lf.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = jc(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : lp(e.inventoryValue / e.quantityOnHand);
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
		totalQuantity: G(i.reduce((e, t) => e + t.quantityOnHand, 0)),
		totalInventoryValue: up(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function c_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function l_(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function u_({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	l_(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = s_(n, r), o = c_(zg(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = c_(a.totalInventoryValue), c = c_(s - o);
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
var d_ = (e) => Math.round((e + 2 ** -52) * 100) / 100, Z = E().trim().min(1).max(200), f_ = O().finite().refine((e) => d_(e) === e, "Amounts must use cents precision"), p_ = A({
	accountId: Z,
	debit: f_.nonnegative(),
	credit: f_.nonnegative()
}).strict(), m_ = A({
	contactId: Z,
	reference: Z,
	date: Z,
	dueDate: Z,
	amount: f_
}).strict(), h_ = A({
	operationId: Z,
	date: Z,
	reason: E().trim().min(3).max(1e3),
	gl: k(p_).min(2).max(5e3),
	ar: k(m_).max(1e4),
	ap: k(m_).max(1e4),
	banks: k(A({
		bankAccountId: Z,
		amount: f_
	}).strict()).max(500),
	stock: k(A({
		siteId: Z,
		productId: Z,
		quantity: O().positive().finite(),
		unitCost: O().nonnegative().finite()
	}).strict()).max(1e4)
}).strict(), g_ = [], __ = 0, v_ = /* @__PURE__ */ new Set(), y_ = () => {
	__++, v_.forEach((e) => e());
};
function b_() {
	return te();
}
function x_(e) {
	t(e), Vl(e.sales), Wu(e.customerCredits), I.update("supplierBills", e.supplierBills.supplierBills), I.update("supplierCredits", e.supplierCredits.supplierCredits);
}
function S_(e, t) {
	if (new Set(e).size !== e.length) throw Error("Duplicate " + t + ".");
}
function C_(e) {
	let t = h_.parse(e);
	if (p(t.date, "Cutover date"), Zl(t.date), F(), g_.some((e) => e.status === "POSTED")) throw Error("An opening batch is already active. Reverse the unused batch before replacing it.");
	let n = b_();
	if (n.journals.journalEntries.some((e) => e.journalDate >= t.date)) throw Error("Cutover must be after all existing ledger activity. This import adds historical balances, never replaces existing transactions.");
	if (n.inventoryMovements.movements.some((e) => e.occurredAt.slice(0, 10) >= t.date)) throw Error("Cutover must be after existing inventory activity.");
	S_(t.gl.map((e) => e.accountId), "GL account"), S_(t.banks.map((e) => e.bankAccountId), "bank"), S_(t.stock.map((e) => e.siteId + ":" + e.productId), "site/product");
	let r = Vg({
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
	}), i = r_({
		suppliers: n.suppliers.suppliers,
		bills: n.supplierBills.supplierBills,
		payments: n.supplierPayments.supplierPayments,
		credits: n.supplierCredits.supplierCredits,
		creditAllocations: n.supplierCredits.allocations,
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: t.date
	}), a = u_({
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
	let o = R.getAll(), s = (e) => R.requireBySystemRole(e).id, c = (e) => d_(t.gl.filter((t) => t.accountId === e).reduce((e, t) => e + t.debit - t.credit, 0));
	for (let e of t.gl) {
		let t = R.requireById(e.accountId);
		if (!t.active || ![
			"ASSET",
			"LIABILITY",
			"EQUITY"
		].includes(t.type) || e.debit > 0 && e.credit > 0 || e.debit + e.credit <= 0) throw Error("Opening GL requires active balance-sheet accounts and one positive debit or credit per row.");
	}
	let l = d_(t.gl.reduce((e, t) => e + t.debit, 0)), u = d_(t.gl.reduce((e, t) => e + t.credit, 0));
	if (l !== u || !l) throw Error("Opening trial balance does not balance.");
	let d = d_(t.ar.reduce((e, t) => e + t.amount, 0)), f = d_(t.ap.reduce((e, t) => e + t.amount, 0));
	if (c(s("ACCOUNTS_RECEIVABLE")) !== d || c(s("ACCOUNTS_PAYABLE")) !== -f) throw Error("AR/AP detail must equal imported GL control balances. Negative detail creates an unused historical credit.");
	for (let [e, r] of [["ar", t.ar], ["ap", t.ap]]) {
		S_(r.map((e) => e.contactId + ":" + e.reference.toLowerCase()), e + " reference");
		for (let i of r) {
			if (p(i.date), p(i.dueDate), !i.amount || i.date > t.date || i.dueDate < i.date) throw Error("Invalid outstanding document amount/date.");
			if (!(e === "ar" ? n.customers.customers : n.suppliers.suppliers).some((e) => e.id === i.contactId)) throw Error("Opening contact not found.");
			if ((e === "ar" ? [...n.sales.invoices.map((e) => [e.customerId, e.documentNumber]), ...n.customerCredits.creditNotes.map((e) => [e.customerId, e.creditNoteNumber])] : [...n.supplierBills.supplierBills.map((e) => [e.supplierId, e.supplierInvoiceNumber]), ...n.supplierCredits.supplierCredits.map((e) => [e.supplierId, e.supplierCreditNumber])]).some(([e, t]) => e === i.contactId && t.toLowerCase() === i.reference.toLowerCase())) throw Error("Historical document reference already exists.");
		}
	}
	let m = 0;
	for (let e of t.stock) {
		let t = jc(e.productId), n = Lf.getById(e.siteId);
		if (!t || t.status !== "ACTIVE" || t.itemType === "SERVICE" || n?.status !== "ACTIVE") throw Error("Opening stock requires active stocked products/sites.");
		if (Math.round(e.quantity * 1e4) / 1e4 !== e.quantity) throw Error("Stock quantities use at most four decimal places.");
		m = d_(m + d_(e.quantity * e.unitCost));
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
			let { input: t, debit: n, credit: r, ar: i, ap: a, inventory: o } = C_(e);
			return {
				date: t.date,
				debit: n,
				credit: r,
				ar: i,
				ap: a,
				inventory: o,
				bank: d_(t.banks.reduce((e, t) => e + t.amount, 0)),
				documents: t.ar.length + t.ap.length
			};
		},
		post(e) {
			let t = h_.parse(e), n = JSON.stringify(t), r = g_.find((e) => e.operationId === t.operationId);
			if (n.length > 5e7) throw Error("Opening import exceeds 50 MB.");
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID already used for different opening data.");
				return r;
			}
			let { input: i, s: a } = C_(t), o = crypto.randomUUID(), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
				id: o,
				operationId: i.operationId,
				fingerprint: n,
				date: i.date,
				reason: i.reason,
				status: "POSTED",
				actor: kc.current()?.userId ?? "",
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
			}, l = (e) => R.requireBySystemRole(e).id, u = l("OWNERS_EQUITY"), d = 0, f = 0;
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
				let ee = e === "ar" == t.amount > 0, te = z.post({
					journalDate: i.date,
					description: "Opening outstanding " + t.reference,
					reference: t.reference,
					sourceType: h,
					sourceId: n,
					lines: [{
						accountId: l(e === "ar" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"),
						debit: ee ? r : 0,
						credit: ee ? 0 : r
					}, {
						accountId: u,
						debit: ee ? 0 : r,
						credit: ee ? r : 0
					}]
				});
				c.journalIds.push(te.id), ee ? d += r : f += r;
			}
			a.journals = b_().journals, x_(a);
			let p = i.gl.filter((e) => ![l("ACCOUNTS_RECEIVABLE"), l("ACCOUNTS_PAYABLE")].includes(e.accountId));
			(d || f) && p.push({
				accountId: u,
				debit: d_(d),
				credit: d_(f)
			});
			let m = /* @__PURE__ */ new Map();
			for (let e of p) m.set(e.accountId, d_((m.get(e.accountId) ?? 0) + e.debit - e.credit));
			let h = [...m].filter(([, e]) => e !== 0).map(([e, t]) => ({
				accountId: e,
				debit: Math.max(0, t),
				credit: Math.max(0, -t)
			}));
			if (h.length) {
				let e = z.post({
					journalDate: i.date,
					description: "Opening trial balance " + i.reason,
					sourceType: "OPENING_BALANCE",
					sourceId: o,
					lines: h
				});
				c.journalIds.push(e.id);
			}
			for (let e of i.stock) {
				let t = jc(e.productId), n = t.units.find((e) => e.id === t.baseUnitId), r = Hf.create({
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
				qf.receive({
					siteId: e.siteId,
					productId: t.id,
					baseUnitId: t.baseUnitId,
					quantityBase: e.quantity
				});
				let a = xp({
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
			return g_ = [...g_, c], y_(), c;
		},
		reverse(e) {
			if (p(e.date), Zl(e.date), F(), !e.reason?.trim() || e.reason.trim().length < 3) throw Error("Reversal reason is required.");
			let t = g_.find((t) => t.id === e.id);
			if (!t) throw Error("Opening batch not found.");
			if (t.status === "REVERSED") return t;
			if (e.date < t.date) throw Error("Reversal date precedes cutover.");
			let n = b_();
			if (n.journals.journalEntries.some((e) => !t.priorJournalIds.includes(e.id) && !t.journalIds.includes(e.id)) || n.inventoryMovements.movements.some((e) => !t.priorMovementIds.includes(e.id) && !t.movementIds.includes(e.id))) throw Error("Subsequent accounting or inventory activity exists. Reverse downstream activity before correcting opening balances.");
			let r = n.sales.invoices.filter((e) => t.invoiceIds.includes(e.id)), i = n.supplierBills.supplierBills.filter((e) => t.billIds.includes(e.id)), a = [...n.customerCredits.creditNotes.filter((e) => t.customerCreditIds.includes(e.id)), ...n.supplierCredits.supplierCredits.filter((e) => t.supplierCreditIds.includes(e.id))];
			if (r.some((e) => e.amountPaid !== 0 || e.amountDue !== e.totals.total) || i.some((e) => e.totals.amountPaid !== 0 || e.totals.amountCredited !== 0) || a.some((e) => e.amountApplied !== 0 || (e.amountRefunded ?? 0) !== 0)) throw Error("Opening balances have allocations or settlements. Reverse downstream allocations before correcting them.");
			for (let e of ["customerSettlements", "supplierRefunds"]) if (JSON.stringify(n[e]).includes(t.id)) throw Error("Opening balances have downstream settlements.");
			for (let e of t.journalIds) pg(e);
			for (let n of t.journalIds) z.reverse({
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
			return n.stock.balances = t.priorStock, n.costBalances.balances = t.priorCost, n.journals = b_().journals, x_(n), g_ = g_.map((n) => n.id === t.id ? {
				...n,
				status: "REVERSED",
				reversalDate: e.date,
				reversalReason: e.reason
			} : n), y_(), g_.find((e) => e.id === t.id);
		}
	},
	read: "accounting.read",
	commands: {
		preview: "accounting.post",
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ batches: g_ }),
	restore: (e) => {
		g_ = e.batches;
	},
	publish: y_,
	validate: (e, t) => {
		let n = A({ batches: k(A({
			id: Z,
			operationId: Z,
			date: Z,
			status: j(["POSTED", "REVERSED"]),
			journalIds: k(Z),
			invoiceIds: k(Z),
			billIds: k(Z),
			customerCreditIds: k(Z),
			supplierCreditIds: k(Z),
			fingerprint: E().min(1).max(5e7),
			reason: E().min(3),
			actor: Z,
			createdAt: Z,
			movementIds: k(Z),
			costMovementIds: k(Z),
			priorJournalIds: k(Z),
			priorMovementIds: k(Z),
			priorStock: k(A({
				siteId: Z,
				productId: Z,
				baseUnitId: Z,
				quantityOnHand: O().finite().nonnegative(),
				updatedAt: Z
			}).strict()),
			priorCost: k(A({
				siteId: Z,
				productId: Z,
				baseUnitId: Z,
				quantityOnHand: O().finite().nonnegative(),
				averageCostPerBaseUnit: O().finite().nonnegative(),
				inventoryValue: O().finite().nonnegative(),
				costingMethod: ic("MOVING_WEIGHTED_AVERAGE"),
				updatedAt: Z
			}).strict()),
			reversalDate: Z.optional(),
			reversalReason: E().optional()
		}).strict()) }).strict().parse(e);
		for (let e of n.batches) {
			let n = h_.parse(JSON.parse(e.fingerprint));
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
var w_ = /* @__PURE__ */ new Set(), T_ = I.read().supplierPayments;
I.onRollback(() => {
	T_ = I.read().supplierPayments;
});
function E_() {
	I.update("supplierPayments", T_), w_.forEach((e) => I.notify(e));
}
var D_ = {
	subscribe(e) {
		return w_.add(e), () => {
			w_.delete(e);
		};
	},
	getSnapshot() {
		return T_;
	},
	getAll() {
		return T_;
	},
	getById(e) {
		return T_.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return T_.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return T_.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: k_(e.reference),
			notes: k_(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: A_(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = T_.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (p(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = im.getById(e.supplierId);
		if (!r) throw Error("Supplier was not found.");
		if (!e.paymentDate) throw Error("Payment date is required.");
		if (!e.method) throw Error("Payment method is required.");
		if (!e.bankAccountId) throw Error("Bank account is required.");
		let i = jd.getById(e.bankAccountId);
		if (!i) throw Error("Bank account was not found.");
		if (!i.active) throw Error("The selected bank account is inactive.");
		let a = e.allocations.filter((e) => Number.isFinite(e.amount) && e.amount > 0);
		if (a.length === 0) throw Error("Allocate the payment to at least one supplier bill.");
		let o = /* @__PURE__ */ new Set(), s = a.map((t) => {
			if (o.has(t.supplierBillId)) throw Error("A supplier bill cannot appear more than once in the same payment.");
			o.add(t.supplierBillId);
			let n = Qm.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = A_(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${j_(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), c = A_(s.reduce((e, t) => e + t.amount, 0));
		if (c <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of s) Qm.applyPayment(e.supplierBillId, e.amount);
		let l = (/* @__PURE__ */ new Date()).toISOString(), u = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: O_(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: c,
			method: e.method,
			bankAccountId: i.id,
			reference: k_(e.reference),
			notes: k_(e.notes),
			allocations: s,
			status: "POSTED",
			createdAt: l,
			updatedAt: l
		};
		return T_ = [u, ...T_], E_(), Tm.postSupplierPayment(u), u;
	},
	reverse(e, t) {
		ol("SUPPLIER_PAYMENT", e);
		let n = T_.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = Qm.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) Qm.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return T_ = T_.map((t) => t.id === e ? a : t), E_(), Tm.reverseSupplierPayment(a), a;
	}
};
function O_(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = T_.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function k_(e) {
	return e?.trim() || void 0;
}
function A_(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function j_(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: n().currency
	}).format(e);
}
var M_ = D_.create;
D_.create = function(...e) {
	return F(), I.transaction(() => M_.apply(D_, e));
};
var N_ = D_.reverse;
D_.reverse = function(...e) {
	return F(), I.transaction(() => N_.apply(D_, e));
}, o("supplierPayments", {
	repository: D_,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: T_ }),
	restore: (e) => {
		T_ = e.supplierPayments;
	},
	publish: () => w_.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/paymentBatchRepository.ts
var P_ = (e) => Math.round((e + 2 ** -52) * 100) / 100, F_ = E().trim().min(1).max(200), I_ = A({
	operationId: F_,
	paymentDate: F_,
	bankAccountId: F_,
	reference: E().max(500),
	allocations: k(A({
		supplierBillId: F_,
		amount: O().finite().positive().refine((e) => P_(e) === e)
	}).strict()).min(1).max(500)
}).strict(), L_ = [], R_ = 0, z_ = /* @__PURE__ */ new Set(), B_ = () => {
	R_++, z_.forEach((e) => e());
}, V_ = () => {
	let e = kc.current();
	if (!e) throw Error("A verified session is required.");
	return e.userId;
};
function H_(e, t) {
	return {
		action: e,
		reason: t,
		actor: V_(),
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function U_(e) {
	let t = L_.find((t) => t.id === e);
	if (!t) throw Error("Payment batch was not found.");
	return t;
}
function W_(e) {
	return L_ = L_.map((t) => t.id === e.id ? e : t), B_(), e;
}
function G_(e) {
	p(e.paymentDate, "Payment date");
	let t = jd.requireById(e.bankAccountId);
	if (!t.active || e.paymentDate < t.openingBalanceDate) throw Error("Invalid paying bank account/date.");
	if (new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length) throw Error("Select each bill only once.");
	for (let t of e.allocations) {
		let n = Qm.getById(t.supplierBillId);
		if (!n || n.status === "VOID" || t.amount > n.totals.amountDue || e.paymentDate < n.billDate) throw Error("A bill amount, date or outstanding balance changed. Review the batch.");
	}
}
o("paymentBatches", {
	repository: {
		create(e) {
			let t = I_.parse(e), n = JSON.stringify(t), r = L_.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID was used with different batch data.");
				return r;
			}
			G_(t);
			let i = {
				...t,
				id: crypto.randomUUID(),
				fingerprint: n,
				status: "DRAFT",
				createdBy: V_(),
				paymentIds: [],
				history: [H_("Created")]
			};
			return L_ = [...L_, i], B_(), i;
		},
		approve(e) {
			let t = U_(e);
			if (t.status === "APPROVED") return t;
			if (t.status !== "DRAFT") throw Error("Only a draft batch can be approved.");
			return G_(t), W_({
				...t,
				status: "APPROVED",
				approvedBy: V_(),
				history: [...t.history, H_("Approved")]
			});
		},
		post(e) {
			let t = U_(e);
			if (t.status === "POSTED") return t;
			if (t.status !== "APPROVED") throw Error("Approve the batch before recording payments.");
			F(), G_(t);
			let n = /* @__PURE__ */ new Map();
			for (let e of t.allocations) {
				let t = Qm.getById(e.supplierBillId);
				n.set(t.supplierId, [...n.get(t.supplierId) ?? [], e]);
			}
			let r = [...n].map(([e, n]) => D_.create({
				operationId: "batch:" + t.id + ":" + e,
				supplierId: e,
				paymentDate: t.paymentDate,
				bankAccountId: t.bankAccountId,
				reference: t.reference,
				method: "BANK_TRANSFER",
				allocations: n
			}));
			return W_({
				...t,
				status: "POSTED",
				paymentIds: r.map((e) => e.id),
				history: [...t.history, H_("Payments recorded")]
			});
		},
		cancel(e) {
			let t = U_(e.id);
			if (!["DRAFT", "APPROVED"].includes(t.status) || e.reason?.trim().length < 3) throw Error("Only an unposted batch can be cancelled, with a reason.");
			return W_({
				...t,
				status: "CANCELLED",
				history: [...t.history, H_("Cancelled", e.reason)]
			});
		},
		reverse(e) {
			let t = U_(e.id);
			if (t.status === "REVERSED") return t;
			if (t.status !== "POSTED" || e.reason?.trim().length < 3) throw Error("A posted batch and reversal reason are required.");
			F();
			for (let e of t.paymentIds) {
				let t = D_.getById(e);
				if (!t || t.status !== "POSTED") throw Error("Batch payments changed. Inspect before reversing.");
				ol("SUPPLIER_PAYMENT", e);
			}
			for (let n of t.paymentIds) D_.reverse(n, e.reason);
			return W_({
				...t,
				status: "REVERSED",
				history: [...t.history, H_("Reversed", e.reason)]
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
	snapshot: () => ({ batches: L_ }),
	restore: (e) => {
		L_ = e.batches;
	},
	validate: (e, t) => {
		let n = A({ batches: k(I_.extend({
			id: F_,
			fingerprint: E(),
			status: j([
				"DRAFT",
				"APPROVED",
				"POSTED",
				"REVERSED",
				"CANCELLED"
			]),
			createdBy: F_,
			approvedBy: F_.optional(),
			paymentIds: k(F_),
			history: k(A({
				action: F_,
				actor: F_,
				at: F_,
				reason: E().optional()
			}))
		})) }).strict().parse(e), r = t.supplierPayments.supplierPayments;
		for (let e of n.batches) {
			if (!["POSTED", "REVERSED"].includes(e.status)) continue;
			let n = e.paymentIds.map((e) => r.find((t) => t.id === e));
			if (!n.length || n.some((t) => !t || t.bankAccountId !== e.bankAccountId || t.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) || P_(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== P_(e.allocations.reduce((e, t) => e + t.amount, 0))) throw Error("Batch payment relationships are invalid.");
			if (e.paymentIds.some((e) => !t.journals.journalEntries.some((t) => t.sourceType === "SUPPLIER_PAYMENT" && t.sourceId === e))) throw Error("A batch payment journal is missing.");
		}
	},
	publish: B_
});
//#endregion
//#region src/features/page-previews/catalog.ts
var Q = (e, t, n = "text", r, i) => ({
	key: e,
	label: t,
	type: n,
	options: r,
	value: i,
	required: !0
}), $ = (e, t, n) => Q(e, t, "select", n), K_ = (e, t, n = "0") => ({
	...Q(e, t, "number", void 0, n),
	min: 0,
	step: "0.01"
}), q_ = (e, t) => Q(e, t, "date", void 0, "2026-10-16"), J_ = (e, t) => ({
	...$(e, t, [
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
}), Y_ = [];
function X_(e, t, n, r, i, a, o, s, c) {
	Y_.push({
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
X_("products", "Products & services", "Inventory & pricing", "/inventory/products", "inventory.read", "Maintain purchasing, selling, stock and packaging information.", [
	Q("sku", "SKU"),
	$("kind", "Product type", [
		"Stock item",
		"Service",
		"Non-stock item"
	]),
	$("unit", "Selling unit", [
		"Pack",
		"m²",
		"Bucket",
		"Each"
	]),
	K_("price", "Standard selling price", "49.50"),
	K_("cost", "Buying cost (sample)", "25"),
	K_("coverage", "m² per pack", "2.2"),
	$("rounding", "Pack rounding", ["Whole packs up", "Allow fractional packs"]),
	K_("reorder", "Reorder point", "10"),
	K_("target", "Target stock", "50"),
	$("buy", "Available for purchasing", ["Yes", "No"]),
	$("sell", "Available for selling", ["Yes", "No"]),
	$("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	Q("brand", "Brand"),
	Q("category", "Category"),
	Q("image", "Image URL (preview only)")
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
]), X_("promotions", "Scheduled promotions", "Inventory & pricing", "/inventory/promotions", "inventory.read", "Plan customer and product specials with explicit start and end times.", [
	Q("product", "Product / SKU"),
	Q("customer", "Customer scope"),
	Q("starts", "Starts (local time)", "datetime-local", void 0, "2026-10-16T09:00"),
	Q("ends", "Ends (local time)", "datetime-local", void 0, "2026-10-31T17:00"),
	K_("price", "Promotional unit price", "45"),
	$("priority", "Priority when rules overlap", [
		"Customer price first",
		"Promotion first",
		"Lowest eligible price"
	]),
	Q("timezone", "Time zone", "text", void 0, "Pacific/Auckland")
], {
	name: "October flooring special",
	product: "SAMPLE-OAK",
	customer: "All trade customers"
}, [
	"Overview",
	"Price comparison",
	"History"
]), X_("tax-codes", "Tax codes", "Accounting", "/accounting/tax-codes", "accounting.read", "Review GST codes, inclusive/exclusive calculation and reporting mappings.", [
	Q("code", "Tax code"),
	K_("rate", "Tax rate (%)", "15"),
	$("basis", "Entry basis", ["Exclusive", "Inclusive"]),
	J_("collected", "GST collected account"),
	J_("paid", "GST paid account"),
	Q("report", "Return / report mapping")
], {
	name: "Standard GST",
	code: "GST15",
	report: "Output / input GST"
}, [
	"Overview",
	"Calculation preview",
	"Reporting"
]), X_("linked-accounts", "Linked accounts", "Accounting", "/accounting/linked-accounts", "accounting.read", "Preview default general ledger mappings used by each business process.", [
	$("process", "Business process", [
		"Sales",
		"Purchases",
		"Payroll"
	]),
	J_("receivable", "Receivables / payables control"),
	J_("income", "Income / expense account"),
	J_("inventory", "Inventory account"),
	J_("cogs", "Cost of goods sold"),
	J_("gst", "GST control account"),
	J_("payroll", "Payroll clearing account")
], {
	name: "Sales posting defaults",
	process: "Sales"
}, ["Overview", "Posting example"]), X_("jobs", "Jobs & projects", "Accounting", "/accounting/jobs", "accounting.read", "Track project budgets, assigned contacts and sample profitability.", [
	Q("code", "Job code"),
	Q("customer", "Customer"),
	Q("owner", "Project owner"),
	q_("starts", "Start date"),
	q_("ends", "End date"),
	K_("budget", "Revenue budget", "10000"),
	K_("costBudget", "Cost budget", "6000")
], {
	name: "Sample showroom installation",
	code: "JOB-SAMPLE",
	customer: "Sample Flooring Ltd",
	owner: "Sample team"
}, [
	"Overview",
	"Transactions",
	"Profitability"
]), X_("bank-accounts", "Bank account setup", "Banking", "/banking/setup/accounts", "banking.read", "Preview bank account details, ledger links and feed preferences.", [
	Q("number", "Account number (sample only)"),
	Q("bank", "Bank name"),
	$("currency", "Currency", ["NZD", "AUD"]),
	J_("ledger", "Linked bank GL account"),
	$("feed", "Feed provider", ["Manual import", "Provider to be configured"]),
	q_("feedStart", "Feed start date")
], {
	name: "Sample operating account",
	number: "00-0000-0000000-00",
	bank: "Sample Bank"
}, [
	"Overview",
	"Feed settings",
	"Import history"
]), X_("bank-rules", "Bank rules", "Banking", "/banking/rules", "banking.read", "Define matching conditions and resulting categorisation before testing a sample.", [
	$("match", "Match mode", ["All conditions", "Any condition"]),
	$("field", "Transaction field", [
		"Description",
		"Payee",
		"Reference"
	]),
	$("operator", "Operator", [
		"Contains",
		"Equals",
		"Starts with"
	]),
	Q("value", "Match text"),
	J_("account", "Categorise to account"),
	$("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	$("enabled", "Enabled", ["Yes", "No"])
], {
	name: "Sample office supplies",
	value: "OFFICE",
	field: "Description"
}, [
	"Overview",
	"Test rule",
	"History"
]), X_("payment-batches", "Electronic payment batches", "Banking", "/banking/payment-batches", "banking.read", "Select sample supplier or wage payments, review approval and bank export layout.", [
	$("kind", "Batch type", ["Supplier payments", "Wages"]),
	q_("payDate", "Payment date"),
	Q("bank", "Paying account"),
	Q("reference", "Bank reference"),
	$("format", "Export format", ["NZ bank CSV preview", "ABA layout preview"]),
	K_("total", "Batch total", "1100")
], {
	name: "Sample supplier batch",
	bank: "Sample operating account",
	reference: "OCT-SAMPLE"
}, [
	"Overview",
	"Payments",
	"Approval & export"
]), X_("pay-items", "Pay items", "Payroll", "/payroll/pay-items", "accounting.read", "Configure sample earnings, allowances, deductions, leave, tax and employer contributions.", [
	Q("code", "Pay item code"),
	$("category", "Category", [
		"Earnings",
		"Allowance",
		"Deduction",
		"Leave",
		"Tax",
		"Employer contribution"
	]),
	$("method", "Calculation method", [
		"Hourly rate",
		"Fixed amount",
		"Percentage"
	]),
	K_("rate", "Rate / amount", "30"),
	$("taxable", "Tax treatment", [
		"Taxable",
		"Non-taxable",
		"Before tax deduction",
		"After tax deduction"
	]),
	J_("expense", "Expense account"),
	J_("liability", "Liability / clearing account")
], {
	name: "Ordinary hours",
	code: "ORD",
	category: "Earnings"
}, [
	"Overview",
	"Employee assignments",
	"Posting preview"
]), X_("filing", "Payroll filing", "Payroll", "/payroll/filing", "accounting.read", "Review a sample NZ Payday Filing submission and its response / correction workflow.", [
	Q("payrun", "Pay run reference"),
	q_("payDate", "Pay date"),
	Q("employer", "Employer IRD identifier (sample)"),
	$("type", "Submission type", ["Employment information", "Amendment"]),
	Q("contact", "Payroll contact email", "email")
], {
	name: "October employment information",
	payrun: "SAMPLE-RUN-01",
	employer: "000-000-000",
	contact: "payroll@example.invalid"
}, [
	"Overview",
	"Employees & validation",
	"Submission & response"
]), X_("recurring", "Recurring transactions", "Automation & tasks", "/automation/recurring", "accounting.read", "Prepare templates, schedules, generated-item previews and failure recovery.", [
	$("kind", "Transaction type", [
		"Invoice",
		"Bill",
		"Bank transaction"
	]),
	Q("contact", "Customer / supplier"),
	$("frequency", "Frequency", [
		"Weekly",
		"Fortnightly",
		"Monthly",
		"Quarterly"
	]),
	q_("next", "Next generation date"),
	q_("ends", "Schedule end date"),
	K_("total", "Template amount", "220"),
	$("mode", "Generation mode", ["Draft for review", "Require approval"])
], {
	name: "Monthly sample maintenance",
	contact: "Sample Flooring Ltd"
}, [
	"Overview",
	"Template lines",
	"Run history"
]), X_("tasks", "Tasks & action centre", "Automation & tasks", "/tasks", "sales.read", "Review due and overdue work, assign owners and retain preview status history.", [
	Q("customer", "Customer / branch"),
	Q("owner", "Assigned to"),
	q_("due", "Due date"),
	$("priority", "Priority", [
		"Normal",
		"High",
		"Low"
	]),
	Q("notes", "Task instructions", "textarea")
], {
	name: "Follow up showroom quote",
	customer: "Sample Flooring / North branch",
	owner: "Sample sales",
	notes: "Confirm quantities and planned installation date."
}, [
	"Overview",
	"Notes & attachments",
	"Status history"
]), X_("visits", "Sales visits & activity", "Automation & tasks", "/sales/activity", "sales.read", "Inspect sales visits, check-in/out times, outcomes and follow-up tasks.", [
	Q("salesperson", "Salesperson"),
	Q("customer", "Customer / branch"),
	Q("checkin", "Check-in", "datetime-local", void 0, "2026-10-16T09:00"),
	Q("checkout", "Check-out", "datetime-local", void 0, "2026-10-16T09:30"),
	Q("outcome", "Visit outcome", "textarea"),
	Q("location", "Recorded location")
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
]), X_("draft-review", "Customer & contact review", "Automation & tasks", "/contacts/review", "contacts.write", "Review incoming customer/contact drafts, field mapping, duplicates and sync exceptions.", [
	$("kind", "Draft type", [
		"Customer",
		"Branch",
		"Contact"
	]),
	Q("company", "Customer / company"),
	Q("branch", "Branch"),
	Q("email", "Email", "email"),
	Q("phone", "Phone"),
	$("source", "Source", [
		"Sales draft",
		"Selected phone contact",
		"Business card OCR"
	]),
	$("decision", "Review decision", [
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
]), X_("templates", "PDF & email templates", "Documents & imports", "/documents/templates", "accounting.read", "Design sample invoice, quote, PO, statement and remittance layouts and email copy.", [
	$("kind", "Document type", [
		"Invoice",
		"Quotation",
		"Purchase order",
		"Customer statement",
		"Remittance"
	]),
	Q("subject", "Email subject"),
	Q("body", "Email body", "textarea"),
	Q("footer", "PDF footer", "textarea"),
	$("logo", "Logo position", [
		"Left",
		"Centre",
		"Right"
	]),
	$("paper", "Paper size", ["A4", "Letter"])
], {
	name: "Standard invoice template",
	subject: "Your document {{number}}",
	body: "Hello {{contact}}, please review the attached {{type}}.",
	footer: "Thank you for your business."
}, [
	"Overview",
	"PDF preview",
	"Email preview"
]), X_("custom-reports", "Saved & favourite reports", "Reports", "/reports/saved", "accounting.read", "Choose datasets, columns and filters, then save a sample report or mark it as a favourite.", [
	$("dataset", "Dataset", [
		"Sales",
		"Purchases",
		"Payroll",
		"Banking",
		"General ledger"
	]),
	Q("columns", "Columns (comma separated)"),
	Q("filter", "Filter expression (preview)"),
	$("basis", "Basis", ["Accrual", "Cash"]),
	$("favourite", "Favourite", ["Yes", "No"])
], {
	name: "Monthly sales by customer",
	columns: "Customer, Date, Net, GST, Total",
	filter: "Date: current month"
}, ["Overview", "Report preview"]), X_("report-packs", "Report packs", "Reports", "/reports/packs", "accounting.read", "Compose financial reports, order sections and preview a cover and table of contents.", [
	Q("company", "Company"),
	Q("period", "Reporting period"),
	Q("reports", "Included reports (comma separated)"),
	Q("cover", "Cover heading"),
	Q("introduction", "Cover note", "textarea")
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
var Z_ = Y_;
[...new Set(Y_.map((e) => e.group))], $("gst", "GST registration", ["Registered", "Not registered"]), $("filing", "GST filing cycle", [
	"Two monthly",
	"Monthly",
	"Six monthly"
]), K_("quoteNext", "Next quote number", "1001"), K_("orderNext", "Next order number", "1001"), K_("invoiceNext", "Next invoice number", "1001"), K_("creditNext", "Next credit number", "1001"), $("terms", "Default terms", [
	"20th of following month",
	"Due on receipt",
	"30 days"
]), $("template", "Default template", ["Standard invoice", "Trade invoice"]), $("reminders", "Overdue reminders", ["Manual only", "7 and 14 days overdue"]), $("onlinePayment", "Online payment option", ["Disabled", "Configuration preview"]), K_("next", "Next PO number", "1001"), $("terms", "Default payment terms", [
	"20th of following month",
	"30 days",
	"Due on receipt"
]), J_("expense", "Default expense account"), $("receipt", "Bill matching", ["Require receipt match", "Allow expense bills"]), $("remittance", "Remittance preference", ["Preview before sending", "Manual"]), $("cycle", "Pay cycle", [
	"Weekly",
	"Fortnightly",
	"Monthly"
]), $("day", "Pay day", [
	"Wednesday",
	"Thursday",
	"Friday"
]), J_("wages", "Wages expense account"), J_("clearing", "Payroll clearing account"), $("bank", "Paying bank", ["Sample operating account"]), $("filing", "Filing region", ["New Zealand · Payday Filing", "Australia · STP preview"]), $("basis", "Default basis", ["Accrual", "Cash"]), $("currency", "Display currency", ["NZD", "AUD"]), $("precision", "Decimal places", ["2", "0"]), $("negative", "Negative number style", ["(1,234.56)", "-1,234.56"]), $("comparative", "Comparative period", [
	"Previous period",
	"Previous year",
	"None"
]);
//#endregion
//#region src/features/page-previews/previewModel.ts
function Q_(e, t) {
	return Object.fromEntries(e.map((e) => [e.key, t?.[e.key] ?? e.value ?? e.options?.[0] ?? ""]));
}
Object.fromEntries(Z_.map((e) => [e.id, [{
	...Q_(e.fields),
	...e.example,
	id: "sample-1",
	name: e.example.name,
	status: "Draft"
}]]));
function $_(e) {
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
var ev = (e) => Math.round((e + 2 ** -52) * 100) / 100, tv = E().min(1).max(200), nv = [], rv = 0, iv = /* @__PURE__ */ new Set(), av = () => {
	rv++, iv.forEach((e) => e());
};
function ov(e) {
	let t = jd.requireById(e);
	if (!t.active) throw Error("Select an active bank account.");
	return t;
}
function sv(e) {
	let t = nv.find((t) => t.id === e);
	if (!t) throw Error("Statement line was not found.");
	return t;
}
function cv(e) {
	if (e.status !== "UNMATCHED") throw Error("This line is already processed. Revert it before changing it.");
	let t = Qh.getLatestByBankAccount(e.bankAccountId);
	if (t && e.date <= t.statementDate) throw Error("Statement date is already reconciled.");
}
function lv(e) {
	return nv = nv.map((t) => t.id === e.id ? e : t), av(), e;
}
var uv = (e, t) => Vh(ov(e), z.getAll(), t).transactions, dv = A({
	date: tv,
	description: E().trim().min(1).max(1e3),
	amount: O().finite().refine((e) => e !== 0 && ev(e) === e, "Enter a non-zero amount in cents"),
	reference: E().max(500).default(""),
	externalId: E().max(200).default("")
}).strict(), fv = {
	importRows(e) {
		let t = A({
			bankAccountId: tv,
			rows: k(dv).min(1).max(1e4)
		}).strict().parse(e), n = ov(t.bankAccountId), r = 0, i = [...nv], a = [];
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
			let s = Qh.getLatestByBankAccount(n.id);
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
		return nv = i, av(), {
			created: a.length,
			duplicates: r
		};
	},
	importCsv(e) {
		if (typeof e.csv != "string" || e.csv.length > 1e7) throw Error("CSV exceeds the 10 MB limit.");
		let t = $_(e.csv.replace(/^\uFEFF/, "")), n = t.shift()?.map((e) => e.trim().toLowerCase()) ?? [];
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
		return fv.importRows({
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
					l = ev(t - e);
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
		return p(e.asOfDate, "As-of date"), uv(e.bankAccountId, e.asOfDate).filter((e) => e.journalStatus === "POSTED" && !nv.some((t) => t.ledgerIds.includes(e.id)));
	},
	match(e) {
		let t = sv(e.id);
		if (cv(t), !Array.isArray(e.ledgerIds) || !e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Select unique ledger entries.");
		let n = fv.candidates({
			bankAccountId: t.bankAccountId,
			asOfDate: t.date
		}), r = e.ledgerIds.map((e) => n.find((t) => t.id === e));
		if (r.some((e) => !e) || ev(r.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== t.amount) throw Error("Selected bank entries must match this signed statement amount exactly.");
		return lv({
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
		let t = sv(e.id);
		return (d["bank-rules"] ?? []).filter((e) => e.status === "Active" && e.enabled !== "No").filter((e) => {
			let n = (e.field === "Reference" ? t.reference : e.field === "Description" ? t.description : "").toLowerCase(), r = e.value.toLowerCase();
			return e.operator === "Equals" ? n === r : e.operator === "Starts with" ? n.startsWith(r) : n.includes(r);
		});
	},
	post(e) {
		F();
		let t = sv(e.id), n = JSON.stringify(e.splits);
		if (t.status === "POSTED") {
			if (t.fingerprint !== n) throw Error("Line was already posted with different categorisation.");
			return t;
		}
		cv(t);
		let r = k(A({
			accountId: tv,
			amount: O().finite().positive().refine((e) => ev(e) === e),
			taxCode: tv
		}).strict()).min(1).max(100).parse(e.splits);
		if (ev(r.reduce((e, t) => e + t.amount, 0)) !== Math.abs(t.amount)) throw Error("Split amounts must equal the statement total.");
		let i = ov(t.bankAccountId), o = t.amount < 0, c = r.flatMap((e) => {
			let t = R.requireById(e.accountId);
			if (!t.active || !t.allowManualPosting || !["EXPENSE", "REVENUE"].includes(t.type)) throw Error("Use an active manual expense/revenue account. Payments against AR/AP must be matched to their source documents.");
			let n = s(e.taxCode), r = ev(e.amount / (1 + n)), i = ev(e.amount - r);
			return [{
				accountId: t.id,
				debit: o ? r : 0,
				credit: o ? 0 : r
			}, ...i ? [{
				accountId: (o ? a(e.taxCode).taxPaidAccountId : a(e.taxCode).taxCollectedAccountId) || R.requireBySystemRole(o ? "GST_RECEIVABLE" : "GST_PAYABLE").id,
				debit: o ? i : 0,
				credit: o ? 0 : i
			}] : []];
		}), l = z.post({
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
		return lv({
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
		let t = sv(e.id);
		if (cv(t), e.reason?.trim().length < 3) throw Error("Enter an exclusion reason.");
		return lv({
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
		F();
		let t = sv(e.id);
		if (p(e.reversalDate, "Reversal date"), e.reason?.trim().length < 3 || e.reversalDate < t.date) throw Error("Enter a reason and a reversal date on or after the statement line.");
		if (t.status === "UNMATCHED") throw Error("Line is already unmatched.");
		for (let e of t.ledgerIds) pg(e.split(":")[0]);
		let n = Qh.getLatestByBankAccount(t.bankAccountId);
		if (n && t.date <= n.statementDate) throw Error("Reconciled statement lines cannot be reverted.");
		return t.status === "POSTED" && t.journalEntryId && z.reverse({
			journalEntryId: t.journalEntryId,
			reversalDate: e.reversalDate,
			reason: e.reason
		}), lv({
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
		if (Zl(e.statementDate), F(), p(e.statementDate, "Statement date"), !nv.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate)) throw Error("Import the statement first.");
		if (nv.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate && t.status === "UNMATCHED")) throw Error("Process every statement line before completing reconciliation.");
		let t = nv.filter((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate).flatMap((e) => e.ledgerIds);
		return Qh.complete({
			...e,
			clearedTransactionIds: [.../* @__PURE__ */ new Set([...Qh.getClearedTransactionIds(e.bankAccountId), ...t])]
		});
	}
}, pv = A({
	id: tv,
	key: E(),
	bankAccountId: tv,
	date: tv,
	description: E(),
	reference: E(),
	amount: O().finite(),
	externalId: E(),
	status: j([
		"UNMATCHED",
		"MATCHED",
		"POSTED",
		"IGNORED"
	]),
	ledgerIds: k(tv),
	journalEntryId: E().optional(),
	fingerprint: E().optional(),
	history: k(A({
		action: E(),
		date: E(),
		reason: E().optional()
	}))
}).strict();
o("bankStatements", {
	repository: fv,
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
	snapshot: () => ({ lines: nv }),
	restore: (e) => {
		nv = e.lines;
	},
	validate: (e) => {
		k(pv).parse(e.lines);
	},
	publish: av
});
//#endregion
//#region src/features/business-workspace/productRepository.ts
var mv = A({
	id: E().min(1),
	code: j([
		"M2",
		"LM",
		"BOX",
		"PIECE",
		"ROLL",
		"BUCKET"
	]),
	name: E().trim().min(1),
	symbol: E().min(1),
	conversionToBase: O().finite().positive(),
	basePrice: O().finite().nonnegative(),
	isBaseUnit: Us(),
	active: Us()
}).strict(), hv = A({
	id: E().min(1),
	sku: E().trim().min(1).max(80),
	name: E().trim().min(1).max(180),
	category: j([
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
	status: j(["ACTIVE", "INACTIVE"]),
	baseUnitId: E().min(1),
	units: k(mv).min(1),
	createdAt: E(),
	updatedAt: E(),
	revision: O().int().nonnegative().optional(),
	itemType: j([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	buyEnabled: Us().optional(),
	sellEnabled: Us().optional(),
	reorderPoint: O().finite().nonnegative().optional(),
	targetStock: O().finite().nonnegative().optional(),
	wholePacks: Us().optional(),
	taxCode: E().min(1).optional()
}).strict(), gv = /* @__PURE__ */ new Set(), _v = [...Ac];
function vv() {
	_v = [...Ac], gv.forEach((e) => e());
}
function yv(e, t, n) {
	if (Array.isArray(e)) return e.some((e) => yv(e, t, n));
	if (!e || typeof e != "object") return !1;
	let r = e;
	return r.productId === t && (!n || r.unitId === n) || Object.values(r).some((e) => yv(e, t, n));
}
function bv(e) {
	let t = k(hv).parse(e), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.id) || r.has(e.sku.toLowerCase())) throw Error("Duplicate product ID or SKU.");
		if (n.add(e.id), r.add(e.sku.toLowerCase()), new Set(e.units.map((e) => e.id)).size !== e.units.length || e.units.filter((e) => e.isBaseUnit).length !== 1 || !e.units.some((t) => t.id === e.baseUnitId && t.isBaseUnit && t.conversionToBase === 1)) throw Error("A product needs exactly one valid base unit.");
		if ((e.targetStock ?? 0) < (e.reorderPoint ?? 0)) throw Error("Target stock must be at least the reorder point.");
	}
	return t;
}
o("products", {
	validate: (e, t) => {
		let n = bv(e.products), r = t.workspace_tax_codes.records;
		if (n.some((e) => !r.some((t) => t.code === (e.taxCode ?? "GST")))) throw Error("Backup product tax-code reference is invalid.");
	},
	repository: {
		subscribe(e) {
			return gv.add(e), () => {
				gv.delete(e);
			};
		},
		getSnapshot: () => _v,
		getAll: () => Ac,
		getById: (e) => Ac.find((t) => t.id === e),
		save(e, t) {
			let n = hv.parse(e), r = Ac.find((e) => e.id === n.id);
			if (r && t !== (r.revision ?? 0)) throw Error("Product changed since it was opened. Reload before saving.");
			if (!r && t !== void 0) throw Error("Product no longer exists.");
			if (s(n.taxCode ?? "GST"), n.itemType && n.itemType !== "STOCK") throw Error("Only stocked products are supported by the current fulfilment workflow.");
			let i = te();
			if (delete i.products, r) {
				if (r.baseUnitId !== n.baseUnitId && yv(i, n.id)) throw Error("A referenced product cannot change base unit.");
				for (let e of r.units) {
					let t = n.units.find((t) => t.id === e.id);
					if ((!t || t.conversionToBase !== e.conversionToBase || t.code !== e.code) && yv(i, n.id, e.id)) throw Error("A referenced unit conversion cannot be changed or removed. Add a new unit instead.");
				}
			}
			let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
				...n,
				createdAt: r?.createdAt ?? a,
				updatedAt: a,
				revision: (r?.revision ?? 0) + 1
			};
			return bv([...Ac.filter((e) => e.id !== n.id), o]), r ? Ac.splice(Ac.indexOf(r), 1, o) : Ac.push(o), cp.ensureProductPolicy(o.id, o.baseUnitId, o.itemType !== "SERVICE" && o.itemType !== "NON_STOCK"), vv(), o;
		}
	},
	read: "inventory.read",
	commands: { save: "inventory.adjust" },
	snapshot: () => ({ products: structuredClone(Ac) }),
	restore: (e) => {
		let t = bv(e.products);
		Ac.splice(0, Ac.length, ...t), _v = [...Ac];
	},
	publish: vv
});
//#endregion
//#region src/features/business-workspace/workspaceRepository.ts
var xv = tc(E(), E().max(2e4)), Sv = [
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
], Cv = () => (/* @__PURE__ */ new Date()).toISOString(), wv = {
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
}, Tv = /* @__PURE__ */ new Set(), Ev = 0, Dv = () => {
	Ev++, Tv.forEach((e) => e());
}, Ov = Object.fromEntries(Object.keys(wv).map((e) => [e, []]));
for (let e of Object.keys(wv)) d[e] = [];
var kv = () => ({
	collected: R.getAll().find((e) => e.systemRole === "GST_PAYABLE")?.id ?? "",
	paid: R.getAll().find((e) => e.systemRole === "GST_RECEIVABLE")?.id ?? ""
});
d["tax-codes"] = [{
	id: "tax-gst",
	name: "GST",
	status: "Active",
	revision: "1",
	createdAt: Cv(),
	updatedAt: Cv(),
	code: "GST",
	rate: "10",
	basis: "Exclusive",
	report: "GST",
	...kv()
}, {
	id: "tax-zero",
	name: "Zero rated",
	status: "Active",
	revision: "1",
	createdAt: Cv(),
	updatedAt: Cv(),
	code: "ZERO",
	rate: "0",
	basis: "Exclusive",
	report: "Zero rated",
	...kv()
}];
function Av(e, t) {
	if (!e?.trim()) throw Error(`${t} is required.`);
}
function jv(e, t) {
	if (!e?.trim() || !Number.isFinite(Number(e)) || Number(e) < 0) throw Error(`${t} must be a non-negative number.`);
}
function Mv(e, t) {
	let n = R.getAll().find((t) => t.id === e);
	if (!n?.active || t && n.type !== t) throw Error("Select an active account of the correct type.");
	return n;
}
function Nv(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && (/* @__PURE__ */ new Date(e + "T00:00:00Z")).toISOString().slice(0, 10) === e;
}
function Pv(e, t, n, r = !0) {
	let i = wv[e];
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
	Av(t.name, "Name");
	for (let e of i.required) Av(t[e], e);
	if (![
		"Active",
		"Inactive",
		"Open",
		"In progress",
		"Completed"
	].includes(t.status ?? "Active")) throw Error("Invalid business status.");
	if (e === "tax-codes") {
		if (jv(t.rate, "Tax rate"), t.basis && !["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid entry basis.");
		if (r) {
			let e = n.find((e) => e.id === t.id), r = te(), i = d.settings?.find((e) => e.section === "business" && e.status === "Active")?.gstCode ?? "GST";
			if (t.status === "Inactive" && t.code === i) throw Error("The default tax code must remain active. Change the business default first.");
			if (e && e.code !== t.code && (e.code === i || r.products.products.some((t) => (t.taxCode ?? "GST") === e.code) || (d["bank-rules"] ?? []).some((t) => t.taxCode === e.code))) throw Error("A referenced tax code cannot be renamed. Create a new code and update future-use references.");
		}
		if (Number(t.rate) > 100) throw Error("Tax rate cannot exceed 100%.");
		if (r) {
			let e = Mv(t.collected, "LIABILITY"), n = Mv(t.paid, "ASSET"), r = (te().bankAccounts?.bankAccounts ?? []).map((e) => e.glAccountId);
			if (e.systemRole && e.systemRole !== "GST_PAYABLE" || n.systemRole && n.systemRole !== "GST_RECEIVABLE" || r.includes(n.id)) throw Error("Tax mappings cannot use AR/AP, inventory, GRNI or bank control accounts.");
		}
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Tax code must be unique.");
		if (!/^[A-Z0-9_-]{1,24}$/.test(t.code)) throw Error("Use uppercase letters/numbers for a tax code.");
	}
	if (e === "linked-accounts" && r) {
		let e = R.requireBySystemRole(t.role), n = t.status === "Inactive" ? R.getAll().find((e) => e.systemRole === t.role)?.id : t.accountId, r = te().journals?.journalEntries ?? [];
		if (n !== e.id && r.some((t) => t.lines.some((t) => t.accountId === e.id || t.accountId === n))) throw Error("A used posting account cannot be remapped without a ledger migration.");
	}
	if (e === "linked-accounts") {
		if (!Sv.includes(t.role)) throw Error("Unknown account role.");
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
		if (r && Mv(t.accountId, e), n.some((e) => e.id !== t.id && e.role === t.role)) throw Error("A linked account role may only have one mapping.");
	}
	if (e === "promotions") {
		let e = jc(t.productId);
		if (r && (!e || !Mc(e.id, t.unitId))) throw Error("Product/unit not found.");
		if (jv(t.price, "Price"), !Number.isInteger(Number(t.priority))) throw Error("Priority must be an integer.");
		if (![
			"Customer price first",
			"Promotion first",
			"Lowest eligible price"
		].includes(t.policy)) throw Error("Invalid price conflict policy.");
		if (!/([+-]\d\d:\d\d|Z)$/.test(t.starts) || !Number.isFinite(Date.parse(t.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(t.ends) || !Number.isFinite(Date.parse(t.ends)) || Date.parse(t.ends) <= Date.parse(t.starts)) throw Error("Promotion requires explicit time offsets and an end after start.");
	}
	if (r && t.customerId && !rl.getById(t.customerId)) throw Error("Customer was not found.");
	if (e === "jobs") {
		if (jv(t.budget, "Revenue budget"), jv(t.costBudget, "Cost budget"), !Nv(t.starts) || !Nv(t.ends) || t.ends < t.starts) throw Error("Invalid project dates.");
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Job code must be unique.");
	}
	if (e === "tasks" && (!Nv(t.due) || ![
		"Low",
		"Normal",
		"High"
	].includes(t.priority))) throw Error("Invalid due date or priority.");
	if (e === "bank-rules") {
		if (r && Mv(t.accountId), ![
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
	if (e === "report-packs" && (!Nv(t.periodStart) || !Nv(t.periodEnd) || t.periodEnd < t.periodStart)) throw Error("Invalid report period.");
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
			]) Av(t[e], e);
			if (t.status !== "Active") throw Error("Business settings must remain active.");
			if (!["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid price basis.");
			if (!/^\d+$/.test(t.terms) || Number(t.terms) > 365) throw Error("Payment terms must be 0–365 days.");
			if (!/^\d{2}-\d{2}$/.test(t.yearEnd) || !Nv("2001-" + t.yearEnd)) throw Error("Year end must be MM-DD.");
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
				let e = te().journals.journalEntries, r = n.find((e) => e.id === t.id), i = te().bankAccounts.bankAccounts, a = r?.currency ?? i[0]?.currency ?? "AUD";
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
function Fv(e, t, n) {
	Ov[e].push({
		id: crypto.randomUUID(),
		name: n,
		status: "Active",
		revision: "1",
		createdAt: Cv(),
		updatedAt: Cv(),
		recordId: t.id,
		actorId: kc.current()?.userId ?? "local-test",
		after: JSON.stringify(t)
	});
}
Object.fromEntries(Object.keys(wv).map((e) => {
	let t = {
		getAll: () => d[e],
		getById: (t) => d[e].find((e) => e.id === t),
		save(t, n) {
			let r = xv.parse(t), i = d[e].find((e) => e.id === r.id);
			if (i && i.revision !== n) throw Error("Record changed. Reload before saving.");
			if (!i && n !== void 0) throw Error("Record no longer exists.");
			let a = Cv(), o = {
				...r,
				id: i?.id ?? crypto.randomUUID(),
				name: r.name.trim(),
				status: r.status ?? "Active",
				revision: String(Number(i?.revision ?? "0") + 1),
				createdAt: i?.createdAt ?? a,
				updatedAt: a
			};
			return e === "tasks" && o.status === "Completed" && (o.completedAt = i?.completedAt ?? a, o.completedBy = i?.completedBy ?? kc.current()?.userId ?? "local-test"), Pv(e, o, d[e]), d[e] = [...d[e].filter((e) => e.id !== o.id), o], Fv(e, o, i ? "Updated" : "Created"), Dv(), o;
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
			Fv(e, {
				...i,
				note: r.trim()
			}, "Note added"), Dv();
		}
	};
	return o("workspace_" + e.replaceAll("-", "_"), {
		validate: (t, n) => {
			Iv(e, t), Lv(e, t, n);
		},
		repository: t,
		read: wv[e].read,
		commands: {
			save: wv[e].write,
			setStatus: wv[e].write,
			addNote: e === "tasks" ? "sales.write" : null
		},
		snapshot: () => ({
			records: d[e],
			history: Ov[e]
		}),
		restore: (t) => {
			Iv(e, t), d[e] = t.records, Ov[e] = t.history;
		},
		publish: Dv
	}), [e, t];
}));
function Iv(e, t) {
	let n = A({
		records: k(xv),
		history: k(xv)
	}).strict().parse(t), r = /* @__PURE__ */ new Set();
	for (let t of n.records) {
		if (!t.id || r.has(t.id) || !/^\d+$/.test(t.revision)) throw Error("Invalid workspace record identity.");
		r.add(t.id), Pv(e, t, n.records, !1);
	}
	return n;
}
function Lv(e, t, n) {
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
function Rv(e) {
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
var zv = /* @__PURE__ */ new Set(), Bv = I.read().transactions, Vv = I.read().transfers;
I.onRollback(() => {
	let e = I.read();
	Bv = e.transactions, Vv = e.transfers;
});
function Hv() {
	zv.forEach((e) => I.notify(e));
}
function Uv(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function Wv(e) {
	return e?.trim() || void 0;
}
function Gv(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function Kv(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function qv(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Jv(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var Yv = {
	subscribe(e) {
		return zv.add(e), () => {
			zv.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return Bv;
	},
	getTransfersSnapshot() {
		return Vv;
	},
	getTransactions() {
		return Bv;
	},
	getTransfers() {
		return Vv;
	},
	createTransaction(e, t) {
		if (Gv(e.transactionDate), p(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = Kv(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Uv(e.description, "Description"), i = jd.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let a = R.requireById(i.glAccountId);
		if (!a.active) throw Error("The selected bank GL account is inactive.");
		let o = R.requireById(e.offsetAccountId);
		if (!o.active) throw Error("The offset account is inactive.");
		if (!o.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (o.id === a.id) throw Error("Bank and offset accounts must be different.");
		if (jd.getByGlAccountId(o.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let s = qv("banktxn"), c = Jv("BTXN", e.transactionDate, Bv.length + 1), l = t?.trim();
		if (t !== void 0 && !l) throw Error("Operation ID cannot be empty");
		if (l) {
			let t = N.begin(l, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Bv.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			l && N.bindResult(l, s);
			let t = z.post({
				journalDate: e.transactionDate,
				description: r,
				reference: Wv(e.reference),
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
				reference: Wv(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [u, ...Bv];
			if (I.update("transactions", d), Bv = d, Hv(), l) {
				let e = z.getBySource("BANK_TRANSACTION", s);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Bank GL posting could not be verified uniquely.");
			}
			return u;
		} catch (e) {
			if (l) try {
				N.flagForReview(l, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	},
	createTransfer(e, t) {
		Gv(e.transferDate), p(e.transferDate, "Transfer date");
		let n = Kv(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Uv(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = jd.requireById(e.fromBankAccountId), a = jd.requireById(e.toBankAccountId);
		if (!i.active || !a.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== a.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < a.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let o = R.requireById(i.glAccountId), s = R.requireById(a.glAccountId);
		if (!o.active || !s.active) throw Error("Both bank GL accounts must be active.");
		if (o.id === s.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let c = qv("banktrf"), l = Jv("BTRF", e.transferDate, Vv.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = N.begin(u, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Vv.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			u && N.bindResult(u, c);
			let t = z.post({
				journalDate: e.transferDate,
				description: r,
				reference: Wv(e.reference),
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
				reference: Wv(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [d, ...Vv];
			if (I.update("transfers", f), Vv = f, Hv(), u) {
				let e = z.getBySource("BANK_TRANSFER", c);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Transfer GL posting could not be verified uniquely.");
			}
			return d;
		} catch (e) {
			if (u) try {
				N.flagForReview(u, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	}
}, Xv = Yv.createTransaction;
Yv.createTransaction = function(e, t) {
	F();
	let n;
	try {
		return n = I.transaction(() => Xv.call(Yv, e, t)), t && N.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = N.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				N.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
};
var Zv = Yv.createTransfer;
Yv.createTransfer = function(e, t) {
	F();
	let n;
	try {
		return n = I.transaction(() => Zv.call(Yv, e, t)), t && N.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = N.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				N.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
}, o("bankTransactions", {
	repository: Yv,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: Bv,
		bankTransfers: Vv
	}),
	restore: (e) => {
		Bv = e.bankTransactions, Vv = e.bankTransfers;
	},
	publish: () => zv.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function Qv() {
	return Rv({
		transactions: Yv.getTransactions(),
		transfers: Yv.getTransfers(),
		payments: Ld.getAll(),
		journals: z.getAll(),
		invoices: W.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: B.getAll(),
		supplierBills: Qm.getAll(),
		supplierPayments: D_.getAll(),
		supplierCredits: X.getAll()
	});
}
//#endregion
//#region electron/security/periodCloseChecks.ts
function $v(e) {
	let t = te(), n = [], r = (e, t) => n.push({
		code: e,
		message: t
	});
	e.endDate >= u((/* @__PURE__ */ new Date()).toISOString()) && r("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of N.getUnresolved()) r("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of t.purchaseOperations) e.status !== "POSTED" && r("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of Qv()) r(e.code, `${e.entityId}: ${e.message}`);
	let i = {
		accounts: t.accounts.accounts,
		journalEntries: t.journals.journalEntries,
		asOfDate: e.endDate
	}, a = [
		["AR", () => Vg({
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
		["AP", () => r_({
			...i,
			suppliers: t.suppliers.suppliers,
			bills: t.supplierBills.supplierBills,
			payments: t.supplierPayments.supplierPayments,
			credits: t.supplierCredits.supplierCredits,
			creditAllocations: t.supplierCredits.allocations
		})],
		["INVENTORY", () => u_({
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
var ey = null, ty = {
	configureTrustedSession(e) {
		ey = e;
	},
	clear() {
		ey = null;
	},
	current() {
		return ey?.() ?? null;
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
}, ny = "htt.purchasePosting.manualRecoveryAudit.v1";
function ry() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(ny) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var iy = ry();
function ay(e) {
	iy.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(ny, JSON.stringify(iy));
	} catch {}
}
o("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return iy.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = P.get(e);
			return ty.canRecover() && t?.status === "RECOVERY_REQUIRED" && P.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = ty.requireRecoveryPermission(), n = P.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!P.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				P.recover(e), ay({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw ay({
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
	snapshot: () => iy,
	restore: (e) => {
		iy.splice(0, iy.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var oy = !1;
function sy() {
	if (oy || (oy = !0, I.wasRestoredOnLoad())) return;
	let e = W.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) Gd.postInvoice(t), t.status === "VOID" && Gd.reverseInvoice(t);
	let t = Ld.getAll();
	for (let e of t) Gd.postPayment(e), e.status === "REVERSED" && Gd.reversePayment(e);
	let n = B.getAll();
	for (let e of n) e.status !== "DRAFT" && (Gd.postCreditNote(e), e.status === "VOID" && Gd.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function cy() {
	let e = Qv().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/sales/data/salesManualReviewService.ts
var ly = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function uy(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = l("business.command", {
			repository: "salesRecovery",
			method: "recordSalesManualReview",
			args: [e]
		});
		return f(t.view), t.result;
	}
	if (!e.businessRecordChecked || !e.originalGlChecked || !e.reversalGlChecked || !e.balancesChecked) throw Error("Business, original/reversal GL and balances must all be inspected.");
	let t = N.list().find((t) => t.operationId === e.operationId);
	if (!t || !ly.has(t.kind)) throw Error("Sales operation not found.");
	if (t.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return N.recordManualReview(e.operationId, e.reference, e.operator, e.summary);
}
//#endregion
//#region src/features/sales/data/salesConsistencyAudit.ts
var dy = (e) => Math.round(e * 100);
function fy(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + dy(t.amount), 0), s = a.reduce((e, t) => e + dy(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (dy(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), dy(t.amountDue) !== Math.max(0, dy(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > dy(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + dy(t.amount), 0);
		dy(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || dy(t.amountAvailable) !== 0 : dy(t.amountAvailable) !== dy(t.totals.total) - a - dy(t.amountRefunded ?? 0)) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
var py = {
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
function my(e) {
	return fy(e).map((e) => ({
		...e,
		action: py[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var hy = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function gy(e, t) {
	let n = my(e).map((e) => ({ ...e })), r = t.filter((e) => hy.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => hy.has(e.kind))) s.has(e.operationId) && n.push({
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
function _y() {
	let e = W.getAll();
	return gy({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Ld.getAll(),
		creditNotes: B.getAll(),
		allocations: B.getAllAllocations(),
		journals: z.getAll()
	}, N.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
var vy = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function yy(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!vy.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = gy(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function by() {
	let e = W.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Ld.getAll(),
		creditNotes: B.getAll(),
		allocations: B.getAllAllocations(),
		journals: z.getAll()
	};
}
function xy(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = l("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [e]
		});
		return f(t.view), t.result;
	}
	let t = N.list(), n = yy(by(), t, e.operationId);
	if (n.length) throw Error(`Sales recovery remains blocked: ${n.join(" ")}`);
	let r = t.find((t) => t.operationId === e.operationId);
	return {
		closed: N.closeReviewed(e.operationId, r.resultId, e.approvalReference, e.approver),
		remaining: _y()
	};
}
//#endregion
//#region electron/security/businessEngine.ts
o("salesRecovery", {
	repository: {
		recordSalesManualReview: uy,
		closeVerifiedSalesReview: xy
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
var Sy = te();
function Cy(e) {
	Kl($v, () => e()?.userId ?? ""), kc.connect(e), ty.configureTrustedSession(e), sy(), cy();
}
//#endregion
export { Zl as assertPostingPeriod, Cy as initialize, Sy as workspaceDefaults };
