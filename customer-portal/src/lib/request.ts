import type { Context } from '../types/portal';
type Endpoint = { path: string; method: 'GET' | 'POST' };
type RequestOptions = { body?: unknown; token?: string | null; context?: Context | null; signal?: AbortSignal };
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string) {
    super(status === 401 ? 'Authentication failed or session expired. Please log in again.'
      : status === 403 ? 'Access denied. Contact your administrator.'
      : status === 429 ? 'Too many attempts. Please try again later.'
      : status === 0 || status >= 500 ? 'Service unavailable. Please retry.' : `Request failed (${status}).`);
    this.status = status; this.code = code;
  }
}
// Scoped same-origin Bearer APIs. Current backend has no cookie/CSRF/refresh contract.
// Never replay POSTs or guess refresh eligibility: expired/revoked share one 401 code.
export async function request<T>(endpoint: Endpoint, options: RequestOptions = {}): Promise<T> {
  if (!endpoint.path.startsWith('/api/portal/v1/') || endpoint.path.includes('..') || endpoint.path.includes('?')) throw new Error('Unsupported API endpoint.');
  const headers = new Headers({ Accept: 'application/json' });
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`);
  if (options.context) {
    headers.set('X-Company-Id', options.context.companyId);
    headers.set('X-Portal-Grant-Id', options.context.grantId);
  }
  let response: Response;
  try {
    response = await fetch(endpoint.path, {
      method: endpoint.method, headers, body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: 'omit', cache: 'no-store', signal: options.signal ?? AbortSignal.timeout(10000),
    });
  } catch { throw new ApiError(0, 'NETWORK_ERROR'); }
  if (!response.ok) {
    let code = 'REQUEST_FAILED';
    try { const data = await response.json(); if (typeof data.code === 'string') code = data.code; } catch { /* No raw response in UI/logs. */ }
    throw new ApiError(response.status, code);
  }
  if (response.status === 204) return undefined as T;
  try { return await response.json() as T; } catch { throw new ApiError(502, 'INVALID_RESPONSE'); }
}
