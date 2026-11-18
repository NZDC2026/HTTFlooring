// Local dev scripts select Mock authentication; dev:api and production use backend login.
// Neither network failures nor rejected credentials can select this mode.
export const authMode = import.meta.env.MODE === 'mock' ? 'mock' : 'api';
export const authDevtoolsEnabled = import.meta.env.DEV;
