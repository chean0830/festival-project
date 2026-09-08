let csrfToken
let csrfHeaderName = 'X-XSRF-TOKEN'

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message ?? '방송 입장권 결제를 처리하지 못했습니다.')
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

export async function confirmLiveAdmission(streamId, { paymentKey, orderId, amount }) {
  await ensureCsrfToken()
  return parseResponse(await fetch(`/api/live-streams/${streamId}/admission/payments/confirm`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrfHeaderName]: csrfToken,
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  }))
}
