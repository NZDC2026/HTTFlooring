import { portalApi } from '../api/portal';
import type { Branches, Context, Identity, LoginResult } from '../types/portal';
import { ApiError, request } from '../lib/request';
import { singleFlight } from '../lib/singleFlight';
import { authStore } from '../state/authStore';

let token: string | null = null; // Private memory only; never exposed to state/debugging tools.
let boundContext: Context | null = null;
let loginEmail = '';
let generation = 0;
let logoutPending = false;
export const RESTORE_BLOCKED = 'Persistent login is unavailable: the backend has no session recovery, refresh cookie or CSRF contract yet. Retry after the backend is updated, or log in with your password.';
function clear(error = '') { generation++; token = null; boundContext = null; loginEmail = ''; authStore.clear('unauthenticated', error); }
function assertCurrent(current: number) { if (current !== generation) throw new Error('Session operation superseded.'); }
function fixedContext(contexts: Context[]) {
  if (!Array.isArray(contexts) || !contexts.length || contexts.some(c => !c.companyId || !c.customerId || !c.grantId)
    || new Set(contexts.map(c => c.companyId)).size !== 1 || new Set(contexts.map(c => c.customerId)).size !== 1) {
    throw new Error('A single authorized company and customer are required. Contact your administrator.');
  }
  return contexts[0];
}
async function account(accessToken: string, current: number, email: string, previous: Context | null = null) {
  const me = await request<Identity>(portalApi.me, { token: accessToken });
  assertCurrent(current);
  const context = fixedContext(me.contexts);
  if (previous && (context.companyId !== previous.companyId || context.customerId !== previous.customerId)) throw new Error('Account ownership changed. Please log in again.');
  const groups = await Promise.all(me.contexts.map(c => request<Branches>(portalApi.branches, { token: accessToken, context: c }).then(group => {
    if (group.customerId !== c.customerId || group.grantId !== c.grantId || !Array.isArray(group.items)) throw new Error('Invalid authorized branch response.');
    return group;
  })));
  assertCurrent(current);
  const branches = Array.from(new Map(groups.flatMap(g => g.items).map(b => [b.id, b])).values());
  if (!branches.length) throw new Error('No authorized active branches. Contact your administrator.');
  boundContext = context;
  authStore.set({ status: 'authenticated', context, branches, email, error: '' });
}
// Blocked until a real recovery contract exists. No invented URL or local substitute.
export const restoreSession = singleFlight(async (): Promise<void> => {
  if (token) return refreshAccount();
  const current = generation;
  authStore.clear('initializing');
  await Promise.resolve();
  if (current === generation) authStore.clear('service-error', RESTORE_BLOCKED);
});
export const login = singleFlight(async (email: string, password: string) => {
  if (logoutPending) throw new Error('Please wait for logout to finish.');
  if (token) throw new Error('Log out before changing accounts.');
  clear(); const current = generation;
  authStore.clear('initializing');
  let issued: string | null = null;
  try {
    const result = await request<LoginResult>(portalApi.login, { body: { email, password } });
    issued = result.accessToken;
    assertCurrent(current);
    if (!issued || result.tokenType !== 'Bearer' || !Number.isFinite(result.expiresIn) || result.expiresIn <= 0) throw new Error('Invalid authentication response.');
    token = issued;
    loginEmail = email;
    await account(issued, current, email);
  } catch (error) {
    if (current === generation && issued && token && error instanceof ApiError && (error.status === 0 || error.status >= 500)) {
      authStore.clear('service-error', error.message);
      throw error;
    }
    if (current === generation) {
      clear();
      if (error instanceof ApiError && (error.status === 0 || error.status >= 500)) authStore.clear('service-error', error.message);
    }
    if (issued) await request(portalApi.logout, { token: issued }).catch(() => {
      if (current + 1 === generation) authStore.clear('service-error', '本地已退出，服务器撤销未确认');
    });
    throw error;
  }
});
export const refreshAccount = singleFlight(async (): Promise<void> => {
  const current = generation, accessToken = token;
  // Logout may occur between scheduling and executing a verification. Never re-enter recovery.
  if (!accessToken) return;
  try { await account(accessToken, current, loginEmail, boundContext); }
  catch (error) {
    if (current !== generation) return;
    if (error instanceof ApiError && error.status === 401) clear(error.message);
    else if (error instanceof ApiError) authStore.clear('service-error', error.message);
    else clear(error instanceof Error ? error.message : 'Account verification failed.');
    throw error;
  }
});
export const logout = singleFlight(async () => {
  const accessToken = token;
  clear(); const current = generation;
  logoutPending = true;
  broadcastLogout();
  try {
    if (!accessToken) throw new Error('No server session available to revoke.');
    await request(portalApi.logout, { token: accessToken });
  } catch {
    if (current === generation) authStore.clear('unauthenticated', '本地已退出，服务器撤销未确认');
    throw new Error('本地已退出，服务器撤销未确认');
  } finally { logoutPending = false; }
});
const LOGOUT_EVENT = 'htt.portal.logout.v1';
let channel: BroadcastChannel | undefined;
function broadcastLogout() {
  channel?.postMessage({ type: 'logout' });
  try { localStorage.setItem(LOGOUT_EVENT, crypto.randomUUID()); localStorage.removeItem(LOGOUT_EVENT); } catch { /* Storage-independent authentication. */ }
}
export function startSessionLifecycle() {
  try { for (const key of ['htt.local.account.v1', 'htt.local.session.v1']) { localStorage.removeItem(key); sessionStorage.removeItem(key); } } catch { /* Never trust legacy cache. */ }
  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(LOGOUT_EVENT);
    channel.onmessage = event => { if (event.data?.type === 'logout') clear('Logged out in another tab.'); };
  }
  const onStorage = (event: StorageEvent) => { if (event.key === LOGOUT_EVENT && event.newValue) clear('Logged out in another tab.'); };
  const verify = () => { if (token && authStore.getSnapshot().status === 'authenticated') void refreshAccount().catch(() => { }); };
  window.addEventListener('storage', onStorage); window.addEventListener('focus', verify);
  const interval = window.setInterval(verify, 30000);
  void restoreSession().catch(() => { });
  return () => { channel?.close(); channel = undefined; window.removeEventListener('storage', onStorage); window.removeEventListener('focus', verify); window.clearInterval(interval); };
}
