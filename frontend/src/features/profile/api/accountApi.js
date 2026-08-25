let csrfToken
let csrfHeaderName = 'X-XSRF-TOKEN'

async function ensureCsrfToken() {
  if (csrfToken) return
  const response = await fetch('/api/auth/csrf', { credentials: 'include' })
  if (!response.ok) throw new Error('요청을 처리할 수 없습니다.')
  const data = await response.json()
  csrfToken = data.token
  csrfHeaderName = data.headerName
}

async function request(path, options = {}) {
  if (options.method && options.method !== 'GET') await ensureCsrfToken()
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.method && options.method !== 'GET' ? { [csrfHeaderName]: csrfToken } : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message ?? '요청 처리 중 오류가 발생했습니다.')
  return data
}

export const fetchAccount = () => request('/api/account')
export const updateAccount = (body) => request('/api/account', { method: 'PATCH', body: JSON.stringify(body) })
export const changeAccountPassword = (body) => request('/api/account/password', { method: 'PATCH', body: JSON.stringify(body) })
export const withdrawAccount = (currentPassword) => request('/api/account', { method: 'DELETE', body: JSON.stringify({ currentPassword }) })
