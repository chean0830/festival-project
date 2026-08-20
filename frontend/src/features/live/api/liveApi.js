let csrfToken
let csrfHeaderName = 'X-XSRF-TOKEN'

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message ?? '라이브 요청 처리 중 오류가 발생했습니다.')
  }
  return data
}

async function ensureCsrfToken() {
  if (csrfToken) return

  const response = await fetch('/api/auth/csrf', { credentials: 'include' })
  const data = await parseResponse(response)
  csrfToken = data.token
  csrfHeaderName = data.headerName
}

async function changeLiveStream(path, method, body) {
  await ensureCsrfToken()
  const response = await fetch(path, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrfHeaderName]: csrfToken,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return parseResponse(response)
}

export async function fetchLiveStreams() {
  return parseResponse(await fetch('/api/live-streams', { credentials: 'include' }))
}

export async function fetchMyLiveStreams() {
  return parseResponse(await fetch('/api/live-streams/mine', { credentials: 'include' }))
}

export async function fetchLiveEvents() {
  return parseResponse(await fetch('/api/live-streams/events', { credentials: 'include' }))
}

export async function fetchLiveStream(streamId) {
  return parseResponse(await fetch(`/api/live-streams/watch/${streamId}`, { credentials: 'include' }))
}

export async function fetchYouTubeStatus() {
  return parseResponse(await fetch('/api/youtube/status', { credentials: 'include' }))
}

export function createLiveStream(data) {
  return changeLiveStream('/api/live-streams', 'POST', data)
}

export function createYouTubeBroadcast({ title, description }) {
  return changeLiveStream('/api/youtube/broadcasts', 'POST', { title, description })
}

export function startLiveStream(streamId) {
  return changeLiveStream(`/api/live-streams/${streamId}/start`, 'PATCH')
}

export function endLiveStream(streamId) {
  return changeLiveStream(`/api/live-streams/${streamId}/end`, 'PATCH')
}
