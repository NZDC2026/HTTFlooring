import { createStore } from 'zustand/vanilla';
import { devtools } from 'zustand/middleware';
import { authDevtoolsEnabled } from '../config/auth';

type AuthDebugState = {
  hasAccessToken: boolean;
  accessToken: string | null;
  expiresAt: number | null;
};
type AuthDebugAction = 'auth/accessTokenSet' | 'auth/accessTokenCleared' | 'auth/accessTokenExpired';

// Development-only diagnostic snapshot. Tokens are intentionally visible here;
// DevTools time travel still cannot modify the live authentication store.
const debugStore = createStore<AuthDebugState>()(devtools(() => ({
  hasAccessToken: false, accessToken: null, expiresAt: null,
}), { name: 'customer-portal/auth', enabled: authDevtoolsEnabled }));

export function publishAuthDebug(accessToken: string | null, expiresAt: number | null, action: AuthDebugAction) {
  if (!authDevtoolsEnabled) return;
  debugStore.setState({ hasAccessToken: accessToken !== null, accessToken, expiresAt }, true, action);
}
