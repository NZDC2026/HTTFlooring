import { c as e, d as t, f as n, l as r, m as i, s as a, t as o, u as s } from "./accountingPeriodValidation-9Djbsd6O.js";
import { BrowserWindow as c, app as l, dialog as u, ipcMain as d, nativeImage as f } from "electron";
import { closeSync as p, existsSync as m, fsyncSync as h, mkdirSync as g, openSync as _, readFileSync as v, realpathSync as y, renameSync as b, statSync as x, writeFileSync as S } from "node:fs";
import { createHash as C, createHmac as w, randomBytes as T, randomUUID as E, scryptSync as D, timingSafeEqual as O } from "node:crypto";
import k, { basename as A, dirname as j, isAbsolute as ee, join as M, relative as te, sep as ne } from "node:path";
import { writeFile as re } from "node:fs/promises";
import { fileURLToPath as N } from "node:url";
//#region electron/security/localSecurity.ts
function P(e, t) {
	g(j(e), {
		recursive: !0,
		mode: 448
	});
	let n = `${e}.${E()}.tmp`, r = _(n, "wx", 384);
	try {
		S(r, JSON.stringify(t)), h(r);
	} finally {
		p(r);
	}
	b(n, e);
	let i = _(j(e), "r");
	try {
		h(i);
	} finally {
		p(i);
	}
}
var F = ({ id: e, username: t, displayName: n, roles: r, active: i }) => ({
	id: e,
	username: t,
	displayName: n,
	roles: [...r],
	active: i
});
function I(e) {
	if (typeof e != "string" || !/^[a-z0-9][a-z0-9._-]{2,63}$/.test(e.trim().toLowerCase())) throw Error("Username must contain 3–64 letters, numbers, dots, underscores or hyphens.");
	return e.trim().toLowerCase();
}
function L(e) {
	if (typeof e != "string" || e.length < 12 || e.length > 256) throw Error("Password must contain 12–256 characters.");
	return e;
}
function R(e) {
	if (!Array.isArray(e) || !e.length || !e.every((e) => i.includes(e))) throw Error("Choose at least one valid role.");
	return [...new Set(e)];
}
var z = (e, t) => D(e, t, 64).toString("hex"), B = class {
	state;
	session = null;
	poisoned = !1;
	path;
	save;
	now;
	constructor(e, t = P, n = () => Date.now()) {
		if (this.path = e, this.save = t, this.now = n, m(e)) {
			let t = JSON.parse(v(e, "utf8"));
			if (t?.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(t.auditKey) || !Array.isArray(t.users) || !Array.isArray(t.audit)) throw Error("Invalid local security database; access blocked.");
			let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
			for (let e of t.users) {
				if (!e.id || n.has(e.id) || r.has(e.username) || I(e.username) !== e.username || typeof e.displayName != "string" || typeof e.active != "boolean" || !Number.isFinite(e.failures) || !Number.isFinite(e.lockedUntil) || !/^[a-f0-9]{32}$/.test(e.salt) || !/^[a-f0-9]{128}$/.test(e.passwordHash)) throw Error("Invalid local user data; access blocked.");
				R(e.roles), n.add(e.id), r.add(e.username);
			}
			if (t.users.length && !t.users.some((e) => e.active && e.roles.includes("ADMIN"))) throw Error("No active administrator; access blocked.");
			let i = "";
			for (let e of t.audit) {
				let { hash: n, ...r } = e;
				if (e.previousHash !== i || n !== w("sha256", t.auditKey).update(JSON.stringify(r)).digest("hex")) throw Error("Local audit integrity check failed; access blocked.");
				i = n;
			}
			this.state = t;
		} else this.state = {
			schemaVersion: 1,
			auditKey: T(32).toString("hex"),
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
			id: E(),
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
			hash: w("sha256", this.state.auditKey).update(JSON.stringify(s)).digest("hex")
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
		if (!n(t, e)) throw this.audit("permission.denied", e, "DENIED", e), Error(`Permission denied: ${e}`);
		return this.session.idleUntil = Math.min(this.now() + 18e5, this.session.absoluteUntil), t;
	}
	status() {
		let e = this.principal(), t = e && this.state.users.find((t) => t.id === e.userId), n = t ? {
			user: F(t),
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
		let n = I(e.username), r = L(e.password);
		if (!e.displayName?.trim() || e.displayName.trim().length > 100) throw Error("Display name is required (maximum 100 characters).");
		if (this.state.users.some((e) => e.username === n)) throw Error("Username already exists.");
		let i = T(16).toString("hex"), a = {
			id: E(),
			username: n,
			displayName: e.displayName.trim(),
			roles: R(t),
			active: !0,
			salt: i,
			passwordHash: z(r, i),
			failures: 0,
			lockedUntil: 0
		};
		return this.commit({
			...this.state,
			users: [...this.state.users, a]
		}), this.audit("user.created", a.id, "SUCCESS", "users.manage", void 0, this.principal()?.userId ?? a.id), F(a);
	}
	login(e) {
		this.session = null;
		let t = I(e.username);
		if (typeof e.password != "string" || e.password.length > 256) throw Error("Invalid username or password.");
		let n = this.state.users.find((e) => e.username === t);
		if (n && n.lockedUntil > this.now()) throw Error("Too many login attempts; try again later.");
		let r = Buffer.from(z(e.password, n?.salt ?? "unavailable-account"), "hex"), i = n ? Buffer.from(n.passwordHash, "hex") : Buffer.alloc(64);
		if (!n?.active || !O(r, i)) throw n && this.commit({
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
		return this.require("users.manage"), this.state.users.map(F);
	}
	createUser(e) {
		return this.require("users.manage"), this.addUser(e, e.roles);
	}
	updateUser(e) {
		let t = this.require("users.manage"), n = R(e.roles);
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
		if (typeof e.currentPassword != "string" || e.currentPassword.length > 256 || !O(Buffer.from(z(e.currentPassword, n.salt), "hex"), Buffer.from(n.passwordHash, "hex"))) throw Error("Current password is incorrect.");
		let r = L(e.password), i = T(16).toString("hex");
		this.audit("user.password", n.id, "INTENT"), this.commit({
			...this.state,
			users: this.state.users.map((e) => e.id === n.id ? {
				...e,
				salt: i,
				passwordHash: z(r, i)
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
}, V = (e) => !!e && typeof e == "object" && !Array.isArray(e);
function H(e) {
	let t = {
		schemaVersion: 4,
		savedAt: (/* @__PURE__ */ new Date()).toISOString(),
		storage: e.storage,
		repositories: e.repositories,
		...e.lastCommandId === void 0 ? {} : { lastCommandId: e.lastCommandId }
	};
	return {
		...t,
		checksum: C("sha256").update(JSON.stringify(t)).digest("hex")
	};
}
function U(e) {
	if (Buffer.byteLength(e) > 25e7) throw Error("Business snapshot exceeds 250 MB.");
	let t = JSON.parse(e);
	if (!V(t) || ![
		1,
		2,
		3,
		4
	].includes(t.schemaVersion)) throw Error("Unsupported business snapshot version.");
	if (!V(t.storage) || !Object.entries(t.storage).every(([e, t]) => e.startsWith("htt") && typeof t == "string") || !V(t.repositories) || t.lastCommandId !== void 0 && typeof t.lastCommandId != "string") throw Error("Invalid business snapshot structure.");
	if (t.schemaVersion === 2 || t.schemaVersion === 3 || t.schemaVersion === 4) {
		let { checksum: e, ...n } = t;
		if (typeof t.savedAt != "string" || !Number.isFinite(Date.parse(t.savedAt)) || e !== C("sha256").update(JSON.stringify(n)).digest("hex")) throw Error("Business snapshot checksum failed.");
	}
	return t;
}
function W(e, t) {
	if (JSON.stringify(Object.keys(e).sort()) !== JSON.stringify(Object.keys(t).sort())) throw Error("Business repository schema mismatch; migration required.");
	for (let [n, r] of Object.entries(t)) {
		let t = e[n];
		if (Array.isArray(r)) {
			if (!Array.isArray(t)) throw Error(`Invalid ${n} snapshot.`);
		} else if (!V(t) || JSON.stringify(Object.keys(t).sort()) !== JSON.stringify(Object.keys(r).sort()) || !Object.values(t).every(Array.isArray)) throw Error(`Invalid ${n} snapshot.`);
	}
	e.accountingPeriods && o(e.accountingPeriods.periods);
	for (let t of Object.values(e)) {
		let e = Array.isArray(t) ? [t] : Object.values(t);
		for (let t of e) {
			let e = /* @__PURE__ */ new Set();
			for (let n of t) {
				if (!V(n)) throw Error("Invalid business record.");
				if ("id" in n) {
					if (typeof n.id != "string" || !n.id || e.has(n.id)) throw Error("Invalid or duplicate business record ID.");
					e.add(n.id);
				}
			}
		}
	}
}
function G(e) {
	return e.schemaVersion === 3 || e.schemaVersion === 4 ? !1 : (Object.hasOwn(e.repositories, "accountingPeriods") || (e.repositories.accountingPeriods = { periods: [] }), !0);
}
var K = [
	"products",
	"workspace_tax_codes",
	"workspace_linked_accounts",
	"workspace_promotions",
	"workspace_jobs",
	"workspace_tasks",
	"workspace_bank_rules",
	"workspace_templates",
	"workspace_custom_reports",
	"workspace_report_packs",
	"workspace_settings"
];
function q(e, t) {
	if (e.schemaVersion === 4) return !1;
	for (let n of K) if (!Object.hasOwn(e.repositories, n)) {
		if (!Object.hasOwn(t, n)) throw Error("Workspace contracts are not initialized.");
		e.repositories[n] = structuredClone(t[n]);
	}
	return !0;
}
//#endregion
//#region electron/security/businessHost.ts
var ie = class {
	values = {};
	initialized = !1;
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
	async initialize(n = {}) {
		if (this.blocked) throw Error("Restart the desktop application before reopening business data.");
		if (this.initialized) return;
		if (!this.security.principal()) throw Error("Login required.");
		let r, i;
		if (m(this.path)) i = U(v(this.path, "utf8")), i.schemaVersion !== 4 && (r = structuredClone(i), G(i)), this.values = i.storage;
		else {
			if (this.security.require("users.manage"), !n || typeof n != "object" || Object.keys(n).length > 1e3) throw Error("Invalid legacy local data.");
			for (let [e, t] of Object.entries(n)) if (!e.startsWith("htt") || typeof t != "string" || t.length > 5e7) throw Error("Invalid legacy local data.");
			let e = M(j(this.path), "legacy-profile-backup-v1.json");
			m(e) || P(e, {
				schemaVersion: 1,
				capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
				storage: n
			}), this.values = { ...n }, this.security.audit("business.import", "local-desktop-profile", "INTENT", "users.manage");
		}
		let a = {
			get length() {
				return Object.keys(o.values).length;
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
		}, o = this;
		Object.defineProperty(globalThis, "__HTT_MAIN_HOST__", {
			configurable: !0,
			value: !0
		}), Object.defineProperty(globalThis, "localStorage", {
			configurable: !0,
			value: a
		}), Object.defineProperty(globalThis, "window", {
			configurable: !0,
			value: { localStorage: a }
		});
		let c = await import("./businessEngine-BkDKy24E.js");
		this.workspaceDefaults = c.workspaceDefaults, i && (q(i, this.workspaceDefaults), W(i.repositories, s()), t(i.repositories), e(i.repositories), this.lastCommandId = i.lastCommandId), c.initialize(() => this.security.principal()), this.assertPeriod = c.assertPostingPeriod, r && (P(M(j(this.path), `pre-migration-v${i.schemaVersion}-${E()}.json`), r), this.persist(), this.security.audit("business.migrate.v4", "local-desktop-profile", "SUCCESS", "users.manage")), i || (this.persist(), this.security.audit("business.import", "local-desktop-profile", "SUCCESS", "users.manage"));
		for (let e of this.security.pendingBusinessCommands()) this.security.audit(`recovery.${e.action}`, e.resourceId, e.commandId === this.lastCommandId ? "SUCCESS" : "FAILED", e.permission, e.commandId);
		this.initialized = !0;
	}
	persist(e = this.lastCommandId) {
		P(this.path, H({
			storage: this.values,
			repositories: s(),
			lastCommandId: e
		})), this.lastCommandId = e;
	}
	exportBackup() {
		if (this.security.require("users.manage"), !this.initialized || this.blocked) throw Error("Backup requires healthy initialized business data.");
		let e = U(v(this.path, "utf8"));
		return W(e.repositories, s()), t(e.repositories), H({
			storage: e.storage,
			repositories: e.repositories,
			lastCommandId: e.lastCommandId
		});
	}
	prepareRestore(e) {
		let n = this.security.require("users.manage");
		this.prepared = void 0;
		let r = U(e);
		G(r), this.initialized && (q(r, this.workspaceDefaults), W(r.repositories, s()), t(r.repositories));
		let i = E();
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
		let i = await import("./businessEngine-BkDKy24E.js");
		if (q(r.database, i.workspaceDefaults), W(r.database.repositories, s()), t(r.database.repositories), this.security.require("users.manage").userId !== n.userId) throw Error("Restore session changed.");
		let a = this.security.pendingBusinessCommands();
		if (a.length) {
			let e = U(v(this.path, "utf8"));
			for (let t of a) this.security.audit(`recovery.${t.action}`, t.resourceId, t.commandId === e.lastCommandId ? "SUCCESS" : "FAILED", t.permission, t.commandId);
		}
		let o = E();
		if (this.security.audit("business.restore", "business-data-only", "INTENT", "users.manage", o), m(this.path)) {
			let e = M(j(this.path), "recovery-backups");
			g(e, {
				recursive: !0,
				mode: 448
			});
			let t = _(M(e, `before-restore-${o}.json`), "wx", 384);
			try {
				S(t, v(this.path)), h(t);
			} finally {
				p(t);
			}
			let n = _(e, "r");
			try {
				h(n);
			} finally {
				p(n);
			}
		}
		let c = H({
			storage: r.database.storage,
			repositories: r.database.repositories,
			lastCommandId: o
		});
		this.blocked = !0;
		try {
			P(this.path, c);
		} catch {
			throw Error("Restore commit could not be confirmed. Restart and inspect before retry.");
		}
		this.security.audit("business.restore", "business-data-only", "SUCCESS", "users.manage", o);
	}
	view() {
		let e = this.security.principal();
		if (!e || !this.initialized) throw Error("Login and desktop data initialization required.");
		let t = n(e, "audit.read") ? Object.fromEntries(Object.entries(this.values).filter(([e]) => e === "htt:financial-operations:v1" || e.startsWith("htt.purchasePosting."))) : {};
		return {
			repositories: r(e),
			storage: t
		};
	}
	command(t) {
		if (this.blocked || !this.initialized) throw Error("Business writes blocked; restart and inspect local audit.");
		if (!t || typeof t.repository != "string" || typeof t.method != "string" || !Array.isArray(t.args) || t.args.length > 20) throw Error("Invalid business command.");
		let n;
		try {
			n = a(t.repository, t.method);
		} catch (e) {
			throw this.security.audit("command.denied", `${t.repository}.${t.method}`.slice(0, 200), "DENIED"), e;
		}
		let r = this.security.require(n.permission), i = structuredClone(t.args);
		if ([
			"sales",
			"fulfilments",
			"goodsReceipts",
			"supplierBills",
			"supplierPayments",
			"supplierCredits",
			"bankTransactions",
			"bankReconciliations"
		].includes(t.repository) && i[0] && typeof i[0] == "object") {
			let e = [
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
			], r = i[0];
			try {
				for (let t of e) if (r[t] !== void 0) {
					if (typeof r[t] != "string") throw Error("Invalid posting date.");
					this.assertPeriod(r[t]);
				}
			} catch (e) {
				throw this.security.audit("period.denied", `${t.repository}.${t.method}`, "DENIED", n.permission), e;
			}
		}
		if (t.repository === "journals") {
			let e = i[0];
			if (t.method === "post" && (e?.sourceType !== "MANUAL_JOURNAL" || e.sourceId)) throw Error("System journals must be posted through their business source.");
			if (t.method === "reverse" && s().journals.journalEntries.find((t) => t.id === e?.journalEntryId)?.sourceType !== "MANUAL_JOURNAL") throw Error("System journals must be reversed through their business source.");
		}
		if (t.repository === "salesRecovery" && i[0] && typeof i[0] == "object") {
			let e = i[0];
			t.method === "recordSalesManualReview" && (e.operator = r.userId), t.method === "closeVerifiedSalesReview" && (e.approver = r.userId);
		}
		let o = E(), c = `${t.repository}.${t.method}`, l = typeof i[0] == "string" ? i[0].slice(0, 200) : String(i[0]?.id ?? i[0]?.invoiceId ?? t.repository).slice(0, 200);
		this.security.audit(c, l, "INTENT", n.permission, o);
		let u = s(), d = structuredClone(this.values), f;
		try {
			if (f = n.execute(i), t.repository === "sales" && t.method === "createInvoiceFromOrder" && this.assertPeriod(f.documentDate), f instanceof Promise) throw Error("Business commands must be synchronous.");
		} catch (t) {
			throw this.values = d, e(u), this.security.audit(c, l, "FAILED", n.permission, o), t;
		}
		try {
			this.persist(o);
		} catch (t) {
			throw this.values = d, e(u), this.blocked = !0, Error(`Business commit ${o} could not be confirmed: ${t instanceof Error ? t.message : String(t)}. Restart and review before retry.`);
		}
		try {
			this.security.audit(c, l, "SUCCESS", n.permission, o);
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
function ae(e, t) {
	let n = new B(M(e, "security-v1.json")), r = new ie(M(e, "business-v1.json"), n), i = !1;
	return d.on("security:request", async (a, o, s) => {
		let c = t();
		if (!c || a.sender !== c.webContents || a.senderFrame !== c.webContents.mainFrame) {
			a.returnValue = {
				ok: !1,
				error: "Untrusted desktop sender."
			};
			return;
		}
		if (i) {
			a.returnValue = {
				ok: !1,
				error: "A desktop operation is already running."
			};
			return;
		}
		i = !0;
		try {
			if (typeof o != "string" || JSON.stringify(s ?? null).length > 6e7) throw Error("Invalid desktop request.");
			let t = s ?? {}, i;
			switch (o) {
				case "status":
					i = n.status();
					break;
				case "setup":
					i = n.setup(t);
					break;
				case "login":
					i = n.login(t);
					break;
				case "logout":
					i = n.logout();
					break;
				case "users.list":
					i = n.listUsers();
					break;
				case "users.create":
					i = n.createUser(t);
					break;
				case "users.update":
					i = n.updateUser(t);
					break;
				case "password.change":
					i = n.changePassword(t);
					break;
				case "audit.list":
					i = n.listAudit(t);
					break;
				case "business.bootstrap":
					await r.initialize(t.legacyStorage), i = r.view();
					break;
				case "business.backup.save": {
					n.require("users.manage");
					let t = await u.showSaveDialog(c, {
						title: "Save business backup",
						defaultPath: `HTT-Business-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`,
						filters: [{
							name: "HTT business backup",
							extensions: ["json"]
						}]
					});
					if (t.canceled || !t.filePath) {
						i = { saved: !1 };
						break;
					}
					let a = te(y(e), M(y(j(t.filePath)), A(t.filePath)));
					if (!a || !a.startsWith(".." + ne) && a !== ".." && !ee(a)) throw Error("Choose a backup location outside the active local data directory.");
					let o = r.exportBackup();
					n.audit("business.backup", "business-data-only", "INTENT", "users.manage");
					try {
						P(t.filePath, o);
					} catch (e) {
						throw n.audit("business.backup", "business-data-only", "FAILED", "users.manage"), e;
					}
					n.audit("business.backup", "business-data-only", "SUCCESS", "users.manage"), i = { saved: !0 };
					break;
				}
				case "business.restore.preview": {
					n.require("users.manage");
					let e = await u.showOpenDialog(c, {
						title: "Select business backup",
						properties: ["openFile"],
						filters: [{
							name: "HTT business backup",
							extensions: ["json"]
						}]
					});
					if (e.canceled || !e.filePaths[0]) {
						i = null;
						break;
					}
					if (x(e.filePaths[0]).size > 25e7) throw Error("Backup exceeds 250 MB.");
					i = r.prepareRestore(v(e.filePaths[0], "utf8"));
					break;
				}
				case "business.restore.commit":
					await r.restoreBackup(t.token), i = { restartRequired: !0 };
					break;
				case "business.command":
					i = r.command(t);
					break;
				default: throw Error("Unknown desktop security action.");
			}
			a.returnValue = {
				ok: !0,
				value: i
			};
		} catch (e) {
			a.returnValue = {
				ok: !1,
				error: e instanceof Error ? e.message : "Desktop operation failed."
			};
		} finally {
			i = !1;
		}
	}), { lock: () => {
		try {
			n.principal() && n.logout();
		} catch {}
	} };
}
//#endregion
//#region electron/main/index.ts
var oe = N(import.meta.url), J = k.dirname(oe), Y = "HTT Flooring Management System", X = () => {}, Z = null;
function se(...e) {
	return k.join(J, "..", ...e);
}
function ce() {
	if (process.platform !== "darwin") return;
	let e = se("build", "icon.png"), t = f.createFromPath(e);
	t.isEmpty() || l.dock?.setIcon(t);
}
function le() {
	d.handle("statement:export-pdf", async (e, t) => {
		try {
			let n = c.fromWebContents(e.sender);
			if (!n) return {
				success: !1,
				error: "Unable to resolve the current application window."
			};
			let r = ue(t.defaultFileName), i = await u.showSaveDialog(n, {
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
			return await re(i.filePath, a), {
				success: !0,
				filePath: i.filePath
			};
		} catch (e) {
			return console.error("Failed to export customer statement PDF:", e), {
				success: !1,
				error: e instanceof Error ? e.message : "Unable to export PDF."
			};
		}
	});
}
function ue(e) {
	let t = e.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").replace(/\s+/g, " ").trim() || "Customer Statement";
	return t.toLowerCase().endsWith(".pdf") ? t : `${t}.pdf`;
}
function Q() {
	Z = new c({
		title: Y,
		width: 1440,
		height: 900,
		minWidth: 1100,
		minHeight: 700,
		show: !1,
		backgroundColor: "#f4f1eb",
		webPreferences: {
			preload: k.join(J, "index.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1,
			sandbox: !0
		}
	}), Z.once("ready-to-show", () => {
		Z?.show();
	}), process.env.VITE_DEV_SERVER_URL ? Z.loadURL(process.env.VITE_DEV_SERVER_URL) : Z.loadFile(k.join(J, "../dist/index.html")), Z.webContents.on("did-start-navigation", (e, t, n, r) => {
		r && !n && X();
	}), Z.webContents.on("render-process-gone", () => X()), Z.webContents.setWindowOpenHandler(() => ({ action: "deny" })), Z.webContents.on("will-navigate", (e, t) => {
		let n = new URL(t), r = new URL(Z.webContents.getURL());
		(n.protocol !== r.protocol || n.host !== r.host || n.pathname !== r.pathname) && e.preventDefault();
	}), Z.on("closed", () => {
		X(), Z = null;
	});
}
var $ = l.commandLine.getSwitchValue("user-data-dir");
$ && l.setPath("userData", k.resolve($)), l.requestSingleInstanceLock() || l.quit(), l.on("second-instance", () => {
	Z?.show(), Z?.focus();
}), l.setName(Y), l.whenReady().then(() => {
	ce(), le(), X = ae(k.join(l.getPath("userData"), "local-security"), () => Z).lock, Q(), l.on("activate", () => {
		c.getAllWindows().length === 0 && Q();
	});
}), l.on("window-all-closed", () => {
	process.platform !== "darwin" && l.quit();
});
//#endregion
export {};
