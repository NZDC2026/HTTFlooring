import { $t as snapshotRepositories, C as purchaseSourceRevision, Cn as businessDateKey, Dn as businessSettings, Ot as financialOperationJournal, Q as validatePreparedOutput, Qt as snapshotForPrincipal, Tn as requireDateKey, Xt as resolveCommand, Zt as restoreRepositories, _n as object, a as validateRepositories, bn as union, c as configureYearEndBackup, cn as hasPermission, d as attachmentBytes, dn as _enum, en as validateRegisteredSnapshots, f as readSelectedAttachment, fn as array, gn as number, hn as literal, i as sealDatabase, in as logoHtml, ln as roles, n as migrateWorkspaceSnapshot, o as configureDocumentPurgeBackup, pn as boolean, r as parseDatabase, t as migratePeriodSnapshot, u as atomicAttachmentExport, w as validatePurchaseOutput, xn as unknown, y as configureCaptureHelper, yn as string } from "./businessSnapshot-QmcaXKFD.js";
import { appendFileSync, closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, realpathSync, renameSync, statSync, writeFileSync } from "node:fs";
import path, { basename, dirname, isAbsolute, join, relative, sep } from "node:path";
import { createHash, createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { BrowserWindow, Menu, app, dialog, ipcMain, nativeImage, safeStorage, shell } from "electron";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
//#region electron/main/operationalLog.ts
var allowed = /* @__PURE__ */ new Set([
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
]);
var OperationalLog = class {
	directory;
	session = randomUUID();
	available = true;
	alerts = /* @__PURE__ */ new Set();
	version;
	maxBytes;
	constructor(root, version, maxBytes = 262144) {
		this.version = version;
		this.maxBytes = maxBytes;
		this.directory = join(root, "diagnostics");
		try {
			mkdirSync(this.directory, {
				recursive: true,
				mode: 448
			});
			const marker = join(this.directory, "session.json");
			if (existsSync(marker)) try {
				if (JSON.parse(readFileSync(marker, "utf8")).clean !== true) this.event("previous-unclean-exit");
			} catch {
				this.event("previous-unclean-exit");
			}
			writeFileSync(marker, JSON.stringify({
				session: this.session,
				clean: false
			}), { mode: 384 });
			this.event("start");
		} catch {
			this.available = false;
		}
	}
	event(event) {
		if (!allowed.has(event)) return;
		if ([
			"previous-unclean-exit",
			"renderer-gone",
			"renderer-unresponsive",
			"load-failed",
			"startup-failed",
			"main-exception",
			"main-rejection",
			"recurring-stopped",
			"pdf-export-failed"
		].includes(event)) this.alerts.add(event);
		if (event === "renderer-responsive") this.alerts.delete("renderer-unresponsive");
		if (!this.available) return;
		try {
			const file = join(this.directory, "operations.jsonl");
			if (existsSync(file) && statSync(file).size >= this.maxBytes) for (let i = 2; i >= 1; i--) {
				const from = i === 1 ? file : `${file}.${i - 1}`;
				if (existsSync(from)) renameSync(from, `${file}.${i}`);
			}
			appendFileSync(file, JSON.stringify({
				at: (/* @__PURE__ */ new Date()).toISOString(),
				session: this.session,
				version: /^[0-9]+\.[0-9]+\.[0-9]+(?:-[\w.-]+)?$/.test(this.version) ? this.version : "unknown",
				platform: process.platform,
				arch: process.arch,
				event
			}) + "\n", { mode: 384 });
		} catch {
			this.available = false;
		}
	}
	finish() {
		this.event("clean-exit");
		try {
			writeFileSync(join(this.directory, "session.json"), JSON.stringify({
				session: this.session,
				clean: true
			}), { mode: 384 });
		} catch {
			this.available = false;
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
//#region src/features/security/optionalWorkflows.ts
/** Product scope, compiled with the application. Original implementations and historical data remain available for a future reviewed release. */
var optionalWorkflows = Object.freeze({
	onlineCollection: false,
	electronicPayments: false,
	remittance: false,
	directBankSpend: false,
	bankTransfers: false,
	manualJournals: false
});
function assertApprovedDesktopCommand(input) {
	const { repository: r, method: m, args } = input, v = args[0];
	if (!optionalWorkflows.directBankSpend && (r === "recurringBank" || r === "recurringAutomation" && v?.kind === "BANK") || !optionalWorkflows.electronicPayments && ["bankInstructions", "paymentBatches"].includes(r) || !optionalWorkflows.bankTransfers && r === "bankTransactions" && m === "createTransfer" || !optionalWorkflows.directBankSpend && r === "bankTransactions" && m === "createTransaction" && v?.direction !== "MONEY_IN" || !optionalWorkflows.manualJournals && r === "journals" && m === "post" || !optionalWorkflows.remittance && r === "preparedPurchaseOutputs" && m === "prepare" && v?.kind === "REMITTANCE") throw Error("This workflow has been removed from the approved application scope. Historical records are preserved.");
}
Object.freeze({
	pageDirectory: false,
	customerDemo: false
});
//#endregion
//#region src/features/payroll-filing/contract.ts
var text$2 = string().max(500);
var id$3 = string().min(1).max(200);
var cents$1 = number().int().nonnegative().max(0x5af3107a4000);
var filingKinds = [
	"STP_PAY",
	"STP_UPDATE",
	"STP_FINALISE",
	"STP_UNFINALISE",
	"SUPER_CONTRIBUTION"
];
var filingCategories = [
	"GROSS",
	"PAID_LEAVE",
	"OVERTIME",
	"ALLOWANCE",
	"DEDUCTION",
	"PAYG",
	"SG",
	"RESC"
];
var profileSchema = object({
	employer: object({
		abn: text$2,
		branch: text$2,
		contactName: text$2,
		email: text$2,
		phone: text$2,
		historyFrom: text$2,
		historyConfirmed: boolean()
	}).strict(),
	employees: array(object({
		employeeId: id$3,
		payrollId: text$2,
		givenName: text$2,
		familyName: text$2,
		dateOfBirth: text$2,
		address: text$2,
		suburb: text$2,
		state: text$2,
		postcode: text$2,
		incomeType: literal("SAW"),
		employmentBasis: _enum([
			"F",
			"P",
			"C"
		]),
		taxTreatment: text$2,
		usi: text$2,
		fundAbn: text$2
	}).strict()).max(500),
	items: array(object({
		itemId: id$3,
		category: _enum(filingCategories),
		providerCode: text$2
	}).strict()).max(500)
}).strict();
var emptyFilingProfile = () => ({
	employer: {
		abn: "",
		branch: "",
		contactName: "",
		email: "",
		phone: "",
		historyFrom: "",
		historyConfirmed: false
	},
	employees: [],
	items: []
});
var connectorSettings = object({
	providerName: text$2,
	adapterId: id$3,
	documentationUrl: text$2,
	apiKey: string().max(2e3),
	tenantId: text$2,
	enabled: boolean(),
	production: boolean(),
	contractReference: text$2
}).strict();
var emptyConnectorSettings = () => ({
	providerName: "",
	adapterId: "UNCONFIGURED",
	documentationUrl: "",
	apiKey: "",
	tenantId: "",
	enabled: false,
	production: false,
	contractReference: ""
});
var amountsSchema = object(Object.fromEntries(filingCategories.map((k) => [k, cents$1]))).strict();
var reportSchema = object({
	id: id$3,
	kind: _enum(filingKinds),
	financialYear: string().regex(/^\d{4}-\d{4}$/),
	asOf: string().length(10),
	runId: id$3.optional(),
	predecessorId: id$3.optional(),
	sourceDigest: string().length(64),
	createdAt: number().finite(),
	createdBy: id$3,
	employer: profileSchema.shape.employer,
	employeeRows: array(object({
		employeeId: id$3,
		payrollId: id$3,
		givenName: text$2,
		familyName: text$2,
		dateOfBirth: text$2,
		address: text$2,
		suburb: text$2,
		state: text$2,
		postcode: text$2,
		incomeType: literal("SAW"),
		employmentBasis: _enum([
			"F",
			"P",
			"C"
		]),
		taxTreatment: text$2,
		tfn: text$2,
		fundName: text$2,
		memberId: text$2,
		usi: text$2,
		fundAbn: text$2,
		components: array(object({
			itemId: id$3,
			code: text$2,
			category: _enum(filingCategories),
			providerCode: text$2,
			ytdCents: cents$1,
			periodCents: cents$1
		}).strict()).max(500),
		ytd: amountsSchema,
		period: amountsSchema
	}).strict()).min(1).max(500),
	sourceEvidence: array(object({
		runId: id$3,
		journalId: id$3,
		sourceToken: id$3,
		payDate: text$2,
		slipsDigest: string().length(64)
	}).strict()).max(5e3),
	runIds: array(id$3).max(5e3),
	totalSuperCents: cents$1,
	notice: literal("INTERNAL_REVIEW_NOT_PROVIDER_OR_ATO_FORMAT")
}).strict();
var receiptSchema = object({
	requestId: id$3,
	providerId: id$3,
	reportId: id$3,
	sourceDigest: string().length(64),
	employerAbn: string(),
	status: _enum([
		"PROVIDER_RECEIVED",
		"PROCESSING",
		"ACCEPTED",
		"REJECTED",
		"PARTIAL",
		"FUND_RECEIVED"
	]),
	authorityReference: text$2.optional(),
	memberReceipts: array(object({
		payrollId: id$3,
		fundAbn: text$2,
		usi: text$2,
		memberId: text$2,
		amountCents: cents$1,
		reference: id$3,
		receivedAt: number().finite()
	}).strict()).max(500).optional()
}).strict();
var jobSchema$1 = object({
	id: id$3,
	reportId: id$3,
	ownerId: id$3,
	requestId: id$3,
	credentialRevision: string().length(64),
	status: _enum([
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
	providerId: id$3.optional(),
	authorityReference: text$2.optional(),
	receipts: array(object({
		at: number().finite(),
		evidence: receiptSchema
	}).strict()).max(500),
	receipt: receiptSchema.optional(),
	attempted: boolean(),
	nextAt: number().finite(),
	error: text$2.optional(),
	declaration: object({
		name: id$3,
		reason: string().min(10).max(2e3),
		at: number().finite(),
		actorId: id$3
	}).strict(),
	history: array(object({
		at: number().finite(),
		event: id$3
	}).strict()).max(500)
}).strict();
//#endregion
//#region electron/security/localSecurity.ts
function atomicJson(path, value) {
	mkdirSync(dirname(path), {
		recursive: true,
		mode: 448
	});
	const temporary = `${path}.${randomUUID()}.tmp`;
	const fd = openSync(temporary, "wx", 384);
	try {
		writeFileSync(fd, JSON.stringify(value));
		fsyncSync(fd);
	} finally {
		closeSync(fd);
	}
	renameSync(temporary, path);
	const directory = openSync(dirname(path), "r");
	try {
		fsyncSync(directory);
	} finally {
		closeSync(directory);
	}
}
var publicUser = ({ id, username, displayName, roles: userRoles, active }) => ({
	id,
	username,
	displayName,
	roles: [...userRoles],
	active
});
function username(value) {
	if (typeof value !== "string" || !/^[a-z0-9][a-z0-9._-]{2,63}$/.test(value.trim().toLowerCase())) throw new Error("Username must contain 3–64 letters, numbers, dots, underscores or hyphens.");
	return value.trim().toLowerCase();
}
function password(value) {
	if (typeof value !== "string" || value.length < 12 || value.length > 256) throw new Error("Password must contain 12–256 characters.");
	return value;
}
function roleList(value) {
	if (!Array.isArray(value) || !value.length || !value.every((role) => roles.includes(role))) throw new Error("Choose at least one valid role.");
	return [...new Set(value)];
}
var hashPassword = (value, salt) => scryptSync(value, salt, 64).toString("hex");
var LocalSecurity = class {
	state;
	session = null;
	poisoned = false;
	path;
	save;
	now;
	constructor(path, save = atomicJson, now = () => Date.now()) {
		this.path = path;
		this.save = save;
		this.now = now;
		if (existsSync(path)) {
			const value = JSON.parse(readFileSync(path, "utf8"));
			if (value?.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(value.auditKey) || !Array.isArray(value.users) || !Array.isArray(value.audit)) throw new Error("Invalid local security database; access blocked.");
			const ids = /* @__PURE__ */ new Set(), names = /* @__PURE__ */ new Set();
			for (const user of value.users) {
				if (!user.id || ids.has(user.id) || names.has(user.username) || username(user.username) !== user.username || typeof user.displayName !== "string" || typeof user.active !== "boolean" || !Number.isFinite(user.failures) || !Number.isFinite(user.lockedUntil) || !/^[a-f0-9]{32}$/.test(user.salt) || !/^[a-f0-9]{128}$/.test(user.passwordHash)) throw new Error("Invalid local user data; access blocked.");
				roleList(user.roles);
				ids.add(user.id);
				names.add(user.username);
			}
			if (value.users.length && !value.users.some((user) => user.active && user.roles.includes("ADMIN"))) throw new Error("No active administrator; access blocked.");
			let previousHash = "";
			for (const row of value.audit) {
				const { hash, ...event } = row;
				if (row.previousHash !== previousHash || hash !== createHmac("sha256", value.auditKey).update(JSON.stringify(event)).digest("hex")) throw new Error("Local audit integrity check failed; access blocked.");
				previousHash = hash;
			}
			this.state = value;
		} else this.state = {
			schemaVersion: 1,
			auditKey: randomBytes(32).toString("hex"),
			users: [],
			audit: []
		};
	}
	commit(next) {
		if (this.poisoned) throw new Error("Security storage is unavailable; restart and review required.");
		try {
			this.save(this.path, next);
			this.state = next;
		} catch (error) {
			this.poisoned = true;
			this.session = null;
			throw error;
		}
	}
	audit(action, resourceId, outcome, permission, commandId, actorId = this.principal()?.userId ?? "UNAUTHENTICATED") {
		const event = {
			id: randomUUID(),
			timestamp: new Date(this.now()).toISOString(),
			actorId,
			action,
			permission,
			resourceId,
			outcome,
			commandId,
			previousHash: this.state.audit.at(-1)?.hash ?? ""
		};
		const normalized = JSON.parse(JSON.stringify(event));
		const row = {
			...normalized,
			hash: createHmac("sha256", this.state.auditKey).update(JSON.stringify(normalized)).digest("hex")
		};
		this.commit({
			...this.state,
			audit: [...this.state.audit, row]
		});
	}
	principal() {
		if (this.poisoned || !this.session) return null;
		const now = this.now();
		const user = this.state.users.find((row) => row.id === this.session.userId);
		if (now >= this.session.idleUntil || now >= this.session.absoluteUntil || !user?.active) {
			this.session = null;
			return null;
		}
		return {
			userId: user.id,
			roles: [...user.roles],
			authenticated: true
		};
	}
	require(permission) {
		const actor = this.principal();
		if (!hasPermission(actor, permission)) {
			this.audit("permission.denied", permission, "DENIED", permission);
			throw new Error(`Permission denied: ${permission}`);
		}
		this.session.idleUntil = Math.min(this.now() + 18e5, this.session.absoluteUntil);
		return actor;
	}
	status() {
		const actor = this.principal();
		const user = actor && this.state.users.find((row) => row.id === actor.userId);
		const session = user ? {
			user: publicUser(user),
			expiresAt: new Date(Math.min(this.session.idleUntil, this.session.absoluteUntil)).toISOString()
		} : null;
		return {
			initialized: this.state.users.length > 0,
			session
		};
	}
	setup(input) {
		if (this.state.users.length) throw new Error("An administrator is already configured.");
		this.addUser(input, ["ADMIN"]);
		return this.login(input);
	}
	addUser(input, userRoles) {
		const name = username(input.username), secret = password(input.password);
		if (!input.displayName?.trim() || input.displayName.trim().length > 100) throw new Error("Display name is required (maximum 100 characters).");
		if (this.state.users.some((user) => user.username === name)) throw new Error("Username already exists.");
		const salt = randomBytes(16).toString("hex");
		const user = {
			id: randomUUID(),
			username: name,
			displayName: input.displayName.trim(),
			roles: roleList(userRoles),
			active: true,
			salt,
			passwordHash: hashPassword(secret, salt),
			failures: 0,
			lockedUntil: 0
		};
		this.commit({
			...this.state,
			users: [...this.state.users, user]
		});
		this.audit("user.created", user.id, "SUCCESS", "users.manage", void 0, this.principal()?.userId ?? user.id);
		return publicUser(user);
	}
	login(input) {
		this.session = null;
		const name = username(input.username);
		if (typeof input.password !== "string" || input.password.length > 256) throw new Error("Invalid username or password.");
		const user = this.state.users.find((row) => row.username === name);
		if (user && user.lockedUntil > this.now()) throw new Error("Too many login attempts; try again later.");
		const actual = Buffer.from(hashPassword(input.password, user?.salt ?? "unavailable-account"), "hex");
		const expected = user ? Buffer.from(user.passwordHash, "hex") : Buffer.alloc(64);
		if (!user?.active || !timingSafeEqual(actual, expected)) {
			if (user) this.commit({
				...this.state,
				users: this.state.users.map((row) => row.id === user.id ? {
					...row,
					failures: row.failures + 1,
					lockedUntil: row.failures + 1 >= 5 ? this.now() + 6e4 : 0
				} : row)
			});
			this.audit("session.login", name, "DENIED");
			throw new Error("Invalid username or password.");
		}
		this.commit({
			...this.state,
			users: this.state.users.map((row) => row.id === user.id ? {
				...row,
				failures: 0,
				lockedUntil: 0
			} : row)
		});
		this.audit("session.login", user.id, "SUCCESS", void 0, void 0, user.id);
		this.session = {
			userId: user.id,
			idleUntil: this.now() + 18e5,
			absoluteUntil: this.now() + 288e5
		};
		return this.status();
	}
	logout() {
		this.audit("session.logout", this.principal()?.userId ?? "", "SUCCESS");
		this.session = null;
		return this.status();
	}
	listUsers() {
		this.require("users.manage");
		return this.state.users.map(publicUser);
	}
	createUser(input) {
		this.require("users.manage");
		return this.addUser(input, input.roles);
	}
	updateUser(input) {
		const actor = this.require("users.manage");
		const userRoles = roleList(input.roles);
		if (typeof input.active !== "boolean" || !this.state.users.some((user) => user.id === input.id)) throw new Error("User was not found or active flag is invalid.");
		const users = this.state.users.map((user) => user.id === input.id ? {
			...user,
			roles: userRoles,
			active: input.active
		} : user);
		if (!users.some((user) => user.active && user.roles.includes("ADMIN"))) throw new Error("The last active administrator cannot be disabled or demoted.");
		this.audit("user.updated", input.id, "INTENT", "users.manage");
		this.commit({
			...this.state,
			users
		});
		this.audit("user.updated", input.id, "SUCCESS", "users.manage", void 0, actor.userId);
	}
	changePassword(input) {
		const actor = this.principal();
		if (!actor) throw new Error("Login required.");
		const user = this.state.users.find((row) => row.id === actor.userId);
		if (typeof input.currentPassword !== "string" || input.currentPassword.length > 256 || !timingSafeEqual(Buffer.from(hashPassword(input.currentPassword, user.salt), "hex"), Buffer.from(user.passwordHash, "hex"))) throw new Error("Current password is incorrect.");
		const nextPassword = password(input.password), salt = randomBytes(16).toString("hex");
		this.audit("user.password", user.id, "INTENT");
		this.commit({
			...this.state,
			users: this.state.users.map((row) => row.id === user.id ? {
				...row,
				salt,
				passwordHash: hashPassword(nextPassword, salt)
			} : row)
		});
		this.audit("user.password", user.id, "SUCCESS");
		this.session = null;
	}
	pendingBusinessCommands() {
		const completed = new Set(this.state.audit.filter((row) => row.commandId && (row.outcome === "SUCCESS" || row.outcome === "FAILED")).map((row) => row.commandId));
		return this.state.audit.filter((row) => row.commandId && row.outcome === "INTENT" && !completed.has(row.commandId)).map((row) => ({ ...row }));
	}
	listAudit(input = {}) {
		this.require("audit.read");
		const offset = Math.max(0, Math.trunc(input.offset ?? 0)), limit = Math.max(1, Math.min(100, Math.trunc(input.limit ?? 50)));
		if (!Number.isFinite(offset) || !Number.isFinite(limit)) throw new Error("Invalid audit pagination.");
		const query = String(input.query ?? "").toLowerCase().slice(0, 200);
		const rows = this.state.audit.filter((row) => !query || `${row.actorId} ${row.action} ${row.resourceId} ${row.outcome} ${row.commandId ?? ""}`.toLowerCase().includes(query));
		return {
			total: rows.length,
			rows: [...rows].reverse().slice(offset, offset + limit)
		};
	}
};
//#endregion
//#region electron/payroll-filing/store.ts
var filingDigest = (v) => createHash("sha256").update(JSON.stringify(v)).digest("hex");
var schema = object({
	version: literal(1),
	profile: profileSchema,
	profileRevision: number().int().nonnegative(),
	configuration: connectorSettings,
	profileHistory: array(object({
		at: number().finite(),
		actorId: string(),
		reason: string().min(10).max(2e3),
		digest: string().length(64)
	}).strict()).max(2e3),
	reports: array(reportSchema).max(1e3),
	jobs: array(jobSchema$1).max(1e3),
	manualReviews: array(object({
		id: string(),
		reportId: string(),
		actorId: string(),
		reference: string().min(1).max(200),
		notes: string().min(10).max(2e3),
		at: number().finite()
	}).strict()).max(2e3)
}).strict();
var FilingStore = class {
	path;
	codec;
	state;
	constructor(root, codec) {
		this.path = join(root, "payroll-filing-v1.json");
		this.codec = codec;
		if (existsSync(this.path)) try {
			if (!codec.available()) throw Error();
			const raw = readFileSync(this.path, "utf8");
			if (Buffer.byteLength(raw) > 75e6) throw Error();
			const e = JSON.parse(raw);
			if (e.version !== 1 || e.checksum !== filingDigest(e.cipher)) throw Error();
			this.state = this.validate(JSON.parse(codec.decrypt(Buffer.from(e.cipher, "base64"))));
		} catch {
			throw new Error("Payroll filing journal cannot be decrypted or verified. Preserve the full profile and OS credentials; do not reset it to submit again.");
		}
		else this.state = {
			version: 1,
			profile: emptyFilingProfile(),
			profileRevision: 0,
			configuration: emptyConnectorSettings(),
			profileHistory: [],
			reports: [],
			jobs: [],
			manualReviews: []
		};
	}
	validate(value) {
		const s = schema.parse(value);
		if (new Set(s.reports.map((r) => r.id)).size !== s.reports.length || new Set(s.jobs.map((j) => j.id)).size !== s.jobs.length || new Set(s.jobs.map((j) => j.requestId)).size !== s.jobs.length || s.jobs.some((j) => !s.reports.some((r) => r.id === j.reportId)) || s.reports.some((r) => r.predecessorId && !s.reports.some((p) => p.id === r.predecessorId)) || s.manualReviews.some((m) => !s.reports.some((r) => r.id === m.reportId))) throw Error("Filing journal references are invalid.");
		return s;
	}
	read() {
		return structuredClone(this.state);
	}
	change(fn) {
		if (!this.codec.available()) throw new Error("OS protected storage is required for filing identities and reports.");
		const next = this.read();
		fn(next);
		const state = this.validate(next), plain = JSON.stringify(state);
		if (Buffer.byteLength(plain) > 5e7) throw new Error("Payroll filing quota reached. Preserve the complete profile before archiving.");
		const cipher = this.codec.encrypt(plain).toString("base64");
		atomicJson(this.path, {
			version: 1,
			cipher,
			checksum: filingDigest(cipher)
		});
		this.state = state;
	}
};
//#endregion
//#region electron/payroll-filing/adapter.ts
var PayrollConnectors = class {
	entries;
	constructor(adapters = []) {
		if (new Set(adapters.map((a) => a.id)).size !== adapters.length) throw new Error("Duplicate payroll connectors.");
		this.entries = new Map(adapters.map((a) => [a.id, a]));
	}
	list() {
		return [...this.entries.values()].map((a) => ({
			id: a.id,
			name: a.name
		}));
	}
	require(id) {
		const a = this.entries.get(id);
		if (!a) throw new Error("A verified provider-specific payroll connector is not installed. Obtain the STP/SuperStream provider contract before enabling transmission.");
		return a;
	}
};
//#endregion
//#region electron/payroll-filing/report.ts
function validAbn(value) {
	if (!/^\d{11}$/.test(value)) return false;
	const w = [
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
	return [...value].reduce((n, c, i) => n + (Number(c) - (i === 0 ? 1 : 0)) * w[i], 0) % 89 === 0;
}
var zero = () => Object.fromEntries(filingCategories.map((k) => [k, 0]));
var cents = (n) => {
	if (!Number.isFinite(n) || n < 0 || Math.abs(n * 100 - Math.round(n * 100)) > 1e-5) throw new Error("Payroll source amounts must be non-negative whole cents.");
	return Math.round(n * 100);
};
function reportSource(payroll, profile, request) {
	if (!["STP_PAY", "SUPER_CONTRIBUTION"].includes(request.kind) && request.runId) throw new Error("YTD events do not select an individual pay run.");
	if (!["STP_UPDATE", "STP_UNFINALISE"].includes(request.kind) && request.predecessorId) throw new Error("Only corrections and unfinalisation select a predecessor.");
	const match = /^(\d{4})-(\d{4})$/.exec(request.financialYear);
	if (!match || Number(match[2]) !== Number(match[1]) + 1) throw new Error("Use a consecutive Australian financial year.");
	const start = match[1] + "-07-01", end = match[2] + "-06-30";
	requireDateKey(request.asOf);
	if (request.asOf < start || request.asOf > end) throw new Error("As-of date must fall in the selected financial year.");
	const runs = payroll.runs.filter((r) => r.payDate >= start && r.payDate <= request.asOf && ["Posted", "Reversed"].includes(r.status));
	const selected = payroll.runs.find((r) => r.id === request.runId);
	if ((request.kind === "STP_PAY" || request.kind === "SUPER_CONTRIBUTION") && (!selected || selected.status !== "Posted" || selected.payDate !== request.asOf || selected.payDate < start)) throw new Error("Select a currently posted run and its pay date.");
	return {
		start,
		end,
		runs,
		selected,
		digest: filingDigest([
			request.kind,
			request.financialYear,
			request.asOf,
			request.runId ?? null,
			runs,
			profile
		])
	};
}
function buildFilingReport(payroll, profile, request, actorId, now) {
	const source = reportSource(payroll, profile, request), issues = [];
	const check = (ok, message) => {
		if (!ok) issues.push(message);
	};
	check(validAbn(profile.employer.abn), "Employer ABN checksum/format requires review.");
	check(/^\d{3}$/.test(profile.employer.branch), "Employer branch must contain three digits.");
	check(profile.employer.contactName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.employer.email) && profile.employer.phone.trim(), "Employer declaration contact is incomplete.");
	try {
		requireDateKey(profile.employer.historyFrom);
	} catch {
		issues.push("History start must be a valid date.");
	}
	check(profile.employer.historyConfirmed && profile.employer.historyFrom <= source.start && /^\d{4}-\d{2}-\d{2}$/.test(profile.employer.historyFrom), "Confirm all financial-year payroll is present locally before preparing YTD. External opening YTD is not supported.");
	if (request.kind === "STP_FINALISE") check(request.asOf === source.end && source.end <= businessDateKey(new Date(now).toISOString()), "Finalisation requires the completed financial year end.");
	check(!payroll.runs.some((r) => ["Draft", "Approved"].includes(r.status) && r.payDate >= source.start && r.payDate <= request.asOf), "Resolve unposted payroll runs in the selected YTD range.");
	const relevant = request.kind === "SUPER_CONTRIBUTION" ? [source.selected] : source.runs;
	const participantIds = [...new Set(relevant.flatMap((r) => r.slips.map((s) => s.employee.id)))];
	check(participantIds.length > 0, "No payroll participants exist in this report range.");
	check(new Set(profile.employees.map((e) => e.employeeId)).size === profile.employees.length && new Set(profile.employees.map((e) => e.payrollId)).size === profile.employees.length, "Employee and payroll IDs must be unique.");
	check(new Set(profile.items.map((i) => i.itemId)).size === profile.items.length, "Each pay item requires one reviewed reporting category.");
	for (const run of relevant) {
		check(!run.employeeInputs.some((i) => i.complex?.termination || i.complex?.specialTax === "Reviewed exception" || i.complex?.awardRules.length), "Complex payroll requires provider-supported disaggregation and cannot use the standard local STP report.");
		for (const slip of run.slips) check(!(request.kind.startsWith("STP_") && slip.leaveIds.length), "Payroll with leave requires externally reviewed paid-leave disaggregation; this local preparation does not support it.");
		check(run.settings.currency === "AUD" && run.settings.region === "Australia", "Only Australian AUD payroll is supported.");
		if (run.settings.employerIdentifier) check(run.settings.employerIdentifier.replace(/\s/g, "") === profile.employer.abn, "Frozen employer ABN differs from the filing profile.");
	}
	const sums = (employeeId, runs) => {
		const result = zero();
		for (const run of runs.filter((r) => r.status === "Posted")) {
			const slip = run.slips.find((s) => s.employee.id === employeeId);
			if (!slip) continue;
			for (const line of slip.lines) {
				const mapping = profile.items.find((m) => m.itemId === line.item.id);
				if (!mapping) {
					issues.push("Pay item " + line.item.code + " requires a reporting category.");
					continue;
				}
				const allowed = line.item.category === "Tax" ? ["PAYG"] : line.item.category === "Employer contribution" ? ["SG", "RESC"] : line.item.category === "Deduction" ? ["DEDUCTION"] : line.item.category === "Allowance" ? ["ALLOWANCE"] : [
					"GROSS",
					"PAID_LEAVE",
					"OVERTIME"
				];
				check(allowed.includes(mapping.category), "Reporting category conflicts with pay item " + line.item.code + ".");
				if ([
					"PAID_LEAVE",
					"ALLOWANCE",
					"DEDUCTION"
				].includes(mapping.category)) check(mapping.providerCode.trim(), "A reviewed provider subtype is required for " + line.item.code + ".");
				result[mapping.category] += cents(line.amount);
			}
		}
		return result;
	};
	const employeeRows = participantIds.flatMap((employeeId) => {
		const extra = profile.employees.find((e) => e.employeeId === employeeId), slip = [...relevant].sort((a, b) => b.payDate.localeCompare(a.payDate)).flatMap((r) => r.slips).find((s) => s.employee.id === employeeId);
		if (!extra || !slip) {
			issues.push("Employee " + employeeId + " needs a supplemental filing identity.");
			return [];
		}
		check(extra.payrollId.trim() && extra.givenName.trim() && extra.familyName.trim(), "Employee payroll ID and legal names are required.");
		try {
			requireDateKey(extra.dateOfBirth);
			check(extra.dateOfBirth < request.asOf, "Date of birth must precede the pay date.");
		} catch {
			issues.push("Employee date of birth requires review.");
		}
		check(extra.address.trim() && extra.suburb.trim() && [
			"NSW",
			"VIC",
			"QLD",
			"SA",
			"WA",
			"TAS",
			"NT",
			"ACT"
		].includes(extra.state) && /^\d{4}$/.test(extra.postcode), "Employee Australian address is incomplete.");
		check(/^\d{8,9}$/.test(slip.employee.taxIdentifier), "Review TFN format or use an externally supported exemption workflow.");
		check(/^[A-Z0-9]{6}$/.test(extra.taxTreatment), "Review the six-character tax treatment with the selected provider.");
		const ytd = sums(employeeId, source.runs), period = sums(employeeId, source.selected ? [source.selected] : []);
		const lines = source.runs.filter((r) => r.status === "Posted").flatMap((r) => r.slips.filter((s) => s.employee.id === employeeId).flatMap((s) => s.lines));
		const components = [...new Set(lines.map((l) => l.item.id))].flatMap((itemId) => {
			const mapping = profile.items.find((m) => m.itemId === itemId);
			if (!mapping) return [];
			return [{
				itemId,
				code: lines.find((l) => l.item.id === itemId).item.code,
				category: mapping.category,
				providerCode: mapping.providerCode,
				ytdCents: lines.filter((l) => l.item.id === itemId).reduce((n, l) => n + cents(l.amount), 0),
				periodCents: (source.selected?.status === "Posted" ? source.selected.slips.filter((s) => s.employee.id === employeeId).flatMap((s) => s.lines) : []).filter((l) => l.item.id === itemId).reduce((n, l) => n + cents(l.amount), 0)
			}];
		});
		if (request.kind === "SUPER_CONTRIBUTION" && period.SG + period.RESC > 0) check(extra.usi.trim() && validAbn(extra.fundAbn) && slip.employee.superFund.trim() && slip.employee.superMemberId.trim(), "Review APRA fund ABN, USI, saved fund name and member ID. SMSF is not supported.");
		return [{
			employeeId,
			payrollId: extra.payrollId,
			givenName: extra.givenName,
			familyName: extra.familyName,
			dateOfBirth: extra.dateOfBirth,
			address: extra.address,
			suburb: extra.suburb,
			state: extra.state,
			postcode: extra.postcode,
			incomeType: extra.incomeType,
			employmentBasis: extra.employmentBasis,
			taxTreatment: extra.taxTreatment,
			tfn: slip.employee.taxIdentifier,
			fundName: slip.employee.superFund,
			memberId: slip.employee.superMemberId,
			usi: extra.usi,
			fundAbn: extra.fundAbn,
			components,
			ytd,
			period
		}];
	});
	const totalSuperCents = employeeRows.reduce((n, e) => n + e.period.SG + e.period.RESC, 0);
	if (request.kind === "SUPER_CONTRIBUTION") check(totalSuperCents > 0, "This run has no reviewed super contribution.");
	if (issues.length) return {
		issues: [...new Set(issues)],
		report: void 0
	};
	return {
		issues: [],
		report: reportSchema.parse({
			id: randomUUID(),
			...request,
			sourceDigest: source.digest,
			createdAt: now,
			createdBy: actorId,
			employer: profile.employer,
			employeeRows,
			runIds: relevant.map((r) => r.id),
			totalSuperCents,
			sourceEvidence: relevant.map((r) => ({
				runId: r.id,
				journalId: r.journalId ?? "",
				sourceToken: r.sourceToken,
				payDate: r.payDate,
				slipsDigest: filingDigest(r.slips)
			})),
			notice: "INTERNAL_REVIEW_NOT_PROVIDER_OR_ATO_FORMAT"
		})
	};
}
//#endregion
//#region electron/payroll-filing/filings.ts
var id$2 = string().min(1).max(200);
var requestSchema = object({
	kind: _enum(filingKinds),
	financialYear: string(),
	asOf: string(),
	runId: id$2.optional(),
	predecessorId: id$2.optional()
}).strict();
var terminal = /* @__PURE__ */ new Set([
	"ACCEPTED",
	"REJECTED",
	"FUND_RECEIVED",
	"CANCELLED"
]);
var PayrollFilings = class {
	store;
	security;
	business;
	connectors;
	now;
	running = false;
	blocked = "";
	constructor(store, security, business, connectors = new PayrollConnectors(), now = () => Date.now()) {
		this.store = store;
		this.security = security;
		this.business = business;
		this.connectors = connectors;
		this.now = now;
		if (store.read().jobs.some((j) => j.status === "SENDING")) store.change((s) => {
			for (const j of s.jobs) if (j.status === "SENDING") {
				j.status = "UNCERTAIN";
				j.error = "Interrupted transmission. Look up the original request; never resend automatically.";
				j.nextAt = this.now();
			}
		});
	}
	async providerCall(call) {
		const controller = new AbortController();
		let timer;
		try {
			return await Promise.race([call(controller.signal), new Promise((_, reject) => {
				timer = setTimeout(() => {
					controller.abort();
					reject(/* @__PURE__ */ new Error("Provider request timed out."));
				}, 3e4);
				timer.unref?.();
			})]);
		} finally {
			if (timer) clearTimeout(timer);
		}
	}
	passive() {
		const p = this.security.principal();
		if (!hasPermission(p, "payroll.read")) throw new Error("Permission denied: payroll.read");
		return p;
	}
	payroll() {
		this.passive();
		const p = this.business.view().repositories.payroll;
		if (!p) throw new Error("Payroll data is unavailable.");
		return p;
	}
	revision() {
		const c = this.store.read().configuration;
		return filingDigest([
			c.adapterId,
			c.apiKey,
			c.tenantId,
			c.production,
			c.contractReference
		]);
	}
	report(id) {
		const r = this.store.read().reports.find((r) => r.id === id);
		if (!r) throw new Error("Filing report not found.");
		return r;
	}
	stale(r) {
		try {
			return reportSource(this.payroll(), this.store.read().profile, r).digest !== r.sourceDigest;
		} catch {
			return true;
		}
	}
	update(jobId, patch, event) {
		this.store.change((s) => {
			const j = s.jobs.find((j) => j.id === jobId);
			if (!j) throw new Error("Filing job not found.");
			Object.assign(j, patch);
			j.history = [...j.history.slice(-499), {
				at: this.now(),
				event
			}];
		});
	}
	audit(action, resource, outcome, actorId) {
		this.security.audit("payrollFilings." + action, resource, outcome, "payroll.approve", void 0, actorId);
	}
	actionable(j) {
		const p = this.security.principal();
		return !!p && p.userId === j.ownerId && hasPermission(p, "payroll.approve") && hasPermission(p, "payroll.read");
	}
	evidenceCheck() {
		const payroll = this.payroll();
		for (const r of this.store.read().reports) {
			if (!this.store.read().jobs.some((j) => j.reportId === r.id && j.attempted)) continue;
			for (const evidence of r.sourceEvidence) {
				const run = payroll.runs.find((run) => run.id === evidence.runId);
				if (!run || run.journalId !== evidence.journalId || run.sourceToken !== evidence.sourceToken || run.payDate !== evidence.payDate || filingDigest(run.slips) !== evidence.slipsDigest) throw new Error("Payroll source evidence is missing or changed in this business backup. Restore compatible payroll evidence before processing external filings.");
			}
		}
	}
	view() {
		this.passive();
		const s = this.store.read(), p = this.payroll();
		let health = this.blocked || "Local preparation is available. No production provider connector is installed by default; nothing is lodged or paid.";
		try {
			this.evidenceCheck();
		} catch (error) {
			health = error instanceof Error ? error.message : "Filing evidence inspection failed.";
		}
		const { apiKey, ...configuration } = s.configuration;
		return {
			configuration: {
				...configuration,
				configured: !!apiKey,
				secureStorage: this.store.codec.available()
			},
			adapters: this.connectors.list(),
			profile: s.profile,
			profileRevision: s.profileRevision,
			runs: p.runs.map((r) => ({
				id: r.id,
				name: r.name,
				status: r.status,
				payDate: r.payDate
			})),
			employees: p.employees.map((e) => ({
				id: e.id,
				name: e.name,
				code: e.code
			})),
			items: p.items.map((i) => ({
				id: i.id,
				name: i.name,
				category: i.category
			})),
			reports: s.reports.map((r) => {
				const { employeeRows, employer: _e, ...summary } = r;
				return {
					...summary,
					employeeCount: employeeRows.length,
					stale: this.stale(r)
				};
			}),
			jobs: s.jobs.map((j) => {
				const { credentialRevision: _c, ...publicJob } = j;
				return publicJob;
			}),
			manualReviews: s.manualReviews,
			running: this.running,
			health
		};
	}
	configure(raw) {
		this.security.require("users.manage");
		this.passive();
		if (this.running) throw new Error("Wait for the running provider request.");
		const parsed = connectorSettings.safeParse(raw);
		if (!parsed.success) throw new Error("Invalid payroll connector settings.");
		const c = parsed.data;
		c.apiKey = c.apiKey || this.store.read().configuration.apiKey;
		if (c.enabled) {
			this.connectors.require(c.adapterId);
			if (!c.apiKey || !c.tenantId || c.contractReference.trim().length < 10 || !c.providerName.trim()) throw new Error("Verified provider contract, tenant and protected credentials are required.");
			if (!/^https:\/\//.test(c.documentationUrl)) throw new Error("Record the official HTTPS provider contract reference.");
		}
		this.security.audit("payrollFilings.configuration", "payroll-connector", "INTENT", "users.manage");
		this.store.change((s) => {
			s.configuration = c;
		});
		this.blocked = "";
		this.security.audit("payrollFilings.configuration", "payroll-connector", "SUCCESS", "users.manage");
		return this.view();
	}
	saveProfile(raw) {
		this.security.require("payroll.manage");
		this.passive();
		const input = object({
			profile: profileSchema,
			expectedRevision: number().int().nonnegative(),
			reason: string().min(10).max(2e3)
		}).strict().parse(raw);
		if (input.expectedRevision !== this.store.read().profileRevision) throw new Error("Filing profile changed. Reload before applying your identity review.");
		this.security.audit("payrollFilings.profile", "supplemental-filing-identities", "INTENT", "payroll.manage");
		this.store.change((s) => {
			s.profile = input.profile;
			s.profileRevision++;
			s.profileHistory.push({
				at: this.now(),
				actorId: this.passive().userId,
				reason: input.reason,
				digest: filingDigest(input.profile)
			});
		});
		this.security.audit("payrollFilings.profile", "supplemental-filing-identities", "SUCCESS", "payroll.manage");
		return this.view();
	}
	preflight(raw) {
		const request = requestSchema.parse(raw);
		this.passive();
		this.chain(request);
		if (request.asOf > businessDateKey(new Date(this.now()).toISOString())) throw new Error("Do not prepare a future filing cutoff.");
		const result = buildFilingReport(this.payroll(), this.store.read().profile, request, this.passive().userId, this.now());
		return {
			issues: result.issues,
			employeeCount: result.report?.employeeRows.length ?? 0,
			totalSuperCents: result.report?.totalSuperCents ?? 0,
			notice: "This preflight checks internal supported data only; it is not provider or ATO validation."
		};
	}
	chain(request) {
		if (!request.kind.startsWith("STP_")) return;
		const s = this.store.read();
		const latest = s.jobs.filter((j) => j.status === "ACCEPTED").map((j) => this.report(j.reportId)).filter((r) => r.kind.startsWith("STP_") && r.financialYear === request.financialYear && r.employer.abn === s.profile.employer.abn && r.employer.branch === s.profile.employer.branch).at(-1);
		if (latest && request.asOf < latest.asOf) throw new Error("Do not replace a later accepted YTD report with an earlier cutoff.");
		if (["STP_UPDATE", "STP_UNFINALISE"].includes(request.kind) && (!latest || request.predecessorId !== latest.id)) throw new Error("Select the latest accepted STP report as correction predecessor.");
		if (request.kind === "STP_UNFINALISE" && latest?.kind !== "STP_FINALISE") throw new Error("Only an accepted finalisation can be unfinalised.");
		if (latest?.kind === "STP_FINALISE" && request.kind !== "STP_UNFINALISE" && request.kind.startsWith("STP_")) throw new Error("Unfinalise the accepted finalisation before sending another STP event.");
	}
	prepare(raw) {
		this.security.require("payroll.manage");
		const request = requestSchema.parse(raw);
		this.chain(request);
		if (request.asOf > businessDateKey(new Date(this.now()).toISOString())) throw new Error("Do not prepare a future filing cutoff.");
		const result = buildFilingReport(this.payroll(), this.store.read().profile, request, this.passive().userId, this.now());
		if (!result.report) throw new Error(result.issues.join(" "));
		const r = result.report;
		this.security.audit("payrollFilings.prepare", r.id, "INTENT", "payroll.manage");
		this.store.change((s) => s.reports.push(r));
		this.security.audit("payrollFilings.prepare", r.id, "SUCCESS", "payroll.manage");
		return { id: r.id };
	}
	preview(raw) {
		const { reportId } = object({ reportId: id$2 }).strict().parse(raw);
		this.passive();
		return {
			report: this.report(reportId),
			stale: this.stale(this.report(reportId)),
			notice: "INTERNAL_REVIEW_NOT_PROVIDER_OR_ATO_FORMAT"
		};
	}
	declare(raw) {
		const input = object({
			reportId: id$2,
			name: string().trim().min(1).max(200),
			reason: string().trim().min(10).max(2e3),
			confirmed: literal(true)
		}).strict().parse(raw), p = this.security.require("payroll.approve");
		this.passive();
		this.evidenceCheck();
		const r = this.report(input.reportId), s = this.store.read(), c = s.configuration;
		this.chain(r);
		if (this.stale(r)) throw new Error("Payroll or identity data changed. Prepare a new report and declaration.");
		const adapter = this.connectors.require(c.adapterId);
		if (!c.enabled || !c.apiKey || !adapter) throw new Error("A verified provider connector is not enabled.");
		if (s.jobs.some((j) => j.reportId === r.id)) throw new Error("This immutable report already has a transmission job. Inspect its original request.");
		if (s.jobs.some((j) => !terminal.has(j.status) && this.report(j.reportId).financialYear === r.financialYear)) throw new Error("Resolve the earlier pending or uncertain report before sending another report for this financial year.");
		if (r.kind === "SUPER_CONTRIBUTION" && s.jobs.some((j) => {
			const old = this.report(j.reportId);
			return old.kind === "SUPER_CONTRIBUTION" && old.runId === r.runId && j.status !== "CANCELLED";
		})) throw new Error("This pay run already has a super contribution request. Do not submit it again.");
		if (r.kind.startsWith("STP_") && s.jobs.some((j) => !["REJECTED", "CANCELLED"].includes(j.status) && this.report(j.reportId).sourceDigest === r.sourceDigest)) throw new Error("An identical payroll source already has a transmission. Inspect its original request or prepare a linked correction.");
		const job = {
			id: randomUUID(),
			reportId: r.id,
			ownerId: p.userId,
			requestId: randomUUID(),
			credentialRevision: this.revision(),
			status: "QUEUED",
			receipts: [],
			attempted: false,
			nextAt: this.now(),
			declaration: {
				name: input.name,
				reason: input.reason,
				at: this.now(),
				actorId: p.userId
			},
			history: [{
				at: this.now(),
				event: "DECLARATION_CONFIRMED"
			}]
		};
		this.audit("declare", job.id, "INTENT");
		this.store.change((s) => s.jobs.push(job));
		this.audit("declare", job.id, "SUCCESS");
		return { id: job.id };
	}
	manualReview(raw) {
		const i = object({
			reportId: id$2,
			reference: string().trim().min(1).max(200),
			notes: string().trim().min(10).max(2e3)
		}).strict().parse(raw);
		const p = this.security.require("payroll.manage");
		this.passive();
		this.report(i.reportId);
		const key = randomUUID();
		this.security.audit("payrollFilings.portalReview", key, "INTENT", "payroll.manage");
		this.store.change((s) => s.manualReviews.push({
			id: key,
			...i,
			actorId: p.userId,
			at: this.now()
		}));
		this.security.audit("payrollFilings.portalReview", key, "SUCCESS", "payroll.manage");
		return this.view();
	}
	refresh(raw) {
		const { id: jobId } = object({ id: id$2 }).strict().parse(raw), j = this.store.read().jobs.find((j) => j.id === jobId);
		this.security.require("payroll.approve");
		if (!j || !this.actionable(j)) throw new Error("Only the authorized transmission owner may refresh.");
		if (j.status === "QUEUED") throw new Error("Queued work is processed automatically while the owner is signed in.");
		if (terminal.has(j.status)) throw new Error("This provider result is terminal. Prepare a linked correction if required.");
		this.update(j.id, { nextAt: this.now() }, "LOOKUP_REQUESTED");
		this.blocked = "";
		return this.view();
	}
	cancel(raw) {
		const { id: jobId } = object({ id: id$2 }).strict().parse(raw), j = this.store.read().jobs.find((j) => j.id === jobId);
		this.security.require("payroll.approve");
		if (!j || !this.actionable(j) || j.attempted || j.status !== "QUEUED") throw new Error("Only an unattempted queued transmission can be cancelled locally.");
		this.audit("cancel", j.id, "INTENT");
		this.update(j.id, { status: "CANCELLED" }, "CANCELLED_BEFORE_ATTEMPT");
		this.audit("cancel", j.id, "SUCCESS");
		return this.view();
	}
	accept(j, raw) {
		const e = receiptSchema.parse(raw), r = this.report(j.reportId);
		if (e.requestId !== j.requestId || e.reportId !== r.id || e.sourceDigest !== r.sourceDigest || e.employerAbn !== r.employer.abn || j.providerId && e.providerId !== j.providerId) throw new Error("Provider evidence does not match the frozen payroll request.");
		if (r.kind === "SUPER_CONTRIBUTION") {
			if (e.status === "ACCEPTED") throw new Error("Provider acceptance does not prove receipt by a super fund.");
			const expected = r.employeeRows.filter((row) => row.period.SG + row.period.RESC > 0), members = e.memberReceipts ?? [];
			if (new Set(members.map((m) => m.payrollId)).size !== members.length) throw new Error("Duplicate fund receipt members.");
			for (const m of members) {
				const employee = expected.find((row) => row.payrollId === m.payrollId);
				if (!employee || m.fundAbn !== employee.fundAbn || m.usi !== employee.usi || m.memberId !== employee.memberId || m.amountCents > employee.period.SG + employee.period.RESC || m.receivedAt <= 0 || m.receivedAt > this.now() + 6e4) throw new Error("Fund receipt amount, member or date does not match.");
			}
			if (e.status === "FUND_RECEIVED" && (members.length !== expected.length || members.some((m) => m.amountCents !== expected.find((row) => row.payrollId === m.payrollId).period.SG + expected.find((row) => row.payrollId === m.payrollId).period.RESC) || !e.authorityReference)) throw new Error("Complete matching member and fund receipt evidence is required.");
		} else if (e.status === "FUND_RECEIVED" || e.status === "PARTIAL" || e.status === "ACCEPTED" && !e.authorityReference) throw new Error("STP acceptance requires the matched authority reference.");
		if (j.receipt?.memberReceipts?.some((previous) => !e.memberReceipts?.some((current) => current.payrollId === previous.payrollId && current.amountCents >= previous.amountCents))) throw new Error("Fund receipt evidence cannot regress.");
		const prior = this.store.read().jobs.find((job) => job.id === j.id);
		const rank = {
			PROVIDER_RECEIVED: 1,
			PROCESSING: 2,
			PARTIAL: 3,
			FUND_RECEIVED: 4,
			ACCEPTED: 4,
			REJECTED: 4
		};
		if (prior.receipt && rank[e.status] < rank[prior.receipt.status]) throw new Error("Provider receipt status cannot regress.");
		const receipts = prior.receipts.at(-1) && filingDigest(prior.receipts.at(-1).evidence) === filingDigest(e) ? prior.receipts : [...prior.receipts, {
			at: this.now(),
			evidence: e
		}];
		this.update(j.id, {
			receipts,
			receipt: e,
			status: e.status,
			providerId: e.providerId,
			authorityReference: e.authorityReference,
			error: void 0,
			nextAt: this.now() + 9e5
		}, "PROVIDER_" + e.status);
		this.audit("receipt", j.id, "SUCCESS", j.ownerId);
	}
	async tick() {
		if (this.running || this.blocked || !hasPermission(this.security.principal(), "payroll.approve") || !hasPermission(this.security.principal(), "payroll.read")) return;
		this.running = true;
		try {
			const s = this.store.read(), c = s.configuration;
			if (!c.enabled) return;
			this.evidenceCheck();
			const adapter = this.connectors.require(c.adapterId), j = s.jobs.find((j) => this.actionable(j) && j.nextAt <= this.now() && !terminal.has(j.status));
			if (!j) return;
			if (j.credentialRevision !== this.revision()) {
				this.update(j.id, {
					error: "Provider identity or credentials changed. Reconcile under the original account.",
					nextAt: this.now() + 36e5
				}, "ACCOUNT_REVIEW");
				return;
			}
			const r = this.report(j.reportId);
			if (!j.attempted) {
				if (this.stale(r)) {
					this.update(j.id, {
						status: "CANCELLED",
						error: "Payroll changed before transmission. Prepare a new report."
					}, "STALE_SOURCE_BLOCKED");
					return;
				}
				this.chain(r);
				this.update(j.id, {
					status: "SENDING",
					attempted: true
				}, "TRANSMISSION_ATTEMPT");
				this.audit("submit", j.id, "INTENT");
				try {
					this.accept(j, await this.providerCall((signal) => adapter.submit(r, j.requestId, c, signal)));
				} catch {
					this.update(j.id, {
						status: "UNCERTAIN",
						error: "Provider outcome is uncertain. Look up the original request; automatic resubmission is disabled.",
						nextAt: this.now() + 6e4
					}, "PROVIDER_LOOKUP_REQUIRED");
					this.audit("submit", j.id, "FAILED", j.ownerId);
				}
				return;
			}
			try {
				const result = j.providerId ? await this.providerCall((signal) => adapter.poll(r, j.requestId, j.providerId, c, signal)) : await this.providerCall((signal) => adapter.lookup(r, j.requestId, c, signal));
				if (!result) {
					this.update(j.id, {
						status: "UNCERTAIN",
						error: "No confirmed provider outcome. Reconcile the original request; do not submit a replacement.",
						nextAt: this.now() + 9e5
					}, "NO_CONFIRMED_OUTCOME");
					return;
				}
				this.accept(j, result);
			} catch {
				this.update(j.id, {
					error: "Provider lookup or evidence validation failed. Original report and request ID retained.",
					nextAt: this.now() + 9e5
				}, "PROVIDER_REVIEW");
			}
		} catch (error) {
			this.blocked = error instanceof Error ? error.message : "Payroll filing worker stopped; preserve the profile.";
		} finally {
			this.running = false;
		}
	}
};
//#endregion
//#region src/features/bank-feeds/contract.ts
var feedId = string().regex(/^[A-Za-z0-9_-]{1,128}$/);
var text$1 = string().min(1).max(200);
var feedSettingsSchema = object({
	enabled: boolean(),
	apiKey: string().max(1e3),
	userId: union([feedId, literal("")]),
	production: boolean()
}).strict();
var feedAccountSchema = object({
	id: feedId,
	connectionId: feedId,
	institutionId: feedId,
	name: string().max(1e3),
	masked: string().max(30),
	currency: literal("AUD"),
	lastUpdated: string().max(100),
	expiresAt: number().finite()
}).strict();
var feedRowSchema = object({
	externalId: text$1,
	date: string().length(10),
	description: string().min(1).max(1e3),
	reference: string().max(500),
	amount: number().finite().refine((n) => n !== 0 && Math.abs(n) <= 999999999.99)
}).strict();
var feedTimeZones = [
	"Australia/Sydney",
	"Australia/Melbourne",
	"Australia/Brisbane",
	"Australia/Adelaide",
	"Australia/Darwin",
	"Australia/Perth",
	"Australia/Hobart"
];
var mappingSchema = object({
	id: text$1,
	ownerId: text$1,
	credentialRevision: string().length(64),
	providerUserId: feedId,
	production: boolean(),
	retired: boolean(),
	remote: feedAccountSchema,
	bankAccountId: text$1,
	bankIdentity: string().length(64),
	startDate: string().length(10),
	timeZone: _enum(feedTimeZones),
	enabled: boolean(),
	nextAt: number().finite(),
	lastSuccess: number().finite().optional(),
	lastThrough: string().optional(),
	error: string().max(500).optional(),
	failures: number().int().nonnegative(),
	pendingCount: number().int().nonnegative()
}).strict();
var batchSchema = object({
	id: text$1,
	mappingId: text$1,
	createdAt: number().finite(),
	throughDate: string().length(10),
	status: _enum([
		"REVIEW",
		"IMPORTING",
		"COMPLETED"
	]),
	rows: array(feedRowSchema).min(1).max(1e4),
	excludedIds: array(text$1).max(1e4),
	reason: string().max(2e3),
	evidence: array(object({
		externalId: text$1,
		lineId: text$1,
		digest: string().length(64)
	}).strict()).max(1e4),
	error: string().max(500).optional()
}).strict();
var feedStateSchema = object({
	version: literal(1),
	mappings: array(mappingSchema).max(100),
	accounts: array(feedAccountSchema).max(500),
	accountsRevision: string().max(64),
	batches: array(batchSchema).max(1e3),
	request: object({
		ownerId: text$1,
		kind: _enum(["DISCOVER", "AUTHORIZE"]),
		attempted: boolean()
	}).strict().optional(),
	history: array(object({
		at: number().finite(),
		action: string().max(100),
		resource: string().max(200)
	}).strict()).max(1e3)
}).strict();
//#endregion
//#region electron/bank-feeds/store.ts
var feedDigest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
function validateFeedState(state) {
	if (new Set(state.mappings.map((m) => m.id)).size !== state.mappings.length || new Set(state.batches.map((b) => b.id)).size !== state.batches.length) throw new Error("Duplicate feed journal identities.");
	for (const m of state.mappings) {
		requireDateKey(m.startDate);
		if (m.lastThrough) requireDateKey(m.lastThrough);
		if (m.retired && m.enabled) throw new Error("Retired mapping cannot be active.");
	}
	for (const b of state.batches) {
		requireDateKey(b.throughDate);
		const rows = new Map(b.rows.map((r) => [r.externalId, r]));
		if (!state.mappings.some((m) => m.id === b.mappingId) || rows.size !== b.rows.length || new Set(b.excludedIds).size !== b.excludedIds.length || new Set(b.evidence.map((e) => e.externalId)).size !== b.evidence.length || b.excludedIds.some((e) => !rows.has(e))) throw new Error("Invalid feed batch identities.");
		for (const r of b.rows) requireDateKey(r.date);
		for (const e of b.evidence) {
			const r = rows.get(e.externalId);
			if (!r || b.excludedIds.includes(e.externalId) || e.digest !== feedDigest([
				r.date,
				r.amount,
				r.description,
				r.reference
			])) throw new Error("Invalid feed import proof.");
		}
		if (b.status === "COMPLETED" && b.evidence.length !== b.rows.length - b.excludedIds.length) throw new Error("Incomplete feed import proof.");
	}
}
var FeedStore = class {
	path;
	state;
	constructor(directory) {
		this.path = join(directory, "bank-feed-journal-v1.json");
		if (existsSync(this.path)) try {
			const raw = readFileSync(this.path, "utf8");
			if (Buffer.byteLength(raw) > 55e6) throw Error();
			const { checksum, ...data } = JSON.parse(raw);
			if (checksum !== feedDigest(data)) throw Error();
			this.state = feedStateSchema.parse(data);
			validateFeedState(this.state);
		} catch {
			throw new Error("Bank feed journal is invalid. Preserve the full desktop profile; do not reset it to import again.");
		}
		else {
			this.state = {
				version: 1,
				mappings: [],
				accounts: [],
				accountsRevision: "",
				batches: [],
				history: []
			};
			this.save(this.state);
		}
	}
	read() {
		return structuredClone(this.state);
	}
	save(value) {
		const state = feedStateSchema.parse(value);
		validateFeedState(state);
		if (Buffer.byteLength(JSON.stringify(state)) > 5e7) throw new Error("Bank feed journal quota reached. Preserve the full profile before archiving.");
		atomicJson(this.path, {
			...state,
			checksum: feedDigest(state)
		});
		this.state = structuredClone(state);
	}
	change(fn) {
		const state = this.read();
		fn(state);
		this.save(state);
	}
};
var FeedVault = class {
	path;
	codec;
	constructor(directory, codec) {
		this.path = join(directory, "bank-feed-secrets-v1.json");
		this.codec = codec;
	}
	get() {
		if (!existsSync(this.path)) return {
			enabled: false,
			apiKey: "",
			userId: "",
			production: false
		};
		if (!this.codec.available()) throw new Error("OS protected credential storage is unavailable.");
		try {
			const raw = JSON.parse(readFileSync(this.path, "utf8"));
			if (raw.version !== 1 || typeof raw.cipher !== "string") throw Error();
			return feedSettingsSchema.parse(JSON.parse(this.codec.decrypt(Buffer.from(raw.cipher, "base64"))));
		} catch {
			throw new Error("Bank feed credentials cannot be decrypted. Reconfigure locally; preserve the feed journal.");
		}
	}
	set(raw) {
		if (!this.codec.available()) throw new Error("OS protected credential storage is unavailable.");
		const result = feedSettingsSchema.safeParse(raw);
		if (!result.success) throw new Error("Invalid bank feed settings.");
		const next = result.data;
		let old;
		try {
			old = this.get();
		} catch {
			if (next.enabled && !next.apiKey) throw new Error("Enter a fresh key to replace unreadable bank feed credentials.");
		}
		next.apiKey = next.apiKey || old?.apiKey || "";
		if (next.apiKey && /\s/.test(next.apiKey)) throw new Error("Use the Basiq API key exactly as issued, without spaces.");
		if (next.enabled && (!next.apiKey || !next.userId)) throw new Error("Configure a Basiq API key and provisioned user ID before enabling.");
		atomicJson(this.path, {
			version: 1,
			cipher: this.codec.encrypt(JSON.stringify(next)).toString("base64")
		});
	}
	revision() {
		const c = this.get();
		return feedDigest([
			c.apiKey,
			c.userId,
			c.production
		]);
	}
};
//#endregion
//#region electron/bank-feeds/basiq.ts
var FeedFault = class extends Error {
	code;
	constructor(code) {
		super(code);
		this.code = code;
	}
};
var feedTransport = async (url, init) => {
	let response;
	try {
		response = await fetch(url, {
			...init,
			redirect: "error",
			signal: AbortSignal.timeout(2e4)
		});
	} catch {
		throw new FeedFault("NETWORK_UNAVAILABLE");
	}
	if (!response.ok) {
		await response.body?.cancel();
		throw new FeedFault("BASIQ_HTTP_" + response.status);
	}
	try {
		const reader = response.body?.getReader();
		if (!reader) throw Error();
		const parts = [];
		let bytes = 0;
		while (true) {
			const part = await reader.read();
			if (part.done) break;
			bytes += part.value.byteLength;
			if (bytes > 5e6) {
				await reader.cancel();
				throw Error();
			}
			parts.push(part.value);
		}
		return JSON.parse(Buffer.concat(parts).toString("utf8"));
	} catch {
		throw new FeedFault("BASIQ_RESPONSE_INVALID");
	}
};
var origin = "https://au-api.basiq.io";
var account = object({
	type: literal("account"),
	id: feedId,
	name: string().max(1e3),
	displayName: string().max(1e3).optional(),
	maskedNumber: string().max(200).optional(),
	accountNo: string().max(200).optional(),
	currency: string(),
	status: _enum(["available", "unavailable"]),
	connection: feedId,
	institution: feedId,
	lastUpdated: string().max(100)
});
var page = object({
	type: literal("list"),
	data: array(unknown()).max(500),
	links: object({ next: string().nullable().optional() }).optional()
});
function parsed(schema, value) {
	const result = schema.safeParse(value);
	if (!result.success) throw new FeedFault("BASIQ_RESPONSE_INVALID");
	return result.data;
}
function hostedConsentUrl(raw) {
	const url = new URL(raw);
	if (url.protocol !== "https:" || url.hostname !== "connect.basiq.io" || url.port || url.username || url.password || url.hash || !/^\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)) throw new FeedFault("CONSENT_URL_UNTRUSTED");
	return url.href;
}
function feedExternalId(userId, accountId, transactionId, production = false) {
	return "basiq:" + createHash("sha256").update(JSON.stringify([
		userId,
		accountId,
		production
	])).digest("hex").slice(0, 32) + ":" + transactionId;
}
function normalizeTransaction(raw, settings, selected, timeZone = "Australia/Sydney") {
	const basic = parsed(object({
		type: literal("transaction"),
		id: feedId,
		account: feedId,
		status: _enum(["pending", "posted"])
	}), raw);
	if (basic.account !== selected.id) throw new FeedFault("TRANSACTION_ACCOUNT_MISMATCH");
	if (basic.status === "pending") return null;
	const row = parsed(object({
		id: feedId,
		account: feedId,
		status: literal("posted"),
		currency: literal("AUD"),
		description: string().trim().min(1).max(1e3),
		reference: string().max(500).nullable().optional(),
		amount: string().regex(/^-?\d{1,9}(?:\.\d{1,2})?$/),
		direction: _enum(["debit", "credit"]),
		postDate: string().regex(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/)
	}), raw);
	const date = row.postDate.length === 10 ? row.postDate : new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(new Date(row.postDate));
	requireDateKey(date, "Provider posting date");
	if (row.postDate.length > 10 && !Number.isFinite(Date.parse(row.postDate))) throw new FeedFault("TRANSACTION_DATE_INVALID");
	const negative = row.amount.startsWith("-"), [whole, fraction = ""] = row.amount.replace("-", "").split(".");
	const cents = Number(BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0")));
	if (!Number.isSafeInteger(cents) || cents === 0 || row.direction === "debit" !== negative) throw new FeedFault("TRANSACTION_AMOUNT_OR_DIRECTION_INVALID");
	return {
		externalId: feedExternalId(settings.userId, selected.id, row.id, settings.production),
		date,
		description: row.description,
		reference: row.reference ?? "",
		amount: (negative ? -cents : cents) / 100
	};
}
var BasiqProvider = class {
	transport;
	token;
	constructor(transport = feedTransport) {
		this.transport = transport;
	}
	revision(c) {
		return createHash("sha256").update(JSON.stringify([
			c.apiKey,
			c.userId,
			c.production
		])).digest("hex");
	}
	async access(c, now) {
		const revision = this.revision(c);
		if (this.token?.revision === revision && this.token.until > now) return this.token.value;
		const token = parsed(object({
			access_token: string().min(1).max(2e4),
			token_type: literal("Bearer"),
			expires_in: number().int().min(60).max(86400)
		}), await this.transport(origin + "/token", {
			method: "POST",
			headers: {
				Authorization: "Basic " + c.apiKey,
				"basiq-version": "3.0",
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: "scope=SERVER_ACCESS"
		}));
		this.token = {
			revision,
			value: token.access_token,
			until: now + Math.min(token.expires_in - 60, 1800) * 1e3
		};
		return token.access_token;
	}
	async request(path, c, now, method = "GET", body) {
		const token = await this.access(c, now);
		try {
			return await this.transport(origin + path, {
				method,
				headers: {
					Authorization: "Bearer " + token,
					"basiq-version": "3.0",
					...body ? { "Content-Type": "application/json" } : {}
				},
				...body ? { body } : {}
			});
		} catch (error) {
			if (error instanceof FeedFault && ["BASIQ_HTTP_401", "BASIQ_HTTP_403"].includes(error.code)) this.token = void 0;
			throw error;
		}
	}
	root(c) {
		return "/users/" + feedId.parse(c.userId);
	}
	async list(path, c, now) {
		const seen = /* @__PURE__ */ new Set(), rows = [];
		let next = path;
		while (next) {
			if (seen.has(next) || seen.size >= 20) throw new FeedFault("PAGINATION_LOOP_OR_LIMIT");
			seen.add(next);
			const response = parsed(page, await this.request(next, c, now));
			rows.push(...response.data);
			const link = response.links?.next;
			if (!link) {
				next = void 0;
				continue;
			}
			const url = new URL(link, origin);
			if (url.origin !== origin || url.username || url.password || url.hash || url.pathname !== path.split("?")[0] || url.searchParams.get("filter") !== new URL(origin + path).searchParams.get("filter")) throw new FeedFault("PAGINATION_LINK_UNTRUSTED");
			next = url.pathname + url.search;
		}
		return rows;
	}
	async consent(c, now) {
		if (!(await this.list(this.root(c) + "/consents", c, now)).map((row) => parsed(object({
			type: literal("consent"),
			status: _enum([
				"active",
				"revoked",
				"expired"
			]),
			expiryDate: string(),
			data: object({ permissions: array(object({
				scope: string(),
				consented: boolean().optional()
			})) })
		}), row)).some((row) => row.status === "active" && Date.parse(row.expiryDate) > now && row.data.permissions.some((p) => p.scope === "transaction.detail" && p.consented === true))) throw new FeedFault("CONSENT_EXPIRED_REVOKED_OR_MISSING");
	}
	async validateAccount(c, id, now) {
		const a = parsed(account, await this.request(this.root(c) + "/accounts/" + feedId.parse(id), c, now));
		if (a.id !== id || a.currency !== "AUD" || a.status !== "available") throw new FeedFault("ACCOUNT_UNAVAILABLE_OR_CURRENCY");
		const connection = parsed(object({
			type: literal("connection"),
			id: feedId,
			method: literal("open-banking"),
			status: literal("active"),
			expiryDate: string(),
			accounts: object({ data: array(object({ id: feedId })) })
		}), await this.request(this.root(c) + "/connections/" + a.connection, c, now));
		const expiresAt = Date.parse(connection.expiryDate);
		if (connection.id !== a.connection || !(expiresAt > now) || !connection.accounts.data.some((row) => row.id === id)) throw new FeedFault("CONNECTION_EXPIRED_OR_ACCOUNT_MISMATCH");
		const number = a.maskedNumber ?? a.accountNo ?? "";
		return feedAccountSchema.parse({
			id: a.id,
			connectionId: a.connection,
			institutionId: a.institution,
			name: a.displayName || a.name,
			masked: number ? "•••• " + number.slice(-4) : "Not supplied",
			currency: "AUD",
			lastUpdated: a.lastUpdated,
			expiresAt
		});
	}
	async discover(c, now) {
		await this.consent(c, now);
		const rows = await this.list(this.root(c) + "/accounts", c, now), result = [];
		for (const raw of rows) {
			const a = parsed(account, raw);
			if (a.currency !== "AUD" || a.status !== "available") continue;
			result.push(await this.validateAccount(c, a.id, now));
		}
		if (new Set(result.map((a) => a.id)).size !== result.length) throw new FeedFault("DUPLICATE_PROVIDER_ACCOUNT");
		return result;
	}
	async transactions(c, selected, from, through, now, timeZone = "Australia/Sydney") {
		requireDateKey(from);
		requireDateKey(through);
		await this.consent(c, now);
		const current = await this.validateAccount(c, selected.id, now);
		if (current.connectionId !== selected.connectionId || current.institutionId !== selected.institutionId) throw new FeedFault("CONNECTION_CHANGED_REMAP_REQUIRED");
		const lower = (/* @__PURE__ */ new Date(Date.parse(from + "T00:00:00Z") - 864e5)).toISOString().slice(0, 10), upper = new Date(Date.parse(through + "T00:00:00Z") + 864e5).toISOString().slice(0, 10);
		const filter = `account.id.eq('${selected.id}'),transaction.postDate.gteq('${lower}'),transaction.postDate.lteq('${upper}T23:59:59.999Z')`;
		const raws = await this.list(this.root(c) + "/transactions?limit=500&filter=" + encodeURIComponent(filter), c, now), rows = [];
		let pending = 0;
		for (const raw of raws) {
			const row = normalizeTransaction(raw, c, selected, timeZone);
			if (!row) {
				pending++;
				continue;
			}
			if (row.date < from || row.date > through) continue;
			const prior = rows.find((r) => r.externalId === row.externalId);
			if (prior && JSON.stringify(prior) !== JSON.stringify(row)) throw new FeedFault("DUPLICATE_TRANSACTION_CONFLICT");
			if (!prior) rows.push(row);
		}
		return {
			rows,
			pending,
			account: current
		};
	}
	async authorization(c, now, allowCreate) {
		let raw;
		try {
			raw = await this.request(this.root(c) + "/auth_link", c, now);
		} catch (error) {
			if (!(error instanceof FeedFault) || !["BASIQ_HTTP_404", "BASIQ_HTTP_410"].includes(error.code)) throw error;
			if (!allowCreate) throw new FeedFault("AUTH_LINK_RETRY_REQUIRES_CONFIRMATION");
		}
		if (raw) {
			const current = parsed(object({ expiresAt: string() }), raw);
			if (!(Date.parse(current.expiresAt) > now)) raw = void 0;
		}
		if (!raw) {
			if (!allowCreate) throw new FeedFault("AUTH_LINK_RETRY_REQUIRES_CONFIRMATION");
			raw = await this.request(this.root(c) + "/auth_link", c, now, "POST", "{}");
		}
		const link = parsed(object({
			type: literal("auth_link"),
			userId: feedId,
			expiresAt: string(),
			links: object({ public: string() })
		}), raw);
		if (link.userId !== c.userId || !(Date.parse(link.expiresAt) > now)) throw new FeedFault("AUTH_LINK_EVIDENCE_INVALID");
		return {
			url: hostedConsentUrl(link.links.public),
			until: Date.parse(link.expiresAt)
		};
	}
};
//#endregion
//#region electron/bank-feeds/bankFeeds.ts
var id$1 = string().min(1).max(200);
var fingerprint = (row) => feedDigest([
	row.date,
	row.amount,
	row.description,
	row.reference
]);
var BankFeeds = class {
	store;
	vault;
	security;
	business;
	provider;
	now;
	running = false;
	blocked = "";
	link;
	constructor(store, vault, security, business, provider = new BasiqProvider(), now = () => Date.now()) {
		this.store = store;
		this.vault = vault;
		this.security = security;
		this.business = business;
		this.provider = provider;
		this.now = now;
		if (store.read().batches.some((b) => b.status === "IMPORTING")) store.change((s) => {
			for (const b of s.batches) if (b.status === "IMPORTING") {
				b.status = "REVIEW";
				b.error = "Interrupted import. Inspect existing statement rows, then confirm the original batch; stable external IDs prevent duplicate imports.";
			}
		});
	}
	passive(write = false) {
		const p = this.security.principal();
		if (!hasPermission(p, write ? "banking.write" : "banking.read")) throw new Error("Permission denied: bank feeds.");
		return p;
	}
	snapshots() {
		return this.business.view().repositories;
	}
	lines() {
		return this.snapshots().bankStatements?.lines ?? [];
	}
	bank(id) {
		const bank = this.snapshots().bankAccounts?.bankAccounts.find((b) => b.id === id);
		if (!bank || !bank.active || bank.currency !== "AUD") throw new Error("Choose an active AUD local bank account.");
		return bank;
	}
	identity(b) {
		return feedDigest([
			b.id,
			b.accountNumber,
			b.glAccountId,
			b.currency,
			b.openingBalance,
			b.openingBalanceDate
		]);
	}
	today() {
		return businessDateKey(new Date(this.now()).toISOString());
	}
	history(action, resource) {
		this.store.change((s) => {
			s.history = [...s.history.slice(-999), {
				at: this.now(),
				action,
				resource
			}];
		});
	}
	audit(action, resource, outcome) {
		this.security.audit("bankFeeds." + action, resource, outcome, "banking.write");
	}
	owned(mapping) {
		const p = this.passive(true);
		if (mapping.ownerId !== p.userId) throw new Error("Only the mapping owner may process this bank feed.");
		return p;
	}
	mapping(id) {
		const m = this.store.read().mappings.find((m) => m.id === id);
		if (!m) throw new Error("Bank feed mapping not found.");
		return m;
	}
	verifyMapping(m) {
		const b = this.bank(m.bankAccountId);
		if (this.identity(b) !== m.bankIdentity) throw new Error("Local bank identity changed. Review this mapping before importing.");
		if (m.credentialRevision !== this.vault.revision()) throw new Error("Provider account or credentials changed. Reconcile the original mapping before enabling it.");
	}
	restoreCheck() {
		const p = this.security.principal(), state = this.store.read(), lines = this.lines();
		for (const b of state.batches.filter((b) => b.status === "COMPLETED")) {
			const m = state.mappings.find((m) => m.id === b.mappingId);
			if (m.ownerId !== p?.userId || !hasPermission(p, "banking.write")) continue;
			for (const e of b.evidence) {
				const l = lines.find((l) => l.id === e.lineId && l.bankAccountId === m.bankAccountId && l.externalId === e.externalId);
				if (!l || fingerprint(l) !== e.digest) throw new Error("Imported bank feed evidence is missing or changed in this business backup. Restore compatible statement evidence before continuing; do not reset the feed journal.");
			}
		}
	}
	possibleDuplicates(batch) {
		const m = this.mapping(batch.mappingId), lines = this.lines();
		return batch.rows.filter((r) => lines.some((l) => l.bankAccountId === m.bankAccountId && l.externalId !== r.externalId && l.date === r.date && l.amount === r.amount && (l.description.trim().toLowerCase() === r.description.trim().toLowerCase() || !!r.reference && l.reference === r.reference))).map((r) => r.externalId);
	}
	view() {
		this.passive();
		const state = this.store.read();
		let health = this.blocked || "Ready. Bank feeds remain inactive until configured and explicitly enabled.";
		let c = {
			enabled: false,
			apiKey: "",
			userId: "",
			production: false
		};
		try {
			c = this.vault.get();
			this.restoreCheck();
		} catch (error) {
			health = error instanceof Error ? error.message : "Bank feed inspection failed.";
		}
		const p = this.security.principal();
		return {
			configuration: {
				enabled: c.enabled,
				configured: !!c.apiKey && !!c.userId,
				userId: c.userId,
				production: c.production,
				secureStorage: this.vault.codec.available()
			},
			accounts: state.accountsRevision === feedDigest([
				c.apiKey,
				c.userId,
				c.production
			]) ? state.accounts : [],
			mappings: state.mappings,
			batches: state.batches.map((b) => ({
				...b,
				possibleDuplicates: b.status === "COMPLETED" ? [] : this.possibleDuplicates(b)
			})),
			banks: (this.snapshots().bankAccounts?.bankAccounts ?? []).filter((b) => b.active).map((b) => ({
				id: b.id,
				name: b.name,
				currency: b.currency,
				openingBalanceDate: b.openingBalanceDate
			})),
			running: this.running,
			health,
			authorizationReady: !!this.link && this.link.until > this.now() && this.link.ownerId === p?.userId && this.link.revision === feedDigest([
				c.apiKey,
				c.userId,
				c.production
			]),
			request: state.request?.kind
		};
	}
	configure(raw) {
		this.security.require("users.manage");
		if (this.running) throw new Error("Wait for the running bank feed request.");
		this.security.audit("bankFeeds.configuration", "bank-feed-vault", "INTENT", "users.manage");
		this.vault.set(raw);
		this.link = void 0;
		this.blocked = "";
		this.security.audit("bankFeeds.configuration", "bank-feed-vault", "SUCCESS", "users.manage");
		return this.view();
	}
	request(raw) {
		const i = object({
			kind: _enum(["DISCOVER", "AUTHORIZE"]),
			confirmed: literal(true)
		}).strict().parse(raw), p = this.security.require("banking.write"), c = this.vault.get();
		if (!c.enabled || !c.apiKey || !c.userId) throw new Error("Configure and enable Basiq first.");
		if (this.running || this.store.read().request) throw new Error("A bank feed request is already pending.");
		this.blocked = "";
		this.audit("request." + i.kind, "provider-user", "INTENT");
		this.store.change((s) => {
			s.request = {
				ownerId: p.userId,
				kind: i.kind,
				attempted: false
			};
		});
		this.audit("request." + i.kind, "provider-user", "SUCCESS");
		return this.view();
	}
	authorizationUrl() {
		const p = this.passive(true);
		if (!this.link || this.link.until <= this.now() || this.link.ownerId !== p.userId || this.link.revision !== this.vault.revision()) throw new Error("Request a valid provider authorization link first.");
		return hostedConsentUrl(this.link.url);
	}
	map(raw) {
		const i = object({
			remoteId: id$1,
			bankAccountId: id$1,
			startDate: string(),
			timeZone: _enum(feedTimeZones),
			confirmed: literal(true)
		}).strict().parse(raw), p = this.security.require("banking.write"), state = this.store.read(), c = this.vault.get();
		if (!c.enabled || state.accountsRevision !== this.vault.revision()) throw new Error("Discover authorized provider accounts with the current configuration first.");
		const remote = state.accounts.find((a) => a.id === i.remoteId), bank = this.bank(i.bankAccountId);
		requireDateKey(i.startDate);
		if (!remote || remote.expiresAt <= this.now()) throw new Error("Discover a currently authorized AUD account.");
		if (i.startDate < bank.openingBalanceDate || i.startDate > this.today()) throw new Error("Start date must be between the bank opening date and today.");
		if (state.mappings.some((m) => !m.retired && (m.remote.id === remote.id && m.providerUserId === c.userId && m.production === c.production || m.bankAccountId === bank.id))) throw new Error("This provider account or local bank already has a mapping. Preserve its history and review it instead.");
		const m = {
			id: randomUUID(),
			ownerId: p.userId,
			credentialRevision: this.vault.revision(),
			providerUserId: c.userId,
			production: c.production,
			retired: false,
			remote,
			bankAccountId: bank.id,
			bankIdentity: this.identity(bank),
			startDate: i.startDate,
			timeZone: i.timeZone,
			enabled: true,
			nextAt: this.now(),
			failures: 0,
			pendingCount: 0
		};
		this.audit("map", m.id, "INTENT");
		this.store.change((s) => s.mappings.push(m));
		this.audit("map", m.id, "SUCCESS");
		return this.view();
	}
	setEnabled(raw) {
		const i = object({
			id: id$1,
			enabled: boolean()
		}).strict().parse(raw), m = this.mapping(i.id);
		this.security.require("banking.write");
		this.owned(m);
		if (m.retired) throw new Error("Retired mappings retain history and cannot resume.");
		if (i.enabled) {
			this.restoreCheck();
			this.verifyMapping(m);
		}
		this.audit(i.enabled ? "resume" : "pause", m.id, "INTENT");
		this.store.change((s) => {
			const row = s.mappings.find((x) => x.id === m.id);
			row.enabled = i.enabled;
			row.nextAt = this.now();
			row.failures = 0;
		});
		this.audit(i.enabled ? "resume" : "pause", m.id, "SUCCESS");
		return this.view();
	}
	sync(raw) {
		const i = object({ id: id$1 }).strict().parse(raw), m = this.mapping(i.id);
		this.security.require("banking.write");
		this.owned(m);
		this.restoreCheck();
		this.verifyMapping(m);
		if (!m.enabled) throw new Error("Resume the mapping before synchronizing.");
		this.blocked = "";
		this.store.change((s) => {
			s.mappings.find((x) => x.id === m.id).nextAt = this.now();
		});
		return this.view();
	}
	retire(raw) {
		const i = object({
			id: id$1,
			confirmed: literal(true)
		}).strict().parse(raw), m = this.mapping(i.id);
		this.security.require("banking.write");
		this.owned(m);
		if (this.running) throw new Error("Wait for the running request.");
		if (this.store.read().batches.some((b) => b.mappingId === m.id && b.status !== "COMPLETED")) throw new Error("Review all existing batches before retiring this mapping.");
		this.audit("retire", m.id, "INTENT");
		this.store.change((s) => {
			const row = s.mappings.find((x) => x.id === m.id);
			row.retired = true;
			row.enabled = false;
		});
		this.audit("retire", m.id, "SUCCESS");
		return this.view();
	}
	renew(raw) {
		const i = object({
			id: id$1,
			confirmed: literal(true)
		}).strict().parse(raw), m = this.mapping(i.id);
		this.security.require("banking.write");
		this.owned(m);
		this.restoreCheck();
		const c = this.vault.get(), state = this.store.read(), remote = state.accounts.find((a) => a.id === m.remote.id && a.institutionId === m.remote.institutionId);
		if (this.running || m.retired || !c.enabled || m.providerUserId !== c.userId || m.production !== c.production || state.accountsRevision !== this.vault.revision() || !remote || remote.expiresAt <= this.now() || this.identity(this.bank(m.bankAccountId)) !== m.bankIdentity) throw new Error("Renew only the same provider user, environment and local bank after current account discovery.");
		this.audit("renew", m.id, "INTENT");
		this.store.change((s) => {
			const row = s.mappings.find((x) => x.id === m.id);
			row.remote = remote;
			row.credentialRevision = this.vault.revision();
			row.enabled = true;
			row.failures = 0;
			row.error = void 0;
			row.nextAt = this.now();
		});
		this.audit("renew", m.id, "SUCCESS");
		return this.view();
	}
	cancelRequest() {
		const p = this.security.require("banking.write"), request = this.store.read().request;
		if (this.running) throw new Error("Wait for the running request.");
		if (request && request.ownerId !== p.userId && !hasPermission(p, "users.manage")) throw new Error("Only the request owner or administrator may cancel.");
		this.store.change((s) => {
			s.request = void 0;
		});
		this.audit("request.cancel", "provider-user", "SUCCESS");
		return this.view();
	}
	importBatch(raw) {
		const i = object({
			id: id$1,
			excludedIds: array(id$1).max(1e4),
			reason: string().min(10).max(2e3),
			confirmed: literal(true)
		}).strict().parse(raw);
		this.security.require("banking.write");
		this.restoreCheck();
		const batch = this.store.read().batches.find((b) => b.id === i.id);
		if (!batch) throw new Error("Feed batch not found.");
		const m = this.mapping(batch.mappingId);
		this.owned(m);
		this.verifyMapping(m);
		if (batch.status === "COMPLETED") return this.view();
		if (new Set(i.excludedIds).size !== i.excludedIds.length || i.excludedIds.some((e) => !batch.rows.some((r) => r.externalId === e))) throw new Error("Choose unique rows from this batch.");
		if (this.running) throw new Error("Wait for the running feed request before importing.");
		const selected = batch.rows.filter((r) => !i.excludedIds.includes(r.externalId));
		this.audit("import", batch.id, "INTENT");
		this.store.change((s) => {
			const b = s.batches.find((b) => b.id === batch.id);
			b.status = "IMPORTING";
			b.excludedIds = i.excludedIds;
			b.reason = i.reason;
			b.error = void 0;
		});
		try {
			if (selected.length) this.business.command({
				repository: "bankStatements",
				method: "importRows",
				args: [{
					bankAccountId: m.bankAccountId,
					rows: selected
				}]
			});
			const current = this.lines(), evidence = selected.map((row) => {
				const l = current.find((l) => l.bankAccountId === m.bankAccountId && l.externalId === row.externalId);
				if (!l || fingerprint(l) !== fingerprint(row)) throw new Error("Imported statement evidence differs from the reviewed batch.");
				return {
					externalId: row.externalId,
					lineId: l.id,
					digest: fingerprint(row)
				};
			});
			this.store.change((s) => {
				const b = s.batches.find((b) => b.id === batch.id);
				b.status = "COMPLETED";
				b.evidence = evidence;
				b.error = void 0;
			});
			this.audit("import", batch.id, "SUCCESS");
			this.history("BATCH_IMPORTED", batch.id);
		} catch (error) {
			this.store.change((s) => {
				const b = s.batches.find((b) => b.id === batch.id);
				b.status = "REVIEW";
				b.error = "Import requires review. Existing statement IDs, reconciled periods and source conflicts remain protected.";
			});
			this.audit("import", batch.id, "FAILED");
			throw error;
		}
		return this.view();
	}
	async tick() {
		if (this.running || this.blocked || !hasPermission(this.security.principal(), "banking.write")) return;
		this.running = true;
		try {
			this.restoreCheck();
			const c = this.vault.get();
			if (!c.enabled || !c.apiKey || !c.userId) return;
			const owner = this.passive(true).userId, revision = this.vault.revision(), request = this.store.read().request;
			if (request && request.ownerId === owner) {
				this.store.change((s) => {
					if (s.request) s.request.attempted = true;
				});
				try {
					if (request.kind === "AUTHORIZE") {
						const link = await this.provider.authorization(c, this.now(), !request.attempted);
						if (this.security.principal()?.userId === owner && this.vault.revision() === revision) this.link = {
							...link,
							ownerId: owner,
							revision
						};
					} else {
						const accounts = await this.provider.discover(c, this.now());
						if (this.security.principal()?.userId !== owner || this.vault.revision() !== revision) throw new FeedFault("SESSION_OR_CONFIGURATION_CHANGED");
						this.store.change((s) => {
							s.accounts = accounts;
							s.accountsRevision = revision;
						});
					}
					this.store.change((s) => {
						s.request = void 0;
					});
					this.history(request.kind + "_COMPLETE", "provider-user");
					this.audit(request.kind.toLowerCase(), "provider-user", "SUCCESS");
				} catch (error) {
					this.store.change((s) => {
						s.request = void 0;
					});
					this.history(error instanceof FeedFault ? error.code : "PROVIDER_REQUEST_FAILED", "provider-user");
					this.audit(request.kind.toLowerCase(), "provider-user", "FAILED");
					this.blocked = error instanceof FeedFault ? error.code : "Bank feed request failed. Inspect configuration and try again.";
				}
				return;
			}
			const m = this.store.read().mappings.find((m) => !m.retired && m.enabled && m.ownerId === owner && m.nextAt <= this.now());
			if (!m) return;
			try {
				this.verifyMapping(m);
				this.audit("sync", m.id, "INTENT");
				const through = this.today(), overlap = m.lastThrough ? (/* @__PURE__ */ new Date(Date.parse(m.lastThrough + "T00:00:00Z") - 6048e5)).toISOString().slice(0, 10) : m.startDate, from = overlap < m.startDate ? m.startDate : overlap;
				const result = await this.provider.transactions(c, m.remote, from, through, this.now(), m.timeZone);
				if (this.security.principal()?.userId !== owner || !hasPermission(this.security.principal(), "banking.write") || this.vault.revision() !== revision || !this.mapping(m.id).enabled) throw new FeedFault("SESSION_CONFIGURATION_OR_MAPPING_CHANGED");
				this.verifyMapping(m);
				const currentState = this.store.read();
				const sharedIds = new Set(currentState.mappings.filter((x) => x.bankAccountId === m.bankAccountId && x.providerUserId === m.providerUserId && x.production === m.production && x.remote.id === m.remote.id).map((x) => x.id));
				const existing = currentState.batches.filter((b) => sharedIds.has(b.mappingId)).flatMap((b) => b.rows), rows = [];
				for (const row of result.rows) {
					const prior = existing.find((r) => r.externalId === row.externalId);
					if (prior && fingerprint(prior) !== fingerprint(row)) throw new FeedFault("POSTED_TRANSACTION_CHANGED_REVIEW_REQUIRED");
					if (!prior) rows.push(row);
				}
				this.store.change((s) => {
					if (rows.length) s.batches.push({
						id: randomUUID(),
						mappingId: m.id,
						createdAt: this.now(),
						throughDate: through,
						status: "REVIEW",
						rows,
						excludedIds: [],
						reason: "",
						evidence: []
					});
					const row = s.mappings.find((x) => x.id === m.id);
					row.lastSuccess = this.now();
					row.lastThrough = through;
					row.remote = result.account;
					row.pendingCount = result.pending;
					row.failures = 0;
					row.error = void 0;
					row.nextAt = this.now() + 9e5;
				});
				this.audit("sync", m.id, "SUCCESS");
			} catch (error) {
				this.store.change((s) => {
					const row = s.mappings.find((x) => x.id === m.id);
					row.failures++;
					row.error = error instanceof FeedFault ? error.code : "Mapping, local bank or persistence requires review.";
					row.nextAt = this.now() + Math.min(6e4 * 2 ** Math.min(row.failures, 8), 216e5);
					if (row.failures >= 5 || error instanceof FeedFault && /CONSENT|CONNECTION|CHANGED|MISMATCH|ACCOUNT_UNAVAILABLE|HTTP_40[134]/.test(error.code)) row.enabled = false;
				});
				this.audit("sync", m.id, "FAILED");
			}
		} catch (error) {
			this.blocked = error instanceof Error ? error.message : "Bank feed worker stopped. Preserve the profile.";
		} finally {
			this.running = false;
		}
	}
};
//#endregion
//#region src/features/external-services/statementHtml.ts
var escape = (v) => String(v).replace(/[&<>"']/g, (c) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[c]);
function renderStatement(a) {
	const money = (v) => escape(a.currency + " " + v.toFixed(2));
	return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>${escape(a.documentNumber)}</title><style>@page{size:A4;margin:15mm}body{font:12px Arial;color:#172033}h1{font-size:24px}table{border-collapse:collapse;width:100%;margin-top:20px}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left}td:nth-last-child(-n+3){text-align:right}thead{display:table-header-group}tr{break-inside:avoid}</style></head><body><h1>${escape(a.issuerName)}</h1><h2>Customer statement</h2><p>${escape(a.customerName)} · ${escape(a.fromDate)} to ${escape(a.toDate)}</p><p>Opening ${money(a.openingBalance)} · Debits ${money(a.totalDebits)} · Credits ${money(a.totalCredits)} · Closing ${money(a.closingBalance)}</p><table><thead><tr><th>Date</th><th>Reference / description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead><tbody>${a.entries.map((e) => `<tr><td>${escape(e.date)}</td><td>${escape(e.reference)}<br>${escape(e.description)}</td><td>${money(e.debit)}</td><td>${money(e.credit)}</td><td>${money(e.balance)}</td></tr>`).join("")}</tbody></table></body></html>`;
}
//#endregion
//#region src/features/document-output/outputHtml.ts
var escapeOutputHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[c]);
function renderOutputHtml(raw) {
	const a = validatePreparedOutput(raw), e = escapeOutputHtml, m = (n) => n.toFixed(2), kind = a.kind.replaceAll("_", " "), recipient = a.recipient;
	return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'"><title>${e(a.documentNumber)} · ${e(a.issuer.name)}</title><style>@page{size:${a.template.paper};margin:16mm}*{box-sizing:border-box}body{font:13px/1.5 Arial,sans-serif;color:#172620;margin:24px auto;max-width:1000px;padding:16px}header{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #234d42;padding-bottom:16px}h1{font-size:24px;margin:0}h2{font-size:16px;margin:0 0 6px}p{margin:3px 0;overflow-wrap:anywhere}.muted{color:#52605b}.status{font-weight:bold}.columns{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:24px 0}table{border-collapse:collapse;width:100%;table-layout:fixed}th,td{padding:9px 7px;border-bottom:1px solid #d7dfdb;vertical-align:top;text-align:right;overflow-wrap:anywhere}th:first-child,td:first-child{text-align:left;width:36%}thead{display:table-header-group;background:#edf3ef}tr{break-inside:avoid}.totals{margin:20px 0 20px auto;max-width:320px}.totals p{display:flex;justify-content:space-between;gap:24px}.grand{font-size:18px;font-weight:bold}.notes{white-space:pre-wrap;margin-top:20px}.audit{font-size:10px;color:#52605b;margin-top:30px;border-top:1px solid #ddd;padding-top:8px}@media print{body{margin:0;padding:0;max-width:none}header{break-inside:avoid}}</style></head><body><header><section>${logoHtml(a.issuer.logo, a.template.logoPosition)}<h1>${e(a.issuer.name)}</h1>${[
		a.issuer.tradingName,
		a.issuer.identifier,
		a.issuer.address,
		a.issuer.email,
		a.issuer.phone
	].filter(Boolean).map((v) => `<p>${e(v)}</p>`).join("")}</section><section><h2>${e(kind)}</h2><p>${e(a.documentNumber)}</p><p class="status">${e(a.status)}${a.status === "DRAFT" ? " · DRAFT — NOT ISSUED" : ""}</p><p>Date: ${e(a.documentDate)}</p>${a.dueDate ? `<p>Due: ${e(a.dueDate)}</p>` : ""}${a.expiryDate ? `<p>Expiry: ${e(a.expiryDate)}</p>` : ""}</section></header><div class="columns"><section><h2>Customer</h2><p>${e(a.customerName)}</p><p>${e(a.customerCode)} ${e(a.customerIdentifier)}</p><p>Reference: ${e(a.reference ?? "—")}</p></section><section><h2>Store & delivery</h2><p>${e(recipient?.locationName ?? "Not recorded on source")}</p><p>${e(recipient?.deliveryAddress ?? "")}</p><p>Accounting: ${e(recipient?.accountingContactName ?? "Not recorded on source")}</p><p>${e(recipient?.accountingEmail ?? "")}</p></section></div><table><thead><tr><th>Item / description</th><th>Qty / unit</th><th>Unit price (net)</th><th>Net</th><th>Tax</th><th>Total</th></tr></thead><tbody>${a.lines.map((l) => `<tr><td>${e(l.sku)}${l.itemType && l.itemType !== "STOCK" ? `<p class="muted">${e(l.itemType.replaceAll("_", " "))} · No stock dispatch</p>` : ""}<p>${e(l.description)}</p>${l.areaPerPack ? `<p class="muted">${l.requestedArea === void 0 ? "" : `${e(l.requestedArea)} m² required · `}${e(l.coveredArea)} m² covered · ${e(l.areaPerPack)} m²/pack</p>` : ""}</td><td>${e(l.quantity)} ${e(l.unitSymbol)}</td><td>${m(l.unitPrice)}</td><td>${m(l.lineSubtotal)}</td><td>${m(l.taxAmount)}<p class="muted">${e(l.taxCode ?? "Tax")} ${l.taxRate === void 0 ? "" : `${e(Number((l.taxRate * 100).toFixed(4)))}%`}</p></td><td>${m(l.lineTotal)}</td></tr>`).join("")}</tbody></table><div class="totals"><p><span>Subtotal</span><span>${m(a.totals.subtotal)}</span></p><p><span>Tax</span><span>${m(a.totals.taxAmount)}</span></p><p class="grand"><span>Total ${e(a.issuer.currency)}</span><span>${m(a.totals.total)}</span></p>${a.amountPaid === void 0 ? "" : `<p><span>Paid at preparation</span><span>${m(a.amountPaid)}</span></p>`}${a.amountDue === void 0 ? "" : `<p><span>Due at preparation</span><span>${m(a.amountDue)}</span></p>`}</div>${a.notes ? `<section class="notes"><h2>Notes / reason</h2>${e(a.notes)}</section>` : ""}${a.template.footer ? `<footer class="notes">${e(a.template.footer)}</footer>` : ""}<p class="audit">Prepared ${e(a.preparedAt)} · Version ${e(a.id)} · Source status ${e(a.status)} at preparation. This saved copy is not a live balance or delivery confirmation.</p></body></html>`;
}
//#endregion
//#region src/features/document-output/purchaseOutputHtml.ts
function renderPurchaseOutput(raw) {
	const a = validatePurchaseOutput(raw), po = a.kind === "PURCHASE_ORDER", m = (n) => n.toFixed(2);
	return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'"><title>${escapeOutputHtml(a.documentNumber)}</title><style>@page{size:${a.template.paper};margin:16mm}body{font:13px/1.5 Arial;color:#172620;max-width:1000px;margin:24px auto;padding:16px}header{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #234d42}p{white-space:pre-wrap;overflow-wrap:anywhere}h1{font-size:24px}table{border-collapse:collapse;width:100%;table-layout:fixed}th,td{padding:8px;border-bottom:1px solid #ddd;text-align:right;overflow-wrap:anywhere}th:first-child,td:first-child{text-align:left;width:36%}thead{display:table-header-group}tr{break-inside:avoid}.total{text-align:right;font-weight:bold}.audit{font-size:10px;border-top:1px solid #ddd}@media print{body{padding:0;margin:0}}</style></head><body><header><section>${logoHtml(a.issuer.logo, a.template.logoPosition)}<h1>${escapeOutputHtml(a.issuer.name)}</h1><p>${escapeOutputHtml(a.issuer.identifier)}\n${escapeOutputHtml(a.issuer.address)}\n${escapeOutputHtml(a.issuer.email)}</p></section><section><h2>${po ? "PURCHASE ORDER" : "REMITTANCE ADVICE"}</h2><p>${escapeOutputHtml(a.documentNumber)} · ${escapeOutputHtml(a.status)}${a.status === "DRAFT" ? " · NOT ISSUED" : ""}${a.status === "REVERSED" ? " · REVERSED — NOT AN ACTIVE PAYMENT" : ""}${a.status === "CANCELLED" ? " · CANCELLED" : ""}\nDate: ${escapeOutputHtml(a.date)}${a.expectedDeliveryDate ? "\nExpected delivery: " + escapeOutputHtml(a.expectedDeliveryDate) : ""}</p></section></header><h2>Supplier</h2><p>${escapeOutputHtml(a.supplierName)} · ${escapeOutputHtml(a.supplierCode)}\n${escapeOutputHtml(a.supplierAddress)}\n${escapeOutputHtml(a.supplierContact)} · ${escapeOutputHtml(a.supplierEmail)}</p><p>Supplier contact/address captured at preparation; supplier master updated ${escapeOutputHtml(a.supplierMetadataAt)}. Reference: ${escapeOutputHtml(a.reference)}</p>${po ? "" : `<p>${a.noncash ? "NONCASH PREPAYMENT APPLICATION — no new bank payment" : "Recorded payment — this advice does not send funds or confirm bank settlement"}. Method: ${escapeOutputHtml(a.method)}</p>`}<table><thead><tr>${po ? "<th>Item / description</th><th>Ordered qty / unit</th><th>Unit cost (net)</th><th>Net</th><th>Tax</th><th>Total</th>" : "<th>Bill</th><th>Supplier invoice reference</th><th>Allocated amount</th>"}</tr></thead><tbody>${a.lines.map((l) => po ? `<tr><td>${escapeOutputHtml(l.reference)}<p>${escapeOutputHtml(l.description)}</p></td><td>${escapeOutputHtml(l.quantity)} ${escapeOutputHtml(l.unit)}</td><td>${m(l.unitPrice)}</td><td>${m(l.net)}</td><td>${m(l.tax)}<p>${escapeOutputHtml(l.taxCode)} ${l.taxRate === void 0 ? "" : escapeOutputHtml(Number((l.taxRate * 100).toFixed(4))) + "%"}</p></td><td>${m(l.total)}</td></tr>` : `<tr><td>${escapeOutputHtml(l.description)}</td><td>${escapeOutputHtml(l.reference)}</td><td>${m(l.total)}</td></tr>`).join("")}</tbody></table>${po ? `<p class="total">Subtotal ${m(a.subtotal)} · Tax ${m(a.tax)}</p>` : ""}<p class="total">${po ? "Order total" : "Allocated payment total"} ${escapeOutputHtml(a.issuer.currency)} ${m(a.total)}</p><p>${escapeOutputHtml(a.notes)}</p><p>${escapeOutputHtml(a.template.footer)}</p><p class="audit">Prepared ${escapeOutputHtml(a.preparedAt)} · ${escapeOutputHtml(a.preparedBy)} · Version ${escapeOutputHtml(a.id)}. Status and amounts are retained at preparation. This saved copy is not delivery confirmation${po ? " or a supplier invoice" : ", a tax invoice or a bank payment instruction"}.</p></body></html>`;
}
//#endregion
//#region src/features/sales/data/customerStatementService.ts
function buildCustomerStatement({ customerId, documents, payments, creditNotes, fromDate, toDate }) {
	if (fromDate > toDate) throw new Error("Statement from date cannot be after to date.");
	const invoices = documents.filter((document) => document.type === "INVOICE" && document.customerId === customerId && document.documentDate <= toDate);
	const invoiceMap = new Map(invoices.map((invoice) => [invoice.id, invoice]));
	const customerCreditNotes = creditNotes.filter((creditNote) => creditNote.customerId === customerId && creditNote.creditDate <= toDate && creditNote.status !== "DRAFT");
	const allEntries = [];
	for (const invoice of invoices) {
		allEntries.push({
			id: `invoice-${invoice.id}`,
			date: invoice.documentDate,
			sortDateTime: `${invoice.documentDate}T00:00:00.000Z`,
			type: "INVOICE",
			reference: invoice.documentNumber,
			description: "Sales invoice",
			invoiceId: invoice.id,
			debit: roundCurrency(invoice.totals.total),
			credit: 0
		});
		if (invoice.voidedAt) {
			const voidDate = toDateKey(invoice.voidedAt);
			if (voidDate <= toDate) allEntries.push({
				id: `invoice-void-${invoice.id}`,
				date: voidDate,
				sortDateTime: invoice.voidedAt,
				type: "INVOICE_VOID",
				reference: `${invoice.documentNumber} VOID`,
				description: invoice.voidReason ? `Invoice void — ${invoice.voidReason}` : "Invoice void",
				invoiceId: invoice.id,
				debit: 0,
				credit: roundCurrency(invoice.totals.total)
			});
		}
	}
	for (const payment of payments) {
		if (payment.customerId !== customerId || payment.paymentDate > toDate) continue;
		const invoiceReference = invoiceMap.get(payment.invoiceId)?.documentNumber;
		allEntries.push({
			id: `payment-${payment.id}`,
			date: payment.paymentDate,
			sortDateTime: payment.createdAt,
			type: "PAYMENT",
			reference: payment.paymentNumber,
			description: invoiceReference ? `Payment received — ${invoiceReference}` : "Payment received",
			invoiceId: payment.invoiceId,
			paymentId: payment.id,
			debit: 0,
			credit: roundCurrency(payment.amount)
		});
		if (payment.status === "REVERSED" && payment.reversedAt) {
			const reversalDate = toDateKey(payment.reversedAt);
			if (reversalDate <= toDate) allEntries.push({
				id: `payment-reversal-${payment.id}`,
				date: reversalDate,
				sortDateTime: payment.reversedAt,
				type: "PAYMENT_REVERSAL",
				reference: `${payment.paymentNumber} REV`,
				description: payment.reversalReason ? `Payment reversal — ${payment.reversalReason}` : "Payment reversal",
				invoiceId: payment.invoiceId,
				paymentId: payment.id,
				debit: roundCurrency(payment.amount),
				credit: 0
			});
		}
	}
	for (const creditNote of customerCreditNotes) {
		allEntries.push({
			id: `credit-note-${creditNote.id}`,
			date: creditNote.creditDate,
			sortDateTime: creditNote.issuedAt ?? creditNote.createdAt,
			type: "CREDIT_NOTE",
			reference: creditNote.creditNoteNumber,
			description: creditNote.reason ? `Credit note — ${creditNote.reason}` : "Credit note",
			invoiceId: creditNote.sourceInvoiceId,
			creditNoteId: creditNote.id,
			debit: 0,
			credit: roundCurrency(creditNote.totals.total)
		});
		if (creditNote.voidedAt) {
			const voidDate = toDateKey(creditNote.voidedAt);
			if (voidDate <= toDate) allEntries.push({
				id: `credit-note-void-${creditNote.id}`,
				date: voidDate,
				sortDateTime: creditNote.voidedAt,
				type: "CREDIT_NOTE_VOID",
				reference: `${creditNote.creditNoteNumber} VOID`,
				description: creditNote.voidReason ? `Credit note void — ${creditNote.voidReason}` : "Credit note void",
				invoiceId: creditNote.sourceInvoiceId,
				creditNoteId: creditNote.id,
				debit: roundCurrency(creditNote.totals.total),
				credit: 0
			});
		}
	}
	for (const credit of customerCreditNotes) for (const event of credit.refundEvents ?? []) {
		if (event.date <= toDate) allEntries.push({
			id: "refund-" + event.id,
			date: event.date,
			sortDateTime: event.date + "T00:00:00Z",
			type: "REFUND",
			reference: credit.creditNoteNumber,
			description: "Customer credit refund",
			creditNoteId: credit.id,
			debit: event.amount,
			credit: 0
		});
		if (event.reversalDate && event.reversalDate <= toDate) allEntries.push({
			id: "refund-reversal-" + event.id,
			date: event.reversalDate,
			sortDateTime: event.reversalDate + "T23:59:59Z",
			type: "REFUND_REVERSAL",
			reference: credit.creditNoteNumber,
			description: "Customer refund reversal",
			creditNoteId: credit.id,
			debit: 0,
			credit: event.amount
		});
	}
	allEntries.sort(compareEntries);
	const openingBalance = roundCurrency(allEntries.filter((entry) => entry.date < fromDate).reduce((balance, entry) => balance + entry.debit - entry.credit, 0));
	const periodEntries = allEntries.filter((entry) => entry.date >= fromDate && entry.date <= toDate);
	let runningBalance = openingBalance;
	const statementEntries = periodEntries.map((entry) => {
		runningBalance = roundCurrency(runningBalance + entry.debit - entry.credit);
		return {
			id: entry.id,
			date: entry.date,
			type: entry.type,
			reference: entry.reference,
			description: entry.description,
			invoiceId: entry.invoiceId,
			paymentId: entry.paymentId,
			creditNoteId: entry.creditNoteId,
			debit: entry.debit,
			credit: entry.credit,
			balance: runningBalance
		};
	});
	const totalDebits = roundCurrency(statementEntries.reduce((total, entry) => total + entry.debit, 0));
	const totalCredits = roundCurrency(statementEntries.reduce((total, entry) => total + entry.credit, 0));
	return {
		customerId,
		fromDate,
		toDate,
		openingBalance,
		totalDebits,
		totalCredits,
		closingBalance: roundCurrency(openingBalance + totalDebits - totalCredits),
		entries: statementEntries
	};
}
function compareEntries(a, b) {
	const dateCompare = a.date.localeCompare(b.date);
	if (dateCompare !== 0) return dateCompare;
	return a.sortDateTime.localeCompare(b.sortDateTime);
}
function toDateKey(value) {
	return businessDateKey(value);
}
function roundCurrency(value) {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}
//#endregion
//#region src/features/external-services/contract.ts
var id = string().min(1).max(200);
var email = string().email().max(254);
var settingsSchema = object({
	emailEnabled: boolean(),
	checkoutEnabled: boolean(),
	resendKey: string().max(300).default(""),
	stripeKey: string().max(300).default(""),
	from: union([email, literal("")]),
	successUrl: string().max(2e3),
	cancelUrl: string().max(2e3),
	live: boolean()
}).strict();
var states = [
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
];
var mailPayload = object({
	from: email,
	to: email,
	subject: string().min(1).max(998),
	text: string().min(1).max(3e4),
	attachments: array(object({
		filename: string().min(1).max(200),
		content: string().max(75e5)
	}).strict()).length(1)
}).strict();
var checkoutPayload = object({
	invoiceId: id,
	documentNumber: id,
	amountMinor: number().int().positive().max(99999999),
	currency: literal("aud"),
	successUrl: string(),
	cancelUrl: string(),
	customerEmail: email.optional(),
	live: boolean()
}).strict();
var jobSchema = object({
	id,
	operationId: id,
	ownerId: id,
	kind: _enum(["EMAIL", "CHECKOUT"]),
	family: _enum(["sales", "purchase"]),
	artifactId: id.optional(),
	sourceId: id,
	sourceRevision: string().max(5e5),
	label: string().max(300),
	recipient: string().max(254),
	dedupe: id,
	credentialRevision: id,
	createdAt: number().finite(),
	payloadDigest: string().length(64).optional(),
	firstAttempt: number().finite().optional(),
	attempts: number().int().nonnegative().max(100),
	nextAt: number().finite(),
	status: _enum(states),
	providerId: id.optional(),
	url: string().max(3e3).optional(),
	amountMinor: number().int().positive().optional(),
	payload: union([mailPayload, checkoutPayload]).optional(),
	error: string().max(300).optional(),
	receiptId: id.optional(),
	recordBankId: id.optional(),
	reminderKey: id.optional(),
	history: array(object({
		at: number().finite(),
		event: string().max(100)
	}).strict()).max(500)
}).strict();
var policySchema = object({
	id,
	invoiceId: id,
	ownerId: id,
	enabled: boolean(),
	days: array(number().int().min(0).max(90)).min(1).max(5),
	createdAt: number().finite()
}).strict();
var statementSchema = object({
	id,
	operationId: id,
	ownerId: id,
	kind: literal("CUSTOMER_STATEMENT"),
	sourceId: id,
	sourceRevision: string().length(64),
	documentNumber: id,
	fromDate: string(),
	toDate: string(),
	customerName: string().max(1e3),
	issuerName: string().max(1e3),
	currency: string().max(10),
	recipient: object({ accountingEmail: email }),
	subject: string().max(998),
	body: string().max(3e4),
	template: object({ paper: literal("A4") }),
	openingBalance: number().finite(),
	closingBalance: number().finite(),
	totalDebits: number().finite(),
	totalCredits: number().finite(),
	entries: array(object({
		date: string(),
		reference: string().max(1e3),
		description: string().max(2e4),
		debit: number().finite(),
		credit: number().finite(),
		balance: number().finite()
	}).strict()).max(5e3)
}).strict();
//#endregion
//#region electron/integrations/localIntegrationStore.ts
var dataSchema = object({
	version: literal(1),
	id: string().uuid(),
	jobs: array(jobSchema).max(2e3),
	policies: array(policySchema).max(1e3),
	statements: array(statementSchema).max(1e3).default([])
}).strict();
var digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
/** Separate from business restore: provider side effects must never be rewound by a ledger backup. */
var IntegrationStore = class {
	path;
	data;
	constructor(root) {
		this.path = join(root, "integration-journal-v1.json");
		if (existsSync(this.path)) try {
			const raw = readFileSync(this.path, "utf8");
			if (Buffer.byteLength(raw) > 6e7) throw Error();
			const { checksum, ...body } = JSON.parse(raw);
			if (checksum !== digest(body)) throw Error();
			this.data = dataSchema.parse(body);
			if (new Set(this.data.jobs.map((j) => j.id)).size !== this.data.jobs.length || new Set(this.data.jobs.map((j) => j.operationId)).size !== this.data.jobs.length) throw Error();
		} catch {
			throw new Error("Integration journal is invalid. Preserve the full profile and inspect it; do not reset it to resend.");
		}
		else {
			this.data = {
				version: 1,
				id: randomUUID(),
				jobs: [],
				policies: [],
				statements: []
			};
			this.save(this.data);
		}
	}
	read() {
		return structuredClone(this.data);
	}
	save(next) {
		const data = dataSchema.parse(next);
		if (Buffer.byteLength(JSON.stringify(data)) > 5e7) throw new Error("Integration journal quota reached. Preserve it before archiving payloads.");
		atomicJson(this.path, {
			...data,
			checksum: digest(data)
		});
		this.data = structuredClone(data);
	}
	change(fn) {
		const next = this.read();
		fn(next);
		this.save(next);
	}
};
var IntegrationVault = class {
	path;
	codec;
	constructor(root, codec) {
		this.codec = codec;
		this.path = join(root, "integration-secrets-v1.json");
	}
	get() {
		if (!existsSync(this.path)) return {
			emailEnabled: false,
			checkoutEnabled: false,
			resendKey: "",
			stripeKey: "",
			from: "",
			successUrl: "",
			cancelUrl: "",
			live: false
		};
		if (!this.codec.available()) throw new Error("OS protected credential storage is unavailable.");
		try {
			const value = JSON.parse(readFileSync(this.path, "utf8"));
			if (value.version !== 1 || typeof value.cipher !== "string") throw Error();
			return settingsSchema.parse(JSON.parse(this.codec.decrypt(Buffer.from(value.cipher, "base64"))));
		} catch {
			throw new Error("Saved integration credentials cannot be decrypted on this device. Reconfigure locally; do not reset the integration journal.");
		}
	}
	set(raw) {
		if (!this.codec.available()) throw new Error("OS protected credential storage is unavailable.");
		const parsed = settingsSchema.safeParse(raw);
		if (!parsed.success) throw new Error("Invalid integration settings.");
		const next = parsed.data;
		let old;
		try {
			old = this.get();
		} catch {
			if (next.emailEnabled && !next.resendKey || next.checkoutEnabled && !next.stripeKey) throw new Error("Enter fresh keys for every enabled service to replace unreadable credentials.");
			old = {
				...next,
				resendKey: "",
				stripeKey: ""
			};
		}
		next.resendKey = next.resendKey || old.resendKey;
		next.stripeKey = next.stripeKey || old.stripeKey;
		if (next.resendKey && !/^re_[A-Za-z0-9_-]+$/.test(next.resendKey)) throw new Error("Invalid Resend key format.");
		if (next.stripeKey && !new RegExp("^(sk|rk)_" + (next.live ? "live" : "test") + "_[A-Za-z0-9]+$").test(next.stripeKey)) throw new Error("Stripe key does not match the selected test/live mode.");
		if (next.emailEnabled && (!next.resendKey || !next.from)) throw new Error("Configure a Resend key and verified sender before enabling email.");
		if (next.checkoutEnabled) {
			if (!next.stripeKey) throw new Error("Configure Stripe credentials first.");
			for (const value of [next.successUrl, next.cancelUrl]) {
				let u;
				try {
					u = new URL(value);
				} catch {
					throw new Error("Configure valid HTTPS checkout return pages.");
				}
				if (u.protocol !== "https:" || u.username || u.password || u.port && u.port !== "443") throw new Error("Checkout return pages must use HTTPS.");
			}
		}
		atomicJson(this.path, {
			version: 1,
			cipher: this.codec.encrypt(JSON.stringify(next)).toString("base64")
		});
	}
	revision(kind) {
		const c = this.get();
		return digest(kind === "EMAIL" ? [c.resendKey, c.from] : [c.stripeKey, c.live]);
	}
};
//#endregion
//#region electron/integrations/providers.ts
var ProviderFault = class extends Error {
	code;
	retryable;
	constructor(code, retryable = false) {
		super(code);
		this.code = code;
		this.retryable = retryable;
	}
};
var providerTransport = async (url, init) => {
	let response;
	try {
		response = await fetch(url, {
			...init,
			redirect: "error",
			signal: AbortSignal.timeout(2e4)
		});
	} catch {
		throw new ProviderFault("NETWORK_OUTCOME_UNKNOWN", true);
	}
	if (!response.ok) {
		await response.body?.cancel();
		throw new ProviderFault("PROVIDER_HTTP_" + response.status, response.status === 429 || response.status >= 500 || response.status === 409);
	}
	try {
		const reader = response.body?.getReader();
		if (!reader) throw Error();
		let size = 0;
		const parts = [];
		while (true) {
			const part = await reader.read();
			if (part.done) break;
			size += part.value.byteLength;
			if (size > 1e6) {
				await reader.cancel();
				throw Error();
			}
			parts.push(part.value);
		}
		return JSON.parse(Buffer.concat(parts).toString("utf8"));
	} catch {
		throw new ProviderFault("PROVIDER_RESPONSE_INVALID", true);
	}
};
var providerId = string().regex(/^[a-zA-Z0-9_-]{1,200}$/);
var ack = object({ id: providerId });
var sessionSchema = object({
	id: providerId,
	client_reference_id: string(),
	metadata: object({ htt_job: string() }),
	mode: literal("payment"),
	livemode: boolean(),
	currency: literal("aud"),
	amount_total: number().int().positive(),
	status: _enum([
		"open",
		"complete",
		"expired"
	]),
	payment_status: _enum([
		"paid",
		"unpaid",
		"no_payment_required"
	]),
	url: string().nullable().optional(),
	payment_intent: unknown().optional()
});
function safeCheckoutUrl(raw) {
	const u = new URL(raw);
	if (u.protocol !== "https:" || u.hostname !== "checkout.stripe.com" || u.username || u.password || u.port) throw new ProviderFault("UNTRUSTED_CHECKOUT_URL");
	return u.href;
}
var Providers = class {
	transport;
	constructor(transport = providerTransport) {
		this.transport = transport;
	}
	async create(job, settings, key) {
		if (job.kind === "EMAIL") {
			const payload = mailPayload.parse(job.payload), raw = await this.transport("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					Authorization: "Bearer " + settings.resendKey,
					"Content-Type": "application/json",
					"Idempotency-Key": key
				},
				body: JSON.stringify(payload)
			});
			const parsed = ack.safeParse(raw);
			if (!parsed.success) throw new ProviderFault("PROVIDER_RESPONSE_INVALID", true);
			return { id: parsed.data.id };
		}
		const p = checkoutPayload.parse(job.payload), form = new URLSearchParams({
			mode: "payment",
			client_reference_id: p.invoiceId,
			"metadata[htt_job]": job.id,
			"payment_method_types[0]": "card",
			"line_items[0][price_data][currency]": "aud",
			"line_items[0][price_data][unit_amount]": String(p.amountMinor),
			"line_items[0][price_data][product_data][name]": p.documentNumber,
			"line_items[0][quantity]": "1",
			success_url: p.successUrl,
			cancel_url: p.cancelUrl
		});
		if (p.customerEmail) form.set("customer_email", p.customerEmail);
		const raw = await this.transport("https://api.stripe.com/v1/checkout/sessions", {
			method: "POST",
			headers: {
				Authorization: "Bearer " + settings.stripeKey,
				"Content-Type": "application/x-www-form-urlencoded",
				"Idempotency-Key": key
			},
			body: form.toString()
		});
		const session = this.session(raw, job);
		if (!session.url) throw new ProviderFault("CHECKOUT_URL_MISSING", true);
		return {
			id: session.id,
			url: safeCheckoutUrl(session.url)
		};
	}
	session(raw, job) {
		const parsed = sessionSchema.safeParse(raw);
		if (!parsed.success) throw new ProviderFault("PAYMENT_EVIDENCE_INVALID");
		const s = parsed.data, p = checkoutPayload.parse(job.payload);
		if (s.client_reference_id !== job.sourceId || s.metadata.htt_job !== job.id || s.amount_total !== job.amountMinor || s.livemode !== p.live || job.providerId && s.id !== job.providerId) throw new ProviderFault("PAYMENT_EVIDENCE_MISMATCH");
		return s;
	}
	async poll(job, settings) {
		if (!job.providerId || !providerId.safeParse(job.providerId).success) throw new ProviderFault("PROVIDER_REFERENCE_MISSING");
		if (job.kind === "EMAIL") {
			const raw = await this.transport("https://api.resend.com/emails/" + encodeURIComponent(job.providerId), { headers: { Authorization: "Bearer " + settings.resendKey } });
			const parsed = object({
				id: providerId,
				last_event: _enum([
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
			}).safeParse(raw);
			if (!parsed.success || parsed.data.id !== job.providerId) throw new ProviderFault("DELIVERY_EVIDENCE_INVALID");
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
			}[parsed.data.last_event] };
		}
		const raw = await this.transport("https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(job.providerId) + "?expand[]=payment_intent.latest_charge", { headers: { Authorization: "Bearer " + settings.stripeKey } }), s = this.session(raw, job);
		if (s.status === "expired") return { status: "EXPIRED" };
		if (s.payment_status !== "paid" || s.status !== "complete") return { status: "OPEN" };
		const intent = object({
			status: literal("succeeded"),
			currency: literal("aud"),
			amount_received: number().int(),
			latest_charge: object({
				paid: literal(true),
				captured: literal(true),
				amount_captured: number().int(),
				amount_refunded: literal(0),
				refunded: literal(false),
				created: number().int().positive()
			})
		}).safeParse(s.payment_intent);
		if (!intent.success || intent.data.amount_received !== job.amountMinor || intent.data.latest_charge.amount_captured !== job.amountMinor) throw new ProviderFault("PAID_CHARGE_REQUIRES_REVIEW");
		return {
			status: "PAID_REVIEW",
			paidAt: intent.data.latest_charge.created * 1e3
		};
	}
};
//#endregion
//#region electron/integrations/externalServices.ts
var text = string().min(1).max(200);
var receiptPrefix = "external-stripe:";
var activePost = /* @__PURE__ */ new Set(["QUEUED", "RETRY"]);
var hash = (v) => createHash("sha256").update(JSON.stringify(v)).digest("hex");
var ExternalServices = class {
	approvedScope = false;
	restrictToApprovedScope() {
		this.approvedScope = true;
	}
	retiredJob(job) {
		return this.approvedScope && (!optionalWorkflows.onlineCollection && job.kind === "CHECKOUT" || !optionalWorkflows.remittance && job.family === "purchase" && this.snapshots().preparedPurchaseOutputs?.artifacts.some((a) => a.id === job.artifactId && a.kind === "REMITTANCE"));
	}
	running = false;
	blocked = "";
	reminderCursor = 0;
	store;
	vault;
	security;
	business;
	pdf;
	providers;
	now;
	constructor(store, vault, security, business, pdf, providers = new Providers(), now = () => Date.now()) {
		this.store = store;
		this.vault = vault;
		this.security = security;
		this.business = business;
		this.pdf = pdf;
		this.providers = providers;
		this.now = now;
		const pending = this.store.read().jobs.filter((j) => j.status === "PROCESSING" || j.status === "RECORDING");
		if (pending.length) this.store.change((s) => {
			for (const j of s.jobs) if (pending.some((p) => p.id === j.id)) {
				j.status = j.providerId ? "PAID_REVIEW" : "RETRY";
				j.nextAt = this.now();
				j.error = "Interrupted operation: same provider key retained.";
			}
		});
	}
	passive(permission) {
		const p = this.security.principal();
		if (!hasPermission(p, permission)) throw new Error("Permission denied: " + permission);
		return p;
	}
	readPermission(job) {
		return job.family === "sales" ? "sales.read" : "purchases.read";
	}
	actionable(job) {
		if (this.retiredJob(job)) return false;
		const p = this.security.principal();
		return !!p && p.userId === job.ownerId && hasPermission(p, job.kind === "EMAIL" ? "documents.prepare" : "sales.payment") && hasPermission(p, this.readPermission(job));
	}
	snapshots() {
		return this.business.view().repositories;
	}
	invoice(id) {
		const row = this.snapshots().sales?.invoices.find((d) => d.id === id);
		if (!row) throw new Error("Invoice was not found.");
		return row;
	}
	validInvoice(row) {
		if (![
			"ISSUED",
			"PARTIALLY_PAID",
			"OVERDUE"
		].includes(row.status) || !(row.amountDue > 0) || !Number.isFinite(row.amountDue)) throw new Error("Only issued unpaid customer invoices can use online collection.");
		return row;
	}
	statement(customerId, fromDate, toDate) {
		this.passive("sales.read");
		requireDateKey(fromDate);
		requireDateKey(toDate);
		if (fromDate > toDate || toDate > businessDateKey(new Date(this.now()).toISOString())) throw new Error("Choose a valid statement range ending on or before today.");
		const s = this.snapshots(), customer = s.customers?.customers.find((c) => c.id === customerId);
		if (!customer) throw new Error("Customer not found.");
		const contacts = customer.contacts.filter((c) => c.isAccounting && string().email().safeParse(c.email).success);
		if (contacts.length !== 1) throw new Error("Customer statement requires exactly one accounting contact email.");
		const report = buildCustomerStatement({
			customerId,
			documents: s.sales.invoices,
			payments: s.customerPayments.payments,
			creditNotes: s.customerCredits.creditNotes,
			fromDate,
			toDate
		}), settings = businessSettings();
		return {
			customer,
			recipient: contacts[0].email,
			report,
			settings,
			revision: hash([
				customer,
				report,
				settings.companyName,
				settings.currency
			])
		};
	}
	prepareStatement(raw) {
		const i = object({
			operationId: text,
			customerId: text,
			fromDate: string(),
			toDate: string()
		}).strict().parse(raw), owner = this.security.require("documents.prepare");
		this.security.require("sales.read");
		const prior = this.store.read().statements.find((a) => a.operationId === i.operationId);
		if (prior) {
			if (prior.ownerId !== owner.userId || prior.sourceId !== i.customerId || prior.fromDate !== i.fromDate || prior.toDate !== i.toDate) throw new Error("Statement operation belongs to different input.");
			return prior.id;
		}
		const d = this.statement(i.customerId, i.fromDate, i.toDate), documentNumber = "STATEMENT-" + d.customer.code + "-" + i.toDate;
		const a = statementSchema.parse({
			id: randomUUID(),
			operationId: i.operationId,
			ownerId: owner.userId,
			kind: "CUSTOMER_STATEMENT",
			sourceId: i.customerId,
			sourceRevision: d.revision,
			documentNumber,
			fromDate: i.fromDate,
			toDate: i.toDate,
			customerName: d.customer.businessName,
			issuerName: d.settings.companyName,
			currency: d.settings.currency,
			recipient: { accountingEmail: d.recipient },
			subject: documentNumber,
			body: "Dear " + d.customer.businessName + ",\nPlease find your statement from " + i.fromDate + " to " + i.toDate + ". Closing balance " + d.settings.currency + " " + d.report.closingBalance.toFixed(2) + ".",
			template: { paper: "A4" },
			openingBalance: d.report.openingBalance,
			closingBalance: d.report.closingBalance,
			totalDebits: d.report.totalDebits,
			totalCredits: d.report.totalCredits,
			entries: d.report.entries.map((e) => ({
				date: e.date,
				reference: e.reference,
				description: e.description,
				debit: e.debit,
				credit: e.credit,
				balance: e.balance
			}))
		});
		this.security.audit("external.statement.prepare", a.id, "INTENT", "documents.prepare");
		this.store.change((s) => s.statements.push(a));
		this.security.audit("external.statement.prepare", a.id, "SUCCESS", "documents.prepare");
		return a.id;
	}
	sourceArtifact(family, id) {
		const s = this.snapshots(), statement = family === "sales" ? this.store.read().statements.find((a) => a.id === id) : void 0;
		if (statement) {
			if (this.statement(statement.sourceId, statement.fromDate, statement.toDate).revision !== statement.sourceRevision) throw new Error("Statement data changed; prepare a new version.");
			return {
				artifact: statement,
				revision: statement.sourceRevision,
				recipient: statement.recipient.accountingEmail
			};
		}
		const a = s[family === "sales" ? "preparedSalesOutputs" : "preparedPurchaseOutputs"]?.artifacts.find((d) => d.id === id);
		if (!a) throw new Error("Prepared output was not found or is not permitted.");
		if (this.approvedScope && !optionalWorkflows.remittance && a.kind === "REMITTANCE") throw Error("Remittance advice has been removed from the approved scope.");
		let revision, status;
		if (family === "sales") {
			const source = a.kind === "CREDIT_NOTE" ? s.customerCredits.creditNotes.find((d) => d.id === a.sourceId) : [
				...s.sales.quotes,
				...s.sales.salesOrders,
				...s.sales.invoices
			].find((d) => d.id === a.sourceId);
			if (!source) throw new Error("Output source no longer exists.");
			revision = source.updatedAt;
			status = source.status;
			if (revision !== a.sourceUpdatedAt) throw new Error("Source changed; prepare a new version before sending.");
		} else {
			revision = purchaseSourceRevision(a.kind, a.sourceId);
			status = a.status;
			if (revision !== a.sourceRevision) throw new Error("Purchase source changed; prepare a current version.");
		}
		if ([
			"DRAFT",
			"VOID",
			"CANCELLED",
			"REVERSED",
			"DECLINED",
			"EXPIRED"
		].includes(status)) throw new Error("Draft, cancelled or void documents cannot be emailed.");
		return {
			artifact: a,
			revision,
			recipient: family === "sales" ? a.recipient?.accountingEmail : a.supplierEmail
		};
	}
	update(id, patch, event) {
		this.store.change((s) => {
			const j = s.jobs.find((j) => j.id === id);
			if (!j) throw new Error("Integration job missing.");
			Object.assign(j, patch);
			if (event) j.history = [...j.history.slice(-499), {
				at: this.now(),
				event
			}];
		});
	}
	audit(action, job, outcome) {
		this.security.audit("external." + action, job.id, outcome, job.kind === "EMAIL" ? "documents.prepare" : "sales.payment", void 0, job.ownerId);
	}
	get(id) {
		const j = this.store.read().jobs.find((j) => j.id === id);
		if (!j) throw new Error("Integration job not found.");
		if (this.retiredJob(j)) throw Error("This external workflow has been removed from the approved scope.");
		this.passive(this.readPermission(j));
		return j;
	}
	receiptOperation(job) {
		return receiptPrefix + this.store.read().id + ":" + job.id;
	}
	receipt(job) {
		const op = financialOperationJournal.list().find((o) => o.operationId === this.receiptOperation(job));
		if (!op) return void 0;
		if (op.kind !== "CUSTOMER_PAYMENT" || op.state !== "COMPLETED") throw new Error("External payment has an unresolved accounting operation.");
		const p = this.snapshots().customerPayments?.payments.find((p) => p.id === op.resultId && p.invoiceId === job.sourceId && p.status === "RECEIVED" && Math.round(p.amount * 100) === job.amountMinor && p.reference === "Stripe " + job.providerId);
		if (!p) throw new Error("External receipt evidence differs from the restored ledger. Reconcile the business backup before processing integrations.");
		return p;
	}
	recoveryCheck() {
		for (const job of this.store.read().jobs) if (job.status === "RECORDED" && this.actionable(job) && !this.receipt(job)) throw new Error("Recorded external receipt is missing from this business profile. Restore compatible ledger evidence before continuing.");
	}
	view() {
		const p = this.security.principal();
		if (!p || ![
			"sales.read",
			"purchases.read",
			"users.manage"
		].some((v) => hasPermission(p, v))) throw new Error("Permission denied: integrations.");
		let c;
		let health = this.blocked;
		try {
			c = this.vault.get();
			this.recoveryCheck();
		} catch (error) {
			health = error instanceof Error ? error.message : "Integration inspection failed.";
		}
		c ??= {
			emailEnabled: false,
			checkoutEnabled: false,
			resendKey: "",
			stripeKey: "",
			from: "",
			successUrl: "",
			cancelUrl: "",
			live: false
		};
		const data = this.store.read(), s = this.snapshots();
		const jobs = data.jobs.filter((j) => hasPermission(p, this.readPermission(j)) && (!this.approvedScope || !this.retiredJob(j))).map((j) => {
			const { payload: _p, credentialRevision: _c, sourceRevision: _s, ...visible } = j;
			return visible;
		});
		const outputs = [
			...hasPermission(p, "sales.read") ? data.statements.map((a) => ({
				id: a.id,
				family: "sales",
				label: a.documentNumber + " · " + a.id.slice(0, 8),
				recipient: a.recipient.accountingEmail
			})) : [],
			...hasPermission(p, "sales.read") ? (s.preparedSalesOutputs?.artifacts ?? []).map((a) => ({
				id: a.id,
				family: "sales",
				label: a.documentNumber + " · " + a.id.slice(0, 8),
				recipient: a.recipient?.accountingEmail ?? ""
			})) : [],
			...hasPermission(p, "purchases.read") ? (s.preparedPurchaseOutputs?.artifacts ?? []).filter((a) => !this.approvedScope || optionalWorkflows.remittance || a.kind !== "REMITTANCE").map((a) => ({
				id: a.id,
				family: "purchase",
				label: a.documentNumber + " · " + a.id.slice(0, 8),
				recipient: a.supplierEmail ?? ""
			})) : []
		];
		return {
			configuration: {
				emailEnabled: c.emailEnabled,
				checkoutEnabled: c.checkoutEnabled,
				emailConfigured: !!c.resendKey && !!c.from,
				checkoutConfigured: !!c.stripeKey && !!c.successUrl && !!c.cancelUrl,
				from: c.from,
				successUrl: c.successUrl,
				cancelUrl: c.cancelUrl,
				live: c.live,
				secureStorage: this.vault.codec.available()
			},
			jobs,
			policies: hasPermission(p, "sales.read") ? data.policies : [],
			health: health || "Ready. No external service is contacted until enabled work is queued.",
			running: this.running,
			outputs,
			invoices: hasPermission(p, "sales.read") ? (s.sales?.invoices ?? []).map((d) => ({
				id: d.id,
				label: d.documentNumber,
				amountDue: d.amountDue,
				email: d.recipient?.accountingEmail ?? ""
			})) : [],
			customers: hasPermission(p, "sales.read") ? (s.customers?.customers ?? []).map((c) => ({
				id: c.id,
				name: c.businessName,
				email: c.contacts.filter((x) => x.isAccounting).map((x) => x.email).join(", ")
			})) : [],
			banks: hasPermission(p, "banking.read") ? (s.bankAccounts?.bankAccounts ?? []).filter((b) => b.active).map((b) => ({
				id: b.id,
				name: b.name,
				currency: b.currency
			})) : []
		};
	}
	preview(raw) {
		const i = object({
			family: _enum(["sales", "purchase"]),
			artifactId: text
		}).strict().parse(raw);
		this.passive(i.family === "sales" ? "sales.read" : "purchases.read");
		const { artifact: a, recipient } = this.sourceArtifact(i.family, i.artifactId);
		return {
			recipient,
			subject: a.subject,
			body: a.body,
			html: a.kind === "CUSTOMER_STATEMENT" ? renderStatement(a) : i.family === "sales" ? renderOutputHtml(a) : renderPurchaseOutput(a)
		};
	}
	configure(raw) {
		if (this.approvedScope && !optionalWorkflows.onlineCollection && raw?.checkoutEnabled) throw Error("Online collection has been removed from the approved scope.");
		this.security.require("users.manage");
		if (this.running) throw new Error("Wait for the running provider request before changing credentials.");
		this.security.audit("external.configuration", "integration-vault", "INTENT", "users.manage");
		this.vault.set(raw);
		this.security.audit("external.configuration", "integration-vault", "SUCCESS", "users.manage");
		return this.view();
	}
	async queueMail(raw, reminder) {
		const i = object({
			operationId: text,
			artifactId: text,
			family: _enum(["sales", "purchase"]),
			confirmed: literal(true)
		}).strict().parse(raw), owner = this.security.require("documents.prepare");
		this.security.require(i.family === "sales" ? "sales.read" : "purchases.read");
		const prior = this.store.read().jobs.find((j) => j.operationId === i.operationId);
		if (prior) {
			if (prior.ownerId !== owner.userId) throw new Error("Operation belongs to another user.");
			if (prior.artifactId !== i.artifactId || prior.family !== i.family || prior.kind !== "EMAIL") throw new Error("Operation ID already belongs to another request.");
			return prior.id;
		}
		const c = this.vault.get();
		if (!c.emailEnabled || !c.resendKey || !c.from) throw new Error("Email is not configured and enabled.");
		const source = this.sourceArtifact(i.family, i.artifactId), recipient = string().email().parse(source.recipient), dedupe = reminder ? reminder.key : "email:" + i.family + ":" + i.artifactId;
		if (this.store.read().jobs.some((j) => j.dedupe === dedupe)) throw new Error("This document version or reminder stage already has a delivery job. Inspect it instead of sending again.");
		if (this.store.read().jobs.some((j) => j.family === i.family && j.sourceId === source.artifact.sourceId && [
			"UNCERTAIN",
			"PROCESSING",
			"RETRY"
		].includes(j.status))) throw new Error("Reconcile the pending or uncertain provider outcome for this source before creating another delivery.");
		if (this.store.read().jobs.some((j) => j.recipient === recipient && [
			"BOUNCED",
			"COMPLAINED",
			"SUPPRESSED"
		].includes(j.status))) throw new Error("Recipient delivery is suppressed. Reconcile the failed address and prepare a corrected recipient before sending.");
		const pdf = await this.pdf(i.family, source.artifact);
		if (pdf.length > 5e6 || !pdf.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw new Error("Generated PDF is invalid or exceeds 5 MB.");
		if (this.security.principal()?.userId !== owner.userId) throw new Error("Sign in again before queueing delivery.");
		this.security.require("documents.prepare");
		this.security.require(i.family === "sales" ? "sales.read" : "purchases.read");
		this.sourceArtifact(i.family, i.artifactId);
		if (this.vault.revision("EMAIL") !== hash([c.resendKey, c.from]) || !this.vault.get().emailEnabled) throw new Error("Email configuration changed during preparation.");
		if (this.store.read().jobs.some((j) => j.dedupe === dedupe || j.operationId === i.operationId)) throw new Error("Delivery was already queued during preparation. Inspect the journal.");
		const subject = (reminder ? "Payment reminder · " : "") + source.artifact.subject, body = reminder ? source.artifact.body + "\nOutstanding at preparation: AUD " + this.validInvoice(this.invoice(reminder.invoiceId)).amountDue.toFixed(2) : source.artifact.body;
		const payload = mailPayload.parse({
			from: c.from,
			to: recipient,
			subject,
			text: body,
			attachments: [{
				filename: source.artifact.documentNumber.replace(/[^A-Za-z0-9_-]/g, "-") + ".pdf",
				content: pdf.toString("base64")
			}]
		});
		const job = {
			id: randomUUID(),
			operationId: i.operationId,
			ownerId: owner.userId,
			kind: "EMAIL",
			family: i.family,
			artifactId: i.artifactId,
			sourceId: source.artifact.sourceId,
			sourceRevision: source.revision,
			label: source.artifact.documentNumber,
			recipient,
			dedupe,
			credentialRevision: this.vault.revision("EMAIL"),
			createdAt: this.now(),
			attempts: 0,
			nextAt: this.now(),
			status: "QUEUED",
			payload,
			payloadDigest: hash(payload),
			...reminder ? { reminderKey: reminder.key } : {},
			history: [{
				at: this.now(),
				event: reminder ? "REMINDER_QUEUED" : "DELIVERY_CONFIRMED"
			}]
		};
		this.audit("queue", job, "INTENT");
		this.store.change((s) => s.jobs.unshift(job));
		this.audit("queue", job, "SUCCESS");
		return job.id;
	}
	queueCheckout(raw) {
		if (this.approvedScope && !optionalWorkflows.onlineCollection) throw Error("Online collection has been removed from the approved scope.");
		const i = object({
			operationId: text,
			invoiceId: text,
			confirmed: literal(true)
		}).strict().parse(raw), owner = this.security.require("sales.payment"), c = this.vault.get();
		const prior = this.store.read().jobs.find((j) => j.operationId === i.operationId);
		if (prior) {
			if (prior.ownerId !== owner.userId) throw new Error("Operation belongs to another user.");
			if (prior.sourceId !== i.invoiceId || prior.kind !== "CHECKOUT") throw new Error("Operation ID belongs to another request.");
			return prior.id;
		}
		if (!c.checkoutEnabled || !c.stripeKey) throw new Error("Checkout is not configured and enabled.");
		const invoice = this.validInvoice(this.invoice(i.invoiceId));
		if (this.store.read().jobs.some((j) => j.kind === "CHECKOUT" && j.sourceId === i.invoiceId && ![
			"EXPIRED",
			"FAILED",
			"CANCELLED",
			"RECORDED"
		].includes(j.status))) throw new Error("Inspect or expire the existing checkout before creating another link.");
		const output = this.snapshots().preparedSalesOutputs?.artifacts.find((a) => a.kind === "INVOICE" && a.sourceId === invoice.id && a.sourceUpdatedAt === invoice.updatedAt);
		if (!output || output.issuer.currency !== "AUD") throw new Error("Prepare the current AUD invoice before creating checkout.");
		const amountMinor = Math.round(invoice.amountDue * 100);
		if (Math.abs(amountMinor - invoice.amountDue * 100) > 1e-6) throw new Error("Invoice amount is not an exact AUD cent value.");
		const payload = checkoutPayload.parse({
			invoiceId: invoice.id,
			documentNumber: invoice.documentNumber,
			amountMinor,
			currency: "aud",
			successUrl: c.successUrl,
			cancelUrl: c.cancelUrl,
			customerEmail: invoice.recipient?.accountingEmail || void 0,
			live: c.live
		});
		const job = {
			id: randomUUID(),
			operationId: i.operationId,
			ownerId: owner.userId,
			kind: "CHECKOUT",
			family: "sales",
			sourceId: invoice.id,
			sourceRevision: invoice.updatedAt,
			label: invoice.documentNumber,
			recipient: payload.customerEmail ?? "",
			dedupe: "checkout:" + invoice.id + ":" + i.operationId,
			credentialRevision: this.vault.revision("CHECKOUT"),
			createdAt: this.now(),
			attempts: 0,
			nextAt: this.now(),
			status: "QUEUED",
			amountMinor,
			payload,
			payloadDigest: hash(payload),
			history: [{
				at: this.now(),
				event: "CHECKOUT_CONFIRMED"
			}]
		};
		this.audit("queue", job, "INTENT");
		this.store.change((s) => s.jobs.unshift(job));
		this.audit("queue", job, "SUCCESS");
		return job.id;
	}
	policy(raw) {
		const i = object({
			invoiceId: text,
			enabled: boolean(),
			days: array(number().int().min(0).max(90)).min(1).max(5)
		}).strict().parse(raw), actor = this.security.require("documents.prepare");
		this.security.require("sales.read");
		if (!i.enabled) {
			this.store.change((s) => {
				const old = s.policies.find((p) => p.invoiceId === i.invoiceId);
				if (!old || old.ownerId !== actor.userId) throw new Error("Policy owner required.");
				old.enabled = false;
			});
			this.security.audit("external.reminder.policy", i.invoiceId, "SUCCESS", "documents.prepare");
			return this.view();
		}
		const invoice = this.validInvoice(this.invoice(i.invoiceId));
		if (!invoice.dueDate || !string().email().safeParse(invoice.recipient?.accountingEmail).success) throw new Error("Invoice must have a due date and saved accounting recipient.");
		requireDateKey(invoice.dueDate);
		const days = [...new Set(i.days)].sort((a, b) => a - b);
		this.security.audit("external.reminder.policy", i.invoiceId, "INTENT", "documents.prepare");
		this.store.change((s) => {
			const old = s.policies.find((p) => p.invoiceId === i.invoiceId);
			if (old && old.ownerId !== actor.userId) throw new Error("Only the policy owner can change this reminder consent.");
			if (old) {
				old.enabled = i.enabled;
				old.days = days;
			} else s.policies.push({
				id: randomUUID(),
				invoiceId: i.invoiceId,
				ownerId: actor.userId,
				enabled: i.enabled,
				days,
				createdAt: this.now()
			});
		});
		this.security.audit("external.reminder.policy", i.invoiceId, "SUCCESS", "documents.prepare");
		return this.view();
	}
	requestReceipt(raw) {
		const i = object({
			id: text,
			bankAccountId: text,
			confirmed: literal(true)
		}).strict().parse(raw);
		this.security.require("sales.payment");
		const j = this.get(i.id);
		if (!this.actionable(j) || j.kind !== "CHECKOUT" || j.status !== "PAID_REVIEW") throw new Error("Choose a verified paid checkout owned by your session.");
		if (!this.snapshots().bankAccounts.bankAccounts.find((b) => b.id === i.bankAccountId && b.active && b.currency === "AUD")) throw new Error("Choose an active AUD merchant clearing bank account.");
		this.audit("receipt.request", j, "INTENT");
		this.update(j.id, {
			recordBankId: i.bankAccountId,
			nextAt: this.now()
		}, "RECEIPT_CONFIRMATION");
		return this.view();
	}
	retry(raw) {
		const { id } = object({ id: text }).strict().parse(raw), j = this.get(id);
		if (!this.actionable(j)) throw new Error("Only the authorized job owner may retry.");
		if (j.status === "RECORDED") throw new Error("Receipt is already recorded; inspect the ledger and audit.");
		if (j.providerId) {
			this.update(id, { nextAt: this.now() }, "STATUS_REFRESH");
			return;
		}
		if (![
			"RETRY",
			"FAILED",
			"UNCERTAIN"
		].includes(j.status) || j.firstAttempt === void 0 || this.now() - j.firstAttempt >= 828e5) throw new Error("Provider outcome must be reconciled manually; a fresh idempotency key is not permitted.");
		this.update(id, {
			status: "RETRY",
			nextAt: this.now()
		}, "RETRY_REQUESTED");
	}
	cancel(raw) {
		const { id } = object({ id: text }).strict().parse(raw), j = this.get(id);
		if (!this.actionable(j) || j.attempts || j.providerId || j.status !== "QUEUED") throw new Error("Only an unattempted queued job can be cancelled locally. Provider work requires external reconciliation.");
		this.audit("cancel", j, "INTENT");
		this.update(id, { status: "CANCELLED" }, "CANCELLED_BEFORE_ATTEMPT");
		this.audit("cancel", j, "SUCCESS");
	}
	checkoutUrl(raw) {
		const { id } = object({ id: text }).strict().parse(raw), j = this.get(id);
		if (j.kind !== "CHECKOUT" || !j.url || j.status !== "OPEN") throw new Error("An open checkout link is required.");
		return safeCheckoutUrl(j.url);
	}
	async reminders() {
		const p = this.security.principal(), c = this.vault.get();
		if (!hasPermission(p, "documents.prepare") || !hasPermission(p, "sales.read") || !c.emailEnabled) return;
		const today = businessDateKey(new Date(this.now()).toISOString());
		const policies = this.store.read().policies.filter((policy) => policy.enabled && policy.ownerId === p?.userId);
		if (!policies.length) return;
		const start = this.reminderCursor % policies.length, batch = Array.from({ length: Math.min(20, policies.length) }, (_, i) => policies[(start + i) % policies.length]);
		this.reminderCursor = (start + batch.length) % policies.length;
		for (const policy of batch) {
			const invoice = this.invoice(policy.invoiceId);
			if (![
				"ISSUED",
				"PARTIALLY_PAID",
				"OVERDUE"
			].includes(invoice.status) || invoice.amountDue <= 0) continue;
			const age = Math.floor((Date.parse(today + "T00:00:00Z") - Date.parse(invoice.dueDate + "T00:00:00Z")) / 864e5), stage = policy.days.filter((d) => d <= age).at(-1);
			if (stage === void 0) continue;
			const jobs = this.store.read().jobs;
			if (jobs.some((j) => j.recipient === invoice.recipient?.accountingEmail && [
				"BOUNCED",
				"COMPLAINED",
				"SUPPRESSED"
			].includes(j.status))) continue;
			const key = "reminder:" + policy.id + ":" + invoice.dueDate + ":" + stage;
			if (jobs.some((j) => j.dedupe === key) || jobs.some((j) => j.sourceId === invoice.id && (j.status === "PAID_REVIEW" || j.kind === "EMAIL" && [
				"QUEUED",
				"PROCESSING",
				"RETRY",
				"UNCERTAIN"
			].includes(j.status))) || jobs.some((j) => j.reminderKey && j.sourceId === invoice.id && businessDateKey(new Date(j.createdAt).toISOString()) === today)) continue;
			const prepared = this.business.command({
				repository: "preparedSalesOutputs",
				method: "prepare",
				args: [{
					operationId: "prep:" + hash(key).slice(0, 60),
					sourceId: invoice.id,
					kind: "INVOICE",
					expectedUpdatedAt: invoice.updatedAt
				}]
			}).result;
			await this.queueMail({
				operationId: "mail:" + hash(key).slice(0, 60),
				artifactId: prepared.id,
				family: "sales",
				confirmed: true
			}, {
				key,
				invoiceId: invoice.id
			});
			return;
		}
	}
	async tick() {
		if (this.running || this.blocked || !this.security.principal()) return;
		this.running = true;
		try {
			this.recoveryCheck();
			const config = this.vault.get();
			const data = this.store.read(), job = data.jobs.find((j) => this.actionable(j) && j.nextAt <= this.now() && (j.kind === "EMAIL" && config.emailEnabled || j.kind === "CHECKOUT" && config.checkoutEnabled) && (activePost.has(j.status) || j.providerId && [
				"ACCEPTED",
				"DELAYED",
				"DELIVERED",
				"OPEN",
				"PAID_REVIEW"
			].includes(j.status) && this.now() - j.createdAt < 2592e6));
			if (!job) {
				await this.reminders();
				return;
			}
			if (job.credentialRevision !== this.vault.revision(job.kind)) {
				this.update(job.id, {
					error: "Credentials or sender changed. Reconcile under the original provider account.",
					nextAt: this.now() + 36e5
				});
				return;
			}
			if (job.providerId) {
				await this.poll(job, config);
				return;
			}
			if (job.firstAttempt !== void 0 && this.now() - job.firstAttempt >= 828e5) {
				this.update(job.id, {
					status: "UNCERTAIN",
					error: "Idempotency retention safety window expired. Check the provider; do not resend."
				}, "RECONCILIATION_REQUIRED");
				return;
			}
			try {
				if (job.kind === "EMAIL") this.sourceArtifact(job.family, job.artifactId);
				else {
					const i = this.validInvoice(this.invoice(job.sourceId));
					if (i.updatedAt !== job.sourceRevision || Math.round(i.amountDue * 100) !== job.amountMinor) throw new Error("Invoice changed before checkout creation.");
				}
			} catch {
				this.update(job.id, {
					status: job.attempts ? "UNCERTAIN" : "CANCELLED",
					error: job.attempts ? "Source changed after a provider attempt. Reconcile its outcome; do not send a new job." : "Source changed or is no longer eligible. Prepare and review current data."
				}, "STALE_SOURCE_BLOCKED");
				return;
			}
			this.update(job.id, {
				status: "PROCESSING",
				attempts: job.attempts + 1,
				firstAttempt: job.firstAttempt ?? this.now()
			}, "PROVIDER_ATTEMPT");
			this.audit("provider.create", job, "INTENT");
			try {
				const reply = await this.providers.create(job, config, "htt-" + data.id + "-" + job.id);
				const payload = job.kind === "EMAIL" && job.payload ? {
					...mailPayload.parse(job.payload),
					attachments: mailPayload.parse(job.payload).attachments.map((a) => ({
						...a,
						content: ""
					}))
				} : job.payload;
				this.update(job.id, {
					providerId: reply.id,
					url: reply.url,
					status: job.kind === "EMAIL" ? "ACCEPTED" : "OPEN",
					error: void 0,
					nextAt: this.now() + 6e4,
					payload
				}, "PROVIDER_ACCEPTED");
				this.audit("provider.create", job, "SUCCESS");
			} catch (error) {
				if (!(error instanceof ProviderFault)) throw error;
				const current = this.get(job.id), knownReject = /^PROVIDER_HTTP_4(?!09|29)\d{2}$/.test(error.code), retry = error.retryable && current.attempts < 5;
				this.update(job.id, {
					status: retry ? "RETRY" : knownReject ? "FAILED" : "UNCERTAIN",
					error: error.code,
					nextAt: this.now() + Math.min(6e4 * 2 ** current.attempts, 36e5)
				}, retry ? "RETRY_SCHEDULED" : "PROVIDER_REVIEW");
				this.audit("provider.create", job, "FAILED");
			}
		} catch (error) {
			this.blocked = error instanceof ProviderFault ? error.code : error instanceof Error ? error.message : "Integration worker stopped. Inspect local audit and preserve the profile.";
		} finally {
			this.running = false;
		}
	}
	async poll(job, config) {
		try {
			const evidence = await this.providers.poll(job, config);
			if (job.recordBankId && evidence.status !== "PAID_REVIEW") throw new ProviderFault("PAYMENT_STATE_CHANGED_RECONFIRM_REQUIRED");
			let patch = {
				status: evidence.status,
				nextAt: this.now() + 9e5,
				error: void 0
			};
			if (job.kind === "CHECKOUT" && evidence.status === "PAID_REVIEW" && job.recordBankId) {
				if (!this.actionable(job)) throw new ProviderFault("SIGN_IN_AGAIN_TO_RECORD");
				let payment = this.receipt(job);
				if (!payment) {
					const invoice = this.validInvoice(this.invoice(job.sourceId));
					if (Math.round(invoice.amountDue * 100) < job.amountMinor) throw new ProviderFault("REMAINING_BALANCE_REQUIRES_REVIEW");
					if (!this.snapshots().bankAccounts.bankAccounts.find((b) => b.id === job.recordBankId && b.active && b.currency === "AUD") || !("paidAt" in evidence) || typeof evidence.paidAt !== "number" || evidence.paidAt > this.now() + 6e4) throw new ProviderFault("CLEARING_OR_PAYMENT_DATE_REQUIRES_REVIEW");
					this.update(job.id, { status: "RECORDING" }, "VERIFIED_RECEIPT_POSTING");
					this.audit("receipt", job, "INTENT");
					payment = this.business.command({
						repository: "sales",
						method: "recordInvoicePayment",
						args: [{
							invoiceId: job.sourceId,
							amount: job.amountMinor / 100,
							paymentDate: businessDateKey(new Date(evidence.paidAt).toISOString()),
							method: "CARD",
							bankAccountId: job.recordBankId,
							reference: "Stripe " + job.providerId,
							notes: "Gross verified Stripe checkout; reconcile fees and bank payout separately.",
							operationId: this.receiptOperation(job)
						}]
					}).result;
				}
				patch = {
					...patch,
					status: "RECORDED",
					receiptId: payment.id,
					recordBankId: void 0
				};
				this.audit("receipt", job, "SUCCESS");
			}
			const changed = patch.status !== job.status;
			this.update(job.id, patch, changed ? "PROVIDER_" + patch.status : void 0);
			if (changed) this.audit("provider.status", job, "SUCCESS");
		} catch (error) {
			if (error instanceof ProviderFault) {
				this.update(job.id, {
					error: error.code,
					nextAt: this.now() + 9e5,
					...job.recordBankId ? {
						status: "PAID_REVIEW",
						recordBankId: void 0
					} : {}
				}, "PROVIDER_CHECK_FAILED");
				return;
			}
			if (job.recordBankId) {
				this.update(job.id, {
					status: "PAID_REVIEW",
					recordBankId: void 0,
					error: "Receipt could not be recorded. Inspect the accounting period, payment operation and audit before retrying.",
					nextAt: this.now() + 9e5
				}, "RECEIPT_REVIEW");
				return;
			}
			throw error;
		}
	}
};
//#endregion
//#region electron/integrations/outputPdf.ts
async function renderDeliveryPdf(family, raw) {
	const statement = statementSchema.safeParse(raw);
	const a = raw, html = statement.success ? renderStatement(statement.data) : family === "sales" ? renderOutputHtml(a) : renderPurchaseOutput(a);
	const window = new BrowserWindow({
		show: false,
		webPreferences: {
			sandbox: true,
			contextIsolation: true,
			nodeIntegration: false,
			javascript: false,
			webSecurity: true,
			partition: "delivery-pdf-" + randomUUID()
		}
	});
	window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
	window.webContents.session.webRequest.onBeforeRequest((details, callback) => callback({ cancel: !details.url.startsWith("data:") && details.url !== "about:blank" }));
	let timer;
	try {
		return await Promise.race([(async () => {
			await window.loadURL("data:text/html;base64," + Buffer.from(html).toString("base64"));
			return window.webContents.printToPDF({
				pageSize: a.template.paper,
				printBackground: true,
				preferCSSPageSize: true
			});
		})(), new Promise((_, reject) => {
			timer = setTimeout(() => reject(/* @__PURE__ */ new Error("PDF rendering timed out.")), 2e4);
		})]);
	} catch {
		throw new Error("PDF rendering failed. No delivery was queued.");
	} finally {
		clearTimeout(timer);
		if (!window.isDestroyed()) window.destroy();
	}
}
//#endregion
//#region electron/security/businessHost.ts
var BusinessHost = class {
	approvedScope = false;
	restrictToApprovedScope() {
		this.approvedScope = true;
	}
	values = {};
	initialized = false;
	automationEngine;
	scanningRecurring = false;
	workspaceDefaults = {};
	blocked = false;
	lastCommandId;
	assertPeriod = () => {
		throw new Error("Period controls not initialized.");
	};
	prepared;
	path;
	security;
	constructor(path, security) {
		this.path = path;
		this.security = security;
	}
	async initialize(legacy = {}) {
		if (this.blocked) throw new Error("Restart the desktop application before reopening business data.");
		if (this.initialized) return;
		if (!this.security.principal()) throw new Error("Login required.");
		let migrationSource;
		let saved;
		if (existsSync(this.path)) {
			saved = parseDatabase(readFileSync(this.path, "utf8"));
			if (saved.schemaVersion !== 33) {
				migrationSource = structuredClone(saved);
				migratePeriodSnapshot(saved);
			}
			this.values = saved.storage;
		} else {
			this.security.require("users.manage");
			if (!legacy || typeof legacy !== "object" || Object.keys(legacy).length > 1e3) throw new Error("Invalid legacy local data.");
			for (const [key, value] of Object.entries(legacy)) if (!key.startsWith("htt") || typeof value !== "string" || value.length > 5e7) throw new Error("Invalid legacy local data.");
			const backup = join(dirname(this.path), "legacy-profile-backup-v1.json");
			if (!existsSync(backup)) atomicJson(backup, {
				schemaVersion: 1,
				capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
				storage: legacy
			});
			this.values = { ...legacy };
			this.security.audit("business.import", "local-desktop-profile", "INTENT", "users.manage");
		}
		const store = {
			get length() {
				return Object.keys(thisHost.values).length;
			},
			key: (index) => Object.keys(this.values)[index] ?? null,
			getItem: (key) => this.values[key] ?? null,
			setItem: (key, value) => {
				this.values[key] = String(value);
			},
			removeItem: (key) => {
				delete this.values[key];
			},
			clear: () => {
				this.values = {};
			}
		};
		const thisHost = this;
		Object.defineProperty(globalThis, "__HTT_MAIN_HOST__", {
			configurable: true,
			value: true
		});
		Object.defineProperty(globalThis, "localStorage", {
			configurable: true,
			value: store
		});
		Object.defineProperty(globalThis, "window", {
			configurable: true,
			value: { localStorage: store }
		});
		const engine = await import("./businessEngine-ptasoFrJ.js");
		this.workspaceDefaults = engine.workspaceDefaults;
		if (saved) {
			migrateWorkspaceSnapshot(saved, this.workspaceDefaults);
			validateRepositories(saved.repositories, snapshotRepositories());
			validateRegisteredSnapshots(saved.repositories);
			restoreRepositories(saved.repositories);
			this.lastCommandId = saved.lastCommandId;
		}
		engine.initialize(() => this.security.principal());
		this.automationEngine = engine;
		this.assertPeriod = engine.assertPostingPeriod;
		configureDocumentPurgeBackup(() => {
			if (!this.security.require("users.manage").roles.includes("ADMIN") || !this.initialized || this.blocked) throw new Error("Permanent purge requires a healthy ADMIN desktop session.");
			const repositories = snapshotRepositories();
			validateRegisteredSnapshots(repositories);
			const database = sealDatabase({
				storage: structuredClone(this.values),
				repositories,
				lastCommandId: this.lastCommandId
			});
			const directory = join(dirname(this.path), "recycle-backups"), id = randomUUID(), fileName = `pre-purge-${id}.json`;
			mkdirSync(directory, {
				recursive: true,
				mode: 448
			});
			const path = join(directory, fileName);
			atomicJson(path, database);
			const text = readFileSync(path, "utf8");
			const verified = parseDatabase(text);
			validateRepositories(verified.repositories, repositories);
			validateRegisteredSnapshots(verified.repositories);
			if (JSON.stringify(verified) !== JSON.stringify(database)) throw new Error("Pre-purge backup verification failed.");
			return {
				id,
				fileName,
				sha256: createHash("sha256").update(text).digest("hex"),
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			};
		});
		configureYearEndBackup((action) => {
			this.security.require(action === "CLOSE" ? "accounting.periods" : "accounting.reopen");
			if (!this.initialized || this.blocked) throw new Error("Healthy desktop session required for year-end backup.");
			const repositories = snapshotRepositories();
			validateRegisteredSnapshots(repositories);
			const snapshot = sealDatabase({
				storage: structuredClone(this.values),
				repositories,
				lastCommandId: this.lastCommandId
			}), directory = join(dirname(this.path), "year-end-backups"), fileName = `pre-year-end-${action.toLowerCase()}-${randomUUID()}.json`;
			mkdirSync(directory, {
				recursive: true,
				mode: 448
			});
			const target = join(directory, fileName);
			atomicJson(target, snapshot);
			const text = readFileSync(target, "utf8"), verified = parseDatabase(text);
			validateRepositories(verified.repositories, snapshot.repositories);
			validateRegisteredSnapshots(verified.repositories);
			if (JSON.stringify(snapshot) !== JSON.stringify(verified)) throw new Error("Year-end backup verification failed.");
			return {
				fileName,
				sha256: createHash("sha256").update(text).digest("hex"),
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			};
		});
		if (migrationSource) {
			atomicJson(join(dirname(this.path), `pre-migration-v${saved.schemaVersion}-${randomUUID()}.json`), migrationSource);
			this.persist();
			this.security.audit("business.migrate.v33", "local-desktop-profile", "SUCCESS", "users.manage");
		}
		if (!saved) {
			this.persist();
			this.security.audit("business.import", "local-desktop-profile", "SUCCESS", "users.manage");
		}
		for (const pending of this.security.pendingBusinessCommands()) this.security.audit(`recovery.${pending.action}`, pending.resourceId, pending.commandId === this.lastCommandId ? "SUCCESS" : "FAILED", pending.permission, pending.commandId);
		this.initialized = true;
	}
	scanRecurringDue() {
		const report = {
			processed: 0,
			generated: 0,
			failed: 0,
			remaining: 0
		};
		const principal = this.security.principal(), engine = this.automationEngine;
		if (this.blocked) throw new Error("Business writes blocked; restart and inspect local audit.");
		if (!this.initialized || !principal || !engine || this.scanningRecurring) return report;
		this.scanningRecurring = true;
		try {
			for (let i = 0; i < 20; i++) {
				const candidate = engine.dueRecurringCandidates(principal).filter((c) => !this.approvedScope || optionalWorkflows.directBankSpend || c.kind !== "BANK")[0];
				if (!candidate) break;
				const kind = candidate.kind;
				report.processed++;
				try {
					this.command({
						repository: "recurringAutomation",
						method: "execute",
						args: [{
							kind,
							id: candidate.id,
							expectedRevision: candidate.revision,
							date: candidate.nextDate
						}]
					});
					report.generated++;
				} catch (error) {
					if (this.blocked) throw error;
					const ticket = engine.prepareRecurringFailure(kind, candidate.id, candidate.nextDate, error instanceof Error ? error.message : "Generation failed.");
					this.command({
						repository: "recurringAutomation",
						method: "recordFailure",
						args: [{ ticket }]
					});
					report.failed++;
				}
			}
			report.remaining = engine.dueRecurringCandidates(principal).filter((c) => !this.approvedScope || optionalWorkflows.directBankSpend || c.kind !== "BANK").length;
			return report;
		} finally {
			this.scanningRecurring = false;
		}
	}
	persist(commandId = this.lastCommandId) {
		atomicJson(this.path, sealDatabase({
			storage: this.values,
			repositories: snapshotRepositories(),
			lastCommandId: commandId
		}));
		this.lastCommandId = commandId;
	}
	exportBackup() {
		this.security.require("users.manage");
		if (!this.initialized || this.blocked) throw new Error("Backup requires healthy initialized business data.");
		const database = parseDatabase(readFileSync(this.path, "utf8"));
		validateRepositories(database.repositories, snapshotRepositories());
		validateRegisteredSnapshots(database.repositories);
		return sealDatabase({
			storage: database.storage,
			repositories: database.repositories,
			lastCommandId: database.lastCommandId
		});
	}
	prepareRestore(text) {
		const actor = this.security.require("users.manage");
		this.prepared = void 0;
		const database = parseDatabase(text);
		migratePeriodSnapshot(database);
		if (this.initialized) {
			migrateWorkspaceSnapshot(database, this.workspaceDefaults);
			validateRepositories(database.repositories, snapshotRepositories());
			validateRegisteredSnapshots(database.repositories);
		}
		const token = randomUUID();
		this.prepared = {
			token,
			actor: actor.userId,
			database,
			revision: this.lastCommandId,
			expires: Date.now() + 3e5
		};
		const counts = Object.fromEntries(Object.entries(database.repositories).map(([name, value]) => [name, Array.isArray(value) ? value.length : Object.values(value).reduce((n, rows) => n + (Array.isArray(rows) ? rows.length : 0), 0)]));
		return {
			token,
			schemaVersion: database.schemaVersion,
			savedAt: database.schemaVersion !== 1 ? database.savedAt : "Legacy v1",
			counts
		};
	}
	async restoreBackup(token) {
		const actor = this.security.require("users.manage"), prepared = this.prepared;
		this.prepared = void 0;
		if (!prepared || prepared.token !== token || prepared.actor !== actor.userId || prepared.revision !== this.lastCommandId || prepared.expires < Date.now()) throw new Error("Restore preview expired; select the backup again.");
		Object.defineProperty(globalThis, "__HTT_MAIN_HOST__", {
			configurable: true,
			value: true
		});
		if (!this.initialized) {
			const scratch = /* @__PURE__ */ new Map();
			const store = {
				getItem: (key) => scratch.get(key) ?? null,
				setItem: (key, value) => scratch.set(key, String(value)),
				removeItem: (key) => scratch.delete(key),
				clear: () => scratch.clear()
			};
			Object.defineProperty(globalThis, "localStorage", {
				configurable: true,
				value: store
			});
			Object.defineProperty(globalThis, "window", {
				configurable: true,
				value: { localStorage: store }
			});
		}
		const engine = await import("./businessEngine-ptasoFrJ.js");
		migrateWorkspaceSnapshot(prepared.database, engine.workspaceDefaults);
		validateRepositories(prepared.database.repositories, snapshotRepositories());
		validateRegisteredSnapshots(prepared.database.repositories);
		if (this.security.require("users.manage").userId !== actor.userId) throw new Error("Restore session changed.");
		const pending = this.security.pendingBusinessCommands();
		if (pending.length) {
			const current = parseDatabase(readFileSync(this.path, "utf8"));
			for (const row of pending) this.security.audit(`recovery.${row.action}`, row.resourceId, row.commandId === current.lastCommandId ? "SUCCESS" : "FAILED", row.permission, row.commandId);
		}
		const commandId = randomUUID();
		this.security.audit("business.restore", "business-data-only", "INTENT", "users.manage", commandId);
		if (existsSync(this.path)) {
			const folder = join(dirname(this.path), "recovery-backups");
			mkdirSync(folder, {
				recursive: true,
				mode: 448
			});
			const fd = openSync(join(folder, `before-restore-${commandId}.json`), "wx", 384);
			try {
				writeFileSync(fd, readFileSync(this.path));
				fsyncSync(fd);
			} finally {
				closeSync(fd);
			}
			const dir = openSync(folder, "r");
			try {
				fsyncSync(dir);
			} finally {
				closeSync(dir);
			}
		}
		const database = sealDatabase({
			storage: prepared.database.storage,
			repositories: prepared.database.repositories,
			lastCommandId: commandId
		});
		this.blocked = true;
		try {
			atomicJson(this.path, database);
		} catch {
			throw new Error("Restore commit could not be confirmed. Restart and inspect before retry.");
		}
		this.security.audit("business.restore", "business-data-only", "SUCCESS", "users.manage", commandId);
	}
	view() {
		const principal = this.security.principal();
		if (!principal || !this.initialized) throw new Error("Login and desktop data initialization required.");
		const storage = hasPermission(principal, "audit.read") ? Object.fromEntries(Object.entries(this.values).filter(([key]) => key === "htt:financial-operations:v1" || key.startsWith("htt.purchasePosting."))) : {};
		return {
			repositories: snapshotForPrincipal(principal),
			storage
		};
	}
	command(input) {
		if (this.blocked || !this.initialized) throw new Error("Business writes blocked; restart and inspect local audit.");
		if (!input || typeof input.repository !== "string" || typeof input.method !== "string" || !Array.isArray(input.args) || input.args.length > 20) throw new Error("Invalid business command.");
		let command;
		try {
			command = resolveCommand(input.repository, input.method);
		} catch (error) {
			this.security.audit("command.denied", `${input.repository}.${input.method}`.slice(0, 200), "DENIED");
			throw error;
		}
		const actor = this.security.require(command.permission);
		const args = structuredClone(input.args);
		this.automationEngine?.assertBankInstructionCommand(input.repository, input.method, args);
		if ([
			"sales",
			"fulfilments",
			"goodsReceipts",
			"supplierBills",
			"supplierPayments",
			"supplierCredits",
			"bankTransactions",
			"bankReconciliations"
		].includes(input.repository) && args[0] && typeof args[0] === "object") {
			const dates = [
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
			];
			const request = args[0];
			try {
				for (const key of dates) if (request[key] !== void 0) {
					if (typeof request[key] !== "string") throw new Error("Invalid posting date.");
					this.assertPeriod(request[key]);
				}
			} catch (error) {
				this.security.audit("period.denied", `${input.repository}.${input.method}`, "DENIED", command.permission);
				throw error;
			}
		}
		if (input.repository === "journals") {
			const first = args[0];
			if (input.method === "post" && (first?.sourceType !== "MANUAL_JOURNAL" || first.sourceId)) throw new Error("System journals must be posted through their business source.");
			if (input.method === "reverse") {
				if (snapshotRepositories().journals.journalEntries.find((entry) => entry.id === first?.journalEntryId)?.sourceType !== "MANUAL_JOURNAL") throw new Error("System journals must be reversed through their business source.");
			}
		}
		if (input.repository === "supplierPayments" && input.method === "reverse") {
			if (snapshotRepositories().paymentBatches.batches.some((r) => r.status === "POSTED" && r.paymentIds.includes(args[0]))) throw new Error("Reverse this supplier payment through its payment batch.");
		}
		if (input.repository === "sales" && input.method === "reverseInvoicePayment") {
			if (snapshotRepositories().customerSettlements.receipts.some((r) => r.status === "POSTED" && r.paymentIds.includes(args[0]))) throw new Error("Reverse this payment through its grouped customer receipt.");
		}
		if (input.repository === "salesRecovery" && args[0] && typeof args[0] === "object") {
			const request = args[0];
			if (input.method === "recordSalesManualReview") request.operator = actor.userId;
			if (input.method === "closeVerifiedSalesReview") request.approver = actor.userId;
		}
		if ([
			"voidInvoice",
			"voidCreditNote",
			"void",
			"markVoid",
			"voidCredit"
		].includes(input.method) && [
			"sales",
			"supplierBills",
			"supplierCredits"
		].includes(input.repository)) {
			const s = snapshotRepositories(), id = typeof args[0] === "string" ? args[0] : args[0]?.invoiceId ?? args[0]?.creditNoteId ?? args[0]?.supplierCreditId ?? args[0]?.supplierBillId;
			if ([
				...s.sales.invoices,
				...s.customerCredits.creditNotes,
				...s.supplierBills.supplierBills,
				...s.supplierCredits.supplierCredits
			].some((d) => d.id === id && d.openingBalanceImportId)) throw new Error("Historical opening documents must be corrected through the opening batch reversal.");
		}
		const commandId = randomUUID(), action = `${input.repository}.${input.method}`;
		const resource = typeof args[0] === "string" ? args[0].slice(0, 200) : String(args[0]?.id ?? args[0]?.invoiceId ?? input.repository).slice(0, 200);
		this.security.audit(action, resource, "INTENT", command.permission, commandId);
		const before = snapshotRepositories(), storedBefore = structuredClone(this.values);
		let result;
		try {
			if (this.approvedScope) assertApprovedDesktopCommand({
				...input,
				args
			});
			result = command.execute(args);
			if (input.repository === "bankStatements" && ["importRows", "importCsv"].includes(input.method)) {
				const previous = new Set(before.bankStatements.lines.map((l) => l.id));
				const added = snapshotRepositories().bankStatements.lines.filter((l) => !previous.has(l.id)).map((l) => l.id);
				this.automationEngine?.classifyImportedBankLines(added, commandId);
			}
			if (input.repository === "sales" && input.method === "createInvoiceFromOrder") this.assertPeriod(result.documentDate);
			this.automationEngine?.assertYearEndIntegrity();
			if (result instanceof Promise) throw new Error("Business commands must be synchronous.");
		} catch (error) {
			this.values = storedBefore;
			restoreRepositories(before);
			this.security.audit(action, resource, "FAILED", command.permission, commandId);
			throw error;
		}
		try {
			this.persist(commandId);
		} catch (error) {
			this.values = storedBefore;
			restoreRepositories(before);
			this.blocked = true;
			throw new Error(`Business commit ${commandId} could not be confirmed: ${error instanceof Error ? error.message : String(error)}. Restart and review before retry.`);
		}
		try {
			this.security.audit(action, resource, "SUCCESS", command.permission, commandId);
		} catch {
			this.blocked = true;
			throw new Error(`Business command ${commandId} committed, but final audit confirmation failed. Do not repeat it; restart and review.`);
		}
		return {
			result,
			view: this.view()
		};
	}
};
//#endregion
//#region electron/security/registerSecurityIpc.ts
function registerSecurityIpc(directory, getWindow, onRecurringStopped = () => {}) {
	configureCaptureHelper(join(app.isPackaged ? process.resourcesPath : app.getAppPath(), app.isPackaged ? "ocr" : "dist-ocr", "htt-ocr"));
	const security = new LocalSecurity(join(directory, "security-v1.json"));
	const business = new BusinessHost(join(directory, "business-v1.json"), security);
	business.restrictToApprovedScope();
	let integrations, integrationError = "";
	try {
		integrations = new ExternalServices(new IntegrationStore(directory), new IntegrationVault(directory, {
			available: () => safeStorage.isEncryptionAvailable() && (process.platform !== "linux" || safeStorage.getSelectedStorageBackend() !== "basic_text"),
			encrypt: (value) => safeStorage.encryptString(value),
			decrypt: (value) => safeStorage.decryptString(value)
		}), security, business, renderDeliveryPdf);
		integrations.restrictToApprovedScope();
	} catch {
		integrationError = "Integration journal is unavailable. Preserve the complete profile for recovery; business data has not been reset.";
	}
	let feeds, feedError = "";
	try {
		feeds = new BankFeeds(new FeedStore(directory), new FeedVault(directory, {
			available: () => safeStorage.isEncryptionAvailable() && (process.platform !== "linux" || safeStorage.getSelectedStorageBackend() !== "basic_text"),
			encrypt: (value) => safeStorage.encryptString(value),
			decrypt: (value) => safeStorage.decryptString(value)
		}), security, business);
	} catch {
		feedError = "Bank feed journal is unavailable. Preserve the full profile; business data has not been reset.";
	}
	let payrollFilings, payrollFilingError = "";
	try {
		payrollFilings = new PayrollFilings(new FilingStore(directory, {
			available: () => safeStorage.isEncryptionAvailable() && (process.platform !== "linux" || safeStorage.getSelectedStorageBackend() !== "basic_text"),
			encrypt: (value) => safeStorage.encryptString(value),
			decrypt: (value) => safeStorage.decryptString(value)
		}), security, business);
	} catch {
		payrollFilingError = "Payroll filing journal is unavailable. Preserve the full profile and OS credentials; business data has not been reset.";
	}
	let busy = false;
	ipcMain.on("security:request", async (event, action, raw) => {
		const owner = getWindow();
		if (!owner || event.sender !== owner.webContents || event.senderFrame !== owner.webContents.mainFrame) {
			event.returnValue = {
				ok: false,
				error: "Untrusted desktop sender."
			};
			return;
		}
		if (busy) {
			event.returnValue = {
				ok: false,
				error: "A desktop operation is already running."
			};
			return;
		}
		busy = true;
		try {
			if (typeof action !== "string" || JSON.stringify(raw ?? null).length > 6e7) throw new Error("Invalid desktop request.");
			const input = raw ?? {};
			let value;
			if (action.startsWith("payrollFilings.")) {
				if (!payrollFilings) throw new Error(payrollFilingError);
				let reply;
				switch (action) {
					case "payrollFilings.view":
						reply = payrollFilings.view();
						break;
					case "payrollFilings.configure":
						reply = payrollFilings.configure(input);
						break;
					case "payrollFilings.saveProfile":
						reply = payrollFilings.saveProfile(input);
						break;
					case "payrollFilings.preflight":
						reply = payrollFilings.preflight(input);
						break;
					case "payrollFilings.prepare":
						reply = payrollFilings.prepare(input);
						break;
					case "payrollFilings.preview":
						reply = payrollFilings.preview(input);
						break;
					case "payrollFilings.declare":
						reply = payrollFilings.declare(input);
						break;
					case "payrollFilings.manualReview":
						reply = payrollFilings.manualReview(input);
						break;
					case "payrollFilings.refresh":
						reply = payrollFilings.refresh(input);
						break;
					case "payrollFilings.cancel":
						reply = payrollFilings.cancel(input);
						break;
					default: throw new Error("Unknown payroll filing action.");
				}
				event.returnValue = {
					ok: true,
					value: reply
				};
				return;
			}
			if (action.startsWith("bankFeeds.")) {
				if (!feeds) throw new Error(feedError);
				let reply;
				switch (action) {
					case "bankFeeds.view":
						reply = feeds.view();
						break;
					case "bankFeeds.configure":
						reply = feeds.configure(input);
						break;
					case "bankFeeds.request":
						reply = feeds.request(input);
						break;
					case "bankFeeds.cancelRequest":
						reply = feeds.cancelRequest();
						break;
					case "bankFeeds.openAuthorization":
						await shell.openExternal(feeds.authorizationUrl());
						reply = { opened: true };
						break;
					case "bankFeeds.map":
						reply = feeds.map(input);
						break;
					case "bankFeeds.enabled":
						reply = feeds.setEnabled(input);
						break;
					case "bankFeeds.sync":
						reply = feeds.sync(input);
						break;
					case "bankFeeds.renew":
						reply = feeds.renew(input);
						break;
					case "bankFeeds.retire":
						reply = feeds.retire(input);
						break;
					case "bankFeeds.import":
						reply = {
							feed: feeds.importBatch(input),
							view: business.view()
						};
						break;
					default: throw new Error("Unknown bank feed action.");
				}
				event.returnValue = {
					ok: true,
					value: reply
				};
				return;
			}
			if (action.startsWith("integrations.")) {
				if (!integrations) throw new Error(integrationError);
				let reply;
				switch (action) {
					case "integrations.view":
						reply = integrations.view();
						break;
					case "integrations.configure":
						reply = integrations.configure(input);
						break;
					case "integrations.preview":
						reply = integrations.preview(input);
						break;
					case "integrations.statement":
						reply = { id: integrations.prepareStatement(input) };
						break;
					case "integrations.mail":
						reply = { id: await integrations.queueMail(input) };
						break;
					case "integrations.checkout":
						reply = { id: integrations.queueCheckout(input) };
						break;
					case "integrations.reminders":
						reply = integrations.policy(input);
						break;
					case "integrations.retry":
						integrations.retry(input);
						reply = integrations.view();
						break;
					case "integrations.cancel":
						integrations.cancel(input);
						reply = integrations.view();
						break;
					case "integrations.receipt":
						reply = integrations.requestReceipt(input);
						break;
					case "integrations.run":
						integrations.view();
						integrations.tick();
						reply = integrations.view();
						break;
					case "integrations.open":
						await shell.openExternal(integrations.checkoutUrl(input));
						reply = { opened: true };
						break;
					default: throw new Error("Unknown integration action.");
				}
				event.returnValue = {
					ok: true,
					value: reply
				};
				return;
			}
			switch (action) {
				case "status":
					value = security.status();
					break;
				case "setup":
					value = security.setup(input);
					break;
				case "login":
					value = security.login(input);
					break;
				case "logout":
					value = security.logout();
					break;
				case "users.list":
					value = security.listUsers();
					break;
				case "users.create":
					value = security.createUser(input);
					break;
				case "users.update":
					value = security.updateUser(input);
					break;
				case "password.change":
					value = security.changePassword(input);
					break;
				case "audit.list":
					value = security.listAudit(input);
					break;
				case "business.bootstrap":
					await business.initialize(input.legacyStorage);
					business.scanRecurringDue();
					value = business.view();
					break;
				case "business.backup.save": {
					security.require("users.manage");
					const choice = await dialog.showSaveDialog(owner, {
						title: "Save business backup",
						defaultPath: `HTT-Business-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`,
						filters: [{
							name: "HTT business backup",
							extensions: ["json"]
						}]
					});
					if (choice.canceled || !choice.filePath) {
						value = { saved: false };
						break;
					}
					const target = relative(realpathSync(directory), join(realpathSync(dirname(choice.filePath)), basename(choice.filePath)));
					if (!target || !target.startsWith(".." + sep) && target !== ".." && !isAbsolute(target)) throw new Error("Choose a backup location outside the active local data directory.");
					const snapshot = business.exportBackup();
					security.audit("business.backup", "business-data-only", "INTENT", "users.manage");
					try {
						atomicJson(choice.filePath, snapshot);
					} catch (error) {
						security.audit("business.backup", "business-data-only", "FAILED", "users.manage");
						throw error;
					}
					security.audit("business.backup", "business-data-only", "SUCCESS", "users.manage");
					value = { saved: true };
					break;
				}
				case "business.restore.preview": {
					security.require("users.manage");
					const choice = await dialog.showOpenDialog(owner, {
						title: "Select business backup",
						properties: ["openFile"],
						filters: [{
							name: "HTT business backup",
							extensions: ["json"]
						}]
					});
					if (choice.canceled || !choice.filePaths[0]) {
						value = null;
						break;
					}
					if (statSync(choice.filePaths[0]).size > 25e7) throw new Error("Backup exceeds 250 MB.");
					value = business.prepareRestore(readFileSync(choice.filePaths[0], "utf8"));
					break;
				}
				case "business.restore.commit":
					await business.restoreBackup(input.token);
					value = { restartRequired: true };
					break;
				case "capture.select": {
					security.require("purchases.bill");
					if (Object.keys(input).some((k) => k !== "operationId") || typeof input.operationId !== "string" || !input.operationId || input.operationId.length > 200) throw new Error("Invalid recognition request.");
					const choice = await dialog.showOpenDialog(owner, {
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
					if (choice.canceled || !choice.filePaths[0]) {
						value = {};
						break;
					}
					const bytes = readSelectedAttachment(choice.filePaths[0]);
					const reply = business.command({
						repository: "captureSources",
						method: "recognize",
						args: [{
							operationId: input.operationId,
							file: {
								name: basename(choice.filePaths[0]),
								content: bytes.toString("base64")
							}
						}]
					});
					value = {
						source: reply.result,
						view: reply.view
					};
					break;
				}
				case "capture.export": {
					security.require("purchases.bill");
					if (Object.keys(input).some((k) => k !== "id") || typeof input.id !== "string") throw new Error("Invalid source export request.");
					const source = business.command({
						repository: "captureSources",
						method: "read",
						args: [input.id]
					}).result;
					const choice = await dialog.showSaveDialog(owner, {
						title: "Export preserved original",
						defaultPath: source.name
					});
					if (choice.canceled || !choice.filePath) {
						value = { saved: false };
						break;
					}
					const target = relative(realpathSync(directory), join(realpathSync(dirname(choice.filePath)), basename(choice.filePath)));
					if (!target || !target.startsWith(".." + sep) && target !== ".." && !isAbsolute(target)) throw new Error("Choose an export location outside the active local data directory.");
					security.audit("capture.export", input.id, "INTENT", "purchases.bill");
					try {
						const current = business.command({
							repository: "captureSources",
							method: "read",
							args: [input.id]
						}).result;
						atomicAttachmentExport(choice.filePath, attachmentBytes(current));
					} catch (e) {
						security.audit("capture.export", input.id, "FAILED", "purchases.bill");
						throw e;
					}
					security.audit("capture.export", input.id, "SUCCESS", "purchases.bill");
					value = { saved: true };
					break;
				}
				case "attachments.select": {
					security.require("inventory.read");
					business.command({
						repository: "attachments",
						method: "checkTarget",
						args: [input.target]
					});
					const choice = await dialog.showOpenDialog(owner, {
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
					if (choice.canceled || !choice.filePaths[0]) {
						value = { saved: false };
						break;
					}
					const content = readSelectedAttachment(choice.filePaths[0]);
					value = {
						saved: true,
						...business.command({
							repository: "attachments",
							method: "upload",
							args: [{
								...input,
								file: {
									name: basename(choice.filePaths[0]),
									content: content.toString("base64")
								}
							}]
						})
					};
					break;
				}
				case "attachments.export": {
					security.require("inventory.read");
					const result = business.command({
						repository: "attachments",
						method: "read",
						args: [input]
					}).result;
					const choice = await dialog.showSaveDialog(owner, {
						title: "Export attachment version",
						defaultPath: result.name
					});
					if (choice.canceled || !choice.filePath) {
						value = { saved: false };
						break;
					}
					const target = relative(realpathSync(directory), join(realpathSync(dirname(choice.filePath)), basename(choice.filePath)));
					if (!target || !target.startsWith(".." + sep) && target !== ".." && !isAbsolute(target)) throw new Error("Choose an export location outside the active local data directory.");
					security.audit("attachments.export", String(input.id) + "/" + String(input.versionId), "INTENT", "inventory.read");
					try {
						const current = business.command({
							repository: "attachments",
							method: "read",
							args: [input]
						}).result;
						atomicAttachmentExport(join(realpathSync(dirname(choice.filePath)), basename(choice.filePath)), attachmentBytes(current));
					} catch (error) {
						security.audit("attachments.export", String(input.id) + "/" + String(input.versionId), "FAILED", "inventory.read");
						throw error;
					}
					security.audit("attachments.export", String(input.id) + "/" + String(input.versionId), "SUCCESS", "inventory.read");
					value = { saved: true };
					break;
				}
				case "business.recurring.scan":
					security.require("inventory.read");
					if (Object.keys(input).length) throw new Error("Recurring scan does not accept caller dates, actors or limits.");
					value = {
						result: business.scanRecurringDue(),
						view: business.view()
					};
					break;
				case "business.command": {
					const command = input;
					assertApprovedDesktopCommand(command);
					value = business.command(command);
					break;
				}
				default: throw new Error("Unknown desktop security action.");
			}
			event.returnValue = {
				ok: true,
				value
			};
		} catch (error) {
			event.returnValue = {
				ok: false,
				error: error instanceof Error ? error.message : "Desktop operation failed."
			};
		} finally {
			busy = false;
		}
	});
	let timerStopped = false;
	const recurringTimer = setInterval(() => {
		if (busy || timerStopped) return;
		busy = true;
		try {
			business.scanRecurringDue();
		} catch {
			timerStopped = true;
			onRecurringStopped();
		} finally {
			busy = false;
		}
	}, 6e4);
	recurringTimer.unref();
	const integrationTimer = setInterval(() => {
		if (!busy) integrations?.tick();
	}, 1e4);
	integrationTimer.unref();
	const feedTimer = setInterval(() => {
		if (!busy) feeds?.tick();
	}, 1e4);
	feedTimer.unref();
	const payrollFilingTimer = setInterval(() => {
		if (!busy) payrollFilings?.tick();
	}, 1e4);
	payrollFilingTimer.unref();
	return {
		dispose: () => {
			clearInterval(recurringTimer);
			clearInterval(integrationTimer);
			clearInterval(feedTimer);
			clearInterval(payrollFilingTimer);
		},
		lock: () => {
			try {
				if (security.principal()) security.logout();
			} catch {}
		}
	};
}
//#endregion
//#region electron/main/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var APP_NAME = "HTT Flooring Management System";
var diagnostics;
var lockSecurity = () => {};
var mainWindow = null;
function getProjectPath(...paths) {
	return path.join(__dirname, "..", ...paths);
}
function setMacDockIcon() {
	if (process.platform !== "darwin") return;
	const iconPath = getProjectPath("build", "icon.png");
	const icon = nativeImage.createFromPath(iconPath);
	if (!icon.isEmpty()) app.dock?.setIcon(icon);
}
function registerIpcHandlers() {
	ipcMain.handle("statement:export-pdf", async (event, options) => {
		try {
			const senderWindow = BrowserWindow.fromWebContents(event.sender);
			if (!senderWindow) return {
				success: false,
				error: "Unable to resolve the current application window."
			};
			const safeFileName = sanitizePdfFileName(options.defaultFileName);
			const result = await dialog.showSaveDialog(senderWindow, {
				title: "Export Customer Statement",
				defaultPath: safeFileName,
				filters: [{
					name: "PDF Document",
					extensions: ["pdf"]
				}],
				properties: ["createDirectory", "showOverwriteConfirmation"]
			});
			if (result.canceled || !result.filePath) return {
				success: false,
				canceled: true
			};
			const pdfData = await event.sender.printToPDF({
				pageSize: "A4",
				printBackground: true,
				preferCSSPageSize: true
			});
			await writeFile(result.filePath, pdfData);
			return {
				success: true,
				filePath: result.filePath
			};
		} catch (error) {
			diagnostics?.event("pdf-export-failed");
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unable to export PDF."
			};
		}
	});
}
function sanitizePdfFileName(value) {
	const fileName = value.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").replace(/\s+/g, " ").trim() || "Customer Statement";
	return fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`;
}
function createMainWindow() {
	const compact = app.commandLine.hasSwitch("user-data-dir") && app.commandLine.getSwitchValue("acceptance-window") === "compact";
	mainWindow = new BrowserWindow({
		title: APP_NAME,
		width: compact ? 1100 : 1440,
		height: compact ? 700 : 900,
		minWidth: 1100,
		minHeight: 700,
		show: false,
		backgroundColor: "#f4f1eb",
		webPreferences: {
			preload: path.join(__dirname, "index.mjs"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true
		}
	});
	mainWindow.once("ready-to-show", () => {
		mainWindow?.show();
	});
	if (process.env.VITE_DEV_SERVER_URL) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
	else mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
	mainWindow.webContents.on("did-start-navigation", (_event, _url, inPlace, isMainFrame) => {
		if (isMainFrame && !inPlace) lockSecurity();
	});
	mainWindow.webContents.on("render-process-gone", () => {
		lockSecurity();
		diagnostics?.event("renderer-gone");
	});
	mainWindow.on("unresponsive", () => {
		lockSecurity();
		diagnostics?.event("renderer-unresponsive");
	});
	mainWindow.on("responsive", () => diagnostics?.event("renderer-responsive"));
	mainWindow.webContents.on("did-fail-load", (_event, code, _description, _url, mainFrame) => {
		if (mainFrame && code !== -3) diagnostics?.event("load-failed");
	});
	mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
	mainWindow.webContents.on("will-navigate", (event, url) => {
		const target = new URL(url);
		const current = new URL(mainWindow.webContents.getURL());
		if (target.protocol !== current.protocol || target.host !== current.host || target.pathname !== current.pathname) event.preventDefault();
	});
	mainWindow.on("closed", () => {
		lockSecurity();
		mainWindow = null;
	});
}
var customUserData = app.commandLine.getSwitchValue("user-data-dir");
if (customUserData) app.setPath("userData", path.resolve(customUserData));
if (!app.requestSingleInstanceLock()) app.quit();
else {
	diagnostics = new OperationalLog(app.getPath("userData"), app.getVersion());
	process.on("uncaughtException", () => {
		diagnostics?.event("main-exception");
		lockSecurity();
		app.exit(1);
	});
	process.on("unhandledRejection", () => {
		diagnostics?.event("main-rejection");
		lockSecurity();
		app.exit(1);
	});
	app.on("will-quit", () => diagnostics?.finish());
}
app.on("second-instance", () => {
	mainWindow?.show();
	mainWindow?.focus();
});
app.setName(APP_NAME);
app.whenReady().then(() => {
	setMacDockIcon();
	registerIpcHandlers();
	lockSecurity = registerSecurityIpc(path.join(app.getPath("userData"), "local-security"), () => mainWindow, () => diagnostics?.event("recurring-stopped")).lock;
	Menu.setApplicationMenu(Menu.buildFromTemplate([
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
					const status = diagnostics?.status();
					if ((await dialog.showMessageBox({
						type: "info",
						title: "Local diagnostics",
						message: `HTT Flooring ${app.getVersion()}`,
						detail: `Local diagnostics: ${status?.available ? "available" : "unavailable"}\nSession alerts: ${status?.alerts.join(", ") || "none"}\n\nNo business records, passwords, error text or document contents are logged. No telemetry is sent. Business audit remains in Security settings.`,
						buttons: ["Close", "Open log folder"]
					})).response === 1 && diagnostics) await shell.openPath(diagnostics.directory);
				}
			}]
		}
	]));
	createMainWindow();
	diagnostics?.event("ready");
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
	});
}).catch(() => {
	diagnostics?.event("startup-failed");
	dialog.showErrorBox("HTT Flooring could not start", "Restart the application. If the problem continues, inspect the local diagnostics folder in the application profile. Business files have not been reset.");
	app.exit(1);
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
//#endregion
export {};
