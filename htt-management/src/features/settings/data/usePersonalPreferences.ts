import { useSyncExternalStore } from 'react';
import { personalPreferenceStore, defaultPreferences } from './personalPreferences';
export function usePersonalPreferences(userId: string) {
    const store = personalPreferenceStore();
    return useSyncExternalStore(store.subscribe, () => store.get(userId), () => defaultPreferences);
}
