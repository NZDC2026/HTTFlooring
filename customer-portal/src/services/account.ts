import { useSyncExternalStore } from 'react';
import * as mockAccount from '../data/localAccount';
import type { Profile } from '../data/localAccount';
import { authMode } from '../config/auth';
import { portalApi } from '../api/portal';
import type { LoginResult } from '../types/portal';
import { request } from '../lib/request';
import { singleFlight } from '../lib/singleFlight';
import { clearAccessToken, getAccessToken, setAccessToken } from '../lib/accessToken';
import { accessTokenStore } from '../state/accessTokenStore';

export { defaultProfile, DEMO_PASSWORD, DEMO_RECOVERY, validABN, validatePassword, submitApplication, getApplication } from '../data/localAccount';
export type { Profile, Application } from '../data/localAccount';

let generation = 0;
const subscribe = accessTokenStore.subscribe;
const getSnapshot = () => {
  const { accessToken, expiresAt } = accessTokenStore.getState();
  return accessToken !== null && expiresAt !== null && expiresAt > Date.now();
};
if (typeof window !== 'undefined') {
  window.addEventListener('focus', getAccessToken);
  window.setInterval(getAccessToken, 60000);
}

// Preserve the Mock profile projection; only the selected authentication provider decides login state.
export function useLocalAccount() {
  const preview = mockAccount.useLocalAccount();
  const authenticated = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return authMode === 'mock' ? preview : { ...preview, authenticated };
}

export const login = singleFlight(async (email: string, password: string, remember: boolean) => {
  const current = ++generation;
  if (authMode === 'mock') {
    await mockAccount.login(email, password, remember);
    if (current !== generation) { mockAccount.logout(); throw new Error('Login was superseded.'); }
    return;
  }
  clearAccessToken();
  const result = await request<LoginResult>(portalApi.login, { body: { email, password } });
  if (current !== generation) throw new Error('Login was superseded.');
  if (!result.accessToken || result.tokenType !== 'Bearer' || !Number.isFinite(result.expiresIn) || result.expiresIn <= 0) throw new Error('Invalid login response.');
  // Remember me cannot extend the real server session. No token/credentials enter storage or snapshots.
  setAccessToken(result.accessToken, result.expiresIn);
});

export function logout() {
  generation++; clearAccessToken();
  if (authMode === 'mock') mockAccount.logout();
}
export function updateProfile(profile: Profile) {
  if (authMode !== 'mock') throw new Error('Contact editing is only available in Mock mode; backend contact editing is not connected.');
  mockAccount.updateProfile(profile);
}
export async function changePassword(current: string, next: string) {
  if (authMode !== 'mock') throw new Error('This local password action is only available in Mock mode; it does not change your backend password.');
  await mockAccount.changePassword(current, next);
}
export async function resetPassword(email: string, recovery: string, password: string) {
  if (authMode !== 'mock') throw new Error('This local password action is only available in Mock mode; backend password recovery is not connected.');
  await mockAccount.resetPassword(email, recovery, password);
}
