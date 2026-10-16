import { a as e, i as t, n, o as r, p as i, r as a, t as o, u as s } from "./accountingPeriodValidation-9Djbsd6O.js";
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
	function g(e, n, r) {
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
		return g(e.type, t, e.props);
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
		if (c) return o = o(e), c = a === "" ? "." + me(e, 0) : a, ce(o) ? (i = "", c != null && (i = c.replace(pe, "$&/") + "/"), ge(o, r, i, "", function(e) {
			return e;
		})) : o != null && (de(o) && (o = _(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(pe, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (ce(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + me(a, u), c += ge(a, r, i, s, o);
		else if (u = ee(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + me(a, u++), c += ge(a, r, i, s, o);
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
	function v(e) {
		var t = h.T, n = {};
		n.types = t === null ? null : t.types, h.T = n;
		try {
			var r = e(), i = h.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(le, ye);
		} catch (e) {
			ye(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), h.T = t;
		}
	}
	function be(e) {
		var t = h.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else v(be.bind(null, e));
	}
	var xe = {
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
	e.Activity = f, e.Children = xe, e.Component = ie, e.Fragment = r, e.Profiler = a, e.PureComponent = oe, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = h, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return h.H.useMemoCache(e);
		}
	}, e.addTransitionType = be, e.cache = function(e) {
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
		return g(e.type, i, r);
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
		return g(e, a, i);
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
	}, e.startTransition = v, e.unstable_useCacheRefresh = function() {
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
				case be: return "Fragment";
				case Se: return "Profiler";
				case xe: return "StrictMode";
				case Ee: return "Suspense";
				case De: return "SuspenseList";
				case Ae: return "Activity";
				case je: return "ViewTransition";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case v: return "Portal";
				case we: return e.displayName || "Context";
				case Ce: return (e._context.displayName || "Context") + ".Consumer";
				case Te:
					var t = e.render;
					return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case Oe: return t = e.displayName || null, t === null ? d(e.type) || "Memo" : t;
				case ke:
					t = e._payload, e = e._init;
					try {
						return d(e(t));
					} catch {}
			}
			return null;
		}
		function f(e) {
			if (e === be) return "<>";
			if (typeof e == "object" && e && e.$$typeof === ke) return "<...>";
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
		function ee(e) {
			if (Be.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function te(e, t) {
			function n() {
				He || (He = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function ne() {
			var e = d(this.type);
			return We[e] || (We[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function re(e, t, n, r, i, a) {
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
			oe(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === ke && (e._payload.status === "fulfilled" ? oe(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function oe(e) {
			return typeof e == "object" && !!e && e.$$typeof === ye;
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
					case ye:
					case v:
						s = !0;
						break;
					case ke: return s = e._init, h(s(e._payload), t, n, i, a);
				}
			}
			if (s) {
				s = e, a = a(s);
				var c = i === "" ? "." + ce(s, 0) : i;
				return Re(a) ? (n = "", c != null && (n = c.replace(Je, "$&/") + "/"), h(a, t, n, "", function(e) {
					return e;
				})) : a != null && (oe(a) && (a.key != null && (s && s.key === a.key || u(a.key)), n = ie(a, n + (a.key == null || s && s.key === a.key ? "" : ("" + a.key).replace(Je, "$&/") + "/") + c), i !== "" && s != null && oe(s) && s.key == null && s._store && !s._store.validated && (n._store.validated = 2), a = n), t.push(a)), 1;
			}
			if (s = 0, c = i === "" ? "." : i + ":", Re(e)) for (var l = 0; l < e.length; l++) i = e[l], o = c + ce(i, l), s += h(i, t, n, o, a);
			else if (l = r(e), typeof l == "function") for (l === e.entries && (qe || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), qe = !0), e = l.call(e), l = 0; !(i = e.next()).done;) i = i.value, o = c + ce(i, l++), s += h(i, t, n, o, a);
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
		function g(e) {
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
			t !== b - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), b = t;
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
			if (!$e) {
				$e = !0;
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
					$e = !1;
				}
			}
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var ye = Symbol.for("react.transitional.element"), v = Symbol.for("react.portal"), be = Symbol.for("react.fragment"), xe = Symbol.for("react.strict_mode"), Se = Symbol.for("react.profiler"), Ce = Symbol.for("react.consumer"), we = Symbol.for("react.context"), Te = Symbol.for("react.forward_ref"), Ee = Symbol.for("react.suspense"), De = Symbol.for("react.suspense_list"), Oe = Symbol.for("react.memo"), ke = Symbol.for("react.lazy"), Ae = Symbol.for("react.activity"), je = Symbol.for("react.view_transition"), Me = Symbol.iterator, Ne = {}, Pe = {
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
		for (tt in Le) Le.hasOwnProperty(tt) && n(tt, Le[tt]);
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
		}, Xe = !1, Ze = null, b = 0, Qe = !1, $e = !1, et = typeof queueMicrotask == "function" ? function(e) {
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
		var tt = {
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
		e.Activity = Ae, e.Children = tt, e.Component = a, e.Fragment = be, e.Profiler = Se, e.PureComponent = s, e.StrictMode = xe, e.Suspense = Ee, e.ViewTransition = je, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = y, e.__COMPILER_RUNTIME = Le, e.act = function(e) {
			var t = y.actQueue, n = b;
			b++;
			var r = y.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				y.thrownErrors.push(e);
			}
			if (0 < y.thrownErrors.length) throw ge(t, n), e = he(y.thrownErrors), y.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return et(function() {
					i || Qe || (Qe = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
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
			if (ge(t, n), n === 0 && (ve(r), r.length !== 0 && et(function() {
				i || Qe || (Qe = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
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
				for (s in o && (a = p()), ee(t) && (u(t.key), i = "" + t.key), t) !Be.call(t, s) || s === "key" || s === "__self" || s === "__source" || s === "ref" && t.ref === void 0 || (r[s] = t[s]);
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
				$$typeof: we,
				_currentValue: e,
				_currentValue2: e,
				_threadCount: 0,
				Provider: null,
				Consumer: null
			}, e.Provider = e, e.Consumer = {
				$$typeof: Ce,
				_context: e
			}, e._currentRenderer = null, e._currentRenderer2 = null, e;
		}, e.createElement = function(e, t, n) {
			for (var r = 2; r < arguments.length; r++) ae(arguments[r]);
			var i;
			r = {};
			var a = null;
			if (t != null) for (i in Ue || !("__self" in t) || "key" in t || (Ue = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), ee(t) && (u(t.key), a = "" + t.key), t) Be.call(t, i) && i !== "key" && i !== "__self" && i !== "__source" && (r[i] = t[i]);
			var o = arguments.length - 2;
			if (o === 1) r.children = n;
			else if (1 < o) {
				for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
				Object.freeze && Object.freeze(s), r.children = s;
			}
			if (e && e.defaultProps) for (i in o = e.defaultProps, o) r[i] === void 0 && (r[i] = o[i]);
			return a && te(r, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), (i = 1e4 > y.recentlyCreatedOwnerStacks++) ? (s = Error.stackTraceLimit, Error.stackTraceLimit = 10, o = Error("react-stack-top-frame"), Error.stackTraceLimit = s) : o = Ge, re(e, a, r, p(), o, i ? Ve(f(e)) : Ke);
		}, e.createRef = function() {
			var e = { current: null };
			return Object.seal(e), e;
		}, e.forwardRef = function(e) {
			e != null && e.$$typeof === Oe ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e == "function" ? e.length !== 0 && e.length !== 2 && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.") : console.error("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e), e != null && e.defaultProps != null && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
			var t = {
				$$typeof: Te,
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
				$$typeof: ke,
				_payload: e,
				_init: g
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
				$$typeof: Oe,
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
			return e.$$typeof === Ce && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"), t.useContext(e);
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
	return e.map((e) => be(e)).join(t);
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
function g(...e) {
	let t = {};
	for (let n of e) {
		let e = Object.getOwnPropertyDescriptors(n);
		Object.assign(t, e);
	}
	return Object.defineProperties({}, t);
}
function _(e) {
	return JSON.stringify(e);
}
function de(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var fe = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function pe(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var me = /* @__PURE__*/ te(() => {
	if (st.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function he(e) {
	if (pe(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return pe(n) !== !1 && Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") !== !1;
}
function ge(e) {
	return he(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var _e = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function ve(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ye(e, t, n) {
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
function be(e) {
	return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function xe(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
var Se = {
	safeint: [-(2 ** 53 - 1), 2 ** 53 - 1],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, Ce = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function we(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	let i = {};
	return h(i, e, Te(e, t)), ye(e, g(n, {
		shape: i,
		checks: []
	}));
}
function Te(e, t) {
	let n = se(e), r = [];
	for (let e of Reflect.ownKeys(t)) {
		if (!Object.getOwnPropertyDescriptor(n, e)?.enumerable) throw Error(`Unrecognized key: "${String(e)}"`);
		t[e] && r.push(e);
	}
	return r;
}
function Ee(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	let i = new Set(Te(e, t)), a = {};
	return h(a, e, Reflect.ownKeys(se(e)).filter((e) => !i.has(e))), ye(e, g(n, {
		shape: a,
		checks: []
	}));
}
function De(e, t) {
	if (!he(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = se(e);
		for (let e of Reflect.ownKeys(t)) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return ye(e, g(e._zod.def, { shape: Oe(e, t) }));
}
function Oe(e, t) {
	let n = {};
	return h(n, e, Reflect.ownKeys(se(e))), ue(n, t), n;
}
function ke(e, t) {
	if (!he(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return ye(e, g(e._zod.def, { shape: Oe(e, t) }));
}
function Ae(e, t) {
	if (!t?._zod?.def) throw Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (e._zod.def.checks?.length) throw Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	let n = {};
	return h(n, e, Reflect.ownKeys(se(e))), h(n, t, Reflect.ownKeys(se(t))), ye(e, g(e._zod.def, {
		shape: n,
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: t._zod.def.checks ?? []
	}));
}
function je(e, t, n, r = "partial") {
	let i = t._zod.def.checks;
	if (i && i.length > 0) throw Error(`.${r}() cannot be used on object schemas containing refinements`);
	let a = n ? new Set(Te(t, n)) : void 0, o = {};
	return h(o, t, Reflect.ownKeys(se(t)), e && ((t, n) => a && !a.has(n) ? t : new e({
		type: "optional",
		innerType: t
	}))), ye(t, g(t._zod.def, {
		shape: o,
		checks: []
	}));
}
function Me(e, t, n) {
	let r = n ? new Set(Te(t, n)) : void 0, i = {};
	return h(i, t, Reflect.ownKeys(se(t)), (t, n) => r && !r.has(n) ? t : new e({
		type: "nonoptional",
		innerType: t
	})), ye(t, g(t._zod.def, { shape: i }));
}
function Ne(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function Pe(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
	return !1;
}
function Fe(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function Ie(e) {
	return typeof e == "string" ? e : e?.message;
}
function Le(e, t, n) {
	var r;
	for (let i = t; i < e.length; i++) (r = e[i]).schema ?? (r.schema = n);
}
function Re(e, t, n) {
	var r;
	let i = e.inst?._zod?.traits;
	i?.has("$ZodType") && (i.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
	let a = e.schema === e.inst ? void 0 : e.schema?._zod.def?.error, o = e.message ? e.message : Ie(e.inst?._zod.def?.error?.(e)) ?? Ie(a?.(e)) ?? Ie(t?.error?.(e)) ?? Ie(n.customError?.(e)) ?? Ie(n.localeError?.(e)) ?? "Invalid input", s = {};
	for (let t of Object.keys(e)) t !== "inst" && t !== "schema" && t !== "continue" && t !== "input" && t !== "__proto__" && (s[t] = e[t]);
	return s.path ??= [], s.message = o, t?.reportInput && (s.input = e.input), s;
}
var ze = /[\uD800-\uDBFF]/;
function y(e) {
	let t = e.length;
	if (!ze.test(e)) return t;
	let n = t;
	for (let r = 0; r < t - 1; r++) (e.charCodeAt(r) & 64512) == 55296 && (e.charCodeAt(r + 1) & 64512) == 56320 && (n--, r++);
	return n;
}
function Be(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Ve(e) {
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
function He(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
function Ue(e, t) {
	for (let n in t) {
		let r = Object.getOwnPropertyDescriptor(t, n);
		r.get ? Object.defineProperty(e, n, {
			...r,
			enumerable: !1
		}) : qe(e, n, r.value);
	}
}
function We(e, t, n, r = !0) {
	return Object.defineProperty(e, t, {
		configurable: !0,
		writable: !0,
		enumerable: r,
		value: n
	}), n;
}
function Ge(e, t, n) {
	return We(e, t, n, !1);
}
function Ke(e, t) {
	for (let n in e) {
		let r = e[n];
		Object.defineProperty(t, n, {
			configurable: !0,
			enumerable: !0,
			get() {
				return We(this, n, r(this));
			},
			set(e) {
				We(this, n, e);
			}
		});
	}
	return t;
}
function qe(e, t, n) {
	Object.defineProperty(e, t, {
		configurable: !0,
		get() {
			return this == null ? n : We(this, t, n.bind(this));
		},
		set(e) {
			We(this, t, e);
		}
	});
}
function Je(e, t) {
	let n = Object.getPrototypeOf(e);
	return t in n ? void 0 : n;
}
var Ye, Xe = !1, Ze = {
	configurable: !0,
	get() {
		Xe = !0;
	}
};
function b(e, t, n) {
	let r = Object.getPrototypeOf(e._zod);
	if (t in r && Ye !== e._zod) {
		Ye = void 0;
		return;
	}
	Ye = e._zod, Object.defineProperty(r, t, {
		configurable: !0,
		get() {
			Object.defineProperty(this, t, Ze);
			let e = Xe;
			Xe = !1;
			try {
				let r = n(this);
				return Xe ? delete this[t] : Object.defineProperty(this, t, {
					configurable: !0,
					writable: !0,
					value: r
				}), Xe ||= e, r;
			} catch (n) {
				throw delete this[t], Xe ||= e, n;
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
function Qe(e, t, n, r) {
	let i = Je(e, t);
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
var $e = "~constantCatch";
function et(e) {
	let t = () => e;
	return t[$e] = !0, t;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/core.js
var tt, nt = {
	value: void 0,
	enumerable: !1
}, rt = "captureStackTrace" in Error ? Error : null;
function it(e) {
	let t = rt;
	if (t) {
		let n = t.stackTraceLimit;
		if (typeof n == "number") {
			try {
				t.stackTraceLimit = 0;
			} catch {
				return rt = null, new e();
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
			nt.value = new a(r);
			try {
				Object.defineProperty(n, "_zod", nt);
			} finally {
				nt.value = void 0;
			}
		} else if (n._zod.traits.has(e)) return;
		if (n._zod.traits.add(e), t(n, r), s) {
			let e = Object.getPrototypeOf(n), t = n._zod.constr.prototype, r = e;
			for (; r && r !== t;) r = Object.getPrototypeOf(r);
			let i = r ?? e;
			s.has(i) || (s.add(i), Ue(i, o));
		}
		let i = d.prototype;
		for (let e in i) Object.prototype.hasOwnProperty.call(i, e) && (e in n || (n[e] = i[e].bind(n)));
	}
	let l = r?.Parent ?? Object;
	class u extends l {}
	Object.defineProperty(u, "name", { value: e });
	function d(e) {
		let t = r?.Parent ? it(u) : this;
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
var at = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, ot = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(tt = globalThis).__zod_globalConfig ?? (tt.__zod_globalConfig = {});
var st = globalThis.__zod_globalConfig;
function ct(e) {
	return e && Object.assign(st, e), st;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/errors.js
function lt() {
	let e = this._zod;
	return e.message ??= JSON.stringify(e.def, m, 2), e.message;
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
}, ht = x("$ZodError", mt);
x("$ZodError", mt, void 0, { Parent: Error });
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
		if (s instanceof Promise) throw new at();
		if (s.issues.length) {
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => Re(e, o, ct())));
			throw fe(n, a?.callee ?? t), n;
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
			let n = new ((a?.Err) ?? e)(s.issues.map((e) => Re(e, o, ct())));
			throw fe(n, a?.callee ?? t), n;
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
	if (a instanceof Promise) throw new at();
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
			return r || (r = new e(t.map((e) => Re(e, n, ct()))), t = void 0, n = void 0), r;
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
	}, r), a instanceof Promise) throw new at();
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
var fn = /^[\s\S]{0,}$/, pn = /^-?\d+$/, mn = /^-?\d+(?:\.\d+)?$/, hn = /^(?:true|false)$/i, gn = /^[^A-Z]*$/, _n = /^[^a-z]*$/, vn = /*@__PURE__*/ x("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), yn = (e) => {
	let t = e.value;
	return !ne(t) && t.length !== void 0;
}, bn = {
	number: "number",
	bigint: "bigint",
	object: "date"
}, xn = /*@__PURE__*/ x("$ZodCheckLessThan", (e, t) => {
	vn.init(e, t);
	let n = bn[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
			origin: bn[typeof r.value] ?? n,
			code: "too_big",
			maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Sn = /*@__PURE__*/ x("$ZodCheckGreaterThan", (e, t) => {
	vn.init(e, t);
	let n = bn[typeof t.value];
	e._zod.check = (r) => {
		(t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
			origin: bn[typeof r.value] ?? n,
			code: "too_small",
			minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
			input: r.value,
			inclusive: t.inclusive,
			inst: e,
			continue: !t.abort
		});
	};
}), Cn = /*@__PURE__*/ x("$ZodCheckMultipleOf", (e, t) => {
	vn.init(e, t), e._zod.check = (n) => {
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
}), wn = /*@__PURE__*/ x("$ZodCheckNumberFormat", (e, t) => {
	vn.init(e, t), t.format = t.format || "float64";
	let n = t.format?.includes("int"), r = n ? "int" : "number", [i, a] = Se[t.format];
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
}), Tn = /*@__PURE__*/ x("$ZodCheckMaxLength", (e, t) => {
	var n;
	vn.init(e, t), (n = e._zod.def).when ?? (n.when = yn), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i > t.maximum ? y(r) : i) <= t.maximum) return;
		let a = Be(r);
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
}), En = /*@__PURE__*/ x("$ZodCheckMinLength", (e, t) => {
	var n;
	vn.init(e, t), (n = e._zod.def).when ?? (n.when = yn), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if ((typeof r == "string" && i >= t.minimum && i < t.minimum * 2 ? y(r) : i) >= t.minimum) return;
		let a = Be(r);
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
}), Dn = /*@__PURE__*/ x("$ZodCheckLengthEquals", (e, t) => {
	var n;
	vn.init(e, t), (n = e._zod.def).when ?? (n.when = yn), e._zod.check = (n) => {
		let r = n.value, i = r.length, a = typeof r == "string" && i >= t.length && i <= t.length * 2 ? y(r) : i;
		if (a === t.length) return;
		let o = Be(r), s = a > t.length;
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
}), On = /*@__PURE__*/ x("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	vn.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
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
}), kn = /*@__PURE__*/ x("$ZodCheckRegex", (e, t) => {
	On.init(e, t), e._zod.check = (n) => {
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
}), An = /*@__PURE__*/ x("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= gn, On.init(e, t);
}), jn = /*@__PURE__*/ x("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= _n, On.init(e, t);
}), Mn = /*@__PURE__*/ x("$ZodCheckIncludes", (e, t) => {
	vn.init(e, t);
	let n = ve(t.includes);
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
}), Nn = /*@__PURE__*/ x("$ZodCheckStartsWith", (e, t) => {
	vn.init(e, t);
	let n = RegExp(`^${ve(t.prefix)}.*`);
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
}), Pn = /*@__PURE__*/ x("$ZodCheckEndsWith", (e, t) => {
	vn.init(e, t);
	let n = RegExp(`.*${ve(t.suffix)}$`);
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
}), Fn = /*@__PURE__*/ x("$ZodCheckOverwrite", (e, t) => {
	vn.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), In = class {
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
}, Ln = {
	major: 4,
	minor: 6,
	patch: 5
}, S = /*@__PURE__*/ x("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Ln;
	let r = e._zod.def.checks, i = e._zod.traits.has("$ZodCheck") ? [e, ...r ?? []] : r?.length ? [...r] : [];
	for (let t of i) for (let n of t._zod.onattach) n(e);
	if (i.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (t, n, r) => {
			if (t.memo) return t;
			let i = Ne(t), a;
			for (let o of n) {
				if (o._zod.def.when) {
					if (Pe(t) || !o._zod.def.when(t)) continue;
				} else if (i) continue;
				let n = t.issues.length, s = o._zod.check(t);
				if (s instanceof Promise && r?.async === !1) throw new at();
				if (a || s instanceof Promise) a = (a ?? Promise.resolve()).then(async () => {
					await s, t.issues.length !== n && (Le(t.issues, n, e), i ||= Ne(t, n));
				});
				else {
					if (t.issues.length === n) continue;
					Le(t.issues, n, e), i ||= Ne(t, n);
				}
			}
			return a ? a.then(() => t) : t;
		}, n = (n, r, a) => {
			if (Ne(n)) return n.aborted = !0, n;
			let o = t(r, i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new at();
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
				if (a.async === !1) throw new at();
				return o.then((e) => t(e, i, a));
			}
			return t(o, i, a);
		};
	}
}, {
	get "~standard"() {
		return Ge(this, "~standard", Bn(this));
	},
	set "~standard"(e) {
		We(this, "~standard", e);
	}
}), Rn = (e, t) => e.issues.length ? { issues: e.issues.map((e) => Re(e, t, ct())) } : { value: e.value };
async function zn(e, t) {
	let n = { async: !0 };
	return Rn(await e._zod.run({
		value: t,
		issues: []
	}, n), n);
}
function Bn(e) {
	return {
		validate: (t) => {
			let n = { async: !1 };
			try {
				let r = e._zod.run({
					value: t,
					issues: []
				}, n);
				if (!(r instanceof Promise)) return Rn(r, n);
			} catch {}
			return zn(e, t);
		},
		vendor: "zod",
		version: 1
	};
}
var Vn = /*@__PURE__*/ x("$ZodString", (e, t) => {
	S.init(e, t), e._zod.pattern = t.pattern ?? fn, e._zod.parse = (n, r) => {
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
	On.init(e, t), Vn.init(e, t);
}), Hn = /*@__PURE__*/ x("$ZodGUID", (e, t) => {
	t.pattern ??= Kt, C.init(e, t);
}), Un = /*@__PURE__*/ x("$ZodUUID", (e, t) => {
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
	C.init(e, t);
}), Wn = /*@__PURE__*/ x("$ZodEmail", (e, t) => {
	t.pattern ??= Jt, C.init(e, t);
});
function Gn(e) {
	try {
		return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
	} catch {
		return !1;
	}
}
function Kn(e, t) {
	return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? Gn(e) || 2 : qn(e, t);
}
function qn(e, t) {
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
var Jn = /[\t\n\r]/g;
function Yn(e) {
	return e.replace(Jn, "");
}
function Xn(e, t) {
	return t.lastIndex = 0, t.test(e.hostname);
}
function Zn(e, t) {
	return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
var Qn = /*@__PURE__*/ x("$ZodURL", (e, t) => {
	C.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim(), i = Kn(r, t);
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
				n.value = Yn(r);
				return;
			}
			t.hostname && !Xn(i, t.hostname) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), t.protocol && !Zn(i, t.protocol) && n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			}), n.value = t.normalize ? i.href : Yn(r);
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
}), $n = /*@__PURE__*/ x("$ZodEmoji", (e, t) => {
	t.pattern ??= Xt(), C.init(e, t);
}), er = /*@__PURE__*/ x("$ZodNanoID", (e, t) => {
	if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1)) throw Error(`Invalid nanoid length: ${t.length}`);
	t.pattern ??= t.length === void 0 ? Ut : Wt(t.length), C.init(e, t);
}), tr = /*@__PURE__*/ x("$ZodCUID", (e, t) => {
	t.pattern ??= Rt, C.init(e, t);
}), nr = /*@__PURE__*/ x("$ZodCUID2", (e, t) => {
	t.pattern ??= zt, C.init(e, t);
}), rr = /*@__PURE__*/ x("$ZodULID", (e, t) => {
	t.pattern ??= Bt, C.init(e, t);
}), ir = /*@__PURE__*/ x("$ZodXID", (e, t) => {
	t.pattern ??= Vt, C.init(e, t);
}), ar = /*@__PURE__*/ x("$ZodKSUID", (e, t) => {
	t.pattern ??= Ht, C.init(e, t);
}), or = /*@__PURE__*/ x("$ZodISODateTime", (e, t) => {
	t.pattern ??= dn(t), C.init(e, t);
}), sr = /*@__PURE__*/ x("$ZodISODate", (e, t) => {
	t.pattern ??= cn, C.init(e, t);
}), cr = /*@__PURE__*/ x("$ZodISOTime", (e, t) => {
	t.pattern ??= un(t), C.init(e, t);
}), lr = /*@__PURE__*/ x("$ZodISODuration", (e, t) => {
	t.pattern ??= Gt, C.init(e, t);
}), ur = /*@__PURE__*/ x("$ZodIPv4", (e, t) => {
	t.pattern ??= Zt, C.init(e, t);
}), dr = /^[0-9a-fA-F:.]+$/;
function fr(e) {
	return dr.test(e) ? Gn(`http://[${e}]`) : !1;
}
var pr = /*@__PURE__*/ x("$ZodIPv6", (e, t) => {
	t.pattern ??= Qt, C.init(e, t), e._zod.check = (n) => {
		fr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), mr = /*@__PURE__*/ x("$ZodCIDRv4", (e, t) => {
	t.pattern ??= $t, C.init(e, t);
});
function hr(e) {
	let t = e.split("/");
	if (t.length !== 2) return !1;
	let [n, r] = t;
	if (!r) return !1;
	let i = Number(r);
	return `${i}` !== r || i < 0 || i > 128 ? !1 : fr(n);
}
var gr = /*@__PURE__*/ x("$ZodCIDRv6", (e, t) => {
	t.pattern ??= en, C.init(e, t), e._zod.check = (n) => {
		hr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function _r(e) {
	if (e === "") return !0;
	if (/\s/.test(e) || e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var vr = /^[0-9a-zA-Z+/]*={0,2}$/, yr = /*@__PURE__*/ x("$ZodBase64", (e, t) => {
	t.pattern ??= vr, C.init(e, t), e._zod.check = (n) => {
		_r(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), br = /^[A-Za-z0-9_-]*$/;
function xr(e) {
	if (!br.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return _r(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var Sr = /*@__PURE__*/ x("$ZodBase64URL", (e, t) => {
	t.pattern ??= br, C.init(e, t), e._zod.check = (n) => {
		xr(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Cr = /*@__PURE__*/ x("$ZodE164", (e, t) => {
	t.pattern ??= an, C.init(e, t);
});
function wr(e, t = null) {
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
var Tr = /*@__PURE__*/ x("$ZodJWT", (e, t) => {
	C.init(e, t), e._zod.check = (n) => {
		wr(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Er = /*@__PURE__*/ x("$ZodNumber", (e, t) => {
	S.init(e, t), e._zod.pattern = mn, e._zod.parse = (n, r) => {
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
}), Dr = /*@__PURE__*/ x("$ZodNumberFormat", (e, t) => {
	wn.init(e, t), Er.init(e, t);
}), Or = /*@__PURE__*/ x("$ZodBoolean", (e, t) => {
	S.init(e, t), e._zod.pattern = hn, e._zod.parse = (n, r) => {
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
}), kr = /*@__PURE__*/ x("$ZodUnknown", (e, t) => {
	S.init(e, t), e._zod.parse = (e) => e;
}), Ar = /*@__PURE__*/ x("$ZodNever", (e, t) => {
	S.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function jr(e, t, n) {
	e.issues.length && t.issues.push(...Fe(n, e.issues)), t.value[n] = e.value;
}
var Mr = /*@__PURE__*/ x("$ZodArray", (e, t) => {
	S.init(e, t);
	let n = st.memoizer;
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
			if (c instanceof Promise) o.push(c.then((t) => jr(t, r, e)));
			else if (jr(c, r, e), s && c.issues.length !== 0 && Ne(c)) break;
		}
		return o.length ? Promise.all(o).then(() => r) : r;
	};
});
function Nr(e, t, n, r, i, a) {
	let o = n in r, s = a === "optional";
	if (o || !s || i !== "optional") {
		if (e.issues.length) {
			if (i !== void 0 && s && !o) return;
			t.issues.push(...Fe(n, e.issues));
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
var Pr = [];
function Fr(e) {
	let t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : Pr, i = r.length ? [...t, ...r] : t;
	for (let t of i) if (!e.shape?.[t]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${String(t)}": expected a Zod schema`);
	let a = xe(e.shape);
	return {
		...e,
		allKeys: i,
		symbolKeys: r,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(a)
	};
}
function Ir(e, t, n, r, i, a, o) {
	let s = [], c = i.keySet, l = i.catchall._zod, u = l.def.type, d = l.optin, f = l.optout, p = 0;
	for (let i in t) {
		if (o && n.issues.length !== p) {
			if (Ne(n, p)) break;
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
		a instanceof Promise ? e.push(a.then((e) => Nr(e, n, i, t, d, f))) : Nr(a, n, i, t, d, f);
	}
	return s.length && n.issues.push({
		code: "unrecognized_keys",
		keys: s,
		input: t,
		inst: a,
		continue: !0
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var Lr = /*@__PURE__*/ x("$ZodObject", (e, t) => {
	S.init(e, t);
	let n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
	if (r) {
		let e = () => {
			let n = { ...r };
			return Object.defineProperty(t, "shape", { value: n }), e.raw = n, n;
		};
		e.raw = r, Object.defineProperty(t, "shape", { get: e });
	}
	let i = te(() => Fr(t));
	b(e, "propValues", (e) => {
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
	let a = pe, o = t.catchall, s, c = st.memoizer;
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
				if (Ne(t, f)) break;
				f = t.issues.length;
			}
			if (e === "__proto__") continue;
			let i = u[e], a = i._zod.optin, o = i._zod.optout, s = i._zod.run({
				value: r[e],
				issues: []
			}, n);
			s instanceof Promise ? l.push(s.then((n) => Nr(n, t, e, r, a, o))) : Nr(s, t, e, r, a, o);
		}
		return o ? Ir(l, r, t, n, i.value, e, d === !0) : l.length ? Promise.all(l).then(() => t) : t;
	};
}), Rr = /*@__PURE__*/ x("$ZodObjectJIT", (e, t) => {
	Lr.init(e, t);
	let n = e._zod.parse, r = te(() => Fr(t)), i = st.memoizer, a = (t) => {
		let n = r.value, a = n.symbolKeys, o = new In(["payload", "ctx"], {
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
			let n = l[e], r = typeof e == "symbol" ? `syms[${a.indexOf(e)}]` : _(e), i = `${r} in input`, u = t[e], d = u?._zod?.optin, f = d !== void 0, p = u?._zod?.optout === "optional";
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
	}, o, s = pe, c = !st.jitless, l = c && me.value, u = t.catchall, d;
	e._zod.parse = (i, f) => {
		d ??= r.value;
		let p = i.value;
		return s(p) ? c && l && f?.async === !1 && f.jitless !== !0 ? (o ||= a(t.shape), i = o(i, f), u ? Ir([], p, i, f, d, e, f?.abortEarly === !0) : i) : n(i, f) : (i.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), i);
	};
});
function zr(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !Ne(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => Re(e, r, ct())))
	}), t);
}
var Br = /*@__PURE__*/ x("$ZodUnion", (e, t) => {
	S.init(e, t), b(e, "optin", (e) => e.def.options.some((e) => e._zod.optin === "defaulted") ? "defaulted" : e.def.options.some((e) => e._zod.optin !== void 0) ? "optional" : void 0), b(e, "optout", (e) => e.def.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), b(e, "values", (e) => {
		if (e.def.options.every((e) => e._zod.values)) return new Set(e.def.options.flatMap((e) => Array.from(e._zod.values)));
	}), b(e, "pattern", (e) => {
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
		return a ? Promise.all(o).then((t) => zr(t, r, e, i)) : zr(o, r, e, i);
	};
}), Vr = /*@__PURE__*/ x("$ZodIntersection", (e, t) => {
	S.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => Ur(e, t, n)) : Ur(e, i, a);
	};
});
function Hr(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (he(e) && he(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		Object.prototype.hasOwnProperty.call(i, "__proto__") && delete i.__proto__;
		for (let n of r) {
			if (n === "__proto__") continue;
			let r = Hr(e[n], t[n]);
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
			let i = e[r], a = t[r], o = Hr(i, a);
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
function Ur(e, t, n) {
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
	let c = Hr(t.value, n.value);
	if (!c.valid) {
		if (Ne(e)) return e;
		throw Error(`Unmergable intersection. Error path: ${JSON.stringify(c.mergeErrorPath)}`);
	}
	return e.value = c.data, e;
}
var Wr = /*@__PURE__*/ x("$ZodRecord", (e, t) => {
	S.init(e, t);
	let n = st.memoizer;
	n?.attach(e), e._zod.parse = (r, i) => {
		let a = r.value;
		if (!he(a)) return r.issues.push({
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
						issues: s.issues.map((e) => Re(e, i, ct())),
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
					e.issues.length && r.issues.push(...Fe(n, e.issues)), r.value[l] = e.value;
				})) : (u.issues.length && r.issues.push(...Fe(n, u.issues)), r.value[l] = u.value);
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
						issues: l.issues.map((e) => Re(e, i, ct())),
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
					e.issues.length && r.issues.push(...Fe(n, e.issues)), r.value[u] = e.value;
				})) : (d.issues.length && r.issues.push(...Fe(n, d.issues)), r.value[u] = d.value);
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
}), Gr = /*@__PURE__*/ x("$ZodEnum", (e, t) => {
	S.init(e, t);
	let n = f(t.entries), r = new Set(n);
	e._zod.values = r, b(e, "pattern", (e) => {
		let t = f(e.def.entries).filter((e) => _e.has(typeof e));
		return RegExp(t.length ? `^(${t.map((e) => ve(e.toString())).join("|")})$` : "^[^\\s\\S]$");
	}), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), Kr = /*@__PURE__*/ x("$ZodTransform", (e, t) => {
	S.init(e, t), e._zod.optin = "optional", st.memoizer?.guard(e), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new ot(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n));
		if (i instanceof Promise) throw new at();
		return n.value = i, n;
	};
});
function qr(e, t) {
	return e.value = t.issues.length ? void 0 : t.value, e;
}
var Jr = /*@__PURE__*/ x("$ZodOptional", (e, t) => {
	S.init(e, t), b(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", b(e, "values", (e) => {
		let t = e.def.innerType._zod.values;
		return t ? /* @__PURE__ */ new Set([...t, void 0]) : void 0;
	}), b(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${re(t.source)})?$`) : void 0;
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
}), Yr = /*@__PURE__*/ x("$ZodExactOptional", (e, t) => {
	Jr.init(e, t), b(e, "values", (e) => e.def.innerType._zod.values), b(e, "pattern", (e) => e.def.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), Xr = /*@__PURE__*/ x("$ZodNullable", (e, t) => {
	S.init(e, t), b(e, "optin", (e) => e.def.innerType._zod.optin), b(e, "optout", (e) => e.def.innerType._zod.optout), b(e, "pattern", (e) => {
		let t = e.def.innerType._zod.pattern;
		return t ? RegExp(`^(${re(t.source)}|null)$`) : void 0;
	}), b(e, "values", (e) => e.def.innerType._zod.values ? /* @__PURE__ */ new Set([...e.def.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), Zr = /*@__PURE__*/ x("$ZodDefault", (e, t) => {
	S.init(e, t), e._zod.optin = "defaulted", b(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => Qr(e, t)) : Qr(r, t);
	};
});
function Qr(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var $r = /*@__PURE__*/ x("$ZodPrefault", (e, t) => {
	S.init(e, t), e._zod.optin = "defaulted", b(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), ei = /*@__PURE__*/ x("$ZodNonOptional", (e, t) => {
	S.init(e, t), b(e, "values", (e) => {
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
		error: { issues: t.issues.map((e) => Re(e, r, ct())) },
		input: e.value
	}), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
var ri = /*@__PURE__*/ x("$ZodCatch", (e, t) => {
	S.init(e, t), b(e, "optin", (e) => e.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), b(e, "optout", (e) => e.def.innerType._zod.optout), b(e, "values", (e) => e.def.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run({
			value: e.value,
			issues: []
		}, n);
		return r instanceof Promise ? r.then((r) => ni(e, r, t, n)) : ni(e, r, t, n);
	};
}), ii = /*@__PURE__*/ x("$ZodPipe", (e, t) => {
	S.init(e, t), b(e, "values", (e) => e.def.in._zod.values), b(e, "optin", (e) => e.def.in._zod.optin), b(e, "optout", (e) => e.def.out._zod.optout), b(e, "propValues", (e) => e.def.in._zod.propValues), e._zod.parse = (e, n) => {
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
var oi = /*@__PURE__*/ x("$ZodReadonly", (e, t) => {
	S.init(e, t), b(e, "propValues", (e) => e.def.innerType._zod.propValues), b(e, "values", (e) => e.def.innerType._zod.values), b(e, "optin", (e) => e.def.innerType?._zod?.optin), b(e, "optout", (e) => e.def.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(si) : si(r);
	};
});
function si(e) {
	return e.memo || (e.value = Object.freeze(e.value)), e;
}
var ci = /*@__PURE__*/ x("$ZodCustom", (e, t) => {
	vn.init(e, t), S.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
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
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(He(e));
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
var hi = /*@__PURE__*/ new WeakMap(), gi = 0, _i = 1, vi = 2;
function yi(e, t, n) {
	let r = hi.get(e);
	if (r !== void 0) return r ? vi : gi;
	if (t.has(e)) return vi;
	t.add(e);
	let i = gi, a = (e) => {
		if (i !== vi && e?._zod) {
			let r = yi(e, t, n);
			r > i && (i = r);
		}
	}, o = (e, r) => {
		let i = gi;
		for (let a of Reflect.ownKeys(e)) {
			let o = Object.getOwnPropertyDescriptor(e, a);
			if (r && !o.enumerable) continue;
			let s = o.get ? _i : o.value?._zod ? yi(o.value, t, n) : gi;
			s > i && (i = s);
		}
		return i;
	}, s = (e) => {
		e > i && (i = e);
	}, c = e._zod.def;
	switch (c.type) {
		case "object": {
			let e = oe(c);
			s(e ? o(e, !0) : _i), a(c.catchall);
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
			s(r ? yi(r, t, !1) : _i);
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
	return t.delete(e), bi(e, i);
}
function bi(e, t) {
	return t !== _i && hi.set(e, t === vi), t;
}
function xi(e, t) {
	let n = e.buckets.get(t);
	return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
var Si, Ci = [], wi = {
	alloc(e, t, n) {
		let r = Si;
		if (!r) return n;
		Si = void 0;
		let i = {
			value: n,
			issues: null
		};
		return r.set(t.value, i), Ci.push(i), n;
	},
	guard(e) {
		var t;
		(t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
			let t = e._zod.parse, n = (e, n) => {
				if (n.direction !== "backward" && Ei(n, e.value)) throw new ui();
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
					let i = yi(e, /* @__PURE__ */ new Set(), !1);
					if (i === gi) return e._zod.parse = t, e._zod.run === o && (e._zod.run = t), t(s, c);
					i === vi || r ? n = !0 : r = !0;
				}
				let l = s.value;
				if (!pi(l)) return t(s, c);
				let u = c[di];
				u || (u = {
					buckets: /* @__PURE__ */ new WeakMap(),
					backEdges: void 0
				}, c[di] = u);
				let d;
				i === c ? d = a : (d = xi(u, e), i = c, a = d);
				let f = d.get(l);
				if (f) return s.value = f.value, f.issues ? f.issues.length && s.issues.push(...mi(f.issues)) : (s.memo = !0, u.backEdges ?? (u.backEdges = /* @__PURE__ */ new WeakSet()), u.backEdges.add(f.value)), s;
				Si = d;
				let p = Ci.length, m = t(s, c);
				Si = void 0;
				let ee = Ci.length > p ? Ci.pop() : void 0;
				return m instanceof Promise ? m.then((e) => (ee && (ee.issues = e.issues.length ? mi(e.issues) : fi), e)) : (ee && (ee.issues = m.issues.length ? mi(m.issues) : fi), m);
			};
			e._zod.parse = o, e._zod.run === t && (e._zod.run = o);
		});
	}
};
function Ti() {
	return wi;
}
function Ei(e, t) {
	let n = e[di]?.backEdges;
	return n !== void 0 && pi(t) && n.has(t);
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/locales/en.js
var Di = () => {
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
			case "invalid_type": return `Invalid input: expected ${i(e.expected)}, received ${i(Ve(e.input), e.input)}`;
			case "invalid_value": return e.values.length === 1 ? `Invalid input: expected ${be(e.values[0])}` : `Invalid option: expected one of ${p(e.values, "|")}`;
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
function Oi() {
	return { localeError: Di() };
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/registries.js
var ki, Ai = class {
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
function ji() {
	return new Ai();
}
(ki = globalThis).__zod_globalRegistry ?? (ki.__zod_globalRegistry = ji());
var Mi = globalThis.__zod_globalRegistry;
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/api.js
function Ni(e) {
	return e.checks &&= [...e.checks], e;
}
// @__NO_SIDE_EFFECTS__
function Pi(e, t) {
	return new e(Ni({
		type: "string",
		...v(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function Fi(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ii(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Li(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ri(e, t) {
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
function zi(e, t) {
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
function Bi(e, t) {
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
function Vi(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Hi(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ui(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Wi(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Gi(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ki(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function qi(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Ji(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Yi(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Xi(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Zi(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function Qi(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function $i(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ea(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ta(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function na(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ra(e, t) {
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
function ia(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function aa(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function oa(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function sa(e, t) {
	return new e(Ni({
		type: "number",
		checks: [],
		...v(t)
	}));
}
// @__NO_SIDE_EFFECTS__
function ca(e, t) {
	return new e({
		type: "number",
		check: "number_format",
		abort: !1,
		format: "safeint",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function la(e, t) {
	return new e({
		type: "boolean",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function ua(e) {
	return new e({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function da(e, t) {
	return new e({
		type: "never",
		...v(t)
	});
}
// @__NO_SIDE_EFFECTS__
function fa(e, t) {
	return new xn({
		check: "less_than",
		...v(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function pa(e, t) {
	return new xn({
		check: "less_than",
		...v(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function ma(e, t) {
	return new Sn({
		check: "greater_than",
		...v(t),
		value: e,
		inclusive: !1
	});
}
// @__NO_SIDE_EFFECTS__
function ha(e, t) {
	return new Sn({
		check: "greater_than",
		...v(t),
		value: e,
		inclusive: !0
	});
}
// @__NO_SIDE_EFFECTS__
function ga(e, t) {
	return new Cn({
		check: "multiple_of",
		...v(t),
		value: e
	});
}
// @__NO_SIDE_EFFECTS__
function _a(e, t) {
	return new Tn({
		check: "max_length",
		...v(t),
		maximum: e
	});
}
// @__NO_SIDE_EFFECTS__
function va(e, t) {
	return new En({
		check: "min_length",
		...v(t),
		minimum: e
	});
}
// @__NO_SIDE_EFFECTS__
function ya(e, t) {
	return new Dn({
		check: "length_equals",
		...v(t),
		length: e
	});
}
// @__NO_SIDE_EFFECTS__
function ba(e, t) {
	return new kn({
		check: "string_format",
		format: "regex",
		...v(t),
		pattern: e
	});
}
// @__NO_SIDE_EFFECTS__
function xa(e) {
	return new An({
		check: "string_format",
		format: "lowercase",
		...v(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Sa(e) {
	return new jn({
		check: "string_format",
		format: "uppercase",
		...v(e)
	});
}
// @__NO_SIDE_EFFECTS__
function Ca(e, t) {
	return new Mn({
		check: "string_format",
		format: "includes",
		...v(t),
		includes: e
	});
}
// @__NO_SIDE_EFFECTS__
function wa(e, t) {
	return new Nn({
		check: "string_format",
		format: "starts_with",
		...v(t),
		prefix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ta(e, t) {
	return new Pn({
		check: "string_format",
		format: "ends_with",
		...v(t),
		suffix: e
	});
}
// @__NO_SIDE_EFFECTS__
function Ea(e) {
	return new Fn({
		check: "overwrite",
		tx: e
	});
}
// @__NO_SIDE_EFFECTS__
function Da(e) {
	return /* @__PURE__ */ Ea((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Oa() {
	return /* @__PURE__ */ Ea((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function ka() {
	return /* @__PURE__ */ Ea((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Aa() {
	return /* @__PURE__ */ Ea((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function ja() {
	return /* @__PURE__ */ Ea((e) => de(e));
}
// @__NO_SIDE_EFFECTS__
function Ma(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...v(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Na(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...v(n)
	});
}
// @__NO_SIDE_EFFECTS__
function Pa(e, t) {
	let n = /* @__PURE__ */ Fa((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(He(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", "input" in r || (r.input = t.value), r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(He(r));
		}
	}, e(t.value, t)), t);
	return n;
}
// @__NO_SIDE_EFFECTS__
function Fa(e, t) {
	let n = new vn({
		check: "custom",
		...v(t)
	});
	return n._zod.check = e, n;
}
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/core/to-json-schema.js
function Ia(e, ...t) {
	for (let n of t) for (let t of Reflect.ownKeys(n)) Object.prototype.propertyIsEnumerable.call(n, t) && ae(e, t, n[t]);
	return e;
}
function La(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? Mi,
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
function Ra(e, t, n, r, i) {
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
	return c && Ia(o.schema, c), t.io === "input" && T(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function za(e) {
	return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function Ba(e, t) {
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
				ref: `${i("__shared")}#/${r}/${za(a)}`
			};
		}
		let i = `#/${r}/`;
		if (t[1] === n && !t[1].schema.id) return { ref: "#" };
		let a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + za(a)
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
function Va(e) {
	let t = e.anyOf;
	if (!Array.isArray(t) || t.length === 0 || e.type !== void 0) return;
	let n = [];
	for (let e of t) {
		if (!e || typeof e != "object") return;
		Va(e);
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
var Ha = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]), Ua = ["oneOf", "anyOf"];
function Wa(e) {
	let t = e.additionalProperties;
	return t === void 0 || t === !1 || typeof t != "object" || !t ? null : Object.keys(t).length ? t : null;
}
function Ga(e) {
	let t = [];
	for (let n of e) {
		if (typeof n != "object" || n.type !== "object") return null;
		for (let e in n) if (!Ha.has(e)) return null;
		t.push(n);
	}
	let n = {}, r = /* @__PURE__ */ new Set();
	for (let e of t) {
		for (let r in e.properties) {
			if (Object.prototype.hasOwnProperty.call(n, r)) continue;
			let e = [];
			for (let n of t) {
				let t = n.properties?.[r] ?? Wa(n);
				t != null && (e.some((e) => JSON.stringify(e) === JSON.stringify(t)) || e.push(t));
			}
			ae(n, r, e.length === 1 ? e[0] : Ga(e) ?? { allOf: e });
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
			let t = Wa(n);
			t && !e.some((e) => JSON.stringify(e) === JSON.stringify(t)) && e.push(t);
		}
		e.length === 1 ? i.additionalProperties = e[0] : e.length > 1 && (i.additionalProperties = { allOf: e });
	}
	return i;
}
function Ka(e) {
	let t = e.allOf;
	if (!Array.isArray(t) || t.length < 2) return;
	for (let t of Ha) if (t in e) return;
	let n = t.filter((e) => Ua.some((t) => Array.isArray(e[t]))), r = null;
	if (!n.length) r = Ga(t);
	else {
		let e = n[0], i = Ua.find((t) => Array.isArray(e[t]));
		if (Object.keys(e).length !== 1) return;
		let a = t.filter((t) => t !== e), o = e[i].map((e) => Ga([...a, e]));
		if (o.some((e) => !e)) return;
		r = { [i]: o };
	}
	r && (delete e.allOf, Ia(e, r));
}
function qa(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : Ia(i, s), Ia(i, a), t._zod.parent === o) for (let e in i) e !== "$ref" && e !== "allOf" && (e in a || delete i[e]);
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
		if (e.target !== "openapi-3.0") for (let t of e.seen.entries()) Va(t[1].def ?? t[1].schema);
		for (let t of e.deferred) t();
		if (e.intersections.length) {
			let t = /* @__PURE__ */ new Map();
			for (let n of e.seen.values()) for (let e of [n.schema, n.def]) {
				let n = e?.allOf;
				if (!Array.isArray(n)) continue;
				let r = t.get(n);
				r ? r.push(e) : t.set(n, [e]);
			}
			for (let n of e.intersections) for (let e of t.get(n) ?? []) Ka(e);
		}
	}
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	Ia(i, n.defId ? n.schema : n.def ?? n.schema);
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
					input: Ya(t, "input", e.processors),
					output: Ya(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function T(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return T(r.element, n);
	if (r.type === "set") return T(r.valueType, n);
	if (r.type === "lazy") return T(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch") return T(r.innerType, n);
	if (r.type === "intersection") return T(r.left, n) || T(r.right, n);
	if (r.type === "record" || r.type === "map") return T(r.keyType, n) || T(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : T(r.in, n) || T(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (T(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (T(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (T(e, n)) return !0;
		return !!(r.rest && T(r.rest, n));
	}
	return !1;
}
var Ja = (e, t = {}) => (n) => {
	let r = La({
		...n,
		processors: t
	});
	return w(e, r), Ba(r, e), qa(r, e);
}, Ya = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = La({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return w(e, o), Ba(o, e), qa(o, e);
}, Xa = (e, t, n) => {
	(e[t] === void 0 || n > e[t]) && (e[t] = n);
}, Za = (e, t, n) => {
	(e[t] === void 0 || n < e[t]) && (e[t] = n);
}, Qa = (e, t) => {
	Xa(e, "minimum", t), Za(e, "maximum", t);
}, $a = (e, t) => {
	e.multipleOf ??= [], e.multipleOf.includes(t) || e.multipleOf.push(t);
}, eo = (e, t) => {
	e.patterns ??= /* @__PURE__ */ new Set(), e.patterns.add(t);
}, to = (e, t) => {
	e.mime = e.mime ? e.mime.filter((e) => t.includes(e)) : [...t];
}, no = (e, t) => {
	e.format = t, t.includes("int") && (e.isInt = !0);
}, ro = (e, t) => Xa(e, "minimum", t.minimum), io = (e, t) => Za(e, "maximum", t.maximum), ao = (e) => (t, n) => {
	no(t, n.format);
	let [r, i] = e[n.format];
	Xa(t, "minimum", r), Za(t, "maximum", i);
}, oo = {
	greater_than: (e, t) => Xa(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
	less_than: (e, t) => Za(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
	multiple_of: (e, t) => $a(e, t.value),
	number_format: ao(Se),
	bigint_format: ao(Ce),
	min_length: ro,
	max_length: io,
	length_equals: (e, t) => Qa(e, t.length),
	min_size: ro,
	max_size: io,
	size_equals: (e, t) => Qa(e, t.size),
	string_format: (e, t) => {
		no(e, t.format), t.pattern && eo(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
	},
	mime_type: (e, t) => to(e, t.mime)
};
function so(e) {
	let t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
	for (let e of r) oo[e._zod.def.check]?.(t, e._zod.def);
	let i = e._zod.bag;
	i.minimum !== void 0 && Xa(t, "minimum", i.minimum), i.exclusiveMinimum !== void 0 && Xa(t, "exclusiveMinimum", i.exclusiveMinimum), i.maximum !== void 0 && Za(t, "maximum", i.maximum), i.exclusiveMaximum !== void 0 && Za(t, "exclusiveMaximum", i.exclusiveMaximum), i.multipleOf !== void 0 && $a(t, i.multipleOf), i.format !== void 0 && (t.format ??= i.format, i.format.includes("int") && (t.isInt = !0)), i.mime && to(t, i.mime);
	for (let e of i.patterns ?? []) eo(t, e);
	return t;
}
var co = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, lo = /* @__PURE__ */ new Map([[vr, tn], [br, nn]]), uo = (e) => lo.get(e) ?? e, fo = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l, laxFormat: u } = so(e);
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = co[s] ?? s, i.format === "" && delete i.format, (s === "time" || u) && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c].map(uo);
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, po = (e, t, n, r) => {
	let i = n, { minimum: a, maximum: o, multipleOf: s, exclusiveMaximum: c, exclusiveMinimum: l, isInt: u } = so(e);
	i.type = u ? "integer" : "number";
	let d = typeof l == "number" && l >= (a ?? -Infinity), f = typeof c == "number" && c <= (o ?? Infinity), p = t.target === "draft-04" || t.target === "openapi-3.0";
	if (d ? p ? (i.minimum = l, i.exclusiveMinimum = !0) : i.exclusiveMinimum = l : typeof a == "number" && (i.minimum = a), f ? p ? (i.maximum = c, i.exclusiveMaximum = !0) : i.exclusiveMaximum = c : typeof o == "number" && (i.maximum = o), s) {
		let n = /* @__PURE__ */ new Set();
		for (let a of s) Number.isFinite(a) && a !== 0 ? n.add(Math.abs(a)) : Ra(e, t, i, r, `A multipleOf divisor of ${a} cannot be represented in JSON Schema`);
		let [a, ...o] = n;
		a !== void 0 && (i.multipleOf = a), o.length && (i.allOf = [...i.allOf ?? [], ...o.map((e) => ({ multipleOf: e }))]);
	}
}, mo = (e, t, n, r) => {
	n.type = "boolean";
}, ho = (e, t, n, r) => {
	n.not = {};
}, go = (e, t, n, r) => {
	let i = e._zod.def, a = f(i.entries);
	if (a.length === 0) {
		n.not = {};
		return;
	}
	a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a;
}, _o = (e, t, n, r) => {
	Ra(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, vo = (e, t, n, r) => {
	Ra(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, yo = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = so(e);
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = w(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
};
function bo(e) {
	let t = e._zod.def;
	return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? bo(t.out) : t.type === "catch" ? bo(t.innerType) : e._zod.optin;
}
var xo = (e, t, n, r) => {
	let i = n, a = e._zod.def, o = a.shape;
	if (Object.getOwnPropertySymbols(o).length && Ra(e, t, i, r, "Symbol keys cannot be represented in JSON Schema")) return;
	i.type = "object", i.properties = {};
	for (let e in o) ae(i.properties, e, w(o[e], t, {
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
		(t.io === "input" ? bo(n) === void 0 : n._zod.optout === void 0) && s.push(e);
	}
	s.length > 0 && (i.required = s), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = w(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, So = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => w(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, Co = (e, t, n, r) => {
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
function wo(e, t, n) {
	if (t.$ref) {
		if (n.has(t)) return t;
		n.add(t);
		let r = e.get(t)?.def;
		if (!r) return t;
		let i = wo(e, r, n);
		return i === r ? t : i;
	}
	for (let r of ["anyOf", "oneOf"]) {
		let i = t[r];
		if (!Array.isArray(i)) continue;
		let a = i.map((t) => wo(e, t, n));
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
var To = /* @__PURE__ */ new WeakMap();
function Eo(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.seen.values()) n.def && !t.has(n.schema) && t.set(n.schema, n);
	let n = /* @__PURE__ */ new Map();
	for (let r of To.get(e) ?? []) {
		let i = e.seen.get(r), a = (i?.def ?? i?.schema)?.propertyNames;
		if (!a || a === !0 || n.has(a)) continue;
		let o = wo(t, a, /* @__PURE__ */ new Set());
		o !== a && n.set(a, o);
	}
	if (n.size) for (let t of e.seen.values()) for (let e of [t.schema, t.def]) {
		let t = e && n.get(e.propertyNames);
		t && (e.propertyNames = t);
	}
}
var Do = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object";
	let o = a.keyType, s = so(o).patterns;
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
		for (let t of s) ae(i.patternProperties, uo(t).source, e);
	} else {
		if (t.target === "draft-07" || t.target === "draft-2020-12") {
			i.propertyNames = w(a.keyType, t, {
				...r,
				path: [...r.path, "propertyNames"]
			});
			let n = To.get(t);
			n || (n = [], To.set(t, n), t.deferred.push(() => Eo(t))), n.push(e);
		}
		i.additionalProperties = w(a.valueType, t, {
			...r,
			path: [...r.path, "additionalProperties"]
		});
	}
	let c = o._zod.values, l = t.io === "input" && bo(a.valueType) !== void 0;
	if (c && !a.partial && !l) {
		let e = [...c].filter((e) => typeof e == "string" || typeof e == "number");
		e.length > 0 && (i.required = e.map(String));
	}
}, Oo = (e, t, n, r) => {
	let i = e._zod.def, a = w(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, ko = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Ao = Symbol();
function jo(e, t, n, r, i) {
	let a = !1, o = JSON.stringify(e, (e, t) => typeof t == "bigint" ? (a = !0, null) : t);
	return a ? (Ra(t, n, r, i, "BigInt defaults cannot be represented in JSON Schema"), Ao) : JSON.parse(o);
}
var Mo = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o = jo(i.defaultValue, e, t, n, r);
	o !== Ao && (n.default = o);
}, No = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	if (a.ref = i.innerType, t.io !== "input") return;
	let o = jo(i.defaultValue, e, t, n, r);
	o !== Ao && (n._prefault = o);
}, Po = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		Ra(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	n.default = o;
}, Fo = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	w(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, Io = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, Lo = (e, t, n, r) => {
	let i = e._zod.def;
	w(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Ro = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function zo(e, t, n) {
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
var Bo = /*@__PURE__*/ x("ZodError", (e, t) => {
	ht.init(e, t), e.name = "ZodError";
	let n = Object.getPrototypeOf(e);
	Ro.has(n) || (Ro.add(n), zo(n, "format", (e) => (t) => vt(e, t)), zo(n, "flatten", (e) => (t) => _t(e, t)), zo(n, "addIssue", (e) => (t) => {
		e.issues.push(t), e.message = JSON.stringify(e.issues, m, 2);
	}), zo(n, "addIssues", (e) => (t) => {
		e.issues.push(...t), e.message = JSON.stringify(e.issues, m, 2);
	}), Object.defineProperty(n, "isEmpty", {
		configurable: !0,
		enumerable: !1,
		get() {
			return this.issues.length === 0;
		}
	}));
}, void 0, { Parent: Error }), Vo = /* @__PURE__ */ bt(Bo), Ho = /* @__PURE__ */ xt(Bo), Uo = /* @__PURE__ */ St(Bo), Wo = /* @__PURE__ */ wt(Bo), Go = /* @__PURE__ */ At(Bo), Ko = /* @__PURE__ */ jt(Bo), qo = /* @__PURE__ */ Mt(Bo), Jo = /* @__PURE__ */ Nt(Bo), Yo = /* @__PURE__ */ Pt(Bo), Xo = /* @__PURE__ */ Ft(Bo), Zo = /* @__PURE__ */ It(Bo), Qo = /* @__PURE__ */ Lt(Bo);
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/schemas.js
function $o() {
	st.localeError || ct(Oi());
}
function es() {
	st.memoizer || ct({ memoizer: Ti() });
}
var E = /*@__PURE__*/ x("ZodType", (e, t) => ($o(), S.init(e, t), e.def = t, e.type = t.type, e), {
	check(...e) {
		let t = this.def;
		return this.clone(g(t, { checks: [...t.checks ?? [], ...e.map((e) => typeof e == "function" ? { _zod: {
			check: e,
			def: { check: "custom" },
			onattach: []
		} } : e)] }), { parent: !0 });
	},
	with(...e) {
		return this.check(...e);
	},
	clone(e, t) {
		return ye(this, e, t);
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
		return this.check(/* @__PURE__ */ Ea(e));
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
		return Ls(this);
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
		return Mi.add(t, { description: e }), t;
	},
	meta(...e) {
		if (e.length === 0) return Mi.get(this);
		let t = this.clone();
		return Mi.add(t, e[0]), t;
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
		return Ge(this, "~standard", {
			...Bn(this),
			jsonSchema: {
				input: Ya(this, "input"),
				output: Ya(this, "output")
			}
		});
	},
	set "~standard"(e) {
		We(this, "~standard", e);
	},
	parse: function e(t, n) {
		return Vo(this, t, n, { callee: e });
	},
	parseAsync: async function e(t, n) {
		return await Ho(this, t, n, { callee: e });
	},
	safeParse(e, t) {
		return Uo(this, e, t);
	},
	async safeParseAsync(e, t) {
		return Wo(this, e, t);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(e) {
		We(this, "spa", e);
	},
	validate(e, t) {
		return Dt(this, e, t);
	},
	validateAsync(e, t) {
		return kt(this, e, t);
	},
	encode: function e(t, n) {
		return Go(this, t, n, { callee: e });
	},
	decode: function e(t, n) {
		return Ko(this, t, n, { callee: e });
	},
	encodeAsync: async function e(t, n) {
		return await qo(this, t, n, { callee: e });
	},
	decodeAsync: async function e(t, n) {
		return await Jo(this, t, n, { callee: e });
	},
	safeEncode(e, t) {
		return Yo(this, e, t);
	},
	safeDecode(e, t) {
		return Xo(this, e, t);
	},
	async safeEncodeAsync(e, t) {
		return Zo(this, e, t);
	},
	async safeDecodeAsync(e, t) {
		return Qo(this, e, t);
	},
	toJSONSchema(e) {
		return Ja(this, {})(e);
	},
	get description() {
		return Mi.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
}), ts = /*@__PURE__*/ x("_ZodString", (e, t) => {
	Vn.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => fo(e, t, n, r);
}, /*@__PURE__*/ Ke({
	format: (e) => so(e).format ?? null,
	minLength: (e) => so(e).minimum ?? null,
	maxLength: (e) => so(e).maximum ?? null
}, {
	regex(...e) {
		return this.check(/* @__PURE__ */ ba(...e));
	},
	includes(...e) {
		return this.check(/* @__PURE__ */ Ca(...e));
	},
	startsWith(...e) {
		return this.check(/* @__PURE__ */ wa(...e));
	},
	endsWith(...e) {
		return this.check(/* @__PURE__ */ Ta(...e));
	},
	min(...e) {
		return this.check(/* @__PURE__ */ va(...e));
	},
	max(...e) {
		return this.check(/* @__PURE__ */ _a(...e));
	},
	length(...e) {
		return this.check(/* @__PURE__ */ ya(...e));
	},
	nonempty(...e) {
		return this.check(/* @__PURE__ */ va(1, ...e));
	},
	lowercase(e) {
		return this.check(/* @__PURE__ */ xa(e));
	},
	uppercase(e) {
		return this.check(/* @__PURE__ */ Sa(e));
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
})), ns = /*@__PURE__*/ x("ZodString", (e, t) => {
	Vn.init(e, t), ts.init(e, t);
}, {
	email(e) {
		return this.check(/* @__PURE__ */ Fi(ss, e));
	},
	url(e) {
		return this.check(/* @__PURE__ */ Vi(us, e));
	},
	jwt(e) {
		return this.check(/* @__PURE__ */ na(Ts, e));
	},
	emoji(e) {
		return this.check(/* @__PURE__ */ Hi(ds, e));
	},
	guid(e) {
		return this.check(/* @__PURE__ */ Ii(cs, e));
	},
	uuid(e) {
		return this.check(/* @__PURE__ */ Li(ls, e));
	},
	uuidv4(e) {
		return this.check(/* @__PURE__ */ Ri(ls, e));
	},
	uuidv6(e) {
		return this.check(/* @__PURE__ */ zi(ls, e));
	},
	uuidv7(e) {
		return this.check(/* @__PURE__ */ Bi(ls, e));
	},
	nanoid(e) {
		return this.check(/* @__PURE__ */ Ui(fs, e));
	},
	cuid(e) {
		return this.check(/* @__PURE__ */ Wi(ps, e));
	},
	cuid2(e) {
		return this.check(/* @__PURE__ */ Gi(ms, e));
	},
	ulid(e) {
		return this.check(/* @__PURE__ */ Ki(hs, e));
	},
	base64(e) {
		return this.check(/* @__PURE__ */ $i(Ss, e));
	},
	base64url(e) {
		return this.check(/* @__PURE__ */ ea(Cs, e));
	},
	xid(e) {
		return this.check(/* @__PURE__ */ qi(gs, e));
	},
	ksuid(e) {
		return this.check(/* @__PURE__ */ Ji(_s, e));
	},
	ipv4(e) {
		return this.check(/* @__PURE__ */ Yi(vs, e));
	},
	ipv6(e) {
		return this.check(/* @__PURE__ */ Xi(ys, e));
	},
	cidrv4(e) {
		return this.check(/* @__PURE__ */ Zi(bs, e));
	},
	cidrv6(e) {
		return this.check(/* @__PURE__ */ Qi(xs, e));
	},
	e164(e) {
		return this.check(/* @__PURE__ */ ta(ws, e));
	},
	datetime(e) {
		return this.check(/* @__PURE__ */ ra(rs, e));
	},
	date(e) {
		return this.check(/* @__PURE__ */ ia(is, e));
	},
	time(e) {
		return this.check(/* @__PURE__ */ aa(as, e));
	},
	duration(e) {
		return this.check(/* @__PURE__ */ oa(os, e));
	}
});
function D(e) {
	return /* @__PURE__ */ Pi(ns, e);
}
var O = /*@__PURE__*/ x("ZodStringFormat", (e, t) => {
	C.init(e, t), ts.init(e, t);
}), rs = /*@__PURE__*/ x("ZodISODateTime", (e, t) => {
	or.init(e, t), O.init(e, t);
}), is = /*@__PURE__*/ x("ZodISODate", (e, t) => {
	sr.init(e, t), O.init(e, t);
}), as = /*@__PURE__*/ x("ZodISOTime", (e, t) => {
	cr.init(e, t), O.init(e, t);
}), os = /*@__PURE__*/ x("ZodISODuration", (e, t) => {
	lr.init(e, t), O.init(e, t);
}), ss = /*@__PURE__*/ x("ZodEmail", (e, t) => {
	Wn.init(e, t), O.init(e, t);
}), cs = /*@__PURE__*/ x("ZodGUID", (e, t) => {
	Hn.init(e, t), O.init(e, t);
}), ls = /*@__PURE__*/ x("ZodUUID", (e, t) => {
	Un.init(e, t), O.init(e, t);
}), us = /*@__PURE__*/ x("ZodURL", (e, t) => {
	Qn.init(e, t), O.init(e, t);
}), ds = /*@__PURE__*/ x("ZodEmoji", (e, t) => {
	$n.init(e, t), O.init(e, t);
}), fs = /*@__PURE__*/ x("ZodNanoID", (e, t) => {
	er.init(e, t), O.init(e, t);
}), ps = /*@__PURE__*/ x("ZodCUID", (e, t) => {
	tr.init(e, t), O.init(e, t);
}), ms = /*@__PURE__*/ x("ZodCUID2", (e, t) => {
	nr.init(e, t), O.init(e, t);
}), hs = /*@__PURE__*/ x("ZodULID", (e, t) => {
	rr.init(e, t), O.init(e, t);
}), gs = /*@__PURE__*/ x("ZodXID", (e, t) => {
	ir.init(e, t), O.init(e, t);
}), _s = /*@__PURE__*/ x("ZodKSUID", (e, t) => {
	ar.init(e, t), O.init(e, t);
}), vs = /*@__PURE__*/ x("ZodIPv4", (e, t) => {
	ur.init(e, t), O.init(e, t);
}), ys = /*@__PURE__*/ x("ZodIPv6", (e, t) => {
	pr.init(e, t), O.init(e, t);
}), bs = /*@__PURE__*/ x("ZodCIDRv4", (e, t) => {
	mr.init(e, t), O.init(e, t);
}), xs = /*@__PURE__*/ x("ZodCIDRv6", (e, t) => {
	gr.init(e, t), O.init(e, t);
}), Ss = /*@__PURE__*/ x("ZodBase64", (e, t) => {
	yr.init(e, t), O.init(e, t);
}), Cs = /*@__PURE__*/ x("ZodBase64URL", (e, t) => {
	Sr.init(e, t), O.init(e, t);
}), ws = /*@__PURE__*/ x("ZodE164", (e, t) => {
	Cr.init(e, t), O.init(e, t);
}), Ts = /*@__PURE__*/ x("ZodJWT", (e, t) => {
	Tr.init(e, t), O.init(e, t);
}), Es = /*@__PURE__*/ x("ZodNumber", (e, t) => {
	Er.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => po(e, t, n, r), e.isFinite = !0;
}, /*@__PURE__*/ Ke({
	minValue: (e) => {
		let { minimum: t, exclusiveMinimum: n } = so(e);
		return Math.max(t ?? -Infinity, n ?? -Infinity);
	},
	maxValue: (e) => {
		let { maximum: t, exclusiveMaximum: n } = so(e);
		return Math.min(t ?? Infinity, n ?? Infinity);
	},
	isInt: (e) => {
		let { isInt: t, multipleOf: n } = so(e);
		return !!t || !!n?.some(Number.isSafeInteger);
	},
	format: (e) => so(e).format ?? null
}, {
	gt(e, t) {
		return this.check(/* @__PURE__ */ ma(e, t));
	},
	gte(e, t) {
		return this.check(/* @__PURE__ */ ha(e, t));
	},
	min(e, t) {
		return this.check(/* @__PURE__ */ ha(e, t));
	},
	lt(e, t) {
		return this.check(/* @__PURE__ */ fa(e, t));
	},
	lte(e, t) {
		return this.check(/* @__PURE__ */ pa(e, t));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ pa(e, t));
	},
	int(e) {
		return this.check(ks(e));
	},
	safe(e) {
		return this.check(ks(e));
	},
	positive(e) {
		return this.check(/* @__PURE__ */ ma(0, e));
	},
	nonnegative(e) {
		return this.check(/* @__PURE__ */ ha(0, e));
	},
	negative(e) {
		return this.check(/* @__PURE__ */ fa(0, e));
	},
	nonpositive(e) {
		return this.check(/* @__PURE__ */ pa(0, e));
	},
	multipleOf(e, t) {
		return this.check(/* @__PURE__ */ ga(e, t));
	},
	step(e, t) {
		return this.check(/* @__PURE__ */ ga(e, t));
	},
	finite() {
		return this;
	}
}));
function Ds(e) {
	return /* @__PURE__ */ sa(Es, e);
}
var Os = /*@__PURE__*/ x("ZodNumberFormat", (e, t) => {
	Dr.init(e, t), Es.init(e, t);
});
function ks(e) {
	return /* @__PURE__ */ ca(Os, e);
}
var As = /*@__PURE__*/ x("ZodBoolean", (e, t) => {
	Or.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => mo(e, t, n, r);
});
function js(e) {
	return /* @__PURE__ */ la(As, e);
}
var Ms = /*@__PURE__*/ x("ZodUnknown", (e, t) => {
	kr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function Ns() {
	return /* @__PURE__ */ ua(Ms);
}
var Ps = /*@__PURE__*/ x("ZodNever", (e, t) => {
	Ar.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => ho(e, t, n, r);
});
function Fs(e) {
	return /* @__PURE__ */ da(Ps, e);
}
var Is = /*@__PURE__*/ x("ZodArray", (e, t) => {
	es(), Mr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => yo(e, t, n, r), e.element = t.element;
}, {
	min(e, t) {
		return this.check(/* @__PURE__ */ va(e, t));
	},
	nonempty(e) {
		return this.check(/* @__PURE__ */ va(1, e));
	},
	max(e, t) {
		return this.check(/* @__PURE__ */ _a(e, t));
	},
	length(e, t) {
		return this.check(/* @__PURE__ */ ya(e, t));
	},
	unwrap() {
		return this.element;
	}
});
function Ls(e, t) {
	return /* @__PURE__ */ Ma(Is, e, t);
}
var Rs = /*@__PURE__*/ x("ZodObject", (e, t) => {
	es(), Rr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => xo(e, t, n, r), Qe(e, "shape", (e) => e._zod.def.shape, !1);
}, {
	keyof() {
		return qs(Object.keys(this._zod.def.shape));
	},
	catchall(e) {
		return this.clone(g(this._zod.def, { catchall: e }));
	},
	passthrough() {
		return this.clone(g(this._zod.def, { catchall: Ns() }));
	},
	loose() {
		return this.clone(g(this._zod.def, { catchall: Ns() }));
	},
	strict() {
		return this.clone(g(this._zod.def, { catchall: Fs() }));
	},
	strip() {
		return this.clone(g(this._zod.def, { catchall: void 0 }));
	},
	extend(e) {
		return De(this, e);
	},
	safeExtend(e) {
		return ke(this, e);
	},
	merge(e) {
		return Ae(this, e);
	},
	pick(e) {
		return we(this, e);
	},
	omit(e) {
		return Ee(this, e);
	},
	partial(...e) {
		return je(Xs, this, e[0]);
	},
	exactPartial(...e) {
		return je(Qs, this, e[0], "exactPartial");
	},
	required(...e) {
		return Me(oc, this, e[0]);
	}
});
function zs(e, t) {
	return new Rs({
		type: "object",
		shape: e ?? {},
		...v(t)
	});
}
var Bs = /*@__PURE__*/ x("ZodUnion", (e, t) => {
	Br.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => So(e, t, n, r), e.options = t.options;
});
function Vs(e, t) {
	return new Bs({
		type: "union",
		options: e,
		...v(t)
	});
}
var Hs = /*@__PURE__*/ x("ZodIntersection", (e, t) => {
	Vr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Co(e, t, n, r);
});
function Us(e, t) {
	return new Hs({
		type: "intersection",
		left: e,
		right: t
	});
}
var Ws = /*@__PURE__*/ x("ZodRecord", (e, t) => {
	es(), Wr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Do(e, t, n, r), e.keyType = t.keyType, e.valueType = t.valueType;
});
function Gs(e, t, n) {
	return !t || !t._zod ? new Ws({
		type: "record",
		keyType: D(),
		valueType: e,
		...v(t)
	}) : new Ws({
		type: "record",
		keyType: e,
		valueType: t,
		...v(n)
	});
}
var Ks = /*@__PURE__*/ x("ZodEnum", (e, t) => {
	Gr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => go(e, t, n, r), e.enum = t.entries, e.options = [...e._zod.values];
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new Ks({
			...t,
			checks: [],
			...v(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new Ks({
			...t,
			checks: [],
			...v(r),
			entries: i
		});
	};
});
function qs(e, t) {
	return new Ks({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...v(t)
	});
}
var Js = /*@__PURE__*/ x("ZodTransform", (e, t) => {
	es(), Kr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => vo(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new ot(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(He(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", "input" in t || (t.input = n.value), t.inst ??= e, n.issues.push(He(t));
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
var Xs = /*@__PURE__*/ x("ZodOptional", (e, t) => {
	Jr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Lo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Zs(e) {
	return new Xs({
		type: "optional",
		innerType: e
	});
}
var Qs = /*@__PURE__*/ x("ZodExactOptional", (e, t) => {
	Yr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Lo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function $s(e) {
	return new Qs({
		type: "optional",
		innerType: e
	});
}
var ec = /*@__PURE__*/ x("ZodNullable", (e, t) => {
	Xr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Oo(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function tc(e) {
	return new ec({
		type: "nullable",
		innerType: e
	});
}
var nc = /*@__PURE__*/ x("ZodDefault", (e, t) => {
	Zr.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Mo(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function rc(e, t) {
	return new nc({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : ge(t);
		}
	});
}
var ic = /*@__PURE__*/ x("ZodPrefault", (e, t) => {
	$r.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => No(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function ac(e, t) {
	return new ic({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : ge(t);
		}
	});
}
var oc = /*@__PURE__*/ x("ZodNonOptional", (e, t) => {
	ei.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => ko(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function sc(e, t) {
	return new oc({
		type: "nonoptional",
		innerType: e,
		...v(t)
	});
}
var cc = /*@__PURE__*/ x("ZodCatch", (e, t) => {
	ri.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Po(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function lc(e, t) {
	return new cc({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : et(t)
	});
}
var uc = /*@__PURE__*/ x("ZodPipe", (e, t) => {
	ii.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Fo(e, t, n, r), e.in = t.in, e.out = t.out;
});
function dc(e, t) {
	return new uc({
		type: "pipe",
		in: e,
		out: t
	});
}
var fc = /*@__PURE__*/ x("ZodReadonly", (e, t) => {
	oi.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => Io(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function pc(e) {
	return new fc({
		type: "readonly",
		innerType: e
	});
}
var mc = /*@__PURE__*/ x("ZodCustom", (e, t) => {
	ci.init(e, t), E.init(e, t), e._zod.processJSONSchema = (t, n, r) => _o(e, t, n, r);
});
function hc(e, t = {}) {
	return /* @__PURE__ */ Na(mc, e, t);
}
function gc(e, t) {
	return /* @__PURE__ */ Pa(e, t);
}
d();
var k = [
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
function A(e) {
	return k.find((t) => t.id === e);
}
function _c(e, t) {
	return A(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var vc = /* @__PURE__ */ new Set(), yc = "2026-01-01T00:00:00.000Z", bc = k.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: yc,
	updatedAt: yc
}));
function xc() {
	vc.forEach((e) => e());
}
var Sc = {
	ensureProductPolicy(e, t, n) {
		let r = bc.find((t) => t.productId === e), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			productId: e,
			baseUnitId: t,
			active: r?.active ?? n,
			costingMethod: "MOVING_WEIGHTED_AVERAGE",
			createdAt: r?.createdAt ?? i,
			updatedAt: i
		};
		return bc = [...bc.filter((t) => t.productId !== e), a], xc(), a;
	},
	subscribe(e) {
		return vc.add(e), () => {
			vc.delete(e);
		};
	},
	getSnapshot() {
		return bc;
	},
	getAll() {
		return bc;
	},
	getByProductId(e) {
		return bc.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = Sc.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		let n = {
			...Sc.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return bc = bc.map((t) => t.productId === e ? n : t), xc(), n;
	}
};
r("costingPolicies", {
	repository: Sc,
	read: "inventory.read",
	commands: {
		ensureProductPolicy: null,
		setActive: "inventory.adjust"
	},
	snapshot: () => ({ policies: bc }),
	restore: (e) => {
		bc = e.policies;
	},
	publish: () => vc.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/configurationState.ts
var j = {}, Cc = (e) => j["linked-accounts"]?.find((t) => t.status === "Active" && t.role === e)?.accountId;
function wc(e = "GST") {
	let t = j["tax-codes"]?.find((t) => t.status === "Active" && t.code === e);
	if (!t) {
		if (!j["tax-codes"] && e === "GST") return .1;
		throw Error(`Active tax code ${e} was not found.`);
	}
	return Number(t.rate) / 100;
}
function Tc(e) {
	let t = Date.parse(e.at.length === 10 ? e.at + "T00:00:00Z" : e.at), n = (j.promotions ?? []).filter((n) => n.status === "Active" && n.productId === e.productId && n.unitId === e.unitId && (!n.customerId || n.customerId === e.customerId) && Date.parse(n.starts) <= t && t < Date.parse(n.ends));
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
function Ec(e) {
	return (j["linked-accounts"] ?? []).some((t) => t.status === "Active" && t.accountId === e);
}
//#endregion
//#region src/features/business-workspace/productRepository.ts
var Dc = zs({
	id: D().min(1),
	code: qs([
		"M2",
		"LM",
		"BOX",
		"PIECE",
		"ROLL",
		"BUCKET"
	]),
	name: D().trim().min(1),
	symbol: D().min(1),
	conversionToBase: Ds().finite().positive(),
	basePrice: Ds().finite().nonnegative(),
	isBaseUnit: js(),
	active: js()
}).strict(), Oc = zs({
	id: D().min(1),
	sku: D().trim().min(1).max(80),
	name: D().trim().min(1).max(180),
	category: qs([
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
	status: qs(["ACTIVE", "INACTIVE"]),
	baseUnitId: D().min(1),
	units: Ls(Dc).min(1),
	createdAt: D(),
	updatedAt: D(),
	revision: Ds().int().nonnegative().optional(),
	itemType: qs([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	buyEnabled: js().optional(),
	sellEnabled: js().optional(),
	reorderPoint: Ds().finite().nonnegative().optional(),
	targetStock: Ds().finite().nonnegative().optional(),
	wholePacks: js().optional(),
	taxCode: D().min(1).optional()
}).strict(), kc = /* @__PURE__ */ new Set(), Ac = [...k];
function jc() {
	Ac = [...k], kc.forEach((e) => e());
}
function Mc(e, t, n) {
	if (Array.isArray(e)) return e.some((e) => Mc(e, t, n));
	if (!e || typeof e != "object") return !1;
	let r = e;
	return r.productId === t && (!n || r.unitId === n) || Object.values(r).some((e) => Mc(e, t, n));
}
function Nc(e) {
	let t = Ls(Oc).parse(e), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.id) || r.has(e.sku.toLowerCase())) throw Error("Duplicate product ID or SKU.");
		if (n.add(e.id), r.add(e.sku.toLowerCase()), new Set(e.units.map((e) => e.id)).size !== e.units.length || e.units.filter((e) => e.isBaseUnit).length !== 1 || !e.units.some((t) => t.id === e.baseUnitId && t.isBaseUnit && t.conversionToBase === 1)) throw Error("A product needs exactly one valid base unit.");
		if ((e.targetStock ?? 0) < (e.reorderPoint ?? 0)) throw Error("Target stock must be at least the reorder point.");
	}
	return t;
}
r("products", {
	validate: (e, t) => {
		let n = Nc(e.products), r = t.workspace_tax_codes.records;
		if (n.some((e) => !r.some((t) => t.code === (e.taxCode ?? "GST")))) throw Error("Backup product tax-code reference is invalid.");
	},
	repository: {
		subscribe(e) {
			return kc.add(e), () => {
				kc.delete(e);
			};
		},
		getSnapshot: () => Ac,
		getAll: () => k,
		getById: (e) => k.find((t) => t.id === e),
		save(e, t) {
			let n = Oc.parse(e), r = k.find((e) => e.id === n.id);
			if (r && t !== (r.revision ?? 0)) throw Error("Product changed since it was opened. Reload before saving.");
			if (!r && t !== void 0) throw Error("Product no longer exists.");
			if (wc(n.taxCode ?? "GST"), n.itemType && n.itemType !== "STOCK") throw Error("Only stocked products are supported by the current fulfilment workflow.");
			let i = s();
			if (delete i.products, r) {
				if (r.baseUnitId !== n.baseUnitId && Mc(i, n.id)) throw Error("A referenced product cannot change base unit.");
				for (let e of r.units) {
					let t = n.units.find((t) => t.id === e.id);
					if ((!t || t.conversionToBase !== e.conversionToBase || t.code !== e.code) && Mc(i, n.id, e.id)) throw Error("A referenced unit conversion cannot be changed or removed. Add a new unit instead.");
				}
			}
			let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
				...n,
				createdAt: r?.createdAt ?? a,
				updatedAt: a,
				revision: (r?.revision ?? 0) + 1
			};
			return Nc([...k.filter((e) => e.id !== n.id), o]), r ? k.splice(k.indexOf(r), 1, o) : k.push(o), Sc.ensureProductPolicy(o.id, o.baseUnitId, o.itemType !== "SERVICE" && o.itemType !== "NON_STOCK"), jc(), o;
		}
	},
	read: "inventory.read",
	commands: { save: "inventory.adjust" },
	snapshot: () => ({ products: structuredClone(k) }),
	restore: (e) => {
		let t = Nc(e.products);
		k.splice(0, k.length, ...t), Ac = [...k];
	},
	publish: jc
});
//#endregion
//#region src/features/security/trustedAuthorization.ts
var Pc = null, Fc = {
	connect(e) {
		return Pc = e, () => {
			Pc === e && (Pc = null);
		};
	},
	disconnect() {
		Pc = null;
	},
	current() {
		return Pc?.() ?? null;
	},
	require(e) {
		return i(this.current(), e);
	}
}, Ic = /* @__PURE__ */ new Set(), M = "2026-10-08T00:00:00.000Z", N = [
	{
		id: "acc_1000",
		code: "1000",
		name: "Operating Bank",
		type: "ASSET",
		systemRole: "BANK",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_1010",
		code: "1010",
		name: "Savings Bank",
		type: "ASSET",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_1100",
		code: "1100",
		name: "Accounts Receivable",
		type: "ASSET",
		systemRole: "ACCOUNTS_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_1200",
		code: "1200",
		name: "Inventory",
		type: "ASSET",
		systemRole: "INVENTORY",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_1300",
		code: "1300",
		name: "GST Receivable",
		type: "ASSET",
		systemRole: "GST_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_2000",
		code: "2000",
		name: "Accounts Payable",
		type: "LIABILITY",
		systemRole: "ACCOUNTS_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
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
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_2100",
		code: "2100",
		name: "GST Payable",
		type: "LIABILITY",
		systemRole: "GST_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_3000",
		code: "3000",
		name: "Owner's Equity",
		type: "EQUITY",
		systemRole: "OWNERS_EQUITY",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_3100",
		code: "3100",
		name: "Retained Earnings",
		type: "EQUITY",
		systemRole: "RETAINED_EARNINGS",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_4000",
		code: "4000",
		name: "Sales Revenue",
		type: "REVENUE",
		systemRole: "SALES_REVENUE",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_5000",
		code: "5000",
		name: "Cost of Goods Sold",
		type: "EXPENSE",
		systemRole: "COST_OF_GOODS_SOLD",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_5100",
		code: "5100",
		name: "Purchases / Materials",
		type: "EXPENSE",
		systemRole: "PURCHASES",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
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
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_5200",
		code: "5200",
		name: "Freight",
		type: "EXPENSE",
		systemRole: "FREIGHT",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_5300",
		code: "5300",
		name: "Operating Expenses",
		type: "EXPENSE",
		systemRole: "OPERATING_EXPENSE",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
	}
];
function Lc() {
	Ic.forEach((e) => e());
}
function Rc(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function zc(e) {
	return e?.trim() || void 0;
}
function Bc(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function Vc(e, t) {
	if (N.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function Hc(e, t) {
	if (!e) return;
	let n = N.find((n) => n.id !== t && (Cc(e) ? n.id === Cc(e) : n.systemRole === e));
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function Uc() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var P = {
	subscribe(e) {
		return Ic.add(e), () => {
			Ic.delete(e);
		};
	},
	getSnapshot() {
		return N;
	},
	getAll() {
		return N;
	},
	getById(e) {
		return N.find((t) => t.id === e);
	},
	getByCode(e) {
		return N.find((t) => t.code.toLowerCase() === e.trim().toLowerCase());
	},
	getBySystemRole(e) {
		return N.find((t) => Cc(e) ? t.id === Cc(e) : t.systemRole === e);
	},
	requireById(e) {
		let t = N.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = N.find((t) => Cc(e) ? t.id === Cc(e) : t.systemRole === e);
		if (!t) throw Error(`Accounting account for system role ${e} was not found.`);
		return t;
	},
	create(e) {
		let t = Rc(e.code, "Account code"), n = Rc(e.name, "Account name");
		Bc(t), Vc(t), Hc(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Uc(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: zc(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return N = [...N, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), Lc(), i;
	},
	update(e, t) {
		let n = N.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = Rc(t.code, "Account code"), i = Rc(t.name, "Account name");
		if (Bc(r), Vc(r, e), (n.systemRole || Ec(n.id)) && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: zc(t.description),
			active: n.systemRole || Ec(n.id) ? !0 : t.active,
			allowManualPosting: n.systemRole || Ec(n.id) ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return N = N.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), Lc(), a;
	},
	setActive(e, t) {
		let n = N.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		if ((n.systemRole || Ec(n.id)) && !t) throw Error("System control accounts cannot be deactivated.");
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return N = N.map((t) => t.id === e ? r : t), Lc(), r;
	}
};
r("accounts", {
	repository: P,
	read: "accounting.read",
	commands: {
		if: null,
		create: "accounting.post",
		update: "accounting.post",
		setActive: "accounting.post"
	},
	snapshot: () => ({ accounts: N }),
	restore: (e) => {
		N = e.accounts;
	},
	publish: () => Ic.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/mockRepositoryStorage.ts
function Wc() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function Gc(e, t) {
	let n = Wc();
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
function Kc(e, t) {
	let n = Wc();
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
function qc(e) {
	let t = Wc();
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
var Jc = [
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
], Yc = "htt.mock.contacts.customers.v1";
function Xc(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var Zc = Gc(Yc, Xc), Qc = Zc.status !== "invalid" && qc(Yc), $c = /* @__PURE__ */ new Set(), el = Zc.status === "ok" ? Zc.data : structuredClone(Jc);
function tl() {
	Qc && Kc(Yc, el), $c.forEach((e) => {
		e();
	});
}
function nl(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function rl() {
	let e = el.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function F(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function il(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function al(e, t) {
	let n = !1;
	if (el = el.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	tl();
}
var ol = {
	subscribe(e) {
		return $c.add(e), () => {
			$c.delete(e);
		};
	},
	getSnapshot() {
		return el;
	},
	getAll() {
		return el;
	},
	getById(e) {
		return el.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: nl("cus"),
			code: rl(),
			businessName: e.businessName.trim(),
			tradingName: F(e.tradingName),
			abn: il(e.abn),
			businessType: e.businessType,
			status: e.status,
			email: F(e.email),
			phone: F(e.phone),
			website: F(e.website),
			creditLimit: e.creditLimit,
			currentBalance: 0,
			overdueBalance: 0,
			paymentTermsDays: e.paymentTermsDays,
			locations: [],
			contacts: [],
			createdAt: t,
			updatedAt: t
		};
		return el = [n, ...el], tl(), n;
	},
	update(e, t) {
		let n;
		if (al(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: F(t.tradingName),
			abn: il(t.abn),
			businessType: t.businessType,
			status: t.status,
			email: F(t.email),
			phone: F(t.phone),
			website: F(t.website),
			creditLimit: t.creditLimit,
			paymentTermsDays: t.paymentTermsDays,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, n)), !n) throw Error(`Customer ${e} was not found`);
		return n;
	},
	addLocation(e, t) {
		let n = ol.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: nl("loc"),
			name: t.name.trim(),
			addressLine1: t.addressLine1.trim(),
			addressLine2: F(t.addressLine2),
			suburb: t.suburb.trim(),
			state: t.state.trim(),
			postcode: t.postcode.trim(),
			country: t.country.trim(),
			phone: F(t.phone),
			isPrimary: r
		};
		return al(e, (e) => ({
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
		let r = ol.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		let i = r.locations.find((e) => e.id === t);
		if (!i) throw Error(`Location ${t} was not found`);
		let a = n.isPrimary || r.locations.length === 1, o = {
			...i,
			name: n.name.trim(),
			addressLine1: n.addressLine1.trim(),
			addressLine2: F(n.addressLine2),
			suburb: n.suburb.trim(),
			state: n.state.trim(),
			postcode: n.postcode.trim(),
			country: n.country.trim(),
			phone: F(n.phone),
			isPrimary: a
		};
		return al(e, (e) => ({
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
		let n = ol.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: nl("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: F(t.jobTitle),
			email: t.email.trim(),
			phone: F(t.phone),
			mobile: F(t.mobile),
			locationId: F(t.locationId),
			isPrimary: r
		};
		return al(e, (e) => ({
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
		let r = ol.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		if (n.locationId && !r.locations.some((e) => e.id === n.locationId)) throw Error("The selected location does not belong to this customer");
		let i = r.contacts.find((e) => e.id === t);
		if (!i) throw Error(`Contact ${t} was not found`);
		let a = n.isPrimary || r.contacts.length === 1, o = {
			...i,
			firstName: n.firstName.trim(),
			lastName: n.lastName.trim(),
			jobTitle: F(n.jobTitle),
			email: n.email.trim(),
			phone: F(n.phone),
			mobile: F(n.mobile),
			locationId: F(n.locationId),
			isPrimary: a
		};
		return al(e, (e) => ({
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
	repository: ol,
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
	snapshot: () => ({ customers: el }),
	restore: (e) => {
		el = e.customers;
	},
	publish: () => $c.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/workspaceRepository.ts
var sl = Gs(D(), D().max(2e4)), cl = [
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
], ll = () => (/* @__PURE__ */ new Date()).toISOString(), ul = {
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
}, dl = /* @__PURE__ */ new Set(), fl = 0, pl = () => {
	fl++, dl.forEach((e) => e());
}, ml = Object.fromEntries(Object.keys(ul).map((e) => [e, []]));
for (let e of Object.keys(ul)) j[e] = [];
var hl = () => ({
	collected: P.getAll().find((e) => e.systemRole === "GST_PAYABLE")?.id ?? "",
	paid: P.getAll().find((e) => e.systemRole === "GST_RECEIVABLE")?.id ?? ""
});
j["tax-codes"] = [{
	id: "tax-gst",
	name: "GST",
	status: "Active",
	revision: "1",
	createdAt: ll(),
	updatedAt: ll(),
	code: "GST",
	rate: "10",
	basis: "Exclusive",
	report: "GST",
	...hl()
}, {
	id: "tax-zero",
	name: "Zero rated",
	status: "Active",
	revision: "1",
	createdAt: ll(),
	updatedAt: ll(),
	code: "ZERO",
	rate: "0",
	basis: "Exclusive",
	report: "Zero rated",
	...hl()
}];
function gl(e, t) {
	if (!e?.trim()) throw Error(`${t} is required.`);
}
function _l(e, t) {
	if (!e?.trim() || !Number.isFinite(Number(e)) || Number(e) < 0) throw Error(`${t} must be a non-negative number.`);
}
function vl(e, t) {
	let n = P.getAll().find((t) => t.id === e);
	if (!n?.active || t && n.type !== t) throw Error("Select an active account of the correct type.");
	return n;
}
function yl(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && (/* @__PURE__ */ new Date(e + "T00:00:00Z")).toISOString().slice(0, 10) === e;
}
function bl(e, t, n, r = !0) {
	let i = ul[e];
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
	gl(t.name, "Name");
	for (let e of i.required) gl(t[e], e);
	if (![
		"Active",
		"Inactive",
		"Open",
		"In progress",
		"Completed"
	].includes(t.status ?? "Active")) throw Error("Invalid business status.");
	if (e === "tax-codes") {
		if (_l(t.rate, "Tax rate"), t.basis && t.basis !== "Exclusive") throw Error("Only tax-exclusive document entry is supported.");
		if (Number(t.rate) > 100) throw Error("Tax rate cannot exceed 100%.");
		if (r && (vl(t.collected, "LIABILITY"), vl(t.paid, "ASSET"), t.collected !== P.requireBySystemRole("GST_PAYABLE").id || t.paid !== P.requireBySystemRole("GST_RECEIVABLE").id)) throw Error("Tax codes use the global GST posting accounts. Change the unused linked accounts first.");
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Tax code must be unique.");
		if (!/^[A-Z0-9_-]{1,24}$/.test(t.code)) throw Error("Use uppercase letters/numbers for a tax code.");
	}
	if (e === "linked-accounts" && r) {
		let e = P.requireBySystemRole(t.role), n = t.status === "Inactive" ? P.getAll().find((e) => e.systemRole === t.role)?.id : t.accountId, r = s().journals?.journalEntries ?? [];
		if (n !== e.id && r.some((t) => t.lines.some((t) => t.accountId === e.id || t.accountId === n))) throw Error("A used posting account cannot be remapped without a ledger migration.");
	}
	if (e === "linked-accounts") {
		if (!cl.includes(t.role)) throw Error("Unknown account role.");
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
		if (r && vl(t.accountId, e), n.some((e) => e.id !== t.id && e.role === t.role)) throw Error("A linked account role may only have one mapping.");
	}
	if (e === "promotions") {
		let e = A(t.productId);
		if (r && (!e || !_c(e.id, t.unitId))) throw Error("Product/unit not found.");
		if (_l(t.price, "Price"), !Number.isInteger(Number(t.priority))) throw Error("Priority must be an integer.");
		if (![
			"Customer price first",
			"Promotion first",
			"Lowest eligible price"
		].includes(t.policy)) throw Error("Invalid price conflict policy.");
		if (!/([+-]\d\d:\d\d|Z)$/.test(t.starts) || !Number.isFinite(Date.parse(t.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(t.ends) || !Number.isFinite(Date.parse(t.ends)) || Date.parse(t.ends) <= Date.parse(t.starts)) throw Error("Promotion requires explicit time offsets and an end after start.");
	}
	if (r && t.customerId && !ol.getById(t.customerId)) throw Error("Customer was not found.");
	if (e === "jobs") {
		if (_l(t.budget, "Revenue budget"), _l(t.costBudget, "Cost budget"), !yl(t.starts) || !yl(t.ends) || t.ends < t.starts) throw Error("Invalid project dates.");
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Job code must be unique.");
	}
	if (e === "tasks" && (!yl(t.due) || ![
		"Low",
		"Normal",
		"High"
	].includes(t.priority))) throw Error("Invalid due date or priority.");
	if (e === "bank-rules") {
		if (r && vl(t.accountId), ![
			"Description",
			"Payee",
			"Reference"
		].includes(t.field) || ![
			"Contains",
			"Equals",
			"Starts with"
		].includes(t.operator)) throw Error("Invalid bank condition.");
		if (r && !j["tax-codes"].some((e) => e.status === "Active" && e.code === t.taxCode)) throw Error("Active tax code not found.");
	}
	if (e === "report-packs" && (!yl(t.periodStart) || !yl(t.periodEnd) || t.periodEnd < t.periodStart)) throw Error("Invalid report period.");
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
function xl(e, t, n) {
	ml[e].push({
		id: crypto.randomUUID(),
		name: n,
		status: "Active",
		revision: "1",
		createdAt: ll(),
		updatedAt: ll(),
		recordId: t.id,
		actorId: Fc.current()?.userId ?? "local-test",
		after: JSON.stringify(t)
	});
}
Object.fromEntries(Object.keys(ul).map((e) => {
	let t = {
		getAll: () => j[e],
		getById: (t) => j[e].find((e) => e.id === t),
		save(t, n) {
			let r = sl.parse(t), i = j[e].find((e) => e.id === r.id);
			if (i && i.revision !== n) throw Error("Record changed. Reload before saving.");
			if (!i && n !== void 0) throw Error("Record no longer exists.");
			let a = ll(), o = {
				...r,
				id: i?.id ?? crypto.randomUUID(),
				name: r.name.trim(),
				status: r.status ?? "Active",
				revision: String(Number(i?.revision ?? "0") + 1),
				createdAt: i?.createdAt ?? a,
				updatedAt: a
			};
			return e === "tasks" && o.status === "Completed" && (o.completedAt = i?.completedAt ?? a, o.completedBy = i?.completedBy ?? Fc.current()?.userId ?? "local-test"), bl(e, o, j[e]), j[e] = [...j[e].filter((e) => e.id !== o.id), o], xl(e, o, i ? "Updated" : "Created"), pl(), o;
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
			xl(e, {
				...i,
				note: r.trim()
			}, "Note added"), pl();
		}
	};
	return r("workspace_" + e.replaceAll("-", "_"), {
		validate: (t, n) => {
			Sl(e, t), Cl(e, t, n);
		},
		repository: t,
		read: ul[e].read,
		commands: {
			save: ul[e].write,
			setStatus: ul[e].write,
			addNote: e === "tasks" ? "sales.write" : null
		},
		snapshot: () => ({
			records: j[e],
			history: ml[e]
		}),
		restore: (t) => {
			Sl(e, t), j[e] = t.records, ml[e] = t.history;
		},
		publish: pl
	}), [e, t];
}));
function Sl(e, t) {
	let n = zs({
		records: Ls(sl),
		history: Ls(sl)
	}).strict().parse(t), r = /* @__PURE__ */ new Set();
	for (let t of n.records) {
		if (!t.id || r.has(t.id) || !/^\d+$/.test(t.revision)) throw Error("Invalid workspace record identity.");
		r.add(t.id), bl(e, t, n.records, !1);
	}
	return n;
}
function Cl(e, t, n) {
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
//#region src/features/accounting/data/accountingPeriodRepository.ts
var I = [], wl, Tl, El = /* @__PURE__ */ new Set();
function Dl(e, t) {
	wl = e, Tl = t;
}
function Ol() {
	let e = Tl?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function kl(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function Al(e) {
	let t = I.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function jl() {
	El.forEach((e) => e());
}
function Ml(e) {
	if (a(e, "Posting date"), !I.length) return;
	let t = I.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!I.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
r("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => I,
		subscribe(e) {
			return El.add(e), () => {
				El.delete(e);
			};
		},
		create(e) {
			let t = Ol(), n = kl(e.reason);
			if (a(e.startDate), a(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (I.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (I.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
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
			return I = [...I, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), jl(), r;
		},
		preflight(e) {
			let t = Al(e);
			if (!wl) throw Error("Trusted close checks unavailable.");
			return wl(t);
		},
		close(e) {
			let t = Ol(), n = kl(e.reason), r = Al(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (I.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return I = I.map((e) => e.id === r.id ? {
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
			} : e), jl(), Al(e.id);
		},
		reopen(e) {
			let t = Ol(), n = kl(e.reason), r = Al(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (I.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return I = I.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), jl(), Al(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: I }),
	restore: (e) => {
		o(e.periods), I = e.periods;
	},
	publish: jl
});
//#endregion
//#region src/features/business-workspace/productRules.ts
function Nl(e, t, n, r) {
	let i = A(e), a = _c(e, t);
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
var Pl = "htt:financial-operations:v1", Fl = [
	"CUSTOMER_PAYMENT",
	"PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
], Il = [
	"PENDING",
	"COMPLETED",
	"MANUAL_REVIEW"
], Ll = (e) => Array.isArray(e) && e.every((e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.operationId == "string" && t.operationId.length > 0 && Fl.includes(String(t.kind)) && typeof t.fingerprint == "string" && t.fingerprint.length > 0 && Il.includes(String(t.state)) && typeof t.createdAt == "string" && typeof t.updatedAt == "string" && (t.resultId === void 0 || typeof t.resultId == "string") && (t.note === void 0 || typeof t.note == "string") && (t.reviewHistory === void 0 || Array.isArray(t.reviewHistory) && t.reviewHistory.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		return typeof t.reference == "string" && t.reference.length >= 3 && typeof t.operator == "string" && t.operator.length >= 2 && typeof t.recordedAt == "string" && typeof t.summary == "string" && t.summary.length >= 3;
	}));
}) && new Set(e.map((e) => e.operationId)).size === e.length;
function Rl() {
	let e = Gc(Pl, Ll);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function zl(e) {
	if (!qc(Pl) || !Kc(Pl, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var L = {
	list() {
		return Rl().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !Fl.includes(t)) throw Error("Invalid operation identity.");
		let r = Rl(), i = r.find((t) => t.operationId === e);
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
		return zl([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = Rl(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return zl(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = Rl(), r = n.find((t) => t.operationId === e);
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
		return zl(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = Rl(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return zl(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = Rl(), a = i.find((t) => t.operationId === e);
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
		return zl(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = Rl(), a = i.find((t) => t.operationId === e);
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
		return zl(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	getUnresolved() {
		return Rl().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
	}
};
r("financialOperations", {
	repository: L,
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
var Bl = /* @__PURE__ */ new Map(), Vl = "htt.purchasePosting.operations.v1";
function Hl() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function Ul() {
	let e = Hl();
	if (e) try {
		e.setItem(Vl, JSON.stringify([...Bl.values()]));
	} catch {}
}
function Wl() {
	let e = Hl();
	if (e) try {
		let t = JSON.parse(e.getItem(Vl) ?? "[]");
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
			Bl.set(t.key, {
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
Wl();
var Gl = /* @__PURE__ */ new Set(), Kl = /* @__PURE__ */ new Map(), ql = /* @__PURE__ */ new Map(), Jl;
function Yl() {
	Ul(), Gl.forEach((e) => e());
}
var R = {
	injectFailureBeforeStep(e, t, n = 1) {
		ql.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		ql.clear();
	},
	registerRecovery(e, t) {
		if (!Bl.has(e)) throw Error(`Unknown posting operation: ${e}`);
		Kl.set(e, t);
	},
	runStep(e, t, n) {
		let r = Bl.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = ql.get(i) ?? 0;
		if (a > 0) throw ql.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return Kl.has(e);
	},
	recover(e) {
		let t = Bl.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = Kl.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (Jl === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		Jl = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			Jl = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = Bl.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...Bl.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return Gl.add(e), () => {
			Gl.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if (Bl.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Bl.set(n, r), Yl(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = Bl.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		Bl.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), Yl();
	},
	completeStep(e, t) {
		let n = Bl.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (Bl.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), Yl());
	}
};
r("purchaseOperations", {
	repository: R,
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
	snapshot: () => R.getAll(),
	restore: (e) => {
		Bl.clear(), Kl.clear();
		for (let t of e) Bl.set(t.key, t);
	},
	publish: () => Gl.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var Xl = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Zl(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${Xl.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function z() {
	Zl(L.list(), R.getAll());
}
//#endregion
//#region src/features/sales/data/quoteStorage.ts
var Ql = "htt.mock.sales.quotes.v1", $l = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function eu(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !$l.has(String(t.status)) || ![
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
function tu() {
	return Gc(Ql, eu);
}
function nu(e) {
	if (tu().status === "invalid" || !qc("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!Kc("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var ru = "htt.mock.sales.quote-orders.v1";
function iu(e) {
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
function au(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!eu(t.quotes) || !iu(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function ou() {
	return Gc(ru, au);
}
function su(e) {
	if (!au(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = ou(), n = tu();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !qc("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!Kc("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var cu = "htt.mock.sales.documents.v1";
function lu(e) {
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
function uu(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!au(t) || !lu(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function du() {
	return Gc(cu, uu);
}
function fu(e) {
	if (!uu(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = du();
	if (t.status === "invalid" || t.status === "unavailable" || !qc("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!Kc("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/purchases/data/mockPurchaseOrders.ts
var pu = [{
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
}], mu = [{
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
}], hu = "htt:financial-snapshot:v1", gu = (e) => !!e && typeof e == "object" && !Array.isArray(e), _u = (e) => new Set(e.map((e) => e.id)).size === e.length, vu = (e) => {
	if (!gu(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => gu(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => gu(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => gu(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => gu(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
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
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => gu(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && gu(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && gu(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && gu(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && _u(t) && _u(n) && _u(r) && _u(i);
}, yu = () => ({
	purchaseOrders: structuredClone(pu),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone(mu),
	transactions: [],
	transfers: [],
	journals: []
}), bu, xu = !1;
function Su() {
	return typeof window < "u" && !!window.localStorage;
}
function Cu() {
	if (bu) return bu;
	if (!Su()) return yu();
	let e = Gc(hu, vu);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return xu = e.status === "ok", bu = e.status === "ok" ? {
		...yu(),
		...e.data
	} : yu(), bu;
}
var wu = /* @__PURE__ */ new Set(), Tu = 0, Eu = /* @__PURE__ */ new Set();
function Du(e) {
	if (Su() && !Kc(hu, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var B = {
	wasRestoredOnLoad() {
		return Cu(), xu;
	},
	onRollback(e) {
		wu.add(e);
	},
	notify(e) {
		Tu ? Eu.add(e) : e();
	},
	transaction(e) {
		if (Tu) return e();
		let t = structuredClone(Cu());
		bu = structuredClone(t), Tu++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			Du(Cu());
		} catch (e) {
			throw bu = t, wu.forEach((e) => e()), Eu.clear(), e;
		} finally {
			Tu--;
		}
		let r = [...Eu];
		return Eu.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(Cu());
	},
	update(e, t) {
		let n = {
			...Cu(),
			[e]: structuredClone(t)
		};
		if (!vu(n)) throw Error("Invalid financial snapshot; write blocked.");
		Tu || Du(n), bu = n;
	},
	resetCacheForTests() {
		bu = void 0, xu = !1;
	}
};
r("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => B.read(),
	restore: (e) => {
		bu = e;
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var Ou = /* @__PURE__ */ new Set(), ku = B.read().journals;
B.onRollback(() => {
	ku = B.read().journals;
});
function Au() {
	Ou.forEach((e) => B.notify(e));
}
function ju(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Mu(e) {
	return e?.trim() || void 0;
}
function Nu(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function Pu(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = ku.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Fu(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function Iu(e) {
	if (Nu(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = P.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = ju(r.debit), o = ju(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = ju(t + a), n = ju(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function Lu(e) {
	return e.lines.map((e, t) => {
		let n = P.requireById(e.accountId);
		return {
			id: Fu(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: Mu(e.description),
			debit: ju(e.debit),
			credit: ju(e.credit)
		};
	});
}
function Ru(e, t) {
	return ku.find((n) => n.sourceType === e && n.sourceId === t && !n.reversedJournalEntryId);
}
var V = {
	subscribe(e) {
		return Ou.add(e), () => {
			Ou.delete(e);
		};
	},
	getSnapshot() {
		return ku;
	},
	getAll() {
		return ku;
	},
	getById(e) {
		return ku.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return ku.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: Ru,
	post(e) {
		Ml(e.journalDate);
		let t = Iu(e), n = Mu(e.sourceId);
		if (n) {
			let t = Ru(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Fu("je"),
			journalNumber: Pu(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: Mu(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: Lu(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...ku];
		return B.update("journals", a), ku = a, Au(), i;
	},
	reverse(e) {
		Ml(e.reversalDate);
		let t = ku.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (Nu(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Reversal reason must contain at least 3 characters.");
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
		}, i = Iu(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: Fu("je"),
			journalNumber: Pu(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: Lu(r),
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
		}, c = [o, ...ku.map((e) => e.id === t.id ? s : e)];
		return B.update("journals", c), ku = c, Au(), o;
	}
};
r("journals", {
	repository: V,
	read: "accounting.read",
	commands: {
		if: null,
		validateDate: null,
		for: null,
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ journalEntries: ku }),
	restore: (e) => {
		ku = e.journalEntries;
	},
	publish: () => Ou.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var zu = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Bu(e) {
	let t = e.filter((e) => zu.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function Vu() {
	Bu(L.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var Hu = [{
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
}], Uu = [{
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
}], Wu = [{
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
}], Gu = "htt.mock.sales.credit-notes.v1", Ku = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, qu = (e) => typeof e == "string" && e.length > 0;
function Ju(e) {
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
		].every((e) => qu(t[e])) || ![
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
		].every((e) => Ku(i[e])) || !Ku(t.amountApplied) || !Ku(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => qu(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !Ku(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		return Math.abs(t - e.amountApplied) > .011 ? !1 : e.status === "VOID" ? t === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function Yu() {
	return Gc(Gu, Ju);
}
function Xu(e) {
	if (!Ju(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = Yu();
	if (t.status === "invalid" || t.status === "unavailable" || !qc("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!Kc("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var Zu = /* @__PURE__ */ new Set(), Qu = Yu(), H = Qu.status === "ok" ? structuredClone(Qu.data.creditNotes) : [], U = Qu.status === "ok" ? structuredClone(Qu.data.allocations) : [], $u = [...H], ed = [...U];
function td() {
	$u = [...H], ed = [...U], Zu.forEach((e) => e());
}
function nd(e, t) {
	Xu({
		creditNotes: e,
		allocations: t
	}), H = e, U = t, td();
}
var W = {
	subscribe(e) {
		return Zu.add(e), () => {
			Zu.delete(e);
		};
	},
	getSnapshot() {
		return $u;
	},
	getAllocationSnapshot() {
		return ed;
	},
	getAll() {
		return $u;
	},
	getAllAllocations() {
		return ed;
	},
	getById(e) {
		return H.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return H.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return H.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return U.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return U.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if (H.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return nd([e, ...H], U), e;
	},
	update(e) {
		if (!H.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return nd(H.map((t) => t.id === e.id ? e : t), U), e;
	},
	createAllocation(e) {
		if (U.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return nd(H, [e, ...U]), e;
	},
	updateAllocation(e) {
		if (!U.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return nd(H, U.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!H.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = U.some((t) => t.id === e.id) ? U.map((t) => t.id === e.id ? e : t) : [e, ...U];
		nd(H.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return U.find((t) => t.id === e);
	}
};
r("customerCredits", {
	repository: W,
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
		creditNotes: H,
		allocations: U
	}),
	restore: (e) => {
		H = e.creditNotes, U = e.allocations, $u = [...H], ed = [...U];
	},
	publish: () => Zu.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/customerPricingStorage.ts
var rd = "htt.mock.contacts.customerPricing.v1";
function id(e) {
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
function ad() {
	return Gc(rd, id);
}
function od(e) {
	if (ad().status === "invalid" || !qc("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!Kc("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var sd = [
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
], cd = /* @__PURE__ */ new Set(), ld = ad(), ud = ld.status === "ok" ? ld.data : structuredClone(sd);
function dd() {
	cd.forEach((e) => {
		e();
	});
}
function fd(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function pd(e) {
	return e.trim() || void 0;
}
function md(e, t) {
	let n = A(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = n.units.find((e) => e.id === t);
	if (!r) throw Error(`Unit ${t} does not belong to product ${e}`);
	if (!r.active) throw Error("The selected product unit is inactive");
	return {
		product: n,
		unit: r
	};
}
function hd(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function gd({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = ud.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : hd(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = xd(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function _d(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function vd(e) {
	let t = _c(e.productId, e.unitId);
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
var yd = {
	subscribe(e) {
		return cd.add(e), () => {
			cd.delete(e);
		};
	},
	getSnapshot() {
		return ud;
	},
	getAll() {
		return ud;
	},
	getById(e) {
		return ud.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return ud.filter((t) => t.customerId === e);
	},
	create(e, t) {
		md(t.productId, t.unitId);
		let n = pd(t.effectiveTo);
		t.active && gd({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = _d(t), a = {
			id: fd("cprice"),
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
		}, o = [a, ...ud];
		return od(o), ud = o, dd(), a;
	},
	update(e, t) {
		let n = yd.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		md(t.productId, t.unitId);
		let r = pd(t.effectiveTo);
		t.active && gd({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = _d(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = ud.map((t) => t.id === e ? a : t);
		return od(o), ud = o, dd(), a;
	},
	resolve(e) {
		return vd(e);
	},
	resolvePrice(e, t, n, r) {
		let i = yd.resolveBasePrice(e, t, n, r.slice(0, 10)), a = Tc({
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
		let { unit: i } = md(t, n), a = ud.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && bd(r, i.effectiveFrom, i.effectiveTo));
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
		let o = vd(a);
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
function bd(e, t, n) {
	return !(e < t || n && e > n);
}
function xd(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
r("customerPrices", {
	repository: yd,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: ud }),
	restore: (e) => {
		ud = e.customerPrices;
	},
	publish: () => cd.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
function Sd(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Cd({ quantity: e, standardUnitPrice: t, unitPrice: n, taxRate: r = wc() }) {
	let i = Sd(e * n), a = Sd(i * r), o = Sd(i + a), s = Sd(t - n);
	return {
		discountAmount: s,
		discountPercent: t > 0 ? Sd(s / t * 100) : 0,
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: o
	};
}
function wd(e) {
	let t = Sd(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Sd(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: Sd(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function Td({ customerId: e, documentDate: t, draft: n }) {
	if (n.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let r = A(n.productId);
	if (!r) throw Error(`Product ${n.productId} was not found`);
	if (r.status !== "ACTIVE") throw Error(`${r.name} is inactive`);
	let i = _c(n.productId, n.unitId);
	if (!i) throw Error(`Unit ${n.unitId} was not found for ${r.name}`);
	let a = yd.resolvePrice(e, n.productId, n.unitId, t), o = n.unitPrice !== void 0, s = o ? n.unitPrice : a.effectivePrice;
	if (!Number.isFinite(s) || s < 0) throw Error("Unit price cannot be negative");
	if (Nl(n.productId, n.unitId, n.quantity, "sell"), r.sellEnabled === !1) throw Error("Product is not available for selling.");
	let c = r.taxCode ?? "GST", l = wc(c), u = Cd({
		taxRate: l,
		quantity: n.quantity,
		standardUnitPrice: a.basePrice,
		unitPrice: s
	});
	return {
		id: Ed("line"),
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
function Ed(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var Dd = "htt.mock.banking.accounts.v1";
function Od(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var kd = /* @__PURE__ */ new Set(), Ad = "2026-10-08T00:00:00.000Z", jd = [{
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
	createdAt: Ad,
	updatedAt: Ad
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
	createdAt: Ad,
	updatedAt: Ad
}], Md = Gc(Dd, Od);
Md.status === "ok" && Md.data.every((e) => {
	let t = P.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (jd = Md.data);
function Nd() {
	kd.forEach((e) => e());
}
function Pd(e) {
	let t = P.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of jd) Pd(e);
var Fd = {
	subscribe(e) {
		return kd.add(e), () => {
			kd.delete(e);
		};
	},
	getSnapshot() {
		return jd;
	},
	getAll() {
		return jd;
	},
	getById(e) {
		return jd.find((t) => t.id === e);
	},
	getByGlAccountId(e) {
		return jd.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = jd.find((t) => t.id === e);
		if (!t) throw Error("Bank account was not found.");
		return t;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return jd = jd.map((t) => t.id === e ? r : t), qc(Dd) && Kc(Dd, jd), Nd(), r;
	}
};
r("bankAccounts", {
	repository: Fd,
	read: "banking.read",
	commands: {
		if: null,
		validateBankAccount: null,
		setActive: "banking.write"
	},
	snapshot: () => ({ bankAccounts: jd }),
	restore: (e) => {
		jd = e.bankAccounts;
	},
	publish: () => kd.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var Id = /* @__PURE__ */ new Set(), Ld = B.read().payments;
function Rd() {
	Id.forEach((e) => e());
}
function zd() {
	return `payment_${crypto.randomUUID()}`;
}
function Bd() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Ld.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var Vd = {
	subscribe(e) {
		return Id.add(e), () => {
			Id.delete(e);
		};
	},
	getSnapshot() {
		return Ld;
	},
	getAll() {
		return Ld;
	},
	getById(e) {
		return Ld.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Ld.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Ld.filter((t) => t.invoiceId === e);
	},
	create(e) {
		if (!e.customerId) throw Error("Customer is required");
		if (!e.invoiceId) throw Error("Invoice is required");
		if (!e.paymentDate) throw Error("Payment date is required");
		if (!e.bankAccountId) throw Error("Bank account is required");
		let t = Fd.getById(e.bankAccountId);
		if (!t) throw Error("Bank account was not found");
		if (!t.active) throw Error("The selected bank account is inactive");
		if (!Number.isFinite(e.amount) || e.amount <= 0) throw Error("Payment amount must be greater than zero");
		if (a(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (Ud(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = L.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: Ud(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: Hd(e.reference),
				notes: Hd(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = Ld.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: zd(),
			paymentNumber: Bd(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: Ud(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: Hd(e.reference),
			notes: Hd(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && L.bindResult(n, i.id);
		let o = [i, ...Ld];
		if (B.update("payments", o), Ld = o, n && !e.deferOperationCompletion) try {
			L.complete(n, i.id);
		} catch (e) {
			try {
				L.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return Rd(), i;
	},
	reverse(e, t) {
		let n = Ld.find((t) => t.id === e);
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
		}, o = Ld.map((t) => t.id === e ? a : t);
		return B.update("payments", o), Ld = o, Rd(), a;
	},
	getReceivedByInvoice(e) {
		return Ld.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function Hd(e) {
	return e?.trim() || void 0;
}
function Ud(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
r("customerPayments", {
	repository: Vd,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null
	},
	snapshot: () => ({ payments: Ld }),
	restore: (e) => {
		Ld = e.payments;
	},
	publish: () => Id.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/salesAccountingPostingService.ts
function Wd(e) {
	return P.requireBySystemRole(e).id;
}
function Gd(e) {
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
function Kd(e, t) {
	return V.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function qd(e, t) {
	let n = Kd(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Jd = {
	postInvoice(e) {
		return Kd("CUSTOMER_INVOICE", e.id) || V.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: Wd("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: Wd("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				{
					accountId: Wd("GST_PAYABLE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.taxAmount
				}
			]
		});
	},
	reverseInvoice(e) {
		let t = qd("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? V.getById(t.reversalJournalEntryId) : void 0 : V.reverse({
			journalEntryId: t.id,
			reversalDate: Gd(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = Kd("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = Fd.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this customer payment is inactive.");
		return V.post({
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
				accountId: Wd("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = qd("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? V.getById(t.reversalJournalEntryId) : void 0 : V.reverse({
			journalEntryId: t.id,
			reversalDate: Gd(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return Kd("CREDIT_NOTE", e.id) || V.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: Wd("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				{
					accountId: Wd("GST_PAYABLE"),
					description: e.creditNoteNumber,
					debit: e.totals.taxAmount,
					credit: 0
				},
				{
					accountId: Wd("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = qd("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? V.getById(t.reversalJournalEntryId) : void 0 : V.reverse({
			journalEntryId: t.id,
			reversalDate: Gd(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, Yd = /* @__PURE__ */ new Set(), Xd = du(), Zd = ou(), Qd = tu(), G = Xd.status === "ok" ? structuredClone(Xd.data.quotes) : Zd.status === "ok" ? structuredClone(Zd.data.quotes) : Qd.status === "ok" ? structuredClone(Qd.data) : structuredClone(Hu);
function $d(e) {
	Xd.status === "ok" || du().status !== "empty" ? fu({
		quotes: e,
		salesOrders: ef,
		invoices: K
	}) : Zd.status === "ok" || ou().status !== "empty" ? su({
		quotes: e,
		salesOrders: ef
	}) : nu(e), G = e, af();
}
var ef = Xd.status === "ok" ? structuredClone(Xd.data.salesOrders) : Zd.status === "ok" ? structuredClone(Zd.data.salesOrders) : structuredClone(Uu), K = Xd.status === "ok" ? structuredClone(Xd.data.invoices) : structuredClone(Wu);
function tf(e) {
	fu({
		quotes: G,
		salesOrders: ef,
		invoices: e
	}), K = e, af();
}
function nf(e, t = G) {
	Xd.status === "ok" || du().status !== "empty" ? fu({
		quotes: t,
		salesOrders: e,
		invoices: K
	}) : su({
		quotes: t,
		salesOrders: e
	}), ef = e, G = t, af();
}
var rf = of();
function af() {
	rf = of(), Yd.forEach((e) => e());
}
function of() {
	return [
		...G,
		...ef,
		...K
	];
}
var sf = {
	subscribe(e) {
		return Yd.add(e), () => {
			Yd.delete(e);
		};
	},
	getSnapshot() {
		return rf;
	},
	getAll() {
		return rf;
	},
	getById(e) {
		return rf.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return rf.filter((t) => t.customerId === e);
	},
	getQuotesByCustomer(e) {
		return G.filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return ef.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return K.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (cf(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = e.lines.map((t) => Td({
			customerId: e.customerId,
			documentDate: e.documentDate,
			draft: t
		})), n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: uf("quote"),
			type: "QUOTE",
			documentNumber: df("QU", G.map((e) => e.documentNumber)),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: lf(e.customerReference),
			notes: lf(e.notes),
			lines: t,
			totals: wd(t),
			createdAt: n,
			updatedAt: n
		};
		return $d([r, ...G]), r;
	},
	updateDraftQuote(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error(`Quote ${e} was not found`);
		if (n.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let r = t.lines.map((e) => {
			if (e.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
			if (!Number.isFinite(e.standardUnitPrice) || !Number.isFinite(e.unitPrice) || e.standardUnitPrice < 0 || e.unitPrice < 0) throw Error("Sales prices cannot be negative");
			Nl(e.productId, e.unitId, e.quantity, "sell");
			let t = A(e.productId)?.taxCode ?? "GST", r = wc(t), i = Cd({
				taxRate: r,
				quantity: e.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice
			});
			return {
				id: n.lines.find((t) => t.id === e.lineId)?.id ?? uf("line"),
				productId: e.productId,
				unitId: e.unitId,
				sku: mf(e.productId, e.unitId).sku,
				description: mf(e.productId, e.unitId).description,
				unitSymbol: mf(e.productId, e.unitId).unitSymbol,
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
			customerReference: lf(t.customerReference),
			notes: lf(t.notes),
			lines: r,
			totals: wd(r),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return $d(G.map((t) => t.id === e ? i : t)), i;
	},
	sendQuote(e) {
		let t = G.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return $d(G.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = G.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return $d(G.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = G.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return $d(G.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = G.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: uf("order"),
			type: "SALES_ORDER",
			documentNumber: df("SO", ef.map((e) => e.documentNumber)),
			customerId: t.customerId,
			documentDate: ff(),
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
		return nf([r, ...ef], G.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = ef.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return nf(ef.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = ef.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = ff(), i = {
			id: uf("invoice"),
			type: "INVOICE",
			documentNumber: df("INV", K.map((e) => e.documentNumber)),
			customerId: t.customerId,
			documentDate: r,
			dueDate: pf(r, 30),
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
		}, a = [i, ...K], o = ef.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: n
		} : e);
		return fu({
			quotes: G,
			salesOrders: o,
			invoices: a
		}), K = a, ef = o, af(), Jd.postInvoice(i), i;
	},
	createCreditNoteFromInvoice(e) {
		let t = K.find((t) => t.id === e.invoiceId);
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
			let i = W.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id).reduce((e, t) => e + t.quantity, 0);
			if (e.quantity + i > n.quantity + 1e-8) throw Error("Credit quantity cannot exceed the original invoice quantity.");
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1);
			return {
				...n,
				quantity: e.quantity,
				taxRate: a,
				...Cd({
					quantity: e.quantity,
					unitPrice: n.unitPrice,
					standardUnitPrice: n.standardUnitPrice,
					taxRate: a
				})
			};
		}), a = wd(i);
		if (a.total <= 0) throw Error("Credit note total must be greater than zero");
		if (hf(hf(W.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + a.total) > hf(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: uf("credit-note"),
			creditNoteNumber: df("CN", W.getAll().map((e) => e.creditNoteNumber)),
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
		return W.create(s), Jd.postCreditNote(s), s;
	},
	applyCreditToInvoice(e) {
		z(), Vu();
		let t = W.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		let n = K.find((t) => t.id === e.invoiceId);
		if (!n) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void credit note cannot be applied");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be applied");
		if (n.status === "VOID") throw Error("Credit cannot be applied to a void invoice");
		if (n.status === "DRAFT") throw Error("Credit cannot be applied to a draft invoice");
		if (t.customerId !== n.customerId) throw Error("Credit note and invoice must belong to the same customer");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the credit note date");
		let r = hf(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = W.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: uf("credit-allocation"),
			allocationNumber: df("CA", W.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = hf(i.amountApplied + r), c = hf(Math.max(0, i.totals.total - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
		if (L.begin(l, "SALES_CREDIT_APPLY", JSON.stringify({
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: r
		})).status !== "started") throw Error("Credit allocation was previously attempted; manual review required.");
		try {
			L.bindResult(l, o.id), W.commitAllocationAndCredit(o, {
				...i,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(n.id), L.complete(l, o.id);
		} catch (e) {
			try {
				L.flagForReview(l, "Credit allocation/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	reverseCreditAllocation(e) {
		z(), Vu();
		let t = W.getAllocationById(e.allocationId);
		if (!t) throw Error(`Credit allocation ${e.allocationId} was not found`);
		if (t.status === "REVERSED") throw Error("This credit allocation has already been reversed");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A reversal reason is required");
		let r = W.getById(t.creditNoteId);
		if (!r) throw Error("Credit note was not found");
		if (r.status === "VOID") throw Error("Allocations on a void credit note cannot be reversed here");
		let i = K.find((e) => e.id === t.invoiceId);
		if (!i) throw Error("Allocated invoice was not found");
		if (i.status === "VOID") throw Error("Credit allocation cannot be reversed after the invoice has been voided");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			updatedAt: a
		}, s = hf(W.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = hf(Math.max(0, r.totals.total - s)), l = `sales-credit-reversal:${t.id}`;
		if (L.begin(l, "SALES_CREDIT_REVERSAL", t.id).status !== "started") throw Error("Credit allocation reversal previously attempted; manual review required.");
		try {
			L.bindResult(l, t.id), W.commitAllocationAndCredit(o, {
				...r,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(i.id), L.complete(l, t.id);
		} catch (e) {
			try {
				L.flagForReview(l, "Credit reversal/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	voidCreditNote(e) {
		let t = W.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		if (t.status === "VOID") throw Error("This credit note has already been voided");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be voided here");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required");
		if (W.getAllocationsByCreditNote(t.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this credit note");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: r,
			voidReason: n,
			updatedAt: r
		};
		return W.update(i), Jd.reverseCreditNote(i), i;
	},
	recordInvoicePayment(e) {
		if (z(), Vu(), e.operationId) {
			let t = L.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = K.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = hf(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (a(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, o = Vd.create({
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
			Jd.postPayment(o);
			let e = V.getBySource("CUSTOMER_PAYMENT", o.id).filter((e) => !e.reversedJournalEntryId);
			if (e.length !== 1 || e[0].status !== "POSTED") throw Error("Payment GL posting could not be verified uniquely.");
			L.complete(i, o.id);
		} catch (e) {
			try {
				L.flagForReview(i, "Payment or GL posting uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	voidInvoice(e, t) {
		z(), Vu();
		let n = K.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (Vd.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
		if (W.getAllocationsByInvoice(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("This invoice has applied credits. Reverse all active credit allocations before voiding the invoice.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			amountPaid: 0,
			amountDue: 0,
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		}, o = `sales-invoice-void:${e}`;
		if (L.begin(o, "SALES_INVOICE_VOID", e).status !== "started") throw Error("Invoice void was previously attempted; inspect GL and operation journal before retrying.");
		try {
			let t = V.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (t.length !== 1 || t[0].status !== "POSTED") throw Error("Invoice original GL must be uniquely posted before voiding.");
			L.bindResult(o, e), Jd.reverseInvoice(a);
			let n = V.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			tf(K.map((t) => t.id === e ? a : t)), L.complete(o, e);
		} catch (e) {
			try {
				L.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		z(), Vu();
		let n = Vd.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = K.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (L.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			L.bindResult(i, e);
			let n = Vd.reverse(e, t);
			Jd.reversePayment(n);
			let a = V.getBySource("CUSTOMER_PAYMENT", e).filter((e) => !e.reversedJournalEntryId);
			if (a.length !== 1 || a[0].status !== "REVERSED") throw Error("Payment GL reversal could not be verified.");
			return this.recalculateInvoiceBalance(r.id), L.complete(i, e), n;
		} catch (e) {
			try {
				L.flagForReview(i, "Payment reversal/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
	},
	recalculateInvoiceBalance(e) {
		let t = K.find((t) => t.id === e);
		if (!t) throw Error(`Invoice ${e} was not found`);
		if (t.status === "VOID") return t;
		let n = Vd.getReceivedByInvoice(e), r = W.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = hf(n.reduce((e, t) => e + t.amount, 0)), a = hf(r.reduce((e, t) => e + t.amount, 0)), o = hf(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : gf(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return tf(K.map((t) => t.id === e ? c : t)), c;
	}
};
function cf(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function lf(e) {
	return e?.trim() || void 0;
}
function uf(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function df(e, t) {
	let n = (/* @__PURE__ */ new Date()).getFullYear(), r = t.reduce((e, t) => {
		let n = t.match(/-(\d+)$/);
		if (!n) return e;
		let r = Number(n[1]);
		return Math.max(e, r);
	}, 0) + 1;
	return `${e}-${n}-${String(r).padStart(4, "0")}`;
}
function ff() {
	let e = /* @__PURE__ */ new Date();
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
function pf(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function mf(e, t) {
	let n = A(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = _c(e, t);
	if (!r) throw Error(`Unit ${t} was not found for ${n.name}`);
	return {
		sku: n.sku,
		description: n.name,
		unitSymbol: r.symbol
	};
}
function hf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function gf(e) {
	return e < _f(/* @__PURE__ */ new Date());
}
function _f(e) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
r("sales", {
	repository: sf,
	read: "sales.read",
	commands: {
		if: null,
		emitChange: null,
		persistSalesDocuments: null,
		createQuote: "sales.write",
		updateDraftQuote: "sales.write",
		sendQuote: "sales.write",
		acceptQuote: "sales.write",
		declineQuote: "sales.write",
		convertQuoteToOrder: "sales.write",
		setFulfilmentStatus: null,
		createInvoiceFromOrder: "sales.write",
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
		quotes: G,
		salesOrders: ef,
		invoices: K
	}),
	restore: (e) => {
		G = e.quotes, ef = e.salesOrders, K = e.invoices, rf = of();
	},
	publish: () => Yd.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var vf = [
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
], yf = "htt.mock.contacts.suppliers.v1";
function bf(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var xf = Gc(yf, bf), Sf = xf.status !== "invalid" && qc(yf), Cf = /* @__PURE__ */ new Set(), wf = xf.status === "ok" ? xf.data : structuredClone(vf);
function Tf() {
	Sf && Kc(yf, wf), Cf.forEach((e) => {
		e();
	});
}
function Ef(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Df() {
	let e = wf.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function Of(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function kf(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function Af(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: Of(e.tradingName),
		abn: kf(e.abn),
		status: e.status,
		email: Of(e.email),
		phone: Of(e.phone),
		website: Of(e.website),
		contactName: Of(e.contactName),
		addressLine1: Of(e.addressLine1),
		addressLine2: Of(e.addressLine2),
		suburb: Of(e.suburb),
		state: Of(e.state),
		postcode: Of(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: Of(e.notes)
	};
}
var jf = {
	subscribe(e) {
		return Cf.add(e), () => {
			Cf.delete(e);
		};
	},
	getSnapshot() {
		return wf;
	},
	getAll() {
		return wf;
	},
	getById(e) {
		return wf.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: Ef("sup"),
			code: Df(),
			...Af(e),
			currency: "AUD",
			createdAt: t,
			updatedAt: t
		};
		return wf = [n, ...wf], Tf(), n;
	},
	update(e, t) {
		let n = jf.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...Af(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return wf = wf.map((t) => t.id === e ? r : t), Tf(), r;
	}
};
r("suppliers", {
	repository: jf,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: wf }),
	restore: (e) => {
		wf = e.suppliers;
	},
	publish: () => Cf.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
function Mf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Nf({ orderedQuantity: e, unitCost: t, taxRate: n = wc() }) {
	let r = Mf(e * t), i = Mf(r * n);
	return {
		lineSubtotal: r,
		taxAmount: i,
		lineTotal: Mf(r + i)
	};
}
function Pf(e) {
	let t = Mf(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Mf(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: Mf(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var Ff = /* @__PURE__ */ new Set(), q = B.read().purchaseOrders;
B.onRollback(() => {
	q = B.read().purchaseOrders;
});
function If() {
	try {
		B.update("purchaseOrders", q);
	} catch (e) {
		throw q = B.read().purchaseOrders, e;
	}
	Ff.forEach((e) => B.notify(e));
}
function Lf(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Rf(e) {
	return e.slice(0, 4);
}
function zf(e) {
	let t = Rf(e), n = RegExp(`^PO-${t}-(\\d+)$`), r = q.map((e) => {
		let t = e.purchaseOrderNumber.match(n);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `PO-${t}-${(Math.max(0, ...r) + 1).toString().padStart(4, "0")}`;
}
function Bf(e) {
	return e?.trim() || void 0;
}
function Vf(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = k.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let n = t.units.find((t) => t.id === e.unitId);
		if (!n) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!n.active) throw Error(`${n.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		if (Nl(e.productId, e.unitId, e.orderedQuantity, "buy"), t.buyEnabled === !1) throw Error("Product is not available for purchasing.");
		let r = t.taxCode ?? "GST", i = wc(r), a = Nf({
			taxRate: i,
			orderedQuantity: e.orderedQuantity,
			unitCost: e.unitCost
		});
		return {
			id: Lf("pol"),
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
function Hf(e) {
	let t = jf.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function Uf(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var Wf = {
	subscribe(e) {
		return Ff.add(e), () => {
			Ff.delete(e);
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
	create(e) {
		Uf(e);
		let t = Hf(e.supplierId), n = Vf(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Lf("po"),
			purchaseOrderNumber: zf(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: Bf(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: Bf(e.supplierReference),
			notes: Bf(e.notes),
			lines: n,
			totals: Pf(n),
			createdAt: r,
			updatedAt: r
		};
		return q = [i, ...q], If(), i;
	},
	updateDraft(e, t) {
		let n = Wf.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		Uf(t);
		let r = Hf(t.supplierId), i = Vf(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: Bf(t.expectedDeliveryDate),
			supplierReference: Bf(t.supplierReference),
			notes: Bf(t.notes),
			lines: i,
			totals: Pf(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return q = q.map((e) => e.id === n.id ? a : e), If(), a;
	},
	approve(e) {
		let t = Wf.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return Gf(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = Wf.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return Gf(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = Wf.getById(e);
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
		return q = q.map((e) => e.id === n.id ? o : e), If(), o;
	},
	recordSupplierBill(e, t) {
		let n = Wf.getById(e);
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
			let n = Kf(e.billedQuantity + t);
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
		return q = q.map((e) => e.id === n.id ? c : e), If(), c;
	},
	reverseSupplierBill(e, t) {
		let n = Wf.getById(e);
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
				billedQuantity: Kf(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return q = q.map((e) => e.id === n.id ? c : e), If(), c;
	},
	cancel(e, t) {
		let n = Wf.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return Gf(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function Gf(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return q = q.map((t) => t.id === e.id ? n : t), If(), n;
}
function Kf(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
r("purchaseOrders", {
	repository: Wf,
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
	snapshot: () => ({ purchaseOrders: q }),
	restore: (e) => {
		q = e.purchaseOrders;
	},
	publish: () => Ff.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function J(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function qf(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function Jf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Yf({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return qf(e / t);
}
function Xf({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return Jf(e * t);
}
function Zf({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = J(e + n), a = Jf(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : qf(a / i)
	};
}
function Qf({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return Jf(e * t);
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function $f(e) {
	return Jf(e.lines.reduce((e, t) => {
		let n = Yf({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + Xf({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function ep(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function tp(e) {
	return P.requireBySystemRole(e).id;
}
function np(e) {
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
function rp(e, t) {
	return V.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function ip(e, t) {
	let n = rp(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var ap = {
	validateGoodsReceiptPosting(e) {
		let t = P.requireBySystemRole("INVENTORY"), n = P.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = $f(e);
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
		let t = V.getBySource("GOODS_RECEIPT", e.id).find((e) => !e.reversedJournalEntryId);
		if (t) return t;
		let { inventoryAccountId: n, grniAccountId: r, receiptValue: i } = this.validateGoodsReceiptPosting(e);
		return V.post({
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
		let a = ep(e.totals.subtotal - t);
		if (a !== 0) {
			let e = P.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = ep(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = rp("SUPPLIER_BILL", e.id);
		if (n) return n;
		let r = t ?? e.totals.subtotal, { variance: i } = this.validateSupplierBillPosting(e, r);
		return V.post({
			journalDate: e.billDate,
			description: `Supplier bill ${e.billNumber}`,
			reference: e.supplierInvoiceNumber,
			sourceType: "SUPPLIER_BILL",
			sourceId: e.id,
			lines: [
				{
					accountId: tp("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				{
					accountId: tp("GST_RECEIVABLE"),
					description: `GST - ${e.billNumber}`,
					debit: e.totals.taxAmount,
					credit: 0
				},
				...i === 0 ? [] : [{
					accountId: tp("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: tp("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = ip("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? V.getById(t.reversalJournalEntryId) : void 0 : V.reverse({
			journalEntryId: t.id,
			reversalDate: np(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = rp("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = Fd.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return V.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: tp("ACCOUNTS_PAYABLE"),
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
		let t = ip("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? V.getById(t.reversalJournalEntryId) : void 0 : V.reverse({
			journalEntryId: t.id,
			reversalDate: np(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return rp("SUPPLIER_CREDIT", e.id) || V.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: tp("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: tp("INVENTORY"),
					description: e.creditNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				{
					accountId: tp("GST_RECEIVABLE"),
					description: e.creditNumber,
					debit: 0,
					credit: e.totals.taxAmount
				}
			]
		});
	},
	reverseSupplierCredit(e) {
		let t = ip("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? V.getById(t.reversalJournalEntryId) : void 0 : V.reverse({
			journalEntryId: t.id,
			reversalDate: np(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, op = structuredClone([{
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
}]), sp = {
	getAll() {
		return op;
	},
	getById(e) {
		return op.find((t) => t.id === e);
	},
	getActive() {
		return op.filter((e) => e.status === "ACTIVE");
	}
}, cp = /* @__PURE__ */ new Set(), lp = [];
function up() {
	cp.forEach((e) => e());
}
function dp() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = lp.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var fp = {
	subscribe(e) {
		return cp.add(e), () => {
			cp.delete(e);
		};
	},
	getSnapshot() {
		return lp;
	},
	getAll() {
		return lp;
	},
	getByReference(e, t) {
		return lp.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return lp.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return lp.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: dp(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return lp = [t, ...lp], up(), t;
	}
};
r("inventoryMovements", {
	repository: fp,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: lp }),
	restore: (e) => {
		lp = e.movements;
	},
	publish: () => cp.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var pp = /* @__PURE__ */ new Set(), mp = [];
function hp() {
	pp.forEach((e) => e());
}
var gp = {
	subscribe(e) {
		return pp.add(e), () => {
			pp.delete(e);
		};
	},
	getSnapshot() {
		return mp;
	},
	getAll() {
		return mp;
	},
	getBalance(e, t) {
		return mp.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = gp.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return mp = mp.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? mp.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...mp], hp(), e;
	},
	replaceAll(e) {
		mp = e, hp();
	},
	clear() {
		mp = [], hp();
	}
};
r("costBalances", {
	repository: gp,
	read: "inventory.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: mp }),
	restore: (e) => {
		mp = e.balances;
	},
	publish: () => pp.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var _p = /* @__PURE__ */ new Set(), vp = [];
function yp() {
	_p.forEach((e) => e());
}
function bp() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = vp.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function xp(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var Sp = {
	subscribe(e) {
		return _p.add(e), () => {
			_p.delete(e);
		};
	},
	getSnapshot() {
		return vp;
	},
	getAll() {
		return vp;
	},
	getByReference(e, t) {
		return vp.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return vp.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return vp.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return vp.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return xp(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: bp(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = Sp.build(e);
		return vp = [t, ...vp], yp(), t;
	},
	replaceAll(e) {
		vp = e, yp();
	},
	clear() {
		vp = [], yp();
	}
};
r("costMovements", {
	repository: Sp,
	read: "inventory.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: vp }),
	restore: (e) => {
		vp = e.movements;
	},
	publish: () => _p.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function Cp(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function wp(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function Tp(e, t) {
	let n = A(e);
	if (!n) throw Error("Product was not found.");
	let r = Sc.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = _c(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function Ep(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = Jf(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(Jf(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function Dp(e) {
	if (e && Sp.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function Op({ movement: e, balance: t }) {
	let n = Sp.getAll(), r = gp.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	Sp.replaceAll(i), gp.replaceAll(a);
}
function kp(e) {
	if (Cp(e.quantity), wp(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	Dp(e.inventoryMovementId);
	let { policy: t, unit: n } = Tp(e.productId, e.unitId), r = J(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = Yf({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = Xf({
		quantityBase: r,
		unitCostBase: i
	}), o = gp.getBalance(e.siteId, e.productId);
	o && Ep(o, t.baseUnitId);
	let s = Zf({
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
	Ep(l, t.baseUnitId);
	let u = Sp.build({
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
	return Op({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function Ap(e) {
	Cp(e.quantity), wp(e.occurredAt), Dp(e.inventoryMovementId);
	let { policy: t, unit: n } = Tp(e.productId, e.unitId), r = J(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = gp.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (Ep(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = qf(i.averageCostPerBaseUnit), o = Qf({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = J(i.quantityOnHand - r), c = s === 0, l = Jf(c ? -i.inventoryValue : -o), u = c ? 0 : Jf(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : qf(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	Ep(p, t.baseUnitId);
	let m = Sp.build({
		movementType: e.movementType ?? "ISSUE",
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: t.baseUnitId,
		quantityBase: J(-r),
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
	return Op({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function jp(e) {
	if (Cp(e.quantityBase), wp(e.occurredAt), Dp(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = A(e.productId);
	if (!t) throw Error("Product was not found.");
	let n = Sc.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = J(e.quantityBase), i = qf(e.unitCostBase), a = Jf(e.inventoryValue), o = gp.getBalance(e.siteId, e.productId);
	o && Ep(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = J(s + r), u = Jf(c + a), d = l === 0 ? 0 : qf(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	Ep(p, n.baseUnitId);
	let m = Sp.build({
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
	return Op({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var Mp = /* @__PURE__ */ new Set(), Np = [];
function Pp() {
	Mp.forEach((e) => e());
}
function Fp(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var Ip = {
	subscribe(e) {
		return Mp.add(e), () => {
			Mp.delete(e);
		};
	},
	getSnapshot() {
		return Np;
	},
	getAll() {
		return Np;
	},
	getBalance(e, t) {
		return Np.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = Ip.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: Fp(i.quantityOnHand + r),
				updatedAt: a
			};
			return Np = Np.map((r) => r.siteId === e && r.productId === t ? n : r), Pp(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: Fp(r),
			updatedAt: a
		};
		return Np = [o, ...Np], Pp(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = Ip.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = Fp(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Np = Np.map((n) => n.siteId === e && n.productId === t ? o : n), Pp(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of fp.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: Fp((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		Np = Array.from(e.values()), Pp();
	}
};
r("stock", {
	repository: Ip,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: Np }),
	restore: (e) => {
		Np = e.balances;
	},
	publish: () => Mp.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/goodsReceiptRepository.ts
var Lp = /* @__PURE__ */ new Set(), Rp = B.read().goodsReceipts;
B.onRollback(() => {
	Rp = B.read().goodsReceipts;
});
function zp() {
	try {
		B.update("goodsReceipts", Rp);
	} catch (e) {
		throw Rp = B.read().goodsReceipts, e;
	}
	Lp.forEach((e) => B.notify(e));
}
function Bp(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Vp(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = Rp.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Hp(e) {
	return e?.trim() || void 0;
}
var Up = {
	subscribe(e) {
		return Lp.add(e), () => {
			Lp.delete(e);
		};
	},
	getSnapshot() {
		return Rp;
	},
	getAll() {
		return Rp;
	},
	getById(e) {
		return Rp.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return Rp.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = Wf.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = sp.getById(e.siteId);
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
			let r = Bp(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!A(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = _c(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = Bp(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: Vp(e.receiptDate),
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
			supplierDeliveryReference: Hp(e.supplierDeliveryReference),
			notes: Hp(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		ap.validateGoodsReceiptPosting(s), z();
		let c = R.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return R.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = A(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				R.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = fp.create({
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
				}), R.runStep(c, `COST:${r.id}`, () => {
					let t = l.get(r.id);
					if (!t) throw Error(`Missing inventory movement for ${r.id}`);
					kp({
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
				}), R.runStep(c, `STOCK:${r.id}`, () => {
					Ip.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			R.runStep(c, "JOURNAL", () => {
				ap.postGoodsReceipt(s);
			}), R.runStep(c, "PURCHASE_ORDER", () => {
				Wf.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), R.runStep(c, "RECEIPT", () => {
				Rp = [s, ...Rp], zp();
			});
		}), R.recover(c), s;
	}
};
r("goodsReceipts", {
	repository: Up,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: Rp }),
	restore: (e) => {
		Rp = e.goodsReceipts;
	},
	publish: () => Lp.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var Wp = 1e-4;
function Gp(e) {
	return Jf(e);
}
function Kp(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - J(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function qp(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function Jp(e, t, n) {
	let r = Yf({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return Xf({
		quantityBase: J(e * n),
		unitCostBase: r
	});
}
function Yp(e, t, n) {
	let r = [], i = n.filter((e) => e.status === "ACTIVE");
	for (let n of t) if (n.purchaseOrderId === e && n.status === "POSTED") for (let e of n.lines) {
		let t = J(i.filter((t) => t.goodsReceiptId === n.id && t.goodsReceiptLineId === e.id).reduce((e, t) => e + t.matchedQuantity, 0)), a = J(e.receivedQuantity - t);
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
function Xp(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = Yp(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), Kp(e.quantity), qp(e.billUnitCost);
		let r = J(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > Wp);
		if (J(d.reduce((e, t) => e + t.availableQuantity, 0)) + Wp < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= Wp) break;
			let s = J(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = J(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = Xf({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: Yf({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = Gp(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), ee = Math.abs(o.availableQuantity - s) <= Wp ? Gp(p - m) : Jp(s, o.receiptUnitCost, o.conversionToBase);
			if (ee < 0) throw Error("Receipt cost has been overallocated.");
			let te = Gp(s * e.billUnitCost), ne = Gp(te - ee);
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
			}), o.availableQuantity = J(o.availableQuantity - s), r = J(r - s);
		}
		if (r > Wp) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = Gp(Gp(e.quantity * e.billUnitCost) - Gp(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = Gp(p.matchedBillValue + f), p.priceVariance = Gp(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = J(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = J(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = Gp(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = Gp(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: Gp(p - f)
	};
}
var Zp = {
	calculate: Xp,
	getAvailableReceiptLines(e, t, n) {
		return Yp(e, t, n);
	}
}, Qp = B.read().receiptMatches;
B.onRollback(() => {
	Qp = B.read().receiptMatches;
});
var $p = /* @__PURE__ */ new Set(), em = () => {
	try {
		B.update("receiptMatches", Qp);
	} catch (e) {
		throw Qp = B.read().receiptMatches, e;
	}
	$p.forEach((e) => B.notify(e));
}, tm = {
	getAll() {
		return [...Qp];
	},
	subscribe(e) {
		return $p.add(e), () => {
			$p.delete(e);
		};
	},
	getSnapshot() {
		return Qp;
	},
	getByBill(e) {
		return Qp.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (Qp.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		Qp = [...Qp, ...t], em();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		Qp = Qp.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), em();
	}
};
r("receiptMatches", {
	repository: tm,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: Qp }),
	restore: (e) => {
		Qp = e.matches;
	},
	publish: () => $p.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
function nm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function rm({ quantity: e, unitCost: t, taxRate: n = .1 }) {
	let r = nm(e * t), i = nm(r * n);
	return {
		lineSubtotal: r,
		taxAmount: i,
		lineTotal: nm(r + i)
	};
}
function im(e) {
	let t = nm(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = nm(e.reduce((e, t) => e + t.taxAmount, 0)), r = nm(t + n);
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
var am = /* @__PURE__ */ new Set(), Y = B.read().supplierBills;
B.onRollback(() => {
	Y = B.read().supplierBills;
});
function om() {
	try {
		B.update("supplierBills", Y);
	} catch (e) {
		throw Y = B.read().supplierBills, e;
	}
	am.forEach((e) => B.notify(e));
}
function sm(e) {
	return e?.trim() || void 0;
}
function cm(e) {
	let t = `BILL-${e.slice(0, 4)}-`, n = Y.filter((e) => e.billNumber.startsWith(t)).map((e) => Number.parseInt(e.billNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
var lm = {
	subscribe(e) {
		return am.add(e), () => {
			am.delete(e);
		};
	},
	getSnapshot() {
		return Y;
	},
	getAll() {
		return Y;
	},
	getById(e) {
		return Y.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return Y.filter((t) => t.supplierId === e);
	},
	applyPayment(e, t) {
		let n = Y.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a payment.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment allocation must be greater than zero.");
		let r = dm(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = dm(n.totals.amountPaid + r), a = dm(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Y = Y.map((t) => t.id === e ? o : t), om(), o;
	},
	reversePayment(e, t) {
		let n = Y.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = dm(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = dm(Math.max(0, n.totals.amountPaid - r)), a = dm(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Y = Y.map((t) => t.id === e ? o : t), om(), o;
	},
	applyCredit(e, t) {
		let n = Y.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = dm(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = dm(n.totals.amountCredited + r), a = dm(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Y = Y.map((t) => t.id === e ? o : t), om(), o;
	},
	reverseCredit(e, t) {
		let n = Y.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = dm(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = dm(Math.max(0, n.totals.amountCredited - r)), a = dm(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Y = Y.map((t) => t.id === e ? o : t), om(), o;
	},
	markVoid(e, t) {
		let r = Y.find((t) => t.id === e);
		if (!r) throw Error("Supplier bill was not found.");
		if (r.status === "VOID") throw Error("This supplier bill has already been voided.");
		let i = t.trim();
		if (i.length < 3) throw Error("A void reason is required.");
		if (r.status !== "OPEN" || r.totals.amountPaid > 0 || r.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if (tm.getByBill(r.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...r,
			status: "VOID",
			voidedAt: a,
			voidReason: i,
			updatedAt: a
		};
		z();
		let s = R.begin("SUPPLIER_BILL_VOID", r.id).key;
		return R.registerRecovery(s, () => {
			R.runStep(s, "REVERSAL_JOURNAL", () => {
				ap.reverseSupplierBill(o);
			}), R.runStep(s, "PURCHASE_ORDER", () => {
				Wf.reverseSupplierBill(r.purchaseOrderId, r.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), R.runStep(s, "MATCHES", () => {
				tm.reverseForBill(r.id, i, n(a));
			}), R.runStep(s, "BILL", () => {
				Y = Y.map((e) => e.id === r.id ? o : e), om();
			});
		}), R.recover(s), o;
	},
	getByPurchaseOrder(e) {
		return Y.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = Wf.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (![
			"PARTIALLY_RECEIVED",
			"RECEIVED",
			"BILLED"
		].includes(t.status)) throw Error("Supplier bills can only be created for purchase orders with received goods.");
		let n = e.supplierInvoiceNumber.trim();
		if (!n) throw Error("Supplier invoice number is required.");
		if (Y.some((e) => e.supplierId === t.supplierId && e.supplierInvoiceNumber.toLowerCase() === n.toLowerCase() && e.status !== "VOID")) throw Error("This supplier invoice number has already been entered.");
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
			let r = um(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = rm({
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
		}), o = im(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: cm(e.billDate),
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
			notes: sm(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = Zp.calculate({
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
			receipts: Up.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: tm.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		ap.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), z();
		let u = R.begin("SUPPLIER_BILL", c.id).key;
		return R.registerRecovery(u, () => {
			R.runStep(u, "JOURNAL", () => {
				ap.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), R.runStep(u, "PURCHASE_ORDER", () => {
				Wf.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), R.runStep(u, "MATCHES", () => {
				tm.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), R.runStep(u, "BILL", () => {
				Y = [c, ...Y], om();
			});
		}), R.recover(u), c;
	}
};
function um(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function dm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
r("supplierBills", {
	repository: lm,
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
	snapshot: () => ({ supplierBills: Y }),
	restore: (e) => {
		Y = e.supplierBills;
	},
	publish: () => am.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierPaymentRepository.ts
var fm = /* @__PURE__ */ new Set(), X = B.read().supplierPayments;
B.onRollback(() => {
	X = B.read().supplierPayments;
});
function pm() {
	B.update("supplierPayments", X), fm.forEach((e) => B.notify(e));
}
var mm = {
	subscribe(e) {
		return fm.add(e), () => {
			fm.delete(e);
		};
	},
	getSnapshot() {
		return X;
	},
	getAll() {
		return X;
	},
	getById(e) {
		return X.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return X.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return X.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: gm(e.reference),
			notes: gm(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: _m(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = X.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (a(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = jf.getById(e.supplierId);
		if (!r) throw Error("Supplier was not found.");
		if (!e.paymentDate) throw Error("Payment date is required.");
		if (!e.method) throw Error("Payment method is required.");
		if (!e.bankAccountId) throw Error("Bank account is required.");
		let i = Fd.getById(e.bankAccountId);
		if (!i) throw Error("Bank account was not found.");
		if (!i.active) throw Error("The selected bank account is inactive.");
		let o = e.allocations.filter((e) => Number.isFinite(e.amount) && e.amount > 0);
		if (o.length === 0) throw Error("Allocate the payment to at least one supplier bill.");
		let s = /* @__PURE__ */ new Set(), c = o.map((t) => {
			if (s.has(t.supplierBillId)) throw Error("A supplier bill cannot appear more than once in the same payment.");
			s.add(t.supplierBillId);
			let n = lm.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = _m(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${vm(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), l = _m(c.reduce((e, t) => e + t.amount, 0));
		if (l <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of c) lm.applyPayment(e.supplierBillId, e.amount);
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: hm(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: l,
			method: e.method,
			bankAccountId: i.id,
			reference: gm(e.reference),
			notes: gm(e.notes),
			allocations: c,
			status: "POSTED",
			createdAt: u,
			updatedAt: u
		};
		return X = [d, ...X], pm(), ap.postSupplierPayment(d), d;
	},
	reverse(e, t) {
		let n = X.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = lm.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) lm.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return X = X.map((t) => t.id === e ? a : t), pm(), ap.reverseSupplierPayment(a), a;
	}
};
function hm(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = X.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function gm(e) {
	return e?.trim() || void 0;
}
function _m(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function vm(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: "AUD"
	}).format(e);
}
var ym = mm.create;
mm.create = function(...e) {
	return z(), B.transaction(() => ym.apply(mm, e));
};
var bm = mm.reverse;
mm.reverse = function(...e) {
	return z(), B.transaction(() => bm.apply(mm, e));
}, r("supplierPayments", {
	repository: mm,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: X }),
	restore: (e) => {
		X = e.supplierPayments;
	},
	publish: () => fm.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var xm = /* @__PURE__ */ new Set(), Z = B.read().supplierCredits, Q = B.read().supplierCreditAllocations, Sm = B.read().supplierCredits, Cm = B.read().supplierCreditAllocations;
B.onRollback(() => {
	Z = B.read().supplierCredits, Q = B.read().supplierCreditAllocations, Sm = Z, Cm = Q;
});
function wm() {
	B.update("supplierCredits", Z), B.update("supplierCreditAllocations", Q), Sm = [...Z], Cm = [...Q], xm.forEach((e) => B.notify(e));
}
var $ = {
	subscribe(e) {
		return xm.add(e), () => {
			xm.delete(e);
		};
	},
	getSnapshot() {
		return Sm;
	},
	getAllocationSnapshot() {
		return Cm;
	},
	getAll() {
		return Sm;
	},
	getAllAllocations() {
		return Cm;
	},
	getById(e) {
		return Z.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return Z.filter((t) => t.supplierId === e);
	},
	getBySourceBill(e) {
		return Z.filter((t) => t.sourceSupplierBillId === e);
	},
	getAllocationById(e) {
		return Q.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return Q.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return Q.filter((t) => t.supplierBillId === e);
	},
	create(e) {
		let t = lm.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (Z.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!Om(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, t) => {
			let n = i.get(e.supplierBillLineId);
			if (!n) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(n.id)) throw Error(`${n.description} appears more than once in the supplier credit.`);
			a.add(n.id);
			let r = Am(e.quantity);
			if (!Number.isFinite(r) || r <= 0) throw Error(`${n.description} credit quantity must be greater than zero.`);
			if (r > n.quantity) throw Error(`${n.description} credit quantity cannot exceed the source bill quantity.`);
			let o = km(e.unitCost);
			if (!Number.isFinite(o) || o < 0) throw Error(`${n.description} unit cost cannot be negative.`);
			if (o > n.unitCost) throw Error(`${n.description} credit unit cost cannot exceed the source bill unit cost.`);
			let s = km(r * o), c = km(s * (n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1))), l = km(s + c);
			return {
				id: Dm(`supplier-credit-line-${t + 1}`),
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
		}), s = km(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = km(o.reduce((e, t) => e + t.taxAmount, 0)), l = km(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (km(km(Z.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > km(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: Dm("supplier-credit"),
			creditNumber: Em(e.creditDate),
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
		return Z = [d, ...Z], wm(), ap.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = Z.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = lm.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!Om(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = km(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: Dm("supplier-credit-allocation"),
			allocationNumber: Tm(e.allocationDate),
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
		lm.applyCredit(n.id, r);
		let o = km(t.amountApplied + r), s = km(Math.max(0, t.totals.total - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return Q = [a, ...Q], Z = Z.map((e) => e.id === t.id ? c : e), wm(), a;
	},
	reverseAllocation(e) {
		let t = Q.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = Z.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = lm.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		lm.reverseCredit(i.id, t.amount);
		let o = km(Math.max(0, r.amountApplied - t.amount)), s = km(Math.max(0, r.totals.total - o)), c = {
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
		return Z = Z.map((e) => e.id === r.id ? c : e), Q = Q.map((e) => e.id === t.id ? l : e), wm(), l;
	},
	voidCredit(e) {
		let t = Z.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (Q.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: r,
			voidReason: n,
			updatedAt: r
		};
		return Z = Z.map((e) => e.id === t.id ? i : e), wm(), ap.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!Q.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return Q = Q.map((t) => t.id === e.id ? e : t), wm(), e;
	},
	update(e) {
		if (!Z.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return Z = Z.map((t) => t.id === e.id ? e : t), wm(), e;
	}
};
function Tm(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = Q.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Em(e) {
	let t = `SC-${e.slice(0, 4)}-`, n = Z.filter((e) => e.creditNumber.startsWith(t)).map((e) => Number.parseInt(e.creditNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Dm(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function Om(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function km(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Am(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var jm = $.create;
$.create = function(...e) {
	return z(), B.transaction(() => jm.apply($, e));
};
var Mm = $.applyToBill;
$.applyToBill = function(...e) {
	return z(), B.transaction(() => Mm.apply($, e));
};
var Nm = $.reverseAllocation;
$.reverseAllocation = function(...e) {
	return z(), B.transaction(() => Nm.apply($, e));
};
var Pm = $.voidCredit;
$.voidCredit = function(...e) {
	return z(), B.transaction(() => Pm.apply($, e));
};
var Fm = $.update;
$.update = function(...e) {
	return z(), B.transaction(() => Fm.apply($, e));
};
var Im = $.updateAllocation;
$.updateAllocation = function(...e) {
	return z(), B.transaction(() => Im.apply($, e));
}, r("supplierCredits", {
	repository: $,
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
		supplierCredits: Z,
		allocations: Q
	}),
	restore: (e) => {
		Z = e.supplierCredits, Q = e.allocations, Sm = [...Z], Cm = [...Q];
	},
	publish: () => xm.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/financialConsistencyAudit.ts
function Lm(e) {
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
var Rm = /* @__PURE__ */ new Set(), zm = B.read().transactions, Bm = B.read().transfers;
B.onRollback(() => {
	let e = B.read();
	zm = e.transactions, Bm = e.transfers;
});
function Vm() {
	Rm.forEach((e) => B.notify(e));
}
function Hm(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function Um(e) {
	return e?.trim() || void 0;
}
function Wm(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function Gm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Km(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function qm(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var Jm = {
	subscribe(e) {
		return Rm.add(e), () => {
			Rm.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return zm;
	},
	getTransfersSnapshot() {
		return Bm;
	},
	getTransactions() {
		return zm;
	},
	getTransfers() {
		return Bm;
	},
	createTransaction(e, t) {
		if (Wm(e.transactionDate), a(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = Gm(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Hm(e.description, "Description"), i = Fd.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let o = P.requireById(i.glAccountId);
		if (!o.active) throw Error("The selected bank GL account is inactive.");
		let s = P.requireById(e.offsetAccountId);
		if (!s.active) throw Error("The offset account is inactive.");
		if (!s.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (s.id === o.id) throw Error("Bank and offset accounts must be different.");
		if (Fd.getByGlAccountId(s.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let c = Km("banktxn"), l = qm("BTXN", e.transactionDate, zm.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = L.begin(u, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = zm.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			u && L.bindResult(u, c);
			let t = V.post({
				journalDate: e.transactionDate,
				description: r,
				reference: Um(e.reference),
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
				reference: Um(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [a, ...zm];
			if (B.update("transactions", d), zm = d, Vm(), u) {
				let e = V.getBySource("BANK_TRANSACTION", c);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Bank GL posting could not be verified uniquely.");
			}
			return a;
		} catch (e) {
			if (u) try {
				L.flagForReview(u, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	},
	createTransfer(e, t) {
		Wm(e.transferDate), a(e.transferDate, "Transfer date");
		let n = Gm(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Hm(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = Fd.requireById(e.fromBankAccountId), o = Fd.requireById(e.toBankAccountId);
		if (!i.active || !o.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== o.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < o.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let s = P.requireById(i.glAccountId), c = P.requireById(o.glAccountId);
		if (!s.active || !c.active) throw Error("Both bank GL accounts must be active.");
		if (s.id === c.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let l = Km("banktrf"), u = qm("BTRF", e.transferDate, Bm.length + 1), d = t?.trim();
		if (t !== void 0 && !d) throw Error("Operation ID cannot be empty");
		if (d) {
			let t = L.begin(d, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Bm.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			d && L.bindResult(d, l);
			let t = V.post({
				journalDate: e.transferDate,
				description: r,
				reference: Um(e.reference),
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
				reference: Um(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [a, ...Bm];
			if (B.update("transfers", f), Bm = f, Vm(), d) {
				let e = V.getBySource("BANK_TRANSFER", l);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Transfer GL posting could not be verified uniquely.");
			}
			return a;
		} catch (e) {
			if (d) try {
				L.flagForReview(d, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	}
}, Ym = Jm.createTransaction;
Jm.createTransaction = function(e, t) {
	z();
	let n;
	try {
		return n = B.transaction(() => Ym.call(Jm, e, t)), t && L.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = L.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				L.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
};
var Xm = Jm.createTransfer;
Jm.createTransfer = function(e, t) {
	z();
	let n;
	try {
		return n = B.transaction(() => Xm.call(Jm, e, t)), t && L.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = L.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				L.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
}, r("bankTransactions", {
	repository: Jm,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: zm,
		bankTransfers: Bm
	}),
	restore: (e) => {
		zm = e.bankTransactions, Bm = e.bankTransfers;
	},
	publish: () => Rm.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function Zm() {
	return Lm({
		transactions: Jm.getTransactions(),
		transfers: Jm.getTransfers(),
		payments: Vd.getAll(),
		journals: V.getAll(),
		invoices: sf.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: W.getAll(),
		supplierBills: lm.getAll(),
		supplierPayments: mm.getAll(),
		supplierCredits: $.getAll()
	});
}
//#endregion
//#region src/features/sales/data/invoiceBalanceAsAtService.ts
function Qm(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= th(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: nh(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => $m(e, r)), a = nh(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && eh(t, r)), s = nh(o.reduce((e, t) => e + t.amount, 0)), c = nh(e.totals.total), l = nh(Math.max(0, c - a - s));
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
function $m(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < th(e.reversedAt) : !1;
}
function eh(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < th(e.reversedAt) : !1;
}
function th(e) {
	return n(e);
}
function nh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function rh(e, t, n) {
	let r = oh(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= ah(e.voidedAt)) return ih(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && eh(t, n)), a = oh(i.reduce((e, t) => e + t.amount, 0)), o = oh(Math.max(0, r - a));
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
function ih(e, t, n) {
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
function ah(e) {
	return n(e);
}
function oh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function sh(e, t, n = [], r = [], i = [], a = uh()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = Qm(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = ch(e.dueDate, a);
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
		current: dh(s.current),
		days1To30: dh(s.days1To30),
		days31To60: dh(s.days31To60),
		days61To90: dh(s.days61To90),
		days90Plus: dh(s.days90Plus)
	}, p = dh(c), m = dh(l), ee = dh(i.reduce((t, n) => n.customerId === e.id ? t + rh(n, r, a).amountAvailable : t, 0)), te = dh(p - ee);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: ee,
		netAccountBalance: te,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: dh(Math.max(0, e.creditLimit - Math.max(0, te))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function ch(e, t = uh()) {
	let n = lh(e), r = lh(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function lh(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function uh() {
	let e = /* @__PURE__ */ new Date();
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
function dh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function fh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ph(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function mh(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? fh(t - n) : fh(n - t);
}
function hh(e, t, n) {
	ph(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = fh(t + r.debit), n = fh(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: mh(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = fh(r.reduce((e, t) => e + t.totalDebit, 0)), o = fh(r.reduce((e, t) => e + t.totalCredit, 0));
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
function gh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function _h({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = sh(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: gh(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = gh(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = gh(hh(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = gh(l - d);
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
function vh(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && yh(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = bh(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && yh(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = bh(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && yh(n.reversedAt) <= r ? t : t + n.amount, 0)), o = bh(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: bh(Math.max(0, o - i - a))
	};
}
function yh(e) {
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
function bh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function xh(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && Sh(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = Ch(e.totals.total), i = Ch(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && Sh(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: Ch(Math.max(0, r - i))
	};
}
function Sh(e) {
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
function Ch(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function wh(e, t, n = [], r = [], i = [], a = jh()) {
	let o = Dh(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = vh(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = Eh(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = Ah(r.reduce((t, n) => n.supplierId === e.id ? t + xh(n, i, a).amountAvailable : t, 0)), p = Ah(s), m = Ah(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: Ah(c),
		aging: Oh(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function Th(e, t, n = [], r = [], i = [], a = jh()) {
	let o = Dh(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let ee of e) {
		let e = wh(ee, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: Ah(s),
		unallocatedCredit: Ah(c),
		totalOutstanding: Ah(l),
		overdueAmount: Ah(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: Oh(o)
	};
}
function Eh(e, t = jh()) {
	let n = kh(e), r = kh(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Dh() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function Oh(e) {
	return {
		current: Ah(e.current),
		days1To30: Ah(e.days1To30),
		days31To60: Ah(e.days31To60),
		days61To90: Ah(e.days61To90),
		days90Plus: Ah(e.days90Plus)
	};
}
function kh(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function Ah(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function jh() {
	let e = /* @__PURE__ */ new Date();
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function Mh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Nh({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = Th(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = Mh(hh(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = Mh(c.totalOutstanding), f = Mh(d - u);
	return {
		asOfDate: s,
		grossOutstanding: Mh(c.grossOutstanding),
		unallocatedCredit: Mh(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function Ph(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function Fh(e) {
	return e.slice(0, 10);
}
function Ih(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function Lh(e, t) {
	Ph(t);
	let n = e.filter((e) => Fh(e.occurredAt) <= t).slice().sort(Ih), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = J(n.quantityOnHand + e.quantityBase), a = Jf(n.inventoryValue + e.valueChange);
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
		let t = sp.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = A(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : qf(e.inventoryValue / e.quantityOnHand);
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
		totalQuantity: J(i.reduce((e, t) => e + t.quantityOnHand, 0)),
		totalInventoryValue: Jf(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function Rh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function zh(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function Bh({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	zh(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = Lh(n, r), o = Rh(hh(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = Rh(a.totalInventoryValue), c = Rh(s - o);
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
function Vh(e) {
	let t = s(), r = [], i = (e, t) => r.push({
		code: e,
		message: t
	});
	e.endDate >= n((/* @__PURE__ */ new Date()).toISOString()) && i("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of L.getUnresolved()) i("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of t.purchaseOperations) e.status !== "POSTED" && i("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of Zm()) i(e.code, `${e.entityId}: ${e.message}`);
	let a = {
		accounts: t.accounts.accounts,
		journalEntries: t.journals.journalEntries,
		asOfDate: e.endDate
	}, o = [
		["AR", () => _h({
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
		["AP", () => Nh({
			...a,
			suppliers: t.suppliers.suppliers,
			bills: t.supplierBills.supplierBills,
			payments: t.supplierPayments.supplierPayments,
			credits: t.supplierCredits.supplierCredits,
			creditAllocations: t.supplierCredits.allocations
		})],
		["INVENTORY", () => Bh({
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
function Hh(e) {
	return P.requireBySystemRole(e).id;
}
function Uh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Wh(e) {
	return V.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function Gh(e) {
	let t = Sp.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var Kh = {
	postSalesFulfilment(e) {
		let t = Wh(e.id);
		if (t) return t;
		let n = Uh(Gh(e).reduce((e, t) => {
			if (t.valueChange > 0) throw Error(`Sales fulfilment cost movement ${t.costMovementNumber} has an invalid positive inventory value change.`);
			return e - t.valueChange;
		}, 0));
		if (!Number.isFinite(n) || n < 0) throw Error("Sales fulfilment COGS amount is invalid.");
		if (n !== 0) return V.post({
			journalDate: e.fulfilmentDate,
			description: `COGS for sales fulfilment ${e.fulfilmentNumber}`,
			reference: e.fulfilmentNumber,
			sourceType: "SALES_FULFILMENT",
			sourceId: e.id,
			lines: [{
				accountId: Hh("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: Hh("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = Wh(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? V.getById(r.reversalJournalEntryId) : void 0 : V.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, qh = /* @__PURE__ */ new Set(), Jh = [], Yh = Jh;
function Xh() {
	Yh = Jh, qh.forEach((e) => e());
}
function Zh() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Jh.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function Qh(e, t) {
	return J(Jh.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function $h(e) {
	let t = sf.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.map((e) => Qh(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.every((e, t) => n[t] >= J(e.quantity));
	sf.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function eg(e) {
	let t = Sp.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
r("fulfilments", {
	repository: {
		subscribe(e) {
			return qh.add(e), () => {
				qh.delete(e);
			};
		},
		getSnapshot() {
			return Yh;
		},
		getAll() {
			return Yh;
		},
		getById(e) {
			return Jh.find((t) => t.id === e);
		},
		getBySalesOrder(e) {
			return Jh.filter((t) => t.salesOrderId === e);
		},
		getFulfilledQuantity: Qh,
		getRemainingQuantity(e, t) {
			let n = sf.getById(e);
			if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
			let r = n.lines.find((e) => e.id === t);
			if (!r) throw Error("Sales order line was not found.");
			return J(r.quantity - Qh(e, t));
		},
		create(e) {
			let t = sf.getById(e.salesOrderId);
			if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
			let n = t;
			if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED") throw Error("Only a confirmed or partially fulfilled sales order can be fulfilled.");
			let r = sp.getById(e.siteId);
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
				let i = A(t.productId);
				if (!i) throw Error(`Product ${t.sku} was not found.`);
				let o = _c(t.productId, t.unitId);
				if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
				if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
				let s = J(e.fulfilledQuantity), c = Qh(n.id, t.id);
				if (s > J(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
				let l = J(s * o.conversionToBase), u = Ip.getBalance(r.id, t.productId);
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
				s.set(e.orderLine.productId, J(t + e.fulfilledBaseQuantity));
			}
			for (let [e, t] of s) {
				let n = Ip.getBalance(r.id, e);
				if (!n || n.quantityOnHand < t) {
					let t = A(e);
					throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
				}
			}
			let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = Zh(), d = o.map((e) => ({
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
				let i = A(t.productId);
				if (!i) throw Error(`Product ${t.sku} was not found.`);
				let a = fp.create({
					movementType: "SALE",
					siteId: r.id,
					productId: t.productId,
					baseUnitId: i.baseUnitId,
					quantityBase: J(-t.fulfilledBaseQuantity),
					transactionUnitId: t.unitId,
					transactionUnitSymbol: t.unitSymbol,
					transactionQuantity: J(-t.fulfilledQuantity),
					conversionToBase: t.conversionToBase,
					referenceType: "SALES_FULFILMENT",
					referenceId: f.id,
					referenceNumber: f.fulfilmentNumber,
					salesOrderId: n.id,
					salesOrderNumber: n.documentNumber,
					occurredAt: e.fulfilmentDate,
					notes: `Sales fulfilment ${f.fulfilmentNumber}`
				});
				Ap({
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
				}), Ip.issue({
					siteId: r.id,
					productId: t.productId,
					baseUnitId: i.baseUnitId,
					quantityBase: t.fulfilledBaseQuantity
				});
			}
			return Kh.postSalesFulfilment(f), Jh = [f, ...Jh], Xh(), $h(n.id), f;
		},
		void(e) {
			let t = Jh.find((t) => t.id === e.fulfilmentId);
			if (!t) throw Error("Sales fulfilment was not found.");
			if (t.status === "VOIDED") throw Error("Sales fulfilment has already been voided.");
			if (Number.isNaN(Date.parse(e.voidDate))) throw Error("Fulfilment void date is invalid.");
			if (e.voidDate < t.fulfilmentDate) throw Error("Fulfilment void date cannot be earlier than the fulfilment date.");
			let n = e.reason.trim();
			if (n.length < 3) throw Error("Fulfilment void reason must contain at least 3 characters.");
			let r = sf.getById(t.salesOrderId);
			if (!r || r.type !== "SALES_ORDER") throw Error("Sales order was not found.");
			if (r.status === "INVOICED") throw Error("Cannot void a sales fulfilment for an invoiced sales order.");
			if (r.status !== "CONFIRMED" && r.status !== "PARTIALLY_FULFILLED" && r.status !== "FULFILLED") throw Error(`Cannot void a sales fulfilment when the sales order status is ${r.status}.`);
			let i = eg(t), a = /* @__PURE__ */ new Set(), o = t.lines.map((e) => {
				let n = A(e.productId);
				if (!n) throw Error(`Product ${e.sku} was not found.`);
				let r = i.find((n) => !a.has(n.id) && n.siteId === t.siteId && n.productId === e.productId && Math.abs(n.quantityBase) === e.fulfilledBaseQuantity);
				if (!r) throw Error(`Unique original inventory cost issue for ${e.sku} was not found.`);
				return a.add(r.id), {
					line: e,
					product: n,
					originalIssue: r
				};
			});
			Kh.reverseSalesFulfilment({
				fulfilment: t,
				reversalDate: e.voidDate,
				reason: n
			});
			for (let r of o) {
				let { line: i, product: a, originalIssue: o } = r, s = fp.create({
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
				jp({
					siteId: t.siteId,
					productId: i.productId,
					quantityBase: i.fulfilledBaseQuantity,
					unitCostBase: o.unitCostBase,
					inventoryValue: Jf(Math.abs(o.valueChange)),
					referenceType: "SALE",
					referenceId: t.id,
					referenceNumber: t.fulfilmentNumber,
					inventoryMovementId: s.id,
					occurredAt: e.voidDate,
					notes: `Void sales fulfilment ${t.fulfilmentNumber}: ${n}`
				}), Ip.receive({
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
			return Jh = Jh.map((e) => e.id === s.id ? s : e), Xh(), $h(t.salesOrderId), s;
		}
	},
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: Jh }),
	restore: (e) => {
		Jh = e.fulfilments, Yh = Jh;
	},
	publish: () => qh.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchasePostingRecoveryAuthorization.ts
var tg = null, ng = {
	configureTrustedSession(e) {
		tg = e;
	},
	clear() {
		tg = null;
	},
	current() {
		return tg?.() ?? null;
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
}, rg = "htt.purchasePosting.manualRecoveryAudit.v1";
function ig() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(rg) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var ag = ig();
function og(e) {
	ag.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(rg, JSON.stringify(ag));
	} catch {}
}
r("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return ag.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = R.get(e);
			return ng.canRecover() && t?.status === "RECOVERY_REQUIRED" && R.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = ng.requireRecoveryPermission(), n = R.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!R.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				R.recover(e), og({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw og({
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
	snapshot: () => ag,
	restore: (e) => {
		ag.splice(0, ag.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/banking/data/bankRegisterService.ts
function sg(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function cg(e, t) {
	a(e, t);
}
function lg(e, t, n) {
	cg(e.openingBalanceDate, "Opening balance date"), cg(n, "As-at date");
	let r = t.filter((t) => t.journalDate >= e.openingBalanceDate && t.journalDate <= n).flatMap((t) => t.lines.filter((t) => t.accountId === e.glAccountId).map((e) => ({
		entry: t,
		line: e
	}))).sort((e, t) => {
		let n = e.entry.journalDate.localeCompare(t.entry.journalDate);
		if (n !== 0) return n;
		let r = e.entry.createdAt.localeCompare(t.entry.createdAt);
		return r === 0 ? e.line.id.localeCompare(t.line.id) : r;
	}), i = sg(e.openingBalance), a = 0, o = 0, s = r.map(({ entry: t, line: n }) => {
		let r = sg(n.debit), s = sg(n.credit);
		return a = sg(a + r), o = sg(o + s), i = sg(i + r - s), {
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
		openingBalance: sg(e.openingBalance),
		moneyIn: a,
		moneyOut: o,
		closingBalance: i,
		transactionCount: s.length,
		transactions: s
	};
}
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function ug(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function dg(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) {
		if (r.has(t.id)) {
			i = ug(i + t.moneyIn), a = ug(a + t.moneyOut);
			continue;
		}
		o = ug(o + t.moneyIn), s = ug(s + t.moneyOut);
	}
	let c = ug(ug(t) + o - s), l = ug(e.closingBalance), u = ug(c - l);
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
var fg = /* @__PURE__ */ new Set(), pg = B.read().reconciliations;
B.onRollback(() => {
	pg = B.read().reconciliations;
});
function mg() {
	B.update("reconciliations", pg), fg.forEach((e) => B.notify(e));
}
function hg(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function gg(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function _g() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function vg(e) {
	return `BREC-${e.slice(0, 4)}-${String(pg.length + 1).padStart(4, "0")}`;
}
function yg(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of pg) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var bg = {
	subscribe(e) {
		return fg.add(e), () => {
			fg.delete(e);
		};
	},
	getSnapshot() {
		return pg;
	},
	getAll() {
		return pg;
	},
	getByBankAccount(e) {
		return pg.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return yg(e);
	},
	complete(e) {
		if (gg(e.statementDate), a(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let t = Fd.requireById(e.bankAccountId);
		if (!t.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < t.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let n = this.getLatestByBankAccount(t.id);
		if (n && e.statementDate <= n.statementDate) throw Error(`Statement date must be after the last reconciled date ${n.statementDate}.`);
		let r = lg(t, V.getAll(), e.statementDate), i = new Set(r.transactions.map((e) => e.id)), o = yg(t.id), s = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !o.has(e));
		for (let e of s) if (!i.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let c = /* @__PURE__ */ new Set([...o, ...s]), l = dg(r, hg(e.statementBalance), Array.from(c));
		if (!l.reconciled) throw Error(`Bank reconciliation is out by ${l.difference.toFixed(2)}.`);
		let u = {
			id: _g(),
			reconciliationNumber: vg(e.statementDate),
			bankAccountId: t.id,
			statementDate: e.statementDate,
			statementBalance: hg(e.statementBalance),
			bookBalance: l.bookBalance,
			outstandingDeposits: l.outstandingDeposits,
			outstandingPayments: l.outstandingPayments,
			adjustedStatementBalance: l.adjustedStatementBalance,
			difference: l.difference,
			clearedTransactionIds: s,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return pg = [u, ...pg], mg(), u;
	}
}, xg = bg.complete;
bg.complete = function(e) {
	return z(), B.transaction(() => xg.call(bg, e));
}, r("bankReconciliations", {
	repository: bg,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: pg }),
	restore: (e) => {
		pg = e.reconciliations;
	},
	publish: () => fg.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var Sg = !1;
function Cg() {
	if (Sg || (Sg = !0, B.wasRestoredOnLoad())) return;
	let e = sf.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) Jd.postInvoice(t), t.status === "VOID" && Jd.reverseInvoice(t);
	let t = Vd.getAll();
	for (let e of t) Jd.postPayment(e), e.status === "REVERSED" && Jd.reversePayment(e);
	let n = W.getAll();
	for (let e of n) e.status !== "DRAFT" && (Jd.postCreditNote(e), e.status === "VOID" && Jd.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function wg() {
	let e = Zm().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/sales/data/salesManualReviewService.ts
var Tg = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Eg(n) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let r = e("business.command", {
			repository: "salesRecovery",
			method: "recordSalesManualReview",
			args: [n]
		});
		return t(r.view), r.result;
	}
	if (!n.businessRecordChecked || !n.originalGlChecked || !n.reversalGlChecked || !n.balancesChecked) throw Error("Business, original/reversal GL and balances must all be inspected.");
	let r = L.list().find((e) => e.operationId === n.operationId);
	if (!r || !Tg.has(r.kind)) throw Error("Sales operation not found.");
	if (r.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return L.recordManualReview(n.operationId, n.reference, n.operator, n.summary);
}
//#endregion
//#region src/features/sales/data/salesConsistencyAudit.ts
var Dg = (e) => Math.round(e * 100);
function Og(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + Dg(t.amount), 0), s = a.reduce((e, t) => e + Dg(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (Dg(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), Dg(t.amountDue) !== Math.max(0, Dg(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > Dg(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + Dg(t.amount), 0);
		Dg(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || Dg(t.amountAvailable) !== 0 : Dg(t.amountAvailable) !== Dg(t.totals.total) - a) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
var kg = {
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
function Ag(e) {
	return Og(e).map((e) => ({
		...e,
		action: kg[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var jg = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Mg(e, t) {
	let n = Ag(e).map((e) => ({ ...e })), r = t.filter((e) => jg.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => jg.has(e.kind))) s.has(e.operationId) && n.push({
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
function Ng() {
	let e = sf.getAll();
	return Mg({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Vd.getAll(),
		creditNotes: W.getAll(),
		allocations: W.getAllAllocations(),
		journals: V.getAll()
	}, L.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
var Pg = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Fg(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!Pg.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = Mg(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function Ig() {
	let e = sf.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Vd.getAll(),
		creditNotes: W.getAll(),
		allocations: W.getAllAllocations(),
		journals: V.getAll()
	};
}
function Lg(n) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let r = e("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [n]
		});
		return t(r.view), r.result;
	}
	let r = L.list(), i = Fg(Ig(), r, n.operationId);
	if (i.length) throw Error(`Sales recovery remains blocked: ${i.join(" ")}`);
	let a = r.find((e) => e.operationId === n.operationId);
	return {
		closed: L.closeReviewed(n.operationId, a.resultId, n.approvalReference, n.approver),
		remaining: Ng()
	};
}
//#endregion
//#region electron/security/businessEngine.ts
r("salesRecovery", {
	repository: {
		recordSalesManualReview: Eg,
		closeVerifiedSalesReview: Lg
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
var Rg = s();
function zg(e) {
	Dl(Vh, () => e()?.userId ?? ""), Fc.connect(e), ng.configureTrustedSession(e), Cg(), wg();
}
//#endregion
export { Ml as assertPostingPeriod, zg as initialize, Rg as workspaceDefaults };
