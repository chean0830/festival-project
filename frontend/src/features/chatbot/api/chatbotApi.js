let csrfToken
let csrfHeaderName = 'X-XSRF-TOKEN'

async function ensureCsrfToken() {
  if (csrfToken) return
  const response = await fetch('/api/auth/csrf', { credentials: 'include' })
  if (!response.ok) {
    throw new Error('요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.')
  }
  const data = await response.json()
  csrfToken = data.token
  csrfHeaderName = data.headerName
}

export async function fetchGreeting() {
  const response = await fetch('/api/chatbot/greeting', { credentials: 'include' })
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? '챗봇을 불러오지 못했습니다.')
  }
  return response.json()
}

export async function sendChatMessage(message) {
  await ensureCsrfToken()
  const response = await fetch('/api/chatbot/messages', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrfHeaderName]: csrfToken,
    },
    body: JSON.stringify({ message }),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? '답변을 받아오지 못했습니다.')
  }
  return response.json()
}