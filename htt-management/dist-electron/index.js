import { a as e, c as t, i as n, o as r, s as i, u as a } from "./repositoryHost-CMrgEnmW.js";
import { BrowserWindow as o, app as s, dialog as c, ipcMain as l, nativeImage as u } from "electron";
import d, { dirname as f, join as p } from "node:path";
import { createHmac as m, randomBytes as h, randomUUID as g, scryptSync as _, timingSafeEqual as v } from "node:crypto";
import { closeSync as y, existsSync as b, fsyncSync as x, mkdirSync as S, openSync as C, readFileSync as w, renameSync as T, writeFileSync as E } from "node:fs";
import { writeFile as D } from "node:fs/promises";
import { fileURLToPath as O } from "node:url";
//#region electron/security/localSecurity.ts
function k(e, t) {
	S(f(e), {
		recursive: !0,
		mode: 448
	});
	let n = `${e}.${g()}.tmp`, r = C(n, "wx", 384);
	try {
		E(r, JSON.stringify(t)), x(r);
	} finally {
		y(r);
	}
	T(n, e);
	let i = C(f(e), "r");
	try {
		x(i);
	} finally {
		y(i);
	}
}
var A = ({ id: e, username: t, displayName: n, roles: r, active: i }) => ({
	id: e,
	username: t,
	displayName: n,
	roles: [...r],
	active: i
});
function j(e) {
	if (typeof e != "string" || !/^[a-z0-9][a-z0-9._-]{2,63}$/.test(e.trim().toLowerCase())) throw Error("Username must contain 3–64 letters, numbers, dots, underscores or hyphens.");
	return e.trim().toLowerCase();
}
function M(e) {
	if (typeof e != "string" || e.length < 12 || e.length > 256) throw Error("Password must contain 12–256 characters.");
	return e;
}
function N(e) {
	if (!Array.isArray(e) || !e.length || !e.every((e) => a.includes(e))) throw Error("Choose at least one valid role.");
	return [...new Set(e)];
}
var P = (e, t) => _(e, t, 64).toString("hex"), F = class {
	state;
	session = null;
	poisoned = !1;
	path;
	save;
	now;
	constructor(e, t = k, n = () => Date.now()) {
		if (this.path = e, this.save = t, this.now = n, b(e)) {
			let t = JSON.parse(w(e, "utf8"));
			if (t?.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(t.auditKey) || !Array.isArray(t.users) || !Array.isArray(t.audit)) throw Error("Invalid local security database; access blocked.");
			let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
			for (let e of t.users) {
				if (!e.id || n.has(e.id) || r.has(e.username) || j(e.username) !== e.username || typeof e.displayName != "string" || typeof e.active != "boolean" || !Number.isFinite(e.failures) || !Number.isFinite(e.lockedUntil) || !/^[a-f0-9]{32}$/.test(e.salt) || !/^[a-f0-9]{128}$/.test(e.passwordHash)) throw Error("Invalid local user data; access blocked.");
				N(e.roles), n.add(e.id), r.add(e.username);
			}
			if (t.users.length && !t.users.some((e) => e.active && e.roles.includes("ADMIN"))) throw Error("No active administrator; access blocked.");
			let i = "";
			for (let e of t.audit) {
				let { hash: n, ...r } = e;
				if (e.previousHash !== i || n !== m("sha256", t.auditKey).update(JSON.stringify(r)).digest("hex")) throw Error("Local audit integrity check failed; access blocked.");
				i = n;
			}
			this.state = t;
		} else this.state = {
			schemaVersion: 1,
			auditKey: h(32).toString("hex"),
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
			id: g(),
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
			hash: m("sha256", this.state.auditKey).update(JSON.stringify(s)).digest("hex")
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
			user: A(t),
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
		let n = j(e.username), r = M(e.password);
		if (!e.displayName?.trim() || e.displayName.trim().length > 100) throw Error("Display name is required (maximum 100 characters).");
		if (this.state.users.some((e) => e.username === n)) throw Error("Username already exists.");
		let i = h(16).toString("hex"), a = {
			id: g(),
			username: n,
			displayName: e.displayName.trim(),
			roles: N(t),
			active: !0,
			salt: i,
			passwordHash: P(r, i),
			failures: 0,
			lockedUntil: 0
		};
		return this.commit({
			...this.state,
			users: [...this.state.users, a]
		}), this.audit("user.created", a.id, "SUCCESS", "users.manage", void 0, this.principal()?.userId ?? a.id), A(a);
	}
	login(e) {
		this.session = null;
		let t = j(e.username);
		if (typeof e.password != "string" || e.password.length > 256) throw Error("Invalid username or password.");
		let n = this.state.users.find((e) => e.username === t);
		if (n && n.lockedUntil > this.now()) throw Error("Too many login attempts; try again later.");
		let r = Buffer.from(P(e.password, n?.salt ?? "unavailable-account"), "hex"), i = n ? Buffer.from(n.passwordHash, "hex") : Buffer.alloc(64);
		if (!n?.active || !v(r, i)) throw n && this.commit({
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
		return this.require("users.manage"), this.state.users.map(A);
	}
	createUser(e) {
		return this.require("users.manage"), this.addUser(e, e.roles);
	}
	updateUser(e) {
		let t = this.require("users.manage"), n = N(e.roles);
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
		if (typeof e.currentPassword != "string" || e.currentPassword.length > 256 || !v(Buffer.from(P(e.currentPassword, n.salt), "hex"), Buffer.from(n.passwordHash, "hex"))) throw Error("Current password is incorrect.");
		let r = M(e.password), i = h(16).toString("hex");
		this.audit("user.password", n.id, "INTENT"), this.commit({
			...this.state,
			users: this.state.users.map((e) => e.id === n.id ? {
				...e,
				salt: i,
				passwordHash: P(r, i)
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
}, I = class {
	values = {};
	initialized = !1;
	blocked = !1;
	lastCommandId;
	path;
	security;
	constructor(e, t) {
		this.path = e, this.security = t;
	}
	async initialize(t = {}) {
		if (this.initialized) return;
		if (!this.security.principal()) throw Error("Login required.");
		let n;
		if (b(this.path)) {
			if (n = JSON.parse(w(this.path, "utf8")), n?.schemaVersion !== 1 || !n.storage || !n.repositories || typeof n.storage != "object" || Array.isArray(n.storage) || !Object.values(n.storage).every((e) => typeof e == "string")) throw Error("Invalid business database; writes blocked.");
			this.values = n.storage;
		} else {
			if (this.security.require("users.manage"), !t || typeof t != "object" || Object.keys(t).length > 1e3) throw Error("Invalid legacy local data.");
			for (let [e, n] of Object.entries(t)) if (!e.startsWith("htt") || typeof n != "string" || n.length > 5e7) throw Error("Invalid legacy local data.");
			let e = p(f(this.path), "legacy-profile-backup-v1.json");
			b(e) || k(e, {
				schemaVersion: 1,
				capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
				storage: t
			}), this.values = { ...t }, this.security.audit("business.import", "local-desktop-profile", "INTENT", "users.manage");
		}
		let r = {
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
			value: r
		}), Object.defineProperty(globalThis, "window", {
			configurable: !0,
			value: { localStorage: r }
		});
		let o = await import("./businessEngine-BxlFSKZ0.js");
		if (n) {
			let t = i(), r = Object.keys(t).sort();
			if (JSON.stringify(Object.keys(n.repositories).sort()) !== JSON.stringify(r)) throw Error("Business repository schema mismatch; migration required.");
			for (let e of r) {
				let r = t[e], i = n.repositories[e];
				if (Array.isArray(r) ? !Array.isArray(i) : !i || typeof i != "object" || Object.keys(r).some((e) => !Array.isArray(i[e]))) throw Error(`Invalid ${e} snapshot; writes blocked.`);
			}
			e(n.repositories), this.lastCommandId = n.lastCommandId;
		}
		o.initialize(() => this.security.principal()), n || (this.persist(), this.security.audit("business.import", "local-desktop-profile", "SUCCESS", "users.manage"));
		for (let e of this.security.pendingBusinessCommands()) this.security.audit(`recovery.${e.action}`, e.resourceId, e.commandId === this.lastCommandId ? "SUCCESS" : "FAILED", e.permission, e.commandId);
		this.initialized = !0;
	}
	persist(e = this.lastCommandId) {
		k(this.path, {
			schemaVersion: 1,
			storage: this.values,
			repositories: i(),
			lastCommandId: e
		}), this.lastCommandId = e;
	}
	view() {
		let e = this.security.principal();
		if (!e || !this.initialized) throw Error("Login and desktop data initialization required.");
		let n = t(e, "audit.read") ? Object.fromEntries(Object.entries(this.values).filter(([e]) => e === "htt:financial-operations:v1" || e.startsWith("htt.purchasePosting."))) : {};
		return {
			repositories: r(e),
			storage: n
		};
	}
	command(t) {
		if (this.blocked || !this.initialized) throw Error("Business writes blocked; restart and inspect local audit.");
		if (!t || typeof t.repository != "string" || typeof t.method != "string" || !Array.isArray(t.args) || t.args.length > 20) throw Error("Invalid business command.");
		let r;
		try {
			r = n(t.repository, t.method);
		} catch (e) {
			throw this.security.audit("command.denied", `${t.repository}.${t.method}`.slice(0, 200), "DENIED"), e;
		}
		let a = this.security.require(r.permission), o = structuredClone(t.args);
		if (t.repository === "journals") {
			let e = o[0];
			if (t.method === "post" && (e?.sourceType !== "MANUAL_JOURNAL" || e.sourceId)) throw Error("System journals must be posted through their business source.");
			if (t.method === "reverse" && i().journals.journalEntries.find((t) => t.id === e?.journalEntryId)?.sourceType !== "MANUAL_JOURNAL") throw Error("System journals must be reversed through their business source.");
		}
		if (t.repository === "salesRecovery" && o[0] && typeof o[0] == "object") {
			let e = o[0];
			t.method === "recordSalesManualReview" && (e.operator = a.userId), t.method === "closeVerifiedSalesReview" && (e.approver = a.userId);
		}
		let s = g(), c = `${t.repository}.${t.method}`, l = typeof o[0] == "string" ? o[0].slice(0, 200) : String(o[0]?.id ?? o[0]?.invoiceId ?? t.repository).slice(0, 200);
		this.security.audit(c, l, "INTENT", r.permission, s);
		let u = i(), d = structuredClone(this.values), f;
		try {
			if (f = r.execute(o), f instanceof Promise) throw Error("Business commands must be synchronous.");
		} catch (t) {
			throw this.values = d, e(u), this.security.audit(c, l, "FAILED", r.permission, s), t;
		}
		try {
			this.persist(s);
		} catch (t) {
			throw this.values = d, e(u), this.blocked = !0, Error(`Business commit ${s} could not be confirmed: ${t instanceof Error ? t.message : String(t)}. Restart and review before retry.`);
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
function L(e, t) {
	let n = new F(p(e, "security-v1.json")), r = new I(p(e, "business-v1.json"), n), i = !1;
	return l.on("security:request", async (e, a, o) => {
		let s = t();
		if (!s || e.sender !== s.webContents || e.senderFrame !== s.webContents.mainFrame) {
			e.returnValue = {
				ok: !1,
				error: "Untrusted desktop sender."
			};
			return;
		}
		if (i) {
			e.returnValue = {
				ok: !1,
				error: "A desktop operation is already running."
			};
			return;
		}
		i = !0;
		try {
			if (typeof a != "string" || JSON.stringify(o ?? null).length > 6e7) throw Error("Invalid desktop request.");
			let t = o ?? {}, i;
			switch (a) {
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
				case "business.command":
					i = r.command(t);
					break;
				default: throw Error("Unknown desktop security action.");
			}
			e.returnValue = {
				ok: !0,
				value: i
			};
		} catch (t) {
			e.returnValue = {
				ok: !1,
				error: t instanceof Error ? t.message : "Desktop operation failed."
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
var R = O(import.meta.url), z = d.dirname(R), B = "HTT Flooring Management System", V = () => {}, H = null;
function U(...e) {
	return d.join(z, "..", ...e);
}
function W() {
	if (process.platform !== "darwin") return;
	let e = U("build", "icon.png"), t = u.createFromPath(e);
	t.isEmpty() || s.dock?.setIcon(t);
}
function G() {
	l.handle("statement:export-pdf", async (e, t) => {
		try {
			let n = o.fromWebContents(e.sender);
			if (!n) return {
				success: !1,
				error: "Unable to resolve the current application window."
			};
			let r = K(t.defaultFileName), i = await c.showSaveDialog(n, {
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
			return await D(i.filePath, a), {
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
function K(e) {
	let t = e.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").replace(/\s+/g, " ").trim() || "Customer Statement";
	return t.toLowerCase().endsWith(".pdf") ? t : `${t}.pdf`;
}
function q() {
	H = new o({
		title: B,
		width: 1440,
		height: 900,
		minWidth: 1100,
		minHeight: 700,
		show: !1,
		backgroundColor: "#f4f1eb",
		webPreferences: {
			preload: d.join(z, "index.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1,
			sandbox: !0
		}
	}), H.once("ready-to-show", () => {
		H?.show();
	}), process.env.VITE_DEV_SERVER_URL ? H.loadURL(process.env.VITE_DEV_SERVER_URL) : H.loadFile(d.join(z, "../dist/index.html")), H.webContents.on("did-start-navigation", (e, t, n, r) => {
		r && !n && V();
	}), H.webContents.on("render-process-gone", () => V()), H.webContents.setWindowOpenHandler(() => ({ action: "deny" })), H.webContents.on("will-navigate", (e, t) => {
		let n = new URL(t), r = new URL(H.webContents.getURL());
		(n.protocol !== r.protocol || n.host !== r.host || n.pathname !== r.pathname) && e.preventDefault();
	}), H.on("closed", () => {
		V(), H = null;
	});
}
var J = s.commandLine.getSwitchValue("user-data-dir");
J && s.setPath("userData", d.resolve(J)), s.requestSingleInstanceLock() || s.quit(), s.on("second-instance", () => {
	H?.show(), H?.focus();
}), s.setName(B), s.whenReady().then(() => {
	W(), G(), V = L(d.join(s.getPath("userData"), "local-security"), () => H).lock, q(), s.on("activate", () => {
		o.getAllWindows().length === 0 && q();
	});
}), s.on("window-all-closed", () => {
	process.platform !== "darwin" && s.quit();
});
//#endregion
export {};
