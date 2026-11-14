// Mock authentication is explicit and separate from the default backend login.
// Neither network failures nor rejected credentials can select this mode.
export const authMode = import.meta.env.MODE === 'mock' ? 'mock' : 'api';
