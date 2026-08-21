// authApi.js와 동일한 방식(vite dev 서버의 /api 프록시 + 세션 쿠키)을 사용한다.
// CSRF 토큰 캐시는 여기서 별도로 들고 있음 (authApi.js 내부 상태를 export하지 않아서 중복 유지).
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

async function mutateJson(path, method, body) {
  await ensureCsrfToken()
  return fetch(path, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrfHeaderName]: csrfToken,
    },
    body: JSON.stringify(body),
  }).then(handleResponse)
}

export function fetchProfile(memberId) {
  return getJson(`/api/members/${memberId}/profile`)
}

export function updateNickname(memberId, nickname) {
  return mutateJson(`/api/members/${memberId}/profile/nickname`, 'PATCH', { nickname })
}

export function updateIntroduction(memberId, introduction) {
  return mutateJson(`/api/members/${memberId}/profile/introduction`, 'PATCH', { introduction })
}

export async function uploadProfileImage(memberId, file) {
  await ensureCsrfToken()
  const formData = new FormData()
  formData.append('file', file)
  return fetch(`/api/members/${memberId}/profile/image`, {
    method: 'POST',
    credentials: 'include',
    headers: { [csrfHeaderName]: csrfToken },
    body: formData,
  }).then(handleResponse)
}

export async function deleteProfileImage(memberId) {
  await ensureCsrfToken()
  return fetch(`/api/members/${memberId}/profile/image`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { [csrfHeaderName]: csrfToken },
  }).then(handleResponse)
}

export function fetchInterestedArtists(memberId) {
  return getJson(`/api/members/${memberId}/interests/artists`)
}

export function fetchInterestedEvents(memberId) {
  return getJson(`/api/members/${memberId}/interests/events`)
}

export function fetchInterestedEventStatus(memberId, eventId) {
  return getJson(`/api/members/${memberId}/interests/events/${eventId}`)
}

export async function addInterestedEvent(memberId, eventId) {
  await ensureCsrfToken()
  return fetch(`/api/members/${memberId}/interests/events/${eventId}`, {
    method: 'POST',
    credentials: 'include',
    headers: { [csrfHeaderName]: csrfToken },
  }).then(handleResponse)
}

export async function removeInterestedArtist(memberId, artistId) {
  await ensureCsrfToken()
  return fetch(`/api/members/${memberId}/interests/artists/${artistId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { [csrfHeaderName]: csrfToken },
  }).then(handleResponse)
}

export async function removeInterestedEvent(memberId, eventId) {
  await ensureCsrfToken()
  return fetch(`/api/members/${memberId}/interests/events/${eventId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { [csrfHeaderName]: csrfToken },
  }).then(handleResponse)
}

export function fetchAttendedEvents(memberId) {
  return getJson(`/api/members/${memberId}/events/attended`)
}

export async function addAttendedEvent(memberId, eventId) {
  await ensureCsrfToken()
  return fetch(`/api/members/${memberId}/events/attended/${eventId}`, {
    method: 'POST',
    credentials: 'include',
    headers: { [csrfHeaderName]: csrfToken },
  }).then(handleResponse)
}

export function fetchUpcomingEvents(memberId) {
  return getJson(`/api/members/${memberId}/events/upcoming`)
}

export async function addUpcomingEvent(memberId, eventId) {
  await ensureCsrfToken()
  return fetch(`/api/members/${memberId}/events/upcoming/${eventId}`, {
    method: 'POST',
    credentials: 'include',
    headers: { [csrfHeaderName]: csrfToken },
  }).then(handleResponse)
}

export function fetchMyBadges(memberId) {
  return getJson(`/api/members/${memberId}/badges`)
}

export function fetchProfileStats(memberId) {
  return getJson(`/api/members/${memberId}/stats`)
}

export function resolveImageUrl(path) {
  return path || null
}
