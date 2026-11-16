import { createStore } from 'zustand/vanilla';
import { authDevtoolsEnabled } from '../config/auth';
import { publishAuthDebug } from './authDebugStore';

type AccessTokenState = {
  accessToken: string | null;
  expiresAt: number | null;
  setAccessToken: (token: string, expiresIn: number) => void;
  clearAccessToken: () => void;
};

// Memory-only Zustand store. Do not attach persist, devtools or logging middleware.
export const accessTokenStore = createStore<AccessTokenState>((set) => ({
  accessToken: null,
  expiresAt: null,
  setAccessToken(token, expiresIn) {
    if (typeof token !== 'string' || !token || !Number.isFinite(expiresIn) || expiresIn <= 0) {
      throw new Error('Invalid access token response.');
    }
    set({ accessToken: token, expiresAt: Date.now() + expiresIn * 1000 });
  },
  clearAccessToken() { set({ accessToken: null, expiresAt: null }); },
}));

if (authDevtoolsEnabled) {
  accessTokenStore.subscribe((state, previous) => {
    const action = state.accessToken !== null ? 'auth/accessTokenSet'
      : previous.expiresAt !== null && previous.expiresAt <= Date.now() ? 'auth/accessTokenExpired'
      : 'auth/accessTokenCleared';
    publishAuthDebug(state.accessToken, state.expiresAt, action);
  });
}
