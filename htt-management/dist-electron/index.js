import { c as e, d as t, l as n, p as r, s as i, t as a, u as o } from "./accountingPeriodValidation-BVAaxZv4.js";
import { BrowserWindow as s, app as c, dialog as l, ipcMain as u, nativeImage as d } from "electron";
import { closeSync as f, existsSync as p, fsyncSync as m, mkdirSync as h, openSync as g, readFileSync as _, realpathSync as v, renameSync as y, statSync as b, writeFileSync as x } from "node:fs";
import { createHash as S, createHmac as C, randomBytes as w, randomUUID as T, scryptSync as E, timingSafeEqual as D } from "node:crypto";
import O, { basename as k, dirname as A, isAbsolute as j, join as M, relative as N, sep as ee } from "node:path";
import { writeFile as te } from "node:fs/promises";
import { fileURLToPath as P } from "node:url";
//#region electron/security/localSecurity.ts
function F(e, t) {
	h(A(e), {
		recursive: !0,
		mode: 448
	});
	let n = `${e}.${T()}.tmp`, r = g(n, "wx", 384);
	try {
		x(r, JSON.stringify(t)), m(r);
	} finally {
		f(r);
	}
	y(n, e);
	let i = g(A(e), "r");
	try {
		m(i);
	} finally {
		f(i);
	}
}
var I = ({ id: e, username: t, displayName: n, roles: r, active: i }) => ({
	id: e,
	username: t,
	displayName: n,
	roles: [...r],
	active: i
});
function L(e) {
	if (typeof e != "string" || !/^[a-z0-9][a-z0-9._-]{2,63}$/.test(e.trim().toLowerCase())) throw Error("Username must contain 3–64 letters, numbers, dots, underscores or hyphens.");
	return e.trim().toLowerCase();
}
function R(e) {
	if (typeof e != "string" || e.length < 12 || e.length > 256) throw Error("Password must contain 12–256 characters.");
	return e;
}
function z(e) {
	if (!Array.isArray(e) || !e.length || !e.every((e) => r.includes(e))) throw Error("Choose at least one valid role.");
	return [...new Set(e)];
}
var B = (e, t) => E(e, t, 64).toString("hex"), V = class {
	state;
	session = null;
	poisoned = !1;
	path;
	save;
	now;
	constructor(e, t = F, n = () => Date.now()) {
		if (this.path = e, this.save = t, this.now = n, p(e)) {
			let t = JSON.parse(_(e, "utf8"));
			if (t?.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(t.auditKey) || !Array.isArray(t.users) || !Array.isArray(t.audit)) throw Error("Invalid local security database; access blocked.");
			let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
			for (let e of t.users) {
				if (!e.id || n.has(e.id) || r.has(e.username) || L(e.username) !== e.username || typeof e.displayName != "string" || typeof e.active != "boolean" || !Number.isFinite(e.failures) || !Number.isFinite(e.lockedUntil) || !/^[a-f0-9]{32}$/.test(e.salt) || !/^[a-f0-9]{128}$/.test(e.passwordHash)) throw Error("Invalid local user data; access blocked.");
				z(e.roles), n.add(e.id), r.add(e.username);
			}
			if (t.users.length && !t.users.some((e) => e.active && e.roles.includes("ADMIN"))) throw Error("No active administrator; access blocked.");
			let i = "";
			for (let e of t.audit) {
				let { hash: n, ...r } = e;
				if (e.previousHash !== i || n !== C("sha256", t.auditKey).update(JSON.stringify(r)).digest("hex")) throw Error("Local audit integrity check failed; access blocked.");
				i = n;
			}
			this.state = t;
		} else this.state = {
			schemaVersion: 1,
			auditKey: w(32).toString("hex"),
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
			id: T(),
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
			hash: C("sha256", this.state.auditKey).update(JSON.stringify(s)).digest("hex")
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
		let n = this.principal();
		if (!t(n, e)) throw this.audit("permission.denied", e, "DENIED", e), Error(`Permission denied: ${e}`);
		return this.session.idleUntil = Math.min(this.now() + 18e5, this.session.absoluteUntil), n;
	}
	status() {
		let e = this.principal(), t = e && this.state.users.find((t) => t.id === e.userId), n = t ? {
			user: I(t),
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
		let n = L(e.username), r = R(e.password);
		if (!e.displayName?.trim() || e.displayName.trim().length > 100) throw Error("Display name is required (maximum 100 characters).");
		if (this.state.users.some((e) => e.username === n)) throw Error("Username already exists.");
		let i = w(16).toString("hex"), a = {
			id: T(),
			username: n,
			displayName: e.displayName.trim(),
			roles: z(t),
			active: !0,
			salt: i,
			passwordHash: B(r, i),
			failures: 0,
			lockedUntil: 0
		};
		return this.commit({
			...this.state,
			users: [...this.state.users, a]
		}), this.audit("user.created", a.id, "SUCCESS", "users.manage", void 0, this.principal()?.userId ?? a.id), I(a);
	}
	login(e) {
		this.session = null;
		let t = L(e.username);
		if (typeof e.password != "string" || e.password.length > 256) throw Error("Invalid username or password.");
		let n = this.state.users.find((e) => e.username === t);
		if (n && n.lockedUntil > this.now()) throw Error("Too many login attempts; try again later.");
		let r = Buffer.from(B(e.password, n?.salt ?? "unavailable-account"), "hex"), i = n ? Buffer.from(n.passwordHash, "hex") : Buffer.alloc(64);
		if (!n?.active || !D(r, i)) throw n && this.commit({
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
		return this.require("users.manage"), this.state.users.map(I);
	}
	createUser(e) {
		return this.require("users.manage"), this.addUser(e, e.roles);
	}
	updateUser(e) {
		let t = this.require("users.manage"), n = z(e.roles);
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
		if (typeof e.currentPassword != "string" || e.currentPassword.length > 256 || !D(Buffer.from(B(e.currentPassword, n.salt), "hex"), Buffer.from(n.passwordHash, "hex"))) throw Error("Current password is incorrect.");
		let r = R(e.password), i = w(16).toString("hex");
		this.audit("user.password", n.id, "INTENT"), this.commit({
			...this.state,
			users: this.state.users.map((e) => e.id === n.id ? {
				...e,
				salt: i,
				passwordHash: B(r, i)
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
}, H = (e) => !!e && typeof e == "object" && !Array.isArray(e);
function U(e) {
	let t = {
		schemaVersion: 3,
		savedAt: (/* @__PURE__ */ new Date()).toISOString(),
		storage: e.storage,
		repositories: e.repositories,
		...e.lastCommandId === void 0 ? {} : { lastCommandId: e.lastCommandId }
	};
	return {
		...t,
		checksum: S("sha256").update(JSON.stringify(t)).digest("hex")
	};
}
function W(e) {
	if (Buffer.byteLength(e) > 25e7) throw Error("Business snapshot exceeds 250 MB.");
	let t = JSON.parse(e);
	if (!H(t) || ![
		1,
		2,
		3
	].includes(t.schemaVersion)) throw Error("Unsupported business snapshot version.");
	if (!H(t.storage) || !Object.entries(t.storage).every(([e, t]) => e.startsWith("htt") && typeof t == "string") || !H(t.repositories) || t.lastCommandId !== void 0 && typeof t.lastCommandId != "string") throw Error("Invalid business snapshot structure.");
	if (t.schemaVersion === 2 || t.schemaVersion === 3) {
		let { checksum: e, ...n } = t;
		if (typeof t.savedAt != "string" || !Number.isFinite(Date.parse(t.savedAt)) || e !== S("sha256").update(JSON.stringify(n)).digest("hex")) throw Error("Business snapshot checksum failed.");
	}
	return t;
}
function G(e, t) {
	if (JSON.stringify(Object.keys(e).sort()) !== JSON.stringify(Object.keys(t).sort())) throw Error("Business repository schema mismatch; migration required.");
	for (let [n, r] of Object.entries(t)) {
		let t = e[n];
		if (Array.isArray(r)) {
			if (!Array.isArray(t)) throw Error(`Invalid ${n} snapshot.`);
		} else if (!H(t) || JSON.stringify(Object.keys(t).sort()) !== JSON.stringify(Object.keys(r).sort()) || !Object.values(t).every(Array.isArray)) throw Error(`Invalid ${n} snapshot.`);
	}
	e.accountingPeriods && a(e.accountingPeriods.periods);
	for (let t of Object.values(e)) {
		let e = Array.isArray(t) ? [t] : Object.values(t);
		for (let t of e) {
			let e = /* @__PURE__ */ new Set();
			for (let n of t) {
				if (!H(n)) throw Error("Invalid business record.");
				if ("id" in n) {
					if (typeof n.id != "string" || !n.id || e.has(n.id)) throw Error("Invalid or duplicate business record ID.");
					e.add(n.id);
				}
			}
		}
	}
}
function K(e) {
	return e.schemaVersion !== 3 && (Object.hasOwn(e.repositories, "accountingPeriods") || (e.repositories.accountingPeriods = { periods: [] }), !0);
}
//#endregion
//#region electron/security/businessHost.ts
var q = class {
	values = {};
	initialized = !1;
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
	async initialize(t = {}) {
		if (this.blocked) throw Error("Restart the desktop application before reopening business data.");
		if (this.initialized) return;
		if (!this.security.principal()) throw Error("Login required.");
		let n, r;
		if (p(this.path)) r = W(_(this.path, "utf8")), r.schemaVersion !== 3 && (n = structuredClone(r), K(r)), this.values = r.storage;
		else {
			if (this.security.require("users.manage"), !t || typeof t != "object" || Object.keys(t).length > 1e3) throw Error("Invalid legacy local data.");
			for (let [e, n] of Object.entries(t)) if (!e.startsWith("htt") || typeof n != "string" || n.length > 5e7) throw Error("Invalid legacy local data.");
			let e = M(A(this.path), "legacy-profile-backup-v1.json");
			p(e) || F(e, {
				schemaVersion: 1,
				capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
				storage: t
			}), this.values = { ...t }, this.security.audit("business.import", "local-desktop-profile", "INTENT", "users.manage");
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
		let s = await import("./businessEngine-DfsOZpVe.js");
		r && (G(r.repositories, o()), e(r.repositories), this.lastCommandId = r.lastCommandId), s.initialize(() => this.security.principal()), this.assertPeriod = s.assertPostingPeriod, n && (F(M(A(this.path), `pre-migration-v${r.schemaVersion}-${T()}.json`), n), this.persist(), this.security.audit("business.migrate.v3", "local-desktop-profile", "SUCCESS", "users.manage")), r || (this.persist(), this.security.audit("business.import", "local-desktop-profile", "SUCCESS", "users.manage"));
		for (let e of this.security.pendingBusinessCommands()) this.security.audit(`recovery.${e.action}`, e.resourceId, e.commandId === this.lastCommandId ? "SUCCESS" : "FAILED", e.permission, e.commandId);
		this.initialized = !0;
	}
	persist(e = this.lastCommandId) {
		F(this.path, U({
			storage: this.values,
			repositories: o(),
			lastCommandId: e
		})), this.lastCommandId = e;
	}
	exportBackup() {
		if (this.security.require("users.manage"), !this.initialized || this.blocked) throw Error("Backup requires healthy initialized business data.");
		let e = W(_(this.path, "utf8"));
		return G(e.repositories, o()), U({
			storage: e.storage,
			repositories: e.repositories,
			lastCommandId: e.lastCommandId
		});
	}
	prepareRestore(e) {
		let t = this.security.require("users.manage");
		this.prepared = void 0;
		let n = W(e);
		K(n), this.initialized && G(n.repositories, o());
		let r = T();
		this.prepared = {
			token: r,
			actor: t.userId,
			database: n,
			revision: this.lastCommandId,
			expires: Date.now() + 3e5
		};
		let i = Object.fromEntries(Object.entries(n.repositories).map(([e, t]) => [e, Array.isArray(t) ? t.length : Object.values(t).reduce((e, t) => e + (Array.isArray(t) ? t.length : 0), 0)]));
		return {
			token: r,
			schemaVersion: n.schemaVersion,
			savedAt: n.schemaVersion === 1 ? "Legacy v1" : n.savedAt,
			counts: i
		};
	}
	async restoreBackup(e) {
		let t = this.security.require("users.manage"), n = this.prepared;
		if (this.prepared = void 0, !n || n.token !== e || n.actor !== t.userId || n.revision !== this.lastCommandId || n.expires < Date.now()) throw Error("Restore preview expired; select the backup again.");
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
		if (await import("./businessEngine-DfsOZpVe.js"), G(n.database.repositories, o()), this.security.require("users.manage").userId !== t.userId) throw Error("Restore session changed.");
		let r = this.security.pendingBusinessCommands();
		if (r.length) {
			let e = W(_(this.path, "utf8"));
			for (let t of r) this.security.audit(`recovery.${t.action}`, t.resourceId, t.commandId === e.lastCommandId ? "SUCCESS" : "FAILED", t.permission, t.commandId);
		}
		let i = T();
		if (this.security.audit("business.restore", "business-data-only", "INTENT", "users.manage", i), p(this.path)) {
			let e = M(A(this.path), "recovery-backups");
			h(e, {
				recursive: !0,
				mode: 448
			});
			let t = g(M(e, `before-restore-${i}.json`), "wx", 384);
			try {
				x(t, _(this.path)), m(t);
			} finally {
				f(t);
			}
			let n = g(e, "r");
			try {
				m(n);
			} finally {
				f(n);
			}
		}
		let a = U({
			storage: n.database.storage,
			repositories: n.database.repositories,
			lastCommandId: i
		});
		this.blocked = !0;
		try {
			F(this.path, a);
		} catch {
			throw Error("Restore commit could not be confirmed. Restart and inspect before retry.");
		}
		this.security.audit("business.restore", "business-data-only", "SUCCESS", "users.manage", i);
	}
	view() {
		let e = this.security.principal();
		if (!e || !this.initialized) throw Error("Login and desktop data initialization required.");
		let r = t(e, "audit.read") ? Object.fromEntries(Object.entries(this.values).filter(([e]) => e === "htt:financial-operations:v1" || e.startsWith("htt.purchasePosting."))) : {};
		return {
			repositories: n(e),
			storage: r
		};
	}
	command(t) {
		if (this.blocked || !this.initialized) throw Error("Business writes blocked; restart and inspect local audit.");
		if (!t || typeof t.repository != "string" || typeof t.method != "string" || !Array.isArray(t.args) || t.args.length > 20) throw Error("Invalid business command.");
		let n;
		try {
			n = i(t.repository, t.method);
		} catch (e) {
			throw this.security.audit("command.denied", `${t.repository}.${t.method}`.slice(0, 200), "DENIED"), e;
		}
		let r = this.security.require(n.permission), a = structuredClone(t.args);
		if ([
			"sales",
			"fulfilments",
			"goodsReceipts",
			"supplierBills",
			"supplierPayments",
			"supplierCredits",
			"bankTransactions",
			"bankReconciliations"
		].includes(t.repository) && a[0] && typeof a[0] == "object") {
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
			], r = a[0];
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
			let e = a[0];
			if (t.method === "post" && (e?.sourceType !== "MANUAL_JOURNAL" || e.sourceId)) throw Error("System journals must be posted through their business source.");
			if (t.method === "reverse" && o().journals.journalEntries.find((t) => t.id === e?.journalEntryId)?.sourceType !== "MANUAL_JOURNAL") throw Error("System journals must be reversed through their business source.");
		}
		if (t.repository === "salesRecovery" && a[0] && typeof a[0] == "object") {
			let e = a[0];
			t.method === "recordSalesManualReview" && (e.operator = r.userId), t.method === "closeVerifiedSalesReview" && (e.approver = r.userId);
		}
		let s = T(), c = `${t.repository}.${t.method}`, l = typeof a[0] == "string" ? a[0].slice(0, 200) : String(a[0]?.id ?? a[0]?.invoiceId ?? t.repository).slice(0, 200);
		this.security.audit(c, l, "INTENT", n.permission, s);
		let u = o(), d = structuredClone(this.values), f;
		try {
			if (f = n.execute(a), t.repository === "sales" && t.method === "createInvoiceFromOrder" && this.assertPeriod(f.documentDate), f instanceof Promise) throw Error("Business commands must be synchronous.");
		} catch (t) {
			throw this.values = d, e(u), this.security.audit(c, l, "FAILED", n.permission, s), t;
		}
		try {
			this.persist(s);
		} catch (t) {
			throw this.values = d, e(u), this.blocked = !0, Error(`Business commit ${s} could not be confirmed: ${t instanceof Error ? t.message : String(t)}. Restart and review before retry.`);
		}
		try {
			this.security.audit(c, l, "SUCCESS", n.permission, s);
		} catch {
			throw this.blocked = !0, Error(`Business command ${s} committed, but final audit confirmation failed. Do not repeat it; restart and review.`);
		}
		return {
			result: f,
			view: this.view()
		};
	}
};
//#endregion
//#region electron/security/registerSecurityIpc.ts
function ne(e, t) {
	let n = new V(M(e, "security-v1.json")), r = new q(M(e, "business-v1.json"), n), i = !1;
	return u.on("security:request", async (a, o, s) => {
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
					let t = await l.showSaveDialog(c, {
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
					let a = N(v(e), M(v(A(t.filePath)), k(t.filePath)));
					if (!a || !a.startsWith(".." + ee) && a !== ".." && !j(a)) throw Error("Choose a backup location outside the active local data directory.");
					let o = r.exportBackup();
					n.audit("business.backup", "business-data-only", "INTENT", "users.manage");
					try {
						F(t.filePath, o);
					} catch (e) {
						throw n.audit("business.backup", "business-data-only", "FAILED", "users.manage"), e;
					}
					n.audit("business.backup", "business-data-only", "SUCCESS", "users.manage"), i = { saved: !0 };
					break;
				}
				case "business.restore.preview": {
					n.require("users.manage");
					let e = await l.showOpenDialog(c, {
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
					if (b(e.filePaths[0]).size > 25e7) throw Error("Backup exceeds 250 MB.");
					i = r.prepareRestore(_(e.filePaths[0], "utf8"));
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
var re = P(import.meta.url), J = O.dirname(re), Y = "HTT Flooring Management System", X = () => {}, Z = null;
function ie(...e) {
	return O.join(J, "..", ...e);
}
function ae() {
	if (process.platform !== "darwin") return;
	let e = ie("build", "icon.png"), t = d.createFromPath(e);
	t.isEmpty() || c.dock?.setIcon(t);
}
function oe() {
	u.handle("statement:export-pdf", async (e, t) => {
		try {
			let n = s.fromWebContents(e.sender);
			if (!n) return {
				success: !1,
				error: "Unable to resolve the current application window."
			};
			let r = se(t.defaultFileName), i = await l.showSaveDialog(n, {
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
			return await te(i.filePath, a), {
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
function se(e) {
	let t = e.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").replace(/\s+/g, " ").trim() || "Customer Statement";
	return t.toLowerCase().endsWith(".pdf") ? t : `${t}.pdf`;
}
function Q() {
	Z = new s({
		title: Y,
		width: 1440,
		height: 900,
		minWidth: 1100,
		minHeight: 700,
		show: !1,
		backgroundColor: "#f4f1eb",
		webPreferences: {
			preload: O.join(J, "index.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1,
			sandbox: !0
		}
	}), Z.once("ready-to-show", () => {
		Z?.show();
	}), process.env.VITE_DEV_SERVER_URL ? Z.loadURL(process.env.VITE_DEV_SERVER_URL) : Z.loadFile(O.join(J, "../dist/index.html")), Z.webContents.on("did-start-navigation", (e, t, n, r) => {
		r && !n && X();
	}), Z.webContents.on("render-process-gone", () => X()), Z.webContents.setWindowOpenHandler(() => ({ action: "deny" })), Z.webContents.on("will-navigate", (e, t) => {
		let n = new URL(t), r = new URL(Z.webContents.getURL());
		(n.protocol !== r.protocol || n.host !== r.host || n.pathname !== r.pathname) && e.preventDefault();
	}), Z.on("closed", () => {
		X(), Z = null;
	});
}
var $ = c.commandLine.getSwitchValue("user-data-dir");
$ && c.setPath("userData", O.resolve($)), c.requestSingleInstanceLock() || c.quit(), c.on("second-instance", () => {
	Z?.show(), Z?.focus();
}), c.setName(Y), c.whenReady().then(() => {
	ae(), oe(), X = ne(O.join(c.getPath("userData"), "local-security"), () => Z).lock, Q(), c.on("activate", () => {
		s.getAllWindows().length === 0 && Q();
	});
}), c.on("window-all-closed", () => {
	process.platform !== "darwin" && c.quit();
});
//#endregion
export {};
