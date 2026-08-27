let csrfToken
let csrfHeaderName = 'X-XSRF-TOKEN'

async function ensureCsrfToken() {
  if (csrfToken) return
  const response = await fetch('/api/auth/csrf', { credentials: 'include' })
  if (!response.ok) throw new Error('요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.')
  const data = await response.json()
  csrfToken = data.token
  csrfHeaderName = data.headerName
}

async function handleResponse(response) {
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.message || data?.error || '후원 처리 중 오류가 발생했습니다.')
  }
  return data
}

async function postJson(path, payload) {
  await ensureCsrfToken()
  return fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrfHeaderName]: csrfToken,
    },
    body: JSON.stringify(payload),
  }).then(handleResponse)
}

export function createLiveDonation(streamId, payload) {
  return postJson(`/api/live-streams/${streamId}/donations`, payload)
}

export function confirmLiveDonation(donationId, { paymentKey, orderId, amount }) {
  return postJson(`/api/live-streams/donations/${donationId}/payments/confirm`, {
    paymentKey,
    orderId,
    amount,
  })
}
