import { useSyncExternalStore } from "react";
export type Profile = { businessName: string; abn: string; businessType: string; website: string; firstName: string; lastName: string; email: string; mobile: string; phone: string; address: string; suburb: string; state: string; postcode: string; region: "Melbourne" | "Sydney" };
export const defaultProfile: Profile = { businessName: "ABC Flooring Pty Ltd", abn: "51 824 753 556", businessType: "Flooring Retailer", website: "", firstName: "John", lastName: "Smith", email: "john@abcflooring.com.au", mobile: "0412 345 678", phone: "", address: "", suburb: "Melbourne", state: "Victoria", postcode: "3000", region: "Melbourne" };
export const DEMO_PASSWORD = "Flooring123!";
export const DEMO_RECOVERY = "HTT-DEMO-RECOVERY";
const ACCOUNT = "htt.local.account.v1", SESSION = "htt.local.session.v1", APPLICATION = "htt.local.application.v1";
type Account = { profile: Profile; salt: string; passwordHash: string; recoveryHash: string };
export type Application = { id: string; submittedAt: string; status: "Pending review"; profile: Profile };
function read<T>(storage: Storage, key: string): T | null { try { return JSON.parse(storage.getItem(key) ?? "null"); } catch { return null; } }
const listeners = new Set<() => void>();
let revision = 0;
function notify() { revision++; listeners.forEach(listener => listener()); }
if (typeof window !== "undefined") {
 window.addEventListener("storage", notify);
 window.addEventListener("focus", notify);
 window.setInterval(notify, 60000);
}
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function account() { const value = read<Account>(localStorage, ACCOUNT); return value?.profile?.email && value.salt && value.passwordHash ? value : null; }
function session() { const value = read<{ email: string; expires: number }>(sessionStorage, SESSION) ?? read<{ email: string; expires: number }>(localStorage, SESSION); return value && value.expires > Date.now() && value.email === account()?.profile.email ? value : null; }
export function useLocalAccount() { useSyncExternalStore(subscribe, () => revision); const current = account(); return { profile: current?.profile ?? defaultProfile, authenticated: !!session() }; }
async function hash(value: string, salt: string) {
 const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(value), "PBKDF2", false, ["deriveBits"]);
 const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 100000, hash: "SHA-256" }, key, 256);
 return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, "0")).join("");
}
async function ensureAccount() { const stored = account(); if (stored) return stored; const salt = crypto.randomUUID(); const created: Account = { profile: defaultProfile, salt, passwordHash: await hash(DEMO_PASSWORD, salt), recoveryHash: await hash(DEMO_RECOVERY, salt) }; localStorage.setItem(ACCOUNT, JSON.stringify(created)); return created; }
export async function login(email: string, password: string, remember: boolean) {
 const current = await ensureAccount();
 if (email.trim().toLowerCase() !== current.profile.email.toLowerCase() || await hash(password, current.salt) !== current.passwordHash) throw new Error("Email or password is incorrect.");
 const value = JSON.stringify({ email: current.profile.email, expires: Date.now() + (remember ? 30 : 1) * 86400000 });
 localStorage.removeItem(SESSION); sessionStorage.removeItem(SESSION);
 (remember ? localStorage : sessionStorage).setItem(SESSION, value); notify();
}
export function logout() { localStorage.removeItem(SESSION); sessionStorage.removeItem(SESSION); notify(); }
export function updateProfile(profile: Profile) {
 const current = account(); if (!current || !session()) throw new Error("Please log in again.");
 const updated = { ...profile, email: current.profile.email, region: current.profile.region };
 localStorage.setItem(ACCOUNT, JSON.stringify({ ...current, profile: updated })); notify();
}
export function validatePassword(password: string) { if (password.length < 10 || !/[a-z]/i.test(password) || !/\d/.test(password)) throw new Error("Use at least 10 characters, including a letter and a number."); }
export async function changePassword(oldPassword: string, password: string) {
 const current = account(); if (!current || !session()) throw new Error("Please log in again.");
 if (await hash(oldPassword, current.salt) !== current.passwordHash) throw new Error("Current password is incorrect.");
 validatePassword(password); localStorage.setItem(ACCOUNT, JSON.stringify({ ...current, passwordHash: await hash(password, current.salt) })); logout();
}
export async function resetPassword(email: string, recovery: string, password: string) {
 const current = await ensureAccount();
 if (email.trim().toLowerCase() !== current.profile.email.toLowerCase() || await hash(recovery.trim(), current.salt) !== current.recoveryHash) throw new Error("Email or recovery code is incorrect.");
 validatePassword(password); localStorage.setItem(ACCOUNT, JSON.stringify({ ...current, passwordHash: await hash(password, current.salt) })); logout();
}
export function validABN(input: string) { const digits = input.replace(/\s/g, ""); if (!/^\d{11}$/.test(digits)) return false; const weights = [10,1,3,5,7,9,11,13,15,17,19]; return digits.split("").reduce((sum, digit, index) => sum + (Number(digit) - (index === 0 ? 1 : 0)) * weights[index], 0) % 89 === 0; }
export function submitApplication(profile: Profile) {
 for (const field of ["businessName","firstName","lastName","email","mobile","address","suburb","state","postcode"] as const) if (!profile[field]?.trim()) throw new Error("Complete all required fields.");
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) throw new Error("Enter a valid email address.");
 if (profile.region !== "Melbourne" && profile.region !== "Sydney") throw new Error("Select a region.");
 if (!validABN(profile.abn)) throw new Error("Enter a valid 11-digit Australian ABN.");
 if (!/^\d{4}$/.test(profile.postcode)) throw new Error("Enter a four-digit postcode.");
 if (!/^[+\d ()-]{8,20}$/.test(profile.mobile)) throw new Error("Enter a valid contact mobile number.");
 const saved = read<Application | Application[]>(localStorage, APPLICATION);
 const applications = Array.isArray(saved) ? saved : saved ? [saved] : [];
 const previous = applications.find(application=>application.profile.email.toLowerCase()===profile.email.toLowerCase());
 if (previous) throw new Error(`An application for this email is already saved (${previous.id}).`);
 const now = new Date();
 const application: Application = { id: `APP-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}-${crypto.randomUUID().slice(0,8).toUpperCase()}`, submittedAt: now.toISOString(), status: "Pending review", profile };
 localStorage.setItem(APPLICATION, JSON.stringify([...applications,application])); return application;
}
export function getApplication() { const saved=read<Application | Application[]>(localStorage, APPLICATION);return Array.isArray(saved) ? saved.at(-1) : saved; }
