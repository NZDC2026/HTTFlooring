import { A as e, D as t, F as n, G as r, I as i, M as a, O as o, P as s, U as c, a as l, i as u, j as d, k as f, n as p, r as m, t as h } from "./businessSnapshot-DD80y9gF.js";
import { BrowserWindow as g, app as _, dialog as v, ipcMain as y, nativeImage as ee } from "electron";
import { closeSync as b, existsSync as x, fsyncSync as S, mkdirSync as C, openSync as w, readFileSync as T, realpathSync as E, renameSync as te, statSync as ne, writeFileSync as D } from "node:fs";
import { createHash as O, createHmac as k, randomBytes as A, randomUUID as j, scryptSync as re, timingSafeEqual as M } from "node:crypto";
import N, { basename as P, dirname as F, isAbsolute as I, join as L, relative as R, sep as z } from "node:path";
import { writeFile as B } from "node:fs/promises";
import { fileURLToPath as V } from "node:url";
//#region electron/security/localSecurity.ts
function H(e, t) {
	C(F(e), {
		recursive: !0,
		mode: 448
	});
	let n = `${e}.${j()}.tmp`, r = w(n, "wx", 384);
	try {
		D(r, JSON.stringify(t)), S(r);
	} finally {
		b(r);
	}
	te(n, e);
	let i = w(F(e), "r");
	try {
		S(i);
	} finally {
		b(i);
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
	if (!Array.isArray(e) || !e.length || !e.every((e) => r.includes(e))) throw Error("Choose at least one valid role.");
	return [...new Set(e)];
}
var q = (e, t) => re(e, t, 64).toString("hex"), ie = class {
	state;
	session = null;
	poisoned = !1;
	path;
	save;
	now;
	constructor(e, t = H, n = () => Date.now()) {
		if (this.path = e, this.save = t, this.now = n, x(e)) {
			let t = JSON.parse(T(e, "utf8"));
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
				if (e.previousHash !== i || n !== k("sha256", t.auditKey).update(JSON.stringify(r)).digest("hex")) throw Error("Local audit integrity check failed; access blocked.");
				i = n;
			}
			this.state = t;
		} else this.state = {
			schemaVersion: 1,
			auditKey: A(32).toString("hex"),
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
			id: j(),
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
			hash: k("sha256", this.state.auditKey).update(JSON.stringify(s)).digest("hex")
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
		if (!c(t, e)) throw this.audit("permission.denied", e, "DENIED", e), Error(`Permission denied: ${e}`);
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
		let i = A(16).toString("hex"), a = {
			id: j(),
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
		if (!n?.active || !M(r, i)) throw n && this.commit({
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
		if (typeof e.currentPassword != "string" || e.currentPassword.length > 256 || !M(Buffer.from(q(e.currentPassword, n.salt), "hex"), Buffer.from(n.passwordHash, "hex"))) throw Error("Current password is incorrect.");
		let r = G(e.password), i = A(16).toString("hex");
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
}, ae = class {
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
	async initialize(t = {}) {
		if (this.blocked) throw Error("Restart the desktop application before reopening business data.");
		if (this.initialized) return;
		if (!this.security.principal()) throw Error("Login required.");
		let n, r;
		if (x(this.path)) r = m(T(this.path, "utf8")), r.schemaVersion !== 28 && (n = structuredClone(r), h(r)), this.values = r.storage;
		else {
			if (this.security.require("users.manage"), !t || typeof t != "object" || Object.keys(t).length > 1e3) throw Error("Invalid legacy local data.");
			for (let [e, n] of Object.entries(t)) if (!e.startsWith("htt") || typeof n != "string" || n.length > 5e7) throw Error("Invalid legacy local data.");
			let e = L(F(this.path), "legacy-profile-backup-v1.json");
			x(e) || H(e, {
				schemaVersion: 1,
				capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
				storage: t
			}), this.values = { ...t }, this.security.audit("business.import", "local-desktop-profile", "INTENT", "users.manage");
		}
		let i = {
			get length() {
				return Object.keys(s.values).length;
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
		}, s = this;
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
		let c = await import("./businessEngine-DIxq_Htp.js");
		this.workspaceDefaults = c.workspaceDefaults, r && (p(r, this.workspaceDefaults), l(r.repositories, e()), d(r.repositories), o(r.repositories), this.lastCommandId = r.lastCommandId), c.initialize(() => this.security.principal()), this.automationEngine = c, this.assertPeriod = c.assertPostingPeriod, a(() => {
			if (!this.security.require("users.manage").roles.includes("ADMIN") || !this.initialized || this.blocked) throw Error("Permanent purge requires a healthy ADMIN desktop session.");
			let t = e();
			d(t);
			let n = u({
				storage: structuredClone(this.values),
				repositories: t,
				lastCommandId: this.lastCommandId
			}), r = L(F(this.path), "recycle-backups"), i = j(), a = `pre-purge-${i}.json`;
			C(r, {
				recursive: !0,
				mode: 448
			});
			let o = L(r, a);
			H(o, n);
			let s = T(o, "utf8"), c = m(s);
			if (l(c.repositories, t), d(c.repositories), JSON.stringify(c) !== JSON.stringify(n)) throw Error("Pre-purge backup verification failed.");
			return {
				id: i,
				fileName: a,
				sha256: O("sha256").update(s).digest("hex"),
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			};
		}), n && (H(L(F(this.path), `pre-migration-v${r.schemaVersion}-${j()}.json`), n), this.persist(), this.security.audit("business.migrate.v9", "local-desktop-profile", "SUCCESS", "users.manage")), r || (this.persist(), this.security.audit("business.import", "local-desktop-profile", "SUCCESS", "users.manage"));
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
	persist(t = this.lastCommandId) {
		H(this.path, u({
			storage: this.values,
			repositories: e(),
			lastCommandId: t
		})), this.lastCommandId = t;
	}
	exportBackup() {
		if (this.security.require("users.manage"), !this.initialized || this.blocked) throw Error("Backup requires healthy initialized business data.");
		let t = m(T(this.path, "utf8"));
		return l(t.repositories, e()), d(t.repositories), u({
			storage: t.storage,
			repositories: t.repositories,
			lastCommandId: t.lastCommandId
		});
	}
	prepareRestore(t) {
		let n = this.security.require("users.manage");
		this.prepared = void 0;
		let r = m(t);
		h(r), this.initialized && (p(r, this.workspaceDefaults), l(r.repositories, e()), d(r.repositories));
		let i = j();
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
	async restoreBackup(t) {
		let n = this.security.require("users.manage"), r = this.prepared;
		if (this.prepared = void 0, !r || r.token !== t || r.actor !== n.userId || r.revision !== this.lastCommandId || r.expires < Date.now()) throw Error("Restore preview expired; select the backup again.");
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
		let i = await import("./businessEngine-DIxq_Htp.js");
		if (p(r.database, i.workspaceDefaults), l(r.database.repositories, e()), d(r.database.repositories), this.security.require("users.manage").userId !== n.userId) throw Error("Restore session changed.");
		let a = this.security.pendingBusinessCommands();
		if (a.length) {
			let e = m(T(this.path, "utf8"));
			for (let t of a) this.security.audit(`recovery.${t.action}`, t.resourceId, t.commandId === e.lastCommandId ? "SUCCESS" : "FAILED", t.permission, t.commandId);
		}
		let o = j();
		if (this.security.audit("business.restore", "business-data-only", "INTENT", "users.manage", o), x(this.path)) {
			let e = L(F(this.path), "recovery-backups");
			C(e, {
				recursive: !0,
				mode: 448
			});
			let t = w(L(e, `before-restore-${o}.json`), "wx", 384);
			try {
				D(t, T(this.path)), S(t);
			} finally {
				b(t);
			}
			let n = w(e, "r");
			try {
				S(n);
			} finally {
				b(n);
			}
		}
		let s = u({
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
		let t = c(e, "audit.read") ? Object.fromEntries(Object.entries(this.values).filter(([e]) => e === "htt:financial-operations:v1" || e.startsWith("htt.purchasePosting."))) : {};
		return {
			repositories: f(e),
			storage: t
		};
	}
	command(n) {
		if (this.blocked || !this.initialized) throw Error("Business writes blocked; restart and inspect local audit.");
		if (!n || typeof n.repository != "string" || typeof n.method != "string" || !Array.isArray(n.args) || n.args.length > 20) throw Error("Invalid business command.");
		let r;
		try {
			r = t(n.repository, n.method);
		} catch (e) {
			throw this.security.audit("command.denied", `${n.repository}.${n.method}`.slice(0, 200), "DENIED"), e;
		}
		let i = this.security.require(r.permission), a = structuredClone(n.args);
		if (this.automationEngine?.assertBankInstructionCommand(n.repository, n.method, a), [
			"sales",
			"fulfilments",
			"goodsReceipts",
			"supplierBills",
			"supplierPayments",
			"supplierCredits",
			"bankTransactions",
			"bankReconciliations"
		].includes(n.repository) && a[0] && typeof a[0] == "object") {
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
			], t = a[0];
			try {
				for (let n of e) if (t[n] !== void 0) {
					if (typeof t[n] != "string") throw Error("Invalid posting date.");
					this.assertPeriod(t[n]);
				}
			} catch (e) {
				throw this.security.audit("period.denied", `${n.repository}.${n.method}`, "DENIED", r.permission), e;
			}
		}
		if (n.repository === "journals") {
			let t = a[0];
			if (n.method === "post" && (t?.sourceType !== "MANUAL_JOURNAL" || t.sourceId)) throw Error("System journals must be posted through their business source.");
			if (n.method === "reverse" && e().journals.journalEntries.find((e) => e.id === t?.journalEntryId)?.sourceType !== "MANUAL_JOURNAL") throw Error("System journals must be reversed through their business source.");
		}
		if (n.repository === "supplierPayments" && n.method === "reverse" && e().paymentBatches.batches.some((e) => e.status === "POSTED" && e.paymentIds.includes(a[0]))) throw Error("Reverse this supplier payment through its payment batch.");
		if (n.repository === "sales" && n.method === "reverseInvoicePayment" && e().customerSettlements.receipts.some((e) => e.status === "POSTED" && e.paymentIds.includes(a[0]))) throw Error("Reverse this payment through its grouped customer receipt.");
		if (n.repository === "salesRecovery" && a[0] && typeof a[0] == "object") {
			let e = a[0];
			n.method === "recordSalesManualReview" && (e.operator = i.userId), n.method === "closeVerifiedSalesReview" && (e.approver = i.userId);
		}
		if ([
			"voidInvoice",
			"voidCreditNote",
			"void",
			"markVoid",
			"voidCredit"
		].includes(n.method) && [
			"sales",
			"supplierBills",
			"supplierCredits"
		].includes(n.repository)) {
			let t = e(), n = typeof a[0] == "string" ? a[0] : a[0]?.invoiceId ?? a[0]?.creditNoteId ?? a[0]?.supplierCreditId ?? a[0]?.supplierBillId;
			if ([
				...t.sales.invoices,
				...t.customerCredits.creditNotes,
				...t.supplierBills.supplierBills,
				...t.supplierCredits.supplierCredits
			].some((e) => e.id === n && e.openingBalanceImportId)) throw Error("Historical opening documents must be corrected through the opening batch reversal.");
		}
		let s = j(), c = `${n.repository}.${n.method}`, l = typeof a[0] == "string" ? a[0].slice(0, 200) : String(a[0]?.id ?? a[0]?.invoiceId ?? n.repository).slice(0, 200);
		this.security.audit(c, l, "INTENT", r.permission, s);
		let u = e(), d = structuredClone(this.values), f;
		try {
			if (f = r.execute(a), n.repository === "bankStatements" && ["importRows", "importCsv"].includes(n.method)) {
				let t = new Set(u.bankStatements.lines.map((e) => e.id)), n = e().bankStatements.lines.filter((e) => !t.has(e.id)).map((e) => e.id);
				this.automationEngine?.classifyImportedBankLines(n, s);
			}
			if (n.repository === "sales" && n.method === "createInvoiceFromOrder" && this.assertPeriod(f.documentDate), f instanceof Promise) throw Error("Business commands must be synchronous.");
		} catch (e) {
			throw this.values = d, o(u), this.security.audit(c, l, "FAILED", r.permission, s), e;
		}
		try {
			this.persist(s);
		} catch (e) {
			throw this.values = d, o(u), this.blocked = !0, Error(`Business commit ${s} could not be confirmed: ${e instanceof Error ? e.message : String(e)}. Restart and review before retry.`);
		}
		try {
			this.security.audit(c, l, "SUCCESS", r.permission, s);
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
function oe(e, t) {
	let r = new ie(L(e, "security-v1.json")), a = new ae(L(e, "business-v1.json"), r), o = !1;
	y.on("security:request", async (c, l, u) => {
		let d = t();
		if (!d || c.sender !== d.webContents || c.senderFrame !== d.webContents.mainFrame) {
			c.returnValue = {
				ok: !1,
				error: "Untrusted desktop sender."
			};
			return;
		}
		if (o) {
			c.returnValue = {
				ok: !1,
				error: "A desktop operation is already running."
			};
			return;
		}
		o = !0;
		try {
			if (typeof l != "string" || JSON.stringify(u ?? null).length > 6e7) throw Error("Invalid desktop request.");
			let t = u ?? {}, o;
			switch (l) {
				case "status":
					o = r.status();
					break;
				case "setup":
					o = r.setup(t);
					break;
				case "login":
					o = r.login(t);
					break;
				case "logout":
					o = r.logout();
					break;
				case "users.list":
					o = r.listUsers();
					break;
				case "users.create":
					o = r.createUser(t);
					break;
				case "users.update":
					o = r.updateUser(t);
					break;
				case "password.change":
					o = r.changePassword(t);
					break;
				case "audit.list":
					o = r.listAudit(t);
					break;
				case "business.bootstrap":
					await a.initialize(t.legacyStorage), a.scanRecurringDue(), o = a.view();
					break;
				case "business.backup.save": {
					r.require("users.manage");
					let t = await v.showSaveDialog(d, {
						title: "Save business backup",
						defaultPath: `HTT-Business-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`,
						filters: [{
							name: "HTT business backup",
							extensions: ["json"]
						}]
					});
					if (t.canceled || !t.filePath) {
						o = { saved: !1 };
						break;
					}
					let n = R(E(e), L(E(F(t.filePath)), P(t.filePath)));
					if (!n || !n.startsWith(".." + z) && n !== ".." && !I(n)) throw Error("Choose a backup location outside the active local data directory.");
					let i = a.exportBackup();
					r.audit("business.backup", "business-data-only", "INTENT", "users.manage");
					try {
						H(t.filePath, i);
					} catch (e) {
						throw r.audit("business.backup", "business-data-only", "FAILED", "users.manage"), e;
					}
					r.audit("business.backup", "business-data-only", "SUCCESS", "users.manage"), o = { saved: !0 };
					break;
				}
				case "business.restore.preview": {
					r.require("users.manage");
					let e = await v.showOpenDialog(d, {
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
					o = a.prepareRestore(T(e.filePaths[0], "utf8"));
					break;
				}
				case "business.restore.commit":
					await a.restoreBackup(t.token), o = { restartRequired: !0 };
					break;
				case "attachments.select": {
					r.require("inventory.read"), a.command({
						repository: "attachments",
						method: "checkTarget",
						args: [t.target]
					});
					let e = await v.showOpenDialog(d, {
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
						o = { saved: !1 };
						break;
					}
					let n = i(e.filePaths[0]);
					o = {
						saved: !0,
						...a.command({
							repository: "attachments",
							method: "upload",
							args: [{
								...t,
								file: {
									name: P(e.filePaths[0]),
									content: n.toString("base64")
								}
							}]
						})
					};
					break;
				}
				case "attachments.export": {
					r.require("inventory.read");
					let i = a.command({
						repository: "attachments",
						method: "read",
						args: [t]
					}).result, c = await v.showSaveDialog(d, {
						title: "Export attachment version",
						defaultPath: i.name
					});
					if (c.canceled || !c.filePath) {
						o = { saved: !1 };
						break;
					}
					let l = R(E(e), L(E(F(c.filePath)), P(c.filePath)));
					if (!l || !l.startsWith(".." + z) && l !== ".." && !I(l)) throw Error("Choose an export location outside the active local data directory.");
					r.audit("attachments.export", String(t.id) + "/" + String(t.versionId), "INTENT", "inventory.read");
					try {
						let e = a.command({
							repository: "attachments",
							method: "read",
							args: [t]
						}).result;
						s(L(E(F(c.filePath)), P(c.filePath)), n(e));
					} catch (e) {
						throw r.audit("attachments.export", String(t.id) + "/" + String(t.versionId), "FAILED", "inventory.read"), e;
					}
					r.audit("attachments.export", String(t.id) + "/" + String(t.versionId), "SUCCESS", "inventory.read"), o = { saved: !0 };
					break;
				}
				case "business.recurring.scan":
					if (r.require("inventory.read"), Object.keys(t).length) throw Error("Recurring scan does not accept caller dates, actors or limits.");
					o = {
						result: a.scanRecurringDue(),
						view: a.view()
					};
					break;
				case "business.command":
					o = a.command(t);
					break;
				default: throw Error("Unknown desktop security action.");
			}
			c.returnValue = {
				ok: !0,
				value: o
			};
		} catch (e) {
			c.returnValue = {
				ok: !1,
				error: e instanceof Error ? e.message : "Desktop operation failed."
			};
		} finally {
			o = !1;
		}
	});
	let c = !1, l = setInterval(() => {
		if (!(o || c)) {
			o = !0;
			try {
				a.scanRecurringDue();
			} catch (e) {
				c = !0, console.error("Local recurring scan stopped:", e instanceof Error ? e.message : "Restart and inspect business data.");
			} finally {
				o = !1;
			}
		}
	}, 6e4);
	return l.unref(), {
		dispose: () => clearInterval(l),
		lock: () => {
			try {
				r.principal() && r.logout();
			} catch {}
		}
	};
}
//#endregion
//#region electron/main/index.ts
var se = V(import.meta.url), J = N.dirname(se), Y = "HTT Flooring Management System", X = () => {}, Z = null;
function ce(...e) {
	return N.join(J, "..", ...e);
}
function le() {
	if (process.platform !== "darwin") return;
	let e = ce("build", "icon.png"), t = ee.createFromPath(e);
	t.isEmpty() || _.dock?.setIcon(t);
}
function ue() {
	y.handle("statement:export-pdf", async (e, t) => {
		try {
			let n = g.fromWebContents(e.sender);
			if (!n) return {
				success: !1,
				error: "Unable to resolve the current application window."
			};
			let r = de(t.defaultFileName), i = await v.showSaveDialog(n, {
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
			return await B(i.filePath, a), {
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
function de(e) {
	let t = e.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").replace(/\s+/g, " ").trim() || "Customer Statement";
	return t.toLowerCase().endsWith(".pdf") ? t : `${t}.pdf`;
}
function Q() {
	Z = new g({
		title: Y,
		width: 1440,
		height: 900,
		minWidth: 1100,
		minHeight: 700,
		show: !1,
		backgroundColor: "#f4f1eb",
		webPreferences: {
			preload: N.join(J, "index.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1,
			sandbox: !0
		}
	}), Z.once("ready-to-show", () => {
		Z?.show();
	}), process.env.VITE_DEV_SERVER_URL ? Z.loadURL(process.env.VITE_DEV_SERVER_URL) : Z.loadFile(N.join(J, "../dist/index.html")), Z.webContents.on("did-start-navigation", (e, t, n, r) => {
		r && !n && X();
	}), Z.webContents.on("render-process-gone", () => X()), Z.webContents.setWindowOpenHandler(() => ({ action: "deny" })), Z.webContents.on("will-navigate", (e, t) => {
		let n = new URL(t), r = new URL(Z.webContents.getURL());
		(n.protocol !== r.protocol || n.host !== r.host || n.pathname !== r.pathname) && e.preventDefault();
	}), Z.on("closed", () => {
		X(), Z = null;
	});
}
var $ = _.commandLine.getSwitchValue("user-data-dir");
$ && _.setPath("userData", N.resolve($)), _.requestSingleInstanceLock() || _.quit(), _.on("second-instance", () => {
	Z?.show(), Z?.focus();
}), _.setName(Y), _.whenReady().then(() => {
	le(), ue(), X = oe(N.join(_.getPath("userData"), "local-security"), () => Z).lock, Q(), _.on("activate", () => {
		g.getAllWindows().length === 0 && Q();
	});
}), _.on("window-all-closed", () => {
	process.platform !== "darwin" && _.quit();
});
//#endregion
export {};
