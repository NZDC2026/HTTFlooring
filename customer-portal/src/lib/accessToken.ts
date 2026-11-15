import { accessTokenStore } from '../state/accessTokenStore';

export function setAccessToken(token: string, expiresIn: number) {
  accessTokenStore.getState().setAccessToken(token, expiresIn);
}

export function getAccessToken(): string | null {
  const state = accessTokenStore.getState();
  if (state.expiresAt !== null && state.expiresAt <= Date.now()) {
    state.clearAccessToken();
    return null;
  }
  return state.accessToken;
}

export function clearAccessToken() { accessTokenStore.getState().clearAccessToken(); }
