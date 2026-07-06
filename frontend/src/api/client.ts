/**
 * Shared fetch client.
 *
 * - Prefixes VITE_API_URL (empty in dev — Vite proxy handles routing).
 * - Always sends credentials: "include" (httpOnly cookies).
 * - 401 interceptor: on any 401 (except on the refresh call itself), calls
 *   POST /auth/refresh once, then retries. If the refresh also 401s, emits
 *   an "auth:expired" CustomEvent so AuthContext can redirect to Login.
 */

const BASE = import.meta.env.VITE_API_URL ?? ''

let refreshing: Promise<boolean> | null = null

async function doRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    return res.ok
  } catch {
    return false
  }
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  _isRetry = false,
): Promise<Response> {
  const url = `${BASE}${path}`
  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  // If 401 and this is NOT a retry (and not the refresh endpoint itself), try refresh once.
  if (res.status === 401 && !_isRetry && !path.startsWith('/auth/refresh')) {
    // Deduplicate: if multiple calls 401 simultaneously, only one refresh fires.
    if (!refreshing) {
      refreshing = doRefresh().finally(() => {
        refreshing = null
      })
    }
    const refreshed = await refreshing
    if (refreshed) {
      // Retry original request.
      return apiFetch(path, init, true)
    } else {
      // Refresh failed — signal auth expired.
      window.dispatchEvent(new CustomEvent('auth:expired'))
      return res
    }
  }

  return res
}

/** Convenience: parse JSON or throw with the backend's detail string. */
export async function apiJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await apiFetch(path, init)
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json() as { detail?: string }
      if (body.detail) detail = body.detail
    } catch { /* ignore */ }
    throw new ApiError(res.status, detail)
  }
  return res.json() as Promise<T>
}

export class ApiError extends Error {
  readonly status: number
  constructor(
    status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
