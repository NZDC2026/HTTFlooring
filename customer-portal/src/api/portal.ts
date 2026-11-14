// Verified interface metadata only. Transport and state live outside api/.
export const portalApi = {
  login: { path: '/api/portal/v1/auth/login', method: 'POST' },
  logout: { path: '/api/portal/v1/auth/logout', method: 'POST' },
  me: { path: '/api/portal/v1/me', method: 'GET' },
  branches: { path: '/api/portal/v1/branches', method: 'GET' },
} as const;
