import { A as e, B as t, D as n, F as r, H as i, I as a, L as o, N as s, O as c, P as l, R as u, S as d, T as f, V as p, _ as m, a as h, c as g, d as ee, f as te, h as _, i as ne, j as re, k as ie, l as ae, m as oe, n as v, o as y, p as se, r as b, s as ce, t as le, u as ue, w as de, y as x, z as fe } from "./accountingPeriodValidation-SL8KKS6G.js";
import { createHash as pe } from "node:crypto";
//#region \0rolldown/runtime.js
var me = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), he = null, S = {
	connect(e) {
		return he = e, () => {
			he === e && (he = null);
		};
	},
	disconnect() {
		he = null;
	},
	current() {
		return he?.() ?? null;
	},
	require(e) {
		return re(this.current(), e);
	}
}, ge = [
	"Flooring Retailer",
	"Builder",
	"Developer",
	"Designer",
	"Architect",
	"Installer",
	"Other"
], _e = [
	"ACTIVE",
	"ON_HOLD",
	"INACTIVE"
], ve = t().trim().refine((e) => e === "" || t().email().safeParse(e).success, { message: "Enter a valid email address" }), ye = t().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), be = u({
	businessName: t().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: t().trim().max(120, "Trading name is too long"),
	abn: ye,
	businessType: s(ge),
	status: s(_e),
	email: ve,
	phone: t().trim().max(40, "Phone number is too long"),
	website: t().trim().max(200, "Website is too long"),
	creditLimit: o({ message: "Credit limit is required" }).min(0, "Credit limit cannot be negative"),
	paymentTermsDays: o({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days")
}), xe = u({
	name: t().trim().min(1, "Location name is required").max(100, "Location name is too long"),
	addressLine1: t().trim().min(1, "Address is required").max(160, "Address is too long"),
	addressLine2: t().trim().max(160, "Address is too long"),
	suburb: t().trim().min(1, "Suburb is required").max(100, "Suburb is too long"),
	state: t().trim().min(1, "State is required").max(50, "State is too long"),
	postcode: t().trim().min(1, "Postcode is required").max(20, "Postcode is too long"),
	country: t().trim().min(1, "Country is required").max(100, "Country is too long"),
	phone: t().trim().max(40, "Phone number is too long"),
	isPrimary: r()
}), Se = u({
	isAccounting: r().optional(),
	firstName: t().trim().min(1, "First name is required").max(80, "First name is too long"),
	lastName: t().trim().min(1, "Last name is required").max(80, "Last name is too long"),
	jobTitle: t().trim().max(100, "Job title is too long"),
	email: t().trim().min(1, "Email is required").email("Enter a valid email address"),
	phone: t().trim().max(40, "Phone number is too long"),
	mobile: t().trim().max(40, "Mobile number is too long"),
	locationId: t(),
	isPrimary: r()
});
//#endregion
//#region src/lib/persistence/mockRepositoryStorage.ts
function Ce() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function we(e, t) {
	let n = Ce();
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
function Te(e, t) {
	let n = Ce();
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
function Ee(e) {
	let t = Ce();
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
var De = [
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
], Oe = "htt.mock.contacts.customers.v1";
function ke(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var Ae = we(Oe, ke), je = Ae.status !== "invalid" && Ee(Oe), Me = /* @__PURE__ */ new Set(), C = Ae.status === "ok" ? Ae.data : structuredClone(De);
function Ne() {
	je && Te(Oe, C), Me.forEach((e) => {
		e();
	});
}
function Pe(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function w() {
	let e = C.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `CUST-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function T(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function Fe(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function Ie(e, t) {
	let n = !1;
	if (C = C.map((r) => r.id === e ? (n = !0, t(r)) : r), !n) throw Error(`Customer ${e} was not found`);
	Ne();
}
var E = {
	subscribe(e) {
		return Me.add(e), () => {
			Me.delete(e);
		};
	},
	getSnapshot() {
		return C;
	},
	getAll() {
		return C;
	},
	getById(e) {
		return C.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: Pe("cus"),
			code: w(),
			businessName: e.businessName.trim(),
			tradingName: T(e.tradingName),
			abn: Fe(e.abn),
			businessType: e.businessType,
			status: e.status,
			email: T(e.email),
			phone: T(e.phone),
			website: T(e.website),
			creditLimit: e.creditLimit,
			currentBalance: 0,
			overdueBalance: 0,
			paymentTermsDays: e.paymentTermsDays,
			locations: [],
			contacts: [],
			createdAt: t,
			updatedAt: t
		};
		return C = [n, ...C], Ne(), n;
	},
	update(e, t) {
		let n;
		if (Ie(e, (e) => (n = {
			...e,
			businessName: t.businessName.trim(),
			tradingName: T(t.tradingName),
			abn: Fe(t.abn),
			businessType: t.businessType,
			status: t.status,
			email: T(t.email),
			phone: T(t.phone),
			website: T(t.website),
			creditLimit: t.creditLimit,
			paymentTermsDays: t.paymentTermsDays,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, n)), !n) throw Error(`Customer ${e} was not found`);
		return n;
	},
	addLocation(e, t) {
		let n = E.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		let r = t.isPrimary || n.locations.length === 0, i = {
			id: Pe("loc"),
			name: t.name.trim(),
			addressLine1: t.addressLine1.trim(),
			addressLine2: T(t.addressLine2),
			suburb: t.suburb.trim(),
			state: t.state.trim(),
			postcode: t.postcode.trim(),
			country: t.country.trim(),
			phone: T(t.phone),
			isPrimary: r
		};
		return Ie(e, (e) => ({
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
		let r = E.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		let i = r.locations.find((e) => e.id === t);
		if (!i) throw Error(`Location ${t} was not found`);
		let a = n.isPrimary || r.locations.length === 1, o = {
			...i,
			name: n.name.trim(),
			addressLine1: n.addressLine1.trim(),
			addressLine2: T(n.addressLine2),
			suburb: n.suburb.trim(),
			state: n.state.trim(),
			postcode: n.postcode.trim(),
			country: n.country.trim(),
			phone: T(n.phone),
			isPrimary: a
		};
		return Ie(e, (e) => ({
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
		t = Se.parse(t);
		let n = E.getById(e);
		if (!n) throw Error(`Customer ${e} was not found`);
		if (t.locationId && !n.locations.some((e) => e.id === t.locationId)) throw Error("The selected location does not belong to this customer");
		let r = t.isPrimary || n.contacts.length === 0, i = {
			id: Pe("con"),
			firstName: t.firstName.trim(),
			lastName: t.lastName.trim(),
			jobTitle: T(t.jobTitle),
			email: t.email.trim(),
			phone: T(t.phone),
			mobile: T(t.mobile),
			locationId: T(t.locationId),
			isPrimary: r,
			isAccounting: t.isAccounting ?? !1
		};
		return Ie(e, (e) => ({
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
		n = Se.parse(n);
		let r = E.getById(e);
		if (!r) throw Error(`Customer ${e} was not found`);
		if (n.locationId && !r.locations.some((e) => e.id === n.locationId)) throw Error("The selected location does not belong to this customer");
		let i = r.contacts.find((e) => e.id === t);
		if (!i) throw Error(`Contact ${t} was not found`);
		let a = n.isPrimary || r.contacts.length === 1, o = {
			...i,
			firstName: n.firstName.trim(),
			lastName: n.lastName.trim(),
			jobTitle: T(n.jobTitle),
			email: n.email.trim(),
			phone: T(n.phone),
			mobile: T(n.mobile),
			locationId: T(n.locationId),
			isPrimary: a,
			isAccounting: n.isAccounting ?? !1
		};
		return Ie(e, (e) => ({
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
_("customers", {
	repository: E,
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
	snapshot: () => ({ customers: C }),
	restore: (e) => {
		C = e.customers;
	},
	publish: () => Me.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/mockSuppliers.ts
var Le = [
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
		currency: h().currency,
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
		currency: h().currency,
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
		currency: h().currency,
		taxRegistered: !0,
		createdAt: "2026-03-05T01:00:00.000Z",
		updatedAt: "2026-03-05T01:00:00.000Z"
	}
], Re = "htt.mock.contacts.suppliers.v1";
function ze(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.code == "string" && typeof e.businessName == "string" && typeof e.status == "string");
}
var Be = we(Re, ze), Ve = Be.status !== "invalid" && Ee(Re), He = /* @__PURE__ */ new Set(), Ue = Be.status === "ok" ? Be.data : structuredClone(Le);
function We() {
	Ve && Te(Re, Ue), He.forEach((e) => {
		e();
	});
}
function Ge(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Ke() {
	let e = Ue.map((e) => {
		let t = e.code.match(/(\d+)$/);
		return t ? Number.parseInt(t[1], 10) : 0;
	}).filter(Number.isFinite);
	return `SUP-${(Math.max(0, ...e) + 1).toString().padStart(4, "0")}`;
}
function qe(e) {
	let t = e.trim();
	return t.length > 0 ? t : void 0;
}
function Je(e) {
	let t = e.replace(/\s/g, "").trim();
	if (t) return t.replace(/^(\d{2})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}
function Ye(e) {
	return {
		businessName: e.businessName.trim(),
		tradingName: qe(e.tradingName),
		abn: Je(e.abn),
		status: e.status,
		email: qe(e.email),
		phone: qe(e.phone),
		website: qe(e.website),
		contactName: qe(e.contactName),
		addressLine1: qe(e.addressLine1),
		addressLine2: qe(e.addressLine2),
		suburb: qe(e.suburb),
		state: qe(e.state),
		postcode: qe(e.postcode),
		country: e.country.trim(),
		paymentTermsDays: e.paymentTermsDays,
		taxRegistered: e.taxRegistered,
		notes: qe(e.notes)
	};
}
var Xe = {
	subscribe(e) {
		return He.add(e), () => {
			He.delete(e);
		};
	},
	getSnapshot() {
		return Ue;
	},
	getAll() {
		return Ue;
	},
	getById(e) {
		return Ue.find((t) => t.id === e);
	},
	create(e) {
		let t = (/* @__PURE__ */ new Date()).toISOString(), n = {
			id: Ge("sup"),
			code: Ke(),
			...Ye(e),
			currency: h().currency,
			createdAt: t,
			updatedAt: t
		};
		return Ue = [n, ...Ue], We(), n;
	},
	update(e, t) {
		let n = Xe.getById(e);
		if (!n) throw Error(`Supplier ${e} was not found`);
		let r = {
			...n,
			...Ye(t),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ue = Ue.map((t) => t.id === e ? r : t), We(), r;
	}
};
_("suppliers", {
	repository: Xe,
	read: "purchases.read",
	commands: {
		if: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ suppliers: Ue }),
	restore: (e) => {
		Ue = e.suppliers;
	},
	publish: () => He.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/schemas/supplierSchemas.ts
var Ze = ["ACTIVE", "INACTIVE"], Qe = t().trim().refine((e) => e === "" || t().email().safeParse(e).success, { message: "Enter a valid email address" }), $e = t().trim().refine((e) => {
	if (e === "") return !0;
	let t = e.replace(/\s/g, "");
	return /^\d{11}$/.test(t);
}, { message: "ABN must contain 11 digits" }), et = u({
	businessName: t().trim().min(1, "Business name is required").max(120, "Business name is too long"),
	tradingName: t().trim().max(120, "Trading name is too long"),
	abn: $e,
	status: s(Ze),
	email: Qe,
	phone: t().trim().max(40, "Phone number is too long"),
	website: t().trim().max(200, "Website is too long"),
	contactName: t().trim().max(120, "Contact name is too long"),
	addressLine1: t().trim().max(160, "Address is too long"),
	addressLine2: t().trim().max(160, "Address is too long"),
	suburb: t().trim().max(100, "Suburb is too long"),
	state: t().trim().max(50, "State is too long"),
	postcode: t().trim().max(20, "Postcode is too long"),
	country: t().trim().min(1, "Country is required").max(100, "Country is too long"),
	paymentTermsDays: o({ message: "Payment terms are required" }).int("Payment terms must be a whole number").min(0, "Payment terms cannot be negative").max(365, "Payment terms cannot exceed 365 days"),
	taxRegistered: r(),
	notes: t().trim().max(2e3, "Notes are too long")
});
//#endregion
//#region src/features/inventory/data/itemTypes.ts
function tt(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function nt(e) {
	return (e.itemType ?? "STOCK") === "STOCK";
}
function rt(e, t) {
	if (e.itemType !== void 0 && ![
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	].includes(String(e.itemType))) throw Error("Invalid saved sales item type.");
	if (t && (e.itemType ?? "STOCK") !== (t.itemType ?? "STOCK")) throw Error("Saved sales item type does not match its referenced product.");
}
//#endregion
//#region node_modules/.pnpm/react@19.3.0/node_modules/react/cjs/react.production.js
var it = /* @__PURE__ */ me(((e) => {
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
	function _(e, t, n) {
		this.props = e, this.context = t, this.refs = te, this.updater = n || g;
	}
	_.prototype.isReactComponent = {}, _.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, _.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function ne() {}
	ne.prototype = _.prototype;
	function re(e, t, n) {
		this.props = e, this.context = t, this.refs = te, this.updater = n || g;
	}
	var ie = re.prototype = new ne();
	ie.constructor = re, ee(ie, _.prototype), ie.isPureReactComponent = !0;
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
	function fe(e, r, i, a, o) {
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
				case d: return c = e._init, fe(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + de(e, 0) : a, ae(o) ? (i = "", c != null && (i = c.replace(ue, "$&/") + "/"), fe(o, r, i, "", function(e) {
			return e;
		})) : o != null && (ce(o) && (o = b(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(ue, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (ae(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + de(a, u), c += fe(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + de(a, u++), c += fe(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return fe(x(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function pe(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return fe(e, r, "", "", function(e) {
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
	var he = typeof reportError == "function" ? reportError : function(e) {
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
	function S(e) {
		var t = v.T, n = {};
		n.types = t === null ? null : t.types, v.T = n;
		try {
			var r = e(), i = v.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(oe, he);
		} catch (e) {
			he(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), v.T = t;
		}
	}
	function ge(e) {
		var t = v.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else S(ge.bind(null, e));
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
	e.Activity = f, e.Children = _e, e.Component = _, e.Fragment = r, e.Profiler = a, e.PureComponent = re, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = v, e.__COMPILER_RUNTIME = {
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
			_init: me
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = S, e.unstable_useCacheRefresh = function() {
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
})), at = /* @__PURE__ */ me(((e, t) => {
	process.env.NODE_ENV !== "production" && (function() {
		function n(e, t) {
			Object.defineProperty(a.prototype, e, { get: function() {
				console.warn("%s(...) is deprecated in plain JavaScript React classes. %s", t[0], t[1]);
			} });
		}
		function r(e) {
			return typeof e != "object" || !e ? null : (e = Oe && e[Oe] || e["@@iterator"], typeof e == "function" ? e : null);
		}
		function i(e, t) {
			e = (e = e.constructor) && (e.displayName || e.name) || "ReactClass";
			var n = e + "." + t;
			ke[n] || (console.error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", t, e), ke[n] = !0);
		}
		function a(e, t, n) {
			this.props = e, this.context = t, this.refs = Me, this.updater = n || Ae;
		}
		function o() {}
		function s(e, t, n) {
			this.props = e, this.context = t, this.refs = Me, this.updater = n || Ae;
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
			if (typeof e == "function") return e.$$typeof === Pe ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case ge: return "Fragment";
				case ve: return "Profiler";
				case _e: return "StrictMode";
				case Se: return "Suspense";
				case Ce: return "SuspenseList";
				case Ee: return "Activity";
				case De: return "ViewTransition";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case S: return "Portal";
				case be: return e.displayName || "Context";
				case ye: return (e._context.displayName || "Context") + ".Consumer";
				case xe:
					var t = e.render;
					return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case we: return t = e.displayName || null, t === null ? d(e.type) || "Memo" : t;
				case Te:
					t = e._payload, e = e._init;
					try {
						return d(e(t));
					} catch {}
			}
			return null;
		}
		function f(e) {
			if (e === ge) return "<>";
			if (typeof e == "object" && e && e.$$typeof === Te) return "<...>";
			try {
				var t = d(e);
				return t ? "<" + t + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function p() {
			var e = w.A;
			return e === null ? null : e.getOwner();
		}
		function m() {
			return Error("react-stack-top-frame");
		}
		function h(e) {
			if (T.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function g(e, t) {
			function n() {
				Ie || (Ie = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function ee() {
			var e = d(this.type);
			return Le[e] || (Le[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function te(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: he,
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
		function _(e, t) {
			return t = te(e.type, t, e.props, e._owner, e._debugStack, e._debugTask), e._store && (t._store.validated = e._store.validated), t;
		}
		function ne(e) {
			re(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === Te && (e._payload.status === "fulfilled" ? re(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function re(e) {
			return typeof e == "object" && !!e && e.$$typeof === he;
		}
		function ie(e) {
			var t = {
				"=": "=0",
				":": "=2"
			};
			return "$" + e.replace(/[=:]/g, function(e) {
				return t[e];
			});
		}
		function ae(e, t) {
			return typeof e == "object" && e && e.key != null ? (u(e.key), ie("" + e.key)) : t.toString(36);
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
					case he:
					case S:
						s = !0;
						break;
					case Te: return s = e._init, v(s(e._payload), t, n, i, a);
				}
			}
			if (s) {
				s = e, a = a(s);
				var c = i === "" ? "." + ae(s, 0) : i;
				return Ne(a) ? (n = "", c != null && (n = c.replace(Ve, "$&/") + "/"), v(a, t, n, "", function(e) {
					return e;
				})) : a != null && (re(a) && (a.key != null && (s && s.key === a.key || u(a.key)), n = _(a, n + (a.key == null || s && s.key === a.key ? "" : ("" + a.key).replace(Ve, "$&/") + "/") + c), i !== "" && s != null && re(s) && s.key == null && s._store && !s._store.validated && (n._store.validated = 2), a = n), t.push(a)), 1;
			}
			if (s = 0, c = i === "" ? "." : i + ":", Ne(e)) for (var l = 0; l < e.length; l++) i = e[l], o = c + ae(i, l), s += v(i, t, n, o, a);
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
			var e = w.H;
			return e === null && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."), e;
		}
		function ce() {
			w.asyncTransitions--;
		}
		function le(e) {
			var t = w.T, n = {};
			n.types = t === null ? null : t.types, n._updatedFibers = /* @__PURE__ */ new Set(), w.T = n;
			try {
				var r = e(), i = w.S;
				i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && (w.asyncTransitions++, r.then(ce, ce), r.then(c, He));
			} catch (e) {
				He(e);
			} finally {
				t === null && n._updatedFibers && (e = n._updatedFibers.size, n._updatedFibers.clear(), 10 < e && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), t !== null && n.types !== null && (t.types !== null && t.types !== n.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), t.types = n.types), w.T = t;
			}
		}
		function ue(e) {
			var t = w.T;
			if (t !== null) {
				var n = t.types;
				n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
			} else w.asyncTransitions === 0 && console.error("addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition."), le(ue.bind(null, e));
		}
		function de(e) {
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
		function x(e) {
			return 1 < e.length && typeof AggregateError == "function" ? AggregateError(e) : e[0];
		}
		function fe(e, t) {
			t !== Ge - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), Ge = t;
		}
		function pe(e, t, n) {
			var r = w.actQueue;
			if (r !== null) {
				if (r.length !== 0) try {
					me(r), de(function() {
						return pe(e, t, n);
					});
					return;
				} catch (e) {
					w.thrownErrors.push(e);
				}
				else w.actQueue = null;
			}
			0 < w.thrownErrors.length ? (r = x(w.thrownErrors), w.thrownErrors.length = 0, n(r)) : t(e);
		}
		function me(e) {
			if (!qe) {
				qe = !0;
				var t = 0;
				try {
					for (; t < e.length; t++) {
						var n = e[t];
						do {
							w.didUsePromise = !1;
							var r = n(!1);
							if (r !== null) {
								if (w.didUsePromise) {
									e[t] = n, e.splice(0, t);
									return;
								}
								n = r;
							} else break;
						} while (1);
					}
					e.length = 0;
				} catch (n) {
					e.splice(0, t + 1), w.thrownErrors.push(n);
				} finally {
					qe = !1;
				}
			}
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var he = Symbol.for("react.transitional.element"), S = Symbol.for("react.portal"), ge = Symbol.for("react.fragment"), _e = Symbol.for("react.strict_mode"), ve = Symbol.for("react.profiler"), ye = Symbol.for("react.consumer"), be = Symbol.for("react.context"), xe = Symbol.for("react.forward_ref"), Se = Symbol.for("react.suspense"), Ce = Symbol.for("react.suspense_list"), we = Symbol.for("react.memo"), Te = Symbol.for("react.lazy"), Ee = Symbol.for("react.activity"), De = Symbol.for("react.view_transition"), Oe = Symbol.iterator, ke = {}, Ae = {
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
		}, je = Object.assign, Me = {};
		Object.freeze(Me), a.prototype.isReactComponent = {}, a.prototype.setState = function(e, t) {
			if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
			this.updater.enqueueSetState(this, e, t, "setState");
		}, a.prototype.forceUpdate = function(e) {
			this.updater.enqueueForceUpdate(this, e, "forceUpdate");
		};
		var C = {
			isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
			replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
		};
		for (Ye in C) C.hasOwnProperty(Ye) && n(Ye, C[Ye]);
		o.prototype = a.prototype, C = s.prototype = new o(), C.constructor = s, je(C, a.prototype), C.isPureReactComponent = !0;
		var Ne = Array.isArray, Pe = Symbol.for("react.client.reference"), w = {
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
		}, T = Object.prototype.hasOwnProperty, Fe = console.createTask ? console.createTask : function() {
			return null;
		};
		C = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var Ie, E, Le = {}, Re = C.react_stack_bottom_frame.bind(C, m)(), ze = Fe(f(m)), Be = !1, Ve = /\/+/g, He = typeof reportError == "function" ? reportError : function(e) {
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
		} : de;
		C = Object.freeze({
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
				if (!re(e)) throw Error("React.Children.only expected to receive a single React element child.");
				return e;
			}
		};
		e.Activity = Ee, e.Children = Ye, e.Component = a, e.Fragment = ge, e.Profiler = ve, e.PureComponent = s, e.StrictMode = _e, e.Suspense = Se, e.ViewTransition = De, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = w, e.__COMPILER_RUNTIME = C, e.act = function(e) {
			var t = w.actQueue, n = Ge;
			Ge++;
			var r = w.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				w.thrownErrors.push(e);
			}
			if (0 < w.thrownErrors.length) throw fe(t, n), e = x(w.thrownErrors), w.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return Je(function() {
					i || Ke || (Ke = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				}), { then: function(e, a) {
					i = !0, o.then(function(i) {
						if (fe(t, n), n === 0) {
							try {
								me(r), de(function() {
									return pe(i, e, a);
								});
							} catch (e) {
								w.thrownErrors.push(e);
							}
							if (0 < w.thrownErrors.length) {
								var o = x(w.thrownErrors);
								w.thrownErrors.length = 0, a(o);
							}
						} else e(i);
					}, function(e) {
						fe(t, n), 0 < w.thrownErrors.length ? (e = x(w.thrownErrors), w.thrownErrors.length = 0, a(e)) : a(e);
					});
				} };
			}
			var s = a;
			if (fe(t, n), n === 0 && (me(r), r.length !== 0 && Je(function() {
				i || Ke || (Ke = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), w.actQueue = null), 0 < w.thrownErrors.length) throw e = x(w.thrownErrors), w.thrownErrors.length = 0, e;
			return { then: function(e, t) {
				i = !0, n === 0 ? (w.actQueue = r, de(function() {
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
			var e = w.getCurrentStack;
			return e === null ? null : e();
		}, e.cloneElement = function(e, t, n) {
			if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
			var r = je({}, e.props), i = e.key, a = e._owner;
			if (t != null) {
				var o;
				a: {
					if (T.call(t, "ref") && (o = Object.getOwnPropertyDescriptor(t, "ref").get) && o.isReactWarning) {
						o = !1;
						break a;
					}
					o = t.ref !== void 0;
				}
				for (s in o && (a = p()), h(t) && (u(t.key), i = "" + t.key), t) !T.call(t, s) || s === "key" || s === "__self" || s === "__source" || s === "ref" && t.ref === void 0 || (r[s] = t[s]);
			}
			var s = arguments.length - 2;
			if (s === 1) r.children = n;
			else if (1 < s) {
				o = Array(s);
				for (var c = 0; c < s; c++) o[c] = arguments[c + 2];
				r.children = o;
			}
			for (r = te(e.type, i, r, a, e._debugStack, e._debugTask), i = 2; i < arguments.length; i++) ne(arguments[i]);
			return r;
		}, e.createContext = function(e) {
			return e = {
				$$typeof: be,
				_currentValue: e,
				_currentValue2: e,
				_threadCount: 0,
				Provider: null,
				Consumer: null
			}, e.Provider = e, e.Consumer = {
				$$typeof: ye,
				_context: e
			}, e._currentRenderer = null, e._currentRenderer2 = null, e;
		}, e.createElement = function(e, t, n) {
			for (var r = 2; r < arguments.length; r++) ne(arguments[r]);
			var i;
			r = {};
			var a = null;
			if (t != null) for (i in E || !("__self" in t) || "key" in t || (E = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), h(t) && (u(t.key), a = "" + t.key), t) T.call(t, i) && i !== "key" && i !== "__self" && i !== "__source" && (r[i] = t[i]);
			var o = arguments.length - 2;
			if (o === 1) r.children = n;
			else if (1 < o) {
				for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
				Object.freeze && Object.freeze(s), r.children = s;
			}
			if (e && e.defaultProps) for (i in o = e.defaultProps, o) r[i] === void 0 && (r[i] = o[i]);
			return a && g(r, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), (i = 1e4 > w.recentlyCreatedOwnerStacks++) ? (s = Error.stackTraceLimit, Error.stackTraceLimit = 10, o = Error("react-stack-top-frame"), Error.stackTraceLimit = s) : o = Re, te(e, a, r, p(), o, i ? Fe(f(e)) : ze);
		}, e.createRef = function() {
			var e = { current: null };
			return Object.seal(e), e;
		}, e.forwardRef = function(e) {
			e != null && e.$$typeof === we ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e == "function" ? e.length !== 0 && e.length !== 2 && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.") : console.error("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e), e != null && e.defaultProps != null && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
			var t = {
				$$typeof: xe,
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
		}, e.isValidElement = re, e.lazy = function(e) {
			e = {
				_status: -1,
				_result: e
			};
			var t = {
				$$typeof: Te,
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
				$$typeof: we,
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
			return e.$$typeof === ye && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"), t.useContext(e);
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
(/* @__PURE__ */ me(((e, t) => {
	t.exports = process.env.NODE_ENV === "production" ? it() : at();
})))();
var ot = [
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
function D(e) {
	return ot.find((t) => t.id === e);
}
function st(e, t) {
	return D(e)?.units.find((e) => e.id === t);
}
//#endregion
//#region src/features/inventory/data/productCostingRepository.ts
var ct = /* @__PURE__ */ new Set(), lt = "2026-01-01T00:00:00.000Z", ut = ot.map((e) => ({
	productId: e.id,
	costingMethod: "MOVING_WEIGHTED_AVERAGE",
	baseUnitId: e.baseUnitId,
	active: !0,
	createdAt: lt,
	updatedAt: lt
}));
function dt() {
	ct.forEach((e) => e());
}
var ft = {
	ensureProductPolicy(e, t, n) {
		let r = ut.find((t) => t.productId === e), i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			productId: e,
			baseUnitId: t,
			active: n ? r?.active ?? !0 : !1,
			costingMethod: "MOVING_WEIGHTED_AVERAGE",
			createdAt: r?.createdAt ?? i,
			updatedAt: i
		};
		return ut = [...ut.filter((t) => t.productId !== e), a], dt(), a;
	},
	subscribe(e) {
		return ct.add(e), () => {
			ct.delete(e);
		};
	},
	getSnapshot() {
		return ut;
	},
	getAll() {
		return ut;
	},
	getByProductId(e) {
		return ut.find((t) => t.productId === e);
	},
	requireByProductId(e) {
		let t = ft.getByProductId(e);
		if (!t) throw Error("Product costing policy was not found.");
		return t;
	},
	setActive(e, t) {
		if (t && !tt(D(e) ?? { itemType: "SERVICE" })) throw Error("Inventory costing cannot be enabled for non-stock/service items.");
		let n = {
			...ft.requireByProductId(e),
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ut = ut.map((t) => t.productId === e ? n : t), dt(), n;
	}
};
_("costingPolicies", {
	repository: ft,
	read: "inventory.cost.read",
	commands: {
		ensureProductPolicy: null,
		setActive: "accounting.post"
	},
	snapshot: () => ({ policies: ut }),
	restore: (e) => {
		ut = e.policies;
	},
	publish: () => ct.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/productRepository.ts
var pt = u({
	id: t().min(1),
	code: s([
		"M2",
		"LM",
		"BOX",
		"PIECE",
		"ROLL",
		"BUCKET",
		"HOUR",
		"JOB"
	]),
	name: t().trim().min(1),
	symbol: t().min(1),
	conversionToBase: o().finite().positive(),
	basePrice: o().finite().nonnegative(),
	isBaseUnit: r(),
	active: r()
}).strict(), mt = u({
	id: t().min(1),
	sku: t().trim().min(1).max(80),
	name: t().trim().min(1).max(180),
	category: s([
		"Timber",
		"Hybrid",
		"Laminate",
		"Vinyl",
		"Carpet",
		"Accessories",
		"Other"
	]),
	brand: t().optional(),
	collection: t().optional(),
	description: t().optional(),
	status: s(["ACTIVE", "INACTIVE"]),
	baseUnitId: t().min(1),
	units: l(pt).min(1),
	createdAt: t(),
	updatedAt: t(),
	revision: o().int().nonnegative().optional(),
	itemType: s([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	buyEnabled: r().optional(),
	sellEnabled: r().optional(),
	reorderPoint: o().finite().nonnegative().optional(),
	targetStock: o().finite().nonnegative().optional(),
	wholePacks: r().optional(),
	taxCode: t().min(1).optional()
}).strict(), ht = /* @__PURE__ */ new Set(), gt = [...ot];
function _t() {
	gt = [...ot], ht.forEach((e) => e());
}
function vt(e, t, n) {
	if (Array.isArray(e)) return e.some((e) => vt(e, t, n));
	if (!e || typeof e != "object") return !1;
	let r = e;
	return r.productId === t && (!n || r.unitId === n) || Object.values(r).some((e) => vt(e, t, n));
}
function yt(e) {
	let t = l(mt).parse(e), n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.id) || r.has(e.sku.toLowerCase())) throw Error("Duplicate product ID or SKU.");
		if (n.add(e.id), r.add(e.sku.toLowerCase()), !tt(e) && e.buyEnabled !== !1) throw Error("Non-stock/service catalogue items must use expense bills for purchasing.");
		if (!tt(e) && ((e.reorderPoint ?? 0) !== 0 || (e.targetStock ?? 0) !== 0)) throw Error("Non-stock/service items cannot have stock reorder thresholds.");
		if (tt(e) && e.units.some((e) => e.code === "HOUR" || e.code === "JOB")) throw Error("Hour/job units require non-stock or service items.");
		if (new Set(e.units.map((e) => e.id)).size !== e.units.length || e.units.filter((e) => e.isBaseUnit).length !== 1 || !e.units.some((t) => t.id === e.baseUnitId && t.isBaseUnit && t.conversionToBase === 1)) throw Error("A product needs exactly one valid base unit.");
		if ((e.targetStock ?? 0) < (e.reorderPoint ?? 0)) throw Error("Target stock must be at least the reorder point.");
	}
	return t;
}
var bt = {
	subscribe(e) {
		return ht.add(e), () => {
			ht.delete(e);
		};
	},
	getSnapshot: () => gt,
	getAll: () => ot,
	getById: (e) => ot.find((t) => t.id === e),
	save(e, t) {
		let n = mt.parse(e), r = ot.find((e) => e.id === n.id);
		if (r && t !== (r.revision ?? 0)) throw Error("Product changed since it was opened. Reload before saving.");
		if (!r && t !== void 0) throw Error("Product no longer exists.");
		if (ne(n.taxCode ?? "GST"), !tt(n) && n.buyEnabled !== !1) throw Error("Non-stock and service catalogue items are sales-only. Use expense/service bills for supplier costs.");
		let i = x();
		if (delete i.products, r) {
			let e = { ...i };
			if (delete e.costingPolicies, (r.itemType ?? "STOCK") !== (n.itemType ?? "STOCK") && vt(e, n.id)) throw Error("A referenced product cannot change item type. Create a new catalogue item.");
			if (r.baseUnitId !== n.baseUnitId && vt(i, n.id)) throw Error("A referenced product cannot change base unit.");
			for (let e of r.units) {
				let t = n.units.find((t) => t.id === e.id);
				if ((!t || t.conversionToBase !== e.conversionToBase || t.code !== e.code) && vt(i, n.id, e.id)) throw Error("A referenced unit conversion cannot be changed or removed. Add a new unit instead.");
			}
		}
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...n,
			createdAt: r?.createdAt ?? a,
			updatedAt: a,
			revision: (r?.revision ?? 0) + 1
		};
		return yt([...ot.filter((e) => e.id !== n.id), o]), r ? ot.splice(ot.indexOf(r), 1, o) : ot.push(o), ft.ensureProductPolicy(o.id, o.baseUnitId, tt(o)), r && tt(r) !== tt(o) && ft.setActive(o.id, tt(o)), _t(), o;
	}
};
_("products", {
	validate: (e, t) => {
		let n = yt(e.products), r = t.workspace_tax_codes.records, i = t.costingPolicies.policies, a = t.stock.balances;
		for (let e of n.filter((e) => !tt(e))) if (i.some((t) => t.productId === e.id && t.active) || a.some((t) => t.productId === e.id && t.quantityOnHand !== 0)) throw Error("Non-stock/service product has inventory activity or active costing.");
		if (n.some((e) => !r.some((t) => t.code === (e.taxCode ?? "GST")))) throw Error("Backup product tax-code reference is invalid.");
	},
	repository: bt,
	read: "inventory.read",
	commands: { save: "inventory.adjust" },
	snapshot: () => ({ products: structuredClone(ot) }),
	restore: (e) => {
		let t = yt(e.products);
		ot.splice(0, ot.length, ...t), gt = [...ot];
	},
	publish: _t
});
//#endregion
//#region src/features/contact-review/reviewModel.ts
var xt = [
	"Customer",
	"Branch",
	"Contact"
], St = [
	"Manual",
	"Sales draft",
	"Selected contact",
	"Card transcription"
], Ct = {
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
}, wt = fe(t(), p([
	t().max(2e3),
	o().finite(),
	r()
]));
function Tt(e, t) {
	let n = wt.parse(t), r = Ct[e];
	if (Object.keys(n).some((e) => !Object.hasOwn(r, e))) throw Error("Unsupported draft field. Use the documented fields for this draft type.");
	for (let [e, t] of Object.entries(n)) if (typeof t != typeof r[e]) throw Error(`Invalid value type for ${e}.`);
	return {
		...r,
		...n
	};
}
var Et = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), Dt = (e) => String(e ?? "").trim().toLowerCase(), Ot = (e) => String(e ?? "").replace(/\D/g, ""), kt = (e, t, n = Et) => !!n(e) && n(e) === n(t);
function At(e, t) {
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
		(kt(r.businessName, e.businessName) || kt(r.businessName, e.tradingName) || kt(r.tradingName, e.businessName) || kt(r.tradingName, e.tradingName)) && t.push("Business/trading name"), kt(r.email, e.email, Dt) && t.push("Email"), kt(r.phone, e.phone, Ot) && t.push("Phone"), kt(r.abn, e.abn) && t.push("Identifier"), i(e.id, e.id, e.businessName, [
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
			kt(r.name, e.name) && t.push("Branch name"), String(r.addressLine1).trim() && kt([
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
			].join(" ")) && t.push("Address"), kt(r.phone, e.phone, Ot) && t.push("Phone"), i(e.id, n.id, e.name, [
				e.addressLine1,
				e.suburb,
				e.postcode
			].filter(Boolean).join(" · "), t);
		}
		else for (let e of n.contacts) {
			let t = [];
			kt([r.firstName, r.lastName].join(" "), [e.firstName, e.lastName].join(" ")) && t.push("Contact name"), kt(r.email, e.email, Dt) && t.push("Email"), (kt(r.phone, e.phone, Ot) || kt(r.phone, e.mobile, Ot) || kt(r.mobile, e.phone, Ot) || kt(r.mobile, e.mobile, Ot)) && t.push("Phone/mobile"), i(e.id, n.id, `${e.firstName} ${e.lastName}`, [
				e.email,
				e.phone,
				e.mobile
			].filter(Boolean).join(" · "), t);
		}
	}
	return n.sort((e, t) => t.reasons.length - e.reasons.length || e.name.localeCompare(t.name) || e.id.localeCompare(t.id));
}
function jt(e) {
	return JSON.stringify(e);
}
//#endregion
//#region src/features/page-previews/catalog.ts
var O = (e, t, n = "text", r, i) => ({
	key: e,
	label: t,
	type: n,
	options: r,
	value: i,
	required: !0
}), k = (e, t, n) => O(e, t, "select", n), Mt = (e, t, n = "0") => ({
	...O(e, t, "number", void 0, n),
	min: 0,
	step: "0.01"
}), Nt = (e, t) => O(e, t, "date", void 0, "2026-10-16"), Pt = (e, t) => ({
	...k(e, t, [
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
}), Ft = [];
function It(e, t, n, r, i, a, o, s, c) {
	Ft.push({
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
It("products", "Products & services", "Inventory & pricing", "/inventory/products", "inventory.read", "Maintain purchasing, selling, stock and packaging information.", [
	O("sku", "SKU"),
	k("kind", "Product type", [
		"Stock item",
		"Service",
		"Non-stock item"
	]),
	k("unit", "Selling unit", [
		"Pack",
		"m²",
		"Bucket",
		"Each"
	]),
	Mt("price", "Standard selling price", "49.50"),
	Mt("cost", "Buying cost (sample)", "25"),
	Mt("coverage", "m² per pack", "2.2"),
	k("rounding", "Pack rounding", ["Whole packs up", "Allow fractional packs"]),
	Mt("reorder", "Reorder point", "10"),
	Mt("target", "Target stock", "50"),
	k("buy", "Available for purchasing", ["Yes", "No"]),
	k("sell", "Available for selling", ["Yes", "No"]),
	k("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	O("brand", "Brand"),
	O("category", "Category"),
	O("image", "Image URL (preview only)")
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
]), It("promotions", "Scheduled promotions", "Inventory & pricing", "/inventory/promotions", "inventory.read", "Plan customer and product specials with explicit start and end times.", [
	O("product", "Product / SKU"),
	O("customer", "Customer scope"),
	O("starts", "Starts (local time)", "datetime-local", void 0, "2026-10-16T09:00"),
	O("ends", "Ends (local time)", "datetime-local", void 0, "2026-10-31T17:00"),
	Mt("price", "Promotional unit price", "45"),
	k("priority", "Priority when rules overlap", [
		"Customer price first",
		"Promotion first",
		"Lowest eligible price"
	]),
	O("timezone", "Time zone", "text", void 0, "Pacific/Auckland")
], {
	name: "October flooring special",
	product: "SAMPLE-OAK",
	customer: "All trade customers"
}, [
	"Overview",
	"Price comparison",
	"History"
]), It("tax-codes", "Tax codes", "Accounting", "/accounting/tax-codes", "accounting.read", "Review GST codes, inclusive/exclusive calculation and reporting mappings.", [
	O("code", "Tax code"),
	Mt("rate", "Tax rate (%)", "15"),
	k("basis", "Entry basis", ["Exclusive", "Inclusive"]),
	Pt("collected", "GST collected account"),
	Pt("paid", "GST paid account"),
	O("report", "Return / report mapping")
], {
	name: "Standard GST",
	code: "GST15",
	report: "Output / input GST"
}, [
	"Overview",
	"Calculation preview",
	"Reporting"
]), It("linked-accounts", "Linked accounts", "Accounting", "/accounting/linked-accounts", "accounting.read", "Preview default general ledger mappings used by each business process.", [
	k("process", "Business process", [
		"Sales",
		"Purchases",
		"Payroll"
	]),
	Pt("receivable", "Receivables / payables control"),
	Pt("income", "Income / expense account"),
	Pt("inventory", "Inventory account"),
	Pt("cogs", "Cost of goods sold"),
	Pt("gst", "GST control account"),
	Pt("payroll", "Payroll clearing account")
], {
	name: "Sales posting defaults",
	process: "Sales"
}, ["Overview", "Posting example"]), It("jobs", "Jobs & projects", "Accounting", "/accounting/jobs", "accounting.read", "Track project budgets, allocate posted revenue and costs, and compare actual profitability.", [
	O("code", "Job code"),
	O("customer", "Customer"),
	O("owner", "Project owner"),
	Nt("starts", "Start date"),
	Nt("ends", "End date"),
	Mt("budget", "Revenue budget", "10000"),
	Mt("costBudget", "Cost budget", "6000")
], {
	name: "Sample showroom installation",
	code: "JOB-SAMPLE",
	customer: "Sample Flooring Ltd",
	owner: "Sample team"
}, [
	"Overview",
	"Transactions",
	"Profitability"
]), It("bank-accounts", "Bank account setup", "Banking", "/banking/setup/accounts", "banking.read", "Preview bank account details, ledger links and feed preferences.", [
	O("number", "Account number (sample only)"),
	O("bank", "Bank name"),
	k("currency", "Currency", ["NZD", "AUD"]),
	Pt("ledger", "Linked bank GL account"),
	k("feed", "Feed provider", ["Manual import", "Provider to be configured"]),
	Nt("feedStart", "Feed start date")
], {
	name: "Sample operating account",
	number: "00-0000-0000000-00",
	bank: "Sample Bank"
}, [
	"Overview",
	"Feed settings",
	"Import history"
]), It("bank-rules", "Bank rules", "Banking", "/banking/rules", "banking.read", "Define matching conditions and resulting categorisation before testing a sample.", [
	k("match", "Match mode", ["All conditions", "Any condition"]),
	k("field", "Transaction field", [
		"Description",
		"Payee",
		"Reference"
	]),
	k("operator", "Operator", [
		"Contains",
		"Equals",
		"Starts with"
	]),
	O("value", "Match text"),
	Pt("account", "Categorise to account"),
	k("tax", "Tax code", [
		"GST 15%",
		"Zero rated",
		"Exempt"
	]),
	k("enabled", "Enabled", ["Yes", "No"])
], {
	name: "Sample office supplies",
	value: "OFFICE",
	field: "Description"
}, [
	"Overview",
	"Test rule",
	"History"
]), It("payment-batches", "Electronic payment batches", "Banking", "/banking/payment-batches", "banking.read", "Select sample supplier or wage payments, review approval and bank export layout.", [
	k("kind", "Batch type", ["Supplier payments", "Wages"]),
	Nt("payDate", "Payment date"),
	O("bank", "Paying account"),
	O("reference", "Bank reference"),
	k("format", "Export format", ["NZ bank CSV preview", "ABA layout preview"]),
	Mt("total", "Batch total", "1100")
], {
	name: "Sample supplier batch",
	bank: "Sample operating account",
	reference: "OCT-SAMPLE"
}, [
	"Overview",
	"Payments",
	"Approval & export"
]), It("pay-items", "Pay items", "Payroll", "/payroll/pay-items", "accounting.read", "Configure sample earnings, allowances, deductions, leave, tax and employer contributions.", [
	O("code", "Pay item code"),
	k("category", "Category", [
		"Earnings",
		"Allowance",
		"Deduction",
		"Leave",
		"Tax",
		"Employer contribution"
	]),
	k("method", "Calculation method", [
		"Hourly rate",
		"Fixed amount",
		"Percentage"
	]),
	Mt("rate", "Rate / amount", "30"),
	k("taxable", "Tax treatment", [
		"Taxable",
		"Non-taxable",
		"Before tax deduction",
		"After tax deduction"
	]),
	Pt("expense", "Expense account"),
	Pt("liability", "Liability / clearing account")
], {
	name: "Ordinary hours",
	code: "ORD",
	category: "Earnings"
}, [
	"Overview",
	"Employee assignments",
	"Posting preview"
]), It("filing", "Payroll filing", "Payroll", "/payroll/filing", "accounting.read", "Review a sample NZ Payday Filing submission and its response / correction workflow.", [
	O("payrun", "Pay run reference"),
	Nt("payDate", "Pay date"),
	O("employer", "Employer IRD identifier (sample)"),
	k("type", "Submission type", ["Employment information", "Amendment"]),
	O("contact", "Payroll contact email", "email")
], {
	name: "October employment information",
	payrun: "SAMPLE-RUN-01",
	employer: "000-000-000",
	contact: "payroll@example.invalid"
}, [
	"Overview",
	"Employees & validation",
	"Submission & response"
]), It("recurring", "Recurring transactions", "Automation & tasks", "/automation/recurring", "inventory.read", "Generate due invoice and expense drafts from saved local templates with ordered schedules and retry protection.", [
	k("kind", "Transaction type", [
		"Invoice",
		"Bill",
		"Bank transaction"
	]),
	O("contact", "Customer / supplier"),
	k("frequency", "Frequency", [
		"Weekly",
		"Fortnightly",
		"Monthly",
		"Quarterly"
	]),
	Nt("next", "Next generation date"),
	Nt("ends", "Schedule end date"),
	Mt("total", "Template amount", "220"),
	k("mode", "Generation mode", ["Draft for review", "Require approval"])
], {
	name: "Monthly sample maintenance",
	contact: "Sample Flooring Ltd"
}, [
	"Overview",
	"Template lines",
	"Run history"
]), It("tasks", "Tasks & action centre", "Automation & tasks", "/tasks", "sales.read", "Maintain local tasks, owners and due dates with audited completion and reopening.", [
	O("customer", "Customer / branch"),
	O("owner", "Assigned to"),
	Nt("due", "Due date"),
	k("priority", "Priority", [
		"Normal",
		"High",
		"Low"
	]),
	O("notes", "Task instructions", "textarea")
], {
	name: "Follow up showroom quote",
	customer: "Sample Flooring / North branch",
	owner: "Sample sales",
	notes: "Confirm quantities and planned installation date."
}, [
	"Overview",
	"Notes & attachments",
	"Status history"
]), It("visits", "Sales visits & activity", "Automation & tasks", "/sales/activity", "sales.read", "Plan local sales visits, record trusted check-in/out, outcomes and linked follow-up tasks.", [
	O("salesperson", "Salesperson"),
	O("customer", "Customer / branch"),
	O("checkin", "Check-in", "datetime-local", void 0, "2026-10-16T09:00"),
	O("checkout", "Check-out", "datetime-local", void 0, "2026-10-16T09:30"),
	O("outcome", "Visit outcome", "textarea"),
	O("location", "Recorded location")
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
]), It("draft-review", "Customer & contact review", "Automation & tasks", "/contacts/review", "sales.read", "Review local customer, branch and contact drafts, compare duplicates and approve or link real records.", [
	k("kind", "Draft type", [
		"Customer",
		"Branch",
		"Contact"
	]),
	O("company", "Customer / company"),
	O("branch", "Branch"),
	O("email", "Email", "email"),
	O("phone", "Phone"),
	k("source", "Source", [
		"Sales draft",
		"Selected phone contact",
		"Business card OCR"
	]),
	k("decision", "Review decision", [
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
]), It("templates", "PDF & email templates", "Documents & imports", "/documents/templates", "accounting.read", "Design sample invoice, quote, PO, statement and remittance layouts and email copy.", [
	k("kind", "Document type", [
		"Invoice",
		"Quotation",
		"Purchase order",
		"Customer statement",
		"Remittance"
	]),
	O("subject", "Email subject"),
	O("body", "Email body", "textarea"),
	O("footer", "PDF footer", "textarea"),
	k("logo", "Logo position", [
		"Left",
		"Centre",
		"Right"
	]),
	k("paper", "Paper size", ["A4", "Letter"])
], {
	name: "Standard invoice template",
	subject: "Your document {{number}}",
	body: "Hello {{contact}}, please review the attached {{type}}.",
	footer: "Thank you for your business."
}, [
	"Overview",
	"PDF preview",
	"Email preview"
]), It("custom-reports", "Saved & favourite reports", "Reports", "/reports/saved", "accounting.read", "Save explicit filters and ordered columns, run local data and export complete results.", [
	k("dataset", "Dataset", [
		"Sales",
		"Purchases",
		"Payroll",
		"Banking",
		"General ledger"
	]),
	O("columns", "Columns (comma separated)"),
	O("filter", "Filter expression (preview)"),
	k("basis", "Basis", ["Accrual", "Cash"]),
	k("favourite", "Favourite", ["Yes", "No"])
], {
	name: "Monthly sales by customer",
	columns: "Customer, Date, Net, GST, Total",
	filter: "Date: current month"
}, ["Overview", "Report preview"]), It("report-packs", "Report packs", "Reports", "/reports/packs", "accounting.read", "Generate combined financial reports from current local books, with ordered sections and printable exports.", [
	O("company", "Company"),
	O("period", "Reporting period"),
	O("reports", "Included reports (comma separated)"),
	O("cover", "Cover heading"),
	O("introduction", "Cover note", "textarea")
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
var Lt = Ft;
[...new Set(Ft.map((e) => e.group))], k("gst", "GST registration", ["Registered", "Not registered"]), k("filing", "GST filing cycle", [
	"Two monthly",
	"Monthly",
	"Six monthly"
]), Mt("quoteNext", "Next quote number", "1001"), Mt("orderNext", "Next order number", "1001"), Mt("invoiceNext", "Next invoice number", "1001"), Mt("creditNext", "Next credit number", "1001"), k("terms", "Default terms", [
	"20th of following month",
	"Due on receipt",
	"30 days"
]), k("template", "Default template", ["Standard invoice", "Trade invoice"]), k("reminders", "Overdue reminders", ["Manual only", "7 and 14 days overdue"]), k("onlinePayment", "Online payment option", ["Disabled", "Configuration preview"]), Mt("next", "Next PO number", "1001"), k("terms", "Default payment terms", [
	"20th of following month",
	"30 days",
	"Due on receipt"
]), Pt("expense", "Default expense account"), k("receipt", "Bill matching", ["Require receipt match", "Allow expense bills"]), k("remittance", "Remittance preference", ["Preview before sending", "Manual"]), k("cycle", "Pay cycle", [
	"Weekly",
	"Fortnightly",
	"Monthly"
]), k("day", "Pay day", [
	"Wednesday",
	"Thursday",
	"Friday"
]), Pt("wages", "Wages expense account"), Pt("clearing", "Payroll clearing account"), k("bank", "Paying bank", ["Sample operating account"]), k("filing", "Filing region", ["New Zealand · Payday Filing", "Australia · STP preview"]), k("basis", "Default basis", ["Accrual", "Cash"]), k("currency", "Display currency", ["NZD", "AUD"]), k("precision", "Decimal places", ["2", "0"]), k("negative", "Negative number style", ["(1,234.56)", "-1,234.56"]), k("comparative", "Comparative period", [
	"Previous period",
	"Previous year",
	"None"
]);
//#endregion
//#region src/features/page-previews/previewModel.ts
function Rt(e, t) {
	return Object.fromEntries(e.map((e) => [e.key, t?.[e.key] ?? e.value ?? e.options?.[0] ?? ""]));
}
Object.fromEntries(Lt.map((e) => [e.id, [{
	...Rt(e.fields),
	...e.example,
	id: "sample-1",
	name: e.example.name,
	status: "Draft"
}]]));
function zt(e) {
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
var Bt = [
	"Customers",
	"Suppliers",
	"Customer branches",
	"Customer contacts",
	"Products"
], Vt = ["Create", "Update by ID"], Ht = "HTT-CSV-1", Ut = {
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
}, Wt = {
	Customers: Ct.Customer,
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
		...Ct.Branch
	},
	"Customer contacts": {
		customerId: "",
		...Ct.Contact
	},
	Products: Ut
}, Gt = (e) => [
	"_format",
	"id",
	"recordToken",
	"externalId",
	...Object.keys(Wt[e])
], Kt = {
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
}, qt = u({
	dataset: s(Bt),
	mode: s(Vt),
	fileName: t().trim().min(1).max(200),
	text: t().max(1e6),
	mapping: fe(t(), o().int().nonnegative()).optional()
}).strict();
function Jt(e) {
	if (e.text.includes("\0")) throw Error("CSV source must be text without NUL characters.");
	let t = zt(e.text.replace(/^\uFEFF/, ""));
	if (t.length < 2 || t.length > 501) throw Error("Choose a CSV header and 1–500 data records.");
	let n = t[0].map((e) => e.trim());
	if (n.length > 64 || n.some((e) => !e || e.length > 120) || new Set(n.map((e) => e.toLowerCase())).size !== n.length) throw Error("CSV requires 1–64 distinct, nonempty column names of at most 120 characters.");
	if (t.slice(1).some((e) => e.length !== n.length || e.some((e) => e.length > 1e5))) throw Error("Each CSV record must match the header width; cells may not exceed 100,000 characters.");
	let r = Gt(e.dataset), i = e.mapping ?? Object.fromEntries(r.flatMap((e) => {
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
function Yt(e) {
	return e.map((e) => e.map((e) => "\"" + (/^[=+@\-'\t\r]/.test(e) ? "'" + e : e).replaceAll("\"", "\"\"") + "\"").join(",")).join("\r\n");
}
//#endregion
//#region electron/security/transferRepository.ts
var Xt = t().trim().min(1).max(200), Zt = t().trim().min(1).max(2e3), Qt = (e) => Array.isArray(e) ? e.map(Qt) : e && typeof e == "object" ? Object.fromEntries(Object.entries(e).filter(([, e]) => e !== void 0).sort(([e], [t]) => e < t ? -1 : +(e > t)).map(([e, t]) => [e, Qt(t)])) : e, $t = (e) => pe("sha256").update(JSON.stringify(Qt(e))).digest("hex"), en = [], tn = (e, t = !1) => {
	S.require("inventory.read");
	let n = S.require(Kt[e].read);
	return t && S.require(Kt[e].write), n.userId;
};
function nn(e) {
	return e === "Customers" ? E.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Suppliers" ? Xe.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : e === "Products" ? bt.getAll().map((e) => ({
		id: e.id,
		parentId: "",
		raw: e
	})) : E.getAll().flatMap((t) => (e === "Customer branches" ? t.locations : t.contacts).map((e) => ({
		id: e.id,
		parentId: t.id,
		raw: e
	})));
}
function rn(e, t) {
	let n = {};
	for (let [r, i] of Object.entries(Wt[e])) n[r] = String(t.raw[r] ?? i);
	if ((e === "Customer branches" || e === "Customer contacts") && (n.customerId = t.parentId), e === "Products") {
		let e = t.raw;
		n.taxCode = e.taxCode ?? "", n.itemType = e.itemType ?? "STOCK", n.buyEnabled = String(e.buyEnabled ?? (e.itemType === void 0 || e.itemType === "STOCK")), n.baseUnitCode = e.units.find((t) => t.id === e.baseUnitId).code, n.unitsJson = JSON.stringify(e.units);
	}
	return n;
}
function an(e, t) {
	return {
		_format: Ht,
		id: t.id,
		recordToken: $t({
			parentId: t.parentId,
			record: t.raw
		}),
		externalId: en.filter((t) => t.dataset === e).flatMap((e) => e.results).find((e) => e.action === "Created" && e.recordId === t.id)?.externalId ?? "",
		...rn(e, t)
	};
}
function on(e, t) {
	if (!/^-?\d+(?:\.\d+)?$/.test(e) || !Number.isFinite(Number(e)) || Math.abs(Number(e)) > 2 ** 53 - 1) throw Error(`${t} must contain a safe plain number.`);
	return Number(e);
}
function sn(e, t, n) {
	let r = n ? rn(e, n) : { ...Wt[e] };
	for (let n of Object.keys(Wt[e])) if (Object.hasOwn(t, n)) {
		let i = t[n].trim();
		if (typeof Wt[e][n] == "number") r[n] = on(i, n);
		else if (typeof Wt[e][n] == "boolean") {
			if (!["true", "false"].includes(i)) throw Error(`${n} must be true or false.`);
			r[n] = i === "true";
		} else r[n] = i.trim();
	}
	if (n) for (let [n, i] of Object.entries(Wt[e])) Object.hasOwn(t, n) || (typeof i == "number" && (r[n] = Number(r[n])), typeof i == "boolean" && (r[n] = r[n] === "true"));
	return r;
}
var cn = (e) => String(e ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), ln = (e, t) => e.some((e) => e.reasons.some((n) => !t.some((t) => t.id === e.id && t.reasons.includes(n))));
function un(e, t) {
	return t.map((t) => ({
		id: t.id,
		reasons: [
			...cn(t.businessName) === cn(e.businessName) ? ["Name"] : [],
			...e.email && t.email?.toLowerCase() === e.email.toLowerCase() ? ["Email"] : [],
			...e.abn && cn(t.abn) === cn(e.abn) ? ["Identifier"] : []
		]
	})).filter((e) => e.reasons.length);
}
function dn(e, n, i, a = !1) {
	let c = i.id ? nn(e).find((e) => e.id === i.id) : void 0;
	if (n === "Update by ID") {
		if (!c) throw Error("Existing record ID was not found.");
		if (!a && (!i.recordToken || i.recordToken !== an(e, c).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
	} else if (i.id || i.recordToken) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
	if (n === "Update by ID" && i.externalId && i.externalId !== an(e, c).externalId) throw Error("External source IDs cannot be reassigned by an update. Keep the export value or leave it blank.");
	let d = n === "Update by ID" ? c : void 0, f = d ? an(e, d) : null, p = sn(e, i, d), m;
	if (e === "Customers") {
		let e = be.strict().parse(p), t = E.getAll().filter((e) => e.id !== d?.id);
		if (ln(At({
			kind: "Customer",
			customerId: "",
			values: e
		}, t), d ? At({
			kind: "Customer",
			customerId: "",
			values: d.raw
		}, t) : [])) throw Error("Possible existing customer duplicate. Use the customer review workflow or explicit ID update.");
		m = d ? E.update(d.id, e) : E.create(e);
	} else if (e === "Suppliers") {
		let e = et.strict().parse(p), t = Xe.getAll().filter((e) => e.id !== d?.id);
		if (ln(un(e, t), d ? un(d.raw, t) : [])) throw Error("Possible existing supplier duplicate. Resolve it before import.");
		m = d ? Xe.update(d.id, e) : Xe.create(e);
	} else if (e === "Products") {
		let e = l(u({
			id: t().max(200).optional(),
			code: s([
				"M2",
				"LM",
				"BOX",
				"PIECE",
				"ROLL",
				"BUCKET",
				"HOUR",
				"JOB"
			]),
			name: t().trim().min(1).max(120),
			symbol: t().min(1).max(40),
			conversionToBase: o().finite().positive(),
			basePrice: o().finite().nonnegative(),
			isBaseUnit: r(),
			active: r()
		}).strict()).min(1).max(100).parse(JSON.parse(String(p.unitsJson))), n = d?.raw, a = e.map((e) => {
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
		}), c = a.find((e) => e.code === p.baseUnitCode && e.isBaseUnit);
		if (!c) throw Error("baseUnitCode must identify the primary product unit.");
		let { unitsJson: f, baseUnitCode: h, ...g } = p, ee = (/* @__PURE__ */ new Date()).toISOString();
		if (g.taxCode === "" && delete g.taxCode, n) for (let e of [
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
		]) !Object.hasOwn(i, e) && n[e] === void 0 && delete g[e];
		let te = mt.parse({
			...g,
			id: d?.id ?? crypto.randomUUID(),
			baseUnitId: c.id,
			units: a,
			createdAt: n?.createdAt ?? ee,
			updatedAt: ee
		});
		m = bt.save(te, n?.revision ?? (d ? 0 : void 0));
	} else {
		let t = String(p.customerId), n = E.getById(t);
		if (!n || n.status === "INACTIVE") throw Error("Select an existing, non-inactive parent customer.");
		if (d && d.parentId !== t) throw Error("Existing branch/contact cannot move to a different customer.");
		let { customerId: r, ...i } = p, a = e === "Customer branches" ? "Branch" : "Contact", o = a === "Branch" ? xe.strict().parse(i) : Se.strict().parse(i);
		if (ln(At({
			kind: a,
			customerId: t,
			values: o
		}, [n]).filter((e) => e.id !== d?.id), d ? At({
			kind: a,
			customerId: t,
			values: d.raw
		}, [n]).filter((e) => e.id !== d.id) : [])) throw Error("Possible existing branch/contact duplicate. Use customer review or explicit ID update.");
		m = a === "Branch" ? d ? E.updateLocation(t, d.id, o) : E.addLocation(t, o) : d ? E.updateContact(t, d.id, o) : E.addContact(t, o);
	}
	let h = nn(e).find((e) => e.id === m.id);
	return {
		recordId: m.id,
		before: f,
		after: an(e, h)
	};
}
function fn(e) {
	if (tn(e.dataset, !0), Buffer.byteLength(e.text, "utf8") > 1e6) throw Error("CSV source exceeds 1 MB of UTF-8 text.");
	let t = Jt(e), n = new Map(nn(e.dataset).map((t) => [t.id, an(e.dataset, t)])), r = x(), i = $t({
		input: e,
		master: r
	}), a = /* @__PURE__ */ new Set(), o = [], s = [];
	try {
		for (let r of t.rows) {
			let t = r.values, i = (t.externalId ?? "").trim(), c = $t({
				dataset: e.dataset,
				values: Object.fromEntries(Object.keys(Wt[e.dataset]).filter((e) => Object.hasOwn(t, e)).map((e) => [e, t[e]]))
			}), l = e.mode === "Create" ? i : t.id, u = "", d;
			try {
				if (!l) throw Error(e.mode === "Create" ? "externalId is required for safe create retries." : "id is required for explicit updates.");
				if (l.length > 200 || i.length > 200) throw Error("Import identity exceeds 200 characters.");
				if (a.has(l)) throw Error("Repeated identity in this CSV file.");
				if (a.add(l), e.mode === "Create" && (t.id || t.recordToken)) throw Error("Create mode does not accept existing IDs or record tokens. Choose Update by ID.");
				if (e.mode === "Update by ID" && (!n.has(t.id) || t.recordToken !== n.get(t.id).recordToken)) throw Error("Record token is missing or stale. Export the current record again.");
				let s = e.mode === "Create" ? en.filter((t) => t.dataset === e.dataset).flatMap((e) => e.results).find((e) => e.action === "Created" && e.externalId === i) : void 0;
				if (s) {
					if (s.identityFingerprint !== c) throw Error("Source externalId already contains different creation data. Use an explicit ID update.");
					let t = nn(e.dataset).find((e) => e.id === s.recordId);
					if (!t) throw Error("Prior imported record is missing.");
					d = {
						row: r.row,
						externalId: i,
						recordId: t.id,
						action: "Skipped",
						identityFingerprint: c,
						before: null,
						after: an(e.dataset, t)
					};
				} else {
					let a = dn(e.dataset, e.mode, t, !0);
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
				let i = nn(e.dataset).find((e) => e.id === n.recordId), a = an(e.dataset, i);
				if (t.values = Object.fromEntries(Object.keys(Wt[e.dataset]).filter((e) => Object.hasOwn(a, e)).map((e) => [e, a[e]])), e.dataset === "Products") {
					let e = (r.products.products.find((e) => e.id === n.recordId)?.units ?? []).map((e) => e.id);
					t.values.unitsJson = JSON.stringify(JSON.parse(t.values.unitsJson).map((t) => ({
						...t,
						id: e.includes(t.id) ? t.id : "Assigned at commit"
					})));
				}
			}
		}
	} finally {
		m(r);
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
var pn = {
	review(e) {
		return fn(qt.parse(e)).preview;
	},
	commit(e) {
		let n = qt.extend({
			operationId: Xt,
			expectedPreview: t().regex(/^[a-f0-9]{64}$/),
			reason: Zt
		}).strict().parse(e), r = tn(n.dataset, !0), { operationId: i, expectedPreview: a, reason: o, ...s } = n, c = $t({
			source: s,
			reason: o
		}), l = en.find((e) => e.operationId === i);
		if (l) {
			if (l.fingerprint !== c) throw Error("Operation ID already has different import data.");
			return structuredClone(l);
		}
		let u = fn(s);
		if (u.preview.fingerprint !== a) throw Error("Business records or import fields changed. Validate the file again.");
		if (!u.preview.valid) throw Error("Resolve every validation error before committing the batch.");
		let d = Jt(s), f = new Set(d.rows.map((e) => e.values.customerId || nn(s.dataset).find((t) => t.id === e.values.id)?.parentId || "")), p = (e) => JSON.stringify({
			primaryLocationId: e.primaryLocationId,
			primaryContactId: e.primaryContactId,
			locations: e.locations,
			contacts: e.contacts
		}), m = ["Customer branches", "Customer contacts"].includes(s.dataset) ? E.getAll().filter((e) => f.has(e.id)).map((e) => ({
			customerId: e.id,
			before: p(e)
		})) : [], h = [];
		for (let [e, t] of d.rows.entries()) {
			let n = u.results[e];
			n.action === "Skipped" ? h.push(n) : h.push({
				...n,
				...dn(s.dataset, s.mode, t.values, !0),
				before: n.before
			});
		}
		for (let e of h) {
			let t = nn(s.dataset).find((t) => t.id === e.recordId);
			e.after = an(s.dataset, t), e.action === "Created" && (e.after.externalId = e.externalId);
		}
		let g = {
			id: crypto.randomUUID(),
			operationId: i,
			fingerprint: c,
			dataset: s.dataset,
			mode: s.mode,
			fileName: s.fileName,
			sourceHash: pe("sha256").update(s.text).digest("hex"),
			actorId: r,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			reason: o,
			results: h,
			parentChanges: m.map((e) => ({
				...e,
				after: p(E.getById(e.customerId))
			})).filter((e) => e.before !== e.after)
		};
		return gn.parse(g), en = [...en, g], structuredClone(g);
	},
	export(e) {
		e = s(Bt).parse(e), tn(e);
		let t = Gt(e), n = nn(e).map((t) => an(e, t));
		return {
			dataset: e,
			count: n.length,
			csv: Yt([t, ...n.map((e) => t.map((t) => e[t] ?? ""))])
		};
	},
	template(e) {
		e = s(Bt).parse(e), tn(e);
		let t = Gt(e).filter((e) => !["id", "recordToken"].includes(e)), n = {
			_format: Ht,
			externalId: "replace-with-stable-source-id",
			...Object.fromEntries(Object.entries(Wt[e]).map(([e, t]) => [e, String(t)]))
		};
		return (e === "Customers" || e === "Suppliers") && (n.businessName = "Replace company name"), e === "Suppliers" && (n.country = "Replace country"), e === "Customer branches" && (n.name = "Replace branch name", n.addressLine1 = "Replace address", n.suburb = "Replace city", n.state = "Replace region", n.postcode = "Replace postcode", n.country = "Replace country"), e === "Customer contacts" && (n.firstName = "Replace", n.lastName = "Name", n.email = "replace@example.test"), e === "Products" && (n.sku = "REPLACE-SKU", n.name = "Replace product name"), Yt([t, t.map((e) => n[e] ?? "")]);
	}
}, mn = fe(t(), t()), hn = u({
	row: o().int().min(2).max(501),
	externalId: t().max(200),
	recordId: Xt,
	action: s([
		"Created",
		"Updated",
		"Skipped"
	]),
	identityFingerprint: t().regex(/^[a-f0-9]{64}$/),
	before: mn.nullable(),
	after: mn
}).strict(), gn = u({
	id: Xt,
	operationId: Xt,
	fingerprint: t().regex(/^[a-f0-9]{64}$/),
	dataset: s(Bt),
	mode: s(Vt),
	fileName: Xt,
	sourceHash: t().regex(/^[a-f0-9]{64}$/),
	actorId: Xt,
	at: t().refine((e) => new Date(e).toISOString() === e),
	reason: Zt,
	results: l(hn).min(1).max(500),
	parentChanges: l(u({
		customerId: Xt,
		before: t().max(5e6),
		after: t().max(5e6)
	}).strict()).max(500)
}).strict();
_("dataTransfers", {
	repository: pn,
	read: "inventory.read",
	commands: {
		review: "inventory.read",
		commit: "inventory.read",
		export: "inventory.read",
		template: "inventory.read"
	},
	snapshot: () => ({ runs: en }),
	restore: (e) => {
		en = e.runs;
	},
	publish: () => {},
	view: (t) => ({ runs: en.filter((n) => e(t, Kt[n.dataset].read)) }),
	validate: (e, n) => {
		let r = u({ runs: l(gn) }).strict().parse(e), i = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set();
		for (let e of r.runs) {
			if (i.has(e.operationId)) throw Error("Duplicate import operation.");
			i.add(e.operationId);
			let r = e.dataset === "Products" ? n.products.products : e.dataset === "Suppliers" ? n.suppliers.suppliers : n.customers.customers, s = 1;
			for (let t of e.results) {
				if (t.row <= s) throw Error("Import result rows must be ordered.");
				if (s = t.row, !(e.dataset === "Customer branches" ? r.some((e) => e.locations.some((e) => e.id === t.recordId)) : e.dataset === "Customer contacts" ? r.some((e) => e.contacts.some((e) => e.id === t.recordId)) : r.some((e) => e.id === t.recordId)) || t.after.id !== t.recordId || t.before && t.before.id !== t.recordId || t.action === "Updated" && !t.before || t.action !== "Updated" && t.before) throw Error("Invalid imported record reference or before/after audit.");
				if (t.action === "Created") {
					if (e.mode !== "Create" || !t.externalId || a.has(e.dataset + ":" + t.externalId) || o.has(e.dataset + ":" + t.recordId)) throw Error("Invalid import source identity.");
					a.set(e.dataset + ":" + t.externalId, t), o.add(e.dataset + ":" + t.recordId);
				}
				if (t.action === "Skipped") {
					let n = a.get(e.dataset + ":" + t.externalId);
					if (e.mode !== "Create" || !n || n.recordId !== t.recordId || n.identityFingerprint !== t.identityFingerprint) throw Error("Invalid skipped import identity.");
				}
				if (t.action === "Updated" && e.mode !== "Update by ID") throw Error("Invalid import update mode.");
				if (t.before && (Object.keys(t.before).some((t) => !Gt(e.dataset).includes(t)) || t.before._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(t.before.recordToken))) throw Error("Invalid import before-state audit.");
				if (Object.keys(t.after).some((t) => !Gt(e.dataset).includes(t)) || t.after._format !== "HTT-CSV-1" || !/^[a-f0-9]{64}$/.test(t.after.recordToken)) throw Error("Invalid import audit fields.");
			}
			if (new Set(e.parentChanges.map((e) => e.customerId)).size !== e.parentChanges.length || e.parentChanges.length && !["Customer branches", "Customer contacts"].includes(e.dataset)) throw Error("Invalid import parent audit.");
			for (let n of e.parentChanges) {
				if (!r.some((e) => e.id === n.customerId)) throw Error("Invalid import parent reference.");
				for (let e of [n.before, n.after]) {
					let n = u({
						primaryLocationId: t().optional(),
						primaryContactId: t().optional(),
						locations: l(u({ id: Xt }).passthrough()),
						contacts: l(u({ id: Xt }).passthrough())
					}).strict().parse(JSON.parse(e));
					if (n.primaryLocationId && !n.locations.some((e) => e.id === n.primaryLocationId) || n.primaryContactId && !n.contacts.some((e) => e.id === n.primaryContactId)) throw Error("Invalid import primary-record audit.");
				}
			}
		}
	}
});
//#endregion
//#region electron/security/attachmentRepository.ts
var A = t().trim().min(1).max(200), _n = t().trim().min(1).max(2e3), vn = t().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), yn = u({
	id: A,
	number: o().int().positive(),
	name: A,
	mime: A,
	size: o().int().positive().max(f),
	sha256: t().regex(/^[a-f0-9]{64}$/),
	content: t().max(14e6),
	createdAt: vn,
	createdBy: A,
	restoredFrom: A.optional()
}).strict(), bn = u({
	id: A,
	title: t().trim().min(1).max(200),
	target: c,
	revision: o().int().positive(),
	currentVersionId: A,
	versions: l(yn).min(1).max(100),
	createdAt: vn,
	createdBy: A,
	updatedAt: vn,
	updatedBy: A,
	deletedAt: vn.optional(),
	deletedBy: A.optional()
}).strict(), xn = (e) => ({
	title: e.title,
	deleted: !!e.deletedAt,
	currentVersionId: e.currentVersionId,
	versionsCount: e.versions.length
}), Sn = u({
	id: A,
	documentId: A,
	operationId: A,
	action: s([
		"Uploaded",
		"Added version",
		"Restored version",
		"Renamed",
		"Trashed",
		"Recovered"
	]),
	actorId: A,
	at: vn,
	revision: o().int().positive(),
	reason: _n,
	versionId: A.optional(),
	fingerprint: t().regex(/^[a-f0-9]{64}$/),
	after: u({
		title: A,
		deleted: r(),
		currentVersionId: A,
		versionsCount: o().int().positive()
	}).strict()
}).strict(), Cn = [], wn = [];
function Tn() {
	return S.require("inventory.read");
}
var En = () => x([...new Set(Object.values(ie).map((e) => e.repository))]);
function Dn(e, t, r = En()) {
	return n(r, t).find((t) => t.kind === e.kind && t.id === e.id);
}
function On(e, t = !1) {
	let n = Tn(), r = Dn(e, n);
	if (!r) throw Error("Business link was not found or access is denied.");
	if (t && !r.canWrite) throw Error("Permission denied: attachment maintenance requires the linked object write permission.");
	return n.userId;
}
function kn(e, t = !1) {
	let n = Cn.find((t) => t.id === A.parse(e));
	if (!n) throw Error("Attachment not found or access denied.");
	return On(n.target, t), n;
}
var An = (e) => pe("sha256").update(JSON.stringify(e)).digest("hex"), jn = (e, t) => {
	let n = Dn(e.target, t);
	return {
		...e,
		targetLabel: n.label,
		targetPath: n.path,
		canWrite: n.canWrite,
		versions: e.versions.map(({ content: e, ...t }) => t)
	};
};
function Mn(e, t) {
	if (e.revision !== t) throw Error("Attachment changed. Refresh before continuing.");
}
function Nn(e, t) {
	if (t < e.updatedAt) throw Error("System clock precedes the last attachment change.");
}
function Pn(e) {
	if (Cn.flatMap((e) => e.versions).reduce((e, t) => e + t.size, 0) + e > 5e7) throw Error("Local attachment library exceeds 50 MB including versions and trash. Export/archive the business profile before adding more files.");
}
function Fn(e, t) {
	let n = wn.find((t) => t.operationId === e);
	if (!n) return;
	let r = kn(n.documentId, !0);
	if (n.fingerprint !== t) throw Error("Operation ID already has different attachment data.");
	return jn(r, S.current());
}
function In(e, t, n, r, i, a) {
	return Cn = [...Cn.filter((t) => t.id !== e.id), e], wn = [...wn, {
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
		after: xn(e)
	}], jn(e, S.current());
}
_("attachments", {
	repository: {
		targets() {
			return n(En(), Tn());
		},
		checkTarget(e) {
			return On(c.parse(e), !0), !0;
		},
		upload(e) {
			let n = u({
				operationId: A,
				id: A.optional(),
				expectedRevision: o().int().nonnegative(),
				target: c,
				title: A,
				reason: _n,
				file: u({
					name: A,
					content: t().max(14e6)
				}).strict()
			}).strict().parse(e), r = On(n.target, !0), i = de(n.file.name, n.file.content), a = An({
				...n,
				file: {
					name: i.name,
					sha256: i.sha256
				}
			}), s = Fn(n.operationId, a);
			if (s) return s;
			let l = n.id ? kn(n.id, !0) : void 0;
			if (l) {
				if (Mn(l, n.expectedRevision), JSON.stringify(l.target) !== JSON.stringify(n.target)) throw Error("An attachment retains its original business link.");
				if (l.deletedAt) throw Error("Recover the attachment before adding a version.");
				if (l.versions.some((e) => e.sha256 === i.sha256)) throw Error("These file bytes already exist in this attachment. Use version restore instead.");
				if (l.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
			} else if (n.expectedRevision !== 0) throw Error("A new attachment requires revision zero.");
			if (!l && Cn.some((e) => !e.deletedAt && e.target.kind === n.target.kind && e.target.id === n.target.id && e.versions.some((e) => e.sha256 === i.sha256))) throw Error("This file already exists on the selected business object. Open its existing attachment.");
			Pn(i.size);
			let d = (/* @__PURE__ */ new Date()).toISOString();
			l && Nn(l, d);
			let f = {
				...i,
				id: crypto.randomUUID(),
				number: (l?.versions.length ?? 0) + 1,
				createdAt: d,
				createdBy: r
			};
			return In({
				...l ?? {
					id: crypto.randomUUID(),
					target: n.target,
					createdAt: d,
					createdBy: r
				},
				title: l?.title ?? n.title,
				currentVersionId: f.id,
				versions: [...l?.versions ?? [], f],
				revision: (l?.revision ?? 0) + 1,
				updatedAt: d,
				updatedBy: r
			}, l ? "Added version" : "Uploaded", n.operationId, a, n.reason, f.id);
		},
		change(e) {
			let t = u({
				operationId: A,
				id: A,
				expectedRevision: o().int().positive(),
				action: s([
					"Renamed",
					"Trashed",
					"Recovered",
					"Restored version"
				]),
				reason: _n,
				title: A.optional(),
				versionId: A.optional()
			}).strict().parse(e), n = kn(t.id, !0), r = An(t), i = Fn(t.operationId, r);
			if (i) return i;
			Mn(n, t.expectedRevision);
			let a = On(n.target, !0), c = (/* @__PURE__ */ new Date()).toISOString();
			Nn(n, c);
			let l = {
				...n,
				versions: [...n.versions],
				revision: n.revision + 1,
				updatedBy: a,
				updatedAt: c
			}, f;
			if (t.action === "Trashed") {
				if (n.deletedAt) throw Error("Attachment is already in the recycle bin.");
				l.deletedAt = c, l.deletedBy = a;
			} else if (t.action === "Recovered") {
				if (!n.deletedAt) throw Error("Attachment is not in the recycle bin.");
				delete l.deletedAt, delete l.deletedBy;
			} else {
				if (n.deletedAt) throw Error("Recover the attachment before editing.");
				if (t.action === "Renamed") {
					if (!t.title) throw Error("Enter a document title.");
					l.title = t.title;
				} else {
					let e = n.versions.find((e) => e.id === t.versionId);
					if (!e) throw Error("Version not found.");
					if (e.id === n.currentVersionId) throw Error("That version is already current.");
					if (n.versions.length >= 100) throw Error("An attachment supports at most 100 versions.");
					Pn(e.size), d(e);
					let r = {
						...e,
						id: crypto.randomUUID(),
						number: n.versions.length + 1,
						createdAt: c,
						createdBy: a,
						restoredFrom: e.id
					};
					l.versions.push(r), l.currentVersionId = r.id, f = r.id;
				}
			}
			return In(l, t.action, t.operationId, r, t.reason, f);
		},
		read(e) {
			let t = u({
				id: A,
				versionId: A
			}).strict().parse(e), n = kn(t.id).versions.find((e) => e.id === t.versionId);
			if (!n) throw Error("Version not found.");
			return d(n), { ...n };
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
		documents: Cn,
		history: wn
	}),
	restore: (e) => {
		Cn = e.documents, wn = e.history;
	},
	publish: () => {},
	view: (e) => {
		let t = Cn.filter((t) => Dn(t.target, e));
		return {
			documents: t.map((t) => jn(t, e)),
			history: wn.filter((e) => t.some((t) => t.id === e.documentId)).map(({ fingerprint: e, ...t }) => t)
		};
	},
	validate: (e, t) => {
		let n = u({
			documents: l(bn),
			history: l(Sn)
		}).strict().parse(e), r = /* @__PURE__ */ new Set(), i = 0;
		for (let e of n.documents) {
			let r = ie[e.target.kind];
			if (!t[r.repository]?.[r.collection]?.some((t) => t.id === e.target.id)) throw Error("Invalid attachment business reference.");
			if (!!e.deletedAt != !!e.deletedBy) throw Error("Invalid attachment recycle metadata.");
			let a = /* @__PURE__ */ new Set();
			for (let [t, n] of e.versions.entries()) {
				if (d(n), i += n.size, a.has(n.id) || n.number !== t + 1 || n.createdAt < e.createdAt || n.createdAt > e.updatedAt) throw Error("Invalid attachment version history.");
				if (n.restoredFrom && (!a.has(n.restoredFrom) || e.versions.find((e) => e.id === n.restoredFrom)?.sha256 !== n.sha256 || e.versions.find((e) => e.id === n.restoredFrom)?.name !== n.name)) throw Error("Invalid restored attachment version.");
				a.add(n.id);
			}
			if (!a.has(e.currentVersionId)) throw Error("Invalid current attachment version.");
			let o = n.history.filter((t) => t.documentId === e.id);
			if (o.length !== e.revision || o[0].action !== "Uploaded" || o[0].actorId !== e.createdBy || o[0].at !== e.createdAt) throw Error("Invalid attachment audit history.");
			let s = e.createdAt, c = 0, l = !1, u = "", f = "";
			for (let [t, n] of o.entries()) {
				if (n.revision !== t + 1 || n.at < s || n.at > e.updatedAt) throw Error("Invalid attachment audit ordering.");
				if (s = n.at, t > 0 && n.action !== "Renamed" && n.after.title !== f) throw Error("Attachment title changed without a rename event.");
				if (f = n.after.title, ![
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
			let p = o.at(-1);
			if (c !== e.versions.length || p.actorId !== e.updatedBy || p.at !== e.updatedAt || JSON.stringify(p.after) !== JSON.stringify(xn(e))) throw Error("Attachment metadata differs from audit.");
			if (e.deletedAt && (e.deletedAt !== p.at || e.deletedBy !== p.actorId)) throw Error("Attachment deletion differs from audit.");
		}
		for (let e of n.history) {
			if (r.has(e.operationId) || !n.documents.some((t) => t.id === e.documentId)) throw Error("Invalid attachment operation identity.");
			r.add(e.operationId);
		}
		if (i > 5e7) throw Error("Attachment library exceeds 50 MB.");
	}
});
//#endregion
//#region src/features/banking/data/reconciliationLock.ts
function Ln(e, t) {
	let n = x(), r = n.journals?.journalEntries ?? [], i = n.bankReconciliations?.reconciliations ?? [], a = r.filter((n) => n.sourceType === e && n.sourceId === t).map((e) => e.id);
	if (i.some((e) => e.clearedTransactionIds.some((e) => a.some((t) => e.startsWith(t + ":"))))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Rn(e, t) {
	let n = x(), r = n.bankAccounts?.bankAccounts ?? [], i = n.bankReconciliations?.reconciliations ?? [];
	for (let n of r.filter((e) => t.includes(e.glAccountId))) {
		let t = i.filter((e) => e.bankAccountId === n.id).map((e) => e.statementDate).sort().at(-1);
		if (t && e <= t) throw Error(`Bank account is reconciled through ${t}. Use a posting date after that statement.`);
	}
}
//#endregion
//#region src/features/accounting/data/accountingPeriodRepository.ts
var zn = [], Bn, Vn, Hn = /* @__PURE__ */ new Set();
function Un(e, t) {
	Bn = e, Vn = t;
}
function Wn() {
	let e = Vn?.();
	if (!e) throw Error("Trusted period management session required.");
	return e;
}
function Gn(e) {
	if (typeof e != "string" || e.trim().length < 10 || e.length > 2e3) throw Error("Provide a reason of 10–2000 characters.");
	return e.trim();
}
function Kn(e) {
	let t = zn.find((t) => t.id === e);
	if (!t) throw Error("Accounting period not found.");
	return t;
}
function qn() {
	Hn.forEach((e) => e());
}
function Jn(e) {
	if (b(e, "Posting date"), !zn.length) return;
	let t = zn.filter((e) => e.status === "CLOSED").map((e) => e.endDate).sort().at(-1);
	if (t && e <= t) throw Error(`Accounting period is closed through ${t}. Reopen it before posting.`);
	if (!zn.some((t) => t.status === "OPEN" && e >= t.startDate && e <= t.endDate)) throw Error(`No open accounting period covers ${e}.`);
}
_("accountingPeriods", {
	read: "accounting.read",
	repository: {
		getAll: () => zn,
		subscribe(e) {
			return Hn.add(e), () => {
				Hn.delete(e);
			};
		},
		create(e) {
			let t = Wn(), n = Gn(e.reason);
			if (b(e.startDate), b(e.endDate), typeof e.name != "string" || !e.name.trim() || e.name.length > 100 || e.startDate > e.endDate) throw Error("Invalid period name or date range.");
			if (zn.some((t) => e.startDate <= t.endDate && e.endDate >= t.startDate)) throw Error("Accounting periods cannot overlap.");
			if (zn.some((t) => t.status === "CLOSED" && e.startDate <= t.endDate)) throw Error("Reopen later closed periods before inserting an earlier period.");
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
			return zn = [...zn, r].sort((e, t) => e.startDate.localeCompare(t.startDate)), qn(), r;
		},
		preflight(e) {
			let t = Kn(e);
			if (!Bn) throw Error("Trusted close checks unavailable.");
			return Bn(t);
		},
		close(e) {
			let t = Wn(), n = Gn(e.reason), r = Kn(e.id);
			if (r.status !== "OPEN") throw Error("Period is already closed.");
			if (zn.some((e) => e.startDate < r.startDate && e.status !== "CLOSED")) throw Error("Close earlier periods first.");
			let i = this.preflight(e.id);
			if (i.blockers.length) throw Error(`Period cannot close: ${i.blockers.map((e) => e.message).join("; ")}`);
			let { journalCount: a, debit: o, credit: s } = i;
			return zn = zn.map((e) => e.id === r.id ? {
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
			} : e), qn(), Kn(e.id);
		},
		reopen(e) {
			let t = Wn(), n = Gn(e.reason), r = Kn(e.id);
			if (r.status !== "CLOSED") throw Error("Period is already open.");
			if (zn.some((e) => e.startDate > r.startDate && e.status === "CLOSED")) throw Error("Reopen later closed periods first.");
			return zn = zn.map((e) => e.id === r.id ? {
				...e,
				status: "OPEN",
				history: [...e.history, {
					action: "REOPEN",
					actor: t,
					reason: n,
					at: (/* @__PURE__ */ new Date()).toISOString()
				}]
			} : e), qn(), Kn(e.id);
		}
	},
	commands: {
		create: "accounting.periods",
		preflight: "accounting.read",
		close: "accounting.periods",
		reopen: "accounting.reopen"
	},
	snapshot: () => ({ periods: zn }),
	restore: (e) => {
		le(e.periods), zn = e.periods;
	},
	publish: qn
});
//#endregion
//#region src/features/purchases/data/mockPurchaseOrders.ts
var Yn = [{
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
}], Xn = [{
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
}], Zn = "htt:financial-snapshot:v1", Qn = (e) => !!e && typeof e == "object" && !Array.isArray(e), $n = (e) => new Set(e.map((e) => e.id)).size === e.length, er = (e) => {
	if (!Qn(e) || !Array.isArray(e.payments) || !Array.isArray(e.transactions) || !Array.isArray(e.transfers) || !Array.isArray(e.journals)) return !1;
	let t = e.payments, n = e.transactions, r = e.transfers, i = e.journals;
	return t.every((e) => Qn(e) && typeof e.id == "string" && typeof e.invoiceId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount) && (e.status === "RECEIVED" || e.status === "REVERSED")) && n.every((e) => Qn(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && r.every((e) => Qn(e) && typeof e.id == "string" && typeof e.journalEntryId == "string" && typeof e.amount == "number" && Number.isFinite(e.amount)) && i.every((e) => Qn(e) && typeof e.id == "string" && typeof e.sourceType == "string" && Array.isArray(e.lines) && (e.status === "POSTED" || e.status === "REVERSED")) && [
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
		return n === void 0 ? !0 : !Array.isArray(n) || !n.every((e) => Qn(e) && typeof e.id == "string") || new Set(n.map((e) => e.id)).size !== n.length ? !1 : n.every((e) => t === "purchaseOrders" ? typeof e.supplierId == "string" && Array.isArray(e.lines) && Qn(e.totals) : t === "goodsReceipts" ? typeof e.purchaseOrderId == "string" && typeof e.receiptDate == "string" && Array.isArray(e.lines) : t === "receiptMatches" ? typeof e.supplierBillId == "string" && typeof e.goodsReceiptId == "string" && Number.isFinite(e.matchedQuantity) && ["ACTIVE", "REVERSED"].includes(String(e.status)) : t === "reconciliations" ? typeof e.bankAccountId == "string" && typeof e.statementDate == "string" && Number.isFinite(e.statementBalance) && e.status === "COMPLETED" && Array.isArray(e.clearedTransactionIds) && e.clearedTransactionIds.every((e) => typeof e == "string") : t === "supplierBills" ? typeof e.supplierId == "string" && typeof e.billDate == "string" && Qn(e.totals) && Number.isFinite(e.totals.total) && Number.isFinite(e.totals.amountDue) && Array.isArray(e.lines) : t === "supplierPayments" ? typeof e.supplierId == "string" && Number.isFinite(e.amount) && Array.isArray(e.allocations) && ["POSTED", "REVERSED"].includes(String(e.status)) : t === "supplierCredits" ? typeof e.supplierId == "string" && Qn(e.totals) && Number.isFinite(e.totals.total) && Array.isArray(e.lines) : typeof e.supplierBillId == "string" && typeof e.supplierCreditId == "string" && Number.isFinite(e.amount));
	}) && $n(t) && $n(n) && $n(r) && $n(i);
}, tr = () => ({
	purchaseOrders: structuredClone(Yn),
	goodsReceipts: [],
	receiptMatches: [],
	reconciliations: [],
	supplierBills: [],
	supplierPayments: [],
	supplierCredits: [],
	supplierCreditAllocations: [],
	payments: structuredClone(Xn),
	transactions: [],
	transfers: [],
	journals: []
}), nr, rr = !1;
function ir() {
	return typeof window < "u" && !!window.localStorage;
}
function ar() {
	if (nr) return nr;
	if (!ir()) return tr();
	let e = we(Zn, er);
	if (e.status === "invalid" || e.status === "unavailable") throw Error(`Financial snapshot ${e.status}; financial writes blocked.`);
	return rr = e.status === "ok", nr = e.status === "ok" ? {
		...tr(),
		...e.data
	} : tr(), nr;
}
var or = /* @__PURE__ */ new Set(), sr = 0, cr = /* @__PURE__ */ new Set();
function lr(e) {
	if (ir() && !Te(Zn, e)) throw Error("Financial snapshot write failed; write blocked.");
}
var j = {
	wasRestoredOnLoad() {
		return ar(), rr;
	},
	onRollback(e) {
		or.add(e);
	},
	notify(e) {
		sr ? cr.add(e) : e();
	},
	transaction(e) {
		if (sr) return e();
		let t = structuredClone(ar());
		nr = structuredClone(t), sr++;
		let n;
		try {
			if (n = e(), n instanceof Promise) throw Error("Financial transactions must be synchronous.");
			lr(ar());
		} catch (e) {
			throw nr = t, or.forEach((e) => e()), cr.clear(), e;
		} finally {
			sr--;
		}
		let r = [...cr];
		return cr.clear(), r.forEach((e) => {
			try {
				e();
			} catch (e) {
				console.error("Financial subscriber failed", e);
			}
		}), n;
	},
	read() {
		return structuredClone(ar());
	},
	update(e, t) {
		let n = {
			...ar(),
			[e]: structuredClone(t)
		};
		if (!er(n)) throw Error("Invalid financial snapshot; write blocked.");
		sr || lr(n), nr = n;
	},
	resetCacheForTests() {
		nr = void 0, rr = !1;
	}
};
_("financialCache", {
	repository: {},
	read: "accounting.read",
	commands: {},
	snapshot: () => j.read(),
	restore: (e) => {
		nr = e;
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/accountRepository.ts
var ur = /* @__PURE__ */ new Set(), M = "2026-10-08T00:00:00.000Z", dr = [
	{
		id: "acc_1000",
		code: "1000",
		name: "Operating Bank",
		type: "ASSET",
		systemRole: "BANK",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_1010",
		code: "1010",
		name: "Savings Bank",
		type: "ASSET",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_1100",
		code: "1100",
		name: "Accounts Receivable",
		type: "ASSET",
		systemRole: "ACCOUNTS_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_1200",
		code: "1200",
		name: "Inventory",
		type: "ASSET",
		systemRole: "INVENTORY",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_1300",
		code: "1300",
		name: "GST Receivable",
		type: "ASSET",
		systemRole: "GST_RECEIVABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_2000",
		code: "2000",
		name: "Accounts Payable",
		type: "LIABILITY",
		systemRole: "ACCOUNTS_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
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
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_2100",
		code: "2100",
		name: "GST Payable",
		type: "LIABILITY",
		systemRole: "GST_PAYABLE",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_3000",
		code: "3000",
		name: "Owner's Equity",
		type: "EQUITY",
		systemRole: "OWNERS_EQUITY",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_3100",
		code: "3100",
		name: "Retained Earnings",
		type: "EQUITY",
		systemRole: "RETAINED_EARNINGS",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_4000",
		code: "4000",
		name: "Sales Revenue",
		type: "REVENUE",
		systemRole: "SALES_REVENUE",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_5000",
		code: "5000",
		name: "Cost of Goods Sold",
		type: "EXPENSE",
		systemRole: "COST_OF_GOODS_SOLD",
		active: !0,
		allowManualPosting: !1,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_5100",
		code: "5100",
		name: "Purchases / Materials",
		type: "EXPENSE",
		systemRole: "PURCHASES",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
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
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_5200",
		code: "5200",
		name: "Freight",
		type: "EXPENSE",
		systemRole: "FREIGHT",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
	},
	{
		id: "acc_5300",
		code: "5300",
		name: "Operating Expenses",
		type: "EXPENSE",
		systemRole: "OPERATING_EXPENSE",
		active: !0,
		allowManualPosting: !0,
		createdAt: M,
		updatedAt: M
	}
];
function fr() {
	ur.forEach((e) => e());
}
function pr(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function mr(e) {
	return e?.trim() || void 0;
}
function hr(e) {
	if (!/^[A-Za-z0-9.-]+$/.test(e)) throw Error("Account code may only contain letters, numbers, dots and hyphens.");
}
function gr(e, t) {
	if (dr.find((n) => n.id !== t && n.code.toLowerCase() === e.toLowerCase())) throw Error(`Account code ${e} already exists.`);
}
function _r(e, t) {
	if (!e) return;
	let n = dr.find((n) => n.id !== t && (ue(e) ? n.id === ue(e) : n.systemRole === e));
	if (n) throw Error(`System role ${e} is already assigned to account ${n.code}.`);
}
function vr() {
	return `acc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
var N = {
	subscribe(e) {
		return ur.add(e), () => {
			ur.delete(e);
		};
	},
	getSnapshot() {
		return dr;
	},
	getAll() {
		return dr;
	},
	getById(e) {
		return dr.find((t) => t.id === e);
	},
	getByCode(e) {
		return dr.find((t) => t.code.toLowerCase() === e.trim().toLowerCase());
	},
	getBySystemRole(e) {
		return dr.find((t) => ue(e) ? t.id === ue(e) : t.systemRole === e);
	},
	requireById(e) {
		let t = dr.find((t) => t.id === e);
		if (!t) throw Error("Accounting account was not found.");
		return t;
	},
	requireBySystemRole(e) {
		let t = dr.find((t) => ue(e) ? t.id === ue(e) : t.systemRole === e);
		if (!t) throw Error(`Accounting account for system role ${e} was not found.`);
		return t;
	},
	create(e) {
		let t = pr(e.code, "Account code"), n = pr(e.name, "Account name");
		hr(t), gr(t), _r(e.systemRole);
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: vr(),
			code: t,
			name: n,
			type: e.type,
			systemRole: e.systemRole,
			description: mr(e.description),
			active: e.active,
			allowManualPosting: e.allowManualPosting,
			createdAt: r,
			updatedAt: r
		};
		return dr = [...dr, i].sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), fr(), i;
	},
	update(e, t) {
		let n = dr.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		let r = pr(t.code, "Account code"), i = pr(t.name, "Account name");
		if (hr(r), gr(r, e), (n.systemRole || ae(n.id)) && t.type !== n.type) throw Error("The account type of a system control account cannot be changed.");
		let a = {
			...n,
			code: r,
			name: i,
			type: t.type,
			description: mr(t.description),
			active: n.systemRole || ae(n.id) ? !0 : t.active,
			allowManualPosting: n.systemRole || ae(n.id) ? n.allowManualPosting : t.allowManualPosting,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return dr = dr.map((t) => t.id === e ? a : t).sort((e, t) => e.code.localeCompare(t.code, void 0, { numeric: !0 })), fr(), a;
	},
	setActive(e, t) {
		let n = dr.find((t) => t.id === e);
		if (!n) throw Error("Accounting account was not found.");
		if ((n.systemRole || ae(n.id)) && !t) throw Error("System control accounts cannot be deactivated.");
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return dr = dr.map((t) => t.id === e ? r : t), fr(), r;
	}
};
_("accounts", {
	repository: N,
	read: "accounting.read",
	commands: {
		if: null,
		create: "accounting.post",
		update: "accounting.post",
		setActive: "accounting.post"
	},
	snapshot: () => ({ accounts: dr }),
	restore: (e) => {
		dr = e.accounts;
	},
	publish: () => ur.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/journalEntryRepository.ts
var yr = /* @__PURE__ */ new Set(), br = j.read().journals;
j.onRollback(() => {
	br = j.read().journals;
});
function xr() {
	yr.forEach((e) => j.notify(e));
}
function Sr(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Cr(e) {
	return e?.trim() || void 0;
}
function wr(e, t) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error(`${t} must use YYYY-MM-DD format.`);
	let n = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(n.getTime()) || n.toISOString().slice(0, 10) !== e) throw Error(`${t} is invalid.`);
}
function Tr(e) {
	let t = `JE-${e.slice(0, 4)}-`, n = br.map((e) => e.journalNumber).filter((e) => e.startsWith(t)).map((e) => Number.parseInt(e.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Er(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function Dr(e) {
	if (wr(e.journalDate, "Journal date"), !e.description.trim()) throw Error("Journal description is required.");
	if (e.lines.length < 2) throw Error("A journal entry requires at least two lines.");
	let t = 0, n = 0;
	for (let r of e.lines) {
		let i = N.requireById(r.accountId);
		if (!i.active) throw Error(`Account ${i.code} ${i.name} is inactive.`);
		if (e.sourceType === "MANUAL_JOURNAL" && !i.allowManualPosting) throw Error(`Manual posting is not allowed for account ${i.code} ${i.name}.`);
		if (!Number.isFinite(r.debit) || !Number.isFinite(r.credit)) throw Error("Journal debit and credit values must be valid numbers.");
		let a = Sr(r.debit), o = Sr(r.credit);
		if (a < 0 || o < 0) throw Error("Journal debit and credit values cannot be negative.");
		if (a > 0 && o > 0) throw Error("A journal line cannot contain both a debit and a credit.");
		if (a === 0 && o === 0) throw Error("A journal line must contain either a debit or a credit.");
		t = Sr(t + a), n = Sr(n + o);
	}
	if (t <= 0 || n <= 0) throw Error("A journal entry must contain both debit and credit values.");
	if (t !== n) throw Error("Journal entry is not balanced.");
	return {
		totalDebit: t,
		totalCredit: n
	};
}
function Or(e) {
	return e.lines.map((e, t) => {
		let n = N.requireById(e.accountId);
		return {
			id: Er(`jl_${t + 1}`),
			accountId: n.id,
			accountCode: n.code,
			accountName: n.name,
			description: Cr(e.description),
			debit: Sr(e.debit),
			credit: Sr(e.credit)
		};
	});
}
function kr(e, t) {
	return br.find((n) => n.sourceType === e && n.sourceId === t && !n.reversedJournalEntryId);
}
var P = {
	subscribe(e) {
		return yr.add(e), () => {
			yr.delete(e);
		};
	},
	getSnapshot() {
		return br;
	},
	getAll() {
		return br;
	},
	getById(e) {
		return br.find((t) => t.id === e);
	},
	getBySource(e, t) {
		return br.filter((n) => n.sourceType === e && n.sourceId === t);
	},
	findSourceJournal: kr,
	post(e) {
		Jn(e.journalDate), Rn(e.journalDate, e.lines.map((e) => e.accountId));
		let t = Dr(e), n = Cr(e.sourceId);
		if (n) {
			let t = kr(e.sourceType, n);
			if (t) throw Error(`Journal ${t.journalNumber} already exists for this source transaction.`);
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Er("je"),
			journalNumber: Tr(e.journalDate),
			journalDate: e.journalDate,
			description: e.description.trim(),
			reference: Cr(e.reference),
			sourceType: e.sourceType,
			sourceId: n,
			status: "POSTED",
			lines: Or(e),
			totalDebit: t.totalDebit,
			totalCredit: t.totalCredit,
			createdAt: r,
			updatedAt: r,
			postedAt: r
		}, a = [i, ...br];
		return j.update("journals", a), br = a, xr(), i;
	},
	reverse(e) {
		Jn(e.reversalDate);
		let t = br.find((t) => t.id === e.journalEntryId);
		if (!t) throw Error("Journal entry was not found.");
		if (t.reversedJournalEntryId) throw Error("A reversal journal cannot be reversed.");
		if (t.status === "REVERSED" || t.reversalJournalEntryId) throw Error("Journal entry has already been reversed.");
		if (wr(e.reversalDate, "Reversal date"), e.reversalDate < t.journalDate) throw Error("Reversal date cannot be earlier than the original journal date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Reversal reason must contain at least 3 characters.");
		Rn(e.reversalDate, t.lines.map((e) => e.accountId));
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
		}, i = Dr(r), a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: Er("je"),
			journalNumber: Tr(e.reversalDate),
			journalDate: e.reversalDate,
			description: r.description,
			reference: r.reference,
			sourceType: t.sourceType,
			status: "POSTED",
			lines: Or(r),
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
		}, c = [o, ...br.map((e) => e.id === t.id ? s : e)];
		return j.update("journals", c), br = c, xr(), o;
	}
};
_("journals", {
	repository: P,
	read: "accounting.read",
	commands: {
		if: null,
		validateDate: null,
		for: null,
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ journalEntries: br }),
	restore: (e) => {
		br = e.journalEntries;
	},
	publish: () => yr.forEach((e) => e())
});
//#endregion
//#region src/features/job-costing/jobCostingService.ts
function Ar(e) {
	let t = Math.round(e * 100);
	if (!Number.isFinite(e) || !Number.isSafeInteger(t) || Math.abs(t / 100 - e) > 1e-7) throw Error("Amounts must be safe currency values with at most two decimals.");
	return t;
}
function jr(e, t) {
	return e.flatMap((n) => n.lines.flatMap((r, i) => {
		let a = t.find((e) => e.id === r.accountId);
		if (!a || !["REVENUE", "EXPENSE"].includes(a.type)) return [];
		let o = n, s = r;
		if (n.reversedJournalEntryId) {
			let t = e.find((e) => e.id === n.reversedJournalEntryId), a = t?.lines[i];
			if (!t || !a || a.accountId !== r.accountId || Ar(a.debit) !== Ar(r.credit) || Ar(a.credit) !== Ar(r.debit)) throw Error("Reversal line does not match its original source.");
			o = t, s = a;
		}
		let c = Ar(a.type === "REVENUE" ? r.credit - r.debit : r.debit - r.credit);
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
function Mr(e, t, n, r, i, a) {
	if (b(i, "From date"), b(a, "To date"), i > a) throw Error("From date must not follow to date.");
	let o = jr(e, t).filter((e) => e.date >= i && e.date <= a), s = o.flatMap((e) => {
		let t = r.find((t) => t.journalId === e.rootJournalId && t.lineId === e.rootLineId), i = e.amount < 0 ? -1 : 1, a = Ar(e.capacity), o = (t?.splits ?? []).map((t) => {
			let r = Ar(t.amount);
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
		for (let r of s.filter((t) => t.jobId === e)) r.kind === "REVENUE" ? t += Ar(r.allocated) : n += Ar(r.allocated);
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
			let t = c(e.id), n = Ar(Math.round(Number(e.budget) * 100) / 100), r = Ar(Math.round(Number(e.costBudget) * 100) / 100);
			return {
				id: e.id,
				name: e.name,
				code: e.code,
				status: e.status,
				...t,
				budget: n / 100,
				costBudget: r / 100,
				budgetProfit: (n - r) / 100,
				revenueVariance: (Ar(t.revenue) - n) / 100,
				costVariance: (r - Ar(t.cost)) / 100,
				profitVariance: (Ar(t.profit) - n + r) / 100
			};
		}),
		unallocated: c(""),
		ledger: {
			revenue: o.filter((e) => e.kind === "REVENUE").reduce((e, t) => e + Ar(t.amount), 0) / 100,
			cost: o.filter((e) => e.kind === "EXPENSE").reduce((e, t) => e + Ar(t.amount), 0) / 100
		}
	};
}
//#endregion
//#region src/features/job-costing/jobCostingRepository.ts
var Nr = t().trim().min(1).max(200), Pr = t().trim().min(1).max(2e3), Fr = t().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), Ir = u({
	jobId: Nr,
	amount: o().finite().positive().refine((e) => {
		try {
			return Ar(e), !0;
		} catch {
			return !1;
		}
	})
}).strict(), Lr = u({
	id: Nr,
	journalId: Nr,
	lineId: Nr,
	revision: o().int().positive(),
	splits: l(Ir).max(100),
	updatedAt: Fr,
	updatedBy: Nr
}).strict(), Rr = u({
	id: Nr,
	operationId: Nr,
	recordId: Nr,
	revision: o().int().positive(),
	at: Fr,
	actorId: Nr,
	reason: Pr,
	fingerprint: t().max(3e6),
	before: l(Ir),
	after: l(Ir)
}).strict(), zr = u({
	operationId: Nr,
	journalId: Nr,
	lineId: Nr,
	expectedRevision: o().int().nonnegative(),
	expectedSource: t().max(2e6),
	splits: l(Ir).max(100),
	reason: Pr
}).strict(), Br = [], Vr = [], Hr = /* @__PURE__ */ new Set(), Ur = () => Hr.forEach((e) => e());
function Wr(e, t, n) {
	if (new Set(e.map((e) => e.jobId)).size !== e.length) throw Error("Use one split per project.");
	if (e.some((e) => !n.some((t) => t.id === e.jobId))) throw Error("Project was not found.");
	if (e.reduce((e, t) => e + Ar(t.amount), 0) > Ar(t)) throw Error("Project splits exceed the source amount.");
}
_("jobCosting", {
	repository: {
		subscribe(e) {
			return Hr.add(e), () => {
				Hr.delete(e);
			};
		},
		getSnapshot: () => Br,
		review() {
			return S.require("accounting.read"), {
				lines: jr(P.getAll(), N.getAll()),
				allocations: structuredClone(Br),
				history: structuredClone(Vr)
			};
		},
		report(e) {
			S.require("accounting.read");
			let n = u({
				from: t(),
				to: t()
			}).strict().parse(e);
			return Mr(P.getAll(), N.getAll(), y.jobs, Br, n.from, n.to);
		},
		save(e) {
			let t = S.require("accounting.post"), n = zr.parse(e), r = JSON.stringify(n), i = Vr.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.fingerprint !== r) throw Error("Operation ID already has different allocation data.");
				return Br.find((e) => e.id === i.recordId);
			}
			let a = jr(P.getAll(), N.getAll()).find((e) => e.journalId === n.journalId && e.lineId === n.lineId);
			if (!a) throw Error("Select a posted revenue or expense line.");
			if (a.reversal) throw Error("Allocate the original line; reversal entries inherit its splits.");
			if (n.expectedSource !== a.signature) throw Error("Source journal changed. Refresh before allocating.");
			let o = Br.find((e) => e.journalId === a.journalId && e.lineId === a.lineId);
			if ((o?.revision ?? 0) !== n.expectedRevision) throw Error("Allocation changed. Refresh before saving.");
			Wr(n.splits, a.capacity, y.jobs);
			for (let e of n.splits) if (y.jobs.find((t) => t.id === e.jobId).status !== "Active" && o?.splits.find((t) => t.jobId === e.jobId)?.amount !== e.amount) throw Error("Only active projects can receive new or changed allocations.");
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
			return Br = [...Br.filter((e) => e.id !== c.id), c], Vr = [...Vr, {
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
			}], Ur(), c;
		}
	},
	read: "accounting.read",
	commands: {
		review: "accounting.read",
		report: "accounting.read",
		save: "accounting.post"
	},
	snapshot: () => ({
		allocations: Br,
		history: Vr
	}),
	restore: (e) => {
		Br = e.allocations, Vr = e.history;
	},
	publish: Ur,
	validate: (e, t) => {
		let n = u({
			allocations: l(Lr),
			history: l(Rr)
		}).strict().parse(e), r = t.workspace_jobs.records, i = jr(t.journals.journalEntries, t.accounts.accounts), a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
		for (let e of n.allocations) {
			let t = i.find((t) => t.journalId === e.journalId && t.lineId === e.lineId), o = e.journalId + ":" + e.lineId;
			if (!t || t.reversal || a.has(o)) throw Error("Invalid project source reference.");
			a.add(o), Wr(e.splits, t.capacity, r);
			let s = n.history.filter((t) => t.recordId === e.id);
			if (s.length !== e.revision) throw Error("Invalid allocation history length.");
			let c = [], l = "";
			for (let [n, i] of s.entries()) {
				let a = zr.parse(JSON.parse(i.fingerprint));
				if (i.revision !== n + 1 || i.at < l || JSON.stringify(i.before) !== JSON.stringify(c) || a.journalId !== e.journalId || a.lineId !== e.lineId || a.operationId !== i.operationId || a.expectedRevision !== n || a.reason !== i.reason || JSON.stringify(a.splits) !== JSON.stringify(i.after)) throw Error("Invalid allocation history chain.");
				Wr(i.after, t.capacity, r), c = i.after, l = i.at;
			}
			let u = s.at(-1);
			if (JSON.stringify(c) !== JSON.stringify(e.splits) || u.at !== e.updatedAt || u.actorId !== e.updatedBy) throw Error("Allocation outcome differs from audit history.");
		}
		for (let e of n.history) {
			if (o.has(e.operationId) || !n.allocations.some((t) => t.id === e.recordId)) throw Error("Invalid allocation operation reference.");
			o.add(e.operationId);
		}
	}
});
//#endregion
//#region src/features/contact-review/reviewRepository.ts
var Gr = t().trim().min(1).max(200), Kr = t().trim().max(2e3), qr = t().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}), Jr = u({
	operationId: Gr,
	kind: s(xt),
	customerId: t().max(200).default(""),
	values: wt,
	source: s(St).default("Manual"),
	externalId: t().trim().max(200).default(""),
	sourceReference: t().trim().max(500).default("")
}).strict(), Yr = u({
	id: Gr,
	action: Gr,
	actorId: Gr,
	at: qr,
	reason: Kr,
	data: t().max(2e6)
}).strict(), Xr = u({
	action: s([
		"Approve new",
		"Link existing",
		"Reject"
	]),
	actorId: Gr,
	at: qr,
	reason: Kr,
	fingerprint: t().max(1e4),
	customerId: t(),
	targetId: t(),
	snapshot: i()
}).strict(), Zr = Jr.extend({
	id: Gr,
	state: s([
		"Pending",
		"Approved",
		"Linked",
		"Rejected"
	]),
	revision: o().int().positive(),
	createdBy: Gr,
	createdAt: qr,
	updatedAt: qr,
	creationFingerprint: t().max(1e5),
	history: l(Yr).min(1),
	decision: Xr.optional()
}).strict(), Qr = [], $r = /* @__PURE__ */ new Set(), ei = () => $r.forEach((e) => e());
function ti() {
	let e = S.require("contacts.write");
	return S.require("sales.read"), e.userId;
}
var ni = () => (/* @__PURE__ */ new Date()).toISOString();
function ri(e) {
	let t = ni();
	if (t < e.updatedAt) throw Error("System clock precedes the last review update. Correct it before continuing.");
	return t;
}
var ii = (e, t, n, r = "", i = {}) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	reason: r,
	data: JSON.stringify(i)
});
function ai(e) {
	let t = Qr.find((t) => t.id === e);
	if (!t) throw Error("Review draft not found.");
	return t;
}
function oi(e, t) {
	if (e.revision !== t) throw Error("Review draft changed. Reload before continuing.");
}
function si(e) {
	return Qr = [...Qr.filter((t) => t.id !== e.id), e], ei(), e;
}
function ci(e) {
	let t = Jr.parse(e);
	if (t.values = Tt(t.kind, t.values), t.kind === "Customer" && t.customerId) throw Error("Customer drafts must not have a parent customer.");
	if (t.customerId && !E.getById(t.customerId)) throw Error("Parent customer was not found.");
	return t;
}
function li(e, t) {
	return e === "Customer" ? be.strict().parse(t) : e === "Branch" ? xe.strict().parse(t) : Se.strict().parse(t);
}
function ui(e, t, n) {
	let r = E.getById(e === "Customer" ? n : t);
	if (!r) throw Error("Choose an existing customer.");
	let i = e === "Customer" ? r : e === "Branch" ? r.locations.find((e) => e.id === n) : r.contacts.find((e) => e.id === n);
	if (!i) throw Error("The selected record does not belong to this customer or draft type.");
	return {
		customerId: r.id,
		targetId: i.id,
		snapshot: structuredClone(i)
	};
}
var di = {
	subscribe(e) {
		return $r.add(e), () => {
			$r.delete(e);
		};
	},
	getSnapshot: () => Qr,
	create(e) {
		let t = ti(), n = ci(e), { operationId: r, ...i } = n, a = JSON.stringify(i), o = Qr.find((e) => e.operationId === r) || n.externalId && Qr.find((e) => e.source === n.source && e.externalId === n.externalId);
		if (o) {
			if (o.creationFingerprint !== a) throw Error("Operation or external source ID already contains different draft data.");
			return o;
		}
		let s = ni();
		return si({
			...n,
			id: crypto.randomUUID(),
			state: "Pending",
			revision: 1,
			createdBy: t,
			createdAt: s,
			updatedAt: s,
			creationFingerprint: a,
			history: [ii("Received", t, s, "", i)]
		});
	},
	importBatch(e) {
		ti();
		let t = u({
			operationId: Gr.max(150),
			drafts: l(Jr.omit({ operationId: !0 })).min(1).max(100)
		}).strict().parse(e);
		if (t.drafts.some((e) => !e.externalId)) throw Error("Each imported draft requires a source external ID for safe retry.");
		return t.drafts.map((e, n) => di.create({
			...e,
			operationId: t.operationId + ":" + n
		}));
	},
	update(e) {
		let n = ti(), r = u({
			id: Gr,
			expectedRevision: o().int().positive(),
			customerId: t().max(200),
			values: wt
		}).strict().parse(e), i = ai(r.id);
		if (oi(i, r.expectedRevision), i.state !== "Pending") throw Error("Only pending drafts can be edited.");
		let a = ci({
			operationId: i.operationId,
			kind: i.kind,
			customerId: r.customerId,
			values: r.values,
			source: i.source,
			externalId: i.externalId,
			sourceReference: i.sourceReference
		}), s = ri(i);
		return si({
			...i,
			customerId: a.customerId,
			values: a.values,
			revision: i.revision + 1,
			updatedAt: s,
			history: [...i.history, ii("Updated", n, s, "", {
				customerId: a.customerId,
				values: a.values
			})]
		});
	},
	review(e) {
		S.require("sales.read");
		let t = ai(Gr.parse(e)), n = E.getAll(), r = "";
		try {
			if (li(t.kind, t.values), t.kind !== "Customer" && !n.some((e) => e.id === t.customerId)) throw Error("Select the parent customer.");
		} catch (e) {
			r = e.message;
		}
		return {
			revision: t.revision,
			duplicates: At(t, n),
			masterSignature: jt(n),
			validationError: r
		};
	},
	decide(e) {
		let n = ti(), i = u({
			id: Gr,
			expectedRevision: o().int().positive(),
			action: s([
				"Approve new",
				"Link existing",
				"Reject"
			]),
			reason: Kr,
			allowDuplicate: r().default(!1),
			targetId: t().max(200).default(""),
			expectedMaster: t().max(25e6).optional()
		}).strict().parse(e), a = ai(i.id), c = JSON.stringify({
			action: i.action,
			reason: i.reason,
			allowDuplicate: i.allowDuplicate,
			targetId: i.targetId
		});
		if (a.state !== "Pending") {
			if (a.decision?.fingerprint === c) return a;
			throw Error("This draft already has a different decision.");
		}
		oi(a, i.expectedRevision);
		let l = ri(a), d = {
			customerId: "",
			targetId: "",
			snapshot: null
		};
		if (i.action === "Reject") {
			if (!i.reason) throw Error("Explain why the draft is rejected.");
		} else {
			let e = E.getAll();
			if (i.expectedMaster !== jt(e)) throw Error("Customer records changed. Refresh duplicate review before deciding.");
			if (i.action === "Link existing") {
				if (!i.reason) throw Error("Explain why this existing record is the correct match.");
				d = ui(a.kind, a.customerId, i.targetId);
			} else {
				if (At(a, e).length && (!i.allowDuplicate || !i.reason)) throw Error("Possible duplicates exist. Link an existing record or explicitly confirm a separate new record with a reason.");
				let t = li(a.kind, a.values);
				if (a.kind === "Customer") {
					let e = E.create(t);
					d = {
						customerId: e.id,
						targetId: e.id,
						snapshot: structuredClone(e)
					};
				} else {
					let e = E.getById(a.customerId);
					if (!e || e.status === "INACTIVE") throw Error("Select an available parent customer.");
					let n = a.kind === "Branch" ? E.addLocation(e.id, t) : E.addContact(e.id, t);
					d = {
						customerId: e.id,
						targetId: n.id,
						snapshot: structuredClone(n)
					};
				}
			}
		}
		let f = {
			action: i.action,
			actorId: n,
			at: l,
			reason: i.reason,
			fingerprint: c,
			...d
		};
		return si({
			...a,
			state: i.action === "Reject" ? "Rejected" : i.action === "Link existing" ? "Linked" : "Approved",
			revision: a.revision + 1,
			updatedAt: l,
			decision: f,
			history: [...a.history, ii(i.action, n, l, i.reason, f)]
		});
	},
	reopen(e) {
		let t = ti(), n = u({
			id: Gr,
			expectedRevision: o().int().positive(),
			reason: Kr.refine(Boolean, "Explain why this draft is reopened.")
		}).strict().parse(e), r = ai(n.id);
		if (oi(r, n.expectedRevision), r.state !== "Rejected") throw Error("Only rejected drafts may be reopened.");
		let i = ri(r), a = {
			...r,
			state: "Pending",
			revision: r.revision + 1,
			updatedAt: i,
			history: [...r.history, ii("Reopened", t, i, n.reason)]
		};
		return delete a.decision, si(a);
	}
};
_("contactReviews", {
	repository: di,
	read: "sales.read",
	commands: {
		create: "contacts.write",
		update: "contacts.write",
		importBatch: "contacts.write",
		review: "sales.read",
		decide: "contacts.write",
		reopen: "contacts.write"
	},
	snapshot: () => ({ drafts: Qr }),
	restore: (e) => {
		Qr = e.drafts;
	},
	publish: ei,
	validate: (e, n) => {
		let i = u({ drafts: l(Zr) }).strict().parse(e), a = n.customers.customers, o = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set();
		for (let e of i.drafts) {
			let n = Tt(e.kind, e.values);
			if (Object.keys(n).length !== Object.keys(e.values).length) throw Error("Missing review draft fields.");
			if (o.has(e.operationId) || e.externalId && c.has(e.source + ":" + e.externalId)) throw Error("Duplicate review intake identity.");
			o.add(e.operationId), e.externalId && c.add(e.source + ":" + e.externalId);
			let i = JSON.parse(e.creationFingerprint);
			if (e.history[0].data !== e.creationFingerprint) throw Error("Review source history is inconsistent.");
			if (i.kind !== e.kind || i.source !== e.source || i.externalId !== e.externalId || i.sourceReference !== e.sourceReference) throw Error("Review intake provenance is inconsistent.");
			if (e.history.length !== e.revision || new Set(e.history.map((e) => e.id)).size !== e.history.length || e.history[0].action !== "Received" || e.history[0].actorId !== e.createdBy || e.history[0].at !== e.createdAt || e.updatedAt < e.createdAt) throw Error("Invalid review history.");
			let l = "Pending", d = e.createdAt;
			for (let [t, n] of e.history.entries()) {
				if (n.at < d || n.at > e.updatedAt) throw Error("Invalid review event time.");
				d = n.at;
				let r = JSON.parse(n.data);
				if (!r || typeof r != "object" || Array.isArray(r)) throw Error("Invalid review event payload.");
				if (t !== 0) {
					if (n.action === "Updated") {
						if (l !== "Pending") throw Error("Invalid review edit history.");
					} else if (n.action === "Reopened") {
						if (l !== "Rejected" || !n.reason) throw Error("Invalid review reopen history.");
						l = "Pending";
					} else if ([
						"Approve new",
						"Link existing",
						"Reject"
					].includes(n.action)) {
						if (l !== "Pending") throw Error("Invalid repeated review decision.");
						l = n.action === "Reject" ? "Rejected" : n.action === "Link existing" ? "Linked" : "Approved";
					} else throw Error("Unknown review history action.");
				}
			}
			if (l !== e.state || e.history.at(-1).at !== e.updatedAt) throw Error("Review history does not match current state.");
			if (e.kind === "Customer" && e.customerId || e.customerId && !a.some((t) => t.id === e.customerId)) throw Error("Review parent customer is invalid.");
			if (e.state === "Pending" != !e.decision) throw Error("Review state and decision are inconsistent.");
			if (e.decision) {
				let n = e.state === "Rejected" ? "Reject" : e.state === "Linked" ? "Link existing" : "Approve new", i = u({
					action: s([
						"Approve new",
						"Link existing",
						"Reject"
					]),
					reason: Kr,
					allowDuplicate: r(),
					targetId: t()
				}).strict().parse(JSON.parse(e.decision.fingerprint)), o = e.history.at(-1);
				if (i.action !== n || i.reason !== e.decision.reason || i.targetId !== (n === "Link existing" ? e.decision.targetId : "") || o.actorId !== e.decision.actorId || o.at !== e.decision.at || o.reason !== e.decision.reason || JSON.stringify(JSON.parse(o.data)) !== JSON.stringify(e.decision)) throw Error("Review decision audit is inconsistent.");
				if (e.decision.action !== n) throw Error("Invalid review decision.");
				if (n !== "Reject") {
					let t = a.find((t) => t.id === e.decision.customerId), r = e.kind === "Customer" ? t : e.kind === "Branch" ? t?.locations.find((t) => t.id === e.decision.targetId) : t?.contacts.find((t) => t.id === e.decision.targetId);
					if (!r || r.id !== e.decision.targetId || e.kind !== "Customer" && t.id !== e.customerId || e.decision.snapshot?.id !== r.id) throw Error("Invalid resolved review reference.");
					n === "Approve new" && li(e.kind, e.values);
				} else if (!e.decision.reason || e.decision.customerId || e.decision.targetId) throw Error("Invalid rejection.");
			}
		}
	}
});
//#endregion
//#region src/features/banking/data/bankAccountRepository.ts
var fi = "htt.mock.banking.accounts.v1";
function pi(e) {
	return Array.isArray(e) && e.every((e) => typeof e == "object" && !!e && typeof e.id == "string" && typeof e.name == "string" && typeof e.bankName == "string" && typeof e.accountNumber == "string" && [
		"TRANSACTION",
		"SAVINGS",
		"CREDIT_CARD",
		"OTHER"
	].includes(e.accountType) && typeof e.currency == "string" && typeof e.glAccountId == "string" && typeof e.openingBalance == "number" && Number.isFinite(e.openingBalance) && typeof e.openingBalanceDate == "string" && typeof e.active == "boolean" && typeof e.createdAt == "string" && typeof e.updatedAt == "string") && new Set(e.map((e) => e.id)).size === e.length;
}
var mi = /* @__PURE__ */ new Set(), hi = "2026-10-08T00:00:00.000Z", gi = [{
	id: "bank_001",
	name: "Operating Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1000",
	accountType: "TRANSACTION",
	currency: h().currency,
	glAccountId: "acc_1000",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: hi,
	updatedAt: hi
}, {
	id: "bank_002",
	name: "Savings Account",
	bankName: "Business Bank",
	accountNumber: "•••• 1010",
	accountType: "SAVINGS",
	currency: h().currency,
	glAccountId: "acc_1010",
	openingBalance: 0,
	openingBalanceDate: "2026-01-01",
	active: !0,
	createdAt: hi,
	updatedAt: hi
}], _i = we(fi, pi);
_i.status === "ok" && _i.data.every((e) => {
	let t = N.getById(e.glAccountId);
	return t?.type === "ASSET" && t.active;
}) && (gi = _i.data);
function vi() {
	mi.forEach((e) => e());
}
function yi(e) {
	let t = N.getById(e.glAccountId);
	if (!t) throw Error(`GL account ${e.glAccountId} for bank account ${e.name} was not found.`);
	if (t.type !== "ASSET") throw Error(`Bank account ${e.name} must be linked to an Asset GL account.`);
	if (!t.active) throw Error(`GL account ${t.code} linked to bank account ${e.name} is inactive.`);
}
for (let e of gi) yi(e);
var bi = {
	subscribe(e) {
		return mi.add(e), () => {
			mi.delete(e);
		};
	},
	getSnapshot() {
		return gi;
	},
	getAll() {
		return gi;
	},
	getById(e) {
		return gi.find((t) => t.id === e);
	},
	getByGlAccountId(e) {
		return gi.find((t) => t.glAccountId === e);
	},
	requireById(e) {
		let t = gi.find((t) => t.id === e);
		if (!t) throw Error("Bank account was not found.");
		return t;
	},
	save(e, n) {
		let i = u({
			id: t().optional(),
			name: t().trim().min(1).max(180),
			bankName: t().trim().min(1).max(180),
			accountNumber: t().trim().min(1).max(100),
			accountType: s([
				"TRANSACTION",
				"SAVINGS",
				"CREDIT_CARD",
				"OTHER"
			]),
			currency: s(["AUD", "NZD"]),
			glAccountId: t().min(1),
			openingBalanceDate: t(),
			active: r()
		}).strict().parse(e);
		if (b(i.openingBalanceDate, "Opening date"), gi[0] && i.currency !== gi[0].currency) throw Error("This profile uses one base currency; foreign-currency bank accounts are not supported.");
		let a = gi.find((e) => e.id === i.id);
		if (a && a.updatedAt !== n) throw Error("Bank account changed; reload before editing.");
		if (!a && i.id) throw Error("Bank account was not found.");
		if (gi.some((e) => e.id !== a?.id && e.glAccountId === i.glAccountId)) throw Error("Each bank account needs its own GL account.");
		let o = N.requireById(i.glAccountId);
		if (!o.active || o.type !== "ASSET" || o.systemRole && o.systemRole !== "BANK") throw Error("Choose an active bank Asset account.");
		if (a && P.getAll().some((e) => e.lines.some((e) => e.accountId === a.glAccountId)) && (a.glAccountId !== i.glAccountId || a.openingBalanceDate !== i.openingBalanceDate || a.currency !== i.currency)) throw Error("A used bank account cannot change its ledger, currency or opening date.");
		let c = new Date(Math.max(Date.now(), a ? Date.parse(a.updatedAt) + 1 : 0)).toISOString(), l = {
			...i,
			id: a?.id ?? crypto.randomUUID(),
			openingBalance: a?.openingBalance ?? 0,
			createdAt: a?.createdAt ?? c,
			updatedAt: c
		};
		return yi(l), gi = [...gi.filter((e) => e.id !== l.id), l], vi(), l;
	},
	setActive(e, t) {
		let n = this.requireById(e);
		if (n.active === t) return n;
		let r = {
			...n,
			active: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return gi = gi.map((t) => t.id === e ? r : t), Ee(fi) && Te(fi, gi), vi(), r;
	}
};
_("bankAccounts", {
	repository: bi,
	read: "banking.read",
	commands: {
		if: null,
		validateBankAccount: null,
		setActive: "banking.write",
		save: "banking.write"
	},
	snapshot: () => ({ bankAccounts: gi }),
	restore: (e) => {
		gi = e.bankAccounts;
	},
	publish: () => mi.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/areaPacks.ts
function xi(e, t) {
	let n = D(e), r = n?.units.find((e) => e.id === t), i = n?.units.find((e) => e.id === n.baseUnitId);
	return n?.status === "ACTIVE" && n.itemType !== "SERVICE" && r?.active && i?.code === "M2" && ["BOX", "ROLL"].includes(r.code) && Number.isFinite(r.conversionToBase) && r.conversionToBase > 0 ? r.conversionToBase : void 0;
}
function Si(e, t, n, r) {
	if (r === void 0) return { quantity: n };
	let i = xi(e, t);
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
function Ci(e) {
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
function wi(e, t) {
	let n = E.getById(e);
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
function Ti(e) {
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
function Ei(e, t, n, r) {
	let i = D(e), a = st(e, t);
	if (!i || i.status !== "ACTIVE" || !a?.active) throw Error("Select an active product and unit.");
	if (r === "buy" && !tt(i)) throw Error("Non-stock/service items use expense bills, not inventory purchase orders.");
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
var Di = "htt:financial-operations:v1", Oi = [
	"CUSTOMER_PAYMENT",
	"PAYMENT_REVERSAL",
	"BANK_TRANSACTION",
	"BANK_TRANSFER",
	"BANK_RECONCILIATION",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
], ki = [
	"PENDING",
	"COMPLETED",
	"MANUAL_REVIEW"
], Ai = (e) => Array.isArray(e) && e.every((e) => {
	if (!e || typeof e != "object") return !1;
	let t = e;
	return typeof t.operationId == "string" && t.operationId.length > 0 && Oi.includes(String(t.kind)) && typeof t.fingerprint == "string" && t.fingerprint.length > 0 && ki.includes(String(t.state)) && typeof t.createdAt == "string" && typeof t.updatedAt == "string" && (t.resultId === void 0 || typeof t.resultId == "string") && (t.note === void 0 || typeof t.note == "string") && (t.reviewHistory === void 0 || Array.isArray(t.reviewHistory) && t.reviewHistory.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		return typeof t.reference == "string" && t.reference.length >= 3 && typeof t.operator == "string" && t.operator.length >= 2 && typeof t.recordedAt == "string" && typeof t.summary == "string" && t.summary.length >= 3;
	}));
}) && new Set(e.map((e) => e.operationId)).size === e.length;
function ji() {
	let e = we(Di, Ai);
	if (e.status === "ok") return e.data;
	if (e.status === "empty") return [];
	throw Error(`Financial operation journal is ${e.status}; writes are blocked to protect financial data.`);
}
function Mi(e) {
	if (!Ee(Di) || !Te(Di, e)) throw Error("Financial operation journal could not be saved; business writes must not proceed.");
}
var F = {
	list() {
		return ji().map((e) => ({ ...e }));
	},
	begin(e, t, n) {
		if (!e.trim() || !n.trim() || !Oi.includes(t)) throw Error("Invalid operation identity.");
		let r = ji(), i = r.find((t) => t.operationId === e);
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
		return Mi([...r, o]), {
			status: "started",
			operation: { ...o }
		};
	},
	bindResult(e, t) {
		if (!t.trim()) throw Error("Result ID is required.");
		let n = ji(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.resultId && r.resultId !== t) throw Error("Operation result ID cannot be changed.");
		if (r.state !== "PENDING") throw Error("Only pending operations can bind a result ID.");
		if (r.resultId === t) return { ...r };
		let i = {
			...r,
			resultId: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Mi(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	complete(e, t) {
		if (!t.trim()) throw Error("Verified business result ID is required.");
		let n = ji(), r = n.find((t) => t.operationId === e);
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
		return Mi(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	flagForReview(e, t) {
		if (!t.trim()) throw Error("Review reason is required.");
		let n = ji(), r = n.find((t) => t.operationId === e);
		if (!r) throw Error("Operation not found.");
		if (r.state === "COMPLETED") throw Error("Completed operation cannot be downgraded.");
		let i = {
			...r,
			state: "MANUAL_REVIEW",
			note: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Mi(n.map((t) => t.operationId === e ? i : t)), { ...i };
	},
	recordManualReview(e, t, n, r) {
		if (t.trim().length < 3 || n.trim().length < 2 || r.trim().length < 3) throw Error("Recovery reference, operator and reconciliation summary are required.");
		let i = ji(), a = i.find((t) => t.operationId === e);
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
		return Mi(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	closeReviewed(e, t, n, r) {
		if (n.trim().length < 3 || r.trim().length < 2 || !t.trim()) throw Error("A distinct approval reference, approver and verified result are required.");
		let i = ji(), a = i.find((t) => t.operationId === e);
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
		return Mi(i.map((t) => t.operationId === e ? s : t)), {
			...s,
			reviewHistory: s.reviewHistory?.map((e) => ({ ...e }))
		};
	},
	getUnresolved() {
		return ji().filter((e) => e.state !== "COMPLETED").map((e) => ({ ...e }));
	}
};
_("financialOperations", {
	repository: F,
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
var Ni = /* @__PURE__ */ new Map(), Pi = "htt.purchasePosting.operations.v1";
function Fi() {
	try {
		return typeof localStorage > "u" ? null : localStorage;
	} catch {
		return null;
	}
}
function Ii() {
	let e = Fi();
	if (e) try {
		e.setItem(Pi, JSON.stringify([...Ni.values()]));
	} catch {}
}
function Li() {
	let e = Fi();
	if (e) try {
		let t = JSON.parse(e.getItem(Pi) ?? "[]");
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
			Ni.set(t.key, {
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
Li();
var Ri = /* @__PURE__ */ new Set(), zi = /* @__PURE__ */ new Map(), Bi = /* @__PURE__ */ new Map(), Vi;
function Hi() {
	Ii(), Ri.forEach((e) => e());
}
var I = {
	injectFailureBeforeStep(e, t, n = 1) {
		Bi.set(`${e}|${t}`, n);
	},
	clearInjectedFailures() {
		Bi.clear();
	},
	registerRecovery(e, t) {
		if (!Ni.has(e)) throw Error(`Unknown posting operation: ${e}`);
		zi.set(e, t);
	},
	runStep(e, t, n) {
		let r = Ni.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		if (r.completedSteps.includes(t)) return;
		let i = `${e}|${t}`, a = Bi.get(i) ?? 0;
		if (a > 0) throw Bi.set(i, a - 1), Error(`Injected failure before ${t}`);
		try {
			n();
		} catch (t) {
			throw this.setStatus(e, "FAILED", String(t)), t;
		}
		this.completeStep(e, t);
	},
	hasRecoveryHandler(e) {
		return zi.has(e);
	},
	recover(e) {
		let t = Ni.get(e);
		if (!t) throw Error(`Unknown posting operation: ${e}`);
		if (t.status === "POSTED") return this.get(e);
		if (t.status === "FAILED") throw Error(`Unsafe to replay ${e}: repository step failed during execution; manual reconciliation required.`);
		let n = zi.get(e);
		if (!n) throw Error(`No process-local recovery handler for ${e}`);
		if (Vi === e || t.status === "POSTING") throw Error(`Posting operation is already running: ${e}`);
		Vi = e, this.setStatus(e, "POSTING");
		try {
			n(), this.setStatus(e, "POSTED");
		} catch (t) {
			throw this.get(e)?.status !== "FAILED" && this.setStatus(e, "RECOVERY_REQUIRED", String(t)), t;
		} finally {
			Vi = void 0;
		}
		return this.get(e);
	},
	get(e) {
		let t = Ni.get(e);
		return t ? {
			...t,
			completedSteps: [...t.completedSteps]
		} : void 0;
	},
	getAll() {
		return [...Ni.values()].map((e) => ({
			...e,
			completedSteps: [...e.completedSteps]
		}));
	},
	subscribe(e) {
		return Ri.add(e), () => {
			Ri.delete(e);
		};
	},
	begin(e, t) {
		let n = `${e}:${t}`;
		if (Ni.has(n)) throw Error(`Posting operation already exists: ${n}`);
		let r = {
			key: n,
			kind: e,
			sourceId: t,
			status: "PENDING",
			completedSteps: [],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return Ni.set(n, r), Hi(), this.get(n);
	},
	setStatus(e, t, n) {
		let r = Ni.get(e);
		if (!r) throw Error(`Unknown posting operation: ${e}`);
		Ni.set(e, {
			...r,
			status: t,
			error: n,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), Hi();
	},
	completeStep(e, t) {
		let n = Ni.get(e);
		if (!n) throw Error(`Unknown posting operation: ${e}`);
		n.completedSteps.includes(t) || (Ni.set(e, {
			...n,
			completedSteps: [...n.completedSteps, t],
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}), Hi());
	}
};
_("purchaseOperations", {
	repository: I,
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
	snapshot: () => I.getAll(),
	restore: (e) => {
		Ni.clear(), zi.clear();
		for (let t of e) Ni.set(t.key, t);
	},
	publish: () => Ri.forEach((e) => e())
});
//#endregion
//#region src/features/integration/crossModuleWriteGate.ts
var Ui = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Wi(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (!t.operationId || n.has(t.operationId) || t.state !== "COMPLETED") throw Error(`Cross-module financial writes blocked: ${Ui.has(t.kind) ? "Sales" : "Financial"} operation ${t.operationId || "(missing ID)"} requires reconciliation.`);
		n.add(t.operationId);
	}
	let r = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (!e.key || r.has(e.key) || e.status !== "POSTED" || (e.error?.startsWith("Restored after restart:") ?? !1)) throw Error(`Cross-module financial writes blocked: purchase operation ${e.key || "(missing key)"} requires reconciliation.`);
		r.add(e.key);
	}
}
function L() {
	Wi(F.list(), I.getAll());
}
//#endregion
//#region src/features/sales/data/quoteStorage.ts
var Gi = "htt.mock.sales.quotes.v1", Ki = /* @__PURE__ */ new Set([
	"DRAFT",
	"SENT",
	"ACCEPTED",
	"DECLINED",
	"EXPIRED",
	"CONVERTED"
]);
function qi(e) {
	return Array.isArray(e) && e.every((e) => {
		if (!e || typeof e != "object") return !1;
		let t = e;
		if (t.type !== "QUOTE" || !Ki.has(String(t.status)) || ![
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
function Ji() {
	return we(Gi, qi);
}
function Yi(e) {
	if (Ji().status === "invalid" || !Ee("htt.mock.sales.quotes.v1")) throw Error("Quote storage is unavailable or invalid; changes were not applied.");
	if (!Te("htt.mock.sales.quotes.v1", e)) throw Error("Failed to persist quotes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesOrderStorage.ts
var Xi = "htt.mock.sales.quote-orders.v1";
function Zi(e) {
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
function Qi(e) {
	if (!e || typeof e != "object") return !1;
	let t = e;
	if (!qi(t.quotes) || !Zi(t.salesOrders)) return !1;
	let n = t.salesOrders, r = t.quotes, i = /* @__PURE__ */ new Set();
	for (let e of n) {
		if (i.has(e.id)) return !1;
		i.add(e.id);
	}
	return r.every((e) => e.status !== "CONVERTED" || typeof e.convertedSalesOrderId == "string" && n.some((t) => t.id === e.convertedSalesOrderId && t.sourceQuoteId === e.id));
}
function $i() {
	return we(Xi, Qi);
}
function ea(e) {
	if (!Qi(e)) throw Error("Quote/order relationship is invalid; changes were not applied.");
	let t = $i(), n = Ji();
	if (t.status === "invalid" || t.status === "unavailable" || n.status === "invalid" || n.status === "unavailable" || !Ee("htt.mock.sales.quote-orders.v1")) throw Error("Quote/order storage is unavailable or invalid; changes were not applied.");
	if (!Te("htt.mock.sales.quote-orders.v1", e)) throw Error("Failed to persist quote/order state; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/invoiceStorage.ts
var ta = "htt.mock.sales.documents.v1";
function na(e) {
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
function ra(e) {
	if (!e || typeof e != "object") return !1;
	let t = e, n = t.invoices;
	if (!Qi(t) || !na(n)) return !1;
	let r = t.salesOrders, i = n, a = /* @__PURE__ */ new Set();
	for (let e of i) if (a.has(e.id) || (a.add(e.id), e.sourceSalesOrderId && !r.some((t) => t.id === e.sourceSalesOrderId && t.invoiceIds.includes(e.id)))) return !1;
	return r.every((e) => e.invoiceIds.every((t) => i.some((n) => n.id === t && n.sourceSalesOrderId === e.id)));
}
function ia() {
	return we(ta, ra);
}
function aa(e) {
	if (!ra(e)) throw Error("Sales document relationships are invalid; changes were not applied.");
	let t = ia();
	if (t.status === "invalid" || t.status === "unavailable" || !Ee("htt.mock.sales.documents.v1")) throw Error("Sales document storage is unavailable or invalid; changes were not applied.");
	if (!Te("htt.mock.sales.documents.v1", e)) throw Error("Failed to persist sales documents; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/salesWriteSafetyGate.ts
var oa = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function sa(e) {
	let t = e.filter((e) => oa.has(e.kind)), n = /* @__PURE__ */ new Set();
	for (let e of t) {
		if (n.has(e.operationId)) throw Error("Sales financial writes blocked: duplicate operation intent ID; manual review required.");
		if (n.add(e.operationId), e.state !== "COMPLETED") throw Error(`Sales financial writes blocked: ${e.kind} ${e.operationId} is ${e.state}; manual review required.`);
	}
}
function ca() {
	sa(F.list());
}
//#endregion
//#region src/features/sales/data/mockSalesDocuments.ts
var la = [{
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
}], ua = [{
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
}], da = [{
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
}], fa = "htt.mock.sales.credit-notes.v1", pa = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0, ma = (e) => typeof e == "string" && e.length > 0;
function ha(e) {
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
		].every((e) => ma(t[e])) || ![
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
		].every((e) => pa(i[e])) || !pa(t.amountApplied) || !pa(t.amountAvailable) || r.has(t.id)) return !1;
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
		].every((e) => ma(t[e])) || !["APPLIED", "REVERSED"].includes(String(t.status)) || !pa(t.amount) || t.amount === 0 || i.has(t.id)) return !1;
		i.add(t.id);
		let r = n.find((e) => e.id === t.creditNoteId);
		if (!r || r.customerId !== t.customerId) return !1;
		a.push(t);
	}
	return n.every((e) => {
		let t = a.filter((t) => t.creditNoteId === e.id && t.status === "APPLIED").reduce((e, t) => e + t.amount, 0);
		if (Math.abs(t - e.amountApplied) > .011) return !1;
		let n = e.refundEvents ?? [];
		if (!Array.isArray(n) || n.some((e) => !e || !ma(e.id) || !ma(e.date) || !pa(e.amount) || e.amount <= 0 || e.reversalDate !== void 0 && !ma(e.reversalDate)) || new Set(n.map((e) => e.id)).size !== n.length) return !1;
		let r = n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0);
		return !pa(e.amountRefunded ?? 0) || Math.abs(r - (e.amountRefunded ?? 0)) > .011 || t + r > e.totals.total + .011 ? !1 : e.status === "VOID" ? t === 0 && r === 0 && e.amountAvailable === 0 : Math.abs(e.amountAvailable - (e.totals.total - t - r)) > .011 ? !1 : e.status !== "FULLY_APPLIED" || e.amountAvailable < .011;
	});
}
function ga() {
	return we(fa, ha);
}
function _a(e) {
	if (!ha(e)) throw Error("Credit note/allocation relationships are invalid; changes were not applied.");
	let t = ga();
	if (t.status === "invalid" || t.status === "unavailable" || !Ee("htt.mock.sales.credit-notes.v1")) throw Error("Credit note storage is unavailable or invalid; changes were not applied.");
	if (!Te("htt.mock.sales.credit-notes.v1", e)) throw Error("Failed to persist credit notes; changes were not applied.");
}
//#endregion
//#region src/features/sales/data/creditNoteRepository.ts
var va = /* @__PURE__ */ new Set(), ya = ga(), ba = ya.status === "ok" ? structuredClone(ya.data.creditNotes) : [], xa = ya.status === "ok" ? structuredClone(ya.data.allocations) : [], Sa = [...ba], Ca = [...xa];
function wa() {
	Sa = [...ba], Ca = [...xa], va.forEach((e) => e());
}
function Ta(e, t) {
	_a({
		creditNotes: e,
		allocations: t
	}), ba = e, xa = t, wa();
}
var R = {
	subscribe(e) {
		return va.add(e), () => {
			va.delete(e);
		};
	},
	getSnapshot() {
		return Sa;
	},
	getAllocationSnapshot() {
		return Ca;
	},
	getAll() {
		return Sa;
	},
	getAllAllocations() {
		return Ca;
	},
	getById(e) {
		return ba.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return ba.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return ba.filter((t) => t.sourceInvoiceId === e);
	},
	getAllocationsByInvoice(e) {
		return xa.filter((t) => t.invoiceId === e);
	},
	getAllocationsByCreditNote(e) {
		return xa.filter((t) => t.creditNoteId === e);
	},
	create(e) {
		if (ba.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} already exists`);
		return Ta([e, ...ba], xa), e;
	},
	update(e) {
		if (!ba.some((t) => t.id === e.id)) throw Error(`Credit note ${e.id} was not found`);
		return Ta(ba.map((t) => t.id === e.id ? e : t), xa), e;
	},
	createAllocation(e) {
		if (xa.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} already exists`);
		return Ta(ba, [e, ...xa]), e;
	},
	updateAllocation(e) {
		if (!xa.some((t) => t.id === e.id)) throw Error(`Credit allocation ${e.id} was not found`);
		return Ta(ba, xa.map((t) => t.id === e.id ? e : t)), e;
	},
	commitAllocationAndCredit(e, t) {
		if (!ba.some((e) => e.id === t.id) || e.creditNoteId !== t.id) throw Error("Credit note/allocation relationship is invalid");
		let n = xa.some((t) => t.id === e.id) ? xa.map((t) => t.id === e.id ? e : t) : [e, ...xa];
		Ta(ba.map((e) => e.id === t.id ? t : e), n);
	},
	getAllocationById(e) {
		return xa.find((t) => t.id === e);
	}
};
_("customerCredits", {
	repository: R,
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
			Ti(n.recipient);
			for (let e of n.lines) Ci(e), rt(e, t.products.products.find((t) => t.id === e.productId));
		}
	},
	snapshot: () => ({
		creditNotes: ba,
		allocations: xa
	}),
	restore: (e) => {
		ba = e.creditNotes, xa = e.allocations, Sa = [...ba], Ca = [...xa];
	},
	publish: () => va.forEach((e) => e())
});
//#endregion
//#region src/features/contacts/data/customerPricingStorage.ts
var Ea = "htt.mock.contacts.customerPricing.v1";
function Da(e) {
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
function Oa() {
	return we(Ea, Da);
}
function ka(e) {
	if (Oa().status === "invalid" || !Ee("htt.mock.contacts.customerPricing.v1")) throw Error("Customer pricing storage is unavailable or invalid; changes were not saved.");
	if (!Te("htt.mock.contacts.customerPricing.v1", e)) throw Error("Failed to persist customer pricing; changes were not applied.");
}
//#endregion
//#region src/features/contacts/data/mockCustomerPrices.ts
var Aa = [
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
], ja = /* @__PURE__ */ new Set(), Ma = Oa(), Na = Ma.status === "ok" ? Ma.data : structuredClone(Aa);
function Pa() {
	ja.forEach((e) => {
		e();
	});
}
function Fa(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Ia(e) {
	return e.trim() || void 0;
}
function La(e, t) {
	let n = D(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = n.units.find((e) => e.id === t);
	if (!r) throw Error(`Unit ${t} does not belong to product ${e}`);
	if (!r.active) throw Error("The selected product unit is inactive");
	return {
		product: n,
		unit: r
	};
}
function Ra(e, t, n, r) {
	return e <= (r ?? "9999-12-31") && n <= (t ?? "9999-12-31");
}
function za({ customerId: e, productId: t, unitId: n, effectiveFrom: r, effectiveTo: i, ignorePriceId: a }) {
	let o = Na.find((o) => o.id === a || !o.active || o.customerId !== e || o.productId !== t || o.unitId !== n ? !1 : Ra(r, i, o.effectiveFrom, o.effectiveTo));
	if (o) {
		let e = Wa(o.effectiveFrom, o.effectiveTo);
		throw Error(`This pricing period overlaps an existing active customer price (${e}).`);
	}
}
function Ba(e) {
	return e.pricingMethod === "FIXED_PRICE" ? {
		fixedPrice: e.fixedPrice,
		discountPercent: void 0
	} : {
		fixedPrice: void 0,
		discountPercent: e.discountPercent
	};
}
function Va(e) {
	let t = st(e.productId, e.unitId);
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
var Ha = {
	subscribe(e) {
		return ja.add(e), () => {
			ja.delete(e);
		};
	},
	getSnapshot() {
		return Na;
	},
	getAll() {
		return Na;
	},
	getById(e) {
		return Na.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Na.filter((t) => t.customerId === e);
	},
	create(e, t) {
		La(t.productId, t.unitId);
		let n = Ia(t.effectiveTo);
		t.active && za({
			customerId: e,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: n
		});
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = Ba(t), a = {
			id: Fa("cprice"),
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
		}, o = [a, ...Na];
		return ka(o), Na = o, Pa(), a;
	},
	update(e, t) {
		let n = Ha.getById(e);
		if (!n) throw Error(`Customer price ${e} was not found`);
		La(t.productId, t.unitId);
		let r = Ia(t.effectiveTo);
		t.active && za({
			customerId: n.customerId,
			productId: t.productId,
			unitId: t.unitId,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			ignorePriceId: e
		});
		let i = Ba(t), a = {
			...n,
			productId: t.productId,
			unitId: t.unitId,
			pricingMethod: t.pricingMethod,
			...i,
			effectiveFrom: t.effectiveFrom,
			effectiveTo: r,
			active: t.active,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		}, o = Na.map((t) => t.id === e ? a : t);
		return ka(o), Na = o, Pa(), a;
	},
	resolve(e) {
		return Va(e);
	},
	resolvePrice(e, t, n, r) {
		let i = Ha.resolveBasePrice(e, t, n, r.slice(0, 10)), a = ee({
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
		let { unit: i } = La(t, n), a = Na.find((i) => i.customerId === e && i.productId === t && i.unitId === n && i.active && Ua(r, i.effectiveFrom, i.effectiveTo));
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
		let o = Va(a);
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
function Ua(e, t, n) {
	return !(e < t || n && e > n);
}
function Wa(e, t) {
	return t ? `${e} to ${t}` : `${e} onwards`;
}
_("customerPrices", {
	repository: Ha,
	read: "sales.read",
	commands: {
		if: null,
		return: null,
		create: "contacts.write",
		update: "contacts.write"
	},
	snapshot: () => ({ customerPrices: Na }),
	restore: (e) => {
		Na = e.customerPrices;
	},
	publish: () => ja.forEach((e) => e())
});
//#endregion
//#region src/features/sales/data/salesCalculations.ts
function Ga(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Ka({ quantity: e, standardUnitPrice: t, unitPrice: n, taxRate: r = ne(), inclusiveLineTotal: i }) {
	let a = Ga(e * n), o = Ga(i === void 0 ? a * r : i - a), s = Ga(a + o), c = Ga(t - n);
	return {
		discountAmount: c,
		discountPercent: t > 0 ? Ga(c / t * 100) : 0,
		lineSubtotal: a,
		taxAmount: o,
		lineTotal: s
	};
}
function qa(e) {
	let t = Ga(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = Ga(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: Ga(t + n)
	};
}
//#endregion
//#region src/features/sales/data/salesPricingService.ts
function Ja({ customerId: e, documentDate: t, draft: n }) {
	if (n.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
	let r = D(n.productId);
	if (!r) throw Error(`Product ${n.productId} was not found`);
	if (r.status !== "ACTIVE") throw Error(`${r.name} is inactive`);
	let i = st(n.productId, n.unitId);
	if (!i) throw Error(`Unit ${n.unitId} was not found for ${r.name}`);
	let a = Ha.resolvePrice(e, n.productId, n.unitId, t), o = n.unitPrice !== void 0, s = o ? n.unitPrice : a.effectivePrice;
	if (!Number.isFinite(s) || s < 0) throw Error("Unit price cannot be negative");
	let c = Si(n.productId, n.unitId, n.quantity, n.requestedArea);
	if (Ei(n.productId, n.unitId, c.quantity, "sell"), r.sellEnabled === !1) throw Error("Product is not available for selling.");
	let l = r.taxCode ?? h().gstCode, u = ne(l), d = o ? g(s, u, n.priceBasis) : s, f = Ka({
		taxRate: u,
		inclusiveLineTotal: o && (n.priceBasis ?? h().basis) === "Inclusive" ? Math.round(c.quantity * s * 100) / 100 : void 0,
		quantity: c.quantity,
		standardUnitPrice: a.basePrice,
		unitPrice: d
	});
	return {
		id: Ya("line"),
		itemType: r.itemType ?? "STOCK",
		...c,
		...te(l),
		priceBasis: o ? n.priceBasis ?? h().basis : "Exclusive",
		grossUnitPrice: o && (n.priceBasis ?? h().basis) === "Inclusive" ? s : void 0,
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
function Ya(e) {
	return `${e}_${crypto.randomUUID()}`;
}
//#endregion
//#region src/features/sales/data/paymentRepository.ts
var Xa = /* @__PURE__ */ new Set(), Za = j.read().payments;
function Qa() {
	Xa.forEach((e) => e());
}
function $a() {
	return `payment_${crypto.randomUUID()}`;
}
function eo() {
	let e = `PAY-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Za.map((e) => e.paymentNumber).filter((t) => t.startsWith(e)).map((t) => Number(t.slice(e.length))).filter((e) => Number.isFinite(e)), n = t.length > 0 ? Math.max(...t) + 1 : 1;
	return `${e}${String(n).padStart(4, "0")}`;
}
var to = {
	subscribe(e) {
		return Xa.add(e), () => {
			Xa.delete(e);
		};
	},
	getSnapshot() {
		return Za;
	},
	getAll() {
		return Za;
	},
	getById(e) {
		return Za.find((t) => t.id === e);
	},
	getByCustomer(e) {
		return Za.filter((t) => t.customerId === e);
	},
	getByInvoice(e) {
		return Za.filter((t) => t.invoiceId === e);
	},
	create(e) {
		if (!e.customerId) throw Error("Customer is required");
		if (!e.invoiceId) throw Error("Invoice is required");
		if (!e.paymentDate) throw Error("Payment date is required");
		if (!e.bankAccountId) throw Error("Bank account is required");
		let t = bi.getById(e.bankAccountId);
		if (!t) throw Error("Bank account was not found");
		if (!t.active) throw Error("The selected bank account is inactive");
		if (!Number.isFinite(e.amount) || e.amount <= 0) throw Error("Payment amount must be greater than zero");
		if (b(e.paymentDate, "Payment date"), e.paymentDate < t.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
		if (ro(e.amount) <= 0) throw Error("Payment amount rounds to zero.");
		let n = e.operationId?.trim();
		if (e.operationId !== void 0 && !n) throw Error("Operation ID cannot be empty");
		if (n) {
			let t = F.begin(n, "CUSTOMER_PAYMENT", JSON.stringify({
				customerId: e.customerId,
				invoiceId: e.invoiceId,
				paymentDate: e.paymentDate,
				amount: ro(e.amount),
				method: e.method,
				bankAccountId: e.bankAccountId,
				reference: no(e.reference),
				notes: no(e.notes)
			}));
			if (t.status === "already_completed") {
				let e = Za.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed payment is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Payment operation requires manual review before retry.");
		}
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: $a(),
			paymentNumber: eo(),
			customerId: e.customerId,
			invoiceId: e.invoiceId,
			paymentDate: e.paymentDate,
			amount: ro(e.amount),
			method: e.method,
			bankAccountId: t.id,
			reference: no(e.reference),
			notes: no(e.notes),
			status: "RECEIVED",
			createdAt: r,
			updatedAt: r
		};
		n && F.bindResult(n, i.id);
		let a = [i, ...Za];
		if (j.update("payments", a), Za = a, n && !e.deferOperationCompletion) try {
			F.complete(n, i.id);
		} catch (e) {
			try {
				F.flagForReview(n, "Payment created but completion could not be confirmed");
			} catch {}
			throw e;
		}
		return Qa(), i;
	},
	reverse(e, t) {
		let n = Za.find((t) => t.id === e);
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
		}, o = Za.map((t) => t.id === e ? a : t);
		return j.update("payments", o), Za = o, Qa(), a;
	},
	getReceivedByInvoice(e) {
		return Za.filter((t) => t.invoiceId === e && t.status === "RECEIVED");
	}
};
function no(e) {
	return e?.trim() || void 0;
}
function ro(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
_("customerPayments", {
	repository: to,
	read: "sales.read",
	commands: {
		create: null,
		reverse: null
	},
	snapshot: () => ({ payments: Za }),
	restore: (e) => {
		Za = e.payments;
	},
	publish: () => Xa.forEach((e) => e())
});
//#endregion
//#region src/features/business-workspace/taxPosting.ts
function io(e, t, n, r) {
	let i = t === "paid" ? "GST_RECEIVABLE" : "GST_PAYABLE", a = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = (t === "paid" ? n.taxPaidAccountId : n.taxCollectedAccountId) || N.requireBySystemRole(i).id;
		a.set(e, (a.get(e) ?? 0) + n.taxAmount);
	}
	return e.length || a.set(N.requireBySystemRole(i).id, r), [...a].filter(([, e]) => Math.round((e + 2 ** -52) * 100) !== 0).map(([e, t]) => {
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
function ao(e) {
	return N.requireBySystemRole(e).id;
}
function oo(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: h().timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function so(e, t) {
	return P.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function co(e, t) {
	let n = so(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var lo = {
	postInvoice(e) {
		return so("CUSTOMER_INVOICE", e.id) || P.post({
			journalDate: e.documentDate,
			description: `Customer invoice ${e.documentNumber}`,
			reference: e.documentNumber,
			sourceType: "CUSTOMER_INVOICE",
			sourceId: e.id,
			lines: [
				{
					accountId: ao("ACCOUNTS_RECEIVABLE"),
					description: e.documentNumber,
					debit: e.totals.total,
					credit: 0
				},
				{
					accountId: ao("SALES_REVENUE"),
					description: e.documentNumber,
					debit: 0,
					credit: e.totals.subtotal
				},
				...io(e.lines, "collected", !1, e.totals.taxAmount)
			]
		});
	},
	reverseInvoice(e) {
		let t = co("CUSTOMER_INVOICE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? P.getById(t.reversalJournalEntryId) : void 0 : P.reverse({
			journalEntryId: t.id,
			reversalDate: oo(e.voidedAt),
			reason: e.voidReason ?? "Invoice void"
		});
	},
	postPayment(e) {
		let t = so("CUSTOMER_PAYMENT", e.id);
		if (t) return t;
		let n = bi.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this customer payment is inactive.");
		return P.post({
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
				accountId: ao("ACCOUNTS_RECEIVABLE"),
				description: e.paymentNumber,
				debit: 0,
				credit: e.amount
			}]
		});
	},
	reversePayment(e) {
		let t = co("CUSTOMER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? P.getById(t.reversalJournalEntryId) : void 0 : P.reverse({
			journalEntryId: t.id,
			reversalDate: oo(e.reversedAt),
			reason: e.reversalReason ?? "Customer payment reversal"
		});
	},
	postCreditNote(e) {
		return so("CREDIT_NOTE", e.id) || P.post({
			journalDate: e.creditDate,
			description: `Credit note ${e.creditNoteNumber}`,
			reference: e.creditNoteNumber,
			sourceType: "CREDIT_NOTE",
			sourceId: e.id,
			lines: [
				{
					accountId: ao("SALES_REVENUE"),
					description: e.creditNoteNumber,
					debit: e.totals.subtotal,
					credit: 0
				},
				...io(e.lines, "collected", !0, e.totals.taxAmount),
				{
					accountId: ao("ACCOUNTS_RECEIVABLE"),
					description: e.creditNoteNumber,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseCreditNote(e) {
		let t = co("CREDIT_NOTE", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? P.getById(t.reversalJournalEntryId) : void 0 : P.reverse({
			journalEntryId: t.id,
			reversalDate: oo(e.voidedAt),
			reason: e.voidReason ?? "Credit note void"
		});
	}
}, uo = /* @__PURE__ */ new Set(), fo = ia(), po = $i(), mo = Ji(), z = fo.status === "ok" ? structuredClone(fo.data.quotes) : po.status === "ok" ? structuredClone(po.data.quotes) : mo.status === "ok" ? structuredClone(mo.data) : structuredClone(la);
function ho(e) {
	fo.status === "ok" || ia().status !== "empty" ? aa({
		quotes: e,
		salesOrders: B,
		invoices: V
	}) : po.status === "ok" || $i().status !== "empty" ? ea({
		quotes: e,
		salesOrders: B
	}) : Yi(e), z = e, yo();
}
var B = fo.status === "ok" ? structuredClone(fo.data.salesOrders) : po.status === "ok" ? structuredClone(po.data.salesOrders) : structuredClone(ua), V = fo.status === "ok" ? structuredClone(fo.data.invoices) : structuredClone(da);
function go(e) {
	aa({
		quotes: z,
		salesOrders: B,
		invoices: e
	}), V = e, yo();
}
function _o(e, t = z) {
	fo.status === "ok" || ia().status !== "empty" ? aa({
		quotes: t,
		salesOrders: e,
		invoices: V
	}) : ea({
		quotes: t,
		salesOrders: e
	}), B = e, z = t, yo();
}
var vo = bo();
function yo() {
	vo = bo(), uo.forEach((e) => e());
}
function bo() {
	return [
		...z,
		...B,
		...V
	];
}
var H = {
	createManagedOrder(e) {
		let t = B.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Co("order"),
			managedDraftId: e.draftId,
			type: "SALES_ORDER",
			status: "CONFIRMED",
			documentNumber: wo("SO", B.map((e) => e.documentNumber)),
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
		return _o([r, ...B]), r;
	},
	createManagedInvoice(e) {
		let t = V.find((t) => t.managedDraftId === e.draftId);
		if (t) return t;
		let n = H.createManagedOrder(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Co("invoice"),
			managedDraftId: e.draftId,
			type: "INVOICE",
			status: "ISSUED",
			documentNumber: wo("INV", V.map((e) => e.documentNumber)),
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
		}, a = B.map((e) => e.id === n.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: r
		} : e);
		return aa({
			quotes: z,
			salesOrders: a,
			invoices: [i, ...V]
		}), B = a, V = [i, ...V], yo(), lo.postInvoice(i), i;
	},
	cancelManagedOrder(e, t) {
		let n = B.find((t) => t.id === e);
		if (!n?.managedDraftId) throw Error("Managed order not found.");
		if (n.status === "CANCELLED") return n;
		if (n.invoiceIds.some((e) => V.some((t) => t.id === e && t.status !== "VOID"))) throw Error("Void active invoices before cancelling the order.");
		if (n.status === "PARTIALLY_FULFILLED" || n.status === "FULFILLED" || n.fulfilmentStatus === "PARTIALLY_FULFILLED" || n.fulfilmentStatus === "FULFILLED") throw Error("Reverse active fulfilments before cancelling the order.");
		if (t.trim().length < 3) throw Error("Cancellation reason is required.");
		let r = {
			...n,
			status: "CANCELLED",
			notes: (n.notes ?? "") + "\nCancelled: " + t.trim(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return _o(B.map((t) => t.id === e ? r : t)), r;
	},
	subscribe(e) {
		return uo.add(e), () => {
			uo.delete(e);
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
	getQuotesByCustomer(e) {
		return z.filter((t) => t.customerId === e);
	},
	getOrdersByCustomer(e) {
		return B.filter((t) => t.customerId === e);
	},
	getInvoicesByCustomer(e) {
		return V.filter((t) => t.customerId === e);
	},
	createQuote(e) {
		if (xo(e), e.expiryDate && e.expiryDate < e.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		let t = e.lines.map((t) => Ja({
			customerId: e.customerId,
			documentDate: e.documentDate,
			draft: t
		})), n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Co("quote"),
			type: "QUOTE",
			documentNumber: wo("QU", z.map((e) => e.documentNumber)),
			recipient: wi(e.customerId, e),
			customerId: e.customerId,
			documentDate: e.documentDate,
			expiryDate: e.expiryDate,
			status: "DRAFT",
			customerReference: So(e.customerReference),
			notes: So(e.notes),
			lines: t,
			totals: qa(t),
			createdAt: n,
			updatedAt: n
		};
		return ho([r, ...z]), r;
	},
	updateDraftQuote(e, t) {
		let n = z.find((t) => t.id === e);
		if (!n) throw Error(`Quote ${e} was not found`);
		if (n.status !== "DRAFT") throw Error("Only draft quotes can be edited");
		if (!t.documentDate) throw Error("Document date is required");
		if (t.expiryDate && t.expiryDate < t.documentDate) throw Error("Quote expiry date cannot be earlier than the document date");
		if (t.lines.length === 0) throw Error("At least one sales line is required");
		let r = t.lines.map((e) => {
			if (e.quantity <= 0) throw Error("Sales line quantity must be greater than zero");
			if (!Number.isFinite(e.standardUnitPrice) || !Number.isFinite(e.unitPrice) || e.standardUnitPrice < 0 || e.unitPrice < 0) throw Error("Sales prices cannot be negative");
			let t = Si(e.productId, e.unitId, e.quantity, e.requestedArea);
			Ei(e.productId, e.unitId, t.quantity, "sell");
			let r = D(e.productId)?.taxCode ?? h().gstCode, i = Ka({
				taxRate: ne(r),
				quantity: t.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice
			}), a = n.lines.find((t) => t.id === e.lineId);
			return {
				itemType: D(e.productId)?.itemType ?? "STOCK",
				...t,
				id: a?.id ?? Co("line"),
				productId: e.productId,
				unitId: e.unitId,
				sku: Do(e.productId, e.unitId).sku,
				description: Do(e.productId, e.unitId).description,
				unitSymbol: Do(e.productId, e.unitId).unitSymbol,
				quantity: t.quantity,
				standardUnitPrice: e.standardUnitPrice,
				unitPrice: e.unitPrice,
				priceSource: e.priceSource,
				customerPriceId: e.customerPriceId,
				...te(r),
				...i
			};
		}), i = {
			...n,
			recipient: t.locationId === void 0 && t.accountingContactId === void 0 ? n.recipient : wi(n.customerId, t),
			documentDate: t.documentDate,
			expiryDate: t.expiryDate,
			customerReference: So(t.customerReference),
			notes: So(t.notes),
			lines: r,
			totals: qa(r),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ho(z.map((t) => t.id === e ? i : t)), i;
	},
	sendQuote(e) {
		let t = z.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "DRAFT") throw Error("Only a draft quote can be sent");
		if (t.lines.length === 0) throw Error("A quote must contain at least one line before it can be sent");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "SENT",
			updatedAt: n
		};
		return ho(z.map((t) => t.id === e ? r : t)), r;
	},
	acceptQuote(e) {
		let t = z.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be accepted");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "ACCEPTED",
			updatedAt: n
		};
		return ho(z.map((t) => t.id === e ? r : t)), r;
	},
	declineQuote(e) {
		let t = z.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "SENT") throw Error("Only a sent quote can be declined");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			...t,
			status: "DECLINED",
			updatedAt: n
		};
		return ho(z.map((t) => t.id === e ? r : t)), r;
	},
	convertQuoteToOrder(e) {
		let t = z.find((t) => t.id === e);
		if (!t) throw Error(`Quote ${e} was not found`);
		if (t.status !== "ACCEPTED") throw Error("Only an accepted quote can be converted to a sales order");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = {
			id: Co("order"),
			type: "SALES_ORDER",
			documentNumber: wo("SO", B.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: To(),
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
		return _o([r, ...B], z.map((e) => e.id === t.id ? {
			...e,
			status: "CONVERTED",
			convertedSalesOrderId: r.id,
			updatedAt: n
		} : e)), r;
	},
	setFulfilmentStatus(e, t) {
		let n = B.find((t) => t.id === e);
		if (!n) throw Error(`Sales order ${e} was not found`);
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "FULFILLED" && n.status !== "INVOICED") throw Error("Sales order fulfilment status cannot be changed from its current state.");
		let r = {
			...n,
			status: n.status === "INVOICED" ? "INVOICED" : t,
			fulfilmentStatus: t,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return _o(B.map((t) => t.id === e ? r : t)), r;
	},
	createInvoiceFromOrder(e) {
		let t = B.find((t) => t.id === e);
		if (!t) throw Error(`Sales order ${e} was not found`);
		if (t.status !== "CONFIRMED" && t.status !== "PARTIALLY_FULFILLED" && t.status !== "FULFILLED") throw Error("Only a confirmed or fulfilled sales order can be invoiced");
		if (t.invoiceIds.length > 0) throw Error("This sales order has already been invoiced");
		let n = (/* @__PURE__ */ new Date()).toISOString(), r = To(), i = {
			id: Co("invoice"),
			managedDraftId: t.managedDraftId,
			type: "INVOICE",
			documentNumber: wo("INV", V.map((e) => e.documentNumber)),
			recipient: structuredClone(t.recipient),
			customerId: t.customerId,
			documentDate: r,
			dueDate: Eo(r, Number(h().terms)),
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
		}, a = [i, ...V], o = B.map((e) => e.id === t.id ? {
			...e,
			status: "INVOICED",
			invoiceIds: [...e.invoiceIds, i.id],
			updatedAt: n
		} : e);
		return aa({
			quotes: z,
			salesOrders: o,
			invoices: a
		}), V = a, B = o, yo(), lo.postInvoice(i), i;
	},
	createCreditNoteFromInvoice(e) {
		let t = V.find((t) => t.id === e.invoiceId);
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
			let i = R.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id).reduce((e, t) => e + t.quantity, 0);
			if (e.quantity + i > n.quantity + 1e-8) throw Error("Credit quantity cannot exceed the original invoice quantity.");
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = R.getByInvoice(t.id).filter((e) => e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.id === n.id), s = e.quantity + i >= n.quantity - 1e-8, c = Oo(s ? n.lineSubtotal - o.reduce((e, t) => e + t.lineSubtotal, 0) : n.lineSubtotal * e.quantity / n.quantity), l = Oo(s ? n.taxAmount - o.reduce((e, t) => e + t.taxAmount, 0) : n.taxAmount * e.quantity / n.quantity);
			return {
				...n,
				requestedArea: e.quantity === n.quantity ? n.requestedArea : void 0,
				coveredArea: n.areaPerPack ? Math.round(e.quantity * n.areaPerPack * 1e8) / 1e8 : void 0,
				quantity: e.quantity,
				taxRate: a,
				lineSubtotal: c,
				taxAmount: l,
				lineTotal: Oo(c + l)
			};
		}), a = qa(i);
		if (a.total <= 0) throw Error("Credit note total must be greater than zero");
		if (Oo(Oo(R.getByInvoice(t.id).filter((e) => e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + a.total) > Oo(t.totals.total)) throw Error("Total credit notes cannot exceed the original invoice total");
		let o = (/* @__PURE__ */ new Date()).toISOString(), s = {
			id: Co("credit-note"),
			creditNoteNumber: wo("CN", R.getAll().map((e) => e.creditNoteNumber)),
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
		return R.create(s), lo.postCreditNote(s), s;
	},
	applyCreditToInvoice(e) {
		L(), ca();
		let t = R.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		let n = V.find((t) => t.id === e.invoiceId);
		if (!n) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void credit note cannot be applied");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be applied");
		if (n.status === "VOID") throw Error("Credit cannot be applied to a void invoice");
		if (n.status === "DRAFT") throw Error("Credit cannot be applied to a draft invoice");
		if (t.customerId !== n.customerId) throw Error("Credit note and invoice must belong to the same customer");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the credit note date");
		let r = Oo(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit amount must be greater than zero");
		let i = R.getById(t.id);
		if (!i) throw Error("Credit note was not found");
		if (r > i.amountAvailable) throw Error("Credit amount cannot exceed the available credit");
		if (r > this.recalculateInvoiceBalance(n.id).amountDue) throw Error("Credit amount cannot exceed the invoice amount due");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			id: Co("credit-allocation"),
			allocationNumber: wo("CA", R.getAllAllocations().map((e) => e.allocationNumber)),
			customerId: n.customerId,
			creditNoteId: i.id,
			invoiceId: n.id,
			allocationDate: e.allocationDate,
			amount: r,
			status: "APPLIED",
			createdAt: a,
			updatedAt: a
		}, s = Oo(i.amountApplied + r), c = Oo(Math.max(0, i.totals.total - (i.amountRefunded ?? 0) - s)), l = e.operationId ?? `sales-credit-apply:${crypto.randomUUID()}`;
		if (F.begin(l, "SALES_CREDIT_APPLY", JSON.stringify({
			creditNoteId: e.creditNoteId,
			invoiceId: e.invoiceId,
			allocationDate: e.allocationDate,
			amount: r
		})).status !== "started") throw Error("Credit allocation was previously attempted; manual review required.");
		try {
			F.bindResult(l, o.id), R.commitAllocationAndCredit(o, {
				...i,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(n.id), F.complete(l, o.id);
		} catch (e) {
			try {
				F.flagForReview(l, "Credit allocation/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	reverseCreditAllocation(e) {
		L(), ca();
		let t = R.getAllocationById(e.allocationId);
		if (!t) throw Error(`Credit allocation ${e.allocationId} was not found`);
		if (t.status === "REVERSED") throw Error("This credit allocation has already been reversed");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A reversal reason is required");
		let r = R.getById(t.creditNoteId);
		if (!r) throw Error("Credit note was not found");
		if (r.status === "VOID") throw Error("Allocations on a void credit note cannot be reversed here");
		let i = V.find((e) => e.id === t.invoiceId);
		if (!i) throw Error("Allocated invoice was not found");
		if (i.status === "VOID") throw Error("Credit allocation cannot be reversed after the invoice has been voided");
		let a = (/* @__PURE__ */ new Date()).toISOString(), o = {
			...t,
			status: "REVERSED",
			reversedAt: a,
			reversalReason: n,
			updatedAt: a
		}, s = Oo(R.getAllocationsByCreditNote(r.id).filter((e) => e.status === "APPLIED" && e.id !== o.id).reduce((e, t) => e + t.amount, 0)), c = Oo(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - s)), l = `sales-credit-reversal:${t.id}`;
		if (F.begin(l, "SALES_CREDIT_REVERSAL", t.id).status !== "started") throw Error("Credit allocation reversal previously attempted; manual review required.");
		try {
			F.bindResult(l, t.id), R.commitAllocationAndCredit(o, {
				...r,
				amountApplied: s,
				amountAvailable: c,
				status: c === 0 ? "FULLY_APPLIED" : "ISSUED",
				updatedAt: a
			}), this.recalculateInvoiceBalance(i.id), F.complete(l, t.id);
		} catch (e) {
			try {
				F.flagForReview(l, "Credit reversal/balance uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return o;
	},
	voidCreditNote(e) {
		let t = R.getById(e.creditNoteId);
		if (!t) throw Error(`Credit note ${e.creditNoteId} was not found`);
		if (t.status === "VOID") throw Error("This credit note has already been voided");
		if (t.status === "DRAFT") throw Error("A draft credit note cannot be voided here");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse customer refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required");
		if (R.getAllocationsByCreditNote(t.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this credit note");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: r,
			voidReason: n,
			updatedAt: r
		};
		return R.update(i), lo.reverseCreditNote(i), i;
	},
	recordInvoicePayment(e) {
		if (L(), ca(), e.operationId) {
			let t = F.list().find((t) => t.operationId === e.operationId);
			if (t) throw t.kind === "CUSTOMER_PAYMENT" ? Error(t.state === "COMPLETED" ? "Payment already recorded; refresh the invoice before submitting again." : "Payment operation is unresolved; manual review is required before retry.") : Error("Operation ID belongs to another business action.");
		}
		let t = V.find((t) => t.id === e.invoiceId);
		if (!t) throw Error(`Invoice ${e.invoiceId} was not found`);
		if (t.status === "VOID") throw Error("A void invoice cannot receive payments");
		if (t.status === "DRAFT") throw Error("A draft invoice cannot receive payments");
		if (t.status === "PAID") throw Error("This invoice has already been paid");
		let n = Oo(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Payment amount must be greater than zero");
		let r = this.recalculateInvoiceBalance(t.id);
		if (n > r.amountDue) throw Error("Payment amount cannot exceed the invoice amount due");
		if (b(e.paymentDate, "Payment date"), e.paymentDate < r.documentDate) throw Error("Payment date cannot precede the invoice date.");
		let i = e.operationId ?? `sales-payment:${crypto.randomUUID()}`, a = to.create({
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
			lo.postPayment(a);
			let e = P.getBySource("CUSTOMER_PAYMENT", a.id).filter((e) => !e.reversedJournalEntryId);
			if (e.length !== 1 || e[0].status !== "POSTED") throw Error("Payment GL posting could not be verified uniquely.");
			F.complete(i, a.id);
		} catch (e) {
			try {
				F.flagForReview(i, "Payment or GL posting uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	voidInvoice(e, t) {
		L(), ca();
		let n = V.find((t) => t.id === e);
		if (!n) throw Error(`Invoice ${e} was not found`);
		if (n.status === "VOID") throw Error("This invoice has already been voided");
		if (n.status === "DRAFT") throw Error("A draft invoice cannot be voided here");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required");
		if (to.getReceivedByInvoice(n.id).length > 0) throw Error("This invoice has received payments. Reverse all active payments before voiding the invoice.");
		if (R.getAllocationsByInvoice(n.id).filter((e) => e.status === "APPLIED").length > 0) throw Error("This invoice has applied credits. Reverse all active credit allocations before voiding the invoice.");
		if (n.managedDraftId && R.getByInvoice(n.id).some((e) => e.status !== "VOID")) throw Error("Void source credits before voiding this direct invoice.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			amountPaid: 0,
			amountDue: 0,
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		}, o = `sales-invoice-void:${e}`;
		if (F.begin(o, "SALES_INVOICE_VOID", e).status !== "started") throw Error("Invoice void was previously attempted; inspect GL and operation journal before retrying.");
		try {
			let t = P.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (t.length !== 1 || t[0].status !== "POSTED") throw Error("Invoice original GL must be uniquely posted before voiding.");
			F.bindResult(o, e), lo.reverseInvoice(a);
			let n = P.getBySource("CUSTOMER_INVOICE", e).filter((e) => !e.reversedJournalEntryId);
			if (n.length !== 1 || n[0].status !== "REVERSED") throw Error("Invoice GL reversal could not be verified.");
			go(V.map((t) => t.id === e ? a : t)), F.complete(o, e);
		} catch (e) {
			try {
				F.flagForReview(o, "Invoice void/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
		return a;
	},
	reverseInvoicePayment(e, t) {
		Ln("CUSTOMER_PAYMENT", e), L(), ca();
		let n = to.getById(e);
		if (!n) throw Error(`Payment ${e} was not found`);
		if (n.status === "REVERSED") throw Error("This payment has already been reversed");
		let r = V.find((e) => e.id === n.invoiceId);
		if (!r) throw Error("The invoice linked to this payment was not found");
		if (r.status === "VOID") throw Error("Payments on a void invoice cannot be reversed here");
		let i = `sales-payment-reversal:${e}`;
		if (F.begin(i, "SALES_PAYMENT_REVERSAL", e).status !== "started") throw Error("Payment reversal previously attempted; manual review required.");
		try {
			F.bindResult(i, e);
			let n = to.reverse(e, t);
			lo.reversePayment(n);
			let a = P.getBySource("CUSTOMER_PAYMENT", e).filter((e) => !e.reversedJournalEntryId);
			if (a.length !== 1 || a[0].status !== "REVERSED") throw Error("Payment GL reversal could not be verified.");
			return this.recalculateInvoiceBalance(r.id), F.complete(i, e), n;
		} catch (e) {
			try {
				F.flagForReview(i, "Payment reversal/GL state uncertain; manual review required.");
			} catch {}
			throw e;
		}
	},
	recalculateInvoiceBalance(e) {
		let t = V.find((t) => t.id === e);
		if (!t) throw Error(`Invoice ${e} was not found`);
		if (t.status === "VOID") return t;
		let n = to.getReceivedByInvoice(e), r = R.getAllocationsByInvoice(e).filter((e) => e.status === "APPLIED"), i = Oo(n.reduce((e, t) => e + t.amount, 0)), a = Oo(r.reduce((e, t) => e + t.amount, 0)), o = Oo(Math.max(0, t.totals.total - i - a)), s;
		s = o === 0 ? "PAID" : i > 0 || a > 0 ? "PARTIALLY_PAID" : ko(t.dueDate) ? "OVERDUE" : "ISSUED";
		let c = {
			...t,
			amountPaid: i,
			amountDue: o,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return go(V.map((t) => t.id === e ? c : t)), c;
	}
};
function xo(e) {
	if (!e.customerId) throw Error("Customer is required");
	if (!e.documentDate) throw Error("Document date is required");
	if (e.lines.length === 0) throw Error("At least one sales line is required");
}
function So(e) {
	return e?.trim() || void 0;
}
function Co(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function wo(e, t) {
	return ce(e, t, v((/* @__PURE__ */ new Date()).toISOString()).slice(0, 4));
}
function To() {
	return v((/* @__PURE__ */ new Date()).toISOString());
}
function Eo(e, t) {
	let [n, r, i] = e.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.setDate(a.getDate() + t), `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, "0")}-${String(a.getDate()).padStart(2, "0")}`;
}
function Do(e, t) {
	let n = D(e);
	if (!n) throw Error(`Product ${e} was not found`);
	let r = st(e, t);
	if (!r) throw Error(`Unit ${t} was not found for ${n.name}`);
	return {
		sku: n.sku,
		description: n.name,
		unitSymbol: r.symbol
	};
}
function Oo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function ko(e) {
	return e < Ao(/* @__PURE__ */ new Date());
}
function Ao(e) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
_("sales", {
	repository: H,
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
			Ti(e.recipient);
			for (let n of e.lines) Ci(n), rt(n, t.products.products.find((e) => e.id === n.productId));
		}
	},
	snapshot: () => ({
		quotes: z,
		salesOrders: B,
		invoices: V
	}),
	restore: (e) => {
		z = e.quotes, B = e.salesOrders, V = e.invoices, vo = bo();
	},
	publish: () => uo.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/purchaseOrderCalculations.ts
function jo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Mo({ orderedQuantity: e, unitCost: t, taxRate: n = ne(), inclusiveLineTotal: r }) {
	let i = jo(e * t), a = jo(r === void 0 ? i * n : r - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: jo(i + a)
	};
}
function No(e) {
	let t = jo(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = jo(e.reduce((e, t) => e + t.taxAmount, 0));
	return {
		subtotal: t,
		taxAmount: n,
		total: jo(t + n)
	};
}
//#endregion
//#region src/features/purchases/data/purchaseOrderRepository.ts
var Po = /* @__PURE__ */ new Set(), U = j.read().purchaseOrders;
j.onRollback(() => {
	U = j.read().purchaseOrders;
});
function Fo() {
	try {
		j.update("purchaseOrders", U);
	} catch (e) {
		throw U = j.read().purchaseOrders, e;
	}
	Po.forEach((e) => j.notify(e));
}
function Io(e) {
	return `${e}_${crypto.randomUUID()}`;
}
function Lo(e) {
	return ce("PO", U.map((e) => e.purchaseOrderNumber), e.slice(0, 4));
}
function Ro(e) {
	return e?.trim() || void 0;
}
function zo(e) {
	if (e.lines.length === 0) throw Error("Purchase order must contain at least one line.");
	return e.lines.map((e) => {
		let t = ot.find((t) => t.id === e.productId);
		if (!t) throw Error("Selected product was not found.");
		if (t.status !== "ACTIVE") throw Error(`${t.name} is inactive.`);
		let n = t.units.find((t) => t.id === e.unitId);
		if (!n) throw Error(`Selected unit for ${t.name} was not found.`);
		if (!n.active) throw Error(`${n.name} is inactive.`);
		if (!Number.isFinite(e.orderedQuantity) || e.orderedQuantity <= 0) throw Error("Ordered quantity must be greater than zero.");
		if (!Number.isFinite(e.unitCost) || e.unitCost < 0) throw Error("Unit cost cannot be negative.");
		if (Ei(e.productId, e.unitId, e.orderedQuantity, "buy"), t.buyEnabled === !1) throw Error("Product is not available for purchasing.");
		let r = t.taxCode ?? h().gstCode, i = ne(r), a = Mo({
			taxRate: i,
			inclusiveLineTotal: (e.priceBasis ?? h().basis) === "Inclusive" ? Math.round(e.orderedQuantity * e.unitCost * 100) / 100 : void 0,
			orderedQuantity: e.orderedQuantity,
			unitCost: g(e.unitCost, i, e.priceBasis)
		});
		return {
			id: Io("pol"),
			...te(r),
			grossUnitCost: (e.priceBasis ?? h().basis) === "Inclusive" ? e.unitCost : void 0,
			productId: t.id,
			unitId: n.id,
			sku: t.sku,
			description: t.name,
			unitSymbol: n.symbol,
			orderedQuantity: e.orderedQuantity,
			receivedQuantity: 0,
			billedQuantity: 0,
			unitCost: g(e.unitCost, i, e.priceBasis),
			...a
		};
	});
}
function Bo(e) {
	let t = Xe.getById(e);
	if (!t) throw Error("Selected supplier was not found.");
	if (t.status !== "ACTIVE") throw Error("Inactive suppliers cannot be used for new purchase orders.");
	return t;
}
function Vo(e) {
	if (!e.orderDate) throw Error("Order date is required.");
	if (e.expectedDeliveryDate && e.expectedDeliveryDate < e.orderDate) throw Error("Expected delivery date cannot be before the order date.");
}
var Ho = {
	subscribe(e) {
		return Po.add(e), () => {
			Po.delete(e);
		};
	},
	getSnapshot() {
		return U;
	},
	getAll() {
		return U;
	},
	getById(e) {
		return U.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return U.filter((t) => t.supplierId === e);
	},
	create(e) {
		Vo(e);
		let t = Bo(e.supplierId), n = zo(e), r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			id: Io("po"),
			purchaseOrderNumber: Lo(e.orderDate),
			supplierId: t.id,
			supplierCode: t.code,
			supplierName: t.businessName,
			orderDate: e.orderDate,
			expectedDeliveryDate: Ro(e.expectedDeliveryDate),
			status: "DRAFT",
			supplierReference: Ro(e.supplierReference),
			notes: Ro(e.notes),
			lines: n,
			totals: No(n),
			createdAt: r,
			updatedAt: r
		};
		return U = [i, ...U], Fo(), i;
	},
	updateDraft(e, t) {
		let n = Ho.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (n.status !== "DRAFT") throw Error("Only draft purchase orders can be edited.");
		Vo(t);
		let r = Bo(t.supplierId), i = zo(t), a = {
			...n,
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			orderDate: t.orderDate,
			expectedDeliveryDate: Ro(t.expectedDeliveryDate),
			supplierReference: Ro(t.supplierReference),
			notes: Ro(t.notes),
			lines: i,
			totals: No(i),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return U = U.map((e) => e.id === n.id ? a : e), Fo(), a;
	},
	approve(e) {
		let t = Ho.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "DRAFT") throw Error("Only draft purchase orders can be approved.");
		return Uo(t, {
			status: "APPROVED",
			approvedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	send(e) {
		let t = Ho.getById(e);
		if (!t) throw Error("Purchase order was not found.");
		if (t.status !== "APPROVED") throw Error("Only approved purchase orders can be sent.");
		return Uo(t, {
			status: "SENT",
			sentAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	},
	recordGoodsReceipt(e, t) {
		let n = Ho.getById(e);
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
		return U = U.map((e) => e.id === n.id ? o : e), Fo(), o;
	},
	recordSupplierBill(e, t) {
		let n = Ho.getById(e);
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
			let n = Wo(e.billedQuantity + t);
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
		return U = U.map((e) => e.id === n.id ? c : e), Fo(), c;
	},
	reverseSupplierBill(e, t) {
		let n = Ho.getById(e);
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
				billedQuantity: Wo(Math.max(0, e.billedQuantity - t))
			};
		}), a = i.every((e) => e.receivedQuantity >= e.orderedQuantity), o = i.every((e) => e.billedQuantity >= e.orderedQuantity), s = a && o ? "BILLED" : a ? "RECEIVED" : "PARTIALLY_RECEIVED", c = {
			...n,
			lines: i,
			status: s,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return U = U.map((e) => e.id === n.id ? c : e), Fo(), c;
	},
	cancel(e, t) {
		let n = Ho.getById(e);
		if (!n) throw Error("Purchase order was not found.");
		if (!["DRAFT", "APPROVED"].includes(n.status)) throw Error("Only draft or approved purchase orders can be cancelled.");
		let r = t.trim();
		if (r.length < 3) throw Error("Cancellation reason is required.");
		return Uo(n, {
			status: "CANCELLED",
			cancelledAt: (/* @__PURE__ */ new Date()).toISOString(),
			cancellationReason: r
		});
	}
};
function Uo(e, t) {
	let n = {
		...e,
		...t,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return U = U.map((t) => t.id === e.id ? n : t), Fo(), n;
}
function Wo(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
_("purchaseOrders", {
	repository: Ho,
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
	snapshot: () => ({ purchaseOrders: U }),
	restore: (e) => {
		U = e.purchaseOrders;
	},
	publish: () => Po.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostCalculations.ts
function W(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function Go(e) {
	return Math.round((e + 2 ** -52) * 1e6) / 1e6;
}
function Ko(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function qo({ transactionUnitCost: e, conversionToBase: t }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Transaction unit cost cannot be negative.");
	if (!Number.isFinite(t) || t <= 0) throw Error("Unit conversion must be greater than zero.");
	return Go(e / t);
}
function Jo({ quantityBase: e, unitCostBase: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Inventory unit cost cannot be negative.");
	return Ko(e * t);
}
function Yo({ currentQuantity: e, currentInventoryValue: t, incomingQuantity: n, incomingInventoryValue: r }) {
	if (!Number.isFinite(e) || e < 0) throw Error("Current inventory quantity cannot be negative.");
	if (!Number.isFinite(t) || t < 0) throw Error("Current inventory value cannot be negative.");
	if (!Number.isFinite(n) || n <= 0) throw Error("Incoming inventory quantity must be greater than zero.");
	if (!Number.isFinite(r) || r < 0) throw Error("Incoming inventory value cannot be negative.");
	let i = W(e + n), a = Ko(t + r);
	return {
		quantityAfter: i,
		inventoryValueAfter: a,
		averageCostAfter: i === 0 ? 0 : Go(a / i)
	};
}
function Xo({ quantityBase: e, averageCostPerBaseUnit: t }) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Issued inventory quantity must be greater than zero.");
	if (!Number.isFinite(t) || t < 0) throw Error("Average inventory cost cannot be negative.");
	return Ko(e * t);
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingPostingService.ts
function Zo(e) {
	return Ko(e.lines.reduce((e, t) => {
		let n = qo({
			transactionUnitCost: t.unitCost,
			conversionToBase: t.conversionToBase
		});
		return e + Jo({
			quantityBase: t.receivedBaseQuantity,
			unitCostBase: n
		});
	}, 0));
}
function Qo(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function $o(e) {
	return N.requireBySystemRole(e).id;
}
function es(e) {
	if (!e) throw Error("Accounting lifecycle timestamp is required.");
	if (/^\d{4}-\d{2}-\d{2}$/.test(e)) return e;
	let t = new Date(e);
	if (Number.isNaN(t.getTime())) throw Error("Accounting lifecycle timestamp is invalid.");
	try {
		let e = new Intl.DateTimeFormat("en-CA", {
			timeZone: h().timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).formatToParts(t), n = e.find((e) => e.type === "year")?.value, r = e.find((e) => e.type === "month")?.value, i = e.find((e) => e.type === "day")?.value;
		if (n && r && i) return `${n}-${r}-${i}`;
	} catch {}
	return e.slice(0, 10);
}
function ts(e, t) {
	return P.getBySource(e, t).find((e) => !e.reversedJournalEntryId);
}
function ns(e, t) {
	let n = ts(e, t);
	if (!n) throw Error(`Accounting journal for ${e} ${t} was not found.`);
	return n;
}
var rs = {
	validateGoodsReceiptPosting(e) {
		let t = N.requireBySystemRole("INVENTORY"), n = N.requireBySystemRole("GRNI");
		if (!t.active || t.type !== "ASSET") throw Error("Inventory GL account must be an active asset account.");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI GL account must be an active liability account.");
		let r = Zo(e);
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
		let t = P.getBySource("GOODS_RECEIPT", e.id).find((e) => !e.reversedJournalEntryId);
		if (t) return t;
		let { inventoryAccountId: n, grniAccountId: r, receiptValue: i } = this.validateGoodsReceiptPosting(e);
		return P.post({
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
		let n = N.requireBySystemRole("GRNI"), r = N.requireBySystemRole("GST_RECEIVABLE"), i = N.requireBySystemRole("ACCOUNTS_PAYABLE");
		if (!n.active || n.type !== "LIABILITY") throw Error("GRNI account must be an active liability account.");
		if (!r.active || r.type !== "ASSET") throw Error("GST Receivable must be an active asset account.");
		if (!i.active || i.type !== "LIABILITY") throw Error("Accounts Payable must be an active liability account.");
		if (!Number.isFinite(t) || t < 0) throw Error("Matched receipt value must be a non-negative finite number.");
		let a = Qo(e.totals.subtotal - t);
		if (a !== 0) {
			let e = N.requireBySystemRole("PURCHASE_PRICE_VARIANCE");
			if (!e.active || e.type !== "EXPENSE") throw Error("Purchase Price Variance must be an active expense account.");
		}
		let o = Qo(e.totals.subtotal + e.totals.taxAmount);
		if (!Number.isFinite(o) || !Number.isFinite(e.totals.total) || Math.abs(o - e.totals.total) > .01) throw Error("Supplier Bill accounting totals are not balanced.");
		return {
			matchedReceiptValue: t,
			variance: a
		};
	},
	postSupplierBill(e, t) {
		let n = ts("SUPPLIER_BILL", e.id);
		if (n) return n;
		let r = t ?? e.totals.subtotal, { variance: i } = this.validateSupplierBillPosting(e, r);
		return P.post({
			journalDate: e.billDate,
			description: `Supplier bill ${e.billNumber}`,
			reference: e.supplierInvoiceNumber,
			sourceType: "SUPPLIER_BILL",
			sourceId: e.id,
			lines: [
				{
					accountId: $o("GRNI"),
					description: `GRNI cleared - ${e.billNumber}`,
					debit: r,
					credit: 0
				},
				...io(e.lines, "paid", !0, e.totals.taxAmount),
				...i === 0 ? [] : [{
					accountId: $o("PURCHASE_PRICE_VARIANCE"),
					description: `Purchase price variance - ${e.billNumber}`,
					debit: i > 0 ? i : 0,
					credit: i < 0 ? -i : 0
				}],
				{
					accountId: $o("ACCOUNTS_PAYABLE"),
					description: `Supplier payable - ${e.billNumber}`,
					debit: 0,
					credit: e.totals.total
				}
			]
		});
	},
	reverseSupplierBill(e) {
		let t = ns("SUPPLIER_BILL", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? P.getById(t.reversalJournalEntryId) : void 0 : P.reverse({
			journalEntryId: t.id,
			reversalDate: es(e.voidedAt),
			reason: e.voidReason ?? "Supplier bill void"
		});
	},
	postSupplierPayment(e) {
		let t = ts("SUPPLIER_PAYMENT", e.id);
		if (t) return t;
		let n = bi.requireById(e.bankAccountId);
		if (!n.active) throw Error("The bank account for this supplier payment is inactive.");
		return P.post({
			journalDate: e.paymentDate,
			description: `Supplier payment ${e.paymentNumber}`,
			reference: e.reference ?? e.paymentNumber,
			sourceType: "SUPPLIER_PAYMENT",
			sourceId: e.id,
			lines: [{
				accountId: $o("ACCOUNTS_PAYABLE"),
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
		let t = ns("SUPPLIER_PAYMENT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? P.getById(t.reversalJournalEntryId) : void 0 : P.reverse({
			journalEntryId: t.id,
			reversalDate: es(e.reversedAt),
			reason: e.reversalReason ?? "Supplier payment reversal"
		});
	},
	postSupplierCredit(e) {
		return ts("SUPPLIER_CREDIT", e.id) || P.post({
			journalDate: e.creditDate,
			description: `Supplier credit ${e.creditNumber}`,
			reference: e.supplierCreditNumber,
			sourceType: "SUPPLIER_CREDIT",
			sourceId: e.id,
			lines: [
				{
					accountId: $o("ACCOUNTS_PAYABLE"),
					description: e.creditNumber,
					debit: e.totals.total,
					credit: 0
				},
				...e.lines.reduce((e, t) => {
					let n = t.expenseAccountId ?? $o("PURCHASE_PRICE_VARIANCE"), r = e.find((e) => e.accountId === n);
					return r ? r.credit = Math.round((r.credit + t.lineSubtotal) * 100) / 100 : t.lineSubtotal && e.push({
						accountId: n,
						debit: 0,
						credit: t.lineSubtotal
					}), e;
				}, []),
				...io(e.lines, "paid", !1, e.totals.taxAmount)
			]
		});
	},
	reverseSupplierCredit(e) {
		for (let t of P.getBySource("SUPPLIER_CREDIT_RECLASS", e.id).filter((e) => e.status === "POSTED")) P.reverse({
			journalEntryId: t.id,
			reversalDate: es(e.voidedAt),
			reason: e.voidReason ?? "Credit void"
		});
		let t = ns("SUPPLIER_CREDIT", e.id);
		return t.status === "REVERSED" ? t.reversalJournalEntryId ? P.getById(t.reversalJournalEntryId) : void 0 : P.reverse({
			journalEntryId: t.id,
			reversalDate: es(e.voidedAt),
			reason: e.voidReason ?? "Supplier credit void"
		});
	}
}, is = structuredClone([{
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
}]), as = {
	getAll() {
		return is;
	},
	getById(e) {
		return is.find((t) => t.id === e);
	},
	getActive() {
		return is.filter((e) => e.status === "ACTIVE");
	}
}, os = /* @__PURE__ */ new Set(), ss = [];
function cs() {
	os.forEach((e) => e());
}
function ls() {
	let e = `IM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = ss.filter((t) => t.movementNumber.startsWith(e)).map((t) => Number.parseInt(t.movementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
var us = {
	subscribe(e) {
		return os.add(e), () => {
			os.delete(e);
		};
	},
	getSnapshot() {
		return ss;
	},
	getAll() {
		return ss;
	},
	getByReference(e, t) {
		return ss.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByPurchaseOrder(e) {
		return ss.filter((t) => t.purchaseOrderId === e);
	},
	getBySalesOrder(e) {
		return ss.filter((t) => t.salesOrderId === e);
	},
	create(e) {
		if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory movement quantity cannot be zero.");
		let t = {
			id: `im_${crypto.randomUUID()}`,
			movementNumber: ls(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return ss = [t, ...ss], cs(), t;
	}
};
_("inventoryMovements", {
	repository: us,
	read: "inventory.read",
	commands: { create: null },
	snapshot: () => ({ movements: ss }),
	restore: (e) => {
		ss = e.movements;
	},
	publish: () => os.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostBalanceRepository.ts
var ds = /* @__PURE__ */ new Set(), fs = [];
function ps() {
	ds.forEach((e) => e());
}
var ms = {
	subscribe(e) {
		return ds.add(e), () => {
			ds.delete(e);
		};
	},
	getSnapshot() {
		return fs;
	},
	getAll() {
		return fs;
	},
	getBalance(e, t) {
		return fs.find((n) => n.siteId === e && n.productId === t);
	},
	requireBalance(e, t) {
		let n = ms.getBalance(e, t);
		if (!n) throw Error("Inventory cost balance was not found.");
		return n;
	},
	save(e) {
		return fs = fs.some((t) => t.siteId === e.siteId && t.productId === e.productId) ? fs.map((t) => t.siteId === e.siteId && t.productId === e.productId ? e : t) : [e, ...fs], ps(), e;
	},
	replaceAll(e) {
		fs = e, ps();
	},
	clear() {
		fs = [], ps();
	}
};
_("costBalances", {
	repository: ms,
	read: "inventory.cost.read",
	commands: {
		save: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ balances: fs }),
	restore: (e) => {
		fs = e.balances;
	},
	publish: () => ds.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostMovementRepository.ts
var hs = /* @__PURE__ */ new Set(), gs = [];
function _s() {
	hs.forEach((e) => e());
}
function vs() {
	let e = `ICM-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = gs.filter((t) => t.costMovementNumber.startsWith(e)).map((t) => Number.parseInt(t.costMovementNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function ys(e) {
	if (!Number.isFinite(e.quantityBase) || e.quantityBase === 0) throw Error("Inventory cost movement quantity cannot be zero.");
	if (!Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Inventory cost cannot be negative.");
	if (!Number.isFinite(e.valueChange)) throw Error("Inventory value movement must be valid.");
	if (!Number.isFinite(e.quantityAfter) || e.quantityAfter < 0) throw Error("Inventory cost quantity after movement cannot be negative.");
	if (!Number.isFinite(e.averageCostAfter) || e.averageCostAfter < 0) throw Error("Inventory average cost after movement cannot be negative.");
	if (!Number.isFinite(e.inventoryValueAfter) || e.inventoryValueAfter < 0) throw Error("Inventory value after movement cannot be negative.");
}
var bs = {
	subscribe(e) {
		return hs.add(e), () => {
			hs.delete(e);
		};
	},
	getSnapshot() {
		return gs;
	},
	getAll() {
		return gs;
	},
	getByReference(e, t) {
		return gs.filter((n) => n.referenceType === e && n.referenceId === t);
	},
	getByInventoryMovementId(e) {
		return gs.find((t) => t.inventoryMovementId === e);
	},
	getByProduct(e) {
		return gs.filter((t) => t.productId === e);
	},
	getBySiteAndProduct(e, t) {
		return gs.filter((n) => n.siteId === e && n.productId === t);
	},
	build(e) {
		return ys(e), {
			id: `icm_${crypto.randomUUID()}`,
			costMovementNumber: vs(),
			...e,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	},
	create(e) {
		let t = bs.build(e);
		return gs = [t, ...gs], _s(), t;
	},
	replaceAll(e) {
		gs = e, _s();
	},
	clear() {
		gs = [], _s();
	}
};
_("costMovements", {
	repository: bs,
	read: "inventory.cost.read",
	commands: {
		if: null,
		create: null,
		replaceAll: null,
		clear: null
	},
	snapshot: () => ({ movements: gs }),
	restore: (e) => {
		gs = e.movements;
	},
	publish: () => hs.forEach((e) => e())
});
//#endregion
//#region src/features/inventory/data/inventoryCostEngine.ts
function xs(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Inventory cost quantity must be greater than zero.");
}
function Ss(e) {
	let t = Date.parse(e);
	if (Number.isNaN(t)) throw Error("Inventory cost movement date is invalid.");
}
function Cs(e, t) {
	let n = D(e);
	if (!n) throw Error("Product was not found.");
	if (!tt(n)) throw Error("Non-stock/service items cannot move inventory value.");
	let r = ft.requireByProductId(e);
	if (!r.active) throw Error("Product costing is inactive.");
	if (r.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (r.baseUnitId !== n.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let i = st(e, t);
	if (!i) throw Error("Product unit was not found.");
	if (!i.active) throw Error("Product unit is inactive.");
	if (!Number.isFinite(i.conversionToBase) || i.conversionToBase <= 0) throw Error("Product unit conversion must be greater than zero.");
	return {
		product: n,
		policy: r,
		unit: i
	};
}
function ws(e, t) {
	if (e.baseUnitId !== t) throw Error("Inventory cost balance base unit does not match the product costing base unit.");
	if (e.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Inventory cost balance uses an unsupported costing method.");
	if (!Number.isFinite(e.quantityOnHand) || e.quantityOnHand < 0) throw Error("Inventory cost balance quantity is invalid.");
	if (!Number.isFinite(e.averageCostPerBaseUnit) || e.averageCostPerBaseUnit < 0) throw Error("Inventory cost balance average cost is invalid.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Inventory cost balance value is invalid.");
	let n = Ko(e.quantityOnHand * e.averageCostPerBaseUnit);
	if (Math.abs(Ko(n - e.inventoryValue)) > .01) throw Error("Inventory cost balance quantity, average cost and value are inconsistent.");
}
function Ts(e) {
	if (e && bs.getByInventoryMovementId(e)) throw Error("Inventory movement has already been costed.");
}
function Es({ movement: e, balance: t }) {
	let n = bs.getAll(), r = ms.getAll(), i = [e, ...n], a = r.some((e) => e.siteId === t.siteId && e.productId === t.productId) ? r.map((e) => e.siteId === t.siteId && e.productId === t.productId ? t : e) : [t, ...r];
	bs.replaceAll(i), ms.replaceAll(a);
}
function Ds(e) {
	if (xs(e.quantity), Ss(e.occurredAt), !Number.isFinite(e.transactionUnitCost) || e.transactionUnitCost < 0) throw Error("Transaction unit cost cannot be negative.");
	Ts(e.inventoryMovementId);
	let { policy: t, unit: n } = Cs(e.productId, e.unitId), r = W(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = qo({
		transactionUnitCost: e.transactionUnitCost,
		conversionToBase: n.conversionToBase
	}), a = Jo({
		quantityBase: r,
		unitCostBase: i
	}), o = ms.getBalance(e.siteId, e.productId);
	o && ws(o, t.baseUnitId);
	let s = Yo({
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
	ws(l, t.baseUnitId);
	let u = bs.build({
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
	return Es({
		movement: u,
		balance: l
	}), {
		movement: u,
		balance: l
	};
}
function Os(e) {
	xs(e.quantity), Ss(e.occurredAt), Ts(e.inventoryMovementId);
	let { policy: t, unit: n } = Cs(e.productId, e.unitId), r = W(e.quantity * n.conversionToBase);
	if (r <= 0) throw Error("Base inventory quantity must be greater than zero.");
	let i = ms.getBalance(e.siteId, e.productId);
	if (!i) throw Error("Inventory cannot be issued because no cost balance exists.");
	if (ws(i, t.baseUnitId), r > i.quantityOnHand) throw Error("Inventory issue would create negative stock.");
	let a = Go(i.averageCostPerBaseUnit), o = Xo({
		quantityBase: r,
		averageCostPerBaseUnit: a
	}), s = W(i.quantityOnHand - r), c = s === 0, l = Ko(c ? -i.inventoryValue : -o), u = c ? 0 : Ko(i.inventoryValue + l);
	if (u < 0) throw Error("Inventory issue would create a negative inventory value.");
	let d = s === 0 ? 0 : Go(u / s), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		...i,
		quantityOnHand: s,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		updatedAt: f
	};
	ws(p, t.baseUnitId);
	let m = bs.build({
		movementType: e.movementType ?? "ISSUE",
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: t.baseUnitId,
		quantityBase: W(-r),
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
	return Es({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
function ks(e) {
	if (xs(e.quantityBase), Ss(e.occurredAt), Ts(e.inventoryMovementId), !Number.isFinite(e.unitCostBase) || e.unitCostBase < 0) throw Error("Restored inventory unit cost cannot be negative.");
	if (!Number.isFinite(e.inventoryValue) || e.inventoryValue < 0) throw Error("Restored inventory value cannot be negative.");
	let t = D(e.productId);
	if (!t) throw Error("Product was not found.");
	if (!tt(t)) throw Error("Non-stock/service items cannot restore inventory value.");
	let n = ft.requireByProductId(e.productId);
	if (!n.active) throw Error("Product costing is inactive.");
	if (n.costingMethod !== "MOVING_WEIGHTED_AVERAGE") throw Error("Unsupported inventory costing method.");
	if (n.baseUnitId !== t.baseUnitId) throw Error("Product costing base unit does not match the product base unit.");
	let r = W(e.quantityBase), i = Go(e.unitCostBase), a = Ko(e.inventoryValue), o = ms.getBalance(e.siteId, e.productId);
	o && ws(o, n.baseUnitId);
	let s = o?.quantityOnHand ?? 0, c = o?.inventoryValue ?? 0, l = W(s + r), u = Ko(c + a), d = l === 0 ? 0 : Go(u / l), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
		siteId: e.siteId,
		productId: e.productId,
		baseUnitId: n.baseUnitId,
		quantityOnHand: l,
		averageCostPerBaseUnit: d,
		inventoryValue: u,
		costingMethod: n.costingMethod,
		updatedAt: f
	};
	ws(p, n.baseUnitId);
	let m = bs.build({
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
	return Es({
		movement: m,
		balance: p
	}), {
		movement: m,
		balance: p
	};
}
//#endregion
//#region src/features/inventory/data/stockRepository.ts
var As = /* @__PURE__ */ new Set(), js = [];
function Ms() {
	As.forEach((e) => e());
}
function Ns(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var Ps = {
	subscribe(e) {
		return As.add(e), () => {
			As.delete(e);
		};
	},
	getSnapshot() {
		return js;
	},
	getAll() {
		return js;
	},
	getBalance(e, t) {
		return js.find((n) => n.siteId === e && n.productId === t);
	},
	receive({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Received stock quantity must be greater than zero.");
		let i = Ps.getBalance(e, t), a = (/* @__PURE__ */ new Date()).toISOString();
		if (i) {
			let n = {
				...i,
				quantityOnHand: Ns(i.quantityOnHand + r),
				updatedAt: a
			};
			return js = js.map((r) => r.siteId === e && r.productId === t ? n : r), Ms(), n;
		}
		let o = {
			siteId: e,
			productId: t,
			baseUnitId: n,
			quantityOnHand: Ns(r),
			updatedAt: a
		};
		return js = [o, ...js], Ms(), o;
	},
	issue({ siteId: e, productId: t, baseUnitId: n, quantityBase: r }) {
		if (!Number.isFinite(r) || r <= 0) throw Error("Issued stock quantity must be greater than zero.");
		let i = Ps.getBalance(e, t);
		if (!i) throw Error("Stock cannot be issued because no stock balance exists.");
		if (i.baseUnitId !== n) throw Error("Stock balance base unit does not match the product base unit.");
		let a = Ns(i.quantityOnHand - r);
		if (a < 0) throw Error("Stock issue would create negative stock.");
		let o = {
			...i,
			quantityOnHand: a,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return js = js.map((n) => n.siteId === e && n.productId === t ? o : n), Ms(), o;
	},
	rebuildFromMovements() {
		let e = /* @__PURE__ */ new Map();
		for (let t of us.getAll()) {
			let n = `${t.siteId}:${t.productId}`, r = e.get(n);
			e.set(n, {
				siteId: t.siteId,
				productId: t.productId,
				baseUnitId: t.baseUnitId,
				quantityOnHand: Ns((r?.quantityOnHand ?? 0) + t.quantityBase),
				updatedAt: t.createdAt
			});
		}
		js = Array.from(e.values()), Ms();
	}
};
_("stock", {
	repository: Ps,
	read: "inventory.read",
	commands: {
		return: null,
		receive: null,
		issue: null,
		rebuildFromMovements: null
	},
	snapshot: () => ({ balances: js }),
	restore: (e) => {
		js = e.balances;
	},
	publish: () => As.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/goodsReceiptRepository.ts
var Fs = /* @__PURE__ */ new Set(), Is = j.read().goodsReceipts;
j.onRollback(() => {
	Is = j.read().goodsReceipts;
});
function Ls() {
	try {
		j.update("goodsReceipts", Is);
	} catch (e) {
		throw Is = j.read().goodsReceipts, e;
	}
	Fs.forEach((e) => j.notify(e));
}
function Rs(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function zs(e) {
	let t = `GR-${e.slice(0, 4)}-`, n = Is.filter((e) => e.receiptNumber.startsWith(t)).map((e) => Number.parseInt(e.receiptNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Bs(e) {
	return e?.trim() || void 0;
}
var Vs = {
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
	getById(e) {
		return Is.find((t) => t.id === e);
	},
	getByPurchaseOrder(e) {
		return Is.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = Ho.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (!["SENT", "PARTIALLY_RECEIVED"].includes(t.status)) throw Error("Only sent or partially received purchase orders can receive goods.");
		let n = as.getById(e.siteId);
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
			let r = Rs(n.orderedQuantity - n.receivedQuantity);
			if (r <= 0) throw Error(`${n.description} has already been fully received.`);
			if (e.receivedQuantity > r) throw Error(`${n.description} cannot receive more than ${r} ${n.unitSymbol}.`);
			if (!D(n.productId)) throw Error(`Product ${n.sku} was not found.`);
			let a = st(n.productId, n.unitId);
			if (!a) throw Error(`Unit for ${n.description} was not found.`);
			let o = Rs(e.receivedQuantity * a.conversionToBase);
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
			receiptNumber: zs(e.receiptDate),
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
			supplierDeliveryReference: Bs(e.supplierDeliveryReference),
			notes: Bs(e.notes),
			lines: a,
			postedAt: o,
			createdAt: o
		};
		rs.validateGoodsReceiptPosting(s), L();
		let c = I.begin("GOODS_RECEIPT", s.id).key, l = /* @__PURE__ */ new Map();
		return I.registerRecovery(c, () => {
			for (let r of s.lines) {
				let i = D(r.productId);
				if (!i) throw Error(`Product ${r.sku} was not found.`);
				I.runStep(c, `MOVEMENT:${r.id}`, () => {
					let a = us.create({
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
				}), I.runStep(c, `COST:${r.id}`, () => {
					let t = l.get(r.id);
					if (!t) throw Error(`Missing inventory movement for ${r.id}`);
					Ds({
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
				}), I.runStep(c, `STOCK:${r.id}`, () => {
					Ps.receive({
						siteId: n.id,
						productId: r.productId,
						baseUnitId: i.baseUnitId,
						quantityBase: r.receivedBaseQuantity
					});
				});
			}
			I.runStep(c, "JOURNAL", () => {
				rs.postGoodsReceipt(s);
			}), I.runStep(c, "PURCHASE_ORDER", () => {
				Ho.recordGoodsReceipt(t.id, s.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					receivedQuantity: e.receivedQuantity
				})));
			}), I.runStep(c, "RECEIPT", () => {
				Is = [s, ...Is], Ls();
			});
		}), I.recover(c), s;
	}
};
_("goodsReceipts", {
	repository: Vs,
	read: "purchases.read",
	commands: {
		catch: null,
		return: null,
		create: "purchases.receive"
	},
	snapshot: () => ({ goodsReceipts: Is }),
	restore: (e) => {
		Is = e.goodsReceipts;
	},
	publish: () => Fs.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierBillReceiptMatchingService.ts
var Hs = 1e-4;
function Us(e) {
	return Ko(e);
}
function Ws(e) {
	if (!Number.isFinite(e) || e <= 0) throw Error("Matching quantity must be greater than zero.");
	if (Math.abs(e - W(e)) > 1e-8) throw Error("Matching quantity exceeds supported precision.");
}
function Gs(e) {
	if (!Number.isFinite(e) || e < 0) throw Error("Supplier Bill unit cost must be a non-negative finite number.");
}
function Ks(e, t, n) {
	let r = qo({
		transactionUnitCost: t,
		conversionToBase: n
	});
	return Jo({
		quantityBase: W(e * n),
		unitCostBase: r
	});
}
function qs(e, t, n) {
	let r = [], i = n.filter((e) => e.status === "ACTIVE");
	for (let n of t) if (n.purchaseOrderId === e && n.status === "POSTED") for (let e of n.lines) {
		let t = W(i.filter((t) => t.goodsReceiptId === n.id && t.goodsReceiptLineId === e.id).reduce((e, t) => e + t.matchedQuantity, 0)), a = W(e.receivedQuantity - t);
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
function Js(e) {
	let { supplierBillId: t, purchaseOrderId: n, requests: r, receipts: i, existingMatches: a } = e;
	if (!t || !n) throw Error("Supplier Bill and Purchase Order IDs are required.");
	if (r.length === 0) throw Error("Supplier Bill matching requires at least one line.");
	if (a.some((e) => e.status === "ACTIVE" && e.supplierBillId === t)) throw Error("Supplier Bill already has active receipt matches.");
	let o = /* @__PURE__ */ new Set(), s = qs(n, i, a), c = [], l = e.createdAt ?? (/* @__PURE__ */ new Date()).toISOString();
	for (let e of r) {
		if (e.supplierBillId !== t || e.purchaseOrderId !== n) throw Error("Supplier Bill matching request references an incorrect bill or purchase order.");
		if (!e.supplierBillLineId || !e.purchaseOrderLineId || !e.productId) throw Error("Supplier Bill matching request has missing identifiers.");
		if (o.has(e.supplierBillLineId)) throw Error("Duplicate Supplier Bill Line in matching request.");
		o.add(e.supplierBillLineId), Ws(e.quantity), Gs(e.billUnitCost);
		let r = W(e.quantity), u = [], d = s.filter((t) => t.purchaseOrderLineId === e.purchaseOrderLineId && t.productId === e.productId && t.availableQuantity > Hs);
		if (W(d.reduce((e, t) => e + t.availableQuantity, 0)) + Hs < r) throw Error(`Insufficient received quantity for Purchase Order Line ${e.purchaseOrderLineId}.`);
		for (let o of d) {
			if (r <= Hs) break;
			let s = W(Math.min(r, o.availableQuantity));
			if (s <= 0) continue;
			let d = W(s * o.conversionToBase), f = i.find((e) => e.id === o.goodsReceiptId)?.lines.find((e) => e.id === o.goodsReceiptLineId);
			if (!f) throw Error("Matched receipt line was not found.");
			let p = Jo({
				quantityBase: f.receivedBaseQuantity,
				unitCostBase: qo({
					transactionUnitCost: f.unitCost,
					conversionToBase: f.conversionToBase
				})
			}), m = Us(a.filter((e) => e.status === "ACTIVE" && e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0) + c.filter((e) => e.goodsReceiptId === o.goodsReceiptId && e.goodsReceiptLineId === o.goodsReceiptLineId).reduce((e, t) => e + t.matchedReceiptValue, 0)), h = Math.abs(o.availableQuantity - s) <= Hs ? Us(p - m) : Ks(s, o.receiptUnitCost, o.conversionToBase);
			if (h < 0) throw Error("Receipt cost has been overallocated.");
			let g = Us(s * e.billUnitCost), ee = Us(g - h);
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
			}), o.availableQuantity = W(o.availableQuantity - s), r = W(r - s);
		}
		if (r > Hs) throw Error("Supplier Bill quantity could not be fully matched.");
		let f = Us(Us(e.quantity * e.billUnitCost) - Us(u.reduce((e, t) => e + t.matchedBillValue, 0))), p = u[u.length - 1];
		p && f !== 0 && (p.matchedBillValue = Us(p.matchedBillValue + f), p.priceVariance = Us(p.matchedBillValue - p.matchedReceiptValue)), c.push(...u);
	}
	let u = W(c.reduce((e, t) => e + t.matchedQuantity, 0)), d = W(c.reduce((e, t) => e + t.matchedBaseQuantity, 0)), f = Us(c.reduce((e, t) => e + t.matchedReceiptValue, 0)), p = Us(c.reduce((e, t) => e + t.matchedBillValue, 0));
	return {
		supplierBillId: t,
		purchaseOrderId: n,
		matches: c,
		totalMatchedQuantity: u,
		totalMatchedBaseQuantity: d,
		totalMatchedReceiptValue: f,
		totalMatchedBillValue: p,
		totalPriceVariance: Us(p - f)
	};
}
var Ys = {
	calculate: Js,
	getAvailableReceiptLines(e, t, n) {
		return qs(e, t, n);
	}
}, Xs = j.read().receiptMatches;
j.onRollback(() => {
	Xs = j.read().receiptMatches;
});
var Zs = /* @__PURE__ */ new Set(), Qs = () => {
	try {
		j.update("receiptMatches", Xs);
	} catch (e) {
		throw Xs = j.read().receiptMatches, e;
	}
	Zs.forEach((e) => j.notify(e));
}, $s = {
	getAll() {
		return [...Xs];
	},
	subscribe(e) {
		return Zs.add(e), () => {
			Zs.delete(e);
		};
	},
	getSnapshot() {
		return Xs;
	},
	getByBill(e) {
		return Xs.filter((t) => t.supplierBillId === e);
	},
	saveForBill(e, t) {
		if (Xs.some((t) => t.supplierBillId === e)) throw Error("Receipt matches already exist for this supplier bill.");
		if (!t.length || t.some((t) => t.supplierBillId !== e || t.status !== "ACTIVE")) throw Error("Invalid supplier bill receipt matches.");
		Xs = [...Xs, ...t], Qs();
	},
	reverseForBill(e, t, n = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
		let r = (/* @__PURE__ */ new Date()).toISOString();
		Xs = Xs.map((i) => i.supplierBillId === e && i.status === "ACTIVE" ? {
			...i,
			status: "REVERSED",
			reversedAt: r,
			reversalAccountingDate: n,
			reversalReason: t
		} : i), Qs();
	}
};
_("receiptMatches", {
	repository: $s,
	read: "purchases.read",
	commands: {
		catch: null,
		saveForBill: null,
		reverseForBill: null
	},
	snapshot: () => ({ matches: Xs }),
	restore: (e) => {
		Xs = e.matches;
	},
	publish: () => Zs.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/utils/supplierBillCalculations.ts
function ec(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function tc({ quantity: e, unitCost: t, inclusiveLineTotal: n, taxRate: r = .1 }) {
	let i = ec(e * t), a = ec(n === void 0 ? i * r : n - i);
	return {
		lineSubtotal: i,
		taxAmount: a,
		lineTotal: ec(i + a)
	};
}
function nc(e) {
	let t = ec(e.reduce((e, t) => e + t.lineSubtotal, 0)), n = ec(e.reduce((e, t) => e + t.taxAmount, 0)), r = ec(t + n);
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
var rc = /* @__PURE__ */ new Set(), G = j.read().supplierBills;
j.onRollback(() => {
	G = j.read().supplierBills;
});
function ic() {
	try {
		j.update("supplierBills", G);
	} catch (e) {
		throw G = j.read().supplierBills, e;
	}
	rc.forEach((e) => j.notify(e));
}
function ac(e) {
	return e?.trim() || void 0;
}
function oc(e) {
	return ce("BILL", G.map((e) => e.billNumber), e.slice(0, 4));
}
var sc = {
	insertExpenseBill(e) {
		let t = G.find((t) => t.managedDraftId === e.managedDraftId);
		if (t) return t;
		if (G.some((t) => t.supplierId === e.supplierId && t.supplierInvoiceNumber.toLowerCase() === e.supplierInvoiceNumber.toLowerCase() && t.status !== "VOID")) throw Error("Supplier invoice reference already exists.");
		return G = [e, ...G], ic(), e;
	},
	subscribe(e) {
		return rc.add(e), () => {
			rc.delete(e);
		};
	},
	getSnapshot() {
		return G;
	},
	getAll() {
		return G;
	},
	getById(e) {
		return G.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return G.filter((t) => t.supplierId === e);
	},
	applyPayment(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a payment.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment allocation must be greater than zero.");
		let r = lc(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than its outstanding balance.`);
		let i = lc(n.totals.amountPaid + r), a = lc(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return G = G.map((t) => t.id === e ? o : t), ic(), o;
	},
	reversePayment(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A payment cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Payment reversal amount must be greater than zero.");
		let r = lc(t);
		if (r > n.totals.amountPaid) throw Error(`${n.billNumber} does not contain enough paid value to reverse this allocation.`);
		let i = lc(Math.max(0, n.totals.amountPaid - r)), a = lc(Math.max(0, n.totals.total - i - n.totals.amountCredited)), o = {
			...n,
			status: a <= 0 ? "PAID" : i > 0 || n.totals.amountCredited > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountPaid: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return G = G.map((t) => t.id === e ? o : t), ic(), o;
	},
	applyCredit(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A void supplier bill cannot receive a credit allocation.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit allocation must be greater than zero.");
		let r = lc(t);
		if (r > n.totals.amountDue) throw Error(`${n.billNumber} cannot receive credit greater than its outstanding balance.`);
		let i = lc(n.totals.amountCredited + r), a = lc(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return G = G.map((t) => t.id === e ? o : t), ic(), o;
	},
	reverseCredit(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("A credit allocation cannot be reversed against a void supplier bill.");
		if (!Number.isFinite(t) || t <= 0) throw Error("Credit reversal amount must be greater than zero.");
		let r = lc(t);
		if (r > n.totals.amountCredited) throw Error(`${n.billNumber} does not contain enough credited value to reverse this allocation.`);
		let i = lc(Math.max(0, n.totals.amountCredited - r)), a = lc(Math.max(0, n.totals.total - n.totals.amountPaid - i)), o = {
			...n,
			status: a <= 0 ? "PAID" : n.totals.amountPaid > 0 || i > 0 ? "PARTIALLY_PAID" : "OPEN",
			totals: {
				...n.totals,
				amountCredited: i,
				amountDue: a
			},
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return G = G.map((t) => t.id === e ? o : t), ic(), o;
	},
	markVoid(e, t) {
		let n = G.find((t) => t.id === e);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("This supplier bill has already been voided.");
		let r = t.trim();
		if (r.length < 3) throw Error("A void reason is required.");
		if (n.status !== "OPEN" || n.totals.amountPaid > 0 || n.totals.amountCredited > 0) throw Error("A paid or credited supplier bill cannot be voided directly.");
		if ((x().supplierCredits?.supplierCredits ?? j.read().supplierCredits).some((e) => e.sourceSupplierBillId === n.id && e.status !== "VOID")) throw Error("Reverse source supplier credits and linked physical returns before voiding the bill.");
		if (n.kind === "EXPENSE") {
			L();
			let e = (/* @__PURE__ */ new Date()).toISOString(), t = {
				...n,
				status: "VOID",
				voidedAt: e,
				voidReason: r,
				updatedAt: e
			};
			return rs.reverseSupplierBill(t), G = G.map((e) => e.id === n.id ? t : e), ic(), t;
		}
		if ($s.getByBill(n.id).filter((e) => e.status === "ACTIVE").length === 0) throw Error("Supplier bill has no active receipt matches to reverse.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "VOID",
			voidedAt: i,
			voidReason: r,
			updatedAt: i
		};
		L();
		let o = I.begin("SUPPLIER_BILL_VOID", n.id).key;
		return I.registerRecovery(o, () => {
			I.runStep(o, "REVERSAL_JOURNAL", () => {
				rs.reverseSupplierBill(a);
			}), I.runStep(o, "PURCHASE_ORDER", () => {
				Ho.reverseSupplierBill(n.purchaseOrderId, n.lines.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), I.runStep(o, "MATCHES", () => {
				$s.reverseForBill(n.id, r, v(i));
			}), I.runStep(o, "BILL", () => {
				G = G.map((e) => e.id === n.id ? a : e), ic();
			});
		}), I.recover(o), a;
	},
	getByPurchaseOrder(e) {
		return G.filter((t) => t.purchaseOrderId === e);
	},
	create(e) {
		let t = Ho.getById(e.purchaseOrderId);
		if (!t) throw Error("Purchase order was not found.");
		if (![
			"PARTIALLY_RECEIVED",
			"RECEIVED",
			"BILLED"
		].includes(t.status)) throw Error("Supplier bills can only be created for purchase orders with received goods.");
		let n = e.supplierInvoiceNumber.trim();
		if (!n) throw Error("Supplier invoice number is required.");
		if (G.some((e) => e.supplierId === t.supplierId && e.supplierInvoiceNumber.toLowerCase() === n.toLowerCase() && e.status !== "VOID")) throw Error("This supplier invoice number has already been entered.");
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
			let r = cc(n.receivedQuantity - n.billedQuantity);
			if (r <= 0) throw Error(`${n.description} has no received quantity available to bill.`);
			if (e.quantity > r) throw Error(`${n.description} cannot bill more than ${r} ${n.unitSymbol}.`);
			let a = n.taxRate ?? (n.lineSubtotal ? n.taxAmount / n.lineSubtotal : .1), o = tc({
				taxRate: a,
				quantity: e.quantity,
				unitCost: e.unitCost
			});
			return n.grossUnitCost !== void 0 && e.unitCost === n.unitCost && (o.taxAmount = lc(e.quantity * n.grossUnitCost - o.lineSubtotal), o.lineTotal = lc(o.lineSubtotal + o.taxAmount)), {
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
		}), o = nc(a), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
			id: `bill_${crypto.randomUUID()}`,
			billNumber: oc(e.billDate),
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
			notes: ac(e.notes),
			createdAt: s,
			updatedAt: s
		}, l = Ys.calculate({
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
			receipts: Vs.getByPurchaseOrder(c.purchaseOrderId),
			existingMatches: $s.getAll()
		});
		if (Math.abs(l.totalMatchedBillValue - c.totals.subtotal) > .01) throw Error("Supplier bill matching amount does not equal the bill subtotal.");
		rs.validateSupplierBillPosting(c, l.totalMatchedReceiptValue), L();
		let u = I.begin("SUPPLIER_BILL", c.id).key;
		return I.registerRecovery(u, () => {
			I.runStep(u, "JOURNAL", () => {
				rs.postSupplierBill(c, l.totalMatchedReceiptValue);
			}), I.runStep(u, "PURCHASE_ORDER", () => {
				Ho.recordSupplierBill(t.id, a.map((e) => ({
					purchaseOrderLineId: e.purchaseOrderLineId,
					billedQuantity: e.quantity
				})));
			}), I.runStep(u, "MATCHES", () => {
				$s.saveForBill(c.id, l.matches.map((e) => ({
					...e,
					accountingDate: c.billDate
				})));
			}), I.runStep(u, "BILL", () => {
				G = [c, ...G], ic();
			});
		}), I.recover(u), c;
	}
};
function cc(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
function lc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
_("supplierBills", {
	repository: sc,
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
	snapshot: () => ({ supplierBills: G }),
	restore: (e) => {
		G = e.supplierBills;
	},
	publish: () => rc.forEach((e) => e())
});
//#endregion
//#region src/features/purchases/data/supplierCreditRepository.ts
var uc = /* @__PURE__ */ new Set(), K = j.read().supplierCredits, q = j.read().supplierCreditAllocations, dc = j.read().supplierCredits, fc = j.read().supplierCreditAllocations;
j.onRollback(() => {
	K = j.read().supplierCredits, q = j.read().supplierCreditAllocations, dc = K, fc = q;
});
function pc() {
	j.update("supplierCredits", K), j.update("supplierCreditAllocations", q), dc = [...K], fc = [...q], uc.forEach((e) => j.notify(e));
}
var mc = !1, J = {
	subscribe(e) {
		return uc.add(e), () => {
			uc.delete(e);
		};
	},
	getSnapshot() {
		return dc;
	},
	getAllocationSnapshot() {
		return fc;
	},
	getAll() {
		return dc;
	},
	getAllAllocations() {
		return fc;
	},
	getById(e) {
		return K.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return K.filter((t) => t.supplierId === e);
	},
	getBySourceBill(e) {
		return K.filter((t) => t.sourceSupplierBillId === e);
	},
	getAllocationById(e) {
		return q.find((t) => t.id === e);
	},
	getAllocationsByCredit(e) {
		return q.filter((t) => t.supplierCreditId === e);
	},
	getAllocationsByBill(e) {
		return q.filter((t) => t.supplierBillId === e);
	},
	createReturnCredit(e, t) {
		let n = {
			...J.create(e),
			physicalReturnId: t
		};
		return J.update(n), n;
	},
	voidReturnCredit(e) {
		mc = !0;
		try {
			return J.voidCredit(e);
		} finally {
			mc = !1;
		}
	},
	create(e) {
		let t = sc.getById(e.sourceSupplierBillId);
		if (!t) throw Error("Source supplier bill was not found.");
		if (t.status === "VOID") throw Error("A supplier credit cannot be created from a void supplier bill.");
		let n = e.supplierCreditNumber.trim();
		if (n.length === 0) throw Error("Supplier credit number is required.");
		if (K.some((e) => e.supplierId === t.supplierId && e.status !== "VOID" && e.supplierCreditNumber.toLowerCase() === n.toLowerCase())) throw Error("This supplier credit number already exists for the supplier.");
		if (!vc(e.creditDate)) throw Error("A valid credit date is required.");
		if (e.creditDate < t.billDate) throw Error("Credit date cannot be earlier than the source supplier bill date.");
		let r = e.reason.trim();
		if (r.length < 3) throw Error("A supplier credit reason is required.");
		if (e.lines.length === 0) throw Error("A supplier credit must contain at least one line.");
		let i = new Map(t.lines.map((e) => [e.id, e])), a = /* @__PURE__ */ new Set(), o = e.lines.map((e, n) => {
			let r = i.get(e.supplierBillLineId);
			if (!r) throw Error("A supplier credit line does not belong to the source supplier bill.");
			if (a.has(r.id)) throw Error(`${r.description} appears more than once in the supplier credit.`);
			a.add(r.id);
			let o = bc(e.quantity);
			if (!Number.isFinite(o) || o <= 0) throw Error(`${r.description} credit quantity must be greater than zero.`);
			if (o > r.quantity) throw Error(`${r.description} credit quantity cannot exceed the source bill quantity.`);
			let s = e.unitCost;
			if (!Number.isFinite(s) || s < 0) throw Error(`${r.description} unit cost cannot be negative.`);
			if (s > r.unitCost + 1e-8) throw Error(`${r.description} credit unit cost cannot exceed the source bill unit cost.`);
			let c = K.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").flatMap((e) => e.lines).filter((e) => e.supplierBillLineId === r.id), l = Math.abs(s - r.unitCost) < 1e-8, u = c.every((e) => Math.abs(e.unitCost - r.unitCost) < 1e-8), d = l && u && Math.abs(o + c.reduce((e, t) => e + t.quantity, 0) - r.quantity) < 1e-8, f = c.reduce((e, t) => e + t.lineSubtotal, 0), p = c.reduce((e, t) => e + t.taxAmount, 0), m = yc(d ? r.lineSubtotal - f : l ? r.lineSubtotal * o / r.quantity : o * s), h = yc(d ? r.taxAmount - p : r.unitCost ? r.taxAmount * o / r.quantity * s / r.unitCost : 0);
			if (m < 0 || h < 0 || yc(m + f) > r.lineSubtotal || yc(h + p) > r.taxAmount) throw Error("Credit line value exceeds the uncredited source bill line.");
			let g = yc(m + h);
			return {
				id: _c(`supplier-credit-line-${n + 1}`),
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
		}), s = yc(o.reduce((e, t) => e + t.lineSubtotal, 0)), c = yc(o.reduce((e, t) => e + t.taxAmount, 0)), l = yc(s + c);
		if (l <= 0) throw Error("Supplier credit total must be greater than zero.");
		if (yc(yc(K.filter((e) => e.sourceSupplierBillId === t.id && e.status !== "VOID").reduce((e, t) => e + t.totals.total, 0)) + l) > yc(t.totals.total)) throw Error("Total supplier credits cannot exceed the source supplier bill total.");
		let u = (/* @__PURE__ */ new Date()).toISOString(), d = {
			id: _c("supplier-credit"),
			creditNumber: gc(e.creditDate),
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
		return K = [d, ...K], pc(), rs.postSupplierCredit(d), d;
	},
	applyToBill(e) {
		let t = K.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("A void supplier credit cannot be allocated.");
		if (t.amountAvailable <= 0) throw Error("This supplier credit has no available balance.");
		let n = sc.getById(e.supplierBillId);
		if (!n) throw Error("Supplier bill was not found.");
		if (n.status === "VOID") throw Error("Credit cannot be allocated to a void supplier bill.");
		if (n.totals.amountDue <= 0) throw Error(`${n.billNumber} has no outstanding balance.`);
		if (t.supplierId !== n.supplierId) throw Error("Supplier credit and supplier bill must belong to the same supplier.");
		if (!vc(e.allocationDate)) throw Error("A valid allocation date is required.");
		if (e.allocationDate < t.creditDate) throw Error("Allocation date cannot be earlier than the supplier credit date.");
		if (e.allocationDate < n.billDate) throw Error("Allocation date cannot be earlier than the supplier bill date.");
		let r = yc(e.amount);
		if (!Number.isFinite(r) || r <= 0) throw Error("Credit allocation amount must be greater than zero.");
		if (r > t.amountAvailable) throw Error("Credit allocation cannot exceed the available supplier credit.");
		if (r > n.totals.amountDue) throw Error("Credit allocation cannot exceed the supplier bill amount due.");
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			id: _c("supplier-credit-allocation"),
			allocationNumber: hc(e.allocationDate),
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
		sc.applyCredit(n.id, r);
		let o = yc(t.amountApplied + r), s = yc(Math.max(0, t.totals.total - (t.amountRefunded ?? 0) - o)), c = {
			...t,
			amountApplied: o,
			amountAvailable: s,
			status: s <= 0 ? "FULLY_APPLIED" : "ISSUED",
			updatedAt: i
		};
		return q = [a, ...q], K = K.map((e) => e.id === t.id ? c : e), pc(), a;
	},
	reverseAllocation(e) {
		let t = q.find((t) => t.id === e.allocationId);
		if (!t) throw Error("Supplier credit allocation was not found.");
		if (t.status === "REVERSED") throw Error("This supplier credit allocation has already been reversed.");
		let n = e.reversalReason.trim();
		if (n.length < 3) throw Error("A reversal reason is required.");
		let r = K.find((e) => e.id === t.supplierCreditId);
		if (!r) throw Error("Supplier credit was not found.");
		if (r.status === "VOID") throw Error("An allocation belonging to a void supplier credit cannot be reversed.");
		let i = sc.getById(t.supplierBillId);
		if (!i) throw Error("Supplier bill was not found.");
		if (i.status === "VOID") throw Error("An allocation against a void supplier bill cannot be reversed.");
		if (t.amount > i.totals.amountCredited) throw Error("The supplier bill does not contain enough credited value to reverse this allocation.");
		if (t.amount > r.amountApplied) throw Error("The supplier credit does not contain enough applied value to reverse this allocation.");
		let a = (/* @__PURE__ */ new Date()).toISOString();
		sc.reverseCredit(i.id, t.amount);
		let o = yc(Math.max(0, r.amountApplied - t.amount)), s = yc(Math.max(0, r.totals.total - (r.amountRefunded ?? 0) - o)), c = {
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
		return K = K.map((e) => e.id === r.id ? c : e), q = q.map((e) => e.id === t.id ? l : e), pc(), l;
	},
	voidCredit(e) {
		let t = K.find((t) => t.id === e.supplierCreditId);
		if (!t) throw Error("Supplier credit was not found.");
		if (t.status === "VOID") throw Error("This supplier credit has already been voided.");
		if (t.physicalReturnId && !mc) throw Error("Reverse the linked physical supplier return instead of voiding its credit separately.");
		if ((t.amountRefunded ?? 0) > 0) throw Error("Reverse supplier refunds before voiding the credit.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("A void reason is required.");
		if (q.filter((e) => e.supplierCreditId === t.id && e.status === "APPLIED").length > 0) throw Error("Reverse all active credit allocations before voiding this supplier credit.");
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = {
			...t,
			status: "VOID",
			amountApplied: 0,
			amountAvailable: 0,
			voidedAt: mc && e.voidDate ? e.voidDate : r,
			voidReason: n,
			updatedAt: r
		};
		return K = K.map((e) => e.id === t.id ? i : e), pc(), rs.reverseSupplierCredit(i), i;
	},
	updateAllocation(e) {
		if (!q.some((t) => t.id === e.id)) throw Error(`Supplier credit allocation ${e.id} was not found.`);
		return q = q.map((t) => t.id === e.id ? e : t), pc(), e;
	},
	update(e) {
		if (!K.some((t) => t.id === e.id)) throw Error(`Supplier credit ${e.id} was not found.`);
		return K = K.map((t) => t.id === e.id ? e : t), pc(), e;
	}
};
function hc(e) {
	let t = `SCA-${e.slice(0, 4)}-`, n = q.filter((e) => e.allocationNumber.startsWith(t)).map((e) => Number.parseInt(e.allocationNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function gc(e) {
	return ce("SC", K.map((e) => e.creditNumber), e.slice(0, 4));
}
function _c(e) {
	return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function vc(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e);
}
function yc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function bc(e) {
	return Math.round((e + 2 ** -52) * 1e4) / 1e4;
}
var xc = J.create;
J.create = function(...e) {
	return L(), j.transaction(() => xc.apply(J, e));
};
var Sc = J.applyToBill;
J.applyToBill = function(...e) {
	return L(), j.transaction(() => Sc.apply(J, e));
};
var Cc = J.reverseAllocation;
J.reverseAllocation = function(...e) {
	return L(), j.transaction(() => Cc.apply(J, e));
};
var wc = J.voidCredit;
J.voidCredit = function(...e) {
	return L(), j.transaction(() => wc.apply(J, e));
};
var Tc = J.update;
J.update = function(...e) {
	return L(), j.transaction(() => Tc.apply(J, e));
};
var Ec = J.updateAllocation;
J.updateAllocation = function(...e) {
	return L(), j.transaction(() => Ec.apply(J, e));
}, _("supplierCredits", {
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
		supplierCredits: K,
		allocations: q
	}),
	restore: (e) => {
		K = e.supplierCredits, q = e.allocations, dc = [...K], fc = [...q];
	},
	publish: () => uc.forEach((e) => e())
});
//#endregion
//#region src/features/accounting/data/profitAndLossService.ts
function Dc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Oc(e, t) {
	b(e, t);
}
function kc(e, t, n, r) {
	if (Oc(n, "From date"), Oc(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = t.filter((e) => e.journalDate >= n && e.journalDate <= r), a = Ac(e.filter((e) => e.type === "REVENUE"), i, "REVENUE"), o = Ac(e.filter((e) => e.type === "EXPENSE"), i, "EXPENSE"), s = Dc(a.reduce((e, t) => e + t.amount, 0)), c = Dc(o.reduce((e, t) => e + t.amount, 0)), l = e.find((e) => e.systemRole === "SALES_REVENUE");
	if (!l) throw Error("Sales Revenue system account was not found.");
	if (l.type !== "REVENUE") throw Error("Sales Revenue system account must be a revenue account.");
	let u = e.find((e) => e.systemRole === "COST_OF_GOODS_SOLD");
	if (!u) throw Error("Cost of Goods Sold system account was not found.");
	if (u.type !== "EXPENSE") throw Error("Cost of Goods Sold system account must be an expense account.");
	let d = Dc(a.find((e) => e.accountId === l.id)?.amount ?? 0), f = Dc(o.find((e) => e.accountId === u.id)?.amount ?? 0), p = Dc(d - f);
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
		operatingExpenses: Dc(c - f),
		totalExpenses: c,
		netProfit: Dc(s - c)
	};
}
function Ac(e, t, n) {
	return e.map((e) => {
		let r = 0, i = 0;
		for (let n of t) for (let t of n.lines) t.accountId === e.id && (r = Dc(r + t.debit), i = Dc(i + t.credit));
		let a = Dc(n === "REVENUE" ? i - r : r - i);
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
function jc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Mc(e) {
	b(e);
}
function Nc(e, t) {
	let n = 0, r = 0;
	for (let i of t) for (let t of i.lines) t.accountId === e.id && (n = jc(n + t.debit), r = jc(r + t.credit));
	return e.type === "ASSET" || e.type === "EXPENSE" ? jc(n - r) : jc(r - n);
}
function Pc(e, t, n) {
	return e.filter((e) => e.type === n).map((e) => ({
		accountId: e.id,
		accountCode: e.code,
		accountName: e.name,
		amount: Nc(e, t)
	})).filter((e) => e.amount !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 }));
}
function Fc(e) {
	return jc(e.reduce((e, t) => e + t.amount, 0));
}
function Ic(e, t, n) {
	Mc(n);
	let r = t.filter((e) => e.journalDate <= n), i = Pc(e, r, "ASSET"), a = Pc(e, r, "LIABILITY"), o = Pc(e, r, "EQUITY"), s = e.filter((e) => e.type === "REVENUE"), c = e.filter((e) => e.type === "EXPENSE"), l = jc(s.reduce((e, t) => e + Nc(t, r), 0)), u = jc(c.reduce((e, t) => e + Nc(t, r), 0)), d = Fc(i), f = Fc(a), p = Fc(o), m = jc(l - u), h = jc(p + m), g = jc(f + h), ee = jc(d - g);
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
function Lc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Rc(e, t) {
	b(e, t);
}
function zc(e, t) {
	let n = Lc(e - t);
	return n >= 0 ? {
		debit: n,
		credit: 0
	} : {
		debit: 0,
		credit: Lc(Math.abs(n))
	};
}
function Bc(e, t, n, r) {
	if (Rc(n, "From date"), Rc(r, "To date"), n > r) throw Error("From date cannot be after to date.");
	let i = e.map((e) => {
		let i = 0, a = 0, o = 0, s = 0;
		for (let c of t) for (let t of c.lines) if (t.accountId === e.id) {
			if (c.journalDate < n) {
				i = Lc(i + t.debit), a = Lc(a + t.credit);
				continue;
			}
			c.journalDate <= r && (o = Lc(o + t.debit), s = Lc(s + t.credit));
		}
		let c = zc(i, a), l = zc(Lc(i + o), Lc(a + s));
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
	}).filter((e) => e.openingDebit !== 0 || e.openingCredit !== 0 || e.periodDebit !== 0 || e.periodCredit !== 0 || e.closingDebit !== 0 || e.closingCredit !== 0).sort((e, t) => e.accountCode.localeCompare(t.accountCode, void 0, { numeric: !0 })), a = Lc(i.reduce((e, t) => e + t.openingDebit, 0)), o = Lc(i.reduce((e, t) => e + t.openingCredit, 0)), s = Lc(i.reduce((e, t) => e + t.periodDebit, 0)), c = Lc(i.reduce((e, t) => e + t.periodCredit, 0)), l = Lc(i.reduce((e, t) => e + t.closingDebit, 0)), u = Lc(i.reduce((e, t) => e + t.closingCredit, 0)), d = Lc(l - u);
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
function Vc(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Hc(e, t) {
	b(e, t);
}
function Uc(e, t, n) {
	Hc(e.openingBalanceDate, "Opening balance date"), Hc(n, "As-at date");
	let r = t.filter((t) => t.journalDate >= e.openingBalanceDate && t.journalDate <= n).flatMap((t) => t.lines.filter((t) => t.accountId === e.glAccountId).map((e) => ({
		entry: t,
		line: e
	}))).sort((e, t) => {
		let n = e.entry.journalDate.localeCompare(t.entry.journalDate);
		if (n !== 0) return n;
		let r = e.entry.createdAt.localeCompare(t.entry.createdAt);
		return r === 0 ? e.line.id.localeCompare(t.line.id) : r;
	}), i = Vc(e.openingBalance), a = 0, o = 0, s = r.map(({ entry: t, line: n }) => {
		let r = Vc(n.debit), s = Vc(n.credit);
		return a = Vc(a + r), o = Vc(o + s), i = Vc(i + r - s), {
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
		openingBalance: Vc(e.openingBalance),
		moneyIn: a,
		moneyOut: o,
		closingBalance: i,
		transactionCount: s.length,
		transactions: s
	};
}
//#endregion
//#region src/features/cash-reports/cashReportService.ts
var Wc = [
	"Customer receipts & reversals",
	"Customer refunds & reversals",
	"Supplier payments & reversals",
	"Supplier refunds & reversals",
	"Bank opening adjustments",
	"Transfers across selection",
	"Other bank movements / review"
], Gc = (e) => Math.round(e * 100), Kc = (e) => e / 100;
function qc(e) {
	switch (e.sourceType) {
		case "CUSTOMER_PAYMENT":
		case "CUSTOMER_PAYMENT_REVERSAL": return Wc[0];
		case "CUSTOMER_REFUND": return Wc[1];
		case "SUPPLIER_PAYMENT":
		case "SUPPLIER_PAYMENT_REVERSAL": return Wc[2];
		case "SUPPLIER_REFUND": return Wc[3];
		case "OPENING_BALANCE": return Wc[4];
		case "BANK_TRANSFER": return Wc[5];
		default: return Wc[6];
	}
}
function Jc(e) {
	if (b(e.from, "From date"), b(e.to, "To date"), e.from > e.to) throw Error("From date must not exceed To date.");
	if (!e.currency.trim()) throw Error("Select a currency.");
	let t = new Map(e.bankAccounts.map((e) => [e.id, e]));
	if (t.size !== e.bankAccounts.length) throw Error("Duplicate bank account IDs require review.");
	if (e.bankIds && (new Set(e.bankIds).size !== e.bankIds.length || e.bankIds.some((e) => !t.has(e)))) throw Error("Invalid bank account selection.");
	let n = e.bankAccounts.filter((t) => (!e.bankIds || e.bankIds.includes(t.id)) && t.currency === e.currency);
	if (e.bankIds?.some((n) => t.get(n).currency !== e.currency)) throw Error("Selected banks must use the report currency.");
	for (let t of n) {
		if (e.bankAccounts.filter((e) => e.glAccountId === t.glAccountId).length !== 1) throw Error("Duplicate bank GL mappings require review before reporting.");
		b(t.openingBalanceDate, "Bank opening date");
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
		let n = Uc(t, e.journalEntries, e.to), o = t.openingBalanceDate < e.from ? Gc(t.openingBalance) : 0, s = 0, c = 0;
		if (t.openingBalanceDate >= e.from && t.openingBalance !== 0) {
			let e = Gc(t.openingBalance);
			a.push({
				id: `setup:${t.id}`,
				bankId: t.id,
				bankName: t.name,
				date: t.openingBalanceDate,
				description: "Bank setup opening balance (not a cash receipt)",
				sourceType: "BANK_SETUP",
				category: Wc[4],
				moneyIn: Kc(Math.max(e, 0)),
				moneyOut: Kc(Math.max(-e, 0))
			}), s += Math.max(e, 0), c += Math.max(-e, 0);
		}
		for (let i of n.transactions) {
			if (i.transactionDate < e.from) {
				o += Gc(i.moneyIn) - Gc(i.moneyOut);
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
				category: qc(n),
				moneyIn: i.moneyIn,
				moneyOut: i.moneyOut
			}), s += Gc(i.moneyIn), c += Gc(i.moneyOut);
		}
		let l = Gc(n.closingBalance);
		return {
			bankId: t.id,
			name: t.name,
			active: t.active,
			opening: Kc(o),
			moneyIn: Kc(s),
			moneyOut: Kc(c),
			closing: Kc(l),
			difference: Kc(o + s - c - l)
		};
	}), s = new Map(Wc.map((e) => [e, {
		category: e,
		moneyIn: 0,
		moneyOut: 0,
		net: 0
	}])), c = /* @__PURE__ */ new Map();
	for (let e of a) {
		if (e.category === Wc[5]) {
			let t = e.journalId;
			c.set(t, (c.get(t) ?? 0) + Gc(e.moneyIn) - Gc(e.moneyOut));
			continue;
		}
		let t = s.get(e.category);
		t.moneyIn += Gc(e.moneyIn), t.moneyOut += Gc(e.moneyOut);
	}
	for (let e of c.values()) {
		let t = s.get(Wc[5]);
		t.moneyIn += Math.max(e, 0), t.moneyOut += Math.max(-e, 0);
	}
	let l = [...s.values()].map((e) => ({
		category: e.category,
		moneyIn: Kc(e.moneyIn),
		moneyOut: Kc(e.moneyOut),
		net: Kc(e.moneyIn - e.moneyOut)
	})), u = (e) => Kc(o.reduce((t, n) => t + Gc(n[e]), 0)), d = u("opening"), f = u("closing"), p = Kc(l.reduce((e, t) => e + Gc(t.net), 0)), m = a.filter((e) => e.category === Wc[6]).length;
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
		difference: Kc(Gc(d) + Gc(p) - Gc(f))
	};
}
//#endregion
//#region src/features/net-analysis/netAnalysisService.ts
var Yc = (e) => Math.round(e * 100);
function Xc(e) {
	for (let t of [
		e.subtotal,
		e.tax,
		e.total
	]) if (!Number.isFinite(t) || t < 0 || Math.abs(t * 100 - Yc(t)) > 1e-6) throw Error(`${e.number}: invalid saved monetary totals.`);
	if (Yc(e.subtotal) + Yc(e.tax) !== Yc(e.total)) throw Error(`${e.number}: saved net, tax and gross do not reconcile.`);
}
function Zc(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) {
		if (r.status === "DRAFT" || r.openingBalanceImportId) continue;
		let e = `${r.kind}:${r.id}`;
		if (t.has(e)) throw Error(`Duplicate analysis source: ${r.number}.`);
		t.add(e), b(r.date, `Document date (${r.number})`), Xc(r);
		let i = r.kind === "CUSTOMER_CREDIT" || r.kind === "SUPPLIER_CREDIT", a = i ? -1 : 1, { voidedAt: o, openingBalanceImportId: s, ...c } = r, l = (t, n, i) => ({
			...c,
			date: t,
			eventId: `${e}:${i}`,
			event: i,
			subtotal: Yc(r.subtotal) * n / 100,
			tax: Yc(r.tax) * n / 100,
			total: Yc(r.total) * n / 100
		});
		if (n.push(l(r.date, a, i ? "CREDIT" : "DOCUMENT")), r.status === "VOID") {
			if (!r.voidedAt) throw Error(`${r.number}: void date is missing. Review the source record before reporting.`);
			let e = v(r.voidedAt);
			if (b(e, `Void date (${r.number})`), e < r.date) throw Error(`${r.number}: void date precedes the original document.`);
			n.push(l(e, -a, "VOID"));
		}
	}
	return n.sort((e, t) => e.date.localeCompare(t.date) || e.number.localeCompare(t.number) || e.eventId.localeCompare(t.eventId));
}
function Qc(e, t) {
	if (b(t.from, "From date"), b(t.to, "To date"), t.from > t.to) throw Error("From date must not exceed To date.");
	let n = t.query?.trim().toLowerCase() ?? "", r = Zc(e).filter((e) => e.date >= t.from && e.date <= t.to && (!t.partyId || e.partyId === t.partyId) && (!t.event || t.event === "ALL" || e.event === t.event) && `${e.number} ${e.partyName} ${e.partyId} ${e.kind}`.toLowerCase().includes(n)), i = (e, t) => e.reduce((e, n) => e + Yc(n[t]), 0) / 100, a = {
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
function $c(e, t, n) {
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
function el(e, t) {
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
var tl = [
	"Profit & loss",
	"Balance sheet",
	"Trial balance",
	"Cash flow",
	"Net sales",
	"Net purchases"
];
function nl(e) {
	let t = e.split(",").map((e) => e.trim());
	if (!t.length || t.length > tl.length || t.some((e) => !e)) throw Error("Select one to six supported reports.");
	let n = t.map((e) => tl.find((t) => t.toLowerCase() === e.toLowerCase()));
	if (n.some((e) => !e)) throw Error(`Supported reports: ${tl.join(", ")}.`);
	if (new Set(n).size !== n.length) throw Error("Each report may appear only once in a pack.");
	return n;
}
var rl = (e) => JSON.stringify(e);
function il(e, t, n) {
	if (b(e.periodStart, "From date"), b(e.periodEnd, "To date"), e.periodStart > e.periodEnd) throw Error("From date must not exceed To date.");
	let r = nl(e.reports), i = e.periodStart, a = e.periodEnd, o = r.map((e) => {
		if (e === "Profit & loss") {
			let n = kc(t.accounts, t.journals, i, a);
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
			let n = Ic(t.accounts, t.journals, a);
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
			let n = Bc(t.accounts, t.journals, i, a);
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
			let n = Jc({
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
		let n = e === "Net purchases", r = Qc(n ? el(t.bills, t.supplierCredits) : $c(t.documents, t.customerCredits, t.customers), {
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
		sourceSignature: rl(t),
		sections: o
	});
}
//#endregion
//#region src/features/report-packs/reportPackCommand.ts
function al() {
	let e = h();
	return {
		accounts: N.getAll(),
		journals: P.getAll(),
		banks: bi.getAll(),
		documents: H.getAll(),
		customerCredits: R.getAll(),
		customers: E.getAll().map((e) => ({
			id: e.id,
			businessName: e.businessName
		})),
		bills: sc.getAll(),
		supplierCredits: J.getAll(),
		company: {
			name: e.companyName,
			currency: e.currency,
			timezone: e.timezone
		}
	};
}
function ol(e) {
	let n = S.require("accounting.read"), r = u({
		id: t().trim().min(1).max(200),
		expectedRevision: t().regex(/^\d+$/)
	}).strict().parse(e), i = y["report-packs"]?.find((e) => e.id === r.id);
	if (!i) throw Error("Report pack configuration was not found.");
	if (i.revision !== r.expectedRevision) throw Error("Report pack changed. Reload before generating.");
	if (i.status !== "Active") throw Error("Activate this report pack before generating.");
	return il({
		id: i.id,
		revision: i.revision,
		name: i.name,
		cover: i.cover,
		introduction: i.introduction,
		periodStart: i.periodStart,
		periodEnd: i.periodEnd,
		reports: i.reports
	}, al(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: n.userId
	});
}
//#endregion
//#region src/features/saved-reports/savedReportService.ts
var sl = [
	"Sales",
	"Purchases",
	"Banking",
	"General ledger"
], Y = (e, t, n = !1) => ({
	key: e,
	label: t,
	numeric: n
}), cl = [
	Y("date", "Date"),
	Y("number", "Document"),
	Y("contact", "Contact"),
	Y("partyId", "Contact ID"),
	Y("activity", "Activity"),
	Y("status", "Current status"),
	Y("net", "Net", !0),
	Y("tax", "Tax", !0),
	Y("gross", "Gross", !0)
], ll = {
	Sales: cl,
	Purchases: cl,
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
}, ul = (e) => e === "Banking" ? "Cash" : "Accrual", dl = u({
	from: t(),
	to: t(),
	query: t().max(500).default(""),
	partyId: t().max(200).optional(),
	bankId: t().max(200).optional(),
	accountId: t().max(200).optional(),
	currency: t().min(1).max(10).optional()
}).strict();
function fl(e) {
	let t = s(sl).parse(e.dataset);
	if (e.basis !== ul(t)) throw Error(`${t} uses ${ul(t)} basis. Cash-basis sales/purchase recognition is not available.`);
	if (e.favourite !== void 0 && !["Yes", "No"].includes(e.favourite)) throw Error("Favourite must be Yes or No.");
	let n;
	try {
		n = JSON.parse(e.filter ?? "");
	} catch {
		throw Error("Legacy filter text is not executable. Edit and save explicit report dates and filters.");
	}
	let r = dl.parse(n);
	if (b(r.from, "From date"), b(r.to, "To date"), r.from > r.to) throw Error("From date must not exceed To date.");
	if (t !== "Sales" && t !== "Purchases" && r.partyId) throw Error("Contact filters require Sales or Purchases.");
	if (t !== "Banking" && (r.bankId || r.currency)) throw Error("Bank and currency filters require Banking.");
	if (t !== "General ledger" && r.accountId) throw Error("Account filters require General ledger.");
	let i = e.columns.split(",").map((e) => e.trim()), a = t === "Sales" || t === "Purchases" ? {
		customer: "contact",
		supplier: "contact",
		gst: "tax",
		total: "gross"
	} : {}, o = i.map((e) => ll[t].find((t) => t.label.toLowerCase() === e.toLowerCase() || t.key.toLowerCase() === (a[e.toLowerCase()] ?? e.toLowerCase())));
	if (!i.length || i.length > ll[t].length || o.some((e) => !e) || new Set(o.map((e) => e?.key)).size !== o.length) throw Error(`Select distinct supported columns for ${t}: ${ll[t].map((e) => e.label).join(", ")}.`);
	return {
		dataset: t,
		filters: r,
		columns: o
	};
}
var pl = (e, t) => e.reduce((e, n) => {
	let r = Number(n.values[t]), i = e + Math.round(r * 100);
	if (!Number.isFinite(r) || !Number.isSafeInteger(i)) throw Error("Report monetary total exceeds supported cents precision.");
	return i;
}, 0) / 100;
function ml(e, t, n) {
	let { dataset: r, filters: i, columns: a } = fl(e), o = i.query.trim().toLowerCase(), s = [], c = [], l = [], u = t.company.currency;
	if (r === "Sales" || r === "Purchases") {
		let e = r === "Sales" ? $c(t.documents, t.customerCredits, t.customers) : el(t.bills, t.supplierCredits);
		if (i.partyId && !e.some((e) => e.partyId === i.partyId) && !(r === "Sales" && t.customers.some((e) => e.id === i.partyId))) throw Error("Selected contact is not available in this dataset.");
		let n = {
			DOCUMENT: "Original document",
			CREDIT: "Credit note",
			VOID: "Void reversal"
		};
		s = Zc(e).filter((e) => e.date >= i.from && e.date <= i.to && (!i.partyId || e.partyId === i.partyId)).map((e) => ({
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
		let e = Jc({
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
		value: pl(s, t)
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
		sourceSignature: rl(t),
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
function hl(e) {
	let n = S.require("accounting.read"), r = u({
		id: t().trim().min(1).max(200),
		expectedRevision: t().regex(/^\d+$/)
	}).strict().parse(e), i = y["custom-reports"]?.find((e) => e.id === r.id);
	if (!i) throw Error("Saved report was not found.");
	if (i.revision !== r.expectedRevision) throw Error("Saved report changed. Reload before running.");
	if (i.status !== "Active") throw Error("Activate this saved report before running.");
	return ml({
		id: i.id,
		revision: i.revision,
		name: i.name,
		dataset: i.dataset,
		columns: i.columns,
		basis: i.basis,
		filter: i.filter,
		favourite: i.favourite
	}, al(), {
		id: crypto.randomUUID(),
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		generatedBy: n.userId
	});
}
//#endregion
//#region src/features/business-workspace/workspaceRepository.ts
var gl = fe(t(), t().max(2e4)), _l = [
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
], vl = () => (/* @__PURE__ */ new Date()).toISOString(), yl = {
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
}, bl = /* @__PURE__ */ new Set(), xl = 0, Sl = () => {
	xl++, bl.forEach((e) => e());
}, Cl = Object.fromEntries(Object.keys(yl).map((e) => [e, []]));
for (let e of Object.keys(yl)) y[e] = [];
var wl = () => ({
	collected: N.getAll().find((e) => e.systemRole === "GST_PAYABLE")?.id ?? "",
	paid: N.getAll().find((e) => e.systemRole === "GST_RECEIVABLE")?.id ?? ""
});
y["tax-codes"] = [{
	id: "tax-gst",
	name: "GST",
	status: "Active",
	revision: "1",
	createdAt: vl(),
	updatedAt: vl(),
	code: "GST",
	rate: "10",
	basis: "Exclusive",
	report: "GST",
	...wl()
}, {
	id: "tax-zero",
	name: "Zero rated",
	status: "Active",
	revision: "1",
	createdAt: vl(),
	updatedAt: vl(),
	code: "ZERO",
	rate: "0",
	basis: "Exclusive",
	report: "Zero rated",
	...wl()
}];
function Tl(e, t) {
	if (!e?.trim()) throw Error(`${t} is required.`);
}
function El(e, t) {
	if (!e?.trim() || !Number.isFinite(Number(e)) || Number(e) < 0) throw Error(`${t} must be a non-negative number.`);
}
function Dl(e, t) {
	let n = N.getAll().find((t) => t.id === e);
	if (!n?.active || t && n.type !== t) throw Error("Select an active account of the correct type.");
	return n;
}
function Ol(e) {
	return /^\d{4}-\d{2}-\d{2}$/.test(e) && Number.isFinite(Date.parse(e)) && (/* @__PURE__ */ new Date(e + "T00:00:00Z")).toISOString().slice(0, 10) === e;
}
function kl(e, t, n, r = !0) {
	let i = yl[e];
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
	Tl(t.name, "Name");
	for (let e of i.required) Tl(t[e], e);
	if (![
		"Active",
		"Inactive",
		"Open",
		"In progress",
		"Completed"
	].includes(t.status ?? "Active")) throw Error("Invalid business status.");
	if (e === "tax-codes") {
		if (El(t.rate, "Tax rate"), t.basis && !["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid entry basis.");
		if (r) {
			let e = n.find((e) => e.id === t.id), r = x(), i = y.settings?.find((e) => e.section === "business" && e.status === "Active")?.gstCode ?? "GST";
			if (t.status === "Inactive" && t.code === i) throw Error("The default tax code must remain active. Change the business default first.");
			if (e && e.code !== t.code && (e.code === i || r.products.products.some((t) => (t.taxCode ?? "GST") === e.code) || (y["bank-rules"] ?? []).some((t) => t.taxCode === e.code))) throw Error("A referenced tax code cannot be renamed. Create a new code and update future-use references.");
		}
		if (Number(t.rate) > 100) throw Error("Tax rate cannot exceed 100%.");
		if (r) {
			let e = Dl(t.collected, "LIABILITY"), n = Dl(t.paid, "ASSET"), r = (x().bankAccounts?.bankAccounts ?? []).map((e) => e.glAccountId);
			if (e.systemRole && e.systemRole !== "GST_PAYABLE" || n.systemRole && n.systemRole !== "GST_RECEIVABLE" || r.includes(n.id)) throw Error("Tax mappings cannot use AR/AP, inventory, GRNI or bank control accounts.");
		}
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Tax code must be unique.");
		if (!/^[A-Z0-9_-]{1,24}$/.test(t.code)) throw Error("Use uppercase letters/numbers for a tax code.");
	}
	if (e === "linked-accounts" && r) {
		let e = N.requireBySystemRole(t.role), n = t.status === "Inactive" ? N.getAll().find((e) => e.systemRole === t.role)?.id : t.accountId, r = x().journals?.journalEntries ?? [];
		if (n !== e.id && r.some((t) => t.lines.some((t) => t.accountId === e.id || t.accountId === n))) throw Error("A used posting account cannot be remapped without a ledger migration.");
	}
	if (e === "linked-accounts") {
		if (!_l.includes(t.role)) throw Error("Unknown account role.");
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
		if (r && Dl(t.accountId, e), n.some((e) => e.id !== t.id && e.role === t.role)) throw Error("A linked account role may only have one mapping.");
	}
	if (e === "promotions") {
		let e = D(t.productId);
		if (r && (!e || !st(e.id, t.unitId))) throw Error("Product/unit not found.");
		if (El(t.price, "Price"), !Number.isInteger(Number(t.priority))) throw Error("Priority must be an integer.");
		if (![
			"Customer price first",
			"Promotion first",
			"Lowest eligible price"
		].includes(t.policy)) throw Error("Invalid price conflict policy.");
		if (!/([+-]\d\d:\d\d|Z)$/.test(t.starts) || !Number.isFinite(Date.parse(t.starts)) || !/([+-]\d\d:\d\d|Z)$/.test(t.ends) || !Number.isFinite(Date.parse(t.ends)) || Date.parse(t.ends) <= Date.parse(t.starts)) throw Error("Promotion requires explicit time offsets and an end after start.");
	}
	if (r && t.customerId && !E.getById(t.customerId)) throw Error("Customer was not found.");
	if (e === "jobs") {
		if (El(t.budget, "Revenue budget"), El(t.costBudget, "Cost budget"), r) for (let e of ["budget", "costBudget"]) {
			let n = Number(t[e]);
			if (!Number.isSafeInteger(Math.round(n * 100)) || Math.abs(Math.round(n * 100) / 100 - n) > 1e-7) throw Error("Project budgets require safe currency amounts with at most two decimals.");
		}
		if (!Ol(t.starts) || !Ol(t.ends) || t.ends < t.starts) throw Error("Invalid project dates.");
		if (n.some((e) => e.id !== t.id && e.code.toLowerCase() === t.code.toLowerCase())) throw Error("Job code must be unique.");
	}
	if (e === "tasks") {
		if (r && t.id && (x().salesVisits?.visits ?? []).some((e) => e.followupTaskId === t.id && e.customerId !== t.customerId)) throw Error("A visit follow-up must retain the visit customer.");
		if (r && ![
			"Open",
			"In progress",
			"Completed"
		].includes(t.status ?? "Open")) throw Error("Task status must be Open, In progress or Completed.");
		if (!Ol(t.due) || ![
			"Low",
			"Normal",
			"High"
		].includes(t.priority)) throw Error("Invalid due date or priority.");
	}
	if (e === "bank-rules") {
		if (r && Dl(t.accountId), ![
			"Description",
			"Payee",
			"Reference"
		].includes(t.field) || ![
			"Contains",
			"Equals",
			"Starts with"
		].includes(t.operator)) throw Error("Invalid bank condition.");
		if (r && !y["tax-codes"].some((e) => e.status === "Active" && e.code === t.taxCode)) throw Error("Active tax code not found.");
	}
	if (e === "custom-reports" && r && fl({
		dataset: t.dataset,
		columns: t.columns,
		basis: t.basis,
		filter: t.filter,
		favourite: t.favourite
	}), e === "report-packs" && r && nl(t.reports), e === "report-packs" && (!Ol(t.periodStart) || !Ol(t.periodEnd) || t.periodEnd < t.periodStart)) throw Error("Invalid report period.");
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
			]) Tl(t[e], e);
			if (t.status !== "Active") throw Error("Business settings must remain active.");
			if (!["Exclusive", "Inclusive"].includes(t.basis)) throw Error("Invalid price basis.");
			if (!/^\d+$/.test(t.terms) || Number(t.terms) > 365) throw Error("Payment terms must be 0–365 days.");
			if (!/^\d{2}-\d{2}$/.test(t.yearEnd) || !Ol("2001-" + t.yearEnd)) throw Error("Year end must be MM-DD.");
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
				if (!y["tax-codes"].some((e) => e.code === t.gstCode && e.status === "Active")) throw Error("Default tax code must be active.");
				let e = x().journals.journalEntries, r = n.find((e) => e.id === t.id), i = x().bankAccounts.bankAccounts, a = r?.currency ?? i[0]?.currency ?? "AUD";
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
function Al(e, t, n) {
	Cl[e].push({
		id: crypto.randomUUID(),
		name: n,
		status: "Active",
		revision: "1",
		createdAt: vl(),
		updatedAt: vl(),
		recordId: t.id,
		actorId: S.current()?.userId ?? "local-test",
		after: JSON.stringify(t)
	});
}
var jl = Object.fromEntries(Object.keys(yl).map((e) => {
	let t = {
		run(t) {
			if (e !== "custom-reports") throw Error("Saved-report execution is not available on this register.");
			return hl(t);
		},
		generate(t) {
			if (e !== "report-packs") throw Error("Report generation is only available for report packs.");
			return ol(t);
		},
		getAll: () => y[e],
		getById: (t) => y[e].find((e) => e.id === t),
		save(t, n) {
			let r = gl.parse(t), i = y[e].find((e) => e.id === r.id);
			if (i && i.revision !== n) throw Error("Record changed. Reload before saving.");
			if (!i && n !== void 0) throw Error("Record no longer exists.");
			let a = vl(), o = {
				...r,
				id: i?.id ?? crypto.randomUUID(),
				name: r.name.trim(),
				status: r.status ?? (e === "tasks" ? "Open" : "Active"),
				revision: String(Number(i?.revision ?? "0") + 1),
				createdAt: i?.createdAt ?? a,
				updatedAt: a
			};
			return e === "tasks" && (delete o.completedAt, delete o.completedBy, o.status === "Completed" && (o.completedAt = i?.status === "Completed" && i.completedAt || a, o.completedBy = i?.status === "Completed" ? i.completedBy || S.current()?.userId || "local-test" : S.current()?.userId ?? "local-test")), kl(e, o, y[e]), y[e] = [...y[e].filter((e) => e.id !== o.id), o], Al(e, o, i ? "Updated" : "Created"), Sl(), o;
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
			Al(e, {
				...i,
				note: r.trim()
			}, "Note added"), Sl();
		}
	};
	return _("workspace_" + e.replaceAll("-", "_"), {
		validate: (t, n) => {
			Ml(e, t), Nl(e, t, n);
		},
		repository: t,
		read: yl[e].read,
		commands: {
			run: e === "custom-reports" ? "accounting.read" : null,
			generate: e === "report-packs" ? "accounting.read" : null,
			save: yl[e].write,
			setStatus: yl[e].write,
			addNote: e === "tasks" ? "sales.write" : null
		},
		snapshot: () => ({
			records: y[e],
			history: Cl[e]
		}),
		restore: (t) => {
			Ml(e, t), y[e] = t.records, Cl[e] = t.history;
		},
		publish: Sl
	}), [e, t];
}));
function Ml(e, t) {
	let n = u({
		records: l(gl),
		history: l(gl)
	}).strict().parse(t), r = /* @__PURE__ */ new Set();
	for (let t of n.records) {
		if (!t.id || r.has(t.id) || !/^\d+$/.test(t.revision)) throw Error("Invalid workspace record identity.");
		r.add(t.id), kl(e, t, n.records, !1);
	}
	return n;
}
function Nl(e, t, n) {
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
var X = t().trim().min(1).max(200), Pl = t().trim().min(1).max(4e3), Fl = t().refine((e) => {
	try {
		return b(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), Il = t().refine((e) => {
	let t = new Date(e);
	return Number.isFinite(t.getTime()) && t.toISOString() === e;
}, "Invalid visit timestamp."), Ll = u({
	operationId: X,
	name: X,
	customerId: X,
	locationId: X.optional(),
	plannedDate: Fl,
	locationNote: t().trim().max(500).default("")
}).strict(), Rl = u({
	name: X,
	due: Fl,
	priority: s([
		"Low",
		"Normal",
		"High"
	]),
	notes: Pl
}).strict(), zl = u({
	id: X,
	expectedRevision: o().int().positive(),
	outcome: Pl,
	followup: Rl.optional()
}).strict(), Bl = u({
	id: X,
	action: X,
	actorId: X,
	at: Il,
	note: t().optional()
}).strict(), Vl = u({
	id: X,
	operationId: X,
	creationFingerprint: t().min(1).max(3e3),
	name: X,
	customerId: X,
	customerName: X,
	locationId: X.optional(),
	locationName: t().max(200).optional(),
	locationNote: t().max(500),
	plannedDate: Fl,
	status: s([
		"Planned",
		"Checked in",
		"Completed",
		"Cancelled"
	]),
	revision: o().int().positive(),
	ownerId: X,
	createdAt: Il,
	updatedAt: Il,
	checkInAt: Il.optional(),
	checkInBy: X.optional(),
	checkOutAt: Il.optional(),
	checkOutBy: X.optional(),
	outcome: Pl.optional(),
	completionFingerprint: t().optional(),
	followupTaskId: X.optional(),
	history: l(Bl).min(1)
}).strict(), Hl = [], Ul = 0, Wl = /* @__PURE__ */ new Set(), Gl = () => {
	Ul++, Wl.forEach((e) => e());
}, Kl = () => S.require("sales.write").userId, ql = () => (/* @__PURE__ */ new Date()).toISOString(), Jl = (e, t, n, r) => ({
	id: crypto.randomUUID(),
	action: e,
	actorId: t,
	at: n,
	...r ? { note: r } : {}
});
function Yl(e) {
	let t = Hl.find((t) => t.id === e);
	if (!t) throw Error("Visit not found.");
	return t;
}
function Xl(e, t) {
	if (e.revision !== t) throw Error("Visit changed. Reload before continuing.");
}
function Zl(e) {
	let t = ql();
	if (t < e.updatedAt) throw Error("System clock precedes the last visit update. Correct the clock before continuing.");
	return t;
}
function Ql(e) {
	return Hl = [...Hl.filter((t) => t.id !== e.id), e], Gl(), e;
}
function $l(e, t) {
	let n = E.getById(e);
	if (!n || n.status === "INACTIVE") throw Error("Choose an available customer.");
	if (t && !n.locations.some((e) => e.id === t)) throw Error("Choose a location belonging to the selected customer.");
	return n;
}
_("salesVisits", {
	repository: {
		subscribe(e) {
			return Wl.add(e), () => {
				Wl.delete(e);
			};
		},
		getSnapshot: () => Hl,
		getAll: () => Hl,
		create(e) {
			let t = Kl(), n = Ll.parse(e), r = JSON.stringify(n), i = Hl.find((e) => e.operationId === n.operationId);
			if (i) {
				if (i.creationFingerprint !== r) throw Error("Operation ID was used for different visit data.");
				return i;
			}
			let a = $l(n.customerId, n.locationId), o = ql();
			return Ql({
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
				history: [Jl("Planned", t, o)]
			});
		},
		update(e) {
			let t = Kl(), n = Ll.omit({ operationId: !0 }).extend({
				id: X,
				expectedRevision: o().int().positive()
			}).strict().parse(e), r = Yl(n.id);
			if (Xl(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be edited.");
			let i = $l(n.customerId, n.locationId), a = Zl(r), s = {
				...r,
				name: n.name,
				customerId: n.customerId,
				customerName: i.businessName,
				plannedDate: n.plannedDate,
				locationNote: n.locationNote,
				revision: r.revision + 1,
				updatedAt: a,
				history: [...r.history, Jl("Plan updated", t, a, r.plannedDate + " → " + n.plannedDate)]
			};
			return delete s.locationId, delete s.locationName, n.locationId && (s.locationId = n.locationId, s.locationName = i.locations.find((e) => e.id === n.locationId).name), Ql(s);
		},
		checkIn(e) {
			let t = Kl(), n = u({
				id: X,
				expectedRevision: o().int().positive()
			}).strict().parse(e), r = Yl(n.id);
			if (r.status === "Checked in" && r.revision === n.expectedRevision + 1) return r;
			if (Xl(r, n.expectedRevision), r.status !== "Planned") throw Error("Only a planned visit can be checked in.");
			$l(r.customerId, r.locationId);
			let i = Zl(r);
			return Ql({
				...r,
				status: "Checked in",
				revision: r.revision + 1,
				checkInAt: i,
				checkInBy: t,
				updatedAt: i,
				history: [...r.history, Jl("Checked in", t, i)]
			});
		},
		finish(e) {
			let t = Kl(), n = zl.parse(e), r = Yl(n.id), i = JSON.stringify({
				outcome: n.outcome,
				followup: n.followup
			});
			if (r.status === "Completed") {
				if (r.completionFingerprint === i) return r;
				throw Error("Visit is already completed with a different outcome.");
			}
			if (Xl(r, n.expectedRevision), r.status !== "Checked in") throw Error("Check in before completing the visit.");
			let a = Zl(r);
			if (a < r.checkInAt) throw Error("System clock precedes check-in. Correct the clock before completing.");
			let o;
			return n.followup && (o = jl.tasks.save({
				...n.followup,
				customerId: r.customerId,
				owner: t,
				status: "Open"
			}).id), Ql({
				...r,
				status: "Completed",
				revision: r.revision + 1,
				checkOutAt: a,
				checkOutBy: t,
				outcome: n.outcome,
				completionFingerprint: i,
				...o ? { followupTaskId: o } : {},
				updatedAt: a,
				history: [...r.history, Jl("Completed", t, a, n.outcome)]
			});
		},
		cancel(e) {
			let t = Kl(), n = u({
				id: X,
				expectedRevision: o().int().positive(),
				reason: Pl
			}).strict().parse(e), r = Yl(n.id);
			if (Xl(r, n.expectedRevision), !["Planned", "Checked in"].includes(r.status)) throw Error("Only an unfinished visit can be cancelled.");
			let i = Zl(r);
			return Ql({
				...r,
				status: "Cancelled",
				revision: r.revision + 1,
				updatedAt: i,
				history: [...r.history, Jl("Cancelled", t, i, n.reason)]
			});
		},
		addNote(e) {
			let t = Kl(), n = u({
				id: X,
				expectedRevision: o().int().positive(),
				note: Pl
			}).strict().parse(e), r = Yl(n.id);
			Xl(r, n.expectedRevision);
			let i = Zl(r);
			return Ql({
				...r,
				revision: r.revision + 1,
				updatedAt: i,
				history: [...r.history, Jl("Note added", t, i, n.note)]
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
	snapshot: () => ({ visits: Hl }),
	restore: (e) => {
		Hl = e.visits;
	},
	publish: Gl,
	validate: (e, t) => {
		let n = u({ visits: l(Vl) }).strict().parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.visits) {
			if (i.has(e.operationId)) throw Error("Duplicate visit operation ID.");
			if (i.add(e.operationId), !r.customers.customers.find((t) => t.id === e.customerId) || e.locationId && !e.locationName) throw Error("Invalid visit customer/location reference.");
			if (e.history.length !== e.revision || new Set(e.history.map((e) => e.id)).size !== e.history.length || e.updatedAt < e.createdAt) throw Error("Invalid visit history.");
			if (Ll.parse(JSON.parse(e.creationFingerprint)).operationId !== e.operationId || e.history[0].action !== "Planned" || e.history[0].actorId !== e.ownerId || e.history[0].at !== e.createdAt) throw Error("Visit creation fingerprint is inconsistent.");
			if (!!e.checkInAt != !!e.checkInBy || !!e.checkOutAt != !!e.checkOutBy || e.checkInAt && e.checkInAt < e.createdAt || e.checkOutAt && (!e.checkInAt || e.checkOutAt < e.checkInAt)) throw Error("Invalid visit check-in/out history.");
			if (e.status === "Planned" && (e.checkInAt || e.checkOutAt) || e.status === "Checked in" && (!e.checkInAt || e.checkOutAt) || e.status === "Completed" && (!e.checkInAt || !e.checkOutAt || !e.outcome || !e.completionFingerprint) || e.status !== "Completed" && (e.checkOutAt || e.outcome || e.followupTaskId || e.completionFingerprint)) throw Error("Visit state is inconsistent.");
			if (e.status === "Completed") {
				let t = u({
					outcome: Pl,
					followup: Rl.optional()
				}).strict().parse(JSON.parse(e.completionFingerprint));
				if (t.outcome !== e.outcome || !!t.followup != !!e.followupTaskId) throw Error("Visit completion fingerprint is inconsistent.");
			}
			if (e.followupTaskId && !r.workspace_tasks.records.some((t) => t.id === e.followupTaskId && t.customerId === e.customerId)) throw Error("Visit follow-up task is missing or belongs to another customer.");
		}
	}
});
//#endregion
//#region src/features/direct-documents/managedDocumentRepository.ts
var Z = t().trim().min(1).max(200), eu = t().trim().max(2e3).optional(), tu = u({
	requestedArea: o().finite().positive().max(1e9).optional(),
	productId: Z,
	unitId: Z,
	quantity: o().positive().finite(),
	unitPrice: o().nonnegative().finite().optional(),
	priceBasis: s(["Inclusive", "Exclusive"]).optional()
}).strict(), nu = u({
	description: t().trim().min(1).max(500),
	accountId: Z,
	quantity: o().positive().finite(),
	unitCost: o().nonnegative().finite(),
	taxCode: Z,
	priceBasis: s(["Inclusive", "Exclusive"]).optional()
}).strict(), ru = u({
	kind: s(["ORDER", "INVOICE"]),
	customerId: Z,
	locationId: Z.or(a("")).optional(),
	accountingContactId: Z.or(a("")).optional(),
	documentDate: Z,
	dueDate: Z.optional(),
	customerReference: eu,
	notes: eu,
	lines: l(tu).min(1).max(500)
}).strict(), iu = u({
	kind: a("EXPENSE"),
	supplierId: Z,
	supplierInvoiceNumber: Z,
	documentDate: Z,
	dueDate: Z,
	notes: eu,
	lines: l(nu).min(1).max(500)
}).strict(), au = (e) => p([ru, iu]).parse(e), ou = o().finite().nonnegative().refine((e) => Number.isSafeInteger(Math.round(e * 100)) && e === Math.round(e * 100) / 100, "Use an amount in whole cents within the supported range."), su = u({
	operationId: Z,
	sourceName: t().trim().max(200),
	reviewed: r(),
	declared: u({
		subtotal: ou,
		taxAmount: ou,
		total: ou
	}).strict(),
	payload: iu.extend({ notes: t().trim().max(1e3).optional() })
}).strict();
function cu(e) {
	return {
		...e.payload,
		notes: [
			e.payload.notes,
			`Reviewed source: ${e.sourceName || "Manual entry"}`,
			`Declared net / tax / total: ${e.declared.subtotal.toFixed(2)} / ${e.declared.taxAmount.toFixed(2)} / ${e.declared.total.toFixed(2)}`
		].filter(Boolean).join("\n")
	};
}
function lu(e) {
	let t = Xe.getById(e.payload.supplierId);
	if (!t || t.status !== "ACTIVE") throw Error("Select an active supplier.");
	let n = xu(e.payload), r = e.payload.supplierInvoiceNumber.trim().toLowerCase(), i = sc.getAll(), a = new Set(i.filter((e) => e.status === "VOID").map((e) => e.id)), o = [...fu.filter((t) => t.operationId !== e.operationId && t.status !== "CANCELLED" && !(t.status === "POSTED" && t.documentId && a.has(t.documentId)) && t.payload.kind === "EXPENSE" && t.payload.supplierId === e.payload.supplierId && t.payload.supplierInvoiceNumber.trim().toLowerCase() === r).map((e) => ({
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
var uu = () => N.getAll().filter((e) => e.active && e.type === "EXPENSE" && e.allowManualPosting && (!e.systemRole || e.systemRole === "OPERATING_EXPENSE" || e.systemRole === "FREIGHT")).map((e) => ({
	id: e.id,
	code: e.code,
	name: e.name
}));
uu();
var du = [], fu = [], pu = 0, mu = /* @__PURE__ */ new Set(), hu = () => {
	pu++, mu.forEach((e) => e());
}, gu = (e) => Math.round((e + 2 ** -52) * 100) / 100;
function _u(e, t) {
	return {
		action: e,
		actorId: S.current()?.userId ?? "local-test",
		at: (/* @__PURE__ */ new Date()).toISOString(),
		...t ? { reason: t } : {}
	};
}
function vu(e) {
	for (let t of e) if (t.taxAmount) for (let [e, n] of [[t.taxCollectedAccountId, "LIABILITY"], [t.taxPaidAccountId, "ASSET"]]) {
		if (!e) continue;
		let t = N.requireById(e);
		if (!t.active || t.type !== n) throw Error("A snapshotted tax posting account is no longer active or has the wrong type.");
	}
}
function yu(e) {
	let t = N.requireById(e);
	if (!t.active || t.type !== "EXPENSE" || !t.allowManualPosting || t.systemRole && t.systemRole !== "OPERATING_EXPENSE" && t.systemRole !== "FREIGHT") throw Error("Use an active manual expense account, not an inventory, GRNI or control account.");
	return t;
}
function bu(e) {
	let t = e.payload;
	if (t.kind === "EXPENSE") {
		let n = Xe.getById(t.supplierId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active supplier.");
		for (let t of e.lines) yu(t.expenseAccountId);
	} else {
		let n = E.getById(t.customerId);
		if (!n || n.status !== "ACTIVE") throw Error("Select an active customer.");
		for (let t of e.lines) Ei(t.productId, t.unitId, t.quantity, "sell");
	}
	vu(e.lines);
}
function xu(e) {
	if (b(e.documentDate, "Document date"), e.dueDate && (b(e.dueDate, "Due date"), e.dueDate < e.documentDate)) throw Error("Due date cannot precede document date.");
	if (e.kind !== "ORDER" && !e.dueDate) throw Error("Due date is required.");
	let t = e.kind === "EXPENSE" ? e.lines.map((e) => {
		yu(e.accountId);
		let t = te(e.taxCode), n = g(e.unitCost, t.taxRate, e.priceBasis), r = gu(e.quantity * n), i = (e.priceBasis ?? h().basis) === "Inclusive" ? gu(e.quantity * e.unitCost - r) : gu(r * t.taxRate);
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
			lineTotal: gu(r + i)
		};
	}) : e.lines.map((t) => Ja({
		customerId: e.customerId,
		documentDate: e.documentDate,
		draft: t
	})), n = qa(t);
	if (n.total <= 0 || !Number.isFinite(n.total)) throw Error("Document total must be finite and greater than zero.");
	return {
		lines: t,
		totals: n
	};
}
function Su(e) {
	let t = () => e === "sales" ? du : fu;
	function n(t) {
		return e === "sales" ? du = [...du.filter((e) => e.id !== t.id), t] : fu = [...fu.filter((e) => e.id !== t.id), t], hu(), t;
	}
	let r = (e) => {
		let n = t().find((t) => t.id === e);
		if (!n) throw Error("Draft not found.");
		return n;
	};
	function i(e, t) {
		if (e.revision !== t) throw Error("Draft changed. Reload before editing or approving.");
	}
	function a(e, t, r = {}, i) {
		return n({
			...e,
			...r,
			revision: e.revision + 1,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			history: [...e.history, _u(t, i)]
		});
	}
	let s = (e, t) => wu.save({
		operationId: e,
		payload: t
	});
	return {
		getAll: t,
		reviewCapture(t) {
			if (S.require("purchases.bill"), e !== "expense") throw Error("Capture is only available for expense bills.");
			return lu(su.parse(t));
		},
		capture(n) {
			if (S.require("purchases.bill"), e !== "expense") throw Error("Capture is only available for expense bills.");
			let r = su.parse(n);
			if (!r.reviewed) throw Error("Confirm that the supplier document has been reviewed.");
			let i = cu(r);
			if (t().find((e) => e.operationId === r.operationId)) return s(r.operationId, i);
			let a = lu(r);
			if (!a.matches) throw Error(a.issues.join(" "));
			return s(r.operationId, i);
		},
		save(a) {
			let s = u({
				operationId: Z,
				id: Z.optional(),
				expectedRevision: o().int().positive().optional(),
				payload: e === "sales" ? ru : iu
			}).strict().parse(a), c = JSON.stringify(s.payload);
			if (!s.id) {
				let e = t().find((e) => e.operationId === s.operationId);
				if (e) {
					if (e.creationFingerprint !== c) throw Error("Operation ID was used for different draft data.");
					return e;
				}
			}
			let l = s.id ? r(s.id) : void 0;
			if (l && (i(l, s.expectedRevision ?? -1), l.status !== "DRAFT")) throw Error("Only unapproved drafts can be edited. Reopen an approved draft before editing.");
			let d = xu(s.payload), f = (/* @__PURE__ */ new Date()).toISOString(), p = {
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
						quantity: d.lines[t].quantity
					}))
				},
				recipient: s.payload.kind === "EXPENSE" ? void 0 : wi(s.payload.customerId, s.payload),
				...d,
				createdAt: l?.createdAt ?? f,
				updatedAt: f,
				history: [...l?.history ?? [], _u(l ? "Edited" : "Created")]
			};
			if (l && l.kind !== p.kind) throw Error("Document kind cannot change.");
			return bu(p), n(p);
		},
		approve(e, t) {
			let n = r(e);
			if (n.status === "APPROVED" && n.revision === t + 1) return n;
			if (i(n, t), n.status !== "DRAFT") throw Error("Only a draft can be approved.");
			return bu(n), a(n, "Approved", { status: "APPROVED" });
		},
		reopen(e, t, n) {
			let o = r(e);
			if (i(o, t), o.status !== "APPROVED" || n.trim().length < 3) throw Error("Only approved drafts can be reopened with a reason.");
			return a(o, "Reopened", { status: "DRAFT" }, n);
		},
		cancel(e, t, n) {
			let o = r(e);
			if (i(o, t), o.status === "POSTED" || o.status === "CANCELLED" || n.trim().length < 3) throw Error("Only unposted drafts can be cancelled with a reason.");
			return a(o, "Cancelled", { status: "CANCELLED" }, n);
		},
		post(e, t) {
			let n = r(e);
			if (n.status === "POSTED") return n;
			if (i(n, t), n.status !== "APPROVED") throw Error("Approve the draft before posting.");
			L(), Jn(n.payload.documentDate), bu(n);
			let o, s = n.payload;
			if (s.kind === "EXPENSE") {
				let e = Xe.getById(s.supplierId), t = (/* @__PURE__ */ new Date()).toISOString(), r = {
					id: crypto.randomUUID(),
					managedDraftId: n.id,
					kind: "EXPENSE",
					billNumber: ce("BILL", sc.getAll().map((e) => e.billNumber), s.documentDate.slice(0, 4)),
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
				sc.insertExpenseBill(r);
				let i = r.lines.filter((e) => e.lineSubtotal !== 0).map((e) => ({
					accountId: e.expenseAccountId,
					description: e.description,
					debit: e.lineSubtotal,
					credit: 0
				}));
				P.post({
					journalDate: r.billDate,
					description: "Expense bill " + r.billNumber,
					reference: r.supplierInvoiceNumber,
					sourceType: "SUPPLIER_BILL",
					sourceId: r.id,
					lines: [
						...i,
						...io(r.lines, "paid", !0, r.totals.taxAmount),
						{
							accountId: N.requireBySystemRole("ACCOUNTS_PAYABLE").id,
							debit: 0,
							credit: r.totals.total
						}
					]
				}), o = r.id;
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
				o = s.kind === "ORDER" ? H.createManagedOrder(e).id : H.createManagedInvoice({
					...e,
					dueDate: s.dueDate
				}).id;
			}
			return a(n, "Posted", {
				status: "POSTED",
				documentId: o
			});
		},
		cancelOrder(e, t) {
			let n = r(e);
			if (n.kind !== "ORDER" || n.status !== "POSTED") throw Error("A confirmed managed order is required.");
			return H.cancelManagedOrder(n.documentId, t), a(n, "Order cancelled", {}, t);
		}
	};
}
var Cu = Su("sales"), wu = Su("expense"), Tu = u({
	recipient: u({
		locationId: t().optional(),
		locationName: t().optional(),
		deliveryAddress: t().optional(),
		accountingContactId: t().optional(),
		accountingContactName: t().optional(),
		accountingEmail: t().email().optional()
	}).strict().optional(),
	id: Z,
	operationId: Z,
	creationFingerprint: t().max(1e6),
	revision: o().int().positive(),
	kind: s([
		"ORDER",
		"INVOICE",
		"EXPENSE"
	]),
	status: s([
		"DRAFT",
		"APPROVED",
		"POSTED",
		"CANCELLED"
	]),
	payload: p([ru, iu]),
	lines: l(u({
		id: Z,
		description: t().min(1),
		quantity: o().finite().positive(),
		unitSymbol: t().min(1),
		unitPrice: o().finite().nonnegative().optional(),
		unitCost: o().finite().nonnegative().optional(),
		taxRate: o().finite().min(0).max(1),
		taxCode: Z,
		taxPaidAccountId: Z.optional(),
		taxCollectedAccountId: Z.optional(),
		lineSubtotal: o().finite().nonnegative(),
		taxAmount: o().finite().nonnegative(),
		lineTotal: o().finite().nonnegative()
	}).passthrough()).min(1),
	totals: u({
		subtotal: o().finite(),
		taxAmount: o().finite(),
		total: o().finite()
	}),
	documentId: Z.optional(),
	createdAt: Z,
	updatedAt: Z,
	history: l(u({
		action: Z,
		actorId: Z,
		at: Z,
		reason: t().optional()
	}).strict()).min(1)
}).strict();
for (let e of ["sales", "expense"]) _(e === "sales" ? "managedSalesDocuments" : "expenseBillDrafts", {
	repository: e === "sales" ? Cu : wu,
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
	snapshot: () => e === "sales" ? { drafts: du } : {
		drafts: fu,
		options: uu()
	},
	restore: (t) => {
		e === "sales" ? du = t.drafts : (fu = t.drafts, t.options);
	},
	publish: hu,
	validate: (t, n) => {
		let { drafts: r } = u({
			drafts: l(Tu),
			...e === "expense" ? { options: l(u({
				id: Z,
				code: Z,
				name: Z
			}).strict()) } : {}
		}).strict().parse(t);
		for (let t of r) {
			if (Ti(t.recipient), t.kind !== t.payload.kind || e === "expense" != (t.kind === "EXPENSE")) throw Error("Draft kind mismatch.");
			if (b(t.payload.documentDate), t.payload.dueDate && (b(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate)) throw Error("Draft due date is invalid.");
			let r = n, i = t.payload.kind === "EXPENSE" ? t.payload.supplierId : t.payload.customerId;
			if (!(t.payload.kind === "EXPENSE" ? r.suppliers.suppliers : r.customers.customers).some((e) => e.id === i) || t.lines.length !== t.payload.lines.length) throw Error("Draft party or line references are invalid.");
			for (let [e, n] of t.lines.entries()) {
				let i = t.payload.lines[e], a = n;
				if (t.kind !== "EXPENSE" && (Ci(a), rt(a, r.products.products.find((e) => e.id === a.productId)), a.requestedArea !== i.requestedArea)) throw Error("Draft area requirement mismatch.");
				if (typeof a.quantity != "number" || !Number.isFinite(a.quantity) || a.quantity <= 0 || i.requestedArea === void 0 && a.quantity !== i.quantity || gu(a.lineSubtotal + a.taxAmount) !== a.lineTotal) throw Error("Draft line amounts are invalid.");
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
				if (gu(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Draft totals do not match lines.");
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
var Eu = [
	"Weekly",
	"Fortnightly",
	"Monthly",
	"Quarterly"
];
function Du(e, t, n) {
	if (b(e), !Number.isSafeInteger(n) || n < 0 || !Eu.includes(t)) throw Error("Invalid schedule occurrence.");
	let r = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	if (t === "Weekly" || t === "Fortnightly") r.setUTCDate(r.getUTCDate() + n * (t === "Weekly" ? 7 : 14));
	else {
		let e = r.getUTCDate();
		r.setUTCDate(1), r.setUTCMonth(r.getUTCMonth() + n * (t === "Monthly" ? 1 : 3));
		let i = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
		r.setUTCDate(Math.min(e, i));
	}
	let i = r.toISOString().slice(0, 10);
	return b(i), i;
}
function Ou(e, t) {
	b(e);
	let n = /* @__PURE__ */ new Date(e + "T00:00:00Z");
	n.setUTCDate(n.getUTCDate() + t);
	let r = n.toISOString().slice(0, 10);
	return b(r), r;
}
//#endregion
//#region src/features/recurring/recurringRepository.ts
var ku = t().trim().min(1).max(200), Au = t().refine((e) => {
	try {
		return b(e), !0;
	} catch {
		return !1;
	}
}, "Use a valid YYYY-MM-DD date."), ju = u({
	operationId: ku,
	name: ku,
	sourceDraftId: ku,
	frequency: s(Eu),
	firstDate: Au,
	endDate: Au
}).strict(), Mu = u({
	id: ku,
	expectedRevision: o().int().positive(),
	name: ku,
	endDate: Au
}).strict(), Nu = t().refine((e) => Number.isFinite(Date.parse(e)), "Invalid timestamp."), Pu = u({
	id: ku,
	name: ku,
	kind: s(["INVOICE", "EXPENSE"]),
	status: s([
		"Active",
		"Paused",
		"Ended"
	]),
	revision: o().int().positive(),
	operationId: ku,
	creationFingerprint: t().min(1).max(2e3),
	sourceDraftId: ku,
	payload: i(),
	frequency: s(Eu),
	firstDate: Au,
	nextDate: Au,
	endDate: Au,
	occurrence: o().int().nonnegative(),
	termsDays: o().int().nonnegative(),
	createdAt: Nu,
	updatedAt: Nu
}).strict(), Fu = u({
	id: ku,
	scheduleId: ku,
	date: Au,
	draftId: ku,
	actorId: ku,
	createdAt: Nu
}).strict(), Iu = 0, Lu = /* @__PURE__ */ new Set(), Ru = () => {
	Iu++, Lu.forEach((e) => e());
}, zu = {
	INVOICE: {
		schedules: [],
		runs: []
	},
	EXPENSE: {
		schedules: [],
		runs: []
	}
}, Bu = (e) => e === "INVOICE" ? "sales.manage" : "purchases.bill", Vu = (e) => e === "INVOICE" ? Cu : wu, Hu = () => (/* @__PURE__ */ new Date()).toISOString();
function Uu(e) {
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
function Wu(e) {
	let t = () => zu[e], n = (e) => {
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
			S.require(Bu(e));
			let r = ju.parse(n), i = JSON.stringify(r), a = t().schedules.find((e) => e.operationId === r.operationId);
			if (a) {
				if (a.creationFingerprint !== i) throw Error("Operation ID was used for a different recurring template.");
				return a;
			}
			let o = Vu(e).getAll().find((e) => e.id === r.sourceDraftId);
			if (!o || o.kind !== e || o.status === "CANCELLED") throw Error("Select an existing invoice or expense entry draft of the correct type.");
			if (r.endDate < r.firstDate) throw Error("End date must not precede first generation date.");
			let s = Uu(o), c = Math.round((Date.parse(s.dueDate + "T00:00:00Z") - Date.parse(s.documentDate + "T00:00:00Z")) / 864e5), l = Hu(), u = {
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
			return t().schedules = [...t().schedules, u], Ru(), u;
		},
		update(i) {
			S.require(Bu(e));
			let a = Mu.parse(i), o = n(a.id);
			if (r(o, a.expectedRevision), a.endDate < o.firstDate || o.occurrence && a.endDate < t().runs.filter((e) => e.scheduleId === o.id).map((e) => e.date).sort().at(-1)) throw Error("End date cannot precede the schedule start or its last generated occurrence.");
			let s = {
				...o,
				name: a.name,
				endDate: a.endDate,
				status: o.nextDate > a.endDate ? "Ended" : o.status === "Ended" ? "Paused" : o.status,
				revision: o.revision + 1,
				updatedAt: Hu()
			};
			return t().schedules = t().schedules.map((e) => e.id === o.id ? s : e), Ru(), s;
		},
		setStatus(i) {
			S.require(Bu(e));
			let a = u({
				id: ku,
				expectedRevision: o().int().positive(),
				status: s(["Active", "Paused"])
			}).strict().parse(i), c = n(a.id);
			if (r(c, a.expectedRevision), c.nextDate > c.endDate) throw Error("Extend the end date before resuming this ended schedule.");
			let l = {
				...c,
				status: a.status,
				revision: c.revision + 1,
				updatedAt: Hu()
			};
			return t().schedules = t().schedules.map((e) => e.id === c.id ? l : e), Ru(), l;
		},
		generate(i) {
			S.require(Bu(e));
			let a = u({
				id: ku,
				expectedRevision: o().int().positive(),
				date: Au
			}).strict().parse(i), s = n(a.id), c = t().runs.find((e) => e.scheduleId === s.id && e.date === a.date);
			if (c) return {
				schedule: s,
				run: c,
				draft: Vu(e).getAll().find((e) => e.id === c.draftId)
			};
			if (r(s, a.expectedRevision), s.status !== "Active") throw Error("Activate the schedule before generating.");
			if (a.date !== s.nextDate) throw Error("Generate the next occurrence in order.");
			if (a.date > v(Hu())) throw Error("This occurrence is not due yet.");
			if (a.date > s.endDate) throw Error("The schedule has ended.");
			let l = Du(s.firstDate, s.frequency, s.occurrence + 1), d = structuredClone(s.payload);
			d.documentDate = a.date, d.dueDate = Ou(a.date, s.termsDays), d.kind === "EXPENSE" && (d.supplierInvoiceNumber = d.supplierInvoiceNumber.slice(0, 170) + " [" + a.date + "]");
			let f = Vu(e).save({
				operationId: "recurring:" + s.id + ":" + a.date,
				payload: d
			}), p = Hu(), m = {
				id: crypto.randomUUID(),
				scheduleId: s.id,
				date: a.date,
				draftId: f.id,
				actorId: S.current().userId,
				createdAt: p
			}, h = {
				...s,
				nextDate: l,
				occurrence: s.occurrence + 1,
				status: l > s.endDate ? "Ended" : "Active",
				revision: s.revision + 1,
				updatedAt: p
			};
			return t().schedules = t().schedules.map((e) => e.id === s.id ? h : e), t().runs = [...t().runs, m], Ru(), {
				schedule: h,
				run: m,
				draft: f
			};
		}
	};
}
var Gu = Wu("INVOICE"), Ku = Wu("EXPENSE");
for (let e of ["INVOICE", "EXPENSE"]) _(e === "INVOICE" ? "recurringInvoices" : "recurringExpenses", {
	repository: e === "INVOICE" ? Gu : Ku,
	read: e === "INVOICE" ? "sales.read" : "purchases.read",
	commands: {
		create: Bu(e),
		update: Bu(e),
		setStatus: Bu(e),
		generate: Bu(e)
	},
	snapshot: () => structuredClone(zu[e]),
	restore: (t) => {
		zu[e] = t;
	},
	publish: Ru,
	validate: (t, n) => {
		u({
			schedules: l(Pu),
			runs: l(Fu)
		}).strict().parse(t);
		let r = t, i = n;
		for (let t of r.schedules) {
			if (t.kind !== e || ![
				"Active",
				"Paused",
				"Ended"
			].includes(t.status) || !Number.isSafeInteger(t.revision) || t.revision < 1 || !Number.isSafeInteger(t.occurrence) || t.occurrence < 0 || !Number.isInteger(t.termsDays) || t.termsDays < 0 || t.payload.kind !== e) throw Error("Invalid recurring schedule.");
			if (ju.parse({
				operationId: t.operationId,
				name: t.name,
				sourceDraftId: t.sourceDraftId,
				frequency: t.frequency,
				firstDate: t.firstDate,
				endDate: t.endDate
			}), au(t.payload), !t.id || !t.creationFingerprint || !Number.isFinite(Date.parse(t.createdAt)) || !Number.isFinite(Date.parse(t.updatedAt))) throw Error("Invalid recurring identity or audit timestamps.");
			if (b(t.payload.documentDate), b(t.payload.dueDate), t.payload.dueDate < t.payload.documentDate || t.termsDays !== Math.round((Date.parse(t.payload.dueDate + "T00:00:00Z") - Date.parse(t.payload.documentDate + "T00:00:00Z")) / 864e5)) throw Error("Invalid recurring payment terms.");
			if (t.payload.kind === "EXPENSE") {
				if (!i.suppliers.suppliers.some((e) => e.id === t.payload.supplierId) || t.payload.lines.some((e) => !i.accounts.accounts.some((t) => t.id === e.accountId && t.type === "EXPENSE"))) throw Error("Recurring expense references are invalid.");
			} else if (!i.customers.customers.some((e) => e.id === t.payload.customerId) || t.payload.lines.some((e) => !i.products.products.some((t) => t.id === e.productId && t.units.some((t) => t.id === e.unitId)))) throw Error("Recurring invoice references are invalid.");
			if (t.status === "Ended" != t.nextDate > t.endDate) throw Error("Recurring end status is inconsistent.");
			if (t.nextDate !== Du(t.firstDate, t.frequency, t.occurrence) || t.endDate < t.firstDate) throw Error("Invalid recurring dates.");
			let n = (e === "INVOICE" ? i.managedSalesDocuments : i.expenseBillDrafts).drafts.find((e) => e.id === t.sourceDraftId);
			if (!n || n.kind !== e) throw Error("Recurring template source is missing.");
			let a = r.runs.filter((e) => e.scheduleId === t.id);
			if (a.length !== t.occurrence || new Set(a.map((e) => e.date)).size !== a.length) throw Error("Recurring run history does not match schedule.");
			for (let e = 0; e < a.length; e++) if (!a.some((n) => n.date === Du(t.firstDate, t.frequency, e))) throw Error("Recurring occurrences are incomplete.");
		}
		for (let t of r.runs) {
			let n = r.schedules.find((e) => e.id === t.scheduleId), a = (e === "INVOICE" ? i.managedSalesDocuments : i.expenseBillDrafts).drafts.find((e) => e.id === t.draftId);
			if (!n || !a || a.kind !== e || a.operationId !== "recurring:" + n.id + ":" + t.date || !t.actorId || !Number.isFinite(Date.parse(t.createdAt))) throw Error("Invalid recurring generated-draft reference.");
		}
	}
});
//#endregion
//#region src/features/supplier-returns/supplierReturnRepository.ts
var Q = t().trim().min(1).max(200), qu = o().finite().positive(), Ju = o().finite().nonnegative(), Yu = u({
	operationId: Q,
	supplierBillId: Q,
	supplierCreditNumber: Q,
	returnDate: Q,
	reason: t().trim().min(3).max(2e3),
	lines: l(u({
		matchId: Q,
		quantity: qu
	}).strict()).min(1).max(500)
}).strict(), Xu = u({
	id: Q,
	matchId: Q,
	supplierBillLineId: Q,
	goodsReceiptId: Q,
	goodsReceiptLineId: Q,
	productId: Q,
	unitId: Q,
	baseUnitId: Q,
	sku: Q,
	description: t(),
	unitSymbol: Q,
	quantity: qu,
	conversionToBase: qu,
	quantityBase: qu,
	siteId: Q,
	siteName: Q,
	inventoryMovementId: Q,
	costMovementId: Q,
	unitCostBase: Ju,
	inventoryValue: Ju,
	voidInventoryMovementId: Q.optional(),
	voidCostMovementId: Q.optional()
}).strict(), Zu = u({
	id: Q,
	returnNumber: Q,
	operationId: Q,
	requestFingerprint: t().max(1e6),
	supplierBillId: Q,
	supplierBillNumber: Q,
	supplierId: Q,
	supplierName: Q,
	supplierCreditId: Q,
	returnDate: Q,
	reason: t().min(3).max(2e3),
	status: s(["POSTED", "VOID"]),
	lines: l(Xu).min(1),
	inventoryValue: Ju,
	journalId: Q.optional(),
	createdAt: Q,
	createdBy: Q,
	voidDate: Q.optional(),
	voidReason: t().optional(),
	voidedBy: Q.optional(),
	voidedAt: Q.optional()
}).strict(), Qu = [], $u = 0, ed = /* @__PURE__ */ new Set(), td = () => {
	$u++, ed.forEach((e) => e());
}, nd = (e) => Math.round(e * 1e4) / 1e4, rd = (e) => Math.round(e * 100) / 100;
function id(e, t, n) {
	if (bs.getAll().some((r) => r.siteId === t && r.productId === n && v(r.occurredAt) > e)) throw Error("Return/reversal date precedes later inventory activity at this site.");
}
function ad(e) {
	let t = sc.getById(e);
	return !t || t.status === "VOID" || t.kind === "EXPENSE" || t.openingBalanceImportId ? [] : $s.getByBill(e).filter((e) => e.status === "ACTIVE").flatMap((e) => {
		let n = t.lines.find((t) => t.id === e.supplierBillLineId), r = Vs.getById(e.goodsReceiptId), i = r?.lines.find((t) => t.id === e.goodsReceiptLineId), a = n ? st(n.productId, n.unitId) : void 0;
		if (!n || !r || !i || !a) return [];
		let o = Qu.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0);
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
_("physicalSupplierReturns", {
	repository: {
		create(e) {
			let t = Yu.parse(e), n = JSON.stringify(t), r = Qu.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.requestFingerprint !== n) throw Error("Operation ID already used with different return data.");
				return r;
			}
			L(), b(t.returnDate, "Return date"), Jn(t.returnDate);
			let i = sc.getById(t.supplierBillId);
			if (!i || i.status === "VOID" || i.kind === "EXPENSE" || i.openingBalanceImportId) throw Error("Select an active stock bill matched to received goods.");
			if (t.returnDate < i.billDate) throw Error("Return date cannot precede bill date.");
			let a = ad(i.id), o = /* @__PURE__ */ new Set(), s = t.lines.map((e) => {
				if (o.has(e.matchId)) throw Error("Select each receipt match once.");
				o.add(e.matchId);
				let n = a.find((t) => t.matchId === e.matchId);
				if (!n) throw Error("Return line must belong to an active receipt match for this bill.");
				if (nd(e.quantity) !== e.quantity || e.quantity > n.availableQuantity + 1e-8) throw Error("Return quantity exceeds the matched receipt remainder or four decimal places.");
				if (t.returnDate < n.receiptDate) throw Error("Return date cannot precede receipt date.");
				let r = D(n.productId), i = st(n.productId, n.unitId), s = as.getById(n.siteId);
				if (!r || !i || !s || s.status !== "ACTIVE") throw Error("Return product, unit or active receiving site was not found.");
				if (r.wholePacks && [
					"BOX",
					"ROLL",
					"BUCKET"
				].includes(i.code) && !Number.isInteger(e.quantity)) throw Error("Whole packs must be returned in whole quantities.");
				id(t.returnDate, s.id, r.id);
				let c = nd(e.quantity * n.conversionToBase);
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
				c.set(t, nd((c.get(t) ?? 0) + e.quantityBase));
			}
			for (let [e, t] of c) {
				let [n, r] = e.split("|");
				if ((Ps.getBalance(n, r)?.quantityOnHand ?? 0) + 1e-8 < t) throw Error("Insufficient stock at the original receiving site.");
			}
			let l = /* @__PURE__ */ new Map();
			for (let e of s) {
				let t = i.lines.find((t) => t.id === e.supplierBillLineId), n = l.get(t.id);
				l.set(t.id, {
					supplierBillLineId: t.id,
					quantity: nd((n?.quantity ?? 0) + e.quantity),
					unitCost: t.unitCost
				});
			}
			let u = crypto.randomUUID(), d = "SR-" + t.returnDate.slice(0, 4) + "-" + String(Qu.length + 1).padStart(5, "0"), f = J.createReturnCredit({
				sourceSupplierBillId: i.id,
				supplierCreditNumber: t.supplierCreditNumber,
				creditDate: t.returnDate,
				reason: t.reason,
				lines: [...l.values()]
			}, u), p = s.map((e) => {
				Ps.issue({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let n = us.create({
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
				}), r = Os({
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
			}), m = rd(p.reduce((e, t) => e + t.inventoryValue, 0)), h = m ? P.post({
				journalDate: t.returnDate,
				description: `Physical supplier return ${d}`,
				reference: f.creditNumber,
				sourceType: "SUPPLIER_RETURN",
				sourceId: u,
				lines: [{
					accountId: N.requireBySystemRole("PURCHASE_PRICE_VARIANCE").id,
					debit: m,
					credit: 0
				}, {
					accountId: N.requireBySystemRole("INVENTORY").id,
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
				createdBy: S.current()?.userId ?? "local-test"
			};
			return Qu = [g, ...Qu], td(), g;
		},
		reverse(e) {
			let n = u({
				returnId: Q,
				voidDate: Q,
				reason: t().trim().min(3).max(2e3)
			}).strict().parse(e), r = Qu.find((e) => e.id === n.returnId);
			if (!r) throw Error("Supplier return not found.");
			if (r.status === "VOID") return r;
			if (L(), b(n.voidDate, "Reversal date"), Jn(n.voidDate), n.voidDate < r.returnDate) throw Error("Reversal date cannot precede return date.");
			for (let e of r.lines) id(n.voidDate, e.siteId, e.productId);
			let i = J.getById(r.supplierCreditId);
			if ((i.refundEvents ?? []).some((e) => (e.reversalDate ?? e.date) > n.voidDate) || J.getAllocationsByCredit(i.id).some((e) => e.reversedAt && v(e.reversedAt) > n.voidDate)) throw Error("Reversal date precedes later credit settlement activity.");
			J.voidReturnCredit({
				supplierCreditId: r.supplierCreditId,
				reason: n.reason,
				voidDate: n.voidDate
			});
			let a = r.lines.map((e) => {
				Ps.receive({
					siteId: e.siteId,
					productId: e.productId,
					baseUnitId: e.baseUnitId,
					quantityBase: e.quantityBase
				});
				let t = us.create({
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
				}), i = ks({
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
			r.journalId && P.reverse({
				journalEntryId: r.journalId,
				reversalDate: n.voidDate,
				reason: n.reason
			});
			let o = {
				...r,
				status: "VOID",
				lines: a,
				voidDate: n.voidDate,
				voidReason: n.reason,
				voidedAt: (/* @__PURE__ */ new Date()).toISOString(),
				voidedBy: S.current()?.userId ?? "local-test"
			};
			return Qu = Qu.map((e) => e.id === r.id ? o : e), td(), o;
		}
	},
	read: "purchases.return.read",
	commands: {
		create: "purchases.return",
		reverse: "purchases.return"
	},
	snapshot: () => ({ returns: Qu }),
	restore: (e) => {
		Qu = e.returns;
	},
	publish: td,
	validate: (e, t) => {
		let n = u({ returns: l(Zu) }).strict().parse(e), r = t, i = /* @__PURE__ */ new Set();
		for (let e of n.returns) {
			b(e.returnDate), e.voidDate && b(e.voidDate);
			let t = Yu.parse(JSON.parse(e.requestFingerprint));
			if (i.has(e.operationId) || t.operationId !== e.operationId || t.supplierBillId !== e.supplierBillId || t.returnDate !== e.returnDate) throw Error("Supplier return operation mismatch.");
			i.add(e.operationId);
			let n = r.supplierBills.supplierBills.find((t) => t.id === e.supplierBillId && t.supplierId === e.supplierId), a = r.supplierCredits.supplierCredits.find((t) => t.id === e.supplierCreditId && t.physicalReturnId === e.id && t.sourceSupplierBillId === e.supplierBillId);
			if (!n || !a || e.status === "VOID" != (a.status === "VOID")) throw Error("Supplier return bill/credit reference is invalid.");
			if (rd(e.lines.reduce((e, t) => e + t.inventoryValue, 0)) !== e.inventoryValue) throw Error("Supplier return cost total is invalid.");
			for (let t of e.lines) {
				let i = r.receiptMatches.matches.find((n) => n.id === t.matchId && n.supplierBillId === e.supplierBillId && n.supplierBillLineId === t.supplierBillLineId && n.goodsReceiptId === t.goodsReceiptId && n.goodsReceiptLineId === t.goodsReceiptLineId), a = r.costMovements.movements.find((e) => e.id === t.costMovementId), o = r.inventoryMovements.movements.find((e) => e.id === t.inventoryMovementId), s = r.goodsReceipts.goodsReceipts.find((e) => e.id === t.goodsReceiptId), c = n.lines.find((e) => e.id === t.supplierBillLineId);
				if (!i || !c || c.productId !== t.productId || c.unitId !== t.unitId || s?.siteId !== t.siteId || i.productId !== t.productId || !a || !o || a.referenceType !== "SUPPLIER_RETURN" || a.referenceId !== e.id || a.inventoryMovementId !== o.id || a.siteId !== t.siteId || a.productId !== t.productId || a.unitCostBase !== t.unitCostBase || a.quantityBase !== -t.quantityBase || rd(-a.valueChange) !== rd(t.inventoryValue) || nd(t.quantity * t.conversionToBase) !== t.quantityBase || o.referenceType !== "SUPPLIER_RETURN" || o.referenceId !== e.id || o.siteId !== t.siteId || o.productId !== t.productId || o.quantityBase !== -t.quantityBase || o.transactionQuantity !== -t.quantity || v(o.occurredAt) !== e.returnDate) throw Error("Supplier return stock/cost reference is invalid.");
				if (e.status === "VOID") {
					let n = r.costMovements.movements.find((e) => e.id === t.voidCostMovementId), i = r.inventoryMovements.movements.find((e) => e.id === t.voidInventoryMovementId);
					if (!n || !i || n.inventoryMovementId !== i.id || n.referenceType !== "SUPPLIER_RETURN_VOID" || n.referenceId !== e.id || n.siteId !== t.siteId || n.productId !== t.productId || n.quantityBase !== t.quantityBase || rd(n.valueChange) !== rd(t.inventoryValue) || i.referenceType !== "SUPPLIER_RETURN_VOID" || i.quantityBase !== t.quantityBase || i.referenceId !== e.id || v(n.occurredAt) !== e.voidDate) throw Error("Supplier return reversal reference is invalid.");
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
				let n = nd(e.lines.filter((e) => e.supplierBillLineId === t).reduce((e, t) => e + t.quantity, 0));
				if (!a.lines.some((e) => e.supplierBillLineId === t && e.quantity === n)) throw Error("Supplier return linked credit quantity mismatch.");
			}
			if (e.status === "VOID" && (!e.voidDate || e.voidDate < e.returnDate || !e.voidReason || !e.voidedBy)) throw Error("Supplier return reversal metadata is invalid.");
			if (e.inventoryValue && !r.journals.journalEntries.some((t) => t.id === e.journalId && t.sourceId === e.id && t.sourceType === "SUPPLIER_RETURN" && t.totalDebit === e.inventoryValue && (e.status === "VOID" ? t.status === "REVERSED" : t.status === "POSTED"))) throw Error("Supplier return journal reference is invalid.");
		}
		for (let e of r.supplierCredits.supplierCredits) if (e.physicalReturnId && !n.returns.some((t) => t.id === e.physicalReturnId && t.supplierCreditId === e.id)) throw Error("Supplier credit physical return reference is invalid.");
		for (let e of r.receiptMatches.matches) if (nd(n.returns.filter((e) => e.status === "POSTED").flatMap((e) => e.lines).filter((t) => t.matchId === e.id).reduce((e, t) => e + t.quantityBase, 0)) > e.matchedBaseQuantity + 1e-8) throw Error("Supplier return quantities exceed the receipt match.");
	}
});
//#endregion
//#region src/features/document-output/outputRepository.ts
var od = t().min(1).max(200), sd = t().max(2e4), cd = sd.optional(), ld = [
	"QUOTE",
	"SALES_ORDER",
	"INVOICE",
	"CREDIT_NOTE"
], ud = u({
	operationId: od,
	sourceId: od,
	kind: s(ld),
	expectedUpdatedAt: od,
	templateId: od.optional()
}).strict(), dd = o().finite().nonnegative(), fd = u({
	itemType: s([
		"STOCK",
		"NON_STOCK",
		"SERVICE"
	]).optional(),
	id: od,
	sku: sd,
	description: sd,
	unitSymbol: sd,
	quantity: o().positive().finite(),
	unitPrice: dd,
	lineSubtotal: dd,
	taxAmount: dd,
	lineTotal: dd,
	taxCode: cd,
	taxRate: o().finite().min(0).max(1).optional(),
	requestedArea: o().positive().finite().optional(),
	areaPerPack: o().positive().finite().optional(),
	coveredArea: o().positive().finite().optional()
}).strict(), pd = u({
	locationId: cd,
	locationName: cd,
	deliveryAddress: cd,
	accountingContactId: cd,
	accountingContactName: cd,
	accountingEmail: cd
}).strict(), md = u({
	id: od,
	revision: od,
	name: sd,
	subject: sd,
	body: sd,
	footer: sd,
	paper: s(["A4", "Letter"])
}).strict(), hd = u({
	id: od,
	operationId: od,
	requestFingerprint: sd,
	preparedAt: od,
	preparedBy: od,
	sourceId: od,
	kind: s(ld),
	sourceUpdatedAt: od,
	documentNumber: od,
	status: od,
	documentDate: od,
	dueDate: cd,
	expiryDate: cd,
	reference: cd,
	notes: cd,
	customerId: od,
	customerName: sd,
	customerCode: sd,
	customerIdentifier: cd,
	recipient: pd.optional(),
	issuer: u({
		name: sd,
		tradingName: cd,
		identifier: cd,
		address: cd,
		email: cd,
		phone: cd,
		currency: od
	}).strict(),
	lines: l(fd).min(1),
	totals: u({
		subtotal: dd,
		taxAmount: dd,
		total: dd
	}).strict(),
	amountPaid: dd.optional(),
	amountDue: dd.optional(),
	template: md,
	subject: sd,
	body: sd
}).strict();
function gd(e, t) {
	if (e === "CREDIT_NOTE") {
		let e = R.getById(t);
		if (!e) throw Error("Credit note was not found.");
		return {
			...e,
			type: "CREDIT_NOTE",
			documentNumber: e.creditNoteNumber,
			documentDate: e.creditDate
		};
	}
	let n = H.getById(t);
	if (!n || n.type !== e) throw Error("Sales document was not found.");
	return n;
}
var _d = (e) => e === "QUOTE" ? "Quotation" : e === "INVOICE" ? "Invoice" : e === "SALES_ORDER" ? "Sales order" : "Credit note";
function vd() {
	return (y.templates ?? []).filter((e) => e.status === "Active" && [
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
var yd = [];
vd();
var bd = 0, xd = /* @__PURE__ */ new Set(), Sd = () => {
	bd++, xd.forEach((e) => e());
};
function Cd(e, t) {
	let n = t ? y.templates?.find((n) => n.id === t && n.status === "Active" && n.kind === _d(e)) : void 0;
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
var wd = [
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
function Td(e, t) {
	return e.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (e, n) => {
		if (!wd.includes(n)) throw Error(`Unsupported template token: ${n}.`);
		return t[n] ?? "";
	});
}
function Ed(e) {
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
var Dd = { prepare(e) {
	let t = ud.parse(e), n = JSON.stringify(t), r = yd.find((e) => e.operationId === t.operationId);
	if (r) {
		if (r.requestFingerprint !== n) throw Error("Operation ID was used for different output data.");
		return r;
	}
	let i = gd(t.kind, t.sourceId);
	if (i.updatedAt !== t.expectedUpdatedAt) throw Error("Source document changed. Reload before preparing output.");
	let a = E.getById(i.customerId);
	if (!a) throw Error("Source customer was not found.");
	let o = h(), s = Cd(t.kind, t.templateId), c = structuredClone(i.recipient), l = {
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
		preparedBy: S.current()?.userId ?? "local-test",
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
		lines: i.lines.map(Ed),
		totals: structuredClone(i.totals),
		amountPaid: "amountPaid" in i ? i.amountPaid : void 0,
		amountDue: "amountDue" in i ? i.amountDue : void 0,
		template: {
			...s,
			footer: Td(s.footer, l)
		},
		subject: Td(s.subject, l),
		body: Td(s.body, l)
	};
	return Od(u), yd = [u, ...yd], Sd(), u;
} };
function Od(e) {
	let t = hd.parse(e);
	if (Ti(t.recipient), !Number.isFinite(Date.parse(t.preparedAt))) throw Error("Invalid preparation timestamp.");
	let n = ud.parse(JSON.parse(t.requestFingerprint));
	if (n.operationId !== t.operationId || n.sourceId !== t.sourceId || n.kind !== t.kind || n.expectedUpdatedAt !== t.sourceUpdatedAt) throw Error("Output source metadata mismatch.");
	let r = (e) => Math.round(e * 100) / 100;
	for (let e of t.lines) if (Ci(e), r(e.lineSubtotal + e.taxAmount) !== e.lineTotal) throw Error("Invalid output line total.");
	for (let [e, n] of [
		["subtotal", "lineSubtotal"],
		["taxAmount", "taxAmount"],
		["total", "lineTotal"]
	]) if (r(t.lines.reduce((e, t) => e + t[n], 0)) !== t.totals[e]) throw Error("Invalid output totals.");
	return t;
}
_("preparedSalesOutputs", {
	repository: Dd,
	read: "sales.read",
	commands: { prepare: "documents.prepare" },
	snapshot: () => ({
		artifacts: yd,
		templates: vd()
	}),
	restore: (e) => {
		yd = e.artifacts, e.templates;
	},
	publish: Sd,
	validate: (e, t) => {
		let n = u({
			artifacts: l(hd),
			templates: l(u({
				id: od,
				name: sd,
				kind: od
			}).strict())
		}).strict().parse(e), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
		for (let e of n.artifacts) {
			if (Od(e), r.has(e.id) || i.has(e.operationId)) throw Error("Duplicate prepared output.");
			r.add(e.id), i.add(e.operationId);
			let n = t, a = e.kind === "CREDIT_NOTE" ? n.customerCredits.creditNotes.find((t) => t.id === e.sourceId) : [
				...n.sales.quotes,
				...n.sales.salesOrders,
				...n.sales.invoices
			].find((t) => t.id === e.sourceId && t.type === e.kind);
			if (!a || a.customerId !== e.customerId) throw Error("Prepared output source reference is invalid.");
		}
	}
});
//#endregion
//#region src/features/accounting/data/inventoryAccountingPostingService.ts
function kd(e) {
	return N.requireBySystemRole(e).id;
}
function Ad(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function jd(e) {
	return P.getBySource("SALES_FULFILMENT", e).find((e) => !e.reversedJournalEntryId);
}
function Md(e) {
	let t = bs.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length === 0) throw Error(`No inventory cost movements were found for sales fulfilment ${e.fulfilmentNumber}.`);
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var Nd = {
	postSalesFulfilment(e) {
		let t = jd(e.id);
		if (t) return t;
		let n = Ad(Md(e).reduce((e, t) => {
			if (t.valueChange > 0) throw Error(`Sales fulfilment cost movement ${t.costMovementNumber} has an invalid positive inventory value change.`);
			return e - t.valueChange;
		}, 0));
		if (!Number.isFinite(n) || n < 0) throw Error("Sales fulfilment COGS amount is invalid.");
		if (n !== 0) return P.post({
			journalDate: e.fulfilmentDate,
			description: `COGS for sales fulfilment ${e.fulfilmentNumber}`,
			reference: e.fulfilmentNumber,
			sourceType: "SALES_FULFILMENT",
			sourceId: e.id,
			lines: [{
				accountId: kd("COST_OF_GOODS_SOLD"),
				description: e.fulfilmentNumber,
				debit: n,
				credit: 0
			}, {
				accountId: kd("INVENTORY"),
				description: e.fulfilmentNumber,
				debit: 0,
				credit: n
			}]
		});
	},
	reverseSalesFulfilment({ fulfilment: e, reversalDate: t, reason: n }) {
		let r = jd(e.id);
		if (r) return r.status === "REVERSED" ? r.reversalJournalEntryId ? P.getById(r.reversalJournalEntryId) : void 0 : P.reverse({
			journalEntryId: r.id,
			reversalDate: t,
			reason: n
		});
	}
}, Pd = /* @__PURE__ */ new Set(), Fd = [], Id = Fd;
function Ld() {
	Id = Fd, Pd.forEach((e) => e());
}
function Rd() {
	let e = `SF-${(/* @__PURE__ */ new Date()).getFullYear()}-`, t = Fd.filter((t) => t.fulfilmentNumber.startsWith(e)).map((t) => Number.parseInt(t.fulfilmentNumber.slice(e.length), 10)).filter(Number.isFinite), n = Math.max(0, ...t) + 1;
	return `${e}${String(n).padStart(5, "0")}`;
}
function zd(e, t) {
	return W(Fd.filter((t) => t.salesOrderId === e && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t).reduce((e, t) => e + t.fulfilledQuantity, 0));
}
function Bd(e) {
	let t = H.getById(e);
	if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
	let n = t.lines.filter(nt).map((e) => zd(t.id, e.id)), r = n.some((e) => e > 0), i = t.lines.filter(nt).every((e, t) => n[t] >= W(e.quantity));
	H.setFulfilmentStatus(t.id, i ? "FULFILLED" : r ? "PARTIALLY_FULFILLED" : "CONFIRMED");
}
function Vd(e) {
	let t = bs.getByReference("SALE", e.id).filter((e) => e.movementType === "ISSUE");
	if (t.length !== e.lines.length) throw Error(`Inventory costing for sales fulfilment ${e.fulfilmentNumber} is incomplete.`);
	return t;
}
var Hd = {
	subscribe(e) {
		return Pd.add(e), () => {
			Pd.delete(e);
		};
	},
	getSnapshot() {
		return Id;
	},
	getAll() {
		return Id;
	},
	getById(e) {
		return Fd.find((t) => t.id === e);
	},
	getBySalesOrder(e) {
		return Fd.filter((t) => t.salesOrderId === e);
	},
	getFulfilledQuantity: zd,
	getRemainingQuantity(e, t) {
		let n = H.getById(e);
		if (!n || n.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let r = n.lines.find((e) => e.id === t);
		if (!r) throw Error("Sales order line was not found.");
		return nt(r) ? W(r.quantity - zd(e, t)) : 0;
	},
	create(e) {
		let t = H.getById(e.salesOrderId);
		if (!t || t.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		let n = t;
		if (n.status !== "CONFIRMED" && n.status !== "PARTIALLY_FULFILLED" && n.status !== "INVOICED") throw Error("Only a confirmed or partially fulfilled sales order can be fulfilled.");
		if (n.status === "INVOICED" && !n.invoiceIds.some((e) => {
			let t = H.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("This order has no active invoice; do not fulfil a void invoice.");
		let r = as.getById(e.siteId);
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
			if (!nt(t)) throw Error("Non-stock and service lines do not require inventory dispatch.");
			let i = D(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let o = st(t.productId, t.unitId);
			if (!o) throw Error(`Unit ${t.unitSymbol} was not found.`);
			if (!o.active) throw Error(`Unit ${t.unitSymbol} is inactive.`);
			let s = W(e.fulfilledQuantity);
			if (t.areaPerPack && !Number.isInteger(e.fulfilledQuantity)) throw Error("Area-based lines must be dispatched in whole packs.");
			let c = zd(n.id, t.id);
			if (s > W(t.quantity - c)) throw Error(`Fulfilment quantity for ${t.sku} exceeds the remaining sales order quantity.`);
			let l = W(s * o.conversionToBase), u = Ps.getBalance(r.id, t.productId);
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
			s.set(e.orderLine.productId, W(t + e.fulfilledBaseQuantity));
		}
		for (let [e, t] of s) {
			let n = Ps.getBalance(r.id, e);
			if (!n || n.quantityOnHand < t) {
				let t = D(e);
				throw Error(`Insufficient stock for ${t?.sku ?? e} at ${r.name}.`);
			}
		}
		let c = (/* @__PURE__ */ new Date()).toISOString(), l = `sf_${crypto.randomUUID()}`, u = Rd(), d = o.map((e) => ({
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
			let i = D(t.productId);
			if (!i) throw Error(`Product ${t.sku} was not found.`);
			let a = us.create({
				movementType: "SALE",
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: W(-t.fulfilledBaseQuantity),
				transactionUnitId: t.unitId,
				transactionUnitSymbol: t.unitSymbol,
				transactionQuantity: W(-t.fulfilledQuantity),
				conversionToBase: t.conversionToBase,
				referenceType: "SALES_FULFILMENT",
				referenceId: f.id,
				referenceNumber: f.fulfilmentNumber,
				salesOrderId: n.id,
				salesOrderNumber: n.documentNumber,
				occurredAt: e.fulfilmentDate,
				notes: `Sales fulfilment ${f.fulfilmentNumber}`
			});
			Os({
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
			}), Ps.issue({
				siteId: r.id,
				productId: t.productId,
				baseUnitId: i.baseUnitId,
				quantityBase: t.fulfilledBaseQuantity
			});
		}
		return Nd.postSalesFulfilment(f), Fd = [f, ...Fd], Ld(), Bd(n.id), f;
	},
	void(e) {
		let t = Fd.find((t) => t.id === e.fulfilmentId);
		if (!t) throw Error("Sales fulfilment was not found.");
		if (t.status === "VOIDED") throw Error("Sales fulfilment has already been voided.");
		if (Number.isNaN(Date.parse(e.voidDate))) throw Error("Fulfilment void date is invalid.");
		if (e.voidDate < t.fulfilmentDate) throw Error("Fulfilment void date cannot be earlier than the fulfilment date.");
		let n = e.reason.trim();
		if (n.length < 3) throw Error("Fulfilment void reason must contain at least 3 characters.");
		let r = H.getById(t.salesOrderId);
		if (!r || r.type !== "SALES_ORDER") throw Error("Sales order was not found.");
		if (r.status === "INVOICED" && r.invoiceIds.some((e) => {
			let t = H.getById(e);
			return t?.type === "INVOICE" && t.status !== "VOID";
		})) throw Error("Cannot void a sales fulfilment for an invoiced sales order.");
		if (r.status !== "CONFIRMED" && r.status !== "PARTIALLY_FULFILLED" && r.status !== "FULFILLED" && r.status !== "INVOICED") throw Error(`Cannot void a sales fulfilment when the sales order status is ${r.status}.`);
		let i = Vd(t), a = /* @__PURE__ */ new Set(), o = t.lines.map((e) => {
			let n = D(e.productId);
			if (!n) throw Error(`Product ${e.sku} was not found.`);
			let r = i.find((n) => !a.has(n.id) && n.siteId === t.siteId && n.productId === e.productId && Math.abs(n.quantityBase) === e.fulfilledBaseQuantity);
			if (!r) throw Error(`Unique original inventory cost issue for ${e.sku} was not found.`);
			return a.add(r.id), {
				line: e,
				product: n,
				originalIssue: r
			};
		});
		Nd.reverseSalesFulfilment({
			fulfilment: t,
			reversalDate: e.voidDate,
			reason: n
		});
		for (let r of o) {
			let { line: i, product: a, originalIssue: o } = r, s = us.create({
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
			ks({
				siteId: t.siteId,
				productId: i.productId,
				quantityBase: i.fulfilledBaseQuantity,
				unitCostBase: o.unitCostBase,
				inventoryValue: Ko(Math.abs(o.valueChange)),
				referenceType: "SALE",
				referenceId: t.id,
				referenceNumber: t.fulfilmentNumber,
				inventoryMovementId: s.id,
				occurredAt: e.voidDate,
				notes: `Void sales fulfilment ${t.fulfilmentNumber}: ${n}`
			}), Ps.receive({
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
		return Fd = Fd.map((e) => e.id === s.id ? s : e), Ld(), Bd(t.salesOrderId), s;
	}
};
_("fulfilments", {
	repository: Hd,
	read: "inventory.read",
	commands: {
		if: null,
		create: "inventory.adjust",
		void: "inventory.adjust"
	},
	snapshot: () => ({ fulfilments: Fd }),
	restore: (e) => {
		Fd = e.fulfilments, Id = Fd;
	},
	publish: () => Pd.forEach((e) => e())
});
//#endregion
//#region src/features/direct-documents/dispatchRepository.ts
var Ud = t().trim().min(1).max(200), Wd = u({
	operationId: Ud,
	salesOrderId: Ud,
	siteId: Ud,
	fulfilmentDate: Ud,
	lines: l(u({
		salesOrderLineId: Ud,
		fulfilledQuantity: o().positive().finite()
	}).strict()).min(1).max(500)
}).strict();
function Gd() {
	return H.getAll().filter((e) => e.type === "SALES_ORDER" && [
		"CONFIRMED",
		"PARTIALLY_FULFILLED",
		"INVOICED"
	].includes(e.status)).filter((e) => e.type === "SALES_ORDER" && (e.status !== "INVOICED" || e.invoiceIds.some((e) => {
		let t = H.getById(e);
		return t?.type === "INVOICE" && t.status !== "VOID";
	}))).map((e) => ({
		id: e.id,
		number: e.documentNumber,
		date: e.documentDate,
		delivery: e.recipient?.deliveryAddress,
		store: e.recipient?.locationName,
		lines: e.lines.filter(nt).map((t) => ({
			id: t.id,
			sku: t.sku,
			description: t.description,
			unit: t.unitSymbol,
			quantity: t.quantity,
			fulfilled: Hd.getAll().filter((t) => t.salesOrderId === e.id && t.status === "ACTIVE").flatMap((e) => e.lines).filter((e) => e.salesOrderLineId === t.id).reduce((e, t) => e + t.fulfilledQuantity, 0)
		}))
	})).filter((e) => e.lines.length > 0);
}
Gd();
var Kd = [], qd = 0, Jd = /* @__PURE__ */ new Set(), Yd = () => {
	qd++, Jd.forEach((e) => e());
};
_("salesDispatch", {
	repository: {
		record(e) {
			let t = Wd.parse(e), n = JSON.stringify(t), r = Kd.find((e) => e.id === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Dispatch operation ID was already used with different data.");
				return Hd.getAll().find((e) => e.id === r.fulfilmentId);
			}
			if (L(), b(t.fulfilmentDate), Jn(t.fulfilmentDate), new Set(t.lines.map((e) => e.salesOrderLineId)).size !== t.lines.length) throw Error("Each dispatch line must be selected only once.");
			let i = Hd.create(t);
			return Kd = [...Kd, {
				id: t.operationId,
				fingerprint: n,
				fulfilmentId: i.id
			}], Yd(), i;
		},
		reverse(e) {
			let n = u({
				fulfilmentId: Ud,
				voidDate: Ud,
				reason: t().trim().min(3).max(1e3)
			}).strict().parse(e);
			L(), b(n.voidDate), Jn(n.voidDate);
			let r = Hd.getAll().find((e) => e.id === n.fulfilmentId);
			return r?.status === "VOIDED" ? r : Hd.void(n);
		}
	},
	read: "inventory.read",
	commands: {
		record: "inventory.adjust",
		reverse: "inventory.adjust"
	},
	snapshot: () => ({
		orders: Gd(),
		requests: Kd
	}),
	restore: (e) => {
		e.orders, Kd = e.requests;
	},
	publish: Yd,
	validate: (e, n) => {
		let r = u({
			orders: l(u({
				id: Ud,
				number: Ud,
				date: Ud,
				delivery: t().optional(),
				store: t().optional(),
				lines: l(u({
					id: Ud,
					sku: t(),
					description: t(),
					unit: t(),
					quantity: o().finite().positive(),
					fulfilled: o().finite().nonnegative()
				}).strict())
			}).strict()),
			requests: l(u({
				id: Ud,
				fingerprint: t().max(1e6),
				fulfilmentId: Ud
			}).strict())
		}).strict().parse(e), i = n.fulfilments.fulfilments;
		if (r.requests.some((e) => !i.some((t) => t.id === e.fulfilmentId))) throw Error("Dispatch result reference is invalid.");
	}
});
//#endregion
//#region src/features/banking/data/bankReconciliationService.ts
function Xd(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Zd(e, t, n) {
	let r = new Set(n), i = 0, a = 0, o = 0, s = 0;
	for (let t of e.transactions) {
		if (r.has(t.id)) {
			i = Xd(i + t.moneyIn), a = Xd(a + t.moneyOut);
			continue;
		}
		o = Xd(o + t.moneyIn), s = Xd(s + t.moneyOut);
	}
	let c = Xd(Xd(t) + o - s), l = Xd(e.closingBalance), u = Xd(c - l);
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
var Qd = /* @__PURE__ */ new Set(), $d = j.read().reconciliations;
j.onRollback(() => {
	$d = j.read().reconciliations;
});
function ef() {
	j.update("reconciliations", $d), Qd.forEach((e) => j.notify(e));
}
function tf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function nf(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Statement date must use YYYY-MM-DD format.");
}
function rf() {
	return `bankrec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function af(e) {
	return `BREC-${e.slice(0, 4)}-${String($d.length + 1).padStart(4, "0")}`;
}
function of(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of $d) if (n.bankAccountId === e) for (let e of n.clearedTransactionIds) t.add(e);
	return t;
}
var sf = {
	subscribe(e) {
		return Qd.add(e), () => {
			Qd.delete(e);
		};
	},
	getSnapshot() {
		return $d;
	},
	getAll() {
		return $d;
	},
	getByBankAccount(e) {
		return $d.filter((t) => t.bankAccountId === e).sort((e, t) => t.statementDate.localeCompare(e.statementDate));
	},
	getLatestByBankAccount(e) {
		return this.getByBankAccount(e)[0];
	},
	getClearedTransactionIds(e) {
		return of(e);
	},
	complete(e) {
		if (nf(e.statementDate), b(e.statementDate, "Statement date"), !Number.isFinite(e.statementBalance)) throw Error("Statement balance must be a valid amount.");
		let t = bi.requireById(e.bankAccountId);
		if (!t.active) throw Error("The selected bank account is inactive.");
		if (e.statementDate < t.openingBalanceDate) throw Error("Statement date cannot precede the bank opening balance date.");
		let n = this.getLatestByBankAccount(t.id);
		if (n && e.statementDate <= n.statementDate) throw Error(`Statement date must be after the last reconciled date ${n.statementDate}.`);
		let r = Uc(t, P.getAll(), e.statementDate), i = new Set(r.transactions.map((e) => e.id)), a = of(t.id), o = Array.from(new Set(e.clearedTransactionIds)).filter((e) => !a.has(e));
		for (let e of o) if (!i.has(e)) throw Error("A selected transaction does not belong to this bank register or statement period.");
		let s = /* @__PURE__ */ new Set([...a, ...o]), c = Zd(r, tf(e.statementBalance), Array.from(s));
		if (!c.reconciled) throw Error(`Bank reconciliation is out by ${c.difference.toFixed(2)}.`);
		let l = {
			id: rf(),
			reconciliationNumber: af(e.statementDate),
			bankAccountId: t.id,
			statementDate: e.statementDate,
			statementBalance: tf(e.statementBalance),
			bookBalance: c.bookBalance,
			outstandingDeposits: c.outstandingDeposits,
			outstandingPayments: c.outstandingPayments,
			adjustedStatementBalance: c.adjustedStatementBalance,
			difference: c.difference,
			clearedTransactionIds: o,
			status: "COMPLETED",
			reconciledAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return $d = [l, ...$d], ef(), l;
	}
}, cf = sf.complete;
sf.complete = function(e) {
	return L(), j.transaction(() => cf.call(sf, e));
}, _("bankReconciliations", {
	repository: sf,
	read: "banking.read",
	commands: {
		if: null,
		for: null,
		complete: "banking.reconcile",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ reconciliations: $d }),
	restore: (e) => {
		$d = e.reconciliations;
	},
	publish: () => Qd.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/settlementRepository.ts
var lf = (e) => Math.round((e + 2 ** -52) * 100) / 100, uf = t().trim().min(1).max(200), df = o().finite().positive().refine((e) => lf(e) === e, "Use cents precision"), ff = u({
	operationId: uf,
	customerId: uf,
	paymentDate: uf,
	bankAccountId: uf,
	reference: t().max(500).optional(),
	allocations: l(u({
		invoiceId: uf,
		amount: df
	}).strict()).min(1).max(500)
}).strict(), pf = u({
	operationId: uf,
	creditId: uf,
	paymentDate: uf,
	bankAccountId: uf,
	amount: df,
	reference: t().max(500).optional()
}).strict(), mf = [], hf = [], gf = [], _f = 0, vf = /* @__PURE__ */ new Set(), yf = () => {
	_f++, vf.forEach((e) => e());
};
function bf(e, t, n) {
	let r = JSON.stringify(n), i = e.find((e) => e.operationId === t);
	if (i && i.fingerprint !== r) throw Error("Operation ID was already used with different data.");
	return {
		old: i,
		fingerprint: r
	};
}
function xf(e, t) {
	b(t, "Payment date");
	let n = bi.requireById(e);
	if (!n.active || t < n.openingBalanceDate) throw Error("Bank is inactive or payment precedes its opening date.");
	let r = N.requireById(n.glAccountId);
	if (!r.active || r.type !== "ASSET") throw Error("Invalid bank ledger account.");
	return n;
}
function Sf(e) {
	if (sf.getAll().some((t) => t.clearedTransactionIds.some((t) => t.startsWith(e + ":")))) throw Error("A reconciled bank entry cannot be reversed here.");
}
function Cf(e, t) {
	let n = e === "customer" ? R.getById(t) : J.getById(t);
	if (!n || n.status === "VOID" || n.status === "DRAFT") throw Error("An issued credit is required.");
	return n;
}
function wf(e, t, n) {
	let r = Cf(e, t), i = lf(n.filter((e) => !e.reversalDate).reduce((e, t) => e + t.amount, 0)), a = lf(r.totals.total - r.amountApplied - i);
	if (a < 0) throw Error("Refund exceeds the unused credit.");
	let o = {
		...r,
		refundEvents: n,
		amountRefunded: i,
		amountAvailable: a,
		status: a === 0 ? "FULLY_APPLIED" : "ISSUED",
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	e === "customer" ? R.update(o) : J.update(o);
}
function Tf(e, t) {
	L();
	let n = pf.parse(t), { old: r, fingerprint: i } = bf(e === "customer" ? hf : gf, n.operationId, n);
	if (r) return r;
	let a = Cf(e, n.creditId), o = xf(n.bankAccountId, n.paymentDate);
	if (n.paymentDate < a.creditDate || n.amount > a.amountAvailable) throw Error("Refund date/amount exceeds the available credit.");
	let s = N.requireBySystemRole(e === "customer" ? "ACCOUNTS_RECEIVABLE" : "ACCOUNTS_PAYABLE"), c = crypto.randomUUID(), l = P.post({
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
	return wf(e, a.id, [...a.refundEvents ?? [], {
		id: u.id,
		date: u.paymentDate,
		amount: u.amount
	}]), e === "customer" ? hf = [...hf, u] : gf = [...gf, u], yf(), u;
}
function Ef(e, t) {
	if (L(), b(t.reversalDate, "Reversal date"), !t.reason?.trim() || t.reason.trim().length < 3) throw Error("Enter a reversal reason.");
	let n = e === "customer" ? hf : gf, r = n.find((e) => e.id === t.id);
	if (!r) throw Error("Refund was not found.");
	if (r.status === "REVERSED") return r;
	if (t.reversalDate < r.paymentDate) throw Error("Reversal cannot precede the refund.");
	Sf(r.journalEntryId), P.reverse({
		journalEntryId: r.journalEntryId,
		reversalDate: t.reversalDate,
		reason: t.reason
	});
	let i = Cf(e, r.creditId);
	wf(e, i.id, (i.refundEvents ?? []).map((e) => e.id === r.id ? {
		...e,
		reversalDate: t.reversalDate
	} : e));
	let a = {
		...r,
		status: "REVERSED",
		reversalDate: t.reversalDate
	};
	return e === "customer" ? hf = n.map((e) => e.id === r.id ? a : e) : gf = n.map((e) => e.id === r.id ? a : e), yf(), a;
}
var Df = {
	recordReceipt(e) {
		let t = ff.parse(e), { old: n, fingerprint: r } = bf(mf, t.operationId, t);
		if (n) return n;
		if (xf(t.bankAccountId, t.paymentDate), new Set(t.allocations.map((e) => e.invoiceId)).size !== t.allocations.length) throw Error("Each invoice may only be allocated once.");
		for (let e of t.allocations) {
			let n = H.getAll().find((t) => t.id === e.invoiceId && t.type === "INVOICE");
			if (!n || n.type !== "INVOICE" || n.customerId !== t.customerId || t.paymentDate < n.documentDate || ["VOID", "DRAFT"].includes(n.status) || e.amount > n.amountDue) throw Error("Invalid invoice customer, date or outstanding amount.");
		}
		let i = t.allocations.map((e, n) => H.recordInvoicePayment({
			...t,
			invoiceId: e.invoiceId,
			amount: e.amount,
			method: "BANK_TRANSFER",
			operationId: t.operationId + ":" + n
		})), a = {
			...t,
			id: crypto.randomUUID(),
			fingerprint: r,
			amount: lf(i.reduce((e, t) => e + t.amount, 0)),
			paymentIds: i.map((e) => e.id),
			status: "POSTED"
		};
		return mf = [...mf, a], yf(), a;
	},
	reverseReceipt(e) {
		let t = mf.find((t) => t.id === e.id);
		if (!t) throw Error("Receipt not found.");
		if (t.status === "REVERSED") return t;
		for (let e of t.paymentIds) {
			let t = to.getById(e);
			if (!t || t.status !== "RECEIVED") throw Error("Receipt allocations changed; inspect individual payments first.");
			for (let t of P.getBySource("CUSTOMER_PAYMENT", e)) Sf(t.id);
		}
		for (let n of t.paymentIds) H.reverseInvoicePayment(n, e.reason);
		let n = {
			...t,
			status: "REVERSED",
			reversalDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		};
		return mf = mf.map((e) => e.id === t.id ? n : e), yf(), n;
	},
	createRefund: (e) => Tf("customer", e),
	reverseRefund: (e) => Ef("customer", e)
}, Of = {
	create: (e) => Tf("supplier", e),
	reverse: (e) => Ef("supplier", e),
	repairLegacyCredits(e) {
		if (L(), b(e.date, "Repair date"), e.reason?.trim().length < 3) throw Error("Enter a repair reason.");
		let t = [];
		for (let n of J.getAll().filter((e) => e.status !== "VOID")) {
			if (e.date < n.creditDate || P.getBySource("SUPPLIER_CREDIT_RECLASS", n.id).length) continue;
			let r = P.getBySource("SUPPLIER_CREDIT", n.id).find((e) => e.status === "POSTED");
			if (!r) continue;
			let i = N.requireBySystemRole("INVENTORY"), a = N.requireBySystemRole("PURCHASE_PRICE_VARIANCE"), o = lf(r.lines.filter((e) => e.accountId === i.id).reduce((e, t) => e + t.credit - t.debit, 0));
			o <= 0 || t.push(P.post({
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
}, kf = u({
	id: uf,
	operationId: uf,
	fingerprint: uf,
	creditId: uf,
	contactId: uf,
	paymentDate: uf,
	bankAccountId: uf,
	amount: df,
	journalEntryId: uf,
	status: s(["POSTED", "REVERSED"]),
	reference: t().optional(),
	reversalDate: t().optional()
}).strict();
_("customerSettlements", {
	repository: Df,
	read: "sales.read",
	commands: {
		recordReceipt: "sales.payment",
		reverseReceipt: "sales.payment",
		createRefund: "sales.payment",
		reverseRefund: "sales.payment"
	},
	snapshot: () => ({
		receipts: mf,
		refunds: hf
	}),
	restore: (e) => {
		mf = e.receipts, hf = e.refunds;
	},
	validate: (e, n) => {
		Af(e, n, !1);
		let r = e;
		l(kf.extend({ fingerprint: t() })).parse(r.refunds), l(u({
			id: uf,
			operationId: uf,
			paymentIds: l(uf),
			amount: df,
			status: s(["POSTED", "REVERSED"])
		}).passthrough()).parse(r.receipts);
	},
	publish: yf
}), _("supplierRefunds", {
	repository: Of,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		repairLegacyCredits: "accounting.recover"
	},
	snapshot: () => ({ refunds: gf }),
	restore: (e) => {
		gf = e.refunds;
	},
	validate: (e, n) => {
		Af(e, n, !0), l(kf.extend({ fingerprint: t() })).parse(e.refunds);
	},
	publish: yf
});
function Af(e, t, n) {
	let r = e, i = t.journals.journalEntries, a = n ? t.supplierCredits.supplierCredits : t.customerCredits.creditNotes, o = t.bankAccounts.bankAccounts;
	for (let e of r.refunds) {
		let t = a.find((t) => t.id === e.creditId), r = i.find((t) => t.id === e.journalEntryId), s = t?.refundEvents?.find((t) => t.id === e.id);
		if (!t || e.contactId !== ("customerId" in t ? t.customerId : t.supplierId) || !s || s.amount !== e.amount || s.date !== e.paymentDate || s.reversalDate !== e.reversalDate || !o.some((t) => t.id === e.bankAccountId) || !r || r.sourceId !== e.id || r.sourceType !== (n ? "SUPPLIER_REFUND" : "CUSTOMER_REFUND") || r.totalDebit !== e.amount || r.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) throw Error("Refund snapshot relationships are invalid.");
	}
	for (let e of a) {
		let t = lf(r.refunds.filter((t) => t.creditId === e.id && t.status === "POSTED").reduce((e, t) => e + t.amount, 0));
		if ((e.amountRefunded ?? 0) !== t) throw Error("Credit refunded balance is invalid.");
	}
	for (let e of a) for (let t of e.refundEvents ?? []) if (!r.refunds.some((n) => n.id === t.id && n.creditId === e.id)) throw Error("Credit refund history has no settlement record.");
	if (!n) {
		let e = t.customerPayments.payments;
		for (let t of r.receipts ?? []) {
			let n = t.paymentIds.map((t) => e.find((e) => e.id === t));
			if (new Set(t.paymentIds).size !== t.paymentIds.length || !n.length || n.some((e) => !e || e.customerId !== t.customerId || e.bankAccountId !== t.bankAccountId || e.status !== (t.status === "REVERSED" ? "REVERSED" : "RECEIVED")) || lf(n.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== t.amount) throw Error("Receipt allocation snapshot relationships are invalid.");
		}
	}
}
//#endregion
//#region src/features/sales/data/invoiceBalanceAsAtService.ts
function jf(e, t, n, r) {
	if (e.status === "DRAFT" || e.status === "VOID" && !e.voidedAt || e.documentDate > r || e.voidedAt && r >= Pf(e.voidedAt)) return {
		invoiceId: e.id,
		asOfDate: r,
		invoiceTotal: Ff(e.totals.total),
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0,
		appliedPaymentCount: 0,
		appliedCreditCount: 0
	};
	let i = t.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.paymentDate <= r).filter((e) => Mf(e, r)), a = Ff(i.reduce((e, t) => e + t.amount, 0)), o = n.filter((t) => t.invoiceId === e.id && t.customerId === e.customerId && t.allocationDate <= r && Nf(t, r)), s = Ff(o.reduce((e, t) => e + t.amount, 0)), c = Ff(e.totals.total), l = Ff(Math.max(0, c - a - s));
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
function Mf(e, t) {
	return e.paymentDate > t ? !1 : e.status === "RECEIVED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Pf(e.reversedAt) : !1;
}
function Nf(e, t) {
	return e.allocationDate > t ? !1 : e.status === "APPLIED" ? !0 : e.status === "REVERSED" && e.reversedAt ? t < Pf(e.reversedAt) : !1;
}
function Pf(e) {
	return v(e);
}
function Ff(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/creditNoteBalanceAsAtService.ts
function If(e, t, n) {
	let r = zf(e.totals.total);
	if (e.status === "DRAFT" || e.creditDate > n || e.voidedAt && n >= Rf(e.voidedAt)) return Lf(e.id, n, r);
	let i = t.filter((t) => t.creditNoteId === e.id && t.customerId === e.customerId && t.allocationDate <= n && Nf(t, n)), a = zf(i.reduce((e, t) => e + t.amount, 0)), o = zf(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - a));
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
function Lf(e, t, n) {
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
function Rf(e) {
	return v(e);
}
function zf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/sales/data/accountsReceivableService.ts
function Bf(e, t, n = [], r = [], i = [], a = Uf()) {
	let o = t.filter((t) => t.type === "INVOICE" && t.customerId === e.id && t.documentDate <= a), s = {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	}, c = 0, l = 0, u = 0, d = 0;
	for (let e of o) {
		let t = jf(e, n, r, a).amountDue;
		if (t <= 0) continue;
		u += 1, c += t;
		let i = Vf(e.dueDate, a);
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
		current: Wf(s.current),
		days1To30: Wf(s.days1To30),
		days31To60: Wf(s.days31To60),
		days61To90: Wf(s.days61To90),
		days90Plus: Wf(s.days90Plus)
	}, p = Wf(c), m = Wf(l), h = Wf(i.reduce((t, n) => n.customerId === e.id ? t + If(n, r, a).amountAvailable : t, 0)), g = Wf(p - h);
	return {
		customerId: e.id,
		totalOutstanding: p,
		unallocatedCredit: h,
		netAccountBalance: g,
		overdueAmount: m,
		creditLimit: e.creditLimit,
		availableCredit: Wf(Math.max(0, e.creditLimit - Math.max(0, g))),
		aging: f,
		outstandingInvoiceCount: u,
		overdueInvoiceCount: d
	};
}
function Vf(e, t = Uf()) {
	let n = Hf(e), r = Hf(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function Hf(e) {
	let [t, n, r] = e.split("-").map(Number);
	return new Date(Date.UTC(t, n - 1, r));
}
function Uf() {
	return v((/* @__PURE__ */ new Date()).toISOString());
}
function Wf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/accounting/data/generalLedgerService.ts
function Gf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Kf(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("As-at date must use YYYY-MM-DD format.");
}
function qf(e, t, n) {
	return e.type === "ASSET" || e.type === "EXPENSE" ? Gf(t - n) : Gf(n - t);
}
function Jf(e, t, n) {
	Kf(n);
	let r = t.filter((e) => e.journalDate <= n), i = e.map((e) => {
		let t = 0, n = 0;
		for (let i of r) for (let r of i.lines) r.accountId === e.id && (t = Gf(t + r.debit), n = Gf(n + r.credit));
		return {
			account: e,
			totalDebit: t,
			totalCredit: n,
			balance: qf(e, t, n)
		};
	}).sort((e, t) => e.account.code.localeCompare(t.account.code, void 0, { numeric: !0 })), a = Gf(r.reduce((e, t) => e + t.totalDebit, 0)), o = Gf(r.reduce((e, t) => e + t.totalCredit, 0));
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
function Yf(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Xf({ customers: e, documents: t, payments: n, creditNotes: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = e.map((e) => {
		let a = t.filter((t) => t.customerId === e.id), o = n.filter((t) => t.customerId === e.id), c = r.filter((t) => t.customerId === e.id), l = Bf(e, a, o, i.filter((t) => t.customerId === e.id), c, s);
		return {
			customerId: e.id,
			customerCode: e.id,
			customerName: e.businessName,
			subledgerBalance: Yf(l.netAccountBalance)
		};
	}).filter((e) => e.subledgerBalance !== 0).sort((e, t) => e.customerCode.localeCompare(t.customerCode, void 0, { numeric: !0 })), l = Yf(c.reduce((e, t) => e + t.subledgerBalance, 0)), u = a.find((e) => e.systemRole === "ACCOUNTS_RECEIVABLE");
	if (!u) throw Error("Accounts Receivable control account was not found.");
	let d = Yf(Jf(a, o, s).accountBalances.find((e) => e.account.id === u.id)?.balance ?? 0), f = Yf(l - d);
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
function Zf(e, t, n, r) {
	if (e.billDate > r || e.status === "VOID" && e.voidedAt && Qf(e.voidedAt) <= r) return {
		total: 0,
		amountPaid: 0,
		amountCredited: 0,
		amountDue: 0
	};
	let i = $f(t.reduce((t, n) => n.supplierId !== e.supplierId || n.paymentDate > r || n.status === "REVERSED" && n.reversedAt && Qf(n.reversedAt) <= r ? t : t + n.allocations.filter((t) => t.supplierBillId === e.id).reduce((e, t) => e + t.amount, 0), 0)), a = $f(n.reduce((t, n) => n.supplierBillId !== e.id || n.allocationDate > r || n.status === "REVERSED" && n.reversedAt && Qf(n.reversedAt) <= r ? t : t + n.amount, 0)), o = $f(e.totals.total);
	return {
		total: o,
		amountPaid: i,
		amountCredited: a,
		amountDue: $f(Math.max(0, o - i - a))
	};
}
function Qf(e) {
	return v(e);
}
function $f(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/supplierCreditBalanceAsAtService.ts
function ep(e, t, n) {
	if (e.creditDate > n || e.status === "VOID" && e.voidedAt && tp(e.voidedAt) <= n) return {
		total: 0,
		amountApplied: 0,
		amountAvailable: 0
	};
	let r = np(e.totals.total), i = np(t.reduce((t, r) => r.supplierCreditId !== e.id || r.allocationDate > n || r.status === "REVERSED" && r.reversedAt && tp(r.reversedAt) <= n ? t : t + r.amount, 0));
	return {
		total: r,
		amountApplied: i,
		amountAvailable: np(Math.max(0, r - (e.refundEvents ?? []).filter((e) => e.date <= n && (!e.reversalDate || e.reversalDate > n)).reduce((e, t) => e + t.amount, 0) - i))
	};
}
function tp(e) {
	return v(e);
}
function np(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
//#endregion
//#region src/features/purchases/data/accountsPayableService.ts
function rp(e, t, n = [], r = [], i = [], a = up()) {
	let o = op(), s = 0, c = 0, l = 0, u = 0, d = t.filter((t) => t.supplierId === e.id && t.billDate <= a);
	for (let e of d) {
		let t = Zf(e, n, i, a).amountDue;
		if (t <= 0) continue;
		s += t, l += 1;
		let r = ap(e.dueDate, a);
		if (r <= 0) {
			o.current += t;
			continue;
		}
		c += t, u += 1, r <= 30 ? o.days1To30 += t : r <= 60 ? o.days31To60 += t : r <= 90 ? o.days61To90 += t : o.days90Plus += t;
	}
	let f = lp(r.reduce((t, n) => n.supplierId === e.id ? t + ep(n, i, a).amountAvailable : t, 0)), p = lp(s), m = lp(p - f);
	return {
		supplierId: e.id,
		grossOutstanding: p,
		unallocatedCredit: f,
		totalOutstanding: m,
		overdueAmount: lp(c),
		aging: sp(o),
		outstandingBillCount: l,
		overdueBillCount: u
	};
}
function ip(e, t, n = [], r = [], i = [], a = up()) {
	let o = op(), s = 0, c = 0, l = 0, u = 0, d = 0, f = 0, p = 0, m = 0;
	for (let h of e) {
		let e = rp(h, t, n, r, i, a);
		(e.grossOutstanding !== 0 || e.unallocatedCredit !== 0) && (d += 1, s += e.grossOutstanding, c += e.unallocatedCredit, l += e.totalOutstanding, u += e.overdueAmount, p += e.outstandingBillCount, m += e.overdueBillCount, e.overdueAmount > 0 && (f += 1), o.current += e.aging.current, o.days1To30 += e.aging.days1To30, o.days31To60 += e.aging.days31To60, o.days61To90 += e.aging.days61To90, o.days90Plus += e.aging.days90Plus);
	}
	return {
		grossOutstanding: lp(s),
		unallocatedCredit: lp(c),
		totalOutstanding: lp(l),
		overdueAmount: lp(u),
		supplierCount: d,
		overdueSupplierCount: f,
		outstandingBillCount: p,
		overdueBillCount: m,
		aging: sp(o)
	};
}
function ap(e, t = up()) {
	let n = cp(e), r = cp(t);
	return Math.floor((r.getTime() - n.getTime()) / 864e5);
}
function op() {
	return {
		current: 0,
		days1To30: 0,
		days31To60: 0,
		days61To90: 0,
		days90Plus: 0
	};
}
function sp(e) {
	return {
		current: lp(e.current),
		days1To30: lp(e.days1To30),
		days31To60: lp(e.days31To60),
		days61To90: lp(e.days61To90),
		days90Plus: lp(e.days90Plus)
	};
}
function cp(e) {
	return /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
}
function lp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function up() {
	return v((/* @__PURE__ */ new Date()).toISOString());
}
//#endregion
//#region src/features/accounting/data/accountsPayableGlReconciliationService.ts
function dp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function fp({ suppliers: e, bills: t, payments: n, credits: r, creditAllocations: i, accounts: a, journalEntries: o, asOfDate: s }) {
	let c = ip(e, t, n, r, i, s), l = a.find((e) => e.systemRole === "ACCOUNTS_PAYABLE");
	if (!l) throw Error("Accounts Payable control account was not found.");
	let u = dp(Jf(a, o, s).accountBalances.find((e) => e.account.id === l.id)?.balance ?? 0), d = dp(c.totalOutstanding), f = dp(d - u);
	return {
		asOfDate: s,
		grossOutstanding: dp(c.grossOutstanding),
		unallocatedCredit: dp(c.unallocatedCredit),
		apSubledgerBalance: d,
		glAccountsPayableBalance: u,
		difference: f,
		reconciled: f === 0
	};
}
//#endregion
//#region src/features/inventory/data/inventoryValuationService.ts
function pp(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory valuation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00`);
	if (Number.isNaN(t.getTime())) throw Error("Inventory valuation date is invalid.");
}
function mp(e) {
	return e.slice(0, 10);
}
function hp(e, t) {
	let n = e.occurredAt.localeCompare(t.occurredAt);
	if (n !== 0) return n;
	let r = e.createdAt.localeCompare(t.createdAt);
	return r === 0 ? e.id.localeCompare(t.id) : r;
}
function gp(e, t) {
	pp(t);
	let n = e.filter((e) => mp(e.occurredAt) <= t).slice().sort(hp), r = /* @__PURE__ */ new Map();
	for (let e of n) {
		let t = `${e.siteId}:${e.productId}`, n = r.get(t) ?? {
			siteId: e.siteId,
			productId: e.productId,
			baseUnitId: e.baseUnitId,
			quantityOnHand: 0,
			inventoryValue: 0
		};
		if (n.baseUnitId !== e.baseUnitId) throw Error(`Inventory valuation base unit mismatch for product ${e.productId}.`);
		let i = W(n.quantityOnHand + e.quantityBase), a = Ko(n.inventoryValue + e.valueChange);
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
		let t = as.getById(e.siteId);
		if (!t) throw Error(`Inventory site ${e.siteId} was not found.`);
		let n = D(e.productId);
		if (!n) throw Error(`Inventory product ${e.productId} was not found.`);
		let r = n.units.find((t) => t.id === e.baseUnitId);
		if (!r) throw Error(`Base unit ${e.baseUnitId} was not found for ${n.sku}.`);
		let i = e.quantityOnHand === 0 ? 0 : Go(e.inventoryValue / e.quantityOnHand);
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
		totalQuantity: W(i.reduce((e, t) => e + t.quantityOnHand, 0)),
		totalInventoryValue: Ko(i.reduce((e, t) => e + t.inventoryValue, 0)),
		siteCount: new Set(i.map((e) => e.siteId)).size,
		productCount: new Set(i.map((e) => e.productId)).size
	};
}
//#endregion
//#region src/features/inventory/data/inventoryGlReconciliationService.ts
function _p(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function vp(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Inventory reconciliation date must use YYYY-MM-DD format.");
	let t = /* @__PURE__ */ new Date(`${e}T00:00:00Z`);
	if (Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== e) throw Error("Inventory reconciliation date is invalid.");
}
function yp({ accounts: e, journalEntries: t, costMovements: n, asOfDate: r }) {
	vp(r);
	let i = e.find((e) => e.systemRole === "INVENTORY");
	if (!i) throw Error("Inventory GL control account was not found.");
	if (i.type !== "ASSET") throw Error("Inventory GL control account must be an asset account.");
	let a = gp(n, r), o = _p(Jf(e, t, r).accountBalances.find((e) => e.account.id === i.id)?.balance ?? 0), s = _p(a.totalInventoryValue), c = _p(s - o);
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
var bp = (e) => Math.round((e + 2 ** -52) * 100) / 100, $ = t().trim().min(1).max(200), xp = o().finite().refine((e) => bp(e) === e, "Amounts must use cents precision"), Sp = u({
	accountId: $,
	debit: xp.nonnegative(),
	credit: xp.nonnegative()
}).strict(), Cp = u({
	contactId: $,
	reference: $,
	date: $,
	dueDate: $,
	amount: xp
}).strict(), wp = u({
	operationId: $,
	date: $,
	reason: t().trim().min(3).max(1e3),
	gl: l(Sp).min(2).max(5e3),
	ar: l(Cp).max(1e4),
	ap: l(Cp).max(1e4),
	banks: l(u({
		bankAccountId: $,
		amount: xp
	}).strict()).max(500),
	stock: l(u({
		siteId: $,
		productId: $,
		quantity: o().positive().finite(),
		unitCost: o().nonnegative().finite()
	}).strict()).max(1e4)
}).strict(), Tp = [], Ep = 0, Dp = /* @__PURE__ */ new Set(), Op = () => {
	Ep++, Dp.forEach((e) => e());
};
function kp() {
	return x();
}
function Ap(e) {
	m(e), aa(e.sales), _a(e.customerCredits), j.update("supplierBills", e.supplierBills.supplierBills), j.update("supplierCredits", e.supplierCredits.supplierCredits);
}
function jp(e, t) {
	if (new Set(e).size !== e.length) throw Error("Duplicate " + t + ".");
}
function Mp(e) {
	let t = wp.parse(e);
	if (b(t.date, "Cutover date"), Jn(t.date), L(), Tp.some((e) => e.status === "POSTED")) throw Error("An opening batch is already active. Reverse the unused batch before replacing it.");
	let n = kp();
	if (n.journals.journalEntries.some((e) => e.journalDate >= t.date)) throw Error("Cutover must be after all existing ledger activity. This import adds historical balances, never replaces existing transactions.");
	if (n.inventoryMovements.movements.some((e) => e.occurredAt.slice(0, 10) >= t.date)) throw Error("Cutover must be after existing inventory activity.");
	jp(t.gl.map((e) => e.accountId), "GL account"), jp(t.banks.map((e) => e.bankAccountId), "bank"), jp(t.stock.map((e) => e.siteId + ":" + e.productId), "site/product");
	let r = Xf({
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
	}), i = fp({
		suppliers: n.suppliers.suppliers,
		bills: n.supplierBills.supplierBills,
		payments: n.supplierPayments.supplierPayments,
		credits: n.supplierCredits.supplierCredits,
		creditAllocations: n.supplierCredits.allocations,
		accounts: n.accounts.accounts,
		journalEntries: n.journals.journalEntries,
		asOfDate: t.date
	}), a = yp({
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
	let o = N.getAll(), s = (e) => N.requireBySystemRole(e).id, c = (e) => bp(t.gl.filter((t) => t.accountId === e).reduce((e, t) => e + t.debit - t.credit, 0));
	for (let e of t.gl) {
		let t = N.requireById(e.accountId);
		if (!t.active || ![
			"ASSET",
			"LIABILITY",
			"EQUITY"
		].includes(t.type) || e.debit > 0 && e.credit > 0 || e.debit + e.credit <= 0) throw Error("Opening GL requires active balance-sheet accounts and one positive debit or credit per row.");
	}
	let l = bp(t.gl.reduce((e, t) => e + t.debit, 0)), u = bp(t.gl.reduce((e, t) => e + t.credit, 0));
	if (l !== u || !l) throw Error("Opening trial balance does not balance.");
	let d = bp(t.ar.reduce((e, t) => e + t.amount, 0)), f = bp(t.ap.reduce((e, t) => e + t.amount, 0));
	if (c(s("ACCOUNTS_RECEIVABLE")) !== d || c(s("ACCOUNTS_PAYABLE")) !== -f) throw Error("AR/AP detail must equal imported GL control balances. Negative detail creates an unused historical credit.");
	for (let [e, r] of [["ar", t.ar], ["ap", t.ap]]) {
		jp(r.map((e) => e.contactId + ":" + e.reference.toLowerCase()), e + " reference");
		for (let i of r) {
			if (b(i.date), b(i.dueDate), !i.amount || i.date > t.date || i.dueDate < i.date) throw Error("Invalid outstanding document amount/date.");
			if (!(e === "ar" ? n.customers.customers : n.suppliers.suppliers).some((e) => e.id === i.contactId)) throw Error("Opening contact not found.");
			if ((e === "ar" ? [...n.sales.invoices.map((e) => [e.customerId, e.documentNumber]), ...n.customerCredits.creditNotes.map((e) => [e.customerId, e.creditNoteNumber])] : [...n.supplierBills.supplierBills.map((e) => [e.supplierId, e.supplierInvoiceNumber]), ...n.supplierCredits.supplierCredits.map((e) => [e.supplierId, e.supplierCreditNumber])]).some(([e, t]) => e === i.contactId && t.toLowerCase() === i.reference.toLowerCase())) throw Error("Historical document reference already exists.");
		}
	}
	let p = 0;
	for (let e of t.stock) {
		let t = D(e.productId), n = as.getById(e.siteId);
		if (!t || t.status !== "ACTIVE" || t.itemType === "SERVICE" || n?.status !== "ACTIVE") throw Error("Opening stock requires active stocked products/sites.");
		if (Math.round(e.quantity * 1e4) / 1e4 !== e.quantity) throw Error("Stock quantities use at most four decimal places.");
		p = bp(p + bp(e.quantity * e.unitCost));
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
_("openingBalances", {
	repository: {
		preview(e) {
			let { input: t, debit: n, credit: r, ar: i, ap: a, inventory: o } = Mp(e);
			return {
				date: t.date,
				debit: n,
				credit: r,
				ar: i,
				ap: a,
				inventory: o,
				bank: bp(t.banks.reduce((e, t) => e + t.amount, 0)),
				documents: t.ar.length + t.ap.length
			};
		},
		post(e) {
			let t = wp.parse(e), n = JSON.stringify(t), r = Tp.find((e) => e.operationId === t.operationId);
			if (n.length > 5e7) throw Error("Opening import exceeds 50 MB.");
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID already used for different opening data.");
				return r;
			}
			let { input: i, s: a } = Mp(t), o = crypto.randomUUID(), s = (/* @__PURE__ */ new Date()).toISOString(), c = {
				id: o,
				operationId: i.operationId,
				fingerprint: n,
				date: i.date,
				reason: i.reason,
				status: "POSTED",
				actor: S.current()?.userId ?? "",
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
			}, l = (e) => N.requireBySystemRole(e).id, u = l("OWNERS_EQUITY"), d = 0, f = 0;
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
				let g = e === "ar" == t.amount > 0, ee = P.post({
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
			a.journals = kp().journals, Ap(a);
			let p = i.gl.filter((e) => ![l("ACCOUNTS_RECEIVABLE"), l("ACCOUNTS_PAYABLE")].includes(e.accountId));
			(d || f) && p.push({
				accountId: u,
				debit: bp(d),
				credit: bp(f)
			});
			let m = /* @__PURE__ */ new Map();
			for (let e of p) m.set(e.accountId, bp((m.get(e.accountId) ?? 0) + e.debit - e.credit));
			let h = [...m].filter(([, e]) => e !== 0).map(([e, t]) => ({
				accountId: e,
				debit: Math.max(0, t),
				credit: Math.max(0, -t)
			}));
			if (h.length) {
				let e = P.post({
					journalDate: i.date,
					description: "Opening trial balance " + i.reason,
					sourceType: "OPENING_BALANCE",
					sourceId: o,
					lines: h
				});
				c.journalIds.push(e.id);
			}
			for (let e of i.stock) {
				let t = D(e.productId), n = t.units.find((e) => e.id === t.baseUnitId), r = us.create({
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
				Ps.receive({
					siteId: e.siteId,
					productId: t.id,
					baseUnitId: t.baseUnitId,
					quantityBase: e.quantity
				});
				let a = Ds({
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
			return Tp = [...Tp, c], Op(), c;
		},
		reverse(e) {
			if (b(e.date), Jn(e.date), L(), !e.reason?.trim() || e.reason.trim().length < 3) throw Error("Reversal reason is required.");
			let t = Tp.find((t) => t.id === e.id);
			if (!t) throw Error("Opening batch not found.");
			if (t.status === "REVERSED") return t;
			if (e.date < t.date) throw Error("Reversal date precedes cutover.");
			let n = kp();
			if (n.journals.journalEntries.some((e) => !t.priorJournalIds.includes(e.id) && !t.journalIds.includes(e.id)) || n.inventoryMovements.movements.some((e) => !t.priorMovementIds.includes(e.id) && !t.movementIds.includes(e.id))) throw Error("Subsequent accounting or inventory activity exists. Reverse downstream activity before correcting opening balances.");
			let r = n.sales.invoices.filter((e) => t.invoiceIds.includes(e.id)), i = n.supplierBills.supplierBills.filter((e) => t.billIds.includes(e.id)), a = [...n.customerCredits.creditNotes.filter((e) => t.customerCreditIds.includes(e.id)), ...n.supplierCredits.supplierCredits.filter((e) => t.supplierCreditIds.includes(e.id))];
			if (r.some((e) => e.amountPaid !== 0 || e.amountDue !== e.totals.total) || i.some((e) => e.totals.amountPaid !== 0 || e.totals.amountCredited !== 0) || a.some((e) => e.amountApplied !== 0 || (e.amountRefunded ?? 0) !== 0)) throw Error("Opening balances have allocations or settlements. Reverse downstream allocations before correcting them.");
			for (let e of ["customerSettlements", "supplierRefunds"]) if (JSON.stringify(n[e]).includes(t.id)) throw Error("Opening balances have downstream settlements.");
			for (let e of t.journalIds) Sf(e);
			for (let n of t.journalIds) P.reverse({
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
			return n.stock.balances = t.priorStock, n.costBalances.balances = t.priorCost, n.journals = kp().journals, Ap(n), Tp = Tp.map((n) => n.id === t.id ? {
				...n,
				status: "REVERSED",
				reversalDate: e.date,
				reversalReason: e.reason
			} : n), Op(), Tp.find((e) => e.id === t.id);
		}
	},
	read: "accounting.read",
	commands: {
		preview: "accounting.post",
		post: "accounting.post",
		reverse: "accounting.post"
	},
	snapshot: () => ({ batches: Tp }),
	restore: (e) => {
		Tp = e.batches;
	},
	publish: Op,
	validate: (e, n) => {
		let r = u({ batches: l(u({
			id: $,
			operationId: $,
			date: $,
			status: s(["POSTED", "REVERSED"]),
			journalIds: l($),
			invoiceIds: l($),
			billIds: l($),
			customerCreditIds: l($),
			supplierCreditIds: l($),
			fingerprint: t().min(1).max(5e7),
			reason: t().min(3),
			actor: $,
			createdAt: $,
			movementIds: l($),
			costMovementIds: l($),
			priorJournalIds: l($),
			priorMovementIds: l($),
			priorStock: l(u({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: o().finite().nonnegative(),
				updatedAt: $
			}).strict()),
			priorCost: l(u({
				siteId: $,
				productId: $,
				baseUnitId: $,
				quantityOnHand: o().finite().nonnegative(),
				averageCostPerBaseUnit: o().finite().nonnegative(),
				inventoryValue: o().finite().nonnegative(),
				costingMethod: a("MOVING_WEIGHTED_AVERAGE"),
				updatedAt: $
			}).strict()),
			reversalDate: $.optional(),
			reversalReason: t().optional()
		}).strict()) }).strict().parse(e);
		for (let e of r.batches) {
			let t = wp.parse(JSON.parse(e.fingerprint));
			if (t.operationId !== e.operationId || t.date !== e.date) throw Error("Opening import identity is invalid.");
			if (e.status === "REVERSED" && !e.reversalDate) throw Error("Opening reversal date is missing.");
			e.reversalDate && b(e.reversalDate), b(e.date);
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
var Np = /* @__PURE__ */ new Set(), Pp = j.read().supplierPayments;
j.onRollback(() => {
	Pp = j.read().supplierPayments;
});
function Fp() {
	j.update("supplierPayments", Pp), Np.forEach((e) => j.notify(e));
}
var Ip = {
	subscribe(e) {
		return Np.add(e), () => {
			Np.delete(e);
		};
	},
	getSnapshot() {
		return Pp;
	},
	getAll() {
		return Pp;
	},
	getById(e) {
		return Pp.find((t) => t.id === e);
	},
	getBySupplier(e) {
		return Pp.filter((t) => t.supplierId === e);
	},
	getByBill(e) {
		return Pp.filter((t) => t.allocations.some((t) => t.supplierBillId === e));
	},
	create(e) {
		let t = e.operationId?.trim();
		if (e.operationId !== void 0 && !t) throw Error("Operation ID cannot be empty.");
		let n = JSON.stringify({
			supplierId: e.supplierId,
			paymentDate: e.paymentDate,
			method: e.method,
			bankAccountId: e.bankAccountId,
			reference: Rp(e.reference),
			notes: Rp(e.notes),
			allocations: e.allocations.filter((e) => e.amount !== 0).map((e) => ({
				supplierBillId: e.supplierBillId,
				amount: zp(e.amount)
			})).sort((e, t) => e.supplierBillId.localeCompare(t.supplierBillId))
		});
		if (t) {
			let e = Pp.find((e) => e.operationId === t);
			if (e) {
				if (e.requestFingerprint !== n) throw Error("Operation ID reused with different business data.");
				return e;
			}
		}
		if (b(e.paymentDate, "Payment date"), e.allocations.some((e) => !Number.isFinite(e.amount) || e.amount < 0)) throw Error("Payment allocations must be finite non-negative amounts.");
		let r = Xe.getById(e.supplierId);
		if (!r) throw Error("Supplier was not found.");
		if (!e.paymentDate) throw Error("Payment date is required.");
		if (!e.method) throw Error("Payment method is required.");
		if (!e.bankAccountId) throw Error("Bank account is required.");
		let i = bi.getById(e.bankAccountId);
		if (!i) throw Error("Bank account was not found.");
		if (!i.active) throw Error("The selected bank account is inactive.");
		let a = e.allocations.filter((e) => Number.isFinite(e.amount) && e.amount > 0);
		if (a.length === 0) throw Error("Allocate the payment to at least one supplier bill.");
		let o = /* @__PURE__ */ new Set(), s = a.map((t) => {
			if (o.has(t.supplierBillId)) throw Error("A supplier bill cannot appear more than once in the same payment.");
			o.add(t.supplierBillId);
			let n = sc.getById(t.supplierBillId);
			if (!n) throw Error("Supplier bill was not found.");
			if (n.supplierId !== r.id) throw Error("All payment allocations must belong to the selected supplier.");
			if (n.status === "VOID") throw Error(`${n.billNumber} is void and cannot receive a payment.`);
			if (n.status === "PAID" || n.totals.amountDue <= 0) throw Error(`${n.billNumber} is already fully paid.`);
			if (e.paymentDate < n.billDate) throw Error("Payment date cannot precede the supplier bill date.");
			if (e.paymentDate < i.openingBalanceDate) throw Error("Payment date cannot precede the bank opening balance date.");
			let a = zp(t.amount);
			if (a <= 0) throw Error("Payment allocation rounds to zero.");
			if (a > n.totals.amountDue) throw Error(`${n.billNumber} cannot be paid more than ${Bp(n.totals.amountDue)}.`);
			return {
				id: `supplier_payment_allocation_${crypto.randomUUID()}`,
				supplierBillId: n.id,
				billNumber: n.billNumber,
				supplierInvoiceNumber: n.supplierInvoiceNumber,
				amount: a
			};
		}), c = zp(s.reduce((e, t) => e + t.amount, 0));
		if (c <= 0) throw Error("Payment amount must be greater than zero.");
		for (let e of s) sc.applyPayment(e.supplierBillId, e.amount);
		let l = (/* @__PURE__ */ new Date()).toISOString(), u = {
			id: `supplier_payment_${crypto.randomUUID()}`,
			operationId: t,
			requestFingerprint: t ? n : void 0,
			paymentNumber: Lp(e.paymentDate),
			supplierId: r.id,
			supplierCode: r.code,
			supplierName: r.businessName,
			paymentDate: e.paymentDate,
			amount: c,
			method: e.method,
			bankAccountId: i.id,
			reference: Rp(e.reference),
			notes: Rp(e.notes),
			allocations: s,
			status: "POSTED",
			createdAt: l,
			updatedAt: l
		};
		return Pp = [u, ...Pp], Fp(), rs.postSupplierPayment(u), u;
	},
	reverse(e, t) {
		Ln("SUPPLIER_PAYMENT", e);
		let n = Pp.find((t) => t.id === e);
		if (!n) throw Error("Supplier payment was not found.");
		if (n.status === "REVERSED") throw Error("This supplier payment has already been reversed.");
		let r = t.trim();
		if (r.length < 3) throw Error("A reversal reason of at least 3 characters is required.");
		for (let e of n.allocations) {
			let t = sc.getById(e.supplierBillId);
			if (!t) throw Error(`${e.billNumber} was not found.`);
			if (t.status === "VOID") throw Error(`${e.billNumber} is void. The payment cannot be reversed.`);
			if (t.totals.amountPaid < e.amount) throw Error(`${e.billNumber} does not contain enough paid value to reverse this payment.`);
		}
		for (let e of n.allocations) sc.reversePayment(e.supplierBillId, e.amount);
		let i = (/* @__PURE__ */ new Date()).toISOString(), a = {
			...n,
			status: "REVERSED",
			reversedAt: i,
			reversalReason: r,
			updatedAt: i
		};
		return Pp = Pp.map((t) => t.id === e ? a : t), Fp(), rs.reverseSupplierPayment(a), a;
	}
};
function Lp(e) {
	let t = `SPAY-${e.slice(0, 4)}-`, n = Pp.filter((e) => e.paymentNumber.startsWith(t)).map((e) => Number.parseInt(e.paymentNumber.slice(t.length), 10)).filter(Number.isFinite), r = Math.max(0, ...n) + 1;
	return `${t}${String(r).padStart(4, "0")}`;
}
function Rp(e) {
	return e?.trim() || void 0;
}
function zp(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function Bp(e) {
	return new Intl.NumberFormat("en-AU", {
		style: "currency",
		currency: h().currency
	}).format(e);
}
var Vp = Ip.create;
Ip.create = function(...e) {
	return L(), j.transaction(() => Vp.apply(Ip, e));
};
var Hp = Ip.reverse;
Ip.reverse = function(...e) {
	return L(), j.transaction(() => Hp.apply(Ip, e));
}, _("supplierPayments", {
	repository: Ip,
	read: "purchases.read",
	commands: {
		create: "purchases.payment",
		reverse: "purchases.payment",
		return: null,
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({ supplierPayments: Pp }),
	restore: (e) => {
		Pp = e.supplierPayments;
	},
	publish: () => Np.forEach((e) => e())
});
//#endregion
//#region src/features/finance-closure/paymentBatchRepository.ts
var Up = (e) => Math.round((e + 2 ** -52) * 100) / 100, Wp = t().trim().min(1).max(200), Gp = u({
	operationId: Wp,
	paymentDate: Wp,
	bankAccountId: Wp,
	reference: t().max(500),
	allocations: l(u({
		supplierBillId: Wp,
		amount: o().finite().positive().refine((e) => Up(e) === e)
	}).strict()).min(1).max(500)
}).strict(), Kp = [], qp = 0, Jp = /* @__PURE__ */ new Set(), Yp = () => {
	qp++, Jp.forEach((e) => e());
}, Xp = () => {
	let e = S.current();
	if (!e) throw Error("A verified session is required.");
	return e.userId;
};
function Zp(e, t) {
	return {
		action: e,
		reason: t,
		actor: Xp(),
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function Qp(e) {
	let t = Kp.find((t) => t.id === e);
	if (!t) throw Error("Payment batch was not found.");
	return t;
}
function $p(e) {
	return Kp = Kp.map((t) => t.id === e.id ? e : t), Yp(), e;
}
function em(e) {
	b(e.paymentDate, "Payment date");
	let t = bi.requireById(e.bankAccountId);
	if (!t.active || e.paymentDate < t.openingBalanceDate) throw Error("Invalid paying bank account/date.");
	if (new Set(e.allocations.map((e) => e.supplierBillId)).size !== e.allocations.length) throw Error("Select each bill only once.");
	for (let t of e.allocations) {
		let n = sc.getById(t.supplierBillId);
		if (!n || n.status === "VOID" || t.amount > n.totals.amountDue || e.paymentDate < n.billDate) throw Error("A bill amount, date or outstanding balance changed. Review the batch.");
	}
}
_("paymentBatches", {
	repository: {
		create(e) {
			let t = Gp.parse(e), n = JSON.stringify(t), r = Kp.find((e) => e.operationId === t.operationId);
			if (r) {
				if (r.fingerprint !== n) throw Error("Operation ID was used with different batch data.");
				return r;
			}
			em(t);
			let i = {
				...t,
				id: crypto.randomUUID(),
				fingerprint: n,
				status: "DRAFT",
				createdBy: Xp(),
				paymentIds: [],
				history: [Zp("Created")]
			};
			return Kp = [...Kp, i], Yp(), i;
		},
		approve(e) {
			let t = Qp(e);
			if (t.status === "APPROVED") return t;
			if (t.status !== "DRAFT") throw Error("Only a draft batch can be approved.");
			return em(t), $p({
				...t,
				status: "APPROVED",
				approvedBy: Xp(),
				history: [...t.history, Zp("Approved")]
			});
		},
		post(e) {
			let t = Qp(e);
			if (t.status === "POSTED") return t;
			if (t.status !== "APPROVED") throw Error("Approve the batch before recording payments.");
			L(), em(t);
			let n = /* @__PURE__ */ new Map();
			for (let e of t.allocations) {
				let t = sc.getById(e.supplierBillId);
				n.set(t.supplierId, [...n.get(t.supplierId) ?? [], e]);
			}
			let r = [...n].map(([e, n]) => Ip.create({
				operationId: "batch:" + t.id + ":" + e,
				supplierId: e,
				paymentDate: t.paymentDate,
				bankAccountId: t.bankAccountId,
				reference: t.reference,
				method: "BANK_TRANSFER",
				allocations: n
			}));
			return $p({
				...t,
				status: "POSTED",
				paymentIds: r.map((e) => e.id),
				history: [...t.history, Zp("Payments recorded")]
			});
		},
		cancel(e) {
			let t = Qp(e.id);
			if (!["DRAFT", "APPROVED"].includes(t.status) || e.reason?.trim().length < 3) throw Error("Only an unposted batch can be cancelled, with a reason.");
			return $p({
				...t,
				status: "CANCELLED",
				history: [...t.history, Zp("Cancelled", e.reason)]
			});
		},
		reverse(e) {
			let t = Qp(e.id);
			if (t.status === "REVERSED") return t;
			if (t.status !== "POSTED" || e.reason?.trim().length < 3) throw Error("A posted batch and reversal reason are required.");
			L();
			for (let e of t.paymentIds) {
				let t = Ip.getById(e);
				if (!t || t.status !== "POSTED") throw Error("Batch payments changed. Inspect before reversing.");
				Ln("SUPPLIER_PAYMENT", e);
			}
			for (let n of t.paymentIds) Ip.reverse(n, e.reason);
			return $p({
				...t,
				status: "REVERSED",
				history: [...t.history, Zp("Reversed", e.reason)]
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
	snapshot: () => ({ batches: Kp }),
	restore: (e) => {
		Kp = e.batches;
	},
	validate: (e, n) => {
		let r = u({ batches: l(Gp.extend({
			id: Wp,
			fingerprint: t(),
			status: s([
				"DRAFT",
				"APPROVED",
				"POSTED",
				"REVERSED",
				"CANCELLED"
			]),
			createdBy: Wp,
			approvedBy: Wp.optional(),
			paymentIds: l(Wp),
			history: l(u({
				action: Wp,
				actor: Wp,
				at: Wp,
				reason: t().optional()
			}))
		})) }).strict().parse(e), i = n.supplierPayments.supplierPayments;
		for (let e of r.batches) {
			if (!["POSTED", "REVERSED"].includes(e.status)) continue;
			let t = e.paymentIds.map((e) => i.find((t) => t.id === e));
			if (!t.length || t.some((t) => !t || t.bankAccountId !== e.bankAccountId || t.status !== (e.status === "REVERSED" ? "REVERSED" : "POSTED")) || Up(t.reduce((e, t) => e + (t?.amount ?? 0), 0)) !== Up(e.allocations.reduce((e, t) => e + t.amount, 0))) throw Error("Batch payment relationships are invalid.");
			if (e.paymentIds.some((e) => !n.journals.journalEntries.some((t) => t.sourceType === "SUPPLIER_PAYMENT" && t.sourceId === e))) throw Error("A batch payment journal is missing.");
		}
	},
	publish: Yp
});
//#endregion
//#region src/features/finance-closure/bankStatementRepository.ts
var tm = (e) => Math.round((e + 2 ** -52) * 100) / 100, nm = t().min(1).max(200), rm = [], im = 0, am = /* @__PURE__ */ new Set(), om = () => {
	im++, am.forEach((e) => e());
};
function sm(e) {
	let t = bi.requireById(e);
	if (!t.active) throw Error("Select an active bank account.");
	return t;
}
function cm(e) {
	let t = rm.find((t) => t.id === e);
	if (!t) throw Error("Statement line was not found.");
	return t;
}
function lm(e) {
	if (e.status !== "UNMATCHED") throw Error("This line is already processed. Revert it before changing it.");
	let t = sf.getLatestByBankAccount(e.bankAccountId);
	if (t && e.date <= t.statementDate) throw Error("Statement date is already reconciled.");
}
function um(e) {
	return rm = rm.map((t) => t.id === e.id ? e : t), om(), e;
}
var dm = (e, t) => Uc(sm(e), P.getAll(), t).transactions, fm = u({
	date: nm,
	description: t().trim().min(1).max(1e3),
	amount: o().finite().refine((e) => e !== 0 && tm(e) === e, "Enter a non-zero amount in cents"),
	reference: t().max(500).default(""),
	externalId: t().max(200).default("")
}).strict(), pm = {
	importRows(e) {
		let t = u({
			bankAccountId: nm,
			rows: l(fm).min(1).max(1e4)
		}).strict().parse(e), n = sm(t.bankAccountId), r = 0, i = [...rm], a = [];
		for (let e of t.rows) {
			if (b(e.date, "Statement date"), e.date < n.openingBalanceDate) throw Error("Statement predates the bank opening date.");
			let t = JSON.stringify([n.id, e.externalId || [
				e.date,
				e.amount,
				e.description.trim().toLowerCase(),
				e.reference.trim().toLowerCase()
			]]), o = i.find((e) => e.key === t);
			if (o) {
				if (e.externalId && (o.amount !== e.amount || o.date !== e.date || o.description !== e.description || o.reference !== e.reference)) throw Error("Bank transaction ID conflicts with an existing row.");
				r++;
				continue;
			}
			let s = sf.getLatestByBankAccount(n.id);
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
			i.push(c), a.push(c);
		}
		return rm = i, om(), {
			created: a.length,
			duplicates: r
		};
	},
	importCsv(e) {
		if (typeof e.csv != "string" || e.csv.length > 1e7) throw Error("CSV exceeds the 10 MB limit.");
		let t = zt(e.csv.replace(/^\uFEFF/, "")), n = t.shift()?.map((e) => e.trim().toLowerCase()) ?? [];
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
		return pm.importRows({
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
					l = tm(t - e);
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
		return b(e.asOfDate, "As-of date"), dm(e.bankAccountId, e.asOfDate).filter((e) => e.journalStatus === "POSTED" && !rm.some((t) => t.ledgerIds.includes(e.id)));
	},
	match(e) {
		let t = cm(e.id);
		if (lm(t), !Array.isArray(e.ledgerIds) || !e.ledgerIds.length || new Set(e.ledgerIds).size !== e.ledgerIds.length) throw Error("Select unique ledger entries.");
		let n = pm.candidates({
			bankAccountId: t.bankAccountId,
			asOfDate: t.date
		}), r = e.ledgerIds.map((e) => n.find((t) => t.id === e));
		if (r.some((e) => !e) || tm(r.reduce((e, t) => e + t.moneyIn - t.moneyOut, 0)) !== t.amount) throw Error("Selected bank entries must match this signed statement amount exactly.");
		return um({
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
		let t = cm(e.id);
		return (y["bank-rules"] ?? []).filter((e) => e.status === "Active" && e.enabled !== "No").filter((e) => {
			let n = (e.field === "Reference" ? t.reference : e.field === "Description" ? t.description : "").toLowerCase(), r = e.value.toLowerCase();
			return e.operator === "Equals" ? n === r : e.operator === "Starts with" ? n.startsWith(r) : n.includes(r);
		});
	},
	post(e) {
		L();
		let t = cm(e.id), n = JSON.stringify(e.splits);
		if (t.status === "POSTED") {
			if (t.fingerprint !== n) throw Error("Line was already posted with different categorisation.");
			return t;
		}
		lm(t);
		let r = l(u({
			accountId: nm,
			amount: o().finite().positive().refine((e) => tm(e) === e),
			taxCode: nm
		}).strict()).min(1).max(100).parse(e.splits);
		if (tm(r.reduce((e, t) => e + t.amount, 0)) !== Math.abs(t.amount)) throw Error("Split amounts must equal the statement total.");
		let i = sm(t.bankAccountId), a = t.amount < 0, s = r.flatMap((e) => {
			let t = N.requireById(e.accountId);
			if (!t.active || !t.allowManualPosting || !["EXPENSE", "REVENUE"].includes(t.type)) throw Error("Use an active manual expense/revenue account. Payments against AR/AP must be matched to their source documents.");
			let n = ne(e.taxCode), r = tm(e.amount / (1 + n)), i = tm(e.amount - r);
			return [{
				accountId: t.id,
				debit: a ? r : 0,
				credit: a ? 0 : r
			}, ...i ? [{
				accountId: (a ? te(e.taxCode).taxPaidAccountId : te(e.taxCode).taxCollectedAccountId) || N.requireBySystemRole(a ? "GST_RECEIVABLE" : "GST_PAYABLE").id,
				debit: a ? i : 0,
				credit: a ? 0 : i
			}] : []];
		}), c = P.post({
			journalDate: t.date,
			description: t.description,
			reference: t.reference,
			sourceType: "BANK_STATEMENT",
			sourceId: t.id + ":" + t.history.filter((e) => e.action === "Posted").length,
			lines: [{
				accountId: i.glAccountId,
				debit: a ? 0 : t.amount,
				credit: a ? -t.amount : 0
			}, ...s]
		}), d = c.lines.filter((e) => e.accountId === i.glAccountId).map((e) => c.id + ":" + e.id);
		return um({
			...t,
			status: "POSTED",
			journalEntryId: c.id,
			ledgerIds: d,
			fingerprint: n,
			history: [...t.history, {
				action: "Posted",
				date: (/* @__PURE__ */ new Date()).toISOString()
			}]
		});
	},
	ignore(e) {
		let t = cm(e.id);
		if (lm(t), e.reason?.trim().length < 3) throw Error("Enter an exclusion reason.");
		return um({
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
		L();
		let t = cm(e.id);
		if (b(e.reversalDate, "Reversal date"), e.reason?.trim().length < 3 || e.reversalDate < t.date) throw Error("Enter a reason and a reversal date on or after the statement line.");
		if (t.status === "UNMATCHED") throw Error("Line is already unmatched.");
		for (let e of t.ledgerIds) Sf(e.split(":")[0]);
		let n = sf.getLatestByBankAccount(t.bankAccountId);
		if (n && t.date <= n.statementDate) throw Error("Reconciled statement lines cannot be reverted.");
		return t.status === "POSTED" && t.journalEntryId && P.reverse({
			journalEntryId: t.journalEntryId,
			reversalDate: e.reversalDate,
			reason: e.reason
		}), um({
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
		if (Jn(e.statementDate), L(), b(e.statementDate, "Statement date"), !rm.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate)) throw Error("Import the statement first.");
		if (rm.some((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate && t.status === "UNMATCHED")) throw Error("Process every statement line before completing reconciliation.");
		let t = rm.filter((t) => t.bankAccountId === e.bankAccountId && t.date <= e.statementDate).flatMap((e) => e.ledgerIds);
		return sf.complete({
			...e,
			clearedTransactionIds: [.../* @__PURE__ */ new Set([...sf.getClearedTransactionIds(e.bankAccountId), ...t])]
		});
	}
}, mm = u({
	id: nm,
	key: t(),
	bankAccountId: nm,
	date: nm,
	description: t(),
	reference: t(),
	amount: o().finite(),
	externalId: t(),
	status: s([
		"UNMATCHED",
		"MATCHED",
		"POSTED",
		"IGNORED"
	]),
	ledgerIds: l(nm),
	journalEntryId: t().optional(),
	fingerprint: t().optional(),
	history: l(u({
		action: t(),
		date: t(),
		reason: t().optional()
	}))
}).strict();
_("bankStatements", {
	repository: pm,
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
	snapshot: () => ({ lines: rm }),
	restore: (e) => {
		rm = e.lines;
	},
	validate: (e) => {
		l(mm).parse(e.lines);
	},
	publish: om
});
//#endregion
//#region src/lib/persistence/financialConsistencyAudit.ts
function hm(e) {
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
var gm = /* @__PURE__ */ new Set(), _m = j.read().transactions, vm = j.read().transfers;
j.onRollback(() => {
	let e = j.read();
	_m = e.transactions, vm = e.transfers;
});
function ym() {
	gm.forEach((e) => j.notify(e));
}
function bm(e, t) {
	let n = e.trim();
	if (!n) throw Error(`${t} is required.`);
	return n;
}
function xm(e) {
	return e?.trim() || void 0;
}
function Sm(e) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) throw Error("Date must use YYYY-MM-DD format.");
}
function Cm(e) {
	return Math.round((e + 2 ** -52) * 100) / 100;
}
function wm(e) {
	return `${e}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Tm(e, t, n) {
	return `${e}-${t.slice(0, 4)}-${String(n).padStart(4, "0")}`;
}
var Em = {
	subscribe(e) {
		return gm.add(e), () => {
			gm.delete(e);
		};
	},
	getTransactionsSnapshot() {
		return _m;
	},
	getTransfersSnapshot() {
		return vm;
	},
	getTransactions() {
		return _m;
	},
	getTransfers() {
		return vm;
	},
	createTransaction(e, t) {
		if (Sm(e.transactionDate), b(e.transactionDate, "Transaction date"), !["MONEY_IN", "MONEY_OUT"].includes(e.direction)) throw Error("Invalid bank transaction direction.");
		let n = Cm(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = bm(e.description, "Description"), i = bi.requireById(e.bankAccountId);
		if (!i.active) throw Error("The selected bank account is inactive.");
		if (e.transactionDate < i.openingBalanceDate) throw Error("Transaction date cannot precede the bank opening balance date.");
		let a = N.requireById(i.glAccountId);
		if (!a.active) throw Error("The selected bank GL account is inactive.");
		let o = N.requireById(e.offsetAccountId);
		if (!o.active) throw Error("The offset account is inactive.");
		if (!o.allowManualPosting) throw Error("The selected offset account does not allow manual posting.");
		if (o.id === a.id) throw Error("Bank and offset accounts must be different.");
		if (bi.getByGlAccountId(o.id)) throw Error("Use Bank Transfer when moving money between bank accounts.");
		let s = wm("banktxn"), c = Tm("BTXN", e.transactionDate, _m.length + 1), l = t?.trim();
		if (t !== void 0 && !l) throw Error("Operation ID cannot be empty");
		if (l) {
			let t = F.begin(l, "BANK_TRANSACTION", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = _m.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			l && F.bindResult(l, s);
			let t = P.post({
				journalDate: e.transactionDate,
				description: r,
				reference: xm(e.reference),
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
				reference: xm(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, d = [u, ..._m];
			if (j.update("transactions", d), _m = d, ym(), l) {
				let e = P.getBySource("BANK_TRANSACTION", s);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Bank GL posting could not be verified uniquely.");
			}
			return u;
		} catch (e) {
			if (l) try {
				F.flagForReview(l, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	},
	createTransfer(e, t) {
		Sm(e.transferDate), b(e.transferDate, "Transfer date");
		let n = Cm(e.amount);
		if (!Number.isFinite(n) || n <= 0) throw Error("Amount must be greater than zero.");
		let r = bm(e.description, "Description");
		if (e.fromBankAccountId === e.toBankAccountId) throw Error("Transfer bank accounts must be different.");
		let i = bi.requireById(e.fromBankAccountId), a = bi.requireById(e.toBankAccountId);
		if (!i.active || !a.active) throw Error("Both bank accounts must be active.");
		if (i.currency !== a.currency) throw Error("Bank transfers between different currencies are not supported yet.");
		if (e.transferDate < i.openingBalanceDate || e.transferDate < a.openingBalanceDate) throw Error("Transfer date cannot precede either bank opening balance date.");
		let o = N.requireById(i.glAccountId), s = N.requireById(a.glAccountId);
		if (!o.active || !s.active) throw Error("Both bank GL accounts must be active.");
		if (o.id === s.id) throw Error("Transfer bank accounts must use different GL accounts.");
		let c = wm("banktrf"), l = Tm("BTRF", e.transferDate, vm.length + 1), u = t?.trim();
		if (t !== void 0 && !u) throw Error("Operation ID cannot be empty");
		if (u) {
			let t = F.begin(u, "BANK_TRANSFER", JSON.stringify(e));
			if (t.status === "already_completed") {
				let e = vm.find((e) => e.id === t.operation.resultId);
				if (e) return e;
				throw Error("Completed bank operation is not available in memory; manual review required.");
			}
			if (t.status === "needs_review") throw Error("Bank operation requires manual review before retry.");
		}
		try {
			u && F.bindResult(u, c);
			let t = P.post({
				journalDate: e.transferDate,
				description: r,
				reference: xm(e.reference),
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
				reference: xm(e.reference),
				journalEntryId: t.id,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, f = [d, ...vm];
			if (j.update("transfers", f), vm = f, ym(), u) {
				let e = P.getBySource("BANK_TRANSFER", c);
				if (e.length !== 1 || e[0].id !== t.id) throw Error("Transfer GL posting could not be verified uniquely.");
			}
			return d;
		} catch (e) {
			if (u) try {
				F.flagForReview(u, "Bank operation outcome uncertain; inspect GL and bank records");
			} catch {}
			throw e;
		}
	}
}, Dm = Em.createTransaction;
Em.createTransaction = function(e, t) {
	L();
	let n;
	try {
		return n = j.transaction(() => Dm.call(Em, e, t)), t && F.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = F.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				F.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
};
var Om = Em.createTransfer;
Em.createTransfer = function(e, t) {
	L();
	let n;
	try {
		return n = j.transaction(() => Om.call(Em, e, t)), t && F.complete(t.trim(), n.id), n;
	} catch (e) {
		if (t) {
			let e = F.list().find((e) => e.operationId === t.trim());
			if (e && e.state !== "COMPLETED") try {
				F.flagForReview(e.operationId, "Bank commit could not be confirmed; inspect snapshot and GL before retry.");
			} catch {}
		}
		throw e;
	}
}, _("bankTransactions", {
	repository: Em,
	read: "banking.read",
	commands: {
		if: null,
		createTransaction: "banking.write",
		createTransfer: "banking.write",
		assertCurrentCrossModuleWriteSafe: null
	},
	snapshot: () => ({
		bankTransactions: _m,
		bankTransfers: vm
	}),
	restore: (e) => {
		_m = e.bankTransactions, vm = e.bankTransfers;
	},
	publish: () => gm.forEach((e) => e())
});
//#endregion
//#region src/lib/persistence/runFinancialConsistencyAudit.ts
function km() {
	return hm({
		transactions: Em.getTransactions(),
		transfers: Em.getTransfers(),
		payments: to.getAll(),
		journals: P.getAll(),
		invoices: H.getAll().filter((e) => e.type === "INVOICE"),
		creditNotes: R.getAll(),
		supplierBills: sc.getAll(),
		supplierPayments: Ip.getAll(),
		supplierCredits: J.getAll()
	});
}
//#endregion
//#region electron/security/periodCloseChecks.ts
function Am(e) {
	let t = x(), n = [], r = (e, t) => n.push({
		code: e,
		message: t
	});
	e.endDate >= v((/* @__PURE__ */ new Date()).toISOString()) && r("PERIOD_NOT_ENDED", "The entire period must have ended before closing.");
	for (let e of F.getUnresolved()) r("UNRESOLVED_OPERATION", `Resolve financial operation ${e.operationId}.`);
	for (let e of t.purchaseOperations) e.status !== "POSTED" && r("UNRESOLVED_PURCHASE", `Resolve purchase posting ${e.key}.`);
	for (let e of km()) r(e.code, `${e.entityId}: ${e.message}`);
	let i = {
		accounts: t.accounts.accounts,
		journalEntries: t.journals.journalEntries,
		asOfDate: e.endDate
	}, a = [
		["AR", () => Xf({
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
		["AP", () => fp({
			...i,
			suppliers: t.suppliers.suppliers,
			bills: t.supplierBills.supplierBills,
			payments: t.supplierPayments.supplierPayments,
			credits: t.supplierCredits.supplierCredits,
			creditAllocations: t.supplierCredits.allocations
		})],
		["INVENTORY", () => yp({
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
var jm = null, Mm = {
	configureTrustedSession(e) {
		jm = e;
	},
	clear() {
		jm = null;
	},
	current() {
		return jm?.() ?? null;
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
}, Nm = "htt.purchasePosting.manualRecoveryAudit.v1";
function Pm() {
	try {
		if (typeof localStorage > "u") return [];
		let e = JSON.parse(localStorage.getItem(Nm) ?? "[]");
		return Array.isArray(e) ? e.filter((e) => e && typeof e.operationKey == "string" && typeof e.actorId == "string" && typeof e.timestamp == "string" && (e.outcome === "SUCCESS" || e.outcome === "ERROR")) : [];
	} catch {
		return [];
	}
}
var Fm = Pm();
function Im(e) {
	Fm.push(e);
	try {
		typeof localStorage < "u" && localStorage.setItem(Nm, JSON.stringify(Fm));
	} catch {}
}
_("purchaseRecovery", {
	repository: {
		getAuditEvents() {
			return Fm.map((e) => ({ ...e }));
		},
		canRecover(e) {
			let t = I.get(e);
			return Mm.canRecover() && t?.status === "RECOVERY_REQUIRED" && I.hasRecoveryHandler(e);
		},
		recover(e) {
			let t = Mm.requireRecoveryPermission(), n = I.get(e);
			if (!n) throw Error("Posting operation not found.");
			if (n.status !== "RECOVERY_REQUIRED") throw Error("Only RECOVERY_REQUIRED operations may be manually recovered.");
			if (!I.hasRecoveryHandler(e)) throw Error("No process-local recovery handler. Manual reconciliation required.");
			try {
				I.recover(e), Im({
					operationKey: e,
					actorId: t.userId,
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					outcome: "SUCCESS"
				});
			} catch (n) {
				throw Im({
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
	snapshot: () => Fm,
	restore: (e) => {
		Fm.splice(0, Fm.length, ...e);
	},
	publish: () => {}
});
//#endregion
//#region src/features/accounting/data/salesAccountingBootstrap.ts
var Lm = !1;
function Rm() {
	if (Lm || (Lm = !0, j.wasRestoredOnLoad())) return;
	let e = H.getAll().filter((e) => e.type === "INVOICE");
	for (let t of e) lo.postInvoice(t), t.status === "VOID" && lo.reverseInvoice(t);
	let t = to.getAll();
	for (let e of t) lo.postPayment(e), e.status === "REVERSED" && lo.reversePayment(e);
	let n = R.getAll();
	for (let e of n) e.status !== "DRAFT" && (lo.postCreditNote(e), e.status === "VOID" && lo.reverseCreditNote(e));
}
//#endregion
//#region src/features/accounting/data/purchasesAccountingBootstrap.ts
function zm() {
	let e = km().filter((e) => e.message.includes("SUPPLIER_") || e.message.includes("Supplier payment"));
	e.length && console.error("Restored AP posting issues require review", e);
}
//#endregion
//#region src/features/sales/data/salesManualReviewService.ts
var Bm = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Vm(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = oe("business.command", {
			repository: "salesRecovery",
			method: "recordSalesManualReview",
			args: [e]
		});
		return se(t.view), t.result;
	}
	if (!e.businessRecordChecked || !e.originalGlChecked || !e.reversalGlChecked || !e.balancesChecked) throw Error("Business, original/reversal GL and balances must all be inspected.");
	let t = F.list().find((t) => t.operationId === e.operationId);
	if (!t || !Bm.has(t.kind)) throw Error("Sales operation not found.");
	if (t.state === "COMPLETED") throw Error("Completed operation cannot be reviewed again.");
	return F.recordManualReview(e.operationId, e.reference, e.operator, e.summary);
}
//#endregion
//#region src/features/sales/data/salesConsistencyAudit.ts
var Hm = (e) => Math.round(e * 100);
function Um(e) {
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
		let i = e.payments.filter((e) => e.invoiceId === t.id && e.status === "RECEIVED"), a = e.allocations.filter((e) => e.invoiceId === t.id && e.status === "APPLIED"), o = i.reduce((e, t) => e + Hm(t.amount), 0), s = a.reduce((e, t) => e + Hm(t.amount), 0);
		t.status === "VOID" ? (i.length || a.length) && n("VOID_INVOICE_HAS_SETTLEMENT", t.id, "Voided invoice has active payments or allocations") : (Hm(t.amountPaid) !== o && n("INVOICE_PAID_MISMATCH", t.id, "Invoice amountPaid differs from received payments"), Hm(t.amountDue) !== Math.max(0, Hm(t.totals.total) - o - s) && n("INVOICE_DUE_MISMATCH", t.id, "Invoice amountDue differs from payments and applied credits"), o + s > Hm(t.totals.total) && n("INVOICE_OVERALLOCATED", t.id, "Payments and credits exceed invoice total"));
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
		let a = e.allocations.filter((e) => e.creditNoteId === t.id && e.status === "APPLIED").reduce((e, t) => e + Hm(t.amount), 0);
		Hm(t.amountApplied) !== a && n("CREDIT_APPLIED_MISMATCH", t.id, "Credit note amountApplied differs from allocations"), (t.status === "VOID" ? a !== 0 || Hm(t.amountAvailable) !== 0 : Hm(t.amountAvailable) !== Hm(t.totals.total) - a - Hm(t.amountRefunded ?? 0)) && n("CREDIT_AVAILABLE_MISMATCH", t.id, "Credit note amountAvailable is inconsistent");
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
var Wm = {
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
function Gm(e) {
	return Um(e).map((e) => ({
		...e,
		action: Wm[e.code] ?? "Suspend affected financial operations and inspect source documents, linked records and journal history before manual recovery.",
		automaticRepairAllowed: !1
	}));
}
//#endregion
//#region src/features/sales/data/salesRestartRecoveryService.ts
var Km = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function qm(e, t) {
	let n = Gm(e).map((e) => ({ ...e })), r = t.filter((e) => Km.has(e.kind) && e.state !== "COMPLETED"), i = new Set(e.invoices.map((e) => e.id)), a = new Set(e.payments.map((e) => e.id)), o = new Set(e.allocations.map((e) => e.id));
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
	for (let e of t.filter((e) => Km.has(e.kind))) s.has(e.operationId) && n.push({
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
function Jm() {
	let e = H.getAll();
	return qm({
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: to.getAll(),
		creditNotes: R.getAll(),
		allocations: R.getAllAllocations(),
		journals: P.getAll()
	}, F.list());
}
//#endregion
//#region src/features/sales/data/salesVerifiedRecoveryClosure.ts
var Ym = /* @__PURE__ */ new Set([
	"CUSTOMER_PAYMENT",
	"SALES_INVOICE_VOID",
	"SALES_CREDIT_APPLY",
	"SALES_CREDIT_REVERSAL",
	"SALES_PAYMENT_REVERSAL"
]);
function Xm(e, t, n) {
	let r = [], i = t.filter((e) => e.operationId === n);
	if (i.length !== 1) return ["Operation identity is missing or duplicated."];
	let a = i[0];
	if ((!Ym.has(a.kind) || a.state !== "MANUAL_REVIEW") && r.push("Operation is not an unresolved Sales review."), a.resultId || r.push("Operation has no durable bound result; cannot infer effects."), a.reviewHistory?.length || r.push("Operator reconciliation evidence is missing."), r.length) return r;
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
	let l = qm(e, t).findings.filter((e) => e.severity === "BLOCK" && (e.operationId !== n || e.code !== "SALES_OPERATION_UNRESOLVED" && e.code !== "SALES_OPERATION_RESULT_UNVERIFIED"));
	return l.length && r.push(`Other financial inconsistencies remain: ${l.map((e) => e.code).join(", ")}.`), r;
}
function Zm() {
	let e = H.getAll();
	return {
		quotes: e.filter((e) => e.type === "QUOTE"),
		salesOrders: e.filter((e) => e.type === "SALES_ORDER"),
		invoices: e.filter((e) => e.type === "INVOICE"),
		payments: to.getAll(),
		creditNotes: R.getAll(),
		allocations: R.getAllAllocations(),
		journals: P.getAll()
	};
}
function Qm(e) {
	if (globalThis.__HTT_MAIN_HOST__ !== !0) {
		let t = oe("business.command", {
			repository: "salesRecovery",
			method: "closeVerifiedSalesReview",
			args: [e]
		});
		return se(t.view), t.result;
	}
	let t = F.list(), n = Xm(Zm(), t, e.operationId);
	if (n.length) throw Error(`Sales recovery remains blocked: ${n.join(" ")}`);
	let r = t.find((t) => t.operationId === e.operationId);
	return {
		closed: F.closeReviewed(e.operationId, r.resultId, e.approvalReference, e.approver),
		remaining: Jm()
	};
}
//#endregion
//#region electron/security/businessEngine.ts
_("salesRecovery", {
	repository: {
		recordSalesManualReview: Vm,
		closeVerifiedSalesReview: Qm
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
var $m = x();
function eh(e) {
	Un(Am, () => e()?.userId ?? ""), S.connect(e), Mm.configureTrustedSession(e), Rm(), zm();
}
//#endregion
export { Jn as assertPostingPeriod, eh as initialize, $m as workspaceDefaults };
