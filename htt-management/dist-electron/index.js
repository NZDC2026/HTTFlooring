import { $ as e, A as t, D as n, F as r, G as i, I as a, M as o, O as s, P as c, U as l, a as u, i as d, j as f, k as ee, n as p, r as m, t as h } from "./businessSnapshot-CJPjG5Tx.js";
import { appendFileSync as te, closeSync as g, existsSync as _, fsyncSync as v, mkdirSync as y, openSync as b, readFileSync as x, realpathSync as S, renameSync as C, statSync as w, writeFileSync as T } from "node:fs";
import E, { basename as D, dirname as O, isAbsolute as k, join as A, relative as j, sep as M } from "node:path";
import { createHash as ne, createHmac as N, randomBytes as P, randomUUID as F, scryptSync as re, timingSafeEqual as I } from "node:crypto";
import { BrowserWindow as L, Menu as R, app as z, dialog as B, ipcMain as V, nativeImage as ie, shell as ae } from "electron";
import { writeFile as oe } from "node:fs/promises";
import { fileURLToPath as se } from "node:url";
//#region electron/main/operationalLog.ts
var ce = /* @__PURE__ */ new Set([
	"start",
	"ready",
	"clean-exit",
	"previous-unclean-exit",
	"renderer-gone",
	"renderer-unresponsive",
	"renderer-responsive",
	"load-failed",
	"startup-failed",
	"main-exception",
	"main-rejection",
	"pdf-export-failed",
	"recurring-stopped"
]), le = class {
	directory;
	session = F();
	available = !0;
	alerts = /* @__PURE__ */ new Set();
	version;
	maxBytes;
	constructor(e, t, n = 262144) {
		this.version = t, this.maxBytes = n, this.directory = A(e, "diagnostics");
		try {
			y(this.directory, {
				recursive: !0,
				mode: 448
			});
			let e = A(this.directory, "session.json");
			if (_(e)) try {
				JSON.parse(x(e, "utf8")).clean !== !0 && this.event("previous-unclean-exit");
			} catch {
				this.event("previous-unclean-exit");
			}
			T(e, JSON.stringify({
				session: this.session,
				clean: !1
			}), { mode: 384 }), this.event("start");
		} catch {
			this.available = !1;
		}
	}
	event(e) {
		if (ce.has(e) && ([
			"previous-unclean-exit",
			"renderer-gone",
			"renderer-unresponsive",
			"load-failed",
			"startup-failed",
			"main-exception",
			"main-rejection",
			"recurring-stopped",
			"pdf-export-failed"
		].includes(e) && this.alerts.add(e), e === "renderer-responsive" && this.alerts.delete("renderer-unresponsive"), this.available)) try {
			let t = A(this.directory, "operations.jsonl");
			if (_(t) && w(t).size >= this.maxBytes) for (let e = 2; e >= 1; e--) {
				let n = e === 1 ? t : `${t}.${e - 1}`;
				_(n) && C(n, `${t}.${e}`);
			}
			te(t, JSON.stringify({
				at: (/* @__PURE__ */ new Date()).toISOString(),
				session: this.session,
				version: /^[0-9]+\.[0-9]+\.[0-9]+(?:-[\w.-]+)?$/.test(this.version) ? this.version : "unknown",
				platform: process.platform,
				arch: process.arch,
				event: e
			}) + "\n", { mode: 384 });
		} catch {
			this.available = !1;
		}
	}
	finish() {
		this.event("clean-exit");
		try {
			T(A(this.directory, "session.json"), JSON.stringify({
				session: this.session,
				clean: !0
			}), { mode: 384 });
		} catch {
			this.available = !1;
		}
	}
	status() {
		return {
			available: this.available,
			alerts: [...this.alerts]
		};
	}
};
//#endregion
//#region electron/security/localSecurity.ts
function H(e, t) {
	y(O(e), {
		recursive: !0,
		mode: 448
	});
	let n = `${e}.${F()}.tmp`, r = b(n, "wx", 384);
	try {
		T(r, JSON.stringify(t)), v(r);
	} finally {
		g(r);
	}
	C(n, e);
	let i = b(O(e), "r");
	try {
		v(i);
	} finally {
		g(i);
	}
}
var U = ({ id: e, username: t, displayName: n, roles: r, active: i }) => ({
	id: e,
	username: t,
	displayName: n,
	roles: [...r],
	active: i
});
function W(e) {
	if (typeof e != "string" || !/^[a-z0-9][a-z0-9._-]{2,63}$/.test(e.trim().toLowerCase())) throw Error("Username must contain 3–64 letters, numbers, dots, underscores or hyphens.");
	return e.trim().toLowerCase();
}
function G(e) {
	if (typeof e != "string" || e.length < 12 || e.length > 256) throw Error("Password must contain 12–256 characters.");
	return e;
}
function K(e) {
	if (!Array.isArray(e) || !e.length || !e.every((e) => i.includes(e))) throw Error("Choose at least one valid role.");
	return [...new Set(e)];
}
var q = (e, t) => re(e, t, 64).toString("hex"), ue = class {
	state;
	session = null;
	poisoned = !1;
	path;
	save;
	now;
	constructor(e, t = H, n = () => Date.now()) {
		if (this.path = e, this.save = t, this.now = n, _(e)) {
			let t = JSON.parse(x(e, "utf8"));
			if (t?.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(t.auditKey) || !Array.isArray(t.users) || !Array.isArray(t.audit)) throw Error("Invalid local security database; access blocked.");
			let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
			for (let e of t.users) {
				if (!e.id || n.has(e.id) || r.has(e.username) || W(e.username) !== e.username || typeof e.displayName != "string" || typeof e.active != "boolean" || !Number.isFinite(e.failures) || !Number.isFinite(e.lockedUntil) || !/^[a-f0-9]{32}$/.test(e.salt) || !/^[a-f0-9]{128}$/.test(e.passwordHash)) throw Error("Invalid local user data; access blocked.");
				K(e.roles), n.add(e.id), r.add(e.username);
			}
			if (t.users.length && !t.users.some((e) => e.active && e.roles.includes("ADMIN"))) throw Error("No active administrator; access blocked.");
			let i = "";
			for (let e of t.audit) {
				let { hash: n, ...r } = e;
				if (e.previousHash !== i || n !== N("sha256", t.auditKey).update(JSON.stringify(r)).digest("hex")) throw Error("Local audit integrity check failed; access blocked.");
				i = n;
			}
			this.state = t;
		} else this.state = {
			schemaVersion: 1,
			auditKey: P(32).toString("hex"),
			users: [],
			audit: []
		};
	}
	commit(e) {
		if (this.poisoned) throw Error("Security storage is unavailable; restart and review required.");
		try {
			this.save(this.path, e), this.state = e;
		} catch (e) {
			throw this.poisoned = !0, this.session = null, e;
		}
	}
	audit(e, t, n, r, i, a = this.principal()?.userId ?? "UNAUTHENTICATED") {
		let o = {
			id: F(),
			timestamp: new Date(this.now()).toISOString(),
			actorId: a,
			action: e,
			permission: r,
			resourceId: t,
			outcome: n,
			commandId: i,
			previousHash: this.state.audit.at(-1)?.hash ?? ""
		}, s = JSON.parse(JSON.stringify(o)), c = {
			...s,
			hash: N("sha256", this.state.auditKey).update(JSON.stringify(s)).digest("hex")
		};
		this.commit({
			...this.state,
			audit: [...this.state.audit, c]
		});
	}
	principal() {
		if (this.poisoned || !this.session) return null;
		let e = this.now(), t = this.state.users.find((e) => e.id === this.session.userId);
		return e >= this.session.idleUntil || e >= this.session.absoluteUntil || !t?.active ? (this.session = null, null) : {
			userId: t.id,
			roles: [...t.roles],
			authenticated: !0
		};
	}
	require(e) {
		let t = this.principal();
		if (!l(t, e)) throw this.audit("permission.denied", e, "DENIED", e), Error(`Permission denied: ${e}`);
		return this.session.idleUntil = Math.min(this.now() + 18e5, this.session.absoluteUntil), t;
	}
	status() {
		let e = this.principal(), t = e && this.state.users.find((t) => t.id === e.userId), n = t ? {
			user: U(t),
			expiresAt: new Date(Math.min(this.session.idleUntil, this.session.absoluteUntil)).toISOString()
		} : null;
		return {
			initialized: this.state.users.length > 0,
			session: n
		};
	}
	setup(e) {
		if (this.state.users.length) throw Error("An administrator is already configured.");
		return this.addUser(e, ["ADMIN"]), this.login(e);
	}
	addUser(e, t) {
		let n = W(e.username), r = G(e.password);
		if (!e.displayName?.trim() || e.displayName.trim().length > 100) throw Error("Display name is required (maximum 100 characters).");
		if (this.state.users.some((e) => e.username === n)) throw Error("Username already exists.");
		let i = P(16).toString("hex"), a = {
			id: F(),
			username: n,
			displayName: e.displayName.trim(),
			roles: K(t),
			active: !0,
			salt: i,
			passwordHash: q(r, i),
			failures: 0,
			lockedUntil: 0
		};
		return this.commit({
			...this.state,
			users: [...this.state.users, a]
		}), this.audit("user.created", a.id, "SUCCESS", "users.manage", void 0, this.principal()?.userId ?? a.id), U(a);
	}
	login(e) {
		this.session = null;
		let t = W(e.username);
		if (typeof e.password != "string" || e.password.length > 256) throw Error("Invalid username or password.");
		let n = this.state.users.find((e) => e.username === t);
		if (n && n.lockedUntil > this.now()) throw Error("Too many login attempts; try again later.");
		let r = Buffer.from(q(e.password, n?.salt ?? "unavailable-account"), "hex"), i = n ? Buffer.from(n.passwordHash, "hex") : Buffer.alloc(64);
		if (!n?.active || !I(r, i)) throw n && this.commit({
			...this.state,
			users: this.state.users.map((e) => e.id === n.id ? {
				...e,
				failures: e.failures + 1,
				lockedUntil: e.failures + 1 >= 5 ? this.now() + 6e4 : 0
			} : e)
		}), this.audit("session.login", t, "DENIED"), Error("Invalid username or password.");
		return this.commit({
			...this.state,
			users: this.state.users.map((e) => e.id === n.id ? {
				...e,
				failures: 0,
				lockedUntil: 0
			} : e)
		}), this.audit("session.login", n.id, "SUCCESS", void 0, void 0, n.id), this.session = {
			userId: n.id,
			idleUntil: this.now() + 18e5,
			absoluteUntil: this.now() + 288e5
		}, this.status();
	}
	logout() {
		return this.audit("session.logout", this.principal()?.userId ?? "", "SUCCESS"), this.session = null, this.status();
	}
	listUsers() {
		return this.require("users.manage"), this.state.users.map(U);
	}
	createUser(e) {
		return this.require("users.manage"), this.addUser(e, e.roles);
	}
	updateUser(e) {
		let t = this.require("users.manage"), n = K(e.roles);
		if (typeof e.active != "boolean" || !this.state.users.some((t) => t.id === e.id)) throw Error("User was not found or active flag is invalid.");
		let r = this.state.users.map((t) => t.id === e.id ? {
			...t,
			roles: n,
			active: e.active
		} : t);
		if (!r.some((e) => e.active && e.roles.includes("ADMIN"))) throw Error("The last active administrator cannot be disabled or demoted.");
		this.audit("user.updated", e.id, "INTENT", "users.manage"), this.commit({
			...this.state,
			users: r
		}), this.audit("user.updated", e.id, "SUCCESS", "users.manage", void 0, t.userId);
	}
	changePassword(e) {
		let t = this.principal();
		if (!t) throw Error("Login required.");
		let n = this.state.users.find((e) => e.id === t.userId);
		if (typeof e.currentPassword != "string" || e.currentPassword.length > 256 || !I(Buffer.from(q(e.currentPassword, n.salt), "hex"), Buffer.from(n.passwordHash, "hex"))) throw Error("Current password is incorrect.");
		let r = G(e.password), i = P(16).toString("hex");
		this.audit("user.password", n.id, "INTENT"), this.commit({
			...this.state,
			users: this.state.users.map((e) => e.id === n.id ? {
				...e,
				salt: i,
				passwordHash: q(r, i)
			} : e)
		}), this.audit("user.password", n.id, "SUCCESS"), this.session = null;
	}
	pendingBusinessCommands() {
		let e = new Set(this.state.audit.filter((e) => e.commandId && (e.outcome === "SUCCESS" || e.outcome === "FAILED")).map((e) => e.commandId));
		return this.state.audit.filter((t) => t.commandId && t.outcome === "INTENT" && !e.has(t.commandId)).map((e) => ({ ...e }));
	}
	listAudit(e = {}) {
		this.require("audit.read");
		let t = Math.max(0, Math.trunc(e.offset ?? 0)), n = Math.max(1, Math.min(100, Math.trunc(e.limit ?? 50)));
		if (!Number.isFinite(t) || !Number.isFinite(n)) throw Error("Invalid audit pagination.");
		let r = String(e.query ?? "").toLowerCase().slice(0, 200), i = this.state.audit.filter((e) => !r || `${e.actorId} ${e.action} ${e.resourceId} ${e.outcome} ${e.commandId ?? ""}`.toLowerCase().includes(r));
		return {
			total: i.length,
			rows: [...i].reverse().slice(t, t + n)
		};
	}
}, de = class {
	values = {};
	initialized = !1;
	automationEngine;
	scanningRecurring = !1;
	workspaceDefaults = {};
	blocked = !1;
	lastCommandId;
	assertPeriod = () => {
		throw Error("Period controls not initialized.");
	};
	prepared;
	path;
	security;
	constructor(e, t) {
		this.path = e, this.security = t;
	}
	async initialize(e = {}) {
		if (this.blocked) throw Error("Restart the desktop application before reopening business data.");
		if (this.initialized) return;
		if (!this.security.principal()) throw Error("Login required.");
		let n, r;
		if (_(this.path)) r = m(x(this.path, "utf8")), r.schemaVersion !== 31 && (n = structuredClone(r), h(r)), this.values = r.storage;
		else {
			if (this.security.require("users.manage"), !e || typeof e != "object" || Object.keys(e).length > 1e3) throw Error("Invalid legacy local data.");
			for (let [t, n] of Object.entries(e)) if (!t.startsWith("htt") || typeof n != "string" || n.length > 5e7) throw Error("Invalid legacy local data.");
			let t = A(O(this.path), "legacy-profile-backup-v1.json");
			_(t) || H(t, {
				schemaVersion: 1,
				capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
				storage: e
			}), this.values = { ...e }, this.security.audit("business.import", "local-desktop-profile", "INTENT", "users.manage");
		}
		let i = {
			get length() {
				return Object.keys(a.values).length;
			},
			key: (e) => Object.keys(this.values)[e] ?? null,
			getItem: (e) => this.values[e] ?? null,
			setItem: (e, t) => {
				this.values[e] = String(t);
			},
			removeItem: (e) => {
				delete this.values[e];
			},
			clear: () => {
				this.values = {};
			}
		}, a = this;
		Object.defineProperty(globalThis, "__HTT_MAIN_HOST__", {
			configurable: !0,
			value: !0
		}), Object.defineProperty(globalThis, "localStorage", {
			configurable: !0,
			value: i
		}), Object.defineProperty(globalThis, "window", {
			configurable: !0,
			value: { localStorage: i }
		});
		let c = await import("./businessEngine-B1U8-lG7.js");
		this.workspaceDefaults = c.workspaceDefaults, r && (p(r, this.workspaceDefaults), u(r.repositories, t()), f(r.repositories), s(r.repositories), this.lastCommandId = r.lastCommandId), c.initialize(() => this.security.principal()), this.automationEngine = c, this.assertPeriod = c.assertPostingPeriod, o(() => {
			if (!this.security.require("users.manage").roles.includes("ADMIN") || !this.initialized || this.blocked) throw Error("Permanent purge requires a healthy ADMIN desktop session.");
			let e = t();
			f(e);
			let n = d({
				storage: structuredClone(this.values),
				repositories: e,
				lastCommandId: this.lastCommandId
			}), r = A(O(this.path), "recycle-backups"), i = F(), a = `pre-purge-${i}.json`;
			y(r, {
				recursive: !0,
				mode: 448
			});
			let o = A(r, a);
			H(o, n);
			let s = x(o, "utf8"), c = m(s);
			if (u(c.repositories, e), f(c.repositories), JSON.stringify(c) !== JSON.stringify(n)) throw Error("Pre-purge backup verification failed.");
			return {
				id: i,
				fileName: a,
				sha256: ne("sha256").update(s).digest("hex"),
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			};
		}), n && (H(A(O(this.path), `pre-migration-v${r.schemaVersion}-${F()}.json`), n), this.persist(), this.security.audit("business.migrate.v9", "local-desktop-profile", "SUCCESS", "users.manage")), r || (this.persist(), this.security.audit("business.import", "local-desktop-profile", "SUCCESS", "users.manage"));
		for (let e of this.security.pendingBusinessCommands()) this.security.audit(`recovery.${e.action}`, e.resourceId, e.commandId === this.lastCommandId ? "SUCCESS" : "FAILED", e.permission, e.commandId);
		this.initialized = !0;
	}
	scanRecurringDue() {
		let e = {
			processed: 0,
			generated: 0,
			failed: 0,
			remaining: 0
		}, t = this.security.principal(), n = this.automationEngine;
		if (this.blocked) throw Error("Business writes blocked; restart and inspect local audit.");
		if (!this.initialized || !t || !n || this.scanningRecurring) return e;
		this.scanningRecurring = !0;
		try {
			for (let r = 0; r < 20; r++) {
				let r = n.dueRecurringCandidates(t)[0];
				if (!r) break;
				let i = r.kind;
				e.processed++;
				try {
					this.command({
						repository: "recurringAutomation",
						method: "execute",
						args: [{
							kind: i,
							id: r.id,
							expectedRevision: r.revision,
							date: r.nextDate
						}]
					}), e.generated++;
				} catch (t) {
					if (this.blocked) throw t;
					let a = n.prepareRecurringFailure(i, r.id, r.nextDate, t instanceof Error ? t.message : "Generation failed.");
					this.command({
						repository: "recurringAutomation",
						method: "recordFailure",
						args: [{ ticket: a }]
					}), e.failed++;
				}
			}
			return e.remaining = n.dueRecurringCandidates(t).length, e;
		} finally {
			this.scanningRecurring = !1;
		}
	}
	persist(e = this.lastCommandId) {
		H(this.path, d({
			storage: this.values,
			repositories: t(),
			lastCommandId: e
		})), this.lastCommandId = e;
	}
	exportBackup() {
		if (this.security.require("users.manage"), !this.initialized || this.blocked) throw Error("Backup requires healthy initialized business data.");
		let e = m(x(this.path, "utf8"));
		return u(e.repositories, t()), f(e.repositories), d({
			storage: e.storage,
			repositories: e.repositories,
			lastCommandId: e.lastCommandId
		});
	}
	prepareRestore(e) {
		let n = this.security.require("users.manage");
		this.prepared = void 0;
		let r = m(e);
		h(r), this.initialized && (p(r, this.workspaceDefaults), u(r.repositories, t()), f(r.repositories));
		let i = F();
		this.prepared = {
			token: i,
			actor: n.userId,
			database: r,
			revision: this.lastCommandId,
			expires: Date.now() + 3e5
		};
		let a = Object.fromEntries(Object.entries(r.repositories).map(([e, t]) => [e, Array.isArray(t) ? t.length : Object.values(t).reduce((e, t) => e + (Array.isArray(t) ? t.length : 0), 0)]));
		return {
			token: i,
			schemaVersion: r.schemaVersion,
			savedAt: r.schemaVersion === 1 ? "Legacy v1" : r.savedAt,
			counts: a
		};
	}
	async restoreBackup(e) {
		let n = this.security.require("users.manage"), r = this.prepared;
		if (this.prepared = void 0, !r || r.token !== e || r.actor !== n.userId || r.revision !== this.lastCommandId || r.expires < Date.now()) throw Error("Restore preview expired; select the backup again.");
		if (Object.defineProperty(globalThis, "__HTT_MAIN_HOST__", {
			configurable: !0,
			value: !0
		}), !this.initialized) {
			let e = /* @__PURE__ */ new Map(), t = {
				getItem: (t) => e.get(t) ?? null,
				setItem: (t, n) => e.set(t, String(n)),
				removeItem: (t) => e.delete(t),
				clear: () => e.clear()
			};
			Object.defineProperty(globalThis, "localStorage", {
				configurable: !0,
				value: t
			}), Object.defineProperty(globalThis, "window", {
				configurable: !0,
				value: { localStorage: t }
			});
		}
		let i = await import("./businessEngine-B1U8-lG7.js");
		if (p(r.database, i.workspaceDefaults), u(r.database.repositories, t()), f(r.database.repositories), this.security.require("users.manage").userId !== n.userId) throw Error("Restore session changed.");
		let a = this.security.pendingBusinessCommands();
		if (a.length) {
			let e = m(x(this.path, "utf8"));
			for (let t of a) this.security.audit(`recovery.${t.action}`, t.resourceId, t.commandId === e.lastCommandId ? "SUCCESS" : "FAILED", t.permission, t.commandId);
		}
		let o = F();
		if (this.security.audit("business.restore", "business-data-only", "INTENT", "users.manage", o), _(this.path)) {
			let e = A(O(this.path), "recovery-backups");
			y(e, {
				recursive: !0,
				mode: 448
			});
			let t = b(A(e, `before-restore-${o}.json`), "wx", 384);
			try {
				T(t, x(this.path)), v(t);
			} finally {
				g(t);
			}
			let n = b(e, "r");
			try {
				v(n);
			} finally {
				g(n);
			}
		}
		let s = d({
			storage: r.database.storage,
			repositories: r.database.repositories,
			lastCommandId: o
		});
		this.blocked = !0;
		try {
			H(this.path, s);
		} catch {
			throw Error("Restore commit could not be confirmed. Restart and inspect before retry.");
		}
		this.security.audit("business.restore", "business-data-only", "SUCCESS", "users.manage", o);
	}
	view() {
		let e = this.security.principal();
		if (!e || !this.initialized) throw Error("Login and desktop data initialization required.");
		let t = l(e, "audit.read") ? Object.fromEntries(Object.entries(this.values).filter(([e]) => e === "htt:financial-operations:v1" || e.startsWith("htt.purchasePosting."))) : {};
		return {
			repositories: ee(e),
			storage: t
		};
	}
	command(e) {
		if (this.blocked || !this.initialized) throw Error("Business writes blocked; restart and inspect local audit.");
		if (!e || typeof e.repository != "string" || typeof e.method != "string" || !Array.isArray(e.args) || e.args.length > 20) throw Error("Invalid business command.");
		let r;
		try {
			r = n(e.repository, e.method);
		} catch (t) {
			throw this.security.audit("command.denied", `${e.repository}.${e.method}`.slice(0, 200), "DENIED"), t;
		}
		let i = this.security.require(r.permission), a = structuredClone(e.args);
		if (this.automationEngine?.assertBankInstructionCommand(e.repository, e.method, a), [
			"sales",
			"fulfilments",
			"goodsReceipts",
			"supplierBills",
			"supplierPayments",
			"supplierCredits",
			"bankTransactions",
			"bankReconciliations"
		].includes(e.repository) && a[0] && typeof a[0] == "object") {
			let t = [
				"paymentDate",
				"creditDate",
				"allocationDate",
				"voidDate",
				"reversalDate",
				"receiptDate",
				"billDate",
				"fulfilmentDate",
				"transactionDate",
				"transferDate",
				"statementDate"
			], n = a[0];
			try {
				for (let e of t) if (n[e] !== void 0) {
					if (typeof n[e] != "string") throw Error("Invalid posting date.");
					this.assertPeriod(n[e]);
				}
			} catch (t) {
				throw this.security.audit("period.denied", `${e.repository}.${e.method}`, "DENIED", r.permission), t;
			}
		}
		if (e.repository === "journals") {
			let n = a[0];
			if (e.method === "post" && (n?.sourceType !== "MANUAL_JOURNAL" || n.sourceId)) throw Error("System journals must be posted through their business source.");
			if (e.method === "reverse" && t().journals.journalEntries.find((e) => e.id === n?.journalEntryId)?.sourceType !== "MANUAL_JOURNAL") throw Error("System journals must be reversed through their business source.");
		}
		if (e.repository === "supplierPayments" && e.method === "reverse" && t().paymentBatches.batches.some((e) => e.status === "POSTED" && e.paymentIds.includes(a[0]))) throw Error("Reverse this supplier payment through its payment batch.");
		if (e.repository === "sales" && e.method === "reverseInvoicePayment" && t().customerSettlements.receipts.some((e) => e.status === "POSTED" && e.paymentIds.includes(a[0]))) throw Error("Reverse this payment through its grouped customer receipt.");
		if (e.repository === "salesRecovery" && a[0] && typeof a[0] == "object") {
			let t = a[0];
			e.method === "recordSalesManualReview" && (t.operator = i.userId), e.method === "closeVerifiedSalesReview" && (t.approver = i.userId);
		}
		if ([
			"voidInvoice",
			"voidCreditNote",
			"void",
			"markVoid",
			"voidCredit"
		].includes(e.method) && [
			"sales",
			"supplierBills",
			"supplierCredits"
		].includes(e.repository)) {
			let e = t(), n = typeof a[0] == "string" ? a[0] : a[0]?.invoiceId ?? a[0]?.creditNoteId ?? a[0]?.supplierCreditId ?? a[0]?.supplierBillId;
			if ([
				...e.sales.invoices,
				...e.customerCredits.creditNotes,
				...e.supplierBills.supplierBills,
				...e.supplierCredits.supplierCredits
			].some((e) => e.id === n && e.openingBalanceImportId)) throw Error("Historical opening documents must be corrected through the opening batch reversal.");
		}
		let o = F(), c = `${e.repository}.${e.method}`, l = typeof a[0] == "string" ? a[0].slice(0, 200) : String(a[0]?.id ?? a[0]?.invoiceId ?? e.repository).slice(0, 200);
		this.security.audit(c, l, "INTENT", r.permission, o);
		let u = t(), d = structuredClone(this.values), f;
		try {
			if (f = r.execute(a), e.repository === "bankStatements" && ["importRows", "importCsv"].includes(e.method)) {
				let e = new Set(u.bankStatements.lines.map((e) => e.id)), n = t().bankStatements.lines.filter((t) => !e.has(t.id)).map((e) => e.id);
				this.automationEngine?.classifyImportedBankLines(n, o);
			}
			if (e.repository === "sales" && e.method === "createInvoiceFromOrder" && this.assertPeriod(f.documentDate), f instanceof Promise) throw Error("Business commands must be synchronous.");
		} catch (e) {
			throw this.values = d, s(u), this.security.audit(c, l, "FAILED", r.permission, o), e;
		}
		try {
			this.persist(o);
		} catch (e) {
			throw this.values = d, s(u), this.blocked = !0, Error(`Business commit ${o} could not be confirmed: ${e instanceof Error ? e.message : String(e)}. Restart and review before retry.`);
		}
		try {
			this.security.audit(c, l, "SUCCESS", r.permission, o);
		} catch {
			throw this.blocked = !0, Error(`Business command ${o} committed, but final audit confirmation failed. Do not repeat it; restart and review.`);
		}
		return {
			result: f,
			view: this.view()
		};
	}
};
//#endregion
//#region electron/security/registerSecurityIpc.ts
function fe(t, n, i = () => {}) {
	e(A(z.isPackaged ? process.resourcesPath : z.getAppPath(), z.isPackaged ? "ocr" : "dist-ocr", "htt-ocr"));
	let o = new ue(A(t, "security-v1.json")), s = new de(A(t, "business-v1.json"), o), l = !1;
	V.on("security:request", async (e, i, u) => {
		let d = n();
		if (!d || e.sender !== d.webContents || e.senderFrame !== d.webContents.mainFrame) {
			e.returnValue = {
				ok: !1,
				error: "Untrusted desktop sender."
			};
			return;
		}
		if (l) {
			e.returnValue = {
				ok: !1,
				error: "A desktop operation is already running."
			};
			return;
		}
		l = !0;
		try {
			if (typeof i != "string" || JSON.stringify(u ?? null).length > 6e7) throw Error("Invalid desktop request.");
			let n = u ?? {}, l;
			switch (i) {
				case "status":
					l = o.status();
					break;
				case "setup":
					l = o.setup(n);
					break;
				case "login":
					l = o.login(n);
					break;
				case "logout":
					l = o.logout();
					break;
				case "users.list":
					l = o.listUsers();
					break;
				case "users.create":
					l = o.createUser(n);
					break;
				case "users.update":
					l = o.updateUser(n);
					break;
				case "password.change":
					l = o.changePassword(n);
					break;
				case "audit.list":
					l = o.listAudit(n);
					break;
				case "business.bootstrap":
					await s.initialize(n.legacyStorage), s.scanRecurringDue(), l = s.view();
					break;
				case "business.backup.save": {
					o.require("users.manage");
					let e = await B.showSaveDialog(d, {
						title: "Save business backup",
						defaultPath: `HTT-Business-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`,
						filters: [{
							name: "HTT business backup",
							extensions: ["json"]
						}]
					});
					if (e.canceled || !e.filePath) {
						l = { saved: !1 };
						break;
					}
					let n = j(S(t), A(S(O(e.filePath)), D(e.filePath)));
					if (!n || !n.startsWith(".." + M) && n !== ".." && !k(n)) throw Error("Choose a backup location outside the active local data directory.");
					let r = s.exportBackup();
					o.audit("business.backup", "business-data-only", "INTENT", "users.manage");
					try {
						H(e.filePath, r);
					} catch (e) {
						throw o.audit("business.backup", "business-data-only", "FAILED", "users.manage"), e;
					}
					o.audit("business.backup", "business-data-only", "SUCCESS", "users.manage"), l = { saved: !0 };
					break;
				}
				case "business.restore.preview": {
					o.require("users.manage");
					let e = await B.showOpenDialog(d, {
						title: "Select business backup",
						properties: ["openFile"],
						filters: [{
							name: "HTT business backup",
							extensions: ["json"]
						}]
					});
					if (e.canceled || !e.filePaths[0]) {
						l = null;
						break;
					}
					if (w(e.filePaths[0]).size > 25e7) throw Error("Backup exceeds 250 MB.");
					l = s.prepareRestore(x(e.filePaths[0], "utf8"));
					break;
				}
				case "business.restore.commit":
					await s.restoreBackup(n.token), l = { restartRequired: !0 };
					break;
				case "capture.select": {
					if (o.require("purchases.bill"), Object.keys(n).some((e) => e !== "operationId") || typeof n.operationId != "string" || !n.operationId || n.operationId.length > 200) throw Error("Invalid recognition request.");
					let e = await B.showOpenDialog(d, {
						title: "Recognize supplier original locally (10 MB maximum)",
						properties: ["openFile"],
						filters: [{
							name: "Supplier originals",
							extensions: [
								"pdf",
								"png",
								"jpg",
								"jpeg"
							]
						}]
					});
					if (e.canceled || !e.filePaths[0]) {
						l = {};
						break;
					}
					let t = a(e.filePaths[0]), r = s.command({
						repository: "captureSources",
						method: "recognize",
						args: [{
							operationId: n.operationId,
							file: {
								name: D(e.filePaths[0]),
								content: t.toString("base64")
							}
						}]
					});
					l = {
						source: r.result,
						view: r.view
					};
					break;
				}
				case "capture.export": {
					if (o.require("purchases.bill"), Object.keys(n).some((e) => e !== "id") || typeof n.id != "string") throw Error("Invalid source export request.");
					let e = s.command({
						repository: "captureSources",
						method: "read",
						args: [n.id]
					}).result, i = await B.showSaveDialog(d, {
						title: "Export preserved original",
						defaultPath: e.name
					});
					if (i.canceled || !i.filePath) {
						l = { saved: !1 };
						break;
					}
					let a = j(S(t), A(S(O(i.filePath)), D(i.filePath)));
					if (!a || !a.startsWith(".." + M) && a !== ".." && !k(a)) throw Error("Choose an export location outside the active local data directory.");
					o.audit("capture.export", n.id, "INTENT", "purchases.bill");
					try {
						let e = s.command({
							repository: "captureSources",
							method: "read",
							args: [n.id]
						}).result;
						c(i.filePath, r(e));
					} catch (e) {
						throw o.audit("capture.export", n.id, "FAILED", "purchases.bill"), e;
					}
					o.audit("capture.export", n.id, "SUCCESS", "purchases.bill"), l = { saved: !0 };
					break;
				}
				case "attachments.select": {
					o.require("inventory.read"), s.command({
						repository: "attachments",
						method: "checkTarget",
						args: [n.target]
					});
					let e = await B.showOpenDialog(d, {
						title: "Select attachment file (maximum 10 MB)",
						properties: ["openFile"],
						filters: [{
							name: "Business files",
							extensions: [
								"pdf",
								"png",
								"jpg",
								"jpeg",
								"csv",
								"txt",
								"docx",
								"xlsx"
							]
						}]
					});
					if (e.canceled || !e.filePaths[0]) {
						l = { saved: !1 };
						break;
					}
					let t = a(e.filePaths[0]);
					l = {
						saved: !0,
						...s.command({
							repository: "attachments",
							method: "upload",
							args: [{
								...n,
								file: {
									name: D(e.filePaths[0]),
									content: t.toString("base64")
								}
							}]
						})
					};
					break;
				}
				case "attachments.export": {
					o.require("inventory.read");
					let e = s.command({
						repository: "attachments",
						method: "read",
						args: [n]
					}).result, i = await B.showSaveDialog(d, {
						title: "Export attachment version",
						defaultPath: e.name
					});
					if (i.canceled || !i.filePath) {
						l = { saved: !1 };
						break;
					}
					let a = j(S(t), A(S(O(i.filePath)), D(i.filePath)));
					if (!a || !a.startsWith(".." + M) && a !== ".." && !k(a)) throw Error("Choose an export location outside the active local data directory.");
					o.audit("attachments.export", String(n.id) + "/" + String(n.versionId), "INTENT", "inventory.read");
					try {
						let e = s.command({
							repository: "attachments",
							method: "read",
							args: [n]
						}).result;
						c(A(S(O(i.filePath)), D(i.filePath)), r(e));
					} catch (e) {
						throw o.audit("attachments.export", String(n.id) + "/" + String(n.versionId), "FAILED", "inventory.read"), e;
					}
					o.audit("attachments.export", String(n.id) + "/" + String(n.versionId), "SUCCESS", "inventory.read"), l = { saved: !0 };
					break;
				}
				case "business.recurring.scan":
					if (o.require("inventory.read"), Object.keys(n).length) throw Error("Recurring scan does not accept caller dates, actors or limits.");
					l = {
						result: s.scanRecurringDue(),
						view: s.view()
					};
					break;
				case "business.command":
					l = s.command(n);
					break;
				default: throw Error("Unknown desktop security action.");
			}
			e.returnValue = {
				ok: !0,
				value: l
			};
		} catch (t) {
			e.returnValue = {
				ok: !1,
				error: t instanceof Error ? t.message : "Desktop operation failed."
			};
		} finally {
			l = !1;
		}
	});
	let u = !1, d = setInterval(() => {
		if (!(l || u)) {
			l = !0;
			try {
				s.scanRecurringDue();
			} catch {
				u = !0, i();
			} finally {
				l = !1;
			}
		}
	}, 6e4);
	return d.unref(), {
		dispose: () => clearInterval(d),
		lock: () => {
			try {
				o.principal() && o.logout();
			} catch {}
		}
	};
}
//#endregion
//#region electron/main/index.ts
var pe = se(import.meta.url), J = E.dirname(pe), Y = "HTT Flooring Management System", X, Z = () => {}, Q = null;
function me(...e) {
	return E.join(J, "..", ...e);
}
function he() {
	if (process.platform !== "darwin") return;
	let e = me("build", "icon.png"), t = ie.createFromPath(e);
	t.isEmpty() || z.dock?.setIcon(t);
}
function ge() {
	V.handle("statement:export-pdf", async (e, t) => {
		try {
			let n = L.fromWebContents(e.sender);
			if (!n) return {
				success: !1,
				error: "Unable to resolve the current application window."
			};
			let r = _e(t.defaultFileName), i = await B.showSaveDialog(n, {
				title: "Export Customer Statement",
				defaultPath: r,
				filters: [{
					name: "PDF Document",
					extensions: ["pdf"]
				}],
				properties: ["createDirectory", "showOverwriteConfirmation"]
			});
			if (i.canceled || !i.filePath) return {
				success: !1,
				canceled: !0
			};
			let a = await e.sender.printToPDF({
				pageSize: "A4",
				printBackground: !0,
				preferCSSPageSize: !0
			});
			return await oe(i.filePath, a), {
				success: !0,
				filePath: i.filePath
			};
		} catch (e) {
			return X?.event("pdf-export-failed"), {
				success: !1,
				error: e instanceof Error ? e.message : "Unable to export PDF."
			};
		}
	});
}
function _e(e) {
	let t = e.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").replace(/\s+/g, " ").trim() || "Customer Statement";
	return t.toLowerCase().endsWith(".pdf") ? t : `${t}.pdf`;
}
function $() {
	let e = z.commandLine.hasSwitch("user-data-dir") && z.commandLine.getSwitchValue("acceptance-window") === "compact";
	Q = new L({
		title: Y,
		width: e ? 1100 : 1440,
		height: e ? 700 : 900,
		minWidth: 1100,
		minHeight: 700,
		show: !1,
		backgroundColor: "#f4f1eb",
		webPreferences: {
			preload: E.join(J, "index.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1,
			sandbox: !0
		}
	}), Q.once("ready-to-show", () => {
		Q?.show();
	}), process.env.VITE_DEV_SERVER_URL ? Q.loadURL(process.env.VITE_DEV_SERVER_URL) : Q.loadFile(E.join(J, "../dist/index.html")), Q.webContents.on("did-start-navigation", (e, t, n, r) => {
		r && !n && Z();
	}), Q.webContents.on("render-process-gone", () => {
		Z(), X?.event("renderer-gone");
	}), Q.on("unresponsive", () => {
		Z(), X?.event("renderer-unresponsive");
	}), Q.on("responsive", () => X?.event("renderer-responsive")), Q.webContents.on("did-fail-load", (e, t, n, r, i) => {
		i && t !== -3 && X?.event("load-failed");
	}), Q.webContents.setWindowOpenHandler(() => ({ action: "deny" })), Q.webContents.on("will-navigate", (e, t) => {
		let n = new URL(t), r = new URL(Q.webContents.getURL());
		(n.protocol !== r.protocol || n.host !== r.host || n.pathname !== r.pathname) && e.preventDefault();
	}), Q.on("closed", () => {
		Z(), Q = null;
	});
}
var ve = z.commandLine.getSwitchValue("user-data-dir");
ve && z.setPath("userData", E.resolve(ve)), z.requestSingleInstanceLock() ? (X = new le(z.getPath("userData"), z.getVersion()), process.on("uncaughtException", () => {
	X?.event("main-exception"), Z(), z.exit(1);
}), process.on("unhandledRejection", () => {
	X?.event("main-rejection"), Z(), z.exit(1);
}), z.on("will-quit", () => X?.finish())) : z.quit(), z.on("second-instance", () => {
	Q?.show(), Q?.focus();
}), z.setName(Y), z.whenReady().then(() => {
	he(), ge(), Z = fe(E.join(z.getPath("userData"), "local-security"), () => Q, () => X?.event("recurring-stopped")).lock, R.setApplicationMenu(R.buildFromTemplate([
		...process.platform === "darwin" ? [{ role: "appMenu" }] : [],
		{ role: "fileMenu" },
		{ role: "editMenu" },
		{ role: "viewMenu" },
		{ role: "windowMenu" },
		{
			role: "help",
			submenu: [{
				label: "Local diagnostics…",
				click: async () => {
					let e = X?.status();
					(await B.showMessageBox({
						type: "info",
						title: "Local diagnostics",
						message: `HTT Flooring ${z.getVersion()}`,
						detail: `Local diagnostics: ${e?.available ? "available" : "unavailable"}\nSession alerts: ${e?.alerts.join(", ") || "none"}\n\nNo business records, passwords, error text or document contents are logged. No telemetry is sent. Business audit remains in Security settings.`,
						buttons: ["Close", "Open log folder"]
					})).response === 1 && X && await ae.openPath(X.directory);
				}
			}]
		}
	])), $(), X?.event("ready"), z.on("activate", () => {
		L.getAllWindows().length === 0 && $();
	});
}).catch(() => {
	X?.event("startup-failed"), B.showErrorBox("HTT Flooring could not start", "Restart the application. If the problem continues, inspect the local diagnostics folder in the application profile. Business files have not been reset."), z.exit(1);
}), z.on("window-all-closed", () => {
	process.platform !== "darwin" && z.quit();
});
//#endregion
export {};
