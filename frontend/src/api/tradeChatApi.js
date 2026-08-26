// usedTradeApi.js와 동일한 방식(vite dev 서버의 /api 프록시 + 세션 쿠키 + CSRF)을 사용한다.
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

async function postJson(path, body) {
  await ensureCsrfToken()
  return fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', [csrfHeaderName]: csrfToken },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(handleResponse)
}

export function getOrCreateTradeChatRoom(memberId, transactionId) {
  return postJson(`/api/members/${memberId}/trade-chat/transactions/${transactionId}/room`)
}

export function fetchTradeChatRoom(memberId, roomId) {
  return getJson(`/api/members/${memberId}/trade-chat/rooms/${roomId}`)
}

export function fetchTradeChatMessages(memberId, roomId) {
  return getJson(`/api/members/${memberId}/trade-chat/rooms/${roomId}/messages`)
}

export function enterTradeChatRoom(memberId, roomId) {
  return postJson(`/api/members/${memberId}/trade-chat/rooms/${roomId}/enter`)
}

export function exitTradeChatRoom(memberId, roomId) {
  return postJson(`/api/members/${memberId}/trade-chat/rooms/${roomId}/exit`)
}

export function blockTradeChatCounterpart(memberId, roomId) {
  return postJson(`/api/members/${memberId}/trade-chat/rooms/${roomId}/block`)
}

export function unblockTradeChatCounterpart(memberId, roomId) {
  return postJson(`/api/members/${memberId}/trade-chat/rooms/${roomId}/unblock`)
}

export async function uploadTradeChatImage(memberId, file) {
  await ensureCsrfToken()
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch(`/api/members/${memberId}/trade-chat/image`, {
    method: 'POST',
    credentials: 'include',
    headers: { [csrfHeaderName]: csrfToken },
    body: formData,
  })
  return handleResponse(response)
}

export function fetchTradeChatUnreadCounts(memberId) {
  return getJson(`/api/members/${memberId}/trade-chat/unread-counts`)
}

export function reportTradeChatMessage(memberId, messageId, reason) {
  return postJson(`/api/members/${memberId}/reports`, { targetType: 'MESSAGE', targetId: messageId, reason })
}

export function reportTradeChatUser(memberId, targetMemberId, reason) {
  return postJson(`/api/members/${memberId}/reports`, { targetType: 'USER', targetId: targetMemberId, reason })
}

export function reportTradeChatListing(memberId, listingId, reason) {
  return postJson(`/api/members/${memberId}/reports`, { targetType: 'LISTING', targetId: listingId, reason })
}
