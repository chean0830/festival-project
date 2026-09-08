let csrfToken
let csrfHeaderName = 'X-XSRF-TOKEN'

async function ensureCsrfToken() {
  if (csrfToken) {
    return
  }

  const response = await fetch('/api/auth/csrf', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.')
  }

  const data = await response.json()
  csrfToken = data.token
  csrfHeaderName = data.headerName
}

async function authRequest(path, body) {
  await ensureCsrfToken()

  const response = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrfHeaderName]: csrfToken,
    },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message ?? '요청 처리 중 오류가 발생했습니다.')
  }

  return data
}

export function signup({
  email,
  phoneNumber,
  postalCode,
  roadAddress,
  detailAddress,
  nickname,
  password,
}) {
  return authRequest('/api/auth/signup', {
    email,
    phoneNumber,
    postalCode,
    roadAddress,
    detailAddress,
    nickname,
    password,
  })
}

export function login({ email, password }) {
  return authRequest('/api/auth/login', { email, password })
}

export async function logout() {
  const result = await authRequest('/api/auth/logout', {})
  if (result.message?.includes('OBS')) {
    window.alert(result.message)
  }
  return result
}

export function findEmail({ nickname, phoneNumber }) {
  return authRequest('/api/auth/find-email', { nickname, phoneNumber })
}

export function requestPasswordReset(email) {
  return authRequest('/api/auth/password-reset/request', { email })
}

export function confirmPasswordReset({ token, password }) {
  return authRequest('/api/auth/password-reset/confirm', { token, password })
}

export async function getCurrentMember() {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
  })

  if (!response.ok) {
    return null
  }
  return response.json()
}
