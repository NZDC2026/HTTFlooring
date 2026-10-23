import { $t as e, C as t, Cn as n, Dn as r, Ot as i, Q as a, Qt as o, Tn as s, Xt as c, Zt as l, _n as u, a as d, bn as f, c as p, cn as m, d as ee, dn as h, en as g, f as te, fn as _, gn as v, hn as y, i as ne, in as re, ln as ie, n as ae, o as oe, pn as b, r as x, t as se, u as ce, w as le, xn as ue, y as de, yn as S } from "./businessSnapshot-BhalBeLs.js";
import { appendFileSync as fe, closeSync as pe, existsSync as C, fsyncSync as me, mkdirSync as he, openSync as ge, readFileSync as w, realpathSync as T, renameSync as _e, statSync as ve, writeFileSync as ye } from "node:fs";
import be, { basename as xe, dirname as E, isAbsolute as Se, join as D, relative as Ce, sep as we } from "node:path";
import { createHash as O, createHmac as Te, randomBytes as Ee, randomUUID as k, scryptSync as De, timingSafeEqual as Oe } from "node:crypto";
import { BrowserWindow as ke, Menu as Ae, app as A, dialog as j, ipcMain as je, nativeImage as Me, safeStorage as M, shell as Ne } from "electron";
import { writeFile as Pe } from "node:fs/promises";
import { fileURLToPath as Fe } from "node:url";
//#region electron/main/operationalLog.ts
var Ie = /* @__PURE__ */ new Set([
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
]), Le = class {
	directory;
	session = k();
	available = !0;
	alerts = /* @__PURE__ */ new Set();
	version;
	maxBytes;
	constructor(e, t, n = 262144) {
		this.version = t, this.maxBytes = n, this.directory = D(e, "diagnostics");
		try {
			he(this.directory, {
				recursive: !0,
				mode: 448
			});
			let e = D(this.directory, "session.json");
			if (C(e)) try {
				JSON.parse(w(e, "utf8")).clean !== !0 && this.event("previous-unclean-exit");
			} catch {
				this.event("previous-unclean-exit");
			}
			ye(e, JSON.stringify({
				session: this.session,
				clean: !1
			}), { mode: 384 }), this.event("start");
		} catch {
			this.available = !1;
		}
	}
	event(e) {
		if (Ie.has(e) && ([
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
			let t = D(this.directory, "operations.jsonl");
			if (C(t) && ve(t).size >= this.maxBytes) for (let e = 2; e >= 1; e--) {
				let n = e === 1 ? t : `${t}.${e - 1}`;
				C(n) && _e(n, `${t}.${e}`);
			}
			fe(t, JSON.stringify({
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
			ye(D(this.directory, "session.json"), JSON.stringify({
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
}, N = S().max(500), P = S().min(1).max(200), Re = v().int().nonnegative().max(0x5af3107a4000), ze = [
	"STP_PAY",
	"STP_UPDATE",
	"STP_FINALISE",
	"STP_UNFINALISE",
	"SUPER_CONTRIBUTION"
], Be = [
	"GROSS",
	"PAID_LEAVE",
	"OVERTIME",
	"ALLOWANCE",
	"DEDUCTION",
	"PAYG",
	"SG",
	"RESC"
], Ve = u({
	employer: u({
		abn: N,
		branch: N,
		contactName: N,
		email: N,
		phone: N,
		historyFrom: N,
		historyConfirmed: b()
	}).strict(),
	employees: _(u({
		employeeId: P,
		payrollId: N,
		givenName: N,
		familyName: N,
		dateOfBirth: N,
		address: N,
		suburb: N,
		state: N,
		postcode: N,
		incomeType: y("SAW"),
		employmentBasis: h([
			"F",
			"P",
			"C"
		]),
		taxTreatment: N,
		usi: N,
		fundAbn: N
	}).strict()).max(500),
	items: _(u({
		itemId: P,
		category: h(Be),
		providerCode: N
	}).strict()).max(500)
}).strict(), He = () => ({
	employer: {
		abn: "",
		branch: "",
		contactName: "",
		email: "",
		phone: "",
		historyFrom: "",
		historyConfirmed: !1
	},
	employees: [],
	items: []
}), Ue = u({
	providerName: N,
	adapterId: P,
	documentationUrl: N,
	apiKey: S().max(2e3),
	tenantId: N,
	enabled: b(),
	production: b(),
	contractReference: N
}).strict(), We = () => ({
	providerName: "",
	adapterId: "UNCONFIGURED",
	documentationUrl: "",
	apiKey: "",
	tenantId: "",
	enabled: !1,
	production: !1,
	contractReference: ""
}), Ge = u(Object.fromEntries(Be.map((e) => [e, Re]))).strict(), Ke = u({
	id: P,
	kind: h(ze),
	financialYear: S().regex(/^\d{4}-\d{4}$/),
	asOf: S().length(10),
	runId: P.optional(),
	predecessorId: P.optional(),
	sourceDigest: S().length(64),
	createdAt: v().finite(),
	createdBy: P,
	employer: Ve.shape.employer,
	employeeRows: _(u({
		employeeId: P,
		payrollId: P,
		givenName: N,
		familyName: N,
		dateOfBirth: N,
		address: N,
		suburb: N,
		state: N,
		postcode: N,
		incomeType: y("SAW"),
		employmentBasis: h([
			"F",
			"P",
			"C"
		]),
		taxTreatment: N,
		tfn: N,
		fundName: N,
		memberId: N,
		usi: N,
		fundAbn: N,
		components: _(u({
			itemId: P,
			code: N,
			category: h(Be),
			providerCode: N,
			ytdCents: Re,
			periodCents: Re
		}).strict()).max(500),
		ytd: Ge,
		period: Ge
	}).strict()).min(1).max(500),
	sourceEvidence: _(u({
		runId: P,
		journalId: P,
		sourceToken: P,
		payDate: N,
		slipsDigest: S().length(64)
	}).strict()).max(5e3),
	runIds: _(P).max(5e3),
	totalSuperCents: Re,
	notice: y("INTERNAL_REVIEW_NOT_PROVIDER_OR_ATO_FORMAT")
}).strict(), qe = u({
	requestId: P,
	providerId: P,
	reportId: P,
	sourceDigest: S().length(64),
	employerAbn: S(),
	status: h([
		"PROVIDER_RECEIVED",
		"PROCESSING",
		"ACCEPTED",
		"REJECTED",
		"PARTIAL",
		"FUND_RECEIVED"
	]),
	authorityReference: N.optional(),
	memberReceipts: _(u({
		payrollId: P,
		fundAbn: N,
		usi: N,
		memberId: N,
		amountCents: Re,
		reference: P,
		receivedAt: v().finite()
	}).strict()).max(500).optional()
}).strict(), Je = u({
	id: P,
	reportId: P,
	ownerId: P,
	requestId: P,
	credentialRevision: S().length(64),
	status: h([
		"QUEUED",
		"SENDING",
		"UNCERTAIN",
		"PROVIDER_RECEIVED",
		"PROCESSING",
		"ACCEPTED",
		"REJECTED",
		"PARTIAL",
		"FUND_RECEIVED",
		"CANCELLED"
	]),
	providerId: P.optional(),
	authorityReference: N.optional(),
	receipts: _(u({
		at: v().finite(),
		evidence: qe
	}).strict()).max(500),
	receipt: qe.optional(),
	attempted: b(),
	nextAt: v().finite(),
	error: N.optional(),
	declaration: u({
		name: P,
		reason: S().min(10).max(2e3),
		at: v().finite(),
		actorId: P
	}).strict(),
	history: _(u({
		at: v().finite(),
		event: P
	}).strict()).max(500)
}).strict();
//#endregion
//#region electron/security/localSecurity.ts
function F(e, t) {
	he(E(e), {
		recursive: !0,
		mode: 448
	});
	let n = `${e}.${k()}.tmp`, r = ge(n, "wx", 384);
	try {
		ye(r, JSON.stringify(t)), me(r);
	} finally {
		pe(r);
	}
	_e(n, e);
	let i = ge(E(e), "r");
	try {
		me(i);
	} finally {
		pe(i);
	}
}
var Ye = ({ id: e, username: t, displayName: n, roles: r, active: i }) => ({
	id: e,
	username: t,
	displayName: n,
	roles: [...r],
	active: i
});
function Xe(e) {
	if (typeof e != "string" || !/^[a-z0-9][a-z0-9._-]{2,63}$/.test(e.trim().toLowerCase())) throw Error("Username must contain 3–64 letters, numbers, dots, underscores or hyphens.");
	return e.trim().toLowerCase();
}
function Ze(e) {
	if (typeof e != "string" || e.length < 12 || e.length > 256) throw Error("Password must contain 12–256 characters.");
	return e;
}
function Qe(e) {
	if (!Array.isArray(e) || !e.length || !e.every((e) => ie.includes(e))) throw Error("Choose at least one valid role.");
	return [...new Set(e)];
}
var $e = (e, t) => De(e, t, 64).toString("hex"), et = class {
	state;
	session = null;
	poisoned = !1;
	path;
	save;
	now;
	constructor(e, t = F, n = () => Date.now()) {
		if (this.path = e, this.save = t, this.now = n, C(e)) {
			let t = JSON.parse(w(e, "utf8"));
			if (t?.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(t.auditKey) || !Array.isArray(t.users) || !Array.isArray(t.audit)) throw Error("Invalid local security database; access blocked.");
			let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
			for (let e of t.users) {
				if (!e.id || n.has(e.id) || r.has(e.username) || Xe(e.username) !== e.username || typeof e.displayName != "string" || typeof e.active != "boolean" || !Number.isFinite(e.failures) || !Number.isFinite(e.lockedUntil) || !/^[a-f0-9]{32}$/.test(e.salt) || !/^[a-f0-9]{128}$/.test(e.passwordHash)) throw Error("Invalid local user data; access blocked.");
				Qe(e.roles), n.add(e.id), r.add(e.username);
			}
			if (t.users.length && !t.users.some((e) => e.active && e.roles.includes("ADMIN"))) throw Error("No active administrator; access blocked.");
			let i = "";
			for (let e of t.audit) {
				let { hash: n, ...r } = e;
				if (e.previousHash !== i || n !== Te("sha256", t.auditKey).update(JSON.stringify(r)).digest("hex")) throw Error("Local audit integrity check failed; access blocked.");
				i = n;
			}
			this.state = t;
		} else this.state = {
			schemaVersion: 1,
			auditKey: Ee(32).toString("hex"),
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
			id: k(),
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
			hash: Te("sha256", this.state.auditKey).update(JSON.stringify(s)).digest("hex")
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
		if (!m(t, e)) throw this.audit("permission.denied", e, "DENIED", e), Error(`Permission denied: ${e}`);
		return this.session.idleUntil = Math.min(this.now() + 18e5, this.session.absoluteUntil), t;
	}
	status() {
		let e = this.principal(), t = e && this.state.users.find((t) => t.id === e.userId), n = t ? {
			user: Ye(t),
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
		let n = Xe(e.username), r = Ze(e.password);
		if (!e.displayName?.trim() || e.displayName.trim().length > 100) throw Error("Display name is required (maximum 100 characters).");
		if (this.state.users.some((e) => e.username === n)) throw Error("Username already exists.");
		let i = Ee(16).toString("hex"), a = {
			id: k(),
			username: n,
			displayName: e.displayName.trim(),
			roles: Qe(t),
			active: !0,
			salt: i,
			passwordHash: $e(r, i),
			failures: 0,
			lockedUntil: 0
		};
		return this.commit({
			...this.state,
			users: [...this.state.users, a]
		}), this.audit("user.created", a.id, "SUCCESS", "users.manage", void 0, this.principal()?.userId ?? a.id), Ye(a);
	}
	login(e) {
		this.session = null;
		let t = Xe(e.username);
		if (typeof e.password != "string" || e.password.length > 256) throw Error("Invalid username or password.");
		let n = this.state.users.find((e) => e.username === t);
		if (n && n.lockedUntil > this.now()) throw Error("Too many login attempts; try again later.");
		let r = Buffer.from($e(e.password, n?.salt ?? "unavailable-account"), "hex"), i = n ? Buffer.from(n.passwordHash, "hex") : Buffer.alloc(64);
		if (!n?.active || !Oe(r, i)) throw n && this.commit({
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
		return this.require("users.manage"), this.state.users.map(Ye);
	}
	createUser(e) {
		return this.require("users.manage"), this.addUser(e, e.roles);
	}
	updateUser(e) {
		let t = this.require("users.manage"), n = Qe(e.roles);
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
		if (typeof e.currentPassword != "string" || e.currentPassword.length > 256 || !Oe(Buffer.from($e(e.currentPassword, n.salt), "hex"), Buffer.from(n.passwordHash, "hex"))) throw Error("Current password is incorrect.");
		let r = Ze(e.password), i = Ee(16).toString("hex");
		this.audit("user.password", n.id, "INTENT"), this.commit({
			...this.state,
			users: this.state.users.map((e) => e.id === n.id ? {
				...e,
				salt: i,
				passwordHash: $e(r, i)
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
}, I = (e) => O("sha256").update(JSON.stringify(e)).digest("hex"), tt = u({
	version: y(1),
	profile: Ve,
	profileRevision: v().int().nonnegative(),
	configuration: Ue,
	profileHistory: _(u({
		at: v().finite(),
		actorId: S(),
		reason: S().min(10).max(2e3),
		digest: S().length(64)
	}).strict()).max(2e3),
	reports: _(Ke).max(1e3),
	jobs: _(Je).max(1e3),
	manualReviews: _(u({
		id: S(),
		reportId: S(),
		actorId: S(),
		reference: S().min(1).max(200),
		notes: S().min(10).max(2e3),
		at: v().finite()
	}).strict()).max(2e3)
}).strict(), nt = class {
	path;
	codec;
	state;
	constructor(e, t) {
		if (this.path = D(e, "payroll-filing-v1.json"), this.codec = t, C(this.path)) try {
			if (!t.available()) throw Error();
			let e = w(this.path, "utf8");
			if (Buffer.byteLength(e) > 75e6) throw Error();
			let n = JSON.parse(e);
			if (n.version !== 1 || n.checksum !== I(n.cipher)) throw Error();
			this.state = this.validate(JSON.parse(t.decrypt(Buffer.from(n.cipher, "base64"))));
		} catch {
			throw Error("Payroll filing journal cannot be decrypted or verified. Preserve the full profile and OS credentials; do not reset it to submit again.");
		}
		else this.state = {
			version: 1,
			profile: He(),
			profileRevision: 0,
			configuration: We(),
			profileHistory: [],
			reports: [],
			jobs: [],
			manualReviews: []
		};
	}
	validate(e) {
		let t = tt.parse(e);
		if (new Set(t.reports.map((e) => e.id)).size !== t.reports.length || new Set(t.jobs.map((e) => e.id)).size !== t.jobs.length || new Set(t.jobs.map((e) => e.requestId)).size !== t.jobs.length || t.jobs.some((e) => !t.reports.some((t) => t.id === e.reportId)) || t.reports.some((e) => e.predecessorId && !t.reports.some((t) => t.id === e.predecessorId)) || t.manualReviews.some((e) => !t.reports.some((t) => t.id === e.reportId))) throw Error("Filing journal references are invalid.");
		return t;
	}
	read() {
		return structuredClone(this.state);
	}
	change(e) {
		if (!this.codec.available()) throw Error("OS protected storage is required for filing identities and reports.");
		let t = this.read();
		e(t);
		let n = this.validate(t), r = JSON.stringify(n);
		if (Buffer.byteLength(r) > 5e7) throw Error("Payroll filing quota reached. Preserve the complete profile before archiving.");
		let i = this.codec.encrypt(r).toString("base64");
		F(this.path, {
			version: 1,
			cipher: i,
			checksum: I(i)
		}), this.state = n;
	}
}, rt = class {
	entries;
	constructor(e = []) {
		if (new Set(e.map((e) => e.id)).size !== e.length) throw Error("Duplicate payroll connectors.");
		this.entries = new Map(e.map((e) => [e.id, e]));
	}
	list() {
		return [...this.entries.values()].map((e) => ({
			id: e.id,
			name: e.name
		}));
	}
	require(e) {
		let t = this.entries.get(e);
		if (!t) throw Error("A verified provider-specific payroll connector is not installed. Obtain the STP/SuperStream provider contract before enabling transmission.");
		return t;
	}
};
//#endregion
//#region electron/payroll-filing/report.ts
function it(e) {
	if (!/^\d{11}$/.test(e)) return !1;
	let t = [
		10,
		1,
		3,
		5,
		7,
		9,
		11,
		13,
		15,
		17,
		19
	];
	return [...e].reduce((e, n, r) => e + (Number(n) - +(r === 0)) * t[r], 0) % 89 == 0;
}
var at = () => Object.fromEntries(Be.map((e) => [e, 0])), ot = (e) => {
	if (!Number.isFinite(e) || e < 0 || Math.abs(e * 100 - Math.round(e * 100)) > 1e-5) throw Error("Payroll source amounts must be non-negative whole cents.");
	return Math.round(e * 100);
};
function st(e, t, n) {
	if (!["STP_PAY", "SUPER_CONTRIBUTION"].includes(n.kind) && n.runId) throw Error("YTD events do not select an individual pay run.");
	if (!["STP_UPDATE", "STP_UNFINALISE"].includes(n.kind) && n.predecessorId) throw Error("Only corrections and unfinalisation select a predecessor.");
	let r = /^(\d{4})-(\d{4})$/.exec(n.financialYear);
	if (!r || Number(r[2]) !== Number(r[1]) + 1) throw Error("Use a consecutive Australian financial year.");
	let i = r[1] + "-07-01", a = r[2] + "-06-30";
	if (s(n.asOf), n.asOf < i || n.asOf > a) throw Error("As-of date must fall in the selected financial year.");
	let o = e.runs.filter((e) => e.payDate >= i && e.payDate <= n.asOf && ["Posted", "Reversed"].includes(e.status)), c = e.runs.find((e) => e.id === n.runId);
	if ((n.kind === "STP_PAY" || n.kind === "SUPER_CONTRIBUTION") && (!c || c.status !== "Posted" || c.payDate !== n.asOf || c.payDate < i)) throw Error("Select a currently posted run and its pay date.");
	return {
		start: i,
		end: a,
		runs: o,
		selected: c,
		digest: I([
			n.kind,
			n.financialYear,
			n.asOf,
			n.runId ?? null,
			o,
			t
		])
	};
}
function ct(e, t, r, i, a) {
	let o = st(e, t, r), c = [], l = (e, t) => {
		e || c.push(t);
	};
	l(it(t.employer.abn), "Employer ABN checksum/format requires review."), l(/^\d{3}$/.test(t.employer.branch), "Employer branch must contain three digits."), l(t.employer.contactName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.employer.email) && t.employer.phone.trim(), "Employer declaration contact is incomplete.");
	try {
		s(t.employer.historyFrom);
	} catch {
		c.push("History start must be a valid date.");
	}
	l(t.employer.historyConfirmed && t.employer.historyFrom <= o.start && /^\d{4}-\d{2}-\d{2}$/.test(t.employer.historyFrom), "Confirm all financial-year payroll is present locally before preparing YTD. External opening YTD is not supported."), r.kind === "STP_FINALISE" && l(r.asOf === o.end && o.end <= n(new Date(a).toISOString()), "Finalisation requires the completed financial year end."), l(!e.runs.some((e) => ["Draft", "Approved"].includes(e.status) && e.payDate >= o.start && e.payDate <= r.asOf), "Resolve unposted payroll runs in the selected YTD range.");
	let u = r.kind === "SUPER_CONTRIBUTION" ? [o.selected] : o.runs, d = [...new Set(u.flatMap((e) => e.slips.map((e) => e.employee.id)))];
	l(d.length > 0, "No payroll participants exist in this report range."), l(new Set(t.employees.map((e) => e.employeeId)).size === t.employees.length && new Set(t.employees.map((e) => e.payrollId)).size === t.employees.length, "Employee and payroll IDs must be unique."), l(new Set(t.items.map((e) => e.itemId)).size === t.items.length, "Each pay item requires one reviewed reporting category.");
	for (let e of u) {
		l(!e.employeeInputs.some((e) => e.complex?.termination || e.complex?.specialTax === "Reviewed exception" || e.complex?.awardRules.length), "Complex payroll requires provider-supported disaggregation and cannot use the standard local STP report.");
		for (let t of e.slips) l(!(r.kind.startsWith("STP_") && t.leaveIds.length), "Payroll with leave requires externally reviewed paid-leave disaggregation; this local preparation does not support it.");
		l(e.settings.currency === "AUD" && e.settings.region === "Australia", "Only Australian AUD payroll is supported."), e.settings.employerIdentifier && l(e.settings.employerIdentifier.replace(/\s/g, "") === t.employer.abn, "Frozen employer ABN differs from the filing profile.");
	}
	let f = (e, n) => {
		let r = at();
		for (let i of n.filter((e) => e.status === "Posted")) {
			let n = i.slips.find((t) => t.employee.id === e);
			if (n) for (let e of n.lines) {
				let n = t.items.find((t) => t.itemId === e.item.id);
				if (!n) {
					c.push("Pay item " + e.item.code + " requires a reporting category.");
					continue;
				}
				let i = e.item.category === "Tax" ? ["PAYG"] : e.item.category === "Employer contribution" ? ["SG", "RESC"] : e.item.category === "Deduction" ? ["DEDUCTION"] : e.item.category === "Allowance" ? ["ALLOWANCE"] : [
					"GROSS",
					"PAID_LEAVE",
					"OVERTIME"
				];
				l(i.includes(n.category), "Reporting category conflicts with pay item " + e.item.code + "."), [
					"PAID_LEAVE",
					"ALLOWANCE",
					"DEDUCTION"
				].includes(n.category) && l(n.providerCode.trim(), "A reviewed provider subtype is required for " + e.item.code + "."), r[n.category] += ot(e.amount);
			}
		}
		return r;
	}, p = d.flatMap((e) => {
		let n = t.employees.find((t) => t.employeeId === e), i = [...u].sort((e, t) => t.payDate.localeCompare(e.payDate)).flatMap((e) => e.slips).find((t) => t.employee.id === e);
		if (!n || !i) return c.push("Employee " + e + " needs a supplemental filing identity."), [];
		l(n.payrollId.trim() && n.givenName.trim() && n.familyName.trim(), "Employee payroll ID and legal names are required.");
		try {
			s(n.dateOfBirth), l(n.dateOfBirth < r.asOf, "Date of birth must precede the pay date.");
		} catch {
			c.push("Employee date of birth requires review.");
		}
		l(n.address.trim() && n.suburb.trim() && [
			"NSW",
			"VIC",
			"QLD",
			"SA",
			"WA",
			"TAS",
			"NT",
			"ACT"
		].includes(n.state) && /^\d{4}$/.test(n.postcode), "Employee Australian address is incomplete."), l(/^\d{8,9}$/.test(i.employee.taxIdentifier), "Review TFN format or use an externally supported exemption workflow."), l(/^[A-Z0-9]{6}$/.test(n.taxTreatment), "Review the six-character tax treatment with the selected provider.");
		let a = f(e, o.runs), d = f(e, o.selected ? [o.selected] : []), p = o.runs.filter((e) => e.status === "Posted").flatMap((t) => t.slips.filter((t) => t.employee.id === e).flatMap((e) => e.lines)), m = [...new Set(p.map((e) => e.item.id))].flatMap((n) => {
			let r = t.items.find((e) => e.itemId === n);
			return r ? [{
				itemId: n,
				code: p.find((e) => e.item.id === n).item.code,
				category: r.category,
				providerCode: r.providerCode,
				ytdCents: p.filter((e) => e.item.id === n).reduce((e, t) => e + ot(t.amount), 0),
				periodCents: (o.selected?.status === "Posted" ? o.selected.slips.filter((t) => t.employee.id === e).flatMap((e) => e.lines) : []).filter((e) => e.item.id === n).reduce((e, t) => e + ot(t.amount), 0)
			}] : [];
		});
		return r.kind === "SUPER_CONTRIBUTION" && d.SG + d.RESC > 0 && l(n.usi.trim() && it(n.fundAbn) && i.employee.superFund.trim() && i.employee.superMemberId.trim(), "Review APRA fund ABN, USI, saved fund name and member ID. SMSF is not supported."), [{
			employeeId: e,
			payrollId: n.payrollId,
			givenName: n.givenName,
			familyName: n.familyName,
			dateOfBirth: n.dateOfBirth,
			address: n.address,
			suburb: n.suburb,
			state: n.state,
			postcode: n.postcode,
			incomeType: n.incomeType,
			employmentBasis: n.employmentBasis,
			taxTreatment: n.taxTreatment,
			tfn: i.employee.taxIdentifier,
			fundName: i.employee.superFund,
			memberId: i.employee.superMemberId,
			usi: n.usi,
			fundAbn: n.fundAbn,
			components: m,
			ytd: a,
			period: d
		}];
	}), m = p.reduce((e, t) => e + t.period.SG + t.period.RESC, 0);
	return r.kind === "SUPER_CONTRIBUTION" && l(m > 0, "This run has no reviewed super contribution."), c.length ? {
		issues: [...new Set(c)],
		report: void 0
	} : {
		issues: [],
		report: Ke.parse({
			id: k(),
			...r,
			sourceDigest: o.digest,
			createdAt: a,
			createdBy: i,
			employer: t.employer,
			employeeRows: p,
			runIds: u.map((e) => e.id),
			totalSuperCents: m,
			sourceEvidence: u.map((e) => ({
				runId: e.id,
				journalId: e.journalId ?? "",
				sourceToken: e.sourceToken,
				payDate: e.payDate,
				slipsDigest: I(e.slips)
			})),
			notice: "INTERNAL_REVIEW_NOT_PROVIDER_OR_ATO_FORMAT"
		})
	};
}
//#endregion
//#region electron/payroll-filing/filings.ts
var L = S().min(1).max(200), lt = u({
	kind: h(ze),
	financialYear: S(),
	asOf: S(),
	runId: L.optional(),
	predecessorId: L.optional()
}).strict(), ut = /* @__PURE__ */ new Set([
	"ACCEPTED",
	"REJECTED",
	"FUND_RECEIVED",
	"CANCELLED"
]), dt = class {
	store;
	security;
	business;
	connectors;
	now;
	running = !1;
	blocked = "";
	constructor(e, t, n, r = new rt(), i = () => Date.now()) {
		this.store = e, this.security = t, this.business = n, this.connectors = r, this.now = i, e.read().jobs.some((e) => e.status === "SENDING") && e.change((e) => {
			for (let t of e.jobs) t.status === "SENDING" && (t.status = "UNCERTAIN", t.error = "Interrupted transmission. Look up the original request; never resend automatically.", t.nextAt = this.now());
		});
	}
	async providerCall(e) {
		let t = new AbortController(), n;
		try {
			return await Promise.race([e(t.signal), new Promise((e, r) => {
				n = setTimeout(() => {
					t.abort(), r(/* @__PURE__ */ Error("Provider request timed out."));
				}, 3e4), n.unref?.();
			})]);
		} finally {
			n && clearTimeout(n);
		}
	}
	passive() {
		let e = this.security.principal();
		if (!m(e, "payroll.read")) throw Error("Permission denied: payroll.read");
		return e;
	}
	payroll() {
		this.passive();
		let e = this.business.view().repositories.payroll;
		if (!e) throw Error("Payroll data is unavailable.");
		return e;
	}
	revision() {
		let e = this.store.read().configuration;
		return I([
			e.adapterId,
			e.apiKey,
			e.tenantId,
			e.production,
			e.contractReference
		]);
	}
	report(e) {
		let t = this.store.read().reports.find((t) => t.id === e);
		if (!t) throw Error("Filing report not found.");
		return t;
	}
	stale(e) {
		try {
			return st(this.payroll(), this.store.read().profile, e).digest !== e.sourceDigest;
		} catch {
			return !0;
		}
	}
	update(e, t, n) {
		this.store.change((r) => {
			let i = r.jobs.find((t) => t.id === e);
			if (!i) throw Error("Filing job not found.");
			Object.assign(i, t), i.history = [...i.history.slice(-499), {
				at: this.now(),
				event: n
			}];
		});
	}
	audit(e, t, n, r) {
		this.security.audit("payrollFilings." + e, t, n, "payroll.approve", void 0, r);
	}
	actionable(e) {
		let t = this.security.principal();
		return !!t && t.userId === e.ownerId && m(t, "payroll.approve") && m(t, "payroll.read");
	}
	evidenceCheck() {
		let e = this.payroll();
		for (let t of this.store.read().reports) if (this.store.read().jobs.some((e) => e.reportId === t.id && e.attempted)) for (let n of t.sourceEvidence) {
			let t = e.runs.find((e) => e.id === n.runId);
			if (!t || t.journalId !== n.journalId || t.sourceToken !== n.sourceToken || t.payDate !== n.payDate || I(t.slips) !== n.slipsDigest) throw Error("Payroll source evidence is missing or changed in this business backup. Restore compatible payroll evidence before processing external filings.");
		}
	}
	view() {
		this.passive();
		let e = this.store.read(), t = this.payroll(), n = this.blocked || "Local preparation is available. No production provider connector is installed by default; nothing is lodged or paid.";
		try {
			this.evidenceCheck();
		} catch (e) {
			n = e instanceof Error ? e.message : "Filing evidence inspection failed.";
		}
		let { apiKey: r, ...i } = e.configuration;
		return {
			configuration: {
				...i,
				configured: !!r,
				secureStorage: this.store.codec.available()
			},
			adapters: this.connectors.list(),
			profile: e.profile,
			profileRevision: e.profileRevision,
			runs: t.runs.map((e) => ({
				id: e.id,
				name: e.name,
				status: e.status,
				payDate: e.payDate
			})),
			employees: t.employees.map((e) => ({
				id: e.id,
				name: e.name,
				code: e.code
			})),
			items: t.items.map((e) => ({
				id: e.id,
				name: e.name,
				category: e.category
			})),
			reports: e.reports.map((e) => {
				let { employeeRows: t, employer: n, ...r } = e;
				return {
					...r,
					employeeCount: t.length,
					stale: this.stale(e)
				};
			}),
			jobs: e.jobs.map((e) => {
				let { credentialRevision: t, ...n } = e;
				return n;
			}),
			manualReviews: e.manualReviews,
			running: this.running,
			health: n
		};
	}
	configure(e) {
		if (this.security.require("users.manage"), this.passive(), this.running) throw Error("Wait for the running provider request.");
		let t = Ue.safeParse(e);
		if (!t.success) throw Error("Invalid payroll connector settings.");
		let n = t.data;
		if (n.apiKey = n.apiKey || this.store.read().configuration.apiKey, n.enabled) {
			if (this.connectors.require(n.adapterId), !n.apiKey || !n.tenantId || n.contractReference.trim().length < 10 || !n.providerName.trim()) throw Error("Verified provider contract, tenant and protected credentials are required.");
			if (!/^https:\/\//.test(n.documentationUrl)) throw Error("Record the official HTTPS provider contract reference.");
		}
		return this.security.audit("payrollFilings.configuration", "payroll-connector", "INTENT", "users.manage"), this.store.change((e) => {
			e.configuration = n;
		}), this.blocked = "", this.security.audit("payrollFilings.configuration", "payroll-connector", "SUCCESS", "users.manage"), this.view();
	}
	saveProfile(e) {
		this.security.require("payroll.manage"), this.passive();
		let t = u({
			profile: Ve,
			expectedRevision: v().int().nonnegative(),
			reason: S().min(10).max(2e3)
		}).strict().parse(e);
		if (t.expectedRevision !== this.store.read().profileRevision) throw Error("Filing profile changed. Reload before applying your identity review.");
		return this.security.audit("payrollFilings.profile", "supplemental-filing-identities", "INTENT", "payroll.manage"), this.store.change((e) => {
			e.profile = t.profile, e.profileRevision++, e.profileHistory.push({
				at: this.now(),
				actorId: this.passive().userId,
				reason: t.reason,
				digest: I(t.profile)
			});
		}), this.security.audit("payrollFilings.profile", "supplemental-filing-identities", "SUCCESS", "payroll.manage"), this.view();
	}
	preflight(e) {
		let t = lt.parse(e);
		if (this.passive(), this.chain(t), t.asOf > n(new Date(this.now()).toISOString())) throw Error("Do not prepare a future filing cutoff.");
		let r = ct(this.payroll(), this.store.read().profile, t, this.passive().userId, this.now());
		return {
			issues: r.issues,
			employeeCount: r.report?.employeeRows.length ?? 0,
			totalSuperCents: r.report?.totalSuperCents ?? 0,
			notice: "This preflight checks internal supported data only; it is not provider or ATO validation."
		};
	}
	chain(e) {
		if (!e.kind.startsWith("STP_")) return;
		let t = this.store.read(), n = t.jobs.filter((e) => e.status === "ACCEPTED").map((e) => this.report(e.reportId)).filter((n) => n.kind.startsWith("STP_") && n.financialYear === e.financialYear && n.employer.abn === t.profile.employer.abn && n.employer.branch === t.profile.employer.branch).at(-1);
		if (n && e.asOf < n.asOf) throw Error("Do not replace a later accepted YTD report with an earlier cutoff.");
		if (["STP_UPDATE", "STP_UNFINALISE"].includes(e.kind) && (!n || e.predecessorId !== n.id)) throw Error("Select the latest accepted STP report as correction predecessor.");
		if (e.kind === "STP_UNFINALISE" && n?.kind !== "STP_FINALISE") throw Error("Only an accepted finalisation can be unfinalised.");
		if (n?.kind === "STP_FINALISE" && e.kind !== "STP_UNFINALISE" && e.kind.startsWith("STP_")) throw Error("Unfinalise the accepted finalisation before sending another STP event.");
	}
	prepare(e) {
		this.security.require("payroll.manage");
		let t = lt.parse(e);
		if (this.chain(t), t.asOf > n(new Date(this.now()).toISOString())) throw Error("Do not prepare a future filing cutoff.");
		let r = ct(this.payroll(), this.store.read().profile, t, this.passive().userId, this.now());
		if (!r.report) throw Error(r.issues.join(" "));
		let i = r.report;
		return this.security.audit("payrollFilings.prepare", i.id, "INTENT", "payroll.manage"), this.store.change((e) => e.reports.push(i)), this.security.audit("payrollFilings.prepare", i.id, "SUCCESS", "payroll.manage"), { id: i.id };
	}
	preview(e) {
		let { reportId: t } = u({ reportId: L }).strict().parse(e);
		return this.passive(), {
			report: this.report(t),
			stale: this.stale(this.report(t)),
			notice: "INTERNAL_REVIEW_NOT_PROVIDER_OR_ATO_FORMAT"
		};
	}
	declare(e) {
		let t = u({
			reportId: L,
			name: S().trim().min(1).max(200),
			reason: S().trim().min(10).max(2e3),
			confirmed: y(!0)
		}).strict().parse(e), n = this.security.require("payroll.approve");
		this.passive(), this.evidenceCheck();
		let r = this.report(t.reportId), i = this.store.read(), a = i.configuration;
		if (this.chain(r), this.stale(r)) throw Error("Payroll or identity data changed. Prepare a new report and declaration.");
		let o = this.connectors.require(a.adapterId);
		if (!a.enabled || !a.apiKey || !o) throw Error("A verified provider connector is not enabled.");
		if (i.jobs.some((e) => e.reportId === r.id)) throw Error("This immutable report already has a transmission job. Inspect its original request.");
		if (i.jobs.some((e) => !ut.has(e.status) && this.report(e.reportId).financialYear === r.financialYear)) throw Error("Resolve the earlier pending or uncertain report before sending another report for this financial year.");
		if (r.kind === "SUPER_CONTRIBUTION" && i.jobs.some((e) => {
			let t = this.report(e.reportId);
			return t.kind === "SUPER_CONTRIBUTION" && t.runId === r.runId && e.status !== "CANCELLED";
		})) throw Error("This pay run already has a super contribution request. Do not submit it again.");
		if (r.kind.startsWith("STP_") && i.jobs.some((e) => !["REJECTED", "CANCELLED"].includes(e.status) && this.report(e.reportId).sourceDigest === r.sourceDigest)) throw Error("An identical payroll source already has a transmission. Inspect its original request or prepare a linked correction.");
		let s = {
			id: k(),
			reportId: r.id,
			ownerId: n.userId,
			requestId: k(),
			credentialRevision: this.revision(),
			status: "QUEUED",
			receipts: [],
			attempted: !1,
			nextAt: this.now(),
			declaration: {
				name: t.name,
				reason: t.reason,
				at: this.now(),
				actorId: n.userId
			},
			history: [{
				at: this.now(),
				event: "DECLARATION_CONFIRMED"
			}]
		};
		return this.audit("declare", s.id, "INTENT"), this.store.change((e) => e.jobs.push(s)), this.audit("declare", s.id, "SUCCESS"), { id: s.id };
	}
	manualReview(e) {
		let t = u({
			reportId: L,
			reference: S().trim().min(1).max(200),
			notes: S().trim().min(10).max(2e3)
		}).strict().parse(e), n = this.security.require("payroll.manage");
		this.passive(), this.report(t.reportId);
		let r = k();
		return this.security.audit("payrollFilings.portalReview", r, "INTENT", "payroll.manage"), this.store.change((e) => e.manualReviews.push({
			id: r,
			...t,
			actorId: n.userId,
			at: this.now()
		})), this.security.audit("payrollFilings.portalReview", r, "SUCCESS", "payroll.manage"), this.view();
	}
	refresh(e) {
		let { id: t } = u({ id: L }).strict().parse(e), n = this.store.read().jobs.find((e) => e.id === t);
		if (this.security.require("payroll.approve"), !n || !this.actionable(n)) throw Error("Only the authorized transmission owner may refresh.");
		if (n.status === "QUEUED") throw Error("Queued work is processed automatically while the owner is signed in.");
		if (ut.has(n.status)) throw Error("This provider result is terminal. Prepare a linked correction if required.");
		return this.update(n.id, { nextAt: this.now() }, "LOOKUP_REQUESTED"), this.blocked = "", this.view();
	}
	cancel(e) {
		let { id: t } = u({ id: L }).strict().parse(e), n = this.store.read().jobs.find((e) => e.id === t);
		if (this.security.require("payroll.approve"), !n || !this.actionable(n) || n.attempted || n.status !== "QUEUED") throw Error("Only an unattempted queued transmission can be cancelled locally.");
		return this.audit("cancel", n.id, "INTENT"), this.update(n.id, { status: "CANCELLED" }, "CANCELLED_BEFORE_ATTEMPT"), this.audit("cancel", n.id, "SUCCESS"), this.view();
	}
	accept(e, t) {
		let n = qe.parse(t), r = this.report(e.reportId);
		if (n.requestId !== e.requestId || n.reportId !== r.id || n.sourceDigest !== r.sourceDigest || n.employerAbn !== r.employer.abn || e.providerId && n.providerId !== e.providerId) throw Error("Provider evidence does not match the frozen payroll request.");
		if (r.kind === "SUPER_CONTRIBUTION") {
			if (n.status === "ACCEPTED") throw Error("Provider acceptance does not prove receipt by a super fund.");
			let e = r.employeeRows.filter((e) => e.period.SG + e.period.RESC > 0), t = n.memberReceipts ?? [];
			if (new Set(t.map((e) => e.payrollId)).size !== t.length) throw Error("Duplicate fund receipt members.");
			for (let n of t) {
				let t = e.find((e) => e.payrollId === n.payrollId);
				if (!t || n.fundAbn !== t.fundAbn || n.usi !== t.usi || n.memberId !== t.memberId || n.amountCents > t.period.SG + t.period.RESC || n.receivedAt <= 0 || n.receivedAt > this.now() + 6e4) throw Error("Fund receipt amount, member or date does not match.");
			}
			if (n.status === "FUND_RECEIVED" && (t.length !== e.length || t.some((t) => t.amountCents !== e.find((e) => e.payrollId === t.payrollId).period.SG + e.find((e) => e.payrollId === t.payrollId).period.RESC) || !n.authorityReference)) throw Error("Complete matching member and fund receipt evidence is required.");
		} else if (n.status === "FUND_RECEIVED" || n.status === "PARTIAL" || n.status === "ACCEPTED" && !n.authorityReference) throw Error("STP acceptance requires the matched authority reference.");
		if (e.receipt?.memberReceipts?.some((e) => !n.memberReceipts?.some((t) => t.payrollId === e.payrollId && t.amountCents >= e.amountCents))) throw Error("Fund receipt evidence cannot regress.");
		let i = this.store.read().jobs.find((t) => t.id === e.id), a = {
			PROVIDER_RECEIVED: 1,
			PROCESSING: 2,
			PARTIAL: 3,
			FUND_RECEIVED: 4,
			ACCEPTED: 4,
			REJECTED: 4
		};
		if (i.receipt && a[n.status] < a[i.receipt.status]) throw Error("Provider receipt status cannot regress.");
		let o = i.receipts.at(-1) && I(i.receipts.at(-1).evidence) === I(n) ? i.receipts : [...i.receipts, {
			at: this.now(),
			evidence: n
		}];
		this.update(e.id, {
			receipts: o,
			receipt: n,
			status: n.status,
			providerId: n.providerId,
			authorityReference: n.authorityReference,
			error: void 0,
			nextAt: this.now() + 9e5
		}, "PROVIDER_" + n.status), this.audit("receipt", e.id, "SUCCESS", e.ownerId);
	}
	async tick() {
		if (!this.running && !this.blocked && m(this.security.principal(), "payroll.approve") && m(this.security.principal(), "payroll.read")) {
			this.running = !0;
			try {
				let e = this.store.read(), t = e.configuration;
				if (!t.enabled) return;
				this.evidenceCheck();
				let n = this.connectors.require(t.adapterId), r = e.jobs.find((e) => this.actionable(e) && e.nextAt <= this.now() && !ut.has(e.status));
				if (!r) return;
				if (r.credentialRevision !== this.revision()) {
					this.update(r.id, {
						error: "Provider identity or credentials changed. Reconcile under the original account.",
						nextAt: this.now() + 36e5
					}, "ACCOUNT_REVIEW");
					return;
				}
				let i = this.report(r.reportId);
				if (!r.attempted) {
					if (this.stale(i)) {
						this.update(r.id, {
							status: "CANCELLED",
							error: "Payroll changed before transmission. Prepare a new report."
						}, "STALE_SOURCE_BLOCKED");
						return;
					}
					this.chain(i), this.update(r.id, {
						status: "SENDING",
						attempted: !0
					}, "TRANSMISSION_ATTEMPT"), this.audit("submit", r.id, "INTENT");
					try {
						this.accept(r, await this.providerCall((e) => n.submit(i, r.requestId, t, e)));
					} catch {
						this.update(r.id, {
							status: "UNCERTAIN",
							error: "Provider outcome is uncertain. Look up the original request; automatic resubmission is disabled.",
							nextAt: this.now() + 6e4
						}, "PROVIDER_LOOKUP_REQUIRED"), this.audit("submit", r.id, "FAILED", r.ownerId);
					}
					return;
				}
				try {
					let e = r.providerId ? await this.providerCall((e) => n.poll(i, r.requestId, r.providerId, t, e)) : await this.providerCall((e) => n.lookup(i, r.requestId, t, e));
					if (!e) {
						this.update(r.id, {
							status: "UNCERTAIN",
							error: "No confirmed provider outcome. Reconcile the original request; do not submit a replacement.",
							nextAt: this.now() + 9e5
						}, "NO_CONFIRMED_OUTCOME");
						return;
					}
					this.accept(r, e);
				} catch {
					this.update(r.id, {
						error: "Provider lookup or evidence validation failed. Original report and request ID retained.",
						nextAt: this.now() + 9e5
					}, "PROVIDER_REVIEW");
				}
			} catch (e) {
				this.blocked = e instanceof Error ? e.message : "Payroll filing worker stopped; preserve the profile.";
			} finally {
				this.running = !1;
			}
		}
	}
}, R = S().regex(/^[A-Za-z0-9_-]{1,128}$/), z = S().min(1).max(200), ft = u({
	enabled: b(),
	apiKey: S().max(1e3),
	userId: f([R, y("")]),
	production: b()
}).strict(), pt = u({
	id: R,
	connectionId: R,
	institutionId: R,
	name: S().max(1e3),
	masked: S().max(30),
	currency: y("AUD"),
	lastUpdated: S().max(100),
	expiresAt: v().finite()
}).strict(), mt = u({
	externalId: z,
	date: S().length(10),
	description: S().min(1).max(1e3),
	reference: S().max(500),
	amount: v().finite().refine((e) => e !== 0 && Math.abs(e) <= 999999999.99)
}).strict(), ht = [
	"Australia/Sydney",
	"Australia/Melbourne",
	"Australia/Brisbane",
	"Australia/Adelaide",
	"Australia/Darwin",
	"Australia/Perth",
	"Australia/Hobart"
], gt = u({
	id: z,
	ownerId: z,
	credentialRevision: S().length(64),
	providerUserId: R,
	production: b(),
	retired: b(),
	remote: pt,
	bankAccountId: z,
	bankIdentity: S().length(64),
	startDate: S().length(10),
	timeZone: h(ht),
	enabled: b(),
	nextAt: v().finite(),
	lastSuccess: v().finite().optional(),
	lastThrough: S().optional(),
	error: S().max(500).optional(),
	failures: v().int().nonnegative(),
	pendingCount: v().int().nonnegative()
}).strict(), _t = u({
	id: z,
	mappingId: z,
	createdAt: v().finite(),
	throughDate: S().length(10),
	status: h([
		"REVIEW",
		"IMPORTING",
		"COMPLETED"
	]),
	rows: _(mt).min(1).max(1e4),
	excludedIds: _(z).max(1e4),
	reason: S().max(2e3),
	evidence: _(u({
		externalId: z,
		lineId: z,
		digest: S().length(64)
	}).strict()).max(1e4),
	error: S().max(500).optional()
}).strict(), vt = u({
	version: y(1),
	mappings: _(gt).max(100),
	accounts: _(pt).max(500),
	accountsRevision: S().max(64),
	batches: _(_t).max(1e3),
	request: u({
		ownerId: z,
		kind: h(["DISCOVER", "AUTHORIZE"]),
		attempted: b()
	}).strict().optional(),
	history: _(u({
		at: v().finite(),
		action: S().max(100),
		resource: S().max(200)
	}).strict()).max(1e3)
}).strict(), B = (e) => O("sha256").update(JSON.stringify(e)).digest("hex");
function yt(e) {
	if (new Set(e.mappings.map((e) => e.id)).size !== e.mappings.length || new Set(e.batches.map((e) => e.id)).size !== e.batches.length) throw Error("Duplicate feed journal identities.");
	for (let t of e.mappings) if (s(t.startDate), t.lastThrough && s(t.lastThrough), t.retired && t.enabled) throw Error("Retired mapping cannot be active.");
	for (let t of e.batches) {
		s(t.throughDate);
		let n = new Map(t.rows.map((e) => [e.externalId, e]));
		if (!e.mappings.some((e) => e.id === t.mappingId) || n.size !== t.rows.length || new Set(t.excludedIds).size !== t.excludedIds.length || new Set(t.evidence.map((e) => e.externalId)).size !== t.evidence.length || t.excludedIds.some((e) => !n.has(e))) throw Error("Invalid feed batch identities.");
		for (let e of t.rows) s(e.date);
		for (let e of t.evidence) {
			let r = n.get(e.externalId);
			if (!r || t.excludedIds.includes(e.externalId) || e.digest !== B([
				r.date,
				r.amount,
				r.description,
				r.reference
			])) throw Error("Invalid feed import proof.");
		}
		if (t.status === "COMPLETED" && t.evidence.length !== t.rows.length - t.excludedIds.length) throw Error("Incomplete feed import proof.");
	}
}
var bt = class {
	path;
	state;
	constructor(e) {
		if (this.path = D(e, "bank-feed-journal-v1.json"), C(this.path)) try {
			let e = w(this.path, "utf8");
			if (Buffer.byteLength(e) > 55e6) throw Error();
			let { checksum: t, ...n } = JSON.parse(e);
			if (t !== B(n)) throw Error();
			this.state = vt.parse(n), yt(this.state);
		} catch {
			throw Error("Bank feed journal is invalid. Preserve the full desktop profile; do not reset it to import again.");
		}
		else this.state = {
			version: 1,
			mappings: [],
			accounts: [],
			accountsRevision: "",
			batches: [],
			history: []
		}, this.save(this.state);
	}
	read() {
		return structuredClone(this.state);
	}
	save(e) {
		let t = vt.parse(e);
		if (yt(t), Buffer.byteLength(JSON.stringify(t)) > 5e7) throw Error("Bank feed journal quota reached. Preserve the full profile before archiving.");
		F(this.path, {
			...t,
			checksum: B(t)
		}), this.state = structuredClone(t);
	}
	change(e) {
		let t = this.read();
		e(t), this.save(t);
	}
}, xt = class {
	path;
	codec;
	constructor(e, t) {
		this.path = D(e, "bank-feed-secrets-v1.json"), this.codec = t;
	}
	get() {
		if (!C(this.path)) return {
			enabled: !1,
			apiKey: "",
			userId: "",
			production: !1
		};
		if (!this.codec.available()) throw Error("OS protected credential storage is unavailable.");
		try {
			let e = JSON.parse(w(this.path, "utf8"));
			if (e.version !== 1 || typeof e.cipher != "string") throw Error();
			return ft.parse(JSON.parse(this.codec.decrypt(Buffer.from(e.cipher, "base64"))));
		} catch {
			throw Error("Bank feed credentials cannot be decrypted. Reconfigure locally; preserve the feed journal.");
		}
	}
	set(e) {
		if (!this.codec.available()) throw Error("OS protected credential storage is unavailable.");
		let t = ft.safeParse(e);
		if (!t.success) throw Error("Invalid bank feed settings.");
		let n = t.data, r;
		try {
			r = this.get();
		} catch {
			if (n.enabled && !n.apiKey) throw Error("Enter a fresh key to replace unreadable bank feed credentials.");
		}
		if (n.apiKey = n.apiKey || r?.apiKey || "", n.apiKey && /\s/.test(n.apiKey)) throw Error("Use the Basiq API key exactly as issued, without spaces.");
		if (n.enabled && (!n.apiKey || !n.userId)) throw Error("Configure a Basiq API key and provisioned user ID before enabling.");
		F(this.path, {
			version: 1,
			cipher: this.codec.encrypt(JSON.stringify(n)).toString("base64")
		});
	}
	revision() {
		let e = this.get();
		return B([
			e.apiKey,
			e.userId,
			e.production
		]);
	}
}, V = class extends Error {
	code;
	constructor(e) {
		super(e), this.code = e;
	}
}, St = async (e, t) => {
	let n;
	try {
		n = await fetch(e, {
			...t,
			redirect: "error",
			signal: AbortSignal.timeout(2e4)
		});
	} catch {
		throw new V("NETWORK_UNAVAILABLE");
	}
	if (!n.ok) throw await n.body?.cancel(), new V("BASIQ_HTTP_" + n.status);
	try {
		let e = n.body?.getReader();
		if (!e) throw Error();
		let t = [], r = 0;
		for (;;) {
			let n = await e.read();
			if (n.done) break;
			if (r += n.value.byteLength, r > 5e6) throw await e.cancel(), Error();
			t.push(n.value);
		}
		return JSON.parse(Buffer.concat(t).toString("utf8"));
	} catch {
		throw new V("BASIQ_RESPONSE_INVALID");
	}
}, Ct = "https://au-api.basiq.io", wt = u({
	type: y("account"),
	id: R,
	name: S().max(1e3),
	displayName: S().max(1e3).optional(),
	maskedNumber: S().max(200).optional(),
	accountNo: S().max(200).optional(),
	currency: S(),
	status: h(["available", "unavailable"]),
	connection: R,
	institution: R,
	lastUpdated: S().max(100)
}), Tt = u({
	type: y("list"),
	data: _(ue()).max(500),
	links: u({ next: S().nullable().optional() }).optional()
});
function H(e, t) {
	let n = e.safeParse(t);
	if (!n.success) throw new V("BASIQ_RESPONSE_INVALID");
	return n.data;
}
function Et(e) {
	let t = new URL(e);
	if (t.protocol !== "https:" || t.hostname !== "connect.basiq.io" || t.port || t.username || t.password || t.hash || !/^\/[A-Za-z0-9_-]+\/?$/.test(t.pathname)) throw new V("CONSENT_URL_UNTRUSTED");
	return t.href;
}
function Dt(e, t, n, r = !1) {
	return "basiq:" + O("sha256").update(JSON.stringify([
		e,
		t,
		r
	])).digest("hex").slice(0, 32) + ":" + n;
}
function Ot(e, t, n, r = "Australia/Sydney") {
	let i = H(u({
		type: y("transaction"),
		id: R,
		account: R,
		status: h(["pending", "posted"])
	}), e);
	if (i.account !== n.id) throw new V("TRANSACTION_ACCOUNT_MISMATCH");
	if (i.status === "pending") return null;
	let a = H(u({
		id: R,
		account: R,
		status: y("posted"),
		currency: y("AUD"),
		description: S().trim().min(1).max(1e3),
		reference: S().max(500).nullable().optional(),
		amount: S().regex(/^-?\d{1,9}(?:\.\d{1,2})?$/),
		direction: h(["debit", "credit"]),
		postDate: S().regex(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/)
	}), e), o = a.postDate.length === 10 ? a.postDate : new Intl.DateTimeFormat("en-CA", {
		timeZone: r,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(new Date(a.postDate));
	if (s(o, "Provider posting date"), a.postDate.length > 10 && !Number.isFinite(Date.parse(a.postDate))) throw new V("TRANSACTION_DATE_INVALID");
	let c = a.amount.startsWith("-"), [l, d = ""] = a.amount.replace("-", "").split("."), f = Number(BigInt(l) * 100n + BigInt(d.padEnd(2, "0")));
	if (!Number.isSafeInteger(f) || f === 0 || a.direction === "debit" !== c) throw new V("TRANSACTION_AMOUNT_OR_DIRECTION_INVALID");
	return {
		externalId: Dt(t.userId, n.id, a.id, t.production),
		date: o,
		description: a.description,
		reference: a.reference ?? "",
		amount: (c ? -f : f) / 100
	};
}
var kt = class {
	transport;
	token;
	constructor(e = St) {
		this.transport = e;
	}
	revision(e) {
		return O("sha256").update(JSON.stringify([
			e.apiKey,
			e.userId,
			e.production
		])).digest("hex");
	}
	async access(e, t) {
		let n = this.revision(e);
		if (this.token?.revision === n && this.token.until > t) return this.token.value;
		let r = H(u({
			access_token: S().min(1).max(2e4),
			token_type: y("Bearer"),
			expires_in: v().int().min(60).max(86400)
		}), await this.transport(Ct + "/token", {
			method: "POST",
			headers: {
				Authorization: "Basic " + e.apiKey,
				"basiq-version": "3.0",
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: "scope=SERVER_ACCESS"
		}));
		return this.token = {
			revision: n,
			value: r.access_token,
			until: t + Math.min(r.expires_in - 60, 1800) * 1e3
		}, r.access_token;
	}
	async request(e, t, n, r = "GET", i) {
		let a = await this.access(t, n);
		try {
			return await this.transport(Ct + e, {
				method: r,
				headers: {
					Authorization: "Bearer " + a,
					"basiq-version": "3.0",
					...i ? { "Content-Type": "application/json" } : {}
				},
				...i ? { body: i } : {}
			});
		} catch (e) {
			throw e instanceof V && ["BASIQ_HTTP_401", "BASIQ_HTTP_403"].includes(e.code) && (this.token = void 0), e;
		}
	}
	root(e) {
		return "/users/" + R.parse(e.userId);
	}
	async list(e, t, n) {
		let r = /* @__PURE__ */ new Set(), i = [], a = e;
		for (; a;) {
			if (r.has(a) || r.size >= 20) throw new V("PAGINATION_LOOP_OR_LIMIT");
			r.add(a);
			let o = H(Tt, await this.request(a, t, n));
			i.push(...o.data);
			let s = o.links?.next;
			if (!s) {
				a = void 0;
				continue;
			}
			let c = new URL(s, Ct);
			if (c.origin !== Ct || c.username || c.password || c.hash || c.pathname !== e.split("?")[0] || c.searchParams.get("filter") !== new URL(Ct + e).searchParams.get("filter")) throw new V("PAGINATION_LINK_UNTRUSTED");
			a = c.pathname + c.search;
		}
		return i;
	}
	async consent(e, t) {
		if (!(await this.list(this.root(e) + "/consents", e, t)).map((e) => H(u({
			type: y("consent"),
			status: h([
				"active",
				"revoked",
				"expired"
			]),
			expiryDate: S(),
			data: u({ permissions: _(u({
				scope: S(),
				consented: b().optional()
			})) })
		}), e)).some((e) => e.status === "active" && Date.parse(e.expiryDate) > t && e.data.permissions.some((e) => e.scope === "transaction.detail" && e.consented === !0))) throw new V("CONSENT_EXPIRED_REVOKED_OR_MISSING");
	}
	async validateAccount(e, t, n) {
		let r = H(wt, await this.request(this.root(e) + "/accounts/" + R.parse(t), e, n));
		if (r.id !== t || r.currency !== "AUD" || r.status !== "available") throw new V("ACCOUNT_UNAVAILABLE_OR_CURRENCY");
		let i = H(u({
			type: y("connection"),
			id: R,
			method: y("open-banking"),
			status: y("active"),
			expiryDate: S(),
			accounts: u({ data: _(u({ id: R })) })
		}), await this.request(this.root(e) + "/connections/" + r.connection, e, n)), a = Date.parse(i.expiryDate);
		if (i.id !== r.connection || !(a > n) || !i.accounts.data.some((e) => e.id === t)) throw new V("CONNECTION_EXPIRED_OR_ACCOUNT_MISMATCH");
		let o = r.maskedNumber ?? r.accountNo ?? "";
		return pt.parse({
			id: r.id,
			connectionId: r.connection,
			institutionId: r.institution,
			name: r.displayName || r.name,
			masked: o ? "•••• " + o.slice(-4) : "Not supplied",
			currency: "AUD",
			lastUpdated: r.lastUpdated,
			expiresAt: a
		});
	}
	async discover(e, t) {
		await this.consent(e, t);
		let n = await this.list(this.root(e) + "/accounts", e, t), r = [];
		for (let i of n) {
			let n = H(wt, i);
			n.currency === "AUD" && n.status === "available" && r.push(await this.validateAccount(e, n.id, t));
		}
		if (new Set(r.map((e) => e.id)).size !== r.length) throw new V("DUPLICATE_PROVIDER_ACCOUNT");
		return r;
	}
	async transactions(e, t, n, r, i, a = "Australia/Sydney") {
		s(n), s(r), await this.consent(e, i);
		let o = await this.validateAccount(e, t.id, i);
		if (o.connectionId !== t.connectionId || o.institutionId !== t.institutionId) throw new V("CONNECTION_CHANGED_REMAP_REQUIRED");
		let c = (/* @__PURE__ */ new Date(Date.parse(n + "T00:00:00Z") - 864e5)).toISOString().slice(0, 10), l = new Date(Date.parse(r + "T00:00:00Z") + 864e5).toISOString().slice(0, 10), u = `account.id.eq('${t.id}'),transaction.postDate.gteq('${c}'),transaction.postDate.lteq('${l}T23:59:59.999Z')`, d = await this.list(this.root(e) + "/transactions?limit=500&filter=" + encodeURIComponent(u), e, i), f = [], p = 0;
		for (let i of d) {
			let o = Ot(i, e, t, a);
			if (!o) {
				p++;
				continue;
			}
			if (o.date < n || o.date > r) continue;
			let s = f.find((e) => e.externalId === o.externalId);
			if (s && JSON.stringify(s) !== JSON.stringify(o)) throw new V("DUPLICATE_TRANSACTION_CONFLICT");
			s || f.push(o);
		}
		return {
			rows: f,
			pending: p,
			account: o
		};
	}
	async authorization(e, t, n) {
		let r;
		try {
			r = await this.request(this.root(e) + "/auth_link", e, t);
		} catch (e) {
			if (!(e instanceof V) || !["BASIQ_HTTP_404", "BASIQ_HTTP_410"].includes(e.code)) throw e;
			if (!n) throw new V("AUTH_LINK_RETRY_REQUIRES_CONFIRMATION");
		}
		if (r) {
			let e = H(u({ expiresAt: S() }), r);
			Date.parse(e.expiresAt) > t || (r = void 0);
		}
		if (!r) {
			if (!n) throw new V("AUTH_LINK_RETRY_REQUIRES_CONFIRMATION");
			r = await this.request(this.root(e) + "/auth_link", e, t, "POST", "{}");
		}
		let i = H(u({
			type: y("auth_link"),
			userId: R,
			expiresAt: S(),
			links: u({ public: S() })
		}), r);
		if (i.userId !== e.userId || !(Date.parse(i.expiresAt) > t)) throw new V("AUTH_LINK_EVIDENCE_INVALID");
		return {
			url: Et(i.links.public),
			until: Date.parse(i.expiresAt)
		};
	}
}, U = S().min(1).max(200), W = (e) => B([
	e.date,
	e.amount,
	e.description,
	e.reference
]), At = class {
	store;
	vault;
	security;
	business;
	provider;
	now;
	running = !1;
	blocked = "";
	link;
	constructor(e, t, n, r, i = new kt(), a = () => Date.now()) {
		this.store = e, this.vault = t, this.security = n, this.business = r, this.provider = i, this.now = a, e.read().batches.some((e) => e.status === "IMPORTING") && e.change((e) => {
			for (let t of e.batches) t.status === "IMPORTING" && (t.status = "REVIEW", t.error = "Interrupted import. Inspect existing statement rows, then confirm the original batch; stable external IDs prevent duplicate imports.");
		});
	}
	passive(e = !1) {
		let t = this.security.principal();
		if (!m(t, e ? "banking.write" : "banking.read")) throw Error("Permission denied: bank feeds.");
		return t;
	}
	snapshots() {
		return this.business.view().repositories;
	}
	lines() {
		return this.snapshots().bankStatements?.lines ?? [];
	}
	bank(e) {
		let t = this.snapshots().bankAccounts?.bankAccounts.find((t) => t.id === e);
		if (!t || !t.active || t.currency !== "AUD") throw Error("Choose an active AUD local bank account.");
		return t;
	}
	identity(e) {
		return B([
			e.id,
			e.accountNumber,
			e.glAccountId,
			e.currency,
			e.openingBalance,
			e.openingBalanceDate
		]);
	}
	today() {
		return n(new Date(this.now()).toISOString());
	}
	history(e, t) {
		this.store.change((n) => {
			n.history = [...n.history.slice(-999), {
				at: this.now(),
				action: e,
				resource: t
			}];
		});
	}
	audit(e, t, n) {
		this.security.audit("bankFeeds." + e, t, n, "banking.write");
	}
	owned(e) {
		let t = this.passive(!0);
		if (e.ownerId !== t.userId) throw Error("Only the mapping owner may process this bank feed.");
		return t;
	}
	mapping(e) {
		let t = this.store.read().mappings.find((t) => t.id === e);
		if (!t) throw Error("Bank feed mapping not found.");
		return t;
	}
	verifyMapping(e) {
		let t = this.bank(e.bankAccountId);
		if (this.identity(t) !== e.bankIdentity) throw Error("Local bank identity changed. Review this mapping before importing.");
		if (e.credentialRevision !== this.vault.revision()) throw Error("Provider account or credentials changed. Reconcile the original mapping before enabling it.");
	}
	restoreCheck() {
		let e = this.security.principal(), t = this.store.read(), n = this.lines();
		for (let r of t.batches.filter((e) => e.status === "COMPLETED")) {
			let i = t.mappings.find((e) => e.id === r.mappingId);
			if (i.ownerId === e?.userId && m(e, "banking.write")) for (let e of r.evidence) {
				let t = n.find((t) => t.id === e.lineId && t.bankAccountId === i.bankAccountId && t.externalId === e.externalId);
				if (!t || W(t) !== e.digest) throw Error("Imported bank feed evidence is missing or changed in this business backup. Restore compatible statement evidence before continuing; do not reset the feed journal.");
			}
		}
	}
	possibleDuplicates(e) {
		let t = this.mapping(e.mappingId), n = this.lines();
		return e.rows.filter((e) => n.some((n) => n.bankAccountId === t.bankAccountId && n.externalId !== e.externalId && n.date === e.date && n.amount === e.amount && (n.description.trim().toLowerCase() === e.description.trim().toLowerCase() || !!e.reference && n.reference === e.reference))).map((e) => e.externalId);
	}
	view() {
		this.passive();
		let e = this.store.read(), t = this.blocked || "Ready. Bank feeds remain inactive until configured and explicitly enabled.", n = {
			enabled: !1,
			apiKey: "",
			userId: "",
			production: !1
		};
		try {
			n = this.vault.get(), this.restoreCheck();
		} catch (e) {
			t = e instanceof Error ? e.message : "Bank feed inspection failed.";
		}
		let r = this.security.principal();
		return {
			configuration: {
				enabled: n.enabled,
				configured: !!n.apiKey && !!n.userId,
				userId: n.userId,
				production: n.production,
				secureStorage: this.vault.codec.available()
			},
			accounts: e.accountsRevision === B([
				n.apiKey,
				n.userId,
				n.production
			]) ? e.accounts : [],
			mappings: e.mappings,
			batches: e.batches.map((e) => ({
				...e,
				possibleDuplicates: e.status === "COMPLETED" ? [] : this.possibleDuplicates(e)
			})),
			banks: (this.snapshots().bankAccounts?.bankAccounts ?? []).filter((e) => e.active).map((e) => ({
				id: e.id,
				name: e.name,
				currency: e.currency,
				openingBalanceDate: e.openingBalanceDate
			})),
			running: this.running,
			health: t,
			authorizationReady: !!this.link && this.link.until > this.now() && this.link.ownerId === r?.userId && this.link.revision === B([
				n.apiKey,
				n.userId,
				n.production
			]),
			request: e.request?.kind
		};
	}
	configure(e) {
		if (this.security.require("users.manage"), this.running) throw Error("Wait for the running bank feed request.");
		return this.security.audit("bankFeeds.configuration", "bank-feed-vault", "INTENT", "users.manage"), this.vault.set(e), this.link = void 0, this.blocked = "", this.security.audit("bankFeeds.configuration", "bank-feed-vault", "SUCCESS", "users.manage"), this.view();
	}
	request(e) {
		let t = u({
			kind: h(["DISCOVER", "AUTHORIZE"]),
			confirmed: y(!0)
		}).strict().parse(e), n = this.security.require("banking.write"), r = this.vault.get();
		if (!r.enabled || !r.apiKey || !r.userId) throw Error("Configure and enable Basiq first.");
		if (this.running || this.store.read().request) throw Error("A bank feed request is already pending.");
		return this.blocked = "", this.audit("request." + t.kind, "provider-user", "INTENT"), this.store.change((e) => {
			e.request = {
				ownerId: n.userId,
				kind: t.kind,
				attempted: !1
			};
		}), this.audit("request." + t.kind, "provider-user", "SUCCESS"), this.view();
	}
	authorizationUrl() {
		let e = this.passive(!0);
		if (!this.link || this.link.until <= this.now() || this.link.ownerId !== e.userId || this.link.revision !== this.vault.revision()) throw Error("Request a valid provider authorization link first.");
		return Et(this.link.url);
	}
	map(e) {
		let t = u({
			remoteId: U,
			bankAccountId: U,
			startDate: S(),
			timeZone: h(ht),
			confirmed: y(!0)
		}).strict().parse(e), n = this.security.require("banking.write"), r = this.store.read(), i = this.vault.get();
		if (!i.enabled || r.accountsRevision !== this.vault.revision()) throw Error("Discover authorized provider accounts with the current configuration first.");
		let a = r.accounts.find((e) => e.id === t.remoteId), o = this.bank(t.bankAccountId);
		if (s(t.startDate), !a || a.expiresAt <= this.now()) throw Error("Discover a currently authorized AUD account.");
		if (t.startDate < o.openingBalanceDate || t.startDate > this.today()) throw Error("Start date must be between the bank opening date and today.");
		if (r.mappings.some((e) => !e.retired && (e.remote.id === a.id && e.providerUserId === i.userId && e.production === i.production || e.bankAccountId === o.id))) throw Error("This provider account or local bank already has a mapping. Preserve its history and review it instead.");
		let c = {
			id: k(),
			ownerId: n.userId,
			credentialRevision: this.vault.revision(),
			providerUserId: i.userId,
			production: i.production,
			retired: !1,
			remote: a,
			bankAccountId: o.id,
			bankIdentity: this.identity(o),
			startDate: t.startDate,
			timeZone: t.timeZone,
			enabled: !0,
			nextAt: this.now(),
			failures: 0,
			pendingCount: 0
		};
		return this.audit("map", c.id, "INTENT"), this.store.change((e) => e.mappings.push(c)), this.audit("map", c.id, "SUCCESS"), this.view();
	}
	setEnabled(e) {
		let t = u({
			id: U,
			enabled: b()
		}).strict().parse(e), n = this.mapping(t.id);
		if (this.security.require("banking.write"), this.owned(n), n.retired) throw Error("Retired mappings retain history and cannot resume.");
		return t.enabled && (this.restoreCheck(), this.verifyMapping(n)), this.audit(t.enabled ? "resume" : "pause", n.id, "INTENT"), this.store.change((e) => {
			let r = e.mappings.find((e) => e.id === n.id);
			r.enabled = t.enabled, r.nextAt = this.now(), r.failures = 0;
		}), this.audit(t.enabled ? "resume" : "pause", n.id, "SUCCESS"), this.view();
	}
	sync(e) {
		let t = u({ id: U }).strict().parse(e), n = this.mapping(t.id);
		if (this.security.require("banking.write"), this.owned(n), this.restoreCheck(), this.verifyMapping(n), !n.enabled) throw Error("Resume the mapping before synchronizing.");
		return this.blocked = "", this.store.change((e) => {
			e.mappings.find((e) => e.id === n.id).nextAt = this.now();
		}), this.view();
	}
	retire(e) {
		let t = u({
			id: U,
			confirmed: y(!0)
		}).strict().parse(e), n = this.mapping(t.id);
		if (this.security.require("banking.write"), this.owned(n), this.running) throw Error("Wait for the running request.");
		if (this.store.read().batches.some((e) => e.mappingId === n.id && e.status !== "COMPLETED")) throw Error("Review all existing batches before retiring this mapping.");
		return this.audit("retire", n.id, "INTENT"), this.store.change((e) => {
			let t = e.mappings.find((e) => e.id === n.id);
			t.retired = !0, t.enabled = !1;
		}), this.audit("retire", n.id, "SUCCESS"), this.view();
	}
	renew(e) {
		let t = u({
			id: U,
			confirmed: y(!0)
		}).strict().parse(e), n = this.mapping(t.id);
		this.security.require("banking.write"), this.owned(n), this.restoreCheck();
		let r = this.vault.get(), i = this.store.read(), a = i.accounts.find((e) => e.id === n.remote.id && e.institutionId === n.remote.institutionId);
		if (this.running || n.retired || !r.enabled || n.providerUserId !== r.userId || n.production !== r.production || i.accountsRevision !== this.vault.revision() || !a || a.expiresAt <= this.now() || this.identity(this.bank(n.bankAccountId)) !== n.bankIdentity) throw Error("Renew only the same provider user, environment and local bank after current account discovery.");
		return this.audit("renew", n.id, "INTENT"), this.store.change((e) => {
			let t = e.mappings.find((e) => e.id === n.id);
			t.remote = a, t.credentialRevision = this.vault.revision(), t.enabled = !0, t.failures = 0, t.error = void 0, t.nextAt = this.now();
		}), this.audit("renew", n.id, "SUCCESS"), this.view();
	}
	cancelRequest() {
		let e = this.security.require("banking.write"), t = this.store.read().request;
		if (this.running) throw Error("Wait for the running request.");
		if (t && t.ownerId !== e.userId && !m(e, "users.manage")) throw Error("Only the request owner or administrator may cancel.");
		return this.store.change((e) => {
			e.request = void 0;
		}), this.audit("request.cancel", "provider-user", "SUCCESS"), this.view();
	}
	importBatch(e) {
		let t = u({
			id: U,
			excludedIds: _(U).max(1e4),
			reason: S().min(10).max(2e3),
			confirmed: y(!0)
		}).strict().parse(e);
		this.security.require("banking.write"), this.restoreCheck();
		let n = this.store.read().batches.find((e) => e.id === t.id);
		if (!n) throw Error("Feed batch not found.");
		let r = this.mapping(n.mappingId);
		if (this.owned(r), this.verifyMapping(r), n.status === "COMPLETED") return this.view();
		if (new Set(t.excludedIds).size !== t.excludedIds.length || t.excludedIds.some((e) => !n.rows.some((t) => t.externalId === e))) throw Error("Choose unique rows from this batch.");
		if (this.running) throw Error("Wait for the running feed request before importing.");
		let i = n.rows.filter((e) => !t.excludedIds.includes(e.externalId));
		this.audit("import", n.id, "INTENT"), this.store.change((e) => {
			let r = e.batches.find((e) => e.id === n.id);
			r.status = "IMPORTING", r.excludedIds = t.excludedIds, r.reason = t.reason, r.error = void 0;
		});
		try {
			i.length && this.business.command({
				repository: "bankStatements",
				method: "importRows",
				args: [{
					bankAccountId: r.bankAccountId,
					rows: i
				}]
			});
			let e = this.lines(), t = i.map((t) => {
				let n = e.find((e) => e.bankAccountId === r.bankAccountId && e.externalId === t.externalId);
				if (!n || W(n) !== W(t)) throw Error("Imported statement evidence differs from the reviewed batch.");
				return {
					externalId: t.externalId,
					lineId: n.id,
					digest: W(t)
				};
			});
			this.store.change((e) => {
				let r = e.batches.find((e) => e.id === n.id);
				r.status = "COMPLETED", r.evidence = t, r.error = void 0;
			}), this.audit("import", n.id, "SUCCESS"), this.history("BATCH_IMPORTED", n.id);
		} catch (e) {
			throw this.store.change((e) => {
				let t = e.batches.find((e) => e.id === n.id);
				t.status = "REVIEW", t.error = "Import requires review. Existing statement IDs, reconciled periods and source conflicts remain protected.";
			}), this.audit("import", n.id, "FAILED"), e;
		}
		return this.view();
	}
	async tick() {
		if (!(this.running || this.blocked || !m(this.security.principal(), "banking.write"))) {
			this.running = !0;
			try {
				this.restoreCheck();
				let e = this.vault.get();
				if (!e.enabled || !e.apiKey || !e.userId) return;
				let t = this.passive(!0).userId, n = this.vault.revision(), r = this.store.read().request;
				if (r && r.ownerId === t) {
					this.store.change((e) => {
						e.request && (e.request.attempted = !0);
					});
					try {
						if (r.kind === "AUTHORIZE") {
							let i = await this.provider.authorization(e, this.now(), !r.attempted);
							this.security.principal()?.userId === t && this.vault.revision() === n && (this.link = {
								...i,
								ownerId: t,
								revision: n
							});
						} else {
							let r = await this.provider.discover(e, this.now());
							if (this.security.principal()?.userId !== t || this.vault.revision() !== n) throw new V("SESSION_OR_CONFIGURATION_CHANGED");
							this.store.change((e) => {
								e.accounts = r, e.accountsRevision = n;
							});
						}
						this.store.change((e) => {
							e.request = void 0;
						}), this.history(r.kind + "_COMPLETE", "provider-user"), this.audit(r.kind.toLowerCase(), "provider-user", "SUCCESS");
					} catch (e) {
						this.store.change((e) => {
							e.request = void 0;
						}), this.history(e instanceof V ? e.code : "PROVIDER_REQUEST_FAILED", "provider-user"), this.audit(r.kind.toLowerCase(), "provider-user", "FAILED"), this.blocked = e instanceof V ? e.code : "Bank feed request failed. Inspect configuration and try again.";
					}
					return;
				}
				let i = this.store.read().mappings.find((e) => !e.retired && e.enabled && e.ownerId === t && e.nextAt <= this.now());
				if (!i) return;
				try {
					this.verifyMapping(i), this.audit("sync", i.id, "INTENT");
					let r = this.today(), a = i.lastThrough ? (/* @__PURE__ */ new Date(Date.parse(i.lastThrough + "T00:00:00Z") - 6048e5)).toISOString().slice(0, 10) : i.startDate, o = a < i.startDate ? i.startDate : a, s = await this.provider.transactions(e, i.remote, o, r, this.now(), i.timeZone);
					if (this.security.principal()?.userId !== t || !m(this.security.principal(), "banking.write") || this.vault.revision() !== n || !this.mapping(i.id).enabled) throw new V("SESSION_CONFIGURATION_OR_MAPPING_CHANGED");
					this.verifyMapping(i);
					let c = this.store.read(), l = new Set(c.mappings.filter((e) => e.bankAccountId === i.bankAccountId && e.providerUserId === i.providerUserId && e.production === i.production && e.remote.id === i.remote.id).map((e) => e.id)), u = c.batches.filter((e) => l.has(e.mappingId)).flatMap((e) => e.rows), d = [];
					for (let e of s.rows) {
						let t = u.find((t) => t.externalId === e.externalId);
						if (t && W(t) !== W(e)) throw new V("POSTED_TRANSACTION_CHANGED_REVIEW_REQUIRED");
						t || d.push(e);
					}
					this.store.change((e) => {
						d.length && e.batches.push({
							id: k(),
							mappingId: i.id,
							createdAt: this.now(),
							throughDate: r,
							status: "REVIEW",
							rows: d,
							excludedIds: [],
							reason: "",
							evidence: []
						});
						let t = e.mappings.find((e) => e.id === i.id);
						t.lastSuccess = this.now(), t.lastThrough = r, t.remote = s.account, t.pendingCount = s.pending, t.failures = 0, t.error = void 0, t.nextAt = this.now() + 9e5;
					}), this.audit("sync", i.id, "SUCCESS");
				} catch (e) {
					this.store.change((t) => {
						let n = t.mappings.find((e) => e.id === i.id);
						n.failures++, n.error = e instanceof V ? e.code : "Mapping, local bank or persistence requires review.", n.nextAt = this.now() + Math.min(6e4 * 2 ** Math.min(n.failures, 8), 216e5), (n.failures >= 5 || e instanceof V && /CONSENT|CONNECTION|CHANGED|MISMATCH|ACCOUNT_UNAVAILABLE|HTTP_40[134]/.test(e.code)) && (n.enabled = !1);
					}), this.audit("sync", i.id, "FAILED");
				}
			} catch (e) {
				this.blocked = e instanceof Error ? e.message : "Bank feed worker stopped. Preserve the profile.";
			} finally {
				this.running = !1;
			}
		}
	}
}, G = (e) => String(e).replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]);
function jt(e) {
	let t = (t) => G(e.currency + " " + t.toFixed(2));
	return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>${G(e.documentNumber)}</title><style>@page{size:A4;margin:15mm}body{font:12px Arial;color:#172033}h1{font-size:24px}table{border-collapse:collapse;width:100%;margin-top:20px}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left}td:nth-last-child(-n+3){text-align:right}thead{display:table-header-group}tr{break-inside:avoid}</style></head><body><h1>${G(e.issuerName)}</h1><h2>Customer statement</h2><p>${G(e.customerName)} · ${G(e.fromDate)} to ${G(e.toDate)}</p><p>Opening ${t(e.openingBalance)} · Debits ${t(e.totalDebits)} · Credits ${t(e.totalCredits)} · Closing ${t(e.closingBalance)}</p><table><thead><tr><th>Date</th><th>Reference / description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead><tbody>${e.entries.map((e) => `<tr><td>${G(e.date)}</td><td>${G(e.reference)}<br>${G(e.description)}</td><td>${t(e.debit)}</td><td>${t(e.credit)}</td><td>${t(e.balance)}</td></tr>`).join("")}</tbody></table></body></html>`;
}
//#endregion
//#region src/features/document-output/outputHtml.ts
var K = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]);
function Mt(e) {
	let t = a(e), n = K, r = (e) => e.toFixed(2), i = t.kind.replaceAll("_", " "), o = t.recipient;
	return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'"><title>${n(t.documentNumber)} · ${n(t.issuer.name)}</title><style>@page{size:${t.template.paper};margin:16mm}*{box-sizing:border-box}body{font:13px/1.5 Arial,sans-serif;color:#172620;margin:24px auto;max-width:1000px;padding:16px}header{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #234d42;padding-bottom:16px}h1{font-size:24px;margin:0}h2{font-size:16px;margin:0 0 6px}p{margin:3px 0;overflow-wrap:anywhere}.muted{color:#52605b}.status{font-weight:bold}.columns{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:24px 0}table{border-collapse:collapse;width:100%;table-layout:fixed}th,td{padding:9px 7px;border-bottom:1px solid #d7dfdb;vertical-align:top;text-align:right;overflow-wrap:anywhere}th:first-child,td:first-child{text-align:left;width:36%}thead{display:table-header-group;background:#edf3ef}tr{break-inside:avoid}.totals{margin:20px 0 20px auto;max-width:320px}.totals p{display:flex;justify-content:space-between;gap:24px}.grand{font-size:18px;font-weight:bold}.notes{white-space:pre-wrap;margin-top:20px}.audit{font-size:10px;color:#52605b;margin-top:30px;border-top:1px solid #ddd;padding-top:8px}@media print{body{margin:0;padding:0;max-width:none}header{break-inside:avoid}}</style></head><body><header><section>${re(t.issuer.logo, t.template.logoPosition)}<h1>${n(t.issuer.name)}</h1>${[
		t.issuer.tradingName,
		t.issuer.identifier,
		t.issuer.address,
		t.issuer.email,
		t.issuer.phone
	].filter(Boolean).map((e) => `<p>${n(e)}</p>`).join("")}</section><section><h2>${n(i)}</h2><p>${n(t.documentNumber)}</p><p class="status">${n(t.status)}${t.status === "DRAFT" ? " · DRAFT — NOT ISSUED" : ""}</p><p>Date: ${n(t.documentDate)}</p>${t.dueDate ? `<p>Due: ${n(t.dueDate)}</p>` : ""}${t.expiryDate ? `<p>Expiry: ${n(t.expiryDate)}</p>` : ""}</section></header><div class="columns"><section><h2>Customer</h2><p>${n(t.customerName)}</p><p>${n(t.customerCode)} ${n(t.customerIdentifier)}</p><p>Reference: ${n(t.reference ?? "—")}</p></section><section><h2>Store & delivery</h2><p>${n(o?.locationName ?? "Not recorded on source")}</p><p>${n(o?.deliveryAddress ?? "")}</p><p>Accounting: ${n(o?.accountingContactName ?? "Not recorded on source")}</p><p>${n(o?.accountingEmail ?? "")}</p></section></div><table><thead><tr><th>Item / description</th><th>Qty / unit</th><th>Unit price (net)</th><th>Net</th><th>Tax</th><th>Total</th></tr></thead><tbody>${t.lines.map((e) => `<tr><td>${n(e.sku)}${e.itemType && e.itemType !== "STOCK" ? `<p class="muted">${n(e.itemType.replaceAll("_", " "))} · No stock dispatch</p>` : ""}<p>${n(e.description)}</p>${e.areaPerPack ? `<p class="muted">${e.requestedArea === void 0 ? "" : `${n(e.requestedArea)} m² required · `}${n(e.coveredArea)} m² covered · ${n(e.areaPerPack)} m²/pack</p>` : ""}</td><td>${n(e.quantity)} ${n(e.unitSymbol)}</td><td>${r(e.unitPrice)}</td><td>${r(e.lineSubtotal)}</td><td>${r(e.taxAmount)}<p class="muted">${n(e.taxCode ?? "Tax")} ${e.taxRate === void 0 ? "" : `${n(Number((e.taxRate * 100).toFixed(4)))}%`}</p></td><td>${r(e.lineTotal)}</td></tr>`).join("")}</tbody></table><div class="totals"><p><span>Subtotal</span><span>${r(t.totals.subtotal)}</span></p><p><span>Tax</span><span>${r(t.totals.taxAmount)}</span></p><p class="grand"><span>Total ${n(t.issuer.currency)}</span><span>${r(t.totals.total)}</span></p>${t.amountPaid === void 0 ? "" : `<p><span>Paid at preparation</span><span>${r(t.amountPaid)}</span></p>`}${t.amountDue === void 0 ? "" : `<p><span>Due at preparation</span><span>${r(t.amountDue)}</span></p>`}</div>${t.notes ? `<section class="notes"><h2>Notes / reason</h2>${n(t.notes)}</section>` : ""}${t.template.footer ? `<footer class="notes">${n(t.template.footer)}</footer>` : ""}<p class="audit">Prepared ${n(t.preparedAt)} · Version ${n(t.id)} · Source status ${n(t.status)} at preparation. This saved copy is not a live balance or delivery confirmation.</p></body></html>`;
}
//#endregion
//#region src/features/document-output/purchaseOutputHtml.ts
function Nt(e) {
	let t = le(e), n = t.kind === "PURCHASE_ORDER", r = (e) => e.toFixed(2);
	return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'"><title>${K(t.documentNumber)}</title><style>@page{size:${t.template.paper};margin:16mm}body{font:13px/1.5 Arial;color:#172620;max-width:1000px;margin:24px auto;padding:16px}header{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #234d42}p{white-space:pre-wrap;overflow-wrap:anywhere}h1{font-size:24px}table{border-collapse:collapse;width:100%;table-layout:fixed}th,td{padding:8px;border-bottom:1px solid #ddd;text-align:right;overflow-wrap:anywhere}th:first-child,td:first-child{text-align:left;width:36%}thead{display:table-header-group}tr{break-inside:avoid}.total{text-align:right;font-weight:bold}.audit{font-size:10px;border-top:1px solid #ddd}@media print{body{padding:0;margin:0}}</style></head><body><header><section>${re(t.issuer.logo, t.template.logoPosition)}<h1>${K(t.issuer.name)}</h1><p>${K(t.issuer.identifier)}\n${K(t.issuer.address)}\n${K(t.issuer.email)}</p></section><section><h2>${n ? "PURCHASE ORDER" : "REMITTANCE ADVICE"}</h2><p>${K(t.documentNumber)} · ${K(t.status)}${t.status === "DRAFT" ? " · NOT ISSUED" : ""}${t.status === "REVERSED" ? " · REVERSED — NOT AN ACTIVE PAYMENT" : ""}${t.status === "CANCELLED" ? " · CANCELLED" : ""}\nDate: ${K(t.date)}${t.expectedDeliveryDate ? "\nExpected delivery: " + K(t.expectedDeliveryDate) : ""}</p></section></header><h2>Supplier</h2><p>${K(t.supplierName)} · ${K(t.supplierCode)}\n${K(t.supplierAddress)}\n${K(t.supplierContact)} · ${K(t.supplierEmail)}</p><p>Supplier contact/address captured at preparation; supplier master updated ${K(t.supplierMetadataAt)}. Reference: ${K(t.reference)}</p>${n ? "" : `<p>${t.noncash ? "NONCASH PREPAYMENT APPLICATION — no new bank payment" : "Recorded payment — this advice does not send funds or confirm bank settlement"}. Method: ${K(t.method)}</p>`}<table><thead><tr>${n ? "<th>Item / description</th><th>Ordered qty / unit</th><th>Unit cost (net)</th><th>Net</th><th>Tax</th><th>Total</th>" : "<th>Bill</th><th>Supplier invoice reference</th><th>Allocated amount</th>"}</tr></thead><tbody>${t.lines.map((e) => n ? `<tr><td>${K(e.reference)}<p>${K(e.description)}</p></td><td>${K(e.quantity)} ${K(e.unit)}</td><td>${r(e.unitPrice)}</td><td>${r(e.net)}</td><td>${r(e.tax)}<p>${K(e.taxCode)} ${e.taxRate === void 0 ? "" : K(Number((e.taxRate * 100).toFixed(4))) + "%"}</p></td><td>${r(e.total)}</td></tr>` : `<tr><td>${K(e.description)}</td><td>${K(e.reference)}</td><td>${r(e.total)}</td></tr>`).join("")}</tbody></table>${n ? `<p class="total">Subtotal ${r(t.subtotal)} · Tax ${r(t.tax)}</p>` : ""}<p class="total">${n ? "Order total" : "Allocated payment total"} ${K(t.issuer.currency)} ${r(t.total)}</p><p>${K(t.notes)}</p><p>${K(t.template.footer)}</p><p class="audit">Prepared ${K(t.preparedAt)} · ${K(t.preparedBy)} · Version ${K(t.id)}. Status and amounts are retained at preparation. This saved copy is not delivery confirmation${n ? " or a supplier invoice" : ", a tax invoice or a bank payment instruction"}.</p></body></html>`;
}
//#endregion
//#region src/features/sales/data/customerStatementService.ts
function Pt({ customerId: e, documents: t, payments: n, creditNotes: r, fromDate: i, toDate: a }) {
	if (i > a) throw Error("Statement from date cannot be after to date.");
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e && t.documentDate <= a), s = new Map(o.map((e) => [e.id, e])), c = r.filter((t) => t.customerId === e && t.creditDate <= a && t.status !== "DRAFT"), l = [];
	for (let e of o) if (l.push({
		id: `invoice-${e.id}`,
		date: e.documentDate,
		sortDateTime: `${e.documentDate}T00:00:00.000Z`,
		type: "INVOICE",
		reference: e.documentNumber,
		description: "Sales invoice",
		invoiceId: e.id,
		debit: q(e.totals.total),
		credit: 0
	}), e.voidedAt) {
		let t = It(e.voidedAt);
		t <= a && l.push({
			id: `invoice-void-${e.id}`,
			date: t,
			sortDateTime: e.voidedAt,
			type: "INVOICE_VOID",
			reference: `${e.documentNumber} VOID`,
			description: e.voidReason ? `Invoice void — ${e.voidReason}` : "Invoice void",
			invoiceId: e.id,
			debit: 0,
			credit: q(e.totals.total)
		});
	}
	for (let t of n) {
		if (t.customerId !== e || t.paymentDate > a) continue;
		let n = s.get(t.invoiceId)?.documentNumber;
		if (l.push({
			id: `payment-${t.id}`,
			date: t.paymentDate,
			sortDateTime: t.createdAt,
			type: "PAYMENT",
			reference: t.paymentNumber,
			description: n ? `Payment received — ${n}` : "Payment received",
			invoiceId: t.invoiceId,
			paymentId: t.id,
			debit: 0,
			credit: q(t.amount)
		}), t.status === "REVERSED" && t.reversedAt) {
			let e = It(t.reversedAt);
			e <= a && l.push({
				id: `payment-reversal-${t.id}`,
				date: e,
				sortDateTime: t.reversedAt,
				type: "PAYMENT_REVERSAL",
				reference: `${t.paymentNumber} REV`,
				description: t.reversalReason ? `Payment reversal — ${t.reversalReason}` : "Payment reversal",
				invoiceId: t.invoiceId,
				paymentId: t.id,
				debit: q(t.amount),
				credit: 0
			});
		}
	}
	for (let e of c) if (l.push({
		id: `credit-note-${e.id}`,
		date: e.creditDate,
		sortDateTime: e.issuedAt ?? e.createdAt,
		type: "CREDIT_NOTE",
		reference: e.creditNoteNumber,
		description: e.reason ? `Credit note — ${e.reason}` : "Credit note",
		invoiceId: e.sourceInvoiceId,
		creditNoteId: e.id,
		debit: 0,
		credit: q(e.totals.total)
	}), e.voidedAt) {
		let t = It(e.voidedAt);
		t <= a && l.push({
			id: `credit-note-void-${e.id}`,
			date: t,
			sortDateTime: e.voidedAt,
			type: "CREDIT_NOTE_VOID",
			reference: `${e.creditNoteNumber} VOID`,
			description: e.voidReason ? `Credit note void — ${e.voidReason}` : "Credit note void",
			invoiceId: e.sourceInvoiceId,
			creditNoteId: e.id,
			debit: q(e.totals.total),
			credit: 0
		});
	}
	for (let e of c) for (let t of e.refundEvents ?? []) t.date <= a && l.push({
		id: "refund-" + t.id,
		date: t.date,
		sortDateTime: t.date + "T00:00:00Z",
		type: "REFUND",
		reference: e.creditNoteNumber,
		description: "Customer credit refund",
		creditNoteId: e.id,
		debit: t.amount,
		credit: 0
	}), t.reversalDate && t.reversalDate <= a && l.push({
		id: "refund-reversal-" + t.id,
		date: t.reversalDate,
		sortDateTime: t.reversalDate + "T23:59:59Z",
		type: "REFUND_REVERSAL",
		reference: e.creditNoteNumber,
		description: "Customer refund reversal",
		creditNoteId: e.id,
		debit: 0,
		credit: t.amount
	});
	l.sort(Ft);
	let u = q(l.filter((e) => e.date < i).reduce((e, t) => e + t.debit - t.credit, 0)), d = l.filter((e) => e.date >= i && e.date <= a), f = u, p = d.map((e) => (f = q(f + e.debit - e.credit), {
		id: e.id,
		date: e.date,
		type: e.type,
		reference: e.reference,
		description: e.description,
		invoiceId: e.invoiceId,
		paymentId: e.paymentId,
		creditNoteId: e.creditNoteId,
		debit: e.debit,
		credit: e.credit,
		balance: f
	})), m = q(p.reduce((e, t) => e + t.debit, 0)), ee = q(p.reduce((e, t) => e + t.credit, 0));
	return {
		customerId: e,
		fromDate: i,
		toDate: a,
		openingBalance: u,
		totalDebits: m,
		totalCredits: ee,
		closingBalance: q(u + m - ee),
		entries: p
	};
}
function Ft(e, t) {
	let n = e.date.localeCompare(t.date);
	return n === 0 ? e.sortDateTime.localeCompare(t.sortDateTime) : n;
}
function It(e) {
	return n(e);
}
function q(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/external-services/contract.ts
var J = S().min(1).max(200), Lt = S().email().max(254), Rt = u({
	emailEnabled: b(),
	checkoutEnabled: b(),
	resendKey: S().max(300).default(""),
	stripeKey: S().max(300).default(""),
	from: f([Lt, y("")]),
	successUrl: S().max(2e3),
	cancelUrl: S().max(2e3),
	live: b()
}).strict(), zt = [
	"QUEUED",
	"PROCESSING",
	"RETRY",
	"ACCEPTED",
	"DELIVERED",
	"DELAYED",
	"BOUNCED",
	"COMPLAINED",
	"SUPPRESSED",
	"FAILED",
	"UNCERTAIN",
	"CANCELLED",
	"OPEN",
	"EXPIRED",
	"PAID_REVIEW",
	"RECORDING",
	"RECORDED"
], Bt = u({
	from: Lt,
	to: Lt,
	subject: S().min(1).max(998),
	text: S().min(1).max(3e4),
	attachments: _(u({
		filename: S().min(1).max(200),
		content: S().max(75e5)
	}).strict()).length(1)
}).strict(), Vt = u({
	invoiceId: J,
	documentNumber: J,
	amountMinor: v().int().positive().max(99999999),
	currency: y("aud"),
	successUrl: S(),
	cancelUrl: S(),
	customerEmail: Lt.optional(),
	live: b()
}).strict(), Ht = u({
	id: J,
	operationId: J,
	ownerId: J,
	kind: h(["EMAIL", "CHECKOUT"]),
	family: h(["sales", "purchase"]),
	artifactId: J.optional(),
	sourceId: J,
	sourceRevision: S().max(5e5),
	label: S().max(300),
	recipient: S().max(254),
	dedupe: J,
	credentialRevision: J,
	createdAt: v().finite(),
	payloadDigest: S().length(64).optional(),
	firstAttempt: v().finite().optional(),
	attempts: v().int().nonnegative().max(100),
	nextAt: v().finite(),
	status: h(zt),
	providerId: J.optional(),
	url: S().max(3e3).optional(),
	amountMinor: v().int().positive().optional(),
	payload: f([Bt, Vt]).optional(),
	error: S().max(300).optional(),
	receiptId: J.optional(),
	recordBankId: J.optional(),
	reminderKey: J.optional(),
	history: _(u({
		at: v().finite(),
		event: S().max(100)
	}).strict()).max(500)
}).strict(), Ut = u({
	id: J,
	invoiceId: J,
	ownerId: J,
	enabled: b(),
	days: _(v().int().min(0).max(90)).min(1).max(5),
	createdAt: v().finite()
}).strict(), Wt = u({
	id: J,
	operationId: J,
	ownerId: J,
	kind: y("CUSTOMER_STATEMENT"),
	sourceId: J,
	sourceRevision: S().length(64),
	documentNumber: J,
	fromDate: S(),
	toDate: S(),
	customerName: S().max(1e3),
	issuerName: S().max(1e3),
	currency: S().max(10),
	recipient: u({ accountingEmail: Lt }),
	subject: S().max(998),
	body: S().max(3e4),
	template: u({ paper: y("A4") }),
	openingBalance: v().finite(),
	closingBalance: v().finite(),
	totalDebits: v().finite(),
	totalCredits: v().finite(),
	entries: _(u({
		date: S(),
		reference: S().max(1e3),
		description: S().max(2e4),
		debit: v().finite(),
		credit: v().finite(),
		balance: v().finite()
	}).strict()).max(5e3)
}).strict(), Gt = u({
	version: y(1),
	id: S().uuid(),
	jobs: _(Ht).max(2e3),
	policies: _(Ut).max(1e3),
	statements: _(Wt).max(1e3).default([])
}).strict(), Kt = (e) => O("sha256").update(JSON.stringify(e)).digest("hex"), qt = class {
	path;
	data;
	constructor(e) {
		if (this.path = D(e, "integration-journal-v1.json"), C(this.path)) try {
			let e = w(this.path, "utf8");
			if (Buffer.byteLength(e) > 6e7) throw Error();
			let { checksum: t, ...n } = JSON.parse(e);
			if (t !== Kt(n) || (this.data = Gt.parse(n), new Set(this.data.jobs.map((e) => e.id)).size !== this.data.jobs.length || new Set(this.data.jobs.map((e) => e.operationId)).size !== this.data.jobs.length)) throw Error();
		} catch {
			throw Error("Integration journal is invalid. Preserve the full profile and inspect it; do not reset it to resend.");
		}
		else this.data = {
			version: 1,
			id: k(),
			jobs: [],
			policies: [],
			statements: []
		}, this.save(this.data);
	}
	read() {
		return structuredClone(this.data);
	}
	save(e) {
		let t = Gt.parse(e);
		if (Buffer.byteLength(JSON.stringify(t)) > 5e7) throw Error("Integration journal quota reached. Preserve it before archiving payloads.");
		F(this.path, {
			...t,
			checksum: Kt(t)
		}), this.data = structuredClone(t);
	}
	change(e) {
		let t = this.read();
		e(t), this.save(t);
	}
}, Jt = class {
	path;
	codec;
	constructor(e, t) {
		this.codec = t, this.path = D(e, "integration-secrets-v1.json");
	}
	get() {
		if (!C(this.path)) return {
			emailEnabled: !1,
			checkoutEnabled: !1,
			resendKey: "",
			stripeKey: "",
			from: "",
			successUrl: "",
			cancelUrl: "",
			live: !1
		};
		if (!this.codec.available()) throw Error("OS protected credential storage is unavailable.");
		try {
			let e = JSON.parse(w(this.path, "utf8"));
			if (e.version !== 1 || typeof e.cipher != "string") throw Error();
			return Rt.parse(JSON.parse(this.codec.decrypt(Buffer.from(e.cipher, "base64"))));
		} catch {
			throw Error("Saved integration credentials cannot be decrypted on this device. Reconfigure locally; do not reset the integration journal.");
		}
	}
	set(e) {
		if (!this.codec.available()) throw Error("OS protected credential storage is unavailable.");
		let t = Rt.safeParse(e);
		if (!t.success) throw Error("Invalid integration settings.");
		let n = t.data, r;
		try {
			r = this.get();
		} catch {
			if (n.emailEnabled && !n.resendKey || n.checkoutEnabled && !n.stripeKey) throw Error("Enter fresh keys for every enabled service to replace unreadable credentials.");
			r = {
				...n,
				resendKey: "",
				stripeKey: ""
			};
		}
		if (n.resendKey = n.resendKey || r.resendKey, n.stripeKey = n.stripeKey || r.stripeKey, n.resendKey && !/^re_[A-Za-z0-9_-]+$/.test(n.resendKey)) throw Error("Invalid Resend key format.");
		if (n.stripeKey && !RegExp("^(sk|rk)_" + (n.live ? "live" : "test") + "_[A-Za-z0-9]+$").test(n.stripeKey)) throw Error("Stripe key does not match the selected test/live mode.");
		if (n.emailEnabled && (!n.resendKey || !n.from)) throw Error("Configure a Resend key and verified sender before enabling email.");
		if (n.checkoutEnabled) {
			if (!n.stripeKey) throw Error("Configure Stripe credentials first.");
			for (let e of [n.successUrl, n.cancelUrl]) {
				let t;
				try {
					t = new URL(e);
				} catch {
					throw Error("Configure valid HTTPS checkout return pages.");
				}
				if (t.protocol !== "https:" || t.username || t.password || t.port && t.port !== "443") throw Error("Checkout return pages must use HTTPS.");
			}
		}
		F(this.path, {
			version: 1,
			cipher: this.codec.encrypt(JSON.stringify(n)).toString("base64")
		});
	}
	revision(e) {
		let t = this.get();
		return Kt(e === "EMAIL" ? [t.resendKey, t.from] : [t.stripeKey, t.live]);
	}
}, Y = class extends Error {
	code;
	retryable;
	constructor(e, t = !1) {
		super(e), this.code = e, this.retryable = t;
	}
}, Yt = async (e, t) => {
	let n;
	try {
		n = await fetch(e, {
			...t,
			redirect: "error",
			signal: AbortSignal.timeout(2e4)
		});
	} catch {
		throw new Y("NETWORK_OUTCOME_UNKNOWN", !0);
	}
	if (!n.ok) throw await n.body?.cancel(), new Y("PROVIDER_HTTP_" + n.status, n.status === 429 || n.status >= 500 || n.status === 409);
	try {
		let e = n.body?.getReader();
		if (!e) throw Error();
		let t = 0, r = [];
		for (;;) {
			let n = await e.read();
			if (n.done) break;
			if (t += n.value.byteLength, t > 1e6) throw await e.cancel(), Error();
			r.push(n.value);
		}
		return JSON.parse(Buffer.concat(r).toString("utf8"));
	} catch {
		throw new Y("PROVIDER_RESPONSE_INVALID", !0);
	}
}, Xt = S().regex(/^[a-zA-Z0-9_-]{1,200}$/), Zt = u({ id: Xt }), Qt = u({
	id: Xt,
	client_reference_id: S(),
	metadata: u({ htt_job: S() }),
	mode: y("payment"),
	livemode: b(),
	currency: y("aud"),
	amount_total: v().int().positive(),
	status: h([
		"open",
		"complete",
		"expired"
	]),
	payment_status: h([
		"paid",
		"unpaid",
		"no_payment_required"
	]),
	url: S().nullable().optional(),
	payment_intent: ue().optional()
});
function $t(e) {
	let t = new URL(e);
	if (t.protocol !== "https:" || t.hostname !== "checkout.stripe.com" || t.username || t.password || t.port) throw new Y("UNTRUSTED_CHECKOUT_URL");
	return t.href;
}
var en = class {
	transport;
	constructor(e = Yt) {
		this.transport = e;
	}
	async create(e, t, n) {
		if (e.kind === "EMAIL") {
			let r = Bt.parse(e.payload), i = await this.transport("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					Authorization: "Bearer " + t.resendKey,
					"Content-Type": "application/json",
					"Idempotency-Key": n
				},
				body: JSON.stringify(r)
			}), a = Zt.safeParse(i);
			if (!a.success) throw new Y("PROVIDER_RESPONSE_INVALID", !0);
			return { id: a.data.id };
		}
		let r = Vt.parse(e.payload), i = new URLSearchParams({
			mode: "payment",
			client_reference_id: r.invoiceId,
			"metadata[htt_job]": e.id,
			"payment_method_types[0]": "card",
			"line_items[0][price_data][currency]": "aud",
			"line_items[0][price_data][unit_amount]": String(r.amountMinor),
			"line_items[0][price_data][product_data][name]": r.documentNumber,
			"line_items[0][quantity]": "1",
			success_url: r.successUrl,
			cancel_url: r.cancelUrl
		});
		r.customerEmail && i.set("customer_email", r.customerEmail);
		let a = await this.transport("https://api.stripe.com/v1/checkout/sessions", {
			method: "POST",
			headers: {
				Authorization: "Bearer " + t.stripeKey,
				"Content-Type": "application/x-www-form-urlencoded",
				"Idempotency-Key": n
			},
			body: i.toString()
		}), o = this.session(a, e);
		if (!o.url) throw new Y("CHECKOUT_URL_MISSING", !0);
		return {
			id: o.id,
			url: $t(o.url)
		};
	}
	session(e, t) {
		let n = Qt.safeParse(e);
		if (!n.success) throw new Y("PAYMENT_EVIDENCE_INVALID");
		let r = n.data, i = Vt.parse(t.payload);
		if (r.client_reference_id !== t.sourceId || r.metadata.htt_job !== t.id || r.amount_total !== t.amountMinor || r.livemode !== i.live || t.providerId && r.id !== t.providerId) throw new Y("PAYMENT_EVIDENCE_MISMATCH");
		return r;
	}
	async poll(e, t) {
		if (!e.providerId || !Xt.safeParse(e.providerId).success) throw new Y("PROVIDER_REFERENCE_MISSING");
		if (e.kind === "EMAIL") {
			let n = await this.transport("https://api.resend.com/emails/" + encodeURIComponent(e.providerId), { headers: { Authorization: "Bearer " + t.resendKey } }), r = u({
				id: Xt,
				last_event: h([
					"sent",
					"delivered",
					"delivery_delayed",
					"bounced",
					"complained",
					"opened",
					"clicked",
					"scheduled",
					"canceled",
					"failed",
					"suppressed"
				])
			}).safeParse(n);
			if (!r.success || r.data.id !== e.providerId) throw new Y("DELIVERY_EVIDENCE_INVALID");
			return { status: {
				sent: "ACCEPTED",
				delivered: "DELIVERED",
				delivery_delayed: "DELAYED",
				bounced: "BOUNCED",
				complained: "COMPLAINED",
				opened: "DELIVERED",
				clicked: "DELIVERED",
				scheduled: "ACCEPTED",
				canceled: "CANCELLED",
				failed: "FAILED",
				suppressed: "SUPPRESSED"
			}[r.data.last_event] };
		}
		let n = await this.transport("https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(e.providerId) + "?expand[]=payment_intent.latest_charge", { headers: { Authorization: "Bearer " + t.stripeKey } }), r = this.session(n, e);
		if (r.status === "expired") return { status: "EXPIRED" };
		if (r.payment_status !== "paid" || r.status !== "complete") return { status: "OPEN" };
		let i = u({
			status: y("succeeded"),
			currency: y("aud"),
			amount_received: v().int(),
			latest_charge: u({
				paid: y(!0),
				captured: y(!0),
				amount_captured: v().int(),
				amount_refunded: y(0),
				refunded: y(!1),
				created: v().int().positive()
			})
		}).safeParse(r.payment_intent);
		if (!i.success || i.data.amount_received !== e.amountMinor || i.data.latest_charge.amount_captured !== e.amountMinor) throw new Y("PAID_CHARGE_REQUIRES_REVIEW");
		return {
			status: "PAID_REVIEW",
			paidAt: i.data.latest_charge.created * 1e3
		};
	}
}, X = S().min(1).max(200), tn = "external-stripe:", nn = /* @__PURE__ */ new Set(["QUEUED", "RETRY"]), rn = (e) => O("sha256").update(JSON.stringify(e)).digest("hex"), an = class {
	running = !1;
	blocked = "";
	reminderCursor = 0;
	store;
	vault;
	security;
	business;
	pdf;
	providers;
	now;
	constructor(e, t, n, r, i, a = new en(), o = () => Date.now()) {
		this.store = e, this.vault = t, this.security = n, this.business = r, this.pdf = i, this.providers = a, this.now = o;
		let s = this.store.read().jobs.filter((e) => e.status === "PROCESSING" || e.status === "RECORDING");
		s.length && this.store.change((e) => {
			for (let t of e.jobs) s.some((e) => e.id === t.id) && (t.status = t.providerId ? "PAID_REVIEW" : "RETRY", t.nextAt = this.now(), t.error = "Interrupted operation: same provider key retained.");
		});
	}
	passive(e) {
		let t = this.security.principal();
		if (!m(t, e)) throw Error("Permission denied: " + e);
		return t;
	}
	readPermission(e) {
		return e.family === "sales" ? "sales.read" : "purchases.read";
	}
	actionable(e) {
		let t = this.security.principal();
		return !!t && t.userId === e.ownerId && m(t, e.kind === "EMAIL" ? "documents.prepare" : "sales.payment") && m(t, this.readPermission(e));
	}
	snapshots() {
		return this.business.view().repositories;
	}
	invoice(e) {
		let t = this.snapshots().sales?.invoices.find((t) => t.id === e);
		if (!t) throw Error("Invoice was not found.");
		return t;
	}
	validInvoice(e) {
		if (![
			"ISSUED",
			"PARTIALLY_PAID",
			"OVERDUE"
		].includes(e.status) || !(e.amountDue > 0) || !Number.isFinite(e.amountDue)) throw Error("Only issued unpaid customer invoices can use online collection.");
		return e;
	}
	statement(e, t, i) {
		if (this.passive("sales.read"), s(t), s(i), t > i || i > n(new Date(this.now()).toISOString())) throw Error("Choose a valid statement range ending on or before today.");
		let a = this.snapshots(), o = a.customers?.customers.find((t) => t.id === e);
		if (!o) throw Error("Customer not found.");
		let c = o.contacts.filter((e) => e.isAccounting && S().email().safeParse(e.email).success);
		if (c.length !== 1) throw Error("Customer statement requires exactly one accounting contact email.");
		let l = Pt({
			customerId: e,
			documents: a.sales.invoices,
			payments: a.customerPayments.payments,
			creditNotes: a.customerCredits.creditNotes,
			fromDate: t,
			toDate: i
		}), u = r();
		return {
			customer: o,
			recipient: c[0].email,
			report: l,
			settings: u,
			revision: rn([
				o,
				l,
				u.companyName,
				u.currency
			])
		};
	}
	prepareStatement(e) {
		let t = u({
			operationId: X,
			customerId: X,
			fromDate: S(),
			toDate: S()
		}).strict().parse(e), n = this.security.require("documents.prepare");
		this.security.require("sales.read");
		let r = this.store.read().statements.find((e) => e.operationId === t.operationId);
		if (r) {
			if (r.ownerId !== n.userId || r.sourceId !== t.customerId || r.fromDate !== t.fromDate || r.toDate !== t.toDate) throw Error("Statement operation belongs to different input.");
			return r.id;
		}
		let i = this.statement(t.customerId, t.fromDate, t.toDate), a = "STATEMENT-" + i.customer.code + "-" + t.toDate, o = Wt.parse({
			id: k(),
			operationId: t.operationId,
			ownerId: n.userId,
			kind: "CUSTOMER_STATEMENT",
			sourceId: t.customerId,
			sourceRevision: i.revision,
			documentNumber: a,
			fromDate: t.fromDate,
			toDate: t.toDate,
			customerName: i.customer.businessName,
			issuerName: i.settings.companyName,
			currency: i.settings.currency,
			recipient: { accountingEmail: i.recipient },
			subject: a,
			body: "Dear " + i.customer.businessName + ",\nPlease find your statement from " + t.fromDate + " to " + t.toDate + ". Closing balance " + i.settings.currency + " " + i.report.closingBalance.toFixed(2) + ".",
			template: { paper: "A4" },
			openingBalance: i.report.openingBalance,
			closingBalance: i.report.closingBalance,
			totalDebits: i.report.totalDebits,
			totalCredits: i.report.totalCredits,
			entries: i.report.entries.map((e) => ({
				date: e.date,
				reference: e.reference,
				description: e.description,
				debit: e.debit,
				credit: e.credit,
				balance: e.balance
			}))
		});
		return this.security.audit("external.statement.prepare", o.id, "INTENT", "documents.prepare"), this.store.change((e) => e.statements.push(o)), this.security.audit("external.statement.prepare", o.id, "SUCCESS", "documents.prepare"), o.id;
	}
	sourceArtifact(e, n) {
		let r = this.snapshots(), i = e === "sales" ? this.store.read().statements.find((e) => e.id === n) : void 0;
		if (i) {
			if (this.statement(i.sourceId, i.fromDate, i.toDate).revision !== i.sourceRevision) throw Error("Statement data changed; prepare a new version.");
			return {
				artifact: i,
				revision: i.sourceRevision,
				recipient: i.recipient.accountingEmail
			};
		}
		let a = r[e === "sales" ? "preparedSalesOutputs" : "preparedPurchaseOutputs"]?.artifacts.find((e) => e.id === n);
		if (!a) throw Error("Prepared output was not found or is not permitted.");
		let o, s;
		if (e === "sales") {
			let e = a.kind === "CREDIT_NOTE" ? r.customerCredits.creditNotes.find((e) => e.id === a.sourceId) : [
				...r.sales.quotes,
				...r.sales.salesOrders,
				...r.sales.invoices
			].find((e) => e.id === a.sourceId);
			if (!e) throw Error("Output source no longer exists.");
			if (o = e.updatedAt, s = e.status, o !== a.sourceUpdatedAt) throw Error("Source changed; prepare a new version before sending.");
		} else if (o = t(a.kind, a.sourceId), s = a.status, o !== a.sourceRevision) throw Error("Purchase source changed; prepare a current version.");
		if ([
			"DRAFT",
			"VOID",
			"CANCELLED",
			"REVERSED",
			"DECLINED",
			"EXPIRED"
		].includes(s)) throw Error("Draft, cancelled or void documents cannot be emailed.");
		return {
			artifact: a,
			revision: o,
			recipient: e === "sales" ? a.recipient?.accountingEmail : a.supplierEmail
		};
	}
	update(e, t, n) {
		this.store.change((r) => {
			let i = r.jobs.find((t) => t.id === e);
			if (!i) throw Error("Integration job missing.");
			Object.assign(i, t), n && (i.history = [...i.history.slice(-499), {
				at: this.now(),
				event: n
			}]);
		});
	}
	audit(e, t, n) {
		this.security.audit("external." + e, t.id, n, t.kind === "EMAIL" ? "documents.prepare" : "sales.payment", void 0, t.ownerId);
	}
	get(e) {
		let t = this.store.read().jobs.find((t) => t.id === e);
		if (!t) throw Error("Integration job not found.");
		return this.passive(this.readPermission(t)), t;
	}
	receiptOperation(e) {
		return tn + this.store.read().id + ":" + e.id;
	}
	receipt(e) {
		let t = i.list().find((t) => t.operationId === this.receiptOperation(e));
		if (!t) return;
		if (t.kind !== "CUSTOMER_PAYMENT" || t.state !== "COMPLETED") throw Error("External payment has an unresolved accounting operation.");
		let n = this.snapshots().customerPayments?.payments.find((n) => n.id === t.resultId && n.invoiceId === e.sourceId && n.status === "RECEIVED" && Math.round(n.amount * 100) === e.amountMinor && n.reference === "Stripe " + e.providerId);
		if (!n) throw Error("External receipt evidence differs from the restored ledger. Reconcile the business backup before processing integrations.");
		return n;
	}
	recoveryCheck() {
		for (let e of this.store.read().jobs) if (e.status === "RECORDED" && this.actionable(e) && !this.receipt(e)) throw Error("Recorded external receipt is missing from this business profile. Restore compatible ledger evidence before continuing.");
	}
	view() {
		let e = this.security.principal();
		if (!e || ![
			"sales.read",
			"purchases.read",
			"users.manage"
		].some((t) => m(e, t))) throw Error("Permission denied: integrations.");
		let t, n = this.blocked;
		try {
			t = this.vault.get(), this.recoveryCheck();
		} catch (e) {
			n = e instanceof Error ? e.message : "Integration inspection failed.";
		}
		t ??= {
			emailEnabled: !1,
			checkoutEnabled: !1,
			resendKey: "",
			stripeKey: "",
			from: "",
			successUrl: "",
			cancelUrl: "",
			live: !1
		};
		let r = this.store.read(), i = this.snapshots(), a = r.jobs.filter((t) => m(e, this.readPermission(t))).map((e) => {
			let { payload: t, credentialRevision: n, sourceRevision: r, ...i } = e;
			return i;
		}), o = [
			...m(e, "sales.read") ? r.statements.map((e) => ({
				id: e.id,
				family: "sales",
				label: e.documentNumber + " · " + e.id.slice(0, 8),
				recipient: e.recipient.accountingEmail
			})) : [],
			...m(e, "sales.read") ? (i.preparedSalesOutputs?.artifacts ?? []).map((e) => ({
				id: e.id,
				family: "sales",
				label: e.documentNumber + " · " + e.id.slice(0, 8),
				recipient: e.recipient?.accountingEmail ?? ""
			})) : [],
			...m(e, "purchases.read") ? (i.preparedPurchaseOutputs?.artifacts ?? []).map((e) => ({
				id: e.id,
				family: "purchase",
				label: e.documentNumber + " · " + e.id.slice(0, 8),
				recipient: e.supplierEmail ?? ""
			})) : []
		];
		return {
			configuration: {
				emailEnabled: t.emailEnabled,
				checkoutEnabled: t.checkoutEnabled,
				emailConfigured: !!t.resendKey && !!t.from,
				checkoutConfigured: !!t.stripeKey && !!t.successUrl && !!t.cancelUrl,
				from: t.from,
				successUrl: t.successUrl,
				cancelUrl: t.cancelUrl,
				live: t.live,
				secureStorage: this.vault.codec.available()
			},
			jobs: a,
			policies: m(e, "sales.read") ? r.policies : [],
			health: n || "Ready. No external service is contacted until enabled work is queued.",
			running: this.running,
			outputs: o,
			invoices: m(e, "sales.read") ? (i.sales?.invoices ?? []).map((e) => ({
				id: e.id,
				label: e.documentNumber,
				amountDue: e.amountDue,
				email: e.recipient?.accountingEmail ?? ""
			})) : [],
			customers: m(e, "sales.read") ? (i.customers?.customers ?? []).map((e) => ({
				id: e.id,
				name: e.businessName,
				email: e.contacts.filter((e) => e.isAccounting).map((e) => e.email).join(", ")
			})) : [],
			banks: m(e, "banking.read") ? (i.bankAccounts?.bankAccounts ?? []).filter((e) => e.active).map((e) => ({
				id: e.id,
				name: e.name,
				currency: e.currency
			})) : []
		};
	}
	preview(e) {
		let t = u({
			family: h(["sales", "purchase"]),
			artifactId: X
		}).strict().parse(e);
		this.passive(t.family === "sales" ? "sales.read" : "purchases.read");
		let { artifact: n, recipient: r } = this.sourceArtifact(t.family, t.artifactId);
		return {
			recipient: r,
			subject: n.subject,
			body: n.body,
			html: n.kind === "CUSTOMER_STATEMENT" ? jt(n) : t.family === "sales" ? Mt(n) : Nt(n)
		};
	}
	configure(e) {
		if (this.security.require("users.manage"), this.running) throw Error("Wait for the running provider request before changing credentials.");
		return this.security.audit("external.configuration", "integration-vault", "INTENT", "users.manage"), this.vault.set(e), this.security.audit("external.configuration", "integration-vault", "SUCCESS", "users.manage"), this.view();
	}
	async queueMail(e, t) {
		let n = u({
			operationId: X,
			artifactId: X,
			family: h(["sales", "purchase"]),
			confirmed: y(!0)
		}).strict().parse(e), r = this.security.require("documents.prepare");
		this.security.require(n.family === "sales" ? "sales.read" : "purchases.read");
		let i = this.store.read().jobs.find((e) => e.operationId === n.operationId);
		if (i) {
			if (i.ownerId !== r.userId) throw Error("Operation belongs to another user.");
			if (i.artifactId !== n.artifactId || i.family !== n.family || i.kind !== "EMAIL") throw Error("Operation ID already belongs to another request.");
			return i.id;
		}
		let a = this.vault.get();
		if (!a.emailEnabled || !a.resendKey || !a.from) throw Error("Email is not configured and enabled.");
		let o = this.sourceArtifact(n.family, n.artifactId), s = S().email().parse(o.recipient), c = t ? t.key : "email:" + n.family + ":" + n.artifactId;
		if (this.store.read().jobs.some((e) => e.dedupe === c)) throw Error("This document version or reminder stage already has a delivery job. Inspect it instead of sending again.");
		if (this.store.read().jobs.some((e) => e.family === n.family && e.sourceId === o.artifact.sourceId && [
			"UNCERTAIN",
			"PROCESSING",
			"RETRY"
		].includes(e.status))) throw Error("Reconcile the pending or uncertain provider outcome for this source before creating another delivery.");
		if (this.store.read().jobs.some((e) => e.recipient === s && [
			"BOUNCED",
			"COMPLAINED",
			"SUPPRESSED"
		].includes(e.status))) throw Error("Recipient delivery is suppressed. Reconcile the failed address and prepare a corrected recipient before sending.");
		let l = await this.pdf(n.family, o.artifact);
		if (l.length > 5e6 || !l.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw Error("Generated PDF is invalid or exceeds 5 MB.");
		if (this.security.principal()?.userId !== r.userId) throw Error("Sign in again before queueing delivery.");
		if (this.security.require("documents.prepare"), this.security.require(n.family === "sales" ? "sales.read" : "purchases.read"), this.sourceArtifact(n.family, n.artifactId), this.vault.revision("EMAIL") !== rn([a.resendKey, a.from]) || !this.vault.get().emailEnabled) throw Error("Email configuration changed during preparation.");
		if (this.store.read().jobs.some((e) => e.dedupe === c || e.operationId === n.operationId)) throw Error("Delivery was already queued during preparation. Inspect the journal.");
		let d = (t ? "Payment reminder · " : "") + o.artifact.subject, f = t ? o.artifact.body + "\nOutstanding at preparation: AUD " + this.validInvoice(this.invoice(t.invoiceId)).amountDue.toFixed(2) : o.artifact.body, p = Bt.parse({
			from: a.from,
			to: s,
			subject: d,
			text: f,
			attachments: [{
				filename: o.artifact.documentNumber.replace(/[^A-Za-z0-9_-]/g, "-") + ".pdf",
				content: l.toString("base64")
			}]
		}), m = {
			id: k(),
			operationId: n.operationId,
			ownerId: r.userId,
			kind: "EMAIL",
			family: n.family,
			artifactId: n.artifactId,
			sourceId: o.artifact.sourceId,
			sourceRevision: o.revision,
			label: o.artifact.documentNumber,
			recipient: s,
			dedupe: c,
			credentialRevision: this.vault.revision("EMAIL"),
			createdAt: this.now(),
			attempts: 0,
			nextAt: this.now(),
			status: "QUEUED",
			payload: p,
			payloadDigest: rn(p),
			...t ? { reminderKey: t.key } : {},
			history: [{
				at: this.now(),
				event: t ? "REMINDER_QUEUED" : "DELIVERY_CONFIRMED"
			}]
		};
		return this.audit("queue", m, "INTENT"), this.store.change((e) => e.jobs.unshift(m)), this.audit("queue", m, "SUCCESS"), m.id;
	}
	queueCheckout(e) {
		let t = u({
			operationId: X,
			invoiceId: X,
			confirmed: y(!0)
		}).strict().parse(e), n = this.security.require("sales.payment"), r = this.vault.get(), i = this.store.read().jobs.find((e) => e.operationId === t.operationId);
		if (i) {
			if (i.ownerId !== n.userId) throw Error("Operation belongs to another user.");
			if (i.sourceId !== t.invoiceId || i.kind !== "CHECKOUT") throw Error("Operation ID belongs to another request.");
			return i.id;
		}
		if (!r.checkoutEnabled || !r.stripeKey) throw Error("Checkout is not configured and enabled.");
		let a = this.validInvoice(this.invoice(t.invoiceId));
		if (this.store.read().jobs.some((e) => e.kind === "CHECKOUT" && e.sourceId === t.invoiceId && ![
			"EXPIRED",
			"FAILED",
			"CANCELLED",
			"RECORDED"
		].includes(e.status))) throw Error("Inspect or expire the existing checkout before creating another link.");
		let o = this.snapshots().preparedSalesOutputs?.artifacts.find((e) => e.kind === "INVOICE" && e.sourceId === a.id && e.sourceUpdatedAt === a.updatedAt);
		if (!o || o.issuer.currency !== "AUD") throw Error("Prepare the current AUD invoice before creating checkout.");
		let s = Math.round(a.amountDue * 100);
		if (Math.abs(s - a.amountDue * 100) > 1e-6) throw Error("Invoice amount is not an exact AUD cent value.");
		let c = Vt.parse({
			invoiceId: a.id,
			documentNumber: a.documentNumber,
			amountMinor: s,
			currency: "aud",
			successUrl: r.successUrl,
			cancelUrl: r.cancelUrl,
			customerEmail: a.recipient?.accountingEmail || void 0,
			live: r.live
		}), l = {
			id: k(),
			operationId: t.operationId,
			ownerId: n.userId,
			kind: "CHECKOUT",
			family: "sales",
			sourceId: a.id,
			sourceRevision: a.updatedAt,
			label: a.documentNumber,
			recipient: c.customerEmail ?? "",
			dedupe: "checkout:" + a.id + ":" + t.operationId,
			credentialRevision: this.vault.revision("CHECKOUT"),
			createdAt: this.now(),
			attempts: 0,
			nextAt: this.now(),
			status: "QUEUED",
			amountMinor: s,
			payload: c,
			payloadDigest: rn(c),
			history: [{
				at: this.now(),
				event: "CHECKOUT_CONFIRMED"
			}]
		};
		return this.audit("queue", l, "INTENT"), this.store.change((e) => e.jobs.unshift(l)), this.audit("queue", l, "SUCCESS"), l.id;
	}
	policy(e) {
		let t = u({
			invoiceId: X,
			enabled: b(),
			days: _(v().int().min(0).max(90)).min(1).max(5)
		}).strict().parse(e), n = this.security.require("documents.prepare");
		if (this.security.require("sales.read"), !t.enabled) return this.store.change((e) => {
			let r = e.policies.find((e) => e.invoiceId === t.invoiceId);
			if (!r || r.ownerId !== n.userId) throw Error("Policy owner required.");
			r.enabled = !1;
		}), this.security.audit("external.reminder.policy", t.invoiceId, "SUCCESS", "documents.prepare"), this.view();
		let r = this.validInvoice(this.invoice(t.invoiceId));
		if (!r.dueDate || !S().email().safeParse(r.recipient?.accountingEmail).success) throw Error("Invoice must have a due date and saved accounting recipient.");
		s(r.dueDate);
		let i = [...new Set(t.days)].sort((e, t) => e - t);
		return this.security.audit("external.reminder.policy", t.invoiceId, "INTENT", "documents.prepare"), this.store.change((e) => {
			let r = e.policies.find((e) => e.invoiceId === t.invoiceId);
			if (r && r.ownerId !== n.userId) throw Error("Only the policy owner can change this reminder consent.");
			r ? (r.enabled = t.enabled, r.days = i) : e.policies.push({
				id: k(),
				invoiceId: t.invoiceId,
				ownerId: n.userId,
				enabled: t.enabled,
				days: i,
				createdAt: this.now()
			});
		}), this.security.audit("external.reminder.policy", t.invoiceId, "SUCCESS", "documents.prepare"), this.view();
	}
	requestReceipt(e) {
		let t = u({
			id: X,
			bankAccountId: X,
			confirmed: y(!0)
		}).strict().parse(e);
		this.security.require("sales.payment");
		let n = this.get(t.id);
		if (!this.actionable(n) || n.kind !== "CHECKOUT" || n.status !== "PAID_REVIEW") throw Error("Choose a verified paid checkout owned by your session.");
		if (!this.snapshots().bankAccounts.bankAccounts.find((e) => e.id === t.bankAccountId && e.active && e.currency === "AUD")) throw Error("Choose an active AUD merchant clearing bank account.");
		return this.audit("receipt.request", n, "INTENT"), this.update(n.id, {
			recordBankId: t.bankAccountId,
			nextAt: this.now()
		}, "RECEIPT_CONFIRMATION"), this.view();
	}
	retry(e) {
		let { id: t } = u({ id: X }).strict().parse(e), n = this.get(t);
		if (!this.actionable(n)) throw Error("Only the authorized job owner may retry.");
		if (n.status === "RECORDED") throw Error("Receipt is already recorded; inspect the ledger and audit.");
		if (n.providerId) {
			this.update(t, { nextAt: this.now() }, "STATUS_REFRESH");
			return;
		}
		if (![
			"RETRY",
			"FAILED",
			"UNCERTAIN"
		].includes(n.status) || n.firstAttempt === void 0 || this.now() - n.firstAttempt >= 828e5) throw Error("Provider outcome must be reconciled manually; a fresh idempotency key is not permitted.");
		this.update(t, {
			status: "RETRY",
			nextAt: this.now()
		}, "RETRY_REQUESTED");
	}
	cancel(e) {
		let { id: t } = u({ id: X }).strict().parse(e), n = this.get(t);
		if (!this.actionable(n) || n.attempts || n.providerId || n.status !== "QUEUED") throw Error("Only an unattempted queued job can be cancelled locally. Provider work requires external reconciliation.");
		this.audit("cancel", n, "INTENT"), this.update(t, { status: "CANCELLED" }, "CANCELLED_BEFORE_ATTEMPT"), this.audit("cancel", n, "SUCCESS");
	}
	checkoutUrl(e) {
		let { id: t } = u({ id: X }).strict().parse(e), n = this.get(t);
		if (n.kind !== "CHECKOUT" || !n.url || n.status !== "OPEN") throw Error("An open checkout link is required.");
		return $t(n.url);
	}
	async reminders() {
		let e = this.security.principal(), t = this.vault.get();
		if (!m(e, "documents.prepare") || !m(e, "sales.read") || !t.emailEnabled) return;
		let r = n(new Date(this.now()).toISOString()), i = this.store.read().policies.filter((t) => t.enabled && t.ownerId === e?.userId);
		if (!i.length) return;
		let a = this.reminderCursor % i.length, o = Array.from({ length: Math.min(20, i.length) }, (e, t) => i[(a + t) % i.length]);
		this.reminderCursor = (a + o.length) % i.length;
		for (let e of o) {
			let t = this.invoice(e.invoiceId);
			if (![
				"ISSUED",
				"PARTIALLY_PAID",
				"OVERDUE"
			].includes(t.status) || t.amountDue <= 0) continue;
			let i = Math.floor((Date.parse(r + "T00:00:00Z") - Date.parse(t.dueDate + "T00:00:00Z")) / 864e5), a = e.days.filter((e) => e <= i).at(-1);
			if (a === void 0) continue;
			let o = this.store.read().jobs;
			if (o.some((e) => e.recipient === t.recipient?.accountingEmail && [
				"BOUNCED",
				"COMPLAINED",
				"SUPPRESSED"
			].includes(e.status))) continue;
			let s = "reminder:" + e.id + ":" + t.dueDate + ":" + a;
			if (o.some((e) => e.dedupe === s) || o.some((e) => e.sourceId === t.id && (e.status === "PAID_REVIEW" || e.kind === "EMAIL" && [
				"QUEUED",
				"PROCESSING",
				"RETRY",
				"UNCERTAIN"
			].includes(e.status))) || o.some((e) => e.reminderKey && e.sourceId === t.id && n(new Date(e.createdAt).toISOString()) === r)) continue;
			let c = this.business.command({
				repository: "preparedSalesOutputs",
				method: "prepare",
				args: [{
					operationId: "prep:" + rn(s).slice(0, 60),
					sourceId: t.id,
					kind: "INVOICE",
					expectedUpdatedAt: t.updatedAt
				}]
			}).result;
			await this.queueMail({
				operationId: "mail:" + rn(s).slice(0, 60),
				artifactId: c.id,
				family: "sales",
				confirmed: !0
			}, {
				key: s,
				invoiceId: t.id
			});
			return;
		}
	}
	async tick() {
		if (!(this.running || this.blocked || !this.security.principal())) {
			this.running = !0;
			try {
				this.recoveryCheck();
				let e = this.vault.get(), t = this.store.read(), n = t.jobs.find((t) => this.actionable(t) && t.nextAt <= this.now() && (t.kind === "EMAIL" && e.emailEnabled || t.kind === "CHECKOUT" && e.checkoutEnabled) && (nn.has(t.status) || t.providerId && [
					"ACCEPTED",
					"DELAYED",
					"DELIVERED",
					"OPEN",
					"PAID_REVIEW"
				].includes(t.status) && this.now() - t.createdAt < 2592e6));
				if (!n) {
					await this.reminders();
					return;
				}
				if (n.credentialRevision !== this.vault.revision(n.kind)) {
					this.update(n.id, {
						error: "Credentials or sender changed. Reconcile under the original provider account.",
						nextAt: this.now() + 36e5
					});
					return;
				}
				if (n.providerId) {
					await this.poll(n, e);
					return;
				}
				if (n.firstAttempt !== void 0 && this.now() - n.firstAttempt >= 828e5) {
					this.update(n.id, {
						status: "UNCERTAIN",
						error: "Idempotency retention safety window expired. Check the provider; do not resend."
					}, "RECONCILIATION_REQUIRED");
					return;
				}
				try {
					if (n.kind === "EMAIL") this.sourceArtifact(n.family, n.artifactId);
					else {
						let e = this.validInvoice(this.invoice(n.sourceId));
						if (e.updatedAt !== n.sourceRevision || Math.round(e.amountDue * 100) !== n.amountMinor) throw Error("Invoice changed before checkout creation.");
					}
				} catch {
					this.update(n.id, {
						status: n.attempts ? "UNCERTAIN" : "CANCELLED",
						error: n.attempts ? "Source changed after a provider attempt. Reconcile its outcome; do not send a new job." : "Source changed or is no longer eligible. Prepare and review current data."
					}, "STALE_SOURCE_BLOCKED");
					return;
				}
				this.update(n.id, {
					status: "PROCESSING",
					attempts: n.attempts + 1,
					firstAttempt: n.firstAttempt ?? this.now()
				}, "PROVIDER_ATTEMPT"), this.audit("provider.create", n, "INTENT");
				try {
					let r = await this.providers.create(n, e, "htt-" + t.id + "-" + n.id), i = n.kind === "EMAIL" && n.payload ? {
						...Bt.parse(n.payload),
						attachments: Bt.parse(n.payload).attachments.map((e) => ({
							...e,
							content: ""
						}))
					} : n.payload;
					this.update(n.id, {
						providerId: r.id,
						url: r.url,
						status: n.kind === "EMAIL" ? "ACCEPTED" : "OPEN",
						error: void 0,
						nextAt: this.now() + 6e4,
						payload: i
					}, "PROVIDER_ACCEPTED"), this.audit("provider.create", n, "SUCCESS");
				} catch (e) {
					if (!(e instanceof Y)) throw e;
					let t = this.get(n.id), r = /^PROVIDER_HTTP_4(?!09|29)\d{2}$/.test(e.code), i = e.retryable && t.attempts < 5;
					this.update(n.id, {
						status: i ? "RETRY" : r ? "FAILED" : "UNCERTAIN",
						error: e.code,
						nextAt: this.now() + Math.min(6e4 * 2 ** t.attempts, 36e5)
					}, i ? "RETRY_SCHEDULED" : "PROVIDER_REVIEW"), this.audit("provider.create", n, "FAILED");
				}
			} catch (e) {
				this.blocked = e instanceof Y ? e.code : e instanceof Error ? e.message : "Integration worker stopped. Inspect local audit and preserve the profile.";
			} finally {
				this.running = !1;
			}
		}
	}
	async poll(e, t) {
		try {
			let r = await this.providers.poll(e, t);
			if (e.recordBankId && r.status !== "PAID_REVIEW") throw new Y("PAYMENT_STATE_CHANGED_RECONFIRM_REQUIRED");
			let i = {
				status: r.status,
				nextAt: this.now() + 9e5,
				error: void 0
			};
			if (e.kind === "CHECKOUT" && r.status === "PAID_REVIEW" && e.recordBankId) {
				if (!this.actionable(e)) throw new Y("SIGN_IN_AGAIN_TO_RECORD");
				let t = this.receipt(e);
				if (!t) {
					let i = this.validInvoice(this.invoice(e.sourceId));
					if (Math.round(i.amountDue * 100) < e.amountMinor) throw new Y("REMAINING_BALANCE_REQUIRES_REVIEW");
					if (!this.snapshots().bankAccounts.bankAccounts.find((t) => t.id === e.recordBankId && t.active && t.currency === "AUD") || !("paidAt" in r) || typeof r.paidAt != "number" || r.paidAt > this.now() + 6e4) throw new Y("CLEARING_OR_PAYMENT_DATE_REQUIRES_REVIEW");
					this.update(e.id, { status: "RECORDING" }, "VERIFIED_RECEIPT_POSTING"), this.audit("receipt", e, "INTENT"), t = this.business.command({
						repository: "sales",
						method: "recordInvoicePayment",
						args: [{
							invoiceId: e.sourceId,
							amount: e.amountMinor / 100,
							paymentDate: n(new Date(r.paidAt).toISOString()),
							method: "CARD",
							bankAccountId: e.recordBankId,
							reference: "Stripe " + e.providerId,
							notes: "Gross verified Stripe checkout; reconcile fees and bank payout separately.",
							operationId: this.receiptOperation(e)
						}]
					}).result;
				}
				i = {
					...i,
					status: "RECORDED",
					receiptId: t.id,
					recordBankId: void 0
				}, this.audit("receipt", e, "SUCCESS");
			}
			let a = i.status !== e.status;
			this.update(e.id, i, a ? "PROVIDER_" + i.status : void 0), a && this.audit("provider.status", e, "SUCCESS");
		} catch (t) {
			if (t instanceof Y) {
				this.update(e.id, {
					error: t.code,
					nextAt: this.now() + 9e5,
					...e.recordBankId ? {
						status: "PAID_REVIEW",
						recordBankId: void 0
					} : {}
				}, "PROVIDER_CHECK_FAILED");
				return;
			}
			if (e.recordBankId) {
				this.update(e.id, {
					status: "PAID_REVIEW",
					recordBankId: void 0,
					error: "Receipt could not be recorded. Inspect the accounting period, payment operation and audit before retrying.",
					nextAt: this.now() + 9e5
				}, "RECEIPT_REVIEW");
				return;
			}
			throw t;
		}
	}
};
//#endregion
//#region electron/integrations/outputPdf.ts
async function on(e, t) {
	let n = Wt.safeParse(t), r = t, i = n.success ? jt(n.data) : e === "sales" ? Mt(r) : Nt(r), a = new ke({
		show: !1,
		webPreferences: {
			sandbox: !0,
			contextIsolation: !0,
			nodeIntegration: !1,
			javascript: !1,
			webSecurity: !0,
			partition: "delivery-pdf-" + k()
		}
	});
	a.webContents.setWindowOpenHandler(() => ({ action: "deny" })), a.webContents.session.webRequest.onBeforeRequest((e, t) => t({ cancel: !e.url.startsWith("data:") && e.url !== "about:blank" }));
	let o;
	try {
		return await Promise.race([(async () => (await a.loadURL("data:text/html;base64," + Buffer.from(i).toString("base64")), a.webContents.printToPDF({
			pageSize: r.template.paper,
			printBackground: !0,
			preferCSSPageSize: !0
		})))(), new Promise((e, t) => {
			o = setTimeout(() => t(/* @__PURE__ */ Error("PDF rendering timed out.")), 2e4);
		})]);
	} catch {
		throw Error("PDF rendering failed. No delivery was queued.");
	} finally {
		clearTimeout(o), a.isDestroyed() || a.destroy();
	}
}
//#endregion
//#region electron/security/businessHost.ts
var sn = class {
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
		if (C(this.path)) r = x(w(this.path, "utf8")), r.schemaVersion !== 33 && (n = structuredClone(r), se(r)), this.values = r.storage;
		else {
			if (this.security.require("users.manage"), !t || typeof t != "object" || Object.keys(t).length > 1e3) throw Error("Invalid legacy local data.");
			for (let [e, n] of Object.entries(t)) if (!e.startsWith("htt") || typeof n != "string" || n.length > 5e7) throw Error("Invalid legacy local data.");
			let e = D(E(this.path), "legacy-profile-backup-v1.json");
			C(e) || F(e, {
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
		let o = await import("./businessEngine-AJ_sVnCQ.js");
		this.workspaceDefaults = o.workspaceDefaults, r && (ae(r, this.workspaceDefaults), d(r.repositories, e()), g(r.repositories), l(r.repositories), this.lastCommandId = r.lastCommandId), o.initialize(() => this.security.principal()), this.automationEngine = o, this.assertPeriod = o.assertPostingPeriod, oe(() => {
			if (!this.security.require("users.manage").roles.includes("ADMIN") || !this.initialized || this.blocked) throw Error("Permanent purge requires a healthy ADMIN desktop session.");
			let t = e();
			g(t);
			let n = ne({
				storage: structuredClone(this.values),
				repositories: t,
				lastCommandId: this.lastCommandId
			}), r = D(E(this.path), "recycle-backups"), i = k(), a = `pre-purge-${i}.json`;
			he(r, {
				recursive: !0,
				mode: 448
			});
			let o = D(r, a);
			F(o, n);
			let s = w(o, "utf8"), c = x(s);
			if (d(c.repositories, t), g(c.repositories), JSON.stringify(c) !== JSON.stringify(n)) throw Error("Pre-purge backup verification failed.");
			return {
				id: i,
				fileName: a,
				sha256: O("sha256").update(s).digest("hex"),
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			};
		}), p((t) => {
			if (this.security.require(t === "CLOSE" ? "accounting.periods" : "accounting.reopen"), !this.initialized || this.blocked) throw Error("Healthy desktop session required for year-end backup.");
			let n = e();
			g(n);
			let r = ne({
				storage: structuredClone(this.values),
				repositories: n,
				lastCommandId: this.lastCommandId
			}), i = D(E(this.path), "year-end-backups"), a = `pre-year-end-${t.toLowerCase()}-${k()}.json`;
			he(i, {
				recursive: !0,
				mode: 448
			});
			let o = D(i, a);
			F(o, r);
			let s = w(o, "utf8"), c = x(s);
			if (d(c.repositories, r.repositories), g(c.repositories), JSON.stringify(r) !== JSON.stringify(c)) throw Error("Year-end backup verification failed.");
			return {
				fileName: a,
				sha256: O("sha256").update(s).digest("hex"),
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			};
		}), n && (F(D(E(this.path), `pre-migration-v${r.schemaVersion}-${k()}.json`), n), this.persist(), this.security.audit("business.migrate.v33", "local-desktop-profile", "SUCCESS", "users.manage")), r || (this.persist(), this.security.audit("business.import", "local-desktop-profile", "SUCCESS", "users.manage"));
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
		F(this.path, ne({
			storage: this.values,
			repositories: e(),
			lastCommandId: t
		})), this.lastCommandId = t;
	}
	exportBackup() {
		if (this.security.require("users.manage"), !this.initialized || this.blocked) throw Error("Backup requires healthy initialized business data.");
		let t = x(w(this.path, "utf8"));
		return d(t.repositories, e()), g(t.repositories), ne({
			storage: t.storage,
			repositories: t.repositories,
			lastCommandId: t.lastCommandId
		});
	}
	prepareRestore(t) {
		let n = this.security.require("users.manage");
		this.prepared = void 0;
		let r = x(t);
		se(r), this.initialized && (ae(r, this.workspaceDefaults), d(r.repositories, e()), g(r.repositories));
		let i = k();
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
		let i = await import("./businessEngine-AJ_sVnCQ.js");
		if (ae(r.database, i.workspaceDefaults), d(r.database.repositories, e()), g(r.database.repositories), this.security.require("users.manage").userId !== n.userId) throw Error("Restore session changed.");
		let a = this.security.pendingBusinessCommands();
		if (a.length) {
			let e = x(w(this.path, "utf8"));
			for (let t of a) this.security.audit(`recovery.${t.action}`, t.resourceId, t.commandId === e.lastCommandId ? "SUCCESS" : "FAILED", t.permission, t.commandId);
		}
		let o = k();
		if (this.security.audit("business.restore", "business-data-only", "INTENT", "users.manage", o), C(this.path)) {
			let e = D(E(this.path), "recovery-backups");
			he(e, {
				recursive: !0,
				mode: 448
			});
			let t = ge(D(e, `before-restore-${o}.json`), "wx", 384);
			try {
				ye(t, w(this.path)), me(t);
			} finally {
				pe(t);
			}
			let n = ge(e, "r");
			try {
				me(n);
			} finally {
				pe(n);
			}
		}
		let s = ne({
			storage: r.database.storage,
			repositories: r.database.repositories,
			lastCommandId: o
		});
		this.blocked = !0;
		try {
			F(this.path, s);
		} catch {
			throw Error("Restore commit could not be confirmed. Restart and inspect before retry.");
		}
		this.security.audit("business.restore", "business-data-only", "SUCCESS", "users.manage", o);
	}
	view() {
		let e = this.security.principal();
		if (!e || !this.initialized) throw Error("Login and desktop data initialization required.");
		let t = m(e, "audit.read") ? Object.fromEntries(Object.entries(this.values).filter(([e]) => e === "htt:financial-operations:v1" || e.startsWith("htt.purchasePosting."))) : {};
		return {
			repositories: o(e),
			storage: t
		};
	}
	command(t) {
		if (this.blocked || !this.initialized) throw Error("Business writes blocked; restart and inspect local audit.");
		if (!t || typeof t.repository != "string" || typeof t.method != "string" || !Array.isArray(t.args) || t.args.length > 20) throw Error("Invalid business command.");
		let n;
		try {
			n = c(t.repository, t.method);
		} catch (e) {
			throw this.security.audit("command.denied", `${t.repository}.${t.method}`.slice(0, 200), "DENIED"), e;
		}
		let r = this.security.require(n.permission), i = structuredClone(t.args);
		if (this.automationEngine?.assertBankInstructionCommand(t.repository, t.method, i), [
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
			let n = i[0];
			if (t.method === "post" && (n?.sourceType !== "MANUAL_JOURNAL" || n.sourceId)) throw Error("System journals must be posted through their business source.");
			if (t.method === "reverse" && e().journals.journalEntries.find((e) => e.id === n?.journalEntryId)?.sourceType !== "MANUAL_JOURNAL") throw Error("System journals must be reversed through their business source.");
		}
		if (t.repository === "supplierPayments" && t.method === "reverse" && e().paymentBatches.batches.some((e) => e.status === "POSTED" && e.paymentIds.includes(i[0]))) throw Error("Reverse this supplier payment through its payment batch.");
		if (t.repository === "sales" && t.method === "reverseInvoicePayment" && e().customerSettlements.receipts.some((e) => e.status === "POSTED" && e.paymentIds.includes(i[0]))) throw Error("Reverse this payment through its grouped customer receipt.");
		if (t.repository === "salesRecovery" && i[0] && typeof i[0] == "object") {
			let e = i[0];
			t.method === "recordSalesManualReview" && (e.operator = r.userId), t.method === "closeVerifiedSalesReview" && (e.approver = r.userId);
		}
		if ([
			"voidInvoice",
			"voidCreditNote",
			"void",
			"markVoid",
			"voidCredit"
		].includes(t.method) && [
			"sales",
			"supplierBills",
			"supplierCredits"
		].includes(t.repository)) {
			let t = e(), n = typeof i[0] == "string" ? i[0] : i[0]?.invoiceId ?? i[0]?.creditNoteId ?? i[0]?.supplierCreditId ?? i[0]?.supplierBillId;
			if ([
				...t.sales.invoices,
				...t.customerCredits.creditNotes,
				...t.supplierBills.supplierBills,
				...t.supplierCredits.supplierCredits
			].some((e) => e.id === n && e.openingBalanceImportId)) throw Error("Historical opening documents must be corrected through the opening batch reversal.");
		}
		let a = k(), o = `${t.repository}.${t.method}`, s = typeof i[0] == "string" ? i[0].slice(0, 200) : String(i[0]?.id ?? i[0]?.invoiceId ?? t.repository).slice(0, 200);
		this.security.audit(o, s, "INTENT", n.permission, a);
		let u = e(), d = structuredClone(this.values), f;
		try {
			if (f = n.execute(i), t.repository === "bankStatements" && ["importRows", "importCsv"].includes(t.method)) {
				let t = new Set(u.bankStatements.lines.map((e) => e.id)), n = e().bankStatements.lines.filter((e) => !t.has(e.id)).map((e) => e.id);
				this.automationEngine?.classifyImportedBankLines(n, a);
			}
			if (t.repository === "sales" && t.method === "createInvoiceFromOrder" && this.assertPeriod(f.documentDate), this.automationEngine?.assertYearEndIntegrity(), f instanceof Promise) throw Error("Business commands must be synchronous.");
		} catch (e) {
			throw this.values = d, l(u), this.security.audit(o, s, "FAILED", n.permission, a), e;
		}
		try {
			this.persist(a);
		} catch (e) {
			throw this.values = d, l(u), this.blocked = !0, Error(`Business commit ${a} could not be confirmed: ${e instanceof Error ? e.message : String(e)}. Restart and review before retry.`);
		}
		try {
			this.security.audit(o, s, "SUCCESS", n.permission, a);
		} catch {
			throw this.blocked = !0, Error(`Business command ${a} committed, but final audit confirmation failed. Do not repeat it; restart and review.`);
		}
		return {
			result: f,
			view: this.view()
		};
	}
};
//#endregion
//#region electron/security/registerSecurityIpc.ts
function cn(e, t, n = () => {}) {
	de(D(A.isPackaged ? process.resourcesPath : A.getAppPath(), A.isPackaged ? "ocr" : "dist-ocr", "htt-ocr"));
	let r = new et(D(e, "security-v1.json")), i = new sn(D(e, "business-v1.json"), r), a, o = "";
	try {
		a = new an(new qt(e), new Jt(e, {
			available: () => M.isEncryptionAvailable() && (process.platform !== "linux" || M.getSelectedStorageBackend() !== "basic_text"),
			encrypt: (e) => M.encryptString(e),
			decrypt: (e) => M.decryptString(e)
		}), r, i, on);
	} catch {
		o = "Integration journal is unavailable. Preserve the complete profile for recovery; business data has not been reset.";
	}
	let s, c = "";
	try {
		s = new At(new bt(e), new xt(e, {
			available: () => M.isEncryptionAvailable() && (process.platform !== "linux" || M.getSelectedStorageBackend() !== "basic_text"),
			encrypt: (e) => M.encryptString(e),
			decrypt: (e) => M.decryptString(e)
		}), r, i);
	} catch {
		c = "Bank feed journal is unavailable. Preserve the full profile; business data has not been reset.";
	}
	let l, u = "";
	try {
		l = new dt(new nt(e, {
			available: () => M.isEncryptionAvailable() && (process.platform !== "linux" || M.getSelectedStorageBackend() !== "basic_text"),
			encrypt: (e) => M.encryptString(e),
			decrypt: (e) => M.decryptString(e)
		}), r, i);
	} catch {
		u = "Payroll filing journal is unavailable. Preserve the full profile and OS credentials; business data has not been reset.";
	}
	let d = !1;
	je.on("security:request", async (n, f, p) => {
		let m = t();
		if (!m || n.sender !== m.webContents || n.senderFrame !== m.webContents.mainFrame) {
			n.returnValue = {
				ok: !1,
				error: "Untrusted desktop sender."
			};
			return;
		}
		if (d) {
			n.returnValue = {
				ok: !1,
				error: "A desktop operation is already running."
			};
			return;
		}
		d = !0;
		try {
			if (typeof f != "string" || JSON.stringify(p ?? null).length > 6e7) throw Error("Invalid desktop request.");
			let t = p ?? {}, d;
			if (f.startsWith("payrollFilings.")) {
				if (!l) throw Error(u);
				let e;
				switch (f) {
					case "payrollFilings.view":
						e = l.view();
						break;
					case "payrollFilings.configure":
						e = l.configure(t);
						break;
					case "payrollFilings.saveProfile":
						e = l.saveProfile(t);
						break;
					case "payrollFilings.preflight":
						e = l.preflight(t);
						break;
					case "payrollFilings.prepare":
						e = l.prepare(t);
						break;
					case "payrollFilings.preview":
						e = l.preview(t);
						break;
					case "payrollFilings.declare":
						e = l.declare(t);
						break;
					case "payrollFilings.manualReview":
						e = l.manualReview(t);
						break;
					case "payrollFilings.refresh":
						e = l.refresh(t);
						break;
					case "payrollFilings.cancel":
						e = l.cancel(t);
						break;
					default: throw Error("Unknown payroll filing action.");
				}
				n.returnValue = {
					ok: !0,
					value: e
				};
				return;
			}
			if (f.startsWith("bankFeeds.")) {
				if (!s) throw Error(c);
				let e;
				switch (f) {
					case "bankFeeds.view":
						e = s.view();
						break;
					case "bankFeeds.configure":
						e = s.configure(t);
						break;
					case "bankFeeds.request":
						e = s.request(t);
						break;
					case "bankFeeds.cancelRequest":
						e = s.cancelRequest();
						break;
					case "bankFeeds.openAuthorization":
						await Ne.openExternal(s.authorizationUrl()), e = { opened: !0 };
						break;
					case "bankFeeds.map":
						e = s.map(t);
						break;
					case "bankFeeds.enabled":
						e = s.setEnabled(t);
						break;
					case "bankFeeds.sync":
						e = s.sync(t);
						break;
					case "bankFeeds.renew":
						e = s.renew(t);
						break;
					case "bankFeeds.retire":
						e = s.retire(t);
						break;
					case "bankFeeds.import":
						e = {
							feed: s.importBatch(t),
							view: i.view()
						};
						break;
					default: throw Error("Unknown bank feed action.");
				}
				n.returnValue = {
					ok: !0,
					value: e
				};
				return;
			}
			if (f.startsWith("integrations.")) {
				if (!a) throw Error(o);
				let e;
				switch (f) {
					case "integrations.view":
						e = a.view();
						break;
					case "integrations.configure":
						e = a.configure(t);
						break;
					case "integrations.preview":
						e = a.preview(t);
						break;
					case "integrations.statement":
						e = { id: a.prepareStatement(t) };
						break;
					case "integrations.mail":
						e = { id: await a.queueMail(t) };
						break;
					case "integrations.checkout":
						e = { id: a.queueCheckout(t) };
						break;
					case "integrations.reminders":
						e = a.policy(t);
						break;
					case "integrations.retry":
						a.retry(t), e = a.view();
						break;
					case "integrations.cancel":
						a.cancel(t), e = a.view();
						break;
					case "integrations.receipt":
						e = a.requestReceipt(t);
						break;
					case "integrations.run":
						a.view(), a.tick(), e = a.view();
						break;
					case "integrations.open":
						await Ne.openExternal(a.checkoutUrl(t)), e = { opened: !0 };
						break;
					default: throw Error("Unknown integration action.");
				}
				n.returnValue = {
					ok: !0,
					value: e
				};
				return;
			}
			switch (f) {
				case "status":
					d = r.status();
					break;
				case "setup":
					d = r.setup(t);
					break;
				case "login":
					d = r.login(t);
					break;
				case "logout":
					d = r.logout();
					break;
				case "users.list":
					d = r.listUsers();
					break;
				case "users.create":
					d = r.createUser(t);
					break;
				case "users.update":
					d = r.updateUser(t);
					break;
				case "password.change":
					d = r.changePassword(t);
					break;
				case "audit.list":
					d = r.listAudit(t);
					break;
				case "business.bootstrap":
					await i.initialize(t.legacyStorage), i.scanRecurringDue(), d = i.view();
					break;
				case "business.backup.save": {
					r.require("users.manage");
					let t = await j.showSaveDialog(m, {
						title: "Save business backup",
						defaultPath: `HTT-Business-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`,
						filters: [{
							name: "HTT business backup",
							extensions: ["json"]
						}]
					});
					if (t.canceled || !t.filePath) {
						d = { saved: !1 };
						break;
					}
					let n = Ce(T(e), D(T(E(t.filePath)), xe(t.filePath)));
					if (!n || !n.startsWith(".." + we) && n !== ".." && !Se(n)) throw Error("Choose a backup location outside the active local data directory.");
					let a = i.exportBackup();
					r.audit("business.backup", "business-data-only", "INTENT", "users.manage");
					try {
						F(t.filePath, a);
					} catch (e) {
						throw r.audit("business.backup", "business-data-only", "FAILED", "users.manage"), e;
					}
					r.audit("business.backup", "business-data-only", "SUCCESS", "users.manage"), d = { saved: !0 };
					break;
				}
				case "business.restore.preview": {
					r.require("users.manage");
					let e = await j.showOpenDialog(m, {
						title: "Select business backup",
						properties: ["openFile"],
						filters: [{
							name: "HTT business backup",
							extensions: ["json"]
						}]
					});
					if (e.canceled || !e.filePaths[0]) {
						d = null;
						break;
					}
					if (ve(e.filePaths[0]).size > 25e7) throw Error("Backup exceeds 250 MB.");
					d = i.prepareRestore(w(e.filePaths[0], "utf8"));
					break;
				}
				case "business.restore.commit":
					await i.restoreBackup(t.token), d = { restartRequired: !0 };
					break;
				case "capture.select": {
					if (r.require("purchases.bill"), Object.keys(t).some((e) => e !== "operationId") || typeof t.operationId != "string" || !t.operationId || t.operationId.length > 200) throw Error("Invalid recognition request.");
					let e = await j.showOpenDialog(m, {
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
						d = {};
						break;
					}
					let n = te(e.filePaths[0]), a = i.command({
						repository: "captureSources",
						method: "recognize",
						args: [{
							operationId: t.operationId,
							file: {
								name: xe(e.filePaths[0]),
								content: n.toString("base64")
							}
						}]
					});
					d = {
						source: a.result,
						view: a.view
					};
					break;
				}
				case "capture.export": {
					if (r.require("purchases.bill"), Object.keys(t).some((e) => e !== "id") || typeof t.id != "string") throw Error("Invalid source export request.");
					let n = i.command({
						repository: "captureSources",
						method: "read",
						args: [t.id]
					}).result, a = await j.showSaveDialog(m, {
						title: "Export preserved original",
						defaultPath: n.name
					});
					if (a.canceled || !a.filePath) {
						d = { saved: !1 };
						break;
					}
					let o = Ce(T(e), D(T(E(a.filePath)), xe(a.filePath)));
					if (!o || !o.startsWith(".." + we) && o !== ".." && !Se(o)) throw Error("Choose an export location outside the active local data directory.");
					r.audit("capture.export", t.id, "INTENT", "purchases.bill");
					try {
						let e = i.command({
							repository: "captureSources",
							method: "read",
							args: [t.id]
						}).result;
						ce(a.filePath, ee(e));
					} catch (e) {
						throw r.audit("capture.export", t.id, "FAILED", "purchases.bill"), e;
					}
					r.audit("capture.export", t.id, "SUCCESS", "purchases.bill"), d = { saved: !0 };
					break;
				}
				case "attachments.select": {
					r.require("inventory.read"), i.command({
						repository: "attachments",
						method: "checkTarget",
						args: [t.target]
					});
					let e = await j.showOpenDialog(m, {
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
						d = { saved: !1 };
						break;
					}
					let n = te(e.filePaths[0]);
					d = {
						saved: !0,
						...i.command({
							repository: "attachments",
							method: "upload",
							args: [{
								...t,
								file: {
									name: xe(e.filePaths[0]),
									content: n.toString("base64")
								}
							}]
						})
					};
					break;
				}
				case "attachments.export": {
					r.require("inventory.read");
					let n = i.command({
						repository: "attachments",
						method: "read",
						args: [t]
					}).result, a = await j.showSaveDialog(m, {
						title: "Export attachment version",
						defaultPath: n.name
					});
					if (a.canceled || !a.filePath) {
						d = { saved: !1 };
						break;
					}
					let o = Ce(T(e), D(T(E(a.filePath)), xe(a.filePath)));
					if (!o || !o.startsWith(".." + we) && o !== ".." && !Se(o)) throw Error("Choose an export location outside the active local data directory.");
					r.audit("attachments.export", String(t.id) + "/" + String(t.versionId), "INTENT", "inventory.read");
					try {
						let e = i.command({
							repository: "attachments",
							method: "read",
							args: [t]
						}).result;
						ce(D(T(E(a.filePath)), xe(a.filePath)), ee(e));
					} catch (e) {
						throw r.audit("attachments.export", String(t.id) + "/" + String(t.versionId), "FAILED", "inventory.read"), e;
					}
					r.audit("attachments.export", String(t.id) + "/" + String(t.versionId), "SUCCESS", "inventory.read"), d = { saved: !0 };
					break;
				}
				case "business.recurring.scan":
					if (r.require("inventory.read"), Object.keys(t).length) throw Error("Recurring scan does not accept caller dates, actors or limits.");
					d = {
						result: i.scanRecurringDue(),
						view: i.view()
					};
					break;
				case "business.command":
					d = i.command(t);
					break;
				default: throw Error("Unknown desktop security action.");
			}
			n.returnValue = {
				ok: !0,
				value: d
			};
		} catch (e) {
			n.returnValue = {
				ok: !1,
				error: e instanceof Error ? e.message : "Desktop operation failed."
			};
		} finally {
			d = !1;
		}
	});
	let f = !1, p = setInterval(() => {
		if (!(d || f)) {
			d = !0;
			try {
				i.scanRecurringDue();
			} catch {
				f = !0, n();
			} finally {
				d = !1;
			}
		}
	}, 6e4);
	p.unref();
	let m = setInterval(() => {
		d || a?.tick();
	}, 1e4);
	m.unref();
	let h = setInterval(() => {
		d || s?.tick();
	}, 1e4);
	h.unref();
	let g = setInterval(() => {
		d || l?.tick();
	}, 1e4);
	return g.unref(), {
		dispose: () => {
			clearInterval(p), clearInterval(m), clearInterval(h), clearInterval(g);
		},
		lock: () => {
			try {
				r.principal() && r.logout();
			} catch {}
		}
	};
}
//#endregion
//#region electron/main/index.ts
var ln = Fe(import.meta.url), un = be.dirname(ln), dn = "HTT Flooring Management System", Z, Q = () => {}, $ = null;
function fn(...e) {
	return be.join(un, "..", ...e);
}
function pn() {
	if (process.platform !== "darwin") return;
	let e = fn("build", "icon.png"), t = Me.createFromPath(e);
	t.isEmpty() || A.dock?.setIcon(t);
}
function mn() {
	je.handle("statement:export-pdf", async (e, t) => {
		try {
			let n = ke.fromWebContents(e.sender);
			if (!n) return {
				success: !1,
				error: "Unable to resolve the current application window."
			};
			let r = hn(t.defaultFileName), i = await j.showSaveDialog(n, {
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
			return await Pe(i.filePath, a), {
				success: !0,
				filePath: i.filePath
			};
		} catch (e) {
			return Z?.event("pdf-export-failed"), {
				success: !1,
				error: e instanceof Error ? e.message : "Unable to export PDF."
			};
		}
	});
}
function hn(e) {
	let t = e.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").replace(/\s+/g, " ").trim() || "Customer Statement";
	return t.toLowerCase().endsWith(".pdf") ? t : `${t}.pdf`;
}
function gn() {
	let e = A.commandLine.hasSwitch("user-data-dir") && A.commandLine.getSwitchValue("acceptance-window") === "compact";
	$ = new ke({
		title: dn,
		width: e ? 1100 : 1440,
		height: e ? 700 : 900,
		minWidth: 1100,
		minHeight: 700,
		show: !1,
		backgroundColor: "#f4f1eb",
		webPreferences: {
			preload: be.join(un, "index.mjs"),
			contextIsolation: !0,
			nodeIntegration: !1,
			sandbox: !0
		}
	}), $.once("ready-to-show", () => {
		$?.show();
	}), process.env.VITE_DEV_SERVER_URL ? $.loadURL(process.env.VITE_DEV_SERVER_URL) : $.loadFile(be.join(un, "../dist/index.html")), $.webContents.on("did-start-navigation", (e, t, n, r) => {
		r && !n && Q();
	}), $.webContents.on("render-process-gone", () => {
		Q(), Z?.event("renderer-gone");
	}), $.on("unresponsive", () => {
		Q(), Z?.event("renderer-unresponsive");
	}), $.on("responsive", () => Z?.event("renderer-responsive")), $.webContents.on("did-fail-load", (e, t, n, r, i) => {
		i && t !== -3 && Z?.event("load-failed");
	}), $.webContents.setWindowOpenHandler(() => ({ action: "deny" })), $.webContents.on("will-navigate", (e, t) => {
		let n = new URL(t), r = new URL($.webContents.getURL());
		(n.protocol !== r.protocol || n.host !== r.host || n.pathname !== r.pathname) && e.preventDefault();
	}), $.on("closed", () => {
		Q(), $ = null;
	});
}
var _n = A.commandLine.getSwitchValue("user-data-dir");
_n && A.setPath("userData", be.resolve(_n)), A.requestSingleInstanceLock() ? (Z = new Le(A.getPath("userData"), A.getVersion()), process.on("uncaughtException", () => {
	Z?.event("main-exception"), Q(), A.exit(1);
}), process.on("unhandledRejection", () => {
	Z?.event("main-rejection"), Q(), A.exit(1);
}), A.on("will-quit", () => Z?.finish())) : A.quit(), A.on("second-instance", () => {
	$?.show(), $?.focus();
}), A.setName(dn), A.whenReady().then(() => {
	pn(), mn(), Q = cn(be.join(A.getPath("userData"), "local-security"), () => $, () => Z?.event("recurring-stopped")).lock, Ae.setApplicationMenu(Ae.buildFromTemplate([
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
					let e = Z?.status();
					(await j.showMessageBox({
						type: "info",
						title: "Local diagnostics",
						message: `HTT Flooring ${A.getVersion()}`,
						detail: `Local diagnostics: ${e?.available ? "available" : "unavailable"}\nSession alerts: ${e?.alerts.join(", ") || "none"}\n\nNo business records, passwords, error text or document contents are logged. No telemetry is sent. Business audit remains in Security settings.`,
						buttons: ["Close", "Open log folder"]
					})).response === 1 && Z && await Ne.openPath(Z.directory);
				}
			}]
		}
	])), gn(), Z?.event("ready"), A.on("activate", () => {
		ke.getAllWindows().length === 0 && gn();
	});
}).catch(() => {
	Z?.event("startup-failed"), j.showErrorBox("HTT Flooring could not start", "Restart the application. If the problem continues, inspect the local diagnostics folder in the application profile. Business files have not been reset."), A.exit(1);
}), A.on("window-all-closed", () => {
	process.platform !== "darwin" && A.quit();
});
//#endregion
export {};
