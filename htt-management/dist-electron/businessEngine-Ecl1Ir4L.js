import { A as e, B as t, D as n, F as r, G as i, H as a, I as o, J as s, K as c, L as l, N as u, O as d, P as f, R as p, S as m, T as h, U as g, V as ee, W as te, X as ne, Y as re, Z as ie, _ as ae, a as _, c as oe, d as v, f as se, h as y, i as b, j as ce, k as le, l as ue, m as de, n as fe, o as x, p as pe, q as me, r as S, s as he, t as ge, u as _e, w as ve, y as C, z as w } from "./accountingPeriodValidation-Ha5z4pK5.js";
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
	let n = Oe.find((n) => n.id !== t && (_e(e) ? n.id === _e(e) : n.systemRole === e));
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
		return Oe.find((t) => _e(e) ? t.id === _e(e) : t.systemRole === e);
	},
	requireById(e) {
		let t = Oe.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = Oe.find((t) => _e(e) ? t.id === _e(e) : t.systemRole === e);
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
	let n = C(), r = n.journals?.journalEntries ?? [], i = n.bankReconciliations?.reconciliations ?? [], a = r.filter((n) => n.sourceType === e && n.sourceId === t).map((e) => e.id);
	if (i.some((e) => e.clearedTransactionIds.some((e) => a.some((t) => e.startsWith(t + ":"))))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Ie(e, t) {
	let n = C(), r = n.bankAccounts?.bankAccounts ?? [], i = n.bankReconciliations?.reconciliations ?? [];
	for (let n of r.filter((e) => t.includes(e.glAccountId))) {
		let t = i.filter((e) => e.bankAccountId === n.id).map((e) => e.statementDate).sort().at(-1);
		if (t && e <= t) throw Error(`Bank account is reconciled through ${t}. Use a posting date after that statement.`);
	}
}
function Le(e) {
	if (C().bankStatements?.lines.some((t) => t.status === "MATCHED" && t.ledgerIds.some((t) => t.startsWith(e + ":")))) throw Error("Unmatch the bank statement line before reversing its ledger source.");
}
//#endregion
//#region src/features/accounting/data/accountingPeriodRepository.ts
var Re = [], ze, Be, Ve = /* @__PURE__ */ new Set();
function He(e, t) {
	ze = e, Be = t;
}
function Ue() {
	let e = Be?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function We(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function Ge(e) {
	let t = Re.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function Ke() {
	Ve.forEach((e) => e());
}
function qe(e) {
	if (S(e, "Posting date"), !Re.length) return;
	let t = Re.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!Re.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
y("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => Re,
		subscribe(e) {
			return Ve.add(e), () => {
				Ve.delete(e);
			};
		},
		create(e) {
			let t = Ue(), n = We(e.reason);
			if (S(e.startDate), S(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (Re.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (Re.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
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
			return Re = [...Re, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), Ke(), r;
		},
		preflight(e) {
			let t = Ge(e);
			if (!ze) throw Error("Trusted close checks unavailable.");
			return ze(t);
		},
		close(e) {
			let t = Ue(), n = We(e.reason), r = Ge(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (Re.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return Re = Re.map((e) => e.id === r.id ? {
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
			} : e), Ke(), Ge(e.id);
		},
		reopen(e) {
			let t = Ue(), n = We(e.reason), r = Ge(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (Re.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return Re = Re.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), Ke(), Ge(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: Re }),
	restore: (e) => {
		ge(e.periods), Re = e.periods;
	},
	publish: Ke
});
//#endregion
//#region src/features/purchases/data/mockPurchaseOrders.ts
var Je = [{
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
}], Ye = [{
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
function Xe() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function Ze(e, t) {
	let n = Xe();
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
function Qe(e, t) {
	let n = Xe();
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
function $e(e) {
	let t = Xe();
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
var et = "htt:financial-snapshot:v1", tt = (e) => !!e && typeof e == "object" && !Array.isArray(e), nt = (e) => new Set(e.map((e) => e.id)).size === e.length, rt = (e) => {
	if (!tt(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => tt(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => tt(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => tt(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => tt(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
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
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => tt(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && tt(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && tt(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && tt(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && nt(t) && nt(n) && nt(r) && nt(i);
}, it = () => ({
	purchaseOrders: structuredClone(Je),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone(Ye),
	transactions: [],
	transfers: [],
	journals: []
}), at, ot = !1;
function st() {
	return typeof window < "u" && !!window.localStorage;
}
function ct() {
	if (at) return at;
	if (!st()) return it();
	let e = Ze(et, rt);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return ot = e.status === "ok", at = e.status === "ok" ? {
		...it(),
		...e.data
	} : it(), at;
}
var lt = /* @__PURE__ */ new Set(), ut = 0, dt = /* @__PURE__ */ new Set();
function ft(e) {
	if (st() && !Qe(et, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var k = {
	wasRestoredOnLoad() {
		return ct(), ot;
	},
	onRollback(e) {
		lt.add(e);
	},
	notify(e) {
		ut ? dt.add(e) : e();
	},
	transaction(e) {
		if (ut) return e();
		let t = structuredClone(ct());
		at = structuredClone(t), ut++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			ft(ct());
		} catch (e) {
			throw at = t, lt.forEach((e) => e()), dt.clear(), e;
		} finally {
			ut--;
		}
		let r = [...dt];
		return dt.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(ct());
	},
	update(e, t) {
		let n = {
			...ct(),
			[e]: structuredClone(t)
		};
		if (!rt(n)) throw Error("Invalid financial snapshot; write blocked.");
		ut || ft(n), at = n;
	},
	resetCacheForTests() {
		at = void 0, ot = !1;
	}
};
y("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => k.read(),
	restore: (e) => {
		at = e;
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var pt = /* @__PURE__ */ new Set(), mt = k.read().journals;
k.onRollback(() => {
	mt = k.read().journals;
});
function ht() {
	pt.forEach((e) => k.notify(e));
}
function gt(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function _t(e) {
	return e?.trim() || void 0;
}
function vt(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function yt(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = mt.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function bt(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function xt(e) {
	if (vt(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = O.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = gt(r.debit), o = gt(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = gt(t + a), n = gt(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function St(e) {
	return e.lines.map((e, t) => {
		let n = O.requireById(e.accountId);
		return {
			id: bt(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: _t(e.description),
			debit: gt(e.debit),
			credit: gt(e.credit)
		};
	});
}
function Ct(e, t) {
	return mt.find((n) => n.sourceType === e && n.sourceId === t && !n.reversedJournalEntryId);
}
var A = {
	subscribe(e) {
		return pt.add(e), () => {
			pt.delete(e);
		};
	},
	getSnapshot() {
		return mt;
	},
	getAll() {
		return mt;
	},
	getById(e) {
		return mt.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return mt.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: Ct,
	post(e) {
		qe(e.journalDate), Ie(e.journalDate, e.lines.map((e) => e.accountId));
		let t = xt(e), n = _t(e.sourceId);
		if (n) {
			let t = Ct(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: bt("je"),
			journalNumber: yt(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: _t(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: St(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...mt];
		return k.update("journals", a), mt = a, ht(), i;
	},
	reverse(e) {
		qe(e.reversalDate);
		let t = mt.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (Le(t.id), t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (vt(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
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
		}, i = xt(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: bt("je"),
			journalNumber: yt(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: St(r),
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
		}, c = [o, ...mt.map((e) => e.id === t.id ? s : e)];
		return k.update("journals", c), mt = c, ht(), o;
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
	snapshot: () => ({ journalEntries: mt }),
	restore: (e) => {
		mt = e.journalEntries;
	},
	publish: () => pt.forEach((e) => e())
});
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var wt = "htt.mock.banking.accounts.v1";
function Tt(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var Et = /* @__PURE__ */ new Set(), Dt = "2026-10-08T00:00:00.000Z", Ot = [{
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
	createdAt: Dt,
	updatedAt: Dt
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
	createdAt: Dt,
	updatedAt: Dt
}], kt = Ze(wt, Tt);
kt.status === "ok" && kt.data.every((e) => {
	let t = O.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (Ot = kt.data);
function At() {
	Et.forEach((e) => e());
}
function jt(e) {
	let t = O.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of Ot) jt(e);
var Mt = {
	subscribe(e) {
		return Et.add(e), () => {
			Et.delete(e);
		};
	},
	getSnapshot() {
		return Ot;
	},
	getAll() {
		return Ot;
	},
	getById(e) {
		return Ot.find((t) => t.id === e);
	},
	getByGlAccountId(e) {
		return Ot.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = Ot.find((t) => t.id === e);
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
		if (S(r.openingBalanceDate, "Opening date"), Ot[0] && r.currency !== Ot[0].currency) throw Error("This profile uses one base currency; foreign-currency bank accounts are not supported.");
		let i = Ot.find((e) => e.id === r.id);
		if (i && i.updatedAt !== n) throw Error("Bank account changed; reload before editing.");
		if (!i && r.id) throw Error("Bank account was not found.");
		if (Ot.some((e) => e.id !== i?.id && e.glAccountId === r.glAccountId)) throw Error("Each bank account needs its own GL account.");
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
		return jt(l), Ot = [...Ot.filter((e) => e.id !== l.id), l], At(), l;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ot = Ot.map((t) => t.id === e ? r : t), $e(wt) && Qe(wt, Ot), At(), r;
	}
};
y("bankAccounts", {
	repository: Mt,
	read: "banking.read",
	commands: {
		if: null,
		validateBankAccount: null,
		setActive: "banking.write",
		save: "banking.write"
	},
	snapshot: () => ({ bankAccounts: Ot }),
	restore: (e) => {
		Ot = e.bankAccounts;
	},
	publish: () => Et.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/financialOperationJournal.ts
var Nt = "htt:financial-operations:v1", Pt = [
	"CUSTOMER_PAYMENT",
	"PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
], Ft = [
	"PENDING",
	"COMPLETED",
	"MANUAL_REVIEW"
], It = (e) => Array.isArray(e) && e.every((e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.operationId == "string" && t.operationId.length > 0 && Pt.includes(String(t.kind)) && typeof t.fingerprint == "string" && t.fingerprint.length > 0 && Ft.includes(String(t.state)) && typeof t.createdAt == "string" && typeof t.updatedAt == "string" && (t.resultId === void 0 || typeof t.resultId == "string") && (t.note === void 0 || typeof t.note == "string") && (t.reviewHistory === void 0 || Array.isArray(t.reviewHistory) && t.reviewHistory.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		return typeof t.reference == "string" && t.reference.length >= 3 && typeof t.operator == "string" && t.operator.length >= 2 && typeof t.recordedAt == "string" && typeof t.summary == "string" && t.summary.length >= 3;
	}));
}) && new Set(e.map((e) => e.operationId)).size === e.length;
function Lt() {
	let e = Ze(Nt, It);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function Rt(e) {
	if (!$e(Nt) || !Qe(Nt, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var j = {
	list() {
		return Lt().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !Pt.includes(t)) throw Error("Invalid operation identity.");
		let r = Lt(), i = r.find((t) => t.operationId === e);
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
		return Rt([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = Lt(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Rt(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = Lt(), r = n.find((t) => t.operationId === e);
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
		return Rt(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = Lt(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Rt(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = Lt(), a = i.find((t) => t.operationId === e);
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
		return Rt(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = Lt(), a = i.find((t) => t.operationId === e);
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
		return Rt(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	getUnresolved() {
		return Lt().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
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
var zt = /* @__PURE__ */ new Map(), Bt = "htt.purchasePosting.operations.v1";
function Vt() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function Ht() {
	let e = Vt();
	if (e) try {
		e.setItem(Bt, JSON.stringify([...zt.values()]));
	} catch {}
}
function Ut() {
	let e = Vt();
	if (e) try {
		let t = JSON.parse(e.getItem(Bt) ?? "[]");
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
			zt.set(t.key, {
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
Ut();
var Wt = /* @__PURE__ */ new Set(), Gt = /* @__PURE__ */ new Map(), Kt = /* @__PURE__ */ new Map(), qt;
function Jt() {
	Ht(), Wt.forEach((e) => e());
}
var M = {
	injectFailureBeforeStep(e, t, n = 1) {
		Kt.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		Kt.clear();
	},
	registerRecovery(e, t) {
		if (!zt.has(e)) throw Error(`Unknown posting operation: ${e}`);
		Gt.set(e, t);
	},
	runStep(e, t, n) {
		let r = zt.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = Kt.get(i) ?? 0;
		if (a > 0) throw Kt.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return Gt.has(e);
	},
	recover(e) {
		let t = zt.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = Gt.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (qt === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		qt = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			qt = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = zt.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...zt.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return Wt.add(e), () => {
			Wt.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if (zt.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return zt.set(n, r), Jt(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = zt.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		zt.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), Jt();
	},
	completeStep(e, t) {
		let n = zt.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (zt.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), Jt());
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
		zt.clear(), Gt.clear();
		for (let t of e) zt.set(t.key, t);
	},
	publish: () => Wt.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var Yt = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Xt(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${Yt.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function N() {
	Xt(j.list(), M.getAll());
}
//#endregion
//#region node_modules/.pnpm/react@19.3.0/node_modules/react/cjs/react.production.js
var Zt = /* @__PURE__ */ be(((e) => {
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
	function fe(e) {
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
	function x(e, r, i, a, o) {
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
				case d: return c = e._init, x(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + de(e, 0) : a, _(o) ? (i = "", c != null && (i = c.replace(ue, "$&/") + "/"), x(o, r, i, "", function(e) {
			return e;
		})) : o != null && (ce(o) && (o = b(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(ue, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (_(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + de(a, u), c += x(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + de(a, u++), c += x(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return x(fe(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function pe(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return x(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function me(e) {
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
	var S = typeof reportError == "function" ? reportError : function(e) {
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
	function he(e) {
		var t = v.T, n = {};
		n.types = t === null ? null : t.types, v.T = n;
		try {
			var r = e(), i = v.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(oe, S);
		} catch (e) {
			S(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), v.T = t;
		}
	}
	function ge(e) {
		var t = v.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else he(ge.bind(null, e));
	}
	var _e = {
		map: pe,
		forEach: function(e, t, n) {
			pe(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return pe(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return pe(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!ce(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = _e, e.Component = ne, e.Fragment = r, e.Profiler = a, e.PureComponent = ie, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = v, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return v.H.useMemoCache(e);
		}
	}, e.addTransitionType = ge, e.cache = function(e) {
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
			_init: me
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = he, e.unstable_useCacheRefresh = function() {
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
})), Qt = /* @__PURE__ */ be(((e, t) => {
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
				case ge: return "Fragment";
				case ve: return "Profiler";
				case _e: return "StrictMode";
				case be: return "Suspense";
				case xe: return "SuspenseList";
				case we: return "Activity";
				case Te: return "ViewTransition";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case he: return "Portal";
				case w: return e.displayName || "Context";
				case C: return (e._context.displayName || "Context") + ".Consumer";
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
			if (e === ge) return "<>";
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
				$$typeof: S,
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
			return typeof e == "object" && !!e && e.$$typeof === S;
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
					case S:
					case he:
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
		function fe(e) {
			return 1 < e.length && typeof AggregateError == "function" ? AggregateError(e) : e[0];
		}
		function x(e, t) {
			t !== Ue - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), Ue = t;
		}
		function pe(e, t, n) {
			var r = D.actQueue;
			if (r !== null) {
				if (r.length !== 0) try {
					me(r), de(function() {
						return pe(e, t, n);
					});
					return;
				} catch (e) {
					D.thrownErrors.push(e);
				}
				else D.actQueue = null;
			}
			0 < D.thrownErrors.length ? (r = fe(D.thrownErrors), D.thrownErrors.length = 0, n(r)) : t(e);
		}
		function me(e) {
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
		var S = Symbol.for("react.transitional.element"), he = Symbol.for("react.portal"), ge = Symbol.for("react.fragment"), _e = Symbol.for("react.strict_mode"), ve = Symbol.for("react.profiler"), C = Symbol.for("react.consumer"), w = Symbol.for("react.context"), ye = Symbol.for("react.forward_ref"), be = Symbol.for("react.suspense"), xe = Symbol.for("react.suspense_list"), Se = Symbol.for("react.memo"), Ce = Symbol.for("react.lazy"), we = Symbol.for("react.activity"), Te = Symbol.for("react.view_transition"), Ee = Symbol.iterator, T = {}, De = {
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
		e.Activity = we, e.Children = qe, e.Component = a, e.Fragment = ge, e.Profiler = ve, e.PureComponent = s, e.StrictMode = _e, e.Suspense = be, e.ViewTransition = Te, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = D, e.__COMPILER_RUNTIME = ke, e.act = function(e) {
			var t = D.actQueue, n = Ue;
			Ue++;
			var r = D.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				D.thrownErrors.push(e);
			}
			if (0 < D.thrownErrors.length) throw x(t, n), e = fe(D.thrownErrors), D.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return Ke(function() {
					i || We || (We = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				}), { then: function(e, a) {
					i = !0, o.then(function(i) {
						if (x(t, n), n === 0) {
							try {
								me(r), de(function() {
									return pe(i, e, a);
								});
							} catch (e) {
								D.thrownErrors.push(e);
							}
							if (0 < D.thrownErrors.length) {
								var o = fe(D.thrownErrors);
								D.thrownErrors.length = 0, a(o);
							}
						} else e(i);
					}, function(e) {
						x(t, n), 0 < D.thrownErrors.length ? (e = fe(D.thrownErrors), D.thrownErrors.length = 0, a(e)) : a(e);
					});
				} };
			}
			var s = a;
			if (x(t, n), n === 0 && (me(r), r.length !== 0 && Ke(function() {
				i || We || (We = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), D.actQueue = null), 0 < D.thrownErrors.length) throw e = fe(D.thrownErrors), D.thrownErrors.length = 0, e;
			return { then: function(e, t) {
				i = !0, n === 0 ? (D.actQueue = r, de(function() {
					return pe(s, e, t);
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
				$$typeof: C,
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
			return e.$$typeof === C && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"), t.useContext(e);
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
	t.exports = process.env.NODE_ENV === "production" ? Zt() : Qt();
})))();
var P = (e, t, n = "text", r, i) => ({
	key: e,
	label: t,
	type: n,
	options: r,
	value: i,
	required: !0
}), F = (e, t, n) => P(e, t, "select", n), $t = (e, t, n = "0") => ({
	...P(e, t, "number", void 0, n),
	min: 0,
	step: "0.01"
}), en = (e, t) => P(e, t, "date", void 0, "2026-10-16"), tn = (e, t) => ({
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
}), nn = [];
function rn(e, t, n, r, i, a, o, s, c) {
	nn.push({
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
rn("products", "Products & services", "Inventory & pricing", "/inventory/products", "inventory.read", "Maintain purchasing, selling, stock and packaging information.", [
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
	$t("price", "Standard selling price", "49.50"),
	$t("cost", "Buying cost (sample)", "25"),
	$t("coverage", "m² per pack", "2.2"),
	F("rounding", "Pack rounding", ["Whole packs up", "Allow fractional packs"]),
	$t("reorder", "Reorder point", "10"),
	$t("target", "Target stock", "50"),
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
]), rn("promotions", "Scheduled promotions", "Inventory & pricing", "/inventory/promotions", "inventory.read", "Plan customer and product specials with explicit start and end times.", [
	P("product", "Product / SKU"),
	P("customer", "Customer scope"),
	P("starts", "Starts (local time)", "datetime-local", void 0, "2026-10-16T09:00"),
	P("ends", "Ends (local time)", "datetime-local", void 0, "2026-10-31T17:00"),
	$t("price", "Promotional unit price", "45"),
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
]), rn("tax-codes", "Tax codes", "Accounting", "/accounting/tax-codes", "accounting.read", "Review GST codes, inclusive/exclusive calculation and reporting mappings.", [
	P("code", "Tax code"),
	$t("rate", "Tax rate (%)", "15"),
	F("basis", "Entry basis", ["Exclusive", "Inclusive"]),
	tn("collected", "GST collected account"),
	tn("paid", "GST paid account"),
	P("report", "Return / report mapping")
], {
	name: "Standard GST",
	code: "GST15",
	report: "Output / input GST"
}, [
	"Overview",
	"Calculation preview",
	"Reporting"
]), rn("linked-accounts", "Linked accounts", "Accounting", "/accounting/linked-accounts", "accounting.read", "Preview default general ledger mappings used by each business process.", [
	F("process", "Business process", [
		"Sales",
		"Purchases",
		"Payroll"
	]),
	tn("receivable", "Receivables / payables control"),
	tn("income", "Income / expense account"),
	tn("inventory", "Inventory account"),
	tn("cogs", "Cost of goods sold"),
	tn("gst", "GST control account"),
	tn("payroll", "Payroll clearing account")
], {
	name: "Sales posting defaults",
	process: "Sales"
}, ["Overview", "Posting example"]), rn("jobs", "Jobs & projects", "Accounting", "/accounting/jobs", "accounting.read", "Track project budgets, allocate posted revenue and costs, and compare actual profitability.", [
	P("code", "Job code"),
	P("customer", "Customer"),
	P("owner", "Project owner"),
	en("starts", "Start date"),
	en("ends", "End date"),
	$t("budget", "Revenue budget", "10000"),
	$t("costBudget", "Cost budget", "6000")
], {
	name: "Sample showroom installation",
	code: "JOB-SAMPLE",
	customer: "Sample Flooring Ltd",
	owner: "Sample team"
}, [
	"Overview",
	"Transactions",
	"Profitability"
]), rn("bank-accounts", "Bank account setup", "Banking", "/banking/setup/accounts", "banking.read", "Preview bank account details, ledger links and feed preferences.", [
	P("number", "Account number (sample only)"),
	P("bank", "Bank name"),
	F("currency", "Currency", ["NZD", "AUD"]),
	tn("ledger", "Linked bank GL account"),
	F("feed", "Feed provider", ["Manual import", "Provider to be configured"]),
	en("feedStart", "Feed start date")
], {
	name: "Sample operating account",
	number: "00-0000-0000000-00",
	bank: "Sample Bank"
}, [
	"Overview",
	"Feed settings",
	"Import history"
]), rn("bank-rules", "Bank rules", "Banking", "/banking/rules", "banking.read", "Define matching conditions and resulting categorisation before testing a sample.", [
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
	tn("account", "Categorise to account"),
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
]), rn("payment-batches", "Electronic payment batches", "Banking", "/banking/payment-batches", "banking.read", "Select sample supplier or wage payments, review approval and bank export layout.", [
	F("kind", "Batch type", ["Supplier payments", "Wages"]),
	en("payDate", "Payment date"),
	P("bank", "Paying account"),
	P("reference", "Bank reference"),
	F("format", "Export format", ["NZ bank CSV preview", "ABA layout preview"]),
	$t("total", "Batch total", "1100")
], {
	name: "Sample supplier batch",
	bank: "Sample operating account",
	reference: "OCT-SAMPLE"
}, [
	"Overview",
	"Payments",
	"Approval & export"
]), rn("pay-items", "Pay items", "Payroll", "/payroll/pay-items", "payroll.read", "Configure sample earnings, allowances, deductions, leave, tax and employer contributions.", [
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
	$t("rate", "Rate / amount", "30"),
	F("taxable", "Tax treatment", [
		"Taxable",
		"Non-taxable",
		"Before tax deduction",
		"After tax deduction"
	]),
	tn("expense", "Expense account"),
	tn("liability", "Liability / clearing account")
], {
	name: "Ordinary hours",
	code: "ORD",
	category: "Earnings"
}, [
	"Overview",
	"Employee assignments",
	"Posting preview"
]), rn("filing", "Payroll filing", "Payroll", "/payroll/filing", "payroll.read", "Review a sample NZ Payday Filing submission and its response / correction workflow.", [
	P("payrun", "Pay run reference"),
	en("payDate", "Pay date"),
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
]), rn("recurring", "Recurring transactions", "Automation & tasks", "/automation/recurring", "inventory.read", "Generate due invoice and expense drafts from saved local templates with ordered schedules and retry protection.", [
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
	en("next", "Next generation date"),
	en("ends", "Schedule end date"),
	$t("total", "Template amount", "220"),
	F("mode", "Generation mode", ["Draft for review", "Require approval"])
], {
	name: "Monthly sample maintenance",
	contact: "Sample Flooring Ltd"
}, [
	"Overview",
	"Template lines",
	"Run history"
]), rn("tasks", "Tasks & action centre", "Automation & tasks", "/tasks", "sales.read", "Maintain local tasks, owners and due dates with audited completion and reopening.", [
	P("customer", "Customer / branch"),
	P("owner", "Assigned to"),
	en("due", "Due date"),
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
]), rn("visits", "Sales visits & activity", "Automation & tasks", "/sales/activity", "sales.read", "Plan local sales visits, record trusted check-in/out, outcomes and linked follow-up tasks.", [
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
]), rn("draft-review", "Customer & contact review", "Automation & tasks", "/contacts/review", "sales.read", "Review local customer, branch and contact drafts, compare duplicates and approve or link real records.", [
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
]), rn("templates", "PDF & email templates", "Documents & imports", "/documents/templates", "accounting.read", "Design sample invoice, quote, PO, statement and remittance layouts and email copy.", [
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
]), rn("custom-reports", "Saved & favourite reports", "Reports", "/reports/saved", "accounting.read", "Save explicit filters and ordered columns, run local data and export complete results.", [
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
}, ["Overview", "Report preview"]), rn("report-packs", "Report packs", "Reports", "/reports/packs", "accounting.read", "Generate combined financial reports from current local books, with ordered sections and printable exports.", [
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
var an = nn;
[...new Set(nn.map((e) => e.group))], F("gst", "GST registration", ["Registered", "Not registered"]), F("filing", "GST filing cycle", [
	"Two monthly",
	"Monthly",
	"Six monthly"
]), $t("quoteNext", "Next quote number", "1001"), $t("orderNext", "Next order number", "1001"), $t("invoiceNext", "Next invoice number", "1001"), $t("creditNext", "Next credit number", "1001"), F("terms", "Default terms", [
	"20th of following month",
	"Due on receipt",
	"30 days"
]), F("template", "Default template", ["Standard invoice", "Trade invoice"]), F("reminders", "Overdue reminders", ["Manual only", "7 and 14 days overdue"]), F("onlinePayment", "Online payment option", ["Disabled", "Configuration preview"]), $t("next", "Next PO number", "1001"), F("terms", "Default payment terms", [
	"20th of following month",
	"30 days",
	"Due on receipt"
]), tn("expense", "Default expense account"), F("receipt", "Bill matching", ["Require receipt match", "Allow expense bills"]), F("remittance", "Remittance preference", ["Preview before sending", "Manual"]), F("cycle", "Pay cycle", [
	"Weekly",
	"Fortnightly",
	"Monthly"
]), F("day", "Pay day", [
	"Wednesday",
	"Thursday",
	"Friday"
]), tn("wages", "Wages expense account"), tn("clearing", "Payroll clearing account"), F("bank", "Paying bank", ["Sample operating account"]), F("filing", "Filing region", ["New Zealand · Payday Filing", "Australia · STP preview"]), F("basis", "Default basis", ["Accrual", "Cash"]), F("currency", "Display currency", ["NZD", "AUD"]), F("precision", "Decimal places", ["2", "0"]), F("negative", "Negative number style", ["(1,234.56)", "-1,234.56"]), F("comparative", "Comparative period", [
	"Previous period",
	"Previous year",
	"None"
]);
//#endregion
//#region src/features/page-previews/previewModel.ts
function on(e, t) {
	return Object.fromEntries(e.map((e) => [e.key, t?.[e.key] ?? e.value ?? e.options?.[0] ?? ""]));
}
Object.fromEntries(an.map((e) => [e.id, [{
	...on(e.fields),
	...e.example,
	id: "sample-1",
	name: e.example.name,
	status: "Draft"
}]]));
function sn(e) {
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
var cn = [
	"Customer",
	"Branch",
	"Contact"
], ln = [
	"Manual",
	"Sales draft",
	"Selected contact",
	"Card transcription"
], un = {
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
}, dn = ee(a(), g([
	a().max(2e3),
	w().finite(),
	o()
]));
function fn(e, t) {
	let n = dn.parse(t), r = un[e];
	if (Object.keys(n).some((e) => !Object.hasOwn(r, e))) throw Error("Unsupported draft field. Use the documented fields for this draft type.");
	for (let [e, t] of Object.entries(n)) if (typeof t != typeof r[e]) throw Error(`Invalid value type for ${e}.`);
	return {
		...r,
		...n
	};
}
var pn = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), mn = (e) => String(e ?? "").trim().toLowerCase(), hn = (e) => String(e ?? "").replace(/\D/g, ""), gn = (e, t, n = pn) => !!n(e) && n(e) === n(t);
function _n(e, t) {
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
		(gn(r.businessName, e.businessName) || gn(r.businessName, e.tradingName) || gn(r.tradingName, e.businessName) || gn(r.tradingName, e.tradingName)) && t.push("Business/trading name"), gn(r.email, e.email, mn) && t.push("Email"), gn(r.phone, e.phone, hn) && t.push("Phone"), gn(r.abn, e.abn) && t.push("Identifier"), i(e.id, e.id, e.businessName, [
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
			gn(r.name, e.name) && t.push("Branch name"), String(r.addressLine1).trim() && gn([
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
			].join(" ")) && t.push("Address"), gn(r.phone, e.phone, hn) && t.push("Phone"), i(e.id, n.id, e.name, [
				e.addressLine1,
				e.suburb,
				e.postcode
			].filter(Boolean).join(" · "), t);
		}
		else for (let e of n.contacts) {
			let t = [];
			gn([r.firstName, r.lastName].join(" "), [e.firstName, e.lastName].join(" ")) && t.push("Contact name"), gn(r.email, e.email, mn) && t.push("Email"), (gn(r.phone, e.phone, hn) || gn(r.phone, e.mobile, hn) || gn(r.mobile, e.phone, hn) || gn(r.mobile, e.mobile, hn)) && t.push("Phone/mobile"), i(e.id, n.id, `${e.firstName} ${e.lastName}`, [
				e.email,
				e.phone,
				e.mobile
			].filter(Boolean).join(" · "), t);
		}
	}
	return n.sort((e, t) => t.reasons.length - e.reasons.length || e.name.localeCompare(t.name) || e.id.localeCompare(t.id));
}
function vn(e) {
	return JSON.stringify(e);
}
//#endregion
//#region src/features/data-transfer/transferModel.ts
var yn = [
	"Customers",
	"Suppliers",
	"Customer branches",
	"Customer contacts",
	"Products"
], bn = ["Create", "Update by ID"], xn = "HTT-CSV-1", Sn = {
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
}, Cn = {
	Customers: un.Customer,
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
		...un.Branch
	},
	"Customer contacts": {
		customerId: "",
		...un.Contact
	},
	Products: Sn
}, wn = (e) => [
	"_format",
	"id",
	"recordToken",
	"externalId",
	...Object.keys(Cn[e])
], Tn = {
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
}, En = t({
	dataset: f(yn),
	mode: f(bn),
	fileName: a().trim().min(1).max(200),
	text: a().max(1e6),
	mapping: ee(a(), w().int().nonnegative()).optional()
}).strict();
function Dn(e) {
	if (e.text.includes("\0")) throw Error("CSV source must be text without NUL characters.");
	let t = sn(e.text.replace(/^\uFEFF/, ""));
	if (t.length < 2 || t.length > 501) throw Error("Choose a CSV header and 1–500 data records.");
	let n = t[0].map((e) => e.trim());
	if (n.length > 64 || n.some((e) => !e || e.length > 120) || new Set(n.map((e) => e.toLowerCase())).size !== n.length) throw Error("CSV requires 1–64 distinct, nonempty column names of at most 120 characters.");
	if (t.slice(1).some((e) => e.length !== n.length || e.some((e) => e.length > 1e5))) throw Error("Each CSV record must match the header width; cells may not exceed 100,000 characters.");
	let r = wn(e.dataset), i = e.mapping ?? Object.fromEntries(r.flatMap((e) => {
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
function On(e) {
	return e.map((e) => e.map((e) => "\"" + (/^[=+@\-'\t\r]/.test(e) ? "'" + e : e).replaceAll("\"", "\"\"") + "\"").join(",")).join("\r\n");
}
//#endregion
//#region src/features/payroll/data/payrollModel.ts
var I = a().trim().min(1).max(200), kn = a().refine((e) => /^\d{4}-\d{2}-\d{2}$/.test(e) && !isNaN(Date.parse(e)) && new Date(e).toISOString().slice(0, 10) === e, "Use a valid date."), An = a().trim().min(3).max(2e3), jn = w().finite().min(0).max(1e9).refine((e) => Math.abs(e * 100 - Math.round(e * 100)) < 1e-5, "Use whole cents."), Mn = w().finite().min(0).max(1e5).refine((e) => Math.abs(e * 1e4 - Math.round(e * 1e4)) < 1e-6, "Use at most four decimal places."), Nn = t({
	actorId: I,
	at: xe(),
	action: I,
	reason: An,
	revision: w().int().positive()
}).strict(), Pn = {
	id: I,
	revision: w().int().positive(),
	history: r(Nn).min(1)
}, Fn = t({
	code: a().trim().min(1).max(40),
	name: I,
	position: a().trim().max(200),
	email: l().or(p("")),
	startDate: kn,
	endDate: kn.or(p("")),
	status: f(["Active", "Inactive"]),
	basis: f(["Hourly", "Salary"]),
	rate: jn,
	earningItemId: I,
	taxScale: f(Se).default("Manual"),
	standardTaxConfirmed: o().default(!1),
	superFund: a().trim().max(200).default(""),
	superMemberId: a().trim().max(100).default(""),
	bankAccount: a().trim().max(100),
	taxIdentifier: a().trim().max(100),
	annualOpening: Mn,
	personalOpening: Mn
}).strict(), In = Fn.extend(Pn).strict(), Ln = t({
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
	rate: jn,
	taxable: o(),
	accountId: I,
	liabilityAccountId: a().trim().max(200),
	active: o()
}).strict(), Rn = Ln.extend(Pn).strict(), zn = t({
	netAccountId: I,
	taxItemId: I,
	currency: a().regex(/^[A-Z]{3}$/),
	region: p("Australia"),
	frequency: f(Ce).default("Fortnightly"),
	superItemId: I,
	employerName: I,
	employerIdentifier: a().trim().max(100)
}).strict(), Bn = zn.extend(Pn).strict(), Vn = t({
	employeeId: I,
	itemId: I,
	date: kn,
	hours: Mn.refine((e) => e > 0),
	notes: a().trim().max(1e3)
}).strict(), Hn = Vn.extend({
	...Pn,
	status: f([
		"Draft",
		"Submitted",
		"Approved"
	])
}).strict(), Un = t({
	employeeId: I,
	type: f([
		"Annual",
		"Personal",
		"Unpaid"
	]),
	start: kn,
	end: kn,
	hours: Mn.refine((e) => e > 0),
	notes: a().trim().max(1e3)
}).strict(), Wn = Un.extend({
	...Pn,
	status: f([
		"Pending",
		"Approved",
		"Declined",
		"Cancelled"
	])
}).strict(), Gn = t({
	employeeId: I,
	itemId: I,
	quantity: Mn.refine((e) => e > 0),
	rate: jn
}).strict(), Kn = t({
	name: I,
	start: kn,
	end: kn,
	payDate: kn,
	employeeInputs: r(t({
		employeeId: I,
		withholding: jn,
		additionalWithholding: jn.default(0),
		superMethod: f(["Reviewed amount", "12% reviewed QE"]).default("Reviewed amount"),
		superBase: jn.default(0),
		superAmount: jn.default(0),
		salaryOverride: jn.optional(),
		annualAccrual: Mn,
		personalAccrual: Mn
	}).strict()).min(1).max(500),
	adjustments: r(Gn).max(2e3),
	taxReviewed: o(),
	reviewReference: a().trim().max(500)
}).strict(), qn = t({
	item: Rn,
	quantity: Mn,
	rate: jn,
	amount: jn,
	source: a().max(200)
}).strict(), Jn = t({
	gross: jn,
	taxable: jn,
	deductions: jn,
	net: jn,
	employerCost: jn,
	withholding: jn
}).strict(), Yn = t({
	employee: In,
	lines: r(qn).min(1),
	timeIds: r(I),
	leaveIds: r(I),
	annualAccrual: Mn,
	personalAccrual: Mn,
	totals: Jn
}).strict(), Xn = Kn.extend({
	...Pn,
	status: f([
		"Draft",
		"Approved",
		"Posted",
		"Reversed",
		"Cancelled"
	]),
	slips: r(Yn).min(1),
	totals: Jn,
	settings: Bn,
	sourceToken: I,
	journalId: I.optional(),
	reversalJournalId: I.optional(),
	reversalDate: kn.optional()
}).strict(), Zn = t({
	...Pn,
	operationId: I,
	runId: I,
	accountId: I,
	bankAccountId: I,
	date: kn,
	amount: jn.refine((e) => e > 0),
	reference: a().trim().max(200),
	status: f(["Posted", "Reversed"]),
	journalId: I,
	reversalJournalId: I.optional(),
	reversalDate: kn.optional()
}).strict(), Qn = t({
	...Pn,
	runId: I,
	status: f([
		"Prepared",
		"External reference recorded",
		"Correction needed"
	]),
	reference: a().trim().max(200),
	notes: a().trim().max(1e3),
	runRevision: w().int().positive()
}).strict(), $n = t({
	employees: r(In),
	items: r(Rn),
	timesheets: r(Hn),
	leave: r(Wn),
	runs: r(Xn),
	payments: r(Zn),
	filings: r(Qn),
	settings: r(Bn).max(1),
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
}).strict(), er = () => ({
	employees: [],
	items: [],
	timesheets: [],
	leave: [],
	runs: [],
	payments: [],
	filings: [],
	settings: [],
	receipts: []
}), tr = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function nr(e) {
	let t = (t) => tr(e.filter(t).reduce((e, t) => e + t.amount, 0)), n = (e) => ["Earnings", "Allowance"].includes(e.item.category), r = t(n), i = t((e) => ["Deduction", "Tax"].includes(e.item.category));
	return Jn.parse({
		gross: r,
		taxable: t((e) => n(e) && e.item.taxable),
		deductions: i,
		net: tr(r - i),
		employerCost: t((e) => e.item.category === "Employer contribution"),
		withholding: t((e) => e.item.category === "Tax")
	});
}
function rr(e) {
	return Jn.parse(Object.fromEntries(Object.keys(Jn.shape).map((t) => [t, tr(e.reduce((e, n) => e + n.totals[t], 0))])));
}
//#endregion
//#region electron/security/payrollRepository.ts
var L = er(), ir = (e) => Array.isArray(e) ? e.map(ir) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, ir(e[t])])) : e, ar = (e) => ye("sha256").update(JSON.stringify(ir(e))).digest("hex"), or = {
	operationId: I,
	reason: An
}, sr = {
	id: I.optional(),
	expectedRevision: w().int().nonnegative()
};
function cr(e = "payroll.manage") {
	return T.require(e);
}
function R(e, t) {
	let n = L[e].find((e) => e.id === t);
	if (!n) throw Error("Payroll record was not found.");
	return n;
}
var lr = (e) => !["Cancelled", "Reversed"].includes(e.status);
function ur(e, t, n) {
	return L.runs.some((r) => r.id !== n && lr(r) && r.slips.some((n) => (e === "timesheets" ? n.timeIds : n.leaveIds).includes(t)));
}
function dr(e, t) {
	return L[e] = [...L[e].filter((e) => e.id !== t.id), t], structuredClone(t);
}
function fr(e, t, n) {
	let r = (e?.revision ?? 0) + 1;
	return {
		id: e?.id ?? crypto.randomUUID(),
		revision: r,
		history: [...e?.history ?? [], {
			actorId: cr("payroll.read").userId,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			action: t,
			reason: n,
			revision: r
		}]
	};
}
function pr(e, t) {
	if ((e?.revision ?? 0) !== t) throw Error("Payroll record changed. Reload before editing.");
}
function mr(e, t, n) {
	let r = ar({
		input: e,
		actorId: cr("payroll.read").userId
	}), i = L.receipts.find((t) => t.operationId === e.operationId);
	if (i) {
		if (i.fingerprint !== r || i.entity !== t) throw Error("Operation ID already has different payroll data.");
		return structuredClone(R(t, i.recordId));
	}
	let a = n();
	return L.receipts.push({
		operationId: e.operationId,
		fingerprint: r,
		input: structuredClone(e),
		actorId: cr("payroll.read").userId,
		entity: t,
		recordId: a.id,
		revision: a.revision
	}), $n.parse(L), a;
}
function hr(e, t, n = !0) {
	let r = O.requireById(e);
	if (r.type !== t || n && !r.active || r.systemRole && (t !== "EXPENSE" || r.systemRole !== "OPERATING_EXPENSE")) throw Error(`Use a dedicated ${t.toLowerCase()} payroll account, not a bank, tax, AR/AP or stock control account.`);
	return r;
}
function gr(e, t = !0) {
	if (hr(e.accountId, [
		"Earnings",
		"Allowance",
		"Employer contribution"
	].includes(e.category) ? "EXPENSE" : "LIABILITY", t), e.category === "Employer contribution") hr(e.liabilityAccountId, "LIABILITY", t);
	else if (e.liabilityAccountId) throw Error("Only employer contributions use a second liability account.");
	if (["Earnings", "Allowance"].includes(e.category) && e.method === "Percentage" || e.category === "Tax" && e.method !== "Fixed") throw Error("Earnings use hourly/fixed values; withholding tax is an explicitly reviewed fixed amount.");
	if (e.method === "Percentage" && e.rate > 100) throw Error("Percentage rates cannot exceed 100.");
}
function _r(e) {
	let t = R("employees", e);
	if (t.status !== "Active") throw Error("Select an active employee.");
	return t;
}
function vr(e, t, n = t) {
	if (t < e.startDate || e.endDate && n > e.endDate) throw Error("Dates must be within the employment period.");
}
function yr(e) {
	let t = _r(e.employeeId);
	vr(t, e.date);
	let n = R("items", e.itemId);
	if (!n.active || n.category !== "Earnings" || t.basis === "Hourly" && n.method !== "Hourly" || t.basis === "Salary" && n.id !== t.earningItemId) throw Error("Select an appropriate employee earnings item.");
	gr(n);
}
function br(e, t) {
	if (vr(_r(e.employeeId), e.start, e.end), e.start > e.end || e.hours > ((Date.parse(e.end) - Date.parse(e.start)) / 864e5 + 1) * 24) throw Error("Leave dates or hours are invalid.");
	if (L.leave.some((n) => n.id !== t && n.employeeId === e.employeeId && ["Pending", "Approved"].includes(n.status) && n.start <= e.end && n.end >= e.start)) throw Error("Leave request dates overlap.");
}
function xr() {
	let e = L.settings[0];
	if (!e) throw Error("Configure payroll settings first.");
	hr(e.netAccountId, "LIABILITY");
	let t = R("items", e.taxItemId);
	if (t.category !== "Tax" || !t.active) throw Error("Select an active fixed withholding item.");
	if (gr(t), e.netAccountId === t.accountId) throw Error("Net wages and withholding require separate liability accounts.");
	let n = R("items", e.superItemId);
	if (n.category !== "Employer contribution" || n.method !== "Fixed" || !n.active) throw Error("Use an active fixed super contribution item.");
	if (gr(n), e.currency !== "AUD" || e.currency !== _().currency) throw Error("Payroll currency must match the business currency.");
	return e;
}
function Sr(e, t) {
	let n = R("employees", e), r = n.annualOpening, i = n.personalOpening, a = /* @__PURE__ */ new Set();
	for (let n of L.runs.filter((e) => e.status === "Posted" && e.id !== t)) for (let t of n.slips.filter((t) => t.employee.id === e)) {
		r += t.annualAccrual, i += t.personalAccrual;
		for (let e of t.leaveIds) {
			let t = R("leave", e);
			a.add(e), t.type === "Annual" && (r -= t.hours), t.type === "Personal" && (i -= t.hours);
		}
	}
	let o = L.leave.filter((t) => t.employeeId === e && t.status === "Approved" && !a.has(t.id));
	return {
		annual: Math.round(r * 1e4) / 1e4,
		personal: Math.round(i * 1e4) / 1e4,
		reservedAnnual: o.filter((e) => e.type === "Annual").reduce((e, t) => e + t.hours, 0),
		reservedPersonal: o.filter((e) => e.type === "Personal").reduce((e, t) => e + t.hours, 0)
	};
}
function Cr(e, t) {
	let n = Sr(e, t);
	if (n.annual - n.reservedAnnual < -1e-5 || n.personal - n.reservedPersonal < -1e-5) throw Error("Approved leave exceeds the available recorded hours.");
}
var wr = () => ar({
	employees: L.employees,
	items: L.items,
	timesheets: L.timesheets,
	leave: L.leave,
	settings: L.settings
});
function Tr(e, t) {
	if (e.start > e.end || e.payDate < e.end) throw Error("Pay date must follow a valid pay period.");
	let n = xr(), r = /* @__PURE__ */ new Set(), i = [];
	for (let a of e.employeeInputs) {
		if (r.has(a.employeeId)) throw Error("Include each employee only once.");
		r.add(a.employeeId);
		let o = _r(a.employeeId);
		if (o.startDate > e.end || o.endDate && o.endDate < e.start) throw Error("Employment does not overlap this pay period.");
		if (o.basis === "Salary" && (o.startDate > e.start || o.endDate && o.endDate < e.end) && a.salaryOverride === void 0) throw Error("Partial-period salary requires a reviewed salary override.");
		if (L.runs.some((n) => n.id !== t && lr(n) && n.start <= e.end && n.end >= e.start && n.slips.some((e) => e.employee.id === o.id))) throw Error("Employee already has an overlapping pay run. Cancel or reverse it before replacing it.");
		let s = R("items", o.earningItemId);
		if (!s.active || s.category !== "Earnings" || s.method !== (o.basis === "Hourly" ? "Hourly" : "Fixed")) throw Error("Employee earning item does not match the pay basis.");
		gr(s);
		let c = L.timesheets.filter((t) => t.employeeId === o.id && t.status === "Approved" && t.date >= e.start && t.date <= e.end), l = L.leave.filter((t) => t.employeeId === o.id && t.status === "Approved" && t.start <= e.end && t.end >= e.start);
		if (l.some((t) => t.start < e.start || t.end > e.end)) throw Error("Split leave spanning pay periods before including it in payroll.");
		for (let e of c) yr(e);
		for (let e of l) br(e, e.id);
		if (c.some((e) => ur("timesheets", e.id, t)) || l.some((e) => ur("leave", e.id, t))) throw Error("Hours or leave are already reserved by another pay run.");
		if (c.some((e) => l.some((t) => e.date >= t.start && e.date <= t.end))) throw Error("Approved timesheet and leave dates overlap; correct them before payroll.");
		if (o.basis === "Salary" && l.some((e) => e.type === "Unpaid") && a.salaryOverride === void 0) throw Error("Salary with unpaid leave requires an explicitly reviewed salary override.");
		if (o.basis === "Hourly" && a.salaryOverride !== void 0) throw Error("Hourly employees cannot use a salary override.");
		let u = [], d = (e, t, n, r) => {
			if (gr(e), !e.active) throw Error("Inactive pay item.");
			let i = tr(t * n);
			jn.parse(i), u.push({
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
			let t = R("items", e.itemId);
			if (t.category !== "Earnings" || t.method !== "Hourly") throw Error("Timesheet must use hourly earnings.");
			d(t, e.hours, t.id === s.id ? o.rate : t.rate, "Time:" + e.id);
		}
		if (o.basis === "Hourly") for (let e of l.filter((e) => e.type !== "Unpaid")) d(s, e.hours, o.rate, "Leave:" + e.id);
		let f = e.adjustments.filter((e) => e.employeeId === o.id), p = f.filter((e) => R("items", e.itemId).method !== "Percentage");
		for (let e of p) {
			let t = R("items", e.itemId);
			if (t.id === n.superItemId) throw Error("Use the employee super guarantee fields for the standard contribution.");
			if (t.category === "Tax") throw Error("Use the explicit employee withholding field for tax.");
			if (t.method === "Fixed" && e.quantity !== 1) throw Error("Fixed pay items require quantity 1.");
			d(t, e.quantity, e.rate, "Adjustment");
		}
		let m = tr(u.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + t.amount, 0));
		if (m <= 0) throw Error("Each employee needs positive gross earnings.");
		for (let e of f.filter((e) => R("items", e.itemId).method === "Percentage")) {
			if (e.quantity !== 1 || e.rate > 100) throw Error("Percentage items require quantity 1 and rate 0–100.");
			d(R("items", e.itemId), 1, tr(m * e.rate / 100), "Adjustment"), u[u.length - 1].quantity = 1, u[u.length - 1].rate = e.rate;
		}
		let h = tr(u.filter((e) => ["Earnings", "Allowance"].includes(e.item.category) && e.item.taxable).reduce((e, t) => e + t.amount, 0)), g = a.withholding;
		if (o.taxScale !== "Manual") {
			if (!o.standardTaxConfirmed) throw Error("Confirm the standard PAYG case or use reviewed manual withholding.");
			if (!o.taxScale.startsWith("4-") && !/^\d{8,9}$/.test(o.taxIdentifier.replace(/\s/g, ""))) throw Error("Record a provided eight- or nine-digit TFN for the selected scale.");
			if (a.withholding !== 0) throw Error("Clear manual withholding for an automatic PAYG employee.");
			g = Te(h, o.taxScale, n.frequency, e.payDate);
		}
		if (g = tr(g + a.additionalWithholding), d(R("items", n.taxItemId), 1, g, o.taxScale === "Manual" ? "Reviewed PAYG" : "ATO 2026–27 scale " + o.taxScale), a.superMethod === "12% reviewed QE" && (e.payDate < "2026-07-01" || e.payDate > "2027-06-30" || a.superBase > m)) throw Error("Reviewed qualifying earnings must not exceed gross and the 12% helper is limited to 2026–27. Use a reviewed super amount for exceptions.");
		let ee = a.superMethod === "12% reviewed QE" ? tr(a.superBase * .12) : a.superAmount;
		d(R("items", n.superItemId), 1, ee, a.superMethod === "12% reviewed QE" ? "SG 12% reviewed QE" : "Reviewed SG amount");
		let te = nr(u);
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
		totals: rr(i),
		settings: structuredClone(n),
		sourceToken: wr()
	};
}
function Er(e) {
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
function Dr(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of Er(e).filter((e) => e.credit)) t.set(n.accountId, tr((t.get(n.accountId) ?? 0) + n.credit));
	return [...t].map(([t, n]) => ({
		accountId: t,
		amount: n,
		paid: tr(L.payments.filter((n) => n.runId === e.id && n.accountId === t && n.status === "Posted").reduce((e, t) => e + t.amount, 0))
	}));
}
y("payroll", {
	repository: {
		balances(e) {
			return cr("payroll.read"), Sr(I.parse(e));
		},
		obligations(e) {
			return cr("payroll.read"), Dr(R("runs", I.parse(e)));
		},
		setupDefaults(e) {
			cr(), T.require("accounting.post");
			let n = t(or).strict().parse(e);
			return mr(n, "settings", () => {
				if (L.settings.length) throw Error("Payroll is already configured.");
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
						...fr(void 0, "Created", n.reason),
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
					return L.items.push(s), s;
				};
				c("ORD", "Ordinary hours", "Earnings", "Hourly", t), c("SAL", "Salary per run", "Earnings", "Fixed", t);
				let l = c("TAX", "Reviewed withholding", "Tax", "Fixed", a);
				c("ALLOW", "Allowance", "Allowance", "Fixed", t), c("DEDUCT", "Employee deduction", "Deduction", "Fixed", o);
				let u = c("SG", "Super guarantee", "Employer contribution", "Fixed", r, s);
				return dr("settings", {
					...fr(void 0, "Configured", n.reason),
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
			cr();
			let n = t({
				...or,
				...sr,
				values: Fn
			}).strict().parse(e);
			return mr(n, "employees", () => {
				let e = n.id ? R("employees", n.id) : void 0;
				if (pr(e, n.expectedRevision), L.employees.some((t) => t.id !== e?.id && t.code.toLowerCase() === n.values.code.toLowerCase())) throw Error("Employee code already exists.");
				if (n.values.endDate && n.values.endDate < n.values.startDate) throw Error("Employment end date is before the start date.");
				let t = R("items", n.values.earningItemId);
				if (!t.active || t.category !== "Earnings" || t.method !== (n.values.basis === "Hourly" ? "Hourly" : "Fixed")) throw Error("Select an active earning item matching the pay basis.");
				if (e && L.runs.some((t) => ["Posted", "Reversed"].includes(t.status) && t.slips.some((t) => t.employee.id === e.id)) && (e.annualOpening !== n.values.annualOpening || e.personalOpening !== n.values.personalOpening)) throw Error("Opening leave hours are locked after payroll posting.");
				return dr("employees", {
					...n.values,
					...fr(e, e ? "Edited" : "Created", n.reason)
				});
			});
		},
		saveItem(e) {
			cr();
			let n = t({
				...or,
				...sr,
				values: Ln
			}).strict().parse(e);
			return mr(n, "items", () => {
				let e = n.id ? R("items", n.id) : void 0;
				if (pr(e, n.expectedRevision), L.items.some((t) => t.id !== e?.id && t.code.toLowerCase() === n.values.code.toLowerCase())) throw Error("Pay item code already exists.");
				let t = {
					...n.values,
					...fr(e, e ? "Edited" : "Created", n.reason)
				};
				return gr(t), dr("items", t);
			});
		},
		saveSettings(e) {
			cr();
			let n = t({
				...or,
				expectedRevision: w().int().nonnegative(),
				values: zn
			}).strict().parse(e);
			return mr(n, "settings", () => {
				let e = L.settings[0];
				pr(e, n.expectedRevision), hr(n.values.netAccountId, "LIABILITY");
				let t = R("items", n.values.superItemId);
				if (t.category !== "Employer contribution" || t.method !== "Fixed" || !t.active) throw Error("Select an active fixed super guarantee item.");
				let r = R("items", n.values.taxItemId);
				if (r.category !== "Tax" || !r.active || r.accountId === n.values.netAccountId) throw Error("Use a valid withholding item and a separate net wages account.");
				if (n.values.currency !== "AUD" || n.values.currency !== _().currency) throw Error("Payroll currency must match the business.");
				return dr("settings", {
					...n.values,
					...fr(e, "Settings changed", n.reason)
				});
			});
		},
		saveTime(e) {
			cr();
			let n = t({
				...or,
				...sr,
				values: Vn
			}).strict().parse(e);
			return mr(n, "timesheets", () => {
				let e = n.id ? R("timesheets", n.id) : void 0;
				if (pr(e, n.expectedRevision), e && (e.status !== "Draft" || ur("timesheets", e.id))) throw Error("Only an unreserved draft timesheet can be edited.");
				yr(n.values);
				let t = _r(n.values.employeeId), r = R("items", n.values.itemId);
				if (L.timesheets.filter((r) => r.id !== e?.id && r.employeeId === t.id && r.date === n.values.date).reduce((e, t) => e + t.hours, 0) + n.values.hours > 24) throw Error("Total timesheet hours cannot exceed 24 for one employee/day.");
				if (L.timesheets.some((i) => i.id !== e?.id && i.employeeId === t.id && i.itemId === r.id && i.date === n.values.date)) throw Error("A timesheet already exists for this employee, day and item.");
				return dr("timesheets", {
					...n.values,
					...fr(e, e ? "Edited" : "Created", n.reason),
					status: "Draft"
				});
			});
		},
		changeTime(e) {
			let n = t({
				...or,
				id: I,
				expectedRevision: w().int().positive(),
				action: f([
					"Submit",
					"Approve",
					"Reopen"
				])
			}).strict().parse(e);
			return cr(n.action === "Approve" ? "payroll.approve" : "payroll.manage"), mr(n, "timesheets", () => {
				let e = R("timesheets", n.id);
				if (pr(e, n.expectedRevision), ur("timesheets", e.id)) throw Error("Timesheet is reserved by a pay run.");
				if (n.action === "Submit" && e.status !== "Draft" || n.action === "Approve" && e.status !== "Submitted" || n.action === "Reopen" && e.status === "Draft") throw Error("Invalid timesheet transition.");
				return n.action !== "Reopen" && yr(e), dr("timesheets", {
					...e,
					...fr(e, n.action, n.reason),
					status: n.action === "Submit" ? "Submitted" : n.action === "Approve" ? "Approved" : "Draft"
				});
			});
		},
		saveLeave(e) {
			cr();
			let n = t({
				...or,
				...sr,
				values: Un
			}).strict().parse(e);
			return mr(n, "leave", () => {
				let e = n.id ? R("leave", n.id) : void 0;
				if (pr(e, n.expectedRevision), e && (e.status !== "Pending" || ur("leave", e.id))) throw Error("Only an unreserved pending leave request can be edited.");
				return br(n.values, e?.id), dr("leave", {
					...n.values,
					...fr(e, e ? "Edited" : "Created", n.reason),
					status: "Pending"
				});
			});
		},
		changeLeave(e) {
			let n = t({
				...or,
				id: I,
				expectedRevision: w().int().positive(),
				action: f([
					"Approve",
					"Decline",
					"Cancel",
					"Reopen"
				])
			}).strict().parse(e);
			return cr(n.action === "Approve" || n.action === "Decline" ? "payroll.approve" : "payroll.manage"), mr(n, "leave", () => {
				let e = R("leave", n.id);
				if (pr(e, n.expectedRevision), ur("leave", e.id)) throw Error("Leave is reserved by a pay run.");
				if (["Approve", "Decline"].includes(n.action) && e.status !== "Pending" || n.action === "Cancel" && ["Cancelled", "Declined"].includes(e.status) || n.action === "Reopen" && !["Cancelled", "Declined"].includes(e.status)) throw Error("Invalid leave transition.");
				(n.action === "Approve" || n.action === "Reopen") && br(e, e.id);
				let t = dr("leave", {
					...e,
					...fr(e, n.action, n.reason),
					status: n.action === "Approve" ? "Approved" : n.action === "Decline" ? "Declined" : n.action === "Cancel" ? "Cancelled" : "Pending"
				});
				return t.status === "Approved" && Cr(e.employeeId), t;
			});
		},
		saveRun(e) {
			cr();
			let n = t({
				...or,
				...sr,
				values: Kn
			}).strict().parse(e);
			return mr(n, "runs", () => {
				let e = n.id ? R("runs", n.id) : void 0;
				if (pr(e, n.expectedRevision), e && e.status !== "Draft") throw Error("Only a draft pay run can be recalculated.");
				let t = Tr(n.values, e?.id);
				return dr("runs", {
					...n.values,
					...fr(e, e ? "Recalculated" : "Created", n.reason),
					...t,
					status: "Draft"
				});
			});
		},
		changeRun(e) {
			let n = t({
				...or,
				id: I,
				expectedRevision: w().int().positive(),
				action: f([
					"Approve",
					"Reopen",
					"Cancel",
					"Post",
					"Reverse"
				]),
				date: kn.optional()
			}).strict().parse(e);
			return cr(n.action === "Approve" ? "payroll.approve" : ["Post", "Reverse"].includes(n.action) ? "payroll.post" : "payroll.manage"), mr(n, "runs", () => {
				let e = R("runs", n.id);
				if (pr(e, n.expectedRevision), n.action === "Approve" || n.action === "Post") {
					if (e.status !== (n.action === "Approve" ? "Draft" : "Approved")) throw Error("Invalid pay-run transition.");
					if (!e.taxReviewed || e.reviewReference.trim().length < 3) throw Error("Confirm reviewed withholding and provide its reference.");
					if (e.sourceToken !== wr()) throw Error("Payroll sources changed. Reopen and recalculate the run.");
					if (ar(Tr(Kn.parse(Object.fromEntries(Object.keys(Kn.shape).map((t) => [t, e[t]]))), e.id).slips) !== ar(e.slips)) throw Error("Payroll calculation changed. Recalculate the run.");
				}
				if (n.action === "Approve") return dr("runs", {
					...e,
					...fr(e, "Approved", n.reason),
					status: "Approved"
				});
				if (n.action === "Reopen") {
					if (e.status !== "Approved") throw Error("Only an approved run can be reopened.");
					return dr("runs", {
						...e,
						...fr(e, "Reopened", n.reason),
						status: "Draft",
						taxReviewed: !1
					});
				}
				if (n.action === "Cancel") {
					if (!["Draft", "Approved"].includes(e.status)) throw Error("Only an unposted run can be cancelled.");
					return dr("runs", {
						...e,
						...fr(e, "Cancelled", n.reason),
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
						lines: Er(e)
					}), r = dr("runs", {
						...e,
						...fr(e, "Posted", n.reason),
						status: "Posted",
						journalId: t.id
					});
					return e.slips.forEach((e) => Cr(e.employee.id)), r;
				}
				if (e.status !== "Posted" || !n.date || n.date < e.payDate) throw Error("Reverse a posted run on or after its pay date.");
				if (L.payments.some((t) => t.runId === e.id && t.status === "Posted")) throw Error("Reverse recorded payroll payments before reversing the run.");
				let t = A.reverse({
					journalEntryId: e.journalId,
					reversalDate: n.date,
					reason: n.reason
				}), r = dr("runs", {
					...e,
					...fr(e, "Reversed", n.reason),
					status: "Reversed",
					reversalJournalId: t.id,
					reversalDate: n.date
				});
				e.slips.forEach((e) => Cr(e.employee.id));
				for (let t of L.filings.filter((t) => t.runId === e.id)) dr("filings", {
					...t,
					...fr(t, "Correction needed", n.reason),
					status: "Correction needed"
				});
				return r;
			});
		},
		recordPayment(e) {
			cr("payroll.post"), T.require("banking.write");
			let n = t({
				...or,
				runId: I,
				accountId: I,
				bankAccountId: I,
				date: kn,
				amount: jn.refine((e) => e > 0),
				reference: a().trim().max(200)
			}).strict().parse(e);
			return mr(n, "payments", () => {
				N();
				let e = R("runs", n.runId);
				if (e.status !== "Posted" || n.date < e.payDate) throw Error("Record payment against a posted run on or after pay date.");
				let t = Dr(e).find((e) => e.accountId === n.accountId);
				if (!t || n.amount > tr(t.amount - t.paid)) throw Error("Payment exceeds the outstanding payroll liability.");
				hr(n.accountId, "LIABILITY");
				let r = Mt.requireById(n.bankAccountId), i = O.requireById(r.glAccountId);
				if (!r.active || !i.active || i.type !== "ASSET" || r.currency !== e.settings.currency || n.date < r.openingBalanceDate) throw Error("Use an active bank in the payroll currency with a valid posting date.");
				let a = fr(void 0, "Payment recorded", n.reason), o = A.post({
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
				return dr("payments", {
					...c,
					...a,
					status: "Posted",
					journalId: o.id
				});
			});
		},
		reversePayment(e) {
			cr("payroll.post"), T.require("banking.write");
			let n = t({
				...or,
				id: I,
				expectedRevision: w().int().positive(),
				date: kn
			}).strict().parse(e);
			return mr(n, "payments", () => {
				N();
				let e = R("payments", n.id);
				if (pr(e, n.expectedRevision), e.status !== "Posted" || n.date < e.date) throw Error("Reverse a posted payment on or after its date.");
				Fe("PAYROLL_PAYMENT", e.id);
				let t = A.reverse({
					journalEntryId: e.journalId,
					reversalDate: n.date,
					reason: n.reason
				});
				return dr("payments", {
					...e,
					...fr(e, "Payment reversed", n.reason),
					status: "Reversed",
					reversalJournalId: t.id,
					reversalDate: n.date
				});
			});
		},
		recordFiling(e) {
			cr();
			let n = t({
				...or,
				runId: I,
				expectedRevision: w().int().nonnegative(),
				reference: a().trim().max(200),
				notes: a().trim().max(1e3)
			}).strict().parse(e);
			return mr(n, "filings", () => {
				let e = R("runs", n.runId);
				if (e.status !== "Posted") throw Error("Prepare filing review only for a posted run.");
				let t = L.filings.find((t) => t.runId === e.id);
				return pr(t, n.expectedRevision), dr("filings", {
					...fr(t, "Filing review recorded", n.reason),
					runId: e.id,
					runRevision: e.revision,
					reference: n.reference,
					notes: n.notes,
					status: n.reference ? "External reference recorded" : "Prepared"
				});
			});
		},
		exportSlip(e) {
			cr("payroll.read");
			let n = t({
				runId: I,
				employeeId: I
			}).strict().parse(e), r = R("runs", n.runId), i = r.slips.find((e) => e.employee.id === n.employeeId);
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
			cr("payroll.read");
			let t = R("runs", I.parse(e)), n = [[
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
				String(tr(e.totals.deductions - e.totals.withholding)),
				String(e.totals.net),
				String(e.totals.employerCost),
				t.reviewReference
			])];
			return {
				name: "Payroll-review-" + t.id + ".csv",
				csv: On(n)
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
	snapshot: () => L,
	restore: (e) => {
		L = e;
	},
	publish: () => {},
	validate: (e, t) => {
		let n = $n.parse(e), r = t, i = r.accounts.accounts, a = r.journals.journalEntries, o = r.bankAccounts.bankAccounts, s = (e, t) => {
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
				t.set(n.accountId, [tr(e[0] + n.debit), tr(e[1] + n.credit)]);
			}
			return [...t].filter(([, e]) => e[0] || e[1]).sort(([e], [t]) => e.localeCompare(t));
		};
		function d(e, t, n, r, i, o, s, c) {
			let l = a.find((t) => t.id === e);
			if (!l || l.sourceType !== t || l.sourceId !== n || l.journalDate !== r || ar(u(l.lines)) !== ar(u(i)) || l.status !== (o ? "REVERSED" : "POSTED")) throw Error("Payroll source journal mismatch.");
			if (o) {
				let e = a.find((e) => e.id === s);
				if (!e || e.reversedJournalEntryId !== l.id || l.reversalJournalEntryId !== e.id || e.journalDate !== c || ar(u(e.lines)) !== ar(u(i.map((e) => ({
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
				let i = tr(t.lines.filter((e) => ["Earnings", "Allowance"].includes(e.item.category)).reduce((e, t) => e + t.amount, 0));
				for (let e of t.lines) {
					s("items", e.item.id), c(e.item.accountId, [
						"Earnings",
						"Allowance",
						"Employer contribution"
					].includes(e.item.category) ? "EXPENSE" : "LIABILITY"), e.item.category === "Employer contribution" && c(e.item.liabilityAccountId, "LIABILITY");
					let t = e.item.method === "Percentage" ? tr(i * e.rate / 100) : tr(e.quantity * e.rate);
					if (e.amount !== t) throw Error("Payroll line calculation mismatch.");
				}
				if (t.employee.taxScale !== "Manual" && (!t.employee.standardTaxConfirmed || r.withholding !== 0)) throw Error("Automatic PAYG declaration mismatch.");
				let a = t.lines.filter((t) => t.item.id === e.settings.superItemId), o = t.lines.filter((e) => e.item.category === "Tax");
				if (a.length !== 1 || a[0].amount !== (r.superMethod === "12% reviewed QE" ? tr(r.superBase * .12) : r.superAmount) || o.length !== 1 || o[0].item.id !== e.settings.taxItemId || new Set(t.timeIds).size !== t.timeIds.length || new Set(t.leaveIds).size !== t.leaveIds.length) throw Error("Payroll tax, super or source snapshot mismatch.");
				let l = tr((t.employee.taxScale === "Manual" ? r.withholding : Te(t.totals.taxable, t.employee.taxScale, e.settings.frequency, e.payDate)) + r.additionalWithholding);
				if (ar(nr(t.lines)) !== ar(t.totals) || t.totals.withholding !== l) throw Error("Payroll payslip totals mismatch.");
				for (let [n, r] of [["timesheets", t.timeIds], ["leave", t.leaveIds]]) for (let i of r) {
					let r = s(n, i);
					if (r.employeeId !== t.employee.id) throw Error("Payroll hours belong to another employee.");
					if (lr(e)) {
						if (f.has(i) || r.status !== "Approved") throw Error("Payroll source is reused or unapproved.");
						let a = n === "timesheets" ? r.date : r.start, o = n === "timesheets" ? r.date : r.end;
						if (vr(t.employee, a, o), a < e.start || o > e.end) throw Error("Payroll source dates are outside the pay period.");
						let s = n === "timesheets" ? "Time:" : "Leave:", c = t.employee.basis === "Hourly" && (n === "timesheets" || r.type !== "Unpaid"), l = t.lines.filter((e) => e.source === s + i);
						if (c ? l.length !== 1 || l[0].quantity !== r.hours || l[0].item.id !== (n === "timesheets" ? r.itemId : t.employee.earningItemId) : l.length !== 0) throw Error("Payroll source hours do not match the frozen payslip.");
						f.add(i);
					}
				}
			}
			if (ar(rr(e.slips)) !== ar(e.totals)) throw Error("Payroll run totals mismatch.");
			if (["Posted", "Reversed"].includes(e.status)) {
				if (!e.taxReviewed || e.reviewReference.trim().length < 3) throw Error("Posted payroll has no withholding review.");
				d(e.journalId, "PAYROLL", e.id, e.payDate, Er(e), e.status === "Reversed", e.reversalJournalId, e.reversalDate);
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
			for (let n of Er(e).filter((e) => e.credit)) t.set(n.accountId, tr((t.get(n.accountId) ?? 0) + n.credit));
			for (let [r, i] of t) if (tr(n.payments.filter((t) => t.runId === e.id && t.accountId === r && t.status === "Posted").reduce((e, t) => e + t.amount, 0)) > i) throw Error("Payroll liabilities are overpaid.");
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
			if (p.add(e.operationId), e.input.operationId !== e.operationId || ar({
				input: e.input,
				actorId: e.actorId
			}) !== e.fingerprint) throw Error("Invalid payroll operation fingerprint.");
			if (s(e.entity, e.recordId).revision < e.revision) throw Error("Invalid payroll operation revision.");
		}
	}
});
//#endregion
//#region electron/security/documentRecycleRepository.ts
var Or = a().trim().min(1).max(200), kr = a().regex(/^[a-f0-9]{64}$/), Ar = (e) => Array.isArray(e) ? e.map(Ar) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, Ar(e[t])])) : e, jr = (e) => ye("sha256").update(JSON.stringify(Ar(e))).digest("hex"), Mr = (e) => e === "Purchase order" || e === "Expense bill draft" ? "purchases.read" : "sales.read", Nr = (e) => e === "Quote" ? "sales.write" : e === "Purchase order" ? "purchases.write" : e === "Expense bill draft" ? "purchases.bill" : "sales.manage";
function Pr(e, t) {
	let [n, r] = ne[e];
	return (t[n]?.[r] ?? []).filter((t) => e === "Sales order draft" ? t.kind === "ORDER" : e !== "Invoice draft" || t.kind === "INVOICE");
}
function Fr(e, t, n) {
	let r = Pr(e, n).find((e) => e.id === t);
	if (!r) throw Error("Document was not found in the selected dataset.");
	return r;
}
function Ir(e, t, n) {
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
function Lr(t, n = C()) {
	return me.filter((n) => e(t, Mr(n))).flatMap((r) => Pr(r, n).map((i) => {
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
			token: jr({
				record: i,
				lifecycle: a?.id ?? ""
			}),
			deleted: a?.action === "Trashed",
			last: a,
			canWrite: e(t, Nr(r)),
			issues: Ir(r, i, n)
		};
	}));
}
var Rr = t({
	operationId: Or,
	action: f(["Trashed", "Recovered"]),
	reason: a().trim().min(3).max(2e3),
	records: r(t({
		kind: f(me),
		recordId: Or,
		token: kr
	}).strict()).min(1).max(100)
}).strict(), zr = t({
	id: Or,
	operationId: Or,
	fingerprint: kr,
	kind: f(me),
	recordId: Or,
	action: f(["Trashed", "Recovered"]),
	actorId: Or,
	at: xe(),
	reason: a().trim().min(3).max(2e3),
	recordToken: kr,
	contentToken: kr
}).strict();
y("documentRecycle", {
	repository: {
		list() {
			return Lr(T.require("inventory.read"));
		},
		detail(e, t) {
			return e = f(me).parse(e), T.require("inventory.read"), T.require(Mr(e)), structuredClone(Fr(e, Or.parse(t), C()));
		},
		change(e) {
			let t = Rr.parse(e), n = T.require("inventory.read");
			t.records.forEach((e) => {
				T.require(Mr(e.kind)), T.require(Nr(e.kind));
			});
			let r = jr({
				input: t,
				actorId: n.userId
			}), i = s().filter((e) => e.operationId === t.operationId);
			if (i.length) {
				if (i[0].fingerprint !== r) throw Error("Operation ID has different recycle data.");
				return structuredClone(i);
			}
			let a = C(), o = /* @__PURE__ */ new Set();
			for (let e of t.records) {
				if (o.has(e.recordId)) throw Error("Select each document only once.");
				o.add(e.recordId);
				let n = Fr(e.kind, e.recordId, a);
				if (jr({
					record: n,
					lifecycle: s().findLast((t) => t.recordId === e.recordId)?.id ?? ""
				}) !== e.token) throw Error("Document changed. Refresh and review the selection again.");
				if (c(e.recordId) !== (t.action === "Recovered")) throw Error("Document recycle state changed. Refresh the selection.");
				let r = Ir(e.kind, n, a);
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
				contentToken: jr(Fr(e.kind, e.recordId, a))
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
	view: (t) => ({ history: s().filter((n) => e(t, Mr(n.kind))) }),
	validate: (e, n) => {
		let { history: i } = t({ history: r(zr) }).strict().parse(e), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
		for (let e of i) {
			if (a.has(e.id)) throw Error("Duplicate recycle event.");
			a.add(e.id);
			let t = Fr(e.kind, e.recordId, n);
			if ((o.get(e.recordId) ?? "Recovered") === e.action) throw Error("Invalid recycle lifecycle sequence.");
			if (!i.slice(i.indexOf(e) + 1).some((t) => t.recordId === e.recordId) && e.action === "Trashed" && (Ir(e.kind, t, n).length || jr(t) !== e.contentToken)) throw Error("Recycled document content or references changed.");
			o.set(e.recordId, e.action), s.set(e.operationId, [...s.get(e.operationId) ?? [], e]);
		}
		for (let e of s.values()) {
			let t = e[0], n = e.map((e) => ({
				kind: e.kind,
				recordId: e.recordId,
				token: e.recordToken
			}));
			if (new Set(n.map((e) => e.recordId)).size !== n.length || e.some((e) => e.fingerprint !== t.fingerprint || e.action !== t.action || e.actorId !== t.actorId || e.at !== t.at || e.reason !== t.reason) || jr({
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
var Br = [
	"Flooring Retailer",
	"Builder",
	"Developer",
	"Designer",
	"Architect",
	"Installer",
	"Other"
], Vr = [
	"ACTIVE",
	"ON_HOLD",
	"INACTIVE"
], Hr = a().trim().refine((e) => e === "" || a().email().safeParse(e).success, { message: "Enter a valid email address" }), Ur = a().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), Wr = t({
	businessName: a().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: a().trim().max(120, "Trading name is too long"),
	abn: Ur,
	businessType: f(Br),
	status: f(Vr),
	email: Hr,
	phone: a().trim().max(40, "Phone number is too long"),
	website: a().trim().max(200, "Website is too long"),
	creditLimit: w({ message: "Credit limit is required" }).min(0, "Credit limit cannot be negative"),
	paymentTermsDays: w({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days")
}), Gr = t({
	name: a().trim().min(1, "Location name is required").max(100, "Location name is too long"),
	addressLine1: a().trim().min(1, "Address is required").max(160, "Address is too long"),
	addressLine2: a().trim().max(160, "Address is too long"),
	suburb: a().trim().min(1, "Suburb is required").max(100, "Suburb is too long"),
	state: a().trim().min(1, "State is required").max(50, "State is too long"),
	postcode: a().trim().min(1, "Postcode is required").max(20, "Postcode is too long"),
	country: a().trim().min(1, "Country is required").max(100, "Country is too long"),
	phone: a().trim().max(40, "Phone number is too long"),
	isPrimary: o()
}), Kr = t({
	isAccounting: o().optional(),
	firstName: a().trim().min(1, "First name is required").max(80, "First name is too long"),
	lastName: a().trim().min(1, "Last name is required").max(80, "Last name is too long"),
	jobTitle: a().trim().max(100, "Job title is too long"),
	email: a().trim().min(1, "Email is required").email("Enter a valid email address"),
	phone: a().trim().max(40, "Phone number is too long"),
	mobile: a().trim().max(40, "Mobile number is too long"),
	locationId: a(),
	isPrimary: o()
}), qr = [
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
], Jr = "htt.mock.contacts.customers.v1";
function Yr(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var Xr = Ze(Jr, Yr), Zr = Xr.status !== "invalid" && $e(Jr), Qr = /* @__PURE__ */ new Set(), $r = Xr.status === "ok" ? Xr.data : structuredClone(qr);
function ei() {
	Zr && Qe(Jr, $r), Qr.forEach((e) => {
		e();
	});
}
function ti(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function ni() {
	let e = $r.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function ri(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function ii(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function ai(e, t) {
	let n = !1;
	if ($r = $r.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	ei();
}
var z = {
	subscribe(e) {
		return Qr.add(e), () => {
			Qr.delete(e);
		};
	},
	getSnapshot() {
		return $r;
	},
	getAll() {
		return $r;
	},
	getById(e) {
		return $r.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: ti("cus"),
			code: ni(),
			businessName: e.businessName.trim(),
			tradingName: ri(e.tradingName),
			abn: ii(e.abn),
			businessType: e.businessType,
			status: e.status,
			email: ri(e.email),
			phone: ri(e.phone),
			website: ri(e.website),
			creditLimit: e.creditLimit,
			currentBalance: 0,
			overdueBalance: 0,
			paymentTermsDays: e.paymentTermsDays,
			locations: [],
			contacts: [],
			createdAt: t,
			updatedAt: t
		};
		return $r = [n, ...$r], ei(), n;
	},
	update(e, t) {
		let n;
		if (ai(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: ri(t.tradingName),
			abn: ii(t.abn),
			businessType: t.businessType,
			status: t.status,
			email: ri(t.email),
			phone: ri(t.phone),
			website: ri(t.website),
			creditLimit: t.creditLimit,
			paymentTermsDays: t.paymentTermsDays,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, n)), !n) throw Error(`Customer ${e} was not found`);
		return n;
	},
	addLocation(e, t) {
		let n = z.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: ti("loc"),
			name: t.name.trim(),
			addressLine1: t.addressLine1.trim(),
			addressLine2: ri(t.addressLine2),
			suburb: t.suburb.trim(),
			state: t.state.trim(),
			postcode: t.postcode.trim(),
			country: t.country.trim(),
			phone: ri(t.phone),
			isPrimary: r
		};
		return ai(e, (e) => ({
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
		let r = z.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		let i = r.locations.find((e) => e.id === t);
		if (!i) throw Error(`Location ${t} was not found`);
		let a = n.isPrimary || r.locations.length === 1, o = {
			...i,
			name: n.name.trim(),
			addressLine1: n.addressLine1.trim(),
			addressLine2: ri(n.addressLine2),
			suburb: n.suburb.trim(),
			state: n.state.trim(),
			postcode: n.postcode.trim(),
			country: n.country.trim(),
			phone: ri(n.phone),
			isPrimary: a
		};
		return ai(e, (e) => ({
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
		t = Kr.parse(t);
		let n = z.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: ti("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: ri(t.jobTitle),
			email: t.email.trim(),
			phone: ri(t.phone),
			mobile: ri(t.mobile),
			locationId: ri(t.locationId),
			isPrimary: r,
			isAccounting: t.isAccounting ?? !1
		};
		return ai(e, (e) => ({
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
		n = Kr.parse(n);
		let r = z.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		if (n.locationId && !r.locations.some((e) => e.id === n.locationId)) throw Error("The selected location does not belong to this customer");
		let i = r.contacts.find((e) => e.id === t);
		if (!i) throw Error(`Contact ${t} was not found`);
		let a = n.isPrimary || r.contacts.length === 1, o = {
			...i,
			firstName: n.firstName.trim(),
			lastName: n.lastName.trim(),
			jobTitle: ri(n.jobTitle),
			email: n.email.trim(),
			phone: ri(n.phone),
			mobile: ri(n.mobile),
			locationId: ri(n.locationId),
			isPrimary: a,
			isAccounting: n.isAccounting ?? !1
		};
		return ai(e, (e) => ({
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
	repository: z,
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
	snapshot: () => ({ customers: $r }),
	restore: (e) => {
		$r = e.customers;
	},
	publish: () => Qr.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var oi = [
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
], si = "htt.mock.contacts.suppliers.v1";
function ci(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var li = Ze(si, ci), ui = li.status !== "invalid" && $e(si), di = /* @__PURE__ */ new Set(), fi = li.status === "ok" ? li.data : structuredClone(oi);
function pi() {
	ui && Qe(si, fi), di.forEach((e) => {
		e();
	});
}
function mi(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function hi() {
	let e = fi.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function gi(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function _i(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function vi(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: gi(e.tradingName),
		abn: _i(e.abn),
		status: e.status,
		email: gi(e.email),
		phone: gi(e.phone),
		website: gi(e.website),
		contactName: gi(e.contactName),
		addressLine1: gi(e.addressLine1),
		addressLine2: gi(e.addressLine2),
		suburb: gi(e.suburb),
		state: gi(e.state),
		postcode: gi(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: gi(e.notes)
	};
}
var yi = {
	subscribe(e) {
		return di.add(e), () => {
			di.delete(e);
		};
	},
	getSnapshot() {
		return fi;
	},
	getAll() {
		return fi;
	},
	getById(e) {
		return fi.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: mi("sup"),
			code: hi(),
			...vi(e),
			currency: _().currency,
			createdAt: t,
			updatedAt: t
		};
		return fi = [n, ...fi], pi(), n;
	},
	update(e, t) {
		let n = yi.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...vi(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return fi = fi.map((t) => t.id === e ? r : t), pi(), r;
	}
};
y("suppliers", {
	repository: yi,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: fi }),
	restore: (e) => {
		fi = e.suppliers;
	},
	publish: () => di.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/schemas/supplierSchemas.ts
var bi = ["ACTIVE", "INACTIVE"], xi = a().trim().refine((e) => e === "" || a().email().safeParse(e).success, { message: "Enter a valid email address" }), Si = a().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), Ci = t({
	businessName: a().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: a().trim().max(120, "Trading name is too long"),
	abn: Si,
	status: f(bi),
	email: xi,
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
function wi(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function Ti(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function Ei(e, t) {
	if (e.itemType !== void 0 && ![
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	].includes(String(e.itemType))) throw Error("Invalid saved sales item type.");
	if (t && (e.itemType ?? "STOCK") !== (t.itemType ?? "STOCK")) throw Error("Saved sales item type does not match its referenced product.");
}
//#endregion
//#region src/features/inventory/data/mockProducts.ts
var Di = [
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
function B(e) {
	return Di.find((t) => t.id === e);
}
function Oi(e, t) {
	return B(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var ki = /* @__PURE__ */ new Set(), Ai = "2026-01-01T00:00:00.000Z", ji = Di.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: Ai,
	updatedAt: Ai
}));
function Mi() {
	ki.forEach((e) => e());
}
var Ni = {
	ensureProductPolicy(e, t, n) {
		let r = ji.find((t) => t.productId === e), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			productId: e,
			baseUnitId: t,
			active: n ? r?.active ?? !0 : !1,
			costingMethod: "MOVING_WEIGHTED_AVERAGE",
			createdAt: r?.createdAt ?? i,
			updatedAt: i
		};
		return ji = [...ji.filter((t) => t.productId !== e), a], Mi(), a;
	},
	subscribe(e) {
		return ki.add(e), () => {
			ki.delete(e);
		};
	},
	getSnapshot() {
		return ji;
	},
	getAll() {
		return ji;
	},
	getByProductId(e) {
		return ji.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = Ni.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		if (t && !wi(B(e) ?? { itemType: "SERVICE" })) throw Error("Inventory costing cannot be enabled for non-stock/service items.");
		let n = {
			...Ni.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ji = ji.map((t) => t.productId === e ? n : t), Mi(), n;
	}
};
y("costingPolicies", {
	repository: Ni,
	read: "inventory.cost.read",
	commands: {
		ensureProductPolicy: null,
		setActive: "accounting.post"
	},
	snapshot: () => ({ policies: ji }),
	restore: (e) => {
		ji = e.policies;
	},
	publish: () => ki.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/productRepository.ts
var Pi = t({
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
}).strict(), Fi = t({
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
	units: r(Pi).min(1),
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
}).strict(), Ii = /* @__PURE__ */ new Set(), Li = [...Di];
function Ri() {
	Li = [...Di], Ii.forEach((e) => e());
}
function zi(e, t, n) {
	if (Array.isArray(e)) return e.some((e) => zi(e, t, n));
	if (!e || typeof e != "object") return !1;
	let r = e;
	return r.productId === t && (!n || r.unitId === n) || Object.values(r).some((e) => zi(e, t, n));
}
function Bi(e) {
	let t = r(Fi).parse(e), n = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.id) || i.has(e.sku.toLowerCase())) throw Error("Duplicate product ID or SKU.");
		if (n.add(e.id), i.add(e.sku.toLowerCase()), !wi(e) && e.buyEnabled !== !1) throw Error("Non-stock/service catalogue items must use expense bills for purchasing.");
		if (!wi(e) && ((e.reorderPoint ?? 0) !== 0 || (e.targetStock ?? 0) !== 0)) throw Error("Non-stock/service items cannot have stock reorder thresholds.");
		if (wi(e) && e.units.some((e) => e.code === "HOUR" || e.code === "JOB")) throw Error("Hour/job units require non-stock or service items.");
		if (new Set(e.units.map((e) => e.id)).size !== e.units.length || e.units.filter((e) => e.isBaseUnit).length !== 1 || !e.units.some((t) => t.id === e.baseUnitId && t.isBaseUnit && t.conversionToBase === 1)) throw Error("A product needs exactly one valid base unit.");
		if ((e.targetStock ?? 0) < (e.reorderPoint ?? 0)) throw Error("Target stock must be at least the reorder point.");
	}
	return t;
}
var Vi = {
	subscribe(e) {
		return Ii.add(e), () => {
			Ii.delete(e);
		};
	},
	getSnapshot: () => Li,
	getAll: () => Di,
	getById: (e) => Di.find((t) => t.id === e),
	save(e, t) {
		let n = Fi.parse(e), r = Di.find((e) => e.id === n.id);
		if (r && t !== (r.revision ?? 0)) throw Error("Product changed since it was opened. Reload before saving.");
		if (!r && t !== void 0) throw Error("Product no longer exists.");
		if (b(n.taxCode ?? "GST"), !wi(n) && n.buyEnabled !== !1) throw Error("Non-stock and service catalogue items are sales-only. Use expense/service bills for supplier costs.");
		let i = C();
		if (delete i.products, r) {
			let e = { ...i };
			if (delete e.costingPolicies, (r.itemType ?? "STOCK") !== (n.itemType ?? "STOCK") && zi(e, n.id)) throw Error("A referenced product cannot change item type. Create a new catalogue item.");
			if (r.baseUnitId !== n.baseUnitId && zi(i, n.id)) throw Error("A referenced product cannot change base unit.");
			for (let e of r.units) {
				let t = n.units.find((t) => t.id === e.id);
				if ((!t || t.conversionToBase !== e.conversionToBase || t.code !== e.code) && zi(i, n.id, e.id)) throw Error("A referenced unit conversion cannot be changed or removed. Add a new unit instead.");
			}
		}
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...n,
			createdAt: r?.createdAt ?? a,
			updatedAt: a,
			revision: (r?.revision ?? 0) + 1
		};
		return Bi([...Di.filter((e) => e.id !== n.id), o]), r ? Di.splice(Di.indexOf(r), 1, o) : Di.push(o), Ni.ensureProductPolicy(o.id, o.baseUnitId, wi(o)), r && wi(r) !== wi(o) && Ni.setActive(o.id, wi(o)), Ri(), o;
	}
};
y("products", {
	validate: (e, t) => {
		let n = Bi(e.products), r = t.workspace_tax_codes.records, i = t.costingPolicies.policies, a = t.stock.balances;
		for (let e of n.filter((e) => !wi(e))) if (i.some((t) => t.productId === e.id && t.active) || a.some((t) => t.productId === e.id && t.quantityOnHand !== 0)) throw Error("Non-stock/service product has inventory activity or active costing.");
		if (n.some((e) => !r.some((t) => t.code === (e.taxCode ?? "GST")))) throw Error("Backup product tax-code reference is invalid.");
	},
	repository: Vi,
	read: "inventory.read",
	commands: { save: "inventory.adjust" },
	snapshot: () => ({ products: structuredClone(Di) }),
	restore: (e) => {
		let t = Bi(e.products);
		Di.splice(0, Di.length, ...t), Li = [...Di];
	},
	publish: Ri
});
//#endregion
//#region electron/security/transferRepository.ts
var Hi = a().trim().min(1).max(200), Ui = a().trim().min(1).max(2e3), Wi = (e) => Array.isArray(e) ? e.map(Wi) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).filter(([, e]) => e !== void 0).sort(([e], [t]) => e < t ? -1 : +(e > t)).map(([e, t]) => [e, Wi(t)])) : e, Gi = (e) => ye("sha256").update(JSON.stringify(Wi(e))).digest("hex"), Ki = [], qi = (e, t = !1) => {
	T.require("inventory.read");
	let n = T.require(Tn[e].read);
	return t && T.require(Tn[e].write), n.userId;
};
function Ji(e) {
	return e === "Customers" ? z.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Suppliers" ? yi.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Products" ? Vi.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : z.getAll().flatMap((t) => (e === "Customer branches" ? t.locations : t.contacts).map((e) => ({
		id: e.id,
		parentId: t.id,
		raw: e
	})));
}
function Yi(e, t) {
	let n = {};
	for (let [r, i] of Object.entries(Cn[e])) n[r] = String(t.raw[r] ?? i);
	if ((e === "Customer branches" || e === "Customer contacts") && (n.customerId = t.parentId), e === "Products") {
		let e = t.raw;
		n.taxCode = e.taxCode ?? "", n.itemType = e.itemType ?? "STOCK", n.buyEnabled = String(e.buyEnabled ?? (e.itemType === void 0 || e.itemType === "STOCK")), n.baseUnitCode = e.units.find((t) => t.id === e.baseUnitId).code, n.unitsJson = JSON.stringify(e.units);
	}
	return n;
}
function Xi(e, t) {
	return {
		_format: xn,
		id: t.id,
		recordToken: Gi({
			parentId: t.parentId,
			record: t.raw
		}),
		externalId: Ki.filter((t) => t.dataset === e).flatMap((e) => e.results).find((e) => e.action === "Created" && e.recordId === t.id)?.externalId ?? "",
		...Yi(e, t)
	};
}
function Zi(e, t) {
	if (!/^-?\d+(?:\.\d+)?$/.test(e) || !Number.isFinite(Number(e)) || Math.abs(Number(e)) > 2 ** 53 - 1) throw Error(`${t} must contain a safe plain number.`);
	return Number(e);
}
function Qi(e, t, n) {
	let r = n ? Yi(e, n) : { ...Cn[e] };
	for (let n of Object.keys(Cn[e])) if (Object.hasOwn(t, n)) {
		let i = t[n].trim();
		if (typeof Cn[e][n] == "number") r[n] = Zi(i, n);
		else if (typeof Cn[e][n] == "boolean") {
			if (!["true", "false"].includes(i)) throw Error(`${n} must be true or false.`);
			r[n] = i === "true";
		} else r[n] = i.trim();
	}
	if (n) for (let [n, i] of Object.entries(Cn[e])) Object.hasOwn(t, n) || (typeof i == "number" && (r[n] = Number(r[n])), typeof i == "boolean" && (r[n] = r[n] === "true"));
	return r;
}
var $i = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), ea = (e, t) => e.some((e) => e.reasons.some((n) => !t.some((t) => t.id === e.id && t.reasons.includes(n))));
function ta(e, t) {
	return t.map((t) => ({
		id: t.id,
		reasons: [
			...$i(t.businessName) === $i(e.businessName) ? ["Name"] : [],
			...e.email && t.email?.toLowerCase() === e.email.toLowerCase() ? ["Email"] : [],
			...e.abn && $i(t.abn) === $i(e.abn) ? ["Identifier"] : []
		]
	})).filter((e) => e.reasons.length);
}
function na(e, n, i, s = !1) {
	let c = i.id ? Ji(e).find((e) => e.id === i.id) : void 0;
	if (n === "Update by ID") {
		if (!c) throw Error("Existing record ID was not found.");
		if (!s && (!i.recordToken || i.recordToken !== Xi(e, c).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
	} else if (i.id || i.recordToken) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
	if (n === "Update by ID" && i.externalId && i.externalId !== Xi(e, c).externalId) throw Error("External source IDs cannot be reassigned by an update. Keep the export value or leave it blank.");
	let l = n === "Update by ID" ? c : void 0, u = l ? Xi(e, l) : null, d = Qi(e, i, l), p;
	if (e === "Customers") {
		let e = Wr.strict().parse(d), t = z.getAll().filter((e) => e.id !== l?.id);
		if (ea(_n({
			kind: "Customer",
			customerId: "",
			values: e
		}, t), l ? _n({
			kind: "Customer",
			customerId: "",
			values: l.raw
		}, t) : [])) throw Error("Possible existing customer duplicate. Use the customer review workflow or explicit ID update.");
		p = l ? z.update(l.id, e) : z.create(e);
	} else if (e === "Suppliers") {
		let e = Ci.strict().parse(d), t = yi.getAll().filter((e) => e.id !== l?.id);
		if (ea(ta(e, t), l ? ta(l.raw, t) : [])) throw Error("Possible existing supplier duplicate. Resolve it before import.");
		p = l ? yi.update(l.id, e) : yi.create(e);
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
		let ee = Fi.parse({
			...h,
			id: l?.id ?? crypto.randomUUID(),
			baseUnitId: c.id,
			units: s,
			createdAt: n?.createdAt ?? g,
			updatedAt: g
		});
		p = Vi.save(ee, n?.revision ?? (l ? 0 : void 0));
	} else {
		let t = String(d.customerId), n = z.getById(t);
		if (!n || n.status === "INACTIVE") throw Error("Select an existing, non-inactive parent customer.");
		if (l && l.parentId !== t) throw Error("Existing branch/contact cannot move to a different customer.");
		let { customerId: r, ...i } = d, a = e === "Customer branches" ? "Branch" : "Contact", o = a === "Branch" ? Gr.strict().parse(i) : Kr.strict().parse(i);
		if (ea(_n({
			kind: a,
			customerId: t,
			values: o
		}, [n]).filter((e) => e.id !== l?.id), l ? _n({
			kind: a,
			customerId: t,
			values: l.raw
		}, [n]).filter((e) => e.id !== l.id) : [])) throw Error("Possible existing branch/contact duplicate. Use customer review or explicit ID update.");
		p = a === "Branch" ? l ? z.updateLocation(t, l.id, o) : z.addLocation(t, o) : l ? z.updateContact(t, l.id, o) : z.addContact(t, o);
	}
	let m = Ji(e).find((e) => e.id === p.id);
	return {
		recordId: p.id,
		before: u,
		after: Xi(e, m)
	};
}
function ra(e) {
	if (qi(e.dataset, !0), Buffer.byteLength(e.text, "utf8") > 1e6) throw Error("CSV source exceeds 1 MB of UTF-8 text.");
	let t = Dn(e), n = new Map(Ji(e.dataset).map((t) => [t.id, Xi(e.dataset, t)])), r = C(), i = Gi({
		input: e,
		master: r
	}), a = /* @__PURE__ */ new Set(), o = [], s = [];
	try {
		for (let r of t.rows) {
			let t = r.values, i = (t.externalId ?? "").trim(), c = Gi({
				dataset: e.dataset,
				values: Object.fromEntries(Object.keys(Cn[e.dataset]).filter((e) => Object.hasOwn(t, e)).map((e) => [e, t[e]]))
			}), l = e.mode === "Create" ? i : t.id, u = "", d;
			try {
				if (!l) throw Error(e.mode === "Create" ? "externalId is required for safe create retries." : "id is required for explicit updates.");
				if (l.length > 200 || i.length > 200) throw Error("Import identity exceeds 200 characters.");
				if (a.has(l)) throw Error("Repeated identity in this CSV file.");
				if (a.add(l), e.mode === "Create" && (t.id || t.recordToken)) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
				if (e.mode === "Update by ID" && (!n.has(t.id) || t.recordToken !== n.get(t.id).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
				let s = e.mode === "Create" ? Ki.filter((t) => t.dataset === e.dataset).flatMap((e) => e.results).find((e) => e.action === "Created" && e.externalId === i) : void 0;
				if (s) {
					if (s.identityFingerprint !== c) throw Error("Source externalId already contains different creation data. Use an explicit ID update.");
					let t = Ji(e.dataset).find((e) => e.id === s.recordId);
					if (!t) throw Error("Prior imported record is missing.");
					d = {
						row: r.row,
						externalId: i,
						recordId: t.id,
						action: "Skipped",
						identityFingerprint: c,
						before: null,
						after: Xi(e.dataset, t)
					};
				} else {
					let a = na(e.dataset, e.mode, t, !0);
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
				let i = Ji(e.dataset).find((e) => e.id === n.recordId), a = Xi(e.dataset, i);
				if (t.values = Object.fromEntries(Object.keys(Cn[e.dataset]).filter((e) => Object.hasOwn(a, e)).map((e) => [e, a[e]])), e.dataset === "Products") {
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
var ia = {
	review(e) {
		return ra(En.parse(e)).preview;
	},
	commit(e) {
		let t = En.extend({
			operationId: Hi,
			expectedPreview: a().regex(/^[a-f0-9]{64}$/),
			reason: Ui
		}).strict().parse(e), n = qi(t.dataset, !0), { operationId: r, expectedPreview: i, reason: o, ...s } = t, c = Gi({
			source: s,
			reason: o
		}), l = Ki.find((e) => e.operationId === r);
		if (l) {
			if (l.fingerprint !== c) throw Error("Operation ID already has different import data.");
			return structuredClone(l);
		}
		let u = ra(s);
		if (u.preview.fingerprint !== i) throw Error("Business records or import fields changed. Validate the file again.");
		if (!u.preview.valid) throw Error("Resolve every validation error before committing the batch.");
		let d = Dn(s), f = new Set(d.rows.map((e) => e.values.customerId || Ji(s.dataset).find((t) => t.id === e.values.id)?.parentId || "")), p = (e) => JSON.stringify({
			primaryLocationId: e.primaryLocationId,
			primaryContactId: e.primaryContactId,
			locations: e.locations,
			contacts: e.contacts
		}), m = ["Customer branches", "Customer contacts"].includes(s.dataset) ? z.getAll().filter((e) => f.has(e.id)).map((e) => ({
			customerId: e.id,
			before: p(e)
		})) : [], h = [];
		for (let [e, t] of d.rows.entries()) {
			let n = u.results[e];
			n.action === "Skipped" ? h.push(n) : h.push({
				...n,
				...na(s.dataset, s.mode, t.values, !0),
				before: n.before
			});
		}
		for (let e of h) {
			let t = Ji(s.dataset).find((t) => t.id === e.recordId);
			e.after = Xi(s.dataset, t), e.action === "Created" && (e.after.externalId = e.externalId);
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
				after: p(z.getById(e.customerId))
			})).filter((e) => e.before !== e.after)
		};
		return sa.parse(g), Ki = [...Ki, g], structuredClone(g);
	},
	export(e) {
		e = f(yn).parse(e), qi(e);
		let t = wn(e), n = Ji(e).map((t) => Xi(e, t));
		return {
			dataset: e,
			count: n.length,
			csv: On([t, ...n.map((e) => t.map((t) => e[t] ?? ""))])
		};
	},
	template(e) {
		e = f(yn).parse(e), qi(e);
		let t = wn(e).filter((e) => !["id", "recordToken"].includes(e)), n = {
			_format: xn,
			externalId: "replace-with-stable-source-id",
			...Object.fromEntries(Object.entries(Cn[e]).map(([e, t]) => [e, String(t)]))
		};
		return (e === "Customers" || e === "Suppliers") && (n.businessName = "Replace company name"), e === "Suppliers" && (n.country = "Replace country"), e === "Customer branches" && (n.name = "Replace branch name", n.addressLine1 = "Replace address", n.suburb = "Replace city", n.state = "Replace region", n.postcode = "Replace postcode", n.country = "Replace country"), e === "Customer contacts" && (n.firstName = "Replace", n.lastName = "Name", n.email = "replace@example.test"), e === "Products" && (n.sku = "REPLACE-SKU", n.name = "Replace product name"), On([t, t.map((e) => n[e] ?? "")]);
	}
}, aa = ee(a(), a()), oa = t({
	row: w().int().min(2).max(501),
	externalId: a().max(200),
	recordId: Hi,
	action: f([
		"Created",
		"Updated",
		"Skipped"
	]),
	identityFingerprint: a().regex(/^[a-f0-9]{64}$/),
	before: aa.nullable(),
	after: aa
}).strict(), sa = t({
	id: Hi,
	operationId: Hi,
	fingerprint: a().regex(/^[a-f0-9]{64}$/),
	dataset: f(yn),
	mode: f(bn),
	fileName: Hi,
	sourceHash: a().regex(/^[a-f0-9]{64}$/),
	actorId: Hi,
	at: a().refine((e) => new Date(e).toISOString() === e),
	reason: Ui,
	results: r(oa).min(1).max(500),
	parentChanges: r(t({
		customerId: Hi,
		before: a().max(5e6),
		after: a().max(5e6)
	}).strict()).max(500)
}).strict();
y("dataTransfers", {
	repository: ia,
	read: "inventory.read",
	commands: {
		review: "inventory.read",
		commit: "inventory.read",
		export: "inventory.read",
		template: "inventory.read"
	},
	snapshot: () => ({ runs: Ki }),
	restore: (e) => {
		Ki = e.runs;
	},
	publish: () => {},
	view: (t) => ({ runs: Ki.filter((n) => e(t, Tn[n.dataset].read)) }),
	validate: (e, n) => {
		let i = t({ runs: r(sa) }).strict().parse(e), o = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Set();
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
				if (t.before && (Object.keys(t.before).some((t) => !wn(e.dataset).includes(t)) || t.before._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(t.before.recordToken))) throw Error("Invalid import before-state audit.");
				if (Object.keys(t.after).some((t) => !wn(e.dataset).includes(t)) || t.after._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(t.after.recordToken)) throw Error("Invalid import audit fields.");
			}
			if (new Set(e.parentChanges.map((e) => e.customerId)).size !== e.parentChanges.length || e.parentChanges.length && !["Customer branches", "Customer contacts"].includes(e.dataset)) throw Error("Invalid import parent audit.");
			for (let n of e.parentChanges) {
				if (!i.some((e) => e.id === n.customerId)) throw Error("Invalid import parent reference.");
				for (let e of [n.before, n.after]) {
					let n = t({
						primaryLocationId: a().optional(),
						primaryContactId: a().optional(),
						locations: r(t({ id: Hi }).passthrough()),
						contacts: r(t({ id: Hi }).passthrough())
					}).strict().parse(JSON.parse(e));
					if (n.primaryLocationId && !n.locations.some((e) => e.id === n.primaryLocationId) || n.primaryContactId && !n.contacts.some((e) => e.id === n.primaryContactId)) throw Error("Invalid import primary-record audit.");
				}
			}
		}
	}
});
//#endregion
//#region electron/security/attachmentRepository.ts
var V = a().trim().min(1).max(200), ca = a().trim().min(1).max(2e3), la = a().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), ua = t({
	id: V,
	number: w().int().positive(),
	name: V,
	mime: V,
	size: w().int().positive().max(h),
	sha256: a().regex(/^[a-f0-9]{64}$/),
	content: a().max(14e6),
	createdAt: la,
	createdBy: V,
	restoredFrom: V.optional()
}).strict(), da = t({
	id: V,
	title: a().trim().min(1).max(200),
	target: d,
	revision: w().int().positive(),
	currentVersionId: V,
	versions: r(ua).min(1).max(100),
	createdAt: la,
	createdBy: V,
	updatedAt: la,
	updatedBy: V,
	deletedAt: la.optional(),
	deletedBy: V.optional()
}).strict(), fa = (e) => ({
	title: e.title,
	deleted: !!e.deletedAt,
	currentVersionId: e.currentVersionId,
	versionsCount: e.versions.length
}), pa = t({
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
	at: la,
	revision: w().int().positive(),
	reason: ca,
	versionId: V.optional(),
	fingerprint: a().regex(/^[a-f0-9]{64}$/),
	after: t({
		title: V,
		deleted: o(),
		currentVersionId: V,
		versionsCount: w().int().positive()
	}).strict()
}).strict(), ma = [], ha = [];
function ga() {
	return T.require("inventory.read");
}
var _a = () => C([...new Set(Object.values(le).map((e) => e.repository))]);
function va(e, t, r = _a()) {
	return n(r, t).find((t) => t.kind === e.kind && t.id === e.id);
}
function ya(e, t = !1) {
	let n = ga(), r = va(e, n);
	if (!r) throw Error("Business link was not found or access is denied.");
	if (t && !r.canWrite) throw Error("Permission denied: attachment maintenance requires the linked object write permission.");
	return n.userId;
}
function ba(e, t = !1) {
	let n = ma.find((t) => t.id === V.parse(e));
	if (!n) throw Error("Attachment not found or access denied.");
	return ya(n.target, t), n;
}
var xa = (e) => ye("sha256").update(JSON.stringify(e)).digest("hex"), Sa = (e, t) => {
	let n = va(e.target, t);
	return {
		...e,
		targetLabel: n.label,
		targetPath: n.path,
		canWrite: n.canWrite,
		versions: e.versions.map(({ content: e, ...t }) => t)
	};
};
function Ca(e, t) {
	if (e.revision !== t) throw Error("Attachment changed. Refresh before continuing.");
}
function wa(e, t) {
	if (t < e.updatedAt) throw Error("System clock precedes the last attachment change.");
}
function Ta(e) {
	if (ma.flatMap((e) => e.versions).reduce((e, t) => e + t.size, 0) + e > 5e7) throw Error("Local attachment library exceeds 50 MB including versions and trash. Export/archive the business profile before adding more files.");
}
function Ea(e, t) {
	let n = ha.find((t) => t.operationId === e);
	if (!n) return;
	let r = ba(n.documentId, !0);
	if (n.fingerprint !== t) throw Error("Operation ID already has different attachment data.");
	return Sa(r, T.current());
}
function Da(e, t, n, r, i, a) {
	return ma = [...ma.filter((t) => t.id !== e.id), e], ha = [...ha, {
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
		after: fa(e)
	}], Sa(e, T.current());
}
y("attachments", {
	repository: {
		targets() {
			return n(_a(), ga());
		},
		checkTarget(e) {
			return ya(d.parse(e), !0), !0;
		},
		upload(e) {
			let n = t({
				operationId: V,
				id: V.optional(),
				expectedRevision: w().int().nonnegative(),
				target: d,
				title: V,
				reason: ca,
				file: t({
					name: V,
					content: a().max(14e6)
				}).strict()
			}).strict().parse(e), r = ya(n.target, !0), i = ve(n.file.name, n.file.content), o = xa({
				...n,
				file: {
					name: i.name,
					sha256: i.sha256
				}
			}), s = Ea(n.operationId, o);
			if (s) return s;
			let c = n.id ? ba(n.id, !0) : void 0;
			if (c) {
				if (Ca(c, n.expectedRevision), JSON.stringify(c.target) !== JSON.stringify(n.target)) throw Error("An attachment retains its original business link.");
				if (c.deletedAt) throw Error("Recover the attachment before adding a version.");
				if (c.versions.some((e) => e.sha256 === i.sha256)) throw Error("These file bytes already exist in this attachment. Use version restore instead.");
				if (c.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
			} else if (n.expectedRevision !== 0) throw Error("A new attachment requires revision zero.");
			if (!c && ma.some((e) => !e.deletedAt && e.target.kind === n.target.kind && e.target.id === n.target.id && e.versions.some((e) => e.sha256 === i.sha256))) throw Error("This file already exists on the selected business object. Open its existing attachment.");
			Ta(i.size);
			let l = (/* @__PURE__ */ new Date()).toISOString();
			c && wa(c, l);
			let u = {
				...i,
				id: crypto.randomUUID(),
				number: (c?.versions.length ?? 0) + 1,
				createdAt: l,
				createdBy: r
			};
			return Da({
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
				reason: ca,
				title: V.optional(),
				versionId: V.optional()
			}).strict().parse(e), r = ba(n.id, !0), i = xa(n), a = Ea(n.operationId, i);
			if (a) return a;
			Ca(r, n.expectedRevision);
			let o = ya(r.target, !0), s = (/* @__PURE__ */ new Date()).toISOString();
			wa(r, s);
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
					Ta(e.size), m(e);
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
			return Da(c, n.action, n.operationId, i, n.reason, l);
		},
		read(e) {
			let n = t({
				id: V,
				versionId: V
			}).strict().parse(e), r = ba(n.id).versions.find((e) => e.id === n.versionId);
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
		documents: ma,
		history: ha
	}),
	restore: (e) => {
		ma = e.documents, ha = e.history;
	},
	publish: () => {},
	view: (e) => {
		let t = ma.filter((t) => va(t.target, e));
		return {
			documents: t.map((t) => Sa(t, e)),
			history: ha.filter((e) => t.some((t) => t.id === e.documentId)).map(({ fingerprint: e, ...t }) => t)
		};
	},
	validate: (e, n) => {
		let i = t({
			documents: r(da),
			history: r(pa)
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
			if (c !== e.versions.length || f.actorId !== e.updatedBy || f.at !== e.updatedAt || JSON.stringify(f.after) !== JSON.stringify(fa(e))) throw Error("Attachment metadata differs from audit.");
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
function Oa(e) {
	let t = Math.round(e * 100);
	if (!Number.isFinite(e) || !Number.isSafeInteger(t) || Math.abs(t / 100 - e) > 1e-7) throw Error("Amounts must be safe currency values with at most two decimals.");
	return t;
}
function ka(e, t) {
	return e.flatMap((n) => n.lines.flatMap((r, i) => {
		let a = t.find((e) => e.id === r.accountId);
		if (!a || !["REVENUE", "EXPENSE"].includes(a.type)) return [];
		let o = n, s = r;
		if (n.reversedJournalEntryId) {
			let t = e.find((e) => e.id === n.reversedJournalEntryId), a = t?.lines[i];
			if (!t || !a || a.accountId !== r.accountId || Oa(a.debit) !== Oa(r.credit) || Oa(a.credit) !== Oa(r.debit)) throw Error("Reversal line does not match its original source.");
			o = t, s = a;
		}
		let c = Oa(a.type === "REVENUE" ? r.credit - r.debit : r.debit - r.credit);
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
function Aa(e, t, n, r, i, a) {
	if (S(i, "From date"), S(a, "To date"), i > a) throw Error("From date must not follow to date.");
	let o = ka(e, t).filter((e) => e.date >= i && e.date <= a), s = o.flatMap((e) => {
		let t = r.find((t) => t.journalId === e.rootJournalId && t.lineId === e.rootLineId), i = e.amount < 0 ? -1 : 1, a = Oa(e.capacity), o = (t?.splits ?? []).map((t) => {
			let r = Oa(t.amount);
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
		for (let r of s.filter((t) => t.jobId === e)) r.kind === "REVENUE" ? t += Oa(r.allocated) : n += Oa(r.allocated);
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
			let t = c(e.id), n = Oa(Math.round(Number(e.budget) * 100) / 100), r = Oa(Math.round(Number(e.costBudget) * 100) / 100);
			return {
				id: e.id,
				name: e.name,
				code: e.code,
				status: e.status,
				...t,
				budget: n / 100,
				costBudget: r / 100,
				budgetProfit: (n - r) / 100,
				revenueVariance: (Oa(t.revenue) - n) / 100,
				costVariance: (r - Oa(t.cost)) / 100,
				profitVariance: (Oa(t.profit) - n + r) / 100
			};
		}),
		unallocated: c(""),
		ledger: {
			revenue: o.filter((e) => e.kind === "REVENUE").reduce((e, t) => e + Oa(t.amount), 0) / 100,
			cost: o.filter((e) => e.kind === "EXPENSE").reduce((e, t) => e + Oa(t.amount), 0) / 100
		}
	};
}
//#endregion
//#region src/features/job-costing/jobCostingRepository.ts
var ja = a().trim().min(1).max(200), Ma = a().trim().min(1).max(2e3), Na = a().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), Pa = t({
	jobId: ja,
	amount: w().finite().positive().refine((e) => {
		try {
			return Oa(e), !0;
		} catch {
			return !1;
		}
	})
}).strict(), Fa = t({
	id: ja,
	journalId: ja,
	lineId: ja,
	revision: w().int().positive(),
	splits: r(Pa).max(100),
	updatedAt: Na,
	updatedBy: ja
}).strict(), Ia = t({
	id: ja,
	operationId: ja,
	recordId: ja,
	revision: w().int().positive(),
	at: Na,
	actorId: ja,
	reason: Ma,
	fingerprint: a().max(3e6),
	before: r(Pa),
	after: r(Pa)
}).strict(), La = t({
	operationId: ja,
	journalId: ja,
	lineId: ja,
	expectedRevision: w().int().nonnegative(),
	expectedSource: a().max(2e6),
	splits: r(Pa).max(100),
	reason: Ma
}).strict(), Ra = [], za = [], Ba = /* @__PURE__ */ new Set(), Va = () => Ba.forEach((e) => e());
function Ha(e, t, n) {
	if (new Set(e.map((e) => e.jobId)).size !== e.length) throw Error("Use one split per project.");
	if (e.some((e) => !n.some((t) => t.id === e.jobId))) throw Error("Project was not found.");
	if (e.reduce((e, t) => e + Oa(t.amount), 0) > Oa(t)) throw Error("Project splits exceed the source amount.");
}
y("jobCosting", {
	repository: {
		subscribe(e) {
			return Ba.add(e), () => {
				Ba.delete(e);
			};
		},
		getSnapshot: () => Ra,
		review() {
			return T.require("accounting.read"), {
				lines: ka(A.getAll(), O.getAll()),
				allocations: structuredClone(Ra),
				history: structuredClone(za)
			};
		},
		report(e) {
			T.require("accounting.read");
			let n = t({
				from: a(),
				to: a()
			}).strict().parse(e);
			return Aa(A.getAll(), O.getAll(), x.jobs, Ra, n.from, n.to);
		},
		save(e) {
			let t = T.require("accounting.post"), n = La.parse(e), r = JSON.stringify(n), i = za.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already has different allocation data.");
				return Ra.find((e) => e.id === i.recordId);
			}
			let a = ka(A.getAll(), O.getAll()).find((e) => e.journalId === n.journalId && e.lineId === n.lineId);
			if (!a) throw Error("Select a posted revenue or expense line.");
			if (a.reversal) throw Error("Allocate the original line; reversal entries inherit its splits.");
			if (n.expectedSource !== a.signature) throw Error("Source journal changed. Refresh before allocating.");
			let o = Ra.find((e) => e.journalId === a.journalId && e.lineId === a.lineId);
			if ((o?.revision ?? 0) !== n.expectedRevision) throw Error("Allocation changed. Refresh before saving.");
			Ha(n.splits, a.capacity, x.jobs);
			for (let e of n.splits) if (x.jobs.find((t) => t.id === e.jobId).status !== "Active" && o?.splits.find((t) => t.jobId === e.jobId)?.amount !== e.amount) throw Error("Only active projects can receive new or changed allocations.");
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
			return Ra = [...Ra.filter((e) => e.id !== c.id), c], za = [...za, {
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
			}], Va(), c;
		}
	},
	read: "accounting.read",
	commands: {
		review: "accounting.read",
		report: "accounting.read",
		save: "accounting.post"
	},
	snapshot: () => ({
		allocations: Ra,
		history: za
	}),
	restore: (e) => {
		Ra = e.allocations, za = e.history;
	},
	publish: Va,
	validate: (e, n) => {
		let i = t({
			allocations: r(Fa),
			history: r(Ia)
		}).strict().parse(e), a = n.workspace_jobs.records, o = ka(n.journals.journalEntries, n.accounts.accounts), s = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set();
		for (let e of i.allocations) {
			let t = o.find((t) => t.journalId === e.journalId && t.lineId === e.lineId), n = e.journalId + ":" + e.lineId;
			if (!t || t.reversal || s.has(n)) throw Error("Invalid project source reference.");
			s.add(n), Ha(e.splits, t.capacity, a);
			let r = i.history.filter((t) => t.recordId === e.id);
			if (r.length !== e.revision) throw Error("Invalid allocation history length.");
			let c = [], l = "";
			for (let [n, i] of r.entries()) {
				let r = La.parse(JSON.parse(i.fingerprint));
				if (i.revision !== n + 1 || i.at < l || JSON.stringify(i.before) !== JSON.stringify(c) || r.journalId !== e.journalId || r.lineId !== e.lineId || r.operationId !== i.operationId || r.expectedRevision !== n || r.reason !== i.reason || JSON.stringify(r.splits) !== JSON.stringify(i.after)) throw Error("Invalid allocation history chain.");
				Ha(i.after, t.capacity, a), c = i.after, l = i.at;
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
var Ua = a().trim().min(1).max(200), Wa = a().trim().max(2e3), Ga = a().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), Ka = t({
	operationId: Ua,
	kind: f(cn),
	customerId: a().max(200).default(""),
	values: dn,
	source: f(ln).default("Manual"),
	externalId: a().trim().max(200).default(""),
	sourceReference: a().trim().max(500).default("")
}).strict(), qa = t({
	id: Ua,
	action: Ua,
	actorId: Ua,
	at: Ga,
	reason: Wa,
	data: a().max(2e6)
}).strict(), Ja = t({
	action: f([
		"Approve new",
		"Link existing",
		"Reject"
	]),
	actorId: Ua,
	at: Ga,
	reason: Wa,
	fingerprint: a().max(1e4),
	customerId: a(),
	targetId: a(),
	snapshot: te()
}).strict(), Ya = Ka.extend({
	id: Ua,
	state: f([
		"Pending",
		"Approved",
		"Linked",
		"Rejected"
	]),
	revision: w().int().positive(),
	createdBy: Ua,
	createdAt: Ga,
	updatedAt: Ga,
	creationFingerprint: a().max(1e5),
	history: r(qa).min(1),
	decision: Ja.optional()
}).strict(), Xa = [], Za = /* @__PURE__ */ new Set(), Qa = () => Za.forEach((e) => e());
function $a() {
	let e = T.require("contacts.write");
	return T.require("sales.read"), e.userId;
}
var eo = () => (/* @__PURE__ */ new Date()).toISOString();
function to(e) {
	let t = eo();
	if (t < e.updatedAt) throw Error("System clock precedes the last review update. Correct it before continuing.");
	return t;
}
var no = (e, t, n, r = "", i = {}) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	reason: r,
	data: JSON.stringify(i)
});
function ro(e) {
	let t = Xa.find((t) => t.id === e);
	if (!t) throw Error("Review draft not found.");
	return t;
}
function io(e, t) {
	if (e.revision !== t) throw Error("Review draft changed. Reload before continuing.");
}
function ao(e) {
	return Xa = [...Xa.filter((t) => t.id !== e.id), e], Qa(), e;
}
function oo(e) {
	let t = Ka.parse(e);
	if (t.values = fn(t.kind, t.values), t.kind === "Customer" && t.customerId) throw Error("Customer drafts must not have a parent customer.");
	if (t.customerId && !z.getById(t.customerId)) throw Error("Parent customer was not found.");
	return t;
}
function so(e, t) {
	return e === "Customer" ? Wr.strict().parse(t) : e === "Branch" ? Gr.strict().parse(t) : Kr.strict().parse(t);
}
function co(e, t, n) {
	let r = z.getById(e === "Customer" ? n : t);
	if (!r) throw Error("Choose an existing customer.");
	let i = e === "Customer" ? r : e === "Branch" ? r.locations.find((e) => e.id === n) : r.contacts.find((e) => e.id === n);
	if (!i) throw Error("The selected record does not belong to this customer or draft type.");
	return {
		customerId: r.id,
		targetId: i.id,
		snapshot: structuredClone(i)
	};
}
var lo = {
	subscribe(e) {
		return Za.add(e), () => {
			Za.delete(e);
		};
	},
	getSnapshot: () => Xa,
	create(e) {
		let t = $a(), n = oo(e), { operationId: r, ...i } = n, a = JSON.stringify(i), o = Xa.find((e) => e.operationId === r) || n.externalId && Xa.find((e) => e.source === n.source && e.externalId === n.externalId);
		if (o) {
			if (o.creationFingerprint !== a) throw Error("Operation or external source ID already contains different draft data.");
			return o;
		}
		let s = eo();
		return ao({
			...n,
			id: crypto.randomUUID(),
			state: "Pending",
			revision: 1,
			createdBy: t,
			createdAt: s,
			updatedAt: s,
			creationFingerprint: a,
			history: [no("Received", t, s, "", i)]
		});
	},
	importBatch(e) {
		$a();
		let n = t({
			operationId: Ua.max(150),
			drafts: r(Ka.omit({ operationId: !0 })).min(1).max(100)
		}).strict().parse(e);
		if (n.drafts.some((e) => !e.externalId)) throw Error("Each imported draft requires a source external ID for safe retry.");
		return n.drafts.map((e, t) => lo.create({
			...e,
			operationId: n.operationId + ":" + t
		}));
	},
	update(e) {
		let n = $a(), r = t({
			id: Ua,
			expectedRevision: w().int().positive(),
			customerId: a().max(200),
			values: dn
		}).strict().parse(e), i = ro(r.id);
		if (io(i, r.expectedRevision), i.state !== "Pending") throw Error("Only pending drafts can be edited.");
		let o = oo({
			operationId: i.operationId,
			kind: i.kind,
			customerId: r.customerId,
			values: r.values,
			source: i.source,
			externalId: i.externalId,
			sourceReference: i.sourceReference
		}), s = to(i);
		return ao({
			...i,
			customerId: o.customerId,
			values: o.values,
			revision: i.revision + 1,
			updatedAt: s,
			history: [...i.history, no("Updated", n, s, "", {
				customerId: o.customerId,
				values: o.values
			})]
		});
	},
	review(e) {
		T.require("sales.read");
		let t = ro(Ua.parse(e)), n = z.getAll(), r = "";
		try {
			if (so(t.kind, t.values), t.kind !== "Customer" && !n.some((e) => e.id === t.customerId)) throw Error("Select the parent customer.");
		} catch (e) {
			r = e.message;
		}
		return {
			revision: t.revision,
			duplicates: _n(t, n),
			masterSignature: vn(n),
			validationError: r
		};
	},
	decide(e) {
		let n = $a(), r = t({
			id: Ua,
			expectedRevision: w().int().positive(),
			action: f([
				"Approve new",
				"Link existing",
				"Reject"
			]),
			reason: Wa,
			allowDuplicate: o().default(!1),
			targetId: a().max(200).default(""),
			expectedMaster: a().max(25e6).optional()
		}).strict().parse(e), i = ro(r.id), s = JSON.stringify({
			action: r.action,
			reason: r.reason,
			allowDuplicate: r.allowDuplicate,
			targetId: r.targetId
		});
		if (i.state !== "Pending") {
			if (i.decision?.fingerprint === s) return i;
			throw Error("This draft already has a different decision.");
		}
		io(i, r.expectedRevision);
		let c = to(i), l = {
			customerId: "",
			targetId: "",
			snapshot: null
		};
		if (r.action === "Reject") {
			if (!r.reason) throw Error("Explain why the draft is rejected.");
		} else {
			let e = z.getAll();
			if (r.expectedMaster !== vn(e)) throw Error("Customer records changed. Refresh duplicate review before deciding.");
			if (r.action === "Link existing") {
				if (!r.reason) throw Error("Explain why this existing record is the correct match.");
				l = co(i.kind, i.customerId, r.targetId);
			} else {
				if (_n(i, e).length && (!r.allowDuplicate || !r.reason)) throw Error("Possible duplicates exist. Link an existing record or explicitly confirm a separate new record with a reason.");
				let t = so(i.kind, i.values);
				if (i.kind === "Customer") {
					let e = z.create(t);
					l = {
						customerId: e.id,
						targetId: e.id,
						snapshot: structuredClone(e)
					};
				} else {
					let e = z.getById(i.customerId);
					if (!e || e.status === "INACTIVE") throw Error("Select an available parent customer.");
					let n = i.kind === "Branch" ? z.addLocation(e.id, t) : z.addContact(e.id, t);
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
		return ao({
			...i,
			state: r.action === "Reject" ? "Rejected" : r.action === "Link existing" ? "Linked" : "Approved",
			revision: i.revision + 1,
			updatedAt: c,
			decision: u,
			history: [...i.history, no(r.action, n, c, r.reason, u)]
		});
	},
	reopen(e) {
		let n = $a(), r = t({
			id: Ua,
			expectedRevision: w().int().positive(),
			reason: Wa.refine(Boolean, "Explain why this draft is reopened.")
		}).strict().parse(e), i = ro(r.id);
		if (io(i, r.expectedRevision), i.state !== "Rejected") throw Error("Only rejected drafts may be reopened.");
		let a = to(i), o = {
			...i,
			state: "Pending",
			revision: i.revision + 1,
			updatedAt: a,
			history: [...i.history, no("Reopened", n, a, r.reason)]
		};
		return delete o.decision, ao(o);
	}
};
y("contactReviews", {
	repository: lo,
	read: "sales.read",
	commands: {
		create: "contacts.write",
		update: "contacts.write",
		importBatch: "contacts.write",
		review: "sales.read",
		decide: "contacts.write",
		reopen: "contacts.write"
	},
	snapshot: () => ({ drafts: Xa }),
	restore: (e) => {
		Xa = e.drafts;
	},
	publish: Qa,
	validate: (e, n) => {
		let i = t({ drafts: r(Ya) }).strict().parse(e), s = n.customers.customers, c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set();
		for (let e of i.drafts) {
			let n = fn(e.kind, e.values);
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
					reason: Wa,
					allowDuplicate: o(),
					targetId: a()
				}).strict().parse(JSON.parse(e.decision.fingerprint)), i = e.history.at(-1);
				if (r.action !== n || r.reason !== e.decision.reason || r.targetId !== (n === "Link existing" ? e.decision.targetId : "") || i.actorId !== e.decision.actorId || i.at !== e.decision.at || i.reason !== e.decision.reason || JSON.stringify(JSON.parse(i.data)) !== JSON.stringify(e.decision)) throw Error("Review decision audit is inconsistent.");
				if (e.decision.action !== n) throw Error("Invalid review decision.");
				if (n !== "Reject") {
					let t = s.find((t) => t.id === e.decision.customerId), r = e.kind === "Customer" ? t : e.kind === "Branch" ? t?.locations.find((t) => t.id === e.decision.targetId) : t?.contacts.find((t) => t.id === e.decision.targetId);
					if (!r || r.id !== e.decision.targetId || e.kind !== "Customer" && t.id !== e.customerId || e.decision.snapshot?.id !== r.id) throw Error("Invalid resolved review reference.");
					n === "Approve new" && so(e.kind, e.values);
				} else if (!e.decision.reason || e.decision.customerId || e.decision.targetId) throw Error("Invalid rejection.");
			}
		}
	}
});
//#endregion
//#region src/features/sales/data/areaPacks.ts
function uo(e, t) {
	let n = B(e), r = n?.units.find((e) => e.id === t), i = n?.units.find((e) => e.id === n.baseUnitId);
	return n?.status === "ACTIVE" && n.itemType !== "SERVICE" && r?.active && i?.code === "M2" && ["BOX", "ROLL"].includes(r.code) && Number.isFinite(r.conversionToBase) && r.conversionToBase > 0 ? r.conversionToBase : void 0;
}
function fo(e, t, n, r) {
	if (r === void 0) return { quantity: n };
	let i = uo(e, t);
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
function po(e) {
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
function mo(e, t) {
	let n = z.getById(e);
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
function ho(e) {
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
function go(e, t, n, r) {
	let i = B(e), a = Oi(e, t);
	if (!i || i.status !== "ACTIVE" || !a?.active) throw Error("Select an active product and unit.");
	if (r === "buy" && !wi(i)) throw Error("Non-stock/service items use expense bills, not inventory purchase orders.");
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
var _o = "htt.mock.sales.quotes.v1", vo = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function yo(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !vo.has(String(t.status)) || ![
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
function bo() {
	return Ze(_o, yo);
}
function xo(e) {
	if (bo().status === "invalid" || !$e("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!Qe("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var So = "htt.mock.sales.quote-orders.v1";
function Co(e) {
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
function wo(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!yo(t.quotes) || !Co(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function To() {
	return Ze(So, wo);
}
function Eo(e) {
	if (!wo(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = To(), n = bo();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !$e("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!Qe("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var Do = "htt.mock.sales.documents.v1";
function Oo(e) {
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
function ko(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!wo(t) || !Oo(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function Ao() {
	return Ze(Do, ko);
}
function jo(e) {
	if (!ko(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = Ao();
	if (t.status === "invalid" || t.status === "unavailable" || !$e("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!Qe("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var Mo = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function No(e) {
	let t = e.filter((e) => Mo.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function Po() {
	No(j.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var Fo = [{
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
}], Io = [{
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
}], Lo = [{
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
}], Ro = "htt.mock.sales.credit-notes.v1", zo = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, Bo = (e) => typeof e == "string" && e.length > 0;
function Vo(e) {
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
		].every((e) => Bo(t[e])) || ![
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
		].every((e) => zo(i[e])) || !zo(t.amountApplied) || !zo(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => Bo(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !zo(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		if (Math.abs(t - e.amountApplied) > .011) return !1;
		let n = e.refundEvents ?? [];
		if (!Array.isArray(n) || n.some((e) => !e || !Bo(e.id) || !Bo(e.date) || !zo(e.amount) || e.amount <= 0 || e.reversalDate !== void 0 && !Bo(e.reversalDate)) || new Set(n.map((e) => e.id)).size !== n.length) return !1;
		let r = n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0);
		return !zo(e.amountRefunded ?? 0) || Math.abs(r - (e.amountRefunded ?? 0)) > .011 || t + r > e.totals.total + .011 ? !1 : e.status === "VOID" ? t === 0 && r === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t - r)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function Ho() {
	return Ze(Ro, Vo);
}
function Uo(e) {
	if (!Vo(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = Ho();
	if (t.status === "invalid" || t.status === "unavailable" || !$e("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!Qe("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var Wo = /* @__PURE__ */ new Set(), Go = Ho(), Ko = Go.status === "ok" ? structuredClone(Go.data.creditNotes) : [], qo = Go.status === "ok" ? structuredClone(Go.data.allocations) : [], Jo = [...Ko], Yo = [...qo];
function Xo() {
	Jo = [...Ko], Yo = [...qo], Wo.forEach((e) => e());
}
function Zo(e, t) {
	Uo({
		creditNotes: e,
		allocations: t
	}), Ko = e, qo = t, Xo();
}
var H = {
	subscribe(e) {
		return Wo.add(e), () => {
			Wo.delete(e);
		};
	},
	getSnapshot() {
		return Jo;
	},
	getAllocationSnapshot() {
		return Yo;
	},
	getAll() {
		return Jo;
	},
	getAllAllocations() {
		return Yo;
	},
	getById(e) {
		return Ko.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Ko.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Ko.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return qo.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return qo.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if (Ko.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return Zo([e, ...Ko], qo), e;
	},
	update(e) {
		if (!Ko.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return Zo(Ko.map((t) => t.id === e.id ? e : t), qo), e;
	},
	createAllocation(e) {
		if (qo.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return Zo(Ko, [e, ...qo]), e;
	},
	updateAllocation(e) {
		if (!qo.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return Zo(Ko, qo.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!Ko.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = qo.some((t) => t.id === e.id) ? qo.map((t) => t.id === e.id ? e : t) : [e, ...qo];
		Zo(Ko.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return qo.find((t) => t.id === e);
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
			ho(n.recipient);
			for (let e of n.lines) po(e), Ei(e, t.products.products.find((t) => t.id === e.productId));
		}
	},
	snapshot: () => ({
		creditNotes: Ko,
		allocations: qo
	}),
	restore: (e) => {
		Ko = e.creditNotes, qo = e.allocations, Jo = [...Ko], Yo = [...qo];
	},
	publish: () => Wo.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/customerPricingStorage.ts
var Qo = "htt.mock.contacts.customerPricing.v1";
function $o(e) {
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
function es() {
	return Ze(Qo, $o);
}
function ts(e) {
	if (es().status === "invalid" || !$e("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!Qe("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var ns = [
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
], rs = /* @__PURE__ */ new Set(), is = es(), as = is.status === "ok" ? is.data : structuredClone(ns);
function os() {
	rs.forEach((e) => {
		e();
	});
}
function ss(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function cs(e) {
	return e.trim() || void 0;
}
function ls(e, t) {
	let n = B(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = n.units.find((e) => e.id === t);
	if (!r) throw Error(`Unit ${t} does not belong to product ${e}`);
	if (!r.active) throw Error("The selected product unit is inactive");
	return {
		product: n,
		unit: r
	};
}
function us(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function ds({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = as.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : us(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = gs(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function fs(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function ps(e) {
	let t = Oi(e.productId, e.unitId);
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
var ms = {
	subscribe(e) {
		return rs.add(e), () => {
			rs.delete(e);
		};
	},
	getSnapshot() {
		return as;
	},
	getAll() {
		return as;
	},
	getById(e) {
		return as.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return as.filter((t) => t.customerId === e);
	},
	create(e, t) {
		ls(t.productId, t.unitId);
		let n = cs(t.effectiveTo);
		t.active && ds({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = fs(t), a = {
			id: ss("cprice"),
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
		}, o = [a, ...as];
		return ts(o), as = o, os(), a;
	},
	update(e, t) {
		let n = ms.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		ls(t.productId, t.unitId);
		let r = cs(t.effectiveTo);
		t.active && ds({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = fs(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = as.map((t) => t.id === e ? a : t);
		return ts(o), as = o, os(), a;
	},
	resolve(e) {
		return ps(e);
	},
	resolvePrice(e, t, n, r) {
		let i = ms.resolveBasePrice(e, t, n, r.slice(0, 10)), a = v({
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
		let { unit: i } = ls(t, n), a = as.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && hs(r, i.effectiveFrom, i.effectiveTo));
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
		let o = ps(a);
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
function hs(e, t, n) {
	return !(e < t || n && e > n);
}
function gs(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
y("customerPrices", {
	repository: ms,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: as }),
	restore: (e) => {
		as = e.customerPrices;
	},
	publish: () => rs.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
function _s(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function vs({ quantity: e, standardUnitPrice: t, unitPrice: n, taxRate: r = b(), inclusiveLineTotal: i }) {
	let a = _s(e * n), o = _s(i === void 0 ? a * r : i - a), s = _s(a + o), c = _s(t - n);
	return {
		discountAmount: c,
		discountPercent: t > 0 ? _s(c / t * 100) : 0,
		lineSubtotal: a,
		taxAmount: o,
		lineTotal: s
	};
}
function ys(e) {
	let t = _s(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = _s(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: _s(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function bs({ customerId: e, documentDate: t, draft: n }) {
	if (n.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let r = B(n.productId);
	if (!r) throw Error(`Product ${n.productId} was not found`);
	if (r.status !== "ACTIVE") throw Error(`${r.name} is inactive`);
	let i = Oi(n.productId, n.unitId);
	if (!i) throw Error(`Unit ${n.unitId} was not found for ${r.name}`);
	let a = ms.resolvePrice(e, n.productId, n.unitId, t), o = n.unitPrice !== void 0, s = o ? n.unitPrice : a.effectivePrice;
	if (!Number.isFinite(s) || s < 0) throw Error("Unit price cannot be negative");
	let c = fo(n.productId, n.unitId, n.quantity, n.requestedArea);
	if (go(n.productId, n.unitId, c.quantity, "sell"), r.sellEnabled === !1) throw Error("Product is not available for selling.");
	let l = r.taxCode ?? _().gstCode, u = b(l), d = o ? oe(s, u, n.priceBasis) : s, f = vs({
		taxRate: u,
		inclusiveLineTotal: o && (n.priceBasis ?? _().basis) === "Inclusive" ? Math.round(c.quantity * s * 100) / 100 : void 0,
		quantity: c.quantity,
		standardUnitPrice: a.basePrice,
		unitPrice: d
	});
	return {
		id: xs("line"),
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
function xs(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var Ss = /* @__PURE__ */ new Set(), Cs = k.read().payments;
function ws() {
	Ss.forEach((e) => e());
}
function Ts() {
	return `payment_${crypto.randomUUID()}`;
}
function Es() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Cs.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var Ds = {
	subscribe(e) {
		return Ss.add(e), () => {
			Ss.delete(e);
		};
	},
	getSnapshot() {
		return Cs;
	},
	getAll() {
		return Cs;
	},
	getById(e) {
		return Cs.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Cs.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Cs.filter((t) => t.invoiceId === e);
	},
	create(e) {
		if (!e.customerId) throw Error("Customer is required");
		if (!e.invoiceId) throw Error("Invoice is required");
		if (!e.paymentDate) throw Error("Payment date is required");
		if (!e.bankAccountId) throw Error("Bank account is required");
		let t = Mt.getById(e.bankAccountId);
		if (!t) throw Error("Bank account was not found");
		if (!t.active) throw Error("The selected bank account is inactive");
		if (!Number.isFinite(e.amount) || e.amount <= 0) throw Error("Payment amount must be greater than zero");
		if (S(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (ks(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = j.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: ks(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: Os(e.reference),
				notes: Os(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = Cs.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Ts(),
			paymentNumber: Es(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: ks(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: Os(e.reference),
			notes: Os(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && j.bindResult(n, i.id);
		let a = [i, ...Cs];
		if (k.update("payments", a), Cs = a, n && !e.deferOperationCompletion) try {
			j.complete(n, i.id);
		} catch (e) {
			try {
				j.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return ws(), i;
	},
	reverse(e, t) {
		let n = Cs.find((t) => t.id === e);
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
		}, o = Cs.map((t) => t.id === e ? a : t);
		return k.update("payments", o), Cs = o, ws(), a;
	},
	getReceivedByInvoice(e) {
		return Cs.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function Os(e) {
	return e?.trim() || void 0;
}
function ks(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
y("customerPayments", {
	repository: Ds,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null
	},
	snapshot: () => ({ payments: Cs }),
	restore: (e) => {
		Cs = e.payments;
	},
	publish: () => Ss.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/taxPosting.ts
function As(e, t, n, r) {
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
function js(e) {
	return O.requireBySystemRole(e).id;
}
function Ms(e) {
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
function Ns(e, t) {
	return A.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Ps(e, t) {
	let n = Ns(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Fs = {
	postInvoice(e) {
		return Ns("CUSTOMER_INVOICE", e.id) || A.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: js("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: js("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				...As(e.lines, "collected", !1, e.totals.taxAmount)
			]
		});
	},
	reverseInvoice(e) {
		let t = Ps("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? A.getById(t.reversalJournalEntryId) : void 0 : A.reverse({
			journalEntryId: t.id,
			reversalDate: Ms(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = Ns("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = Mt.requireById(e.bankAccountId);
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
				accountId: js("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = Ps("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? A.getById(t.reversalJournalEntryId) : void 0 : A.reverse({
			journalEntryId: t.id,
			reversalDate: Ms(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return Ns("CREDIT_NOTE", e.id) || A.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: js("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				...As(e.lines, "collected", !0, e.totals.taxAmount),
				{
					accountId: js("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = Ps("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? A.getById(t.reversalJournalEntryId) : void 0 : A.reverse({
			journalEntryId: t.id,
			reversalDate: Ms(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, Is = /* @__PURE__ */ new Set(), Ls = Ao(), Rs = To(), zs = bo(), Bs = Ls.status === "ok" ? structuredClone(Ls.data.quotes) : Rs.status === "ok" ? structuredClone(Rs.data.quotes) : zs.status === "ok" ? structuredClone(zs.data) : structuredClone(Fo);
function Vs(e) {
	Ls.status === "ok" || Ao().status !== "empty" ? jo({
		quotes: e,
		salesOrders: Hs,
		invoices: U
	}) : Rs.status === "ok" || To().status !== "empty" ? Eo({
		quotes: e,
		salesOrders: Hs
	}) : xo(e), Bs = e, Ks();
}
var Hs = Ls.status === "ok" ? structuredClone(Ls.data.salesOrders) : Rs.status === "ok" ? structuredClone(Rs.data.salesOrders) : structuredClone(Io), U = Ls.status === "ok" ? structuredClone(Ls.data.invoices) : structuredClone(Lo);
function Us(e) {
	jo({
		quotes: Bs,
		salesOrders: Hs,
		invoices: e
	}), U = e, Ks();
}
function Ws(e, t = Bs) {
	Ls.status === "ok" || Ao().status !== "empty" ? jo({
		quotes: t,
		salesOrders: e,
		invoices: U
	}) : Eo({
		quotes: t,
		salesOrders: e
	}), Hs = e, Bs = t, Ks();
}
var Gs = qs();
function Ks() {
	Gs = qs(), Is.forEach((e) => e());
}
function qs() {
	return [
		...Bs,
		...Hs,
		...U
	];
}
var W = {
	createManagedOrder(e) {
		let t = Hs.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Xs("order"),
			managedDraftId: e.draftId,
			type: "SALES_ORDER",
			status: "CONFIRMED",
			documentNumber: Zs("SO", Hs.map((e) => e.documentNumber)),
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
		return Ws([r, ...Hs]), r;
	},
	createManagedInvoice(e) {
		let t = U.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = W.createManagedOrder(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Xs("invoice"),
			managedDraftId: e.draftId,
			type: "INVOICE",
			status: "ISSUED",
			documentNumber: Zs("INV", U.map((e) => e.documentNumber)),
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
		}, a = Hs.map((e) => e.id === n.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: r
		} : e);
		return jo({
			quotes: Bs,
			salesOrders: a,
			invoices: [i, ...U]
		}), Hs = a, U = [i, ...U], Ks(), Fs.postInvoice(i), i;
	},
	cancelManagedOrder(e, t) {
		let n = Hs.find((t) => t.id === e);
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
		return Ws(Hs.map((t) => t.id === e ? r : t)), r;
	},
	subscribe(e) {
		return Is.add(e), () => {
			Is.delete(e);
		};
	},
	getSnapshot() {
		return ie(Gs);
	},
	getAll() {
		return ie(Gs);
	},
	getById(e) {
		return ie(Gs).find((t) => t.id === e);
	},
	getByCustomer(e) {
		return ie(Gs).filter((t) => t.customerId === e);
	},
	getQuotesByCustomer(e) {
		return ie(Bs).filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return Hs.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return U.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (Js(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = e.lines.map((t) => bs({
			customerId: e.customerId,
			documentDate: e.documentDate,
			draft: t
		})), n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Xs("quote"),
			type: "QUOTE",
			documentNumber: Zs("QU", Bs.map((e) => e.documentNumber)),
			recipient: mo(e.customerId, e),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: Ys(e.customerReference),
			notes: Ys(e.notes),
			lines: t,
			totals: ys(t),
			createdAt: n,
			updatedAt: n
		};
		return Vs([r, ...Bs]), r;
	},
	updateDraftQuote(e, t) {
		let n = Bs.find((t) => t.id === e);
		if (!n) throw Error(`Quote ${e} was not found`);
		if (n.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let r = t.lines.map((e) => {
			if (e.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
			if (!Number.isFinite(e.standardUnitPrice) || !Number.isFinite(e.unitPrice) || e.standardUnitPrice < 0 || e.unitPrice < 0) throw Error("Sales prices cannot be negative");
			let t = fo(e.productId, e.unitId, e.quantity, e.requestedArea);
			go(e.productId, e.unitId, t.quantity, "sell");
			let r = B(e.productId)?.taxCode ?? _().gstCode, i = vs({
				taxRate: b(r),
				quantity: t.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice
			}), a = n.lines.find((t) => t.id === e.lineId);
			return {
				itemType: B(e.productId)?.itemType ?? "STOCK",
				...t,
				id: a?.id ?? Xs("line"),
				productId: e.productId,
				unitId: e.unitId,
				sku: ec(e.productId, e.unitId).sku,
				description: ec(e.productId, e.unitId).description,
				unitSymbol: ec(e.productId, e.unitId).unitSymbol,
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
			recipient: t.locationId === void 0 && t.accountingContactId === void 0 ? n.recipient : mo(n.customerId, t),
			documentDate: t.documentDate,
			expiryDate: t.expiryDate,
			customerReference: Ys(t.customerReference),
			notes: Ys(t.notes),
			lines: r,
			totals: ys(r),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Vs(Bs.map((t) => t.id === e ? i : t)), i;
	},
	sendQuote(e) {
		let t = Bs.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return Vs(Bs.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = Bs.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return Vs(Bs.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = Bs.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return Vs(Bs.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = Bs.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Xs("order"),
			type: "SALES_ORDER",
			documentNumber: Zs("SO", Hs.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: Qs(),
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
		return Ws([r, ...Hs], Bs.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = Hs.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED" && n.status !== "INVOICED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: n.status === "INVOICED" ? "INVOICED" : t,
			fulfilmentStatus: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ws(Hs.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = Hs.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = Qs(), i = {
			id: Xs("invoice"),
			managedDraftId: t.managedDraftId,
			type: "INVOICE",
			documentNumber: Zs("INV", U.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: r,
			dueDate: $s(r, Number(_().terms)),
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
		}, a = [i, ...U], o = Hs.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: n
		} : e);
		return jo({
			quotes: Bs,
			salesOrders: o,
			invoices: a
		}), U = a, Hs = o, Ks(), Fs.postInvoice(i), i;
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
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = H.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id), s = e.quantity + i >= n.quantity - 1e-8, c = tc(s ? n.lineSubtotal - o.reduce((e, t) => e + t.lineSubtotal, 0) : n.lineSubtotal * e.quantity / n.quantity), l = tc(s ? n.taxAmount - o.reduce((e, t) => e + t.taxAmount, 0) : n.taxAmount * e.quantity / n.quantity);
			return {
				...n,
				requestedArea: e.quantity === n.quantity ? n.requestedArea : void 0,
				coveredArea: n.areaPerPack ? Math.round(e.quantity * n.areaPerPack * 1e8) / 1e8 : void 0,
				quantity: e.quantity,
				taxRate: a,
				lineSubtotal: c,
				taxAmount: l,
				lineTotal: tc(c + l)
			};
		}), a = ys(i);
		if (a.total <= 0) throw Error("Credit note total must be greater than zero");
		if (tc(tc(H.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + a.total) > tc(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: Xs("credit-note"),
			creditNoteNumber: Zs("CN", H.getAll().map((e) => e.creditNoteNumber)),
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
		return H.create(s), Fs.postCreditNote(s), s;
	},
	applyCreditToInvoice(e) {
		N(), Po();
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
		let r = tc(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = H.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: Xs("credit-allocation"),
			allocationNumber: Zs("CA", H.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = tc(i.amountApplied + r), c = tc(Math.max(0, i.totals.total - (i.amountRefunded ?? 0) - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
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
		N(), Po();
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
		}, s = tc(H.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = tc(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - s)), l = `sales-credit-reversal:${t.id}`;
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
		return H.update(i), Fs.reverseCreditNote(i), i;
	},
	recordInvoicePayment(e) {
		if (N(), Po(), e.operationId) {
			let t = j.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = U.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = tc(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (S(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, a = Ds.create({
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
			Fs.postPayment(a);
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
		N(), Po();
		let n = U.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (Ds.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
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
			j.bindResult(o, e), Fs.reverseInvoice(a);
			let n = A.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			Us(U.map((t) => t.id === e ? a : t)), j.complete(o, e);
		} catch (e) {
			try {
				j.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		Fe("CUSTOMER_PAYMENT", e), N(), Po();
		let n = Ds.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = U.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (j.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			j.bindResult(i, e);
			let n = Ds.reverse(e, t);
			Fs.reversePayment(n);
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
		let n = Ds.getReceivedByInvoice(e), r = H.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = tc(n.reduce((e, t) => e + t.amount, 0)), a = tc(r.reduce((e, t) => e + t.amount, 0)), o = tc(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : nc(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Us(U.map((t) => t.id === e ? c : t)), c;
	}
};
function Js(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function Ys(e) {
	return e?.trim() || void 0;
}
function Xs(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Zs(e, t) {
	return he(e, t, fe((/* @__PURE__ */ new Date()).toISOString()).slice(0, 4));
}
function Qs() {
	return fe((/* @__PURE__ */ new Date()).toISOString());
}
function $s(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function ec(e, t) {
	let n = B(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = Oi(e, t);
	if (!r) throw Error(`Unit ${t} was not found for ${n.name}`);
	return {
		sku: n.sku,
		description: n.name,
		unitSymbol: r.symbol
	};
}
function tc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function nc(e) {
	return e < rc(/* @__PURE__ */ new Date());
}
function rc(e) {
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
			ho(e.recipient);
			for (let n of e.lines) po(n), Ei(n, t.products.products.find((e) => e.id === n.productId));
		}
	},
	snapshot: () => ({
		quotes: Bs,
		salesOrders: Hs,
		invoices: U
	}),
	restore: (e) => {
		Bs = e.quotes, Hs = e.salesOrders, U = e.invoices, Gs = qs();
	},
	publish: () => Is.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
function ic(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ac({ orderedQuantity: e, unitCost: t, taxRate: n = b(), inclusiveLineTotal: r }) {
	let i = ic(e * t), a = ic(r === void 0 ? i * n : r - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: ic(i + a)
	};
}
function oc(e) {
	let t = ic(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = ic(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: ic(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var sc = /* @__PURE__ */ new Set(), cc = k.read().purchaseOrders;
k.onRollback(() => {
	cc = k.read().purchaseOrders;
});
function lc() {
	try {
		k.update("purchaseOrders", cc);
	} catch (e) {
		throw cc = k.read().purchaseOrders, e;
	}
	sc.forEach((e) => k.notify(e));
}
function uc(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function dc(e) {
	return he("PO", cc.map((e) => e.purchaseOrderNumber), e.slice(0, 4));
}
function fc(e) {
	return e?.trim() || void 0;
}
function pc(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = Di.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let n = t.units.find((t) => t.id === e.unitId);
		if (!n) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!n.active) throw Error(`${n.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		if (go(e.productId, e.unitId, e.orderedQuantity, "buy"), t.buyEnabled === !1) throw Error("Product is not available for purchasing.");
		let r = t.taxCode ?? _().gstCode, i = b(r), a = ac({
			taxRate: i,
			inclusiveLineTotal: (e.priceBasis ?? _().basis) === "Inclusive" ? Math.round(e.orderedQuantity * e.unitCost * 100) / 100 : void 0,
			orderedQuantity: e.orderedQuantity,
			unitCost: oe(e.unitCost, i, e.priceBasis)
		});
		return {
			id: uc("pol"),
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
function mc(e) {
	let t = yi.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function hc(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var gc = {
	subscribe(e) {
		return sc.add(e), () => {
			sc.delete(e);
		};
	},
	getSnapshot() {
		return ie(cc);
	},
	getAll() {
		return ie(cc);
	},
	getById(e) {
		return ie(cc).find((t) => t.id === e);
	},
	getBySupplier(e) {
		return ie(cc).filter((t) => t.supplierId === e);
	},
	create(e) {
		hc(e);
		let t = mc(e.supplierId), n = pc(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: uc("po"),
			purchaseOrderNumber: dc(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: fc(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: fc(e.supplierReference),
			notes: fc(e.notes),
			lines: n,
			totals: oc(n),
			createdAt: r,
			updatedAt: r
		};
		return cc = [i, ...cc], lc(), i;
	},
	updateDraft(e, t) {
		let n = gc.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		hc(t);
		let r = mc(t.supplierId), i = pc(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: fc(t.expectedDeliveryDate),
			supplierReference: fc(t.supplierReference),
			notes: fc(t.notes),
			lines: i,
			totals: oc(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return cc = cc.map((e) => e.id === n.id ? a : e), lc(), a;
	},
	approve(e) {
		let t = gc.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return _c(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = gc.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return _c(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = gc.getById(e);
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
		return cc = cc.map((e) => e.id === n.id ? o : e), lc(), o;
	},
	recordSupplierBill(e, t) {
		let n = gc.getById(e);
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
			let n = vc(e.billedQuantity + t);
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
		return cc = cc.map((e) => e.id === n.id ? c : e), lc(), c;
	},
	reverseSupplierBill(e, t) {
		let n = gc.getById(e);
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
				billedQuantity: vc(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return cc = cc.map((e) => e.id === n.id ? c : e), lc(), c;
	},
	cancel(e, t) {
		let n = gc.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return _c(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function _c(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return cc = cc.map((t) => t.id === e.id ? n : t), lc(), n;
}
function vc(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
y("purchaseOrders", {
	repository: gc,
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
	snapshot: () => ({ purchaseOrders: cc }),
	restore: (e) => {
		cc = e.purchaseOrders;
	},
	publish: () => sc.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function G(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function yc(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function bc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function xc({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return yc(e / t);
}
function Sc({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return bc(e * t);
}
function Cc({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = G(e + n), a = bc(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : yc(a / i)
	};
}
function wc({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return bc(e * t);
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function Tc(e) {
	return bc(e.lines.reduce((e, t) => {
		let n = xc({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + Sc({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function Ec(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Dc(e) {
	return O.requireBySystemRole(e).id;
}
function Oc(e) {
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
function kc(e, t) {
	return A.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Ac(e, t) {
	let n = kc(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var jc = {
	validateGoodsReceiptPosting(e) {
		let t = O.requireBySystemRole("INVENTORY"), n = O.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = Tc(e);
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
		let a = Ec(e.totals.subtotal - t);
		if (a !== 0) {
			let e = O.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = Ec(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = kc("SUPPLIER_BILL", e.id);
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
					accountId: Dc("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				...As(e.lines, "paid", !0, e.totals.taxAmount),
				...i === 0 ? [] : [{
					accountId: Dc("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: Dc("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = Ac("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? A.getById(t.reversalJournalEntryId) : void 0 : A.reverse({
			journalEntryId: t.id,
			reversalDate: Oc(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = kc("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = Mt.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return A.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: Dc("ACCOUNTS_PAYABLE"),
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
		let t = Ac("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? A.getById(t.reversalJournalEntryId) : void 0 : A.reverse({
			journalEntryId: t.id,
			reversalDate: Oc(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return kc("SUPPLIER_CREDIT", e.id) || A.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: Dc("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				...e.lines.reduce((e, t) => {
					let n = t.expenseAccountId ?? Dc("PURCHASE_PRICE_VARIANCE"), r = e.find((e) => e.accountId === n);
					return r ? r.credit = Math.round((r.credit + t.lineSubtotal) * 100) / 100 : t.lineSubtotal && e.push({
						accountId: n,
						debit: 0,
						credit: t.lineSubtotal
					}), e;
				}, []),
				...As(e.lines, "paid", !1, e.totals.taxAmount)
			]
		});
	},
	reverseSupplierCredit(e) {
		for (let t of A.getBySource("SUPPLIER_CREDIT_RECLASS", e.id).filter((e) => e.status === "POSTED")) A.reverse({
			journalEntryId: t.id,
			reversalDate: Oc(e.voidedAt),
			reason: e.voidReason ?? "Credit void"
		});
		let t = Ac("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? A.getById(t.reversalJournalEntryId) : void 0 : A.reverse({
			journalEntryId: t.id,
			reversalDate: Oc(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, Mc = structuredClone([{
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
}]), Nc = {
	getAll() {
		return Mc;
	},
	getById(e) {
		return Mc.find((t) => t.id === e);
	},
	getActive() {
		return Mc.filter((e) => e.status === "ACTIVE");
	}
}, Pc = /* @__PURE__ */ new Set(), Fc = [];
function Ic() {
	Pc.forEach((e) => e());
}
function Lc() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Fc.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var Rc = {
	subscribe(e) {
		return Pc.add(e), () => {
			Pc.delete(e);
		};
	},
	getSnapshot() {
		return Fc;
	},
	getAll() {
		return Fc;
	},
	getByReference(e, t) {
		return Fc.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return Fc.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return Fc.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: Lc(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Fc = [t, ...Fc], Ic(), t;
	}
};
y("inventoryMovements", {
	repository: Rc,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: Fc }),
	restore: (e) => {
		Fc = e.movements;
	},
	publish: () => Pc.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var zc = /* @__PURE__ */ new Set(), Bc = [];
function Vc() {
	zc.forEach((e) => e());
}
var Hc = {
	subscribe(e) {
		return zc.add(e), () => {
			zc.delete(e);
		};
	},
	getSnapshot() {
		return Bc;
	},
	getAll() {
		return Bc;
	},
	getBalance(e, t) {
		return Bc.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = Hc.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return Bc = Bc.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? Bc.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...Bc], Vc(), e;
	},
	replaceAll(e) {
		Bc = e, Vc();
	},
	clear() {
		Bc = [], Vc();
	}
};
y("costBalances", {
	repository: Hc,
	read: "inventory.cost.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: Bc }),
	restore: (e) => {
		Bc = e.balances;
	},
	publish: () => zc.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var Uc = /* @__PURE__ */ new Set(), Wc = [];
function Gc() {
	Uc.forEach((e) => e());
}
function Kc() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Wc.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function qc(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var Jc = {
	subscribe(e) {
		return Uc.add(e), () => {
			Uc.delete(e);
		};
	},
	getSnapshot() {
		return Wc;
	},
	getAll() {
		return Wc;
	},
	getByReference(e, t) {
		return Wc.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return Wc.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return Wc.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return Wc.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return qc(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: Kc(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = Jc.build(e);
		return Wc = [t, ...Wc], Gc(), t;
	},
	replaceAll(e) {
		Wc = e, Gc();
	},
	clear() {
		Wc = [], Gc();
	}
};
y("costMovements", {
	repository: Jc,
	read: "inventory.cost.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: Wc }),
	restore: (e) => {
		Wc = e.movements;
	},
	publish: () => Uc.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function Yc(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function Xc(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function Zc(e, t) {
	let n = B(e);
	if (!n) throw Error("Product was not found.");
	if (!wi(n)) throw Error("Non-stock/service items cannot move inventory value.");
	let r = Ni.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = Oi(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function Qc(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = bc(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(bc(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function $c(e) {
	if (e && Jc.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function el({ movement: e, balance: t }) {
	let n = Jc.getAll(), r = Hc.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	Jc.replaceAll(i), Hc.replaceAll(a);
}
function tl(e) {
	if (Yc(e.quantity), Xc(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	$c(e.inventoryMovementId);
	let { policy: t, unit: n } = Zc(e.productId, e.unitId), r = G(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = xc({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = Sc({
		quantityBase: r,
		unitCostBase: i
	}), o = Hc.getBalance(e.siteId, e.productId);
	o && Qc(o, t.baseUnitId);
	let s = Cc({
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
	Qc(l, t.baseUnitId);
	let u = Jc.build({
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
	return el({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function nl(e) {
	Yc(e.quantity), Xc(e.occurredAt), $c(e.inventoryMovementId);
	let { policy: t, unit: n } = Zc(e.productId, e.unitId), r = G(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = Hc.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (Qc(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = yc(i.averageCostPerBaseUnit), o = wc({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = G(i.quantityOnHand - r), c = s === 0, l = bc(c ? -i.inventoryValue : -o), u = c ? 0 : bc(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : yc(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	Qc(p, t.baseUnitId);
	let m = Jc.build({
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
	return el({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function rl(e) {
	if (Yc(e.quantityBase), Xc(e.occurredAt), $c(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = B(e.productId);
	if (!t) throw Error("Product was not found.");
	if (!wi(t)) throw Error("Non-stock/service items cannot restore inventory value.");
	let n = Ni.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = G(e.quantityBase), i = yc(e.unitCostBase), a = bc(e.inventoryValue), o = Hc.getBalance(e.siteId, e.productId);
	o && Qc(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = G(s + r), u = bc(c + a), d = l === 0 ? 0 : yc(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	Qc(p, n.baseUnitId);
	let m = Jc.build({
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
	return el({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var il = /* @__PURE__ */ new Set(), al = [];
function ol() {
	il.forEach((e) => e());
}
function sl(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var cl = {
	subscribe(e) {
		return il.add(e), () => {
			il.delete(e);
		};
	},
	getSnapshot() {
		return al;
	},
	getAll() {
		return al;
	},
	getBalance(e, t) {
		return al.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = cl.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: sl(i.quantityOnHand + r),
				updatedAt: a
			};
			return al = al.map((r) => r.siteId === e && r.productId === t ? n : r), ol(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: sl(r),
			updatedAt: a
		};
		return al = [o, ...al], ol(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = cl.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = sl(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return al = al.map((n) => n.siteId === e && n.productId === t ? o : n), ol(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of Rc.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: sl((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		al = Array.from(e.values()), ol();
	}
};
y("stock", {
	repository: cl,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: al }),
	restore: (e) => {
		al = e.balances;
	},
	publish: () => il.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/goodsReceiptRepository.ts
var ll = /* @__PURE__ */ new Set(), ul = k.read().goodsReceipts;
k.onRollback(() => {
	ul = k.read().goodsReceipts;
});
function dl() {
	try {
		k.update("goodsReceipts", ul);
	} catch (e) {
		throw ul = k.read().goodsReceipts, e;
	}
	ll.forEach((e) => k.notify(e));
}
function fl(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function pl(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = ul.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function ml(e) {
	return e?.trim() || void 0;
}
var hl = {
	subscribe(e) {
		return ll.add(e), () => {
			ll.delete(e);
		};
	},
	getSnapshot() {
		return ul;
	},
	getAll() {
		return ul;
	},
	getById(e) {
		return ul.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return ul.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = gc.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = Nc.getById(e.siteId);
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
			let r = fl(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!B(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = Oi(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = fl(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: pl(e.receiptDate),
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
			supplierDeliveryReference: ml(e.supplierDeliveryReference),
			notes: ml(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		jc.validateGoodsReceiptPosting(s), N();
		let c = M.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return M.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = B(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				M.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = Rc.create({
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
					tl({
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
					cl.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			M.runStep(c, "JOURNAL", () => {
				jc.postGoodsReceipt(s);
			}), M.runStep(c, "PURCHASE_ORDER", () => {
				gc.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), M.runStep(c, "RECEIPT", () => {
				ul = [s, ...ul], dl();
			});
		}), M.recover(c), s;
	}
};
y("goodsReceipts", {
	repository: hl,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: ul }),
	restore: (e) => {
		ul = e.goodsReceipts;
	},
	publish: () => ll.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var gl = 1e-4;
function _l(e) {
	return bc(e);
}
function vl(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - G(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function yl(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function bl(e, t, n) {
	let r = xc({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return Sc({
		quantityBase: G(e * n),
		unitCostBase: r
	});
}
function xl(e, t, n) {
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
function Sl(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = xl(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), vl(e.quantity), yl(e.billUnitCost);
		let r = G(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > gl);
		if (G(d.reduce((e, t) => e + t.availableQuantity, 0)) + gl < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= gl) break;
			let s = G(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = G(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = Sc({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: xc({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = _l(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), h = Math.abs(o.availableQuantity - s) <= gl ? _l(p - m) : bl(s, o.receiptUnitCost, o.conversionToBase);
			if (h < 0) throw Error("Receipt cost has been overallocated.");
			let g = _l(s * e.billUnitCost), ee = _l(g - h);
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
		if (r > gl) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = _l(_l(e.quantity * e.billUnitCost) - _l(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = _l(p.matchedBillValue + f), p.priceVariance = _l(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = G(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = G(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = _l(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = _l(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: _l(p - f)
	};
}
var Cl = {
	calculate: Sl,
	getAvailableReceiptLines(e, t, n) {
		return xl(e, t, n);
	}
}, wl = k.read().receiptMatches;
k.onRollback(() => {
	wl = k.read().receiptMatches;
});
var Tl = /* @__PURE__ */ new Set(), El = () => {
	try {
		k.update("receiptMatches", wl);
	} catch (e) {
		throw wl = k.read().receiptMatches, e;
	}
	Tl.forEach((e) => k.notify(e));
}, Dl = {
	getAll() {
		return [...wl];
	},
	subscribe(e) {
		return Tl.add(e), () => {
			Tl.delete(e);
		};
	},
	getSnapshot() {
		return wl;
	},
	getByBill(e) {
		return wl.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (wl.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		wl = [...wl, ...t], El();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		wl = wl.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), El();
	}
};
y("receiptMatches", {
	repository: Dl,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: wl }),
	restore: (e) => {
		wl = e.matches;
	},
	publish: () => Tl.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
function Ol(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function kl({ quantity: e, unitCost: t, inclusiveLineTotal: n, taxRate: r = .1 }) {
	let i = Ol(e * t), a = Ol(n === void 0 ? i * r : n - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: Ol(i + a)
	};
}
function Al(e) {
	let t = Ol(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Ol(e.reduce((e, t) => e + t.taxAmount, 0)), r = Ol(t + n);
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
var jl = /* @__PURE__ */ new Set(), K = k.read().supplierBills;
k.onRollback(() => {
	K = k.read().supplierBills;
});
function Ml() {
	try {
		k.update("supplierBills", K);
	} catch (e) {
		throw K = k.read().supplierBills, e;
	}
	jl.forEach((e) => k.notify(e));
}
function Nl(e) {
	return e?.trim() || void 0;
}
function Pl(e) {
	return he("BILL", K.map((e) => e.billNumber), e.slice(0, 4));
}
var Fl = {
	insertExpenseBill(e) {
		let t = K.find((t) => t.managedDraftId === e.managedDraftId);
		if (t) return t;
		if (K.some((t) => t.supplierId === e.supplierId && t.supplierInvoiceNumber.toLowerCase() === e.supplierInvoiceNumber.toLowerCase() && t.status !== "VOID")) throw Error("Supplier invoice reference already exists.");
		return K = [e, ...K], Ml(), e;
	},
	subscribe(e) {
		return jl.add(e), () => {
			jl.delete(e);
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
		let r = Ll(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = Ll(n.totals.amountPaid + r), a = Ll(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((t) => t.id === e ? o : t), Ml(), o;
	},
	reversePayment(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = Ll(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = Ll(Math.max(0, n.totals.amountPaid - r)), a = Ll(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((t) => t.id === e ? o : t), Ml(), o;
	},
	applyCredit(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = Ll(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = Ll(n.totals.amountCredited + r), a = Ll(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((t) => t.id === e ? o : t), Ml(), o;
	},
	reverseCredit(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = Ll(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = Ll(Math.max(0, n.totals.amountCredited - r)), a = Ll(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((t) => t.id === e ? o : t), Ml(), o;
	},
	markVoid(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("This supplier bill has already been voided.");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required.");
		if (n.status !== "OPEN" || n.totals.amountPaid > 0 || n.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if ((C().supplierCredits?.supplierCredits ?? k.read().supplierCredits).some((e) => e.sourceSupplierBillId === n.id && e.status !== "VOID")) throw Error("Reverse source supplier credits and linked physical returns before voiding the bill.");
		if (n.kind === "EXPENSE") {
			N();
			let e = (/* @__PURE__ */ new Date()).toISOString(), t = {
				...n,
				status: "VOID",
				voidedAt: e,
				voidReason: r,
				updatedAt: e
			};
			return jc.reverseSupplierBill(t), K = K.map((e) => e.id === n.id ? t : e), Ml(), t;
		}
		if (Dl.getByBill(n.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
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
				jc.reverseSupplierBill(a);
			}), M.runStep(o, "PURCHASE_ORDER", () => {
				gc.reverseSupplierBill(n.purchaseOrderId, n.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), M.runStep(o, "MATCHES", () => {
				Dl.reverseForBill(n.id, r, fe(i));
			}), M.runStep(o, "BILL", () => {
				K = K.map((e) => e.id === n.id ? a : e), Ml();
			});
		}), M.recover(o), a;
	},
	getByPurchaseOrder(e) {
		return K.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = gc.getById(e.purchaseOrderId);
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
			let r = Il(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = kl({
				taxRate: a,
				quantity: e.quantity,
				unitCost: e.unitCost
			});
			return n.grossUnitCost !== void 0 && e.unitCost === n.unitCost && (o.taxAmount = Ll(e.quantity * n.grossUnitCost - o.lineSubtotal), o.lineTotal = Ll(o.lineSubtotal + o.taxAmount)), {
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
		}), o = Al(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: Pl(e.billDate),
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
			notes: Nl(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = Cl.calculate({
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
			receipts: hl.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: Dl.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		jc.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), N();
		let u = M.begin("SUPPLIER_BILL", c.id).key;
		return M.registerRecovery(u, () => {
			M.runStep(u, "JOURNAL", () => {
				jc.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), M.runStep(u, "PURCHASE_ORDER", () => {
				gc.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), M.runStep(u, "MATCHES", () => {
				Dl.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), M.runStep(u, "BILL", () => {
				K = [c, ...K], Ml();
			});
		}), M.recover(u), c;
	}
};
function Il(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Ll(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
y("supplierBills", {
	repository: Fl,
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
	publish: () => jl.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var Rl = /* @__PURE__ */ new Set(), q = k.read().supplierCredits, zl = k.read().supplierCreditAllocations, Bl = k.read().supplierCredits, Vl = k.read().supplierCreditAllocations;
k.onRollback(() => {
	q = k.read().supplierCredits, zl = k.read().supplierCreditAllocations, Bl = q, Vl = zl;
});
function Hl() {
	k.update("supplierCredits", q), k.update("supplierCreditAllocations", zl), Bl = [...q], Vl = [...zl], Rl.forEach((e) => k.notify(e));
}
var Ul = !1, J = {
	subscribe(e) {
		return Rl.add(e), () => {
			Rl.delete(e);
		};
	},
	getSnapshot() {
		return Bl;
	},
	getAllocationSnapshot() {
		return Vl;
	},
	getAll() {
		return Bl;
	},
	getAllAllocations() {
		return Vl;
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
		return zl.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return zl.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return zl.filter((t) => t.supplierBillId === e);
	},
	createReturnCredit(e, t) {
		let n = {
			...J.create(e),
			physicalReturnId: t
		};
		return J.update(n), n;
	},
	voidReturnCredit(e) {
		Ul = !0;
		try {
			return J.voidCredit(e);
		} finally {
			Ul = !1;
		}
	},
	create(e) {
		let t = Fl.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (q.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!ql(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, n) => {
			let r = i.get(e.supplierBillLineId);
			if (!r) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(r.id)) throw Error(`${r.description} appears more than once in the supplier credit.`);
			a.add(r.id);
			let o = Yl(e.quantity);
			if (!Number.isFinite(o) || o <= 0) throw Error(`${r.description} credit quantity must be greater than zero.`);
			if (o > r.quantity) throw Error(`${r.description} credit quantity cannot exceed the source bill quantity.`);
			let s = e.unitCost;
			if (!Number.isFinite(s) || s < 0) throw Error(`${r.description} unit cost cannot be negative.`);
			if (s > r.unitCost + 1e-8) throw Error(`${r.description} credit unit cost cannot exceed the source bill unit cost.`);
			let c = q.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.supplierBillLineId === r.id), l = Math.abs(s - r.unitCost) < 1e-8, u = c.every((e) => Math.abs(e.unitCost - r.unitCost) < 1e-8), d = l && u && Math.abs(o + c.reduce((e, t) => e + t.quantity, 0) - r.quantity) < 1e-8, f = c.reduce((e, t) => e + t.lineSubtotal, 0), p = c.reduce((e, t) => e + t.taxAmount, 0), m = Jl(d ? r.lineSubtotal - f : l ? r.lineSubtotal * o / r.quantity : o * s), h = Jl(d ? r.taxAmount - p : r.unitCost ? r.taxAmount * o / r.quantity * s / r.unitCost : 0);
			if (m < 0 || h < 0 || Jl(m + f) > r.lineSubtotal || Jl(h + p) > r.taxAmount) throw Error("Credit line value exceeds the uncredited source bill line.");
			let g = Jl(m + h);
			return {
				id: Kl(`supplier-credit-line-${n + 1}`),
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
		}), s = Jl(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = Jl(o.reduce((e, t) => e + t.taxAmount, 0)), l = Jl(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (Jl(Jl(q.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > Jl(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: Kl("supplier-credit"),
			creditNumber: Gl(e.creditDate),
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
		return q = [d, ...q], Hl(), jc.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = q.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = Fl.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!ql(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = Jl(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: Kl("supplier-credit-allocation"),
			allocationNumber: Wl(e.allocationDate),
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
		Fl.applyCredit(n.id, r);
		let o = Jl(t.amountApplied + r), s = Jl(Math.max(0, t.totals.total - (t.amountRefunded ?? 0) - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return zl = [a, ...zl], q = q.map((e) => e.id === t.id ? c : e), Hl(), a;
	},
	reverseAllocation(e) {
		let t = zl.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = q.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = Fl.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		Fl.reverseCredit(i.id, t.amount);
		let o = Jl(Math.max(0, r.amountApplied - t.amount)), s = Jl(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - o)), c = {
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
		return q = q.map((e) => e.id === r.id ? c : e), zl = zl.map((e) => e.id === t.id ? l : e), Hl(), l;
	},
	voidCredit(e) {
		let t = q.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		if (t.physicalReturnId && !Ul) throw Error("Reverse the linked physical supplier return instead of voiding its credit separately.");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse supplier refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (zl.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: Ul && e.voidDate ? e.voidDate : r,
			voidReason: n,
			updatedAt: r
		};
		return q = q.map((e) => e.id === t.id ? i : e), Hl(), jc.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!zl.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return zl = zl.map((t) => t.id === e.id ? e : t), Hl(), e;
	},
	update(e) {
		if (!q.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return q = q.map((t) => t.id === e.id ? e : t), Hl(), e;
	}
};
function Wl(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = zl.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Gl(e) {
	return he("SC", q.map((e) => e.creditNumber), e.slice(0, 4));
}
function Kl(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function ql(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function Jl(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Yl(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var Xl = J.create;
J.create = function(...e) {
	return N(), k.transaction(() => Xl.apply(J, e));
};
var Zl = J.applyToBill;
J.applyToBill = function(...e) {
	return N(), k.transaction(() => Zl.apply(J, e));
};
var Ql = J.reverseAllocation;
J.reverseAllocation = function(...e) {
	return N(), k.transaction(() => Ql.apply(J, e));
};
var $l = J.voidCredit;
J.voidCredit = function(...e) {
	return N(), k.transaction(() => $l.apply(J, e));
};
var eu = J.update;
J.update = function(...e) {
	return N(), k.transaction(() => eu.apply(J, e));
};
var tu = J.updateAllocation;
J.updateAllocation = function(...e) {
	return N(), k.transaction(() => tu.apply(J, e));
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
		allocations: zl
	}),
	restore: (e) => {
		q = e.supplierCredits, zl = e.allocations, Bl = [...q], Vl = [...zl];
	},
	publish: () => Rl.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/profitAndLossService.ts
function nu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ru(e, t) {
	S(e, t);
}
function iu(e, t, n, r) {
	if (ru(n, "From date"), ru(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = t.filter((e) => e.journalDate >= n && e.journalDate <= r), a = au(e.filter((e) => e.type === "REVENUE"), i, "REVENUE"), o = au(e.filter((e) => e.type === "EXPENSE"), i, "EXPENSE"), s = nu(a.reduce((e, t) => e + t.amount, 0)), c = nu(o.reduce((e, t) => e + t.amount, 0)), l = e.find((e) => e.systemRole === "SALES_REVENUE");
	if (!l) throw Error("Sales Revenue system account was not found.");
	if (l.type !== "REVENUE") throw Error("Sales Revenue system account must be a revenue account.");
	let u = e.find((e) => e.systemRole === "COST_OF_GOODS_SOLD");
	if (!u) throw Error("Cost of Goods Sold system account was not found.");
	if (u.type !== "EXPENSE") throw Error("Cost of Goods Sold system account must be an expense account.");
	let d = nu(a.find((e) => e.accountId === l.id)?.amount ?? 0), f = nu(o.find((e) => e.accountId === u.id)?.amount ?? 0), p = nu(d - f);
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
		operatingExpenses: nu(c - f),
		totalExpenses: c,
		netProfit: nu(s - c)
	};
}
function au(e, t, n) {
	return e.map((e) => {
		let r = 0, i = 0;
		for (let n of t) for (let t of n.lines) t.accountId === e.id && (r = nu(r + t.debit), i = nu(i + t.credit));
		let a = nu(n === "REVENUE" ? i - r : r - i);
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
function ou(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function su(e) {
	S(e);
}
function cu(e, t) {
	let n = 0, r = 0;
	for (let i of t) for (let t of i.lines) t.accountId === e.id && (n = ou(n + t.debit), r = ou(r + t.credit));
	return e.type === "ASSET" || e.type === "EXPENSE" ? ou(n - r) : ou(r - n);
}
function lu(e, t, n) {
	return e.filter((e) => e.type === n).map((e) => ({
		accountId: e.id,
		accountCode: e.code,
		accountName: e.name,
		amount: cu(e, t)
	})).filter((e) => e.amount !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 }));
}
function uu(e) {
	return ou(e.reduce((e, t) => e + t.amount, 0));
}
function du(e, t, n) {
	su(n);
	let r = t.filter((e) => e.journalDate <= n), i = lu(e, r, "ASSET"), a = lu(e, r, "LIABILITY"), o = lu(e, r, "EQUITY"), s = e.filter((e) => e.type === "REVENUE"), c = e.filter((e) => e.type === "EXPENSE"), l = ou(s.reduce((e, t) => e + cu(t, r), 0)), u = ou(c.reduce((e, t) => e + cu(t, r), 0)), d = uu(i), f = uu(a), p = uu(o), m = ou(l - u), h = ou(p + m), g = ou(f + h), ee = ou(d - g);
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
function fu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function pu(e, t) {
	S(e, t);
}
function mu(e, t) {
	let n = fu(e - t);
	return n >= 0 ? {
		debit: n,
		credit: 0
	} : {
		debit: 0,
		credit: fu(Math.abs(n))
	};
}
function hu(e, t, n, r) {
	if (pu(n, "From date"), pu(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = e.map((e) => {
		let i = 0, a = 0, o = 0, s = 0;
		for (let c of t) for (let t of c.lines) if (t.accountId === e.id) {
			if (c.journalDate < n) {
				i = fu(i + t.debit), a = fu(a + t.credit);
				continue;
			}
			c.journalDate <= r && (o = fu(o + t.debit), s = fu(s + t.credit));
		}
		let c = mu(i, a), l = mu(fu(i + o), fu(a + s));
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
	}).filter((e) => e.openingDebit !== 0 || e.openingCredit !== 0 || e.periodDebit !== 0 || e.periodCredit !== 0 || e.closingDebit !== 0 || e.closingCredit !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 })), a = fu(i.reduce((e, t) => e + t.openingDebit, 0)), o = fu(i.reduce((e, t) => e + t.openingCredit, 0)), s = fu(i.reduce((e, t) => e + t.periodDebit, 0)), c = fu(i.reduce((e, t) => e + t.periodCredit, 0)), l = fu(i.reduce((e, t) => e + t.closingDebit, 0)), u = fu(i.reduce((e, t) => e + t.closingCredit, 0)), d = fu(l - u);
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
function gu(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function _u(e, t) {
	S(e, t);
}
function vu(e, t, n) {
	_u(e.openingBalanceDate, "Opening balance date"), _u(n, "As-at date");
	let r = t.filter((t) => t.journalDate >= e.openingBalanceDate && t.journalDate <= n).flatMap((t) => t.lines.filter((t) => t.accountId === e.glAccountId).map((e) => ({
		entry: t,
		line: e
	}))).sort((e, t) => {
		let n = e.entry.journalDate.localeCompare(t.entry.journalDate);
		if (n !== 0) return n;
		let r = e.entry.createdAt.localeCompare(t.entry.createdAt);
		return r === 0 ? e.line.id.localeCompare(t.line.id) : r;
	}), i = gu(e.openingBalance), a = 0, o = 0, s = r.map(({ entry: t, line: n }) => {
		let r = gu(n.debit), s = gu(n.credit);
		return a = gu(a + r), o = gu(o + s), i = gu(i + r - s), {
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
		openingBalance: gu(e.openingBalance),
		moneyIn: a,
		moneyOut: o,
		closingBalance: i,
		transactionCount: s.length,
		transactions: s
	};
}
//#endregion
//#region src/features/cash-reports/cashReportService.ts
var yu = [
	"Customer receipts & reversals",
	"Customer refunds & reversals",
	"Supplier payments & reversals",
	"Supplier refunds & reversals",
	"Bank opening adjustments",
	"Transfers across selection",
	"Other bank movements / review"
], bu = (e) => Math.round(e * 100), xu = (e) => e / 100;
function Su(e) {
	switch (e.sourceType) {
		case "CUSTOMER_PAYMENT":
		case "CUSTOMER_PAYMENT_REVERSAL": return yu[0];
		case "CUSTOMER_REFUND": return yu[1];
		case "SUPPLIER_PAYMENT":
		case "SUPPLIER_PAYMENT_REVERSAL": return yu[2];
		case "SUPPLIER_REFUND": return yu[3];
		case "OPENING_BALANCE": return yu[4];
		case "BANK_TRANSFER": return yu[5];
		default: return yu[6];
	}
}
function Cu(e) {
	if (S(e.from, "From date"), S(e.to, "To date"), e.from > e.to) throw Error("From date must not exceed To date.");
	if (!e.currency.trim()) throw Error("Select a currency.");
	let t = new Map(e.bankAccounts.map((e) => [e.id, e]));
	if (t.size !== e.bankAccounts.length) throw Error("Duplicate bank account IDs require review.");
	if (e.bankIds && (new Set(e.bankIds).size !== e.bankIds.length || e.bankIds.some((e) => !t.has(e)))) throw Error("Invalid bank account selection.");
	let n = e.bankAccounts.filter((t) => (!e.bankIds || e.bankIds.includes(t.id)) && t.currency === e.currency);
	if (e.bankIds?.some((n) => t.get(n).currency !== e.currency)) throw Error("Selected banks must use the report currency.");
	for (let t of n) {
		if (e.bankAccounts.filter((e) => e.glAccountId === t.glAccountId).length !== 1) throw Error("Duplicate bank GL mappings require review before reporting.");
		S(t.openingBalanceDate, "Bank opening date");
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
		let n = vu(t, e.journalEntries, e.to), o = t.openingBalanceDate < e.from ? bu(t.openingBalance) : 0, s = 0, c = 0;
		if (t.openingBalanceDate >= e.from && t.openingBalance !== 0) {
			let e = bu(t.openingBalance);
			a.push({
				id: `setup:${t.id}`,
				bankId: t.id,
				bankName: t.name,
				date: t.openingBalanceDate,
				description: "Bank setup opening balance (not a cash receipt)",
				sourceType: "BANK_SETUP",
				category: yu[4],
				moneyIn: xu(Math.max(e, 0)),
				moneyOut: xu(Math.max(-e, 0))
			}), s += Math.max(e, 0), c += Math.max(-e, 0);
		}
		for (let i of n.transactions) {
			if (i.transactionDate < e.from) {
				o += bu(i.moneyIn) - bu(i.moneyOut);
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
				category: Su(n),
				moneyIn: i.moneyIn,
				moneyOut: i.moneyOut
			}), s += bu(i.moneyIn), c += bu(i.moneyOut);
		}
		let l = bu(n.closingBalance);
		return {
			bankId: t.id,
			name: t.name,
			active: t.active,
			opening: xu(o),
			moneyIn: xu(s),
			moneyOut: xu(c),
			closing: xu(l),
			difference: xu(o + s - c - l)
		};
	}), s = new Map(yu.map((e) => [e, {
		category: e,
		moneyIn: 0,
		moneyOut: 0,
		net: 0
	}])), c = /* @__PURE__ */ new Map();
	for (let e of a) {
		if (e.category === yu[5]) {
			let t = e.journalId;
			c.set(t, (c.get(t) ?? 0) + bu(e.moneyIn) - bu(e.moneyOut));
			continue;
		}
		let t = s.get(e.category);
		t.moneyIn += bu(e.moneyIn), t.moneyOut += bu(e.moneyOut);
	}
	for (let e of c.values()) {
		let t = s.get(yu[5]);
		t.moneyIn += Math.max(e, 0), t.moneyOut += Math.max(-e, 0);
	}
	let l = [...s.values()].map((e) => ({
		category: e.category,
		moneyIn: xu(e.moneyIn),
		moneyOut: xu(e.moneyOut),
		net: xu(e.moneyIn - e.moneyOut)
	})), u = (e) => xu(o.reduce((t, n) => t + bu(n[e]), 0)), d = u("opening"), f = u("closing"), p = xu(l.reduce((e, t) => e + bu(t.net), 0)), m = a.filter((e) => e.category === yu[6]).length;
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
		difference: xu(bu(d) + bu(p) - bu(f))
	};
}
//#endregion
//#region src/features/net-analysis/netAnalysisService.ts
var wu = (e) => Math.round(e * 100);
function Tu(e) {
	for (let t of [
		e.subtotal,
		e.tax,
		e.total
	]) if (!Number.isFinite(t) || t < 0 || Math.abs(t * 100 - wu(t)) > 1e-6) throw Error(`${e.number}: invalid saved monetary totals.`);
	if (wu(e.subtotal) + wu(e.tax) !== wu(e.total)) throw Error(`${e.number}: saved net, tax and gross do not reconcile.`);
}
function Eu(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) {
		if (r.status === "DRAFT" || r.openingBalanceImportId) continue;
		let e = `${r.kind}:${r.id}`;
		if (t.has(e)) throw Error(`Duplicate analysis source: ${r.number}.`);
		t.add(e), S(r.date, `Document date (${r.number})`), Tu(r);
		let i = r.kind === "CUSTOMER_CREDIT" || r.kind === "SUPPLIER_CREDIT", a = i ? -1 : 1, { voidedAt: o, openingBalanceImportId: s, ...c } = r, l = (t, n, i) => ({
			...c,
			date: t,
			eventId: `${e}:${i}`,
			event: i,
			subtotal: wu(r.subtotal) * n / 100,
			tax: wu(r.tax) * n / 100,
			total: wu(r.total) * n / 100
		});
		if (n.push(l(r.date, a, i ? "CREDIT" : "DOCUMENT")), r.status === "VOID") {
			if (!r.voidedAt) throw Error(`${r.number}: void date is missing. Review the source record before reporting.`);
			let e = fe(r.voidedAt);
			if (S(e, `Void date (${r.number})`), e < r.date) throw Error(`${r.number}: void date precedes the original document.`);
			n.push(l(e, -a, "VOID"));
		}
	}
	return n.sort((e, t) => e.date.localeCompare(t.date) || e.number.localeCompare(t.number) || e.eventId.localeCompare(t.eventId));
}
function Du(e, t) {
	if (S(t.from, "From date"), S(t.to, "To date"), t.from > t.to) throw Error("From date must not exceed To date.");
	let n = t.query?.trim().toLowerCase() ?? "", r = Eu(e).filter((e) => e.date >= t.from && e.date <= t.to && (!t.partyId || e.partyId === t.partyId) && (!t.event || t.event === "ALL" || e.event === t.event) && `${e.number} ${e.partyName} ${e.partyId} ${e.kind}`.toLowerCase().includes(n)), i = (e, t) => e.reduce((e, n) => e + wu(n[t]), 0) / 100, a = {
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
function Ou(e, t, n) {
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
function ku(e, t) {
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
var Au = [
	"Profit & loss",
	"Balance sheet",
	"Trial balance",
	"Cash flow",
	"Net sales",
	"Net purchases"
];
function ju(e) {
	let t = e.split(",").map((e) => e.trim());
	if (!t.length || t.length > Au.length || t.some((e) => !e)) throw Error("Select one to six supported reports.");
	let n = t.map((e) => Au.find((t) => t.toLowerCase() === e.toLowerCase()));
	if (n.some((e) => !e)) throw Error(`Supported reports: ${Au.join(", ")}.`);
	if (new Set(n).size !== n.length) throw Error("Each report may appear only once in a pack.");
	return n;
}
var Mu = (e) => JSON.stringify(e);
function Nu(e, t, n) {
	if (S(e.periodStart, "From date"), S(e.periodEnd, "To date"), e.periodStart > e.periodEnd) throw Error("From date must not exceed To date.");
	let r = ju(e.reports), i = e.periodStart, a = e.periodEnd, o = r.map((e) => {
		if (e === "Profit & loss") {
			let n = iu(t.accounts, t.journals, i, a);
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
			let n = du(t.accounts, t.journals, a);
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
			let n = hu(t.accounts, t.journals, i, a);
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
			let n = Cu({
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
		let n = e === "Net purchases", r = Du(n ? ku(t.bills, t.supplierCredits) : Ou(t.documents, t.customerCredits, t.customers), {
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
		sourceSignature: Mu(t),
		sections: o
	});
}
//#endregion
//#region src/features/report-packs/reportPackCommand.ts
function Pu() {
	let e = _();
	return {
		accounts: O.getAll(),
		journals: A.getAll(),
		banks: Mt.getAll(),
		documents: W.getAll(),
		customerCredits: H.getAll(),
		customers: z.getAll().map((e) => ({
			id: e.id,
			businessName: e.businessName
		})),
		bills: Fl.getAll(),
		supplierCredits: J.getAll(),
		company: {
			name: e.companyName,
			currency: e.currency,
			timezone: e.timezone
		}
	};
}
function Fu(e) {
	let n = T.require("accounting.read"), r = t({
		id: a().trim().min(1).max(200),
		expectedRevision: a().regex(/^\d+$/)
	}).strict().parse(e), i = x["report-packs"]?.find((e) => e.id === r.id);
	if (!i) throw Error("Report pack configuration was not found.");
	if (i.revision !== r.expectedRevision) throw Error("Report pack changed. Reload before generating.");
	if (i.status !== "Active") throw Error("Activate this report pack before generating.");
	return Nu({
		id: i.id,
		revision: i.revision,
		name: i.name,
		cover: i.cover,
		introduction: i.introduction,
		periodStart: i.periodStart,
		periodEnd: i.periodEnd,
		reports: i.reports
	}, Pu(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: n.userId
	});
}
//#endregion
//#region src/features/saved-reports/savedReportService.ts
var Iu = [
	"Sales",
	"Purchases",
	"Banking",
	"General ledger"
], Y = (e, t, n = !1) => ({
	key: e,
	label: t,
	numeric: n
}), Lu = [
	Y("date", "Date"),
	Y("number", "Document"),
	Y("contact", "Contact"),
	Y("partyId", "Contact ID"),
	Y("activity", "Activity"),
	Y("status", "Current status"),
	Y("net", "Net", !0),
	Y("tax", "Tax", !0),
	Y("gross", "Gross", !0)
], Ru = {
	Sales: Lu,
	Purchases: Lu,
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
}, zu = (e) => e === "Banking" ? "Cash" : "Accrual", Bu = t({
	from: a(),
	to: a(),
	query: a().max(500).default(""),
	partyId: a().max(200).optional(),
	bankId: a().max(200).optional(),
	accountId: a().max(200).optional(),
	currency: a().min(1).max(10).optional()
}).strict();
function Vu(e) {
	let t = f(Iu).parse(e.dataset);
	if (e.basis !== zu(t)) throw Error(`${t} uses ${zu(t)} basis. Cash-basis sales/purchase recognition is not available.`);
	if (e.favourite !== void 0 && !["Yes", "No"].includes(e.favourite)) throw Error("Favourite must be Yes or No.");
	let n;
	try {
		n = JSON.parse(e.filter ?? "");
	} catch {
		throw Error("Legacy filter text is not executable. Edit and save explicit report dates and filters.");
	}
	let r = Bu.parse(n);
	if (S(r.from, "From date"), S(r.to, "To date"), r.from > r.to) throw Error("From date must not exceed To date.");
	if (t !== "Sales" && t !== "Purchases" && r.partyId) throw Error("Contact filters require Sales or Purchases.");
	if (t !== "Banking" && (r.bankId || r.currency)) throw Error("Bank and currency filters require Banking.");
	if (t !== "General ledger" && r.accountId) throw Error("Account filters require General ledger.");
	let i = e.columns.split(",").map((e) => e.trim()), a = t === "Sales" || t === "Purchases" ? {
		customer: "contact",
		supplier: "contact",
		gst: "tax",
		total: "gross"
	} : {}, o = i.map((e) => Ru[t].find((t) => t.label.toLowerCase() === e.toLowerCase() || t.key.toLowerCase() === (a[e.toLowerCase()] ?? e.toLowerCase())));
	if (!i.length || i.length > Ru[t].length || o.some((e) => !e) || new Set(o.map((e) => e?.key)).size !== o.length) throw Error(`Select distinct supported columns for ${t}: ${Ru[t].map((e) => e.label).join(", ")}.`);
	return {
		dataset: t,
		filters: r,
		columns: o
	};
}
var Hu = (e, t) => e.reduce((e, n) => {
	let r = Number(n.values[t]), i = e + Math.round(r * 100);
	if (!Number.isFinite(r) || !Number.isSafeInteger(i)) throw Error("Report monetary total exceeds supported cents precision.");
	return i;
}, 0) / 100;
function Uu(e, t, n) {
	let { dataset: r, filters: i, columns: a } = Vu(e), o = i.query.trim().toLowerCase(), s = [], c = [], l = [], u = t.company.currency;
	if (r === "Sales" || r === "Purchases") {
		let e = r === "Sales" ? Ou(t.documents, t.customerCredits, t.customers) : ku(t.bills, t.supplierCredits);
		if (i.partyId && !e.some((e) => e.partyId === i.partyId) && !(r === "Sales" && t.customers.some((e) => e.id === i.partyId))) throw Error("Selected contact is not available in this dataset.");
		let n = {
			DOCUMENT: "Original document",
			CREDIT: "Credit note",
			VOID: "Void reversal"
		};
		s = Eu(e).filter((e) => e.date >= i.from && e.date <= i.to && (!i.partyId || e.partyId === i.partyId)).map((e) => ({
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
		let e = Cu({
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
		value: Hu(s, t)
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
		sourceSignature: Mu(t),
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
function Wu(e) {
	let n = T.require("accounting.read"), r = t({
		id: a().trim().min(1).max(200),
		expectedRevision: a().regex(/^\d+$/)
	}).strict().parse(e), i = x["custom-reports"]?.find((e) => e.id === r.id);
	if (!i) throw Error("Saved report was not found.");
	if (i.revision !== r.expectedRevision) throw Error("Saved report changed. Reload before running.");
	if (i.status !== "Active") throw Error("Activate this saved report before running.");
	return Uu({
		id: i.id,
		revision: i.revision,
		name: i.name,
		dataset: i.dataset,
		columns: i.columns,
		basis: i.basis,
		filter: i.filter,
		favourite: i.favourite
	}, Pu(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: n.userId
	});
}
//#endregion
//#region src/features/business-workspace/workspaceRepository.ts
var Gu = ee(a(), a().max(2e4)), Ku = [
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
], qu = () => (/* @__PURE__ */ new Date()).toISOString(), Ju = {
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
}, Yu = /* @__PURE__ */ new Set(), Xu = 0, Zu = () => {
	Xu++, Yu.forEach((e) => e());
}, Qu = Object.fromEntries(Object.keys(Ju).map((e) => [e, []]));
for (let e of Object.keys(Ju)) x[e] = [];
var $u = () => ({
	collected: O.getAll().find((e) => e.systemRole === "GST_PAYABLE")?.id ?? "",
	paid: O.getAll().find((e) => e.systemRole === "GST_RECEIVABLE")?.id ?? ""
});
x["tax-codes"] = [{
	id: "tax-gst",
	name: "GST",
	status: "Active",
	revision: "1",
	createdAt: qu(),
	updatedAt: qu(),
	code: "GST",
	rate: "10",
	basis: "Exclusive",
	report: "GST",
	...$u()
}, {
	id: "tax-zero",
	name: "Zero rated",
	status: "Active",
	revision: "1",
	createdAt: qu(),
	updatedAt: qu(),
	code: "ZERO",
	rate: "0",
	basis: "Exclusive",
	report: "Zero rated",
	...$u()
}];
function ed(e, t) {
	if (!e?.trim()) throw Error(`${t} is required.`);
}
function td(e, t) {
	if (!e?.trim() || !Number.isFinite(Number(e)) || Number(e) < 0) throw Error(`${t} must be a non-negative number.`);
}
function nd(e, t) {
	let n = O.getAll().find((t) => t.id === e);
	if (!n?.active || t && n.type !== t) throw Error("Select an active account of the correct type.");
	return n;
}
function rd(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && (/* @__PURE__ */ new Date(e + "T00:00:00Z")).toISOString().slice(0, 10) === e;
}
function id(e, t, n, r = !0) {
	let i = Ju[e];
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
	ed(t.name, "Name");
	for (let e of i.required) ed(t[e], e);
	if (![
		"Active",
		"Inactive",
		"Open",
		"In progress",
		"Completed"
	].includes(t.status ?? "Active")) throw Error("Invalid business status.");
	if (e === "tax-codes") {
		if (td(t.rate, "Tax rate"), t.basis && !["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid entry basis.");
		if (r) {
			let e = n.find((e) => e.id === t.id), r = C(), i = x.settings?.find((e) => e.section === "business" && e.status === "Active")?.gstCode ?? "GST";
			if (t.status === "Inactive" && t.code === i) throw Error("The default tax code must remain active. Change the business default first.");
			if (e && e.code !== t.code && (e.code === i || r.products.products.some((t) => (t.taxCode ?? "GST") === e.code) || (x["bank-rules"] ?? []).some((t) => t.taxCode === e.code))) throw Error("A referenced tax code cannot be renamed. Create a new code and update future-use references.");
		}
		if (Number(t.rate) > 100) throw Error("Tax rate cannot exceed 100%.");
		if (r) {
			let e = nd(t.collected, "LIABILITY"), n = nd(t.paid, "ASSET"), r = (C().bankAccounts?.bankAccounts ?? []).map((e) => e.glAccountId);
			if (e.systemRole && e.systemRole !== "GST_PAYABLE" || n.systemRole && n.systemRole !== "GST_RECEIVABLE" || r.includes(n.id)) throw Error("Tax mappings cannot use AR/AP, inventory, GRNI or bank control accounts.");
		}
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Tax code must be unique.");
		if (!/^[A-Z0-9_-]{1,24}$/.test(t.code)) throw Error("Use uppercase letters/numbers for a tax code.");
	}
	if (e === "linked-accounts" && r) {
		let e = O.requireBySystemRole(t.role), n = t.status === "Inactive" ? O.getAll().find((e) => e.systemRole === t.role)?.id : t.accountId, r = C().journals?.journalEntries ?? [];
		if (n !== e.id && r.some((t) => t.lines.some((t) => t.accountId === e.id || t.accountId === n))) throw Error("A used posting account cannot be remapped without a ledger migration.");
	}
	if (e === "linked-accounts") {
		if (!Ku.includes(t.role)) throw Error("Unknown account role.");
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
		if (r && nd(t.accountId, e), n.some((e) => e.id !== t.id && e.role === t.role)) throw Error("A linked account role may only have one mapping.");
	}
	if (e === "promotions") {
		let e = B(t.productId);
		if (r && (!e || !Oi(e.id, t.unitId))) throw Error("Product/unit not found.");
		if (td(t.price, "Price"), !Number.isInteger(Number(t.priority))) throw Error("Priority must be an integer.");
		if (![
			"Customer price first",
			"Promotion first",
			"Lowest eligible price"
		].includes(t.policy)) throw Error("Invalid price conflict policy.");
		if (!/([+-]\d\d:\d\d|Z)$/.test(t.starts) || !Number.isFinite(Date.parse(t.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(t.ends) || !Number.isFinite(Date.parse(t.ends)) || Date.parse(t.ends) <= Date.parse(t.starts)) throw Error("Promotion requires explicit time offsets and an end after start.");
	}
	if (r && t.customerId && !z.getById(t.customerId)) throw Error("Customer was not found.");
	if (e === "jobs") {
		if (td(t.budget, "Revenue budget"), td(t.costBudget, "Cost budget"), r) for (let e of ["budget", "costBudget"]) {
			let n = Number(t[e]);
			if (!Number.isSafeInteger(Math.round(n * 100)) || Math.abs(Math.round(n * 100) / 100 - n) > 1e-7) throw Error("Project budgets require safe currency amounts with at most two decimals.");
		}
		if (!rd(t.starts) || !rd(t.ends) || t.ends < t.starts) throw Error("Invalid project dates.");
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Job code must be unique.");
	}
	if (e === "tasks") {
		if (r && t.id && (C().salesVisits?.visits ?? []).some((e) => e.followupTaskId === t.id && e.customerId !== t.customerId)) throw Error("A visit follow-up must retain the visit customer.");
		if (r && ![
			"Open",
			"In progress",
			"Completed"
		].includes(t.status ?? "Open")) throw Error("Task status must be Open, In progress or Completed.");
		if (!rd(t.due) || ![
			"Low",
			"Normal",
			"High"
		].includes(t.priority)) throw Error("Invalid due date or priority.");
	}
	if (e === "bank-rules") {
		if (r && nd(t.accountId), ![
			"Description",
			"Payee",
			"Reference"
		].includes(t.field) || ![
			"Contains",
			"Equals",
			"Starts with"
		].includes(t.operator)) throw Error("Invalid bank condition.");
		if (r && !x["tax-codes"].some((e) => e.status === "Active" && e.code === t.taxCode)) throw Error("Active tax code not found.");
	}
	if (e === "custom-reports" && r && Vu({
		dataset: t.dataset,
		columns: t.columns,
		basis: t.basis,
		filter: t.filter,
		favourite: t.favourite
	}), e === "report-packs" && r && ju(t.reports), e === "report-packs" && (!rd(t.periodStart) || !rd(t.periodEnd) || t.periodEnd < t.periodStart)) throw Error("Invalid report period.");
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
			]) ed(t[e], e);
			if (t.status !== "Active") throw Error("Business settings must remain active.");
			if (!["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid price basis.");
			if (!/^\d+$/.test(t.terms) || Number(t.terms) > 365) throw Error("Payment terms must be 0–365 days.");
			if (!/^\d{2}-\d{2}$/.test(t.yearEnd) || !rd("2001-" + t.yearEnd)) throw Error("Year end must be MM-DD.");
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
				if (!x["tax-codes"].some((e) => e.code === t.gstCode && e.status === "Active")) throw Error("Default tax code must be active.");
				let e = C().journals.journalEntries, r = n.find((e) => e.id === t.id), i = C().bankAccounts.bankAccounts, a = r?.currency ?? i[0]?.currency ?? "AUD";
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
function ad(e, t, n) {
	Qu[e].push({
		id: crypto.randomUUID(),
		name: n,
		status: "Active",
		revision: "1",
		createdAt: qu(),
		updatedAt: qu(),
		recordId: t.id,
		actorId: T.current()?.userId ?? "local-test",
		after: JSON.stringify(t)
	});
}
var od = Object.fromEntries(Object.keys(Ju).map((e) => {
	let t = {
		run(t) {
			if (e !== "custom-reports") throw Error("Saved-report execution is not available on this register.");
			return Wu(t);
		},
		generate(t) {
			if (e !== "report-packs") throw Error("Report generation is only available for report packs.");
			return Fu(t);
		},
		getAll: () => x[e],
		getById: (t) => x[e].find((e) => e.id === t),
		save(t, n) {
			let r = Gu.parse(t), i = x[e].find((e) => e.id === r.id);
			if (i && i.revision !== n) throw Error("Record changed. Reload before saving.");
			if (!i && n !== void 0) throw Error("Record no longer exists.");
			let a = qu(), o = {
				...r,
				id: i?.id ?? crypto.randomUUID(),
				name: r.name.trim(),
				status: r.status ?? (e === "tasks" ? "Open" : "Active"),
				revision: String(Number(i?.revision ?? "0") + 1),
				createdAt: i?.createdAt ?? a,
				updatedAt: a
			};
			return e === "tasks" && (delete o.completedAt, delete o.completedBy, o.status === "Completed" && (o.completedAt = i?.status === "Completed" && i.completedAt || a, o.completedBy = i?.status === "Completed" ? i.completedBy || T.current()?.userId || "local-test" : T.current()?.userId ?? "local-test")), id(e, o, x[e]), x[e] = [...x[e].filter((e) => e.id !== o.id), o], ad(e, o, i ? "Updated" : "Created"), Zu(), o;
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
			ad(e, {
				...i,
				note: r.trim()
			}, "Note added"), Zu();
		}
	};
	return y("workspace_" + e.replaceAll("-", "_"), {
		validate: (t, n) => {
			sd(e, t), cd(e, t, n);
		},
		repository: t,
		read: Ju[e].read,
		commands: {
			run: e === "custom-reports" ? "accounting.read" : null,
			generate: e === "report-packs" ? "accounting.read" : null,
			save: Ju[e].write,
			setStatus: Ju[e].write,
			addNote: e === "tasks" ? "sales.write" : null
		},
		snapshot: () => ({
			records: x[e],
			history: Qu[e]
		}),
		restore: (t) => {
			sd(e, t), x[e] = t.records, Qu[e] = t.history;
		},
		publish: Zu
	}), [e, t];
}));
function sd(e, n) {
	let i = t({
		records: r(Gu),
		history: r(Gu)
	}).strict().parse(n), a = /* @__PURE__ */ new Set();
	for (let t of i.records) {
		if (!t.id || a.has(t.id) || !/^\d+$/.test(t.revision)) throw Error("Invalid workspace record identity.");
		a.add(t.id), id(e, t, i.records, !1);
	}
	return i;
}
function cd(e, t, n) {
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
var X = a().trim().min(1).max(200), ld = a().trim().min(1).max(4e3), ud = a().refine((e) => {
	try {
		return S(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), dd = a().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}, "Invalid visit timestamp."), fd = t({
	operationId: X,
	name: X,
	customerId: X,
	locationId: X.optional(),
	plannedDate: ud,
	locationNote: a().trim().max(500).default("")
}).strict(), pd = t({
	name: X,
	due: ud,
	priority: f([
		"Low",
		"Normal",
		"High"
	]),
	notes: ld
}).strict(), md = t({
	id: X,
	expectedRevision: w().int().positive(),
	outcome: ld,
	followup: pd.optional()
}).strict(), hd = t({
	id: X,
	action: X,
	actorId: X,
	at: dd,
	note: a().optional()
}).strict(), gd = t({
	id: X,
	operationId: X,
	creationFingerprint: a().min(1).max(3e3),
	name: X,
	customerId: X,
	customerName: X,
	locationId: X.optional(),
	locationName: a().max(200).optional(),
	locationNote: a().max(500),
	plannedDate: ud,
	status: f([
		"Planned",
		"Checked in",
		"Completed",
		"Cancelled"
	]),
	revision: w().int().positive(),
	ownerId: X,
	createdAt: dd,
	updatedAt: dd,
	checkInAt: dd.optional(),
	checkInBy: X.optional(),
	checkOutAt: dd.optional(),
	checkOutBy: X.optional(),
	outcome: ld.optional(),
	completionFingerprint: a().optional(),
	followupTaskId: X.optional(),
	history: r(hd).min(1)
}).strict(), _d = [], vd = 0, yd = /* @__PURE__ */ new Set(), bd = () => {
	vd++, yd.forEach((e) => e());
}, xd = () => T.require("sales.write").userId, Sd = () => (/* @__PURE__ */ new Date()).toISOString(), Cd = (e, t, n, r) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	...r ? { note: r } : {}
});
function wd(e) {
	let t = _d.find((t) => t.id === e);
	if (!t) throw Error("Visit not found.");
	return t;
}
function Td(e, t) {
	if (e.revision !== t) throw Error("Visit changed. Reload before continuing.");
}
function Ed(e) {
	let t = Sd();
	if (t < e.updatedAt) throw Error("System clock precedes the last visit update. Correct the clock before continuing.");
	return t;
}
function Dd(e) {
	return _d = [..._d.filter((t) => t.id !== e.id), e], bd(), e;
}
function Od(e, t) {
	let n = z.getById(e);
	if (!n || n.status === "INACTIVE") throw Error("Choose an available customer.");
	if (t && !n.locations.some((e) => e.id === t)) throw Error("Choose a location belonging to the selected customer.");
	return n;
}
y("salesVisits", {
	repository: {
		subscribe(e) {
			return yd.add(e), () => {
				yd.delete(e);
			};
		},
		getSnapshot: () => _d,
		getAll: () => _d,
		create(e) {
			let t = xd(), n = fd.parse(e), r = JSON.stringify(n), i = _d.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.creationFingerprint !== r) throw Error("Operation ID was used for different visit data.");
				return i;
			}
			let a = Od(n.customerId, n.locationId), o = Sd();
			return Dd({
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
				history: [Cd("Planned", t, o)]
			});
		},
		update(e) {
			let t = xd(), n = fd.omit({ operationId: !0 }).extend({
				id: X,
				expectedRevision: w().int().positive()
			}).strict().parse(e), r = wd(n.id);
			if (Td(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be edited.");
			let i = Od(n.customerId, n.locationId), a = Ed(r), o = {
				...r,
				name: n.name,
				customerId: n.customerId,
				customerName: i.businessName,
				plannedDate: n.plannedDate,
				locationNote: n.locationNote,
				revision: r.revision + 1,
				updatedAt: a,
				history: [...r.history, Cd("Plan updated", t, a, r.plannedDate + " → " + n.plannedDate)]
			};
			return delete o.locationId, delete o.locationName, n.locationId && (o.locationId = n.locationId, o.locationName = i.locations.find((e) => e.id === n.locationId).name), Dd(o);
		},
		checkIn(e) {
			let n = xd(), r = t({
				id: X,
				expectedRevision: w().int().positive()
			}).strict().parse(e), i = wd(r.id);
			if (i.status === "Checked in" && i.revision === r.expectedRevision + 1) return i;
			if (Td(i, r.expectedRevision), i.status !== "Planned") throw Error("Only a planned visit can be checked in.");
			Od(i.customerId, i.locationId);
			let a = Ed(i);
			return Dd({
				...i,
				status: "Checked in",
				revision: i.revision + 1,
				checkInAt: a,
				checkInBy: n,
				updatedAt: a,
				history: [...i.history, Cd("Checked in", n, a)]
			});
		},
		finish(e) {
			let t = xd(), n = md.parse(e), r = wd(n.id), i = JSON.stringify({
				outcome: n.outcome,
				followup: n.followup
			});
			if (r.status === "Completed") {
				if (r.completionFingerprint === i) return r;
				throw Error("Visit is already completed with a different outcome.");
			}
			if (Td(r, n.expectedRevision), r.status !== "Checked in") throw Error("Check in before completing the visit.");
			let a = Ed(r);
			if (a < r.checkInAt) throw Error("System clock precedes check-in. Correct the clock before completing.");
			let o;
			return n.followup && (o = od.tasks.save({
				...n.followup,
				customerId: r.customerId,
				owner: t,
				status: "Open"
			}).id), Dd({
				...r,
				status: "Completed",
				revision: r.revision + 1,
				checkOutAt: a,
				checkOutBy: t,
				outcome: n.outcome,
				completionFingerprint: i,
				...o ? { followupTaskId: o } : {},
				updatedAt: a,
				history: [...r.history, Cd("Completed", t, a, n.outcome)]
			});
		},
		cancel(e) {
			let n = xd(), r = t({
				id: X,
				expectedRevision: w().int().positive(),
				reason: ld
			}).strict().parse(e), i = wd(r.id);
			if (Td(i, r.expectedRevision), !["Planned", "Checked in"].includes(i.status)) throw Error("Only an unfinished visit can be cancelled.");
			let a = Ed(i);
			return Dd({
				...i,
				status: "Cancelled",
				revision: i.revision + 1,
				updatedAt: a,
				history: [...i.history, Cd("Cancelled", n, a, r.reason)]
			});
		},
		addNote(e) {
			let n = xd(), r = t({
				id: X,
				expectedRevision: w().int().positive(),
				note: ld
			}).strict().parse(e), i = wd(r.id);
			Td(i, r.expectedRevision);
			let a = Ed(i);
			return Dd({
				...i,
				revision: i.revision + 1,
				updatedAt: a,
				history: [...i.history, Cd("Note added", n, a, r.note)]
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
	snapshot: () => ({ visits: _d }),
	restore: (e) => {
		_d = e.visits;
	},
	publish: bd,
	validate: (e, n) => {
		let i = t({ visits: r(gd) }).strict().parse(e), a = n, o = /* @__PURE__ */ new Set();
		for (let e of i.visits) {
			if (o.has(e.operationId)) throw Error("Duplicate visit operation ID.");
			if (o.add(e.operationId), !a.customers.customers.find((t) => t.id === e.customerId) || e.locationId && !e.locationName) throw Error("Invalid visit customer/location reference.");
			if (e.history.length !== e.revision || new Set(e.history.map((e) => e.id)).size !== e.history.length || e.updatedAt < e.createdAt) throw Error("Invalid visit history.");
			if (fd.parse(JSON.parse(e.creationFingerprint)).operationId !== e.operationId || e.history[0].action !== "Planned" || e.history[0].actorId !== e.ownerId || e.history[0].at !== e.createdAt) throw Error("Visit creation fingerprint is inconsistent.");
			if (!!e.checkInAt != !!e.checkInBy || !!e.checkOutAt != !!e.checkOutBy || e.checkInAt && e.checkInAt < e.createdAt || e.checkOutAt && (!e.checkInAt || e.checkOutAt < e.checkInAt)) throw Error("Invalid visit check-in/out history.");
			if (e.status === "Planned" && (e.checkInAt || e.checkOutAt) || e.status === "Checked in" && (!e.checkInAt || e.checkOutAt) || e.status === "Completed" && (!e.checkInAt || !e.checkOutAt || !e.outcome || !e.completionFingerprint) || e.status !== "Completed" && (e.checkOutAt || e.outcome || e.followupTaskId || e.completionFingerprint)) throw Error("Visit state is inconsistent.");
			if (e.status === "Completed") {
				let n = t({
					outcome: ld,
					followup: pd.optional()
				}).strict().parse(JSON.parse(e.completionFingerprint));
				if (n.outcome !== e.outcome || !!n.followup != !!e.followupTaskId) throw Error("Visit completion fingerprint is inconsistent.");
			}
			if (e.followupTaskId && !a.workspace_tasks.records.some((t) => t.id === e.followupTaskId && t.customerId === e.customerId)) throw Error("Visit follow-up task is missing or belongs to another customer.");
		}
	}
});
//#endregion
//#region src/features/direct-documents/managedDocumentRepository.ts
var Z = a().trim().min(1).max(200), kd = a().trim().max(2e3).optional(), Ad = t({
	requestedArea: w().finite().positive().max(1e9).optional(),
	productId: Z,
	unitId: Z,
	quantity: w().positive().finite(),
	unitPrice: w().nonnegative().finite().optional(),
	priceBasis: f(["Inclusive", "Exclusive"]).optional()
}).strict(), jd = t({
	description: a().trim().min(1).max(500),
	accountId: Z,
	quantity: w().positive().finite(),
	unitCost: w().nonnegative().finite(),
	taxCode: Z,
	priceBasis: f(["Inclusive", "Exclusive"]).optional()
}).strict(), Md = t({
	kind: f(["ORDER", "INVOICE"]),
	customerId: Z,
	locationId: Z.or(p("")).optional(),
	accountingContactId: Z.or(p("")).optional(),
	documentDate: Z,
	dueDate: Z.optional(),
	customerReference: kd,
	notes: kd,
	lines: r(Ad).min(1).max(500)
}).strict(), Nd = t({
	kind: p("EXPENSE"),
	supplierId: Z,
	supplierInvoiceNumber: Z,
	documentDate: Z,
	dueDate: Z,
	notes: kd,
	lines: r(jd).min(1).max(500)
}).strict(), Pd = (e) => g([Md, Nd]).parse(e), Fd = w().finite().nonnegative().refine((e) => Number.isSafeInteger(Math.round(e * 100)) && e === Math.round(e * 100) / 100, "Use an amount in whole cents within the supported range."), Id = t({
	operationId: Z,
	sourceName: a().trim().max(200),
	reviewed: o(),
	declared: t({
		subtotal: Fd,
		taxAmount: Fd,
		total: Fd
	}).strict(),
	payload: Nd.extend({ notes: a().trim().max(1e3).optional() })
}).strict();
function Ld(e) {
	return {
		...e.payload,
		notes: [
			e.payload.notes,
			`Reviewed source: ${e.sourceName || "Manual entry"}`,
			`Declared net / tax / total: ${e.declared.subtotal.toFixed(2)} / ${e.declared.taxAmount.toFixed(2)} / ${e.declared.total.toFixed(2)}`
		].filter(Boolean).join("\n")
	};
}
function Rd(e) {
	let t = yi.getById(e.payload.supplierId);
	if (!t || t.status !== "ACTIVE") throw Error("Select an active supplier.");
	let n = Xd(e.payload), r = e.payload.supplierInvoiceNumber.trim().toLowerCase(), i = Fl.getAll(), a = new Set(i.filter((e) => e.status === "VOID").map((e) => e.id)), o = [...Vd.filter((t) => t.operationId !== e.operationId && t.status !== "CANCELLED" && !(t.status === "POSTED" && t.documentId && a.has(t.documentId)) && t.payload.kind === "EXPENSE" && t.payload.supplierId === e.payload.supplierId && t.payload.supplierInvoiceNumber.trim().toLowerCase() === r).map((e) => ({
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
var zd = () => O.getAll().filter((e) => e.active && e.type === "EXPENSE" && e.allowManualPosting && (!e.systemRole || e.systemRole === "OPERATING_EXPENSE" || e.systemRole === "FREIGHT")).map((e) => ({
	id: e.id,
	code: e.code,
	name: e.name
}));
zd();
var Bd = [], Vd = [], Hd = 0, Ud = /* @__PURE__ */ new Set(), Wd = () => {
	Hd++, Ud.forEach((e) => e());
}, Gd = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Kd(e, t) {
	return {
		action: e,
		actorId: T.current()?.userId ?? "local-test",
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...t ? { reason: t } : {}
	};
}
function qd(e) {
	for (let t of e) if (t.taxAmount) for (let [e, n] of [[t.taxCollectedAccountId, "LIABILITY"], [t.taxPaidAccountId, "ASSET"]]) {
		if (!e) continue;
		let t = O.requireById(e);
		if (!t.active || t.type !== n) throw Error("A snapshotted tax posting account is no longer active or has the wrong type.");
	}
}
function Jd(e) {
	let t = O.requireById(e);
	if (!t.active || t.type !== "EXPENSE" || !t.allowManualPosting || t.systemRole && t.systemRole !== "OPERATING_EXPENSE" && t.systemRole !== "FREIGHT") throw Error("Use an active manual expense account, not an inventory, GRNI or control account.");
	return t;
}
function Yd(e) {
	let t = e.payload;
	if (t.kind === "EXPENSE") {
		let n = yi.getById(t.supplierId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active supplier.");
		for (let t of e.lines) Jd(t.expenseAccountId);
	} else {
		let n = z.getById(t.customerId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active customer.");
		for (let t of e.lines) go(t.productId, t.unitId, t.quantity, "sell");
	}
	qd(e.lines);
}
function Xd(e) {
	if (S(e.documentDate, "Document date"), e.dueDate && (S(e.dueDate, "Due date"), e.dueDate < e.documentDate)) throw Error("Due date cannot precede document date.");
	if (e.kind !== "ORDER" && !e.dueDate) throw Error("Due date is required.");
	let t = e.kind === "EXPENSE" ? e.lines.map((e) => {
		Jd(e.accountId);
		let t = se(e.taxCode), n = oe(e.unitCost, t.taxRate, e.priceBasis), r = Gd(e.quantity * n), i = (e.priceBasis ?? _().basis) === "Inclusive" ? Gd(e.quantity * e.unitCost - r) : Gd(r * t.taxRate);
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
			lineTotal: Gd(r + i)
		};
	}) : e.lines.map((t) => bs({
		customerId: e.customerId,
		documentDate: e.documentDate,
		draft: t
	})), n = ys(t);
	if (n.total <= 0 || !Number.isFinite(n.total)) throw Error("Document total must be finite and greater than zero.");
	return {
		lines: t,
		totals: n
	};
}
function Zd(e) {
	let n = () => e === "sales" ? Bd : Vd;
	function r(t) {
		return e === "sales" ? Bd = [...Bd.filter((e) => e.id !== t.id), t] : Vd = [...Vd.filter((e) => e.id !== t.id), t], Wd(), t;
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
			history: [...e.history, Kd(t, i)]
		});
	}
	let s = (e, t) => $d.save({
		operationId: e,
		payload: t
	});
	return {
		getAll: () => ie(n()),
		reviewCapture(t) {
			if (T.require("purchases.bill"), e !== "expense") throw Error("Capture is only available for expense bills.");
			return Rd(Id.parse(t));
		},
		capture(t) {
			if (T.require("purchases.bill"), e !== "expense") throw Error("Capture is only available for expense bills.");
			let r = Id.parse(t);
			if (!r.reviewed) throw Error("Confirm that the supplier document has been reviewed.");
			let i = Ld(r);
			if (n().find((e) => e.operationId === r.operationId)) return s(r.operationId, i);
			let a = Rd(r);
			if (!a.matches) throw Error(a.issues.join(" "));
			return s(r.operationId, i);
		},
		save(o) {
			let s = t({
				operationId: Z,
				id: Z.optional(),
				expectedRevision: w().int().positive().optional(),
				payload: e === "sales" ? Md : Nd
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
			let d = Xd(s.payload), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
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
				recipient: s.payload.kind === "EXPENSE" ? void 0 : mo(s.payload.customerId, s.payload),
				...d,
				createdAt: u?.createdAt ?? f,
				updatedAt: f,
				history: [...u?.history ?? [], Kd(u ? "Edited" : "Created")]
			};
			if (u && u.kind !== p.kind) throw Error("Document kind cannot change.");
			return Yd(p), r(p);
		},
		approve(e, t) {
			let n = i(e);
			if (n.status === "APPROVED" && n.revision === t + 1) return n;
			if (a(n, t), n.status !== "DRAFT") throw Error("Only a draft can be approved.");
			return Yd(n), o(n, "Approved", { status: "APPROVED" });
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
			N(), qe(n.payload.documentDate), Yd(n);
			let r, s = n.payload;
			if (s.kind === "EXPENSE") {
				let e = yi.getById(s.supplierId), t = (/* @__PURE__ */ new Date()).toISOString(), i = {
					id: crypto.randomUUID(),
					managedDraftId: n.id,
					kind: "EXPENSE",
					billNumber: he("BILL", Fl.getAll().map((e) => e.billNumber), s.documentDate.slice(0, 4)),
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
				Fl.insertExpenseBill(i);
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
						...As(i.lines, "paid", !0, i.totals.taxAmount),
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
var Qd = Zd("sales"), $d = Zd("expense"), ef = t({
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
	payload: g([Md, Nd]),
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
	repository: e === "sales" ? Qd : $d,
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
	snapshot: () => e === "sales" ? { drafts: Bd } : {
		drafts: Vd,
		options: zd()
	},
	restore: (t) => {
		e === "sales" ? Bd = t.drafts : (Vd = t.drafts, t.options);
	},
	publish: Wd,
	validate: (n, i) => {
		let { drafts: a } = t({
			drafts: r(ef),
			...e === "expense" ? { options: r(t({
				id: Z,
				code: Z,
				name: Z
			}).strict()) } : {}
		}).strict().parse(n);
		for (let t of a) {
			if (ho(t.recipient), t.kind !== t.payload.kind || e === "expense" != (t.kind === "EXPENSE")) throw Error("Draft kind mismatch.");
			if (S(t.payload.documentDate), t.payload.dueDate && (S(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate)) throw Error("Draft due date is invalid.");
			let n = i, r = t.payload.kind === "EXPENSE" ? t.payload.supplierId : t.payload.customerId;
			if (!(t.payload.kind === "EXPENSE" ? n.suppliers.suppliers : n.customers.customers).some((e) => e.id === r) || t.lines.length !== t.payload.lines.length) throw Error("Draft party or line references are invalid.");
			for (let [e, r] of t.lines.entries()) {
				let i = t.payload.lines[e], a = r;
				if (t.kind !== "EXPENSE" && (po(a), Ei(a, n.products.products.find((e) => e.id === a.productId)), a.requestedArea !== i.requestedArea)) throw Error("Draft area requirement mismatch.");
				if (typeof a.quantity != "number" || !Number.isFinite(a.quantity) || a.quantity <= 0 || i.requestedArea === void 0 && a.quantity !== i.quantity || Gd(a.lineSubtotal + a.taxAmount) !== a.lineTotal) throw Error("Draft line amounts are invalid.");
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
				if (Gd(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Draft totals do not match lines.");
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
var tf = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
];
function nf(e, t, n) {
	if (S(e), !Number.isSafeInteger(n) || n < 0 || !tf.includes(t)) throw Error("Invalid schedule occurrence.");
	let r = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	if (t === "Weekly" || t === "Fortnightly") r.setUTCDate(r.getUTCDate() + n * (t === "Weekly" ? 7 : 14));
	else {
		let e = r.getUTCDate();
		r.setUTCDate(1), r.setUTCMonth(r.getUTCMonth() + n * (t === "Monthly" ? 1 : 3));
		let i = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
		r.setUTCDate(Math.min(e, i));
	}
	let i = r.toISOString().slice(0, 10);
	return S(i), i;
}
function rf(e, t) {
	S(e);
	let n = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	n.setUTCDate(n.getUTCDate() + t);
	let r = n.toISOString().slice(0, 10);
	return S(r), r;
}
//#endregion
//#region src/features/recurring/recurringRepository.ts
var af = a().trim().min(1).max(200), of = a().refine((e) => {
	try {
		return S(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), sf = t({
	operationId: af,
	name: af,
	sourceDraftId: af,
	frequency: f(tf),
	firstDate: of,
	endDate: of
}).strict(), cf = t({
	id: af,
	expectedRevision: w().int().positive(),
	name: af,
	endDate: of
}).strict(), lf = a().refine((e) => Number.isFinite(Date.parse(e)), "Invalid timestamp."), uf = t({
	id: af,
	name: af,
	kind: f(["INVOICE", "EXPENSE"]),
	status: f([
		"Active",
		"Paused",
		"Ended"
	]),
	revision: w().int().positive(),
	operationId: af,
	creationFingerprint: a().min(1).max(2e3),
	sourceDraftId: af,
	payload: te(),
	frequency: f(tf),
	firstDate: of,
	nextDate: of,
	endDate: of,
	occurrence: w().int().nonnegative(),
	termsDays: w().int().nonnegative(),
	createdAt: lf,
	updatedAt: lf
}).strict(), df = t({
	id: af,
	scheduleId: af,
	date: of,
	draftId: af,
	actorId: af,
	createdAt: lf
}).strict(), ff = 0, pf = /* @__PURE__ */ new Set(), mf = () => {
	ff++, pf.forEach((e) => e());
}, hf = {
	INVOICE: {
		schedules: [],
		runs: []
	},
	EXPENSE: {
		schedules: [],
		runs: []
	}
}, gf = (e) => e === "INVOICE" ? "sales.manage" : "purchases.bill", _f = (e) => e === "INVOICE" ? Qd : $d, vf = () => (/* @__PURE__ */ new Date()).toISOString();
function yf(e) {
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
function bf(e) {
	let n = () => hf[e], r = (e) => {
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
			T.require(gf(e));
			let r = sf.parse(t), i = JSON.stringify(r), a = n().schedules.find((e) => e.operationId === r.operationId);
			if (a) {
				if (a.creationFingerprint !== i) throw Error("Operation ID was used for a different recurring template.");
				return a;
			}
			let o = _f(e).getAll().find((e) => e.id === r.sourceDraftId);
			if (!o || o.kind !== e || o.status === "CANCELLED") throw Error("Select an existing invoice or expense entry draft of the correct type.");
			if (r.endDate < r.firstDate) throw Error("End date must not precede first generation date.");
			let s = yf(o), c = Math.round((Date.parse(s.dueDate + "T00:00:00Z") - Date.parse(s.documentDate + "T00:00:00Z")) / 864e5), l = vf(), u = {
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
			return n().schedules = [...n().schedules, u], mf(), u;
		},
		update(t) {
			T.require(gf(e));
			let a = cf.parse(t), o = r(a.id);
			if (i(o, a.expectedRevision), a.endDate < o.firstDate || o.occurrence && a.endDate < n().runs.filter((e) => e.scheduleId === o.id).map((e) => e.date).sort().at(-1)) throw Error("End date cannot precede the schedule start or its last generated occurrence.");
			let s = {
				...o,
				name: a.name,
				endDate: a.endDate,
				status: o.nextDate > a.endDate ? "Ended" : o.status === "Ended" ? "Paused" : o.status,
				revision: o.revision + 1,
				updatedAt: vf()
			};
			return n().schedules = n().schedules.map((e) => e.id === o.id ? s : e), mf(), s;
		},
		setStatus(a) {
			T.require(gf(e));
			let o = t({
				id: af,
				expectedRevision: w().int().positive(),
				status: f(["Active", "Paused"])
			}).strict().parse(a), s = r(o.id);
			if (i(s, o.expectedRevision), s.nextDate > s.endDate) throw Error("Extend the end date before resuming this ended schedule.");
			let c = {
				...s,
				status: o.status,
				revision: s.revision + 1,
				updatedAt: vf()
			};
			return n().schedules = n().schedules.map((e) => e.id === s.id ? c : e), mf(), c;
		},
		generate(a) {
			T.require(gf(e));
			let o = t({
				id: af,
				expectedRevision: w().int().positive(),
				date: of
			}).strict().parse(a), s = r(o.id), c = n().runs.find((e) => e.scheduleId === s.id && e.date === o.date);
			if (c) return {
				schedule: s,
				run: c,
				draft: _f(e).getAll().find((e) => e.id === c.draftId)
			};
			if (i(s, o.expectedRevision), s.status !== "Active") throw Error("Activate the schedule before generating.");
			if (o.date !== s.nextDate) throw Error("Generate the next occurrence in order.");
			if (o.date > fe(vf())) throw Error("This occurrence is not due yet.");
			if (o.date > s.endDate) throw Error("The schedule has ended.");
			let l = nf(s.firstDate, s.frequency, s.occurrence + 1), u = structuredClone(s.payload);
			u.documentDate = o.date, u.dueDate = rf(o.date, s.termsDays), u.kind === "EXPENSE" && (u.supplierInvoiceNumber = u.supplierInvoiceNumber.slice(0, 170) + " [" + o.date + "]");
			let d = _f(e).save({
				operationId: "recurring:" + s.id + ":" + o.date,
				payload: u
			}), f = vf(), p = {
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
			return n().schedules = n().schedules.map((e) => e.id === s.id ? m : e), n().runs = [...n().runs, p], mf(), {
				schedule: m,
				run: p,
				draft: d
			};
		}
	};
}
var xf = bf("INVOICE"), Sf = bf("EXPENSE");
for (let e of ["INVOICE", "EXPENSE"]) y(e === "INVOICE" ? "recurringInvoices" : "recurringExpenses", {
	repository: e === "INVOICE" ? xf : Sf,
	read: e === "INVOICE" ? "sales.read" : "purchases.read",
	commands: {
		create: gf(e),
		update: gf(e),
		setStatus: gf(e),
		generate: gf(e)
	},
	snapshot: () => structuredClone(hf[e]),
	restore: (t) => {
		hf[e] = t;
	},
	publish: mf,
	validate: (n, i) => {
		t({
			schedules: r(uf),
			runs: r(df)
		}).strict().parse(n);
		let a = n, o = i;
		for (let t of a.schedules) {
			if (t.kind !== e || ![
				"Active",
				"Paused",
				"Ended"
			].includes(t.status) || !Number.isSafeInteger(t.revision) || t.revision < 1 || !Number.isSafeInteger(t.occurrence) || t.occurrence < 0 || !Number.isInteger(t.termsDays) || t.termsDays < 0 || t.payload.kind !== e) throw Error("Invalid recurring schedule.");
			if (sf.parse({
				operationId: t.operationId,
				name: t.name,
				sourceDraftId: t.sourceDraftId,
				frequency: t.frequency,
				firstDate: t.firstDate,
				endDate: t.endDate
			}), Pd(t.payload), !t.id || !t.creationFingerprint || !Number.isFinite(Date.parse(t.createdAt)) || !Number.isFinite(Date.parse(t.updatedAt))) throw Error("Invalid recurring identity or audit timestamps.");
			if (S(t.payload.documentDate), S(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate || t.termsDays !== Math.round((Date.parse(t.payload.dueDate + "T00:00:00Z") - Date.parse(t.payload.documentDate + "T00:00:00Z")) / 864e5)) throw Error("Invalid recurring payment terms.");
			if (t.payload.kind === "EXPENSE") {
				if (!o.suppliers.suppliers.some((e) => e.id === t.payload.supplierId) || t.payload.lines.some((e) => !o.accounts.accounts.some((t) => t.id === e.accountId && t.type === "EXPENSE"))) throw Error("Recurring expense references are invalid.");
			} else if (!o.customers.customers.some((e) => e.id === t.payload.customerId) || t.payload.lines.some((e) => !o.products.products.some((t) => t.id === e.productId && t.units.some((t) => t.id === e.unitId)))) throw Error("Recurring invoice references are invalid.");
			if (t.status === "Ended" != t.nextDate > t.endDate) throw Error("Recurring end status is inconsistent.");
			if (t.nextDate !== nf(t.firstDate, t.frequency, t.occurrence) || t.endDate < t.firstDate) throw Error("Invalid recurring dates.");
			let n = (e === "INVOICE" ? o.managedSalesDocuments : o.expenseBillDrafts).drafts.find((e) => e.id === t.sourceDraftId);
			if (!n || n.kind !== e) throw Error("Recurring template source is missing.");
			let r = a.runs.filter((e) => e.scheduleId === t.id);
			if (r.length !== t.occurrence || new Set(r.map((e) => e.date)).size !== r.length) throw Error("Recurring run history does not match schedule.");
			for (let e = 0; e < r.length; e++) if (!r.some((n) => n.date === nf(t.firstDate, t.frequency, e))) throw Error("Recurring occurrences are incomplete.");
		}
		for (let t of a.runs) {
			let n = a.schedules.find((e) => e.id === t.scheduleId), r = (e === "INVOICE" ? o.managedSalesDocuments : o.expenseBillDrafts).drafts.find((e) => e.id === t.draftId);
			if (!n || !r || r.kind !== e || r.operationId !== "recurring:" + n.id + ":" + t.date || !t.actorId || !Number.isFinite(Date.parse(t.createdAt))) throw Error("Invalid recurring generated-draft reference.");
		}
	}
});
//#endregion
//#region src/features/supplier-returns/supplierReturnRepository.ts
var Q = a().trim().min(1).max(200), Cf = w().finite().positive(), wf = w().finite().nonnegative(), Tf = t({
	operationId: Q,
	supplierBillId: Q,
	supplierCreditNumber: Q,
	returnDate: Q,
	reason: a().trim().min(3).max(2e3),
	lines: r(t({
		matchId: Q,
		quantity: Cf
	}).strict()).min(1).max(500)
}).strict(), Ef = t({
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
	quantity: Cf,
	conversionToBase: Cf,
	quantityBase: Cf,
	siteId: Q,
	siteName: Q,
	inventoryMovementId: Q,
	costMovementId: Q,
	unitCostBase: wf,
	inventoryValue: wf,
	voidInventoryMovementId: Q.optional(),
	voidCostMovementId: Q.optional()
}).strict(), Df = t({
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
	lines: r(Ef).min(1),
	inventoryValue: wf,
	journalId: Q.optional(),
	createdAt: Q,
	createdBy: Q,
	voidDate: Q.optional(),
	voidReason: a().optional(),
	voidedBy: Q.optional(),
	voidedAt: Q.optional()
}).strict(), Of = [], kf = 0, Af = /* @__PURE__ */ new Set(), jf = () => {
	kf++, Af.forEach((e) => e());
}, Mf = (e) => Math.round(e * 1e4) / 1e4, Nf = (e) => Math.round(e * 100) / 100;
function Pf(e, t, n) {
	if (Jc.getAll().some((r) => r.siteId === t && r.productId === n && fe(r.occurredAt) > e)) throw Error("Return/reversal date precedes later inventory activity at this site.");
}
function Ff(e) {
	let t = Fl.getById(e);
	return !t || t.status === "VOID" || t.kind === "EXPENSE" || t.openingBalanceImportId ? [] : Dl.getByBill(e).filter((e) => e.status === "ACTIVE").flatMap((e) => {
		let n = t.lines.find((t) => t.id === e.supplierBillLineId), r = hl.getById(e.goodsReceiptId), i = r?.lines.find((t) => t.id === e.goodsReceiptLineId), a = n ? Oi(n.productId, n.unitId) : void 0;
		if (!n || !r || !i || !a) return [];
		let o = Of.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0);
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
			let t = Tf.parse(e), n = JSON.stringify(t), r = Of.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.requestFingerprint !== n) throw Error("Operation ID already used with different return data.");
				return r;
			}
			N(), S(t.returnDate, "Return date"), qe(t.returnDate);
			let i = Fl.getById(t.supplierBillId);
			if (!i || i.status === "VOID" || i.kind === "EXPENSE" || i.openingBalanceImportId) throw Error("Select an active stock bill matched to received goods.");
			if (t.returnDate < i.billDate) throw Error("Return date cannot precede bill date.");
			let a = Ff(i.id), o = /* @__PURE__ */ new Set(), s = t.lines.map((e) => {
				if (o.has(e.matchId)) throw Error("Select each receipt match once.");
				o.add(e.matchId);
				let n = a.find((t) => t.matchId === e.matchId);
				if (!n) throw Error("Return line must belong to an active receipt match for this bill.");
				if (Mf(e.quantity) !== e.quantity || e.quantity > n.availableQuantity + 1e-8) throw Error("Return quantity exceeds the matched receipt remainder or four decimal places.");
				if (t.returnDate < n.receiptDate) throw Error("Return date cannot precede receipt date.");
				let r = B(n.productId), i = Oi(n.productId, n.unitId), s = Nc.getById(n.siteId);
				if (!r || !i || !s || s.status !== "ACTIVE") throw Error("Return product, unit or active receiving site was not found.");
				if (r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(i.code) && !Number.isInteger(e.quantity)) throw Error("Whole packs must be returned in whole quantities.");
				Pf(t.returnDate, s.id, r.id);
				let c = Mf(e.quantity * n.conversionToBase);
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
				c.set(t, Mf((c.get(t) ?? 0) + e.quantityBase));
			}
			for (let [e, t] of c) {
				let [n, r] = e.split("|");
				if ((cl.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t) throw Error("Insufficient stock at the original receiving site.");
			}
			let l = /* @__PURE__ */ new Map();
			for (let e of s) {
				let t = i.lines.find((t) => t.id === e.supplierBillLineId), n = l.get(t.id);
				l.set(t.id, {
					supplierBillLineId: t.id,
					quantity: Mf((n?.quantity ?? 0) + e.quantity),
					unitCost: t.unitCost
				});
			}
			let u = crypto.randomUUID(), d = "SR-" + t.returnDate.slice(0, 4) + "-" + String(Of.length + 1).padStart(5, "0"), f = J.createReturnCredit({
				sourceSupplierBillId: i.id,
				supplierCreditNumber: t.supplierCreditNumber,
				creditDate: t.returnDate,
				reason: t.reason,
				lines: [...l.values()]
			}, u), p = s.map((e) => {
				cl.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let n = Rc.create({
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
				}), r = nl({
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
			}), m = Nf(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? A.post({
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
			return Of = [g, ...Of], jf(), g;
		},
		reverse(e) {
			let n = t({
				returnId: Q,
				voidDate: Q,
				reason: a().trim().min(3).max(2e3)
			}).strict().parse(e), r = Of.find((e) => e.id === n.returnId);
			if (!r) throw Error("Supplier return not found.");
			if (r.status === "VOID") return r;
			if (N(), S(n.voidDate, "Reversal date"), qe(n.voidDate), n.voidDate < r.returnDate) throw Error("Reversal date cannot precede return date.");
			for (let e of r.lines) Pf(n.voidDate, e.siteId, e.productId);
			let i = J.getById(r.supplierCreditId);
			if ((i.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > n.voidDate) || J.getAllocationsByCredit(i.id).some((e) => e.reversedAt && fe(e.reversedAt) > n.voidDate)) throw Error("Reversal date precedes later credit settlement activity.");
			J.voidReturnCredit({
				supplierCreditId: r.supplierCreditId,
				reason: n.reason,
				voidDate: n.voidDate
			});
			let o = r.lines.map((e) => {
				cl.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = Rc.create({
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
				}), i = rl({
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
			return Of = Of.map((e) => e.id === r.id ? s : e), jf(), s;
		}
	},
	read: "purchases.return.read",
	commands: {
		create: "purchases.return",
		reverse: "purchases.return"
	},
	snapshot: () => ({ returns: Of }),
	restore: (e) => {
		Of = e.returns;
	},
	publish: jf,
	validate: (e, n) => {
		let i = t({ returns: r(Df) }).strict().parse(e), a = n, o = /* @__PURE__ */ new Set();
		for (let e of i.returns) {
			S(e.returnDate), e.voidDate && S(e.voidDate);
			let t = Tf.parse(JSON.parse(e.requestFingerprint));
			if (o.has(e.operationId) || t.operationId !== e.operationId || t.supplierBillId !== e.supplierBillId || t.returnDate !== e.returnDate) throw Error("Supplier return operation mismatch.");
			o.add(e.operationId);
			let n = a.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId && t.supplierId === e.supplierId), r = a.supplierCredits.supplierCredits.find((t) => t.id === e.supplierCreditId && t.physicalReturnId === e.id && t.sourceSupplierBillId === e.supplierBillId);
			if (!n || !r || e.status === "VOID" != (r.status === "VOID")) throw Error("Supplier return bill/credit reference is invalid.");
			if (Nf(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue) throw Error("Supplier return cost total is invalid.");
			for (let t of e.lines) {
				let r = a.receiptMatches.matches.find((n) => n.id === t.matchId && n.supplierBillId === e.supplierBillId && n.supplierBillLineId === t.supplierBillLineId && n.goodsReceiptId === t.goodsReceiptId && n.goodsReceiptLineId === t.goodsReceiptLineId), i = a.costMovements.movements.find((e) => e.id === t.costMovementId), o = a.inventoryMovements.movements.find((e) => e.id === t.inventoryMovementId), s = a.goodsReceipts.goodsReceipts.find((e) => e.id === t.goodsReceiptId), c = n.lines.find((e) => e.id === t.supplierBillLineId);
				if (!r || !c || c.productId !== t.productId || c.unitId !== t.unitId || s?.siteId !== t.siteId || r.productId !== t.productId || !i || !o || i.referenceType !== "SUPPLIER_RETURN" || i.referenceId !== e.id || i.inventoryMovementId !== o.id || i.siteId !== t.siteId || i.productId !== t.productId || i.unitCostBase !== t.unitCostBase || i.quantityBase !== -t.quantityBase || Nf(-i.valueChange) !== Nf(t.inventoryValue) || Mf(t.quantity * t.conversionToBase) !== t.quantityBase || o.referenceType !== "SUPPLIER_RETURN" || o.referenceId !== e.id || o.siteId !== t.siteId || o.productId !== t.productId || o.quantityBase !== -t.quantityBase || o.transactionQuantity !== -t.quantity || fe(o.occurredAt) !== e.returnDate) throw Error("Supplier return stock/cost reference is invalid.");
				if (e.status === "VOID") {
					let n = a.costMovements.movements.find((e) => e.id === t.voidCostMovementId), r = a.inventoryMovements.movements.find((e) => e.id === t.voidInventoryMovementId);
					if (!n || !r || n.inventoryMovementId !== r.id || n.referenceType !== "SUPPLIER_RETURN_VOID" || n.referenceId !== e.id || n.siteId !== t.siteId || n.productId !== t.productId || n.quantityBase !== t.quantityBase || Nf(n.valueChange) !== Nf(t.inventoryValue) || r.referenceType !== "SUPPLIER_RETURN_VOID" || r.quantityBase !== t.quantityBase || r.referenceId !== e.id || fe(n.occurredAt) !== e.voidDate) throw Error("Supplier return reversal reference is invalid.");
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
				let n = Mf(e.lines.filter((e) => e.supplierBillLineId === t).reduce((e, t) => e + t.quantity, 0));
				if (!r.lines.some((e) => e.supplierBillLineId === t && e.quantity === n)) throw Error("Supplier return linked credit quantity mismatch.");
			}
			if (e.status === "VOID" && (!e.voidDate || e.voidDate < e.returnDate || !e.voidReason || !e.voidedBy)) throw Error("Supplier return reversal metadata is invalid.");
			if (e.inventoryValue && !a.journals.journalEntries.some((t) => t.id === e.journalId && t.sourceId === e.id && t.sourceType === "SUPPLIER_RETURN" && t.totalDebit === e.inventoryValue && (e.status === "VOID" ? t.status === "REVERSED" : t.status === "POSTED"))) throw Error("Supplier return journal reference is invalid.");
		}
		for (let e of a.supplierCredits.supplierCredits) if (e.physicalReturnId && !i.returns.some((t) => t.id === e.physicalReturnId && t.supplierCreditId === e.id)) throw Error("Supplier credit physical return reference is invalid.");
		for (let e of a.receiptMatches.matches) if (Mf(i.returns.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0)) > e.matchedBaseQuantity + 1e-8) throw Error("Supplier return quantities exceed the receipt match.");
	}
});
//#endregion
//#region src/features/document-output/outputRepository.ts
var If = a().min(1).max(200), Lf = a().max(2e4), Rf = Lf.optional(), zf = [
	"QUOTE",
	"SALES_ORDER",
	"INVOICE",
	"CREDIT_NOTE"
], Bf = t({
	operationId: If,
	sourceId: If,
	kind: f(zf),
	expectedUpdatedAt: If,
	templateId: If.optional()
}).strict(), Vf = w().finite().nonnegative(), Hf = t({
	itemType: f([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	id: If,
	sku: Lf,
	description: Lf,
	unitSymbol: Lf,
	quantity: w().positive().finite(),
	unitPrice: Vf,
	lineSubtotal: Vf,
	taxAmount: Vf,
	lineTotal: Vf,
	taxCode: Rf,
	taxRate: w().finite().min(0).max(1).optional(),
	requestedArea: w().positive().finite().optional(),
	areaPerPack: w().positive().finite().optional(),
	coveredArea: w().positive().finite().optional()
}).strict(), Uf = t({
	locationId: Rf,
	locationName: Rf,
	deliveryAddress: Rf,
	accountingContactId: Rf,
	accountingContactName: Rf,
	accountingEmail: Rf
}).strict(), Wf = t({
	id: If,
	revision: If,
	name: Lf,
	subject: Lf,
	body: Lf,
	footer: Lf,
	paper: f(["A4", "Letter"])
}).strict(), Gf = t({
	id: If,
	operationId: If,
	requestFingerprint: Lf,
	preparedAt: If,
	preparedBy: If,
	sourceId: If,
	kind: f(zf),
	sourceUpdatedAt: If,
	documentNumber: If,
	status: If,
	documentDate: If,
	dueDate: Rf,
	expiryDate: Rf,
	reference: Rf,
	notes: Rf,
	customerId: If,
	customerName: Lf,
	customerCode: Lf,
	customerIdentifier: Rf,
	recipient: Uf.optional(),
	issuer: t({
		name: Lf,
		tradingName: Rf,
		identifier: Rf,
		address: Rf,
		email: Rf,
		phone: Rf,
		currency: If
	}).strict(),
	lines: r(Hf).min(1),
	totals: t({
		subtotal: Vf,
		taxAmount: Vf,
		total: Vf
	}).strict(),
	amountPaid: Vf.optional(),
	amountDue: Vf.optional(),
	template: Wf,
	subject: Lf,
	body: Lf
}).strict();
function Kf(e, t) {
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
var qf = (e) => e === "QUOTE" ? "Quotation" : e === "INVOICE" ? "Invoice" : e === "SALES_ORDER" ? "Sales order" : "Credit note";
function Jf() {
	return (x.templates ?? []).filter((e) => e.status === "Active" && [
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
var Yf = [];
Jf();
var Xf = 0, Zf = /* @__PURE__ */ new Set(), Qf = () => {
	Xf++, Zf.forEach((e) => e());
};
function $f(e, t) {
	let n = t ? x.templates?.find((n) => n.id === t && n.status === "Active" && n.kind === qf(e)) : void 0;
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
var ep = [
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
function tp(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!ep.includes(n)) throw Error(`Unsupported template token: ${n}.`);
		return t[n] ?? "";
	});
}
function np(e) {
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
var rp = { prepare(e) {
	let t = Bf.parse(e), n = JSON.stringify(t), r = Yf.find((e) => e.operationId === t.operationId);
	if (r) {
		if (r.requestFingerprint !== n) throw Error("Operation ID was used for different output data.");
		return r;
	}
	let i = Kf(t.kind, t.sourceId);
	if (i.updatedAt !== t.expectedUpdatedAt) throw Error("Source document changed. Reload before preparing output.");
	let a = z.getById(i.customerId);
	if (!a) throw Error("Source customer was not found.");
	let o = _(), s = $f(t.kind, t.templateId), c = structuredClone(i.recipient), l = {
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
		lines: i.lines.map(np),
		totals: structuredClone(i.totals),
		amountPaid: "amountPaid" in i ? i.amountPaid : void 0,
		amountDue: "amountDue" in i ? i.amountDue : void 0,
		template: {
			...s,
			footer: tp(s.footer, l)
		},
		subject: tp(s.subject, l),
		body: tp(s.body, l)
	};
	return ip(u), Yf = [u, ...Yf], Qf(), u;
} };
function ip(e) {
	let t = Gf.parse(e);
	if (ho(t.recipient), !Number.isFinite(Date.parse(t.preparedAt))) throw Error("Invalid preparation timestamp.");
	let n = Bf.parse(JSON.parse(t.requestFingerprint));
	if (n.operationId !== t.operationId || n.sourceId !== t.sourceId || n.kind !== t.kind || n.expectedUpdatedAt !== t.sourceUpdatedAt) throw Error("Output source metadata mismatch.");
	let r = (e) => Math.round(e * 100) / 100;
	for (let e of t.lines) if (po(e), r(e.lineSubtotal + e.taxAmount) !== e.lineTotal) throw Error("Invalid output line total.");
	for (let [e, n] of [
		["subtotal", "lineSubtotal"],
		["taxAmount", "taxAmount"],
		["total", "lineTotal"]
	]) if (r(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Invalid output totals.");
	return t;
}
y("preparedSalesOutputs", {
	repository: rp,
	read: "sales.read",
	commands: { prepare: "documents.prepare" },
	snapshot: () => ({
		artifacts: Yf,
		templates: Jf()
	}),
	restore: (e) => {
		Yf = e.artifacts, e.templates;
	},
	publish: Qf,
	validate: (e, n) => {
		let i = t({
			artifacts: r(Gf),
			templates: r(t({
				id: If,
				name: Lf,
				kind: If
			}).strict())
		}).strict().parse(e), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
		for (let e of i.artifacts) {
			if (ip(e), a.has(e.id) || o.has(e.operationId)) throw Error("Duplicate prepared output.");
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
function ap(e) {
	return O.requireBySystemRole(e).id;
}
function op(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function sp(e) {
	return A.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function cp(e) {
	let t = Jc.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var lp = {
	postSalesFulfilment(e) {
		let t = sp(e.id);
		if (t) return t;
		let n = op(cp(e).reduce((e, t) => {
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
				accountId: ap("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: ap("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = sp(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? A.getById(r.reversalJournalEntryId) : void 0 : A.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, up = /* @__PURE__ */ new Set(), dp = [], fp = dp;
function pp() {
	fp = dp, up.forEach((e) => e());
}
function mp() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = dp.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function hp(e, t) {
	return G(dp.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function gp(e) {
	let t = W.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.filter(Ti).map((e) => hp(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.filter(Ti).every((e, t) => n[t] >= G(e.quantity));
	W.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function _p(e) {
	let t = Jc.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var vp = {
	subscribe(e) {
		return up.add(e), () => {
			up.delete(e);
		};
	},
	getSnapshot() {
		return fp;
	},
	getAll() {
		return fp;
	},
	getById(e) {
		return dp.find((t) => t.id === e);
	},
	getBySalesOrder(e) {
		return dp.filter((t) => t.salesOrderId === e);
	},
	getFulfilledQuantity: hp,
	getRemainingQuantity(e, t) {
		let n = W.getById(e);
		if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let r = n.lines.find((e) => e.id === t);
		if (!r) throw Error("Sales order line was not found.");
		return Ti(r) ? G(r.quantity - hp(e, t)) : 0;
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
		let r = Nc.getById(e.siteId);
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
			if (!Ti(t)) throw Error("Non-stock and service lines do not require inventory dispatch.");
			let i = B(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let o = Oi(t.productId, t.unitId);
			if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
			if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
			let s = G(e.fulfilledQuantity);
			if (t.areaPerPack && !Number.isInteger(e.fulfilledQuantity)) throw Error("Area-based lines must be dispatched in whole packs.");
			let c = hp(n.id, t.id);
			if (s > G(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
			let l = G(s * o.conversionToBase), u = cl.getBalance(r.id, t.productId);
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
			let n = cl.getBalance(r.id, e);
			if (!n || n.quantityOnHand < t) {
				let t = B(e);
				throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
			}
		}
		let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = mp(), d = o.map((e) => ({
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
			let i = B(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let a = Rc.create({
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
			nl({
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
			}), cl.issue({
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: t.fulfilledBaseQuantity
			});
		}
		return lp.postSalesFulfilment(f), dp = [f, ...dp], pp(), gp(n.id), f;
	},
	void(e) {
		let t = dp.find((t) => t.id === e.fulfilmentId);
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
		let i = _p(t), a = /* @__PURE__ */ new Set(), o = t.lines.map((e) => {
			let n = B(e.productId);
			if (!n) throw Error(`Product ${e.sku} was not found.`);
			let r = i.find((n) => !a.has(n.id) && n.siteId === t.siteId && n.productId === e.productId && Math.abs(n.quantityBase) === e.fulfilledBaseQuantity);
			if (!r) throw Error(`Unique original inventory cost issue for ${e.sku} was not found.`);
			return a.add(r.id), {
				line: e,
				product: n,
				originalIssue: r
			};
		});
		lp.reverseSalesFulfilment({
			fulfilment: t,
			reversalDate: e.voidDate,
			reason: n
		});
		for (let r of o) {
			let { line: i, product: a, originalIssue: o } = r, s = Rc.create({
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
			rl({
				siteId: t.siteId,
				productId: i.productId,
				quantityBase: i.fulfilledBaseQuantity,
				unitCostBase: o.unitCostBase,
				inventoryValue: bc(Math.abs(o.valueChange)),
				referenceType: "SALE",
				referenceId: t.id,
				referenceNumber: t.fulfilmentNumber,
				inventoryMovementId: s.id,
				occurredAt: e.voidDate,
				notes: `Void sales fulfilment ${t.fulfilmentNumber}: ${n}`
			}), cl.receive({
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
		return dp = dp.map((e) => e.id === s.id ? s : e), pp(), gp(t.salesOrderId), s;
	}
};
y("fulfilments", {
	repository: vp,
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: dp }),
	restore: (e) => {
		dp = e.fulfilments, fp = dp;
	},
	publish: () => up.forEach((e) => e())
});
//#endregion
//#region src/features/direct-documents/dispatchRepository.ts
var yp = a().trim().min(1).max(200), bp = t({
	operationId: yp,
	salesOrderId: yp,
	siteId: yp,
	fulfilmentDate: yp,
	lines: r(t({
		salesOrderLineId: yp,
		fulfilledQuantity: w().positive().finite()
	}).strict()).min(1).max(500)
}).strict();
function xp() {
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
		lines: e.lines.filter(Ti).map((t) => ({
			id: t.id,
			sku: t.sku,
			description: t.description,
			unit: t.unitSymbol,
			quantity: t.quantity,
			fulfilled: vp.getAll().filter((t) => t.salesOrderId === e.id && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t.id).reduce((e, t) => e + t.fulfilledQuantity, 0)
		}))
	})).filter((e) => e.lines.length > 0);
}
xp();
var Sp = [], Cp = 0, wp = /* @__PURE__ */ new Set(), Tp = () => {
	Cp++, wp.forEach((e) => e());
};
y("salesDispatch", {
	repository: {
		record(e) {
			let t = bp.parse(e), n = JSON.stringify(t), r = Sp.find((e) => e.id === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Dispatch operation ID was already used with different data.");
				return vp.getAll().find((e) => e.id === r.fulfilmentId);
			}
			if (N(), S(t.fulfilmentDate), qe(t.fulfilmentDate), new Set(t.lines.map((e) => e.salesOrderLineId)).size !== t.lines.length) throw Error("Each dispatch line must be selected only once.");
			let i = vp.create(t);
			return Sp = [...Sp, {
				id: t.operationId,
				fingerprint: n,
				fulfilmentId: i.id
			}], Tp(), i;
		},
		reverse(e) {
			let n = t({
				fulfilmentId: yp,
				voidDate: yp,
				reason: a().trim().min(3).max(1e3)
			}).strict().parse(e);
			N(), S(n.voidDate), qe(n.voidDate);
			let r = vp.getAll().find((e) => e.id === n.fulfilmentId);
			return r?.status === "VOIDED" ? r : vp.void(n);
		}
	},
	read: "inventory.read",
	commands: {
		record: "inventory.adjust",
		reverse: "inventory.adjust"
	},
	snapshot: () => ({
		orders: xp(),
		requests: Sp
	}),
	restore: (e) => {
		e.orders, Sp = e.requests;
	},
	publish: Tp,
	validate: (e, n) => {
		let i = t({
			orders: r(t({
				id: yp,
				number: yp,
				date: yp,
				delivery: a().optional(),
				store: a().optional(),
				lines: r(t({
					id: yp,
					sku: a(),
					description: a(),
					unit: a(),
					quantity: w().finite().positive(),
					fulfilled: w().finite().nonnegative()
				}).strict())
			}).strict()),
			requests: r(t({
				id: yp,
				fingerprint: a().max(1e6),
				fulfilmentId: yp
			}).strict())
		}).strict().parse(e), o = n.fulfilments.fulfilments;
		if (i.requests.some((e) => !o.some((t) => t.id === e.fulfilmentId))) throw Error("Dispatch result reference is invalid.");
	}
});
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function Ep(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Dp(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) {
		if (r.has(t.id)) {
			i = Ep(i + t.moneyIn), a = Ep(a + t.moneyOut);
			continue;
		}
		o = Ep(o + t.moneyIn), s = Ep(s + t.moneyOut);
	}
	let c = Ep(Ep(t) + o - s), l = Ep(e.closingBalance), u = Ep(c - l);
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
var Op = /* @__PURE__ */ new Set(), kp = k.read().reconciliations;
k.onRollback(() => {
	kp = k.read().reconciliations;
});
function Ap() {
	k.update("reconciliations", kp), Op.forEach((e) => k.notify(e));
}
function jp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Mp(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function Np() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Pp(e) {
	return `BREC-${e.slice(0, 4)}-${String(kp.length + 1).padStart(4, "0")}`;
}
function Fp(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of kp) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var Ip = {
	subscribe(e) {
		return Op.add(e), () => {
			Op.delete(e);
		};
	},
	getSnapshot() {
		return kp;
	},
	getAll() {
		return kp;
	},
	getByBankAccount(e) {
		return kp.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return Fp(e);
	},
	complete(e) {
		if (Mp(e.statementDate), S(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let t = Mt.requireById(e.bankAccountId);
		if (!t.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < t.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let n = this.getLatestByBankAccount(t.id);
		if (n && e.statementDate <= n.statementDate) throw Error(`Statement date must be after the last reconciled date ${n.statementDate}.`);
		let r = vu(t, A.getAll(), e.statementDate), i = new Set(r.transactions.map((e) => e.id)), a = Fp(t.id), o = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !a.has(e));
		for (let e of o) if (!i.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let s = /* @__PURE__ */ new Set([...a, ...o]), c = Dp(r, jp(e.statementBalance), Array.from(s));
		if (!c.reconciled) throw Error(`Bank reconciliation is out by ${c.difference.toFixed(2)}.`);
		let l = {
			id: Np(),
			reconciliationNumber: Pp(e.statementDate),
			bankAccountId: t.id,
			statementDate: e.statementDate,
			statementBalance: jp(e.statementBalance),
			bookBalance: c.bookBalance,
			outstandingDeposits: c.outstandingDeposits,
			outstandingPayments: c.outstandingPayments,
			adjustedStatementBalance: c.adjustedStatementBalance,
			difference: c.difference,
			clearedTransactionIds: o,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return kp = [l, ...kp], Ap(), l;
	}
}, Lp = Ip.complete;
Ip.complete = function(e) {
	return N(), k.transaction(() => Lp.call(Ip, e));
}, y("bankReconciliations", {
	repository: Ip,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: kp }),
	restore: (e) => {
		kp = e.reconciliations;
	},
	publish: () => Op.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/settlementRepository.ts
var Rp = (e) => Math.round((e + 2 ** -52) * 100) / 100, zp = a().trim().min(1).max(200), Bp = w().finite().positive().refine((e) => Rp(e) === e, "Use cents precision"), Vp = t({
	operationId: zp,
	customerId: zp,
	paymentDate: zp,
	bankAccountId: zp,
	reference: a().max(500).optional(),
	allocations: r(t({
		invoiceId: zp,
		amount: Bp
	}).strict()).min(1).max(500)
}).strict(), Hp = t({
	operationId: zp,
	creditId: zp,
	paymentDate: zp,
	bankAccountId: zp,
	amount: Bp,
	reference: a().max(500).optional()
}).strict(), Up = [], Wp = [], Gp = [], Kp = 0, qp = /* @__PURE__ */ new Set(), Jp = () => {
	Kp++, qp.forEach((e) => e());
};
function Yp(e, t, n) {
	let r = JSON.stringify(n), i = e.find((e) => e.operationId === t);
	if (i && i.fingerprint !== r) throw Error("Operation ID was already used with different data.");
	return {
		old: i,
		fingerprint: r
	};
}
function Xp(e, t) {
	S(t, "Payment date");
	let n = Mt.requireById(e);
	if (!n.active || t < n.openingBalanceDate) throw Error("Bank is inactive or payment precedes its opening date.");
	let r = O.requireById(n.glAccountId);
	if (!r.active || r.type !== "ASSET") throw Error("Invalid bank ledger account.");
	return n;
}
function Zp(e) {
	if (Ip.getAll().some((t) => t.clearedTransactionIds.some((t) => t.startsWith(e + ":")))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Qp(e, t) {
	let n = e === "customer" ? H.getById(t) : J.getById(t);
	if (!n || n.status === "VOID" || n.status === "DRAFT") throw Error("An issued credit is required.");
	return n;
}
function $p(e, t, n) {
	let r = Qp(e, t), i = Rp(n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0)), a = Rp(r.totals.total - r.amountApplied - i);
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
function em(e, t) {
	N();
	let n = Hp.parse(t), { old: r, fingerprint: i } = Yp(e === "customer" ? Wp : Gp, n.operationId, n);
	if (r) return r;
	let a = Qp(e, n.creditId), o = Xp(n.bankAccountId, n.paymentDate);
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
	return $p(e, a.id, [...a.refundEvents ?? [], {
		id: u.id,
		date: u.paymentDate,
		amount: u.amount
	}]), e === "customer" ? Wp = [...Wp, u] : Gp = [...Gp, u], Jp(), u;
}
function tm(e, t) {
	if (N(), S(t.reversalDate, "Reversal date"), !t.reason?.trim() || t.reason.trim().length < 3) throw Error("Enter a reversal reason.");
	let n = e === "customer" ? Wp : Gp, r = n.find((e) => e.id === t.id);
	if (!r) throw Error("Refund was not found.");
	if (r.status === "REVERSED") return r;
	if (t.reversalDate < r.paymentDate) throw Error("Reversal cannot precede the refund.");
	Zp(r.journalEntryId), A.reverse({
		journalEntryId: r.journalEntryId,
		reversalDate: t.reversalDate,
		reason: t.reason
	});
	let i = Qp(e, r.creditId);
	$p(e, i.id, (i.refundEvents ?? []).map((e) => e.id === r.id ? {
		...e,
		reversalDate: t.reversalDate
	} : e));
	let a = {
		...r,
		status: "REVERSED",
		reversalDate: t.reversalDate
	};
	return e === "customer" ? Wp = n.map((e) => e.id === r.id ? a : e) : Gp = n.map((e) => e.id === r.id ? a : e), Jp(), a;
}
var nm = {
	recordReceipt(e) {
		let t = Vp.parse(e), { old: n, fingerprint: r } = Yp(Up, t.operationId, t);
		if (n) return n;
		if (Xp(t.bankAccountId, t.paymentDate), new Set(t.allocations.map((e) => e.invoiceId)).size !== t.allocations.length) throw Error("Each invoice may only be allocated once.");
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
			amount: Rp(i.reduce((e, t) => e + t.amount, 0)),
			paymentIds: i.map((e) => e.id),
			status: "POSTED"
		};
		return Up = [...Up, a], Jp(), a;
	},
	reverseReceipt(e) {
		let t = Up.find((t) => t.id === e.id);
		if (!t) throw Error("Receipt not found.");
		if (t.status === "REVERSED") return t;
		for (let e of t.paymentIds) {
			let t = Ds.getById(e);
			if (!t || t.status !== "RECEIVED") throw Error("Receipt allocations changed; inspect individual payments first.");
			for (let t of A.getBySource("CUSTOMER_PAYMENT", e)) Zp(t.id);
		}
		for (let n of t.paymentIds) W.reverseInvoicePayment(n, e.reason);
		let n = {
			...t,
			status: "REVERSED",
			reversalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		};
		return Up = Up.map((e) => e.id === t.id ? n : e), Jp(), n;
	},
	createRefund: (e) => em("customer", e),
	reverseRefund: (e) => tm("customer", e)
}, rm = {
	create: (e) => em("supplier", e),
	reverse: (e) => tm("supplier", e),
	repairLegacyCredits(e) {
		if (N(), S(e.date, "Repair date"), e.reason?.trim().length < 3) throw Error("Enter a repair reason.");
		let t = [];
		for (let n of J.getAll().filter((e) => e.status !== "VOID")) {
			if (e.date < n.creditDate || A.getBySource("SUPPLIER_CREDIT_RECLASS", n.id).length) continue;
			let r = A.getBySource("SUPPLIER_CREDIT", n.id).find((e) => e.status === "POSTED");
			if (!r) continue;
			let i = O.requireBySystemRole("INVENTORY"), a = O.requireBySystemRole("PURCHASE_PRICE_VARIANCE"), o = Rp(r.lines.filter((e) => e.accountId === i.id).reduce((e, t) => e + t.credit - t.debit, 0));
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
}, im = t({
	id: zp,
	operationId: zp,
	fingerprint: zp,
	creditId: zp,
	contactId: zp,
	paymentDate: zp,
	bankAccountId: zp,
	amount: Bp,
	journalEntryId: zp,
	status: f(["POSTED", "REVERSED"]),
	reference: a().optional(),
	reversalDate: a().optional()
}).strict();
y("customerSettlements", {
	repository: nm,
	read: "sales.read",
	commands: {
		recordReceipt: "sales.payment",
		reverseReceipt: "sales.payment",
		createRefund: "sales.payment",
		reverseRefund: "sales.payment"
	},
	snapshot: () => ({
		receipts: Up,
		refunds: Wp
	}),
	restore: (e) => {
		Up = e.receipts, Wp = e.refunds;
	},
	validate: (e, n) => {
		am(e, n, !1);
		let i = e;
		r(im.extend({ fingerprint: a() })).parse(i.refunds), r(t({
			id: zp,
			operationId: zp,
			paymentIds: r(zp),
			amount: Bp,
			status: f(["POSTED", "REVERSED"])
		}).passthrough()).parse(i.receipts);
	},
	publish: Jp
}), y("supplierRefunds", {
	repository: rm,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		repairLegacyCredits: "accounting.recover"
	},
	snapshot: () => ({ refunds: Gp }),
	restore: (e) => {
		Gp = e.refunds;
	},
	validate: (e, t) => {
		am(e, t, !0), r(im.extend({ fingerprint: a() })).parse(e.refunds);
	},
	publish: Jp
});
function am(e, t, n) {
	let r = e, i = t.journals.journalEntries, a = n ? t.supplierCredits.supplierCredits : t.customerCredits.creditNotes, o = t.bankAccounts.bankAccounts;
	for (let e of r.refunds) {
		let t = a.find((t) => t.id === e.creditId), r = i.find((t) => t.id === e.journalEntryId), s = t?.refundEvents?.find((t) => t.id === e.id);
		if (!t || e.contactId !== ("customerId" in t ? t.customerId : t.supplierId) || !s || s.amount !== e.amount || s.date !== e.paymentDate || s.reversalDate !== e.reversalDate || !o.some((t) => t.id === e.bankAccountId) || !r || r.sourceId !== e.id || r.sourceType !== (n ? "SUPPLIER_REFUND" : "CUSTOMER_REFUND") || r.totalDebit !== e.amount || r.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) throw Error("Refund snapshot relationships are invalid.");
	}
	for (let e of a) {
		let t = Rp(r.refunds.filter((t) => t.creditId === e.id && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
		if ((e.amountRefunded ?? 0) !== t) throw Error("Credit refunded balance is invalid.");
	}
	for (let e of a) for (let t of e.refundEvents ?? []) if (!r.refunds.some((n) => n.id === t.id && n.creditId === e.id)) throw Error("Credit refund history has no settlement record.");
	if (!n) {
		let e = t.customerPayments.payments;
		for (let t of r.receipts ?? []) {
			let n = t.paymentIds.map((t) => e.find((e) => e.id === t));
			if (new Set(t.paymentIds).size !== t.paymentIds.length || !n.length || n.some((e) => !e || e.customerId !== t.customerId || e.bankAccountId !== t.bankAccountId || e.status !== (t.status === "REVERSED" ? "REVERSED" : "RECEIVED")) || Rp(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== t.amount) throw Error("Receipt allocation snapshot relationships are invalid.");
		}
	}
}
//#endregion
//#region src/features/sales/data/invoiceBalanceAsAtService.ts
function om(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= lm(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: um(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => sm(e, r)), a = um(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && cm(t, r)), s = um(o.reduce((e, t) => e + t.amount, 0)), c = um(e.totals.total), l = um(Math.max(0, c - a - s));
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
function sm(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < lm(e.reversedAt) : !1;
}
function cm(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < lm(e.reversedAt) : !1;
}
function lm(e) {
	return fe(e);
}
function um(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function dm(e, t, n) {
	let r = mm(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= pm(e.voidedAt)) return fm(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && cm(t, n)), a = mm(i.reduce((e, t) => e + t.amount, 0)), o = mm(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - a));
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
function fm(e, t, n) {
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
function pm(e) {
	return fe(e);
}
function mm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function hm(e, t, n = [], r = [], i = [], a = vm()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = om(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = gm(e.dueDate, a);
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
		current: ym(s.current),
		days1To30: ym(s.days1To30),
		days31To60: ym(s.days31To60),
		days61To90: ym(s.days61To90),
		days90Plus: ym(s.days90Plus)
	}, p = ym(c), m = ym(l), h = ym(i.reduce((t, n) => n.customerId === e.id ? t + dm(n, r, a).amountAvailable : t, 0)), g = ym(p - h);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: h,
		netAccountBalance: g,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: ym(Math.max(0, e.creditLimit - Math.max(0, g))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function gm(e, t = vm()) {
	let n = _m(e), r = _m(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function _m(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function vm() {
	return fe((/* @__PURE__ */ new Date()).toISOString());
}
function ym(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function bm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function xm(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function Sm(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? bm(t - n) : bm(n - t);
}
function Cm(e, t, n) {
	xm(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = bm(t + r.debit), n = bm(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: Sm(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = bm(r.reduce((e, t) => e + t.totalDebit, 0)), o = bm(r.reduce((e, t) => e + t.totalCredit, 0));
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
function wm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Tm({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = hm(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: wm(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = wm(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = wm(Cm(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = wm(l - d);
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
function Em(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && Dm(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = Om(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && Dm(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = Om(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && Dm(n.reversedAt) <= r ? t : t + n.amount, 0)), o = Om(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: Om(Math.max(0, o - i - a))
	};
}
function Dm(e) {
	return fe(e);
}
function Om(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function km(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && Am(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = jm(e.totals.total), i = jm(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && Am(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: jm(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - i))
	};
}
function Am(e) {
	return fe(e);
}
function jm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function Mm(e, t, n = [], r = [], i = [], a = zm()) {
	let o = Fm(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = Em(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = Pm(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = Rm(r.reduce((t, n) => n.supplierId === e.id ? t + km(n, i, a).amountAvailable : t, 0)), p = Rm(s), m = Rm(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: Rm(c),
		aging: Im(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function Nm(e, t, n = [], r = [], i = [], a = zm()) {
	let o = Fm(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let h of e) {
		let e = Mm(h, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: Rm(s),
		unallocatedCredit: Rm(c),
		totalOutstanding: Rm(l),
		overdueAmount: Rm(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: Im(o)
	};
}
function Pm(e, t = zm()) {
	let n = Lm(e), r = Lm(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Fm() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function Im(e) {
	return {
		current: Rm(e.current),
		days1To30: Rm(e.days1To30),
		days31To60: Rm(e.days31To60),
		days61To90: Rm(e.days61To90),
		days90Plus: Rm(e.days90Plus)
	};
}
function Lm(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function Rm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function zm() {
	return fe((/* @__PURE__ */ new Date()).toISOString());
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function Bm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Vm({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = Nm(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = Bm(Cm(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = Bm(c.totalOutstanding), f = Bm(d - u);
	return {
		asOfDate: s,
		grossOutstanding: Bm(c.grossOutstanding),
		unallocatedCredit: Bm(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function Hm(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function Um(e) {
	return e.slice(0, 10);
}
function Wm(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function Gm(e, t) {
	Hm(t);
	let n = e.filter((e) => Um(e.occurredAt) <= t).slice().sort(Wm), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = G(n.quantityOnHand + e.quantityBase), a = bc(n.inventoryValue + e.valueChange);
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
		let t = Nc.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = B(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : yc(e.inventoryValue / e.quantityOnHand);
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
		totalInventoryValue: bc(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function Km(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function qm(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function Jm({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	qm(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = Gm(n, r), o = Km(Cm(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = Km(a.totalInventoryValue), c = Km(s - o);
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
var Ym = (e) => Math.round((e + 2 ** -52) * 100) / 100, $ = a().trim().min(1).max(200), Xm = w().finite().refine((e) => Ym(e) === e, "Amounts must use cents precision"), Zm = t({
	accountId: $,
	debit: Xm.nonnegative(),
	credit: Xm.nonnegative()
}).strict(), Qm = t({
	contactId: $,
	reference: $,
	date: $,
	dueDate: $,
	amount: Xm
}).strict(), $m = t({
	operationId: $,
	date: $,
	reason: a().trim().min(3).max(1e3),
	gl: r(Zm).min(2).max(5e3),
	ar: r(Qm).max(1e4),
	ap: r(Qm).max(1e4),
	banks: r(t({
		bankAccountId: $,
		amount: Xm
	}).strict()).max(500),
	stock: r(t({
		siteId: $,
		productId: $,
		quantity: w().positive().finite(),
		unitCost: w().nonnegative().finite()
	}).strict()).max(1e4)
}).strict(), eh = [], th = 0, nh = /* @__PURE__ */ new Set(), rh = () => {
	th++, nh.forEach((e) => e());
};
function ih() {
	return C();
}
function ah(e) {
	ae(e), jo(e.sales), Uo(e.customerCredits), k.update("supplierBills", e.supplierBills.supplierBills), k.update("supplierCredits", e.supplierCredits.supplierCredits);
}
function oh(e, t) {
	if (new Set(e).size !== e.length) throw Error("Duplicate " + t + ".");
}
function sh(e) {
	let t = $m.parse(e);
	if (S(t.date, "Cutover date"), qe(t.date), N(), eh.some((e) => e.status === "POSTED")) throw Error("An opening batch is already active. Reverse the unused batch before replacing it.");
	let n = ih();
	if (n.journals.journalEntries.some((e) => e.journalDate >= t.date)) throw Error("Cutover must be after all existing ledger activity. This import adds historical balances, never replaces existing transactions.");
	if (n.inventoryMovements.movements.some((e) => e.occurredAt.slice(0, 10) >= t.date)) throw Error("Cutover must be after existing inventory activity.");
	oh(t.gl.map((e) => e.accountId), "GL account"), oh(t.banks.map((e) => e.bankAccountId), "bank"), oh(t.stock.map((e) => e.siteId + ":" + e.productId), "site/product");
	let r = Tm({
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
	}), i = Vm({
		suppliers: n.suppliers.suppliers,
		bills: n.supplierBills.supplierBills,
		payments: n.supplierPayments.supplierPayments,
		credits: n.supplierCredits.supplierCredits,
		creditAllocations: n.supplierCredits.allocations,
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: t.date
	}), a = Jm({
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
	let o = O.getAll(), s = (e) => O.requireBySystemRole(e).id, c = (e) => Ym(t.gl.filter((t) => t.accountId === e).reduce((e, t) => e + t.debit - t.credit, 0));
	for (let e of t.gl) {
		let t = O.requireById(e.accountId);
		if (!t.active || ![
			"ASSET",
			"LIABILITY",
			"EQUITY"
		].includes(t.type) || e.debit > 0 && e.credit > 0 || e.debit + e.credit <= 0) throw Error("Opening GL requires active balance-sheet accounts and one positive debit or credit per row.");
	}
	let l = Ym(t.gl.reduce((e, t) => e + t.debit, 0)), u = Ym(t.gl.reduce((e, t) => e + t.credit, 0));
	if (l !== u || !l) throw Error("Opening trial balance does not balance.");
	let d = Ym(t.ar.reduce((e, t) => e + t.amount, 0)), f = Ym(t.ap.reduce((e, t) => e + t.amount, 0));
	if (c(s("ACCOUNTS_RECEIVABLE")) !== d || c(s("ACCOUNTS_PAYABLE")) !== -f) throw Error("AR/AP detail must equal imported GL control balances. Negative detail creates an unused historical credit.");
	for (let [e, r] of [["ar", t.ar], ["ap", t.ap]]) {
		oh(r.map((e) => e.contactId + ":" + e.reference.toLowerCase()), e + " reference");
		for (let i of r) {
			if (S(i.date), S(i.dueDate), !i.amount || i.date > t.date || i.dueDate < i.date) throw Error("Invalid outstanding document amount/date.");
			if (!(e === "ar" ? n.customers.customers : n.suppliers.suppliers).some((e) => e.id === i.contactId)) throw Error("Opening contact not found.");
			if ((e === "ar" ? [...n.sales.invoices.map((e) => [e.customerId, e.documentNumber]), ...n.customerCredits.creditNotes.map((e) => [e.customerId, e.creditNoteNumber])] : [...n.supplierBills.supplierBills.map((e) => [e.supplierId, e.supplierInvoiceNumber]), ...n.supplierCredits.supplierCredits.map((e) => [e.supplierId, e.supplierCreditNumber])]).some(([e, t]) => e === i.contactId && t.toLowerCase() === i.reference.toLowerCase())) throw Error("Historical document reference already exists.");
		}
	}
	let p = 0;
	for (let e of t.stock) {
		let t = B(e.productId), n = Nc.getById(e.siteId);
		if (!t || t.status !== "ACTIVE" || t.itemType === "SERVICE" || n?.status !== "ACTIVE") throw Error("Opening stock requires active stocked products/sites.");
		if (Math.round(e.quantity * 1e4) / 1e4 !== e.quantity) throw Error("Stock quantities use at most four decimal places.");
		p = Ym(p + Ym(e.quantity * e.unitCost));
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
			let { input: t, debit: n, credit: r, ar: i, ap: a, inventory: o } = sh(e);
			return {
				date: t.date,
				debit: n,
				credit: r,
				ar: i,
				ap: a,
				inventory: o,
				bank: Ym(t.banks.reduce((e, t) => e + t.amount, 0)),
				documents: t.ar.length + t.ap.length
			};
		},
		post(e) {
			let t = $m.parse(e), n = JSON.stringify(t), r = eh.find((e) => e.operationId === t.operationId);
			if (n.length > 5e7) throw Error("Opening import exceeds 50 MB.");
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID already used for different opening data.");
				return r;
			}
			let { input: i, s: a } = sh(t), o = crypto.randomUUID(), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
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
			a.journals = ih().journals, ah(a);
			let p = i.gl.filter((e) => ![l("ACCOUNTS_RECEIVABLE"), l("ACCOUNTS_PAYABLE")].includes(e.accountId));
			(d || f) && p.push({
				accountId: u,
				debit: Ym(d),
				credit: Ym(f)
			});
			let m = /* @__PURE__ */ new Map();
			for (let e of p) m.set(e.accountId, Ym((m.get(e.accountId) ?? 0) + e.debit - e.credit));
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
				let t = B(e.productId), n = t.units.find((e) => e.id === t.baseUnitId), r = Rc.create({
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
				cl.receive({
					siteId: e.siteId,
					productId: t.id,
					baseUnitId: t.baseUnitId,
					quantityBase: e.quantity
				});
				let a = tl({
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
			return eh = [...eh, c], rh(), c;
		},
		reverse(e) {
			if (S(e.date), qe(e.date), N(), !e.reason?.trim() || e.reason.trim().length < 3) throw Error("Reversal reason is required.");
			let t = eh.find((t) => t.id === e.id);
			if (!t) throw Error("Opening batch not found.");
			if (t.status === "REVERSED") return t;
			if (e.date < t.date) throw Error("Reversal date precedes cutover.");
			let n = ih();
			if (n.journals.journalEntries.some((e) => !t.priorJournalIds.includes(e.id) && !t.journalIds.includes(e.id)) || n.inventoryMovements.movements.some((e) => !t.priorMovementIds.includes(e.id) && !t.movementIds.includes(e.id))) throw Error("Subsequent accounting or inventory activity exists. Reverse downstream activity before correcting opening balances.");
			let r = n.sales.invoices.filter((e) => t.invoiceIds.includes(e.id)), i = n.supplierBills.supplierBills.filter((e) => t.billIds.includes(e.id)), a = [...n.customerCredits.creditNotes.filter((e) => t.customerCreditIds.includes(e.id)), ...n.supplierCredits.supplierCredits.filter((e) => t.supplierCreditIds.includes(e.id))];
			if (r.some((e) => e.amountPaid !== 0 || e.amountDue !== e.totals.total) || i.some((e) => e.totals.amountPaid !== 0 || e.totals.amountCredited !== 0) || a.some((e) => e.amountApplied !== 0 || (e.amountRefunded ?? 0) !== 0)) throw Error("Opening balances have allocations or settlements. Reverse downstream allocations before correcting them.");
			for (let e of ["customerSettlements", "supplierRefunds"]) if (JSON.stringify(n[e]).includes(t.id)) throw Error("Opening balances have downstream settlements.");
			for (let e of t.journalIds) Zp(e);
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
			return n.stock.balances = t.priorStock, n.costBalances.balances = t.priorCost, n.journals = ih().journals, ah(n), eh = eh.map((n) => n.id === t.id ? {
				...n,
				status: "REVERSED",
				reversalDate: e.date,
				reversalReason: e.reason
			} : n), rh(), eh.find((e) => e.id === t.id);
		}
	},
	read: "accounting.read",
	commands: {
		preview: "accounting.post",
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ batches: eh }),
	restore: (e) => {
		eh = e.batches;
	},
	publish: rh,
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
			let t = $m.parse(JSON.parse(e.fingerprint));
			if (t.operationId !== e.operationId || t.date !== e.date) throw Error("Opening import identity is invalid.");
			if (e.status === "REVERSED" && !e.reversalDate) throw Error("Opening reversal date is missing.");
			e.reversalDate && S(e.reversalDate), S(e.date);
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
var ch = /* @__PURE__ */ new Set(), lh = k.read().supplierPayments;
k.onRollback(() => {
	lh = k.read().supplierPayments;
});
function uh() {
	k.update("supplierPayments", lh), ch.forEach((e) => k.notify(e));
}
var dh = {
	subscribe(e) {
		return ch.add(e), () => {
			ch.delete(e);
		};
	},
	getSnapshot() {
		return lh;
	},
	getAll() {
		return lh;
	},
	getById(e) {
		return lh.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return lh.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return lh.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: ph(e.reference),
			notes: ph(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: mh(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = lh.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (S(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = yi.getById(e.supplierId);
		if (!r) throw Error("Supplier was not found.");
		if (!e.paymentDate) throw Error("Payment date is required.");
		if (!e.method) throw Error("Payment method is required.");
		if (!e.bankAccountId) throw Error("Bank account is required.");
		let i = Mt.getById(e.bankAccountId);
		if (!i) throw Error("Bank account was not found.");
		if (!i.active) throw Error("The selected bank account is inactive.");
		let a = e.allocations.filter((e) => Number.isFinite(e.amount) && e.amount > 0);
		if (a.length === 0) throw Error("Allocate the payment to at least one supplier bill.");
		let o = /* @__PURE__ */ new Set(), s = a.map((t) => {
			if (o.has(t.supplierBillId)) throw Error("A supplier bill cannot appear more than once in the same payment.");
			o.add(t.supplierBillId);
			let n = Fl.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = mh(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${hh(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), c = mh(s.reduce((e, t) => e + t.amount, 0));
		if (c <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of s) Fl.applyPayment(e.supplierBillId, e.amount);
		let l = (/* @__PURE__ */ new Date()).toISOString(), u = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: fh(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: c,
			method: e.method,
			bankAccountId: i.id,
			reference: ph(e.reference),
			notes: ph(e.notes),
			allocations: s,
			status: "POSTED",
			createdAt: l,
			updatedAt: l
		};
		return lh = [u, ...lh], uh(), jc.postSupplierPayment(u), u;
	},
	reverse(e, t) {
		Fe("SUPPLIER_PAYMENT", e);
		let n = lh.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = Fl.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) Fl.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return lh = lh.map((t) => t.id === e ? a : t), uh(), jc.reverseSupplierPayment(a), a;
	}
};
function fh(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = lh.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function ph(e) {
	return e?.trim() || void 0;
}
function mh(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function hh(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: _().currency
	}).format(e);
}
var gh = dh.create;
dh.create = function(...e) {
	return N(), k.transaction(() => gh.apply(dh, e));
};
var _h = dh.reverse;
dh.reverse = function(...e) {
	return N(), k.transaction(() => _h.apply(dh, e));
}, y("supplierPayments", {
	repository: dh,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: lh }),
	restore: (e) => {
		lh = e.supplierPayments;
	},
	publish: () => ch.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/paymentBatchRepository.ts
var vh = (e) => Math.round((e + 2 ** -52) * 100) / 100, yh = a().trim().min(1).max(200), bh = t({
	operationId: yh,
	paymentDate: yh,
	bankAccountId: yh,
	reference: a().max(500),
	allocations: r(t({
		supplierBillId: yh,
		amount: w().finite().positive().refine((e) => vh(e) === e)
	}).strict()).min(1).max(500)
}).strict(), xh = [], Sh = 0, Ch = /* @__PURE__ */ new Set(), wh = () => {
	Sh++, Ch.forEach((e) => e());
}, Th = () => {
	let e = T.current();
	if (!e) throw Error("A verified session is required.");
	return e.userId;
};
function Eh(e, t) {
	return {
		action: e,
		reason: t,
		actor: Th(),
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function Dh(e) {
	let t = xh.find((t) => t.id === e);
	if (!t) throw Error("Payment batch was not found.");
	return t;
}
function Oh(e) {
	return xh = xh.map((t) => t.id === e.id ? e : t), wh(), e;
}
function kh(e) {
	S(e.paymentDate, "Payment date");
	let t = Mt.requireById(e.bankAccountId);
	if (!t.active || e.paymentDate < t.openingBalanceDate) throw Error("Invalid paying bank account/date.");
	if (new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length) throw Error("Select each bill only once.");
	for (let t of e.allocations) {
		let n = Fl.getById(t.supplierBillId);
		if (!n || n.status === "VOID" || t.amount > n.totals.amountDue || e.paymentDate < n.billDate) throw Error("A bill amount, date or outstanding balance changed. Review the batch.");
	}
}
y("paymentBatches", {
	repository: {
		create(e) {
			let t = bh.parse(e), n = JSON.stringify(t), r = xh.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID was used with different batch data.");
				return r;
			}
			kh(t);
			let i = {
				...t,
				id: crypto.randomUUID(),
				fingerprint: n,
				status: "DRAFT",
				createdBy: Th(),
				paymentIds: [],
				history: [Eh("Created")]
			};
			return xh = [...xh, i], wh(), i;
		},
		approve(e) {
			let t = Dh(e);
			if (t.status === "APPROVED") return t;
			if (t.status !== "DRAFT") throw Error("Only a draft batch can be approved.");
			return kh(t), Oh({
				...t,
				status: "APPROVED",
				approvedBy: Th(),
				history: [...t.history, Eh("Approved")]
			});
		},
		post(e) {
			let t = Dh(e);
			if (t.status === "POSTED") return t;
			if (t.status !== "APPROVED") throw Error("Approve the batch before recording payments.");
			N(), kh(t);
			let n = /* @__PURE__ */ new Map();
			for (let e of t.allocations) {
				let t = Fl.getById(e.supplierBillId);
				n.set(t.supplierId, [...n.get(t.supplierId) ?? [], e]);
			}
			let r = [...n].map(([e, n]) => dh.create({
				operationId: "batch:" + t.id + ":" + e,
				supplierId: e,
				paymentDate: t.paymentDate,
				bankAccountId: t.bankAccountId,
				reference: t.reference,
				method: "BANK_TRANSFER",
				allocations: n
			}));
			if (r.some((e) => e.status !== "POSTED")) throw Error("Batch payment is not posted. Inspect the prior operation before retrying.");
			return Oh({
				...t,
				status: "POSTED",
				paymentIds: r.map((e) => e.id),
				history: [...t.history, Eh("Payments recorded")]
			});
		},
		cancel(e) {
			let t = Dh(e.id);
			if (!["DRAFT", "APPROVED"].includes(t.status) || e.reason?.trim().length < 3) throw Error("Only an unposted batch can be cancelled, with a reason.");
			return Oh({
				...t,
				status: "CANCELLED",
				history: [...t.history, Eh("Cancelled", e.reason)]
			});
		},
		reverse(e) {
			let t = Dh(e.id);
			if (t.status === "REVERSED") return t;
			if (t.status !== "POSTED" || e.reason?.trim().length < 3) throw Error("A posted batch and reversal reason are required.");
			N();
			for (let e of t.paymentIds) {
				let t = dh.getById(e);
				if (!t || t.status !== "POSTED") throw Error("Batch payments changed. Inspect before reversing.");
				Fe("SUPPLIER_PAYMENT", e);
			}
			for (let n of t.paymentIds) dh.reverse(n, e.reason);
			return Oh({
				...t,
				status: "REVERSED",
				history: [...t.history, Eh("Reversed", e.reason)]
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
	snapshot: () => ({ batches: xh }),
	restore: (e) => {
		xh = e.batches;
	},
	validate: (e, n) => {
		let i = bh.extend({
			id: yh,
			fingerprint: a(),
			status: f([
				"DRAFT",
				"APPROVED",
				"POSTED",
				"REVERSED",
				"CANCELLED"
			]),
			createdBy: yh,
			approvedBy: yh.optional(),
			paymentIds: r(yh),
			history: r(t({
				action: yh,
				actor: yh,
				at: yh,
				reason: a().optional()
			}).strict())
		}).strict(), o = t({ batches: r(i) }).strict().parse(e), s = n, c = s.supplierPayments.supplierPayments, l = s.bankAccounts.bankAccounts, u = s.supplierBills.supplierBills, d = /* @__PURE__ */ new Set();
		if (new Set(o.batches.map((e) => e.id)).size !== o.batches.length || new Set(o.batches.map((e) => e.operationId)).size !== o.batches.length) throw Error("Duplicate payment batch identity or operation.");
		let p = (e) => JSON.stringify(e.map((e) => ({
			supplierBillId: e.supplierBillId,
			amount: e.amount
		})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId)));
		for (let e of o.batches) {
			try {
				S(e.paymentDate, "Batch payment date");
			} catch {
				throw Error("Invalid payment batch date.");
			}
			let t = {
				operationId: e.operationId,
				paymentDate: e.paymentDate,
				bankAccountId: e.bankAccountId,
				reference: e.reference,
				allocations: e.allocations
			};
			if (e.fingerprint !== JSON.stringify(t) || !l.some((t) => t.id === e.bankAccountId) || new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length || e.allocations.some((e) => !u.some((t) => t.id === e.supplierBillId))) throw Error("Payment batch creation data or references are invalid.");
			let n = e.history.map((e) => e.action).join("|"), r = e.history.find((e) => e.action === "Approved");
			if (!{
				DRAFT: ["Created"],
				APPROVED: ["Created|Approved"],
				POSTED: ["Created|Approved|Payments recorded"],
				REVERSED: ["Created|Approved|Payments recorded|Reversed"],
				CANCELLED: ["Created|Cancelled", "Created|Approved|Cancelled"]
			}[e.status].includes(n) || e.createdBy !== e.history[0]?.actor || e.approvedBy !== r?.actor || e.history.some((e) => !Number.isFinite(Date.parse(e.at)) || ["Cancelled", "Reversed"].includes(e.action) && (e.reason?.trim().length ?? 0) < 3)) throw Error("Payment batch lifecycle or approval history is invalid.");
			if (!["POSTED", "REVERSED"].includes(e.status)) {
				if (e.paymentIds.length) throw Error("An unposted batch cannot own supplier payments.");
				continue;
			}
			let i = /* @__PURE__ */ new Map();
			for (let t of e.allocations) {
				let e = u.find((e) => e.id === t.supplierBillId).supplierId;
				i.set(e, [...i.get(e) ?? [], t]);
			}
			if (e.paymentIds.length !== i.size || new Set(e.paymentIds).size !== e.paymentIds.length) throw Error("Payment batch supplier groups are incomplete or duplicated.");
			let a = /* @__PURE__ */ new Set();
			for (let t of e.paymentIds) {
				let n = c.find((e) => e.id === t), r = n && i.get(n.supplierId);
				if (d.has(t) || !n || !r || a.has(n.supplierId) || n.operationId !== "batch:" + e.id + ":" + n.supplierId || n.bankAccountId !== e.bankAccountId || n.paymentDate !== e.paymentDate || n.method !== "BANK_TRANSFER" || (n.reference ?? "") !== e.reference.trim() || n.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED") || p(n.allocations) !== p(r) || n.amount !== vh(r.reduce((e, t) => e + t.amount, 0))) throw Error("Payment batch payment relationships are invalid.");
				if (d.add(t), a.add(n.supplierId), !s.journals.journalEntries.some((e) => e.sourceType === "SUPPLIER_PAYMENT" && e.sourceId === t)) throw Error("A batch payment journal is missing.");
			}
		}
	},
	publish: wh
});
//#endregion
//#region src/features/finance-closure/bankStatementRepository.ts
var Ah = (e) => Math.round((e + 2 ** -52) * 100) / 100, jh = a().min(1).max(200), Mh = [], Nh = 0, Ph = /* @__PURE__ */ new Set(), Fh = () => {
	Nh++, Ph.forEach((e) => e());
};
function Ih(e) {
	let t = Mt.requireById(e);
	if (!t.active) throw Error("Select an active bank account.");
	return t;
}
function Lh(e) {
	let t = Mh.find((t) => t.id === e);
	if (!t) throw Error("Statement line was not found.");
	return t;
}
function Rh(e) {
	if (e.status !== "UNMATCHED") throw Error("This line is already processed. Revert it before changing it.");
	let t = Ip.getLatestByBankAccount(e.bankAccountId);
	if (t && e.date <= t.statementDate) throw Error("Statement date is already reconciled.");
}
function zh(e) {
	return Mh = Mh.map((t) => t.id === e.id ? e : t), Fh(), e;
}
var Bh = (e, t) => vu(Ih(e), A.getAll(), t).transactions;
function Vh(e) {
	if (e.date < Ih(e.bankAccountId).openingBalanceDate) throw Error("Statement predates the current bank opening date.");
}
var Hh = t({
	date: jh,
	description: a().trim().min(1).max(1e3),
	amount: w().finite().refine((e) => e !== 0 && Ah(e) === e, "Enter a non-zero amount in cents"),
	reference: a().max(500).default(""),
	externalId: a().max(200).default("")
}).strict(), Uh = {
	importRows(e) {
		let n = t({
			bankAccountId: jh,
			rows: r(Hh).min(1).max(1e4)
		}).strict().parse(e), i = Ih(n.bankAccountId), a = 0, o = [...Mh], s = [];
		for (let e of n.rows) {
			if (S(e.date, "Statement date"), e.date < i.openingBalanceDate) throw Error("Statement predates the bank opening date.");
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
			let r = Ip.getLatestByBankAccount(i.id);
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
		return Mh = o, Fh(), {
			created: s.length,
			duplicates: a
		};
	},
	importCsv(e) {
		if (typeof e.csv != "string" || e.csv.length > 1e7) throw Error("CSV exceeds the 10 MB limit.");
		let t = sn(e.csv.replace(/^\uFEFF/, "")), n = t.shift()?.map((e) => e.trim().toLowerCase()) ?? [];
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
		return Uh.importRows({
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
					l = Ah(t - e);
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
		return S(e.asOfDate, "As-of date"), Bh(e.bankAccountId, e.asOfDate).filter((e) => e.journalStatus === "POSTED" && !Mh.some((t) => t.ledgerIds.includes(e.id)));
	},
	match(e) {
		let t = Lh(e.id);
		if (Rh(t), Vh(t), !Array.isArray(e.ledgerIds) || !e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Select unique ledger entries.");
		let n = Uh.candidates({
			bankAccountId: t.bankAccountId,
			asOfDate: t.date
		}), r = e.ledgerIds.map((e) => n.find((t) => t.id === e));
		if (r.some((e) => !e) || Ah(r.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== t.amount) throw Error("Selected bank entries must match this signed statement amount exactly.");
		return zh({
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
		let t = Lh(e.id);
		return (x["bank-rules"] ?? []).filter((e) => e.status === "Active" && e.enabled !== "No").filter((e) => {
			let n = (e.field === "Reference" ? t.reference : e.field === "Description" ? t.description : "").toLowerCase(), r = e.value.toLowerCase();
			return e.operator === "Equals" ? n === r : e.operator === "Starts with" ? n.startsWith(r) : n.includes(r);
		});
	},
	post(e) {
		N();
		let n = Lh(e.id), i = JSON.stringify(e.splits);
		if (n.status === "POSTED") {
			if (n.fingerprint !== i) throw Error("Line was already posted with different categorisation.");
			return n;
		}
		Rh(n), Vh(n);
		let a = r(t({
			accountId: jh,
			amount: w().finite().positive().refine((e) => Ah(e) === e),
			taxCode: jh
		}).strict()).min(1).max(100).parse(e.splits);
		if (Ah(a.reduce((e, t) => e + t.amount, 0)) !== Math.abs(n.amount)) throw Error("Split amounts must equal the statement total.");
		let o = Ih(n.bankAccountId), s = n.amount < 0, c = a.flatMap((e) => {
			let t = O.requireById(e.accountId);
			if (!t.active || !t.allowManualPosting || !["EXPENSE", "REVENUE"].includes(t.type)) throw Error("Use an active manual expense/revenue account. Payments against AR/AP must be matched to their source documents.");
			let n = b(e.taxCode), r = Ah(e.amount / (1 + n)), i = Ah(e.amount - r);
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
		return zh({
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
		let t = Lh(e.id);
		if (Rh(t), e.reason?.trim().length < 3) throw Error("Enter an exclusion reason.");
		return zh({
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
		let t = Lh(e.id);
		if (S(e.reversalDate, "Reversal date"), e.reason?.trim().length < 3 || e.reversalDate < t.date) throw Error("Enter a reason and a reversal date on or after the statement line.");
		if (t.status === "UNMATCHED") throw Error("Line is already unmatched.");
		for (let e of t.ledgerIds) Zp(e.split(":")[0]);
		let n = Ip.getLatestByBankAccount(t.bankAccountId);
		if (n && t.date <= n.statementDate) throw Error("Reconciled statement lines cannot be reverted.");
		return t.status === "POSTED" && t.journalEntryId && A.reverse({
			journalEntryId: t.journalEntryId,
			reversalDate: e.reversalDate,
			reason: e.reason
		}), zh({
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
		if (qe(e.statementDate), N(), S(e.statementDate, "Statement date"), !Mh.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate)) throw Error("Import the statement first.");
		if (Mh.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate && t.status === "UNMATCHED")) throw Error("Process every statement line before completing reconciliation.");
		let t = Mh.filter((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate), n = Bh(e.bankAccountId, e.statementDate);
		for (let e of t.filter((e) => e.status === "MATCHED" || e.status === "POSTED")) {
			let t = e.ledgerIds.map((e) => n.find((t) => t.id === e));
			if (!t.length || t.some((e) => !e || e.journalStatus !== "POSTED") || Ah(t.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== e.amount) throw Error("Statement match is stale. Revert the statement line and review its ledger sources before reconciling.");
		}
		let r = t.flatMap((e) => e.ledgerIds);
		return Ip.complete({
			...e,
			clearedTransactionIds: [.../* @__PURE__ */ new Set([...Ip.getClearedTransactionIds(e.bankAccountId), ...r])]
		});
	}
}, Wh = t({
	id: jh,
	key: a(),
	bankAccountId: jh,
	date: jh,
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
	ledgerIds: r(jh),
	journalEntryId: a().optional(),
	fingerprint: a().optional(),
	history: r(t({
		action: a(),
		date: a(),
		reason: a().optional()
	}))
}).strict();
y("bankStatements", {
	repository: Uh,
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
	snapshot: () => ({ lines: Mh }),
	restore: (e) => {
		Mh = e.lines;
	},
	validate: (e, n) => {
		let i = t({ lines: r(Wh) }).strict().parse(e), a = n, o = a.bankAccounts.bankAccounts, s = a.journals.journalEntries, c = /* @__PURE__ */ new Set(), l = new Map(s.map((e) => [e.id, e])), u = new Map(s.flatMap((e) => e.lines.map((t) => [e.id + ":" + t.id, {
			journal: e,
			entry: t
		}])));
		if (new Set(i.lines.map((e) => e.key)).size !== i.lines.length) throw Error("Duplicate bank statement import key.");
		for (let e of i.lines) {
			let n = o.find((t) => t.id === e.bankAccountId);
			if (!n) throw Error("Bank statement account is missing.");
			try {
				S(e.date), Hh.parse({
					date: e.date,
					description: e.description,
					amount: e.amount,
					reference: e.reference,
					externalId: e.externalId
				});
			} catch {
				throw Error("Invalid bank statement date, amount or metadata.");
			}
			let i = JSON.stringify([e.bankAccountId, e.externalId || [
				e.date,
				e.amount,
				e.description.trim().toLowerCase(),
				e.reference.trim().toLowerCase()
			]]);
			if (e.key !== i) throw Error("Bank statement import identity does not match its data.");
			let a;
			for (let t of e.history) {
				if (!Number.isFinite(Date.parse(t.date))) throw Error("Invalid bank statement history date.");
				if (!a && t.action === "Imported") a = "UNMATCHED";
				else if (a === "UNMATCHED" && [
					"Matched",
					"Posted",
					"Excluded"
				].includes(t.action)) {
					if (t.action === "Excluded" && (t.reason?.trim().length ?? 0) < 3) throw Error("Bank statement exclusion has no reason.");
					a = t.action === "Matched" ? "MATCHED" : t.action === "Posted" ? "POSTED" : "IGNORED";
				} else if (a && a !== "UNMATCHED" && t.action === "Reverted" && (t.reason?.trim().length ?? 0) >= 3) a = "UNMATCHED";
				else throw Error("Invalid bank statement lifecycle history.");
			}
			if (a !== e.status) throw Error("Bank statement status does not match its history.");
			if (e.status === "UNMATCHED" || e.status === "IGNORED") {
				if (e.ledgerIds.length || e.journalEntryId || e.fingerprint) throw Error("An unposted bank statement line cannot retain ledger links.");
				continue;
			}
			if (!e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Bank statement ledger links are missing or duplicated.");
			let s = 0;
			for (let t of e.ledgerIds) {
				let r = u.get(t), i = r?.journal, a = r?.entry;
				if (c.has(t) || !i || !a || a.accountId !== n.glAccountId || i.journalDate > e.date) throw Error("Bank statement ledger source is invalid or reused.");
				c.add(t), s = Ah(s + a.debit - a.credit);
			}
			if (s !== e.amount) throw Error("Bank statement amount does not match its ledger links.");
			if (e.status === "MATCHED") {
				if (e.journalEntryId || e.fingerprint) throw Error("Matched bank statements cannot claim categorisation journals.");
			} else {
				let i = l.get(e.journalEntryId ?? ""), a = e.history.filter((e) => e.action === "Posted").length - 1, o = i?.lines.filter((e) => e.accountId === n.glAccountId).map((e) => i.id + ":" + e.id).sort();
				if (!i || i.status !== "POSTED" || i.sourceType !== "BANK_STATEMENT" || i.sourceId !== e.id + ":" + a || i.journalDate !== e.date || JSON.stringify(o) !== JSON.stringify([...e.ledgerIds].sort())) throw Error("Bank statement categorisation journal does not match its source.");
				try {
					if (Ah(r(t({
						accountId: jh,
						amount: w().finite().positive().refine((e) => Ah(e) === e),
						taxCode: jh
					}).strict()).min(1).max(100).parse(JSON.parse(e.fingerprint ?? "")).reduce((e, t) => e + t.amount, 0)) !== Math.abs(e.amount)) throw Error("Wrong split total.");
				} catch {
					throw Error("Bank statement categorisation fingerprint is invalid.");
				}
			}
		}
	},
	publish: Fh
});
//#endregion
//#region src/lib/persistence/financialConsistencyAudit.ts
function Gh(e) {
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
var Kh = /* @__PURE__ */ new Set(), qh = k.read().transactions, Jh = k.read().transfers;
k.onRollback(() => {
	let e = k.read();
	qh = e.transactions, Jh = e.transfers;
});
function Yh() {
	Kh.forEach((e) => k.notify(e));
}
function Xh(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function Zh(e) {
	return e?.trim() || void 0;
}
function Qh(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function $h(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function eg(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function tg(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var ng = {
	subscribe(e) {
		return Kh.add(e), () => {
			Kh.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return qh;
	},
	getTransfersSnapshot() {
		return Jh;
	},
	getTransactions() {
		return qh;
	},
	getTransfers() {
		return Jh;
	},
	createTransaction(e, t) {
		if (Qh(e.transactionDate), S(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = $h(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Xh(e.description, "Description"), i = Mt.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let a = O.requireById(i.glAccountId);
		if (!a.active) throw Error("The selected bank GL account is inactive.");
		let o = O.requireById(e.offsetAccountId);
		if (!o.active) throw Error("The offset account is inactive.");
		if (!o.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (o.id === a.id) throw Error("Bank and offset accounts must be different.");
		if (Mt.getByGlAccountId(o.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let s = eg("banktxn"), c = tg("BTXN", e.transactionDate, qh.length + 1), l = t?.trim();
		if (t !== void 0 && !l) throw Error("Operation ID cannot be empty");
		if (l) {
			let t = j.begin(l, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = qh.find((e) => e.id === t.operation.resultId);
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
				reference: Zh(e.reference),
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
				reference: Zh(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [u, ...qh];
			if (k.update("transactions", d), qh = d, Yh(), l) {
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
		Qh(e.transferDate), S(e.transferDate, "Transfer date");
		let n = $h(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Xh(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = Mt.requireById(e.fromBankAccountId), a = Mt.requireById(e.toBankAccountId);
		if (!i.active || !a.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== a.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < a.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let o = O.requireById(i.glAccountId), s = O.requireById(a.glAccountId);
		if (!o.active || !s.active) throw Error("Both bank GL accounts must be active.");
		if (o.id === s.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let c = eg("banktrf"), l = tg("BTRF", e.transferDate, Jh.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = j.begin(u, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Jh.find((e) => e.id === t.operation.resultId);
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
				reference: Zh(e.reference),
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
				reference: Zh(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [d, ...Jh];
			if (k.update("transfers", f), Jh = f, Yh(), u) {
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
}, rg = ng.createTransaction;
ng.createTransaction = function(e, t) {
	N();
	let n;
	try {
		return n = k.transaction(() => rg.call(ng, e, t)), t && j.complete(t.trim(), n.id), n;
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
var ig = ng.createTransfer;
ng.createTransfer = function(e, t) {
	N();
	let n;
	try {
		return n = k.transaction(() => ig.call(ng, e, t)), t && j.complete(t.trim(), n.id), n;
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
	repository: ng,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: qh,
		bankTransfers: Jh
	}),
	restore: (e) => {
		qh = e.bankTransactions, Jh = e.bankTransfers;
	},
	publish: () => Kh.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function ag() {
	return Gh({
		transactions: ng.getTransactions(),
		transfers: ng.getTransfers(),
		payments: Ds.getAll(),
		journals: A.getAll(),
		invoices: W.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: H.getAll(),
		supplierBills: Fl.getAll(),
		supplierPayments: dh.getAll(),
		supplierCredits: J.getAll()
	});
}
//#endregion
//#region electron/security/periodCloseChecks.ts
function og(e) {
	let t = C(), n = [], r = (e, t) => n.push({
		code: e,
		message: t
	});
	e.endDate >= fe((/* @__PURE__ */ new Date()).toISOString()) && r("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of j.getUnresolved()) r("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of t.purchaseOperations) e.status !== "POSTED" && r("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of ag()) r(e.code, `${e.entityId}: ${e.message}`);
	for (let n of t.payroll?.runs ?? []) n.status === "Approved" && n.payDate <= e.endDate && r("PAYROLL_NOT_POSTED", `Post, reopen or cancel approved payroll ${n.name} dated ${n.payDate}.`);
	for (let n of t.paymentBatches?.batches ?? []) n.status === "APPROVED" && n.paymentDate <= e.endDate && r("PAYMENT_BATCH_NOT_POSTED", `Post or cancel approved payment batch ${n.reference || n.id} dated ${n.paymentDate}.`);
	let i = {
		accounts: t.accounts.accounts,
		journalEntries: t.journals.journalEntries,
		asOfDate: e.endDate
	}, a = [
		["AR", () => Tm({
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
		["AP", () => Vm({
			...i,
			suppliers: t.suppliers.suppliers,
			bills: t.supplierBills.supplierBills,
			payments: t.supplierPayments.supplierPayments,
			credits: t.supplierCredits.supplierCredits,
			creditAllocations: t.supplierCredits.allocations
		})],
		["INVENTORY", () => Jm({
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
var sg = null, cg = {
	configureTrustedSession(e) {
		sg = e;
	},
	clear() {
		sg = null;
	},
	current() {
		return sg?.() ?? null;
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
}, lg = "htt.purchasePosting.manualRecoveryAudit.v1";
function ug() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(lg) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var dg = ug();
function fg(e) {
	dg.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(lg, JSON.stringify(dg));
	} catch {}
}
y("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return dg.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = M.get(e);
			return cg.canRecover() && t?.status === "RECOVERY_REQUIRED" && M.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = cg.requireRecoveryPermission(), n = M.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!M.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				M.recover(e), fg({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw fg({
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
	snapshot: () => dg,
	restore: (e) => {
		dg.splice(0, dg.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var pg = !1;
function mg() {
	if (pg || (pg = !0, k.wasRestoredOnLoad())) return;
	let e = W.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) Fs.postInvoice(t), t.status === "VOID" && Fs.reverseInvoice(t);
	let t = Ds.getAll();
	for (let e of t) Fs.postPayment(e), e.status === "REVERSED" && Fs.reversePayment(e);
	let n = H.getAll();
	for (let e of n) e.status !== "DRAFT" && (Fs.postCreditNote(e), e.status === "VOID" && Fs.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function hg() {
	let e = ag().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/sales/data/salesManualReviewService.ts
var gg = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function _g(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = de("business.command", {
			repository: "salesRecovery",
			method: "recordSalesManualReview",
			args: [e]
		});
		return pe(t.view), t.result;
	}
	if (!e.businessRecordChecked || !e.originalGlChecked || !e.reversalGlChecked || !e.balancesChecked) throw Error("Business, original/reversal GL and balances must all be inspected.");
	let t = j.list().find((t) => t.operationId === e.operationId);
	if (!t || !gg.has(t.kind)) throw Error("Sales operation not found.");
	if (t.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return j.recordManualReview(e.operationId, e.reference, e.operator, e.summary);
}
//#endregion
//#region src/features/sales/data/salesConsistencyAudit.ts
var vg = (e) => Math.round(e * 100);
function yg(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + vg(t.amount), 0), s = a.reduce((e, t) => e + vg(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (vg(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), vg(t.amountDue) !== Math.max(0, vg(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > vg(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + vg(t.amount), 0);
		vg(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || vg(t.amountAvailable) !== 0 : vg(t.amountAvailable) !== vg(t.totals.total) - a - vg(t.amountRefunded ?? 0)) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
var bg = {
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
function xg(e) {
	return yg(e).map((e) => ({
		...e,
		action: bg[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var Sg = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Cg(e, t) {
	let n = xg(e).map((e) => ({ ...e })), r = t.filter((e) => Sg.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => Sg.has(e.kind))) s.has(e.operationId) && n.push({
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
function wg() {
	let e = W.getAll();
	return Cg({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Ds.getAll(),
		creditNotes: H.getAll(),
		allocations: H.getAllAllocations(),
		journals: A.getAll()
	}, j.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
var Tg = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Eg(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!Tg.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = Cg(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function Dg() {
	let e = W.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: Ds.getAll(),
		creditNotes: H.getAll(),
		allocations: H.getAllAllocations(),
		journals: A.getAll()
	};
}
function Og(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = de("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [e]
		});
		return pe(t.view), t.result;
	}
	let t = j.list(), n = Eg(Dg(), t, e.operationId);
	if (n.length) throw Error(`Sales recovery remains blocked: ${n.join(" ")}`);
	let r = t.find((t) => t.operationId === e.operationId);
	return {
		closed: j.closeReviewed(e.operationId, r.resultId, e.approvalReference, e.approver),
		remaining: wg()
	};
}
//#endregion
//#region electron/security/businessEngine.ts
y("salesRecovery", {
	repository: {
		recordSalesManualReview: _g,
		closeVerifiedSalesReview: Og
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
var kg = C();
function Ag(e) {
	He(og, () => e()?.userId ?? ""), T.connect(e), cg.configureTrustedSession(e), mg(), hg();
}
//#endregion
export { qe as assertPostingPeriod, Ag as initialize, kg as workspaceDefaults };
