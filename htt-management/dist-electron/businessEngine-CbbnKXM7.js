import { A as e, B as t, D as n, F as r, G as i, H as a, I as o, J as s, K as c, L as l, N as u, O as d, P as f, R as p, S as m, T as h, U as ee, V as g, W as te, X as ne, Y as re, _ as ie, a as _, c as ae, d as oe, f as v, h as y, i as se, j as b, k as ce, l as le, m as ue, n as x, o as S, p as de, q as fe, r as C, s as pe, t as me, u as he, w as ge, y as _e, z as w } from "./accountingPeriodValidation-flXKWjOS.js";
import { createHash as ve } from "node:crypto";
//#region \0rolldown/runtime.js
var ye = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports);
//#endregion
//#region node_modules/.pnpm/zod@4.6.5/node_modules/zod/v4/classic/iso.js
function be(e) {
	return te(u, e);
}
//#endregion
//#region src/features/security/trustedAuthorization.ts
var xe = null, T = {
	connect(e) {
		return xe = e, () => {
			xe === e && (xe = null);
		};
	},
	disconnect() {
		xe = null;
	},
	current() {
		return xe?.() ?? null;
	},
	require(e) {
		return b(this.current(), e);
	}
}, Se = g().trim().min(1).max(200), Ce = g().regex(/^[a-f0-9]{64}$/), we = (e) => Array.isArray(e) ? e.map(we) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).filter((t) => e[t] !== void 0).sort().map((t) => [t, we(e[t])])) : e, Te = (e) => ve("sha256").update(JSON.stringify(we(e))).digest("hex"), Ee = (e) => e === "Purchase order" || e === "Expense bill draft" ? "purchases.read" : "sales.read", De = (e) => e === "Quote" ? "sales.write" : e === "Purchase order" ? "purchases.write" : e === "Expense bill draft" ? "purchases.bill" : "sales.manage";
function Oe(e, t) {
	let [n, r] = re[e];
	return (t[n]?.[r] ?? []).filter((t) => e === "Sales order draft" ? t.kind === "ORDER" : e !== "Invoice draft" || t.kind === "INVOICE");
}
function ke(e, t, n) {
	let r = Oe(e, n).find((e) => e.id === t);
	if (!r) throw Error("Document was not found in the selected dataset.");
	return r;
}
function Ae(e, t, n) {
	let r = [];
	(t.status !== "DRAFT" || t.documentId) && r.push("Only unapproved, unposted drafts can be recycled.");
	let i = (e) => e === t.id || (Array.isArray(e) ? e.some(i) : !!e && typeof e == "object" && Object.values(e).some(i)), [a, o] = re[e];
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
function je(t, n = _e()) {
	return c.filter((n) => e(t, Ee(n))).flatMap((r) => Oe(r, n).map((i) => {
		let a = fe().findLast((e) => e.recordId === i.id), o = r === "Purchase order" || r === "Expense bill draft", s = o ? i.supplierId ?? i.payload?.supplierId : i.customerId ?? i.payload?.customerId;
		return {
			kind: r,
			party: (o ? n.suppliers?.suppliers : n.customers?.customers)?.find((e) => e.id === s)?.businessName ?? s ?? "",
			reference: i.customerReference ?? i.payload?.customerReference ?? i.payload?.supplierInvoiceNumber ?? i.supplierReference ?? "",
			recordId: i.id,
			label: i.documentNumber ?? i.purchaseOrderNumber ?? `${i.kind} · ${i.id}`,
			date: i.documentDate ?? i.orderDate ?? i.payload?.documentDate ?? "",
			status: i.status,
			total: i.totals.total,
			token: Te({
				record: i,
				lifecycle: a?.id ?? ""
			}),
			deleted: a?.action === "Trashed",
			last: a,
			canWrite: e(t, De(r)),
			issues: Ae(r, i, n)
		};
	}));
}
var Me = w({
	operationId: Se,
	action: f(["Trashed", "Recovered"]),
	reason: g().trim().min(3).max(2e3),
	records: r(w({
		kind: f(c),
		recordId: Se,
		token: Ce
	}).strict()).min(1).max(100)
}).strict(), E = w({
	id: Se,
	operationId: Se,
	fingerprint: Ce,
	kind: f(c),
	recordId: Se,
	action: f(["Trashed", "Recovered"]),
	actorId: Se,
	at: be(),
	reason: g().trim().min(3).max(2e3),
	recordToken: Ce,
	contentToken: Ce
}).strict();
y("documentRecycle", {
	repository: {
		list() {
			return je(T.require("inventory.read"));
		},
		detail(e, t) {
			return e = f(c).parse(e), T.require("inventory.read"), T.require(Ee(e)), structuredClone(ke(e, Se.parse(t), _e()));
		},
		change(e) {
			let t = Me.parse(e), n = T.require("inventory.read");
			t.records.forEach((e) => {
				T.require(Ee(e.kind)), T.require(De(e.kind));
			});
			let r = Te({
				input: t,
				actorId: n.userId
			}), a = fe().filter((e) => e.operationId === t.operationId);
			if (a.length) {
				if (a[0].fingerprint !== r) throw Error("Operation ID has different recycle data.");
				return structuredClone(a);
			}
			let o = _e(), c = /* @__PURE__ */ new Set();
			for (let e of t.records) {
				if (c.has(e.recordId)) throw Error("Select each document only once.");
				c.add(e.recordId);
				let n = ke(e.kind, e.recordId, o);
				if (Te({
					record: n,
					lifecycle: fe().findLast((t) => t.recordId === e.recordId)?.id ?? ""
				}) !== e.token) throw Error("Document changed. Refresh and review the selection again.");
				if (i(e.recordId) !== (t.action === "Recovered")) throw Error("Document recycle state changed. Refresh the selection.");
				let r = Ae(e.kind, n, o);
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
				contentToken: Te(ke(e.kind, e.recordId, o))
			}));
			return s([...fe(), ...u]), structuredClone(u);
		}
	},
	read: "inventory.read",
	commands: {
		list: "inventory.read",
		detail: "inventory.read",
		change: "inventory.read"
	},
	snapshot: () => ({ history: fe() }),
	restore: (e) => s(e.history),
	publish: () => {},
	view: (t) => ({ history: fe().filter((n) => e(t, Ee(n.kind))) }),
	validate: (e, t) => {
		let { history: n } = w({ history: r(E) }).strict().parse(e), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
		for (let e of n) {
			if (i.has(e.id)) throw Error("Duplicate recycle event.");
			i.add(e.id);
			let r = ke(e.kind, e.recordId, t);
			if ((a.get(e.recordId) ?? "Recovered") === e.action) throw Error("Invalid recycle lifecycle sequence.");
			if (!n.slice(n.indexOf(e) + 1).some((t) => t.recordId === e.recordId) && e.action === "Trashed" && (Ae(e.kind, r, t).length || Te(r) !== e.contentToken)) throw Error("Recycled document content or references changed.");
			a.set(e.recordId, e.action), o.set(e.operationId, [...o.get(e.operationId) ?? [], e]);
		}
		for (let e of o.values()) {
			let t = e[0], n = e.map((e) => ({
				kind: e.kind,
				recordId: e.recordId,
				token: e.recordToken
			}));
			if (new Set(n.map((e) => e.recordId)).size !== n.length || e.some((e) => e.fingerprint !== t.fingerprint || e.action !== t.action || e.actorId !== t.actorId || e.at !== t.at || e.reason !== t.reason) || Te({
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
var Ne = [
	"Flooring Retailer",
	"Builder",
	"Developer",
	"Designer",
	"Architect",
	"Installer",
	"Other"
], Pe = [
	"ACTIVE",
	"ON_HOLD",
	"INACTIVE"
], Fe = g().trim().refine((e) => e === "" || g().email().safeParse(e).success, { message: "Enter a valid email address" }), Ie = g().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), Le = w({
	businessName: g().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: g().trim().max(120, "Trading name is too long"),
	abn: Ie,
	businessType: f(Ne),
	status: f(Pe),
	email: Fe,
	phone: g().trim().max(40, "Phone number is too long"),
	website: g().trim().max(200, "Website is too long"),
	creditLimit: p({ message: "Credit limit is required" }).min(0, "Credit limit cannot be negative"),
	paymentTermsDays: p({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days")
}), Re = w({
	name: g().trim().min(1, "Location name is required").max(100, "Location name is too long"),
	addressLine1: g().trim().min(1, "Address is required").max(160, "Address is too long"),
	addressLine2: g().trim().max(160, "Address is too long"),
	suburb: g().trim().min(1, "Suburb is required").max(100, "Suburb is too long"),
	state: g().trim().min(1, "State is required").max(50, "State is too long"),
	postcode: g().trim().min(1, "Postcode is required").max(20, "Postcode is too long"),
	country: g().trim().min(1, "Country is required").max(100, "Country is too long"),
	phone: g().trim().max(40, "Phone number is too long"),
	isPrimary: o()
}), ze = w({
	isAccounting: o().optional(),
	firstName: g().trim().min(1, "First name is required").max(80, "First name is too long"),
	lastName: g().trim().min(1, "Last name is required").max(80, "Last name is too long"),
	jobTitle: g().trim().max(100, "Job title is too long"),
	email: g().trim().min(1, "Email is required").email("Enter a valid email address"),
	phone: g().trim().max(40, "Phone number is too long"),
	mobile: g().trim().max(40, "Mobile number is too long"),
	locationId: g(),
	isPrimary: o()
});
//#endregion
//#region src/lib/persistence/mockRepositoryStorage.ts
function Be() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function Ve(e, t) {
	let n = Be();
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
function He(e, t) {
	let n = Be();
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
function Ue(e) {
	let t = Be();
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
//#region src/features/contacts/data/mockCustomers.ts
var We = [
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
], Ge = "htt.mock.contacts.customers.v1";
function Ke(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var qe = Ve(Ge, Ke), Je = qe.status !== "invalid" && Ue(Ge), Ye = /* @__PURE__ */ new Set(), Xe = qe.status === "ok" ? qe.data : structuredClone(We);
function Ze() {
	Je && He(Ge, Xe), Ye.forEach((e) => {
		e();
	});
}
function Qe(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function $e() {
	let e = Xe.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function et(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function tt(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function nt(e, t) {
	let n = !1;
	if (Xe = Xe.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	Ze();
}
var D = {
	subscribe(e) {
		return Ye.add(e), () => {
			Ye.delete(e);
		};
	},
	getSnapshot() {
		return Xe;
	},
	getAll() {
		return Xe;
	},
	getById(e) {
		return Xe.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: Qe("cus"),
			code: $e(),
			businessName: e.businessName.trim(),
			tradingName: et(e.tradingName),
			abn: tt(e.abn),
			businessType: e.businessType,
			status: e.status,
			email: et(e.email),
			phone: et(e.phone),
			website: et(e.website),
			creditLimit: e.creditLimit,
			currentBalance: 0,
			overdueBalance: 0,
			paymentTermsDays: e.paymentTermsDays,
			locations: [],
			contacts: [],
			createdAt: t,
			updatedAt: t
		};
		return Xe = [n, ...Xe], Ze(), n;
	},
	update(e, t) {
		let n;
		if (nt(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: et(t.tradingName),
			abn: tt(t.abn),
			businessType: t.businessType,
			status: t.status,
			email: et(t.email),
			phone: et(t.phone),
			website: et(t.website),
			creditLimit: t.creditLimit,
			paymentTermsDays: t.paymentTermsDays,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, n)), !n) throw Error(`Customer ${e} was not found`);
		return n;
	},
	addLocation(e, t) {
		let n = D.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: Qe("loc"),
			name: t.name.trim(),
			addressLine1: t.addressLine1.trim(),
			addressLine2: et(t.addressLine2),
			suburb: t.suburb.trim(),
			state: t.state.trim(),
			postcode: t.postcode.trim(),
			country: t.country.trim(),
			phone: et(t.phone),
			isPrimary: r
		};
		return nt(e, (e) => ({
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
		let r = D.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		let i = r.locations.find((e) => e.id === t);
		if (!i) throw Error(`Location ${t} was not found`);
		let a = n.isPrimary || r.locations.length === 1, o = {
			...i,
			name: n.name.trim(),
			addressLine1: n.addressLine1.trim(),
			addressLine2: et(n.addressLine2),
			suburb: n.suburb.trim(),
			state: n.state.trim(),
			postcode: n.postcode.trim(),
			country: n.country.trim(),
			phone: et(n.phone),
			isPrimary: a
		};
		return nt(e, (e) => ({
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
		t = ze.parse(t);
		let n = D.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: Qe("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: et(t.jobTitle),
			email: t.email.trim(),
			phone: et(t.phone),
			mobile: et(t.mobile),
			locationId: et(t.locationId),
			isPrimary: r,
			isAccounting: t.isAccounting ?? !1
		};
		return nt(e, (e) => ({
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
		n = ze.parse(n);
		let r = D.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		if (n.locationId && !r.locations.some((e) => e.id === n.locationId)) throw Error("The selected location does not belong to this customer");
		let i = r.contacts.find((e) => e.id === t);
		if (!i) throw Error(`Contact ${t} was not found`);
		let a = n.isPrimary || r.contacts.length === 1, o = {
			...i,
			firstName: n.firstName.trim(),
			lastName: n.lastName.trim(),
			jobTitle: et(n.jobTitle),
			email: n.email.trim(),
			phone: et(n.phone),
			mobile: et(n.mobile),
			locationId: et(n.locationId),
			isPrimary: a,
			isAccounting: n.isAccounting ?? !1
		};
		return nt(e, (e) => ({
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
	repository: D,
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
	snapshot: () => ({ customers: Xe }),
	restore: (e) => {
		Xe = e.customers;
	},
	publish: () => Ye.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var rt = [
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
], it = "htt.mock.contacts.suppliers.v1";
function at(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var ot = Ve(it, at), st = ot.status !== "invalid" && Ue(it), ct = /* @__PURE__ */ new Set(), lt = ot.status === "ok" ? ot.data : structuredClone(rt);
function ut() {
	st && He(it, lt), ct.forEach((e) => {
		e();
	});
}
function dt(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function ft() {
	let e = lt.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function pt(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function mt(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function ht(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: pt(e.tradingName),
		abn: mt(e.abn),
		status: e.status,
		email: pt(e.email),
		phone: pt(e.phone),
		website: pt(e.website),
		contactName: pt(e.contactName),
		addressLine1: pt(e.addressLine1),
		addressLine2: pt(e.addressLine2),
		suburb: pt(e.suburb),
		state: pt(e.state),
		postcode: pt(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: pt(e.notes)
	};
}
var gt = {
	subscribe(e) {
		return ct.add(e), () => {
			ct.delete(e);
		};
	},
	getSnapshot() {
		return lt;
	},
	getAll() {
		return lt;
	},
	getById(e) {
		return lt.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: dt("sup"),
			code: ft(),
			...ht(e),
			currency: _().currency,
			createdAt: t,
			updatedAt: t
		};
		return lt = [n, ...lt], ut(), n;
	},
	update(e, t) {
		let n = gt.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...ht(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return lt = lt.map((t) => t.id === e ? r : t), ut(), r;
	}
};
y("suppliers", {
	repository: gt,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: lt }),
	restore: (e) => {
		lt = e.suppliers;
	},
	publish: () => ct.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/schemas/supplierSchemas.ts
var _t = ["ACTIVE", "INACTIVE"], vt = g().trim().refine((e) => e === "" || g().email().safeParse(e).success, { message: "Enter a valid email address" }), yt = g().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), bt = w({
	businessName: g().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: g().trim().max(120, "Trading name is too long"),
	abn: yt,
	status: f(_t),
	email: vt,
	phone: g().trim().max(40, "Phone number is too long"),
	website: g().trim().max(200, "Website is too long"),
	contactName: g().trim().max(120, "Contact name is too long"),
	addressLine1: g().trim().max(160, "Address is too long"),
	addressLine2: g().trim().max(160, "Address is too long"),
	suburb: g().trim().max(100, "Suburb is too long"),
	state: g().trim().max(50, "State is too long"),
	postcode: g().trim().max(20, "Postcode is too long"),
	country: g().trim().min(1, "Country is required").max(100, "Country is too long"),
	paymentTermsDays: p({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days"),
	taxRegistered: o(),
	notes: g().trim().max(2e3, "Notes are too long")
});
//#endregion
//#region src/features/inventory/data/itemTypes.ts
function xt(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function St(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function Ct(e, t) {
	if (e.itemType !== void 0 && ![
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	].includes(String(e.itemType))) throw Error("Invalid saved sales item type.");
	if (t && (e.itemType ?? "STOCK") !== (t.itemType ?? "STOCK")) throw Error("Saved sales item type does not match its referenced product.");
}
//#endregion
//#region node_modules/.pnpm/react@19.3.0/node_modules/react/cjs/react.production.js
var wt = /* @__PURE__ */ ye(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.for("react.view_transition"), m = Symbol.iterator;
	function h(e) {
		return typeof e != "object" || !e ? null : (e = m && e[m] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var ee = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, g = Object.assign, te = {};
	function ne(e, t, n) {
		this.props = e, this.context = t, this.refs = te, this.updater = n || ee;
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
		this.props = e, this.context = t, this.refs = te, this.updater = n || ee;
	}
	var _ = ie.prototype = new re();
	_.constructor = ie, g(_, ne.prototype), _.isPureReactComponent = !0;
	var ae = Array.isArray;
	function oe() {}
	var v = {
		H: null,
		A: null,
		T: null,
		S: null
	}, y = Object.prototype.hasOwnProperty;
	function se(e, n, r) {
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
		return se(e.type, t, e.props);
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
	function x(e, t) {
		return typeof e == "object" && e && e.key != null ? le("" + e.key) : t.toString(36);
	}
	function S(e) {
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
	function de(e, r, i, a, o) {
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
				case d: return c = e._init, de(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + x(e, 0) : a, ae(o) ? (i = "", c != null && (i = c.replace(ue, "$&/") + "/"), de(o, r, i, "", function(e) {
			return e;
		})) : o != null && (ce(o) && (o = b(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(ue, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (ae(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + x(a, u), c += de(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + x(a, u++), c += de(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return de(S(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function fe(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return de(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function C(e) {
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
	var pe = typeof reportError == "function" ? reportError : function(e) {
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
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(oe, pe);
		} catch (e) {
			pe(e);
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
		var r = g({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !y.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return se(e.type, i, r);
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
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) y.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return se(e, a, i);
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
			_init: C
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
})), Tt = /* @__PURE__ */ ye(((e, t) => {
	process.env.NODE_ENV !== "production" && (function() {
		function n(e, t) {
			Object.defineProperty(a.prototype, e, { get: function() {
				console.warn("%s(...) is deprecated in plain JavaScript React classes. %s", t[0], t[1]);
			} });
		}
		function r(e) {
			return typeof e != "object" || !e ? null : (e = Te && e[Te] || e["@@iterator"], typeof e == "function" ? e : null);
		}
		function i(e, t) {
			e = (e = e.constructor) && (e.displayName || e.name) || "ReactClass";
			var n = e + "." + t;
			Ee[n] || (console.error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", t, e), Ee[n] = !0);
		}
		function a(e, t, n) {
			this.props = e, this.context = t, this.refs = ke, this.updater = n || De;
		}
		function o() {}
		function s(e, t, n) {
			this.props = e, this.context = t, this.refs = ke, this.updater = n || De;
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
			if (typeof e == "function") return e.$$typeof === Me ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case he: return "Fragment";
				case _e: return "Profiler";
				case ge: return "StrictMode";
				case be: return "Suspense";
				case xe: return "SuspenseList";
				case Ce: return "Activity";
				case we: return "ViewTransition";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case me: return "Portal";
				case ve: return e.displayName || "Context";
				case w: return (e._context.displayName || "Context") + ".Consumer";
				case ye:
					var t = e.render;
					return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case T: return t = e.displayName || null, t === null ? d(e.type) || "Memo" : t;
				case Se:
					t = e._payload, e = e._init;
					try {
						return d(e(t));
					} catch {}
			}
			return null;
		}
		function f(e) {
			if (e === he) return "<>";
			if (typeof e == "object" && e && e.$$typeof === Se) return "<...>";
			try {
				var t = d(e);
				return t ? "<" + t + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function p() {
			var e = E.A;
			return e === null ? null : e.getOwner();
		}
		function m() {
			return Error("react-stack-top-frame");
		}
		function h(e) {
			if (Ne.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function ee(e, t) {
			function n() {
				Fe || (Fe = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function g() {
			var e = d(this.type);
			return Le[e] || (Le[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function te(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: pe,
				type: e,
				key: t,
				props: n,
				_owner: r
			}, (o === void 0 ? null : o) === null ? Object.defineProperty(e, "ref", {
				enumerable: !1,
				value: null
			}) : Object.defineProperty(e, "ref", {
				enumerable: !1,
				get: g
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
			ie(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === Se && (e._payload.status === "fulfilled" ? ie(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function ie(e) {
			return typeof e == "object" && !!e && e.$$typeof === pe;
		}
		function _(e) {
			var t = {
				"=": "=0",
				":": "=2"
			};
			return "$" + e.replace(/[=:]/g, function(e) {
				return t[e];
			});
		}
		function ae(e, t) {
			return typeof e == "object" && e && e.key != null ? (u(e.key), _("" + e.key)) : t.toString(36);
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
					case pe:
					case me:
						s = !0;
						break;
					case Se: return s = e._init, v(s(e._payload), t, n, i, a);
				}
			}
			if (s) {
				s = e, a = a(s);
				var c = i === "" ? "." + ae(s, 0) : i;
				return je(a) ? (n = "", c != null && (n = c.replace(Ve, "$&/") + "/"), v(a, t, n, "", function(e) {
					return e;
				})) : a != null && (ie(a) && (a.key != null && (s && s.key === a.key || u(a.key)), n = ne(a, n + (a.key == null || s && s.key === a.key ? "" : ("" + a.key).replace(Ve, "$&/") + "/") + c), i !== "" && s != null && ie(s) && s.key == null && s._store && !s._store.validated && (n._store.validated = 2), a = n), t.push(a)), 1;
			}
			if (s = 0, c = i === "" ? "." : i + ":", je(e)) for (var l = 0; l < e.length; l++) i = e[l], o = c + ae(i, l), s += v(i, t, n, o, a);
			else if (l = r(e), typeof l == "function") for (l === e.entries && (Be || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Be = !0), e = l.call(e), l = 0; !(i = e.next()).done;) i = i.value, o = c + ae(i, l++), s += v(i, t, n, o, a);
			else if (o === "object") {
				if (typeof e.then == "function") return v(oe(e), t, n, i, a);
				throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
			}
			return s;
		}
		function y(e, t, n) {
			if (e == null) return e;
			var r = [], i = 0;
			return v(e, r, "", "", function(e) {
				return t.call(n, e, i++);
			}), r;
		}
		function se(e) {
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
			var e = E.H;
			return e === null && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."), e;
		}
		function ce() {
			E.asyncTransitions--;
		}
		function le(e) {
			var t = E.T, n = {};
			n.types = t === null ? null : t.types, n._updatedFibers = /* @__PURE__ */ new Set(), E.T = n;
			try {
				var r = e(), i = E.S;
				i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && (E.asyncTransitions++, r.then(ce, ce), r.then(c, He));
			} catch (e) {
				He(e);
			} finally {
				t === null && n._updatedFibers && (e = n._updatedFibers.size, n._updatedFibers.clear(), 10 < e && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), t !== null && n.types !== null && (t.types !== null && t.types !== n.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), t.types = n.types), E.T = t;
			}
		}
		function ue(e) {
			var t = E.T;
			if (t !== null) {
				var n = t.types;
				n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
			} else E.asyncTransitions === 0 && console.error("addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition."), le(ue.bind(null, e));
		}
		function x(e) {
			if (We === null) try {
				var n = ("require" + Math.random()).slice(0, 7);
				We = (t && t[n]).call(t, "timers").setImmediate;
			} catch {
				We = function(e) {
					!1 === Ue && (Ue = !0, typeof MessageChannel > "u" && console.error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
					var t = new MessageChannel();
					t.port1.onmessage = e, t.port2.postMessage(void 0);
				};
			}
			return We(e);
		}
		function S(e) {
			return 1 < e.length && typeof AggregateError == "function" ? AggregateError(e) : e[0];
		}
		function de(e, t) {
			t !== Ge - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), Ge = t;
		}
		function fe(e, t, n) {
			var r = E.actQueue;
			if (r !== null) {
				if (r.length !== 0) try {
					C(r), x(function() {
						return fe(e, t, n);
					});
					return;
				} catch (e) {
					E.thrownErrors.push(e);
				}
				else E.actQueue = null;
			}
			0 < E.thrownErrors.length ? (r = S(E.thrownErrors), E.thrownErrors.length = 0, n(r)) : t(e);
		}
		function C(e) {
			if (!qe) {
				qe = !0;
				var t = 0;
				try {
					for (; t < e.length; t++) {
						var n = e[t];
						do {
							E.didUsePromise = !1;
							var r = n(!1);
							if (r !== null) {
								if (E.didUsePromise) {
									e[t] = n, e.splice(0, t);
									return;
								}
								n = r;
							} else break;
						} while (1);
					}
					e.length = 0;
				} catch (n) {
					e.splice(0, t + 1), E.thrownErrors.push(n);
				} finally {
					qe = !1;
				}
			}
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var pe = Symbol.for("react.transitional.element"), me = Symbol.for("react.portal"), he = Symbol.for("react.fragment"), ge = Symbol.for("react.strict_mode"), _e = Symbol.for("react.profiler"), w = Symbol.for("react.consumer"), ve = Symbol.for("react.context"), ye = Symbol.for("react.forward_ref"), be = Symbol.for("react.suspense"), xe = Symbol.for("react.suspense_list"), T = Symbol.for("react.memo"), Se = Symbol.for("react.lazy"), Ce = Symbol.for("react.activity"), we = Symbol.for("react.view_transition"), Te = Symbol.iterator, Ee = {}, De = {
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
		}, Oe = Object.assign, ke = {};
		Object.freeze(ke), a.prototype.isReactComponent = {}, a.prototype.setState = function(e, t) {
			if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
			this.updater.enqueueSetState(this, e, t, "setState");
		}, a.prototype.forceUpdate = function(e) {
			this.updater.enqueueForceUpdate(this, e, "forceUpdate");
		};
		var Ae = {
			isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
			replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
		};
		for (Ye in Ae) Ae.hasOwnProperty(Ye) && n(Ye, Ae[Ye]);
		o.prototype = a.prototype, Ae = s.prototype = new o(), Ae.constructor = s, Oe(Ae, a.prototype), Ae.isPureReactComponent = !0;
		var je = Array.isArray, Me = Symbol.for("react.client.reference"), E = {
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
		}, Ne = Object.prototype.hasOwnProperty, Pe = console.createTask ? console.createTask : function() {
			return null;
		};
		Ae = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var Fe, Ie, Le = {}, Re = Ae.react_stack_bottom_frame.bind(Ae, m)(), ze = Pe(f(m)), Be = !1, Ve = /\/+/g, He = typeof reportError == "function" ? reportError : function(e) {
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
		}, Ue = !1, We = null, Ge = 0, Ke = !1, qe = !1, Je = typeof queueMicrotask == "function" ? function(e) {
			queueMicrotask(function() {
				return queueMicrotask(e);
			});
		} : x;
		Ae = Object.freeze({
			__proto__: null,
			c: function(e) {
				return b().useMemoCache(e);
			}
		});
		var Ye = {
			map: y,
			forEach: function(e, t, n) {
				y(e, function() {
					t.apply(this, arguments);
				}, n);
			},
			count: function(e) {
				var t = 0;
				return y(e, function() {
					t++;
				}), t;
			},
			toArray: function(e) {
				return y(e, function(e) {
					return e;
				}) || [];
			},
			only: function(e) {
				if (!ie(e)) throw Error("React.Children.only expected to receive a single React element child.");
				return e;
			}
		};
		e.Activity = Ce, e.Children = Ye, e.Component = a, e.Fragment = he, e.Profiler = _e, e.PureComponent = s, e.StrictMode = ge, e.Suspense = be, e.ViewTransition = we, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = E, e.__COMPILER_RUNTIME = Ae, e.act = function(e) {
			var t = E.actQueue, n = Ge;
			Ge++;
			var r = E.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				E.thrownErrors.push(e);
			}
			if (0 < E.thrownErrors.length) throw de(t, n), e = S(E.thrownErrors), E.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return Je(function() {
					i || Ke || (Ke = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				}), { then: function(e, a) {
					i = !0, o.then(function(i) {
						if (de(t, n), n === 0) {
							try {
								C(r), x(function() {
									return fe(i, e, a);
								});
							} catch (e) {
								E.thrownErrors.push(e);
							}
							if (0 < E.thrownErrors.length) {
								var o = S(E.thrownErrors);
								E.thrownErrors.length = 0, a(o);
							}
						} else e(i);
					}, function(e) {
						de(t, n), 0 < E.thrownErrors.length ? (e = S(E.thrownErrors), E.thrownErrors.length = 0, a(e)) : a(e);
					});
				} };
			}
			var s = a;
			if (de(t, n), n === 0 && (C(r), r.length !== 0 && Je(function() {
				i || Ke || (Ke = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), E.actQueue = null), 0 < E.thrownErrors.length) throw e = S(E.thrownErrors), E.thrownErrors.length = 0, e;
			return { then: function(e, t) {
				i = !0, n === 0 ? (E.actQueue = r, x(function() {
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
			var e = E.getCurrentStack;
			return e === null ? null : e();
		}, e.cloneElement = function(e, t, n) {
			if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
			var r = Oe({}, e.props), i = e.key, a = e._owner;
			if (t != null) {
				var o;
				a: {
					if (Ne.call(t, "ref") && (o = Object.getOwnPropertyDescriptor(t, "ref").get) && o.isReactWarning) {
						o = !1;
						break a;
					}
					o = t.ref !== void 0;
				}
				for (s in o && (a = p()), h(t) && (u(t.key), i = "" + t.key), t) !Ne.call(t, s) || s === "key" || s === "__self" || s === "__source" || s === "ref" && t.ref === void 0 || (r[s] = t[s]);
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
				$$typeof: ve,
				_currentValue: e,
				_currentValue2: e,
				_threadCount: 0,
				Provider: null,
				Consumer: null
			}, e.Provider = e, e.Consumer = {
				$$typeof: w,
				_context: e
			}, e._currentRenderer = null, e._currentRenderer2 = null, e;
		}, e.createElement = function(e, t, n) {
			for (var r = 2; r < arguments.length; r++) re(arguments[r]);
			var i;
			r = {};
			var a = null;
			if (t != null) for (i in Ie || !("__self" in t) || "key" in t || (Ie = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), h(t) && (u(t.key), a = "" + t.key), t) Ne.call(t, i) && i !== "key" && i !== "__self" && i !== "__source" && (r[i] = t[i]);
			var o = arguments.length - 2;
			if (o === 1) r.children = n;
			else if (1 < o) {
				for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
				Object.freeze && Object.freeze(s), r.children = s;
			}
			if (e && e.defaultProps) for (i in o = e.defaultProps, o) r[i] === void 0 && (r[i] = o[i]);
			return a && ee(r, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), (i = 1e4 > E.recentlyCreatedOwnerStacks++) ? (s = Error.stackTraceLimit, Error.stackTraceLimit = 10, o = Error("react-stack-top-frame"), Error.stackTraceLimit = s) : o = Re, te(e, a, r, p(), o, i ? Pe(f(e)) : ze);
		}, e.createRef = function() {
			var e = { current: null };
			return Object.seal(e), e;
		}, e.forwardRef = function(e) {
			e != null && e.$$typeof === T ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e == "function" ? e.length !== 0 && e.length !== 2 && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.") : console.error("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e), e != null && e.defaultProps != null && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
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
				$$typeof: Se,
				_payload: e,
				_init: se
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
				$$typeof: T,
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
			return e.$$typeof === w && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"), t.useContext(e);
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
(/* @__PURE__ */ ye(((e, t) => {
	t.exports = process.env.NODE_ENV === "production" ? wt() : Tt();
})))();
var Et = [
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
function O(e) {
	return Et.find((t) => t.id === e);
}
function Dt(e, t) {
	return O(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var Ot = /* @__PURE__ */ new Set(), kt = "2026-01-01T00:00:00.000Z", At = Et.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: kt,
	updatedAt: kt
}));
function jt() {
	Ot.forEach((e) => e());
}
var Mt = {
	ensureProductPolicy(e, t, n) {
		let r = At.find((t) => t.productId === e), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			productId: e,
			baseUnitId: t,
			active: n ? r?.active ?? !0 : !1,
			costingMethod: "MOVING_WEIGHTED_AVERAGE",
			createdAt: r?.createdAt ?? i,
			updatedAt: i
		};
		return At = [...At.filter((t) => t.productId !== e), a], jt(), a;
	},
	subscribe(e) {
		return Ot.add(e), () => {
			Ot.delete(e);
		};
	},
	getSnapshot() {
		return At;
	},
	getAll() {
		return At;
	},
	getByProductId(e) {
		return At.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = Mt.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		if (t && !xt(O(e) ?? { itemType: "SERVICE" })) throw Error("Inventory costing cannot be enabled for non-stock/service items.");
		let n = {
			...Mt.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return At = At.map((t) => t.productId === e ? n : t), jt(), n;
	}
};
y("costingPolicies", {
	repository: Mt,
	read: "inventory.cost.read",
	commands: {
		ensureProductPolicy: null,
		setActive: "accounting.post"
	},
	snapshot: () => ({ policies: At }),
	restore: (e) => {
		At = e.policies;
	},
	publish: () => Ot.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/productRepository.ts
var Nt = w({
	id: g().min(1),
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
	name: g().trim().min(1),
	symbol: g().min(1),
	conversionToBase: p().finite().positive(),
	basePrice: p().finite().nonnegative(),
	isBaseUnit: o(),
	active: o()
}).strict(), Pt = w({
	id: g().min(1),
	sku: g().trim().min(1).max(80),
	name: g().trim().min(1).max(180),
	category: f([
		"Timber",
		"Hybrid",
		"Laminate",
		"Vinyl",
		"Carpet",
		"Accessories",
		"Other"
	]),
	brand: g().optional(),
	collection: g().optional(),
	description: g().optional(),
	status: f(["ACTIVE", "INACTIVE"]),
	baseUnitId: g().min(1),
	units: r(Nt).min(1),
	createdAt: g(),
	updatedAt: g(),
	revision: p().int().nonnegative().optional(),
	itemType: f([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	buyEnabled: o().optional(),
	sellEnabled: o().optional(),
	reorderPoint: p().finite().nonnegative().optional(),
	targetStock: p().finite().nonnegative().optional(),
	wholePacks: o().optional(),
	taxCode: g().min(1).optional()
}).strict(), Ft = /* @__PURE__ */ new Set(), It = [...Et];
function Lt() {
	It = [...Et], Ft.forEach((e) => e());
}
function Rt(e, t, n) {
	if (Array.isArray(e)) return e.some((e) => Rt(e, t, n));
	if (!e || typeof e != "object") return !1;
	let r = e;
	return r.productId === t && (!n || r.unitId === n) || Object.values(r).some((e) => Rt(e, t, n));
}
function zt(e) {
	let t = r(Pt).parse(e), n = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.id) || i.has(e.sku.toLowerCase())) throw Error("Duplicate product ID or SKU.");
		if (n.add(e.id), i.add(e.sku.toLowerCase()), !xt(e) && e.buyEnabled !== !1) throw Error("Non-stock/service catalogue items must use expense bills for purchasing.");
		if (!xt(e) && ((e.reorderPoint ?? 0) !== 0 || (e.targetStock ?? 0) !== 0)) throw Error("Non-stock/service items cannot have stock reorder thresholds.");
		if (xt(e) && e.units.some((e) => e.code === "HOUR" || e.code === "JOB")) throw Error("Hour/job units require non-stock or service items.");
		if (new Set(e.units.map((e) => e.id)).size !== e.units.length || e.units.filter((e) => e.isBaseUnit).length !== 1 || !e.units.some((t) => t.id === e.baseUnitId && t.isBaseUnit && t.conversionToBase === 1)) throw Error("A product needs exactly one valid base unit.");
		if ((e.targetStock ?? 0) < (e.reorderPoint ?? 0)) throw Error("Target stock must be at least the reorder point.");
	}
	return t;
}
var Bt = {
	subscribe(e) {
		return Ft.add(e), () => {
			Ft.delete(e);
		};
	},
	getSnapshot: () => It,
	getAll: () => Et,
	getById: (e) => Et.find((t) => t.id === e),
	save(e, t) {
		let n = Pt.parse(e), r = Et.find((e) => e.id === n.id);
		if (r && t !== (r.revision ?? 0)) throw Error("Product changed since it was opened. Reload before saving.");
		if (!r && t !== void 0) throw Error("Product no longer exists.");
		if (se(n.taxCode ?? "GST"), !xt(n) && n.buyEnabled !== !1) throw Error("Non-stock and service catalogue items are sales-only. Use expense/service bills for supplier costs.");
		let i = _e();
		if (delete i.products, r) {
			let e = { ...i };
			if (delete e.costingPolicies, (r.itemType ?? "STOCK") !== (n.itemType ?? "STOCK") && Rt(e, n.id)) throw Error("A referenced product cannot change item type. Create a new catalogue item.");
			if (r.baseUnitId !== n.baseUnitId && Rt(i, n.id)) throw Error("A referenced product cannot change base unit.");
			for (let e of r.units) {
				let t = n.units.find((t) => t.id === e.id);
				if ((!t || t.conversionToBase !== e.conversionToBase || t.code !== e.code) && Rt(i, n.id, e.id)) throw Error("A referenced unit conversion cannot be changed or removed. Add a new unit instead.");
			}
		}
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...n,
			createdAt: r?.createdAt ?? a,
			updatedAt: a,
			revision: (r?.revision ?? 0) + 1
		};
		return zt([...Et.filter((e) => e.id !== n.id), o]), r ? Et.splice(Et.indexOf(r), 1, o) : Et.push(o), Mt.ensureProductPolicy(o.id, o.baseUnitId, xt(o)), r && xt(r) !== xt(o) && Mt.setActive(o.id, xt(o)), Lt(), o;
	}
};
y("products", {
	validate: (e, t) => {
		let n = zt(e.products), r = t.workspace_tax_codes.records, i = t.costingPolicies.policies, a = t.stock.balances;
		for (let e of n.filter((e) => !xt(e))) if (i.some((t) => t.productId === e.id && t.active) || a.some((t) => t.productId === e.id && t.quantityOnHand !== 0)) throw Error("Non-stock/service product has inventory activity or active costing.");
		if (n.some((e) => !r.some((t) => t.code === (e.taxCode ?? "GST")))) throw Error("Backup product tax-code reference is invalid.");
	},
	repository: Bt,
	read: "inventory.read",
	commands: { save: "inventory.adjust" },
	snapshot: () => ({ products: structuredClone(Et) }),
	restore: (e) => {
		let t = zt(e.products);
		Et.splice(0, Et.length, ...t), It = [...Et];
	},
	publish: Lt
});
//#endregion
//#region src/features/contact-review/reviewModel.ts
var Vt = [
	"Customer",
	"Branch",
	"Contact"
], Ht = [
	"Manual",
	"Sales draft",
	"Selected contact",
	"Card transcription"
], Ut = {
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
}, Wt = t(g(), a([
	g().max(2e3),
	p().finite(),
	o()
]));
function Gt(e, t) {
	let n = Wt.parse(t), r = Ut[e];
	if (Object.keys(n).some((e) => !Object.hasOwn(r, e))) throw Error("Unsupported draft field. Use the documented fields for this draft type.");
	for (let [e, t] of Object.entries(n)) if (typeof t != typeof r[e]) throw Error(`Invalid value type for ${e}.`);
	return {
		...r,
		...n
	};
}
var Kt = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), qt = (e) => String(e ?? "").trim().toLowerCase(), Jt = (e) => String(e ?? "").replace(/\D/g, ""), Yt = (e, t, n = Kt) => !!n(e) && n(e) === n(t);
function Xt(e, t) {
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
		(Yt(r.businessName, e.businessName) || Yt(r.businessName, e.tradingName) || Yt(r.tradingName, e.businessName) || Yt(r.tradingName, e.tradingName)) && t.push("Business/trading name"), Yt(r.email, e.email, qt) && t.push("Email"), Yt(r.phone, e.phone, Jt) && t.push("Phone"), Yt(r.abn, e.abn) && t.push("Identifier"), i(e.id, e.id, e.businessName, [
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
			Yt(r.name, e.name) && t.push("Branch name"), String(r.addressLine1).trim() && Yt([
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
			].join(" ")) && t.push("Address"), Yt(r.phone, e.phone, Jt) && t.push("Phone"), i(e.id, n.id, e.name, [
				e.addressLine1,
				e.suburb,
				e.postcode
			].filter(Boolean).join(" · "), t);
		}
		else for (let e of n.contacts) {
			let t = [];
			Yt([r.firstName, r.lastName].join(" "), [e.firstName, e.lastName].join(" ")) && t.push("Contact name"), Yt(r.email, e.email, qt) && t.push("Email"), (Yt(r.phone, e.phone, Jt) || Yt(r.phone, e.mobile, Jt) || Yt(r.mobile, e.phone, Jt) || Yt(r.mobile, e.mobile, Jt)) && t.push("Phone/mobile"), i(e.id, n.id, `${e.firstName} ${e.lastName}`, [
				e.email,
				e.phone,
				e.mobile
			].filter(Boolean).join(" · "), t);
		}
	}
	return n.sort((e, t) => t.reasons.length - e.reasons.length || e.name.localeCompare(t.name) || e.id.localeCompare(t.id));
}
function Zt(e) {
	return JSON.stringify(e);
}
//#endregion
//#region src/features/page-previews/catalog.ts
var k = (e, t, n = "text", r, i) => ({
	key: e,
	label: t,
	type: n,
	options: r,
	value: i,
	required: !0
}), A = (e, t, n) => k(e, t, "select", n), Qt = (e, t, n = "0") => ({
	...k(e, t, "number", void 0, n),
	min: 0,
	step: "0.01"
}), $t = (e, t) => k(e, t, "date", void 0, "2026-10-16"), en = (e, t) => ({
	...A(e, t, [
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
	k("sku", "SKU"),
	A("kind", "Product type", [
		"Stock item",
		"Service",
		"Non-stock item"
	]),
	A("unit", "Selling unit", [
		"Pack",
		"m²",
		"Bucket",
		"Each"
	]),
	Qt("price", "Standard selling price", "49.50"),
	Qt("cost", "Buying cost (sample)", "25"),
	Qt("coverage", "m² per pack", "2.2"),
	A("rounding", "Pack rounding", ["Whole packs up", "Allow fractional packs"]),
	Qt("reorder", "Reorder point", "10"),
	Qt("target", "Target stock", "50"),
	A("buy", "Available for purchasing", ["Yes", "No"]),
	A("sell", "Available for selling", ["Yes", "No"]),
	A("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	k("brand", "Brand"),
	k("category", "Category"),
	k("image", "Image URL (preview only)")
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
	k("product", "Product / SKU"),
	k("customer", "Customer scope"),
	k("starts", "Starts (local time)", "datetime-local", void 0, "2026-10-16T09:00"),
	k("ends", "Ends (local time)", "datetime-local", void 0, "2026-10-31T17:00"),
	Qt("price", "Promotional unit price", "45"),
	A("priority", "Priority when rules overlap", [
		"Customer price first",
		"Promotion first",
		"Lowest eligible price"
	]),
	k("timezone", "Time zone", "text", void 0, "Pacific/Auckland")
], {
	name: "October flooring special",
	product: "SAMPLE-OAK",
	customer: "All trade customers"
}, [
	"Overview",
	"Price comparison",
	"History"
]), nn("tax-codes", "Tax codes", "Accounting", "/accounting/tax-codes", "accounting.read", "Review GST codes, inclusive/exclusive calculation and reporting mappings.", [
	k("code", "Tax code"),
	Qt("rate", "Tax rate (%)", "15"),
	A("basis", "Entry basis", ["Exclusive", "Inclusive"]),
	en("collected", "GST collected account"),
	en("paid", "GST paid account"),
	k("report", "Return / report mapping")
], {
	name: "Standard GST",
	code: "GST15",
	report: "Output / input GST"
}, [
	"Overview",
	"Calculation preview",
	"Reporting"
]), nn("linked-accounts", "Linked accounts", "Accounting", "/accounting/linked-accounts", "accounting.read", "Preview default general ledger mappings used by each business process.", [
	A("process", "Business process", [
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
	k("code", "Job code"),
	k("customer", "Customer"),
	k("owner", "Project owner"),
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
	k("number", "Account number (sample only)"),
	k("bank", "Bank name"),
	A("currency", "Currency", ["NZD", "AUD"]),
	en("ledger", "Linked bank GL account"),
	A("feed", "Feed provider", ["Manual import", "Provider to be configured"]),
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
	A("match", "Match mode", ["All conditions", "Any condition"]),
	A("field", "Transaction field", [
		"Description",
		"Payee",
		"Reference"
	]),
	A("operator", "Operator", [
		"Contains",
		"Equals",
		"Starts with"
	]),
	k("value", "Match text"),
	en("account", "Categorise to account"),
	A("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	A("enabled", "Enabled", ["Yes", "No"])
], {
	name: "Sample office supplies",
	value: "OFFICE",
	field: "Description"
}, [
	"Overview",
	"Test rule",
	"History"
]), nn("payment-batches", "Electronic payment batches", "Banking", "/banking/payment-batches", "banking.read", "Select sample supplier or wage payments, review approval and bank export layout.", [
	A("kind", "Batch type", ["Supplier payments", "Wages"]),
	$t("payDate", "Payment date"),
	k("bank", "Paying account"),
	k("reference", "Bank reference"),
	A("format", "Export format", ["NZ bank CSV preview", "ABA layout preview"]),
	Qt("total", "Batch total", "1100")
], {
	name: "Sample supplier batch",
	bank: "Sample operating account",
	reference: "OCT-SAMPLE"
}, [
	"Overview",
	"Payments",
	"Approval & export"
]), nn("pay-items", "Pay items", "Payroll", "/payroll/pay-items", "accounting.read", "Configure sample earnings, allowances, deductions, leave, tax and employer contributions.", [
	k("code", "Pay item code"),
	A("category", "Category", [
		"Earnings",
		"Allowance",
		"Deduction",
		"Leave",
		"Tax",
		"Employer contribution"
	]),
	A("method", "Calculation method", [
		"Hourly rate",
		"Fixed amount",
		"Percentage"
	]),
	Qt("rate", "Rate / amount", "30"),
	A("taxable", "Tax treatment", [
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
]), nn("filing", "Payroll filing", "Payroll", "/payroll/filing", "accounting.read", "Review a sample NZ Payday Filing submission and its response / correction workflow.", [
	k("payrun", "Pay run reference"),
	$t("payDate", "Pay date"),
	k("employer", "Employer IRD identifier (sample)"),
	A("type", "Submission type", ["Employment information", "Amendment"]),
	k("contact", "Payroll contact email", "email")
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
	A("kind", "Transaction type", [
		"Invoice",
		"Bill",
		"Bank transaction"
	]),
	k("contact", "Customer / supplier"),
	A("frequency", "Frequency", [
		"Weekly",
		"Fortnightly",
		"Monthly",
		"Quarterly"
	]),
	$t("next", "Next generation date"),
	$t("ends", "Schedule end date"),
	Qt("total", "Template amount", "220"),
	A("mode", "Generation mode", ["Draft for review", "Require approval"])
], {
	name: "Monthly sample maintenance",
	contact: "Sample Flooring Ltd"
}, [
	"Overview",
	"Template lines",
	"Run history"
]), nn("tasks", "Tasks & action centre", "Automation & tasks", "/tasks", "sales.read", "Maintain local tasks, owners and due dates with audited completion and reopening.", [
	k("customer", "Customer / branch"),
	k("owner", "Assigned to"),
	$t("due", "Due date"),
	A("priority", "Priority", [
		"Normal",
		"High",
		"Low"
	]),
	k("notes", "Task instructions", "textarea")
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
	k("salesperson", "Salesperson"),
	k("customer", "Customer / branch"),
	k("checkin", "Check-in", "datetime-local", void 0, "2026-10-16T09:00"),
	k("checkout", "Check-out", "datetime-local", void 0, "2026-10-16T09:30"),
	k("outcome", "Visit outcome", "textarea"),
	k("location", "Recorded location")
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
	A("kind", "Draft type", [
		"Customer",
		"Branch",
		"Contact"
	]),
	k("company", "Customer / company"),
	k("branch", "Branch"),
	k("email", "Email", "email"),
	k("phone", "Phone"),
	A("source", "Source", [
		"Sales draft",
		"Selected phone contact",
		"Business card OCR"
	]),
	A("decision", "Review decision", [
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
	A("kind", "Document type", [
		"Invoice",
		"Quotation",
		"Purchase order",
		"Customer statement",
		"Remittance"
	]),
	k("subject", "Email subject"),
	k("body", "Email body", "textarea"),
	k("footer", "PDF footer", "textarea"),
	A("logo", "Logo position", [
		"Left",
		"Centre",
		"Right"
	]),
	A("paper", "Paper size", ["A4", "Letter"])
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
	A("dataset", "Dataset", [
		"Sales",
		"Purchases",
		"Payroll",
		"Banking",
		"General ledger"
	]),
	k("columns", "Columns (comma separated)"),
	k("filter", "Filter expression (preview)"),
	A("basis", "Basis", ["Accrual", "Cash"]),
	A("favourite", "Favourite", ["Yes", "No"])
], {
	name: "Monthly sales by customer",
	columns: "Customer, Date, Net, GST, Total",
	filter: "Date: current month"
}, ["Overview", "Report preview"]), nn("report-packs", "Report packs", "Reports", "/reports/packs", "accounting.read", "Generate combined financial reports from current local books, with ordered sections and printable exports.", [
	k("company", "Company"),
	k("period", "Reporting period"),
	k("reports", "Included reports (comma separated)"),
	k("cover", "Cover heading"),
	k("introduction", "Cover note", "textarea")
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
[...new Set(tn.map((e) => e.group))], A("gst", "GST registration", ["Registered", "Not registered"]), A("filing", "GST filing cycle", [
	"Two monthly",
	"Monthly",
	"Six monthly"
]), Qt("quoteNext", "Next quote number", "1001"), Qt("orderNext", "Next order number", "1001"), Qt("invoiceNext", "Next invoice number", "1001"), Qt("creditNext", "Next credit number", "1001"), A("terms", "Default terms", [
	"20th of following month",
	"Due on receipt",
	"30 days"
]), A("template", "Default template", ["Standard invoice", "Trade invoice"]), A("reminders", "Overdue reminders", ["Manual only", "7 and 14 days overdue"]), A("onlinePayment", "Online payment option", ["Disabled", "Configuration preview"]), Qt("next", "Next PO number", "1001"), A("terms", "Default payment terms", [
	"20th of following month",
	"30 days",
	"Due on receipt"
]), en("expense", "Default expense account"), A("receipt", "Bill matching", ["Require receipt match", "Allow expense bills"]), A("remittance", "Remittance preference", ["Preview before sending", "Manual"]), A("cycle", "Pay cycle", [
	"Weekly",
	"Fortnightly",
	"Monthly"
]), A("day", "Pay day", [
	"Wednesday",
	"Thursday",
	"Friday"
]), en("wages", "Wages expense account"), en("clearing", "Payroll clearing account"), A("bank", "Paying bank", ["Sample operating account"]), A("filing", "Filing region", ["New Zealand · Payday Filing", "Australia · STP preview"]), A("basis", "Default basis", ["Accrual", "Cash"]), A("currency", "Display currency", ["NZD", "AUD"]), A("precision", "Decimal places", ["2", "0"]), A("negative", "Negative number style", ["(1,234.56)", "-1,234.56"]), A("comparative", "Comparative period", [
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
//#region src/features/data-transfer/transferModel.ts
var sn = [
	"Customers",
	"Suppliers",
	"Customer branches",
	"Customer contacts",
	"Products"
], cn = ["Create", "Update by ID"], ln = "HTT-CSV-1", un = {
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
}, dn = {
	Customers: Ut.Customer,
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
		...Ut.Branch
	},
	"Customer contacts": {
		customerId: "",
		...Ut.Contact
	},
	Products: un
}, fn = (e) => [
	"_format",
	"id",
	"recordToken",
	"externalId",
	...Object.keys(dn[e])
], pn = {
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
}, mn = w({
	dataset: f(sn),
	mode: f(cn),
	fileName: g().trim().min(1).max(200),
	text: g().max(1e6),
	mapping: t(g(), p().int().nonnegative()).optional()
}).strict();
function hn(e) {
	if (e.text.includes("\0")) throw Error("CSV source must be text without NUL characters.");
	let t = on(e.text.replace(/^\uFEFF/, ""));
	if (t.length < 2 || t.length > 501) throw Error("Choose a CSV header and 1–500 data records.");
	let n = t[0].map((e) => e.trim());
	if (n.length > 64 || n.some((e) => !e || e.length > 120) || new Set(n.map((e) => e.toLowerCase())).size !== n.length) throw Error("CSV requires 1–64 distinct, nonempty column names of at most 120 characters.");
	if (t.slice(1).some((e) => e.length !== n.length || e.some((e) => e.length > 1e5))) throw Error("Each CSV record must match the header width; cells may not exceed 100,000 characters.");
	let r = fn(e.dataset), i = e.mapping ?? Object.fromEntries(r.flatMap((e) => {
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
function gn(e) {
	return e.map((e) => e.map((e) => "\"" + (/^[=+@\-'\t\r]/.test(e) ? "'" + e : e).replaceAll("\"", "\"\"") + "\"").join(",")).join("\r\n");
}
//#endregion
//#region electron/security/transferRepository.ts
var _n = g().trim().min(1).max(200), vn = g().trim().min(1).max(2e3), yn = (e) => Array.isArray(e) ? e.map(yn) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).filter(([, e]) => e !== void 0).sort(([e], [t]) => e < t ? -1 : +(e > t)).map(([e, t]) => [e, yn(t)])) : e, bn = (e) => ve("sha256").update(JSON.stringify(yn(e))).digest("hex"), xn = [], Sn = (e, t = !1) => {
	T.require("inventory.read");
	let n = T.require(pn[e].read);
	return t && T.require(pn[e].write), n.userId;
};
function Cn(e) {
	return e === "Customers" ? D.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Suppliers" ? gt.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Products" ? Bt.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : D.getAll().flatMap((t) => (e === "Customer branches" ? t.locations : t.contacts).map((e) => ({
		id: e.id,
		parentId: t.id,
		raw: e
	})));
}
function wn(e, t) {
	let n = {};
	for (let [r, i] of Object.entries(dn[e])) n[r] = String(t.raw[r] ?? i);
	if ((e === "Customer branches" || e === "Customer contacts") && (n.customerId = t.parentId), e === "Products") {
		let e = t.raw;
		n.taxCode = e.taxCode ?? "", n.itemType = e.itemType ?? "STOCK", n.buyEnabled = String(e.buyEnabled ?? (e.itemType === void 0 || e.itemType === "STOCK")), n.baseUnitCode = e.units.find((t) => t.id === e.baseUnitId).code, n.unitsJson = JSON.stringify(e.units);
	}
	return n;
}
function Tn(e, t) {
	return {
		_format: ln,
		id: t.id,
		recordToken: bn({
			parentId: t.parentId,
			record: t.raw
		}),
		externalId: xn.filter((t) => t.dataset === e).flatMap((e) => e.results).find((e) => e.action === "Created" && e.recordId === t.id)?.externalId ?? "",
		...wn(e, t)
	};
}
function En(e, t) {
	if (!/^-?\d+(?:\.\d+)?$/.test(e) || !Number.isFinite(Number(e)) || Math.abs(Number(e)) > 2 ** 53 - 1) throw Error(`${t} must contain a safe plain number.`);
	return Number(e);
}
function Dn(e, t, n) {
	let r = n ? wn(e, n) : { ...dn[e] };
	for (let n of Object.keys(dn[e])) if (Object.hasOwn(t, n)) {
		let i = t[n].trim();
		if (typeof dn[e][n] == "number") r[n] = En(i, n);
		else if (typeof dn[e][n] == "boolean") {
			if (!["true", "false"].includes(i)) throw Error(`${n} must be true or false.`);
			r[n] = i === "true";
		} else r[n] = i.trim();
	}
	if (n) for (let [n, i] of Object.entries(dn[e])) Object.hasOwn(t, n) || (typeof i == "number" && (r[n] = Number(r[n])), typeof i == "boolean" && (r[n] = r[n] === "true"));
	return r;
}
var On = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), kn = (e, t) => e.some((e) => e.reasons.some((n) => !t.some((t) => t.id === e.id && t.reasons.includes(n))));
function An(e, t) {
	return t.map((t) => ({
		id: t.id,
		reasons: [
			...On(t.businessName) === On(e.businessName) ? ["Name"] : [],
			...e.email && t.email?.toLowerCase() === e.email.toLowerCase() ? ["Email"] : [],
			...e.abn && On(t.abn) === On(e.abn) ? ["Identifier"] : []
		]
	})).filter((e) => e.reasons.length);
}
function jn(e, t, n, i = !1) {
	let a = n.id ? Cn(e).find((e) => e.id === n.id) : void 0;
	if (t === "Update by ID") {
		if (!a) throw Error("Existing record ID was not found.");
		if (!i && (!n.recordToken || n.recordToken !== Tn(e, a).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
	} else if (n.id || n.recordToken) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
	if (t === "Update by ID" && n.externalId && n.externalId !== Tn(e, a).externalId) throw Error("External source IDs cannot be reassigned by an update. Keep the export value or leave it blank.");
	let s = t === "Update by ID" ? a : void 0, c = s ? Tn(e, s) : null, l = Dn(e, n, s), u;
	if (e === "Customers") {
		let e = Le.strict().parse(l), t = D.getAll().filter((e) => e.id !== s?.id);
		if (kn(Xt({
			kind: "Customer",
			customerId: "",
			values: e
		}, t), s ? Xt({
			kind: "Customer",
			customerId: "",
			values: s.raw
		}, t) : [])) throw Error("Possible existing customer duplicate. Use the customer review workflow or explicit ID update.");
		u = s ? D.update(s.id, e) : D.create(e);
	} else if (e === "Suppliers") {
		let e = bt.strict().parse(l), t = gt.getAll().filter((e) => e.id !== s?.id);
		if (kn(An(e, t), s ? An(s.raw, t) : [])) throw Error("Possible existing supplier duplicate. Resolve it before import.");
		u = s ? gt.update(s.id, e) : gt.create(e);
	} else if (e === "Products") {
		let e = r(w({
			id: g().max(200).optional(),
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
			name: g().trim().min(1).max(120),
			symbol: g().min(1).max(40),
			conversionToBase: p().finite().positive(),
			basePrice: p().finite().nonnegative(),
			isBaseUnit: o(),
			active: o()
		}).strict()).min(1).max(100).parse(JSON.parse(String(l.unitsJson))), t = s?.raw, i = e.map((e) => {
			let n = crypto.randomUUID();
			if (t) {
				if (e.id) {
					if (!t.units.some((t) => t.id === e.id)) throw Error("Unit ID does not belong to this product. Keep exported IDs; use an empty ID for a new unit.");
					n = e.id;
				} else if (!Object.hasOwn(e, "id")) {
					let r = t.units.filter((t) => t.code === e.code);
					if (r.length > 1) throw Error("Ambiguous unit code. Keep the unit IDs from the current export.");
					n = r[0]?.id ?? n;
				}
			}
			return {
				...e,
				id: n
			};
		}), a = i.find((e) => e.code === l.baseUnitCode && e.isBaseUnit);
		if (!a) throw Error("baseUnitCode must identify the primary product unit.");
		let { unitsJson: c, baseUnitCode: d, ...m } = l, h = (/* @__PURE__ */ new Date()).toISOString();
		if (m.taxCode === "" && delete m.taxCode, t) for (let e of [
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
		]) !Object.hasOwn(n, e) && t[e] === void 0 && delete m[e];
		let ee = Pt.parse({
			...m,
			id: s?.id ?? crypto.randomUUID(),
			baseUnitId: a.id,
			units: i,
			createdAt: t?.createdAt ?? h,
			updatedAt: h
		});
		u = Bt.save(ee, t?.revision ?? (s ? 0 : void 0));
	} else {
		let t = String(l.customerId), n = D.getById(t);
		if (!n || n.status === "INACTIVE") throw Error("Select an existing, non-inactive parent customer.");
		if (s && s.parentId !== t) throw Error("Existing branch/contact cannot move to a different customer.");
		let { customerId: r, ...i } = l, a = e === "Customer branches" ? "Branch" : "Contact", o = a === "Branch" ? Re.strict().parse(i) : ze.strict().parse(i);
		if (kn(Xt({
			kind: a,
			customerId: t,
			values: o
		}, [n]).filter((e) => e.id !== s?.id), s ? Xt({
			kind: a,
			customerId: t,
			values: s.raw
		}, [n]).filter((e) => e.id !== s.id) : [])) throw Error("Possible existing branch/contact duplicate. Use customer review or explicit ID update.");
		u = a === "Branch" ? s ? D.updateLocation(t, s.id, o) : D.addLocation(t, o) : s ? D.updateContact(t, s.id, o) : D.addContact(t, o);
	}
	let d = Cn(e).find((e) => e.id === u.id);
	return {
		recordId: u.id,
		before: c,
		after: Tn(e, d)
	};
}
function Mn(e) {
	if (Sn(e.dataset, !0), Buffer.byteLength(e.text, "utf8") > 1e6) throw Error("CSV source exceeds 1 MB of UTF-8 text.");
	let t = hn(e), n = new Map(Cn(e.dataset).map((t) => [t.id, Tn(e.dataset, t)])), r = _e(), i = bn({
		input: e,
		master: r
	}), a = /* @__PURE__ */ new Set(), o = [], s = [];
	try {
		for (let r of t.rows) {
			let t = r.values, i = (t.externalId ?? "").trim(), c = bn({
				dataset: e.dataset,
				values: Object.fromEntries(Object.keys(dn[e.dataset]).filter((e) => Object.hasOwn(t, e)).map((e) => [e, t[e]]))
			}), l = e.mode === "Create" ? i : t.id, u = "", d;
			try {
				if (!l) throw Error(e.mode === "Create" ? "externalId is required for safe create retries." : "id is required for explicit updates.");
				if (l.length > 200 || i.length > 200) throw Error("Import identity exceeds 200 characters.");
				if (a.has(l)) throw Error("Repeated identity in this CSV file.");
				if (a.add(l), e.mode === "Create" && (t.id || t.recordToken)) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
				if (e.mode === "Update by ID" && (!n.has(t.id) || t.recordToken !== n.get(t.id).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
				let s = e.mode === "Create" ? xn.filter((t) => t.dataset === e.dataset).flatMap((e) => e.results).find((e) => e.action === "Created" && e.externalId === i) : void 0;
				if (s) {
					if (s.identityFingerprint !== c) throw Error("Source externalId already contains different creation data. Use an explicit ID update.");
					let t = Cn(e.dataset).find((e) => e.id === s.recordId);
					if (!t) throw Error("Prior imported record is missing.");
					d = {
						row: r.row,
						externalId: i,
						recordId: t.id,
						action: "Skipped",
						identityFingerprint: c,
						before: null,
						after: Tn(e.dataset, t)
					};
				} else {
					let a = jn(e.dataset, e.mode, t, !0);
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
				let i = Cn(e.dataset).find((e) => e.id === n.recordId), a = Tn(e.dataset, i);
				if (t.values = Object.fromEntries(Object.keys(dn[e.dataset]).filter((e) => Object.hasOwn(a, e)).map((e) => [e, a[e]])), e.dataset === "Products") {
					let e = (r.products.products.find((e) => e.id === n.recordId)?.units ?? []).map((e) => e.id);
					t.values.unitsJson = JSON.stringify(JSON.parse(t.values.unitsJson).map((t) => ({
						...t,
						id: e.includes(t.id) ? t.id : "Assigned at commit"
					})));
				}
			}
		}
	} finally {
		ie(r);
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
var Nn = {
	review(e) {
		return Mn(mn.parse(e)).preview;
	},
	commit(e) {
		let t = mn.extend({
			operationId: _n,
			expectedPreview: g().regex(/^[a-f0-9]{64}$/),
			reason: vn
		}).strict().parse(e), n = Sn(t.dataset, !0), { operationId: r, expectedPreview: i, reason: a, ...o } = t, s = bn({
			source: o,
			reason: a
		}), c = xn.find((e) => e.operationId === r);
		if (c) {
			if (c.fingerprint !== s) throw Error("Operation ID already has different import data.");
			return structuredClone(c);
		}
		let l = Mn(o);
		if (l.preview.fingerprint !== i) throw Error("Business records or import fields changed. Validate the file again.");
		if (!l.preview.valid) throw Error("Resolve every validation error before committing the batch.");
		let u = hn(o), d = new Set(u.rows.map((e) => e.values.customerId || Cn(o.dataset).find((t) => t.id === e.values.id)?.parentId || "")), f = (e) => JSON.stringify({
			primaryLocationId: e.primaryLocationId,
			primaryContactId: e.primaryContactId,
			locations: e.locations,
			contacts: e.contacts
		}), p = ["Customer branches", "Customer contacts"].includes(o.dataset) ? D.getAll().filter((e) => d.has(e.id)).map((e) => ({
			customerId: e.id,
			before: f(e)
		})) : [], m = [];
		for (let [e, t] of u.rows.entries()) {
			let n = l.results[e];
			n.action === "Skipped" ? m.push(n) : m.push({
				...n,
				...jn(o.dataset, o.mode, t.values, !0),
				before: n.before
			});
		}
		for (let e of m) {
			let t = Cn(o.dataset).find((t) => t.id === e.recordId);
			e.after = Tn(o.dataset, t), e.action === "Created" && (e.after.externalId = e.externalId);
		}
		let h = {
			id: crypto.randomUUID(),
			operationId: r,
			fingerprint: s,
			dataset: o.dataset,
			mode: o.mode,
			fileName: o.fileName,
			sourceHash: ve("sha256").update(o.text).digest("hex"),
			actorId: n,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			reason: a,
			results: m,
			parentChanges: p.map((e) => ({
				...e,
				after: f(D.getById(e.customerId))
			})).filter((e) => e.before !== e.after)
		};
		return In.parse(h), xn = [...xn, h], structuredClone(h);
	},
	export(e) {
		e = f(sn).parse(e), Sn(e);
		let t = fn(e), n = Cn(e).map((t) => Tn(e, t));
		return {
			dataset: e,
			count: n.length,
			csv: gn([t, ...n.map((e) => t.map((t) => e[t] ?? ""))])
		};
	},
	template(e) {
		e = f(sn).parse(e), Sn(e);
		let t = fn(e).filter((e) => !["id", "recordToken"].includes(e)), n = {
			_format: ln,
			externalId: "replace-with-stable-source-id",
			...Object.fromEntries(Object.entries(dn[e]).map(([e, t]) => [e, String(t)]))
		};
		return (e === "Customers" || e === "Suppliers") && (n.businessName = "Replace company name"), e === "Suppliers" && (n.country = "Replace country"), e === "Customer branches" && (n.name = "Replace branch name", n.addressLine1 = "Replace address", n.suburb = "Replace city", n.state = "Replace region", n.postcode = "Replace postcode", n.country = "Replace country"), e === "Customer contacts" && (n.firstName = "Replace", n.lastName = "Name", n.email = "replace@example.test"), e === "Products" && (n.sku = "REPLACE-SKU", n.name = "Replace product name"), gn([t, t.map((e) => n[e] ?? "")]);
	}
}, Pn = t(g(), g()), Fn = w({
	row: p().int().min(2).max(501),
	externalId: g().max(200),
	recordId: _n,
	action: f([
		"Created",
		"Updated",
		"Skipped"
	]),
	identityFingerprint: g().regex(/^[a-f0-9]{64}$/),
	before: Pn.nullable(),
	after: Pn
}).strict(), In = w({
	id: _n,
	operationId: _n,
	fingerprint: g().regex(/^[a-f0-9]{64}$/),
	dataset: f(sn),
	mode: f(cn),
	fileName: _n,
	sourceHash: g().regex(/^[a-f0-9]{64}$/),
	actorId: _n,
	at: g().refine((e) => new Date(e).toISOString() === e),
	reason: vn,
	results: r(Fn).min(1).max(500),
	parentChanges: r(w({
		customerId: _n,
		before: g().max(5e6),
		after: g().max(5e6)
	}).strict()).max(500)
}).strict();
y("dataTransfers", {
	repository: Nn,
	read: "inventory.read",
	commands: {
		review: "inventory.read",
		commit: "inventory.read",
		export: "inventory.read",
		template: "inventory.read"
	},
	snapshot: () => ({ runs: xn }),
	restore: (e) => {
		xn = e.runs;
	},
	publish: () => {},
	view: (t) => ({ runs: xn.filter((n) => e(t, pn[n.dataset].read)) }),
	validate: (e, t) => {
		let n = w({ runs: r(In) }).strict().parse(e), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set();
		for (let e of n.runs) {
			if (i.has(e.operationId)) throw Error("Duplicate import operation.");
			i.add(e.operationId);
			let n = e.dataset === "Products" ? t.products.products : e.dataset === "Suppliers" ? t.suppliers.suppliers : t.customers.customers, s = 1;
			for (let t of e.results) {
				if (t.row <= s) throw Error("Import result rows must be ordered.");
				if (s = t.row, !(e.dataset === "Customer branches" ? n.some((e) => e.locations.some((e) => e.id === t.recordId)) : e.dataset === "Customer contacts" ? n.some((e) => e.contacts.some((e) => e.id === t.recordId)) : n.some((e) => e.id === t.recordId)) || t.after.id !== t.recordId || t.before && t.before.id !== t.recordId || t.action === "Updated" && !t.before || t.action !== "Updated" && t.before) throw Error("Invalid imported record reference or before/after audit.");
				if (t.action === "Created") {
					if (e.mode !== "Create" || !t.externalId || a.has(e.dataset + ":" + t.externalId) || o.has(e.dataset + ":" + t.recordId)) throw Error("Invalid import source identity.");
					a.set(e.dataset + ":" + t.externalId, t), o.add(e.dataset + ":" + t.recordId);
				}
				if (t.action === "Skipped") {
					let n = a.get(e.dataset + ":" + t.externalId);
					if (e.mode !== "Create" || !n || n.recordId !== t.recordId || n.identityFingerprint !== t.identityFingerprint) throw Error("Invalid skipped import identity.");
				}
				if (t.action === "Updated" && e.mode !== "Update by ID") throw Error("Invalid import update mode.");
				if (t.before && (Object.keys(t.before).some((t) => !fn(e.dataset).includes(t)) || t.before._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(t.before.recordToken))) throw Error("Invalid import before-state audit.");
				if (Object.keys(t.after).some((t) => !fn(e.dataset).includes(t)) || t.after._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(t.after.recordToken)) throw Error("Invalid import audit fields.");
			}
			if (new Set(e.parentChanges.map((e) => e.customerId)).size !== e.parentChanges.length || e.parentChanges.length && !["Customer branches", "Customer contacts"].includes(e.dataset)) throw Error("Invalid import parent audit.");
			for (let t of e.parentChanges) {
				if (!n.some((e) => e.id === t.customerId)) throw Error("Invalid import parent reference.");
				for (let e of [t.before, t.after]) {
					let t = w({
						primaryLocationId: g().optional(),
						primaryContactId: g().optional(),
						locations: r(w({ id: _n }).passthrough()),
						contacts: r(w({ id: _n }).passthrough())
					}).strict().parse(JSON.parse(e));
					if (t.primaryLocationId && !t.locations.some((e) => e.id === t.primaryLocationId) || t.primaryContactId && !t.contacts.some((e) => e.id === t.primaryContactId)) throw Error("Invalid import primary-record audit.");
				}
			}
		}
	}
});
//#endregion
//#region electron/security/attachmentRepository.ts
var j = g().trim().min(1).max(200), Ln = g().trim().min(1).max(2e3), Rn = g().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), zn = w({
	id: j,
	number: p().int().positive(),
	name: j,
	mime: j,
	size: p().int().positive().max(h),
	sha256: g().regex(/^[a-f0-9]{64}$/),
	content: g().max(14e6),
	createdAt: Rn,
	createdBy: j,
	restoredFrom: j.optional()
}).strict(), Bn = w({
	id: j,
	title: g().trim().min(1).max(200),
	target: d,
	revision: p().int().positive(),
	currentVersionId: j,
	versions: r(zn).min(1).max(100),
	createdAt: Rn,
	createdBy: j,
	updatedAt: Rn,
	updatedBy: j,
	deletedAt: Rn.optional(),
	deletedBy: j.optional()
}).strict(), Vn = (e) => ({
	title: e.title,
	deleted: !!e.deletedAt,
	currentVersionId: e.currentVersionId,
	versionsCount: e.versions.length
}), Hn = w({
	id: j,
	documentId: j,
	operationId: j,
	action: f([
		"Uploaded",
		"Added version",
		"Restored version",
		"Renamed",
		"Trashed",
		"Recovered"
	]),
	actorId: j,
	at: Rn,
	revision: p().int().positive(),
	reason: Ln,
	versionId: j.optional(),
	fingerprint: g().regex(/^[a-f0-9]{64}$/),
	after: w({
		title: j,
		deleted: o(),
		currentVersionId: j,
		versionsCount: p().int().positive()
	}).strict()
}).strict(), Un = [], Wn = [];
function Gn() {
	return T.require("inventory.read");
}
var Kn = () => _e([...new Set(Object.values(ce).map((e) => e.repository))]);
function qn(e, t, r = Kn()) {
	return n(r, t).find((t) => t.kind === e.kind && t.id === e.id);
}
function Jn(e, t = !1) {
	let n = Gn(), r = qn(e, n);
	if (!r) throw Error("Business link was not found or access is denied.");
	if (t && !r.canWrite) throw Error("Permission denied: attachment maintenance requires the linked object write permission.");
	return n.userId;
}
function Yn(e, t = !1) {
	let n = Un.find((t) => t.id === j.parse(e));
	if (!n) throw Error("Attachment not found or access denied.");
	return Jn(n.target, t), n;
}
var Xn = (e) => ve("sha256").update(JSON.stringify(e)).digest("hex"), Zn = (e, t) => {
	let n = qn(e.target, t);
	return {
		...e,
		targetLabel: n.label,
		targetPath: n.path,
		canWrite: n.canWrite,
		versions: e.versions.map(({ content: e, ...t }) => t)
	};
};
function Qn(e, t) {
	if (e.revision !== t) throw Error("Attachment changed. Refresh before continuing.");
}
function $n(e, t) {
	if (t < e.updatedAt) throw Error("System clock precedes the last attachment change.");
}
function er(e) {
	if (Un.flatMap((e) => e.versions).reduce((e, t) => e + t.size, 0) + e > 5e7) throw Error("Local attachment library exceeds 50 MB including versions and trash. Export/archive the business profile before adding more files.");
}
function tr(e, t) {
	let n = Wn.find((t) => t.operationId === e);
	if (!n) return;
	let r = Yn(n.documentId, !0);
	if (n.fingerprint !== t) throw Error("Operation ID already has different attachment data.");
	return Zn(r, T.current());
}
function nr(e, t, n, r, i, a) {
	return Un = [...Un.filter((t) => t.id !== e.id), e], Wn = [...Wn, {
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
		after: Vn(e)
	}], Zn(e, T.current());
}
y("attachments", {
	repository: {
		targets() {
			return n(Kn(), Gn());
		},
		checkTarget(e) {
			return Jn(d.parse(e), !0), !0;
		},
		upload(e) {
			let t = w({
				operationId: j,
				id: j.optional(),
				expectedRevision: p().int().nonnegative(),
				target: d,
				title: j,
				reason: Ln,
				file: w({
					name: j,
					content: g().max(14e6)
				}).strict()
			}).strict().parse(e), n = Jn(t.target, !0), r = ge(t.file.name, t.file.content), i = Xn({
				...t,
				file: {
					name: r.name,
					sha256: r.sha256
				}
			}), a = tr(t.operationId, i);
			if (a) return a;
			let o = t.id ? Yn(t.id, !0) : void 0;
			if (o) {
				if (Qn(o, t.expectedRevision), JSON.stringify(o.target) !== JSON.stringify(t.target)) throw Error("An attachment retains its original business link.");
				if (o.deletedAt) throw Error("Recover the attachment before adding a version.");
				if (o.versions.some((e) => e.sha256 === r.sha256)) throw Error("These file bytes already exist in this attachment. Use version restore instead.");
				if (o.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
			} else if (t.expectedRevision !== 0) throw Error("A new attachment requires revision zero.");
			if (!o && Un.some((e) => !e.deletedAt && e.target.kind === t.target.kind && e.target.id === t.target.id && e.versions.some((e) => e.sha256 === r.sha256))) throw Error("This file already exists on the selected business object. Open its existing attachment.");
			er(r.size);
			let s = (/* @__PURE__ */ new Date()).toISOString();
			o && $n(o, s);
			let c = {
				...r,
				id: crypto.randomUUID(),
				number: (o?.versions.length ?? 0) + 1,
				createdAt: s,
				createdBy: n
			};
			return nr({
				...o ?? {
					id: crypto.randomUUID(),
					target: t.target,
					createdAt: s,
					createdBy: n
				},
				title: o?.title ?? t.title,
				currentVersionId: c.id,
				versions: [...o?.versions ?? [], c],
				revision: (o?.revision ?? 0) + 1,
				updatedAt: s,
				updatedBy: n
			}, o ? "Added version" : "Uploaded", t.operationId, i, t.reason, c.id);
		},
		change(e) {
			let t = w({
				operationId: j,
				id: j,
				expectedRevision: p().int().positive(),
				action: f([
					"Renamed",
					"Trashed",
					"Recovered",
					"Restored version"
				]),
				reason: Ln,
				title: j.optional(),
				versionId: j.optional()
			}).strict().parse(e), n = Yn(t.id, !0), r = Xn(t), i = tr(t.operationId, r);
			if (i) return i;
			Qn(n, t.expectedRevision);
			let a = Jn(n.target, !0), o = (/* @__PURE__ */ new Date()).toISOString();
			$n(n, o);
			let s = {
				...n,
				versions: [...n.versions],
				revision: n.revision + 1,
				updatedBy: a,
				updatedAt: o
			}, c;
			if (t.action === "Trashed") {
				if (n.deletedAt) throw Error("Attachment is already in the recycle bin.");
				s.deletedAt = o, s.deletedBy = a;
			} else if (t.action === "Recovered") {
				if (!n.deletedAt) throw Error("Attachment is not in the recycle bin.");
				delete s.deletedAt, delete s.deletedBy;
			} else {
				if (n.deletedAt) throw Error("Recover the attachment before editing.");
				if (t.action === "Renamed") {
					if (!t.title) throw Error("Enter a document title.");
					s.title = t.title;
				} else {
					let e = n.versions.find((e) => e.id === t.versionId);
					if (!e) throw Error("Version not found.");
					if (e.id === n.currentVersionId) throw Error("That version is already current.");
					if (n.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
					er(e.size), m(e);
					let r = {
						...e,
						id: crypto.randomUUID(),
						number: n.versions.length + 1,
						createdAt: o,
						createdBy: a,
						restoredFrom: e.id
					};
					s.versions.push(r), s.currentVersionId = r.id, c = r.id;
				}
			}
			return nr(s, t.action, t.operationId, r, t.reason, c);
		},
		read(e) {
			let t = w({
				id: j,
				versionId: j
			}).strict().parse(e), n = Yn(t.id).versions.find((e) => e.id === t.versionId);
			if (!n) throw Error("Version not found.");
			return m(n), { ...n };
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
		documents: Un,
		history: Wn
	}),
	restore: (e) => {
		Un = e.documents, Wn = e.history;
	},
	publish: () => {},
	view: (e) => {
		let t = Un.filter((t) => qn(t.target, e));
		return {
			documents: t.map((t) => Zn(t, e)),
			history: Wn.filter((e) => t.some((t) => t.id === e.documentId)).map(({ fingerprint: e, ...t }) => t)
		};
	},
	validate: (e, t) => {
		let n = w({
			documents: r(Bn),
			history: r(Hn)
		}).strict().parse(e), i = /* @__PURE__ */ new Set(), a = 0;
		for (let e of n.documents) {
			let r = ce[e.target.kind];
			if (!t[r.repository]?.[r.collection]?.some((t) => t.id === e.target.id)) throw Error("Invalid attachment business reference.");
			if (!!e.deletedAt != !!e.deletedBy) throw Error("Invalid attachment recycle metadata.");
			let i = /* @__PURE__ */ new Set();
			for (let [t, n] of e.versions.entries()) {
				if (m(n), a += n.size, i.has(n.id) || n.number !== t + 1 || n.createdAt < e.createdAt || n.createdAt > e.updatedAt) throw Error("Invalid attachment version history.");
				if (n.restoredFrom && (!i.has(n.restoredFrom) || e.versions.find((e) => e.id === n.restoredFrom)?.sha256 !== n.sha256 || e.versions.find((e) => e.id === n.restoredFrom)?.name !== n.name)) throw Error("Invalid restored attachment version.");
				i.add(n.id);
			}
			if (!i.has(e.currentVersionId)) throw Error("Invalid current attachment version.");
			let o = n.history.filter((t) => t.documentId === e.id);
			if (o.length !== e.revision || o[0].action !== "Uploaded" || o[0].actorId !== e.createdBy || o[0].at !== e.createdAt) throw Error("Invalid attachment audit history.");
			let s = e.createdAt, c = 0, l = !1, u = "", d = "";
			for (let [t, n] of o.entries()) {
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
			let f = o.at(-1);
			if (c !== e.versions.length || f.actorId !== e.updatedBy || f.at !== e.updatedAt || JSON.stringify(f.after) !== JSON.stringify(Vn(e))) throw Error("Attachment metadata differs from audit.");
			if (e.deletedAt && (e.deletedAt !== f.at || e.deletedBy !== f.actorId)) throw Error("Attachment deletion differs from audit.");
		}
		for (let e of n.history) {
			if (i.has(e.operationId) || !n.documents.some((t) => t.id === e.documentId)) throw Error("Invalid attachment operation identity.");
			i.add(e.operationId);
		}
		if (a > 5e7) throw Error("Attachment library exceeds 50 MB.");
	}
});
//#endregion
//#region src/features/banking/data/reconciliationLock.ts
function rr(e, t) {
	let n = _e(), r = n.journals?.journalEntries ?? [], i = n.bankReconciliations?.reconciliations ?? [], a = r.filter((n) => n.sourceType === e && n.sourceId === t).map((e) => e.id);
	if (i.some((e) => e.clearedTransactionIds.some((e) => a.some((t) => e.startsWith(t + ":"))))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function ir(e, t) {
	let n = _e(), r = n.bankAccounts?.bankAccounts ?? [], i = n.bankReconciliations?.reconciliations ?? [];
	for (let n of r.filter((e) => t.includes(e.glAccountId))) {
		let t = i.filter((e) => e.bankAccountId === n.id).map((e) => e.statementDate).sort().at(-1);
		if (t && e <= t) throw Error(`Bank account is reconciled through ${t}. Use a posting date after that statement.`);
	}
}
//#endregion
//#region src/features/accounting/data/accountingPeriodRepository.ts
var ar = [], or, sr, cr = /* @__PURE__ */ new Set();
function lr(e, t) {
	or = e, sr = t;
}
function ur() {
	let e = sr?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function dr(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function fr(e) {
	let t = ar.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function pr() {
	cr.forEach((e) => e());
}
function mr(e) {
	if (C(e, "Posting date"), !ar.length) return;
	let t = ar.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!ar.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
y("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => ar,
		subscribe(e) {
			return cr.add(e), () => {
				cr.delete(e);
			};
		},
		create(e) {
			let t = ur(), n = dr(e.reason);
			if (C(e.startDate), C(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (ar.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (ar.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
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
			return ar = [...ar, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), pr(), r;
		},
		preflight(e) {
			let t = fr(e);
			if (!or) throw Error("Trusted close checks unavailable.");
			return or(t);
		},
		close(e) {
			let t = ur(), n = dr(e.reason), r = fr(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (ar.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return ar = ar.map((e) => e.id === r.id ? {
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
			} : e), pr(), fr(e.id);
		},
		reopen(e) {
			let t = ur(), n = dr(e.reason), r = fr(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (ar.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return ar = ar.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), pr(), fr(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: ar }),
	restore: (e) => {
		me(e.periods), ar = e.periods;
	},
	publish: pr
});
//#endregion
//#region src/features/purchases/data/mockPurchaseOrders.ts
var hr = [{
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
}], gr = [{
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
}], _r = "htt:financial-snapshot:v1", vr = (e) => !!e && typeof e == "object" && !Array.isArray(e), yr = (e) => new Set(e.map((e) => e.id)).size === e.length, br = (e) => {
	if (!vr(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => vr(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => vr(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => vr(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => vr(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
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
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => vr(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && vr(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && vr(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && vr(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && yr(t) && yr(n) && yr(r) && yr(i);
}, xr = () => ({
	purchaseOrders: structuredClone(hr),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone(gr),
	transactions: [],
	transfers: [],
	journals: []
}), Sr, Cr = !1;
function wr() {
	return typeof window < "u" && !!window.localStorage;
}
function Tr() {
	if (Sr) return Sr;
	if (!wr()) return xr();
	let e = Ve(_r, br);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return Cr = e.status === "ok", Sr = e.status === "ok" ? {
		...xr(),
		...e.data
	} : xr(), Sr;
}
var Er = /* @__PURE__ */ new Set(), Dr = 0, Or = /* @__PURE__ */ new Set();
function kr(e) {
	if (wr() && !He(_r, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var M = {
	wasRestoredOnLoad() {
		return Tr(), Cr;
	},
	onRollback(e) {
		Er.add(e);
	},
	notify(e) {
		Dr ? Or.add(e) : e();
	},
	transaction(e) {
		if (Dr) return e();
		let t = structuredClone(Tr());
		Sr = structuredClone(t), Dr++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			kr(Tr());
		} catch (e) {
			throw Sr = t, Er.forEach((e) => e()), Or.clear(), e;
		} finally {
			Dr--;
		}
		let r = [...Or];
		return Or.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(Tr());
	},
	update(e, t) {
		let n = {
			...Tr(),
			[e]: structuredClone(t)
		};
		if (!br(n)) throw Error("Invalid financial snapshot; write blocked.");
		Dr || kr(n), Sr = n;
	},
	resetCacheForTests() {
		Sr = void 0, Cr = !1;
	}
};
y("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => M.read(),
	restore: (e) => {
		Sr = e;
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/accountRepository.ts
var Ar = /* @__PURE__ */ new Set(), N = "2026-10-08T00:00:00.000Z", jr = [
	{
		id: "acc_1000",
		code: "1000",
		name: "Operating Bank",
		type: "ASSET",
		systemRole: "BANK",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_1010",
		code: "1010",
		name: "Savings Bank",
		type: "ASSET",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_1100",
		code: "1100",
		name: "Accounts Receivable",
		type: "ASSET",
		systemRole: "ACCOUNTS_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_1200",
		code: "1200",
		name: "Inventory",
		type: "ASSET",
		systemRole: "INVENTORY",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_1300",
		code: "1300",
		name: "GST Receivable",
		type: "ASSET",
		systemRole: "GST_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_2000",
		code: "2000",
		name: "Accounts Payable",
		type: "LIABILITY",
		systemRole: "ACCOUNTS_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
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
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_2100",
		code: "2100",
		name: "GST Payable",
		type: "LIABILITY",
		systemRole: "GST_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_3000",
		code: "3000",
		name: "Owner's Equity",
		type: "EQUITY",
		systemRole: "OWNERS_EQUITY",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_3100",
		code: "3100",
		name: "Retained Earnings",
		type: "EQUITY",
		systemRole: "RETAINED_EARNINGS",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_4000",
		code: "4000",
		name: "Sales Revenue",
		type: "REVENUE",
		systemRole: "SALES_REVENUE",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_5000",
		code: "5000",
		name: "Cost of Goods Sold",
		type: "EXPENSE",
		systemRole: "COST_OF_GOODS_SOLD",
		active: !0,
		allowManualPosting: !1,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_5100",
		code: "5100",
		name: "Purchases / Materials",
		type: "EXPENSE",
		systemRole: "PURCHASES",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
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
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_5200",
		code: "5200",
		name: "Freight",
		type: "EXPENSE",
		systemRole: "FREIGHT",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
	},
	{
		id: "acc_5300",
		code: "5300",
		name: "Operating Expenses",
		type: "EXPENSE",
		systemRole: "OPERATING_EXPENSE",
		active: !0,
		allowManualPosting: !0,
		createdAt: N,
		updatedAt: N
	}
];
function Mr() {
	Ar.forEach((e) => e());
}
function Nr(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function Pr(e) {
	return e?.trim() || void 0;
}
function Fr(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function Ir(e, t) {
	if (jr.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function Lr(e, t) {
	if (!e) return;
	let n = jr.find((n) => n.id !== t && (he(e) ? n.id === he(e) : n.systemRole === e));
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function Rr() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var P = {
	subscribe(e) {
		return Ar.add(e), () => {
			Ar.delete(e);
		};
	},
	getSnapshot() {
		return jr;
	},
	getAll() {
		return jr;
	},
	getById(e) {
		return jr.find((t) => t.id === e);
	},
	getByCode(e) {
		return jr.find((t) => t.code.toLowerCase() === e.trim().toLowerCase());
	},
	getBySystemRole(e) {
		return jr.find((t) => he(e) ? t.id === he(e) : t.systemRole === e);
	},
	requireById(e) {
		let t = jr.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = jr.find((t) => he(e) ? t.id === he(e) : t.systemRole === e);
		if (!t) throw Error(`Accounting account for system role ${e} was not found.`);
		return t;
	},
	create(e) {
		let t = Nr(e.code, "Account code"), n = Nr(e.name, "Account name");
		Fr(t), Ir(t), Lr(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Rr(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: Pr(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return jr = [...jr, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), Mr(), i;
	},
	update(e, t) {
		let n = jr.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = Nr(t.code, "Account code"), i = Nr(t.name, "Account name");
		if (Fr(r), Ir(r, e), (n.systemRole || le(n.id)) && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: Pr(t.description),
			active: n.systemRole || le(n.id) ? !0 : t.active,
			allowManualPosting: n.systemRole || le(n.id) ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return jr = jr.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), Mr(), a;
	},
	setActive(e, t) {
		let n = jr.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		if ((n.systemRole || le(n.id)) && !t) throw Error("System control accounts cannot be deactivated.");
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return jr = jr.map((t) => t.id === e ? r : t), Mr(), r;
	}
};
y("accounts", {
	repository: P,
	read: "accounting.read",
	commands: {
		if: null,
		create: "accounting.post",
		update: "accounting.post",
		setActive: "accounting.post"
	},
	snapshot: () => ({ accounts: jr }),
	restore: (e) => {
		jr = e.accounts;
	},
	publish: () => Ar.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var zr = /* @__PURE__ */ new Set(), Br = M.read().journals;
M.onRollback(() => {
	Br = M.read().journals;
});
function Vr() {
	zr.forEach((e) => M.notify(e));
}
function Hr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ur(e) {
	return e?.trim() || void 0;
}
function Wr(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function Gr(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = Br.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Kr(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function qr(e) {
	if (Wr(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = P.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = Hr(r.debit), o = Hr(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = Hr(t + a), n = Hr(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function Jr(e) {
	return e.lines.map((e, t) => {
		let n = P.requireById(e.accountId);
		return {
			id: Kr(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: Ur(e.description),
			debit: Hr(e.debit),
			credit: Hr(e.credit)
		};
	});
}
function Yr(e, t) {
	return Br.find((n) => n.sourceType === e && n.sourceId === t && !n.reversedJournalEntryId);
}
var F = {
	subscribe(e) {
		return zr.add(e), () => {
			zr.delete(e);
		};
	},
	getSnapshot() {
		return Br;
	},
	getAll() {
		return Br;
	},
	getById(e) {
		return Br.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return Br.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: Yr,
	post(e) {
		mr(e.journalDate), ir(e.journalDate, e.lines.map((e) => e.accountId));
		let t = qr(e), n = Ur(e.sourceId);
		if (n) {
			let t = Yr(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Kr("je"),
			journalNumber: Gr(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: Ur(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: Jr(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...Br];
		return M.update("journals", a), Br = a, Vr(), i;
	},
	reverse(e) {
		mr(e.reversalDate);
		let t = Br.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (Wr(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Reversal reason must contain at least 3 characters.");
		ir(e.reversalDate, t.lines.map((e) => e.accountId));
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
		}, i = qr(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: Kr("je"),
			journalNumber: Gr(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: Jr(r),
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
		}, c = [o, ...Br.map((e) => e.id === t.id ? s : e)];
		return M.update("journals", c), Br = c, Vr(), o;
	}
};
y("journals", {
	repository: F,
	read: "accounting.read",
	commands: {
		if: null,
		validateDate: null,
		for: null,
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ journalEntries: Br }),
	restore: (e) => {
		Br = e.journalEntries;
	},
	publish: () => zr.forEach((e) => e())
});
//#endregion
//#region src/features/job-costing/jobCostingService.ts
function Xr(e) {
	let t = Math.round(e * 100);
	if (!Number.isFinite(e) || !Number.isSafeInteger(t) || Math.abs(t / 100 - e) > 1e-7) throw Error("Amounts must be safe currency values with at most two decimals.");
	return t;
}
function Zr(e, t) {
	return e.flatMap((n) => n.lines.flatMap((r, i) => {
		let a = t.find((e) => e.id === r.accountId);
		if (!a || !["REVENUE", "EXPENSE"].includes(a.type)) return [];
		let o = n, s = r;
		if (n.reversedJournalEntryId) {
			let t = e.find((e) => e.id === n.reversedJournalEntryId), a = t?.lines[i];
			if (!t || !a || a.accountId !== r.accountId || Xr(a.debit) !== Xr(r.credit) || Xr(a.credit) !== Xr(r.debit)) throw Error("Reversal line does not match its original source.");
			o = t, s = a;
		}
		let c = Xr(a.type === "REVENUE" ? r.credit - r.debit : r.debit - r.credit);
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
function Qr(e, t, n, r, i, a) {
	if (C(i, "From date"), C(a, "To date"), i > a) throw Error("From date must not follow to date.");
	let o = Zr(e, t).filter((e) => e.date >= i && e.date <= a), s = o.flatMap((e) => {
		let t = r.find((t) => t.journalId === e.rootJournalId && t.lineId === e.rootLineId), i = e.amount < 0 ? -1 : 1, a = Xr(e.capacity), o = (t?.splits ?? []).map((t) => {
			let r = Xr(t.amount);
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
		for (let r of s.filter((t) => t.jobId === e)) r.kind === "REVENUE" ? t += Xr(r.allocated) : n += Xr(r.allocated);
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
			let t = c(e.id), n = Xr(Math.round(Number(e.budget) * 100) / 100), r = Xr(Math.round(Number(e.costBudget) * 100) / 100);
			return {
				id: e.id,
				name: e.name,
				code: e.code,
				status: e.status,
				...t,
				budget: n / 100,
				costBudget: r / 100,
				budgetProfit: (n - r) / 100,
				revenueVariance: (Xr(t.revenue) - n) / 100,
				costVariance: (r - Xr(t.cost)) / 100,
				profitVariance: (Xr(t.profit) - n + r) / 100
			};
		}),
		unallocated: c(""),
		ledger: {
			revenue: o.filter((e) => e.kind === "REVENUE").reduce((e, t) => e + Xr(t.amount), 0) / 100,
			cost: o.filter((e) => e.kind === "EXPENSE").reduce((e, t) => e + Xr(t.amount), 0) / 100
		}
	};
}
//#endregion
//#region src/features/job-costing/jobCostingRepository.ts
var $r = g().trim().min(1).max(200), ei = g().trim().min(1).max(2e3), ti = g().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), ni = w({
	jobId: $r,
	amount: p().finite().positive().refine((e) => {
		try {
			return Xr(e), !0;
		} catch {
			return !1;
		}
	})
}).strict(), ri = w({
	id: $r,
	journalId: $r,
	lineId: $r,
	revision: p().int().positive(),
	splits: r(ni).max(100),
	updatedAt: ti,
	updatedBy: $r
}).strict(), ii = w({
	id: $r,
	operationId: $r,
	recordId: $r,
	revision: p().int().positive(),
	at: ti,
	actorId: $r,
	reason: ei,
	fingerprint: g().max(3e6),
	before: r(ni),
	after: r(ni)
}).strict(), ai = w({
	operationId: $r,
	journalId: $r,
	lineId: $r,
	expectedRevision: p().int().nonnegative(),
	expectedSource: g().max(2e6),
	splits: r(ni).max(100),
	reason: ei
}).strict(), oi = [], si = [], ci = /* @__PURE__ */ new Set(), li = () => ci.forEach((e) => e());
function ui(e, t, n) {
	if (new Set(e.map((e) => e.jobId)).size !== e.length) throw Error("Use one split per project.");
	if (e.some((e) => !n.some((t) => t.id === e.jobId))) throw Error("Project was not found.");
	if (e.reduce((e, t) => e + Xr(t.amount), 0) > Xr(t)) throw Error("Project splits exceed the source amount.");
}
y("jobCosting", {
	repository: {
		subscribe(e) {
			return ci.add(e), () => {
				ci.delete(e);
			};
		},
		getSnapshot: () => oi,
		review() {
			return T.require("accounting.read"), {
				lines: Zr(F.getAll(), P.getAll()),
				allocations: structuredClone(oi),
				history: structuredClone(si)
			};
		},
		report(e) {
			T.require("accounting.read");
			let t = w({
				from: g(),
				to: g()
			}).strict().parse(e);
			return Qr(F.getAll(), P.getAll(), S.jobs, oi, t.from, t.to);
		},
		save(e) {
			let t = T.require("accounting.post"), n = ai.parse(e), r = JSON.stringify(n), i = si.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already has different allocation data.");
				return oi.find((e) => e.id === i.recordId);
			}
			let a = Zr(F.getAll(), P.getAll()).find((e) => e.journalId === n.journalId && e.lineId === n.lineId);
			if (!a) throw Error("Select a posted revenue or expense line.");
			if (a.reversal) throw Error("Allocate the original line; reversal entries inherit its splits.");
			if (n.expectedSource !== a.signature) throw Error("Source journal changed. Refresh before allocating.");
			let o = oi.find((e) => e.journalId === a.journalId && e.lineId === a.lineId);
			if ((o?.revision ?? 0) !== n.expectedRevision) throw Error("Allocation changed. Refresh before saving.");
			ui(n.splits, a.capacity, S.jobs);
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
			return oi = [...oi.filter((e) => e.id !== c.id), c], si = [...si, {
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
			}], li(), c;
		}
	},
	read: "accounting.read",
	commands: {
		review: "accounting.read",
		report: "accounting.read",
		save: "accounting.post"
	},
	snapshot: () => ({
		allocations: oi,
		history: si
	}),
	restore: (e) => {
		oi = e.allocations, si = e.history;
	},
	publish: li,
	validate: (e, t) => {
		let n = w({
			allocations: r(ri),
			history: r(ii)
		}).strict().parse(e), i = t.workspace_jobs.records, a = Zr(t.journals.journalEntries, t.accounts.accounts), o = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
		for (let e of n.allocations) {
			let t = a.find((t) => t.journalId === e.journalId && t.lineId === e.lineId), r = e.journalId + ":" + e.lineId;
			if (!t || t.reversal || o.has(r)) throw Error("Invalid project source reference.");
			o.add(r), ui(e.splits, t.capacity, i);
			let s = n.history.filter((t) => t.recordId === e.id);
			if (s.length !== e.revision) throw Error("Invalid allocation history length.");
			let c = [], l = "";
			for (let [n, r] of s.entries()) {
				let a = ai.parse(JSON.parse(r.fingerprint));
				if (r.revision !== n + 1 || r.at < l || JSON.stringify(r.before) !== JSON.stringify(c) || a.journalId !== e.journalId || a.lineId !== e.lineId || a.operationId !== r.operationId || a.expectedRevision !== n || a.reason !== r.reason || JSON.stringify(a.splits) !== JSON.stringify(r.after)) throw Error("Invalid allocation history chain.");
				ui(r.after, t.capacity, i), c = r.after, l = r.at;
			}
			let u = s.at(-1);
			if (JSON.stringify(c) !== JSON.stringify(e.splits) || u.at !== e.updatedAt || u.actorId !== e.updatedBy) throw Error("Allocation outcome differs from audit history.");
		}
		for (let e of n.history) {
			if (s.has(e.operationId) || !n.allocations.some((t) => t.id === e.recordId)) throw Error("Invalid allocation operation reference.");
			s.add(e.operationId);
		}
	}
});
//#endregion
//#region src/features/contact-review/reviewRepository.ts
var di = g().trim().min(1).max(200), fi = g().trim().max(2e3), pi = g().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), mi = w({
	operationId: di,
	kind: f(Vt),
	customerId: g().max(200).default(""),
	values: Wt,
	source: f(Ht).default("Manual"),
	externalId: g().trim().max(200).default(""),
	sourceReference: g().trim().max(500).default("")
}).strict(), hi = w({
	id: di,
	action: di,
	actorId: di,
	at: pi,
	reason: fi,
	data: g().max(2e6)
}).strict(), gi = w({
	action: f([
		"Approve new",
		"Link existing",
		"Reject"
	]),
	actorId: di,
	at: pi,
	reason: fi,
	fingerprint: g().max(1e4),
	customerId: g(),
	targetId: g(),
	snapshot: ee()
}).strict(), _i = mi.extend({
	id: di,
	state: f([
		"Pending",
		"Approved",
		"Linked",
		"Rejected"
	]),
	revision: p().int().positive(),
	createdBy: di,
	createdAt: pi,
	updatedAt: pi,
	creationFingerprint: g().max(1e5),
	history: r(hi).min(1),
	decision: gi.optional()
}).strict(), vi = [], yi = /* @__PURE__ */ new Set(), bi = () => yi.forEach((e) => e());
function xi() {
	let e = T.require("contacts.write");
	return T.require("sales.read"), e.userId;
}
var Si = () => (/* @__PURE__ */ new Date()).toISOString();
function Ci(e) {
	let t = Si();
	if (t < e.updatedAt) throw Error("System clock precedes the last review update. Correct it before continuing.");
	return t;
}
var wi = (e, t, n, r = "", i = {}) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	reason: r,
	data: JSON.stringify(i)
});
function Ti(e) {
	let t = vi.find((t) => t.id === e);
	if (!t) throw Error("Review draft not found.");
	return t;
}
function Ei(e, t) {
	if (e.revision !== t) throw Error("Review draft changed. Reload before continuing.");
}
function Di(e) {
	return vi = [...vi.filter((t) => t.id !== e.id), e], bi(), e;
}
function Oi(e) {
	let t = mi.parse(e);
	if (t.values = Gt(t.kind, t.values), t.kind === "Customer" && t.customerId) throw Error("Customer drafts must not have a parent customer.");
	if (t.customerId && !D.getById(t.customerId)) throw Error("Parent customer was not found.");
	return t;
}
function ki(e, t) {
	return e === "Customer" ? Le.strict().parse(t) : e === "Branch" ? Re.strict().parse(t) : ze.strict().parse(t);
}
function Ai(e, t, n) {
	let r = D.getById(e === "Customer" ? n : t);
	if (!r) throw Error("Choose an existing customer.");
	let i = e === "Customer" ? r : e === "Branch" ? r.locations.find((e) => e.id === n) : r.contacts.find((e) => e.id === n);
	if (!i) throw Error("The selected record does not belong to this customer or draft type.");
	return {
		customerId: r.id,
		targetId: i.id,
		snapshot: structuredClone(i)
	};
}
var ji = {
	subscribe(e) {
		return yi.add(e), () => {
			yi.delete(e);
		};
	},
	getSnapshot: () => vi,
	create(e) {
		let t = xi(), n = Oi(e), { operationId: r, ...i } = n, a = JSON.stringify(i), o = vi.find((e) => e.operationId === r) || n.externalId && vi.find((e) => e.source === n.source && e.externalId === n.externalId);
		if (o) {
			if (o.creationFingerprint !== a) throw Error("Operation or external source ID already contains different draft data.");
			return o;
		}
		let s = Si();
		return Di({
			...n,
			id: crypto.randomUUID(),
			state: "Pending",
			revision: 1,
			createdBy: t,
			createdAt: s,
			updatedAt: s,
			creationFingerprint: a,
			history: [wi("Received", t, s, "", i)]
		});
	},
	importBatch(e) {
		xi();
		let t = w({
			operationId: di.max(150),
			drafts: r(mi.omit({ operationId: !0 })).min(1).max(100)
		}).strict().parse(e);
		if (t.drafts.some((e) => !e.externalId)) throw Error("Each imported draft requires a source external ID for safe retry.");
		return t.drafts.map((e, n) => ji.create({
			...e,
			operationId: t.operationId + ":" + n
		}));
	},
	update(e) {
		let t = xi(), n = w({
			id: di,
			expectedRevision: p().int().positive(),
			customerId: g().max(200),
			values: Wt
		}).strict().parse(e), r = Ti(n.id);
		if (Ei(r, n.expectedRevision), r.state !== "Pending") throw Error("Only pending drafts can be edited.");
		let i = Oi({
			operationId: r.operationId,
			kind: r.kind,
			customerId: n.customerId,
			values: n.values,
			source: r.source,
			externalId: r.externalId,
			sourceReference: r.sourceReference
		}), a = Ci(r);
		return Di({
			...r,
			customerId: i.customerId,
			values: i.values,
			revision: r.revision + 1,
			updatedAt: a,
			history: [...r.history, wi("Updated", t, a, "", {
				customerId: i.customerId,
				values: i.values
			})]
		});
	},
	review(e) {
		T.require("sales.read");
		let t = Ti(di.parse(e)), n = D.getAll(), r = "";
		try {
			if (ki(t.kind, t.values), t.kind !== "Customer" && !n.some((e) => e.id === t.customerId)) throw Error("Select the parent customer.");
		} catch (e) {
			r = e.message;
		}
		return {
			revision: t.revision,
			duplicates: Xt(t, n),
			masterSignature: Zt(n),
			validationError: r
		};
	},
	decide(e) {
		let t = xi(), n = w({
			id: di,
			expectedRevision: p().int().positive(),
			action: f([
				"Approve new",
				"Link existing",
				"Reject"
			]),
			reason: fi,
			allowDuplicate: o().default(!1),
			targetId: g().max(200).default(""),
			expectedMaster: g().max(25e6).optional()
		}).strict().parse(e), r = Ti(n.id), i = JSON.stringify({
			action: n.action,
			reason: n.reason,
			allowDuplicate: n.allowDuplicate,
			targetId: n.targetId
		});
		if (r.state !== "Pending") {
			if (r.decision?.fingerprint === i) return r;
			throw Error("This draft already has a different decision.");
		}
		Ei(r, n.expectedRevision);
		let a = Ci(r), s = {
			customerId: "",
			targetId: "",
			snapshot: null
		};
		if (n.action === "Reject") {
			if (!n.reason) throw Error("Explain why the draft is rejected.");
		} else {
			let e = D.getAll();
			if (n.expectedMaster !== Zt(e)) throw Error("Customer records changed. Refresh duplicate review before deciding.");
			if (n.action === "Link existing") {
				if (!n.reason) throw Error("Explain why this existing record is the correct match.");
				s = Ai(r.kind, r.customerId, n.targetId);
			} else {
				if (Xt(r, e).length && (!n.allowDuplicate || !n.reason)) throw Error("Possible duplicates exist. Link an existing record or explicitly confirm a separate new record with a reason.");
				let t = ki(r.kind, r.values);
				if (r.kind === "Customer") {
					let e = D.create(t);
					s = {
						customerId: e.id,
						targetId: e.id,
						snapshot: structuredClone(e)
					};
				} else {
					let e = D.getById(r.customerId);
					if (!e || e.status === "INACTIVE") throw Error("Select an available parent customer.");
					let n = r.kind === "Branch" ? D.addLocation(e.id, t) : D.addContact(e.id, t);
					s = {
						customerId: e.id,
						targetId: n.id,
						snapshot: structuredClone(n)
					};
				}
			}
		}
		let c = {
			action: n.action,
			actorId: t,
			at: a,
			reason: n.reason,
			fingerprint: i,
			...s
		};
		return Di({
			...r,
			state: n.action === "Reject" ? "Rejected" : n.action === "Link existing" ? "Linked" : "Approved",
			revision: r.revision + 1,
			updatedAt: a,
			decision: c,
			history: [...r.history, wi(n.action, t, a, n.reason, c)]
		});
	},
	reopen(e) {
		let t = xi(), n = w({
			id: di,
			expectedRevision: p().int().positive(),
			reason: fi.refine(Boolean, "Explain why this draft is reopened.")
		}).strict().parse(e), r = Ti(n.id);
		if (Ei(r, n.expectedRevision), r.state !== "Rejected") throw Error("Only rejected drafts may be reopened.");
		let i = Ci(r), a = {
			...r,
			state: "Pending",
			revision: r.revision + 1,
			updatedAt: i,
			history: [...r.history, wi("Reopened", t, i, n.reason)]
		};
		return delete a.decision, Di(a);
	}
};
y("contactReviews", {
	repository: ji,
	read: "sales.read",
	commands: {
		create: "contacts.write",
		update: "contacts.write",
		importBatch: "contacts.write",
		review: "sales.read",
		decide: "contacts.write",
		reopen: "contacts.write"
	},
	snapshot: () => ({ drafts: vi }),
	restore: (e) => {
		vi = e.drafts;
	},
	publish: bi,
	validate: (e, t) => {
		let n = w({ drafts: r(_i) }).strict().parse(e), i = t.customers.customers, a = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
		for (let e of n.drafts) {
			let t = Gt(e.kind, e.values);
			if (Object.keys(t).length !== Object.keys(e.values).length) throw Error("Missing review draft fields.");
			if (a.has(e.operationId) || e.externalId && s.has(e.source + ":" + e.externalId)) throw Error("Duplicate review intake identity.");
			a.add(e.operationId), e.externalId && s.add(e.source + ":" + e.externalId);
			let n = JSON.parse(e.creationFingerprint);
			if (e.history[0].data !== e.creationFingerprint) throw Error("Review source history is inconsistent.");
			if (n.kind !== e.kind || n.source !== e.source || n.externalId !== e.externalId || n.sourceReference !== e.sourceReference) throw Error("Review intake provenance is inconsistent.");
			if (e.history.length !== e.revision || new Set(e.history.map((e) => e.id)).size !== e.history.length || e.history[0].action !== "Received" || e.history[0].actorId !== e.createdBy || e.history[0].at !== e.createdAt || e.updatedAt < e.createdAt) throw Error("Invalid review history.");
			let r = "Pending", c = e.createdAt;
			for (let [t, n] of e.history.entries()) {
				if (n.at < c || n.at > e.updatedAt) throw Error("Invalid review event time.");
				c = n.at;
				let i = JSON.parse(n.data);
				if (!i || typeof i != "object" || Array.isArray(i)) throw Error("Invalid review event payload.");
				if (t !== 0) {
					if (n.action === "Updated") {
						if (r !== "Pending") throw Error("Invalid review edit history.");
					} else if (n.action === "Reopened") {
						if (r !== "Rejected" || !n.reason) throw Error("Invalid review reopen history.");
						r = "Pending";
					} else if ([
						"Approve new",
						"Link existing",
						"Reject"
					].includes(n.action)) {
						if (r !== "Pending") throw Error("Invalid repeated review decision.");
						r = n.action === "Reject" ? "Rejected" : n.action === "Link existing" ? "Linked" : "Approved";
					} else throw Error("Unknown review history action.");
				}
			}
			if (r !== e.state || e.history.at(-1).at !== e.updatedAt) throw Error("Review history does not match current state.");
			if (e.kind === "Customer" && e.customerId || e.customerId && !i.some((t) => t.id === e.customerId)) throw Error("Review parent customer is invalid.");
			if (e.state === "Pending" != !e.decision) throw Error("Review state and decision are inconsistent.");
			if (e.decision) {
				let t = e.state === "Rejected" ? "Reject" : e.state === "Linked" ? "Link existing" : "Approve new", n = w({
					action: f([
						"Approve new",
						"Link existing",
						"Reject"
					]),
					reason: fi,
					allowDuplicate: o(),
					targetId: g()
				}).strict().parse(JSON.parse(e.decision.fingerprint)), r = e.history.at(-1);
				if (n.action !== t || n.reason !== e.decision.reason || n.targetId !== (t === "Link existing" ? e.decision.targetId : "") || r.actorId !== e.decision.actorId || r.at !== e.decision.at || r.reason !== e.decision.reason || JSON.stringify(JSON.parse(r.data)) !== JSON.stringify(e.decision)) throw Error("Review decision audit is inconsistent.");
				if (e.decision.action !== t) throw Error("Invalid review decision.");
				if (t !== "Reject") {
					let n = i.find((t) => t.id === e.decision.customerId), r = e.kind === "Customer" ? n : e.kind === "Branch" ? n?.locations.find((t) => t.id === e.decision.targetId) : n?.contacts.find((t) => t.id === e.decision.targetId);
					if (!r || r.id !== e.decision.targetId || e.kind !== "Customer" && n.id !== e.customerId || e.decision.snapshot?.id !== r.id) throw Error("Invalid resolved review reference.");
					t === "Approve new" && ki(e.kind, e.values);
				} else if (!e.decision.reason || e.decision.customerId || e.decision.targetId) throw Error("Invalid rejection.");
			}
		}
	}
});
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var Mi = "htt.mock.banking.accounts.v1";
function Ni(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var Pi = /* @__PURE__ */ new Set(), Fi = "2026-10-08T00:00:00.000Z", Ii = [{
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
	createdAt: Fi,
	updatedAt: Fi
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
	createdAt: Fi,
	updatedAt: Fi
}], Li = Ve(Mi, Ni);
Li.status === "ok" && Li.data.every((e) => {
	let t = P.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (Ii = Li.data);
function Ri() {
	Pi.forEach((e) => e());
}
function zi(e) {
	let t = P.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of Ii) zi(e);
var Bi = {
	subscribe(e) {
		return Pi.add(e), () => {
			Pi.delete(e);
		};
	},
	getSnapshot() {
		return Ii;
	},
	getAll() {
		return Ii;
	},
	getById(e) {
		return Ii.find((t) => t.id === e);
	},
	getByGlAccountId(e) {
		return Ii.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = Ii.find((t) => t.id === e);
		if (!t) throw Error("Bank account was not found.");
		return t;
	},
	save(e, t) {
		let n = w({
			id: g().optional(),
			name: g().trim().min(1).max(180),
			bankName: g().trim().min(1).max(180),
			accountNumber: g().trim().min(1).max(100),
			accountType: f([
				"TRANSACTION",
				"SAVINGS",
				"CREDIT_CARD",
				"OTHER"
			]),
			currency: f(["AUD", "NZD"]),
			glAccountId: g().min(1),
			openingBalanceDate: g(),
			active: o()
		}).strict().parse(e);
		if (C(n.openingBalanceDate, "Opening date"), Ii[0] && n.currency !== Ii[0].currency) throw Error("This profile uses one base currency; foreign-currency bank accounts are not supported.");
		let r = Ii.find((e) => e.id === n.id);
		if (r && r.updatedAt !== t) throw Error("Bank account changed; reload before editing.");
		if (!r && n.id) throw Error("Bank account was not found.");
		if (Ii.some((e) => e.id !== r?.id && e.glAccountId === n.glAccountId)) throw Error("Each bank account needs its own GL account.");
		let i = P.requireById(n.glAccountId);
		if (!i.active || i.type !== "ASSET" || i.systemRole && i.systemRole !== "BANK") throw Error("Choose an active bank Asset account.");
		if (r && F.getAll().some((e) => e.lines.some((e) => e.accountId === r.glAccountId)) && (r.glAccountId !== n.glAccountId || r.openingBalanceDate !== n.openingBalanceDate || r.currency !== n.currency)) throw Error("A used bank account cannot change its ledger, currency or opening date.");
		let a = new Date(Math.max(Date.now(), r ? Date.parse(r.updatedAt) + 1 : 0)).toISOString(), s = {
			...n,
			id: r?.id ?? crypto.randomUUID(),
			openingBalance: r?.openingBalance ?? 0,
			createdAt: r?.createdAt ?? a,
			updatedAt: a
		};
		return zi(s), Ii = [...Ii.filter((e) => e.id !== s.id), s], Ri(), s;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ii = Ii.map((t) => t.id === e ? r : t), Ue(Mi) && He(Mi, Ii), Ri(), r;
	}
};
y("bankAccounts", {
	repository: Bi,
	read: "banking.read",
	commands: {
		if: null,
		validateBankAccount: null,
		setActive: "banking.write",
		save: "banking.write"
	},
	snapshot: () => ({ bankAccounts: Ii }),
	restore: (e) => {
		Ii = e.bankAccounts;
	},
	publish: () => Pi.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/areaPacks.ts
function Vi(e, t) {
	let n = O(e), r = n?.units.find((e) => e.id === t), i = n?.units.find((e) => e.id === n.baseUnitId);
	return n?.status === "ACTIVE" && n.itemType !== "SERVICE" && r?.active && i?.code === "M2" && ["BOX", "ROLL"].includes(r.code) && Number.isFinite(r.conversionToBase) && r.conversionToBase > 0 ? r.conversionToBase : void 0;
}
function Hi(e, t, n, r) {
	if (r === void 0) return { quantity: n };
	let i = Vi(e, t);
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
function Ui(e) {
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
function Wi(e, t) {
	let n = D.getById(e);
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
function Gi(e) {
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
function Ki(e, t, n, r) {
	let i = O(e), a = Dt(e, t);
	if (!i || i.status !== "ACTIVE" || !a?.active) throw Error("Select an active product and unit.");
	if (r === "buy" && !xt(i)) throw Error("Non-stock/service items use expense bills, not inventory purchase orders.");
	if (r === "buy" && i.buyEnabled === !1 || r === "sell" && i.sellEnabled === !1) throw Error(`Product is not available to ${r}.`);
	if (!Number.isFinite(n) || n <= 0) throw Error("Quantity must be finite and greater than zero.");
	if (i.wholePacks && [
		"BOX",
		"ROLL",
		"BUCKET"
	].includes(a.code) && !Number.isInteger(n)) throw Error("This product must be ordered in whole packs.");
}
//#endregion
//#region src/lib/persistence/financialOperationJournal.ts
var qi = "htt:financial-operations:v1", Ji = [
	"CUSTOMER_PAYMENT",
	"PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
], Yi = [
	"PENDING",
	"COMPLETED",
	"MANUAL_REVIEW"
], Xi = (e) => Array.isArray(e) && e.every((e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.operationId == "string" && t.operationId.length > 0 && Ji.includes(String(t.kind)) && typeof t.fingerprint == "string" && t.fingerprint.length > 0 && Yi.includes(String(t.state)) && typeof t.createdAt == "string" && typeof t.updatedAt == "string" && (t.resultId === void 0 || typeof t.resultId == "string") && (t.note === void 0 || typeof t.note == "string") && (t.reviewHistory === void 0 || Array.isArray(t.reviewHistory) && t.reviewHistory.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		return typeof t.reference == "string" && t.reference.length >= 3 && typeof t.operator == "string" && t.operator.length >= 2 && typeof t.recordedAt == "string" && typeof t.summary == "string" && t.summary.length >= 3;
	}));
}) && new Set(e.map((e) => e.operationId)).size === e.length;
function Zi() {
	let e = Ve(qi, Xi);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function Qi(e) {
	if (!Ue(qi) || !He(qi, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var I = {
	list() {
		return Zi().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !Ji.includes(t)) throw Error("Invalid operation identity.");
		let r = Zi(), i = r.find((t) => t.operationId === e);
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
		return Qi([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = Zi(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Qi(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = Zi(), r = n.find((t) => t.operationId === e);
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
		return Qi(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = Zi(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Qi(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = Zi(), a = i.find((t) => t.operationId === e);
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
		return Qi(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = Zi(), a = i.find((t) => t.operationId === e);
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
		return Qi(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	getUnresolved() {
		return Zi().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
	}
};
y("financialOperations", {
	repository: I,
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
var $i = /* @__PURE__ */ new Map(), ea = "htt.purchasePosting.operations.v1";
function ta() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function na() {
	let e = ta();
	if (e) try {
		e.setItem(ea, JSON.stringify([...$i.values()]));
	} catch {}
}
function ra() {
	let e = ta();
	if (e) try {
		let t = JSON.parse(e.getItem(ea) ?? "[]");
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
			$i.set(t.key, {
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
ra();
var ia = /* @__PURE__ */ new Set(), aa = /* @__PURE__ */ new Map(), oa = /* @__PURE__ */ new Map(), sa;
function ca() {
	na(), ia.forEach((e) => e());
}
var L = {
	injectFailureBeforeStep(e, t, n = 1) {
		oa.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		oa.clear();
	},
	registerRecovery(e, t) {
		if (!$i.has(e)) throw Error(`Unknown posting operation: ${e}`);
		aa.set(e, t);
	},
	runStep(e, t, n) {
		let r = $i.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = oa.get(i) ?? 0;
		if (a > 0) throw oa.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return aa.has(e);
	},
	recover(e) {
		let t = $i.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = aa.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (sa === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		sa = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			sa = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = $i.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...$i.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return ia.add(e), () => {
			ia.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if ($i.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return $i.set(n, r), ca(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = $i.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		$i.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), ca();
	},
	completeStep(e, t) {
		let n = $i.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || ($i.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), ca());
	}
};
y("purchaseOperations", {
	repository: L,
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
	snapshot: () => L.getAll(),
	restore: (e) => {
		$i.clear(), aa.clear();
		for (let t of e) $i.set(t.key, t);
	},
	publish: () => ia.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var la = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function ua(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${la.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function R() {
	ua(I.list(), L.getAll());
}
//#endregion
//#region src/features/sales/data/quoteStorage.ts
var da = "htt.mock.sales.quotes.v1", fa = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function pa(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !fa.has(String(t.status)) || ![
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
function ma() {
	return Ve(da, pa);
}
function ha(e) {
	if (ma().status === "invalid" || !Ue("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!He("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var ga = "htt.mock.sales.quote-orders.v1";
function _a(e) {
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
function va(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!pa(t.quotes) || !_a(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function ya() {
	return Ve(ga, va);
}
function ba(e) {
	if (!va(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = ya(), n = ma();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !Ue("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!He("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var xa = "htt.mock.sales.documents.v1";
function Sa(e) {
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
function Ca(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!va(t) || !Sa(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function wa() {
	return Ve(xa, Ca);
}
function Ta(e) {
	if (!Ca(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = wa();
	if (t.status === "invalid" || t.status === "unavailable" || !Ue("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!He("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var Ea = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Da(e) {
	let t = e.filter((e) => Ea.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function Oa() {
	Da(I.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var ka = [{
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
}], Aa = [{
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
}], ja = [{
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
}], Ma = "htt.mock.sales.credit-notes.v1", Na = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, Pa = (e) => typeof e == "string" && e.length > 0;
function Fa(e) {
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
		].every((e) => Pa(t[e])) || ![
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
		].every((e) => Na(i[e])) || !Na(t.amountApplied) || !Na(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => Pa(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !Na(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		if (Math.abs(t - e.amountApplied) > .011) return !1;
		let n = e.refundEvents ?? [];
		if (!Array.isArray(n) || n.some((e) => !e || !Pa(e.id) || !Pa(e.date) || !Na(e.amount) || e.amount <= 0 || e.reversalDate !== void 0 && !Pa(e.reversalDate)) || new Set(n.map((e) => e.id)).size !== n.length) return !1;
		let r = n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0);
		return !Na(e.amountRefunded ?? 0) || Math.abs(r - (e.amountRefunded ?? 0)) > .011 || t + r > e.totals.total + .011 ? !1 : e.status === "VOID" ? t === 0 && r === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t - r)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function Ia() {
	return Ve(Ma, Fa);
}
function La(e) {
	if (!Fa(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = Ia();
	if (t.status === "invalid" || t.status === "unavailable" || !Ue("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!He("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var Ra = /* @__PURE__ */ new Set(), za = Ia(), Ba = za.status === "ok" ? structuredClone(za.data.creditNotes) : [], Va = za.status === "ok" ? structuredClone(za.data.allocations) : [], Ha = [...Ba], Ua = [...Va];
function Wa() {
	Ha = [...Ba], Ua = [...Va], Ra.forEach((e) => e());
}
function Ga(e, t) {
	La({
		creditNotes: e,
		allocations: t
	}), Ba = e, Va = t, Wa();
}
var z = {
	subscribe(e) {
		return Ra.add(e), () => {
			Ra.delete(e);
		};
	},
	getSnapshot() {
		return Ha;
	},
	getAllocationSnapshot() {
		return Ua;
	},
	getAll() {
		return Ha;
	},
	getAllAllocations() {
		return Ua;
	},
	getById(e) {
		return Ba.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Ba.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Ba.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return Va.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return Va.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if (Ba.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return Ga([e, ...Ba], Va), e;
	},
	update(e) {
		if (!Ba.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return Ga(Ba.map((t) => t.id === e.id ? e : t), Va), e;
	},
	createAllocation(e) {
		if (Va.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return Ga(Ba, [e, ...Va]), e;
	},
	updateAllocation(e) {
		if (!Va.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return Ga(Ba, Va.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!Ba.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = Va.some((t) => t.id === e.id) ? Va.map((t) => t.id === e.id ? e : t) : [e, ...Va];
		Ga(Ba.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return Va.find((t) => t.id === e);
	}
};
y("customerCredits", {
	repository: z,
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
			Gi(n.recipient);
			for (let e of n.lines) Ui(e), Ct(e, t.products.products.find((t) => t.id === e.productId));
		}
	},
	snapshot: () => ({
		creditNotes: Ba,
		allocations: Va
	}),
	restore: (e) => {
		Ba = e.creditNotes, Va = e.allocations, Ha = [...Ba], Ua = [...Va];
	},
	publish: () => Ra.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/customerPricingStorage.ts
var Ka = "htt.mock.contacts.customerPricing.v1";
function qa(e) {
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
function Ja() {
	return Ve(Ka, qa);
}
function Ya(e) {
	if (Ja().status === "invalid" || !Ue("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!He("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var Xa = [
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
], Za = /* @__PURE__ */ new Set(), Qa = Ja(), $a = Qa.status === "ok" ? Qa.data : structuredClone(Xa);
function eo() {
	Za.forEach((e) => {
		e();
	});
}
function to(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function no(e) {
	return e.trim() || void 0;
}
function ro(e, t) {
	let n = O(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = n.units.find((e) => e.id === t);
	if (!r) throw Error(`Unit ${t} does not belong to product ${e}`);
	if (!r.active) throw Error("The selected product unit is inactive");
	return {
		product: n,
		unit: r
	};
}
function io(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function ao({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = $a.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : io(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = uo(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function oo(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function so(e) {
	let t = Dt(e.productId, e.unitId);
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
var co = {
	subscribe(e) {
		return Za.add(e), () => {
			Za.delete(e);
		};
	},
	getSnapshot() {
		return $a;
	},
	getAll() {
		return $a;
	},
	getById(e) {
		return $a.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return $a.filter((t) => t.customerId === e);
	},
	create(e, t) {
		ro(t.productId, t.unitId);
		let n = no(t.effectiveTo);
		t.active && ao({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = oo(t), a = {
			id: to("cprice"),
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
		}, o = [a, ...$a];
		return Ya(o), $a = o, eo(), a;
	},
	update(e, t) {
		let n = co.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		ro(t.productId, t.unitId);
		let r = no(t.effectiveTo);
		t.active && ao({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = oo(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = $a.map((t) => t.id === e ? a : t);
		return Ya(o), $a = o, eo(), a;
	},
	resolve(e) {
		return so(e);
	},
	resolvePrice(e, t, n, r) {
		let i = co.resolveBasePrice(e, t, n, r.slice(0, 10)), a = oe({
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
		let { unit: i } = ro(t, n), a = $a.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && lo(r, i.effectiveFrom, i.effectiveTo));
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
		let o = so(a);
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
function lo(e, t, n) {
	return !(e < t || n && e > n);
}
function uo(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
y("customerPrices", {
	repository: co,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: $a }),
	restore: (e) => {
		$a = e.customerPrices;
	},
	publish: () => Za.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
function fo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function po({ quantity: e, standardUnitPrice: t, unitPrice: n, taxRate: r = se(), inclusiveLineTotal: i }) {
	let a = fo(e * n), o = fo(i === void 0 ? a * r : i - a), s = fo(a + o), c = fo(t - n);
	return {
		discountAmount: c,
		discountPercent: t > 0 ? fo(c / t * 100) : 0,
		lineSubtotal: a,
		taxAmount: o,
		lineTotal: s
	};
}
function mo(e) {
	let t = fo(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = fo(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: fo(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function ho({ customerId: e, documentDate: t, draft: n }) {
	if (n.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let r = O(n.productId);
	if (!r) throw Error(`Product ${n.productId} was not found`);
	if (r.status !== "ACTIVE") throw Error(`${r.name} is inactive`);
	let i = Dt(n.productId, n.unitId);
	if (!i) throw Error(`Unit ${n.unitId} was not found for ${r.name}`);
	let a = co.resolvePrice(e, n.productId, n.unitId, t), o = n.unitPrice !== void 0, s = o ? n.unitPrice : a.effectivePrice;
	if (!Number.isFinite(s) || s < 0) throw Error("Unit price cannot be negative");
	let c = Hi(n.productId, n.unitId, n.quantity, n.requestedArea);
	if (Ki(n.productId, n.unitId, c.quantity, "sell"), r.sellEnabled === !1) throw Error("Product is not available for selling.");
	let l = r.taxCode ?? _().gstCode, u = se(l), d = o ? ae(s, u, n.priceBasis) : s, f = po({
		taxRate: u,
		inclusiveLineTotal: o && (n.priceBasis ?? _().basis) === "Inclusive" ? Math.round(c.quantity * s * 100) / 100 : void 0,
		quantity: c.quantity,
		standardUnitPrice: a.basePrice,
		unitPrice: d
	});
	return {
		id: go("line"),
		itemType: r.itemType ?? "STOCK",
		...c,
		...v(l),
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
function go(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var _o = /* @__PURE__ */ new Set(), vo = M.read().payments;
function yo() {
	_o.forEach((e) => e());
}
function bo() {
	return `payment_${crypto.randomUUID()}`;
}
function xo() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = vo.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var So = {
	subscribe(e) {
		return _o.add(e), () => {
			_o.delete(e);
		};
	},
	getSnapshot() {
		return vo;
	},
	getAll() {
		return vo;
	},
	getById(e) {
		return vo.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return vo.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return vo.filter((t) => t.invoiceId === e);
	},
	create(e) {
		if (!e.customerId) throw Error("Customer is required");
		if (!e.invoiceId) throw Error("Invoice is required");
		if (!e.paymentDate) throw Error("Payment date is required");
		if (!e.bankAccountId) throw Error("Bank account is required");
		let t = Bi.getById(e.bankAccountId);
		if (!t) throw Error("Bank account was not found");
		if (!t.active) throw Error("The selected bank account is inactive");
		if (!Number.isFinite(e.amount) || e.amount <= 0) throw Error("Payment amount must be greater than zero");
		if (C(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (wo(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = I.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: wo(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: Co(e.reference),
				notes: Co(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = vo.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: bo(),
			paymentNumber: xo(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: wo(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: Co(e.reference),
			notes: Co(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && I.bindResult(n, i.id);
		let a = [i, ...vo];
		if (M.update("payments", a), vo = a, n && !e.deferOperationCompletion) try {
			I.complete(n, i.id);
		} catch (e) {
			try {
				I.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return yo(), i;
	},
	reverse(e, t) {
		let n = vo.find((t) => t.id === e);
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
		}, o = vo.map((t) => t.id === e ? a : t);
		return M.update("payments", o), vo = o, yo(), a;
	},
	getReceivedByInvoice(e) {
		return vo.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function Co(e) {
	return e?.trim() || void 0;
}
function wo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
y("customerPayments", {
	repository: So,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null
	},
	snapshot: () => ({ payments: vo }),
	restore: (e) => {
		vo = e.payments;
	},
	publish: () => _o.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/taxPosting.ts
function To(e, t, n, r) {
	let i = t === "paid" ? "GST_RECEIVABLE" : "GST_PAYABLE", a = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = (t === "paid" ? n.taxPaidAccountId : n.taxCollectedAccountId) || P.requireBySystemRole(i).id;
		a.set(e, (a.get(e) ?? 0) + n.taxAmount);
	}
	return e.length || a.set(P.requireBySystemRole(i).id, r), [...a].filter(([, e]) => Math.round((e + 2 ** -52) * 100) !== 0).map(([e, t]) => {
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
function Eo(e) {
	return P.requireBySystemRole(e).id;
}
function Do(e) {
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
function Oo(e, t) {
	return F.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function ko(e, t) {
	let n = Oo(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Ao = {
	postInvoice(e) {
		return Oo("CUSTOMER_INVOICE", e.id) || F.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: Eo("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: Eo("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				...To(e.lines, "collected", !1, e.totals.taxAmount)
			]
		});
	},
	reverseInvoice(e) {
		let t = ko("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Do(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = Oo("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = Bi.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this customer payment is inactive.");
		return F.post({
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
				accountId: Eo("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = ko("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Do(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return Oo("CREDIT_NOTE", e.id) || F.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: Eo("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				...To(e.lines, "collected", !0, e.totals.taxAmount),
				{
					accountId: Eo("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = ko("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: Do(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, jo = /* @__PURE__ */ new Set(), Mo = wa(), No = ya(), Po = ma(), B = Mo.status === "ok" ? structuredClone(Mo.data.quotes) : No.status === "ok" ? structuredClone(No.data.quotes) : Po.status === "ok" ? structuredClone(Po.data) : structuredClone(ka);
function Fo(e) {
	Mo.status === "ok" || wa().status !== "empty" ? Ta({
		quotes: e,
		salesOrders: V,
		invoices: H
	}) : No.status === "ok" || ya().status !== "empty" ? ba({
		quotes: e,
		salesOrders: V
	}) : ha(e), B = e, zo();
}
var V = Mo.status === "ok" ? structuredClone(Mo.data.salesOrders) : No.status === "ok" ? structuredClone(No.data.salesOrders) : structuredClone(Aa), H = Mo.status === "ok" ? structuredClone(Mo.data.invoices) : structuredClone(ja);
function Io(e) {
	Ta({
		quotes: B,
		salesOrders: V,
		invoices: e
	}), H = e, zo();
}
function Lo(e, t = B) {
	Mo.status === "ok" || wa().status !== "empty" ? Ta({
		quotes: t,
		salesOrders: e,
		invoices: H
	}) : ba({
		quotes: t,
		salesOrders: e
	}), V = e, B = t, zo();
}
var Ro = Bo();
function zo() {
	Ro = Bo(), jo.forEach((e) => e());
}
function Bo() {
	return [
		...B,
		...V,
		...H
	];
}
var U = {
	createManagedOrder(e) {
		let t = V.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Uo("order"),
			managedDraftId: e.draftId,
			type: "SALES_ORDER",
			status: "CONFIRMED",
			documentNumber: Wo("SO", V.map((e) => e.documentNumber)),
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
		return Lo([r, ...V]), r;
	},
	createManagedInvoice(e) {
		let t = H.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = U.createManagedOrder(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Uo("invoice"),
			managedDraftId: e.draftId,
			type: "INVOICE",
			status: "ISSUED",
			documentNumber: Wo("INV", H.map((e) => e.documentNumber)),
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
		}, a = V.map((e) => e.id === n.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: r
		} : e);
		return Ta({
			quotes: B,
			salesOrders: a,
			invoices: [i, ...H]
		}), V = a, H = [i, ...H], zo(), Ao.postInvoice(i), i;
	},
	cancelManagedOrder(e, t) {
		let n = V.find((t) => t.id === e);
		if (!n?.managedDraftId) throw Error("Managed order not found.");
		if (n.status === "CANCELLED") return n;
		if (n.invoiceIds.some((e) => H.some((t) => t.id === e && t.status !== "VOID"))) throw Error("Void active invoices before cancelling the order.");
		if (n.status === "PARTIALLY_FULFILLED" || n.status === "FULFILLED" || n.fulfilmentStatus === "PARTIALLY_FULFILLED" || n.fulfilmentStatus === "FULFILLED") throw Error("Reverse active fulfilments before cancelling the order.");
		if (t.trim().length < 3) throw Error("Cancellation reason is required.");
		let r = {
			...n,
			status: "CANCELLED",
			notes: (n.notes ?? "") + "\nCancelled: " + t.trim(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Lo(V.map((t) => t.id === e ? r : t)), r;
	},
	subscribe(e) {
		return jo.add(e), () => {
			jo.delete(e);
		};
	},
	getSnapshot() {
		return ne(Ro);
	},
	getAll() {
		return ne(Ro);
	},
	getById(e) {
		return ne(Ro).find((t) => t.id === e);
	},
	getByCustomer(e) {
		return ne(Ro).filter((t) => t.customerId === e);
	},
	getQuotesByCustomer(e) {
		return ne(B).filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return V.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return H.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (Vo(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = e.lines.map((t) => ho({
			customerId: e.customerId,
			documentDate: e.documentDate,
			draft: t
		})), n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Uo("quote"),
			type: "QUOTE",
			documentNumber: Wo("QU", B.map((e) => e.documentNumber)),
			recipient: Wi(e.customerId, e),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: Ho(e.customerReference),
			notes: Ho(e.notes),
			lines: t,
			totals: mo(t),
			createdAt: n,
			updatedAt: n
		};
		return Fo([r, ...B]), r;
	},
	updateDraftQuote(e, t) {
		let n = B.find((t) => t.id === e);
		if (!n) throw Error(`Quote ${e} was not found`);
		if (n.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let r = t.lines.map((e) => {
			if (e.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
			if (!Number.isFinite(e.standardUnitPrice) || !Number.isFinite(e.unitPrice) || e.standardUnitPrice < 0 || e.unitPrice < 0) throw Error("Sales prices cannot be negative");
			let t = Hi(e.productId, e.unitId, e.quantity, e.requestedArea);
			Ki(e.productId, e.unitId, t.quantity, "sell");
			let r = O(e.productId)?.taxCode ?? _().gstCode, i = po({
				taxRate: se(r),
				quantity: t.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice
			}), a = n.lines.find((t) => t.id === e.lineId);
			return {
				itemType: O(e.productId)?.itemType ?? "STOCK",
				...t,
				id: a?.id ?? Uo("line"),
				productId: e.productId,
				unitId: e.unitId,
				sku: qo(e.productId, e.unitId).sku,
				description: qo(e.productId, e.unitId).description,
				unitSymbol: qo(e.productId, e.unitId).unitSymbol,
				quantity: t.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice,
				priceSource: e.priceSource,
				customerPriceId: e.customerPriceId,
				...v(r),
				...i
			};
		}), i = {
			...n,
			recipient: t.locationId === void 0 && t.accountingContactId === void 0 ? n.recipient : Wi(n.customerId, t),
			documentDate: t.documentDate,
			expiryDate: t.expiryDate,
			customerReference: Ho(t.customerReference),
			notes: Ho(t.notes),
			lines: r,
			totals: mo(r),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Fo(B.map((t) => t.id === e ? i : t)), i;
	},
	sendQuote(e) {
		let t = B.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return Fo(B.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = B.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return Fo(B.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = B.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return Fo(B.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = B.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Uo("order"),
			type: "SALES_ORDER",
			documentNumber: Wo("SO", V.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: Go(),
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
		return Lo([r, ...V], B.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = V.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED" && n.status !== "INVOICED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: n.status === "INVOICED" ? "INVOICED" : t,
			fulfilmentStatus: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Lo(V.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = V.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = Go(), i = {
			id: Uo("invoice"),
			managedDraftId: t.managedDraftId,
			type: "INVOICE",
			documentNumber: Wo("INV", H.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: r,
			dueDate: Ko(r, Number(_().terms)),
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
		}, a = [i, ...H], o = V.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: n
		} : e);
		return Ta({
			quotes: B,
			salesOrders: o,
			invoices: a
		}), H = a, V = o, zo(), Ao.postInvoice(i), i;
	},
	createCreditNoteFromInvoice(e) {
		let t = H.find((t) => t.id === e.invoiceId);
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
			let i = z.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id).reduce((e, t) => e + t.quantity, 0);
			if (e.quantity + i > n.quantity + 1e-8) throw Error("Credit quantity cannot exceed the original invoice quantity.");
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = z.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id), s = e.quantity + i >= n.quantity - 1e-8, c = Jo(s ? n.lineSubtotal - o.reduce((e, t) => e + t.lineSubtotal, 0) : n.lineSubtotal * e.quantity / n.quantity), l = Jo(s ? n.taxAmount - o.reduce((e, t) => e + t.taxAmount, 0) : n.taxAmount * e.quantity / n.quantity);
			return {
				...n,
				requestedArea: e.quantity === n.quantity ? n.requestedArea : void 0,
				coveredArea: n.areaPerPack ? Math.round(e.quantity * n.areaPerPack * 1e8) / 1e8 : void 0,
				quantity: e.quantity,
				taxRate: a,
				lineSubtotal: c,
				taxAmount: l,
				lineTotal: Jo(c + l)
			};
		}), a = mo(i);
		if (a.total <= 0) throw Error("Credit note total must be greater than zero");
		if (Jo(Jo(z.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + a.total) > Jo(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: Uo("credit-note"),
			creditNoteNumber: Wo("CN", z.getAll().map((e) => e.creditNoteNumber)),
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
		return z.create(s), Ao.postCreditNote(s), s;
	},
	applyCreditToInvoice(e) {
		R(), Oa();
		let t = z.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		let n = H.find((t) => t.id === e.invoiceId);
		if (!n) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void credit note cannot be applied");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be applied");
		if (n.status === "VOID") throw Error("Credit cannot be applied to a void invoice");
		if (n.status === "DRAFT") throw Error("Credit cannot be applied to a draft invoice");
		if (t.customerId !== n.customerId) throw Error("Credit note and invoice must belong to the same customer");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the credit note date");
		let r = Jo(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = z.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: Uo("credit-allocation"),
			allocationNumber: Wo("CA", z.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = Jo(i.amountApplied + r), c = Jo(Math.max(0, i.totals.total - (i.amountRefunded ?? 0) - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
		if (I.begin(l, "SALES_CREDIT_APPLY", JSON.stringify({
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: r
		})).status !== "started") throw Error("Credit allocation was previously attempted; manual review required.");
		try {
			I.bindResult(l, o.id), z.commitAllocationAndCredit(o, {
				...i,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(n.id), I.complete(l, o.id);
		} catch (e) {
			try {
				I.flagForReview(l, "Credit allocation/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	reverseCreditAllocation(e) {
		R(), Oa();
		let t = z.getAllocationById(e.allocationId);
		if (!t) throw Error(`Credit allocation ${e.allocationId} was not found`);
		if (t.status === "REVERSED") throw Error("This credit allocation has already been reversed");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A reversal reason is required");
		let r = z.getById(t.creditNoteId);
		if (!r) throw Error("Credit note was not found");
		if (r.status === "VOID") throw Error("Allocations on a void credit note cannot be reversed here");
		let i = H.find((e) => e.id === t.invoiceId);
		if (!i) throw Error("Allocated invoice was not found");
		if (i.status === "VOID") throw Error("Credit allocation cannot be reversed after the invoice has been voided");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			updatedAt: a
		}, s = Jo(z.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = Jo(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - s)), l = `sales-credit-reversal:${t.id}`;
		if (I.begin(l, "SALES_CREDIT_REVERSAL", t.id).status !== "started") throw Error("Credit allocation reversal previously attempted; manual review required.");
		try {
			I.bindResult(l, t.id), z.commitAllocationAndCredit(o, {
				...r,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(i.id), I.complete(l, t.id);
		} catch (e) {
			try {
				I.flagForReview(l, "Credit reversal/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	voidCreditNote(e) {
		let t = z.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		if (t.status === "VOID") throw Error("This credit note has already been voided");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be voided here");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse customer refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required");
		if (z.getAllocationsByCreditNote(t.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this credit note");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: r,
			voidReason: n,
			updatedAt: r
		};
		return z.update(i), Ao.reverseCreditNote(i), i;
	},
	recordInvoicePayment(e) {
		if (R(), Oa(), e.operationId) {
			let t = I.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = H.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = Jo(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (C(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, a = So.create({
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
			Ao.postPayment(a);
			let e = F.getBySource("CUSTOMER_PAYMENT", a.id).filter((e) => !e.reversedJournalEntryId);
			if (e.length !== 1 || e[0].status !== "POSTED") throw Error("Payment GL posting could not be verified uniquely.");
			I.complete(i, a.id);
		} catch (e) {
			try {
				I.flagForReview(i, "Payment or GL posting uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	voidInvoice(e, t) {
		R(), Oa();
		let n = H.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (So.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
		if (z.getAllocationsByInvoice(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("This invoice has applied credits. Reverse all active credit allocations before voiding the invoice.");
		if (n.managedDraftId && z.getByInvoice(n.id).some((e) => e.status !== "VOID")) throw Error("Void source credits before voiding this direct invoice.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			amountPaid: 0,
			amountDue: 0,
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		}, o = `sales-invoice-void:${e}`;
		if (I.begin(o, "SALES_INVOICE_VOID", e).status !== "started") throw Error("Invoice void was previously attempted; inspect GL and operation journal before retrying.");
		try {
			let t = F.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (t.length !== 1 || t[0].status !== "POSTED") throw Error("Invoice original GL must be uniquely posted before voiding.");
			I.bindResult(o, e), Ao.reverseInvoice(a);
			let n = F.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			Io(H.map((t) => t.id === e ? a : t)), I.complete(o, e);
		} catch (e) {
			try {
				I.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		rr("CUSTOMER_PAYMENT", e), R(), Oa();
		let n = So.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = H.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (I.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			I.bindResult(i, e);
			let n = So.reverse(e, t);
			Ao.reversePayment(n);
			let a = F.getBySource("CUSTOMER_PAYMENT", e).filter((e) => !e.reversedJournalEntryId);
			if (a.length !== 1 || a[0].status !== "REVERSED") throw Error("Payment GL reversal could not be verified.");
			return this.recalculateInvoiceBalance(r.id), I.complete(i, e), n;
		} catch (e) {
			try {
				I.flagForReview(i, "Payment reversal/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
	},
	recalculateInvoiceBalance(e) {
		let t = H.find((t) => t.id === e);
		if (!t) throw Error(`Invoice ${e} was not found`);
		if (t.status === "VOID") return t;
		let n = So.getReceivedByInvoice(e), r = z.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = Jo(n.reduce((e, t) => e + t.amount, 0)), a = Jo(r.reduce((e, t) => e + t.amount, 0)), o = Jo(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : Yo(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Io(H.map((t) => t.id === e ? c : t)), c;
	}
};
function Vo(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function Ho(e) {
	return e?.trim() || void 0;
}
function Uo(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Wo(e, t) {
	return pe(e, t, x((/* @__PURE__ */ new Date()).toISOString()).slice(0, 4));
}
function Go() {
	return x((/* @__PURE__ */ new Date()).toISOString());
}
function Ko(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function qo(e, t) {
	let n = O(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = Dt(e, t);
	if (!r) throw Error(`Unit ${t} was not found for ${n.name}`);
	return {
		sku: n.sku,
		description: n.name,
		unitSymbol: r.symbol
	};
}
function Jo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Yo(e) {
	return e < Xo(/* @__PURE__ */ new Date());
}
function Xo(e) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
y("sales", {
	repository: U,
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
			Gi(e.recipient);
			for (let n of e.lines) Ui(n), Ct(n, t.products.products.find((e) => e.id === n.productId));
		}
	},
	snapshot: () => ({
		quotes: B,
		salesOrders: V,
		invoices: H
	}),
	restore: (e) => {
		B = e.quotes, V = e.salesOrders, H = e.invoices, Ro = Bo();
	},
	publish: () => jo.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
function Zo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Qo({ orderedQuantity: e, unitCost: t, taxRate: n = se(), inclusiveLineTotal: r }) {
	let i = Zo(e * t), a = Zo(r === void 0 ? i * n : r - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: Zo(i + a)
	};
}
function $o(e) {
	let t = Zo(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Zo(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: Zo(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var es = /* @__PURE__ */ new Set(), W = M.read().purchaseOrders;
M.onRollback(() => {
	W = M.read().purchaseOrders;
});
function ts() {
	try {
		M.update("purchaseOrders", W);
	} catch (e) {
		throw W = M.read().purchaseOrders, e;
	}
	es.forEach((e) => M.notify(e));
}
function ns(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function rs(e) {
	return pe("PO", W.map((e) => e.purchaseOrderNumber), e.slice(0, 4));
}
function is(e) {
	return e?.trim() || void 0;
}
function as(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = Et.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let n = t.units.find((t) => t.id === e.unitId);
		if (!n) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!n.active) throw Error(`${n.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		if (Ki(e.productId, e.unitId, e.orderedQuantity, "buy"), t.buyEnabled === !1) throw Error("Product is not available for purchasing.");
		let r = t.taxCode ?? _().gstCode, i = se(r), a = Qo({
			taxRate: i,
			inclusiveLineTotal: (e.priceBasis ?? _().basis) === "Inclusive" ? Math.round(e.orderedQuantity * e.unitCost * 100) / 100 : void 0,
			orderedQuantity: e.orderedQuantity,
			unitCost: ae(e.unitCost, i, e.priceBasis)
		});
		return {
			id: ns("pol"),
			...v(r),
			grossUnitCost: (e.priceBasis ?? _().basis) === "Inclusive" ? e.unitCost : void 0,
			productId: t.id,
			unitId: n.id,
			sku: t.sku,
			description: t.name,
			unitSymbol: n.symbol,
			orderedQuantity: e.orderedQuantity,
			receivedQuantity: 0,
			billedQuantity: 0,
			unitCost: ae(e.unitCost, i, e.priceBasis),
			...a
		};
	});
}
function os(e) {
	let t = gt.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function ss(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var cs = {
	subscribe(e) {
		return es.add(e), () => {
			es.delete(e);
		};
	},
	getSnapshot() {
		return ne(W);
	},
	getAll() {
		return ne(W);
	},
	getById(e) {
		return ne(W).find((t) => t.id === e);
	},
	getBySupplier(e) {
		return ne(W).filter((t) => t.supplierId === e);
	},
	create(e) {
		ss(e);
		let t = os(e.supplierId), n = as(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: ns("po"),
			purchaseOrderNumber: rs(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: is(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: is(e.supplierReference),
			notes: is(e.notes),
			lines: n,
			totals: $o(n),
			createdAt: r,
			updatedAt: r
		};
		return W = [i, ...W], ts(), i;
	},
	updateDraft(e, t) {
		let n = cs.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		ss(t);
		let r = os(t.supplierId), i = as(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: is(t.expectedDeliveryDate),
			supplierReference: is(t.supplierReference),
			notes: is(t.notes),
			lines: i,
			totals: $o(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return W = W.map((e) => e.id === n.id ? a : e), ts(), a;
	},
	approve(e) {
		let t = cs.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return ls(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = cs.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return ls(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = cs.getById(e);
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
		return W = W.map((e) => e.id === n.id ? o : e), ts(), o;
	},
	recordSupplierBill(e, t) {
		let n = cs.getById(e);
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
			let n = us(e.billedQuantity + t);
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
		return W = W.map((e) => e.id === n.id ? c : e), ts(), c;
	},
	reverseSupplierBill(e, t) {
		let n = cs.getById(e);
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
				billedQuantity: us(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return W = W.map((e) => e.id === n.id ? c : e), ts(), c;
	},
	cancel(e, t) {
		let n = cs.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return ls(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function ls(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return W = W.map((t) => t.id === e.id ? n : t), ts(), n;
}
function us(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
y("purchaseOrders", {
	repository: cs,
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
	snapshot: () => ({ purchaseOrders: W }),
	restore: (e) => {
		W = e.purchaseOrders;
	},
	publish: () => es.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function G(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function ds(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function fs(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ps({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return ds(e / t);
}
function ms({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return fs(e * t);
}
function hs({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = G(e + n), a = fs(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : ds(a / i)
	};
}
function gs({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return fs(e * t);
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function _s(e) {
	return fs(e.lines.reduce((e, t) => {
		let n = ps({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + ms({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function vs(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ys(e) {
	return P.requireBySystemRole(e).id;
}
function bs(e) {
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
function xs(e, t) {
	return F.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function Ss(e, t) {
	let n = xs(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var Cs = {
	validateGoodsReceiptPosting(e) {
		let t = P.requireBySystemRole("INVENTORY"), n = P.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = _s(e);
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
		let t = F.getBySource("GOODS_RECEIPT", e.id).find((e) => !e.reversedJournalEntryId);
		if (t) return t;
		let { inventoryAccountId: n, grniAccountId: r, receiptValue: i } = this.validateGoodsReceiptPosting(e);
		return F.post({
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
		let n = P.requireBySystemRole("GRNI"), r = P.requireBySystemRole("GST_RECEIVABLE"), i = P.requireBySystemRole("ACCOUNTS_PAYABLE");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI account must be an active liability account.");
		if (!r.active || r.type !== "ASSET") throw Error("GST Receivable must be an active asset account.");
		if (!i.active || i.type !== "LIABILITY") throw Error("Accounts Payable must be an active liability account.");
		if (!Number.isFinite(t) || t < 0) throw Error("Matched receipt value must be a non-negative finite number.");
		let a = vs(e.totals.subtotal - t);
		if (a !== 0) {
			let e = P.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = vs(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = xs("SUPPLIER_BILL", e.id);
		if (n) return n;
		let r = t ?? e.totals.subtotal, { variance: i } = this.validateSupplierBillPosting(e, r);
		return F.post({
			journalDate: e.billDate,
			description: `Supplier bill ${e.billNumber}`,
			reference: e.supplierInvoiceNumber,
			sourceType: "SUPPLIER_BILL",
			sourceId: e.id,
			lines: [
				{
					accountId: ys("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				...To(e.lines, "paid", !0, e.totals.taxAmount),
				...i === 0 ? [] : [{
					accountId: ys("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: ys("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = Ss("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: bs(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = xs("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = Bi.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return F.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: ys("ACCOUNTS_PAYABLE"),
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
		let t = Ss("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: bs(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return xs("SUPPLIER_CREDIT", e.id) || F.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: ys("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				...e.lines.reduce((e, t) => {
					let n = t.expenseAccountId ?? ys("PURCHASE_PRICE_VARIANCE"), r = e.find((e) => e.accountId === n);
					return r ? r.credit = Math.round((r.credit + t.lineSubtotal) * 100) / 100 : t.lineSubtotal && e.push({
						accountId: n,
						debit: 0,
						credit: t.lineSubtotal
					}), e;
				}, []),
				...To(e.lines, "paid", !1, e.totals.taxAmount)
			]
		});
	},
	reverseSupplierCredit(e) {
		for (let t of F.getBySource("SUPPLIER_CREDIT_RECLASS", e.id).filter((e) => e.status === "POSTED")) F.reverse({
			journalEntryId: t.id,
			reversalDate: bs(e.voidedAt),
			reason: e.voidReason ?? "Credit void"
		});
		let t = Ss("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? F.getById(t.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: t.id,
			reversalDate: bs(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, ws = structuredClone([{
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
}]), Ts = {
	getAll() {
		return ws;
	},
	getById(e) {
		return ws.find((t) => t.id === e);
	},
	getActive() {
		return ws.filter((e) => e.status === "ACTIVE");
	}
}, Es = /* @__PURE__ */ new Set(), Ds = [];
function Os() {
	Es.forEach((e) => e());
}
function ks() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Ds.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var As = {
	subscribe(e) {
		return Es.add(e), () => {
			Es.delete(e);
		};
	},
	getSnapshot() {
		return Ds;
	},
	getAll() {
		return Ds;
	},
	getByReference(e, t) {
		return Ds.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return Ds.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return Ds.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: ks(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ds = [t, ...Ds], Os(), t;
	}
};
y("inventoryMovements", {
	repository: As,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: Ds }),
	restore: (e) => {
		Ds = e.movements;
	},
	publish: () => Es.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var js = /* @__PURE__ */ new Set(), Ms = [];
function Ns() {
	js.forEach((e) => e());
}
var Ps = {
	subscribe(e) {
		return js.add(e), () => {
			js.delete(e);
		};
	},
	getSnapshot() {
		return Ms;
	},
	getAll() {
		return Ms;
	},
	getBalance(e, t) {
		return Ms.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = Ps.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return Ms = Ms.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? Ms.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...Ms], Ns(), e;
	},
	replaceAll(e) {
		Ms = e, Ns();
	},
	clear() {
		Ms = [], Ns();
	}
};
y("costBalances", {
	repository: Ps,
	read: "inventory.cost.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: Ms }),
	restore: (e) => {
		Ms = e.balances;
	},
	publish: () => js.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var Fs = /* @__PURE__ */ new Set(), Is = [];
function Ls() {
	Fs.forEach((e) => e());
}
function Rs() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Is.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function zs(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var Bs = {
	subscribe(e) {
		return Fs.add(e), () => {
			Fs.delete(e);
		};
	},
	getSnapshot() {
		return Is;
	},
	getAll() {
		return Is;
	},
	getByReference(e, t) {
		return Is.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return Is.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return Is.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return Is.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return zs(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: Rs(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = Bs.build(e);
		return Is = [t, ...Is], Ls(), t;
	},
	replaceAll(e) {
		Is = e, Ls();
	},
	clear() {
		Is = [], Ls();
	}
};
y("costMovements", {
	repository: Bs,
	read: "inventory.cost.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: Is }),
	restore: (e) => {
		Is = e.movements;
	},
	publish: () => Fs.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function Vs(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function Hs(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function Us(e, t) {
	let n = O(e);
	if (!n) throw Error("Product was not found.");
	if (!xt(n)) throw Error("Non-stock/service items cannot move inventory value.");
	let r = Mt.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = Dt(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function Ws(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = fs(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(fs(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function Gs(e) {
	if (e && Bs.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function Ks({ movement: e, balance: t }) {
	let n = Bs.getAll(), r = Ps.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	Bs.replaceAll(i), Ps.replaceAll(a);
}
function qs(e) {
	if (Vs(e.quantity), Hs(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	Gs(e.inventoryMovementId);
	let { policy: t, unit: n } = Us(e.productId, e.unitId), r = G(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = ps({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = ms({
		quantityBase: r,
		unitCostBase: i
	}), o = Ps.getBalance(e.siteId, e.productId);
	o && Ws(o, t.baseUnitId);
	let s = hs({
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
	Ws(l, t.baseUnitId);
	let u = Bs.build({
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
	return Ks({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function Js(e) {
	Vs(e.quantity), Hs(e.occurredAt), Gs(e.inventoryMovementId);
	let { policy: t, unit: n } = Us(e.productId, e.unitId), r = G(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = Ps.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (Ws(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = ds(i.averageCostPerBaseUnit), o = gs({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = G(i.quantityOnHand - r), c = s === 0, l = fs(c ? -i.inventoryValue : -o), u = c ? 0 : fs(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : ds(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	Ws(p, t.baseUnitId);
	let m = Bs.build({
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
	return Ks({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function Ys(e) {
	if (Vs(e.quantityBase), Hs(e.occurredAt), Gs(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = O(e.productId);
	if (!t) throw Error("Product was not found.");
	if (!xt(t)) throw Error("Non-stock/service items cannot restore inventory value.");
	let n = Mt.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = G(e.quantityBase), i = ds(e.unitCostBase), a = fs(e.inventoryValue), o = Ps.getBalance(e.siteId, e.productId);
	o && Ws(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = G(s + r), u = fs(c + a), d = l === 0 ? 0 : ds(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	Ws(p, n.baseUnitId);
	let m = Bs.build({
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
	return Ks({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var Xs = /* @__PURE__ */ new Set(), Zs = [];
function Qs() {
	Xs.forEach((e) => e());
}
function $s(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var ec = {
	subscribe(e) {
		return Xs.add(e), () => {
			Xs.delete(e);
		};
	},
	getSnapshot() {
		return Zs;
	},
	getAll() {
		return Zs;
	},
	getBalance(e, t) {
		return Zs.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = ec.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: $s(i.quantityOnHand + r),
				updatedAt: a
			};
			return Zs = Zs.map((r) => r.siteId === e && r.productId === t ? n : r), Qs(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: $s(r),
			updatedAt: a
		};
		return Zs = [o, ...Zs], Qs(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = ec.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = $s(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Zs = Zs.map((n) => n.siteId === e && n.productId === t ? o : n), Qs(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of As.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: $s((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		Zs = Array.from(e.values()), Qs();
	}
};
y("stock", {
	repository: ec,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: Zs }),
	restore: (e) => {
		Zs = e.balances;
	},
	publish: () => Xs.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/goodsReceiptRepository.ts
var tc = /* @__PURE__ */ new Set(), nc = M.read().goodsReceipts;
M.onRollback(() => {
	nc = M.read().goodsReceipts;
});
function rc() {
	try {
		M.update("goodsReceipts", nc);
	} catch (e) {
		throw nc = M.read().goodsReceipts, e;
	}
	tc.forEach((e) => M.notify(e));
}
function ic(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function ac(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = nc.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function oc(e) {
	return e?.trim() || void 0;
}
var sc = {
	subscribe(e) {
		return tc.add(e), () => {
			tc.delete(e);
		};
	},
	getSnapshot() {
		return nc;
	},
	getAll() {
		return nc;
	},
	getById(e) {
		return nc.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return nc.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = cs.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = Ts.getById(e.siteId);
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
			let r = ic(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!O(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = Dt(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = ic(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: ac(e.receiptDate),
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
			supplierDeliveryReference: oc(e.supplierDeliveryReference),
			notes: oc(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		Cs.validateGoodsReceiptPosting(s), R();
		let c = L.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return L.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = O(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				L.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = As.create({
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
				}), L.runStep(c, `COST:${r.id}`, () => {
					let t = l.get(r.id);
					if (!t) throw Error(`Missing inventory movement for ${r.id}`);
					qs({
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
				}), L.runStep(c, `STOCK:${r.id}`, () => {
					ec.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			L.runStep(c, "JOURNAL", () => {
				Cs.postGoodsReceipt(s);
			}), L.runStep(c, "PURCHASE_ORDER", () => {
				cs.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), L.runStep(c, "RECEIPT", () => {
				nc = [s, ...nc], rc();
			});
		}), L.recover(c), s;
	}
};
y("goodsReceipts", {
	repository: sc,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: nc }),
	restore: (e) => {
		nc = e.goodsReceipts;
	},
	publish: () => tc.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var cc = 1e-4;
function lc(e) {
	return fs(e);
}
function uc(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - G(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function dc(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function fc(e, t, n) {
	let r = ps({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return ms({
		quantityBase: G(e * n),
		unitCostBase: r
	});
}
function pc(e, t, n) {
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
function mc(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = pc(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), uc(e.quantity), dc(e.billUnitCost);
		let r = G(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > cc);
		if (G(d.reduce((e, t) => e + t.availableQuantity, 0)) + cc < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= cc) break;
			let s = G(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = G(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = ms({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: ps({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = lc(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), h = Math.abs(o.availableQuantity - s) <= cc ? lc(p - m) : fc(s, o.receiptUnitCost, o.conversionToBase);
			if (h < 0) throw Error("Receipt cost has been overallocated.");
			let ee = lc(s * e.billUnitCost), g = lc(ee - h);
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
				matchedBillValue: ee,
				priceVariance: g,
				status: "ACTIVE",
				createdAt: l
			}), o.availableQuantity = G(o.availableQuantity - s), r = G(r - s);
		}
		if (r > cc) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = lc(lc(e.quantity * e.billUnitCost) - lc(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = lc(p.matchedBillValue + f), p.priceVariance = lc(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = G(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = G(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = lc(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = lc(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: lc(p - f)
	};
}
var hc = {
	calculate: mc,
	getAvailableReceiptLines(e, t, n) {
		return pc(e, t, n);
	}
}, gc = M.read().receiptMatches;
M.onRollback(() => {
	gc = M.read().receiptMatches;
});
var _c = /* @__PURE__ */ new Set(), vc = () => {
	try {
		M.update("receiptMatches", gc);
	} catch (e) {
		throw gc = M.read().receiptMatches, e;
	}
	_c.forEach((e) => M.notify(e));
}, yc = {
	getAll() {
		return [...gc];
	},
	subscribe(e) {
		return _c.add(e), () => {
			_c.delete(e);
		};
	},
	getSnapshot() {
		return gc;
	},
	getByBill(e) {
		return gc.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (gc.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		gc = [...gc, ...t], vc();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		gc = gc.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), vc();
	}
};
y("receiptMatches", {
	repository: yc,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: gc }),
	restore: (e) => {
		gc = e.matches;
	},
	publish: () => _c.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
function bc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function xc({ quantity: e, unitCost: t, inclusiveLineTotal: n, taxRate: r = .1 }) {
	let i = bc(e * t), a = bc(n === void 0 ? i * r : n - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: bc(i + a)
	};
}
function Sc(e) {
	let t = bc(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = bc(e.reduce((e, t) => e + t.taxAmount, 0)), r = bc(t + n);
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
var Cc = /* @__PURE__ */ new Set(), K = M.read().supplierBills;
M.onRollback(() => {
	K = M.read().supplierBills;
});
function wc() {
	try {
		M.update("supplierBills", K);
	} catch (e) {
		throw K = M.read().supplierBills, e;
	}
	Cc.forEach((e) => M.notify(e));
}
function Tc(e) {
	return e?.trim() || void 0;
}
function Ec(e) {
	return pe("BILL", K.map((e) => e.billNumber), e.slice(0, 4));
}
var Dc = {
	insertExpenseBill(e) {
		let t = K.find((t) => t.managedDraftId === e.managedDraftId);
		if (t) return t;
		if (K.some((t) => t.supplierId === e.supplierId && t.supplierInvoiceNumber.toLowerCase() === e.supplierInvoiceNumber.toLowerCase() && t.status !== "VOID")) throw Error("Supplier invoice reference already exists.");
		return K = [e, ...K], wc(), e;
	},
	subscribe(e) {
		return Cc.add(e), () => {
			Cc.delete(e);
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
		let r = kc(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = kc(n.totals.amountPaid + r), a = kc(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((t) => t.id === e ? o : t), wc(), o;
	},
	reversePayment(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = kc(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = kc(Math.max(0, n.totals.amountPaid - r)), a = kc(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((t) => t.id === e ? o : t), wc(), o;
	},
	applyCredit(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = kc(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = kc(n.totals.amountCredited + r), a = kc(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((t) => t.id === e ? o : t), wc(), o;
	},
	reverseCredit(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = kc(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = kc(Math.max(0, n.totals.amountCredited - r)), a = kc(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return K = K.map((t) => t.id === e ? o : t), wc(), o;
	},
	markVoid(e, t) {
		let n = K.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("This supplier bill has already been voided.");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required.");
		if (n.status !== "OPEN" || n.totals.amountPaid > 0 || n.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if ((_e().supplierCredits?.supplierCredits ?? M.read().supplierCredits).some((e) => e.sourceSupplierBillId === n.id && e.status !== "VOID")) throw Error("Reverse source supplier credits and linked physical returns before voiding the bill.");
		if (n.kind === "EXPENSE") {
			R();
			let e = (/* @__PURE__ */ new Date()).toISOString(), t = {
				...n,
				status: "VOID",
				voidedAt: e,
				voidReason: r,
				updatedAt: e
			};
			return Cs.reverseSupplierBill(t), K = K.map((e) => e.id === n.id ? t : e), wc(), t;
		}
		if (yc.getByBill(n.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		};
		R();
		let o = L.begin("SUPPLIER_BILL_VOID", n.id).key;
		return L.registerRecovery(o, () => {
			L.runStep(o, "REVERSAL_JOURNAL", () => {
				Cs.reverseSupplierBill(a);
			}), L.runStep(o, "PURCHASE_ORDER", () => {
				cs.reverseSupplierBill(n.purchaseOrderId, n.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), L.runStep(o, "MATCHES", () => {
				yc.reverseForBill(n.id, r, x(i));
			}), L.runStep(o, "BILL", () => {
				K = K.map((e) => e.id === n.id ? a : e), wc();
			});
		}), L.recover(o), a;
	},
	getByPurchaseOrder(e) {
		return K.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = cs.getById(e.purchaseOrderId);
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
			let r = Oc(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = xc({
				taxRate: a,
				quantity: e.quantity,
				unitCost: e.unitCost
			});
			return n.grossUnitCost !== void 0 && e.unitCost === n.unitCost && (o.taxAmount = kc(e.quantity * n.grossUnitCost - o.lineSubtotal), o.lineTotal = kc(o.lineSubtotal + o.taxAmount)), {
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
		}), o = Sc(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: Ec(e.billDate),
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
			notes: Tc(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = hc.calculate({
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
			receipts: sc.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: yc.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		Cs.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), R();
		let u = L.begin("SUPPLIER_BILL", c.id).key;
		return L.registerRecovery(u, () => {
			L.runStep(u, "JOURNAL", () => {
				Cs.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), L.runStep(u, "PURCHASE_ORDER", () => {
				cs.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), L.runStep(u, "MATCHES", () => {
				yc.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), L.runStep(u, "BILL", () => {
				K = [c, ...K], wc();
			});
		}), L.recover(u), c;
	}
};
function Oc(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function kc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
y("supplierBills", {
	repository: Dc,
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
	publish: () => Cc.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var Ac = /* @__PURE__ */ new Set(), q = M.read().supplierCredits, jc = M.read().supplierCreditAllocations, Mc = M.read().supplierCredits, Nc = M.read().supplierCreditAllocations;
M.onRollback(() => {
	q = M.read().supplierCredits, jc = M.read().supplierCreditAllocations, Mc = q, Nc = jc;
});
function Pc() {
	M.update("supplierCredits", q), M.update("supplierCreditAllocations", jc), Mc = [...q], Nc = [...jc], Ac.forEach((e) => M.notify(e));
}
var Fc = !1, J = {
	subscribe(e) {
		return Ac.add(e), () => {
			Ac.delete(e);
		};
	},
	getSnapshot() {
		return Mc;
	},
	getAllocationSnapshot() {
		return Nc;
	},
	getAll() {
		return Mc;
	},
	getAllAllocations() {
		return Nc;
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
		return jc.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return jc.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return jc.filter((t) => t.supplierBillId === e);
	},
	createReturnCredit(e, t) {
		let n = {
			...J.create(e),
			physicalReturnId: t
		};
		return J.update(n), n;
	},
	voidReturnCredit(e) {
		Fc = !0;
		try {
			return J.voidCredit(e);
		} finally {
			Fc = !1;
		}
	},
	create(e) {
		let t = Dc.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (q.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!zc(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, n) => {
			let r = i.get(e.supplierBillLineId);
			if (!r) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(r.id)) throw Error(`${r.description} appears more than once in the supplier credit.`);
			a.add(r.id);
			let o = Vc(e.quantity);
			if (!Number.isFinite(o) || o <= 0) throw Error(`${r.description} credit quantity must be greater than zero.`);
			if (o > r.quantity) throw Error(`${r.description} credit quantity cannot exceed the source bill quantity.`);
			let s = e.unitCost;
			if (!Number.isFinite(s) || s < 0) throw Error(`${r.description} unit cost cannot be negative.`);
			if (s > r.unitCost + 1e-8) throw Error(`${r.description} credit unit cost cannot exceed the source bill unit cost.`);
			let c = q.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.supplierBillLineId === r.id), l = Math.abs(s - r.unitCost) < 1e-8, u = c.every((e) => Math.abs(e.unitCost - r.unitCost) < 1e-8), d = l && u && Math.abs(o + c.reduce((e, t) => e + t.quantity, 0) - r.quantity) < 1e-8, f = c.reduce((e, t) => e + t.lineSubtotal, 0), p = c.reduce((e, t) => e + t.taxAmount, 0), m = Bc(d ? r.lineSubtotal - f : l ? r.lineSubtotal * o / r.quantity : o * s), h = Bc(d ? r.taxAmount - p : r.unitCost ? r.taxAmount * o / r.quantity * s / r.unitCost : 0);
			if (m < 0 || h < 0 || Bc(m + f) > r.lineSubtotal || Bc(h + p) > r.taxAmount) throw Error("Credit line value exceeds the uncredited source bill line.");
			let ee = Bc(m + h);
			return {
				id: Rc(`supplier-credit-line-${n + 1}`),
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
				lineTotal: ee
			};
		}), s = Bc(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = Bc(o.reduce((e, t) => e + t.taxAmount, 0)), l = Bc(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (Bc(Bc(q.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > Bc(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: Rc("supplier-credit"),
			creditNumber: Lc(e.creditDate),
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
		return q = [d, ...q], Pc(), Cs.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = q.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = Dc.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!zc(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = Bc(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: Rc("supplier-credit-allocation"),
			allocationNumber: Ic(e.allocationDate),
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
		Dc.applyCredit(n.id, r);
		let o = Bc(t.amountApplied + r), s = Bc(Math.max(0, t.totals.total - (t.amountRefunded ?? 0) - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return jc = [a, ...jc], q = q.map((e) => e.id === t.id ? c : e), Pc(), a;
	},
	reverseAllocation(e) {
		let t = jc.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = q.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = Dc.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		Dc.reverseCredit(i.id, t.amount);
		let o = Bc(Math.max(0, r.amountApplied - t.amount)), s = Bc(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - o)), c = {
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
		return q = q.map((e) => e.id === r.id ? c : e), jc = jc.map((e) => e.id === t.id ? l : e), Pc(), l;
	},
	voidCredit(e) {
		let t = q.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		if (t.physicalReturnId && !Fc) throw Error("Reverse the linked physical supplier return instead of voiding its credit separately.");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse supplier refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (jc.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: Fc && e.voidDate ? e.voidDate : r,
			voidReason: n,
			updatedAt: r
		};
		return q = q.map((e) => e.id === t.id ? i : e), Pc(), Cs.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!jc.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return jc = jc.map((t) => t.id === e.id ? e : t), Pc(), e;
	},
	update(e) {
		if (!q.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return q = q.map((t) => t.id === e.id ? e : t), Pc(), e;
	}
};
function Ic(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = jc.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Lc(e) {
	return pe("SC", q.map((e) => e.creditNumber), e.slice(0, 4));
}
function Rc(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function zc(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function Bc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Vc(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var Hc = J.create;
J.create = function(...e) {
	return R(), M.transaction(() => Hc.apply(J, e));
};
var Uc = J.applyToBill;
J.applyToBill = function(...e) {
	return R(), M.transaction(() => Uc.apply(J, e));
};
var Wc = J.reverseAllocation;
J.reverseAllocation = function(...e) {
	return R(), M.transaction(() => Wc.apply(J, e));
};
var Gc = J.voidCredit;
J.voidCredit = function(...e) {
	return R(), M.transaction(() => Gc.apply(J, e));
};
var Kc = J.update;
J.update = function(...e) {
	return R(), M.transaction(() => Kc.apply(J, e));
};
var qc = J.updateAllocation;
J.updateAllocation = function(...e) {
	return R(), M.transaction(() => qc.apply(J, e));
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
		allocations: jc
	}),
	restore: (e) => {
		q = e.supplierCredits, jc = e.allocations, Mc = [...q], Nc = [...jc];
	},
	publish: () => Ac.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/profitAndLossService.ts
function Jc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Yc(e, t) {
	C(e, t);
}
function Xc(e, t, n, r) {
	if (Yc(n, "From date"), Yc(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = t.filter((e) => e.journalDate >= n && e.journalDate <= r), a = Zc(e.filter((e) => e.type === "REVENUE"), i, "REVENUE"), o = Zc(e.filter((e) => e.type === "EXPENSE"), i, "EXPENSE"), s = Jc(a.reduce((e, t) => e + t.amount, 0)), c = Jc(o.reduce((e, t) => e + t.amount, 0)), l = e.find((e) => e.systemRole === "SALES_REVENUE");
	if (!l) throw Error("Sales Revenue system account was not found.");
	if (l.type !== "REVENUE") throw Error("Sales Revenue system account must be a revenue account.");
	let u = e.find((e) => e.systemRole === "COST_OF_GOODS_SOLD");
	if (!u) throw Error("Cost of Goods Sold system account was not found.");
	if (u.type !== "EXPENSE") throw Error("Cost of Goods Sold system account must be an expense account.");
	let d = Jc(a.find((e) => e.accountId === l.id)?.amount ?? 0), f = Jc(o.find((e) => e.accountId === u.id)?.amount ?? 0), p = Jc(d - f);
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
		operatingExpenses: Jc(c - f),
		totalExpenses: c,
		netProfit: Jc(s - c)
	};
}
function Zc(e, t, n) {
	return e.map((e) => {
		let r = 0, i = 0;
		for (let n of t) for (let t of n.lines) t.accountId === e.id && (r = Jc(r + t.debit), i = Jc(i + t.credit));
		let a = Jc(n === "REVENUE" ? i - r : r - i);
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
function Qc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function $c(e) {
	C(e);
}
function el(e, t) {
	let n = 0, r = 0;
	for (let i of t) for (let t of i.lines) t.accountId === e.id && (n = Qc(n + t.debit), r = Qc(r + t.credit));
	return e.type === "ASSET" || e.type === "EXPENSE" ? Qc(n - r) : Qc(r - n);
}
function tl(e, t, n) {
	return e.filter((e) => e.type === n).map((e) => ({
		accountId: e.id,
		accountCode: e.code,
		accountName: e.name,
		amount: el(e, t)
	})).filter((e) => e.amount !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 }));
}
function nl(e) {
	return Qc(e.reduce((e, t) => e + t.amount, 0));
}
function rl(e, t, n) {
	$c(n);
	let r = t.filter((e) => e.journalDate <= n), i = tl(e, r, "ASSET"), a = tl(e, r, "LIABILITY"), o = tl(e, r, "EQUITY"), s = e.filter((e) => e.type === "REVENUE"), c = e.filter((e) => e.type === "EXPENSE"), l = Qc(s.reduce((e, t) => e + el(t, r), 0)), u = Qc(c.reduce((e, t) => e + el(t, r), 0)), d = nl(i), f = nl(a), p = nl(o), m = Qc(l - u), h = Qc(p + m), ee = Qc(f + h), g = Qc(d - ee);
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
		totalLiabilitiesAndEquity: ee,
		difference: g,
		balanced: g === 0
	};
}
//#endregion
//#region src/features/accounting/data/trialBalanceService.ts
function il(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function al(e, t) {
	C(e, t);
}
function ol(e, t) {
	let n = il(e - t);
	return n >= 0 ? {
		debit: n,
		credit: 0
	} : {
		debit: 0,
		credit: il(Math.abs(n))
	};
}
function sl(e, t, n, r) {
	if (al(n, "From date"), al(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = e.map((e) => {
		let i = 0, a = 0, o = 0, s = 0;
		for (let c of t) for (let t of c.lines) if (t.accountId === e.id) {
			if (c.journalDate < n) {
				i = il(i + t.debit), a = il(a + t.credit);
				continue;
			}
			c.journalDate <= r && (o = il(o + t.debit), s = il(s + t.credit));
		}
		let c = ol(i, a), l = ol(il(i + o), il(a + s));
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
	}).filter((e) => e.openingDebit !== 0 || e.openingCredit !== 0 || e.periodDebit !== 0 || e.periodCredit !== 0 || e.closingDebit !== 0 || e.closingCredit !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 })), a = il(i.reduce((e, t) => e + t.openingDebit, 0)), o = il(i.reduce((e, t) => e + t.openingCredit, 0)), s = il(i.reduce((e, t) => e + t.periodDebit, 0)), c = il(i.reduce((e, t) => e + t.periodCredit, 0)), l = il(i.reduce((e, t) => e + t.closingDebit, 0)), u = il(i.reduce((e, t) => e + t.closingCredit, 0)), d = il(l - u);
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
function cl(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ll(e, t) {
	C(e, t);
}
function ul(e, t, n) {
	ll(e.openingBalanceDate, "Opening balance date"), ll(n, "As-at date");
	let r = t.filter((t) => t.journalDate >= e.openingBalanceDate && t.journalDate <= n).flatMap((t) => t.lines.filter((t) => t.accountId === e.glAccountId).map((e) => ({
		entry: t,
		line: e
	}))).sort((e, t) => {
		let n = e.entry.journalDate.localeCompare(t.entry.journalDate);
		if (n !== 0) return n;
		let r = e.entry.createdAt.localeCompare(t.entry.createdAt);
		return r === 0 ? e.line.id.localeCompare(t.line.id) : r;
	}), i = cl(e.openingBalance), a = 0, o = 0, s = r.map(({ entry: t, line: n }) => {
		let r = cl(n.debit), s = cl(n.credit);
		return a = cl(a + r), o = cl(o + s), i = cl(i + r - s), {
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
		openingBalance: cl(e.openingBalance),
		moneyIn: a,
		moneyOut: o,
		closingBalance: i,
		transactionCount: s.length,
		transactions: s
	};
}
//#endregion
//#region src/features/cash-reports/cashReportService.ts
var dl = [
	"Customer receipts & reversals",
	"Customer refunds & reversals",
	"Supplier payments & reversals",
	"Supplier refunds & reversals",
	"Bank opening adjustments",
	"Transfers across selection",
	"Other bank movements / review"
], fl = (e) => Math.round(e * 100), pl = (e) => e / 100;
function ml(e) {
	switch (e.sourceType) {
		case "CUSTOMER_PAYMENT":
		case "CUSTOMER_PAYMENT_REVERSAL": return dl[0];
		case "CUSTOMER_REFUND": return dl[1];
		case "SUPPLIER_PAYMENT":
		case "SUPPLIER_PAYMENT_REVERSAL": return dl[2];
		case "SUPPLIER_REFUND": return dl[3];
		case "OPENING_BALANCE": return dl[4];
		case "BANK_TRANSFER": return dl[5];
		default: return dl[6];
	}
}
function hl(e) {
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
		let n = ul(t, e.journalEntries, e.to), o = t.openingBalanceDate < e.from ? fl(t.openingBalance) : 0, s = 0, c = 0;
		if (t.openingBalanceDate >= e.from && t.openingBalance !== 0) {
			let e = fl(t.openingBalance);
			a.push({
				id: `setup:${t.id}`,
				bankId: t.id,
				bankName: t.name,
				date: t.openingBalanceDate,
				description: "Bank setup opening balance (not a cash receipt)",
				sourceType: "BANK_SETUP",
				category: dl[4],
				moneyIn: pl(Math.max(e, 0)),
				moneyOut: pl(Math.max(-e, 0))
			}), s += Math.max(e, 0), c += Math.max(-e, 0);
		}
		for (let i of n.transactions) {
			if (i.transactionDate < e.from) {
				o += fl(i.moneyIn) - fl(i.moneyOut);
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
				category: ml(n),
				moneyIn: i.moneyIn,
				moneyOut: i.moneyOut
			}), s += fl(i.moneyIn), c += fl(i.moneyOut);
		}
		let l = fl(n.closingBalance);
		return {
			bankId: t.id,
			name: t.name,
			active: t.active,
			opening: pl(o),
			moneyIn: pl(s),
			moneyOut: pl(c),
			closing: pl(l),
			difference: pl(o + s - c - l)
		};
	}), s = new Map(dl.map((e) => [e, {
		category: e,
		moneyIn: 0,
		moneyOut: 0,
		net: 0
	}])), c = /* @__PURE__ */ new Map();
	for (let e of a) {
		if (e.category === dl[5]) {
			let t = e.journalId;
			c.set(t, (c.get(t) ?? 0) + fl(e.moneyIn) - fl(e.moneyOut));
			continue;
		}
		let t = s.get(e.category);
		t.moneyIn += fl(e.moneyIn), t.moneyOut += fl(e.moneyOut);
	}
	for (let e of c.values()) {
		let t = s.get(dl[5]);
		t.moneyIn += Math.max(e, 0), t.moneyOut += Math.max(-e, 0);
	}
	let l = [...s.values()].map((e) => ({
		category: e.category,
		moneyIn: pl(e.moneyIn),
		moneyOut: pl(e.moneyOut),
		net: pl(e.moneyIn - e.moneyOut)
	})), u = (e) => pl(o.reduce((t, n) => t + fl(n[e]), 0)), d = u("opening"), f = u("closing"), p = pl(l.reduce((e, t) => e + fl(t.net), 0)), m = a.filter((e) => e.category === dl[6]).length;
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
		difference: pl(fl(d) + fl(p) - fl(f))
	};
}
//#endregion
//#region src/features/net-analysis/netAnalysisService.ts
var gl = (e) => Math.round(e * 100);
function _l(e) {
	for (let t of [
		e.subtotal,
		e.tax,
		e.total
	]) if (!Number.isFinite(t) || t < 0 || Math.abs(t * 100 - gl(t)) > 1e-6) throw Error(`${e.number}: invalid saved monetary totals.`);
	if (gl(e.subtotal) + gl(e.tax) !== gl(e.total)) throw Error(`${e.number}: saved net, tax and gross do not reconcile.`);
}
function vl(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) {
		if (r.status === "DRAFT" || r.openingBalanceImportId) continue;
		let e = `${r.kind}:${r.id}`;
		if (t.has(e)) throw Error(`Duplicate analysis source: ${r.number}.`);
		t.add(e), C(r.date, `Document date (${r.number})`), _l(r);
		let i = r.kind === "CUSTOMER_CREDIT" || r.kind === "SUPPLIER_CREDIT", a = i ? -1 : 1, { voidedAt: o, openingBalanceImportId: s, ...c } = r, l = (t, n, i) => ({
			...c,
			date: t,
			eventId: `${e}:${i}`,
			event: i,
			subtotal: gl(r.subtotal) * n / 100,
			tax: gl(r.tax) * n / 100,
			total: gl(r.total) * n / 100
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
function yl(e, t) {
	if (C(t.from, "From date"), C(t.to, "To date"), t.from > t.to) throw Error("From date must not exceed To date.");
	let n = t.query?.trim().toLowerCase() ?? "", r = vl(e).filter((e) => e.date >= t.from && e.date <= t.to && (!t.partyId || e.partyId === t.partyId) && (!t.event || t.event === "ALL" || e.event === t.event) && `${e.number} ${e.partyName} ${e.partyId} ${e.kind}`.toLowerCase().includes(n)), i = (e, t) => e.reduce((e, n) => e + gl(n[t]), 0) / 100, a = {
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
function bl(e, t, n) {
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
function xl(e, t) {
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
var Sl = [
	"Profit & loss",
	"Balance sheet",
	"Trial balance",
	"Cash flow",
	"Net sales",
	"Net purchases"
];
function Cl(e) {
	let t = e.split(",").map((e) => e.trim());
	if (!t.length || t.length > Sl.length || t.some((e) => !e)) throw Error("Select one to six supported reports.");
	let n = t.map((e) => Sl.find((t) => t.toLowerCase() === e.toLowerCase()));
	if (n.some((e) => !e)) throw Error(`Supported reports: ${Sl.join(", ")}.`);
	if (new Set(n).size !== n.length) throw Error("Each report may appear only once in a pack.");
	return n;
}
var wl = (e) => JSON.stringify(e);
function Tl(e, t, n) {
	if (C(e.periodStart, "From date"), C(e.periodEnd, "To date"), e.periodStart > e.periodEnd) throw Error("From date must not exceed To date.");
	let r = Cl(e.reports), i = e.periodStart, a = e.periodEnd, o = r.map((e) => {
		if (e === "Profit & loss") {
			let n = Xc(t.accounts, t.journals, i, a);
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
			let n = rl(t.accounts, t.journals, a);
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
			let n = sl(t.accounts, t.journals, i, a);
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
			let n = hl({
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
		let n = e === "Net purchases", r = yl(n ? xl(t.bills, t.supplierCredits) : bl(t.documents, t.customerCredits, t.customers), {
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
		sourceSignature: wl(t),
		sections: o
	});
}
//#endregion
//#region src/features/report-packs/reportPackCommand.ts
function El() {
	let e = _();
	return {
		accounts: P.getAll(),
		journals: F.getAll(),
		banks: Bi.getAll(),
		documents: U.getAll(),
		customerCredits: z.getAll(),
		customers: D.getAll().map((e) => ({
			id: e.id,
			businessName: e.businessName
		})),
		bills: Dc.getAll(),
		supplierCredits: J.getAll(),
		company: {
			name: e.companyName,
			currency: e.currency,
			timezone: e.timezone
		}
	};
}
function Dl(e) {
	let t = T.require("accounting.read"), n = w({
		id: g().trim().min(1).max(200),
		expectedRevision: g().regex(/^\d+$/)
	}).strict().parse(e), r = S["report-packs"]?.find((e) => e.id === n.id);
	if (!r) throw Error("Report pack configuration was not found.");
	if (r.revision !== n.expectedRevision) throw Error("Report pack changed. Reload before generating.");
	if (r.status !== "Active") throw Error("Activate this report pack before generating.");
	return Tl({
		id: r.id,
		revision: r.revision,
		name: r.name,
		cover: r.cover,
		introduction: r.introduction,
		periodStart: r.periodStart,
		periodEnd: r.periodEnd,
		reports: r.reports
	}, El(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: t.userId
	});
}
//#endregion
//#region src/features/saved-reports/savedReportService.ts
var Ol = [
	"Sales",
	"Purchases",
	"Banking",
	"General ledger"
], Y = (e, t, n = !1) => ({
	key: e,
	label: t,
	numeric: n
}), kl = [
	Y("date", "Date"),
	Y("number", "Document"),
	Y("contact", "Contact"),
	Y("partyId", "Contact ID"),
	Y("activity", "Activity"),
	Y("status", "Current status"),
	Y("net", "Net", !0),
	Y("tax", "Tax", !0),
	Y("gross", "Gross", !0)
], Al = {
	Sales: kl,
	Purchases: kl,
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
}, jl = (e) => e === "Banking" ? "Cash" : "Accrual", Ml = w({
	from: g(),
	to: g(),
	query: g().max(500).default(""),
	partyId: g().max(200).optional(),
	bankId: g().max(200).optional(),
	accountId: g().max(200).optional(),
	currency: g().min(1).max(10).optional()
}).strict();
function Nl(e) {
	let t = f(Ol).parse(e.dataset);
	if (e.basis !== jl(t)) throw Error(`${t} uses ${jl(t)} basis. Cash-basis sales/purchase recognition is not available.`);
	if (e.favourite !== void 0 && !["Yes", "No"].includes(e.favourite)) throw Error("Favourite must be Yes or No.");
	let n;
	try {
		n = JSON.parse(e.filter ?? "");
	} catch {
		throw Error("Legacy filter text is not executable. Edit and save explicit report dates and filters.");
	}
	let r = Ml.parse(n);
	if (C(r.from, "From date"), C(r.to, "To date"), r.from > r.to) throw Error("From date must not exceed To date.");
	if (t !== "Sales" && t !== "Purchases" && r.partyId) throw Error("Contact filters require Sales or Purchases.");
	if (t !== "Banking" && (r.bankId || r.currency)) throw Error("Bank and currency filters require Banking.");
	if (t !== "General ledger" && r.accountId) throw Error("Account filters require General ledger.");
	let i = e.columns.split(",").map((e) => e.trim()), a = t === "Sales" || t === "Purchases" ? {
		customer: "contact",
		supplier: "contact",
		gst: "tax",
		total: "gross"
	} : {}, o = i.map((e) => Al[t].find((t) => t.label.toLowerCase() === e.toLowerCase() || t.key.toLowerCase() === (a[e.toLowerCase()] ?? e.toLowerCase())));
	if (!i.length || i.length > Al[t].length || o.some((e) => !e) || new Set(o.map((e) => e?.key)).size !== o.length) throw Error(`Select distinct supported columns for ${t}: ${Al[t].map((e) => e.label).join(", ")}.`);
	return {
		dataset: t,
		filters: r,
		columns: o
	};
}
var Pl = (e, t) => e.reduce((e, n) => {
	let r = Number(n.values[t]), i = e + Math.round(r * 100);
	if (!Number.isFinite(r) || !Number.isSafeInteger(i)) throw Error("Report monetary total exceeds supported cents precision.");
	return i;
}, 0) / 100;
function Fl(e, t, n) {
	let { dataset: r, filters: i, columns: a } = Nl(e), o = i.query.trim().toLowerCase(), s = [], c = [], l = [], u = t.company.currency;
	if (r === "Sales" || r === "Purchases") {
		let e = r === "Sales" ? bl(t.documents, t.customerCredits, t.customers) : xl(t.bills, t.supplierCredits);
		if (i.partyId && !e.some((e) => e.partyId === i.partyId) && !(r === "Sales" && t.customers.some((e) => e.id === i.partyId))) throw Error("Selected contact is not available in this dataset.");
		let n = {
			DOCUMENT: "Original document",
			CREDIT: "Credit note",
			VOID: "Void reversal"
		};
		s = vl(e).filter((e) => e.date >= i.from && e.date <= i.to && (!i.partyId || e.partyId === i.partyId)).map((e) => ({
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
		let e = hl({
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
		value: Pl(s, t)
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
		sourceSignature: wl(t),
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
function Il(e) {
	let t = T.require("accounting.read"), n = w({
		id: g().trim().min(1).max(200),
		expectedRevision: g().regex(/^\d+$/)
	}).strict().parse(e), r = S["custom-reports"]?.find((e) => e.id === n.id);
	if (!r) throw Error("Saved report was not found.");
	if (r.revision !== n.expectedRevision) throw Error("Saved report changed. Reload before running.");
	if (r.status !== "Active") throw Error("Activate this saved report before running.");
	return Fl({
		id: r.id,
		revision: r.revision,
		name: r.name,
		dataset: r.dataset,
		columns: r.columns,
		basis: r.basis,
		filter: r.filter,
		favourite: r.favourite
	}, El(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: t.userId
	});
}
//#endregion
//#region src/features/business-workspace/workspaceRepository.ts
var Ll = t(g(), g().max(2e4)), Rl = [
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
], zl = () => (/* @__PURE__ */ new Date()).toISOString(), Bl = {
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
}, Vl = /* @__PURE__ */ new Set(), Hl = 0, Ul = () => {
	Hl++, Vl.forEach((e) => e());
}, Wl = Object.fromEntries(Object.keys(Bl).map((e) => [e, []]));
for (let e of Object.keys(Bl)) S[e] = [];
var Gl = () => ({
	collected: P.getAll().find((e) => e.systemRole === "GST_PAYABLE")?.id ?? "",
	paid: P.getAll().find((e) => e.systemRole === "GST_RECEIVABLE")?.id ?? ""
});
S["tax-codes"] = [{
	id: "tax-gst",
	name: "GST",
	status: "Active",
	revision: "1",
	createdAt: zl(),
	updatedAt: zl(),
	code: "GST",
	rate: "10",
	basis: "Exclusive",
	report: "GST",
	...Gl()
}, {
	id: "tax-zero",
	name: "Zero rated",
	status: "Active",
	revision: "1",
	createdAt: zl(),
	updatedAt: zl(),
	code: "ZERO",
	rate: "0",
	basis: "Exclusive",
	report: "Zero rated",
	...Gl()
}];
function Kl(e, t) {
	if (!e?.trim()) throw Error(`${t} is required.`);
}
function ql(e, t) {
	if (!e?.trim() || !Number.isFinite(Number(e)) || Number(e) < 0) throw Error(`${t} must be a non-negative number.`);
}
function Jl(e, t) {
	let n = P.getAll().find((t) => t.id === e);
	if (!n?.active || t && n.type !== t) throw Error("Select an active account of the correct type.");
	return n;
}
function Yl(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && (/* @__PURE__ */ new Date(e + "T00:00:00Z")).toISOString().slice(0, 10) === e;
}
function Xl(e, t, n, r = !0) {
	let i = Bl[e];
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
	Kl(t.name, "Name");
	for (let e of i.required) Kl(t[e], e);
	if (![
		"Active",
		"Inactive",
		"Open",
		"In progress",
		"Completed"
	].includes(t.status ?? "Active")) throw Error("Invalid business status.");
	if (e === "tax-codes") {
		if (ql(t.rate, "Tax rate"), t.basis && !["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid entry basis.");
		if (r) {
			let e = n.find((e) => e.id === t.id), r = _e(), i = S.settings?.find((e) => e.section === "business" && e.status === "Active")?.gstCode ?? "GST";
			if (t.status === "Inactive" && t.code === i) throw Error("The default tax code must remain active. Change the business default first.");
			if (e && e.code !== t.code && (e.code === i || r.products.products.some((t) => (t.taxCode ?? "GST") === e.code) || (S["bank-rules"] ?? []).some((t) => t.taxCode === e.code))) throw Error("A referenced tax code cannot be renamed. Create a new code and update future-use references.");
		}
		if (Number(t.rate) > 100) throw Error("Tax rate cannot exceed 100%.");
		if (r) {
			let e = Jl(t.collected, "LIABILITY"), n = Jl(t.paid, "ASSET"), r = (_e().bankAccounts?.bankAccounts ?? []).map((e) => e.glAccountId);
			if (e.systemRole && e.systemRole !== "GST_PAYABLE" || n.systemRole && n.systemRole !== "GST_RECEIVABLE" || r.includes(n.id)) throw Error("Tax mappings cannot use AR/AP, inventory, GRNI or bank control accounts.");
		}
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Tax code must be unique.");
		if (!/^[A-Z0-9_-]{1,24}$/.test(t.code)) throw Error("Use uppercase letters/numbers for a tax code.");
	}
	if (e === "linked-accounts" && r) {
		let e = P.requireBySystemRole(t.role), n = t.status === "Inactive" ? P.getAll().find((e) => e.systemRole === t.role)?.id : t.accountId, r = _e().journals?.journalEntries ?? [];
		if (n !== e.id && r.some((t) => t.lines.some((t) => t.accountId === e.id || t.accountId === n))) throw Error("A used posting account cannot be remapped without a ledger migration.");
	}
	if (e === "linked-accounts") {
		if (!Rl.includes(t.role)) throw Error("Unknown account role.");
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
		if (r && Jl(t.accountId, e), n.some((e) => e.id !== t.id && e.role === t.role)) throw Error("A linked account role may only have one mapping.");
	}
	if (e === "promotions") {
		let e = O(t.productId);
		if (r && (!e || !Dt(e.id, t.unitId))) throw Error("Product/unit not found.");
		if (ql(t.price, "Price"), !Number.isInteger(Number(t.priority))) throw Error("Priority must be an integer.");
		if (![
			"Customer price first",
			"Promotion first",
			"Lowest eligible price"
		].includes(t.policy)) throw Error("Invalid price conflict policy.");
		if (!/([+-]\d\d:\d\d|Z)$/.test(t.starts) || !Number.isFinite(Date.parse(t.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(t.ends) || !Number.isFinite(Date.parse(t.ends)) || Date.parse(t.ends) <= Date.parse(t.starts)) throw Error("Promotion requires explicit time offsets and an end after start.");
	}
	if (r && t.customerId && !D.getById(t.customerId)) throw Error("Customer was not found.");
	if (e === "jobs") {
		if (ql(t.budget, "Revenue budget"), ql(t.costBudget, "Cost budget"), r) for (let e of ["budget", "costBudget"]) {
			let n = Number(t[e]);
			if (!Number.isSafeInteger(Math.round(n * 100)) || Math.abs(Math.round(n * 100) / 100 - n) > 1e-7) throw Error("Project budgets require safe currency amounts with at most two decimals.");
		}
		if (!Yl(t.starts) || !Yl(t.ends) || t.ends < t.starts) throw Error("Invalid project dates.");
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Job code must be unique.");
	}
	if (e === "tasks") {
		if (r && t.id && (_e().salesVisits?.visits ?? []).some((e) => e.followupTaskId === t.id && e.customerId !== t.customerId)) throw Error("A visit follow-up must retain the visit customer.");
		if (r && ![
			"Open",
			"In progress",
			"Completed"
		].includes(t.status ?? "Open")) throw Error("Task status must be Open, In progress or Completed.");
		if (!Yl(t.due) || ![
			"Low",
			"Normal",
			"High"
		].includes(t.priority)) throw Error("Invalid due date or priority.");
	}
	if (e === "bank-rules") {
		if (r && Jl(t.accountId), ![
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
	if (e === "custom-reports" && r && Nl({
		dataset: t.dataset,
		columns: t.columns,
		basis: t.basis,
		filter: t.filter,
		favourite: t.favourite
	}), e === "report-packs" && r && Cl(t.reports), e === "report-packs" && (!Yl(t.periodStart) || !Yl(t.periodEnd) || t.periodEnd < t.periodStart)) throw Error("Invalid report period.");
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
			]) Kl(t[e], e);
			if (t.status !== "Active") throw Error("Business settings must remain active.");
			if (!["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid price basis.");
			if (!/^\d+$/.test(t.terms) || Number(t.terms) > 365) throw Error("Payment terms must be 0–365 days.");
			if (!/^\d{2}-\d{2}$/.test(t.yearEnd) || !Yl("2001-" + t.yearEnd)) throw Error("Year end must be MM-DD.");
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
				let e = _e().journals.journalEntries, r = n.find((e) => e.id === t.id), i = _e().bankAccounts.bankAccounts, a = r?.currency ?? i[0]?.currency ?? "AUD";
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
function Zl(e, t, n) {
	Wl[e].push({
		id: crypto.randomUUID(),
		name: n,
		status: "Active",
		revision: "1",
		createdAt: zl(),
		updatedAt: zl(),
		recordId: t.id,
		actorId: T.current()?.userId ?? "local-test",
		after: JSON.stringify(t)
	});
}
var Ql = Object.fromEntries(Object.keys(Bl).map((e) => {
	let t = {
		run(t) {
			if (e !== "custom-reports") throw Error("Saved-report execution is not available on this register.");
			return Il(t);
		},
		generate(t) {
			if (e !== "report-packs") throw Error("Report generation is only available for report packs.");
			return Dl(t);
		},
		getAll: () => S[e],
		getById: (t) => S[e].find((e) => e.id === t),
		save(t, n) {
			let r = Ll.parse(t), i = S[e].find((e) => e.id === r.id);
			if (i && i.revision !== n) throw Error("Record changed. Reload before saving.");
			if (!i && n !== void 0) throw Error("Record no longer exists.");
			let a = zl(), o = {
				...r,
				id: i?.id ?? crypto.randomUUID(),
				name: r.name.trim(),
				status: r.status ?? (e === "tasks" ? "Open" : "Active"),
				revision: String(Number(i?.revision ?? "0") + 1),
				createdAt: i?.createdAt ?? a,
				updatedAt: a
			};
			return e === "tasks" && (delete o.completedAt, delete o.completedBy, o.status === "Completed" && (o.completedAt = i?.status === "Completed" && i.completedAt || a, o.completedBy = i?.status === "Completed" ? i.completedBy || T.current()?.userId || "local-test" : T.current()?.userId ?? "local-test")), Xl(e, o, S[e]), S[e] = [...S[e].filter((e) => e.id !== o.id), o], Zl(e, o, i ? "Updated" : "Created"), Ul(), o;
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
			Zl(e, {
				...i,
				note: r.trim()
			}, "Note added"), Ul();
		}
	};
	return y("workspace_" + e.replaceAll("-", "_"), {
		validate: (t, n) => {
			$l(e, t), eu(e, t, n);
		},
		repository: t,
		read: Bl[e].read,
		commands: {
			run: e === "custom-reports" ? "accounting.read" : null,
			generate: e === "report-packs" ? "accounting.read" : null,
			save: Bl[e].write,
			setStatus: Bl[e].write,
			addNote: e === "tasks" ? "sales.write" : null
		},
		snapshot: () => ({
			records: S[e],
			history: Wl[e]
		}),
		restore: (t) => {
			$l(e, t), S[e] = t.records, Wl[e] = t.history;
		},
		publish: Ul
	}), [e, t];
}));
function $l(e, t) {
	let n = w({
		records: r(Ll),
		history: r(Ll)
	}).strict().parse(t), i = /* @__PURE__ */ new Set();
	for (let t of n.records) {
		if (!t.id || i.has(t.id) || !/^\d+$/.test(t.revision)) throw Error("Invalid workspace record identity.");
		i.add(t.id), Xl(e, t, n.records, !1);
	}
	return n;
}
function eu(e, t, n) {
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
var X = g().trim().min(1).max(200), tu = g().trim().min(1).max(4e3), nu = g().refine((e) => {
	try {
		return C(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), ru = g().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}, "Invalid visit timestamp."), iu = w({
	operationId: X,
	name: X,
	customerId: X,
	locationId: X.optional(),
	plannedDate: nu,
	locationNote: g().trim().max(500).default("")
}).strict(), au = w({
	name: X,
	due: nu,
	priority: f([
		"Low",
		"Normal",
		"High"
	]),
	notes: tu
}).strict(), ou = w({
	id: X,
	expectedRevision: p().int().positive(),
	outcome: tu,
	followup: au.optional()
}).strict(), su = w({
	id: X,
	action: X,
	actorId: X,
	at: ru,
	note: g().optional()
}).strict(), cu = w({
	id: X,
	operationId: X,
	creationFingerprint: g().min(1).max(3e3),
	name: X,
	customerId: X,
	customerName: X,
	locationId: X.optional(),
	locationName: g().max(200).optional(),
	locationNote: g().max(500),
	plannedDate: nu,
	status: f([
		"Planned",
		"Checked in",
		"Completed",
		"Cancelled"
	]),
	revision: p().int().positive(),
	ownerId: X,
	createdAt: ru,
	updatedAt: ru,
	checkInAt: ru.optional(),
	checkInBy: X.optional(),
	checkOutAt: ru.optional(),
	checkOutBy: X.optional(),
	outcome: tu.optional(),
	completionFingerprint: g().optional(),
	followupTaskId: X.optional(),
	history: r(su).min(1)
}).strict(), lu = [], uu = 0, du = /* @__PURE__ */ new Set(), fu = () => {
	uu++, du.forEach((e) => e());
}, pu = () => T.require("sales.write").userId, mu = () => (/* @__PURE__ */ new Date()).toISOString(), hu = (e, t, n, r) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	...r ? { note: r } : {}
});
function gu(e) {
	let t = lu.find((t) => t.id === e);
	if (!t) throw Error("Visit not found.");
	return t;
}
function _u(e, t) {
	if (e.revision !== t) throw Error("Visit changed. Reload before continuing.");
}
function vu(e) {
	let t = mu();
	if (t < e.updatedAt) throw Error("System clock precedes the last visit update. Correct the clock before continuing.");
	return t;
}
function yu(e) {
	return lu = [...lu.filter((t) => t.id !== e.id), e], fu(), e;
}
function bu(e, t) {
	let n = D.getById(e);
	if (!n || n.status === "INACTIVE") throw Error("Choose an available customer.");
	if (t && !n.locations.some((e) => e.id === t)) throw Error("Choose a location belonging to the selected customer.");
	return n;
}
y("salesVisits", {
	repository: {
		subscribe(e) {
			return du.add(e), () => {
				du.delete(e);
			};
		},
		getSnapshot: () => lu,
		getAll: () => lu,
		create(e) {
			let t = pu(), n = iu.parse(e), r = JSON.stringify(n), i = lu.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.creationFingerprint !== r) throw Error("Operation ID was used for different visit data.");
				return i;
			}
			let a = bu(n.customerId, n.locationId), o = mu();
			return yu({
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
				history: [hu("Planned", t, o)]
			});
		},
		update(e) {
			let t = pu(), n = iu.omit({ operationId: !0 }).extend({
				id: X,
				expectedRevision: p().int().positive()
			}).strict().parse(e), r = gu(n.id);
			if (_u(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be edited.");
			let i = bu(n.customerId, n.locationId), a = vu(r), o = {
				...r,
				name: n.name,
				customerId: n.customerId,
				customerName: i.businessName,
				plannedDate: n.plannedDate,
				locationNote: n.locationNote,
				revision: r.revision + 1,
				updatedAt: a,
				history: [...r.history, hu("Plan updated", t, a, r.plannedDate + " → " + n.plannedDate)]
			};
			return delete o.locationId, delete o.locationName, n.locationId && (o.locationId = n.locationId, o.locationName = i.locations.find((e) => e.id === n.locationId).name), yu(o);
		},
		checkIn(e) {
			let t = pu(), n = w({
				id: X,
				expectedRevision: p().int().positive()
			}).strict().parse(e), r = gu(n.id);
			if (r.status === "Checked in" && r.revision === n.expectedRevision + 1) return r;
			if (_u(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be checked in.");
			bu(r.customerId, r.locationId);
			let i = vu(r);
			return yu({
				...r,
				status: "Checked in",
				revision: r.revision + 1,
				checkInAt: i,
				checkInBy: t,
				updatedAt: i,
				history: [...r.history, hu("Checked in", t, i)]
			});
		},
		finish(e) {
			let t = pu(), n = ou.parse(e), r = gu(n.id), i = JSON.stringify({
				outcome: n.outcome,
				followup: n.followup
			});
			if (r.status === "Completed") {
				if (r.completionFingerprint === i) return r;
				throw Error("Visit is already completed with a different outcome.");
			}
			if (_u(r, n.expectedRevision), r.status !== "Checked in") throw Error("Check in before completing the visit.");
			let a = vu(r);
			if (a < r.checkInAt) throw Error("System clock precedes check-in. Correct the clock before completing.");
			let o;
			return n.followup && (o = Ql.tasks.save({
				...n.followup,
				customerId: r.customerId,
				owner: t,
				status: "Open"
			}).id), yu({
				...r,
				status: "Completed",
				revision: r.revision + 1,
				checkOutAt: a,
				checkOutBy: t,
				outcome: n.outcome,
				completionFingerprint: i,
				...o ? { followupTaskId: o } : {},
				updatedAt: a,
				history: [...r.history, hu("Completed", t, a, n.outcome)]
			});
		},
		cancel(e) {
			let t = pu(), n = w({
				id: X,
				expectedRevision: p().int().positive(),
				reason: tu
			}).strict().parse(e), r = gu(n.id);
			if (_u(r, n.expectedRevision), !["Planned", "Checked in"].includes(r.status)) throw Error("Only an unfinished visit can be cancelled.");
			let i = vu(r);
			return yu({
				...r,
				status: "Cancelled",
				revision: r.revision + 1,
				updatedAt: i,
				history: [...r.history, hu("Cancelled", t, i, n.reason)]
			});
		},
		addNote(e) {
			let t = pu(), n = w({
				id: X,
				expectedRevision: p().int().positive(),
				note: tu
			}).strict().parse(e), r = gu(n.id);
			_u(r, n.expectedRevision);
			let i = vu(r);
			return yu({
				...r,
				revision: r.revision + 1,
				updatedAt: i,
				history: [...r.history, hu("Note added", t, i, n.note)]
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
	snapshot: () => ({ visits: lu }),
	restore: (e) => {
		lu = e.visits;
	},
	publish: fu,
	validate: (e, t) => {
		let n = w({ visits: r(cu) }).strict().parse(e), i = t, a = /* @__PURE__ */ new Set();
		for (let e of n.visits) {
			if (a.has(e.operationId)) throw Error("Duplicate visit operation ID.");
			if (a.add(e.operationId), !i.customers.customers.find((t) => t.id === e.customerId) || e.locationId && !e.locationName) throw Error("Invalid visit customer/location reference.");
			if (e.history.length !== e.revision || new Set(e.history.map((e) => e.id)).size !== e.history.length || e.updatedAt < e.createdAt) throw Error("Invalid visit history.");
			if (iu.parse(JSON.parse(e.creationFingerprint)).operationId !== e.operationId || e.history[0].action !== "Planned" || e.history[0].actorId !== e.ownerId || e.history[0].at !== e.createdAt) throw Error("Visit creation fingerprint is inconsistent.");
			if (!!e.checkInAt != !!e.checkInBy || !!e.checkOutAt != !!e.checkOutBy || e.checkInAt && e.checkInAt < e.createdAt || e.checkOutAt && (!e.checkInAt || e.checkOutAt < e.checkInAt)) throw Error("Invalid visit check-in/out history.");
			if (e.status === "Planned" && (e.checkInAt || e.checkOutAt) || e.status === "Checked in" && (!e.checkInAt || e.checkOutAt) || e.status === "Completed" && (!e.checkInAt || !e.checkOutAt || !e.outcome || !e.completionFingerprint) || e.status !== "Completed" && (e.checkOutAt || e.outcome || e.followupTaskId || e.completionFingerprint)) throw Error("Visit state is inconsistent.");
			if (e.status === "Completed") {
				let t = w({
					outcome: tu,
					followup: au.optional()
				}).strict().parse(JSON.parse(e.completionFingerprint));
				if (t.outcome !== e.outcome || !!t.followup != !!e.followupTaskId) throw Error("Visit completion fingerprint is inconsistent.");
			}
			if (e.followupTaskId && !i.workspace_tasks.records.some((t) => t.id === e.followupTaskId && t.customerId === e.customerId)) throw Error("Visit follow-up task is missing or belongs to another customer.");
		}
	}
});
//#endregion
//#region src/features/direct-documents/managedDocumentRepository.ts
var Z = g().trim().min(1).max(200), xu = g().trim().max(2e3).optional(), Su = w({
	requestedArea: p().finite().positive().max(1e9).optional(),
	productId: Z,
	unitId: Z,
	quantity: p().positive().finite(),
	unitPrice: p().nonnegative().finite().optional(),
	priceBasis: f(["Inclusive", "Exclusive"]).optional()
}).strict(), Cu = w({
	description: g().trim().min(1).max(500),
	accountId: Z,
	quantity: p().positive().finite(),
	unitCost: p().nonnegative().finite(),
	taxCode: Z,
	priceBasis: f(["Inclusive", "Exclusive"]).optional()
}).strict(), wu = w({
	kind: f(["ORDER", "INVOICE"]),
	customerId: Z,
	locationId: Z.or(l("")).optional(),
	accountingContactId: Z.or(l("")).optional(),
	documentDate: Z,
	dueDate: Z.optional(),
	customerReference: xu,
	notes: xu,
	lines: r(Su).min(1).max(500)
}).strict(), Tu = w({
	kind: l("EXPENSE"),
	supplierId: Z,
	supplierInvoiceNumber: Z,
	documentDate: Z,
	dueDate: Z,
	notes: xu,
	lines: r(Cu).min(1).max(500)
}).strict(), Eu = (e) => a([wu, Tu]).parse(e), Du = p().finite().nonnegative().refine((e) => Number.isSafeInteger(Math.round(e * 100)) && e === Math.round(e * 100) / 100, "Use an amount in whole cents within the supported range."), Ou = w({
	operationId: Z,
	sourceName: g().trim().max(200),
	reviewed: o(),
	declared: w({
		subtotal: Du,
		taxAmount: Du,
		total: Du
	}).strict(),
	payload: Tu.extend({ notes: g().trim().max(1e3).optional() })
}).strict();
function ku(e) {
	return {
		...e.payload,
		notes: [
			e.payload.notes,
			`Reviewed source: ${e.sourceName || "Manual entry"}`,
			`Declared net / tax / total: ${e.declared.subtotal.toFixed(2)} / ${e.declared.taxAmount.toFixed(2)} / ${e.declared.total.toFixed(2)}`
		].filter(Boolean).join("\n")
	};
}
function Au(e) {
	let t = gt.getById(e.payload.supplierId);
	if (!t || t.status !== "ACTIVE") throw Error("Select an active supplier.");
	let n = Hu(e.payload), r = e.payload.supplierInvoiceNumber.trim().toLowerCase(), i = Dc.getAll(), a = new Set(i.filter((e) => e.status === "VOID").map((e) => e.id)), o = [...Nu.filter((t) => t.operationId !== e.operationId && t.status !== "CANCELLED" && !(t.status === "POSTED" && t.documentId && a.has(t.documentId)) && t.payload.kind === "EXPENSE" && t.payload.supplierId === e.payload.supplierId && t.payload.supplierInvoiceNumber.trim().toLowerCase() === r).map((e) => ({
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
var ju = () => P.getAll().filter((e) => e.active && e.type === "EXPENSE" && e.allowManualPosting && (!e.systemRole || e.systemRole === "OPERATING_EXPENSE" || e.systemRole === "FREIGHT")).map((e) => ({
	id: e.id,
	code: e.code,
	name: e.name
}));
ju();
var Mu = [], Nu = [], Pu = 0, Fu = /* @__PURE__ */ new Set(), Iu = () => {
	Pu++, Fu.forEach((e) => e());
}, Lu = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function Ru(e, t) {
	return {
		action: e,
		actorId: T.current()?.userId ?? "local-test",
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...t ? { reason: t } : {}
	};
}
function zu(e) {
	for (let t of e) if (t.taxAmount) for (let [e, n] of [[t.taxCollectedAccountId, "LIABILITY"], [t.taxPaidAccountId, "ASSET"]]) {
		if (!e) continue;
		let t = P.requireById(e);
		if (!t.active || t.type !== n) throw Error("A snapshotted tax posting account is no longer active or has the wrong type.");
	}
}
function Bu(e) {
	let t = P.requireById(e);
	if (!t.active || t.type !== "EXPENSE" || !t.allowManualPosting || t.systemRole && t.systemRole !== "OPERATING_EXPENSE" && t.systemRole !== "FREIGHT") throw Error("Use an active manual expense account, not an inventory, GRNI or control account.");
	return t;
}
function Vu(e) {
	let t = e.payload;
	if (t.kind === "EXPENSE") {
		let n = gt.getById(t.supplierId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active supplier.");
		for (let t of e.lines) Bu(t.expenseAccountId);
	} else {
		let n = D.getById(t.customerId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active customer.");
		for (let t of e.lines) Ki(t.productId, t.unitId, t.quantity, "sell");
	}
	zu(e.lines);
}
function Hu(e) {
	if (C(e.documentDate, "Document date"), e.dueDate && (C(e.dueDate, "Due date"), e.dueDate < e.documentDate)) throw Error("Due date cannot precede document date.");
	if (e.kind !== "ORDER" && !e.dueDate) throw Error("Due date is required.");
	let t = e.kind === "EXPENSE" ? e.lines.map((e) => {
		Bu(e.accountId);
		let t = v(e.taxCode), n = ae(e.unitCost, t.taxRate, e.priceBasis), r = Lu(e.quantity * n), i = (e.priceBasis ?? _().basis) === "Inclusive" ? Lu(e.quantity * e.unitCost - r) : Lu(r * t.taxRate);
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
			lineTotal: Lu(r + i)
		};
	}) : e.lines.map((t) => ho({
		customerId: e.customerId,
		documentDate: e.documentDate,
		draft: t
	})), n = mo(t);
	if (n.total <= 0 || !Number.isFinite(n.total)) throw Error("Document total must be finite and greater than zero.");
	return {
		lines: t,
		totals: n
	};
}
function Uu(e) {
	let t = () => e === "sales" ? Mu : Nu;
	function n(t) {
		return e === "sales" ? Mu = [...Mu.filter((e) => e.id !== t.id), t] : Nu = [...Nu.filter((e) => e.id !== t.id), t], Iu(), t;
	}
	let r = (e) => {
		let n = t().find((t) => t.id === e);
		if (!n || i(n.id)) throw Error("Draft not found or is in the recycle bin.");
		return n;
	};
	function a(e, t) {
		if (e.revision !== t) throw Error("Draft changed. Reload before editing or approving.");
	}
	function o(e, t, r = {}, i) {
		return n({
			...e,
			...r,
			revision: e.revision + 1,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			history: [...e.history, Ru(t, i)]
		});
	}
	let s = (e, t) => Gu.save({
		operationId: e,
		payload: t
	});
	return {
		getAll: () => ne(t()),
		reviewCapture(t) {
			if (T.require("purchases.bill"), e !== "expense") throw Error("Capture is only available for expense bills.");
			return Au(Ou.parse(t));
		},
		capture(n) {
			if (T.require("purchases.bill"), e !== "expense") throw Error("Capture is only available for expense bills.");
			let r = Ou.parse(n);
			if (!r.reviewed) throw Error("Confirm that the supplier document has been reviewed.");
			let i = ku(r);
			if (t().find((e) => e.operationId === r.operationId)) return s(r.operationId, i);
			let a = Au(r);
			if (!a.matches) throw Error(a.issues.join(" "));
			return s(r.operationId, i);
		},
		save(o) {
			let s = w({
				operationId: Z,
				id: Z.optional(),
				expectedRevision: p().int().positive().optional(),
				payload: e === "sales" ? wu : Tu
			}).strict().parse(o), c = JSON.stringify(s.payload);
			if (!s.id) {
				let e = t().find((e) => e.operationId === s.operationId);
				if (e) {
					if (i(e.id)) throw Error("Recover the existing draft from the recycle bin.");
					if (e.creationFingerprint !== c) throw Error("Operation ID was used for different draft data.");
					return e;
				}
			}
			let l = s.id ? r(s.id) : void 0;
			if (l && (a(l, s.expectedRevision ?? -1), l.status !== "DRAFT")) throw Error("Only unapproved drafts can be edited. Reopen an approved draft before editing.");
			let u = Hu(s.payload), d = (/* @__PURE__ */ new Date()).toISOString(), f = {
				id: l?.id ?? crypto.randomUUID(),
				operationId: l?.operationId ?? s.operationId,
				creationFingerprint: l?.creationFingerprint ?? c,
				revision: (l?.revision ?? 0) + 1,
				kind: s.payload.kind,
				status: "DRAFT",
				payload: s.payload.kind === "EXPENSE" ? s.payload : {
					...s.payload,
					lines: s.payload.lines.map((e, t) => ({
						...e,
						quantity: u.lines[t].quantity
					}))
				},
				recipient: s.payload.kind === "EXPENSE" ? void 0 : Wi(s.payload.customerId, s.payload),
				...u,
				createdAt: l?.createdAt ?? d,
				updatedAt: d,
				history: [...l?.history ?? [], Ru(l ? "Edited" : "Created")]
			};
			if (l && l.kind !== f.kind) throw Error("Document kind cannot change.");
			return Vu(f), n(f);
		},
		approve(e, t) {
			let n = r(e);
			if (n.status === "APPROVED" && n.revision === t + 1) return n;
			if (a(n, t), n.status !== "DRAFT") throw Error("Only a draft can be approved.");
			return Vu(n), o(n, "Approved", { status: "APPROVED" });
		},
		reopen(e, t, n) {
			let i = r(e);
			if (a(i, t), i.status !== "APPROVED" || n.trim().length < 3) throw Error("Only approved drafts can be reopened with a reason.");
			return o(i, "Reopened", { status: "DRAFT" }, n);
		},
		cancel(e, t, n) {
			let i = r(e);
			if (a(i, t), i.status === "POSTED" || i.status === "CANCELLED" || n.trim().length < 3) throw Error("Only unposted drafts can be cancelled with a reason.");
			return o(i, "Cancelled", { status: "CANCELLED" }, n);
		},
		post(e, t) {
			let n = r(e);
			if (n.status === "POSTED") return n;
			if (a(n, t), n.status !== "APPROVED") throw Error("Approve the draft before posting.");
			R(), mr(n.payload.documentDate), Vu(n);
			let i, s = n.payload;
			if (s.kind === "EXPENSE") {
				let e = gt.getById(s.supplierId), t = (/* @__PURE__ */ new Date()).toISOString(), r = {
					id: crypto.randomUUID(),
					managedDraftId: n.id,
					kind: "EXPENSE",
					billNumber: pe("BILL", Dc.getAll().map((e) => e.billNumber), s.documentDate.slice(0, 4)),
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
				Dc.insertExpenseBill(r);
				let a = r.lines.filter((e) => e.lineSubtotal !== 0).map((e) => ({
					accountId: e.expenseAccountId,
					description: e.description,
					debit: e.lineSubtotal,
					credit: 0
				}));
				F.post({
					journalDate: r.billDate,
					description: "Expense bill " + r.billNumber,
					reference: r.supplierInvoiceNumber,
					sourceType: "SUPPLIER_BILL",
					sourceId: r.id,
					lines: [
						...a,
						...To(r.lines, "paid", !0, r.totals.taxAmount),
						{
							accountId: P.requireBySystemRole("ACCOUNTS_PAYABLE").id,
							debit: 0,
							credit: r.totals.total
						}
					]
				}), i = r.id;
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
				i = s.kind === "ORDER" ? U.createManagedOrder(e).id : U.createManagedInvoice({
					...e,
					dueDate: s.dueDate
				}).id;
			}
			return o(n, "Posted", {
				status: "POSTED",
				documentId: i
			});
		},
		cancelOrder(e, t) {
			let n = r(e);
			if (n.kind !== "ORDER" || n.status !== "POSTED") throw Error("A confirmed managed order is required.");
			return U.cancelManagedOrder(n.documentId, t), o(n, "Order cancelled", {}, t);
		}
	};
}
var Wu = Uu("sales"), Gu = Uu("expense"), Ku = w({
	recipient: w({
		locationId: g().optional(),
		locationName: g().optional(),
		deliveryAddress: g().optional(),
		accountingContactId: g().optional(),
		accountingContactName: g().optional(),
		accountingEmail: g().email().optional()
	}).strict().optional(),
	id: Z,
	operationId: Z,
	creationFingerprint: g().max(1e6),
	revision: p().int().positive(),
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
	payload: a([wu, Tu]),
	lines: r(w({
		id: Z,
		description: g().min(1),
		quantity: p().finite().positive(),
		unitSymbol: g().min(1),
		unitPrice: p().finite().nonnegative().optional(),
		unitCost: p().finite().nonnegative().optional(),
		taxRate: p().finite().min(0).max(1),
		taxCode: Z,
		taxPaidAccountId: Z.optional(),
		taxCollectedAccountId: Z.optional(),
		lineSubtotal: p().finite().nonnegative(),
		taxAmount: p().finite().nonnegative(),
		lineTotal: p().finite().nonnegative()
	}).passthrough()).min(1),
	totals: w({
		subtotal: p().finite(),
		taxAmount: p().finite(),
		total: p().finite()
	}),
	documentId: Z.optional(),
	createdAt: Z,
	updatedAt: Z,
	history: r(w({
		action: Z,
		actorId: Z,
		at: Z,
		reason: g().optional()
	}).strict()).min(1)
}).strict();
for (let e of ["sales", "expense"]) y(e === "sales" ? "managedSalesDocuments" : "expenseBillDrafts", {
	repository: e === "sales" ? Wu : Gu,
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
	snapshot: () => e === "sales" ? { drafts: Mu } : {
		drafts: Nu,
		options: ju()
	},
	restore: (t) => {
		e === "sales" ? Mu = t.drafts : (Nu = t.drafts, t.options);
	},
	publish: Iu,
	validate: (t, n) => {
		let { drafts: i } = w({
			drafts: r(Ku),
			...e === "expense" ? { options: r(w({
				id: Z,
				code: Z,
				name: Z
			}).strict()) } : {}
		}).strict().parse(t);
		for (let t of i) {
			if (Gi(t.recipient), t.kind !== t.payload.kind || e === "expense" != (t.kind === "EXPENSE")) throw Error("Draft kind mismatch.");
			if (C(t.payload.documentDate), t.payload.dueDate && (C(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate)) throw Error("Draft due date is invalid.");
			let r = n, i = t.payload.kind === "EXPENSE" ? t.payload.supplierId : t.payload.customerId;
			if (!(t.payload.kind === "EXPENSE" ? r.suppliers.suppliers : r.customers.customers).some((e) => e.id === i) || t.lines.length !== t.payload.lines.length) throw Error("Draft party or line references are invalid.");
			for (let [e, n] of t.lines.entries()) {
				let i = t.payload.lines[e], a = n;
				if (t.kind !== "EXPENSE" && (Ui(a), Ct(a, r.products.products.find((e) => e.id === a.productId)), a.requestedArea !== i.requestedArea)) throw Error("Draft area requirement mismatch.");
				if (typeof a.quantity != "number" || !Number.isFinite(a.quantity) || a.quantity <= 0 || i.requestedArea === void 0 && a.quantity !== i.quantity || Lu(a.lineSubtotal + a.taxAmount) !== a.lineTotal) throw Error("Draft line amounts are invalid.");
				if (t.kind === "EXPENSE") {
					if (typeof a.unitCost != "number") throw Error("Expense line unit cost is invalid.");
					if (a.expenseAccountId !== i.accountId || !r.accounts.accounts.some((e) => e.id === a.expenseAccountId && e.type === "EXPENSE")) throw Error("Draft expense account reference is invalid.");
				} else if (typeof a.unitPrice != "number" || a.productId !== i.productId || a.unitId !== i.unitId || !r.products.products.some((e) => e.id === a.productId && e.units.some((e) => e.id === a.unitId))) throw Error("Draft product/unit reference is invalid.");
				for (let [e, t] of [["taxPaidAccountId", "ASSET"], ["taxCollectedAccountId", "LIABILITY"]]) if (a[e] && !r.accounts.accounts.some((n) => n.id === a[e] && n.type === t)) throw Error("Draft tax account reference is invalid.");
			}
			for (let e of [
				"subtotal",
				"taxAmount",
				"total"
			]) {
				let n = e === "subtotal" ? "lineSubtotal" : e === "total" ? "lineTotal" : "taxAmount";
				if (Lu(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Draft totals do not match lines.");
			}
			if (t.status === "POSTED") {
				let e = n;
				if (!(t.kind === "EXPENSE" ? e.supplierBills.supplierBills : t.kind === "ORDER" ? e.sales.salesOrders : e.sales.invoices).some((e) => e.id === t.documentId && e.managedDraftId === t.id && e.totals.total === t.totals.total)) throw Error("Posted draft source reference is invalid.");
			}
		}
	}
});
//#endregion
//#region src/features/recurring/recurringDates.ts
var qu = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
];
function Ju(e, t, n) {
	if (C(e), !Number.isSafeInteger(n) || n < 0 || !qu.includes(t)) throw Error("Invalid schedule occurrence.");
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
function Yu(e, t) {
	C(e);
	let n = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	n.setUTCDate(n.getUTCDate() + t);
	let r = n.toISOString().slice(0, 10);
	return C(r), r;
}
//#endregion
//#region src/features/recurring/recurringRepository.ts
var Xu = g().trim().min(1).max(200), Zu = g().refine((e) => {
	try {
		return C(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), Qu = w({
	operationId: Xu,
	name: Xu,
	sourceDraftId: Xu,
	frequency: f(qu),
	firstDate: Zu,
	endDate: Zu
}).strict(), $u = w({
	id: Xu,
	expectedRevision: p().int().positive(),
	name: Xu,
	endDate: Zu
}).strict(), ed = g().refine((e) => Number.isFinite(Date.parse(e)), "Invalid timestamp."), td = w({
	id: Xu,
	name: Xu,
	kind: f(["INVOICE", "EXPENSE"]),
	status: f([
		"Active",
		"Paused",
		"Ended"
	]),
	revision: p().int().positive(),
	operationId: Xu,
	creationFingerprint: g().min(1).max(2e3),
	sourceDraftId: Xu,
	payload: ee(),
	frequency: f(qu),
	firstDate: Zu,
	nextDate: Zu,
	endDate: Zu,
	occurrence: p().int().nonnegative(),
	termsDays: p().int().nonnegative(),
	createdAt: ed,
	updatedAt: ed
}).strict(), nd = w({
	id: Xu,
	scheduleId: Xu,
	date: Zu,
	draftId: Xu,
	actorId: Xu,
	createdAt: ed
}).strict(), rd = 0, id = /* @__PURE__ */ new Set(), ad = () => {
	rd++, id.forEach((e) => e());
}, od = {
	INVOICE: {
		schedules: [],
		runs: []
	},
	EXPENSE: {
		schedules: [],
		runs: []
	}
}, sd = (e) => e === "INVOICE" ? "sales.manage" : "purchases.bill", cd = (e) => e === "INVOICE" ? Wu : Gu, ld = () => (/* @__PURE__ */ new Date()).toISOString();
function ud(e) {
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
function dd(e) {
	let t = () => od[e], n = (e) => {
		let n = t().schedules.find((t) => t.id === e);
		if (!n) throw Error("Recurring schedule not found.");
		return n;
	}, r = (e, t) => {
		if (e.revision !== t) throw Error("Schedule changed. Reload before continuing.");
	};
	return {
		getAll: () => t().schedules,
		getRuns: () => t().runs,
		create(n) {
			T.require(sd(e));
			let r = Qu.parse(n), i = JSON.stringify(r), a = t().schedules.find((e) => e.operationId === r.operationId);
			if (a) {
				if (a.creationFingerprint !== i) throw Error("Operation ID was used for a different recurring template.");
				return a;
			}
			let o = cd(e).getAll().find((e) => e.id === r.sourceDraftId);
			if (!o || o.kind !== e || o.status === "CANCELLED") throw Error("Select an existing invoice or expense entry draft of the correct type.");
			if (r.endDate < r.firstDate) throw Error("End date must not precede first generation date.");
			let s = ud(o), c = Math.round((Date.parse(s.dueDate + "T00:00:00Z") - Date.parse(s.documentDate + "T00:00:00Z")) / 864e5), l = ld(), u = {
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
			return t().schedules = [...t().schedules, u], ad(), u;
		},
		update(i) {
			T.require(sd(e));
			let a = $u.parse(i), o = n(a.id);
			if (r(o, a.expectedRevision), a.endDate < o.firstDate || o.occurrence && a.endDate < t().runs.filter((e) => e.scheduleId === o.id).map((e) => e.date).sort().at(-1)) throw Error("End date cannot precede the schedule start or its last generated occurrence.");
			let s = {
				...o,
				name: a.name,
				endDate: a.endDate,
				status: o.nextDate > a.endDate ? "Ended" : o.status === "Ended" ? "Paused" : o.status,
				revision: o.revision + 1,
				updatedAt: ld()
			};
			return t().schedules = t().schedules.map((e) => e.id === o.id ? s : e), ad(), s;
		},
		setStatus(i) {
			T.require(sd(e));
			let a = w({
				id: Xu,
				expectedRevision: p().int().positive(),
				status: f(["Active", "Paused"])
			}).strict().parse(i), o = n(a.id);
			if (r(o, a.expectedRevision), o.nextDate > o.endDate) throw Error("Extend the end date before resuming this ended schedule.");
			let s = {
				...o,
				status: a.status,
				revision: o.revision + 1,
				updatedAt: ld()
			};
			return t().schedules = t().schedules.map((e) => e.id === o.id ? s : e), ad(), s;
		},
		generate(i) {
			T.require(sd(e));
			let a = w({
				id: Xu,
				expectedRevision: p().int().positive(),
				date: Zu
			}).strict().parse(i), o = n(a.id), s = t().runs.find((e) => e.scheduleId === o.id && e.date === a.date);
			if (s) return {
				schedule: o,
				run: s,
				draft: cd(e).getAll().find((e) => e.id === s.draftId)
			};
			if (r(o, a.expectedRevision), o.status !== "Active") throw Error("Activate the schedule before generating.");
			if (a.date !== o.nextDate) throw Error("Generate the next occurrence in order.");
			if (a.date > x(ld())) throw Error("This occurrence is not due yet.");
			if (a.date > o.endDate) throw Error("The schedule has ended.");
			let c = Ju(o.firstDate, o.frequency, o.occurrence + 1), l = structuredClone(o.payload);
			l.documentDate = a.date, l.dueDate = Yu(a.date, o.termsDays), l.kind === "EXPENSE" && (l.supplierInvoiceNumber = l.supplierInvoiceNumber.slice(0, 170) + " [" + a.date + "]");
			let u = cd(e).save({
				operationId: "recurring:" + o.id + ":" + a.date,
				payload: l
			}), d = ld(), f = {
				id: crypto.randomUUID(),
				scheduleId: o.id,
				date: a.date,
				draftId: u.id,
				actorId: T.current().userId,
				createdAt: d
			}, m = {
				...o,
				nextDate: c,
				occurrence: o.occurrence + 1,
				status: c > o.endDate ? "Ended" : "Active",
				revision: o.revision + 1,
				updatedAt: d
			};
			return t().schedules = t().schedules.map((e) => e.id === o.id ? m : e), t().runs = [...t().runs, f], ad(), {
				schedule: m,
				run: f,
				draft: u
			};
		}
	};
}
var fd = dd("INVOICE"), pd = dd("EXPENSE");
for (let e of ["INVOICE", "EXPENSE"]) y(e === "INVOICE" ? "recurringInvoices" : "recurringExpenses", {
	repository: e === "INVOICE" ? fd : pd,
	read: e === "INVOICE" ? "sales.read" : "purchases.read",
	commands: {
		create: sd(e),
		update: sd(e),
		setStatus: sd(e),
		generate: sd(e)
	},
	snapshot: () => structuredClone(od[e]),
	restore: (t) => {
		od[e] = t;
	},
	publish: ad,
	validate: (t, n) => {
		w({
			schedules: r(td),
			runs: r(nd)
		}).strict().parse(t);
		let i = t, a = n;
		for (let t of i.schedules) {
			if (t.kind !== e || ![
				"Active",
				"Paused",
				"Ended"
			].includes(t.status) || !Number.isSafeInteger(t.revision) || t.revision < 1 || !Number.isSafeInteger(t.occurrence) || t.occurrence < 0 || !Number.isInteger(t.termsDays) || t.termsDays < 0 || t.payload.kind !== e) throw Error("Invalid recurring schedule.");
			if (Qu.parse({
				operationId: t.operationId,
				name: t.name,
				sourceDraftId: t.sourceDraftId,
				frequency: t.frequency,
				firstDate: t.firstDate,
				endDate: t.endDate
			}), Eu(t.payload), !t.id || !t.creationFingerprint || !Number.isFinite(Date.parse(t.createdAt)) || !Number.isFinite(Date.parse(t.updatedAt))) throw Error("Invalid recurring identity or audit timestamps.");
			if (C(t.payload.documentDate), C(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate || t.termsDays !== Math.round((Date.parse(t.payload.dueDate + "T00:00:00Z") - Date.parse(t.payload.documentDate + "T00:00:00Z")) / 864e5)) throw Error("Invalid recurring payment terms.");
			if (t.payload.kind === "EXPENSE") {
				if (!a.suppliers.suppliers.some((e) => e.id === t.payload.supplierId) || t.payload.lines.some((e) => !a.accounts.accounts.some((t) => t.id === e.accountId && t.type === "EXPENSE"))) throw Error("Recurring expense references are invalid.");
			} else if (!a.customers.customers.some((e) => e.id === t.payload.customerId) || t.payload.lines.some((e) => !a.products.products.some((t) => t.id === e.productId && t.units.some((t) => t.id === e.unitId)))) throw Error("Recurring invoice references are invalid.");
			if (t.status === "Ended" != t.nextDate > t.endDate) throw Error("Recurring end status is inconsistent.");
			if (t.nextDate !== Ju(t.firstDate, t.frequency, t.occurrence) || t.endDate < t.firstDate) throw Error("Invalid recurring dates.");
			let n = (e === "INVOICE" ? a.managedSalesDocuments : a.expenseBillDrafts).drafts.find((e) => e.id === t.sourceDraftId);
			if (!n || n.kind !== e) throw Error("Recurring template source is missing.");
			let r = i.runs.filter((e) => e.scheduleId === t.id);
			if (r.length !== t.occurrence || new Set(r.map((e) => e.date)).size !== r.length) throw Error("Recurring run history does not match schedule.");
			for (let e = 0; e < r.length; e++) if (!r.some((n) => n.date === Ju(t.firstDate, t.frequency, e))) throw Error("Recurring occurrences are incomplete.");
		}
		for (let t of i.runs) {
			let n = i.schedules.find((e) => e.id === t.scheduleId), r = (e === "INVOICE" ? a.managedSalesDocuments : a.expenseBillDrafts).drafts.find((e) => e.id === t.draftId);
			if (!n || !r || r.kind !== e || r.operationId !== "recurring:" + n.id + ":" + t.date || !t.actorId || !Number.isFinite(Date.parse(t.createdAt))) throw Error("Invalid recurring generated-draft reference.");
		}
	}
});
//#endregion
//#region src/features/supplier-returns/supplierReturnRepository.ts
var Q = g().trim().min(1).max(200), md = p().finite().positive(), hd = p().finite().nonnegative(), gd = w({
	operationId: Q,
	supplierBillId: Q,
	supplierCreditNumber: Q,
	returnDate: Q,
	reason: g().trim().min(3).max(2e3),
	lines: r(w({
		matchId: Q,
		quantity: md
	}).strict()).min(1).max(500)
}).strict(), _d = w({
	id: Q,
	matchId: Q,
	supplierBillLineId: Q,
	goodsReceiptId: Q,
	goodsReceiptLineId: Q,
	productId: Q,
	unitId: Q,
	baseUnitId: Q,
	sku: Q,
	description: g(),
	unitSymbol: Q,
	quantity: md,
	conversionToBase: md,
	quantityBase: md,
	siteId: Q,
	siteName: Q,
	inventoryMovementId: Q,
	costMovementId: Q,
	unitCostBase: hd,
	inventoryValue: hd,
	voidInventoryMovementId: Q.optional(),
	voidCostMovementId: Q.optional()
}).strict(), vd = w({
	id: Q,
	returnNumber: Q,
	operationId: Q,
	requestFingerprint: g().max(1e6),
	supplierBillId: Q,
	supplierBillNumber: Q,
	supplierId: Q,
	supplierName: Q,
	supplierCreditId: Q,
	returnDate: Q,
	reason: g().min(3).max(2e3),
	status: f(["POSTED", "VOID"]),
	lines: r(_d).min(1),
	inventoryValue: hd,
	journalId: Q.optional(),
	createdAt: Q,
	createdBy: Q,
	voidDate: Q.optional(),
	voidReason: g().optional(),
	voidedBy: Q.optional(),
	voidedAt: Q.optional()
}).strict(), yd = [], bd = 0, xd = /* @__PURE__ */ new Set(), Sd = () => {
	bd++, xd.forEach((e) => e());
}, Cd = (e) => Math.round(e * 1e4) / 1e4, wd = (e) => Math.round(e * 100) / 100;
function Td(e, t, n) {
	if (Bs.getAll().some((r) => r.siteId === t && r.productId === n && x(r.occurredAt) > e)) throw Error("Return/reversal date precedes later inventory activity at this site.");
}
function Ed(e) {
	let t = Dc.getById(e);
	return !t || t.status === "VOID" || t.kind === "EXPENSE" || t.openingBalanceImportId ? [] : yc.getByBill(e).filter((e) => e.status === "ACTIVE").flatMap((e) => {
		let n = t.lines.find((t) => t.id === e.supplierBillLineId), r = sc.getById(e.goodsReceiptId), i = r?.lines.find((t) => t.id === e.goodsReceiptLineId), a = n ? Dt(n.productId, n.unitId) : void 0;
		if (!n || !r || !i || !a) return [];
		let o = yd.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0);
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
			let t = gd.parse(e), n = JSON.stringify(t), r = yd.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.requestFingerprint !== n) throw Error("Operation ID already used with different return data.");
				return r;
			}
			R(), C(t.returnDate, "Return date"), mr(t.returnDate);
			let i = Dc.getById(t.supplierBillId);
			if (!i || i.status === "VOID" || i.kind === "EXPENSE" || i.openingBalanceImportId) throw Error("Select an active stock bill matched to received goods.");
			if (t.returnDate < i.billDate) throw Error("Return date cannot precede bill date.");
			let a = Ed(i.id), o = /* @__PURE__ */ new Set(), s = t.lines.map((e) => {
				if (o.has(e.matchId)) throw Error("Select each receipt match once.");
				o.add(e.matchId);
				let n = a.find((t) => t.matchId === e.matchId);
				if (!n) throw Error("Return line must belong to an active receipt match for this bill.");
				if (Cd(e.quantity) !== e.quantity || e.quantity > n.availableQuantity + 1e-8) throw Error("Return quantity exceeds the matched receipt remainder or four decimal places.");
				if (t.returnDate < n.receiptDate) throw Error("Return date cannot precede receipt date.");
				let r = O(n.productId), i = Dt(n.productId, n.unitId), s = Ts.getById(n.siteId);
				if (!r || !i || !s || s.status !== "ACTIVE") throw Error("Return product, unit or active receiving site was not found.");
				if (r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(i.code) && !Number.isInteger(e.quantity)) throw Error("Whole packs must be returned in whole quantities.");
				Td(t.returnDate, s.id, r.id);
				let c = Cd(e.quantity * n.conversionToBase);
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
				c.set(t, Cd((c.get(t) ?? 0) + e.quantityBase));
			}
			for (let [e, t] of c) {
				let [n, r] = e.split("|");
				if ((ec.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t) throw Error("Insufficient stock at the original receiving site.");
			}
			let l = /* @__PURE__ */ new Map();
			for (let e of s) {
				let t = i.lines.find((t) => t.id === e.supplierBillLineId), n = l.get(t.id);
				l.set(t.id, {
					supplierBillLineId: t.id,
					quantity: Cd((n?.quantity ?? 0) + e.quantity),
					unitCost: t.unitCost
				});
			}
			let u = crypto.randomUUID(), d = "SR-" + t.returnDate.slice(0, 4) + "-" + String(yd.length + 1).padStart(5, "0"), f = J.createReturnCredit({
				sourceSupplierBillId: i.id,
				supplierCreditNumber: t.supplierCreditNumber,
				creditDate: t.returnDate,
				reason: t.reason,
				lines: [...l.values()]
			}, u), p = s.map((e) => {
				ec.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let n = As.create({
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
				}), r = Js({
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
			}), m = wd(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? F.post({
				journalDate: t.returnDate,
				description: `Physical supplier return ${d}`,
				reference: f.creditNumber,
				sourceType: "SUPPLIER_RETURN",
				sourceId: u,
				lines: [{
					accountId: P.requireBySystemRole("PURCHASE_PRICE_VARIANCE").id,
					debit: m,
					credit: 0
				}, {
					accountId: P.requireBySystemRole("INVENTORY").id,
					debit: 0,
					credit: m
				}]
			}) : void 0, ee = {
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
			return yd = [ee, ...yd], Sd(), ee;
		},
		reverse(e) {
			let t = w({
				returnId: Q,
				voidDate: Q,
				reason: g().trim().min(3).max(2e3)
			}).strict().parse(e), n = yd.find((e) => e.id === t.returnId);
			if (!n) throw Error("Supplier return not found.");
			if (n.status === "VOID") return n;
			if (R(), C(t.voidDate, "Reversal date"), mr(t.voidDate), t.voidDate < n.returnDate) throw Error("Reversal date cannot precede return date.");
			for (let e of n.lines) Td(t.voidDate, e.siteId, e.productId);
			let r = J.getById(n.supplierCreditId);
			if ((r.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > t.voidDate) || J.getAllocationsByCredit(r.id).some((e) => e.reversedAt && x(e.reversedAt) > t.voidDate)) throw Error("Reversal date precedes later credit settlement activity.");
			J.voidReturnCredit({
				supplierCreditId: n.supplierCreditId,
				reason: t.reason,
				voidDate: t.voidDate
			});
			let i = n.lines.map((e) => {
				ec.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let r = As.create({
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
					referenceId: n.id,
					referenceNumber: n.returnNumber,
					occurredAt: t.voidDate,
					notes: t.reason
				}), i = Ys({
					siteId: e.siteId,
					productId: e.productId,
					quantityBase: e.quantityBase,
					unitCostBase: e.unitCostBase,
					inventoryValue: e.inventoryValue,
					referenceType: "SUPPLIER_RETURN_VOID",
					referenceId: n.id,
					referenceNumber: n.returnNumber,
					inventoryMovementId: r.id,
					occurredAt: t.voidDate,
					notes: t.reason
				}).movement;
				return {
					...e,
					voidInventoryMovementId: r.id,
					voidCostMovementId: i.id
				};
			});
			n.journalId && F.reverse({
				journalEntryId: n.journalId,
				reversalDate: t.voidDate,
				reason: t.reason
			});
			let a = {
				...n,
				status: "VOID",
				lines: i,
				voidDate: t.voidDate,
				voidReason: t.reason,
				voidedAt: (/* @__PURE__ */ new Date()).toISOString(),
				voidedBy: T.current()?.userId ?? "local-test"
			};
			return yd = yd.map((e) => e.id === n.id ? a : e), Sd(), a;
		}
	},
	read: "purchases.return.read",
	commands: {
		create: "purchases.return",
		reverse: "purchases.return"
	},
	snapshot: () => ({ returns: yd }),
	restore: (e) => {
		yd = e.returns;
	},
	publish: Sd,
	validate: (e, t) => {
		let n = w({ returns: r(vd) }).strict().parse(e), i = t, a = /* @__PURE__ */ new Set();
		for (let e of n.returns) {
			C(e.returnDate), e.voidDate && C(e.voidDate);
			let t = gd.parse(JSON.parse(e.requestFingerprint));
			if (a.has(e.operationId) || t.operationId !== e.operationId || t.supplierBillId !== e.supplierBillId || t.returnDate !== e.returnDate) throw Error("Supplier return operation mismatch.");
			a.add(e.operationId);
			let n = i.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId && t.supplierId === e.supplierId), r = i.supplierCredits.supplierCredits.find((t) => t.id === e.supplierCreditId && t.physicalReturnId === e.id && t.sourceSupplierBillId === e.supplierBillId);
			if (!n || !r || e.status === "VOID" != (r.status === "VOID")) throw Error("Supplier return bill/credit reference is invalid.");
			if (wd(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue) throw Error("Supplier return cost total is invalid.");
			for (let t of e.lines) {
				let r = i.receiptMatches.matches.find((n) => n.id === t.matchId && n.supplierBillId === e.supplierBillId && n.supplierBillLineId === t.supplierBillLineId && n.goodsReceiptId === t.goodsReceiptId && n.goodsReceiptLineId === t.goodsReceiptLineId), a = i.costMovements.movements.find((e) => e.id === t.costMovementId), o = i.inventoryMovements.movements.find((e) => e.id === t.inventoryMovementId), s = i.goodsReceipts.goodsReceipts.find((e) => e.id === t.goodsReceiptId), c = n.lines.find((e) => e.id === t.supplierBillLineId);
				if (!r || !c || c.productId !== t.productId || c.unitId !== t.unitId || s?.siteId !== t.siteId || r.productId !== t.productId || !a || !o || a.referenceType !== "SUPPLIER_RETURN" || a.referenceId !== e.id || a.inventoryMovementId !== o.id || a.siteId !== t.siteId || a.productId !== t.productId || a.unitCostBase !== t.unitCostBase || a.quantityBase !== -t.quantityBase || wd(-a.valueChange) !== wd(t.inventoryValue) || Cd(t.quantity * t.conversionToBase) !== t.quantityBase || o.referenceType !== "SUPPLIER_RETURN" || o.referenceId !== e.id || o.siteId !== t.siteId || o.productId !== t.productId || o.quantityBase !== -t.quantityBase || o.transactionQuantity !== -t.quantity || x(o.occurredAt) !== e.returnDate) throw Error("Supplier return stock/cost reference is invalid.");
				if (e.status === "VOID") {
					let n = i.costMovements.movements.find((e) => e.id === t.voidCostMovementId), r = i.inventoryMovements.movements.find((e) => e.id === t.voidInventoryMovementId);
					if (!n || !r || n.inventoryMovementId !== r.id || n.referenceType !== "SUPPLIER_RETURN_VOID" || n.referenceId !== e.id || n.siteId !== t.siteId || n.productId !== t.productId || n.quantityBase !== t.quantityBase || wd(n.valueChange) !== wd(t.inventoryValue) || r.referenceType !== "SUPPLIER_RETURN_VOID" || r.quantityBase !== t.quantityBase || r.referenceId !== e.id || x(n.occurredAt) !== e.voidDate) throw Error("Supplier return reversal reference is invalid.");
				}
			}
			let o = /* @__PURE__ */ new Set();
			for (let n of e.lines) {
				if (o.has(n.matchId)) throw Error("Duplicate return receipt match.");
				o.add(n.matchId);
				let e = t.lines.find((e) => e.matchId === n.matchId);
				if (!e || e.quantity !== n.quantity) throw Error("Supplier return request quantities mismatch.");
			}
			if (t.lines.length !== e.lines.length) throw Error("Supplier return request line count mismatch.");
			for (let t of new Set(e.lines.map((e) => e.supplierBillLineId))) {
				let n = Cd(e.lines.filter((e) => e.supplierBillLineId === t).reduce((e, t) => e + t.quantity, 0));
				if (!r.lines.some((e) => e.supplierBillLineId === t && e.quantity === n)) throw Error("Supplier return linked credit quantity mismatch.");
			}
			if (e.status === "VOID" && (!e.voidDate || e.voidDate < e.returnDate || !e.voidReason || !e.voidedBy)) throw Error("Supplier return reversal metadata is invalid.");
			if (e.inventoryValue && !i.journals.journalEntries.some((t) => t.id === e.journalId && t.sourceId === e.id && t.sourceType === "SUPPLIER_RETURN" && t.totalDebit === e.inventoryValue && (e.status === "VOID" ? t.status === "REVERSED" : t.status === "POSTED"))) throw Error("Supplier return journal reference is invalid.");
		}
		for (let e of i.supplierCredits.supplierCredits) if (e.physicalReturnId && !n.returns.some((t) => t.id === e.physicalReturnId && t.supplierCreditId === e.id)) throw Error("Supplier credit physical return reference is invalid.");
		for (let e of i.receiptMatches.matches) if (Cd(n.returns.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0)) > e.matchedBaseQuantity + 1e-8) throw Error("Supplier return quantities exceed the receipt match.");
	}
});
//#endregion
//#region src/features/document-output/outputRepository.ts
var Dd = g().min(1).max(200), Od = g().max(2e4), kd = Od.optional(), Ad = [
	"QUOTE",
	"SALES_ORDER",
	"INVOICE",
	"CREDIT_NOTE"
], jd = w({
	operationId: Dd,
	sourceId: Dd,
	kind: f(Ad),
	expectedUpdatedAt: Dd,
	templateId: Dd.optional()
}).strict(), Md = p().finite().nonnegative(), Nd = w({
	itemType: f([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	id: Dd,
	sku: Od,
	description: Od,
	unitSymbol: Od,
	quantity: p().positive().finite(),
	unitPrice: Md,
	lineSubtotal: Md,
	taxAmount: Md,
	lineTotal: Md,
	taxCode: kd,
	taxRate: p().finite().min(0).max(1).optional(),
	requestedArea: p().positive().finite().optional(),
	areaPerPack: p().positive().finite().optional(),
	coveredArea: p().positive().finite().optional()
}).strict(), Pd = w({
	locationId: kd,
	locationName: kd,
	deliveryAddress: kd,
	accountingContactId: kd,
	accountingContactName: kd,
	accountingEmail: kd
}).strict(), Fd = w({
	id: Dd,
	revision: Dd,
	name: Od,
	subject: Od,
	body: Od,
	footer: Od,
	paper: f(["A4", "Letter"])
}).strict(), Id = w({
	id: Dd,
	operationId: Dd,
	requestFingerprint: Od,
	preparedAt: Dd,
	preparedBy: Dd,
	sourceId: Dd,
	kind: f(Ad),
	sourceUpdatedAt: Dd,
	documentNumber: Dd,
	status: Dd,
	documentDate: Dd,
	dueDate: kd,
	expiryDate: kd,
	reference: kd,
	notes: kd,
	customerId: Dd,
	customerName: Od,
	customerCode: Od,
	customerIdentifier: kd,
	recipient: Pd.optional(),
	issuer: w({
		name: Od,
		tradingName: kd,
		identifier: kd,
		address: kd,
		email: kd,
		phone: kd,
		currency: Dd
	}).strict(),
	lines: r(Nd).min(1),
	totals: w({
		subtotal: Md,
		taxAmount: Md,
		total: Md
	}).strict(),
	amountPaid: Md.optional(),
	amountDue: Md.optional(),
	template: Fd,
	subject: Od,
	body: Od
}).strict();
function Ld(e, t) {
	if (e === "CREDIT_NOTE") {
		let e = z.getById(t);
		if (!e) throw Error("Credit note was not found.");
		return {
			...e,
			type: "CREDIT_NOTE",
			documentNumber: e.creditNoteNumber,
			documentDate: e.creditDate
		};
	}
	let n = U.getById(t);
	if (!n || n.type !== e) throw Error("Sales document was not found.");
	return n;
}
var Rd = (e) => e === "QUOTE" ? "Quotation" : e === "INVOICE" ? "Invoice" : e === "SALES_ORDER" ? "Sales order" : "Credit note";
function zd() {
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
var Bd = [];
zd();
var Vd = 0, Hd = /* @__PURE__ */ new Set(), Ud = () => {
	Vd++, Hd.forEach((e) => e());
};
function Wd(e, t) {
	let n = t ? S.templates?.find((n) => n.id === t && n.status === "Active" && n.kind === Rd(e)) : void 0;
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
var Gd = [
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
function Kd(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!Gd.includes(n)) throw Error(`Unsupported template token: ${n}.`);
		return t[n] ?? "";
	});
}
function qd(e) {
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
var Jd = { prepare(e) {
	let t = jd.parse(e), n = JSON.stringify(t), r = Bd.find((e) => e.operationId === t.operationId);
	if (r) {
		if (r.requestFingerprint !== n) throw Error("Operation ID was used for different output data.");
		return r;
	}
	let i = Ld(t.kind, t.sourceId);
	if (i.updatedAt !== t.expectedUpdatedAt) throw Error("Source document changed. Reload before preparing output.");
	let a = D.getById(i.customerId);
	if (!a) throw Error("Source customer was not found.");
	let o = _(), s = Wd(t.kind, t.templateId), c = structuredClone(i.recipient), l = {
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
		lines: i.lines.map(qd),
		totals: structuredClone(i.totals),
		amountPaid: "amountPaid" in i ? i.amountPaid : void 0,
		amountDue: "amountDue" in i ? i.amountDue : void 0,
		template: {
			...s,
			footer: Kd(s.footer, l)
		},
		subject: Kd(s.subject, l),
		body: Kd(s.body, l)
	};
	return Yd(u), Bd = [u, ...Bd], Ud(), u;
} };
function Yd(e) {
	let t = Id.parse(e);
	if (Gi(t.recipient), !Number.isFinite(Date.parse(t.preparedAt))) throw Error("Invalid preparation timestamp.");
	let n = jd.parse(JSON.parse(t.requestFingerprint));
	if (n.operationId !== t.operationId || n.sourceId !== t.sourceId || n.kind !== t.kind || n.expectedUpdatedAt !== t.sourceUpdatedAt) throw Error("Output source metadata mismatch.");
	let r = (e) => Math.round(e * 100) / 100;
	for (let e of t.lines) if (Ui(e), r(e.lineSubtotal + e.taxAmount) !== e.lineTotal) throw Error("Invalid output line total.");
	for (let [e, n] of [
		["subtotal", "lineSubtotal"],
		["taxAmount", "taxAmount"],
		["total", "lineTotal"]
	]) if (r(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Invalid output totals.");
	return t;
}
y("preparedSalesOutputs", {
	repository: Jd,
	read: "sales.read",
	commands: { prepare: "documents.prepare" },
	snapshot: () => ({
		artifacts: Bd,
		templates: zd()
	}),
	restore: (e) => {
		Bd = e.artifacts, e.templates;
	},
	publish: Ud,
	validate: (e, t) => {
		let n = w({
			artifacts: r(Id),
			templates: r(w({
				id: Dd,
				name: Od,
				kind: Dd
			}).strict())
		}).strict().parse(e), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Set();
		for (let e of n.artifacts) {
			if (Yd(e), i.has(e.id) || a.has(e.operationId)) throw Error("Duplicate prepared output.");
			i.add(e.id), a.add(e.operationId);
			let n = t, r = e.kind === "CREDIT_NOTE" ? n.customerCredits.creditNotes.find((t) => t.id === e.sourceId) : [
				...n.sales.quotes,
				...n.sales.salesOrders,
				...n.sales.invoices
			].find((t) => t.id === e.sourceId && t.type === e.kind);
			if (!r || r.customerId !== e.customerId) throw Error("Prepared output source reference is invalid.");
		}
	}
});
//#endregion
//#region src/features/accounting/data/inventoryAccountingPostingService.ts
function Xd(e) {
	return P.requireBySystemRole(e).id;
}
function Zd(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Qd(e) {
	return F.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function $d(e) {
	let t = Bs.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var ef = {
	postSalesFulfilment(e) {
		let t = Qd(e.id);
		if (t) return t;
		let n = Zd($d(e).reduce((e, t) => {
			if (t.valueChange > 0) throw Error(`Sales fulfilment cost movement ${t.costMovementNumber} has an invalid positive inventory value change.`);
			return e - t.valueChange;
		}, 0));
		if (!Number.isFinite(n) || n < 0) throw Error("Sales fulfilment COGS amount is invalid.");
		if (n !== 0) return F.post({
			journalDate: e.fulfilmentDate,
			description: `COGS for sales fulfilment ${e.fulfilmentNumber}`,
			reference: e.fulfilmentNumber,
			sourceType: "SALES_FULFILMENT",
			sourceId: e.id,
			lines: [{
				accountId: Xd("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: Xd("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = Qd(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? F.getById(r.reversalJournalEntryId) : void 0 : F.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, tf = /* @__PURE__ */ new Set(), nf = [], rf = nf;
function af() {
	rf = nf, tf.forEach((e) => e());
}
function of() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = nf.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function sf(e, t) {
	return G(nf.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function cf(e) {
	let t = U.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.filter(St).map((e) => sf(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.filter(St).every((e, t) => n[t] >= G(e.quantity));
	U.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function lf(e) {
	let t = Bs.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var uf = {
	subscribe(e) {
		return tf.add(e), () => {
			tf.delete(e);
		};
	},
	getSnapshot() {
		return rf;
	},
	getAll() {
		return rf;
	},
	getById(e) {
		return nf.find((t) => t.id === e);
	},
	getBySalesOrder(e) {
		return nf.filter((t) => t.salesOrderId === e);
	},
	getFulfilledQuantity: sf,
	getRemainingQuantity(e, t) {
		let n = U.getById(e);
		if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let r = n.lines.find((e) => e.id === t);
		if (!r) throw Error("Sales order line was not found.");
		return St(r) ? G(r.quantity - sf(e, t)) : 0;
	},
	create(e) {
		let t = U.getById(e.salesOrderId);
		if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let n = t;
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "INVOICED") throw Error("Only a confirmed or partially fulfilled sales order can be fulfilled.");
		if (n.status === "INVOICED" && !n.invoiceIds.some((e) => {
			let t = U.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("This order has no active invoice; do not fulfil a void invoice.");
		let r = Ts.getById(e.siteId);
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
			if (!St(t)) throw Error("Non-stock and service lines do not require inventory dispatch.");
			let i = O(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let o = Dt(t.productId, t.unitId);
			if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
			if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
			let s = G(e.fulfilledQuantity);
			if (t.areaPerPack && !Number.isInteger(e.fulfilledQuantity)) throw Error("Area-based lines must be dispatched in whole packs.");
			let c = sf(n.id, t.id);
			if (s > G(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
			let l = G(s * o.conversionToBase), u = ec.getBalance(r.id, t.productId);
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
			let n = ec.getBalance(r.id, e);
			if (!n || n.quantityOnHand < t) {
				let t = O(e);
				throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
			}
		}
		let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = of(), d = o.map((e) => ({
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
			let i = O(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let a = As.create({
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
			Js({
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
			}), ec.issue({
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: t.fulfilledBaseQuantity
			});
		}
		return ef.postSalesFulfilment(f), nf = [f, ...nf], af(), cf(n.id), f;
	},
	void(e) {
		let t = nf.find((t) => t.id === e.fulfilmentId);
		if (!t) throw Error("Sales fulfilment was not found.");
		if (t.status === "VOIDED") throw Error("Sales fulfilment has already been voided.");
		if (Number.isNaN(Date.parse(e.voidDate))) throw Error("Fulfilment void date is invalid.");
		if (e.voidDate < t.fulfilmentDate) throw Error("Fulfilment void date cannot be earlier than the fulfilment date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Fulfilment void reason must contain at least 3 characters.");
		let r = U.getById(t.salesOrderId);
		if (!r || r.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		if (r.status === "INVOICED" && r.invoiceIds.some((e) => {
			let t = U.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("Cannot void a sales fulfilment for an invoiced sales order.");
		if (r.status !== "CONFIRMED" && r.status !== "PARTIALLY_FULFILLED" && r.status !== "FULFILLED" && r.status !== "INVOICED") throw Error(`Cannot void a sales fulfilment when the sales order status is ${r.status}.`);
		let i = lf(t), a = /* @__PURE__ */ new Set(), o = t.lines.map((e) => {
			let n = O(e.productId);
			if (!n) throw Error(`Product ${e.sku} was not found.`);
			let r = i.find((n) => !a.has(n.id) && n.siteId === t.siteId && n.productId === e.productId && Math.abs(n.quantityBase) === e.fulfilledBaseQuantity);
			if (!r) throw Error(`Unique original inventory cost issue for ${e.sku} was not found.`);
			return a.add(r.id), {
				line: e,
				product: n,
				originalIssue: r
			};
		});
		ef.reverseSalesFulfilment({
			fulfilment: t,
			reversalDate: e.voidDate,
			reason: n
		});
		for (let r of o) {
			let { line: i, product: a, originalIssue: o } = r, s = As.create({
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
			Ys({
				siteId: t.siteId,
				productId: i.productId,
				quantityBase: i.fulfilledBaseQuantity,
				unitCostBase: o.unitCostBase,
				inventoryValue: fs(Math.abs(o.valueChange)),
				referenceType: "SALE",
				referenceId: t.id,
				referenceNumber: t.fulfilmentNumber,
				inventoryMovementId: s.id,
				occurredAt: e.voidDate,
				notes: `Void sales fulfilment ${t.fulfilmentNumber}: ${n}`
			}), ec.receive({
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
		return nf = nf.map((e) => e.id === s.id ? s : e), af(), cf(t.salesOrderId), s;
	}
};
y("fulfilments", {
	repository: uf,
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: nf }),
	restore: (e) => {
		nf = e.fulfilments, rf = nf;
	},
	publish: () => tf.forEach((e) => e())
});
//#endregion
//#region src/features/direct-documents/dispatchRepository.ts
var df = g().trim().min(1).max(200), ff = w({
	operationId: df,
	salesOrderId: df,
	siteId: df,
	fulfilmentDate: df,
	lines: r(w({
		salesOrderLineId: df,
		fulfilledQuantity: p().positive().finite()
	}).strict()).min(1).max(500)
}).strict();
function pf() {
	return U.getAll().filter((e) => e.type === "SALES_ORDER" && [
		"CONFIRMED",
		"PARTIALLY_FULFILLED",
		"INVOICED"
	].includes(e.status)).filter((e) => e.type === "SALES_ORDER" && (e.status !== "INVOICED" || e.invoiceIds.some((e) => {
		let t = U.getById(e);
		return t?.type === "INVOICE" && t.status !== "VOID";
	}))).map((e) => ({
		id: e.id,
		number: e.documentNumber,
		date: e.documentDate,
		delivery: e.recipient?.deliveryAddress,
		store: e.recipient?.locationName,
		lines: e.lines.filter(St).map((t) => ({
			id: t.id,
			sku: t.sku,
			description: t.description,
			unit: t.unitSymbol,
			quantity: t.quantity,
			fulfilled: uf.getAll().filter((t) => t.salesOrderId === e.id && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t.id).reduce((e, t) => e + t.fulfilledQuantity, 0)
		}))
	})).filter((e) => e.lines.length > 0);
}
pf();
var mf = [], hf = 0, gf = /* @__PURE__ */ new Set(), _f = () => {
	hf++, gf.forEach((e) => e());
};
y("salesDispatch", {
	repository: {
		record(e) {
			let t = ff.parse(e), n = JSON.stringify(t), r = mf.find((e) => e.id === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Dispatch operation ID was already used with different data.");
				return uf.getAll().find((e) => e.id === r.fulfilmentId);
			}
			if (R(), C(t.fulfilmentDate), mr(t.fulfilmentDate), new Set(t.lines.map((e) => e.salesOrderLineId)).size !== t.lines.length) throw Error("Each dispatch line must be selected only once.");
			let i = uf.create(t);
			return mf = [...mf, {
				id: t.operationId,
				fingerprint: n,
				fulfilmentId: i.id
			}], _f(), i;
		},
		reverse(e) {
			let t = w({
				fulfilmentId: df,
				voidDate: df,
				reason: g().trim().min(3).max(1e3)
			}).strict().parse(e);
			R(), C(t.voidDate), mr(t.voidDate);
			let n = uf.getAll().find((e) => e.id === t.fulfilmentId);
			return n?.status === "VOIDED" ? n : uf.void(t);
		}
	},
	read: "inventory.read",
	commands: {
		record: "inventory.adjust",
		reverse: "inventory.adjust"
	},
	snapshot: () => ({
		orders: pf(),
		requests: mf
	}),
	restore: (e) => {
		e.orders, mf = e.requests;
	},
	publish: _f,
	validate: (e, t) => {
		let n = w({
			orders: r(w({
				id: df,
				number: df,
				date: df,
				delivery: g().optional(),
				store: g().optional(),
				lines: r(w({
					id: df,
					sku: g(),
					description: g(),
					unit: g(),
					quantity: p().finite().positive(),
					fulfilled: p().finite().nonnegative()
				}).strict())
			}).strict()),
			requests: r(w({
				id: df,
				fingerprint: g().max(1e6),
				fulfilmentId: df
			}).strict())
		}).strict().parse(e), i = t.fulfilments.fulfilments;
		if (n.requests.some((e) => !i.some((t) => t.id === e.fulfilmentId))) throw Error("Dispatch result reference is invalid.");
	}
});
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function vf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function yf(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) {
		if (r.has(t.id)) {
			i = vf(i + t.moneyIn), a = vf(a + t.moneyOut);
			continue;
		}
		o = vf(o + t.moneyIn), s = vf(s + t.moneyOut);
	}
	let c = vf(vf(t) + o - s), l = vf(e.closingBalance), u = vf(c - l);
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
var bf = /* @__PURE__ */ new Set(), xf = M.read().reconciliations;
M.onRollback(() => {
	xf = M.read().reconciliations;
});
function Sf() {
	M.update("reconciliations", xf), bf.forEach((e) => M.notify(e));
}
function Cf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function wf(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function Tf() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Ef(e) {
	return `BREC-${e.slice(0, 4)}-${String(xf.length + 1).padStart(4, "0")}`;
}
function Df(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of xf) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var Of = {
	subscribe(e) {
		return bf.add(e), () => {
			bf.delete(e);
		};
	},
	getSnapshot() {
		return xf;
	},
	getAll() {
		return xf;
	},
	getByBankAccount(e) {
		return xf.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return Df(e);
	},
	complete(e) {
		if (wf(e.statementDate), C(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let t = Bi.requireById(e.bankAccountId);
		if (!t.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < t.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let n = this.getLatestByBankAccount(t.id);
		if (n && e.statementDate <= n.statementDate) throw Error(`Statement date must be after the last reconciled date ${n.statementDate}.`);
		let r = ul(t, F.getAll(), e.statementDate), i = new Set(r.transactions.map((e) => e.id)), a = Df(t.id), o = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !a.has(e));
		for (let e of o) if (!i.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let s = /* @__PURE__ */ new Set([...a, ...o]), c = yf(r, Cf(e.statementBalance), Array.from(s));
		if (!c.reconciled) throw Error(`Bank reconciliation is out by ${c.difference.toFixed(2)}.`);
		let l = {
			id: Tf(),
			reconciliationNumber: Ef(e.statementDate),
			bankAccountId: t.id,
			statementDate: e.statementDate,
			statementBalance: Cf(e.statementBalance),
			bookBalance: c.bookBalance,
			outstandingDeposits: c.outstandingDeposits,
			outstandingPayments: c.outstandingPayments,
			adjustedStatementBalance: c.adjustedStatementBalance,
			difference: c.difference,
			clearedTransactionIds: o,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return xf = [l, ...xf], Sf(), l;
	}
}, kf = Of.complete;
Of.complete = function(e) {
	return R(), M.transaction(() => kf.call(Of, e));
}, y("bankReconciliations", {
	repository: Of,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: xf }),
	restore: (e) => {
		xf = e.reconciliations;
	},
	publish: () => bf.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/settlementRepository.ts
var Af = (e) => Math.round((e + 2 ** -52) * 100) / 100, jf = g().trim().min(1).max(200), Mf = p().finite().positive().refine((e) => Af(e) === e, "Use cents precision"), Nf = w({
	operationId: jf,
	customerId: jf,
	paymentDate: jf,
	bankAccountId: jf,
	reference: g().max(500).optional(),
	allocations: r(w({
		invoiceId: jf,
		amount: Mf
	}).strict()).min(1).max(500)
}).strict(), Pf = w({
	operationId: jf,
	creditId: jf,
	paymentDate: jf,
	bankAccountId: jf,
	amount: Mf,
	reference: g().max(500).optional()
}).strict(), Ff = [], If = [], Lf = [], Rf = 0, zf = /* @__PURE__ */ new Set(), Bf = () => {
	Rf++, zf.forEach((e) => e());
};
function Vf(e, t, n) {
	let r = JSON.stringify(n), i = e.find((e) => e.operationId === t);
	if (i && i.fingerprint !== r) throw Error("Operation ID was already used with different data.");
	return {
		old: i,
		fingerprint: r
	};
}
function Hf(e, t) {
	C(t, "Payment date");
	let n = Bi.requireById(e);
	if (!n.active || t < n.openingBalanceDate) throw Error("Bank is inactive or payment precedes its opening date.");
	let r = P.requireById(n.glAccountId);
	if (!r.active || r.type !== "ASSET") throw Error("Invalid bank ledger account.");
	return n;
}
function Uf(e) {
	if (Of.getAll().some((t) => t.clearedTransactionIds.some((t) => t.startsWith(e + ":")))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Wf(e, t) {
	let n = e === "customer" ? z.getById(t) : J.getById(t);
	if (!n || n.status === "VOID" || n.status === "DRAFT") throw Error("An issued credit is required.");
	return n;
}
function Gf(e, t, n) {
	let r = Wf(e, t), i = Af(n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0)), a = Af(r.totals.total - r.amountApplied - i);
	if (a < 0) throw Error("Refund exceeds the unused credit.");
	let o = {
		...r,
		refundEvents: n,
		amountRefunded: i,
		amountAvailable: a,
		status: a === 0 ? "FULLY_APPLIED" : "ISSUED",
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	e === "customer" ? z.update(o) : J.update(o);
}
function Kf(e, t) {
	R();
	let n = Pf.parse(t), { old: r, fingerprint: i } = Vf(e === "customer" ? If : Lf, n.operationId, n);
	if (r) return r;
	let a = Wf(e, n.creditId), o = Hf(n.bankAccountId, n.paymentDate);
	if (n.paymentDate < a.creditDate || n.amount > a.amountAvailable) throw Error("Refund date/amount exceeds the available credit.");
	let s = P.requireBySystemRole(e === "customer" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"), c = crypto.randomUUID(), l = F.post({
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
	return Gf(e, a.id, [...a.refundEvents ?? [], {
		id: u.id,
		date: u.paymentDate,
		amount: u.amount
	}]), e === "customer" ? If = [...If, u] : Lf = [...Lf, u], Bf(), u;
}
function qf(e, t) {
	if (R(), C(t.reversalDate, "Reversal date"), !t.reason?.trim() || t.reason.trim().length < 3) throw Error("Enter a reversal reason.");
	let n = e === "customer" ? If : Lf, r = n.find((e) => e.id === t.id);
	if (!r) throw Error("Refund was not found.");
	if (r.status === "REVERSED") return r;
	if (t.reversalDate < r.paymentDate) throw Error("Reversal cannot precede the refund.");
	Uf(r.journalEntryId), F.reverse({
		journalEntryId: r.journalEntryId,
		reversalDate: t.reversalDate,
		reason: t.reason
	});
	let i = Wf(e, r.creditId);
	Gf(e, i.id, (i.refundEvents ?? []).map((e) => e.id === r.id ? {
		...e,
		reversalDate: t.reversalDate
	} : e));
	let a = {
		...r,
		status: "REVERSED",
		reversalDate: t.reversalDate
	};
	return e === "customer" ? If = n.map((e) => e.id === r.id ? a : e) : Lf = n.map((e) => e.id === r.id ? a : e), Bf(), a;
}
var Jf = {
	recordReceipt(e) {
		let t = Nf.parse(e), { old: n, fingerprint: r } = Vf(Ff, t.operationId, t);
		if (n) return n;
		if (Hf(t.bankAccountId, t.paymentDate), new Set(t.allocations.map((e) => e.invoiceId)).size !== t.allocations.length) throw Error("Each invoice may only be allocated once.");
		for (let e of t.allocations) {
			let n = U.getAll().find((t) => t.id === e.invoiceId && t.type === "INVOICE");
			if (!n || n.type !== "INVOICE" || n.customerId !== t.customerId || t.paymentDate < n.documentDate || ["VOID", "DRAFT"].includes(n.status) || e.amount > n.amountDue) throw Error("Invalid invoice customer, date or outstanding amount.");
		}
		let i = t.allocations.map((e, n) => U.recordInvoicePayment({
			...t,
			invoiceId: e.invoiceId,
			amount: e.amount,
			method: "BANK_TRANSFER",
			operationId: t.operationId + ":" + n
		})), a = {
			...t,
			id: crypto.randomUUID(),
			fingerprint: r,
			amount: Af(i.reduce((e, t) => e + t.amount, 0)),
			paymentIds: i.map((e) => e.id),
			status: "POSTED"
		};
		return Ff = [...Ff, a], Bf(), a;
	},
	reverseReceipt(e) {
		let t = Ff.find((t) => t.id === e.id);
		if (!t) throw Error("Receipt not found.");
		if (t.status === "REVERSED") return t;
		for (let e of t.paymentIds) {
			let t = So.getById(e);
			if (!t || t.status !== "RECEIVED") throw Error("Receipt allocations changed; inspect individual payments first.");
			for (let t of F.getBySource("CUSTOMER_PAYMENT", e)) Uf(t.id);
		}
		for (let n of t.paymentIds) U.reverseInvoicePayment(n, e.reason);
		let n = {
			...t,
			status: "REVERSED",
			reversalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		};
		return Ff = Ff.map((e) => e.id === t.id ? n : e), Bf(), n;
	},
	createRefund: (e) => Kf("customer", e),
	reverseRefund: (e) => qf("customer", e)
}, Yf = {
	create: (e) => Kf("supplier", e),
	reverse: (e) => qf("supplier", e),
	repairLegacyCredits(e) {
		if (R(), C(e.date, "Repair date"), e.reason?.trim().length < 3) throw Error("Enter a repair reason.");
		let t = [];
		for (let n of J.getAll().filter((e) => e.status !== "VOID")) {
			if (e.date < n.creditDate || F.getBySource("SUPPLIER_CREDIT_RECLASS", n.id).length) continue;
			let r = F.getBySource("SUPPLIER_CREDIT", n.id).find((e) => e.status === "POSTED");
			if (!r) continue;
			let i = P.requireBySystemRole("INVENTORY"), a = P.requireBySystemRole("PURCHASE_PRICE_VARIANCE"), o = Af(r.lines.filter((e) => e.accountId === i.id).reduce((e, t) => e + t.credit - t.debit, 0));
			o <= 0 || t.push(F.post({
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
}, Xf = w({
	id: jf,
	operationId: jf,
	fingerprint: jf,
	creditId: jf,
	contactId: jf,
	paymentDate: jf,
	bankAccountId: jf,
	amount: Mf,
	journalEntryId: jf,
	status: f(["POSTED", "REVERSED"]),
	reference: g().optional(),
	reversalDate: g().optional()
}).strict();
y("customerSettlements", {
	repository: Jf,
	read: "sales.read",
	commands: {
		recordReceipt: "sales.payment",
		reverseReceipt: "sales.payment",
		createRefund: "sales.payment",
		reverseRefund: "sales.payment"
	},
	snapshot: () => ({
		receipts: Ff,
		refunds: If
	}),
	restore: (e) => {
		Ff = e.receipts, If = e.refunds;
	},
	validate: (e, t) => {
		Zf(e, t, !1);
		let n = e;
		r(Xf.extend({ fingerprint: g() })).parse(n.refunds), r(w({
			id: jf,
			operationId: jf,
			paymentIds: r(jf),
			amount: Mf,
			status: f(["POSTED", "REVERSED"])
		}).passthrough()).parse(n.receipts);
	},
	publish: Bf
}), y("supplierRefunds", {
	repository: Yf,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		repairLegacyCredits: "accounting.recover"
	},
	snapshot: () => ({ refunds: Lf }),
	restore: (e) => {
		Lf = e.refunds;
	},
	validate: (e, t) => {
		Zf(e, t, !0), r(Xf.extend({ fingerprint: g() })).parse(e.refunds);
	},
	publish: Bf
});
function Zf(e, t, n) {
	let r = e, i = t.journals.journalEntries, a = n ? t.supplierCredits.supplierCredits : t.customerCredits.creditNotes, o = t.bankAccounts.bankAccounts;
	for (let e of r.refunds) {
		let t = a.find((t) => t.id === e.creditId), r = i.find((t) => t.id === e.journalEntryId), s = t?.refundEvents?.find((t) => t.id === e.id);
		if (!t || e.contactId !== ("customerId" in t ? t.customerId : t.supplierId) || !s || s.amount !== e.amount || s.date !== e.paymentDate || s.reversalDate !== e.reversalDate || !o.some((t) => t.id === e.bankAccountId) || !r || r.sourceId !== e.id || r.sourceType !== (n ? "SUPPLIER_REFUND" : "CUSTOMER_REFUND") || r.totalDebit !== e.amount || r.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) throw Error("Refund snapshot relationships are invalid.");
	}
	for (let e of a) {
		let t = Af(r.refunds.filter((t) => t.creditId === e.id && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
		if ((e.amountRefunded ?? 0) !== t) throw Error("Credit refunded balance is invalid.");
	}
	for (let e of a) for (let t of e.refundEvents ?? []) if (!r.refunds.some((n) => n.id === t.id && n.creditId === e.id)) throw Error("Credit refund history has no settlement record.");
	if (!n) {
		let e = t.customerPayments.payments;
		for (let t of r.receipts ?? []) {
			let n = t.paymentIds.map((t) => e.find((e) => e.id === t));
			if (new Set(t.paymentIds).size !== t.paymentIds.length || !n.length || n.some((e) => !e || e.customerId !== t.customerId || e.bankAccountId !== t.bankAccountId || e.status !== (t.status === "REVERSED" ? "REVERSED" : "RECEIVED")) || Af(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== t.amount) throw Error("Receipt allocation snapshot relationships are invalid.");
		}
	}
}
//#endregion
//#region src/features/sales/data/invoiceBalanceAsAtService.ts
function Qf(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= tp(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: np(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => $f(e, r)), a = np(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && ep(t, r)), s = np(o.reduce((e, t) => e + t.amount, 0)), c = np(e.totals.total), l = np(Math.max(0, c - a - s));
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
function $f(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < tp(e.reversedAt) : !1;
}
function ep(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < tp(e.reversedAt) : !1;
}
function tp(e) {
	return x(e);
}
function np(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function rp(e, t, n) {
	let r = op(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= ap(e.voidedAt)) return ip(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && ep(t, n)), a = op(i.reduce((e, t) => e + t.amount, 0)), o = op(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - a));
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
function ip(e, t, n) {
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
function ap(e) {
	return x(e);
}
function op(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function sp(e, t, n = [], r = [], i = [], a = up()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = Qf(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = cp(e.dueDate, a);
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
		current: dp(s.current),
		days1To30: dp(s.days1To30),
		days31To60: dp(s.days31To60),
		days61To90: dp(s.days61To90),
		days90Plus: dp(s.days90Plus)
	}, p = dp(c), m = dp(l), h = dp(i.reduce((t, n) => n.customerId === e.id ? t + rp(n, r, a).amountAvailable : t, 0)), ee = dp(p - h);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: h,
		netAccountBalance: ee,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: dp(Math.max(0, e.creditLimit - Math.max(0, ee))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function cp(e, t = up()) {
	let n = lp(e), r = lp(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function lp(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function up() {
	return x((/* @__PURE__ */ new Date()).toISOString());
}
function dp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function fp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function pp(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function mp(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? fp(t - n) : fp(n - t);
}
function hp(e, t, n) {
	pp(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = fp(t + r.debit), n = fp(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: mp(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = fp(r.reduce((e, t) => e + t.totalDebit, 0)), o = fp(r.reduce((e, t) => e + t.totalCredit, 0));
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
function gp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function _p({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = sp(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: gp(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = gp(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = gp(hp(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = gp(l - d);
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
function vp(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && yp(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = bp(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && yp(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = bp(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && yp(n.reversedAt) <= r ? t : t + n.amount, 0)), o = bp(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: bp(Math.max(0, o - i - a))
	};
}
function yp(e) {
	return x(e);
}
function bp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function xp(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && Sp(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = Cp(e.totals.total), i = Cp(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && Sp(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: Cp(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - i))
	};
}
function Sp(e) {
	return x(e);
}
function Cp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function wp(e, t, n = [], r = [], i = [], a = jp()) {
	let o = Dp(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = vp(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = Ep(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = Ap(r.reduce((t, n) => n.supplierId === e.id ? t + xp(n, i, a).amountAvailable : t, 0)), p = Ap(s), m = Ap(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: Ap(c),
		aging: Op(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function Tp(e, t, n = [], r = [], i = [], a = jp()) {
	let o = Dp(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let h of e) {
		let e = wp(h, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: Ap(s),
		unallocatedCredit: Ap(c),
		totalOutstanding: Ap(l),
		overdueAmount: Ap(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: Op(o)
	};
}
function Ep(e, t = jp()) {
	let n = kp(e), r = kp(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Dp() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function Op(e) {
	return {
		current: Ap(e.current),
		days1To30: Ap(e.days1To30),
		days31To60: Ap(e.days31To60),
		days61To90: Ap(e.days61To90),
		days90Plus: Ap(e.days90Plus)
	};
}
function kp(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function Ap(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function jp() {
	return x((/* @__PURE__ */ new Date()).toISOString());
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function Mp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Np({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = Tp(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = Mp(hp(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = Mp(c.totalOutstanding), f = Mp(d - u);
	return {
		asOfDate: s,
		grossOutstanding: Mp(c.grossOutstanding),
		unallocatedCredit: Mp(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function Pp(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function Fp(e) {
	return e.slice(0, 10);
}
function Ip(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function Lp(e, t) {
	Pp(t);
	let n = e.filter((e) => Fp(e.occurredAt) <= t).slice().sort(Ip), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = G(n.quantityOnHand + e.quantityBase), a = fs(n.inventoryValue + e.valueChange);
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
		let t = Ts.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = O(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : ds(e.inventoryValue / e.quantityOnHand);
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
		totalInventoryValue: fs(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function Rp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function zp(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function Bp({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	zp(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = Lp(n, r), o = Rp(hp(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = Rp(a.totalInventoryValue), c = Rp(s - o);
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
var Vp = (e) => Math.round((e + 2 ** -52) * 100) / 100, $ = g().trim().min(1).max(200), Hp = p().finite().refine((e) => Vp(e) === e, "Amounts must use cents precision"), Up = w({
	accountId: $,
	debit: Hp.nonnegative(),
	credit: Hp.nonnegative()
}).strict(), Wp = w({
	contactId: $,
	reference: $,
	date: $,
	dueDate: $,
	amount: Hp
}).strict(), Gp = w({
	operationId: $,
	date: $,
	reason: g().trim().min(3).max(1e3),
	gl: r(Up).min(2).max(5e3),
	ar: r(Wp).max(1e4),
	ap: r(Wp).max(1e4),
	banks: r(w({
		bankAccountId: $,
		amount: Hp
	}).strict()).max(500),
	stock: r(w({
		siteId: $,
		productId: $,
		quantity: p().positive().finite(),
		unitCost: p().nonnegative().finite()
	}).strict()).max(1e4)
}).strict(), Kp = [], qp = 0, Jp = /* @__PURE__ */ new Set(), Yp = () => {
	qp++, Jp.forEach((e) => e());
};
function Xp() {
	return _e();
}
function Zp(e) {
	ie(e), Ta(e.sales), La(e.customerCredits), M.update("supplierBills", e.supplierBills.supplierBills), M.update("supplierCredits", e.supplierCredits.supplierCredits);
}
function Qp(e, t) {
	if (new Set(e).size !== e.length) throw Error("Duplicate " + t + ".");
}
function $p(e) {
	let t = Gp.parse(e);
	if (C(t.date, "Cutover date"), mr(t.date), R(), Kp.some((e) => e.status === "POSTED")) throw Error("An opening batch is already active. Reverse the unused batch before replacing it.");
	let n = Xp();
	if (n.journals.journalEntries.some((e) => e.journalDate >= t.date)) throw Error("Cutover must be after all existing ledger activity. This import adds historical balances, never replaces existing transactions.");
	if (n.inventoryMovements.movements.some((e) => e.occurredAt.slice(0, 10) >= t.date)) throw Error("Cutover must be after existing inventory activity.");
	Qp(t.gl.map((e) => e.accountId), "GL account"), Qp(t.banks.map((e) => e.bankAccountId), "bank"), Qp(t.stock.map((e) => e.siteId + ":" + e.productId), "site/product");
	let r = _p({
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
	}), i = Np({
		suppliers: n.suppliers.suppliers,
		bills: n.supplierBills.supplierBills,
		payments: n.supplierPayments.supplierPayments,
		credits: n.supplierCredits.supplierCredits,
		creditAllocations: n.supplierCredits.allocations,
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: t.date
	}), a = Bp({
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
	let o = P.getAll(), s = (e) => P.requireBySystemRole(e).id, c = (e) => Vp(t.gl.filter((t) => t.accountId === e).reduce((e, t) => e + t.debit - t.credit, 0));
	for (let e of t.gl) {
		let t = P.requireById(e.accountId);
		if (!t.active || ![
			"ASSET",
			"LIABILITY",
			"EQUITY"
		].includes(t.type) || e.debit > 0 && e.credit > 0 || e.debit + e.credit <= 0) throw Error("Opening GL requires active balance-sheet accounts and one positive debit or credit per row.");
	}
	let l = Vp(t.gl.reduce((e, t) => e + t.debit, 0)), u = Vp(t.gl.reduce((e, t) => e + t.credit, 0));
	if (l !== u || !l) throw Error("Opening trial balance does not balance.");
	let d = Vp(t.ar.reduce((e, t) => e + t.amount, 0)), f = Vp(t.ap.reduce((e, t) => e + t.amount, 0));
	if (c(s("ACCOUNTS_RECEIVABLE")) !== d || c(s("ACCOUNTS_PAYABLE")) !== -f) throw Error("AR/AP detail must equal imported GL control balances. Negative detail creates an unused historical credit.");
	for (let [e, r] of [["ar", t.ar], ["ap", t.ap]]) {
		Qp(r.map((e) => e.contactId + ":" + e.reference.toLowerCase()), e + " reference");
		for (let i of r) {
			if (C(i.date), C(i.dueDate), !i.amount || i.date > t.date || i.dueDate < i.date) throw Error("Invalid outstanding document amount/date.");
			if (!(e === "ar" ? n.customers.customers : n.suppliers.suppliers).some((e) => e.id === i.contactId)) throw Error("Opening contact not found.");
			if ((e === "ar" ? [...n.sales.invoices.map((e) => [e.customerId, e.documentNumber]), ...n.customerCredits.creditNotes.map((e) => [e.customerId, e.creditNoteNumber])] : [...n.supplierBills.supplierBills.map((e) => [e.supplierId, e.supplierInvoiceNumber]), ...n.supplierCredits.supplierCredits.map((e) => [e.supplierId, e.supplierCreditNumber])]).some(([e, t]) => e === i.contactId && t.toLowerCase() === i.reference.toLowerCase())) throw Error("Historical document reference already exists.");
		}
	}
	let p = 0;
	for (let e of t.stock) {
		let t = O(e.productId), n = Ts.getById(e.siteId);
		if (!t || t.status !== "ACTIVE" || t.itemType === "SERVICE" || n?.status !== "ACTIVE") throw Error("Opening stock requires active stocked products/sites.");
		if (Math.round(e.quantity * 1e4) / 1e4 !== e.quantity) throw Error("Stock quantities use at most four decimal places.");
		p = Vp(p + Vp(e.quantity * e.unitCost));
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
			let { input: t, debit: n, credit: r, ar: i, ap: a, inventory: o } = $p(e);
			return {
				date: t.date,
				debit: n,
				credit: r,
				ar: i,
				ap: a,
				inventory: o,
				bank: Vp(t.banks.reduce((e, t) => e + t.amount, 0)),
				documents: t.ar.length + t.ap.length
			};
		},
		post(e) {
			let t = Gp.parse(e), n = JSON.stringify(t), r = Kp.find((e) => e.operationId === t.operationId);
			if (n.length > 5e7) throw Error("Opening import exceeds 50 MB.");
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID already used for different opening data.");
				return r;
			}
			let { input: i, s: a } = $p(t), o = crypto.randomUUID(), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
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
			}, l = (e) => P.requireBySystemRole(e).id, u = l("OWNERS_EQUITY"), d = 0, f = 0;
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
				let ee = e === "ar" == t.amount > 0, g = F.post({
					journalDate: i.date,
					description: "Opening outstanding " + t.reference,
					reference: t.reference,
					sourceType: h,
					sourceId: n,
					lines: [{
						accountId: l(e === "ar" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"),
						debit: ee ? r : 0,
						credit: ee ? 0 : r
					}, {
						accountId: u,
						debit: ee ? 0 : r,
						credit: ee ? r : 0
					}]
				});
				c.journalIds.push(g.id), ee ? d += r : f += r;
			}
			a.journals = Xp().journals, Zp(a);
			let p = i.gl.filter((e) => ![l("ACCOUNTS_RECEIVABLE"), l("ACCOUNTS_PAYABLE")].includes(e.accountId));
			(d || f) && p.push({
				accountId: u,
				debit: Vp(d),
				credit: Vp(f)
			});
			let m = /* @__PURE__ */ new Map();
			for (let e of p) m.set(e.accountId, Vp((m.get(e.accountId) ?? 0) + e.debit - e.credit));
			let h = [...m].filter(([, e]) => e !== 0).map(([e, t]) => ({
				accountId: e,
				debit: Math.max(0, t),
				credit: Math.max(0, -t)
			}));
			if (h.length) {
				let e = F.post({
					journalDate: i.date,
					description: "Opening trial balance " + i.reason,
					sourceType: "OPENING_BALANCE",
					sourceId: o,
					lines: h
				});
				c.journalIds.push(e.id);
			}
			for (let e of i.stock) {
				let t = O(e.productId), n = t.units.find((e) => e.id === t.baseUnitId), r = As.create({
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
				ec.receive({
					siteId: e.siteId,
					productId: t.id,
					baseUnitId: t.baseUnitId,
					quantityBase: e.quantity
				});
				let a = qs({
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
			return Kp = [...Kp, c], Yp(), c;
		},
		reverse(e) {
			if (C(e.date), mr(e.date), R(), !e.reason?.trim() || e.reason.trim().length < 3) throw Error("Reversal reason is required.");
			let t = Kp.find((t) => t.id === e.id);
			if (!t) throw Error("Opening batch not found.");
			if (t.status === "REVERSED") return t;
			if (e.date < t.date) throw Error("Reversal date precedes cutover.");
			let n = Xp();
			if (n.journals.journalEntries.some((e) => !t.priorJournalIds.includes(e.id) && !t.journalIds.includes(e.id)) || n.inventoryMovements.movements.some((e) => !t.priorMovementIds.includes(e.id) && !t.movementIds.includes(e.id))) throw Error("Subsequent accounting or inventory activity exists. Reverse downstream activity before correcting opening balances.");
			let r = n.sales.invoices.filter((e) => t.invoiceIds.includes(e.id)), i = n.supplierBills.supplierBills.filter((e) => t.billIds.includes(e.id)), a = [...n.customerCredits.creditNotes.filter((e) => t.customerCreditIds.includes(e.id)), ...n.supplierCredits.supplierCredits.filter((e) => t.supplierCreditIds.includes(e.id))];
			if (r.some((e) => e.amountPaid !== 0 || e.amountDue !== e.totals.total) || i.some((e) => e.totals.amountPaid !== 0 || e.totals.amountCredited !== 0) || a.some((e) => e.amountApplied !== 0 || (e.amountRefunded ?? 0) !== 0)) throw Error("Opening balances have allocations or settlements. Reverse downstream allocations before correcting them.");
			for (let e of ["customerSettlements", "supplierRefunds"]) if (JSON.stringify(n[e]).includes(t.id)) throw Error("Opening balances have downstream settlements.");
			for (let e of t.journalIds) Uf(e);
			for (let n of t.journalIds) F.reverse({
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
			return n.stock.balances = t.priorStock, n.costBalances.balances = t.priorCost, n.journals = Xp().journals, Zp(n), Kp = Kp.map((n) => n.id === t.id ? {
				...n,
				status: "REVERSED",
				reversalDate: e.date,
				reversalReason: e.reason
			} : n), Yp(), Kp.find((e) => e.id === t.id);
		}
	},
	read: "accounting.read",
	commands: {
		preview: "accounting.post",
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ batches: Kp }),
	restore: (e) => {
		Kp = e.batches;
	},
	publish: Yp,
	validate: (e, t) => {
		let n = w({ batches: r(w({
			id: $,
			operationId: $,
			date: $,
			status: f(["POSTED", "REVERSED"]),
			journalIds: r($),
			invoiceIds: r($),
			billIds: r($),
			customerCreditIds: r($),
			supplierCreditIds: r($),
			fingerprint: g().min(1).max(5e7),
			reason: g().min(3),
			actor: $,
			createdAt: $,
			movementIds: r($),
			costMovementIds: r($),
			priorJournalIds: r($),
			priorMovementIds: r($),
			priorStock: r(w({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: p().finite().nonnegative(),
				updatedAt: $
			}).strict()),
			priorCost: r(w({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: p().finite().nonnegative(),
				averageCostPerBaseUnit: p().finite().nonnegative(),
				inventoryValue: p().finite().nonnegative(),
				costingMethod: l("MOVING_WEIGHTED_AVERAGE"),
				updatedAt: $
			}).strict()),
			reversalDate: $.optional(),
			reversalReason: g().optional()
		}).strict()) }).strict().parse(e);
		for (let e of n.batches) {
			let n = Gp.parse(JSON.parse(e.fingerprint));
			if (n.operationId !== e.operationId || n.date !== e.date) throw Error("Opening import identity is invalid.");
			if (e.status === "REVERSED" && !e.reversalDate) throw Error("Opening reversal date is missing.");
			e.reversalDate && C(e.reversalDate), C(e.date);
			let r = t;
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
var em = /* @__PURE__ */ new Set(), tm = M.read().supplierPayments;
M.onRollback(() => {
	tm = M.read().supplierPayments;
});
function nm() {
	M.update("supplierPayments", tm), em.forEach((e) => M.notify(e));
}
var rm = {
	subscribe(e) {
		return em.add(e), () => {
			em.delete(e);
		};
	},
	getSnapshot() {
		return tm;
	},
	getAll() {
		return tm;
	},
	getById(e) {
		return tm.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return tm.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return tm.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: am(e.reference),
			notes: am(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: om(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = tm.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (C(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = gt.getById(e.supplierId);
		if (!r) throw Error("Supplier was not found.");
		if (!e.paymentDate) throw Error("Payment date is required.");
		if (!e.method) throw Error("Payment method is required.");
		if (!e.bankAccountId) throw Error("Bank account is required.");
		let i = Bi.getById(e.bankAccountId);
		if (!i) throw Error("Bank account was not found.");
		if (!i.active) throw Error("The selected bank account is inactive.");
		let a = e.allocations.filter((e) => Number.isFinite(e.amount) && e.amount > 0);
		if (a.length === 0) throw Error("Allocate the payment to at least one supplier bill.");
		let o = /* @__PURE__ */ new Set(), s = a.map((t) => {
			if (o.has(t.supplierBillId)) throw Error("A supplier bill cannot appear more than once in the same payment.");
			o.add(t.supplierBillId);
			let n = Dc.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = om(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${sm(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), c = om(s.reduce((e, t) => e + t.amount, 0));
		if (c <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of s) Dc.applyPayment(e.supplierBillId, e.amount);
		let l = (/* @__PURE__ */ new Date()).toISOString(), u = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: im(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: c,
			method: e.method,
			bankAccountId: i.id,
			reference: am(e.reference),
			notes: am(e.notes),
			allocations: s,
			status: "POSTED",
			createdAt: l,
			updatedAt: l
		};
		return tm = [u, ...tm], nm(), Cs.postSupplierPayment(u), u;
	},
	reverse(e, t) {
		rr("SUPPLIER_PAYMENT", e);
		let n = tm.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = Dc.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) Dc.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return tm = tm.map((t) => t.id === e ? a : t), nm(), Cs.reverseSupplierPayment(a), a;
	}
};
function im(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = tm.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function am(e) {
	return e?.trim() || void 0;
}
function om(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function sm(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: _().currency
	}).format(e);
}
var cm = rm.create;
rm.create = function(...e) {
	return R(), M.transaction(() => cm.apply(rm, e));
};
var lm = rm.reverse;
rm.reverse = function(...e) {
	return R(), M.transaction(() => lm.apply(rm, e));
}, y("supplierPayments", {
	repository: rm,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: tm }),
	restore: (e) => {
		tm = e.supplierPayments;
	},
	publish: () => em.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/paymentBatchRepository.ts
var um = (e) => Math.round((e + 2 ** -52) * 100) / 100, dm = g().trim().min(1).max(200), fm = w({
	operationId: dm,
	paymentDate: dm,
	bankAccountId: dm,
	reference: g().max(500),
	allocations: r(w({
		supplierBillId: dm,
		amount: p().finite().positive().refine((e) => um(e) === e)
	}).strict()).min(1).max(500)
}).strict(), pm = [], mm = 0, hm = /* @__PURE__ */ new Set(), gm = () => {
	mm++, hm.forEach((e) => e());
}, _m = () => {
	let e = T.current();
	if (!e) throw Error("A verified session is required.");
	return e.userId;
};
function vm(e, t) {
	return {
		action: e,
		reason: t,
		actor: _m(),
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function ym(e) {
	let t = pm.find((t) => t.id === e);
	if (!t) throw Error("Payment batch was not found.");
	return t;
}
function bm(e) {
	return pm = pm.map((t) => t.id === e.id ? e : t), gm(), e;
}
function xm(e) {
	C(e.paymentDate, "Payment date");
	let t = Bi.requireById(e.bankAccountId);
	if (!t.active || e.paymentDate < t.openingBalanceDate) throw Error("Invalid paying bank account/date.");
	if (new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length) throw Error("Select each bill only once.");
	for (let t of e.allocations) {
		let n = Dc.getById(t.supplierBillId);
		if (!n || n.status === "VOID" || t.amount > n.totals.amountDue || e.paymentDate < n.billDate) throw Error("A bill amount, date or outstanding balance changed. Review the batch.");
	}
}
y("paymentBatches", {
	repository: {
		create(e) {
			let t = fm.parse(e), n = JSON.stringify(t), r = pm.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID was used with different batch data.");
				return r;
			}
			xm(t);
			let i = {
				...t,
				id: crypto.randomUUID(),
				fingerprint: n,
				status: "DRAFT",
				createdBy: _m(),
				paymentIds: [],
				history: [vm("Created")]
			};
			return pm = [...pm, i], gm(), i;
		},
		approve(e) {
			let t = ym(e);
			if (t.status === "APPROVED") return t;
			if (t.status !== "DRAFT") throw Error("Only a draft batch can be approved.");
			return xm(t), bm({
				...t,
				status: "APPROVED",
				approvedBy: _m(),
				history: [...t.history, vm("Approved")]
			});
		},
		post(e) {
			let t = ym(e);
			if (t.status === "POSTED") return t;
			if (t.status !== "APPROVED") throw Error("Approve the batch before recording payments.");
			R(), xm(t);
			let n = /* @__PURE__ */ new Map();
			for (let e of t.allocations) {
				let t = Dc.getById(e.supplierBillId);
				n.set(t.supplierId, [...n.get(t.supplierId) ?? [], e]);
			}
			let r = [...n].map(([e, n]) => rm.create({
				operationId: "batch:" + t.id + ":" + e,
				supplierId: e,
				paymentDate: t.paymentDate,
				bankAccountId: t.bankAccountId,
				reference: t.reference,
				method: "BANK_TRANSFER",
				allocations: n
			}));
			return bm({
				...t,
				status: "POSTED",
				paymentIds: r.map((e) => e.id),
				history: [...t.history, vm("Payments recorded")]
			});
		},
		cancel(e) {
			let t = ym(e.id);
			if (!["DRAFT", "APPROVED"].includes(t.status) || e.reason?.trim().length < 3) throw Error("Only an unposted batch can be cancelled, with a reason.");
			return bm({
				...t,
				status: "CANCELLED",
				history: [...t.history, vm("Cancelled", e.reason)]
			});
		},
		reverse(e) {
			let t = ym(e.id);
			if (t.status === "REVERSED") return t;
			if (t.status !== "POSTED" || e.reason?.trim().length < 3) throw Error("A posted batch and reversal reason are required.");
			R();
			for (let e of t.paymentIds) {
				let t = rm.getById(e);
				if (!t || t.status !== "POSTED") throw Error("Batch payments changed. Inspect before reversing.");
				rr("SUPPLIER_PAYMENT", e);
			}
			for (let n of t.paymentIds) rm.reverse(n, e.reason);
			return bm({
				...t,
				status: "REVERSED",
				history: [...t.history, vm("Reversed", e.reason)]
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
	snapshot: () => ({ batches: pm }),
	restore: (e) => {
		pm = e.batches;
	},
	validate: (e, t) => {
		let n = w({ batches: r(fm.extend({
			id: dm,
			fingerprint: g(),
			status: f([
				"DRAFT",
				"APPROVED",
				"POSTED",
				"REVERSED",
				"CANCELLED"
			]),
			createdBy: dm,
			approvedBy: dm.optional(),
			paymentIds: r(dm),
			history: r(w({
				action: dm,
				actor: dm,
				at: dm,
				reason: g().optional()
			}))
		})) }).strict().parse(e), i = t.supplierPayments.supplierPayments;
		for (let e of n.batches) {
			if (!["POSTED", "REVERSED"].includes(e.status)) continue;
			let n = e.paymentIds.map((e) => i.find((t) => t.id === e));
			if (!n.length || n.some((t) => !t || t.bankAccountId !== e.bankAccountId || t.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) || um(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== um(e.allocations.reduce((e, t) => e + t.amount, 0))) throw Error("Batch payment relationships are invalid.");
			if (e.paymentIds.some((e) => !t.journals.journalEntries.some((t) => t.sourceType === "SUPPLIER_PAYMENT" && t.sourceId === e))) throw Error("A batch payment journal is missing.");
		}
	},
	publish: gm
});
//#endregion
//#region src/features/finance-closure/bankStatementRepository.ts
var Sm = (e) => Math.round((e + 2 ** -52) * 100) / 100, Cm = g().min(1).max(200), wm = [], Tm = 0, Em = /* @__PURE__ */ new Set(), Dm = () => {
	Tm++, Em.forEach((e) => e());
};
function Om(e) {
	let t = Bi.requireById(e);
	if (!t.active) throw Error("Select an active bank account.");
	return t;
}
function km(e) {
	let t = wm.find((t) => t.id === e);
	if (!t) throw Error("Statement line was not found.");
	return t;
}
function Am(e) {
	if (e.status !== "UNMATCHED") throw Error("This line is already processed. Revert it before changing it.");
	let t = Of.getLatestByBankAccount(e.bankAccountId);
	if (t && e.date <= t.statementDate) throw Error("Statement date is already reconciled.");
}
function jm(e) {
	return wm = wm.map((t) => t.id === e.id ? e : t), Dm(), e;
}
var Mm = (e, t) => ul(Om(e), F.getAll(), t).transactions, Nm = w({
	date: Cm,
	description: g().trim().min(1).max(1e3),
	amount: p().finite().refine((e) => e !== 0 && Sm(e) === e, "Enter a non-zero amount in cents"),
	reference: g().max(500).default(""),
	externalId: g().max(200).default("")
}).strict(), Pm = {
	importRows(e) {
		let t = w({
			bankAccountId: Cm,
			rows: r(Nm).min(1).max(1e4)
		}).strict().parse(e), n = Om(t.bankAccountId), i = 0, a = [...wm], o = [];
		for (let e of t.rows) {
			if (C(e.date, "Statement date"), e.date < n.openingBalanceDate) throw Error("Statement predates the bank opening date.");
			let t = JSON.stringify([n.id, e.externalId || [
				e.date,
				e.amount,
				e.description.trim().toLowerCase(),
				e.reference.trim().toLowerCase()
			]]), r = a.find((e) => e.key === t);
			if (r) {
				if (e.externalId && (r.amount !== e.amount || r.date !== e.date || r.description !== e.description || r.reference !== e.reference)) throw Error("Bank transaction ID conflicts with an existing row.");
				i++;
				continue;
			}
			let s = Of.getLatestByBankAccount(n.id);
			if (s && e.date <= s.statementDate) throw Error("Cannot import new rows into a reconciled statement period.");
			let c = {
				...e,
				id: crypto.randomUUID(),
				key: t,
				bankAccountId: n.id,
				status: "UNMATCHED",
				ledgerIds: [],
				history: [{
					action: "Imported",
					date: (/* @__PURE__ */ new Date()).toISOString()
				}]
			};
			a.push(c), o.push(c);
		}
		return wm = a, Dm(), {
			created: o.length,
			duplicates: i
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
		return Pm.importRows({
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
					l = Sm(t - e);
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
		return C(e.asOfDate, "As-of date"), Mm(e.bankAccountId, e.asOfDate).filter((e) => e.journalStatus === "POSTED" && !wm.some((t) => t.ledgerIds.includes(e.id)));
	},
	match(e) {
		let t = km(e.id);
		if (Am(t), !Array.isArray(e.ledgerIds) || !e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Select unique ledger entries.");
		let n = Pm.candidates({
			bankAccountId: t.bankAccountId,
			asOfDate: t.date
		}), r = e.ledgerIds.map((e) => n.find((t) => t.id === e));
		if (r.some((e) => !e) || Sm(r.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== t.amount) throw Error("Selected bank entries must match this signed statement amount exactly.");
		return jm({
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
		let t = km(e.id);
		return (S["bank-rules"] ?? []).filter((e) => e.status === "Active" && e.enabled !== "No").filter((e) => {
			let n = (e.field === "Reference" ? t.reference : e.field === "Description" ? t.description : "").toLowerCase(), r = e.value.toLowerCase();
			return e.operator === "Equals" ? n === r : e.operator === "Starts with" ? n.startsWith(r) : n.includes(r);
		});
	},
	post(e) {
		R();
		let t = km(e.id), n = JSON.stringify(e.splits);
		if (t.status === "POSTED") {
			if (t.fingerprint !== n) throw Error("Line was already posted with different categorisation.");
			return t;
		}
		Am(t);
		let i = r(w({
			accountId: Cm,
			amount: p().finite().positive().refine((e) => Sm(e) === e),
			taxCode: Cm
		}).strict()).min(1).max(100).parse(e.splits);
		if (Sm(i.reduce((e, t) => e + t.amount, 0)) !== Math.abs(t.amount)) throw Error("Split amounts must equal the statement total.");
		let a = Om(t.bankAccountId), o = t.amount < 0, s = i.flatMap((e) => {
			let t = P.requireById(e.accountId);
			if (!t.active || !t.allowManualPosting || !["EXPENSE", "REVENUE"].includes(t.type)) throw Error("Use an active manual expense/revenue account. Payments against AR/AP must be matched to their source documents.");
			let n = se(e.taxCode), r = Sm(e.amount / (1 + n)), i = Sm(e.amount - r);
			return [{
				accountId: t.id,
				debit: o ? r : 0,
				credit: o ? 0 : r
			}, ...i ? [{
				accountId: (o ? v(e.taxCode).taxPaidAccountId : v(e.taxCode).taxCollectedAccountId) || P.requireBySystemRole(o ? "GST_RECEIVABLE" : "GST_PAYABLE").id,
				debit: o ? i : 0,
				credit: o ? 0 : i
			}] : []];
		}), c = F.post({
			journalDate: t.date,
			description: t.description,
			reference: t.reference,
			sourceType: "BANK_STATEMENT",
			sourceId: t.id + ":" + t.history.filter((e) => e.action === "Posted").length,
			lines: [{
				accountId: a.glAccountId,
				debit: o ? 0 : t.amount,
				credit: o ? -t.amount : 0
			}, ...s]
		}), l = c.lines.filter((e) => e.accountId === a.glAccountId).map((e) => c.id + ":" + e.id);
		return jm({
			...t,
			status: "POSTED",
			journalEntryId: c.id,
			ledgerIds: l,
			fingerprint: n,
			history: [...t.history, {
				action: "Posted",
				date: (/* @__PURE__ */ new Date()).toISOString()
			}]
		});
	},
	ignore(e) {
		let t = km(e.id);
		if (Am(t), e.reason?.trim().length < 3) throw Error("Enter an exclusion reason.");
		return jm({
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
		R();
		let t = km(e.id);
		if (C(e.reversalDate, "Reversal date"), e.reason?.trim().length < 3 || e.reversalDate < t.date) throw Error("Enter a reason and a reversal date on or after the statement line.");
		if (t.status === "UNMATCHED") throw Error("Line is already unmatched.");
		for (let e of t.ledgerIds) Uf(e.split(":")[0]);
		let n = Of.getLatestByBankAccount(t.bankAccountId);
		if (n && t.date <= n.statementDate) throw Error("Reconciled statement lines cannot be reverted.");
		return t.status === "POSTED" && t.journalEntryId && F.reverse({
			journalEntryId: t.journalEntryId,
			reversalDate: e.reversalDate,
			reason: e.reason
		}), jm({
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
		if (mr(e.statementDate), R(), C(e.statementDate, "Statement date"), !wm.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate)) throw Error("Import the statement first.");
		if (wm.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate && t.status === "UNMATCHED")) throw Error("Process every statement line before completing reconciliation.");
		let t = wm.filter((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate).flatMap((e) => e.ledgerIds);
		return Of.complete({
			...e,
			clearedTransactionIds: [.../* @__PURE__ */ new Set([...Of.getClearedTransactionIds(e.bankAccountId), ...t])]
		});
	}
}, Fm = w({
	id: Cm,
	key: g(),
	bankAccountId: Cm,
	date: Cm,
	description: g(),
	reference: g(),
	amount: p().finite(),
	externalId: g(),
	status: f([
		"UNMATCHED",
		"MATCHED",
		"POSTED",
		"IGNORED"
	]),
	ledgerIds: r(Cm),
	journalEntryId: g().optional(),
	fingerprint: g().optional(),
	history: r(w({
		action: g(),
		date: g(),
		reason: g().optional()
	}))
}).strict();
y("bankStatements", {
	repository: Pm,
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
	snapshot: () => ({ lines: wm }),
	restore: (e) => {
		wm = e.lines;
	},
	validate: (e) => {
		r(Fm).parse(e.lines);
	},
	publish: Dm
});
//#endregion
//#region src/lib/persistence/financialConsistencyAudit.ts
function Im(e) {
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
var Lm = /* @__PURE__ */ new Set(), Rm = M.read().transactions, zm = M.read().transfers;
M.onRollback(() => {
	let e = M.read();
	Rm = e.transactions, zm = e.transfers;
});
function Bm() {
	Lm.forEach((e) => M.notify(e));
}
function Vm(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function Hm(e) {
	return e?.trim() || void 0;
}
function Um(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function Wm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Gm(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Km(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var qm = {
	subscribe(e) {
		return Lm.add(e), () => {
			Lm.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return Rm;
	},
	getTransfersSnapshot() {
		return zm;
	},
	getTransactions() {
		return Rm;
	},
	getTransfers() {
		return zm;
	},
	createTransaction(e, t) {
		if (Um(e.transactionDate), C(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = Wm(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Vm(e.description, "Description"), i = Bi.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let a = P.requireById(i.glAccountId);
		if (!a.active) throw Error("The selected bank GL account is inactive.");
		let o = P.requireById(e.offsetAccountId);
		if (!o.active) throw Error("The offset account is inactive.");
		if (!o.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (o.id === a.id) throw Error("Bank and offset accounts must be different.");
		if (Bi.getByGlAccountId(o.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let s = Gm("banktxn"), c = Km("BTXN", e.transactionDate, Rm.length + 1), l = t?.trim();
		if (t !== void 0 && !l) throw Error("Operation ID cannot be empty");
		if (l) {
			let t = I.begin(l, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = Rm.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			l && I.bindResult(l, s);
			let t = F.post({
				journalDate: e.transactionDate,
				description: r,
				reference: Hm(e.reference),
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
				reference: Hm(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [u, ...Rm];
			if (M.update("transactions", d), Rm = d, Bm(), l) {
				let e = F.getBySource("BANK_TRANSACTION", s);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Bank GL posting could not be verified uniquely.");
			}
			return u;
		} catch (e) {
			if (l) try {
				I.flagForReview(l, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	},
	createTransfer(e, t) {
		Um(e.transferDate), C(e.transferDate, "Transfer date");
		let n = Wm(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = Vm(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = Bi.requireById(e.fromBankAccountId), a = Bi.requireById(e.toBankAccountId);
		if (!i.active || !a.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== a.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < a.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let o = P.requireById(i.glAccountId), s = P.requireById(a.glAccountId);
		if (!o.active || !s.active) throw Error("Both bank GL accounts must be active.");
		if (o.id === s.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let c = Gm("banktrf"), l = Km("BTRF", e.transferDate, zm.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = I.begin(u, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = zm.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			u && I.bindResult(u, c);
			let t = F.post({
				journalDate: e.transferDate,
				description: r,
				reference: Hm(e.reference),
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
				reference: Hm(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [d, ...zm];
			if (M.update("transfers", f), zm = f, Bm(), u) {
				let e = F.getBySource("BANK_TRANSFER", c);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Transfer GL posting could not be verified uniquely.");
			}
			return d;
		} catch (e) {
			if (u) try {
				I.flagForReview(u, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	}
}, Jm = qm.createTransaction;
qm.createTransaction = function(e, t) {
	R();
	let n;
	try {
		return n = M.transaction(() => Jm.call(qm, e, t)), t && I.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = I.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				I.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
};
var Ym = qm.createTransfer;
qm.createTransfer = function(e, t) {
	R();
	let n;
	try {
		return n = M.transaction(() => Ym.call(qm, e, t)), t && I.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = I.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				I.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
}, y("bankTransactions", {
	repository: qm,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: Rm,
		bankTransfers: zm
	}),
	restore: (e) => {
		Rm = e.bankTransactions, zm = e.bankTransfers;
	},
	publish: () => Lm.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function Xm() {
	return Im({
		transactions: qm.getTransactions(),
		transfers: qm.getTransfers(),
		payments: So.getAll(),
		journals: F.getAll(),
		invoices: U.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: z.getAll(),
		supplierBills: Dc.getAll(),
		supplierPayments: rm.getAll(),
		supplierCredits: J.getAll()
	});
}
//#endregion
//#region electron/security/periodCloseChecks.ts
function Zm(e) {
	let t = _e(), n = [], r = (e, t) => n.push({
		code: e,
		message: t
	});
	e.endDate >= x((/* @__PURE__ */ new Date()).toISOString()) && r("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of I.getUnresolved()) r("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of t.purchaseOperations) e.status !== "POSTED" && r("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of Xm()) r(e.code, `${e.entityId}: ${e.message}`);
	let i = {
		accounts: t.accounts.accounts,
		journalEntries: t.journals.journalEntries,
		asOfDate: e.endDate
	}, a = [
		["AR", () => _p({
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
		["AP", () => Np({
			...i,
			suppliers: t.suppliers.suppliers,
			bills: t.supplierBills.supplierBills,
			payments: t.supplierPayments.supplierPayments,
			credits: t.supplierCredits.supplierCredits,
			creditAllocations: t.supplierCredits.allocations
		})],
		["INVENTORY", () => Bp({
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
var Qm = null, $m = {
	configureTrustedSession(e) {
		Qm = e;
	},
	clear() {
		Qm = null;
	},
	current() {
		return Qm?.() ?? null;
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
}, eh = "htt.purchasePosting.manualRecoveryAudit.v1";
function th() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(eh) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var nh = th();
function rh(e) {
	nh.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(eh, JSON.stringify(nh));
	} catch {}
}
y("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return nh.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = L.get(e);
			return $m.canRecover() && t?.status === "RECOVERY_REQUIRED" && L.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = $m.requireRecoveryPermission(), n = L.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!L.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				L.recover(e), rh({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw rh({
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
	snapshot: () => nh,
	restore: (e) => {
		nh.splice(0, nh.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var ih = !1;
function ah() {
	if (ih || (ih = !0, M.wasRestoredOnLoad())) return;
	let e = U.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) Ao.postInvoice(t), t.status === "VOID" && Ao.reverseInvoice(t);
	let t = So.getAll();
	for (let e of t) Ao.postPayment(e), e.status === "REVERSED" && Ao.reversePayment(e);
	let n = z.getAll();
	for (let e of n) e.status !== "DRAFT" && (Ao.postCreditNote(e), e.status === "VOID" && Ao.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function oh() {
	let e = Xm().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/sales/data/salesManualReviewService.ts
var sh = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function ch(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = ue("business.command", {
			repository: "salesRecovery",
			method: "recordSalesManualReview",
			args: [e]
		});
		return de(t.view), t.result;
	}
	if (!e.businessRecordChecked || !e.originalGlChecked || !e.reversalGlChecked || !e.balancesChecked) throw Error("Business, original/reversal GL and balances must all be inspected.");
	let t = I.list().find((t) => t.operationId === e.operationId);
	if (!t || !sh.has(t.kind)) throw Error("Sales operation not found.");
	if (t.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return I.recordManualReview(e.operationId, e.reference, e.operator, e.summary);
}
//#endregion
//#region src/features/sales/data/salesConsistencyAudit.ts
var lh = (e) => Math.round(e * 100);
function uh(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + lh(t.amount), 0), s = a.reduce((e, t) => e + lh(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (lh(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), lh(t.amountDue) !== Math.max(0, lh(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > lh(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + lh(t.amount), 0);
		lh(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || lh(t.amountAvailable) !== 0 : lh(t.amountAvailable) !== lh(t.totals.total) - a - lh(t.amountRefunded ?? 0)) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
var dh = {
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
function fh(e) {
	return uh(e).map((e) => ({
		...e,
		action: dh[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var ph = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function mh(e, t) {
	let n = fh(e).map((e) => ({ ...e })), r = t.filter((e) => ph.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => ph.has(e.kind))) s.has(e.operationId) && n.push({
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
function hh() {
	let e = U.getAll();
	return mh({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: So.getAll(),
		creditNotes: z.getAll(),
		allocations: z.getAllAllocations(),
		journals: F.getAll()
	}, I.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
var gh = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function _h(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!gh.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = mh(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function vh() {
	let e = U.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: So.getAll(),
		creditNotes: z.getAll(),
		allocations: z.getAllAllocations(),
		journals: F.getAll()
	};
}
function yh(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = ue("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [e]
		});
		return de(t.view), t.result;
	}
	let t = I.list(), n = _h(vh(), t, e.operationId);
	if (n.length) throw Error(`Sales recovery remains blocked: ${n.join(" ")}`);
	let r = t.find((t) => t.operationId === e.operationId);
	return {
		closed: I.closeReviewed(e.operationId, r.resultId, e.approvalReference, e.approver),
		remaining: hh()
	};
}
//#endregion
//#region electron/security/businessEngine.ts
y("salesRecovery", {
	repository: {
		recordSalesManualReview: ch,
		closeVerifiedSalesReview: yh
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
var bh = _e();
function xh(e) {
	lr(Zm, () => e()?.userId ?? ""), T.connect(e), $m.configureTrustedSession(e), ah(), oh();
}
//#endregion
export { mr as assertPostingPeriod, xh as initialize, bh as workspaceDefaults };
