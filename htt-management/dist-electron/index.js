import { A as e, C as t, D as n, E as r, L as i, O as a, T as o, a as s, i as c, k as l, t as u, w as d, z as f } from "./accountingPeriodValidation-BanyVM6p.js";
import { BrowserWindow as p, app as m, dialog as h, ipcMain as g, nativeImage as ee } from "electron";
import { closeSync as _, existsSync as v, fsyncSync as y, mkdirSync as b, openSync as x, readFileSync as S, realpathSync as C, renameSync as te, statSync as ne, writeFileSync as w } from "node:fs";
import { createHash as T, createHmac as E, randomBytes as D, randomUUID as O, scryptSync as re, timingSafeEqual as k } from "node:crypto";
import A, { basename as j, dirname as M, isAbsolute as N, join as P, relative as F, sep as I } from "node:path";
import { writeFile as ie } from "node:fs/promises";
import { fileURLToPath as ae } from "node:url";
//#region electron/security/localSecurity.ts
function L(e, t) {
	b(M(e), {
		recursive: !0,
		mode: 448
	});
	let n = `${e}.${O()}.tmp`, r = x(n, "wx", 384);
	try {
		w(r, JSON.stringify(t)), y(r);
	} finally {
		_(r);
	}
	te(n, e);
	let i = x(M(e), "r");
	try {
		y(i);
	} finally {
		_(i);
	}
}
var R = ({ id: e, username: t, displayName: n, roles: r, active: i }) => ({
	id: e,
	username: t,
	displayName: n,
	roles: [...r],
	active: i
});
function z(e) {
	if (typeof e != "string" || !/^[a-z0-9][a-z0-9._-]{2,63}$/.test(e.trim().toLowerCase())) throw Error("Username must contain 3–64 letters, numbers, dots, underscores or hyphens.");
	return e.trim().toLowerCase();
}
function B(e) {
	if (typeof e != "string" || e.length < 12 || e.length > 256) throw Error("Password must contain 12–256 characters.");
	return e;
}
function V(e) {
	if (!Array.isArray(e) || !e.length || !e.every((e) => f.includes(e))) throw Error("Choose at least one valid role.");
	return [...new Set(e)];
}
var H = (e, t) => re(e, t, 64).toString("hex"), oe = class {
	state;
	session = null;
	poisoned = !1;
	path;
	save;
	now;
	constructor(e, t = L, n = () => Date.now()) {
		if (this.path = e, this.save = t, this.now = n, v(e)) {
			let t = JSON.parse(S(e, "utf8"));
			if (t?.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(t.auditKey) || !Array.isArray(t.users) || !Array.isArray(t.audit)) throw Error("Invalid local security database; access blocked.");
			let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
			for (let e of t.users) {
				if (!e.id || n.has(e.id) || r.has(e.username) || z(e.username) !== e.username || typeof e.displayName != "string" || typeof e.active != "boolean" || !Number.isFinite(e.failures) || !Number.isFinite(e.lockedUntil) || !/^[a-f0-9]{32}$/.test(e.salt) || !/^[a-f0-9]{128}$/.test(e.passwordHash)) throw Error("Invalid local user data; access blocked.");
				V(e.roles), n.add(e.id), r.add(e.username);
			}
			if (t.users.length && !t.users.some((e) => e.active && e.roles.includes("ADMIN"))) throw Error("No active administrator; access blocked.");
			let i = "";
			for (let e of t.audit) {
				let { hash: n, ...r } = e;
				if (e.previousHash !== i || n !== E("sha256", t.auditKey).update(JSON.stringify(r)).digest("hex")) throw Error("Local audit integrity check failed; access blocked.");
				i = n;
			}
			this.state = t;
		} else this.state = {
			schemaVersion: 1,
			auditKey: D(32).toString("hex"),
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
			id: O(),
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
			hash: E("sha256", this.state.auditKey).update(JSON.stringify(s)).digest("hex")
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
		if (!i(t, e)) throw this.audit("permission.denied", e, "DENIED", e), Error(`Permission denied: ${e}`);
		return this.session.idleUntil = Math.min(this.now() + 18e5, this.session.absoluteUntil), t;
	}
	status() {
		let e = this.principal(), t = e && this.state.users.find((t) => t.id === e.userId), n = t ? {
			user: R(t),
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
		let n = z(e.username), r = B(e.password);
		if (!e.displayName?.trim() || e.displayName.trim().length > 100) throw Error("Display name is required (maximum 100 characters).");
		if (this.state.users.some((e) => e.username === n)) throw Error("Username already exists.");
		let i = D(16).toString("hex"), a = {
			id: O(),
			username: n,
			displayName: e.displayName.trim(),
			roles: V(t),
			active: !0,
			salt: i,
			passwordHash: H(r, i),
			failures: 0,
			lockedUntil: 0
		};
		return this.commit({
			...this.state,
			users: [...this.state.users, a]
		}), this.audit("user.created", a.id, "SUCCESS", "users.manage", void 0, this.principal()?.userId ?? a.id), R(a);
	}
	login(e) {
		this.session = null;
		let t = z(e.username);
		if (typeof e.password != "string" || e.password.length > 256) throw Error("Invalid username or password.");
		let n = this.state.users.find((e) => e.username === t);
		if (n && n.lockedUntil > this.now()) throw Error("Too many login attempts; try again later.");
		let r = Buffer.from(H(e.password, n?.salt ?? "unavailable-account"), "hex"), i = n ? Buffer.from(n.passwordHash, "hex") : Buffer.alloc(64);
		if (!n?.active || !k(r, i)) throw n && this.commit({
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
		return this.require("users.manage"), this.state.users.map(R);
	}
	createUser(e) {
		return this.require("users.manage"), this.addUser(e, e.roles);
	}
	updateUser(e) {
		let t = this.require("users.manage"), n = V(e.roles);
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
		if (typeof e.currentPassword != "string" || e.currentPassword.length > 256 || !k(Buffer.from(H(e.currentPassword, n.salt), "hex"), Buffer.from(n.passwordHash, "hex"))) throw Error("Current password is incorrect.");
		let r = B(e.password), i = D(16).toString("hex");
		this.audit("user.password", n.id, "INTENT"), this.commit({
			...this.state,
			users: this.state.users.map((e) => e.id === n.id ? {
				...e,
				salt: i,
				passwordHash: H(r, i)
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
}, U = (e) => !!e && typeof e == "object" && !Array.isArray(e);
function W(e) {
	let t = {
		schemaVersion: 23,
		savedAt: (/* @__PURE__ */ new Date()).toISOString(),
		storage: e.storage,
		repositories: e.repositories,
		...e.lastCommandId === void 0 ? {} : { lastCommandId: e.lastCommandId }
	};
	return {
		...t,
		checksum: T("sha256").update(JSON.stringify(t)).digest("hex")
	};
}
function G(e) {
	if (Buffer.byteLength(e) > 25e7) throw Error("Business snapshot exceeds 250 MB.");
	let t = JSON.parse(e);
	if (!U(t) || ![
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
	if (!U(t.storage) || !Object.entries(t.storage).every(([e, t]) => e.startsWith("htt") && typeof t == "string") || !U(t.repositories) || t.lastCommandId !== void 0 && typeof t.lastCommandId != "string") throw Error("Invalid business snapshot structure.");
	if (t.schemaVersion === 2 || t.schemaVersion === 3 || t.schemaVersion === 4 || t.schemaVersion === 5 || t.schemaVersion === 6 || t.schemaVersion === 7 || t.schemaVersion === 8 || t.schemaVersion === 9 || t.schemaVersion === 10 || t.schemaVersion === 11 || t.schemaVersion === 12 || t.schemaVersion === 13 || t.schemaVersion === 14 || t.schemaVersion === 15 || t.schemaVersion === 16 || t.schemaVersion === 17 || t.schemaVersion === 18 || t.schemaVersion === 19 || t.schemaVersion === 20 || t.schemaVersion === 21 || t.schemaVersion === 22 || t.schemaVersion === 23) {
		let { checksum: e, ...n } = t;
		if (typeof t.savedAt != "string" || !Number.isFinite(Date.parse(t.savedAt)) || e !== T("sha256").update(JSON.stringify(n)).digest("hex")) throw Error("Business snapshot checksum failed.");
	}
	c(t.storage);
	let n = t.repositories.journals?.journalEntries;
	if (Array.isArray(n) && n.some((e) => e.bankDuplicateCorrection !== void 0)) {
		let e = t.repositories.financialCache?.journals;
		if (JSON.stringify(e) !== JSON.stringify(n)) throw Error("Bank duplicate correction cache differs from source journals.");
		if (s(n).invalid.length) throw Error("Invalid saved bank duplicate correction pair.");
		let r = t.storage["htt:financial-operations:v1"], i = r ? JSON.parse(r).data : [];
		for (let e of n.filter((e) => e.bankDuplicateCorrection)) {
			let t = e.bankDuplicateCorrection, n = i.find((e) => e.operationId === t.operationId), r = n?.repairProposal, a = r && JSON.parse(r.planJson);
			if (n?.resolution !== "BANK_DUPLICATE_REVERSED" || r?.status !== "EXECUTED" || r.action !== "REVERSE_BANK_DUPLICATE" || r.resultJournalId !== e.reversalJournalEntryId || a.duplicateJournalId !== e.id || a.existingJournalId !== t.canonicalJournalId || n.resultId !== e.sourceId) throw Error("Bank duplicate correction approval evidence is invalid.");
		}
	}
	return t;
}
function K(e, t) {
	if (JSON.stringify(Object.keys(e).sort()) !== JSON.stringify(Object.keys(t).sort())) throw Error("Business repository schema mismatch; migration required.");
	for (let [n, r] of Object.entries(t)) {
		let t = e[n];
		if (Array.isArray(r)) {
			if (!Array.isArray(t)) throw Error(`Invalid ${n} snapshot.`);
		} else if (!U(t) || JSON.stringify(Object.keys(t).sort()) !== JSON.stringify(Object.keys(r).sort()) || !Object.values(t).every(Array.isArray)) throw Error(`Invalid ${n} snapshot.`);
	}
	e.accountingPeriods && u(e.accountingPeriods.periods);
	for (let t of Object.values(e)) {
		let e = Array.isArray(t) ? [t] : Object.values(t);
		for (let t of e) {
			let e = /* @__PURE__ */ new Set();
			for (let n of t) {
				if (!U(n)) throw Error("Invalid business record.");
				if ("id" in n) {
					if (typeof n.id != "string" || !n.id || e.has(n.id)) throw Error("Invalid or duplicate business record ID.");
					e.add(n.id);
				}
			}
		}
	}
}
function q(e) {
	return e.schemaVersion === 3 || e.schemaVersion === 4 || e.schemaVersion === 5 || e.schemaVersion === 6 || e.schemaVersion === 7 || e.schemaVersion === 8 || e.schemaVersion === 9 || e.schemaVersion === 10 || e.schemaVersion === 11 || e.schemaVersion === 12 || e.schemaVersion === 13 || e.schemaVersion === 14 || e.schemaVersion === 15 || e.schemaVersion === 16 || e.schemaVersion === 17 || e.schemaVersion === 18 || e.schemaVersion === 19 || e.schemaVersion === 20 || e.schemaVersion === 21 || e.schemaVersion === 22 || e.schemaVersion === 23 ? !1 : (Object.hasOwn(e.repositories, "accountingPeriods") || (e.repositories.accountingPeriods = { periods: [] }), !0);
}
var se = /* @__PURE__ */ "products.workspace_tax_codes.workspace_linked_accounts.workspace_promotions.workspace_jobs.workspace_tasks.workspace_bank_rules.workspace_templates.workspace_custom_reports.workspace_report_packs.workspace_settings.customerSettlements.supplierRefunds.bankStatements.paymentBatches.openingBalances.managedSalesDocuments.expenseBillDrafts.salesDispatch.preparedSalesOutputs.physicalSupplierReturns.recurringInvoices.recurringExpenses.salesVisits.contactReviews.jobCosting.attachments.dataTransfers.documentRecycle.payroll.physicalCustomerReturns.customerDeposits.supplierPrepayments.preparedPurchaseOutputs".split(".");
function J(e, t) {
	if (e.schemaVersion === 23) return !1;
	for (let n of se) if (!Object.hasOwn(e.repositories, n)) {
		if (!Object.hasOwn(t, n)) throw Error("Workspace contracts are not initialized.");
		e.repositories[n] = structuredClone(t[n]);
	}
	return !0;
}
//#endregion
//#region electron/security/businessHost.ts
var ce = class {
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
		let t, i;
		if (v(this.path)) i = G(S(this.path, "utf8")), i.schemaVersion !== 23 && (t = structuredClone(i), q(i)), this.values = i.storage;
		else {
			if (this.security.require("users.manage"), !e || typeof e != "object" || Object.keys(e).length > 1e3) throw Error("Invalid legacy local data.");
			for (let [t, n] of Object.entries(e)) if (!t.startsWith("htt") || typeof n != "string" || n.length > 5e7) throw Error("Invalid legacy local data.");
			let t = P(M(this.path), "legacy-profile-backup-v1.json");
			v(t) || L(t, {
				schemaVersion: 1,
				capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
				storage: e
			}), this.values = { ...e }, this.security.audit("business.import", "local-desktop-profile", "INTENT", "users.manage");
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
		let s = await import("./businessEngine-C8SDbMdY.js");
		this.workspaceDefaults = s.workspaceDefaults, i && (J(i, this.workspaceDefaults), K(i.repositories, r()), n(i.repositories), d(i.repositories), this.lastCommandId = i.lastCommandId), s.initialize(() => this.security.principal()), this.assertPeriod = s.assertPostingPeriod, t && (L(P(M(this.path), `pre-migration-v${i.schemaVersion}-${O()}.json`), t), this.persist(), this.security.audit("business.migrate.v9", "local-desktop-profile", "SUCCESS", "users.manage")), i || (this.persist(), this.security.audit("business.import", "local-desktop-profile", "SUCCESS", "users.manage"));
		for (let e of this.security.pendingBusinessCommands()) this.security.audit(`recovery.${e.action}`, e.resourceId, e.commandId === this.lastCommandId ? "SUCCESS" : "FAILED", e.permission, e.commandId);
		this.initialized = !0;
	}
	persist(e = this.lastCommandId) {
		L(this.path, W({
			storage: this.values,
			repositories: r(),
			lastCommandId: e
		})), this.lastCommandId = e;
	}
	exportBackup() {
		if (this.security.require("users.manage"), !this.initialized || this.blocked) throw Error("Backup requires healthy initialized business data.");
		let e = G(S(this.path, "utf8"));
		return K(e.repositories, r()), n(e.repositories), W({
			storage: e.storage,
			repositories: e.repositories,
			lastCommandId: e.lastCommandId
		});
	}
	prepareRestore(e) {
		let t = this.security.require("users.manage");
		this.prepared = void 0;
		let i = G(e);
		q(i), this.initialized && (J(i, this.workspaceDefaults), K(i.repositories, r()), n(i.repositories));
		let a = O();
		this.prepared = {
			token: a,
			actor: t.userId,
			database: i,
			revision: this.lastCommandId,
			expires: Date.now() + 3e5
		};
		let o = Object.fromEntries(Object.entries(i.repositories).map(([e, t]) => [e, Array.isArray(t) ? t.length : Object.values(t).reduce((e, t) => e + (Array.isArray(t) ? t.length : 0), 0)]));
		return {
			token: a,
			schemaVersion: i.schemaVersion,
			savedAt: i.schemaVersion === 1 ? "Legacy v1" : i.savedAt,
			counts: o
		};
	}
	async restoreBackup(e) {
		let t = this.security.require("users.manage"), i = this.prepared;
		if (this.prepared = void 0, !i || i.token !== e || i.actor !== t.userId || i.revision !== this.lastCommandId || i.expires < Date.now()) throw Error("Restore preview expired; select the backup again.");
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
		let a = await import("./businessEngine-C8SDbMdY.js");
		if (J(i.database, a.workspaceDefaults), K(i.database.repositories, r()), n(i.database.repositories), this.security.require("users.manage").userId !== t.userId) throw Error("Restore session changed.");
		let o = this.security.pendingBusinessCommands();
		if (o.length) {
			let e = G(S(this.path, "utf8"));
			for (let t of o) this.security.audit(`recovery.${t.action}`, t.resourceId, t.commandId === e.lastCommandId ? "SUCCESS" : "FAILED", t.permission, t.commandId);
		}
		let s = O();
		if (this.security.audit("business.restore", "business-data-only", "INTENT", "users.manage", s), v(this.path)) {
			let e = P(M(this.path), "recovery-backups");
			b(e, {
				recursive: !0,
				mode: 448
			});
			let t = x(P(e, `before-restore-${s}.json`), "wx", 384);
			try {
				w(t, S(this.path)), y(t);
			} finally {
				_(t);
			}
			let n = x(e, "r");
			try {
				y(n);
			} finally {
				_(n);
			}
		}
		let c = W({
			storage: i.database.storage,
			repositories: i.database.repositories,
			lastCommandId: s
		});
		this.blocked = !0;
		try {
			L(this.path, c);
		} catch {
			throw Error("Restore commit could not be confirmed. Restart and inspect before retry.");
		}
		this.security.audit("business.restore", "business-data-only", "SUCCESS", "users.manage", s);
	}
	view() {
		let e = this.security.principal();
		if (!e || !this.initialized) throw Error("Login and desktop data initialization required.");
		let t = i(e, "audit.read") ? Object.fromEntries(Object.entries(this.values).filter(([e]) => e === "htt:financial-operations:v1" || e.startsWith("htt.purchasePosting."))) : {};
		return {
			repositories: o(e),
			storage: t
		};
	}
	command(e) {
		if (this.blocked || !this.initialized) throw Error("Business writes blocked; restart and inspect local audit.");
		if (!e || typeof e.repository != "string" || typeof e.method != "string" || !Array.isArray(e.args) || e.args.length > 20) throw Error("Invalid business command.");
		let n;
		try {
			n = t(e.repository, e.method);
		} catch (t) {
			throw this.security.audit("command.denied", `${e.repository}.${e.method}`.slice(0, 200), "DENIED"), t;
		}
		let i = this.security.require(n.permission), a = structuredClone(e.args);
		if ([
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
			], r = a[0];
			try {
				for (let e of t) if (r[e] !== void 0) {
					if (typeof r[e] != "string") throw Error("Invalid posting date.");
					this.assertPeriod(r[e]);
				}
			} catch (t) {
				throw this.security.audit("period.denied", `${e.repository}.${e.method}`, "DENIED", n.permission), t;
			}
		}
		if (e.repository === "journals") {
			let t = a[0];
			if (e.method === "post" && (t?.sourceType !== "MANUAL_JOURNAL" || t.sourceId)) throw Error("System journals must be posted through their business source.");
			if (e.method === "reverse" && r().journals.journalEntries.find((e) => e.id === t?.journalEntryId)?.sourceType !== "MANUAL_JOURNAL") throw Error("System journals must be reversed through their business source.");
		}
		if (e.repository === "supplierPayments" && e.method === "reverse" && r().paymentBatches.batches.some((e) => e.status === "POSTED" && e.paymentIds.includes(a[0]))) throw Error("Reverse this supplier payment through its payment batch.");
		if (e.repository === "sales" && e.method === "reverseInvoicePayment" && r().customerSettlements.receipts.some((e) => e.status === "POSTED" && e.paymentIds.includes(a[0]))) throw Error("Reverse this payment through its grouped customer receipt.");
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
			let e = r(), t = typeof a[0] == "string" ? a[0] : a[0]?.invoiceId ?? a[0]?.creditNoteId ?? a[0]?.supplierCreditId ?? a[0]?.supplierBillId;
			if ([
				...e.sales.invoices,
				...e.customerCredits.creditNotes,
				...e.supplierBills.supplierBills,
				...e.supplierCredits.supplierCredits
			].some((e) => e.id === t && e.openingBalanceImportId)) throw Error("Historical opening documents must be corrected through the opening batch reversal.");
		}
		let o = O(), s = `${e.repository}.${e.method}`, c = typeof a[0] == "string" ? a[0].slice(0, 200) : String(a[0]?.id ?? a[0]?.invoiceId ?? e.repository).slice(0, 200);
		this.security.audit(s, c, "INTENT", n.permission, o);
		let l = r(), u = structuredClone(this.values), f;
		try {
			if (f = n.execute(a), e.repository === "sales" && e.method === "createInvoiceFromOrder" && this.assertPeriod(f.documentDate), f instanceof Promise) throw Error("Business commands must be synchronous.");
		} catch (e) {
			throw this.values = u, d(l), this.security.audit(s, c, "FAILED", n.permission, o), e;
		}
		try {
			this.persist(o);
		} catch (e) {
			throw this.values = u, d(l), this.blocked = !0, Error(`Business commit ${o} could not be confirmed: ${e instanceof Error ? e.message : String(e)}. Restart and review before retry.`);
		}
		try {
			this.security.audit(s, c, "SUCCESS", n.permission, o);
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
function le(t, n) {
	let r = new oe(P(t, "security-v1.json")), i = new ce(P(t, "business-v1.json"), r), o = !1;
	return g.on("security:request", async (s, c, u) => {
		let d = n();
		if (!d || s.sender !== d.webContents || s.senderFrame !== d.webContents.mainFrame) {
			s.returnValue = {
				ok: !1,
				error: "Untrusted desktop sender."
			};
			return;
		}
		if (o) {
			s.returnValue = {
				ok: !1,
				error: "A desktop operation is already running."
			};
			return;
		}
		o = !0;
		try {
			if (typeof c != "string" || JSON.stringify(u ?? null).length > 6e7) throw Error("Invalid desktop request.");
			let n = u ?? {}, o;
			switch (c) {
				case "status":
					o = r.status();
					break;
				case "setup":
					o = r.setup(n);
					break;
				case "login":
					o = r.login(n);
					break;
				case "logout":
					o = r.logout();
					break;
				case "users.list":
					o = r.listUsers();
					break;
				case "users.create":
					o = r.createUser(n);
					break;
				case "users.update":
					o = r.updateUser(n);
					break;
				case "password.change":
					o = r.changePassword(n);
					break;
				case "audit.list":
					o = r.listAudit(n);
					break;
				case "business.bootstrap":
					await i.initialize(n.legacyStorage), o = i.view();
					break;
				case "business.backup.save": {
					r.require("users.manage");
					let e = await h.showSaveDialog(d, {
						title: "Save business backup",
						defaultPath: `HTT-Business-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`,
						filters: [{
							name: "HTT business backup",
							extensions: ["json"]
						}]
					});
					if (e.canceled || !e.filePath) {
						o = { saved: !1 };
						break;
					}
					let n = F(C(t), P(C(M(e.filePath)), j(e.filePath)));
					if (!n || !n.startsWith(".." + I) && n !== ".." && !N(n)) throw Error("Choose a backup location outside the active local data directory.");
					let a = i.exportBackup();
					r.audit("business.backup", "business-data-only", "INTENT", "users.manage");
					try {
						L(e.filePath, a);
					} catch (e) {
						throw r.audit("business.backup", "business-data-only", "FAILED", "users.manage"), e;
					}
					r.audit("business.backup", "business-data-only", "SUCCESS", "users.manage"), o = { saved: !0 };
					break;
				}
				case "business.restore.preview": {
					r.require("users.manage");
					let e = await h.showOpenDialog(d, {
						title: "Select business backup",
						properties: ["openFile"],
						filters: [{
							name: "HTT business backup",
							extensions: ["json"]
						}]
					});
					if (e.canceled || !e.filePaths[0]) {
						o = null;
						break;
					}
					if (ne(e.filePaths[0]).size > 25e7) throw Error("Backup exceeds 250 MB.");
					o = i.prepareRestore(S(e.filePaths[0], "utf8"));
					break;
				}
				case "business.restore.commit":
					await i.restoreBackup(n.token), o = { restartRequired: !0 };
					break;
				case "attachments.select": {
					r.require("inventory.read"), i.command({
						repository: "attachments",
						method: "checkTarget",
						args: [n.target]
					});
					let t = await h.showOpenDialog(d, {
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
					if (t.canceled || !t.filePaths[0]) {
						o = { saved: !1 };
						break;
					}
					let a = e(t.filePaths[0]);
					o = {
						saved: !0,
						...i.command({
							repository: "attachments",
							method: "upload",
							args: [{
								...n,
								file: {
									name: j(t.filePaths[0]),
									content: a.toString("base64")
								}
							}]
						})
					};
					break;
				}
				case "attachments.export": {
					r.require("inventory.read");
					let e = i.command({
						repository: "attachments",
						method: "read",
						args: [n]
					}).result, s = await h.showSaveDialog(d, {
						title: "Export attachment version",
						defaultPath: e.name
					});
					if (s.canceled || !s.filePath) {
						o = { saved: !1 };
						break;
					}
					let c = F(C(t), P(C(M(s.filePath)), j(s.filePath)));
					if (!c || !c.startsWith(".." + I) && c !== ".." && !N(c)) throw Error("Choose an export location outside the active local data directory.");
					r.audit("attachments.export", String(n.id) + "/" + String(n.versionId), "INTENT", "inventory.read");
					try {
						let e = i.command({
							repository: "attachments",
							method: "read",
							args: [n]
						}).result;
						a(P(C(M(s.filePath)), j(s.filePath)), l(e));
					} catch (e) {
						throw r.audit("attachments.export", String(n.id) + "/" + String(n.versionId), "FAILED", "inventory.read"), e;
					}
					r.audit("attachments.export", String(n.id) + "/" + String(n.versionId), "SUCCESS", "inventory.read"), o = { saved: !0 };
					break;
				}
				case "business.command":
					o = i.command(n);
					break;
				default: throw Error("Unknown desktop security action.");
			}
			s.returnValue = {
				ok: !0,
				value: o
			};
		} catch (e) {
			s.returnValue = {
				ok: !1,
				error: e instanceof Error ? e.message : "Desktop operation failed."
			};
		} finally {
			o = !1;
		}
	}), { lock: () => {
		try {
			r.principal() && r.logout();
		} catch {}
	} };
}
//#endregion
//#region electron/main/index.ts
var ue = ae(import.meta.url), Y = A.dirname(ue), X = "HTT Flooring Management System", Z = () => {}, Q = null;
function de(...e) {
	return A.join(Y, "..", ...e);
}
function fe() {
	if (process.platform !== "darwin") return;
	let e = de("build", "icon.png"), t = ee.createFromPath(e);
	t.isEmpty() || m.dock?.setIcon(t);
}
function pe() {
	g.handle("statement:export-pdf", async (e, t) => {
		try {
			let n = p.fromWebContents(e.sender);
			if (!n) return {
				success: !1,
				error: "Unable to resolve the current application window."
			};
			let r = me(t.defaultFileName), i = await h.showSaveDialog(n, {
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
			return await ie(i.filePath, a), {
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
function me(e) {
	let t = e.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").replace(/\s+/g, " ").trim() || "Customer Statement";
	return t.toLowerCase().endsWith(".pdf") ? t : `${t}.pdf`;
}
function $() {
	Q = new p({
		title: X,
		width: 1440,
		height: 900,
		minWidth: 1100,
		minHeight: 700,
		show: !1,
		backgroundColor: "#f4f1eb",
		webPreferences: {
			preload: A.join(Y, "index.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1,
			sandbox: !0
		}
	}), Q.once("ready-to-show", () => {
		Q?.show();
	}), process.env.VITE_DEV_SERVER_URL ? Q.loadURL(process.env.VITE_DEV_SERVER_URL) : Q.loadFile(A.join(Y, "../dist/index.html")), Q.webContents.on("did-start-navigation", (e, t, n, r) => {
		r && !n && Z();
	}), Q.webContents.on("render-process-gone", () => Z()), Q.webContents.setWindowOpenHandler(() => ({ action: "deny" })), Q.webContents.on("will-navigate", (e, t) => {
		let n = new URL(t), r = new URL(Q.webContents.getURL());
		(n.protocol !== r.protocol || n.host !== r.host || n.pathname !== r.pathname) && e.preventDefault();
	}), Q.on("closed", () => {
		Z(), Q = null;
	});
}
var he = m.commandLine.getSwitchValue("user-data-dir");
he && m.setPath("userData", A.resolve(he)), m.requestSingleInstanceLock() || m.quit(), m.on("second-instance", () => {
	Q?.show(), Q?.focus();
}), m.setName(X), m.whenReady().then(() => {
	fe(), pe(), Z = le(A.join(m.getPath("userData"), "local-security"), () => Q).lock, $(), m.on("activate", () => {
		p.getAllWindows().length === 0 && $();
	});
}), m.on("window-all-closed", () => {
	process.platform !== "darwin" && m.quit();
});
//#endregion
export {};
