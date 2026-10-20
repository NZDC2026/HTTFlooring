import { C as e, D as t, E as n, F as r, L as i, O as a, S as o, T as s, g as c, h as l, t as u, w as d, x as ee } from "./accountingPeriodValidation-DFhCVmq4.js";
import { BrowserWindow as f, app as p, dialog as m, ipcMain as h, nativeImage as te } from "electron";
import { closeSync as g, existsSync as _, fsyncSync as v, mkdirSync as y, openSync as b, readFileSync as x, realpathSync as S, renameSync as ne, statSync as re, writeFileSync as C } from "node:fs";
import { createHash as w, createHmac as T, randomBytes as E, randomUUID as D, scryptSync as ie, timingSafeEqual as O } from "node:crypto";
import k, { basename as A, dirname as j, isAbsolute as M, join as N, relative as P, sep as F } from "node:path";
import { writeFile as ae } from "node:fs/promises";
import { fileURLToPath as oe } from "node:url";
//#region electron/security/localSecurity.ts
function I(e, t) {
	y(j(e), {
		recursive: !0,
		mode: 448
	});
	let n = `${e}.${D()}.tmp`, r = b(n, "wx", 384);
	try {
		C(r, JSON.stringify(t)), v(r);
	} finally {
		g(r);
	}
	ne(n, e);
	let i = b(j(e), "r");
	try {
		v(i);
	} finally {
		g(i);
	}
}
var L = ({ id: e, username: t, displayName: n, roles: r, active: i }) => ({
	id: e,
	username: t,
	displayName: n,
	roles: [...r],
	active: i
});
function R(e) {
	if (typeof e != "string" || !/^[a-z0-9][a-z0-9._-]{2,63}$/.test(e.trim().toLowerCase())) throw Error("Username must contain 3–64 letters, numbers, dots, underscores or hyphens.");
	return e.trim().toLowerCase();
}
function z(e) {
	if (typeof e != "string" || e.length < 12 || e.length > 256) throw Error("Password must contain 12–256 characters.");
	return e;
}
function B(e) {
	if (!Array.isArray(e) || !e.length || !e.every((e) => i.includes(e))) throw Error("Choose at least one valid role.");
	return [...new Set(e)];
}
var V = (e, t) => ie(e, t, 64).toString("hex"), se = class {
	state;
	session = null;
	poisoned = !1;
	path;
	save;
	now;
	constructor(e, t = I, n = () => Date.now()) {
		if (this.path = e, this.save = t, this.now = n, _(e)) {
			let t = JSON.parse(x(e, "utf8"));
			if (t?.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(t.auditKey) || !Array.isArray(t.users) || !Array.isArray(t.audit)) throw Error("Invalid local security database; access blocked.");
			let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
			for (let e of t.users) {
				if (!e.id || n.has(e.id) || r.has(e.username) || R(e.username) !== e.username || typeof e.displayName != "string" || typeof e.active != "boolean" || !Number.isFinite(e.failures) || !Number.isFinite(e.lockedUntil) || !/^[a-f0-9]{32}$/.test(e.salt) || !/^[a-f0-9]{128}$/.test(e.passwordHash)) throw Error("Invalid local user data; access blocked.");
				B(e.roles), n.add(e.id), r.add(e.username);
			}
			if (t.users.length && !t.users.some((e) => e.active && e.roles.includes("ADMIN"))) throw Error("No active administrator; access blocked.");
			let i = "";
			for (let e of t.audit) {
				let { hash: n, ...r } = e;
				if (e.previousHash !== i || n !== T("sha256", t.auditKey).update(JSON.stringify(r)).digest("hex")) throw Error("Local audit integrity check failed; access blocked.");
				i = n;
			}
			this.state = t;
		} else this.state = {
			schemaVersion: 1,
			auditKey: E(32).toString("hex"),
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
			id: D(),
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
			hash: T("sha256", this.state.auditKey).update(JSON.stringify(s)).digest("hex")
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
		if (!r(t, e)) throw this.audit("permission.denied", e, "DENIED", e), Error(`Permission denied: ${e}`);
		return this.session.idleUntil = Math.min(this.now() + 18e5, this.session.absoluteUntil), t;
	}
	status() {
		let e = this.principal(), t = e && this.state.users.find((t) => t.id === e.userId), n = t ? {
			user: L(t),
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
		let n = R(e.username), r = z(e.password);
		if (!e.displayName?.trim() || e.displayName.trim().length > 100) throw Error("Display name is required (maximum 100 characters).");
		if (this.state.users.some((e) => e.username === n)) throw Error("Username already exists.");
		let i = E(16).toString("hex"), a = {
			id: D(),
			username: n,
			displayName: e.displayName.trim(),
			roles: B(t),
			active: !0,
			salt: i,
			passwordHash: V(r, i),
			failures: 0,
			lockedUntil: 0
		};
		return this.commit({
			...this.state,
			users: [...this.state.users, a]
		}), this.audit("user.created", a.id, "SUCCESS", "users.manage", void 0, this.principal()?.userId ?? a.id), L(a);
	}
	login(e) {
		this.session = null;
		let t = R(e.username);
		if (typeof e.password != "string" || e.password.length > 256) throw Error("Invalid username or password.");
		let n = this.state.users.find((e) => e.username === t);
		if (n && n.lockedUntil > this.now()) throw Error("Too many login attempts; try again later.");
		let r = Buffer.from(V(e.password, n?.salt ?? "unavailable-account"), "hex"), i = n ? Buffer.from(n.passwordHash, "hex") : Buffer.alloc(64);
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
		return this.require("users.manage"), this.state.users.map(L);
	}
	createUser(e) {
		return this.require("users.manage"), this.addUser(e, e.roles);
	}
	updateUser(e) {
		let t = this.require("users.manage"), n = B(e.roles);
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
		if (typeof e.currentPassword != "string" || e.currentPassword.length > 256 || !O(Buffer.from(V(e.currentPassword, n.salt), "hex"), Buffer.from(n.passwordHash, "hex"))) throw Error("Current password is incorrect.");
		let r = z(e.password), i = E(16).toString("hex");
		this.audit("user.password", n.id, "INTENT"), this.commit({
			...this.state,
			users: this.state.users.map((e) => e.id === n.id ? {
				...e,
				salt: i,
				passwordHash: V(r, i)
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
		schemaVersion: 23,
		savedAt: (/* @__PURE__ */ new Date()).toISOString(),
		storage: e.storage,
		repositories: e.repositories,
		...e.lastCommandId === void 0 ? {} : { lastCommandId: e.lastCommandId }
	};
	return {
		...t,
		checksum: w("sha256").update(JSON.stringify(t)).digest("hex")
	};
}
function W(e) {
	if (Buffer.byteLength(e) > 25e7) throw Error("Business snapshot exceeds 250 MB.");
	let t = JSON.parse(e);
	if (!H(t) || ![
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		11,
		12,
		13,
		14,
		15,
		16,
		17,
		18,
		19,
		20,
		21,
		22,
		23
	].includes(t.schemaVersion)) throw Error("Unsupported business snapshot version.");
	if (!H(t.storage) || !Object.entries(t.storage).every(([e, t]) => e.startsWith("htt") && typeof t == "string") || !H(t.repositories) || t.lastCommandId !== void 0 && typeof t.lastCommandId != "string") throw Error("Invalid business snapshot structure.");
	if (t.schemaVersion === 2 || t.schemaVersion === 3 || t.schemaVersion === 4 || t.schemaVersion === 5 || t.schemaVersion === 6 || t.schemaVersion === 7 || t.schemaVersion === 8 || t.schemaVersion === 9 || t.schemaVersion === 10 || t.schemaVersion === 11 || t.schemaVersion === 12 || t.schemaVersion === 13 || t.schemaVersion === 14 || t.schemaVersion === 15 || t.schemaVersion === 16 || t.schemaVersion === 17 || t.schemaVersion === 18 || t.schemaVersion === 19 || t.schemaVersion === 20 || t.schemaVersion === 21 || t.schemaVersion === 22 || t.schemaVersion === 23) {
		let { checksum: e, ...n } = t;
		if (typeof t.savedAt != "string" || !Number.isFinite(Date.parse(t.savedAt)) || e !== w("sha256").update(JSON.stringify(n)).digest("hex")) throw Error("Business snapshot checksum failed.");
	}
	l(t.storage);
	let n = t.repositories.journals?.journalEntries;
	if (Array.isArray(n) && n.some((e) => e.bankDuplicateCorrection !== void 0)) {
		let e = t.repositories.financialCache?.journals;
		if (JSON.stringify(e) !== JSON.stringify(n)) throw Error("Bank duplicate correction cache differs from source journals.");
		if (c(n).invalid.length) throw Error("Invalid saved bank duplicate correction pair.");
		let r = t.storage["htt:financial-operations:v1"], i = r ? JSON.parse(r).data : [];
		for (let e of n.filter((e) => e.bankDuplicateCorrection)) {
			let t = e.bankDuplicateCorrection, n = i.find((e) => e.operationId === t.operationId), r = n?.repairProposal, a = r && JSON.parse(r.planJson);
			if (n?.resolution !== "BANK_DUPLICATE_REVERSED" || r?.status !== "EXECUTED" || r.action !== "REVERSE_BANK_DUPLICATE" || r.resultJournalId !== e.reversalJournalEntryId || a.duplicateJournalId !== e.id || a.existingJournalId !== t.canonicalJournalId || n.resultId !== e.sourceId) throw Error("Bank duplicate correction approval evidence is invalid.");
		}
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
	e.accountingPeriods && u(e.accountingPeriods.periods);
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
	return e.schemaVersion === 3 || e.schemaVersion === 4 || e.schemaVersion === 5 || e.schemaVersion === 6 || e.schemaVersion === 7 || e.schemaVersion === 8 || e.schemaVersion === 9 || e.schemaVersion === 10 || e.schemaVersion === 11 || e.schemaVersion === 12 || e.schemaVersion === 13 || e.schemaVersion === 14 || e.schemaVersion === 15 || e.schemaVersion === 16 || e.schemaVersion === 17 || e.schemaVersion === 18 || e.schemaVersion === 19 || e.schemaVersion === 20 || e.schemaVersion === 21 || e.schemaVersion === 22 || e.schemaVersion === 23 ? !1 : (Object.hasOwn(e.repositories, "accountingPeriods") || (e.repositories.accountingPeriods = { periods: [] }), !0);
}
var ce = /* @__PURE__ */ "products.workspace_tax_codes.workspace_linked_accounts.workspace_promotions.workspace_jobs.workspace_tasks.workspace_bank_rules.workspace_templates.workspace_custom_reports.workspace_report_packs.workspace_settings.customerSettlements.supplierRefunds.bankStatements.paymentBatches.openingBalances.managedSalesDocuments.expenseBillDrafts.salesDispatch.preparedSalesOutputs.physicalSupplierReturns.recurringInvoices.recurringExpenses.salesVisits.contactReviews.jobCosting.attachments.dataTransfers.documentRecycle.payroll.physicalCustomerReturns.customerDeposits.supplierPrepayments.preparedPurchaseOutputs".split(".");
function q(e, t) {
	if (e.schemaVersion === 23) return !1;
	for (let n of ce) if (!Object.hasOwn(e.repositories, n)) {
		if (!Object.hasOwn(t, n)) throw Error("Workspace contracts are not initialized.");
		e.repositories[n] = structuredClone(t[n]);
	}
	return !0;
}
//#endregion
//#region electron/security/businessHost.ts
var le = class {
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
	async initialize(e = {}) {
		if (this.blocked) throw Error("Restart the desktop application before reopening business data.");
		if (this.initialized) return;
		if (!this.security.principal()) throw Error("Login required.");
		let t, n;
		if (_(this.path)) n = W(x(this.path, "utf8")), n.schemaVersion !== 23 && (t = structuredClone(n), K(n)), this.values = n.storage;
		else {
			if (this.security.require("users.manage"), !e || typeof e != "object" || Object.keys(e).length > 1e3) throw Error("Invalid legacy local data.");
			for (let [t, n] of Object.entries(e)) if (!t.startsWith("htt") || typeof n != "string" || n.length > 5e7) throw Error("Invalid legacy local data.");
			let t = N(j(this.path), "legacy-profile-backup-v1.json");
			_(t) || I(t, {
				schemaVersion: 1,
				capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
				storage: e
			}), this.values = { ...e }, this.security.audit("business.import", "local-desktop-profile", "INTENT", "users.manage");
		}
		let r = {
			get length() {
				return Object.keys(i.values).length;
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
		}, i = this;
		Object.defineProperty(globalThis, "__HTT_MAIN_HOST__", {
			configurable: !0,
			value: !0
		}), Object.defineProperty(globalThis, "localStorage", {
			configurable: !0,
			value: r
		}), Object.defineProperty(globalThis, "window", {
			configurable: !0,
			value: { localStorage: r }
		});
		let a = await import("./businessEngine-5AJzEuES.js");
		this.workspaceDefaults = a.workspaceDefaults, n && (q(n, this.workspaceDefaults), G(n.repositories, d()), s(n.repositories), o(n.repositories), this.lastCommandId = n.lastCommandId), a.initialize(() => this.security.principal()), this.assertPeriod = a.assertPostingPeriod, t && (I(N(j(this.path), `pre-migration-v${n.schemaVersion}-${D()}.json`), t), this.persist(), this.security.audit("business.migrate.v9", "local-desktop-profile", "SUCCESS", "users.manage")), n || (this.persist(), this.security.audit("business.import", "local-desktop-profile", "SUCCESS", "users.manage"));
		for (let e of this.security.pendingBusinessCommands()) this.security.audit(`recovery.${e.action}`, e.resourceId, e.commandId === this.lastCommandId ? "SUCCESS" : "FAILED", e.permission, e.commandId);
		this.initialized = !0;
	}
	persist(e = this.lastCommandId) {
		I(this.path, U({
			storage: this.values,
			repositories: d(),
			lastCommandId: e
		})), this.lastCommandId = e;
	}
	exportBackup() {
		if (this.security.require("users.manage"), !this.initialized || this.blocked) throw Error("Backup requires healthy initialized business data.");
		let e = W(x(this.path, "utf8"));
		return G(e.repositories, d()), s(e.repositories), U({
			storage: e.storage,
			repositories: e.repositories,
			lastCommandId: e.lastCommandId
		});
	}
	prepareRestore(e) {
		let t = this.security.require("users.manage");
		this.prepared = void 0;
		let n = W(e);
		K(n), this.initialized && (q(n, this.workspaceDefaults), G(n.repositories, d()), s(n.repositories));
		let r = D();
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
		let r = await import("./businessEngine-5AJzEuES.js");
		if (q(n.database, r.workspaceDefaults), G(n.database.repositories, d()), s(n.database.repositories), this.security.require("users.manage").userId !== t.userId) throw Error("Restore session changed.");
		let i = this.security.pendingBusinessCommands();
		if (i.length) {
			let e = W(x(this.path, "utf8"));
			for (let t of i) this.security.audit(`recovery.${t.action}`, t.resourceId, t.commandId === e.lastCommandId ? "SUCCESS" : "FAILED", t.permission, t.commandId);
		}
		let a = D();
		if (this.security.audit("business.restore", "business-data-only", "INTENT", "users.manage", a), _(this.path)) {
			let e = N(j(this.path), "recovery-backups");
			y(e, {
				recursive: !0,
				mode: 448
			});
			let t = b(N(e, `before-restore-${a}.json`), "wx", 384);
			try {
				C(t, x(this.path)), v(t);
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
		let o = U({
			storage: n.database.storage,
			repositories: n.database.repositories,
			lastCommandId: a
		});
		this.blocked = !0;
		try {
			I(this.path, o);
		} catch {
			throw Error("Restore commit could not be confirmed. Restart and inspect before retry.");
		}
		this.security.audit("business.restore", "business-data-only", "SUCCESS", "users.manage", a);
	}
	view() {
		let t = this.security.principal();
		if (!t || !this.initialized) throw Error("Login and desktop data initialization required.");
		let n = r(t, "audit.read") ? Object.fromEntries(Object.entries(this.values).filter(([e]) => e === "htt:financial-operations:v1" || e.startsWith("htt.purchasePosting."))) : {};
		return {
			repositories: e(t),
			storage: n
		};
	}
	command(e) {
		if (this.blocked || !this.initialized) throw Error("Business writes blocked; restart and inspect local audit.");
		if (!e || typeof e.repository != "string" || typeof e.method != "string" || !Array.isArray(e.args) || e.args.length > 20) throw Error("Invalid business command.");
		let t;
		try {
			t = ee(e.repository, e.method);
		} catch (t) {
			throw this.security.audit("command.denied", `${e.repository}.${e.method}`.slice(0, 200), "DENIED"), t;
		}
		let n = this.security.require(t.permission), r = structuredClone(e.args);
		if ([
			"sales",
			"fulfilments",
			"goodsReceipts",
			"supplierBills",
			"supplierPayments",
			"supplierCredits",
			"bankTransactions",
			"bankReconciliations"
		].includes(e.repository) && r[0] && typeof r[0] == "object") {
			let n = [
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
			], i = r[0];
			try {
				for (let e of n) if (i[e] !== void 0) {
					if (typeof i[e] != "string") throw Error("Invalid posting date.");
					this.assertPeriod(i[e]);
				}
			} catch (n) {
				throw this.security.audit("period.denied", `${e.repository}.${e.method}`, "DENIED", t.permission), n;
			}
		}
		if (e.repository === "journals") {
			let t = r[0];
			if (e.method === "post" && (t?.sourceType !== "MANUAL_JOURNAL" || t.sourceId)) throw Error("System journals must be posted through their business source.");
			if (e.method === "reverse" && d().journals.journalEntries.find((e) => e.id === t?.journalEntryId)?.sourceType !== "MANUAL_JOURNAL") throw Error("System journals must be reversed through their business source.");
		}
		if (e.repository === "supplierPayments" && e.method === "reverse" && d().paymentBatches.batches.some((e) => e.status === "POSTED" && e.paymentIds.includes(r[0]))) throw Error("Reverse this supplier payment through its payment batch.");
		if (e.repository === "sales" && e.method === "reverseInvoicePayment" && d().customerSettlements.receipts.some((e) => e.status === "POSTED" && e.paymentIds.includes(r[0]))) throw Error("Reverse this payment through its grouped customer receipt.");
		if (e.repository === "salesRecovery" && r[0] && typeof r[0] == "object") {
			let t = r[0];
			e.method === "recordSalesManualReview" && (t.operator = n.userId), e.method === "closeVerifiedSalesReview" && (t.approver = n.userId);
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
			let e = d(), t = typeof r[0] == "string" ? r[0] : r[0]?.invoiceId ?? r[0]?.creditNoteId ?? r[0]?.supplierCreditId ?? r[0]?.supplierBillId;
			if ([
				...e.sales.invoices,
				...e.customerCredits.creditNotes,
				...e.supplierBills.supplierBills,
				...e.supplierCredits.supplierCredits
			].some((e) => e.id === t && e.openingBalanceImportId)) throw Error("Historical opening documents must be corrected through the opening batch reversal.");
		}
		let i = D(), a = `${e.repository}.${e.method}`, s = typeof r[0] == "string" ? r[0].slice(0, 200) : String(r[0]?.id ?? r[0]?.invoiceId ?? e.repository).slice(0, 200);
		this.security.audit(a, s, "INTENT", t.permission, i);
		let c = d(), l = structuredClone(this.values), u;
		try {
			if (u = t.execute(r), e.repository === "sales" && e.method === "createInvoiceFromOrder" && this.assertPeriod(u.documentDate), u instanceof Promise) throw Error("Business commands must be synchronous.");
		} catch (e) {
			throw this.values = l, o(c), this.security.audit(a, s, "FAILED", t.permission, i), e;
		}
		try {
			this.persist(i);
		} catch (e) {
			throw this.values = l, o(c), this.blocked = !0, Error(`Business commit ${i} could not be confirmed: ${e instanceof Error ? e.message : String(e)}. Restart and review before retry.`);
		}
		try {
			this.security.audit(a, s, "SUCCESS", t.permission, i);
		} catch {
			throw this.blocked = !0, Error(`Business command ${i} committed, but final audit confirmation failed. Do not repeat it; restart and review.`);
		}
		return {
			result: u,
			view: this.view()
		};
	}
};
//#endregion
//#region electron/security/registerSecurityIpc.ts
function ue(e, r) {
	let i = new se(N(e, "security-v1.json")), o = new le(N(e, "business-v1.json"), i), s = !1;
	return h.on("security:request", async (c, l, u) => {
		let d = r();
		if (!d || c.sender !== d.webContents || c.senderFrame !== d.webContents.mainFrame) {
			c.returnValue = {
				ok: !1,
				error: "Untrusted desktop sender."
			};
			return;
		}
		if (s) {
			c.returnValue = {
				ok: !1,
				error: "A desktop operation is already running."
			};
			return;
		}
		s = !0;
		try {
			if (typeof l != "string" || JSON.stringify(u ?? null).length > 6e7) throw Error("Invalid desktop request.");
			let r = u ?? {}, s;
			switch (l) {
				case "status":
					s = i.status();
					break;
				case "setup":
					s = i.setup(r);
					break;
				case "login":
					s = i.login(r);
					break;
				case "logout":
					s = i.logout();
					break;
				case "users.list":
					s = i.listUsers();
					break;
				case "users.create":
					s = i.createUser(r);
					break;
				case "users.update":
					s = i.updateUser(r);
					break;
				case "password.change":
					s = i.changePassword(r);
					break;
				case "audit.list":
					s = i.listAudit(r);
					break;
				case "business.bootstrap":
					await o.initialize(r.legacyStorage), s = o.view();
					break;
				case "business.backup.save": {
					i.require("users.manage");
					let t = await m.showSaveDialog(d, {
						title: "Save business backup",
						defaultPath: `HTT-Business-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`,
						filters: [{
							name: "HTT business backup",
							extensions: ["json"]
						}]
					});
					if (t.canceled || !t.filePath) {
						s = { saved: !1 };
						break;
					}
					let n = P(S(e), N(S(j(t.filePath)), A(t.filePath)));
					if (!n || !n.startsWith(".." + F) && n !== ".." && !M(n)) throw Error("Choose a backup location outside the active local data directory.");
					let r = o.exportBackup();
					i.audit("business.backup", "business-data-only", "INTENT", "users.manage");
					try {
						I(t.filePath, r);
					} catch (e) {
						throw i.audit("business.backup", "business-data-only", "FAILED", "users.manage"), e;
					}
					i.audit("business.backup", "business-data-only", "SUCCESS", "users.manage"), s = { saved: !0 };
					break;
				}
				case "business.restore.preview": {
					i.require("users.manage");
					let e = await m.showOpenDialog(d, {
						title: "Select business backup",
						properties: ["openFile"],
						filters: [{
							name: "HTT business backup",
							extensions: ["json"]
						}]
					});
					if (e.canceled || !e.filePaths[0]) {
						s = null;
						break;
					}
					if (re(e.filePaths[0]).size > 25e7) throw Error("Backup exceeds 250 MB.");
					s = o.prepareRestore(x(e.filePaths[0], "utf8"));
					break;
				}
				case "business.restore.commit":
					await o.restoreBackup(r.token), s = { restartRequired: !0 };
					break;
				case "attachments.select": {
					i.require("inventory.read"), o.command({
						repository: "attachments",
						method: "checkTarget",
						args: [r.target]
					});
					let e = await m.showOpenDialog(d, {
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
						s = { saved: !1 };
						break;
					}
					let t = a(e.filePaths[0]);
					s = {
						saved: !0,
						...o.command({
							repository: "attachments",
							method: "upload",
							args: [{
								...r,
								file: {
									name: A(e.filePaths[0]),
									content: t.toString("base64")
								}
							}]
						})
					};
					break;
				}
				case "attachments.export": {
					i.require("inventory.read");
					let a = o.command({
						repository: "attachments",
						method: "read",
						args: [r]
					}).result, c = await m.showSaveDialog(d, {
						title: "Export attachment version",
						defaultPath: a.name
					});
					if (c.canceled || !c.filePath) {
						s = { saved: !1 };
						break;
					}
					let l = P(S(e), N(S(j(c.filePath)), A(c.filePath)));
					if (!l || !l.startsWith(".." + F) && l !== ".." && !M(l)) throw Error("Choose an export location outside the active local data directory.");
					i.audit("attachments.export", String(r.id) + "/" + String(r.versionId), "INTENT", "inventory.read");
					try {
						let e = o.command({
							repository: "attachments",
							method: "read",
							args: [r]
						}).result;
						n(N(S(j(c.filePath)), A(c.filePath)), t(e));
					} catch (e) {
						throw i.audit("attachments.export", String(r.id) + "/" + String(r.versionId), "FAILED", "inventory.read"), e;
					}
					i.audit("attachments.export", String(r.id) + "/" + String(r.versionId), "SUCCESS", "inventory.read"), s = { saved: !0 };
					break;
				}
				case "business.command":
					s = o.command(r);
					break;
				default: throw Error("Unknown desktop security action.");
			}
			c.returnValue = {
				ok: !0,
				value: s
			};
		} catch (e) {
			c.returnValue = {
				ok: !1,
				error: e instanceof Error ? e.message : "Desktop operation failed."
			};
		} finally {
			s = !1;
		}
	}), { lock: () => {
		try {
			i.principal() && i.logout();
		} catch {}
	} };
}
//#endregion
//#region electron/main/index.ts
var de = oe(import.meta.url), J = k.dirname(de), Y = "HTT Flooring Management System", X = () => {}, Z = null;
function fe(...e) {
	return k.join(J, "..", ...e);
}
function pe() {
	if (process.platform !== "darwin") return;
	let e = fe("build", "icon.png"), t = te.createFromPath(e);
	t.isEmpty() || p.dock?.setIcon(t);
}
function me() {
	h.handle("statement:export-pdf", async (e, t) => {
		try {
			let n = f.fromWebContents(e.sender);
			if (!n) return {
				success: !1,
				error: "Unable to resolve the current application window."
			};
			let r = he(t.defaultFileName), i = await m.showSaveDialog(n, {
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
			return await ae(i.filePath, a), {
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
function he(e) {
	let t = e.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").replace(/\s+/g, " ").trim() || "Customer Statement";
	return t.toLowerCase().endsWith(".pdf") ? t : `${t}.pdf`;
}
function Q() {
	Z = new f({
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
var $ = p.commandLine.getSwitchValue("user-data-dir");
$ && p.setPath("userData", k.resolve($)), p.requestSingleInstanceLock() || p.quit(), p.on("second-instance", () => {
	Z?.show(), Z?.focus();
}), p.setName(Y), p.whenReady().then(() => {
	pe(), me(), X = ue(k.join(p.getPath("userData"), "local-security"), () => Z).lock, Q(), p.on("activate", () => {
		f.getAllWindows().length === 0 && Q();
	});
}), p.on("window-all-closed", () => {
	process.platform !== "darwin" && p.quit();
});
//#endregion
export {};
