import { A as e, B as t, D as n, F as r, G as i, H as a, I as o, J as s, K as c, L as l, N as u, O as d, P as f, R as p, S as m, T as h, U as g, V as ee, W as te, X as ne, Y as re, Z as ie, _ as ae, a as _, c as oe, d as v, f as se, h as y, i as b, j as ce, k as le, l as ue, m as de, n as x, o as S, p as fe, q as pe, r as C, s as me, t as he, u as ge, w as _e, y as ve, z as w } from "./accountingPeriodValidation-Ha5z4pK5.js";
import { createHash as ye } from "node:crypto";
//#region \0rolldown/runtime.js
var be = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports);
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/iso.js
function xe(e) {
	return i(u, e);
}
//#endregion
//#region src/features/payroll/data/australianTax.ts
var Se = [
	"Manual",
	"1",
	"2",
	"3",
	"4-resident",
	"4-foreign",
	"5",
	"6"
], Ce = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
], we = {
	1: [
		[
			188,
			.15,
			.15
		],
		[
			371,
			.2084,
			11.0185
		],
		[
			515,
			.179,
			.1066
		],
		[
			932,
			.3227,
			74.1674
		],
		[
			2246,
			.32,
			71.6508
		],
		[
			3303,
			.39,
			228.8816
		],
		[
			Infinity,
			.47,
			493.1893
		]
	],
	2: [
		[
			362,
			0,
			0
		],
		[
			538,
			.15,
			54.3462
		],
		[
			673,
			.25,
			108.2135
		],
		[
			721,
			.17,
			54.3473
		],
		[
			865,
			.179,
			60.8377
		],
		[
			1282,
			.3227,
			185.1935
		],
		[
			2596,
			.32,
			181.7319
		],
		[
			3653,
			.39,
			363.4627
		],
		[
			Infinity,
			.47,
			655.7704
		]
	],
	3: [
		[
			2596,
			.3,
			.3
		],
		[
			3653,
			.37,
			181.7308
		],
		[
			Infinity,
			.45,
			474.0385
		]
	],
	5: [
		[
			362,
			0,
			0
		],
		[
			721,
			.15,
			54.3462
		],
		[
			865,
			.159,
			60.8365
		],
		[
			1282,
			.3027,
			185.1923
		],
		[
			2596,
			.3,
			181.7308
		],
		[
			3653,
			.37,
			363.4615
		],
		[
			Infinity,
			.45,
			655.7692
		]
	],
	6: [
		[
			362,
			0,
			0
		],
		[
			721,
			.15,
			54.3462
		],
		[
			865,
			.159,
			60.8365
		],
		[
			908,
			.3027,
			185.1923
		],
		[
			1135,
			.3527,
			230.6135
		],
		[
			1282,
			.3127,
			185.1923
		],
		[
			2596,
			.31,
			181.7308
		],
		[
			3653,
			.38,
			363.4615
		],
		[
			Infinity,
			.46,
			655.7692
		]
	]
};
function Te(e, t, n, r) {
	if (!Number.isFinite(e) || e < 0 || e > 1e9) throw Error("Invalid taxable earnings.");
	if (r < "2026-07-01" || r > "2027-06-30") throw Error("Automatic PAYG is available only for pay dates in 2026–27. Use a reviewed manual amount for another year.");
	if (t === "Manual") throw Error("Manual withholding must be entered explicitly.");
	if (t.startsWith("4-")) return Math.floor(Math.floor(e) * (t === "4-resident" ? .47 : .45) + 1e-9);
	let i = Math.round(e * 100);
	n === "Monthly" && i % 100 == 33 && i++;
	let a = n === "Weekly" ? i / 100 : n === "Fortnightly" ? i / 200 : n === "Monthly" ? i * 3 / 1300 : i / 1300, o = Math.floor(a + 1e-9) + .99, s = we[t]?.find(([e]) => o < e);
	if (!s) throw Error("Unsupported PAYG scale.");
	let c = Math.max(0, Math.round(s[1] * o - s[2]));
	return n === "Weekly" ? c : n === "Fortnightly" ? c * 2 : n === "Monthly" ? Math.round(c * 13 / 3) : c * 13;
}
//#endregion
//#region src/features/security/trustedAuthorization.ts
var Ee = null, T = {
	connect(e) {
		return Ee = e, () => {
			Ee === e && (Ee = null);
		};
	},
	disconnect() {
		Ee = null;
	},
	current() {
		return Ee?.() ?? null;
	},
	require(e) {
		return ce(this.current(), e);
	}
}, De = /* @__PURE__ */ new Set(), E = "2026-10-08T00:00:00.000Z", Oe = [
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
function ke() {
	De.forEach((e) => e());
}
function Ae(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function je(e) {
	return e?.trim() || void 0;
}
function D(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function Me(e, t) {
	if (Oe.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function Ne(e, t) {
	if (!e) return;
	let n = Oe.find((n) => n.id !== t && (ge(e) ? n.id === ge(e) : n.systemRole === e));
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function Pe() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var O = {
	subscribe(e) {
		return De.add(e), () => {
			De.delete(e);
		};
	},
	getSnapshot() {
		return Oe;
	},
	getAll() {
		return Oe;
	},
	getById(e) {
		return Oe.find((t) => t.id === e);
	},
	getByCode(e) {
		return Oe.find((t) => t.code.toLowerCase() === e.trim().toLowerCase());
	},
	getBySystemRole(e) {
		return Oe.find((t) => ge(e) ? t.id === ge(e) : t.systemRole === e);
	},
	requireById(e) {
		let t = Oe.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = Oe.find((t) => ge(e) ? t.id === ge(e) : t.systemRole === e);
		if (!t) throw Error(`Accounting account for system role ${e} was not found.`);
		return t;
	},
	create(e) {
		let t = Ae(e.code, "Account code"), n = Ae(e.name, "Account name");
		D(t), Me(t), Ne(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Pe(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: je(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return Oe = [...Oe, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), ke(), i;
	},
	update(e, t) {
		let n = Oe.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = Ae(t.code, "Account code"), i = Ae(t.name, "Account name");
		if (D(r), Me(r, e), (n.systemRole || ue(n.id)) && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: je(t.description),
			active: n.systemRole || ue(n.id) ? !0 : t.active,
			allowManualPosting: n.systemRole || ue(n.id) ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Oe = Oe.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), ke(), a;
	},
	setActive(e, t) {
		let n = Oe.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		if ((n.systemRole || ue(n.id)) && !t) throw Error("System control accounts cannot be deactivated.");
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Oe = Oe.map((t) => t.id === e ? r : t), ke(), r;
	}
};
y("accounts", {
	repository: O,
	read: "accounting.read",
	commands: {
		if: null,
		create: "accounting.post",
		update: "accounting.post",
		setActive: "accounting.post"
	},
	snapshot: () => ({ accounts: Oe }),
	restore: (e) => {
		Oe = e.accounts;
	},
	publish: () => De.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/reconciliationLock.ts
function Fe(e, t) {
	let n = ve(), r = n.journals?.journalEntries ?? [], i = n.bankReconciliations?.reconciliations ?? [], a = r.filter((n) => n.sourceType === e && n.sourceId === t).map((e) => e.id);
	if (i.some((e) => e.clearedTransactionIds.some((e) => a.some((t) => e.startsWith(t + ":"))))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Ie(e, t) {
	let n = ve(), r = n.bankAccounts?.bankAccounts ?? [], i = n.bankReconciliations?.reconciliations ?? [];
	for (let n of r.filter((e) => t.includes(e.glAccountId))) {
		let t = i.filter((e) => e.bankAccountId === n.id).map((e) => e.statementDate).sort().at(-1);
		if (t && e <= t) throw Error(`Bank account is reconciled through ${t}. Use a posting date after that statement.`);
	}
}
//#endregion
//#region src/features/accounting/data/accountingPeriodRepository.ts
var Le = [], Re, ze, Be = /* @__PURE__ */ new Set();
function Ve(e, t) {
	Re = e, ze = t;
}
function He() {
	let e = ze?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function Ue(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function We(e) {
	let t = Le.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function Ge() {
	Be.forEach((e) => e());
}
function Ke(e) {
	if (C(e, "Posting date"), !Le.length) return;
	let t = Le.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!Le.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
y("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => Le,
		subscribe(e) {
			return Be.add(e), () => {
				Be.delete(e);
			};
		},
		create(e) {
			let t = He(), n = Ue(e.reason);
			if (C(e.startDate), C(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (Le.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (Le.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
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
			return Le = [...Le, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), Ge(), r;
		},
		preflight(e) {
			let t = We(e);
			if (!Re) throw Error("Trusted close checks unavailable.");
			return Re(t);
		},
		close(e) {
			let t = He(), n = Ue(e.reason), r = We(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (Le.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return Le = Le.map((e) => e.id === r.id ? {
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
			} : e), Ge(), We(e.id);
		},
		reopen(e) {
			let t = He(), n = Ue(e.reason), r = We(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (Le.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return Le = Le.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), Ge(), We(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: Le }),
	restore: (e) => {
		he(e.periods), Le = e.periods;
	},
	publish: Ge
});
//#endregion
//#region src/features/purchases/data/mockPurchaseOrders.ts
var qe = [{
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
}], Je = [{
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
function Ye() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function Xe(e, t) {
	let n = Ye();
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
function Ze(e, t) {
	let n = Ye();
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
function Qe(e) {
	let t = Ye();
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
var $e = "htt:financial-snapshot:v1", et = (e) => !!e && typeof e == "object" && !Array.isArray(e), tt = (e) => new Set(e.map((e) => e.id)).size === e.length, nt = (e) => {
	if (!et(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => et(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => et(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => et(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => et(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
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
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => et(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && et(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && et(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && et(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && tt(t) && tt(n) && tt(r) && tt(i);
}, rt = () => ({
	purchaseOrders: structuredClone(qe),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone(Je),
	transactions: [],
	transfers: [],
	journals: []
}), it, at = !1;
function ot() {
	return typeof window < "u" && !!window.localStorage;
}
function st() {
	if (it) return it;
	if (!ot()) return rt();
	let e = Xe($e, nt);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return at = e.status === "ok", it = e.status === "ok" ? {
		...rt(),
		...e.data
	} : rt(), it;
}
var ct = /* @__PURE__ */ new Set(), lt = 0, ut = /* @__PURE__ */ new Set();
function dt(e) {
	if (ot() && !Ze($e, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var k = {
	wasRestoredOnLoad() {
		return st(), at;
	},
	onRollback(e) {
		ct.add(e);
	},
	notify(e) {
		lt ? ut.add(e) : e();
	},
	transaction(e) {
		if (lt) return e();
		let t = structuredClone(st());
		it = structuredClone(t), lt++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			dt(st());
		} catch (e) {
			throw it = t, ct.forEach((e) => e()), ut.clear(), e;
		} finally {
			lt--;
		}
		let r = [...ut];
		return ut.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(st());
	},
	update(e, t) {
		let n = {
			...st(),
			[e]: structuredClone(t)
		};
		if (!nt(n)) throw Error("Invalid financial snapshot; write blocked.");
		lt || dt(n), it = n;
	},
	resetCacheForTests() {
		it = void 0, at = !1;
	}
};
y("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => k.read(),
	restore: (e) => {
		it = e;
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var ft = /* @__PURE__ */ new Set(), pt = k.read().journals;
k.onRollback(() => {
	pt = k.read().journals;
});
function mt() {
	ft.forEach((e) => k.notify(e));
}
function ht(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function gt(e) {
	return e?.trim() || void 0;
}
function _t(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function vt(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = pt.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function yt(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function bt(e) {
	if (_t(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = O.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = ht(r.debit), o = ht(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = ht(t + a), n = ht(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function xt(e) {
	return e.lines.map((e, t) => {
		let n = O.requireById(e.accountId);
		return {
			id: yt(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: gt(e.description),
			debit: ht(e.debit),
			credit: ht(e.credit)
		};
	});
}
function St(e, t) {
	return pt.find((n) => n.sourceType === e && n.sourceId === t && !n.reversedJournalEntryId);
}
var A = {
	subscribe(e) {
		return ft.add(e), () => {
			ft.delete(e);
		};
	},
	getSnapshot() {
		return pt;
	},
	getAll() {
		return pt;
	},
	getById(e) {
		return pt.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return pt.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: St,
	post(e) {
		Ke(e.journalDate), Ie(e.journalDate, e.lines.map((e) => e.accountId));
		let t = bt(e), n = gt(e.sourceId);
		if (n) {
			let t = St(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: yt("je"),
			journalNumber: vt(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: gt(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: xt(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...pt];
		return k.update("journals", a), pt = a, mt(), i;
	},
	reverse(e) {
		Ke(e.reversalDate);
		let t = pt.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (_t(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Reversal reason must contain at least 3 characters.");
		Ie(e.reversalDate, t.lines.map((e) => e.accountId));
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
		}, i = bt(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: yt("je"),
			journalNumber: vt(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: xt(r),
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
		}, c = [o, ...pt.map((e) => e.id === t.id ? s : e)];
		return k.update("journals", c), pt = c, mt(), o;
	}
};
y("journals", {
	repository: A,
	read: "accounting.read",
	commands: {
		if: null,
		validateDate: null,
		for: null,
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ journalEntries: pt }),
	restore: (e) => {
		pt = e.journalEntries;
	},
	publish: () => ft.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var Ct = "htt.mock.banking.accounts.v1";
function wt(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var Tt = /* @__PURE__ */ new Set(), Et = "2026-10-08T00:00:00.000Z", Dt = [{
	id: "bank_001",
	name: "Operating Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1000",
	accountType: "TRANSACTION",
	currency: _().currency,
	glAccountId: "acc_1000",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: Et,
	updatedAt: Et
}, {
	id: "bank_002",
	name: "Savings Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1010",
	accountType: "SAVINGS",
	currency: _().currency,
	glAccountId: "acc_1010",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: Et,
	updatedAt: Et
}], Ot = Xe(Ct, wt);
Ot.status === "ok" && Ot.data.every((e) => {
	let t = O.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (Dt = Ot.data);
function kt() {
	Tt.forEach((e) => e());
}
function At(e) {
	let t = O.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of Dt) At(e);
var jt = {
	subscribe(e) {
		return Tt.add(e), () => {
			Tt.delete(e);
		};
	},
	getSnapshot() {
		return Dt;
	},
	getAll() {
		return Dt;
	},
	getById(e) {
		return Dt.find((t) => t.id === e);
	},
	getByGlAccountId(e) {
		return Dt.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = Dt.find((t) => t.id === e);
		if (!t) throw Error("Bank account was not found.");
		return t;
	},
	save(e, n) {
		let r = t({
			id: a().optional(),
			name: a().trim().min(1).max(180),
			bankName: a().trim().min(1).max(180),
			accountNumber: a().trim().min(1).max(100),
			accountType: f([
				"TRANSACTION",
				"SAVINGS",
				"CREDIT_CARD",
				"OTHER"
			]),
			currency: f(["AUD", "NZD"]),
			glAccountId: a().min(1),
			openingBalanceDate: a(),
			active: o()
		}).strict().parse(e);
		if (C(r.openingBalanceDate, "Opening date"), Dt[0] && r.currency !== Dt[0].currency) throw Error("This profile uses one base currency; foreign-currency bank accounts are not supported.");
		let i = Dt.find((e) => e.id === r.id);
		if (i && i.updatedAt !== n) throw Error("Bank account changed; reload before editing.");
		if (!i && r.id) throw Error("Bank account was not found.");
		if (Dt.some((e) => e.id !== i?.id && e.glAccountId === r.glAccountId)) throw Error("Each bank account needs its own GL account.");
		let s = O.requireById(r.glAccountId);
		if (!s.active || s.type !== "ASSET" || s.systemRole && s.systemRole !== "BANK") throw Error("Choose an active bank Asset account.");
		if (i && A.getAll().some((e) => e.lines.some((e) => e.accountId === i.glAccountId)) && (i.glAccountId !== r.glAccountId || i.openingBalanceDate !== r.openingBalanceDate || i.currency !== r.currency)) throw Error("A used bank account cannot change its ledger, currency or opening date.");
		let c = new Date(Math.max(Date.now(), i ? Date.parse(i.updatedAt) + 1 : 0)).toISOString(), l = {
			...r,
			id: i?.id ?? crypto.randomUUID(),
			openingBalance: i?.openingBalance ?? 0,
			createdAt: i?.createdAt ?? c,
			updatedAt: c
		};
		return At(l), Dt = [...Dt.filter((e) => e.id !== l.id), l], kt(), l;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Dt = Dt.map((t) => t.id === e ? r : t), Qe(Ct) && Ze(Ct, Dt), kt(), r;
	}
};
y("bankAccounts", {
	repository: jt,
	read: "banking.read",
	commands: {
		if: null,
		validateBankAccount: null,
		setActive: "banking.write",
		save: "banking.write"
	},
	snapshot: () => ({ bankAccounts: Dt }),
	restore: (e) => {
		Dt = e.bankAccounts;
	},
	publish: () => Tt.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/financialOperationJournal.ts
var Mt = "htt:financial-operations:v1", Nt = [
	"CUSTOMER_PAYMENT",
	"PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
], Pt = [
	"PENDING",
	"COMPLETED",
	"MANUAL_REVIEW"
], Ft = (e) => Array.isArray(e) && e.every((e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.operationId == "string" && t.operationId.length > 0 && Nt.includes(String(t.kind)) && typeof t.fingerprint == "string" && t.fingerprint.length > 0 && Pt.includes(String(t.state)) && typeof t.createdAt == "string" && typeof t.updatedAt == "string" && (t.resultId === void 0 || typeof t.resultId == "string") && (t.note === void 0 || typeof t.note == "string") && (t.reviewHistory === void 0 || Array.isArray(t.reviewHistory) && t.reviewHistory.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		return typeof t.reference == "string" && t.reference.length >= 3 && typeof t.operator == "string" && t.operator.length >= 2 && typeof t.recordedAt == "string" && typeof t.summary == "string" && t.summary.length >= 3;
	}));
}) && new Set(e.map((e) => e.operationId)).size === e.length;
function It() {
	let e = Xe(Mt, Ft);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function Lt(e) {
	if (!Qe(Mt) || !Ze(Mt, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var j = {
	list() {
		return It().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !Nt.includes(t)) throw Error("Invalid operation identity.");
		let r = It(), i = r.find((t) => t.operationId === e);
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
		return Lt([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = It(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Lt(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = It(), r = n.find((t) => t.operationId === e);
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
		return Lt(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = It(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Lt(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = It(), a = i.find((t) => t.operationId === e);
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
		return Lt(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = It(), a = i.find((t) => t.operationId === e);
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
		return Lt(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	getUnresolved() {
		return It().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
	}
};
y("financialOperations", {
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
var Rt = /* @__PURE__ */ new Map(), zt = "htt.purchasePosting.operations.v1";
function Bt() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function Vt() {
	let e = Bt();
	if (e) try {
		e.setItem(zt, JSON.stringify([...Rt.values()]));
	} catch {}
}
function Ht() {
	let e = Bt();
	if (e) try {
		let t = JSON.parse(e.getItem(zt) ?? "[]");
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
			Rt.set(t.key, {
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
Ht();
var Ut = /* @__PURE__ */ new Set(), Wt = /* @__PURE__ */ new Map(), Gt = /* @__PURE__ */ new Map(), Kt;
function qt() {
	Vt(), Ut.forEach((e) => e());
}
var M = {
	injectFailureBeforeStep(e, t, n = 1) {
		Gt.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		Gt.clear();
	},
	registerRecovery(e, t) {
		if (!Rt.has(e)) throw Error(`Unknown posting operation: ${e}`);
		Wt.set(e, t);
	},
	runStep(e, t, n) {
		let r = Rt.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = Gt.get(i) ?? 0;
		if (a > 0) throw Gt.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return Wt.has(e);
	},
	recover(e) {
		let t = Rt.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = Wt.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (Kt === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		Kt = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			Kt = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = Rt.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...Rt.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return Ut.add(e), () => {
			Ut.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if (Rt.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Rt.set(n, r), qt(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = Rt.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		Rt.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), qt();
	},
	completeStep(e, t) {
		let n = Rt.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (Rt.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), qt());
	}
};
y("purchaseOperations", {
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
		Rt.clear(), Wt.clear();
		for (let t of e) Rt.set(t.key, t);
	},
	publish: () => Ut.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var Jt = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Yt(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${Jt.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function N() {
	Yt(j.list(), M.getAll());
}
//#endregion
//#region node_modules/.pnpm/react@19.3.0/node_modules/react/cjs/react.production.js
var Xt = /* @__PURE__ */ be(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.for("react.view_transition"), m = Symbol.iterator;
	function h(e) {
		return typeof e != "object" || !e ? null : (e = m && e[m] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var g = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, ee = Object.assign, te = {};
	function ne(e, t, n) {
		this.props = e, this.context = t, this.refs = te, this.updater = n || g;
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
		this.props = e, this.context = t, this.refs = te, this.updater = n || g;
	}
	var ae = ie.prototype = new re();
	ae.constructor = ie, ee(ae, ne.prototype), ae.isPureReactComponent = !0;
	var _ = Array.isArray;
	function oe() {}
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
	function de(e, t) {
		return typeof e == "object" && e && e.key != null ? le("" + e.key) : t.toString(36);
	}
	function x(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(oe, oe) : (e.status = "pending", e.then(function(t) {
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
	function S(e, r, i, a, o) {
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
				case d: return c = e._init, S(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + de(e, 0) : a, _(o) ? (i = "", c != null && (i = c.replace(ue, "$&/") + "/"), S(o, r, i, "", function(e) {
			return e;
		})) : o != null && (ce(o) && (o = b(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(ue, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (_(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + de(a, u), c += S(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + de(a, u++), c += S(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return S(x(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function fe(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return S(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function pe(e) {
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
	var C = typeof reportError == "function" ? reportError : function(e) {
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
	function me(e) {
		var t = v.T, n = {};
		n.types = t === null ? null : t.types, v.T = n;
		try {
			var r = e(), i = v.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(oe, C);
		} catch (e) {
			C(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), v.T = t;
		}
	}
	function he(e) {
		var t = v.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else me(he.bind(null, e));
	}
	var ge = {
		map: fe,
		forEach: function(e, t, n) {
			fe(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return fe(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return fe(e, function(e) {
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
		var r = ee({}, e.props), i = e.key;
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
			_init: pe
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = me, e.unstable_useCacheRefresh = function() {
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
})), Zt = /* @__PURE__ */ be(((e, t) => {
	process.env.NODE_ENV !== "production" && (function() {
		function n(e, t) {
			Object.defineProperty(a.prototype, e, { get: function() {
				console.warn("%s(...) is deprecated in plain JavaScript React classes. %s", t[0], t[1]);
			} });
		}
		function r(e) {
			return typeof e != "object" || !e ? null : (e = Ee && e[Ee] || e["@@iterator"], typeof e == "function" ? e : null);
		}
		function i(e, t) {
			e = (e = e.constructor) && (e.displayName || e.name) || "ReactClass";
			var n = e + "." + t;
			T[n] || (console.error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", t, e), T[n] = !0);
		}
		function a(e, t, n) {
			this.props = e, this.context = t, this.refs = Oe, this.updater = n || De;
		}
		function o() {}
		function s(e, t, n) {
			this.props = e, this.context = t, this.refs = Oe, this.updater = n || De;
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
			if (typeof e == "function") return e.$$typeof === je ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case he: return "Fragment";
				case _e: return "Profiler";
				case ge: return "StrictMode";
				case be: return "Suspense";
				case xe: return "SuspenseList";
				case we: return "Activity";
				case Te: return "ViewTransition";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case me: return "Portal";
				case w: return e.displayName || "Context";
				case ve: return (e._context.displayName || "Context") + ".Consumer";
				case ye:
					var t = e.render;
					return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case Se: return t = e.displayName || null, t === null ? d(e.type) || "Memo" : t;
				case Ce:
					t = e._payload, e = e._init;
					try {
						return d(e(t));
					} catch {}
			}
			return null;
		}
		function f(e) {
			if (e === he) return "<>";
			if (typeof e == "object" && e && e.$$typeof === Ce) return "<...>";
			try {
				var t = d(e);
				return t ? "<" + t + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function p() {
			var e = D.A;
			return e === null ? null : e.getOwner();
		}
		function m() {
			return Error("react-stack-top-frame");
		}
		function h(e) {
			if (Me.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function g(e, t) {
			function n() {
				Pe || (Pe = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function ee() {
			var e = d(this.type);
			return Fe[e] || (Fe[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function te(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: C,
				type: e,
				key: t,
				props: n,
				_owner: r
			}, (o === void 0 ? null : o) === null ? Object.defineProperty(e, "ref", {
				enumerable: !1,
				value: null
			}) : Object.defineProperty(e, "ref", {
				enumerable: !1,
				get: ee
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
			return t = te(e.type, t, e.props, e._owner, e._debugStack, e._debugTask), e._store && (t._store.validated = e._store.validated), t;
		}
		function re(e) {
			ie(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === Ce && (e._payload.status === "fulfilled" ? ie(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function ie(e) {
			return typeof e == "object" && !!e && e.$$typeof === C;
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
		function _(e, t) {
			return typeof e == "object" && e && e.key != null ? (u(e.key), ae("" + e.key)) : t.toString(36);
		}
		function oe(e) {
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
					case C:
					case me:
						s = !0;
						break;
					case Ce: return s = e._init, v(s(e._payload), t, n, i, a);
				}
			}
			if (s) {
				s = e, a = a(s);
				var c = i === "" ? "." + _(s, 0) : i;
				return Ae(a) ? (n = "", c != null && (n = c.replace(ze, "$&/") + "/"), v(a, t, n, "", function(e) {
					return e;
				})) : a != null && (ie(a) && (a.key != null && (s && s.key === a.key || u(a.key)), n = ne(a, n + (a.key == null || s && s.key === a.key ? "" : ("" + a.key).replace(ze, "$&/") + "/") + c), i !== "" && s != null && ie(s) && s.key == null && s._store && !s._store.validated && (n._store.validated = 2), a = n), t.push(a)), 1;
			}
			if (s = 0, c = i === "" ? "." : i + ":", Ae(e)) for (var l = 0; l < e.length; l++) i = e[l], o = c + _(i, l), s += v(i, t, n, o, a);
			else if (l = r(e), typeof l == "function") for (l === e.entries && (Re || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Re = !0), e = l.call(e), l = 0; !(i = e.next()).done;) i = i.value, o = c + _(i, l++), s += v(i, t, n, o, a);
			else if (o === "object") {
				if (typeof e.then == "function") return v(oe(e), t, n, i, a);
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
			var e = D.H;
			return e === null && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."), e;
		}
		function ce() {
			D.asyncTransitions--;
		}
		function le(e) {
			var t = D.T, n = {};
			n.types = t === null ? null : t.types, n._updatedFibers = /* @__PURE__ */ new Set(), D.T = n;
			try {
				var r = e(), i = D.S;
				i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && (D.asyncTransitions++, r.then(ce, ce), r.then(c, Be));
			} catch (e) {
				Be(e);
			} finally {
				t === null && n._updatedFibers && (e = n._updatedFibers.size, n._updatedFibers.clear(), 10 < e && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), t !== null && n.types !== null && (t.types !== null && t.types !== n.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), t.types = n.types), D.T = t;
			}
		}
		function ue(e) {
			var t = D.T;
			if (t !== null) {
				var n = t.types;
				n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
			} else D.asyncTransitions === 0 && console.error("addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition."), le(ue.bind(null, e));
		}
		function de(e) {
			if (He === null) try {
				var n = ("require" + Math.random()).slice(0, 7);
				He = (t && t[n]).call(t, "timers").setImmediate;
			} catch {
				He = function(e) {
					!1 === Ve && (Ve = !0, typeof MessageChannel > "u" && console.error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
					var t = new MessageChannel();
					t.port1.onmessage = e, t.port2.postMessage(void 0);
				};
			}
			return He(e);
		}
		function x(e) {
			return 1 < e.length && typeof AggregateError == "function" ? AggregateError(e) : e[0];
		}
		function S(e, t) {
			t !== Ue - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), Ue = t;
		}
		function fe(e, t, n) {
			var r = D.actQueue;
			if (r !== null) {
				if (r.length !== 0) try {
					pe(r), de(function() {
						return fe(e, t, n);
					});
					return;
				} catch (e) {
					D.thrownErrors.push(e);
				}
				else D.actQueue = null;
			}
			0 < D.thrownErrors.length ? (r = x(D.thrownErrors), D.thrownErrors.length = 0, n(r)) : t(e);
		}
		function pe(e) {
			if (!Ge) {
				Ge = !0;
				var t = 0;
				try {
					for (; t < e.length; t++) {
						var n = e[t];
						do {
							D.didUsePromise = !1;
							var r = n(!1);
							if (r !== null) {
								if (D.didUsePromise) {
									e[t] = n, e.splice(0, t);
									return;
								}
								n = r;
							} else break;
						} while (1);
					}
					e.length = 0;
				} catch (n) {
					e.splice(0, t + 1), D.thrownErrors.push(n);
				} finally {
					Ge = !1;
				}
			}
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var C = Symbol.for("react.transitional.element"), me = Symbol.for("react.portal"), he = Symbol.for("react.fragment"), ge = Symbol.for("react.strict_mode"), _e = Symbol.for("react.profiler"), ve = Symbol.for("react.consumer"), w = Symbol.for("react.context"), ye = Symbol.for("react.forward_ref"), be = Symbol.for("react.suspense"), xe = Symbol.for("react.suspense_list"), Se = Symbol.for("react.memo"), Ce = Symbol.for("react.lazy"), we = Symbol.for("react.activity"), Te = Symbol.for("react.view_transition"), Ee = Symbol.iterator, T = {}, De = {
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
		}, E = Object.assign, Oe = {};
		Object.freeze(Oe), a.prototype.isReactComponent = {}, a.prototype.setState = function(e, t) {
			if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
			this.updater.enqueueSetState(this, e, t, "setState");
		}, a.prototype.forceUpdate = function(e) {
			this.updater.enqueueForceUpdate(this, e, "forceUpdate");
		};
		var ke = {
			isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
			replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
		};
		for (qe in ke) ke.hasOwnProperty(qe) && n(qe, ke[qe]);
		o.prototype = a.prototype, ke = s.prototype = new o(), ke.constructor = s, E(ke, a.prototype), ke.isPureReactComponent = !0;
		var Ae = Array.isArray, je = Symbol.for("react.client.reference"), D = {
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
		}, Me = Object.prototype.hasOwnProperty, Ne = console.createTask ? console.createTask : function() {
			return null;
		};
		ke = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var Pe, O, Fe = {}, Ie = ke.react_stack_bottom_frame.bind(ke, m)(), Le = Ne(f(m)), Re = !1, ze = /\/+/g, Be = typeof reportError == "function" ? reportError : function(e) {
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
		}, Ve = !1, He = null, Ue = 0, We = !1, Ge = !1, Ke = typeof queueMicrotask == "function" ? function(e) {
			queueMicrotask(function() {
				return queueMicrotask(e);
			});
		} : de;
		ke = Object.freeze({
			__proto__: null,
			c: function(e) {
				return b().useMemoCache(e);
			}
		});
		var qe = {
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
		e.Activity = we, e.Children = qe, e.Component = a, e.Fragment = he, e.Profiler = _e, e.PureComponent = s, e.StrictMode = ge, e.Suspense = be, e.ViewTransition = Te, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = D, e.__COMPILER_RUNTIME = ke, e.act = function(e) {
			var t = D.actQueue, n = Ue;
			Ue++;
			var r = D.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				D.thrownErrors.push(e);
			}
			if (0 < D.thrownErrors.length) throw S(t, n), e = x(D.thrownErrors), D.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return Ke(function() {
					i || We || (We = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				}), { then: function(e, a) {
					i = !0, o.then(function(i) {
						if (S(t, n), n === 0) {
							try {
								pe(r), de(function() {
									return fe(i, e, a);
								});
							} catch (e) {
								D.thrownErrors.push(e);
							}
							if (0 < D.thrownErrors.length) {
								var o = x(D.thrownErrors);
								D.thrownErrors.length = 0, a(o);
							}
						} else e(i);
					}, function(e) {
						S(t, n), 0 < D.thrownErrors.length ? (e = x(D.thrownErrors), D.thrownErrors.length = 0, a(e)) : a(e);
					});
				} };
			}
			var s = a;
			if (S(t, n), n === 0 && (pe(r), r.length !== 0 && Ke(function() {
				i || We || (We = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), D.actQueue = null), 0 < D.thrownErrors.length) throw e = x(D.thrownErrors), D.thrownErrors.length = 0, e;
			return { then: function(e, t) {
				i = !0, n === 0 ? (D.actQueue = r, de(function() {
					return fe(s, e, t);
				})) : e(s);
			} };
		}, e.addTransitionType = ue, e.cache = function(e) {
			return function() {
				return e.apply(null, arguments);
			};
		}, e.cacheSignal = function() {
			return null;
		}, e.captureOwnerStack = function() {
			var e = D.getCurrentStack;
			return e === null ? null : e();
		}, e.cloneElement = function(e, t, n) {
			if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
			var r = E({}, e.props), i = e.key, a = e._owner;
			if (t != null) {
				var o;
				a: {
					if (Me.call(t, "ref") && (o = Object.getOwnPropertyDescriptor(t, "ref").get) && o.isReactWarning) {
						o = !1;
						break a;
					}
					o = t.ref !== void 0;
				}
				for (s in o && (a = p()), h(t) && (u(t.key), i = "" + t.key), t) !Me.call(t, s) || s === "key" || s === "__self" || s === "__source" || s === "ref" && t.ref === void 0 || (r[s] = t[s]);
			}
			var s = arguments.length - 2;
			if (s === 1) r.children = n;
			else if (1 < s) {
				o = Array(s);
				for (var c = 0; c < s; c++) o[c] = arguments[c + 2];
				r.children = o;
			}
			for (r = te(e.type, i, r, a, e._debugStack, e._debugTask), i = 2; i < arguments.length; i++) re(arguments[i]);
			return r;
		}, e.createContext = function(e) {
			return e = {
				$$typeof: w,
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
			if (t != null) for (i in O || !("__self" in t) || "key" in t || (O = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), h(t) && (u(t.key), a = "" + t.key), t) Me.call(t, i) && i !== "key" && i !== "__self" && i !== "__source" && (r[i] = t[i]);
			var o = arguments.length - 2;
			if (o === 1) r.children = n;
			else if (1 < o) {
				for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
				Object.freeze && Object.freeze(s), r.children = s;
			}
			if (e && e.defaultProps) for (i in o = e.defaultProps, o) r[i] === void 0 && (r[i] = o[i]);
			return a && g(r, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), (i = 1e4 > D.recentlyCreatedOwnerStacks++) ? (s = Error.stackTraceLimit, Error.stackTraceLimit = 10, o = Error("react-stack-top-frame"), Error.stackTraceLimit = s) : o = Ie, te(e, a, r, p(), o, i ? Ne(f(e)) : Le);
		}, e.createRef = function() {
			var e = { current: null };
			return Object.seal(e), e;
		}, e.forwardRef = function(e) {
			e != null && e.$$typeof === Se ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e == "function" ? e.length !== 0 && e.length !== 2 && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.") : console.error("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e), e != null && e.defaultProps != null && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
			var t = {
				$$typeof: ye,
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
				$$typeof: Ce,
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
				$$typeof: Se,
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
(/* @__PURE__ */ be(((e, t) => {
	t.exports = process.env.NODE_ENV === "production" ? Xt() : Zt();
})))();
var P = (e, t, n = "text", r, i) => ({
	key: e,
	label: t,
	type: n,
	options: r,
	value: i,
	required: !0
}), F = (e, t, n) => P(e, t, "select", n), Qt = (e, t, n = "0") => ({
	...P(e, t, "number", void 0, n),
	min: 0,
	step: "0.01"
}), $t = (e, t) => P(e, t, "date", void 0, "2026-10-16"), en = (e, t) => ({
	...F(e, t, [
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
}), tn = [];
function nn(e, t, n, r, i, a, o, s, c) {
	tn.push({
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
nn("products", "Products & services", "Inventory & pricing", "/inventory/products", "inventory.read", "Maintain purchasing, selling, stock and packaging information.", [
	P("sku", "SKU"),
	F("kind", "Product type", [
		"Stock item",
		"Service",
		"Non-stock item"
	]),
	F("unit", "Selling unit", [
		"Pack",
		"m²",
		"Bucket",
		"Each"
	]),
	Qt("price", "Standard selling price", "49.50"),
	Qt("cost", "Buying cost (sample)", "25"),
	Qt("coverage", "m² per pack", "2.2"),
	F("rounding", "Pack rounding", ["Whole packs up", "Allow fractional packs"]),
	Qt("reorder", "Reorder point", "10"),
	Qt("target", "Target stock", "50"),
	F("buy", "Available for purchasing", ["Yes", "No"]),
	F("sell", "Available for selling", ["Yes", "No"]),
	F("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	P("brand", "Brand"),
	P("category", "Category"),
	P("image", "Image URL (preview only)")
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
]), nn("promotions", "Scheduled promotions", "Inventory & pricing", "/inventory/promotions", "inventory.read", "Plan customer and product specials with explicit start and end times.", [
	P("product", "Product / SKU"),
	P("customer", "Customer scope"),
	P("starts", "Starts (local time)", "datetime-local", void 0, "2026-10-16T09:00"),
	P("ends", "Ends (local time)", "datetime-local", void 0, "2026-10-31T17:00"),
	Qt("price", "Promotional unit price", "45"),
	F("priority", "Priority when rules overlap", [
		"Customer price first",
		"Promotion first",
		"Lowest eligible price"
	]),
	P("timezone", "Time zone", "text", void 0, "Pacific/Auckland")
], {
	name: "October flooring special",
	product: "SAMPLE-OAK",
	customer: "All trade customers"
}, [
	"Overview",
	"Price comparison",
	"History"
]), nn("tax-codes", "Tax codes", "Accounting", "/accounting/tax-codes", "accounting.read", "Review GST codes, inclusive/exclusive calculation and reporting mappings.", [
	P("code", "Tax code"),
	Qt("rate", "Tax rate (%)", "15"),
	F("basis", "Entry basis", ["Exclusive", "Inclusive"]),
	en("collected", "GST collected account"),
	en("paid", "GST paid account"),
	P("report", "Return / report mapping")
], {
	name: "Standard GST",
	code: "GST15",
	report: "Output / input GST"
}, [
	"Overview",
	"Calculation preview",
	"Reporting"
]), nn("linked-accounts", "Linked accounts", "Accounting", "/accounting/linked-accounts", "accounting.read", "Preview default general ledger mappings used by each business process.", [
	F("process", "Business process", [
		"Sales",
		"Purchases",
		"Payroll"
	]),
	en("receivable", "Receivables / payables control"),
	en("income", "Income / expense account"),
	en("inventory", "Inventory account"),
	en("cogs", "Cost of goods sold"),
	en("gst", "GST control account"),
	en("payroll", "Payroll clearing account")
], {
	name: "Sales posting defaults",
	process: "Sales"
}, ["Overview", "Posting example"]), nn("jobs", "Jobs & projects", "Accounting", "/accounting/jobs", "accounting.read", "Track project budgets, allocate posted revenue and costs, and compare actual profitability.", [
	P("code", "Job code"),
	P("customer", "Customer"),
	P("owner", "Project owner"),
	$t("starts", "Start date"),
	$t("ends", "End date"),
	Qt("budget", "Revenue budget", "10000"),
	Qt("costBudget", "Cost budget", "6000")
], {
	name: "Sample showroom installation",
	code: "JOB-SAMPLE",
	customer: "Sample Flooring Ltd",
	owner: "Sample team"
}, [
	"Overview",
	"Transactions",
	"Profitability"
]), nn("bank-accounts", "Bank account setup", "Banking", "/banking/setup/accounts", "banking.read", "Preview bank account details, ledger links and feed preferences.", [
	P("number", "Account number (sample only)"),
	P("bank", "Bank name"),
	F("currency", "Currency", ["NZD", "AUD"]),
	en("ledger", "Linked bank GL account"),
	F("feed", "Feed provider", ["Manual import", "Provider to be configured"]),
	$t("feedStart", "Feed start date")
], {
	name: "Sample operating account",
	number: "00-0000-0000000-00",
	bank: "Sample Bank"
}, [
	"Overview",
	"Feed settings",
	"Import history"
]), nn("bank-rules", "Bank rules", "Banking", "/banking/rules", "banking.read", "Define matching conditions and resulting categorisation before testing a sample.", [
	F("match", "Match mode", ["All conditions", "Any condition"]),
	F("field", "Transaction field", [
		"Description",
		"Payee",
		"Reference"
	]),
	F("operator", "Operator", [
		"Contains",
		"Equals",
		"Starts with"
	]),
	P("value", "Match text"),
	en("account", "Categorise to account"),
	F("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	F("enabled", "Enabled", ["Yes", "No"])
], {
	name: "Sample office supplies",
	value: "OFFICE",
	field: "Description"
}, [
	"Overview",
	"Test rule",
	"History"
]), nn("payment-batches", "Electronic payment batches", "Banking", "/banking/payment-batches", "banking.read", "Select sample supplier or wage payments, review approval and bank export layout.", [
	F("kind", "Batch type", ["Supplier payments", "Wages"]),
	$t("payDate", "Payment date"),
	P("bank", "Paying account"),
	P("reference", "Bank reference"),
	F("format", "Export format", ["NZ bank CSV preview", "ABA layout preview"]),
	Qt("total", "Batch total", "1100")
], {
	name: "Sample supplier batch",
	bank: "Sample operating account",
	reference: "OCT-SAMPLE"
}, [
	"Overview",
	"Payments",
	"Approval & export"
]), nn("pay-items", "Pay items", "Payroll", "/payroll/pay-items", "payroll.read", "Configure sample earnings, allowances, deductions, leave, tax and employer contributions.", [
	P("code", "Pay item code"),
	F("category", "Category", [
		"Earnings",
		"Allowance",
		"Deduction",
		"Leave",
		"Tax",
		"Employer contribution"
	]),
	F("method", "Calculation method", [
		"Hourly rate",
		"Fixed amount",
		"Percentage"
	]),
	Qt("rate", "Rate / amount", "30"),
	F("taxable", "Tax treatment", [
		"Taxable",
		"Non-taxable",
		"Before tax deduction",
		"After tax deduction"
	]),
	en("expense", "Expense account"),
	en("liability", "Liability / clearing account")
], {
	name: "Ordinary hours",
	code: "ORD",
	category: "Earnings"
}, [
	"Overview",
	"Employee assignments",
	"Posting preview"
]), nn("filing", "Payroll filing", "Payroll", "/payroll/filing", "payroll.read", "Review a sample NZ Payday Filing submission and its response / correction workflow.", [
	P("payrun", "Pay run reference"),
	$t("payDate", "Pay date"),
	P("employer", "Employer IRD identifier (sample)"),
	F("type", "Submission type", ["Employment information", "Amendment"]),
	P("contact", "Payroll contact email", "email")
], {
	name: "October employment information",
	payrun: "SAMPLE-RUN-01",
	employer: "000-000-000",
	contact: "payroll@example.invalid"
}, [
	"Overview",
	"Employees & validation",
	"Submission & response"
]), nn("recurring", "Recurring transactions", "Automation & tasks", "/automation/recurring", "inventory.read", "Generate due invoice and expense drafts from saved local templates with ordered schedules and retry protection.", [
	F("kind", "Transaction type", [
		"Invoice",
		"Bill",
		"Bank transaction"
	]),
	P("contact", "Customer / supplier"),
	F("frequency", "Frequency", [
		"Weekly",
		"Fortnightly",
		"Monthly",
		"Quarterly"
	]),
	$t("next", "Next generation date"),
	$t("ends", "Schedule end date"),
	Qt("total", "Template amount", "220"),
	F("mode", "Generation mode", ["Draft for review", "Require approval"])
], {
	name: "Monthly sample maintenance",
	contact: "Sample Flooring Ltd"
}, [
	"Overview",
	"Template lines",
	"Run history"
]), nn("tasks", "Tasks & action centre", "Automation & tasks", "/tasks", "sales.read", "Maintain local tasks, owners and due dates with audited completion and reopening.", [
	P("customer", "Customer / branch"),
	P("owner", "Assigned to"),
	$t("due", "Due date"),
	F("priority", "Priority", [
		"Normal",
		"High",
		"Low"
	]),
	P("notes", "Task instructions", "textarea")
], {
	name: "Follow up showroom quote",
	customer: "Sample Flooring / North branch",
	owner: "Sample sales",
	notes: "Confirm quantities and planned installation date."
}, [
	"Overview",
	"Notes & attachments",
	"Status history"
]), nn("visits", "Sales visits & activity", "Automation & tasks", "/sales/activity", "sales.read", "Plan local sales visits, record trusted check-in/out, outcomes and linked follow-up tasks.", [
	P("salesperson", "Salesperson"),
	P("customer", "Customer / branch"),
	P("checkin", "Check-in", "datetime-local", void 0, "2026-10-16T09:00"),
	P("checkout", "Check-out", "datetime-local", void 0, "2026-10-16T09:30"),
	P("outcome", "Visit outcome", "textarea"),
	P("location", "Recorded location")
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
]), nn("draft-review", "Customer & contact review", "Automation & tasks", "/contacts/review", "sales.read", "Review local customer, branch and contact drafts, compare duplicates and approve or link real records.", [
	F("kind", "Draft type", [
		"Customer",
		"Branch",
		"Contact"
	]),
	P("company", "Customer / company"),
	P("branch", "Branch"),
	P("email", "Email", "email"),
	P("phone", "Phone"),
	F("source", "Source", [
		"Sales draft",
		"Selected phone contact",
		"Business card OCR"
	]),
	F("decision", "Review decision", [
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
]), nn("templates", "PDF & email templates", "Documents & imports", "/documents/templates", "accounting.read", "Design sample invoice, quote, PO, statement and remittance layouts and email copy.", [
	F("kind", "Document type", [
		"Invoice",
		"Quotation",
		"Purchase order",
		"Customer statement",
		"Remittance"
	]),
	P("subject", "Email subject"),
	P("body", "Email body", "textarea"),
	P("footer", "PDF footer", "textarea"),
	F("logo", "Logo position", [
		"Left",
		"Centre",
		"Right"
	]),
	F("paper", "Paper size", ["A4", "Letter"])
], {
	name: "Standard invoice template",
	subject: "Your document {{number}}",
	body: "Hello {{contact}}, please review the attached {{type}}.",
	footer: "Thank you for your business."
}, [
	"Overview",
	"PDF preview",
	"Email preview"
]), nn("custom-reports", "Saved & favourite reports", "Reports", "/reports/saved", "accounting.read", "Save explicit filters and ordered columns, run local data and export complete results.", [
	F("dataset", "Dataset", [
		"Sales",
		"Purchases",
		"Payroll",
		"Banking",
		"General ledger"
	]),
	P("columns", "Columns (comma separated)"),
	P("filter", "Filter expression (preview)"),
	F("basis", "Basis", ["Accrual", "Cash"]),
	F("favourite", "Favourite", ["Yes", "No"])
], {
	name: "Monthly sales by customer",
	columns: "Customer, Date, Net, GST, Total",
	filter: "Date: current month"
}, ["Overview", "Report preview"]), nn("report-packs", "Report packs", "Reports", "/reports/packs", "accounting.read", "Generate combined financial reports from current local books, with ordered sections and printable exports.", [
	P("company", "Company"),
	P("period", "Reporting period"),
	P("reports", "Included reports (comma separated)"),
	P("cover", "Cover heading"),
	P("introduction", "Cover note", "textarea")
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
var rn = tn;
[...new Set(tn.map((e) => e.group))], F("gst", "GST registration", ["Registered", "Not registered"]), F("filing", "GST filing cycle", [
	"Two monthly",
	"Monthly",
	"Six monthly"
]), Qt("quoteNext", "Next quote number", "1001"), Qt("orderNext", "Next order number", "1001"), Qt("invoiceNext", "Next invoice number", "1001"), Qt("creditNext", "Next credit number", "1001"), F("terms", "Default terms", [
	"20th of following month",
	"Due on receipt",
	"30 days"
]), F("template", "Default template", ["Standard invoice", "Trade invoice"]), F("reminders", "Overdue reminders", ["Manual only", "7 and 14 days overdue"]), F("onlinePayment", "Online payment option", ["Disabled", "Configuration preview"]), Qt("next", "Next PO number", "1001"), F("terms", "Default payment terms", [
	"20th of following month",
	"30 days",
	"Due on receipt"
]), en("expense", "Default expense account"), F("receipt", "Bill matching", ["Require receipt match", "Allow expense bills"]), F("remittance", "Remittance preference", ["Preview before sending", "Manual"]), F("cycle", "Pay cycle", [
	"Weekly",
	"Fortnightly",
	"Monthly"
]), F("day", "Pay day", [
	"Wednesday",
	"Thursday",
	"Friday"
]), en("wages", "Wages expense account"), en("clearing", "Payroll clearing account"), F("bank", "Paying bank", ["Sample operating account"]), F("filing", "Filing region", ["New Zealand · Payday Filing", "Australia · STP preview"]), F("basis", "Default basis", ["Accrual", "Cash"]), F("currency", "Display currency", ["NZD", "AUD"]), F("precision", "Decimal places", ["2", "0"]), F("negative", "Negative number style", ["(1,234.56)", "-1,234.56"]), F("comparative", "Comparative period", [
	"Previous period",
	"Previous year",
	"None"
]);
//#endregion
//#region src/features/page-previews/previewModel.ts
function an(e, t) {
	return Object.fromEntries(e.map((e) => [e.key, t?.[e.key] ?? e.value ?? e.options?.[0] ?? ""]));
}
Object.fromEntries(rn.map((e) => [e.id, [{
	...an(e.fields),
	...e.example,
	id: "sample-1",
	name: e.example.name,
	status: "Draft"
}]]));
function on(e) {
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
//#region src/features/contact-review/reviewModel.ts
var sn = [
	"Customer",
	"Branch",
	"Contact"
], cn = [
	"Manual",
	"Sales draft",
	"Selected contact",
	"Card transcription"
], ln = {
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
}, un = ee(a(), g([
	a().max(2e3),
	w().finite(),
	o()
]));
function dn(e, t) {
	let n = un.parse(t), r = ln[e];
	if (Object.keys(n).some((e) => !Object.hasOwn(r, e))) throw Error("Unsupported draft field. Use the documented fields for this draft type.");
	for (let [e, t] of Object.entries(n)) if (typeof t != typeof r[e]) throw Error(`Invalid value type for ${e}.`);
	return {
		...r,
		...n
	};
}
var fn = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), pn = (e) => String(e ?? "").trim().toLowerCase(), mn = (e) => String(e ?? "").replace(/\D/g, ""), hn = (e, t, n = fn) => !!n(e) && n(e) === n(t);
function gn(e, t) {
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
		(hn(r.businessName, e.businessName) || hn(r.businessName, e.tradingName) || hn(r.tradingName, e.businessName) || hn(r.tradingName, e.tradingName)) && t.push("Business/trading name"), hn(r.email, e.email, pn) && t.push("Email"), hn(r.phone, e.phone, mn) && t.push("Phone"), hn(r.abn, e.abn) && t.push("Identifier"), i(e.id, e.id, e.businessName, [
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
			hn(r.name, e.name) && t.push("Branch name"), String(r.addressLine1).trim() && hn([
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
			].join(" ")) && t.push("Address"), hn(r.phone, e.phone, mn) && t.push("Phone"), i(e.id, n.id, e.name, [
				e.addressLine1,
				e.suburb,
				e.postcode
			].filter(Boolean).join(" · "), t);
		}
		else for (let e of n.contacts) {
			let t = [];
			hn([r.firstName, r.lastName].join(" "), [e.firstName, e.lastName].join(" ")) && t.push("Contact name"), hn(r.email, e.email, pn) && t.push("Email"), (hn(r.phone, e.phone, mn) || hn(r.phone, e.mobile, mn) || hn(r.mobile, e.phone, mn) || hn(r.mobile, e.mobile, mn)) && t.push("Phone/mobile"), i(e.id, n.id, `${e.firstName} ${e.lastName}`, [
				e.email,
				e.phone,
				e.mobile
			].filter(Boolean).join(" · "), t);
		}
	}
	return n.sort((e, t) => t.reasons.length - e.reasons.length || e.name.localeCompare(t.name) || e.id.localeCompare(t.id));
}
function _n(e) {
	return JSON.stringify(e);
}
//#endregion
//#region src/features/data-transfer/transferModel.ts
var vn = [
	"Customers",
	"Suppliers",
	"Customer branches",
	"Customer contacts",
	"Products"
], yn = ["Create", "Update by ID"], bn = "HTT-CSV-1", xn = {
	sku: "",
	name: "",
	category: "Other",
	brand: "",
	collection: "",
	description: "",
	status: "ACTIVE",
	itemType: "STOCK",
	buyEnabled: !0,
	sellEnabled: !0,
	reorderPoint: 0,
	targetStock: 0,
	wholePacks: !0,
	taxCode: "GST",
	baseUnitCode: "PIECE",
	unitsJson: JSON.stringify([{
		code: "PIECE",
		name: "Each",
		symbol: "each",
		conversionToBase: 1,
		basePrice: 0,
		isBaseUnit: !0,
		active: !0
	}])
}, Sn = {
	Customers: ln.Customer,
	Suppliers: {
		businessName: "",
		tradingName: "",
		abn: "",
		status: "ACTIVE",
		email: "",
		phone: "",
		website: "",
		contactName: "",
		addressLine1: "",
		addressLine2: "",
		suburb: "",
		state: "",
		postcode: "",
		country: "",
		paymentTermsDays: 30,
		taxRegistered: !1,
		notes: ""
	},
	"Customer branches": {
		customerId: "",
		...ln.Branch
	},
	"Customer contacts": {
		customerId: "",
		...ln.Contact
	},
	Products: xn
}, Cn = (e) => [
	"_format",
	"id",
	"recordToken",
	"externalId",
	...Object.keys(Sn[e])
], wn = {
	Customers: {
		read: "sales.read",
		write: "contacts.write"
	},
	Suppliers: {
		read: "purchases.read",
		write: "contacts.write"
	},
	"Customer branches": {
		read: "sales.read",
		write: "contacts.write"
	},
	"Customer contacts": {
		read: "sales.read",
		write: "contacts.write"
	},
	Products: {
		read: "inventory.read",
		write: "inventory.adjust"
	}
}, Tn = t({
	dataset: f(vn),
	mode: f(yn),
	fileName: a().trim().min(1).max(200),
	text: a().max(1e6),
	mapping: ee(a(), w().int().nonnegative()).optional()
}).strict();
function En(e) {
	if (e.text.includes("\0")) throw Error("CSV source must be text without NUL characters.");
	let t = on(e.text.replace(/^\uFEFF/, ""));
	if (t.length < 2 || t.length > 501) throw Error("Choose a CSV header and 1–500 data records.");
	let n = t[0].map((e) => e.trim());
	if (n.length > 64 || n.some((e) => !e || e.length > 120) || new Set(n.map((e) => e.toLowerCase())).size !== n.length) throw Error("CSV requires 1–64 distinct, nonempty column names of at most 120 characters.");
	if (t.slice(1).some((e) => e.length !== n.length || e.some((e) => e.length > 1e5))) throw Error("Each CSV record must match the header width; cells may not exceed 100,000 characters.");
	let r = Cn(e.dataset), i = e.mapping ?? Object.fromEntries(r.flatMap((e) => {
		let t = n.findIndex((t) => t.toLowerCase() === e.toLowerCase());
		return t < 0 ? [] : [[e, t]];
	}));
	if (Object.entries(i).some(([e, t]) => !r.includes(e) || t >= n.length)) throw Error("Column mapping contains an unsupported field or column index.");
	return {
		headers: n,
		mapping: i,
		rows: t.slice(1).map((e, t) => {
			let n = Object.fromEntries(Object.entries(i).map(([t, n]) => [t, e[n]]));
			if (n._format && n._format !== "HTT-CSV-1") throw Error("Unsupported HTT CSV export format.");
			if (n._format === "HTT-CSV-1") for (let e of Object.keys(n)) {
				let t = n[e];
				t.startsWith("'") && /^[=+@\-'\t\r]/.test(t.slice(1)) && (n[e] = t.slice(1));
			}
			for (let e of [
				"id",
				"recordToken",
				"externalId"
			]) n[e] && (n[e] = n[e].trim());
			return {
				row: t + 2,
				values: n
			};
		}),
		unmappedColumns: n.filter((e, t) => !Object.values(i).includes(t))
	};
}
function Dn(e) {
	return e.map((e) => e.map((e) => "\"" + (/^[=+@\-'\t\r]/.test(e) ? "'" + e : e).replaceAll("\"", "\"\"") + "\"").join(",")).join("\r\n");
}
//#endregion
//#region src/features/payroll/data/payrollModel.ts
var I = a().trim().min(1).max(200), On = a().refine((e) => /^\d{4}-\d{2}-\d{2}$/.test(e) && !isNaN(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e, "Use a valid date."), kn = a().trim().min(3).max(2e3), An = w().finite().min(0).max(1e9).refine((e) => Math.abs(e * 100 - Math.round(e * 100)) < 1e-5, "Use whole cents."), jn = w().finite().min(0).max(1e5).refine((e) => Math.abs(e * 1e4 - Math.round(e * 1e4)) < 1e-6, "Use at most four decimal places."), Mn = t({
	actorId: I,
	at: xe(),
	action: I,
	reason: kn,
	revision: w().int().positive()
}).strict(), Nn = {
	id: I,
	revision: w().int().positive(),
	history: r(Mn).min(1)
}, Pn = t({
	code: a().trim().min(1).max(40),
	name: I,
	position: a().trim().max(200),
	email: l().or(p("")),
	startDate: On,
	endDate: On.or(p("")),
	status: f(["Active", "Inactive"]),
	basis: f(["Hourly", "Salary"]),
	rate: An,
	earningItemId: I,
	taxScale: f(Se).default("Manual"),
	standardTaxConfirmed: o().default(!1),
	superFund: a().trim().max(200).default(""),
	superMemberId: a().trim().max(100).default(""),
	bankAccount: a().trim().max(100),
	taxIdentifier: a().trim().max(100),
	annualOpening: jn,
	personalOpening: jn
}).strict(), Fn = Pn.extend(Nn).strict(), In = t({
	code: a().trim().min(1).max(40),
	name: I,
	category: f([
		"Earnings",
		"Allowance",
		"Deduction",
		"Tax",
		"Employer contribution"
	]),
	method: f([
		"Hourly",
		"Fixed",
		"Percentage"
	]),
	rate: An,
	taxable: o(),
	accountId: I,
	liabilityAccountId: a().trim().max(200),
	active: o()
}).strict(), Ln = In.extend(Nn).strict(), Rn = t({
	netAccountId: I,
	taxItemId: I,
	currency: a().regex(/^[A-Z]{3}$/),
	region: p("Australia"),
	frequency: f(Ce).default("Fortnightly"),
	superItemId: I,
	employerName: I,
	employerIdentifier: a().trim().max(100)
}).strict(), zn = Rn.extend(Nn).strict(), Bn = t({
	employeeId: I,
	itemId: I,
	date: On,
	hours: jn.refine((e) => e > 0),
	notes: a().trim().max(1e3)
}).strict(), Vn = Bn.extend({
	...Nn,
	status: f([
		"Draft",
		"Submitted",
		"Approved"
	])
}).strict(), Hn = t({
	employeeId: I,
	type: f([
		"Annual",
		"Personal",
		"Unpaid"
	]),
	start: On,
	end: On,
	hours: jn.refine((e) => e > 0),
	notes: a().trim().max(1e3)
}).strict(), Un = Hn.extend({
	...Nn,
	status: f([
		"Pending",
		"Approved",
		"Declined",
		"Cancelled"
	])
}).strict(), Wn = t({
	employeeId: I,
	itemId: I,
	quantity: jn.refine((e) => e > 0),
	rate: An
}).strict(), Gn = t({
	name: I,
	start: On,
	end: On,
	payDate: On,
	employeeInputs: r(t({
		employeeId: I,
		withholding: An,
		additionalWithholding: An.default(0),
		superMethod: f(["Reviewed amount", "12% reviewed QE"]).default("Reviewed amount"),
		superBase: An.default(0),
		superAmount: An.default(0),
		salaryOverride: An.optional(),
		annualAccrual: jn,
		personalAccrual: jn
	}).strict()).min(1).max(500),
	adjustments: r(Wn).max(2e3),
	taxReviewed: o(),
	reviewReference: a().trim().max(500)
}).strict(), Kn = t({
	item: Ln,
	quantity: jn,
	rate: An,
	amount: An,
	source: a().max(200)
}).strict(), qn = t({
	gross: An,
	taxable: An,
	deductions: An,
	net: An,
	employerCost: An,
	withholding: An
}).strict(), Jn = t({
	employee: Fn,
	lines: r(Kn).min(1),
	timeIds: r(I),
	leaveIds: r(I),
	annualAccrual: jn,
	personalAccrual: jn,
	totals: qn
}).strict(), Yn = Gn.extend({
	...Nn,
	status: f([
		"Draft",
		"Approved",
		"Posted",
		"Reversed",
		"Cancelled"
	]),
	slips: r(Jn).min(1),
	totals: qn,
	settings: zn,
	sourceToken: I,
	journalId: I.optional(),
	reversalJournalId: I.optional(),
	reversalDate: On.optional()
}).strict(), Xn = t({
	...Nn,
	operationId: I,
	runId: I,
	accountId: I,
	bankAccountId: I,
	date: On,
	amount: An.refine((e) => e > 0),
	reference: a().trim().max(200),
	status: f(["Posted", "Reversed"]),
	journalId: I,
	reversalJournalId: I.optional(),
	reversalDate: On.optional()
}).strict(), Zn = t({
	...Nn,
	runId: I,
	status: f([
		"Prepared",
		"External reference recorded",
		"Correction needed"
	]),
	reference: a().trim().max(200),
	notes: a().trim().max(1e3),
	runRevision: w().int().positive()
}).strict(), Qn = t({
	employees: r(Fn),
	items: r(Ln),
	timesheets: r(Vn),
	leave: r(Un),
	runs: r(Yn),
	payments: r(Xn),
	filings: r(Zn),
	settings: r(zn).max(1),
	receipts: r(t({
		operationId: I,
		fingerprint: a().regex(/^[a-f0-9]{64}$/),
		input: ee(a(), te()),
		actorId: I,
		entity: f([
			"employees",
			"items",
			"timesheets",
			"leave",
			"runs",
			"payments",
			"filings",
			"settings"
		]),
		recordId: I,
		revision: w().int().positive()
	}).strict())
}).strict(), $n = () => ({
	employees: [],
	items: [],
	timesheets: [],
	leave: [],
	runs: [],
	payments: [],
	filings: [],
	settings: [],
	receipts: []
}), L = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function er(e) {
	let t = (t) => L(e.filter(t).reduce((e, t) => e + t.amount, 0)), n = (e) => ["Earnings", "Allowance"].includes(e.item.category), r = t(n), i = t((e) => ["Deduction", "Tax"].includes(e.item.category));
	return qn.parse({
		gross: r,
		taxable: t((e) => n(e) && e.item.taxable),
		deductions: i,
		net: L(r - i),
		employerCost: t((e) => e.item.category === "Employer contribution"),
		withholding: t((e) => e.item.category === "Tax")
	});
}
function tr(e) {
	return qn.parse(Object.fromEntries(Object.keys(qn.shape).map((t) => [t, L(e.reduce((e, n) => e + n.totals[t], 0))])));
}
//#endregion
//#region electron/security/payrollRepository.ts
var R = $n(), nr = (e) => Array.isArray(e) ? e.map(nr) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, nr(e[t])])) : e, rr = (e) => ye("sha256").update(JSON.stringify(nr(e))).digest("hex"), ir = {
	operationId: I,
	reason: kn
}, ar = {
	id: I.optional(),
	expectedRevision: w().int().nonnegative()
};
function or(e = "payroll.manage") {
	return T.require(e);
}
function z(e, t) {
	let n = R[e].find((e) => e.id === t);
	if (!n) throw Error("Payroll record was not found.");
	return n;
}
var sr = (e) => !["Cancelled", "Reversed"].includes(e.status);
function cr(e, t, n) {
	return R.runs.some((r) => r.id !== n && sr(r) && r.slips.some((n) => (e === "timesheets" ? n.timeIds : n.leaveIds).includes(t)));
}
function lr(e, t) {
	return R[e] = [...R[e].filter((e) => e.id !== t.id), t], structuredClone(t);
}
function ur(e, t, n) {
	let r = (e?.revision ?? 0) + 1;
	return {
		id: e?.id ?? crypto.randomUUID(),
		revision: r,
		history: [...e?.history ?? [], {
			actorId: or("payroll.read").userId,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			action: t,
			reason: n,
			revision: r
		}]
	};
}
function dr(e, t) {
	if ((e?.revision ?? 0) !== t) throw Error("Payroll record changed. Reload before editing.");
}
function fr(e, t, n) {
	let r = rr({
		input: e,
		actorId: or("payroll.read").userId
	}), i = R.receipts.find((t) => t.operationId === e.operationId);
	if (i) {
		if (i.fingerprint !== r || i.entity !== t) throw Error("Operation ID already has different payroll data.");
		return structuredClone(z(t, i.recordId));
	}
	let a = n();
	return R.receipts.push({
		operationId: e.operationId,
		fingerprint: r,
		input: structuredClone(e),
		actorId: or("payroll.read").userId,
		entity: t,
		recordId: a.id,
		revision: a.revision
	}), Qn.parse(R), a;
}
function pr(e, t, n = !0) {
	let r = O.requireById(e);
	if (r.type !== t || n && !r.active || r.systemRole && (t !== "EXPENSE" || r.systemRole !== "OPERATING_EXPENSE")) throw Error(`Use a dedicated ${t.toLowerCase()} payroll account, not a bank, tax, AR/AP or stock control account.`);
	return r;
}
function mr(e, t = !0) {
	if (pr(e.accountId, [
		"Earnings",
		"Allowance",
		"Employer contribution"
	].includes(e.category) ? "EXPENSE" : "LIABILITY", t), e.category === "Employer contribution") pr(e.liabilityAccountId, "LIABILITY", t);
	else if (e.liabilityAccountId) throw Error("Only employer contributions use a second liability account.");
	if (["Earnings", "Allowance"].includes(e.category) && e.method === "Percentage" || e.category === "Tax" && e.method !== "Fixed") throw Error("Earnings use hourly/fixed values; withholding tax is an explicitly reviewed fixed amount.");
	if (e.method === "Percentage" && e.rate > 100) throw Error("Percentage rates cannot exceed 100.");
}
function hr(e) {
	let t = z("employees", e);
	if (t.status !== "Active") throw Error("Select an active employee.");
	return t;
}
function gr(e, t, n = t) {
	if (t < e.startDate || e.endDate && n > e.endDate) throw Error("Dates must be within the employment period.");
}
function _r() {
	let e = R.settings[0];
	if (!e) throw Error("Configure payroll settings first.");
	pr(e.netAccountId, "LIABILITY");
	let t = z("items", e.taxItemId);
	if (t.category !== "Tax" || !t.active) throw Error("Select an active fixed withholding item.");
	if (mr(t), e.netAccountId === t.accountId) throw Error("Net wages and withholding require separate liability accounts.");
	let n = z("items", e.superItemId);
	if (n.category !== "Employer contribution" || n.method !== "Fixed" || !n.active) throw Error("Use an active fixed super contribution item.");
	if (mr(n), e.currency !== "AUD" || e.currency !== _().currency) throw Error("Payroll currency must match the business currency.");
	return e;
}
function vr(e, t) {
	let n = z("employees", e), r = n.annualOpening, i = n.personalOpening, a = /* @__PURE__ */ new Set();
	for (let n of R.runs.filter((e) => e.status === "Posted" && e.id !== t)) for (let t of n.slips.filter((t) => t.employee.id === e)) {
		r += t.annualAccrual, i += t.personalAccrual;
		for (let e of t.leaveIds) {
			let t = z("leave", e);
			a.add(e), t.type === "Annual" && (r -= t.hours), t.type === "Personal" && (i -= t.hours);
		}
	}
	let o = R.leave.filter((t) => t.employeeId === e && t.status === "Approved" && !a.has(t.id));
	return {
		annual: Math.round(r * 1e4) / 1e4,
		personal: Math.round(i * 1e4) / 1e4,
		reservedAnnual: o.filter((e) => e.type === "Annual").reduce((e, t) => e + t.hours, 0),
		reservedPersonal: o.filter((e) => e.type === "Personal").reduce((e, t) => e + t.hours, 0)
	};
}
function yr(e, t) {
	let n = vr(e, t);
	if (n.annual - n.reservedAnnual < -1e-5 || n.personal - n.reservedPersonal < -1e-5) throw Error("Approved leave exceeds the available recorded hours.");
}
var br = () => rr({
	employees: R.employees,
	items: R.items,
	timesheets: R.timesheets,
	leave: R.leave,
	settings: R.settings
});
function xr(e, t) {
	if (e.start > e.end || e.payDate < e.end) throw Error("Pay date must follow a valid pay period.");
	let n = _r(), r = /* @__PURE__ */ new Set(), i = [];
	for (let a of e.employeeInputs) {
		if (r.has(a.employeeId)) throw Error("Include each employee only once.");
		r.add(a.employeeId);
		let o = hr(a.employeeId);
		if (o.startDate > e.end || o.endDate && o.endDate < e.start) throw Error("Employment does not overlap this pay period.");
		if (o.basis === "Salary" && (o.startDate > e.start || o.endDate && o.endDate < e.end) && a.salaryOverride === void 0) throw Error("Partial-period salary requires a reviewed salary override.");
		if (R.runs.some((n) => n.id !== t && sr(n) && n.start <= e.end && n.end >= e.start && n.slips.some((e) => e.employee.id === o.id))) throw Error("Employee already has an overlapping pay run. Cancel or reverse it before replacing it.");
		let s = z("items", o.earningItemId);
		if (!s.active || s.category !== "Earnings" || s.method !== (o.basis === "Hourly" ? "Hourly" : "Fixed")) throw Error("Employee earning item does not match the pay basis.");
		mr(s);
		let c = R.timesheets.filter((t) => t.employeeId === o.id && t.status === "Approved" && t.date >= e.start && t.date <= e.end), l = R.leave.filter((t) => t.employeeId === o.id && t.status === "Approved" && t.start <= e.end && t.end >= e.start);
		if (l.some((t) => t.start < e.start || t.end > e.end)) throw Error("Split leave spanning pay periods before including it in payroll.");
		if (c.some((e) => cr("timesheets", e.id, t)) || l.some((e) => cr("leave", e.id, t))) throw Error("Hours or leave are already reserved by another pay run.");
		if (c.some((e) => l.some((t) => e.date >= t.start && e.date <= t.end))) throw Error("Approved timesheet and leave dates overlap; correct them before payroll.");
		if (o.basis === "Salary" && l.some((e) => e.type === "Unpaid") && a.salaryOverride === void 0) throw Error("Salary with unpaid leave requires an explicitly reviewed salary override.");
		if (o.basis === "Hourly" && a.salaryOverride !== void 0) throw Error("Hourly employees cannot use a salary override.");
		let u = [], d = (e, t, n, r) => {
			if (mr(e), !e.active) throw Error("Inactive pay item.");
			let i = L(t * n);
			An.parse(i), u.push({
				item: structuredClone(e),
				quantity: t,
				rate: n,
				amount: i,
				source: r
			});
		};
		o.basis === "Salary" && d(s, 1, a.salaryOverride ?? o.rate, "Salary");
		for (let e of c) {
			if (o.basis === "Salary") {
				if (e.itemId !== s.id) throw Error("Salary timesheets record ordinary hours only; use an explicit adjustment for extra pay.");
				continue;
			}
			let t = z("items", e.itemId);
			if (t.category !== "Earnings" || t.method !== "Hourly") throw Error("Timesheet must use hourly earnings.");
			d(t, e.hours, t.id === s.id ? o.rate : t.rate, "Time:" + e.id);
		}
		if (o.basis === "Hourly") for (let e of l.filter((e) => e.type !== "Unpaid")) d(s, e.hours, o.rate, "Leave:" + e.id);
		let f = e.adjustments.filter((e) => e.employeeId === o.id), p = f.filter((e) => z("items", e.itemId).method !== "Percentage");
		for (let e of p) {
			let t = z("items", e.itemId);
			if (t.id === n.superItemId) throw Error("Use the employee super guarantee fields for the standard contribution.");
			if (t.category === "Tax") throw Error("Use the explicit employee withholding field for tax.");
			if (t.method === "Fixed" && e.quantity !== 1) throw Error("Fixed pay items require quantity 1.");
			d(t, e.quantity, e.rate, "Adjustment");
		}
		let m = L(u.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + t.amount, 0));
		if (m <= 0) throw Error("Each employee needs positive gross earnings.");
		for (let e of f.filter((e) => z("items", e.itemId).method === "Percentage")) {
			if (e.quantity !== 1 || e.rate > 100) throw Error("Percentage items require quantity 1 and rate 0–100.");
			d(z("items", e.itemId), 1, L(m * e.rate / 100), "Adjustment"), u[u.length - 1].quantity = 1, u[u.length - 1].rate = e.rate;
		}
		let h = L(u.filter((e) => ["Earnings", "Allowance"].includes(e.item.category) && e.item.taxable).reduce((e, t) => e + t.amount, 0)), g = a.withholding;
		if (o.taxScale !== "Manual") {
			if (!o.standardTaxConfirmed) throw Error("Confirm the standard PAYG case or use reviewed manual withholding.");
			if (!o.taxScale.startsWith("4-") && !/^\d{8,9}$/.test(o.taxIdentifier.replace(/\s/g, ""))) throw Error("Record a provided eight- or nine-digit TFN for the selected scale.");
			if (a.withholding !== 0) throw Error("Clear manual withholding for an automatic PAYG employee.");
			g = Te(h, o.taxScale, n.frequency, e.payDate);
		}
		if (g = L(g + a.additionalWithholding), d(z("items", n.taxItemId), 1, g, o.taxScale === "Manual" ? "Reviewed PAYG" : "ATO 2026–27 scale " + o.taxScale), a.superMethod === "12% reviewed QE" && (e.payDate < "2026-07-01" || e.payDate > "2027-06-30" || a.superBase > m)) throw Error("Reviewed qualifying earnings must not exceed gross and the 12% helper is limited to 2026–27. Use a reviewed super amount for exceptions.");
		let ee = a.superMethod === "12% reviewed QE" ? L(a.superBase * .12) : a.superAmount;
		d(z("items", n.superItemId), 1, ee, a.superMethod === "12% reviewed QE" ? "SG 12% reviewed QE" : "Reviewed SG amount");
		let te = er(u);
		i.push({
			employee: structuredClone(o),
			lines: u,
			timeIds: c.map((e) => e.id),
			leaveIds: l.map((e) => e.id),
			annualAccrual: a.annualAccrual,
			personalAccrual: a.personalAccrual,
			totals: te
		});
	}
	if (e.adjustments.some((e) => !r.has(e.employeeId))) throw Error("Adjustment employee is not included in this run.");
	return {
		slips: i,
		totals: tr(i),
		settings: structuredClone(n),
		sourceToken: br()
	};
}
function Sr(e) {
	let t = [];
	for (let n of e.slips) {
		for (let e of n.lines.filter((e) => e.amount > 0)) {
			let n = [
				"Earnings",
				"Allowance",
				"Employer contribution"
			].includes(e.item.category);
			t.push({
				accountId: e.item.accountId,
				debit: n ? e.amount : 0,
				credit: n ? 0 : e.amount
			}), e.item.category === "Employer contribution" && t.push({
				accountId: e.item.liabilityAccountId,
				debit: 0,
				credit: e.amount
			});
		}
		n.totals.net && t.push({
			accountId: e.settings.netAccountId,
			debit: 0,
			credit: n.totals.net
		});
	}
	return t;
}
function Cr(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of Sr(e).filter((e) => e.credit)) t.set(n.accountId, L((t.get(n.accountId) ?? 0) + n.credit));
	return [...t].map(([t, n]) => ({
		accountId: t,
		amount: n,
		paid: L(R.payments.filter((n) => n.runId === e.id && n.accountId === t && n.status === "Posted").reduce((e, t) => e + t.amount, 0))
	}));
}
y("payroll", {
	repository: {
		balances(e) {
			return or("payroll.read"), vr(I.parse(e));
		},
		obligations(e) {
			return or("payroll.read"), Cr(z("runs", I.parse(e)));
		},
		setupDefaults(e) {
			or(), T.require("accounting.post");
			let n = t(ir).strict().parse(e);
			return fr(n, "settings", () => {
				if (R.settings.length) throw Error("Payroll is already configured.");
				let e = (e, t, n) => {
					for (; O.getAll().some((t) => t.code === String(e));) e++;
					return O.create({
						code: String(e),
						name: t,
						type: n,
						active: !0,
						allowManualPosting: n === "EXPENSE"
					}).id;
				}, t = e(6e3, "Payroll wages", "EXPENSE"), r = e(6010, "Payroll employer contributions", "EXPENSE"), i = e(2200, "Net wages payable", "LIABILITY"), a = e(2210, "Payroll withholding payable", "LIABILITY"), o = e(2220, "Payroll deductions payable", "LIABILITY"), s = e(2230, "Employer contributions payable", "LIABILITY"), c = (e, t, r, i, a, o = "") => {
					let s = {
						...ur(void 0, "Created", n.reason),
						code: e,
						name: t,
						category: r,
						method: i,
						rate: 0,
						taxable: ["Earnings", "Allowance"].includes(r),
						accountId: a,
						liabilityAccountId: o,
						active: !0
					};
					return R.items.push(s), s;
				};
				c("ORD", "Ordinary hours", "Earnings", "Hourly", t), c("SAL", "Salary per run", "Earnings", "Fixed", t);
				let l = c("TAX", "Reviewed withholding", "Tax", "Fixed", a);
				c("ALLOW", "Allowance", "Allowance", "Fixed", t), c("DEDUCT", "Employee deduction", "Deduction", "Fixed", o);
				let u = c("SG", "Super guarantee", "Employer contribution", "Fixed", r, s);
				return lr("settings", {
					...ur(void 0, "Configured", n.reason),
					netAccountId: i,
					taxItemId: l.id,
					currency: _().currency,
					region: "Australia",
					frequency: "Fortnightly",
					superItemId: u.id,
					employerName: _().companyName,
					employerIdentifier: ""
				});
			});
		},
		saveEmployee(e) {
			or();
			let n = t({
				...ir,
				...ar,
				values: Pn
			}).strict().parse(e);
			return fr(n, "employees", () => {
				let e = n.id ? z("employees", n.id) : void 0;
				if (dr(e, n.expectedRevision), R.employees.some((t) => t.id !== e?.id && t.code.toLowerCase() === n.values.code.toLowerCase())) throw Error("Employee code already exists.");
				if (n.values.endDate && n.values.endDate < n.values.startDate) throw Error("Employment end date is before the start date.");
				let t = z("items", n.values.earningItemId);
				if (!t.active || t.category !== "Earnings" || t.method !== (n.values.basis === "Hourly" ? "Hourly" : "Fixed")) throw Error("Select an active earning item matching the pay basis.");
				if (e && R.runs.some((t) => ["Posted", "Reversed"].includes(t.status) && t.slips.some((t) => t.employee.id === e.id)) && (e.annualOpening !== n.values.annualOpening || e.personalOpening !== n.values.personalOpening)) throw Error("Opening leave hours are locked after payroll posting.");
				return lr("employees", {
					...n.values,
					...ur(e, e ? "Edited" : "Created", n.reason)
				});
			});
		},
		saveItem(e) {
			or();
			let n = t({
				...ir,
				...ar,
				values: In
			}).strict().parse(e);
			return fr(n, "items", () => {
				let e = n.id ? z("items", n.id) : void 0;
				if (dr(e, n.expectedRevision), R.items.some((t) => t.id !== e?.id && t.code.toLowerCase() === n.values.code.toLowerCase())) throw Error("Pay item code already exists.");
				let t = {
					...n.values,
					...ur(e, e ? "Edited" : "Created", n.reason)
				};
				return mr(t), lr("items", t);
			});
		},
		saveSettings(e) {
			or();
			let n = t({
				...ir,
				expectedRevision: w().int().nonnegative(),
				values: Rn
			}).strict().parse(e);
			return fr(n, "settings", () => {
				let e = R.settings[0];
				dr(e, n.expectedRevision), pr(n.values.netAccountId, "LIABILITY");
				let t = z("items", n.values.superItemId);
				if (t.category !== "Employer contribution" || t.method !== "Fixed" || !t.active) throw Error("Select an active fixed super guarantee item.");
				let r = z("items", n.values.taxItemId);
				if (r.category !== "Tax" || !r.active || r.accountId === n.values.netAccountId) throw Error("Use a valid withholding item and a separate net wages account.");
				if (n.values.currency !== "AUD" || n.values.currency !== _().currency) throw Error("Payroll currency must match the business.");
				return lr("settings", {
					...n.values,
					...ur(e, "Settings changed", n.reason)
				});
			});
		},
		saveTime(e) {
			or();
			let n = t({
				...ir,
				...ar,
				values: Bn
			}).strict().parse(e);
			return fr(n, "timesheets", () => {
				let e = n.id ? z("timesheets", n.id) : void 0;
				if (dr(e, n.expectedRevision), e && (e.status !== "Draft" || cr("timesheets", e.id))) throw Error("Only an unreserved draft timesheet can be edited.");
				let t = hr(n.values.employeeId);
				gr(t, n.values.date);
				let r = z("items", n.values.itemId);
				if (!r.active || r.category !== "Earnings" || t.basis === "Hourly" && r.method !== "Hourly" || t.basis === "Salary" && r.id !== t.earningItemId) throw Error("Select an appropriate employee earnings item.");
				if (R.timesheets.filter((r) => r.id !== e?.id && r.employeeId === t.id && r.date === n.values.date).reduce((e, t) => e + t.hours, 0) + n.values.hours > 24) throw Error("Total timesheet hours cannot exceed 24 for one employee/day.");
				if (R.timesheets.some((i) => i.id !== e?.id && i.employeeId === t.id && i.itemId === r.id && i.date === n.values.date)) throw Error("A timesheet already exists for this employee, day and item.");
				return lr("timesheets", {
					...n.values,
					...ur(e, e ? "Edited" : "Created", n.reason),
					status: "Draft"
				});
			});
		},
		changeTime(e) {
			let n = t({
				...ir,
				id: I,
				expectedRevision: w().int().positive(),
				action: f([
					"Submit",
					"Approve",
					"Reopen"
				])
			}).strict().parse(e);
			return or(n.action === "Approve" ? "payroll.approve" : "payroll.manage"), fr(n, "timesheets", () => {
				let e = z("timesheets", n.id);
				if (dr(e, n.expectedRevision), cr("timesheets", e.id)) throw Error("Timesheet is reserved by a pay run.");
				if (n.action === "Submit" && e.status !== "Draft" || n.action === "Approve" && e.status !== "Submitted" || n.action === "Reopen" && e.status === "Draft") throw Error("Invalid timesheet transition.");
				return lr("timesheets", {
					...e,
					...ur(e, n.action, n.reason),
					status: n.action === "Submit" ? "Submitted" : n.action === "Approve" ? "Approved" : "Draft"
				});
			});
		},
		saveLeave(e) {
			or();
			let n = t({
				...ir,
				...ar,
				values: Hn
			}).strict().parse(e);
			return fr(n, "leave", () => {
				let e = n.id ? z("leave", n.id) : void 0;
				if (dr(e, n.expectedRevision), e && (e.status !== "Pending" || cr("leave", e.id))) throw Error("Only an unreserved pending leave request can be edited.");
				let t = hr(n.values.employeeId);
				if (gr(t, n.values.start, n.values.end), n.values.hours > ((Date.parse(n.values.end) - Date.parse(n.values.start)) / 864e5 + 1) * 24) throw Error("Leave hours exceed the selected date range.");
				if (n.values.start > n.values.end) throw Error("Leave dates are invalid.");
				if (R.leave.some((r) => r.id !== e?.id && r.employeeId === t.id && ["Pending", "Approved"].includes(r.status) && r.start <= n.values.end && r.end >= n.values.start)) throw Error("Leave request dates overlap.");
				return lr("leave", {
					...n.values,
					...ur(e, e ? "Edited" : "Created", n.reason),
					status: "Pending"
				});
			});
		},
		changeLeave(e) {
			let n = t({
				...ir,
				id: I,
				expectedRevision: w().int().positive(),
				action: f([
					"Approve",
					"Decline",
					"Cancel",
					"Reopen"
				])
			}).strict().parse(e);
			return or(n.action === "Approve" || n.action === "Decline" ? "payroll.approve" : "payroll.manage"), fr(n, "leave", () => {
				let e = z("leave", n.id);
				if (dr(e, n.expectedRevision), cr("leave", e.id)) throw Error("Leave is reserved by a pay run.");
				if (["Approve", "Decline"].includes(n.action) && e.status !== "Pending" || n.action === "Cancel" && ["Cancelled", "Declined"].includes(e.status) || n.action === "Reopen" && !["Cancelled", "Declined"].includes(e.status)) throw Error("Invalid leave transition.");
				let t = lr("leave", {
					...e,
					...ur(e, n.action, n.reason),
					status: n.action === "Approve" ? "Approved" : n.action === "Decline" ? "Declined" : n.action === "Cancel" ? "Cancelled" : "Pending"
				});
				return t.status === "Approved" && yr(e.employeeId), t;
			});
		},
		saveRun(e) {
			or();
			let n = t({
				...ir,
				...ar,
				values: Gn
			}).strict().parse(e);
			return fr(n, "runs", () => {
				let e = n.id ? z("runs", n.id) : void 0;
				if (dr(e, n.expectedRevision), e && e.status !== "Draft") throw Error("Only a draft pay run can be recalculated.");
				let t = xr(n.values, e?.id);
				return lr("runs", {
					...n.values,
					...ur(e, e ? "Recalculated" : "Created", n.reason),
					...t,
					status: "Draft"
				});
			});
		},
		changeRun(e) {
			let n = t({
				...ir,
				id: I,
				expectedRevision: w().int().positive(),
				action: f([
					"Approve",
					"Reopen",
					"Cancel",
					"Post",
					"Reverse"
				]),
				date: On.optional()
			}).strict().parse(e);
			return or(n.action === "Approve" ? "payroll.approve" : ["Post", "Reverse"].includes(n.action) ? "payroll.post" : "payroll.manage"), fr(n, "runs", () => {
				let e = z("runs", n.id);
				if (dr(e, n.expectedRevision), n.action === "Approve" || n.action === "Post") {
					if (e.status !== (n.action === "Approve" ? "Draft" : "Approved")) throw Error("Invalid pay-run transition.");
					if (!e.taxReviewed || e.reviewReference.trim().length < 3) throw Error("Confirm reviewed withholding and provide its reference.");
					if (e.sourceToken !== br()) throw Error("Payroll sources changed. Reopen and recalculate the run.");
					if (rr(xr(Gn.parse(Object.fromEntries(Object.keys(Gn.shape).map((t) => [t, e[t]]))), e.id).slips) !== rr(e.slips)) throw Error("Payroll calculation changed. Recalculate the run.");
				}
				if (n.action === "Approve") return lr("runs", {
					...e,
					...ur(e, "Approved", n.reason),
					status: "Approved"
				});
				if (n.action === "Reopen") {
					if (e.status !== "Approved") throw Error("Only an approved run can be reopened.");
					return lr("runs", {
						...e,
						...ur(e, "Reopened", n.reason),
						status: "Draft",
						taxReviewed: !1
					});
				}
				if (n.action === "Cancel") {
					if (!["Draft", "Approved"].includes(e.status)) throw Error("Only an unposted run can be cancelled.");
					return lr("runs", {
						...e,
						...ur(e, "Cancelled", n.reason),
						status: "Cancelled"
					});
				}
				if (N(), n.action === "Post") {
					let t = A.post({
						journalDate: e.payDate,
						description: "Payroll " + e.name,
						reference: e.id,
						sourceType: "PAYROLL",
						sourceId: e.id,
						lines: Sr(e)
					}), r = lr("runs", {
						...e,
						...ur(e, "Posted", n.reason),
						status: "Posted",
						journalId: t.id
					});
					return e.slips.forEach((e) => yr(e.employee.id)), r;
				}
				if (e.status !== "Posted" || !n.date || n.date < e.payDate) throw Error("Reverse a posted run on or after its pay date.");
				if (R.payments.some((t) => t.runId === e.id && t.status === "Posted")) throw Error("Reverse recorded payroll payments before reversing the run.");
				let t = A.reverse({
					journalEntryId: e.journalId,
					reversalDate: n.date,
					reason: n.reason
				}), r = lr("runs", {
					...e,
					...ur(e, "Reversed", n.reason),
					status: "Reversed",
					reversalJournalId: t.id,
					reversalDate: n.date
				});
				e.slips.forEach((e) => yr(e.employee.id));
				for (let t of R.filings.filter((t) => t.runId === e.id)) lr("filings", {
					...t,
					...ur(t, "Correction needed", n.reason),
					status: "Correction needed"
				});
				return r;
			});
		},
		recordPayment(e) {
			or("payroll.post"), T.require("banking.write");
			let n = t({
				...ir,
				runId: I,
				accountId: I,
				bankAccountId: I,
				date: On,
				amount: An.refine((e) => e > 0),
				reference: a().trim().max(200)
			}).strict().parse(e);
			return fr(n, "payments", () => {
				N();
				let e = z("runs", n.runId);
				if (e.status !== "Posted" || n.date < e.payDate) throw Error("Record payment against a posted run on or after pay date.");
				let t = Cr(e).find((e) => e.accountId === n.accountId);
				if (!t || n.amount > L(t.amount - t.paid)) throw Error("Payment exceeds the outstanding payroll liability.");
				pr(n.accountId, "LIABILITY");
				let r = jt.requireById(n.bankAccountId), i = O.requireById(r.glAccountId);
				if (!r.active || !i.active || i.type !== "ASSET" || r.currency !== e.settings.currency || n.date < r.openingBalanceDate) throw Error("Use an active bank in the payroll currency with a valid posting date.");
				let a = ur(void 0, "Payment recorded", n.reason), o = A.post({
					journalDate: n.date,
					description: "Payroll payment " + e.name,
					reference: n.reference,
					sourceType: "PAYROLL_PAYMENT",
					sourceId: a.id,
					lines: [{
						accountId: n.accountId,
						debit: n.amount,
						credit: 0
					}, {
						accountId: r.glAccountId,
						debit: 0,
						credit: n.amount
					}]
				}), { reason: s, ...c } = n;
				return lr("payments", {
					...c,
					...a,
					status: "Posted",
					journalId: o.id
				});
			});
		},
		reversePayment(e) {
			or("payroll.post"), T.require("banking.write");
			let n = t({
				...ir,
				id: I,
				expectedRevision: w().int().positive(),
				date: On
			}).strict().parse(e);
			return fr(n, "payments", () => {
				N();
				let e = z("payments", n.id);
				if (dr(e, n.expectedRevision), e.status !== "Posted" || n.date < e.date) throw Error("Reverse a posted payment on or after its date.");
				Fe("PAYROLL_PAYMENT", e.id);
				let t = A.reverse({
					journalEntryId: e.journalId,
					reversalDate: n.date,
					reason: n.reason
				});
				return lr("payments", {
					...e,
					...ur(e, "Payment reversed", n.reason),
					status: "Reversed",
					reversalJournalId: t.id,
					reversalDate: n.date
				});
			});
		},
		recordFiling(e) {
			or();
			let n = t({
				...ir,
				runId: I,
				expectedRevision: w().int().nonnegative(),
				reference: a().trim().max(200),
				notes: a().trim().max(1e3)
			}).strict().parse(e);
			return fr(n, "filings", () => {
				let e = z("runs", n.runId);
				if (e.status !== "Posted") throw Error("Prepare filing review only for a posted run.");
				let t = R.filings.find((t) => t.runId === e.id);
				return dr(t, n.expectedRevision), lr("filings", {
					...ur(t, "Filing review recorded", n.reason),
					runId: e.id,
					runRevision: e.revision,
					reference: n.reference,
					notes: n.notes,
					status: n.reference ? "External reference recorded" : "Prepared"
				});
			});
		},
		exportSlip(e) {
			or("payroll.read");
			let n = t({
				runId: I,
				employeeId: I
			}).strict().parse(e), r = z("runs", n.runId), i = r.slips.find((e) => e.employee.id === n.employeeId);
			if (!i) throw Error("Payslip was not found.");
			return {
				name: "Payslip-" + r.id + "-" + i.employee.code.replace(/[^A-Za-z0-9_-]/g, "_") + ".txt",
				text: [
					r.settings.employerName,
					"Employer ABN: " + (r.settings.employerIdentifier || "Not recorded"),
					"PAYSLIP · " + r.status,
					r.name,
					`${r.start} to ${r.end} · Pay date ${r.payDate} · ${r.settings.currency}`,
					i.employee.code + " · " + i.employee.name,
					"Super fund: " + (i.employee.superFund || "Not recorded") + " · Member: " + (i.employee.superMemberId || "Not recorded"),
					...i.lines.map((e) => `${e.item.name}: ${e.quantity} × ${e.rate} = ${e.amount.toFixed(2)}`),
					`Gross ${i.totals.gross.toFixed(2)} · Withholding ${i.totals.withholding.toFixed(2)} · Deductions ${i.totals.deductions.toFixed(2)} · Net ${i.totals.net.toFixed(2)} · Employer contributions ${i.totals.employerCost.toFixed(2)}`,
					"Withholding review: " + r.reviewReference,
					"Accrued payroll; payment completion is recorded separately."
				].join("\n")
			};
		},
		exportRun(e) {
			or("payroll.read");
			let t = z("runs", I.parse(e)), n = [[
				"Employer",
				"ABN",
				"Frequency",
				"TFN",
				"Super fund",
				"Super member",
				"Run",
				"Status",
				"Period start",
				"Period end",
				"Pay date",
				"Currency",
				"Employee code",
				"Name",
				"Gross",
				"Taxable gross",
				"Withholding",
				"Other deductions",
				"Net",
				"Employer contributions",
				"Review reference"
			], ...t.slips.map((e) => [
				t.settings.employerName,
				t.settings.employerIdentifier,
				t.settings.frequency,
				e.employee.taxIdentifier,
				e.employee.superFund,
				e.employee.superMemberId,
				t.name,
				t.status,
				t.start,
				t.end,
				t.payDate,
				t.settings.currency,
				e.employee.code,
				e.employee.name,
				String(e.totals.gross),
				String(e.totals.taxable),
				String(e.totals.withholding),
				String(L(e.totals.deductions - e.totals.withholding)),
				String(e.totals.net),
				String(e.totals.employerCost),
				t.reviewReference
			])];
			return {
				name: "Payroll-review-" + t.id + ".csv",
				csv: Dn(n)
			};
		}
	},
	read: "payroll.read",
	commands: {
		balances: "payroll.read",
		obligations: "payroll.read",
		setupDefaults: "payroll.manage",
		saveEmployee: "payroll.manage",
		saveItem: "payroll.manage",
		saveSettings: "payroll.manage",
		saveTime: "payroll.manage",
		changeTime: "payroll.manage",
		saveLeave: "payroll.manage",
		changeLeave: "payroll.manage",
		saveRun: "payroll.manage",
		changeRun: "payroll.manage",
		recordPayment: "payroll.post",
		reversePayment: "payroll.post",
		recordFiling: "payroll.manage",
		exportRun: "payroll.read",
		exportSlip: "payroll.read"
	},
	snapshot: () => R,
	restore: (e) => {
		R = e;
	},
	publish: () => {},
	validate: (e, t) => {
		let n = Qn.parse(e), r = t, i = r.accounts.accounts, a = r.journals.journalEntries, o = r.bankAccounts.bankAccounts, s = (e, t) => {
			let r = n[e].find((e) => e.id === t);
			if (!r) throw Error("Invalid payroll reference.");
			return r;
		}, c = (e, t) => {
			let n = i.find((t) => t.id === e);
			if (!n || n.type !== t || n.systemRole && (t !== "EXPENSE" || n.systemRole !== "OPERATING_EXPENSE")) throw Error("Invalid payroll account mapping.");
		};
		for (let e of [n.employees, n.items]) if (new Set(e.map((e) => e.code.toLowerCase())).size !== e.length) throw Error("Duplicate payroll code.");
		let l = /* @__PURE__ */ new Set();
		for (let e of [
			"employees",
			"items",
			"timesheets",
			"leave",
			"runs",
			"payments",
			"filings",
			"settings"
		]) for (let t of n[e]) {
			if (l.has(t.id)) throw Error("Duplicate payroll record ID.");
			if (l.add(t.id), t.history.length !== t.revision || t.history.some((e, t) => e.revision !== t + 1)) throw Error("Invalid payroll revision history.");
		}
		for (let e of n.items) if (c(e.accountId, [
			"Earnings",
			"Allowance",
			"Employer contribution"
		].includes(e.category) ? "EXPENSE" : "LIABILITY"), e.category === "Employer contribution" && c(e.liabilityAccountId, "LIABILITY"), e.method === "Percentage" && ([
			"Earnings",
			"Allowance",
			"Tax"
		].includes(e.category) || e.rate > 100) || e.category === "Tax" && e.method !== "Fixed") throw Error("Invalid payroll item method.");
		for (let e of n.settings) {
			if (e.currency !== "AUD" || s("items", e.superItemId).category !== "Employer contribution") throw Error("Invalid AU payroll settings.");
			if (c(e.netAccountId, "LIABILITY"), s("items", e.taxItemId).category !== "Tax" || e.netAccountId === s("items", e.taxItemId).accountId) throw Error("Invalid payroll settings.");
		}
		for (let e of n.employees) if (s("items", e.earningItemId), e.endDate && e.endDate < e.startDate) throw Error("Invalid employment dates.");
		for (let e of n.timesheets) s("employees", e.employeeId), s("items", e.itemId);
		for (let e of n.leave) if (s("employees", e.employeeId), e.start > e.end) throw Error("Invalid leave dates.");
		let u = (e) => {
			let t = /* @__PURE__ */ new Map();
			for (let n of e) {
				let e = t.get(n.accountId) ?? [0, 0];
				t.set(n.accountId, [L(e[0] + n.debit), L(e[1] + n.credit)]);
			}
			return [...t].filter(([, e]) => e[0] || e[1]).sort(([e], [t]) => e.localeCompare(t));
		};
		function d(e, t, n, r, i, o, s, c) {
			let l = a.find((t) => t.id === e);
			if (!l || l.sourceType !== t || l.sourceId !== n || l.journalDate !== r || rr(u(l.lines)) !== rr(u(i)) || l.status !== (o ? "REVERSED" : "POSTED")) throw Error("Payroll source journal mismatch.");
			if (o) {
				let e = a.find((e) => e.id === s);
				if (!e || e.reversedJournalEntryId !== l.id || l.reversalJournalEntryId !== e.id || e.journalDate !== c || rr(u(e.lines)) !== rr(u(i.map((e) => ({
					...e,
					debit: e.credit,
					credit: e.debit
				}))))) throw Error("Payroll reversal journal mismatch.");
			} else if (s || c) throw Error("Unexpected payroll reversal metadata.");
		}
		let f = /* @__PURE__ */ new Set();
		for (let e of n.runs) {
			if (e.start > e.end || e.payDate < e.end || new Set(e.employeeInputs.map((e) => e.employeeId)).size !== e.employeeInputs.length || e.slips.length !== e.employeeInputs.length || new Set(e.slips.map((e) => e.employee.id)).size !== e.slips.length) throw Error("Invalid payroll period or employees.");
			c(e.settings.netAccountId, "LIABILITY");
			for (let t of e.slips) {
				let n = s("employees", t.employee.id), r = e.employeeInputs.find((e) => e.employeeId === t.employee.id);
				if (!r || t.employee.revision > n.revision || r.annualAccrual !== t.annualAccrual || r.personalAccrual !== t.personalAccrual) throw Error("Invalid payroll employee snapshot.");
				let i = L(t.lines.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + t.amount, 0));
				for (let e of t.lines) {
					s("items", e.item.id), c(e.item.accountId, [
						"Earnings",
						"Allowance",
						"Employer contribution"
					].includes(e.item.category) ? "EXPENSE" : "LIABILITY"), e.item.category === "Employer contribution" && c(e.item.liabilityAccountId, "LIABILITY");
					let t = e.item.method === "Percentage" ? L(i * e.rate / 100) : L(e.quantity * e.rate);
					if (e.amount !== t) throw Error("Payroll line calculation mismatch.");
				}
				if (t.employee.taxScale !== "Manual" && (!t.employee.standardTaxConfirmed || r.withholding !== 0)) throw Error("Automatic PAYG declaration mismatch.");
				let a = t.lines.filter((t) => t.item.id === e.settings.superItemId), o = t.lines.filter((e) => e.item.category === "Tax");
				if (a.length !== 1 || a[0].amount !== (r.superMethod === "12% reviewed QE" ? L(r.superBase * .12) : r.superAmount) || o.length !== 1 || o[0].item.id !== e.settings.taxItemId || new Set(t.timeIds).size !== t.timeIds.length || new Set(t.leaveIds).size !== t.leaveIds.length) throw Error("Payroll tax, super or source snapshot mismatch.");
				let l = L((t.employee.taxScale === "Manual" ? r.withholding : Te(t.totals.taxable, t.employee.taxScale, e.settings.frequency, e.payDate)) + r.additionalWithholding);
				if (rr(er(t.lines)) !== rr(t.totals) || t.totals.withholding !== l) throw Error("Payroll payslip totals mismatch.");
				for (let [n, r] of [["timesheets", t.timeIds], ["leave", t.leaveIds]]) for (let i of r) {
					let r = s(n, i);
					if (r.employeeId !== t.employee.id) throw Error("Payroll hours belong to another employee.");
					if (sr(e)) {
						if (f.has(i) || r.status !== "Approved") throw Error("Payroll source is reused or unapproved.");
						f.add(i);
					}
				}
			}
			if (rr(tr(e.slips)) !== rr(e.totals)) throw Error("Payroll run totals mismatch.");
			if (["Posted", "Reversed"].includes(e.status)) {
				if (!e.taxReviewed || e.reviewReference.trim().length < 3) throw Error("Posted payroll has no withholding review.");
				d(e.journalId, "PAYROLL", e.id, e.payDate, Sr(e), e.status === "Reversed", e.reversalJournalId, e.reversalDate);
			} else if (e.journalId || e.reversalJournalId) throw Error("Unposted payroll has journal metadata.");
		}
		for (let e of n.payments) {
			let t = s("runs", e.runId), n = o.find((t) => t.id === e.bankAccountId);
			if (!n || n.currency !== t.settings.currency || e.date < t.payDate || !["Posted", "Reversed"].includes(t.status) || e.status === "Posted" && t.status !== "Posted") throw Error("Invalid payroll payment source.");
			c(e.accountId, "LIABILITY"), d(e.journalId, "PAYROLL_PAYMENT", e.id, e.date, [{
				accountId: e.accountId,
				debit: e.amount,
				credit: 0
			}, {
				accountId: n.glAccountId,
				debit: 0,
				credit: e.amount
			}], e.status === "Reversed", e.reversalJournalId, e.reversalDate);
		}
		for (let e of n.runs) {
			let t = /* @__PURE__ */ new Map();
			for (let n of Sr(e).filter((e) => e.credit)) t.set(n.accountId, L((t.get(n.accountId) ?? 0) + n.credit));
			for (let [r, i] of t) if (L(n.payments.filter((t) => t.runId === e.id && t.accountId === r && t.status === "Posted").reduce((e, t) => e + t.amount, 0)) > i) throw Error("Payroll liabilities are overpaid.");
			if (n.payments.some((n) => n.runId === e.id && !t.has(n.accountId))) throw Error("Payment uses an unrelated payroll liability.");
		}
		for (let e of n.filings) {
			let t = s("runs", e.runId);
			if (!["Posted", "Reversed"].includes(t.status) || e.runRevision > t.revision || t.status === "Reversed" && e.status !== "Correction needed" || e.status === "External reference recorded" && !e.reference) throw Error("Invalid payroll filing review.");
		}
		for (let e of a.filter((e) => ["PAYROLL", "PAYROLL_PAYMENT"].includes(e.sourceType) && !e.reversedJournalEntryId)) if (!(e.sourceType === "PAYROLL" ? n.runs : n.payments).some((t) => t.id === e.sourceId && t.journalId === e.id)) throw Error("Orphan payroll journal.");
		for (let e of n.employees) {
			let t = e.annualOpening, r = e.personalOpening, i = /* @__PURE__ */ new Set();
			for (let a of n.runs.filter((e) => e.status === "Posted")) for (let n of a.slips.filter((t) => t.employee.id === e.id)) {
				t += n.annualAccrual, r += n.personalAccrual;
				for (let e of n.leaveIds) {
					let n = s("leave", e);
					i.add(e), n.type === "Annual" && (t -= n.hours), n.type === "Personal" && (r -= n.hours);
				}
			}
			for (let a of n.leave.filter((t) => t.employeeId === e.id && t.status === "Approved" && !i.has(t.id))) a.type === "Annual" && (t -= a.hours), a.type === "Personal" && (r -= a.hours);
			if (t < -1e-5 || r < -1e-5) throw Error("Payroll leave balances are negative.");
		}
		let p = /* @__PURE__ */ new Set();
		for (let e of n.receipts) {
			if (p.has(e.operationId)) throw Error("Duplicate payroll operation.");
			if (p.add(e.operationId), e.input.operationId !== e.operationId || rr({
				input: e.input,
				actorId: e.actorId
			}) !== e.fingerprint) throw Error("Invalid payroll operation fingerprint.");
			if (s(e.entity, e.recordId).revision < e.revision) throw Error("Invalid payroll operation revision.");
		}
	}
});
//#endregion
//#region electron/security/documentRecycleRepository.ts
var wr = a().trim().min(1).max(200), Tr = a().regex(/^[a-f0-9]{64}$/), Er = (e) => Array.isArray(e) ? e.map(Er) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, Er(e[t])])) : e, Dr = (e) => ye("sha256").update(JSON.stringify(Er(e))).digest("hex"), Or = (e) => e === "Purchase order" || e === "Expense bill draft" ? "purchases.read" : "sales.read", kr = (e) => e === "Quote" ? "sales.write" : e === "Purchase order" ? "purchases.write" : e === "Expense bill draft" ? "purchases.bill" : "sales.manage";
function Ar(e, t) {
	let [n, r] = ne[e];
	return (t[n]?.[r] ?? []).filter((t) => e === "Sales order draft" ? t.kind === "ORDER" : e !== "Invoice draft" || t.kind === "INVOICE");
}
function jr(e, t, n) {
	let r = Ar(e, n).find((e) => e.id === t);
	if (!r) throw Error("Document was not found in the selected dataset.");
	return r;
}
function Mr(e, t, n) {
	let r = [];
	(t.status !== "DRAFT" || t.documentId) && r.push("Only unapproved, unposted drafts can be recycled.");
	let i = (e) => e === t.id || (Array.isArray(e) ? e.some(i) : !!e && typeof e == "object" && Object.values(e).some(i)), [a, o] = ne[e];
	for (let [e, s] of Object.entries(n)) [
		"documentRecycle",
		"attachments",
		"financialCache"
	].includes(e) || i(e === a ? {
		...s,
		[o]: s[o].filter((e) => e.id !== t.id)
	} : s) && r.push(`Referenced by ${e}; retain this draft for its linked workflow.`);
	return r;
}
function Nr(t, n = ve()) {
	return pe.filter((n) => e(t, Or(n))).flatMap((r) => Ar(r, n).map((i) => {
		let a = s().findLast((e) => e.recordId === i.id), o = r === "Purchase order" || r === "Expense bill draft", c = o ? i.supplierId ?? i.payload?.supplierId : i.customerId ?? i.payload?.customerId;
		return {
			kind: r,
			party: (o ? n.suppliers?.suppliers : n.customers?.customers)?.find((e) => e.id === c)?.businessName ?? c ?? "",
			reference: i.customerReference ?? i.payload?.customerReference ?? i.payload?.supplierInvoiceNumber ?? i.supplierReference ?? "",
			recordId: i.id,
			label: i.documentNumber ?? i.purchaseOrderNumber ?? `${i.kind} · ${i.id}`,
			date: i.documentDate ?? i.orderDate ?? i.payload?.documentDate ?? "",
			status: i.status,
			total: i.totals.total,
			token: Dr({
				record: i,
				lifecycle: a?.id ?? ""
			}),
			deleted: a?.action === "Trashed",
			last: a,
			canWrite: e(t, kr(r)),
			issues: Mr(r, i, n)
		};
	}));
}
var Pr = t({
	operationId: wr,
	action: f(["Trashed", "Recovered"]),
	reason: a().trim().min(3).max(2e3),
	records: r(t({
		kind: f(pe),
		recordId: wr,
		token: Tr
	}).strict()).min(1).max(100)
}).strict(), Fr = t({
	id: wr,
	operationId: wr,
	fingerprint: Tr,
	kind: f(pe),
	recordId: wr,
	action: f(["Trashed", "Recovered"]),
	actorId: wr,
	at: xe(),
	reason: a().trim().min(3).max(2e3),
	recordToken: Tr,
	contentToken: Tr
}).strict();
y("documentRecycle", {
	repository: {
		list() {
			return Nr(T.require("inventory.read"));
		},
		detail(e, t) {
			return e = f(pe).parse(e), T.require("inventory.read"), T.require(Or(e)), structuredClone(jr(e, wr.parse(t), ve()));
		},
		change(e) {
			let t = Pr.parse(e), n = T.require("inventory.read");
			t.records.forEach((e) => {
				T.require(Or(e.kind)), T.require(kr(e.kind));
			});
			let r = Dr({
				input: t,
				actorId: n.userId
			}), i = s().filter((e) => e.operationId === t.operationId);
			if (i.length) {
				if (i[0].fingerprint !== r) throw Error("Operation ID has different recycle data.");
				return structuredClone(i);
			}
			let a = ve(), o = /* @__PURE__ */ new Set();
			for (let e of t.records) {
				if (o.has(e.recordId)) throw Error("Select each document only once.");
				o.add(e.recordId);
				let n = jr(e.kind, e.recordId, a);
				if (Dr({
					record: n,
					lifecycle: s().findLast((t) => t.recordId === e.recordId)?.id ?? ""
				}) !== e.token) throw Error("Document changed. Refresh and review the selection again.");
				if (c(e.recordId) !== (t.action === "Recovered")) throw Error("Document recycle state changed. Refresh the selection.");
				let r = Mr(e.kind, n, a);
				if (r.length) throw Error(r.join(" "));
			}
			let l = (/* @__PURE__ */ new Date()).toISOString(), u = t.records.map((e) => ({
				id: crypto.randomUUID(),
				operationId: t.operationId,
				fingerprint: r,
				kind: e.kind,
				recordId: e.recordId,
				action: t.action,
				actorId: n.userId,
				at: l,
				reason: t.reason,
				recordToken: e.token,
				contentToken: Dr(jr(e.kind, e.recordId, a))
			}));
			return re([...s(), ...u]), structuredClone(u);
		}
	},
	read: "inventory.read",
	commands: {
		list: "inventory.read",
		detail: "inventory.read",
		change: "inventory.read"
	},
	snapshot: () => ({ history: s() }),
	restore: (e) => re(e.history),
	publish: () => {},
	view: (t) => ({ history: s().filter((n) => e(t, Or(n.kind))) }),
	validate: (e, n) => {
		let { history: i } = t({ history: r(Fr) }).strict().parse(e), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
		for (let e of i) {
			if (a.has(e.id)) throw Error("Duplicate recycle event.");
			a.add(e.id);
			let t = jr(e.kind, e.recordId, n);
			if ((o.get(e.recordId) ?? "Recovered") === e.action) throw Error("Invalid recycle lifecycle sequence.");
			if (!i.slice(i.indexOf(e) + 1).some((t) => t.recordId === e.recordId) && e.action === "Trashed" && (Mr(e.kind, t, n).length || Dr(t) !== e.contentToken)) throw Error("Recycled document content or references changed.");
			o.set(e.recordId, e.action), s.set(e.operationId, [...s.get(e.operationId) ?? [], e]);
		}
		for (let e of s.values()) {
			let t = e[0], n = e.map((e) => ({
				kind: e.kind,
				recordId: e.recordId,
				token: e.recordToken
			}));
			if (new Set(n.map((e) => e.recordId)).size !== n.length || e.some((e) => e.fingerprint !== t.fingerprint || e.action !== t.action || e.actorId !== t.actorId || e.at !== t.at || e.reason !== t.reason) || Dr({
				input: {
					operationId: t.operationId,
					action: t.action,
					reason: t.reason,
					records: n
				},
				actorId: t.actorId
			}) !== t.fingerprint) throw Error("Invalid recycle operation receipt.");
		}
	}
});
//#endregion
//#region src/features/contacts/schemas/customerSchemas.ts
var Ir = [
	"Flooring Retailer",
	"Builder",
	"Developer",
	"Designer",
	"Architect",
	"Installer",
	"Other"
], Lr = [
	"ACTIVE",
	"ON_HOLD",
	"INACTIVE"
], Rr = a().trim().refine((e) => e === "" || a().email().safeParse(e).success, { message: "Enter a valid email address" }), zr = a().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), Br = t({
	businessName: a().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: a().trim().max(120, "Trading name is too long"),
	abn: zr,
	businessType: f(Ir),
	status: f(Lr),
	email: Rr,
	phone: a().trim().max(40, "Phone number is too long"),
	website: a().trim().max(200, "Website is too long"),
	creditLimit: w({ message: "Credit limit is required" }).min(0, "Credit limit cannot be negative"),
	paymentTermsDays: w({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days")
}), Vr = t({
	name: a().trim().min(1, "Location name is required").max(100, "Location name is too long"),
	addressLine1: a().trim().min(1, "Address is required").max(160, "Address is too long"),
	addressLine2: a().trim().max(160, "Address is too long"),
	suburb: a().trim().min(1, "Suburb is required").max(100, "Suburb is too long"),
	state: a().trim().min(1, "State is required").max(50, "State is too long"),
	postcode: a().trim().min(1, "Postcode is required").max(20, "Postcode is too long"),
	country: a().trim().min(1, "Country is required").max(100, "Country is too long"),
	phone: a().trim().max(40, "Phone number is too long"),
	isPrimary: o()
}), Hr = t({
	isAccounting: o().optional(),
	firstName: a().trim().min(1, "First name is required").max(80, "First name is too long"),
	lastName: a().trim().min(1, "Last name is required").max(80, "Last name is too long"),
	jobTitle: a().trim().max(100, "Job title is too long"),
	email: a().trim().min(1, "Email is required").email("Enter a valid email address"),
	phone: a().trim().max(40, "Phone number is too long"),
	mobile: a().trim().max(40, "Mobile number is too long"),
	locationId: a(),
	isPrimary: o()
}), Ur = [
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
], Wr = "htt.mock.contacts.customers.v1";
function Gr(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var Kr = Xe(Wr, Gr), qr = Kr.status !== "invalid" && Qe(Wr), Jr = /* @__PURE__ */ new Set(), Yr = Kr.status === "ok" ? Kr.data : structuredClone(Ur);
function Xr() {
	qr && Ze(Wr, Yr), Jr.forEach((e) => {
		e();
	});
}
function Zr(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Qr() {
	let e = Yr.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function $r(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function ei(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function ti(e, t) {
	let n = !1;
	if (Yr = Yr.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	Xr();
}
var B = {
	subscribe(e) {
		return Jr.add(e), () => {
			Jr.delete(e);
		};
	},
	getSnapshot() {
		return Yr;
	},
	getAll() {
		return Yr;
	},
	getById(e) {
		return Yr.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: Zr("cus"),
			code: Qr(),
			businessName: e.businessName.trim(),
			tradingName: $r(e.tradingName),
			abn: ei(e.abn),
			businessType: e.businessType,
			status: e.status,
			email: $r(e.email),
			phone: $r(e.phone),
			website: $r(e.website),
			creditLimit: e.creditLimit,
			currentBalance: 0,
			overdueBalance: 0,
			paymentTermsDays: e.paymentTermsDays,
			locations: [],
			contacts: [],
			createdAt: t,
			updatedAt: t
		};
		return Yr = [n, ...Yr], Xr(), n;
	},
	update(e, t) {
		let n;
		if (ti(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: $r(t.tradingName),
			abn: ei(t.abn),
			businessType: t.businessType,
			status: t.status,
			email: $r(t.email),
			phone: $r(t.phone),
			website: $r(t.website),
			creditLimit: t.creditLimit,
			paymentTermsDays: t.paymentTermsDays,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, n)), !n) throw Error(`Customer ${e} was not found`);
		return n;
	},
	addLocation(e, t) {
		let n = B.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: Zr("loc"),
			name: t.name.trim(),
			addressLine1: t.addressLine1.trim(),
			addressLine2: $r(t.addressLine2),
			suburb: t.suburb.trim(),
			state: t.state.trim(),
			postcode: t.postcode.trim(),
			country: t.country.trim(),
			phone: $r(t.phone),
			isPrimary: r
		};
		return ti(e, (e) => ({
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
		let r = B.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		let i = r.locations.find((e) => e.id === t);
		if (!i) throw Error(`Location ${t} was not found`);
		let a = n.isPrimary || r.locations.length === 1, o = {
			...i,
			name: n.name.trim(),
			addressLine1: n.addressLine1.trim(),
			addressLine2: $r(n.addressLine2),
			suburb: n.suburb.trim(),
			state: n.state.trim(),
			postcode: n.postcode.trim(),
			country: n.country.trim(),
			phone: $r(n.phone),
			isPrimary: a
		};
		return ti(e, (e) => ({
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
		t = Hr.parse(t);
		let n = B.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: Zr("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: $r(t.jobTitle),
			email: t.email.trim(),
			phone: $r(t.phone),
			mobile: $r(t.mobile),
			locationId: $r(t.locationId),
			isPrimary: r,
			isAccounting: t.isAccounting ?? !1
		};
		return ti(e, (e) => ({
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
		n = Hr.parse(n);
		let r = B.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		if (n.locationId && !r.locations.some((e) => e.id === n.locationId)) throw Error("The selected location does not belong to this customer");
		let i = r.contacts.find((e) => e.id === t);
		if (!i) throw Error(`Contact ${t} was not found`);
		let a = n.isPrimary || r.contacts.length === 1, o = {
			...i,
			firstName: n.firstName.trim(),
			lastName: n.lastName.trim(),
			jobTitle: $r(n.jobTitle),
			email: n.email.trim(),
			phone: $r(n.phone),
			mobile: $r(n.mobile),
			locationId: $r(n.locationId),
			isPrimary: a,
			isAccounting: n.isAccounting ?? !1
		};
		return ti(e, (e) => ({
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
y("customers", {
	repository: B,
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
	snapshot: () => ({ customers: Yr }),
	restore: (e) => {
		Yr = e.customers;
	},
	publish: () => Jr.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var ni = [
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
		currency: _().currency,
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
		currency: _().currency,
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
		currency: _().currency,
		taxRegistered: !0,
		createdAt: "2026-03-05T01:00:00.000Z",
		updatedAt: "2026-03-05T01:00:00.000Z"
	}
], ri = "htt.mock.contacts.suppliers.v1";
function ii(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var ai = Xe(ri, ii), oi = ai.status !== "invalid" && Qe(ri), si = /* @__PURE__ */ new Set(), ci = ai.status === "ok" ? ai.data : structuredClone(ni);
function li() {
	oi && Ze(ri, ci), si.forEach((e) => {
		e();
	});
}
function ui(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function di() {
	let e = ci.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function fi(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function pi(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function mi(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: fi(e.tradingName),
		abn: pi(e.abn),
		status: e.status,
		email: fi(e.email),
		phone: fi(e.phone),
		website: fi(e.website),
		contactName: fi(e.contactName),
		addressLine1: fi(e.addressLine1),
		addressLine2: fi(e.addressLine2),
		suburb: fi(e.suburb),
		state: fi(e.state),
		postcode: fi(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: fi(e.notes)
	};
}
var hi = {
	subscribe(e) {
		return si.add(e), () => {
			si.delete(e);
		};
	},
	getSnapshot() {
		return ci;
	},
	getAll() {
		return ci;
	},
	getById(e) {
		return ci.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: ui("sup"),
			code: di(),
			...mi(e),
			currency: _().currency,
			createdAt: t,
			updatedAt: t
		};
		return ci = [n, ...ci], li(), n;
	},
	update(e, t) {
		let n = hi.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...mi(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ci = ci.map((t) => t.id === e ? r : t), li(), r;
	}
};
y("suppliers", {
	repository: hi,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: ci }),
	restore: (e) => {
		ci = e.suppliers;
	},
	publish: () => si.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/schemas/supplierSchemas.ts
var gi = ["ACTIVE", "INACTIVE"], _i = a().trim().refine((e) => e === "" || a().email().safeParse(e).success, { message: "Enter a valid email address" }), vi = a().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), yi = t({
	businessName: a().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: a().trim().max(120, "Trading name is too long"),
	abn: vi,
	status: f(gi),
	email: _i,
	phone: a().trim().max(40, "Phone number is too long"),
	website: a().trim().max(200, "Website is too long"),
	contactName: a().trim().max(120, "Contact name is too long"),
	addressLine1: a().trim().max(160, "Address is too long"),
	addressLine2: a().trim().max(160, "Address is too long"),
	suburb: a().trim().max(100, "Suburb is too long"),
	state: a().trim().max(50, "State is too long"),
	postcode: a().trim().max(20, "Postcode is too long"),
	country: a().trim().min(1, "Country is required").max(100, "Country is too long"),
	paymentTermsDays: w({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days"),
	taxRegistered: o(),
	notes: a().trim().max(2e3, "Notes are too long")
});
//#endregion
//#region src/features/inventory/data/itemTypes.ts
function bi(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function xi(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function Si(e, t) {
	if (e.itemType !== void 0 && ![
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	].includes(String(e.itemType))) throw Error("Invalid saved sales item type.");
	if (t && (e.itemType ?? "STOCK") !== (t.itemType ?? "STOCK")) throw Error("Saved sales item type does not match its referenced product.");
}
//#endregion
//#region src/features/inventory/data/mockProducts.ts
var Ci = [
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
function wi(e) {
	return Ci.find((t) => t.id === e);
}
function Ti(e, t) {
	return wi(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var Ei = /* @__PURE__ */ new Set(), Di = "2026-01-01T00:00:00.000Z", Oi = Ci.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: Di,
	updatedAt: Di
}));
function ki() {
	Ei.forEach((e) => e());
}
var Ai = {
	ensureProductPolicy(e, t, n) {
		let r = Oi.find((t) => t.productId === e), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			productId: e,
			baseUnitId: t,
			active: n ? r?.active ?? !0 : !1,
			costingMethod: "MOVING_WEIGHTED_AVERAGE",
			createdAt: r?.createdAt ?? i,
			updatedAt: i
		};
		return Oi = [...Oi.filter((t) => t.productId !== e), a], ki(), a;
	},
	subscribe(e) {
		return Ei.add(e), () => {
			Ei.delete(e);
		};
	},
	getSnapshot() {
		return Oi;
	},
	getAll() {
		return Oi;
	},
	getByProductId(e) {
		return Oi.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = Ai.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		if (t && !bi(wi(e) ?? { itemType: "SERVICE" })) throw Error("Inventory costing cannot be enabled for non-stock/service items.");
		let n = {
			...Ai.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Oi = Oi.map((t) => t.productId === e ? n : t), ki(), n;
	}
};
y("costingPolicies", {
	repository: Ai,
	read: "inventory.cost.read",
	commands: {
		ensureProductPolicy: null,
		setActive: "accounting.post"
	},
	snapshot: () => ({ policies: Oi }),
	restore: (e) => {
		Oi = e.policies;
	},
	publish: () => Ei.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/productRepository.ts
var ji = t({
	id: a().min(1),
	code: f([
		"M2",
		"LM",
		"BOX",
		"PIECE",
		"ROLL",
		"BUCKET",
		"HOUR",
		"JOB"
	]),
	name: a().trim().min(1),
	symbol: a().min(1),
	conversionToBase: w().finite().positive(),
	basePrice: w().finite().nonnegative(),
	isBaseUnit: o(),
	active: o()
}).strict(), Mi = t({
	id: a().min(1),
	sku: a().trim().min(1).max(80),
	name: a().trim().min(1).max(180),
	category: f([
		"Timber",
		"Hybrid",
		"Laminate",
		"Vinyl",
		"Carpet",
		"Accessories",
		"Other"
	]),
	brand: a().optional(),
	collection: a().optional(),
	description: a().optional(),
	status: f(["ACTIVE", "INACTIVE"]),
	baseUnitId: a().min(1),
	units: r(ji).min(1),
	createdAt: a(),
	updatedAt: a(),
	revision: w().int().nonnegative().optional(),
	itemType: f([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	buyEnabled: o().optional(),
	sellEnabled: o().optional(),
	reorderPoint: w().finite().nonnegative().optional(),
	targetStock: w().finite().nonnegative().optional(),
	wholePacks: o().optional(),
	taxCode: a().min(1).optional()
}).strict(), Ni = /* @__PURE__ */ new Set(), Pi = [...Ci];
function Fi() {
	Pi = [...Ci], Ni.forEach((e) => e());
}
function Ii(e, t, n) {
	if (Array.isArray(e)) return e.some((e) => Ii(e, t, n));
	if (!e || typeof e != "object") return !1;
	let r = e;
	return r.productId === t && (!n || r.unitId === n) || Object.values(r).some((e) => Ii(e, t, n));
}
function Li(e) {
	let t = r(Mi).parse(e), n = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.id) || i.has(e.sku.toLowerCase())) throw Error("Duplicate product ID or SKU.");
		if (n.add(e.id), i.add(e.sku.toLowerCase()), !bi(e) && e.buyEnabled !== !1) throw Error("Non-stock/service catalogue items must use expense bills for purchasing.");
		if (!bi(e) && ((e.reorderPoint ?? 0) !== 0 || (e.targetStock ?? 0) !== 0)) throw Error("Non-stock/service items cannot have stock reorder thresholds.");
		if (bi(e) && e.units.some((e) => e.code === "HOUR" || e.code === "JOB")) throw Error("Hour/job units require non-stock or service items.");
		if (new Set(e.units.map((e) => e.id)).size !== e.units.length || e.units.filter((e) => e.isBaseUnit).length !== 1 || !e.units.some((t) => t.id === e.baseUnitId && t.isBaseUnit && t.conversionToBase === 1)) throw Error("A product needs exactly one valid base unit.");
		if ((e.targetStock ?? 0) < (e.reorderPoint ?? 0)) throw Error("Target stock must be at least the reorder point.");
	}
	return t;
}
var Ri = {
	subscribe(e) {
		return Ni.add(e), () => {
			Ni.delete(e);
		};
	},
	getSnapshot: () => Pi,
	getAll: () => Ci,
	getById: (e) => Ci.find((t) => t.id === e),
	save(e, t) {
		let n = Mi.parse(e), r = Ci.find((e) => e.id === n.id);
		if (r && t !== (r.revision ?? 0)) throw Error("Product changed since it was opened. Reload before saving.");
		if (!r && t !== void 0) throw Error("Product no longer exists.");
		if (b(n.taxCode ?? "GST"), !bi(n) && n.buyEnabled !== !1) throw Error("Non-stock and service catalogue items are sales-only. Use expense/service bills for supplier costs.");
		let i = ve();
		if (delete i.products, r) {
			let e = { ...i };
			if (delete e.costingPolicies, (r.itemType ?? "STOCK") !== (n.itemType ?? "STOCK") && Ii(e, n.id)) throw Error("A referenced product cannot change item type. Create a new catalogue item.");
			if (r.baseUnitId !== n.baseUnitId && Ii(i, n.id)) throw Error("A referenced product cannot change base unit.");
			for (let e of r.units) {
				let t = n.units.find((t) => t.id === e.id);
				if ((!t || t.conversionToBase !== e.conversionToBase || t.code !== e.code) && Ii(i, n.id, e.id)) throw Error("A referenced unit conversion cannot be changed or removed. Add a new unit instead.");
			}
		}
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...n,
			createdAt: r?.createdAt ?? a,
			updatedAt: a,
			revision: (r?.revision ?? 0) + 1
		};
		return Li([...Ci.filter((e) => e.id !== n.id), o]), r ? Ci.splice(Ci.indexOf(r), 1, o) : Ci.push(o), Ai.ensureProductPolicy(o.id, o.baseUnitId, bi(o)), r && bi(r) !== bi(o) && Ai.setActive(o.id, bi(o)), Fi(), o;
	}
};
y("products", {
	validate: (e, t) => {
		let n = Li(e.products), r = t.workspace_tax_codes.records, i = t.costingPolicies.policies, a = t.stock.balances;
		for (let e of n.filter((e) => !bi(e))) if (i.some((t) => t.productId === e.id && t.active) || a.some((t) => t.productId === e.id && t.quantityOnHand !== 0)) throw Error("Non-stock/service product has inventory activity or active costing.");
		if (n.some((e) => !r.some((t) => t.code === (e.taxCode ?? "GST")))) throw Error("Backup product tax-code reference is invalid.");
	},
	repository: Ri,
	read: "inventory.read",
	commands: { save: "inventory.adjust" },
	snapshot: () => ({ products: structuredClone(Ci) }),
	restore: (e) => {
		let t = Li(e.products);
		Ci.splice(0, Ci.length, ...t), Pi = [...Ci];
	},
	publish: Fi
});
//#endregion
//#region electron/security/transferRepository.ts
var zi = a().trim().min(1).max(200), Bi = a().trim().min(1).max(2e3), Vi = (e) => Array.isArray(e) ? e.map(Vi) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).filter(([, e]) => e !== void 0).sort(([e], [t]) => e < t ? -1 : +(e > t)).map(([e, t]) => [e, Vi(t)])) : e, Hi = (e) => ye("sha256").update(JSON.stringify(Vi(e))).digest("hex"), Ui = [], Wi = (e, t = !1) => {
	T.require("inventory.read");
	let n = T.require(wn[e].read);
	return t && T.require(wn[e].write), n.userId;
};
function Gi(e) {
	return e === "Customers" ? B.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Suppliers" ? hi.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Products" ? Ri.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : B.getAll().flatMap((t) => (e === "Customer branches" ? t.locations : t.contacts).map((e) => ({
		id: e.id,
		parentId: t.id,
		raw: e
	})));
}
function Ki(e, t) {
	let n = {};
	for (let [r, i] of Object.entries(Sn[e])) n[r] = String(t.raw[r] ?? i);
	if ((e === "Customer branches" || e === "Customer contacts") && (n.customerId = t.parentId), e === "Products") {
		let e = t.raw;
		n.taxCode = e.taxCode ?? "", n.itemType = e.itemType ?? "STOCK", n.buyEnabled = String(e.buyEnabled ?? (e.itemType === void 0 || e.itemType === "STOCK")), n.baseUnitCode = e.units.find((t) => t.id === e.baseUnitId).code, n.unitsJson = JSON.stringify(e.units);
	}
	return n;
}
function qi(e, t) {
	return {
		_format: bn,
		id: t.id,
		recordToken: Hi({
			parentId: t.parentId,
			record: t.raw
		}),
		externalId: Ui.filter((t) => t.dataset === e).flatMap((e) => e.results).find((e) => e.action === "Created" && e.recordId === t.id)?.externalId ?? "",
		...Ki(e, t)
	};
}
function Ji(e, t) {
	if (!/^-?\d+(?:\.\d+)?$/.test(e) || !Number.isFinite(Number(e)) || Math.abs(Number(e)) > 2 ** 53 - 1) throw Error(`${t} must contain a safe plain number.`);
	return Number(e);
}
function Yi(e, t, n) {
	let r = n ? Ki(e, n) : { ...Sn[e] };
	for (let n of Object.keys(Sn[e])) if (Object.hasOwn(t, n)) {
		let i = t[n].trim();
		if (typeof Sn[e][n] == "number") r[n] = Ji(i, n);
		else if (typeof Sn[e][n] == "boolean") {
			if (!["true", "false"].includes(i)) throw Error(`${n} must be true or false.`);
			r[n] = i === "true";
		} else r[n] = i.trim();
	}
	if (n) for (let [n, i] of Object.entries(Sn[e])) Object.hasOwn(t, n) || (typeof i == "number" && (r[n] = Number(r[n])), typeof i == "boolean" && (r[n] = r[n] === "true"));
	return r;
}
var Xi = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), Zi = (e, t) => e.some((e) => e.reasons.some((n) => !t.some((t) => t.id === e.id && t.reasons.includes(n))));
function Qi(e, t) {
	return t.map((t) => ({
		id: t.id,
		reasons: [
			...Xi(t.businessName) === Xi(e.businessName) ? ["Name"] : [],
			...e.email && t.email?.toLowerCase() === e.email.toLowerCase() ? ["Email"] : [],
			...e.abn && Xi(t.abn) === Xi(e.abn) ? ["Identifier"] : []
		]
	})).filter((e) => e.reasons.length);
}
function $i(e, n, i, s = !1) {
	let c = i.id ? Gi(e).find((e) => e.id === i.id) : void 0;
	if (n === "Update by ID") {
		if (!c) throw Error("Existing record ID was not found.");
		if (!s && (!i.recordToken || i.recordToken !== qi(e, c).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
	} else if (i.id || i.recordToken) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
	if (n === "Update by ID" && i.externalId && i.externalId !== qi(e, c).externalId) throw Error("External source IDs cannot be reassigned by an update. Keep the export value or leave it blank.");
	let l = n === "Update by ID" ? c : void 0, u = l ? qi(e, l) : null, d = Yi(e, i, l), p;
	if (e === "Customers") {
		let e = Br.strict().parse(d), t = B.getAll().filter((e) => e.id !== l?.id);
		if (Zi(gn({
			kind: "Customer",
			customerId: "",
			values: e
		}, t), l ? gn({
			kind: "Customer",
			customerId: "",
			values: l.raw
		}, t) : [])) throw Error("Possible existing customer duplicate. Use the customer review workflow or explicit ID update.");
		p = l ? B.update(l.id, e) : B.create(e);
	} else if (e === "Suppliers") {
		let e = yi.strict().parse(d), t = hi.getAll().filter((e) => e.id !== l?.id);
		if (Zi(Qi(e, t), l ? Qi(l.raw, t) : [])) throw Error("Possible existing supplier duplicate. Resolve it before import.");
		p = l ? hi.update(l.id, e) : hi.create(e);
	} else if (e === "Products") {
		let e = r(t({
			id: a().max(200).optional(),
			code: f([
				"M2",
				"LM",
				"BOX",
				"PIECE",
				"ROLL",
				"BUCKET",
				"HOUR",
				"JOB"
			]),
			name: a().trim().min(1).max(120),
			symbol: a().min(1).max(40),
			conversionToBase: w().finite().positive(),
			basePrice: w().finite().nonnegative(),
			isBaseUnit: o(),
			active: o()
		}).strict()).min(1).max(100).parse(JSON.parse(String(d.unitsJson))), n = l?.raw, s = e.map((e) => {
			let t = crypto.randomUUID();
			if (n) {
				if (e.id) {
					if (!n.units.some((t) => t.id === e.id)) throw Error("Unit ID does not belong to this product. Keep exported IDs; use an empty ID for a new unit.");
					t = e.id;
				} else if (!Object.hasOwn(e, "id")) {
					let r = n.units.filter((t) => t.code === e.code);
					if (r.length > 1) throw Error("Ambiguous unit code. Keep the unit IDs from the current export.");
					t = r[0]?.id ?? t;
				}
			}
			return {
				...e,
				id: t
			};
		}), c = s.find((e) => e.code === d.baseUnitCode && e.isBaseUnit);
		if (!c) throw Error("baseUnitCode must identify the primary product unit.");
		let { unitsJson: u, baseUnitCode: m, ...h } = d, g = (/* @__PURE__ */ new Date()).toISOString();
		if (h.taxCode === "" && delete h.taxCode, n) for (let e of [
			"brand",
			"collection",
			"description",
			"itemType",
			"buyEnabled",
			"sellEnabled",
			"reorderPoint",
			"targetStock",
			"wholePacks",
			"taxCode"
		]) !Object.hasOwn(i, e) && n[e] === void 0 && delete h[e];
		let ee = Mi.parse({
			...h,
			id: l?.id ?? crypto.randomUUID(),
			baseUnitId: c.id,
			units: s,
			createdAt: n?.createdAt ?? g,
			updatedAt: g
		});
		p = Ri.save(ee, n?.revision ?? (l ? 0 : void 0));
	} else {
		let t = String(d.customerId), n = B.getById(t);
		if (!n || n.status === "INACTIVE") throw Error("Select an existing, non-inactive parent customer.");
		if (l && l.parentId !== t) throw Error("Existing branch/contact cannot move to a different customer.");
		let { customerId: r, ...i } = d, a = e === "Customer branches" ? "Branch" : "Contact", o = a === "Branch" ? Vr.strict().parse(i) : Hr.strict().parse(i);
		if (Zi(gn({
			kind: a,
			customerId: t,
			values: o
		}, [n]).filter((e) => e.id !== l?.id), l ? gn({
			kind: a,
			customerId: t,
			values: l.raw
		}, [n]).filter((e) => e.id !== l.id) : [])) throw Error("Possible existing branch/contact duplicate. Use customer review or explicit ID update.");
		p = a === "Branch" ? l ? B.updateLocation(t, l.id, o) : B.addLocation(t, o) : l ? B.updateContact(t, l.id, o) : B.addContact(t, o);
	}
	let m = Gi(e).find((e) => e.id === p.id);
	return {
		recordId: p.id,
		before: u,
		after: qi(e, m)
	};
}
function ea(e) {
	if (Wi(e.dataset, !0), Buffer.byteLength(e.text, "utf8") > 1e6) throw Error("CSV source exceeds 1 MB of UTF-8 text.");
	let t = En(e), n = new Map(Gi(e.dataset).map((t) => [t.id, qi(e.dataset, t)])), r = ve(), i = Hi({
		input: e,
		master: r
	}), a = /* @__PURE__ */ new Set(), o = [], s = [];
	try {
		for (let r of t.rows) {
			let t = r.values, i = (t.externalId ?? "").trim(), c = Hi({
				dataset: e.dataset,
				values: Object.fromEntries(Object.keys(Sn[e.dataset]).filter((e) => Object.hasOwn(t, e)).map((e) => [e, t[e]]))
			}), l = e.mode === "Create" ? i : t.id, u = "", d;
			try {
				if (!l) throw Error(e.mode === "Create" ? "externalId is required for safe create retries." : "id is required for explicit updates.");
				if (l.length > 200 || i.length > 200) throw Error("Import identity exceeds 200 characters.");
				if (a.has(l)) throw Error("Repeated identity in this CSV file.");
				if (a.add(l), e.mode === "Create" && (t.id || t.recordToken)) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
				if (e.mode === "Update by ID" && (!n.has(t.id) || t.recordToken !== n.get(t.id).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
				let s = e.mode === "Create" ? Ui.filter((t) => t.dataset === e.dataset).flatMap((e) => e.results).find((e) => e.action === "Created" && e.externalId === i) : void 0;
				if (s) {
					if (s.identityFingerprint !== c) throw Error("Source externalId already contains different creation data. Use an explicit ID update.");
					let t = Gi(e.dataset).find((e) => e.id === s.recordId);
					if (!t) throw Error("Prior imported record is missing.");
					d = {
						row: r.row,
						externalId: i,
						recordId: t.id,
						action: "Skipped",
						identityFingerprint: c,
						before: null,
						after: qi(e.dataset, t)
					};
				} else {
					let a = $i(e.dataset, e.mode, t, !0);
					e.mode === "Update by ID" && (a.before = n.get(t.id)), d = {
						row: r.row,
						externalId: i,
						action: e.mode === "Create" ? "Created" : "Updated",
						identityFingerprint: c,
						...a
					};
				}
				o.push(d);
			} catch (e) {
				u = e instanceof Error ? e.message : "Validation failed.";
			}
			s.push({
				row: r.row,
				externalId: i,
				recordId: d?.recordId ?? t.id ?? "",
				name: t.businessName || t.name || [t.firstName, t.lastName].filter(Boolean).join(" ") || t.sku || t.id || i,
				action: d?.action ?? "Error",
				values: { ...t },
				errors: u ? [u] : []
			});
		}
		for (let t of s) {
			let n = o.find((e) => e.row === t.row);
			if (n) {
				let i = Gi(e.dataset).find((e) => e.id === n.recordId), a = qi(e.dataset, i);
				if (t.values = Object.fromEntries(Object.keys(Sn[e.dataset]).filter((e) => Object.hasOwn(a, e)).map((e) => [e, a[e]])), e.dataset === "Products") {
					let e = (r.products.products.find((e) => e.id === n.recordId)?.units ?? []).map((e) => e.id);
					t.values.unitsJson = JSON.stringify(JSON.parse(t.values.unitsJson).map((t) => ({
						...t,
						id: e.includes(t.id) ? t.id : "Assigned at commit"
					})));
				}
			}
		}
	} finally {
		ae(r);
	}
	return {
		preview: {
			fingerprint: i,
			headers: t.headers,
			mapping: t.mapping,
			unmappedColumns: t.unmappedColumns,
			rows: s,
			valid: s.every((e) => !e.errors.length)
		},
		results: o
	};
}
var ta = {
	review(e) {
		return ea(Tn.parse(e)).preview;
	},
	commit(e) {
		let t = Tn.extend({
			operationId: zi,
			expectedPreview: a().regex(/^[a-f0-9]{64}$/),
			reason: Bi
		}).strict().parse(e), n = Wi(t.dataset, !0), { operationId: r, expectedPreview: i, reason: o, ...s } = t, c = Hi({
			source: s,
			reason: o
		}), l = Ui.find((e) => e.operationId === r);
		if (l) {
			if (l.fingerprint !== c) throw Error("Operation ID already has different import data.");
			return structuredClone(l);
		}
		let u = ea(s);
		if (u.preview.fingerprint !== i) throw Error("Business records or import fields changed. Validate the file again.");
		if (!u.preview.valid) throw Error("Resolve every validation error before committing the batch.");
		let d = En(s), f = new Set(d.rows.map((e) => e.values.customerId || Gi(s.dataset).find((t) => t.id === e.values.id)?.parentId || "")), p = (e) => JSON.stringify({
			primaryLocationId: e.primaryLocationId,
			primaryContactId: e.primaryContactId,
			locations: e.locations,
			contacts: e.contacts
		}), m = ["Customer branches", "Customer contacts"].includes(s.dataset) ? B.getAll().filter((e) => f.has(e.id)).map((e) => ({
			customerId: e.id,
			before: p(e)
		})) : [], h = [];
		for (let [e, t] of d.rows.entries()) {
			let n = u.results[e];
			n.action === "Skipped" ? h.push(n) : h.push({
				...n,
				...$i(s.dataset, s.mode, t.values, !0),
				before: n.before
			});
		}
		for (let e of h) {
			let t = Gi(s.dataset).find((t) => t.id === e.recordId);
			e.after = qi(s.dataset, t), e.action === "Created" && (e.after.externalId = e.externalId);
		}
		let g = {
			id: crypto.randomUUID(),
			operationId: r,
			fingerprint: c,
			dataset: s.dataset,
			mode: s.mode,
			fileName: s.fileName,
			sourceHash: ye("sha256").update(s.text).digest("hex"),
			actorId: n,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			reason: o,
			results: h,
			parentChanges: m.map((e) => ({
				...e,
				after: p(B.getById(e.customerId))
			})).filter((e) => e.before !== e.after)
		};
		return ia.parse(g), Ui = [...Ui, g], structuredClone(g);
	},
	export(e) {
		e = f(vn).parse(e), Wi(e);
		let t = Cn(e), n = Gi(e).map((t) => qi(e, t));
		return {
			dataset: e,
			count: n.length,
			csv: Dn([t, ...n.map((e) => t.map((t) => e[t] ?? ""))])
		};
	},
	template(e) {
		e = f(vn).parse(e), Wi(e);
		let t = Cn(e).filter((e) => !["id", "recordToken"].includes(e)), n = {
			_format: bn,
			externalId: "replace-with-stable-source-id",
			...Object.fromEntries(Object.entries(Sn[e]).map(([e, t]) => [e, String(t)]))
		};
		return (e === "Customers" || e === "Suppliers") && (n.businessName = "Replace company name"), e === "Suppliers" && (n.country = "Replace country"), e === "Customer branches" && (n.name = "Replace branch name", n.addressLine1 = "Replace address", n.suburb = "Replace city", n.state = "Replace region", n.postcode = "Replace postcode", n.country = "Replace country"), e === "Customer contacts" && (n.firstName = "Replace", n.lastName = "Name", n.email = "replace@example.test"), e === "Products" && (n.sku = "REPLACE-SKU", n.name = "Replace product name"), Dn([t, t.map((e) => n[e] ?? "")]);
	}
}, na = ee(a(), a()), ra = t({
	row: w().int().min(2).max(501),
	externalId: a().max(200),
	recordId: zi,
	action: f([
		"Created",
		"Updated",
		"Skipped"
	]),
	identityFingerprint: a().regex(/^[a-f0-9]{64}$/),
	before: na.nullable(),
	after: na
}).strict(), ia = t({
	id: zi,
	operationId: zi,
	fingerprint: a().regex(/^[a-f0-9]{64}$/),
	dataset: f(vn),
	mode: f(yn),
	fileName: zi,
	sourceHash: a().regex(/^[a-f0-9]{64}$/),
	actorId: zi,
	at: a().refine((e) => new Date(e).toISOString() === e),
	reason: Bi,
	results: r(ra).min(1).max(500),
	parentChanges: r(t({
		customerId: zi,
		before: a().max(5e6),
		after: a().max(5e6)
	}).strict()).max(500)
}).strict();
y("dataTransfers", {
	repository: ta,
	read: "inventory.read",
	commands: {
		review: "inventory.read",
		commit: "inventory.read",
		export: "inventory.read",
		template: "inventory.read"
	},
	snapshot: () => ({ runs: Ui }),
	restore: (e) => {
		Ui = e.runs;
	},
	publish: () => {},
	view: (t) => ({ runs: Ui.filter((n) => e(t, wn[n.dataset].read)) }),
	validate: (e, n) => {
		let i = t({ runs: r(ia) }).strict().parse(e), o = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Set();
		for (let e of i.runs) {
			if (o.has(e.operationId)) throw Error("Duplicate import operation.");
			o.add(e.operationId);
			let i = e.dataset === "Products" ? n.products.products : e.dataset === "Suppliers" ? n.suppliers.suppliers : n.customers.customers, l = 1;
			for (let t of e.results) {
				if (t.row <= l) throw Error("Import result rows must be ordered.");
				if (l = t.row, !(e.dataset === "Customer branches" ? i.some((e) => e.locations.some((e) => e.id === t.recordId)) : e.dataset === "Customer contacts" ? i.some((e) => e.contacts.some((e) => e.id === t.recordId)) : i.some((e) => e.id === t.recordId)) || t.after.id !== t.recordId || t.before && t.before.id !== t.recordId || t.action === "Updated" && !t.before || t.action !== "Updated" && t.before) throw Error("Invalid imported record reference or before/after audit.");
				if (t.action === "Created") {
					if (e.mode !== "Create" || !t.externalId || s.has(e.dataset + ":" + t.externalId) || c.has(e.dataset + ":" + t.recordId)) throw Error("Invalid import source identity.");
					s.set(e.dataset + ":" + t.externalId, t), c.add(e.dataset + ":" + t.recordId);
				}
				if (t.action === "Skipped") {
					let n = s.get(e.dataset + ":" + t.externalId);
					if (e.mode !== "Create" || !n || n.recordId !== t.recordId || n.identityFingerprint !== t.identityFingerprint) throw Error("Invalid skipped import identity.");
				}
				if (t.action === "Updated" && e.mode !== "Update by ID") throw Error("Invalid import update mode.");
				if (t.before && (Object.keys(t.before).some((t) => !Cn(e.dataset).includes(t)) || t.before._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(t.before.recordToken))) throw Error("Invalid import before-state audit.");
				if (Object.keys(t.after).some((t) => !Cn(e.dataset).includes(t)) || t.after._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(t.after.recordToken)) throw Error("Invalid import audit fields.");
			}
			if (new Set(e.parentChanges.map((e) => e.customerId)).size !== e.parentChanges.length || e.parentChanges.length && !["Customer branches", "Customer contacts"].includes(e.dataset)) throw Error("Invalid import parent audit.");
			for (let n of e.parentChanges) {
				if (!i.some((e) => e.id === n.customerId)) throw Error("Invalid import parent reference.");
				for (let e of [n.before, n.after]) {
					let n = t({
						primaryLocationId: a().optional(),
						primaryContactId: a().optional(),
						locations: r(t({ id: zi }).passthrough()),
						contacts: r(t({ id: zi }).passthrough())
					}).strict().parse(JSON.parse(e));
					if (n.primaryLocationId && !n.locations.some((e) => e.id === n.primaryLocationId) || n.primaryContactId && !n.contacts.some((e) => e.id === n.primaryContactId)) throw Error("Invalid import primary-record audit.");
				}
			}
		}
	}
});
//#endregion
//#region electron/security/attachmentRepository.ts
var V = a().trim().min(1).max(200), aa = a().trim().min(1).max(2e3), oa = a().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), sa = t({
	id: V,
	number: w().int().positive(),
	name: V,
	mime: V,
	size: w().int().positive().max(h),
	sha256: a().regex(/^[a-f0-9]{64}$/),
	content: a().max(14e6),
	createdAt: oa,
	createdBy: V,
	restoredFrom: V.optional()
}).strict(), ca = t({
	id: V,
	title: a().trim().min(1).max(200),
	target: d,
	revision: w().int().positive(),
	currentVersionId: V,
	versions: r(sa).min(1).max(100),
	createdAt: oa,
	createdBy: V,
	updatedAt: oa,
	updatedBy: V,
	deletedAt: oa.optional(),
	deletedBy: V.optional()
}).strict(), la = (e) => ({
	title: e.title,
	deleted: !!e.deletedAt,
	currentVersionId: e.currentVersionId,
	versionsCount: e.versions.length
}), ua = t({
	id: V,
	documentId: V,
	operationId: V,
	action: f([
		"Uploaded",
		"Added version",
		"Restored version",
		"Renamed",
		"Trashed",
		"Recovered"
	]),
	actorId: V,
	at: oa,
	revision: w().int().positive(),
	reason: aa,
	versionId: V.optional(),
	fingerprint: a().regex(/^[a-f0-9]{64}$/),
	after: t({
		title: V,
		deleted: o(),
		currentVersionId: V,
		versionsCount: w().int().positive()
	}).strict()
}).strict(), da = [], fa = [];
function pa() {
	return T.require("inventory.read");
}
var ma = () => ve([...new Set(Object.values(le).map((e) => e.repository))]);
function ha(e, t, r = ma()) {
	return n(r, t).find((t) => t.kind === e.kind && t.id === e.id);
}
function ga(e, t = !1) {
	let n = pa(), r = ha(e, n);
	if (!r) throw Error("Business link was not found or access is denied.");
	if (t && !r.canWrite) throw Error("Permission denied: attachment maintenance requires the linked object write permission.");
	return n.userId;
}
function _a(e, t = !1) {
	let n = da.find((t) => t.id === V.parse(e));
	if (!n) throw Error("Attachment not found or access denied.");
	return ga(n.target, t), n;
}
var va = (e) => ye("sha256").update(JSON.stringify(e)).digest("hex"), ya = (e, t) => {
	let n = ha(e.target, t);
	return {
		...e,
		targetLabel: n.label,
		targetPath: n.path,
		canWrite: n.canWrite,
		versions: e.versions.map(({ content: e, ...t }) => t)
	};
};
function ba(e, t) {
	if (e.revision !== t) throw Error("Attachment changed. Refresh before continuing.");
}
function xa(e, t) {
	if (t < e.updatedAt) throw Error("System clock precedes the last attachment change.");
}
function Sa(e) {
	if (da.flatMap((e) => e.versions).reduce((e, t) => e + t.size, 0) + e > 5e7) throw Error("Local attachment library exceeds 50 MB including versions and trash. Export/archive the business profile before adding more files.");
}
function Ca(e, t) {
	let n = fa.find((t) => t.operationId === e);
	if (!n) return;
	let r = _a(n.documentId, !0);
	if (n.fingerprint !== t) throw Error("Operation ID already has different attachment data.");
	return ya(r, T.current());
}
function wa(e, t, n, r, i, a) {
	return da = [...da.filter((t) => t.id !== e.id), e], fa = [...fa, {
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
		after: la(e)
	}], ya(e, T.current());
}
y("attachments", {
	repository: {
		targets() {
			return n(ma(), pa());
		},
		checkTarget(e) {
			return ga(d.parse(e), !0), !0;
		},
		upload(e) {
			let n = t({
				operationId: V,
				id: V.optional(),
				expectedRevision: w().int().nonnegative(),
				target: d,
				title: V,
				reason: aa,
				file: t({
					name: V,
					content: a().max(14e6)
				}).strict()
			}).strict().parse(e), r = ga(n.target, !0), i = _e(n.file.name, n.file.content), o = va({
				...n,
				file: {
					name: i.name,
					sha256: i.sha256
				}
			}), s = Ca(n.operationId, o);
			if (s) return s;
			let c = n.id ? _a(n.id, !0) : void 0;
			if (c) {
				if (ba(c, n.expectedRevision), JSON.stringify(c.target) !== JSON.stringify(n.target)) throw Error("An attachment retains its original business link.");
				if (c.deletedAt) throw Error("Recover the attachment before adding a version.");
				if (c.versions.some((e) => e.sha256 === i.sha256)) throw Error("These file bytes already exist in this attachment. Use version restore instead.");
				if (c.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
			} else if (n.expectedRevision !== 0) throw Error("A new attachment requires revision zero.");
			if (!c && da.some((e) => !e.deletedAt && e.target.kind === n.target.kind && e.target.id === n.target.id && e.versions.some((e) => e.sha256 === i.sha256))) throw Error("This file already exists on the selected business object. Open its existing attachment.");
			Sa(i.size);
			let l = (/* @__PURE__ */ new Date()).toISOString();
			c && xa(c, l);
			let u = {
				...i,
				id: crypto.randomUUID(),
				number: (c?.versions.length ?? 0) + 1,
				createdAt: l,
				createdBy: r
			};
			return wa({
				...c ?? {
					id: crypto.randomUUID(),
					target: n.target,
					createdAt: l,
					createdBy: r
				},
				title: c?.title ?? n.title,
				currentVersionId: u.id,
				versions: [...c?.versions ?? [], u],
				revision: (c?.revision ?? 0) + 1,
				updatedAt: l,
				updatedBy: r
			}, c ? "Added version" : "Uploaded", n.operationId, o, n.reason, u.id);
		},
		change(e) {
			let n = t({
				operationId: V,
				id: V,
				expectedRevision: w().int().positive(),
				action: f([
					"Renamed",
					"Trashed",
					"Recovered",
					"Restored version"
				]),
				reason: aa,
				title: V.optional(),
				versionId: V.optional()
			}).strict().parse(e), r = _a(n.id, !0), i = va(n), a = Ca(n.operationId, i);
			if (a) return a;
			ba(r, n.expectedRevision);
			let o = ga(r.target, !0), s = (/* @__PURE__ */ new Date()).toISOString();
			xa(r, s);
			let c = {
				...r,
				versions: [...r.versions],
				revision: r.revision + 1,
				updatedBy: o,
				updatedAt: s
			}, l;
			if (n.action === "Trashed") {
				if (r.deletedAt) throw Error("Attachment is already in the recycle bin.");
				c.deletedAt = s, c.deletedBy = o;
			} else if (n.action === "Recovered") {
				if (!r.deletedAt) throw Error("Attachment is not in the recycle bin.");
				delete c.deletedAt, delete c.deletedBy;
			} else {
				if (r.deletedAt) throw Error("Recover the attachment before editing.");
				if (n.action === "Renamed") {
					if (!n.title) throw Error("Enter a document title.");
					c.title = n.title;
				} else {
					let e = r.versions.find((e) => e.id === n.versionId);
					if (!e) throw Error("Version not found.");
					if (e.id === r.currentVersionId) throw Error("That version is already current.");
					if (r.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
					Sa(e.size), m(e);
					let t = {
						...e,
						id: crypto.randomUUID(),
						number: r.versions.length + 1,
						createdAt: s,
						createdBy: o,
						restoredFrom: e.id
					};
					c.versions.push(t), c.currentVersionId = t.id, l = t.id;
				}
			}
			return wa(c, n.action, n.operationId, i, n.reason, l);
		},
		read(e) {
			let n = t({
				id: V,
				versionId: V
			}).strict().parse(e), r = _a(n.id).versions.find((e) => e.id === n.versionId);
			if (!r) throw Error("Version not found.");
			return m(r), { ...r };
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
		documents: da,
		history: fa
	}),
	restore: (e) => {
		da = e.documents, fa = e.history;
	},
	publish: () => {},
	view: (e) => {
		let t = da.filter((t) => ha(t.target, e));
		return {
			documents: t.map((t) => ya(t, e)),
			history: fa.filter((e) => t.some((t) => t.id === e.documentId)).map(({ fingerprint: e, ...t }) => t)
		};
	},
	validate: (e, n) => {
		let i = t({
			documents: r(ca),
			history: r(ua)
		}).strict().parse(e), a = /* @__PURE__ */ new Set(), o = 0;
		for (let e of i.documents) {
			let t = le[e.target.kind];
			if (!n[t.repository]?.[t.collection]?.some((t) => t.id === e.target.id)) throw Error("Invalid attachment business reference.");
			if (!!e.deletedAt != !!e.deletedBy) throw Error("Invalid attachment recycle metadata.");
			let r = /* @__PURE__ */ new Set();
			for (let [t, n] of e.versions.entries()) {
				if (m(n), o += n.size, r.has(n.id) || n.number !== t + 1 || n.createdAt < e.createdAt || n.createdAt > e.updatedAt) throw Error("Invalid attachment version history.");
				if (n.restoredFrom && (!r.has(n.restoredFrom) || e.versions.find((e) => e.id === n.restoredFrom)?.sha256 !== n.sha256 || e.versions.find((e) => e.id === n.restoredFrom)?.name !== n.name)) throw Error("Invalid restored attachment version.");
				r.add(n.id);
			}
			if (!r.has(e.currentVersionId)) throw Error("Invalid current attachment version.");
			let a = i.history.filter((t) => t.documentId === e.id);
			if (a.length !== e.revision || a[0].action !== "Uploaded" || a[0].actorId !== e.createdBy || a[0].at !== e.createdAt) throw Error("Invalid attachment audit history.");
			let s = e.createdAt, c = 0, l = !1, u = "", d = "";
			for (let [t, n] of a.entries()) {
				if (n.revision !== t + 1 || n.at < s || n.at > e.updatedAt) throw Error("Invalid attachment audit ordering.");
				if (s = n.at, t > 0 && n.action !== "Renamed" && n.after.title !== d) throw Error("Attachment title changed without a rename event.");
				if (d = n.after.title, ![
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
					u = r.id;
				} else if (n.action === "Trashed") {
					if (l) throw Error("Repeated attachment trash event.");
					l = !0;
				} else if (n.action === "Recovered") {
					if (!l) throw Error("Invalid attachment recovery event.");
					l = !1;
				} else if (l) throw Error("Deleted attachment cannot be renamed.");
				if (n.after.versionsCount !== c || n.after.currentVersionId !== u || n.after.deleted !== l) throw Error("Attachment audit outcome is inconsistent.");
			}
			let f = a.at(-1);
			if (c !== e.versions.length || f.actorId !== e.updatedBy || f.at !== e.updatedAt || JSON.stringify(f.after) !== JSON.stringify(la(e))) throw Error("Attachment metadata differs from audit.");
			if (e.deletedAt && (e.deletedAt !== f.at || e.deletedBy !== f.actorId)) throw Error("Attachment deletion differs from audit.");
		}
		for (let e of i.history) {
			if (a.has(e.operationId) || !i.documents.some((t) => t.id === e.documentId)) throw Error("Invalid attachment operation identity.");
			a.add(e.operationId);
		}
		if (o > 5e7) throw Error("Attachment library exceeds 50 MB.");
	}
});
//#endregion
//#region src/features/job-costing/jobCostingService.ts
function Ta(e) {
	let t = Math.round(e * 100);
	if (!Number.isFinite(e) || !Number.isSafeInteger(t) || Math.abs(t / 100 - e) > 1e-7) throw Error("Amounts must be safe currency values with at most two decimals.");
	return t;
}
function Ea(e, t) {
	return e.flatMap((n) => n.lines.flatMap((r, i) => {
		let a = t.find((e) => e.id === r.accountId);
		if (!a || !["REVENUE", "EXPENSE"].includes(a.type)) return [];
		let o = n, s = r;
		if (n.reversedJournalEntryId) {
			let t = e.find((e) => e.id === n.reversedJournalEntryId), a = t?.lines[i];
			if (!t || !a || a.accountId !== r.accountId || Ta(a.debit) !== Ta(r.credit) || Ta(a.credit) !== Ta(r.debit)) throw Error("Reversal line does not match its original source.");
			o = t, s = a;
		}
		let c = Ta(a.type === "REVENUE" ? r.credit - r.debit : r.debit - r.credit);
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
function Da(e, t, n, r, i, a) {
	if (C(i, "From date"), C(a, "To date"), i > a) throw Error("From date must not follow to date.");
	let o = Ea(e, t).filter((e) => e.date >= i && e.date <= a), s = o.flatMap((e) => {
		let t = r.find((t) => t.journalId === e.rootJournalId && t.lineId === e.rootLineId), i = e.amount < 0 ? -1 : 1, a = Ta(e.capacity), o = (t?.splits ?? []).map((t) => {
			let r = Ta(t.amount);
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
		for (let r of s.filter((t) => t.jobId === e)) r.kind === "REVENUE" ? t += Ta(r.allocated) : n += Ta(r.allocated);
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
			let t = c(e.id), n = Ta(Math.round(Number(e.budget) * 100) / 100), r = Ta(Math.round(Number(e.costBudget) * 100) / 100);
			return {
				id: e.id,
				name: e.name,
				code: e.code,
				status: e.status,
				...t,
				budget: n / 100,
				costBudget: r / 100,
				budgetProfit: (n - r) / 100,
				revenueVariance: (Ta(t.revenue) - n) / 100,
				costVariance: (r - Ta(t.cost)) / 100,
				profitVariance: (Ta(t.profit) - n + r) / 100
			};
		}),
		unallocated: c(""),
		ledger: {
			revenue: o.filter((e) => e.kind === "REVENUE").reduce((e, t) => e + Ta(t.amount), 0) / 100,
			cost: o.filter((e) => e.kind === "EXPENSE").reduce((e, t) => e + Ta(t.amount), 0) / 100
		}
	};
}
//#endregion
//#region src/features/job-costing/jobCostingRepository.ts
var Oa = a().trim().min(1).max(200), ka = a().trim().min(1).max(2e3), Aa = a().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), ja = t({
	jobId: Oa,
	amount: w().finite().positive().refine((e) => {
		try {
			return Ta(e), !0;
		} catch {
			return !1;
		}
	})
}).strict(), Ma = t({
	id: Oa,
	journalId: Oa,
	lineId: Oa,
	revision: w().int().positive(),
	splits: r(ja).max(100),
	updatedAt: Aa,
	updatedBy: Oa
}).strict(), Na = t({
	id: Oa,
	operationId: Oa,
	recordId: Oa,
	revision: w().int().positive(),
	at: Aa,
	actorId: Oa,
	reason: ka,
	fingerprint: a().max(3e6),
	before: r(ja),
	after: r(ja)
}).strict(), Pa = t({
	operationId: Oa,
	journalId: Oa,
	lineId: Oa,
	expectedRevision: w().int().nonnegative(),
	expectedSource: a().max(2e6),
	splits: r(ja).max(100),
	reason: ka
}).strict(), Fa = [], Ia = [], La = /* @__PURE__ */ new Set(), Ra = () => La.forEach((e) => e());
function za(e, t, n) {
	if (new Set(e.map((e) => e.jobId)).size !== e.length) throw Error("Use one split per project.");
	if (e.some((e) => !n.some((t) => t.id === e.jobId))) throw Error("Project was not found.");
	if (e.reduce((e, t) => e + Ta(t.amount), 0) > Ta(t)) throw Error("Project splits exceed the source amount.");
}
y("jobCosting", {
	repository: {
		subscribe(e) {
			return La.add(e), () => {
				La.delete(e);
			};
		},
		getSnapshot: () => Fa,
		review() {
			return T.require("accounting.read"), {
				lines: Ea(A.getAll(), O.getAll()),
				allocations: structuredClone(Fa),
				history: structuredClone(Ia)
			};
		},
		report(e) {
			T.require("accounting.read");
			let n = t({
				from: a(),
				to: a()
			}).strict().parse(e);
			return Da(A.getAll(), O.getAll(), S.jobs, Fa, n.from, n.to);
		},
		save(e) {
			let t = T.require("accounting.post"), n = Pa.parse(e), r = JSON.stringify(n), i = Ia.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already has different allocation data.");
				return Fa.find((e) => e.id === i.recordId);
			}
			let a = Ea(A.getAll(), O.getAll()).find((e) => e.journalId === n.journalId && e.lineId === n.lineId);
			if (!a) throw Error("Select a posted revenue or expense line.");
			if (a.reversal) throw Error("Allocate the original line; reversal entries inherit its splits.");
			if (n.expectedSource !== a.signature) throw Error("Source journal changed. Refresh before allocating.");
			let o = Fa.find((e) => e.journalId === a.journalId && e.lineId === a.lineId);
			if ((o?.revision ?? 0) !== n.expectedRevision) throw Error("Allocation changed. Refresh before saving.");
			za(n.splits, a.capacity, S.jobs);
			for (let e of n.splits) if (S.jobs.find((t) => t.id === e.jobId).status !== "Active" && o?.splits.find((t) => t.jobId === e.jobId)?.amount !== e.amount) throw Error("Only active projects can receive new or changed allocations.");
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
			return Fa = [...Fa.filter((e) => e.id !== c.id), c], Ia = [...Ia, {
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
			}], Ra(), c;
		}
	},
	read: "accounting.read",
	commands: {
		review: "accounting.read",
		report: "accounting.read",
		save: "accounting.post"
	},
	snapshot: () => ({
		allocations: Fa,
		history: Ia
	}),
	restore: (e) => {
		Fa = e.allocations, Ia = e.history;
	},
	publish: Ra,
	validate: (e, n) => {
		let i = t({
			allocations: r(Ma),
			history: r(Na)
		}).strict().parse(e), a = n.workspace_jobs.records, o = Ea(n.journals.journalEntries, n.accounts.accounts), s = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set();
		for (let e of i.allocations) {
			let t = o.find((t) => t.journalId === e.journalId && t.lineId === e.lineId), n = e.journalId + ":" + e.lineId;
			if (!t || t.reversal || s.has(n)) throw Error("Invalid project source reference.");
			s.add(n), za(e.splits, t.capacity, a);
			let r = i.history.filter((t) => t.recordId === e.id);
			if (r.length !== e.revision) throw Error("Invalid allocation history length.");
			let c = [], l = "";
			for (let [n, i] of r.entries()) {
				let r = Pa.parse(JSON.parse(i.fingerprint));
				if (i.revision !== n + 1 || i.at < l || JSON.stringify(i.before) !== JSON.stringify(c) || r.journalId !== e.journalId || r.lineId !== e.lineId || r.operationId !== i.operationId || r.expectedRevision !== n || r.reason !== i.reason || JSON.stringify(r.splits) !== JSON.stringify(i.after)) throw Error("Invalid allocation history chain.");
				za(i.after, t.capacity, a), c = i.after, l = i.at;
			}
			let u = r.at(-1);
			if (JSON.stringify(c) !== JSON.stringify(e.splits) || u.at !== e.updatedAt || u.actorId !== e.updatedBy) throw Error("Allocation outcome differs from audit history.");
		}
		for (let e of i.history) {
			if (c.has(e.operationId) || !i.allocations.some((t) => t.id === e.recordId)) throw Error("Invalid allocation operation reference.");
			c.add(e.operationId);
		}
	}
});
//#endregion
//#region src/features/contact-review/reviewRepository.ts
var Ba = a().trim().min(1).max(200), Va = a().trim().max(2e3), Ha = a().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), Ua = t({
	operationId: Ba,
	kind: f(sn),
	customerId: a().max(200).default(""),
	values: un,
	source: f(cn).default("Manual"),
	externalId: a().trim().max(200).default(""),
	sourceReference: a().trim().max(500).default("")
}).strict(), Wa = t({
	id: Ba,
	action: Ba,
	actorId: Ba,
	at: Ha,
	reason: Va,
	data: a().max(2e6)
}).strict(), Ga = t({
	action: f([
		"Approve new",
		"Link existing",
		"Reject"
	]),
	actorId: Ba,
	at: Ha,
	reason: Va,
	fingerprint: a().max(1e4),
	customerId: a(),
	targetId: a(),
	snapshot: te()
}).strict(), Ka = Ua.extend({
	id: Ba,
	state: f([
		"Pending",
		"Approved",
		"Linked",
		"Rejected"
	]),
	revision: w().int().positive(),
	createdBy: Ba,
	createdAt: Ha,
	updatedAt: Ha,
	creationFingerprint: a().max(1e5),
	history: r(Wa).min(1),
	decision: Ga.optional()
}).strict(), qa = [], Ja = /* @__PURE__ */ new Set(), Ya = () => Ja.forEach((e) => e());
function Xa() {
	let e = T.require("contacts.write");
	return T.require("sales.read"), e.userId;
}
var Za = () => (/* @__PURE__ */ new Date()).toISOString();
function Qa(e) {
	let t = Za();
	if (t < e.updatedAt) throw Error("System clock precedes the last review update. Correct it before continuing.");
	return t;
}
var $a = (e, t, n, r = "", i = {}) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	reason: r,
	data: JSON.stringify(i)
});
function eo(e) {
	let t = qa.find((t) => t.id === e);
	if (!t) throw Error("Review draft not found.");
	return t;
}
function to(e, t) {
	if (e.revision !== t) throw Error("Review draft changed. Reload before continuing.");
}
function no(e) {
	return qa = [...qa.filter((t) => t.id !== e.id), e], Ya(), e;
}
function ro(e) {
	let t = Ua.parse(e);
	if (t.values = dn(t.kind, t.values), t.kind === "Customer" && t.customerId) throw Error("Customer drafts must not have a parent customer.");
	if (t.customerId && !B.getById(t.customerId)) throw Error("Parent customer was not found.");
	return t;
}
function io(e, t) {
	return e === "Customer" ? Br.strict().parse(t) : e === "Branch" ? Vr.strict().parse(t) : Hr.strict().parse(t);
}
function ao(e, t, n) {
	let r = B.getById(e === "Customer" ? n : t);
	if (!r) throw Error("Choose an existing customer.");
	let i = e === "Customer" ? r : e === "Branch" ? r.locations.find((e) => e.id === n) : r.contacts.find((e) => e.id === n);
	if (!i) throw Error("The selected record does not belong to this customer or draft type.");
	return {
		customerId: r.id,
		targetId: i.id,
		snapshot: structuredClone(i)
	};
}
var oo = {
	subscribe(e) {
		return Ja.add(e), () => {
			Ja.delete(e);
		};
	},
	getSnapshot: () => qa,
	create(e) {
		let t = Xa(), n = ro(e), { operationId: r, ...i } = n, a = JSON.stringify(i), o = qa.find((e) => e.operationId === r) || n.externalId && qa.find((e) => e.source === n.source && e.externalId === n.externalId);
		if (o) {
			if (o.creationFingerprint !== a) throw Error("Operation or external source ID already contains different draft data.");
			return o;
		}
		let s = Za();
		return no({
			...n,
			id: crypto.randomUUID(),
			state: "Pending",
			revision: 1,
			createdBy: t,
			createdAt: s,
			updatedAt: s,
			creationFingerprint: a,
			history: [$a("Received", t, s, "", i)]
		});
	},
	importBatch(e) {
		Xa();
		let n = t({
			operationId: Ba.max(150),
			drafts: r(Ua.omit({ operationId: !0 })).min(1).max(100)
		}).strict().parse(e);
		if (n.drafts.some((e) => !e.externalId)) throw Error("Each imported draft requires a source external ID for safe retry.");
		return n.drafts.map((e, t) => oo.create({
			...e,
			operationId: n.operationId + ":" + t
		}));
	},
	update(e) {
		let n = Xa(), r = t({
			id: Ba,
			expectedRevision: w().int().positive(),
			customerId: a().max(200),
			values: un
		}).strict().parse(e), i = eo(r.id);
		if (to(i, r.expectedRevision), i.state !== "Pending") throw Error("Only pending drafts can be edited.");
		let o = ro({
			operationId: i.operationId,
			kind: i.kind,
			customerId: r.customerId,
			values: r.values,
			source: i.source,
			externalId: i.externalId,
			sourceReference: i.sourceReference
		}), s = Qa(i);
		return no({
			...i,
			customerId: o.customerId,
			values: o.values,
			revision: i.revision + 1,
			updatedAt: s,
			history: [...i.history, $a("Updated", n, s, "", {
				customerId: o.customerId,
				values: o.values
			})]
		});
	},
	review(e) {
		T.require("sales.read");
		let t = eo(Ba.parse(e)), n = B.getAll(), r = "";
		try {
			if (io(t.kind, t.values), t.kind !== "Customer" && !n.some((e) => e.id === t.customerId)) throw Error("Select the parent customer.");
		} catch (e) {
			r = e.message;
		}
		return {
			revision: t.revision,
			duplicates: gn(t, n),
			masterSignature: _n(n),
			validationError: r
		};
	},
	decide(e) {
		let n = Xa(), r = t({
			id: Ba,
			expectedRevision: w().int().positive(),
			action: f([
				"Approve new",
				"Link existing",
				"Reject"
			]),
			reason: Va,
			allowDuplicate: o().default(!1),
			targetId: a().max(200).default(""),
			expectedMaster: a().max(25e6).optional()
		}).strict().parse(e), i = eo(r.id), s = JSON.stringify({
			action: r.action,
			reason: r.reason,
			allowDuplicate: r.allowDuplicate,
			targetId: r.targetId
		});
		if (i.state !== "Pending") {
			if (i.decision?.fingerprint === s) return i;
			throw Error("This draft already has a different decision.");
		}
		to(i, r.expectedRevision);
		let c = Qa(i), l = {
			customerId: "",
			targetId: "",
			snapshot: null
		};
		if (r.action === "Reject") {
			if (!r.reason) throw Error("Explain why the draft is rejected.");
		} else {
			let e = B.getAll();
			if (r.expectedMaster !== _n(e)) throw Error("Customer records changed. Refresh duplicate review before deciding.");
			if (r.action === "Link existing") {
				if (!r.reason) throw Error("Explain why this existing record is the correct match.");
				l = ao(i.kind, i.customerId, r.targetId);
			} else {
				if (gn(i, e).length && (!r.allowDuplicate || !r.reason)) throw Error("Possible duplicates exist. Link an existing record or explicitly confirm a separate new record with a reason.");
				let t = io(i.kind, i.values);
				if (i.kind === "Customer") {
					let e = B.create(t);
					l = {
						customerId: e.id,
						targetId: e.id,
						snapshot: structuredClone(e)
					};
				} else {
					let e = B.getById(i.customerId);
					if (!e || e.status === "INACTIVE") throw Error("Select an available parent customer.");
					let n = i.kind === "Branch" ? B.addLocation(e.id, t) : B.addContact(e.id, t);
					l = {
						customerId: e.id,
						targetId: n.id,
						snapshot: structuredClone(n)
					};
				}
			}
		}
		let u = {
			action: r.action,
			actorId: n,
			at: c,
			reason: r.reason,
			fingerprint: s,
			...l
		};
		return no({
			...i,
			state: r.action === "Reject" ? "Rejected" : r.action === "Link existing" ? "Linked" : "Approved",
			revision: i.revision + 1,
			updatedAt: c,
			decision: u,
			history: [...i.history, $a(r.action, n, c, r.reason, u)]
		});
	},
	reopen(e) {
		let n = Xa(), r = t({
			id: Ba,
			expectedRevision: w().int().positive(),
			reason: Va.refine(Boolean, "Explain why this draft is reopened.")
		}).strict().parse(e), i = eo(r.id);
		if (to(i, r.expectedRevision), i.state !== "Rejected") throw Error("Only rejected drafts may be reopened.");
		let a = Qa(i), o = {
			...i,
			state: "Pending",
			revision: i.revision + 1,
			updatedAt: a,
			history: [...i.history, $a("Reopened", n, a, r.reason)]
		};
		return delete o.decision, no(o);
	}
};
y("contactReviews", {
	repository: oo,
	read: "sales.read",
	commands: {
		create: "contacts.write",
		update: "contacts.write",
		importBatch: "contacts.write",
		review: "sales.read",
		decide: "contacts.write",
		reopen: "contacts.write"
	},
	snapshot: () => ({ drafts: qa }),
	restore: (e) => {
		qa = e.drafts;
	},
	publish: Ya,
	validate: (e, n) => {
		let i = t({ drafts: r(Ka) }).strict().parse(e), s = n.customers.customers, c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set();
		for (let e of i.drafts) {
			let n = dn(e.kind, e.values);
			if (Object.keys(n).length !== Object.keys(e.values).length) throw Error("Missing review draft fields.");
			if (c.has(e.operationId) || e.externalId && l.has(e.source + ":" + e.externalId)) throw Error("Duplicate review intake identity.");
			c.add(e.operationId), e.externalId && l.add(e.source + ":" + e.externalId);
			let r = JSON.parse(e.creationFingerprint);
			if (e.history[0].data !== e.creationFingerprint) throw Error("Review source history is inconsistent.");
			if (r.kind !== e.kind || r.source !== e.source || r.externalId !== e.externalId || r.sourceReference !== e.sourceReference) throw Error("Review intake provenance is inconsistent.");
			if (e.history.length !== e.revision || new Set(e.history.map((e) => e.id)).size !== e.history.length || e.history[0].action !== "Received" || e.history[0].actorId !== e.createdBy || e.history[0].at !== e.createdAt || e.updatedAt < e.createdAt) throw Error("Invalid review history.");
			let i = "Pending", u = e.createdAt;
			for (let [t, n] of e.history.entries()) {
				if (n.at < u || n.at > e.updatedAt) throw Error("Invalid review event time.");
				u = n.at;
				let r = JSON.parse(n.data);
				if (!r || typeof r != "object" || Array.isArray(r)) throw Error("Invalid review event payload.");
				if (t !== 0) {
					if (n.action === "Updated") {
						if (i !== "Pending") throw Error("Invalid review edit history.");
					} else if (n.action === "Reopened") {
						if (i !== "Rejected" || !n.reason) throw Error("Invalid review reopen history.");
						i = "Pending";
					} else if ([
						"Approve new",
						"Link existing",
						"Reject"
					].includes(n.action)) {
						if (i !== "Pending") throw Error("Invalid repeated review decision.");
						i = n.action === "Reject" ? "Rejected" : n.action === "Link existing" ? "Linked" : "Approved";
					} else throw Error("Unknown review history action.");
				}
			}
			if (i !== e.state || e.history.at(-1).at !== e.updatedAt) throw Error("Review history does not match current state.");
			if (e.kind === "Customer" && e.customerId || e.customerId && !s.some((t) => t.id === e.customerId)) throw Error("Review parent customer is invalid.");
			if (e.state === "Pending" != !e.decision) throw Error("Review state and decision are inconsistent.");
			if (e.decision) {
				let n = e.state === "Rejected" ? "Reject" : e.state === "Linked" ? "Link existing" : "Approve new", r = t({
					action: f([
						"Approve new",
						"Link existing",
						"Reject"
					]),
					reason: Va,
					allowDuplicate: o(),
					targetId: a()
				}).strict().parse(JSON.parse(e.decision.fingerprint)), i = e.history.at(-1);
				if (r.action !== n || r.reason !== e.decision.reason || r.targetId !== (n === "Link existing" ? e.decision.targetId : "") || i.actorId !== e.decision.actorId || i.at !== e.decision.at || i.reason !== e.decision.reason || JSON.stringify(JSON.parse(i.data)) !== JSON.stringify(e.decision)) throw Error("Review decision audit is inconsistent.");
				if (e.decision.action !== n) throw Error("Invalid review decision.");
				if (n !== "Reject") {
					let t = s.find((t) => t.id === e.decision.customerId), r = e.kind === "Customer" ? t : e.kind === "Branch" ? t?.locations.find((t) => t.id === e.decision.targetId) : t?.contacts.find((t) => t.id === e.decision.targetId);
					if (!r || r.id !== e.decision.targetId || e.kind !== "Customer" && t.id !== e.customerId || e.decision.snapshot?.id !== r.id) throw Error("Invalid resolved review reference.");
					n === "Approve new" && io(e.kind, e.values);
				} else if (!e.decision.reason || e.decision.customerId || e.decision.targetId) throw Error("Invalid rejection.");
			}
		}
	}
});
//#endregion
//#region src/features/sales/data/areaPacks.ts
function so(e, t) {
	let n = wi(e), r = n?.units.find((e) => e.id === t), i = n?.units.find((e) => e.id === n.baseUnitId);
	return n?.status === "ACTIVE" && n.itemType !== "SERVICE" && r?.active && i?.code === "M2" && ["BOX", "ROLL"].includes(r.code) && Number.isFinite(r.conversionToBase) && r.conversionToBase > 0 ? r.conversionToBase : void 0;
}
function co(e, t, n, r) {
	if (r === void 0) return { quantity: n };
	let i = so(e, t);
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
function lo(e) {
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
function uo(e, t) {
	let n = B.getById(e);
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
function fo(e) {
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
function po(e, t, n, r) {
	let i = wi(e), a = Ti(e, t);
	if (!i || i.status !== "ACTIVE" || !a?.active) throw Error("Select an active product and unit.");
	if (r === "buy" && !bi(i)) throw Error("Non-stock/service items use expense bills, not inventory purchase orders.");
	if (r === "buy" && i.buyEnabled === !1 || r === "sell" && i.sellEnabled === !1) throw Error(`Product is not available to ${r}.`);
	if (!Number.isFinite(n) || n <= 0) throw Error("Quantity must be finite and greater than zero.");
	if (i.wholePacks && [
		"BOX",
		"ROLL",
		"BUCKET"
	].includes(a.code) && !Number.isInteger(n)) throw Error("This product must be ordered in whole packs.");
}
//#endregion
//#region src/features/sales/data/quoteStorage.ts
var mo = "htt.mock.sales.quotes.v1", ho = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function go(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !ho.has(String(t.status)) || ![
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
function _o() {
	return Xe(mo, go);
}
function vo(e) {
	if (_o().status === "invalid" || !Qe("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!Ze("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var yo = "htt.mock.sales.quote-orders.v1";
function bo(e) {
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
function xo(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!go(t.quotes) || !bo(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function So() {
	return Xe(yo, xo);
}
function Co(e) {
	if (!xo(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = So(), n = _o();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !Qe("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!Ze("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var wo = "htt.mock.sales.documents.v1";
function To(e) {
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
function Eo(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!xo(t) || !To(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function Do() {
	return Xe(wo, Eo);
}
function Oo(e) {
	if (!Eo(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = Do();
	if (t.status === "invalid" || t.status === "unavailable" || !Qe("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!Ze("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var ko = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Ao(e) {
	let t = e.filter((e) => ko.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function jo() {
	Ao(j.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var Mo = [{
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
}], No = [{
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
}], Po = [{
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
}], Fo = "htt.mock.sales.credit-notes.v1", Io = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, Lo = (e) => typeof e == "string" && e.length > 0;
function Ro(e) {
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
		].every((e) => Lo(t[e])) || ![
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
		].every((e) => Io(i[e])) || !Io(t.amountApplied) || !Io(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => Lo(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !Io(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		if (Math.abs(t - e.amountApplied) > .011) return !1;
		let n = e.refundEvents ?? [];
		if (!Array.isArray(n) || n.some((e) => !e || !Lo(e.id) || !Lo(e.date) || !Io(e.amount) || e.amount <= 0 || e.reversalDate !== void 0 && !Lo(e.reversalDate)) || new Set(n.map((e) => e.id)).size !== n.length) return !1;
		let r = n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0);
		return !Io(e.amountRefunded ?? 0) || Math.abs(r - (e.amountRefunded ?? 0)) > .011 || t + r > e.totals.total + .011 ? !1 : e.status === "VOID" ? t === 0 && r === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t - r)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function zo() {
	return Xe(Fo, Ro);
}
function Bo(e) {
	if (!Ro(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = zo();
	if (t.status === "invalid" || t.status === "unavailable" || !Qe("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!Ze("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var Vo = /* @__PURE__ */ new Set(), Ho = zo(), Uo = Ho.status === "ok" ? structuredClone(Ho.data.creditNotes) : [], Wo = Ho.status === "ok" ? structuredClone(Ho.data.allocations) : [], Go = [...Uo], Ko = [...Wo];
function qo() {
	Go = [...Uo], Ko = [...Wo], Vo.forEach((e) => e());
}
function Jo(e, t) {
	Bo({
		creditNotes: e,
		allocations: t
	}), Uo = e, Wo = t, qo();
}
var H = {
	subscribe(e) {
		return Vo.add(e), () => {
			Vo.delete(e);
		};
	},
	getSnapshot() {
		return Go;
	},
	getAllocationSnapshot() {
		return Ko;
	},
	getAll() {
		return Go;
	},
	getAllAllocations() {
		return Ko;
	},
	getById(e) {
		return Uo.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Uo.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Uo.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return Wo.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return Wo.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if (Uo.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return Jo([e, ...Uo], Wo), e;
	},
	update(e) {
		if (!Uo.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return Jo(Uo.map((t) => t.id === e.id ? e : t), Wo), e;
	},
	createAllocation(e) {
		if (Wo.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return Jo(Uo, [e, ...Wo]), e;
	},
	updateAllocation(e) {
		if (!Wo.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return Jo(Uo, Wo.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!Uo.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = Wo.some((t) => t.id === e.id) ? Wo.map((t) => t.id === e.id ? e : t) : [e, ...Wo];
		Jo(Uo.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return Wo.find((t) => t.id === e);
	}
};
y("customerCredits", {
	repository: H,
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
			fo(n.recipient);
			for (let e of n.lines) lo(e), Si(e, t.products.products.find((t) => t.id === e.productId));
		}
	},
	snapshot: () => ({
		creditNotes: Uo,
		allocations: Wo
	}),
	restore: (e) => {
		Uo = e.creditNotes, Wo = e.allocations, Go = [...Uo], Ko = [...Wo];
	},
	publish: () => Vo.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/customerPricingStorage.ts
var Yo = "htt.mock.contacts.customerPricing.v1";
function Xo(e) {
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
function Zo() {
	return Xe(Yo, Xo);
}
function Qo(e) {
	if (Zo().status === "invalid" || !Qe("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!Ze("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var $o = [
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
], es = /* @__PURE__ */ new Set(), ts = Zo(), ns = ts.status === "ok" ? ts.data : structuredClone($o);
function rs() {
	es.forEach((e) => {
		e();
	});
}
function is(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function as(e) {
	return e.trim() || void 0;
}
function os(e, t) {
	let n = wi(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = n.units.find((e) => e.id === t);
	if (!r) throw Error(`Unit ${t} does not belong to product ${e}`);
	if (!r.active) throw Error("The selected product unit is inactive");
	return {
		product: n,
		unit: r
	};
}
function ss(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function cs({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = ns.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : ss(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = ps(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function ls(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function us(e) {
	let t = Ti(e.productId, e.unitId);
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
var ds = {
	subscribe(e) {
		return es.add(e), () => {
			es.delete(e);
		};
	},
	getSnapshot() {
		return ns;
	},
	getAll() {
		return ns;
	},
	getById(e) {
		return ns.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return ns.filter((t) => t.customerId === e);
	},
	create(e, t) {
		os(t.productId, t.unitId);
		let n = as(t.effectiveTo);
		t.active && cs({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = ls(t), a = {
			id: is("cprice"),
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
		}, o = [a, ...ns];
		return Qo(o), ns = o, rs(), a;
	},
	update(e, t) {
		let n = ds.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		os(t.productId, t.unitId);
		let r = as(t.effectiveTo);
		t.active && cs({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = ls(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = ns.map((t) => t.id === e ? a : t);
		return Qo(o), ns = o, rs(), a;
	},
	resolve(e) {
		return us(e);
	},
	resolvePrice(e, t, n, r) {
		let i = ds.resolveBasePrice(e, t, n, r.slice(0, 10)), a = v({
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
		let { unit: i } = os(t, n), a = ns.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && fs(r, i.effectiveFrom, i.effectiveTo));
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
		let o = us(a);
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
function fs(e, t, n) {
	return !(e < t || n && e > n);
}
function ps(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
y("customerPrices", {
	repository: ds,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: ns }),
	restore: (e) => {
		ns = e.customerPrices;
	},
	publish: () => es.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
function ms(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function hs({ quantity: e, standardUnitPrice: t, unitPrice: n, taxRate: r = b(), inclusiveLineTotal: i }) {
	let a = ms(e * n), o = ms(i === void 0 ? a * r : i - a), s = ms(a + o), c = ms(t - n);
	return {
		discountAmount: c,
		discountPercent: t > 0 ? ms(c / t * 100) : 0,
		lineSubtotal: a,
		taxAmount: o,
		lineTotal: s
	};
}
function gs(e) {
	let t = ms(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = ms(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: ms(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function _s({ customerId: e, documentDate: t, draft: n }) {
	if (n.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let r = wi(n.productId);
	if (!r) throw Error(`Product ${n.productId} was not found`);
	if (r.status !== "ACTIVE") throw Error(`${r.name} is inactive`);
	let i = Ti(n.productId, n.unitId);
	if (!i) throw Error(`Unit ${n.unitId} was not found for ${r.name}`);
	let a = ds.resolvePrice(e, n.productId, n.unitId, t), o = n.unitPrice !== void 0, s = o ? n.unitPrice : a.effectivePrice;
	if (!Number.isFinite(s) || s < 0) throw Error("Unit price cannot be negative");
	let c = co(n.productId, n.unitId, n.quantity, n.requestedArea);
	if (po(n.productId, n.unitId, c.quantity, "sell"), r.sellEnabled === !1) throw Error("Product is not available for selling.");
	let l = r.taxCode ?? _().gstCode, u = b(l), d = o ? oe(s, u, n.priceBasis) : s, f = hs({
		taxRate: u,
		inclusiveLineTotal: o && (n.priceBasis ?? _().basis) === "Inclusive" ? Math.round(c.quantity * s * 100) / 100 : void 0,
		quantity: c.quantity,
		standardUnitPrice: a.basePrice,
		unitPrice: d
	});
	return {
		id: vs("line"),
		itemType: r.itemType ?? "STOCK",
		...c,
		...se(l),
		priceBasis: o ? n.priceBasis ?? _().basis : "Exclusive",
		grossUnitPrice: o && (n.priceBasis ?? _().basis) === "Inclusive" ? s : void 0,
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
function vs(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var ys = /* @__PURE__ */ new Set(), bs = k.read().payments;
function xs() {
	ys.forEach((e) => e());
}
function Ss() {
	return `payment_${crypto.randomUUID()}`;
}
function Cs() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = bs.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var ws = {
	subscribe(e) {
		return ys.add(e), () => {
			ys.delete(e);
		};
	},
	getSnapshot() {
		return bs;
	},
	getAll() {
		return bs;
	},
	getById(e) {
		return bs.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return bs.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return bs.filter((t) => t.invoiceId === e);
	},
	create(e) {
		if (!e.customerId) throw Error("Customer is required");
		if (!e.invoiceId) throw Error("Invoice is required");
		if (!e.paymentDate) throw Error("Payment date is required");
		if (!e.bankAccountId) throw Error("Bank account is required");
		let t = jt.getById(e.bankAccountId);
		if (!t) throw Error("Bank account was not found");
		if (!t.active) throw Error("The selected bank account is inactive");
		if (!Number.isFinite(e.amount) || e.amount <= 0) throw Error("Payment amount must be greater than zero");
		if (C(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (Es(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = j.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: Es(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: Ts(e.reference),
				notes: Ts(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = bs.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Ss(),
			paymentNumber: Cs(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: Es(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: Ts(e.reference),
			notes: Ts(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && j.bindResult(n, i.id);
		let a = [i, ...bs];
		if (k.update("payments", a), bs = a, n && !e.deferOperationCompletion) try {
			j.complete(n, i.id);
		} catch (e) {
			try {
				j.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return xs(), i;
	},
	reverse(e, t) {
		let n = bs.find((t) => t.id === e);
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
		}, o = bs.map((t) => t.id === e ? a : t);
		return k.update("payments", o), bs = o, xs(), a;
	},
	getReceivedByInvoice(e) {
		return bs.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function Ts(e) {
	return e?.trim() || void 0;
}
function Es(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
y("customerPayments", {
	repository: ws,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null
	},
	snapshot: () => ({ payments: bs }),
	restore: (e) => {
		bs = e.payments;
	},
	publish: () => ys.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/taxPosting.ts
function Ds(e, t, n, r) {
	let i = t === "paid" ? "GST_RECEIVABLE" : "GST_PAYABLE", a = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = (t === "paid" ? n.taxPaidAccountId : n.taxCollectedAccountId) || O.requireBySystemRole(i).id;
		a.set(e, (a.get(e) ?? 0) + n.taxAmount);
	}
	return e.length || a.set(O.requireBySystemRole(i).id, r), [...a].filter(([, e]) => Math.round((e + 2 ** -52) * 100) !== 0).map(([e, t]) => {
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
function Os(e) {
	return O.requireBySystemRole(e).id;
}
function ks(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: _().timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function As(e, t) {
	return A.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function js(e, t) {
	let n = As(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Ms = {
	postInvoice(e) {
		return As("CUSTOMER_INVOICE", e.id) || A.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: Os("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: Os("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				...Ds(e.lines, "collected", !1, e.totals.taxAmount)
			]
		});
	},
	reverseInvoice(e) {
		let t = js("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? A.getById(t.reversalJournalEntryId) : void 0 : A.reverse({
			journalEntryId: t.id,
			reversalDate: ks(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = As("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = jt.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this customer payment is inactive.");
		return A.post({
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
				accountId: Os("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = js("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? A.getById(t.reversalJournalEntryId) : void 0 : A.reverse({
			journalEntryId: t.id,
			reversalDate: ks(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return As("CREDIT_NOTE", e.id) || A.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: Os("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				...Ds(e.lines, "collected", !0, e.totals.taxAmount),
				{
					accountId: Os("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = js("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? A.getById(t.reversalJournalEntryId) : void 0 : A.reverse({
			journalEntryId: t.id,
			reversalDate: ks(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, Ns = /* @__PURE__ */ new Set(), Ps = Do(), Fs = So(), Is = _o(), Ls = Ps.status === "ok" ? structuredClone(Ps.data.quotes) : Fs.status === "ok" ? structuredClone(Fs.data.quotes) : Is.status === "ok" ? structuredClone(Is.data) : structuredClone(Mo);
function Rs(e) {
	Ps.status === "ok" || Do().status !== "empty" ? Oo({
		quotes: e,
		salesOrders: zs,
		invoices: U
	}) : Fs.status === "ok" || So().status !== "empty" ? Co({
		quotes: e,
		salesOrders: zs
	}) : vo(e), Ls = e, Us();
}
var zs = Ps.status === "ok" ? structuredClone(Ps.data.salesOrders) : Fs.status === "ok" ? structuredClone(Fs.data.salesOrders) : structuredClone(No), U = Ps.status === "ok" ? structuredClone(Ps.data.invoices) : structuredClone(Po);
function Bs(e) {
	Oo({
		quotes: Ls,
		salesOrders: zs,
		invoices: e
	}), U = e, Us();
}
function Vs(e, t = Ls) {
	Ps.status === "ok" || Do().status !== "empty" ? Oo({
		quotes: t,
		salesOrders: e,
		invoices: U
	}) : Co({
		quotes: t,
		salesOrders: e
	}), zs = e, Ls = t, Us();
}
var Hs = Ws();
function Us() {
	Hs = Ws(), Ns.forEach((e) => e());
}
function Ws() {
	return [
		...Ls,
		...zs,
		...U
	];
}
var W = {
	createManagedOrder(e) {
		let t = zs.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: qs("order"),
			managedDraftId: e.draftId,
			type: "SALES_ORDER",
			status: "CONFIRMED",
			documentNumber: Js("SO", zs.map((e) => e.documentNumber)),
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
		return Vs([r, ...zs]), r;
	},
	createManagedInvoice(e) {
		let t = U.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = W.createManagedOrder(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: qs("invoice"),
			managedDraftId: e.draftId,
			type: "INVOICE",
			status: "ISSUED",
			documentNumber: Js("INV", U.map((e) => e.documentNumber)),
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
		}, a = zs.map((e) => e.id === n.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: r
		} : e);
		return Oo({
			quotes: Ls,
			salesOrders: a,
			invoices: [i, ...U]
		}), zs = a, U = [i, ...U], Us(), Ms.postInvoice(i), i;
	},
	cancelManagedOrder(e, t) {
		let n = zs.find((t) => t.id === e);
		if (!n?.managedDraftId) throw Error("Managed order not found.");
		if (n.status === "CANCELLED") return n;
		if (n.invoiceIds.some((e) => U.some((t) => t.id === e && t.status !== "VOID"))) throw Error("Void active invoices before cancelling the order.");
		if (n.status === "PARTIALLY_FULFILLED" || n.status === "FULFILLED" || n.fulfilmentStatus === "PARTIALLY_FULFILLED" || n.fulfilmentStatus === "FULFILLED") throw Error("Reverse active fulfilments before cancelling the order.");
		if (t.trim().length < 3) throw Error("Cancellation reason is required.");
		let r = {
			...n,
			status: "CANCELLED",
			notes: (n.notes ?? "") + "\nCancelled: " + t.trim(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Vs(zs.map((t) => t.id === e ? r : t)), r;
	},
	subscribe(e) {
		return Ns.add(e), () => {
			Ns.delete(e);
		};
	},
	getSnapshot() {
		return ie(Hs);
	},
	getAll() {
		return ie(Hs);
	},
	getById(e) {
		return ie(Hs).find((t) => t.id === e);
	},
	getByCustomer(e) {
		return ie(Hs).filter((t) => t.customerId === e);
	},
	getQuotesByCustomer(e) {
		return ie(Ls).filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return zs.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return U.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (Gs(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = e.lines.map((t) => _s({
			customerId: e.customerId,
			documentDate: e.documentDate,
			draft: t
		})), n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: qs("quote"),
			type: "QUOTE",
			documentNumber: Js("QU", Ls.map((e) => e.documentNumber)),
			recipient: uo(e.customerId, e),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: Ks(e.customerReference),
			notes: Ks(e.notes),
			lines: t,
			totals: gs(t),
			createdAt: n,
			updatedAt: n
		};
		return Rs([r, ...Ls]), r;
	},
	updateDraftQuote(e, t) {
		let n = Ls.find((t) => t.id === e);
		if (!n) throw Error(`Quote ${e} was not found`);
		if (n.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let r = t.lines.map((e) => {
			if (e.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
			if (!Number.isFinite(e.standardUnitPrice) || !Number.isFinite(e.unitPrice) || e.standardUnitPrice < 0 || e.unitPrice < 0) throw Error("Sales prices cannot be negative");
			let t = co(e.productId, e.unitId, e.quantity, e.requestedArea);
			po(e.productId, e.unitId, t.quantity, "sell");
			let r = wi(e.productId)?.taxCode ?? _().gstCode, i = hs({
				taxRate: b(r),
				quantity: t.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice
			}), a = n.lines.find((t) => t.id === e.lineId);
			return {
				itemType: wi(e.productId)?.itemType ?? "STOCK",
				...t,
				id: a?.id ?? qs("line"),
				productId: e.productId,
				unitId: e.unitId,
				sku: Zs(e.productId, e.unitId).sku,
				description: Zs(e.productId, e.unitId).description,
				unitSymbol: Zs(e.productId, e.unitId).unitSymbol,
				quantity: t.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice,
				priceSource: e.priceSource,
				customerPriceId: e.customerPriceId,
				...se(r),
				...i
			};
		}), i = {
			...n,
			recipient: t.locationId === void 0 && t.accountingContactId === void 0 ? n.recipient : uo(n.customerId, t),
			documentDate: t.documentDate,
			expiryDate: t.expiryDate,
			customerReference: Ks(t.customerReference),
			notes: Ks(t.notes),
			lines: r,
			totals: gs(r),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Rs(Ls.map((t) => t.id === e ? i : t)), i;
	},
	sendQuote(e) {
		let t = Ls.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return Rs(Ls.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = Ls.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return Rs(Ls.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = Ls.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return Rs(Ls.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = Ls.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: qs("order"),
			type: "SALES_ORDER",
			documentNumber: Js("SO", zs.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: Ys(),
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
		return Vs([r, ...zs], Ls.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = zs.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED" && n.status !== "INVOICED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: n.status === "INVOICED" ? "INVOICED" : t,
			fulfilmentStatus: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Vs(zs.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = zs.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = Ys(), i = {
			id: qs("invoice"),
			managedDraftId: t.managedDraftId,
			type: "INVOICE",
			documentNumber: Js("INV", U.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: r,
			dueDate: Xs(r, Number(_().terms)),
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
		}, a = [i, ...U], o = zs.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: n
		} : e);
		return Oo({
			quotes: Ls,
			salesOrders: o,
			invoices: a
		}), U = a, zs = o, Us(), Ms.postInvoice(i), i;
	},
	createCreditNoteFromInvoice(e) {
		let t = U.find((t) => t.id === e.invoiceId);
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
			let i = H.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id).reduce((e, t) => e + t.quantity, 0);
			if (e.quantity + i > n.quantity + 1e-8) throw Error("Credit quantity cannot exceed the original invoice quantity.");
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = H.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id), s = e.quantity + i >= n.quantity - 1e-8, c = Qs(s ? n.lineSubtotal - o.reduce((e, t) => e + t.lineSubtotal, 0) : n.lineSubtotal * e.quantity / n.quantity), l = Qs(s ? n.taxAmount - o.reduce((e, t) => e + t.taxAmount, 0) : n.taxAmount * e.quantity / n.quantity);
			return {
				...n,
				requestedArea: e.quantity === n.quantity ? n.requestedArea : void 0,
				coveredArea: n.areaPerPack ? Math.round(e.quantity * n.areaPerPack * 1e8) / 1e8 : void 0,
				quantity: e.quantity,
				taxRate: a,
				lineSubtotal: c,
				taxAmount: l,
				lineTotal: Qs(c + l)
			};
		}), a = gs(i);
		if (a.total <= 0) throw Error("Credit note total must be greater than zero");
		if (Qs(Qs(H.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + a.total) > Qs(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: qs("credit-note"),
			creditNoteNumber: Js("CN", H.getAll().map((e) => e.creditNoteNumber)),
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
		return H.create(s), Ms.postCreditNote(s), s;
	},
	applyCreditToInvoice(e) {
		N(), jo();
		let t = H.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		let n = U.find((t) => t.id === e.invoiceId);
		if (!n) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void credit note cannot be applied");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be applied");
		if (n.status === "VOID") throw Error("Credit cannot be applied to a void invoice");
		if (n.status === "DRAFT") throw Error("Credit cannot be applied to a draft invoice");
		if (t.customerId !== n.customerId) throw Error("Credit note and invoice must belong to the same customer");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the credit note date");
		let r = Qs(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = H.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: qs("credit-allocation"),
			allocationNumber: Js("CA", H.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = Qs(i.amountApplied + r), c = Qs(Math.max(0, i.totals.total - (i.amountRefunded ?? 0) - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
		if (j.begin(l, "SALES_CREDIT_APPLY", JSON.stringify({
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: r
		})).status !== "started") throw Error("Credit allocation was previously attempted; manual review required.");
		try {
			j.bindResult(l, o.id), H.commitAllocationAndCredit(o, {
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
		N(), jo();
		let t = H.getAllocationById(e.allocationId);
		if (!t) throw Error(`Credit allocation ${e.allocationId} was not found`);
		if (t.status === "REVERSED") throw Error("This credit allocation has already been reversed");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A reversal reason is required");
		let r = H.getById(t.creditNoteId);
		if (!r) throw Error("Credit note was not found");
		if (r.status === "VOID") throw Error("Allocations on a void credit note cannot be reversed here");
		let i = U.find((e) => e.id === t.invoiceId);
		if (!i) throw Error("Allocated invoice was not found");
		if (i.status === "VOID") throw Error("Credit allocation cannot be reversed after the invoice has been voided");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			updatedAt: a
		}, s = Qs(H.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = Qs(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - s)), l = `sales-credit-reversal:${t.id}`;
		if (j.begin(l, "SALES_CREDIT_REVERSAL", t.id).status !== "started") throw Error("Credit allocation reversal previously attempted; manual review required.");
		try {
			j.bindResult(l, t.id), H.commitAllocationAndCredit(o, {
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
		let t = H.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		if (t.status === "VOID") throw Error("This credit note has already been voided");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be voided here");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse customer refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required");
		if (H.getAllocationsByCreditNote(t.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this credit note");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: r,
			voidReason: n,
			updatedAt: r
		};
		return H.update(i), Ms.reverseCreditNote(i), i;
	},
	recordInvoicePayment(e) {
		if (N(), jo(), e.operationId) {
			let t = j.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = U.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = Qs(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (C(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, a = ws.create({
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
			Ms.postPayment(a);
			let e = A.getBySource("CUSTOMER_PAYMENT", a.id).filter((e) => !e.reversedJournalEntryId);
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
		N(), jo();
		let n = U.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (ws.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
		if (H.getAllocationsByInvoice(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("This invoice has applied credits. Reverse all active credit allocations before voiding the invoice.");
		if (n.managedDraftId && H.getByInvoice(n.id).some((e) => e.status !== "VOID")) throw Error("Void source credits before voiding this direct invoice.");
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
			let t = A.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (t.length !== 1 || t[0].status !== "POSTED") throw Error("Invoice original GL must be uniquely posted before voiding.");
			j.bindResult(o, e), Ms.reverseInvoice(a);
			let n = A.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			Bs(U.map((t) => t.id === e ? a : t)), j.complete(o, e);
		} catch (e) {
			try {
				j.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		Fe("CUSTOMER_PAYMENT", e), N(), jo();
		let n = ws.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = U.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (j.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			j.bindResult(i, e);
			let n = ws.reverse(e, t);
			Ms.reversePayment(n);
			let a = A.getBySource("CUSTOMER_PAYMENT", e).filter((e) => !e.reversedJournalEntryId);
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
		let t = U.find((t) => t.id === e);
		if (!t) throw Error(`Invoice ${e} was not found`);
		if (t.status === "VOID") return t;
		let n = ws.getReceivedByInvoice(e), r = H.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = Qs(n.reduce((e, t) => e + t.amount, 0)), a = Qs(r.reduce((e, t) => e + t.amount, 0)), o = Qs(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : $s(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Bs(U.map((t) => t.id === e ? c : t)), c;
	}
};
function Gs(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function Ks(e) {
	return e?.trim() || void 0;
}
function qs(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Js(e, t) {
	return me(e, t, x((/* @__PURE__ */ new Date()).toISOString()).slice(0, 4));
}
function Ys() {
	return x((/* @__PURE__ */ new Date()).toISOString());
}
function Xs(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function Zs(e, t) {
	let n = wi(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = Ti(e, t);
	if (!r) throw Error(`Unit ${t} was not found for ${n.name}`);
	return {
		sku: n.sku,
		description: n.name,
		unitSymbol: r.symbol
	};
}
function Qs(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function $s(e) {
	return e < ec(/* @__PURE__ */ new Date());
}
function ec(e) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
y("sales", {
	repository: W,
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
			fo(e.recipient);
			for (let n of e.lines) lo(n), Si(n, t.products.products.find((e) => e.id === n.productId));
		}
	},
	snapshot: () => ({
		quotes: Ls,
		salesOrders: zs,
		invoices: U
	}),
	restore: (e) => {
		Ls = e.quotes, zs = e.salesOrders, U = e.invoices, Hs = Ws();
	},
	publish: () => Ns.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
function tc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function nc({ orderedQuantity: e, unitCost: t, taxRate: n = b(), inclusiveLineTotal: r }) {
	let i = tc(e * t), a = tc(r === void 0 ? i * n : r - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: tc(i + a)
	};
}
function rc(e) {
	let t = tc(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = tc(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: tc(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var ic = /* @__PURE__ */ new Set(), ac = k.read().purchaseOrders;
k.onRollback(() => {
	ac = k.read().purchaseOrders;
});
function oc() {
	try {
		k.update("purchaseOrders", ac);
	} catch (e) {
		throw ac = k.read().purchaseOrders, e;
	}
	ic.forEach((e) => k.notify(e));
}
function sc(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function cc(e) {
	return me("PO", ac.map((e) => e.purchaseOrderNumber), e.slice(0, 4));
}
function lc(e) {
	return e?.trim() || void 0;
}
function uc(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = Ci.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let n = t.units.find((t) => t.id === e.unitId);
		if (!n) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!n.active) throw Error(`${n.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		if (po(e.productId, e.unitId, e.orderedQuantity, "buy"), t.buyEnabled === !1) throw Error("Product is not available for purchasing.");
		let r = t.taxCode ?? _().gstCode, i = b(r), a = nc({
			taxRate: i,
			inclusiveLineTotal: (e.priceBasis ?? _().basis) === "Inclusive" ? Math.round(e.orderedQuantity * e.unitCost * 100) / 100 : void 0,
			orderedQuantity: e.orderedQuantity,
			unitCost: oe(e.unitCost, i, e.priceBasis)
		});
		return {
			id: sc("pol"),
			...se(r),
			grossUnitCost: (e.priceBasis ?? _().basis) === "Inclusive" ? e.unitCost : void 0,
			productId: t.id,
			unitId: n.id,
			sku: t.sku,
			description: t.name,
			unitSymbol: n.symbol,
			orderedQuantity: e.orderedQuantity,
			receivedQuantity: 0,
			billedQuantity: 0,
			unitCost: oe(e.unitCost, i, e.priceBasis),
			...a
		};
	});
}
function dc(e) {
	let t = hi.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function fc(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var pc = {
	subscribe(e) {
		return ic.add(e), () => {
			ic.delete(e);
		};
	},
	getSnapshot() {
		return ie(ac);
	},
	getAll() {
		return ie(ac);
	},
	getById(e) {
		return ie(ac).find((t) => t.id === e);
	},
	getBySupplier(e) {
		return ie(ac).filter((t) => t.supplierId === e);
	},
	create(e) {
		fc(e);
		let t = dc(e.supplierId), n = uc(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: sc("po"),
			purchaseOrderNumber: cc(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: lc(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: lc(e.supplierReference),
			notes: lc(e.notes),
			lines: n,
			totals: rc(n),
			createdAt: r,
			updatedAt: r
		};
		return ac = [i, ...ac], oc(), i;
	},
	updateDraft(e, t) {
		let n = pc.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		fc(t);
		let r = dc(t.supplierId), i = uc(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: lc(t.expectedDeliveryDate),
			supplierReference: lc(t.supplierReference),
			notes: lc(t.notes),
			lines: i,
			totals: rc(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ac = ac.map((e) => e.id === n.id ? a : e), oc(), a;
	},
	approve(e) {
		let t = pc.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return mc(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = pc.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return mc(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = pc.getById(e);
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
		return ac = ac.map((e) => e.id === n.id ? o : e), oc(), o;
	},
	recordSupplierBill(e, t) {
		let n = pc.getById(e);
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
			let n = hc(e.billedQuantity + t);
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
		return ac = ac.map((e) => e.id === n.id ? c : e), oc(), c;
	},
	reverseSupplierBill(e, t) {
		let n = pc.getById(e);
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
				billedQuantity: hc(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ac = ac.map((e) => e.id === n.id ? c : e), oc(), c;
	},
	cancel(e, t) {
		let n = pc.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return mc(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function mc(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return ac = ac.map((t) => t.id === e.id ? n : t), oc(), n;
}
function hc(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
y("purchaseOrders", {
	repository: pc,
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
	snapshot: () => ({ purchaseOrders: ac }),
	restore: (e) => {
		ac = e.purchaseOrders;
	},
	publish: () => ic.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function G(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function gc(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function _c(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function vc({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return gc(e / t);
}
function yc({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return _c(e * t);
}
function bc({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = G(e + n), a = _c(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : gc(a / i)
	};
}
function xc({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return _c(e * t);
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function Sc(e) {
	return _c(e.lines.reduce((e, t) => {
		let n = vc({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + yc({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function Cc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function wc(e) {
	return O.requireBySystemRole(e).id;
}
function Tc(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	if (/^\d{4}-\d{2}-\d{2}$/.test(e)) return e;
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: _().timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function Ec(e, t) {
	return A.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Dc(e, t) {
	let n = Ec(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Oc = {
	validateGoodsReceiptPosting(e) {
		let t = O.requireBySystemRole("INVENTORY"), n = O.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = Sc(e);
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
		let t = A.getBySource("GOODS_RECEIPT", e.id).find((e) => !e.reversedJournalEntryId);
		if (t) return t;
		let { inventoryAccountId: n, grniAccountId: r, receiptValue: i } = this.validateGoodsReceiptPosting(e);
		return A.post({
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
		let n = O.requireBySystemRole("GRNI"), r = O.requireBySystemRole("GST_RECEIVABLE"), i = O.requireBySystemRole("ACCOUNTS_PAYABLE");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI account must be an active liability account.");
		if (!r.active || r.type !== "ASSET") throw Error("GST Receivable must be an active asset account.");
		if (!i.active || i.type !== "LIABILITY") throw Error("Accounts Payable must be an active liability account.");
		if (!Number.isFinite(t) || t < 0) throw Error("Matched receipt value must be a non-negative finite number.");
		let a = Cc(e.totals.subtotal - t);
		if (a !== 0) {
			let e = O.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = Cc(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = Ec("SUPPLIER_BILL", e.id);
		if (n) return n;
		let r = t ?? e.totals.subtotal, { variance: i } = this.validateSupplierBillPosting(e, r);
		return A.post({
			journalDate: e.billDate,
			description: `Supplier bill ${e.billNumber}`,
			reference: e.supplierInvoiceNumber,
			sourceType: "SUPPLIER_BILL",
			sourceId: e.id,
			lines: [
				{
					accountId: wc("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				...Ds(e.lines, "paid", !0, e.totals.taxAmount),
				...i === 0 ? [] : [{
					accountId: wc("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: wc("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = Dc("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? A.getById(t.reversalJournalEntryId) : void 0 : A.reverse({
			journalEntryId: t.id,
			reversalDate: Tc(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = Ec("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = jt.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return A.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: wc("ACCOUNTS_PAYABLE"),
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
		let t = Dc("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? A.getById(t.reversalJournalEntryId) : void 0 : A.reverse({
			journalEntryId: t.id,
			reversalDate: Tc(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return Ec("SUPPLIER_CREDIT", e.id) || A.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: wc("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				...e.lines.reduce((e, t) => {
					let n = t.expenseAccountId ?? wc("PURCHASE_PRICE_VARIANCE"), r = e.find((e) => e.accountId === n);
					return r ? r.credit = Math.round((r.credit + t.lineSubtotal) * 100) / 100 : t.lineSubtotal && e.push({
						accountId: n,
						debit: 0,
						credit: t.lineSubtotal
					}), e;
				}, []),
				...Ds(e.lines, "paid", !1, e.totals.taxAmount)
			]
		});
	},
	reverseSupplierCredit(e) {
		for (let t of A.getBySource("SUPPLIER_CREDIT_RECLASS", e.id).filter((e) => e.status === "POSTED")) A.reverse({
			journalEntryId: t.id,
			reversalDate: Tc(e.voidedAt),
			reason: e.voidReason ?? "Credit void"
		});
		let t = Dc("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? A.getById(t.reversalJournalEntryId) : void 0 : A.reverse({
			journalEntryId: t.id,
			reversalDate: Tc(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, kc = structuredClone([{
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
}]), Ac = {
	getAll() {
		return kc;
	},
	getById(e) {
		return kc.find((t) => t.id === e);
	},
	getActive() {
		return kc.filter((e) => e.status === "ACTIVE");
	}
}, jc = /* @__PURE__ */ new Set(), Mc = [];
function Nc() {
	jc.forEach((e) => e());
}
function Pc() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Mc.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var Fc = {
	subscribe(e) {
		return jc.add(e), () => {
			jc.delete(e);
		};
	},
	getSnapshot() {
		return Mc;
	},
	getAll() {
		return Mc;
	},
	getByReference(e, t) {
		return Mc.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return Mc.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return Mc.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: Pc(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Mc = [t, ...Mc], Nc(), t;
	}
};
y("inventoryMovements", {
	repository: Fc,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: Mc }),
	restore: (e) => {
		Mc = e.movements;
	},
	publish: () => jc.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var Ic = /* @__PURE__ */ new Set(), Lc = [];
function Rc() {
	Ic.forEach((e) => e());
}
var zc = {
	subscribe(e) {
		return Ic.add(e), () => {
			Ic.delete(e);
		};
	},
	getSnapshot() {
		return Lc;
	},
	getAll() {
		return Lc;
	},
	getBalance(e, t) {
		return Lc.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = zc.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return Lc = Lc.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? Lc.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...Lc], Rc(), e;
	},
	replaceAll(e) {
		Lc = e, Rc();
	},
	clear() {
		Lc = [], Rc();
	}
};
y("costBalances", {
	repository: zc,
	read: "inventory.cost.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: Lc }),
	restore: (e) => {
		Lc = e.balances;
	},
	publish: () => Ic.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var Bc = /* @__PURE__ */ new Set(), Vc = [];
function Hc() {
	Bc.forEach((e) => e());
}
function Uc() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Vc.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function Wc(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var Gc = {
	subscribe(e) {
		return Bc.add(e), () => {
			Bc.delete(e);
		};
	},
	getSnapshot() {
		return Vc;
	},
	getAll() {
		return Vc;
	},
	getByReference(e, t) {
		return Vc.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return Vc.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return Vc.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return Vc.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return Wc(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: Uc(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = Gc.build(e);
		return Vc = [t, ...Vc], Hc(), t;
	},
	replaceAll(e) {
		Vc = e, Hc();
	},
	clear() {
		Vc = [], Hc();
	}
};
y("costMovements", {
	repository: Gc,
	read: "inventory.cost.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: Vc }),
	restore: (e) => {
		Vc = e.movements;
	},
	publish: () => Bc.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function Kc(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function qc(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function Jc(e, t) {
	let n = wi(e);
	if (!n) throw Error("Product was not found.");
	if (!bi(n)) throw Error("Non-stock/service items cannot move inventory value.");
	let r = Ai.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = Ti(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function Yc(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = _c(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(_c(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function Xc(e) {
	if (e && Gc.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function Zc({ movement: e, balance: t }) {
	let n = Gc.getAll(), r = zc.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	Gc.replaceAll(i), zc.replaceAll(a);
}
function Qc(e) {
	if (Kc(e.quantity), qc(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	Xc(e.inventoryMovementId);
	let { policy: t, unit: n } = Jc(e.productId, e.unitId), r = G(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = vc({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = yc({
		quantityBase: r,
		unitCostBase: i
	}), o = zc.getBalance(e.siteId, e.productId);
	o && Yc(o, t.baseUnitId);
	let s = bc({
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
	Yc(l, t.baseUnitId);
	let u = Gc.build({
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
	return Zc({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function $c(e) {
	Kc(e.quantity), qc(e.occurredAt), Xc(e.inventoryMovementId);
	let { policy: t, unit: n } = Jc(e.productId, e.unitId), r = G(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = zc.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (Yc(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = gc(i.averageCostPerBaseUnit), o = xc({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = G(i.quantityOnHand - r), c = s === 0, l = _c(c ? -i.inventoryValue : -o), u = c ? 0 : _c(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : gc(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	Yc(p, t.baseUnitId);
	let m = Gc.build({
		movementType: e.movementType ?? "ISSUE",
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: t.baseUnitId,
		quantityBase: G(-r),
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
	return Zc({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function el(e) {
	if (Kc(e.quantityBase), qc(e.occurredAt), Xc(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = wi(e.productId);
	if (!t) throw Error("Product was not found.");
	if (!bi(t)) throw Error("Non-stock/service items cannot restore inventory value.");
	let n = Ai.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = G(e.quantityBase), i = gc(e.unitCostBase), a = _c(e.inventoryValue), o = zc.getBalance(e.siteId, e.productId);
	o && Yc(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = G(s + r), u = _c(c + a), d = l === 0 ? 0 : gc(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	Yc(p, n.baseUnitId);
	let m = Gc.build({
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
	return Zc({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var tl = /* @__PURE__ */ new Set(), nl = [];
function rl() {
	tl.forEach((e) => e());
}
function il(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var al = {
	subscribe(e) {
		return tl.add(e), () => {
			tl.delete(e);
		};
	},
	getSnapshot() {
		return nl;
	},
	getAll() {
		return nl;
	},
	getBalance(e, t) {
		return nl.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = al.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: il(i.quantityOnHand + r),
				updatedAt: a
			};
			return nl = nl.map((r) => r.siteId === e && r.productId === t ? n : r), rl(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: il(r),
			updatedAt: a
		};
		return nl = [o, ...nl], rl(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = al.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = il(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return nl = nl.map((n) => n.siteId === e && n.productId === t ? o : n), rl(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of Fc.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: il((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		nl = Array.from(e.values()), rl();
	}
};
y("stock", {
	repository: al,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: nl }),
	restore: (e) => {
		nl = e.balances;
	},
	publish: () => tl.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/goodsReceiptRepository.ts
var ol = /* @__PURE__ */ new Set(), sl = k.read().goodsReceipts;
k.onRollback(() => {
	sl = k.read().goodsReceipts;
});
function cl() {
	try {
		k.update("goodsReceipts", sl);
	} catch (e) {
		throw sl = k.read().goodsReceipts, e;
	}
	ol.forEach((e) => k.notify(e));
}
function ll(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function ul(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = sl.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function dl(e) {
	return e?.trim() || void 0;
}
var fl = {
	subscribe(e) {
		return ol.add(e), () => {
			ol.delete(e);
		};
	},
	getSnapshot() {
		return sl;
	},
	getAll() {
		return sl;
	},
	getById(e) {
		return sl.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return sl.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = pc.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = Ac.getById(e.siteId);
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
			let r = ll(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!wi(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = Ti(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = ll(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: ul(e.receiptDate),
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
			supplierDeliveryReference: dl(e.supplierDeliveryReference),
			notes: dl(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		Oc.validateGoodsReceiptPosting(s), N();
		let c = M.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return M.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = wi(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				M.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = Fc.create({
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
					Qc({
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
					al.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			M.runStep(c, "JOURNAL", () => {
				Oc.postGoodsReceipt(s);
			}), M.runStep(c, "PURCHASE_ORDER", () => {
				pc.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), M.runStep(c, "RECEIPT", () => {
				sl = [s, ...sl], cl();
			});
		}), M.recover(c), s;
	}
};
y("goodsReceipts", {
	repository: fl,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: sl }),
	restore: (e) => {
		sl = e.goodsReceipts;
	},
	publish: () => ol.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var pl = 1e-4;
function ml(e) {
	return _c(e);
}
function hl(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - G(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function gl(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function _l(e, t, n) {
	let r = vc({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return yc({
		quantityBase: G(e * n),
		unitCostBase: r
	});
}
function vl(e, t, n) {
	let r = [], i = n.filter((e) => e.status === "ACTIVE");
	for (let n of t) if (n.purchaseOrderId === e && n.status === "POSTED") for (let e of n.lines) {
		let t = G(i.filter((t) => t.goodsReceiptId === n.id && t.goodsReceiptLineId === e.id).reduce((e, t) => e + t.matchedQuantity, 0)), a = G(e.receivedQuantity - t);
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
function yl(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = vl(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), hl(e.quantity), gl(e.billUnitCost);
		let r = G(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > pl);
		if (G(d.reduce((e, t) => e + t.availableQuantity, 0)) + pl < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= pl) break;
			let s = G(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = G(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = yc({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: vc({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = ml(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), h = Math.abs(o.availableQuantity - s) <= pl ? ml(p - m) : _l(s, o.receiptUnitCost, o.conversionToBase);
			if (h < 0) throw Error("Receipt cost has been overallocated.");
			let g = ml(s * e.billUnitCost), ee = ml(g - h);
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
				matchedBillValue: g,
				priceVariance: ee,
				status: "ACTIVE",
				createdAt: l
			}), o.availableQuantity = G(o.availableQuantity - s), r = G(r - s);
		}
		if (r > pl) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = ml(ml(e.quantity * e.billUnitCost) - ml(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = ml(p.matchedBillValue + f), p.priceVariance = ml(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = G(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = G(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = ml(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = ml(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: ml(p - f)
	};
}
var bl = {
	calculate: yl,
	getAvailableReceiptLines(e, t, n) {
		return vl(e, t, n);
	}
}, xl = k.read().receiptMatches;
k.onRollback(() => {
	xl = k.read().receiptMatches;
});
var Sl = /* @__PURE__ */ new Set(), Cl = () => {
	try {
		k.update("receiptMatches", xl);
	} catch (e) {
		throw xl = k.read().receiptMatches, e;
	}
	Sl.forEach((e) => k.notify(e));
}, wl = {
	getAll() {
		return [...xl];
	},
	subscribe(e) {
		return Sl.add(e), () => {
			Sl.delete(e);
		};
	},
	getSnapshot() {
		return xl;
	},
	getByBill(e) {
		return xl.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (xl.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		xl = [...xl, ...t], Cl();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		xl = xl.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), Cl();
	}
};
y("receiptMatches", {
	repository: wl,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: xl }),
	restore: (e) => {
		xl = e.matches;
	},
	publish: () => Sl.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
function Tl(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function El({ quantity: e, unitCost: t, inclusiveLineTotal: n, taxRate: r = .1 }) {
	let i = Tl(e * t), a = Tl(n === void 0 ? i * r : n - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: Tl(i + a)
	};
}
function Dl(e) {
	let t = Tl(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Tl(e.reduce((e, t) => e + t.taxAmount, 0)), r = Tl(t + n);
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
var Ol = /* @__PURE__ */ new Set(), K = k.read().supplierBills;
k.onRollback(() => {
	K = k.read().supplierBills;
});
function kl() {
	try {
		k.update("supplierBills", K);
	} catch (e) {
		throw K = k.read().supplierBills, e;
	}
	Ol.forEach((e) => k.notify(e));
}
function Al(e) {
	return e?.trim() || void 0;
}
function jl(e) {
	return me("BILL", K.map((e) => e.billNumber), e.slice(0, 4));
}
var Ml = {
	insertExpenseBill(e) {
		let t = K.find((t) => t.managedDraftId === e.managedDraftId);
		if (t) return t;
		if (K.some((t) => t.supplierId === e.supplierId && t.supplierInvoiceNumber.toLowerCase() === e.supplierInvoiceNumber.toLowerCase() && t.status !== "VOID")) throw Error("Supplier invoice reference already exists.");
		return K = [e, ...K], kl(), e;
	},
	subscribe(e) {
		return Ol.add(e), () => {
			Ol.delete(e);
		};
	},
	getSnapshot() {
		return K;
	},
	getAll() {
		return K;
	},
	getById(e) {
		return K.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return K.filter((t) => t.supplierId === e);
	},
	applyPayment(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a payment.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment allocation must be greater than zero.");
		let r = Pl(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = Pl(n.totals.amountPaid + r), a = Pl(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((t) => t.id === e ? o : t), kl(), o;
	},
	reversePayment(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = Pl(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = Pl(Math.max(0, n.totals.amountPaid - r)), a = Pl(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((t) => t.id === e ? o : t), kl(), o;
	},
	applyCredit(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = Pl(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = Pl(n.totals.amountCredited + r), a = Pl(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((t) => t.id === e ? o : t), kl(), o;
	},
	reverseCredit(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = Pl(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = Pl(Math.max(0, n.totals.amountCredited - r)), a = Pl(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((t) => t.id === e ? o : t), kl(), o;
	},
	markVoid(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("This supplier bill has already been voided.");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required.");
		if (n.status !== "OPEN" || n.totals.amountPaid > 0 || n.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if ((ve().supplierCredits?.supplierCredits ?? k.read().supplierCredits).some((e) => e.sourceSupplierBillId === n.id && e.status !== "VOID")) throw Error("Reverse source supplier credits and linked physical returns before voiding the bill.");
		if (n.kind === "EXPENSE") {
			N();
			let e = (/* @__PURE__ */ new Date()).toISOString(), t = {
				...n,
				status: "VOID",
				voidedAt: e,
				voidReason: r,
				updatedAt: e
			};
			return Oc.reverseSupplierBill(t), K = K.map((e) => e.id === n.id ? t : e), kl(), t;
		}
		if (wl.getByBill(n.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
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
				Oc.reverseSupplierBill(a);
			}), M.runStep(o, "PURCHASE_ORDER", () => {
				pc.reverseSupplierBill(n.purchaseOrderId, n.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), M.runStep(o, "MATCHES", () => {
				wl.reverseForBill(n.id, r, x(i));
			}), M.runStep(o, "BILL", () => {
				K = K.map((e) => e.id === n.id ? a : e), kl();
			});
		}), M.recover(o), a;
	},
	getByPurchaseOrder(e) {
		return K.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = pc.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (![
			"PARTIALLY_RECEIVED",
			"RECEIVED",
			"BILLED"
		].includes(t.status)) throw Error("Supplier bills can only be created for purchase orders with received goods.");
		let n = e.supplierInvoiceNumber.trim();
		if (!n) throw Error("Supplier invoice number is required.");
		if (K.some((e) => e.supplierId === t.supplierId && e.supplierInvoiceNumber.toLowerCase() === n.toLowerCase() && e.status !== "VOID")) throw Error("This supplier invoice number has already been entered.");
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
			let r = Nl(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = El({
				taxRate: a,
				quantity: e.quantity,
				unitCost: e.unitCost
			});
			return n.grossUnitCost !== void 0 && e.unitCost === n.unitCost && (o.taxAmount = Pl(e.quantity * n.grossUnitCost - o.lineSubtotal), o.lineTotal = Pl(o.lineSubtotal + o.taxAmount)), {
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
		}), o = Dl(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: jl(e.billDate),
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
			notes: Al(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = bl.calculate({
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
			receipts: fl.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: wl.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		Oc.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), N();
		let u = M.begin("SUPPLIER_BILL", c.id).key;
		return M.registerRecovery(u, () => {
			M.runStep(u, "JOURNAL", () => {
				Oc.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), M.runStep(u, "PURCHASE_ORDER", () => {
				pc.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), M.runStep(u, "MATCHES", () => {
				wl.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), M.runStep(u, "BILL", () => {
				K = [c, ...K], kl();
			});
		}), M.recover(u), c;
	}
};
function Nl(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Pl(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
y("supplierBills", {
	repository: Ml,
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
	snapshot: () => ({ supplierBills: K }),
	restore: (e) => {
		K = e.supplierBills;
	},
	publish: () => Ol.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var Fl = /* @__PURE__ */ new Set(), q = k.read().supplierCredits, Il = k.read().supplierCreditAllocations, Ll = k.read().supplierCredits, Rl = k.read().supplierCreditAllocations;
k.onRollback(() => {
	q = k.read().supplierCredits, Il = k.read().supplierCreditAllocations, Ll = q, Rl = Il;
});
function zl() {
	k.update("supplierCredits", q), k.update("supplierCreditAllocations", Il), Ll = [...q], Rl = [...Il], Fl.forEach((e) => k.notify(e));
}
var Bl = !1, J = {
	subscribe(e) {
		return Fl.add(e), () => {
			Fl.delete(e);
		};
	},
	getSnapshot() {
		return Ll;
	},
	getAllocationSnapshot() {
		return Rl;
	},
	getAll() {
		return Ll;
	},
	getAllAllocations() {
		return Rl;
	},
	getById(e) {
		return q.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return q.filter((t) => t.supplierId === e);
	},
	getBySourceBill(e) {
		return q.filter((t) => t.sourceSupplierBillId === e);
	},
	getAllocationById(e) {
		return Il.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return Il.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return Il.filter((t) => t.supplierBillId === e);
	},
	createReturnCredit(e, t) {
		let n = {
			...J.create(e),
			physicalReturnId: t
		};
		return J.update(n), n;
	},
	voidReturnCredit(e) {
		Bl = !0;
		try {
			return J.voidCredit(e);
		} finally {
			Bl = !1;
		}
	},
	create(e) {
		let t = Ml.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (q.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!Wl(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, n) => {
			let r = i.get(e.supplierBillLineId);
			if (!r) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(r.id)) throw Error(`${r.description} appears more than once in the supplier credit.`);
			a.add(r.id);
			let o = Kl(e.quantity);
			if (!Number.isFinite(o) || o <= 0) throw Error(`${r.description} credit quantity must be greater than zero.`);
			if (o > r.quantity) throw Error(`${r.description} credit quantity cannot exceed the source bill quantity.`);
			let s = e.unitCost;
			if (!Number.isFinite(s) || s < 0) throw Error(`${r.description} unit cost cannot be negative.`);
			if (s > r.unitCost + 1e-8) throw Error(`${r.description} credit unit cost cannot exceed the source bill unit cost.`);
			let c = q.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.supplierBillLineId === r.id), l = Math.abs(s - r.unitCost) < 1e-8, u = c.every((e) => Math.abs(e.unitCost - r.unitCost) < 1e-8), d = l && u && Math.abs(o + c.reduce((e, t) => e + t.quantity, 0) - r.quantity) < 1e-8, f = c.reduce((e, t) => e + t.lineSubtotal, 0), p = c.reduce((e, t) => e + t.taxAmount, 0), m = Gl(d ? r.lineSubtotal - f : l ? r.lineSubtotal * o / r.quantity : o * s), h = Gl(d ? r.taxAmount - p : r.unitCost ? r.taxAmount * o / r.quantity * s / r.unitCost : 0);
			if (m < 0 || h < 0 || Gl(m + f) > r.lineSubtotal || Gl(h + p) > r.taxAmount) throw Error("Credit line value exceeds the uncredited source bill line.");
			let g = Gl(m + h);
			return {
				id: Ul(`supplier-credit-line-${n + 1}`),
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
				lineTotal: g
			};
		}), s = Gl(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = Gl(o.reduce((e, t) => e + t.taxAmount, 0)), l = Gl(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (Gl(Gl(q.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > Gl(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: Ul("supplier-credit"),
			creditNumber: Hl(e.creditDate),
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
		return q = [d, ...q], zl(), Oc.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = q.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = Ml.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!Wl(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = Gl(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: Ul("supplier-credit-allocation"),
			allocationNumber: Vl(e.allocationDate),
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
		Ml.applyCredit(n.id, r);
		let o = Gl(t.amountApplied + r), s = Gl(Math.max(0, t.totals.total - (t.amountRefunded ?? 0) - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return Il = [a, ...Il], q = q.map((e) => e.id === t.id ? c : e), zl(), a;
	},
	reverseAllocation(e) {
		let t = Il.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = q.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = Ml.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		Ml.reverseCredit(i.id, t.amount);
		let o = Gl(Math.max(0, r.amountApplied - t.amount)), s = Gl(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - o)), c = {
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
		return q = q.map((e) => e.id === r.id ? c : e), Il = Il.map((e) => e.id === t.id ? l : e), zl(), l;
	},
	voidCredit(e) {
		let t = q.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		if (t.physicalReturnId && !Bl) throw Error("Reverse the linked physical supplier return instead of voiding its credit separately.");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse supplier refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (Il.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: Bl && e.voidDate ? e.voidDate : r,
			voidReason: n,
			updatedAt: r
		};
		return q = q.map((e) => e.id === t.id ? i : e), zl(), Oc.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!Il.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return Il = Il.map((t) => t.id === e.id ? e : t), zl(), e;
	},
	update(e) {
		if (!q.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return q = q.map((t) => t.id === e.id ? e : t), zl(), e;
	}
};
function Vl(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = Il.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Hl(e) {
	return me("SC", q.map((e) => e.creditNumber), e.slice(0, 4));
}
function Ul(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function Wl(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function Gl(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Kl(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var ql = J.create;
J.create = function(...e) {
	return N(), k.transaction(() => ql.apply(J, e));
};
var Jl = J.applyToBill;
J.applyToBill = function(...e) {
	return N(), k.transaction(() => Jl.apply(J, e));
};
var Yl = J.reverseAllocation;
J.reverseAllocation = function(...e) {
	return N(), k.transaction(() => Yl.apply(J, e));
};
var Xl = J.voidCredit;
J.voidCredit = function(...e) {
	return N(), k.transaction(() => Xl.apply(J, e));
};
var Zl = J.update;
J.update = function(...e) {
	return N(), k.transaction(() => Zl.apply(J, e));
};
var Ql = J.updateAllocation;
J.updateAllocation = function(...e) {
	return N(), k.transaction(() => Ql.apply(J, e));
}, y("supplierCredits", {
	repository: J,
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
		supplierCredits: q,
		allocations: Il
	}),
	restore: (e) => {
		q = e.supplierCredits, Il = e.allocations, Ll = [...q], Rl = [...Il];
	},
	publish: () => Fl.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/profitAndLossService.ts
function $l(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function eu(e, t) {
	C(e, t);
}
function tu(e, t, n, r) {
	if (eu(n, "From date"), eu(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = t.filter((e) => e.journalDate >= n && e.journalDate <= r), a = nu(e.filter((e) => e.type === "REVENUE"), i, "REVENUE"), o = nu(e.filter((e) => e.type === "EXPENSE"), i, "EXPENSE"), s = $l(a.reduce((e, t) => e + t.amount, 0)), c = $l(o.reduce((e, t) => e + t.amount, 0)), l = e.find((e) => e.systemRole === "SALES_REVENUE");
	if (!l) throw Error("Sales Revenue system account was not found.");
	if (l.type !== "REVENUE") throw Error("Sales Revenue system account must be a revenue account.");
	let u = e.find((e) => e.systemRole === "COST_OF_GOODS_SOLD");
	if (!u) throw Error("Cost of Goods Sold system account was not found.");
	if (u.type !== "EXPENSE") throw Error("Cost of Goods Sold system account must be an expense account.");
	let d = $l(a.find((e) => e.accountId === l.id)?.amount ?? 0), f = $l(o.find((e) => e.accountId === u.id)?.amount ?? 0), p = $l(d - f);
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
		operatingExpenses: $l(c - f),
		totalExpenses: c,
		netProfit: $l(s - c)
	};
}
function nu(e, t, n) {
	return e.map((e) => {
		let r = 0, i = 0;
		for (let n of t) for (let t of n.lines) t.accountId === e.id && (r = $l(r + t.debit), i = $l(i + t.credit));
		let a = $l(n === "REVENUE" ? i - r : r - i);
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
function ru(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function iu(e) {
	C(e);
}
function au(e, t) {
	let n = 0, r = 0;
	for (let i of t) for (let t of i.lines) t.accountId === e.id && (n = ru(n + t.debit), r = ru(r + t.credit));
	return e.type === "ASSET" || e.type === "EXPENSE" ? ru(n - r) : ru(r - n);
}
function ou(e, t, n) {
	return e.filter((e) => e.type === n).map((e) => ({
		accountId: e.id,
		accountCode: e.code,
		accountName: e.name,
		amount: au(e, t)
	})).filter((e) => e.amount !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 }));
}
function su(e) {
	return ru(e.reduce((e, t) => e + t.amount, 0));
}
function cu(e, t, n) {
	iu(n);
	let r = t.filter((e) => e.journalDate <= n), i = ou(e, r, "ASSET"), a = ou(e, r, "LIABILITY"), o = ou(e, r, "EQUITY"), s = e.filter((e) => e.type === "REVENUE"), c = e.filter((e) => e.type === "EXPENSE"), l = ru(s.reduce((e, t) => e + au(t, r), 0)), u = ru(c.reduce((e, t) => e + au(t, r), 0)), d = su(i), f = su(a), p = su(o), m = ru(l - u), h = ru(p + m), g = ru(f + h), ee = ru(d - g);
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
		totalLiabilitiesAndEquity: g,
		difference: ee,
		balanced: ee === 0
	};
}
//#endregion
//#region src/features/accounting/data/trialBalanceService.ts
function lu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function uu(e, t) {
	C(e, t);
}
function du(e, t) {
	let n = lu(e - t);
	return n >= 0 ? {
		debit: n,
		credit: 0
	} : {
		debit: 0,
		credit: lu(Math.abs(n))
	};
}
function fu(e, t, n, r) {
	if (uu(n, "From date"), uu(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = e.map((e) => {
		let i = 0, a = 0, o = 0, s = 0;
		for (let c of t) for (let t of c.lines) if (t.accountId === e.id) {
			if (c.journalDate < n) {
				i = lu(i + t.debit), a = lu(a + t.credit);
				continue;
			}
			c.journalDate <= r && (o = lu(o + t.debit), s = lu(s + t.credit));
		}
		let c = du(i, a), l = du(lu(i + o), lu(a + s));
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
	}).filter((e) => e.openingDebit !== 0 || e.openingCredit !== 0 || e.periodDebit !== 0 || e.periodCredit !== 0 || e.closingDebit !== 0 || e.closingCredit !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 })), a = lu(i.reduce((e, t) => e + t.openingDebit, 0)), o = lu(i.reduce((e, t) => e + t.openingCredit, 0)), s = lu(i.reduce((e, t) => e + t.periodDebit, 0)), c = lu(i.reduce((e, t) => e + t.periodCredit, 0)), l = lu(i.reduce((e, t) => e + t.closingDebit, 0)), u = lu(i.reduce((e, t) => e + t.closingCredit, 0)), d = lu(l - u);
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
function pu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function mu(e, t) {
	C(e, t);
}
function hu(e, t, n) {
	mu(e.openingBalanceDate, "Opening balance date"), mu(n, "As-at date");
	let r = t.filter((t) => t.journalDate >= e.openingBalanceDate && t.journalDate <= n).flatMap((t) => t.lines.filter((t) => t.accountId === e.glAccountId).map((e) => ({
		entry: t,
		line: e
	}))).sort((e, t) => {
		let n = e.entry.journalDate.localeCompare(t.entry.journalDate);
		if (n !== 0) return n;
		let r = e.entry.createdAt.localeCompare(t.entry.createdAt);
		return r === 0 ? e.line.id.localeCompare(t.line.id) : r;
	}), i = pu(e.openingBalance), a = 0, o = 0, s = r.map(({ entry: t, line: n }) => {
		let r = pu(n.debit), s = pu(n.credit);
		return a = pu(a + r), o = pu(o + s), i = pu(i + r - s), {
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
		openingBalance: pu(e.openingBalance),
		moneyIn: a,
		moneyOut: o,
		closingBalance: i,
		transactionCount: s.length,
		transactions: s
	};
}
//#endregion
//#region src/features/cash-reports/cashReportService.ts
var gu = [
	"Customer receipts & reversals",
	"Customer refunds & reversals",
	"Supplier payments & reversals",
	"Supplier refunds & reversals",
	"Bank opening adjustments",
	"Transfers across selection",
	"Other bank movements / review"
], _u = (e) => Math.round(e * 100), vu = (e) => e / 100;
function yu(e) {
	switch (e.sourceType) {
		case "CUSTOMER_PAYMENT":
		case "CUSTOMER_PAYMENT_REVERSAL": return gu[0];
		case "CUSTOMER_REFUND": return gu[1];
		case "SUPPLIER_PAYMENT":
		case "SUPPLIER_PAYMENT_REVERSAL": return gu[2];
		case "SUPPLIER_REFUND": return gu[3];
		case "OPENING_BALANCE": return gu[4];
		case "BANK_TRANSFER": return gu[5];
		default: return gu[6];
	}
}
function bu(e) {
	if (C(e.from, "From date"), C(e.to, "To date"), e.from > e.to) throw Error("From date must not exceed To date.");
	if (!e.currency.trim()) throw Error("Select a currency.");
	let t = new Map(e.bankAccounts.map((e) => [e.id, e]));
	if (t.size !== e.bankAccounts.length) throw Error("Duplicate bank account IDs require review.");
	if (e.bankIds && (new Set(e.bankIds).size !== e.bankIds.length || e.bankIds.some((e) => !t.has(e)))) throw Error("Invalid bank account selection.");
	let n = e.bankAccounts.filter((t) => (!e.bankIds || e.bankIds.includes(t.id)) && t.currency === e.currency);
	if (e.bankIds?.some((n) => t.get(n).currency !== e.currency)) throw Error("Selected banks must use the report currency.");
	for (let t of n) {
		if (e.bankAccounts.filter((e) => e.glAccountId === t.glAccountId).length !== 1) throw Error("Duplicate bank GL mappings require review before reporting.");
		C(t.openingBalanceDate, "Bank opening date");
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
		let n = hu(t, e.journalEntries, e.to), o = t.openingBalanceDate < e.from ? _u(t.openingBalance) : 0, s = 0, c = 0;
		if (t.openingBalanceDate >= e.from && t.openingBalance !== 0) {
			let e = _u(t.openingBalance);
			a.push({
				id: `setup:${t.id}`,
				bankId: t.id,
				bankName: t.name,
				date: t.openingBalanceDate,
				description: "Bank setup opening balance (not a cash receipt)",
				sourceType: "BANK_SETUP",
				category: gu[4],
				moneyIn: vu(Math.max(e, 0)),
				moneyOut: vu(Math.max(-e, 0))
			}), s += Math.max(e, 0), c += Math.max(-e, 0);
		}
		for (let i of n.transactions) {
			if (i.transactionDate < e.from) {
				o += _u(i.moneyIn) - _u(i.moneyOut);
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
				category: yu(n),
				moneyIn: i.moneyIn,
				moneyOut: i.moneyOut
			}), s += _u(i.moneyIn), c += _u(i.moneyOut);
		}
		let l = _u(n.closingBalance);
		return {
			bankId: t.id,
			name: t.name,
			active: t.active,
			opening: vu(o),
			moneyIn: vu(s),
			moneyOut: vu(c),
			closing: vu(l),
			difference: vu(o + s - c - l)
		};
	}), s = new Map(gu.map((e) => [e, {
		category: e,
		moneyIn: 0,
		moneyOut: 0,
		net: 0
	}])), c = /* @__PURE__ */ new Map();
	for (let e of a) {
		if (e.category === gu[5]) {
			let t = e.journalId;
			c.set(t, (c.get(t) ?? 0) + _u(e.moneyIn) - _u(e.moneyOut));
			continue;
		}
		let t = s.get(e.category);
		t.moneyIn += _u(e.moneyIn), t.moneyOut += _u(e.moneyOut);
	}
	for (let e of c.values()) {
		let t = s.get(gu[5]);
		t.moneyIn += Math.max(e, 0), t.moneyOut += Math.max(-e, 0);
	}
	let l = [...s.values()].map((e) => ({
		category: e.category,
		moneyIn: vu(e.moneyIn),
		moneyOut: vu(e.moneyOut),
		net: vu(e.moneyIn - e.moneyOut)
	})), u = (e) => vu(o.reduce((t, n) => t + _u(n[e]), 0)), d = u("opening"), f = u("closing"), p = vu(l.reduce((e, t) => e + _u(t.net), 0)), m = a.filter((e) => e.category === gu[6]).length;
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
		difference: vu(_u(d) + _u(p) - _u(f))
	};
}
//#endregion
//#region src/features/net-analysis/netAnalysisService.ts
var xu = (e) => Math.round(e * 100);
function Su(e) {
	for (let t of [
		e.subtotal,
		e.tax,
		e.total
	]) if (!Number.isFinite(t) || t < 0 || Math.abs(t * 100 - xu(t)) > 1e-6) throw Error(`${e.number}: invalid saved monetary totals.`);
	if (xu(e.subtotal) + xu(e.tax) !== xu(e.total)) throw Error(`${e.number}: saved net, tax and gross do not reconcile.`);
}
function Cu(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) {
		if (r.status === "DRAFT" || r.openingBalanceImportId) continue;
		let e = `${r.kind}:${r.id}`;
		if (t.has(e)) throw Error(`Duplicate analysis source: ${r.number}.`);
		t.add(e), C(r.date, `Document date (${r.number})`), Su(r);
		let i = r.kind === "CUSTOMER_CREDIT" || r.kind === "SUPPLIER_CREDIT", a = i ? -1 : 1, { voidedAt: o, openingBalanceImportId: s, ...c } = r, l = (t, n, i) => ({
			...c,
			date: t,
			eventId: `${e}:${i}`,
			event: i,
			subtotal: xu(r.subtotal) * n / 100,
			tax: xu(r.tax) * n / 100,
			total: xu(r.total) * n / 100
		});
		if (n.push(l(r.date, a, i ? "CREDIT" : "DOCUMENT")), r.status === "VOID") {
			if (!r.voidedAt) throw Error(`${r.number}: void date is missing. Review the source record before reporting.`);
			let e = x(r.voidedAt);
			if (C(e, `Void date (${r.number})`), e < r.date) throw Error(`${r.number}: void date precedes the original document.`);
			n.push(l(e, -a, "VOID"));
		}
	}
	return n.sort((e, t) => e.date.localeCompare(t.date) || e.number.localeCompare(t.number) || e.eventId.localeCompare(t.eventId));
}
function wu(e, t) {
	if (C(t.from, "From date"), C(t.to, "To date"), t.from > t.to) throw Error("From date must not exceed To date.");
	let n = t.query?.trim().toLowerCase() ?? "", r = Cu(e).filter((e) => e.date >= t.from && e.date <= t.to && (!t.partyId || e.partyId === t.partyId) && (!t.event || t.event === "ALL" || e.event === t.event) && `${e.number} ${e.partyName} ${e.partyId} ${e.kind}`.toLowerCase().includes(n)), i = (e, t) => e.reduce((e, n) => e + xu(n[t]), 0) / 100, a = {
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
function Tu(e, t, n) {
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
function Eu(e, t) {
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
var Du = [
	"Profit & loss",
	"Balance sheet",
	"Trial balance",
	"Cash flow",
	"Net sales",
	"Net purchases"
];
function Ou(e) {
	let t = e.split(",").map((e) => e.trim());
	if (!t.length || t.length > Du.length || t.some((e) => !e)) throw Error("Select one to six supported reports.");
	let n = t.map((e) => Du.find((t) => t.toLowerCase() === e.toLowerCase()));
	if (n.some((e) => !e)) throw Error(`Supported reports: ${Du.join(", ")}.`);
	if (new Set(n).size !== n.length) throw Error("Each report may appear only once in a pack.");
	return n;
}
var ku = (e) => JSON.stringify(e);
function Au(e, t, n) {
	if (C(e.periodStart, "From date"), C(e.periodEnd, "To date"), e.periodStart > e.periodEnd) throw Error("From date must not exceed To date.");
	let r = Ou(e.reports), i = e.periodStart, a = e.periodEnd, o = r.map((e) => {
		if (e === "Profit & loss") {
			let n = tu(t.accounts, t.journals, i, a);
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
			let n = cu(t.accounts, t.journals, a);
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
			let n = fu(t.accounts, t.journals, i, a);
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
			let n = bu({
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
		let n = e === "Net purchases", r = wu(n ? Eu(t.bills, t.supplierCredits) : Tu(t.documents, t.customerCredits, t.customers), {
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
		sourceSignature: ku(t),
		sections: o
	});
}
//#endregion
//#region src/features/report-packs/reportPackCommand.ts
function ju() {
	let e = _();
	return {
		accounts: O.getAll(),
		journals: A.getAll(),
		banks: jt.getAll(),
		documents: W.getAll(),
		customerCredits: H.getAll(),
		customers: B.getAll().map((e) => ({
			id: e.id,
			businessName: e.businessName
		})),
		bills: Ml.getAll(),
		supplierCredits: J.getAll(),
		company: {
			name: e.companyName,
			currency: e.currency,
			timezone: e.timezone
		}
	};
}
function Mu(e) {
	let n = T.require("accounting.read"), r = t({
		id: a().trim().min(1).max(200),
		expectedRevision: a().regex(/^\d+$/)
	}).strict().parse(e), i = S["report-packs"]?.find((e) => e.id === r.id);
	if (!i) throw Error("Report pack configuration was not found.");
	if (i.revision !== r.expectedRevision) throw Error("Report pack changed. Reload before generating.");
	if (i.status !== "Active") throw Error("Activate this report pack before generating.");
	return Au({
		id: i.id,
		revision: i.revision,
		name: i.name,
		cover: i.cover,
		introduction: i.introduction,
		periodStart: i.periodStart,
		periodEnd: i.periodEnd,
		reports: i.reports
	}, ju(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: n.userId
	});
}
//#endregion
//#region src/features/saved-reports/savedReportService.ts
var Nu = [
	"Sales",
	"Purchases",
	"Banking",
	"General ledger"
], Y = (e, t, n = !1) => ({
	key: e,
	label: t,
	numeric: n
}), Pu = [
	Y("date", "Date"),
	Y("number", "Document"),
	Y("contact", "Contact"),
	Y("partyId", "Contact ID"),
	Y("activity", "Activity"),
	Y("status", "Current status"),
	Y("net", "Net", !0),
	Y("tax", "Tax", !0),
	Y("gross", "Gross", !0)
], Fu = {
	Sales: Pu,
	Purchases: Pu,
	Banking: [
		Y("date", "Date"),
		Y("bank", "Bank"),
		Y("journal", "Journal"),
		Y("description", "Description"),
		Y("source", "Source"),
		Y("category", "Activity"),
		Y("moneyIn", "Money in", !0),
		Y("moneyOut", "Money out", !0),
		Y("net", "Net", !0)
	],
	"General ledger": [
		Y("date", "Date"),
		Y("journal", "Journal"),
		Y("accountCode", "Account code"),
		Y("account", "Account"),
		Y("description", "Description"),
		Y("source", "Source"),
		Y("status", "Current status"),
		Y("debit", "Debit", !0),
		Y("credit", "Credit", !0)
	]
}, Iu = (e) => e === "Banking" ? "Cash" : "Accrual", Lu = t({
	from: a(),
	to: a(),
	query: a().max(500).default(""),
	partyId: a().max(200).optional(),
	bankId: a().max(200).optional(),
	accountId: a().max(200).optional(),
	currency: a().min(1).max(10).optional()
}).strict();
function Ru(e) {
	let t = f(Nu).parse(e.dataset);
	if (e.basis !== Iu(t)) throw Error(`${t} uses ${Iu(t)} basis. Cash-basis sales/purchase recognition is not available.`);
	if (e.favourite !== void 0 && !["Yes", "No"].includes(e.favourite)) throw Error("Favourite must be Yes or No.");
	let n;
	try {
		n = JSON.parse(e.filter ?? "");
	} catch {
		throw Error("Legacy filter text is not executable. Edit and save explicit report dates and filters.");
	}
	let r = Lu.parse(n);
	if (C(r.from, "From date"), C(r.to, "To date"), r.from > r.to) throw Error("From date must not exceed To date.");
	if (t !== "Sales" && t !== "Purchases" && r.partyId) throw Error("Contact filters require Sales or Purchases.");
	if (t !== "Banking" && (r.bankId || r.currency)) throw Error("Bank and currency filters require Banking.");
	if (t !== "General ledger" && r.accountId) throw Error("Account filters require General ledger.");
	let i = e.columns.split(",").map((e) => e.trim()), a = t === "Sales" || t === "Purchases" ? {
		customer: "contact",
		supplier: "contact",
		gst: "tax",
		total: "gross"
	} : {}, o = i.map((e) => Fu[t].find((t) => t.label.toLowerCase() === e.toLowerCase() || t.key.toLowerCase() === (a[e.toLowerCase()] ?? e.toLowerCase())));
	if (!i.length || i.length > Fu[t].length || o.some((e) => !e) || new Set(o.map((e) => e?.key)).size !== o.length) throw Error(`Select distinct supported columns for ${t}: ${Fu[t].map((e) => e.label).join(", ")}.`);
	return {
		dataset: t,
		filters: r,
		columns: o
	};
}
var zu = (e, t) => e.reduce((e, n) => {
	let r = Number(n.values[t]), i = e + Math.round(r * 100);
	if (!Number.isFinite(r) || !Number.isSafeInteger(i)) throw Error("Report monetary total exceeds supported cents precision.");
	return i;
}, 0) / 100;
function Bu(e, t, n) {
	let { dataset: r, filters: i, columns: a } = Ru(e), o = i.query.trim().toLowerCase(), s = [], c = [], l = [], u = t.company.currency;
	if (r === "Sales" || r === "Purchases") {
		let e = r === "Sales" ? Tu(t.documents, t.customerCredits, t.customers) : Eu(t.bills, t.supplierCredits);
		if (i.partyId && !e.some((e) => e.partyId === i.partyId) && !(r === "Sales" && t.customers.some((e) => e.id === i.partyId))) throw Error("Selected contact is not available in this dataset.");
		let n = {
			DOCUMENT: "Original document",
			CREDIT: "Credit note",
			VOID: "Void reversal"
		};
		s = Cu(e).filter((e) => e.date >= i.from && e.date <= i.to && (!i.partyId || e.partyId === i.partyId)).map((e) => ({
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
		let e = bu({
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
		value: zu(s, t)
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
		sourceSignature: ku(t),
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
function Vu(e) {
	let n = T.require("accounting.read"), r = t({
		id: a().trim().min(1).max(200),
		expectedRevision: a().regex(/^\d+$/)
	}).strict().parse(e), i = S["custom-reports"]?.find((e) => e.id === r.id);
	if (!i) throw Error("Saved report was not found.");
	if (i.revision !== r.expectedRevision) throw Error("Saved report changed. Reload before running.");
	if (i.status !== "Active") throw Error("Activate this saved report before running.");
	return Bu({
		id: i.id,
		revision: i.revision,
		name: i.name,
		dataset: i.dataset,
		columns: i.columns,
		basis: i.basis,
		filter: i.filter,
		favourite: i.favourite
	}, ju(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: n.userId
	});
}
//#endregion
//#region src/features/business-workspace/workspaceRepository.ts
var Hu = ee(a(), a().max(2e4)), Uu = [
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
], Wu = () => (/* @__PURE__ */ new Date()).toISOString(), Gu = {
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
}, Ku = /* @__PURE__ */ new Set(), qu = 0, Ju = () => {
	qu++, Ku.forEach((e) => e());
}, Yu = Object.fromEntries(Object.keys(Gu).map((e) => [e, []]));
for (let e of Object.keys(Gu)) S[e] = [];
var Xu = () => ({
	collected: O.getAll().find((e) => e.systemRole === "GST_PAYABLE")?.id ?? "",
	paid: O.getAll().find((e) => e.systemRole === "GST_RECEIVABLE")?.id ?? ""
});
S["tax-codes"] = [{
	id: "tax-gst",
	name: "GST",
	status: "Active",
	revision: "1",
	createdAt: Wu(),
	updatedAt: Wu(),
	code: "GST",
	rate: "10",
	basis: "Exclusive",
	report: "GST",
	...Xu()
}, {
	id: "tax-zero",
	name: "Zero rated",
	status: "Active",
	revision: "1",
	createdAt: Wu(),
	updatedAt: Wu(),
	code: "ZERO",
	rate: "0",
	basis: "Exclusive",
	report: "Zero rated",
	...Xu()
}];
function Zu(e, t) {
	if (!e?.trim()) throw Error(`${t} is required.`);
}
function Qu(e, t) {
	if (!e?.trim() || !Number.isFinite(Number(e)) || Number(e) < 0) throw Error(`${t} must be a non-negative number.`);
}
function $u(e, t) {
	let n = O.getAll().find((t) => t.id === e);
	if (!n?.active || t && n.type !== t) throw Error("Select an active account of the correct type.");
	return n;
}
function ed(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && (/* @__PURE__ */ new Date(e + "T00:00:00Z")).toISOString().slice(0, 10) === e;
}
function td(e, t, n, r = !0) {
	let i = Gu[e];
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
	Zu(t.name, "Name");
	for (let e of i.required) Zu(t[e], e);
	if (![
		"Active",
		"Inactive",
		"Open",
		"In progress",
		"Completed"
	].includes(t.status ?? "Active")) throw Error("Invalid business status.");
	if (e === "tax-codes") {
		if (Qu(t.rate, "Tax rate"), t.basis && !["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid entry basis.");
		if (r) {
			let e = n.find((e) => e.id === t.id), r = ve(), i = S.settings?.find((e) => e.section === "business" && e.status === "Active")?.gstCode ?? "GST";
			if (t.status === "Inactive" && t.code === i) throw Error("The default tax code must remain active. Change the business default first.");
			if (e && e.code !== t.code && (e.code === i || r.products.products.some((t) => (t.taxCode ?? "GST") === e.code) || (S["bank-rules"] ?? []).some((t) => t.taxCode === e.code))) throw Error("A referenced tax code cannot be renamed. Create a new code and update future-use references.");
		}
		if (Number(t.rate) > 100) throw Error("Tax rate cannot exceed 100%.");
		if (r) {
			let e = $u(t.collected, "LIABILITY"), n = $u(t.paid, "ASSET"), r = (ve().bankAccounts?.bankAccounts ?? []).map((e) => e.glAccountId);
			if (e.systemRole && e.systemRole !== "GST_PAYABLE" || n.systemRole && n.systemRole !== "GST_RECEIVABLE" || r.includes(n.id)) throw Error("Tax mappings cannot use AR/AP, inventory, GRNI or bank control accounts.");
		}
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Tax code must be unique.");
		if (!/^[A-Z0-9_-]{1,24}$/.test(t.code)) throw Error("Use uppercase letters/numbers for a tax code.");
	}
	if (e === "linked-accounts" && r) {
		let e = O.requireBySystemRole(t.role), n = t.status === "Inactive" ? O.getAll().find((e) => e.systemRole === t.role)?.id : t.accountId, r = ve().journals?.journalEntries ?? [];
		if (n !== e.id && r.some((t) => t.lines.some((t) => t.accountId === e.id || t.accountId === n))) throw Error("A used posting account cannot be remapped without a ledger migration.");
	}
	if (e === "linked-accounts") {
		if (!Uu.includes(t.role)) throw Error("Unknown account role.");
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
		if (r && $u(t.accountId, e), n.some((e) => e.id !== t.id && e.role === t.role)) throw Error("A linked account role may only have one mapping.");
	}
	if (e === "promotions") {
		let e = wi(t.productId);
		if (r && (!e || !Ti(e.id, t.unitId))) throw Error("Product/unit not found.");
		if (Qu(t.price, "Price"), !Number.isInteger(Number(t.priority))) throw Error("Priority must be an integer.");
		if (![
			"Customer price first",
			"Promotion first",
			"Lowest eligible price"
		].includes(t.policy)) throw Error("Invalid price conflict policy.");
		if (!/([+-]\d\d:\d\d|Z)$/.test(t.starts) || !Number.isFinite(Date.parse(t.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(t.ends) || !Number.isFinite(Date.parse(t.ends)) || Date.parse(t.ends) <= Date.parse(t.starts)) throw Error("Promotion requires explicit time offsets and an end after start.");
	}
	if (r && t.customerId && !B.getById(t.customerId)) throw Error("Customer was not found.");
	if (e === "jobs") {
		if (Qu(t.budget, "Revenue budget"), Qu(t.costBudget, "Cost budget"), r) for (let e of ["budget", "costBudget"]) {
			let n = Number(t[e]);
			if (!Number.isSafeInteger(Math.round(n * 100)) || Math.abs(Math.round(n * 100) / 100 - n) > 1e-7) throw Error("Project budgets require safe currency amounts with at most two decimals.");
		}
		if (!ed(t.starts) || !ed(t.ends) || t.ends < t.starts) throw Error("Invalid project dates.");
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Job code must be unique.");
	}
	if (e === "tasks") {
		if (r && t.id && (ve().salesVisits?.visits ?? []).some((e) => e.followupTaskId === t.id && e.customerId !== t.customerId)) throw Error("A visit follow-up must retain the visit customer.");
		if (r && ![
			"Open",
			"In progress",
			"Completed"
		].includes(t.status ?? "Open")) throw Error("Task status must be Open, In progress or Completed.");
		if (!ed(t.due) || ![
			"Low",
			"Normal",
			"High"
		].includes(t.priority)) throw Error("Invalid due date or priority.");
	}
	if (e === "bank-rules") {
		if (r && $u(t.accountId), ![
			"Description",
			"Payee",
			"Reference"
		].includes(t.field) || ![
			"Contains",
			"Equals",
			"Starts with"
		].includes(t.operator)) throw Error("Invalid bank condition.");
		if (r && !S["tax-codes"].some((e) => e.status === "Active" && e.code === t.taxCode)) throw Error("Active tax code not found.");
	}
	if (e === "custom-reports" && r && Ru({
		dataset: t.dataset,
		columns: t.columns,
		basis: t.basis,
		filter: t.filter,
		favourite: t.favourite
	}), e === "report-packs" && r && Ou(t.reports), e === "report-packs" && (!ed(t.periodStart) || !ed(t.periodEnd) || t.periodEnd < t.periodStart)) throw Error("Invalid report period.");
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
			]) Zu(t[e], e);
			if (t.status !== "Active") throw Error("Business settings must remain active.");
			if (!["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid price basis.");
			if (!/^\d+$/.test(t.terms) || Number(t.terms) > 365) throw Error("Payment terms must be 0–365 days.");
			if (!/^\d{2}-\d{2}$/.test(t.yearEnd) || !ed("2001-" + t.yearEnd)) throw Error("Year end must be MM-DD.");
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
				if (!S["tax-codes"].some((e) => e.code === t.gstCode && e.status === "Active")) throw Error("Default tax code must be active.");
				let e = ve().journals.journalEntries, r = n.find((e) => e.id === t.id), i = ve().bankAccounts.bankAccounts, a = r?.currency ?? i[0]?.currency ?? "AUD";
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
function nd(e, t, n) {
	Yu[e].push({
		id: crypto.randomUUID(),
		name: n,
		status: "Active",
		revision: "1",
		createdAt: Wu(),
		updatedAt: Wu(),
		recordId: t.id,
		actorId: T.current()?.userId ?? "local-test",
		after: JSON.stringify(t)
	});
}
var rd = Object.fromEntries(Object.keys(Gu).map((e) => {
	let t = {
		run(t) {
			if (e !== "custom-reports") throw Error("Saved-report execution is not available on this register.");
			return Vu(t);
		},
		generate(t) {
			if (e !== "report-packs") throw Error("Report generation is only available for report packs.");
			return Mu(t);
		},
		getAll: () => S[e],
		getById: (t) => S[e].find((e) => e.id === t),
		save(t, n) {
			let r = Hu.parse(t), i = S[e].find((e) => e.id === r.id);
			if (i && i.revision !== n) throw Error("Record changed. Reload before saving.");
			if (!i && n !== void 0) throw Error("Record no longer exists.");
			let a = Wu(), o = {
				...r,
				id: i?.id ?? crypto.randomUUID(),
				name: r.name.trim(),
				status: r.status ?? (e === "tasks" ? "Open" : "Active"),
				revision: String(Number(i?.revision ?? "0") + 1),
				createdAt: i?.createdAt ?? a,
				updatedAt: a
			};
			return e === "tasks" && (delete o.completedAt, delete o.completedBy, o.status === "Completed" && (o.completedAt = i?.status === "Completed" && i.completedAt || a, o.completedBy = i?.status === "Completed" ? i.completedBy || T.current()?.userId || "local-test" : T.current()?.userId ?? "local-test")), td(e, o, S[e]), S[e] = [...S[e].filter((e) => e.id !== o.id), o], nd(e, o, i ? "Updated" : "Created"), Ju(), o;
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
			nd(e, {
				...i,
				note: r.trim()
			}, "Note added"), Ju();
		}
	};
	return y("workspace_" + e.replaceAll("-", "_"), {
		validate: (t, n) => {
			id(e, t), ad(e, t, n);
		},
		repository: t,
		read: Gu[e].read,
		commands: {
			run: e === "custom-reports" ? "accounting.read" : null,
			generate: e === "report-packs" ? "accounting.read" : null,
			save: Gu[e].write,
			setStatus: Gu[e].write,
			addNote: e === "tasks" ? "sales.write" : null
		},
		snapshot: () => ({
			records: S[e],
			history: Yu[e]
		}),
		restore: (t) => {
			id(e, t), S[e] = t.records, Yu[e] = t.history;
		},
		publish: Ju
	}), [e, t];
}));
function id(e, n) {
	let i = t({
		records: r(Hu),
		history: r(Hu)
	}).strict().parse(n), a = /* @__PURE__ */ new Set();
	for (let t of i.records) {
		if (!t.id || a.has(t.id) || !/^\d+$/.test(t.revision)) throw Error("Invalid workspace record identity.");
		a.add(t.id), td(e, t, i.records, !1);
	}
	return i;
}
function ad(e, t, n) {
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
var X = a().trim().min(1).max(200), od = a().trim().min(1).max(4e3), sd = a().refine((e) => {
	try {
		return C(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), cd = a().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}, "Invalid visit timestamp."), ld = t({
	operationId: X,
	name: X,
	customerId: X,
	locationId: X.optional(),
	plannedDate: sd,
	locationNote: a().trim().max(500).default("")
}).strict(), ud = t({
	name: X,
	due: sd,
	priority: f([
		"Low",
		"Normal",
		"High"
	]),
	notes: od
}).strict(), dd = t({
	id: X,
	expectedRevision: w().int().positive(),
	outcome: od,
	followup: ud.optional()
}).strict(), fd = t({
	id: X,
	action: X,
	actorId: X,
	at: cd,
	note: a().optional()
}).strict(), pd = t({
	id: X,
	operationId: X,
	creationFingerprint: a().min(1).max(3e3),
	name: X,
	customerId: X,
	customerName: X,
	locationId: X.optional(),
	locationName: a().max(200).optional(),
	locationNote: a().max(500),
	plannedDate: sd,
	status: f([
		"Planned",
		"Checked in",
		"Completed",
		"Cancelled"
	]),
	revision: w().int().positive(),
	ownerId: X,
	createdAt: cd,
	updatedAt: cd,
	checkInAt: cd.optional(),
	checkInBy: X.optional(),
	checkOutAt: cd.optional(),
	checkOutBy: X.optional(),
	outcome: od.optional(),
	completionFingerprint: a().optional(),
	followupTaskId: X.optional(),
	history: r(fd).min(1)
}).strict(), md = [], hd = 0, gd = /* @__PURE__ */ new Set(), _d = () => {
	hd++, gd.forEach((e) => e());
}, vd = () => T.require("sales.write").userId, yd = () => (/* @__PURE__ */ new Date()).toISOString(), bd = (e, t, n, r) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	...r ? { note: r } : {}
});
function xd(e) {
	let t = md.find((t) => t.id === e);
	if (!t) throw Error("Visit not found.");
	return t;
}
function Sd(e, t) {
	if (e.revision !== t) throw Error("Visit changed. Reload before continuing.");
}
function Cd(e) {
	let t = yd();
	if (t < e.updatedAt) throw Error("System clock precedes the last visit update. Correct the clock before continuing.");
	return t;
}
function wd(e) {
	return md = [...md.filter((t) => t.id !== e.id), e], _d(), e;
}
function Td(e, t) {
	let n = B.getById(e);
	if (!n || n.status === "INACTIVE") throw Error("Choose an available customer.");
	if (t && !n.locations.some((e) => e.id === t)) throw Error("Choose a location belonging to the selected customer.");
	return n;
}
y("salesVisits", {
	repository: {
		subscribe(e) {
			return gd.add(e), () => {
				gd.delete(e);
			};
		},
		getSnapshot: () => md,
		getAll: () => md,
		create(e) {
			let t = vd(), n = ld.parse(e), r = JSON.stringify(n), i = md.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.creationFingerprint !== r) throw Error("Operation ID was used for different visit data.");
				return i;
			}
			let a = Td(n.customerId, n.locationId), o = yd();
			return wd({
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
				history: [bd("Planned", t, o)]
			});
		},
		update(e) {
			let t = vd(), n = ld.omit({ operationId: !0 }).extend({
				id: X,
				expectedRevision: w().int().positive()
			}).strict().parse(e), r = xd(n.id);
			if (Sd(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be edited.");
			let i = Td(n.customerId, n.locationId), a = Cd(r), o = {
				...r,
				name: n.name,
				customerId: n.customerId,
				customerName: i.businessName,
				plannedDate: n.plannedDate,
				locationNote: n.locationNote,
				revision: r.revision + 1,
				updatedAt: a,
				history: [...r.history, bd("Plan updated", t, a, r.plannedDate + " → " + n.plannedDate)]
			};
			return delete o.locationId, delete o.locationName, n.locationId && (o.locationId = n.locationId, o.locationName = i.locations.find((e) => e.id === n.locationId).name), wd(o);
		},
		checkIn(e) {
			let n = vd(), r = t({
				id: X,
				expectedRevision: w().int().positive()
			}).strict().parse(e), i = xd(r.id);
			if (i.status === "Checked in" && i.revision === r.expectedRevision + 1) return i;
			if (Sd(i, r.expectedRevision), i.status !== "Planned") throw Error("Only a planned visit can be checked in.");
			Td(i.customerId, i.locationId);
			let a = Cd(i);
			return wd({
				...i,
				status: "Checked in",
				revision: i.revision + 1,
				checkInAt: a,
				checkInBy: n,
				updatedAt: a,
				history: [...i.history, bd("Checked in", n, a)]
			});
		},
		finish(e) {
			let t = vd(), n = dd.parse(e), r = xd(n.id), i = JSON.stringify({
				outcome: n.outcome,
				followup: n.followup
			});
			if (r.status === "Completed") {
				if (r.completionFingerprint === i) return r;
				throw Error("Visit is already completed with a different outcome.");
			}
			if (Sd(r, n.expectedRevision), r.status !== "Checked in") throw Error("Check in before completing the visit.");
			let a = Cd(r);
			if (a < r.checkInAt) throw Error("System clock precedes check-in. Correct the clock before completing.");
			let o;
			return n.followup && (o = rd.tasks.save({
				...n.followup,
				customerId: r.customerId,
				owner: t,
				status: "Open"
			}).id), wd({
				...r,
				status: "Completed",
				revision: r.revision + 1,
				checkOutAt: a,
				checkOutBy: t,
				outcome: n.outcome,
				completionFingerprint: i,
				...o ? { followupTaskId: o } : {},
				updatedAt: a,
				history: [...r.history, bd("Completed", t, a, n.outcome)]
			});
		},
		cancel(e) {
			let n = vd(), r = t({
				id: X,
				expectedRevision: w().int().positive(),
				reason: od
			}).strict().parse(e), i = xd(r.id);
			if (Sd(i, r.expectedRevision), !["Planned", "Checked in"].includes(i.status)) throw Error("Only an unfinished visit can be cancelled.");
			let a = Cd(i);
			return wd({
				...i,
				status: "Cancelled",
				revision: i.revision + 1,
				updatedAt: a,
				history: [...i.history, bd("Cancelled", n, a, r.reason)]
			});
		},
		addNote(e) {
			let n = vd(), r = t({
				id: X,
				expectedRevision: w().int().positive(),
				note: od
			}).strict().parse(e), i = xd(r.id);
			Sd(i, r.expectedRevision);
			let a = Cd(i);
			return wd({
				...i,
				revision: i.revision + 1,
				updatedAt: a,
				history: [...i.history, bd("Note added", n, a, r.note)]
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
	snapshot: () => ({ visits: md }),
	restore: (e) => {
		md = e.visits;
	},
	publish: _d,
	validate: (e, n) => {
		let i = t({ visits: r(pd) }).strict().parse(e), a = n, o = /* @__PURE__ */ new Set();
		for (let e of i.visits) {
			if (o.has(e.operationId)) throw Error("Duplicate visit operation ID.");
			if (o.add(e.operationId), !a.customers.customers.find((t) => t.id === e.customerId) || e.locationId && !e.locationName) throw Error("Invalid visit customer/location reference.");
			if (e.history.length !== e.revision || new Set(e.history.map((e) => e.id)).size !== e.history.length || e.updatedAt < e.createdAt) throw Error("Invalid visit history.");
			if (ld.parse(JSON.parse(e.creationFingerprint)).operationId !== e.operationId || e.history[0].action !== "Planned" || e.history[0].actorId !== e.ownerId || e.history[0].at !== e.createdAt) throw Error("Visit creation fingerprint is inconsistent.");
			if (!!e.checkInAt != !!e.checkInBy || !!e.checkOutAt != !!e.checkOutBy || e.checkInAt && e.checkInAt < e.createdAt || e.checkOutAt && (!e.checkInAt || e.checkOutAt < e.checkInAt)) throw Error("Invalid visit check-in/out history.");
			if (e.status === "Planned" && (e.checkInAt || e.checkOutAt) || e.status === "Checked in" && (!e.checkInAt || e.checkOutAt) || e.status === "Completed" && (!e.checkInAt || !e.checkOutAt || !e.outcome || !e.completionFingerprint) || e.status !== "Completed" && (e.checkOutAt || e.outcome || e.followupTaskId || e.completionFingerprint)) throw Error("Visit state is inconsistent.");
			if (e.status === "Completed") {
				let n = t({
					outcome: od,
					followup: ud.optional()
				}).strict().parse(JSON.parse(e.completionFingerprint));
				if (n.outcome !== e.outcome || !!n.followup != !!e.followupTaskId) throw Error("Visit completion fingerprint is inconsistent.");
			}
			if (e.followupTaskId && !a.workspace_tasks.records.some((t) => t.id === e.followupTaskId && t.customerId === e.customerId)) throw Error("Visit follow-up task is missing or belongs to another customer.");
		}
	}
});
//#endregion
//#region src/features/direct-documents/managedDocumentRepository.ts
var Z = a().trim().min(1).max(200), Ed = a().trim().max(2e3).optional(), Dd = t({
	requestedArea: w().finite().positive().max(1e9).optional(),
	productId: Z,
	unitId: Z,
	quantity: w().positive().finite(),
	unitPrice: w().nonnegative().finite().optional(),
	priceBasis: f(["Inclusive", "Exclusive"]).optional()
}).strict(), Od = t({
	description: a().trim().min(1).max(500),
	accountId: Z,
	quantity: w().positive().finite(),
	unitCost: w().nonnegative().finite(),
	taxCode: Z,
	priceBasis: f(["Inclusive", "Exclusive"]).optional()
}).strict(), kd = t({
	kind: f(["ORDER", "INVOICE"]),
	customerId: Z,
	locationId: Z.or(p("")).optional(),
	accountingContactId: Z.or(p("")).optional(),
	documentDate: Z,
	dueDate: Z.optional(),
	customerReference: Ed,
	notes: Ed,
	lines: r(Dd).min(1).max(500)
}).strict(), Ad = t({
	kind: p("EXPENSE"),
	supplierId: Z,
	supplierInvoiceNumber: Z,
	documentDate: Z,
	dueDate: Z,
	notes: Ed,
	lines: r(Od).min(1).max(500)
}).strict(), jd = (e) => g([kd, Ad]).parse(e), Md = w().finite().nonnegative().refine((e) => Number.isSafeInteger(Math.round(e * 100)) && e === Math.round(e * 100) / 100, "Use an amount in whole cents within the supported range."), Nd = t({
	operationId: Z,
	sourceName: a().trim().max(200),
	reviewed: o(),
	declared: t({
		subtotal: Md,
		taxAmount: Md,
		total: Md
	}).strict(),
	payload: Ad.extend({ notes: a().trim().max(1e3).optional() })
}).strict();
function Pd(e) {
	return {
		...e.payload,
		notes: [
			e.payload.notes,
			`Reviewed source: ${e.sourceName || "Manual entry"}`,
			`Declared net / tax / total: ${e.declared.subtotal.toFixed(2)} / ${e.declared.taxAmount.toFixed(2)} / ${e.declared.total.toFixed(2)}`
		].filter(Boolean).join("\n")
	};
}
function Fd(e) {
	let t = hi.getById(e.payload.supplierId);
	if (!t || t.status !== "ACTIVE") throw Error("Select an active supplier.");
	let n = qd(e.payload), r = e.payload.supplierInvoiceNumber.trim().toLowerCase(), i = Ml.getAll(), a = new Set(i.filter((e) => e.status === "VOID").map((e) => e.id)), o = [...Rd.filter((t) => t.operationId !== e.operationId && t.status !== "CANCELLED" && !(t.status === "POSTED" && t.documentId && a.has(t.documentId)) && t.payload.kind === "EXPENSE" && t.payload.supplierId === e.payload.supplierId && t.payload.supplierInvoiceNumber.trim().toLowerCase() === r).map((e) => ({
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
var Id = () => O.getAll().filter((e) => e.active && e.type === "EXPENSE" && e.allowManualPosting && (!e.systemRole || e.systemRole === "OPERATING_EXPENSE" || e.systemRole === "FREIGHT")).map((e) => ({
	id: e.id,
	code: e.code,
	name: e.name
}));
Id();
var Ld = [], Rd = [], zd = 0, Bd = /* @__PURE__ */ new Set(), Vd = () => {
	zd++, Bd.forEach((e) => e());
}, Hd = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Ud(e, t) {
	return {
		action: e,
		actorId: T.current()?.userId ?? "local-test",
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...t ? { reason: t } : {}
	};
}
function Wd(e) {
	for (let t of e) if (t.taxAmount) for (let [e, n] of [[t.taxCollectedAccountId, "LIABILITY"], [t.taxPaidAccountId, "ASSET"]]) {
		if (!e) continue;
		let t = O.requireById(e);
		if (!t.active || t.type !== n) throw Error("A snapshotted tax posting account is no longer active or has the wrong type.");
	}
}
function Gd(e) {
	let t = O.requireById(e);
	if (!t.active || t.type !== "EXPENSE" || !t.allowManualPosting || t.systemRole && t.systemRole !== "OPERATING_EXPENSE" && t.systemRole !== "FREIGHT") throw Error("Use an active manual expense account, not an inventory, GRNI or control account.");
	return t;
}
function Kd(e) {
	let t = e.payload;
	if (t.kind === "EXPENSE") {
		let n = hi.getById(t.supplierId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active supplier.");
		for (let t of e.lines) Gd(t.expenseAccountId);
	} else {
		let n = B.getById(t.customerId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active customer.");
		for (let t of e.lines) po(t.productId, t.unitId, t.quantity, "sell");
	}
	Wd(e.lines);
}
function qd(e) {
	if (C(e.documentDate, "Document date"), e.dueDate && (C(e.dueDate, "Due date"), e.dueDate < e.documentDate)) throw Error("Due date cannot precede document date.");
	if (e.kind !== "ORDER" && !e.dueDate) throw Error("Due date is required.");
	let t = e.kind === "EXPENSE" ? e.lines.map((e) => {
		Gd(e.accountId);
		let t = se(e.taxCode), n = oe(e.unitCost, t.taxRate, e.priceBasis), r = Hd(e.quantity * n), i = (e.priceBasis ?? _().basis) === "Inclusive" ? Hd(e.quantity * e.unitCost - r) : Hd(r * t.taxRate);
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
			lineTotal: Hd(r + i)
		};
	}) : e.lines.map((t) => _s({
		customerId: e.customerId,
		documentDate: e.documentDate,
		draft: t
	})), n = gs(t);
	if (n.total <= 0 || !Number.isFinite(n.total)) throw Error("Document total must be finite and greater than zero.");
	return {
		lines: t,
		totals: n
	};
}
function Jd(e) {
	let n = () => e === "sales" ? Ld : Rd;
	function r(t) {
		return e === "sales" ? Ld = [...Ld.filter((e) => e.id !== t.id), t] : Rd = [...Rd.filter((e) => e.id !== t.id), t], Vd(), t;
	}
	let i = (e) => {
		let t = n().find((t) => t.id === e);
		if (!t || c(t.id)) throw Error("Draft not found or is in the recycle bin.");
		return t;
	};
	function a(e, t) {
		if (e.revision !== t) throw Error("Draft changed. Reload before editing or approving.");
	}
	function o(e, t, n = {}, i) {
		return r({
			...e,
			...n,
			revision: e.revision + 1,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			history: [...e.history, Ud(t, i)]
		});
	}
	let s = (e, t) => Xd.save({
		operationId: e,
		payload: t
	});
	return {
		getAll: () => ie(n()),
		reviewCapture(t) {
			if (T.require("purchases.bill"), e !== "expense") throw Error("Capture is only available for expense bills.");
			return Fd(Nd.parse(t));
		},
		capture(t) {
			if (T.require("purchases.bill"), e !== "expense") throw Error("Capture is only available for expense bills.");
			let r = Nd.parse(t);
			if (!r.reviewed) throw Error("Confirm that the supplier document has been reviewed.");
			let i = Pd(r);
			if (n().find((e) => e.operationId === r.operationId)) return s(r.operationId, i);
			let a = Fd(r);
			if (!a.matches) throw Error(a.issues.join(" "));
			return s(r.operationId, i);
		},
		save(o) {
			let s = t({
				operationId: Z,
				id: Z.optional(),
				expectedRevision: w().int().positive().optional(),
				payload: e === "sales" ? kd : Ad
			}).strict().parse(o), l = JSON.stringify(s.payload);
			if (!s.id) {
				let e = n().find((e) => e.operationId === s.operationId);
				if (e) {
					if (c(e.id)) throw Error("Recover the existing draft from the recycle bin.");
					if (e.creationFingerprint !== l) throw Error("Operation ID was used for different draft data.");
					return e;
				}
			}
			let u = s.id ? i(s.id) : void 0;
			if (u && (a(u, s.expectedRevision ?? -1), u.status !== "DRAFT")) throw Error("Only unapproved drafts can be edited. Reopen an approved draft before editing.");
			let d = qd(s.payload), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
				id: u?.id ?? crypto.randomUUID(),
				operationId: u?.operationId ?? s.operationId,
				creationFingerprint: u?.creationFingerprint ?? l,
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
				recipient: s.payload.kind === "EXPENSE" ? void 0 : uo(s.payload.customerId, s.payload),
				...d,
				createdAt: u?.createdAt ?? f,
				updatedAt: f,
				history: [...u?.history ?? [], Ud(u ? "Edited" : "Created")]
			};
			if (u && u.kind !== p.kind) throw Error("Document kind cannot change.");
			return Kd(p), r(p);
		},
		approve(e, t) {
			let n = i(e);
			if (n.status === "APPROVED" && n.revision === t + 1) return n;
			if (a(n, t), n.status !== "DRAFT") throw Error("Only a draft can be approved.");
			return Kd(n), o(n, "Approved", { status: "APPROVED" });
		},
		reopen(e, t, n) {
			let r = i(e);
			if (a(r, t), r.status !== "APPROVED" || n.trim().length < 3) throw Error("Only approved drafts can be reopened with a reason.");
			return o(r, "Reopened", { status: "DRAFT" }, n);
		},
		cancel(e, t, n) {
			let r = i(e);
			if (a(r, t), r.status === "POSTED" || r.status === "CANCELLED" || n.trim().length < 3) throw Error("Only unposted drafts can be cancelled with a reason.");
			return o(r, "Cancelled", { status: "CANCELLED" }, n);
		},
		post(e, t) {
			let n = i(e);
			if (n.status === "POSTED") return n;
			if (a(n, t), n.status !== "APPROVED") throw Error("Approve the draft before posting.");
			N(), Ke(n.payload.documentDate), Kd(n);
			let r, s = n.payload;
			if (s.kind === "EXPENSE") {
				let e = hi.getById(s.supplierId), t = (/* @__PURE__ */ new Date()).toISOString(), i = {
					id: crypto.randomUUID(),
					managedDraftId: n.id,
					kind: "EXPENSE",
					billNumber: me("BILL", Ml.getAll().map((e) => e.billNumber), s.documentDate.slice(0, 4)),
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
				Ml.insertExpenseBill(i);
				let a = i.lines.filter((e) => e.lineSubtotal !== 0).map((e) => ({
					accountId: e.expenseAccountId,
					description: e.description,
					debit: e.lineSubtotal,
					credit: 0
				}));
				A.post({
					journalDate: i.billDate,
					description: "Expense bill " + i.billNumber,
					reference: i.supplierInvoiceNumber,
					sourceType: "SUPPLIER_BILL",
					sourceId: i.id,
					lines: [
						...a,
						...Ds(i.lines, "paid", !0, i.totals.taxAmount),
						{
							accountId: O.requireBySystemRole("ACCOUNTS_PAYABLE").id,
							debit: 0,
							credit: i.totals.total
						}
					]
				}), r = i.id;
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
				r = s.kind === "ORDER" ? W.createManagedOrder(e).id : W.createManagedInvoice({
					...e,
					dueDate: s.dueDate
				}).id;
			}
			return o(n, "Posted", {
				status: "POSTED",
				documentId: r
			});
		},
		cancelOrder(e, t) {
			let n = i(e);
			if (n.kind !== "ORDER" || n.status !== "POSTED") throw Error("A confirmed managed order is required.");
			return W.cancelManagedOrder(n.documentId, t), o(n, "Order cancelled", {}, t);
		}
	};
}
var Yd = Jd("sales"), Xd = Jd("expense"), Zd = t({
	recipient: t({
		locationId: a().optional(),
		locationName: a().optional(),
		deliveryAddress: a().optional(),
		accountingContactId: a().optional(),
		accountingContactName: a().optional(),
		accountingEmail: a().email().optional()
	}).strict().optional(),
	id: Z,
	operationId: Z,
	creationFingerprint: a().max(1e6),
	revision: w().int().positive(),
	kind: f([
		"ORDER",
		"INVOICE",
		"EXPENSE"
	]),
	status: f([
		"DRAFT",
		"APPROVED",
		"POSTED",
		"CANCELLED"
	]),
	payload: g([kd, Ad]),
	lines: r(t({
		id: Z,
		description: a().min(1),
		quantity: w().finite().positive(),
		unitSymbol: a().min(1),
		unitPrice: w().finite().nonnegative().optional(),
		unitCost: w().finite().nonnegative().optional(),
		taxRate: w().finite().min(0).max(1),
		taxCode: Z,
		taxPaidAccountId: Z.optional(),
		taxCollectedAccountId: Z.optional(),
		lineSubtotal: w().finite().nonnegative(),
		taxAmount: w().finite().nonnegative(),
		lineTotal: w().finite().nonnegative()
	}).passthrough()).min(1),
	totals: t({
		subtotal: w().finite(),
		taxAmount: w().finite(),
		total: w().finite()
	}),
	documentId: Z.optional(),
	createdAt: Z,
	updatedAt: Z,
	history: r(t({
		action: Z,
		actorId: Z,
		at: Z,
		reason: a().optional()
	}).strict()).min(1)
}).strict();
for (let e of ["sales", "expense"]) y(e === "sales" ? "managedSalesDocuments" : "expenseBillDrafts", {
	repository: e === "sales" ? Yd : Xd,
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
	snapshot: () => e === "sales" ? { drafts: Ld } : {
		drafts: Rd,
		options: Id()
	},
	restore: (t) => {
		e === "sales" ? Ld = t.drafts : (Rd = t.drafts, t.options);
	},
	publish: Vd,
	validate: (n, i) => {
		let { drafts: a } = t({
			drafts: r(Zd),
			...e === "expense" ? { options: r(t({
				id: Z,
				code: Z,
				name: Z
			}).strict()) } : {}
		}).strict().parse(n);
		for (let t of a) {
			if (fo(t.recipient), t.kind !== t.payload.kind || e === "expense" != (t.kind === "EXPENSE")) throw Error("Draft kind mismatch.");
			if (C(t.payload.documentDate), t.payload.dueDate && (C(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate)) throw Error("Draft due date is invalid.");
			let n = i, r = t.payload.kind === "EXPENSE" ? t.payload.supplierId : t.payload.customerId;
			if (!(t.payload.kind === "EXPENSE" ? n.suppliers.suppliers : n.customers.customers).some((e) => e.id === r) || t.lines.length !== t.payload.lines.length) throw Error("Draft party or line references are invalid.");
			for (let [e, r] of t.lines.entries()) {
				let i = t.payload.lines[e], a = r;
				if (t.kind !== "EXPENSE" && (lo(a), Si(a, n.products.products.find((e) => e.id === a.productId)), a.requestedArea !== i.requestedArea)) throw Error("Draft area requirement mismatch.");
				if (typeof a.quantity != "number" || !Number.isFinite(a.quantity) || a.quantity <= 0 || i.requestedArea === void 0 && a.quantity !== i.quantity || Hd(a.lineSubtotal + a.taxAmount) !== a.lineTotal) throw Error("Draft line amounts are invalid.");
				if (t.kind === "EXPENSE") {
					if (typeof a.unitCost != "number") throw Error("Expense line unit cost is invalid.");
					if (a.expenseAccountId !== i.accountId || !n.accounts.accounts.some((e) => e.id === a.expenseAccountId && e.type === "EXPENSE")) throw Error("Draft expense account reference is invalid.");
				} else if (typeof a.unitPrice != "number" || a.productId !== i.productId || a.unitId !== i.unitId || !n.products.products.some((e) => e.id === a.productId && e.units.some((e) => e.id === a.unitId))) throw Error("Draft product/unit reference is invalid.");
				for (let [e, t] of [["taxPaidAccountId", "ASSET"], ["taxCollectedAccountId", "LIABILITY"]]) if (a[e] && !n.accounts.accounts.some((n) => n.id === a[e] && n.type === t)) throw Error("Draft tax account reference is invalid.");
			}
			for (let e of [
				"subtotal",
				"taxAmount",
				"total"
			]) {
				let n = e === "subtotal" ? "lineSubtotal" : e === "total" ? "lineTotal" : "taxAmount";
				if (Hd(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Draft totals do not match lines.");
			}
			if (t.status === "POSTED") {
				let e = i;
				if (!(t.kind === "EXPENSE" ? e.supplierBills.supplierBills : t.kind === "ORDER" ? e.sales.salesOrders : e.sales.invoices).some((e) => e.id === t.documentId && e.managedDraftId === t.id && e.totals.total === t.totals.total)) throw Error("Posted draft source reference is invalid.");
			}
		}
	}
});
//#endregion
//#region src/features/recurring/recurringDates.ts
var Qd = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
];
function $d(e, t, n) {
	if (C(e), !Number.isSafeInteger(n) || n < 0 || !Qd.includes(t)) throw Error("Invalid schedule occurrence.");
	let r = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	if (t === "Weekly" || t === "Fortnightly") r.setUTCDate(r.getUTCDate() + n * (t === "Weekly" ? 7 : 14));
	else {
		let e = r.getUTCDate();
		r.setUTCDate(1), r.setUTCMonth(r.getUTCMonth() + n * (t === "Monthly" ? 1 : 3));
		let i = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
		r.setUTCDate(Math.min(e, i));
	}
	let i = r.toISOString().slice(0, 10);
	return C(i), i;
}
function ef(e, t) {
	C(e);
	let n = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	n.setUTCDate(n.getUTCDate() + t);
	let r = n.toISOString().slice(0, 10);
	return C(r), r;
}
//#endregion
//#region src/features/recurring/recurringRepository.ts
var tf = a().trim().min(1).max(200), nf = a().refine((e) => {
	try {
		return C(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), rf = t({
	operationId: tf,
	name: tf,
	sourceDraftId: tf,
	frequency: f(Qd),
	firstDate: nf,
	endDate: nf
}).strict(), af = t({
	id: tf,
	expectedRevision: w().int().positive(),
	name: tf,
	endDate: nf
}).strict(), of = a().refine((e) => Number.isFinite(Date.parse(e)), "Invalid timestamp."), sf = t({
	id: tf,
	name: tf,
	kind: f(["INVOICE", "EXPENSE"]),
	status: f([
		"Active",
		"Paused",
		"Ended"
	]),
	revision: w().int().positive(),
	operationId: tf,
	creationFingerprint: a().min(1).max(2e3),
	sourceDraftId: tf,
	payload: te(),
	frequency: f(Qd),
	firstDate: nf,
	nextDate: nf,
	endDate: nf,
	occurrence: w().int().nonnegative(),
	termsDays: w().int().nonnegative(),
	createdAt: of,
	updatedAt: of
}).strict(), cf = t({
	id: tf,
	scheduleId: tf,
	date: nf,
	draftId: tf,
	actorId: tf,
	createdAt: of
}).strict(), lf = 0, uf = /* @__PURE__ */ new Set(), df = () => {
	lf++, uf.forEach((e) => e());
}, ff = {
	INVOICE: {
		schedules: [],
		runs: []
	},
	EXPENSE: {
		schedules: [],
		runs: []
	}
}, pf = (e) => e === "INVOICE" ? "sales.manage" : "purchases.bill", mf = (e) => e === "INVOICE" ? Yd : Xd, hf = () => (/* @__PURE__ */ new Date()).toISOString();
function gf(e) {
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
function _f(e) {
	let n = () => ff[e], r = (e) => {
		let t = n().schedules.find((t) => t.id === e);
		if (!t) throw Error("Recurring schedule not found.");
		return t;
	}, i = (e, t) => {
		if (e.revision !== t) throw Error("Schedule changed. Reload before continuing.");
	};
	return {
		getAll: () => n().schedules,
		getRuns: () => n().runs,
		create(t) {
			T.require(pf(e));
			let r = rf.parse(t), i = JSON.stringify(r), a = n().schedules.find((e) => e.operationId === r.operationId);
			if (a) {
				if (a.creationFingerprint !== i) throw Error("Operation ID was used for a different recurring template.");
				return a;
			}
			let o = mf(e).getAll().find((e) => e.id === r.sourceDraftId);
			if (!o || o.kind !== e || o.status === "CANCELLED") throw Error("Select an existing invoice or expense entry draft of the correct type.");
			if (r.endDate < r.firstDate) throw Error("End date must not precede first generation date.");
			let s = gf(o), c = Math.round((Date.parse(s.dueDate + "T00:00:00Z") - Date.parse(s.documentDate + "T00:00:00Z")) / 864e5), l = hf(), u = {
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
			return n().schedules = [...n().schedules, u], df(), u;
		},
		update(t) {
			T.require(pf(e));
			let a = af.parse(t), o = r(a.id);
			if (i(o, a.expectedRevision), a.endDate < o.firstDate || o.occurrence && a.endDate < n().runs.filter((e) => e.scheduleId === o.id).map((e) => e.date).sort().at(-1)) throw Error("End date cannot precede the schedule start or its last generated occurrence.");
			let s = {
				...o,
				name: a.name,
				endDate: a.endDate,
				status: o.nextDate > a.endDate ? "Ended" : o.status === "Ended" ? "Paused" : o.status,
				revision: o.revision + 1,
				updatedAt: hf()
			};
			return n().schedules = n().schedules.map((e) => e.id === o.id ? s : e), df(), s;
		},
		setStatus(a) {
			T.require(pf(e));
			let o = t({
				id: tf,
				expectedRevision: w().int().positive(),
				status: f(["Active", "Paused"])
			}).strict().parse(a), s = r(o.id);
			if (i(s, o.expectedRevision), s.nextDate > s.endDate) throw Error("Extend the end date before resuming this ended schedule.");
			let c = {
				...s,
				status: o.status,
				revision: s.revision + 1,
				updatedAt: hf()
			};
			return n().schedules = n().schedules.map((e) => e.id === s.id ? c : e), df(), c;
		},
		generate(a) {
			T.require(pf(e));
			let o = t({
				id: tf,
				expectedRevision: w().int().positive(),
				date: nf
			}).strict().parse(a), s = r(o.id), c = n().runs.find((e) => e.scheduleId === s.id && e.date === o.date);
			if (c) return {
				schedule: s,
				run: c,
				draft: mf(e).getAll().find((e) => e.id === c.draftId)
			};
			if (i(s, o.expectedRevision), s.status !== "Active") throw Error("Activate the schedule before generating.");
			if (o.date !== s.nextDate) throw Error("Generate the next occurrence in order.");
			if (o.date > x(hf())) throw Error("This occurrence is not due yet.");
			if (o.date > s.endDate) throw Error("The schedule has ended.");
			let l = $d(s.firstDate, s.frequency, s.occurrence + 1), u = structuredClone(s.payload);
			u.documentDate = o.date, u.dueDate = ef(o.date, s.termsDays), u.kind === "EXPENSE" && (u.supplierInvoiceNumber = u.supplierInvoiceNumber.slice(0, 170) + " [" + o.date + "]");
			let d = mf(e).save({
				operationId: "recurring:" + s.id + ":" + o.date,
				payload: u
			}), f = hf(), p = {
				id: crypto.randomUUID(),
				scheduleId: s.id,
				date: o.date,
				draftId: d.id,
				actorId: T.current().userId,
				createdAt: f
			}, m = {
				...s,
				nextDate: l,
				occurrence: s.occurrence + 1,
				status: l > s.endDate ? "Ended" : "Active",
				revision: s.revision + 1,
				updatedAt: f
			};
			return n().schedules = n().schedules.map((e) => e.id === s.id ? m : e), n().runs = [...n().runs, p], df(), {
				schedule: m,
				run: p,
				draft: d
			};
		}
	};
}
var vf = _f("INVOICE"), yf = _f("EXPENSE");
for (let e of ["INVOICE", "EXPENSE"]) y(e === "INVOICE" ? "recurringInvoices" : "recurringExpenses", {
	repository: e === "INVOICE" ? vf : yf,
	read: e === "INVOICE" ? "sales.read" : "purchases.read",
	commands: {
		create: pf(e),
		update: pf(e),
		setStatus: pf(e),
		generate: pf(e)
	},
	snapshot: () => structuredClone(ff[e]),
	restore: (t) => {
		ff[e] = t;
	},
	publish: df,
	validate: (n, i) => {
		t({
			schedules: r(sf),
			runs: r(cf)
		}).strict().parse(n);
		let a = n, o = i;
		for (let t of a.schedules) {
			if (t.kind !== e || ![
				"Active",
				"Paused",
				"Ended"
			].includes(t.status) || !Number.isSafeInteger(t.revision) || t.revision < 1 || !Number.isSafeInteger(t.occurrence) || t.occurrence < 0 || !Number.isInteger(t.termsDays) || t.termsDays < 0 || t.payload.kind !== e) throw Error("Invalid recurring schedule.");
			if (rf.parse({
				operationId: t.operationId,
				name: t.name,
				sourceDraftId: t.sourceDraftId,
				frequency: t.frequency,
				firstDate: t.firstDate,
				endDate: t.endDate
			}), jd(t.payload), !t.id || !t.creationFingerprint || !Number.isFinite(Date.parse(t.createdAt)) || !Number.isFinite(Date.parse(t.updatedAt))) throw Error("Invalid recurring identity or audit timestamps.");
			if (C(t.payload.documentDate), C(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate || t.termsDays !== Math.round((Date.parse(t.payload.dueDate + "T00:00:00Z") - Date.parse(t.payload.documentDate + "T00:00:00Z")) / 864e5)) throw Error("Invalid recurring payment terms.");
			if (t.payload.kind === "EXPENSE") {
				if (!o.suppliers.suppliers.some((e) => e.id === t.payload.supplierId) || t.payload.lines.some((e) => !o.accounts.accounts.some((t) => t.id === e.accountId && t.type === "EXPENSE"))) throw Error("Recurring expense references are invalid.");
			} else if (!o.customers.customers.some((e) => e.id === t.payload.customerId) || t.payload.lines.some((e) => !o.products.products.some((t) => t.id === e.productId && t.units.some((t) => t.id === e.unitId)))) throw Error("Recurring invoice references are invalid.");
			if (t.status === "Ended" != t.nextDate > t.endDate) throw Error("Recurring end status is inconsistent.");
			if (t.nextDate !== $d(t.firstDate, t.frequency, t.occurrence) || t.endDate < t.firstDate) throw Error("Invalid recurring dates.");
			let n = (e === "INVOICE" ? o.managedSalesDocuments : o.expenseBillDrafts).drafts.find((e) => e.id === t.sourceDraftId);
			if (!n || n.kind !== e) throw Error("Recurring template source is missing.");
			let r = a.runs.filter((e) => e.scheduleId === t.id);
			if (r.length !== t.occurrence || new Set(r.map((e) => e.date)).size !== r.length) throw Error("Recurring run history does not match schedule.");
			for (let e = 0; e < r.length; e++) if (!r.some((n) => n.date === $d(t.firstDate, t.frequency, e))) throw Error("Recurring occurrences are incomplete.");
		}
		for (let t of a.runs) {
			let n = a.schedules.find((e) => e.id === t.scheduleId), r = (e === "INVOICE" ? o.managedSalesDocuments : o.expenseBillDrafts).drafts.find((e) => e.id === t.draftId);
			if (!n || !r || r.kind !== e || r.operationId !== "recurring:" + n.id + ":" + t.date || !t.actorId || !Number.isFinite(Date.parse(t.createdAt))) throw Error("Invalid recurring generated-draft reference.");
		}
	}
});
//#endregion
//#region src/features/supplier-returns/supplierReturnRepository.ts
var Q = a().trim().min(1).max(200), bf = w().finite().positive(), xf = w().finite().nonnegative(), Sf = t({
	operationId: Q,
	supplierBillId: Q,
	supplierCreditNumber: Q,
	returnDate: Q,
	reason: a().trim().min(3).max(2e3),
	lines: r(t({
		matchId: Q,
		quantity: bf
	}).strict()).min(1).max(500)
}).strict(), Cf = t({
	id: Q,
	matchId: Q,
	supplierBillLineId: Q,
	goodsReceiptId: Q,
	goodsReceiptLineId: Q,
	productId: Q,
	unitId: Q,
	baseUnitId: Q,
	sku: Q,
	description: a(),
	unitSymbol: Q,
	quantity: bf,
	conversionToBase: bf,
	quantityBase: bf,
	siteId: Q,
	siteName: Q,
	inventoryMovementId: Q,
	costMovementId: Q,
	unitCostBase: xf,
	inventoryValue: xf,
	voidInventoryMovementId: Q.optional(),
	voidCostMovementId: Q.optional()
}).strict(), wf = t({
	id: Q,
	returnNumber: Q,
	operationId: Q,
	requestFingerprint: a().max(1e6),
	supplierBillId: Q,
	supplierBillNumber: Q,
	supplierId: Q,
	supplierName: Q,
	supplierCreditId: Q,
	returnDate: Q,
	reason: a().min(3).max(2e3),
	status: f(["POSTED", "VOID"]),
	lines: r(Cf).min(1),
	inventoryValue: xf,
	journalId: Q.optional(),
	createdAt: Q,
	createdBy: Q,
	voidDate: Q.optional(),
	voidReason: a().optional(),
	voidedBy: Q.optional(),
	voidedAt: Q.optional()
}).strict(), Tf = [], Ef = 0, Df = /* @__PURE__ */ new Set(), Of = () => {
	Ef++, Df.forEach((e) => e());
}, kf = (e) => Math.round(e * 1e4) / 1e4, Af = (e) => Math.round(e * 100) / 100;
function jf(e, t, n) {
	if (Gc.getAll().some((r) => r.siteId === t && r.productId === n && x(r.occurredAt) > e)) throw Error("Return/reversal date precedes later inventory activity at this site.");
}
function Mf(e) {
	let t = Ml.getById(e);
	return !t || t.status === "VOID" || t.kind === "EXPENSE" || t.openingBalanceImportId ? [] : wl.getByBill(e).filter((e) => e.status === "ACTIVE").flatMap((e) => {
		let n = t.lines.find((t) => t.id === e.supplierBillLineId), r = fl.getById(e.goodsReceiptId), i = r?.lines.find((t) => t.id === e.goodsReceiptLineId), a = n ? Ti(n.productId, n.unitId) : void 0;
		if (!n || !r || !i || !a) return [];
		let o = Tf.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0);
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
y("physicalSupplierReturns", {
	repository: {
		create(e) {
			let t = Sf.parse(e), n = JSON.stringify(t), r = Tf.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.requestFingerprint !== n) throw Error("Operation ID already used with different return data.");
				return r;
			}
			N(), C(t.returnDate, "Return date"), Ke(t.returnDate);
			let i = Ml.getById(t.supplierBillId);
			if (!i || i.status === "VOID" || i.kind === "EXPENSE" || i.openingBalanceImportId) throw Error("Select an active stock bill matched to received goods.");
			if (t.returnDate < i.billDate) throw Error("Return date cannot precede bill date.");
			let a = Mf(i.id), o = /* @__PURE__ */ new Set(), s = t.lines.map((e) => {
				if (o.has(e.matchId)) throw Error("Select each receipt match once.");
				o.add(e.matchId);
				let n = a.find((t) => t.matchId === e.matchId);
				if (!n) throw Error("Return line must belong to an active receipt match for this bill.");
				if (kf(e.quantity) !== e.quantity || e.quantity > n.availableQuantity + 1e-8) throw Error("Return quantity exceeds the matched receipt remainder or four decimal places.");
				if (t.returnDate < n.receiptDate) throw Error("Return date cannot precede receipt date.");
				let r = wi(n.productId), i = Ti(n.productId, n.unitId), s = Ac.getById(n.siteId);
				if (!r || !i || !s || s.status !== "ACTIVE") throw Error("Return product, unit or active receiving site was not found.");
				if (r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(i.code) && !Number.isInteger(e.quantity)) throw Error("Whole packs must be returned in whole quantities.");
				jf(t.returnDate, s.id, r.id);
				let c = kf(e.quantity * n.conversionToBase);
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
				c.set(t, kf((c.get(t) ?? 0) + e.quantityBase));
			}
			for (let [e, t] of c) {
				let [n, r] = e.split("|");
				if ((al.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t) throw Error("Insufficient stock at the original receiving site.");
			}
			let l = /* @__PURE__ */ new Map();
			for (let e of s) {
				let t = i.lines.find((t) => t.id === e.supplierBillLineId), n = l.get(t.id);
				l.set(t.id, {
					supplierBillLineId: t.id,
					quantity: kf((n?.quantity ?? 0) + e.quantity),
					unitCost: t.unitCost
				});
			}
			let u = crypto.randomUUID(), d = "SR-" + t.returnDate.slice(0, 4) + "-" + String(Tf.length + 1).padStart(5, "0"), f = J.createReturnCredit({
				sourceSupplierBillId: i.id,
				supplierCreditNumber: t.supplierCreditNumber,
				creditDate: t.returnDate,
				reason: t.reason,
				lines: [...l.values()]
			}, u), p = s.map((e) => {
				al.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let n = Fc.create({
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
				}), r = $c({
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
			}), m = Af(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? A.post({
				journalDate: t.returnDate,
				description: `Physical supplier return ${d}`,
				reference: f.creditNumber,
				sourceType: "SUPPLIER_RETURN",
				sourceId: u,
				lines: [{
					accountId: O.requireBySystemRole("PURCHASE_PRICE_VARIANCE").id,
					debit: m,
					credit: 0
				}, {
					accountId: O.requireBySystemRole("INVENTORY").id,
					debit: 0,
					credit: m
				}]
			}) : void 0, g = {
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
				createdBy: T.current()?.userId ?? "local-test"
			};
			return Tf = [g, ...Tf], Of(), g;
		},
		reverse(e) {
			let n = t({
				returnId: Q,
				voidDate: Q,
				reason: a().trim().min(3).max(2e3)
			}).strict().parse(e), r = Tf.find((e) => e.id === n.returnId);
			if (!r) throw Error("Supplier return not found.");
			if (r.status === "VOID") return r;
			if (N(), C(n.voidDate, "Reversal date"), Ke(n.voidDate), n.voidDate < r.returnDate) throw Error("Reversal date cannot precede return date.");
			for (let e of r.lines) jf(n.voidDate, e.siteId, e.productId);
			let i = J.getById(r.supplierCreditId);
			if ((i.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > n.voidDate) || J.getAllocationsByCredit(i.id).some((e) => e.reversedAt && x(e.reversedAt) > n.voidDate)) throw Error("Reversal date precedes later credit settlement activity.");
			J.voidReturnCredit({
				supplierCreditId: r.supplierCreditId,
				reason: n.reason,
				voidDate: n.voidDate
			});
			let o = r.lines.map((e) => {
				al.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = Fc.create({
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
				}), i = el({
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
			r.journalId && A.reverse({
				journalEntryId: r.journalId,
				reversalDate: n.voidDate,
				reason: n.reason
			});
			let s = {
				...r,
				status: "VOID",
				lines: o,
				voidDate: n.voidDate,
				voidReason: n.reason,
				voidedAt: (/* @__PURE__ */ new Date()).toISOString(),
				voidedBy: T.current()?.userId ?? "local-test"
			};
			return Tf = Tf.map((e) => e.id === r.id ? s : e), Of(), s;
		}
	},
	read: "purchases.return.read",
	commands: {
		create: "purchases.return",
		reverse: "purchases.return"
	},
	snapshot: () => ({ returns: Tf }),
	restore: (e) => {
		Tf = e.returns;
	},
	publish: Of,
	validate: (e, n) => {
		let i = t({ returns: r(wf) }).strict().parse(e), a = n, o = /* @__PURE__ */ new Set();
		for (let e of i.returns) {
			C(e.returnDate), e.voidDate && C(e.voidDate);
			let t = Sf.parse(JSON.parse(e.requestFingerprint));
			if (o.has(e.operationId) || t.operationId !== e.operationId || t.supplierBillId !== e.supplierBillId || t.returnDate !== e.returnDate) throw Error("Supplier return operation mismatch.");
			o.add(e.operationId);
			let n = a.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId && t.supplierId === e.supplierId), r = a.supplierCredits.supplierCredits.find((t) => t.id === e.supplierCreditId && t.physicalReturnId === e.id && t.sourceSupplierBillId === e.supplierBillId);
			if (!n || !r || e.status === "VOID" != (r.status === "VOID")) throw Error("Supplier return bill/credit reference is invalid.");
			if (Af(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue) throw Error("Supplier return cost total is invalid.");
			for (let t of e.lines) {
				let r = a.receiptMatches.matches.find((n) => n.id === t.matchId && n.supplierBillId === e.supplierBillId && n.supplierBillLineId === t.supplierBillLineId && n.goodsReceiptId === t.goodsReceiptId && n.goodsReceiptLineId === t.goodsReceiptLineId), i = a.costMovements.movements.find((e) => e.id === t.costMovementId), o = a.inventoryMovements.movements.find((e) => e.id === t.inventoryMovementId), s = a.goodsReceipts.goodsReceipts.find((e) => e.id === t.goodsReceiptId), c = n.lines.find((e) => e.id === t.supplierBillLineId);
				if (!r || !c || c.productId !== t.productId || c.unitId !== t.unitId || s?.siteId !== t.siteId || r.productId !== t.productId || !i || !o || i.referenceType !== "SUPPLIER_RETURN" || i.referenceId !== e.id || i.inventoryMovementId !== o.id || i.siteId !== t.siteId || i.productId !== t.productId || i.unitCostBase !== t.unitCostBase || i.quantityBase !== -t.quantityBase || Af(-i.valueChange) !== Af(t.inventoryValue) || kf(t.quantity * t.conversionToBase) !== t.quantityBase || o.referenceType !== "SUPPLIER_RETURN" || o.referenceId !== e.id || o.siteId !== t.siteId || o.productId !== t.productId || o.quantityBase !== -t.quantityBase || o.transactionQuantity !== -t.quantity || x(o.occurredAt) !== e.returnDate) throw Error("Supplier return stock/cost reference is invalid.");
				if (e.status === "VOID") {
					let n = a.costMovements.movements.find((e) => e.id === t.voidCostMovementId), r = a.inventoryMovements.movements.find((e) => e.id === t.voidInventoryMovementId);
					if (!n || !r || n.inventoryMovementId !== r.id || n.referenceType !== "SUPPLIER_RETURN_VOID" || n.referenceId !== e.id || n.siteId !== t.siteId || n.productId !== t.productId || n.quantityBase !== t.quantityBase || Af(n.valueChange) !== Af(t.inventoryValue) || r.referenceType !== "SUPPLIER_RETURN_VOID" || r.quantityBase !== t.quantityBase || r.referenceId !== e.id || x(n.occurredAt) !== e.voidDate) throw Error("Supplier return reversal reference is invalid.");
				}
			}
			let i = /* @__PURE__ */ new Set();
			for (let n of e.lines) {
				if (i.has(n.matchId)) throw Error("Duplicate return receipt match.");
				i.add(n.matchId);
				let e = t.lines.find((e) => e.matchId === n.matchId);
				if (!e || e.quantity !== n.quantity) throw Error("Supplier return request quantities mismatch.");
			}
			if (t.lines.length !== e.lines.length) throw Error("Supplier return request line count mismatch.");
			for (let t of new Set(e.lines.map((e) => e.supplierBillLineId))) {
				let n = kf(e.lines.filter((e) => e.supplierBillLineId === t).reduce((e, t) => e + t.quantity, 0));
				if (!r.lines.some((e) => e.supplierBillLineId === t && e.quantity === n)) throw Error("Supplier return linked credit quantity mismatch.");
			}
			if (e.status === "VOID" && (!e.voidDate || e.voidDate < e.returnDate || !e.voidReason || !e.voidedBy)) throw Error("Supplier return reversal metadata is invalid.");
			if (e.inventoryValue && !a.journals.journalEntries.some((t) => t.id === e.journalId && t.sourceId === e.id && t.sourceType === "SUPPLIER_RETURN" && t.totalDebit === e.inventoryValue && (e.status === "VOID" ? t.status === "REVERSED" : t.status === "POSTED"))) throw Error("Supplier return journal reference is invalid.");
		}
		for (let e of a.supplierCredits.supplierCredits) if (e.physicalReturnId && !i.returns.some((t) => t.id === e.physicalReturnId && t.supplierCreditId === e.id)) throw Error("Supplier credit physical return reference is invalid.");
		for (let e of a.receiptMatches.matches) if (kf(i.returns.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0)) > e.matchedBaseQuantity + 1e-8) throw Error("Supplier return quantities exceed the receipt match.");
	}
});
//#endregion
//#region src/features/document-output/outputRepository.ts
var Nf = a().min(1).max(200), Pf = a().max(2e4), Ff = Pf.optional(), If = [
	"QUOTE",
	"SALES_ORDER",
	"INVOICE",
	"CREDIT_NOTE"
], Lf = t({
	operationId: Nf,
	sourceId: Nf,
	kind: f(If),
	expectedUpdatedAt: Nf,
	templateId: Nf.optional()
}).strict(), Rf = w().finite().nonnegative(), zf = t({
	itemType: f([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	id: Nf,
	sku: Pf,
	description: Pf,
	unitSymbol: Pf,
	quantity: w().positive().finite(),
	unitPrice: Rf,
	lineSubtotal: Rf,
	taxAmount: Rf,
	lineTotal: Rf,
	taxCode: Ff,
	taxRate: w().finite().min(0).max(1).optional(),
	requestedArea: w().positive().finite().optional(),
	areaPerPack: w().positive().finite().optional(),
	coveredArea: w().positive().finite().optional()
}).strict(), Bf = t({
	locationId: Ff,
	locationName: Ff,
	deliveryAddress: Ff,
	accountingContactId: Ff,
	accountingContactName: Ff,
	accountingEmail: Ff
}).strict(), Vf = t({
	id: Nf,
	revision: Nf,
	name: Pf,
	subject: Pf,
	body: Pf,
	footer: Pf,
	paper: f(["A4", "Letter"])
}).strict(), Hf = t({
	id: Nf,
	operationId: Nf,
	requestFingerprint: Pf,
	preparedAt: Nf,
	preparedBy: Nf,
	sourceId: Nf,
	kind: f(If),
	sourceUpdatedAt: Nf,
	documentNumber: Nf,
	status: Nf,
	documentDate: Nf,
	dueDate: Ff,
	expiryDate: Ff,
	reference: Ff,
	notes: Ff,
	customerId: Nf,
	customerName: Pf,
	customerCode: Pf,
	customerIdentifier: Ff,
	recipient: Bf.optional(),
	issuer: t({
		name: Pf,
		tradingName: Ff,
		identifier: Ff,
		address: Ff,
		email: Ff,
		phone: Ff,
		currency: Nf
	}).strict(),
	lines: r(zf).min(1),
	totals: t({
		subtotal: Rf,
		taxAmount: Rf,
		total: Rf
	}).strict(),
	amountPaid: Rf.optional(),
	amountDue: Rf.optional(),
	template: Vf,
	subject: Pf,
	body: Pf
}).strict();
function Uf(e, t) {
	if (e === "CREDIT_NOTE") {
		let e = H.getById(t);
		if (!e) throw Error("Credit note was not found.");
		return {
			...e,
			type: "CREDIT_NOTE",
			documentNumber: e.creditNoteNumber,
			documentDate: e.creditDate
		};
	}
	let n = W.getById(t);
	if (!n || n.type !== e) throw Error("Sales document was not found.");
	return n;
}
var Wf = (e) => e === "QUOTE" ? "Quotation" : e === "INVOICE" ? "Invoice" : e === "SALES_ORDER" ? "Sales order" : "Credit note";
function Gf() {
	return (S.templates ?? []).filter((e) => e.status === "Active" && [
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
var Kf = [];
Gf();
var qf = 0, Jf = /* @__PURE__ */ new Set(), Yf = () => {
	qf++, Jf.forEach((e) => e());
};
function Xf(e, t) {
	let n = t ? S.templates?.find((n) => n.id === t && n.status === "Active" && n.kind === Wf(e)) : void 0;
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
var Zf = [
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
function Qf(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!Zf.includes(n)) throw Error(`Unsupported template token: ${n}.`);
		return t[n] ?? "";
	});
}
function $f(e) {
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
var ep = { prepare(e) {
	let t = Lf.parse(e), n = JSON.stringify(t), r = Kf.find((e) => e.operationId === t.operationId);
	if (r) {
		if (r.requestFingerprint !== n) throw Error("Operation ID was used for different output data.");
		return r;
	}
	let i = Uf(t.kind, t.sourceId);
	if (i.updatedAt !== t.expectedUpdatedAt) throw Error("Source document changed. Reload before preparing output.");
	let a = B.getById(i.customerId);
	if (!a) throw Error("Source customer was not found.");
	let o = _(), s = Xf(t.kind, t.templateId), c = structuredClone(i.recipient), l = {
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
		preparedBy: T.current()?.userId ?? "local-test",
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
		lines: i.lines.map($f),
		totals: structuredClone(i.totals),
		amountPaid: "amountPaid" in i ? i.amountPaid : void 0,
		amountDue: "amountDue" in i ? i.amountDue : void 0,
		template: {
			...s,
			footer: Qf(s.footer, l)
		},
		subject: Qf(s.subject, l),
		body: Qf(s.body, l)
	};
	return tp(u), Kf = [u, ...Kf], Yf(), u;
} };
function tp(e) {
	let t = Hf.parse(e);
	if (fo(t.recipient), !Number.isFinite(Date.parse(t.preparedAt))) throw Error("Invalid preparation timestamp.");
	let n = Lf.parse(JSON.parse(t.requestFingerprint));
	if (n.operationId !== t.operationId || n.sourceId !== t.sourceId || n.kind !== t.kind || n.expectedUpdatedAt !== t.sourceUpdatedAt) throw Error("Output source metadata mismatch.");
	let r = (e) => Math.round(e * 100) / 100;
	for (let e of t.lines) if (lo(e), r(e.lineSubtotal + e.taxAmount) !== e.lineTotal) throw Error("Invalid output line total.");
	for (let [e, n] of [
		["subtotal", "lineSubtotal"],
		["taxAmount", "taxAmount"],
		["total", "lineTotal"]
	]) if (r(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Invalid output totals.");
	return t;
}
y("preparedSalesOutputs", {
	repository: ep,
	read: "sales.read",
	commands: { prepare: "documents.prepare" },
	snapshot: () => ({
		artifacts: Kf,
		templates: Gf()
	}),
	restore: (e) => {
		Kf = e.artifacts, e.templates;
	},
	publish: Yf,
	validate: (e, n) => {
		let i = t({
			artifacts: r(Hf),
			templates: r(t({
				id: Nf,
				name: Pf,
				kind: Nf
			}).strict())
		}).strict().parse(e), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
		for (let e of i.artifacts) {
			if (tp(e), a.has(e.id) || o.has(e.operationId)) throw Error("Duplicate prepared output.");
			a.add(e.id), o.add(e.operationId);
			let t = n, r = e.kind === "CREDIT_NOTE" ? t.customerCredits.creditNotes.find((t) => t.id === e.sourceId) : [
				...t.sales.quotes,
				...t.sales.salesOrders,
				...t.sales.invoices
			].find((t) => t.id === e.sourceId && t.type === e.kind);
			if (!r || r.customerId !== e.customerId) throw Error("Prepared output source reference is invalid.");
		}
	}
});
//#endregion
//#region src/features/accounting/data/inventoryAccountingPostingService.ts
function np(e) {
	return O.requireBySystemRole(e).id;
}
function rp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ip(e) {
	return A.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function ap(e) {
	let t = Gc.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var op = {
	postSalesFulfilment(e) {
		let t = ip(e.id);
		if (t) return t;
		let n = rp(ap(e).reduce((e, t) => {
			if (t.valueChange > 0) throw Error(`Sales fulfilment cost movement ${t.costMovementNumber} has an invalid positive inventory value change.`);
			return e - t.valueChange;
		}, 0));
		if (!Number.isFinite(n) || n < 0) throw Error("Sales fulfilment COGS amount is invalid.");
		if (n !== 0) return A.post({
			journalDate: e.fulfilmentDate,
			description: `COGS for sales fulfilment ${e.fulfilmentNumber}`,
			reference: e.fulfilmentNumber,
			sourceType: "SALES_FULFILMENT",
			sourceId: e.id,
			lines: [{
				accountId: np("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: np("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = ip(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? A.getById(r.reversalJournalEntryId) : void 0 : A.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, sp = /* @__PURE__ */ new Set(), cp = [], lp = cp;
function up() {
	lp = cp, sp.forEach((e) => e());
}
function dp() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = cp.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function fp(e, t) {
	return G(cp.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function pp(e) {
	let t = W.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.filter(xi).map((e) => fp(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.filter(xi).every((e, t) => n[t] >= G(e.quantity));
	W.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function mp(e) {
	let t = Gc.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var hp = {
	subscribe(e) {
		return sp.add(e), () => {
			sp.delete(e);
		};
	},
	getSnapshot() {
		return lp;
	},
	getAll() {
		return lp;
	},
	getById(e) {
		return cp.find((t) => t.id === e);
	},
	getBySalesOrder(e) {
		return cp.filter((t) => t.salesOrderId === e);
	},
	getFulfilledQuantity: fp,
	getRemainingQuantity(e, t) {
		let n = W.getById(e);
		if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let r = n.lines.find((e) => e.id === t);
		if (!r) throw Error("Sales order line was not found.");
		return xi(r) ? G(r.quantity - fp(e, t)) : 0;
	},
	create(e) {
		let t = W.getById(e.salesOrderId);
		if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let n = t;
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "INVOICED") throw Error("Only a confirmed or partially fulfilled sales order can be fulfilled.");
		if (n.status === "INVOICED" && !n.invoiceIds.some((e) => {
			let t = W.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("This order has no active invoice; do not fulfil a void invoice.");
		let r = Ac.getById(e.siteId);
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
			if (!xi(t)) throw Error("Non-stock and service lines do not require inventory dispatch.");
			let i = wi(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let o = Ti(t.productId, t.unitId);
			if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
			if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
			let s = G(e.fulfilledQuantity);
			if (t.areaPerPack && !Number.isInteger(e.fulfilledQuantity)) throw Error("Area-based lines must be dispatched in whole packs.");
			let c = fp(n.id, t.id);
			if (s > G(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
			let l = G(s * o.conversionToBase), u = al.getBalance(r.id, t.productId);
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
			s.set(e.orderLine.productId, G(t + e.fulfilledBaseQuantity));
		}
		for (let [e, t] of s) {
			let n = al.getBalance(r.id, e);
			if (!n || n.quantityOnHand < t) {
				let t = wi(e);
				throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
			}
		}
		let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = dp(), d = o.map((e) => ({
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
			let i = wi(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let a = Fc.create({
				movementType: "SALE",
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: G(-t.fulfilledBaseQuantity),
				transactionUnitId: t.unitId,
				transactionUnitSymbol: t.unitSymbol,
				transactionQuantity: G(-t.fulfilledQuantity),
				conversionToBase: t.conversionToBase,
				referenceType: "SALES_FULFILMENT",
				referenceId: f.id,
				referenceNumber: f.fulfilmentNumber,
				salesOrderId: n.id,
				salesOrderNumber: n.documentNumber,
				occurredAt: e.fulfilmentDate,
				notes: `Sales fulfilment ${f.fulfilmentNumber}`
			});
			$c({
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
			}), al.issue({
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: t.fulfilledBaseQuantity
			});
		}
		return op.postSalesFulfilment(f), cp = [f, ...cp], up(), pp(n.id), f;
	},
	void(e) {
		let t = cp.find((t) => t.id === e.fulfilmentId);
		if (!t) throw Error("Sales fulfilment was not found.");
		if (t.status === "VOIDED") throw Error("Sales fulfilment has already been voided.");
		if (Number.isNaN(Date.parse(e.voidDate))) throw Error("Fulfilment void date is invalid.");
		if (e.voidDate < t.fulfilmentDate) throw Error("Fulfilment void date cannot be earlier than the fulfilment date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Fulfilment void reason must contain at least 3 characters.");
		let r = W.getById(t.salesOrderId);
		if (!r || r.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		if (r.status === "INVOICED" && r.invoiceIds.some((e) => {
			let t = W.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("Cannot void a sales fulfilment for an invoiced sales order.");
		if (r.status !== "CONFIRMED" && r.status !== "PARTIALLY_FULFILLED" && r.status !== "FULFILLED" && r.status !== "INVOICED") throw Error(`Cannot void a sales fulfilment when the sales order status is ${r.status}.`);
		let i = mp(t), a = /* @__PURE__ */ new Set(), o = t.lines.map((e) => {
			let n = wi(e.productId);
			if (!n) throw Error(`Product ${e.sku} was not found.`);
			let r = i.find((n) => !a.has(n.id) && n.siteId === t.siteId && n.productId === e.productId && Math.abs(n.quantityBase) === e.fulfilledBaseQuantity);
			if (!r) throw Error(`Unique original inventory cost issue for ${e.sku} was not found.`);
			return a.add(r.id), {
				line: e,
				product: n,
				originalIssue: r
			};
		});
		op.reverseSalesFulfilment({
			fulfilment: t,
			reversalDate: e.voidDate,
			reason: n
		});
		for (let r of o) {
			let { line: i, product: a, originalIssue: o } = r, s = Fc.create({
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
			el({
				siteId: t.siteId,
				productId: i.productId,
				quantityBase: i.fulfilledBaseQuantity,
				unitCostBase: o.unitCostBase,
				inventoryValue: _c(Math.abs(o.valueChange)),
				referenceType: "SALE",
				referenceId: t.id,
				referenceNumber: t.fulfilmentNumber,
				inventoryMovementId: s.id,
				occurredAt: e.voidDate,
				notes: `Void sales fulfilment ${t.fulfilmentNumber}: ${n}`
			}), al.receive({
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
		return cp = cp.map((e) => e.id === s.id ? s : e), up(), pp(t.salesOrderId), s;
	}
};
y("fulfilments", {
	repository: hp,
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: cp }),
	restore: (e) => {
		cp = e.fulfilments, lp = cp;
	},
	publish: () => sp.forEach((e) => e())
});
//#endregion
//#region src/features/direct-documents/dispatchRepository.ts
var gp = a().trim().min(1).max(200), _p = t({
	operationId: gp,
	salesOrderId: gp,
	siteId: gp,
	fulfilmentDate: gp,
	lines: r(t({
		salesOrderLineId: gp,
		fulfilledQuantity: w().positive().finite()
	}).strict()).min(1).max(500)
}).strict();
function vp() {
	return W.getAll().filter((e) => e.type === "SALES_ORDER" && [
		"CONFIRMED",
		"PARTIALLY_FULFILLED",
		"INVOICED"
	].includes(e.status)).filter((e) => e.type === "SALES_ORDER" && (e.status !== "INVOICED" || e.invoiceIds.some((e) => {
		let t = W.getById(e);
		return t?.type === "INVOICE" && t.status !== "VOID";
	}))).map((e) => ({
		id: e.id,
		number: e.documentNumber,
		date: e.documentDate,
		delivery: e.recipient?.deliveryAddress,
		store: e.recipient?.locationName,
		lines: e.lines.filter(xi).map((t) => ({
			id: t.id,
			sku: t.sku,
			description: t.description,
			unit: t.unitSymbol,
			quantity: t.quantity,
			fulfilled: hp.getAll().filter((t) => t.salesOrderId === e.id && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t.id).reduce((e, t) => e + t.fulfilledQuantity, 0)
		}))
	})).filter((e) => e.lines.length > 0);
}
vp();
var yp = [], bp = 0, xp = /* @__PURE__ */ new Set(), Sp = () => {
	bp++, xp.forEach((e) => e());
};
y("salesDispatch", {
	repository: {
		record(e) {
			let t = _p.parse(e), n = JSON.stringify(t), r = yp.find((e) => e.id === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Dispatch operation ID was already used with different data.");
				return hp.getAll().find((e) => e.id === r.fulfilmentId);
			}
			if (N(), C(t.fulfilmentDate), Ke(t.fulfilmentDate), new Set(t.lines.map((e) => e.salesOrderLineId)).size !== t.lines.length) throw Error("Each dispatch line must be selected only once.");
			let i = hp.create(t);
			return yp = [...yp, {
				id: t.operationId,
				fingerprint: n,
				fulfilmentId: i.id
			}], Sp(), i;
		},
		reverse(e) {
			let n = t({
				fulfilmentId: gp,
				voidDate: gp,
				reason: a().trim().min(3).max(1e3)
			}).strict().parse(e);
			N(), C(n.voidDate), Ke(n.voidDate);
			let r = hp.getAll().find((e) => e.id === n.fulfilmentId);
			return r?.status === "VOIDED" ? r : hp.void(n);
		}
	},
	read: "inventory.read",
	commands: {
		record: "inventory.adjust",
		reverse: "inventory.adjust"
	},
	snapshot: () => ({
		orders: vp(),
		requests: yp
	}),
	restore: (e) => {
		e.orders, yp = e.requests;
	},
	publish: Sp,
	validate: (e, n) => {
		let i = t({
			orders: r(t({
				id: gp,
				number: gp,
				date: gp,
				delivery: a().optional(),
				store: a().optional(),
				lines: r(t({
					id: gp,
					sku: a(),
					description: a(),
					unit: a(),
					quantity: w().finite().positive(),
					fulfilled: w().finite().nonnegative()
				}).strict())
			}).strict()),
			requests: r(t({
				id: gp,
				fingerprint: a().max(1e6),
				fulfilmentId: gp
			}).strict())
		}).strict().parse(e), o = n.fulfilments.fulfilments;
		if (i.requests.some((e) => !o.some((t) => t.id === e.fulfilmentId))) throw Error("Dispatch result reference is invalid.");
	}
});
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function Cp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function wp(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) {
		if (r.has(t.id)) {
			i = Cp(i + t.moneyIn), a = Cp(a + t.moneyOut);
			continue;
		}
		o = Cp(o + t.moneyIn), s = Cp(s + t.moneyOut);
	}
	let c = Cp(Cp(t) + o - s), l = Cp(e.closingBalance), u = Cp(c - l);
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
var Tp = /* @__PURE__ */ new Set(), Ep = k.read().reconciliations;
k.onRollback(() => {
	Ep = k.read().reconciliations;
});
function Dp() {
	k.update("reconciliations", Ep), Tp.forEach((e) => k.notify(e));
}
function Op(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function kp(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function Ap() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function jp(e) {
	return `BREC-${e.slice(0, 4)}-${String(Ep.length + 1).padStart(4, "0")}`;
}
function Mp(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of Ep) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var Np = {
	subscribe(e) {
		return Tp.add(e), () => {
			Tp.delete(e);
		};
	},
	getSnapshot() {
		return Ep;
	},
	getAll() {
		return Ep;
	},
	getByBankAccount(e) {
		return Ep.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return Mp(e);
	},
	complete(e) {
		if (kp(e.statementDate), C(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let t = jt.requireById(e.bankAccountId);
		if (!t.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < t.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let n = this.getLatestByBankAccount(t.id);
		if (n && e.statementDate <= n.statementDate) throw Error(`Statement date must be after the last reconciled date ${n.statementDate}.`);
		let r = hu(t, A.getAll(), e.statementDate), i = new Set(r.transactions.map((e) => e.id)), a = Mp(t.id), o = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !a.has(e));
		for (let e of o) if (!i.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let s = /* @__PURE__ */ new Set([...a, ...o]), c = wp(r, Op(e.statementBalance), Array.from(s));
		if (!c.reconciled) throw Error(`Bank reconciliation is out by ${c.difference.toFixed(2)}.`);
		let l = {
			id: Ap(),
			reconciliationNumber: jp(e.statementDate),
			bankAccountId: t.id,
			statementDate: e.statementDate,
			statementBalance: Op(e.statementBalance),
			bookBalance: c.bookBalance,
			outstandingDeposits: c.outstandingDeposits,
			outstandingPayments: c.outstandingPayments,
			adjustedStatementBalance: c.adjustedStatementBalance,
			difference: c.difference,
			clearedTransactionIds: o,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ep = [l, ...Ep], Dp(), l;
	}
}, Pp = Np.complete;
Np.complete = function(e) {
	return N(), k.transaction(() => Pp.call(Np, e));
}, y("bankReconciliations", {
	repository: Np,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: Ep }),
	restore: (e) => {
		Ep = e.reconciliations;
	},
	publish: () => Tp.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/settlementRepository.ts
var Fp = (e) => Math.round((e + 2 ** -52) * 100) / 100, Ip = a().trim().min(1).max(200), Lp = w().finite().positive().refine((e) => Fp(e) === e, "Use cents precision"), Rp = t({
	operationId: Ip,
	customerId: Ip,
	paymentDate: Ip,
	bankAccountId: Ip,
	reference: a().max(500).optional(),
	allocations: r(t({
		invoiceId: Ip,
		amount: Lp
	}).strict()).min(1).max(500)
}).strict(), zp = t({
	operationId: Ip,
	creditId: Ip,
	paymentDate: Ip,
	bankAccountId: Ip,
	amount: Lp,
	reference: a().max(500).optional()
}).strict(), Bp = [], Vp = [], Hp = [], Up = 0, Wp = /* @__PURE__ */ new Set(), Gp = () => {
	Up++, Wp.forEach((e) => e());
};
function Kp(e, t, n) {
	let r = JSON.stringify(n), i = e.find((e) => e.operationId === t);
	if (i && i.fingerprint !== r) throw Error("Operation ID was already used with different data.");
	return {
		old: i,
		fingerprint: r
	};
}
function qp(e, t) {
	C(t, "Payment date");
	let n = jt.requireById(e);
	if (!n.active || t < n.openingBalanceDate) throw Error("Bank is inactive or payment precedes its opening date.");
	let r = O.requireById(n.glAccountId);
	if (!r.active || r.type !== "ASSET") throw Error("Invalid bank ledger account.");
	return n;
}
function Jp(e) {
	if (Np.getAll().some((t) => t.clearedTransactionIds.some((t) => t.startsWith(e + ":")))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Yp(e, t) {
	let n = e === "customer" ? H.getById(t) : J.getById(t);
	if (!n || n.status === "VOID" || n.status === "DRAFT") throw Error("An issued credit is required.");
	return n;
}
function Xp(e, t, n) {
	let r = Yp(e, t), i = Fp(n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0)), a = Fp(r.totals.total - r.amountApplied - i);
	if (a < 0) throw Error("Refund exceeds the unused credit.");
	let o = {
		...r,
		refundEvents: n,
		amountRefunded: i,
		amountAvailable: a,
		status: a === 0 ? "FULLY_APPLIED" : "ISSUED",
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	e === "customer" ? H.update(o) : J.update(o);
}
function Zp(e, t) {
	N();
	let n = zp.parse(t), { old: r, fingerprint: i } = Kp(e === "customer" ? Vp : Hp, n.operationId, n);
	if (r) return r;
	let a = Yp(e, n.creditId), o = qp(n.bankAccountId, n.paymentDate);
	if (n.paymentDate < a.creditDate || n.amount > a.amountAvailable) throw Error("Refund date/amount exceeds the available credit.");
	let s = O.requireBySystemRole(e === "customer" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"), c = crypto.randomUUID(), l = A.post({
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
	return Xp(e, a.id, [...a.refundEvents ?? [], {
		id: u.id,
		date: u.paymentDate,
		amount: u.amount
	}]), e === "customer" ? Vp = [...Vp, u] : Hp = [...Hp, u], Gp(), u;
}
function Qp(e, t) {
	if (N(), C(t.reversalDate, "Reversal date"), !t.reason?.trim() || t.reason.trim().length < 3) throw Error("Enter a reversal reason.");
	let n = e === "customer" ? Vp : Hp, r = n.find((e) => e.id === t.id);
	if (!r) throw Error("Refund was not found.");
	if (r.status === "REVERSED") return r;
	if (t.reversalDate < r.paymentDate) throw Error("Reversal cannot precede the refund.");
	Jp(r.journalEntryId), A.reverse({
		journalEntryId: r.journalEntryId,
		reversalDate: t.reversalDate,
		reason: t.reason
	});
	let i = Yp(e, r.creditId);
	Xp(e, i.id, (i.refundEvents ?? []).map((e) => e.id === r.id ? {
		...e,
		reversalDate: t.reversalDate
	} : e));
	let a = {
		...r,
		status: "REVERSED",
		reversalDate: t.reversalDate
	};
	return e === "customer" ? Vp = n.map((e) => e.id === r.id ? a : e) : Hp = n.map((e) => e.id === r.id ? a : e), Gp(), a;
}
var $p = {
	recordReceipt(e) {
		let t = Rp.parse(e), { old: n, fingerprint: r } = Kp(Bp, t.operationId, t);
		if (n) return n;
		if (qp(t.bankAccountId, t.paymentDate), new Set(t.allocations.map((e) => e.invoiceId)).size !== t.allocations.length) throw Error("Each invoice may only be allocated once.");
		for (let e of t.allocations) {
			let n = W.getAll().find((t) => t.id === e.invoiceId && t.type === "INVOICE");
			if (!n || n.type !== "INVOICE" || n.customerId !== t.customerId || t.paymentDate < n.documentDate || ["VOID", "DRAFT"].includes(n.status) || e.amount > n.amountDue) throw Error("Invalid invoice customer, date or outstanding amount.");
		}
		let i = t.allocations.map((e, n) => W.recordInvoicePayment({
			...t,
			invoiceId: e.invoiceId,
			amount: e.amount,
			method: "BANK_TRANSFER",
			operationId: t.operationId + ":" + n
		})), a = {
			...t,
			id: crypto.randomUUID(),
			fingerprint: r,
			amount: Fp(i.reduce((e, t) => e + t.amount, 0)),
			paymentIds: i.map((e) => e.id),
			status: "POSTED"
		};
		return Bp = [...Bp, a], Gp(), a;
	},
	reverseReceipt(e) {
		let t = Bp.find((t) => t.id === e.id);
		if (!t) throw Error("Receipt not found.");
		if (t.status === "REVERSED") return t;
		for (let e of t.paymentIds) {
			let t = ws.getById(e);
			if (!t || t.status !== "RECEIVED") throw Error("Receipt allocations changed; inspect individual payments first.");
			for (let t of A.getBySource("CUSTOMER_PAYMENT", e)) Jp(t.id);
		}
		for (let n of t.paymentIds) W.reverseInvoicePayment(n, e.reason);
		let n = {
			...t,
			status: "REVERSED",
			reversalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		};
		return Bp = Bp.map((e) => e.id === t.id ? n : e), Gp(), n;
	},
	createRefund: (e) => Zp("customer", e),
	reverseRefund: (e) => Qp("customer", e)
}, em = {
	create: (e) => Zp("supplier", e),
	reverse: (e) => Qp("supplier", e),
	repairLegacyCredits(e) {
		if (N(), C(e.date, "Repair date"), e.reason?.trim().length < 3) throw Error("Enter a repair reason.");
		let t = [];
		for (let n of J.getAll().filter((e) => e.status !== "VOID")) {
			if (e.date < n.creditDate || A.getBySource("SUPPLIER_CREDIT_RECLASS", n.id).length) continue;
			let r = A.getBySource("SUPPLIER_CREDIT", n.id).find((e) => e.status === "POSTED");
			if (!r) continue;
			let i = O.requireBySystemRole("INVENTORY"), a = O.requireBySystemRole("PURCHASE_PRICE_VARIANCE"), o = Fp(r.lines.filter((e) => e.accountId === i.id).reduce((e, t) => e + t.credit - t.debit, 0));
			o <= 0 || t.push(A.post({
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
}, tm = t({
	id: Ip,
	operationId: Ip,
	fingerprint: Ip,
	creditId: Ip,
	contactId: Ip,
	paymentDate: Ip,
	bankAccountId: Ip,
	amount: Lp,
	journalEntryId: Ip,
	status: f(["POSTED", "REVERSED"]),
	reference: a().optional(),
	reversalDate: a().optional()
}).strict();
y("customerSettlements", {
	repository: $p,
	read: "sales.read",
	commands: {
		recordReceipt: "sales.payment",
		reverseReceipt: "sales.payment",
		createRefund: "sales.payment",
		reverseRefund: "sales.payment"
	},
	snapshot: () => ({
		receipts: Bp,
		refunds: Vp
	}),
	restore: (e) => {
		Bp = e.receipts, Vp = e.refunds;
	},
	validate: (e, n) => {
		nm(e, n, !1);
		let i = e;
		r(tm.extend({ fingerprint: a() })).parse(i.refunds), r(t({
			id: Ip,
			operationId: Ip,
			paymentIds: r(Ip),
			amount: Lp,
			status: f(["POSTED", "REVERSED"])
		}).passthrough()).parse(i.receipts);
	},
	publish: Gp
}), y("supplierRefunds", {
	repository: em,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		repairLegacyCredits: "accounting.recover"
	},
	snapshot: () => ({ refunds: Hp }),
	restore: (e) => {
		Hp = e.refunds;
	},
	validate: (e, t) => {
		nm(e, t, !0), r(tm.extend({ fingerprint: a() })).parse(e.refunds);
	},
	publish: Gp
});
function nm(e, t, n) {
	let r = e, i = t.journals.journalEntries, a = n ? t.supplierCredits.supplierCredits : t.customerCredits.creditNotes, o = t.bankAccounts.bankAccounts;
	for (let e of r.refunds) {
		let t = a.find((t) => t.id === e.creditId), r = i.find((t) => t.id === e.journalEntryId), s = t?.refundEvents?.find((t) => t.id === e.id);
		if (!t || e.contactId !== ("customerId" in t ? t.customerId : t.supplierId) || !s || s.amount !== e.amount || s.date !== e.paymentDate || s.reversalDate !== e.reversalDate || !o.some((t) => t.id === e.bankAccountId) || !r || r.sourceId !== e.id || r.sourceType !== (n ? "SUPPLIER_REFUND" : "CUSTOMER_REFUND") || r.totalDebit !== e.amount || r.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) throw Error("Refund snapshot relationships are invalid.");
	}
	for (let e of a) {
		let t = Fp(r.refunds.filter((t) => t.creditId === e.id && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
		if ((e.amountRefunded ?? 0) !== t) throw Error("Credit refunded balance is invalid.");
	}
	for (let e of a) for (let t of e.refundEvents ?? []) if (!r.refunds.some((n) => n.id === t.id && n.creditId === e.id)) throw Error("Credit refund history has no settlement record.");
	if (!n) {
		let e = t.customerPayments.payments;
		for (let t of r.receipts ?? []) {
			let n = t.paymentIds.map((t) => e.find((e) => e.id === t));
			if (new Set(t.paymentIds).size !== t.paymentIds.length || !n.length || n.some((e) => !e || e.customerId !== t.customerId || e.bankAccountId !== t.bankAccountId || e.status !== (t.status === "REVERSED" ? "REVERSED" : "RECEIVED")) || Fp(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== t.amount) throw Error("Receipt allocation snapshot relationships are invalid.");
		}
	}
}
//#endregion
//#region src/features/sales/data/invoiceBalanceAsAtService.ts
function rm(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= om(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: sm(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => im(e, r)), a = sm(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && am(t, r)), s = sm(o.reduce((e, t) => e + t.amount, 0)), c = sm(e.totals.total), l = sm(Math.max(0, c - a - s));
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
function im(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < om(e.reversedAt) : !1;
}
function am(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < om(e.reversedAt) : !1;
}
function om(e) {
	return x(e);
}
function sm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function cm(e, t, n) {
	let r = dm(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= um(e.voidedAt)) return lm(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && am(t, n)), a = dm(i.reduce((e, t) => e + t.amount, 0)), o = dm(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - a));
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
function lm(e, t, n) {
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
function um(e) {
	return x(e);
}
function dm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function fm(e, t, n = [], r = [], i = [], a = hm()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = rm(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = pm(e.dueDate, a);
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
		current: gm(s.current),
		days1To30: gm(s.days1To30),
		days31To60: gm(s.days31To60),
		days61To90: gm(s.days61To90),
		days90Plus: gm(s.days90Plus)
	}, p = gm(c), m = gm(l), h = gm(i.reduce((t, n) => n.customerId === e.id ? t + cm(n, r, a).amountAvailable : t, 0)), g = gm(p - h);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: h,
		netAccountBalance: g,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: gm(Math.max(0, e.creditLimit - Math.max(0, g))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function pm(e, t = hm()) {
	let n = mm(e), r = mm(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function mm(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function hm() {
	return x((/* @__PURE__ */ new Date()).toISOString());
}
function gm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function _m(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function vm(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function ym(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? _m(t - n) : _m(n - t);
}
function bm(e, t, n) {
	vm(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = _m(t + r.debit), n = _m(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: ym(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = _m(r.reduce((e, t) => e + t.totalDebit, 0)), o = _m(r.reduce((e, t) => e + t.totalCredit, 0));
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
function xm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Sm({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = fm(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: xm(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = xm(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = xm(bm(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = xm(l - d);
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
function Cm(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && wm(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = Tm(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && wm(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = Tm(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && wm(n.reversedAt) <= r ? t : t + n.amount, 0)), o = Tm(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: Tm(Math.max(0, o - i - a))
	};
}
function wm(e) {
	return x(e);
}
function Tm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function Em(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && Dm(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = Om(e.totals.total), i = Om(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && Dm(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: Om(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - i))
	};
}
function Dm(e) {
	return x(e);
}
function Om(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function km(e, t, n = [], r = [], i = [], a = Im()) {
	let o = Mm(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = Cm(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = jm(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = Fm(r.reduce((t, n) => n.supplierId === e.id ? t + Em(n, i, a).amountAvailable : t, 0)), p = Fm(s), m = Fm(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: Fm(c),
		aging: Nm(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function Am(e, t, n = [], r = [], i = [], a = Im()) {
	let o = Mm(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let h of e) {
		let e = km(h, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: Fm(s),
		unallocatedCredit: Fm(c),
		totalOutstanding: Fm(l),
		overdueAmount: Fm(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: Nm(o)
	};
}
function jm(e, t = Im()) {
	let n = Pm(e), r = Pm(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Mm() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function Nm(e) {
	return {
		current: Fm(e.current),
		days1To30: Fm(e.days1To30),
		days31To60: Fm(e.days31To60),
		days61To90: Fm(e.days61To90),
		days90Plus: Fm(e.days90Plus)
	};
}
function Pm(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function Fm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Im() {
	return x((/* @__PURE__ */ new Date()).toISOString());
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function Lm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Rm({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = Am(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = Lm(bm(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = Lm(c.totalOutstanding), f = Lm(d - u);
	return {
		asOfDate: s,
		grossOutstanding: Lm(c.grossOutstanding),
		unallocatedCredit: Lm(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function zm(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function Bm(e) {
	return e.slice(0, 10);
}
function Vm(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function Hm(e, t) {
	zm(t);
	let n = e.filter((e) => Bm(e.occurredAt) <= t).slice().sort(Vm), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = G(n.quantityOnHand + e.quantityBase), a = _c(n.inventoryValue + e.valueChange);
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
		let t = Ac.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = wi(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : gc(e.inventoryValue / e.quantityOnHand);
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
		totalQuantity: G(i.reduce((e, t) => e + t.quantityOnHand, 0)),
		totalInventoryValue: _c(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function Um(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Wm(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function Gm({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	Wm(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = Hm(n, r), o = Um(bm(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = Um(a.totalInventoryValue), c = Um(s - o);
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
var Km = (e) => Math.round((e + 2 ** -52) * 100) / 100, $ = a().trim().min(1).max(200), qm = w().finite().refine((e) => Km(e) === e, "Amounts must use cents precision"), Jm = t({
	accountId: $,
	debit: qm.nonnegative(),
	credit: qm.nonnegative()
}).strict(), Ym = t({
	contactId: $,
	reference: $,
	date: $,
	dueDate: $,
	amount: qm
}).strict(), Xm = t({
	operationId: $,
	date: $,
	reason: a().trim().min(3).max(1e3),
	gl: r(Jm).min(2).max(5e3),
	ar: r(Ym).max(1e4),
	ap: r(Ym).max(1e4),
	banks: r(t({
		bankAccountId: $,
		amount: qm
	}).strict()).max(500),
	stock: r(t({
		siteId: $,
		productId: $,
		quantity: w().positive().finite(),
		unitCost: w().nonnegative().finite()
	}).strict()).max(1e4)
}).strict(), Zm = [], Qm = 0, $m = /* @__PURE__ */ new Set(), eh = () => {
	Qm++, $m.forEach((e) => e());
};
function th() {
	return ve();
}
function nh(e) {
	ae(e), Oo(e.sales), Bo(e.customerCredits), k.update("supplierBills", e.supplierBills.supplierBills), k.update("supplierCredits", e.supplierCredits.supplierCredits);
}
function rh(e, t) {
	if (new Set(e).size !== e.length) throw Error("Duplicate " + t + ".");
}
function ih(e) {
	let t = Xm.parse(e);
	if (C(t.date, "Cutover date"), Ke(t.date), N(), Zm.some((e) => e.status === "POSTED")) throw Error("An opening batch is already active. Reverse the unused batch before replacing it.");
	let n = th();
	if (n.journals.journalEntries.some((e) => e.journalDate >= t.date)) throw Error("Cutover must be after all existing ledger activity. This import adds historical balances, never replaces existing transactions.");
	if (n.inventoryMovements.movements.some((e) => e.occurredAt.slice(0, 10) >= t.date)) throw Error("Cutover must be after existing inventory activity.");
	rh(t.gl.map((e) => e.accountId), "GL account"), rh(t.banks.map((e) => e.bankAccountId), "bank"), rh(t.stock.map((e) => e.siteId + ":" + e.productId), "site/product");
	let r = Sm({
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
	}), i = Rm({
		suppliers: n.suppliers.suppliers,
		bills: n.supplierBills.supplierBills,
		payments: n.supplierPayments.supplierPayments,
		credits: n.supplierCredits.supplierCredits,
		creditAllocations: n.supplierCredits.allocations,
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: t.date
	}), a = Gm({
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
	let o = O.getAll(), s = (e) => O.requireBySystemRole(e).id, c = (e) => Km(t.gl.filter((t) => t.accountId === e).reduce((e, t) => e + t.debit - t.credit, 0));
	for (let e of t.gl) {
		let t = O.requireById(e.accountId);
		if (!t.active || ![
			"ASSET",
			"LIABILITY",
			"EQUITY"
		].includes(t.type) || e.debit > 0 && e.credit > 0 || e.debit + e.credit <= 0) throw Error("Opening GL requires active balance-sheet accounts and one positive debit or credit per row.");
	}
	let l = Km(t.gl.reduce((e, t) => e + t.debit, 0)), u = Km(t.gl.reduce((e, t) => e + t.credit, 0));
	if (l !== u || !l) throw Error("Opening trial balance does not balance.");
	let d = Km(t.ar.reduce((e, t) => e + t.amount, 0)), f = Km(t.ap.reduce((e, t) => e + t.amount, 0));
	if (c(s("ACCOUNTS_RECEIVABLE")) !== d || c(s("ACCOUNTS_PAYABLE")) !== -f) throw Error("AR/AP detail must equal imported GL control balances. Negative detail creates an unused historical credit.");
	for (let [e, r] of [["ar", t.ar], ["ap", t.ap]]) {
		rh(r.map((e) => e.contactId + ":" + e.reference.toLowerCase()), e + " reference");
		for (let i of r) {
			if (C(i.date), C(i.dueDate), !i.amount || i.date > t.date || i.dueDate < i.date) throw Error("Invalid outstanding document amount/date.");
			if (!(e === "ar" ? n.customers.customers : n.suppliers.suppliers).some((e) => e.id === i.contactId)) throw Error("Opening contact not found.");
			if ((e === "ar" ? [...n.sales.invoices.map((e) => [e.customerId, e.documentNumber]), ...n.customerCredits.creditNotes.map((e) => [e.customerId, e.creditNoteNumber])] : [...n.supplierBills.supplierBills.map((e) => [e.supplierId, e.supplierInvoiceNumber]), ...n.supplierCredits.supplierCredits.map((e) => [e.supplierId, e.supplierCreditNumber])]).some(([e, t]) => e === i.contactId && t.toLowerCase() === i.reference.toLowerCase())) throw Error("Historical document reference already exists.");
		}
	}
	let p = 0;
	for (let e of t.stock) {
		let t = wi(e.productId), n = Ac.getById(e.siteId);
		if (!t || t.status !== "ACTIVE" || t.itemType === "SERVICE" || n?.status !== "ACTIVE") throw Error("Opening stock requires active stocked products/sites.");
		if (Math.round(e.quantity * 1e4) / 1e4 !== e.quantity) throw Error("Stock quantities use at most four decimal places.");
		p = Km(p + Km(e.quantity * e.unitCost));
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
y("openingBalances", {
	repository: {
		preview(e) {
			let { input: t, debit: n, credit: r, ar: i, ap: a, inventory: o } = ih(e);
			return {
				date: t.date,
				debit: n,
				credit: r,
				ar: i,
				ap: a,
				inventory: o,
				bank: Km(t.banks.reduce((e, t) => e + t.amount, 0)),
				documents: t.ar.length + t.ap.length
			};
		},
		post(e) {
			let t = Xm.parse(e), n = JSON.stringify(t), r = Zm.find((e) => e.operationId === t.operationId);
			if (n.length > 5e7) throw Error("Opening import exceeds 50 MB.");
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID already used for different opening data.");
				return r;
			}
			let { input: i, s: a } = ih(t), o = crypto.randomUUID(), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
				id: o,
				operationId: i.operationId,
				fingerprint: n,
				date: i.date,
				reason: i.reason,
				status: "POSTED",
				actor: T.current()?.userId ?? "",
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
			}, l = (e) => O.requireBySystemRole(e).id, u = l("OWNERS_EQUITY"), d = 0, f = 0;
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
				let g = e === "ar" == t.amount > 0, ee = A.post({
					journalDate: i.date,
					description: "Opening outstanding " + t.reference,
					reference: t.reference,
					sourceType: h,
					sourceId: n,
					lines: [{
						accountId: l(e === "ar" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"),
						debit: g ? r : 0,
						credit: g ? 0 : r
					}, {
						accountId: u,
						debit: g ? 0 : r,
						credit: g ? r : 0
					}]
				});
				c.journalIds.push(ee.id), g ? d += r : f += r;
			}
			a.journals = th().journals, nh(a);
			let p = i.gl.filter((e) => ![l("ACCOUNTS_RECEIVABLE"), l("ACCOUNTS_PAYABLE")].includes(e.accountId));
			(d || f) && p.push({
				accountId: u,
				debit: Km(d),
				credit: Km(f)
			});
			let m = /* @__PURE__ */ new Map();
			for (let e of p) m.set(e.accountId, Km((m.get(e.accountId) ?? 0) + e.debit - e.credit));
			let h = [...m].filter(([, e]) => e !== 0).map(([e, t]) => ({
				accountId: e,
				debit: Math.max(0, t),
				credit: Math.max(0, -t)
			}));
			if (h.length) {
				let e = A.post({
					journalDate: i.date,
					description: "Opening trial balance " + i.reason,
					sourceType: "OPENING_BALANCE",
					sourceId: o,
					lines: h
				});
				c.journalIds.push(e.id);
			}
			for (let e of i.stock) {
				let t = wi(e.productId), n = t.units.find((e) => e.id === t.baseUnitId), r = Fc.create({
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
				al.receive({
					siteId: e.siteId,
					productId: t.id,
					baseUnitId: t.baseUnitId,
					quantityBase: e.quantity
				});
				let a = Qc({
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
			return Zm = [...Zm, c], eh(), c;
		},
		reverse(e) {
			if (C(e.date), Ke(e.date), N(), !e.reason?.trim() || e.reason.trim().length < 3) throw Error("Reversal reason is required.");
			let t = Zm.find((t) => t.id === e.id);
			if (!t) throw Error("Opening batch not found.");
			if (t.status === "REVERSED") return t;
			if (e.date < t.date) throw Error("Reversal date precedes cutover.");
			let n = th();
			if (n.journals.journalEntries.some((e) => !t.priorJournalIds.includes(e.id) && !t.journalIds.includes(e.id)) || n.inventoryMovements.movements.some((e) => !t.priorMovementIds.includes(e.id) && !t.movementIds.includes(e.id))) throw Error("Subsequent accounting or inventory activity exists. Reverse downstream activity before correcting opening balances.");
			let r = n.sales.invoices.filter((e) => t.invoiceIds.includes(e.id)), i = n.supplierBills.supplierBills.filter((e) => t.billIds.includes(e.id)), a = [...n.customerCredits.creditNotes.filter((e) => t.customerCreditIds.includes(e.id)), ...n.supplierCredits.supplierCredits.filter((e) => t.supplierCreditIds.includes(e.id))];
			if (r.some((e) => e.amountPaid !== 0 || e.amountDue !== e.totals.total) || i.some((e) => e.totals.amountPaid !== 0 || e.totals.amountCredited !== 0) || a.some((e) => e.amountApplied !== 0 || (e.amountRefunded ?? 0) !== 0)) throw Error("Opening balances have allocations or settlements. Reverse downstream allocations before correcting them.");
			for (let e of ["customerSettlements", "supplierRefunds"]) if (JSON.stringify(n[e]).includes(t.id)) throw Error("Opening balances have downstream settlements.");
			for (let e of t.journalIds) Jp(e);
			for (let n of t.journalIds) A.reverse({
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
			return n.stock.balances = t.priorStock, n.costBalances.balances = t.priorCost, n.journals = th().journals, nh(n), Zm = Zm.map((n) => n.id === t.id ? {
				...n,
				status: "REVERSED",
				reversalDate: e.date,
				reversalReason: e.reason
			} : n), eh(), Zm.find((e) => e.id === t.id);
		}
	},
	read: "accounting.read",
	commands: {
		preview: "accounting.post",
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ batches: Zm }),
	restore: (e) => {
		Zm = e.batches;
	},
	publish: eh,
	validate: (e, n) => {
		let i = t({ batches: r(t({
			id: $,
			operationId: $,
			date: $,
			status: f(["POSTED", "REVERSED"]),
			journalIds: r($),
			invoiceIds: r($),
			billIds: r($),
			customerCreditIds: r($),
			supplierCreditIds: r($),
			fingerprint: a().min(1).max(5e7),
			reason: a().min(3),
			actor: $,
			createdAt: $,
			movementIds: r($),
			costMovementIds: r($),
			priorJournalIds: r($),
			priorMovementIds: r($),
			priorStock: r(t({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: w().finite().nonnegative(),
				updatedAt: $
			}).strict()),
			priorCost: r(t({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: w().finite().nonnegative(),
				averageCostPerBaseUnit: w().finite().nonnegative(),
				inventoryValue: w().finite().nonnegative(),
				costingMethod: p("MOVING_WEIGHTED_AVERAGE"),
				updatedAt: $
			}).strict()),
			reversalDate: $.optional(),
			reversalReason: a().optional()
		}).strict()) }).strict().parse(e);
		for (let e of i.batches) {
			let t = Xm.parse(JSON.parse(e.fingerprint));
			if (t.operationId !== e.operationId || t.date !== e.date) throw Error("Opening import identity is invalid.");
			if (e.status === "REVERSED" && !e.reversalDate) throw Error("Opening reversal date is missing.");
			e.reversalDate && C(e.reversalDate), C(e.date);
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
var ah = /* @__PURE__ */ new Set(), oh = k.read().supplierPayments;
k.onRollback(() => {
	oh = k.read().supplierPayments;
});
function sh() {
	k.update("supplierPayments", oh), ah.forEach((e) => k.notify(e));
}
var ch = {
	subscribe(e) {
		return ah.add(e), () => {
			ah.delete(e);
		};
	},
	getSnapshot() {
		return oh;
	},
	getAll() {
		return oh;
	},
	getById(e) {
		return oh.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return oh.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return oh.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: uh(e.reference),
			notes: uh(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: dh(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = oh.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (C(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = hi.getById(e.supplierId);
		if (!r) throw Error("Supplier was not found.");
		if (!e.paymentDate) throw Error("Payment date is required.");
		if (!e.method) throw Error("Payment method is required.");
		if (!e.bankAccountId) throw Error("Bank account is required.");
		let i = jt.getById(e.bankAccountId);
		if (!i) throw Error("Bank account was not found.");
		if (!i.active) throw Error("The selected bank account is inactive.");
		let a = e.allocations.filter((e) => Number.isFinite(e.amount) && e.amount > 0);
		if (a.length === 0) throw Error("Allocate the payment to at least one supplier bill.");
		let o = /* @__PURE__ */ new Set(), s = a.map((t) => {
			if (o.has(t.supplierBillId)) throw Error("A supplier bill cannot appear more than once in the same payment.");
			o.add(t.supplierBillId);
			let n = Ml.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = dh(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${fh(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), c = dh(s.reduce((e, t) => e + t.amount, 0));
		if (c <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of s) Ml.applyPayment(e.supplierBillId, e.amount);
		let l = (/* @__PURE__ */ new Date()).toISOString(), u = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: lh(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: c,
			method: e.method,
			bankAccountId: i.id,
			reference: uh(e.reference),
			notes: uh(e.notes),
			allocations: s,
			status: "POSTED",
			createdAt: l,
			updatedAt: l
		};
		return oh = [u, ...oh], sh(), Oc.postSupplierPayment(u), u;
	},
	reverse(e, t) {
		Fe("SUPPLIER_PAYMENT", e);
		let n = oh.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = Ml.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) Ml.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return oh = oh.map((t) => t.id === e ? a : t), sh(), Oc.reverseSupplierPayment(a), a;
	}
};
function lh(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = oh.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function uh(e) {
	return e?.trim() || void 0;
}
function dh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function fh(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: _().currency
	}).format(e);
}
var ph = ch.create;
ch.create = function(...e) {
	return N(), k.transaction(() => ph.apply(ch, e));
};
var mh = ch.reverse;
ch.reverse = function(...e) {
	return N(), k.transaction(() => mh.apply(ch, e));
}, y("supplierPayments", {
	repository: ch,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: oh }),
	restore: (e) => {
		oh = e.supplierPayments;
	},
	publish: () => ah.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/paymentBatchRepository.ts
var hh = (e) => Math.round((e + 2 ** -52) * 100) / 100, gh = a().trim().min(1).max(200), _h = t({
	operationId: gh,
	paymentDate: gh,
	bankAccountId: gh,
	reference: a().max(500),
	allocations: r(t({
		supplierBillId: gh,
		amount: w().finite().positive().refine((e) => hh(e) === e)
	}).strict()).min(1).max(500)
}).strict(), vh = [], yh = 0, bh = /* @__PURE__ */ new Set(), xh = () => {
	yh++, bh.forEach((e) => e());
}, Sh = () => {
	let e = T.current();
	if (!e) throw Error("A verified session is required.");
	return e.userId;
};
function Ch(e, t) {
	return {
		action: e,
		reason: t,
		actor: Sh(),
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function wh(e) {
	let t = vh.find((t) => t.id === e);
	if (!t) throw Error("Payment batch was not found.");
	return t;
}
function Th(e) {
	return vh = vh.map((t) => t.id === e.id ? e : t), xh(), e;
}
function Eh(e) {
	C(e.paymentDate, "Payment date");
	let t = jt.requireById(e.bankAccountId);
	if (!t.active || e.paymentDate < t.openingBalanceDate) throw Error("Invalid paying bank account/date.");
	if (new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length) throw Error("Select each bill only once.");
	for (let t of e.allocations) {
		let n = Ml.getById(t.supplierBillId);
		if (!n || n.status === "VOID" || t.amount > n.totals.amountDue || e.paymentDate < n.billDate) throw Error("A bill amount, date or outstanding balance changed. Review the batch.");
	}
}
y("paymentBatches", {
	repository: {
		create(e) {
			let t = _h.parse(e), n = JSON.stringify(t), r = vh.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID was used with different batch data.");
				return r;
			}
			Eh(t);
			let i = {
				...t,
				id: crypto.randomUUID(),
				fingerprint: n,
				status: "DRAFT",
				createdBy: Sh(),
				paymentIds: [],
				history: [Ch("Created")]
			};
			return vh = [...vh, i], xh(), i;
		},
		approve(e) {
			let t = wh(e);
			if (t.status === "APPROVED") return t;
			if (t.status !== "DRAFT") throw Error("Only a draft batch can be approved.");
			return Eh(t), Th({
				...t,
				status: "APPROVED",
				approvedBy: Sh(),
				history: [...t.history, Ch("Approved")]
			});
		},
		post(e) {
			let t = wh(e);
			if (t.status === "POSTED") return t;
			if (t.status !== "APPROVED") throw Error("Approve the batch before recording payments.");
			N(), Eh(t);
			let n = /* @__PURE__ */ new Map();
			for (let e of t.allocations) {
				let t = Ml.getById(e.supplierBillId);
				n.set(t.supplierId, [...n.get(t.supplierId) ?? [], e]);
			}
			let r = [...n].map(([e, n]) => ch.create({
				operationId: "batch:" + t.id + ":" + e,
				supplierId: e,
				paymentDate: t.paymentDate,
				bankAccountId: t.bankAccountId,
				reference: t.reference,
				method: "BANK_TRANSFER",
				allocations: n
			}));
			return Th({
				...t,
				status: "POSTED",
				paymentIds: r.map((e) => e.id),
				history: [...t.history, Ch("Payments recorded")]
			});
		},
		cancel(e) {
			let t = wh(e.id);
			if (!["DRAFT", "APPROVED"].includes(t.status) || e.reason?.trim().length < 3) throw Error("Only an unposted batch can be cancelled, with a reason.");
			return Th({
				...t,
				status: "CANCELLED",
				history: [...t.history, Ch("Cancelled", e.reason)]
			});
		},
		reverse(e) {
			let t = wh(e.id);
			if (t.status === "REVERSED") return t;
			if (t.status !== "POSTED" || e.reason?.trim().length < 3) throw Error("A posted batch and reversal reason are required.");
			N();
			for (let e of t.paymentIds) {
				let t = ch.getById(e);
				if (!t || t.status !== "POSTED") throw Error("Batch payments changed. Inspect before reversing.");
				Fe("SUPPLIER_PAYMENT", e);
			}
			for (let n of t.paymentIds) ch.reverse(n, e.reason);
			return Th({
				...t,
				status: "REVERSED",
				history: [...t.history, Ch("Reversed", e.reason)]
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
	snapshot: () => ({ batches: vh }),
	restore: (e) => {
		vh = e.batches;
	},
	validate: (e, n) => {
		let i = t({ batches: r(_h.extend({
			id: gh,
			fingerprint: a(),
			status: f([
				"DRAFT",
				"APPROVED",
				"POSTED",
				"REVERSED",
				"CANCELLED"
			]),
			createdBy: gh,
			approvedBy: gh.optional(),
			paymentIds: r(gh),
			history: r(t({
				action: gh,
				actor: gh,
				at: gh,
				reason: a().optional()
			}))
		})) }).strict().parse(e), o = n.supplierPayments.supplierPayments;
		for (let e of i.batches) {
			if (!["POSTED", "REVERSED"].includes(e.status)) continue;
			let t = e.paymentIds.map((e) => o.find((t) => t.id === e));
			if (!t.length || t.some((t) => !t || t.bankAccountId !== e.bankAccountId || t.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) || hh(t.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== hh(e.allocations.reduce((e, t) => e + t.amount, 0))) throw Error("Batch payment relationships are invalid.");
			if (e.paymentIds.some((e) => !n.journals.journalEntries.some((t) => t.sourceType === "SUPPLIER_PAYMENT" && t.sourceId === e))) throw Error("A batch payment journal is missing.");
		}
	},
	publish: xh
});
//#endregion
//#region src/features/finance-closure/bankStatementRepository.ts
var Dh = (e) => Math.round((e + 2 ** -52) * 100) / 100, Oh = a().min(1).max(200), kh = [], Ah = 0, jh = /* @__PURE__ */ new Set(), Mh = () => {
	Ah++, jh.forEach((e) => e());
};
function Nh(e) {
	let t = jt.requireById(e);
	if (!t.active) throw Error("Select an active bank account.");
	return t;
}
function Ph(e) {
	let t = kh.find((t) => t.id === e);
	if (!t) throw Error("Statement line was not found.");
	return t;
}
function Fh(e) {
	if (e.status !== "UNMATCHED") throw Error("This line is already processed. Revert it before changing it.");
	let t = Np.getLatestByBankAccount(e.bankAccountId);
	if (t && e.date <= t.statementDate) throw Error("Statement date is already reconciled.");
}
function Ih(e) {
	return kh = kh.map((t) => t.id === e.id ? e : t), Mh(), e;
}
var Lh = (e, t) => hu(Nh(e), A.getAll(), t).transactions, Rh = t({
	date: Oh,
	description: a().trim().min(1).max(1e3),
	amount: w().finite().refine((e) => e !== 0 && Dh(e) === e, "Enter a non-zero amount in cents"),
	reference: a().max(500).default(""),
	externalId: a().max(200).default("")
}).strict(), zh = {
	importRows(e) {
		let n = t({
			bankAccountId: Oh,
			rows: r(Rh).min(1).max(1e4)
		}).strict().parse(e), i = Nh(n.bankAccountId), a = 0, o = [...kh], s = [];
		for (let e of n.rows) {
			if (C(e.date, "Statement date"), e.date < i.openingBalanceDate) throw Error("Statement predates the bank opening date.");
			let t = JSON.stringify([i.id, e.externalId || [
				e.date,
				e.amount,
				e.description.trim().toLowerCase(),
				e.reference.trim().toLowerCase()
			]]), n = o.find((e) => e.key === t);
			if (n) {
				if (e.externalId && (n.amount !== e.amount || n.date !== e.date || n.description !== e.description || n.reference !== e.reference)) throw Error("Bank transaction ID conflicts with an existing row.");
				a++;
				continue;
			}
			let r = Np.getLatestByBankAccount(i.id);
			if (r && e.date <= r.statementDate) throw Error("Cannot import new rows into a reconciled statement period.");
			let c = {
				...e,
				id: crypto.randomUUID(),
				key: t,
				bankAccountId: i.id,
				status: "UNMATCHED",
				ledgerIds: [],
				history: [{
					action: "Imported",
					date: (/* @__PURE__ */ new Date()).toISOString()
				}]
			};
			o.push(c), s.push(c);
		}
		return kh = o, Mh(), {
			created: s.length,
			duplicates: a
		};
	},
	importCsv(e) {
		if (typeof e.csv != "string" || e.csv.length > 1e7) throw Error("CSV exceeds the 10 MB limit.");
		let t = on(e.csv.replace(/^\uFEFF/, "")), n = t.shift()?.map((e) => e.trim().toLowerCase()) ?? [];
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
		return zh.importRows({
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
					l = Dh(t - e);
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
		return C(e.asOfDate, "As-of date"), Lh(e.bankAccountId, e.asOfDate).filter((e) => e.journalStatus === "POSTED" && !kh.some((t) => t.ledgerIds.includes(e.id)));
	},
	match(e) {
		let t = Ph(e.id);
		if (Fh(t), !Array.isArray(e.ledgerIds) || !e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Select unique ledger entries.");
		let n = zh.candidates({
			bankAccountId: t.bankAccountId,
			asOfDate: t.date
		}), r = e.ledgerIds.map((e) => n.find((t) => t.id === e));
		if (r.some((e) => !e) || Dh(r.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== t.amount) throw Error("Selected bank entries must match this signed statement amount exactly.");
		return Ih({
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
		let t = Ph(e.id);
		return (S["bank-rules"] ?? []).filter((e) => e.status === "Active" && e.enabled !== "No").filter((e) => {
			let n = (e.field === "Reference" ? t.reference : e.field === "Description" ? t.description : "").toLowerCase(), r = e.value.toLowerCase();
			return e.operator === "Equals" ? n === r : e.operator === "Starts with" ? n.startsWith(r) : n.includes(r);
		});
	},
	post(e) {
		N();
		let n = Ph(e.id), i = JSON.stringify(e.splits);
		if (n.status === "POSTED") {
			if (n.fingerprint !== i) throw Error("Line was already posted with different categorisation.");
			return n;
		}
		Fh(n);
		let a = r(t({
			accountId: Oh,
			amount: w().finite().positive().refine((e) => Dh(e) === e),
			taxCode: Oh
		}).strict()).min(1).max(100).parse(e.splits);
		if (Dh(a.reduce((e, t) => e + t.amount, 0)) !== Math.abs(n.amount)) throw Error("Split amounts must equal the statement total.");
		let o = Nh(n.bankAccountId), s = n.amount < 0, c = a.flatMap((e) => {
			let t = O.requireById(e.accountId);
			if (!t.active || !t.allowManualPosting || !["EXPENSE", "REVENUE"].includes(t.type)) throw Error("Use an active manual expense/revenue account. Payments against AR/AP must be matched to their source documents.");
			let n = b(e.taxCode), r = Dh(e.amount / (1 + n)), i = Dh(e.amount - r);
			return [{
				accountId: t.id,
				debit: s ? r : 0,
				credit: s ? 0 : r
			}, ...i ? [{
				accountId: (s ? se(e.taxCode).taxPaidAccountId : se(e.taxCode).taxCollectedAccountId) || O.requireBySystemRole(s ? "GST_RECEIVABLE" : "GST_PAYABLE").id,
				debit: s ? i : 0,
				credit: s ? 0 : i
			}] : []];
		}), l = A.post({
			journalDate: n.date,
			description: n.description,
			reference: n.reference,
			sourceType: "BANK_STATEMENT",
			sourceId: n.id + ":" + n.history.filter((e) => e.action === "Posted").length,
			lines: [{
				accountId: o.glAccountId,
				debit: s ? 0 : n.amount,
				credit: s ? -n.amount : 0
			}, ...c]
		}), u = l.lines.filter((e) => e.accountId === o.glAccountId).map((e) => l.id + ":" + e.id);
		return Ih({
			...n,
			status: "POSTED",
			journalEntryId: l.id,
			ledgerIds: u,
			fingerprint: i,
			history: [...n.history, {
				action: "Posted",
				date: (/* @__PURE__ */ new Date()).toISOString()
			}]
		});
	},
	ignore(e) {
		let t = Ph(e.id);
		if (Fh(t), e.reason?.trim().length < 3) throw Error("Enter an exclusion reason.");
		return Ih({
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
		let t = Ph(e.id);
		if (C(e.reversalDate, "Reversal date"), e.reason?.trim().length < 3 || e.reversalDate < t.date) throw Error("Enter a reason and a reversal date on or after the statement line.");
		if (t.status === "UNMATCHED") throw Error("Line is already unmatched.");
		for (let e of t.ledgerIds) Jp(e.split(":")[0]);
		let n = Np.getLatestByBankAccount(t.bankAccountId);
		if (n && t.date <= n.statementDate) throw Error("Reconciled statement lines cannot be reverted.");
		return t.status === "POSTED" && t.journalEntryId && A.reverse({
			journalEntryId: t.journalEntryId,
			reversalDate: e.reversalDate,
			reason: e.reason
		}), Ih({
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
		if (Ke(e.statementDate), N(), C(e.statementDate, "Statement date"), !kh.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate)) throw Error("Import the statement first.");
		if (kh.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate && t.status === "UNMATCHED")) throw Error("Process every statement line before completing reconciliation.");
		let t = kh.filter((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate).flatMap((e) => e.ledgerIds);
		return Np.complete({
			...e,
			clearedTransactionIds: [.../* @__PURE__ */ new Set([...Np.getClearedTransactionIds(e.bankAccountId), ...t])]
		});
	}
}, Bh = t({
	id: Oh,
	key: a(),
	bankAccountId: Oh,
	date: Oh,
	description: a(),
	reference: a(),
	amount: w().finite(),
	externalId: a(),
	status: f([
		"UNMATCHED",
		"MATCHED",
		"POSTED",
		"IGNORED"
	]),
	ledgerIds: r(Oh),
	journalEntryId: a().optional(),
	fingerprint: a().optional(),
	history: r(t({
		action: a(),
		date: a(),
		reason: a().optional()
	}))
}).strict();
y("bankStatements", {
	repository: zh,
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
	snapshot: () => ({ lines: kh }),
	restore: (e) => {
		kh = e.lines;
	},
	validate: (e) => {
		r(Bh).parse(e.lines);
	},
	publish: Mh
});
//#endregion
//#region src/lib/persistence/financialConsistencyAudit.ts
function Vh(e) {
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
var Hh = /* @__PURE__ */ new Set(), Uh = k.read().transactions, Wh = k.read().transfers;
k.onRollback(() => {
	let e = k.read();
	Uh = e.transactions, Wh = e.transfers;
});
function Gh() {
	Hh.forEach((e) => k.notify(e));
}
function Kh(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function qh(e) {
	return e?.trim() || void 0;
}
function Jh(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function Yh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Xh(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Zh(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var Qh = {
	subscribe(e) {
		return Hh.add(e), () => {
			Hh.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return Uh;
	},
	getTransfersSnapshot() {
		return Wh;
	},
	getTransactions() {
		return Uh;
	},
	getTransfers() {
		return Wh;
	},
	createTransaction(e, t) {
		if (Jh(e.transactionDate), C(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = Yh(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Kh(e.description, "Description"), i = jt.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let a = O.requireById(i.glAccountId);
		if (!a.active) throw Error("The selected bank GL account is inactive.");
		let o = O.requireById(e.offsetAccountId);
		if (!o.active) throw Error("The offset account is inactive.");
		if (!o.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (o.id === a.id) throw Error("Bank and offset accounts must be different.");
		if (jt.getByGlAccountId(o.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let s = Xh("banktxn"), c = Zh("BTXN", e.transactionDate, Uh.length + 1), l = t?.trim();
		if (t !== void 0 && !l) throw Error("Operation ID cannot be empty");
		if (l) {
			let t = j.begin(l, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Uh.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			l && j.bindResult(l, s);
			let t = A.post({
				journalDate: e.transactionDate,
				description: r,
				reference: qh(e.reference),
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
				reference: qh(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [u, ...Uh];
			if (k.update("transactions", d), Uh = d, Gh(), l) {
				let e = A.getBySource("BANK_TRANSACTION", s);
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
		Jh(e.transferDate), C(e.transferDate, "Transfer date");
		let n = Yh(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Kh(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = jt.requireById(e.fromBankAccountId), a = jt.requireById(e.toBankAccountId);
		if (!i.active || !a.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== a.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < a.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let o = O.requireById(i.glAccountId), s = O.requireById(a.glAccountId);
		if (!o.active || !s.active) throw Error("Both bank GL accounts must be active.");
		if (o.id === s.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let c = Xh("banktrf"), l = Zh("BTRF", e.transferDate, Wh.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = j.begin(u, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Wh.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			u && j.bindResult(u, c);
			let t = A.post({
				journalDate: e.transferDate,
				description: r,
				reference: qh(e.reference),
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
				reference: qh(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [d, ...Wh];
			if (k.update("transfers", f), Wh = f, Gh(), u) {
				let e = A.getBySource("BANK_TRANSFER", c);
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
}, $h = Qh.createTransaction;
Qh.createTransaction = function(e, t) {
	N();
	let n;
	try {
		return n = k.transaction(() => $h.call(Qh, e, t)), t && j.complete(t.trim(), n.id), n;
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
var eg = Qh.createTransfer;
Qh.createTransfer = function(e, t) {
	N();
	let n;
	try {
		return n = k.transaction(() => eg.call(Qh, e, t)), t && j.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = j.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				j.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
}, y("bankTransactions", {
	repository: Qh,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: Uh,
		bankTransfers: Wh
	}),
	restore: (e) => {
		Uh = e.bankTransactions, Wh = e.bankTransfers;
	},
	publish: () => Hh.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function tg() {
	return Vh({
		transactions: Qh.getTransactions(),
		transfers: Qh.getTransfers(),
		payments: ws.getAll(),
		journals: A.getAll(),
		invoices: W.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: H.getAll(),
		supplierBills: Ml.getAll(),
		supplierPayments: ch.getAll(),
		supplierCredits: J.getAll()
	});
}
//#endregion
//#region electron/security/periodCloseChecks.ts
function ng(e) {
	let t = ve(), n = [], r = (e, t) => n.push({
		code: e,
		message: t
	});
	e.endDate >= x((/* @__PURE__ */ new Date()).toISOString()) && r("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of j.getUnresolved()) r("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of t.purchaseOperations) e.status !== "POSTED" && r("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of tg()) r(e.code, `${e.entityId}: ${e.message}`);
	for (let n of t.payroll?.runs ?? []) n.status === "Approved" && n.payDate <= e.endDate && r("PAYROLL_NOT_POSTED", `Post, reopen or cancel approved payroll ${n.name} dated ${n.payDate}.`);
	let i = {
		accounts: t.accounts.accounts,
		journalEntries: t.journals.journalEntries,
		asOfDate: e.endDate
	}, a = [
		["AR", () => Sm({
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
		["AP", () => Rm({
			...i,
			suppliers: t.suppliers.suppliers,
			bills: t.supplierBills.supplierBills,
			payments: t.supplierPayments.supplierPayments,
			credits: t.supplierCredits.supplierCredits,
			creditAllocations: t.supplierCredits.allocations
		})],
		["INVENTORY", () => Gm({
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
var rg = null, ig = {
	configureTrustedSession(e) {
		rg = e;
	},
	clear() {
		rg = null;
	},
	current() {
		return rg?.() ?? null;
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
}, ag = "htt.purchasePosting.manualRecoveryAudit.v1";
function og() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(ag) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var sg = og();
function cg(e) {
	sg.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(ag, JSON.stringify(sg));
	} catch {}
}
y("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return sg.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = M.get(e);
			return ig.canRecover() && t?.status === "RECOVERY_REQUIRED" && M.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = ig.requireRecoveryPermission(), n = M.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!M.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				M.recover(e), cg({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw cg({
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
	snapshot: () => sg,
	restore: (e) => {
		sg.splice(0, sg.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var lg = !1;
function ug() {
	if (lg || (lg = !0, k.wasRestoredOnLoad())) return;
	let e = W.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) Ms.postInvoice(t), t.status === "VOID" && Ms.reverseInvoice(t);
	let t = ws.getAll();
	for (let e of t) Ms.postPayment(e), e.status === "REVERSED" && Ms.reversePayment(e);
	let n = H.getAll();
	for (let e of n) e.status !== "DRAFT" && (Ms.postCreditNote(e), e.status === "VOID" && Ms.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function dg() {
	let e = tg().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/sales/data/salesManualReviewService.ts
var fg = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function pg(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = de("business.command", {
			repository: "salesRecovery",
			method: "recordSalesManualReview",
			args: [e]
		});
		return fe(t.view), t.result;
	}
	if (!e.businessRecordChecked || !e.originalGlChecked || !e.reversalGlChecked || !e.balancesChecked) throw Error("Business, original/reversal GL and balances must all be inspected.");
	let t = j.list().find((t) => t.operationId === e.operationId);
	if (!t || !fg.has(t.kind)) throw Error("Sales operation not found.");
	if (t.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return j.recordManualReview(e.operationId, e.reference, e.operator, e.summary);
}
//#endregion
//#region src/features/sales/data/salesConsistencyAudit.ts
var mg = (e) => Math.round(e * 100);
function hg(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + mg(t.amount), 0), s = a.reduce((e, t) => e + mg(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (mg(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), mg(t.amountDue) !== Math.max(0, mg(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > mg(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + mg(t.amount), 0);
		mg(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || mg(t.amountAvailable) !== 0 : mg(t.amountAvailable) !== mg(t.totals.total) - a - mg(t.amountRefunded ?? 0)) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
var gg = {
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
function _g(e) {
	return hg(e).map((e) => ({
		...e,
		action: gg[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var vg = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function yg(e, t) {
	let n = _g(e).map((e) => ({ ...e })), r = t.filter((e) => vg.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => vg.has(e.kind))) s.has(e.operationId) && n.push({
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
function bg() {
	let e = W.getAll();
	return yg({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: ws.getAll(),
		creditNotes: H.getAll(),
		allocations: H.getAllAllocations(),
		journals: A.getAll()
	}, j.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
var xg = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Sg(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!xg.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = yg(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function Cg() {
	let e = W.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: ws.getAll(),
		creditNotes: H.getAll(),
		allocations: H.getAllAllocations(),
		journals: A.getAll()
	};
}
function wg(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = de("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [e]
		});
		return fe(t.view), t.result;
	}
	let t = j.list(), n = Sg(Cg(), t, e.operationId);
	if (n.length) throw Error(`Sales recovery remains blocked: ${n.join(" ")}`);
	let r = t.find((t) => t.operationId === e.operationId);
	return {
		closed: j.closeReviewed(e.operationId, r.resultId, e.approvalReference, e.approver),
		remaining: bg()
	};
}
//#endregion
//#region electron/security/businessEngine.ts
y("salesRecovery", {
	repository: {
		recordSalesManualReview: pg,
		closeVerifiedSalesReview: wg
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
var Tg = ve();
function Eg(e) {
	Ve(ng, () => e()?.userId ?? ""), T.connect(e), ig.configureTrustedSession(e), ug(), dg();
}
//#endregion
export { Ke as assertPostingPeriod, Eg as initialize, Tg as workspaceDefaults };
