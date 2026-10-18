import { B as e, D as t, F as n, H as r, I as i, L as a, N as o, O as s, P as c, R as l, S as u, T as d, V as f, _ as p, a as m, c as h, d as ee, f as te, h as g, i as ne, j as re, k as ie, l as ae, m as oe, n as _, o as v, p as se, r as y, s as b, t as ce, u as le, w as ue, y as x, z as de } from "./accountingPeriodValidation-SL8KKS6G.js";
import { createHash as fe } from "node:crypto";
//#region \0rolldown/runtime.js
var pe = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), me = null, S = {
	connect(e) {
		return me = e, () => {
			me === e && (me = null);
		};
	},
	disconnect() {
		me = null;
	},
	current() {
		return me?.() ?? null;
	},
	require(e) {
		return re(this.current(), e);
	}
}, C = e().trim().min(1).max(200), he = e().trim().min(1).max(2e3), ge = e().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), _e = l({
	id: C,
	number: a().int().positive(),
	name: C,
	mime: C,
	size: a().int().positive().max(d),
	sha256: e().regex(/^[a-f0-9]{64}$/),
	content: e().max(14e6),
	createdAt: ge,
	createdBy: C,
	restoredFrom: C.optional()
}).strict(), ve = l({
	id: C,
	title: e().trim().min(1).max(200),
	target: s,
	revision: a().int().positive(),
	currentVersionId: C,
	versions: c(_e).min(1).max(100),
	createdAt: ge,
	createdBy: C,
	updatedAt: ge,
	updatedBy: C,
	deletedAt: ge.optional(),
	deletedBy: C.optional()
}).strict(), ye = (e) => ({
	title: e.title,
	deleted: !!e.deletedAt,
	currentVersionId: e.currentVersionId,
	versionsCount: e.versions.length
}), be = l({
	id: C,
	documentId: C,
	operationId: C,
	action: o([
		"Uploaded",
		"Added version",
		"Restored version",
		"Renamed",
		"Trashed",
		"Recovered"
	]),
	actorId: C,
	at: ge,
	revision: a().int().positive(),
	reason: he,
	versionId: C.optional(),
	fingerprint: e().regex(/^[a-f0-9]{64}$/),
	after: l({
		title: C,
		deleted: n(),
		currentVersionId: C,
		versionsCount: a().int().positive()
	}).strict()
}).strict(), xe = [], Se = [];
function Ce() {
	return S.require("inventory.read");
}
var we = () => x([...new Set(Object.values(ie).map((e) => e.repository))]);
function Te(e, n, r = we()) {
	return t(r, n).find((t) => t.kind === e.kind && t.id === e.id);
}
function Ee(e, t = !1) {
	let n = Ce(), r = Te(e, n);
	if (!r) throw Error("Business link was not found or access is denied.");
	if (t && !r.canWrite) throw Error("Permission denied: attachment maintenance requires the linked object write permission.");
	return n.userId;
}
function De(e, t = !1) {
	let n = xe.find((t) => t.id === C.parse(e));
	if (!n) throw Error("Attachment not found or access denied.");
	return Ee(n.target, t), n;
}
var Oe = (e) => fe("sha256").update(JSON.stringify(e)).digest("hex"), ke = (e, t) => {
	let n = Te(e.target, t);
	return {
		...e,
		targetLabel: n.label,
		targetPath: n.path,
		canWrite: n.canWrite,
		versions: e.versions.map(({ content: e, ...t }) => t)
	};
};
function Ae(e, t) {
	if (e.revision !== t) throw Error("Attachment changed. Refresh before continuing.");
}
function je(e, t) {
	if (t < e.updatedAt) throw Error("System clock precedes the last attachment change.");
}
function Me(e) {
	if (xe.flatMap((e) => e.versions).reduce((e, t) => e + t.size, 0) + e > 5e7) throw Error("Local attachment library exceeds 50 MB including versions and trash. Export/archive the business profile before adding more files.");
}
function Ne(e, t) {
	let n = Se.find((t) => t.operationId === e);
	if (!n) return;
	let r = De(n.documentId, !0);
	if (n.fingerprint !== t) throw Error("Operation ID already has different attachment data.");
	return ke(r, S.current());
}
function Pe(e, t, n, r, i, a) {
	return xe = [...xe.filter((t) => t.id !== e.id), e], Se = [...Se, {
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
		after: ye(e)
	}], ke(e, S.current());
}
g("attachments", {
	repository: {
		targets() {
			return t(we(), Ce());
		},
		checkTarget(e) {
			return Ee(s.parse(e), !0), !0;
		},
		upload(t) {
			let n = l({
				operationId: C,
				id: C.optional(),
				expectedRevision: a().int().nonnegative(),
				target: s,
				title: C,
				reason: he,
				file: l({
					name: C,
					content: e().max(14e6)
				}).strict()
			}).strict().parse(t), r = Ee(n.target, !0), i = ue(n.file.name, n.file.content), o = Oe({
				...n,
				file: {
					name: i.name,
					sha256: i.sha256
				}
			}), c = Ne(n.operationId, o);
			if (c) return c;
			let u = n.id ? De(n.id, !0) : void 0;
			if (u) {
				if (Ae(u, n.expectedRevision), JSON.stringify(u.target) !== JSON.stringify(n.target)) throw Error("An attachment retains its original business link.");
				if (u.deletedAt) throw Error("Recover the attachment before adding a version.");
				if (u.versions.some((e) => e.sha256 === i.sha256)) throw Error("These file bytes already exist in this attachment. Use version restore instead.");
				if (u.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
			} else if (n.expectedRevision !== 0) throw Error("A new attachment requires revision zero.");
			if (!u && xe.some((e) => !e.deletedAt && e.target.kind === n.target.kind && e.target.id === n.target.id && e.versions.some((e) => e.sha256 === i.sha256))) throw Error("This file already exists on the selected business object. Open its existing attachment.");
			Me(i.size);
			let d = (/* @__PURE__ */ new Date()).toISOString();
			u && je(u, d);
			let f = {
				...i,
				id: crypto.randomUUID(),
				number: (u?.versions.length ?? 0) + 1,
				createdAt: d,
				createdBy: r
			};
			return Pe({
				...u ?? {
					id: crypto.randomUUID(),
					target: n.target,
					createdAt: d,
					createdBy: r
				},
				title: u?.title ?? n.title,
				currentVersionId: f.id,
				versions: [...u?.versions ?? [], f],
				revision: (u?.revision ?? 0) + 1,
				updatedAt: d,
				updatedBy: r
			}, u ? "Added version" : "Uploaded", n.operationId, o, n.reason, f.id);
		},
		change(e) {
			let t = l({
				operationId: C,
				id: C,
				expectedRevision: a().int().positive(),
				action: o([
					"Renamed",
					"Trashed",
					"Recovered",
					"Restored version"
				]),
				reason: he,
				title: C.optional(),
				versionId: C.optional()
			}).strict().parse(e), n = De(t.id, !0), r = Oe(t), i = Ne(t.operationId, r);
			if (i) return i;
			Ae(n, t.expectedRevision);
			let s = Ee(n.target, !0), c = (/* @__PURE__ */ new Date()).toISOString();
			je(n, c);
			let d = {
				...n,
				versions: [...n.versions],
				revision: n.revision + 1,
				updatedBy: s,
				updatedAt: c
			}, f;
			if (t.action === "Trashed") {
				if (n.deletedAt) throw Error("Attachment is already in the recycle bin.");
				d.deletedAt = c, d.deletedBy = s;
			} else if (t.action === "Recovered") {
				if (!n.deletedAt) throw Error("Attachment is not in the recycle bin.");
				delete d.deletedAt, delete d.deletedBy;
			} else {
				if (n.deletedAt) throw Error("Recover the attachment before editing.");
				if (t.action === "Renamed") {
					if (!t.title) throw Error("Enter a document title.");
					d.title = t.title;
				} else {
					let e = n.versions.find((e) => e.id === t.versionId);
					if (!e) throw Error("Version not found.");
					if (e.id === n.currentVersionId) throw Error("That version is already current.");
					if (n.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
					Me(e.size), u(e);
					let r = {
						...e,
						id: crypto.randomUUID(),
						number: n.versions.length + 1,
						createdAt: c,
						createdBy: s,
						restoredFrom: e.id
					};
					d.versions.push(r), d.currentVersionId = r.id, f = r.id;
				}
			}
			return Pe(d, t.action, t.operationId, r, t.reason, f);
		},
		read(e) {
			let t = l({
				id: C,
				versionId: C
			}).strict().parse(e), n = De(t.id).versions.find((e) => e.id === t.versionId);
			if (!n) throw Error("Version not found.");
			return u(n), { ...n };
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
		documents: xe,
		history: Se
	}),
	restore: (e) => {
		xe = e.documents, Se = e.history;
	},
	publish: () => {},
	view: (e) => {
		let t = xe.filter((t) => Te(t.target, e));
		return {
			documents: t.map((t) => ke(t, e)),
			history: Se.filter((e) => t.some((t) => t.id === e.documentId)).map(({ fingerprint: e, ...t }) => t)
		};
	},
	validate: (e, t) => {
		let n = l({
			documents: c(ve),
			history: c(be)
		}).strict().parse(e), r = /* @__PURE__ */ new Set(), i = 0;
		for (let e of n.documents) {
			let r = ie[e.target.kind];
			if (!t[r.repository]?.[r.collection]?.some((t) => t.id === e.target.id)) throw Error("Invalid attachment business reference.");
			if (!!e.deletedAt != !!e.deletedBy) throw Error("Invalid attachment recycle metadata.");
			let a = /* @__PURE__ */ new Set();
			for (let [t, n] of e.versions.entries()) {
				if (u(n), i += n.size, a.has(n.id) || n.number !== t + 1 || n.createdAt < e.createdAt || n.createdAt > e.updatedAt) throw Error("Invalid attachment version history.");
				if (n.restoredFrom && (!a.has(n.restoredFrom) || e.versions.find((e) => e.id === n.restoredFrom)?.sha256 !== n.sha256 || e.versions.find((e) => e.id === n.restoredFrom)?.name !== n.name)) throw Error("Invalid restored attachment version.");
				a.add(n.id);
			}
			if (!a.has(e.currentVersionId)) throw Error("Invalid current attachment version.");
			let o = n.history.filter((t) => t.documentId === e.id);
			if (o.length !== e.revision || o[0].action !== "Uploaded" || o[0].actorId !== e.createdBy || o[0].at !== e.createdAt) throw Error("Invalid attachment audit history.");
			let s = e.createdAt, c = 0, l = !1, d = "", f = "";
			for (let [t, n] of o.entries()) {
				if (n.revision !== t + 1 || n.at < s || n.at > e.updatedAt) throw Error("Invalid attachment audit ordering.");
				if (s = n.at, t > 0 && n.action !== "Renamed" && n.after.title !== f) throw Error("Attachment title changed without a rename event.");
				if (f = n.after.title, ![
					"Uploaded",
					"Added version",
					"Restored version"
				].includes(n.action) && n.versionId) throw Error("Unexpected attachment version reference.");
				if ([
					"Uploaded",
					"Added version",
					"Restored version"
				].includes(n.action)) {
					if (l || n.action === "Uploaded" && t !== 0) throw Error("Invalid attachment version event.");
					let r = e.versions[c++];
					if (!r || r.id !== n.versionId || r.createdBy !== n.actorId || r.createdAt !== n.at || !!r.restoredFrom != (n.action === "Restored version")) throw Error("Attachment version differs from its audit.");
					d = r.id;
				} else if (n.action === "Trashed") {
					if (l) throw Error("Repeated attachment trash event.");
					l = !0;
				} else if (n.action === "Recovered") {
					if (!l) throw Error("Invalid attachment recovery event.");
					l = !1;
				} else if (l) throw Error("Deleted attachment cannot be renamed.");
				if (n.after.versionsCount !== c || n.after.currentVersionId !== d || n.after.deleted !== l) throw Error("Attachment audit outcome is inconsistent.");
			}
			let p = o.at(-1);
			if (c !== e.versions.length || p.actorId !== e.updatedBy || p.at !== e.updatedAt || JSON.stringify(p.after) !== JSON.stringify(ye(e))) throw Error("Attachment metadata differs from audit.");
			if (e.deletedAt && (e.deletedAt !== p.at || e.deletedBy !== p.actorId)) throw Error("Attachment deletion differs from audit.");
		}
		for (let e of n.history) {
			if (r.has(e.operationId) || !n.documents.some((t) => t.id === e.documentId)) throw Error("Invalid attachment operation identity.");
			r.add(e.operationId);
		}
		if (i > 5e7) throw Error("Attachment library exceeds 50 MB.");
	}
});
//#endregion
//#region node_modules/.pnpm/react@19.3.0/node_modules/react/cjs/react.production.js
var w = /* @__PURE__ */ pe(((e) => {
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
	}, te = Object.assign, g = {};
	function ne(e, t, n) {
		this.props = e, this.context = t, this.refs = g, this.updater = n || ee;
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
		this.props = e, this.context = t, this.refs = g, this.updater = n || ee;
	}
	var ae = ie.prototype = new re();
	ae.constructor = ie, te(ae, ne.prototype), ae.isPureReactComponent = !0;
	var oe = Array.isArray;
	function _() {}
	var v = {
		H: null,
		A: null,
		T: null,
		S: null
	}, se = Object.prototype.hasOwnProperty;
	function y(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function b(e, t) {
		return y(e.type, t, e.props);
	}
	function ce(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function le(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var ue = /\/+/g;
	function x(e, t) {
		return typeof e == "object" && e && e.key != null ? le("" + e.key) : t.toString(36);
	}
	function de(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(_, _) : (e.status = "pending", e.then(function(t) {
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
	function fe(e, r, i, a, o) {
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
				case d: return c = e._init, fe(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + x(e, 0) : a, oe(o) ? (i = "", c != null && (i = c.replace(ue, "$&/") + "/"), fe(o, r, i, "", function(e) {
			return e;
		})) : o != null && (ce(o) && (o = b(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(ue, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (oe(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + x(a, u), c += fe(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + x(a, u++), c += fe(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return fe(de(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function pe(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return fe(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function me(e) {
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
	var S = typeof reportError == "function" ? reportError : function(e) {
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
	function C(e) {
		var t = v.T, n = {};
		n.types = t === null ? null : t.types, v.T = n;
		try {
			var r = e(), i = v.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(_, S);
		} catch (e) {
			S(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), v.T = t;
		}
	}
	function he(e) {
		var t = v.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else C(he.bind(null, e));
	}
	var ge = {
		map: pe,
		forEach: function(e, t, n) {
			pe(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return pe(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return pe(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!ce(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = ge, e.Component = ne, e.Fragment = r, e.Profiler = a, e.PureComponent = ie, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = v, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return v.H.useMemoCache(e);
		}
	}, e.addTransitionType = he, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = te({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !se.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return y(e.type, i, r);
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
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) se.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return y(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = ce, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: me
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = C, e.unstable_useCacheRefresh = function() {
		return v.H.useCacheRefresh();
	}, e.use = function(e) {
		return v.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return v.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return v.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return v.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return v.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return v.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return v.H.useEffectEvent(e);
	}, e.useId = function() {
		return v.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return v.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return v.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return v.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return v.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return v.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return v.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return v.H.useRef(e);
	}, e.useState = function(e) {
		return v.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return v.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return v.H.useTransition();
	}, e.version = "19.3.0";
})), Fe = /* @__PURE__ */ pe(((e, t) => {
	process.env.NODE_ENV !== "production" && (function() {
		function n(e, t) {
			Object.defineProperty(a.prototype, e, { get: function() {
				console.warn("%s(...) is deprecated in plain JavaScript React classes. %s", t[0], t[1]);
			} });
		}
		function r(e) {
			return typeof e != "object" || !e ? null : (e = De && e[De] || e["@@iterator"], typeof e == "function" ? e : null);
		}
		function i(e, t) {
			e = (e = e.constructor) && (e.displayName || e.name) || "ReactClass";
			var n = e + "." + t;
			Oe[n] || (console.error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", t, e), Oe[n] = !0);
		}
		function a(e, t, n) {
			this.props = e, this.context = t, this.refs = je, this.updater = n || ke;
		}
		function o() {}
		function s(e, t, n) {
			this.props = e, this.context = t, this.refs = je, this.updater = n || ke;
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
			if (typeof e == "function") return e.$$typeof === Pe ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case he: return "Fragment";
				case _e: return "Profiler";
				case ge: return "StrictMode";
				case xe: return "Suspense";
				case Se: return "SuspenseList";
				case Te: return "Activity";
				case Ee: return "ViewTransition";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case C: return "Portal";
				case ye: return e.displayName || "Context";
				case ve: return (e._context.displayName || "Context") + ".Consumer";
				case be:
					var t = e.render;
					return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case Ce: return t = e.displayName || null, t === null ? d(e.type) || "Memo" : t;
				case we:
					t = e._payload, e = e._init;
					try {
						return d(e(t));
					} catch {}
			}
			return null;
		}
		function f(e) {
			if (e === he) return "<>";
			if (typeof e == "object" && e && e.$$typeof === we) return "<...>";
			try {
				var t = d(e);
				return t ? "<" + t + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function p() {
			var e = w.A;
			return e === null ? null : e.getOwner();
		}
		function m() {
			return Error("react-stack-top-frame");
		}
		function h(e) {
			if (Fe.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function ee(e, t) {
			function n() {
				Le || (Le = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function te() {
			var e = d(this.type);
			return ze[e] || (ze[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function g(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: S,
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
		function ne(e, t) {
			return t = g(e.type, t, e.props, e._owner, e._debugStack, e._debugTask), e._store && (t._store.validated = e._store.validated), t;
		}
		function re(e) {
			ie(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === we && (e._payload.status === "fulfilled" ? ie(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function ie(e) {
			return typeof e == "object" && !!e && e.$$typeof === S;
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
		function _(e) {
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
		function v(e, t, n, i, a) {
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
					case S:
					case C:
						s = !0;
						break;
					case we: return s = e._init, v(s(e._payload), t, n, i, a);
				}
			}
			if (s) {
				s = e, a = a(s);
				var c = i === "" ? "." + oe(s, 0) : i;
				return Ne(a) ? (n = "", c != null && (n = c.replace(Ue, "$&/") + "/"), v(a, t, n, "", function(e) {
					return e;
				})) : a != null && (ie(a) && (a.key != null && (s && s.key === a.key || u(a.key)), n = ne(a, n + (a.key == null || s && s.key === a.key ? "" : ("" + a.key).replace(Ue, "$&/") + "/") + c), i !== "" && s != null && ie(s) && s.key == null && s._store && !s._store.validated && (n._store.validated = 2), a = n), t.push(a)), 1;
			}
			if (s = 0, c = i === "" ? "." : i + ":", Ne(e)) for (var l = 0; l < e.length; l++) i = e[l], o = c + oe(i, l), s += v(i, t, n, o, a);
			else if (l = r(e), typeof l == "function") for (l === e.entries && (He || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), He = !0), e = l.call(e), l = 0; !(i = e.next()).done;) i = i.value, o = c + oe(i, l++), s += v(i, t, n, o, a);
			else if (o === "object") {
				if (typeof e.then == "function") return v(_(e), t, n, i, a);
				throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
			}
			return s;
		}
		function se(e, t, n) {
			if (e == null) return e;
			var r = [], i = 0;
			return v(e, r, "", "", function(e) {
				return t.call(n, e, i++);
			}), r;
		}
		function y(e) {
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
		function b() {
			var e = w.H;
			return e === null && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."), e;
		}
		function ce() {
			w.asyncTransitions--;
		}
		function le(e) {
			var t = w.T, n = {};
			n.types = t === null ? null : t.types, n._updatedFibers = /* @__PURE__ */ new Set(), w.T = n;
			try {
				var r = e(), i = w.S;
				i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && (w.asyncTransitions++, r.then(ce, ce), r.then(c, We));
			} catch (e) {
				We(e);
			} finally {
				t === null && n._updatedFibers && (e = n._updatedFibers.size, n._updatedFibers.clear(), 10 < e && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), t !== null && n.types !== null && (t.types !== null && t.types !== n.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), t.types = n.types), w.T = t;
			}
		}
		function ue(e) {
			var t = w.T;
			if (t !== null) {
				var n = t.types;
				n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
			} else w.asyncTransitions === 0 && console.error("addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition."), le(ue.bind(null, e));
		}
		function x(e) {
			if (Ke === null) try {
				var n = ("require" + Math.random()).slice(0, 7);
				Ke = (t && t[n]).call(t, "timers").setImmediate;
			} catch {
				Ke = function(e) {
					!1 === Ge && (Ge = !0, typeof MessageChannel > "u" && console.error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
					var t = new MessageChannel();
					t.port1.onmessage = e, t.port2.postMessage(void 0);
				};
			}
			return Ke(e);
		}
		function de(e) {
			return 1 < e.length && typeof AggregateError == "function" ? AggregateError(e) : e[0];
		}
		function fe(e, t) {
			t !== qe - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), qe = t;
		}
		function pe(e, t, n) {
			var r = w.actQueue;
			if (r !== null) {
				if (r.length !== 0) try {
					me(r), x(function() {
						return pe(e, t, n);
					});
					return;
				} catch (e) {
					w.thrownErrors.push(e);
				}
				else w.actQueue = null;
			}
			0 < w.thrownErrors.length ? (r = de(w.thrownErrors), w.thrownErrors.length = 0, n(r)) : t(e);
		}
		function me(e) {
			if (!Ye) {
				Ye = !0;
				var t = 0;
				try {
					for (; t < e.length; t++) {
						var n = e[t];
						do {
							w.didUsePromise = !1;
							var r = n(!1);
							if (r !== null) {
								if (w.didUsePromise) {
									e[t] = n, e.splice(0, t);
									return;
								}
								n = r;
							} else break;
						} while (1);
					}
					e.length = 0;
				} catch (n) {
					e.splice(0, t + 1), w.thrownErrors.push(n);
				} finally {
					Ye = !1;
				}
			}
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var S = Symbol.for("react.transitional.element"), C = Symbol.for("react.portal"), he = Symbol.for("react.fragment"), ge = Symbol.for("react.strict_mode"), _e = Symbol.for("react.profiler"), ve = Symbol.for("react.consumer"), ye = Symbol.for("react.context"), be = Symbol.for("react.forward_ref"), xe = Symbol.for("react.suspense"), Se = Symbol.for("react.suspense_list"), Ce = Symbol.for("react.memo"), we = Symbol.for("react.lazy"), Te = Symbol.for("react.activity"), Ee = Symbol.for("react.view_transition"), De = Symbol.iterator, Oe = {}, ke = {
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
		}, Ae = Object.assign, je = {};
		Object.freeze(je), a.prototype.isReactComponent = {}, a.prototype.setState = function(e, t) {
			if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
			this.updater.enqueueSetState(this, e, t, "setState");
		}, a.prototype.forceUpdate = function(e) {
			this.updater.enqueueForceUpdate(this, e, "forceUpdate");
		};
		var Me = {
			isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
			replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
		};
		for (Ze in Me) Me.hasOwnProperty(Ze) && n(Ze, Me[Ze]);
		o.prototype = a.prototype, Me = s.prototype = new o(), Me.constructor = s, Ae(Me, a.prototype), Me.isPureReactComponent = !0;
		var Ne = Array.isArray, Pe = Symbol.for("react.client.reference"), w = {
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
		}, Fe = Object.prototype.hasOwnProperty, Ie = console.createTask ? console.createTask : function() {
			return null;
		};
		Me = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var Le, Re, ze = {}, Be = Me.react_stack_bottom_frame.bind(Me, m)(), Ve = Ie(f(m)), He = !1, Ue = /\/+/g, We = typeof reportError == "function" ? reportError : function(e) {
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
		}, Ge = !1, Ke = null, qe = 0, Je = !1, Ye = !1, Xe = typeof queueMicrotask == "function" ? function(e) {
			queueMicrotask(function() {
				return queueMicrotask(e);
			});
		} : x;
		Me = Object.freeze({
			__proto__: null,
			c: function(e) {
				return b().useMemoCache(e);
			}
		});
		var Ze = {
			map: se,
			forEach: function(e, t, n) {
				se(e, function() {
					t.apply(this, arguments);
				}, n);
			},
			count: function(e) {
				var t = 0;
				return se(e, function() {
					t++;
				}), t;
			},
			toArray: function(e) {
				return se(e, function(e) {
					return e;
				}) || [];
			},
			only: function(e) {
				if (!ie(e)) throw Error("React.Children.only expected to receive a single React element child.");
				return e;
			}
		};
		e.Activity = Te, e.Children = Ze, e.Component = a, e.Fragment = he, e.Profiler = _e, e.PureComponent = s, e.StrictMode = ge, e.Suspense = xe, e.ViewTransition = Ee, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = w, e.__COMPILER_RUNTIME = Me, e.act = function(e) {
			var t = w.actQueue, n = qe;
			qe++;
			var r = w.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				w.thrownErrors.push(e);
			}
			if (0 < w.thrownErrors.length) throw fe(t, n), e = de(w.thrownErrors), w.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return Xe(function() {
					i || Je || (Je = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				}), { then: function(e, a) {
					i = !0, o.then(function(i) {
						if (fe(t, n), n === 0) {
							try {
								me(r), x(function() {
									return pe(i, e, a);
								});
							} catch (e) {
								w.thrownErrors.push(e);
							}
							if (0 < w.thrownErrors.length) {
								var o = de(w.thrownErrors);
								w.thrownErrors.length = 0, a(o);
							}
						} else e(i);
					}, function(e) {
						fe(t, n), 0 < w.thrownErrors.length ? (e = de(w.thrownErrors), w.thrownErrors.length = 0, a(e)) : a(e);
					});
				} };
			}
			var s = a;
			if (fe(t, n), n === 0 && (me(r), r.length !== 0 && Xe(function() {
				i || Je || (Je = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), w.actQueue = null), 0 < w.thrownErrors.length) throw e = de(w.thrownErrors), w.thrownErrors.length = 0, e;
			return { then: function(e, t) {
				i = !0, n === 0 ? (w.actQueue = r, x(function() {
					return pe(s, e, t);
				})) : e(s);
			} };
		}, e.addTransitionType = ue, e.cache = function(e) {
			return function() {
				return e.apply(null, arguments);
			};
		}, e.cacheSignal = function() {
			return null;
		}, e.captureOwnerStack = function() {
			var e = w.getCurrentStack;
			return e === null ? null : e();
		}, e.cloneElement = function(e, t, n) {
			if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
			var r = Ae({}, e.props), i = e.key, a = e._owner;
			if (t != null) {
				var o;
				a: {
					if (Fe.call(t, "ref") && (o = Object.getOwnPropertyDescriptor(t, "ref").get) && o.isReactWarning) {
						o = !1;
						break a;
					}
					o = t.ref !== void 0;
				}
				for (s in o && (a = p()), h(t) && (u(t.key), i = "" + t.key), t) !Fe.call(t, s) || s === "key" || s === "__self" || s === "__source" || s === "ref" && t.ref === void 0 || (r[s] = t[s]);
			}
			var s = arguments.length - 2;
			if (s === 1) r.children = n;
			else if (1 < s) {
				o = Array(s);
				for (var c = 0; c < s; c++) o[c] = arguments[c + 2];
				r.children = o;
			}
			for (r = g(e.type, i, r, a, e._debugStack, e._debugTask), i = 2; i < arguments.length; i++) re(arguments[i]);
			return r;
		}, e.createContext = function(e) {
			return e = {
				$$typeof: ye,
				_currentValue: e,
				_currentValue2: e,
				_threadCount: 0,
				Provider: null,
				Consumer: null
			}, e.Provider = e, e.Consumer = {
				$$typeof: ve,
				_context: e
			}, e._currentRenderer = null, e._currentRenderer2 = null, e;
		}, e.createElement = function(e, t, n) {
			for (var r = 2; r < arguments.length; r++) re(arguments[r]);
			var i;
			r = {};
			var a = null;
			if (t != null) for (i in Re || !("__self" in t) || "key" in t || (Re = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), h(t) && (u(t.key), a = "" + t.key), t) Fe.call(t, i) && i !== "key" && i !== "__self" && i !== "__source" && (r[i] = t[i]);
			var o = arguments.length - 2;
			if (o === 1) r.children = n;
			else if (1 < o) {
				for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
				Object.freeze && Object.freeze(s), r.children = s;
			}
			if (e && e.defaultProps) for (i in o = e.defaultProps, o) r[i] === void 0 && (r[i] = o[i]);
			return a && ee(r, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), (i = 1e4 > w.recentlyCreatedOwnerStacks++) ? (s = Error.stackTraceLimit, Error.stackTraceLimit = 10, o = Error("react-stack-top-frame"), Error.stackTraceLimit = s) : o = Be, g(e, a, r, p(), o, i ? Ie(f(e)) : Ve);
		}, e.createRef = function() {
			var e = { current: null };
			return Object.seal(e), e;
		}, e.forwardRef = function(e) {
			e != null && e.$$typeof === Ce ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e == "function" ? e.length !== 0 && e.length !== 2 && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.") : console.error("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e), e != null && e.defaultProps != null && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
			var t = {
				$$typeof: be,
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
				$$typeof: we,
				_payload: e,
				_init: y
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
				$$typeof: Ce,
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
		}, e.startTransition = le, e.unstable_useCacheRefresh = function() {
			return b().useCacheRefresh();
		}, e.use = function(e) {
			return b().use(e);
		}, e.useActionState = function(e, t, n) {
			return b().useActionState(e, t, n);
		}, e.useCallback = function(e, t) {
			return b().useCallback(e, t);
		}, e.useContext = function(e) {
			var t = b();
			return e.$$typeof === ve && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"), t.useContext(e);
		}, e.useDebugValue = function(e, t) {
			return b().useDebugValue(e, t);
		}, e.useDeferredValue = function(e, t) {
			return b().useDeferredValue(e, t);
		}, e.useEffect = function(e, t) {
			return e ?? console.warn("React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"), b().useEffect(e, t);
		}, e.useEffectEvent = function(e) {
			return b().useEffectEvent(e);
		}, e.useId = function() {
			return b().useId();
		}, e.useImperativeHandle = function(e, t, n) {
			return b().useImperativeHandle(e, t, n);
		}, e.useInsertionEffect = function(e, t) {
			return e ?? console.warn("React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"), b().useInsertionEffect(e, t);
		}, e.useLayoutEffect = function(e, t) {
			return e ?? console.warn("React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"), b().useLayoutEffect(e, t);
		}, e.useMemo = function(e, t) {
			return b().useMemo(e, t);
		}, e.useOptimistic = function(e, t) {
			return b().useOptimistic(e, t);
		}, e.useReducer = function(e, t, n) {
			return b().useReducer(e, t, n);
		}, e.useRef = function(e) {
			return b().useRef(e);
		}, e.useState = function(e) {
			return b().useState(e);
		}, e.useSyncExternalStore = function(e, t, n) {
			return b().useSyncExternalStore(e, t, n);
		}, e.useTransition = function() {
			return b().useTransition();
		}, e.version = "19.3.0", typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
}));
(/* @__PURE__ */ pe(((e, t) => {
	t.exports = process.env.NODE_ENV === "production" ? w() : Fe();
})))();
function Ie(e, t) {
	let n = x(), r = n.journals?.journalEntries ?? [], i = n.bankReconciliations?.reconciliations ?? [], a = r.filter((n) => n.sourceType === e && n.sourceId === t).map((e) => e.id);
	if (i.some((e) => e.clearedTransactionIds.some((e) => a.some((t) => e.startsWith(t + ":"))))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Le(e, t) {
	let n = x(), r = n.bankAccounts?.bankAccounts ?? [], i = n.bankReconciliations?.reconciliations ?? [];
	for (let n of r.filter((e) => t.includes(e.glAccountId))) {
		let t = i.filter((e) => e.bankAccountId === n.id).map((e) => e.statementDate).sort().at(-1);
		if (t && e <= t) throw Error(`Bank account is reconciled through ${t}. Use a posting date after that statement.`);
	}
}
//#endregion
//#region src/features/accounting/data/accountingPeriodRepository.ts
var Re = [], ze, Be, Ve = /* @__PURE__ */ new Set();
function He(e, t) {
	ze = e, Be = t;
}
function Ue() {
	let e = Be?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function We(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function Ge(e) {
	let t = Re.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function Ke() {
	Ve.forEach((e) => e());
}
function qe(e) {
	if (y(e, "Posting date"), !Re.length) return;
	let t = Re.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!Re.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
g("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => Re,
		subscribe(e) {
			return Ve.add(e), () => {
				Ve.delete(e);
			};
		},
		create(e) {
			let t = Ue(), n = We(e.reason);
			if (y(e.startDate), y(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (Re.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (Re.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
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
			return Re = [...Re, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), Ke(), r;
		},
		preflight(e) {
			let t = Ge(e);
			if (!ze) throw Error("Trusted close checks unavailable.");
			return ze(t);
		},
		close(e) {
			let t = Ue(), n = We(e.reason), r = Ge(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (Re.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return Re = Re.map((e) => e.id === r.id ? {
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
			} : e), Ke(), Ge(e.id);
		},
		reopen(e) {
			let t = Ue(), n = We(e.reason), r = Ge(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (Re.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return Re = Re.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), Ke(), Ge(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: Re }),
	restore: (e) => {
		ce(e.periods), Re = e.periods;
	},
	publish: Ke
});
//#endregion
//#region src/features/purchases/data/mockPurchaseOrders.ts
var Je = [{
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
}], Ye = [{
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
function Xe() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function Ze(e, t) {
	let n = Xe();
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
function Qe(e, t) {
	let n = Xe();
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
function $e(e) {
	let t = Xe();
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
var et = "htt:financial-snapshot:v1", tt = (e) => !!e && typeof e == "object" && !Array.isArray(e), nt = (e) => new Set(e.map((e) => e.id)).size === e.length, rt = (e) => {
	if (!tt(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => tt(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => tt(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => tt(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => tt(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
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
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => tt(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && tt(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && tt(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && tt(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && nt(t) && nt(n) && nt(r) && nt(i);
}, it = () => ({
	purchaseOrders: structuredClone(Je),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone(Ye),
	transactions: [],
	transfers: [],
	journals: []
}), at, ot = !1;
function st() {
	return typeof window < "u" && !!window.localStorage;
}
function ct() {
	if (at) return at;
	if (!st()) return it();
	let e = Ze(et, rt);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return ot = e.status === "ok", at = e.status === "ok" ? {
		...it(),
		...e.data
	} : it(), at;
}
var lt = /* @__PURE__ */ new Set(), ut = 0, dt = /* @__PURE__ */ new Set();
function ft(e) {
	if (st() && !Qe(et, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var T = {
	wasRestoredOnLoad() {
		return ct(), ot;
	},
	onRollback(e) {
		lt.add(e);
	},
	notify(e) {
		ut ? dt.add(e) : e();
	},
	transaction(e) {
		if (ut) return e();
		let t = structuredClone(ct());
		at = structuredClone(t), ut++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			ft(ct());
		} catch (e) {
			throw at = t, lt.forEach((e) => e()), dt.clear(), e;
		} finally {
			ut--;
		}
		let r = [...dt];
		return dt.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(ct());
	},
	update(e, t) {
		let n = {
			...ct(),
			[e]: structuredClone(t)
		};
		if (!rt(n)) throw Error("Invalid financial snapshot; write blocked.");
		ut || ft(n), at = n;
	},
	resetCacheForTests() {
		at = void 0, ot = !1;
	}
};
g("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => T.read(),
	restore: (e) => {
		at = e;
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/accountRepository.ts
var pt = /* @__PURE__ */ new Set(), E = "2026-10-08T00:00:00.000Z", mt = [
	{
		id: "acc_1000",
		code: "1000",
		name: "Operating Bank",
		type: "ASSET",
		systemRole: "BANK",
		active: !0,
		allowManualPosting: !0,
		createdAt: E,
		updatedAt: E
	},
	{
		id: "acc_1010",
		code: "1010",
		name: "Savings Bank",
		type: "ASSET",
		active: !0,
		allowManualPosting: !0,
		createdAt: E,
		updatedAt: E
	},
	{
		id: "acc_1100",
		code: "1100",
		name: "Accounts Receivable",
		type: "ASSET",
		systemRole: "ACCOUNTS_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: E,
		updatedAt: E
	},
	{
		id: "acc_1200",
		code: "1200",
		name: "Inventory",
		type: "ASSET",
		systemRole: "INVENTORY",
		active: !0,
		allowManualPosting: !1,
		createdAt: E,
		updatedAt: E
	},
	{
		id: "acc_1300",
		code: "1300",
		name: "GST Receivable",
		type: "ASSET",
		systemRole: "GST_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: E,
		updatedAt: E
	},
	{
		id: "acc_2000",
		code: "2000",
		name: "Accounts Payable",
		type: "LIABILITY",
		systemRole: "ACCOUNTS_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: E,
		updatedAt: E
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
		createdAt: E,
		updatedAt: E
	},
	{
		id: "acc_2100",
		code: "2100",
		name: "GST Payable",
		type: "LIABILITY",
		systemRole: "GST_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: E,
		updatedAt: E
	},
	{
		id: "acc_3000",
		code: "3000",
		name: "Owner's Equity",
		type: "EQUITY",
		systemRole: "OWNERS_EQUITY",
		active: !0,
		allowManualPosting: !0,
		createdAt: E,
		updatedAt: E
	},
	{
		id: "acc_3100",
		code: "3100",
		name: "Retained Earnings",
		type: "EQUITY",
		systemRole: "RETAINED_EARNINGS",
		active: !0,
		allowManualPosting: !1,
		createdAt: E,
		updatedAt: E
	},
	{
		id: "acc_4000",
		code: "4000",
		name: "Sales Revenue",
		type: "REVENUE",
		systemRole: "SALES_REVENUE",
		active: !0,
		allowManualPosting: !1,
		createdAt: E,
		updatedAt: E
	},
	{
		id: "acc_5000",
		code: "5000",
		name: "Cost of Goods Sold",
		type: "EXPENSE",
		systemRole: "COST_OF_GOODS_SOLD",
		active: !0,
		allowManualPosting: !1,
		createdAt: E,
		updatedAt: E
	},
	{
		id: "acc_5100",
		code: "5100",
		name: "Purchases / Materials",
		type: "EXPENSE",
		systemRole: "PURCHASES",
		active: !0,
		allowManualPosting: !0,
		createdAt: E,
		updatedAt: E
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
		createdAt: E,
		updatedAt: E
	},
	{
		id: "acc_5200",
		code: "5200",
		name: "Freight",
		type: "EXPENSE",
		systemRole: "FREIGHT",
		active: !0,
		allowManualPosting: !0,
		createdAt: E,
		updatedAt: E
	},
	{
		id: "acc_5300",
		code: "5300",
		name: "Operating Expenses",
		type: "EXPENSE",
		systemRole: "OPERATING_EXPENSE",
		active: !0,
		allowManualPosting: !0,
		createdAt: E,
		updatedAt: E
	}
];
function ht() {
	pt.forEach((e) => e());
}
function gt(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function _t(e) {
	return e?.trim() || void 0;
}
function vt(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function yt(e, t) {
	if (mt.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function bt(e, t) {
	if (!e) return;
	let n = mt.find((n) => n.id !== t && (le(e) ? n.id === le(e) : n.systemRole === e));
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function xt() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var D = {
	subscribe(e) {
		return pt.add(e), () => {
			pt.delete(e);
		};
	},
	getSnapshot() {
		return mt;
	},
	getAll() {
		return mt;
	},
	getById(e) {
		return mt.find((t) => t.id === e);
	},
	getByCode(e) {
		return mt.find((t) => t.code.toLowerCase() === e.trim().toLowerCase());
	},
	getBySystemRole(e) {
		return mt.find((t) => le(e) ? t.id === le(e) : t.systemRole === e);
	},
	requireById(e) {
		let t = mt.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = mt.find((t) => le(e) ? t.id === le(e) : t.systemRole === e);
		if (!t) throw Error(`Accounting account for system role ${e} was not found.`);
		return t;
	},
	create(e) {
		let t = gt(e.code, "Account code"), n = gt(e.name, "Account name");
		vt(t), yt(t), bt(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: xt(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: _t(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return mt = [...mt, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), ht(), i;
	},
	update(e, t) {
		let n = mt.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = gt(t.code, "Account code"), i = gt(t.name, "Account name");
		if (vt(r), yt(r, e), (n.systemRole || ae(n.id)) && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: _t(t.description),
			active: n.systemRole || ae(n.id) ? !0 : t.active,
			allowManualPosting: n.systemRole || ae(n.id) ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return mt = mt.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), ht(), a;
	},
	setActive(e, t) {
		let n = mt.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		if ((n.systemRole || ae(n.id)) && !t) throw Error("System control accounts cannot be deactivated.");
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return mt = mt.map((t) => t.id === e ? r : t), ht(), r;
	}
};
g("accounts", {
	repository: D,
	read: "accounting.read",
	commands: {
		if: null,
		create: "accounting.post",
		update: "accounting.post",
		setActive: "accounting.post"
	},
	snapshot: () => ({ accounts: mt }),
	restore: (e) => {
		mt = e.accounts;
	},
	publish: () => pt.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var St = /* @__PURE__ */ new Set(), Ct = T.read().journals;
T.onRollback(() => {
	Ct = T.read().journals;
});
function wt() {
	St.forEach((e) => T.notify(e));
}
function Tt(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Et(e) {
	return e?.trim() || void 0;
}
function Dt(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function Ot(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = Ct.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function kt(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function At(e) {
	if (Dt(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = D.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = Tt(r.debit), o = Tt(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = Tt(t + a), n = Tt(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function jt(e) {
	return e.lines.map((e, t) => {
		let n = D.requireById(e.accountId);
		return {
			id: kt(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: Et(e.description),
			debit: Tt(e.debit),
			credit: Tt(e.credit)
		};
	});
}
function Mt(e, t) {
	return Ct.find((n) => n.sourceType === e && n.sourceId === t && !n.reversedJournalEntryId);
}
var O = {
	subscribe(e) {
		return St.add(e), () => {
			St.delete(e);
		};
	},
	getSnapshot() {
		return Ct;
	},
	getAll() {
		return Ct;
	},
	getById(e) {
		return Ct.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return Ct.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: Mt,
	post(e) {
		qe(e.journalDate), Le(e.journalDate, e.lines.map((e) => e.accountId));
		let t = At(e), n = Et(e.sourceId);
		if (n) {
			let t = Mt(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: kt("je"),
			journalNumber: Ot(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: Et(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: jt(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...Ct];
		return T.update("journals", a), Ct = a, wt(), i;
	},
	reverse(e) {
		qe(e.reversalDate);
		let t = Ct.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (Dt(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Reversal reason must contain at least 3 characters.");
		Le(e.reversalDate, t.lines.map((e) => e.accountId));
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
		}, i = At(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: kt("je"),
			journalNumber: Ot(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: jt(r),
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
		}, c = [o, ...Ct.map((e) => e.id === t.id ? s : e)];
		return T.update("journals", c), Ct = c, wt(), o;
	}
};
g("journals", {
	repository: O,
	read: "accounting.read",
	commands: {
		if: null,
		validateDate: null,
		for: null,
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ journalEntries: Ct }),
	restore: (e) => {
		Ct = e.journalEntries;
	},
	publish: () => St.forEach((e) => e())
});
//#endregion
//#region src/features/job-costing/jobCostingService.ts
function Nt(e) {
	let t = Math.round(e * 100);
	if (!Number.isFinite(e) || !Number.isSafeInteger(t) || Math.abs(t / 100 - e) > 1e-7) throw Error("Amounts must be safe currency values with at most two decimals.");
	return t;
}
function Pt(e, t) {
	return e.flatMap((n) => n.lines.flatMap((r, i) => {
		let a = t.find((e) => e.id === r.accountId);
		if (!a || !["REVENUE", "EXPENSE"].includes(a.type)) return [];
		let o = n, s = r;
		if (n.reversedJournalEntryId) {
			let t = e.find((e) => e.id === n.reversedJournalEntryId), a = t?.lines[i];
			if (!t || !a || a.accountId !== r.accountId || Nt(a.debit) !== Nt(r.credit) || Nt(a.credit) !== Nt(r.debit)) throw Error("Reversal line does not match its original source.");
			o = t, s = a;
		}
		let c = Nt(a.type === "REVENUE" ? r.credit - r.debit : r.debit - r.credit);
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
function Ft(e, t, n, r, i, a) {
	if (y(i, "From date"), y(a, "To date"), i > a) throw Error("From date must not follow to date.");
	let o = Pt(e, t).filter((e) => e.date >= i && e.date <= a), s = o.flatMap((e) => {
		let t = r.find((t) => t.journalId === e.rootJournalId && t.lineId === e.rootLineId), i = e.amount < 0 ? -1 : 1, a = Nt(e.capacity), o = (t?.splits ?? []).map((t) => {
			let r = Nt(t.amount);
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
		for (let r of s.filter((t) => t.jobId === e)) r.kind === "REVENUE" ? t += Nt(r.allocated) : n += Nt(r.allocated);
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
			let t = c(e.id), n = Nt(Math.round(Number(e.budget) * 100) / 100), r = Nt(Math.round(Number(e.costBudget) * 100) / 100);
			return {
				id: e.id,
				name: e.name,
				code: e.code,
				status: e.status,
				...t,
				budget: n / 100,
				costBudget: r / 100,
				budgetProfit: (n - r) / 100,
				revenueVariance: (Nt(t.revenue) - n) / 100,
				costVariance: (r - Nt(t.cost)) / 100,
				profitVariance: (Nt(t.profit) - n + r) / 100
			};
		}),
		unallocated: c(""),
		ledger: {
			revenue: o.filter((e) => e.kind === "REVENUE").reduce((e, t) => e + Nt(t.amount), 0) / 100,
			cost: o.filter((e) => e.kind === "EXPENSE").reduce((e, t) => e + Nt(t.amount), 0) / 100
		}
	};
}
//#endregion
//#region src/features/job-costing/jobCostingRepository.ts
var It = e().trim().min(1).max(200), Lt = e().trim().min(1).max(2e3), Rt = e().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), zt = l({
	jobId: It,
	amount: a().finite().positive().refine((e) => {
		try {
			return Nt(e), !0;
		} catch {
			return !1;
		}
	})
}).strict(), Bt = l({
	id: It,
	journalId: It,
	lineId: It,
	revision: a().int().positive(),
	splits: c(zt).max(100),
	updatedAt: Rt,
	updatedBy: It
}).strict(), Vt = l({
	id: It,
	operationId: It,
	recordId: It,
	revision: a().int().positive(),
	at: Rt,
	actorId: It,
	reason: Lt,
	fingerprint: e().max(3e6),
	before: c(zt),
	after: c(zt)
}).strict(), Ht = l({
	operationId: It,
	journalId: It,
	lineId: It,
	expectedRevision: a().int().nonnegative(),
	expectedSource: e().max(2e6),
	splits: c(zt).max(100),
	reason: Lt
}).strict(), Ut = [], Wt = [], Gt = /* @__PURE__ */ new Set(), Kt = () => Gt.forEach((e) => e());
function qt(e, t, n) {
	if (new Set(e.map((e) => e.jobId)).size !== e.length) throw Error("Use one split per project.");
	if (e.some((e) => !n.some((t) => t.id === e.jobId))) throw Error("Project was not found.");
	if (e.reduce((e, t) => e + Nt(t.amount), 0) > Nt(t)) throw Error("Project splits exceed the source amount.");
}
g("jobCosting", {
	repository: {
		subscribe(e) {
			return Gt.add(e), () => {
				Gt.delete(e);
			};
		},
		getSnapshot: () => Ut,
		review() {
			return S.require("accounting.read"), {
				lines: Pt(O.getAll(), D.getAll()),
				allocations: structuredClone(Ut),
				history: structuredClone(Wt)
			};
		},
		report(t) {
			S.require("accounting.read");
			let n = l({
				from: e(),
				to: e()
			}).strict().parse(t);
			return Ft(O.getAll(), D.getAll(), v.jobs, Ut, n.from, n.to);
		},
		save(e) {
			let t = S.require("accounting.post"), n = Ht.parse(e), r = JSON.stringify(n), i = Wt.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already has different allocation data.");
				return Ut.find((e) => e.id === i.recordId);
			}
			let a = Pt(O.getAll(), D.getAll()).find((e) => e.journalId === n.journalId && e.lineId === n.lineId);
			if (!a) throw Error("Select a posted revenue or expense line.");
			if (a.reversal) throw Error("Allocate the original line; reversal entries inherit its splits.");
			if (n.expectedSource !== a.signature) throw Error("Source journal changed. Refresh before allocating.");
			let o = Ut.find((e) => e.journalId === a.journalId && e.lineId === a.lineId);
			if ((o?.revision ?? 0) !== n.expectedRevision) throw Error("Allocation changed. Refresh before saving.");
			qt(n.splits, a.capacity, v.jobs);
			for (let e of n.splits) if (v.jobs.find((t) => t.id === e.jobId).status !== "Active" && o?.splits.find((t) => t.jobId === e.jobId)?.amount !== e.amount) throw Error("Only active projects can receive new or changed allocations.");
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
			return Ut = [...Ut.filter((e) => e.id !== c.id), c], Wt = [...Wt, {
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
			}], Kt(), c;
		}
	},
	read: "accounting.read",
	commands: {
		review: "accounting.read",
		report: "accounting.read",
		save: "accounting.post"
	},
	snapshot: () => ({
		allocations: Ut,
		history: Wt
	}),
	restore: (e) => {
		Ut = e.allocations, Wt = e.history;
	},
	publish: Kt,
	validate: (e, t) => {
		let n = l({
			allocations: c(Bt),
			history: c(Vt)
		}).strict().parse(e), r = t.workspace_jobs.records, i = Pt(t.journals.journalEntries, t.accounts.accounts), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
		for (let e of n.allocations) {
			let t = i.find((t) => t.journalId === e.journalId && t.lineId === e.lineId), o = e.journalId + ":" + e.lineId;
			if (!t || t.reversal || a.has(o)) throw Error("Invalid project source reference.");
			a.add(o), qt(e.splits, t.capacity, r);
			let s = n.history.filter((t) => t.recordId === e.id);
			if (s.length !== e.revision) throw Error("Invalid allocation history length.");
			let c = [], l = "";
			for (let [n, i] of s.entries()) {
				let a = Ht.parse(JSON.parse(i.fingerprint));
				if (i.revision !== n + 1 || i.at < l || JSON.stringify(i.before) !== JSON.stringify(c) || a.journalId !== e.journalId || a.lineId !== e.lineId || a.operationId !== i.operationId || a.expectedRevision !== n || a.reason !== i.reason || JSON.stringify(a.splits) !== JSON.stringify(i.after)) throw Error("Invalid allocation history chain.");
				qt(i.after, t.capacity, r), c = i.after, l = i.at;
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
var Jt = [
	"Flooring Retailer",
	"Builder",
	"Developer",
	"Designer",
	"Architect",
	"Installer",
	"Other"
], Yt = [
	"ACTIVE",
	"ON_HOLD",
	"INACTIVE"
], Xt = e().trim().refine((t) => t === "" || e().email().safeParse(t).success, { message: "Enter a valid email address" }), Zt = e().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), Qt = l({
	businessName: e().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: e().trim().max(120, "Trading name is too long"),
	abn: Zt,
	businessType: o(Jt),
	status: o(Yt),
	email: Xt,
	phone: e().trim().max(40, "Phone number is too long"),
	website: e().trim().max(200, "Website is too long"),
	creditLimit: a({ message: "Credit limit is required" }).min(0, "Credit limit cannot be negative"),
	paymentTermsDays: a({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days")
}), $t = l({
	name: e().trim().min(1, "Location name is required").max(100, "Location name is too long"),
	addressLine1: e().trim().min(1, "Address is required").max(160, "Address is too long"),
	addressLine2: e().trim().max(160, "Address is too long"),
	suburb: e().trim().min(1, "Suburb is required").max(100, "Suburb is too long"),
	state: e().trim().min(1, "State is required").max(50, "State is too long"),
	postcode: e().trim().min(1, "Postcode is required").max(20, "Postcode is too long"),
	country: e().trim().min(1, "Country is required").max(100, "Country is too long"),
	phone: e().trim().max(40, "Phone number is too long"),
	isPrimary: n()
}), en = l({
	isAccounting: n().optional(),
	firstName: e().trim().min(1, "First name is required").max(80, "First name is too long"),
	lastName: e().trim().min(1, "Last name is required").max(80, "Last name is too long"),
	jobTitle: e().trim().max(100, "Job title is too long"),
	email: e().trim().min(1, "Email is required").email("Enter a valid email address"),
	phone: e().trim().max(40, "Phone number is too long"),
	mobile: e().trim().max(40, "Mobile number is too long"),
	locationId: e(),
	isPrimary: n()
}), tn = [
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
], nn = "htt.mock.contacts.customers.v1";
function rn(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var an = Ze(nn, rn), on = an.status !== "invalid" && $e(nn), sn = /* @__PURE__ */ new Set(), cn = an.status === "ok" ? an.data : structuredClone(tn);
function ln() {
	on && Qe(nn, cn), sn.forEach((e) => {
		e();
	});
}
function un(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function dn() {
	let e = cn.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function k(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function fn(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function pn(e, t) {
	let n = !1;
	if (cn = cn.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	ln();
}
var mn = {
	subscribe(e) {
		return sn.add(e), () => {
			sn.delete(e);
		};
	},
	getSnapshot() {
		return cn;
	},
	getAll() {
		return cn;
	},
	getById(e) {
		return cn.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: un("cus"),
			code: dn(),
			businessName: e.businessName.trim(),
			tradingName: k(e.tradingName),
			abn: fn(e.abn),
			businessType: e.businessType,
			status: e.status,
			email: k(e.email),
			phone: k(e.phone),
			website: k(e.website),
			creditLimit: e.creditLimit,
			currentBalance: 0,
			overdueBalance: 0,
			paymentTermsDays: e.paymentTermsDays,
			locations: [],
			contacts: [],
			createdAt: t,
			updatedAt: t
		};
		return cn = [n, ...cn], ln(), n;
	},
	update(e, t) {
		let n;
		if (pn(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: k(t.tradingName),
			abn: fn(t.abn),
			businessType: t.businessType,
			status: t.status,
			email: k(t.email),
			phone: k(t.phone),
			website: k(t.website),
			creditLimit: t.creditLimit,
			paymentTermsDays: t.paymentTermsDays,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, n)), !n) throw Error(`Customer ${e} was not found`);
		return n;
	},
	addLocation(e, t) {
		let n = mn.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: un("loc"),
			name: t.name.trim(),
			addressLine1: t.addressLine1.trim(),
			addressLine2: k(t.addressLine2),
			suburb: t.suburb.trim(),
			state: t.state.trim(),
			postcode: t.postcode.trim(),
			country: t.country.trim(),
			phone: k(t.phone),
			isPrimary: r
		};
		return pn(e, (e) => ({
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
		let r = mn.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		let i = r.locations.find((e) => e.id === t);
		if (!i) throw Error(`Location ${t} was not found`);
		let a = n.isPrimary || r.locations.length === 1, o = {
			...i,
			name: n.name.trim(),
			addressLine1: n.addressLine1.trim(),
			addressLine2: k(n.addressLine2),
			suburb: n.suburb.trim(),
			state: n.state.trim(),
			postcode: n.postcode.trim(),
			country: n.country.trim(),
			phone: k(n.phone),
			isPrimary: a
		};
		return pn(e, (e) => ({
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
		t = en.parse(t);
		let n = mn.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: un("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: k(t.jobTitle),
			email: t.email.trim(),
			phone: k(t.phone),
			mobile: k(t.mobile),
			locationId: k(t.locationId),
			isPrimary: r,
			isAccounting: t.isAccounting ?? !1
		};
		return pn(e, (e) => ({
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
		n = en.parse(n);
		let r = mn.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		if (n.locationId && !r.locations.some((e) => e.id === n.locationId)) throw Error("The selected location does not belong to this customer");
		let i = r.contacts.find((e) => e.id === t);
		if (!i) throw Error(`Contact ${t} was not found`);
		let a = n.isPrimary || r.contacts.length === 1, o = {
			...i,
			firstName: n.firstName.trim(),
			lastName: n.lastName.trim(),
			jobTitle: k(n.jobTitle),
			email: n.email.trim(),
			phone: k(n.phone),
			mobile: k(n.mobile),
			locationId: k(n.locationId),
			isPrimary: a,
			isAccounting: n.isAccounting ?? !1
		};
		return pn(e, (e) => ({
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
g("customers", {
	repository: mn,
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
	snapshot: () => ({ customers: cn }),
	restore: (e) => {
		cn = e.customers;
	},
	publish: () => sn.forEach((e) => e())
});
//#endregion
//#region src/features/contact-review/reviewModel.ts
var hn = [
	"Customer",
	"Branch",
	"Contact"
], gn = [
	"Manual",
	"Sales draft",
	"Selected contact",
	"Card transcription"
], _n = {
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
}, vn = de(e(), f([
	e().max(2e3),
	a().finite(),
	n()
]));
function yn(e, t) {
	let n = vn.parse(t), r = _n[e];
	if (Object.keys(n).some((e) => !Object.hasOwn(r, e))) throw Error("Unsupported draft field. Use the documented fields for this draft type.");
	for (let [e, t] of Object.entries(n)) if (typeof t != typeof r[e]) throw Error(`Invalid value type for ${e}.`);
	return {
		...r,
		...n
	};
}
var bn = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), xn = (e) => String(e ?? "").trim().toLowerCase(), Sn = (e) => String(e ?? "").replace(/\D/g, ""), Cn = (e, t, n = bn) => !!n(e) && n(e) === n(t);
function wn(e, t) {
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
		(Cn(r.businessName, e.businessName) || Cn(r.businessName, e.tradingName) || Cn(r.tradingName, e.businessName) || Cn(r.tradingName, e.tradingName)) && t.push("Business/trading name"), Cn(r.email, e.email, xn) && t.push("Email"), Cn(r.phone, e.phone, Sn) && t.push("Phone"), Cn(r.abn, e.abn) && t.push("Identifier"), i(e.id, e.id, e.businessName, [
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
			Cn(r.name, e.name) && t.push("Branch name"), String(r.addressLine1).trim() && Cn([
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
			].join(" ")) && t.push("Address"), Cn(r.phone, e.phone, Sn) && t.push("Phone"), i(e.id, n.id, e.name, [
				e.addressLine1,
				e.suburb,
				e.postcode
			].filter(Boolean).join(" · "), t);
		}
		else for (let e of n.contacts) {
			let t = [];
			Cn([r.firstName, r.lastName].join(" "), [e.firstName, e.lastName].join(" ")) && t.push("Contact name"), Cn(r.email, e.email, xn) && t.push("Email"), (Cn(r.phone, e.phone, Sn) || Cn(r.phone, e.mobile, Sn) || Cn(r.mobile, e.phone, Sn) || Cn(r.mobile, e.mobile, Sn)) && t.push("Phone/mobile"), i(e.id, n.id, `${e.firstName} ${e.lastName}`, [
				e.email,
				e.phone,
				e.mobile
			].filter(Boolean).join(" · "), t);
		}
	}
	return n.sort((e, t) => t.reasons.length - e.reasons.length || e.name.localeCompare(t.name) || e.id.localeCompare(t.id));
}
function Tn(e) {
	return JSON.stringify(e);
}
//#endregion
//#region src/features/contact-review/reviewRepository.ts
var En = e().trim().min(1).max(200), Dn = e().trim().max(2e3), On = e().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), kn = l({
	operationId: En,
	kind: o(hn),
	customerId: e().max(200).default(""),
	values: vn,
	source: o(gn).default("Manual"),
	externalId: e().trim().max(200).default(""),
	sourceReference: e().trim().max(500).default("")
}).strict(), An = l({
	id: En,
	action: En,
	actorId: En,
	at: On,
	reason: Dn,
	data: e().max(2e6)
}).strict(), jn = l({
	action: o([
		"Approve new",
		"Link existing",
		"Reject"
	]),
	actorId: En,
	at: On,
	reason: Dn,
	fingerprint: e().max(1e4),
	customerId: e(),
	targetId: e(),
	snapshot: r()
}).strict(), Mn = kn.extend({
	id: En,
	state: o([
		"Pending",
		"Approved",
		"Linked",
		"Rejected"
	]),
	revision: a().int().positive(),
	createdBy: En,
	createdAt: On,
	updatedAt: On,
	creationFingerprint: e().max(1e5),
	history: c(An).min(1),
	decision: jn.optional()
}).strict(), Nn = [], Pn = /* @__PURE__ */ new Set(), Fn = () => Pn.forEach((e) => e());
function In() {
	let e = S.require("contacts.write");
	return S.require("sales.read"), e.userId;
}
var Ln = () => (/* @__PURE__ */ new Date()).toISOString();
function Rn(e) {
	let t = Ln();
	if (t < e.updatedAt) throw Error("System clock precedes the last review update. Correct it before continuing.");
	return t;
}
var zn = (e, t, n, r = "", i = {}) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	reason: r,
	data: JSON.stringify(i)
});
function Bn(e) {
	let t = Nn.find((t) => t.id === e);
	if (!t) throw Error("Review draft not found.");
	return t;
}
function Vn(e, t) {
	if (e.revision !== t) throw Error("Review draft changed. Reload before continuing.");
}
function Hn(e) {
	return Nn = [...Nn.filter((t) => t.id !== e.id), e], Fn(), e;
}
function Un(e) {
	let t = kn.parse(e);
	if (t.values = yn(t.kind, t.values), t.kind === "Customer" && t.customerId) throw Error("Customer drafts must not have a parent customer.");
	if (t.customerId && !mn.getById(t.customerId)) throw Error("Parent customer was not found.");
	return t;
}
function Wn(e, t) {
	return e === "Customer" ? Qt.strict().parse(t) : e === "Branch" ? $t.strict().parse(t) : en.strict().parse(t);
}
function Gn(e, t, n) {
	let r = mn.getById(e === "Customer" ? n : t);
	if (!r) throw Error("Choose an existing customer.");
	let i = e === "Customer" ? r : e === "Branch" ? r.locations.find((e) => e.id === n) : r.contacts.find((e) => e.id === n);
	if (!i) throw Error("The selected record does not belong to this customer or draft type.");
	return {
		customerId: r.id,
		targetId: i.id,
		snapshot: structuredClone(i)
	};
}
var Kn = {
	subscribe(e) {
		return Pn.add(e), () => {
			Pn.delete(e);
		};
	},
	getSnapshot: () => Nn,
	create(e) {
		let t = In(), n = Un(e), { operationId: r, ...i } = n, a = JSON.stringify(i), o = Nn.find((e) => e.operationId === r) || n.externalId && Nn.find((e) => e.source === n.source && e.externalId === n.externalId);
		if (o) {
			if (o.creationFingerprint !== a) throw Error("Operation or external source ID already contains different draft data.");
			return o;
		}
		let s = Ln();
		return Hn({
			...n,
			id: crypto.randomUUID(),
			state: "Pending",
			revision: 1,
			createdBy: t,
			createdAt: s,
			updatedAt: s,
			creationFingerprint: a,
			history: [zn("Received", t, s, "", i)]
		});
	},
	importBatch(e) {
		In();
		let t = l({
			operationId: En.max(150),
			drafts: c(kn.omit({ operationId: !0 })).min(1).max(100)
		}).strict().parse(e);
		if (t.drafts.some((e) => !e.externalId)) throw Error("Each imported draft requires a source external ID for safe retry.");
		return t.drafts.map((e, n) => Kn.create({
			...e,
			operationId: t.operationId + ":" + n
		}));
	},
	update(t) {
		let n = In(), r = l({
			id: En,
			expectedRevision: a().int().positive(),
			customerId: e().max(200),
			values: vn
		}).strict().parse(t), i = Bn(r.id);
		if (Vn(i, r.expectedRevision), i.state !== "Pending") throw Error("Only pending drafts can be edited.");
		let o = Un({
			operationId: i.operationId,
			kind: i.kind,
			customerId: r.customerId,
			values: r.values,
			source: i.source,
			externalId: i.externalId,
			sourceReference: i.sourceReference
		}), s = Rn(i);
		return Hn({
			...i,
			customerId: o.customerId,
			values: o.values,
			revision: i.revision + 1,
			updatedAt: s,
			history: [...i.history, zn("Updated", n, s, "", {
				customerId: o.customerId,
				values: o.values
			})]
		});
	},
	review(e) {
		S.require("sales.read");
		let t = Bn(En.parse(e)), n = mn.getAll(), r = "";
		try {
			if (Wn(t.kind, t.values), t.kind !== "Customer" && !n.some((e) => e.id === t.customerId)) throw Error("Select the parent customer.");
		} catch (e) {
			r = e.message;
		}
		return {
			revision: t.revision,
			duplicates: wn(t, n),
			masterSignature: Tn(n),
			validationError: r
		};
	},
	decide(t) {
		let r = In(), i = l({
			id: En,
			expectedRevision: a().int().positive(),
			action: o([
				"Approve new",
				"Link existing",
				"Reject"
			]),
			reason: Dn,
			allowDuplicate: n().default(!1),
			targetId: e().max(200).default(""),
			expectedMaster: e().max(25e6).optional()
		}).strict().parse(t), s = Bn(i.id), c = JSON.stringify({
			action: i.action,
			reason: i.reason,
			allowDuplicate: i.allowDuplicate,
			targetId: i.targetId
		});
		if (s.state !== "Pending") {
			if (s.decision?.fingerprint === c) return s;
			throw Error("This draft already has a different decision.");
		}
		Vn(s, i.expectedRevision);
		let u = Rn(s), d = {
			customerId: "",
			targetId: "",
			snapshot: null
		};
		if (i.action === "Reject") {
			if (!i.reason) throw Error("Explain why the draft is rejected.");
		} else {
			let e = mn.getAll();
			if (i.expectedMaster !== Tn(e)) throw Error("Customer records changed. Refresh duplicate review before deciding.");
			if (i.action === "Link existing") {
				if (!i.reason) throw Error("Explain why this existing record is the correct match.");
				d = Gn(s.kind, s.customerId, i.targetId);
			} else {
				if (wn(s, e).length && (!i.allowDuplicate || !i.reason)) throw Error("Possible duplicates exist. Link an existing record or explicitly confirm a separate new record with a reason.");
				let t = Wn(s.kind, s.values);
				if (s.kind === "Customer") {
					let e = mn.create(t);
					d = {
						customerId: e.id,
						targetId: e.id,
						snapshot: structuredClone(e)
					};
				} else {
					let e = mn.getById(s.customerId);
					if (!e || e.status === "INACTIVE") throw Error("Select an available parent customer.");
					let n = s.kind === "Branch" ? mn.addLocation(e.id, t) : mn.addContact(e.id, t);
					d = {
						customerId: e.id,
						targetId: n.id,
						snapshot: structuredClone(n)
					};
				}
			}
		}
		let f = {
			action: i.action,
			actorId: r,
			at: u,
			reason: i.reason,
			fingerprint: c,
			...d
		};
		return Hn({
			...s,
			state: i.action === "Reject" ? "Rejected" : i.action === "Link existing" ? "Linked" : "Approved",
			revision: s.revision + 1,
			updatedAt: u,
			decision: f,
			history: [...s.history, zn(i.action, r, u, i.reason, f)]
		});
	},
	reopen(e) {
		let t = In(), n = l({
			id: En,
			expectedRevision: a().int().positive(),
			reason: Dn.refine(Boolean, "Explain why this draft is reopened.")
		}).strict().parse(e), r = Bn(n.id);
		if (Vn(r, n.expectedRevision), r.state !== "Rejected") throw Error("Only rejected drafts may be reopened.");
		let i = Rn(r), o = {
			...r,
			state: "Pending",
			revision: r.revision + 1,
			updatedAt: i,
			history: [...r.history, zn("Reopened", t, i, n.reason)]
		};
		return delete o.decision, Hn(o);
	}
};
g("contactReviews", {
	repository: Kn,
	read: "sales.read",
	commands: {
		create: "contacts.write",
		update: "contacts.write",
		importBatch: "contacts.write",
		review: "sales.read",
		decide: "contacts.write",
		reopen: "contacts.write"
	},
	snapshot: () => ({ drafts: Nn }),
	restore: (e) => {
		Nn = e.drafts;
	},
	publish: Fn,
	validate: (t, r) => {
		let i = l({ drafts: c(Mn) }).strict().parse(t), a = r.customers.customers, s = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Set();
		for (let t of i.drafts) {
			let r = yn(t.kind, t.values);
			if (Object.keys(r).length !== Object.keys(t.values).length) throw Error("Missing review draft fields.");
			if (s.has(t.operationId) || t.externalId && u.has(t.source + ":" + t.externalId)) throw Error("Duplicate review intake identity.");
			s.add(t.operationId), t.externalId && u.add(t.source + ":" + t.externalId);
			let i = JSON.parse(t.creationFingerprint);
			if (t.history[0].data !== t.creationFingerprint) throw Error("Review source history is inconsistent.");
			if (i.kind !== t.kind || i.source !== t.source || i.externalId !== t.externalId || i.sourceReference !== t.sourceReference) throw Error("Review intake provenance is inconsistent.");
			if (t.history.length !== t.revision || new Set(t.history.map((e) => e.id)).size !== t.history.length || t.history[0].action !== "Received" || t.history[0].actorId !== t.createdBy || t.history[0].at !== t.createdAt || t.updatedAt < t.createdAt) throw Error("Invalid review history.");
			let c = "Pending", d = t.createdAt;
			for (let [e, n] of t.history.entries()) {
				if (n.at < d || n.at > t.updatedAt) throw Error("Invalid review event time.");
				d = n.at;
				let r = JSON.parse(n.data);
				if (!r || typeof r != "object" || Array.isArray(r)) throw Error("Invalid review event payload.");
				if (e !== 0) {
					if (n.action === "Updated") {
						if (c !== "Pending") throw Error("Invalid review edit history.");
					} else if (n.action === "Reopened") {
						if (c !== "Rejected" || !n.reason) throw Error("Invalid review reopen history.");
						c = "Pending";
					} else if ([
						"Approve new",
						"Link existing",
						"Reject"
					].includes(n.action)) {
						if (c !== "Pending") throw Error("Invalid repeated review decision.");
						c = n.action === "Reject" ? "Rejected" : n.action === "Link existing" ? "Linked" : "Approved";
					} else throw Error("Unknown review history action.");
				}
			}
			if (c !== t.state || t.history.at(-1).at !== t.updatedAt) throw Error("Review history does not match current state.");
			if (t.kind === "Customer" && t.customerId || t.customerId && !a.some((e) => e.id === t.customerId)) throw Error("Review parent customer is invalid.");
			if (t.state === "Pending" != !t.decision) throw Error("Review state and decision are inconsistent.");
			if (t.decision) {
				let r = t.state === "Rejected" ? "Reject" : t.state === "Linked" ? "Link existing" : "Approve new", i = l({
					action: o([
						"Approve new",
						"Link existing",
						"Reject"
					]),
					reason: Dn,
					allowDuplicate: n(),
					targetId: e()
				}).strict().parse(JSON.parse(t.decision.fingerprint)), s = t.history.at(-1);
				if (i.action !== r || i.reason !== t.decision.reason || i.targetId !== (r === "Link existing" ? t.decision.targetId : "") || s.actorId !== t.decision.actorId || s.at !== t.decision.at || s.reason !== t.decision.reason || JSON.stringify(JSON.parse(s.data)) !== JSON.stringify(t.decision)) throw Error("Review decision audit is inconsistent.");
				if (t.decision.action !== r) throw Error("Invalid review decision.");
				if (r !== "Reject") {
					let e = a.find((e) => e.id === t.decision.customerId), n = t.kind === "Customer" ? e : t.kind === "Branch" ? e?.locations.find((e) => e.id === t.decision.targetId) : e?.contacts.find((e) => e.id === t.decision.targetId);
					if (!n || n.id !== t.decision.targetId || t.kind !== "Customer" && e.id !== t.customerId || t.decision.snapshot?.id !== n.id) throw Error("Invalid resolved review reference.");
					r === "Approve new" && Wn(t.kind, t.values);
				} else if (!t.decision.reason || t.decision.customerId || t.decision.targetId) throw Error("Invalid rejection.");
			}
		}
	}
});
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var qn = "htt.mock.banking.accounts.v1";
function Jn(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var Yn = /* @__PURE__ */ new Set(), Xn = "2026-10-08T00:00:00.000Z", Zn = [{
	id: "bank_001",
	name: "Operating Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1000",
	accountType: "TRANSACTION",
	currency: m().currency,
	glAccountId: "acc_1000",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: Xn,
	updatedAt: Xn
}, {
	id: "bank_002",
	name: "Savings Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1010",
	accountType: "SAVINGS",
	currency: m().currency,
	glAccountId: "acc_1010",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: Xn,
	updatedAt: Xn
}], Qn = Ze(qn, Jn);
Qn.status === "ok" && Qn.data.every((e) => {
	let t = D.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (Zn = Qn.data);
function $n() {
	Yn.forEach((e) => e());
}
function er(e) {
	let t = D.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of Zn) er(e);
var tr = {
	subscribe(e) {
		return Yn.add(e), () => {
			Yn.delete(e);
		};
	},
	getSnapshot() {
		return Zn;
	},
	getAll() {
		return Zn;
	},
	getById(e) {
		return Zn.find((t) => t.id === e);
	},
	getByGlAccountId(e) {
		return Zn.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = Zn.find((t) => t.id === e);
		if (!t) throw Error("Bank account was not found.");
		return t;
	},
	save(t, r) {
		let i = l({
			id: e().optional(),
			name: e().trim().min(1).max(180),
			bankName: e().trim().min(1).max(180),
			accountNumber: e().trim().min(1).max(100),
			accountType: o([
				"TRANSACTION",
				"SAVINGS",
				"CREDIT_CARD",
				"OTHER"
			]),
			currency: o(["AUD", "NZD"]),
			glAccountId: e().min(1),
			openingBalanceDate: e(),
			active: n()
		}).strict().parse(t);
		if (y(i.openingBalanceDate, "Opening date"), Zn[0] && i.currency !== Zn[0].currency) throw Error("This profile uses one base currency; foreign-currency bank accounts are not supported.");
		let a = Zn.find((e) => e.id === i.id);
		if (a && a.updatedAt !== r) throw Error("Bank account changed; reload before editing.");
		if (!a && i.id) throw Error("Bank account was not found.");
		if (Zn.some((e) => e.id !== a?.id && e.glAccountId === i.glAccountId)) throw Error("Each bank account needs its own GL account.");
		let s = D.requireById(i.glAccountId);
		if (!s.active || s.type !== "ASSET" || s.systemRole && s.systemRole !== "BANK") throw Error("Choose an active bank Asset account.");
		if (a && O.getAll().some((e) => e.lines.some((e) => e.accountId === a.glAccountId)) && (a.glAccountId !== i.glAccountId || a.openingBalanceDate !== i.openingBalanceDate || a.currency !== i.currency)) throw Error("A used bank account cannot change its ledger, currency or opening date.");
		let c = new Date(Math.max(Date.now(), a ? Date.parse(a.updatedAt) + 1 : 0)).toISOString(), u = {
			...i,
			id: a?.id ?? crypto.randomUUID(),
			openingBalance: a?.openingBalance ?? 0,
			createdAt: a?.createdAt ?? c,
			updatedAt: c
		};
		return er(u), Zn = [...Zn.filter((e) => e.id !== u.id), u], $n(), u;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Zn = Zn.map((t) => t.id === e ? r : t), $e(qn) && Qe(qn, Zn), $n(), r;
	}
};
g("bankAccounts", {
	repository: tr,
	read: "banking.read",
	commands: {
		if: null,
		validateBankAccount: null,
		setActive: "banking.write",
		save: "banking.write"
	},
	snapshot: () => ({ bankAccounts: Zn }),
	restore: (e) => {
		Zn = e.bankAccounts;
	},
	publish: () => Yn.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/itemTypes.ts
function nr(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function rr(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function ir(e, t) {
	if (e.itemType !== void 0 && ![
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	].includes(String(e.itemType))) throw Error("Invalid saved sales item type.");
	if (t && (e.itemType ?? "STOCK") !== (t.itemType ?? "STOCK")) throw Error("Saved sales item type does not match its referenced product.");
}
//#endregion
//#region src/features/inventory/data/mockProducts.ts
var ar = [
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
	return ar.find((t) => t.id === e);
}
function or(e, t) {
	return A(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/sales/data/areaPacks.ts
function sr(e, t) {
	let n = A(e), r = n?.units.find((e) => e.id === t), i = n?.units.find((e) => e.id === n.baseUnitId);
	return n?.status === "ACTIVE" && n.itemType !== "SERVICE" && r?.active && i?.code === "M2" && ["BOX", "ROLL"].includes(r.code) && Number.isFinite(r.conversionToBase) && r.conversionToBase > 0 ? r.conversionToBase : void 0;
}
function cr(e, t, n, r) {
	if (r === void 0) return { quantity: n };
	let i = sr(e, t);
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
function lr(e) {
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
function ur(e, t) {
	let n = mn.getById(e);
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
function dr(e) {
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
function fr(e, t, n, r) {
	let i = A(e), a = or(e, t);
	if (!i || i.status !== "ACTIVE" || !a?.active) throw Error("Select an active product and unit.");
	if (r === "buy" && !nr(i)) throw Error("Non-stock/service items use expense bills, not inventory purchase orders.");
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
var pr = "htt:financial-operations:v1", mr = [
	"CUSTOMER_PAYMENT",
	"PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
], hr = [
	"PENDING",
	"COMPLETED",
	"MANUAL_REVIEW"
], gr = (e) => Array.isArray(e) && e.every((e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.operationId == "string" && t.operationId.length > 0 && mr.includes(String(t.kind)) && typeof t.fingerprint == "string" && t.fingerprint.length > 0 && hr.includes(String(t.state)) && typeof t.createdAt == "string" && typeof t.updatedAt == "string" && (t.resultId === void 0 || typeof t.resultId == "string") && (t.note === void 0 || typeof t.note == "string") && (t.reviewHistory === void 0 || Array.isArray(t.reviewHistory) && t.reviewHistory.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		return typeof t.reference == "string" && t.reference.length >= 3 && typeof t.operator == "string" && t.operator.length >= 2 && typeof t.recordedAt == "string" && typeof t.summary == "string" && t.summary.length >= 3;
	}));
}) && new Set(e.map((e) => e.operationId)).size === e.length;
function _r() {
	let e = Ze(pr, gr);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function vr(e) {
	if (!$e(pr) || !Qe(pr, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var j = {
	list() {
		return _r().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !mr.includes(t)) throw Error("Invalid operation identity.");
		let r = _r(), i = r.find((t) => t.operationId === e);
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
		return vr([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = _r(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return vr(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = _r(), r = n.find((t) => t.operationId === e);
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
		return vr(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = _r(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return vr(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = _r(), a = i.find((t) => t.operationId === e);
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
		return vr(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = _r(), a = i.find((t) => t.operationId === e);
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
		return vr(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	getUnresolved() {
		return _r().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
	}
};
g("financialOperations", {
	repository: j,
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
var yr = /* @__PURE__ */ new Map(), br = "htt.purchasePosting.operations.v1";
function xr() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function Sr() {
	let e = xr();
	if (e) try {
		e.setItem(br, JSON.stringify([...yr.values()]));
	} catch {}
}
function Cr() {
	let e = xr();
	if (e) try {
		let t = JSON.parse(e.getItem(br) ?? "[]");
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
			yr.set(t.key, {
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
Cr();
var wr = /* @__PURE__ */ new Set(), Tr = /* @__PURE__ */ new Map(), Er = /* @__PURE__ */ new Map(), Dr;
function Or() {
	Sr(), wr.forEach((e) => e());
}
var M = {
	injectFailureBeforeStep(e, t, n = 1) {
		Er.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		Er.clear();
	},
	registerRecovery(e, t) {
		if (!yr.has(e)) throw Error(`Unknown posting operation: ${e}`);
		Tr.set(e, t);
	},
	runStep(e, t, n) {
		let r = yr.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = Er.get(i) ?? 0;
		if (a > 0) throw Er.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return Tr.has(e);
	},
	recover(e) {
		let t = yr.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = Tr.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (Dr === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		Dr = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			Dr = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = yr.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...yr.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return wr.add(e), () => {
			wr.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if (yr.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return yr.set(n, r), Or(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = yr.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		yr.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), Or();
	},
	completeStep(e, t) {
		let n = yr.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (yr.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), Or());
	}
};
g("purchaseOperations", {
	repository: M,
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
	snapshot: () => M.getAll(),
	restore: (e) => {
		yr.clear(), Tr.clear();
		for (let t of e) yr.set(t.key, t);
	},
	publish: () => wr.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var kr = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Ar(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${kr.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function N() {
	Ar(j.list(), M.getAll());
}
//#endregion
//#region src/features/sales/data/quoteStorage.ts
var jr = "htt.mock.sales.quotes.v1", Mr = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function Nr(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !Mr.has(String(t.status)) || ![
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
function Pr() {
	return Ze(jr, Nr);
}
function Fr(e) {
	if (Pr().status === "invalid" || !$e("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!Qe("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var Ir = "htt.mock.sales.quote-orders.v1";
function Lr(e) {
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
function Rr(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!Nr(t.quotes) || !Lr(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function zr() {
	return Ze(Ir, Rr);
}
function Br(e) {
	if (!Rr(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = zr(), n = Pr();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !$e("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!Qe("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var Vr = "htt.mock.sales.documents.v1";
function Hr(e) {
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
function Ur(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!Rr(t) || !Hr(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function Wr() {
	return Ze(Vr, Ur);
}
function Gr(e) {
	if (!Ur(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = Wr();
	if (t.status === "invalid" || t.status === "unavailable" || !$e("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!Qe("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var Kr = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function qr(e) {
	let t = e.filter((e) => Kr.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function Jr() {
	qr(j.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var Yr = [{
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
}], Xr = [{
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
}], Zr = [{
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
}], Qr = "htt.mock.sales.credit-notes.v1", $r = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, ei = (e) => typeof e == "string" && e.length > 0;
function ti(e) {
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
		].every((e) => ei(t[e])) || ![
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
		].every((e) => $r(i[e])) || !$r(t.amountApplied) || !$r(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => ei(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !$r(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		if (Math.abs(t - e.amountApplied) > .011) return !1;
		let n = e.refundEvents ?? [];
		if (!Array.isArray(n) || n.some((e) => !e || !ei(e.id) || !ei(e.date) || !$r(e.amount) || e.amount <= 0 || e.reversalDate !== void 0 && !ei(e.reversalDate)) || new Set(n.map((e) => e.id)).size !== n.length) return !1;
		let r = n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0);
		return !$r(e.amountRefunded ?? 0) || Math.abs(r - (e.amountRefunded ?? 0)) > .011 || t + r > e.totals.total + .011 ? !1 : e.status === "VOID" ? t === 0 && r === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t - r)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function ni() {
	return Ze(Qr, ti);
}
function ri(e) {
	if (!ti(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = ni();
	if (t.status === "invalid" || t.status === "unavailable" || !$e("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!Qe("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var ii = /* @__PURE__ */ new Set(), ai = ni(), oi = ai.status === "ok" ? structuredClone(ai.data.creditNotes) : [], si = ai.status === "ok" ? structuredClone(ai.data.allocations) : [], ci = [...oi], li = [...si];
function ui() {
	ci = [...oi], li = [...si], ii.forEach((e) => e());
}
function di(e, t) {
	ri({
		creditNotes: e,
		allocations: t
	}), oi = e, si = t, ui();
}
var P = {
	subscribe(e) {
		return ii.add(e), () => {
			ii.delete(e);
		};
	},
	getSnapshot() {
		return ci;
	},
	getAllocationSnapshot() {
		return li;
	},
	getAll() {
		return ci;
	},
	getAllAllocations() {
		return li;
	},
	getById(e) {
		return oi.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return oi.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return oi.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return si.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return si.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if (oi.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return di([e, ...oi], si), e;
	},
	update(e) {
		if (!oi.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return di(oi.map((t) => t.id === e.id ? e : t), si), e;
	},
	createAllocation(e) {
		if (si.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return di(oi, [e, ...si]), e;
	},
	updateAllocation(e) {
		if (!si.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return di(oi, si.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!oi.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = si.some((t) => t.id === e.id) ? si.map((t) => t.id === e.id ? e : t) : [e, ...si];
		di(oi.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return si.find((t) => t.id === e);
	}
};
g("customerCredits", {
	repository: P,
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
			dr(n.recipient);
			for (let e of n.lines) lr(e), ir(e, t.products.products.find((t) => t.id === e.productId));
		}
	},
	snapshot: () => ({
		creditNotes: oi,
		allocations: si
	}),
	restore: (e) => {
		oi = e.creditNotes, si = e.allocations, ci = [...oi], li = [...si];
	},
	publish: () => ii.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/customerPricingStorage.ts
var fi = "htt.mock.contacts.customerPricing.v1";
function pi(e) {
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
function mi() {
	return Ze(fi, pi);
}
function hi(e) {
	if (mi().status === "invalid" || !$e("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!Qe("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var gi = [
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
], _i = /* @__PURE__ */ new Set(), vi = mi(), yi = vi.status === "ok" ? vi.data : structuredClone(gi);
function bi() {
	_i.forEach((e) => {
		e();
	});
}
function xi(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Si(e) {
	return e.trim() || void 0;
}
function Ci(e, t) {
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
function wi(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function Ti({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = yi.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : wi(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = Ai(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function Ei(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function Di(e) {
	let t = or(e.productId, e.unitId);
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
var Oi = {
	subscribe(e) {
		return _i.add(e), () => {
			_i.delete(e);
		};
	},
	getSnapshot() {
		return yi;
	},
	getAll() {
		return yi;
	},
	getById(e) {
		return yi.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return yi.filter((t) => t.customerId === e);
	},
	create(e, t) {
		Ci(t.productId, t.unitId);
		let n = Si(t.effectiveTo);
		t.active && Ti({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = Ei(t), a = {
			id: xi("cprice"),
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
		}, o = [a, ...yi];
		return hi(o), yi = o, bi(), a;
	},
	update(e, t) {
		let n = Oi.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		Ci(t.productId, t.unitId);
		let r = Si(t.effectiveTo);
		t.active && Ti({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = Ei(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = yi.map((t) => t.id === e ? a : t);
		return hi(o), yi = o, bi(), a;
	},
	resolve(e) {
		return Di(e);
	},
	resolvePrice(e, t, n, r) {
		let i = Oi.resolveBasePrice(e, t, n, r.slice(0, 10)), a = ee({
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
		let { unit: i } = Ci(t, n), a = yi.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && ki(r, i.effectiveFrom, i.effectiveTo));
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
		let o = Di(a);
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
function ki(e, t, n) {
	return !(e < t || n && e > n);
}
function Ai(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
g("customerPrices", {
	repository: Oi,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: yi }),
	restore: (e) => {
		yi = e.customerPrices;
	},
	publish: () => _i.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
function ji(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Mi({ quantity: e, standardUnitPrice: t, unitPrice: n, taxRate: r = ne(), inclusiveLineTotal: i }) {
	let a = ji(e * n), o = ji(i === void 0 ? a * r : i - a), s = ji(a + o), c = ji(t - n);
	return {
		discountAmount: c,
		discountPercent: t > 0 ? ji(c / t * 100) : 0,
		lineSubtotal: a,
		taxAmount: o,
		lineTotal: s
	};
}
function Ni(e) {
	let t = ji(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = ji(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: ji(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function Pi({ customerId: e, documentDate: t, draft: n }) {
	if (n.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let r = A(n.productId);
	if (!r) throw Error(`Product ${n.productId} was not found`);
	if (r.status !== "ACTIVE") throw Error(`${r.name} is inactive`);
	let i = or(n.productId, n.unitId);
	if (!i) throw Error(`Unit ${n.unitId} was not found for ${r.name}`);
	let a = Oi.resolvePrice(e, n.productId, n.unitId, t), o = n.unitPrice !== void 0, s = o ? n.unitPrice : a.effectivePrice;
	if (!Number.isFinite(s) || s < 0) throw Error("Unit price cannot be negative");
	let c = cr(n.productId, n.unitId, n.quantity, n.requestedArea);
	if (fr(n.productId, n.unitId, c.quantity, "sell"), r.sellEnabled === !1) throw Error("Product is not available for selling.");
	let l = r.taxCode ?? m().gstCode, u = ne(l), d = o ? h(s, u, n.priceBasis) : s, f = Mi({
		taxRate: u,
		inclusiveLineTotal: o && (n.priceBasis ?? m().basis) === "Inclusive" ? Math.round(c.quantity * s * 100) / 100 : void 0,
		quantity: c.quantity,
		standardUnitPrice: a.basePrice,
		unitPrice: d
	});
	return {
		id: Fi("line"),
		itemType: r.itemType ?? "STOCK",
		...c,
		...te(l),
		priceBasis: o ? n.priceBasis ?? m().basis : "Exclusive",
		grossUnitPrice: o && (n.priceBasis ?? m().basis) === "Inclusive" ? s : void 0,
		promotionId: o ? void 0 : a.promotionId,
		productId: r.id,
		unitId: i.id,
		sku: r.sku,
		description: r.name,
		unitSymbol: i.symbol,
		quantity: c.quantity,
		standardUnitPrice: a.basePrice,
		unitPrice: d,
		priceSource: o ? "MANUAL" : a.source,
		customerPriceId: o ? void 0 : a.customerPrice?.id,
		...f
	};
}
function Fi(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var Ii = /* @__PURE__ */ new Set(), Li = T.read().payments;
function Ri() {
	Ii.forEach((e) => e());
}
function zi() {
	return `payment_${crypto.randomUUID()}`;
}
function Bi() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Li.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var Vi = {
	subscribe(e) {
		return Ii.add(e), () => {
			Ii.delete(e);
		};
	},
	getSnapshot() {
		return Li;
	},
	getAll() {
		return Li;
	},
	getById(e) {
		return Li.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Li.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Li.filter((t) => t.invoiceId === e);
	},
	create(e) {
		if (!e.customerId) throw Error("Customer is required");
		if (!e.invoiceId) throw Error("Invoice is required");
		if (!e.paymentDate) throw Error("Payment date is required");
		if (!e.bankAccountId) throw Error("Bank account is required");
		let t = tr.getById(e.bankAccountId);
		if (!t) throw Error("Bank account was not found");
		if (!t.active) throw Error("The selected bank account is inactive");
		if (!Number.isFinite(e.amount) || e.amount <= 0) throw Error("Payment amount must be greater than zero");
		if (y(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (Ui(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = j.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: Ui(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: Hi(e.reference),
				notes: Hi(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = Li.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: zi(),
			paymentNumber: Bi(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: Ui(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: Hi(e.reference),
			notes: Hi(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && j.bindResult(n, i.id);
		let a = [i, ...Li];
		if (T.update("payments", a), Li = a, n && !e.deferOperationCompletion) try {
			j.complete(n, i.id);
		} catch (e) {
			try {
				j.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return Ri(), i;
	},
	reverse(e, t) {
		let n = Li.find((t) => t.id === e);
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
		}, o = Li.map((t) => t.id === e ? a : t);
		return T.update("payments", o), Li = o, Ri(), a;
	},
	getReceivedByInvoice(e) {
		return Li.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function Hi(e) {
	return e?.trim() || void 0;
}
function Ui(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
g("customerPayments", {
	repository: Vi,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null
	},
	snapshot: () => ({ payments: Li }),
	restore: (e) => {
		Li = e.payments;
	},
	publish: () => Ii.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/taxPosting.ts
function Wi(e, t, n, r) {
	let i = t === "paid" ? "GST_RECEIVABLE" : "GST_PAYABLE", a = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = (t === "paid" ? n.taxPaidAccountId : n.taxCollectedAccountId) || D.requireBySystemRole(i).id;
		a.set(e, (a.get(e) ?? 0) + n.taxAmount);
	}
	return e.length || a.set(D.requireBySystemRole(i).id, r), [...a].filter(([, e]) => Math.round((e + 2 ** -52) * 100) !== 0).map(([e, t]) => {
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
function Gi(e) {
	return D.requireBySystemRole(e).id;
}
function Ki(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: m().timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function qi(e, t) {
	return O.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Ji(e, t) {
	let n = qi(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Yi = {
	postInvoice(e) {
		return qi("CUSTOMER_INVOICE", e.id) || O.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: Gi("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: Gi("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				...Wi(e.lines, "collected", !1, e.totals.taxAmount)
			]
		});
	},
	reverseInvoice(e) {
		let t = Ji("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? O.getById(t.reversalJournalEntryId) : void 0 : O.reverse({
			journalEntryId: t.id,
			reversalDate: Ki(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = qi("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = tr.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this customer payment is inactive.");
		return O.post({
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
				accountId: Gi("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = Ji("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? O.getById(t.reversalJournalEntryId) : void 0 : O.reverse({
			journalEntryId: t.id,
			reversalDate: Ki(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return qi("CREDIT_NOTE", e.id) || O.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: Gi("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				...Wi(e.lines, "collected", !0, e.totals.taxAmount),
				{
					accountId: Gi("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = Ji("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? O.getById(t.reversalJournalEntryId) : void 0 : O.reverse({
			journalEntryId: t.id,
			reversalDate: Ki(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, Xi = /* @__PURE__ */ new Set(), Zi = Wr(), Qi = zr(), $i = Pr(), F = Zi.status === "ok" ? structuredClone(Zi.data.quotes) : Qi.status === "ok" ? structuredClone(Qi.data.quotes) : $i.status === "ok" ? structuredClone($i.data) : structuredClone(Yr);
function ea(e) {
	Zi.status === "ok" || Wr().status !== "empty" ? Gr({
		quotes: e,
		salesOrders: I,
		invoices: L
	}) : Qi.status === "ok" || zr().status !== "empty" ? Br({
		quotes: e,
		salesOrders: I
	}) : Fr(e), F = e, ia();
}
var I = Zi.status === "ok" ? structuredClone(Zi.data.salesOrders) : Qi.status === "ok" ? structuredClone(Qi.data.salesOrders) : structuredClone(Xr), L = Zi.status === "ok" ? structuredClone(Zi.data.invoices) : structuredClone(Zr);
function ta(e) {
	Gr({
		quotes: F,
		salesOrders: I,
		invoices: e
	}), L = e, ia();
}
function na(e, t = F) {
	Zi.status === "ok" || Wr().status !== "empty" ? Gr({
		quotes: t,
		salesOrders: e,
		invoices: L
	}) : Br({
		quotes: t,
		salesOrders: e
	}), I = e, F = t, ia();
}
var ra = aa();
function ia() {
	ra = aa(), Xi.forEach((e) => e());
}
function aa() {
	return [
		...F,
		...I,
		...L
	];
}
var R = {
	createManagedOrder(e) {
		let t = I.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: ca("order"),
			managedDraftId: e.draftId,
			type: "SALES_ORDER",
			status: "CONFIRMED",
			documentNumber: la("SO", I.map((e) => e.documentNumber)),
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
		return na([r, ...I]), r;
	},
	createManagedInvoice(e) {
		let t = L.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = R.createManagedOrder(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: ca("invoice"),
			managedDraftId: e.draftId,
			type: "INVOICE",
			status: "ISSUED",
			documentNumber: la("INV", L.map((e) => e.documentNumber)),
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
		}, a = I.map((e) => e.id === n.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: r
		} : e);
		return Gr({
			quotes: F,
			salesOrders: a,
			invoices: [i, ...L]
		}), I = a, L = [i, ...L], ia(), Yi.postInvoice(i), i;
	},
	cancelManagedOrder(e, t) {
		let n = I.find((t) => t.id === e);
		if (!n?.managedDraftId) throw Error("Managed order not found.");
		if (n.status === "CANCELLED") return n;
		if (n.invoiceIds.some((e) => L.some((t) => t.id === e && t.status !== "VOID"))) throw Error("Void active invoices before cancelling the order.");
		if (n.status === "PARTIALLY_FULFILLED" || n.status === "FULFILLED" || n.fulfilmentStatus === "PARTIALLY_FULFILLED" || n.fulfilmentStatus === "FULFILLED") throw Error("Reverse active fulfilments before cancelling the order.");
		if (t.trim().length < 3) throw Error("Cancellation reason is required.");
		let r = {
			...n,
			status: "CANCELLED",
			notes: (n.notes ?? "") + "\nCancelled: " + t.trim(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return na(I.map((t) => t.id === e ? r : t)), r;
	},
	subscribe(e) {
		return Xi.add(e), () => {
			Xi.delete(e);
		};
	},
	getSnapshot() {
		return ra;
	},
	getAll() {
		return ra;
	},
	getById(e) {
		return ra.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return ra.filter((t) => t.customerId === e);
	},
	getQuotesByCustomer(e) {
		return F.filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return I.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return L.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (oa(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = e.lines.map((t) => Pi({
			customerId: e.customerId,
			documentDate: e.documentDate,
			draft: t
		})), n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: ca("quote"),
			type: "QUOTE",
			documentNumber: la("QU", F.map((e) => e.documentNumber)),
			recipient: ur(e.customerId, e),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: sa(e.customerReference),
			notes: sa(e.notes),
			lines: t,
			totals: Ni(t),
			createdAt: n,
			updatedAt: n
		};
		return ea([r, ...F]), r;
	},
	updateDraftQuote(e, t) {
		let n = F.find((t) => t.id === e);
		if (!n) throw Error(`Quote ${e} was not found`);
		if (n.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let r = t.lines.map((e) => {
			if (e.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
			if (!Number.isFinite(e.standardUnitPrice) || !Number.isFinite(e.unitPrice) || e.standardUnitPrice < 0 || e.unitPrice < 0) throw Error("Sales prices cannot be negative");
			let t = cr(e.productId, e.unitId, e.quantity, e.requestedArea);
			fr(e.productId, e.unitId, t.quantity, "sell");
			let r = A(e.productId)?.taxCode ?? m().gstCode, i = Mi({
				taxRate: ne(r),
				quantity: t.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice
			}), a = n.lines.find((t) => t.id === e.lineId);
			return {
				itemType: A(e.productId)?.itemType ?? "STOCK",
				...t,
				id: a?.id ?? ca("line"),
				productId: e.productId,
				unitId: e.unitId,
				sku: fa(e.productId, e.unitId).sku,
				description: fa(e.productId, e.unitId).description,
				unitSymbol: fa(e.productId, e.unitId).unitSymbol,
				quantity: t.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice,
				priceSource: e.priceSource,
				customerPriceId: e.customerPriceId,
				...te(r),
				...i
			};
		}), i = {
			...n,
			recipient: t.locationId === void 0 && t.accountingContactId === void 0 ? n.recipient : ur(n.customerId, t),
			documentDate: t.documentDate,
			expiryDate: t.expiryDate,
			customerReference: sa(t.customerReference),
			notes: sa(t.notes),
			lines: r,
			totals: Ni(r),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ea(F.map((t) => t.id === e ? i : t)), i;
	},
	sendQuote(e) {
		let t = F.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return ea(F.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = F.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return ea(F.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = F.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return ea(F.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = F.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: ca("order"),
			type: "SALES_ORDER",
			documentNumber: la("SO", I.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: ua(),
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
		return na([r, ...I], F.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = I.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED" && n.status !== "INVOICED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: n.status === "INVOICED" ? "INVOICED" : t,
			fulfilmentStatus: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return na(I.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = I.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = ua(), i = {
			id: ca("invoice"),
			managedDraftId: t.managedDraftId,
			type: "INVOICE",
			documentNumber: la("INV", L.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: r,
			dueDate: da(r, Number(m().terms)),
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
		}, a = [i, ...L], o = I.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: n
		} : e);
		return Gr({
			quotes: F,
			salesOrders: o,
			invoices: a
		}), L = a, I = o, ia(), Yi.postInvoice(i), i;
	},
	createCreditNoteFromInvoice(e) {
		let t = L.find((t) => t.id === e.invoiceId);
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
			let i = P.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id).reduce((e, t) => e + t.quantity, 0);
			if (e.quantity + i > n.quantity + 1e-8) throw Error("Credit quantity cannot exceed the original invoice quantity.");
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = P.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id), s = e.quantity + i >= n.quantity - 1e-8, c = pa(s ? n.lineSubtotal - o.reduce((e, t) => e + t.lineSubtotal, 0) : n.lineSubtotal * e.quantity / n.quantity), l = pa(s ? n.taxAmount - o.reduce((e, t) => e + t.taxAmount, 0) : n.taxAmount * e.quantity / n.quantity);
			return {
				...n,
				requestedArea: e.quantity === n.quantity ? n.requestedArea : void 0,
				coveredArea: n.areaPerPack ? Math.round(e.quantity * n.areaPerPack * 1e8) / 1e8 : void 0,
				quantity: e.quantity,
				taxRate: a,
				lineSubtotal: c,
				taxAmount: l,
				lineTotal: pa(c + l)
			};
		}), a = Ni(i);
		if (a.total <= 0) throw Error("Credit note total must be greater than zero");
		if (pa(pa(P.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + a.total) > pa(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: ca("credit-note"),
			creditNoteNumber: la("CN", P.getAll().map((e) => e.creditNoteNumber)),
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
		return P.create(s), Yi.postCreditNote(s), s;
	},
	applyCreditToInvoice(e) {
		N(), Jr();
		let t = P.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		let n = L.find((t) => t.id === e.invoiceId);
		if (!n) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void credit note cannot be applied");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be applied");
		if (n.status === "VOID") throw Error("Credit cannot be applied to a void invoice");
		if (n.status === "DRAFT") throw Error("Credit cannot be applied to a draft invoice");
		if (t.customerId !== n.customerId) throw Error("Credit note and invoice must belong to the same customer");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the credit note date");
		let r = pa(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = P.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: ca("credit-allocation"),
			allocationNumber: la("CA", P.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = pa(i.amountApplied + r), c = pa(Math.max(0, i.totals.total - (i.amountRefunded ?? 0) - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
		if (j.begin(l, "SALES_CREDIT_APPLY", JSON.stringify({
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: r
		})).status !== "started") throw Error("Credit allocation was previously attempted; manual review required.");
		try {
			j.bindResult(l, o.id), P.commitAllocationAndCredit(o, {
				...i,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(n.id), j.complete(l, o.id);
		} catch (e) {
			try {
				j.flagForReview(l, "Credit allocation/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	reverseCreditAllocation(e) {
		N(), Jr();
		let t = P.getAllocationById(e.allocationId);
		if (!t) throw Error(`Credit allocation ${e.allocationId} was not found`);
		if (t.status === "REVERSED") throw Error("This credit allocation has already been reversed");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A reversal reason is required");
		let r = P.getById(t.creditNoteId);
		if (!r) throw Error("Credit note was not found");
		if (r.status === "VOID") throw Error("Allocations on a void credit note cannot be reversed here");
		let i = L.find((e) => e.id === t.invoiceId);
		if (!i) throw Error("Allocated invoice was not found");
		if (i.status === "VOID") throw Error("Credit allocation cannot be reversed after the invoice has been voided");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			updatedAt: a
		}, s = pa(P.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = pa(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - s)), l = `sales-credit-reversal:${t.id}`;
		if (j.begin(l, "SALES_CREDIT_REVERSAL", t.id).status !== "started") throw Error("Credit allocation reversal previously attempted; manual review required.");
		try {
			j.bindResult(l, t.id), P.commitAllocationAndCredit(o, {
				...r,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(i.id), j.complete(l, t.id);
		} catch (e) {
			try {
				j.flagForReview(l, "Credit reversal/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	voidCreditNote(e) {
		let t = P.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		if (t.status === "VOID") throw Error("This credit note has already been voided");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be voided here");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse customer refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required");
		if (P.getAllocationsByCreditNote(t.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this credit note");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: r,
			voidReason: n,
			updatedAt: r
		};
		return P.update(i), Yi.reverseCreditNote(i), i;
	},
	recordInvoicePayment(e) {
		if (N(), Jr(), e.operationId) {
			let t = j.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = L.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = pa(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (y(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, a = Vi.create({
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
			Yi.postPayment(a);
			let e = O.getBySource("CUSTOMER_PAYMENT", a.id).filter((e) => !e.reversedJournalEntryId);
			if (e.length !== 1 || e[0].status !== "POSTED") throw Error("Payment GL posting could not be verified uniquely.");
			j.complete(i, a.id);
		} catch (e) {
			try {
				j.flagForReview(i, "Payment or GL posting uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	voidInvoice(e, t) {
		N(), Jr();
		let n = L.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (Vi.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
		if (P.getAllocationsByInvoice(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("This invoice has applied credits. Reverse all active credit allocations before voiding the invoice.");
		if (n.managedDraftId && P.getByInvoice(n.id).some((e) => e.status !== "VOID")) throw Error("Void source credits before voiding this direct invoice.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			amountPaid: 0,
			amountDue: 0,
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		}, o = `sales-invoice-void:${e}`;
		if (j.begin(o, "SALES_INVOICE_VOID", e).status !== "started") throw Error("Invoice void was previously attempted; inspect GL and operation journal before retrying.");
		try {
			let t = O.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (t.length !== 1 || t[0].status !== "POSTED") throw Error("Invoice original GL must be uniquely posted before voiding.");
			j.bindResult(o, e), Yi.reverseInvoice(a);
			let n = O.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			ta(L.map((t) => t.id === e ? a : t)), j.complete(o, e);
		} catch (e) {
			try {
				j.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		Ie("CUSTOMER_PAYMENT", e), N(), Jr();
		let n = Vi.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = L.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (j.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			j.bindResult(i, e);
			let n = Vi.reverse(e, t);
			Yi.reversePayment(n);
			let a = O.getBySource("CUSTOMER_PAYMENT", e).filter((e) => !e.reversedJournalEntryId);
			if (a.length !== 1 || a[0].status !== "REVERSED") throw Error("Payment GL reversal could not be verified.");
			return this.recalculateInvoiceBalance(r.id), j.complete(i, e), n;
		} catch (e) {
			try {
				j.flagForReview(i, "Payment reversal/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
	},
	recalculateInvoiceBalance(e) {
		let t = L.find((t) => t.id === e);
		if (!t) throw Error(`Invoice ${e} was not found`);
		if (t.status === "VOID") return t;
		let n = Vi.getReceivedByInvoice(e), r = P.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = pa(n.reduce((e, t) => e + t.amount, 0)), a = pa(r.reduce((e, t) => e + t.amount, 0)), o = pa(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : ma(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ta(L.map((t) => t.id === e ? c : t)), c;
	}
};
function oa(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function sa(e) {
	return e?.trim() || void 0;
}
function ca(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function la(e, t) {
	return b(e, t, _((/* @__PURE__ */ new Date()).toISOString()).slice(0, 4));
}
function ua() {
	return _((/* @__PURE__ */ new Date()).toISOString());
}
function da(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function fa(e, t) {
	let n = A(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = or(e, t);
	if (!r) throw Error(`Unit ${t} was not found for ${n.name}`);
	return {
		sku: n.sku,
		description: n.name,
		unitSymbol: r.symbol
	};
}
function pa(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ma(e) {
	return e < ha(/* @__PURE__ */ new Date());
}
function ha(e) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
g("sales", {
	repository: R,
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
			dr(e.recipient);
			for (let n of e.lines) lr(n), ir(n, t.products.products.find((e) => e.id === n.productId));
		}
	},
	snapshot: () => ({
		quotes: F,
		salesOrders: I,
		invoices: L
	}),
	restore: (e) => {
		F = e.quotes, I = e.salesOrders, L = e.invoices, ra = aa();
	},
	publish: () => Xi.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var ga = [
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
		currency: m().currency,
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
		currency: m().currency,
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
		currency: m().currency,
		taxRegistered: !0,
		createdAt: "2026-03-05T01:00:00.000Z",
		updatedAt: "2026-03-05T01:00:00.000Z"
	}
], _a = "htt.mock.contacts.suppliers.v1";
function va(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var ya = Ze(_a, va), ba = ya.status !== "invalid" && $e(_a), xa = /* @__PURE__ */ new Set(), Sa = ya.status === "ok" ? ya.data : structuredClone(ga);
function Ca() {
	ba && Qe(_a, Sa), xa.forEach((e) => {
		e();
	});
}
function wa(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Ta() {
	let e = Sa.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function Ea(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function Da(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function Oa(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: Ea(e.tradingName),
		abn: Da(e.abn),
		status: e.status,
		email: Ea(e.email),
		phone: Ea(e.phone),
		website: Ea(e.website),
		contactName: Ea(e.contactName),
		addressLine1: Ea(e.addressLine1),
		addressLine2: Ea(e.addressLine2),
		suburb: Ea(e.suburb),
		state: Ea(e.state),
		postcode: Ea(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: Ea(e.notes)
	};
}
var ka = {
	subscribe(e) {
		return xa.add(e), () => {
			xa.delete(e);
		};
	},
	getSnapshot() {
		return Sa;
	},
	getAll() {
		return Sa;
	},
	getById(e) {
		return Sa.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: wa("sup"),
			code: Ta(),
			...Oa(e),
			currency: m().currency,
			createdAt: t,
			updatedAt: t
		};
		return Sa = [n, ...Sa], Ca(), n;
	},
	update(e, t) {
		let n = ka.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...Oa(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Sa = Sa.map((t) => t.id === e ? r : t), Ca(), r;
	}
};
g("suppliers", {
	repository: ka,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: Sa }),
	restore: (e) => {
		Sa = e.suppliers;
	},
	publish: () => xa.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
function Aa(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ja({ orderedQuantity: e, unitCost: t, taxRate: n = ne(), inclusiveLineTotal: r }) {
	let i = Aa(e * t), a = Aa(r === void 0 ? i * n : r - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: Aa(i + a)
	};
}
function Ma(e) {
	let t = Aa(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Aa(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: Aa(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var Na = /* @__PURE__ */ new Set(), z = T.read().purchaseOrders;
T.onRollback(() => {
	z = T.read().purchaseOrders;
});
function Pa() {
	try {
		T.update("purchaseOrders", z);
	} catch (e) {
		throw z = T.read().purchaseOrders, e;
	}
	Na.forEach((e) => T.notify(e));
}
function Fa(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Ia(e) {
	return b("PO", z.map((e) => e.purchaseOrderNumber), e.slice(0, 4));
}
function La(e) {
	return e?.trim() || void 0;
}
function Ra(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = ar.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let n = t.units.find((t) => t.id === e.unitId);
		if (!n) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!n.active) throw Error(`${n.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		if (fr(e.productId, e.unitId, e.orderedQuantity, "buy"), t.buyEnabled === !1) throw Error("Product is not available for purchasing.");
		let r = t.taxCode ?? m().gstCode, i = ne(r), a = ja({
			taxRate: i,
			inclusiveLineTotal: (e.priceBasis ?? m().basis) === "Inclusive" ? Math.round(e.orderedQuantity * e.unitCost * 100) / 100 : void 0,
			orderedQuantity: e.orderedQuantity,
			unitCost: h(e.unitCost, i, e.priceBasis)
		});
		return {
			id: Fa("pol"),
			...te(r),
			grossUnitCost: (e.priceBasis ?? m().basis) === "Inclusive" ? e.unitCost : void 0,
			productId: t.id,
			unitId: n.id,
			sku: t.sku,
			description: t.name,
			unitSymbol: n.symbol,
			orderedQuantity: e.orderedQuantity,
			receivedQuantity: 0,
			billedQuantity: 0,
			unitCost: h(e.unitCost, i, e.priceBasis),
			...a
		};
	});
}
function za(e) {
	let t = ka.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function Ba(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var Va = {
	subscribe(e) {
		return Na.add(e), () => {
			Na.delete(e);
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
	getBySupplier(e) {
		return z.filter((t) => t.supplierId === e);
	},
	create(e) {
		Ba(e);
		let t = za(e.supplierId), n = Ra(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Fa("po"),
			purchaseOrderNumber: Ia(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: La(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: La(e.supplierReference),
			notes: La(e.notes),
			lines: n,
			totals: Ma(n),
			createdAt: r,
			updatedAt: r
		};
		return z = [i, ...z], Pa(), i;
	},
	updateDraft(e, t) {
		let n = Va.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		Ba(t);
		let r = za(t.supplierId), i = Ra(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: La(t.expectedDeliveryDate),
			supplierReference: La(t.supplierReference),
			notes: La(t.notes),
			lines: i,
			totals: Ma(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return z = z.map((e) => e.id === n.id ? a : e), Pa(), a;
	},
	approve(e) {
		let t = Va.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return Ha(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = Va.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return Ha(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = Va.getById(e);
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
		return z = z.map((e) => e.id === n.id ? o : e), Pa(), o;
	},
	recordSupplierBill(e, t) {
		let n = Va.getById(e);
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
			let n = Ua(e.billedQuantity + t);
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
		return z = z.map((e) => e.id === n.id ? c : e), Pa(), c;
	},
	reverseSupplierBill(e, t) {
		let n = Va.getById(e);
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
				billedQuantity: Ua(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return z = z.map((e) => e.id === n.id ? c : e), Pa(), c;
	},
	cancel(e, t) {
		let n = Va.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return Ha(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function Ha(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return z = z.map((t) => t.id === e.id ? n : t), Pa(), n;
}
function Ua(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
g("purchaseOrders", {
	repository: Va,
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
	snapshot: () => ({ purchaseOrders: z }),
	restore: (e) => {
		z = e.purchaseOrders;
	},
	publish: () => Na.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function B(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Wa(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function Ga(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ka({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return Wa(e / t);
}
function qa({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return Ga(e * t);
}
function Ja({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = B(e + n), a = Ga(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : Wa(a / i)
	};
}
function Ya({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return Ga(e * t);
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function Xa(e) {
	return Ga(e.lines.reduce((e, t) => {
		let n = Ka({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + qa({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function Za(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Qa(e) {
	return D.requireBySystemRole(e).id;
}
function $a(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	if (/^\d{4}-\d{2}-\d{2}$/.test(e)) return e;
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: m().timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function eo(e, t) {
	return O.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function to(e, t) {
	let n = eo(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var no = {
	validateGoodsReceiptPosting(e) {
		let t = D.requireBySystemRole("INVENTORY"), n = D.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = Xa(e);
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
		let t = O.getBySource("GOODS_RECEIPT", e.id).find((e) => !e.reversedJournalEntryId);
		if (t) return t;
		let { inventoryAccountId: n, grniAccountId: r, receiptValue: i } = this.validateGoodsReceiptPosting(e);
		return O.post({
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
		let n = D.requireBySystemRole("GRNI"), r = D.requireBySystemRole("GST_RECEIVABLE"), i = D.requireBySystemRole("ACCOUNTS_PAYABLE");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI account must be an active liability account.");
		if (!r.active || r.type !== "ASSET") throw Error("GST Receivable must be an active asset account.");
		if (!i.active || i.type !== "LIABILITY") throw Error("Accounts Payable must be an active liability account.");
		if (!Number.isFinite(t) || t < 0) throw Error("Matched receipt value must be a non-negative finite number.");
		let a = Za(e.totals.subtotal - t);
		if (a !== 0) {
			let e = D.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = Za(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = eo("SUPPLIER_BILL", e.id);
		if (n) return n;
		let r = t ?? e.totals.subtotal, { variance: i } = this.validateSupplierBillPosting(e, r);
		return O.post({
			journalDate: e.billDate,
			description: `Supplier bill ${e.billNumber}`,
			reference: e.supplierInvoiceNumber,
			sourceType: "SUPPLIER_BILL",
			sourceId: e.id,
			lines: [
				{
					accountId: Qa("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				...Wi(e.lines, "paid", !0, e.totals.taxAmount),
				...i === 0 ? [] : [{
					accountId: Qa("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: Qa("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = to("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? O.getById(t.reversalJournalEntryId) : void 0 : O.reverse({
			journalEntryId: t.id,
			reversalDate: $a(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = eo("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = tr.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return O.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: Qa("ACCOUNTS_PAYABLE"),
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
		let t = to("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? O.getById(t.reversalJournalEntryId) : void 0 : O.reverse({
			journalEntryId: t.id,
			reversalDate: $a(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return eo("SUPPLIER_CREDIT", e.id) || O.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: Qa("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				...e.lines.reduce((e, t) => {
					let n = t.expenseAccountId ?? Qa("PURCHASE_PRICE_VARIANCE"), r = e.find((e) => e.accountId === n);
					return r ? r.credit = Math.round((r.credit + t.lineSubtotal) * 100) / 100 : t.lineSubtotal && e.push({
						accountId: n,
						debit: 0,
						credit: t.lineSubtotal
					}), e;
				}, []),
				...Wi(e.lines, "paid", !1, e.totals.taxAmount)
			]
		});
	},
	reverseSupplierCredit(e) {
		for (let t of O.getBySource("SUPPLIER_CREDIT_RECLASS", e.id).filter((e) => e.status === "POSTED")) O.reverse({
			journalEntryId: t.id,
			reversalDate: $a(e.voidedAt),
			reason: e.voidReason ?? "Credit void"
		});
		let t = to("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? O.getById(t.reversalJournalEntryId) : void 0 : O.reverse({
			journalEntryId: t.id,
			reversalDate: $a(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, ro = structuredClone([{
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
}]), io = {
	getAll() {
		return ro;
	},
	getById(e) {
		return ro.find((t) => t.id === e);
	},
	getActive() {
		return ro.filter((e) => e.status === "ACTIVE");
	}
}, ao = /* @__PURE__ */ new Set(), oo = [];
function so() {
	ao.forEach((e) => e());
}
function co() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = oo.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var lo = {
	subscribe(e) {
		return ao.add(e), () => {
			ao.delete(e);
		};
	},
	getSnapshot() {
		return oo;
	},
	getAll() {
		return oo;
	},
	getByReference(e, t) {
		return oo.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return oo.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return oo.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: co(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return oo = [t, ...oo], so(), t;
	}
};
g("inventoryMovements", {
	repository: lo,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: oo }),
	restore: (e) => {
		oo = e.movements;
	},
	publish: () => ao.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var uo = /* @__PURE__ */ new Set(), fo = [];
function po() {
	uo.forEach((e) => e());
}
var mo = {
	subscribe(e) {
		return uo.add(e), () => {
			uo.delete(e);
		};
	},
	getSnapshot() {
		return fo;
	},
	getAll() {
		return fo;
	},
	getBalance(e, t) {
		return fo.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = mo.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return fo = fo.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? fo.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...fo], po(), e;
	},
	replaceAll(e) {
		fo = e, po();
	},
	clear() {
		fo = [], po();
	}
};
g("costBalances", {
	repository: mo,
	read: "inventory.cost.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: fo }),
	restore: (e) => {
		fo = e.balances;
	},
	publish: () => uo.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var ho = /* @__PURE__ */ new Set(), go = [];
function _o() {
	ho.forEach((e) => e());
}
function vo() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = go.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function yo(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var bo = {
	subscribe(e) {
		return ho.add(e), () => {
			ho.delete(e);
		};
	},
	getSnapshot() {
		return go;
	},
	getAll() {
		return go;
	},
	getByReference(e, t) {
		return go.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return go.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return go.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return go.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return yo(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: vo(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = bo.build(e);
		return go = [t, ...go], _o(), t;
	},
	replaceAll(e) {
		go = e, _o();
	},
	clear() {
		go = [], _o();
	}
};
g("costMovements", {
	repository: bo,
	read: "inventory.cost.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: go }),
	restore: (e) => {
		go = e.movements;
	},
	publish: () => ho.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var xo = /* @__PURE__ */ new Set(), So = "2026-01-01T00:00:00.000Z", Co = ar.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: So,
	updatedAt: So
}));
function wo() {
	xo.forEach((e) => e());
}
var To = {
	ensureProductPolicy(e, t, n) {
		let r = Co.find((t) => t.productId === e), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			productId: e,
			baseUnitId: t,
			active: n ? r?.active ?? !0 : !1,
			costingMethod: "MOVING_WEIGHTED_AVERAGE",
			createdAt: r?.createdAt ?? i,
			updatedAt: i
		};
		return Co = [...Co.filter((t) => t.productId !== e), a], wo(), a;
	},
	subscribe(e) {
		return xo.add(e), () => {
			xo.delete(e);
		};
	},
	getSnapshot() {
		return Co;
	},
	getAll() {
		return Co;
	},
	getByProductId(e) {
		return Co.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = To.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		if (t && !nr(A(e) ?? { itemType: "SERVICE" })) throw Error("Inventory costing cannot be enabled for non-stock/service items.");
		let n = {
			...To.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Co = Co.map((t) => t.productId === e ? n : t), wo(), n;
	}
};
g("costingPolicies", {
	repository: To,
	read: "inventory.cost.read",
	commands: {
		ensureProductPolicy: null,
		setActive: "accounting.post"
	},
	snapshot: () => ({ policies: Co }),
	restore: (e) => {
		Co = e.policies;
	},
	publish: () => xo.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function Eo(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function Do(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function Oo(e, t) {
	let n = A(e);
	if (!n) throw Error("Product was not found.");
	if (!nr(n)) throw Error("Non-stock/service items cannot move inventory value.");
	let r = To.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = or(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function ko(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = Ga(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(Ga(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function Ao(e) {
	if (e && bo.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function jo({ movement: e, balance: t }) {
	let n = bo.getAll(), r = mo.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	bo.replaceAll(i), mo.replaceAll(a);
}
function Mo(e) {
	if (Eo(e.quantity), Do(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	Ao(e.inventoryMovementId);
	let { policy: t, unit: n } = Oo(e.productId, e.unitId), r = B(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = Ka({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = qa({
		quantityBase: r,
		unitCostBase: i
	}), o = mo.getBalance(e.siteId, e.productId);
	o && ko(o, t.baseUnitId);
	let s = Ja({
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
	ko(l, t.baseUnitId);
	let u = bo.build({
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
	return jo({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function No(e) {
	Eo(e.quantity), Do(e.occurredAt), Ao(e.inventoryMovementId);
	let { policy: t, unit: n } = Oo(e.productId, e.unitId), r = B(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = mo.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (ko(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = Wa(i.averageCostPerBaseUnit), o = Ya({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = B(i.quantityOnHand - r), c = s === 0, l = Ga(c ? -i.inventoryValue : -o), u = c ? 0 : Ga(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : Wa(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	ko(p, t.baseUnitId);
	let m = bo.build({
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
	return jo({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function Po(e) {
	if (Eo(e.quantityBase), Do(e.occurredAt), Ao(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = A(e.productId);
	if (!t) throw Error("Product was not found.");
	if (!nr(t)) throw Error("Non-stock/service items cannot restore inventory value.");
	let n = To.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = B(e.quantityBase), i = Wa(e.unitCostBase), a = Ga(e.inventoryValue), o = mo.getBalance(e.siteId, e.productId);
	o && ko(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = B(s + r), u = Ga(c + a), d = l === 0 ? 0 : Wa(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	ko(p, n.baseUnitId);
	let m = bo.build({
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
	return jo({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var Fo = /* @__PURE__ */ new Set(), Io = [];
function Lo() {
	Fo.forEach((e) => e());
}
function Ro(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var zo = {
	subscribe(e) {
		return Fo.add(e), () => {
			Fo.delete(e);
		};
	},
	getSnapshot() {
		return Io;
	},
	getAll() {
		return Io;
	},
	getBalance(e, t) {
		return Io.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = zo.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: Ro(i.quantityOnHand + r),
				updatedAt: a
			};
			return Io = Io.map((r) => r.siteId === e && r.productId === t ? n : r), Lo(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: Ro(r),
			updatedAt: a
		};
		return Io = [o, ...Io], Lo(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = zo.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = Ro(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Io = Io.map((n) => n.siteId === e && n.productId === t ? o : n), Lo(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of lo.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: Ro((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		Io = Array.from(e.values()), Lo();
	}
};
g("stock", {
	repository: zo,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: Io }),
	restore: (e) => {
		Io = e.balances;
	},
	publish: () => Fo.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/goodsReceiptRepository.ts
var Bo = /* @__PURE__ */ new Set(), Vo = T.read().goodsReceipts;
T.onRollback(() => {
	Vo = T.read().goodsReceipts;
});
function Ho() {
	try {
		T.update("goodsReceipts", Vo);
	} catch (e) {
		throw Vo = T.read().goodsReceipts, e;
	}
	Bo.forEach((e) => T.notify(e));
}
function Uo(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Wo(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = Vo.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Go(e) {
	return e?.trim() || void 0;
}
var Ko = {
	subscribe(e) {
		return Bo.add(e), () => {
			Bo.delete(e);
		};
	},
	getSnapshot() {
		return Vo;
	},
	getAll() {
		return Vo;
	},
	getById(e) {
		return Vo.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return Vo.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = Va.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = io.getById(e.siteId);
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
			let r = Uo(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!A(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = or(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = Uo(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: Wo(e.receiptDate),
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
			supplierDeliveryReference: Go(e.supplierDeliveryReference),
			notes: Go(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		no.validateGoodsReceiptPosting(s), N();
		let c = M.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return M.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = A(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				M.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = lo.create({
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
				}), M.runStep(c, `COST:${r.id}`, () => {
					let t = l.get(r.id);
					if (!t) throw Error(`Missing inventory movement for ${r.id}`);
					Mo({
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
				}), M.runStep(c, `STOCK:${r.id}`, () => {
					zo.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			M.runStep(c, "JOURNAL", () => {
				no.postGoodsReceipt(s);
			}), M.runStep(c, "PURCHASE_ORDER", () => {
				Va.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), M.runStep(c, "RECEIPT", () => {
				Vo = [s, ...Vo], Ho();
			});
		}), M.recover(c), s;
	}
};
g("goodsReceipts", {
	repository: Ko,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: Vo }),
	restore: (e) => {
		Vo = e.goodsReceipts;
	},
	publish: () => Bo.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var qo = 1e-4;
function Jo(e) {
	return Ga(e);
}
function Yo(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - B(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function Xo(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function Zo(e, t, n) {
	let r = Ka({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return qa({
		quantityBase: B(e * n),
		unitCostBase: r
	});
}
function Qo(e, t, n) {
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
function $o(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = Qo(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), Yo(e.quantity), Xo(e.billUnitCost);
		let r = B(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > qo);
		if (B(d.reduce((e, t) => e + t.availableQuantity, 0)) + qo < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= qo) break;
			let s = B(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = B(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = qa({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: Ka({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = Jo(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), h = Math.abs(o.availableQuantity - s) <= qo ? Jo(p - m) : Zo(s, o.receiptUnitCost, o.conversionToBase);
			if (h < 0) throw Error("Receipt cost has been overallocated.");
			let ee = Jo(s * e.billUnitCost), te = Jo(ee - h);
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
			}), o.availableQuantity = B(o.availableQuantity - s), r = B(r - s);
		}
		if (r > qo) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = Jo(Jo(e.quantity * e.billUnitCost) - Jo(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = Jo(p.matchedBillValue + f), p.priceVariance = Jo(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = B(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = B(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = Jo(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = Jo(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: Jo(p - f)
	};
}
var es = {
	calculate: $o,
	getAvailableReceiptLines(e, t, n) {
		return Qo(e, t, n);
	}
}, ts = T.read().receiptMatches;
T.onRollback(() => {
	ts = T.read().receiptMatches;
});
var ns = /* @__PURE__ */ new Set(), rs = () => {
	try {
		T.update("receiptMatches", ts);
	} catch (e) {
		throw ts = T.read().receiptMatches, e;
	}
	ns.forEach((e) => T.notify(e));
}, is = {
	getAll() {
		return [...ts];
	},
	subscribe(e) {
		return ns.add(e), () => {
			ns.delete(e);
		};
	},
	getSnapshot() {
		return ts;
	},
	getByBill(e) {
		return ts.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (ts.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		ts = [...ts, ...t], rs();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		ts = ts.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), rs();
	}
};
g("receiptMatches", {
	repository: is,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: ts }),
	restore: (e) => {
		ts = e.matches;
	},
	publish: () => ns.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
function as(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function os({ quantity: e, unitCost: t, inclusiveLineTotal: n, taxRate: r = .1 }) {
	let i = as(e * t), a = as(n === void 0 ? i * r : n - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: as(i + a)
	};
}
function ss(e) {
	let t = as(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = as(e.reduce((e, t) => e + t.taxAmount, 0)), r = as(t + n);
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
var cs = /* @__PURE__ */ new Set(), V = T.read().supplierBills;
T.onRollback(() => {
	V = T.read().supplierBills;
});
function ls() {
	try {
		T.update("supplierBills", V);
	} catch (e) {
		throw V = T.read().supplierBills, e;
	}
	cs.forEach((e) => T.notify(e));
}
function us(e) {
	return e?.trim() || void 0;
}
function ds(e) {
	return b("BILL", V.map((e) => e.billNumber), e.slice(0, 4));
}
var fs = {
	insertExpenseBill(e) {
		let t = V.find((t) => t.managedDraftId === e.managedDraftId);
		if (t) return t;
		if (V.some((t) => t.supplierId === e.supplierId && t.supplierInvoiceNumber.toLowerCase() === e.supplierInvoiceNumber.toLowerCase() && t.status !== "VOID")) throw Error("Supplier invoice reference already exists.");
		return V = [e, ...V], ls(), e;
	},
	subscribe(e) {
		return cs.add(e), () => {
			cs.delete(e);
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
		let r = ms(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = ms(n.totals.amountPaid + r), a = ms(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return V = V.map((t) => t.id === e ? o : t), ls(), o;
	},
	reversePayment(e, t) {
		let n = V.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = ms(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = ms(Math.max(0, n.totals.amountPaid - r)), a = ms(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return V = V.map((t) => t.id === e ? o : t), ls(), o;
	},
	applyCredit(e, t) {
		let n = V.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = ms(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = ms(n.totals.amountCredited + r), a = ms(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return V = V.map((t) => t.id === e ? o : t), ls(), o;
	},
	reverseCredit(e, t) {
		let n = V.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = ms(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = ms(Math.max(0, n.totals.amountCredited - r)), a = ms(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return V = V.map((t) => t.id === e ? o : t), ls(), o;
	},
	markVoid(e, t) {
		let n = V.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("This supplier bill has already been voided.");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required.");
		if (n.status !== "OPEN" || n.totals.amountPaid > 0 || n.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if ((x().supplierCredits?.supplierCredits ?? T.read().supplierCredits).some((e) => e.sourceSupplierBillId === n.id && e.status !== "VOID")) throw Error("Reverse source supplier credits and linked physical returns before voiding the bill.");
		if (n.kind === "EXPENSE") {
			N();
			let e = (/* @__PURE__ */ new Date()).toISOString(), t = {
				...n,
				status: "VOID",
				voidedAt: e,
				voidReason: r,
				updatedAt: e
			};
			return no.reverseSupplierBill(t), V = V.map((e) => e.id === n.id ? t : e), ls(), t;
		}
		if (is.getByBill(n.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		};
		N();
		let o = M.begin("SUPPLIER_BILL_VOID", n.id).key;
		return M.registerRecovery(o, () => {
			M.runStep(o, "REVERSAL_JOURNAL", () => {
				no.reverseSupplierBill(a);
			}), M.runStep(o, "PURCHASE_ORDER", () => {
				Va.reverseSupplierBill(n.purchaseOrderId, n.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), M.runStep(o, "MATCHES", () => {
				is.reverseForBill(n.id, r, _(i));
			}), M.runStep(o, "BILL", () => {
				V = V.map((e) => e.id === n.id ? a : e), ls();
			});
		}), M.recover(o), a;
	},
	getByPurchaseOrder(e) {
		return V.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = Va.getById(e.purchaseOrderId);
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
			let r = ps(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = os({
				taxRate: a,
				quantity: e.quantity,
				unitCost: e.unitCost
			});
			return n.grossUnitCost !== void 0 && e.unitCost === n.unitCost && (o.taxAmount = ms(e.quantity * n.grossUnitCost - o.lineSubtotal), o.lineTotal = ms(o.lineSubtotal + o.taxAmount)), {
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
		}), o = ss(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: ds(e.billDate),
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
			notes: us(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = es.calculate({
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
			receipts: Ko.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: is.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		no.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), N();
		let u = M.begin("SUPPLIER_BILL", c.id).key;
		return M.registerRecovery(u, () => {
			M.runStep(u, "JOURNAL", () => {
				no.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), M.runStep(u, "PURCHASE_ORDER", () => {
				Va.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), M.runStep(u, "MATCHES", () => {
				is.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), M.runStep(u, "BILL", () => {
				V = [c, ...V], ls();
			});
		}), M.recover(u), c;
	}
};
function ps(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function ms(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
g("supplierBills", {
	repository: fs,
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
	snapshot: () => ({ supplierBills: V }),
	restore: (e) => {
		V = e.supplierBills;
	},
	publish: () => cs.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var hs = /* @__PURE__ */ new Set(), H = T.read().supplierCredits, U = T.read().supplierCreditAllocations, gs = T.read().supplierCredits, _s = T.read().supplierCreditAllocations;
T.onRollback(() => {
	H = T.read().supplierCredits, U = T.read().supplierCreditAllocations, gs = H, _s = U;
});
function vs() {
	T.update("supplierCredits", H), T.update("supplierCreditAllocations", U), gs = [...H], _s = [...U], hs.forEach((e) => T.notify(e));
}
var ys = !1, W = {
	subscribe(e) {
		return hs.add(e), () => {
			hs.delete(e);
		};
	},
	getSnapshot() {
		return gs;
	},
	getAllocationSnapshot() {
		return _s;
	},
	getAll() {
		return gs;
	},
	getAllAllocations() {
		return _s;
	},
	getById(e) {
		return H.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return H.filter((t) => t.supplierId === e);
	},
	getBySourceBill(e) {
		return H.filter((t) => t.sourceSupplierBillId === e);
	},
	getAllocationById(e) {
		return U.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return U.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return U.filter((t) => t.supplierBillId === e);
	},
	createReturnCredit(e, t) {
		let n = {
			...W.create(e),
			physicalReturnId: t
		};
		return W.update(n), n;
	},
	voidReturnCredit(e) {
		ys = !0;
		try {
			return W.voidCredit(e);
		} finally {
			ys = !1;
		}
	},
	create(e) {
		let t = fs.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (H.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!Cs(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, n) => {
			let r = i.get(e.supplierBillLineId);
			if (!r) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(r.id)) throw Error(`${r.description} appears more than once in the supplier credit.`);
			a.add(r.id);
			let o = Ts(e.quantity);
			if (!Number.isFinite(o) || o <= 0) throw Error(`${r.description} credit quantity must be greater than zero.`);
			if (o > r.quantity) throw Error(`${r.description} credit quantity cannot exceed the source bill quantity.`);
			let s = e.unitCost;
			if (!Number.isFinite(s) || s < 0) throw Error(`${r.description} unit cost cannot be negative.`);
			if (s > r.unitCost + 1e-8) throw Error(`${r.description} credit unit cost cannot exceed the source bill unit cost.`);
			let c = H.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.supplierBillLineId === r.id), l = Math.abs(s - r.unitCost) < 1e-8, u = c.every((e) => Math.abs(e.unitCost - r.unitCost) < 1e-8), d = l && u && Math.abs(o + c.reduce((e, t) => e + t.quantity, 0) - r.quantity) < 1e-8, f = c.reduce((e, t) => e + t.lineSubtotal, 0), p = c.reduce((e, t) => e + t.taxAmount, 0), m = ws(d ? r.lineSubtotal - f : l ? r.lineSubtotal * o / r.quantity : o * s), h = ws(d ? r.taxAmount - p : r.unitCost ? r.taxAmount * o / r.quantity * s / r.unitCost : 0);
			if (m < 0 || h < 0 || ws(m + f) > r.lineSubtotal || ws(h + p) > r.taxAmount) throw Error("Credit line value exceeds the uncredited source bill line.");
			let ee = ws(m + h);
			return {
				id: Ss(`supplier-credit-line-${n + 1}`),
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
				lineTotal: ee
			};
		}), s = ws(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = ws(o.reduce((e, t) => e + t.taxAmount, 0)), l = ws(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (ws(ws(H.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > ws(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: Ss("supplier-credit"),
			creditNumber: xs(e.creditDate),
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
		return H = [d, ...H], vs(), no.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = H.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = fs.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!Cs(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = ws(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: Ss("supplier-credit-allocation"),
			allocationNumber: bs(e.allocationDate),
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
		fs.applyCredit(n.id, r);
		let o = ws(t.amountApplied + r), s = ws(Math.max(0, t.totals.total - (t.amountRefunded ?? 0) - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return U = [a, ...U], H = H.map((e) => e.id === t.id ? c : e), vs(), a;
	},
	reverseAllocation(e) {
		let t = U.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = H.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = fs.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		fs.reverseCredit(i.id, t.amount);
		let o = ws(Math.max(0, r.amountApplied - t.amount)), s = ws(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - o)), c = {
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
		return H = H.map((e) => e.id === r.id ? c : e), U = U.map((e) => e.id === t.id ? l : e), vs(), l;
	},
	voidCredit(e) {
		let t = H.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		if (t.physicalReturnId && !ys) throw Error("Reverse the linked physical supplier return instead of voiding its credit separately.");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse supplier refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (U.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: ys && e.voidDate ? e.voidDate : r,
			voidReason: n,
			updatedAt: r
		};
		return H = H.map((e) => e.id === t.id ? i : e), vs(), no.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!U.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return U = U.map((t) => t.id === e.id ? e : t), vs(), e;
	},
	update(e) {
		if (!H.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return H = H.map((t) => t.id === e.id ? e : t), vs(), e;
	}
};
function bs(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = U.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function xs(e) {
	return b("SC", H.map((e) => e.creditNumber), e.slice(0, 4));
}
function Ss(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function Cs(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function ws(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ts(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var Es = W.create;
W.create = function(...e) {
	return N(), T.transaction(() => Es.apply(W, e));
};
var Ds = W.applyToBill;
W.applyToBill = function(...e) {
	return N(), T.transaction(() => Ds.apply(W, e));
};
var Os = W.reverseAllocation;
W.reverseAllocation = function(...e) {
	return N(), T.transaction(() => Os.apply(W, e));
};
var ks = W.voidCredit;
W.voidCredit = function(...e) {
	return N(), T.transaction(() => ks.apply(W, e));
};
var As = W.update;
W.update = function(...e) {
	return N(), T.transaction(() => As.apply(W, e));
};
var js = W.updateAllocation;
W.updateAllocation = function(...e) {
	return N(), T.transaction(() => js.apply(W, e));
}, g("supplierCredits", {
	repository: W,
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
		supplierCredits: H,
		allocations: U
	}),
	restore: (e) => {
		H = e.supplierCredits, U = e.allocations, gs = [...H], _s = [...U];
	},
	publish: () => hs.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/profitAndLossService.ts
function Ms(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ns(e, t) {
	y(e, t);
}
function Ps(e, t, n, r) {
	if (Ns(n, "From date"), Ns(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = t.filter((e) => e.journalDate >= n && e.journalDate <= r), a = Fs(e.filter((e) => e.type === "REVENUE"), i, "REVENUE"), o = Fs(e.filter((e) => e.type === "EXPENSE"), i, "EXPENSE"), s = Ms(a.reduce((e, t) => e + t.amount, 0)), c = Ms(o.reduce((e, t) => e + t.amount, 0)), l = e.find((e) => e.systemRole === "SALES_REVENUE");
	if (!l) throw Error("Sales Revenue system account was not found.");
	if (l.type !== "REVENUE") throw Error("Sales Revenue system account must be a revenue account.");
	let u = e.find((e) => e.systemRole === "COST_OF_GOODS_SOLD");
	if (!u) throw Error("Cost of Goods Sold system account was not found.");
	if (u.type !== "EXPENSE") throw Error("Cost of Goods Sold system account must be an expense account.");
	let d = Ms(a.find((e) => e.accountId === l.id)?.amount ?? 0), f = Ms(o.find((e) => e.accountId === u.id)?.amount ?? 0), p = Ms(d - f);
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
		operatingExpenses: Ms(c - f),
		totalExpenses: c,
		netProfit: Ms(s - c)
	};
}
function Fs(e, t, n) {
	return e.map((e) => {
		let r = 0, i = 0;
		for (let n of t) for (let t of n.lines) t.accountId === e.id && (r = Ms(r + t.debit), i = Ms(i + t.credit));
		let a = Ms(n === "REVENUE" ? i - r : r - i);
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
function Is(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ls(e) {
	y(e);
}
function Rs(e, t) {
	let n = 0, r = 0;
	for (let i of t) for (let t of i.lines) t.accountId === e.id && (n = Is(n + t.debit), r = Is(r + t.credit));
	return e.type === "ASSET" || e.type === "EXPENSE" ? Is(n - r) : Is(r - n);
}
function zs(e, t, n) {
	return e.filter((e) => e.type === n).map((e) => ({
		accountId: e.id,
		accountCode: e.code,
		accountName: e.name,
		amount: Rs(e, t)
	})).filter((e) => e.amount !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 }));
}
function Bs(e) {
	return Is(e.reduce((e, t) => e + t.amount, 0));
}
function Vs(e, t, n) {
	Ls(n);
	let r = t.filter((e) => e.journalDate <= n), i = zs(e, r, "ASSET"), a = zs(e, r, "LIABILITY"), o = zs(e, r, "EQUITY"), s = e.filter((e) => e.type === "REVENUE"), c = e.filter((e) => e.type === "EXPENSE"), l = Is(s.reduce((e, t) => e + Rs(t, r), 0)), u = Is(c.reduce((e, t) => e + Rs(t, r), 0)), d = Bs(i), f = Bs(a), p = Bs(o), m = Is(l - u), h = Is(p + m), ee = Is(f + h), te = Is(d - ee);
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
		totalLiabilitiesAndEquity: ee,
		difference: te,
		balanced: te === 0
	};
}
//#endregion
//#region src/features/accounting/data/trialBalanceService.ts
function Hs(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Us(e, t) {
	y(e, t);
}
function Ws(e, t) {
	let n = Hs(e - t);
	return n >= 0 ? {
		debit: n,
		credit: 0
	} : {
		debit: 0,
		credit: Hs(Math.abs(n))
	};
}
function Gs(e, t, n, r) {
	if (Us(n, "From date"), Us(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = e.map((e) => {
		let i = 0, a = 0, o = 0, s = 0;
		for (let c of t) for (let t of c.lines) if (t.accountId === e.id) {
			if (c.journalDate < n) {
				i = Hs(i + t.debit), a = Hs(a + t.credit);
				continue;
			}
			c.journalDate <= r && (o = Hs(o + t.debit), s = Hs(s + t.credit));
		}
		let c = Ws(i, a), l = Ws(Hs(i + o), Hs(a + s));
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
	}).filter((e) => e.openingDebit !== 0 || e.openingCredit !== 0 || e.periodDebit !== 0 || e.periodCredit !== 0 || e.closingDebit !== 0 || e.closingCredit !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 })), a = Hs(i.reduce((e, t) => e + t.openingDebit, 0)), o = Hs(i.reduce((e, t) => e + t.openingCredit, 0)), s = Hs(i.reduce((e, t) => e + t.periodDebit, 0)), c = Hs(i.reduce((e, t) => e + t.periodCredit, 0)), l = Hs(i.reduce((e, t) => e + t.closingDebit, 0)), u = Hs(i.reduce((e, t) => e + t.closingCredit, 0)), d = Hs(l - u);
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
function Ks(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function qs(e, t) {
	y(e, t);
}
function Js(e, t, n) {
	qs(e.openingBalanceDate, "Opening balance date"), qs(n, "As-at date");
	let r = t.filter((t) => t.journalDate >= e.openingBalanceDate && t.journalDate <= n).flatMap((t) => t.lines.filter((t) => t.accountId === e.glAccountId).map((e) => ({
		entry: t,
		line: e
	}))).sort((e, t) => {
		let n = e.entry.journalDate.localeCompare(t.entry.journalDate);
		if (n !== 0) return n;
		let r = e.entry.createdAt.localeCompare(t.entry.createdAt);
		return r === 0 ? e.line.id.localeCompare(t.line.id) : r;
	}), i = Ks(e.openingBalance), a = 0, o = 0, s = r.map(({ entry: t, line: n }) => {
		let r = Ks(n.debit), s = Ks(n.credit);
		return a = Ks(a + r), o = Ks(o + s), i = Ks(i + r - s), {
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
		openingBalance: Ks(e.openingBalance),
		moneyIn: a,
		moneyOut: o,
		closingBalance: i,
		transactionCount: s.length,
		transactions: s
	};
}
//#endregion
//#region src/features/cash-reports/cashReportService.ts
var Ys = [
	"Customer receipts & reversals",
	"Customer refunds & reversals",
	"Supplier payments & reversals",
	"Supplier refunds & reversals",
	"Bank opening adjustments",
	"Transfers across selection",
	"Other bank movements / review"
], Xs = (e) => Math.round(e * 100), Zs = (e) => e / 100;
function Qs(e) {
	switch (e.sourceType) {
		case "CUSTOMER_PAYMENT":
		case "CUSTOMER_PAYMENT_REVERSAL": return Ys[0];
		case "CUSTOMER_REFUND": return Ys[1];
		case "SUPPLIER_PAYMENT":
		case "SUPPLIER_PAYMENT_REVERSAL": return Ys[2];
		case "SUPPLIER_REFUND": return Ys[3];
		case "OPENING_BALANCE": return Ys[4];
		case "BANK_TRANSFER": return Ys[5];
		default: return Ys[6];
	}
}
function $s(e) {
	if (y(e.from, "From date"), y(e.to, "To date"), e.from > e.to) throw Error("From date must not exceed To date.");
	if (!e.currency.trim()) throw Error("Select a currency.");
	let t = new Map(e.bankAccounts.map((e) => [e.id, e]));
	if (t.size !== e.bankAccounts.length) throw Error("Duplicate bank account IDs require review.");
	if (e.bankIds && (new Set(e.bankIds).size !== e.bankIds.length || e.bankIds.some((e) => !t.has(e)))) throw Error("Invalid bank account selection.");
	let n = e.bankAccounts.filter((t) => (!e.bankIds || e.bankIds.includes(t.id)) && t.currency === e.currency);
	if (e.bankIds?.some((n) => t.get(n).currency !== e.currency)) throw Error("Selected banks must use the report currency.");
	for (let t of n) {
		if (e.bankAccounts.filter((e) => e.glAccountId === t.glAccountId).length !== 1) throw Error("Duplicate bank GL mappings require review before reporting.");
		y(t.openingBalanceDate, "Bank opening date");
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
		let n = Js(t, e.journalEntries, e.to), o = t.openingBalanceDate < e.from ? Xs(t.openingBalance) : 0, s = 0, c = 0;
		if (t.openingBalanceDate >= e.from && t.openingBalance !== 0) {
			let e = Xs(t.openingBalance);
			a.push({
				id: `setup:${t.id}`,
				bankId: t.id,
				bankName: t.name,
				date: t.openingBalanceDate,
				description: "Bank setup opening balance (not a cash receipt)",
				sourceType: "BANK_SETUP",
				category: Ys[4],
				moneyIn: Zs(Math.max(e, 0)),
				moneyOut: Zs(Math.max(-e, 0))
			}), s += Math.max(e, 0), c += Math.max(-e, 0);
		}
		for (let i of n.transactions) {
			if (i.transactionDate < e.from) {
				o += Xs(i.moneyIn) - Xs(i.moneyOut);
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
				category: Qs(n),
				moneyIn: i.moneyIn,
				moneyOut: i.moneyOut
			}), s += Xs(i.moneyIn), c += Xs(i.moneyOut);
		}
		let l = Xs(n.closingBalance);
		return {
			bankId: t.id,
			name: t.name,
			active: t.active,
			opening: Zs(o),
			moneyIn: Zs(s),
			moneyOut: Zs(c),
			closing: Zs(l),
			difference: Zs(o + s - c - l)
		};
	}), s = new Map(Ys.map((e) => [e, {
		category: e,
		moneyIn: 0,
		moneyOut: 0,
		net: 0
	}])), c = /* @__PURE__ */ new Map();
	for (let e of a) {
		if (e.category === Ys[5]) {
			let t = e.journalId;
			c.set(t, (c.get(t) ?? 0) + Xs(e.moneyIn) - Xs(e.moneyOut));
			continue;
		}
		let t = s.get(e.category);
		t.moneyIn += Xs(e.moneyIn), t.moneyOut += Xs(e.moneyOut);
	}
	for (let e of c.values()) {
		let t = s.get(Ys[5]);
		t.moneyIn += Math.max(e, 0), t.moneyOut += Math.max(-e, 0);
	}
	let l = [...s.values()].map((e) => ({
		category: e.category,
		moneyIn: Zs(e.moneyIn),
		moneyOut: Zs(e.moneyOut),
		net: Zs(e.moneyIn - e.moneyOut)
	})), u = (e) => Zs(o.reduce((t, n) => t + Xs(n[e]), 0)), d = u("opening"), f = u("closing"), p = Zs(l.reduce((e, t) => e + Xs(t.net), 0)), m = a.filter((e) => e.category === Ys[6]).length;
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
		difference: Zs(Xs(d) + Xs(p) - Xs(f))
	};
}
//#endregion
//#region src/features/net-analysis/netAnalysisService.ts
var ec = (e) => Math.round(e * 100);
function tc(e) {
	for (let t of [
		e.subtotal,
		e.tax,
		e.total
	]) if (!Number.isFinite(t) || t < 0 || Math.abs(t * 100 - ec(t)) > 1e-6) throw Error(`${e.number}: invalid saved monetary totals.`);
	if (ec(e.subtotal) + ec(e.tax) !== ec(e.total)) throw Error(`${e.number}: saved net, tax and gross do not reconcile.`);
}
function nc(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) {
		if (r.status === "DRAFT" || r.openingBalanceImportId) continue;
		let e = `${r.kind}:${r.id}`;
		if (t.has(e)) throw Error(`Duplicate analysis source: ${r.number}.`);
		t.add(e), y(r.date, `Document date (${r.number})`), tc(r);
		let i = r.kind === "CUSTOMER_CREDIT" || r.kind === "SUPPLIER_CREDIT", a = i ? -1 : 1, { voidedAt: o, openingBalanceImportId: s, ...c } = r, l = (t, n, i) => ({
			...c,
			date: t,
			eventId: `${e}:${i}`,
			event: i,
			subtotal: ec(r.subtotal) * n / 100,
			tax: ec(r.tax) * n / 100,
			total: ec(r.total) * n / 100
		});
		if (n.push(l(r.date, a, i ? "CREDIT" : "DOCUMENT")), r.status === "VOID") {
			if (!r.voidedAt) throw Error(`${r.number}: void date is missing. Review the source record before reporting.`);
			let e = _(r.voidedAt);
			if (y(e, `Void date (${r.number})`), e < r.date) throw Error(`${r.number}: void date precedes the original document.`);
			n.push(l(e, -a, "VOID"));
		}
	}
	return n.sort((e, t) => e.date.localeCompare(t.date) || e.number.localeCompare(t.number) || e.eventId.localeCompare(t.eventId));
}
function rc(e, t) {
	if (y(t.from, "From date"), y(t.to, "To date"), t.from > t.to) throw Error("From date must not exceed To date.");
	let n = t.query?.trim().toLowerCase() ?? "", r = nc(e).filter((e) => e.date >= t.from && e.date <= t.to && (!t.partyId || e.partyId === t.partyId) && (!t.event || t.event === "ALL" || e.event === t.event) && `${e.number} ${e.partyName} ${e.partyId} ${e.kind}`.toLowerCase().includes(n)), i = (e, t) => e.reduce((e, n) => e + ec(n[t]), 0) / 100, a = {
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
function ic(e, t, n) {
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
function ac(e, t) {
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
var oc = [
	"Profit & loss",
	"Balance sheet",
	"Trial balance",
	"Cash flow",
	"Net sales",
	"Net purchases"
];
function sc(e) {
	let t = e.split(",").map((e) => e.trim());
	if (!t.length || t.length > oc.length || t.some((e) => !e)) throw Error("Select one to six supported reports.");
	let n = t.map((e) => oc.find((t) => t.toLowerCase() === e.toLowerCase()));
	if (n.some((e) => !e)) throw Error(`Supported reports: ${oc.join(", ")}.`);
	if (new Set(n).size !== n.length) throw Error("Each report may appear only once in a pack.");
	return n;
}
var cc = (e) => JSON.stringify(e);
function lc(e, t, n) {
	if (y(e.periodStart, "From date"), y(e.periodEnd, "To date"), e.periodStart > e.periodEnd) throw Error("From date must not exceed To date.");
	let r = sc(e.reports), i = e.periodStart, a = e.periodEnd, o = r.map((e) => {
		if (e === "Profit & loss") {
			let n = Ps(t.accounts, t.journals, i, a);
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
			let n = Vs(t.accounts, t.journals, a);
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
			let n = Gs(t.accounts, t.journals, i, a);
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
			let n = $s({
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
		let n = e === "Net purchases", r = rc(n ? ac(t.bills, t.supplierCredits) : ic(t.documents, t.customerCredits, t.customers), {
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
		sourceSignature: cc(t),
		sections: o
	});
}
//#endregion
//#region src/features/report-packs/reportPackCommand.ts
function uc() {
	let e = m();
	return {
		accounts: D.getAll(),
		journals: O.getAll(),
		banks: tr.getAll(),
		documents: R.getAll(),
		customerCredits: P.getAll(),
		customers: mn.getAll().map((e) => ({
			id: e.id,
			businessName: e.businessName
		})),
		bills: fs.getAll(),
		supplierCredits: W.getAll(),
		company: {
			name: e.companyName,
			currency: e.currency,
			timezone: e.timezone
		}
	};
}
function dc(t) {
	let n = S.require("accounting.read"), r = l({
		id: e().trim().min(1).max(200),
		expectedRevision: e().regex(/^\d+$/)
	}).strict().parse(t), i = v["report-packs"]?.find((e) => e.id === r.id);
	if (!i) throw Error("Report pack configuration was not found.");
	if (i.revision !== r.expectedRevision) throw Error("Report pack changed. Reload before generating.");
	if (i.status !== "Active") throw Error("Activate this report pack before generating.");
	return lc({
		id: i.id,
		revision: i.revision,
		name: i.name,
		cover: i.cover,
		introduction: i.introduction,
		periodStart: i.periodStart,
		periodEnd: i.periodEnd,
		reports: i.reports
	}, uc(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: n.userId
	});
}
//#endregion
//#region src/features/page-previews/catalog.ts
var G = (e, t, n = "text", r, i) => ({
	key: e,
	label: t,
	type: n,
	options: r,
	value: i,
	required: !0
}), K = (e, t, n) => G(e, t, "select", n), fc = (e, t, n = "0") => ({
	...G(e, t, "number", void 0, n),
	min: 0,
	step: "0.01"
}), pc = (e, t) => G(e, t, "date", void 0, "2026-10-16"), mc = (e, t) => ({
	...K(e, t, [
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
}), hc = [];
function gc(e, t, n, r, i, a, o, s, c) {
	hc.push({
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
gc("products", "Products & services", "Inventory & pricing", "/inventory/products", "inventory.read", "Maintain purchasing, selling, stock and packaging information.", [
	G("sku", "SKU"),
	K("kind", "Product type", [
		"Stock item",
		"Service",
		"Non-stock item"
	]),
	K("unit", "Selling unit", [
		"Pack",
		"m²",
		"Bucket",
		"Each"
	]),
	fc("price", "Standard selling price", "49.50"),
	fc("cost", "Buying cost (sample)", "25"),
	fc("coverage", "m² per pack", "2.2"),
	K("rounding", "Pack rounding", ["Whole packs up", "Allow fractional packs"]),
	fc("reorder", "Reorder point", "10"),
	fc("target", "Target stock", "50"),
	K("buy", "Available for purchasing", ["Yes", "No"]),
	K("sell", "Available for selling", ["Yes", "No"]),
	K("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	G("brand", "Brand"),
	G("category", "Category"),
	G("image", "Image URL (preview only)")
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
]), gc("promotions", "Scheduled promotions", "Inventory & pricing", "/inventory/promotions", "inventory.read", "Plan customer and product specials with explicit start and end times.", [
	G("product", "Product / SKU"),
	G("customer", "Customer scope"),
	G("starts", "Starts (local time)", "datetime-local", void 0, "2026-10-16T09:00"),
	G("ends", "Ends (local time)", "datetime-local", void 0, "2026-10-31T17:00"),
	fc("price", "Promotional unit price", "45"),
	K("priority", "Priority when rules overlap", [
		"Customer price first",
		"Promotion first",
		"Lowest eligible price"
	]),
	G("timezone", "Time zone", "text", void 0, "Pacific/Auckland")
], {
	name: "October flooring special",
	product: "SAMPLE-OAK",
	customer: "All trade customers"
}, [
	"Overview",
	"Price comparison",
	"History"
]), gc("tax-codes", "Tax codes", "Accounting", "/accounting/tax-codes", "accounting.read", "Review GST codes, inclusive/exclusive calculation and reporting mappings.", [
	G("code", "Tax code"),
	fc("rate", "Tax rate (%)", "15"),
	K("basis", "Entry basis", ["Exclusive", "Inclusive"]),
	mc("collected", "GST collected account"),
	mc("paid", "GST paid account"),
	G("report", "Return / report mapping")
], {
	name: "Standard GST",
	code: "GST15",
	report: "Output / input GST"
}, [
	"Overview",
	"Calculation preview",
	"Reporting"
]), gc("linked-accounts", "Linked accounts", "Accounting", "/accounting/linked-accounts", "accounting.read", "Preview default general ledger mappings used by each business process.", [
	K("process", "Business process", [
		"Sales",
		"Purchases",
		"Payroll"
	]),
	mc("receivable", "Receivables / payables control"),
	mc("income", "Income / expense account"),
	mc("inventory", "Inventory account"),
	mc("cogs", "Cost of goods sold"),
	mc("gst", "GST control account"),
	mc("payroll", "Payroll clearing account")
], {
	name: "Sales posting defaults",
	process: "Sales"
}, ["Overview", "Posting example"]), gc("jobs", "Jobs & projects", "Accounting", "/accounting/jobs", "accounting.read", "Track project budgets, allocate posted revenue and costs, and compare actual profitability.", [
	G("code", "Job code"),
	G("customer", "Customer"),
	G("owner", "Project owner"),
	pc("starts", "Start date"),
	pc("ends", "End date"),
	fc("budget", "Revenue budget", "10000"),
	fc("costBudget", "Cost budget", "6000")
], {
	name: "Sample showroom installation",
	code: "JOB-SAMPLE",
	customer: "Sample Flooring Ltd",
	owner: "Sample team"
}, [
	"Overview",
	"Transactions",
	"Profitability"
]), gc("bank-accounts", "Bank account setup", "Banking", "/banking/setup/accounts", "banking.read", "Preview bank account details, ledger links and feed preferences.", [
	G("number", "Account number (sample only)"),
	G("bank", "Bank name"),
	K("currency", "Currency", ["NZD", "AUD"]),
	mc("ledger", "Linked bank GL account"),
	K("feed", "Feed provider", ["Manual import", "Provider to be configured"]),
	pc("feedStart", "Feed start date")
], {
	name: "Sample operating account",
	number: "00-0000-0000000-00",
	bank: "Sample Bank"
}, [
	"Overview",
	"Feed settings",
	"Import history"
]), gc("bank-rules", "Bank rules", "Banking", "/banking/rules", "banking.read", "Define matching conditions and resulting categorisation before testing a sample.", [
	K("match", "Match mode", ["All conditions", "Any condition"]),
	K("field", "Transaction field", [
		"Description",
		"Payee",
		"Reference"
	]),
	K("operator", "Operator", [
		"Contains",
		"Equals",
		"Starts with"
	]),
	G("value", "Match text"),
	mc("account", "Categorise to account"),
	K("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	K("enabled", "Enabled", ["Yes", "No"])
], {
	name: "Sample office supplies",
	value: "OFFICE",
	field: "Description"
}, [
	"Overview",
	"Test rule",
	"History"
]), gc("payment-batches", "Electronic payment batches", "Banking", "/banking/payment-batches", "banking.read", "Select sample supplier or wage payments, review approval and bank export layout.", [
	K("kind", "Batch type", ["Supplier payments", "Wages"]),
	pc("payDate", "Payment date"),
	G("bank", "Paying account"),
	G("reference", "Bank reference"),
	K("format", "Export format", ["NZ bank CSV preview", "ABA layout preview"]),
	fc("total", "Batch total", "1100")
], {
	name: "Sample supplier batch",
	bank: "Sample operating account",
	reference: "OCT-SAMPLE"
}, [
	"Overview",
	"Payments",
	"Approval & export"
]), gc("pay-items", "Pay items", "Payroll", "/payroll/pay-items", "accounting.read", "Configure sample earnings, allowances, deductions, leave, tax and employer contributions.", [
	G("code", "Pay item code"),
	K("category", "Category", [
		"Earnings",
		"Allowance",
		"Deduction",
		"Leave",
		"Tax",
		"Employer contribution"
	]),
	K("method", "Calculation method", [
		"Hourly rate",
		"Fixed amount",
		"Percentage"
	]),
	fc("rate", "Rate / amount", "30"),
	K("taxable", "Tax treatment", [
		"Taxable",
		"Non-taxable",
		"Before tax deduction",
		"After tax deduction"
	]),
	mc("expense", "Expense account"),
	mc("liability", "Liability / clearing account")
], {
	name: "Ordinary hours",
	code: "ORD",
	category: "Earnings"
}, [
	"Overview",
	"Employee assignments",
	"Posting preview"
]), gc("filing", "Payroll filing", "Payroll", "/payroll/filing", "accounting.read", "Review a sample NZ Payday Filing submission and its response / correction workflow.", [
	G("payrun", "Pay run reference"),
	pc("payDate", "Pay date"),
	G("employer", "Employer IRD identifier (sample)"),
	K("type", "Submission type", ["Employment information", "Amendment"]),
	G("contact", "Payroll contact email", "email")
], {
	name: "October employment information",
	payrun: "SAMPLE-RUN-01",
	employer: "000-000-000",
	contact: "payroll@example.invalid"
}, [
	"Overview",
	"Employees & validation",
	"Submission & response"
]), gc("recurring", "Recurring transactions", "Automation & tasks", "/automation/recurring", "inventory.read", "Generate due invoice and expense drafts from saved local templates with ordered schedules and retry protection.", [
	K("kind", "Transaction type", [
		"Invoice",
		"Bill",
		"Bank transaction"
	]),
	G("contact", "Customer / supplier"),
	K("frequency", "Frequency", [
		"Weekly",
		"Fortnightly",
		"Monthly",
		"Quarterly"
	]),
	pc("next", "Next generation date"),
	pc("ends", "Schedule end date"),
	fc("total", "Template amount", "220"),
	K("mode", "Generation mode", ["Draft for review", "Require approval"])
], {
	name: "Monthly sample maintenance",
	contact: "Sample Flooring Ltd"
}, [
	"Overview",
	"Template lines",
	"Run history"
]), gc("tasks", "Tasks & action centre", "Automation & tasks", "/tasks", "sales.read", "Maintain local tasks, owners and due dates with audited completion and reopening.", [
	G("customer", "Customer / branch"),
	G("owner", "Assigned to"),
	pc("due", "Due date"),
	K("priority", "Priority", [
		"Normal",
		"High",
		"Low"
	]),
	G("notes", "Task instructions", "textarea")
], {
	name: "Follow up showroom quote",
	customer: "Sample Flooring / North branch",
	owner: "Sample sales",
	notes: "Confirm quantities and planned installation date."
}, [
	"Overview",
	"Notes & attachments",
	"Status history"
]), gc("visits", "Sales visits & activity", "Automation & tasks", "/sales/activity", "sales.read", "Plan local sales visits, record trusted check-in/out, outcomes and linked follow-up tasks.", [
	G("salesperson", "Salesperson"),
	G("customer", "Customer / branch"),
	G("checkin", "Check-in", "datetime-local", void 0, "2026-10-16T09:00"),
	G("checkout", "Check-out", "datetime-local", void 0, "2026-10-16T09:30"),
	G("outcome", "Visit outcome", "textarea"),
	G("location", "Recorded location")
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
]), gc("draft-review", "Customer & contact review", "Automation & tasks", "/contacts/review", "sales.read", "Review local customer, branch and contact drafts, compare duplicates and approve or link real records.", [
	K("kind", "Draft type", [
		"Customer",
		"Branch",
		"Contact"
	]),
	G("company", "Customer / company"),
	G("branch", "Branch"),
	G("email", "Email", "email"),
	G("phone", "Phone"),
	K("source", "Source", [
		"Sales draft",
		"Selected phone contact",
		"Business card OCR"
	]),
	K("decision", "Review decision", [
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
]), gc("templates", "PDF & email templates", "Documents & imports", "/documents/templates", "accounting.read", "Design sample invoice, quote, PO, statement and remittance layouts and email copy.", [
	K("kind", "Document type", [
		"Invoice",
		"Quotation",
		"Purchase order",
		"Customer statement",
		"Remittance"
	]),
	G("subject", "Email subject"),
	G("body", "Email body", "textarea"),
	G("footer", "PDF footer", "textarea"),
	K("logo", "Logo position", [
		"Left",
		"Centre",
		"Right"
	]),
	K("paper", "Paper size", ["A4", "Letter"])
], {
	name: "Standard invoice template",
	subject: "Your document {{number}}",
	body: "Hello {{contact}}, please review the attached {{type}}.",
	footer: "Thank you for your business."
}, [
	"Overview",
	"PDF preview",
	"Email preview"
]), gc("custom-reports", "Saved & favourite reports", "Reports", "/reports/saved", "accounting.read", "Save explicit filters and ordered columns, run local data and export complete results.", [
	K("dataset", "Dataset", [
		"Sales",
		"Purchases",
		"Payroll",
		"Banking",
		"General ledger"
	]),
	G("columns", "Columns (comma separated)"),
	G("filter", "Filter expression (preview)"),
	K("basis", "Basis", ["Accrual", "Cash"]),
	K("favourite", "Favourite", ["Yes", "No"])
], {
	name: "Monthly sales by customer",
	columns: "Customer, Date, Net, GST, Total",
	filter: "Date: current month"
}, ["Overview", "Report preview"]), gc("report-packs", "Report packs", "Reports", "/reports/packs", "accounting.read", "Generate combined financial reports from current local books, with ordered sections and printable exports.", [
	G("company", "Company"),
	G("period", "Reporting period"),
	G("reports", "Included reports (comma separated)"),
	G("cover", "Cover heading"),
	G("introduction", "Cover note", "textarea")
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
var _c = hc;
[...new Set(hc.map((e) => e.group))], K("gst", "GST registration", ["Registered", "Not registered"]), K("filing", "GST filing cycle", [
	"Two monthly",
	"Monthly",
	"Six monthly"
]), fc("quoteNext", "Next quote number", "1001"), fc("orderNext", "Next order number", "1001"), fc("invoiceNext", "Next invoice number", "1001"), fc("creditNext", "Next credit number", "1001"), K("terms", "Default terms", [
	"20th of following month",
	"Due on receipt",
	"30 days"
]), K("template", "Default template", ["Standard invoice", "Trade invoice"]), K("reminders", "Overdue reminders", ["Manual only", "7 and 14 days overdue"]), K("onlinePayment", "Online payment option", ["Disabled", "Configuration preview"]), fc("next", "Next PO number", "1001"), K("terms", "Default payment terms", [
	"20th of following month",
	"30 days",
	"Due on receipt"
]), mc("expense", "Default expense account"), K("receipt", "Bill matching", ["Require receipt match", "Allow expense bills"]), K("remittance", "Remittance preference", ["Preview before sending", "Manual"]), K("cycle", "Pay cycle", [
	"Weekly",
	"Fortnightly",
	"Monthly"
]), K("day", "Pay day", [
	"Wednesday",
	"Thursday",
	"Friday"
]), mc("wages", "Wages expense account"), mc("clearing", "Payroll clearing account"), K("bank", "Paying bank", ["Sample operating account"]), K("filing", "Filing region", ["New Zealand · Payday Filing", "Australia · STP preview"]), K("basis", "Default basis", ["Accrual", "Cash"]), K("currency", "Display currency", ["NZD", "AUD"]), K("precision", "Decimal places", ["2", "0"]), K("negative", "Negative number style", ["(1,234.56)", "-1,234.56"]), K("comparative", "Comparative period", [
	"Previous period",
	"Previous year",
	"None"
]);
//#endregion
//#region src/features/page-previews/previewModel.ts
function vc(e, t) {
	return Object.fromEntries(e.map((e) => [e.key, t?.[e.key] ?? e.value ?? e.options?.[0] ?? ""]));
}
Object.fromEntries(_c.map((e) => [e.id, [{
	...vc(e.fields),
	...e.example,
	id: "sample-1",
	name: e.example.name,
	status: "Draft"
}]]));
function yc(e) {
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
var bc = [
	"Sales",
	"Purchases",
	"Banking",
	"General ledger"
], q = (e, t, n = !1) => ({
	key: e,
	label: t,
	numeric: n
}), xc = [
	q("date", "Date"),
	q("number", "Document"),
	q("contact", "Contact"),
	q("partyId", "Contact ID"),
	q("activity", "Activity"),
	q("status", "Current status"),
	q("net", "Net", !0),
	q("tax", "Tax", !0),
	q("gross", "Gross", !0)
], Sc = {
	Sales: xc,
	Purchases: xc,
	Banking: [
		q("date", "Date"),
		q("bank", "Bank"),
		q("journal", "Journal"),
		q("description", "Description"),
		q("source", "Source"),
		q("category", "Activity"),
		q("moneyIn", "Money in", !0),
		q("moneyOut", "Money out", !0),
		q("net", "Net", !0)
	],
	"General ledger": [
		q("date", "Date"),
		q("journal", "Journal"),
		q("accountCode", "Account code"),
		q("account", "Account"),
		q("description", "Description"),
		q("source", "Source"),
		q("status", "Current status"),
		q("debit", "Debit", !0),
		q("credit", "Credit", !0)
	]
}, Cc = (e) => e === "Banking" ? "Cash" : "Accrual", wc = l({
	from: e(),
	to: e(),
	query: e().max(500).default(""),
	partyId: e().max(200).optional(),
	bankId: e().max(200).optional(),
	accountId: e().max(200).optional(),
	currency: e().min(1).max(10).optional()
}).strict();
function Tc(e) {
	let t = o(bc).parse(e.dataset);
	if (e.basis !== Cc(t)) throw Error(`${t} uses ${Cc(t)} basis. Cash-basis sales/purchase recognition is not available.`);
	if (e.favourite !== void 0 && !["Yes", "No"].includes(e.favourite)) throw Error("Favourite must be Yes or No.");
	let n;
	try {
		n = JSON.parse(e.filter ?? "");
	} catch {
		throw Error("Legacy filter text is not executable. Edit and save explicit report dates and filters.");
	}
	let r = wc.parse(n);
	if (y(r.from, "From date"), y(r.to, "To date"), r.from > r.to) throw Error("From date must not exceed To date.");
	if (t !== "Sales" && t !== "Purchases" && r.partyId) throw Error("Contact filters require Sales or Purchases.");
	if (t !== "Banking" && (r.bankId || r.currency)) throw Error("Bank and currency filters require Banking.");
	if (t !== "General ledger" && r.accountId) throw Error("Account filters require General ledger.");
	let i = e.columns.split(",").map((e) => e.trim()), a = t === "Sales" || t === "Purchases" ? {
		customer: "contact",
		supplier: "contact",
		gst: "tax",
		total: "gross"
	} : {}, s = i.map((e) => Sc[t].find((t) => t.label.toLowerCase() === e.toLowerCase() || t.key.toLowerCase() === (a[e.toLowerCase()] ?? e.toLowerCase())));
	if (!i.length || i.length > Sc[t].length || s.some((e) => !e) || new Set(s.map((e) => e?.key)).size !== s.length) throw Error(`Select distinct supported columns for ${t}: ${Sc[t].map((e) => e.label).join(", ")}.`);
	return {
		dataset: t,
		filters: r,
		columns: s
	};
}
var Ec = (e, t) => e.reduce((e, n) => {
	let r = Number(n.values[t]), i = e + Math.round(r * 100);
	if (!Number.isFinite(r) || !Number.isSafeInteger(i)) throw Error("Report monetary total exceeds supported cents precision.");
	return i;
}, 0) / 100;
function Dc(e, t, n) {
	let { dataset: r, filters: i, columns: a } = Tc(e), o = i.query.trim().toLowerCase(), s = [], c = [], l = [], u = t.company.currency;
	if (r === "Sales" || r === "Purchases") {
		let e = r === "Sales" ? ic(t.documents, t.customerCredits, t.customers) : ac(t.bills, t.supplierCredits);
		if (i.partyId && !e.some((e) => e.partyId === i.partyId) && !(r === "Sales" && t.customers.some((e) => e.id === i.partyId))) throw Error("Selected contact is not available in this dataset.");
		let n = {
			DOCUMENT: "Original document",
			CREDIT: "Credit note",
			VOID: "Void reversal"
		};
		s = nc(e).filter((e) => e.date >= i.from && e.date <= i.to && (!i.partyId || e.partyId === i.partyId)).map((e) => ({
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
		let e = $s({
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
		value: Ec(s, t)
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
		sourceSignature: cc(t),
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
function Oc(t) {
	let n = S.require("accounting.read"), r = l({
		id: e().trim().min(1).max(200),
		expectedRevision: e().regex(/^\d+$/)
	}).strict().parse(t), i = v["custom-reports"]?.find((e) => e.id === r.id);
	if (!i) throw Error("Saved report was not found.");
	if (i.revision !== r.expectedRevision) throw Error("Saved report changed. Reload before running.");
	if (i.status !== "Active") throw Error("Activate this saved report before running.");
	return Dc({
		id: i.id,
		revision: i.revision,
		name: i.name,
		dataset: i.dataset,
		columns: i.columns,
		basis: i.basis,
		filter: i.filter,
		favourite: i.favourite
	}, uc(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: n.userId
	});
}
//#endregion
//#region src/features/business-workspace/workspaceRepository.ts
var kc = de(e(), e().max(2e4)), Ac = [
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
], jc = () => (/* @__PURE__ */ new Date()).toISOString(), Mc = {
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
}, Nc = /* @__PURE__ */ new Set(), Pc = 0, Fc = () => {
	Pc++, Nc.forEach((e) => e());
}, Ic = Object.fromEntries(Object.keys(Mc).map((e) => [e, []]));
for (let e of Object.keys(Mc)) v[e] = [];
var Lc = () => ({
	collected: D.getAll().find((e) => e.systemRole === "GST_PAYABLE")?.id ?? "",
	paid: D.getAll().find((e) => e.systemRole === "GST_RECEIVABLE")?.id ?? ""
});
v["tax-codes"] = [{
	id: "tax-gst",
	name: "GST",
	status: "Active",
	revision: "1",
	createdAt: jc(),
	updatedAt: jc(),
	code: "GST",
	rate: "10",
	basis: "Exclusive",
	report: "GST",
	...Lc()
}, {
	id: "tax-zero",
	name: "Zero rated",
	status: "Active",
	revision: "1",
	createdAt: jc(),
	updatedAt: jc(),
	code: "ZERO",
	rate: "0",
	basis: "Exclusive",
	report: "Zero rated",
	...Lc()
}];
function Rc(e, t) {
	if (!e?.trim()) throw Error(`${t} is required.`);
}
function zc(e, t) {
	if (!e?.trim() || !Number.isFinite(Number(e)) || Number(e) < 0) throw Error(`${t} must be a non-negative number.`);
}
function Bc(e, t) {
	let n = D.getAll().find((t) => t.id === e);
	if (!n?.active || t && n.type !== t) throw Error("Select an active account of the correct type.");
	return n;
}
function Vc(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && (/* @__PURE__ */ new Date(e + "T00:00:00Z")).toISOString().slice(0, 10) === e;
}
function Hc(e, t, n, r = !0) {
	let i = Mc[e];
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
	Rc(t.name, "Name");
	for (let e of i.required) Rc(t[e], e);
	if (![
		"Active",
		"Inactive",
		"Open",
		"In progress",
		"Completed"
	].includes(t.status ?? "Active")) throw Error("Invalid business status.");
	if (e === "tax-codes") {
		if (zc(t.rate, "Tax rate"), t.basis && !["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid entry basis.");
		if (r) {
			let e = n.find((e) => e.id === t.id), r = x(), i = v.settings?.find((e) => e.section === "business" && e.status === "Active")?.gstCode ?? "GST";
			if (t.status === "Inactive" && t.code === i) throw Error("The default tax code must remain active. Change the business default first.");
			if (e && e.code !== t.code && (e.code === i || r.products.products.some((t) => (t.taxCode ?? "GST") === e.code) || (v["bank-rules"] ?? []).some((t) => t.taxCode === e.code))) throw Error("A referenced tax code cannot be renamed. Create a new code and update future-use references.");
		}
		if (Number(t.rate) > 100) throw Error("Tax rate cannot exceed 100%.");
		if (r) {
			let e = Bc(t.collected, "LIABILITY"), n = Bc(t.paid, "ASSET"), r = (x().bankAccounts?.bankAccounts ?? []).map((e) => e.glAccountId);
			if (e.systemRole && e.systemRole !== "GST_PAYABLE" || n.systemRole && n.systemRole !== "GST_RECEIVABLE" || r.includes(n.id)) throw Error("Tax mappings cannot use AR/AP, inventory, GRNI or bank control accounts.");
		}
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Tax code must be unique.");
		if (!/^[A-Z0-9_-]{1,24}$/.test(t.code)) throw Error("Use uppercase letters/numbers for a tax code.");
	}
	if (e === "linked-accounts" && r) {
		let e = D.requireBySystemRole(t.role), n = t.status === "Inactive" ? D.getAll().find((e) => e.systemRole === t.role)?.id : t.accountId, r = x().journals?.journalEntries ?? [];
		if (n !== e.id && r.some((t) => t.lines.some((t) => t.accountId === e.id || t.accountId === n))) throw Error("A used posting account cannot be remapped without a ledger migration.");
	}
	if (e === "linked-accounts") {
		if (!Ac.includes(t.role)) throw Error("Unknown account role.");
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
		if (r && Bc(t.accountId, e), n.some((e) => e.id !== t.id && e.role === t.role)) throw Error("A linked account role may only have one mapping.");
	}
	if (e === "promotions") {
		let e = A(t.productId);
		if (r && (!e || !or(e.id, t.unitId))) throw Error("Product/unit not found.");
		if (zc(t.price, "Price"), !Number.isInteger(Number(t.priority))) throw Error("Priority must be an integer.");
		if (![
			"Customer price first",
			"Promotion first",
			"Lowest eligible price"
		].includes(t.policy)) throw Error("Invalid price conflict policy.");
		if (!/([+-]\d\d:\d\d|Z)$/.test(t.starts) || !Number.isFinite(Date.parse(t.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(t.ends) || !Number.isFinite(Date.parse(t.ends)) || Date.parse(t.ends) <= Date.parse(t.starts)) throw Error("Promotion requires explicit time offsets and an end after start.");
	}
	if (r && t.customerId && !mn.getById(t.customerId)) throw Error("Customer was not found.");
	if (e === "jobs") {
		if (zc(t.budget, "Revenue budget"), zc(t.costBudget, "Cost budget"), r) for (let e of ["budget", "costBudget"]) {
			let n = Number(t[e]);
			if (!Number.isSafeInteger(Math.round(n * 100)) || Math.abs(Math.round(n * 100) / 100 - n) > 1e-7) throw Error("Project budgets require safe currency amounts with at most two decimals.");
		}
		if (!Vc(t.starts) || !Vc(t.ends) || t.ends < t.starts) throw Error("Invalid project dates.");
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Job code must be unique.");
	}
	if (e === "tasks") {
		if (r && t.id && (x().salesVisits?.visits ?? []).some((e) => e.followupTaskId === t.id && e.customerId !== t.customerId)) throw Error("A visit follow-up must retain the visit customer.");
		if (r && ![
			"Open",
			"In progress",
			"Completed"
		].includes(t.status ?? "Open")) throw Error("Task status must be Open, In progress or Completed.");
		if (!Vc(t.due) || ![
			"Low",
			"Normal",
			"High"
		].includes(t.priority)) throw Error("Invalid due date or priority.");
	}
	if (e === "bank-rules") {
		if (r && Bc(t.accountId), ![
			"Description",
			"Payee",
			"Reference"
		].includes(t.field) || ![
			"Contains",
			"Equals",
			"Starts with"
		].includes(t.operator)) throw Error("Invalid bank condition.");
		if (r && !v["tax-codes"].some((e) => e.status === "Active" && e.code === t.taxCode)) throw Error("Active tax code not found.");
	}
	if (e === "custom-reports" && r && Tc({
		dataset: t.dataset,
		columns: t.columns,
		basis: t.basis,
		filter: t.filter,
		favourite: t.favourite
	}), e === "report-packs" && r && sc(t.reports), e === "report-packs" && (!Vc(t.periodStart) || !Vc(t.periodEnd) || t.periodEnd < t.periodStart)) throw Error("Invalid report period.");
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
			]) Rc(t[e], e);
			if (t.status !== "Active") throw Error("Business settings must remain active.");
			if (!["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid price basis.");
			if (!/^\d+$/.test(t.terms) || Number(t.terms) > 365) throw Error("Payment terms must be 0–365 days.");
			if (!/^\d{2}-\d{2}$/.test(t.yearEnd) || !Vc("2001-" + t.yearEnd)) throw Error("Year end must be MM-DD.");
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
				if (!v["tax-codes"].some((e) => e.code === t.gstCode && e.status === "Active")) throw Error("Default tax code must be active.");
				let e = x().journals.journalEntries, r = n.find((e) => e.id === t.id), i = x().bankAccounts.bankAccounts, a = r?.currency ?? i[0]?.currency ?? "AUD";
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
function Uc(e, t, n) {
	Ic[e].push({
		id: crypto.randomUUID(),
		name: n,
		status: "Active",
		revision: "1",
		createdAt: jc(),
		updatedAt: jc(),
		recordId: t.id,
		actorId: S.current()?.userId ?? "local-test",
		after: JSON.stringify(t)
	});
}
var Wc = Object.fromEntries(Object.keys(Mc).map((e) => {
	let t = {
		run(t) {
			if (e !== "custom-reports") throw Error("Saved-report execution is not available on this register.");
			return Oc(t);
		},
		generate(t) {
			if (e !== "report-packs") throw Error("Report generation is only available for report packs.");
			return dc(t);
		},
		getAll: () => v[e],
		getById: (t) => v[e].find((e) => e.id === t),
		save(t, n) {
			let r = kc.parse(t), i = v[e].find((e) => e.id === r.id);
			if (i && i.revision !== n) throw Error("Record changed. Reload before saving.");
			if (!i && n !== void 0) throw Error("Record no longer exists.");
			let a = jc(), o = {
				...r,
				id: i?.id ?? crypto.randomUUID(),
				name: r.name.trim(),
				status: r.status ?? (e === "tasks" ? "Open" : "Active"),
				revision: String(Number(i?.revision ?? "0") + 1),
				createdAt: i?.createdAt ?? a,
				updatedAt: a
			};
			return e === "tasks" && (delete o.completedAt, delete o.completedBy, o.status === "Completed" && (o.completedAt = i?.status === "Completed" && i.completedAt || a, o.completedBy = i?.status === "Completed" ? i.completedBy || S.current()?.userId || "local-test" : S.current()?.userId ?? "local-test")), Hc(e, o, v[e]), v[e] = [...v[e].filter((e) => e.id !== o.id), o], Uc(e, o, i ? "Updated" : "Created"), Fc(), o;
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
			Uc(e, {
				...i,
				note: r.trim()
			}, "Note added"), Fc();
		}
	};
	return g("workspace_" + e.replaceAll("-", "_"), {
		validate: (t, n) => {
			Gc(e, t), Kc(e, t, n);
		},
		repository: t,
		read: Mc[e].read,
		commands: {
			run: e === "custom-reports" ? "accounting.read" : null,
			generate: e === "report-packs" ? "accounting.read" : null,
			save: Mc[e].write,
			setStatus: Mc[e].write,
			addNote: e === "tasks" ? "sales.write" : null
		},
		snapshot: () => ({
			records: v[e],
			history: Ic[e]
		}),
		restore: (t) => {
			Gc(e, t), v[e] = t.records, Ic[e] = t.history;
		},
		publish: Fc
	}), [e, t];
}));
function Gc(e, t) {
	let n = l({
		records: c(kc),
		history: c(kc)
	}).strict().parse(t), r = /* @__PURE__ */ new Set();
	for (let t of n.records) {
		if (!t.id || r.has(t.id) || !/^\d+$/.test(t.revision)) throw Error("Invalid workspace record identity.");
		r.add(t.id), Hc(e, t, n.records, !1);
	}
	return n;
}
function Kc(e, t, n) {
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
var J = e().trim().min(1).max(200), qc = e().trim().min(1).max(4e3), Jc = e().refine((e) => {
	try {
		return y(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), Yc = e().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}, "Invalid visit timestamp."), Xc = l({
	operationId: J,
	name: J,
	customerId: J,
	locationId: J.optional(),
	plannedDate: Jc,
	locationNote: e().trim().max(500).default("")
}).strict(), Zc = l({
	name: J,
	due: Jc,
	priority: o([
		"Low",
		"Normal",
		"High"
	]),
	notes: qc
}).strict(), Qc = l({
	id: J,
	expectedRevision: a().int().positive(),
	outcome: qc,
	followup: Zc.optional()
}).strict(), $c = l({
	id: J,
	action: J,
	actorId: J,
	at: Yc,
	note: e().optional()
}).strict(), el = l({
	id: J,
	operationId: J,
	creationFingerprint: e().min(1).max(3e3),
	name: J,
	customerId: J,
	customerName: J,
	locationId: J.optional(),
	locationName: e().max(200).optional(),
	locationNote: e().max(500),
	plannedDate: Jc,
	status: o([
		"Planned",
		"Checked in",
		"Completed",
		"Cancelled"
	]),
	revision: a().int().positive(),
	ownerId: J,
	createdAt: Yc,
	updatedAt: Yc,
	checkInAt: Yc.optional(),
	checkInBy: J.optional(),
	checkOutAt: Yc.optional(),
	checkOutBy: J.optional(),
	outcome: qc.optional(),
	completionFingerprint: e().optional(),
	followupTaskId: J.optional(),
	history: c($c).min(1)
}).strict(), tl = [], nl = 0, rl = /* @__PURE__ */ new Set(), il = () => {
	nl++, rl.forEach((e) => e());
}, al = () => S.require("sales.write").userId, ol = () => (/* @__PURE__ */ new Date()).toISOString(), sl = (e, t, n, r) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	...r ? { note: r } : {}
});
function cl(e) {
	let t = tl.find((t) => t.id === e);
	if (!t) throw Error("Visit not found.");
	return t;
}
function ll(e, t) {
	if (e.revision !== t) throw Error("Visit changed. Reload before continuing.");
}
function ul(e) {
	let t = ol();
	if (t < e.updatedAt) throw Error("System clock precedes the last visit update. Correct the clock before continuing.");
	return t;
}
function dl(e) {
	return tl = [...tl.filter((t) => t.id !== e.id), e], il(), e;
}
function fl(e, t) {
	let n = mn.getById(e);
	if (!n || n.status === "INACTIVE") throw Error("Choose an available customer.");
	if (t && !n.locations.some((e) => e.id === t)) throw Error("Choose a location belonging to the selected customer.");
	return n;
}
g("salesVisits", {
	repository: {
		subscribe(e) {
			return rl.add(e), () => {
				rl.delete(e);
			};
		},
		getSnapshot: () => tl,
		getAll: () => tl,
		create(e) {
			let t = al(), n = Xc.parse(e), r = JSON.stringify(n), i = tl.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.creationFingerprint !== r) throw Error("Operation ID was used for different visit data.");
				return i;
			}
			let a = fl(n.customerId, n.locationId), o = ol();
			return dl({
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
				history: [sl("Planned", t, o)]
			});
		},
		update(e) {
			let t = al(), n = Xc.omit({ operationId: !0 }).extend({
				id: J,
				expectedRevision: a().int().positive()
			}).strict().parse(e), r = cl(n.id);
			if (ll(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be edited.");
			let i = fl(n.customerId, n.locationId), o = ul(r), s = {
				...r,
				name: n.name,
				customerId: n.customerId,
				customerName: i.businessName,
				plannedDate: n.plannedDate,
				locationNote: n.locationNote,
				revision: r.revision + 1,
				updatedAt: o,
				history: [...r.history, sl("Plan updated", t, o, r.plannedDate + " → " + n.plannedDate)]
			};
			return delete s.locationId, delete s.locationName, n.locationId && (s.locationId = n.locationId, s.locationName = i.locations.find((e) => e.id === n.locationId).name), dl(s);
		},
		checkIn(e) {
			let t = al(), n = l({
				id: J,
				expectedRevision: a().int().positive()
			}).strict().parse(e), r = cl(n.id);
			if (r.status === "Checked in" && r.revision === n.expectedRevision + 1) return r;
			if (ll(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be checked in.");
			fl(r.customerId, r.locationId);
			let i = ul(r);
			return dl({
				...r,
				status: "Checked in",
				revision: r.revision + 1,
				checkInAt: i,
				checkInBy: t,
				updatedAt: i,
				history: [...r.history, sl("Checked in", t, i)]
			});
		},
		finish(e) {
			let t = al(), n = Qc.parse(e), r = cl(n.id), i = JSON.stringify({
				outcome: n.outcome,
				followup: n.followup
			});
			if (r.status === "Completed") {
				if (r.completionFingerprint === i) return r;
				throw Error("Visit is already completed with a different outcome.");
			}
			if (ll(r, n.expectedRevision), r.status !== "Checked in") throw Error("Check in before completing the visit.");
			let a = ul(r);
			if (a < r.checkInAt) throw Error("System clock precedes check-in. Correct the clock before completing.");
			let o;
			return n.followup && (o = Wc.tasks.save({
				...n.followup,
				customerId: r.customerId,
				owner: t,
				status: "Open"
			}).id), dl({
				...r,
				status: "Completed",
				revision: r.revision + 1,
				checkOutAt: a,
				checkOutBy: t,
				outcome: n.outcome,
				completionFingerprint: i,
				...o ? { followupTaskId: o } : {},
				updatedAt: a,
				history: [...r.history, sl("Completed", t, a, n.outcome)]
			});
		},
		cancel(e) {
			let t = al(), n = l({
				id: J,
				expectedRevision: a().int().positive(),
				reason: qc
			}).strict().parse(e), r = cl(n.id);
			if (ll(r, n.expectedRevision), !["Planned", "Checked in"].includes(r.status)) throw Error("Only an unfinished visit can be cancelled.");
			let i = ul(r);
			return dl({
				...r,
				status: "Cancelled",
				revision: r.revision + 1,
				updatedAt: i,
				history: [...r.history, sl("Cancelled", t, i, n.reason)]
			});
		},
		addNote(e) {
			let t = al(), n = l({
				id: J,
				expectedRevision: a().int().positive(),
				note: qc
			}).strict().parse(e), r = cl(n.id);
			ll(r, n.expectedRevision);
			let i = ul(r);
			return dl({
				...r,
				revision: r.revision + 1,
				updatedAt: i,
				history: [...r.history, sl("Note added", t, i, n.note)]
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
	snapshot: () => ({ visits: tl }),
	restore: (e) => {
		tl = e.visits;
	},
	publish: il,
	validate: (e, t) => {
		let n = l({ visits: c(el) }).strict().parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.visits) {
			if (i.has(e.operationId)) throw Error("Duplicate visit operation ID.");
			if (i.add(e.operationId), !r.customers.customers.find((t) => t.id === e.customerId) || e.locationId && !e.locationName) throw Error("Invalid visit customer/location reference.");
			if (e.history.length !== e.revision || new Set(e.history.map((e) => e.id)).size !== e.history.length || e.updatedAt < e.createdAt) throw Error("Invalid visit history.");
			if (Xc.parse(JSON.parse(e.creationFingerprint)).operationId !== e.operationId || e.history[0].action !== "Planned" || e.history[0].actorId !== e.ownerId || e.history[0].at !== e.createdAt) throw Error("Visit creation fingerprint is inconsistent.");
			if (!!e.checkInAt != !!e.checkInBy || !!e.checkOutAt != !!e.checkOutBy || e.checkInAt && e.checkInAt < e.createdAt || e.checkOutAt && (!e.checkInAt || e.checkOutAt < e.checkInAt)) throw Error("Invalid visit check-in/out history.");
			if (e.status === "Planned" && (e.checkInAt || e.checkOutAt) || e.status === "Checked in" && (!e.checkInAt || e.checkOutAt) || e.status === "Completed" && (!e.checkInAt || !e.checkOutAt || !e.outcome || !e.completionFingerprint) || e.status !== "Completed" && (e.checkOutAt || e.outcome || e.followupTaskId || e.completionFingerprint)) throw Error("Visit state is inconsistent.");
			if (e.status === "Completed") {
				let t = l({
					outcome: qc,
					followup: Zc.optional()
				}).strict().parse(JSON.parse(e.completionFingerprint));
				if (t.outcome !== e.outcome || !!t.followup != !!e.followupTaskId) throw Error("Visit completion fingerprint is inconsistent.");
			}
			if (e.followupTaskId && !r.workspace_tasks.records.some((t) => t.id === e.followupTaskId && t.customerId === e.customerId)) throw Error("Visit follow-up task is missing or belongs to another customer.");
		}
	}
});
//#endregion
//#region src/features/direct-documents/managedDocumentRepository.ts
var Y = e().trim().min(1).max(200), pl = e().trim().max(2e3).optional(), ml = l({
	requestedArea: a().finite().positive().max(1e9).optional(),
	productId: Y,
	unitId: Y,
	quantity: a().positive().finite(),
	unitPrice: a().nonnegative().finite().optional(),
	priceBasis: o(["Inclusive", "Exclusive"]).optional()
}).strict(), hl = l({
	description: e().trim().min(1).max(500),
	accountId: Y,
	quantity: a().positive().finite(),
	unitCost: a().nonnegative().finite(),
	taxCode: Y,
	priceBasis: o(["Inclusive", "Exclusive"]).optional()
}).strict(), gl = l({
	kind: o(["ORDER", "INVOICE"]),
	customerId: Y,
	locationId: Y.or(i("")).optional(),
	accountingContactId: Y.or(i("")).optional(),
	documentDate: Y,
	dueDate: Y.optional(),
	customerReference: pl,
	notes: pl,
	lines: c(ml).min(1).max(500)
}).strict(), _l = l({
	kind: i("EXPENSE"),
	supplierId: Y,
	supplierInvoiceNumber: Y,
	documentDate: Y,
	dueDate: Y,
	notes: pl,
	lines: c(hl).min(1).max(500)
}).strict(), vl = (e) => f([gl, _l]).parse(e), yl = a().finite().nonnegative().refine((e) => Number.isSafeInteger(Math.round(e * 100)) && e === Math.round(e * 100) / 100, "Use an amount in whole cents within the supported range."), bl = l({
	operationId: Y,
	sourceName: e().trim().max(200),
	reviewed: n(),
	declared: l({
		subtotal: yl,
		taxAmount: yl,
		total: yl
	}).strict(),
	payload: _l.extend({ notes: e().trim().max(1e3).optional() })
}).strict();
function xl(e) {
	return {
		...e.payload,
		notes: [
			e.payload.notes,
			`Reviewed source: ${e.sourceName || "Manual entry"}`,
			`Declared net / tax / total: ${e.declared.subtotal.toFixed(2)} / ${e.declared.taxAmount.toFixed(2)} / ${e.declared.total.toFixed(2)}`
		].filter(Boolean).join("\n")
	};
}
function Sl(e) {
	let t = ka.getById(e.payload.supplierId);
	if (!t || t.status !== "ACTIVE") throw Error("Select an active supplier.");
	let n = Pl(e.payload), r = e.payload.supplierInvoiceNumber.trim().toLowerCase(), i = fs.getAll(), a = new Set(i.filter((e) => e.status === "VOID").map((e) => e.id)), o = [...Tl.filter((t) => t.operationId !== e.operationId && t.status !== "CANCELLED" && !(t.status === "POSTED" && t.documentId && a.has(t.documentId)) && t.payload.kind === "EXPENSE" && t.payload.supplierId === e.payload.supplierId && t.payload.supplierInvoiceNumber.trim().toLowerCase() === r).map((e) => ({
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
var Cl = () => D.getAll().filter((e) => e.active && e.type === "EXPENSE" && e.allowManualPosting && (!e.systemRole || e.systemRole === "OPERATING_EXPENSE" || e.systemRole === "FREIGHT")).map((e) => ({
	id: e.id,
	code: e.code,
	name: e.name
}));
Cl();
var wl = [], Tl = [], El = 0, Dl = /* @__PURE__ */ new Set(), Ol = () => {
	El++, Dl.forEach((e) => e());
}, kl = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Al(e, t) {
	return {
		action: e,
		actorId: S.current()?.userId ?? "local-test",
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...t ? { reason: t } : {}
	};
}
function jl(e) {
	for (let t of e) if (t.taxAmount) for (let [e, n] of [[t.taxCollectedAccountId, "LIABILITY"], [t.taxPaidAccountId, "ASSET"]]) {
		if (!e) continue;
		let t = D.requireById(e);
		if (!t.active || t.type !== n) throw Error("A snapshotted tax posting account is no longer active or has the wrong type.");
	}
}
function Ml(e) {
	let t = D.requireById(e);
	if (!t.active || t.type !== "EXPENSE" || !t.allowManualPosting || t.systemRole && t.systemRole !== "OPERATING_EXPENSE" && t.systemRole !== "FREIGHT") throw Error("Use an active manual expense account, not an inventory, GRNI or control account.");
	return t;
}
function Nl(e) {
	let t = e.payload;
	if (t.kind === "EXPENSE") {
		let n = ka.getById(t.supplierId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active supplier.");
		for (let t of e.lines) Ml(t.expenseAccountId);
	} else {
		let n = mn.getById(t.customerId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active customer.");
		for (let t of e.lines) fr(t.productId, t.unitId, t.quantity, "sell");
	}
	jl(e.lines);
}
function Pl(e) {
	if (y(e.documentDate, "Document date"), e.dueDate && (y(e.dueDate, "Due date"), e.dueDate < e.documentDate)) throw Error("Due date cannot precede document date.");
	if (e.kind !== "ORDER" && !e.dueDate) throw Error("Due date is required.");
	let t = e.kind === "EXPENSE" ? e.lines.map((e) => {
		Ml(e.accountId);
		let t = te(e.taxCode), n = h(e.unitCost, t.taxRate, e.priceBasis), r = kl(e.quantity * n), i = (e.priceBasis ?? m().basis) === "Inclusive" ? kl(e.quantity * e.unitCost - r) : kl(r * t.taxRate);
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
			lineSubtotal: r,
			taxAmount: i,
			lineTotal: kl(r + i)
		};
	}) : e.lines.map((t) => Pi({
		customerId: e.customerId,
		documentDate: e.documentDate,
		draft: t
	})), n = Ni(t);
	if (n.total <= 0 || !Number.isFinite(n.total)) throw Error("Document total must be finite and greater than zero.");
	return {
		lines: t,
		totals: n
	};
}
function Fl(e) {
	let t = () => e === "sales" ? wl : Tl;
	function n(t) {
		return e === "sales" ? wl = [...wl.filter((e) => e.id !== t.id), t] : Tl = [...Tl.filter((e) => e.id !== t.id), t], Ol(), t;
	}
	let r = (e) => {
		let n = t().find((t) => t.id === e);
		if (!n) throw Error("Draft not found.");
		return n;
	};
	function i(e, t) {
		if (e.revision !== t) throw Error("Draft changed. Reload before editing or approving.");
	}
	function o(e, t, r = {}, i) {
		return n({
			...e,
			...r,
			revision: e.revision + 1,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			history: [...e.history, Al(t, i)]
		});
	}
	let s = (e, t) => Ll.save({
		operationId: e,
		payload: t
	});
	return {
		getAll: t,
		reviewCapture(t) {
			if (S.require("purchases.bill"), e !== "expense") throw Error("Capture is only available for expense bills.");
			return Sl(bl.parse(t));
		},
		capture(n) {
			if (S.require("purchases.bill"), e !== "expense") throw Error("Capture is only available for expense bills.");
			let r = bl.parse(n);
			if (!r.reviewed) throw Error("Confirm that the supplier document has been reviewed.");
			let i = xl(r);
			if (t().find((e) => e.operationId === r.operationId)) return s(r.operationId, i);
			let a = Sl(r);
			if (!a.matches) throw Error(a.issues.join(" "));
			return s(r.operationId, i);
		},
		save(o) {
			let s = l({
				operationId: Y,
				id: Y.optional(),
				expectedRevision: a().int().positive().optional(),
				payload: e === "sales" ? gl : _l
			}).strict().parse(o), c = JSON.stringify(s.payload);
			if (!s.id) {
				let e = t().find((e) => e.operationId === s.operationId);
				if (e) {
					if (e.creationFingerprint !== c) throw Error("Operation ID was used for different draft data.");
					return e;
				}
			}
			let u = s.id ? r(s.id) : void 0;
			if (u && (i(u, s.expectedRevision ?? -1), u.status !== "DRAFT")) throw Error("Only unapproved drafts can be edited. Reopen an approved draft before editing.");
			let d = Pl(s.payload), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
				id: u?.id ?? crypto.randomUUID(),
				operationId: u?.operationId ?? s.operationId,
				creationFingerprint: u?.creationFingerprint ?? c,
				revision: (u?.revision ?? 0) + 1,
				kind: s.payload.kind,
				status: "DRAFT",
				payload: s.payload.kind === "EXPENSE" ? s.payload : {
					...s.payload,
					lines: s.payload.lines.map((e, t) => ({
						...e,
						quantity: d.lines[t].quantity
					}))
				},
				recipient: s.payload.kind === "EXPENSE" ? void 0 : ur(s.payload.customerId, s.payload),
				...d,
				createdAt: u?.createdAt ?? f,
				updatedAt: f,
				history: [...u?.history ?? [], Al(u ? "Edited" : "Created")]
			};
			if (u && u.kind !== p.kind) throw Error("Document kind cannot change.");
			return Nl(p), n(p);
		},
		approve(e, t) {
			let n = r(e);
			if (n.status === "APPROVED" && n.revision === t + 1) return n;
			if (i(n, t), n.status !== "DRAFT") throw Error("Only a draft can be approved.");
			return Nl(n), o(n, "Approved", { status: "APPROVED" });
		},
		reopen(e, t, n) {
			let a = r(e);
			if (i(a, t), a.status !== "APPROVED" || n.trim().length < 3) throw Error("Only approved drafts can be reopened with a reason.");
			return o(a, "Reopened", { status: "DRAFT" }, n);
		},
		cancel(e, t, n) {
			let a = r(e);
			if (i(a, t), a.status === "POSTED" || a.status === "CANCELLED" || n.trim().length < 3) throw Error("Only unposted drafts can be cancelled with a reason.");
			return o(a, "Cancelled", { status: "CANCELLED" }, n);
		},
		post(e, t) {
			let n = r(e);
			if (n.status === "POSTED") return n;
			if (i(n, t), n.status !== "APPROVED") throw Error("Approve the draft before posting.");
			N(), qe(n.payload.documentDate), Nl(n);
			let a, s = n.payload;
			if (s.kind === "EXPENSE") {
				let e = ka.getById(s.supplierId), t = (/* @__PURE__ */ new Date()).toISOString(), r = {
					id: crypto.randomUUID(),
					managedDraftId: n.id,
					kind: "EXPENSE",
					billNumber: b("BILL", fs.getAll().map((e) => e.billNumber), s.documentDate.slice(0, 4)),
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
				fs.insertExpenseBill(r);
				let i = r.lines.filter((e) => e.lineSubtotal !== 0).map((e) => ({
					accountId: e.expenseAccountId,
					description: e.description,
					debit: e.lineSubtotal,
					credit: 0
				}));
				O.post({
					journalDate: r.billDate,
					description: "Expense bill " + r.billNumber,
					reference: r.supplierInvoiceNumber,
					sourceType: "SUPPLIER_BILL",
					sourceId: r.id,
					lines: [
						...i,
						...Wi(r.lines, "paid", !0, r.totals.taxAmount),
						{
							accountId: D.requireBySystemRole("ACCOUNTS_PAYABLE").id,
							debit: 0,
							credit: r.totals.total
						}
					]
				}), a = r.id;
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
				a = s.kind === "ORDER" ? R.createManagedOrder(e).id : R.createManagedInvoice({
					...e,
					dueDate: s.dueDate
				}).id;
			}
			return o(n, "Posted", {
				status: "POSTED",
				documentId: a
			});
		},
		cancelOrder(e, t) {
			let n = r(e);
			if (n.kind !== "ORDER" || n.status !== "POSTED") throw Error("A confirmed managed order is required.");
			return R.cancelManagedOrder(n.documentId, t), o(n, "Order cancelled", {}, t);
		}
	};
}
var Il = Fl("sales"), Ll = Fl("expense"), Rl = l({
	recipient: l({
		locationId: e().optional(),
		locationName: e().optional(),
		deliveryAddress: e().optional(),
		accountingContactId: e().optional(),
		accountingContactName: e().optional(),
		accountingEmail: e().email().optional()
	}).strict().optional(),
	id: Y,
	operationId: Y,
	creationFingerprint: e().max(1e6),
	revision: a().int().positive(),
	kind: o([
		"ORDER",
		"INVOICE",
		"EXPENSE"
	]),
	status: o([
		"DRAFT",
		"APPROVED",
		"POSTED",
		"CANCELLED"
	]),
	payload: f([gl, _l]),
	lines: c(l({
		id: Y,
		description: e().min(1),
		quantity: a().finite().positive(),
		unitSymbol: e().min(1),
		unitPrice: a().finite().nonnegative().optional(),
		unitCost: a().finite().nonnegative().optional(),
		taxRate: a().finite().min(0).max(1),
		taxCode: Y,
		taxPaidAccountId: Y.optional(),
		taxCollectedAccountId: Y.optional(),
		lineSubtotal: a().finite().nonnegative(),
		taxAmount: a().finite().nonnegative(),
		lineTotal: a().finite().nonnegative()
	}).passthrough()).min(1),
	totals: l({
		subtotal: a().finite(),
		taxAmount: a().finite(),
		total: a().finite()
	}),
	documentId: Y.optional(),
	createdAt: Y,
	updatedAt: Y,
	history: c(l({
		action: Y,
		actorId: Y,
		at: Y,
		reason: e().optional()
	}).strict()).min(1)
}).strict();
for (let e of ["sales", "expense"]) g(e === "sales" ? "managedSalesDocuments" : "expenseBillDrafts", {
	repository: e === "sales" ? Il : Ll,
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
	snapshot: () => e === "sales" ? { drafts: wl } : {
		drafts: Tl,
		options: Cl()
	},
	restore: (t) => {
		e === "sales" ? wl = t.drafts : (Tl = t.drafts, t.options);
	},
	publish: Ol,
	validate: (t, n) => {
		let { drafts: r } = l({
			drafts: c(Rl),
			...e === "expense" ? { options: c(l({
				id: Y,
				code: Y,
				name: Y
			}).strict()) } : {}
		}).strict().parse(t);
		for (let t of r) {
			if (dr(t.recipient), t.kind !== t.payload.kind || e === "expense" != (t.kind === "EXPENSE")) throw Error("Draft kind mismatch.");
			if (y(t.payload.documentDate), t.payload.dueDate && (y(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate)) throw Error("Draft due date is invalid.");
			let r = n, i = t.payload.kind === "EXPENSE" ? t.payload.supplierId : t.payload.customerId;
			if (!(t.payload.kind === "EXPENSE" ? r.suppliers.suppliers : r.customers.customers).some((e) => e.id === i) || t.lines.length !== t.payload.lines.length) throw Error("Draft party or line references are invalid.");
			for (let [e, n] of t.lines.entries()) {
				let i = t.payload.lines[e], a = n;
				if (t.kind !== "EXPENSE" && (lr(a), ir(a, r.products.products.find((e) => e.id === a.productId)), a.requestedArea !== i.requestedArea)) throw Error("Draft area requirement mismatch.");
				if (typeof a.quantity != "number" || !Number.isFinite(a.quantity) || a.quantity <= 0 || i.requestedArea === void 0 && a.quantity !== i.quantity || kl(a.lineSubtotal + a.taxAmount) !== a.lineTotal) throw Error("Draft line amounts are invalid.");
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
				if (kl(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Draft totals do not match lines.");
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
var zl = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
];
function Bl(e, t, n) {
	if (y(e), !Number.isSafeInteger(n) || n < 0 || !zl.includes(t)) throw Error("Invalid schedule occurrence.");
	let r = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	if (t === "Weekly" || t === "Fortnightly") r.setUTCDate(r.getUTCDate() + n * (t === "Weekly" ? 7 : 14));
	else {
		let e = r.getUTCDate();
		r.setUTCDate(1), r.setUTCMonth(r.getUTCMonth() + n * (t === "Monthly" ? 1 : 3));
		let i = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
		r.setUTCDate(Math.min(e, i));
	}
	let i = r.toISOString().slice(0, 10);
	return y(i), i;
}
function Vl(e, t) {
	y(e);
	let n = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	n.setUTCDate(n.getUTCDate() + t);
	let r = n.toISOString().slice(0, 10);
	return y(r), r;
}
//#endregion
//#region src/features/recurring/recurringRepository.ts
var Hl = e().trim().min(1).max(200), Ul = e().refine((e) => {
	try {
		return y(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), Wl = l({
	operationId: Hl,
	name: Hl,
	sourceDraftId: Hl,
	frequency: o(zl),
	firstDate: Ul,
	endDate: Ul
}).strict(), Gl = l({
	id: Hl,
	expectedRevision: a().int().positive(),
	name: Hl,
	endDate: Ul
}).strict(), Kl = e().refine((e) => Number.isFinite(Date.parse(e)), "Invalid timestamp."), ql = l({
	id: Hl,
	name: Hl,
	kind: o(["INVOICE", "EXPENSE"]),
	status: o([
		"Active",
		"Paused",
		"Ended"
	]),
	revision: a().int().positive(),
	operationId: Hl,
	creationFingerprint: e().min(1).max(2e3),
	sourceDraftId: Hl,
	payload: r(),
	frequency: o(zl),
	firstDate: Ul,
	nextDate: Ul,
	endDate: Ul,
	occurrence: a().int().nonnegative(),
	termsDays: a().int().nonnegative(),
	createdAt: Kl,
	updatedAt: Kl
}).strict(), Jl = l({
	id: Hl,
	scheduleId: Hl,
	date: Ul,
	draftId: Hl,
	actorId: Hl,
	createdAt: Kl
}).strict(), Yl = 0, Xl = /* @__PURE__ */ new Set(), Zl = () => {
	Yl++, Xl.forEach((e) => e());
}, Ql = {
	INVOICE: {
		schedules: [],
		runs: []
	},
	EXPENSE: {
		schedules: [],
		runs: []
	}
}, $l = (e) => e === "INVOICE" ? "sales.manage" : "purchases.bill", eu = (e) => e === "INVOICE" ? Il : Ll, tu = () => (/* @__PURE__ */ new Date()).toISOString();
function nu(e) {
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
function ru(e) {
	let t = () => Ql[e], n = (e) => {
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
			S.require($l(e));
			let r = Wl.parse(n), i = JSON.stringify(r), a = t().schedules.find((e) => e.operationId === r.operationId);
			if (a) {
				if (a.creationFingerprint !== i) throw Error("Operation ID was used for a different recurring template.");
				return a;
			}
			let o = eu(e).getAll().find((e) => e.id === r.sourceDraftId);
			if (!o || o.kind !== e || o.status === "CANCELLED") throw Error("Select an existing invoice or expense entry draft of the correct type.");
			if (r.endDate < r.firstDate) throw Error("End date must not precede first generation date.");
			let s = nu(o), c = Math.round((Date.parse(s.dueDate + "T00:00:00Z") - Date.parse(s.documentDate + "T00:00:00Z")) / 864e5), l = tu(), u = {
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
			return t().schedules = [...t().schedules, u], Zl(), u;
		},
		update(i) {
			S.require($l(e));
			let a = Gl.parse(i), o = n(a.id);
			if (r(o, a.expectedRevision), a.endDate < o.firstDate || o.occurrence && a.endDate < t().runs.filter((e) => e.scheduleId === o.id).map((e) => e.date).sort().at(-1)) throw Error("End date cannot precede the schedule start or its last generated occurrence.");
			let s = {
				...o,
				name: a.name,
				endDate: a.endDate,
				status: o.nextDate > a.endDate ? "Ended" : o.status === "Ended" ? "Paused" : o.status,
				revision: o.revision + 1,
				updatedAt: tu()
			};
			return t().schedules = t().schedules.map((e) => e.id === o.id ? s : e), Zl(), s;
		},
		setStatus(i) {
			S.require($l(e));
			let s = l({
				id: Hl,
				expectedRevision: a().int().positive(),
				status: o(["Active", "Paused"])
			}).strict().parse(i), c = n(s.id);
			if (r(c, s.expectedRevision), c.nextDate > c.endDate) throw Error("Extend the end date before resuming this ended schedule.");
			let u = {
				...c,
				status: s.status,
				revision: c.revision + 1,
				updatedAt: tu()
			};
			return t().schedules = t().schedules.map((e) => e.id === c.id ? u : e), Zl(), u;
		},
		generate(i) {
			S.require($l(e));
			let o = l({
				id: Hl,
				expectedRevision: a().int().positive(),
				date: Ul
			}).strict().parse(i), s = n(o.id), c = t().runs.find((e) => e.scheduleId === s.id && e.date === o.date);
			if (c) return {
				schedule: s,
				run: c,
				draft: eu(e).getAll().find((e) => e.id === c.draftId)
			};
			if (r(s, o.expectedRevision), s.status !== "Active") throw Error("Activate the schedule before generating.");
			if (o.date !== s.nextDate) throw Error("Generate the next occurrence in order.");
			if (o.date > _(tu())) throw Error("This occurrence is not due yet.");
			if (o.date > s.endDate) throw Error("The schedule has ended.");
			let u = Bl(s.firstDate, s.frequency, s.occurrence + 1), d = structuredClone(s.payload);
			d.documentDate = o.date, d.dueDate = Vl(o.date, s.termsDays), d.kind === "EXPENSE" && (d.supplierInvoiceNumber = d.supplierInvoiceNumber.slice(0, 170) + " [" + o.date + "]");
			let f = eu(e).save({
				operationId: "recurring:" + s.id + ":" + o.date,
				payload: d
			}), p = tu(), m = {
				id: crypto.randomUUID(),
				scheduleId: s.id,
				date: o.date,
				draftId: f.id,
				actorId: S.current().userId,
				createdAt: p
			}, h = {
				...s,
				nextDate: u,
				occurrence: s.occurrence + 1,
				status: u > s.endDate ? "Ended" : "Active",
				revision: s.revision + 1,
				updatedAt: p
			};
			return t().schedules = t().schedules.map((e) => e.id === s.id ? h : e), t().runs = [...t().runs, m], Zl(), {
				schedule: h,
				run: m,
				draft: f
			};
		}
	};
}
var iu = ru("INVOICE"), au = ru("EXPENSE");
for (let e of ["INVOICE", "EXPENSE"]) g(e === "INVOICE" ? "recurringInvoices" : "recurringExpenses", {
	repository: e === "INVOICE" ? iu : au,
	read: e === "INVOICE" ? "sales.read" : "purchases.read",
	commands: {
		create: $l(e),
		update: $l(e),
		setStatus: $l(e),
		generate: $l(e)
	},
	snapshot: () => structuredClone(Ql[e]),
	restore: (t) => {
		Ql[e] = t;
	},
	publish: Zl,
	validate: (t, n) => {
		l({
			schedules: c(ql),
			runs: c(Jl)
		}).strict().parse(t);
		let r = t, i = n;
		for (let t of r.schedules) {
			if (t.kind !== e || ![
				"Active",
				"Paused",
				"Ended"
			].includes(t.status) || !Number.isSafeInteger(t.revision) || t.revision < 1 || !Number.isSafeInteger(t.occurrence) || t.occurrence < 0 || !Number.isInteger(t.termsDays) || t.termsDays < 0 || t.payload.kind !== e) throw Error("Invalid recurring schedule.");
			if (Wl.parse({
				operationId: t.operationId,
				name: t.name,
				sourceDraftId: t.sourceDraftId,
				frequency: t.frequency,
				firstDate: t.firstDate,
				endDate: t.endDate
			}), vl(t.payload), !t.id || !t.creationFingerprint || !Number.isFinite(Date.parse(t.createdAt)) || !Number.isFinite(Date.parse(t.updatedAt))) throw Error("Invalid recurring identity or audit timestamps.");
			if (y(t.payload.documentDate), y(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate || t.termsDays !== Math.round((Date.parse(t.payload.dueDate + "T00:00:00Z") - Date.parse(t.payload.documentDate + "T00:00:00Z")) / 864e5)) throw Error("Invalid recurring payment terms.");
			if (t.payload.kind === "EXPENSE") {
				if (!i.suppliers.suppliers.some((e) => e.id === t.payload.supplierId) || t.payload.lines.some((e) => !i.accounts.accounts.some((t) => t.id === e.accountId && t.type === "EXPENSE"))) throw Error("Recurring expense references are invalid.");
			} else if (!i.customers.customers.some((e) => e.id === t.payload.customerId) || t.payload.lines.some((e) => !i.products.products.some((t) => t.id === e.productId && t.units.some((t) => t.id === e.unitId)))) throw Error("Recurring invoice references are invalid.");
			if (t.status === "Ended" != t.nextDate > t.endDate) throw Error("Recurring end status is inconsistent.");
			if (t.nextDate !== Bl(t.firstDate, t.frequency, t.occurrence) || t.endDate < t.firstDate) throw Error("Invalid recurring dates.");
			let n = (e === "INVOICE" ? i.managedSalesDocuments : i.expenseBillDrafts).drafts.find((e) => e.id === t.sourceDraftId);
			if (!n || n.kind !== e) throw Error("Recurring template source is missing.");
			let a = r.runs.filter((e) => e.scheduleId === t.id);
			if (a.length !== t.occurrence || new Set(a.map((e) => e.date)).size !== a.length) throw Error("Recurring run history does not match schedule.");
			for (let e = 0; e < a.length; e++) if (!a.some((n) => n.date === Bl(t.firstDate, t.frequency, e))) throw Error("Recurring occurrences are incomplete.");
		}
		for (let t of r.runs) {
			let n = r.schedules.find((e) => e.id === t.scheduleId), a = (e === "INVOICE" ? i.managedSalesDocuments : i.expenseBillDrafts).drafts.find((e) => e.id === t.draftId);
			if (!n || !a || a.kind !== e || a.operationId !== "recurring:" + n.id + ":" + t.date || !t.actorId || !Number.isFinite(Date.parse(t.createdAt))) throw Error("Invalid recurring generated-draft reference.");
		}
	}
});
//#endregion
//#region src/features/supplier-returns/supplierReturnRepository.ts
var X = e().trim().min(1).max(200), ou = a().finite().positive(), su = a().finite().nonnegative(), cu = l({
	operationId: X,
	supplierBillId: X,
	supplierCreditNumber: X,
	returnDate: X,
	reason: e().trim().min(3).max(2e3),
	lines: c(l({
		matchId: X,
		quantity: ou
	}).strict()).min(1).max(500)
}).strict(), lu = l({
	id: X,
	matchId: X,
	supplierBillLineId: X,
	goodsReceiptId: X,
	goodsReceiptLineId: X,
	productId: X,
	unitId: X,
	baseUnitId: X,
	sku: X,
	description: e(),
	unitSymbol: X,
	quantity: ou,
	conversionToBase: ou,
	quantityBase: ou,
	siteId: X,
	siteName: X,
	inventoryMovementId: X,
	costMovementId: X,
	unitCostBase: su,
	inventoryValue: su,
	voidInventoryMovementId: X.optional(),
	voidCostMovementId: X.optional()
}).strict(), uu = l({
	id: X,
	returnNumber: X,
	operationId: X,
	requestFingerprint: e().max(1e6),
	supplierBillId: X,
	supplierBillNumber: X,
	supplierId: X,
	supplierName: X,
	supplierCreditId: X,
	returnDate: X,
	reason: e().min(3).max(2e3),
	status: o(["POSTED", "VOID"]),
	lines: c(lu).min(1),
	inventoryValue: su,
	journalId: X.optional(),
	createdAt: X,
	createdBy: X,
	voidDate: X.optional(),
	voidReason: e().optional(),
	voidedBy: X.optional(),
	voidedAt: X.optional()
}).strict(), du = [], fu = 0, pu = /* @__PURE__ */ new Set(), mu = () => {
	fu++, pu.forEach((e) => e());
}, hu = (e) => Math.round(e * 1e4) / 1e4, gu = (e) => Math.round(e * 100) / 100;
function _u(e, t, n) {
	if (bo.getAll().some((r) => r.siteId === t && r.productId === n && _(r.occurredAt) > e)) throw Error("Return/reversal date precedes later inventory activity at this site.");
}
function vu(e) {
	let t = fs.getById(e);
	return !t || t.status === "VOID" || t.kind === "EXPENSE" || t.openingBalanceImportId ? [] : is.getByBill(e).filter((e) => e.status === "ACTIVE").flatMap((e) => {
		let n = t.lines.find((t) => t.id === e.supplierBillLineId), r = Ko.getById(e.goodsReceiptId), i = r?.lines.find((t) => t.id === e.goodsReceiptLineId), a = n ? or(n.productId, n.unitId) : void 0;
		if (!n || !r || !i || !a) return [];
		let o = du.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0);
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
g("physicalSupplierReturns", {
	repository: {
		create(e) {
			let t = cu.parse(e), n = JSON.stringify(t), r = du.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.requestFingerprint !== n) throw Error("Operation ID already used with different return data.");
				return r;
			}
			N(), y(t.returnDate, "Return date"), qe(t.returnDate);
			let i = fs.getById(t.supplierBillId);
			if (!i || i.status === "VOID" || i.kind === "EXPENSE" || i.openingBalanceImportId) throw Error("Select an active stock bill matched to received goods.");
			if (t.returnDate < i.billDate) throw Error("Return date cannot precede bill date.");
			let a = vu(i.id), o = /* @__PURE__ */ new Set(), s = t.lines.map((e) => {
				if (o.has(e.matchId)) throw Error("Select each receipt match once.");
				o.add(e.matchId);
				let n = a.find((t) => t.matchId === e.matchId);
				if (!n) throw Error("Return line must belong to an active receipt match for this bill.");
				if (hu(e.quantity) !== e.quantity || e.quantity > n.availableQuantity + 1e-8) throw Error("Return quantity exceeds the matched receipt remainder or four decimal places.");
				if (t.returnDate < n.receiptDate) throw Error("Return date cannot precede receipt date.");
				let r = A(n.productId), i = or(n.productId, n.unitId), s = io.getById(n.siteId);
				if (!r || !i || !s || s.status !== "ACTIVE") throw Error("Return product, unit or active receiving site was not found.");
				if (r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(i.code) && !Number.isInteger(e.quantity)) throw Error("Whole packs must be returned in whole quantities.");
				_u(t.returnDate, s.id, r.id);
				let c = hu(e.quantity * n.conversionToBase);
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
				c.set(t, hu((c.get(t) ?? 0) + e.quantityBase));
			}
			for (let [e, t] of c) {
				let [n, r] = e.split("|");
				if ((zo.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t) throw Error("Insufficient stock at the original receiving site.");
			}
			let l = /* @__PURE__ */ new Map();
			for (let e of s) {
				let t = i.lines.find((t) => t.id === e.supplierBillLineId), n = l.get(t.id);
				l.set(t.id, {
					supplierBillLineId: t.id,
					quantity: hu((n?.quantity ?? 0) + e.quantity),
					unitCost: t.unitCost
				});
			}
			let u = crypto.randomUUID(), d = "SR-" + t.returnDate.slice(0, 4) + "-" + String(du.length + 1).padStart(5, "0"), f = W.createReturnCredit({
				sourceSupplierBillId: i.id,
				supplierCreditNumber: t.supplierCreditNumber,
				creditDate: t.returnDate,
				reason: t.reason,
				lines: [...l.values()]
			}, u), p = s.map((e) => {
				zo.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let n = lo.create({
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
				}), r = No({
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
			}), m = gu(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? O.post({
				journalDate: t.returnDate,
				description: `Physical supplier return ${d}`,
				reference: f.creditNumber,
				sourceType: "SUPPLIER_RETURN",
				sourceId: u,
				lines: [{
					accountId: D.requireBySystemRole("PURCHASE_PRICE_VARIANCE").id,
					debit: m,
					credit: 0
				}, {
					accountId: D.requireBySystemRole("INVENTORY").id,
					debit: 0,
					credit: m
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
				lines: p,
				inventoryValue: m,
				journalId: h?.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				createdBy: S.current()?.userId ?? "local-test"
			};
			return du = [ee, ...du], mu(), ee;
		},
		reverse(t) {
			let n = l({
				returnId: X,
				voidDate: X,
				reason: e().trim().min(3).max(2e3)
			}).strict().parse(t), r = du.find((e) => e.id === n.returnId);
			if (!r) throw Error("Supplier return not found.");
			if (r.status === "VOID") return r;
			if (N(), y(n.voidDate, "Reversal date"), qe(n.voidDate), n.voidDate < r.returnDate) throw Error("Reversal date cannot precede return date.");
			for (let e of r.lines) _u(n.voidDate, e.siteId, e.productId);
			let i = W.getById(r.supplierCreditId);
			if ((i.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > n.voidDate) || W.getAllocationsByCredit(i.id).some((e) => e.reversedAt && _(e.reversedAt) > n.voidDate)) throw Error("Reversal date precedes later credit settlement activity.");
			W.voidReturnCredit({
				supplierCreditId: r.supplierCreditId,
				reason: n.reason,
				voidDate: n.voidDate
			});
			let a = r.lines.map((e) => {
				zo.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = lo.create({
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
				}), i = Po({
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
			r.journalId && O.reverse({
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
				voidedBy: S.current()?.userId ?? "local-test"
			};
			return du = du.map((e) => e.id === r.id ? o : e), mu(), o;
		}
	},
	read: "purchases.return.read",
	commands: {
		create: "purchases.return",
		reverse: "purchases.return"
	},
	snapshot: () => ({ returns: du }),
	restore: (e) => {
		du = e.returns;
	},
	publish: mu,
	validate: (e, t) => {
		let n = l({ returns: c(uu) }).strict().parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.returns) {
			y(e.returnDate), e.voidDate && y(e.voidDate);
			let t = cu.parse(JSON.parse(e.requestFingerprint));
			if (i.has(e.operationId) || t.operationId !== e.operationId || t.supplierBillId !== e.supplierBillId || t.returnDate !== e.returnDate) throw Error("Supplier return operation mismatch.");
			i.add(e.operationId);
			let n = r.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId && t.supplierId === e.supplierId), a = r.supplierCredits.supplierCredits.find((t) => t.id === e.supplierCreditId && t.physicalReturnId === e.id && t.sourceSupplierBillId === e.supplierBillId);
			if (!n || !a || e.status === "VOID" != (a.status === "VOID")) throw Error("Supplier return bill/credit reference is invalid.");
			if (gu(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue) throw Error("Supplier return cost total is invalid.");
			for (let t of e.lines) {
				let i = r.receiptMatches.matches.find((n) => n.id === t.matchId && n.supplierBillId === e.supplierBillId && n.supplierBillLineId === t.supplierBillLineId && n.goodsReceiptId === t.goodsReceiptId && n.goodsReceiptLineId === t.goodsReceiptLineId), a = r.costMovements.movements.find((e) => e.id === t.costMovementId), o = r.inventoryMovements.movements.find((e) => e.id === t.inventoryMovementId), s = r.goodsReceipts.goodsReceipts.find((e) => e.id === t.goodsReceiptId), c = n.lines.find((e) => e.id === t.supplierBillLineId);
				if (!i || !c || c.productId !== t.productId || c.unitId !== t.unitId || s?.siteId !== t.siteId || i.productId !== t.productId || !a || !o || a.referenceType !== "SUPPLIER_RETURN" || a.referenceId !== e.id || a.inventoryMovementId !== o.id || a.siteId !== t.siteId || a.productId !== t.productId || a.unitCostBase !== t.unitCostBase || a.quantityBase !== -t.quantityBase || gu(-a.valueChange) !== gu(t.inventoryValue) || hu(t.quantity * t.conversionToBase) !== t.quantityBase || o.referenceType !== "SUPPLIER_RETURN" || o.referenceId !== e.id || o.siteId !== t.siteId || o.productId !== t.productId || o.quantityBase !== -t.quantityBase || o.transactionQuantity !== -t.quantity || _(o.occurredAt) !== e.returnDate) throw Error("Supplier return stock/cost reference is invalid.");
				if (e.status === "VOID") {
					let n = r.costMovements.movements.find((e) => e.id === t.voidCostMovementId), i = r.inventoryMovements.movements.find((e) => e.id === t.voidInventoryMovementId);
					if (!n || !i || n.inventoryMovementId !== i.id || n.referenceType !== "SUPPLIER_RETURN_VOID" || n.referenceId !== e.id || n.siteId !== t.siteId || n.productId !== t.productId || n.quantityBase !== t.quantityBase || gu(n.valueChange) !== gu(t.inventoryValue) || i.referenceType !== "SUPPLIER_RETURN_VOID" || i.quantityBase !== t.quantityBase || i.referenceId !== e.id || _(n.occurredAt) !== e.voidDate) throw Error("Supplier return reversal reference is invalid.");
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
				let n = hu(e.lines.filter((e) => e.supplierBillLineId === t).reduce((e, t) => e + t.quantity, 0));
				if (!a.lines.some((e) => e.supplierBillLineId === t && e.quantity === n)) throw Error("Supplier return linked credit quantity mismatch.");
			}
			if (e.status === "VOID" && (!e.voidDate || e.voidDate < e.returnDate || !e.voidReason || !e.voidedBy)) throw Error("Supplier return reversal metadata is invalid.");
			if (e.inventoryValue && !r.journals.journalEntries.some((t) => t.id === e.journalId && t.sourceId === e.id && t.sourceType === "SUPPLIER_RETURN" && t.totalDebit === e.inventoryValue && (e.status === "VOID" ? t.status === "REVERSED" : t.status === "POSTED"))) throw Error("Supplier return journal reference is invalid.");
		}
		for (let e of r.supplierCredits.supplierCredits) if (e.physicalReturnId && !n.returns.some((t) => t.id === e.physicalReturnId && t.supplierCreditId === e.id)) throw Error("Supplier credit physical return reference is invalid.");
		for (let e of r.receiptMatches.matches) if (hu(n.returns.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0)) > e.matchedBaseQuantity + 1e-8) throw Error("Supplier return quantities exceed the receipt match.");
	}
});
//#endregion
//#region src/features/document-output/outputRepository.ts
var Z = e().min(1).max(200), yu = e().max(2e4), bu = yu.optional(), xu = [
	"QUOTE",
	"SALES_ORDER",
	"INVOICE",
	"CREDIT_NOTE"
], Su = l({
	operationId: Z,
	sourceId: Z,
	kind: o(xu),
	expectedUpdatedAt: Z,
	templateId: Z.optional()
}).strict(), Cu = a().finite().nonnegative(), wu = l({
	itemType: o([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	id: Z,
	sku: yu,
	description: yu,
	unitSymbol: yu,
	quantity: a().positive().finite(),
	unitPrice: Cu,
	lineSubtotal: Cu,
	taxAmount: Cu,
	lineTotal: Cu,
	taxCode: bu,
	taxRate: a().finite().min(0).max(1).optional(),
	requestedArea: a().positive().finite().optional(),
	areaPerPack: a().positive().finite().optional(),
	coveredArea: a().positive().finite().optional()
}).strict(), Tu = l({
	locationId: bu,
	locationName: bu,
	deliveryAddress: bu,
	accountingContactId: bu,
	accountingContactName: bu,
	accountingEmail: bu
}).strict(), Eu = l({
	id: Z,
	revision: Z,
	name: yu,
	subject: yu,
	body: yu,
	footer: yu,
	paper: o(["A4", "Letter"])
}).strict(), Du = l({
	id: Z,
	operationId: Z,
	requestFingerprint: yu,
	preparedAt: Z,
	preparedBy: Z,
	sourceId: Z,
	kind: o(xu),
	sourceUpdatedAt: Z,
	documentNumber: Z,
	status: Z,
	documentDate: Z,
	dueDate: bu,
	expiryDate: bu,
	reference: bu,
	notes: bu,
	customerId: Z,
	customerName: yu,
	customerCode: yu,
	customerIdentifier: bu,
	recipient: Tu.optional(),
	issuer: l({
		name: yu,
		tradingName: bu,
		identifier: bu,
		address: bu,
		email: bu,
		phone: bu,
		currency: Z
	}).strict(),
	lines: c(wu).min(1),
	totals: l({
		subtotal: Cu,
		taxAmount: Cu,
		total: Cu
	}).strict(),
	amountPaid: Cu.optional(),
	amountDue: Cu.optional(),
	template: Eu,
	subject: yu,
	body: yu
}).strict();
function Ou(e, t) {
	if (e === "CREDIT_NOTE") {
		let e = P.getById(t);
		if (!e) throw Error("Credit note was not found.");
		return {
			...e,
			type: "CREDIT_NOTE",
			documentNumber: e.creditNoteNumber,
			documentDate: e.creditDate
		};
	}
	let n = R.getById(t);
	if (!n || n.type !== e) throw Error("Sales document was not found.");
	return n;
}
var ku = (e) => e === "QUOTE" ? "Quotation" : e === "INVOICE" ? "Invoice" : e === "SALES_ORDER" ? "Sales order" : "Credit note";
function Au() {
	return (v.templates ?? []).filter((e) => e.status === "Active" && [
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
var ju = [];
Au();
var Mu = 0, Nu = /* @__PURE__ */ new Set(), Pu = () => {
	Mu++, Nu.forEach((e) => e());
};
function Fu(e, t) {
	let n = t ? v.templates?.find((n) => n.id === t && n.status === "Active" && n.kind === ku(e)) : void 0;
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
var Iu = [
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
function Lu(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!Iu.includes(n)) throw Error(`Unsupported template token: ${n}.`);
		return t[n] ?? "";
	});
}
function Ru(e) {
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
var zu = { prepare(e) {
	let t = Su.parse(e), n = JSON.stringify(t), r = ju.find((e) => e.operationId === t.operationId);
	if (r) {
		if (r.requestFingerprint !== n) throw Error("Operation ID was used for different output data.");
		return r;
	}
	let i = Ou(t.kind, t.sourceId);
	if (i.updatedAt !== t.expectedUpdatedAt) throw Error("Source document changed. Reload before preparing output.");
	let a = mn.getById(i.customerId);
	if (!a) throw Error("Source customer was not found.");
	let o = m(), s = Fu(t.kind, t.templateId), c = structuredClone(i.recipient), l = {
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
		preparedBy: S.current()?.userId ?? "local-test",
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
			currency: o.currency
		},
		lines: i.lines.map(Ru),
		totals: structuredClone(i.totals),
		amountPaid: "amountPaid" in i ? i.amountPaid : void 0,
		amountDue: "amountDue" in i ? i.amountDue : void 0,
		template: {
			...s,
			footer: Lu(s.footer, l)
		},
		subject: Lu(s.subject, l),
		body: Lu(s.body, l)
	};
	return Bu(u), ju = [u, ...ju], Pu(), u;
} };
function Bu(e) {
	let t = Du.parse(e);
	if (dr(t.recipient), !Number.isFinite(Date.parse(t.preparedAt))) throw Error("Invalid preparation timestamp.");
	let n = Su.parse(JSON.parse(t.requestFingerprint));
	if (n.operationId !== t.operationId || n.sourceId !== t.sourceId || n.kind !== t.kind || n.expectedUpdatedAt !== t.sourceUpdatedAt) throw Error("Output source metadata mismatch.");
	let r = (e) => Math.round(e * 100) / 100;
	for (let e of t.lines) if (lr(e), r(e.lineSubtotal + e.taxAmount) !== e.lineTotal) throw Error("Invalid output line total.");
	for (let [e, n] of [
		["subtotal", "lineSubtotal"],
		["taxAmount", "taxAmount"],
		["total", "lineTotal"]
	]) if (r(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Invalid output totals.");
	return t;
}
g("preparedSalesOutputs", {
	repository: zu,
	read: "sales.read",
	commands: { prepare: "documents.prepare" },
	snapshot: () => ({
		artifacts: ju,
		templates: Au()
	}),
	restore: (e) => {
		ju = e.artifacts, e.templates;
	},
	publish: Pu,
	validate: (e, t) => {
		let n = l({
			artifacts: c(Du),
			templates: c(l({
				id: Z,
				name: yu,
				kind: Z
			}).strict())
		}).strict().parse(e), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
		for (let e of n.artifacts) {
			if (Bu(e), r.has(e.id) || i.has(e.operationId)) throw Error("Duplicate prepared output.");
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
function Vu(e) {
	return D.requireBySystemRole(e).id;
}
function Hu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Uu(e) {
	return O.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function Wu(e) {
	let t = bo.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var Gu = {
	postSalesFulfilment(e) {
		let t = Uu(e.id);
		if (t) return t;
		let n = Hu(Wu(e).reduce((e, t) => {
			if (t.valueChange > 0) throw Error(`Sales fulfilment cost movement ${t.costMovementNumber} has an invalid positive inventory value change.`);
			return e - t.valueChange;
		}, 0));
		if (!Number.isFinite(n) || n < 0) throw Error("Sales fulfilment COGS amount is invalid.");
		if (n !== 0) return O.post({
			journalDate: e.fulfilmentDate,
			description: `COGS for sales fulfilment ${e.fulfilmentNumber}`,
			reference: e.fulfilmentNumber,
			sourceType: "SALES_FULFILMENT",
			sourceId: e.id,
			lines: [{
				accountId: Vu("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: Vu("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = Uu(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? O.getById(r.reversalJournalEntryId) : void 0 : O.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, Ku = /* @__PURE__ */ new Set(), qu = [], Ju = qu;
function Yu() {
	Ju = qu, Ku.forEach((e) => e());
}
function Xu() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = qu.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function Zu(e, t) {
	return B(qu.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function Qu(e) {
	let t = R.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.filter(rr).map((e) => Zu(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.filter(rr).every((e, t) => n[t] >= B(e.quantity));
	R.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function $u(e) {
	let t = bo.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var ed = {
	subscribe(e) {
		return Ku.add(e), () => {
			Ku.delete(e);
		};
	},
	getSnapshot() {
		return Ju;
	},
	getAll() {
		return Ju;
	},
	getById(e) {
		return qu.find((t) => t.id === e);
	},
	getBySalesOrder(e) {
		return qu.filter((t) => t.salesOrderId === e);
	},
	getFulfilledQuantity: Zu,
	getRemainingQuantity(e, t) {
		let n = R.getById(e);
		if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let r = n.lines.find((e) => e.id === t);
		if (!r) throw Error("Sales order line was not found.");
		return rr(r) ? B(r.quantity - Zu(e, t)) : 0;
	},
	create(e) {
		let t = R.getById(e.salesOrderId);
		if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let n = t;
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "INVOICED") throw Error("Only a confirmed or partially fulfilled sales order can be fulfilled.");
		if (n.status === "INVOICED" && !n.invoiceIds.some((e) => {
			let t = R.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("This order has no active invoice; do not fulfil a void invoice.");
		let r = io.getById(e.siteId);
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
			if (!rr(t)) throw Error("Non-stock and service lines do not require inventory dispatch.");
			let i = A(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let o = or(t.productId, t.unitId);
			if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
			if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
			let s = B(e.fulfilledQuantity);
			if (t.areaPerPack && !Number.isInteger(e.fulfilledQuantity)) throw Error("Area-based lines must be dispatched in whole packs.");
			let c = Zu(n.id, t.id);
			if (s > B(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
			let l = B(s * o.conversionToBase), u = zo.getBalance(r.id, t.productId);
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
			let n = zo.getBalance(r.id, e);
			if (!n || n.quantityOnHand < t) {
				let t = A(e);
				throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
			}
		}
		let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = Xu(), d = o.map((e) => ({
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
			let a = lo.create({
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
			No({
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
			}), zo.issue({
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: t.fulfilledBaseQuantity
			});
		}
		return Gu.postSalesFulfilment(f), qu = [f, ...qu], Yu(), Qu(n.id), f;
	},
	void(e) {
		let t = qu.find((t) => t.id === e.fulfilmentId);
		if (!t) throw Error("Sales fulfilment was not found.");
		if (t.status === "VOIDED") throw Error("Sales fulfilment has already been voided.");
		if (Number.isNaN(Date.parse(e.voidDate))) throw Error("Fulfilment void date is invalid.");
		if (e.voidDate < t.fulfilmentDate) throw Error("Fulfilment void date cannot be earlier than the fulfilment date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Fulfilment void reason must contain at least 3 characters.");
		let r = R.getById(t.salesOrderId);
		if (!r || r.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		if (r.status === "INVOICED" && r.invoiceIds.some((e) => {
			let t = R.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("Cannot void a sales fulfilment for an invoiced sales order.");
		if (r.status !== "CONFIRMED" && r.status !== "PARTIALLY_FULFILLED" && r.status !== "FULFILLED" && r.status !== "INVOICED") throw Error(`Cannot void a sales fulfilment when the sales order status is ${r.status}.`);
		let i = $u(t), a = /* @__PURE__ */ new Set(), o = t.lines.map((e) => {
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
		Gu.reverseSalesFulfilment({
			fulfilment: t,
			reversalDate: e.voidDate,
			reason: n
		});
		for (let r of o) {
			let { line: i, product: a, originalIssue: o } = r, s = lo.create({
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
			Po({
				siteId: t.siteId,
				productId: i.productId,
				quantityBase: i.fulfilledBaseQuantity,
				unitCostBase: o.unitCostBase,
				inventoryValue: Ga(Math.abs(o.valueChange)),
				referenceType: "SALE",
				referenceId: t.id,
				referenceNumber: t.fulfilmentNumber,
				inventoryMovementId: s.id,
				occurredAt: e.voidDate,
				notes: `Void sales fulfilment ${t.fulfilmentNumber}: ${n}`
			}), zo.receive({
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
		return qu = qu.map((e) => e.id === s.id ? s : e), Yu(), Qu(t.salesOrderId), s;
	}
};
g("fulfilments", {
	repository: ed,
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: qu }),
	restore: (e) => {
		qu = e.fulfilments, Ju = qu;
	},
	publish: () => Ku.forEach((e) => e())
});
//#endregion
//#region src/features/direct-documents/dispatchRepository.ts
var td = e().trim().min(1).max(200), nd = l({
	operationId: td,
	salesOrderId: td,
	siteId: td,
	fulfilmentDate: td,
	lines: c(l({
		salesOrderLineId: td,
		fulfilledQuantity: a().positive().finite()
	}).strict()).min(1).max(500)
}).strict();
function rd() {
	return R.getAll().filter((e) => e.type === "SALES_ORDER" && [
		"CONFIRMED",
		"PARTIALLY_FULFILLED",
		"INVOICED"
	].includes(e.status)).filter((e) => e.type === "SALES_ORDER" && (e.status !== "INVOICED" || e.invoiceIds.some((e) => {
		let t = R.getById(e);
		return t?.type === "INVOICE" && t.status !== "VOID";
	}))).map((e) => ({
		id: e.id,
		number: e.documentNumber,
		date: e.documentDate,
		delivery: e.recipient?.deliveryAddress,
		store: e.recipient?.locationName,
		lines: e.lines.filter(rr).map((t) => ({
			id: t.id,
			sku: t.sku,
			description: t.description,
			unit: t.unitSymbol,
			quantity: t.quantity,
			fulfilled: ed.getAll().filter((t) => t.salesOrderId === e.id && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t.id).reduce((e, t) => e + t.fulfilledQuantity, 0)
		}))
	})).filter((e) => e.lines.length > 0);
}
rd();
var id = [], ad = 0, od = /* @__PURE__ */ new Set(), sd = () => {
	ad++, od.forEach((e) => e());
};
g("salesDispatch", {
	repository: {
		record(e) {
			let t = nd.parse(e), n = JSON.stringify(t), r = id.find((e) => e.id === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Dispatch operation ID was already used with different data.");
				return ed.getAll().find((e) => e.id === r.fulfilmentId);
			}
			if (N(), y(t.fulfilmentDate), qe(t.fulfilmentDate), new Set(t.lines.map((e) => e.salesOrderLineId)).size !== t.lines.length) throw Error("Each dispatch line must be selected only once.");
			let i = ed.create(t);
			return id = [...id, {
				id: t.operationId,
				fingerprint: n,
				fulfilmentId: i.id
			}], sd(), i;
		},
		reverse(t) {
			let n = l({
				fulfilmentId: td,
				voidDate: td,
				reason: e().trim().min(3).max(1e3)
			}).strict().parse(t);
			N(), y(n.voidDate), qe(n.voidDate);
			let r = ed.getAll().find((e) => e.id === n.fulfilmentId);
			return r?.status === "VOIDED" ? r : ed.void(n);
		}
	},
	read: "inventory.read",
	commands: {
		record: "inventory.adjust",
		reverse: "inventory.adjust"
	},
	snapshot: () => ({
		orders: rd(),
		requests: id
	}),
	restore: (e) => {
		e.orders, id = e.requests;
	},
	publish: sd,
	validate: (t, n) => {
		let r = l({
			orders: c(l({
				id: td,
				number: td,
				date: td,
				delivery: e().optional(),
				store: e().optional(),
				lines: c(l({
					id: td,
					sku: e(),
					description: e(),
					unit: e(),
					quantity: a().finite().positive(),
					fulfilled: a().finite().nonnegative()
				}).strict())
			}).strict()),
			requests: c(l({
				id: td,
				fingerprint: e().max(1e6),
				fulfilmentId: td
			}).strict())
		}).strict().parse(t), i = n.fulfilments.fulfilments;
		if (r.requests.some((e) => !i.some((t) => t.id === e.fulfilmentId))) throw Error("Dispatch result reference is invalid.");
	}
});
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function cd(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ld(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) {
		if (r.has(t.id)) {
			i = cd(i + t.moneyIn), a = cd(a + t.moneyOut);
			continue;
		}
		o = cd(o + t.moneyIn), s = cd(s + t.moneyOut);
	}
	let c = cd(cd(t) + o - s), l = cd(e.closingBalance), u = cd(c - l);
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
var ud = /* @__PURE__ */ new Set(), dd = T.read().reconciliations;
T.onRollback(() => {
	dd = T.read().reconciliations;
});
function fd() {
	T.update("reconciliations", dd), ud.forEach((e) => T.notify(e));
}
function pd(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function md(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function hd() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function gd(e) {
	return `BREC-${e.slice(0, 4)}-${String(dd.length + 1).padStart(4, "0")}`;
}
function _d(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of dd) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var vd = {
	subscribe(e) {
		return ud.add(e), () => {
			ud.delete(e);
		};
	},
	getSnapshot() {
		return dd;
	},
	getAll() {
		return dd;
	},
	getByBankAccount(e) {
		return dd.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return _d(e);
	},
	complete(e) {
		if (md(e.statementDate), y(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let t = tr.requireById(e.bankAccountId);
		if (!t.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < t.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let n = this.getLatestByBankAccount(t.id);
		if (n && e.statementDate <= n.statementDate) throw Error(`Statement date must be after the last reconciled date ${n.statementDate}.`);
		let r = Js(t, O.getAll(), e.statementDate), i = new Set(r.transactions.map((e) => e.id)), a = _d(t.id), o = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !a.has(e));
		for (let e of o) if (!i.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let s = /* @__PURE__ */ new Set([...a, ...o]), c = ld(r, pd(e.statementBalance), Array.from(s));
		if (!c.reconciled) throw Error(`Bank reconciliation is out by ${c.difference.toFixed(2)}.`);
		let l = {
			id: hd(),
			reconciliationNumber: gd(e.statementDate),
			bankAccountId: t.id,
			statementDate: e.statementDate,
			statementBalance: pd(e.statementBalance),
			bookBalance: c.bookBalance,
			outstandingDeposits: c.outstandingDeposits,
			outstandingPayments: c.outstandingPayments,
			adjustedStatementBalance: c.adjustedStatementBalance,
			difference: c.difference,
			clearedTransactionIds: o,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return dd = [l, ...dd], fd(), l;
	}
}, yd = vd.complete;
vd.complete = function(e) {
	return N(), T.transaction(() => yd.call(vd, e));
}, g("bankReconciliations", {
	repository: vd,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: dd }),
	restore: (e) => {
		dd = e.reconciliations;
	},
	publish: () => ud.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/settlementRepository.ts
var bd = (e) => Math.round((e + 2 ** -52) * 100) / 100, Q = e().trim().min(1).max(200), xd = a().finite().positive().refine((e) => bd(e) === e, "Use cents precision"), Sd = l({
	operationId: Q,
	customerId: Q,
	paymentDate: Q,
	bankAccountId: Q,
	reference: e().max(500).optional(),
	allocations: c(l({
		invoiceId: Q,
		amount: xd
	}).strict()).min(1).max(500)
}).strict(), Cd = l({
	operationId: Q,
	creditId: Q,
	paymentDate: Q,
	bankAccountId: Q,
	amount: xd,
	reference: e().max(500).optional()
}).strict(), wd = [], Td = [], Ed = [], Dd = 0, Od = /* @__PURE__ */ new Set(), kd = () => {
	Dd++, Od.forEach((e) => e());
};
function Ad(e, t, n) {
	let r = JSON.stringify(n), i = e.find((e) => e.operationId === t);
	if (i && i.fingerprint !== r) throw Error("Operation ID was already used with different data.");
	return {
		old: i,
		fingerprint: r
	};
}
function jd(e, t) {
	y(t, "Payment date");
	let n = tr.requireById(e);
	if (!n.active || t < n.openingBalanceDate) throw Error("Bank is inactive or payment precedes its opening date.");
	let r = D.requireById(n.glAccountId);
	if (!r.active || r.type !== "ASSET") throw Error("Invalid bank ledger account.");
	return n;
}
function Md(e) {
	if (vd.getAll().some((t) => t.clearedTransactionIds.some((t) => t.startsWith(e + ":")))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Nd(e, t) {
	let n = e === "customer" ? P.getById(t) : W.getById(t);
	if (!n || n.status === "VOID" || n.status === "DRAFT") throw Error("An issued credit is required.");
	return n;
}
function Pd(e, t, n) {
	let r = Nd(e, t), i = bd(n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0)), a = bd(r.totals.total - r.amountApplied - i);
	if (a < 0) throw Error("Refund exceeds the unused credit.");
	let o = {
		...r,
		refundEvents: n,
		amountRefunded: i,
		amountAvailable: a,
		status: a === 0 ? "FULLY_APPLIED" : "ISSUED",
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	e === "customer" ? P.update(o) : W.update(o);
}
function Fd(e, t) {
	N();
	let n = Cd.parse(t), { old: r, fingerprint: i } = Ad(e === "customer" ? Td : Ed, n.operationId, n);
	if (r) return r;
	let a = Nd(e, n.creditId), o = jd(n.bankAccountId, n.paymentDate);
	if (n.paymentDate < a.creditDate || n.amount > a.amountAvailable) throw Error("Refund date/amount exceeds the available credit.");
	let s = D.requireBySystemRole(e === "customer" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"), c = crypto.randomUUID(), l = O.post({
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
	return Pd(e, a.id, [...a.refundEvents ?? [], {
		id: u.id,
		date: u.paymentDate,
		amount: u.amount
	}]), e === "customer" ? Td = [...Td, u] : Ed = [...Ed, u], kd(), u;
}
function Id(e, t) {
	if (N(), y(t.reversalDate, "Reversal date"), !t.reason?.trim() || t.reason.trim().length < 3) throw Error("Enter a reversal reason.");
	let n = e === "customer" ? Td : Ed, r = n.find((e) => e.id === t.id);
	if (!r) throw Error("Refund was not found.");
	if (r.status === "REVERSED") return r;
	if (t.reversalDate < r.paymentDate) throw Error("Reversal cannot precede the refund.");
	Md(r.journalEntryId), O.reverse({
		journalEntryId: r.journalEntryId,
		reversalDate: t.reversalDate,
		reason: t.reason
	});
	let i = Nd(e, r.creditId);
	Pd(e, i.id, (i.refundEvents ?? []).map((e) => e.id === r.id ? {
		...e,
		reversalDate: t.reversalDate
	} : e));
	let a = {
		...r,
		status: "REVERSED",
		reversalDate: t.reversalDate
	};
	return e === "customer" ? Td = n.map((e) => e.id === r.id ? a : e) : Ed = n.map((e) => e.id === r.id ? a : e), kd(), a;
}
var Ld = {
	recordReceipt(e) {
		let t = Sd.parse(e), { old: n, fingerprint: r } = Ad(wd, t.operationId, t);
		if (n) return n;
		if (jd(t.bankAccountId, t.paymentDate), new Set(t.allocations.map((e) => e.invoiceId)).size !== t.allocations.length) throw Error("Each invoice may only be allocated once.");
		for (let e of t.allocations) {
			let n = R.getAll().find((t) => t.id === e.invoiceId && t.type === "INVOICE");
			if (!n || n.type !== "INVOICE" || n.customerId !== t.customerId || t.paymentDate < n.documentDate || ["VOID", "DRAFT"].includes(n.status) || e.amount > n.amountDue) throw Error("Invalid invoice customer, date or outstanding amount.");
		}
		let i = t.allocations.map((e, n) => R.recordInvoicePayment({
			...t,
			invoiceId: e.invoiceId,
			amount: e.amount,
			method: "BANK_TRANSFER",
			operationId: t.operationId + ":" + n
		})), a = {
			...t,
			id: crypto.randomUUID(),
			fingerprint: r,
			amount: bd(i.reduce((e, t) => e + t.amount, 0)),
			paymentIds: i.map((e) => e.id),
			status: "POSTED"
		};
		return wd = [...wd, a], kd(), a;
	},
	reverseReceipt(e) {
		let t = wd.find((t) => t.id === e.id);
		if (!t) throw Error("Receipt not found.");
		if (t.status === "REVERSED") return t;
		for (let e of t.paymentIds) {
			let t = Vi.getById(e);
			if (!t || t.status !== "RECEIVED") throw Error("Receipt allocations changed; inspect individual payments first.");
			for (let t of O.getBySource("CUSTOMER_PAYMENT", e)) Md(t.id);
		}
		for (let n of t.paymentIds) R.reverseInvoicePayment(n, e.reason);
		let n = {
			...t,
			status: "REVERSED",
			reversalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		};
		return wd = wd.map((e) => e.id === t.id ? n : e), kd(), n;
	},
	createRefund: (e) => Fd("customer", e),
	reverseRefund: (e) => Id("customer", e)
}, Rd = {
	create: (e) => Fd("supplier", e),
	reverse: (e) => Id("supplier", e),
	repairLegacyCredits(e) {
		if (N(), y(e.date, "Repair date"), e.reason?.trim().length < 3) throw Error("Enter a repair reason.");
		let t = [];
		for (let n of W.getAll().filter((e) => e.status !== "VOID")) {
			if (e.date < n.creditDate || O.getBySource("SUPPLIER_CREDIT_RECLASS", n.id).length) continue;
			let r = O.getBySource("SUPPLIER_CREDIT", n.id).find((e) => e.status === "POSTED");
			if (!r) continue;
			let i = D.requireBySystemRole("INVENTORY"), a = D.requireBySystemRole("PURCHASE_PRICE_VARIANCE"), o = bd(r.lines.filter((e) => e.accountId === i.id).reduce((e, t) => e + t.credit - t.debit, 0));
			o <= 0 || t.push(O.post({
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
}, zd = l({
	id: Q,
	operationId: Q,
	fingerprint: Q,
	creditId: Q,
	contactId: Q,
	paymentDate: Q,
	bankAccountId: Q,
	amount: xd,
	journalEntryId: Q,
	status: o(["POSTED", "REVERSED"]),
	reference: e().optional(),
	reversalDate: e().optional()
}).strict();
g("customerSettlements", {
	repository: Ld,
	read: "sales.read",
	commands: {
		recordReceipt: "sales.payment",
		reverseReceipt: "sales.payment",
		createRefund: "sales.payment",
		reverseRefund: "sales.payment"
	},
	snapshot: () => ({
		receipts: wd,
		refunds: Td
	}),
	restore: (e) => {
		wd = e.receipts, Td = e.refunds;
	},
	validate: (t, n) => {
		Bd(t, n, !1);
		let r = t;
		c(zd.extend({ fingerprint: e() })).parse(r.refunds), c(l({
			id: Q,
			operationId: Q,
			paymentIds: c(Q),
			amount: xd,
			status: o(["POSTED", "REVERSED"])
		}).passthrough()).parse(r.receipts);
	},
	publish: kd
}), g("supplierRefunds", {
	repository: Rd,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		repairLegacyCredits: "accounting.recover"
	},
	snapshot: () => ({ refunds: Ed }),
	restore: (e) => {
		Ed = e.refunds;
	},
	validate: (t, n) => {
		Bd(t, n, !0), c(zd.extend({ fingerprint: e() })).parse(t.refunds);
	},
	publish: kd
});
function Bd(e, t, n) {
	let r = e, i = t.journals.journalEntries, a = n ? t.supplierCredits.supplierCredits : t.customerCredits.creditNotes, o = t.bankAccounts.bankAccounts;
	for (let e of r.refunds) {
		let t = a.find((t) => t.id === e.creditId), r = i.find((t) => t.id === e.journalEntryId), s = t?.refundEvents?.find((t) => t.id === e.id);
		if (!t || e.contactId !== ("customerId" in t ? t.customerId : t.supplierId) || !s || s.amount !== e.amount || s.date !== e.paymentDate || s.reversalDate !== e.reversalDate || !o.some((t) => t.id === e.bankAccountId) || !r || r.sourceId !== e.id || r.sourceType !== (n ? "SUPPLIER_REFUND" : "CUSTOMER_REFUND") || r.totalDebit !== e.amount || r.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) throw Error("Refund snapshot relationships are invalid.");
	}
	for (let e of a) {
		let t = bd(r.refunds.filter((t) => t.creditId === e.id && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
		if ((e.amountRefunded ?? 0) !== t) throw Error("Credit refunded balance is invalid.");
	}
	for (let e of a) for (let t of e.refundEvents ?? []) if (!r.refunds.some((n) => n.id === t.id && n.creditId === e.id)) throw Error("Credit refund history has no settlement record.");
	if (!n) {
		let e = t.customerPayments.payments;
		for (let t of r.receipts ?? []) {
			let n = t.paymentIds.map((t) => e.find((e) => e.id === t));
			if (new Set(t.paymentIds).size !== t.paymentIds.length || !n.length || n.some((e) => !e || e.customerId !== t.customerId || e.bankAccountId !== t.bankAccountId || e.status !== (t.status === "REVERSED" ? "REVERSED" : "RECEIVED")) || bd(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== t.amount) throw Error("Receipt allocation snapshot relationships are invalid.");
		}
	}
}
//#endregion
//#region src/features/sales/data/invoiceBalanceAsAtService.ts
function Vd(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= Wd(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: Gd(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => Hd(e, r)), a = Gd(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && Ud(t, r)), s = Gd(o.reduce((e, t) => e + t.amount, 0)), c = Gd(e.totals.total), l = Gd(Math.max(0, c - a - s));
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
function Hd(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Wd(e.reversedAt) : !1;
}
function Ud(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Wd(e.reversedAt) : !1;
}
function Wd(e) {
	return _(e);
}
function Gd(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function Kd(e, t, n) {
	let r = Yd(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= Jd(e.voidedAt)) return qd(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && Ud(t, n)), a = Yd(i.reduce((e, t) => e + t.amount, 0)), o = Yd(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - a));
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
function qd(e, t, n) {
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
function Jd(e) {
	return _(e);
}
function Yd(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function Xd(e, t, n = [], r = [], i = [], a = $d()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = Vd(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = Zd(e.dueDate, a);
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
		current: ef(s.current),
		days1To30: ef(s.days1To30),
		days31To60: ef(s.days31To60),
		days61To90: ef(s.days61To90),
		days90Plus: ef(s.days90Plus)
	}, p = ef(c), m = ef(l), h = ef(i.reduce((t, n) => n.customerId === e.id ? t + Kd(n, r, a).amountAvailable : t, 0)), ee = ef(p - h);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: h,
		netAccountBalance: ee,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: ef(Math.max(0, e.creditLimit - Math.max(0, ee))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function Zd(e, t = $d()) {
	let n = Qd(e), r = Qd(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Qd(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function $d() {
	return _((/* @__PURE__ */ new Date()).toISOString());
}
function ef(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function tf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function nf(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function rf(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? tf(t - n) : tf(n - t);
}
function af(e, t, n) {
	nf(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = tf(t + r.debit), n = tf(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: rf(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = tf(r.reduce((e, t) => e + t.totalDebit, 0)), o = tf(r.reduce((e, t) => e + t.totalCredit, 0));
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
function of(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function sf({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = Xd(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: of(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = of(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = of(af(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = of(l - d);
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
function cf(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && lf(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = uf(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && lf(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = uf(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && lf(n.reversedAt) <= r ? t : t + n.amount, 0)), o = uf(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: uf(Math.max(0, o - i - a))
	};
}
function lf(e) {
	return _(e);
}
function uf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function df(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && ff(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = pf(e.totals.total), i = pf(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && ff(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: pf(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - i))
	};
}
function ff(e) {
	return _(e);
}
function pf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function mf(e, t, n = [], r = [], i = [], a = xf()) {
	let o = _f(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = cf(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = gf(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = bf(r.reduce((t, n) => n.supplierId === e.id ? t + df(n, i, a).amountAvailable : t, 0)), p = bf(s), m = bf(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: bf(c),
		aging: vf(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function hf(e, t, n = [], r = [], i = [], a = xf()) {
	let o = _f(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let h of e) {
		let e = mf(h, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: bf(s),
		unallocatedCredit: bf(c),
		totalOutstanding: bf(l),
		overdueAmount: bf(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: vf(o)
	};
}
function gf(e, t = xf()) {
	let n = yf(e), r = yf(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function _f() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function vf(e) {
	return {
		current: bf(e.current),
		days1To30: bf(e.days1To30),
		days31To60: bf(e.days31To60),
		days61To90: bf(e.days61To90),
		days90Plus: bf(e.days90Plus)
	};
}
function yf(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function bf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function xf() {
	return _((/* @__PURE__ */ new Date()).toISOString());
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function Sf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Cf({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = hf(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = Sf(af(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = Sf(c.totalOutstanding), f = Sf(d - u);
	return {
		asOfDate: s,
		grossOutstanding: Sf(c.grossOutstanding),
		unallocatedCredit: Sf(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function wf(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function Tf(e) {
	return e.slice(0, 10);
}
function Ef(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function Df(e, t) {
	wf(t);
	let n = e.filter((e) => Tf(e.occurredAt) <= t).slice().sort(Ef), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = B(n.quantityOnHand + e.quantityBase), a = Ga(n.inventoryValue + e.valueChange);
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
		let t = io.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = A(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : Wa(e.inventoryValue / e.quantityOnHand);
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
		totalInventoryValue: Ga(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function Of(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function kf(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function Af({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	kf(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = Df(n, r), o = Of(af(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = Of(a.totalInventoryValue), c = Of(s - o);
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
var jf = (e) => Math.round((e + 2 ** -52) * 100) / 100, $ = e().trim().min(1).max(200), Mf = a().finite().refine((e) => jf(e) === e, "Amounts must use cents precision"), Nf = l({
	accountId: $,
	debit: Mf.nonnegative(),
	credit: Mf.nonnegative()
}).strict(), Pf = l({
	contactId: $,
	reference: $,
	date: $,
	dueDate: $,
	amount: Mf
}).strict(), Ff = l({
	operationId: $,
	date: $,
	reason: e().trim().min(3).max(1e3),
	gl: c(Nf).min(2).max(5e3),
	ar: c(Pf).max(1e4),
	ap: c(Pf).max(1e4),
	banks: c(l({
		bankAccountId: $,
		amount: Mf
	}).strict()).max(500),
	stock: c(l({
		siteId: $,
		productId: $,
		quantity: a().positive().finite(),
		unitCost: a().nonnegative().finite()
	}).strict()).max(1e4)
}).strict(), If = [], Lf = 0, Rf = /* @__PURE__ */ new Set(), zf = () => {
	Lf++, Rf.forEach((e) => e());
};
function Bf() {
	return x();
}
function Vf(e) {
	p(e), Gr(e.sales), ri(e.customerCredits), T.update("supplierBills", e.supplierBills.supplierBills), T.update("supplierCredits", e.supplierCredits.supplierCredits);
}
function Hf(e, t) {
	if (new Set(e).size !== e.length) throw Error("Duplicate " + t + ".");
}
function Uf(e) {
	let t = Ff.parse(e);
	if (y(t.date, "Cutover date"), qe(t.date), N(), If.some((e) => e.status === "POSTED")) throw Error("An opening batch is already active. Reverse the unused batch before replacing it.");
	let n = Bf();
	if (n.journals.journalEntries.some((e) => e.journalDate >= t.date)) throw Error("Cutover must be after all existing ledger activity. This import adds historical balances, never replaces existing transactions.");
	if (n.inventoryMovements.movements.some((e) => e.occurredAt.slice(0, 10) >= t.date)) throw Error("Cutover must be after existing inventory activity.");
	Hf(t.gl.map((e) => e.accountId), "GL account"), Hf(t.banks.map((e) => e.bankAccountId), "bank"), Hf(t.stock.map((e) => e.siteId + ":" + e.productId), "site/product");
	let r = sf({
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
	}), i = Cf({
		suppliers: n.suppliers.suppliers,
		bills: n.supplierBills.supplierBills,
		payments: n.supplierPayments.supplierPayments,
		credits: n.supplierCredits.supplierCredits,
		creditAllocations: n.supplierCredits.allocations,
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: t.date
	}), a = Af({
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
	let o = D.getAll(), s = (e) => D.requireBySystemRole(e).id, c = (e) => jf(t.gl.filter((t) => t.accountId === e).reduce((e, t) => e + t.debit - t.credit, 0));
	for (let e of t.gl) {
		let t = D.requireById(e.accountId);
		if (!t.active || ![
			"ASSET",
			"LIABILITY",
			"EQUITY"
		].includes(t.type) || e.debit > 0 && e.credit > 0 || e.debit + e.credit <= 0) throw Error("Opening GL requires active balance-sheet accounts and one positive debit or credit per row.");
	}
	let l = jf(t.gl.reduce((e, t) => e + t.debit, 0)), u = jf(t.gl.reduce((e, t) => e + t.credit, 0));
	if (l !== u || !l) throw Error("Opening trial balance does not balance.");
	let d = jf(t.ar.reduce((e, t) => e + t.amount, 0)), f = jf(t.ap.reduce((e, t) => e + t.amount, 0));
	if (c(s("ACCOUNTS_RECEIVABLE")) !== d || c(s("ACCOUNTS_PAYABLE")) !== -f) throw Error("AR/AP detail must equal imported GL control balances. Negative detail creates an unused historical credit.");
	for (let [e, r] of [["ar", t.ar], ["ap", t.ap]]) {
		Hf(r.map((e) => e.contactId + ":" + e.reference.toLowerCase()), e + " reference");
		for (let i of r) {
			if (y(i.date), y(i.dueDate), !i.amount || i.date > t.date || i.dueDate < i.date) throw Error("Invalid outstanding document amount/date.");
			if (!(e === "ar" ? n.customers.customers : n.suppliers.suppliers).some((e) => e.id === i.contactId)) throw Error("Opening contact not found.");
			if ((e === "ar" ? [...n.sales.invoices.map((e) => [e.customerId, e.documentNumber]), ...n.customerCredits.creditNotes.map((e) => [e.customerId, e.creditNoteNumber])] : [...n.supplierBills.supplierBills.map((e) => [e.supplierId, e.supplierInvoiceNumber]), ...n.supplierCredits.supplierCredits.map((e) => [e.supplierId, e.supplierCreditNumber])]).some(([e, t]) => e === i.contactId && t.toLowerCase() === i.reference.toLowerCase())) throw Error("Historical document reference already exists.");
		}
	}
	let p = 0;
	for (let e of t.stock) {
		let t = A(e.productId), n = io.getById(e.siteId);
		if (!t || t.status !== "ACTIVE" || t.itemType === "SERVICE" || n?.status !== "ACTIVE") throw Error("Opening stock requires active stocked products/sites.");
		if (Math.round(e.quantity * 1e4) / 1e4 !== e.quantity) throw Error("Stock quantities use at most four decimal places.");
		p = jf(p + jf(e.quantity * e.unitCost));
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
g("openingBalances", {
	repository: {
		preview(e) {
			let { input: t, debit: n, credit: r, ar: i, ap: a, inventory: o } = Uf(e);
			return {
				date: t.date,
				debit: n,
				credit: r,
				ar: i,
				ap: a,
				inventory: o,
				bank: jf(t.banks.reduce((e, t) => e + t.amount, 0)),
				documents: t.ar.length + t.ap.length
			};
		},
		post(e) {
			let t = Ff.parse(e), n = JSON.stringify(t), r = If.find((e) => e.operationId === t.operationId);
			if (n.length > 5e7) throw Error("Opening import exceeds 50 MB.");
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID already used for different opening data.");
				return r;
			}
			let { input: i, s: a } = Uf(t), o = crypto.randomUUID(), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
				id: o,
				operationId: i.operationId,
				fingerprint: n,
				date: i.date,
				reason: i.reason,
				status: "POSTED",
				actor: S.current()?.userId ?? "",
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
			}, l = (e) => D.requireBySystemRole(e).id, u = l("OWNERS_EQUITY"), d = 0, f = 0;
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
				let ee = e === "ar" == t.amount > 0, te = O.post({
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
			a.journals = Bf().journals, Vf(a);
			let p = i.gl.filter((e) => ![l("ACCOUNTS_RECEIVABLE"), l("ACCOUNTS_PAYABLE")].includes(e.accountId));
			(d || f) && p.push({
				accountId: u,
				debit: jf(d),
				credit: jf(f)
			});
			let m = /* @__PURE__ */ new Map();
			for (let e of p) m.set(e.accountId, jf((m.get(e.accountId) ?? 0) + e.debit - e.credit));
			let h = [...m].filter(([, e]) => e !== 0).map(([e, t]) => ({
				accountId: e,
				debit: Math.max(0, t),
				credit: Math.max(0, -t)
			}));
			if (h.length) {
				let e = O.post({
					journalDate: i.date,
					description: "Opening trial balance " + i.reason,
					sourceType: "OPENING_BALANCE",
					sourceId: o,
					lines: h
				});
				c.journalIds.push(e.id);
			}
			for (let e of i.stock) {
				let t = A(e.productId), n = t.units.find((e) => e.id === t.baseUnitId), r = lo.create({
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
				zo.receive({
					siteId: e.siteId,
					productId: t.id,
					baseUnitId: t.baseUnitId,
					quantityBase: e.quantity
				});
				let a = Mo({
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
			return If = [...If, c], zf(), c;
		},
		reverse(e) {
			if (y(e.date), qe(e.date), N(), !e.reason?.trim() || e.reason.trim().length < 3) throw Error("Reversal reason is required.");
			let t = If.find((t) => t.id === e.id);
			if (!t) throw Error("Opening batch not found.");
			if (t.status === "REVERSED") return t;
			if (e.date < t.date) throw Error("Reversal date precedes cutover.");
			let n = Bf();
			if (n.journals.journalEntries.some((e) => !t.priorJournalIds.includes(e.id) && !t.journalIds.includes(e.id)) || n.inventoryMovements.movements.some((e) => !t.priorMovementIds.includes(e.id) && !t.movementIds.includes(e.id))) throw Error("Subsequent accounting or inventory activity exists. Reverse downstream activity before correcting opening balances.");
			let r = n.sales.invoices.filter((e) => t.invoiceIds.includes(e.id)), i = n.supplierBills.supplierBills.filter((e) => t.billIds.includes(e.id)), a = [...n.customerCredits.creditNotes.filter((e) => t.customerCreditIds.includes(e.id)), ...n.supplierCredits.supplierCredits.filter((e) => t.supplierCreditIds.includes(e.id))];
			if (r.some((e) => e.amountPaid !== 0 || e.amountDue !== e.totals.total) || i.some((e) => e.totals.amountPaid !== 0 || e.totals.amountCredited !== 0) || a.some((e) => e.amountApplied !== 0 || (e.amountRefunded ?? 0) !== 0)) throw Error("Opening balances have allocations or settlements. Reverse downstream allocations before correcting them.");
			for (let e of ["customerSettlements", "supplierRefunds"]) if (JSON.stringify(n[e]).includes(t.id)) throw Error("Opening balances have downstream settlements.");
			for (let e of t.journalIds) Md(e);
			for (let n of t.journalIds) O.reverse({
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
			return n.stock.balances = t.priorStock, n.costBalances.balances = t.priorCost, n.journals = Bf().journals, Vf(n), If = If.map((n) => n.id === t.id ? {
				...n,
				status: "REVERSED",
				reversalDate: e.date,
				reversalReason: e.reason
			} : n), zf(), If.find((e) => e.id === t.id);
		}
	},
	read: "accounting.read",
	commands: {
		preview: "accounting.post",
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ batches: If }),
	restore: (e) => {
		If = e.batches;
	},
	publish: zf,
	validate: (t, n) => {
		let r = l({ batches: c(l({
			id: $,
			operationId: $,
			date: $,
			status: o(["POSTED", "REVERSED"]),
			journalIds: c($),
			invoiceIds: c($),
			billIds: c($),
			customerCreditIds: c($),
			supplierCreditIds: c($),
			fingerprint: e().min(1).max(5e7),
			reason: e().min(3),
			actor: $,
			createdAt: $,
			movementIds: c($),
			costMovementIds: c($),
			priorJournalIds: c($),
			priorMovementIds: c($),
			priorStock: c(l({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: a().finite().nonnegative(),
				updatedAt: $
			}).strict()),
			priorCost: c(l({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: a().finite().nonnegative(),
				averageCostPerBaseUnit: a().finite().nonnegative(),
				inventoryValue: a().finite().nonnegative(),
				costingMethod: i("MOVING_WEIGHTED_AVERAGE"),
				updatedAt: $
			}).strict()),
			reversalDate: $.optional(),
			reversalReason: e().optional()
		}).strict()) }).strict().parse(t);
		for (let e of r.batches) {
			let t = Ff.parse(JSON.parse(e.fingerprint));
			if (t.operationId !== e.operationId || t.date !== e.date) throw Error("Opening import identity is invalid.");
			if (e.status === "REVERSED" && !e.reversalDate) throw Error("Opening reversal date is missing.");
			e.reversalDate && y(e.reversalDate), y(e.date);
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
//#region src/features/purchases/data/supplierPaymentRepository.ts
var Wf = /* @__PURE__ */ new Set(), Gf = T.read().supplierPayments;
T.onRollback(() => {
	Gf = T.read().supplierPayments;
});
function Kf() {
	T.update("supplierPayments", Gf), Wf.forEach((e) => T.notify(e));
}
var qf = {
	subscribe(e) {
		return Wf.add(e), () => {
			Wf.delete(e);
		};
	},
	getSnapshot() {
		return Gf;
	},
	getAll() {
		return Gf;
	},
	getById(e) {
		return Gf.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return Gf.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return Gf.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: Yf(e.reference),
			notes: Yf(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: Xf(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = Gf.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (y(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = ka.getById(e.supplierId);
		if (!r) throw Error("Supplier was not found.");
		if (!e.paymentDate) throw Error("Payment date is required.");
		if (!e.method) throw Error("Payment method is required.");
		if (!e.bankAccountId) throw Error("Bank account is required.");
		let i = tr.getById(e.bankAccountId);
		if (!i) throw Error("Bank account was not found.");
		if (!i.active) throw Error("The selected bank account is inactive.");
		let a = e.allocations.filter((e) => Number.isFinite(e.amount) && e.amount > 0);
		if (a.length === 0) throw Error("Allocate the payment to at least one supplier bill.");
		let o = /* @__PURE__ */ new Set(), s = a.map((t) => {
			if (o.has(t.supplierBillId)) throw Error("A supplier bill cannot appear more than once in the same payment.");
			o.add(t.supplierBillId);
			let n = fs.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = Xf(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${Zf(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), c = Xf(s.reduce((e, t) => e + t.amount, 0));
		if (c <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of s) fs.applyPayment(e.supplierBillId, e.amount);
		let l = (/* @__PURE__ */ new Date()).toISOString(), u = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: Jf(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: c,
			method: e.method,
			bankAccountId: i.id,
			reference: Yf(e.reference),
			notes: Yf(e.notes),
			allocations: s,
			status: "POSTED",
			createdAt: l,
			updatedAt: l
		};
		return Gf = [u, ...Gf], Kf(), no.postSupplierPayment(u), u;
	},
	reverse(e, t) {
		Ie("SUPPLIER_PAYMENT", e);
		let n = Gf.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = fs.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) fs.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return Gf = Gf.map((t) => t.id === e ? a : t), Kf(), no.reverseSupplierPayment(a), a;
	}
};
function Jf(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = Gf.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Yf(e) {
	return e?.trim() || void 0;
}
function Xf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Zf(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: m().currency
	}).format(e);
}
var Qf = qf.create;
qf.create = function(...e) {
	return N(), T.transaction(() => Qf.apply(qf, e));
};
var $f = qf.reverse;
qf.reverse = function(...e) {
	return N(), T.transaction(() => $f.apply(qf, e));
}, g("supplierPayments", {
	repository: qf,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: Gf }),
	restore: (e) => {
		Gf = e.supplierPayments;
	},
	publish: () => Wf.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/paymentBatchRepository.ts
var ep = (e) => Math.round((e + 2 ** -52) * 100) / 100, tp = e().trim().min(1).max(200), np = l({
	operationId: tp,
	paymentDate: tp,
	bankAccountId: tp,
	reference: e().max(500),
	allocations: c(l({
		supplierBillId: tp,
		amount: a().finite().positive().refine((e) => ep(e) === e)
	}).strict()).min(1).max(500)
}).strict(), rp = [], ip = 0, ap = /* @__PURE__ */ new Set(), op = () => {
	ip++, ap.forEach((e) => e());
}, sp = () => {
	let e = S.current();
	if (!e) throw Error("A verified session is required.");
	return e.userId;
};
function cp(e, t) {
	return {
		action: e,
		reason: t,
		actor: sp(),
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function lp(e) {
	let t = rp.find((t) => t.id === e);
	if (!t) throw Error("Payment batch was not found.");
	return t;
}
function up(e) {
	return rp = rp.map((t) => t.id === e.id ? e : t), op(), e;
}
function dp(e) {
	y(e.paymentDate, "Payment date");
	let t = tr.requireById(e.bankAccountId);
	if (!t.active || e.paymentDate < t.openingBalanceDate) throw Error("Invalid paying bank account/date.");
	if (new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length) throw Error("Select each bill only once.");
	for (let t of e.allocations) {
		let n = fs.getById(t.supplierBillId);
		if (!n || n.status === "VOID" || t.amount > n.totals.amountDue || e.paymentDate < n.billDate) throw Error("A bill amount, date or outstanding balance changed. Review the batch.");
	}
}
g("paymentBatches", {
	repository: {
		create(e) {
			let t = np.parse(e), n = JSON.stringify(t), r = rp.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID was used with different batch data.");
				return r;
			}
			dp(t);
			let i = {
				...t,
				id: crypto.randomUUID(),
				fingerprint: n,
				status: "DRAFT",
				createdBy: sp(),
				paymentIds: [],
				history: [cp("Created")]
			};
			return rp = [...rp, i], op(), i;
		},
		approve(e) {
			let t = lp(e);
			if (t.status === "APPROVED") return t;
			if (t.status !== "DRAFT") throw Error("Only a draft batch can be approved.");
			return dp(t), up({
				...t,
				status: "APPROVED",
				approvedBy: sp(),
				history: [...t.history, cp("Approved")]
			});
		},
		post(e) {
			let t = lp(e);
			if (t.status === "POSTED") return t;
			if (t.status !== "APPROVED") throw Error("Approve the batch before recording payments.");
			N(), dp(t);
			let n = /* @__PURE__ */ new Map();
			for (let e of t.allocations) {
				let t = fs.getById(e.supplierBillId);
				n.set(t.supplierId, [...n.get(t.supplierId) ?? [], e]);
			}
			let r = [...n].map(([e, n]) => qf.create({
				operationId: "batch:" + t.id + ":" + e,
				supplierId: e,
				paymentDate: t.paymentDate,
				bankAccountId: t.bankAccountId,
				reference: t.reference,
				method: "BANK_TRANSFER",
				allocations: n
			}));
			return up({
				...t,
				status: "POSTED",
				paymentIds: r.map((e) => e.id),
				history: [...t.history, cp("Payments recorded")]
			});
		},
		cancel(e) {
			let t = lp(e.id);
			if (!["DRAFT", "APPROVED"].includes(t.status) || e.reason?.trim().length < 3) throw Error("Only an unposted batch can be cancelled, with a reason.");
			return up({
				...t,
				status: "CANCELLED",
				history: [...t.history, cp("Cancelled", e.reason)]
			});
		},
		reverse(e) {
			let t = lp(e.id);
			if (t.status === "REVERSED") return t;
			if (t.status !== "POSTED" || e.reason?.trim().length < 3) throw Error("A posted batch and reversal reason are required.");
			N();
			for (let e of t.paymentIds) {
				let t = qf.getById(e);
				if (!t || t.status !== "POSTED") throw Error("Batch payments changed. Inspect before reversing.");
				Ie("SUPPLIER_PAYMENT", e);
			}
			for (let n of t.paymentIds) qf.reverse(n, e.reason);
			return up({
				...t,
				status: "REVERSED",
				history: [...t.history, cp("Reversed", e.reason)]
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
	snapshot: () => ({ batches: rp }),
	restore: (e) => {
		rp = e.batches;
	},
	validate: (t, n) => {
		let r = l({ batches: c(np.extend({
			id: tp,
			fingerprint: e(),
			status: o([
				"DRAFT",
				"APPROVED",
				"POSTED",
				"REVERSED",
				"CANCELLED"
			]),
			createdBy: tp,
			approvedBy: tp.optional(),
			paymentIds: c(tp),
			history: c(l({
				action: tp,
				actor: tp,
				at: tp,
				reason: e().optional()
			}))
		})) }).strict().parse(t), i = n.supplierPayments.supplierPayments;
		for (let e of r.batches) {
			if (!["POSTED", "REVERSED"].includes(e.status)) continue;
			let t = e.paymentIds.map((e) => i.find((t) => t.id === e));
			if (!t.length || t.some((t) => !t || t.bankAccountId !== e.bankAccountId || t.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) || ep(t.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== ep(e.allocations.reduce((e, t) => e + t.amount, 0))) throw Error("Batch payment relationships are invalid.");
			if (e.paymentIds.some((e) => !n.journals.journalEntries.some((t) => t.sourceType === "SUPPLIER_PAYMENT" && t.sourceId === e))) throw Error("A batch payment journal is missing.");
		}
	},
	publish: op
});
//#endregion
//#region src/features/finance-closure/bankStatementRepository.ts
var fp = (e) => Math.round((e + 2 ** -52) * 100) / 100, pp = e().min(1).max(200), mp = [], hp = 0, gp = /* @__PURE__ */ new Set(), _p = () => {
	hp++, gp.forEach((e) => e());
};
function vp(e) {
	let t = tr.requireById(e);
	if (!t.active) throw Error("Select an active bank account.");
	return t;
}
function yp(e) {
	let t = mp.find((t) => t.id === e);
	if (!t) throw Error("Statement line was not found.");
	return t;
}
function bp(e) {
	if (e.status !== "UNMATCHED") throw Error("This line is already processed. Revert it before changing it.");
	let t = vd.getLatestByBankAccount(e.bankAccountId);
	if (t && e.date <= t.statementDate) throw Error("Statement date is already reconciled.");
}
function xp(e) {
	return mp = mp.map((t) => t.id === e.id ? e : t), _p(), e;
}
var Sp = (e, t) => Js(vp(e), O.getAll(), t).transactions, Cp = l({
	date: pp,
	description: e().trim().min(1).max(1e3),
	amount: a().finite().refine((e) => e !== 0 && fp(e) === e, "Enter a non-zero amount in cents"),
	reference: e().max(500).default(""),
	externalId: e().max(200).default("")
}).strict(), wp = {
	importRows(e) {
		let t = l({
			bankAccountId: pp,
			rows: c(Cp).min(1).max(1e4)
		}).strict().parse(e), n = vp(t.bankAccountId), r = 0, i = [...mp], a = [];
		for (let e of t.rows) {
			if (y(e.date, "Statement date"), e.date < n.openingBalanceDate) throw Error("Statement predates the bank opening date.");
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
			let s = vd.getLatestByBankAccount(n.id);
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
		return mp = i, _p(), {
			created: a.length,
			duplicates: r
		};
	},
	importCsv(e) {
		if (typeof e.csv != "string" || e.csv.length > 1e7) throw Error("CSV exceeds the 10 MB limit.");
		let t = yc(e.csv.replace(/^\uFEFF/, "")), n = t.shift()?.map((e) => e.trim().toLowerCase()) ?? [];
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
		return wp.importRows({
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
					l = fp(t - e);
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
		return y(e.asOfDate, "As-of date"), Sp(e.bankAccountId, e.asOfDate).filter((e) => e.journalStatus === "POSTED" && !mp.some((t) => t.ledgerIds.includes(e.id)));
	},
	match(e) {
		let t = yp(e.id);
		if (bp(t), !Array.isArray(e.ledgerIds) || !e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Select unique ledger entries.");
		let n = wp.candidates({
			bankAccountId: t.bankAccountId,
			asOfDate: t.date
		}), r = e.ledgerIds.map((e) => n.find((t) => t.id === e));
		if (r.some((e) => !e) || fp(r.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== t.amount) throw Error("Selected bank entries must match this signed statement amount exactly.");
		return xp({
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
		let t = yp(e.id);
		return (v["bank-rules"] ?? []).filter((e) => e.status === "Active" && e.enabled !== "No").filter((e) => {
			let n = (e.field === "Reference" ? t.reference : e.field === "Description" ? t.description : "").toLowerCase(), r = e.value.toLowerCase();
			return e.operator === "Equals" ? n === r : e.operator === "Starts with" ? n.startsWith(r) : n.includes(r);
		});
	},
	post(e) {
		N();
		let t = yp(e.id), n = JSON.stringify(e.splits);
		if (t.status === "POSTED") {
			if (t.fingerprint !== n) throw Error("Line was already posted with different categorisation.");
			return t;
		}
		bp(t);
		let r = c(l({
			accountId: pp,
			amount: a().finite().positive().refine((e) => fp(e) === e),
			taxCode: pp
		}).strict()).min(1).max(100).parse(e.splits);
		if (fp(r.reduce((e, t) => e + t.amount, 0)) !== Math.abs(t.amount)) throw Error("Split amounts must equal the statement total.");
		let i = vp(t.bankAccountId), o = t.amount < 0, s = r.flatMap((e) => {
			let t = D.requireById(e.accountId);
			if (!t.active || !t.allowManualPosting || !["EXPENSE", "REVENUE"].includes(t.type)) throw Error("Use an active manual expense/revenue account. Payments against AR/AP must be matched to their source documents.");
			let n = ne(e.taxCode), r = fp(e.amount / (1 + n)), i = fp(e.amount - r);
			return [{
				accountId: t.id,
				debit: o ? r : 0,
				credit: o ? 0 : r
			}, ...i ? [{
				accountId: (o ? te(e.taxCode).taxPaidAccountId : te(e.taxCode).taxCollectedAccountId) || D.requireBySystemRole(o ? "GST_RECEIVABLE" : "GST_PAYABLE").id,
				debit: o ? i : 0,
				credit: o ? 0 : i
			}] : []];
		}), u = O.post({
			journalDate: t.date,
			description: t.description,
			reference: t.reference,
			sourceType: "BANK_STATEMENT",
			sourceId: t.id + ":" + t.history.filter((e) => e.action === "Posted").length,
			lines: [{
				accountId: i.glAccountId,
				debit: o ? 0 : t.amount,
				credit: o ? -t.amount : 0
			}, ...s]
		}), d = u.lines.filter((e) => e.accountId === i.glAccountId).map((e) => u.id + ":" + e.id);
		return xp({
			...t,
			status: "POSTED",
			journalEntryId: u.id,
			ledgerIds: d,
			fingerprint: n,
			history: [...t.history, {
				action: "Posted",
				date: (/* @__PURE__ */ new Date()).toISOString()
			}]
		});
	},
	ignore(e) {
		let t = yp(e.id);
		if (bp(t), e.reason?.trim().length < 3) throw Error("Enter an exclusion reason.");
		return xp({
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
		N();
		let t = yp(e.id);
		if (y(e.reversalDate, "Reversal date"), e.reason?.trim().length < 3 || e.reversalDate < t.date) throw Error("Enter a reason and a reversal date on or after the statement line.");
		if (t.status === "UNMATCHED") throw Error("Line is already unmatched.");
		for (let e of t.ledgerIds) Md(e.split(":")[0]);
		let n = vd.getLatestByBankAccount(t.bankAccountId);
		if (n && t.date <= n.statementDate) throw Error("Reconciled statement lines cannot be reverted.");
		return t.status === "POSTED" && t.journalEntryId && O.reverse({
			journalEntryId: t.journalEntryId,
			reversalDate: e.reversalDate,
			reason: e.reason
		}), xp({
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
		if (qe(e.statementDate), N(), y(e.statementDate, "Statement date"), !mp.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate)) throw Error("Import the statement first.");
		if (mp.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate && t.status === "UNMATCHED")) throw Error("Process every statement line before completing reconciliation.");
		let t = mp.filter((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate).flatMap((e) => e.ledgerIds);
		return vd.complete({
			...e,
			clearedTransactionIds: [.../* @__PURE__ */ new Set([...vd.getClearedTransactionIds(e.bankAccountId), ...t])]
		});
	}
}, Tp = l({
	id: pp,
	key: e(),
	bankAccountId: pp,
	date: pp,
	description: e(),
	reference: e(),
	amount: a().finite(),
	externalId: e(),
	status: o([
		"UNMATCHED",
		"MATCHED",
		"POSTED",
		"IGNORED"
	]),
	ledgerIds: c(pp),
	journalEntryId: e().optional(),
	fingerprint: e().optional(),
	history: c(l({
		action: e(),
		date: e(),
		reason: e().optional()
	}))
}).strict();
g("bankStatements", {
	repository: wp,
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
	snapshot: () => ({ lines: mp }),
	restore: (e) => {
		mp = e.lines;
	},
	validate: (e) => {
		c(Tp).parse(e.lines);
	},
	publish: _p
});
//#endregion
//#region src/features/business-workspace/productRepository.ts
var Ep = l({
	id: e().min(1),
	code: o([
		"M2",
		"LM",
		"BOX",
		"PIECE",
		"ROLL",
		"BUCKET",
		"HOUR",
		"JOB"
	]),
	name: e().trim().min(1),
	symbol: e().min(1),
	conversionToBase: a().finite().positive(),
	basePrice: a().finite().nonnegative(),
	isBaseUnit: n(),
	active: n()
}).strict(), Dp = l({
	id: e().min(1),
	sku: e().trim().min(1).max(80),
	name: e().trim().min(1).max(180),
	category: o([
		"Timber",
		"Hybrid",
		"Laminate",
		"Vinyl",
		"Carpet",
		"Accessories",
		"Other"
	]),
	brand: e().optional(),
	collection: e().optional(),
	description: e().optional(),
	status: o(["ACTIVE", "INACTIVE"]),
	baseUnitId: e().min(1),
	units: c(Ep).min(1),
	createdAt: e(),
	updatedAt: e(),
	revision: a().int().nonnegative().optional(),
	itemType: o([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	buyEnabled: n().optional(),
	sellEnabled: n().optional(),
	reorderPoint: a().finite().nonnegative().optional(),
	targetStock: a().finite().nonnegative().optional(),
	wholePacks: n().optional(),
	taxCode: e().min(1).optional()
}).strict(), Op = /* @__PURE__ */ new Set(), kp = [...ar];
function Ap() {
	kp = [...ar], Op.forEach((e) => e());
}
function jp(e, t, n) {
	if (Array.isArray(e)) return e.some((e) => jp(e, t, n));
	if (!e || typeof e != "object") return !1;
	let r = e;
	return r.productId === t && (!n || r.unitId === n) || Object.values(r).some((e) => jp(e, t, n));
}
function Mp(e) {
	let t = c(Dp).parse(e), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.id) || r.has(e.sku.toLowerCase())) throw Error("Duplicate product ID or SKU.");
		if (n.add(e.id), r.add(e.sku.toLowerCase()), !nr(e) && e.buyEnabled !== !1) throw Error("Non-stock/service catalogue items must use expense bills for purchasing.");
		if (!nr(e) && ((e.reorderPoint ?? 0) !== 0 || (e.targetStock ?? 0) !== 0)) throw Error("Non-stock/service items cannot have stock reorder thresholds.");
		if (nr(e) && e.units.some((e) => e.code === "HOUR" || e.code === "JOB")) throw Error("Hour/job units require non-stock or service items.");
		if (new Set(e.units.map((e) => e.id)).size !== e.units.length || e.units.filter((e) => e.isBaseUnit).length !== 1 || !e.units.some((t) => t.id === e.baseUnitId && t.isBaseUnit && t.conversionToBase === 1)) throw Error("A product needs exactly one valid base unit.");
		if ((e.targetStock ?? 0) < (e.reorderPoint ?? 0)) throw Error("Target stock must be at least the reorder point.");
	}
	return t;
}
g("products", {
	validate: (e, t) => {
		let n = Mp(e.products), r = t.workspace_tax_codes.records, i = t.costingPolicies.policies, a = t.stock.balances;
		for (let e of n.filter((e) => !nr(e))) if (i.some((t) => t.productId === e.id && t.active) || a.some((t) => t.productId === e.id && t.quantityOnHand !== 0)) throw Error("Non-stock/service product has inventory activity or active costing.");
		if (n.some((e) => !r.some((t) => t.code === (e.taxCode ?? "GST")))) throw Error("Backup product tax-code reference is invalid.");
	},
	repository: {
		subscribe(e) {
			return Op.add(e), () => {
				Op.delete(e);
			};
		},
		getSnapshot: () => kp,
		getAll: () => ar,
		getById: (e) => ar.find((t) => t.id === e),
		save(e, t) {
			let n = Dp.parse(e), r = ar.find((e) => e.id === n.id);
			if (r && t !== (r.revision ?? 0)) throw Error("Product changed since it was opened. Reload before saving.");
			if (!r && t !== void 0) throw Error("Product no longer exists.");
			if (ne(n.taxCode ?? "GST"), !nr(n) && n.buyEnabled !== !1) throw Error("Non-stock and service catalogue items are sales-only. Use expense/service bills for supplier costs.");
			let i = x();
			if (delete i.products, r) {
				let e = { ...i };
				if (delete e.costingPolicies, (r.itemType ?? "STOCK") !== (n.itemType ?? "STOCK") && jp(e, n.id)) throw Error("A referenced product cannot change item type. Create a new catalogue item.");
				if (r.baseUnitId !== n.baseUnitId && jp(i, n.id)) throw Error("A referenced product cannot change base unit.");
				for (let e of r.units) {
					let t = n.units.find((t) => t.id === e.id);
					if ((!t || t.conversionToBase !== e.conversionToBase || t.code !== e.code) && jp(i, n.id, e.id)) throw Error("A referenced unit conversion cannot be changed or removed. Add a new unit instead.");
				}
			}
			let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
				...n,
				createdAt: r?.createdAt ?? a,
				updatedAt: a,
				revision: (r?.revision ?? 0) + 1
			};
			return Mp([...ar.filter((e) => e.id !== n.id), o]), r ? ar.splice(ar.indexOf(r), 1, o) : ar.push(o), To.ensureProductPolicy(o.id, o.baseUnitId, nr(o)), r && nr(r) !== nr(o) && To.setActive(o.id, nr(o)), Ap(), o;
		}
	},
	read: "inventory.read",
	commands: { save: "inventory.adjust" },
	snapshot: () => ({ products: structuredClone(ar) }),
	restore: (e) => {
		let t = Mp(e.products);
		ar.splice(0, ar.length, ...t), kp = [...ar];
	},
	publish: Ap
});
//#endregion
//#region src/lib/persistence/financialConsistencyAudit.ts
function Np(e) {
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
var Pp = /* @__PURE__ */ new Set(), Fp = T.read().transactions, Ip = T.read().transfers;
T.onRollback(() => {
	let e = T.read();
	Fp = e.transactions, Ip = e.transfers;
});
function Lp() {
	Pp.forEach((e) => T.notify(e));
}
function Rp(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function zp(e) {
	return e?.trim() || void 0;
}
function Bp(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function Vp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Hp(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Up(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var Wp = {
	subscribe(e) {
		return Pp.add(e), () => {
			Pp.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return Fp;
	},
	getTransfersSnapshot() {
		return Ip;
	},
	getTransactions() {
		return Fp;
	},
	getTransfers() {
		return Ip;
	},
	createTransaction(e, t) {
		if (Bp(e.transactionDate), y(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = Vp(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Rp(e.description, "Description"), i = tr.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let a = D.requireById(i.glAccountId);
		if (!a.active) throw Error("The selected bank GL account is inactive.");
		let o = D.requireById(e.offsetAccountId);
		if (!o.active) throw Error("The offset account is inactive.");
		if (!o.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (o.id === a.id) throw Error("Bank and offset accounts must be different.");
		if (tr.getByGlAccountId(o.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let s = Hp("banktxn"), c = Up("BTXN", e.transactionDate, Fp.length + 1), l = t?.trim();
		if (t !== void 0 && !l) throw Error("Operation ID cannot be empty");
		if (l) {
			let t = j.begin(l, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Fp.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			l && j.bindResult(l, s);
			let t = O.post({
				journalDate: e.transactionDate,
				description: r,
				reference: zp(e.reference),
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
				reference: zp(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [u, ...Fp];
			if (T.update("transactions", d), Fp = d, Lp(), l) {
				let e = O.getBySource("BANK_TRANSACTION", s);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Bank GL posting could not be verified uniquely.");
			}
			return u;
		} catch (e) {
			if (l) try {
				j.flagForReview(l, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	},
	createTransfer(e, t) {
		Bp(e.transferDate), y(e.transferDate, "Transfer date");
		let n = Vp(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Rp(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = tr.requireById(e.fromBankAccountId), a = tr.requireById(e.toBankAccountId);
		if (!i.active || !a.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== a.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < a.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let o = D.requireById(i.glAccountId), s = D.requireById(a.glAccountId);
		if (!o.active || !s.active) throw Error("Both bank GL accounts must be active.");
		if (o.id === s.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let c = Hp("banktrf"), l = Up("BTRF", e.transferDate, Ip.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = j.begin(u, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Ip.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			u && j.bindResult(u, c);
			let t = O.post({
				journalDate: e.transferDate,
				description: r,
				reference: zp(e.reference),
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
				reference: zp(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [d, ...Ip];
			if (T.update("transfers", f), Ip = f, Lp(), u) {
				let e = O.getBySource("BANK_TRANSFER", c);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Transfer GL posting could not be verified uniquely.");
			}
			return d;
		} catch (e) {
			if (u) try {
				j.flagForReview(u, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	}
}, Gp = Wp.createTransaction;
Wp.createTransaction = function(e, t) {
	N();
	let n;
	try {
		return n = T.transaction(() => Gp.call(Wp, e, t)), t && j.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = j.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				j.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
};
var Kp = Wp.createTransfer;
Wp.createTransfer = function(e, t) {
	N();
	let n;
	try {
		return n = T.transaction(() => Kp.call(Wp, e, t)), t && j.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = j.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				j.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
}, g("bankTransactions", {
	repository: Wp,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: Fp,
		bankTransfers: Ip
	}),
	restore: (e) => {
		Fp = e.bankTransactions, Ip = e.bankTransfers;
	},
	publish: () => Pp.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function qp() {
	return Np({
		transactions: Wp.getTransactions(),
		transfers: Wp.getTransfers(),
		payments: Vi.getAll(),
		journals: O.getAll(),
		invoices: R.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: P.getAll(),
		supplierBills: fs.getAll(),
		supplierPayments: qf.getAll(),
		supplierCredits: W.getAll()
	});
}
//#endregion
//#region electron/security/periodCloseChecks.ts
function Jp(e) {
	let t = x(), n = [], r = (e, t) => n.push({
		code: e,
		message: t
	});
	e.endDate >= _((/* @__PURE__ */ new Date()).toISOString()) && r("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of j.getUnresolved()) r("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of t.purchaseOperations) e.status !== "POSTED" && r("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of qp()) r(e.code, `${e.entityId}: ${e.message}`);
	let i = {
		accounts: t.accounts.accounts,
		journalEntries: t.journals.journalEntries,
		asOfDate: e.endDate
	}, a = [
		["AR", () => sf({
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
		["AP", () => Cf({
			...i,
			suppliers: t.suppliers.suppliers,
			bills: t.supplierBills.supplierBills,
			payments: t.supplierPayments.supplierPayments,
			credits: t.supplierCredits.supplierCredits,
			creditAllocations: t.supplierCredits.allocations
		})],
		["INVENTORY", () => Af({
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
var Yp = null, Xp = {
	configureTrustedSession(e) {
		Yp = e;
	},
	clear() {
		Yp = null;
	},
	current() {
		return Yp?.() ?? null;
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
}, Zp = "htt.purchasePosting.manualRecoveryAudit.v1";
function Qp() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(Zp) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var $p = Qp();
function em(e) {
	$p.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(Zp, JSON.stringify($p));
	} catch {}
}
g("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return $p.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = M.get(e);
			return Xp.canRecover() && t?.status === "RECOVERY_REQUIRED" && M.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = Xp.requireRecoveryPermission(), n = M.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!M.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				M.recover(e), em({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw em({
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
	snapshot: () => $p,
	restore: (e) => {
		$p.splice(0, $p.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var tm = !1;
function nm() {
	if (tm || (tm = !0, T.wasRestoredOnLoad())) return;
	let e = R.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) Yi.postInvoice(t), t.status === "VOID" && Yi.reverseInvoice(t);
	let t = Vi.getAll();
	for (let e of t) Yi.postPayment(e), e.status === "REVERSED" && Yi.reversePayment(e);
	let n = P.getAll();
	for (let e of n) e.status !== "DRAFT" && (Yi.postCreditNote(e), e.status === "VOID" && Yi.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function rm() {
	let e = qp().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/sales/data/salesManualReviewService.ts
var im = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function am(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = oe("business.command", {
			repository: "salesRecovery",
			method: "recordSalesManualReview",
			args: [e]
		});
		return se(t.view), t.result;
	}
	if (!e.businessRecordChecked || !e.originalGlChecked || !e.reversalGlChecked || !e.balancesChecked) throw Error("Business, original/reversal GL and balances must all be inspected.");
	let t = j.list().find((t) => t.operationId === e.operationId);
	if (!t || !im.has(t.kind)) throw Error("Sales operation not found.");
	if (t.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return j.recordManualReview(e.operationId, e.reference, e.operator, e.summary);
}
//#endregion
//#region src/features/sales/data/salesConsistencyAudit.ts
var om = (e) => Math.round(e * 100);
function sm(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + om(t.amount), 0), s = a.reduce((e, t) => e + om(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (om(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), om(t.amountDue) !== Math.max(0, om(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > om(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + om(t.amount), 0);
		om(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || om(t.amountAvailable) !== 0 : om(t.amountAvailable) !== om(t.totals.total) - a - om(t.amountRefunded ?? 0)) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
var cm = {
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
function lm(e) {
	return sm(e).map((e) => ({
		...e,
		action: cm[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var um = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function dm(e, t) {
	let n = lm(e).map((e) => ({ ...e })), r = t.filter((e) => um.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => um.has(e.kind))) s.has(e.operationId) && n.push({
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
function fm() {
	let e = R.getAll();
	return dm({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Vi.getAll(),
		creditNotes: P.getAll(),
		allocations: P.getAllAllocations(),
		journals: O.getAll()
	}, j.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
var pm = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function mm(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!pm.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = dm(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function hm() {
	let e = R.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Vi.getAll(),
		creditNotes: P.getAll(),
		allocations: P.getAllAllocations(),
		journals: O.getAll()
	};
}
function gm(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = oe("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [e]
		});
		return se(t.view), t.result;
	}
	let t = j.list(), n = mm(hm(), t, e.operationId);
	if (n.length) throw Error(`Sales recovery remains blocked: ${n.join(" ")}`);
	let r = t.find((t) => t.operationId === e.operationId);
	return {
		closed: j.closeReviewed(e.operationId, r.resultId, e.approvalReference, e.approver),
		remaining: fm()
	};
}
//#endregion
//#region electron/security/businessEngine.ts
g("salesRecovery", {
	repository: {
		recordSalesManualReview: am,
		closeVerifiedSalesReview: gm
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
var _m = x();
function vm(e) {
	He(Jp, () => e()?.userId ?? ""), S.connect(e), Xp.configureTrustedSession(e), nm(), rm();
}
//#endregion
export { qe as assertPostingPeriod, vm as initialize, _m as workspaceDefaults };
