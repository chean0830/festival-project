const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

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

export function fetchProfile(memberId) {
  return fetch(`${API_BASE_URL}/api/members/${memberId}/profile`).then(handleResponse)
}

export function updateNickname(memberId, nickname) {
  return fetch(`${API_BASE_URL}/api/members/${memberId}/profile/nickname`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname }),
  }).then(handleResponse)
}

export function updateIntroduction(memberId, introduction) {
  return fetch(`${API_BASE_URL}/api/members/${memberId}/profile/introduction`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ introduction }),
  }).then(handleResponse)
}

export function uploadProfileImage(memberId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return fetch(`${API_BASE_URL}/api/members/${memberId}/profile/image`, {
    method: 'POST',
    body: formData,
  }).then(handleResponse)
}

export function deleteProfileImage(memberId) {
  return fetch(`${API_BASE_URL}/api/members/${memberId}/profile/image`, {
    method: 'DELETE',
  }).then(handleResponse)
}

export function fetchInterestedArtists(memberId) {
  return fetch(`${API_BASE_URL}/api/members/${memberId}/interests/artists`).then(handleResponse)
}

export function fetchInterestedEvents(memberId) {
  return fetch(`${API_BASE_URL}/api/members/${memberId}/interests/events`).then(handleResponse)
}

export function fetchAttendedEvents(memberId) {
  return fetch(`${API_BASE_URL}/api/members/${memberId}/events/attended`).then(handleResponse)
}

export function fetchUpcomingEvents(memberId) {
  return fetch(`${API_BASE_URL}/api/members/${memberId}/events/upcoming`).then(handleResponse)
}

export function fetchMyBadges(memberId) {
  return fetch(`${API_BASE_URL}/api/members/${memberId}/badges`).then(handleResponse)
}

export function fetchProfileStats(memberId) {
  return fetch(`${API_BASE_URL}/api/members/${memberId}/stats`).then(handleResponse)
}

export function resolveImageUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_BASE_URL}${path}`
}
