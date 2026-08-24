// authApi.js / profileApi.js와 동일한 방식(vite dev 서버의 /api 프록시 + 세션 쿠키)을 사용한다.
// CSRF 토큰 캐시는 여기서 별도로 들고 있음 (다른 feature의 내부 상태를 export하지 않아서 중복 유지).
let csrfToken
let csrfHeaderName = 'X-XSRF-TOKEN'

async function ensureCsrfToken() {
  if (csrfToken) {
    return
  }
  const response = await fetch('/api/auth/csrf', { credentials: 'include' })
  if (!response.ok) {
    throw new Error('요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.')
  }
  const data = await response.json()
  csrfToken = data.token
  csrfHeaderName = data.headerName
}

async function handleResponse(response) {
  if (response.status === 204) {
    return null
  }
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = data?.message || data?.error || '요청 처리 중 오류가 발생했습니다.'
    throw new Error(message)
  }
  return data
}

function getJson(path) {
  return fetch(path, { credentials: 'include' }).then(handleResponse)
}

async function patchJson(path) {
  await ensureCsrfToken()
  return fetch(path, {
    method: 'PATCH',
    credentials: 'include',
    headers: { [csrfHeaderName]: csrfToken },
  }).then(handleResponse)
}

export function fetchNotifications(memberId) {
  return getJson(`/api/members/${memberId}/notifications`)
}

export function fetchUnreadCount(memberId) {
  return getJson(`/api/members/${memberId}/notifications/unread-count`)
}

export async function markNotificationAsRead(memberId, notificationId) {
  const result = await patchJson(`/api/members/${memberId}/notifications/${notificationId}/read`)
  window.dispatchEvent(new Event('notifications:read'))
  return result
}
