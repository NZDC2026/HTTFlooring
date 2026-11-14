import type { Branch, Context } from '../types/portal';
import { createStore } from 'zustand/vanilla';
export type AuthState = {
  status: 'initializing' | 'authenticated' | 'unauthenticated' | 'service-error';
  context: Context | null; branches: Branch[]; email: string; error: string;
};
const empty = (): AuthState => ({ status: 'unauthenticated', context: null, branches: [], email: '', error: '' });
const store = createStore<AuthState>(() => ({ ...empty(), status: 'initializing' }));
// Zustand vanilla store consumed through React's external-store API.
// No persistence/devtools middleware; tokens/passwords are absent from all snapshots.
export const authStore = {
  getSnapshot: store.getState,
  subscribe: store.subscribe,
  set(next: AuthState) { store.setState(next, true); },
  clear(status: AuthState['status'] = 'unauthenticated', error = '') { authStore.set({ ...empty(), status, error }); },
};
