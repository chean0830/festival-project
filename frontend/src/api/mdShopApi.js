// profileApi.js와 동일한 방식(vite dev 서버의 /api 프록시 + 세션 쿠키)을 사용한다.
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

async function postAction(path) {
  await ensureCsrfToken()
  return fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { [csrfHeaderName]: csrfToken },
  }).then(handleResponse)
}

export function fetchPreorderProducts(eventId) {
  const query = eventId == null ? '' : `?eventId=${encodeURIComponent(eventId)}`
  return getJson(`/api/md/products${query}`)
}

export function fetchProduct(productId) {
  return getJson(`/api/md/products/${productId}`)
}

export async function createMdOrder(memberId, payload) {
  await ensureCsrfToken()
  return fetch(`/api/members/${memberId}/md/orders`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrfHeaderName]: csrfToken,
    },
    body: JSON.stringify(payload),
  }).then(handleResponse)
}

export function fetchMyMdOrders(memberId) {
  return getJson(`/api/members/${memberId}/md/orders`)
}

export function fetchMdOrder(memberId, orderId) {
  return getJson(`/api/members/${memberId}/md/orders/${orderId}`)
}

export async function confirmMdOrderPayment(memberId, orderId, { paymentKey, orderId: tossOrderId, amount }) {
  await ensureCsrfToken()
  return fetch(`/api/members/${memberId}/md/orders/${orderId}/payments/confirm`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrfHeaderName]: csrfToken,
    },
    body: JSON.stringify({ paymentKey, orderId: tossOrderId, amount }),
  }).then(handleResponse)
}

export function cancelMdOrder(memberId, orderId) {
  return postAction(`/api/members/${memberId}/md/orders/${orderId}/cancel`)
}
