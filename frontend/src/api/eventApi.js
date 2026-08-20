export async function getUpcomingEvents() {
  const response = await fetch('/api/home/events')

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? '공연 목록을 불러오지 못했습니다.')
  }

  return response.json()
}
